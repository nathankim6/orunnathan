import React, { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { convertDbToAppFormat, ReportCardData } from "@/integrations/supabase/reportService";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Check, X, Minus, Loader2 } from "lucide-react";
import {
  AnswerStatus,
  SubmissionAnswer,
  submitStudentAnswers,
} from "@/hooks/useStudentSubmissions";

const idx = (i: number) => ({ "--i": i } as React.CSSProperties);

/**
 * 학생 자가 채점 — 학생이 휴대폰으로 연다.
 * 은하 무대는 'subtle' 로 낮추고, 터치 표적은 44px 이상으로 잡는다.
 */
const StudentSubmit: React.FC = () => {
  const { reportId } = useParams<{ reportId: string }>();
  const [report, setReport] = useState<ReportCardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);

  const [school, setSchool] = useState("");
  const [grade, setGrade] = useState("");
  const [name, setName] = useState("");
  const [score, setScore] = useState<string>("");
  const [statuses, setStatuses] = useState<Record<string, AnswerStatus>>({});
  const [reasons, setReasons] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!reportId) return;
    (async () => {
      const { data, error } = await supabase
        .from("report_cards")
        .select("*")
        .eq("id", reportId)
        .maybeSingle();
      if (error || !data) {
        toast.error("리포트를 찾을 수 없습니다.");
        setLoading(false);
        return;
      }
      const converted = convertDbToAppFormat(data);
      setReport(converted);
      setSchool(converted.school || "");
      setGrade(converted.grade || "");
      const initial: Record<string, AnswerStatus> = {};
      converted.problemTypes.forEach((p) => {
        initial[p.id] = "correct";
      });
      setStatuses(initial);
      setLoading(false);
    })();
  }, [reportId]);

  const sortedProblems = useMemo(() => {
    if (!report) return [];
    return [...report.problemTypes].sort((a, b) => {
      const na = parseInt(a.name.match(/\d+/)?.[0] || "0", 10);
      const nb = parseInt(b.name.match(/\d+/)?.[0] || "0", 10);
      return na - nb;
    });
  }, [report]);

  const toggleObjective = (id: string) => {
    setStatuses((prev) => ({
      ...prev,
      [id]: prev[id] === "wrong" ? "correct" : "wrong",
    }));
  };

  const setSubjective = (id: string, s: AnswerStatus) => {
    setStatuses((prev) => ({ ...prev, [id]: s }));
  };

  const handleSubmit = async () => {
    if (!reportId) return;
    if (!school.trim() || !grade.trim() || !name.trim()) {
      toast.error("학교/학년/이름을 입력해주세요.");
      return;
    }
    if (!score.trim() || isNaN(Number(score))) {
      toast.error("점수를 숫자로 입력해주세요.");
      return;
    }
    setSubmitting(true);
    const answers: SubmissionAnswer[] = Object.entries(statuses).map(
      ([problem_id, status]) => {
        const entry: SubmissionAnswer = { problem_id, status };
        if (status !== "correct") {
          const r = (reasons[problem_id] || "").trim();
          if (r) entry.reason = r.slice(0, 500);
        }
        return entry;
      }
    );
    const { error } = await submitStudentAnswers({
      report_id: reportId,
      school: school.trim(),
      grade: grade.trim(),
      student_name: name.trim(),
      score: Number(score),
      answers,
    });
    setSubmitting(false);
    if (error) {
      toast.error("제출에 실패했습니다: " + error.message);
      return;
    }
    setDone(true);
  };

  if (loading) {
    return (
      <div className="u-page u-page--subtle u-center">
        <div className="u-loader" role="status" aria-live="polite">
          <span className="u-loader-ring" aria-hidden="true" />
          <span className="u-eyebrow u-eyebrow--gold">Loading</span>
          <p>시험 정보를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="u-page u-page--subtle u-center">
        <div className="u-panel u-panel--pad" style={{ maxWidth: 420, width: "100%", textAlign: "center" }}>
          <span className="u-eyebrow u-eyebrow--gold">Not Found</span>
          <p className="u-lede" style={{ marginTop: 10 }}>리포트를 찾을 수 없습니다.</p>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="u-page u-page--subtle u-center">
        <div className="u-panel u-panel--pad u-rise" style={{ maxWidth: 440, width: "100%", textAlign: "center", padding: "40px 28px" }}>
          <span className="u-done-ring" aria-hidden="true"><Check /></span>
          <span className="u-eyebrow u-eyebrow--gold" style={{ display: "block", marginTop: 20, justifyContent: "center" }}>Submitted</span>
          <h2 className="u-h2" style={{ marginTop: 8 }}>제출 완료</h2>
          <p className="u-lede" style={{ marginTop: 8 }}>선생님에게 결과가 전달되었습니다.</p>
          <p className="u-cap" style={{ marginTop: 22 }}>이 창은 닫으셔도 됩니다.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="u-page u-page--subtle">
      <div className="u-shell u-shell--narrow u-section--tight u-stack" style={{ paddingInline: 14 }}>
        {/* 헤더 */}
        <header className="u-panel u-submit-head u-rise" style={idx(0)}>
          <i className="u-corner u-corner--tl" aria-hidden="true" />
          <span className="u-eyebrow u-eyebrow--gold">Self Grading · 학생 자가 채점</span>
          <h1 className="u-h1 u-h1--sm">{report.examScope || "시험 채점"}</h1>
          <p className="u-lede u-lede--sm">{report.school} · {report.grade}</p>
        </header>

        {/* 학생 정보 */}
        <section className="u-panel u-block u-rise" style={idx(1)} aria-labelledby="profile-title">
          <div className="u-block-head">
            <div>
              <span className="u-eyebrow">01 · Profile</span>
              <h2 id="profile-title" className="u-h3">내 정보</h2>
            </div>
          </div>
          <div className="u-field-grid u-field-grid--2" style={{ gap: 12 }}>
            <div>
              <label className="u-label" htmlFor="school">학교</label>
              <Input id="school" className="u-input" value={school} onChange={(e) => setSchool(e.target.value)} />
            </div>
            <div>
              <label className="u-label" htmlFor="grade">학년</label>
              <Input id="grade" className="u-input" value={grade} onChange={(e) => setGrade(e.target.value)} />
            </div>
            <div>
              <label className="u-label" htmlFor="name">이름</label>
              <Input id="name" className="u-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="홍길동" autoComplete="name" />
            </div>
            <div>
              <label className="u-label" htmlFor="score">점수</label>
              <Input
                id="score"
                className="u-input"
                type="number"
                inputMode="decimal"
                value={score}
                onChange={(e) => setScore(e.target.value)}
                placeholder="예: 85"
              />
            </div>
          </div>
        </section>

        {/* 문항 체크 */}
        <section className="u-panel u-block u-rise" style={idx(2)} aria-labelledby="grading-title">
          <div className="u-block-head">
            <div>
              <span className="u-eyebrow">02 · Grading</span>
              <h2 id="grading-title" className="u-h3">문항 채점</h2>
            </div>
            <p className="u-cap" style={{ textAlign: "right" }}>
              기본은 <span className="u-ok">맞음</span>,<br />틀린 것만 눌러주세요
            </p>
          </div>

          <div>
            {sortedProblems.map((p, i) => {
              const st = statuses[p.id] || "correct";
              const isSubjective = p.questionType === "subjective";
              return (
                <div key={p.id} className="u-q">
                  <div className="u-q-row">
                    <div className="u-q-main">
                      <span className="u-q-num" aria-hidden="true">{i + 1}</span>
                      <div style={{ minWidth: 0 }}>
                        <p className="u-q-name">{p.name}</p>
                        <p className="u-q-meta">{p.category} · {isSubjective ? "서답형" : "객관식"}</p>
                      </div>
                    </div>

                    {isSubjective ? (
                      <div className="u-grade-group" role="group" aria-label={`${p.name} 채점`}>
                        <button type="button" onClick={() => setSubjective(p.id, "correct")} className="u-grade" data-state={st === "correct" ? "correct" : "idle"} aria-pressed={st === "correct"} aria-label="맞음">
                          <Check aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => setSubjective(p.id, "partial")} className="u-grade" data-state={st === "partial" ? "partial" : "idle"} aria-pressed={st === "partial"} aria-label="부분점수">
                          <Minus aria-hidden="true" />
                        </button>
                        <button type="button" onClick={() => setSubjective(p.id, "wrong")} className="u-grade" data-state={st === "wrong" ? "wrong" : "idle"} aria-pressed={st === "wrong"} aria-label="틀림">
                          <X aria-hidden="true" />
                        </button>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => toggleObjective(p.id)}
                        className="u-grade u-grade--lg"
                        data-state={st === "wrong" ? "wrong" : "correct"}
                        aria-pressed={st === "wrong"}
                        aria-label={st === "wrong" ? "틀림" : "맞음"}
                      >
                        {st === "wrong" ? <X aria-hidden="true" /> : <Check aria-hidden="true" />}
                      </button>
                    )}
                  </div>
                  {(st === "wrong" || st === "partial") && (
                    <div>
                      <label htmlFor={`reason-${p.id}`} className="u-label" style={{ fontSize: 11.5 }}>
                        틀린 이유 <span className="u-cap" style={{ display: "inline", fontWeight: 400 }}>(선택, 스스로 되돌아보기)</span>
                      </label>
                      <Textarea
                        id={`reason-${p.id}`}
                        value={reasons[p.id] || ""}
                        onChange={(e) =>
                          setReasons((prev) => ({ ...prev, [p.id]: e.target.value }))
                        }
                        placeholder="예: 지문의 반전 표현을 놓쳤음 / 어휘 뜻 헷갈림 / 시간 부족으로 찍음"
                        maxLength={500}
                        className="u-input u-input--area"
                        style={{ minHeight: 64, fontSize: 13.5 }}
                      />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="u-btn u-btn--gold u-btn--lg u-btn--block u-rise"
          style={idx(3)}
        >
          {submitting ? <Loader2 className="animate-spin" aria-hidden="true" /> : "제출하기"}
        </button>
        <p className="u-cap" style={{ textAlign: "center", marginTop: 14 }}>ORUN ENGLISH · 옳은영어</p>
      </div>
    </div>
  );
};

export default StudentSubmit;
