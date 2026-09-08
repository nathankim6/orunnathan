-- Drop existing foreign key constraint
ALTER TABLE user_works 
DROP CONSTRAINT IF EXISTS user_works_access_code_fkey;

-- Recreate foreign key with CASCADE delete
ALTER TABLE user_works 
ADD CONSTRAINT user_works_access_code_fkey 
FOREIGN KEY (access_code) 
REFERENCES access_codes(code) 
ON DELETE CASCADE;
