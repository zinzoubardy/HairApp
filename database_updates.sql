-- Comprehensive Database Setup for Hair App
-- Run this script in your Supabase SQL editor to set up all required tables and functions

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create update_updated_at_column function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Drop existing functions to recreate them
DROP FUNCTION IF EXISTS get_user_routines_with_progress(uuid);
DROP FUNCTION IF EXISTS get_routine_with_steps(uuid);

-- Create user_routines table
CREATE TABLE IF NOT EXISTS public.user_routines (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'daily',
  icon text NOT NULL DEFAULT 'sunny',
  color text NOT NULL DEFAULT '#FF6B6B',
  gradient_start text,
  gradient_end text,
  is_ai_generated boolean DEFAULT false,
  analysis_id uuid,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT user_routines_pkey PRIMARY KEY (id),
  CONSTRAINT user_routines_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Create routine_steps table
CREATE TABLE IF NOT EXISTS public.routine_steps (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  routine_id uuid NOT NULL,
  step_order integer NOT NULL,
  title text NOT NULL,
  description text,
  duration integer, -- in minutes
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT routine_steps_pkey PRIMARY KEY (id),
  CONSTRAINT routine_steps_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES public.user_routines(id) ON DELETE CASCADE,
  CONSTRAINT routine_steps_order_unique UNIQUE (routine_id, step_order)
);

-- Create routine_progress table
CREATE TABLE IF NOT EXISTS public.routine_progress (
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

-- Create routine_notifications table
CREATE TABLE IF NOT EXISTS public.routine_notifications (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  routine_id uuid NOT NULL,
  step_index integer,
  notification_id text NOT NULL, -- Expo notification ID
  notification_type text NOT NULL, -- 'step_reminder', 'daily_reminder', 'weekly_reminder'
  scheduled_time timestamptz NOT NULL,
  is_active boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT routine_notifications_pkey PRIMARY KEY (id),
  CONSTRAINT routine_notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT routine_notifications_routine_id_fkey FOREIGN KEY (routine_id) REFERENCES public.user_routines(id) ON DELETE CASCADE
);

-- Create routine_categories table
CREATE TABLE IF NOT EXISTS public.routine_categories (
  id text NOT NULL,
  name text NOT NULL,
  icon text NOT NULL,
  color text NOT NULL,
  gradient_start text,
  gradient_end text,
  description text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT routine_categories_pkey PRIMARY KEY (id)
);

-- Insert default routine categories
INSERT INTO public.routine_categories (id, name, icon, color, gradient_start, gradient_end, description) VALUES
  ('daily', 'Daily Routine', 'sunny', '#FF6B6B', '#FF6B6B', '#FF8E8E', 'Essential daily hair care routine'),
  ('weekly', 'Weekly Routine', 'calendar', '#4ECDC4', '#4ECDC4', '#6EE7DF', 'Weekly deep treatment routine'),
  ('monthly', 'Monthly Routine', 'moon', '#45B7D1', '#45B7D1', '#67C9E1', 'Monthly intensive care routine'),
  ('special', 'Special Occasion', 'star', '#96CEB4', '#96CEB4', '#B8E6C8', 'Special occasion hair care'),
  ('ai', 'AI Personalized', 'sparkles', '#FFEAA7', '#FFEAA7', '#FFF2C7', 'AI-generated personalized routine')
ON CONFLICT (id) DO NOTHING;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_routines_user_id ON public.user_routines(user_id);
CREATE INDEX IF NOT EXISTS idx_user_routines_category ON public.user_routines(category);
CREATE INDEX IF NOT EXISTS idx_routine_steps_routine_id ON public.routine_steps(routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_steps_order ON public.routine_steps(routine_id, step_order);
CREATE INDEX IF NOT EXISTS idx_routine_progress_user_routine ON public.routine_progress(user_id, routine_id);
CREATE INDEX IF NOT EXISTS idx_routine_notifications_user_id ON public.routine_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_routine_notifications_routine_id ON public.routine_notifications(routine_id);

-- Create triggers for updated_at
DROP TRIGGER IF EXISTS handle_user_routines_update ON public.user_routines;
CREATE TRIGGER handle_user_routines_update
BEFORE UPDATE ON public.user_routines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS handle_routine_steps_update ON public.routine_steps;
CREATE TRIGGER handle_routine_steps_update
BEFORE UPDATE ON public.routine_steps
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS handle_routine_progress_update ON public.routine_progress;
CREATE TRIGGER handle_routine_progress_update
BEFORE UPDATE ON public.routine_progress
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS handle_routine_notifications_update ON public.routine_notifications;
CREATE TRIGGER handle_routine_notifications_update
BEFORE UPDATE ON public.routine_notifications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS on all tables
ALTER TABLE public.user_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
DROP POLICY IF EXISTS "Users can manage their own routines" ON public.user_routines;
CREATE POLICY "Users can manage their own routines"
ON public.user_routines
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage steps of their routines" ON public.routine_steps;
CREATE POLICY "Users can manage steps of their routines"
ON public.routine_steps
FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.user_routines 
    WHERE user_routines.id = routine_steps.routine_id 
    AND user_routines.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_routines 
    WHERE user_routines.id = routine_steps.routine_id 
    AND user_routines.user_id = auth.uid()
  )
);

DROP POLICY IF EXISTS "Users can manage their own routine progress" ON public.routine_progress;
CREATE POLICY "Users can manage their own routine progress"
ON public.routine_progress
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage their own routine notifications" ON public.routine_notifications;
CREATE POLICY "Users can manage their own routine notifications"
ON public.routine_notifications
FOR ALL
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow public read access to routine categories" ON public.routine_categories;
CREATE POLICY "Allow public read access to routine categories"
ON public.routine_categories
FOR SELECT
USING (true);

-- Create the get_user_routines_with_progress function
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

-- Create the get_routine_with_steps function
CREATE OR REPLACE FUNCTION get_routine_with_steps(routine_uuid uuid)
RETURNS TABLE (
  routine_id uuid,
  title text,
  description text,
  category text,
  icon text,
  color text,
  is_ai_generated boolean,
  analysis_id uuid,
  created_at timestamptz,
  steps json
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
    ur.analysis_id,
    ur.created_at,
    COALESCE(
      json_agg(
        json_build_object(
          'id', rs.id,
          'step_order', rs.step_order,
          'title', rs.title,
          'description', rs.description,
          'duration', rs.duration
        ) ORDER BY rs.step_order
      ) FILTER (WHERE rs.id IS NOT NULL),
      '[]'::json
    ) as steps
  FROM public.user_routines ur
  LEFT JOIN public.routine_steps rs ON ur.id = rs.routine_id
  WHERE ur.id = routine_uuid
  GROUP BY ur.id, ur.title, ur.description, ur.category, ur.icon, ur.color, ur.is_ai_generated, ur.analysis_id, ur.created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test the function
SELECT 'Database setup completed successfully!' as status;
