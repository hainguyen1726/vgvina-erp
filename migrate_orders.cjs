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

async function migrate() {
    try {
        console.log('Starting migration: Adding account_id to vgvina_sales_orders and vgvina_purchase_orders...');

        // We use RPC if available or try to run raw SQL (if the client has permissions, which is rare for anon key)
        // Usually we'd need a service role key for migrations, but I can try to see if I can use a simple broad table update
        // or just advise the user to run it if I can't. 
        // Actually, I don't have a 'run_sql' tool, I have 'run_command'. 
        // I can't run migrations directly via Supabase JS Client without a custom RPC.

        console.log('Checking for existing columns first...');
        const { data: salesCols } = await supabase.from('vgvina_sales_orders').select('*').limit(1);
        if (salesCols && salesCols.length > 0 && 'account_id' in salesCols[0]) {
            console.log('account_id already exists in vgvina_sales_orders');
        } else {
            console.log('account_id MISSING in vgvina_sales_orders. Please run the following SQL in your Supabase SQL Editor:');
            console.log(`
ALTER TABLE vgvina_sales_orders ADD COLUMN account_id UUID REFERENCES vgvina_accounts(id);
ALTER TABLE vgvina_purchase_orders ADD COLUMN account_id UUID REFERENCES vgvina_accounts(id);
            `);
        }

    } catch (e) {
        console.error('Error during diagnostic:', e.message);
    }
}

migrate();
