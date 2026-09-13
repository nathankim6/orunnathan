export type AnswerStatus = "correct" | "wrong" | "partial";

export interface ProblemType {
  id: string;
  name?: string;
  category?: string;
}

export interface ReportRow {
  id: string;
  school: string;
  grade: string;
  exam_date: string | null;
  exam_info: string | null;
  exam_scope: string;
  total_questions: number | null;
  problem_types: unknown;
  overall_evaluation: string | null;
  created_at: string;
}

export interface SubmissionRow {
  id: string;
  source_student_id: string;
  report_id: string;
  score: number | null;
  answers: unknown;
  created_at: string;
  updated_at: string;
  report: ReportRow;
}

export interface FeedHistoryItem {
  reportId: string;
  submissionId: string;
  examDate: string | null;
  registeredAt: string;
  submittedAt: string;
  school: string;
  grade: string;
  examInfo: string | null;
  examScope: string;
  score: number | null;
  status: "completed" | "pending";
  overallEvaluation: string | null;
  answers: Array<{ problemId: string; status: AnswerStatus; reason?: string }>;
  problems: ProblemType[];
}

const parseArray = <T>(value: unknown): T[] => {
  try {
    const parsed = typeof value === "string" ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed as T[] : [];
  } catch {
    return [];
  }
};

const compareVersion = (a: SubmissionRow, b: SubmissionRow) =>
  b.created_at.localeCompare(a.created_at) || b.id.localeCompare(a.id);

function parseCompleteAnswers(row: SubmissionRow) {
  const problems = parseArray<ProblemType>(row.report.problem_types)
    .filter((p) => p && typeof p.id === "string" && p.id.length > 0);
  const raw = parseArray<Record<string, unknown>>(row.answers);
  const known = new Set(problems.map((p) => p.id));
  const seen = new Set<string>();
  const answers: FeedHistoryItem["answers"] = [];

  for (const answer of raw) {
    const problemId = answer?.problem_id;
    const status = answer?.status;
    if (typeof problemId !== "string" || !known.has(problemId) || seen.has(problemId)) return null;
    if (status !== "correct" && status !== "wrong" && status !== "partial") return null;
    seen.add(problemId);
    answers.push({
      problemId,
      status,
      ...(typeof answer.reason === "string" && answer.reason.trim()
        ? { reason: answer.reason.trim().slice(0, 500) }
        : {}),
    });
  }

  if (problems.length === 0 || answers.length !== problems.length) return null;
  return { answers, problems };
}

export function buildReportFeed(rows: SubmissionRow[], expectedStudentId: string) {
  // Defence in depth: a caller cannot make another student's row enter the feed.
  const ownedRows = rows.filter((row) => row.source_student_id === expectedStudentId && row.report);
  const grouped = new Map<string, SubmissionRow[]>();
  for (const row of ownedRows) {
    const versions = grouped.get(row.report_id) ?? [];
    versions.push(row);
    grouped.set(row.report_id, versions);
  }

  const history: FeedHistoryItem[] = [];
  for (const versions of grouped.values()) {
    const sorted = [...versions].sort(compareVersion);
    const valid = sorted.find((row) => parseCompleteAnswers(row) !== null);
    const representative = valid ?? sorted[0];
    const parsed = parseCompleteAnswers(representative);
    const report = representative.report;
    history.push({
      reportId: report.id,
      submissionId: representative.id,
      examDate: report.exam_date,
      registeredAt: representative.created_at,
      submittedAt: representative.created_at,
      school: report.school,
      grade: report.grade,
      examInfo: report.exam_info,
      examScope: report.exam_scope,
      score: representative.score,
      status: parsed ? "completed" : "pending",
      overallEvaluation: report.overall_evaluation,
      answers: parsed?.answers ?? [],
      problems: parsed?.problems ?? parseArray<ProblemType>(report.problem_types),
    });
  }

  // Submission order is authoritative; a missing exam date never hides an analysis.
  history.sort((a, b) =>
    b.submittedAt.localeCompare(a.submittedAt) ||
    b.reportId.localeCompare(a.reportId)
  );

  const latestTwo = history
    .filter((item) => item.status === "completed")
    .slice(0, 2);

  type Accumulator = {
    type: string;
    wrong: number;
    partial: number;
    total: number;
    examsWrong: Set<string>;
    latestWrong: number;
  };
  const byType = new Map<string, Accumulator>();

  for (const exam of latestTwo) {
    const answerMap = new Map(exam.answers.map((answer) => [answer.problemId, answer]));
    for (const problem of exam.problems) {
      const answer = answerMap.get(problem.id);
      if (!answer) continue;
      // Group by question type name only; the scope category is never a substitute.
      const type = (problem.name ?? "").replace(/\s+/g, " ").trim() || "기타";
      const entry = byType.get(type) ?? { type, wrong: 0, partial: 0, total: 0, examsWrong: new Set<string>(), latestWrong: 0 };
      entry.total += 1;
      if (answer.status === "wrong") {
        entry.wrong += 1;
        entry.examsWrong.add(exam.reportId);
        if (exam.reportId === latestTwo[0]?.reportId) entry.latestWrong += 1;
      } else if (answer.status === "partial") {
        entry.partial += 1;
      }
      byType.set(type, entry);
    }
  }

  const ranked = [...byType.values()]
    .filter((entry) => entry.wrong > 0)
    .sort((a, b) =>
      b.wrong - a.wrong ||
      (b.wrong / b.total) - (a.wrong / a.total) ||
      b.latestWrong - a.latestWrong || a.type.localeCompare(b.type)
    );
  const presentWeakness = (entry: Accumulator) => ({
      type: entry.type,
      wrong: entry.wrong,
      partial: entry.partial,
      total: entry.total,
      wrongRate: entry.total > 0 ? entry.wrong / entry.total : null,
      repeatWrong: latestTwo.length === 2 && entry.examsWrong.size === 2,
      lowSample: entry.total < 3,
    });
  const weaknesses = ranked.slice(0, 3).map(presentWeakness);
  const lowSampleWeaknesses = ranked.filter((entry) => entry.total < 3).slice(0, 3).map(presentWeakness);

  const completedCount = history.filter((item) => item.status === "completed").length;
  const missingDateCount = history.filter((item) => item.status === "completed" && !item.examDate).length;
  const pendingCount = history.filter((item) => item.status === "pending").length;
  const sampleTotal = latestTwo.reduce((sum, item) => sum + item.answers.length, 0);

  return {
    state: completedCount === 0 ? (pendingCount > 0 ? "pending" : "empty")
      : latestTwo.length >= 2 ? "ready"
      : "one_exam",
    latestExamCount: latestTwo.length,
    missingDateCount,
    pendingCount,
    sampleTotal,
    lowSample: sampleTotal > 0 && sampleTotal < 3,
    weaknesses,
    lowSampleWeaknesses,
    partialReviewTypes: [...byType.values()]
      .filter((entry) => entry.partial > 0 && entry.wrong === 0)
      .sort((a, b) => b.partial - a.partial || a.type.localeCompare(b.type))
      .slice(0, 3)
      .map((entry) => ({ type: entry.type, partial: entry.partial, total: entry.total })),
    latestExams: latestTwo.map((item) => ({ reportId: item.reportId, examDate: item.examDate, examInfo: item.examInfo, examScope: item.examScope })),
    history,
  };
}
