import { Trash2, GripVertical } from "lucide-react";
import questionTypesIcon from "@/assets/question-types-icon.png";
import { Button } from "@/components/ui/button";
import { AILogoSpiral } from "./AILogoSpiral";
import { TypeEntry } from "./TypeEntry";
import { LoadingProgress } from "../LoadingProgress";
import { ActionButtons } from "./ActionButtons";
import { GeneratedQuestions } from "./GeneratedQuestions";
import { ManualMarker } from "@/types/question";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";


interface MainContentProps {
  selectedTypes: any[];
  isLoading: boolean;
  progress: { current: number; total: number };
  handleAddPassage: (typeId: string) => void;
  handleRemovePassage: (typeId: string, passageId: string) => void;
  handleTextChange: (typeId: string, passageId: string, text: string) => void;
  handleTitleChange: (typeId: string, passageId: string, title: string) => void;
  handlePasteValues: (typeId: string, passageId: string, values: string[], titles?: string[]) => void;
  handleRemoveType: (typeId: string) => void;
  handleRemoveAllTypes: () => void;
  handleGenerateAll: () => void;
  handleDownloadDoc: () => void;
  onOrderModeChange: (typeId: string, passageId: string, mode: 'basic' | 'advanced') => void;
  onSummaryModeChange: (typeId: string, passageId: string, mode: 'two-blanks' | 'three-blanks') => void;
  onChoiceLanguageChange?: (typeId: string, passageId: string, lang: 'english' | 'korean') => void;
  onManualModeChange?: (typeId: string, passageId: string, mode: boolean) => void;
  onManualMarkersChange?: (typeId: string, passageId: string, markers: ManualMarker[]) => void;
  onCombinedTypesChange?: (typeId: string, passageId: string, combinedTypes: string[]) => void;
  onParaphraseBlankChange?: (typeId: string, passageId: string, paraphraseBlank: boolean) => void;
  onSubTypeChange?: (typeId: string, passageId: string, subType: 'underline' | 'boxed') => void;
  difficulty: string;
  complexity: string;
  handleDifficultyChange: (level: string) => void;
  handleComplexityChange: (level: string) => void;
  handleStopGeneration: () => void;
  generatedQuestions: any[];
  onRefreshQuestion: (questionId: string, newContent: string) => void;
  onReorderTypes: (from: number, to: number) => void;
}

interface SortableTypeEntryProps {
  id: string;
  index: number;
  children: React.ReactNode;
}

const SortableTypeItem = ({ id, index, children }: SortableTypeEntryProps) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
    zIndex: isDragging ? 50 : "auto",
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="relative animate-fade-in group/sortable"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        aria-label="드래그하여 순서 변경"
        className="absolute -left-2 top-4 z-10 flex items-center justify-center w-7 h-7 rounded-md bg-white/80 backdrop-blur border border-slate-200/70 text-slate-400 shadow-sm opacity-0 group-hover/sortable:opacity-100 hover:text-indigo-500 hover:border-indigo-200 cursor-grab active:cursor-grabbing transition-all"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      {children}
    </div>
  );
};


