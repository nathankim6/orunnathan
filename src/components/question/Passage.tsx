
import { TextInput } from "@/components/TextInput";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { X, Database, Plus } from "lucide-react";
import { PassageEntry, ManualMarker } from "@/types/question";
import { useState, ClipboardEvent } from "react";
import { PassageModal } from "../passage/PassageModal";
import { ManualQuestionEditor } from "./ManualQuestionEditor";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { COMBINED_QUESTION_OPTIONS } from "@/lib/prompts/combinedQuestion";

interface PassageProps {
  passage: PassageEntry;
  typeId: string;
  onRemove: (typeId: string, passageId: string) => void;
  onChange: (typeId: string, passageId: string, text: string) => void;
  onTitleChange: (typeId: string, passageId: string, title: string) => void;
  onPaste: (typeId: string, passageId: string, values: string[], titles?: string[]) => void;
  onAddPassage?: (typeId: string) => void;
  onManualModeChange?: (typeId: string, passageId: string, mode: boolean) => void;
  onManualMarkersChange?: (typeId: string, passageId: string, markers: ManualMarker[]) => void;
  onCombinedTypesChange?: (typeId: string, passageId: string, combinedTypes: string[]) => void;
  onParaphraseBlankChange?: (typeId: string, passageId: string, paraphraseBlank: boolean) => void;
  onSubTypeChange?: (typeId: string, passageId: string, subType: 'underline' | 'boxed') => void;
  isSpecialVocabType?: boolean;
  isOrderWritingType?: boolean;
  isBracketType?: boolean;
  isOrderType?: boolean;
  isSummaryType?: boolean;
  isContentMatchType?: boolean;
  isManualCapable?: boolean;
  isBlankAnswerType?: boolean;
  isSubTypeCapable?: boolean;
  onOrderModeChange?: (typeId: string, passageId: string, mode: 'basic' | 'advanced') => void;
  onSummaryModeChange?: (typeId: string, passageId: string, mode: 'two-blanks' | 'three-blanks') => void;
  onChoiceLanguageChange?: (typeId: string, passageId: string, lang: 'english' | 'korean') => void;
  placeholder?: string;
}

