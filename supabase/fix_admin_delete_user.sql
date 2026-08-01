-- =============================================================================
-- FIX: Lỗi khi xóa thành viên (RPC function public.admin_delete_user)
-- =============================================================================
-- Gỡ bỏ sạch sẽ tất cả ràng buộc Khóa ngoại (Foreign Key) trên các bảng 
-- (bao gồm vgvina_audit_logs, vgvina_sales_orders, vgvina_purchase_orders,
-- vgvina_financial_transactions, vgvina_debt_transactions, vgvina_partners,
-- vgvina_partner_transfers, vgvina_internal_transfers, vgvina_scrapping_vouchers...)
-- trước khi thực hiện xóa thành viên trong vgvina_users và auth.users.
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

  -- 3. Gỡ bỏ Foreign Key references trong public schema
  UPDATE public.vgvina_audit_logs SET user_id = NULL WHERE user_id = target_user_id;
  UPDATE public.vgvina_sales_orders SET assigned_user_id = NULL WHERE assigned_user_id = target_user_id;
  UPDATE public.vgvina_purchase_orders SET assigned_user_id = NULL WHERE assigned_user_id = target_user_id;
  UPDATE public.vgvina_internal_transfers SET assigned_user_id = NULL WHERE assigned_user_id = target_user_id;
  UPDATE public.vgvina_scrapping_vouchers SET assigned_user_id = NULL WHERE assigned_user_id = target_user_id;
  UPDATE public.vgvina_financial_transactions SET employee_id = NULL WHERE employee_id = target_user_id;
  UPDATE public.vgvina_debt_transactions SET assigned_user_id = NULL WHERE assigned_user_id = target_user_id;
  UPDATE public.vgvina_partners SET assigned_user_id = NULL WHERE assigned_user_id = target_user_id;
  
  -- Partner transfers
  UPDATE public.vgvina_partner_transfers SET from_user_id = NULL WHERE from_user_id = target_user_id;
  UPDATE public.vgvina_partner_transfers SET to_user_id = NULL WHERE to_user_id = target_user_id;
  UPDATE public.vgvina_partner_transfers SET created_by = NULL WHERE created_by = target_user_id;

  -- Delete junction table records
  DELETE FROM public.vgvina_user_facilities WHERE user_id = target_user_id;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vgvina_partner_users') THEN
    DELETE FROM public.vgvina_partner_users WHERE user_id = target_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vgvina_transaction_assignees') THEN
    DELETE FROM public.vgvina_transaction_assignees WHERE employee_id = target_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vgvina_sales_order_assignees') THEN
    DELETE FROM public.vgvina_sales_order_assignees WHERE employee_id = target_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vgvina_purchase_order_assignees') THEN
    DELETE FROM public.vgvina_purchase_order_assignees WHERE employee_id = target_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vgvina_internal_transfer_assignees') THEN
    DELETE FROM public.vgvina_internal_transfer_assignees WHERE employee_id = target_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vgvina_scrapping_assignees') THEN
    DELETE FROM public.vgvina_scrapping_assignees WHERE employee_id = target_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vgvina_return_assignees') THEN
    DELETE FROM public.vgvina_return_assignees WHERE employee_id = target_user_id;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vgvina_debt_assignees') THEN
    DELETE FROM public.vgvina_debt_assignees WHERE employee_id = target_user_id;
  END IF;

  -- 4. Gỡ bỏ Foreign Key references trong hkd schema (nếu tồn tại)
  IF EXISTS (SELECT 1 FROM information_schema.schemata WHERE schema_name = 'hkd') THEN
    UPDATE hkd.vgvina_audit_logs SET user_id = NULL WHERE user_id = target_user_id;
    UPDATE hkd.vgvina_sales_orders SET assigned_user_id = NULL WHERE assigned_user_id = target_user_id;
    UPDATE hkd.vgvina_purchase_orders SET assigned_user_id = NULL WHERE assigned_user_id = target_user_id;
    UPDATE hkd.vgvina_internal_transfers SET assigned_user_id = NULL WHERE assigned_user_id = target_user_id;
    UPDATE hkd.vgvina_scrapping_vouchers SET assigned_user_id = NULL WHERE assigned_user_id = target_user_id;
    UPDATE hkd.vgvina_financial_transactions SET employee_id = NULL WHERE employee_id = target_user_id;
    UPDATE hkd.vgvina_debt_transactions SET assigned_user_id = NULL WHERE assigned_user_id = target_user_id;
    UPDATE hkd.vgvina_partners SET assigned_user_id = NULL WHERE assigned_user_id = target_user_id;

    UPDATE hkd.vgvina_partner_transfers SET from_user_id = NULL WHERE from_user_id = target_user_id;
    UPDATE hkd.vgvina_partner_transfers SET to_user_id = NULL WHERE to_user_id = target_user_id;
    UPDATE hkd.vgvina_partner_transfers SET created_by = NULL WHERE created_by = target_user_id;

    DELETE FROM hkd.vgvina_user_facilities WHERE user_id = target_user_id;
    DELETE FROM hkd.vgvina_partner_users WHERE user_id = target_user_id;
    DELETE FROM hkd.vgvina_transaction_assignees WHERE employee_id = target_user_id;
    DELETE FROM hkd.vgvina_sales_order_assignees WHERE employee_id = target_user_id;
    DELETE FROM hkd.vgvina_purchase_order_assignees WHERE employee_id = target_user_id;
    DELETE FROM hkd.vgvina_internal_transfer_assignees WHERE employee_id = target_user_id;
    DELETE FROM hkd.vgvina_scrapping_assignees WHERE employee_id = target_user_id;
    DELETE FROM hkd.vgvina_return_assignees WHERE employee_id = target_user_id;
    DELETE FROM hkd.vgvina_debt_assignees WHERE employee_id = target_user_id;
  END IF;

  -- 5. Xóa tài khoản đăng nhập trong auth.users (nếu có email)
  IF target_email IS NOT NULL AND target_email <> '' THEN
    DELETE FROM auth.users WHERE email = target_email;
  END IF;

  -- 6. Xóa nhân viên trong vgvina_users
  DELETE FROM public.vgvina_users WHERE id = target_user_id;
END;
$function$;

-- Phân quyền thực thi
GRANT EXECUTE ON FUNCTION public.admin_delete_user(bigint) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(bigint) TO service_role;
