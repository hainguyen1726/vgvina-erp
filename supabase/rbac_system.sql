-- ============================================
-- RBAC (Role-Based Access Control) SYSTEM
-- ============================================
-- Multi-facility support with granular permissions
-- Generated: 2026-01-27

-- ============================================
-- 1. ROLES TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS vgvina_roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    is_admin BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default roles
INSERT INTO vgvina_roles (name, display_name, description, is_admin) VALUES
    ('admin', 'Quản trị viên', 'Có mọi quyền truy cập', TRUE),
    ('giamdoc', 'Giám đốc', 'Quản lý toàn bộ hoạt động của khu vực', FALSE),
    ('ketoan', 'Kế toán', 'Quản lý tài chính và báo cáo', FALSE),
    ('nhanvien', 'Nhân viên', 'Thực hiện các nghiệp vụ cơ bản', FALSE)
ON CONFLICT (name) DO NOTHING;

-- ============================================
-- 2. PERMISSIONS TABLE
-- ============================================

CREATE TABLE IF NOT EXISTS vgvina_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    module TEXT NOT NULL,
    action TEXT NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(module, action)
);

-- Insert default permissions
INSERT INTO vgvina_permissions (module, action, display_name, description) VALUES
    -- Partners
    ('partners', 'view', 'Xem đối tác', 'Xem danh sách khách hàng và nhà cung cấp'),
    ('partners', 'create', 'Tạo đối tác', 'Thêm khách hàng/nhà cung cấp mới'),
    ('partners', 'edit', 'Sửa đối tác', 'Chỉnh sửa thông tin đối tác'),
    ('partners', 'delete', 'Xóa đối tác', 'Xóa đối tác khỏi hệ thống'),
    
    -- Products
    ('products', 'view', 'Xem sản phẩm', 'Xem danh sách sản phẩm'),
    ('products', 'create', 'Tạo sản phẩm', 'Thêm sản phẩm mới'),
    ('products', 'edit', 'Sửa sản phẩm', 'Chỉnh sửa thông tin sản phẩm'),
    ('products', 'delete', 'Xóa sản phẩm', 'Xóa sản phẩm khỏi hệ thống'),
    
    -- Sales Orders
    ('sales_orders', 'view', 'Xem đơn bán', 'Xem danh sách đơn bán hàng'),
    ('sales_orders', 'create', 'Tạo đơn bán', 'Tạo đơn bán hàng mới'),
    ('sales_orders', 'edit', 'Sửa đơn bán', 'Chỉnh sửa đơn bán hàng'),
    ('sales_orders', 'delete', 'Xóa đơn bán', 'Xóa đơn bán hàng'),
    
    -- Purchase Orders
    ('purchase_orders', 'view', 'Xem đơn mua', 'Xem danh sách đơn mua hàng'),
    ('purchase_orders', 'create', 'Tạo đơn mua', 'Tạo đơn mua hàng mới'),
    ('purchase_orders', 'edit', 'Sửa đơn mua', 'Chỉnh sửa đơn mua hàng'),
    ('purchase_orders', 'delete', 'Xóa đơn mua', 'Xóa đơn mua hàng'),
    
    -- Financial Transactions
    ('financial_transactions', 'view', 'Xem thu/chi', 'Xem danh sách giao dịch thu/chi'),
    ('financial_transactions', 'create', 'Tạo thu/chi', 'Tạo giao dịch thu/chi mới'),
    ('financial_transactions', 'edit', 'Sửa thu/chi', 'Chỉnh sửa giao dịch thu/chi'),
    ('financial_transactions', 'delete', 'Xóa thu/chi', 'Xóa giao dịch thu/chi'),
    
    -- Debt
    ('debt', 'view', 'Xem công nợ', 'Xem danh sách công nợ'),
    ('debt', 'create', 'Tạo công nợ', 'Tạo bản ghi công nợ mới'),
    ('debt', 'edit', 'Sửa công nợ', 'Chỉnh sửa công nợ'),
    ('debt', 'delete', 'Xóa công nợ', 'Xóa bản ghi công nợ'),
    
    -- Inventory
    ('inventory', 'view', 'Xem kho', 'Xem tồn kho và lịch sử xuất nhập'),
    ('inventory', 'create', 'Nhập/Xuất kho', 'Thực hiện nhập/xuất kho'),
    ('inventory', 'edit', 'Sửa kho', 'Chỉnh sửa thông tin kho'),
    ('inventory', 'delete', 'Xóa kho', 'Xóa phiếu xuất/nhập kho'),
    
    -- Reports
    ('reports', 'view', 'Xem báo cáo', 'Xem các báo cáo thống kê'),
    ('reports', 'export', 'Xuất báo cáo', 'Xuất báo cáo ra Excel/PDF'),
    
    -- Admin
    ('admin', 'view', 'Xem quản trị', 'Truy cập trang quản trị'),
    ('admin', 'create', 'Tạo quản trị', 'Tạo người dùng, role mới'),
    ('admin', 'edit', 'Sửa quản trị', 'Chỉnh sửa người dùng, role'),
    ('admin', 'delete', 'Xóa quản trị', 'Xóa người dùng, role')
