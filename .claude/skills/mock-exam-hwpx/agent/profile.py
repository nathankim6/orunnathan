#!/usr/bin/env python3
"""기출 시험지 텍스트에서 문항 뼈대(번호·배점·유형·묶음)를 뽑아 형식 프로파일을 만든다.

  python3 profile.py <작업폴더>            manifest 의 exam 파일을 모두 읽는다
  python3 profile.py <작업폴더> --exam 08.txt

작업폴더/profile.json 과 profile.md 를 쓴다. 유형 판정은 발문의 낱말로 하는 어림이므로
Claude 가 profile.md 를 읽고 손봐야 한다 — 이 파일은 출발점이지 정답이 아니다.
"""
import sys as _sys, os as _os
_v = _os.path.join(_os.path.dirname(_os.path.abspath(__file__)), 'vendor')     # 동봉 라이브러리(python-hwpx·olefile) — pip 이 안 되는 환경용
if _os.path.isdir(_v) and _v not in _sys.path:
    _sys.path.append(_v)

import json, re, sys
from collections import Counter, OrderedDict
from pathlib import Path

CIRCLED = '①②③④⑤'
TYPE_RULES = [       # (유형, 발문 정규식) — 먼저 맞는 것이 이긴다
    ('서술형', r'^\[?서[답술]형'),
    ('대화-의도', r'의도|목적'),
    ('대화-어색', r'어색'),
    ('대화-빈칸', r'대화.*(빈칸|들어갈)'),
    ('대화-일치', r'대화.*(일치|내용)'),
    ('대화-표지판', r'표지판|그림'),
    ('어휘-영영풀이', r'뜻풀이|영영'),
    ('어휘-빈칸', r'(공통으로|어디에도).*(단어|들어갈)|빈칸.*단어'),
    ('어휘-밑줄의미', r'밑줄.*(단어|말).*의미|의미.*알맞지'),
    ('문법-영작', r'영작|우리말.*(문장|옮긴)'),
    ('문법-어법개수', r'옳은 문장의 개수|개수'),
    ('문법-어법판단', r'어법|생략|쓰임이.*다른|용법'),
    ('독해-문장삽입', r'주어진 문장이 들어갈|들어갈 곳'),
    ('독해-지칭', r'가리키는 대상|지칭'),
    ('독해-일치', r'일치하|답을 찾을 수 없는|대답할 수 없는|내용으로'),
    ('독해-제목', r'제목|소제목|주제|요지'),
    ('독해-빈칸', r'빈칸에 들어갈|흐름상'),
]
AREA = {'대화': '대화', '어휘': '어휘', '문법': '문법', '독해': '독해', '서술형': '서술형'}


def item_type(stem: str) -> str:
    for name, rx in TYPE_RULES:
        if re.search(rx, stem):
            return name
    return '기타'


def parse(text: str):
    lines = text.splitlines()
    items, groups, cur = [], [], None
    title = lines[0].strip() if lines else ''
    for ln in lines:
        s = ln.strip()
        g = re.match(r'^\[(\d+)\s*[~∼-]\s*(\d+)\]\s*(.*)', s)
        if g:
            groups.append({'from': int(g.group(1)), 'to': int(g.group(2)), 'direction': g.group(3)})
            cur = None
            continue
        m = re.match(r'^(\d{1,2})\.\s*(.*)', s) or re.match(r'^(\[?서[답술]형\s*\d+\]?)\s*(.*)', s)
        if m:
            no, stem = m.group(1), m.group(2)
            pt = re.search(r'\[(\d+)\s*점\]', stem)
            cur = {'no': no, 'stem': re.sub(r'\s*\[\d+\s*점\]\s*', '', stem).strip(),
                   'points': int(pt.group(1)) if pt else None, 'type': item_type(no + ' ' + stem),
                   'choices': 0, 'box_lines': 0, 'has_table': False}
            items.append(cur)
            continue
        if cur is None:
            continue
        if s[:1] in CIRCLED:
            cur['choices'] += len([c for c in s if c in CIRCLED])
        elif s.startswith('│'):
            cur['box_lines'] += 1
        elif ' | ' in s:
            cur['has_table'] = True
    return title, items, groups


def summarize(title, items, groups):
    mc = [i for i in items if i['type'] != '서술형']
    ess = [i for i in items if i['type'] == '서술형']
    pts = [i['points'] for i in items if i['points']]
    areas = Counter(i['type'].split('-')[0] for i in items)
    types = Counter(i['type'] for i in items)
    return OrderedDict(
        title=title, total_items=len(items), mc_items=len(mc), essay_items=len(ess),
        points_known=sum(pts), points_missing=[i['no'] for i in items if not i['points']],
        point_distribution=dict(sorted(Counter(pts).items())),
        areas=dict(areas), types=dict(types), groups=groups,
        avg_box_lines=round(sum(i['box_lines'] for i in items) / max(1, len(items)), 1),
    )


def main(workdir, exam=None):
    work = Path(workdir)
    man = json.loads((work / 'manifest.json').read_text(encoding='utf8'))
    files = [f for f in man['files'] if f['role'] == 'exam' and f['text']]
    if exam:
        files = [f for f in man['files'] if f['text'].endswith(exam)]
    notes = [Path(f['text']).read_text(encoding='utf8') for f in man['files'] if f['role'] == 'notes' and f['text']]
    profiles = []
    md = ['# 기출 형식 프로파일 (자동 추출 — 손봐서 쓸 것)\n']
    for f in files:
        title, items, groups = parse(Path(f['text']).read_text(encoding='utf8'))
        summ = summarize(title, items, groups)
        profiles.append({'file': f['name'], 'summary': summ, 'items': items})
        md.append(f"## {f['name']}\n")
        md.append(f"- 제목: **{title}**")
        md.append(f"- 문항: 객관식 {summ['mc_items']} · 서술형 {summ['essay_items']} · 배점 합 {summ['points_known']}"
                  + (f" (배점 없는 문항: {', '.join(map(str, summ['points_missing']))})" if summ['points_missing'] else ''))
        md.append(f"- 배점 분포: {summ['point_distribution']}")
        md.append(f"- 영역: {summ['areas']}")
        md.append(f"- 묶음 지문: " + ('; '.join(f"[{g['from']}~{g['to']}] {g['direction']}" for g in groups) or '없음'))
        md.append('\n| 번호 | 배점 | 유형(어림) | 선지 | 상자줄 | 발문 |\n|---|---|---|---|---|---|')
        for i in items:
            md.append(f"| {i['no']} | {i['points'] or '?'} | {i['type']} | {i['choices']} | {i['box_lines']} | {i['stem'][:60]} |")
        md.append('')
    if notes:
        md.append('## 첨부된 출제 성향 메모\n')
        md += ['> ' + l for n in notes for l in n.splitlines() if l.strip()]
    (work / 'profile.json').write_text(json.dumps(profiles, ensure_ascii=False, indent=2), encoding='utf8')
    (work / 'profile.md').write_text('\n'.join(md), encoding='utf8')
    print('\n'.join(md))


if __name__ == '__main__':
    a = sys.argv[1:]
    if not a:
        sys.exit(__doc__)
    main(a[0], a[2] if len(a) > 2 and a[1] == '--exam' else None)
