-- =====================================================================
-- FIX: INVENTORY REALTIME TRIGGERS (V2)
-- Ngày: 2026-06-02
-- Vấn đề: 
--   - Chỉ cộng/trừ tồn kho thực tế khi đơn hàng/phiếu ở trạng thái COMPLETED/DELIVERED (hoặc APPROVED).
--   - Phiếu lưu tạm (PENDING) không trừ tồn kho thực tế và không hiện trong Thẻ kho.
--   - Chuyển kho 2 bước: PENDING chỉ trừ kho nguồn, COMPLETED mới cộng kho đích, CANCELLED hoàn lại.
-- =====================================================================

BEGIN;
SET search_path TO public;

-- =====================================================================
-- BƯỚC 0: KIỂM TRA - Xác nhận vgvina_inventory tồn tại
-- =====================================================================
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_schema = 'public' AND table_name = 'vgvina_inventory'
    ) THEN
        RAISE EXCEPTION 'Bảng vgvina_inventory chưa tồn tại. Chạy migrate_split_master_inventory.sql trước.';
    END IF;
END $$;

-- =====================================================================
-- BƯỚC 1: XÓA TRIGGERS VÀ FUNCTIONS CŨ
-- =====================================================================
DROP TRIGGER IF EXISTS trigger_update_inventory_sales            ON vgvina_sales_order_items;
DROP TRIGGER IF EXISTS trigger_update_inventory_sales_status     ON vgvina_sales_orders;
DROP TRIGGER IF EXISTS trigger_update_inventory_purchase         ON vgvina_purchase_order_items;
DROP TRIGGER IF EXISTS trigger_update_inventory_purchase_status  ON vgvina_purchase_orders;
DROP TRIGGER IF EXISTS trigger_update_inventory_transfer         ON vgvina_internal_transfer_items;
DROP TRIGGER IF EXISTS trigger_update_inventory_transfer_header  ON vgvina_internal_transfers;
DROP TRIGGER IF EXISTS trigger_update_inventory_scrapping        ON vgvina_scrapping_voucher_items;
DROP TRIGGER IF EXISTS trigger_update_inventory_scrapping_status ON vgvina_scrapping_vouchers;
DROP TRIGGER IF EXISTS trigger_update_inventory_return           ON vgvina_return_voucher_items;
DROP TRIGGER IF EXISTS trigger_update_inventory_return_status     ON vgvina_return_vouchers;

DROP FUNCTION IF EXISTS update_inventory_on_sales_item()               CASCADE;
DROP FUNCTION IF EXISTS update_inventory_on_sales_status_change()      CASCADE;
DROP FUNCTION IF EXISTS update_inventory_on_purchase_item()            CASCADE;
DROP FUNCTION IF EXISTS update_inventory_on_purchase_status_change()   CASCADE;
DROP FUNCTION IF EXISTS update_inventory_on_transfer_item()            CASCADE;
DROP FUNCTION IF EXISTS update_inventory_on_transfer_header_update()   CASCADE;
DROP FUNCTION IF EXISTS update_inventory_on_scrapping_item()           CASCADE;
DROP FUNCTION IF EXISTS update_inventory_on_scrapping_status_change()   CASCADE;
DROP FUNCTION IF EXISTS update_inventory_on_return_item()              CASCADE;
DROP FUNCTION IF EXISTS update_inventory_on_return_status_change()      CASCADE;
DROP FUNCTION IF EXISTS get_return_facility(UUID)                      CASCADE;
DROP FUNCTION IF EXISTS adjust_inventory(UUID, UUID, NUMERIC)          CASCADE;

