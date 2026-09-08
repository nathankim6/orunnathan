import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.47.10';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// 17개 어법 카테고리
const GRAMMAR_CATEGORIES = [
  'verb_form', 'verb_tense', 'subject_verb_agreement', 
  'relative_pronoun', 'to_infinitive_vs_gerund',
  'parallel_structure', 'modifier_position', 'comparative_superlative',
  'conjunction', 'preposition', 'article',
  'pronoun', 'passive_voice', 'countable_uncountable',
  'conditional', 'word_order', 'other'
];

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const veritasUrl = Deno.env.get('VERITAS_SUPABASE_URL');
    const veritasKey = Deno.env.get('VERITAS_SUPABASE_ANON_KEY');
    const openaiKey = Deno.env.get('OPENAI_API_KEY');
    const claudeKey = Deno.env.get('CLAUDE_API_KEY');

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase credentials not configured');
    }

    if (!veritasUrl || !veritasKey) {
      throw new Error('Veritas database credentials not configured');
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const veritasSupabase = createClient(veritasUrl, veritasKey);

    // 이미 분석된 데이터가 있는지 확인
    const { data: existingData, error: checkError } = await supabase
      .from('categorized_veritas_pairs')
      .select('id')
      .limit(1);

    if (checkError) {
      console.error('Error checking existing data:', checkError);
    }

    if (existingData && existingData.length > 0) {
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Data already analyzed',
          count: existingData.length 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Veritas DB에서 상위 100개 데이터 가져오기 (타임아웃 방지)
    console.log('Fetching top 100 pairs from Veritas database...');
    const { data: veritasData, error: veritasError } = await veritasSupabase
      .from('incorrect_options')
      .select('correct_text, incorrect_text, explanation, usage_count')
      .order('usage_count', { ascending: false })
      .limit(100);

    if (veritasError) {
      throw new Error(`Failed to fetch Veritas data: ${veritasError.message}`);
    }

    if (!veritasData || veritasData.length === 0) {
      throw new Error('No data found in Veritas database');
    }

    console.log(`Fetched ${veritasData.length} pairs. Starting analysis...`);

    // AI를 사용하여 배치로 분석 (더 큰 배치 크기로 API 호출 최소화)
    const batchSize = 30;
    const categorizedPairs = [];

    for (let i = 0; i < veritasData.length; i += batchSize) {
      const batch = veritasData.slice(i, i + batchSize);
      console.log(`Analyzing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(veritasData.length / batchSize)}...`);

      const prompt = `Analyze these English grammar correction pairs and categorize each one. Return ONLY a JSON array with no markdown formatting.

Categories: ${GRAMMAR_CATEGORIES.join(', ')}

Pairs to analyze:
${batch.map((pair, idx) => `${idx + 1}. Correct: "${pair.correct_text}" | Incorrect: "${pair.incorrect_text}"`).join('\n')}

Return format (pure JSON array, no markdown):
[
  {
    "index": 0,
    "category": "verb_form",
    "explanation": "Brief explanation"
  }
]`;

      try {
        let response;
        let categorizations;

        // Claude 우선 시도
        if (claudeKey) {
          response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
              'x-api-key': claudeKey,
              'anthropic-version': '2023-06-01',
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'claude-sonnet-4-5-20250929',
              max_tokens: 4000,
              messages: [{ role: 'user', content: prompt }]
            })
          });

          if (!response.ok) {
            throw new Error(`Claude API error: ${response.status}`);
          }

          const data = await response.json();
          const content = data.content[0].text;
          // Remove markdown code blocks if present
          const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
          categorizations = JSON.parse(cleanContent);
        } else if (openaiKey) {
          // OpenAI 대체
          response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${openaiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-5-mini-2025-08-07',
              max_completion_tokens: 4000,
              messages: [
                { role: 'system', content: 'You are a grammar analysis expert. Return only valid JSON arrays.' },
                { role: 'user', content: prompt }
              ]
            })
          });

          if (!response.ok) {
            throw new Error(`OpenAI API error: ${response.status}`);
          }

          const data = await response.json();
          const content = data.choices[0].message.content;
          const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
          categorizations = JSON.parse(cleanContent);
        } else {
          throw new Error('No AI API key configured (need CLAUDE_API_KEY or OPENAI_API_KEY)');
        }

        // 결과를 배열에 추가
        for (const cat of categorizations) {
          const pair = batch[cat.index];
          if (pair) {
            categorizedPairs.push({
              correct_form: pair.correct_text,
              incorrect_form: pair.incorrect_text,
              category: cat.category,
              explanation: cat.explanation || pair.explanation,
              usage_count: pair.usage_count || 1
            });
          }
        }

        // API 속도 제한 방지를 위한 짧은 지연
        await new Promise(resolve => setTimeout(resolve, 500));

      } catch (error) {
        console.error(`Error analyzing batch ${Math.floor(i / batchSize) + 1}:`, error);
        // 에러가 발생해도 계속 진행
        continue;
      }
    }

    console.log(`Analysis complete. Saving ${categorizedPairs.length} pairs to database...`);

    // DB에 저장
    const { data: insertedData, error: insertError } = await supabase
      .from('categorized_veritas_pairs')
      .insert(categorizedPairs)
      .select();

    if (insertError) {
      throw new Error(`Failed to save data: ${insertError.message}`);
    }

    console.log(`Successfully saved ${insertedData.length} pairs to database`);

    return new Response(
      JSON.stringify({ 
        success: true,
        analyzed: categorizedPairs.length,
        saved: insertedData.length,
        message: 'Veritas data analyzed and saved successfully'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-veritas-data:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
