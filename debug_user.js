const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1];
const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1];

if (!url || !key) {
    console.error('Failed to parse .env.local');
    process.exit(1);
}

const supabase = createClient(url, key);

async function checkUser() {
    console.log('Checking users with name Hà Hoàn...');
    const { data, error } = await supabase
        .from('vgvina_users')
        .select(`
            id,
            full_name,
            role,
            role_id,
            role_details:role_id (name, display_name, is_admin),
            facilities:vgvina_user_facilities (
                is_primary,
                facility_id,
                facility:vgvina_facilities (name)
            )
        `)
        .ilike('full_name', '%Hà Hoàn%');

    if (error) {
        console.error('Error:', error);
        return;
    }

    console.log(JSON.stringify(data, null, 2));
}

checkUser();
