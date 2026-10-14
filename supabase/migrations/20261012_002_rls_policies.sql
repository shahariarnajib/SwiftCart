-- ==============================================================================
-- SWIFT CART - ROW LEVEL SECURITY (RLS) POLICIES
-- Migration: 20261012_002_rls_policies.sql
-- Description: Strict access control for Public Storefront, Customers, & Admins
-- ==============================================================================

-- 1. ENABLE RLS ON ALL PUBLIC TABLES
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shipping_zones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.store_settings ENABLE ROW LEVEL SECURITY;

-- 2. HELPER FUNCTIONS FOR AUTHORIZATION
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE auth_user_id = auth.uid()
          AND status = 'ACTIVE'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.admin_users
        WHERE auth_user_id = auth.uid()
          AND role = 'SUPER_ADMIN'
          AND status = 'ACTIVE'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. POLICIES: CATEGORIES & BRANDS
-- Public can read visible categories
CREATE POLICY "Public can view visible categories"
ON public.categories FOR SELECT
USING (is_visible = true OR public.is_admin());

CREATE POLICY "Admins have full access to categories"
ON public.categories FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Brands
CREATE POLICY "Public can view visible brands"
ON public.brands FOR SELECT
USING (is_visible = true OR public.is_admin());

CREATE POLICY "Admins have full access to brands"
ON public.brands FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 4. POLICIES: PRODUCTS & IMAGES & VARIANTS
-- Public can only view ACTIVE products
CREATE POLICY "Public can view active products"
ON public.products FOR SELECT
USING (status = 'ACTIVE' OR public.is_admin());

CREATE POLICY "Admins have full access to products"
ON public.products FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Public can view product images"
ON public.product_images FOR SELECT
USING (true);

CREATE POLICY "Admins have full access to product images"
ON public.product_images FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Public can view product variants"
ON public.product_variants FOR SELECT
USING (true);

CREATE POLICY "Admins have full access to product variants"
ON public.product_variants FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. POLICIES: BANNERS & SHIPPING & STORE SETTINGS
CREATE POLICY "Public can view active banners"
ON public.banners FOR SELECT
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full access to banners"
ON public.banners FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Public can view active shipping zones"
ON public.shipping_zones FOR SELECT
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full access to shipping zones"
ON public.shipping_zones FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Public can view public store settings"
ON public.store_settings FOR SELECT
USING (true);

CREATE POLICY "Admins have full access to store settings"
ON public.store_settings FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. POLICIES: COUPONS
-- Public can view active coupons for redemption calculation
CREATE POLICY "Public can view active coupons"
ON public.coupons FOR SELECT
USING (is_active = true OR public.is_admin());

CREATE POLICY "Admins have full access to coupons"
ON public.coupons FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 7. POLICIES: ORDERS & ORDER ITEMS (CUSTOMER ISOLATION & ADMIN ACCESS)
-- Customers can insert orders (checkout)
CREATE POLICY "Storefront can place orders"
ON public.orders FOR INSERT
WITH CHECK (true);

-- Customers can view only their own orders if authenticated
CREATE POLICY "Customers can view their own orders"
ON public.orders FOR SELECT
USING (
    (auth.uid() IS NOT NULL AND customer_id IN (
        SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
    ))
    OR public.is_admin()
);

-- Admins can update/manage orders
CREATE POLICY "Admins can update orders"
ON public.orders FOR UPDATE
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Order items
CREATE POLICY "Storefront can insert order items"
ON public.order_items FOR INSERT
WITH CHECK (true);

CREATE POLICY "Customers and admins can view order items"
ON public.order_items FOR SELECT
USING (
    order_id IN (
        SELECT id FROM public.orders WHERE
        (auth.uid() IS NOT NULL AND customer_id IN (
            SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
        ))
        OR public.is_admin()
    )
    OR public.is_admin()
);

-- Order Status History
CREATE POLICY "Admins and customer can view status history"
ON public.order_status_history FOR SELECT
USING (
    order_id IN (
        SELECT id FROM public.orders WHERE
        (auth.uid() IS NOT NULL AND customer_id IN (
            SELECT id FROM public.customers WHERE auth_user_id = auth.uid()
        ))
        OR public.is_admin()
    )
);

CREATE POLICY "Admins can insert order status history"
ON public.order_status_history FOR INSERT
WITH CHECK (public.is_admin());

-- 8. POLICIES: CUSTOMERS & CUSTOMER NOTES
CREATE POLICY "Storefront can insert or update customer record"
ON public.customers FOR INSERT
WITH CHECK (true);

CREATE POLICY "Customer profile access"
ON public.customers FOR SELECT
USING (
    (auth.uid() IS NOT NULL AND auth_user_id = auth.uid())
    OR public.is_admin()
);

CREATE POLICY "Admins have full access to customer notes"
ON public.customer_notes FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 9. POLICIES: INVENTORY MOVEMENTS & PAYMENTS & ADMIN LOGS
CREATE POLICY "Only admins can view inventory movements"
ON public.inventory_movements FOR SELECT
USING (public.is_admin());

CREATE POLICY "Only admins can insert inventory movements"
ON public.inventory_movements FOR INSERT
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can view and manage payments"
ON public.payments FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can view and insert admin activity logs"
ON public.admin_activity_logs FOR ALL
USING (public.is_admin())
WITH CHECK (public.is_admin());

CREATE POLICY "Super Admins can manage admin users"
ON public.admin_users FOR ALL
USING (public.is_super_admin() OR auth_user_id = auth.uid())
WITH CHECK (public.is_super_admin());
