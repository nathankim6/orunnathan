import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Download, Loader2, Zap, FileText, RefreshCw, Sparkles, CheckCircle2 } from 'lucide-react';
import { QuestionTypeConfig, AnalysisResult } from './MockExamGenerator';
import { AIClientManager } from '@/lib/ai/aiClientManager';
import { generateQuestion } from "@/lib/claude";
import { getQuestionTypes } from '@/lib/questionTypes';
import { generateTextFile, downloadTextFile } from '@/utils/textFileGenerator';
import { generateWordDocument } from '@/utils/wordDocumentGenerator';
import { toast } from '@/hooks/use-toast';

interface QuestionGenerationProps {
  analysisResult: AnalysisResult | null;
  questionConfigs: QuestionTypeConfig[];
}

interface GeneratedSet {
  id: string;
  name: string;
  questions: Array<{
    passage: string;
    question: string;
    rank: number;
    type: string;
  }>;
  isGenerating: boolean;
  progress: number;
}

export const QuestionGeneration = ({
  analysisResult,
  questionConfigs
}: QuestionGenerationProps) => {
  const [generatedSets, setGeneratedSets] = useState<GeneratedSet[]>([]);
  const [isGeneratingAll, setIsGeneratingAll] = useState(false);
  const aiManager = AIClientManager.getInstance();

  const generateQuestionSet = async (rank: number, setId: string) => {
    if (!analysisResult) return;

    const claudeApiKey = localStorage.getItem("claude_api_key");
    const gptApiKey = localStorage.getItem("gpt_api_key");
    const geminiApiKey = localStorage.getItem("gemini_api_key");
    const deepseekApiKey = localStorage.getItem("deepseek_api_key");
    if (!claudeApiKey && !gptApiKey && !geminiApiKey && !deepseekApiKey) {
      toast({
        title: "API 키 필요",
        description: "문제 생성을 위해 API 키를 먼저 설정해주세요.",
        variant: "destructive"
      });
      return;
    }

    try {
      const aiClient = aiManager.createClient();
      const availableAPI = aiManager.getAvailableAPI();
      toast({
        title: "문제 생성 시작",
        description: `${availableAPI === 'claude' ? 'Claude' : availableAPI === 'gemini' ? 'Gemini' : availableAPI.includes('deepseek') ? 'DeepSeek' : 'GPT'}를 사용하여 ${rank}순위 세트를 생성합니다.`
      });
    } catch (error: any) {
      toast({
        title: "API 키 오류",
        description: error.message,
        variant: "destructive"
      });
      return;
    }

    setGeneratedSets(prev => prev.map(set => set.id === setId ? {
      ...set,
      isGenerating: true,
      progress: 0
    } : set));

    try {
      const passages = rank === 1 ? analysisResult.rank1 : rank === 2 ? analysisResult.rank2 : analysisResult.rank3;
      const questions: GeneratedSet['questions'] = [];

      for (let i = 0; i < passages.length; i++) {
        const passage = passages[i];
        const analysis = passage.analysis;
        if (analysis) {
          const questionTypeId = rank === 1 ? analysis.rank1 : rank === 2 ? analysis.rank2 : analysis.rank3;

          const type = getQuestionTypes().find(t => t.id === questionTypeId);
          if (!type) {
            console.warn(`Question type not found: ${questionTypeId}`);
            continue;
          }

          try {
            const result = await generateQuestion(type, passage.content, "1", "수능");
            questions.push({
              passage: passage.content,
              question: result,
              rank,
              type: questionTypeId
            });
          } catch (error: any) {
            console.error(`Failed to generate question for passage ${i + 1}:`, error);
            let errorMessage = "알 수 없는 오류가 발생했습니다.";
            if (error.message?.includes('529') || error.message?.includes('Overloaded')) {
              errorMessage = "API 서버가 과부하 상태입니다. 잠시 후 다시 시도해주세요.";
            } else if (error.message?.includes('401')) {
              errorMessage = "API 키가 유효하지 않습니다. 설정을 확인해주세요.";
            } else if (error.message?.includes('429')) {
              errorMessage = "API 사용량 한도에 도달했습니다. 잠시 후 다시 시도해주세요.";
            }
            questions.push({
              passage: passage.content,
              question: `문제 생성 실패: ${errorMessage}`,
              rank,
              type: questionTypeId
            });
          }
        }

        const progress = (i + 1) / passages.length * 100;
        setGeneratedSets(prev => prev.map(set => set.id === setId ? {
          ...set,
          progress
        } : set));

        if (i < passages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000));
        }
      }

      setGeneratedSets(prev => prev.map(set => set.id === setId ? {
        ...set,
        questions,
        isGenerating: false,
        progress: 100
      } : set));

      toast({
        title: "생성 완료",
        description: `${rank}순위 세트 생성이 완료되었습니다.`
      });
    } catch (error) {
      console.error('Question generation failed:', error);
      toast({
        title: "생성 실패",
        description: "문제 생성 중 오류가 발생했습니다.",
        variant: "destructive"
      });
      setGeneratedSets(prev => prev.map(set => set.id === setId ? {
        ...set,
        isGenerating: false,
        progress: 0
      } : set));
    }
  };

  const generateAllSets = async () => {
    setIsGeneratingAll(true);
    const sets: GeneratedSet[] = [{
      id: 'set1',
      name: '1순위 세트',
      questions: [],
      isGenerating: false,
      progress: 0
    }, {
      id: 'set2',
      name: '2순위 세트',
      questions: [],
      isGenerating: false,
      progress: 0
    }, {
      id: 'set3',
      name: '3순위 세트',
      questions: [],
      isGenerating: false,
      progress: 0
    }];
    setGeneratedSets(sets);

    for (let rank = 1; rank <= 3; rank++) {
      await generateQuestionSet(rank, `set${rank}`);
      if (rank < 3) {
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
    }
    setIsGeneratingAll(false);
  };

  const cleanDisplayText = (text: string) => {
    return text
      .replace(/\[OUTPUT\]/g, '')
      .replace(/\n+(다음 빈칸에 들어갈 말로 가장 적절한 것을 고르시오\.)/g, '$1')
      .replace(/(다음 빈칸에 들어갈 말로 가장 적절한 것을 고르시오\.)\n\n/g, '$1\n')
      .replace(/\n\n+(다음 글의.*?것은\?)/g, '\n$1')
      .replace(/(다음 글의.*?것은\?)\n\n/g, '$1\n')
      .replace(/\*\*\[정답\]\*\*/g, '[정답]')
      .replace(/\*\*\[해설\]\*\*/g, '[해설]')
      .replace(/\*\*정답[:：\s]?\*\*/g, '[정답]')
      .replace(/\*\*해설[:：\s]?\*\*/g, '[해설]')
      .replace(/정답\s*[:：]\s*/g, '[정답] ')
      .replace(/해설\s*[:：]\s*/g, '[해설] ')
      .replace(/(^|\n)정답\s+/gm, '$1[정답] ')
      .replace(/(^|\n)해설\s+/gm, '$1[해설] ')
      .replace(/\[정답\]\s+\[정답\]/g, '[정답]')
      .replace(/\[해설\]\s+\[해설\]/g, '[해설]')
      .replace(/(\[정답\].*?)\n\n(\[해설\])/g, '$1\n$2')
      .replace(/(\[정답\].*?)\n(\[해설\])/g, '$1\n$2')
      .replace(/(다음의 내용과 일치.*?것을 고르시오\.)\n\n([A-Z])/g, '$1\n$2')
      .replace(/(\?)\n\n([A-Z])/g, '$1\n$2')
      .replace(/\*\*(다음 중 어법상 적절하지 않은 것은\?)\*\*/g, '$1')
      .replace(/(다음 중 어법상 적절하지 않은 것은\?)\n\n/g, '$1\n')
      .replace(/다음 중 어법상 적절하지 않은 것은\?\n(?=다음)/g, '')
      .replace(/(?<!문맥상 낱말의 쓰임이 적절하지 않은 것은\?[\s\S]*?)\d+\) [①-⑤]\n/g, '')
      .replace(/1\) ①\n2\) ②\n3\) ③\n4\) ④\n5\) ⑤\n?/g, '')
      .replace(/\d+\) [A-Za-z]+(?:\d+\) [A-Za-z]+)*/g, '')
      .replace(/([A-Za-z]+\s*→\s*[A-Za-z]+\s*\([①-⑤]\):.*?\n)+/g, '')
      .replace(/\n\n(다음 글의 빈 칸에)/g, '\n$1')
      .replace(/\[선지\]/g, '')
      .replace(/(\[정답\])\s*([①-⑤])\s*\n(\[해설\])/g, '$1 $2\n$3')
      .replace(/(⑤[^\n]+)\n*\s*(\[정답\])/g, '$1\n\n$2')
      .replace(/([^⑤\n])\n*\s*(\[정답\])/g, '$1\n\n$2')
      .replace(/\n{3,}(\[정답\])/g, '\n\n$1')
      .replace(/(\?)\n\n+(\[선지\]\s*)?([①-⑤])/g, '$1\n$3')
      .replace(/(j\.\s*[^\n]+)\n(①)/g, '$1\n\n$2')
      .replace(/\[어휘\][\s\S]*?(?=\n\n|$)/g, '')
      .replace(/원문의 빈칸 표현:.*?$/gm, '')
      .replace(/\*\*(?=\s*\[(정답|해설)\])/g, '')
      .replace(/(\[(정답|해설)\][^\n]*)\*\*/g, '$1')
      .replace(/(\[정답\][\s\S]*)/, (m) => m.replace(/\*/g, ''))
      .replace(/\*\*(.*?)\*\*/g, '<u>$1</u>')
      .replace(/(다음 중 문맥 상 알맞은 단어를 고르시오\.)\n\n/g, '$1\n')
      .replace(/(\[서답형\] 다음 글을 읽고, 물음에 답하시오\.)\n\n/g, '$1\n')
      .replace(/(다음 글의 내용과 일치하도록.*?쓰시오\.)\n\n/g, '$1\n');
  };

  const convertUnderlinesToHTML = (text: string) => {
    return text.replace(/<u>(.*?)<\/u>/g, '<span style="text-decoration: underline;">$1</span>');
  };

  const handleDownloadSet = async (set: GeneratedSet) => {
    if (set.questions.length === 0) {
      toast({
        title: "다운로드 실패",
        description: "저장할 문제가 없습니다.",
        variant: "destructive"
      });
      return;
    }

    try {
      const questionsData = set.questions.map((question, index) => ({
        id: `${set.id}-${index}`,
        content: question.question,
        questionNumber: index + 1
      }));
      await generateWordDocument(questionsData);
      toast({
        title: "다운로드 완료",
        description: `${set.name} 문제가 Word 문서로 저장되었습니다.`
      });
    } catch (error) {
      console.error('Word document generation failed:', error);

      const questionsText: string[] = [];
      const answersText: string[] = [];
      set.questions.forEach((question, index) => {
        const cleanedContent = cleanDisplayText(question.question);
        const parts = cleanedContent.split('[정답]');
        if (parts.length > 1) {
          const questionPart = parts[0].trim();
          questionsText.push(`문제 ${index + 1}\n${questionPart}\n`);

          const answerPart = '[정답]' + parts[1].trim();
          answersText.push(`문제 ${index + 1}\n${answerPart}\n`);
        } else {
          questionsText.push(`문제 ${index + 1}\n${cleanedContent.trim()}\n`);
        }
      });
      const combinedText = [`===== ${set.name} 문제 =====\n`, questionsText.join('\n'), '\n===== 정답 및 해설 =====\n', answersText.join('\n')].join('');
      downloadTextFile(combinedText, `${set.name}_문제와정답.txt`);
      toast({
        title: "다운로드 완료",
        description: `${set.name} 문제가 TXT 파일로 저장되었습니다.`
      });
    }
  };

  const regenerateSingleQuestion = async (setId: string, questionIndex: number) => {
    if (!analysisResult) return;
    const set = generatedSets.find(s => s.id === setId);
    if (!set) return;
    const rank = parseInt(setId.replace('set', ''));
    const passages = rank === 1 ? analysisResult.rank1 : rank === 2 ? analysisResult.rank2 : analysisResult.rank3;
    const passage = passages[questionIndex];
    if (!passage?.analysis) return;
    const questionTypeId = rank === 1 ? passage.analysis.rank1 : rank === 2 ? passage.analysis.rank2 : passage.analysis.rank3;

    try {
      const type = getQuestionTypes().find(t => t.id === questionTypeId);
      if (!type) {
        console.warn(`Question type not found: ${questionTypeId}`);
        return;
      }

      setGeneratedSets(prev => prev.map(s => s.id === setId ? {
        ...s,
        questions: s.questions.map((q, i) => i === questionIndex ? {
          ...q,
          question: "문제 재생성 중..."
        } : q)
      } : s));

      const result = await generateQuestion(type, passage.content, "1", "수능");

      setGeneratedSets(prev => prev.map(s => s.id === setId ? {
        ...s,
        questions: s.questions.map((q, i) => i === questionIndex ? {
          ...q,
          question: result
        } : q)
      } : s));

      toast({
        title: "재생성 완료",
        description: "문제가 성공적으로 재생성되었습니다."
      });
    } catch (error: any) {
      console.error('Question regeneration failed:', error);
      let errorMessage = "알 수 없는 오류가 발생했습니다.";
      if (error.message?.includes('529') || error.message?.includes('Overloaded')) {
        errorMessage = "API 서버가 과부하 상태입니다. 잠시 후 다시 시도해주세요.";
      } else if (error.message?.includes('401')) {
        errorMessage = "API 키가 유효하지 않습니다. 설정을 확인해주세요.";
      } else if (error.message?.includes('429')) {
        errorMessage = "API 사용량 한도에 도달했습니다. 잠시 후 다시 시도해주세요.";
      }
      setGeneratedSets(prev => prev.map(s => s.id === setId ? {
        ...s,
        questions: s.questions.map((q, i) => i === questionIndex ? {
          ...q,
          question: `문제 생성 실패: ${errorMessage}`
        } : q)
      } : s));
      toast({
        title: "재생성 실패",
        description: errorMessage,
        variant: "destructive"
      });
    }
  };

  const generateSingleSet = (rank: number) => {
    const setId = `set${rank}`;
    const existingSet = generatedSets.find(s => s.id === setId);
    if (!existingSet) {
      const newSet: GeneratedSet = {
        id: setId,
        name: `${rank}순위 세트`,
        questions: [],
        isGenerating: false,
        progress: 0
      };
      setGeneratedSets(prev => [...prev, newSet]);
    }
    generateQuestionSet(rank, setId);
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Zap className="w-5 h-5 text-white" />
            </div>
            문제 생성 및 다운로드
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="bg-gradient-to-r from-emerald-50 to-teal-50 p-5 rounded-xl border border-emerald-100">
            <h4 className="font-semibold text-slate-800 mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              생성 옵션
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button 
                onClick={generateAllSets} 
                disabled={isGeneratingAll} 
                className="h-11 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-md"
              >
                {isGeneratingAll ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Zap className="w-4 h-4 mr-2" />
                )}
                3세트 동시 생성
              </Button>
              <div className="grid grid-cols-3 gap-2">
                <Button 
                  onClick={() => generateSingleSet(1)} 
                  variant="outline" 
                  size="sm" 
                  disabled={generatedSets.find(s => s.id === 'set1')?.isGenerating}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  1순위만
                </Button>
                <Button 
                  onClick={() => generateSingleSet(2)} 
                  variant="outline" 
                  size="sm" 
                  disabled={generatedSets.find(s => s.id === 'set2')?.isGenerating}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  2순위만
                </Button>
                <Button 
                  onClick={() => generateSingleSet(3)} 
                  variant="outline" 
                  size="sm" 
                  disabled={generatedSets.find(s => s.id === 'set3')?.isGenerating}
                  className="border-slate-200 text-slate-700 hover:bg-slate-50"
                >
                  3순위만
                </Button>
              </div>
            </div>
          </div>

          {generatedSets.length > 0 && (
            <Tabs defaultValue="set1" className="w-full">
              <TabsList className="grid w-full grid-cols-3 rounded-xl bg-slate-100 p-1">
                {generatedSets.map(set => (
                  <TabsTrigger 
                    key={set.id} 
                    value={set.id} 
                    className="rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md text-slate-600"
                  >
                    {set.name}
                    {set.questions.length > 0 && (
                      <Badge variant="secondary" className="ml-2 bg-indigo-100 text-indigo-600 text-xs">
                        {set.questions.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                ))}
              </TabsList>

              {generatedSets.map(set => (
                <TabsContent key={set.id} value={set.id} className="mt-4">
                  {set.isGenerating ? (
                    <div className="space-y-4 p-6 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-100 rounded-full">
                          <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                        </div>
                        <span className="text-sm font-medium text-slate-700">문제 생성 중...</span>
                      </div>
                      <Progress value={set.progress} className="h-2" />
                      <p className="text-sm text-slate-500 text-center">
                        {Math.round(set.progress)}% 완료
                      </p>
                    </div>
                  ) : set.questions.length > 0 ? (
                    <div className="space-y-4">
                      <div className="flex justify-end gap-2">
                        <Button 
                          onClick={() => handleDownloadSet(set)} 
                          variant="outline" 
                          size="sm"
                          className="border-slate-200 text-slate-700 hover:bg-slate-50"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          다운로드
                        </Button>
                      </div>
                      <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                        {set.questions.map((q, idx) => (
                          <Card key={idx} className="p-4 border-slate-200">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-medium">
                                  문제 {idx + 1}
                                </Badge>
                                <Badge className="bg-indigo-50 text-indigo-600 border-indigo-200">
                                  {getQuestionTypes().find(t => t.id === q.type)?.name || q.type}
                                </Badge>
                              </div>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                onClick={() => regenerateSingleQuestion(set.id, idx)}
                                className="text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 h-8 w-8 p-0"
                              >
                                <RefreshCw className="w-4 h-4" />
                              </Button>
                            </div>
                            <div 
                              className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed"
                              dangerouslySetInnerHTML={{ 
                                __html: convertUnderlinesToHTML(cleanDisplayText(q.question)) 
                              }} 
                            />
                          </Card>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500">
                      <div className="p-4 bg-slate-100 rounded-full inline-block mb-4">
                        <FileText className="w-8 h-8 text-slate-300" />
                      </div>
                      <p>아직 생성된 문제가 없습니다</p>
                    </div>
                  )}
                </TabsContent>
              ))}
            </Tabs>
          )}

          {generatedSets.length === 0 && (
            <div className="text-center py-12">
              <div className="p-4 bg-slate-100 rounded-full inline-block mb-4">
                <Zap className="w-8 h-8 text-slate-300" />
              </div>
              <p className="text-slate-500 mb-2">문제 생성을 시작하세요</p>
              <p className="text-sm text-slate-400">위의 버튼을 눌러 문제를 생성할 수 있습니다</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
