import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface StoredQuestions {
  id: string;
  access_code: string;
  title: string;
  questions: any[];
  created_at: string;
  updated_at: string;
}

export const useQuestionsStorage = () => {
  const [storedQuestions, setStoredQuestions] = useState<StoredQuestions[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const fetchStoredQuestions = async () => {
    setLoading(true);
    try {
      const accessCode = localStorage.getItem("accessCode") || "";
      
      // Calculate the cutoff date (3 days ago)
      const threeDaysAgo = new Date();
      threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
      
      const { data, error } = await supabase
        .from("generated_questions_storage")
        .select("*")
        .eq("access_code", accessCode)
        .gte("created_at", threeDaysAgo.toISOString())
        .order("created_at", { ascending: false });

      if (error) throw error;
      
      setStoredQuestions((data || []).map(item => ({
        ...item,
        questions: item.questions as any[]
      })));
    } catch (error) {
      console.error("Error fetching stored questions:", error);
      toast({
        title: "불러오기 실패",
        description: "저장된 문제를 불러오는 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const saveQuestions = async (title: string, questions: any[]) => {
    try {
      const accessCode = localStorage.getItem("accessCode") || "";
      
      const { error } = await supabase
        .from("generated_questions_storage")
        .insert([
          {
            access_code: accessCode,
            title,
            questions,
          },
        ]);

      if (error) throw error;

      toast({
        title: "저장 완료",
        description: "문제가 성공적으로 저장되었습니다.",
      });

      await fetchStoredQuestions();
      return true;
    } catch (error) {
      console.error("Error saving questions:", error);
      toast({
        title: "저장 실패",
        description: "문제 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
      return false;
    }
  };

  const deleteQuestions = async (id: string) => {
    try {
      const { error } = await supabase
        .from("generated_questions_storage")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "삭제 완료",
        description: "문제가 삭제되었습니다.",
      });

      await fetchStoredQuestions();
    } catch (error) {
      console.error("Error deleting questions:", error);
      toast({
        title: "삭제 실패",
        description: "문제 삭제 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchStoredQuestions();
  }, []);

  return {
    storedQuestions,
    loading,
    saveQuestions,
    deleteQuestions,
    fetchStoredQuestions,
  };
};
