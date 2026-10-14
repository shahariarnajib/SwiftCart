-- ==============================================================================
-- SWIFT CART - FUNCTIONS, TRIGGERS, AND CONCURRENCY CONTROLS
-- Migration: 20261012_004_functions_and_triggers.sql
-- Description: Stored procedures for safe checkout, stock restoration, and timestamps
-- ==============================================================================

-- 1. TIMESTAMP UPDATER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS set_admin_users_updated_at ON public.admin_users;
CREATE TRIGGER set_admin_users_updated_at BEFORE UPDATE ON public.admin_users FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_categories_updated_at ON public.categories;
CREATE TRIGGER set_categories_updated_at BEFORE UPDATE ON public.categories FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_brands_updated_at ON public.brands;
CREATE TRIGGER set_brands_updated_at BEFORE UPDATE ON public.brands FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_products_updated_at ON public.products;
CREATE TRIGGER set_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_customers_updated_at ON public.customers;
CREATE TRIGGER set_customers_updated_at BEFORE UPDATE ON public.customers FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_orders_updated_at ON public.orders;
CREATE TRIGGER set_orders_updated_at BEFORE UPDATE ON public.orders FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_coupons_updated_at ON public.coupons;
CREATE TRIGGER set_coupons_updated_at BEFORE UPDATE ON public.coupons FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_banners_updated_at ON public.banners;
CREATE TRIGGER set_banners_updated_at BEFORE UPDATE ON public.banners FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS set_store_settings_updated_at ON public.store_settings;
CREATE TRIGGER set_store_settings_updated_at BEFORE UPDATE ON public.store_settings FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();


-- 2. ORDER NUMBER GENERATION FUNCTION (Race-condition safe)
CREATE SEQUENCE IF NOT EXISTS order_number_seq START WITH 1001;

CREATE OR REPLACE FUNCTION public.generate_next_order_number()
RETURNS TEXT AS $$
DECLARE
    next_val BIGINT;
BEGIN
    SELECT nextval('order_number_seq') INTO next_val;
    RETURN 'SC-' || next_val::TEXT;
END;
$$ LANGUAGE plpgsql;


-- 3. STATUS CHANGE AUDIT TRIGGER
CREATE OR REPLACE FUNCTION public.handle_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.status IS DISTINCT FROM NEW.status) THEN
        INSERT INTO public.order_status_history (
            order_id,
            from_status,
            to_status,
            note,
            changed_by,
            created_at
        ) VALUES (
            NEW.id,
            OLD.status::TEXT,
            NEW.status::TEXT,
            'Status updated to ' || NEW.status::TEXT,
            'System/Admin',
            timezone('utc', now())
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_order_status_history ON public.orders;
CREATE TRIGGER trigger_order_status_history
AFTER UPDATE OF status ON public.orders
FOR EACH ROW EXECUTE FUNCTION public.handle_order_status_change();


-- 4. IDEMPOTENT ORDER CANCELLATION & STOCK RESTORATION PROCEDURE
CREATE OR REPLACE FUNCTION public.cancel_order_and_restore_stock(
    p_order_id UUID,
    p_admin_name TEXT DEFAULT 'Admin',
    p_reason TEXT DEFAULT 'Order Cancelled'
)
RETURNS JSONB AS $$
DECLARE
    v_order RECORD;
    v_item RECORD;
    v_prod RECORD;
BEGIN
    -- Lock order row for update
    SELECT * INTO v_order FROM public.orders WHERE id = p_order_id FOR UPDATE;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'message', 'Order not found');
    END IF;

    -- If already cancelled and stock restored, return without duplicate actions
    IF v_order.status = 'CANCELLED' AND v_order.is_stock_restored THEN
        RETURN jsonb_build_object('success', true, 'message', 'Order was already cancelled and stock restored');
    END IF;

    -- Restore stock for each item if not previously restored
    IF NOT v_order.is_stock_restored THEN
        FOR v_item IN SELECT * FROM public.order_items WHERE order_id = p_order_id LOOP
            SELECT * INTO v_prod FROM public.products WHERE id = v_item.product_id FOR UPDATE;
            
            IF FOUND THEN
                UPDATE public.products
                SET stock = stock + v_item.quantity
                WHERE id = v_item.product_id;

                INSERT INTO public.inventory_movements (
                    product_id,
                    product_name,
                    sku,
                    change_type,
                    quantity,
                    previous_stock,
                    new_stock,
                    reason,
                    admin_name
                ) VALUES (
                    v_item.product_id,
                    v_item.product_name,
                    v_item.product_sku,
                    'CANCELLATION_RESTORE',
                    v_item.quantity,
                    v_prod.stock,
                    v_prod.stock + v_item.quantity,
                    p_reason || ' (Order: ' || v_order.order_number || ')',
                    p_admin_name
                );
            END IF;
        END LOOP;
    END IF;

    -- Update order status
    UPDATE public.orders
    SET status = 'CANCELLED',
        is_stock_restored = true
    WHERE id = p_order_id;

    RETURN jsonb_build_object(
        'success', true, 
        'message', 'Order cancelled and inventory restored successfully',
        'order_number', v_order.order_number
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
