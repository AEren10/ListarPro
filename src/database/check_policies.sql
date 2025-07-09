-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
  AND tablename IN ('shops', 'profiles');

-- List all policies
SELECT *
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('shops', 'profiles');

-- Ensure public role has proper permissions
GRANT SELECT ON shops TO anon;
GRANT SELECT ON profiles TO anon;
GRANT SELECT ON shops TO authenticated;
GRANT SELECT ON profiles TO authenticated; 