-- =============================================================================
-- ADD UNIQUE CONSTRAINT ON vgvina_products.sku
-- =============================================================================
-- Mục đích: chống tạo trùng SKU như tình huống "Mực Nang Lớn" / "Mực nang lớn"
-- (cùng SP000131) đã từng xảy ra.
--
-- TIỀN ĐIỀU KIỆN: phải dọn xong tất cả SKU trùng trước khi chạy.
-- Truy vấn kiểm tra (chạy trước):
--     SELECT sku, COUNT(*) FROM vgvina_products GROUP BY sku HAVING COUNT(*) > 1;
-- Nếu kết quả rỗng thì có thể chạy file này.
--
-- CÁCH CHẠY: paste vào Supabase SQL Editor → Run.
-- =============================================================================

-- Block để fail-fast nếu vẫn còn duplicate
DO $$
DECLARE
    v_dup_count INT;
BEGIN
    SELECT COUNT(*) INTO v_dup_count
    FROM (
        SELECT sku FROM vgvina_products GROUP BY sku HAVING COUNT(*) > 1
    ) AS dups;

    IF v_dup_count > 0 THEN
        RAISE EXCEPTION 'Còn % SKU bị trùng. Dọn duplicate trước khi thêm UNIQUE.', v_dup_count;
    END IF;
END $$;

-- Index UNIQUE chính: khớp chính xác giá trị sku
ALTER TABLE vgvina_products
    ADD CONSTRAINT vgvina_products_sku_unique UNIQUE (sku);

-- (Optional) UNIQUE INDEX case-insensitive + trim — chống "SP000131" vs " sp000131 "
-- Bỏ comment nếu muốn áp dụng:
-- CREATE UNIQUE INDEX vgvina_products_sku_ci_idx
--     ON vgvina_products (lower(btrim(sku)));
