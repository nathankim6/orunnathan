import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Sparkles } from "lucide-react";

interface DifficultyLabelProps {
  level: string;
  localDifficulty: string;
  onSelect: (level: number) => void;
}

export const DifficultyLabel = ({ level, localDifficulty, onSelect }: DifficultyLabelProps) => {
  const isActive = localDifficulty === level;
  
  const getConfig = (level: string) => {
    const configs: Record<string, { 
      label: string; 
      gradient: string; 
      glowColor: string;
      borderColor: string; 
      textColor: string; 
      hoverBg: string; 
      title: string; 
      detail: string;
      icon: string;
    }> = {
      "1": { 
        label: "원본",
        gradient: "from-slate-600 via-slate-700 to-slate-800",
        glowColor: "from-slate-400/30 to-slate-500/30",
        borderColor: "border-slate-200",
        textColor: "text-slate-700",
        hoverBg: "hover:bg-slate-50 hover:border-slate-300",
        title: "원본 유지",
        detail: "제공된 지문을 변경 없이 그대로 사용합니다. 원문의 표현을 정확하게 유지하고 싶을 때 선택하세요.",
        icon: "📄"
      },
      "2": { 
        label: "50% 변형",
        gradient: "from-indigo-500 via-indigo-600 to-blue-600",
        glowColor: "from-indigo-400/30 to-blue-400/30",
        borderColor: "border-indigo-100",
        textColor: "text-indigo-600",
        hoverBg: "hover:bg-indigo-50 hover:border-indigo-200",
        title: "부분 패러프레이즈",
        detail: "지문의 약 50%를 다른 표현으로 변형합니다. 핵심 문장은 유지하면서 일부 표현만 바꿉니다.",
        icon: "✨"
      },
      "3": { 
        label: "100% 변형",
        gradient: "from-violet-500 via-purple-600 to-fuchsia-600",
        glowColor: "from-violet-400/30 to-purple-400/30",
        borderColor: "border-violet-100",
        textColor: "text-violet-600",
        hoverBg: "hover:bg-violet-50 hover:border-violet-200",
        title: "전체 패러프레이즈",
        detail: "지문 전체를 완전히 다른 표현으로 변형합니다. 의미는 같지만 표현이 완전히 달라집니다.",
        icon: "🔄"
      }
    };
    return configs[level] || configs["1"];
  };

  const config = getConfig(level);

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            onClick={() => onSelect(Number(level))}
            className="relative flex-1 group/btn"
          >
            {/* Glow effect for active */}
            {isActive && (
              <div className={`absolute -inset-0.5 bg-gradient-to-r ${config.glowColor} rounded-xl blur-md opacity-70`} />
            )}
            
            <div className={`
              relative py-3 px-4 rounded-xl text-center transition-all duration-300 ease-out overflow-hidden
              ${isActive 
                ? `bg-gradient-to-br ${config.gradient} text-white shadow-lg` 
                : `bg-white/80 backdrop-blur-sm ${config.textColor} border ${config.borderColor} ${config.hoverBg} hover:shadow-md`
              }
            `}>
              {/* Inner shine effect */}
              {isActive && (
                <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none" />
              )}
              
              <span className={`text-xs font-bold block ${isActive ? 'text-white' : config.textColor}`}>
                {config.label}
              </span>
              <p className={`text-[10px] mt-0.5 ${isActive ? 'text-white/80' : 'text-slate-400'}`}>
                {config.title}
              </p>
            </div>
          </button>
        </TooltipTrigger>
        <TooltipContent
          side="bottom"
          className="bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 p-4 max-w-[240px] shadow-2xl rounded-xl"
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">{config.icon}</span>
            <span className="text-sm font-bold text-white">{config.title}</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed">{config.detail}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
