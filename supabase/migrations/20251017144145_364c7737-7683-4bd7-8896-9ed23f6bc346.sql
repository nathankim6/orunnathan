-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Create a function to delete old generated questions (older than 3 days)
CREATE OR REPLACE FUNCTION delete_old_generated_questions()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM generated_questions_storage
  WHERE created_at < NOW() - INTERVAL '3 days';
END;
$$;

-- Schedule the cleanup to run daily at 2 AM
SELECT cron.schedule(
  'delete-old-generated-questions',
  '0 2 * * *',
  'SELECT delete_old_generated_questions();'
);
