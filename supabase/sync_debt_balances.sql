-- Script: Đồng bộ số dư Công nợ cũ vào TK KN (Phải thu) và TK Nợ NCC (Phải trả)
-- Mục đích: Khởi tạo số dư đầu kỳ cho 2 tài khoản Sổ Quỹ dựa trên tổng dư nợ hiện tại.
-- Lưu ý: Chỉ chạy 1 lần.

DO $$
DECLARE
    v_total_receivable NUMERIC;
    v_total_payable NUMERIC;
    v_tk_kn_id UUID;
    v_tk_ncc_id UUID;
BEGIN
    -- 1. Lấy tổng Nợ phải thu (TK KN)
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_receivable
    FROM vgvina_debt_transactions 
    WHERE type = 'RECEIVABLE' AND status IN ('UNPAID', 'PARTIALLY_PAID');

    -- 2. Lấy tổng Nợ phải trả (TK Nợ NCC)
    -- Nợ phải trả mang ý nghĩa số dư Âm trong Sổ Quỹ hoặc là 1 tài khoản nguồn vốn.
    -- Ở đây ta cứ gán giá trị Dương (hoặc tuân theo logic hiển thị trên web của anh). 
    -- Logic hiện tại: INCOME (+) tăng nợ, EXPENSE (-) giảm nợ -> nợ mang số dương.
    SELECT COALESCE(SUM(amount), 0)
    INTO v_total_payable
    FROM vgvina_debt_transactions 
    WHERE type = 'PAYABLE' AND status IN ('UNPAID', 'PARTIALLY_PAID');

    -- 3. Lấy ID của 2 tài khoản
    SELECT id INTO v_tk_kn_id FROM vgvina_accounts WHERE name = 'TK KN' LIMIT 1;
    SELECT id INTO v_tk_ncc_id FROM vgvina_accounts WHERE name = 'TK Nợ NCC' LIMIT 1;

    -- 4. Update số dư
    IF v_tk_kn_id IS NOT NULL THEN
        UPDATE vgvina_accounts 
        SET balance = v_total_receivable
        WHERE id = v_tk_kn_id;
        
        RAISE NOTICE 'Đã cập nhật TK KN. Trị giá: %', v_total_receivable;
    ELSE
        RAISE NOTICE 'Không tìm thấy tài khoản CÓ TÊN "TK KN"';
    END IF;

    IF v_tk_ncc_id IS NOT NULL THEN
        UPDATE vgvina_accounts 
        SET balance = v_total_payable
        WHERE id = v_tk_ncc_id;
        
        RAISE NOTICE 'Đã cập nhật TK Nợ NCC. Trị giá: %', v_total_payable;
    ELSE
        RAISE NOTICE 'Không tìm thấy tài khoản CÓ TÊN "TK Nợ NCC"';
    END IF;

END $$;
