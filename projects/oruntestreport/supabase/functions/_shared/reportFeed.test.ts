import { describe, expect, it } from "vitest";
import { buildReportFeed, type SubmissionRow } from "./reportFeed";

const row = (overrides: Partial<SubmissionRow> & { id: string; reportId: string; student?: string; date?: string | null; score?: number | null; answers?: unknown; problems?: unknown }): SubmissionRow => ({
  id: overrides.id,
  source_student_id: overrides.student ?? "student-a",
  report_id: overrides.reportId,
  score: overrides.score ?? 80,
  answers: overrides.answers ?? [{ problem_id: "p1", status: "wrong" }],
  created_at: overrides.created_at ?? "2026-09-01T00:00:00Z",
  updated_at: overrides.updated_at ?? overrides.created_at ?? "2026-09-01T00:00:00Z",
  report: {
    id: overrides.reportId,
    school: "오른중학교",
    grade: "2학년",
    exam_date: overrides.date === undefined ? "2026-08-30" : overrides.date,
    exam_info: "중간고사",
    exam_scope: "1-3과",
    total_questions: 1,
    problem_types: overrides.problems ?? [{ id: "p1", name: "내용일치", category: "교과서" }],
    overall_evaluation: null,
    created_at: "2026-09-01T00:00:00Z",
  },
});

