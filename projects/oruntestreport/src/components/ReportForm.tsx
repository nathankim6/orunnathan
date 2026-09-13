import { shouldShowInsight } from '@/utils/problemInsight';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { toast } from "sonner";
import { Camera, X, ArrowLeft, Sparkles } from "lucide-react";
import { TeacherPhotoUploader } from './TeacherPhotoUploader';
import TeacherPhotoDialog from './TeacherPhotoDialog';
import { supabase } from '@/integrations/supabase/client';
import { saveReportCard, getReportCardById, convertDbToAppFormat, type ProblemType, type ReportCardData } from '@/integrations/supabase/reportService';
import MiddleSchoolProblemTypes from './MiddleSchoolProblemTypes';
import HighSchoolProblemTypes from './HighSchoolProblemTypes';
import ExamFeaturesEditor from './ExamFeaturesEditor';
import KillerTop5Editor from './KillerTop5Editor';
import OverallEvaluation, { STRATEGY_CATEGORY, SUMMARY_CATEGORY } from './OverallEvaluation';

import ExamPdfAnalyzer, { type ExamAnalysis } from './ExamPdfAnalyzer';
import OriginalPassageInput from './OriginalPassageInput';
import PassageVariantEditor from './PassageVariantEditor';

import { getSchoolLogo } from '@/lib/schoolLogos';

// 은하 시네마 톤 섹션 헤더 — 조건부 영문 아이브로우 + 헤어라인 + 한글 제목
const SectionHeading: React.FC<{ kicker: string; title: string; description?: string }> = ({
  kicker,
  title,
  description,
}) => (
  <div className="u-section-head">
    <div className="u-section-head-row">
      <span className="u-chip">{kicker}</span>
      <span className="u-rule" aria-hidden="true" />
    </div>
    <h2>{title}</h2>
    {description && <p>{description}</p>}
  </div>
);

