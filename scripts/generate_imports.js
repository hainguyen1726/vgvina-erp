import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.resolve(__dirname, '../docs');
const OUTPUT_FILE = path.resolve(__dirname, '../supabase/import_data.sql');

// Configuration
const FILES = {
    TRANSACTIONS: 'THU CHI - VGVINA - GiaoDich.csv',
    IMPORT_EXPORT: 'THU CHI - VGVINA - XuatNhap.csv',
    DEBT_CUSTOMER: 'THU CHI - VGVINA - CongNoKhach.csv',
    DEBT_SUPPLIER: 'THU CHI - VGVINA - CongNoNCC.csv'
};

function readCsv(filename) {
    const filePath = path.join(DOCS_DIR, filename);
    if (!fs.existsSync(filePath)) {
        console.warn(`File not found: ${filePath}`);
        return [];
    }
    const workbook = XLSX.readFile(filePath, { codepage: 65001 }); // UTF-8
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    return XLSX.utils.sheet_to_json(sheet);
}

function escapeSql(str) {
    if (str === null || str === undefined) return 'NULL';
    if (typeof str === 'number') return str;
    return `'${String(str).replace(/'/g, "''")}'`;
}

function parseCurrency(str) {
    if (!str) return 0;
    if (typeof str === 'number') return str;
    // Remove dots (thousand separators) and replace comma with dot if dealing with decimals, 
    // but based on CSV view "4.550.000" implies dot is thousand separator.
    // However, "2,2" in quantity implies comma is decimal.
    // Let's handle standard Vietnamese format: 1.000.000 = 1 million. 2,5 = 2.5
    let clean = str.replace(/\./g, '').replace(',', '.');
    return parseFloat(clean) || 0;
}

function parseDate(str) {
    if (!str) return 'NULL';

    // If it's an Excel serial number (numeric)
    if (typeof str === 'number') {
        // Excel date serial: days since 1900-01-01 (with bug: 1900 is incorrectly treated as leap year)
        // JavaScript: milliseconds since 1970-01-01
        const excelEpoch = new Date(1899, 11, 30); // December 30, 1899
        const days = Math.floor(str);
        const milliseconds = Math.round((str - days) * 86400000); // fractional part to ms
        const date = new Date(excelEpoch.getTime() + days * 86400000 + milliseconds);

        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        const seconds = String(date.getSeconds()).padStart(2, '0');

        return `'${year}-${month}-${day} ${hours}:${minutes}:${seconds}'`;
    }

    // If it's a string in DD/MM/YYYY format
    if (typeof str === 'string') {
        const parts = str.split('/');
        if (parts.length === 3) {
            return `'${parts[2]}-${parts[1]}-${parts[0]}'`;
        }
    }

    return escapeSql(str);
}

const sqlStatements = [];

// Helper to add SQL
function addSql(sql) {
    sqlStatements.push(sql);
}

addSql(`-- Auto-generated import script
-- Generated at ${new Date().toISOString()}

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Helper function to find or create facility
CREATE OR REPLACE FUNCTION get_or_create_facility(p_name TEXT) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    SELECT id INTO v_id FROM vgvina_facilities WHERE name = p_name LIMIT 1;
    IF v_id IS NULL THEN
        INSERT INTO vgvina_facilities (name) VALUES (p_name) RETURNING id INTO v_id;
    END IF;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Helper for partners
CREATE OR REPLACE FUNCTION get_or_create_partner(p_name TEXT, p_type TEXT) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    IF p_name IS NULL OR p_name = '' THEN RETURN NULL; END IF;
    SELECT id INTO v_id FROM vgvina_partners WHERE name = p_name LIMIT 1;
    IF v_id IS NULL THEN
        INSERT INTO vgvina_partners (name, type) VALUES (p_name, p_type) RETURNING id INTO v_id;
    END IF;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Helper for accounts
CREATE OR REPLACE FUNCTION get_or_create_account(p_name TEXT) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    IF p_name IS NULL OR p_name = '' THEN RETURN NULL; END IF;
    SELECT id INTO v_id FROM vgvina_accounts WHERE name = p_name LIMIT 1;
    IF v_id IS NULL THEN
        INSERT INTO vgvina_accounts (name, type) VALUES (p_name, 'CASH') RETURNING id INTO v_id;
    END IF;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Helper for categories
CREATE OR REPLACE FUNCTION get_or_create_txn_category(p_name TEXT, p_type TEXT) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    IF p_name IS NULL OR p_name = '' THEN RETURN NULL; END IF;
    SELECT id INTO v_id FROM vgvina_transaction_categories WHERE name = p_name LIMIT 1;
    IF v_id IS NULL THEN
        INSERT INTO vgvina_transaction_categories (name, type) VALUES (p_name, p_type) RETURNING id INTO v_id;
    END IF;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Helper for product categories (simple approach: Default category if unknown)
CREATE OR REPLACE FUNCTION get_default_product_category() RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    SELECT id INTO v_id FROM vgvina_product_categories WHERE name = 'General' LIMIT 1;
    IF v_id IS NULL THEN
        INSERT INTO vgvina_product_categories (name) VALUES ('General') RETURNING id INTO v_id;
    END IF;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;

-- Helper for products
CREATE OR REPLACE FUNCTION get_or_create_product(p_code TEXT, p_name TEXT, p_unit TEXT) RETURNS UUID AS $$
DECLARE
    v_id UUID;
BEGIN
    SELECT id INTO v_id FROM vgvina_products WHERE sku = p_code LIMIT 1;
    IF v_id IS NULL THEN
        INSERT INTO vgvina_products (sku, name, unit, category_id) 
        VALUES (p_code, p_name, p_unit, get_default_product_category()) 
        RETURNING id INTO v_id;
    END IF;
    RETURN v_id;
END;
$$ LANGUAGE plpgsql;
`);

