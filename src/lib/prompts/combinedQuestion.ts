export const COMBINED_QUESTION_OPTIONS = [
  // 수능형
  { id: 'purpose', name: '[18] 글의 목적', description: '글의 목적 파악', category: '수능형' },
  { id: 'mood', name: '[19] 심경/분위기', description: '글의 심경/분위기', category: '수능형' },
  { id: 'claim', name: '[20] 주장', description: '필자의 주장', category: '수능형' },
  { id: 'implication', name: '[21] 함축의미', description: '밑줄 친 부분의 함축의미', category: '수능형' },
  { id: 'mainPoint', name: '[22] 요지', description: '글의 요지 파악', category: '수능형' },
  { id: 'topic', name: '[23] 주제', description: '글의 주제 파악', category: '수능형' },
  { id: 'title', name: '[24] 제목', description: '글의 제목 추론', category: '수능형' },
  { id: 'contentMismatch', name: '[25-27] 내용불일치', description: '내용과 일치하지 않는 것', category: '수능형' },
  { id: 'contentMatch', name: '[28] 내용일치', description: '내용과 일치하는 것', category: '수능형' },
  { id: 'grammar', name: '[29] 어법', description: '어법상 틀린 것', category: '수능형' },
  { id: 'vocabulary', name: '[30] 어휘', description: '문맥상 어휘 적절성', category: '수능형' },
  { id: 'blank', name: '[31] 빈칸', description: '빈칸에 들어갈 말', category: '수능형' },
  { id: 'blankMultiple', name: '[32-34] 빈칸', description: '빈칸 추론(긴 지문)', category: '수능형' },
  { id: 'irrelevant', name: '[35] 무관한 문장', description: '글의 흐름과 무관한 문장', category: '수능형' },
  { id: 'order', name: '[36-37] 순서', description: '글의 순서 배열', category: '수능형' },
  { id: 'insert', name: '[38-39] 문장삽입', description: '주어진 문장 위치 찾기', category: '수능형' },
  { id: 'summary', name: '[40] 요약문', description: '요약문 빈칸 (A)(B)', category: '수능형' },

  // 단어장
  { id: 'dictionary', name: '[단어장] 영영사전', description: '단어의 영영 정의', category: '단어장' },
  { id: 'collocation', name: '[단어장] 동반의어', description: '함께 쓰이는 표현', category: '단어장' },

  // 내신형
  { id: 'reference', name: '[내신형] 사례추론', description: '밑줄 친 사례 추론', category: '내신형' },
  { id: 'contentInference', name: '[내신형] 내용추론', description: '내용 추론', category: '내신형' },
  { id: 'conjunction', name: '[내신형] 연결사', description: '빈칸에 들어갈 연결사 (A)(B)', category: '내신형' },
  { id: 'trueOrFalse', name: '[내신형] T/F', description: '내용 일치 여부 판단', category: '내신형' },
  { id: 'vocabularyThreeBlanks', name: '[내신형] 어휘(빈칸3)', description: '어휘 빈칸 3개', category: '내신형' },
  { id: 'contentMatchMultiple', name: '[내신형] 내용일치(보기)', description: '보기 기반 내용일치', category: '내신형' },
  { id: 'contentMatchMultipleAnswer', name: '[내신형] 내용일치(복수)', description: '복수정답 내용일치', category: '내신형' },
  { id: 'dialogueMismatch', name: '[내신형] 일치X 대화', description: '일치하지 않는 대화', category: '내신형' },
  { id: 'englishDefinition', name: '[내신형] 영영풀이', description: '단어의 영영 정의', category: '내신형' },
  { id: 'grammarSelection', name: '[내신형] 어법선택', description: '괄호 안 어법 선택', category: '내신형' },
  { id: 'referentInference', name: '[내신형] 지칭추론', description: '대명사 지칭 대상 추론', category: '내신형' },

  // 서답형
  { id: 'orderWritingKorean', name: '[서답] 배열영작(한O)', description: '한글O 배열영작', category: '서답형' },
  { id: 'orderWriting', name: '[서답] 배열영작(한X)', description: '한글X 배열영작', category: '서답형' },
  { id: 'summaryBlank', name: '[서답] 요약빈칸어휘(2)', description: '요약문 빈칸 어휘 2개', category: '서답형' },
  { id: 'summaryVocab', name: '[서답] 요약빈칸어휘(3)', description: '요약문 빈칸 어휘 3개', category: '서답형' },
  { id: 'summaryBlankWriting', name: '[서답] 요약빈칸영작', description: '요약문 빈칸 영작', category: '서답형' },
  { id: 'blankWriting', name: '[서답] 빈칸영작', description: '빈칸 직접 영작', category: '서답형' },
  { id: 'topicWriting', name: '[서답] 주제영작', description: '주제문 직접 영작', category: '서답형' },
  { id: 'grammarCorrection', name: '[서답] 어법수정(밑줄X)', description: '어법 틀린 부분 찾기', category: '서답형' },
  { id: 'grammarCorrectionUnderline', name: '[서답] 어법수정(밑줄)', description: '밑줄 친 어법 수정', category: '서답형' },
  { id: 'conditionWriting', name: '[서답] 조건영작', description: '조건에 맞춰 영작', category: '서답형' },

  // 학교별 시그니처
  { id: 'seongnamDictionary', name: '[성남] 영영사전', description: '성남 영영사전', category: '학교별' },
  { id: 'seongnamExampleUsage', name: '[성남] 단어쓰임(예문)', description: '단어 쓰임 예문', category: '학교별' },
  { id: 'seongnamUnderlineExample', name: '[성남] 밑줄예시', description: '밑줄 예시', category: '학교별' },
  { id: 'seongnamQnA', name: '[성남] 질문응답', description: '질문 응답', category: '학교별' },
  { id: 'seongnamClaimDouble', name: '[성남] 주장(2개)', description: '주장하는 바 2개', category: '학교별' },
  { id: 'seongnamGrammarVocab', name: '[성남] 어법어휘복합', description: '어법+어휘 복합', category: '학교별' },
  { id: 'seongnamComplex', name: '[성남] 문법어휘연결사', description: '문법+어휘+연결사', category: '학교별' },
  { id: 'seongnamHumanities', name: '[성남] 빈칸(인문)', description: '인문논술형 빈칸', category: '학교별' },
  { id: 'seongnamMeaningMatch', name: '[성남] 의미연결', description: '의미 연결', category: '학교별' },
  { id: 'seongnamBlankWord', name: '[성남] 빈칸단어', description: '빈칸 단어', category: '학교별' },
  { id: 'seongnamWordUsage', name: '[성남] 단어쓰임', description: '단어 쓰임', category: '학교별' },
  { id: 'seongnamEnglishDef', name: '[성남] 영영풀이', description: '성남 영영풀이', category: '학교별' },
  { id: 'seongnamBlankAB', name: '[성남] 빈칸(A)(B)', description: '빈칸 (A)(B)', category: '학교별' },
  { id: 'seongnamStudentDialogue', name: '[성남] 학생대화', description: '학생 (1)~(5) 대화', category: '학교별' },
  { id: 'seongnamWordExplanation', name: '[성남] 단어설명', description: '단어 설명', category: '학교별' },
  { id: 'seongnamBlankInappropriateDouble', name: '[성남] 빈칸부적절(2)', description: '빈칸 부적절 2개', category: '학교별' },
  { id: 'seongnamSummaryTableBlank', name: '[성남] 요약(표 빈칸)', description: '요약문 표 빈칸', category: '학교별' },
  { id: 'seongnamSurveyPurpose', name: '[성남] 설문목적', description: '설문/연구 목적', category: '학교별' },
  { id: 'guamDictionary', name: '[구암] 영영사전', description: '구암 영영사전', category: '학교별' },
  { id: 'guamTableFillBlanks', name: '[구암] 표 빈칸', description: '표 빈칸 채우기', category: '학교별' },
  { id: 'danggokUnanswerable', name: '[당곡] 답할수없는질문', description: '답할 수 없는 질문', category: '학교별' },
  { id: 'sungeuiDifferentMeaning', name: '[숭의] 다른 의미', description: '다른 의미', category: '학교별' },
  { id: 'sungeuiAppropriateTranslation', name: '[숭의] 적절한 번역', description: '적절한 번역', category: '학교별' },
  { id: 'sungeuiEnglishDefinition', name: '[숭의] 영영풀이', description: '숭의 영영풀이', category: '학교별' },
  { id: 'sungeuiVocabCorrection', name: '[숭의] 어휘수정(2)', description: '어휘 수정 2개', category: '학교별' },
  { id: 'sungeuiGrammarCorrection', name: '[숭의] 어법수정', description: '어법 수정', category: '학교별' },
  { id: 'sudoUnderlinedReference', name: '[수도] 밑줄 대용어', description: '밑줄 대용어', category: '학교별' },
  { id: 'sudoHumanitiesThreeBlanks', name: '[수도] 인문(빈칸3)', description: '인문논술형 빈칸 3', category: '학교별' },

  // 워크북
  { id: 'grammarWorkbook', name: '[워크북] 어법', description: '어법 워크북', category: '워크북' },
  { id: 'vocabWorkbook', name: '[워크북] 어휘', description: '어휘 워크북', category: '워크북' },
] as const;

