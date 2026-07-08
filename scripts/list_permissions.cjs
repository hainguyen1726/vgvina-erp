
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY not found in environment');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function listPermissions() {
    try {
        const { data: permissions, error } = await supabase
            .from('vgvina_permissions')
            .select('*')
            .order('module', { ascending: true })
            .order('action', { ascending: true });

        if (error) {
            console.error('Error from Supabase:', error);
            return;
        }

        console.log('--- ALL PERMISSIONS ---');
        permissions.forEach(p => {
            console.log(`[${p.module}] [${p.action}] - ${p.display_name}`);
        });
    } catch (e) {
        console.error('Runtime error:', e);
    }
}

listPermissions();
