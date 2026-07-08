const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

function loadEnv() {
    if (fs.existsSync('.env.local')) {
        const content = fs.readFileSync('.env.local', 'utf8');
        content.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split('=');
            if (key && valueParts.length > 0) {
                const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                process.env[key.trim()] = value;
            }
        });
    }
}

loadEnv();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function testLedger() {
    try {
        // Find partner "Đỗ Thị Ánh" or similar
        const { data: partners, error: pError } = await supabase
            .from('vgvina_partners')
            .select('*');
        if (pError) throw pError;

        const targetPartner = partners.find(p => p.name.includes('Đỗ Thị Ánh') || p.name.includes('Ánh'));
        if (!targetPartner) {
            console.log('Không tìm thấy đối tác Đỗ Thị Ánh. Danh sách đối tác:', partners.map(p => p.name));
            return;
        }

        console.log('Tìm thấy đối tác:', targetPartner.name, 'ID:', targetPartner.id, 'Type:', targetPartner.type);

        const partnerId = targetPartner.id;

        // Run the original query logic for statement
        let salesQuery = supabase
            .from('vgvina_sales_orders')
            .select('id, code, order_date, total_amount, notes')
            .eq('customer_id', partnerId);

        let purchaseQuery = supabase
            .from('vgvina_purchase_orders')
            .select('id, code, order_date, total_amount, notes')
            .eq('supplier_id', partnerId);

        let txnQuery = supabase
            .from('vgvina_financial_transactions')
            .select('id, code, transaction_date, amount, type, description, account:account_id ( name )')
            .eq('partner_id', partnerId);

        const [sales, purchases, txns] = await Promise.all([
            salesQuery,
            purchaseQuery,
            txnQuery
        ]);

        console.log('Số lượng hóa đơn bán:', sales.data?.length || 0);
        console.log('Số lượng hóa đơn mua:', purchases.data?.length || 0);
        console.log('Số lượng giao dịch tài chính:', txns.data?.length || 0);

        if (txns.data) {
            console.log('Danh sách giao dịch tài chính raw:');
            txns.data.forEach(t => {
                console.log(`- Mã: ${t.code}, Ngày: ${t.transaction_date}, Loại: ${t.type}, Số tiền: ${t.amount}, Diễn giải: ${t.description}`);
            });
        }

    } catch (e) {
        console.error('Lỗi:', e);
    }
}

testLedger();
