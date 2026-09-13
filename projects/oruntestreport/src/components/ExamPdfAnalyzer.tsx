import { shouldShowInsight } from '@/utils/problemInsight';
import React, { useCallback, useMemo, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import workerSrc from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileUp, Sparkles, Check, Loader2 } from 'lucide-react';
import { EXAM_AI_MODEL_LABEL, EXAM_AI_VENDOR } from '@/lib/aiModel';
import claudeLogoAsset from '@/assets/claude-logo.png.asset.json';
const claudeLogo = claudeLogoAsset.url;

pdfjsLib.GlobalWorkerOptions.workerSrc = workerSrc;

export interface AnalyzedProblem {
  number: number;
  category: string;
  name: string;
  questionType: 'objective' | 'subjective';
  difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  points: number;
  isVariant: boolean;
  isKiller: boolean;
  answer?: string;
  insight?: string;
  page?: number;
  yStart?: number;
  yEnd?: number;
  note?: string;
}

export interface ExamFeatureItem {
  title: string;
  detail: string;
}

export interface KillerTop5Item {
  number: string;
  title: string;
  points?: number;
  reason: string;
}

export interface PassageVariantItem {
  number: string;
  source: string;
  variantType: string;
  originalText: string;
  examText: string;
  changeDetail: string;
  impact?: string;
}

export interface ExamAnalysis {
  school: string | null;
  grade: string | null;
  examInfo: string | null;
  examScope: string | null;
  totalQuestions: number;
  objectiveQuestions: number;
  subjectiveQuestions: number;
  examFeatures?: ExamFeatureItem[];
  killerTop5?: KillerTop5Item[];
  passageVariants?: PassageVariantItem[];
  levelStrategy?: string;
  parentSummary?: string;
  /** 시험지에 인쇄된 담당 교사명(없으면 비어 있음) */
  teacher?: string;
  /** 이번 시험이 어려웠던 이유 — 학부모용 서술 */
  difficultProblemsExplanation?: string;
  /** 시험 전체 총평 */
  overallEvaluation?: string;
  /** 문항 수·서답형·킬러 비중으로 AI 가 정한 리포트 상세도 */
  analysisType?: 'detailed' | 'simple';
  problems: AnalyzedProblem[];
}




interface ExamPdfAnalyzerProps {
  schoolType: 'middle' | 'high';
  /** 강사가 기본 정보 단계에서 입력한 시험 범위 — AI가 문항별 범위를 이 기준으로 지정 */
  examScope?: string;
  /** 시험 범위 원문 — 실제 출제 문장과 대조해 변형 분석 */
  originalPassages?: string;
  onApply: (analysis: ExamAnalysis) => void;
}


const readAsDataUrl = (file: File) =>
  new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });


const PROGRESS_STEPS = [
  { key: 'rendering', label: '시험지 확인' },
  { key: 'analyzing', label: 'AI 문항 정밀 분석' },
  { key: 'variant', label: '원문 대조 · 변형 추출' },
  { key: 'applying', label: '입력폼 자동 반영' },
] as const;

