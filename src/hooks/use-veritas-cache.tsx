import { useState, useEffect } from 'react';
import { veritasDataManager, CategorizedVeritasPair } from '@/lib/grammar/veritasDataManager';
import { VeritasPair } from '@/lib/prompts/grammar';
import { GrammarCategory } from '@/lib/grammar/veritasAnalyzer';

/**
 * Hook to pre-load and cache Veritas grammar pairs
 * Loads data once on mount and keeps it in memory for fast access
 */
export const useVeritasCache = () => {
  const [veritasPairs, setVeritasPairs] = useState<CategorizedVeritasPair[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadVeritasData = async () => {
      try {
        console.log('🔄 Pre-loading Veritas data...');
        const pairs = await veritasDataManager.getCategorizedPairs();
        
        if (pairs.length === 0) {
          console.warn('⚠️ No Veritas data found. Please run the analysis first.');
          setError('No Veritas data available');
        } else {
          console.log(`✅ Loaded ${pairs.length} Veritas pairs into cache`);
          setVeritasPairs(pairs);
        }
      } catch (err) {
        console.error('Error loading Veritas data:', err);
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    loadVeritasData();
  }, []);

  /**
   * Get diverse pairs from the cached data (much faster than DB query)
   */
  const selectDiversePairs = (count: number = 5): VeritasPair[] => {
    if (veritasPairs.length === 0) {
      console.warn('No Veritas pairs available in cache');
      return [];
    }

    // Group by category
    const byCategory = veritasPairs.reduce((acc, pair) => {
      if (!acc[pair.category]) {
        acc[pair.category] = [];
      }
      acc[pair.category].push(pair);
      return acc;
    }, {} as Record<string, CategorizedVeritasPair[]>);

    // Select pairs from different categories
    const selected: VeritasPair[] = [];
    const categories = Object.keys(byCategory);
    let categoryIndex = 0;

    while (selected.length < count && categories.length > 0) {
      const category = categories[categoryIndex];
      const pairs = byCategory[category];

      if (pairs && pairs.length > 0) {
        // Sort by usage_count and take the top one
        pairs.sort((a, b) => b.usage_count - a.usage_count);
        const pair = pairs.shift()!;

        selected.push({
          correct: pair.correct_form,
          incorrect: pair.incorrect_form,
          category: pair.category as GrammarCategory,
          explanation: pair.explanation
        });
      }

      categoryIndex = (categoryIndex + 1) % categories.length;

      // Remove empty categories
      if (byCategory[category].length === 0) {
        categories.splice(categories.indexOf(category), 1);
      }
    }

    return selected;
  };

  return {
    veritasPairs,
    isLoading,
    error,
    selectDiversePairs,
    hasData: veritasPairs.length > 0
  };
};