// 1. Process Partners & Debts
// CongNoKhach.csv -> Customers
console.log('Processing Customers...');
const customers = readCsv(FILES.DEBT_CUSTOMER);
customers.forEach(row => {
    // "Đối tượng" is the name
    const name = row['Đối tượng'];
    if (name) {
        // Create partner
        addSql(`SELECT get_or_create_partner(${escapeSql(name)}, 'CUSTOMER');`);

        // Add debt if exists (ignoring for now as it duplicates transactions or requires balance adjustments)
        // Ideally initial balance should be a transaction? 
        // For now, let's just ensure partners exist.
    }
});

// CongNoNCC.csv -> Suppliers
console.log('Processing Suppliers...');
const suppliers = readCsv(FILES.DEBT_SUPPLIER);
suppliers.forEach(row => {
    const name = row['Đối tượng'];
    if (name) {
        addSql(`SELECT get_or_create_partner(${escapeSql(name)}, 'SUPPLIER');`);
    }
});

// 2. Process Products & Import/Export
console.log('Processing Import/Export...');
const ioData = readCsv(FILES.IMPORT_EXPORT);
ioData.forEach(row => {
    // Columns: Mã chứng từ, Ngày, Loại, Mã hàng, Tên hàng, Đvt, Số lượng, Đơn giá, Thành tiền, Đối tượng
    const sku = row['Mã hàng'];
    const productName = row['Tên hàng'];
    const unit = row['Đvt'];

    if (sku && productName) {
        addSql(`SELECT get_or_create_product(${escapeSql(sku)}, ${escapeSql(productName)}, ${escapeSql(unit)});`);
    }

    // Orders logic could go here (complex because of multiple lines per order)
    // For now, let's focus on base data + transactions.
});

// 3. Process Financial Transactions
console.log('Processing Transactions...');
const txns = readCsv(FILES.TRANSACTIONS);
if (txns.length > 0) {
    console.log('First Transaction Row:', JSON.stringify(txns[0], null, 2));
}
txns.forEach(row => {
    // Columns: Ngày, Loại, Hạng mục, Diễn giải, Số tiền, Người thực hiện, Đối tượng, Tài khoản
    const date = parseDate(row['Ngày']);
    const amount = parseCurrency(row['Số tiền']);

    // Skip invalid rows
    if (amount === 0 || date === 'NULL') return;

    const type = row['Loại'] === 'Thu' ? 'INCOME' : (row['Loại'] === 'Chi' ? 'EXPENSE' : 'INTERNAL_TRANSFER');
    const category = row['Hạng mục'];
    const desc = row['Diễn giải'];
    const partnerName = row['Đối tượng'];
    const accountName = row['Tài khoản'];

    // Determine category_id: only create if category name exists AND type is INCOME or EXPENSE
    let categoryIdSql = 'NULL';
    if (category && category.trim() !== '' && (type === 'INCOME' || type === 'EXPENSE')) {
        categoryIdSql = `get_or_create_txn_category(${escapeSql(category)}, '${type}')`;
    }

    // Logic to insert
    addSql(`
    INSERT INTO vgvina_financial_transactions (
        type, 
        transaction_date, 
        amount, 
        description, 
        category_id, 
        partner_id, 
        account_id,
        code
    ) VALUES (
        '${type}',
        ${date},
        ${amount},
        ${escapeSql(desc)},
        ${categoryIdSql},
        get_or_create_partner(${escapeSql(partnerName)}, CASE WHEN '${type}' = 'INCOME' THEN 'CUSTOMER' ELSE 'SUPPLIER' END),
        get_or_create_account(${escapeSql(accountName)}),
        ${escapeSql(row['Mã giao dịch'] || 'TXN-' + Math.random().toString(36).substr(2, 9))}
    ) ON CONFLICT (code) DO NOTHING;
    `);
});

// Write output
console.log(`Writing to ${OUTPUT_FILE}...`);
fs.writeFileSync(OUTPUT_FILE, sqlStatements.join('\n'));
console.log('Done!');
