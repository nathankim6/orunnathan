
import { QuestionType } from "@/types/question";
import {
  getPurposePrompt,
  getClaimPrompt,
  getImplicationPrompt,
  getMoodPrompt,
  getMainPointPrompt,
  getTopicPrompt,
  getTitlePrompt,
  getVocabularyPrompt,
  getBlankPrompt,
  getBlankMultiplePrompt,
  getIrrelevantPrompt,
  getOrderPrompt,
  getInsertPrompt,
  getSummaryPrompt,
  getSummaryThreeBlanksPrompt,
  getTrueOrFalsePrompt,
  getLogicFlowPrompt,
  getWeekendClinicPrompt,
  getDictionaryPrompt,
  getSummaryBlankPrompt,
  getSummaryBlankWritingPrompt,
  getSummaryVocabPrompt,
  getBlankWritingPrompt,
  getOrderWritingPrompt,
  getOrderWritingKoreanPrompt,
  getTopicWritingPrompt,
  getConditionWritingPrompt,
  getContentMismatchPrompt,
  getContentMatchPrompt,
  getVocabWorkbookPrompt,
  getGrammarWorkbookPrompt,
  getGrammarPrompt,
  getConjunctionPrompt,
  getCollocationPrompt,
  getReferencePrompt,
  getReferenceInferencePrompt,
  getContentInferencePrompt,
  getSeongnamDictionaryPrompt,
  getDialogueMismatchPrompt,
  getSeongnamExampleUsagePrompt,
  getSeongnamUnderlineExamplePrompt,
  getSeongnamQnAPrompt,
  getSeongnamClaimDoublePrompt,
  getSeongnamGrammarVocabPrompt,
  getSeongnamComplexPrompt,
  getSeongnamHumanitiesPrompt,
  getSeongnamMeaningMatchPrompt,
  getSeongnamBlankWordPrompt,
  getSeongnamWordUsagePrompt,
  getSeongnamEnglishDefPrompt,
  getSeongnamBlankABPrompt,
  getSeongnamStudentDialoguePrompt,
  getSeongnamWordExplanationPrompt,
  getSeongnamBlankInappropriateDoublePrompt,
  getSeongnamSummaryTableBlankPrompt,
  getSeongnamSurveyPurposePrompt,
  getGuamDictionaryPrompt,
  getVocabularyThreeBlanksPrompt,
  getGuamTableFillBlanksPrompt,
  getGuamSummaryVocabPrompt,
  getDanggokUnanswerablePrompt,
  
  getCustomQuestionPrompt,
  getContentMatchMultiplePrompt,
  getContentMatchMultipleAnswerPrompt,
  getGrammarCorrectionPrompt,
  getGrammarCorrectionUnderlinePrompt,
  getEnglishDefinitionPrompt,
  getEnglishDefinitionBlankMatchPrompt,
  getGrammarSelectionPrompt,
  getSungeuiDifferentMeaningPrompt,
  getSungeuiAppropriateTranslationPrompt,
  getSungeuiEnglishDefinitionPrompt,
  getSungeuiVocabCorrectionPrompt,
  getSungeuiGrammarCorrectionPrompt,
  getSudoUnderlinedReferencePrompt,
  getSudoHumanitiesThreeBlanksPrompt,
  getReferentInferencePrompt,
  getCombinedQuestionPrompt,
  getDanggokListeningPrompt,
  getHeukseokGrammarMultiplePrompt,
  getHeukseokInferenceInsertPrompt,
  getHeukseokUnanswerableMultiplePrompt,
  getVocabularySelectionPrompt
} from "./prompts";