-- =====================================================================
-- BƯỚC 2: HÀM HELPER - adjust_inventory
-- =====================================================================
CREATE OR REPLACE FUNCTION public.adjust_inventory(
    p_product_id UUID,
    p_facility_id UUID,
    p_delta       NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_facility_id IS NULL THEN
        RAISE WARNING 'adjust_inventory: facility_id NULL với product_id=%. Bỏ qua.', p_product_id;
        RETURN;
    END IF;

    -- Bỏ qua nếu delta = 0
    IF p_delta = 0 THEN
        RETURN;
    END IF;

    INSERT INTO public.vgvina_inventory (product_id, facility_id, quantity, updated_at)
    VALUES (p_product_id, p_facility_id, p_delta, NOW())
    ON CONFLICT (product_id, facility_id)
    DO UPDATE SET
        quantity   = public.vgvina_inventory.quantity + EXCLUDED.quantity,
        updated_at = NOW();
END;
$$;

-- =====================================================================
-- BƯỚC 3: HELPER - Tìm facility từ phiếu trả hàng
-- =====================================================================
CREATE OR REPLACE FUNCTION public.get_return_facility(p_return_id UUID)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_related  UUID;
    v_facility UUID;
BEGIN
    SELECT related_order_id INTO v_related
    FROM public.vgvina_return_vouchers WHERE id = p_return_id;

    IF v_related IS NULL THEN RETURN NULL; END IF;

    -- Thử sales order trước
    SELECT facility_id INTO v_facility FROM public.vgvina_sales_orders WHERE id = v_related;
    IF v_facility IS NOT NULL THEN RETURN v_facility; END IF;

    -- Fallback: purchase order
    SELECT facility_id INTO v_facility FROM public.vgvina_purchase_orders WHERE id = v_related;
    RETURN v_facility;
END;
$$;

-- =====================================================================
-- BƯỚC 4: TRIGGER FUNCTIONS MỚI
-- =====================================================================

-- 4.1.1 BÁN HÀNG: Cập nhật tồn kho theo dòng hàng (Chỉ khi đơn COMPLETED/DELIVERED)
CREATE OR REPLACE FUNCTION public.update_inventory_on_sales_item()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE 
    v_facility UUID;
    v_status   TEXT;
BEGIN
    -- Lấy facility và status của đơn hàng
    SELECT facility_id, status INTO v_facility, v_status 
    FROM public.vgvina_sales_orders 
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);

    -- Chỉ cập nhật tồn kho nếu trạng thái là COMPLETED hoặc DELIVERED
    IF v_status IN ('COMPLETED', 'DELIVERED') THEN
        IF (TG_OP = 'INSERT') THEN
            PERFORM public.adjust_inventory(NEW.product_id, v_facility, -NEW.quantity);

        ELSIF (TG_OP = 'UPDATE') THEN
            IF OLD.product_id IS DISTINCT FROM NEW.product_id OR OLD.order_id IS DISTINCT FROM NEW.order_id THEN
                -- Hoàn lại tồn kho cho sản phẩm/đơn cũ
                SELECT facility_id INTO v_facility FROM public.vgvina_sales_orders WHERE id = OLD.order_id;
                PERFORM public.adjust_inventory(OLD.product_id, v_facility, OLD.quantity);
                -- Trừ tồn kho sản phẩm/đơn mới
                SELECT facility_id INTO v_facility FROM public.vgvina_sales_orders WHERE id = NEW.order_id;
                PERFORM public.adjust_inventory(NEW.product_id, v_facility, -NEW.quantity);
            ELSE
                PERFORM public.adjust_inventory(NEW.product_id, v_facility, OLD.quantity - NEW.quantity);
            END IF;

        ELSIF (TG_OP = 'DELETE') THEN
            PERFORM public.adjust_inventory(OLD.product_id, v_facility, OLD.quantity);
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_update_inventory_sales
AFTER INSERT OR UPDATE OR DELETE ON public.vgvina_sales_order_items
FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_sales_item();

