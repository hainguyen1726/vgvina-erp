-- =============================================================================
-- FIX: Lỗi khi xóa thành viên (Tạo RPC function public.admin_delete_user)
-- =============================================================================
-- Hàm RPC admin_delete_user cho phép Admin xóa thành viên hoàn toàn khỏi hệ thống
-- (Bao gồm cả auth.users, vgvina_users và tự động gỡ liên kết dữ liệu cũ tránh lỗi Foreign Key).
-- =============================================================================

DROP FUNCTION IF EXISTS public.admin_delete_user(bigint);

CREATE OR REPLACE FUNCTION public.admin_delete_user(
    target_user_id bigint
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'auth', 'extensions'
AS $function$
DECLARE
  current_executor_email TEXT;
  target_email TEXT;
  v_is_admin BOOLEAN;
BEGIN
  -- 1. Kiểm tra quyền Admin của người thực thi (Executor)
  SELECT u.email INTO current_executor_email
  FROM auth.users u WHERE u.id = auth.uid();

  -- Kiểm tra quyền admin qua cột legacy `role` hoặc RBAC `role_id -> vgvina_roles.is_admin`
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

  -- Nếu có executor email và không phải admin -> từ chối
  IF current_executor_email IS NOT NULL AND NOT v_is_admin THEN
    RAISE EXCEPTION 'Access denied. Executor % is not an admin.', current_executor_email;
  END IF;

  -- 2. Lấy email của thành viên cần xóa
  SELECT email INTO target_email
  FROM public.vgvina_users
  WHERE id = target_user_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Thành viên ID % không tồn tại.', target_user_id;
  END IF;

  -- 3. Gỡ liên kết / Nullify các tham chiếu Foreign Key để tránh vi phạm rào cản dữ liệu
  UPDATE public.vgvina_sales_orders SET assigned_user_id = NULL WHERE assigned_user_id = target_user_id;
  UPDATE public.vgvina_purchase_orders SET assigned_user_id = NULL WHERE assigned_user_id = target_user_id;
  
  -- Kiểm tra bảng giao dịch tài chính
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vgvina_financial_transactions' AND column_name = 'employee_id') THEN
    UPDATE public.vgvina_financial_transactions SET employee_id = NULL WHERE employee_id = target_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vgvina_financial_transactions' AND column_name = 'assigned_user_id') THEN
    UPDATE public.vgvina_financial_transactions SET assigned_user_id = NULL WHERE assigned_user_id = target_user_id;
  END IF;

  -- Kiểm tra các bảng giao dịch công nợ, đối tác, kho
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vgvina_debt_transactions' AND column_name = 'assigned_user_id') THEN
    UPDATE public.vgvina_debt_transactions SET assigned_user_id = NULL WHERE assigned_user_id = target_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vgvina_partners' AND column_name = 'assigned_user_id') THEN
    UPDATE public.vgvina_partners SET assigned_user_id = NULL WHERE assigned_user_id = target_user_id;
  END IF;

  -- Xóa dữ liệu phân quyền chi nhánh (vgvina_user_facilities)
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vgvina_user_facilities') THEN
    DELETE FROM public.vgvina_user_facilities WHERE user_id = target_user_id;
  END IF;

  -- 4. Xóa tài khoản đăng nhập trong auth.users (nếu có email)
  IF target_email IS NOT NULL AND target_email <> '' THEN
    DELETE FROM auth.users WHERE email = target_email;
  END IF;

  -- 5. Xóa nhân viên trong vgvina_users
  DELETE FROM public.vgvina_users WHERE id = target_user_id;
END;
$function$;

-- Phân quyền thực thi
GRANT EXECUTE ON FUNCTION public.admin_delete_user(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(bigint) TO service_role;
