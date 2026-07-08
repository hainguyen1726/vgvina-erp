import { supabase } from './src/supabaseClient';

async function test() {
    const { data, error } = await supabase.from('vgvina_return_voucher_items').select(`
                quantity,
                price,
                product:product_id ( id, sku, name, unit, price ),
                voucher:return_id!inner ( return_date, related_order_id ( facility_id ) )
            `).limit(1);
    console.log(error);
}

test();
