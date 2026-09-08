import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Key, LogOut, Unplug, ShieldCheck } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";

interface LoginSectionProps {
  showLoginForm: boolean;
  userName: string;
  expiryDate: string;
  accessCode: string;
  setAccessCode: (code: string) => void;
  handleLogin: () => void;
  handleLogout: () => void;
  setShowLoginForm: (show: boolean) => void;
  selectedAPI?: string;
  isAPIConnected?: boolean;
}

// Get connected AI model info based on selected API
const getConnectedAIModel = (selectedAPI?: string) => {
  const geminiKey = localStorage.getItem('gemini_api_key');
  const claudeKey = localStorage.getItem('claude_api_key');
  const gptKey = localStorage.getItem('gpt_api_key');
  
  // If a specific API is selected and has a key, show that one
  if (selectedAPI === 'gemini' && geminiKey) {
    return {
      name: 'Gemini 3 Flash',
      logo: '/lovable-uploads/gemini-logo.png',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      shadow: 'shadow-blue-500/20'
    };
  }
  if (selectedAPI === 'claude' && claudeKey) {
    return {
      name: 'Claude Sonnet',
      logo: '/lovable-uploads/019bcf23-a283-4df7-9f86-ab394da9498e.png',
      gradient: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      shadow: 'shadow-orange-500/20'
    };
  }
  if (selectedAPI === 'gpt' && gptKey) {
    return {
      name: 'GPT-5',
      logo: '/lovable-uploads/21d8d048-505b-4e56-ac5b-1c4cb56a5589.png',
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      shadow: 'shadow-emerald-500/20'
    };
  }
  
  // Fallback: show any connected API
  if (claudeKey) {
    return {
      name: 'Claude Sonnet',
      logo: '/lovable-uploads/019bcf23-a283-4df7-9f86-ab394da9498e.png',
      gradient: 'from-orange-500 to-amber-500',
      bgGradient: 'from-orange-50 to-amber-50',
      borderColor: 'border-orange-200',
      textColor: 'text-orange-700',
      shadow: 'shadow-orange-500/20'
    };
  }
  if (geminiKey) {
    return {
      name: 'Gemini 3 Flash',
      logo: '/lovable-uploads/gemini-logo.png',
      gradient: 'from-blue-500 to-cyan-500',
      bgGradient: 'from-blue-50 to-cyan-50',
      borderColor: 'border-blue-200',
      textColor: 'text-blue-700',
      shadow: 'shadow-blue-500/20'
    };
  }
  if (gptKey) {
    return {
      name: 'GPT-5',
      logo: '/lovable-uploads/21d8d048-505b-4e56-ac5b-1c4cb56a5589.png',
      gradient: 'from-emerald-500 to-teal-500',
      bgGradient: 'from-emerald-50 to-teal-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-700',
      shadow: 'shadow-emerald-500/20'
    };
  }
  return null;
};

