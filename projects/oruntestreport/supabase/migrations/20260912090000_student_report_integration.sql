-- Stable, server-only identities for the homework report integration.
-- Existing public report authoring remains unchanged; these tables are deliberately
-- unavailable through the anon/authenticated API.

ALTER TABLE public.report_cards
  ADD COLUMN IF NOT EXISTS exam_date date;

CREATE OR REPLACE FUNCTION public.normalize_report_identity(value text)
RETURNS text
LANGUAGE sql
IMMUTABLE
PARALLEL SAFE
SET search_path = public
AS $$
  SELECT lower(regexp_replace(trim(normalize(coalesce(value, ''), NFC)), '[[:space:]]+', ' ', 'g'))
$$;

CREATE TABLE IF NOT EXISTS public.report_school_aliases (
  alias_key text PRIMARY KEY,
  canonical_key text NOT NULL,
  note text,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  CHECK (alias_key = public.normalize_report_identity(alias_key)),
  CHECK (canonical_key = public.normalize_report_identity(canonical_key))
);

ALTER TABLE public.report_school_aliases ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.report_school_aliases FROM anon, authenticated;
GRANT ALL ON public.report_school_aliases TO service_role;

CREATE OR REPLACE FUNCTION public.canonical_report_school(value text)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  WITH input AS (SELECT public.normalize_report_identity(value) AS key)
  SELECT coalesce(
    (SELECT a.canonical_key
       FROM public.report_school_aliases a, input
      WHERE a.alias_key = input.key AND a.approved_at IS NOT NULL),
    (SELECT key FROM input)
  )
$$;

