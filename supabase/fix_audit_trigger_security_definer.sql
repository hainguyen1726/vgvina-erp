-- =============================================================================
-- FIX: audit_log_changes() thiếu SECURITY DEFINER
-- =============================================================================
-- Nguyên nhân: Hàm trigger audit_log_changes() không có SECURITY DEFINER.
-- Khi user đã đăng nhập thực thi UPDATE, PostgreSQL chạy trigger với quyền
-- của role `authenticated`. Role này KHÔNG có quyền đọc auth.users.
-- Lệnh `SELECT email FROM auth.users WHERE id = auth.uid()` sẽ throw:
--   "ERROR: permission denied for schema auth"
-- Vì trigger chạy trong cùng transaction, toàn bộ UPDATE sẽ bị ROLLBACK.
-- UI hiển thị: "Không thể cập nhật vai trò".
--
-- Fix: Rewrite function với SECURITY DEFINER + SET search_path = public, auth, extensions
--      để function luôn chạy với quyền của owner (thường là postgres), có full access auth.users.
-- =============================================================================

CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id BIGINT;
    v_user_email TEXT;
BEGIN
    -- Get current authenticated user's email from Supabase Auth
    -- SECURITY DEFINER allows us to access auth.users safely
    IF auth.uid() IS NOT NULL THEN
        SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
        
        IF v_user_email IS NOT NULL THEN
            SELECT id INTO v_user_id FROM public.vgvina_users WHERE email = v_user_email LIMIT 1;
        END IF;
    END IF;

    -- For DELETE operations
    IF (TG_OP = 'DELETE') THEN
        INSERT INTO vgvina_audit_logs (
            table_name,
            record_id,
            action,
            old_values,
            new_values,
            user_id
        ) VALUES (
            TG_TABLE_NAME,
            OLD.id::TEXT,
            'DELETE',
            row_to_json(OLD),
            NULL,
            v_user_id
        );
        RETURN OLD;
    
    -- For UPDATE operations
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO vgvina_audit_logs (
            table_name,
            record_id,
            action,
            old_values,
            new_values,
            user_id
        ) VALUES (
            TG_TABLE_NAME,
            NEW.id::TEXT,
            'UPDATE',
            row_to_json(OLD),
            row_to_json(NEW),
            v_user_id
        );
        RETURN NEW;
    
    -- For INSERT operations
    ELSIF (TG_OP = 'INSERT') THEN
        INSERT INTO vgvina_audit_logs (
            table_name,
            record_id,
            action,
            old_values,
            new_values,
            user_id
        ) VALUES (
            TG_TABLE_NAME,
            NEW.id::TEXT,
            'CREATE',
            NULL,
            row_to_json(NEW),
            v_user_id
        );
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, extensions;