-- 4.1.2 BÁN HÀNG: Cập nhật tồn kho khi trạng thái đơn thay đổi
CREATE OR REPLACE FUNCTION public.update_inventory_on_sales_status_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE rec RECORD;
BEGIN
    -- Chuyển từ nháp sang COMPLETED/DELIVERED: trừ tồn kho
    IF (OLD.status NOT IN ('COMPLETED', 'DELIVERED') AND NEW.status IN ('COMPLETED', 'DELIVERED')) THEN
        FOR rec IN SELECT product_id, quantity FROM public.vgvina_sales_order_items WHERE order_id = NEW.id LOOP
            PERFORM public.adjust_inventory(rec.product_id, NEW.facility_id, -rec.quantity);
        END LOOP;
    
    -- Chuyển từ COMPLETED/DELIVERED về nháp/hủy: cộng lại tồn kho
    ELSIF (OLD.status IN ('COMPLETED', 'DELIVERED') AND NEW.status NOT IN ('COMPLETED', 'DELIVERED')) THEN
        FOR rec IN SELECT product_id, quantity FROM public.vgvina_sales_order_items WHERE order_id = NEW.id LOOP
            PERFORM public.adjust_inventory(rec.product_id, OLD.facility_id, rec.quantity);
        END LOOP;
        
    -- Trường hợp đổi chi nhánh khi đơn đã hoàn thành
    ELSIF (OLD.status IN ('COMPLETED', 'DELIVERED') AND NEW.status IN ('COMPLETED', 'DELIVERED') AND OLD.facility_id IS DISTINCT FROM NEW.facility_id) THEN
        FOR rec IN SELECT product_id, quantity FROM public.vgvina_sales_order_items WHERE order_id = NEW.id LOOP
            PERFORM public.adjust_inventory(rec.product_id, OLD.facility_id, rec.quantity);
            PERFORM public.adjust_inventory(rec.product_id, NEW.facility_id, -rec.quantity);
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_inventory_sales_status
AFTER UPDATE ON public.vgvina_sales_orders
FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_sales_status_change();


-- 4.2.1 MUA HÀNG: Cập nhật tồn kho theo dòng hàng (Chỉ khi đơn COMPLETED/DELIVERED)
CREATE OR REPLACE FUNCTION public.update_inventory_on_purchase_item()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE 
    v_facility UUID;
    v_status   TEXT;
BEGIN
    SELECT facility_id, status INTO v_facility, v_status 
    FROM public.vgvina_purchase_orders 
    WHERE id = COALESCE(NEW.order_id, OLD.order_id);

    IF v_status IN ('COMPLETED', 'DELIVERED') THEN
        IF (TG_OP = 'INSERT') THEN
            PERFORM public.adjust_inventory(NEW.product_id, v_facility, NEW.quantity);

        ELSIF (TG_OP = 'UPDATE') THEN
            IF OLD.product_id IS DISTINCT FROM NEW.product_id OR OLD.order_id IS DISTINCT FROM NEW.order_id THEN
                -- Hoàn lại tồn kho cho sản phẩm/đơn cũ
                SELECT facility_id INTO v_facility FROM public.vgvina_purchase_orders WHERE id = OLD.order_id;
                PERFORM public.adjust_inventory(OLD.product_id, v_facility, -OLD.quantity);
                -- Cộng tồn kho sản phẩm/đơn mới
                SELECT facility_id INTO v_facility FROM public.vgvina_purchase_orders WHERE id = NEW.order_id;
                PERFORM public.adjust_inventory(NEW.product_id, v_facility, NEW.quantity);
            ELSE
                PERFORM public.adjust_inventory(NEW.product_id, v_facility, NEW.quantity - OLD.quantity);
            END IF;

        ELSIF (TG_OP = 'DELETE') THEN
            PERFORM public.adjust_inventory(OLD.product_id, v_facility, -OLD.quantity);
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_update_inventory_purchase
AFTER INSERT OR UPDATE OR DELETE ON public.vgvina_purchase_order_items
FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_purchase_item();

-- 4.2.2 MUA HÀNG: Cập nhật tồn kho khi trạng thái đơn thay đổi
CREATE OR REPLACE FUNCTION public.update_inventory_on_purchase_status_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE rec RECORD;
BEGIN
    -- Chuyển từ nháp sang COMPLETED/DELIVERED: cộng tồn kho
    IF (OLD.status NOT IN ('COMPLETED', 'DELIVERED') AND NEW.status IN ('COMPLETED', 'DELIVERED')) THEN
        FOR rec IN SELECT product_id, quantity FROM public.vgvina_purchase_order_items WHERE order_id = NEW.id LOOP
            PERFORM public.adjust_inventory(rec.product_id, NEW.facility_id, rec.quantity);
        END LOOP;
    
    -- Chuyển từ COMPLETED/DELIVERED về nháp/hủy: trừ lại tồn kho
    ELSIF (OLD.status IN ('COMPLETED', 'DELIVERED') AND NEW.status NOT IN ('COMPLETED', 'DELIVERED')) THEN
        FOR rec IN SELECT product_id, quantity FROM public.vgvina_purchase_order_items WHERE order_id = NEW.id LOOP
            PERFORM public.adjust_inventory(rec.product_id, OLD.facility_id, -rec.quantity);
        END LOOP;
        
    -- Đổi chi nhánh khi đơn đã hoàn thành
    ELSIF (OLD.status IN ('COMPLETED', 'DELIVERED') AND NEW.status IN ('COMPLETED', 'DELIVERED') AND OLD.facility_id IS DISTINCT FROM NEW.facility_id) THEN
        FOR rec IN SELECT product_id, quantity FROM public.vgvina_purchase_order_items WHERE order_id = NEW.id LOOP
            PERFORM public.adjust_inventory(rec.product_id, OLD.facility_id, -rec.quantity);
            PERFORM public.adjust_inventory(rec.product_id, NEW.facility_id, rec.quantity);
        END LOOP;
    END IF;

    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_inventory_purchase_status
