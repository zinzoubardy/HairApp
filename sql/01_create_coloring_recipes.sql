-- File: sql/01_create_coloring_recipes.sql
-- Adjustments for existing public.coloring_recipes table.
-- This script primarily ensures RLS, policies, and triggers are applied.

-- The table structure provided by the user:
-- CREATE TABLE public.coloring_recipes (
--   id uuid NOT NULL DEFAULT uuid_generate_v4(),
--   name text NOT NULL,
--   ingredients jsonb NOT NULL,
--   instructions text NOT NULL,
--   description text,
--   image_url text,
--   created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
--   updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
--   CONSTRAINT coloring_recipes_pkey PRIMARY KEY (id)
-- );

-- Ensure the table exists (idempotent, matching user's schema for key parts)
CREATE TABLE IF NOT EXISTS public.coloring_recipes (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name TEXT NOT NULL,
    ingredients JSONB NOT NULL,
    instructions TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    -- Removed category, preparation_time_minutes, application_time_minutes
    created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security if not already enabled
-- Note: Supabase UI might show this as enabled by default on new tables.
-- This command ensures it is explicitly set.
ALTER TABLE public.coloring_recipes ENABLE ROW LEVEL SECURITY;

-- Policies for coloring_recipes:
-- Making recipes publicly readable by anyone (authenticated or not).
DROP POLICY IF EXISTS "Allow public read access on coloring_recipes" ON public.coloring_recipes;
CREATE POLICY "Allow public read access on coloring_recipes"
    ON public.coloring_recipes
    FOR SELECT
    USING (true);

-- Admin/developer responsibility for insert/update/delete is assumed for now.
-- If end-users were to submit recipes, more granular policies would be needed.

COMMENT ON TABLE public.coloring_recipes IS 'Stores natural hair coloring recipes, including ingredients, instructions, and other details. Schema adjusted to match existing structure.';
COMMENT ON COLUMN public.coloring_recipes.ingredients IS 'JSONB containing recipe ingredients and quantities.';
-- Removed comment for non-existent 'category' column

-- Trigger to update 'updated_at' timestamp
-- This function might already exist if created by another script.
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply the trigger to coloring_recipes table
DROP TRIGGER IF EXISTS on_coloring_recipes_updated ON public.coloring_recipes;
CREATE TRIGGER on_coloring_recipes_updated
    BEFORE UPDATE ON public.coloring_recipes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
