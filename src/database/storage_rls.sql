-- Clean up existing storage policies
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Create new storage policies
-- 1. Allow public viewing of images
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
TO public
USING (true);

-- 2. Allow authenticated users to upload images
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Allow users to update their own images
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner);

-- 4. Allow users to delete their own images
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner);

-- Make the shop-images bucket public
UPDATE storage.buckets 
SET public = true 
WHERE id = 'shop-images'; 