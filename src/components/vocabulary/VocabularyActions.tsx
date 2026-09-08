import React from 'react';
import { Button } from "@/components/ui/button";
import { FileDown, Plus } from "lucide-react";

interface VocabularyActionsProps {
  onAddEntry: () => void;
  isAddingEntry: boolean;
  onSaveNewEntry: () => void;
  onCancelNewEntry: () => void;
  onDownloadPDF: () => void;
}

export const VocabularyActions = ({
  onAddEntry,
  isAddingEntry,
  onSaveNewEntry,
  onCancelNewEntry,
  onDownloadPDF
}: VocabularyActionsProps) => {
  return (
    <div className="flex justify-between mt-4">
      <Button
        onClick={onAddEntry}
        className="bg-cyan-500 hover:bg-cyan-600"
        disabled={isAddingEntry}
      >
        <Plus className="w-4 h-4 mr-2" />
        단어 추가
      </Button>
      {isAddingEntry ? (
        <div className="space-x-2">
          <Button
            onClick={onSaveNewEntry}
            className="bg-cyan-500 hover:bg-cyan-600"
          >
            저장
          </Button>
          <Button
            variant="outline"
            onClick={onCancelNewEntry}
          >
            취소
          </Button>
        </div>
      ) : (
        <Button
          onClick={onDownloadPDF}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:opacity-90"
        >
          <FileDown className="w-4 h-4 mr-2" />
          WORD로 저장하기
        </Button>
      )}
    </div>
  );
};
