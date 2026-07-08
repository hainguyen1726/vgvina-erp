-- =============================================================================
-- DIAGNOSE: Tài khoản login không thấy chi nhánh nào (lytruong7271@gmailcom)
-- =============================================================================

-- 1) Xem thông tin user trong vgvina_users (lưu ý email có typo: gmailcom)
SELECT id, email, username, full_name, role, role_id, status
FROM public.vgvina_users
WHERE email ILIKE '%lytruong7271%';

-- 2) Xem các chi nhánh đã gán cho user này (kiểm tra is_primary có set không)
SELECT
    uf.user_id,
    uf.facility_id,
    f.name AS facility_name,
    uf.is_primary,
    uf.created_at
FROM public.vgvina_user_facilities uf
JOIN public.vgvina_facilities f ON f.id = uf.facility_id
JOIN public.vgvina_users u ON u.id = uf.user_id
WHERE u.email ILIKE '%lytruong7271%'
ORDER BY uf.is_primary DESC, uf.created_at;

-- 3) Kiểm tra RLS có bật trên vgvina_user_facilities không
SELECT
    schemaname,
    tablename,
    rowsecurity AS rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('vgvina_user_facilities', 'vgvina_facilities', 'vgvina_users');

-- 4) Liệt kê policies hiện có trên vgvina_user_facilities
SELECT
    schemaname,
    tablename,
    policyname,
    cmd,
    qual AS using_expr,
    with_check
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('vgvina_user_facilities', 'vgvina_facilities', 'vgvina_users');

-- 5) Toàn bộ users không có is_primary nào (sẽ login bị "Chưa gán")
SELECT
    u.id,
    u.email,
    u.full_name,
    COUNT(uf.id) FILTER (WHERE uf.is_primary) AS primary_count,
    COUNT(uf.id) AS total_assigned
FROM public.vgvina_users u
LEFT JOIN public.vgvina_user_facilities uf ON uf.user_id = u.id
GROUP BY u.id, u.email, u.full_name
HAVING COUNT(uf.id) > 0 AND COUNT(uf.id) FILTER (WHERE uf.is_primary) = 0;
