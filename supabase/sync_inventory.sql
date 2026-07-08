-- =====================================================================
-- SYNC INVENTORY - DIRECT UPDATE (không cần function)
-- Chạy trực tiếp trong Supabase SQL Editor
-- =====================================================================

SET search_path TO public;

-- Bước 1: Xem trước kết quả (để kiểm tra trước khi update)
-- SELECT p.sku, p.name, p.quantity AS current_qty,
--   COALESCE(pur.total,0) + COALESCE(ret.total,0) - COALESCE(sal.total,0) - COALESCE(scr.total,0) - COALESCE(trf_out.total,0) + COALESCE(trf_in.total,0) AS new_qty
-- FROM vgvina_products p
-- ... (uncomment to preview)

-- Bước 2: UPDATE thực tế
WITH calc AS (
  SELECT
    p.id AS product_id,
    COALESCE(pur.total, 0)
    + COALESCE(ret.total, 0)
    - COALESCE(sal.total, 0)
    - COALESCE(scr.total, 0)
    - COALESCE(trf_out.total, 0)
    + COALESCE(trf_in.total, 0) AS new_qty
  FROM vgvina_products p

  -- Nhập mua hàng
  LEFT JOIN (
    SELECT product_id, SUM(quantity) AS total
    FROM vgvina_purchase_order_items GROUP BY product_id
  ) pur ON pur.product_id = p.id

  -- Trả hàng (nhập lại)
  LEFT JOIN (
    SELECT product_id, SUM(quantity) AS total
    FROM vgvina_return_voucher_items GROUP BY product_id
  ) ret ON ret.product_id = p.id

  -- Xuất bán
  LEFT JOIN (
    SELECT product_id, SUM(quantity) AS total
    FROM vgvina_sales_order_items GROUP BY product_id
  ) sal ON sal.product_id = p.id

  -- Hủy hàng
  LEFT JOIN (
    SELECT product_id, SUM(quantity) AS total
    FROM vgvina_scrapping_voucher_items GROUP BY product_id
  ) scr ON scr.product_id = p.id

  -- Xuất điều chuyển (trừ kho nguồn)
  LEFT JOIN (
    SELECT product_id, SUM(quantity) AS total
    FROM vgvina_internal_transfer_items GROUP BY product_id
  ) trf_out ON trf_out.product_id = p.id

  -- Nhập điều chuyển (cộng kho đích - match by SKU + facility)
  LEFT JOIN (
    SELECT p2.id AS product_id, SUM(iti.quantity) AS total
    FROM vgvina_internal_transfer_items iti
    JOIN vgvina_products p_src ON p_src.id = iti.product_id
    JOIN vgvina_internal_transfers it ON it.id = iti.transfer_id
    JOIN vgvina_products p2
      ON p2.sku = p_src.sku
      AND p2.facility_id = it.to_facility_id
      AND p2.id != iti.product_id
    GROUP BY p2.id
  ) trf_in ON trf_in.product_id = p.id
)
UPDATE vgvina_products p
SET quantity = c.new_qty
FROM calc c
WHERE p.id = c.product_id
RETURNING p.sku, p.name, p.quantity AS updated_qty;

-- =====================================================================
-- Sau khi chạy xong, tạo lại function cho nút đồng bộ trên app:
-- =====================================================================

CREATE OR REPLACE FUNCTION public.sync_inventory_quantity(p_product_id UUID DEFAULT NULL)
RETURNS TABLE(product_id UUID, sku TEXT, name TEXT, old_quantity NUMERIC, new_quantity NUMERIC)
LANGUAGE plpgsql
AS $$
BEGIN
  -- Ghi lại giá trị cũ
  CREATE TEMP TABLE IF NOT EXISTS _old_qty AS
    SELECT id, quantity FROM public.vgvina_products;

  -- UPDATE quantity từ giao dịch thực tế
  WITH calc AS (
    SELECT
      p.id AS product_id,
      COALESCE(pur.total, 0)
      + COALESCE(ret.total, 0)
      - COALESCE(sal.total, 0)
      - COALESCE(scr.total, 0)
      - COALESCE(trf_out.total, 0)
      + COALESCE(trf_in.total, 0) AS new_qty
    FROM public.vgvina_products p
    LEFT JOIN (SELECT product_id, SUM(quantity) AS total FROM public.vgvina_purchase_order_items GROUP BY product_id) pur ON pur.product_id = p.id
    LEFT JOIN (SELECT product_id, SUM(quantity) AS total FROM public.vgvina_return_voucher_items GROUP BY product_id) ret ON ret.product_id = p.id
    LEFT JOIN (SELECT product_id, SUM(quantity) AS total FROM public.vgvina_sales_order_items GROUP BY product_id) sal ON sal.product_id = p.id
    LEFT JOIN (SELECT product_id, SUM(quantity) AS total FROM public.vgvina_scrapping_voucher_items GROUP BY product_id) scr ON scr.product_id = p.id
    LEFT JOIN (SELECT product_id, SUM(quantity) AS total FROM public.vgvina_internal_transfer_items GROUP BY product_id) trf_out ON trf_out.product_id = p.id
    LEFT JOIN (
      SELECT p2.id AS product_id, SUM(iti.quantity) AS total
      FROM public.vgvina_internal_transfer_items iti
      JOIN public.vgvina_products p_src ON p_src.id = iti.product_id
      JOIN public.vgvina_internal_transfers it ON it.id = iti.transfer_id
      JOIN public.vgvina_products p2 ON p2.sku = p_src.sku AND p2.facility_id = it.to_facility_id AND p2.id != iti.product_id
      GROUP BY p2.id
    ) trf_in ON trf_in.product_id = p.id
    WHERE (p_product_id IS NULL OR p.id = p_product_id)
  )
  UPDATE public.vgvina_products p
  SET quantity = c.new_qty
  FROM calc c
  WHERE p.id = c.product_id;

  -- Trả về danh sách đã cập nhật
  RETURN QUERY
  SELECT
    p.id,
    p.sku,
    p.name,
    o.quantity AS old_quantity,
    p.quantity AS new_quantity
  FROM public.vgvina_products p
  JOIN _old_qty o ON o.id = p.id
  WHERE p.quantity != o.quantity
    AND (p_product_id IS NULL OR p.id = p_product_id);

  DROP TABLE IF EXISTS _old_qty;
END;
$$;
