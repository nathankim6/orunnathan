import { getQuestionTypes } from './questionTypes';

export interface QuestionCategory {
  id: string;
  name: string;
  questions: any[];
}

// 통일된 카테고리 분류 로직
export const getQuestionCategories = (): QuestionCategory[] => {
  const questionTypes = getQuestionTypes();
  
  return [
    {
      id: 'suneung',
      name: '수능형',
      questions: questionTypes.filter(type => 
        type.id.match(/^(purpose|mood|claim|implication|mainPoint|topic|title|contentMismatch|contentMatch|vocabulary|blank|blankMultiple|irrelevant|order|insert|summary|grammar)$/)
      )
    },
    {
      id: 'vocabulary',
      name: '단어장',
      questions: questionTypes.filter(type =>
        type.id.match(/^(dictionary|collocation|seongnamMeaningMatch|seongnamBlankWord|seongnamWordUsage|seongnamEnglishDef|seongnamWordExplanation|sungeuiAppropriateTranslation|sungeuiEnglishDefinition)$/)
      )
    },
    {
      id: 'naesin', 
      name: '내신형',
      questions: questionTypes.filter(type => 
        type.id.match(/^(reference|contentInference|referenceInference|conjunction|trueOrFalse|vocabularyThreeBlanks|contentMatchMultiple|contentMatchMultipleAnswer|dialogueMismatch|englishDefinition|englishDefinitionBlankMatch|grammarSelection|referentInference|combinedQuestion|danggokListening)$/)
      )
    },
    {
      id: 'schoolSignature',
      name: '학교별 시그니처',
      questions: questionTypes.filter(type => 
        type.id.match(/^(seongnam|guam|danggok|sungeui|sudo|heukseok)/) && !['seongnamMeaningMatch', 'seongnamBlankWord', 'seongnamWordUsage', 'seongnamEnglishDef', 'seongnamWordExplanation', 'sungeuiAppropriateTranslation', 'sungeuiEnglishDefinition', 'sungeuiVocabCorrection', 'sungeuiGrammarCorrection', 'danggokListening'].includes(type.id)
      )
    },
    {
      id: 'seodap',
      name: '서답형', 
      questions: questionTypes.filter(type => 
        type.id.match(/^(orderWritingKorean|orderWriting|summaryBlank|summaryVocab|summaryBlankWriting|topicWriting|blankWriting|grammarCorrection|grammarCorrectionUnderline|conditionWriting|sungeuiVocabCorrection|sungeuiGrammarCorrection)$/)
      )
    },
    {
      id: 'workbook',
      name: '워크북 제작',
      questions: questionTypes.filter(type => 
        type.id.match(/^(grammarWorkbook|vocabWorkbook)$/)
      )
    },
    {
      id: 'middleSchool',
      name: '중등내신형',
      questions: []
    },
    {
      id: 'content',
      name: '기타 콘텐츠',
      questions: questionTypes.filter(type => 
        type.id === 'weekendClinic'
      )
    }
  ];
};

// 메인 카테고리만 가져오기
export const getMainQuestionCategories = (): QuestionCategory[] => {
  return getQuestionCategories().filter(category => 
    ['suneung', 'vocabulary', 'naesin', 'schoolSignature', 'seodap', 'workbook'].includes(category.id)
  );
};