const ExamPdfAnalyzer: React.FC<ExamPdfAnalyzerProps> = ({
  schoolType,
  examScope,
  originalPassages,
  onApply,
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const rampRef = useRef<number | null>(null);
  const [fileName, setFileName] = useState('');
  const [stage, setStage] = useState<'idle' | 'rendering' | 'analyzing' | 'review' | 'applying'>('idle');
  const [analysis, setAnalysis] = useState<ExamAnalysis | null>(null);
  
  const [progress, setProgress] = useState(0);
  const [progressStep, setProgressStep] = useState<(typeof PROGRESS_STEPS)[number]['key']>('rendering');
  const [progressDetail, setProgressDetail] = useState('');
  const [progressLog, setProgressLog] = useState<string[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);


  const busy = stage === 'rendering' || stage === 'analyzing' || stage === 'applying';

  const pushLog = useCallback((line: string) => {
    setProgressLog((prev) => (prev[prev.length - 1] === line ? prev : [...prev.slice(-5), line]));
  }, []);

  const mark = useCallback(
    (step: (typeof PROGRESS_STEPS)[number]['key'], pct: number, detail: string) => {
      setProgressStep(step);
      setProgress((prev) => Math.max(prev, Math.min(99, pct)));
      setProgressDetail(detail);
      pushLog(detail);
    },
    [pushLog],
  );

  const stopRamp = useCallback(() => {
    if (rampRef.current) {
      window.clearInterval(rampRef.current);
      rampRef.current = null;
    }
  }, []);

  /** 분석 대기 시간 동안 진행률을 자연스럽게 끌어올리며 세부 메시지를 순환 */
  const startRamp = useCallback(
    (from: number, to: number, messages: string[]) => {
      stopRamp();
      let i = 0;
      setProgress((p) => Math.max(p, from));
      rampRef.current = window.setInterval(() => {
        setProgress((p) => (p >= to ? p : p + Math.max(0.2, (to - p) * 0.045)));
        i += 1;
        if (i % 6 === 0) {
          const msg = messages[(i / 6) % messages.length];
          setProgressDetail(msg);
          pushLog(msg);
        }
      }, 700);
    },
    [pushLog, stopRamp],
  );



  const handleFile = async (file: File) => {
    if (file.type !== 'application/pdf') {
      toast.error('PDF 파일만 업로드할 수 있습니다.');
      return;
    }
    setFileName(file.name);
    setAnalysis(null);
    
    setProgress(0);
    setProgressLog([]);
    setErrorMessage(null);

    try {
      setStage('rendering');
      mark('rendering', 3, `${file.name} 파일을 읽는 중…`);
      const dataUrl = await readAsDataUrl(file);
      const buffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
      setNumPages(pdf.numPages);
      mark('rendering', 18, `총 ${pdf.numPages}페이지를 확인했습니다.`);

      setStage('analyzing');
      const hasOriginal = Boolean(originalPassages?.trim());
      mark('analyzing', 32, `${EXAM_AI_MODEL_LABEL}(${EXAM_AI_VENDOR})에 시험지를 전송했습니다.`);
      startRamp(
        32,
        hasOriginal ? 88 : 92,
        [
          '문항별 배점과 정답을 판독하는 중…',
          '대분류 · 소분류 유형을 분류하는 중…',
          '난이도와 출제 방향성을 정리하는 중…',
          '시험 범위와 문항 출처를 대조하는 중…',
          ...(hasOriginal
            ? ['원문과 출제 문장을 문장 단위로 대조하는 중…', '어휘 치환 · 구문 변형 지점을 추출하는 중…']
            : []),
          '등급을 가른 문항 TOP 5를 선별하는 중…',
          '출제 특징과 종합의견을 작성하는 중…',
        ],
      );

      // Edge Function이 Anthropic SSE를 그대로 중계하므로, 스트림을 직접 읽어 조립합니다.
      // (전체 응답을 한 번에 받으면 150초 타임아웃(504)이 발생해 스트리밍 방식으로 전환)
      const requestAnalysis = async () => {
        const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-exam-pdf`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
          body: JSON.stringify({
            fileData: dataUrl,
            filename: file.name,
            schoolType,
            examScope: examScope?.trim() || '',
            originalPassages: originalPassages?.trim() || '',
          }),
        });

        if (!res.ok || !res.body) {
          let message = `AI 분석 요청이 실패했습니다. (${res.status})`;
          try {
            const errJson = await res.json();
            if (errJson?.error) message = errJson.error as string;
          } catch { /* ignore */ }
          throw new Error(message);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let sseBuffer = '';
        let text = '';
        let stopReason = '';
        let sawThinking = false;
        let streamError: string | null = null;
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          sseBuffer += decoder.decode(value, { stream: true });
          const lines = sseBuffer.split('\n');
          sseBuffer = lines.pop() ?? '';
          for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed.startsWith('data:')) continue;
            const raw = trimmed.slice(5).trim();
            if (!raw || raw === '[DONE]') continue;
            let json: any;
            try {
              json = JSON.parse(raw);
            } catch {
              continue; // 부분 청크는 무시
            }
            if (json?.type === 'content_block_delta' && json?.delta?.type === 'text_delta') {
              text += json.delta.text ?? '';
            } else if (json?.type === 'content_block_delta' && json?.delta?.type === 'thinking_delta') {
              sawThinking = true;
            } else if (json?.type === 'message_delta' && json?.delta?.stop_reason) {
              stopReason = json.delta.stop_reason as string;
            } else if (json?.type === 'error') {
              streamError = json?.error?.message ?? '알 수 없는 오류';
            }
          }
        }
        return { text, stopReason, sawThinking, streamError };
      };

      let stream = await requestAnalysis();
      // 본문 없이 스트림이 끊긴 경우(추론 단계에서 연결 종료 등) 1회 자동 재시도
      if (!stream.text.trim() && !stream.streamError) {
        mark('analyzing', 45, '응답이 중간에 끊겼습니다. 자동으로 한 번 더 시도합니다…');
        stream = await requestAnalysis();
      }
      stopRamp();

      if (stream.streamError) {
        throw new Error(`Claude 분석 중 오류가 발생했습니다. (${stream.streamError})`);
      }

      const text = stream.text;
      const stopReason = stream.stopReason;
      if (!text.trim()) {
        throw new Error(
          stream.sawThinking
            ? 'AI가 추론 단계에서 응답이 끊겼습니다. 시험지 페이지 수를 줄이거나 잠시 후 다시 시도해 주세요.'
            : `AI가 분석 결과를 반환하지 않았습니다. (종료 사유: ${stopReason || '응답 없음'}) 잠시 후 다시 시도해 주세요.`,
        );
      }

      const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
      // 출력이 max_tokens로 잘렸을 경우 열린 괄호/문자열을 닫아 JSON을 복구
      const repairTruncatedJson = (src: string): string => {
        const stack: string[] = [];
        let inString = false;
        let escaped = false;
        let cut = src.length;
        for (let i = 0; i < src.length; i += 1) {
          const ch = src[i];
          if (inString) {
            if (escaped) escaped = false;
            else if (ch === '\\') escaped = true;
            else if (ch === '"') inString = false;
            continue;
          }
          if (ch === '"') inString = true;
          else if (ch === '{' || ch === '[') stack.push(ch);
          else if (ch === '}' || ch === ']') stack.pop();
        }
        // 잘린 문자열/콤마 꼬리 제거
        let body = src.slice(0, cut);
        body = body.replace(/[,\s]+$/, '');
        if (inString) body = body.replace(/"[^"\\]*(?:\\.[^"\\]*)*$/, '');
        body = body.replace(/:\s*$/, ':null');
        body = body.replace(/,\s*$/, '');
        const closer = stack.map((b) => (b === '{' ? '}' : ']')).reverse().join('');
        return body + closer;
      };
      let result: ExamAnalysis | undefined;
      try {
        result = JSON.parse(cleaned) as ExamAnalysis;
      } catch {
        try {
          result = JSON.parse(repairTruncatedJson(cleaned)) as ExamAnalysis;
        } catch {
          const start = cleaned.indexOf('{');
          const end = cleaned.lastIndexOf('}');
          if (start === -1 || end === -1) {
            throw new Error(
              stopReason === 'max_tokens'
                ? 'AI 응답이 길이 제한으로 잘렸습니다. 다시 시도해 주세요.'
                : 'AI 응답을 해석할 수 없습니다.',
            );
          }
          result = JSON.parse(repairTruncatedJson(cleaned.slice(start, end + 1))) as ExamAnalysis;
        }
      }

      if (!result || !Array.isArray(result.problems)) {
        throw new Error('AI 분석 결과가 비어 있습니다.');
      }

      if (hasOriginal) {
        mark('variant', 94, `원문 변형 ${result.passageVariants?.length ?? 0}건을 정리했습니다.`);
      }
      mark('variant', 96, `문항 ${result.problems.length}개 분석을 마쳤습니다.`);
      result.problems = result.problems.map(p => ({ ...p, insight: shouldShowInsight(p) ? p.insight : '' }));
      setAnalysis(result);
      setProgress(100);
      setStage('review');
      toast.success(`분석 완료 — ${result.problems.length}개 문항을 인식했습니다.`);
    } catch (err) {
      stopRamp();
      console.error('PDF 분석 실패:', err);
      const message = err instanceof Error ? err.message : 'PDF 분석 중 오류가 발생했습니다.';
      setErrorMessage(message);
      toast.error(message, { duration: Infinity, closeButton: true });
      setStage('idle');
      setProgress(0);
    }

  };

  const handleApply = () => {
    if (!analysis) return;
    setStage('applying');
    mark('applying', 60, '분석 결과를 입력폼에 옮기는 중…');
    try {
      onApply(analysis);
      setProgress(100);
      toast.success('입력폼에 자동으로 반영되었습니다.');
    } catch (err) {
      console.error(err);
      toast.error('반영 중 오류가 발생했습니다.');
    }
    setStage('review');
  };

  return (
    <div className="relative overflow-hidden rounded-2xl border border-[#F5C64F]/30 bg-white/75 backdrop-blur-xl p-6">
      <div
        aria-hidden
        className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-[#F5C64F] via-[#FFE9A8] to-[#F5C64F]"
      />
      <div className="flex flex-col items-center text-center gap-5">
        <div>
          <span className="editorial-kicker text-[10px] tracking-[0.4em] font-bold">AI AUTO-FILL</span>
          <h3 className="font-display text-[19px] font-medium text-[hsl(var(--ink))] mt-1">
            시험지 PDF 자동 분석
          </h3>
          <p className="text-[13px] text-[hsl(var(--ink-soft))] mt-1 break-keep">
            시험지를 첨부하면 문항별 배점·대분류·소분류·서답형 여부·난이도·지문 변형·킬러문항과 시험 특징, 담당 강사
            코멘트까지 한 번에 채웁니다.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
              e.target.value = '';
            }}
          />
          <Button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="bg-[#F5C64F] text-[#2B3642] hover:bg-[#FFD666] rounded-full px-6 font-semibold shadow-[0_8px_20px_rgba(245,198,79,0.3)]"
          >
            {busy ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <FileUp className="w-4 h-4 mr-2" />}
            {busy ? '분석 중…' : '시험지  PDF 첨부 · 자동 분석'}
          </Button>
          <span className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full border border-[#D97757]/40 bg-[#D97757]/10 px-3 py-1.5 text-[11px] font-medium tracking-[-0.01em] text-slate-700 whitespace-nowrap shadow-[0_0_16px_rgba(217,119,87,0.25)]">
            <style>{`@keyframes ai-shimmer{0%{transform:translateX(-120%) skewX(-15deg)}100%{transform:translateX(220%) skewX(-15deg)}} @keyframes ai-logo-spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}`}</style>
            <span
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-gradient-to-r from-transparent via-[#F5C64F]/25 to-transparent"
              style={{ animation: 'ai-shimmer 2.8s ease-in-out infinite' }}
            />
            <span className="relative flex items-center justify-center w-[18px] h-[18px]">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#D97757]/50 animate-ping" style={{ animationDuration: '2s' }} />
              <img
                src={claudeLogo}
                alt="Claude 로고"
                width={18}
                height={18}
                loading="lazy"
                className="relative w-[18px] h-[18px] object-contain drop-shadow-[0_0_6px_rgba(217,119,87,0.6)]"
                style={{ animation: 'ai-logo-spin 8s linear infinite' }}
              />
            </span>
            AI Configuration: {EXAM_AI_MODEL_LABEL} by {EXAM_AI_VENDOR} 
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-[#F5C64F] opacity-75 animate-ping" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#F5C64F]" />
            </span>
          </span>
        </div>
      </div>

      {fileName && (
        <p className="mt-3 text-[12px] text-[hsl(var(--ink-soft))] truncate">첨부 파일: {fileName}</p>
      )}
      {busy && (
        <div className="mt-5 rounded-2xl border border-[#F5C64F]/35 bg-white/80 p-5 shadow-[0_10px_30px_rgba(43,54,66,0.08)]">
          <style>{`@keyframes ai-bar-stripe{0%{background-position:0 0}100%{background-position:36px 0}} @keyframes ai-bar-sheen{0%{transform:translateX(-60%)}100%{transform:translateX(320%)}}`}</style>

          <div className="flex items-end justify-between gap-3">
            <div className="min-w-0">
              <span className="editorial-kicker text-[9.5px] tracking-[0.35em] text-[#2B3642]">
                ANALYZING
              </span>
              <p className="mt-1 flex items-center gap-2 text-[13.5px] font-semibold text-[#2B3642] break-keep">
                <img src={claudeLogo} alt="Claude" className="w-4 h-4 animate-spin shrink-0" />
                <span className="truncate">{progressDetail || '준비 중…'}</span>
              </p>
            </div>
            <p className="font-display text-[26px] font-semibold leading-none text-[#2B3642] tabular-nums">
              {Math.round(progress)}
              <span className="text-[14px] text-[hsl(var(--ink-soft))]">%</span>
            </p>
          </div>

          <div className="relative mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[#2B3642]/10">
            <div
              className="relative h-full rounded-full bg-gradient-to-r from-[#F5C64F] via-[#FFD97A] to-[#F5C64F] transition-[width] duration-700 ease-out"
              style={{
                width: `${Math.max(3, Math.min(100, progress))}%`,
                backgroundImage:
                  'linear-gradient(90deg,#F5C64F,#FFD97A,#F5C64F), repeating-linear-gradient(115deg,rgba(255,255,255,0.35) 0 8px,transparent 8px 18px)',
                backgroundBlendMode: 'overlay',
                animation: 'ai-bar-stripe 1.1s linear infinite',
              }}
            >
              <span
                aria-hidden
                className="absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                style={{ animation: 'ai-bar-sheen 1.8s ease-in-out infinite' }}
              />
            </div>
          </div>

          <ol className="mt-4 grid gap-1.5 sm:grid-cols-2 lg:grid-cols-3">
            {PROGRESS_STEPS.map((step, idx) => {
              const activeIdx = PROGRESS_STEPS.findIndex((s) => s.key === progressStep);
              const state = idx < activeIdx ? 'done' : idx === activeIdx ? 'active' : 'todo';
              return (
                <li
                  key={step.key}
                  className={`flex items-center gap-2 rounded-lg border px-2.5 py-1.5 text-[11.5px] transition-colors ${
                    state === 'done'
                      ? 'border-[#F5C64F]/40 bg-[#F5C64F]/10 text-[#2B3642]'
                      : state === 'active'
                        ? 'border-[#2B3642]/25 bg-white text-[#2B3642] font-semibold shadow-[0_0_0_1px_rgba(245,198,79,0.4)]'
                        : 'border-[hsl(var(--ink)/0.1)] text-[hsl(var(--ink-soft))]'
                  }`}
                >
                  <span
                    className={`inline-flex h-4 w-4 items-center justify-center rounded-full text-[9px] font-bold ${
                      state === 'todo' ? 'bg-[#2B3642]/10 text-[#2B3642]/50' : 'bg-[#F5C64F] text-[#2B3642]'
                    }`}
                  >
                    {state === 'done' ? <Check className="h-2.5 w-2.5" /> : idx + 1}
                  </span>
                  <span className="truncate">{step.label}</span>
                </li>
              );
            })}
          </ol>

          {progressLog.length > 0 && (
            <div className="relative mt-3 max-h-[110px] overflow-hidden rounded-lg bg-[#2B3642]/[0.04] px-3 py-2">
              <span className="absolute right-2 top-2 inline-flex items-center rounded-full border border-[#F5C64F]/60 bg-[#F5C64F]/15 px-2 py-0.5 text-[10px] font-bold text-[#2B3642] shadow-sm">
                예상 {(() => {
                  const totalSec = Math.max(20, numPages * 6 + 45);
                  const remaining = Math.max(0, Math.round(totalSec * (1 - Math.min(100, progress) / 100)));
                  const m = Math.floor(remaining / 60);
                  const s = remaining % 60;
                  return m > 0 ? `${m}분 ${s}초` : `${s}초`;
                })()}
              </span>
              {progressLog.map((line, i) => (
                <p
                  key={`${line}-${i}`}
                  className={`truncate text-[11px] leading-5 ${
                    i === progressLog.length - 1
                      ? 'text-[#2B3642] font-medium animate-text-blink'
                      : 'text-[hsl(var(--ink-soft))]'
                  }`}
                >
                  · {line}
                </p>
              ))}
        </div>
      )}

      {errorMessage && (
        <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[13px] font-bold text-red-600">분석 중 오류가 발생했습니다</p>
              <p className="mt-1 text-[12px] leading-5 text-red-500 break-keep">{errorMessage}</p>
            </div>
            <button
              type="button"
              onClick={() => setErrorMessage(null)}
              className="shrink-0 rounded-md px-2 py-1 text-[11px] font-medium text-red-400 hover:bg-red-100"
            >
              닫기
            </button>
          </div>
        </div>
      )}
        </div>
      )}


      {analysis && stage !== 'analyzing' && stage !== 'rendering' && (
        <div className="mt-6 space-y-5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: '인식 문항', value: `${analysis.problems.length}개` },
              { label: '객관식', value: `${analysis.objectiveQuestions}개` },
              { label: '서답형', value: `${analysis.subjectiveQuestions}개` },
              {
                label: '킬러문항',
                value: `${analysis.problems.filter((p) => p.isKiller || p.difficulty === 'very_hard').length}개`,
              },
            ].map((item) => (
              <div key={item.label} className="bg-white/80 border border-slate-900/10 rounded-xl px-4 py-3">
                <span className="editorial-kicker text-[9.5px] tracking-[0.3em]">{item.label}</span>
                <p className="font-display text-[22px] font-semibold text-[hsl(var(--ink))] tabular-nums leading-tight mt-0.5">
                  {item.value}
                </p>
              </div>
            ))}
          </div>


          <div className="flex justify-end">
            <Button
              type="button"
              onClick={handleApply}
              disabled={stage === 'applying'}
              className="bg-[#F5C64F] hover:bg-[#FFD666] text-[#2B3642] border-none font-bold rounded-full px-7 shadow-[0_8px_20px_rgba(245,198,79,0.3)]"
            >
              {stage === 'applying' ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Sparkles className="w-4 h-4 mr-2" />
              )}
              입력폼에 전체 반영
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExamPdfAnalyzer;
