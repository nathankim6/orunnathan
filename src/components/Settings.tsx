import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Settings as SettingsIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function Settings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [subscriptionExpiry, setSubscriptionExpiry] = useState<string | null>(null);
  const [hancomApiKey, setHancomApiKey] = useState<string>("");

  useEffect(() => {
    const storedExpiry = localStorage.getItem("subscriptionExpiry");
    if (storedExpiry) {
      setSubscriptionExpiry(storedExpiry);
    }
    
    const storedApiKey = localStorage.getItem("hancom_api_key");
    if (storedApiKey) {
      setHancomApiKey(storedApiKey);
    }
  }, []);

  const handleAdminAccess = () => {
    navigate("/admin");
  };

  const handleReturnToMain = () => {
    localStorage.removeItem("hasAccess");
    localStorage.removeItem("lastLoginTime");
    localStorage.removeItem("subscriptionExpiry");
    localStorage.removeItem("userName");
    localStorage.removeItem("isAdmin");
    navigate("/login");
  };

  const handleSaveApiKey = () => {
    localStorage.setItem("hancom_api_key", hancomApiKey);
    toast({
      title: "저장 완료",
      description: "한컴 API 키가 저장되었습니다.",
    });
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon">
          <SettingsIcon className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>설정</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <h4 className="font-medium">구독 정보</h4>
            {subscriptionExpiry ? (
              <p className="text-sm text-muted-foreground">
                구독 만료일: {new Date(subscriptionExpiry).toLocaleDateString()}
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                구독 정보를 찾을 수 없습니다.
              </p>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">한컴 API 설정</h4>
            <p className="text-xs text-muted-foreground">
              HWP 파일로 저장하려면 한컴 API 키가 필요합니다.
            </p>
            <div className="space-y-2">
              <Label htmlFor="hancom-api-key">API 키</Label>
              <Input
                id="hancom-api-key"
                type="password"
                value={hancomApiKey}
                onChange={(e) => setHancomApiKey(e.target.value)}
                placeholder="한컴 API 키를 입력하세요"
              />
              <Button onClick={handleSaveApiKey} className="w-full" size="sm">
                API 키 저장
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">관리자 접근</h4>
            <Button onClick={handleAdminAccess} className="w-full">
              관리자 페이지로 이동
            </Button>
            <Button 
              onClick={handleReturnToMain} 
              variant="outline" 
              className="w-full mt-2"
            >
              메인화면으로 이동
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
