-- ============================================
-- ADDITIONAL VOUCHER TABLES
-- ============================================
-- Tables for Internal Transfer, Return Voucher, and Scrapping Voucher
-- Generated: 2026-01-27

-- ============================================
-- INTERNAL TRANSFERS
-- ============================================

CREATE TABLE IF NOT EXISTS vgvina_internal_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    transfer_date TIMESTAMP WITH TIME ZONE NOT NULL,
    from_facility_id BIGINT REFERENCES vgvina_facilities(id) ON DELETE RESTRICT,
    to_facility_id BIGINT REFERENCES vgvina_facilities(id) ON DELETE RESTRICT,
    assigned_user_id BIGINT REFERENCES vgvina_users(id) ON DELETE SET NULL,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'COMPLETED', 'CANCELLED')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vgvina_internal_transfer_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transfer_id UUID REFERENCES vgvina_internal_transfers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES vgvina_products(id) ON DELETE RESTRICT,
    quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Internal Transfers
CREATE INDEX IF NOT EXISTS idx_internal_transfers_code ON vgvina_internal_transfers(code);
CREATE INDEX IF NOT EXISTS idx_internal_transfers_date ON vgvina_internal_transfers(transfer_date DESC);
CREATE INDEX IF NOT EXISTS idx_internal_transfers_from_facility ON vgvina_internal_transfers(from_facility_id);
CREATE INDEX IF NOT EXISTS idx_internal_transfers_to_facility ON vgvina_internal_transfers(to_facility_id);
CREATE INDEX IF NOT EXISTS idx_internal_transfer_items_transfer ON vgvina_internal_transfer_items(transfer_id);

-- ============================================
-- RETURN VOUCHERS
-- ============================================

CREATE TABLE IF NOT EXISTS vgvina_return_vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    return_date TIMESTAMP WITH TIME ZONE NOT NULL,
    related_order_id UUID, -- Can reference sales_orders or purchase_orders
    reason TEXT NOT NULL CHECK (reason IN ('DAMAGED', 'WRONG_ITEM', 'QUALITY_ISSUE', 'CUSTOMER_REQUEST', 'OTHER')),
    handling_method TEXT NOT NULL CHECK (handling_method IN ('REFUND', 'EXCHANGE', 'DEBT_DEDUCTION')),
    return_fee DECIMAL(15, 2) DEFAULT 0,
    discount DECIMAL(15, 2) DEFAULT 0,
    refund_account_id UUID REFERENCES vgvina_accounts(id) ON DELETE SET NULL,
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vgvina_return_voucher_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    return_id UUID REFERENCES vgvina_return_vouchers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES vgvina_products(id) ON DELETE RESTRICT,
    quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
    price DECIMAL(15, 2) NOT NULL CHECK (price >= 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Return Vouchers
CREATE INDEX IF NOT EXISTS idx_return_vouchers_code ON vgvina_return_vouchers(code);
CREATE INDEX IF NOT EXISTS idx_return_vouchers_date ON vgvina_return_vouchers(return_date DESC);
CREATE INDEX IF NOT EXISTS idx_return_vouchers_related_order ON vgvina_return_vouchers(related_order_id);
CREATE INDEX IF NOT EXISTS idx_return_voucher_items_return ON vgvina_return_voucher_items(return_id);

-- ============================================
-- SCRAPPING VOUCHERS
-- ============================================

CREATE TABLE IF NOT EXISTS vgvina_scrapping_vouchers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    scrapping_date TIMESTAMP WITH TIME ZONE NOT NULL,
    facility_id BIGINT REFERENCES vgvina_facilities(id) ON DELETE RESTRICT,
    assigned_user_id BIGINT REFERENCES vgvina_users(id) ON DELETE SET NULL,
    reason TEXT NOT NULL CHECK (reason IN ('DAMAGED', 'EXPIRED', 'QUALITY_ISSUE', 'OBSOLETE', 'OTHER')),
    notes TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'COMPLETED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS vgvina_scrapping_voucher_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    scrapping_id UUID REFERENCES vgvina_scrapping_vouchers(id) ON DELETE CASCADE,
    product_id UUID REFERENCES vgvina_products(id) ON DELETE RESTRICT,
    quantity DECIMAL(10, 2) NOT NULL CHECK (quantity > 0),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for Scrapping Vouchers
CREATE INDEX IF NOT EXISTS idx_scrapping_vouchers_code ON vgvina_scrapping_vouchers(code);
CREATE INDEX IF NOT EXISTS idx_scrapping_vouchers_date ON vgvina_scrapping_vouchers(scrapping_date DESC);
CREATE INDEX IF NOT EXISTS idx_scrapping_vouchers_facility ON vgvina_scrapping_vouchers(facility_id);
CREATE INDEX IF NOT EXISTS idx_scrapping_voucher_items_scrapping ON vgvina_scrapping_voucher_items(scrapping_id);

-- ============================================
-- AUDIT LOG TRIGGERS FOR NEW TABLES
-- ============================================

-- Internal Transfers
DROP TRIGGER IF EXISTS audit_internal_transfers_changes ON vgvina_internal_transfers;
CREATE TRIGGER audit_internal_transfers_changes
    AFTER INSERT OR UPDATE OR DELETE ON vgvina_internal_transfers
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

-- ============================================
-- NOTES
-- ============================================
-- 1. These tables support the 3 additional voucher types:
--    - Internal Transfer: Chuyển kho nội bộ
--    - Return Voucher: Phiếu trả hàng
--    - Scrapping Voucher: Phiếu hủy hàng
--
-- 2. All tables have audit log triggers enabled
--
-- 3. Status workflow:
--    - PENDING: Chờ duyệt
--    - APPROVED: Đã duyệt (for return/scrapping)
--    - COMPLETED: Đã hoàn thành
--    - REJECTED: Từ chối (for return/scrapping)
--    - CANCELLED: Hủy bỏ (for internal transfer)
--
-- 4. Return voucher can link to sales_orders or purchase_orders
--    via related_order_id (UUID type for flexibility)
