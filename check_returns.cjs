const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

// Read .env.local manually
let supabaseUrl = '';
let supabaseAnonKey = '';
try {
    const envData = fs.readFileSync('.env.local', 'utf8');
    const lines = envData.split('\n');
    for (const line of lines) {
        if (line.startsWith('VITE_SUPABASE_URL=')) {
            supabaseUrl = line.split('=')[1].trim();
        }
        if (line.startsWith('VITE_SUPABASE_ANON_KEY=')) {
            supabaseAnonKey = line.split('=')[1].trim();
        }
    }
} catch (e) {
    console.error("Lỗi khi đọc file .env.local:", e.message);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function check() {
    try {
        console.log("--- TRUY VẤN CHI TIẾT USER NGUYỄN MINH HẢI NHƯ BRANCHCONTEXT ---");
        
        let query = supabase
          .from('vgvina_users')
          .select(`
            *,
            role_details:role_id (
                id,
                name,
                display_name,
                is_admin,
                permissions:vgvina_role_permissions (
                    permission:permission_id (
                        module,
                        action
                    )
                )
            ),
            facilities:vgvina_user_facilities (
                is_primary,
                facility_id,
                facility:vgvina_facilities (
                    name
                )
            )
          `)
          .eq('id', 2)
          .maybeSingle();

        const { data: matchedUser, error: userError } = await query;
        if (userError) throw userError;

        console.log("matchedUser:", JSON.stringify(matchedUser, null, 2));

        if (matchedUser) {
            const isAdmin = matchedUser.role_details?.is_admin === true ||
                ['admin', 'Admin', 'Quản trị viên', 'Kế toán HO', 'Ban Lãnh đạo'].includes(matchedUser.role);
            console.log("\nKết quả tính isAdmin:", isAdmin);
            console.log("matchedUser.role:", matchedUser.role);
            console.log("matchedUser.role_details?.is_admin:", matchedUser.role_details?.is_admin);
        }

    } catch (err) {
        console.error("Lỗi:", err.message);
    }
}

check();
