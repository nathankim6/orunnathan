import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ClearButtonProps {
  onClick: () => void;
}

export const ClearButton = ({ onClick }: ClearButtonProps) => {
  return (
    <Button
      onClick={onClick}
      variant="ghost"
      className="h-10 px-4 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
    >
      <Trash2 className="w-4 h-4 mr-1.5" />
      <span className="text-[13px] font-medium">전체 삭제</span>
    </Button>
  );
};