AFTER UPDATE ON public.vgvina_purchase_orders
FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_purchase_status_change();


-- 4.3.1 CHUYỂN KHO: Cập nhật tồn kho theo dòng hàng (Chuyển kho 2 bước)
--   - PENDING & COMPLETED: Trừ kho nguồn
--   - COMPLETED: Cộng kho đích
CREATE OR REPLACE FUNCTION public.update_inventory_on_transfer_item()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
    v_from     UUID;
    v_to       UUID;
    v_status   TEXT;
    v_old_from UUID;
    v_old_to   UUID;
BEGIN
    SELECT from_facility_id, to_facility_id, status INTO v_from, v_to, v_status
    FROM public.vgvina_internal_transfers 
    WHERE id = COALESCE(NEW.transfer_id, OLD.transfer_id);

    IF (TG_OP = 'INSERT') THEN
        -- Trừ kho nguồn nếu PENDING hoặc COMPLETED
        IF v_status IN ('PENDING', 'COMPLETED') THEN
            PERFORM public.adjust_inventory(NEW.product_id, v_from, -NEW.quantity);
        END IF;
        -- Cộng kho đích chỉ khi COMPLETED
        IF v_status = 'COMPLETED' THEN
            PERFORM public.adjust_inventory(NEW.product_id, v_to, NEW.quantity);
        END IF;

    ELSIF (TG_OP = 'UPDATE') THEN
        -- Nếu đổi phiếu chuyển kho hoặc sản phẩm
        IF OLD.transfer_id IS DISTINCT FROM NEW.transfer_id OR OLD.product_id IS DISTINCT FROM NEW.product_id THEN
            -- Hoàn lại phiếu cũ
            SELECT from_facility_id, to_facility_id, status INTO v_old_from, v_old_to, v_status
            FROM public.vgvina_internal_transfers WHERE id = OLD.transfer_id;
            
            IF v_status IN ('PENDING', 'COMPLETED') THEN
                PERFORM public.adjust_inventory(OLD.product_id, v_old_from, OLD.quantity);
            END IF;
            IF v_status = 'COMPLETED' THEN
                PERFORM public.adjust_inventory(OLD.product_id, v_old_to, -OLD.quantity);
            END IF;

            -- Áp dụng phiếu mới
            SELECT from_facility_id, to_facility_id, status INTO v_from, v_to, v_status
            FROM public.vgvina_internal_transfers WHERE id = NEW.transfer_id;
            
            IF v_status IN ('PENDING', 'COMPLETED') THEN
                PERFORM public.adjust_inventory(NEW.product_id, v_from, -NEW.quantity);
            END IF;
            IF v_status = 'COMPLETED' THEN
                PERFORM public.adjust_inventory(NEW.product_id, v_to, NEW.quantity);
            END IF;
        ELSE
            -- Chỉ điều chỉnh delta số lượng trên cùng 1 phiếu
            IF v_status IN ('PENDING', 'COMPLETED') THEN
                PERFORM public.adjust_inventory(NEW.product_id, v_from, OLD.quantity - NEW.quantity);
            END IF;
            IF v_status = 'COMPLETED' THEN
                PERFORM public.adjust_inventory(NEW.product_id, v_to, NEW.quantity - OLD.quantity);
            END IF;
        END IF;

    ELSIF (TG_OP = 'DELETE') THEN
        IF v_status IN ('PENDING', 'COMPLETED') THEN
            PERFORM public.adjust_inventory(OLD.product_id, v_from, OLD.quantity);
        END IF;
        IF v_status = 'COMPLETED' THEN
            PERFORM public.adjust_inventory(OLD.product_id, v_to, -OLD.quantity);
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_update_inventory_transfer
AFTER INSERT OR UPDATE OR DELETE ON public.vgvina_internal_transfer_items
FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_transfer_item();

