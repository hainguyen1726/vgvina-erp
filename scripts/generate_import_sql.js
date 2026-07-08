import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOCS_DIR = path.join(__dirname, '../docs');
const OUTPUT_FILE = path.join(__dirname, '../supabase/import_data.sql');

function parseCSVLine(line) {
    const values = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            values.push(current.trim());
            current = '';
        } else {
            current += char;
        }
    }
    values.push(current.trim());
    return values.map(v => v.replace(/^"|"$/g, '').replace(/""/g, '"'));
}

function parseNumber(str) {
    if (!str) return 0;
    // Format is 1.234,56 (Vietnamese) -> Remove . then Replace , with .
    // But sometimes it might be just integers or standard format if inconsistent.
    // Based on preview: "4.768,30" -> 4768.30

    // Check if it looks like Vietnamese format
    let cleanStr = str;
    if (str.includes(',') && str.includes('.')) {
        cleanStr = str.replace(/\./g, '').replace(',', '.');
    } else if (str.includes(',')) {
        // Assume comma is decimal if no dots (e.g. "5,5") OR comma is thousand sep if no dots?
        // In VN format, comma is usually decimal separator if dot is thousand.
        // Let's assume comma is decimal.
        cleanStr = str.replace(',', '.');
    } else if (str.includes('.')) {
        // Could be 1.000 (1000) or 1.5 (1.5).
        // If it has multiple dots, it's thousand sep. 
        // If it has 3 digits after dot, ambiguous.
        // Based on preview "29.894,00", dot is thousand.
        // "4.768,30"
        // If only dots: "10.000" -> 10000.
        // So remove dots.
        cleanStr = str.replace(/\./g, '');
    }

    // Refined logic based on observed data:
    // "4.768,30" -> Remove dot, replace comma with dot -> 4768.30
    // "10.000" -> Remove dot -> 10000
    // "0,00" -> Replace comma -> 0.00

    // Safe parse:
    // 1. Remove all dots.
    // 2. Replace comma with dot.
    cleanStr = str.replace(/\./g, '').replace(',', '.');

    const num = parseFloat(cleanStr);
    return isNaN(num) ? 0 : num;
}

function generateSQL() {
    let sql = `-- Auto-generated import script\n`;
    sql += `-- Run this in Supabase SQL Editor\n\n`;

    // 1. FACILITIES
    // We'll use (SELECT id FROM vgvina_facilities LIMIT 1) as default facility

    // 2. PARTNERS (DoiTuong.csv)
    sql += `-- IMPORT PARTNERS\n`;
    try {
        const content = fs.readFileSync(path.join(DOCS_DIR, 'THU CHI - VGVINA - DoiTuong.csv'), 'utf8');
        const lines = content.split('\n').filter(l => l.trim());

        for (let i = 1; i < lines.length; i++) {
            const row = parseCSVLine(lines[i]);
            if (row.length < 2 || !row[1]) continue;

            const rawType = row[0] || '';
            const name = row[1].replace(/'/g, "''");
            const taxCode = row[3] ? row[3].replace(/'/g, "''") : '';
            const phone = row[4] ? row[4].replace(/'/g, "''") : '';
            const address = row[5] ? row[5].replace(/'/g, "''") : '';

            let type = 'CUSTOMER';
            if (rawType.toUpperCase().includes('NCC') || rawType.toUpperCase().includes('NPP')) {
                type = 'SUPPLIER';
            }
            // Skip duplicates? Ideally yes, but SQL INSERT might fail if name UNIQUE, but name is not unique in schema.

            sql += `INSERT INTO vgvina_partners (name, type, phone, address, tax_code, facility_id) VALUES ('${name}', '${type}', '${phone}', '${address}', '${taxCode}', (SELECT id FROM vgvina_facilities LIMIT 1));\n`;
        }
    } catch (e) {
        sql += `-- Error reading DoiTuong.csv: ${e.message}\n`;
    }

    // 3. ACCOUNTS (TaiKhoan.csv)
    sql += `\n-- IMPORT ACCOUNTS\n`;
    try {
        const content = fs.readFileSync(path.join(DOCS_DIR, 'THU CHI - VGVINA - TaiKhoan.csv'), 'utf8');
        const lines = content.split('\n').filter(l => l.trim());

        for (let i = 1; i < lines.length; i++) {
            const row = parseCSVLine(lines[i]);
            if (row.length < 3 || !row[0]) continue;

            const name = row[0].replace(/'/g, "''");
            const balance = parseNumber(row[2]);
            const details = row[3] ? row[3].replace(/'/g, "''") : '';

            let type = 'CASH';
            if (name.toUpperCase().includes('TK') || name.toUpperCase().includes('NGÂN HÀNG') || name.toUpperCase().includes('BANK') || name.toUpperCase().includes('TCB')) {
                type = 'BANK';
            }

            sql += `INSERT INTO vgvina_accounts (name, type, balance, details, facility_id) VALUES ('${name}', '${type}', ${balance}, '${details}', (SELECT id FROM vgvina_facilities LIMIT 1));\n`;
        }
    } catch (e) {
        sql += `-- Error reading TaiKhoan.csv: ${e.message}\n`;
    }

    // 4. PRODUCTS (TonKho.csv)
    sql += `\n-- IMPORT PRODUCTS\n`;
    try {
        const content = fs.readFileSync(path.join(DOCS_DIR, 'THU CHI - VGVINA - TonKho.csv'), 'utf8');
        const lines = content.split('\n').filter(l => l.trim());

        for (let i = 1; i < lines.length; i++) {
            const row = parseCSVLine(lines[i]);
            if (row.length < 2 || !row[0]) continue;

            const sku = row[0].replace(/'/g, "''");
            const name = row[1].replace(/'/g, "''");
            const unit = row[2] ? row[2].replace(/'/g, "''") : '';
            const quantity = parseNumber(row[6]); // Column 7 is Tồn

            sql += `INSERT INTO vgvina_products (sku, name, unit, quantity, facility_id) VALUES ('${sku}', '${name}', '${unit}', ${quantity}, (SELECT id FROM vgvina_facilities LIMIT 1));\n`;
        }

    } catch (e) {
        sql += `-- Error reading TonKho.csv: ${e.message}\n`;
    }

    fs.writeFileSync(OUTPUT_FILE, sql);
    console.log(`Generated SQL to ${OUTPUT_FILE}`);
}

generateSQL();
