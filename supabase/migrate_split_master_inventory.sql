-- =============================================================================
-- MIGRATE: SPLIT PRODUCT MASTER FROM PER-FACILITY INVENTORY
-- =============================================================================
-- Mục tiêu:
--   - vgvina_products: 1 record / SKU (master toàn hệ thống). Bỏ facility_id, quantity.
--   - vgvina_inventory(product_id, facility_id, quantity): tồn kho per facility.
--   - Triggers cập nhật vgvina_inventory thay vì vgvina_products.quantity.
--   - UNIQUE(sku) và UNIQUE(lower(btrim(name))) để chống tạo trùng tương lai.
--
-- ⚠️ TRƯỚC KHI CHẠY:
--   1. Backup DB (Supabase Dashboard → Database → Backups → manual backup).
--   2. Đảm bảo không còn duplicate SKU (đã merge xong).
--   3. Đảm bảo không còn duplicate name (case-insensitive + trim).
--      Migration có pre-check, sẽ RAISE EXCEPTION nếu còn duplicate.
--
-- An toàn:
--   - Toàn bộ wrap trong BEGIN/COMMIT — fail giữa chừng → rollback toàn bộ.
--   - In RAISE NOTICE từng bước.
-- =============================================================================

BEGIN;

SET search_path TO public;

-- =============================================================================
-- PRE-CHECK 1: Không còn duplicate SKU
-- =============================================================================
DO $pre$
DECLARE
    v_dup INT;
BEGIN
    SELECT COUNT(*) INTO v_dup
    FROM (
        SELECT lower(btrim(sku)) AS k FROM vgvina_products GROUP BY lower(btrim(sku)) HAVING COUNT(*) > 1
    ) AS x;
    IF v_dup > 0 THEN
        RAISE EXCEPTION 'Còn % SKU bị trùng. Dọn duplicate trước khi migrate.', v_dup;
    END IF;
    RAISE NOTICE 'Pre-check 1 OK: không còn duplicate SKU';
END
$pre$;

-- =============================================================================
-- PRE-CHECK 2: Không còn duplicate name (case-insensitive + trim)
-- =============================================================================
DO $pre$
DECLARE
    v_dup INT;
    v_sample TEXT;
BEGIN
    SELECT COUNT(*) INTO v_dup
    FROM (
        SELECT lower(btrim(name)) AS k FROM vgvina_products GROUP BY lower(btrim(name)) HAVING COUNT(*) > 1
    ) AS x;
    IF v_dup > 0 THEN
        SELECT string_agg(name, ' | ' ORDER BY name) INTO v_sample
        FROM vgvina_products
        WHERE lower(btrim(name)) IN (
            SELECT lower(btrim(name)) FROM vgvina_products GROUP BY lower(btrim(name)) HAVING COUNT(*) > 1
        )
        LIMIT 1;
        RAISE EXCEPTION 'Còn % nhóm tên trùng (case-insensitive). Ví dụ: %. Dọn trước khi migrate.', v_dup, v_sample;
    END IF;
    RAISE NOTICE 'Pre-check 2 OK: không còn duplicate name';
END
$pre$;

-- =============================================================================
-- STEP 1: Tạo bảng vgvina_inventory
-- =============================================================================
CREATE TABLE IF NOT EXISTS vgvina_inventory (
    product_id UUID NOT NULL REFERENCES vgvina_products(id) ON DELETE CASCADE,
    facility_id UUID NOT NULL REFERENCES vgvina_facilities(id) ON DELETE RESTRICT,
    quantity NUMERIC(20, 4) NOT NULL DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (product_id, facility_id)
);

CREATE INDEX IF NOT EXISTS idx_vgvina_inventory_facility_id ON vgvina_inventory(facility_id);

ALTER TABLE vgvina_inventory ENABLE ROW LEVEL SECURITY;

-- Permissive policy (parity with vgvina_products) — adjust if you have stricter rules
DROP POLICY IF EXISTS vgvina_inventory_all ON vgvina_inventory;
CREATE POLICY vgvina_inventory_all ON vgvina_inventory FOR ALL USING (true) WITH CHECK (true);

