# mockexam-agent — ZIP 한 개로 동형 모의고사 HWPX 3부

```
자료.zip ──ingest──▶ 작업폴더/{raw,text,pages,manifest.json}
                 ──profile──▶ profile.md (기출 형식 뼈대)
   Claude 가 읽고·분석하고·집필 ──▶ analysis.md + set1.json set2.json set3.json
                 ──build──▶ OO중학교_…_동형모의고사_N회.{hwpx,html,pdf}
```

| 파일 | 하는 일 |
|---|---|
| `agent.py` | 명령 모음 (`ingest` · `profile` · `build` · `check`) |
| `ingest.py` | ZIP 풀기(cp949 파일명 복원) · 역할 분류 · docx(글상자 포함)/xlsx/hwp/hwpx/txt 텍스트 · 스캔 PDF·사진은 쪽 그림 |
| `profile.py` | 기출 텍스트 → 번호·배점·유형·묶음 표 |
| `render.py` | 문항 JSON → HWPX(python-hwpx) 와 HTML 미리보기 |
| `samples/` | 견본 — 동양중 1학년 2학기 중간고사 (분석서 · spec 3개 · 결과 HWPX/PDF) |

에이전트의 절차(무엇을 읽고 어떻게 집필하는지)는 `.claude/skills/mock-exam-hwpx/SKILL.md`.

## 시험지 판형 (render.py)

A4 세로 · 상하좌우 여백 7 mm · 머리말(왼쪽 시험명, 오른쪽 `옳은영어 ORUN ENGLISH`, 아래 선) · 꼬리말 `- 쪽 -` ·
제목 띠(왼쪽 제목 15pt 굵게 + 부제, 오른쪽 로고 7 mm + 옳은영어 + 반/번호/이름, 아래 굵은 선) ·
본문 2단(간격 7 mm, 가운데 실선) · 함초롬바탕 10pt · 왼쪽 정렬 행간 130 % · 발문·선지는 4.5 mm 내어쓰기 ·
지문·대화는 0.12 mm 검정 실선 상자(1×1 표, 안쪽 여백 1 mm) · 서술형은 `<조건>` 상자와 `→ ____` 답란 ·
맨 뒤 새 쪽에 1단 정답표(번호·정답·배점·출처·해설). 로고는 `assets/orun-logo.png`.
다른 판형이 필요하면 `MARGIN_MM` · `COL_GAP_MM` · `FONT` · `BODY_PT` 와 `Hwpx.__init__` 의 문단 모양 표, `masthead()` 를 고친다.

## spec JSON

```json
{"school":"동양중학교","grade":1,"term":2,"exam":"중간고사","subject":"영어","set":1,"range":"Lesson 5~6",
 "items":[
  {"no":1,"points":2,"stem":"발문","box":"상자 첫 줄\n둘째 줄","choices":["…","…","…","…","…"],
   "answer":2,"explain":"해설","source":"L5 Watch and Talk A-3"},
  {"kind":"group","label":"[12~13]","direction":"다음 대화를 읽고 물음에 답하시오.","box":{"lines":["…"]}},
  {"no":9,"points":3,"stem":"…","box":"…","choices_table":{"header":["","ⓐ","ⓑ","ⓒ"],"rows":[["①","is","is","is"],…]},"answer":2},
  {"no":15,"points":3,"stem":"…","choices":["(A)","(B)","(C)","(D)","(E)"],"inline":true,"answer":4},
  {"kind":"essay","no":"서답형2","points":5,"stem":"…","box":"…","condition":["…","…"],"answer_lines":1,"answer":"…"}
 ]}
```

- `box`: 문자열(`\n` 으로 줄 나눔) 또는 `{"title":"…","lines":[…]}`. 줄 안에 `<u>밑줄</u>` `<b>굵게</b>` `<i>기울임</i>`.
- `choices` 의 한 항목에 `\n` 을 넣으면 둘째 줄(우리말 해석, B: 대사)이 들여쓰기로 붙는다.
- `inline`: 선지 다섯 개를 한 줄에. `choices_table`: ⓐⓑⓒ 조합표.
- `kind` 를 생략하면 `mc`. `answer` 는 객관식이면 1~5 정수, 서술형이면 문장.

## 확인

```bash
python3 tools/mockexam-agent/agent.py check samples/dongyang-m1-2-mid/set*.json
python3 tools/mockexam-agent/agent.py build samples/dongyang-m1-2-mid/set*.json -o /tmp/out
```

HWPX 는 저장 전에 OWPML 스키마 검증을 지나고, 다시 열어 `doc.text.plain()` 으로 본문이 그대로인지 본다.
한글 프로그램·LibreOffice 는 이 환경에 없으므로 눈 확인은 같은 spec 으로 만든 PDF 미리보기로 한다.
