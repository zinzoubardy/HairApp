-- ### coloring_recipes Table ###
CREATE TABLE IF NOT EXISTS public.coloring_recipes (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  ingredients jsonb NOT NULL,
  instructions text NOT NULL,
  description text,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT coloring_recipes_pkey PRIMARY KEY (id)
);

-- RLS for coloring_recipes: Public read, admin write (example policy)
-- Ensure RLS is enabled on the table in Supabase dashboard first.
-- CREATE POLICY "Allow public read access to coloring recipes"
-- ON public.coloring_recipes
-- FOR SELECT
-- USING (true);
-- (Further policies for admin insert/update/delete would be needed and depend on admin role setup)


-- ### progress_log Table ###
CREATE TABLE IF NOT EXISTS public.progress_log (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid NOT NULL,
  log_date date NOT NULL,
  notes text NOT NULL,
  image_url text,
  created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT progress_log_pkey PRIMARY KEY (id),
  CONSTRAINT progress_log_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- RLS for progress_log: User can manage their own logs
-- Ensure RLS is enabled on the table in Supabase dashboard first.
-- CREATE POLICY "Allow individual access to own progress logs"
-- ON public.progress_log
-- FOR ALL
-- USING (auth.uid() = user_id)
-- WITH CHECK (auth.uid() = user_id);


-- ### profiles Table Updates ###
-- Add created_at column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS(SELECT 1 FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'profiles' AND column_name = 'created_at') THEN
    ALTER TABLE public.profiles ADD COLUMN created_at timestamptz NOT NULL DEFAULT timezone('utc'::text, now());
  END IF;
END $$;


-- ### Function and Trigger for automatic updated_at timestamp ###
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = timezone('utc'::text, now());
   RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to routines table for updated_at
-- (Ensure routines table already has an updated_at column of type timestamptz)
DROP TRIGGER IF EXISTS handle_routine_update ON public.routines;
CREATE TRIGGER handle_routine_update
BEFORE UPDATE ON public.routines
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Apply trigger to coloring_recipes table for updated_at
DROP TRIGGER IF EXISTS handle_coloring_recipe_update ON public.coloring_recipes;
CREATE TRIGGER handle_coloring_recipe_update
BEFORE UPDATE ON public.coloring_recipes
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Apply trigger to progress_log table for updated_at
DROP TRIGGER IF EXISTS handle_progress_log_update ON public.progress_log;
CREATE TRIGGER handle_progress_log_update
BEFORE UPDATE ON public.progress_log
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();


-- Note on RLS policies: The SQL for creating RLS policies is commented out.
-- RLS should be enabled on each table via the Supabase Dashboard first.
-- Then, these policies (or similar ones) can be added via the Supabase SQL editor.
-- Ensure you understand how RLS works with your specific user roles and access patterns.

```
