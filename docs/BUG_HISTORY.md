# 📋 Lịch sử Lỗi & Phương án Khắc phục (VGVINA ERP)

> **QUAN TRỌNG:** AI hoặc lập trình viên khi tiếp nhận nhiệm vụ sửa lỗi, nâng cấp hệ thống **BẮT BUỘC** phải đọc tệp tin này trước để hiểu rõ các sự cố đã xảy ra trong quá khứ, tránh làm mất các bản vá (fix) cũ khi viết code mới.

---

## 1. Lỗi Tồn kho khi Lưu tạm Đơn hàng (Sales/Purchase Order)
*   **Hiện tượng:** Khi lập phiếu giao hàng (SO) hoặc nhập kho (PO), nếu chọn **Lưu tạm (PENDING)**, hệ thống vẫn tự động trừ/cộng tồn kho thực tế và hiển thị dòng xuất/nhập trong Thẻ kho. Khi mở lại phiếu lưu tạm để xử lý tiếp, hệ thống kiểm tra tồn kho khả dụng (vốn đã bị trừ ảo trước đó) và báo lỗi không đủ tồn kho.
*   **Nguyên nhân:** Đợt tách bảng tồn kho ngày 06/05/2026 đã vô tình xóa các trigger cũ và viết lại trigger mới mà không kiểm tra điều kiện trạng thái đơn hàng (`status`). Các trigger item (`trigger_update_inventory_sales`, `trigger_update_inventory_purchase`) chạy trực tiếp trên thao tác `INSERT/UPDATE/DELETE` dòng hàng mà không quan tâm phiếu là nháp hay hoàn thành.
*   **Cách khắc phục:** 
    1. Cập nhật lại các trigger item để chỉ thay đổi tồn kho khi trạng thái đơn hàng đang là `COMPLETED` hoặc `DELIVERED`.
    2. Thêm/sửa các trigger theo dõi sự thay đổi trạng thái đơn hàng (`trigger_update_inventory_sales_status`, `trigger_update_inventory_purchase_status`) trên bảng header:
        - `PENDING` -> `COMPLETED`/`DELIVERED`: Cộng/Trừ tồn kho.
        - `COMPLETED`/`DELIVERED` -> `PENDING`/`CANCELLED`: Hoàn tác (trừ lại/cộng lại) tồn kho.
    3. Cập nhật lại logic hàm lấy Thẻ kho `getInventoryMovementHistory` trong `productService.ts` chỉ hiển thị các đơn hàng có trạng thái `COMPLETED` hoặc `DELIVERED`.

---

## 2. Quy trình Chuyển kho Nội bộ tự động hoàn thành cả hai đầu
*   **Hiện tượng:** Khi lập phiếu chuyển kho từ Nha Trang đi Hà Nội, bấm xác nhận thì hàng tự động tăng tại Hà Nội lập tức, mặc dù hàng còn đi đường 1-2 ngày và đầu Hà Nội chưa thực tế kiểm đếm nhận hàng.
*   **Nguyên nhân:** Trigger `trigger_update_inventory_transfer` trên bảng `vgvina_internal_transfer_items` khi chạy sẽ ngay lập tức trừ kho nguồn (`from_facility_id`) và cộng kho đích (`to_facility_id`) mà không kiểm tra trạng thái phiếu chuyển kho là `PENDING` hay `COMPLETED`.
*   **Cách khắc phục (Quy trình 2 bước):**
    1. Khi Nha Trang lập phiếu chuyển kho và gửi đi (Trạng thái ban đầu là `PENDING`): Trigger sẽ **chỉ trừ tồn tại Nha Trang** (from_facility), chưa cộng tồn tại Hà Nội (to_facility).
    2. Khi Hà Nội nhận được hàng thực tế và kiểm đếm xong, thủ kho Hà Nội bấm **"Xác nhận Hoàn thành"** (chuyển trạng thái sang `COMPLETED`). Trigger header sẽ kích hoạt và **cộng tồn kho tại Hà Nội**.
    3. Nếu phiếu bị hủy (`CANCELLED`): Hệ thống sẽ hoàn lại (cộng lại) tồn kho cho Nha Trang.
    4. Thẻ kho Nha Trang hiển thị "Xuất điều chuyển" khi trạng thái là `PENDING` hoặc `COMPLETED`. Thẻ kho Hà Nội chỉ hiển thị "Nhập điều chuyển" khi trạng thái là `COMPLETED`.

---