export const getQuestionTypes = () => [
  // 수능형
  { id: "purpose", name: "[18] 글의 목적" },
  { id: "mood", name: "[19] 심경/분위기" },
  { id: "claim", name: "[20] 주장" },
  { id: "implication", name: "[21] 함축의미" },
  { id: "mainPoint", name: "[22] 요지" },
  { id: "topic", name: "[23] 주제" },
  { id: "title", name: "[24] 제목" },
  { id: "contentMismatch", name: "[25-27] 내용불일치" },
  { id: "contentMatch", name: "[28] 내용일치" },
  { id: "grammar", name: "[29] 어법" },
  { id: "vocabulary", name: "[30] 어휘" },
  { id: "blank", name: "[31] 빈칸" },
  { id: "blankMultiple", name: "[32-34] 빈칸" },
    { id: "irrelevant", name: "[35] 무관한 문장" },
    { id: "order", name: "[36-37] 순서" },
  { id: "insert", name: "[38-39] 문장삽입" },
  { id: "summary", name: "[40] 요약문" },

  // 내신형
  { id: "dictionary", name: "[단어장] 영영사전" },
  { id: "collocation", name: "[단어장] 동반의어 찾기" },
  { id: "reference", name: "[내신형] 사례추론" },
  { id: "contentInference", name: "[내신형] 내용추론" },
  
  { id: "conjunction", name: "[내신형] 연결사" },
  { id: "trueOrFalse", name: "[내신형] True or False" },
  { id: "vocabularyThreeBlanks", name: "[내신형] 어휘(빈칸3개)" },
  { id: "contentMatchMultiple", name: "[내신형] 내용일치(보기)" },
  { id: "contentMatchMultipleAnswer", name: "[내신형] 내용일치(복수정답)" },
  { id: "dialogueMismatch", name: "[내신형] 일치하지않는대화" },
  { id: "englishDefinition", name: "[내신형] 영영풀이", isNew: true },
  { id: "englishDefinitionBlankMatch", name: "[내신형] 영영풀이 빈칸매칭", isNew: true },
  { id: "grammarSelection", name: "[내신형] 어법선택형", isNew: true },
  { id: "referentInference", name: "[내신형] 지칭추론", isNew: true },
  { id: "combinedQuestion", name: "[내신형] 복합출제", isNew: true },
  { id: "sudoUnderlinedReference", name: "[수도] 밑줄 대용어", isNew: true },
  { id: "sudoHumanitiesThreeBlanks", name: "[수도] 인문논술형(빈칸3)", isNew: true },

  // 서답형
  { id: "orderWritingKorean", name: "배열영작(우리말O)" },
  { id: "orderWriting", name: "배열영작(우리말X)" },
  
  { id: "summaryBlank", name: "요약문 빈칸어휘(2개)" },
  { id: "summaryVocab", name: "요약문 빈칸어휘(3개)" },
  { id: "summaryBlankWriting", name: "요약문 빈칸영작" },
  { id: "blankWriting", name: "빈칸영작" },
  { id: "topicWriting", name: "주제문영작" },
  { id: "grammarCorrection", name: "어법수정(밑줄X)", isNew: true },
  { id: "grammarCorrectionUnderline", name: "어법수정(밑줄)", isNew: true },
  { id: "conditionWriting", name: "조건영작", isNew: true },
  { id: "sungeuiVocabCorrection", name: "[숭의] 어휘수정(2개)", isNew: true },
  { id: "sungeuiGrammarCorrection", name: "[숭의] 어법수정", isNew: true },

  // 워크북 제작
  { id: "grammarWorkbook", name: "어법워크북", isNew: true },
  { id: "vocabWorkbook", name: "어휘워크북", isNew: true },

  // 기타 콘텐츠
  { id: "logicFlow", name: "Logic Flow" },
  { id: "sentenceSplitter", name: "한영문장분리" },
  { id: "weekendClinic", name: "주말클리닉" },
  { id: "illustration", name: "삽화제작" },
  { id: "customQuestion", name: "사용자 정의 문항" },

  // 학교별 시그니처
  { id: "seongnamDictionary", name: "[성남] 영영사전" },
  { id: "seongnamExampleUsage", name: "[성남] 단어쓰임(예문)" },
  { id: "seongnamUnderlineExample", name: "[성남] 밑줄예시" },
  { id: "seongnamQnA", name: "[성남] 질문응답" },
  { id: "seongnamClaimDouble", name: "[성남] 주장하는 바(2개)" },
  { id: "seongnamGrammarVocab", name: "[성남] 어법어휘복합" },
  { id: "seongnamComplex", name: "[성남] 문법+어휘+연결사 복합" },
  { id: "seongnamHumanities", name: "[성남] 빈칸(인문논술형)" },
  { id: "seongnamMeaningMatch", name: "[성남] 의미연결", isNew: true },
  { id: "seongnamBlankWord", name: "[성남] 빈칸단어", isNew: true },
  { id: "seongnamWordUsage", name: "[성남] 단어쓰임", isNew: true },
  { id: "seongnamEnglishDef", name: "[성남] 영영풀이", isNew: true },
  { id: "seongnamBlankAB", name: "[성남] 빈칸 (A),(B)", isNew: true },
  { id: "seongnamStudentDialogue", name: "[성남] 학생(1)~(5)대화", isNew: true },
  { id: "seongnamWordExplanation", name: "[성남] 단어설명", isNew: true },
  { id: "seongnamBlankInappropriateDouble", name: "[성남] 빈칸 부적절(2개)", isNew: true },
  { id: "seongnamSummaryTableBlank", name: "[성남] 요약문(표 빈칸)", isNew: true },
  { id: "seongnamSurveyPurpose", name: "[성남] 설문(연구)목적", isNew: true },
  { id: "guamDictionary", name: "[구암] 영영사전" },
  { id: "guamTableFillBlanks", name: "[구암] 표 빈칸 채우기" },
  { id: "guamSummaryVocab", name: "[구암] 요약문+어휘", isNew: true },
  { id: "danggokUnanswerable", name: "[당곡] 답할 수 없는 질문" },
  { id: "sungeuiDifferentMeaning", name: "[숭의] 다른 의미", isNew: true },
  { id: "sungeuiAppropriateTranslation", name: "[숭의] 적절한 번역", isNew: true },
  { id: "sungeuiEnglishDefinition", name: "[숭의] 영영풀이", isNew: true },
  { id: "heukseokGrammarMultiple", name: "[흑석] 틀린어법(복수기호)", isNew: true },
  { id: "heukseokInferenceInsert", name: "[흑석] 밑줄추론(복수)", isNew: true },
  { id: "heukseokUnanswerableMultiple", name: "[흑석] 답할 수 없는 질문(복수)", isNew: true }
];

