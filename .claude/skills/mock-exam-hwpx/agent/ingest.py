#!/usr/bin/env python3
"""ZIP 한 개를 받아 안의 파일을 분류하고 텍스트를 뽑는다.

  python3 ingest.py <자료.zip> <작업폴더>

작업폴더 아래에
  raw/          압축을 푼 원본 (한글 파일명은 cp949 로 복원)
  text/NN.txt   파일마다 뽑은 텍스트 (스캔본은 없음)
  pages/NN/     스캔 PDF·사진을 쪽 그림으로 (Claude 가 직접 읽는다)
  manifest.json 파일 목록 · 분류 · 텍스트 경로
가 생긴다. 분류(role)는 셋 중 하나가 아니면 unknown:
  exam      기출 시험지          scope   시험범위 자료(교과서 본문·대화문·어휘)
  worksheet 학교 학습지·프린트   notes   출제 성향·특징·지침 메모
"""
import sys as _sys, os as _os
_v = _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), 'vendor')     # 동봉 라이브러리(python-hwpx·olefile) — pip 이 안 되는 환경용
if _os.path.isdir(_v) and _v not in _sys.path:
    _sys.path.append(_v)

import json, os, re, struct, sys, zipfile, zlib
from pathlib import Path

TEXT_EXT = {'.txt', '.md'}
EXAM_HINT = re.compile(r'기출|시험지|중간고사|기말고사|고사|exam', re.I)
SCOPE_HINT = re.compile(r'교과서|본문|대화문|어휘|단어|범위|lesson|unit', re.I)
WS_HINT = re.compile(r'학습지|프린트|워크북|workbook|worksheet|보충', re.I)
NOTES_HINT = re.compile(r'특징|성향|분석|지침|메모|note', re.I)


def fix_name(info: zipfile.ZipInfo) -> str:
    n = info.filename
    if info.flag_bits & 0x800:      # UTF-8 flag
        return n
    try:
        return n.encode('cp437').decode('cp949')
    except Exception:
        return n


def docx_text(path: Path) -> str:
    """본문 문단 + 표 + 글상자(textbox) 를 문서 순서대로. 글상자는 워드가 두 번 넣는 것
    (mc:AlternateContent 의 Choice/Fallback) 을 한 번만 센다."""
    with zipfile.ZipFile(path) as z:
        xml = z.read('word/document.xml').decode('utf8')
    # Fallback(VML) 쪽은 버린다 — Choice 와 같은 내용이다
    xml = re.sub(r'<mc:Fallback>.*?</mc:Fallback>', '', xml, flags=re.S)
    body = xml.split('<w:body>', 1)[-1]
    out = []

    def para_text(p):
        s = ''
        for m in re.finditer(r'<w:tab/>|<w:br[^>]*/>|<w:t[^>]*>([^<]*)</w:t>', p):
            if m.group(0).startswith('<w:tab'):
                s += '\t'
            elif m.group(0).startswith('<w:br'):
                s += '\n'
            else:
                s += m.group(1)
        return s

    # 글상자는 문단 안에 문단이 겹쳐 있어 먼저 떼어 두고 자리표를 남긴다
    boxes = []

    def stash(m):
        boxes.append(m.group(1))
        return f'<w:r><w:t>\u2983TB{len(boxes)-1}\u2984</w:t></w:r>'

    body = re.sub(r'<w:txbxContent>(.*?)</w:txbxContent>', stash, body, flags=re.S)
    for m in re.finditer(r'<w:p[ >].*?</w:p>|<w:tbl>.*?</w:tbl>', body, flags=re.S):
        chunk = m.group(0)
        if chunk.startswith('<w:tbl>'):
            for row in re.findall(r'<w:tr[ >].*?</w:tr>', chunk, flags=re.S):
                cells = re.findall(r'<w:tc>.*?</w:tc>', row, flags=re.S)
                out.append(' | '.join(' '.join(para_text(p) for p in re.findall(r'<w:p[ >].*?</w:p>', c, flags=re.S)).strip() for c in cells))
            continue
        t = para_text(chunk)
        refs = [int(x) for x in re.findall('\u2983TB(\d+)\u2984', t)]
        t = re.sub('\u2983TB\d+\u2984', '', t)
        if t.strip():
            out.append(t)
        for r in refs:
            out.append('┌──')
            for p in re.findall(r'<w:p[ >].*?</w:p>', boxes[r], flags=re.S):
                out.append('│ ' + para_text(p))
            out.append('└──')
    return '\n'.join(out)


def xlsx_text(path: Path) -> str:
    import openpyxl
    wb = openpyxl.load_workbook(path, data_only=True)
    out = []
    for ws in wb:
        out.append(f'### sheet: {ws.title}')
        for r in ws.iter_rows(values_only=True):
            if any(c is not None for c in r):
                out.append(' | '.join('' if c is None else str(c).replace('\n', ' ') for c in r))
    return '\n'.join(out)


