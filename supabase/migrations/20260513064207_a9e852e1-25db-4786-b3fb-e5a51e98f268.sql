
CREATE OR REPLACE FUNCTION public.validate_access_code(input_code text)
RETURNS TABLE(name text, user_name text, expiry_date timestamptz, is_admin boolean, valid boolean)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT ac.name, ac.user_name, ac.expiry_date, ac.is_admin,
         (ac.expiry_date > now()) AS valid
  FROM public.access_codes ac
  WHERE ac.code = input_code
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.touch_access_code(input_code text)
RETURNS void
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.access_codes SET last_accessed = now() WHERE code = input_code;
$$;

GRANT EXECUTE ON FUNCTION public.validate_access_code(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.touch_access_code(text) TO anon, authenticated;
