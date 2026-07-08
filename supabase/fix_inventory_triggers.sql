-- =====================================================================
-- FIX INVENTORY TRIGGERS - Chỉ trừ/cộng kho khi đơn COMPLETED
-- Ngày: 2026-03-18
-- Vấn đề: Trigger cũ trừ kho ngay khi INSERT items kể cả đơn PENDING
-- =====================================================================

SET search_path TO public;

-- =====================================================================
-- BƯỚC 1: Hoàn trả tồn kho bị trừ sai bởi các đơn PENDING hiện tại
-- Chạy TRƯỚC khi sửa trigger để fix dữ liệu hiện tại
-- =====================================================================
UPDATE public.vgvina_products p
SET quantity = p.quantity + i.quantity
FROM public.vgvina_sales_order_items i
JOIN public.vgvina_sales_orders o ON o.id = i.order_id
WHERE o.status = 'PENDING'
  AND p.id = i.product_id;

-- =====================================================================
-- BƯỚC 2: Hoàn trả tồn kho bị trừ sai cho đơn SO-1773737651909
-- (Đơn này đã COMPLETED nhưng lúc lưu tạm đã trừ rồi, khi confirm lại
--  lại trừ thêm lần 2 → cần cộng lại 1 lần)
-- Đồng thời chuyển về PENDING để user review lại
-- =====================================================================

-- 2a. Tìm order id từ code
-- NOTE: Trigger cũ đã trừ 2 lần cho đơn này (1 lần lúc PENDING, 1 lần lúc confirm)
-- Khi chuyển về PENDING, chúng ta cộng lại đúng 1 lần (vì sau khi fix trigger,
-- PENDING sẽ không trừ kho nữa, nên chỉ cần cộng lại đúng bằng số lượng đơn)
UPDATE public.vgvina_products p
SET quantity = p.quantity + i.quantity
FROM public.vgvina_sales_order_items i
JOIN public.vgvina_sales_orders o ON o.id = i.order_id
WHERE o.code = 'SO-1773737651909'
  AND p.id = i.product_id;

-- 2b. Chuyển đơn về PENDING
UPDATE public.vgvina_sales_orders
SET status = 'PENDING'
WHERE code = 'SO-1773737651909';

-- 2c. Xóa các giao dịch tài chính và công nợ liên quan đến đơn này
-- để hệ thống sạch khi confirm lại
DO $$
DECLARE
    v_order_id UUID;
BEGIN
    SELECT id INTO v_order_id FROM public.vgvina_sales_orders WHERE code = 'SO-1773737651909';
    
    IF v_order_id IS NOT NULL THEN
        -- Xóa transaction assignees trước
        DELETE FROM public.vgvina_transaction_assignees
        WHERE transaction_id IN (
            SELECT id FROM public.vgvina_financial_transactions
            WHERE related_order_id = v_order_id AND related_order_type = 'SALES'
        );
        -- Xóa financial transactions
        DELETE FROM public.vgvina_financial_transactions
        WHERE related_order_id = v_order_id AND related_order_type = 'SALES';
        -- Xóa debt assignees
        DELETE FROM public.vgvina_debt_assignees
        WHERE debt_id IN (
            SELECT id FROM public.vgvina_debt_transactions
            WHERE related_order_id = v_order_id AND related_order_type = 'SALES'
        );
        -- Xóa debt transactions
        DELETE FROM public.vgvina_debt_transactions
        WHERE related_order_id = v_order_id AND related_order_type = 'SALES';
        
        RAISE NOTICE 'Cleaned up transactions for order %', v_order_id;
    END IF;
END $$;

-- =====================================================================
-- BƯỚC 3: Sửa trigger items - Chỉ tác động khi đơn COMPLETED
-- =====================================================================

CREATE OR REPLACE FUNCTION public.update_inventory_on_sales_item()
RETURNS TRIGGER AS $$
DECLARE
    v_order_status TEXT;
BEGIN
    -- Lấy status hiện tại của đơn hàng
    SELECT status INTO v_order_status 
    FROM public.vgvina_sales_orders 
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);
    
    -- Chỉ điều chỉnh tồn kho nếu đơn đang COMPLETED
    IF v_order_status = 'COMPLETED' THEN
        IF (TG_OP = 'INSERT') THEN
            UPDATE public.vgvina_products SET quantity = quantity - NEW.quantity WHERE id = NEW.product_id;
        ELSIF (TG_OP = 'UPDATE') THEN
            UPDATE public.vgvina_products SET quantity = quantity + OLD.quantity - NEW.quantity WHERE id = NEW.product_id;
        ELSIF (TG_OP = 'DELETE') THEN
            UPDATE public.vgvina_products SET quantity = quantity + OLD.quantity WHERE id = OLD.product_id;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Recreate trigger (không cần thay đổi trigger definition, chỉ function)
DROP TRIGGER IF EXISTS trigger_update_inventory_sales ON public.vgvina_sales_order_items;
CREATE TRIGGER trigger_update_inventory_sales
AFTER INSERT OR UPDATE OR DELETE ON public.vgvina_sales_order_items
FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_sales_item();

-- =====================================================================
-- BƯỚC 4: Thêm trigger theo dõi khi STATUS đơn hàng thay đổi
-- PENDING → COMPLETED: trừ kho
-- COMPLETED → CANCELLED: cộng lại kho
-- =====================================================================

CREATE OR REPLACE FUNCTION public.update_inventory_on_sales_status_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Khi đơn chuyển từ non-COMPLETED sang COMPLETED: trừ kho
    IF (OLD.status != 'COMPLETED' AND NEW.status = 'COMPLETED') THEN
        UPDATE public.vgvina_products p
        SET quantity = p.quantity - i.quantity
        FROM public.vgvina_sales_order_items i
        WHERE i.order_id = NEW.id AND p.id = i.product_id;
    END IF;

    -- Khi đơn bị hủy từ COMPLETED: cộng lại kho
    IF (OLD.status = 'COMPLETED' AND NEW.status = 'CANCELLED') THEN
        UPDATE public.vgvina_products p
        SET quantity = p.quantity + i.quantity
        FROM public.vgvina_sales_order_items i
        WHERE i.order_id = NEW.id AND p.id = i.product_id;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_inventory_sales_status ON public.vgvina_sales_orders;
CREATE TRIGGER trigger_update_inventory_sales_status
AFTER UPDATE ON public.vgvina_sales_orders
FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_sales_status_change();

-- =====================================================================
-- BƯỚC 5: Verify - Kiểm tra kết quả
-- =====================================================================
SELECT 
    o.code,
    o.status,
    p.name AS product_name,
    p.quantity AS current_stock,
    i.quantity AS order_quantity
FROM public.vgvina_sales_orders o
JOIN public.vgvina_sales_order_items i ON i.order_id = o.id
JOIN public.vgvina_products p ON p.id = i.product_id
WHERE o.code = 'SO-1773737651909';