## 3. Lỗi UUID khi Sửa phiếu Thu/Chi (`invalid input syntax for type uuid`)
*   **Hiện tượng:** Khi người dùng mở một phiếu thu hoặc chi cũ ra để sửa đổi (ví dụ: sửa ngày thu chi, số tiền) và bấm "Lưu thay đổi", hệ thống báo lỗi: `Lỗi khi lưu: invalid input syntax for type uuid: "Doanh thu Bán hàng"` (hoặc tên hạng mục tương ứng).
*   **Nguyên nhân:**
    1. Trong file source `src/services/transactionService.ts` (ở local), trường `category_id` được gán chính xác bằng `updates.categoryId` (là một UUID).
    2. Tuy nhiên, bản build trên môi trường production (`dist/assets/index-*.js`) được build từ code cũ, nơi mà `category_id` bị gán nhầm thành `updates.category` (là tên danh mục dạng chữ `"Doanh thu Bán hàng"`, thay vì UUID). 
    3. Do chưa chạy build lại và deploy bản build mới lên VPS đúng cách, nên lỗi này vẫn tiếp tục xảy ra trên môi trường chạy thực tế mặc dù mã nguồn local đã được sửa.
*   **Cách khắc phục:**
    1. Xác minh lại file `src/services/transactionService.ts` đã map đúng `category_id: updates.categoryId` chưa.
    2. Thực hiện build lại dự án (`npm run build`).
    3. Triển khai (deploy) bản build mới lên VPS và khởi động lại dịch vụ web (OpenLiteSpeed) để tải cấu hình file `.htaccess` và code js mới.

---

## 4. Lỗi cột `v.facility_id` không tồn tại khi chạy SQL Recompute tồn kho
*   **Hiện tượng:** Khi chạy script SQL cập nhật trigger tồn kho mới, cơ sở dữ liệu báo lỗi: `ERROR: 42703: column v.facility_id does not exist`.
*   **Nguyên nhân:** Bản thân bảng phiếu trả hàng `vgvina_return_vouchers` (`v`) không có cột `facility_id` trực tiếp, mà chi nhánh của nó phải được lấy gián tiếp qua đơn hàng liên kết (sales hoặc purchase) thông qua hàm helper `public.get_return_facility(v.id)`. Khi thực hiện câu lệnh Recompute tồn kho và hàm `sync_inventory_quantity`, câu lệnh đã gọi nhầm cột `v.facility_id`.
*   **Cách khắc phục:** Thay thế `v.facility_id` bằng hàm gọi helper `public.get_return_facility(v.id)` trong toàn bộ các câu lệnh SQL Recompute và sync tồn kho của file trigger.

---

## 5. Lỗi Nút Xác nhận Chuyển kho Nội bộ tự động hoàn thành phiếu (Chuyển thành COMPLETED ngay khi tạo)
*   **Hiện tượng:** Khi lập phiếu chuyển kho Nha Trang đi Hà Nội, dù đã sửa logic DB sang 2 bước nhưng khi bấm "Xác nhận" (hoặc "Xác nhận & In") tại form tạo chuyển kho, phiếu vẫn bị chuyển thành `COMPLETED` ngay lập tức và tăng tồn Hà Nội.
*   **Nguyên nhân:** Trong file `components/modals/VoucherModal.tsx`, các nút bấm Xác nhận của form chuyển kho (`internal-transfer`) gọi hàm `handleConfirm(true)` và `handleConfirm(false)` mà không truyền tham số trạng thái thứ hai `status`. Do hàm `handleConfirm` được khai báo với giá trị mặc định `status: OrderStatus = OrderStatus.COMPLETED`, nên phiếu luôn bị ghi đè trạng thái thành `COMPLETED` khi được gửi từ form tạo mới.
*   **Cách khắc phục:** 
    - Sửa sự kiện onClick của các nút **Xác nhận** và **Xác nhận & In** trong form chuyển kho nội bộ để gọi hàm `handleConfirm` kèm trạng thái `OrderStatus.PENDING`, đảm bảo khi kho Nha Trang bấm xác nhận gửi hàng đi, phiếu sẽ được tạo dưới trạng thái **Đang chờ (PENDING)** thay vì tự động chuyển thành **Đã hoàn thành (COMPLETED)** và cộng tồn kho Hà Nội ngay lập tức.

---

