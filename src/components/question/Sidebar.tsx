import { TypeSelector } from "../TypeSelector";
import { ActionButtons } from "./ActionButtons";
import { ActionButtons as ToolButtons } from "../buttons/ActionButtons";
import { Book, Feather } from "lucide-react";
import { TypeEntry as TypeEntryType } from "@/types/question";

interface SidebarProps {
  selectedTypes: TypeEntryType[];
  handleTypeSelect: (type: any) => void;
  handleRemoveType: (typeId: string) => void;
  handleRemoveAllTypes?: () => void;
  handleReorderTypes?: (from: number, to: number) => void;

  handleGenerateAll: () => void;
  handleContinueGeneration?: () => void;
  isLoading: boolean;
  difficulty: string;
  complexity: string;
  handleDifficultyChange: (level: string) => void;
  handleComplexityChange: (level: string) => void;
  handleStopGeneration: () => void;
  handleDownloadDoc: () => void;
  openVocabModal: () => void;
  openStorageModal: () => void;
  openMockExamModal?: () => void;
  progress?: {
    current: number;
    total: number;
  };
  generationStats?: {
    hasGenerated: boolean;
    hasUngenerated: boolean;
    totalQuestions: number;
    generatedCount: number;
  };
}

export const Sidebar = ({
  selectedTypes,
  handleTypeSelect,
  handleRemoveType,
  handleRemoveAllTypes,
  handleReorderTypes,

  handleGenerateAll,
  handleContinueGeneration,
  isLoading,
  difficulty,
  complexity,
  handleDifficultyChange,
  handleComplexityChange,
  handleStopGeneration,
  handleDownloadDoc,
  openVocabModal,
  openStorageModal,
  openMockExamModal,
  progress,
  generationStats
}: SidebarProps) => {
  return (
    <div className="w-80 flex-shrink-0">
      <div className="sticky top-8 z-50">
        {/* Professional program-style panel */}
        <div className="relative bg-white rounded-md border border-slate-200 shadow-[0_1px_2px_rgba(15,23,42,0.04),0_4px_12px_-4px_rgba(15,23,42,0.06)] overflow-hidden">
          {/* Title bar - navy header like enterprise admin tools */}
          <div className="flex items-center justify-between px-4 h-10 bg-gradient-to-b from-slate-800 to-slate-900 border-b border-slate-900">
            <div className="flex items-center gap-2">
              <div className="w-1 h-4 bg-indigo-400 rounded-sm" />
              <span className="text-[12px] font-semibold tracking-wide text-slate-100 uppercase">
                Question Types
              </span>
            </div>
            <span className="text-[11px] font-medium text-slate-400 tabular-nums">
              {selectedTypes.length.toString().padStart(2, '0')} selected
            </span>
          </div>

          {/* Content area */}
          <div className="p-4 bg-slate-50/40">
            <TypeSelector
              selectedTypes={selectedTypes.map(entry => entry.type)}
              onSelect={handleTypeSelect}
              onRemove={handleRemoveType}
              onClearAll={handleRemoveAllTypes}
              onReorder={handleReorderTypes}
            />
          </div>

          {/* Status footer bar */}
          <div className="flex items-center justify-between px-4 h-7 bg-slate-100 border-t border-slate-200">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_4px_rgba(16,185,129,0.6)]" />
              <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">Ready</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400">v.NEW</span>
          </div>
        </div>

        <div className="mt-3">
          <ToolButtons
            openVocabModal={openMockExamModal || (() => {})}
            openStorageModal={openStorageModal}
          />
        </div>
      </div>
    </div>
  );
};
