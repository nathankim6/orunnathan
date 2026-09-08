import { supabase } from "@/integrations/supabase/client";
import { generateQuestion } from "@/lib/claude";
import { TypeEntry, PassageEntry } from "@/types/question";
import { generateDocument } from "@/utils/documentGenerator";
import { playNotify } from "@/lib/audio/notify";

interface QuestionActionsProps {
  selectedTypes: TypeEntry[];
  setIsLoading: (loading: boolean) => void;
  setProgress: (progress: { current: number; total: number }) => void;
  setSelectedTypes: (types: TypeEntry[]) => void;
  setAbortController: (controller: AbortController | null) => void;
  difficulty: string;
  complexity: string;
  toast: any;
  saveQuestions?: (title: string, questions: any[]) => Promise<boolean>;
  selectDiversePairs?: (count: number) => any[];  // For fast Veritas data access
}

interface ContinueGenerationStats {
  hasGenerated: boolean;
  hasUngenerated: boolean;
  totalQuestions: number;
  generatedCount: number;
}

export const useQuestionActions = ({
  selectedTypes,
  setIsLoading,
  setProgress,
  setSelectedTypes,
  setAbortController,
  difficulty,
  complexity,
  toast,
  saveQuestions,
  selectDiversePairs
}: QuestionActionsProps) => {

  // 직접출제 모드: 마커 기반으로 결과를 즉시 생성
  const buildManualResult = (passage: PassageEntry, typeId: string): string => {
    const markers = passage.manualMarkers || [];
    if (markers.length === 0) return '';

    const sortedMarkers = [...markers].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
    let passageText = passage.text;
    const reversedMarkers = [...sortedMarkers].reverse();

    // === [숭의] 다른 의미: 5개 명사구 중 의미가 다른 1개 고르기 ===
    if (typeId === 'sungeuiDifferentMeaning') {
      for (const m of reversedMarkers) {
        const pos = m.position ?? passageText.indexOf(m.original);
        if (pos < 0) continue;
        const circled = String.fromCodePoint(0x2460 + m.id - 1);
        const display = `${circled}<u>${m.original}</u>`;
        passageText = passageText.substring(0, pos) + display + passageText.substring(pos + m.original.length);
      }
      const answerMarker = sortedMarkers.find(m => m.modified && m.modified !== m.original);
      const answer = answerMarker
        ? String.fromCodePoint(0x2460 + answerMarker.id - 1)
        : '?';

      let result = `다음 글의 밑줄 친 부분이 의미하는 바가 나머지 넷과 가장 <u>다른</u> 것은?(단, 단수와 복수는 의미에 영향을 주지 않음)\n\n`;
      result += passageText + '\n\n';
      result += `===== 정답 및 해설 =====\n\n`;
      result += `정답: ${answer}\n\n`;
      result += `[해설]\n`;
      for (const m of sortedMarkers) {
        const circled = String.fromCodePoint(0x2460 + m.id - 1);
        const isAnswer = answerMarker && m.id === answerMarker.id;
        result += `${circled} "${m.original}"${isAnswer ? ' — 나머지와 다른 의미 (정답)' : ''}\n`;
        if (m.explanation) result += `   ${m.explanation}\n`;
      }
      return result;
    }

    // === 기본: 어법/어휘 ===
    const typeLabel = typeId === 'grammar' ? '어법' : '어휘';
    for (const m of reversedMarkers) {
      const pos = m.position ?? passageText.indexOf(m.original);
      if (pos < 0) continue;
      const circled = String.fromCodePoint(0x2460 + m.id - 1);
      const isModified = m.modified && m.modified !== m.original;
      const display = isModified
        ? `${circled} <u>${m.modified}</u>`
        : `${circled} <u>${m.original}</u>`;
      passageText = passageText.substring(0, pos) + display + passageText.substring(pos + m.original.length);
    }

    const incorrectMarkers = sortedMarkers.filter(m => m.modified && m.modified !== m.original);
    const correctAnswer = incorrectMarkers.length > 0
      ? incorrectMarkers.map(m => `${String.fromCodePoint(0x2460 + m.id - 1)}`).join(', ')
      : '없음';

    let result = `다음 글의 밑줄 친 부분 중, ${typeLabel}적으로 틀린 것은?\n\n`;
    result += passageText + '\n\n';
    result += `===== 정답 및 해설 =====\n\n`;
    result += `정답: ${correctAnswer}\n\n`;
    
    for (const m of sortedMarkers) {
      const circled = String.fromCodePoint(0x2460 + m.id - 1);
      const isModified = m.modified && m.modified !== m.original;
      if (isModified) {
        result += `${circled} ${m.modified} → ${m.original} (정답)\n`;
        if (m.explanation) {
          result += `   ${m.explanation}\n`;
        }
      } else {
        result += `${circled} ${m.original} (맞는 표현)\n`;
      }
    }

    return result;
  };

  
  // 생성 상태 체크 함수
  const checkGenerationStats = (): ContinueGenerationStats => {
    let totalQuestions = 0;
    let generatedCount = 0;
    
    selectedTypes.forEach(typeEntry => {
      typeEntry.passages.forEach(passage => {
        if (passage?.text && passage.text.trim() !== '') {
          totalQuestions++;
          if (passage.result) {
            generatedCount++;
          }
        }
      });
    });
    
    return {
      hasGenerated: generatedCount > 0,
      hasUngenerated: generatedCount < totalQuestions,
      totalQuestions,
      generatedCount
    };
  };
  
  const handleGenerateAll = async (continueMode: boolean = false) => {
    const claudeApiKey = localStorage.getItem("claude_api_key");
    const gptApiKey = localStorage.getItem("gpt_api_key");
    const geminiApiKey = localStorage.getItem("gemini_api_key");
    const deepseekApiKey = localStorage.getItem("deepseek_api_key");

    if (!claudeApiKey && !gptApiKey && !geminiApiKey && !deepseekApiKey) {
      toast({
        title: "API 키 필요",
        description: "문제 생성을 위해 API 키를 먼저 설정해주세요.",
        variant: "destructive",
      });
      return;
    }

    // continueMode일 경우 이미 생성된 문제를 제외
    const nonEmptyTypes = selectedTypes.map(type => ({
      ...type,
      passages: type.passages.filter(passage => {
        const hasText = passage?.text && passage.text.trim() !== '';
        // continueMode일 때는 아직 생성되지 않은 문제만 필터링
        const needsGeneration = continueMode ? !passage.result : true;
        return hasText && needsGeneration;
      })
    })).filter(type => type.passages.length > 0);

    if (nonEmptyTypes.length === 0) {
      const message = continueMode 
        ? "모든 문제가 이미 생성되었습니다." 
        : "생성할 문제가 없습니다.";
      toast({
        title: "입력 확인",
        description: message,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    const totalQuestions = nonEmptyTypes.reduce((sum, type) => sum + type.passages.length, 0);
    setProgress({ current: 0, total: totalQuestions });
    
    const controller = new AbortController();
    setAbortController(controller);
    
    let aborted = false;
    
    // 배치 처리 설정
    const BATCH_SIZE = 10; // 한 배치당 문제 개수
    const BATCH_DELAY = 5000; // 배치 간 대기 시간 (5초)
    
    try {
      const updatedTypes = [...selectedTypes];
      // continueMode일 때 이미 생성된 문제 수를 카운트
      let currentQuestion = 0;
      if (continueMode) {
        selectedTypes.forEach(typeEntry => {
          typeEntry.passages.forEach(passage => {
            if (passage?.text && passage.text.trim() !== '' && passage.result) {
              currentQuestion++;
            }
          });
        });
      }
      const initialQuestion = currentQuestion;
      let batchCount = 0;

      // 선택된 복잡도 로깅
      const mode = continueMode ? '이어서 생성' : '새로 생성';
      console.log(`🚀 문제 ${mode} 시작 - 총 ${totalQuestions}개 중 ${currentQuestion}개 완료, ${totalQuestions - currentQuestion}개 남음`);
      console.log(`📊 선택된 복잡도: ${complexity}, 패러프레이즈 수준: ${difficulty}`);
      console.log(`🔄 배치 크기: ${BATCH_SIZE}개, 배치 간 대기: ${BATCH_DELAY}ms`);

      // Process each type one at a time
      for (const typeEntry of updatedTypes) {
        // Check abort at the start of each type
        if (controller.signal.aborted) {
          console.log('문제 생성이 사용자에 의해 중단되었습니다.');
          aborted = true;
          break;
        }
        
        // Special handling for danggokListening: combine all 5 passages into ONE generation call
        if (typeEntry.type.id === 'danggokListening') {
          const allPassages = typeEntry.passages;
          const filledPassages = allPassages.filter(p => p?.text && p.text.trim() !== '');
          
          if (filledPassages.length < 5) {
            toast({
              title: "듣기 대본 부족",
              description: `5개의 대본을 모두 입력해야 합니다. 현재 ${filledPassages.length}/5`,
              variant: "destructive",
            });
            continue;
          }
          
          // Skip if all already generated in continue mode
          if (continueMode && allPassages.every(p => p.result)) {
            continue;
          }
          
          const combinedText = allPassages
            .map((p, i) => `[대본${i + 1}]\n${p.text.trim()}`)
            .join('\n\n');
          
          try {
            console.log(`🎧 [당곡] 듣기 5문항SET 생성 시작 - 5개 대본 통합`);
            const result = await generateQuestion(typeEntry.type, combinedText, difficulty, complexity, undefined, controller.signal, undefined, undefined, undefined);
            
            if (controller.signal.aborted) {
              aborted = true;
              break;
            }
            
            // Store the entire result on the FIRST passage; clear others
            const typeIndex = updatedTypes.findIndex(t => t.type.id === typeEntry.type.id);
            if (typeIndex !== -1) {
              updatedTypes[typeIndex].passages[0].result = result;
              for (let i = 1; i < updatedTypes[typeIndex].passages.length; i++) {
                updatedTypes[typeIndex].passages[i].result = '';
              }
              setSelectedTypes([...updatedTypes]);
              currentQuestion += 5;
              setProgress({ current: currentQuestion, total: totalQuestions });
            }
            
            toast({
              title: "듣기 5문항 생성 완료",
              description: `1번~5번 듣기 문항이 생성되었습니다.`,
            });
            playNotify();
          } catch (err) {
            console.error('듣기 문제 생성 실패:', err);
            toast({
              title: "듣기 문제 생성 실패",
              description: err instanceof Error ? err.message : "알 수 없는 오류",
              variant: "destructive",
            });
          }
          
          continue; // Skip the per-passage loop for this type
        }
        
        // continueMode일 때는 아직 생성되지 않은 문제만 처리
        const validPassages = typeEntry.passages.filter(p => {
          const hasText = p?.text && p.text.trim() !== '';
          const needsGeneration = continueMode ? !p.result : true;
          return hasText && needsGeneration;
        });
        
        // Process each passage independently with delay between generations
        for (const passage of validPassages) {
          // Check abort before starting each passage
          if (controller.signal.aborted) {
            console.log('문제 생성이 사용자에 의해 중단되었습니다.');
            aborted = true;
            break;
          }

          try {
            // 직접출제 모드: AI 호출 없이 마커 기반 즉시 출력
            if (passage.manualMode && passage.manualMarkers && passage.manualMarkers.length > 0) {
              console.log(`📝 직접출제 모드 - 지문 ID: ${passage.id}, 유형: ${typeEntry.type.id}`);

              let result: string;

              // englishDefinitionBlankMatch 직접출제: 사용자가 고른 5개 단어를 빈칸으로 사용 + AI가 영영풀이/선지 생성
              if (typeEntry.type.id === 'englishDefinitionBlankMatch') {
                const sorted = [...passage.manualMarkers].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
                if (sorted.length !== 5) {
                  toast({
                    title: "단어 5개 필요",
                    description: `(A)~(E) 5개의 단어를 정확히 선택해야 합니다. 현재 ${sorted.length}개.`,
                    variant: "destructive",
                  });
                  continue;
                }
                const targetList = sorted
                  .map((m, i) => `(${String.fromCharCode(65 + i)}) ${m.original}`)
                  .join('\n');
                const BLANK = '__________';
                // Build passage with brackets/blanks at the marked positions
                const reversed = [...sorted].reverse();
                let displayText = passage.text;
                for (let i = sorted.length - 1; i >= 0; i--) {
                  const m = sorted[i];
                  const pos = m.position ?? displayText.indexOf(m.original);
                  if (pos < 0) continue;
                  const label = `(${String.fromCharCode(65 + i)})`;
                  displayText = displayText.substring(0, pos) + `${label}${BLANK}` + displayText.substring(pos + m.original.length);
                }
                const customPrompt = `당신은 영어 교사입니다. 아래 영어 지문과 사용자가 직접 선택한 5개의 단어/구문을 바탕으로 "빈칸-영영풀이 매칭" 객관식 문제를 만들어주세요.

[사용자가 선택한 빈칸 단어 — 반드시 이 단어들을 (A)~(E) 빈칸의 정답으로 사용]
${targetList}

[빈칸이 적용된 지문]
${displayText}

[원본 지문]
${passage.text}

[문제 형식 — 엄수]
- (A)~(E) 빈칸은 위에 명시된 사용자 선택 단어들이 정답입니다. 임의로 다른 단어를 빈칸으로 만들지 마세요.
- <영영 풀이> 박스에 영영 정의 6개(ⓐ~ⓕ)를 제시합니다. 5개는 (A)~(E)의 정답이고, 1개는 오답(distractor)입니다.
- 5개의 객관식 선택지(①~⑤)는 "(라벨)-(원문자), (라벨)-(원문자)" 형식의 2쌍짜리 매칭으로 구성합니다. 정답 보기는 두 쌍 모두 올바른 매칭이어야 하고, 오답 4개는 적어도 한 쌍이 틀려야 합니다.
- 정답은 ①~⑤ 중 무작위 위치에 배치하세요.

[영영풀이 작성 규칙]
- 모든 정의는 학습용 영영사전 스타일("to ..." 형식, 또는 품사에 맞는 형식) — 5~12 단어 길이
- 빈칸에 들어갈 단어 자체를 정의 안에 직접 노출하지 말 것
- 오답(distractor) 정의는 그럴듯하지만 지문 내 어떤 빈칸에도 맞지 않아야 함

[출력 형식 — 그대로 따르세요. <box> 태그 포함. 추가 머리말/설명 금지.]

다음 문장의 빈칸 (A)~(E)에 들어갈 말의 영영풀이가 알맞게 짝지어진 것은?
<box>
[빈칸 (A)~(E)가 포함된 영어 지문 전체. 위 '빈칸이 적용된 지문'을 그대로 사용]
</box>
<box>
ⓐ to ...
ⓑ to ...
ⓒ to ...
ⓓ to ...
ⓔ to ...
ⓕ to ...
</box>

① (A)-ⓒ, (E)-ⓓ
② (A)-ⓐ, (C)-ⓑ
③ (B)-ⓕ, (D)-ⓔ
④ (C)-ⓓ, (D)-ⓕ
⑤ (B)-ⓔ, (D)-ⓐ
[정답] [번호]
[해설] 각 빈칸의 정답 단어와 매칭되는 영영풀이를 간단히 설명하세요.`;

                const { AIClientManager } = await import('@/lib/ai/aiClientManager');
                const client = AIClientManager.getInstance().createClient();
                result = await client.generateCompletion(customPrompt);
              } else {
                result = buildManualResult(passage, typeEntry.type.id);
              }

              const typeIndex = updatedTypes.findIndex(t => t.type.id === typeEntry.type.id);
              if (typeIndex !== -1) {
                const passageIndex = updatedTypes[typeIndex].passages.findIndex(p => p.id === passage.id);
                if (passageIndex !== -1) {
                  updatedTypes[typeIndex].passages[passageIndex].result = result;
                  setSelectedTypes([...updatedTypes]);
                  currentQuestion++;
                  setProgress({ current: currentQuestion, total: totalQuestions });
                }
              }

              toast({
                title: "직접출제 완료",
                description: `${currentQuestion}/${totalQuestions}번째 문제 (직접출제)`,
              });
              playNotify();
              continue;
            }

            console.log(`독립적으로 문제 생성 시작 - 유형: [${typeEntry.type.name}] ${typeEntry.type.id}, 지문 ID: ${passage.id}, 패러프레이즈 수준: ${difficulty}, 복잡도: ${complexity}, 모드: ${passage.orderMode || passage.summaryMode || 'basic'}`);
            
            // For grammar questions, use pre-cached Veritas data for faster generation
            let veritasPairs = undefined;
            if (typeEntry.type.id === 'grammar' && selectDiversePairs) {
              veritasPairs = selectDiversePairs(5);
              console.log(`🚀 Using pre-cached Veritas data (${veritasPairs.length} pairs) for faster generation`);
            }
            
            // 순서문제는 orderMode, 요약문 문제는 summaryMode 전달
            const mode = typeEntry.type.id === 'summary' ? passage.summaryMode : passage.orderMode;
            const choiceLanguage = passage.choiceLanguage;
            // 빈칸 유형 패러프레이즈 옵션 (기본값: true=변형)
            const paraphraseBlank = passage.paraphraseBlank !== false;
            const subType = passage.subType;
            const result = await generateQuestion(typeEntry.type, passage.text, difficulty, complexity, mode, controller.signal, veritasPairs, choiceLanguage, passage.combinedTypes, paraphraseBlank, subType);
            
            // Check abort again after generation
            if (controller.signal.aborted) {
              console.log('문제 생성이 사용자에 의해 중단되었습니다.');
              aborted = true;
              break;
            }
            
            console.log(`문제 생성 완료 - 지문 ID: ${passage.id}, 복잡도: ${complexity}`);
            
            // Update state for this specific passage
            const typeIndex = updatedTypes.findIndex(t => t.type.id === typeEntry.type.id);
            if (typeIndex !== -1) {
              const passageIndex = updatedTypes[typeIndex].passages.findIndex(p => p.id === passage.id);
              if (passageIndex !== -1) {
                updatedTypes[typeIndex].passages[passageIndex].result = result;
                setSelectedTypes([...updatedTypes]);
                currentQuestion++;
                setProgress({ current: currentQuestion, total: totalQuestions });

                // Log generation to Supabase by access code
                try {
                  const accessCode = localStorage.getItem('accessCode');
                  if (accessCode) {
                    await supabase.from('user_works').insert([
                      {
                        access_code: accessCode,
                        step_number: 1,
                        step_name: 'question_generation',
                        title: typeEntry.type.name,
                        content: `passage:${passage.id}`,
                        result: 'generated'
                      }
                    ]);
                  }
                } catch (e) {
                  console.warn('Failed to log generation:', e);
                }
              }
            }

            // Check abort before delay
            if (controller.signal.aborted) {
              console.log('문제 생성이 사용자에 의해 중단되었습니다.');
              aborted = true;
              break;
            }

            // 배치 처리: 10개마다 긴 대기 시간
            batchCount++;
            const isEndOfBatch = batchCount % BATCH_SIZE === 0;
            const delayTime = isEndOfBatch ? BATCH_DELAY : 2000;
            
            if (isEndOfBatch) {
              console.log(`⏸️  배치 ${Math.floor(batchCount / BATCH_SIZE)} 완료 - ${BATCH_DELAY}ms 대기 중...`);
            }

            // Add delay between passages
            await new Promise((resolve, reject) => {
              const timeout = setTimeout(resolve, delayTime);
              // Allow abort during delay
              controller.signal.addEventListener('abort', () => {
                clearTimeout(timeout);
                reject(new Error('AbortError'));
              }, { once: true });
            });

            // Check abort after delay
            if (controller.signal.aborted) {
              console.log('문제 생성이 사용자에 의해 중단되었습니다.');
              aborted = true;
              break;
            }

            // Show success toast for each passage
            toast({
              title: "문제 생성 완료",
              description: `${currentQuestion}/${totalQuestions}번째 문제 생성됨 (${complexity})`,
            });
            playNotify();

          } catch (error) {
            if (error.message === 'AbortError' || error.name === 'AbortError' || controller.signal.aborted) {
              console.log('문제 생성이 사용자에 의해 중단되었습니다.');
              aborted = true;
              break;
            }
            console.error(`❌ 지문 ${passage.id} 문제 생성 중 오류 발생:`, error);
            
            // 에러 메시지 개선
            let errorMessage = error.message;
            if (error.message.includes("rate limit") || error.message.includes("429")) {
              errorMessage = "요청 한도를 초과했습니다. 자동 재시도 중입니다...";
            } else if (error.message.includes("과부하")) {
              errorMessage = "서버 과부하로 재시도했으나 실패했습니다. 배치 크기를 줄이거나 나중에 다시 시도해주세요.";
            }
            
            toast({
              title: "오류 발생",
              description: `${currentQuestion}번째 문제 생성 실패: ${errorMessage}`,
              variant: "destructive",
            });
            
            currentQuestion++;
            setProgress({ current: currentQuestion, total: totalQuestions });
          }
        }
        
        // Break outer loop if aborted
        if (aborted) {
          break;
        }
      }
      
      // Only show success toast if at least one question was generated successfully and not aborted
      if (!aborted) {
        const successfulQuestions = updatedTypes.reduce((count, type) => 
          count + type.passages.filter(p => p.result).length, 0
        );
        
        if (successfulQuestions > 0) {
          toast({
            title: "문제 생성 완료",
            description: `${successfulQuestions}개 문제가 생성되었습니다. (${complexity} 난이도)`,
          });
          
          // Auto-save generated questions
          if (saveQuestions) {
            const generatedQuestions = updatedTypes.flatMap((typeEntry) => 
              typeEntry.passages
                .map((passage) => ({
                  id: passage.id,
                  content: passage.result,
                  questionNumber: 0,
                  originalText: passage.text,
                  type: typeEntry.type.id
                }))
                .filter(q => q.content)
            );
            
            if (generatedQuestions.length > 0) {
              const now = new Date();
              const title = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')} ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
              await saveQuestions(title, generatedQuestions);
            }
          }
        }
      }
    } catch (error) {
      // Only show error if not aborted
      if (error.name !== 'AbortError' && error.message !== 'AbortError' && !controller.signal.aborted) {
        console.error("Generation process error:", error);
        toast({
          title: "오류 발생",
          description: "문제 생성 중 오류가 발생했습니다.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
      setProgress({ current: 0, total: 0 });
      setAbortController(null);
    }
  };

  const handleDownloadDoc = async () => {
    try {
      // Check if Hancom API key exists
      const hancomApiKey = localStorage.getItem("hancom_api_key");
      
      const questions = selectedTypes
        .flatMap(typeEntry => 
          typeEntry.passages
            .filter(passage => passage.result)
            .map((passage, index) => ({
              content: passage.result,
              questionNumber: index + 1,
              originalText: typeEntry.type.id === "weekendClinic" ? passage.text : undefined
            }))
        )
        .sort((a, b) => a.questionNumber - b.questionNumber);

      if (questions.length === 0) {
        toast({
          title: "다운로드 실패",
          description: "저장할 문제가 없습니다.",
          variant: "destructive",
        });
        return;
      }
      
      // Generate documents and handle possible errors
      const result = await generateDocument(questions, hancomApiKey ? "hwp" : "docx");
      
      if (!result.success) {
        toast({
          title: "저장 알림",
          description: result.error,
          variant: "destructive",
        });
        return;
      }
      
      // Show success message with the correct format
      toast({
        title: "다운로드 완료",
        description: `문제가 ${result.format === "docx" ? "Word(DOCX)" : "한글(HWP)"} 형식으로 저장되었습니다.`,
      });
    } catch (error) {
      console.error("Download document error:", error);
      toast({
        title: "다운로드 실패",
        description: error.message || "문서 저장 중 오류가 발생했습니다.",
        variant: "destructive",
      });
    }
  };

  const handleContinueGeneration = async () => {
    const stats = checkGenerationStats();
    
    if (!stats.hasUngenerated) {
      toast({
        title: "생성 완료",
        description: "모든 문제가 이미 생성되었습니다.",
      });
      return;
    }
    
    if (stats.hasGenerated) {
      console.log(`🔄 이어서 생성 시작: ${stats.generatedCount}/${stats.totalQuestions}개 완료, ${stats.totalQuestions - stats.generatedCount}개 남음`);
    }
    
    await handleGenerateAll(true);
  };

  return {
    handleGenerateAll: () => handleGenerateAll(false),
    handleContinueGeneration,
    handleDownloadDoc,
    checkGenerationStats
  };
};
