CREATE TABLE public.report_text_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL,
  reason text NOT NULL DEFAULT 'tone-rewrite',
  problem_types jsonb,
  overall_evaluation text,
  difficult_problems_explanation text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX report_text_snapshots_report_id_idx ON public.report_text_snapshots (report_id, created_at DESC);

GRANT SELECT, INSERT ON public.report_text_snapshots TO anon;
GRANT SELECT, INSERT ON public.report_text_snapshots TO authenticated;
GRANT ALL ON public.report_text_snapshots TO service_role;

ALTER TABLE public.report_text_snapshots ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read report text snapshots"
  ON public.report_text_snapshots FOR SELECT USING (true);

CREATE POLICY "Anyone can create report text snapshots"
  ON public.report_text_snapshots FOR INSERT WITH CHECK (true);