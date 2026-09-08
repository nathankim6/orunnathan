import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import type { QuestionTypeConfig, AnalysisResult } from '@/components/mock-exam/MockExamGenerator';

export interface SavedExam {
  id: string;
  title: string;
  description?: string;
  question_configs: QuestionTypeConfig[];
  analysis_result?: AnalysisResult;
  generated_questions?: any;
  created_at: string;
  updated_at: string;
}

export const useSavedExams = () => {
  const [savedExams, setSavedExams] = useState<SavedExam[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchSavedExams = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      let allExams: SavedExam[] = [];

      // Load from localStorage first
      const localExams = localStorage.getItem('savedMockExams');
      if (localExams) {
        try {
          const parsedLocalExams = JSON.parse(localExams);
          allExams = [...parsedLocalExams];
        } catch (e) {
          console.error('Error parsing local exams:', e);
        }
      }

      // If user is authenticated, also load from Supabase
      if (user) {
        const { data, error } = await supabase
          .from('saved_mock_exams')
          .select('*')
          .order('updated_at', { ascending: false });

        if (!error && data) {
          const typedData: SavedExam[] = data.map(exam => ({
            ...exam,
            question_configs: exam.question_configs as unknown as QuestionTypeConfig[],
            analysis_result: exam.analysis_result as unknown as AnalysisResult | undefined,
          }));
          
          // Merge with local exams, avoiding duplicates
          const existingIds = new Set(allExams.map(exam => exam.id));
          const newSupabaseExams = typedData.filter(exam => !existingIds.has(exam.id));
          allExams = [...allExams, ...newSupabaseExams];
        }
      }
      
      // Sort by updated_at descending
      allExams.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
      setSavedExams(allExams);
    } catch (error) {
      console.error('Error fetching saved exams:', error);
      toast({
        title: "불러오기 실패",
        description: "저장된 시험을 불러오는데 실패했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveExam = async (
    title: string,
    description: string,
    questionConfigs: QuestionTypeConfig[],
    analysisResult?: AnalysisResult,
    generatedQuestions?: any
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const now = new Date().toISOString();
      const examId = `exam_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const newExam: SavedExam = {
        id: examId,
        title,
        description: description || undefined,
        question_configs: questionConfigs,
        analysis_result: analysisResult,
        generated_questions: generatedQuestions,
        created_at: now,
        updated_at: now,
      };

      // Always save to localStorage first
      const existingLocalExams = localStorage.getItem('savedMockExams');
      let localExams: SavedExam[] = [];
      if (existingLocalExams) {
        try {
          localExams = JSON.parse(existingLocalExams);
        } catch (e) {
          console.error('Error parsing existing local exams:', e);
        }
      }
      localExams.unshift(newExam);
      localStorage.setItem('savedMockExams', JSON.stringify(localExams));

      // If user is authenticated, also save to Supabase
      if (user) {
        try {
          const { error } = await supabase
            .from('saved_mock_exams')
            .insert([{
              id: examId,
              user_id: user.id,
              title,
              description: description || null,
              question_configs: questionConfigs as any,
              analysis_result: analysisResult as any || null,
              generated_questions: generatedQuestions || null,
            }]);

          if (error) {
            console.error('Supabase save error:', error);
            // Continue anyway since local save succeeded
          }
        } catch (supabaseError) {
          console.error('Supabase save failed:', supabaseError);
          // Continue anyway since local save succeeded
        }
      }

      toast({
        title: "저장 완료",
        description: "시험이 성공적으로 저장되었습니다.",
      });

      fetchSavedExams();
      return true;
    } catch (error) {
      console.error('Error saving exam:', error);
      toast({
        title: "저장 실패",
        description: "시험 저장에 실패했습니다.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteExam = async (id: string) => {
    try {
      // First try to delete from localStorage
      const existingLocalExams = localStorage.getItem('savedMockExams');
      if (existingLocalExams) {
        try {
          const localExams: SavedExam[] = JSON.parse(existingLocalExams);
          const filteredExams = localExams.filter(exam => exam.id !== id);
          localStorage.setItem('savedMockExams', JSON.stringify(filteredExams));
        } catch (e) {
          console.error('Error updating localStorage:', e);
        }
      }

      // Then try to delete from Supabase (if user is authenticated and if it's a UUID)
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        // Check if the ID looks like a UUID (standard UUID format)
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
        
        if (isUUID) {
          const { error } = await supabase
            .from('saved_mock_exams')
            .delete()
            .eq('id', id);

          if (error) {
            console.error('Supabase delete error:', error);
            // Don't throw error if localStorage deletion succeeded
          }
        }
      }

      toast({
        title: "삭제 완료",
        description: "시험이 삭제되었습니다.",
      });

      fetchSavedExams();
      return true;
    } catch (error) {
      console.error('Error deleting exam:', error);
      toast({
        title: "삭제 실패",
        description: "시험 삭제에 실패했습니다.",
        variant: "destructive",
      });
      return false;
    }
  };

  const updateExam = async (
    id: string,
    updates: Partial<Omit<SavedExam, 'id' | 'created_at' | 'updated_at'>>
  ) => {
    try {
      const { error } = await supabase
        .from('saved_mock_exams')
        .update(updates as any)
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "업데이트 완료",
        description: "시험이 업데이트되었습니다.",
      });

      fetchSavedExams();
      return true;
    } catch (error) {
      console.error('Error updating exam:', error);
      toast({
        title: "업데이트 실패",
        description: "시험 업데이트에 실패했습니다.",
        variant: "destructive",
      });
      return false;
    }
  };

  useEffect(() => {
    fetchSavedExams();
  }, []);

  return {
    savedExams,
    loading,
    saveExam,
    deleteExam,
    updateExam,
    fetchSavedExams,
  };
};
