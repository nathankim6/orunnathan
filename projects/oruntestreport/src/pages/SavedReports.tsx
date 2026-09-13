import React, { useEffect, useState, useMemo, type PointerEvent } from "react";
import { useNavigate } from "react-router-dom";
import { getReportCards, deleteReportCard } from "@/integrations/supabase/reportService";
import { getReportCardById, convertDbToAppFormat, ProblemType } from "@/integrations/supabase/reportService";
import StudentSubmissionsDialog from "@/components/StudentSubmissionsDialog";
import { ArrowLeft, Edit, Trash2, Plus, Eye, FileText, School, User, CalendarDays, Filter, ChevronRight, Users } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSchoolLogo } from "@/lib/schoolLogos";


type SavedReport = {
  id: string;
  school: string;
  grade: string;
  examScope: string;
  examInfo?: string;
  examDate?: string;
  teacher: string;
  teacher_photo?: string;
  created_at: string;
  updated_at: string;
  analysisType?: 'detailed' | 'simple';
};

export type ReportMeta = Pick<SavedReport, 'school' | 'grade' | 'examScope' | 'examInfo' | 'teacher' | 'created_at'>;

type GroupedReports = {
  [schoolType: string]: {
    [teacher: string]: SavedReport[];
  };
};

const EXAM_TYPES = [
  { value: "all", label: "전체 시험" },
  { value: "1학기 중간고사", label: "1학기 중간고사" },
  { value: "1학기 기말고사", label: "1학기 기말고사" },
  { value: "2학기 중간고사", label: "2학기 중간고사" },
  { value: "2학기 기말고사", label: "2학기 기말고사" },
];

const idx = (i: number) => ({ "--i": i } as React.CSSProperties);

/** 카드 위 조명이 마우스를 따라간다 */
const moveLight = (event: PointerEvent<HTMLElement>) => {
  if (event.pointerType !== "mouse") return;
  const box = event.currentTarget.getBoundingClientRect();
  event.currentTarget.style.setProperty("--light-x", `${event.clientX - box.left}px`);
  event.currentTarget.style.setProperty("--light-y", `${event.clientY - box.top}px`);
};