## 6. Lỗi "column facility_id does not exist" khi tạo phiếu Trả hàng (Return Voucher)
*   **Hiện tượng:** Khi người dùng tạo phiếu trả hàng mới và bấm Xác nhận, hệ thống báo lỗi `Có lỗi xảy ra khi tạo đơn: column "facility_id" does not exist` và không lưu được phiếu. Các phiếu trả hàng đã tạo trước đó cũng bị biến mất hoặc không tìm thấy.
*   **Nguyên nhân:** Bảng phiếu trả hàng `vgvina_return_vouchers` không có cột `facility_id` trực tiếp (chi nhánh được xác định gián tiếp qua đơn hàng gốc). Tuy nhiên, trong trigger item `update_inventory_on_return_item` và trigger status `update_inventory_on_return_status_change` lại truy cập trực tiếp vào cột `facility_id` (ví dụ: `NEW.facility_id` hoặc `FROM vgvina_return_vouchers WHERE id = ... SELECT facility_id`). Điều này khiến DB trigger báo lỗi cú pháp cột không tồn tại và rollback toàn bộ transaction lưu phiếu trả hàng.
*   **Cách khắc phục:** 
    - Cập nhật hai hàm trigger `update_inventory_on_return_item()` và `update_inventory_on_return_status_change()` trong file `fix_inventory_realtime_triggers.sql` để dùng hàm helper `public.get_return_facility(return_id)` thay vì truy cập cột `facility_id` trực tiếp.
    - Chạy lại script SQL trigger này trên Supabase SQL Editor để cập nhật DB.

---

## 7. Lỗi Sổ chi tiết Công nợ và Tổng Công nợ không giảm khi khách trả lại hàng (Dù chọn Trừ công nợ)
*   **Hiện tượng:** Khi khách trả lại hàng và chọn phương thức xử lý là "Trừ công nợ", số tiền tịnh của phiếu trả hàng không được trừ vào tổng công nợ của khách hàng, đồng thời phiếu trả hàng cũng không xuất hiện trong Sổ chi tiết công nợ.
*   **Nguyên nhân:** 
    1. **Với Tổng công nợ:** Hàm `createReturnVoucher` ở `orderService.ts` chỉ tạo phiếu trả hàng mà không có logic chèn dòng giảm nợ vào bảng `vgvina_debt_transactions` cũng như giảm số dư tài khoản nợ `TK KN` (Phải thu).
    2. **Với Sổ chi tiết Công nợ:** Hàm `getPartnerStatement` ở `partnerService.ts` chỉ tải dữ liệu từ các bảng `sales_orders`, `purchase_orders` và `financial_transactions` mà hoàn toàn bỏ qua bảng `vgvina_return_vouchers`.
