-- Supabase Storage Policies for a bucket named 'user_hair_images'
-- This bucket will store images uploaded by users, organized by user_id.

-- First, ensure the bucket exists. This command is typically run via Supabase Studio UI
-- or programmatically. If running this SQL directly, you might need to create the bucket manually first
-- if it doesn't exist, or use a Supabase client library to ensure its creation.
-- Example: INSERT INTO storage.buckets (id, name, public) VALUES ('user_hair_images', 'user_hair_images', false)
-- ON CONFLICT (id) DO NOTHING;
-- For this script, we'll assume the bucket 'user_hair_images' has been created and is NOT public.

-- Policy: Allow authenticated users to list their own folder.
DROP POLICY IF EXISTS "Allow authenticated user to list own folder" ON storage.objects;
CREATE POLICY "Allow authenticated user to list own folder"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'user_hair_images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Allow authenticated users to select/download files from their own folder.
DROP POLICY IF EXISTS "Allow authenticated user to select own files" ON storage.objects;
CREATE POLICY "Allow authenticated user to select own files"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (bucket_id = 'user_hair_images' AND auth.uid() = owner); -- Simpler check using owner if files are uploaded with owner set to auth.uid()
    -- OR more explicitly if using folder structure:
    -- USING (bucket_id = 'user_hair_images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Policy: Allow authenticated users to upload files into their own folder.
-- The folder will be named after their user_id.
-- Example path: user_id/image_name.jpg
DROP POLICY IF EXISTS "Allow authenticated user to upload to own folder" ON storage.objects;
CREATE POLICY "Allow authenticated user to upload to own folder"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'user_hair_images' AND
        auth.uid()::text = (storage.foldername(name))[1] AND
        -- Optionally, restrict file types here. This example allows common image types.
        -- (lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'gif')) AND -- This requires storage.extension function
        -- Optionally, restrict file size here (e.g., less than 5MB).
        -- size < 5 * 1024 * 1024 -- This check is on the metadata, might need a trigger for more robust validation.
        true -- Placeholder if not adding specific type/size checks in policy directly
    );

-- Policy: Allow authenticated users to update files in their own folder.
DROP POLICY IF EXISTS "Allow authenticated user to update own files" ON storage.objects;
CREATE POLICY "Allow authenticated user to update own files"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (bucket_id = 'user_hair_images' AND auth.uid() = owner)
    WITH CHECK (bucket_id = 'user_hair_images' AND auth.uid() = owner);
    -- OR using folder structure:
    -- USING (bucket_id = 'user_hair_images' AND auth.uid()::text = (storage.foldername(name))[1])
    -- WITH CHECK (bucket_id = 'user_hair_images' AND auth.uid()::text = (storage.foldername(name))[1]);


-- Policy: Allow authenticated users to delete files from their own folder.
DROP POLICY IF EXISTS "Allow authenticated user to delete own files" ON storage.objects;
CREATE POLICY "Allow authenticated user to delete own files"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (bucket_id = 'user_hair_images' AND auth.uid() = owner);
    -- OR using folder structure:
    -- USING (bucket_id = 'user_hair_images' AND auth.uid()::text = (storage.foldername(name))[1]);

COMMENT ON POLICY "Allow authenticated user to list own folder" ON storage.objects IS
'Users can list the contents of their own folder within the user_hair_images bucket.';
COMMENT ON POLICY "Allow authenticated user to select own files" ON storage.objects IS
'Users can download/read files they own or that are within their user-specific folder in user_hair_images bucket.';
COMMENT ON POLICY "Allow authenticated user to upload to own folder" ON storage.objects IS
'Users can upload new files into their own user-specific folder in user_hair_images bucket. Path must start with their user_id.';
COMMENT ON POLICY "Allow authenticated user to update own files" ON storage.objects IS
'Users can update files they own or that are within their user-specific folder in user_hair_images bucket.';
COMMENT ON POLICY "Allow authenticated user to delete own files" ON storage.objects IS
'Users can delete files they own or that are within their user-specific folder in user_hair_images bucket.';

-- Note on file type and size restrictions:
-- While some basic checks can be attempted in policies (like extension), more robust validation
-- (e.g., checking actual MIME type, more complex size limits based on subscription tier)
-- is often better handled using Supabase Edge Functions triggered on file upload,
-- or client-side validation before upload, or a combination.
-- The `storage.foldername(name)` array access `[1]` assumes the first part of the path is the user_id.
-- e.g. if name is 'user_uuid/image.png', (storage.foldername(name))[1] is 'user_uuid'.
-- If name is 'image.png' (uploading to root), (storage.foldername(name)) might be empty or different.
-- Ensure your client-side upload logic creates paths like 'user_id/filename.ext'.
-- The `auth.uid() = owner` check is simpler if the `owner` field of storage.objects is reliably set to the uploader's UID.
-- Supabase client libraries usually handle setting the owner field correctly. Using `owner` is often preferred.
-- For policies that use `(storage.foldername(name))[1]`, ensure that files are always uploaded into a top-level folder named with the user's UID.
-- e.g., `client.storage.from('user_hair_images').upload(`${userId}/${fileName}`, file)`
-- If files can be uploaded without a top-level user ID folder, these policies might be too restrictive or too permissive.
-- The policies above using `auth.uid() = owner` are generally more robust if your client library sets the owner correctly.
-- I've included both approaches (folder path check and owner check) as comments for consideration.
-- For the main policy, I've opted for the `auth.uid() = owner` where it simplifies things, assuming standard client usage.
-- For upload (INSERT), explicitly checking the path structure `(storage.foldername(name))[1]` is good for enforcement.
