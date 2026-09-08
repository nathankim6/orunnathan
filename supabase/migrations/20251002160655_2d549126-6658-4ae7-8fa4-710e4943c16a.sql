-- Enable realtime for access_codes table
ALTER TABLE access_codes REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE access_codes;

-- Enable realtime for user_works table
ALTER TABLE user_works REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE user_works;