*   **Cách khắc phục:** 
    - **Sửa Tổng công nợ:** Thêm logic cấn trừ nợ vào cuối hàm `createReturnVoucher` trong [orderService.ts](file:///f:/0. Code/vgvina-erp/src/services/orderService.ts). Nếu phiếu trả hàng có trạng thái khác `PENDING` và phương thức là `Trừ công nợ`: tự động duyệt qua các khoản nợ chưa thanh toán (`RECEIVABLE` hoặc `PAYABLE`) của đối tác để cấn trừ nợ, đồng thời ghi nhận một giao dịch ảo giảm nợ trên tài khoản nợ `TK KN` / `TK Nợ NCC` và cập nhật lại số dư của tài khoản nợ đó.
    - **Sửa Sổ chi tiết:** Cập nhật hàm `getPartnerStatement` trong [partnerService.ts](file:///f:/0. Code/vgvina-erp/src/services/partnerService.ts) để truy vấn thêm các phiếu trả hàng (`vgvina_return_vouchers` kèm items), lọc các phiếu liên quan đến đối tác và ánh xạ chúng thành dòng giảm nợ (`decrease = netTotal`, `type = 'RETURN_VOUCHER'`) đưa vào Sổ chi tiết công nợ của khách hàng / nhà cung cấp.

---

## 8. Thiếu Phiếu trả hàng trong Thông báo công nợ & Thiếu các liên kết trong menu Báo cáo
*   **Hiện tượng:** 
    1. Khi tạo hoặc xem trước Thông báo công nợ (modal `debt-notice` trong `VoucherModal.tsx`) hoặc xuất file Excel, các phiếu trả hàng đã duyệt không hiển thị, khiến công nợ phải thu của khách hàng hoặc nợ NCC bị tính sai (không được giảm trừ số tiền trả hàng).
    2. Người dùng không tìm thấy mục "Báo cáo Trả Hàng" hay "Sổ chi tiết công nợ" trong danh mục Báo cáo ở menu Sidebar bên trái.
*   **Nguyên nhân:**
    1. Hàm `handleGeneratePreview` trong [VoucherModal.tsx](file:///f:/0. Code/vgvina-erp/components/modals/VoucherModal.tsx) chỉ load dữ liệu đơn hàng và thanh toán mà bỏ qua hoàn toàn bảng `vgvina_return_vouchers`.
    2. Menu Sidebar trong [Sidebar.tsx](file:///f:/0. Code/vgvina-erp/components/layout/Sidebar.tsx) chỉ định nghĩa cứng một số báo cáo cơ bản, thiếu các báo cáo mới được bổ sung sau này.
    3. File in ấn [PrintVoucherTemplate.tsx](file:///f:/0. Code/vgvina-erp/components/print/PrintVoucherTemplate.tsx) cho thông báo công nợ chỉ hỗ trợ cấu trúc rút gọn `data.transactions` (từ `Debt.tsx`), không có nhánh in chi tiết bảng kê từ `data.rows` (từ `VoucherModal.tsx`).
*   **Cách khắc phục:**
    1. **Sửa Sidebar:** Thêm các liên kết `/bao-cao/tra-hang`, `/bao-cao/so-chi-tiet-cong-no`, `/bao-cao/huy-hang` vào `subItems` của Báo cáo trong [Sidebar.tsx](file:///f:/0. Code/vgvina-erp/components/layout/Sidebar.tsx).
    2. **Sửa modal Thông báo công nợ:** Cập nhật `handleGeneratePreview` trong [VoucherModal.tsx](file:///f:/0. Code/vgvina-erp/components/modals/VoucherModal.tsx):
        - Truy vấn các phiếu trả hàng đã duyệt của đối tác từ `vgvina_return_vouchers`.
        - Tính tổng tiền trả hàng trước kỳ để trừ vào nợ đầu kỳ (`openingRemaining = orderedBefore - paidBefore - returnedBefore`).
        - Đưa các phiếu trả hàng trong kỳ vào `rowEvents` và hiển thị chúng dưới dạng dòng sự kiện Trả hàng (Credit cho khách hàng, Debit cho NCC) kèm danh sách sản phẩm trả lại chi tiết.
    3. **Sửa bản in:** Thêm nhánh in trong [PrintVoucherTemplate.tsx](file:///f:/0. Code/vgvina-erp/components/print/PrintVoucherTemplate.tsx) nếu có `data.rows` để in ra bảng kê công nợ chi tiết đầy đủ giống như bản xem trước HTML.

---

## 9. Lỗi JOIN trong getReturnVouchers khiến trang Báo cáo Trả Hàng không hiển thị phiếu trả hàng
*   **Hiện tượng:** Khi người dùng mở trang Báo cáo Trả Hàng (`Returns.tsx`), danh sách hoàn toàn trống rỗng mặc dù trong database Supabase đã có sẵn 5 phiếu trả hàng.
*   **Nguyên nhân:**
    *   Hàm `getReturnVouchers` trong [orderService.ts](file:///f:/0. Code/vgvina-erp/src/services/orderService.ts) thực hiện select JOIN trực tiếp `partner:vgvina_sales_orders ( partner:customer_id ( name ) )` dựa trên trường `related_order_id`.
    *   Tuy nhiên, Supabase schema cache báo lỗi `Could not find a relationship between 'vgvina_return_vouchers' and 'vgvina_sales_orders' in the schema cache` vì không có foreign key constraint trực tiếp rõ ràng (mối quan hệ gián tiếp Polymorphic).
    *   Lỗi JOIN này làm cả hai block try và catch của hàm `getReturnVouchers` bị crash, khiến hàm ném ra lỗi và danh sách trên giao diện luôn trống rỗng.
    *   Đồng thời, hàm `getReturnVouchers` cũ chưa hỗ trợ lọc theo chi nhánh (`facilityId`) của đơn hàng gốc, và không map trường mã đơn hàng gốc `related_order_code`.
*   **Cách khắc phục:**
    *   Sửa lại hàm `getReturnVouchers` trong [orderService.ts](file:///f:/0. Code/vgvina-erp/src/services/orderService.ts) bằng cách tách thành các truy vấn đơn lẻ cho bảng phiếu trả hàng (`vgvina_return_vouchers`), đơn bán hàng (`vgvina_sales_orders`), và đơn mua hàng (`vgvina_purchase_orders`).
    *   Thực hiện map đối tác (Khách hàng/NCC), mã đơn hàng gốc (`related_order_code`) và tính toán tổng tiền tịnh của phiếu trả hàng bằng Javascript ở phía client.
    *   Thực hiện lọc chi nhánh (`facilityId`) của phiếu trả hàng bằng cách so khớp với `facility_id` của đơn hàng gốc ngay tại client.