DO $$ BEGIN RAISE NOTICE 'Step 1 OK: created vgvina_inventory table'; END $$;

-- =============================================================================
-- STEP 2: Migrate dữ liệu hiện tại từ products(facility_id, quantity) → inventory
-- =============================================================================
INSERT INTO vgvina_inventory (product_id, facility_id, quantity)
SELECT id, facility_id, COALESCE(quantity, 0)
FROM vgvina_products
WHERE facility_id IS NOT NULL
ON CONFLICT (product_id, facility_id) DO UPDATE
    SET quantity = EXCLUDED.quantity;

DO $$
DECLARE v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count FROM vgvina_inventory;
    RAISE NOTICE 'Step 2 OK: migrated % rows into vgvina_inventory', v_count;
END $$;

-- =============================================================================
-- STEP 3: Drop old triggers + functions trên vgvina_products (vì không còn cột quantity)
-- =============================================================================
DROP TRIGGER IF EXISTS trigger_update_inventory_sales       ON vgvina_sales_order_items;
DROP TRIGGER IF EXISTS trigger_update_inventory_purchase    ON vgvina_purchase_order_items;
DROP TRIGGER IF EXISTS trigger_update_inventory_transfer    ON vgvina_internal_transfer_items;
DROP TRIGGER IF EXISTS trigger_update_inventory_transfer_header ON vgvina_internal_transfers;
DROP TRIGGER IF EXISTS trigger_update_inventory_scrapping   ON vgvina_scrapping_voucher_items;
DROP TRIGGER IF EXISTS trigger_update_inventory_return      ON vgvina_return_voucher_items;

DROP FUNCTION IF EXISTS update_inventory_on_sales_item()    CASCADE;
DROP FUNCTION IF EXISTS update_inventory_on_purchase_item() CASCADE;
DROP FUNCTION IF EXISTS update_inventory_on_transfer_item() CASCADE;
DROP FUNCTION IF EXISTS update_inventory_on_transfer_header_update() CASCADE;
DROP FUNCTION IF EXISTS update_inventory_on_scrapping_item() CASCADE;
DROP FUNCTION IF EXISTS update_inventory_on_return_item()    CASCADE;
DROP FUNCTION IF EXISTS sync_inventory_quantity(UUID)        CASCADE;

DO $$ BEGIN RAISE NOTICE 'Step 3 OK: dropped old triggers and functions'; END $$;

-- =============================================================================
-- STEP 4: Drop columns facility_id và quantity khỏi vgvina_products
-- =============================================================================
ALTER TABLE vgvina_products DROP COLUMN IF EXISTS facility_id;
ALTER TABLE vgvina_products DROP COLUMN IF EXISTS quantity;

DO $$ BEGIN RAISE NOTICE 'Step 4 OK: dropped facility_id and quantity from vgvina_products'; END $$;

-- =============================================================================
-- STEP 5: Add UNIQUE constraints
-- =============================================================================
-- Trim sạch sku & name trước khi enforce UNIQUE
UPDATE vgvina_products SET sku = btrim(sku), name = btrim(name);

DO $$ BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'vgvina_products_sku_unique'
    ) THEN
        ALTER TABLE vgvina_products ADD CONSTRAINT vgvina_products_sku_unique UNIQUE (sku);
    END IF;
END $$;

DROP INDEX IF EXISTS vgvina_products_name_unique;
CREATE UNIQUE INDEX vgvina_products_name_unique ON vgvina_products (lower(btrim(name)));

DO $$ BEGIN RAISE NOTICE 'Step 5 OK: added UNIQUE(sku) and UNIQUE(lower(btrim(name)))'; END $$;

-- =============================================================================
-- STEP 6: Helper function — adjust inventory at (product, facility) by delta
-- =============================================================================
CREATE OR REPLACE FUNCTION adjust_inventory(p_product_id UUID, p_facility_id UUID, p_delta NUMERIC)
RETURNS VOID
LANGUAGE plpgsql
AS $$
BEGIN
    IF p_facility_id IS NULL THEN
        RAISE EXCEPTION 'adjust_inventory: facility_id NULL (product_id=%)', p_product_id;
    END IF;
    INSERT INTO vgvina_inventory (product_id, facility_id, quantity)
    VALUES (p_product_id, p_facility_id, p_delta)
    ON CONFLICT (product_id, facility_id)
    DO UPDATE SET quantity = vgvina_inventory.quantity + EXCLUDED.quantity,
                  updated_at = NOW();