interface ReportFormProps {
  schoolType?: 'middle' | 'high';
}
interface CategoryEvaluation {
  category: string;
  evaluation: string;
}
const ReportForm: React.FC<ReportFormProps> = ({
  schoolType
}) => {
  const navigate = useNavigate();
  const {
    id
  } = useParams<{
    id: string;
  }>();

  // Add back button handler
  const handleBackClick = () => {
    navigate('/create-report');
  };
  const [loading, setLoading] = useState(false);
  const [teacherPhotos, setTeacherPhotos] = useState<any[]>([]);
  const [showCustomExamInfo, setShowCustomExamInfo] = useState(false);
  const [showCustomGrade, setShowCustomGrade] = useState(false);
  const [analysisType, setAnalysisType] = useState<'detailed' | 'simple'>('detailed');
  const [gptLoading, setGptLoading] = useState<Record<string, boolean>>({});
  // 단계별 진행 (위저드)
  const [step, setStep] = useState(0);
  const [dir, setDir] = useState(1); // 전환 방향 (1: 다음, -1: 이전)
  
  // Undo history for text fields
  const [undoHistory, setUndoHistory] = useState<{
    difficultProblemsExplanation: string[];
    categoryEvaluations: CategoryEvaluation[][];
  }>({
    difficultProblemsExplanation: [],
    categoryEvaluations: []
  });
  const [formData, setFormData] = useState<ReportCardData>({
    school: '',
    grade: '',
    examScope: '',
    teacher: '',
    // Changed from '미정' to empty string
    teacherPhoto: '',
    totalQuestions: 3,
    objectiveQuestions: 3,
    subjectiveQuestions: 0,
    problemTypes: Array.from({
      length: 3
    }, (_, index) => ({
      id: Date.now().toString() + Math.random() + index,
      name: "",
      category: "",
      questionType: 'objective' as const,
      difficulty: 'medium' as const
    })),
    difficulty: {
      easy: 25,
      medium: 25,
      hard: 25,
      very_hard: 25
    },
    difficultProblemsExplanation: '',
    overallEvaluation: '',
    examInfo: '',
    examDate: '',
    // Add default value for examInfo
    hitQuestionPhotos: [],
    examFeatures: [],
    killerTop5: [],
    originalPassages: '',
    passageVariants: []

  });

  // 입력한 학교명에 따라 왼쪽에 로고 자동 표시
  const schoolLogoUrl = useMemo(() => getSchoolLogo(formData.school), [formData.school]);

  /** 기본 정보 입력값이 헤더 제목에 즉시 반영 — 예: "숭의여자고등학교 1학년 1학기 기말고사" */
  const formLiveTitle = useMemo(() => {
    const parts = [formData.school?.trim(), formData.grade?.trim(), formData.examInfo?.trim()].filter(Boolean);
    return parts.length > 0 ? parts.join(' ') : '내신분석 리포트 작성';
  }, [formData.school, formData.grade, formData.examInfo]);


  // 종합 평가 — 출제 특징 / 종합의견 2분할
  const [categoryEvaluations, setCategoryEvaluations] = useState<CategoryEvaluation[]>([{
    category: STRATEGY_CATEGORY,
    evaluation: ''
  }, {
    category: SUMMARY_CATEGORY,
    evaluation: ''
  }]);


  // Save to history before changing
  const saveToHistory = useCallback((type: 'difficultProblemsExplanation' | 'categoryEvaluations', value: string | CategoryEvaluation[]) => {
    setUndoHistory(prev => {
      if (type === 'difficultProblemsExplanation') {
        return {
          ...prev,
          difficultProblemsExplanation: [...prev.difficultProblemsExplanation, value as string].slice(-10) // Keep last 10 states
        };
      } else {
        return {
          ...prev,
          categoryEvaluations: [...prev.categoryEvaluations, value as CategoryEvaluation[]].slice(-10) // Keep last 10 states
        };
      }
    });
  }, []);

  // Undo function
  const handleUndo = useCallback(() => {
    setUndoHistory(prev => {
      // Check if we have history for difficultProblemsExplanation
      if (prev.difficultProblemsExplanation.length > 0) {
        const lastState = prev.difficultProblemsExplanation[prev.difficultProblemsExplanation.length - 1];
        setFormData(currentFormData => ({
          ...currentFormData,
          difficultProblemsExplanation: lastState
        }));
        return {
          ...prev,
          difficultProblemsExplanation: prev.difficultProblemsExplanation.slice(0, -1)
        };
      }
      // Check if we have history for categoryEvaluations
      else if (prev.categoryEvaluations.length > 0) {
        const lastState = prev.categoryEvaluations[prev.categoryEvaluations.length - 1];
        setCategoryEvaluations(lastState);
        return {
          ...prev,
          categoryEvaluations: prev.categoryEvaluations.slice(0, -1)
        };
      }
      return prev;
    });
    toast.success('이전 상태로 되돌렸습니다.');
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === 'z') {
        e.preventDefault();
        handleUndo();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo]);

  // Add the missing handleEvaluationChange function with proper debugging
  const handleEvaluationChange = (category: string, value: string) => {
    console.log(`ReportForm - Updating evaluation for category: ${category} with value: ${value}`);
    
    // Save current state to history before changing
    setCategoryEvaluations(prev => {
      saveToHistory('categoryEvaluations', prev);
      
      // First check if this category exists
      const categoryExists = prev.some(item => item.category === category);
      if (categoryExists) {
        // Update existing category
        return prev.map(item => {
          if (item.category === category) {
            return {
              ...item,
              evaluation: value
            };
          }
          return item;
        });
      } else {
        // Add new category
        return [...prev, {
          category,
          evaluation: value
        }];
      }
    });
  };
  useEffect(() => {
    if (id) {
      console.log('ReportForm - Loading report with ID:', id);
      getReportCardById(id).then(({
        data,
        error
      }) => {
        if (data && !error) {
          console.log('ReportForm - Raw data from DB:', data);
          const reportData = convertDbToAppFormat(data);
          console.log('ReportForm - Converted report data:', reportData);
          console.log('ReportForm - Problem types with categories:', reportData.problemTypes);
          setFormData(reportData);

          // Check if examInfo is a custom value (not in predefined options)
          const predefinedOptions = ['1학기 중간고사', '1학기 기말고사', '2학기 중간고사', '2학기 기말고사'];
          if (reportData.examInfo && !predefinedOptions.includes(reportData.examInfo)) {
            setShowCustomExamInfo(true);
          }

          // Check if grade is a custom value (not in predefined options)
          const predefinedGrades = ['1학년', '2학년', '3학년'];
          if (reportData.grade && !predefinedGrades.includes(reportData.grade)) {
            setShowCustomGrade(true);
          }

          // Parse the overall evaluation if it exists
          if (reportData.overallEvaluation) {
            try {
              const parsedEvaluations = JSON.parse(reportData.overallEvaluation);
              if (Array.isArray(parsedEvaluations)) {
                setCategoryEvaluations(parsedEvaluations);
              }
            } catch (e) {
              // If parsing fails, use the overall evaluation as a single category
              setCategoryEvaluations([{
                category: '종합 평가',
                evaluation: reportData.overallEvaluation
              }, ...categoryEvaluations.slice(1)]);
            }
          }
        } else {
          console.error('Error fetching report card:', error);
          toast.error('보고서를 불러오는 중 오류가 발생했습니다.');
        }
      });
    }
  }, [id]);

  // Fetch teacher photos on component mount
  useEffect(() => {
    const fetchTeacherPhotos = async () => {
      try {
        const {
          data: teacherPhotosData,
          error
        } = await supabase.from('teacher_photos').select('*').order('created_at', {
          ascending: false
        });
        if (error) throw error;
        if (teacherPhotosData) {
          setTeacherPhotos(teacherPhotosData);
        }
      } catch (error) {
        console.error('Error fetching teacher photos:', error);
      }
    };
    fetchTeacherPhotos();
  }, []);
  const handleQuestionCountChange = (field: 'totalQuestions' | 'objectiveQuestions' | 'subjectiveQuestions', value: string) => {
    const numValue = parseInt(value) || 0;
    setFormData(prev => {
      let newData = {
        ...prev,
        [field]: numValue
      };
      if (field === 'totalQuestions') {
        if (newData.objectiveQuestions + newData.subjectiveQuestions > numValue) {
          newData.objectiveQuestions = Math.floor(numValue * 0.6);
          newData.subjectiveQuestions = numValue - newData.objectiveQuestions;
        }
        const currentTypeCount = prev.problemTypes.length;
        if (numValue > currentTypeCount) {
          const newTypes = Array.from({
            length: numValue - currentTypeCount
          }, (_, index) => ({
            id: Date.now().toString() + Math.random() + index,
            name: "",
            category: "",
            questionType: 'objective' as const,
            difficulty: 'medium' as const
          }));
          newData.problemTypes = [...prev.problemTypes, ...newTypes];
        } else if (numValue < currentTypeCount) {
          newData.problemTypes = prev.problemTypes.slice(0, numValue);
        }
      } else if (field === 'objectiveQuestions') {
        // When objective question count is changed, automatically update subjective question count
        newData.subjectiveQuestions = Math.max(0, newData.totalQuestions - numValue);
      } else if (field === 'subjectiveQuestions') {
        // When subjective question count is changed, automatically update objective question count
        newData.objectiveQuestions = Math.max(0, newData.totalQuestions - numValue);
      }
      return newData;
    });
  };
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const {
      name,
      value
    } = e.target;
    
    // Save to history before changing for specific text fields
    if (name === 'difficultProblemsExplanation' && formData[name as keyof ReportCardData] !== value) {
      saveToHistory('difficultProblemsExplanation', formData.difficultProblemsExplanation);
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // Modified handler for exam info select
  const handleExamInfoChange = (value: string) => {
    if (value === '직접 입력') {
      setShowCustomExamInfo(true);
      setFormData(prev => ({
        ...prev,
        examInfo: ''
      }));
    } else {
      setShowCustomExamInfo(false);
      setFormData(prev => ({
        ...prev,
        examInfo: value
      }));
    }
  };

  // Handler for grade select
  const handleGradeChange = (value: string) => {
    if (value === '직접 입력') {
      setShowCustomGrade(true);
      setFormData(prev => ({
        ...prev,
        grade: ''
      }));
    } else {
      setShowCustomGrade(false);
      setFormData(prev => ({
        ...prev,
        grade: value
      }));
    }
  };
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setLoading(true);

      // Validate required fields
      if (!formData.school.trim()) {
        toast.error('학교 이름을 입력해주세요.');
        setLoading(false);
        return;
      }
      if (!formData.grade.trim()) {
        toast.error('학년 정보를 입력해주세요.');
        setLoading(false);
        return;
      }
      if (!formData.examScope.trim()) {
        toast.error('시험 범위를 입력해주세요.');
        setLoading(false);
        return;
      }

      // Combine category evaluations into JSON string
      const combinedEvaluation = JSON.stringify(categoryEvaluations);

      // Ensure teacher has a default value if empty
      const dataToSave = {
        ...formData,
        teacher: formData.teacher.trim() || '미정',
        overallEvaluation: combinedEvaluation,
        analysisType: analysisType
      };
      const {
        data,
        error
      } = await saveReportCard(dataToSave);
      if (error) {
        console.error('Error saving report card:', error);
        toast.error('보고서 저장 중 오류가 발생했습니다: ' + error.message);
        return;
      }
      toast.success('보고서가 저장되었습니다.');
      navigate('/saved-reports');
    } catch (error: any) {
      console.error('Error saving report card:', error);
      toast.error(`보고서 저장 중 오류가 발생했습니다: ${error.message || '알 수 없는 오류'}`);
    } finally {
      setLoading(false);
    }
  };

  // State for the "Add" section
  const [addCount, setAddCount] = useState(3); // Changed from 5 to 3

  // Helper functions for ProblemTypes components
  const handleAddProblemType = () => {
    setFormData(prev => {
      const newProblemType = {
        id: Date.now().toString() + Math.random(),
        name: "",
        category: "",
        questionType: 'objective' as const,
        difficulty: 'medium' as const
      };
      return {
        ...prev,
        problemTypes: [...prev.problemTypes, newProblemType],
        totalQuestions: prev.totalQuestions + 1,
        objectiveQuestions: prev.objectiveQuestions + 1
      };
    });
  };
  const handleAddMultiple = (count: number) => {
    setFormData(prev => {
      const newTypes = Array.from({
        length: count
      }, (_, index) => ({
        id: Date.now().toString() + Math.random() + index,
        name: "",
        category: "",
        questionType: 'objective' as const,
        difficulty: 'medium' as const
      }));
      return {
        ...prev,
        problemTypes: [...prev.problemTypes, ...newTypes],
        totalQuestions: prev.totalQuestions + count,
        objectiveQuestions: prev.objectiveQuestions + count
      };
    });
  };
  const handleRemoveType = (id: string) => {
    setFormData(prev => {
      const updatedTypes = prev.problemTypes.filter(type => type.id !== id);
      return {
        ...prev,
        problemTypes: updatedTypes,
        totalQuestions: updatedTypes.length,
        objectiveQuestions: updatedTypes.filter(type => type.questionType === 'objective').length,
        subjectiveQuestions: updatedTypes.filter(type => type.questionType === 'subjective').length
      };
    });
  };
  const handleRemoveAllTypes = () => {
    setFormData(prev => ({
      ...prev,
      problemTypes: [],
      totalQuestions: 0,
      objectiveQuestions: 0,
      subjectiveQuestions: 0
    }));
  };
  const handleUpdateType = (id: string, field: keyof ProblemType, value: string | boolean | number) => {
    setFormData(prev => {
      const updatedTypes = prev.problemTypes.map(type => {
        if (type.id === id) {
          const updatedType = {
            ...type,
            [field]: value
          };
          // If questionType is changed, update the counts
          if (field === 'questionType') {
            const prevType = type.questionType;
            const newType = value as 'objective' | 'subjective';
            if (prevType !== newType) {
              if (newType === 'objective') {
                prev.objectiveQuestions += 1;
                prev.subjectiveQuestions = Math.max(0, prev.subjectiveQuestions - 1);
              } else {
                prev.subjectiveQuestions += 1;
                prev.objectiveQuestions = Math.max(0, prev.objectiveQuestions - 1);
              }
            }
          }
          return updatedType;
        }
        return type;
      });
      return {
        ...prev,
        problemTypes: updatedTypes
      };
    });
  };

  // Define if this is a high school report based on schoolType or problem types
  const isHighSchool = useMemo(() => {
    // If schoolType is explicitly passed, use it
    if (schoolType) {
      return schoolType === 'high';
    }

    // If we're in edit mode (no schoolType), determine from existing problem types
    const hasHighSchoolCategories = formData.problemTypes.some(p => p.category === "부교재(모의고사)" || p.category === "단어장" || p.category === "교과서" || p.category === "핸드아웃" || p.category === "부교재" || p.category === "모의고사" || p.category === "워크북");
    const hasMiddleSchoolCategories = formData.problemTypes.some(p => p.category === "어휘" || p.category === "문법/어법" || p.category === "대화문" || p.category === "본문" || p.category === "본문 외 지문" || p.category === "서술형" || p.category?.startsWith("기타(직접입력)"));

    // If both or neither, default to middle school
    if (hasHighSchoolCategories && !hasMiddleSchoolCategories) {
      return true;
    }
    return false; // Default to middle school
  }, [schoolType, formData.problemTypes]);

  // Extract unique categories from problemTypes for evaluation
  const selectedCategories = React.useMemo(() => {
    const categories = formData.problemTypes.map(type => type.category).filter(category => category.trim() !== '');

    // Get unique categories only
    return Array.from(new Set(categories));
  }, [formData.problemTypes]);

  // 추가: 적중문항 사진 처리 함수
  const handlePhotoUpload = (photoUrl: string) => {
    setFormData(prev => ({
      ...prev,
      hitQuestionPhotos: [...(prev.hitQuestionPhotos || []), {
        url: photoUrl
      }]
    }));
  };

  // 추가: 적중문항 사진 삭제 함수
  const handlePhotoDelete = (photoIndex: number) => {
    setFormData(prev => {
      const updatedPhotos = [...(prev.hitQuestionPhotos || [])];
      updatedPhotos.splice(photoIndex, 1);
      return {
        ...prev,
        hitQuestionPhotos: updatedPhotos
      };
    });
    toast.success('사진이 삭제되었습니다.');
  };

  // 킬러문항 설명 수정
  const handlePhotoNameChange = (photoIndex: number, name: string) => {
    setFormData(prev => {
      const updatedPhotos = [...(prev.hitQuestionPhotos || [])];
      if (!updatedPhotos[photoIndex]) return prev;
      updatedPhotos[photoIndex] = { ...updatedPhotos[photoIndex], problemName: name };
      return { ...prev, hitQuestionPhotos: updatedPhotos };
    });
  };

  // GPT 텍스트 향상 함수
  const handleGptEnhance = async (field: 'difficultProblemsExplanation' | 'overallEvaluation', currentText: string, targetCategory?: string): Promise<void> => {
    if (!currentText || currentText.trim().length === 0) {
      toast.error('먼저 내용을 입력해주세요.');
      return;
    }

    const loadingKey = field;
    setGptLoading(prev => ({ ...prev, [loadingKey]: true }));

    try {
      const { data, error } = await supabase.functions.invoke('gpt-enhance-text', {
        body: {
          text: currentText,
          type: field === 'difficultProblemsExplanation' || targetCategory === STRATEGY_CATEGORY ? 'exam-characteristics' : 'overall-evaluation'
        }
      });

      if (error) {
        console.error('GPT enhance error:', error);
        toast.error('AI 첨삭 중 오류가 발생했습니다.');
        return;
      }

      if (data && data.enhancedText) {
        if (field === 'difficultProblemsExplanation') {
          // Save current state to history before changing
          saveToHistory('difficultProblemsExplanation', formData.difficultProblemsExplanation);
          setFormData(prev => ({
            ...prev,
            difficultProblemsExplanation: data.enhancedText as string
          }));
        } else {
          // For overall evaluation, save current state to history before changing
          saveToHistory('categoryEvaluations', categoryEvaluations);
          const target = targetCategory || SUMMARY_CATEGORY;
          setCategoryEvaluations(prev => {
            const updated = prev.map(item => ({ ...item })); // Deep copy each item
            const overallEvalIndex = updated.findIndex(item => item.category === target);
            if (overallEvalIndex !== -1) {
              updated[overallEvalIndex] = { category: target, evaluation: data.enhancedText as string };
            } else {
              updated.push({ category: target, evaluation: data.enhancedText as string });
            }
            return updated;
          });
        }

        toast.success('AI 첨삭이 완료되었습니다!');
      }
    } catch (error: unknown) {
      console.error('GPT enhance error:', error);
      toast.error('AI 첨삭 중 오류가 발생했습니다.');
    } finally {
      setGptLoading(prev => ({ ...prev, [loadingKey]: false }));
    }
  };

  // 테마 색상 설정 (DifficultProblemsExplanation, HitQuestionPhotos 컴포넌트에 필요)
  // AI 시험지 분석 결과를 폼 전체에 반영
  const handleAiAnalysis = (analysis: ExamAnalysis) => {
    const problems = [...analysis.problems].sort((a, b) => (a.number || 0) - (b.number || 0));
    const problemTypes: ProblemType[] = problems.map((p, index) => ({
      id: `${Date.now()}-${index}-${p.number}`,
      name: p.name || '',
      category: p.category || '',
      questionType: p.questionType === 'subjective' ? 'subjective' : 'objective',
      difficulty: p.difficulty || 'medium',
      isVariant: Boolean(p.isVariant),
      isKiller: Boolean(p.isKiller),
      points: typeof p.points === 'number' && !Number.isNaN(p.points) ? p.points : undefined,
      answer: p.answer?.trim() || '',
      insight: shouldShowInsight(p) ? p.insight?.trim() || '' : '',
    }));

    const objective = problemTypes.filter((p) => p.questionType === 'objective').length;
    const subjective = problemTypes.length - objective;

    setFormData((prev) => ({
      ...prev,
      school: analysis.school?.trim() || prev.school,
      grade: analysis.grade?.trim() || prev.grade,
      examInfo: analysis.examInfo?.trim() || prev.examInfo,
      examScope: prev.examScope?.trim() || analysis.examScope?.trim() || prev.examScope,
      // 강사가 이미 적어 둔 값은 건드리지 않고, 비어 있을 때만 AI 가 채운다.
      teacher: prev.teacher?.trim() || analysis.teacher?.trim() || prev.teacher,
      difficultProblemsExplanation:
        prev.difficultProblemsExplanation?.trim() ||
        analysis.difficultProblemsExplanation?.trim() ||
        prev.difficultProblemsExplanation,
      overallEvaluation:
        prev.overallEvaluation?.trim() || analysis.overallEvaluation?.trim() || prev.overallEvaluation,
      problemTypes: problemTypes.length > 0 ? problemTypes : prev.problemTypes,
      totalQuestions: problemTypes.length > 0 ? problemTypes.length : prev.totalQuestions,
      objectiveQuestions: problemTypes.length > 0 ? objective : prev.objectiveQuestions,
      subjectiveQuestions: problemTypes.length > 0 ? subjective : prev.subjectiveQuestions,
      examFeatures:
        Array.isArray(analysis.examFeatures) && analysis.examFeatures.length > 0
          ? analysis.examFeatures.map((f) => ({ title: f.title || '', detail: f.detail || '' }))
          : prev.examFeatures,
      killerTop5:
        Array.isArray(analysis.killerTop5) && analysis.killerTop5.length > 0
          ? analysis.killerTop5.slice(0, 5).map((k) => ({
              number: k.number || '',
              title: k.title || '',
              points: typeof k.points === 'number' ? k.points : undefined,
              reason: k.reason || '',
            }))
          : prev.killerTop5,
      passageVariants:
        Array.isArray(analysis.passageVariants) && analysis.passageVariants.length > 0
          ? analysis.passageVariants.map((v) => ({
              number: v.number || '',
              source: v.source || '',
              variantType: v.variantType || '',
              originalText: v.originalText || '',
              examText: v.examText || '',
              changeDetail: v.changeDetail || '',
              impact: v.impact || '',
            }))
          : prev.passageVariants,
    }));

    // 리포트 상세도도 AI 가 정한다(문항 수 · 서답형 · 킬러 비중 기준).
    if (analysis.analysisType === 'detailed' || analysis.analysisType === 'simple') {
      setAnalysisType(analysis.analysisType);
    }


    if (analysis.examInfo && !['1학기 중간고사', '1학기 기말고사', '2학기 중간고사', '2학기 기말고사'].includes(analysis.examInfo)) {
      setShowCustomExamInfo(true);
    }

    if (analysis.grade && !['1학년', '2학년', '3학년'].includes(analysis.grade)) {
      setShowCustomGrade(true);
    }

    const incoming: CategoryEvaluation[] = [
      { category: STRATEGY_CATEGORY, evaluation: analysis.levelStrategy?.trim() || '' },
      { category: SUMMARY_CATEGORY, evaluation: analysis.parentSummary?.trim() || '' },
    ].filter((item) => item.evaluation.length > 0);

    if (incoming.length > 0) {
      saveToHistory('categoryEvaluations', categoryEvaluations);
      setCategoryEvaluations((prev) => {
        const merged = prev.map((item) => ({ ...item }));
        incoming.forEach((item) => {
          const idx = merged.findIndex((m) => m.category === item.category);
          if (idx !== -1) merged[idx].evaluation = item.evaluation;
          else merged.push(item);
        });
        return merged;
      });
    }

    // 무엇이 자동으로 채워졌는지 바로 알려 준다.
    // 예전에는 반영 후 5단계를 직접 훑어야 결과를 알 수 있었다.
    const filled: string[] = [];
    if (problemTypes.length > 0) filled.push(`문항 ${problemTypes.length}개`);
    if (analysis.examFeatures?.length) filled.push(`출제 특징 ${analysis.examFeatures.length}개`);
    if (analysis.killerTop5?.length) filled.push(`킬러 문항 ${Math.min(analysis.killerTop5.length, 5)}개`);
    if (analysis.passageVariants?.length) filled.push(`변형 분석 ${analysis.passageVariants.length}개`);
    if (analysis.teacher?.trim()) filled.push('담당 강사');
    if (analysis.difficultProblemsExplanation?.trim()) filled.push('시험 특징 서술');
    if (analysis.overallEvaluation?.trim()) filled.push('종합 평가');
    if (incoming.length > 0) filled.push('출제 특징 · 학부모 요약');

    toast.success('입력폼에 자동 반영했습니다', {
      description: filled.length > 0 ? filled.join(' · ') : '반영할 항목을 찾지 못했습니다.',
      duration: 7000,
    });
  };

  const themeColors = {
    primary: '#4F46E5',
    vibrant: '#6366F1',
    accent2: '#8B5CF6',
    pastel: '#EEF2FF',
    light: '#C7D2FE'
  };

  // 단계 정의 (중등 간단분석이면 출제특징/킬러 단계 제외)
  const showDetailSteps = isHighSchool || analysisType === 'detailed';
  const STEPS = [
    { key: 'basic', title: '기본 정보', sub: '학교 · 시험 정보', kicker: '01 · BASIC' },
    { key: 'count', title: '문항 수', sub: '총 문항 구성', kicker: '02 · COUNT' },
    { key: 'types', title: '문제 유형', sub: '문항별 분류', kicker: '03 · TYPES' },
    ...(showDetailSteps ? [{ key: 'features', title: '출제 특징 & 킬러 문항', sub: '한눈에 보는 분석', kicker: '04 · INSIGHT' }] : []),
    { key: 'evaluation', title: '종합 평가', sub: '전략 · 코멘트', kicker: '05 · EVALUATION' },
  ];
  const lastStep = STEPS.length - 1;

  const goNext = () => {
    if (step === 0) {
      if (!formData.school.trim()) { toast.error('학교 이름을 입력해주세요.'); return; }
      if (!formData.grade.trim()) { toast.error('학년 정보를 입력해주세요.'); return; }
      if (!formData.examScope.trim()) { toast.error('시험 범위를 입력해주세요.'); return; }
    }
    setDir(1);
    setStep(s => Math.min(lastStep, s + 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  const goPrev = () => {
    setDir(-1);
    setStep(s => Math.max(0, s - 1));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return <div data-theme="blue" className="u-page u-form">
      <form onSubmit={handleSubmit} className="u-shell u-shell--form u-section">
      {/* 상단 바 — 뒤로가기 + 에디터 라벨 */}
      <div className="u-topbar u-rise" style={{ '--i': 0 } as React.CSSProperties}>
        <button type="button" onClick={handleBackClick} className="u-btn u-btn--sm">
          <ArrowLeft aria-hidden="true" />
          <span className="u-btn-kicker">Back</span>
        </button>
        <span className="u-chip u-chip--dim">ORUN ENGLISH · REPORT EDITOR</span>
      </div>

      {/* 마스트헤드 — 입력값이 즉시 제목이 된다 */}
      <div className="u-panel u-masthead u-rise" style={{ '--i': 1 } as React.CSSProperties}>
        <i className="u-corner u-corner--tl" aria-hidden="true" />
        <i className="u-corner u-corner--br" aria-hidden="true" />
        <span className="u-eyebrow u-eyebrow--gold">{id ? 'Edit Report' : 'New Report'}</span>
        <div className="u-masthead-title">
          {schoolLogoUrl && (
            <img src={schoolLogoUrl} alt="학교 로고" className="u-masthead-logo" onError={(e) => { e.currentTarget.hidden = true; }} />
          )}
          <h1>{formLiveTitle}</h1>
        </div>
        <p className="u-masthead-sub">{isHighSchool ? 'High School' : 'Middle School'} · {STEPS[step].kicker}</p>
      </div>

      {/* 단계 진행 표시 */}
      <div className="u-panel u-stepper u-rise" style={{ '--i': 2, marginTop: 18 } as React.CSSProperties}>
        <div className="u-stepper-head">
          <span className="u-eyebrow">Step {step + 1} <i>/ {STEPS.length}</i></span>
          <span className="u-stepper-title">{STEPS[step].title}</span>
        </div>
        <div className="u-progress" role="progressbar" aria-valuemin={1} aria-valuemax={STEPS.length} aria-valuenow={step + 1} aria-label="작성 진행">
          <div className="u-progress-bar" style={{ width: `${((step + 1) / STEPS.length) * 100}%` }} />
        </div>
        <div className="u-steps">
          {STEPS.map((s, i) => {
            const done = i < step;
            const active = i === step;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => { if (i <= step) { setDir(i > step ? 1 : -1); setStep(i); } }}
                className="u-step"
                data-state={active ? 'active' : done ? 'done' : 'todo'}
                aria-current={active ? 'step' : undefined}
                tabIndex={i > step ? -1 : 0}
              >
                <span className="u-step-num">{done ? '✓' : i + 1}</span>
                <span className="u-step-label">{s.title}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="u-rise" style={{ '--i': 3 } as React.CSSProperties}>
        {/* STEP 1 · 기본 정보 + AI 자동 분석 */}
        <div key={step === 0 ? `active-0-${step}-${dir}` : 'idle-0'} className={`${step === 0 ? (dir >= 0 ? 'wizard-step-next' : 'wizard-step-prev') : 'hidden'} u-panel u-step-panel`}>
        {/* 기본 정보 카드 */}
        <div className="u-card">
          <div className="u-card-head">
            <div className="u-card-head-row">
              <span className="u-numeral">00</span>
              <div>
                <span className="u-eyebrow u-eyebrow--gold">Basic Information</span>
                <h2 className="u-card-title">기본 정보</h2>
              </div>
            </div>
            <p className="u-card-desc">학교, 학년, 시험 정보와 시험 범위를 먼저 입력해 주세요.</p>
          </div>

          <div className="u-card-body space-y-4">
            {/* 학교 / 학년 / 시험 — 3열 */}
            <div className="u-field-grid u-field-grid--3">
              <div>
                <Label htmlFor="school" className="u-label">학교</Label>
                <Input id="school" name="school" value={formData.school} onChange={handleInputChange} placeholder="예: 숭의여자중학교" className="u-input" required />
              </div>
              <div>
                <Label htmlFor="grade" className="u-label">학년/반</Label>
                <Select value={showCustomGrade ? '직접 입력' : formData.grade || ''} onValueChange={handleGradeChange}>
                  <SelectTrigger id="grade" className="u-input u-select">
                    <SelectValue placeholder="학년 선택" />
                  </SelectTrigger>
                  <SelectContent className="u-pop">
                    <SelectItem value="1학년">1학년</SelectItem>
                    <SelectItem value="2학년">2학년</SelectItem>
                    <SelectItem value="3학년">3학년</SelectItem>
                    <SelectItem value="직접 입력">직접 입력</SelectItem>
                  </SelectContent>
                </Select>
                {showCustomGrade && <Input id="customGrade" name="grade" value={formData.grade} onChange={handleInputChange} placeholder="학년/반 직접 입력" className="u-input mt-2" />}
              </div>
              <div>
                <Label htmlFor="examInfo" className="u-label">시험 정보</Label>
                <Select value={showCustomExamInfo ? '직접 입력' : formData.examInfo || ''} onValueChange={handleExamInfoChange}>
                  <SelectTrigger id="examInfo" className="u-input u-select">
                    <SelectValue placeholder="시험 종류 선택" />
                  </SelectTrigger>
                  <SelectContent className="u-pop">
                    <SelectItem value="1학기 중간고사">1학기 중간고사</SelectItem>
                    <SelectItem value="1학기 기말고사">1학기 기말고사</SelectItem>
                    <SelectItem value="2학기 중간고사">2학기 중간고사</SelectItem>
                    <SelectItem value="2학기 기말고사">2학기 기말고사</SelectItem>
                    <SelectItem value="직접 입력">직접 입력</SelectItem>
                  </SelectContent>
                </Select>
                {showCustomExamInfo && <Input id="customExamInfo" name="examInfo" value={formData.examInfo} onChange={handleInputChange} placeholder="시험 정보 직접 입력" className="u-input mt-2" />}
              </div>
            </div>

            {/* 시험 범위 */}
            <div>
              <Label htmlFor="examScope" className="u-label">시험 범위</Label>
              <Input id="examScope" name="examScope" value={formData.examScope} onChange={handleInputChange} placeholder="예: 교과서: 동아(이) 2,3과, 부교재: 리딩파워 30지문" className="u-input" required />
            </div>

            <div>
              <Label htmlFor="examDate" className="u-label">실제 시험일</Label>
              <Input id="examDate" name="examDate" type="date" value={formData.examDate || ''} onChange={handleInputChange} className="u-input" />
              <p className="u-hint">학생 포털의 최근 시험 순서는 이 날짜를 기준으로 합니다.</p>
            </div>

            {/* 원문 */}
            <OriginalPassageInput
              value={formData.originalPassages || ''}
              onChange={(value) => setFormData((prev) => ({ ...prev, originalPassages: value }))}
            />
          </div>
        </div>

        {/* 강사 정보 카드 */}
        <div className="u-card u-card--blue">
          <div className="u-card-head">
            <div className="u-card-head-row">
              <span className="u-numeral"><Camera className="w-3.5 h-3.5" aria-hidden="true" /></span>
              <div>
                <span className="u-eyebrow">Teacher</span>
                <h3 className="u-card-title">강사 정보</h3>
              </div>
            </div>
          </div>
          <div className="u-card-body">
            <div className="u-field-grid u-field-grid--2">
              <div>
                <Label htmlFor="teacher" className="u-label">강사 이름</Label>
                <Input id="teacher" name="teacher" value={formData.teacher} onChange={handleInputChange} placeholder="예: Jennie" className="u-input" />
              </div>
              <div>
                <Label className="u-label">강사 사진</Label>
                <div className="u-dropzone">
                  {!formData.teacherPhoto ? (
                    <div className="flex items-center justify-between gap-3">
                      <span className="u-icon-tile" aria-hidden="true">
                        <Camera />
                      </span>
                      <div className="flex items-center gap-2 shrink-0 flex-wrap justify-end">
                        <TeacherPhotoUploader onPhotoUpload={url => {
                          setFormData(prev => ({ ...prev, teacherPhoto: url }));
                        }} bucketName="teacher-photos" />
                        {teacherPhotos.length > 0 && <TeacherPhotoDialog teacherPhotos={teacherPhotos} onPhotoSelect={url => {
                          setFormData(prev => ({ ...prev, teacherPhoto: url }));
                        }} school={formData.school} grade={formData.grade} />}
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <div className="u-photo-frame">
                          <img src={formData.teacherPhoto} alt="강사 사진" className="w-20 h-20 object-contain" />
                        </div>
                        <Button type="button" variant="destructive" size="icon" className="absolute -top-2 -right-2 rounded-full shadow-md h-6 w-6" onClick={() => setFormData(prev => ({ ...prev, teacherPhoto: '' }))} aria-label="강사 사진 제거">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex flex-col gap-2">
                        <TeacherPhotoUploader onPhotoUpload={url => {
                          setFormData(prev => ({ ...prev, teacherPhoto: url }));
                        }} bucketName="teacher-photos" buttonText="다른 사진 업로드" />
                        {teacherPhotos.length > 0 && <TeacherPhotoDialog teacherPhotos={teacherPhotos} onPhotoSelect={url => {
                          setFormData(prev => ({ ...prev, teacherPhoto: url }));
                        }} school={formData.school} grade={formData.grade} />}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="u-form-block">
          <SectionHeading
            kicker="01 · AI"
            title="시험지 자동 분석"
            description="위에 입력한 시험 범위를 기준으로, AI가 시험지 PDF의 문항별 범위·배점·난도·정답·출제 방향성을 자동으로 채워 줍니다."
          />
          <ExamPdfAnalyzer
            schoolType={isHighSchool ? 'high' : 'middle'}
            examScope={formData.examScope}
            originalPassages={formData.originalPassages}
            onApply={handleAiAnalysis}
          />
        </div>

        </div>
        {/* // STEP 1 · 기본 정보 끝 */}

        {/* STEP 2 · 문항 수 */}
        <div key={step === 1 ? `active-1-${step}-${dir}` : 'idle-1'} className={`${step === 1 ? (dir >= 0 ? 'wizard-step-next' : 'wizard-step-prev') : 'hidden'} u-panel u-step-panel`}>
        <SectionHeading kicker="02 · COUNT" title="문항 수" description="총 문항·객관식·서답형 수를 입력합니다." />
        <div className="u-field-grid u-field-grid--3">
          <div>
            <Label htmlFor="totalQuestions" className="u-label">총 문항수</Label>
            <Input id="totalQuestions" type="number" min="0" value={formData.totalQuestions} onChange={e => handleQuestionCountChange('totalQuestions', e.target.value)} className="u-input" required />
          </div>
          <div>
            <Label htmlFor="objectiveQuestions" className="u-label">객관식</Label>
            <Input id="objectiveQuestions" type="number" min="0" value={formData.objectiveQuestions} onChange={e => handleQuestionCountChange('objectiveQuestions', e.target.value)} className="u-input" />
          </div>
          <div>
            <Label htmlFor="subjectiveQuestions" className="u-label">서답형</Label>
            <Input id="subjectiveQuestions" type="number" min="0" value={formData.subjectiveQuestions} onChange={e => handleQuestionCountChange('subjectiveQuestions', e.target.value)} className="u-input" />
          </div>
        </div>
        </div>
        {/* // STEP 2 · 문항 수 끝 */}

        {/* STEP 3 · 문제 유형 */}
        <div key={step === 2 ? `active-2-${step}-${dir}` : 'idle-2'} className={`${step === 2 ? (dir >= 0 ? 'wizard-step-next' : 'wizard-step-prev') : 'hidden'} u-panel u-step-panel`}>
        <SectionHeading kicker="03 · TYPES" title="문제 유형" description="각 문항의 분류·세부유형·난이도를 지정합니다." />

        {/* 중등 리포트일 때만 분석 유형 선택 옵션 표시 */}
        {!isHighSchool && (
          <div className="u-card mb-8">
            <div className="u-card-head">
              <div className="u-card-head-row">
                <span className="u-numeral">AM</span>
                <div>
                  <span className="u-eyebrow u-eyebrow--gold">Analysis Mode</span>
                  <h3 className="u-card-title">분석 유형</h3>
                </div>
              </div>
              <p className="u-card-desc">상세분석은 문항별 정밀 분석을, 간단분석은 핵심만 빠르게 정리합니다.</p>
            </div>
            <div className="u-card-body">
              <div className="u-mode" role="radiogroup" aria-label="분석 유형">
                {[
                  { val: 'detailed', label: '상세 분석', sub: 'Detailed' },
                  { val: 'simple', label: '간단 분석', sub: 'Simple' },
                ].map((opt) => {
                  const active = analysisType === (opt.val as 'detailed' | 'simple');
                  return (
                    <label key={opt.val} htmlFor={opt.val} className="u-mode-opt" data-active={active}>
                      <input
                        type="radio"
                        id={opt.val}
                        name="analysisType"
                        value={opt.val}
                        checked={active}
                        onChange={(e) => setAnalysisType(e.target.value as 'detailed' | 'simple')}
                        className="sr-only"
                      />
                      <span className={`u-eyebrow ${active ? 'u-eyebrow--gold' : ''}`}>{opt.sub}</span>
                      <strong>{opt.label}</strong>
                      {active && <span aria-hidden className="u-mode-dot" />}
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {!isHighSchool ? <MiddleSchoolProblemTypes problemTypes={formData.problemTypes} onAddProblemType={handleAddProblemType} onAddMultiple={handleAddMultiple} onRemoveType={handleRemoveType} onRemoveAll={handleRemoveAllTypes} onUpdateType={handleUpdateType} addCount={addCount} onAddCountChange={setAddCount} isSimpleMode={analysisType === 'simple'} /> : <HighSchoolProblemTypes problemTypes={formData.problemTypes} onAddProblemType={handleAddProblemType} onAddMultiple={handleAddMultiple} onRemoveType={handleRemoveType} onRemoveAll={handleRemoveAllTypes} onUpdateType={handleUpdateType} addCount={addCount} onAddCountChange={setAddCount} />}
        </div>
        {/* // STEP 3 · 문제 유형 끝 */}

        {/* STEP 4 · 출제 특징 & 킬러 문항 (상세 분석 모드에서만) */}
        {showDetailSteps && (
        <div key={step === 3 ? `active-3-${step}-${dir}` : 'idle-3'} className={`${step === 3 ? (dir >= 0 ? 'wizard-step-next' : 'wizard-step-prev') : 'hidden'} u-panel u-step-panel`}>
        {/* 한눈에 보는 출제 특징 - 고등부는 항상 표시, 중등부는 상세분석에서만 표시 */}
        {(isHighSchool || (!isHighSchool && analysisType === 'detailed')) && <>
            <SectionHeading kicker="04 · OVERVIEW" title="한눈에 보는 출제 특징" description="이번 시험의 출제 특징을 항목별로 정리합니다. PDF 자동 분석으로 채울 수 있습니다." />
            <div className="u-card u-card--pad">
              <ExamFeaturesEditor
                features={formData.examFeatures || []}
                onChange={(features) => setFormData(prev => ({ ...prev, examFeatures: features }))}
              />
            </div>
          </>}

        {/* 등급을 가른 문항 TOP 5 - 고등부는 항상 표시, 중등부는 상세분석에서만 표시 */}
        {(isHighSchool || (!isHighSchool && analysisType === 'detailed')) && <>
            <SectionHeading kicker="05 · KILLER" title="등급을 가른 문항 TOP 5" description="예상 오답률이 높은 순으로 문항 번호와 이유를 정리합니다." />
            <div className="u-card u-card--pad u-card--violet">
              <KillerTop5Editor
                items={formData.killerTop5 || []}
                onChange={(items) => setFormData(prev => ({ ...prev, killerTop5: items }))}
              />
            </div>
          </>}

        {/* 원문 대조 · 지문 변형 분석 */}
        <SectionHeading
          kicker="06 · VARIANTS"
          title="원문 대조 · 지문 변형 분석"
          description="기본 정보 단계에서 입력한 원문과 실제 출제 문장을 대조한 결과입니다. 자유롭게 수정·추가할 수 있습니다."
        />
        <div className="u-card u-card--pad u-card--blue">
          <PassageVariantEditor
            items={formData.passageVariants || []}
            onChange={(items) => setFormData(prev => ({ ...prev, passageVariants: items }))}
          />
        </div>

        </div>
        )}
        {/* // STEP 4 · 출제 특징 & 킬러 문항 끝 */}

        {/* STEP 5 · 종합 평가 */}
        <div key={step === lastStep ? `active-last-${step}-${dir}` : 'idle-last'} className={`${step === lastStep ? (dir >= 0 ? 'wizard-step-next' : 'wizard-step-prev') : 'hidden'} u-panel u-step-panel`}>
        <SectionHeading kicker="06 · EVALUATION" title="종합 평가" description="출제 특징과 학부모님께 전하는 종합의견을 나누어 작성합니다." />
        <div className="space-y-6">
          <OverallEvaluation
            evaluations={categoryEvaluations}
            onEvaluationChange={handleEvaluationChange}
            selectedCategories={selectedCategories.length > 0 ? selectedCategories : undefined}
            isHighSchool={isHighSchool}
            gptLoading={gptLoading.overallEvaluation}
            onGptEnhance={(category) => {
              const target = category || SUMMARY_CATEGORY;
              const found = categoryEvaluations.find(e => e.category === target)
                || (target === SUMMARY_CATEGORY ? categoryEvaluations.find(e => e.category === '종합 평가') : undefined);
              const currentText = found?.evaluation || '';
              if (!currentText || currentText.trim().length === 0) {
                toast.error('먼저 내용을 입력해주세요.');
                return;
              }
              handleGptEnhance('overallEvaluation', currentText, target);
            }}
          />
          <p className="u-hint">※ 두 항목 모두 작성하시면 리포트에 순서대로 표시됩니다.</p>

        </div>
        </div>
        {/* // STEP 5 · 종합 평가 끝 */}
      </div>

      {/* 하단 네비게이션 — 단계별 이전/다음/저장 */}
      <div className="u-formnav u-rise" style={{ '--i': 4 } as React.CSSProperties}>
        <span className="u-eyebrow">© ORUN ENGLISH</span>
        <div className="u-formnav-actions">
          {step === 0 ? (
            <button key="cancel" type="button" onClick={() => navigate('/saved-reports')} disabled={loading} className="u-btn">
              취소
            </button>
          ) : (
            <button key="prev" type="button" onClick={goPrev} disabled={loading} className="u-btn">
              <ArrowLeft aria-hidden="true" />
              이전
            </button>
          )}
          {/* key 를 달리 해 '다음'과 '저장'이 같은 DOM 노드를 공유하지 않게 한다.
              같은 노드를 재사용하면 마지막 '다음' 클릭의 기본 동작이 type=submit 로 바뀐
              뒤에 실행되어 폼이 그대로 제출된다. */}
          {step < lastStep ? (
            <button key="next" type="button" onClick={goNext} className="u-btn u-btn--gold">
              다음
              <span className="u-btn-kicker" aria-hidden="true">Next</span>
            </button>
          ) : (
            <button key="save" type="submit" disabled={loading} className="u-btn u-btn--gold">
              <Sparkles aria-hidden="true" />
              {loading ? '저장 중…' : '리포트 저장'}
            </button>
          )}
        </div>
      </div>
    </form>
    </div>;
};
export default ReportForm;
