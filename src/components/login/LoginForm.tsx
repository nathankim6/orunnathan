import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Lock, ArrowRight, Loader2 } from "lucide-react";

interface LoginFormProps {
  onAccessGranted: (code: string) => void;
}

export function LoginForm({ onAccessGranted }: LoginFormProps) {
  const [code, setCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!code) {
      toast({
        title: "오류",
        description: "엑세스 코드를 입력해주세요.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Admin codes
      if (code === "891127" || code === "skywalker90") {
        localStorage.setItem("hasAccess", "true");
        localStorage.setItem("lastLoginTime", Date.now().toString());
        localStorage.setItem("isAdmin", "true");
        localStorage.setItem("accessCode", code);
        localStorage.setItem("userName", code === "891127" ? "슈퍼관리자" : "관리자");
        window.dispatchEvent(new Event('auth-changed'));
        onAccessGranted(code);
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.rpc('validate_access_code', { input_code: code });

      if (error) {
        throw error;
      }

      const row = Array.isArray(data) ? data[0] : data;
      if (row && row.valid) {
        localStorage.setItem("hasAccess", "true");
        localStorage.setItem("subscriptionExpiry", new Date(row.expiry_date).toISOString());
        localStorage.setItem("userName", row.name || 'Default User');
        await supabase.rpc('touch_access_code', { input_code: code });
        window.dispatchEvent(new Event('auth-changed'));
        onAccessGranted(code);


        toast({
          title: "로그인 성공",
          description: "엑세스 코드가 확인되었습니다.",
        });
      } else {
        toast({
          title: "로그인 실패",
          description: row ? "만료된 엑세스 코드입니다." : "유효하지 않은 엑세스 코드입니다.",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "엑세스 코드 확인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      console.error("Access code check error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="space-y-4">
      {/* Input container */}
      <div className={`
        relative group transition-all duration-300
        ${isFocused ? 'transform scale-[1.02]' : ''}
      `}>
        {/* Input glow effect */}
        <div className={`
          absolute -inset-0.5 rounded-xl transition-all duration-300
          ${isFocused 
            ? 'bg-gradient-to-r from-white/20 via-white/10 to-white/20 opacity-100' 
            : 'opacity-0'
          }
        `} />
        
        <div className="relative flex items-center">
          <div className="absolute left-4 text-white/40 transition-colors duration-300 group-hover:text-white/60">
            <Lock className="w-4 h-4" />
          </div>
          
          <input
            type="text"
            placeholder="Access Code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            onKeyPress={handleKeyPress}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            disabled={isLoading}
            className="
              w-full pl-11 pr-4 py-3.5
              bg-white/[0.06] hover:bg-white/[0.08]
              border border-white/[0.08] hover:border-white/[0.15]
              focus:border-white/25 focus:bg-white/[0.1]
              rounded-xl
              text-white/90 text-sm tracking-wider
              placeholder:text-white/30 placeholder:font-light placeholder:tracking-widest
              outline-none
              transition-all duration-300
              disabled:opacity-50 disabled:cursor-not-allowed
            "
          />
        </div>
      </div>
      
      {/* Submit button */}
      <button 
        onClick={handleSubmit} 
        disabled={isLoading}
        className="
          relative w-full py-3.5 
          bg-white/[0.1] hover:bg-white/[0.15] active:bg-white/[0.2]
          border border-white/[0.1] hover:border-white/[0.2]
          rounded-xl
          text-white/80 hover:text-white text-sm font-medium tracking-widest uppercase
          transition-all duration-300
          disabled:opacity-50 disabled:cursor-not-allowed
          group overflow-hidden
        "
      >
        {/* Button shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        
        <span className="relative flex items-center justify-center gap-2">
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>확인 중...</span>
            </>
          ) : (
            <>
              <span>Enter</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </>
          )}
        </span>
      </button>
    </div>
  );
}
