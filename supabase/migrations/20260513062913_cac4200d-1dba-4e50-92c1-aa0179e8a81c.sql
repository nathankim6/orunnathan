CREATE OR REPLACE FUNCTION public.is_admin_access_code(input_code text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.access_codes
    WHERE code = input_code
      AND is_admin = true
      AND expiry_date > now()
  );
$$;

CREATE OR REPLACE FUNCTION public.admin_list_access_codes(admin_code text)
RETURNS TABLE (
  code text,
  expiry_date timestamptz,
  last_accessed timestamptz,
  name text,
  user_name text,
  is_admin boolean,
  created_at timestamptz,
  problem_count bigint
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    ac.code,
    ac.expiry_date,
    ac.last_accessed,
    ac.name,
    ac.user_name,
    ac.is_admin,
    ac.created_at,
    COALESCE(uw.problem_count, 0) AS problem_count
  FROM public.access_codes ac
  LEFT JOIN (
    SELECT access_code, COUNT(*)::bigint AS problem_count
    FROM public.user_works
    GROUP BY access_code
  ) uw ON uw.access_code = ac.code
  WHERE public.is_admin_access_code(admin_code)
  ORDER BY ac.created_at DESC NULLS LAST;
$$;

CREATE OR REPLACE FUNCTION public.admin_create_access_code(
  admin_code text,
  new_code text,
  new_expiry_date timestamptz
)
RETURNS public.access_codes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  inserted_row public.access_codes;
BEGIN
  IF NOT public.is_admin_access_code(admin_code) THEN
    RAISE EXCEPTION 'admin access denied';
  END IF;

  INSERT INTO public.access_codes (code, expiry_date)
  VALUES (new_code, new_expiry_date)
  RETURNING * INTO inserted_row;

  RETURN inserted_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_update_access_code_profile(
  admin_code text,
  target_code text,
  new_name text,
  new_user_name text
)
RETURNS public.access_codes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_row public.access_codes;
BEGIN
  IF NOT public.is_admin_access_code(admin_code) THEN
    RAISE EXCEPTION 'admin access denied';
  END IF;

  UPDATE public.access_codes
  SET
    name = NULLIF(new_name, ''),
    user_name = NULLIF(new_user_name, '')
  WHERE code = target_code
  RETURNING * INTO updated_row;

  IF updated_row.code IS NULL THEN
    RAISE EXCEPTION 'access code not found';
  END IF;

  RETURN updated_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_extend_access_code(
  admin_code text,
  target_code text,
  new_expiry_date timestamptz
)
RETURNS public.access_codes
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  updated_row public.access_codes;
BEGIN
  IF NOT public.is_admin_access_code(admin_code) THEN
    RAISE EXCEPTION 'admin access denied';
  END IF;

  UPDATE public.access_codes
  SET expiry_date = new_expiry_date
  WHERE code = target_code
  RETURNING * INTO updated_row;

  IF updated_row.code IS NULL THEN
    RAISE EXCEPTION 'access code not found';
  END IF;

  RETURN updated_row;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_delete_access_code(
  admin_code text,
  target_code text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  deleted_count integer;
BEGIN
  IF NOT public.is_admin_access_code(admin_code) THEN
    RAISE EXCEPTION 'admin access denied';
  END IF;

  DELETE FROM public.access_codes
  WHERE code = target_code;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count > 0;
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin_access_code(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_list_access_codes(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_create_access_code(text, text, timestamptz) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_access_code_profile(text, text, text, text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_extend_access_code(text, text, timestamptz) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_access_code(text, text) TO anon, authenticated;
