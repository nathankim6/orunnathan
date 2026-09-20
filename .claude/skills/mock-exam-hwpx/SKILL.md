---
name: mock-exam-hwpx
description: 학교 기출 시험지·시험범위 자료(교과서 본문·어휘 엑셀/HWP/워드)·학교 학습지(스캔 PDF·사진)·출제 성향 메모가 든 ZIP 하나를 받아, 기출과 학습지를 분석하고 출제자 성향을 프로파일한 뒤 "OO중학교 O학년 O학기 OO고사" 동형 모의고사 3부를 학교 시험지와 같은 판형의 HWPX(한글) 파일로 만든다. 사용자가 ZIP 을 주며 동형 모의고사·내신 대비 모의고사·학교 시험 예상 문제를 HWPX/한글 파일로 만들어 달라고 하면 이 스킬을 쓴다.
---

# 동형 모의고사 에이전트 (ZIP → HWPX 3부)

도구는 `tools/mockexam-agent/` 에 있다. 파일을 읽고 분류하고 시험지를 조판하는 일은 스크립트가 하고,
**분석과 문항 집필은 Claude 가 한다.** 순서를 건너뛰지 않는다.

## 0. 준비

```bash
pip install -q python-hwpx openpyxl olefile pymupdf pillow   # 처음 한 번
```

## 1. 자료 풀기·분류

```bash
python3 tools/mockexam-agent/agent.py ingest <자료.zip> <작업폴더>
```

`manifest.json` 에 파일마다 역할이 붙는다 — `exam`(기출) · `scope`(시험범위: 교과서 본문·대화문·어휘) ·
`worksheet`(학교 학습지·프린트) · `notes`(출제 성향 메모) · `unknown`. 이름으로 판단한 어림이므로
**목록을 보고 잘못 붙은 것은 머릿속에서 바로잡는다.** 텍스트가 나온 파일은 `text/NN.txt`,
스캔 PDF·사진은 `pages/NN/page-001.png …` 로 쪽 그림이 된다.

## 2. 읽기 — 빠짐없이

1. `text/*.txt` 를 전부 읽는다. 기출은 `┌── … └──` 가 글상자(지문·대화 상자)다.
2. **스캔 학습지는 쪽 그림을 Read 로 한 장씩 모두 본다.** 학습지는 이 학교 출제의 가장 큰 소스다 —
   문법 규칙표·연습 문장·워크북 문장이 시험에 그대로 나온다. 건너뛰면 매칭이 틀어진다.
3. 기출 안에 그림(표지판·삽화)이 있으면 docx 의 `word/media/*` 를 열어 무엇인지 본다.

## 3. 기출 형식 프로파일

```bash
python3 tools/mockexam-agent/agent.py profile <작업폴더>      # → profile.md / profile.json
```

번호·배점·유형(어림)·묶음 지문·상자 줄 수가 표로 나온다. 이것을 **기출 원문과 대조해** 다음을 확정한다.

- 문항 수(객관식/서술형), 배점 분포와 총점(100이 안 되면 비율을 지키며 100으로 맞추고 분석서에 적는다)
- 번호별 유형과 그 유형이 가져오는 소스(교과서 본문·대화문·어휘 영영풀이·학습지 문장)
- 시험지 판형: 단 수, 글꼴, 상자, 선지 배열, 서술형 답란·조건 상자
- 첨부 메모(문법 %·어휘 %·학습지 비중 등)와 기출이 맞는지

결과를 `<출력폴더>/analysis.md` 로 쓴다. 표 두 개가 핵심이다 — **(가) 번호별 유형·소스 매칭표**,
**(나) 3부의 소스 배분표**(긴 본문·짧은 본문·대화 세트·서술형이 3부에서 서로 겹치지 않게).
견본: `tools/mockexam-agent/samples/dongyang-m1-2-mid/analysis.md`.

## 4. 문항 집필 — 3부, 각각 JSON 한 개

형식은 `tools/mockexam-agent/README.md` 의 spec 설명을 따른다. 견본: `samples/dongyang-m1-2-mid/set1.json`.

지킬 것:

- **기출과 같은 번호에 같은 유형.** 1번이 대화면 1번은 대화, 15~18이 본문 세트면 15~18도 본문 세트.
- **문장은 자료에서 가져온다.** 본문·대화문은 교과서 xlsx/hwp 의 문장을 그대로(오타 없이) 싣고,
  문법·어휘 문항의 예문은 학습지·워크북 문장을 우선 쓴다. 지어낸 문장은 학습지에 비슷한 것이 없을 때만.
- **범위의 문법 포인트를 골고루** (이번 범위 단원의 Warm-Up 에 나열된 것 전부). 어휘는 영영풀이·숙어·다의어.
- 본문은 부마다 다른 대목을 길게/짧게 번갈아 쓴다. 서술형도 부마다 다른 대목.
- 오답 선지는 **그 단원에서 배운 오류**(비교급 이중 표기, there is/are 수 일치, to부정사 목적어 동사,
  that 생략 불가 등)로 만든다. 정답이 한 개뿐인지 문항마다 다시 읽는다.
- 그림이 필요한 기출 유형(표지판·삽화)은 그림 없이 같은 것을 묻는 글 형태로 바꾸고 분석서에 적는다.
- `answer` · `explain` · `source` 를 문항마다 채운다. 정답표가 여기서 나온다.

집필이 끝나면 점검한다:

```bash
python3 tools/mockexam-agent/agent.py check set1.json set2.json set3.json
```

배점 합·선지 수·정답 누락을 잡는다. 총점이 맞을 때까지 고친다.

## 5. 조판·검증·전달

```bash
python3 tools/mockexam-agent/agent.py build set1.json set2.json set3.json -o <출력폴더>
```

`OO중학교_O학년_O학기_OO고사_동형모의고사_N회.hwpx` 와 같은 이름의 `.html` · `.pdf` 미리보기가 나온다.
HWPX 는 스키마 검증을 통과해야 저장된다. **PDF 미리보기를 쪽마다 Read 로 열어** 상자·선지·묶음 지문·
서술형 답란이 기출 판형과 같은지 눈으로 확인한다(이 환경에서는 한글 프로그램을 띄울 수 없으므로
PDF 가 눈 대신이다). 어긋나면 spec 을 고쳐 다시 build 한다.

끝나면 `SendUserFile` 로 **HWPX 3개 + PDF 미리보기 3개 + analysis.md** 를 보낸다.
저장소에 남길 때는 `tools/mockexam-agent/samples/<학교-학년-학기-고사>/` 에 spec·analysis·hwpx 를 둔다.

## 자주 틀리는 것

- 기출 docx 의 지문이 안 보인다 → 글상자에 들어 있다. `ingest` 가 `┌──` 로 꺼내 준다. 빠져 있으면
  `mc:AlternateContent` 안의 VML(Fallback) 이 아닌 Choice 쪽만 읽고 있는지 본다.
- `.hwp`(5.0 바이너리) 는 본문 텍스트만 나온다. 표 안 문장은 순서가 섞일 수 있어 같은 내용의 xlsx 가 있으면 그쪽을 믿는다.
- 스캔 PDF 는 텍스트가 0 이다. `pages/` 그림을 읽는 것 말고 길이 없다. 글자가 작으면 `ingest.py` 의 dpi 를 올린다.
- LibreOffice 는 이 환경에서 파일을 못 연다. 미리보기는 Playwright(Chromium)로 HTML→PDF 로 만든다.