END;
$$;

DO $$ BEGIN RAISE NOTICE 'Step 6 OK: created adjust_inventory()'; END $$;

-- =============================================================================
-- STEP 7: Trigger functions mới — write vào vgvina_inventory
-- =============================================================================

-- 7.1 Sales: -qty tại order.facility_id
CREATE OR REPLACE FUNCTION update_inventory_on_sales_item()
RETURNS TRIGGER AS $$
DECLARE v_facility UUID;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        SELECT facility_id INTO v_facility FROM vgvina_sales_orders WHERE id = NEW.order_id;
        PERFORM adjust_inventory(NEW.product_id, v_facility, -NEW.quantity);
    ELSIF (TG_OP = 'UPDATE') THEN
        SELECT facility_id INTO v_facility FROM vgvina_sales_orders WHERE id = NEW.order_id;
        PERFORM adjust_inventory(NEW.product_id, v_facility, OLD.quantity - NEW.quantity);
    ELSIF (TG_OP = 'DELETE') THEN
        SELECT facility_id INTO v_facility FROM vgvina_sales_orders WHERE id = OLD.order_id;
        PERFORM adjust_inventory(OLD.product_id, v_facility, OLD.quantity);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_sales
AFTER INSERT OR UPDATE OR DELETE ON vgvina_sales_order_items
FOR EACH ROW EXECUTE FUNCTION update_inventory_on_sales_item();

-- 7.2 Purchase: +qty tại order.facility_id
CREATE OR REPLACE FUNCTION update_inventory_on_purchase_item()
RETURNS TRIGGER AS $$
DECLARE v_facility UUID;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        SELECT facility_id INTO v_facility FROM vgvina_purchase_orders WHERE id = NEW.order_id;
        PERFORM adjust_inventory(NEW.product_id, v_facility, NEW.quantity);
    ELSIF (TG_OP = 'UPDATE') THEN
        SELECT facility_id INTO v_facility FROM vgvina_purchase_orders WHERE id = NEW.order_id;
        PERFORM adjust_inventory(NEW.product_id, v_facility, NEW.quantity - OLD.quantity);
    ELSIF (TG_OP = 'DELETE') THEN
        SELECT facility_id INTO v_facility FROM vgvina_purchase_orders WHERE id = OLD.order_id;
        PERFORM adjust_inventory(OLD.product_id, v_facility, -OLD.quantity);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_purchase
AFTER INSERT OR UPDATE OR DELETE ON vgvina_purchase_order_items
FOR EACH ROW EXECUTE FUNCTION update_inventory_on_purchase_item();

-- 7.3 Internal transfer: -qty tại from, +qty tại to
CREATE OR REPLACE FUNCTION update_inventory_on_transfer_item()
RETURNS TRIGGER AS $$
DECLARE
    v_from UUID;
    v_to   UUID;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        SELECT from_facility_id, to_facility_id INTO v_from, v_to
        FROM vgvina_internal_transfers WHERE id = NEW.transfer_id;
        PERFORM adjust_inventory(NEW.product_id, v_from, -NEW.quantity);
        PERFORM adjust_inventory(NEW.product_id, v_to,   NEW.quantity);
    ELSIF (TG_OP = 'UPDATE') THEN
        SELECT from_facility_id, to_facility_id INTO v_from, v_to
        FROM vgvina_internal_transfers WHERE id = NEW.transfer_id;
        PERFORM adjust_inventory(NEW.product_id, v_from, OLD.quantity - NEW.quantity);
        PERFORM adjust_inventory(NEW.product_id, v_to,   NEW.quantity - OLD.quantity);
    ELSIF (TG_OP = 'DELETE') THEN
        SELECT from_facility_id, to_facility_id INTO v_from, v_to
        FROM vgvina_internal_transfers WHERE id = OLD.transfer_id;
        PERFORM adjust_inventory(OLD.product_id, v_from,  OLD.quantity);
        PERFORM adjust_inventory(OLD.product_id, v_to,   -OLD.quantity);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_transfer