-- 4.3.2 CHUYỂN KHO: Cập nhật tồn kho khi thay đổi header (đổi kho hoặc đổi trạng thái)
CREATE OR REPLACE FUNCTION public.update_inventory_on_transfer_header_update()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE rec RECORD;
BEGIN
    -- 1. Nếu thay đổi Kho nguồn hoặc Kho đích
    IF (OLD.from_facility_id IS DISTINCT FROM NEW.from_facility_id OR OLD.to_facility_id IS DISTINCT FROM NEW.to_facility_id) THEN
        FOR rec IN SELECT product_id, quantity FROM public.vgvina_internal_transfer_items WHERE transfer_id = NEW.id LOOP
            -- Hoàn lại kho cũ
            IF OLD.status IN ('PENDING', 'COMPLETED') THEN
                PERFORM public.adjust_inventory(rec.product_id, OLD.from_facility_id, rec.quantity);
            END IF;
            IF OLD.status = 'COMPLETED' THEN
                PERFORM public.adjust_inventory(rec.product_id, OLD.to_facility_id, -rec.quantity);
            END IF;

            -- Áp dụng tại kho mới
            IF NEW.status IN ('PENDING', 'COMPLETED') THEN
                PERFORM public.adjust_inventory(rec.product_id, NEW.from_facility_id, -rec.quantity);
            END IF;
            IF NEW.status = 'COMPLETED' THEN
                PERFORM public.adjust_inventory(rec.product_id, NEW.to_facility_id, rec.quantity);
            END IF;
        END LOOP;
        
    -- 2. Nếu thay đổi trạng thái (Status)
    ELSIF (OLD.status IS DISTINCT FROM NEW.status) THEN
        -- PENDING -> COMPLETED: cộng kho đích (kho nguồn đã trừ lúc PENDING)
        IF (OLD.status = 'PENDING' AND NEW.status = 'COMPLETED') THEN
            FOR rec IN SELECT product_id, quantity FROM public.vgvina_internal_transfer_items WHERE transfer_id = NEW.id LOOP
                PERFORM public.adjust_inventory(rec.product_id, NEW.to_facility_id, rec.quantity);
            END LOOP;
            
        -- COMPLETED -> CANCELLED: hoàn trả cả 2 đầu (cộng lại kho nguồn, trừ lại kho đích)
        ELSIF (OLD.status = 'COMPLETED' AND NEW.status = 'CANCELLED') THEN
            FOR rec IN SELECT product_id, quantity FROM public.vgvina_internal_transfer_items WHERE transfer_id = NEW.id LOOP
                PERFORM public.adjust_inventory(rec.product_id, OLD.from_facility_id, rec.quantity);
                PERFORM public.adjust_inventory(rec.product_id, OLD.to_facility_id, -rec.quantity);
            END LOOP;
            
        -- PENDING -> CANCELLED: hoàn trả đầu nguồn (đầu đích chưa được cộng)
        ELSIF (OLD.status = 'PENDING' AND NEW.status = 'CANCELLED') THEN
            FOR rec IN SELECT product_id, quantity FROM public.vgvina_internal_transfer_items WHERE transfer_id = NEW.id LOOP
                PERFORM public.adjust_inventory(rec.product_id, OLD.from_facility_id, rec.quantity);
            END LOOP;
            
        -- COMPLETED -> PENDING: trừ lại đầu đích (kho nguồn vẫn giữ nguyên trừ)
        ELSIF (OLD.status = 'COMPLETED' AND NEW.status = 'PENDING') THEN
            FOR rec IN SELECT product_id, quantity FROM public.vgvina_internal_transfer_items WHERE transfer_id = NEW.id LOOP
                PERFORM public.adjust_inventory(rec.product_id, OLD.to_facility_id, -rec.quantity);
            END LOOP;
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_inventory_transfer_header
AFTER UPDATE ON public.vgvina_internal_transfers
FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_transfer_header_update();