const TYPE_INSTRUCTIONS: Record<string, string> = {
  purpose: `**[목적]** 다음 글의 목적으로 가장 적절한 것은? [3점]
- 한국어 선택지 5개 (① ~ ⑤), "~하기 위해" 형태`,
  mood: `**[심경/분위기]** 다음 글에 드러난 ~의 심경(분위기)으로 가장 적절한 것은? [3점]
- 영어 선택지 5개, 두 단어 형용사 조합 (예: relieved and grateful)`,
  claim: `**[주장]** 다음 글에서 필자가 주장하는 바로 가장 적절한 것은? [3점]
- 한국어 선택지 5개`,
  implication: `**[함축의미]** 밑줄 친 "..."이(가) 다음 글에서 의미하는 바로 가장 적절한 것은? [3점]
- 지문 안의 핵심 표현 한 곳에 <u>...</u>로 밑줄 (질문 텍스트 안에는 <u> 태그 사용 금지, 쌍따옴표만 사용)
- 영어 선택지 5개 (① ~ ⑤)`,
  mainPoint: `**[요지]** 윗글의 요지로 가장 적절한 것은? [3점]
- 한국어 선택지 5개 (① ~ ⑤)`,
  topic: `**[주제]** 윗글의 주제로 가장 적절한 것은? [3점]
- 영어 선택지 5개 (① ~ ⑤), 명사구 형태`,
  title: `**[제목]** 윗글의 제목으로 가장 적절한 것은? [4.3점]
- 영어 선택지 5개 (① ~ ⑤), 따옴표("...")로 감싼 명사구 형태`,
  contentMismatch: `**[내용불일치]** 윗글의 내용과 일치하지 않는 것은? [4점]
- 영어 또는 한국어 선택지 5개 (① ~ ⑤)`,
  contentMatch: `**[내용일치]** 윗글의 내용과 일치하는 것은? [4.2점]
- 영어 선택지 5개 (① ~ ⑤), 평서문 형태`,
  grammar: `**[어법]** 다음 글의 밑줄 친 부분 중, 어법상 틀린 것은? [3점]
- 지문 안에 ①<u>...</u> ~ ⑤<u>...</u> 다섯 개 표현 밑줄
- 4개는 어법상 적절, 1개만 부적절`,
  vocabulary: `**[어휘]** 다음 글의 밑줄 친 부분 중, 문맥상 낱말의 쓰임이 적절하지 않은 것은? [3점]
- 지문 안에 ①<u>word</u> ~ ⑤<u>word</u> 다섯 개 **단일 단어(single word)** 만 밑줄. 구(phrase)나 두 단어 이상 절대 금지 (예: "48% more likely" ❌, "happy and healthy" ❌). 반드시 한 단어만.
- 🚨 ①~⑤ 마커는 지문 전체에 **고르게 분산**되어야 함. 지문을 처음/중간/끝 3구간으로 나눠 각 구간에 최소 1개씩 배치. ①은 첫 1~2문장 안, ⑤는 마지막 1~2문장 안. 한 문장에 2개 이상 몰리거나 지문 후반부에 ③④⑤가 몰리는 것 절대 금지.
- 4개는 적절, 1개만 부적절`,
  blank: `**[빈칸]** 다음 빈칸에 들어갈 말로 가장 적절한 것은? [3점]
- 지문의 핵심 부분에 ___________ 빈칸 처리
- 영어 선택지 5개`,
  blankMultiple: `**[빈칸 추론]** 다음 빈칸에 들어갈 말로 가장 적절한 것은? [3점]
- 지문 핵심 부분에 ___________ 빈칸
- 영어 선택지 5개 (paraphrase 기반)`,
  irrelevant: `**[무관한 문장]** 다음 글에서 전체 흐름과 관계 없는 문장은? [3점]
- 원문에 1개의 무관한 문장을 삽입하고 ① ~ ⑤로 번호`,
  order: `**[순서]** 주어진 글 다음에 이어질 글의 순서로 가장 적절한 것은? [3점]
- (A), (B), (C) 세 단락 제시
- 5개 선택지: (A)-(C)-(B) 등 순서 조합`,
  insert: `**[문장삽입]** 글의 흐름으로 보아, 주어진 문장이 들어가기에 가장 적절한 곳은? [3점]
- 주어진 문장 박스 + 지문 안에 ① ~ ⑤ 위치 표시`,
  summary: `**[요약문]** 다음 글의 내용을 한 문장으로 요약하고자 한다. 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은? [3점]
- 요약문 한 문장 + (A) (B) 빈칸
- 5개 선택지: "(A) word ⋯ (B) word" 형태`,
  dictionary: `**[단어 뜻]** 다음 글의 밑줄 친 단어의 문맥상 의미로 가장 적절한 것은? [3점]
- 지문 안의 단어 한 곳에 <u>...</u>로 밑줄
- 5개 한국어 뜻 선택지 (① ~ ⑤)`,
  collocation: `**[연어]** 다음 글의 빈칸에 들어갈 말로 가장 적절한 것은? [3점]
- 지문에서 collocation(연어) 패턴의 한 단어를 빈칸 처리
- 5개 영단어 선택지 (① ~ ⑤)`,
  reference: `**[사례추론]** 윗글의 사례에 해당하는 것으로 가장 적절한 것은? [3점]
- 한국어 또는 영어 사례 5개 선택지`,
  contentInference: `**[내용추론]** 윗글에서 추론할 수 있는 내용으로 가장 적절한 것은? [3점]
- 한국어 선택지 5개 (① ~ ⑤)`,
  conjunction: `**[연결사]** 다음 빈칸 (A), (B)에 들어갈 말로 가장 적절한 것은? [3점]
- 지문에 두 개의 빈칸 (A), (B) 표시
- 5개 선택지: "(A) However ⋯ (B) Therefore" 형태`,
  trueOrFalse: `**[T/F]** 다음 글의 내용과 일치하면 T, 일치하지 않으면 F를 쓰시오. [4점]
- 한국어 문장 4~5개 제시, 각 문장 옆에 (T/F) 표기`,
  vocabularyThreeBlanks: `**[어휘 빈칸3]** 다음 글의 빈칸 (A), (B), (C)에 들어갈 말로 가장 적절한 것은? [3점]
- 지문에 (A), (B), (C) 세 개의 빈칸 + 각각 두 단어 옵션 / 표시
- 5개 선택지: "(A) ⋯ (B) ⋯ (C)" 조합`,
  contentMatchMultiple: `**[내용일치-보기]** 다음 <보기> 중 윗글의 내용과 일치하는 것을 모두 고른 것은? [3점]
- <보기>에 ㄱ, ㄴ, ㄷ, ㄹ 4개 진술 + 5개 조합 선택지`,
  contentMatchMultipleAnswer: `**[내용일치-복수정답]** 윗글의 내용과 일치하는 것을 2개 고르시오. [4점]
- 영어/한국어 선택지 5개 중 정답 2개`,
  dialogueMismatch: `**[일치X 대화]** 윗글의 내용과 일치하지 않는 대화는? [3점]
- 5개의 짧은 대화 보기 중 1개가 본문과 불일치`,
  englishDefinition: `**[영영풀이]** 다음 글의 밑줄 친 단어의 영영 정의로 가장 적절한 것은? [3점]
- 지문 안의 핵심 단어 한 곳에 <u>...</u>로 밑줄
- 5개 영어 정의 선택지 (① ~ ⑤)`,
  grammarSelection: `**[어법선택]** (A), (B), (C)의 각 네모 안에서 어법에 맞는 표현으로 가장 적절한 것은? [3점]
- 지문 안에 (A) [option1 / option2], (B) [option1 / option2], (C) [option1 / option2]
- 5개 선택지: "(A) ⋯ (B) ⋯ (C)" 조합`,
  referentInference: `**[지칭추론]** 밑줄 친 ① ~ ⑤ 중에서 가리키는 대상이 나머지 넷과 다른 것은? [3점]
- 지문 안에 ①<u>...</u> ~ ⑤<u>...</u> 5개 대명사/명사 밑줄`,
  orderWritingKorean: `**[배열영작-한O]** 우리말과 같은 뜻이 되도록 주어진 단어를 배열하시오. [4점]
- 우리말 해석 + 단어 박스 제시 (서답형)
- [정답]에 완성된 영어 문장`,
  orderWriting: `**[배열영작-한X]** 주어진 단어들을 알맞게 배열하여 문장을 완성하시오. [4점]
- 단어 박스만 제시 (서답형)
- [정답]에 완성된 영어 문장`,
  summaryBlank: `**[요약빈칸어휘2]** 요약문의 (A), (B)에 들어갈 말을 본문에서 찾아 쓰시오. [4점]
- 서답형, [정답]에 (A) word, (B) word`,
  summaryVocab: `**[요약빈칸어휘3]** 요약문의 (A), (B), (C)에 들어갈 말을 본문에서 찾아 쓰시오. [4점]
- 서답형, [정답]에 (A), (B), (C) 단어`,
  summaryBlankWriting: `**[요약빈칸영작]** 요약문의 빈칸에 들어갈 말을 영어로 쓰시오. [4점]
- 서답형, [정답]에 영어 표현`,
  blankWriting: `**[빈칸영작]** 다음 빈칸에 들어갈 말을 영어로 쓰시오. [4점]
- 지문 핵심 부분에 ___________ 빈칸 (서답형)`,
  topicWriting: `**[주제영작]** 다음 글의 주제를 영어로 쓰시오. [4점]
- 서답형, [정답]에 영어 명사구`,
  grammarCorrection: `**[어법수정-밑줄X]** 다음 글에서 어법상 틀린 부분을 2개 찾아 바르게 고치시오. [4점]
- 지문에 ① ~ ⑤ 5개 표현 표시 중 2개가 어법상 틀림`,
  grammarCorrectionUnderline: `**[어법수정-밑줄]** 다음 글의 밑줄 친 부분 중, 어법상 틀린 것을 모두 찾아 바르게 고치시오. [4점]
- 지문 안 ①<u>...</u> ~ ⑤<u>...</u> 밑줄 표시
- [정답]에 번호 + 고친 표현`,
  conditionWriting: `**[조건영작]** 주어진 <조건>에 맞게 영어로 쓰시오. [5점]
- <조건> 박스 + 우리말 또는 상황 제시 (서답형)`,
  // 학교별/워크북은 단순 안내 사용
  seongnamDictionary: `**[성남-영영사전]** 학교 시그니처 영영사전 형식으로 1문항 출제. 형식은 해당 유형 표준을 따르고, 한국어 [정답][해설] 작성.`,
  seongnamExampleUsage: `**[성남-단어쓰임(예문)]** 학교 시그니처 형식으로 1문항 출제.`,
  seongnamUnderlineExample: `**[성남-밑줄예시]** 학교 시그니처 형식으로 1문항 출제.`,
  seongnamQnA: `**[성남-질문응답]** 학교 시그니처 형식으로 1문항 출제.`,
  seongnamClaimDouble: `**[성남-주장(2개)]** 학교 시그니처 형식으로 1문항 출제.`,
  seongnamGrammarVocab: `**[성남-어법어휘복합]** 학교 시그니처 형식으로 1문항 출제.`,
  seongnamComplex: `**[성남-문법어휘연결사]** 학교 시그니처 형식으로 1문항 출제.`,
  seongnamHumanities: `**[성남-빈칸(인문)]** 학교 시그니처 인문논술형 빈칸 1문항 출제.`,
  seongnamMeaningMatch: `**[성남-의미연결]** 학교 시그니처 형식으로 1문항 출제.`,
  seongnamBlankWord: `**[성남-빈칸단어]** 학교 시그니처 형식으로 1문항 출제.`,
  seongnamWordUsage: `**[성남-단어쓰임]** 학교 시그니처 형식으로 1문항 출제.`,
  seongnamEnglishDef: `**[성남-영영풀이]** 학교 시그니처 형식으로 1문항 출제.`,
  seongnamBlankAB: `**[성남-빈칸(A)(B)]** 학교 시그니처 형식으로 1문항 출제.`,
  seongnamStudentDialogue: `**[성남-학생대화]** 학생 (1)~(5) 대화 형식으로 1문항 출제.`,
  seongnamWordExplanation: `**[성남-단어설명]** 학교 시그니처 형식으로 1문항 출제.`,
  seongnamBlankInappropriateDouble: `**[성남-빈칸부적절(2)]** 학교 시그니처 형식으로 1문항 출제.`,
  seongnamSummaryTableBlank: `**[성남-요약(표 빈칸)]** 표 형태 요약문 빈칸 1문항 출제.`,
  seongnamSurveyPurpose: `**[성남-설문목적]** 설문/연구 목적 1문항 출제.`,
  guamDictionary: `**[구암-영영사전]** 학교 시그니처 영영사전 1문항 출제.`,
  guamTableFillBlanks: `**[구암-표 빈칸]** 표 빈칸 채우기 1문항 출제.`,
  danggokUnanswerable: `**[당곡-답할수없는질문]** 답할 수 없는 질문 1문항 출제.`,
  sungeuiDifferentMeaning: `**[숭의-다른의미]** 1문항 출제.`,
  sungeuiAppropriateTranslation: `**[숭의-적절한번역]** 1문항 출제.`,
  sungeuiEnglishDefinition: `**[숭의-영영풀이]** 1문항 출제.`,
  sungeuiVocabCorrection: `**[숭의-어휘수정(2)]** 어휘 수정 2개 1문항 출제 (서답형).`,
  sungeuiGrammarCorrection: `**[숭의-어법수정]** 어법 수정 1문항 출제 (서답형).`,
  sudoUnderlinedReference: `**[수도-밑줄 대용어]** 밑줄 대용어 1문항 출제.`,
  sudoHumanitiesThreeBlanks: `**[수도-인문(빈칸3)]** 인문논술형 빈칸 3개 1문항 출제.`,
  grammarWorkbook: `**[워크북-어법]** 어법 워크북 1세트 출제.`,
  vocabWorkbook: `**[워크북-어휘]** 어휘 워크북 1세트 출제.`,
};

