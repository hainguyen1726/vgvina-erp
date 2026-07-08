-- =============================================================================
-- MIGRATION: Populate vgvina_user_facilities from existing user-facility mapping
-- =============================================================================
-- Mục tiêu: Sửa vấn đề nhân viên HN không thấy dữ liệu
-- Nguyên nhân: vgvina_user_facilities trống, BranchContext không lấy được facility
--
-- Giải pháp: Map mỗi user đến facility chính của họ (is_primary = true)
--            Admins có thể thấy tất cả facilities
--
-- An toàn: 
--   - Chỉ insert nếu chưa tồn tại (ON CONFLICT DO NOTHING)
--   - Không xóa dữ liệu hiện tại
-- =============================================================================

BEGIN;

SET search_path TO public;

-- Check: vgvina_user_facilities hiện tại trống?
DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count FROM vgvina_user_facilities;
    RAISE NOTICE 'Current rows in vgvina_user_facilities: %', v_count;
END $$;

-- Get facilities first
-- Assuming facilities từ seed.sql:
-- - 'Hội Sở'
-- - 'Chi nhánh Hà Nội'
-- - 'Chi nhánh Nha Trang'
-- - 'Chi nhánh HCM'

DO $$
DECLARE
    f_hoiso UUID;
    f_hn UUID;
    f_nt UUID;
    f_hcm UUID;
    v_total INT := 0;
