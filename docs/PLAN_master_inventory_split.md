# Plan: Tách Product master khỏi Inventory per facility

## Mục tiêu

Hiện tại `vgvina_products` đang lưu `facility_id` + `quantity` trên cùng record →
mỗi cặp `(sku, facility)` là 1 record products riêng. Hệ quả:
- Tồn kho và Báo cáo xuất nhập tồn hiển thị 2-3 dòng cho cùng 1 sản phẩm khi nó tồn ở nhiều chi nhánh.
- Tạo sản phẩm phải gán kho.
- Trigger `inventory_triggers.sql:87-88` phải tự INSERT product mới khi chuyển kho — gốc rễ sinh duplicate.

Sau khi rework:
- `vgvina_products`: 1 record / SKU. Master toàn hệ thống. Không có `facility_id`, không có `quantity`.
- `vgvina_inventory(product_id, facility_id, quantity)`: tồn theo từng cặp.
- Tạo sản phẩm: chỉ điền master info, không gán kho — dùng được toàn hệ thống.
- UI Tồn kho: 1 dòng / sản phẩm; quantity = tồn tại facility đang chọn (hoặc SUM nếu "tất cả"). Click chi tiết → bảng tồn theo từng chi nhánh.
- Báo cáo xuất nhập tồn: thêm filter chi nhánh; mỗi sản phẩm chỉ 1 dòng.

## Tiền điều kiện (đã xong)

- ✅ Đã merge xong duplicate products (manual cleanup).
- ✅ Đã thêm validation trùng mã + trùng tên trong `createProduct`/`updateProduct`.
- ⚠️ Chưa thêm UNIQUE constraint trên `vgvina_products.sku` — sẽ thêm trong migration này.

## Phase chia nhỏ (mỗi phase độc lập, có rollback riêng)

### Phase 1 — Backup + soạn migration SQL (không động DB)

**Deliverables**:
- `supabase/migrate_split_master_inventory.sql` — script:
  1. Tạo bảng `vgvina_inventory(product_id UUID, facility_id UUID, quantity NUMERIC, PRIMARY KEY(product_id, facility_id))` + indexes.
  2. Migrate dữ liệu: với mỗi `vgvina_products` (đã merge xong) còn `facility_id` + `quantity`, INSERT row tương ứng vào `vgvina_inventory`. Nếu `facility_id` NULL thì bỏ qua (sẽ recompute bằng sync sau).
  3. Drop column `facility_id`, `quantity` trên `vgvina_products`.
  4. ADD CONSTRAINT `vgvina_products_sku_unique UNIQUE (sku)`.
  5. ADD CONSTRAINT `vgvina_products_name_unique UNIQUE (lower(btrim(name)))` (case-insensitive, optional).
  6. Viết lại function `sync_inventory_quantity(product_id)` để recompute từ items vào `vgvina_inventory` thay vì `vgvina_products.quantity`.
  7. Viết lại các trigger trong `inventory_triggers.sql` để insert/update vào `vgvina_inventory` theo `(product_id, facility_id)` lấy từ `order.facility_id` (sales/purchase) hoặc `transfer.from_facility_id`/`to_facility_id` (internal_transfer). **Bỏ block tự INSERT products mới khi chuyển kho** — đây chính là bug nguồn.

**Rủi ro**: Drop column là không reversible nếu chưa backup. → **Bắt buộc backup DB trước** ở Phase 2.

### Phase 2 — Backup + chạy migration (DB-only, có downtime ngắn)

1. Backup DB từ Supabase Dashboard.
2. Chạy `supabase/migrate_split_master_inventory.sql`. Script in `RAISE NOTICE` từng bước.
3. Chạy `supabase/sync_all_inventory.sql` (sẽ soạn) để recompute toàn bộ tồn cho mọi cặp (product, facility) dựa trên giao dịch.
4. Verify bằng query: tổng quantity mới == tổng quantity cũ (lưu sẵn trước migration).

### Phase 3 — Cập nhật service layer

Các function cần sửa trong `src/services/productService.ts`:

1. **`getProducts(facilityId?)`** — đổi từ filter `WHERE facility_id = X` sang JOIN `vgvina_inventory`:
   - Nếu `facilityId` → `quantity = inventory.quantity at that facility (default 0)`.
   - Nếu không → `quantity = SUM(inventory.quantity)`.
   - Trả về danh sách products distinct theo product.id.

2. **`getInventorySummaryReport(start, end, facilityId?)`** — group theo `product_id`:
   - Aggregate sales/purchases/transfers/scrapping/returns theo `product_id` (filter facility theo `order.facility_id` nếu có).
   - Tính `beginning` từ `vgvina_inventory` snapshot tại thời điểm `startDate` (cần view hỗ trợ hoặc tính từ giao dịch trước startTS).
   - Trả về 1 row / `product_id`, không group thêm theo facility.

