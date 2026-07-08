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

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    try {
        const { data: partners, error: pError } = await supabase.from('vgvina_partners').select('id, name').ilike('name', '%Huyền Trang%');
        if (pError) throw pError;
        console.log('Partners found:', partners);
        
        if (partners.length > 0) {
            const pId = partners[0].id;
            const { data: txns, error: tError } = await supabase
                .from('vgvina_financial_transactions')
                .select(`
                    id, code, type, transaction_date, amount, description, 
                    account:account_id ( name ),
                    related_transaction_id
                `)
                .eq('partner_id', pId)
                .order('created_at', { ascending: false });
            if (tError) throw tError;
            console.log('Transactions for Huyền Trang:');
            console.log(txns);
        }
    } catch (e) {
        console.error('Error:', e.message);
    }
}

check();
