-- =============================================================================
-- FIX: column reference "product_id" is ambiguous
-- =============================================================================
-- Nguyên nhân: function sync_inventory_quantity() khai báo
--   RETURNS TABLE(product_id UUID, facility_id UUID, ...)
-- Postgres tạo OUT parameter cùng tên với cột bảng vgvina_inventory,
-- nên các tham chiếu `product_id` / `facility_id` không qualify trong thân
-- function bị xung đột giữa OUT parameter và cột bảng.
--
-- Cách sửa: alias bảng (inv) và qualify mọi tham chiếu cột.
-- Chạy file này trong Supabase SQL Editor để cập nhật function.
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

-- Test nhanh (chỉ trả về dòng có thay đổi):
-- SELECT * FROM sync_inventory_quantity();
