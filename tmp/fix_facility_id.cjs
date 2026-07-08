const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

if (fs.existsSync('.env.local')) {
    const content = fs.readFileSync('.env.local', 'utf8');
    content.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
            process.env[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
        }
    });
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
    console.log('Fetching facilities...');
    const { data: facilities } = await supabase.from('vgvina_facilities').select('*');
    console.log('Facilities:', facilities);
    
    console.log('Fetching orders with null facility_id...');
    const { data: salesNull } = await supabase.from('vgvina_sales_orders').select('id, code').is('facility_id', null);
    const { data: purchaseNull } = await supabase.from('vgvina_purchase_orders').select('id, code').is('facility_id', null);
    
    console.log(`Found ${salesNull?.length || 0} Sales Orders with null facility_id`);
    console.log(`Found ${purchaseNull?.length || 0} Purchase Orders with null facility_id`);

    if (facilities && facilities.length > 0 && ((salesNull && salesNull.length > 0) || (purchaseNull && purchaseNull.length > 0))) {
        const defaultFacility = facilities.find(f => f.name.includes('Hà Nội')) || facilities[0];
        console.log(`Updating missing facility_ids to: ${defaultFacility.name} (${defaultFacility.id})`);

        if (salesNull && salesNull.length > 0) {
            const { error: sErr } = await supabase.from('vgvina_sales_orders').update({ facility_id: defaultFacility.id }).is('facility_id', null);
            if (sErr) console.error('Error updating sales orders:', sErr);
            else console.log('Successfully updated sales orders.');
        }

        if (purchaseNull && purchaseNull.length > 0) {
            const { error: pErr } = await supabase.from('vgvina_purchase_orders').update({ facility_id: defaultFacility.id }).is('facility_id', null);
            if (pErr) console.error('Error updating purchase orders:', pErr);
            else console.log('Successfully updated purchase orders.');
        }
    }
}
run();