AFTER INSERT OR UPDATE OR DELETE ON vgvina_internal_transfer_items
FOR EACH ROW EXECUTE FUNCTION update_inventory_on_transfer_item();

-- 7.4 Transfer header update: nếu đổi from/to facility, dồn lại tồn
CREATE OR REPLACE FUNCTION update_inventory_on_transfer_header_update()
RETURNS TRIGGER AS $$
DECLARE rec RECORD;
BEGIN
    IF (OLD.from_facility_id IS DISTINCT FROM NEW.from_facility_id
        OR OLD.to_facility_id IS DISTINCT FROM NEW.to_facility_id) THEN
        FOR rec IN SELECT product_id, quantity FROM vgvina_internal_transfer_items WHERE transfer_id = NEW.id
        LOOP
            -- Revert effect at OLD facilities
            PERFORM adjust_inventory(rec.product_id, OLD.from_facility_id,  rec.quantity);
            PERFORM adjust_inventory(rec.product_id, OLD.to_facility_id,   -rec.quantity);
            -- Apply at NEW facilities
            PERFORM adjust_inventory(rec.product_id, NEW.from_facility_id, -rec.quantity);
            PERFORM adjust_inventory(rec.product_id, NEW.to_facility_id,    rec.quantity);
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_transfer_header
AFTER UPDATE ON vgvina_internal_transfers
FOR EACH ROW EXECUTE FUNCTION update_inventory_on_transfer_header_update();

-- 7.5 Scrapping: -qty tại voucher.facility_id
CREATE OR REPLACE FUNCTION update_inventory_on_scrapping_item()
RETURNS TRIGGER AS $$
DECLARE v_facility UUID;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        SELECT facility_id INTO v_facility FROM vgvina_scrapping_vouchers WHERE id = NEW.scrapping_id;
        PERFORM adjust_inventory(NEW.product_id, v_facility, -NEW.quantity);
    ELSIF (TG_OP = 'UPDATE') THEN
        SELECT facility_id INTO v_facility FROM vgvina_scrapping_vouchers WHERE id = NEW.scrapping_id;
        PERFORM adjust_inventory(NEW.product_id, v_facility, OLD.quantity - NEW.quantity);
    ELSIF (TG_OP = 'DELETE') THEN
        SELECT facility_id INTO v_facility FROM vgvina_scrapping_vouchers WHERE id = OLD.scrapping_id;
        PERFORM adjust_inventory(OLD.product_id, v_facility, OLD.quantity);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_scrapping
AFTER INSERT OR UPDATE OR DELETE ON vgvina_scrapping_voucher_items
FOR EACH ROW EXECUTE FUNCTION update_inventory_on_scrapping_item();

-- 7.6 Return: +qty tại facility lấy từ related sales/purchase order
-- Helper: lookup facility from related order id (try sales, fallback purchase)
CREATE OR REPLACE FUNCTION get_return_facility(p_return_id UUID)
RETURNS UUID
LANGUAGE plpgsql
AS $$
DECLARE
    v_related UUID;
    v_facility UUID;
BEGIN
    SELECT related_order_id INTO v_related FROM vgvina_return_vouchers WHERE id = p_return_id;
    IF v_related IS NULL THEN RETURN NULL; END IF;
    SELECT facility_id INTO v_facility FROM vgvina_sales_orders WHERE id = v_related;
    IF v_facility IS NOT NULL THEN RETURN v_facility; END IF;
    SELECT facility_id INTO v_facility FROM vgvina_purchase_orders WHERE id = v_related;
    RETURN v_facility;
END;
$$;

CREATE OR REPLACE FUNCTION update_inventory_on_return_item()
RETURNS TRIGGER AS $$
DECLARE v_facility UUID;
BEGIN
    IF (TG_OP = 'INSERT') THEN
        v_facility := get_return_facility(NEW.return_id);
        PERFORM adjust_inventory(NEW.product_id, v_facility, NEW.quantity);
    ELSIF (TG_OP = 'UPDATE') THEN
        v_facility := get_return_facility(NEW.return_id);
        PERFORM adjust_inventory(NEW.product_id, v_facility, NEW.quantity - OLD.quantity);
    ELSIF (TG_OP = 'DELETE') THEN
        v_facility := get_return_facility(OLD.return_id);
        PERFORM adjust_inventory(OLD.product_id, v_facility, -OLD.quantity);
    END IF;
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_inventory_return
AFTER INSERT OR UPDATE OR DELETE ON vgvina_return_voucher_items
FOR EACH ROW EXECUTE FUNCTION update_inventory_on_return_item();

