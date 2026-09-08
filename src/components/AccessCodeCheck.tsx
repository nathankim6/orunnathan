
import { useState, useEffect } from "react";
import { LoginForm } from "./login/LoginForm";
import { LoginTitle } from "./login/LoginTitle";
import { LoginLogo } from "./login/LoginLogo";
import { BackgroundMedia } from "./login/BackgroundMedia";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useToast } from "./ui/use-toast";

interface AccessCodeCheckProps {
  onAccessGranted: () => void;
}

export const AccessCodeCheck = ({ onAccessGranted }: AccessCodeCheckProps) => {
  const [background, setBackground] = useState<{ url: string; is_video: boolean }>({
    url: "https://jpanpwbdlhsxnyaldddm.supabase.co/storage/v1/object/public/backgrounds/___202511181049.mp4",
    is_video: true
  });
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const fetchRandomBackground = async () => {
      const { data: countData } = await supabase
        .from('backgrounds')
        .select('id', { count: 'exact' });

      if (countData) {
        const count = countData.length;
        const randomOffset = Math.floor(Math.random() * count);

        const { data, error } = await supabase
          .from('backgrounds')
          .select('url, is_video')
          .range(randomOffset, randomOffset)
          .limit(1);

        if (!error && data && data.length > 0) {
          setBackground(data[0]);
        }
      }
    };

    fetchRandomBackground();
  }, []);

  const handleAccessCode = async (code: string) => {
    // Admin codes
    if (code === "skywalker89" || code === "891127") {
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("hasAccess", "true");
      localStorage.setItem("lastLoginTime", Date.now().toString());
      localStorage.setItem("accessCode", code);
      localStorage.setItem("userName", code === "891127" ? "슈퍼관리자" : "관리자");
      window.dispatchEvent(new Event('auth-changed'));
      toast({
        title: "관리자 모드",
        description: "관리자 모드로 전환되었습니다.",
      });
      onAccessGranted();
      navigate("/admin");
      return;
    }

    const { data, error } = await supabase.rpc('validate_access_code', { input_code: code });

    if (error) {
      toast({
        title: "오류",
        description: "엑세스 코드 확인 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return;
    }

    const row = Array.isArray(data) ? data[0] : data;
    if (row) {
      const expiryDate = new Date(row.expiry_date);
      if (row.valid) {
        localStorage.setItem("hasAccess", "true");
        localStorage.setItem("lastLoginTime", Date.now().toString());
        localStorage.setItem("subscriptionExpiry", expiryDate.toISOString());
        localStorage.setItem("userName", row.name);
        localStorage.setItem("accessCode", code);
        await supabase.rpc('touch_access_code', { input_code: code });
        window.dispatchEvent(new Event('auth-changed'));
        onAccessGranted();
      } else {
        toast({
          title: "만료된 코드",
          description: "엑세스 코드가 만료되었습니다.",
          variant: "destructive",
        });
      }
    } else {
      toast({
        title: "잘못된 코드",
        description: "올바르지 않은 엑세스 코드입니다.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative">
      <BackgroundMedia url={background.url} isVideo={background.is_video} />
      
      {/* Overlay gradient for depth */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent z-[1]" />
      
      <div className="relative z-10 w-full max-w-sm mx-auto px-6">
        {/* Glass card with premium styling */}
        <div className="relative overflow-hidden">
          {/* Subtle glow effect behind card */}
          <div className="absolute -inset-4 bg-gradient-to-br from-white/10 via-transparent to-white/5 blur-2xl" />
          
          <div className="relative backdrop-blur-xl bg-white/[0.08] border border-white/[0.12] rounded-2xl p-8 shadow-[0_8px_32px_rgba(0,0,0,0.3)]">
            {/* Top accent line */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
            
            <div className="space-y-6">
              <LoginLogo />
              <LoginTitle />
              <div className="pt-2">
                <LoginForm onAccessGranted={handleAccessCode} />
              </div>
            </div>
            
            {/* Bottom subtle decoration */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
        </div>
        
        {/* Footer text */}
        <p className="text-center text-white/40 text-xs mt-6 tracking-wider font-light">
          ORUN ACADEMY © 2025
        </p>
      </div>
    </div>
  );
};
