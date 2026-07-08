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

async function verify() {
    try {
        console.log('--- Verifying Transaction Categories ---');
        const { data: cats } = await supabase.from('vgvina_transaction_categories').select('name, type');
        console.log('Categories found:', cats.map(c => `[${c.type}] ${c.name}`).join(', '));

        const namesToCheck = [
            'Doanh thu Bán hàng',
            'Bán hàng (Ghi nợ)',
            'Chi phí nguyên vật liệu',
            'Chi phí mua hàng (Ghi nợ)'
        ];

        namesToCheck.forEach(name => {
            const found = cats.find(c => c.name === name);
            if (found) {
                console.log(`✅ ${name} exists.`);
            } else {
                console.log(`⚠️ ${name} MISSING.`);
            }
        });

    } catch (e) {
        console.error('Error during verification:', e.message);
    }
}

verify();
