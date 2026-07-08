const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

async function diag() {
    try {
        const env = fs.readFileSync('.env.local', 'utf8');
        const url = env.match(/VITE_SUPABASE_URL=(.*)/)?.[1];
        const key = env.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1];

        if (!url || !key) {
            console.error('Failed to parse .env.local');
            process.exit(1);
        }

        const supabase = createClient(url, key);

        console.log('--- CHECKING FOREIGN KEYS FOR JUNCTION TABLES ---');

        const tables = [
            'vgvina_transaction_assignees',
            'vgvina_sales_order_assignees',
            'vgvina_purchase_order_assignees'
        ];

        for (const table of tables) {
            console.log(`\nTable: ${table}`);
            // Querying information_schema through a generic RPC or direct select if permitted
            const { data, error } = await supabase
                .from('information_schema.key_column_usage')
                .select('column_name, referenced_table_name, referenced_column_name')
                .eq('table_name', table);

            if (error) {
                console.log(`- Error: ${error.message}`);
                console.log(`- Tip: PostgREST may not expose information_schema. Try a join test.`);

                const { error: joinError } = await supabase
                    .from(table === 'vgvina_transaction_assignees' ? 'vgvina_financial_transactions' : (table === 'vgvina_sales_order_assignees' ? 'vgvina_sales_orders' : 'vgvina_purchase_orders'))
                    .select(`id, assignees:${table}(*)`)
                    .limit(1);

                if (joinError) console.log(`- Join Test: FAIL - ${joinError.message}`);
                else console.log(`- Join Test: OK`);

            } else {
                console.log(`- Foreign Keys:`);
                data.forEach(fk => {
                    if (fk.referenced_table_name) {
                        console.log(`  * ${fk.column_name} -> ${fk.referenced_table_name}(${fk.referenced_column_name})`);
                    }
                });
                if (data.length === 0) console.log(`  * No foreign keys found!`);
            }
        }

    } catch (err) {
        console.error('Critical error:', err.message);
    }
}

diag();
