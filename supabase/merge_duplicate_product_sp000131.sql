-- =============================================================================
-- MERGE DUPLICATE PRODUCT — SKU 'SP000131'
-- =============================================================================
-- Tình huống: bảng vgvina_products đang có 2 record cùng "ý nghĩa" SKU SP000131
-- (có thể lệch nhau bởi khoảng trắng đầu/cuối hoặc viết hoa/thường):
--   - "Mực Nang Lớn"  (giữ làm chính)
--   - "Mực nang lớn"  (gộp vào chính rồi xóa)
--
-- Script chuyển toàn bộ FK product_id ở 5 bảng giao dịch về id chính,
-- xóa record phụ, rồi sync lại quantity.
--
-- An toàn:
--   - Wrapped trong DO block — rollback khi RAISE EXCEPTION.
--   - So khớp SKU theo lower(btrim(...)) nên bắt được cả "SP000131 " hay "sp000131".
--   - Kiểm tra phải đúng 2 record, nếu không thì RAISE để dừng.
--   - In log số dòng cập nhật từng bảng.
--
-- CÁCH CHẠY: paste vào Supabase SQL Editor → Run. Đọc Notice ở khung output.
-- =============================================================================

DO $$
DECLARE
    v_target_sku_norm  TEXT := 'sp000131';   -- so khớp lower+trim
    v_primary_name     TEXT := 'Mực Nang Lớn';

    v_primary_id       UUID;
    v_duplicate_id     UUID;
    v_total_count      INT;
    v_primary_sku      TEXT;
    v_duplicate_sku    TEXT;
    v_duplicate_name   TEXT;

    v_rows_sales       INT := 0;
    v_rows_purchases   INT := 0;
    v_rows_transfers   INT := 0;
    v_rows_scrapping   INT := 0;
    v_rows_returns     INT := 0;
BEGIN
    -- 1) Đếm để chắc chắn dữ liệu đúng kỳ vọng (lower+trim)
    SELECT COUNT(*) INTO v_total_count
    FROM vgvina_products
    WHERE lower(btrim(sku)) = v_target_sku_norm;

    IF v_total_count <> 2 THEN
        RAISE EXCEPTION 'Kỳ vọng đúng 2 record cho SKU (lower+trim) "%", hiện có %. Dừng để an toàn.',
            v_target_sku_norm, v_total_count;
    END IF;

    -- 2) Xác định product chính (ưu tiên match theo name; nếu không có name khớp,
    --    fallback sang record có sku "sạch" hơn = không có space đầu/cuối)
    SELECT id, sku INTO v_primary_id, v_primary_sku
    FROM vgvina_products
    WHERE lower(btrim(sku)) = v_target_sku_norm
      AND btrim(name) = v_primary_name
    LIMIT 1;

    IF v_primary_id IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy product chính có name = "%". Kiểm tra lại tên.', v_primary_name;
    END IF;

    -- 3) Record còn lại là duplicate
    SELECT id, sku, name INTO v_duplicate_id, v_duplicate_sku, v_duplicate_name
    FROM vgvina_products
    WHERE lower(btrim(sku)) = v_target_sku_norm
      AND id <> v_primary_id
    LIMIT 1;

    RAISE NOTICE 'Primary   id=%, sku="%", name="%"', v_primary_id, v_primary_sku, v_primary_name;
    RAISE NOTICE 'Duplicate id=%, sku="%", name="%"', v_duplicate_id, v_duplicate_sku, v_duplicate_name;

    -- 4) Chuyển FK từ duplicate → primary trên các bảng items
    UPDATE vgvina_sales_order_items
       SET product_id = v_primary_id
     WHERE product_id = v_duplicate_id;
    GET DIAGNOSTICS v_rows_sales = ROW_COUNT;

    UPDATE vgvina_purchase_order_items
       SET product_id = v_primary_id
     WHERE product_id = v_duplicate_id;
    GET DIAGNOSTICS v_rows_purchases = ROW_COUNT;

    UPDATE vgvina_internal_transfer_items
       SET product_id = v_primary_id
     WHERE product_id = v_duplicate_id;
    GET DIAGNOSTICS v_rows_transfers = ROW_COUNT;

    UPDATE vgvina_scrapping_voucher_items
       SET product_id = v_primary_id
     WHERE product_id = v_duplicate_id;
    GET DIAGNOSTICS v_rows_scrapping = ROW_COUNT;

    UPDATE vgvina_return_voucher_items
       SET product_id = v_primary_id
     WHERE product_id = v_duplicate_id;
    GET DIAGNOSTICS v_rows_returns = ROW_COUNT;

    RAISE NOTICE 'Đã chuyển FK: sales=%, purchases=%, transfers=%, scrapping=%, returns=%',
        v_rows_sales, v_rows_purchases, v_rows_transfers, v_rows_scrapping, v_rows_returns;

    -- 5) Xóa record duplicate
    DELETE FROM vgvina_products WHERE id = v_duplicate_id;
    RAISE NOTICE 'Đã xóa product duplicate id=%', v_duplicate_id;

    -- 6) Chuẩn hóa lại sku & name của primary: trim() để loại space ẩn ở đầu/cuối
    UPDATE vgvina_products
       SET sku  = btrim(sku),
           name = btrim(name)
     WHERE id = v_primary_id;

    -- 7) Sync lại quantity dựa trên giao dịch đã gộp
    PERFORM sync_inventory_quantity(v_primary_id);
    RAISE NOTICE 'Đã sync_inventory_quantity cho primary id=%', v_primary_id;

    RAISE NOTICE 'HOÀN TẤT — SKU sp000131 giờ chỉ còn 1 record (id=%)', v_primary_id;
END $$;
