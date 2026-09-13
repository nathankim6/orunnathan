import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { buildReportFeed, type SubmissionRow } from "../_shared/reportFeed.ts";

const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: { "Content-Type": "application/json", "Cache-Control": "private, no-store" },
});

const normalize = (value: unknown) => typeof value === "string"
  ? value.normalize("NFC").trim().replace(/\s+/g, " ").toLocaleLowerCase("ko-KR")
  : "";

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);
  if (Deno.env.get("REPORT_FEED_ENABLED") !== "true") return json({ state: "unavailable" }, 503);

  const expectedSecret = Deno.env.get("REPORT_INTEGRATION_SHARED_SECRET");
  const suppliedSecret = req.headers.get("x-report-integration-secret");
  if (!expectedSecret || !suppliedSecret || suppliedSecret !== expectedSecret) return json({ error: "unauthorized" }, 401);

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceKey) return json({ error: "server_not_configured" }, 503);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: "invalid_request" }, 400); }
  const profile = body.profile as Record<string, unknown> | undefined;
  const schoolInput = normalize(profile?.school);
  const gradeKey = normalize(profile?.grade);
  const studentNameKey = normalize(profile?.name);
  if (!schoolInput || !gradeKey || !studentNameKey) return json({ error: "invalid_profile" }, 400);

  const db = createClient(supabaseUrl, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: alias } = await db.from("report_school_aliases")
    .select("canonical_key").eq("alias_key", schoolInput).not("approved_at", "is", null).maybeSingle();
  const schoolKey = alias?.canonical_key ?? schoolInput;

  let sourceStudentId = typeof body.sourceStudentId === "string" ? body.sourceStudentId : null;
  const { data: keys, error: keyError } = await db.from("report_student_identity_keys")
    .select("report_student_id")
    .eq("school_key", schoolKey)
    .eq("grade_key", gradeKey)
    .eq("student_name_key", studentNameKey)
    .not("approved_at", "is", null)
    .limit(3);
  if (keyError) return json({ state: "unavailable" }, 503);
  const matches = [...new Set((keys ?? []).map((key) => key.report_student_id))];

  if (sourceStudentId) {
    if (matches.length !== 1 || matches[0] !== sourceStudentId) return json({ state: "identity_changed" }, 409);
  } else {
    if (matches.length === 0) return json({ state: "not_linked" }, 404);
    if (matches.length !== 1) return json({ state: "ambiguous" }, 409);
    sourceStudentId = matches[0];
  }

  const submissions: unknown[] = [];
  const pageSize = 500;
  const maxRows = 10_000;
  for (let from = 0; from < maxRows; from += pageSize) {
    const { data: page, error } = await db.from("student_submissions")
      .select(`
        id, source_student_id, report_id, score, answers, created_at, updated_at,
        report:report_cards!inner(
          id, school, grade, exam_date, exam_info, exam_scope, total_questions,
          problem_types, overall_evaluation, created_at
        )
      `)
      .eq("source_student_id", sourceStudentId)
      .order("created_at", { ascending: false })
      .order("id", { ascending: false })
      .range(from, from + pageSize - 1);
    if (error) return json({ state: "unavailable" }, 503);
    submissions.push(...(page ?? []));
    if ((page?.length ?? 0) < pageSize) break;
    if (from + pageSize >= maxRows) return json({ state: "history_too_large" }, 507);
  }

  return json({ sourceStudentId, ...buildReportFeed(submissions as SubmissionRow[], sourceStudentId) });
});
