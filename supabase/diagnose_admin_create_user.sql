-- =============================================================================
-- DIAGNOSE: "Executor trang.vgvina@gmail.com is not an admin"
-- =============================================================================

-- 1) Xem auth.users có user nào với email trang.vgvina@gmail.com không
SELECT id AS auth_user_id, email, created_at
FROM auth.users
WHERE email = 'trang.vgvina@gmail.com';

-- 2) Xem record trong vgvina_users + role hiện tại
SELECT
    u.id            AS vgvina_user_id,
    u.email,
    u.username,
    u.role_id,
    r.name          AS role_name,
    r.is_admin      AS role_is_admin,
    u.status
FROM vgvina_users u
LEFT JOIN vgvina_roles r ON r.id = u.role_id
WHERE u.email = 'trang.vgvina@gmail.com';

-- 3) Liệt kê cột bảng vgvina_users để xem có cột UUID nào nối với auth.users không
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'vgvina_users'
ORDER BY ordinal_position;

-- 4) Xem source của function admin_create_user — biết check admin theo cột nào
SELECT pg_get_functiondef(p.oid) AS function_source
FROM pg_proc p
JOIN pg_namespace n ON n.oid = p.pronamespace
WHERE n.nspname = 'public' AND p.proname = 'admin_create_user';
