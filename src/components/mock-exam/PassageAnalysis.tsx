import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Brain, Loader2, CheckCircle, AlertCircle, Sparkles, Info, Zap } from 'lucide-react';
import { QuestionTypeConfig, PassageData, AnalysisResult } from './MockExamGenerator';
import { AIClientManager } from '@/lib/ai/aiClientManager';
import { toast } from '@/hooks/use-toast';
import { getQuestionTypes } from '@/lib/questionTypes';

interface PassageAnalysisProps {
  passages: PassageData[];
  questionConfigs: QuestionTypeConfig[];
  onComplete: (result: AnalysisResult) => void;
  isAnalyzing: boolean;
  setIsAnalyzing: (analyzing: boolean) => void;
}

export const PassageAnalysis = ({ 
  passages, 
  questionConfigs, 
  onComplete, 
  isAnalyzing, 
  setIsAnalyzing 
}: PassageAnalysisProps) => {
  const [progress, setProgress] = useState(0);
  const [analysisResults, setAnalysisResults] = useState<PassageData[]>([]);
  const [currentAnalyzing, setCurrentAnalyzing] = useState<string>('');
  const aiManager = AIClientManager.getInstance();

  const getTypeNameById = (typeId: string): string => {
    const allTypes = getQuestionTypes();
    const type = allTypes.find(t => t.id === typeId);
    return type ? type.name : typeId;
  };

  const countSentences = (text: string): number => {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    return sentences.length;
  };

  const getMinSentencesForType = (typeId: string): number => {
    const requirements: Record<string, number> = {
      'summary': 4,
      'order': 4,
      'blank': 3,
      'blankMultiple': 5,
      'purpose': 3,
      'mainPoint': 3,
      'claim': 3,
      'title': 2,
      'topic': 2,
      'contentMatch': 4,
      'contentMismatch': 4,
      'vocabulary': 2,
      'implication': 3,
      'reference': 3,
      'referenceInference': 3,
      'insert': 4,
      'logicFlow': 4,
      'irrelevant': 4
    };
    return requirements[typeId] || 2;
  };

  const filterViableTypes = (passage: string, selectedTypes: any[]) => {
    const sentenceCount = countSentences(passage);
    
    return selectedTypes.filter(type => {
      const minRequired = getMinSentencesForType(type.id);
      return sentenceCount >= minRequired;
    });
  };

  const createAnalysisPrompt = (passage: string) => {
    const selectedTypes = questionConfigs.flatMap(config => 
      config.questionTypes.map(qt => ({
        id: qt.id,
        name: qt.name,
        count: qt.count
      }))
    );

    const viableTypes = filterViableTypes(passage, selectedTypes);
    
    if (viableTypes.length < 3) {
      console.warn(`지문의 문장 수가 부족합니다. 사용 가능한 유형: ${viableTypes.length}개`);
    }

    const typesList = viableTypes.map(type => `${type.id} (${type.name})`).join('\n- ');

    return `다음 영어 지문을 분석하여 아래 제공된 문제유형 중에서만 가장 적절한 3가지를 1,2,3순위로 추천해주세요.

지문:
${passage}

선택 가능한 문제유형 (반드시 이 목록에서만 선택):
- ${typesList}

분석 규칙:
1. 반드시 위 목록의 문제유형 ID만 사용하세요
2. 1,2,3순위는 서로 다른 유형이어야 합니다 (중복 불가)
3. 지문의 길이와 구조를 고려하여 적절한 유형만 선정하세요
4. 문장 수가 부족한 유형은 선택하지 마세요
5. 가장 출제가 유력한 조합을 1순위, 그다음을 2순위, 3순위로 선정

응답 형식:
1순위: [문제유형ID]
2순위: [문제유형ID]  
3순위: [문제유형ID]
분석근거: [선정 이유를 간단히 설명]

예시:
1순위: purpose
2순위: claim
3순위: summary
분석근거: 이 지문은 특정 목적을 가지고 작성되어 목적 추론이 가장 적합하며, 저자의 주장이 명확하게 드러나고 전체 내용을 요약할 수 있는 구조를 가지고 있습니다.`;
  };

  const parseAnalysisResult = (result: string, passage: string): PassageData['analysis'] => {
    try {
      const selectedTypes = questionConfigs.flatMap(config => 
        config.questionTypes.map(qt => ({
          id: qt.id,
          name: qt.name,
          count: qt.count
        }))
      );
      
      const viableTypes = filterViableTypes(passage, selectedTypes);
      const availableTypeIds = viableTypes.map(t => t.id);

      const lines = result.split('\n').filter(line => line.trim());
      
      const extractTypeId = (line: string): string => {
        const match = line.match(/\d순위:\s*([a-zA-Z]+)/);
        if (match) {
          const typeId = match[1].toLowerCase();
          if (availableTypeIds.includes(typeId)) {
            return typeId;
          }
        }
        return '';
      };

      const rank1Line = lines.find(line => line.includes('1순위:'));
      const rank2Line = lines.find(line => line.includes('2순위:'));
      const rank3Line = lines.find(line => line.includes('3순위:'));
      const reasoningLine = lines.find(line => line.includes('분석근거:'));

      let rank1 = rank1Line ? extractTypeId(rank1Line) : '';
      let rank2 = rank2Line ? extractTypeId(rank2Line) : '';
      let rank3 = rank3Line ? extractTypeId(rank3Line) : '';

      const usedTypes = new Set([rank1, rank2, rank3].filter(Boolean));
      const unusedTypes = availableTypeIds.filter(id => !usedTypes.has(id));

      if (!rank1 || rank1 === '') {
        rank1 = unusedTypes.shift() || availableTypeIds[0] || 'purpose';
      }
      if (!rank2 || rank2 === '' || rank2 === rank1) {
        rank2 = unusedTypes.shift() || availableTypeIds[1] || 'summary';
      }
      if (!rank3 || rank3 === '' || rank3 === rank1 || rank3 === rank2) {
        rank3 = unusedTypes.shift() || availableTypeIds[2] || 'title';
      }

      return {
        rank1,
        rank2,
        rank3,
        reasoning: reasoningLine ? reasoningLine.replace('분석근거:', '').trim() : '자동 분석 완료'
      };
    } catch (error) {
      console.error('Failed to parse analysis result:', error);
      
      const selectedTypes = questionConfigs.flatMap(config => 
        config.questionTypes.map(qt => ({
          id: qt.id,
          name: qt.name,
          count: qt.count
        }))
      );
      
      const viableTypes = filterViableTypes(passage, selectedTypes);
      const fallbackTypes = viableTypes.map(t => t.id);
      
      return {
        rank1: fallbackTypes[0] || 'purpose',
        rank2: fallbackTypes[1] || 'summary', 
        rank3: fallbackTypes[2] || 'title',
        reasoning: '분석 결과 파싱 중 오류 발생 - 기본값 적용'
      };
    }
  };
  
  const getQuotas = () => {
    const quotas: Record<string, number> = {};
    questionConfigs.forEach(config => {
      config.questionTypes.forEach(qt => {
        if (qt.count > 0) {
          quotas[qt.id] = (quotas[qt.id] || 0) + qt.count;
        }
      });
    });
    return quotas;
  };

  const distributeTypes = (
    inputPassages: PassageData[],
    quotasInput: Record<string, number>,
    rankIndex: 1 | 2 | 3
  ): PassageData[] => {
    const updated = inputPassages.map((p) => ({
      ...p,
      analysis: p.analysis
        ? { ...p.analysis }
        : { rank1: '', rank2: '', rank3: '', reasoning: '' },
    }));

    const quotas: Record<string, number> = { ...quotasInput };

    const getViableTypeIdsForPassage = (p: PassageData): string[] => {
      const selectedTypes = questionConfigs.flatMap((config) =>
        config.questionTypes.map((qt) => ({ id: qt.id, name: qt.name, count: qt.count }))
      );
      return filterViableTypes(p.content, selectedTypes).map((t) => t.id);
    };

    for (let i = 0; i < updated.length; i++) {
      const p = updated[i];
      const a = p.analysis!;
      const viableIds = new Set(getViableTypeIdsForPassage(p));

      const preferred = rankIndex === 1 ? a.rank1 : rankIndex === 2 ? a.rank2 : a.rank3;

      const canUsePreferred = preferred && viableIds.has(preferred) && (quotas[preferred] ?? 0) > 0;

      let assigned: string | '' = '';
      if (canUsePreferred) {
        assigned = preferred;
      } else {
        const candidate = Object.keys(quotas).find((typeId) => (quotas[typeId] ?? 0) > 0 && viableIds.has(typeId));
        if (candidate) assigned = candidate as string;
      }

      if (assigned) {
        quotas[assigned] = Math.max(0, (quotas[assigned] ?? 0) - 1);
        if (rankIndex === 1) a.rank1 = assigned;
        else if (rankIndex === 2) a.rank2 = assigned;
        else a.rank3 = assigned;
      } else {
        const existing = preferred;
        if (!existing || !viableIds.has(existing)) {
          if (rankIndex === 1) a.rank1 = '';
          else if (rankIndex === 2) a.rank2 = '';
          else a.rank3 = '';
        }
      }
    }

    return updated;
  };

  const analyzePassages = async () => {
    setIsAnalyzing(true);
    setProgress(0);
    setAnalysisResults([]);

    const quotasForValidation = getQuotas();
    const totalRequested = Object.values(quotasForValidation).reduce((acc, v) => acc + v, 0);
    
    toast({
      title: "분석 정보",
      description: `총 ${totalRequested}개 문제를 ${passages.length}개 지문으로 생성합니다.`,
    });

    try {
      const aiClient = aiManager.createClient();
      const availableAPI = aiManager.getAvailableAPI();
      
      toast({
        title: "분석 시작",
        description: `${availableAPI === 'claude' ? 'Claude' : 'GPT'}를 사용하여 지문을 분석합니다.`
      });
    } catch (error: any) {
      toast({
        title: "API 키 오류",
        description: "Claude 또는 GPT API 키를 확인해주세요. 메인페이지 설정에서 유효한 API 키를 입력하세요.",
        variant: "destructive",
      });
      setIsAnalyzing(false);
      return;
    }

    try {
      const results: PassageData[] = [];
      const aiClient = aiManager.createClient();

      for (let i = 0; i < passages.length; i++) {
        const passage = passages[i];
        setCurrentAnalyzing(`지문 ${i + 1} 분석 중...`);
        
        const prompt = createAnalysisPrompt(passage.content);
        const analysisResult = await aiClient.generateCompletion(prompt);
        
        const analysis = parseAnalysisResult(analysisResult, passage.content);
        const updatedPassage: PassageData = {
          ...passage,
          analysis
        };
        
        results.push(updatedPassage);
        setAnalysisResults([...results]);
        
        const progressValue = ((i + 1) / passages.length) * 100;
        setProgress(progressValue);

        if (i < passages.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      const quotas = getQuotas();
      const afterRank1 = distributeTypes(results, quotas, 1);
      const afterRank2 = distributeTypes(afterRank1, quotas, 2);
      const finalResults = distributeTypes(afterRank2, quotas, 3);

      setAnalysisResults(finalResults);

      const categorizedResult: AnalysisResult = {
        rank1: finalResults,
        rank2: finalResults,
        rank3: finalResults
      };

      toast({
        title: "분석 완료",
        description: `${passages.length}개 지문 분석이 완료되었습니다. 결과를 확인 후 다음 단계로 진행하세요.`,
      });
      
    } catch (error) {
      console.error('Analysis failed:', error);
      toast({
        title: "분석 실패",
        description: "지문 분석 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setCurrentAnalyzing('');
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-3 text-slate-800">
            <div className="p-2 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg">
              <Brain className="w-5 h-5 text-white" />
            </div>
            AI 지문 분석 시스템
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 p-5 rounded-xl border border-indigo-100">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-indigo-500 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="font-semibold text-slate-800 mb-2">분석 과정</h4>
                <ul className="text-sm space-y-1.5 text-slate-600">
                  <li>• 각 지문을 AI가 분석하여 최적의 문제유형을 1,2,3순위로 추천</li>
                  <li>• 분석 결과를 바탕으로 3개 섹션으로 구분하여 문제 생성</li>
                  <li>• 총 <span className="font-semibold text-indigo-600">{passages.length}개</span> 지문이 분석됩니다</li>
                </ul>
              </div>
            </div>
          </div>

          {!isAnalyzing && analysisResults.length === 0 && (
            <Button 
              onClick={analyzePassages} 
              size="lg" 
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-md h-12"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              AI 분석 시작
            </Button>
          )}

          {isAnalyzing && (
            <div className="space-y-4 p-5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-indigo-100 rounded-full">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-600" />
                </div>
                <span className="text-sm font-medium text-slate-700">{currentAnalyzing}</span>
              </div>
              <Progress value={progress} className="w-full h-2" />
              <p className="text-sm text-slate-500 text-center">
                {Math.round(progress)}% 완료 ({analysisResults.length}/{passages.length})
              </p>
            </div>
          )}

          {analysisResults.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 rounded-full">
                  <CheckCircle className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="font-semibold text-slate-800">분석 결과</span>
              </div>
              
              <div className="grid gap-3 max-h-[400px] overflow-y-auto pr-2">
                {analysisResults.map((passage, index) => (
                  <Card key={passage.id} className="p-4 border-slate-200 hover:border-indigo-200 transition-colors">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="bg-slate-50 text-slate-700 border-slate-200 font-medium">
                          지문 {index + 1}
                        </Badge>
                        <span className="text-sm text-slate-500 line-clamp-1 flex-1">
                          {passage.content.substring(0, 80)}...
                        </span>
                      </div>
                      
                      {passage.analysis && (
                        <div className="space-y-2">
                          <div className="flex flex-wrap gap-2">
                            <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white border-0">
                              최종 배정: {getTypeNameById(passage.analysis.rank1)}
                            </Badge>
                            <Badge variant="outline" className="text-xs text-slate-600 border-slate-300">
                              AI 2순위: {getTypeNameById(passage.analysis.rank2)}
                            </Badge>
                            <Badge variant="outline" className="text-xs text-slate-600 border-slate-300">
                              AI 3순위: {getTypeNameById(passage.analysis.rank3)}
                            </Badge>
                          </div>
                          <p className="text-xs text-slate-500">
                            {passage.analysis.reasoning}
                          </p>
                          <p className="text-xs text-indigo-600 font-medium flex items-center gap-1">
                            <Zap className="w-3 h-3" />
                            실제 생성될 문제 유형: {getTypeNameById(passage.analysis.rank1)}
                          </p>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {analysisResults.length === passages.length && !isAnalyzing && (
        <div className="flex justify-end">
          <Button 
            onClick={() => {
              const categorizedResult: AnalysisResult = {
                rank1: analysisResults,
                rank2: analysisResults,
                rank3: analysisResults
              };
              onComplete(categorizedResult);
            }}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-md"
          >
            다음 단계: 문제 생성 →
          </Button>
        </div>
      )}
    </div>
  );
};