ON CONFLICT (module, action) DO NOTHING;

-- ============================================
-- 3. ROLE PERMISSIONS (Many-to-Many)
-- ============================================

CREATE TABLE IF NOT EXISTS vgvina_role_permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    role_id UUID REFERENCES vgvina_roles(id) ON DELETE CASCADE,
    permission_id UUID REFERENCES vgvina_permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(role_id, permission_id)
);

CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON vgvina_role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission ON vgvina_role_permissions(permission_id);

-- Assign all permissions to admin role (optional, since is_admin=TRUE bypasses checks)
-- Assign permissions to default roles
DO $$
DECLARE
    v_giamdoc_role_id UUID;
    v_ketoan_role_id UUID;
    v_nhanvien_role_id UUID;
BEGIN
    -- Get role IDs
    SELECT id INTO v_giamdoc_role_id FROM vgvina_roles WHERE name = 'giamdoc';
    SELECT id INTO v_ketoan_role_id FROM vgvina_roles WHERE name = 'ketoan';
    SELECT id INTO v_nhanvien_role_id FROM vgvina_roles WHERE name = 'nhanvien';
    
    -- Giám đốc: All permissions except admin
    INSERT INTO vgvina_role_permissions (role_id, permission_id)
    SELECT v_giamdoc_role_id, id FROM vgvina_permissions WHERE module != 'admin'
    ON CONFLICT DO NOTHING;
    
    -- Kế toán: Financial, Debt, Reports
    INSERT INTO vgvina_role_permissions (role_id, permission_id)
    SELECT v_ketoan_role_id, id FROM vgvina_permissions 
    WHERE module IN ('financial_transactions', 'debt', 'reports', 'partners')
    ON CONFLICT DO NOTHING;
    
    -- Nhân viên: View most, Create/Edit limited
    INSERT INTO vgvina_role_permissions (role_id, permission_id)
    SELECT v_nhanvien_role_id, id FROM vgvina_permissions 
    WHERE action = 'view' OR (module IN ('sales_orders', 'purchase_orders') AND action IN ('create', 'edit'))
    ON CONFLICT DO NOTHING;
END $$;

-- ============================================
-- 4. USER FACILITIES (Many-to-Many)
-- ============================================

CREATE TABLE IF NOT EXISTS vgvina_user_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id BIGINT REFERENCES vgvina_users(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES vgvina_facilities(id) ON DELETE CASCADE,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, facility_id)
);

CREATE INDEX IF NOT EXISTS idx_user_facilities_user ON vgvina_user_facilities(user_id);
CREATE INDEX IF NOT EXISTS idx_user_facilities_facility ON vgvina_user_facilities(facility_id);

-- ============================================
-- 5. PARTNER FACILITIES (Many-to-Many)
-- ============================================

CREATE TABLE IF NOT EXISTS vgvina_partner_facilities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    partner_id UUID REFERENCES vgvina_partners(id) ON DELETE CASCADE,
    facility_id UUID REFERENCES vgvina_facilities(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(partner_id, facility_id)
);

CREATE INDEX IF NOT EXISTS idx_partner_facilities_partner ON vgvina_partner_facilities(partner_id);
CREATE INDEX IF NOT EXISTS idx_partner_facilities_facility ON vgvina_partner_facilities(facility_id);