-- 4.4.1 HỦY HÀNG: Cập nhật tồn kho theo dòng hàng (Chỉ khi phiếu COMPLETED/APPROVED)
CREATE OR REPLACE FUNCTION public.update_inventory_on_scrapping_item()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE 
    v_facility UUID;
    v_status   TEXT;
BEGIN
    SELECT facility_id, status INTO v_facility, v_status 
    FROM public.vgvina_scrapping_vouchers WHERE id = COALESCE(NEW.scrapping_id, OLD.scrapping_id);

    IF v_status IN ('COMPLETED', 'APPROVED') THEN
        IF (TG_OP = 'INSERT') THEN
            PERFORM public.adjust_inventory(NEW.product_id, v_facility, -NEW.quantity);

        ELSIF (TG_OP = 'UPDATE') THEN
            PERFORM public.adjust_inventory(NEW.product_id, v_facility, OLD.quantity - NEW.quantity);

        ELSIF (TG_OP = 'DELETE') THEN
            PERFORM public.adjust_inventory(OLD.product_id, v_facility, OLD.quantity);
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_update_inventory_scrapping
AFTER INSERT OR UPDATE OR DELETE ON public.vgvina_scrapping_voucher_items
FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_scrapping_item();

-- 4.4.2 HỦY HÀNG: Cập nhật tồn kho khi trạng thái thay đổi
CREATE OR REPLACE FUNCTION public.update_inventory_on_scrapping_status_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE rec RECORD;
BEGIN
    -- Nháp -> COMPLETED/APPROVED: trừ kho
    IF (OLD.status NOT IN ('COMPLETED', 'APPROVED') AND NEW.status IN ('COMPLETED', 'APPROVED')) THEN
        FOR rec IN SELECT product_id, quantity FROM public.vgvina_scrapping_voucher_items WHERE scrapping_id = NEW.id LOOP
            PERFORM public.adjust_inventory(rec.product_id, NEW.facility_id, -rec.quantity);
        END LOOP;
    
    -- COMPLETED/APPROVED -> Khác (hủy/nháp): cộng lại kho
    ELSIF (OLD.status IN ('COMPLETED', 'APPROVED') AND NEW.status NOT IN ('COMPLETED', 'APPROVED')) THEN
        FOR rec IN SELECT product_id, quantity FROM public.vgvina_scrapping_voucher_items WHERE scrapping_id = NEW.id LOOP
            PERFORM public.adjust_inventory(rec.product_id, OLD.facility_id, rec.quantity);
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_inventory_scrapping_status
AFTER UPDATE ON public.vgvina_scrapping_vouchers
FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_scrapping_status_change();


-- 4.5.1 TRẢ HÀNG: Cập nhật tồn kho theo dòng hàng (Chỉ khi phiếu COMPLETED/APPROVED)
CREATE OR REPLACE FUNCTION public.update_inventory_on_return_item()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE 
    v_facility UUID;
    v_status   TEXT;
BEGIN
    SELECT public.get_return_facility(id), status INTO v_facility, v_status 
    FROM public.vgvina_return_vouchers WHERE id = COALESCE(NEW.return_id, OLD.return_id);

    IF v_status IN ('COMPLETED', 'APPROVED') THEN
        IF (TG_OP = 'INSERT') THEN
            PERFORM public.adjust_inventory(NEW.product_id, v_facility, NEW.quantity);

        ELSIF (TG_OP = 'UPDATE') THEN
            PERFORM public.adjust_inventory(NEW.product_id, v_facility, NEW.quantity - OLD.quantity);

        ELSIF (TG_OP = 'DELETE') THEN
            PERFORM public.adjust_inventory(OLD.product_id, v_facility, -OLD.quantity);
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$;

CREATE TRIGGER trigger_update_inventory_return
AFTER INSERT OR UPDATE OR DELETE ON public.vgvina_return_voucher_items
FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_return_item();

-- 4.5.2 TRẢ HÀNG: Cập nhật tồn kho khi trạng thái thay đổi
CREATE OR REPLACE FUNCTION public.update_inventory_on_return_status_change()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE 
    rec RECORD;
    v_facility UUID;
