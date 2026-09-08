import { useState, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Image as ImageIcon, X, Check, ArrowRight } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { AIClientManager } from "@/lib/ai/aiClientManager";
import { PassageEntry } from "@/types/question";

interface CustomQuestionEntryProps {
  passages: PassageEntry[];
  typeId: string;
  onAddPassage: (typeId: string) => void;
  onRemovePassage: (typeId: string, passageId: string) => void;
  onTextChange: (typeId: string, passageId: string, text: string) => void;
}

interface ExtractedProblem {
  text: string;
  answer: string;
  explanation: string;
}

export const CustomQuestionEntry = ({
  passages,
  typeId,
  onAddPassage,
  onRemovePassage,
  onTextChange
}: CustomQuestionEntryProps) => {
  const [currentStep, setCurrentStep] = useState<1 | 2>(1);
  const [extractedProblem, setExtractedProblem] = useState<ExtractedProblem | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { toast } = useToast();

  const extractTextFromImage = useCallback(async (imageFile: File) => {
    setIsExtracting(true);
    try {
      const aiClient = AIClientManager.getInstance().createClient();
      
      // Compress and resize image before converting to base64
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            // Calculate new dimensions (max 1600px on longest side)
            const maxSize = 1600;
            let width = img.width;
            let height = img.height;
            
            if (width > height && width > maxSize) {
              height = (height * maxSize) / width;
              width = maxSize;
            } else if (height > maxSize) {
              width = (width * maxSize) / height;
              height = maxSize;
            }
            
            // Create canvas and compress
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            if (!ctx) {
              reject(new Error('Canvas context not available'));
              return;
            }
            
            ctx.drawImage(img, 0, 0, width, height);
            
            // Convert to base64 with compression (0.7 quality for JPEG)
            const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
            resolve(compressedBase64.split(',')[1]); // Remove data:image/...;base64, prefix
          };
          img.onerror = () => reject(new Error('이미지 로드 실패'));
          img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('파일 읽기 실패'));
        reader.readAsDataURL(imageFile);
      });

      const prompt = `이 이미지에 있는 문제를 분석해서 다음 형식으로 응답해주세요:

## 문제 텍스트:
[이미지에서 추출한 문제 텍스트를 정확히 입력]

## 정답:
[문제의 정답]

## 해설:
[문제에 대한 자세한 해설]

이미지를 정확히 분석해서 문제의 내용, 선택지, 정답을 모두 포함해주세요.`;

      const response = await aiClient.generateCompletion(`${prompt}\n\n[이미지 데이터: ${base64}]`);
      
      // Parse the response to extract structured data
      const sections = response.split('##');
      let problemText = '';
      let answer = '';
      let explanation = '';

      sections.forEach(section => {
        const trimmed = section.trim();
        if (trimmed.startsWith('문제 텍스트:')) {
          problemText = trimmed.replace('문제 텍스트:', '').trim();
        } else if (trimmed.startsWith('정답:')) {
          answer = trimmed.replace('정답:', '').trim();
        } else if (trimmed.startsWith('해설:')) {
          explanation = trimmed.replace('해설:', '').trim();
        }
      });

      if (problemText && answer && explanation) {
        setExtractedProblem({ text: problemText, answer, explanation });
        toast({
          title: "이미지 분석 완료",
          description: "문제를 성공적으로 추출했습니다.",
        });
      } else {
        throw new Error("문제 추출에 실패했습니다.");
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      
      let title = "추출 실패";
      let description = "이미지에서 문제를 추출할 수 없습니다.";
      
      // Handle specific error types
      if (error instanceof Error) {
        if (error.message.includes('too long') || error.message.includes('token')) {
          title = "이미지 크기 초과";
          description = "이미지가 너무 큽니다. 더 작은 이미지로 다시 시도해주세요.";
        } else if (error.message.includes('429') || error.message.includes('rate_limit_error')) {
          title = "API 사용량 초과";
          description = "Claude API 사용량이 초과되었습니다. 잠시 후 다시 시도해주세요.";
        } else if (error.message.includes('API 키가 설정되지 않았습니다')) {
          title = "API 키 오류";
          description = "Claude 또는 GPT API 키를 설정해주세요.";
        } else if (error.message.includes('401') || error.message.includes('unauthorized')) {
          title = "인증 오류";
          description = "API 키가 올바르지 않습니다. 설정을 확인해주세요.";
        }
      }
      
      toast({
        title,
        description,
        variant: "destructive",
      });
    } finally {
      setIsExtracting(false);
    }
  }, [toast]);

  const handleFileUpload = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const file = files[0];
    if (!file.type.startsWith('image/')) {
      toast({
        title: "파일 형식 오류",
        description: "이미지 파일만 업로드 가능합니다.",
        variant: "destructive",
      });
      return;
    }
    
    extractTextFromImage(file);
  }, [extractTextFromImage, toast]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileUpload(e.dataTransfer.files);
  }, [handleFileUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const confirmProblem = useCallback(() => {
    if (!extractedProblem) return;
    
    // Set the extracted problem as example
    toast({
      title: "예시 문제 설정 완료",
      description: "문제가 예시로 설정되었습니다.",
    });
    
    // Move to step 2
    setCurrentStep(2);
  }, [extractedProblem, toast]);

  const resetToStep1 = useCallback(() => {
    setCurrentStep(1);
    setExtractedProblem(null);
  }, []);

  if (currentStep === 1) {
    return (
      <div className="space-y-4">
        {/* Image Upload Area */}
        <div
          className={`relative border-2 border-dashed rounded-xl p-8 transition-all duration-300 ${
            isDragOver
              ? 'border-primary bg-primary/5 scale-[1.02]'
              : 'border-border hover:border-primary/50 hover:bg-muted/30'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="p-4 rounded-full bg-primary/10">
              <ImageIcon className="w-8 h-8 text-primary" />
            </div>
            
            <div className="text-center space-y-2">
              <h3 className="text-lg font-semibold">문제 이미지 업로드</h3>
              <p className="text-muted-foreground text-sm">
                문제가 있는 이미지를 드래그하거나 버튼을 클릭해서 업로드하세요
              </p>
            </div>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => document.getElementById('imageInput')?.click()}
                disabled={isExtracting}
                className="gap-2"
              >
                <Upload className="w-4 h-4" />
                파일 선택
              </Button>
            </div>

            <input
              id="imageInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFileUpload(e.target.files)}
            />
          </div>

          {isExtracting && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <div className="text-center space-y-2">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto" />
                <p className="text-sm text-muted-foreground">Claude API로 문제 분석 중...</p>
              </div>
            </div>
          )}
        </div>

        {/* Extracted Problem Preview */}
        {extractedProblem && (
          <div className="border rounded-xl p-6 space-y-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
            <div className="flex items-center justify-between">
              <h4 className="font-semibold text-green-800">추출된 문제</h4>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setExtractedProblem(null)}
                className="text-green-600 hover:text-green-800"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-green-700">문제:</label>
                <p className="mt-1 p-3 bg-white rounded-lg border text-sm">
                  {extractedProblem.text}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-green-700">정답:</label>
                <p className="mt-1 p-3 bg-white rounded-lg border text-sm font-medium">
                  {extractedProblem.answer}
                </p>
              </div>

              <div>
                <label className="text-sm font-medium text-green-700">해설:</label>
                <p className="mt-1 p-3 bg-white rounded-lg border text-sm">
                  {extractedProblem.explanation}
                </p>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button onClick={confirmProblem} className="gap-2">
                <Check className="w-4 h-4" />
                예시로 설정하고 다음 단계
                <ArrowRight className="w-4 h-4" />
              </Button>
              <Button variant="outline" onClick={() => setExtractedProblem(null)}>
                다시 업로드
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Step 2: Normal passage input like other question types
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="font-semibold text-green-800">2단계: 지문 입력</h4>
          <p className="text-sm text-muted-foreground">
            문제 생성을 위한 지문을 입력해주세요.
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={resetToStep1} className="gap-2">
          <ArrowRight className="w-4 h-4 rotate-180" />
          1단계로 돌아가기
        </Button>
      </div>

      {/* Example Problem Display */}
      {extractedProblem && (
        <div className="p-4 bg-muted rounded-lg border border-dashed">
          <p className="text-xs font-medium text-muted-foreground mb-2">설정된 예시 문제:</p>
          <p className="text-sm truncate">{extractedProblem.text.substring(0, 100)}...</p>
        </div>
      )}

      {/* Passage Input Areas */}
      <div className="space-y-3">
        {passages.map((passage, index) => (
          <div key={passage.id} className="relative group">
            <div className="flex items-start gap-2">
              <div className="flex-1">
                <Textarea
                  value={passage.text}
                  onChange={(e) => onTextChange(typeId, passage.id, e.target.value)}
                  placeholder="지문을 입력해주세요..."
                  className="min-h-[100px] resize-none"
                />
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onRemovePassage(typeId, passage.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
            
            {passage.result && (
              <div className="mt-3 p-4 bg-muted rounded-lg">
                <div className="text-xs font-medium text-muted-foreground mb-2">생성된 문제:</div>
                <div className="text-sm whitespace-pre-wrap">{passage.result}</div>
              </div>
            )}
          </div>
        ))}

        <Button
          variant="outline"
          onClick={() => onAddPassage(typeId)}
          className="w-full border-dashed"
        >
          지문 추가
        </Button>
      </div>
    </div>
  );
};
