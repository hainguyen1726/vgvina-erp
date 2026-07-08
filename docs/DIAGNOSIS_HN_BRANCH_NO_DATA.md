# 🔍 DIAGNOSIS: Tại sao HN staff không thấy dữ liệu

## ✅ ROOT CAUSE IDENTIFIED

**Bảng `vgvina_user_facilities` không có dữ liệu!**

### Chi tiết vấn đề:

1. **Cấu trúc dữ liệu:**
   - `vgvina_users` - không có cột `facility_id` (đã xóa)
   - `vgvina_user_facilities` (junction table)
     - Columns: `user_id`, `facility_id`, `is_primary`
     - Được tạo bởi `rbac_system.sql`

2. **Vấn đề:**
   - `BranchContext.tsx` dòng 71-88 query:
     ```typescript
     facilities:vgvina_user_facilities (
         is_primary,
         facility_id,
         facility:vgvina_facilities (name)
     )
     ```
   - **Nhưng bảng `vgvina_user_facilities` TRỐNG!**
   - Seed data (`seed.sql`) không populate bảng này

3. **Kết quả:**
   - `primaryFacility` = undefined
   - `facilityName` = 'Chưa gán'
   - `selectedFacilityId` = undefined
   - `facilityFilter` = '00000000-0000-0000-0000-000000000000' (dummy ID)
   - ❌ Nhân viên không thấy dữ liệu

### Timeline:
```
schema.sql chạy
  ↓
seed.sql chạy (insert vgvina_users + vgvina_facilities)
  ↓
rbac_system.sql chạy (tạo vgvina_user_facilities)
  ✗ LÚC NÀY SEED.SQL ĐÃ CHẠY RỒI!
```

## 🔧 FIX REQUIRED

**Option 1: Add vgvina_user_facilities data to seed.sql**
```sql
-- After inserting users, populate vgvina_user_facilities
DO $$
DECLARE
    f_hoiso UUID;
    f_hn UUID;
    f_nt UUID;
    f_hcm UUID;
    u_admin BIGINT;
    u_ql_hn BIGINT;
    -- ... more user IDs
BEGIN
    -- Get facility IDs
    SELECT id INTO f_hoiso FROM vgvina_facilities WHERE name = 'Hội Sở';
    SELECT id INTO f_hn FROM vgvina_facilities WHERE name = 'Chi nhánh Hà Nội';
    -- ... other facilities
    
    -- Get user IDs
    SELECT id INTO u_admin FROM vgvina_users WHERE email = 'admin@vgvina.com';
    SELECT id INTO u_ql_hn FROM vgvina_users WHERE email = 'ql.hn@vgvina.com';
    -- ... other users
    
    -- Insert user-facility relationships
    INSERT INTO vgvina_user_facilities (user_id, facility_id, is_primary) VALUES
    (u_admin, f_hoiso, true),     -- Admin → Hội Sở (primary)
    (u_admin, f_hn, false),        -- Admin có quyền xem tất cả
    (u_ql_hn, f_hn, true),         -- Quản lý HN → Chi nhánh HN (primary)
    -- ... more mappings
    ON CONFLICT DO NOTHING;
END $$;
```

**Option 2: Run migration after all scripts**
```bash
# Order must be:
1. schema.sql
2. rbac_system.sql  ← Move this BEFORE seed.sql!
3. seed.sql + populate vgvina_user_facilities
4. Other migrations
```

## 📋 Checklist FIX

- [ ] Confirm vgvina_user_facilities is empty: 
  ```sql
  SELECT COUNT(*) FROM vgvina_user_facilities;
  ```
  
- [ ] If empty, populate it by running:
  ```sql
  -- Generate proper mappings based on current vgvina_users + vgvina_facilities
  ```
  
- [ ] Verify BranchContext can now fetch facilities:
  - User for HN should see `branch = 'Chi nhánh Hà Nội'`
  - User should see `selectedFacilityId != null`
  
- [ ] Test Warehouse page - should show products for HN facility

## 🐛 SECONDARY ISSUE

Even if vgvina_user_facilities is populated, there's a **logic bug in Warehouse.tsx** (line 387-388):

```typescript
const facilityFilter = selectedFacilityId === null
    ? (currentUser?.is_admin ? undefined : '00000000-0000-0000-0000-000000000000')
    : selectedFacilityId;
```

If a regular user somehow gets `selectedFacilityId = null`, they see ZERO data (dummy ID).
Better: throw error or default to their primary facility.
