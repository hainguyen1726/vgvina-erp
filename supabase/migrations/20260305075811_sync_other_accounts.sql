-- Script: Đồng bộ số dư cho các tài khoản Tiền mặt / Ngân hàng (Loại trừ TK KN và TK Nợ NCC)
-- Mục đích: Tính toán lại số dư thực tế dựa trên tổng Thu / Chi trong lịch sử giao dịch.
-- Lưu ý: Chỉ chạy 1 lần.

DO $$
DECLARE
    acc RECORD;
    v_total_income NUMERIC;
    v_total_expense NUMERIC;
    v_new_balance NUMERIC;
BEGIN
    -- Lặp qua tất cả các tài khoản trừ TK KN và TK Nợ NCC
    FOR acc IN SELECT id, name FROM vgvina_accounts WHERE name NOT IN ('TK KN', 'TK Nợ NCC')
    LOOP
        -- Tính tổng Thu (INCOME)
        SELECT COALESCE(SUM(amount), 0) INTO v_total_income
        FROM vgvina_financial_transactions
        WHERE account_id = acc.id AND type = 'INCOME';

        -- Tính tổng Chi (EXPENSE)
        SELECT COALESCE(SUM(amount), 0) INTO v_total_expense
        FROM vgvina_financial_transactions
        WHERE account_id = acc.id AND type = 'EXPENSE';

        -- Số dư mới = Thu - Chi
        v_new_balance := v_total_income - v_total_expense;

        -- Cập nhật vào bảng accounts
        UPDATE vgvina_accounts
        SET balance = v_new_balance
        WHERE id = acc.id;

        RAISE NOTICE 'Đã cập nhật tài khoản %: % (Thu: %, Chi: %)', acc.name, v_new_balance, v_total_income, v_total_expense;
    END LOOP;
END $$;