BEGIN
    -- Nháp -> COMPLETED/APPROVED: cộng kho
    IF (OLD.status NOT IN ('COMPLETED', 'APPROVED') AND NEW.status IN ('COMPLETED', 'APPROVED')) THEN
        v_facility := public.get_return_facility(NEW.id);
        FOR rec IN SELECT product_id, quantity FROM public.vgvina_return_voucher_items WHERE return_id = NEW.id LOOP
            PERFORM public.adjust_inventory(rec.product_id, v_facility, rec.quantity);
        END LOOP;
    
    -- COMPLETED/APPROVED -> Khác: trừ lại kho
    ELSIF (OLD.status IN ('COMPLETED', 'APPROVED') AND NEW.status NOT IN ('COMPLETED', 'APPROVED')) THEN
        v_facility := public.get_return_facility(OLD.id);
        FOR rec IN SELECT product_id, quantity FROM public.vgvina_return_voucher_items WHERE return_id = NEW.id LOOP
            PERFORM public.adjust_inventory(rec.product_id, v_facility, -rec.quantity);
        END LOOP;
    END IF;
    
    RETURN NEW;
END;
$$;

CREATE TRIGGER trigger_update_inventory_return_status
AFTER UPDATE ON public.vgvina_return_vouchers
FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_return_status_change();


-- =====================================================================
-- BƯỚC 5: RECOMPUTE TOÀN BỘ TỒN KHO TỪ CHỨNG TỪ THỰC TẾ (Theo trạng thái mới)
-- =====================================================================
TRUNCATE TABLE public.vgvina_inventory;

INSERT INTO public.vgvina_inventory (product_id, facility_id, quantity)
SELECT product_id, facility_id, ROUND(SUM(delta)::NUMERIC, 4) AS quantity
FROM (
    -- Nhập mua (+) (Chỉ tính đơn COMPLETED/DELIVERED)
    SELECT i.product_id, o.facility_id,  i.quantity::NUMERIC AS delta
    FROM public.vgvina_purchase_order_items i
    JOIN public.vgvina_purchase_orders o ON o.id = i.order_id
    WHERE o.facility_id IS NOT NULL AND o.status IN ('COMPLETED', 'DELIVERED')

    UNION ALL

    -- Xuất bán (-) (Chỉ tính đơn COMPLETED/DELIVERED)
    SELECT i.product_id, o.facility_id, -i.quantity::NUMERIC AS delta
    FROM public.vgvina_sales_order_items i
    JOIN public.vgvina_sales_orders o ON o.id = i.order_id
    WHERE o.facility_id IS NOT NULL AND o.status IN ('COMPLETED', 'DELIVERED')

    UNION ALL

    -- Điều chuyển: xuất tại kho nguồn (-) (PENDING & COMPLETED)
    SELECT i.product_id, t.from_facility_id, -i.quantity::NUMERIC AS delta
    FROM public.vgvina_internal_transfer_items i
    JOIN public.vgvina_internal_transfers t ON t.id = i.transfer_id
    WHERE t.from_facility_id IS NOT NULL AND t.status IN ('PENDING', 'COMPLETED')

    UNION ALL

    -- Điều chuyển: nhập tại kho đích (+) (Chỉ khi COMPLETED)
    SELECT i.product_id, t.to_facility_id, i.quantity::NUMERIC AS delta
    FROM public.vgvina_internal_transfer_items i
    JOIN public.vgvina_internal_transfers t ON t.id = i.transfer_id
    WHERE t.to_facility_id IS NOT NULL AND t.status = 'COMPLETED'

    UNION ALL

    -- Hủy hàng (-) (COMPLETED / APPROVED)
    SELECT i.product_id, v.facility_id, -i.quantity::NUMERIC AS delta
    FROM public.vgvina_scrapping_voucher_items i
    JOIN public.vgvina_scrapping_vouchers v ON v.id = i.scrapping_id
    WHERE v.facility_id IS NOT NULL AND v.status IN ('COMPLETED', 'APPROVED')

    UNION ALL

    -- Trả hàng: nhập lại (+) (COMPLETED / APPROVED)
    SELECT i.product_id, public.get_return_facility(v.id) AS facility_id, i.quantity::NUMERIC AS delta
    FROM public.vgvina_return_voucher_items i
    JOIN public.vgvina_return_vouchers v ON v.id = i.return_id
    WHERE public.get_return_facility(v.id) IS NOT NULL AND v.status IN ('COMPLETED', 'APPROVED')
) AS movements
GROUP BY product_id, facility_id;