DO $$ BEGIN RAISE NOTICE 'Step 7 OK: created 6 new triggers writing to vgvina_inventory'; END $$;

-- =============================================================================
-- STEP 8: Recompute toàn bộ vgvina_inventory từ giao dịch thực tế (verify)
-- =============================================================================
-- Sau khi có triggers mới, ta xoá inventory hiện có và recompute lại từ items
-- để đảm bảo tồn khớp 100% với giao dịch.
TRUNCATE TABLE vgvina_inventory;

INSERT INTO vgvina_inventory (product_id, facility_id, quantity)
SELECT product_id, facility_id, ROUND(SUM(delta)::numeric, 4) AS quantity
FROM (
    -- Purchases (+)
    SELECT i.product_id, o.facility_id, i.quantity AS delta
    FROM vgvina_purchase_order_items i
    JOIN vgvina_purchase_orders o ON o.id = i.order_id
    WHERE o.facility_id IS NOT NULL

    UNION ALL

    -- Sales (-)
    SELECT i.product_id, o.facility_id, -i.quantity AS delta
    FROM vgvina_sales_order_items i
    JOIN vgvina_sales_orders o ON o.id = i.order_id
    WHERE o.facility_id IS NOT NULL

    UNION ALL

    -- Transfers OUT (-)
    SELECT i.product_id, t.from_facility_id, -i.quantity AS delta
    FROM vgvina_internal_transfer_items i
    JOIN vgvina_internal_transfers t ON t.id = i.transfer_id
    WHERE t.from_facility_id IS NOT NULL

    UNION ALL

    -- Transfers IN (+)
    SELECT i.product_id, t.to_facility_id, i.quantity AS delta
    FROM vgvina_internal_transfer_items i
    JOIN vgvina_internal_transfers t ON t.id = i.transfer_id
    WHERE t.to_facility_id IS NOT NULL

    UNION ALL

    -- Scrapping (-)
    SELECT i.product_id, v.facility_id, -i.quantity AS delta
    FROM vgvina_scrapping_voucher_items i
    JOIN vgvina_scrapping_vouchers v ON v.id = i.scrapping_id
    WHERE v.facility_id IS NOT NULL

    UNION ALL

    -- Returns (+) — lấy facility từ related sales order trước, fallback purchase
    SELECT i.product_id,
           COALESCE(so.facility_id, po.facility_id) AS facility_id,
           i.quantity AS delta
    FROM vgvina_return_voucher_items i
    JOIN vgvina_return_vouchers v ON v.id = i.return_id
    LEFT JOIN vgvina_sales_orders so ON so.id = v.related_order_id
    LEFT JOIN vgvina_purchase_orders po ON po.id = v.related_order_id
    WHERE COALESCE(so.facility_id, po.facility_id) IS NOT NULL
) AS movements
GROUP BY product_id, facility_id;

DO $$
DECLARE v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count FROM vgvina_inventory;
    RAISE NOTICE 'Step 8 OK: recomputed % rows in vgvina_inventory from transactions', v_count;
END $$;

