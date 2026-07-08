const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

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
        console.log("--- TEST QUERY RETURNS DATA ---");
        
        let query = supabase
            .from('vgvina_return_vouchers')
            .select(`
                *,
                items:vgvina_return_voucher_items (
                    *,
                    product:product_id ( id, name, sku, unit )
                ),
                assignees:vgvina_return_assignees (
                    employee:employee_id ( id, full_name )
                )
            `)
            .order('created_at', { ascending: false });

        const { data: returnsData, error: returnsError } = await query;
        if (returnsError) throw returnsError;

        console.log("returnsData length:", returnsData ? returnsData.length : 0);
        if (returnsData && returnsData.length > 0) {
            console.log("Mẫu phiếu trả hàng đầu tiên:", JSON.stringify(returnsData[0], null, 2));
        }

        console.log("\n--- TEST MAPPED RETURNS ---");
        const { data: salesOrders, error: salesError } = await supabase
            .from('vgvina_sales_orders')
            .select('id, code, facility_id, partner:customer_id ( name )');
        if (salesError) throw salesError;

        const { data: purchaseOrders, error: purchaseError } = await supabase
            .from('vgvina_purchase_orders')
            .select('id, code, facility_id, partner:supplier_id ( name )');
        if (purchaseError) throw purchaseError;

        const salesMap = new Map(salesOrders.map(o => [o.id, o]));
        const purchaseMap = new Map(purchaseOrders.map(o => [o.id, o]));

        let mappedReturns = returnsData.map((v) => {
            const salesOrder = salesMap.get(v.related_order_id);
            const purchaseOrder = purchaseMap.get(v.related_order_id);

            let partnerName = 'N/A';
            let relatedOrderCode = 'N/A';
            if (salesOrder) {
                partnerName = salesOrder.partner?.name || 'N/A';
                relatedOrderCode = salesOrder.code;
            } else if (purchaseOrder) {
                partnerName = purchaseOrder.partner?.name || 'N/A';
                relatedOrderCode = purchaseOrder.code;
            }

            return {
                ...v,
                customer_name: partnerName,
                related_order_code: relatedOrderCode,
                assigned_user_ids: (v.assignees || []).map((a) => String(a.employee?.id)),
                assigned_user_names: (v.assignees || []).map((a) => a.employee?.full_name).filter(Boolean),
                items: (v.items || []).map((i) => ({
                    ...i,
                    product: i.product || { name: 'Unknown', sku: 'N/A', unit: '?' }
                })),
                total_amount: (v.items || []).reduce((sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0) - Number(v.return_fee || 0) - Number(v.discount || 0)
            };
        });

        console.log("mappedReturns length:", mappedReturns.length);
        if (mappedReturns.length > 0) {
            console.log("Mẫu phiếu đã map đầu tiên:", JSON.stringify(mappedReturns[0], null, 2));
        }

        // Test filter by facility Nha Trang (HO)
        const NT_FACILITY_ID = "fdaae043-1982-4197-abb6-8e933e8c6eb3";
        const HN_FACILITY_ID = "8852d1b3-c957-457d-b2bb-b921b9c7bbdf";

        const filteredNT = mappedReturns.filter((v) => {
            const salesOrder = salesMap.get(v.related_order_id);
            const purchaseOrder = purchaseMap.get(v.related_order_id);
            const orderFacilityId = salesOrder?.facility_id || purchaseOrder?.facility_id;
            return orderFacilityId === NT_FACILITY_ID;
        });
        console.log(`Số lượng phiếu ở Nha Trang (HO):`, filteredNT.length);

        const filteredHN = mappedReturns.filter((v) => {
            const salesOrder = salesMap.get(v.related_order_id);
            const purchaseOrder = purchaseMap.get(v.related_order_id);
            const orderFacilityId = salesOrder?.facility_id || purchaseOrder?.facility_id;
            return orderFacilityId === HN_FACILITY_ID;
        });
        console.log(`Số lượng phiếu ở Hà Nội:`, filteredHN.length);

    } catch (err) {
        console.error("Lỗi:", err.message);
    }
}

check();
