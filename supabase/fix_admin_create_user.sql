-- =============================================================================
-- FIX: "Access denied. Executor X is not an admin." khi tạo user
-- =============================================================================
-- Nguyên nhân: function admin_create_user check qua cột `vgvina_users.role`
-- (TEXT, legacy) thay vì qua role_id → vgvina_roles.is_admin (RBAC mới).
-- Khi set quyền admin qua UI thường chỉ set role_id, không set cột `role`.
--
-- Fix gồm 2 phần:
--   PART 1: Cập nhật ngay cột `role` cho các user hiện đang là admin theo RBAC.
--   PART 2: Rewrite function admin_create_user để check qua CẢ HAI cách
--           (role text legacy HOẶC role_id → vgvina_roles.is_admin), bỏ luôn
--           hardcoded exception cho hahoan@gmail.com.
-- =============================================================================

-- =============================================================================
-- PART 1: Đồng bộ cột `role` (TEXT) cho user trang.vgvina@gmail.com
-- =============================================================================
UPDATE public.vgvina_users
SET role = 'admin'
WHERE email = 'trang.vgvina@gmail.com';

-- (tuỳ chọn) Đồng bộ cho TẤT CẢ user đang có role_id trỏ vào role is_admin=TRUE
UPDATE public.vgvina_users u
SET role = 'admin'
FROM public.vgvina_roles r
WHERE u.role_id = r.id
  AND r.is_admin = TRUE
  AND (u.role IS NULL OR LOWER(u.role) NOT IN ('admin', 'quản trị viên'));

-- =============================================================================
-- PART 2: Rewrite function admin_create_user
-- =============================================================================
CREATE OR REPLACE FUNCTION public.admin_create_user(
    email text,
    password text,
    user_id bigint,
    full_name text DEFAULT ''::text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'extensions'
AS $function$
DECLARE
  new_auth_id UUID := gen_random_uuid();
  current_executor_email TEXT;
  proj_instance_id UUID;
  v_is_admin BOOLEAN;
BEGIN
  -- 1. Security check: lấy email + instance của executor
  SELECT u.email, u.instance_id
  INTO current_executor_email, proj_instance_id
  FROM auth.users u WHERE u.id = auth.uid();

  -- Check admin qua CẢ legacy `role` TEXT lẫn RBAC role_id → vgvina_roles.is_admin
  SELECT EXISTS (
    SELECT 1
    FROM public.vgvina_users vu
    LEFT JOIN public.vgvina_roles r ON r.id = vu.role_id
    WHERE vu.email = current_executor_email
      AND (
        LOWER(COALESCE(vu.role, '')) IN ('admin', 'quản trị viên')
        OR r.is_admin = TRUE
      )
  ) INTO v_is_admin;

  IF NOT v_is_admin THEN
    RAISE EXCEPTION 'Access denied. Executor % is not an admin.', current_executor_email;
  END IF;

  -- 2. Đảm bảo proj_instance_id có giá trị
  IF proj_instance_id IS NULL THEN
     SELECT instance_id INTO proj_instance_id FROM auth.users LIMIT 1;
  END IF;

  -- 3. Bỏ qua nếu auth user đã tồn tại
  IF EXISTS (SELECT 1 FROM auth.users WHERE auth.users.email = admin_create_user.email) THEN
    RETURN;
  END IF;

  -- 4. Tạo auth.users
  INSERT INTO auth.users (
    instance_id, id, aud, role, email, encrypted_password,
    email_confirmed_at, invited_at, confirmation_token, confirmation_sent_at,
    recovery_token, recovery_sent_at, email_change_token_new, email_change,
    raw_app_meta_data, raw_user_meta_data, is_super_admin,
    created_at, updated_at, last_sign_in_at
  )
  VALUES (
    proj_instance_id, new_auth_id, 'authenticated', 'authenticated',
    admin_create_user.email, crypt(admin_create_user.password, gen_salt('bf')),
    now(), now(), '', now(), '', now(), '', '',
    jsonb_build_object('provider', 'email', 'providers', array['email']),
    jsonb_build_object('full_name', COALESCE(admin_create_user.full_name, ''), 'user_id', admin_create_user.user_id),
    false, now(), now(), now()
  );

  -- 5. Tạo auth.identities
  INSERT INTO auth.identities (
    id, user_id, identity_data, provider, provider_id,
    last_sign_in_at, created_at, updated_at
  )
  VALUES (
    new_auth_id, new_auth_id,
    jsonb_build_object('sub', new_auth_id, 'email', admin_create_user.email),
    'email', admin_create_user.email,
    now(), now(), now()
  );
END;
$function$;

-- =============================================================================
-- (tuỳ chọn) Dọn dẹp 2 phiên bản function trùng tên không dùng đến
-- =============================================================================
-- Phiên bản 3-arg bigint cũ (không có full_name)
DROP FUNCTION IF EXISTS public.admin_create_user(text, text, bigint);
-- Phiên bản 3-arg uuid placeholder (luôn raise exception)
DROP FUNCTION IF EXISTS public.admin_create_user(text, text, uuid);

-- =============================================================================
-- VERIFY
-- =============================================================================
-- Sau khi chạy, kiểm tra:
SELECT u.email, u.role, r.name AS role_name, r.is_admin
FROM public.vgvina_users u
LEFT JOIN public.vgvina_roles r ON r.id = u.role_id
WHERE u.email = 'trang.vgvina@gmail.com';
-- Kỳ vọng: role = 'admin' (legacy column đã đồng bộ)
