-- =====================================================================
-- INVENTORY TRIGGERS - FULL UPDATE/DELETE SUPPORT
-- Fix: Explicit public. schema prefix trên tất cả table references
-- =====================================================================

-- Đặt search_path cho toàn bộ session này
SET search_path TO public;

-- =====================================================================
-- 1. Sales Order Items → Giảm tồn kho khi bán
-- =====================================================================
CREATE OR REPLACE FUNCTION public.update_inventory_on_sales_item()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.vgvina_products SET quantity = quantity - NEW.quantity WHERE id = NEW.product_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE public.vgvina_products SET quantity = quantity + OLD.quantity - NEW.quantity WHERE id = NEW.product_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.vgvina_products SET quantity = quantity + OLD.quantity WHERE id = OLD.product_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_inventory_sales ON public.vgvina_sales_order_items;
CREATE TRIGGER trigger_update_inventory_sales
AFTER INSERT OR UPDATE OR DELETE ON public.vgvina_sales_order_items
FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_sales_item();


-- =====================================================================
-- 2. Purchase Order Items → Tăng tồn kho khi nhập mua
-- =====================================================================
CREATE OR REPLACE FUNCTION public.update_inventory_on_purchase_item()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.vgvina_products SET quantity = quantity + NEW.quantity WHERE id = NEW.product_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE public.vgvina_products SET quantity = quantity - OLD.quantity + NEW.quantity WHERE id = NEW.product_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.vgvina_products SET quantity = quantity - OLD.quantity WHERE id = OLD.product_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_inventory_purchase ON public.vgvina_purchase_order_items;
CREATE TRIGGER trigger_update_inventory_purchase
AFTER INSERT OR UPDATE OR DELETE ON public.vgvina_purchase_order_items
FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_purchase_item();


-- =====================================================================
-- 3. Internal Transfer Items → Điều chuyển kho
-- =====================================================================
CREATE OR REPLACE FUNCTION public.update_inventory_on_transfer_item()
RETURNS TRIGGER AS $$
DECLARE
    v_from_facility_id UUID;
    v_to_facility_id UUID;
    v_sku TEXT;
    v_product_name TEXT;
    v_unit TEXT;
    v_category_id UUID;
    v_price NUMERIC;
    v_target_product_id UUID;
    v_quantity_delta DECIMAL(10, 2);
BEGIN
    SELECT from_facility_id, to_facility_id INTO v_from_facility_id, v_to_facility_id
    FROM public.vgvina_internal_transfers WHERE id = COALESCE(NEW.transfer_id, OLD.transfer_id);

    SELECT sku, name, unit, category_id, price INTO v_sku, v_product_name, v_unit, v_category_id, v_price
    FROM public.vgvina_products WHERE id = COALESCE(NEW.product_id, OLD.product_id);

    IF (TG_OP = 'INSERT') THEN
        v_quantity_delta := NEW.quantity;
        UPDATE public.vgvina_products SET quantity = quantity - v_quantity_delta WHERE id = NEW.product_id;

        SELECT id INTO v_target_product_id FROM public.vgvina_products
        WHERE sku = v_sku AND facility_id = v_to_facility_id AND id != NEW.product_id;

        IF v_target_product_id IS NOT NULL THEN
            UPDATE public.vgvina_products SET quantity = quantity + v_quantity_delta WHERE id = v_target_product_id;
        ELSE
            INSERT INTO public.vgvina_products (sku, name, unit, category_id, facility_id, quantity, price)
            VALUES (v_sku, v_product_name, v_unit, v_category_id, v_to_facility_id, v_quantity_delta, v_price);
        END IF;

    ELSIF (TG_OP = 'UPDATE') THEN
        v_quantity_delta := NEW.quantity - OLD.quantity;
        UPDATE public.vgvina_products SET quantity = quantity - v_quantity_delta WHERE id = NEW.product_id;

        SELECT id INTO v_target_product_id FROM public.vgvina_products
        WHERE sku = v_sku AND facility_id = v_to_facility_id AND id != NEW.product_id;

        IF v_target_product_id IS NOT NULL THEN
            UPDATE public.vgvina_products SET quantity = quantity + v_quantity_delta WHERE id = v_target_product_id;
        END IF;

    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.vgvina_products SET quantity = quantity + OLD.quantity WHERE id = OLD.product_id;

        SELECT id INTO v_target_product_id FROM public.vgvina_products
        WHERE sku = v_sku AND facility_id = v_to_facility_id AND id != OLD.product_id;

        IF v_target_product_id IS NOT NULL THEN
            UPDATE public.vgvina_products SET quantity = quantity - OLD.quantity WHERE id = v_target_product_id;
        END IF;
    END IF;

    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_inventory_transfer ON public.vgvina_internal_transfer_items;
