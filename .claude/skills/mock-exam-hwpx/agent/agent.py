#!/usr/bin/env python3
"""동형 모의고사 에이전트 — 명령 하나로 단계를 잇는다.

  python3 agent.py ingest  <자료.zip> <작업폴더>       ZIP 풀기·분류·텍스트 추출·스캔 쪽그림
  python3 agent.py profile <작업폴더>                  기출 형식 프로파일(profile.md)
  python3 agent.py build   <spec.json>… -o <출력폴더>  JSON → HWPX(+ HTML·PDF 미리보기)
  python3 agent.py check   <spec.json>…                번호·배점·정답·선지 수 점검만
  python3 agent.py audit   <작업폴더> <spec.json>…      문항의 모든 영어 문장(상자·선지·보기)을 범위 텍스트와 대조 — 원문/변형/창작

문항을 쓰는 것은 Claude 의 일이다 — .claude/skills/mock-exam-hwpx/SKILL.md 의 절차를 따른다.
"""
import sys as _sys, os as _os
_v = _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), 'vendor')     # 동봉 라이브러리(python-hwpx·olefile) — pip 이 안 되는 환경용
if _os.path.isdir(_v) and _v not in _sys.path:
    _sys.path.append(_v)

import json, os, subprocess, sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
PW = '/opt/node22/lib/node_modules/playwright/index.mjs'
CHROME = '/opt/pw-browsers/chromium_headless_shell-1194/chrome-linux/headless_shell'
TOPDF = """import { chromium } from '%s';
const [html, pdf] = process.argv.slice(2);
const b = await chromium.launch({ executablePath: '%s' });
const p = await b.newPage(); await p.goto('file://' + html);
await p.pdf({ path: pdf, format: 'A4', printBackground: true, preferCSSPageSize: true }); await b.close();
"""


def out_name(spec):
    return f"{spec['school']}_{spec['grade']}학년_{spec['term']}학기_{spec['exam']}_동형모의고사_{spec.get('set', 1)}회"


def build(specs, outdir):
    sys.path.insert(0, str(HERE))
    import render
    outdir = Path(outdir)
    outdir.mkdir(parents=True, exist_ok=True)
    topdf = outdir / '.topdf.mjs'
    can_pdf = os.path.exists(PW) and os.path.exists(CHROME)
    if can_pdf:
        topdf.write_text(TOPDF % (PW, CHROME))
    for sp in specs:
        spec = json.loads(Path(sp).read_text(encoding='utf8'))
        probs, total, nmc, ness = render.check_spec(spec)
        name = out_name(spec)
        print(f"{name}: 객관식 {nmc} · 서술형 {ness} · 총점 {total}" + (' !! ' + '; '.join(probs) if probs else ''))
        if probs:
            print('  → 고친 뒤 다시 build 하세요.')
            continue
        hw = render.Hwpx()
        hw.build(spec)
        hw.save(outdir / f'{name}.hwpx')
        html = outdir / f'{name}.html'
        html.write_text(render.build_html(spec), encoding='utf8')
        if can_pdf:
            subprocess.run(['node', str(topdf), str(html.resolve()), str((outdir / f'{name}.pdf').resolve())], check=True)
        print('  →', outdir / f'{name}.hwpx', '(+ .html' + (', .pdf)' if can_pdf else ')'))


def _norm(t):
    import re, unicodedata
    t = re.sub(r'<[^>]+>', '', t)                      # <u> 등
    t = re.sub(r'[\u24d0-\u24e9\u2460-\u2473]', ' ', t)  # ⓐ ① (NFKC 전에 떼어야 다음 단어에 붙지 않는다)
    t = unicodedata.normalize('NFKC', t)
    t = re.sub(r'\([A-Ea-e가-바]\)|__+|\[[^\]]*\]', ' ', t)
    t = t.replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    return re.sub(r'[^a-z0-9 ]', ' ', t.lower()).split()


def _sentences(text):
    import re
    out = []
    for ln in text.splitlines():
        for sent in re.split(r'(?<=[.!?])\s+', ln):
            w = _norm(sent)
            if len(w) >= 4:
                out.append((sent.strip(), w))
    return out


