import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, '../docs');
const OUTPUT_FILE = path.resolve(__dirname, '../supabase/replace_master_data.sql');

const FILES = {
    CUSTOMERS: 'DanhSachKhachHang_vgvina.csv',
    PRODUCTS: 'Danh sach hang hoa_vgvina.csv'
};

function readCsv(filename) {
    const filePath = path.join(DOCS_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return [];
    }
    // Try without codepage - let xlsx auto-detect
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
}

function escapeSql(str) {
    if (str === null || str === undefined || str === '') return 'NULL';
    if (typeof str === 'number') return str;
    return `'${String(str).replace(/'/g, "''")}'`;
}

function parseCurrency(str) {
    if (!str) return 0;
    if (typeof str === 'number') return str;
    let clean = String(str).replace(/\./g, '').replace(',', '.');
    return parseFloat(clean) || 0;
}

// Helper to find column by partial match
function findColumn(row, ...patterns) {
    const keys = Object.keys(row);
    for (const pattern of patterns) {
        const found = keys.find(k => k.toLowerCase().includes(pattern.toLowerCase()));
        if (found) return row[found];
    }
    return null;
}

const sqlStatements = [];
function addSql(sql) {
    sqlStatements.push(sql);
}

addSql(`-- Replace Master Data Script
-- Generated at ${new Date().toISOString()}

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Delete dependencies first
DELETE FROM vgvina_sales_order_items;
DELETE FROM vgvina_purchase_order_items;
DELETE FROM vgvina_sales_orders;
DELETE FROM vgvina_purchase_orders;
DELETE FROM vgvina_financial_transactions;
DELETE FROM vgvina_debt_transactions;
DELETE FROM vgvina_partners;
DELETE FROM vgvina_products;
DELETE FROM vgvina_product_categories;

-- Helper for product categories
CREATE OR REPLACE FUNCTION get_or_create_product_category(p_name TEXT) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    IF p_name IS NULL OR p_name = '' THEN 
        SELECT id INTO v_id FROM vgvina_product_categories WHERE name = 'General' LIMIT 1;
        IF v_id IS NULL THEN
            INSERT INTO vgvina_product_categories (name) VALUES ('General') RETURNING id INTO v_id;
        END IF;
        RETURN v_id;
    END IF;
    SELECT id INTO v_id FROM vgvina_product_categories WHERE name = p_name LIMIT 1;
    IF v_id IS NULL THEN
        INSERT INTO vgvina_product_categories (name) VALUES (p_name) RETURNING id INTO v_id;
    END IF;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- INSERT CUSTOMERS/PARTNERS
`);

// Process Customers
console.log('Processing Customers...');
const customers = readCsv(FILES.CUSTOMERS);
console.log(`Total customers found: ${customers.length}`);

if (customers.length > 0) {
    console.log('Column names:', Object.keys(customers[0]));
}

let customerCount = 0;
customers.forEach(row => {
    const name = findColumn(row, 'tên khách', 'ten khach', 'customer name', 'name');
    const type = findColumn(row, 'loại khách', 'loai khach', 'type');
    const address = findColumn(row, 'địa chỉ', 'dia chi', 'address');
    const phone = findColumn(row, 'điện thoại', 'dien thoai', 'phone');
    const email = findColumn(row, 'email');
    const taxCode = findColumn(row, 'mã số thuế', 'ma so thue', 'tax');

    if (!name) return;

    customerCount++;
    let partnerType = 'CUSTOMER';
    if (type && (type.includes('Nhà cung cấp') || type.includes('NCC') || type.toLowerCase().includes('supplier'))) {
        partnerType = 'SUPPLIER';
    }

    addSql(`INSERT INTO vgvina_partners (name, type, phone, email, address, tax_code) VALUES (${escapeSql(name)}, '${partnerType}', ${escapeSql(phone)}, ${escapeSql(email)}, ${escapeSql(address)}, ${escapeSql(taxCode)});`);
});

console.log(`Processed ${customerCount} customers`);

addSql(`\n-- INSERT PRODUCTS\n`);

// Process Products
console.log('Processing Products...');
const products = readCsv(FILES.PRODUCTS);
console.log(`Total products found: ${products.length}`);

if (products.length > 0) {
    console.log('Column names:', Object.keys(products[0]));
}

let productCount = 0;
products.forEach(row => {
    const sku = findColumn(row, 'mã hàng', 'ma hang', 'sku', 'code');
    const name = findColumn(row, 'tên hàng', 'ten hang', 'product name', 'name');
    const category = findColumn(row, 'nhóm hàng', 'nhom hang', 'category');
    const unit = findColumn(row, 'đvt', 'dvt', 'unit');
    const priceRaw = findColumn(row, 'giá bán', 'gia ban', 'price');
    const quantityRaw = findColumn(row, 'tồn kho', 'ton kho', 'stock', 'quantity');

    const price = parseCurrency(priceRaw || 0);
    const quantity = parseCurrency(quantityRaw || 0);

    if (!sku || !name) return;

    productCount++;
    addSql(`INSERT INTO vgvina_products (sku, name, unit, price, quantity, category_id) VALUES (${escapeSql(sku)}, ${escapeSql(name)}, ${escapeSql(unit)}, ${price}, ${quantity}, get_or_create_product_category(${escapeSql(category)}));`);
});

console.log(`Processed ${productCount} products`);

// Write output
console.log(`Writing to ${OUTPUT_FILE}...`);
fs.writeFileSync(OUTPUT_FILE, sqlStatements.join('\n'));
console.log('Done!\n');
console.log(`Generated SQL with:`);
console.log(`  - ${customerCount} customers/partners`);
console.log(`  - ${productCount} products`);