def hwp_text(path: Path) -> str:
    """HWP 5.0 — BodyText 의 PARA_TEXT(태그 67) 만 모은다."""
    import olefile
    o = olefile.OleFileIO(str(path))
    hdr = o.openstream('FileHeader').read()
    flags = struct.unpack('<I', hdr[36:40])[0]
    out = []
    for e in sorted(x for x in o.listdir() if x[0] == 'BodyText'):
        data = o.openstream(e).read()
        if flags & 1:
            data = zlib.decompress(data, -15)
        i = 0
        while i + 4 <= len(data):
            h = struct.unpack('<I', data[i:i + 4])[0]
            tag, size = h & 0x3ff, (h >> 20) & 0xfff
            i += 4
            if size == 0xfff:
                size = struct.unpack('<I', data[i:i + 4])[0]
                i += 4
            if tag == 67:
                raw = data[i:i + size]
                s, j = '', 0
                while j + 2 <= len(raw):
                    c = struct.unpack('<H', raw[j:j + 2])[0]
                    j += 2
                    if c in (1, 2, 3, 11, 12, 14, 15, 16, 17, 18, 21, 22, 23):   # 확장 컨트롤 — 8 워드
                        j += 14
                    elif c in (4, 5, 6, 7, 8, 19, 20):                          # 인라인 — 8 워드
                        j += 14
                    elif c == 13 or c == 10:
                        s += '\n'
                    elif c == 9:
                        s += '\t'
                    elif c >= 32:
                        s += chr(c)
                out.append(s)
            i += size
    return '\n'.join(out)


def hwpx_text(path: Path) -> str:
    from hwpx.document import HwpxDocument
    return HwpxDocument.open(str(path)).text.plain()


def pdf_text_or_pages(path: Path, pages_dir: Path, dpi=130, max_pages=60):
    import pymupdf
    d = pymupdf.open(str(path))
    txt = '\n'.join(f'[p.{i+1}]\n' + p.get_text() for i, p in enumerate(d))
    if len(txt.strip()) > 40 * len(d):       # 글자가 있으면 텍스트 PDF
        return txt, []
    pages_dir.mkdir(parents=True, exist_ok=True)
    files = []
    for i, p in enumerate(d):
        if i >= max_pages:
            break
        f = pages_dir / f'page-{i+1:03d}.png'
        p.get_pixmap(dpi=dpi).save(str(f))
        files.append(str(f))
    return '', files


def image_page(path: Path, pages_dir: Path):
    pages_dir.mkdir(parents=True, exist_ok=True)
    from PIL import Image
    im = Image.open(path)
    im.thumbnail((1400, 1400))
    f = pages_dir / 'page-001.png'
    im.convert('RGB').save(f)
    return [str(f)]


def classify(name: str, text: str, is_scan: bool) -> str:
    base = os.path.basename(name)
    if base.startswith('.') or base.startswith('~$') or base.startswith('__MACOSX'):
        return 'ignore'
    if NOTES_HINT.search(base) and Path(base).suffix.lower() in TEXT_EXT | {'.docx', '.hwp'}:
        return 'notes'
    if EXAM_HINT.search(base) and not WS_HINT.search(base):
        return 'exam'
    if WS_HINT.search(base) or (is_scan and not EXAM_HINT.search(base)):
        return 'worksheet'
    if SCOPE_HINT.search(name):
        return 'scope'
    # 내용으로 한 번 더
    if re.search(r'\[\d점\]|①.*②.*③', text or ''):
        return 'exam'
    if re.search(r'Lesson \d|본문|대화문', text or ''):
        return 'scope'
    return 'unknown'


def main(zip_path, workdir):
    work = Path(workdir)
    raw, textdir, pagesdir = work / 'raw', work / 'text', work / 'pages'
    for d in (raw, textdir, pagesdir):
        d.mkdir(parents=True, exist_ok=True)
    manifest = {'zip': str(zip_path), 'files': []}
    with zipfile.ZipFile(zip_path) as z:
        infos = [i for i in z.infolist() if not i.is_dir()]
        for n, info in enumerate(infos, 1):
            name = fix_name(info)
            if '__MACOSX' in name or os.path.basename(name).startswith('.'):
                continue
            dst = raw / name
            dst.parent.mkdir(parents=True, exist_ok=True)
            dst.write_bytes(z.read(info))
            ext = dst.suffix.lower()
            text, pages, err = '', [], ''
            try:
                if ext == '.docx':
                    text = docx_text(dst)
                elif ext in ('.xlsx', '.xlsm'):
                    text = xlsx_text(dst)
                elif ext == '.hwp':
                    text = hwp_text(dst)
                elif ext == '.hwpx':
                    text = hwpx_text(dst)
                elif ext in TEXT_EXT:
                    text = dst.read_text(encoding='utf8', errors='replace')
                elif ext == '.pdf':
                    text, pages = pdf_text_or_pages(dst, pagesdir / f'{n:02d}')
                elif ext in ('.png', '.jpg', '.jpeg', '.webp', '.bmp', '.tif', '.tiff'):
                    pages = image_page(dst, pagesdir / f'{n:02d}')
                elif ext == '.doc':
                    err = 'doc(구형 워드) 는 지원하지 않음 — docx 로 저장해 다시 주세요'
            except Exception as e:      # 한 파일이 깨져도 나머지는 간다
                err = f'{type(e).__name__}: {e}'
            tpath = ''
            if text.strip():
                tpath = str(textdir / f'{n:02d}.txt')
                Path(tpath).write_text(text, encoding='utf8')
            role = classify(name, text, bool(pages))
            manifest['files'].append({
                'id': n, 'name': name, 'ext': ext, 'bytes': info.file_size, 'role': role,
                'text': tpath, 'chars': len(text), 'pages': pages, 'error': err,
            })
    (work / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf8')
    for f in manifest['files']:
        flag = f"{len(f['pages'])}쪽 그림" if f['pages'] else f"{f['chars']}자"
        print(f"{f['id']:02d} [{f['role']:9s}] {flag:>10s}  {f['name']}" + (f"  !! {f['error']}" if f['error'] else ''))
    print('→', work / 'manifest.json')


if __name__ == '__main__':
    if len(sys.argv) < 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
