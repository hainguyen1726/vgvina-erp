-- SQL Script to backfill user_id for existing audit logs where user_id is NULL
-- We infer the user from fields like 'assigned_user_id' or 'employee_id' stored in new_values/old_values.

-- 1. Sales Orders
UPDATE vgvina_audit_logs
SET user_id = COALESCE(
    (new_values->>'assigned_user_id')::BIGINT,
    (old_values->>'assigned_user_id')::BIGINT
)
WHERE table_name = 'vgvina_sales_orders' 
  AND user_id IS NULL 
  AND (new_values->>'assigned_user_id' IS NOT NULL OR old_values->>'assigned_user_id' IS NOT NULL);

-- 2. Purchase Orders
UPDATE vgvina_audit_logs
SET user_id = COALESCE(
    (new_values->>'assigned_user_id')::BIGINT,
    (old_values->>'assigned_user_id')::BIGINT
)
WHERE table_name = 'vgvina_purchase_orders' 
  AND user_id IS NULL 
  AND (new_values->>'assigned_user_id' IS NOT NULL OR old_values->>'assigned_user_id' IS NOT NULL);

-- 3. Partners (Customers / Suppliers)
UPDATE vgvina_audit_logs
SET user_id = COALESCE(
    (new_values->>'assigned_user_id')::BIGINT,
    (old_values->>'assigned_user_id')::BIGINT
)
WHERE table_name = 'vgvina_partners' 
  AND user_id IS NULL 
  AND (new_values->>'assigned_user_id' IS NOT NULL OR old_values->>'assigned_user_id' IS NOT NULL);

-- 4. Debt Transactions
UPDATE vgvina_audit_logs
SET user_id = COALESCE(
    (new_values->>'assigned_user_id')::BIGINT,
    (old_values->>'assigned_user_id')::BIGINT
)
WHERE table_name = 'vgvina_debt_transactions' 
  AND user_id IS NULL 
  AND (new_values->>'assigned_user_id' IS NOT NULL OR old_values->>'assigned_user_id' IS NOT NULL);

-- 5. Financial Transactions (Thu / Chi)
UPDATE vgvina_audit_logs
SET user_id = COALESCE(
    (new_values->>'employee_id')::BIGINT,
    (old_values->>'employee_id')::BIGINT
)
WHERE table_name = 'vgvina_financial_transactions' 
  AND user_id IS NULL 
  AND (new_values->>'employee_id' IS NOT NULL OR old_values->>'employee_id' IS NOT NULL);
