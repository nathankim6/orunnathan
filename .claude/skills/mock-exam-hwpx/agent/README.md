# mockexam-agent — ZIP 한 개로 동형 모의고사 HWPX 3부

```
자료.zip ──ingest──▶ 작업폴더/{raw,text,pages,manifest.json}
                 ──profile──▶ profile.md (기출 형식 뼈대)
   Claude 가 읽고·분석하고·집필 ──▶ analysis.md + set1.json set2.json set3.json
                 ──build──▶ OO중학교_…_동형모의고사_N회.{hwpx,html,pdf}
```

| 파일 | 하는 일 |
|---|---|
| `agent.py` | 명령 모음 (`ingest` · `profile` · `check` · `audit` · `build`) — `audit` 는 지문·대화 문장이 범위 자료에 있는지 대조 |
| `ingest.py` | ZIP 풀기(cp949 파일명 복원) · 역할 분류 · docx(글상자 포함)/xlsx/hwp/hwpx/txt 텍스트 · 스캔 PDF·사진은 쪽 그림 |
| `profile.py` | 기출 텍스트 → 번호·배점·유형·묶음 표 |
| `render.py` | 문항 JSON → HWPX(python-hwpx) 와 HTML 미리보기 |
| `samples/` | 견본 — 동양중 1학년 2학기 중간고사 (분석서 · spec 3개 · 결과 HWPX/PDF) |

에이전트의 절차(무엇을 읽고 어떻게 집필하는지)는 한 단계 위의 `SKILL.md`.

## 시험지 판형 (render.py)

`assets/exam-template.hwpx` 는 **실제 학교 시험지(한글) 서식**이다. render.py 는 이 파일을 열어
머리말(`2026학년도 2학기 중간고사`) · 꼬리말(저작권 문구 / `1학년 영어 과목 · n / 전체 · 옳은영어 ORUN ENGLISH`) ·
정보표(학년·코드·과목·총 문항수·선택형·서답형·쪽수·시행 정보 + 로고) · 안내문 두 줄을 채우고,
서식의 견본 문항 자리에 문항을 넣는다. 여백(좌우 13 / 상하 7 mm + 머리·꼬리 8 mm) · 쪽 테두리 · 2단(간격 4.5 mm) ·
글꼴(맑은 고딕 10pt, 영어 지문 바탕 10pt) · 문단 모양(양쪽 정렬 160 %, 선지 내어쓰기)은 모두 서식 파일의 것을 id 로
가져다 쓴다(`T` 표). 지문·대화는 서식의 실선 테두리(borderFill 2)로 1×1 표를 만든다.
다른 학교 서식을 쓰려면 그 학교 HWPX 를 `assets/exam-template.hwpx` 에 두고 `T` 의 id 를 맞춘다.
HTML/PDF 미리보기는 같은 구성을 흉내 낸 것이라 줄 바꿈·쪽 수는 한글과 조금 다르다.

## spec JSON

```json
{"school":"동양중학교","grade":1,"term":2,"exam":"중간고사","subject":"영어","set":1,"range":"Lesson 5~6","publisher":"동아(윤정미)",
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
- `explain`: 해설지 본문(정답 근거·규칙·채점 기준, `\n` 으로 문단). `wrong`: 오답 선지별 이유 배열(선택). `source`: 출처.
- `build` 는 시험지(`…_N회.hwpx`, 정답 없음)와 해설지(`…_N회_해설.hwpx`)를 따로 낸다.

## 확인

```bash
python3 agent.py check samples/dongyang-m1-2-mid/set*.json
python3 agent.py build samples/dongyang-m1-2-mid/set*.json -o /tmp/out
```

HWPX 는 저장 전에 OWPML 스키마 검증을 지나고, 다시 열어 `doc.text.plain()` 으로 본문이 그대로인지 본다.
한글 프로그램·LibreOffice 는 이 환경에 없으므로 눈 확인은 같은 spec 으로 만든 PDF 미리보기로 한다.
