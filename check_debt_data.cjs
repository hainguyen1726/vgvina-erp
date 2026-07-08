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

async function check() {
    try {
        console.log('--- 1. Kiểm tra vgvina_sales_orders ---');
        const { data: orders, error: oError } = await supabase
            .from('vgvina_sales_orders')
            .select('id, code, order_date, total_amount, amount_paid, status, customer_id, facility_id')
            .limit(10);
        if (oError) throw oError;
        console.log(`Tìm thấy ${orders?.length || 0} đơn hàng bán đầu tiên:`);
        console.log(orders);

        const { data: debtOrders, error: dError } = await supabase
            .from('vgvina_sales_orders')
            .select('id, code, status, total_amount, amount_paid')
            .in('status', ['COMPLETED', 'DELIVERED']);
        if (dError) throw dError;
        
        const debts = (debtOrders || []).filter(o => o.total_amount > o.amount_paid);
        console.log(`Số đơn hàng COMPLETED/DELIVERED có nợ thực tế: ${debts.length}`);
        if (debts.length > 0) {
            console.log('Ví dụ 5 đơn hàng nợ:');
            console.log(debts.slice(0, 5));
        }

        console.log('--- 2. Kiểm tra vgvina_partners ---');
        const { data: partners, error: pError } = await supabase
            .from('vgvina_partners')
            .select('id, name, assigned_user_id, payment_due_days')
            .limit(10);
        if (pError) throw pError;
        console.log('Ví dụ 10 đối tác:');
        console.log(partners);

        const assignedCount = (partners || []).filter(p => p.assigned_user_id).length;
        console.log(`Số đối tác đã được gán assigned_user_id: ${assignedCount}/${partners?.length || 0}`);

    } catch (e) {
        console.error('Lỗi khi truy vấn:', e.message);
    }
}

check();
