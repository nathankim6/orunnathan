import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { getReportCardById, convertDbToAppFormat, ReportHighlight } from "@/integrations/supabase/reportService";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { captureElement } from "@/utils/captureUtils";
import AreaSelector from "@/components/AreaSelector";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ThemeType, themeColorMap, getSchoolThemeColor } from "@/utils/themeColorUtils";
import { addHighlightStyles, removeHighlightStyles } from "@/utils/highlightUtils";
import ReportToolbar from "@/components/ReportToolbar";
import FloatingThemeToggle from "@/components/FloatingThemeToggle";
import ReportHeader from "@/components/ReportHeader";
import ReportKpiRail from "@/components/ReportKpiRail";
import TypeDonutSection from "@/components/TypeDonutSection";
import ItemMapSection from "@/components/ItemMapSection";
import DifficultySection from "@/components/DifficultySection";
import AppendixSection from "@/components/AppendixSection";
import TeacherOverallSection from "@/components/TeacherOverallSection";
import LevelStrategySection from "@/components/LevelStrategySection";
import { computeReportStats, parseOverallEvaluation, parseTiers } from "@/lib/reportStats";
import { waitForFonts, getReportFontCss, nextFrames } from "@/lib/captureFonts";
import DifficultProblemsExplanation from "@/components/DifficultProblemsExplanation";
import HitQuestionPhotos from "@/components/HitQuestionPhotos";
import ExamFeaturesSection from "@/components/ExamFeaturesSection";
import KillerTop5Section from "@/components/KillerTop5Section";
import PassageVariantSection from "@/components/PassageVariantSection";
import type { ExamFeature, KillerProblem, PassageVariant } from "@/integrations/supabase/reportService";


import ReportFooter from "@/components/ReportFooter";
import useHighlights from "@/hooks/useHighlights";
import useCapture from "@/hooks/useCapture";
import useKeyboardShortcuts from "@/hooks/useKeyboardShortcuts";
import { getSchoolLogo } from "@/lib/schoolLogos";
import { useLogoBannerTheme } from "@/lib/logoColor";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import { toJpeg } from "html-to-image";
import { Users } from "lucide-react";
import StudentSubmissionsDialog from "@/components/StudentSubmissionsDialog";

type ReportDataType = {
  id?: string;
  school: string;
  grade: string;
  examScope: string;
  teacher: string;
  teacherPhoto?: string;
  totalQuestions: number;
  objectiveQuestions: number;
  subjectiveQuestions: number;
  problemTypes: {
    id: string;
    name: string;
    category: string;
    questionType: 'objective' | 'subjective';
    difficulty: 'easy' | 'medium' | 'hard' | 'very_hard';
  }[];
  overallEvaluation?: string;
  difficultProblemsExplanation?: string;
  examInfo?: string;
  examFeatures?: ExamFeature[];
  killerTop5?: KillerProblem[];
  originalPassages?: string;
  passageVariants?: PassageVariant[];

  highlights?: Array<ReportHighlight>;

  hitQuestionPhotos?: Array<{
    url: string;
    problemNumber?: number;
    problemName?: string;
    selectedArea?: {
      x: number;
      y: number;
      width: number;
      height: number;
    };
  }>;
  analysisType?: 'detailed' | 'simple';
};

