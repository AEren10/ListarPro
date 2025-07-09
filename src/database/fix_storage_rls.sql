-- Önce mevcut politikaları temizleyelim
DROP POLICY IF EXISTS "Anyone can view images" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload images" ON storage.objects;
DROP POLICY IF EXISTS "Users can update their own images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own images" ON storage.objects;

-- Yeni politikaları ekleyelim
-- 1. Herkes görüntüleyebilir
CREATE POLICY "Anyone can view images"
ON storage.objects FOR SELECT
TO public
USING (true);

-- 2. Giriş yapmış kullanıcılar yükleyebilir
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (true);

-- 3. Kullanıcılar kendi resimlerini güncelleyebilir
CREATE POLICY "Users can update their own images"
ON storage.objects FOR UPDATE
TO authenticated
USING (auth.uid() = owner);

-- 4. Kullanıcılar kendi resimlerini silebilir
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
TO authenticated
USING (auth.uid() = owner);

-- Bucket'ı public yapalım
UPDATE storage.buckets 
SET public = true 
WHERE id = 'shop-images'; 