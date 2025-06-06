-- Enable Row Level Security (RLS) for all tables by default.
-- ALTER TABLE public.your_table_name ENABLE ROW LEVEL SECURITY; -- Example, uncomment and modify for actual tables

-- Create a table for public user profiles
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users NOT NULL PRIMARY KEY, -- Links to auth.users table
  updated_at TIMESTAMPTZ,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT, -- URL to a storage object
  hair_goal TEXT, -- User's primary hair goal
  allergies TEXT, -- Comma-separated list of known allergies/sensitivities

  CONSTRAINT username_length CHECK (char_length(username) >= 3)
);

-- Set up Row Level Security (RLS) policies for the profiles table
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile.
CREATE POLICY "Users can view their own profile."
  ON public.profiles FOR SELECT
  USING ( auth.uid() = id );

-- Policy: Users can insert their own profile.
CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

-- Policy: Users can update their own profile.
CREATE POLICY "Users can update their own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id )
  WITH CHECK ( auth.uid() = id );

-- Policy: Users cannot delete their own profile (optional, can be changed).
-- CREATE POLICY "Users can delete their own profile."
--   ON public.profiles FOR DELETE
--   USING ( auth.uid() = id );


-- Create a table for hair analysis results
CREATE TABLE public.hair_analysis_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(), -- Auto-generate UUID
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  image_url TEXT NOT NULL, -- URL to the uploaded image in Supabase Storage
  analysis_data JSONB, -- Stores the structured JSON response from the AI service
  -- Example fields within analysis_data: porosity, density, curl_pattern, damage_level, recommendations
  notes TEXT -- User's personal notes about this analysis
);

-- Set up RLS for hair_analysis_results
ALTER TABLE public.hair_analysis_results ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own analysis results.
CREATE POLICY "Users can view their own analysis results."
  ON public.hair_analysis_results FOR SELECT
  USING ( auth.uid() = user_id );

-- Policy: Users can insert their own analysis results.
CREATE POLICY "Users can insert their own analysis results."
  ON public.hair_analysis_results FOR INSERT
  WITH CHECK ( auth.uid() = user_id );

-- Policy: Users can update their own analysis notes (or other specific fields).
CREATE POLICY "Users can update their own analysis notes."
  ON public.hair_analysis_results FOR UPDATE
  USING ( auth.uid() = user_id )
  WITH CHECK ( auth.uid() = user_id ); -- Allow updating if they are the owner

-- Policy: Users can delete their own analysis results.
CREATE POLICY "Users can delete their own analysis results."
  ON public.hair_analysis_results FOR DELETE
  USING ( auth.uid() = user_id );


-- Create a table for user routines
CREATE TABLE public.routines (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users NOT NULL,
  created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMPTZ,
  title TEXT NOT NULL,
  description TEXT,
  routine_type TEXT, -- e.g., "Wash Day", "Daily Moisture", "Deep Condition"
  steps JSONB -- Array of objects, e.g., [{step_number: 1, instruction: "...", products_suggested: ["...", "..."]}]
);

-- Set up RLS for routines
ALTER TABLE public.routines ENABLE ROW LEVEL SECURITY;

-- Policies for routines (similar to hair_analysis_results)
CREATE POLICY "Users can view their own routines."
  ON public.routines FOR SELECT USING ( auth.uid() = user_id );
CREATE POLICY "Users can insert their own routines."
  ON public.routines FOR INSERT WITH CHECK ( auth.uid() = user_id );
CREATE POLICY "Users can update their own routines."
  ON public.routines FOR UPDATE USING ( auth.uid() = user_id ) WITH CHECK ( auth.uid() = user_id );
CREATE POLICY "Users can delete their own routines."
  ON public.routines FOR DELETE USING ( auth.uid() = user_id );


-- Create Supabase Storage bucket for user uploaded images if it doesn't exist.
-- This needs to be done via Supabase Dashboard or Management API,
-- but it's good practice to note it here.
-- Example policy for storage (apply via Supabase Dashboard):
-- Bucket name: "hair_images"
-- Policy for SELECT: (bucket_id = 'hair_images' AND auth.uid() = (storage.foldername(name))[1])
-- Policy for INSERT: (bucket_id = 'hair_images' AND auth.uid() = (storage.foldername(name))[1])
-- Policy for UPDATE: (bucket_id = 'hair_images' AND auth.uid() = (storage.foldername(name))[1])
-- Policy for DELETE: (bucket_id = 'hair_images' AND auth.uid() = (storage.foldername(name))[1])
-- The folder structure in storage could be: hair_images/{user_id}/{image_name.jpg}


-- Function to automatically create a public profile when a new user signs up in auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER -- Important for functions that write to tables with RLS
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, hair_goal, allergies)
  VALUES (
    NEW.id,
    NEW.email, -- Or some other default, ensure it's unique or handle conflicts
    NULL, -- full_name
    NULL, -- hair_goal
    NULL  -- allergies
  );
  RETURN NEW;
END;
$$;

-- Trigger to call the function after a new user is created
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Consider adding indexes for frequently queried columns, e.g.,
-- CREATE INDEX idx_profiles_username ON public.profiles(username);
-- CREATE INDEX idx_analysis_user_id ON public.hair_analysis_results(user_id);
-- CREATE INDEX idx_routines_user_id ON public.routines(user_id);

-- Placeholder for future tables like 'ingredients', 'products', 'progress_photos'
-- CREATE TABLE public.ingredients (
--   id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
--   name TEXT UNIQUE NOT NULL,
--   description TEXT,
--   properties JSONB -- e.g., { "moisturizing": true, "protein": false }
-- );
-- RLS for ingredients could be public read, admin write.

-- Note: The uuid_generate_v4() function requires the "uuid-ossp" extension.
-- Ensure it's enabled in your Supabase project (usually is by default).
-- You can check/enable it under Database > Extensions in the Supabase dashboard.

-- Final check on RLS policies. Ensure they are restrictive enough for your needs.
-- By default, if no policies match, access is denied.
-- This script assumes that the 'public' schema is the default search path.
-- Supabase projects are typically configured this way.

-- Remember to run these statements in the Supabase SQL Editor.
-- Go to your Supabase project, then "SQL Editor", then "+ New query", paste this content, and click "RUN".