-- =============================================================================
-- STEP 9: Function sync_inventory_quantity() viết lại — recompute per-facility
-- =============================================================================
CREATE OR REPLACE FUNCTION sync_inventory_quantity(p_product_id UUID DEFAULT NULL)
RETURNS TABLE(product_id UUID, facility_id UUID, sku TEXT, name TEXT, old_quantity NUMERIC, new_quantity NUMERIC)
LANGUAGE plpgsql
AS $$
BEGIN
    -- Snapshot tồn cũ (drop nếu đã tồn tại từ lần gọi trước trong cùng session)
    DROP TABLE IF EXISTS _old_inv;
    CREATE TEMP TABLE _old_inv ON COMMIT DROP AS
        SELECT inv.product_id, inv.facility_id, inv.quantity FROM vgvina_inventory inv
        WHERE p_product_id IS NULL OR inv.product_id = p_product_id;

    -- Xoá tồn hiện tại của các product đang sync
    DELETE FROM vgvina_inventory inv
    WHERE p_product_id IS NULL OR inv.product_id = p_product_id;

    -- Recompute từ giao dịch thực tế
    INSERT INTO vgvina_inventory (product_id, facility_id, quantity)
    SELECT m.product_id, m.facility_id, ROUND(SUM(m.delta)::numeric, 4)
    FROM (
        SELECT i.product_id, o.facility_id, i.quantity::numeric AS delta
        FROM vgvina_purchase_order_items i JOIN vgvina_purchase_orders o ON o.id = i.order_id
        WHERE o.facility_id IS NOT NULL
        UNION ALL
        SELECT i.product_id, o.facility_id, -i.quantity::numeric
        FROM vgvina_sales_order_items i JOIN vgvina_sales_orders o ON o.id = i.order_id
        WHERE o.facility_id IS NOT NULL
        UNION ALL
        SELECT i.product_id, t.from_facility_id, -i.quantity::numeric
        FROM vgvina_internal_transfer_items i JOIN vgvina_internal_transfers t ON t.id = i.transfer_id
        WHERE t.from_facility_id IS NOT NULL
        UNION ALL
        SELECT i.product_id, t.to_facility_id, i.quantity::numeric
        FROM vgvina_internal_transfer_items i JOIN vgvina_internal_transfers t ON t.id = i.transfer_id
        WHERE t.to_facility_id IS NOT NULL
        UNION ALL
        SELECT i.product_id, v.facility_id, -i.quantity::numeric
        FROM vgvina_scrapping_voucher_items i JOIN vgvina_scrapping_vouchers v ON v.id = i.scrapping_id
        WHERE v.facility_id IS NOT NULL
        UNION ALL
        SELECT i.product_id, COALESCE(so.facility_id, po.facility_id), i.quantity::numeric
        FROM vgvina_return_voucher_items i
        JOIN vgvina_return_vouchers v ON v.id = i.return_id
        LEFT JOIN vgvina_sales_orders so ON so.id = v.related_order_id
        LEFT JOIN vgvina_purchase_orders po ON po.id = v.related_order_id
        WHERE COALESCE(so.facility_id, po.facility_id) IS NOT NULL
    ) m
    WHERE p_product_id IS NULL OR m.product_id = p_product_id
    GROUP BY m.product_id, m.facility_id;

    RETURN QUERY
    SELECT
        i.product_id,
        i.facility_id,
        p.sku,
        p.name,
        COALESCE(o.quantity, 0)::numeric AS old_quantity,
        i.quantity::numeric AS new_quantity
    FROM vgvina_inventory i
    JOIN vgvina_products p ON p.id = i.product_id
    LEFT JOIN _old_inv o ON o.product_id = i.product_id AND o.facility_id = i.facility_id
    WHERE (p_product_id IS NULL OR i.product_id = p_product_id)
      AND COALESCE(o.quantity, 0) <> i.quantity;
END;
$$;

DO $$ BEGIN RAISE NOTICE 'Step 9 OK: replaced sync_inventory_quantity() to per-facility'; END $$;

-- =============================================================================
-- DONE
-- =============================================================================
DO $$
DECLARE
    v_products INT;
    v_inventory INT;
BEGIN
    SELECT COUNT(*) INTO v_products FROM vgvina_products;
    SELECT COUNT(*) INTO v_inventory FROM vgvina_inventory;
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'MIGRATION HOÀN TẤT';
    RAISE NOTICE '  vgvina_products: % records (master)', v_products;
    RAISE NOTICE '  vgvina_inventory: % records (per-facility tồn kho)', v_inventory;
    RAISE NOTICE '  UNIQUE constraints: sku + lower(btrim(name))';
    RAISE NOTICE '  Triggers: 6 triggers mới ghi vào vgvina_inventory';
    RAISE NOTICE '====================================================';
END $$;

COMMIT;
