-- =============================================================================
-- BACKUP IN-PLACE TRƯỚC KHI CHẠY migrate_split_master_inventory.sql
-- =============================================================================
-- Clone các bảng có thể bị tác động sang `*_backup_pre_inventory_split` trong cùng DB.
-- Mục đích: rollback nhanh bằng SQL nếu migration commit xong rồi mới phát hiện sai.
--
-- Lưu ý: đây KHÔNG thay thế backup chính thức trên Supabase Dashboard
-- (nếu DB hỏng hoàn toàn, backup tại chỗ này cũng mất theo).
-- Vẫn nên tạo backup Dashboard trước khi chạy file này.
--
-- Idempotent: chạy lại sẽ ghi đè bản clone cũ.
-- =============================================================================

BEGIN;

SET search_path TO public;

-- vgvina_products — bảng chính bị drop columns trong migration
DROP TABLE IF EXISTS vgvina_products_backup_pre_inventory_split;
CREATE TABLE vgvina_products_backup_pre_inventory_split AS TABLE vgvina_products;

-- Các bảng giao dịch — không bị schema change nhưng backup cho an toàn
DROP TABLE IF EXISTS vgvina_sales_order_items_backup_pre_inventory_split;
CREATE TABLE vgvina_sales_order_items_backup_pre_inventory_split AS TABLE vgvina_sales_order_items;

DROP TABLE IF EXISTS vgvina_purchase_order_items_backup_pre_inventory_split;
CREATE TABLE vgvina_purchase_order_items_backup_pre_inventory_split AS TABLE vgvina_purchase_order_items;

DROP TABLE IF EXISTS vgvina_internal_transfers_backup_pre_inventory_split;
CREATE TABLE vgvina_internal_transfers_backup_pre_inventory_split AS TABLE vgvina_internal_transfers;

DROP TABLE IF EXISTS vgvina_internal_transfer_items_backup_pre_inventory_split;
CREATE TABLE vgvina_internal_transfer_items_backup_pre_inventory_split AS TABLE vgvina_internal_transfer_items;

DROP TABLE IF EXISTS vgvina_scrapping_voucher_items_backup_pre_inventory_split;
CREATE TABLE vgvina_scrapping_voucher_items_backup_pre_inventory_split AS TABLE vgvina_scrapping_voucher_items;

DROP TABLE IF EXISTS vgvina_return_voucher_items_backup_pre_inventory_split;
CREATE TABLE vgvina_return_voucher_items_backup_pre_inventory_split AS TABLE vgvina_return_voucher_items;

-- Báo cáo dòng đã backup
DO $$
DECLARE
    v_products INT;
    v_sales INT;
    v_purchases INT;
    v_transfers_h INT;
    v_transfers_i INT;
    v_scrapping INT;
    v_returns INT;
BEGIN
    SELECT COUNT(*) INTO v_products FROM vgvina_products_backup_pre_inventory_split;
    SELECT COUNT(*) INTO v_sales FROM vgvina_sales_order_items_backup_pre_inventory_split;
    SELECT COUNT(*) INTO v_purchases FROM vgvina_purchase_order_items_backup_pre_inventory_split;
    SELECT COUNT(*) INTO v_transfers_h FROM vgvina_internal_transfers_backup_pre_inventory_split;
    SELECT COUNT(*) INTO v_transfers_i FROM vgvina_internal_transfer_items_backup_pre_inventory_split;
    SELECT COUNT(*) INTO v_scrapping FROM vgvina_scrapping_voucher_items_backup_pre_inventory_split;
    SELECT COUNT(*) INTO v_returns FROM vgvina_return_voucher_items_backup_pre_inventory_split;
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'BACKUP IN-PLACE HOÀN TẤT (suffix: _backup_pre_inventory_split)';
    RAISE NOTICE '  products: % | sales_items: % | purchase_items: %', v_products, v_sales, v_purchases;
    RAISE NOTICE '  transfers (header): % | transfer_items: %', v_transfers_h, v_transfers_i;
    RAISE NOTICE '  scrapping_items: % | return_items: %', v_scrapping, v_returns;
    RAISE NOTICE '====================================================';
END $$;

COMMIT;

-- =============================================================================
-- ROLLBACK NHANH (nếu migration commit xong rồi cần khôi phục products):
-- =============================================================================
-- ⚠️ CHỈ CHẠY KHI BIẾT MÌNH ĐANG LÀM GÌ — sẽ wipe và restore products từ backup.
-- Cần thêm lại column facility_id, quantity vào products vì migration đã drop.
--
-- BEGIN;
-- ALTER TABLE vgvina_products ADD COLUMN IF NOT EXISTS facility_id UUID REFERENCES vgvina_facilities(id);
-- ALTER TABLE vgvina_products ADD COLUMN IF NOT EXISTS quantity NUMERIC(15,2) DEFAULT 0;
-- ALTER TABLE vgvina_products DROP CONSTRAINT IF EXISTS vgvina_products_sku_unique;
-- DROP INDEX IF EXISTS vgvina_products_name_unique;
-- TRUNCATE vgvina_products CASCADE;
-- INSERT INTO vgvina_products SELECT * FROM vgvina_products_backup_pre_inventory_split;
-- DROP TABLE IF EXISTS vgvina_inventory CASCADE;
-- -- Sau đó chạy lại supabase/inventory_triggers.sql và supabase/sync_inventory.sql để khôi phục triggers cũ
-- COMMIT;
-- =============================================================================

-- =============================================================================
-- DỌN BACKUP (sau khi migration xác nhận ổn định, ví dụ sau 1-2 tuần):
-- =============================================================================
-- DROP TABLE IF EXISTS vgvina_products_backup_pre_inventory_split;
-- DROP TABLE IF EXISTS vgvina_sales_order_items_backup_pre_inventory_split;
-- DROP TABLE IF EXISTS vgvina_purchase_order_items_backup_pre_inventory_split;
-- DROP TABLE IF EXISTS vgvina_internal_transfers_backup_pre_inventory_split;
-- DROP TABLE IF EXISTS vgvina_internal_transfer_items_backup_pre_inventory_split;
-- DROP TABLE IF EXISTS vgvina_scrapping_voucher_items_backup_pre_inventory_split;
-- DROP TABLE IF EXISTS vgvina_return_voucher_items_backup_pre_inventory_split;
-- =============================================================================
