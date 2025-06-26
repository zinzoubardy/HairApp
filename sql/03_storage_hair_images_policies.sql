-- Supabase Storage Policies for bucket 'user.hair.images'
-- Revised based on successful minimal policy test.

-- Bucket name: user.hair.images (ensure this bucket exists and is not public)

-- Policy: Allow authenticated users to list files in their own folder.
-- Assumes files are stored in a path like 'user_id/filename.ext'.
-- (storage.foldername(name)) returns an array of path components.
-- (storage.foldername(name))[1] should be the user_id.
DROP POLICY IF EXISTS "Allow authenticated user to list own folder in user.hair.images" ON storage.objects;
CREATE POLICY "Allow authenticated user to list own folder in user.hair.images"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'user.hair.images' AND
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Policy: Allow authenticated users to select/download their own files.
-- This policy relies on the 'owner' field of the object being set to the user's UID upon upload.
-- Supabase client libraries typically handle this. This is often more robust than path parsing.
DROP POLICY IF EXISTS "Allow authenticated user to select own files from user.hair.images" ON storage.objects;
CREATE POLICY "Allow authenticated user to select own files from user.hair.images"
    ON storage.objects
    FOR SELECT
    TO authenticated
    USING (
        bucket_id = 'user.hair.images' AND
        auth.uid()::text = owner::text  -- Check if the authenticated user is the owner of the file
    );

-- Policy: Allow authenticated users to upload files into their own folder.
-- Path must start with user_id: 'user_id/filename.ext'
DROP POLICY IF EXISTS "Allow authenticated user to upload to own folder in user.hair.images" ON storage.objects;
CREATE POLICY "Allow authenticated user to upload to own folder in user.hair.images"
    ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (
        bucket_id = 'user.hair.images' AND
        auth.uid()::text = (storage.foldername(name))[1]
        -- Optional: Add checks for file type or size here if needed, e.g.
        -- AND lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png')
        -- AND (storage.metadata ->> 'size')::bigint < 5000000 -- Check size from metadata (example: < 5MB)
    );

-- Policy: Allow authenticated users to update their own files.
DROP POLICY IF EXISTS "Allow authenticated user to update own files in user.hair.images" ON storage.objects;
CREATE POLICY "Allow authenticated user to update own files in user.hair.images"
    ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'user.hair.images' AND
        auth.uid()::text = owner::text -- User can update an object if they are the owner
    )
    WITH CHECK (
        bucket_id = 'user.hair.images' AND
        auth.uid()::text = owner::text
        -- If you also want to enforce that they can only update within their folder path, add:
        -- AND auth.uid()::text = (storage.foldername(name))[1]
        -- However, owner check is usually sufficient for UPDATE.
    );

-- Policy: Allow authenticated users to delete their own files.
DROP POLICY IF EXISTS "Allow authenticated user to delete own files from user.hair.images" ON storage.objects;
CREATE POLICY "Allow authenticated user to delete own files from user.hair.images"
    ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'user.hair.images' AND
        auth.uid()::text = owner::text -- User can delete an object if they are the owner
    );

COMMENT ON POLICY "Allow authenticated user to list own folder in user.hair.images" ON storage.objects IS
'Users can list files within their own user_id-named folder in the user.hair.images bucket.';
COMMENT ON POLICY "Allow authenticated user to select own files from user.hair.images" ON storage.objects IS
'Users can download/read files they own in the user.hair.images bucket.';
COMMENT ON POLICY "Allow authenticated user to upload to own folder in user.hair.images" ON storage.objects IS
'Users can upload new files into their own user_id-named folder (e.g., user_id/filename.ext) in the user.hair.images bucket.';
COMMENT ON POLICY "Allow authenticated user to update own files in user.hair.images" ON storage.objects IS
'Users can update files they own in the user.hair.images bucket.';
COMMENT ON POLICY "Allow authenticated user to delete own files from user.hair.images" ON storage.objects IS
'Users can delete files they own in the user.hair.images bucket.';

-- Notes:
-- 1. Bucket Name: Ensure 'user.hair.images' is correct.
-- 2. File Paths for Upload: For policies relying on `(storage.foldername(name))[1]`, your application must upload files to paths like `USER_ID/your_file_name.jpg`.
-- 3. Owner Field: Policies using `auth.uid() = owner` assume that the `owner` field on `storage.objects` is correctly populated with the uploader's `auth.uid()`. Supabase client libraries usually do this.
-- 4. File Type/Size Checks: For more robust validation of file types or sizes, consider using Supabase Edge Functions triggered on upload, in addition to or instead of policy checks. Policy checks on metadata (like size) are possible but might have limitations.
-- 5. Test Thoroughly: After applying, test all operations (list, select/download, insert/upload, update, delete) with different user accounts to ensure policies work as expected.