def audit(workdir, specs, near=0.6):
    """문항의 모든 영어 문장(상자·선지·보기·조건)이 범위 자료 텍스트(scope + worksheet 옮겨 적은 것)에 있는지 대조한다.
    exact  = 6-gram 이 그대로 있음 / 변형 = 원문 문장과 단어 60 % 이상 겹침(어법 오류 심기 등) / 창작 = 짝이 없음."""
    import re
    man = json.loads((Path(workdir) / 'manifest.json').read_text(encoding='utf8'))
    texts = [Path(f['text']).read_text(encoding='utf8') for f in man['files'] if f['role'] in ('scope', 'worksheet') and f['text']]
    for extra in sorted(Path(workdir).glob('text/ws*.txt')):        # 학습지를 옮겨 적은 파일
        texts.append(extra.read_text(encoding='utf8'))
    corpus = '\n'.join(texts)
    words = _norm(corpus)
    grams = set(' '.join(words[i:i + 6]) for i in range(len(words) - 5))
    csents = _sentences(corpus)
    total = {'exact': 0, '변형': 0, '창작': 0}
    for sp in specs:
        spec = json.loads(Path(sp).read_text(encoding='utf8'))
        rows = []
        for it in spec['items']:
            no = it.get('no') or it.get('label')
            cand = []
            box = it.get('box')
            if box:
                cand += box.split('\n') if isinstance(box, str) else list(box.get('lines', [])) + [box.get('title') or '']
            for c in it.get('choices', []):
                cand += c.split('\n')
            if it.get('choices_table'):
                cand += [' '.join(map(str, r)) for r in it['choices_table']['rows']]
            cand += it.get('condition', [])
            for ln in cand:
                for sent in re.split(r'(?<=[.!?])\s+', ln):
                    w = _norm(sent)
                    if len(w) < 5 or sum(ch.isascii() and ch.isalpha() for ch in sent) < len(sent) * 0.5:
                        continue
                    if any(' '.join(w[i:i + 6]) in grams for i in range(len(w) - 5)):
                        rows.append((no, 'exact', sent, ''))
                        continue
                    ws = set(w)
                    best, bs = '', 0.0
                    for cs, cw in csents:
                        j = len(ws & set(cw)) / len(ws | set(cw))
                        if j > bs:
                            best, bs = cs, j
                    rows.append((no, '변형' if bs >= near else '창작', sent, f'{bs:.2f} ≈ {best[:80]}'))
        c = {'exact': 0, '변형': 0, '창작': 0}
        for r in rows:
            c[r[1]] += 1
            total[r[1]] += 1
        print(f"{Path(sp).name}: 원문 그대로 {c['exact']} · 변형 {c['변형']} · 창작 {c['창작']}")
        for no, kind, sent, note in rows:
            if kind == '창작':
                print(f"   [창작 {no}] {sent[:90]}   ({note})")
        for no, kind, sent, note in rows:
            if kind == '변형':
                print(f"   [변형 {no}] {sent[:70]}   ({note})")
    print(f"합계: 원문 그대로 {total['exact']} · 변형 {total['변형']} · 창작 {total['창작']}")
    return total['창작']


def main(a):
    if not a:
        sys.exit(__doc__)
    cmd = a[0]
    if cmd == 'ingest':
        subprocess.run([sys.executable, str(HERE / 'ingest.py'), *a[1:]], check=True)
    elif cmd == 'profile':
        subprocess.run([sys.executable, str(HERE / 'profile.py'), *a[1:]], check=True)
    elif cmd == 'build':
        o = a.index('-o') if '-o' in a else None
        specs = a[1:o] if o else a[1:]
        build(specs, a[o + 1] if o else 'out')
    elif cmd == 'audit':
        sys.exit(1 if audit(a[1], a[2:]) else 0)
    elif cmd == 'check':
        sys.path.insert(0, str(HERE))
        import render
        for sp in a[1:]:
            spec = json.loads(Path(sp).read_text(encoding='utf8'))
            probs, total, nmc, ness = render.check_spec(spec)
            print(f"{sp}: 객관식 {nmc} · 서술형 {ness} · 총점 {total}", '; '.join(probs) or 'OK')
    else:
        sys.exit(__doc__)


if __name__ == '__main__':
    main(sys.argv[1:])
