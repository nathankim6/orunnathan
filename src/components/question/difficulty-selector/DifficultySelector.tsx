import { DifficultyLabel } from "./DifficultyLabel";
import { useState, useEffect } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ChevronDown, ChevronUp, Info, Sparkles } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import paraphraseIcon from "@/assets/paraphrase-icon.png";
import difficultyLevelIcon from "@/assets/difficulty-level-icon.png";
interface DifficultySelectorProps {
  localDifficulty: string;
  onDifficultyChange: (value: number[]) => void;
  complexity?: string;
  onComplexityChange?: (level: string) => void;
}

export const DifficultySelector = ({
  localDifficulty,
  onDifficultyChange,
  complexity = "수능",
  onComplexityChange
}: DifficultySelectorProps) => {
  const [localComplexity, setLocalComplexity] = useState(complexity);
  const [showComplexityTable, setShowComplexityTable] = useState(false);

  useEffect(() => {
    setLocalComplexity(complexity);
  }, [complexity]);

  const handleComplexityChange = (value: string) => {
    setLocalComplexity(value);
    if (onComplexityChange) {
      onComplexityChange(value);
    }
  };

  const toggleComplexityTable = () => {
    setShowComplexityTable(!showComplexityTable);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-stretch">
        {/* Paraphrase Level Control */}
        <div className="group relative h-full">
          {/* Outer glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-slate-400/20 via-indigo-400/20 to-slate-400/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
            {/* Inner highlight */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none" />
            
            {/* Subtle pattern */}
            <div 
              className="absolute inset-0 opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                backgroundSize: '20px 20px'
              }}
            />

            <div className="relative flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                  <img src={paraphraseIcon} alt="패러프레이즈" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block tracking-tight">패러프레이즈 수준</span>
                  <span className="text-xs text-slate-500">지문 변형 정도 설정</span>
                </div>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button className="w-7 h-7 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all duration-200 shadow-sm hover:shadow">
                      <Info size={14} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-[240px] bg-slate-900/95 backdrop-blur-xl border border-slate-700/50 text-white text-xs p-4 shadow-2xl rounded-xl">
                    <div className="flex items-center gap-2 mb-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      <span className="font-semibold">패러프레이즈란?</span>
                    </div>
                    <p className="text-slate-300 leading-relaxed">원본 지문의 의미를 유지하면서 다른 표현으로 바꾸는 것입니다. 수준이 높을수록 더 많은 변형이 적용됩니다.</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            
            <div className="relative flex gap-2 mt-auto">
              {[1, 2, 3].map(level => (
                <DifficultyLabel 
                  key={level} 
                  level={String(level)} 
                  localDifficulty={localDifficulty} 
                  onSelect={value => onDifficultyChange([value])} 
                />
              ))}
            </div>
          </div>
        </div>
        
        {/* Complexity Control */}
        <div className="group relative h-full">
          {/* Outer glow effect */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-400/20 via-purple-400/20 to-indigo-400/20 rounded-2xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <div className="relative bg-white/90 backdrop-blur-xl rounded-2xl p-5 border border-slate-200/60 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden h-full flex flex-col">
            {/* Inner highlight */}
            <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-transparent to-transparent pointer-events-none" />
            
            {/* Subtle pattern */}
            <div 
              className="absolute inset-0 opacity-[0.02] pointer-events-none"
              style={{
                backgroundImage: `radial-gradient(circle at 1px 1px, currentColor 1px, transparent 0)`,
                backgroundSize: '20px 20px'
              }}
            />

            <div className="relative flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 flex items-center justify-center">
                  <img src={difficultyLevelIcon} alt="난이도" className="w-full h-full object-contain" />
                </div>
                <div>
                  <span className="text-sm font-bold text-slate-800 block tracking-tight">문제 난이도</span>
                  <span className="text-xs text-slate-500">선택지 복잡도 설정</span>
                </div>
              </div>
              <button 
                onClick={toggleComplexityTable} 
                className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-indigo-600 transition-all duration-200 font-medium px-3 py-1.5 rounded-lg hover:bg-indigo-50/80 border border-transparent hover:border-indigo-100"
              >
                상세보기 {showComplexityTable ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            </div>
            
            <div className="relative flex gap-2 mt-auto">
              {["수능", "토플", "GRE"].map(level => (
                <ComplexityButton 
                  key={level} 
                  level={level} 
                  isSelected={localComplexity === level} 
                  onSelect={() => handleComplexityChange(level)} 
                />
              ))}
            </div>
          </div>
        </div>
      </div>
      
      {/* Complexity Table */}
      {showComplexityTable && (
        <div className="relative group animate-fade-in">
          {/* Outer glow */}
          <div className="absolute -inset-0.5 bg-gradient-to-r from-indigo-400/10 via-purple-400/10 to-indigo-400/10 rounded-2xl blur-lg" />
          
          <div className="relative bg-white/95 backdrop-blur-xl rounded-2xl border border-slate-200/60 overflow-hidden shadow-xl">
            {/* Header gradient bar */}
            <div className="h-1 bg-gradient-to-r from-slate-400 via-indigo-500 to-purple-600" />
            
            <Table>
              <TableHeader className="bg-gradient-to-r from-slate-50/90 via-white to-slate-50/90">
                <TableRow className="border-b border-slate-200/60">
                  <TableHead className="w-[180px] text-slate-700 font-bold text-xs py-5 pl-6">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-gradient-to-r from-slate-400 to-slate-600" />
                      체크 항목
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-bold text-xs py-5">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-slate-700 bg-gradient-to-r from-slate-100 to-slate-200 px-4 py-1.5 rounded-full shadow-sm border border-slate-200/50">수능</span>
                      <span className="text-[10px] text-slate-500 font-medium">CEFR B1~B2</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-bold text-xs py-5">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-white bg-gradient-to-r from-indigo-500 to-indigo-600 px-4 py-1.5 rounded-full shadow-md">토플</span>
                      <span className="text-[10px] text-indigo-500 font-medium">CEFR C1</span>
                    </div>
                  </TableHead>
                  <TableHead className="text-center font-bold text-xs py-5 pr-6">
                    <div className="flex flex-col items-center gap-2">
                      <span className="text-white bg-gradient-to-r from-violet-500 to-purple-600 px-4 py-1.5 rounded-full shadow-md">GRE</span>
                      <span className="text-[10px] text-violet-500 font-medium">CEFR C2</span>
                    </div>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow className="border-b border-slate-100/80 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-transparent transition-colors">
                  <TableCell className="font-semibold bg-gradient-to-r from-slate-50/80 to-transparent text-xs text-slate-700 py-4 pl-6">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600">1</span>
                      단어 수준
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-xs text-slate-600 py-4">고등학교 필수 어휘</TableCell>
                  <TableCell className="text-center text-xs text-slate-600 py-4">대학 학술 어휘<br /><span className="text-indigo-500">(Academic Word List)</span></TableCell>
                  <TableCell className="text-center text-xs text-slate-600 py-4 pr-6">대학원 전문 어휘<br /><span className="text-violet-500">(GRE Vocabulary)</span></TableCell>
                </TableRow>
                <TableRow className="border-b border-slate-100/80 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-transparent transition-colors">
                  <TableCell className="font-semibold bg-gradient-to-r from-slate-50/80 to-transparent text-xs text-slate-700 py-4 pl-6">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600">2</span>
                      추론 요구
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-xs text-slate-600 py-4">지문에 명시된<br />사실 확인 중심</TableCell>
                  <TableCell className="text-center text-xs text-slate-600 py-4">암시·함축 의미 및<br />저자 의도 추론</TableCell>
                  <TableCell className="text-center text-xs text-slate-600 py-4 pr-6">논리 구조 분석 및<br />비판적 평가 필요</TableCell>
                </TableRow>
                <TableRow className="border-b border-slate-100/80 hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-transparent transition-colors">
                  <TableCell className="font-semibold bg-gradient-to-r from-slate-50/80 to-transparent text-xs text-slate-700 py-4 pl-6">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600">3</span>
                      선택지 난이도
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-xs text-slate-600 py-4">정답과 오답 간<br />명확한 구분 가능</TableCell>
                  <TableCell className="text-center text-xs text-slate-600 py-4">매력적 오답 포함<br /><span className="text-indigo-500">(부분 일치 함정)</span></TableCell>
                  <TableCell className="text-center text-xs text-slate-600 py-4 pr-6">모든 선택지가<br /><span className="text-violet-500">정답처럼 보이는 구성</span></TableCell>
                </TableRow>
                <TableRow className="hover:bg-gradient-to-r hover:from-slate-50/50 hover:to-transparent transition-colors">
                  <TableCell className="font-semibold bg-gradient-to-r from-slate-50/80 to-transparent text-xs text-slate-700 py-4 pl-6">
                    <span className="inline-flex items-center gap-2">
                      <span className="w-5 h-5 rounded-md bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-[10px] font-bold text-slate-600">4</span>
                      사고 수준
                    </span>
                  </TableCell>
                  <TableCell className="text-center text-xs text-slate-600 py-4">직접 제시된 정보<br />기반 이해력 측정</TableCell>
                  <TableCell className="text-center text-xs text-slate-600 py-4">비유·은유 해석 및<br />맥락적 의미 파악</TableCell>
                  <TableCell className="text-center text-xs text-slate-600 py-4 pr-6">비판적 사고력 및<br />논증 평가 능력</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
};

interface ComplexityButtonProps {
  level: string;
  isSelected: boolean;
  onSelect: () => void;
}

const ComplexityButton = ({
  level,
  isSelected,
  onSelect
}: ComplexityButtonProps) => {
  const getConfig = (level: string) => {
    const configs: Record<string, {
      description: string;
      gradient: string;
      selectedGradient: string;
      borderColor: string;
      textColor: string;
      hoverBg: string;
      glowColor: string;
    }> = {
      "수능": {
        description: "수능 수준",
        gradient: "from-slate-600 via-slate-700 to-slate-800",
        selectedGradient: "from-slate-600 via-slate-700 to-slate-800",
        borderColor: "border-slate-200",
        textColor: "text-slate-700",
        hoverBg: "hover:bg-slate-50 hover:border-slate-300",
        glowColor: "from-slate-400/30 to-slate-500/30"
      },
      "토플": {
        description: "TOEFL 수준",
        gradient: "from-indigo-500 via-indigo-600 to-blue-600",
        selectedGradient: "from-indigo-500 via-indigo-600 to-blue-600",
        borderColor: "border-indigo-100",
        textColor: "text-indigo-600",
        hoverBg: "hover:bg-indigo-50 hover:border-indigo-200",
        glowColor: "from-indigo-400/30 to-blue-400/30"
      },
      "GRE": {
        description: "GRE 수준",
        gradient: "from-violet-500 via-purple-600 to-fuchsia-600",
        selectedGradient: "from-violet-500 via-purple-600 to-fuchsia-600",
        borderColor: "border-violet-100",
        textColor: "text-violet-600",
        hoverBg: "hover:bg-violet-50 hover:border-violet-200",
        glowColor: "from-violet-400/30 to-purple-400/30"
      }
    };
    return configs[level] || configs["수능"];
  };

  const config = getConfig(level);

  return (
    <button 
      onClick={onSelect} 
      className="relative flex-1 group/btn"
    >
      {/* Glow effect for selected */}
      {isSelected && (
        <div className={`absolute -inset-0.5 bg-gradient-to-r ${config.glowColor} rounded-xl blur-md opacity-70`} />
      )}
      
      <div className={`
        relative py-3 px-4 rounded-xl text-center transition-all duration-300 ease-out overflow-hidden
        ${isSelected 
          ? `bg-gradient-to-br ${config.selectedGradient} text-white shadow-lg` 
          : `bg-white/80 backdrop-blur-sm ${config.textColor} border ${config.borderColor} ${config.hoverBg} hover:shadow-md`
        }
      `}>
        {/* Inner shine effect */}
        {isSelected && (
          <div className="absolute inset-0 bg-gradient-to-t from-transparent via-white/10 to-white/20 pointer-events-none" />
        )}
        
        <span className={`text-xs font-bold ${isSelected ? 'text-white' : config.textColor} block`}>
          {level}
        </span>
        <p className={`text-[10px] mt-0.5 ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
          {config.description}
        </p>
      </div>
    </button>
  );
};
