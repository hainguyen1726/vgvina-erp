-- =============================================================================
-- INSPECT DUPLICATE SKUs
-- =============================================================================
-- Liệt kê toàn bộ record có SKU trùng (so sánh lower+trim — bắt cả case/space).
-- Mỗi dòng kèm số lượng giao dịch ở 5 bảng items để biết record nào "đang dùng nhiều".
-- =============================================================================

WITH dup_skus AS (
    SELECT lower(btrim(sku)) AS sku_norm
    FROM vgvina_products
    GROUP BY lower(btrim(sku))
    HAVING COUNT(*) > 1
)
SELECT
    lower(btrim(p.sku))                                                      AS sku_norm,
    p.id,
    p.sku                                                                    AS sku_raw,
    length(p.sku)                                                            AS sku_len,
    p.name,
    p.quantity,
    p.created_at,
    (SELECT COUNT(*) FROM vgvina_sales_order_items       WHERE product_id = p.id) AS n_sales,
    (SELECT COUNT(*) FROM vgvina_purchase_order_items    WHERE product_id = p.id) AS n_purchases,
    (SELECT COUNT(*) FROM vgvina_internal_transfer_items WHERE product_id = p.id) AS n_transfers,
    (SELECT COUNT(*) FROM vgvina_scrapping_voucher_items WHERE product_id = p.id) AS n_scrapping,
    (SELECT COUNT(*) FROM vgvina_return_voucher_items    WHERE product_id = p.id) AS n_returns,
    (SELECT COUNT(*) FROM vgvina_sales_order_items       WHERE product_id = p.id)
  + (SELECT COUNT(*) FROM vgvina_purchase_order_items    WHERE product_id = p.id)
  + (SELECT COUNT(*) FROM vgvina_internal_transfer_items WHERE product_id = p.id)
  + (SELECT COUNT(*) FROM vgvina_scrapping_voucher_items WHERE product_id = p.id)
  + (SELECT COUNT(*) FROM vgvina_return_voucher_items    WHERE product_id = p.id) AS n_total
FROM vgvina_products p
JOIN dup_skus d ON lower(btrim(p.sku)) = d.sku_norm
ORDER BY sku_norm, n_total DESC, p.created_at ASC;
