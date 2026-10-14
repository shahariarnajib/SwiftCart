-- ==============================================================================
-- SWIFT CART - STORAGE BUCKETS & ACCESS POLICIES
-- Migration: 20261012_003_storage_setup.sql
-- Description: Supabase Storage configuration for product images, banners, categories
-- ==============================================================================

-- 1. INSERT STORAGE BUCKETS
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('product-images', 'product-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']),
    ('category-images', 'category-images', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml']),
    ('banners', 'banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('invoices', 'invoices', false, 10485760, ARRAY['application/pdf'])
ON CONFLICT (id) DO UPDATE SET
    public = EXCLUDED.public,
    file_size_limit = EXCLUDED.file_size_limit,
    allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. STORAGE POLICIES: PUBLIC READ ACCESS FOR PUBLIC ASSETS
CREATE POLICY "Public Read Product Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'product-images');

CREATE POLICY "Public Read Category Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'category-images');

CREATE POLICY "Public Read Banners"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- 3. STORAGE POLICIES: ADMIN UPLOAD & MANAGE ACCESS
CREATE POLICY "Admin Upload Product Images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'product-images' AND
    (public.is_admin() OR auth.role() = 'service_role')
);

CREATE POLICY "Admin Delete Product Images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'product-images' AND
    (public.is_admin() OR auth.role() = 'service_role')
);

CREATE POLICY "Admin Upload Category Images"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'category-images' AND
    (public.is_admin() OR auth.role() = 'service_role')
);

CREATE POLICY "Admin Delete Category Images"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'category-images' AND
    (public.is_admin() OR auth.role() = 'service_role')
);

CREATE POLICY "Admin Upload Banners"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'banners' AND
    (public.is_admin() OR auth.role() = 'service_role')
);

CREATE POLICY "Admin Delete Banners"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'banners' AND
    (public.is_admin() OR auth.role() = 'service_role')
);

CREATE POLICY "Admin Invoices Access"
ON storage.objects FOR ALL
USING (
    bucket_id = 'invoices' AND
    (public.is_admin() OR auth.role() = 'service_role')
);
