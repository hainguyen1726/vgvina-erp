-- 1. Đảm bảo extension UUID đã bật
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Đảm bảo bảng vgvina_accounts tồn tại
CREATE TABLE IF NOT EXISTS vgvina_accounts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT, -- 'CASH', 'BANK'
    balance NUMERIC(15, 2) DEFAULT 0,
    facility_id UUID,
    details TEXT
);

-- 3. Đảm bảo bảng vgvina_financial_transactions tồn tại
-- Lưu ý: Nếu bảng đã tồn tại, lệnh này sẽ bị bỏ qua.
CREATE TABLE IF NOT EXISTS vgvina_financial_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('INCOME', 'EXPENSE', 'INTERNAL_TRANSFER')),
    transaction_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    amount NUMERIC(15, 2) NOT NULL,
    category_id UUID,
    description TEXT,
    partner_id UUID, 
    facility_id UUID,
    account_id UUID, 
    employee_id BIGINT, 
    related_order_id UUID, 
    related_order_type TEXT, 
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Thêm Foreign Key an toàn (Kiểm tra xem đã có chưa trước khi thêm)
DO $$
BEGIN
    -- Kiểm tra và thêm khóa ngoại cho account_id nếu chưa có
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_financial_transactions_accounts'
    ) THEN
        ALTER TABLE vgvina_financial_transactions
        ADD CONSTRAINT fk_financial_transactions_accounts
        FOREIGN KEY (account_id) REFERENCES vgvina_accounts(id);
    END IF;
END $$;
