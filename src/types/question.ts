export type QuestionType = {
  id: string;
  name: string;
  prompt?: string;
  isNew?: boolean;
};

export type GeneratedQuestion = {
  question: string;
  options?: string[];
  answer?: string;
  explanation?: string;
};

export interface ManualMarker {
  id: number; // 1-5
  original: string;
  modified: string;
  position?: number; // character index in original text
  explanation?: string;
}

export interface PassageEntry {
  id: string;
  title: string;
  text: string;
  result: string;
  orderMode?: 'basic' | 'advanced';
  summaryMode?: 'two-blanks' | 'three-blanks';
  choiceLanguage?: 'english' | 'korean';
  manualMode?: boolean;
  manualMarkers?: ManualMarker[];
  combinedTypes?: string[];
  paraphraseBlank?: boolean; // [31]/[32-34] 빈칸 정답 패러프레이즈 여부 (기본 true)
  subType?: 'underline' | 'boxed'; // [29]어법/[30]어휘 출제 서브유형 (기본 underline)
}

export interface TypeEntry {
  type: QuestionType;
  passages: PassageEntry[];
}
