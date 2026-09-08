import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, ExternalLink, XCircle, Terminal, Server, Database, Shield, Cpu, User, Unplug } from "lucide-react";
import { Settings } from "../Settings";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { LoginSection } from "./LoginSection";
import { AnthropicClient } from "@/lib/ai/anthropicClient";
import { GeminiClient } from "@/lib/ai/geminiClient";
import { OpenAIClient } from "@/lib/ai/openaiClient";

interface APIResponse {
  success: boolean;
  message: string;
}
interface APIConfigWithAuthProps {
  showLoginForm: boolean;
  userName: string;
  expiryDate: string;
  accessCode: string;
  setAccessCode: (code: string) => void;
  handleLogin: () => void;
  handleLogout: () => void;
  setShowLoginForm: (show: boolean) => void;
}
export function APIConfigWithAuth({
  showLoginForm,
  userName,
  expiryDate,
  accessCode,
  setAccessCode,
  handleLogin,
  handleLogout,
  setShowLoginForm
}: APIConfigWithAuthProps) {
  const [apiKey, setApiKey] = useState("");
  const [testResult, setTestResult] = useState<APIResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAPI, setSelectedAPI] = useState("claude");
  const {
    toast
  } = useToast();
  useEffect(() => {
    const savedApiKey = localStorage.getItem(`${selectedAPI}_api_key`);
    if (savedApiKey) {
      setApiKey(savedApiKey);
      setTestResult({
        success: true,
        message: "설정된 API 키가 있습니다."
      });
    } else {
      setApiKey("");
      setTestResult(null);
    }
  }, [selectedAPI]);
  const handleTestConnection = async () => {
    if (!apiKey) {
      setTestResult({
        success: false,
        message: "API 키를 입력해주세요."
      });
      return;
    }
    setIsLoading(true);
    try {
      // Validate API key format first
      const isValidFormat = selectedAPI === "gemini" 
        ? (apiKey.startsWith("AIza") && apiKey.length > 20)
        : (apiKey.startsWith("sk-") && apiKey.length > 20);
      
      if (!isValidFormat) {
        const expectedFormat = selectedAPI === "gemini" ? "AIza..." : "sk-...";
        setTestResult({
          success: false,
          message: `올바른 API 키 형식이 아닙니다. (${expectedFormat})`
        });
        toast({
          title: "오류",
          description: `올바른 API 키 형식이 아닙니다. ${expectedFormat} 형식이어야 합니다.`,
          variant: "destructive"
        });
        setIsLoading(false);
        return;
      }

      // Test actual API connection
      let client;
      if (selectedAPI === "claude") {
        client = new AnthropicClient({ apiKey, model: "claude-sonnet-4-5-20250929" });
      } else if (selectedAPI === "gemini") {
        client = new GeminiClient({ apiKey, model: "gemini-3-flash-preview" });
      } else {
        client = new OpenAIClient({ apiKey, model: "gpt-4-turbo-preview" });
      }

      await client.generateCompletion("Hello");
      
      localStorage.setItem(`${selectedAPI}_api_key`, apiKey);
      setTestResult({
        success: true,
        message: "API 연결 테스트 성공!"
      });
      toast({
        title: "성공",
        description: `${getModelName()} API 연결이 확인되었습니다.`
      });
    } catch (error) {
      setTestResult({
        success: false,
        message: `API 연결 실패: ${error instanceof Error ? error.message : "알 수 없는 오류"}`
      });
      toast({
        title: "연결 실패",
        description: "API 키가 유효하지 않거나 서버에 연결할 수 없습니다.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  const getModelName = () => {
    switch (selectedAPI) {
      case "claude":
        return "Claude Sonnet 4.5(권장)";
      case "gpt":
        return "GPT-5";
      case "gemini":
        return "Gemini 3 Flash";
      default:
        return "";
    }
  };
  return (
    <div className="api-config-panel">
      {/* Clean white container */}
      <div className="rounded-2xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
        
        {/* Minimal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center">
              <Cpu className="w-4 h-4 text-white" />
            </div>
            <span className="text-sm font-semibold text-slate-800 tracking-wide">
              API Configuration
            </span>
          </div>
          <div className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200">
            <span className="text-[10px] font-semibold text-slate-600 uppercase tracking-wider">Pro</span>
          </div>
        </div>
        
        <div className="p-4">
          {/* Three-column layout with equal heights */}
          <div className="grid grid-cols-3 gap-4">
            
            {/* AI Models Section */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                <Shield className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600">AI Models</span>
              </div>
              
              <RadioGroup value={selectedAPI} onValueChange={setSelectedAPI} className="space-y-1.5 flex-1">
                {/* Claude - Default & Recommended */}
                <Label htmlFor="claude" className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedAPI === 'claude' 
                    ? 'bg-slate-800 text-white shadow-md' 
                    : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
                }`}>
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                    selectedAPI === 'claude' ? 'bg-white/20' : 'bg-slate-100'
                  }`}>
                    <img src="/lovable-uploads/019bcf23-a283-4df7-9f86-ab394da9498e.png" alt="Claude" className="w-4 h-4 object-cover" />
                  </div>
                  <div className="flex-1 flex items-center gap-1.5">
                    <span className={`text-xs font-semibold ${selectedAPI === 'claude' ? 'text-white' : 'text-slate-700'}`}>
                      Claude Sonnet 4.5
                    </span>
                    <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${selectedAPI === 'claude' ? 'bg-emerald-400/20 text-emerald-300' : 'bg-emerald-50 text-emerald-600'}`}>
                      ⭐ 권장
                    </span>
                  </div>
                  <RadioGroupItem value="claude" id="claude" className={`w-3.5 h-3.5 ${selectedAPI === 'claude' ? 'border-white text-white' : 'border-slate-300'}`} />
                </Label>
                
                {/* Gemini */}
                <Label htmlFor="gemini" className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedAPI === 'gemini' 
                    ? 'bg-slate-800 text-white shadow-md' 
                    : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
                }`}>
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                    selectedAPI === 'gemini' ? 'bg-white/20' : 'bg-slate-100'
                  }`}>
                    <img src="/lovable-uploads/gemini-logo.png" alt="Gemini" className="w-4 h-4 object-cover" />
                  </div>
                  <span className={`text-xs font-semibold flex-1 ${selectedAPI === 'gemini' ? 'text-white' : 'text-slate-700'}`}>
                    Gemini 3 Flash
                  </span>
                  <RadioGroupItem value="gemini" id="gemini" className={`w-3.5 h-3.5 ${selectedAPI === 'gemini' ? 'border-white text-white' : 'border-slate-300'}`} />
                </Label>
                
                {/* GPT */}
                <Label htmlFor="gpt" className={`group flex items-center gap-2 px-2.5 py-2 rounded-lg cursor-pointer transition-all duration-200 ${
                  selectedAPI === 'gpt' 
                    ? 'bg-slate-800 text-white shadow-md' 
                    : 'bg-white hover:bg-slate-50 border border-slate-200 hover:border-slate-300'
                }`}>
                  <div className={`w-7 h-7 rounded-md flex items-center justify-center ${
                    selectedAPI === 'gpt' ? 'bg-white/20' : 'bg-slate-100'
                  }`}>
                    <img src="/lovable-uploads/21d8d048-505b-4e56-ac5b-1c4cb56a5589.png" alt="GPT" className="w-4 h-4 object-cover" />
                  </div>
                  <span className={`text-xs font-semibold flex-1 ${selectedAPI === 'gpt' ? 'text-white' : 'text-slate-700'}`}>
                    GPT-5 Mini
                  </span>
                  <RadioGroupItem value="gpt" id="gpt" className={`w-3.5 h-3.5 ${selectedAPI === 'gpt' ? 'border-white text-white' : 'border-slate-300'}`} />
                </Label>
              </RadioGroup>
            </div>

            {/* API Configuration Section */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                <div className="flex items-center gap-2">
                  <Database className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-xs font-semibold text-slate-600">
                    {selectedAPI === "claude" ? "Anthropic" : selectedAPI === "gpt" ? "OpenAI" : "Google AI"} API
                  </span>
                </div>
                <a 
                  href={selectedAPI === "claude" ? "https://console.anthropic.com" : selectedAPI === "gpt" ? "https://platform.openai.com/api-keys" : "https://aistudio.google.com/apikey"} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="p-1 rounded hover:bg-slate-200 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 hover:text-slate-600" />
                </a>
              </div>
              
              <div className="space-y-2 flex-1 flex flex-col">
                <Input 
                  id="apiKey" 
                  type="password" 
                  placeholder={selectedAPI === "gemini" ? "AIza..." : "sk-ant-..."} 
                  value={apiKey} 
                  onChange={e => setApiKey(e.target.value)} 
                  className="h-9 font-mono text-xs bg-slate-50 border-slate-200 focus:border-slate-400 focus:ring-1 focus:ring-slate-400 placeholder:text-slate-300 text-slate-800 rounded-lg" 
                />
                
                <Button 
                  onClick={handleTestConnection} 
                  disabled={isLoading} 
                  className="w-full h-8 rounded-lg font-medium text-xs bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      Verifying...
                    </span>
                  ) : (
                    "Verify Connection"
                  )}
                </Button>
                
                {testResult && !testResult.success && (
                  <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-red-50 border border-red-200">
                    <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0">
                      <XCircle className="w-3 h-3 text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-xs font-medium block text-red-700">Failed</span>
                      <span className="text-[10px] truncate block text-red-600">{testResult.message}</span>
                    </div>
                  </div>
                )}
                
                {/* Spacer to push content and match height */}
                <div className="flex-1" />
              </div>
            </div>

            {/* User Authentication Section */}
            <div className="flex flex-col space-y-2">
              <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-100 border border-slate-200">
                <User className="w-3.5 h-3.5 text-slate-500" />
                <span className="text-xs font-semibold text-slate-600">Authentication</span>
              </div>
              
              <LoginSection
                showLoginForm={showLoginForm} 
                userName={userName} 
                expiryDate={expiryDate} 
                accessCode={accessCode} 
                setAccessCode={setAccessCode} 
                handleLogin={handleLogin} 
                handleLogout={handleLogout} 
                setShowLoginForm={setShowLoginForm}
                selectedAPI={selectedAPI}
                isAPIConnected={testResult?.success}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
