-- Database Diagnostic Script
-- This script will help us understand what's currently in your database

-- Check if tables exist
SELECT 
  'Tables Check' as check_type,
  table_name,
  CASE 
    WHEN table_name IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('user_routines', 'routine_steps', 'routine_progress', 'routine_notifications', 'routine_categories');

-- Check routine_progress table structure
SELECT 
  'routine_progress columns' as check_type,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_schema = 'public' 
  AND table_name = 'routine_progress'
ORDER BY ordinal_position;

-- Check if functions exist
SELECT 
  'Functions Check' as check_type,
  routine_name,
  CASE 
    WHEN routine_name IS NOT NULL THEN 'EXISTS'
    ELSE 'MISSING'
  END as status
FROM information_schema.routines 
WHERE routine_schema = 'public' 
  AND routine_name IN ('get_user_routines_with_progress', 'get_routine_with_steps');

-- Check RLS policies
SELECT 
  'RLS Policies' as check_type,
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'public' 
  AND tablename IN ('user_routines', 'routine_steps', 'routine_progress');

-- Test the function directly (this might fail, but will show us the exact error)
DO $$
BEGIN
  RAISE NOTICE 'Testing get_user_routines_with_progress function...';
  -- This will fail if the function doesn't exist or has issues
  PERFORM get_user_routines_with_progress('00000000-0000-0000-0000-000000000000'::uuid);
  RAISE NOTICE 'Function test completed successfully';
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Function test failed: %', SQLERRM;
END $$; 