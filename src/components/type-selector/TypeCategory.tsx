import { QuestionType } from "@/types/question";
import { TypeButton } from "./TypeButton";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useEffect, useState } from "react";
import { ChevronRight, CheckCheck } from "lucide-react";

interface TypeCategoryProps {
  title: string;
  types: QuestionType[];
  selectedTypes: QuestionType[];
  hasAccess: boolean;
  onTypeClick: (type: QuestionType, isSelected: boolean) => void;
  onSelectAll?: () => void;
  defaultOpen?: boolean;
}

const getSchoolLogo = (typeId: string): string[] => {
  if (typeId.startsWith('seongnam')) return ['/lovable-uploads/seongnam-logo.png'];
  if (typeId.startsWith('guam')) return ['/lovable-uploads/guam-logo.png'];
  if (typeId.startsWith('sudo')) return ['/lovable-uploads/sudo-logo.png'];
  if (typeId.startsWith('heukseok')) return ['/lovable-uploads/heukseok-logo.png'];
  if (typeId.startsWith('sungnamVocab')) return ['/lovable-uploads/21a8d8a1-8477-4ccd-b993-e77b9fef8e2b.png', '/lovable-uploads/f65366ac-b1b1-445b-b193-e2f14c9dfd82.png'];
  if (typeId.startsWith('sung')) return ['/lovable-uploads/21a8d8a1-8477-4ccd-b993-e77b9fef8e2b.png'];
  if (typeId.startsWith('yeong')) return ['/lovable-uploads/9a8b2f51-6d3e-473c-b09c-528ecc1f6613.png'];
  if (typeId.startsWith('dang')) return ['/lovable-uploads/31f3e37e-b83a-4053-b1db-3b652acfb6c4.png'];
  return [];
};

export const TypeCategory = ({
  title,
  types,
  selectedTypes,
  hasAccess,
  onTypeClick,
  onSelectAll,
  defaultOpen = true,
}: TypeCategoryProps) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  useEffect(() => {
    if (defaultOpen) setIsOpen(true);
  }, [defaultOpen]);

  const selectedCount = types.filter(type => selectedTypes.some(t => t.id === type.id)).length;
  const allSelected = selectedCount === types.length && types.length > 0;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className={`group/cat relative rounded-md overflow-hidden border transition-colors duration-200 ${
        isOpen
          ? "border-slate-300 bg-white shadow-[0_1px_2px_rgba(15,23,42,0.04)]"
          : "border-slate-200 bg-white hover:border-slate-300"
      }`}
    >
      <div className="flex items-center">
        <CollapsibleTrigger className="group flex items-center justify-between flex-1 pl-3 pr-2.5 py-2.5 text-left">
          <div className="flex items-center gap-2">
            <ChevronRight
              className={`w-3 h-3 transition-transform duration-200 ${
                isOpen ? "rotate-90 text-slate-700" : "text-slate-400 group-hover:text-slate-600"
              }`}
              strokeWidth={2.5}
            />
            <span className={`text-[11px] font-semibold tracking-[0.1em] uppercase transition-colors ${
              isOpen ? "text-slate-900" : "text-slate-600 group-hover:text-slate-800"
            }`}>
              {title}
            </span>
            {selectedCount > 0 && (
              <span className="flex items-center justify-center min-w-[18px] h-[16px] px-1.5 text-[9px] font-bold font-mono bg-slate-900 text-indigo-300 rounded-[3px] tabular-nums">
                {selectedCount}
              </span>
            )}
            {title === "중등내신형" && (
              <span className="px-1.5 py-px text-[8px] font-bold tracking-[0.12em] font-mono uppercase bg-amber-50 text-amber-700 border border-amber-200 rounded-[3px]">
                Beta
              </span>
            )}
          </div>
          <span className={`text-[10px] tabular-nums font-mono transition-colors ${
            isOpen ? "text-slate-500" : "text-slate-400"
          }`}>
            {String(selectedCount).padStart(2, '0')}<span className="text-slate-300 mx-0.5">/</span>{String(types.length).padStart(2, '0')}
          </span>
        </CollapsibleTrigger>

        {onSelectAll && hasAccess && (
          <button
            onClick={(e) => { e.stopPropagation(); onSelectAll(); }}
            className={`mr-2 p-1.5 rounded-[4px] border transition-colors duration-150 ${
              allSelected
                ? "bg-slate-900 border-slate-900 text-indigo-300"
                : "bg-white border-slate-200 text-slate-400 hover:text-slate-700 hover:border-slate-300"
            }`}
            title={allSelected ? "전체 해제" : "전체 선택"}
          >
            <CheckCheck className="w-3 h-3" strokeWidth={2.5} />
          </button>
        )}
      </div>

      <CollapsibleContent className="overflow-hidden data-[state=open]:animate-accordion-down data-[state=closed]:animate-accordion-up">
        <div className="px-2 pb-2 pt-1.5 space-y-1 border-t border-slate-200/70 bg-slate-50/40">
          {types.map(type => {
            const isSelected = selectedTypes.some(t => t.id === type.id);
            const logos = getSchoolLogo(type.id);
            return (
              <TypeButton
                key={type.id}
                type={type}
                isSelected={isSelected}
                hasAccess={hasAccess}
                onClick={() => onTypeClick(type, isSelected)}
                logos={logos}
              />
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

