-- ============================================
-- AUDIT LOG TRIGGERS
-- ============================================
-- This script creates triggers to automatically log changes to important tables
-- Generated: 2026-01-27

-- Create a generic audit log function
CREATE OR REPLACE FUNCTION audit_log_changes()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id BIGINT;
    v_user_email TEXT;
BEGIN
    -- Get current authenticated user's email from Supabase Auth
    IF auth.uid() IS NOT NULL THEN
        SELECT email INTO v_user_email FROM auth.users WHERE id = auth.uid();
        
        -- Map to vgvina_users.id using email
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
$$ LANGUAGE plpgsql;

-- ============================================
-- CREATE TRIGGERS FOR IMPORTANT TABLES
-- ============================================

-- Partners (Customers/Suppliers)
DROP TRIGGER IF EXISTS audit_partners_changes ON vgvina_partners;
CREATE TRIGGER audit_partners_changes
    AFTER INSERT OR UPDATE OR DELETE ON vgvina_partners
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- Products
DROP TRIGGER IF EXISTS audit_products_changes ON vgvina_products;
CREATE TRIGGER audit_products_changes
    AFTER INSERT OR UPDATE OR DELETE ON vgvina_products
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- Sales Orders
DROP TRIGGER IF EXISTS audit_sales_orders_changes ON vgvina_sales_orders;
CREATE TRIGGER audit_sales_orders_changes
    AFTER INSERT OR UPDATE OR DELETE ON vgvina_sales_orders
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- Purchase Orders
DROP TRIGGER IF EXISTS audit_purchase_orders_changes ON vgvina_purchase_orders;
CREATE TRIGGER audit_purchase_orders_changes
    AFTER INSERT OR UPDATE OR DELETE ON vgvina_purchase_orders
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- Financial Transactions
DROP TRIGGER IF EXISTS audit_financial_transactions_changes ON vgvina_financial_transactions;
CREATE TRIGGER audit_financial_transactions_changes
    AFTER INSERT OR UPDATE OR DELETE ON vgvina_financial_transactions
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- Debt Transactions
DROP TRIGGER IF EXISTS audit_debt_transactions_changes ON vgvina_debt_transactions;
CREATE TRIGGER audit_debt_transactions_changes
    AFTER INSERT OR UPDATE OR DELETE ON vgvina_debt_transactions
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- Accounts
DROP TRIGGER IF EXISTS audit_accounts_changes ON vgvina_accounts;
CREATE TRIGGER audit_accounts_changes
    AFTER INSERT OR UPDATE OR DELETE ON vgvina_accounts
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- Users (sensitive - log all changes)
DROP TRIGGER IF EXISTS audit_users_changes ON vgvina_users;
CREATE TRIGGER audit_users_changes
    AFTER INSERT OR UPDATE OR DELETE ON vgvina_users
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- Return Vouchers
DROP TRIGGER IF EXISTS audit_return_vouchers_changes ON vgvina_return_vouchers;
CREATE TRIGGER audit_return_vouchers_changes
    AFTER INSERT OR UPDATE OR DELETE ON vgvina_return_vouchers
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- Scrapping Vouchers
DROP TRIGGER IF EXISTS audit_scrapping_vouchers_changes ON vgvina_scrapping_vouchers;
CREATE TRIGGER audit_scrapping_vouchers_changes
    AFTER INSERT OR UPDATE OR DELETE ON vgvina_scrapping_vouchers
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- Internal Transfers
DROP TRIGGER IF EXISTS audit_internal_transfers_changes ON vgvina_internal_transfers;
CREATE TRIGGER audit_internal_transfers_changes
    AFTER INSERT OR UPDATE OR DELETE ON vgvina_internal_transfers
    FOR EACH ROW EXECUTE FUNCTION audit_log_changes();

-- ============================================
-- NOTES
-- ============================================
-- 1. The triggers will automatically log all INSERT, UPDATE, DELETE operations
-- 2. user_id is currently NULL - you can enhance this by:
--    - Using Supabase auth.uid() if using RLS
--    - Passing user_id from application layer
--    - Using session variables
-- 3. To disable a trigger temporarily:
--    ALTER TABLE table_name DISABLE TRIGGER trigger_name;
-- 4. To enable it again:
--    ALTER TABLE table_name ENABLE TRIGGER trigger_name;
