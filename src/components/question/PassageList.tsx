
import { Button } from "@/components/ui/button";
import { Passage } from "./Passage";
import { PassageEntry, ManualMarker } from "@/types/question";

interface PassageListProps {
  passages: PassageEntry[];
  typeId: string;
  onAddPassage: (typeId: string) => void;
  onRemovePassage: (typeId: string, passageId: string) => void;
  onTextChange: (typeId: string, passageId: string, text: string) => void;
  onTitleChange: (typeId: string, passageId: string, title: string) => void;
  onPasteValues: (typeId: string, passageId: string, values: string[], titles?: string[]) => void;
  onOrderModeChange?: (typeId: string, passageId: string, mode: 'basic' | 'advanced') => void;
  onSummaryModeChange?: (typeId: string, passageId: string, mode: 'two-blanks' | 'three-blanks') => void;
  onChoiceLanguageChange?: (typeId: string, passageId: string, lang: 'english' | 'korean') => void;
  onManualModeChange?: (typeId: string, passageId: string, mode: boolean) => void;
  onManualMarkersChange?: (typeId: string, passageId: string, markers: ManualMarker[]) => void;
  onCombinedTypesChange?: (typeId: string, passageId: string, combinedTypes: string[]) => void;
  onParaphraseBlankChange?: (typeId: string, passageId: string, paraphraseBlank: boolean) => void;
  onSubTypeChange?: (typeId: string, passageId: string, subType: 'underline' | 'boxed') => void;
  isSpecialVocabType?: boolean;
  isOrderWritingType?: boolean;
  placeholder?: string;
}