BEGIN
    -- Get facility IDs
    SELECT id INTO f_hoiso FROM vgvina_facilities WHERE name = 'Hội Sở';
    SELECT id INTO f_hn FROM vgvina_facilities WHERE name = 'Chi nhánh Hà Nội';
    SELECT id INTO f_nt FROM vgvina_facilities WHERE name = 'Chi nhánh Nha Trang';
    SELECT id INTO f_hcm FROM vgvina_facilities WHERE name = 'Chi nhánh HCM';

    IF f_hoiso IS NULL OR f_hn IS NULL THEN
        RAISE EXCEPTION 'Required facilities not found. Check vgvina_facilities data.';
    END IF;

    -- Clear existing data (if any) - OPTIONAL, uncomment if needed
    -- DELETE FROM vgvina_user_facilities;

    -- ========================================================================
    -- Map users to their primary facility (from seed.sql)
    -- ========================================================================
    -- Based on seed.sql insertion pattern:
    -- Users by email → primary facility based on their role/location

    -- 1. Admin Tổng → Hội Sở (primary) + all others (secondary)
    INSERT INTO vgvina_user_facilities (user_id, facility_id, is_primary)
    SELECT u.id, f_hoiso, TRUE
    FROM vgvina_users u
    WHERE u.email = 'admin@vgvina.com'
    ON CONFLICT (user_id, facility_id) DO NOTHING;
    v_total := v_total + 1;

    -- Admin sees all facilities
    INSERT INTO vgvina_user_facilities (user_id, facility_id, is_primary)
    SELECT u.id, f.id, FALSE
    FROM vgvina_users u, vgvina_facilities f
    WHERE u.email = 'admin@vgvina.com' AND f.id != f_hoiso
    ON CONFLICT (user_id, facility_id) DO NOTHING;
    v_total := v_total + 3;

    -- 2. Quản lý HN → Chi nhánh Hà Nội (primary)
    INSERT INTO vgvina_user_facilities (user_id, facility_id, is_primary)
    SELECT u.id, f_hn, TRUE
    FROM vgvina_users u
    WHERE u.email = 'ql.hn@vgvina.com'
    ON CONFLICT (user_id, facility_id) DO NOTHING;
    v_total := v_total + 1;

    -- 3. Sale HN 1 → Chi nhánh Hà Nội (primary)
    INSERT INTO vgvina_user_facilities (user_id, facility_id, is_primary)
    SELECT u.id, f_hn, TRUE
    FROM vgvina_users u
    WHERE u.email = 'sale1.hn@vgvina.com'
    ON CONFLICT (user_id, facility_id) DO NOTHING;
    v_total := v_total + 1;

    -- 4. Sale HN 2 → Chi nhánh Hà Nội (primary)
    INSERT INTO vgvina_user_facilities (user_id, facility_id, is_primary)
    SELECT u.id, f_hn, TRUE
    FROM vgvina_users u
    WHERE u.email = 'sale2.hn@vgvina.com'
    ON CONFLICT (user_id, facility_id) DO NOTHING;
    v_total := v_total + 1;

    -- 5. Quản lý Nha Trang → Chi nhánh Nha Trang (primary)
    INSERT INTO vgvina_user_facilities (user_id, facility_id, is_primary)
    SELECT u.id, f_nt, TRUE
    FROM vgvina_users u
    WHERE u.email = 'ql.nt@vgvina.com'
    ON CONFLICT (user_id, facility_id) DO NOTHING;
    v_total := v_total + 1;

    -- 6. Nhân viên Kho NT → Chi nhánh Nha Trang (primary)
    INSERT INTO vgvina_user_facilities (user_id, facility_id, is_primary)
    SELECT u.id, f_nt, TRUE
    FROM vgvina_users u
    WHERE u.email = 'kho.nt@vgvina.com'
    ON CONFLICT (user_id, facility_id) DO NOTHING;
    v_total := v_total + 1;

    -- 7. Quản lý HCM → Chi nhánh HCM (primary)
    INSERT INTO vgvina_user_facilities (user_id, facility_id, is_primary)
    SELECT u.id, f_hcm, TRUE
    FROM vgvina_users u
    WHERE u.email = 'ql.hcm@vgvina.com'
    ON CONFLICT (user_id, facility_id) DO NOTHING;
    v_total := v_total + 1;

    -- 8. Sale HCM → Chi nhánh HCM (primary)
    INSERT INTO vgvina_user_facilities (user_id, facility_id, is_primary)
    SELECT u.id, f_hcm, TRUE
    FROM vgvina_users u
    WHERE u.email = 'sale.hcm@vgvina.com'
    ON CONFLICT (user_id, facility_id) DO NOTHING;
    v_total := v_total + 1;

    -- 9. Kế toán Trưởng → Hội Sở (primary)
    INSERT INTO vgvina_user_facilities (user_id, facility_id, is_primary)
    SELECT u.id, f_hoiso, TRUE
    FROM vgvina_users u
    WHERE u.email = 'ketoan@vgvina.com'
    ON CONFLICT (user_id, facility_id) DO NOTHING;
    v_total := v_total + 1;

    -- 10. Nhân viên Mới → Chi nhánh Hà Nội (primary)
    INSERT INTO vgvina_user_facilities (user_id, facility_id, is_primary)
    SELECT u.id, f_hn, TRUE
    FROM vgvina_users u
    WHERE u.email = 'nv.moi@vgvina.com'
    ON CONFLICT (user_id, facility_id) DO NOTHING;
    v_total := v_total + 1;

    -- ========================================================================
    -- Verify result
    -- ========================================================================
    RAISE NOTICE '';
    RAISE NOTICE '====================================================';
    RAISE NOTICE 'POPULATED vgvina_user_facilities';
    RAISE NOTICE '====================================================';
    
    SELECT COUNT(*) INTO v_count FROM vgvina_user_facilities;
    RAISE NOTICE 'Total rows after migration: %', v_count;
    
    -- Show summary by facility
    FOR rec IN 
        SELECT f.name, COUNT(uf.user_id) as user_count
        FROM vgvina_facilities f
        LEFT JOIN vgvina_user_facilities uf ON uf.facility_id = f.id
        GROUP BY f.name
        ORDER BY f.name
    LOOP
        RAISE NOTICE '  %: % users', rec.name, COALESCE(rec.user_count, 0);
    END LOOP;

    -- Show HN staff mapping (diagnostic)
    RAISE NOTICE '';
    RAISE NOTICE 'HN Staff Facility Assignment:';
    FOR rec IN
        SELECT u.full_name, f.name, uf.is_primary
        FROM vgvina_users u
        JOIN vgvina_user_facilities uf ON uf.user_id = u.id
        JOIN vgvina_facilities f ON f.id = uf.facility_id
        WHERE f.name LIKE '%Hà Nội%'
        ORDER BY u.full_name, f.name
    LOOP
        RAISE NOTICE '  % → % (primary: %)', rec.full_name, rec.name, rec.is_primary;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE '✅ MIGRATION COMPLETE';
    
END $$;

COMMIT;