3. **`getInventoryMovementHistory(productId, facilityId?)`** — đã filter theo product_id rồi. Thêm filter facility nếu có. Format balance theo facility tương tự.

4. **`createProduct`/`updateProduct`** — bỏ field `facility_id` và `quantity` khỏi payload (sẽ không tồn tại trên schema mới).

5. **`bulkUpsertProducts`** — đổi onConflict từ `'sku, facility_id'` sang `'sku'`.

6. **`syncInventory(productId?)`** — gọi RPC mới recompute `vgvina_inventory` per facility.

### Phase 4 — Cập nhật UI

1. **`pages/Warehouse.tsx` (Tồn kho)**:
   - Bỏ ẩn cột "Kho hàng" (vì giờ là per-facility).
   - Cột "Tồn kho" hiển thị quantity tại facility đang chọn (hoặc SUM).
   - Modal chi tiết sản phẩm: thêm bảng "Tồn kho theo chi nhánh" liệt kê quantity tại từng facility.
   - Form Thêm/Sửa sản phẩm: bỏ field "Kho" và "Tồn kho" (ngoại trừ khi nhập tồn ban đầu — sẽ cần modal riêng "Cập nhật tồn ban đầu").

2. **`pages/ReportInventorySummary.tsx`**:
   - Thêm dropdown "Chi nhánh" trong FilterBar (đã có `selectedFacilityId` từ context, chỉ cần truyền vào).
   - 1 dòng / sản phẩm bất kể chọn facility nào.

3. **`components/modals/ProductMovementModal.tsx` (Thẻ kho)**:
   - Thêm filter chi nhánh trong modal.
   - Khi chọn "Tất cả" → giao dịch của tất cả facility.

4. **Form thêm sản phẩm**:
   - Bỏ field "Kho hàng".
   - Tồn ban đầu = 0 mặc định. User sẽ nhập tồn qua phiếu "Tồn đầu kỳ" (đã có nếu có) hoặc qua menu riêng.

### Phase 5 — Test & rollback plan

- Test golden path: tạo sản phẩm mới → xuất hiện trong Tồn kho 1 dòng (quantity 0).
- Test xuất hàng (SO completed) → tồn tại facility đó giảm; báo cáo còn 1 dòng.
- Test chuyển kho (internal-transfer) → tồn 2 facility thay đổi; **không sinh product mới**.
- Test báo cáo xuất nhập tồn: kết quả khớp với trước migration (verify bằng tổng số liệu).

**Rollback**: nếu phát hiện sai sau khi migrate:
- Restore từ backup Supabase (Phase 2 step 1).
- Revert code TypeScript về commit trước Phase 3.

## Câu hỏi cần bạn quyết trước khi tôi soạn migration

1. **Tồn ban đầu khi tạo sản phẩm mới**: hiện tại form có cho nhập tồn ban đầu cùng lúc tạo sản phẩm không? Sau rework, tôi đề xuất: tạo sản phẩm xong tồn = 0, muốn có tồn thì dùng phiếu nhập (PO) hoặc phiếu "Tồn đầu kỳ" (nếu chưa có thì cần tạo). Bạn OK?

2. **UNIQUE name**: có nên enforce UNIQUE trên `name` (case-insensitive + trim) ở DB không? Hay chỉ check ở app layer (như đang làm)? DB-level chặt nhưng có thể vướng các sản phẩm hiện tại có tên trùng nhẹ (cần tôi soạn query inspect tên trùng giống như SKU).

3. **Downtime**: chạy migration cần dừng ghi DB ~vài phút (drop column khoá bảng). Bạn chọn lúc nào? Cuối tuần / ngoài giờ?

4. **Phase ordering**: bạn muốn:
   - **(a) Big-bang**: làm hết Phase 1-4 trên branch riêng, deploy 1 lượt sau khi test xong. Downtime ngắn nhưng PR lớn.
   - **(b) Incremental**: deploy code tương thích cả schema cũ và mới (đọc từ inventory nếu có, fallback về `products.quantity`), migrate DB sau, dọn fallback sau. An toàn hơn nhưng code phức tạp tạm thời.

   Tôi đề xuất **(a)** vì codebase ở giai đoạn còn nhỏ, dễ test toàn bộ và rollback bằng restore backup.

## Ước lượng

- Phase 1 (soạn SQL): ~1-2h tôi viết, bạn review.
- Phase 2 (chạy migration trên prod): ~10 phút thực thi sau khi đã backup.
- Phase 3 (service): ~3-4h sửa + test.
- Phase 4 (UI): ~3-5h sửa + test trên dev server.
- Phase 5 (test prod): tuỳ.

Tổng ~1 ngày làm việc nếu không có gì bất ngờ.