describe("buildReportFeed", () => {
  it("isolates the requested stable student id", () => {
    const feed = buildReportFeed([
      row({ id: "mine", reportId: "r1" }),
      row({ id: "other", reportId: "r2", student: "student-b", score: 99 }),
    ], "student-a");
    expect(feed.history.map((item) => item.submissionId)).toEqual(["mine"]);
  });

  it("keeps analyses without an exam date in history and in the latest exams", () => {
    const feed = buildReportFeed([
      row({ id: "undated", reportId: "r1", date: null }),
      row({ id: "dated", reportId: "r2", date: "2026-08-01", created_at: "2026-08-20T00:00:00Z" }),
    ], "student-a");
    expect(feed.state).toBe("ready");
    expect(feed.latestExamCount).toBe(2);
    expect(feed.weaknesses[0]).toMatchObject({ type: "내용일치", wrong: 2, total: 2 });
  });

  it("orders history and picks the latest two by submission time", () => {
    const feed = buildReportFeed([
      row({ id: "s1", reportId: "r1", date: null, created_at: "2026-09-01T00:00:00Z" }),
      row({ id: "s2", reportId: "r2", date: null, created_at: "2026-09-05T00:00:00Z" }),
      row({ id: "s3", reportId: "r3", date: "2026-12-31", created_at: "2026-08-01T00:00:00Z" }),
    ], "student-a");
    expect(feed.history.map((item) => item.submissionId)).toEqual(["s2", "s1", "s3"]);
    expect(feed.latestExams.map((item) => item.reportId)).toEqual(["r2", "r1"]);
    expect(feed.history[0].registeredAt).toBe("2026-09-05T00:00:00Z");
    expect(feed.history[0].submittedAt).toBe("2026-09-05T00:00:00Z");
  });

  it("counts one representative submission per report even with duplicates", () => {
    const problems = [{ id: "p1", name: "어법" }, { id: "p2", name: "어법" }];
    const wrong = [{ problem_id: "p1", status: "wrong" }, { problem_id: "p2", status: "wrong" }];
    const feed = buildReportFeed([
      row({ id: "old", reportId: "r1", problems, answers: [{ problem_id: "p1", status: "correct" }, { problem_id: "p2", status: "correct" }], created_at: "2026-09-01T00:00:00Z" }),
      row({ id: "new", reportId: "r1", problems, answers: wrong, created_at: "2026-09-02T00:00:00Z" }),
    ], "student-a");
    expect(feed.history).toHaveLength(1);
    expect(feed.history[0].submissionId).toBe("new");
    expect(feed.weaknesses[0]).toMatchObject({ type: "어법", wrong: 2, total: 2 });
  });

  it("merges one type name across different scope categories", () => {
    const problems = [
      { id: "p1", name: "글의 순서", category: "교과서" },
      { id: "p2", name: "글의 순서 ", category: "부교재" },
      { id: "p3", name: "어법", category: "교과서" },
    ];
    const answers = [
      { problem_id: "p1", status: "wrong" },
      { problem_id: "p2", status: "wrong" },
      { problem_id: "p3", status: "wrong" },
    ];
    const feed = buildReportFeed([row({ id: "s1", reportId: "r1", problems, answers })], "student-a");
    expect(feed.weaknesses.map((item) => item.type)).toEqual(["글의 순서", "어법"]);
    expect(feed.weaknesses[0]).toMatchObject({ wrong: 2, total: 2 });
  });

  it("ranks by wrong count first so 4/10 beats 2/2", () => {
    const problems = [
      ...Array.from({ length: 10 }, (_, i) => ({ id: `a${i}`, name: "내용일치" })),
      ...Array.from({ length: 2 }, (_, i) => ({ id: `b${i}`, name: "빈칸추론" })),
    ];
    const answers = problems.map((p, i) => ({ problem_id: p.id, status: (i < 4 || i >= 10) ? "wrong" : "correct" }));
    const feed = buildReportFeed([row({ id: "s1", reportId: "r1", problems, answers })], "student-a");
    expect(feed.weaknesses.map((item) => item.type)).toEqual(["내용일치", "빈칸추론"]);
    expect(feed.weaknesses.map((item) => item.wrong)).toEqual([4, 2]);
    expect(feed.weaknesses[1].lowSample).toBe(true);
  });

  it("never counts a partial answer as wrong", () => {
    const problems = [{ id: "p1", name: "어법" }, { id: "p2", name: "요약" }];
    const feed = buildReportFeed([row({
      id: "s1",
      reportId: "r1",
      problems,
      answers: [{ problem_id: "p1", status: "wrong" }, { problem_id: "p2", status: "partial" }],
    })], "student-a");
    expect(feed.weaknesses).toHaveLength(1);
    expect(feed.weaknesses[0]).toMatchObject({ type: "어법", wrong: 1, partial: 0 });
    expect(feed.partialReviewTypes).toEqual([{ type: "요약", partial: 1, total: 1 }]);
  });

  it("returns at most three weakness types and nothing when there is no wrong answer", () => {
    const names = ["내용일치", "어법", "글의 순서", "빈칸추론"];
    const problems = names.map((name, i) => ({ id: `p${i}`, name }));
    const answers = problems.map((p) => ({ problem_id: p.id, status: "wrong" }));
    const feed = buildReportFeed([row({ id: "s1", reportId: "r1", problems, answers })], "student-a");
    expect(feed.weaknesses).toHaveLength(3);

    const clean = buildReportFeed([row({
      id: "s2",
      reportId: "r2",
      problems,
      answers: problems.map((p) => ({ problem_id: p.id, status: "correct" })),
    })], "student-a");
    expect(clean.weaknesses).toEqual([]);
  });

  it("falls back to 기타 for a missing type name without using the category", () => {
    const feed = buildReportFeed([row({
      id: "s1",
      reportId: "r1",
      problems: [{ id: "p1", category: "교과서" }],
      answers: [{ problem_id: "p1", status: "wrong" }],
    })], "student-a");
    expect(feed.weaknesses.map((item) => item.type)).toEqual(["기타"]);
  });

  it("preserves a zero score and separates zero, one and pending states", () => {
    expect(buildReportFeed([], "student-a").state).toBe("empty");
    const one = buildReportFeed([row({ id: "zero", reportId: "r1", score: 0 })], "student-a");
    expect(one.state).toBe("one_exam");
    expect(one.history[0].score).toBe(0);
    expect(buildReportFeed([row({ id: "pending", reportId: "r1", answers: [] })], "student-a").state).toBe("pending");
  });

  it("rejects incomplete denominators instead of inventing a rate", () => {
    const feed = buildReportFeed([row({
      id: "incomplete",
      reportId: "r1",
      problems: [{ id: "p1", name: "어법" }, { id: "p2", name: "요약" }],
      answers: [{ problem_id: "p1", status: "wrong" }],
    })], "student-a");
    expect(feed.state).toBe("pending");
    expect(feed.weaknesses).toEqual([]);
  });
});
