# 🔧 FIX: Nhân viên HN không thấy dữ liệu

## 📋 Tóm tắt vấn đề

Nhân viên tại chi nhánh Hà Nội (HN) không thấy dữ liệu tồn kho, trong khi trước đó hoạt động bình thường.

### 🎯 Nguyên nhân gốc

**Bảng `vgvina_user_facilities` TRỐNG** - không có mapping giữa users và facilities.

Cụ thể:
- Ứng dụng sử dụng mô hình **junction table**: `vgvina_user_facilities` (user → facility mapping)
- Nhân viên mỗi khi login → `BranchContext.tsx` query `vgvina_user_facilities` để lấy facilities
- Vì bảng này trống → không tìm thấy facility nào → `selectedFacilityId = null`
- Khi `selectedFacilityId = null` + user không phải admin → filter = dummy ID `'00000000-0000-0000-0000-000000000000'`
- Kết quả: **0 sản phẩm được return**

### 🔄 Những gì thay đổi gần đây

Có thể:
1. **Database migration được chạy** - xoá/reset dữ liệu user_facilities
2. **Seed script được chạy** mà không populate `vgvina_user_facilities`
3. **Thứ tự migration sai** - `vgvina_user_facilities` được tạo TRONG `rbac_system.sql` nhưng seed.sql chạy TRƯỚC nó

---

## ✅ HƯỚNG DẪN FIX

### Step 1: Verify vấn đề

Chạy query này trên Supabase SQL Editor:

```sql
-- Kiểm tra vgvina_user_facilities có dữ liệu không
SELECT COUNT(*) as total_mappings FROM vgvina_user_facilities;

-- Kiểm tra staff HN
SELECT 
    u.full_name, 
    u.email,
    COUNT(uf.facility_id) as facility_count
FROM vgvina_users u
LEFT JOIN vgvina_user_facilities uf ON uf.user_id = u.id
WHERE u.email LIKE '%hn%' OR u.email LIKE '%hcm%'
GROUP BY u.id, u.full_name, u.email;
```

**Kết quả mong đợi:**
- `total_mappings`: > 0 (có dữ liệu)
- `facility_count`: ≥ 1 cho mỗi user

Nếu `total_mappings = 0` → bắt buộc chạy migration ở Step 2.

---

### Step 2: Populate vgvina_user_facilities

**2A. Chạy migration script (RECOMMENDED)**

1. Mở Supabase Dashboard → SQL Editor
2. Copy toàn bộ nội dung từ file: `supabase/populate_user_facilities.sql`
3. Paste vào editor
4. Bấm "Run"

Script sẽ:
- Map mỗi user đến facility chính của họ
- Admins có quyền xem tất cả facilities
- Show summary sau khi hoàn thành

**2B. Hoặc chạy manual INSERT** (nếu không dùng script)

```sql
-- Hàm trợ giúp: lấy facility ID
WITH facilities AS (
    SELECT id, name FROM vgvina_facilities
)
-- Insert user → facility mappings
INSERT INTO vgvina_user_facilities (user_id, facility_id, is_primary)
SELECT 
    u.id,
    f.id,
    TRUE -- is_primary = true (mỗi user chỉ có 1 primary)
FROM vgvina_users u
CROSS JOIN (SELECT id FROM vgvina_facilities WHERE name = 'Chi nhánh Hà Nội') f
WHERE u.email LIKE '%hn%' OR u.phone_number LIKE '%hn%'
  AND NOT EXISTS (
      SELECT 1 FROM vgvina_user_facilities 
      WHERE user_id = u.id AND facility_id = f.id
  )
ON CONFLICT (user_id, facility_id) DO NOTHING;
```

---

### Step 3: Xác nhận fix

1. **Browser:** Refresh trang, logout → login lại
2. **Check BranchContext logs:** 
   - Mở DevTools → Console
   - Nhân viên HN phải thấy `branch = 'Chi nhánh Hà Nội'` (không phải 'Chưa gán')

3. **Check dữ liệu:**
   - Warehouse page phải show products for HN
   - Dữ liệu inventory phải không trống

---

## 🚨 CÓ CẢNH BÁO "Bạn chưa được gán chi nhánh"?

Nếu vẫn thấy warning này:

