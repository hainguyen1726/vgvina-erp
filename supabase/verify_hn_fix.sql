-- =============================================================================
-- VERIFICATION SCRIPT: Xác nhận HN Staff Data Visibility Fix
-- =============================================================================
-- Chạy script này để verify toàn bộ mapping và data availability

SET search_path TO public;

-- =============================================================================
-- 1. VERIFY MAPPING
-- =============================================================================
-- 1. USER-FACILITY MAPPING

SELECT 
    u.full_name,
    u.email,
    f.name as facility_name,
    uf.is_primary,
    uf.created_at
FROM vgvina_users u
JOIN vgvina_user_facilities uf ON uf.user_id = u.id
JOIN vgvina_facilities f ON f.id = uf.facility_id
WHERE u.email LIKE '%hn%' OR u.email LIKE '%hcm%'
ORDER BY u.email, f.name;

-- =============================================================================
-- 2. VERIFY INVENTORY DATA FOR HN
-- =============================================================================
-- 2. INVENTORY DATA FOR HN FACILITY

WITH hn_facility AS (
    SELECT id FROM vgvina_facilities WHERE name LIKE '%Hà Nội%'
)
SELECT 
    COUNT(*) as total_inventory_records,
    SUM(quantity) as total_quantity
FROM vgvina_inventory
WHERE facility_id IN (SELECT id FROM hn_facility);

SELECT 
    p.sku,
    p.name,
    i.quantity,
    COUNT(*) OVER() as total_products
FROM vgvina_inventory i
JOIN vgvina_products p ON p.id = i.product_id
WHERE i.facility_id IN (
    SELECT id FROM vgvina_facilities WHERE name LIKE '%Hà Nội%'
)
LIMIT 10;

-- =============================================================================
-- 3. VERIFY SALES ORDERS FOR HN
-- =============================================================================
-- 3. SALES ORDERS FOR HN FACILITY

WITH hn_facility AS (
    SELECT id FROM vgvina_facilities WHERE name LIKE '%Hà Nội%'
)
SELECT 
    COUNT(*) as total_sales_orders,
    SUM(total_amount) as total_sales_value
FROM vgvina_sales_orders
WHERE facility_id IN (SELECT id FROM hn_facility)
  AND DATE(order_date) >= NOW() - INTERVAL '30 days';

-- =============================================================================
-- 4. PERMISSION CHECK
-- =============================================================================
-- 4. PERMISSION CONFIGURATION

SELECT 
    u.full_name,
    r.display_name as role,
    COUNT(p.id) as permission_count,
    STRING_AGG(DISTINCT p.module, ', ' ORDER BY p.module) as modules
FROM vgvina_users u
LEFT JOIN vgvina_roles r ON r.id = u.role_id
LEFT JOIN vgvina_role_permissions rp ON rp.role_id = r.id
LEFT JOIN vgvina_permissions p ON p.id = rp.permission_id
WHERE u.email LIKE '%hn%' OR u.email LIKE '%hcm%'
GROUP BY u.id, u.full_name, r.display_name
ORDER BY u.full_name;

-- =============================================================================
-- 5. FINAL SUMMARY
-- =============================================================================
-- 5. FINAL SUMMARY

SELECT 
    'HN Staff Count' as metric,
    COUNT(DISTINCT u.id)::text as value
FROM vgvina_users u
WHERE u.email LIKE '%hn%'

UNION ALL

SELECT 
    'HN Facility Mappings',
    COUNT(*)::text
FROM vgvina_user_facilities uf
WHERE facility_id IN (SELECT id FROM vgvina_facilities WHERE name LIKE '%Hà Nội%')

UNION ALL

SELECT 
    'HN Inventory Records',
    COUNT(*)::text
FROM vgvina_inventory
WHERE facility_id IN (SELECT id FROM vgvina_facilities WHERE name LIKE '%Hà Nội%')

UNION ALL

SELECT 
    'HN Sales Orders (30d)',
    COUNT(*)::text
FROM vgvina_sales_orders
WHERE facility_id IN (SELECT id FROM vgvina_facilities WHERE name LIKE '%Hà Nội%')
  AND DATE(order_date) >= NOW() - INTERVAL '30 days';