export const MainContent = ({
  selectedTypes,
  isLoading,
  progress,
  handleAddPassage,
  handleRemovePassage,
  handleTextChange,
  handleTitleChange,
  handlePasteValues,
  handleRemoveType,
  handleRemoveAllTypes,
  handleGenerateAll,
  handleDownloadDoc,
  onOrderModeChange,
  onSummaryModeChange,
  onChoiceLanguageChange,
  onManualModeChange,
  onManualMarkersChange,
  onCombinedTypesChange,
  onParaphraseBlankChange,
  onSubTypeChange,
  difficulty,
  complexity,
  handleDifficultyChange,
  handleComplexityChange,
  handleStopGeneration,
  generatedQuestions,
  onRefreshQuestion,
  onReorderTypes,
}: MainContentProps) => {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = selectedTypes.findIndex((t) => t.type.id === active.id);
    const newIndex = selectedTypes.findIndex((t) => t.type.id === over.id);
    if (oldIndex !== -1 && newIndex !== -1) onReorderTypes(oldIndex, newIndex);
  };

  return (
    <div className="flex-1 space-y-6">
      {selectedTypes.length > 0 ? (
        <>
          {/* Header section with premium styling */}
          <div className="relative">
            <div className="flex justify-between items-center pb-5 border-b border-slate-200/60">
              <div className="flex items-center gap-4">
                {/* Icon with gradient background */}
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl blur-lg" />
                  <div className="relative flex items-center justify-center w-11 h-11 rounded-xl overflow-hidden">
                    <img src={questionTypesIcon} alt="문제 유형" className="w-full h-full object-cover" />
                  </div>
                </div>
                <div>
                  <h2 className="text-base font-semibold text-slate-800 tracking-tight flex items-center gap-2">
                    선택된 문제 유형
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-gradient-to-r from-indigo-50 to-purple-50 text-indigo-600 rounded-full border border-indigo-100/50">
                      {selectedTypes.length}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">지문을 입력하고 문제를 생성하세요</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleRemoveAllTypes}
                className="text-slate-400 hover:text-red-500 hover:bg-red-50/80 text-xs font-medium rounded-lg transition-all duration-200"
              >
                <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                모두 제거
              </Button>
            </div>
          </div>
          
          {/* Type entries with drag-and-drop reordering */}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext
              items={selectedTypes.map((t) => t.type.id)}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-4">
                {selectedTypes.map((typeEntry, index) => (
                  <SortableTypeItem key={typeEntry.type.id} id={typeEntry.type.id} index={index}>
                    <TypeEntry
                      type={typeEntry.type}
                      passages={typeEntry.passages}
                      onAddPassage={handleAddPassage}
                      onRemovePassage={handleRemovePassage}
                      onTextChange={handleTextChange}
                      onTitleChange={handleTitleChange}
                      onPasteValues={handlePasteValues}
                      onOrderModeChange={onOrderModeChange}
                      onSummaryModeChange={onSummaryModeChange}
                      onChoiceLanguageChange={onChoiceLanguageChange}
                      onManualModeChange={onManualModeChange}
                      onManualMarkersChange={onManualMarkersChange}
                      onCombinedTypesChange={onCombinedTypesChange}
                      onParaphraseBlankChange={onParaphraseBlankChange}
                      onSubTypeChange={onSubTypeChange}
                      onRemoveType={handleRemoveType}
                    />
                  </SortableTypeItem>
                ))}
              </div>
            </SortableContext>
          </DndContext>


          <ActionButtons
            onGenerate={handleGenerateAll}
            handleDownloadDoc={handleDownloadDoc}
            isLoading={isLoading}
            difficulty={difficulty}
            complexity={complexity}
            onDifficultyChange={handleDifficultyChange}
            onComplexityChange={handleComplexityChange}
            onStopGeneration={handleStopGeneration}
            progress={progress}
          />

          <GeneratedQuestions questions={generatedQuestions} onRefresh={onRefreshQuestion} />
        </>
      ) : (
        /* Empty state with premium styling */
        <div className="relative group">
          {/* Outer glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/5 via-purple-500/5 to-indigo-500/5 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
          
          <div className="relative flex flex-col items-center justify-center h-[500px] bg-white/60 backdrop-blur-xl rounded-2xl border border-slate-200/60 shadow-[0_4px_24px_-8px_rgba(0,0,0,0.06)] p-8 overflow-hidden">
            {/* Background pattern */}
            <div 
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `radial-gradient(circle at center, hsl(226 30% 50%) 1px, transparent 1px)`,
                backgroundSize: '24px 24px'
              }}
            />
            
            {/* Gradient orbs */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-indigo-100/40 to-transparent rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-purple-100/40 to-transparent rounded-full blur-3xl" />
            
            {/* 3D AI Logo Spiral */}
            <div className="relative mb-6">
              <AILogoSpiral />
            </div>
            
            {/* Text */}
            <h3 className="relative text-lg font-semibold text-slate-700 mb-2">
              문제 유형을 선택해주세요
            </h3>
            <p className="relative text-sm text-slate-500 text-center max-w-sm leading-relaxed">
              왼쪽 사이드바에서 원하는 문제 유형을 선택하면<br />
              지문 입력 및 문제 생성 기능이 활성화됩니다.
            </p>
            
            {/* Decorative dots */}
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-indigo-300/50" />
              <div className="w-1 h-1 rounded-full bg-slate-300/50" />
              <div className="w-1.5 h-1.5 rounded-full bg-purple-300/50" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
