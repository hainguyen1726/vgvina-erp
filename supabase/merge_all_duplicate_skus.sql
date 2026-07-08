-- =============================================================================
-- MERGE ALL DUPLICATE SKUs — AUTO
-- =============================================================================
-- ⚠️  KHUYẾN NGHỊ BACKUP DB TRƯỚC KHI CHẠY (Supabase: Database → Backups).
--
-- Script này tự động gộp TẤT CẢ các nhóm sản phẩm có SKU trùng (so theo
-- lower(btrim(sku))). Với mỗi nhóm:
--   1) Chọn PRIMARY theo rule:
--        a. Số giao dịch nhiều nhất (tổng 5 bảng items) → ƯU TIÊN 1
--        b. Quantity (cột product.quantity) lớn hơn      → tie-break
--        c. created_at sớm nhất                          → tie-break cuối
--   2) Chuyển toàn bộ FK product_id của các record khác về PRIMARY.
--   3) Xóa các record duplicate.
--   4) Trim sku & name của PRIMARY (loại space ẩn).
--   5) Gọi sync_inventory_quantity(PRIMARY) để recompute tồn.
--
-- An toàn:
--   - Chạy trong một block PL/pgSQL — gặp lỗi giữa chừng sẽ rollback nguyên block.
--   - In RAISE NOTICE cho từng nhóm để biết primary/duplicate ids.
--   - Có biến v_dry_run := TRUE → chỉ in log, không sửa data.
--     Đặt FALSE khi đã review xong.
-- =============================================================================

DO $$
DECLARE
    v_dry_run         BOOLEAN := TRUE;     -- ⚠️ Đổi thành FALSE để thực sự chạy

    r_group           RECORD;
    r_record          RECORD;
    v_primary_id      UUID;
    v_primary_qty_tx  BIGINT;

    v_rows_sales      INT;
    v_rows_purchases  INT;
    v_rows_transfers  INT;
    v_rows_scrapping  INT;
    v_rows_returns    INT;
    v_total_groups    INT := 0;
    v_total_merged    INT := 0;
BEGIN
    IF v_dry_run THEN
        RAISE NOTICE '=== DRY RUN — KHÔNG sửa data, chỉ in log. Đổi v_dry_run := FALSE để thực thi. ===';
    ELSE
        RAISE NOTICE '=== EXECUTING — sẽ sửa data thật. ===';
    END IF;

    -- Loop từng nhóm SKU trùng
    FOR r_group IN
        SELECT lower(btrim(sku)) AS sku_norm, COUNT(*) AS n
        FROM vgvina_products
        GROUP BY lower(btrim(sku))
        HAVING COUNT(*) > 1
        ORDER BY lower(btrim(sku))
    LOOP
        v_total_groups := v_total_groups + 1;
        RAISE NOTICE '--- Nhóm % (% records) ---', r_group.sku_norm, r_group.n;

        -- Chọn primary: nhiều giao dịch nhất → quantity cao nhất → created_at sớm nhất
        SELECT id INTO v_primary_id
        FROM (
            SELECT
                p.id,
                p.quantity,
                p.created_at,
                (SELECT COUNT(*) FROM vgvina_sales_order_items       WHERE product_id = p.id)
              + (SELECT COUNT(*) FROM vgvina_purchase_order_items    WHERE product_id = p.id)
              + (SELECT COUNT(*) FROM vgvina_internal_transfer_items WHERE product_id = p.id)
              + (SELECT COUNT(*) FROM vgvina_scrapping_voucher_items WHERE product_id = p.id)
              + (SELECT COUNT(*) FROM vgvina_return_voucher_items    WHERE product_id = p.id) AS n_tx
            FROM vgvina_products p
            WHERE lower(btrim(p.sku)) = r_group.sku_norm
        ) ranked
        ORDER BY n_tx DESC NULLS LAST,
                 quantity DESC NULLS LAST,
                 created_at ASC NULLS LAST
        LIMIT 1;

        RAISE NOTICE '  Primary chọn: id=%', v_primary_id;

        -- Loop qua các duplicate trong cùng nhóm
        FOR r_record IN
            SELECT id, sku, name
            FROM vgvina_products
            WHERE lower(btrim(sku)) = r_group.sku_norm
              AND id <> v_primary_id
        LOOP
            RAISE NOTICE '  Duplicate: id=%, sku="%", name="%"', r_record.id, r_record.sku, r_record.name;
            v_total_merged := v_total_merged + 1;

            IF NOT v_dry_run THEN
                UPDATE vgvina_sales_order_items
                   SET product_id = v_primary_id WHERE product_id = r_record.id;
                GET DIAGNOSTICS v_rows_sales = ROW_COUNT;

                UPDATE vgvina_purchase_order_items
                   SET product_id = v_primary_id WHERE product_id = r_record.id;
                GET DIAGNOSTICS v_rows_purchases = ROW_COUNT;

                UPDATE vgvina_internal_transfer_items
                   SET product_id = v_primary_id WHERE product_id = r_record.id;
                GET DIAGNOSTICS v_rows_transfers = ROW_COUNT;

                UPDATE vgvina_scrapping_voucher_items
                   SET product_id = v_primary_id WHERE product_id = r_record.id;
                GET DIAGNOSTICS v_rows_scrapping = ROW_COUNT;

                UPDATE vgvina_return_voucher_items
                   SET product_id = v_primary_id WHERE product_id = r_record.id;
                GET DIAGNOSTICS v_rows_returns = ROW_COUNT;

                DELETE FROM vgvina_products WHERE id = r_record.id;

                RAISE NOTICE '    → Chuyển FK: sales=%, purchases=%, transfers=%, scrapping=%, returns=%; deleted record',
                    v_rows_sales, v_rows_purchases, v_rows_transfers, v_rows_scrapping, v_rows_returns;
            END IF;
        END LOOP;

        -- Chuẩn hóa primary (sync_inventory_quantity bỏ qua — migration tiếp theo
        -- sẽ truncate + recompute toàn bộ vgvina_inventory ở Step 8, nên không cần sync ở đây)
        IF NOT v_dry_run THEN
            UPDATE vgvina_products
               SET sku  = btrim(sku),
                   name = btrim(name)
             WHERE id = v_primary_id;
        END IF;
    END LOOP;

    RAISE NOTICE '====================================================';
    RAISE NOTICE 'Tổng cộng: % nhóm SKU trùng, gộp/xóa % record duplicate.',
        v_total_groups, v_total_merged;
    IF v_dry_run THEN
        RAISE NOTICE 'Đây là DRY RUN — KHÔNG có thay đổi nào được lưu.';
        RAISE NOTICE 'Review log ở trên rồi đổi v_dry_run := FALSE và chạy lại để thực thi.';
    END IF;
END $$;
