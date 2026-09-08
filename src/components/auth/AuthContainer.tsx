import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { APIConfigWithAuth } from "@/components/auth/APIConfigWithAuth";
export const AuthContainer = () => {
  const [userName, setUserName] = useState<string>("");
  const [expiryDate, setExpiryDate] = useState<string>("");
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [accessCode, setAccessCode] = useState("");
  const {
    toast
  } = useToast();
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("hasAccess");
    localStorage.removeItem("lastLoginTime");
    localStorage.removeItem("subscriptionExpiry");
    localStorage.removeItem("userName");
    localStorage.removeItem("isAdmin");
    // Notify App to recompute access immediately
    window.dispatchEvent(new Event('auth-changed'));
    toast({
      title: "로그아웃 성공",
      description: "성공적으로 로그아웃되었습니다."
    });
    navigate("/login");
  };
  const handleLogin = async () => {
    // Super admin code - grant full access
    if (accessCode === "891127") {
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("hasAccess", "true");
      localStorage.setItem("lastLoginTime", Date.now().toString());
      localStorage.setItem("accessCode", accessCode);
      localStorage.setItem("userName", "슈퍼관리자");
      setUserName("슈퍼관리자");
      setShowLoginForm(false);
      setAccessCode("");
      toast({
        title: "슈퍼관리자 모드",
        description: "모든 메뉴가 활성화되었습니다.",
      });
      return;
    }

    // Admin access code quick path
    if (accessCode === "skywalker90") {
      localStorage.setItem("isAdmin", "true");
      localStorage.setItem("accessCode", accessCode);
      toast({
        title: "관리자 모드",
        description: "엑세스 코드 관리 화면으로 이동합니다.",
      });
      navigate("/admin");
      return;
    }
    try {
      const {
        data: accessCodeData,
        error
      } = await supabase.from('access_codes').select('*').eq('code', accessCode).maybeSingle();
      if (error) {
        throw error;
      }
      if (accessCodeData && new Date(accessCodeData.expiry_date) > new Date()) {
        localStorage.setItem("hasAccess", "true");
        localStorage.setItem("lastLoginTime", Date.now().toString());
        localStorage.setItem("subscriptionExpiry", accessCodeData.expiry_date);
        localStorage.setItem("userName", accessCodeData.name);
        localStorage.setItem("accessCode", accessCode);
        // Update last accessed timestamp
        await supabase.from('access_codes').update({ last_accessed: new Date().toISOString() }).eq('code', accessCode);
        const formattedDate = new Date(accessCodeData.expiry_date).toLocaleDateString('ko-KR', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        setExpiryDate(formattedDate);
        setUserName(accessCodeData.name);
        setShowLoginForm(false);
        setAccessCode("");
        toast({
          title: "로그인 성공",
          description: "엑세스 코드가 확인되었습니다."
        });
      } else {
        toast({
          title: "로그인 실패",
          description: "유효하지 않은 엑세스 코드입니다.",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "오류 발생",
        description: "엑세스 코드 확인 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      console.error("Access code check error:", error);
    }
  };
  useEffect(() => {
    const hasAccess = localStorage.getItem("hasAccess") === "true";
    const storedExpiry = localStorage.getItem("subscriptionExpiry");
    const storedName = localStorage.getItem("userName");
    const storedCode = localStorage.getItem("accessCode");
    if (hasAccess) {
      if (storedExpiry) {
        const formattedDate = new Date(storedExpiry).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
        setExpiryDate(formattedDate);
      }
      if (storedName) setUserName(storedName);
      setShowLoginForm(false);

      // Refresh nickname from DB so admin edits show up without re-login
      if (storedCode && storedCode !== "891127" && storedCode !== "skywalker90") {
        supabase
          .from('access_codes')
          .select('name, expiry_date')
          .eq('code', storedCode)
          .maybeSingle()
          .then(({ data }) => {
            if (data?.name) {
              localStorage.setItem("userName", data.name);
              setUserName(data.name);
            }
            if (data?.expiry_date) {
              localStorage.setItem("subscriptionExpiry", data.expiry_date);
              setExpiryDate(new Date(data.expiry_date).toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' }));
            }
          });
      }
    }
  }, []);
  return <APIConfigWithAuth showLoginForm={showLoginForm} userName={userName} expiryDate={expiryDate} accessCode={accessCode} setAccessCode={setAccessCode} handleLogin={handleLogin} handleLogout={handleLogout} setShowLoginForm={setShowLoginForm} />;
};