export const getCombinedQuestionPrompt = (text: string, selectedTypes: string[]) => {
  const types = (selectedTypes && selectedTypes.length > 0) ? selectedTypes : ['title', 'contentMatch'];
  const instructionsBlock = types.map((t, i) => {
    const inst = TYPE_INSTRUCTIONS[t];
    if (!inst) return '';
    return `\n--- 문항 ${i + 1} ---\n${inst}`;
  }).join('\n');

  // Build the output skeleton dynamically so the AI sees the exact target layout.
  const questionBlocks = types
    .map((_, i) => `[문항 ${i + 1} 지시문 및 선택지 — 지문 재인용 금지]`)
    .join('\n\n');
  const answerBlocks = types
    .map((_, i) => `[문항 ${i + 1}]\n[정답] ?\n[해설] ...`)
    .join('\n\n');

  return `주어진 영어 지문 하나를 사용하여 ${types.length}개의 서로 다른 유형의 문제를 한 번에 출제해 주세요. 모든 문항이 같은 지문을 공유합니다.

⚠️ 가장 중요한 규칙 (절대 위반 금지):
- 지문(passage)은 출력 전체에서 정확히 **한 번만** 등장해야 합니다.
- 두 번째, 세 번째 문항을 위해 지문을 다시 출력하거나 일부분이라도 재인용하지 마세요.
- 마커(①~⑤, <u>...</u>, 빈칸 ___, (A)/(B)/(C) 표시 등)가 필요한 유형이 여러 개 포함되어 있어도, **모든 마커를 하나의 공유 지문에 통합 표시**하세요.
  · 예: 어법(①~⑤ 밑줄)과 어휘(①~⑤ 밑줄)가 같이 선택되면 → 하나의 지문 안에 ①~⑤ 밑줄을 한 세트로만 두고, 두 문항 모두 그 동일한 마커를 참조합니다.
  · 어휘+함축의미가 같이 선택되면 → 어휘용 ①~⑤와 함축용 <u>...</u>를 같은 지문에 함께 표시합니다.
  · 빈칸 유형이 두 개 선택되면 → 한 지문 내에서 빈칸을 (A), (B)로 구분하여 한 번만 표시합니다.
- 만약 마커 충돌로 통합이 불가능하다면, 마커가 필요 없는 유형(주제/제목/요지/내용일치 등) 위주로 출제하고 마커 유형은 제외하세요.

규칙:
1. 출력 맨 위 첫 줄에 정확히 "다음 글을 읽고 물음에 답하시오." 라고 적습니다. (다른 문구/번호/마크다운 금지)
2. 그 바로 다음 줄부터 영어 지문을 단 한 번만 출력합니다.
3. 지문 다음에 ${types.length}개의 문항 지시문과 선택지를 빈 줄로 분리하여 순서대로 출력합니다.
4. **개별 문항 앞에 "14.", "15.", "16." 같은 문제 번호를 절대 붙이지 마세요.** 여러 문항이 모두 같은 하나의 문제 번호를 공유합니다. 각 문항의 시작은 그 유형의 표준 지시문(예: "윗글의 제목으로 가장 적절한 것은? [4.3점]")으로만 시작합니다.
5. 모든 문항(지시문 + 선택지) 출력이 끝난 뒤, 단 한 번 "===== 정답 및 해설 =====" 구분선을 출력합니다.
6. 구분선 아래에 각 문항의 정답과 해설을 "[문항 1]" / "[문항 2]" 머리표와 함께 한국어로 작성합니다. ([정답] / [해설] 줄을 분리해서 표기)
7. <u>...</u> 태그를 정확히 사용하고, ** 굵게 마크다운은 사용하지 마세요.
8. 정답 번호는 ①~⑤ 중 무작위로 고르게 분포되도록 하세요.
9. 원본 지문의 무결성을 절대적으로 유지해야 합니다 (단어 변경/삭제 금지, 마커 표시만 추가).

각 문항별 형식 (반드시 준수):
${instructionsBlock}

출력 형식 (정확히 이 순서로, 지문은 단 한 번만, 문항 번호는 붙이지 않음):
다음 글을 읽고 물음에 답하시오.

[영어 지문 - 모든 마커가 통합 표시된 단일 버전]

(여기에 반드시 빈 줄 한 줄)

${questionBlocks}

===== 정답 및 해설 =====
${answerBlocks}

영어 지문: ${text}`;
};
