import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";
import { CheckCircle, ExternalLink, XCircle, Terminal, Server, Database, Shield, Cpu, Unplug } from "lucide-react";
import { Settings } from "./Settings";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { AnthropicClient } from "@/lib/ai/anthropicClient";
import { GeminiClient } from "@/lib/ai/geminiClient";
import { OpenAIClient } from "@/lib/ai/openaiClient";

interface APIResponse {
  success: boolean;
  message: string;
}
export function APIConfig() {
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
        message: "저장된 API 키가 있습니다."
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
        return "Claude Sonnet 4(권장)";
      case "gpt":
        return "GPT-4o";
      case "gemini":
        return "Gemini 3 Flash";
      default:
        return "";
    }
  };
  return <div className="api-config-panel space-y-3 relative group overflow-hidden rounded-2xl border border-white/20 shadow-2xl shadow-indigo-500/20 backdrop-blur-xl">
      {/* Enhanced terminal header with premium effects */}
      <div className="api-terminal-header relative flex items-center gap-1.5 px-5 py-3 bg-gradient-to-r from-slate-900/95 via-gray-800/95 to-slate-900/95 border-b border-white/10">
        {/* Traffic light buttons with glow */}
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-red-400 to-red-600 shadow-lg shadow-red-500/30 animate-pulse"></div>
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 shadow-lg shadow-yellow-500/30 animate-pulse delay-100"></div>
          <div className="w-3 h-3 rounded-full bg-gradient-to-br from-emerald-400 to-green-500 shadow-lg shadow-green-500/30 animate-pulse delay-200"></div>
        </div>
        
        {/* Title section with enhanced styling */}
        <div className="flex items-center gap-2 ml-4">
          <div className="relative">
            <Cpu className="w-4 h-4 text-indigo-300 drop-shadow-sm" />
            <div className="absolute inset-0 w-4 h-4 bg-indigo-400/30 blur-sm rounded-full animate-pulse"></div>
          </div>
          <span className="text-xs font-mono font-semibold text-transparent bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-300 bg-clip-text tracking-wider">
            API CONFIGURATION
          </span>
        </div>
        
        <div className="flex-1"></div>
        
        {/* Terminal icon with glow effect */}
        <div className="relative">
          <Terminal className="w-4 h-4 text-slate-400 drop-shadow-sm" />
          <div className="absolute inset-0 w-4 h-4 bg-blue-400/20 blur-sm rounded-full group-hover:bg-blue-400/40 transition-all duration-300"></div>
        </div>
        
        {/* Header accent line */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-400/50 to-transparent"></div>
      </div>
      
      {/* Enhanced background with multiple layers */}
      <div className="absolute inset-0 top-[44px] bg-gradient-to-br from-slate-900/98 via-gray-900/95 to-slate-800/98"></div>
      
      {/* Animated gradient overlays */}
      <div className="absolute inset-0 top-[44px] bg-gradient-to-r from-blue-500/8 via-cyan-500/12 to-teal-500/8 opacity-80 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Floating orbs for premium effect */}
      <div className="absolute top-12 right-8 w-20 h-20 bg-gradient-to-br from-cyan-500/20 to-teal-600/20 rounded-full blur-xl animate-pulse opacity-60"></div>
      <div className="absolute bottom-8 left-6 w-16 h-16 bg-gradient-to-br from-blue-400/15 to-cyan-500/15 rounded-full blur-lg animate-pulse delay-700 opacity-40"></div>
      
      {/* Radial gradient accent */}
      <div className="absolute inset-0 top-[44px] bg-[radial-gradient(ellipse_at_center_top,rgba(99,102,241,0.18),transparent_60%)] mix-blend-overlay"></div>
      
      <div className="relative z-10 space-y-6 p-6 pt-5">
        <div className="flex flex-col space-y-5">
          {/* AI Models Section with enhanced styling */}
          <div className="flex flex-col space-y-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="relative">
                <Shield className="w-5 h-5 text-blue-300 drop-shadow-sm" />
                <div className="absolute inset-0 w-5 h-5 bg-blue-400/30 blur-sm rounded-full animate-pulse"></div>
              </div>
              <Label className="text-sm font-mono font-bold text-transparent bg-gradient-to-r from-blue-200 via-cyan-200 to-teal-200 bg-clip-text tracking-wider uppercase">
                AI MODELS
              </Label>
            </div>
            
            <RadioGroup value={selectedAPI} onValueChange={setSelectedAPI} className="flex space-x-4">
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30 hover:border-blue-400/50 transition-all duration-300 group">
                <div className="api-model-icon claude relative bg-gradient-to-br from-slate-700/80 to-slate-800/80 border border-slate-600/50 group-hover:border-blue-400/50 transition-all duration-300">
                  <img src="/lovable-uploads/019bcf23-a283-4df7-9f86-ab394da9498e.png" alt="Claude Logo" className="w-5 h-5 object-cover" />
                  <div className="absolute inset-0 bg-blue-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </div>
                <RadioGroupItem value="claude" id="claude" className="border-slate-500 text-blue-400" />
                <Label htmlFor="claude" className="text-sm font-medium text-slate-100 group-hover:text-blue-200 transition-colors duration-300 cursor-pointer">
                  Claude Sonnet 4<span className="text-blue-300 ml-1">(권장)</span>
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30 hover:border-purple-400/50 transition-all duration-300 group">
                <div className="api-model-icon gemini relative bg-gradient-to-br from-slate-700/80 to-slate-800/80 border border-slate-600/50 group-hover:border-purple-400/50 transition-all duration-300">
                  <img src="/lovable-uploads/gemini-logo.png" alt="Gemini Logo" className="w-5 h-5 object-cover" />
                  <div className="absolute inset-0 bg-purple-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </div>
                <RadioGroupItem value="gemini" id="gemini" className="border-slate-500 text-purple-400" />
                <Label htmlFor="gemini" className="text-sm font-medium text-slate-100 group-hover:text-purple-200 transition-colors duration-300 cursor-pointer">
                  Gemini 3 Flash
                </Label>
              </div>
              
              <div className="flex items-center space-x-3 p-3 rounded-xl bg-gradient-to-r from-slate-800/50 to-slate-700/50 border border-slate-600/30 hover:border-emerald-400/50 transition-all duration-300 group">
                <div className="api-model-icon gpt relative bg-gradient-to-br from-slate-700/80 to-slate-800/80 border border-slate-600/50 group-hover:border-emerald-400/50 transition-all duration-300">
                  <img src="/lovable-uploads/21d8d048-505b-4e56-ac5b-1c4cb56a5589.png" alt="GPT Logo" className="w-5 h-5 object-cover" />
                  <div className="absolute inset-0 bg-emerald-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg"></div>
                </div>
                <RadioGroupItem value="gpt" id="gpt" className="border-slate-500 text-emerald-400" />
                <Label htmlFor="gpt" className="text-sm font-medium text-slate-100 group-hover:text-emerald-200 transition-colors duration-300 cursor-pointer">
                  GPT-4o
                </Label>
              </div>
            </RadioGroup>
          </div>

          {/* API Key Section with enhanced styling */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Database className="w-5 h-5 text-indigo-300 drop-shadow-sm" />
                  <div className="absolute inset-0 w-5 h-5 bg-indigo-400/30 blur-sm rounded-full animate-pulse"></div>
                </div>
                <Label htmlFor="apiKey" className="text-sm font-mono font-bold text-transparent bg-gradient-to-r from-cyan-200 via-teal-200 to-blue-200 bg-clip-text tracking-wider uppercase">
                  {selectedAPI === "claude" ? "Claude" : selectedAPI === "gemini" ? "Gemini" : "OpenAI"} API Key
                </Label>
              </div>
              {testResult !== null && (
                <div className={`api-status-indicator relative overflow-hidden flex items-center gap-2.5 px-4 py-2 rounded-full border transition-all duration-500 animate-scale-in ${
                  testResult.success 
                    ? "bg-gradient-to-r from-emerald-900/90 via-teal-800/80 to-emerald-900/90 border-emerald-400/60 shadow-lg shadow-emerald-500/30" 
                    : "bg-gradient-to-r from-slate-800/80 to-slate-700/80 border-rose-500/50"
                }`}>
                  {/* Success glow effects */}
                  {testResult.success && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/0 via-emerald-400/10 to-emerald-400/0 animate-pulse"></div>
                      <div className="absolute -inset-2 bg-gradient-to-r from-emerald-500/20 via-teal-400/25 to-emerald-500/20 blur-xl opacity-70 animate-pulse"></div>
                      <div className="absolute top-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-emerald-300/70 to-transparent"></div>
                    </>
                  )}
                  
                  {testResult.success ? (
                    <>
                      <div className="relative">
                        <div className="absolute inset-0 bg-emerald-400/50 rounded-full blur-sm animate-ping"></div>
                        <div className="relative w-3 h-3 rounded-full bg-gradient-to-r from-emerald-400 to-teal-400 shadow-lg shadow-emerald-400/50"></div>
                      </div>
                      <span className="relative z-10 text-xs text-emerald-200 font-mono font-bold tracking-wide">
                        ✨ {getModelName()} Connected
                      </span>
                      <div className="relative z-10 px-1.5 py-0.5 rounded bg-emerald-500/30 border border-emerald-400/40">
                        <span className="text-[9px] font-bold text-emerald-300 uppercase tracking-wider">Live</span>
                      </div>
                      <button
                        onClick={() => {
                          localStorage.removeItem(`${selectedAPI}_api_key`);
                          setApiKey("");
                          setTestResult(null);
                          toast({
                            title: "연결 해제",
                            description: `${selectedAPI === "claude" ? "Claude" : selectedAPI === "gemini" ? "Gemini" : "GPT"} API 연결이 해제되었습니다.`
                          });
                        }}
                        className="group/btn relative z-10 p-1.5 rounded-lg bg-gradient-to-br from-rose-500/20 to-red-500/20 border border-rose-400/30 hover:border-rose-400/60 hover:from-rose-500/30 hover:to-red-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-rose-500/20"
                        title="연결 해제"
                      >
                        <Unplug className="w-3.5 h-3.5 text-rose-400 group-hover/btn:text-rose-300 transition-colors" />
                      </button>
                    </>
                  ) : (
                    <>
                      <div className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-rose-400 to-red-500 shadow-lg shadow-rose-500/50"></div>
                      <span className="text-xs text-rose-200 font-mono font-semibold tracking-wide">API Not Connected</span>
                    </>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Input 
                id="apiKey" 
                type="password" 
                value={apiKey} 
                onChange={e => setApiKey(e.target.value)} 
                placeholder={selectedAPI === "gemini" ? "AIza..." : "sk-..."} 
                className="flex-1 h-10 text-sm border-slate-600/50 font-mono text-slate-100 placeholder:text-slate-400 focus:ring-2 focus:ring-indigo-400/50 focus:border-indigo-400/50 bg-gradient-to-r from-slate-800/80 to-slate-700/80 backdrop-blur-sm transition-all duration-300 hover:border-slate-500/60" 
              />
              <Button 
                onClick={handleTestConnection} 
                disabled={isLoading} 
                className="h-10 px-5 text-sm font-medium bg-gradient-to-r from-cyan-500 to-teal-600 hover:from-cyan-600 hover:to-teal-700 text-white border-0 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/30 transition-all duration-300 disabled:opacity-60"
              >
                {isLoading ? "Verifying..." : "Verify"}
              </Button>
              
              {selectedAPI === "claude" ? (
                <Button 
                  variant="outline" 
                  onClick={() => window.open("https://www.youtube.com/watch?v=4Tzs4qunYJY", "_blank")} 
                  className="h-10 px-4 text-sm whitespace-nowrap bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-slate-500/50 hover:border-blue-400/50 text-slate-100 hover:text-blue-200 transition-all duration-300"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span className="font-medium">Claude API 발급 방법</span>
                </Button>
              ) : selectedAPI === "gemini" ? (
                <Button 
                  variant="outline" 
                  onClick={() => window.open("https://aistudio.google.com/app/apikey", "_blank")} 
                  className="h-10 px-4 text-sm whitespace-nowrap bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-slate-500/50 hover:border-purple-400/50 text-slate-100 hover:text-purple-200 transition-all duration-300"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span className="font-medium">Gemini API 발급</span>
                </Button>
              ) : (
                <Button 
                  variant="outline" 
                  onClick={() => window.open("https://www.youtube.com/watch?v=8h-OCfC_EU0", "_blank")} 
                  className="h-10 px-4 text-sm whitespace-nowrap bg-gradient-to-r from-slate-700/80 to-slate-600/80 border-slate-500/50 hover:border-emerald-400/50 text-slate-100 hover:text-emerald-200 transition-all duration-300"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  <span className="font-medium">GPT API 발급 방법</span>
                </Button>
              )}
              
              <Settings />
            </div>
          </div>
        </div>
      </div>
    </div>;
}
