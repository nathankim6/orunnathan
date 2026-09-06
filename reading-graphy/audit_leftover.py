#!/usr/bin/env python3
# 템플릿(수달 등) 문자열이 유닛에 그대로 남아 있는지 검사한다.
# 모든 책이 같은 템플릿에서 파생됐으므로, 지문 고유 문장이 템플릿과 글자까지 같으면
# 그 구역은 갈아끼우지 않고 남은 것이다.
import re, sys, glob, os, collections

SK = "/root/.claude/skills/synced/981111a8-457a-4e33-aa0f-675650dd64f6_dce64823-e263-4aad-8dbb-67e81bea131f/orun-reading-prep/units"
STR = re.compile(r'"((?:[^"\\\n]|\\.)*)"' + r"|'((?:[^'\\\n]|\\.)*)'")

def strings(src):
    out = []
    for m in STR.finditer(src):
        s = m.group(1) if m.group(1) is not None else m.group(2)
        out.append((m.start(), s))
    return out

def distinctive(s):
    if len(s) < 14: return False
    if not re.search(r'[A-Za-z가-힣]', s): return False
    # 레이아웃/구조 문자열 제외
    if re.fullmatch(r'[0-9a-fA-F#,:;%\-\s\./]+', s): return False
    return True

tmpl = set()
for f in sorted(glob.glob(SK + "/unit0*.js")):
    for _, s in strings(open(f, encoding="utf-8").read()):
        if distinctive(s): tmpl.add(s)

# 섹션 앵커 — 파일 내 위치로 어느 구역인지 이름 붙인다
ANCH = [(re.compile(p), n) for p, n in [
    (r'renderExplain', '해설'), (r'R7|한 줄 영작', 'R7'), (r'R6', 'R6'), (r'R5', 'R5'),
    (r'R4', 'R4'), (r'R3', 'R3'), (r'R2', 'R2'), (r'R1', 'R1'),
    (r'STEP 5', 'STEP5'), (r'STEP 4', 'STEP4'), (r'STEP 3', 'STEP3'),
    (r'STEP 2', 'STEP2'), (r'STEP 1', 'STEP1'),
    (r'Knowledge Bank', 'KB'), (r'구문 훈련', '구문훈련'), (r'구문분석', '구문분석'),
    (r'한 줄 해석', '한줄해석'), (r'render\b', '본문/독해'),
]]

def section_of(src, pos):
    best, bn = -1, '?'
    for rx, name in ANCH:
        for m in rx.finditer(src, 0, pos):
            if m.start() > best: best, bn = m.start(), name
    return bn

rows = []
for book in sorted(sys.argv[1:] or glob.glob("rg[1-4]")):
    for f in sorted(glob.glob(f"{book}/units/unit*.js")):
        src = open(f, encoding="utf-8").read()
        hits = [(p, s) for p, s in strings(src) if distinctive(s) and s in tmpl]
        if hits:
            secs = collections.Counter(section_of(src, p) for p, _ in hits)
            rows.append((f, len(hits), secs, hits[:3]))

for f, n, secs, sample in sorted(rows, key=lambda r: -r[1]):
    print(f"{f}: {n}건  {dict(secs)}")
    for _, s in sample: print("    ", s[:90])
print("의심 유닛:", len(rows))