1. **Double-check:**
   ```sql
   SELECT * FROM vgvina_user_facilities 
   WHERE user_id = (SELECT id FROM vgvina_users WHERE email = 'user@email.com');
   ```
   Nếu trống → user chưa được map

2. **Manual insert cho user cụ thể:**
   ```sql
   -- Lấy IDs
   SELECT id FROM vgvina_users WHERE email = 'nhanvien@vgvina.com';  -- Ghi nhớ id
   SELECT id FROM vgvina_facilities WHERE name = 'Chi nhánh Hà Nội'; -- Ghi nhớ id
   
   -- Insert mapping
   INSERT INTO vgvina_user_facilities (user_id, facility_id, is_primary)
   VALUES (USER_ID_HERE, FACILITY_ID_HERE, TRUE);
   ```

3. **Xóa browser cache:**
   - Bấy Ctrl+Shift+Delete
   - Clear "Cookies and other site data"
   - Refresh trang

---

## 🛡️ NGĂN CHẶN SAU ĐẦY

### 1. Update seed.sql

Thêm phần populate `vgvina_user_facilities` vào `supabase/seed.sql` (sau khi insert users):

```sql
-- Thêm vào cuối seed.sql TRƯỚC khi commit

-- Populate vgvina_user_facilities (junction table)
DO $$
DECLARE
    f_hoiso UUID; f_hn UUID; f_nt UUID; f_hcm UUID;
BEGIN
    SELECT id INTO f_hoiso FROM vgvina_facilities WHERE name = 'Hội Sở';
    SELECT id INTO f_hn FROM vgvina_facilities WHERE name = 'Chi nhánh Hà Nội';
    SELECT id INTO f_nt FROM vgvina_facilities WHERE name = 'Chi nhánh Nha Trang';
    SELECT id INTO f_hcm FROM vgvina_facilities WHERE name = 'Chi nhánh HCM';

    -- [Copy relevant INSERT statements from populate_user_facilities.sql]
END $$;
```

### 2. Cải thiện logic fallback

File `pages/Warehouse.tsx` đã được update:
- Thêm warning log khi user không có facility
- Show notification: "Bạn chưa được gán chi nhánh"
- Giúp detect issue sớm hơn

### 3. Add RLS policy

Thêm row-level security để enforce facility access:

```sql
-- (Future enhancement)
-- DROP POLICY IF EXISTS "Users see own facility data" ON vgvina_inventory;
-- CREATE POLICY "Users see own facility data" ON vgvina_inventory
--   FOR SELECT USING (
--     facility_id IN (
--       SELECT facility_id FROM vgvina_user_facilities 
--       WHERE user_id = (current_user_id)
--     )
--   );
```

---

## 📝 Checklist

- [ ] Verify `vgvina_user_facilities` is empty (SELECT COUNT)
- [ ] Run migration script `populate_user_facilities.sql`
- [ ] Confirm mappings exist for HN staff
- [ ] Clear browser cache
- [ ] Logout → Login again
- [ ] Verify Warehouse shows HN products
- [ ] Update `seed.sql` to include user_facilities population
- [ ] Test with multiple users (HN, NT, HCM)
- [ ] Check console for any warnings

---

## 🔗 Liên quan đến

- [BranchContext.tsx](../contexts/BranchContext.tsx) - Nơi query vgvina_user_facilities
- [Warehouse.tsx](../pages/Warehouse.tsx) - Nơi sử dụng selectedFacilityId
- [schema.sql](rbac_system.sql) - Định nghĩa vgvina_user_facilities
- [populate_user_facilities.sql](populate_user_facilities.sql) - Migration script

---

## ❓ FAQs

**Q: Tại sao logic này lại sử dụng junction table?**
A: Để support "users có quyền truy cập nhiều facilities" (multi-facility access) trong tương lai. Hiện tại mỗi user chỉ có 1 primary facility.

**Q: Có lúc nào data sẽ bị xóa tự động?**
A: Nếu:
- Chạy `seed.sql` mà không populate `vgvina_user_facilities`
- Chạy script reset database
- Chạy migration bị lỗi ở giữa chừng

**Q: Làm sao để add user mới?**
A: 
1. Insert vào `vgvina_users`
2. **KHÔNG QUÊN**: Insert vào `vgvina_user_facilities` với (user_id, facility_id, is_primary=true)

---

Cập nhật: 2026-05-06
