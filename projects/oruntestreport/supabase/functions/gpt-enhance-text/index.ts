import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text, type } = await req.json();

    if (!text || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: '텍스트를 입력해주세요.' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    let systemPrompt = '';

    const sharedRules = `
      [핵심 원칙 — 반드시 준수]
      - 본 글은 옳은영어(ORUN ENGLISH) 학원이 학부모님께 전달하는 공식 시험 분석 리포트입니다.
      - 입력되지 않은 사실(점수, 인원, 비율, 학생 이름, 특정 문항 번호 등)은 절대 추측·생성하지 마세요.
      - 오직 제공된 입력 내용만을 근거로, 누락된 부분은 일반적·중립적 표현으로 자연스럽게 다듬으세요.
      - 학원 강사가 직접 정리한 것처럼 자연스럽고 부드러운 존댓말로 작성하세요.
      - 어미는 '~입니다', '~했습니다', '~도움이 됩니다', '~좋겠습니다' 처럼 설명하거나 제안하는 형태를 쓰세요.
      - 명령형은 금지합니다: '~하십시오', '~하십시요', '~반복하십시오', '~익히십시오', '~하세요', '~해야 합니다'.
      - 과장, 단정적 표현, 자극적 표현, 광고성 문구, AI 상투어, 긴 체크리스트, 불필요하게 거창한 제안은 피하세요.
      - 인사말·맺음말·이모지·마크다운(별표, #, - 등) 사용 금지.
      - 줄바꿈 없는 한 문단으로만 작성하세요.
    `;

    if (type === 'exam-characteristics') {
      systemPrompt = `당신은 옳은영어 학원의 베테랑 영어 강사로서, 학부모님께 보내는 시험 분석 리포트의 "시험 특징 및 킬러 문항" 섹션을 첨삭·작성합니다.
${sharedRules}
      [작성 방식]
      - "이번 시험은", "이번 시험 분석 결과" 등 자연스러운 도입으로 시작
      - 지문의 활용·변형 방식, 선택지 구성, 복수정답 조건과 배점 배치 등 해당 시험의 출제적 특징을 입력 근거에 따라 서술. 일반적인 유형 설명으로 대체하지 않음
      - 학습 조언이나 수준별 전략을 추가하지 않고, 이 시험에서 확인된 구체적 출제 방식만 설명
      - 분량: 280–360자 (공백 포함)
      - 출력은 본문 텍스트만, 한 문단으로`;
    } else if (type === 'overall-evaluation') {
      systemPrompt = `당신은 옳은영어 학원의 베테랑 영어 강사로서, 학부모님께 보내는 시험 분석 리포트의 "종합 평가" 섹션을 첨삭·작성합니다.
${sharedRules}
      [작성 방식]
      - "시험 결과 분석에 따르면", "이번 시험 결과를 종합해 보면" 등 자연스러운 도입으로 시작
      - 시험의 전반적 난이도, 학습 성취 수준, 향후 학습 방향에 대한 평가를 입력 내용에 근거해 정돈된 문장으로 서술
      - 학부모가 자녀 학습 상태를 이해하기 쉽도록 명확한 어조 유지
      - 분량: 320–420자 (공백 포함)
      - 출력은 본문 텍스트만, 한 문단으로`;
    }

    console.log('AI Gateway request:', { type, textLength: text.length });

    const model = 'openai/gpt-5';

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `다음 강사 메모를 바탕으로 학부모님께 드리는 정중하고 전문적인 분석 한 문단을 작성해 주세요. 메모에 없는 사실은 절대 추가하지 마세요.\n\n[강사 메모]\n${text}` }
        ],
      }),
    });

    console.log('OpenAI API response status:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error response:', response.status, errorText);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: '요청이 너무 많습니다. 잠시 후 다시 시도해 주세요.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'AI 사용 크레딧이 부족합니다. 워크스페이스 설정에서 충전해 주세요.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      throw new Error(`AI Gateway 오류: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    const enhancedText = data.choices[0].message.content;

    console.log('GPT Enhancement success:', { enhancedText });

    return new Response(JSON.stringify({ enhancedText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in gpt-enhance-text function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});