# 설치 (다른 선생님용)

이 폴더(`mock-exam-hwpx/`) 하나가 전부다. Claude Code 가 깔린 컴퓨터에서 아래 중 하나를 고른다.

1. **내 계정 어디서나** — 폴더를 `~/.claude/skills/mock-exam-hwpx/` 로 복사한다.
   (윈도우: `C:\Users\<이름>\.claude\skills\mock-exam-hwpx\`)
2. **특정 저장소에서만** — 그 저장소의 `.claude/skills/mock-exam-hwpx/` 로 복사한다.

그다음 한 번만:

```bash
pip install -r ~/.claude/skills/mock-exam-hwpx/agent/requirements.txt
```

쓰는 법: Claude Code 를 열고 자료 ZIP 을 첨부하며
"동양중학교 1학년 2학기 중간고사 동형 모의고사 3부 만들어 줘" 라고 하면 된다.
ZIP 안에는 기출 시험지 · 시험범위(교과서 본문·어휘) · 학교 학습지(스캔 PDF 가능) · 출제 성향 지침 `.txt` 를 넣는다.
다른 학교 서식을 쓰려면 그 학교 시험지 HWPX 를 함께 주고 "이 서식으로" 라고 말한다.

한글(HWP)에서 열어 확인하는 것은 사람의 몫이다 — 이 도구는 한글 없이 파일을 만든다.