-- ============================================
-- 6. UPDATE USERS TABLE
-- ============================================

-- Add role_id to vgvina_users
ALTER TABLE vgvina_users 
ADD COLUMN IF NOT EXISTS role_id UUID REFERENCES vgvina_roles(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_users_role ON vgvina_users(role_id);

-- ============================================
-- 7. HELPER FUNCTIONS
-- ============================================

-- Check if user has specific permission
CREATE OR REPLACE FUNCTION has_permission(
    p_user_id BIGINT,
    p_module TEXT,
    p_action TEXT
) RETURNS BOOLEAN AS $$
DECLARE
    v_is_admin BOOLEAN;
    v_has_perm BOOLEAN;
BEGIN
    -- Check if user is admin
    SELECT r.is_admin INTO v_is_admin
    FROM vgvina_users u
    JOIN vgvina_roles r ON u.role_id = r.id
    WHERE u.id = p_user_id;
    
    IF v_is_admin THEN
        RETURN TRUE;
    END IF;
    
    -- Check specific permission
    SELECT EXISTS (
        SELECT 1
        FROM vgvina_users u
        JOIN vgvina_role_permissions rp ON u.role_id = rp.role_id
        JOIN vgvina_permissions p ON rp.permission_id = p.id
        WHERE u.id = p_user_id
        AND p.module = p_module
        AND p.action = p_action
    ) INTO v_has_perm;
    
    RETURN COALESCE(v_has_perm, FALSE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Check if user has access to facility
CREATE OR REPLACE FUNCTION has_facility_access(
    p_user_id BIGINT,
    p_facility_id UUID
) RETURNS BOOLEAN AS $$
DECLARE
    v_is_admin BOOLEAN;
BEGIN
    -- Check if user is admin (has access to all facilities)
    SELECT r.is_admin INTO v_is_admin
    FROM vgvina_users u
    JOIN vgvina_roles r ON u.role_id = r.id
    WHERE u.id = p_user_id;
    
    IF v_is_admin THEN
        RETURN TRUE;
    END IF;
    
    -- Check if user has access to this facility
    RETURN EXISTS (
        SELECT 1
        FROM vgvina_user_facilities
        WHERE user_id = p_user_id
        AND facility_id = p_facility_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get user's accessible facility IDs
CREATE OR REPLACE FUNCTION get_user_facilities(p_user_id BIGINT)
RETURNS TABLE(facility_id UUID) AS $$
DECLARE
    v_is_admin BOOLEAN;
BEGIN
    -- Check if user is admin
    SELECT r.is_admin INTO v_is_admin
    FROM vgvina_users u
    JOIN vgvina_roles r ON u.role_id = r.id
    WHERE u.id = p_user_id;
    
    IF v_is_admin THEN
        -- Admin sees all facilities
        RETURN QUERY SELECT id FROM vgvina_facilities;
    ELSE
        -- Return user's assigned facilities
        RETURN QUERY 
        SELECT uf.facility_id 
        FROM vgvina_user_facilities uf
        WHERE uf.user_id = p_user_id;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- NOTES
-- ============================================
-- 1. Admin role (is_admin=TRUE) bypasses all permission checks
-- 2. Users can belong to multiple facilities
-- 3. Partners/Transactions can belong to multiple facilities
-- 4. RLS policies will be added in separate migration after testing
-- 5. To assign admin role to existing user:
--    UPDATE vgvina_users SET role_id = (SELECT id FROM vgvina_roles WHERE name = 'admin') WHERE id = <user_id>;

-- ============================================
-- 8. RLS POLICIES FOR RBAC
-- ============================================

-- Bật RLS cho các bảng quản trị
ALTER TABLE vgvina_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE vgvina_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE vgvina_role_permissions ENABLE ROW LEVEL SECURITY;

-- Cho phép truy cập công khai (Public Access) tương tự các bảng khác trong hệ thống hiện tại
-- Lưu ý: Trong thực tế nên giới hạn chỉ Admin mới được tạo/sửa/xóa roles
CREATE POLICY "Public Access Roles" ON vgvina_roles FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Permissions" ON vgvina_permissions FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Public Access Role Permissions" ON vgvina_role_permissions FOR ALL USING (true) WITH CHECK (true);
