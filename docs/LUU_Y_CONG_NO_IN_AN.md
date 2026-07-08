# Hướng dẫn Kỹ thuật: Quy trình Công nợ, Thanh toán FIFO & Giải pháp In ấn

Tài liệu này ghi lại chi tiết nghiệp vụ và giải pháp kỹ thuật liên quan đến quy trình tính toán công nợ đối tác, cơ chế thanh toán thực tế cấn trừ FIFO và các tinh chỉnh CSS in ấn đặc thù để tránh lỗi lặp lại trong tương lai.

---

## 1. Quy trình Tính toán Công nợ & Lọc Giao dịch Ảo

### Bản chất nghiệp vụ
Hệ thống sử dụng cơ chế ghi sổ kép tự động. Khi một đơn hàng (bán hoặc mua) phát sinh mà đối tác chưa thanh toán toàn bộ (`remaining > 0`):
1. Một khoản nợ tương ứng được tạo trong bảng `vgvina_debt_transactions`.
2. Một bút toán dòng tiền ảo đối ứng (mã bắt đầu bằng `PT(N)` cho bán hàng hoặc `PC(N)` cho mua hàng) được tạo tự động vào **Tài khoản công nợ mặc định** (`TK KN` cho khách hàng, `TK Nợ NCC` cho nhà cung cấp) để cân đối sổ cái.

### Quy tắc kỹ thuật bắt buộc
Các giao dịch ảo này bản chất chỉ dùng cho báo cáo tài chính/sổ cái tổng hợp. **Tuyệt đối không được tính làm phát sinh giảm công nợ thực tế** trong các nghiệp vụ chi tiết.

Do đó, khi xây dựng các chức năng sau:
*   **Tính số dư công nợ tổng quan** (`partnerService.getPartners`)
*   **Lịch sử sổ chi tiết công nợ đối tác** (`partnerService.getPartnerStatement`)
*   **Bảng kê/Phiếu báo công nợ đối tác** (`VoucherModal.tsx` dạng `debt-notice`)

**Bắt buộc phải lọc bỏ hoàn toàn** các giao dịch có liên kết với tài khoản `TK KN` hoặc `TK Nợ NCC`:
```typescript
// Ví dụ lọc trong code:
const payments = allPayments.filter(
    t => t.account_name !== 'TK KN' && t.account_name !== 'TK Nợ NCC'
);
```

---

## 2. Cơ chế Thanh toán Nhanh Công nợ (FIFO)

Khi đối tác thực hiện thanh toán nợ thực tế:
1. Giao dịch phải đi qua **tài khoản quỹ thực tế** (như Tiền mặt, Ngân hàng Techcombank, v.v...), không bao giờ chọn tài khoản công nợ.
2. Gọi hàm `transactionService.createFinancialTransaction(...)` từ frontend.
3. Ở backend, hàm này tự động thực hiện:
    *   Truy vấn các khoản nợ của đối tác trong `vgvina_debt_transactions` (`RECEIVABLE` nếu thu nợ khách, `PAYABLE` nếu trả nợ NCC) đang ở trạng thái `UNPAID` hoặc `PARTIALLY_PAID` xếp theo thứ tự thời gian tăng dần (`created_at ASC`).
    *   Thực hiện cấn trừ nợ từ cũ đến mới (cơ chế FIFO - First In, First Out).
    *   Cập nhật trạng thái các khoản nợ thành `PAID` hoặc `PARTIALLY_PAID`.
    *   Tự động sinh ra bút toán ảo đối ứng (`PT(N)` / `PC(N)`) vào tài khoản nợ mặc định (`TK KN` / `TK Nợ NCC`) tương ứng với số tiền nợ thực tế đã cấn trừ để đồng bộ sổ sách kế toán.
    *   Tự động cập nhật số dư cho cả tài khoản quỹ thực tế và tài khoản công nợ ảo.

---

## 3. Giải pháp Xử lý In ấn trong CSS (`index.css`)

Khi lập trình các tính năng in ấn (`window.print()`), có hai lỗi phổ biến trên các trình duyệt dựa trên Chromium (Chrome, Edge):

### Lỗi 3 trang trắng thừa cuối tài liệu
*   **Nguyên nhân:** Khi nhấn in, modal hoặc các cấu trúc portal đang hiển thị được React mount trực tiếp vào `document.body` (nằm ngoài thẻ `#root` của ứng dụng). Trình duyệt vẫn tính toán kích thước layout cho các modal này dẫn tới in ra các trang trắng trống ở cuối.
*   **Giải pháp:** Trong file [index.css](file:///f:/0. Code/vgvina-erp/index.css), thay vì chỉ ẩn `#root`, ta sử dụng quy tắc ẩn tất cả các con trực tiếp của `body` ngoại trừ khung in `#print-section`:
    ```css
    @media print {
      body > *:not(#print-section) {
        display: none !important;
      }
    }
    ```

### Lỗi hiển thị URL và tiêu đề ở đầu/chân trang (`https://baocao.vgvina.com`)
*   **Nguyên nhân:** Trình duyệt mặc định in header và footer chứa URL trang web, ngày in và tiêu đề.
*   **Giải pháp:** Cấu hình `@page` với margin bằng 0 bên trong `@media print` để buộc trình duyệt ẩn hoàn toàn thông tin này:
    ```css
    @media print {
      @page {
        size: auto;
        margin: 0; /* Ẩn vĩnh viễn header/footer mặc định của trình duyệt */
      }
    }
    ```
*   **Lưu ý:** Để nội dung hóa đơn không bị dính sát vào mép giấy khi đặt `margin: 0`, ta sử dụng `padding` (ví dụ `padding: 1.5cm 1.2cm !important;`) trong class `.print-container` của hóa đơn in.

---

## 4. Danh sách các file liên quan cần lưu ý
*   **Backend Services:**
    *   [partnerService.ts](file:///f:/0. Code/vgvina-erp/src/services/partnerService.ts): Quản lý truy vấn thông tin đối tác và sổ chi tiết (đã lọc giao dịch ảo).
    *   [transactionService.ts](file:///f:/0. Code/vgvina-erp/src/services/transactionService.ts): Xử lý nghiệp vụ tạo giao dịch và tự động cấn trừ FIFO.
    *   [orderService.ts](file:///f:/0. Code/vgvina-erp/src/services/orderService.ts): Tạo hóa đơn bán/mua hàng và xử lý công nợ ban đầu.
*   **Frontend UI:**
    *   [PartnerStatement.tsx](file:///f:/0. Code/vgvina-erp/pages/PartnerStatement.tsx): Giao diện Sổ chi tiết công nợ & tích hợp nút thanh toán nhanh.
    *   [VoucherModal.tsx](file:///f:/0. Code/vgvina-erp/components/modals/VoucherModal.tsx): Trực tiếp tạo các phiếu in (lọc giao dịch ảo đối với `debt-notice`).
    *   [index.css](file:///f:/0. Code/vgvina-erp/index.css): Nơi chứa các quy tắc in ấn toàn cục.
