-- 1. Thêm cột lưu thông tin kỳ hạn và gán Sale trực tiếp vào bảng đối tác
ALTER TABLE vgvina_partners ADD COLUMN IF NOT EXISTS payment_term TEXT;
ALTER TABLE vgvina_partners ADD COLUMN IF NOT EXISTS payment_due_days INTEGER DEFAULT 0;
ALTER TABLE vgvina_partners ADD COLUMN IF NOT EXISTS assigned_user_id BIGINT REFERENCES vgvina_users(id);

-- 2. Migrate dữ liệu phân bổ cũ từ bảng vgvina_partner_users sang cột assigned_user_id mới (nếu có)
UPDATE vgvina_partners p
SET assigned_user_id = (
    SELECT user_id 
    FROM vgvina_partner_users pu 
    WHERE pu.partner_id = p.id 
    LIMIT 1
)
WHERE p.assigned_user_id IS NULL;

-- 3. Tạo bảng lưu lịch sử chuyển giao khách hàng (Transfer History)
CREATE TABLE IF NOT EXISTS vgvina_partner_transfers (
    id BIGSERIAL PRIMARY KEY,
    partner_id UUID REFERENCES vgvina_partners(id) ON DELETE CASCADE,
    from_user_id BIGINT REFERENCES vgvina_users(id),
    to_user_id BIGINT REFERENCES vgvina_users(id),
    reason TEXT,
    created_by BIGINT REFERENCES vgvina_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
