import { supabase } from '@/integrations/supabase/client';
import { GrammarCategory } from './veritasAnalyzer';
import { VeritasPair } from '../prompts/grammar';

export interface CategorizedVeritasPair {
  correct_form: string;
  incorrect_form: string;
  category: string;
  explanation?: string;
  usage_count: number;
}

/**
 * Veritas 데이터 관리자
 * 데이터베이스에서 분석된 어법 대립쌍을 관리합니다.
 */
export class VeritasDataManager {
  private cache: CategorizedVeritasPair[] | null = null;
  
  /**
   * 데이터베이스에서 분석 데이터 로드
   */
  private async loadFromDatabase(): Promise<CategorizedVeritasPair[] | null> {
    try {
      const { data, error } = await supabase
        .from('categorized_veritas_pairs')
        .select('*')
        .order('usage_count', { ascending: false });
      
      if (error) {
        console.error('Error loading from database:', error);
        return null;
      }
      
      if (!data || data.length === 0) {
        console.log('📊 No data in database yet.');
        return null;
      }
      
      console.log(`✅ Loaded ${data.length} categorized pairs from database`);
      return data;
    } catch (error) {
      console.error('Error loading from database:', error);
      return null;
    }
  }
  
  /**
   * 분석 시작 트리거 (Edge Function 호출)
   */
  async triggerAnalysis(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🔄 Triggering Veritas data analysis...');
      
      const { data, error } = await supabase.functions.invoke('analyze-veritas-data');
      
      if (error) {
        console.error('Error triggering analysis:', error);
        return { 
          success: false, 
          message: '분석을 시작하는 중 오류가 발생했습니다.' 
        };
      }
      
      console.log('✅ Analysis triggered:', data);
      return { 
        success: true, 
        message: data.message || '분석이 시작되었습니다. 5-10분 정도 소요됩니다.' 
      };
    } catch (error) {
      console.error('Failed to trigger analysis:', error);
      return { 
        success: false, 
        message: error instanceof Error ? error.message : '알 수 없는 오류가 발생했습니다.' 
      };
    }
  }
  
  /**
   * 카테고리화된 대립쌍 가져오기
   */
  async getCategorizedPairs(): Promise<CategorizedVeritasPair[]> {
    // 메모리 캐시 확인
    if (this.cache) {
      console.log('✅ Using in-memory cache');
      return this.cache;
    }
    
    // 데이터베이스에서 로드
    const dbPairs = await this.loadFromDatabase();
    if (dbPairs && dbPairs.length > 0) {
      this.cache = dbPairs;
      return dbPairs;
    }
    
    // 데이터가 없으면 빈 배열 반환
    console.log('⚠️ No data available. Please run analysis first.');
    return [];
  }
  
  /**
   * 특정 카테고리의 대립쌍 가져오기
   */
  async getPairsByCategory(
    category: string,
    count: number = 5
  ): Promise<CategorizedVeritasPair[]> {
    const allPairs = await this.getCategorizedPairs();
    
    if (allPairs.length === 0) {
      return [];
    }
    
    const categoryPairs = allPairs.filter(pair => pair.category === category);
    
    // usage_count 기준으로 정렬하여 상위 개수만큼 반환
    return categoryPairs
      .sort((a, b) => b.usage_count - a.usage_count)
      .slice(0, count);
  }
  
  /**
   * 다양한 카테고리에서 대립쌍 선택
   */
  async selectDiversePairs(count: number = 10): Promise<VeritasPair[]> {
    const allPairs = await this.getCategorizedPairs();
    
    if (allPairs.length === 0) {
      return [];
    }
    
    // 카테고리별로 그룹화
    const byCategory = allPairs.reduce((acc, pair) => {
      if (!acc[pair.category]) {
        acc[pair.category] = [];
      }
      acc[pair.category].push(pair);
      return acc;
    }, {} as Record<string, CategorizedVeritasPair[]>);
    
    // 각 카테고리에서 골고루 선택
    const selected: VeritasPair[] = [];
    const categories = Object.keys(byCategory);
    let categoryIndex = 0;
    
    while (selected.length < count && categories.length > 0) {
      const category = categories[categoryIndex];
      const pairs = byCategory[category];
      
      if (pairs && pairs.length > 0) {
        // usage_count가 높은 것 우선
        pairs.sort((a, b) => b.usage_count - a.usage_count);
        const pair = pairs.shift()!;
        
        selected.push({
          correct: pair.correct_form,
          incorrect: pair.incorrect_form,
          category: pair.category as GrammarCategory,
          explanation: pair.explanation
        });
      }
      
      // 다음 카테고리로
      categoryIndex = (categoryIndex + 1) % categories.length;
      
      // 빈 카테고리 제거
      if (byCategory[category].length === 0) {
        categories.splice(categories.indexOf(category), 1);
      }
    }
    
    return selected;
  }
  
  /**
   * 데이터베이스 상태 확인
   */
  async getDataStatus(): Promise<{ exists: boolean; count: number }> {
    try {
      const { count, error } = await supabase
        .from('categorized_veritas_pairs')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error checking data status:', error);
        return { exists: false, count: 0 };
      }
      
      return {
        exists: (count || 0) > 0,
        count: count || 0
      };
    } catch (error) {
      console.error('Error checking data status:', error);
      return { exists: false, count: 0 };
    }
  }
  
  /**
   * 캐시 초기화
   */
  clearCache(): void {
    this.cache = null;
    console.log('🗑️ Memory cache cleared');
  }
}

// 싱글톤 인스턴스
export const veritasDataManager = new VeritasDataManager();
