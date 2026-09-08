import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MockExamSetup } from './MockExamSetup';
import { PassageAnalysis } from './PassageAnalysis';
import { QuestionGeneration } from './QuestionGeneration';
import { SavedExamsStorage } from './SavedExamsStorage';
import { SaveExamDialog } from './SaveExamDialog';
import { FileText, Brain, Zap, ChevronLeft, ChevronRight, X, Archive, Save, ClipboardList } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { SavedExam } from '@/hooks/use-saved-exams';

interface MockExamGeneratorProps {
  isOpen: boolean;
  onClose: () => void;
}

export interface QuestionTypeConfig {
  categoryId: string;
  categoryName: string;
  questionTypes: Array<{
    id: string;
    name: string;
    count: number;
  }>;
}

export interface PassageData {
  id: string;
  content: string;
  analysis?: {
    rank1: string;
    rank2: string;
    rank3: string;
    reasoning: string;
  };
}

export interface AnalysisResult {
  rank1: PassageData[];
  rank2: PassageData[];
  rank3: PassageData[];
}

export const MockExamGenerator = ({
  isOpen,
  onClose
}: MockExamGeneratorProps) => {
  const [activeTab, setActiveTab] = useState("storage");
  const [questionConfigs, setQuestionConfigs] = useState<QuestionTypeConfig[]>([]);
  const [passages, setPassages] = useState<PassageData[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [generatedQuestions, setGeneratedQuestions] = useState<any>(null);

  const handleSetupComplete = (configs: QuestionTypeConfig[], passageData: PassageData[]) => {
    setQuestionConfigs(configs);
    setPassages(passageData);
    setActiveTab("analysis");
  };

  const handleAnalysisComplete = (result: AnalysisResult) => {
    setAnalysisResult(result);
    setActiveTab("generation");
  };

  const handleLoadExam = (exam: SavedExam) => {
    setQuestionConfigs(exam.question_configs);
    setPassages([]);
    setAnalysisResult(exam.analysis_result || null);
    setGeneratedQuestions(exam.generated_questions || null);

    if (exam.generated_questions) {
      setActiveTab("generation");
    } else if (exam.analysis_result) {
      setActiveTab("analysis");
    } else {
      setActiveTab("setup");
    }
  };

  const handleCreateNew = () => {
    setActiveTab("setup");
    setQuestionConfigs([]);
    setPassages([]);
    setAnalysisResult(null);
    setGeneratedQuestions(null);
  };

  const handleClose = () => {
    setActiveTab("storage");
    setQuestionConfigs([]);
    setPassages([]);
    setAnalysisResult(null);
    setIsAnalyzing(false);
    setGeneratedQuestions(null);
    setShowSaveDialog(false);
    onClose();
  };

  const tabsOrder = ["setup", "analysis", "generation"] as const;
  const currentIndex = tabsOrder.indexOf(activeTab as (typeof tabsOrder)[number]);
  const canGoPrev = currentIndex > 0;
  const canGoNext = activeTab === "setup" && passages.length > 0 || activeTab === "analysis" && !!analysisResult || activeTab === "generation" && false;
  const totalPassages = passages.length;
  const totalSelected = questionConfigs.reduce((sum, c) => sum + c.questionTypes.reduce((s, qt) => s + (qt.count || 0), 0), 0);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-screen h-screen max-w-none p-0 sm:rounded-none overflow-hidden bg-gradient-to-br from-slate-50 via-white to-slate-100 border-0">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-50/50 via-transparent to-transparent pointer-events-none" />
        <div 
          className="absolute inset-0 opacity-[0.02] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at center, #6366f1 1px, transparent 1px)`,
            backgroundSize: '24px 24px'
          }}
        />
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full w-full grid grid-rows-[auto_1fr_auto] relative z-10">
          {/* Header */}
          <header className="border-b border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm">
            <div className="flex flex-col gap-4 px-8 py-5 relative">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleClose} 
                className="absolute top-3 right-3 h-8 w-8 p-0 text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all duration-200 rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
              
              <DialogHeader className="m-0 p-0">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl blur-lg opacity-30" />
                    <div className="relative p-3 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl shadow-lg">
                      <ClipboardList className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <DialogTitle className="text-xl font-bold text-slate-800 tracking-tight">
                      New Veritas 동형모의고사 제작
                    </DialogTitle>
                    <p className="text-sm text-slate-500 mt-1">전문적인 모의고사 제작 시스템</p>
                  </div>
                </div>
              </DialogHeader>
              
              <nav aria-label="모듈 단계" className="w-full">
                <TabsList className="grid w-full grid-cols-4 rounded-xl bg-slate-100 p-1.5 gap-1">
                  <TabsTrigger 
                    value="storage" 
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md data-[state=active]:font-semibold text-slate-600 hover:text-slate-800 hover:bg-white/50 transition-all duration-200 px-4 py-2.5 text-sm"
                  >
                    <Archive className="w-4 h-4" />
                    <span>저장소</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="setup" 
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md data-[state=active]:font-semibold text-slate-600 hover:text-slate-800 hover:bg-white/50 transition-all duration-200 px-4 py-2.5 text-sm"
                  >
                    <FileText className="w-4 h-4" />
                    <span>설정</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="analysis" 
                    disabled={passages.length === 0} 
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md data-[state=active]:font-semibold text-slate-600 hover:text-slate-800 hover:bg-white/50 transition-all duration-200 px-4 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Brain className="w-4 h-4" />
                    <span>분석</span>
                  </TabsTrigger>
                  <TabsTrigger 
                    value="generation" 
                    disabled={!analysisResult} 
                    className="flex items-center gap-2 rounded-lg data-[state=active]:bg-white data-[state=active]:text-indigo-600 data-[state=active]:shadow-md data-[state=active]:font-semibold text-slate-600 hover:text-slate-800 hover:bg-white/50 transition-all duration-200 px-4 py-2.5 text-sm disabled:opacity-40 disabled:cursor-not-allowed"
                  >
                    <Zap className="w-4 h-4" />
                    <span>생성</span>
                  </TabsTrigger>
                </TabsList>
              </nav>
            </div>
          </header>

          {/* Body */}
          <div className="flex min-h-0 overflow-hidden">
            {/* Sidebar */}
            <aside className="hidden md:flex w-72 shrink-0 border-r border-slate-200 bg-white/60 backdrop-blur-sm min-h-0">
              <ScrollArea className="h-full w-full">
                <section className="px-5 py-6 space-y-5">
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full" />
                      시스템 요약
                    </h3>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-sm text-slate-600">지문 수</span>
                        <span className="font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-md text-sm">{totalPassages}</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-sm text-slate-600">선택 수량</span>
                        <span className="font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-md text-sm">{totalSelected}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
                    <h3 className="text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                      <div className="w-2 h-2 bg-emerald-500 rounded-full" />
                      진행 상태
                    </h3>
                    <ul className="space-y-2">
                      <li className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-sm text-slate-600">설정</span>
                        <span className={`font-medium px-2.5 py-1 rounded-full text-xs ${totalPassages > 0 ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'}`}>
                          {totalPassages > 0 ? '완료' : '대기'}
                        </span>
                      </li>
                      <li className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-sm text-slate-600">분석</span>
                        <span className={`font-medium px-2.5 py-1 rounded-full text-xs ${analysisResult ? 'text-emerald-700 bg-emerald-100' : 'text-amber-700 bg-amber-100'}`}>
                          {analysisResult ? '완료' : '대기'}
                        </span>
                      </li>
                      <li className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <span className="text-sm text-slate-600">생성</span>
                        <span className={`font-medium px-2.5 py-1 rounded-full text-xs ${analysisResult ? 'text-emerald-700 bg-emerald-100' : 'text-slate-500 bg-slate-200'}`}>
                          {analysisResult ? '가능' : '잠금'}
                        </span>
                      </li>
                    </ul>
                  </div>
                </section>
              </ScrollArea>
            </aside>

            {/* Main */}
            <main className="flex-1 min-h-0 overflow-hidden p-6 bg-gradient-to-br from-slate-50/50 to-white">
              <TabsContent value="storage" className="m-0 h-full">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 h-[calc(100vh-220px)]">
                  <SavedExamsStorage onLoadExam={handleLoadExam} onCreateNew={handleCreateNew} />
                </div>
              </TabsContent>
              
              <TabsContent value="setup" className="m-0">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 max-h-[calc(100vh-300px)] overflow-y-auto scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400">
                  <MockExamSetup onComplete={handleSetupComplete} questionConfigs={questionConfigs} passages={passages} />
                </div>
              </TabsContent>

              <TabsContent value="analysis" className="m-0">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <PassageAnalysis passages={passages} questionConfigs={questionConfigs} onComplete={handleAnalysisComplete} isAnalyzing={isAnalyzing} setIsAnalyzing={setIsAnalyzing} />
                </div>
              </TabsContent>

              <TabsContent value="generation" className="m-0">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                  <QuestionGeneration analysisResult={analysisResult} questionConfigs={questionConfigs} />
                </div>
              </TabsContent>
            </main>
          </div>

          {/* Footer */}
          <footer className="border-t border-slate-200 bg-white/80 backdrop-blur-xl px-8 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-sm font-medium text-slate-600">{currentIndex + 1} / 3 단계</div>
              <div className="flex gap-1.5">
                {tabsOrder.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                      idx <= currentIndex 
                        ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-sm' 
                        : 'bg-slate-200'
                    }`} 
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              {(questionConfigs.length > 0 || analysisResult || generatedQuestions) && (
                <Button 
                  onClick={() => setShowSaveDialog(true)} 
                  className="bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-white shadow-md"
                >
                  <Save className="w-4 h-4 mr-2" />
                  저장
                </Button>
              )}
              <Button 
                variant="outline" 
                onClick={handleClose} 
                className="border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-slate-800"
              >
                닫기
              </Button>
              <Button 
                variant="outline"
                onClick={() => setActiveTab(tabsOrder[Math.max(0, currentIndex - 1)])} 
                disabled={!canGoPrev} 
                className="border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-40"
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> 이전
              </Button>
              <Button 
                onClick={() => setActiveTab(tabsOrder[Math.min(tabsOrder.length - 1, currentIndex + 1)])} 
                disabled={!canGoNext} 
                className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-md disabled:opacity-40 disabled:shadow-none"
              >
                다음 <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          </footer>
        </Tabs>
        
        <SaveExamDialog 
          isOpen={showSaveDialog} 
          onClose={() => setShowSaveDialog(false)} 
          questionConfigs={questionConfigs} 
          analysisResult={analysisResult} 
          generatedQuestions={generatedQuestions} 
        />
      </DialogContent>
    </Dialog>
  );
};
