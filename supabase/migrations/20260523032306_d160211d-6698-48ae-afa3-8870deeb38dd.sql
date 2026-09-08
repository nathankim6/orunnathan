CREATE OR REPLACE FUNCTION public.is_admin_access_code(input_code text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT (
    input_code IN ('891127', 'skywalker89', 'skywalker90')
  ) OR EXISTS (
    SELECT 1
    FROM public.access_codes
    WHERE code = input_code
      AND is_admin = true
      AND expiry_date > now()
  );
$function$;
