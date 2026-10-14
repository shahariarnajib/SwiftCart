-- ==============================================================================
-- SWIFT CART - PRODUCTION SEED DATA & INITIAL SETUP
-- Migration: 20261012_005_seed_data.sql
-- Description: Store settings, categories, brands, shipping zones, coupons, banners
-- ==============================================================================

-- 1. STORE SETTINGS
INSERT INTO public.store_settings (key, value) VALUES
    ('store_name', 'Swift Cart'),
    ('tagline', 'Shop Smarter. Shop Faster.'),
    ('currency', 'BDT'),
    ('currency_symbol', '৳'),
    ('timezone', 'Asia/Dhaka'),
    ('contact_phone', '+880 1700-000000'),
    ('contact_email', 'support@swiftcart.com.bd'),
    ('whatsapp_number', '+880 1700-000000'),
    ('warehouse_address', 'Plot 12, Road 11, Banani, Dhaka-1213, Bangladesh'),
    ('delivery_inside_dhaka', '60'),
    ('delivery_outside_dhaka', '120'),
    ('free_shipping_threshold', '2500'),
    ('default_low_stock_threshold', '5'),
    ('facebook_url', 'https://facebook.com/swiftcartbd'),
    ('instagram_url', 'https://instagram.com/swiftcartbd'),
    ('announcement_text', '🔥 Free express delivery across Bangladesh on orders over ৳2,500!'),
    ('announcement_enabled', 'true')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;

-- 2. SHIPPING ZONES
INSERT INTO public.shipping_zones (name, fee, estimated_delivery, is_active, is_default) VALUES
    ('Inside Dhaka City', 60.00, '24 - 48 Hours', true, true),
    ('Outside Dhaka / Nationwide', 120.00, '2 - 4 Business Days', true, false)
ON CONFLICT DO NOTHING;

-- 3. CATEGORIES
INSERT INTO public.categories (id, name, slug, description, image, icon, is_visible, order_index) VALUES
    ('c1111111-1111-1111-1111-111111111111', 'Smartphones & Tablets', 'smartphones-tablets', 'Latest flagship and budget mobile devices', 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=600&q=80', 'Smartphone', true, 1),
    ('c2222222-2222-2222-2222-222222222222', 'Audio & Headphones', 'audio-headphones', 'Premium wireless headphones, earbuds, and speakers', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=600&q=80', 'Headphones', true, 2),
    ('c3333333-3333-3333-3333-333333333333', 'Smartwatches & Wearables', 'smartwatches-wearables', 'Fitness trackers and high-tech connected watches', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80', 'Watch', true, 3),
    ('c4444444-4444-4444-4444-444444444444', 'Computing & Accessories', 'computing-accessories', 'Keyboards, power banks, chargers, and tech accessories', 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&w=600&q=80', 'Laptop', true, 4),
    ('c5555555-5555-5555-5555-555555555555', 'Smart Home & Lifestyle', 'smart-home-lifestyle', 'Smart plugs, automated lighting, and modern home tech', 'https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=600&q=80', 'Home', true, 5)
ON CONFLICT (slug) DO NOTHING;

-- 4. BRANDS
INSERT INTO public.brands (name, slug, logo, description, is_visible) VALUES
    ('Apple', 'apple', 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=200&q=80', 'Premium iOS devices and accessories', true),
    ('Sony', 'sony', 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=200&q=80', 'Industry leading audio and visual devices', true),
    ('Samsung', 'samsung', 'https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=200&q=80', 'Galaxy devices, wearables, and displays', true),
    ('Anker', 'anker', 'https://images.unsplash.com/photo-1583394838336-acd977736f90?auto=format&fit=crop&w=200&q=80', 'Charging and audio accessories', true)
ON CONFLICT (slug) DO NOTHING;

-- 5. COUPONS
INSERT INTO public.coupons (code, description, discount_type, discount_value, min_order_amount, max_discount_amount, is_active, usage_limit) VALUES
    ('WELCOME10', '10% Discount for New Shoppers', 'PERCENTAGE', 10.00, 1000.00, 500.00, true, 500),
    ('SWIFT100', 'Flat ৳100 Off on orders above ৳1,500', 'FIXED', 100.00, 1500.00, 100.00, true, 1000)
ON CONFLICT (code) DO NOTHING;

-- 6. HERO BANNERS
INSERT INTO public.banners (title, subtitle, badge, button_text, button_link, image_url, section, order_index, is_active) VALUES
    ('Next-Gen Sound & Audio Gear', 'Experience unmatched clarity with our authentic active noise cancelling collection.', 'LIMITED TIME OFFER', 'Explore Audio', '/category/audio-headphones', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1200&q=80', 'HERO', 1, true),
    ('Smart Living. Connected World.', 'Smartwatches, fitness bands, and wearable tech with official warranty.', 'NEW ARRIVALS 2026', 'Shop Wearables', '/category/smartwatches-wearables', 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1200&q=80', 'HERO', 2, true)
ON CONFLICT DO NOTHING;

-- 7. INITIAL SUPER ADMIN ACCOUNT SCRIPT
-- Default password: admin123 (bcrypt hashed)
-- Password hash: $2a$10$wO364L8f/nC8fAil8Q/69eg.4N49u8oMsmD56y5f2L4BvA/pZ2Z4S
INSERT INTO public.admin_users (email, username, password_hash, name, role, status) VALUES
    ('admin@swiftcart.com.bd', 'admin', '$2a$10$wO364L8f/nC8fAil8Q/69eg.4N49u8oMsmD56y5f2L4BvA/pZ2Z4S', 'Super Administrator', 'SUPER_ADMIN', 'ACTIVE')
ON CONFLICT (username) DO NOTHING;