export const LoginSection = ({
  showLoginForm,
  userName,
  expiryDate,
  accessCode,
  setAccessCode,
  handleLogin,
  handleLogout,
  setShowLoginForm,
  selectedAPI,
  isAPIConnected
}: LoginSectionProps) => {
  const aiModel = useMemo(() => getConnectedAIModel(selectedAPI), [selectedAPI, isAPIConnected]);
  const navigate = useNavigate();
  const isAdmin = typeof window !== 'undefined' && localStorage.getItem('isAdmin') === 'true';
  return (
    <>
      {showLoginForm ? (
        <div className="space-y-2">
          <div className="space-y-2">
            <div className="relative flex-1">
              <Key className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-3.5 h-3.5" />
              <Input
                type="text"
                placeholder="엑세스 코드를 입력하세요..."
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                className="h-9 pl-9 font-mono text-xs bg-slate-50 border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 placeholder:text-slate-300 text-slate-800 rounded-lg"
              />
            </div>
            <div className="flex gap-2">
              <Button 
                onClick={handleLogin}
                className="flex-1 h-8 rounded-lg font-medium text-xs bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                로그인
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowLoginForm(false)}
                className="h-8 px-3 rounded-lg text-xs border-slate-200 hover:bg-slate-50 text-slate-600"
              >
                취소
              </Button>
            </div>
          </div>
        </div>
      ) : (userName || expiryDate) ? (
        <div className="space-y-2 flex-1 flex flex-col">
          {/* User Auth Status */}
          <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-emerald-50 border border-emerald-200 transition-all duration-200">
            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            
            <div className="flex-1 min-w-0">
              <span className="text-xs font-medium block text-emerald-700">
                {userName || '인증됨'}
              </span>
              {expiryDate && (
                <span className="text-[10px] truncate block text-emerald-600">
                  만료: {expiryDate}
                </span>
              )}
            </div>
            
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="px-1.5 py-0.5 rounded-full bg-emerald-500 text-[8px] font-semibold text-white uppercase">
                Active
              </span>
              {isAdmin && (
                <button
                  onClick={() => navigate('/admin')}
                  className="flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-500 hover:bg-indigo-600 transition-colors text-white text-[10px] font-semibold"
                  title="코드 관리 페이지로 이동"
                >
                  <ShieldCheck className="w-3 h-3" />
                  코드관리
                </button>
              )}
              <button
                onClick={handleLogout}
                className="p-1 rounded hover:bg-red-100 transition-colors"
                title="로그아웃"
              >
                <LogOut className="w-3.5 h-3.5 text-red-500" />
              </button>
            </div>
          </div>
          
          {/* Connected AI Model Display */}
          {aiModel && (
            <div className={`flex items-center gap-2.5 px-2.5 py-2 rounded-lg bg-gradient-to-r ${aiModel.bgGradient} border ${aiModel.borderColor} transition-all duration-200`}>
              {/* Animated AI Logo */}
              <div className="relative flex-shrink-0">
                <div className="relative w-8 h-8">
                  {/* Spinning outer ring */}
                  <div className={`absolute inset-0 rounded-lg border-2 border-transparent border-t-current border-r-current ${aiModel.textColor} animate-spin opacity-60`} style={{ animationDuration: '3s' }} />
                  
                  {/* Pulsing glow */}
                  <div className={`absolute inset-0 rounded-lg bg-gradient-to-br ${aiModel.gradient} opacity-20 animate-pulse`} />
                  
                  {/* Logo container */}
                  <div className={`absolute inset-0.5 rounded-md bg-white shadow-sm ${aiModel.shadow} flex items-center justify-center overflow-hidden`}>
                    <img 
                      src={aiModel.logo} 
                      alt={aiModel.name} 
                      className="w-5 h-5 object-contain animate-pulse"
                      style={{ animationDuration: '2s' }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <span className={`text-xs font-semibold block ${aiModel.textColor}`}>
                  {aiModel.name}
                </span>
                <span className={`text-[10px] block ${aiModel.textColor} opacity-70`}>
                  AI Connected
                </span>
              </div>
              
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <span className={`px-1.5 py-0.5 rounded-full bg-gradient-to-r ${aiModel.gradient} text-[8px] font-semibold text-white uppercase shadow-sm`}>
                  Live
                </span>
                <button
                  onClick={() => {
                    if (selectedAPI) {
                      localStorage.removeItem(`${selectedAPI}_api_key`);
                      window.location.reload();
                    }
                  }}
                  className="p-1 rounded hover:bg-red-100 transition-colors"
                  title="AI 연결 해제"
                >
                  <Unplug className="w-3.5 h-3.5 text-red-500" />
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <Button 
          variant="outline"
          size="sm"
          onClick={() => setShowLoginForm(true)}
          className="w-full h-8 rounded-lg text-xs border-slate-200 hover:bg-slate-50 text-slate-600 font-medium"
        >
          <Key className="h-3.5 w-3.5 mr-1.5" />
          엑세스 코드로 로그인
        </Button>
      )}
    </>
  );
};
