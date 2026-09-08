-- Step 1: Insert new skywalker90 admin code
INSERT INTO access_codes (code, name, user_name, expiry_date, is_admin)
SELECT 'skywalker90', name, user_name, expiry_date, is_admin
FROM access_codes 
WHERE code = '101100' AND is_admin = true;

-- Step 2: Update user_works to reference new code
UPDATE user_works 
SET access_code = 'skywalker90'
WHERE access_code = '101100';

-- Step 3: Delete old 101100 code
DELETE FROM access_codes 
WHERE code = '101100' AND is_admin = true;