const Report: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id?: string }>();
  const [reportData, setReportData] = useState<ReportDataType | null>(null);
  const [theme, setTheme] = useState<ThemeType>('blue');
  // 사용자가 수동으로 테마를 오버라이드했는지 추적 — true면 자동 매핑이 덮어쓰지 않음
  const [themeOverridden, setThemeOverridden] = useState<boolean>(false);

  const handleThemeChange = useCallback((next: ThemeType) => {
    setTheme(next);
    setThemeOverridden(true);
  }, []);

  // 학년/학교 자동 매핑 — 수동 오버라이드가 없을 때만 적용
  const applyAutoTheme = useCallback((school: string, grade: string) => {
    if (themeOverridden) return;
    const { color } = getSchoolThemeColor(school, grade);
    setTheme(color as ThemeType);
  }, [themeOverridden]);
  const [date] = useState<string>(new Date().toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }));
  const [isLoaded, setIsLoaded] = useState(false);
  const reportContainerRef = useRef<HTMLDivElement>(null);
  const themeColors = themeColorMap[theme];
  // 학교 로고에서 추출한 헤더 배너 컬러 — 리포트 테두리에도 동일 적용
  const banner = useLogoBannerTheme(getSchoolLogo(reportData?.school || ''));
  const [reportTitle, setReportTitle] = useState<string>("");
  const [submissionsOpen, setSubmissionsOpen] = useState(false);
  
  const {
    highlights,
    highlightColor,
    setHighlightColor,
    saveHighlights,
    loadHighlights,
    restoreHighlights,
    addHighlight,
    removeHighlight
  } = useHighlights(id);

  const {
    handleCaptureReport,
    handleVisibleAreaCapture,
    handleScrollCapture,
    handleAreaSelectionComplete
  } = useCapture(reportData);

  // Use keyboard shortcuts hook
  useKeyboardShortcuts({
    highlights,
    highlightColor,
    addHighlight,
    removeHighlight
  });

  const handlePrintPDF = () => {
    toast.info("인쇄 창에서 'PDF로 저장'을 선택하시면 화면과 동일하게 저장됩니다.", {
      duration: 5000
    });
    setTimeout(() => {
      window.print();
    }, 600);
  };

  /**
   * 개발 모드 넘침 검출 — 격자에서 넘침은 잘림이 아니라 이웃 모듈 위에 겹쳐
   * 찍힌다. 캡처 전에 모듈마다 자손이 모듈 오른쪽 변을 넘는지 본다.
   */
  const warnOverflow = (root: HTMLElement) => {
    root.querySelectorAll<HTMLElement>('.ig-module').forEach((mod) => {
      const box = mod.getBoundingClientRect();
      const title = mod.querySelector('.ig-h')?.textContent?.trim().slice(0, 20) || mod.className;
      mod.querySelectorAll<HTMLElement>('*').forEach((el) => {
        if (el.classList.contains('capture-hide') || el.closest('.capture-hide')) return;
        const r = el.getBoundingClientRect();
        if (r.width === 0) return;
        if (el.scrollWidth > el.clientWidth + 1 && getComputedStyle(el).overflowX === 'visible') {
          console.warn('[ig-overflow] scroll', title, el.className);
        } else if (r.right > box.right + 1) {
          console.warn('[ig-overflow] right', title, el.className, Math.round(r.right - box.right));
        }
      });
    });
  };

  const handleDownloadPDF = async () => {
    if (!reportContainerRef.current) return;
    const target = reportContainerRef.current;
    const toastId = toast.loading("PDF 생성 중입니다...");
    const themed = target.closest<HTMLElement>('[data-theme]');
    const prevTheme = themed?.getAttribute('data-theme') ?? null;
    const prevWidth = target.style.width;
    const prevMaxWidth = target.style.maxWidth;
    const restoreImgs: { img: HTMLImageElement; src: string }[] = [];
    try {
      // 1) 판 폭을 1024 로 고정한다. 창이 좁으면 좁게 찍혀 모자이크 칸이 넘친다.
      //    캡처·인쇄는 항상 라이트다.
      themed?.setAttribute('data-theme', 'light');
      target.style.width = '1024px';
      target.style.maxWidth = 'none';

      // 2) 다른 출처의 사진(강사 사진·업로드 사진)은 캡처가 못 읽는다.
      //    먼저 받아 data URL 로 바꿔 넣고, 끝나면 되돌린다.
      let failed = 0;
      const imgs = Array.from(target.querySelectorAll('img'));
      await Promise.all(imgs.map(async (img) => {
        try {
          if (!img.src || img.src.startsWith('data:')) return;
          const u = new URL(img.src, location.href);
          if (u.origin === location.origin) return;
          const res = await fetch(u.toString(), { mode: 'cors' });
          if (!res.ok) throw new Error(String(res.status));
          const blob = await res.blob();
          const dataUrl = await new Promise<string>((resolve, reject) => {
            const fr = new FileReader();
            fr.onload = () => resolve(String(fr.result));
            fr.onerror = () => reject(fr.error);
            fr.readAsDataURL(blob);
          });
          restoreImgs.push({ img, src: img.src });
          img.src = dataUrl;
        } catch {
          failed += 1;
        }
      }));

      // 3) 서체·이미지가 다 준비되고 재배치가 끝난 뒤에 찍는다.
      await waitForFonts();
      await Promise.all(imgs.map((i) => (typeof i.decode === 'function' ? i.decode().catch(() => undefined) : Promise.resolve())));
      await nextFrames(2);
      if (import.meta.env.DEV) warnOverflow(target);

      const fontEmbedCSS = await getReportFontCss(target);
      const w = target.scrollWidth;
      const h = target.scrollHeight;

      // 4) JPEG 로 받는다. jsPDF 는 PNG 를 순수 JS 로 풀기 때문에 2048×13000 이면
      //    수십 초가 걸리고 파일이 80MB 를 넘었다. JPEG 0.95 는 수 MB 다.
      const dataUrl = await toJpeg(target, {
        quality: 0.95,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        width: w,
        height: h,
        fontEmbedCSS,
        cacheBust: false,
        style: { width: '1024px', transform: 'none' },
        filter: (node) => {
          if (node instanceof HTMLElement) {
            if (node.hasAttribute('data-comment-empty-actions')) return false;
            if (node.hasAttribute('data-comment-actions')) return false;
            // 화면 전용 요소는 PDF 에 넣지 않는다. 이미지 캡처 쪽(captureUtils)과 같은 규칙.
            if (node.classList.contains('capture-hide')) return false;
            if (node.classList.contains('print:hidden')) return false;
            if (node.dataset.captureHide !== undefined) return false;
          }
          return true;
        },
      });

      // 5) 페이지 크기는 css px 다(이미지 픽셀이 아니다). 이미지 픽셀로 잡으면
      //    높이가 Acrobat 한계(14,400pt)에 닿는다.
      const pdf = new jsPDF({
        orientation: h > w ? 'p' : 'l',
        unit: 'px',
        format: [w, h],
        hotfixes: ['px_scaling'],
      });
      pdf.addImage(dataUrl, 'JPEG', 0, 0, w, h);
      pdf.save(`${reportTitle || 'report'}.pdf`);

      if (failed > 0) toast.warning(`사진 ${failed}장을 PDF에 넣지 못했습니다.`);
      toast.success("PDF가 저장되었습니다.", { id: toastId });
    } catch (e) {
      console.error('PDF 생성 실패:', e);
      toast.error("PDF 생성에 실패했습니다.", { id: toastId });
    } finally {
      target.style.width = prevWidth;
      target.style.maxWidth = prevMaxWidth;
      if (prevTheme) themed?.setAttribute('data-theme', prevTheme);
      restoreImgs.forEach(({ img, src }) => { img.src = src; });
    }
  };

  // Load report data and set theme based on school/grade
  useEffect(() => {
    const loadReportData = async () => {
      if (id) {
        const { data, error } = await getReportCardById(id);
        if (error) {
          toast.error("리포트 데이터를 불러오는데 실패했습니다: " + error.message);
          navigate("/saved-reports");
          return;
        }
        if (data) {
          const reportData = convertDbToAppFormat(data);
          // 학교명 뒤에 붙은 숫자(예: 1, 2) 제거
          reportData.school = reportData.school.replace(/\d+$/, '').trim();
          console.log('Loaded report data:', reportData);
          setReportData(reportData as unknown as ReportDataType);
          
          // Generate report title
          const title = `${reportData.school} ${reportData.grade} ${reportData.examScope} 분석리포트`;
          setReportTitle(title);
          
          // Automatically set theme based on school and grade (수동 오버라이드 없을 때만)
          applyAutoTheme(reportData.school, reportData.grade);
          
          // Set default values for missing data to prevent empty sections
          if (!reportData.difficultProblemsExplanation || reportData.difficultProblemsExplanation.trim() === '') {
            reportData.difficultProblemsExplanation = "현재 시험은 기본적인 문제 유형으로 구성되어 있어 일반적인 학습 방법을 통해 충분히 대비할 수 있습니다.";
          }
          
          if (!reportData.examInfo || reportData.examInfo.trim() === '') {
            reportData.examInfo = "중간고사";
          }
          
          if (!reportData.hitQuestionPhotos || reportData.hitQuestionPhotos.length === 0) {
            reportData.hitQuestionPhotos = [];
          }

          // Set default teacher if missing
          if (!reportData.teacher || reportData.teacher.trim() === '') {
            reportData.teacher = "미정";
          }

          // Set default overall evaluation if missing
          if (!reportData.overallEvaluation || reportData.overallEvaluation.trim() === '') {
            const defaultEval = [
              {
                category: '종합 평가',
                evaluation: '문제 난이도는 평이했으며, 기본 개념을 잘 이해하고 있다면 충분히 해결할 수 있는 문제들로 구성되어 있습니다.'
              },
              {
                category: '학습 난이도',
                evaluation: '중간 수준의 난이도로, 기본 개념을 충실히 학습한 학생이라면 쉽게 해결할 수 있습니다.'
              },
              {
                category: '시험 유형',
                evaluation: '다양한 유형의 문제가 골고루 출제되었으며, 기본적인 영어 능력을 평가하기에 적합합��다.'
              }
            ];
            reportData.overallEvaluation = JSON.stringify(defaultEval);
          }

          setTimeout(() => {
            setIsLoaded(true);
          }, 100);
          return;
        }
      }
      
      const storedData = localStorage.getItem("examReportData");
      if (!storedData) {
        toast.error("리포트 데이터를 찾을 수 없습니다. 새로운 분석을 생성해주세요.");
        navigate("/");
        return;
      }
      
      try {
        const parsedData = JSON.parse(storedData);
        setReportData(parsedData);
        
        // Generate report title
        const title = `${parsedData.school} ${parsedData.grade} ${parsedData.examScope} 분석리포트`;
        setReportTitle(title);
        
        // Automatically set theme based on school and grade (수동 오버라이드 없을 때만)
        applyAutoTheme(parsedData.school, parsedData.grade);
        
        // Set default values for missing data
        if (!parsedData.difficultProblemsExplanation || parsedData.difficultProblemsExplanation.trim() === '') {
          parsedData.difficultProblemsExplanation = "현재 시험은 기본적인 문제 유형으로 구성되어 있어 일반적인 학습 방법을 통해 충분히 대비할 수 있습니다.";
        }
        
        if (!parsedData.examInfo || parsedData.examInfo.trim() === '') {
          parsedData.examInfo = "중간고사";
        }

        // Set default teacher if missing
        if (!parsedData.teacher || parsedData.teacher.trim() === '') {
          parsedData.teacher = "미정";
        }

        // Set default overall evaluation if missing
        if (!parsedData.overallEvaluation || parsedData.overallEvaluation.trim() === '') {
          const defaultEval = [
            {
              category: '종합 평가',
              evaluation: '문제 난이도는 평이했으며, 기본 개념을 잘 이해하고 있다면 충분히 해결할 수 있는 문제들로 구성되어 있습니다.'
            },
            {
              category: '학습 난이도',
              evaluation: '중간 수준의 난이도로, 기본 개념을 충실히 학습한 학생이라면 쉽게 해결할 수 있습니다.'
            },
            {
              category: '시험 유형',
              evaluation: '다양한 유형의 문제가 골고루 출제되었으며, 기본적인 영어 능력을 평가하기에 적합합니다.'
            }
          ];
          parsedData.overallEvaluation = JSON.stringify(defaultEval);
        }
        
        setTimeout(() => {
          setIsLoaded(true);
        }, 100);
      } catch (error) {
        console.error("Failed to parse report data:", error);
        toast.error("리포트 데이터를 불러오는데 실패했습니다.");
        navigate("/");
      }
    };
    
    loadReportData();
  }, [navigate, id]);

  // Load highlights when report data is loaded
  useEffect(() => {
    if (id && reportData) {
      loadHighlights();
    }
  }, [id, reportData, loadHighlights]);

  // Add CSS for highlights to the component
  useEffect(() => {
    addHighlightStyles();
    return () => {
      removeHighlightStyles();
    };
  }, []);

  // Apply highlights after the component has loaded and when highlights change
  useEffect(() => {
    if (isLoaded && reportContainerRef.current) {
      // Give a short delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        console.log('Running restoreHighlights after delay');
        restoreHighlights(reportContainerRef.current);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isLoaded, restoreHighlights]);

  if (!reportData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
        <div className="relative w-20 h-20">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-violet-500 rounded-full opacity-75 group-hover:opacity-100 animate-pulse"></div>
          <div className="absolute inset-0 rounded-full border-t-4 border-blue-600 animate-spin"></div>
          <div className="absolute inset-2 rounded-full border-t-4 border-indigo-500 animate-spin animation-delay-150"></div>
          <div className="absolute inset-4 rounded-full border-t-4 border-violet-400 animate-spin animation-delay-300"></div>
        </div>
        <p className="mt-6 text-xl text-indigo-900 font-medium">리포트 데이터 로딩 중...</p>
        <p className="text-sm text-indigo-600/70">잠시만 기다려주세요</p>
      </div>
    );
  }

  // 숫자의 단일 출처 — 화면의 모든 모듈은 이 값만 본다.
  const igStats = computeReportStats(reportData.problemTypes as any, {
    total: reportData.totalQuestions,
    objective: reportData.objectiveQuestions,
    subjective: reportData.subjectiveQuestions,
  });
  const evalParts = parseOverallEvaluation(reportData.overallEvaluation);
  const tiers = parseTiers(evalParts.strategy);
  const featureCount = (reportData.examFeatures || []).filter((f) => f.title?.trim() || f.detail?.trim()).length;
  const killerCount = (reportData.killerTop5 || []).filter((it) => it.number?.trim() || it.title?.trim() || it.reason?.trim()).length;
  const passageCount = (reportData.passageVariants || []).filter((v) => v && (v.originalText || v.examText || v.changeDetail)).length;
  const showDetail =
    reportData.school.includes('고등학교') || reportData.grade.includes('고') ||
    (!reportData.school.includes('고등학교') && !reportData.grade.includes('고') && reportData.analysisType === 'detailed');
  
  // Ensure gradient consistency for all school types
  const gradient = `from-${theme}-50 via-${theme}-50/30 to-${theme}-50/10`;
  
  const hasDifficultProblems = reportData.problemTypes.some(
    type => type.difficulty === 'hard' || type.difficulty === 'very_hard'
  );

  // Parse the overall evaluation data
  let parsedEvaluations = [];
  try {
    if (reportData.overallEvaluation) {
      parsedEvaluations = JSON.parse(reportData.overallEvaluation);
      
      // Filter out categories with empty evaluations
      parsedEvaluations = parsedEvaluations.filter((item: any) => 
        item.evaluation && item.evaluation.trim() !== ''
      );
      
      // If we ended up with no evaluations, add a default one
      if (parsedEvaluations.length === 0) {
        parsedEvaluations = [{
          category: '종합 평가',
          evaluation: '문제 난이도는 평이했으며, 기본 개념을 잘 이해하고 있다면 충분히 해결할 수 있는 문제들로 구성되어 있습니다.'
        }];
      }
    } else {
      // If no evaluation at all, add a default one
      parsedEvaluations = [{
        category: '종합 평가',
        evaluation: '문제 난이도는 평이했으며, 기본 개념을 잘 이해하고 있다면 충분히 해결할 수 있는 문제들로 구성되어 있습니다.'
      }];
    }
    
    // Update report data with parsed evaluations
    reportData.overallEvaluation = JSON.stringify(parsedEvaluations);
    
  } catch (e) {
    console.error('Error parsing overall evaluation:', e);
    // Create a default evaluation
    parsedEvaluations = [{
      category: '종합 평가',
      evaluation: '문제 난이도는 평이했으며, 기본 개념을 잘 이해하고 있다면 충분히 해결할 수 있는 문제들로 구성되어 있습니다.'
    }];
    reportData.overallEvaluation = JSON.stringify(parsedEvaluations);
  }

  return (
    <div 
      data-theme={theme}
      className="min-h-screen bg-[hsl(var(--paper-warm))] py-10 px-4 print:bg-white print:py-0 relative" 
      style={{
        '--theme-primary': themeColors.primary,
        '--theme-secondary': themeColors.secondary,
        '--theme-tertiary': themeColors.tertiary,
        '--theme-accent': themeColors.accent,
        '--theme-light': themeColors.light,
        '--theme-vibrant': themeColors.vibrant,
        '--theme-pastel': themeColors.pastel,
        '--theme-accent2': themeColors.accent2,
        '--theme-highlight': themeColors.highlight,
      } as React.CSSProperties}
    >
      <div 
        className={`w-full max-w-5xl mx-auto transition-all duration-700 relative z-10 ${
          isLoaded ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}
      >
        <ReportToolbar 
          onNavigateBack={() => navigate("/saved-reports")}
          onPrintPDF={handlePrintPDF}
          theme={theme}
          onThemeChange={handleThemeChange}
          highlightColor={highlightColor}
          setHighlightColor={setHighlightColor}
          themeColors={themeColors}
          title={reportTitle}
        />

        <div
          ref={reportContainerRef}
          className="report-container ig-sheet print:shadow-none print:border-none print:outline-none flex flex-col"
          style={{
            borderTop: `4px solid ${banner.mid}`,
            boxShadow: '0 1px 2px hsl(var(--ink) / 0.06), 0 18px 44px -30px hsl(var(--ink) / 0.35)',
          }}
        >
          <div className="ig-stack">
            <ReportHeader
              className="ig-span-6"
              date={date}
              schoolName={reportData.school}
              grade={reportData.grade}
              examInfo={reportData.examInfo}
              teacher={reportData.teacher}
              examScope={reportData.examScope}
              stats={igStats}
              problems={reportData.problemTypes as any}
            />

            {/* what — 무엇이 나왔나 */}
            <ReportKpiRail className="ig-span-4" stats={igStats} />
            <TypeDonutSection className="ig-span-2-side" stats={igStats} />
            <ItemMapSection className="ig-span-4" stats={igStats} problems={reportData.problemTypes as any} />
            <DifficultySection className="ig-span-2-side" stats={igStats} />

            {/* where — 어디서 갈렸나. 고등부는 항상, 중등부는 상세 분석에서만 */}
            {showDetail && (
              <>
                <ExamFeaturesSection className={killerCount > 0 ? 'ig-span-3' : 'ig-span-6'} features={reportData.examFeatures} />
                <KillerTop5Section className={featureCount > 0 ? 'ig-span-3' : 'ig-span-6'} items={reportData.killerTop5} />
                <PassageVariantSection className="ig-span-6" items={reportData.passageVariants || []} />
                {featureCount === 0 && (
                  <DifficultProblemsExplanation
                    className="ig-span-6"
                    explanation={reportData.difficultProblemsExplanation}
                    hasDifficultProblems={hasDifficultProblems}
                    themeColors={themeColors}
                  />
                )}
                {(reportData.hitQuestionPhotos?.length ?? 0) > 0 && (
                  <HitQuestionPhotos
                    className="ig-span-6 ig-module-tall"
                    photos={reportData.hitQuestionPhotos}
                    themeColors={themeColors}
                    reportId={id}
                  />
                )}
              </>
            )}

            {/* next — 무엇을 할 것인가 */}
            <TeacherOverallSection
              className={tiers ? 'ig-span-3' : 'ig-span-6'}
              teacher={reportData.teacher}
              teacherPhoto={reportData.teacherPhoto}
              overall={evalParts.overall}
              strategyFallback={!tiers ? evalParts.strategy : undefined}
            />
            {tiers && <LevelStrategySection className="ig-span-3" tiers={tiers} />}

            {/* 부록 */}
            <AppendixSection className="ig-span-6 ig-module-tall" stats={igStats} problems={reportData.problemTypes as any} reportId={id} />

            <ReportFooter className="ig-span-6" stats={igStats} passageCount={passageCount} date={date} teacher={reportData.teacher} />
          </div>

        </div>
      </div>

      {/* PDF 다운로드 플로팅 버튼 */}
      <Button
        onClick={handleDownloadPDF}
        size="lg"
        className="fixed bottom-8 right-8 z-[9999] shadow-2xl print:hidden gap-2 px-6 py-6 text-base font-bold rounded-full border-2"
        style={{
          background:
            'linear-gradient(135deg, hsl(var(--gold)), hsl(var(--gold-deep)))',
          color: 'hsl(var(--paper))',
          borderColor: 'hsl(var(--gold-soft))',
        }}
      >
        <Download className="h-5 w-5" />
        PDF 다운로드
      </Button>

      {/* 학생 제출 플로팅 버튼 */}
      {id && (
        <Button
          onClick={() => setSubmissionsOpen(true)}
          size="lg"
          variant="outline"
          className="fixed bottom-8 right-[15.5rem] z-[9999] shadow-2xl print:hidden gap-2 px-6 py-6 text-base font-bold rounded-full border-2 bg-white"
        >
          <Users className="h-5 w-5" />
          학생 제출
        </Button>
      )}

      {id && (
        <StudentSubmissionsDialog
          open={submissionsOpen}
          onOpenChange={setSubmissionsOpen}
          reportId={id}
          problems={reportData.problemTypes as any}
        />
      )}

      {/* 우상단 플로팅 테마 토글 */}
      <FloatingThemeToggle
        currentTheme={theme}
        onThemeChange={handleThemeChange}
        isOverridden={themeOverridden}
      />
    </div>
  );
};

export default Report;
