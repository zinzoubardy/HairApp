-- File: sql/02_create_progress_log.sql
-- Adjustments for existing public.progress_log table.
-- This script primarily ensures RLS, policies, and triggers are applied.

-- The table structure provided by the user:
-- CREATE TABLE public.progress_log (
--   id uuid NOT NULL DEFAULT uuid_generate_v4(),
--   user_id uuid NOT NULL,
--   log_date date NOT NULL,
--   notes text NOT NULL,
--   image_url text,
--   created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
--   updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
--   CONSTRAINT progress_log_pkey PRIMARY KEY (id),
--   CONSTRAINT progress_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
-- );

-- Ensure the table exists (idempotent, matching user's schema for key parts)
CREATE TABLE IF NOT EXISTS public.progress_log (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    log_date DATE NOT NULL, -- Adjusted to DATE as per user schema
    notes TEXT NOT NULL,
    image_url TEXT, -- Optional URL to an image associated with the log entry
    -- Removed tags TEXT[]
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security if not already enabled
ALTER TABLE public.progress_log ENABLE ROW LEVEL SECURITY;

-- Indexes (ensure they are compatible or create if not exists)
CREATE INDEX IF NOT EXISTS idx_progress_log_user_id ON public.progress_log(user_id);
CREATE INDEX IF NOT EXISTS idx_progress_log_log_date ON public.progress_log(log_date DESC); -- Index on DATE type is fine

-- RLS Policies for progress_log:
-- Users can manage their own progress logs.

DROP POLICY IF EXISTS "Allow individual insert access on progress_log" ON public.progress_log;
CREATE POLICY "Allow individual insert access on progress_log"
    ON public.progress_log
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow individual select access on progress_log" ON public.progress_log;
CREATE POLICY "Allow individual select access on progress_log"
    ON public.progress_log
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow individual update access on progress_log" ON public.progress_log;
CREATE POLICY "Allow individual update access on progress_log"
    ON public.progress_log
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Allow individual delete access on progress_log" ON public.progress_log;
CREATE POLICY "Allow individual delete access on progress_log"
    ON public.progress_log
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- Trigger to update 'updated_at' timestamp
-- Assumes public.handle_updated_at() function is available (created in 01_create_coloring_recipes.sql or similar)
DROP TRIGGER IF EXISTS on_progress_log_updated ON public.progress_log;
CREATE TRIGGER on_progress_log_updated
    BEFORE UPDATE ON public.progress_log
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

COMMENT ON TABLE public.progress_log IS 'User-specific logs for tracking haircare journey. Schema adjusted to match existing structure.';
COMMENT ON COLUMN public.progress_log.user_id IS 'References the user who owns this log entry.';
-- Removed comment for non-existent 'tags' column
COMMENT ON COLUMN public.progress_log.log_date IS 'The date the log entry pertains to.';
