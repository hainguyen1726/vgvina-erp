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

async function checkUser() {
    const username = 'Lynt@vgvina.com';
    try {
        const { data, error } = await supabase
            .from('vgvina_users')
            .select('*')
            .eq('username', username);
        
        if (error) {
            console.error('Error:', error.message);
            return;
        }

        if (data && data.length > 0) {
            console.log(`User "${username}" exists:`, JSON.stringify(data, null, 2));
        } else {
            console.log(`User "${username}" does not exist.`);
        }
    } catch (e) {
        console.error('Catch Error:', e.message);
    }
}

checkUser();