import { VeritasPair } from './prompts/grammar';

export const getPromptForType = (
  type: QuestionType, 
  text: string, 
  mode: 'basic' | 'advanced' | 'two-blanks' | 'three-blanks' = 'basic', 
  selectedPoints?: string[] | VeritasPair[],
  choiceLanguage?: 'english' | 'korean',
  combinedTypes?: string[],
  paraphraseBlank: boolean = true,
  subType?: 'underline' | 'boxed'
): string => {
  switch (type.id) {
    case "purpose":
      return getPurposePrompt(text);
    case "claim":
      return getClaimPrompt(text);
    case "implication":
      return getImplicationPrompt(text);
    case "mood":
      return getMoodPrompt(text);
    case "mainPoint":
      return getMainPointPrompt(text, choiceLanguage || 'korean');
    case "topic":
      return getTopicPrompt(text);
    case "title":
      return getTitlePrompt(text);
    case "vocabulary":
      return subType === 'boxed' ? getVocabularySelectionPrompt(text) : getVocabularyPrompt(text);
    case "blank":
      return getBlankPrompt(text, paraphraseBlank);
    case "blankMultiple":
      return getBlankMultiplePrompt(text, paraphraseBlank);
    case "irrelevant":
      return getIrrelevantPrompt(text);
    case "order":
      return getOrderPrompt(text, mode as 'basic' | 'advanced');
    case "insert":
      return getInsertPrompt(text);
    case "summary":
      return mode === 'three-blanks' ? getSummaryThreeBlanksPrompt(text) : getSummaryPrompt(text);
    case "trueOrFalse":
      return getTrueOrFalsePrompt(text);
    case "logicFlow":
      return getLogicFlowPrompt(text);
    case "weekendClinic":
      return getWeekendClinicPrompt(text);
    case "customQuestion":
      return getCustomQuestionPrompt(text);
    case "orderWriting":
      return getOrderWritingPrompt(text);
    case "orderWritingKorean":
      return getOrderWritingKoreanPrompt(text);
    case "summaryBlank":
      return getSummaryBlankPrompt(text);
    case "summaryVocab":
      return getSummaryVocabPrompt(text);
    case "summaryBlankWriting":
      return getSummaryBlankWritingPrompt(text);
    case "blankWriting":
      return getBlankWritingPrompt(text);
    case "topicWriting":
      return getTopicWritingPrompt(text);
    case "conditionWriting":
      return getConditionWritingPrompt(text);
    case "contentMismatch":
      return getContentMismatchPrompt(text, choiceLanguage || 'english');
    case "contentMatch":
      return getContentMatchPrompt(text, choiceLanguage || 'english');
    case "vocabWorkbook":
      return getVocabWorkbookPrompt(text);
    case "grammarWorkbook":
      return getGrammarWorkbookPrompt(text);
    case "grammar":
      if (subType === 'boxed') {
        return getGrammarSelectionPrompt(text);
      }
      // selectedPoints가 VeritasPair[] 타입인지 확인
      if (selectedPoints && selectedPoints.length > 0 && typeof selectedPoints[0] === 'object' && 'correct' in selectedPoints[0]) {
        return getGrammarPrompt(text, selectedPoints as VeritasPair[]);
      }
      return getGrammarPrompt(text);
    case "conjunction":
      return getConjunctionPrompt(text);
    case "collocation":
      return getCollocationPrompt(text);
    case "reference":
      return getReferencePrompt(text);
    case "referenceInference":
      return getReferenceInferencePrompt(text);
    case "contentInference":
      return getContentInferencePrompt(text);
    case "dictionary":
      return getDictionaryPrompt(text);
    case "seongnamDictionary":
      return getSeongnamDictionaryPrompt(text);
    case "seongnamExampleUsage":
      return getSeongnamExampleUsagePrompt(text);
    case "seongnamUnderlineExample":
      return getSeongnamUnderlineExamplePrompt(text);
    case "seongnamQnA":
      return getSeongnamQnAPrompt(text);
    case "seongnamClaimDouble":
      return getSeongnamClaimDoublePrompt(text);
    case "seongnamGrammarVocab":
      return getSeongnamGrammarVocabPrompt(text);
    case "seongnamComplex":
      return getSeongnamComplexPrompt(text);
    case "seongnamHumanities":
      return getSeongnamHumanitiesPrompt(text);
    case "seongnamMeaningMatch":
      return getSeongnamMeaningMatchPrompt(text);
    case "seongnamBlankWord":
      return getSeongnamBlankWordPrompt(text);
    case "seongnamWordUsage":
      return getSeongnamWordUsagePrompt(text);
    case "seongnamEnglishDef":
      return getSeongnamEnglishDefPrompt(text);
    case "seongnamBlankAB":
      return getSeongnamBlankABPrompt(text);
    case "seongnamStudentDialogue":
      return getSeongnamStudentDialoguePrompt(text);
    case "seongnamWordExplanation":
      return getSeongnamWordExplanationPrompt(text);
    case "seongnamBlankInappropriateDouble":
      return getSeongnamBlankInappropriateDoublePrompt(text);
    case "seongnamSummaryTableBlank":
      return getSeongnamSummaryTableBlankPrompt(text);
    case "seongnamSurveyPurpose":
      return getSeongnamSurveyPurposePrompt(text);
    case "guamDictionary":
      return getGuamDictionaryPrompt(text);
    case "guamTableFillBlanks":
      return getGuamTableFillBlanksPrompt(text);
    case "guamSummaryVocab":
      return getGuamSummaryVocabPrompt(text);
    case "danggokUnanswerable":
      return getDanggokUnanswerablePrompt(text);
    case "vocabularyThreeBlanks":
      return getVocabularyThreeBlanksPrompt(text);
    case "contentMatchMultiple":
      return getContentMatchMultiplePrompt(text);
    case "contentMatchMultipleAnswer":
      return getContentMatchMultipleAnswerPrompt(text);
    case "dialogueMismatch":
      return getDialogueMismatchPrompt(text);
    case "englishDefinition":
      return getEnglishDefinitionPrompt(text);
    case "englishDefinitionBlankMatch":
      return getEnglishDefinitionBlankMatchPrompt(text);
    case "grammarSelection":
      return getGrammarSelectionPrompt(text);
    case "grammarCorrection":
      return getGrammarCorrectionPrompt(text);
    case "grammarCorrectionUnderline":
      return getGrammarCorrectionUnderlinePrompt(text);
    case "sungeuiDifferentMeaning":
      return getSungeuiDifferentMeaningPrompt(text);
    case "sungeuiAppropriateTranslation":
      return getSungeuiAppropriateTranslationPrompt(text);
    case "sungeuiEnglishDefinition":
      return getSungeuiEnglishDefinitionPrompt(text);
    case "sungeuiVocabCorrection":
      return getSungeuiVocabCorrectionPrompt(text);
    case "sungeuiGrammarCorrection":
      return getSungeuiGrammarCorrectionPrompt(text);
    case "sudoUnderlinedReference":
      return getSudoUnderlinedReferencePrompt(text);
    case "sudoHumanitiesThreeBlanks":
      return getSudoHumanitiesThreeBlanksPrompt(text);
    case "referentInference":
      return getReferentInferencePrompt(text);
    case "combinedQuestion":
      return getCombinedQuestionPrompt(text, combinedTypes || []);
    case "danggokListening":
      return getDanggokListeningPrompt(text);
    case "heukseokGrammarMultiple":
      return getHeukseokGrammarMultiplePrompt(text);
    case "heukseokInferenceInsert":
      return getHeukseokInferenceInsertPrompt(text);
    case "heukseokUnanswerableMultiple":
      return getHeukseokUnanswerableMultiplePrompt(text);
    default:
      return `Generate a question of type ${type.name} based on the following text: ${text}`;
  }
};