const SavedReports: React.FC = () => {
  const navigate = useNavigate();
  const [reports, setReports] = useState<SavedReport[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [teacherFilter, setTeacherFilter] = useState<string>("all");
  const [examFilter, setExamFilter] = useState<string>("all");
  const [yearFilter, setYearFilter] = useState<string>("all");
  const [submissionsReportId, setSubmissionsReportId] = useState<string | undefined>(undefined);
  const [submissionsReportMeta, setSubmissionsReportMeta] = useState<ReportMeta | undefined>(undefined);
  const [submissionsProblems, setSubmissionsProblems] = useState<ProblemType[]>([]);
  const [submissionsOpen, setSubmissionsOpen] = useState<boolean>(false);

  const fetchReports = async () => {
    setIsLoading(true);
    const {
      data,
      error
    } = await getReportCards();
    if (error) {
      toast.error("리포트를 불러오는데 실패했습니다: " + error.message);
      setIsLoading(false);
      return;
    }
    if (data) {
      const convertedReports = data.map(report => ({
        id: report.id,
        school: report.school,
        grade: report.grade,
        examScope: report.exam_scope,
        examInfo: report.exam_info,
        examDate: report.exam_date || undefined,
        teacher: report.teacher,
        teacher_photo: report.teacher_photo,
        created_at: report.created_at,
        updated_at: report.updated_at,
        analysisType: report.analysis_type as 'detailed' | 'simple' || 'detailed'
      }));
      setReports(convertedReports);
    }
    setIsLoading(false);
  };
  useEffect(() => {
    fetchReports();
  }, []);

  // Get unique teachers for filter
  const uniqueTeachers = useMemo(() => {
    const teachers = [...new Set(reports.map(r => r.teacher))];
    return teachers.sort();
  }, [reports]);

  // Get unique years (작성연도) from reports
  const uniqueYears = useMemo(() => {
    const years = [...new Set(reports.map(r => new Date(r.created_at).getFullYear().toString()))];
    return years.sort((a, b) => Number(b) - Number(a));
  }, [reports]);

  // Filter reports
  const filteredReports = useMemo(() => {
    return reports.filter(report => {
      const matchesTeacher = teacherFilter === "all" || report.teacher === teacherFilter;
      const matchesExam = examFilter === "all" || (report.examInfo && report.examInfo.includes(examFilter));
      const matchesYear = yearFilter === "all" || new Date(report.created_at).getFullYear().toString() === yearFilter;
      return matchesTeacher && matchesExam && matchesYear;
    });
  }, [reports, teacherFilter, examFilter, yearFilter]);

  const handleDelete = async (id: string) => {
    if (window.confirm("정말로 이 리포트를 삭제하시겠습니까?")) {
      const {
        error
      } = await deleteReportCard(id);
      if (error) {
        toast.error("리포트 삭제에 실패했습니다: " + error.message);
        return;
      }
      toast.success("리포트가 성공적으로 삭제되었습니다.");
      fetchReports();
    }
  };
  const handleView = (id: string) => {
    navigate(`/report/${id}`);
  };
  const handleEdit = (id: string) => {
    navigate(`/edit-report/${id}`);
  };
  const handleStudentSubmit = async (id: string) => {
    setSubmissionsReportId(id);
    setSubmissionsReportMeta(undefined);
    setSubmissionsProblems([]);
    setSubmissionsOpen(true);
    const { data, error } = await getReportCardById(id);
    if (error || !data) {
      toast.error("리포트를 불러오지 못했습니다");
      return;
    }
    const converted = convertDbToAppFormat(data);
    setSubmissionsReportMeta({
      school: converted.school,
      grade: converted.grade,
      examScope: converted.examScope,
      examInfo: converted.examInfo,
      teacher: converted.teacher,
      created_at: data.created_at,
    });

    setSubmissionsProblems((converted.problemTypes as ProblemType[]) || []);
  };
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "yyyy.MM.dd");
    } catch (e) {
      return "날짜 정보 없음";
    }
  };
  const getSchoolType = (school: string) => {
    const normalizedSchool = school.trim().toLowerCase();
    // Check high school first: 고등학교, 고등, 고교, or ends with "고"
    if (normalizedSchool.includes('고등') || normalizedSchool.includes('고교') || /고$/.test(normalizedSchool)) {
      return '고등부';
    }
    // Check middle school: 중학교, 중학, 중교, or ends with "중"
    if (normalizedSchool.includes('중학') || normalizedSchool.includes('중교') || /중$/.test(normalizedSchool)) {
      return '중등부';
    }
    return '기타';
  };
  const schoolTone = (schoolType: string) => (schoolType === '고등부' ? 'u-tile--gold' : schoolType === '중등부' ? 'u-tile--blue' : 'u-tile--violet');
  const schoolEyebrow = (schoolType: string) => (schoolType === '고등부' ? 'High School' : schoolType === '중등부' ? 'Middle School' : 'Other');

  // Group reports by school type and teacher
  const groupedReports: GroupedReports = filteredReports.reduce((groups, report) => {
    const schoolType = getSchoolType(report.school);
    const teacher = report.teacher;
    if (!groups[schoolType]) {
      groups[schoolType] = {};
    }
    if (!groups[schoolType][teacher]) {
      groups[schoolType][teacher] = [];
    }
    groups[schoolType][teacher].push(report);
    return groups;
  }, {} as GroupedReports);

  // Teacher summary grouped by school type (for category view when no teacher is selected)
  const teacherSummariesBySchoolType = useMemo(() => {
    const groups: Record<string, Map<string, { teacher: string; photo?: string; count: number; latest: string }>> = {
      '고등부': new Map(),
      '중등부': new Map(),
    };
    reports.forEach(r => {
      const schoolType = getSchoolType(r.school);
      if (!groups[schoolType]) return;
      const existing = groups[schoolType].get(r.teacher);
      if (existing) {
        existing.count += 1;
        if (new Date(r.created_at) > new Date(existing.latest)) existing.latest = r.created_at;
      } else {
        groups[schoolType].set(r.teacher, {
          teacher: r.teacher,
          photo: r.teacher_photo,
          count: 1,
          latest: r.created_at,
        });
      }
    });
    return {
      '고등부': Array.from(groups['고등부'].values()).sort((a, b) => b.count - a.count),
      '중등부': Array.from(groups['중등부'].values()).sort((a, b) => b.count - a.count),
    };
  }, [reports]);

  const showTeacherCategories = teacherFilter === "all";
  const hasFilter = teacherFilter !== "all" || examFilter !== "all" || yearFilter !== "all";

  if (isLoading) {
    return (
      <div className="u-page u-center">
        <div className="u-loader" role="status" aria-live="polite">
          <span className="u-loader-ring" aria-hidden="true" />
          <span className="u-eyebrow u-eyebrow--gold">Loading · Report Repository</span>
          <p>리포트를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="u-page">
      <div className="u-shell u-section">
        {/* 상단 바 */}
        <div className="u-topbar u-rise" style={idx(0)}>
          <button type="button" onClick={() => navigate("/")} className="u-btn u-btn--sm">
            <ArrowLeft aria-hidden="true" />
            돌아가기
          </button>
          <button type="button" onClick={() => navigate("/create-report")} className="u-btn u-btn--gold u-btn--sm">
            <Plus aria-hidden="true" />
            새 리포트 작성
          </button>
        </div>

        {/* 제목 */}
        <header className="u-page-head u-rise" style={idx(1)}>
          <span className="u-eyebrow u-eyebrow--rule u-eyebrow--gold" style={{ width: "min(420px, 100%)" }}>
            <i aria-hidden="true" />
            Report Repository
            <i aria-hidden="true" />
          </span>
          <h1 className="u-h1">저장된 리포트</h1>
          <p className="u-lede">
            총 <b>{reports.length}</b>개의 리포트가 보관되어 있습니다. 선생님을 고르면 해당 리포트만 모아 보여 드립니다.
          </p>
        </header>

        {/* 필터 */}
        <section className="u-panel u-panel--pad u-panel--gold u-rise" style={{ ...idx(2), marginBottom: 40 }} aria-label="리포트 필터">
          <div className="u-group-head" style={{ marginBottom: 16 }}>
            <span className="u-icon-tile" aria-hidden="true"><Filter /></span>
            <div>
              <span className="u-eyebrow u-eyebrow--gold">Filter</span>
              <h2 className="u-h3" style={{ marginTop: 6 }}>조건으로 찾기</h2>
            </div>
            {hasFilter && <span className="u-badge">{filteredReports.length}개 결과</span>}
          </div>
          <div className="u-field-grid u-field-grid--3">
            <div>
              <label className="u-label" htmlFor="filter-year">작성연도</label>
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger id="filter-year" className="u-input u-select">
                  <SelectValue placeholder="연도 선택" />
                </SelectTrigger>
                <SelectContent className="u-pop">
                  <SelectItem value="all">전체 연도</SelectItem>
                  {uniqueYears.map(year => (
                    <SelectItem key={year} value={year}>{year}년</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="u-label" htmlFor="filter-teacher">선생님별</label>
              <Select value={teacherFilter} onValueChange={setTeacherFilter}>
                <SelectTrigger id="filter-teacher" className="u-input u-select">
                  <SelectValue placeholder="선생님 선택" />
                </SelectTrigger>
                <SelectContent className="u-pop">
                  <SelectItem value="all">전체 선생님</SelectItem>
                  {uniqueTeachers.map(teacher => (
                    <SelectItem key={teacher} value={teacher}>{teacher} 선생님</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="u-label" htmlFor="filter-exam">시험별</label>
              <Select value={examFilter} onValueChange={setExamFilter}>
                <SelectTrigger id="filter-exam" className="u-input u-select">
                  <SelectValue placeholder="시험 선택" />
                </SelectTrigger>
                <SelectContent className="u-pop">
                  {EXAM_TYPES.map(exam => (
                    <SelectItem key={exam.value} value={exam.value}>{exam.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        {/* 빈 상태 */}
        {reports.length === 0 ? (
          <div className="u-panel u-panel--pad u-rise" style={{ ...idx(3), textAlign: "center", padding: "64px 24px" }}>
            <span className="u-icon-tile u-icon-tile--lg" aria-hidden="true"><FileText /></span>
            <h3 className="u-h2" style={{ marginTop: 20 }}>저장된 리포트가 없습니다</h3>
            <p className="u-lede" style={{ marginTop: 10 }}>리포트를 생성하여 저장해보세요.</p>
            <button type="button" onClick={() => navigate("/create-report")} className="u-btn u-btn--gold" style={{ marginTop: 28 }}>
              <Plus aria-hidden="true" />
              새 리포트 작성하기
            </button>
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="u-panel u-panel--pad u-rise" style={{ ...idx(3), textAlign: "center", padding: "64px 24px" }}>
            <span className="u-icon-tile u-icon-tile--lg" aria-hidden="true"><Filter /></span>
            <h3 className="u-h2" style={{ marginTop: 20 }}>필터에 맞는 리포트가 없습니다</h3>
            <p className="u-lede" style={{ marginTop: 10 }}>다른 조건으로 검색해보세요.</p>
            <button
              type="button"
              onClick={() => { setTeacherFilter("all"); setExamFilter("all"); setYearFilter("all"); }}
              className="u-btn"
              style={{ marginTop: 28 }}
            >
              필터 초기화
            </button>
          </div>
        ) : showTeacherCategories ? (
          /* 선생님 카테고리 — 학교급별 */
          <div className="u-stack" style={{ display: "grid", gap: 48 }}>
            {['고등부', '중등부'].map((schoolType, gi) => {
              const teachers = teacherSummariesBySchoolType[schoolType] || [];
              if (teachers.length === 0) return null;
              return (
                <section key={schoolType} className="u-rise" style={idx(3 + gi)} aria-label={`${schoolType} 선생님`}>
                  <div className="u-group-head">
                    <span className={`u-icon-tile ${schoolTone(schoolType)}`} aria-hidden="true"><User /></span>
                    <div>
                      <span className="u-eyebrow">{schoolEyebrow(schoolType)} · Teachers</span>
                      <h2 className="u-h2" style={{ marginTop: 6 }}>{schoolType} 리포트</h2>
                    </div>
                    <span className="u-badge u-badge--dim">{teachers.length}명</span>
                  </div>
                  <div className="u-grid-cards">
                    {teachers.map((t) => (
                      <button
                        key={t.teacher}
                        type="button"
                        onClick={() => setTeacherFilter(t.teacher)}
                        onPointerMove={moveLight}
                        className={`u-tile u-tile--row ${schoolTone(schoolType)}`}
                      >
                        <span className="u-tile-accent" aria-hidden="true" />
                        <span className="u-tile-glyph" aria-hidden="true">{/^[A-Za-z]/.test(t.teacher) ? t.teacher.substring(0, 1).toUpperCase() : schoolType === '고등부' ? 'H' : 'M'}</span>
                        <Avatar className="h-14 w-14 rounded-full ring-1 ring-white/15 shrink-0">
                          <AvatarImage src={t.photo || undefined} alt={t.teacher} className="object-cover" />
                          <AvatarFallback className="bg-[hsl(var(--u-navy))] text-[hsl(var(--u-gold))] text-base font-bold rounded-full">
                            {t.teacher.substring(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="u-tile-content">
                          <h3>{t.teacher} 선생님</h3>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                            <span className="u-badge">{t.count}개 리포트</span>
                            <span className="u-cap">{schoolType}</span>
                          </div>
                          <p className="u-cap" style={{ marginTop: 6 }}>최근 {formatDate(t.latest)}</p>
                        </div>
                        <ChevronRight aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        ) : (
          /* 선택한 선생님의 리포트 — 학교급별 */
          <div style={{ display: "grid", gap: 56 }}>
            <div>
              <button type="button" onClick={() => setTeacherFilter("all")} className="u-btn u-btn--ghost u-btn--sm" style={{ marginLeft: -12 }}>
                <ArrowLeft aria-hidden="true" />
                선생님 목록으로
              </button>
            </div>
            {Object.entries(groupedReports).map(([schoolType, teacherGroups], gi) => {
              const schoolReports = Object.values(teacherGroups).flat();
              return (
                <section key={schoolType} className="u-rise" style={idx(gi)} aria-label={`${schoolType} 리포트`}>
                  <div className="u-group-head" style={{ marginBottom: 24 }}>
                    <span className={`u-icon-tile ${schoolTone(schoolType)}`} aria-hidden="true"><School /></span>
                    <div>
                      <span className="u-eyebrow">{schoolEyebrow(schoolType)}</span>
                      <h2 className="u-h2" style={{ marginTop: 6 }}>{schoolType}</h2>
                    </div>
                    <span className="u-badge u-badge--dim">{schoolReports.length}개 리포트</span>
                  </div>

                  <div className="u-grid-cards">
                    {schoolReports.map(report => {
                      const logo = getSchoolLogo(report.school);
                      return (
                        <article key={report.id} className={`u-panel u-panel--pad ${schoolType === '고등부' ? 'u-panel--gold' : 'u-panel--blue'}`} style={{ padding: 22 }}>
                          <div style={{ display: "flex", alignItems: "flex-start", gap: 14, marginBottom: 16 }}>
                            <Avatar className="h-12 w-12 rounded-full ring-1 ring-white/15 shrink-0">
                              <AvatarImage src={report.teacher_photo || undefined} alt={report.teacher} className="object-cover" />
                              <AvatarFallback className="bg-[hsl(var(--u-navy))] text-[hsl(var(--u-gold))] text-sm font-bold rounded-full">
                                {report.teacher.substring(0, 2)}
                              </AvatarFallback>
                            </Avatar>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <span className="u-eyebrow">Teacher</span>
                              <h4 className="u-h3" style={{ marginTop: 4, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                {report.teacher} 선생님
                              </h4>
                            </div>
                            <span className={`u-badge ${report.analysisType === 'simple' ? 'u-badge--dim' : ''}`}>
                              {report.analysisType === 'simple' ? '간단분석' : '상세분석'}
                            </span>
                          </div>

                          <div style={{ display: "flex", alignItems: "stretch", gap: 12, marginBottom: 18 }}>
                            {logo && (
                              <div className="u-photo-frame" style={{ width: 56, height: 56, display: "flex", alignItems: "center", justifyContent: "center", alignSelf: "center", flexShrink: 0 }}>
                                <img src={logo} alt={`${report.school} 로고`} style={{ width: "100%", height: "100%", objectFit: "contain" }} onError={(e) => { (e.currentTarget.closest('.u-photo-frame') as HTMLElement | null)?.setAttribute('hidden', ''); }} />
                              </div>
                            )}
                            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 6, minWidth: 0, flex: 1 }}>
                              <span className="u-badge u-badge--blue" style={{ width: "fit-content" }}>
                                {logo && <img src={logo} alt="" onError={(e) => { e.currentTarget.hidden = true; }} />}
                                {report.school}{report.grade}
                              </span>
                              <p style={{ margin: 0, fontWeight: 700, fontSize: 15, lineHeight: 1.4, color: "hsl(var(--u-ink))" }}>
                                {report.examInfo || "시험 분석 리포트"}
                              </p>
                            </div>
                            <div className="u-cap" style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", justifyContent: "center", gap: 4, flexShrink: 0 }}>
                              <CalendarDays size={14} style={{ color: "hsl(var(--u-gold))" }} aria-hidden="true" />
                              <span>{formatDate(report.created_at)}</span>
                            </div>
                          </div>

                          <div style={{ display: "flex", gap: 8, paddingTop: 16, borderTop: "1px solid hsl(var(--u-line) / .12)" }}>
                            <button type="button" onClick={() => handleView(report.id)} className="u-btn u-btn--gold u-btn--sm" style={{ flex: 1 }}>
                              <Eye aria-hidden="true" />
                              분석지 확인
                            </button>
                            <button type="button" onClick={() => handleEdit(report.id)} className="u-btn u-btn--sm" style={{ flex: 1 }}>
                              <Edit aria-hidden="true" />
                              수정
                            </button>
                            <button type="button" onClick={() => handleDelete(report.id)} className="u-btn u-btn--sm u-btn--icon u-btn--danger" aria-label="리포트 삭제" title="리포트 삭제" style={{ width: 40 }}>
                              <Trash2 aria-hidden="true" />
                            </button>
                          </div>
                          <button type="button" onClick={() => handleStudentSubmit(report.id)} className="u-btn u-btn--xs u-btn--block" style={{ marginTop: 8, borderColor: "hsl(var(--u-gold) / .45)", color: "hsl(var(--u-gold))" }}>
                            <Users aria-hidden="true" />
                            학생 성적 제출
                          </button>
                        </article>
                      );
                    })}
                  </div>
                </section>
              );
            })}
          </div>
        )}
      </div>
      <StudentSubmissionsDialog
        open={submissionsOpen}
        onOpenChange={setSubmissionsOpen}
        reportId={submissionsReportId}
        reportMeta={submissionsReportMeta}
        problems={submissionsProblems}
      />
    </div>
  );
};
export default SavedReports;