export const PassageList = ({
  passages,
  typeId,
  onAddPassage,
  onRemovePassage,
  onTextChange,
  onTitleChange,
  onPasteValues,
  onOrderModeChange,
  onSummaryModeChange,
  onChoiceLanguageChange,
  onManualModeChange,
  onManualMarkersChange,
  onCombinedTypesChange,
  onParaphraseBlankChange,
  onSubTypeChange,
  isSpecialVocabType,
  isOrderWritingType,
  placeholder = "Enter your text here..."
}: PassageListProps) => {
  const needsWordListGuidance = typeId === 'collocation';
  const needsDictionaryGuidance = typeId === 'dictionary';
  const needsExampleSentencesGuidance = false;
  const needsBracketGuidance = ['implication', 'insert', 'blank', 'blankMultiple'].includes(typeId);
  const isBlankAnswerType = ['blank', 'blankMultiple'].includes(typeId);
  const isOrderType = typeId === 'order';
  const isSummaryType = typeId === 'summary';
  const isContentMatchType = ['contentMismatch', 'contentMatch', 'mainPoint'].includes(typeId);
  const isManualCapable = ['grammar', 'vocabulary', 'sungeuiDifferentMeaning', 'englishDefinitionBlankMatch'].includes(typeId);
  const isSubTypeCapable = ['grammar', 'vocabulary'].includes(typeId);
  
  return (
    <div className="space-y-4">
      {isOrderType && (
        <div className="rounded-lg overflow-hidden border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/50">
          <div className="px-3 py-2 border-b border-blue-100/80 bg-blue-50/50">
            <span className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              순서 문제 모드
            </span>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-white/80 rounded-lg border border-slate-200/60">
              <h4 className="text-xs font-semibold text-slate-700 mb-1">기본 모드</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">첫 문장 고정, 나머지 3개 단락 배열</p>
            </div>
            <div className="p-2.5 bg-white/80 rounded-lg border border-slate-200/60">
              <h4 className="text-xs font-semibold text-slate-700 mb-1">고급 모드</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">첫/끝 문장 고정, 중간 3개 배열</p>
            </div>
          </div>
        </div>
      )}
      {isSummaryType && (
        <div className="rounded-lg overflow-hidden border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/50">
          <div className="px-3 py-2 border-b border-blue-100/80 bg-blue-50/50">
            <span className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              요약문 빈칸 개수
            </span>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-white/80 rounded-lg border border-slate-200/60">
              <h4 className="text-xs font-semibold text-slate-700 mb-1">(A)(B) 2개 빈칸</h4>
              <p className="text-[10px] text-slate-500">두 개의 빈칸 생성</p>
            </div>
            <div className="p-2.5 bg-white/80 rounded-lg border border-slate-200/60">
              <h4 className="text-xs font-semibold text-slate-700 mb-1">(A)(B)(C) 3개 빈칸</h4>
              <p className="text-[10px] text-slate-500">세 개의 빈칸 생성</p>
            </div>
          </div>
        </div>
      )}
      {isContentMatchType && (
        <div className="rounded-lg overflow-hidden border border-blue-100 bg-gradient-to-r from-blue-50/80 to-indigo-50/50">
          <div className="px-3 py-2 border-b border-blue-100/80 bg-blue-50/50">
            <span className="text-xs font-semibold text-blue-700 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              선지 언어 선택
            </span>
          </div>
          <div className="p-3 grid grid-cols-2 gap-2">
            <div className="p-2.5 bg-white/80 rounded-lg border border-slate-200/60">
              <h4 className="text-xs font-semibold text-slate-700 mb-1">🇬🇧 영어 선지</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">선택지를 영어로 출제</p>
            </div>
            <div className="p-2.5 bg-white/80 rounded-lg border border-slate-200/60">
              <h4 className="text-xs font-semibold text-slate-700 mb-1">🇰🇷 한글 선지</h4>
              <p className="text-[10px] text-slate-500 leading-relaxed">선택지를 한국어로 출제</p>
            </div>
          </div>
        </div>
      )}
      {needsWordListGuidance && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
          <span className="text-xs text-blue-700">최소 10개의 단어 또는 단어쌍 입력 (ex: haunt - obsess)</span>
        </div>
      )}
      {needsDictionaryGuidance && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
          <span className="text-xs text-blue-700">6개의 단어 또는 지문을 입력하세요</span>
        </div>
      )}
      {needsExampleSentencesGuidance && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50/50 border border-blue-100">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
          <span className="text-xs text-blue-700">5개의 단어를 입력하세요</span>
        </div>
      )}
      {needsBracketGuidance && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50/50 border border-amber-100">
          <span className="w-1.5 h-1.5 rounded-full bg-amber-500 flex-shrink-0" />
          <span className="text-xs text-amber-700">대괄호 [square brackets]로 감싸면 해당 부분이 문제로 출제됩니다</span>
        </div>
      )}
      {passages.map((passage, index) => (
        <div 
          key={passage.id}
          className="animate-fade-in"
          style={{ animationDelay: `${index * 100}ms` }}
        >
          <Passage
            passage={passage}
            typeId={typeId}
            onRemove={onRemovePassage}
            onChange={onTextChange}
            onTitleChange={onTitleChange}
            onPaste={onPasteValues}
            onAddPassage={onAddPassage}
            onManualModeChange={onManualModeChange}
            onManualMarkersChange={onManualMarkersChange}
            onCombinedTypesChange={onCombinedTypesChange}
            onParaphraseBlankChange={onParaphraseBlankChange}
            onSubTypeChange={onSubTypeChange}
            isSubTypeCapable={isSubTypeCapable}
            isBlankAnswerType={isBlankAnswerType}
            isSpecialVocabType={isSpecialVocabType}
            isOrderWritingType={isOrderWritingType}
            isBracketType={needsBracketGuidance}
            isOrderType={isOrderType}
            isSummaryType={isSummaryType}
            isContentMatchType={isContentMatchType}
            isManualCapable={isManualCapable}
            onOrderModeChange={onOrderModeChange}
            onSummaryModeChange={onSummaryModeChange}
            onChoiceLanguageChange={onChoiceLanguageChange}
            placeholder={placeholder}
          />
        </div>
      ))}
    </div>
  );
};
