  // ==================================================================
  //  PROMPTS — 모델에게 보내는 글. 전부 JSON 만 돌려받는다.
  // ==================================================================
  const PROMPTS = (function () {
    const ROLE = "당신은 대한민국 고등학교 영어 내신·수능 출제 경력 20년의 출제위원장이자, 출제자의 습관을 데이터로 읽어 내는 분석가입니다. 답변은 요청한 형식만 출력하고, 설명·인사·코드펜스를 붙이지 않습니다.\n\n";
    const TYPES = "주제|제목|요지|주장|목적|심경|분위기|빈칸|어법|어휘|순서|삽입|무관한문장|함축의미|요약문|내용일치|내용불일치|지칭추론|세부정보|연결어|영영풀이|도표|안내문|서술형|기타";
    const GRAMMAR = "수일치·시제·태·분사·분사구문·관계사·접속사·가정법·도치·비교·부정사·동명사·대명사·형용사/부사·병렬·조동사·전치사·어순";

    // 파일을 넣은 사람이 함께 적어 준 말 — 분류·메타·해석에 반영하되 지어내지 않게 한다
    function memoBlock(memo) {
      memo = String(memo || "").trim().slice(0, 600);
      return memo ? "[사용자 메모 — 파일을 넣은 사람이 이 파일에 대해 알려 준 것입니다. 분류·시험 정보·해석에 반영하되, 텍스트에 없는 사실을 지어내지 마세요]\n" + memo + "\n\n" : "";
    }
    function classify(name, head, memo) {
      return ROLE +
"[작업] 아래는 파일 \"" + name + "\" 에서 추출한 텍스트의 앞부분입니다. 이 파일이 (A) 학교 기출 시험지인지 (B) 시험범위 원문(교과서·부교재·모의고사 지문 자료)인지 판정하세요.\n" +
"- 기출 시험지: 문항 번호·발문·①~⑤ 선지·배점·서술형 안내가 있다.\n" +
"- 시험범위 원문: 영어 본문 단락이 이어지고 문항이 없다(단어장·해석·문법 설명이 섞일 수 있다).\n" +
"- 기출 시험지면 학교·연도·학년·학기·시험명(중간|기말|1차지필|2차지필)·과목을 텍스트에서 찾아 적고, 없으면 빈 문자열.\n" +
"[출력 — JSON만]\n" +
'{"kind":"exam|scope","confidence":0.0,"reason":"한 줄","meta":{"school":"","year":"","grade":"","semester":"","term":"","subject":""}}\n' +
memoBlock(memo) + "[텍스트]\n" + head;
    }

    function dataize(chunk, o) {
      // o: { i, n, numbers[], prevNumbers[], carry, meta }
      const many = o.n > 1;
      return ROLE +
"[작업] 아래는 실제 학교 기출 시험지에서 추출한 텍스트입니다" + (many ? "(" + o.i + "/" + o.n + " 부분" + (o.prevNumbers && o.prevNumbers.length ? " · 앞부분에서 " + o.prevNumbers.join(",") + "번을 이미 분석했습니다" : "") + ")" : "") + ". " +
"추출 과정에서 줄·칸 배치가 흐트러졌을 수 있으니 문맥으로 복원하세요. 이 부분에서 '발문이 시작되는' 문항만 분석합니다. 앞부분에서 이어진 지문의 꼬리, 정답표, 머리글은 무시합니다. 문항을 빠뜨리지 말고, 없는 문항을 만들지 마세요." +
(o.numbers && o.numbers.length ? " 이 부분에 있어야 할 번호: " + o.numbers.join(", ") + "." : "") + "\n\n" +
"각 문항을 아래 필드로 데이터화합니다. 알 수 없으면 \"\" · [] · null 을 쓰고 confidence 를 낮춥니다.\n" +
"- number: 인쇄된 번호 그대로(\"12\", \"서술형 3\").\n" +
"- type: " + TYPES + "\n" +
"- subtype: 서술형이면 조건영작|어법고치기|단어빈칸|요약문완성|어순배열|문장전환|주제문쓰기|영영풀이쓰기|한글요약|지칭쓰기|기타. 객관식이면 세부 변형(빈칸-연결어, 빈칸-구, 어법-밑줄5, 어법-(A)(B)(C)네모, 어휘-밑줄, 어휘-네모, 내용일치-한글선지 등), 없으면 \"\".\n" +
"- format: 5지선다|복수정답|서술형|단답형|OX\n" +
"- points: 숫자(인쇄돼 있으면 그대로, 없으면 null). points_printed: true|false\n" +
"- difficulty: 상|중|하. difficulty_reason: 한 줄(선지 변별·지문 난도·변형 폭 기준).\n" +
"- stem: 발문 원문 그대로(선지·지문 제외, 120자 이내, [3점] 같은 배점 표기도 있으면 그대로).\n" +
"- options: [{\"label\":\"①\",\"text\":\"선지 요약 60자 이내\"}] 다섯 개. 순서·삽입처럼 기호뿐이면 text 에 기호나 배열(\"(B)-(A)-(C)\")을 그대로. 서술형이면 [].\n" +
"- answer: 시험지에 정답이 인쇄돼 있으면 그 값(\"③\", 서술형은 모범답안 요지 80자 이내), 없으면 \"\". answer_source: printed|none\n" +
"- passage: {\"has\":true|false,\"lang\":\"en|ko|mixed\",\"first10\":\"지문 첫 10단어 원문 그대로\",\"last6\":\"지문 끝 6단어 원문 그대로\",\"words\":대략단어수,\"scale\":\"보통|2배|3배 이상\"}. 세트의 후속 문항(윗글 참조)은 has:false 로 두고 set 만 채웁니다. 빈칸·밑줄 기호는 first10/last6 에 넣지 않습니다.\n" +
"- set: 같은 지문을 공유하는 묶음이면 \"12-14\", 아니면 \"\". set_role: first|member|\"\"\n" +
"- transformation: 원문을 어떻게 바꿔 문제로 만들었는지. {\"technique\":\"빈칸|밑줄어법|네모어법|밑줄어휘|네모어휘|순서분할|문장삽입|문장삭제|요약문|부분삭제|한글화|원문그대로|재진술|기타\",\"blank_position\":\"주제문|첫문장|앞부분|중간|뒷부분|마지막문장|\",\"blank_unit\":\"단어|구|절|문장|\",\"grammar_points\":[" + GRAMMAR.split("·").map(g => '"' + g + '"').join(",") + " 중 해당하는 것만],\"grammar_count\":밑줄·네모 개수,\"order_split\":\"균등3분할|given짧음|given김|4분할|\",\"insert_position\":\"앞|중간|뒤|\",\"underline_count\":숫자,\"vocab_swap\":\"반의어|철자유사|문맥오류|\",\"summary_blanks\":숫자}\n" +
"- distractor: {\"style\":[\"반대진술\",\"부분진실\",\"지문단어재조합\",\"일반화\",\"범위이탈\",\"패러프레이즈\",\"무관\"] 중 해당,\"parallel\":true|false(선지 문법 구조가 평행한가),\"lang\":\"en|ko|mixed\",\"lengths\":[각 선지 글자 수]}\n" +
"- external: 교과서·모의고사 범위 밖 지문(뉴스·창작·외부 교재로 보임)이면 true, 범위 안으로 보이면 false, 판단 불가 null. external_reason: 한 줄.\n" +
"- ko_stem: {\"ending\":\"고르시오|것은?|쓰시오|서술하시오|기타\",\"honorific\":\"하시오|하세요|해라|기타\",\"bracket_points\":true|false,\"kice_like\":0~1 (평가원 표준 발문과 같은 정도)}\n" +
"- subjective: 서술형이면 {\"conditions\":[\"조건 문구 원문 각각\"],\"answer_len\":\"단어수·문장수 지시 원문 또는 \\\"\\\"\",\"rubric_printed\":true|false}, 아니면 null.\n" +
"- features: 문항 특징 한 줄. confidence: 0~1\n\n" +
"[출력 — JSON만]\n" +
'{ "exam_info": { "title": "시험명(학교/학년/학기/과목 추정)", "year": 숫자|null, "semester": 1|2|null, "term": "중간|기말|1차지필|2차지필|기타", "grade": "고1|고2|고3|중3|기타", "subject": "영어|영어I|영어II|영어독해와작문|공통영어|기타", "total_questions": 숫자, "objective": 숫자, "subjective": 숫자, "total_points": 숫자|null, "has_explanations": true|false, "summary": "출제 경향 2~3문장" },\n' +
'  "questions": [ { "number":"1", "type":"", "subtype":"", "format":"", "points":null, "points_printed":false, "difficulty":"중", "difficulty_reason":"", "stem":"", "options":[], "answer":"", "answer_source":"none", "passage":{"has":true,"lang":"en","first10":"","last6":"","words":0,"scale":"보통"}, "set":"", "set_role":"", "transformation":{"technique":"","blank_position":"","blank_unit":"","grammar_points":[],"grammar_count":0,"order_split":"","insert_position":"","underline_count":0,"vocab_swap":"","summary_blanks":0}, "distractor":{"style":[],"parallel":false,"lang":"en","lengths":[]}, "external":null, "external_reason":"", "ko_stem":{"ending":"","honorific":"","bracket_points":false,"kice_like":0.5}, "subjective":null, "features":"", "confidence":0.8 } ] }\n\n' +
memoBlock(o.memo) + "[시험지 텍스트]\n" + (o.carry ? "(앞 부분에서 이어진 세트 지문)\n" + o.carry + "\n---\n" : "") + chunk;
    }

    function index(name, chunk, i, n, memo) {
      return ROLE +
"[작업] 아래는 시험범위 자료 '" + name + "'" + (n > 1 ? " (" + i + "/" + n + " 부분)" : "") + "의 텍스트입니다. 출제에 쓸 수 있는 '지문 단위'를 모두 찾아 목록으로 만드세요.\n" +
"- 지문 = 영어 본문 4문장 이상의 단락(또는 이어지는 단락 묶음). 한 지문은 하나의 항목으로. 교과서면 Lesson/과·Reading 번호, 모의고사면 문항 번호를 src 에 적습니다.\n" +
"- 어휘 목록·문법 설명·한글 해석만 있는 부분은 kind 를 '어휘'/'문법'/'기타'로 표시하고 첫·끝 문구만 기록합니다.\n" +
"- first/last 는 원문에서 '글자 그대로' 복사합니다(검색에 사용됨). first 는 첫 10단어, last 는 마지막 6단어.\n" +
"- topic_idx 는 주제문의 문장 번호(0부터), 없으면 -1. blank_candidates 는 빈칸 문제로 내기 좋은 핵심 개념 문장 번호 최대 3개. grammar_targets 는 어법 문제로 낼 만한 문장과 포인트 최대 5개(포인트 이름은 " + GRAMMAR + " 중).\n" +
"- order_friendly: 연결어·시간 흐름이 뚜렷해 순서 문제에 적합하면 true. insert_friendly: 지시어·대명사 연결이 뚜렷해 삽입 문제에 적합하면 true.\n\n" +
"[출력 — JSON 배열만]\n" +
'[ { "id": "P1", "kind": "지문|어휘|문법|기타", "src": "자료 내 위치", "lesson_key": "L3", "genre": "설명문|논설문|이야기|편지·안내문|대화|기사|기타", "first": "첫 10단어 원문", "last": "마지막 6단어 원문", "gist": "한국어 한 줄 요지", "words": 대략단어수, "feats": ["연결어 뚜렷","시간 흐름","개념 정의","대조·비교","예시 열거","편지·안내문","주장·요지 명확","서술형 적합","인과 관계","문제·해결","일화·서사"], "topic_idx": 1, "blank_candidates": [1,5], "grammar_targets": [{"point":"분사구문","sent":3}], "order_friendly": true, "insert_friendly": false, "difficulty_est": "상|중|하" } ]\n\n' +
memoBlock(memo) + "[자료 텍스트]\n" + chunk;
    }

    // 선생님이 나눠 준 프린트(학습지): 지문 + 포인트(어법·어휘·예상문제·정리)
    function indexHandout(name, chunk, i, n, memo) {
      return ROLE +
"[작업] 아래는 학교 선생님이 학생들에게 나눠 준 프린트(학습지) '" + name + "'" + (n > 1 ? " (" + i + "/" + n + " 부분)" : "") + "의 텍스트입니다. 시험에 무엇이 나올지 예고하는 자료이므로 두 가지를 뽑습니다.\n" +
"1) passages: 영어 본문 지문 단위(4문장 이상). first/last 는 원문 '글자 그대로'(첫 10단어·마지막 6단어). 교과서 지문을 다시 실은 것이면 src 에 그 위치를 적습니다.\n" +
"2) items: 지문 밖의 학습 포인트. kind 는 어법(문법 설명·포인트)|어휘(단어·표현 목록)|예상문제(연습 문제·발문)|정리(요약·핵심 정리). text 는 원문 그대로 80자 이내. 어법이면 point 에 포인트 이름(" + GRAMMAR + " 중), 예상문제면 stem 에 발문을, 어휘면 words 에 영어 단어들을 적습니다.\n\n" +
"[출력 — JSON만]\n" +
'{ "passages": [ { "id": "H1", "src": "위치", "first": "첫 10단어", "last": "마지막 6단어", "gist": "요지 한 줄", "words": 숫자, "feats": [], "topic_idx": -1, "blank_candidates": [], "grammar_targets": [{"point":"","sent":0}] } ],\n' +
'  "items": [ { "kind": "어법|어휘|예상문제|정리", "text": "원문 80자 이내", "point": "", "stem": "", "words": [] } ] }\n\n' +
memoBlock(memo) + "[프린트 텍스트]\n" + chunk;
    }

    function catalogLines(cat, level) {
      return cat.map(p =>
        p.id + " | " + p.kind + " | " + (p.src || "") + " | " + (p.words || "?") + "w" +
        (level < 2 ? " | " + (p.feats || []).join(",") : "") +
        (level < 1 ? " | " + (p.gist || "") : "") +
        " | \"" + String(p.first || "").split(/\s+/).slice(0, level < 2 ? 10 : 6).join(" ") + "\""
      ).join("\n");
    }

    function matchConfirm(qs, candLines, cat, complete, level) {
      return ROLE +
"[작업] 기출 시험지 문항과 시험범위 지문 목록이 있습니다. 각 문항의 지문이 목록의 어느 지문에서 왔는지 확정하세요. 문항 지문은 빈칸·밑줄·순서 분할·문장 삭제 등으로 변형돼 있을 수 있습니다. 문장 대부분이 어절 단위로 일치해야 같은 지문입니다. 주제만 비슷하고 문장이 다르면 다른 지문(외부)입니다.\n" +
"- passage_id 는 후보 id 중 하나 또는 \"\"(범위 밖). 세트 문항은 하나의 지문만.\n" +
"- altered 에는 원문에서 바뀐 부분을 한 줄로(예: \"4번째 문장 빈칸, 7번째 문장 삭제\").\n" +
"- " + (complete ? "범위 자료는 완전합니다. 후보에 없으면 외부 지문(external:true)입니다." : "범위 자료가 불완전할 수 있습니다. 후보에 없으면 external 을 null 로 두세요.") + "\n\n" +
"[출력 — JSON만]\n" +
'{ "matches": [ { "number": "12", "passage_id": "P17", "external": false, "confidence": 0.0, "altered": "" } ] }\n\n' +
"[문항 — 번호 | 유형 | first10 | last6 | 지문 발췌(앞 300자)]\n" +
qs.map(q => q.number + " | " + q.type + " | \"" + (q.passage && q.passage.first10 || "") + "\" | \"" + (q.passage && q.passage.last6 || "") + "\" | " + TEXT.englishOnly(q.rawBlock || "").slice(0, 300)).join("\n") + "\n\n" +
"[후보 — 문항번호: 지문id(점수)…]\n" + candLines + "\n\n" +
"[지문 목록 — id | 종류 | 위치 | 길이 | 첫 문구]\n" + catalogLines(cat, level);
    }

    function aiJudge(signalLines, stems, optionSets, conditions, explanations, prior) {
      return ROLE +
"[작업] 고등학교 영어 기출 시험지가 생성형 AI(GPT 등)의 도움을 받아 만들어졌을 가능성을 텍스트 증거만으로 추정합니다. 확정은 불가능하다는 전제에서, 아래 로컬 신호표와 실제 발문·선지·조건·해설 표본을 보고 '사람 손 흔적'과 'AI 생성 흔적'을 각각 찾으세요.\n" +
"판단 기준(예시): 선지 길이·구조가 지나치게 균일하고 문장부호가 완벽히 일관됨(AI↑) / 띄어쓰기·기호 혼용·문법상 어색한 발문(사람↑) / 선지·해설에 delve, crucial, foster 같은 어휘나 em-dash(AI↑) / 교과서 원문을 그대로 두고 밑줄·빈칸만 낸 흔적(사람↑) / 원문을 매끈하게 재진술(AI↑) / 해설이 선지마다 같은 틀(AI↑) / 이 선생님의 이전 시험과 문체가 갑자기 달라짐(AI↑).\n" +
"지문(영어 본문)은 교과서 원문이므로 근거로 삼지 않습니다. 근거 없는 추측은 하지 않고, 증거가 약하면 llm_score 를 0.5 근처로 두고 confidence 를 낮춥니다.\n\n" +
"[출력 — JSON만]\n" +
'{ "llm_score": 0.0, "confidence": 0.0, "evidence": [ { "signal": "S5|S6|…|기타", "direction": "ai|human|neutral", "quote": "근거 문구 40자 이내", "note": "한 줄" } ], "summary_ko": "2~3문장" }\n\n' +
"[로컬 신호표 — id | 이름 | 점수 | 가중치 | 사용가능]\n" + signalLines + "\n\n" +
"[발문 표본]\n" + stems + "\n[선지 표본]\n" + optionSets + "\n[서술형 조건 표본]\n" + (conditions || "(없음)") + "\n[해설 표본]\n" + (explanations || "(해설 없음)") + "\n[이전 시험과의 비교]\n" + (prior || "(이전 시험 없음)");
    }

    function narrative(compact, stemSamples) {
      return ROLE +
"[작업] 한 고등학교 영어 선생님의 기출 문항 통계와 실제 발문 예시가 있습니다. 이 선생님의 출제 성향을 학원 강사가 학생에게 설명하듯 한국어로 서술하세요. 수치를 근거로 말하되 숫자를 나열하지 말고 습관·경향으로 풀어 씁니다. 통계에 없는 사실을 지어내지 않습니다. 표본이 적은 항목(n<3)은 단정하지 않고 \"~로 보입니다\"로 씁니다.\n" +
"- narrative: 5~8문장. 첫 문장은 한 줄 총평, 이어서 유형 비중·서술형 습관·지문 선호·어법 포인트·변형 습관·프린트(학습지) 반영 정도·최근 변화 순.\n" +
"- keywords: 출제 습관 키워드 5개, 각 12자 이내(예: \"주제문 빈칸\", \"교과서 뒤쪽 편애\").\n" +
"- watchouts: 학생이 대비할 때 주의할 점 3개, 각 40자 이내.\n\n" +
"[출력 — JSON만]\n" +
'{ "narrative": "…", "keywords": ["","","","",""], "watchouts": ["","",""] }\n\n' +
"[통계 요약]\n" + JSON.stringify(compact) + "\n\n[실제 발문 예시 — 유형 | 발문]\n" + stemSamples;
    }

    function refine(compact, blueprint, passageLines, target) {
      return ROLE +
"[작업] 한 선생님의 출제 성향 프로파일과, 통계로 만든 다음 시험(" + target + ") 예측 청사진, 이번 시험범위 지문 목록이 있습니다. 통계가 놓치는 것을 보정해 청사진을 다듬으세요.\n" +
"[규칙]\n" +
"1. 유형별 문항 수는 원안에서 총 20% 이내로만 옮깁니다. 총 문항 수·총점은 바꾸지 않습니다.\n" +
"2. 지문 확률은 p_use 를 ±0.15 안에서만 조정하고, 조정한 지문마다 이유를 씁니다(예: 이 지문은 순서 문제로만 낼 수 있는데 이 선생님은 순서를 안 냄).\n" +
"3. 예측 어법 포인트는 범위 지문에 실제로 그 문법이 있는 문장이 있을 때만 유지합니다.\n" +
"4. 서술형은 이 선생님의 조건 문구 습관(conditions_template)을 그대로 씁니다.\n" +
"5. 근거는 프로파일과 지문 목록에 있는 사실만. 없는 것을 지어내지 않습니다.\n" +
"5-1. 프린트 정보가 있으면(handout) 프린트에 실린 지문·어법 포인트를 그 반영율만큼 우선합니다.\n" +
"6. new_moves 에는 최근 흐름으로 보아 이번에 새로 나올 법한 것 1~3개를 한 줄씩 적습니다(근거 포함).\n\n" +
"[출력 — JSON만]\n" +
'{ "type_plan": [ { "type":"", "subtype":"", "n":0, "points_each":0, "difficulty":"상|중|하" } ],\n' +
'  "passage_adjust": [ { "passage_id":"", "p_use":0.0, "expected_types":[""], "reason":"" } ],\n' +
'  "grammar_points": [ { "point":"", "p":0.0, "reason":"" } ],\n' +
'  "subjective_formats": [ { "subtype":"", "n":0, "p":0.0, "conditions_template":[""] } ],\n' +
'  "new_moves": [""], "notes": "보정 요지 2~3문장", "adjustments": [ { "what":"", "why":"" } ] }\n\n' +
"[프로파일 요약]\n" + JSON.stringify(compact) + "\n\n[원안 청사진]\n" + JSON.stringify(blueprint) + "\n\n" +
"[범위 지문 목록 — id | 위치 | 장르 | 길이 | 특징 | 주제문 | 어법 포인트 | 요지]\n" + passageLines;
    }

    function generateSystem(signature) {
      return ROLE +
"[제작 규칙]\n" +
"1. 문항의 유형·답 형식·배점·난이도는 지시대로. 발문은 [출제자 시그니처]의 발문 표현을 그대로 따릅니다(어미·배점 표기·'윗글' 표현까지).\n" +
"2. 지문은 반드시 [지문 원문]에서 가져와 지시된 변형만 가합니다(빈칸/밑줄/네모/순서 분할/문장 삽입/삭제). 범위 밖 문장을 창작하거나 원문을 재진술하지 않습니다. 변형하지 않은 문장은 원문 어절 그대로 둡니다.\n" +
"3. 객관식 선지는 ①②③④⑤ 다섯 개. 정답은 하나. 선지 언어·길이·구조는 [출제자 시그니처]의 선지 표본을 따르고, 오답은 지시된 오답 습관으로 만듭니다. 같은 선지를 두 번 쓰지 않습니다.\n" +
"4. 글의 순서: given 을 따로 두고 (A)(B)(C) 를 원문 순서가 (A)-(B)-(C) 가 되지 않게 붙입니다. 선지는 ① (A)-(C)-(B) ② (B)-(A)-(C) ③ (B)-(C)-(A) ④ (C)-(A)-(B) ⑤ (C)-(B)-(A) 고정. 정답은 원문 순서.\n" +
"5. 문장 삽입: 주어진 문장을 given 에, 지문에는 ( ① )~( ⑤ ) 자리를 지문 전체에 고르게.\n" +
"6. 세트 문항: 첫 문항에만 지문(passage_html)을 넣고 후속 문항은 passage_html 을 \"\" 로 두고 발문에서 '윗글'로 가리킵니다.\n" +
"7. 서술형: 지시된 subtype 과 조건 문구 템플릿을 그대로 쓰고, 모범답안·채점기준(rubric)을 씁니다.\n" +
"8. passage_html 허용 태그: p, b, u, br 만. 빈칸은 ______, 네모는 (A)(B)(C), 밑줄은 <u>.\n" +
"9. 각 문항에 hit_basis(적중 근거)를 한 줄로: 왜 이 지문·이 유형·이 변형이 이 선생님 성향과 맞는지, 청사진의 수치를 인용.\n" +
"10. 출력은 JSON 만.\n\n" +
"[출제자 시그니처]\n" + signature;
    }
    function generateUser(numbers, target, teacherName, items) {
      return "[작업] 아래 청사진의 문항 " + numbers.join(", ") + "번을 출제합니다. 시험: " + target + " · 선생님: " + teacherName + ".\n\n" +
"[출력 — JSON만]\n" +
'{ "questions": [ { "number":"1", "type":"", "subtype":"", "format":"5지선다|서술형|단답형", "points":0, "difficulty":"상|중|하", "set":"", "set_role":"first|member|",\n' +
'    "stem":"", "given":"", "passage_html":"", "options":["① …","② …","③ …","④ …","⑤ …"], "answer":"③",\n' +
'    "explanation":"정답 근거 + 주요 오답이 틀린 이유 (한국어, 3~5문장)", "hit_basis":"적중 근거 한 줄",\n' +
'    "source":{ "passage_id":"P1" },\n' +
'    "subjective": { "model_answer":"", "conditions":[""], "rubric":[{"item":"","points":0}] } } ] }\n' +
"(객관식이면 subjective 는 null)\n\n" +
"[출제할 문항]\n" +
items.map(it => "■ " + it.number + "번 · " + it.type + (it.subtype ? "(" + it.subtype + ")" : "") + " · " + it.format + " · " + it.points + "점 · 난이도 " + it.difficulty +
  (it.set ? " · 세트 " + it.set + " (" + it.setRole + ")" : "") +
  "\n  변형 지시: " + it.transformHint + "\n  오답 습관: " + it.distractorStyle +
  (it.passage ? "\n  [지문 원문 " + it.passage.id + " · " + (it.passage.src || "") + "]\n" + it.passage.text : "\n  (세트 후속 문항 — 앞 문항의 지문을 씁니다)")).join("\n\n");
    }
    function repair(raw) {
      return "아래 텍스트는 JSON 이어야 하는데 깨져 있습니다. 내용은 바꾸지 말고 문법만 고쳐 유효한 JSON 하나만 출력하세요. 잘린 끝은 가장 가까운 닫는 괄호로 마무리합니다.\n\n" + raw;
    }
    return { ROLE, memoBlock, classify, dataize, index, indexHandout, catalogLines, matchConfirm, aiJudge, narrative, refine, generateSystem, generateUser, repair };
  })();
