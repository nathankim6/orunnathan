import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus, Upload, FileText, Settings, ChevronRight, Check } from 'lucide-react';
import { QuestionTypeConfig, PassageData } from './MockExamGenerator';
import { getQuestionTypes } from '@/lib/questionTypes';
import { getMainQuestionCategories } from '@/lib/questionCategories';
import { ScrollArea } from "@/components/ui/scroll-area";

interface MockExamSetupProps {
  onComplete: (configs: QuestionTypeConfig[], passages: PassageData[]) => void;
  questionConfigs: QuestionTypeConfig[];
  passages: PassageData[];
}

export const MockExamSetup = ({ onComplete, questionConfigs, passages }: MockExamSetupProps) => {
  const [examName, setExamName] = useState('');
  const [selectedQuestions, setSelectedQuestions] = useState<{[key: string]: number}>({});
  const [passageText, setPassageText] = useState('');
  const [passageList, setPassageList] = useState<PassageData[]>(passages);
  const [enabledInputs, setEnabledInputs] = useState<{ [key: string]: boolean }>({});

  const questionTypes = getQuestionTypes();
  const categories = getMainQuestionCategories();

  const handleQuestionSelect = (questionId: string, count: number) => {
    setSelectedQuestions(prev => {
      if (count <= 0) {
        const { [questionId]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [questionId]: count };
    });
  };

  const handlePassagePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedText = e.clipboardData.getData('text');
    
    const cleanQuotes = (str: string) => {
      return str.replace(/^["'`""'']+|["'`""'']+$/g, '').trim();
    };
    
    const allCells: string[] = [];
    const rows = pastedText.split(/\r?\n/);
    
    rows.forEach(row => {
      if (row.trim()) {
        const cells = row.split('\t');
        cells.forEach(cell => {
          const cleanedCell = cleanQuotes(cell);
          if (cleanedCell) {
            allCells.push(cleanedCell);
          }
        });
      }
    });

    if (allCells.length === 0) {
      const fallbackCells = pastedText
        .split(/\n\s*\n/)
        .filter(text => text.trim())
        .map(text => cleanQuotes(text))
        .filter(text => text);
      allCells.push(...fallbackCells);
    }

    const newPassages = allCells.map(cellContent => ({
      id: `passage-${Date.now()}-${Math.random()}`,
      content: cellContent
    }));

    setPassageList([...passageList, ...newPassages]);
    setPassageText('');
  };

  const addPassage = () => {
    if (passageText.trim()) {
      const newPassage: PassageData = {
        id: `passage-${Date.now()}`,
        content: passageText.trim()
      };
      setPassageList([...passageList, newPassage]);
      setPassageText('');
    }
  };

  const removePassage = (id: string) => {
    setPassageList(passageList.filter(p => p.id !== id));
  };

  const handleComplete = () => {
    if (Object.keys(selectedQuestions).length === 0) {
      alert('문제유형을 선택해주세요.');
      return;
    }
    
    const totalQuestions = Object.values(selectedQuestions).reduce((sum, count) => sum + count, 0);
    let adjustedPassages = [...passageList];
    
    if (passageList.length === 0) {
      alert('최소 1개 이상의 지문을 입력해주세요.');
      return;
    }
    
    if (passageList.length < totalQuestions) {
      const needed = totalQuestions - passageList.length;
      for (let i = 0; i < needed; i++) {
        const sourcePassage = passageList[i % passageList.length];
        adjustedPassages.push({
          ...sourcePassage,
          id: `${sourcePassage.id}-duplicate-${i + 1}`
        });
      }
    } else if (passageList.length > totalQuestions) {
      adjustedPassages = passageList.slice(0, totalQuestions);
    }
    
    const configs: QuestionTypeConfig[] = [];
    Object.entries(selectedQuestions).forEach(([questionId, count]) => {
      const question = questionTypes.find(q => q.id === questionId);
      if (question) {
        configs.push({
          categoryId: `selected-${questionId}`,
          categoryName: '선택된 문제유형',
          questionTypes: [{ id: questionId, name: question.name, count }]
        });
      }
    });
    
    onComplete(configs, adjustedPassages);
  };

  const totalSelected = Object.values(selectedQuestions).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-6 pb-4">
      {/* Exam Name Input */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Settings className="w-4 h-4 text-indigo-500" />
            시험 정보
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-700">시험 이름</Label>
            <Input
              value={examName}
              onChange={(e) => setExamName(e.target.value)}
              placeholder="예: 2024년 3월 전국연합 모의고사"
              className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
            />
          </div>
        </CardContent>
      </Card>

      {/* Question Type Configuration */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <FileText className="w-4 h-4 text-indigo-500" />
            문제유형 선택
            {totalSelected > 0 && (
              <Badge className="ml-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-medium">
                {totalSelected}문제 선택됨
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-5">
          {categories.map((category) => (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center gap-2">
                <div className="h-6 w-1 bg-gradient-to-b from-indigo-500 to-purple-500 rounded-full"></div>
                <h4 className="text-sm font-semibold text-slate-700">{category.name}</h4>
                <div className="flex-1 h-px bg-slate-200"></div>
              </div>
              
                <div className="grid grid-cols-4 gap-2">
                {category.questions.map((question) => (
                  <div 
                    key={question.id} 
                    className={`
                      group relative overflow-hidden rounded-lg border transition-all duration-200 cursor-pointer
                      ${enabledInputs[question.id] 
                        ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-400 shadow-lg ring-1 ring-indigo-200' 
                        : 'bg-white border-slate-200 hover:border-indigo-300 hover:shadow-md hover:bg-slate-50/50'
                      }
                    `}
                    onClick={() => {
                      setEnabledInputs(prev => {
                        const isEnabled = !!prev[question.id];
                        if (isEnabled) {
                          setSelectedQuestions(prevSel => {
                            const { [question.id]: _omit, ...rest } = prevSel;
                            return rest;
                          });
                        }
                        return { ...prev, [question.id]: !isEnabled };
                      });
                    }}
                  >
                    {/* 선택된 상태 인디케이터 */}
                    {enabledInputs[question.id] && (
                      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-indigo-500" />
                    )}
                    
                    <div className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        {/* 체크박스 */}
                        <div 
                          className={`
                            w-4 h-4 rounded border-2 transition-all duration-200 flex items-center justify-center flex-shrink-0
                            ${enabledInputs[question.id] 
                              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 border-indigo-500 shadow-sm' 
                              : 'border-slate-300 group-hover:border-indigo-400'
                            }
                          `}
                        >
                          {enabledInputs[question.id] && (
                            <Check className="w-2.5 h-2.5 text-white" />
                          )}
                        </div>
                        
                        {/* 문제 유형명 */}
                        <h5 className={`
                          flex-1 text-xs font-medium transition-colors leading-tight
                          ${enabledInputs[question.id] 
                            ? 'text-indigo-700' 
                            : 'text-slate-600 group-hover:text-indigo-600'
                          }
                        `}>
                          {question.name}
                        </h5>
                        
                        {/* 숫자 입력 - 항상 표시 */}
                        <div className="flex-shrink-0">
                          <Input
                            type="number"
                            value={selectedQuestions[question.id] || ''}
                            onChange={(e) => {
                              e.stopPropagation();
                              const value = parseInt(e.target.value) || 0;
                              handleQuestionSelect(question.id, value);
                              if (value > 0 && !enabledInputs[question.id]) {
                                setEnabledInputs(prev => ({ ...prev, [question.id]: true }));
                              }
                            }}
                            className={`
                              w-12 h-7 text-center text-xs font-bold rounded border no-spinner transition-all
                              ${enabledInputs[question.id] && (selectedQuestions[question.id] || 0) > 0
                                ? 'bg-indigo-100 border-indigo-300 text-indigo-700' 
                                : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-indigo-300'
                              }
                              focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400
                            `}
                            min="0"
                            max="20"
                            placeholder="0"
                            onClick={(e) => e.stopPropagation()}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
          
          {Object.keys(selectedQuestions).length > 0 && (
            <div className="p-4 bg-indigo-50 border border-indigo-200 rounded-xl">
              <h4 className="text-sm font-semibold text-indigo-800 mb-3">선택된 문제유형</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(selectedQuestions).map(([questionId, count]) => {
                  const question = questionTypes.find(q => q.id === questionId);
                  return (
                    <Badge 
                      key={questionId} 
                      className="bg-white text-indigo-700 border border-indigo-200 px-3 py-1"
                    >
                      {question?.name} <span className="font-bold ml-1">{count}</span>
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Passage Input */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-slate-800 flex items-center gap-2">
            <Upload className="w-4 h-4 text-indigo-500" />
            지문 입력
            {passageList.length > 0 && (
              <Badge className="ml-auto bg-emerald-100 text-emerald-700 font-medium">
                {passageList.length}개 지문
              </Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
            <p className="text-sm text-blue-700">
              💡 엑셀에서 여러 셀을 복사하여 붙여넣으면 각 셀이 별도의 지문으로 처리됩니다.
            </p>
          </div>
          
          <Textarea
            value={passageText}
            onChange={(e) => setPassageText(e.target.value)}
            onPaste={handlePassagePaste}
            placeholder="지문을 입력하거나 엑셀에서 복사하여 붙여넣기하세요."
            rows={4}
            className="bg-slate-50 border-slate-200 text-slate-800 placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
          />
          
          <Button 
            onClick={addPassage} 
            disabled={!passageText.trim()} 
            variant="outline"
            className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
          >
            <Plus className="w-4 h-4 mr-2" />
            지문 추가
          </Button>
        </CardContent>
      </Card>

      {/* Passage List */}
      {passageList.length > 0 && (
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-slate-800">
              입력된 지문 목록
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="max-h-[300px]">
              <div className="space-y-2">
                {passageList.map((passage, index) => (
                  <div 
                    key={passage.id} 
                    className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-200 group hover:border-slate-300"
                  >
                    <Badge variant="outline" className="bg-white text-slate-600 border-slate-300 flex-shrink-0 mt-0.5">
                      {index + 1}
                    </Badge>
                    <p className="text-sm text-slate-600 flex-1 line-clamp-2">
                      {passage.content}
                    </p>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removePassage(passage.id)}
                      className="opacity-0 group-hover:opacity-100 transition-opacity text-red-500 hover:text-red-700 hover:bg-red-50 h-7 w-7 p-0 flex-shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Complete Button */}
      <div className="flex justify-end pt-2">
        <Button 
          onClick={handleComplete}
          disabled={Object.keys(selectedQuestions).length === 0 || passageList.length === 0}
          className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-400 hover:to-purple-500 text-white shadow-md disabled:opacity-50"
        >
          다음 단계로 진행
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};