-- =====================================================================
-- BƯỚC 6: CẬP NHẬT sync_inventory_quantity() — dùng cho nút "Đồng bộ"
-- =====================================================================
CREATE OR REPLACE FUNCTION public.sync_inventory_quantity(p_product_id UUID DEFAULT NULL)
RETURNS TABLE(
    product_id   UUID,
    facility_id  UUID,
    sku          TEXT,
    name         TEXT,
    old_quantity NUMERIC,
    new_quantity NUMERIC
)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Snapshot tồn cũ
    DROP TABLE IF EXISTS _old_inv;
    CREATE TEMP TABLE _old_inv ON COMMIT DROP AS
        SELECT product_id, facility_id, quantity
        FROM public.vgvina_inventory
        WHERE p_product_id IS NULL OR product_id = p_product_id;

    -- Xóa tồn đang sync
    DELETE FROM public.vgvina_inventory
    WHERE p_product_id IS NULL OR vgvina_inventory.product_id = p_product_id;

    -- Recompute
    INSERT INTO public.vgvina_inventory (product_id, facility_id, quantity)
    SELECT m.product_id, m.facility_id, ROUND(SUM(m.delta)::NUMERIC, 4)
    FROM (
        SELECT i.product_id, o.facility_id,  i.quantity::NUMERIC AS delta
        FROM public.vgvina_purchase_order_items i JOIN public.vgvina_purchase_orders o ON o.id = i.order_id
        WHERE o.facility_id IS NOT NULL AND o.status IN ('COMPLETED', 'DELIVERED')

        UNION ALL

        SELECT i.product_id, o.facility_id, -i.quantity::NUMERIC
        FROM public.vgvina_sales_order_items i JOIN public.vgvina_sales_orders o ON o.id = i.order_id
        WHERE o.facility_id IS NOT NULL AND o.status IN ('COMPLETED', 'DELIVERED')

        UNION ALL

        SELECT i.product_id, t.from_facility_id, -i.quantity::NUMERIC
        FROM public.vgvina_internal_transfer_items i JOIN public.vgvina_internal_transfers t ON t.id = i.transfer_id
        WHERE t.from_facility_id IS NOT NULL AND t.status IN ('PENDING', 'COMPLETED')

        UNION ALL

        SELECT i.product_id, t.to_facility_id, i.quantity::NUMERIC
        FROM public.vgvina_internal_transfer_items i JOIN public.vgvina_internal_transfers t ON t.id = i.transfer_id
        WHERE t.to_facility_id IS NOT NULL AND t.status = 'COMPLETED'

        UNION ALL

        SELECT i.product_id, v.facility_id, -i.quantity::NUMERIC
        FROM public.vgvina_scrapping_voucher_items i JOIN public.vgvina_scrapping_vouchers v ON v.id = i.scrapping_id
        WHERE v.facility_id IS NOT NULL AND v.status IN ('COMPLETED', 'APPROVED')

        UNION ALL

        SELECT i.product_id, public.get_return_facility(v.id), i.quantity::NUMERIC
        FROM public.vgvina_return_voucher_items i JOIN public.vgvina_return_vouchers v ON v.id = i.return_id
        WHERE public.get_return_facility(v.id) IS NOT NULL AND v.status IN ('COMPLETED', 'APPROVED')
    ) m
    WHERE p_product_id IS NULL OR m.product_id = p_product_id
    GROUP BY m.product_id, m.facility_id;

    RETURN QUERY
    SELECT
        i.product_id,
        i.facility_id,
        p.sku,
        p.name,
        COALESCE(o.quantity, 0)::NUMERIC AS old_quantity,
        i.quantity::NUMERIC              AS new_quantity
    FROM public.vgvina_inventory i
    JOIN public.vgvina_products p ON p.id = i.product_id
    LEFT JOIN _old_inv o ON o.product_id = i.product_id AND o.facility_id = i.facility_id
    WHERE (p_product_id IS NULL OR i.product_id = p_product_id)
      AND COALESCE(o.quantity, 0) <> i.quantity;
END;
$$;

COMMIT;