export const Passage = ({
  passage,
  typeId,
  onRemove,
  onChange,
  onTitleChange,
  onPaste,
  onAddPassage,
  onManualModeChange,
  onManualMarkersChange,
  onCombinedTypesChange,
  onParaphraseBlankChange,
  onSubTypeChange,
  isSpecialVocabType,
  isOrderWritingType,
  isBracketType,
  isOrderType,
  isSummaryType,
  isContentMatchType,
  isManualCapable,
  isBlankAnswerType,
  isSubTypeCapable,
  onOrderModeChange,
  onSummaryModeChange,
  onChoiceLanguageChange,
  placeholder = "Enter your text here..."
}: PassageProps) => {
  const [isPassageModalOpen, setIsPassageModalOpen] = useState(false);

  const handleSelectPassage = (content: string) => {
    onChange(typeId, passage.id, content);
    setIsPassageModalOpen(false);
  };
  
  const handleSelectMultiplePassages = (contents: string[]) => {
    if (contents.length === 0) return;
    
    // Use the first content for this passage
    onChange(typeId, passage.id, contents[0]);
    
    // Add additional passages if there are more selected
    if (contents.length > 1 && onAddPassage) {
      for (let i = 1; i < contents.length; i++) {
        onAddPassage(typeId);
      }
      onPaste(typeId, passage.id, contents);
    }
    
    setIsPassageModalOpen(false);
  };

  // Handle paste on title input - support Excel 2-column format (title\tpassage per row)
  const handleTitlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    const text = e.clipboardData.getData('text');
    const hasTab = text.includes('\t');
    const hasNewline = text.includes('\n');
    
    if (hasTab && hasNewline) {
      // Multi-row Excel paste: each row = title\tpassage
      e.preventDefault();
      const rows = text.split('\n').filter(r => r.trim());
      const cleanQuotes = (s: string) => s.replace(/^["'`""'']+|["'`""'']+$/g, '').trim();
      
      if (rows.length >= 1) {
        const titles: string[] = [];
        const texts: string[] = [];
        
        for (const row of rows) {
          const cols = row.split('\t');
          titles.push(cleanQuotes(cols[0] || ''));
          texts.push(cleanQuotes(cols[1] || ''));
        }
        
        // Use onPaste with both texts and titles - it handles creating new passages
        onPaste(typeId, passage.id, texts, titles);
      }
    } else if (hasTab) {
      // Single row with tab: title\tpassage
      e.preventDefault();
      const parts = text.split('\t');
      const cleanQuotes = (s: string) => s.replace(/^["'`""'']+|["'`""'']+$/g, '').trim();
      onTitleChange(typeId, passage.id, cleanQuotes(parts[0] || ''));
      if (parts[1]) {
        onChange(typeId, passage.id, cleanQuotes(parts[1]));
      }
    }
    // If no tab, let default paste behavior handle it (just title text)
  };

  return (
    <div className="passage-container group relative">
      {/* Premium passage card */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-white via-white to-slate-50/80 border border-slate-200/80 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.08)] hover:shadow-[0_8px_24px_-8px_rgba(0,0,0,0.12)] hover:border-slate-300 transition-all duration-300">
        {/* Subtle top accent line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-slate-300/60 to-transparent" />
        
        <div className="p-4">
          {/* Combined question type selector */}
          {typeId === 'combinedQuestion' && (
            <div className="mb-3 p-3 rounded-lg bg-gradient-to-r from-blue-50/80 to-indigo-50/50 border border-blue-100">
              <div className="text-xs font-semibold text-blue-700 mb-2">
                복합출제 유형 선택 (정확히 2개)
                <span className="ml-2 text-[10px] font-normal text-blue-500">
                  현재 {(passage.combinedTypes || []).length}개 선택됨
                </span>
              </div>
              {(() => {
                const grouped = COMBINED_QUESTION_OPTIONS.reduce((acc, opt) => {
                  const cat = (opt as any).category || '기타';
                  if (!acc[cat]) acc[cat] = [];
                  acc[cat].push(opt);
                  return acc;
                }, {} as Record<string, typeof COMBINED_QUESTION_OPTIONS[number][]>);
                const order = ['수능형', '단어장', '내신형', '서답형', '학교별', '워크북'];
                return order.filter(c => grouped[c]).map((cat) => (
                  <div key={cat} className="mb-2 last:mb-0">
                    <div className="text-[10px] font-bold text-blue-600/80 uppercase tracking-wider mb-1.5 px-1">
                      {cat}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {grouped[cat].map((opt) => {
                        const selected = (passage.combinedTypes || []).includes(opt.id);
                        return (
                          <label
                            key={opt.id}
                            className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer text-[11px] border transition-all ${
                              selected
                                ? 'bg-blue-100 border-blue-300 text-blue-800'
                                : 'bg-white border-slate-200 text-slate-600 hover:border-blue-200'
                            }`}
                          >
                            <Checkbox
                              checked={selected}
                              onCheckedChange={(checked) => {
                                const current = passage.combinedTypes || [];
                                let next: string[];
                                if (checked) {
                                  if (current.length >= 2) return;
                                  next = [...current, opt.id];
                                } else {
                                  next = current.filter((id) => id !== opt.id);
                                }
                                onCombinedTypesChange?.(typeId, passage.id, next);
                              }}
                              disabled={!selected && (passage.combinedTypes || []).length >= 2}
                            />
                            <span className="font-medium">{opt.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ));
              })()}
            </div>
          )}

          {/* 어법/어휘 서브유형 토글 (자동출제 모드에서만 의미 있음) */}
          {isSubTypeCapable && !passage.manualMode && (
            <div className="mb-3 flex items-center gap-2 p-2.5 rounded-lg bg-gradient-to-r from-sky-50/80 to-blue-50/50 border border-sky-100">
              <span className="text-[11px] font-semibold text-sky-700 mr-1">출제 형식</span>
              <Button
                variant={(passage.subType || 'underline') === 'underline' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSubTypeChange?.(typeId, passage.id, 'underline')}
                className="text-xs rounded-lg h-7 px-3 font-medium"
              >
                밑줄형 (①~⑤)
              </Button>
              <Button
                variant={passage.subType === 'boxed' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSubTypeChange?.(typeId, passage.id, 'boxed')}
                className="text-xs rounded-lg h-7 px-3 font-medium"
              >
                네모형 (A)(B)(C)
              </Button>
              <span className="text-[10px] text-sky-600/80 ml-auto">
                {passage.subType === 'boxed'
                  ? '지문 3곳에 (A)[X / Y] + 조합 표'
                  : '지문 ①~⑤ 밑줄 후 정답 1개'}
              </span>
            </div>
          )}

          {/* Manual mode toggle for grammar/vocabulary */}
          {isManualCapable && (
            <div className="mb-3 flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-violet-50/80 to-purple-50/50 border border-violet-100">
              <Switch
                id={`manual-${passage.id}`}
                checked={passage.manualMode || false}
                onCheckedChange={(checked) => onManualModeChange?.(typeId, passage.id, checked)}
              />
              <Label htmlFor={`manual-${passage.id}`} className="text-xs font-medium text-violet-700 cursor-pointer">
                직접출제 모드
              </Label>
              {passage.manualMode && (
                <span className="text-[10px] text-violet-500 ml-auto">
                  {typeId === 'englishDefinitionBlankMatch'
                    ? '단어 더블클릭 → (A)~(E) 빈칸 자동 지정 (최대 5개)'
                    : '텍스트 선택 → Ctrl+1로 마커 추가'}
                </span>
              )}
            </div>
          )}

          {isBlankAnswerType && (
            <div className="mb-3 flex items-center gap-3 p-2.5 rounded-lg bg-gradient-to-r from-amber-50/80 to-yellow-50/50 border border-amber-100">
              <Switch
                id={`paraphrase-${passage.id}`}
                checked={passage.paraphraseBlank !== false}
                onCheckedChange={(checked) => onParaphraseBlankChange?.(typeId, passage.id, checked)}
              />
              <Label htmlFor={`paraphrase-${passage.id}`} className="text-xs font-medium text-amber-700 cursor-pointer">
                정답 패러프레이즈 (변형)
              </Label>
              <span className="text-[10px] text-amber-500 ml-auto">
                {passage.paraphraseBlank !== false
                  ? '✏️ 변형: 원문 표현을 동의어로 바꿔 정답 출제'
                  : '📌 원본: 원문 표현을 그대로 정답 출제'}
              </span>
            </div>
          )}

          {isOrderType && (
            <div className="mb-3 flex gap-2">
              <Button
                variant={(passage.orderMode || 'basic') === 'basic' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onOrderModeChange?.(typeId, passage.id, 'basic')}
                className="text-xs rounded-lg h-8 px-3 font-medium"
              >
                기본 모드
              </Button>
              <Button
                variant={passage.orderMode === 'advanced' ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  onOrderModeChange?.(typeId, passage.id, 'advanced');
                }}
                className="text-xs rounded-lg h-8 px-3 font-medium"
              >
                고급 모드
              </Button>
            </div>
          )}
          {isSummaryType && (
            <div className="mb-3 flex gap-2">
              <Button
                variant={(passage.summaryMode || 'two-blanks') === 'two-blanks' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSummaryModeChange?.(typeId, passage.id, 'two-blanks')}
                className="text-xs rounded-lg h-8 px-3 font-medium"
              >
                (A)(B) 2개 빈칸
              </Button>
              <Button
                variant={passage.summaryMode === 'three-blanks' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onSummaryModeChange?.(typeId, passage.id, 'three-blanks')}
                className="text-xs rounded-lg h-8 px-3 font-medium"
              >
                (A)(B)(C) 3개 빈칸
              </Button>
            </div>
          )}
          {isContentMatchType && (
            <div className="mb-3 flex gap-2">
              <Button
                variant={(passage.choiceLanguage || 'english') === 'english' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChoiceLanguageChange?.(typeId, passage.id, 'english')}
                className="text-xs rounded-lg h-8 px-3 font-medium"
              >
                🇬🇧 영어 선지
              </Button>
              <Button
                variant={passage.choiceLanguage === 'korean' ? 'default' : 'outline'}
                size="sm"
                onClick={() => onChoiceLanguageChange?.(typeId, passage.id, 'korean')}
                className="text-xs rounded-lg h-8 px-3 font-medium"
              >
                🇰🇷 한글 선지
              </Button>
            </div>
          )}
          
          {/* Listening passage label (1번~5번) for danggokListening */}
          {typeId === 'danggokListening' && (
            <div className="mb-2 flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 text-[11px] font-bold border border-amber-200">
                {(() => {
                  // Find passage index would require parent context; use placeholder via text
                  return '듣기 대본';
                })()}
              </span>
              <span className="text-[10px] text-slate-500">대화 또는 담화 형태로 자유 입력 (M:/W: 라벨은 선택)</span>
            </div>
          )}

          <div className="flex items-start gap-3">
            {/* Title + Text input area */}
            <div className="flex-1 flex items-start gap-2">
              {/* Title input - left (hidden for listening, replaced by fixed number) */}
              {typeId === 'danggokListening' ? (
                <div className="relative w-[80px] flex-shrink-0">
                  <Input
                    value={passage.title || ''}
                    onChange={(e) => onTitleChange(typeId, passage.id, e.target.value)}
                    placeholder="번호"
                    className="h-[56px] text-xs text-center bg-amber-50/80 border-amber-200 focus:bg-white focus:border-amber-400 rounded-lg placeholder:text-slate-300 font-bold"
                  />
                </div>
              ) : (
                <div className="relative w-[140px] flex-shrink-0">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[10px] font-semibold text-slate-400 uppercase tracking-wider pointer-events-none">
                    제목
                  </span>
                  <Input
                    value={passage.title || ''}
                    onChange={(e) => onTitleChange(typeId, passage.id, e.target.value)}
                    onPaste={handleTitlePaste}
                    placeholder="지문 제목"
                    className="pl-9 h-[56px] text-xs text-center bg-slate-50/80 border-slate-200 focus:bg-white focus:border-slate-400 rounded-lg placeholder:text-slate-300"
                  />
                </div>
              )}
              {/* Passage text input - right */}
              <div className="flex-1 passage-input-container">
                <TextInput
                  value={passage.text}
                  onChange={(value) => onChange(typeId, passage.id, value)}
                  onPaste={(values, titles) => onPaste(typeId, passage.id, values, titles)}
                  onEnterPress={() => onAddPassage?.(typeId)}
                  isSpecialVocabType={isSpecialVocabType}
                  isOrderWritingType={isOrderWritingType}
                  isBracketType={isBracketType}
                  placeholder={placeholder}
                />
              </div>
            </div>
            
            {/* Action buttons - hidden for danggokListening (5 fixed) */}
            {typeId !== 'danggokListening' && (
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsPassageModalOpen(true)}
                  className="rounded-lg bg-gradient-to-br from-indigo-50 to-blue-50 hover:from-indigo-100 hover:to-blue-100 border border-indigo-200/60 hover:border-indigo-300 text-indigo-600 hover:text-indigo-700 transition-all duration-200 p-0 h-8 w-8 shadow-sm hover:shadow"
                  title="지문 데이터베이스"
                >
                  <Database className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddPassage?.(typeId)}
                  className="rounded-lg bg-gradient-to-br from-emerald-50 to-green-50 hover:from-emerald-100 hover:to-green-100 border border-emerald-200/60 hover:border-emerald-300 text-emerald-600 hover:text-emerald-700 transition-all duration-200 p-0 h-8 w-8 shadow-sm hover:shadow"
                  title="지문 추가"
                >
                  <Plus className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onRemove(typeId, passage.id)}
                  className="rounded-lg bg-gradient-to-br from-red-50 to-rose-50 hover:from-red-100 hover:to-rose-100 border border-red-200/60 hover:border-red-300 text-red-500 hover:text-red-600 transition-all duration-200 p-0 h-8 w-8 shadow-sm hover:shadow"
                  title="지문 삭제"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            )}
          </div>

          {/* Manual question editor - shown below the passage input when manual mode is on */}
          {isManualCapable && passage.manualMode && passage.text && (
            <div className="mt-3">
              <ManualQuestionEditor
                text={passage.text}
                markers={passage.manualMarkers || []}
                onMarkersChange={(markers) => onManualMarkersChange?.(typeId, passage.id, markers)}
                typeId={typeId}
              />
            </div>
          )}
        </div>
      </div>

      {/* Passage Modal */}
      {isPassageModalOpen && (
        <PassageModal
          isOpen={isPassageModalOpen}
          onClose={() => setIsPassageModalOpen(false)}
          onSelectPassage={handleSelectPassage}
          onSelectMultiplePassages={handleSelectMultiplePassages}
        />
      )}
    </div>
  );
};
