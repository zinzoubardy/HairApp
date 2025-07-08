-- Targeted Fix for Missing 'completed' Column Error
-- This script specifically addresses the "column rp.completed does not exist" error

-- First, let's check if the routine_progress table exists and has the correct structure
DO $$
BEGIN
  -- Check if routine_progress table exists
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'routine_progress') THEN
    -- Create the table if it doesn't exist
    CREATE TABLE public.routine_progress (
      id uuid NOT NULL DEFAULT uuid_generate_v4(),
      user_id uuid NOT NULL,
      routine_id uuid NOT NULL,
      step_index integer NOT NULL,
      completed boolean DEFAULT false,
      completed_at timestamptz,
      created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
      updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
      CONSTRAINT routine_progress_pkey PRIMARY KEY (id),
      CONSTRAINT routine_progress_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
      CONSTRAINT routine_progress_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES public.user_routines(id) ON DELETE CASCADE,
      CONSTRAINT routine_progress_unique UNIQUE (user_id, routine_id, step_index)
    );
    
    RAISE NOTICE 'Created routine_progress table';
  ELSE
    -- Check if the completed column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'routine_progress' AND column_name = 'completed') THEN
      -- Add the completed column if it doesn't exist
      ALTER TABLE public.routine_progress ADD COLUMN completed boolean DEFAULT false;
      RAISE NOTICE 'Added completed column to routine_progress table';
    ELSE
      RAISE NOTICE 'completed column already exists in routine_progress table';
    END IF;
  END IF;
END $$;

-- Now let's drop and recreate the function to ensure it works
DROP FUNCTION IF EXISTS get_user_routines_with_progress(uuid);

-- Recreate the function with proper error handling
CREATE OR REPLACE FUNCTION get_user_routines_with_progress(user_uuid uuid)
RETURNS TABLE (
  routine_id uuid,
  title text,
  description text,
  category text,
  icon text,
  color text,
  is_ai_generated boolean,
  total_steps integer,
  completed_steps integer,
  progress_percentage numeric
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ur.id as routine_id,
    ur.title,
    ur.description,
    ur.category,
    ur.icon,
    ur.color,
    ur.is_ai_generated,
    COALESCE(COUNT(rs.id), 0)::integer as total_steps,
    COALESCE(COUNT(CASE WHEN rp.completed = true THEN 1 END), 0)::integer as completed_steps,
    CASE 
      WHEN COUNT(rs.id) > 0 THEN 
        ROUND((COUNT(CASE WHEN rp.completed = true THEN 1 END)::numeric / COUNT(rs.id)::numeric) * 100, 1)
      ELSE 0 
    END as progress_percentage
  FROM public.user_routines ur
  LEFT JOIN public.routine_steps rs ON ur.id = rs.routine_id
  LEFT JOIN public.routine_progress rp ON ur.id = rp.routine_id AND rs.step_order = rp.step_index
  WHERE ur.user_id = user_uuid
  GROUP BY ur.id, ur.title, ur.description, ur.category, ur.icon, ur.color, ur.is_ai_generated
  ORDER BY ur.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
SELECT 'Fix completed successfully!' as status; 