REVOKE ALL ON FUNCTION public.canonical_report_school(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.canonical_report_school(text) TO service_role;

CREATE TABLE IF NOT EXISTS public.report_students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  display_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS public.report_student_identity_keys (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_student_id uuid NOT NULL REFERENCES public.report_students(id) ON DELETE CASCADE,
  school_key text NOT NULL,
  grade_key text NOT NULL,
  student_name_key text NOT NULL,
  school_label text NOT NULL,
  grade_label text NOT NULL,
  student_name_label text NOT NULL,
  approved_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (report_student_id, school_key, grade_key, student_name_key)
);

CREATE INDEX IF NOT EXISTS report_student_identity_lookup_idx
  ON public.report_student_identity_keys (school_key, grade_key, student_name_key)
  WHERE approved_at IS NOT NULL;

ALTER TABLE public.report_students ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_student_identity_keys ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.report_students FROM anon, authenticated;
REVOKE ALL ON public.report_student_identity_keys FROM anon, authenticated;
GRANT ALL ON public.report_students TO service_role;
GRANT ALL ON public.report_student_identity_keys TO service_role;

ALTER TABLE public.student_submissions
  ADD COLUMN IF NOT EXISTS source_student_id uuid REFERENCES public.report_students(id) ON DELETE RESTRICT;

CREATE INDEX IF NOT EXISTS student_submissions_source_student_idx
  ON public.student_submissions (source_student_id, report_id, created_at DESC);

-- Backfill one stable source identity per exact current school+grade+name key.
-- Prior-grade aliases are intentionally not guessed; an administrator can merge
-- verified identities with merge_report_students below.
DO $$
DECLARE
  identity record;
  new_student_id uuid;
BEGIN
  FOR identity IN
    SELECT
      public.canonical_report_school(school) AS school_key,
      public.normalize_report_identity(grade) AS grade_key,
      public.normalize_report_identity(student_name) AS student_name_key,
      min(school) AS school_label,
      min(grade) AS grade_label,
      min(student_name) AS student_name_label
    FROM public.student_submissions
    WHERE source_student_id IS NULL
    GROUP BY 1, 2, 3
  LOOP
    INSERT INTO public.report_students (display_name)
    VALUES (identity.student_name_label)
    RETURNING id INTO new_student_id;

    INSERT INTO public.report_student_identity_keys (
      report_student_id, school_key, grade_key, student_name_key,
      school_label, grade_label, student_name_label
    ) VALUES (
      new_student_id, identity.school_key, identity.grade_key, identity.student_name_key,
      identity.school_label, identity.grade_label, identity.student_name_label
    );

    UPDATE public.student_submissions
       SET source_student_id = new_student_id
     WHERE source_student_id IS NULL
       AND public.canonical_report_school(school) = identity.school_key
       AND public.normalize_report_identity(grade) = identity.grade_key
       AND public.normalize_report_identity(student_name) = identity.student_name_key;
  END LOOP;
END $$;

CREATE OR REPLACE FUNCTION public.assign_report_student_identity()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  school_identity text := public.canonical_report_school(NEW.school);
  grade_identity text := public.normalize_report_identity(NEW.grade);
  name_identity text := public.normalize_report_identity(NEW.student_name);
  matched_ids uuid[];
  matched_id uuid;
BEGIN
  IF TG_OP = 'UPDATE'
     AND NEW.school IS NOT DISTINCT FROM OLD.school
     AND NEW.grade IS NOT DISTINCT FROM OLD.grade
     AND NEW.student_name IS NOT DISTINCT FROM OLD.student_name
     AND NEW.source_student_id IS DISTINCT FROM OLD.source_student_id THEN
    IF coalesce(current_setting('request.jwt.claim.role', true), '') = 'service_role' THEN
      RETURN NEW;
    END IF;
    NEW.source_student_id := OLD.source_student_id;
    RETURN NEW;
  END IF;

  -- Serialize creation for one exact key so concurrent first submissions do not
  -- manufacture two source students.
  PERFORM pg_advisory_xact_lock(hashtextextended(
    school_identity || E'\x1f' || grade_identity || E'\x1f' || name_identity, 0
  ));

  SELECT array_agg(DISTINCT report_student_id)
    INTO matched_ids
    FROM public.report_student_identity_keys
   WHERE school_key = school_identity
     AND grade_key = grade_identity
     AND student_name_key = name_identity;

  IF coalesce(array_length(matched_ids, 1), 0) > 1 THEN
    RAISE EXCEPTION 'ambiguous student identity';
  ELSIF coalesce(array_length(matched_ids, 1), 0) = 1 THEN
    matched_id := matched_ids[1];
  ELSE
    INSERT INTO public.report_students (display_name)
    VALUES (NEW.student_name)
    RETURNING id INTO matched_id;

    INSERT INTO public.report_student_identity_keys (
      report_student_id, school_key, grade_key, student_name_key,
      school_label, grade_label, student_name_label
    ) VALUES (
      matched_id, school_identity, grade_identity, name_identity,
      NEW.school, NEW.grade, NEW.student_name
    );
  END IF;

  -- Never accept a client-selected identity.
  NEW.source_student_id := matched_id;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS assign_report_student_identity_trigger ON public.student_submissions;
CREATE TRIGGER assign_report_student_identity_trigger
BEFORE INSERT OR UPDATE OF school, grade, student_name, source_student_id ON public.student_submissions
FOR EACH ROW EXECUTE FUNCTION public.assign_report_student_identity();

CREATE OR REPLACE FUNCTION public.merge_report_students(primary_id uuid, duplicate_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF primary_id = duplicate_id THEN RETURN; END IF;
  IF NOT EXISTS (SELECT 1 FROM public.report_students WHERE id = primary_id)
     OR NOT EXISTS (SELECT 1 FROM public.report_students WHERE id = duplicate_id) THEN
    RAISE EXCEPTION 'unknown report student';
  END IF;

  INSERT INTO public.report_student_identity_keys (
    report_student_id, school_key, grade_key, student_name_key,
    school_label, grade_label, student_name_label, approved_at, created_at
  )
  SELECT primary_id, school_key, grade_key, student_name_key,
         school_label, grade_label, student_name_label, approved_at, created_at
    FROM public.report_student_identity_keys
   WHERE report_student_id = duplicate_id
  ON CONFLICT (report_student_id, school_key, grade_key, student_name_key) DO NOTHING;

  UPDATE public.student_submissions SET source_student_id = primary_id
   WHERE source_student_id = duplicate_id;
  DELETE FROM public.report_student_identity_keys WHERE report_student_id = duplicate_id;
  DELETE FROM public.report_students WHERE id = duplicate_id;
END;
$$;

REVOKE ALL ON FUNCTION public.merge_report_students(uuid, uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.merge_report_students(uuid, uuid) TO service_role;
