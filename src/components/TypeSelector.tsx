import { useMemo, useState } from "react";
import { QuestionType } from "@/types/question";
import { getQuestionCategories } from "@/lib/questionCategories";
import { useToast } from "@/hooks/use-toast";
import { TypeCategory } from "./type-selector/TypeCategory";
import { Search, X, Sparkles, ListChecks, GripVertical } from "lucide-react";

interface TypeSelectorProps {
  selectedTypes: QuestionType[];
  onSelect: (type: QuestionType) => void;
  onRemove: (typeId: string) => void;
  onClearAll?: () => void;
  onReorder?: (from: number, to: number) => void;
}

export const TypeSelector = ({ selectedTypes, onSelect, onRemove, onClearAll, onReorder }: TypeSelectorProps) => {

  const categories = getQuestionCategories();
  const { toast } = useToast();
  const hasAccess = localStorage.getItem("hasAccess") === "true";

  const [query, setQuery] = useState("");
  const [dragIdx, setDragIdx] = useState<number | null>(null);
  const [overIdx, setOverIdx] = useState<number | null>(null);


  const totalTypes = useMemo(
    () => categories.reduce((sum, c) => sum + c.questions.length, 0),
    [categories]
  );

  const filteredCategories = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories
      .map((c) => ({
        ...c,
        questions: c.questions.filter((t) => t.name.toLowerCase().includes(q)),
      }))
      .filter((c) => c.questions.length > 0);
  }, [categories, query]);

  const handleTypeClick = (type: QuestionType, isSelected: boolean, fromChip = false) => {
    if (!hasAccess) {
      toast({
        title: "접근 제한",
        description: "문제 유형을 선택하려면 로그인이 필요합니다.",
        variant: "destructive",
      });
      return;
    }
    if (isSelected) {
      onRemove(type.id);
      toast({ title: "유형 삭제", description: `${type.name} 제거`, duration: 1500 });
    } else {
      onSelect(type);
      toast({ title: "유형 추가", description: `${type.name} 추가`, duration: 1500 });
    }
  };

  const handleSelectCategoryAll = (types: QuestionType[]) => {
    if (!hasAccess) {
      toast({ title: "접근 제한", description: "로그인이 필요합니다.", variant: "destructive" });
      return;
    }
    const allSelected = types.every((t) => selectedTypes.some((s) => s.id === t.id));
    if (allSelected) {
      types.forEach((t) => onRemove(t.id));
      toast({ title: "카테고리 전체 해제", duration: 1500 });
    } else {
      types.forEach((t) => {
        if (!selectedTypes.some((s) => s.id === t.id)) onSelect(t);
      });
      toast({ title: "카테고리 전체 선택", duration: 1500 });
    }
  };

  const handleClearAll = () => {
    if (!hasAccess) return;
    if (selectedTypes.length === 0) return;
    onClearAll?.();
    toast({ title: "전체 취소", description: "모든 선택 해제", duration: 1500 });
  };

  const progress = totalTypes === 0 ? 0 : Math.round((selectedTypes.length / totalTypes) * 100);

  return (
    <div className="space-y-3">
      {/* Header / Summary */}
      <div className="px-1 pt-1">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1.5">
            <ListChecks className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-[11px] font-semibold tracking-wider uppercase text-slate-700">
              문제 유형 선택
            </span>
          </div>
          <span className="text-[10px] font-bold tabular-nums text-slate-500">
            <span className="text-indigo-600">{selectedTypes.length}</span>
            <span className="text-slate-400"> / {totalTypes}</span>
          </span>
        </div>
        {/* Progress bar */}
        <div className="h-1 w-full bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-indigo-400 via-violet-400 to-purple-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400 pointer-events-none" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="유형 검색..."
          className="w-full pl-9 pr-9 py-2.5 text-[12px] bg-slate-50/80 border border-slate-200/70 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-indigo-300 focus:bg-white focus:ring-2 focus:ring-indigo-100 transition-all"
        />
        {query && (
          <button
            onClick={() => setQuery("")}
            className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 rounded-md hover:bg-slate-200/60 text-slate-400 hover:text-slate-600 transition-colors"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </div>

      {/* Selected chips */}
      {selectedTypes.length > 0 && (
        <div className="rounded-xl bg-gradient-to-br from-indigo-50/60 via-white to-purple-50/40 border border-indigo-100/60 p-2.5 space-y-2">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span className="text-[10px] font-bold tracking-wider uppercase text-indigo-700">
                선택됨 {selectedTypes.length}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {onReorder && selectedTypes.length > 1 && (
                <span className="text-[10px] font-medium text-slate-400 hidden sm:inline">
                  드래그해서 순서 변경
                </span>
              )}
              {onClearAll && (
                <button
                  onClick={handleClearAll}
                  className="text-[10px] font-semibold text-slate-500 hover:text-red-600 transition-colors flex items-center gap-1 px-1.5 py-0.5 rounded-md hover:bg-red-50"
                >
                  <X className="w-3 h-3" />
                  전체 해제
                </button>
              )}
            </div>
          </div>



          <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto">
            {selectedTypes.map((t, idx) => {
              const isDragging = dragIdx === idx;
              const isOver = overIdx === idx && dragIdx !== null && dragIdx !== idx;
              return (
                <div
                  key={t.id}
                  draggable={!!onReorder}
                  onDragStart={(e) => {
                    setDragIdx(idx);
                    e.dataTransfer.effectAllowed = "move";
                    e.dataTransfer.setData("text/plain", String(idx));
                  }}
                  onDragOver={(e) => {
                    if (dragIdx === null) return;
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                    if (overIdx !== idx) setOverIdx(idx);
                  }}
                  onDragLeave={() => {
                    if (overIdx === idx) setOverIdx(null);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (dragIdx !== null && dragIdx !== idx) onReorder?.(dragIdx, idx);
                    setDragIdx(null);
                    setOverIdx(null);
                  }}
                  onDragEnd={() => {
                    setDragIdx(null);
                    setOverIdx(null);
                  }}
                  className={`group inline-flex items-center gap-0.5 pl-1 pr-1 py-1 bg-white border rounded-lg text-[11px] font-medium text-slate-700 shadow-sm transition-all ${
                    isDragging
                      ? "opacity-40 scale-95 border-indigo-300"
                      : isOver
                      ? "border-indigo-400 ring-2 ring-indigo-200 -translate-y-0.5"
                      : "border-indigo-200/70 hover:border-indigo-300"
                  } ${onReorder ? "cursor-grab active:cursor-grabbing" : ""}`}
                  title="드래그하여 순서 변경"
                >
                  {onReorder && (
                    <GripVertical className="w-3 h-3 text-slate-300 group-hover:text-slate-500 flex-shrink-0" />
                  )}
                  <button
                    type="button"
                    onClick={() => handleTypeClick(t, true, true)}
                    className="inline-flex items-center gap-1 pl-1 pr-0.5 hover:text-red-700 transition-colors"
                    title="클릭하여 제거"
                  >
                    <span className="truncate max-w-[120px]">{t.name}</span>
                    <X className="w-3 h-3 text-slate-400 hover:text-red-500" />
                  </button>
                </div>
              );
            })}
          </div>

        </div>
      )}

      {/* Categories */}
      <div className="space-y-1">
        {filteredCategories.map((category) => (
          <TypeCategory
            key={category.id}
            title={category.name}
            types={category.questions}
            selectedTypes={selectedTypes}
            hasAccess={hasAccess}
            onTypeClick={handleTypeClick}
            onSelectAll={() => handleSelectCategoryAll(category.questions)}
            defaultOpen={true}
          />
        ))}
        {filteredCategories.length === 0 && (
          <div className="py-8 text-center text-[12px] text-slate-400">
            <Search className="w-5 h-5 mx-auto mb-2 text-slate-300" />
            "{query}" 와 일치하는 유형이 없습니다.
          </div>
        )}
      </div>
    </div>
  );
};
