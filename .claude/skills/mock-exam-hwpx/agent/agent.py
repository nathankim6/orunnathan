#!/usr/bin/env python3
"""동형 모의고사 에이전트 — 명령 하나로 단계를 잇는다.

  python3 agent.py ingest  <자료.zip> <작업폴더>       ZIP 풀기·분류·텍스트 추출·스캔 쪽그림
  python3 agent.py profile <작업폴더>                  기출 형식 프로파일(profile.md)
  python3 agent.py build   <spec.json>… -o <출력폴더>  JSON → HWPX(+ HTML·PDF 미리보기)
  python3 agent.py check   <spec.json>…                번호·배점·정답·선지 수 점검만

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
