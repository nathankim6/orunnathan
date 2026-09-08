import { StopCircle, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useMemo } from "react";

interface LoadingProgressProps {
  current: number;
  total: number;
  onStop: () => void;
}

// Get connected AI model info
const getConnectedAIModel = () => {
  const geminiKey = localStorage.getItem('gemini_api_key');
  const claudeKey = localStorage.getItem('claude_api_key');
  const gptKey = localStorage.getItem('gpt_api_key');
  
  if (claudeKey) {
    return {
      name: 'Claude Sonnet',
      logo: '/lovable-uploads/019bcf23-a283-4df7-9f86-ab394da9498e.png',
      gradient: 'from-orange-500 to-amber-500',
      shadow: 'shadow-orange-500/30'
    };
  }
  if (geminiKey) {
    return {
      name: 'Gemini 3 Flash',
      logo: '/lovable-uploads/gemini-logo.png',
      gradient: 'from-blue-500 to-cyan-500',
      shadow: 'shadow-blue-500/30'
    };
  }
  if (gptKey) {
    return {
      name: 'GPT-5',
      logo: '/lovable-uploads/21d8d048-505b-4e56-ac5b-1c4cb56a5589.png',
      gradient: 'from-emerald-500 to-teal-500',
      shadow: 'shadow-emerald-500/30'
    };
  }
  return null;
};

export const LoadingProgress = ({ current, total, onStop }: LoadingProgressProps) => {
  const percentage = Math.round((current / total) * 100);
  const aiModel = useMemo(() => getConnectedAIModel(), []);

  return (
    <div className="relative">
      {/* Premium dark glassmorphism card */}
      <div className="relative rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/50 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.5)] overflow-hidden">
        
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-violet-600/10 animate-pulse" />
        
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, white 1px, transparent 0)', backgroundSize: '24px 24px' }} />
        
        {/* Glowing orbs */}
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 p-5">
          <div className="flex items-center gap-5">
            
            {/* AI Model Icon */}
            <div className="relative flex-shrink-0">
              <div className="relative w-14 h-14">
                {/* Spinning ring */}
                <div className="absolute inset-0 rounded-xl border-2 border-transparent border-t-blue-500 border-r-indigo-500 animate-spin" style={{ animationDuration: '2s' }} />
                
                {/* Inner container with model-specific gradient */}
                <div className={`absolute inset-1 rounded-lg bg-gradient-to-br ${aiModel?.gradient || 'from-blue-500 to-indigo-600'} shadow-lg ${aiModel?.shadow || 'shadow-blue-500/30'}`} />
                
                {/* Logo or fallback icon */}
                <div className="absolute inset-1 rounded-lg flex items-center justify-center bg-white/10 backdrop-blur-sm">
                  {aiModel?.logo ? (
                    <img 
                      src={aiModel.logo} 
                      alt={aiModel.name} 
                      className="w-7 h-7 object-contain drop-shadow-lg"
                    />
                  ) : (
                    <Sparkles className="w-6 h-6 text-white drop-shadow-lg" />
                  )}
                </div>
                
                {/* Pulsing dot */}
                <div className="absolute -top-1 -right-1 w-3 h-3">
                  <div className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75" />
                  <div className="relative w-3 h-3 bg-emerald-400 rounded-full border-2 border-slate-900" />
                </div>
              </div>
            </div>
            
            {/* Content section */}
            <div className="flex-1 min-w-0">
              {/* Title and status */}
              <div className="flex items-center justify-between mb-3">
                <div>
                  <h3 className="text-base font-bold text-white tracking-tight">
                    AI 문제 생성 중
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-1.5">
                    <span className="inline-block w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                    Neural Engine Processing
                  </p>
                </div>
                
                {/* Stats badges */}
                <div className="flex items-center gap-2">
                  <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/50">
                    <span className="text-lg font-bold font-mono bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
                      {current}
                    </span>
                    <span className="text-slate-500 font-mono text-sm">/{total}</span>
                  </div>
                  <div className="px-2.5 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-500/25">
                    <span className="text-sm font-bold font-mono text-white">{percentage}%</span>
                  </div>
                </div>
              </div>
              
              {/* Premium progress bar */}
              <div className="relative">
                <div className="h-2.5 bg-slate-800 rounded-full overflow-hidden shadow-inner">
                  {/* Background glow */}
                  <div 
                    className="absolute inset-y-0 left-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 blur-sm rounded-full transition-all duration-700 ease-out"
                    style={{ width: `${Math.min(percentage + 10, 100)}%` }}
                  />
                  
                  {/* Main progress */}
                  <div 
                    className="relative h-full bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full transition-all duration-500 ease-out"
                    style={{ width: `${percentage}%` }}
                  >
                    {/* Shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
                    
                    {/* Leading glow */}
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white/40 rounded-full blur-sm" />
                  </div>
                </div>
                
                {/* Step indicators */}
                <div className="absolute -bottom-2.5 left-0 right-0 flex justify-between px-0.5">
                  {Array.from({ length: Math.min(total, 10) }, (_, i) => {
                    const stepIndex = Math.floor((i * total) / Math.min(total, 10));
                    return (
                      <div 
                        key={i}
                        className={`w-1 h-1 rounded-full transition-all duration-300 ${
                          stepIndex < current 
                            ? 'bg-emerald-400 shadow-sm shadow-emerald-400/50' 
                            : stepIndex === current 
                            ? 'bg-blue-400 animate-pulse shadow-sm shadow-blue-400/50' 
                            : 'bg-slate-700'
                        }`}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Stop button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={onStop}
              className="h-10 px-4 rounded-xl bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/30 text-red-400 hover:text-red-300 transition-all duration-200 flex-shrink-0"
            >
              <StopCircle className="w-4 h-4 mr-1.5" />
              <span className="text-xs font-semibold">중단</span>
            </Button>
          </div>
        </div>
        
        {/* Bottom accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      </div>
    </div>
  );
};