CREATE TRIGGER trigger_update_inventory_transfer
AFTER INSERT OR UPDATE OR DELETE ON public.vgvina_internal_transfer_items
FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_transfer_item();


-- =====================================================================
-- 3.5. Transfer Header Update
-- =====================================================================
CREATE OR REPLACE FUNCTION public.update_inventory_on_transfer_header_update()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.from_facility_id <> NEW.from_facility_id OR OLD.to_facility_id <> NEW.to_facility_id) THEN
        UPDATE public.vgvina_products p
        SET quantity = p.quantity + i.quantity
        FROM public.vgvina_internal_transfer_items i
        WHERE i.transfer_id = NEW.id AND p.id = i.product_id;

        UPDATE public.vgvina_products p
        SET quantity = p.quantity - i.quantity
        FROM public.vgvina_internal_transfer_items i
        JOIN public.vgvina_products p_src ON p_src.id = i.product_id
        WHERE i.transfer_id = NEW.id
          AND p.sku = p_src.sku
          AND p.facility_id = OLD.to_facility_id;

        UPDATE public.vgvina_internal_transfer_items SET quantity = quantity WHERE transfer_id = NEW.id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_inventory_transfer_header ON public.vgvina_internal_transfers;
CREATE TRIGGER trigger_update_inventory_transfer_header
AFTER UPDATE ON public.vgvina_internal_transfers
FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_transfer_header_update();


-- =====================================================================
-- 4. Scrapping Voucher Items → Hủy hàng
-- =====================================================================
CREATE OR REPLACE FUNCTION public.update_inventory_on_scrapping_item()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.vgvina_products SET quantity = quantity - NEW.quantity WHERE id = NEW.product_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE public.vgvina_products SET quantity = quantity + OLD.quantity - NEW.quantity WHERE id = NEW.product_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.vgvina_products SET quantity = quantity + OLD.quantity WHERE id = OLD.product_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_inventory_scrapping ON public.vgvina_scrapping_voucher_items;
CREATE TRIGGER trigger_update_inventory_scrapping
AFTER INSERT OR UPDATE OR DELETE ON public.vgvina_scrapping_voucher_items
FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_scrapping_item();


-- =====================================================================
-- 5. Return Voucher Items → Trả hàng (nhập lại)
-- =====================================================================
CREATE OR REPLACE FUNCTION public.update_inventory_on_return_item()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        UPDATE public.vgvina_products SET quantity = quantity + NEW.quantity WHERE id = NEW.product_id;
    ELSIF (TG_OP = 'UPDATE') THEN
        UPDATE public.vgvina_products SET quantity = quantity - OLD.quantity + NEW.quantity WHERE id = NEW.product_id;
    ELSIF (TG_OP = 'DELETE') THEN
        UPDATE public.vgvina_products SET quantity = quantity - OLD.quantity WHERE id = OLD.product_id;
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_inventory_return ON public.vgvina_return_voucher_items;
CREATE TRIGGER trigger_update_inventory_return
AFTER INSERT OR UPDATE OR DELETE ON public.vgvina_return_voucher_items
FOR EACH ROW EXECUTE FUNCTION public.update_inventory_on_return_item();
