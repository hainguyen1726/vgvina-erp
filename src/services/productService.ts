import { supabase } from '../supabaseClient';
import { Product } from '../../types';

// After 2026-05-05 migration:
//   vgvina_products = master (no facility_id, no quantity)
//   vgvina_inventory(product_id, facility_id, quantity) = tồn kho per facility
// `Product.quantity` and `Product.warehouse` are now COMPUTED at fetch time.

type InventoryRow = { facility_id: string; quantity: number; facility?: { name?: string } };

const round4 = (n: number) => Math.round(n * 10000) / 10000;

export const productService = {
    async getProducts(facilityId?: string): Promise<Product[]> {
        const { data, error } = await supabase
            .from('vgvina_products')
            .select(`
                *,
                category:vgvina_product_categories(name),
                inventory:vgvina_inventory(facility_id, quantity, facility:vgvina_facilities(name))
            `);

        if (error) {
            console.error('Error fetching products:', error);
            throw error;
        }

        return (data || []).map((item: any) => {
            const invs: InventoryRow[] = item.inventory || [];

            let quantity = 0;
            let warehouse = '';
            if (facilityId) {
                const inv = invs.find(i => i.facility_id === facilityId);
                quantity = inv ? Number(inv.quantity) || 0 : 0;
                warehouse = inv?.facility?.name || '';
            } else {
                quantity = round4(invs.reduce((s, i) => s + (Number(i.quantity) || 0), 0));
                warehouse = invs.length > 1 ? 'Tất cả chi nhánh' : (invs[0]?.facility?.name || '');
            }

            return {
                id: item.id,
                sku: item.sku,
                name: item.name,
                unit: item.unit,
                category: item.category?.name || '',
                category_id: item.category_id,
                quantity,
                warehouse,
                facility_id: facilityId,
                price: item.price,
                // Extra (not in Product type but available for UI casts):
                inventoryByFacility: invs.map(i => ({
                    facility_id: i.facility_id,
                    facility_name: i.facility?.name || '',
                    quantity: Number(i.quantity) || 0,
                })),
            } as Product & { inventoryByFacility: { facility_id: string; facility_name: string; quantity: number }[] };
        });
    },

    // Live stock per product. If facilityId provided, returns qty at that facility;
    // otherwise returns SUM across all facilities.
    async getLiveStock(productIds: string[], facilityId?: string): Promise<{ id: string; name: string; quantity: number }[]> {
        if (!productIds || productIds.length === 0) return [];

        // Get product names in parallel for nicer error messages
        const productsP = supabase
            .from('vgvina_products')
            .select('id, name')
            .in('id', productIds);

        let invQuery = supabase
            .from('vgvina_inventory')
            .select('product_id, facility_id, quantity')
            .in('product_id', productIds);
        if (facilityId) invQuery = invQuery.eq('facility_id', facilityId);

        const [productsRes, invRes] = await Promise.all([productsP, invQuery]);
        if (productsRes.error) throw productsRes.error;
        if (invRes.error) throw invRes.error;

        const nameMap = new Map<string, string>();
        for (const p of productsRes.data || []) nameMap.set(p.id, p.name);

        const qtyMap = new Map<string, number>();
        for (const row of invRes.data || []) {
            qtyMap.set(row.product_id, (qtyMap.get(row.product_id) || 0) + (Number(row.quantity) || 0));
        }

        return productIds.map(pid => ({
            id: pid,
            name: nameMap.get(pid) || '',
            quantity: round4(qtyMap.get(pid) || 0),
        }));
    },

    // Returns inventory rows grouped by facility for a single product.
    async getProductInventoryByFacility(productId: string): Promise<{ facility_id: string; facility_name: string; quantity: number }[]> {
        const { data, error } = await supabase
            .from('vgvina_inventory')
            .select('facility_id, quantity, facility:vgvina_facilities(name)')
            .eq('product_id', productId);
        if (error) throw error;
        return (data || []).map((r: any) => ({
            facility_id: r.facility_id,
            facility_name: r.facility?.name || '',
            quantity: Number(r.quantity) || 0,
        }));
    },

    // Reject if SKU or name (case-insensitive, trimmed) collides with another product.
    async _assertSkuAndNameAvailable(sku: string, name: string, excludeId?: string) {
        const skuNorm = (sku || '').trim();
        const nameNorm = (name || '').trim();
        if (!skuNorm) throw new Error('SKU không được để trống');
        if (!nameNorm) throw new Error('Tên sản phẩm không được để trống');

        let query = supabase
            .from('vgvina_products')
            .select('id, sku, name')
            .or(`sku.ilike.${skuNorm},name.ilike.${nameNorm}`);
        if (excludeId) query = query.neq('id', excludeId);
        const { data, error } = await query;
        if (error) throw error;
        if (!data || data.length === 0) return;

        for (const row of data) {
            if ((row.sku || '').trim().toLowerCase() === skuNorm.toLowerCase()) {
                throw new Error(`SKU "${skuNorm}" đã tồn tại (sản phẩm: "${row.name}"). Vui lòng dùng mã khác.`);
            }
        }
        for (const row of data) {
            if ((row.name || '').trim().toLowerCase() === nameNorm.toLowerCase()) {
                throw new Error(`Tên sản phẩm "${nameNorm}" đã tồn tại (mã: "${row.sku}"). Vui lòng đặt tên khác.`);
            }
        }
    },

    async updateProduct(product: Product) {
        await this._assertSkuAndNameAvailable(product.sku, product.name, product.id);

        const { error } = await supabase
            .from('vgvina_products')
            .update({
                sku: (product.sku || '').trim(),
                name: (product.name || '').trim(),
                unit: product.unit,
                price: product.price,
                category_id: product.category_id,
            })
            .eq('id', product.id);

        if (error) {
            console.error('Error updating product:', error);
            throw error;
        }
    },

    async createProduct(product: Omit<Product, 'id'>) {
        await this._assertSkuAndNameAvailable(product.sku, product.name);

        const { data, error } = await supabase
            .from('vgvina_products')
            .insert({
                sku: (product.sku || '').trim(),
                name: (product.name || '').trim(),
                unit: product.unit,
                price: product.price,
                category_id: product.category_id,
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating product:', error);
            throw error;
        }
        return data;
    },

    async bulkUpsertProducts(products: Partial<Product>[]) {
        if (!products || products.length === 0) return;

        const payload = products.map(p => ({
            ...(p.id ? { id: p.id } : {}),
            sku: (p.sku || '').trim(),
            name: (p.name || '').trim(),
            unit: p.unit,
            price: p.price || 0,
            category_id: p.category_id || null,
        }));

        const { error } = await supabase
            .from('vgvina_products')
            .upsert(payload, { onConflict: 'sku' });

        if (error) {
            console.error('Error bulk upserting products:', error);
            throw error;
        }
    },

    // Movement history for a single product. Optionally scoped to one facility.
    async getInventoryMovementHistory(productId: string, facilityId?: string) {
        const { data: product } = await supabase.from('vgvina_products').select('sku').eq('id', productId).single();
        if (!product) throw new Error("Sản phẩm không tồn tại");

        const [sales, purchases, transfersOut, transfersIn, scrapping, returns] = await Promise.all([
            supabase.from('vgvina_sales_order_items').select(`
                quantity, price, notes,
                order:order_id ( id, code, order_date, facility_id, status, partner:customer_id ( name ) )
            `).eq('product_id', productId),

            supabase.from('vgvina_purchase_order_items').select(`
                quantity, price, notes,
                order:order_id ( id, code, order_date, facility_id, status, partner:supplier_id ( name ) )
            `).eq('product_id', productId),

            supabase.from('vgvina_internal_transfer_items').select(`
                quantity, notes,
                transfer:transfer_id ( id, code, transfer_date, status, from_facility_id, to_facility_id, from_facility:from_facility_id ( name ), to_facility:to_facility_id ( name ) )
            `).eq('product_id', productId),

            // Transfers IN — same query but we'll keep both directions and filter by facility below
            Promise.resolve({ data: [] as any[] }),

            supabase.from('vgvina_scrapping_voucher_items').select(`
                quantity, notes,
                voucher:scrapping_id ( id, code, scrapping_date, status, facility_id )
            `).eq('product_id', productId),

            supabase.from('vgvina_return_voucher_items').select(`
                quantity, price, notes,
                voucher:return_id ( id, code, return_date, status, related_order_id )
            `).eq('product_id', productId)
        ]);

        // For transfers, the same transfer item appears as OUT (from_facility) and IN (to_facility)
        // We synthesize 2 movement rows per item depending on facility filter:
        const transferItemsForFacility = (transfersOut.data || []) as any[];

        const movements: any[] = [];

        // Sales — outgoing at order.facility_id (Only COMPLETED/DELIVERED)
        sales.data?.forEach((s: any) => {
            const status = s.order?.status;
            if (status !== 'COMPLETED' && status !== 'DELIVERED') return;
            
            const fid = s.order?.facility_id;
            if (facilityId && fid !== facilityId) return;
            movements.push({
                voucherId: s.order?.id,
                date: s.order?.order_date,
                code: s.order?.code,
                type: 'Xuất lẻ (Bán)',
                partner: s.order?.partner?.name || 'Vãng lai',
                facility_id: fid,
                note: s.notes,
                qty_in: 0,
                qty_out: s.quantity,
                price: s.price
            });
        });

        // Purchases — incoming at order.facility_id (Only COMPLETED/DELIVERED)
        purchases.data?.forEach((p: any) => {
            const status = p.order?.status;
            if (status !== 'COMPLETED' && status !== 'DELIVERED') return;

            const fid = p.order?.facility_id;
            if (facilityId && fid !== facilityId) return;
            movements.push({
                voucherId: p.order?.id,
                date: p.order?.order_date,
                code: p.order?.code,
                type: 'Nhập kho (Mua)',
                partner: p.order?.partner?.name || 'NCC',
                facility_id: fid,
                note: p.notes,
                qty_in: p.quantity,
                qty_out: 0,
                price: p.price
            });
        });

        // Transfers — emit OUT row at from_facility and IN row at to_facility (Chuyển kho 2 bước)
        transferItemsForFacility.forEach((t: any) => {
            const fromId = t.transfer?.from_facility_id;
            const toId = t.transfer?.to_facility_id;
            const status = t.transfer?.status;

            // Xuất điều chuyển (from_facility): ghi nhận khi phiếu ở trạng thái PENDING hoặc COMPLETED
            if (status === 'PENDING' || status === 'COMPLETED') {
                if (!facilityId || fromId === facilityId) {
                    movements.push({
                        voucherId: t.transfer?.id,
                        date: t.transfer?.transfer_date,
                        code: t.transfer?.code,
                        type: 'Xuất điều chuyển',
                        partner: `Tới: ${t.transfer?.to_facility?.name || ''}`,
                        facility_id: fromId,
                        note: t.notes,
                        qty_in: 0,
                        qty_out: t.quantity,
                        price: 0
                    });
                }
            }
            
            // Nhập điều chuyển (to_facility): CHỈ ghi nhận khi phiếu đã COMPLETED (Hà Nội nhận hàng)
            if (status === 'COMPLETED') {
                if (!facilityId || toId === facilityId) {
                    movements.push({
                        voucherId: t.transfer?.id,
                        date: t.transfer?.transfer_date,
                        code: t.transfer?.code,
                        type: 'Nhập điều chuyển',
                        partner: `Từ: ${t.transfer?.from_facility?.name || ''}`,
                        facility_id: toId,
                        note: t.notes,
                        qty_in: t.quantity,
                        qty_out: 0,
                        price: 0
                    });
                }
            }
        });

        // Scrapping — outgoing at facility_id (Only COMPLETED/APPROVED)
        scrapping.data?.forEach((sc: any) => {
            const status = sc.voucher?.status;
            if (status !== 'COMPLETED' && status !== 'APPROVED') return;

            const fid = sc.voucher?.facility_id;
            if (facilityId && fid !== facilityId) return;
            movements.push({
                voucherId: sc.voucher?.id,
                date: sc.voucher?.scrapping_date,
                code: sc.voucher?.code,
                type: 'Hủy hàng',
                partner: 'Nội bộ',
                facility_id: fid,
                note: sc.notes,
                qty_in: 0,
                qty_out: sc.quantity,
                price: 0
            });
        });

        // Returns — facility comes from related order (Only COMPLETED/APPROVED)
        const returnRows = returns.data || [];
        let returnFacilityMap = new Map<string, string>();
        
        // Lọc những returnRows có status COMPLETED hoặc APPROVED trước khi map facility
        const validReturnRows = returnRows.filter((r: any) => r.voucher?.status === 'COMPLETED' || r.voucher?.status === 'APPROVED');
        
        if (validReturnRows.length > 0) {
            const orderIds = Array.from(new Set(validReturnRows.map((r: any) => r.voucher?.related_order_id).filter(Boolean)));
            if (orderIds.length > 0) {
                const [{ data: so }, { data: po }] = await Promise.all([
                    supabase.from('vgvina_sales_orders').select('id, facility_id').in('id', orderIds),
                    supabase.from('vgvina_purchase_orders').select('id, facility_id').in('id', orderIds),
                ]);
                so?.forEach((o: any) => returnFacilityMap.set(o.id, o.facility_id));
                po?.forEach((o: any) => { if (!returnFacilityMap.has(o.id)) returnFacilityMap.set(o.id, o.facility_id); });
            }
        }

        validReturnRows.forEach((r: any) => {
            const fid = returnFacilityMap.get(r.voucher?.related_order_id);
            if (facilityId && fid !== facilityId) return;
            movements.push({
                voucherId: r.voucher?.id,
                date: r.voucher?.return_date,
                code: r.voucher?.code,
                type: 'Trả hàng',
                partner: 'Khách hàng',
                facility_id: fid,
                note: r.notes,
                qty_in: r.quantity,
                qty_out: 0,
                price: r.price
            });
        });

        movements.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        let currentBalance = 0;
        return movements.map(m => {
            currentBalance = round4(currentBalance + Number(m.qty_in) - Number(m.qty_out));
            return { ...m, balance: currentBalance };
        });
    },

    async getProductSalesReport(startDate?: string, endDate?: string, facilityId?: string) {
        let query = supabase
            .from('vgvina_sales_order_items')
            .select(`
                quantity,
                price,
                product:product_id ( id, sku, name, unit, price, category:vgvina_product_categories(name) ),
                order:order_id!inner ( order_date, facility_id, status )
            `)
            .in('order.status', ['COMPLETED', 'DELIVERED']);

        let retQuery = supabase
            .from('vgvina_return_voucher_items')
            .select(`
                quantity,
                price,
                product:product_id ( id, sku, name, unit, price, category:vgvina_product_categories(name) ),
                voucher:return_id!inner ( return_date, related_order_id, status )
            `)
            .in('voucher.status', ['COMPLETED', 'APPROVED']);

        if (startDate) {
            query = query.gte('order.order_date', startDate);
            retQuery = retQuery.gte('voucher.return_date', startDate);
        }
        if (endDate) {
            query = query.lte('order.order_date', endDate);
            retQuery = retQuery.lte('voucher.return_date', endDate);
        }
        if (facilityId) {
            query = query.eq('order.facility_id', facilityId);
        }

        const [salesRes, retRes] = await Promise.all([query, retQuery]);
        if (salesRes.error) throw salesRes.error;
        if (retRes.error) throw retRes.error;

        const reportMap: Record<string, any> = {};
        const ensureItem = (p: any) => {
            if (!reportMap[p.id]) {
                reportMap[p.id] = {
                    productId: p.id,
                    sku: p.sku,
                    name: p.name,
                    category: p.category?.name || 'Chưa phân loại',
                    unit: p.unit,
                    totalQty: 0,
                    totalRevenue: 0,
                    totalCost: 0,
                    returnQty: 0,
                    returnVal: 0
                };
            }
        };

        salesRes.data?.forEach((item: any) => {
            const p = item.product;
            if (!p) return;
            ensureItem(p);
            reportMap[p.id].totalQty += item.quantity;
            reportMap[p.id].totalRevenue += Math.round(item.quantity * item.price);
            reportMap[p.id].totalCost += (item.quantity * (p.price || 0));
        });

        let orderFacilityMap = new Map();
        if (facilityId && retRes.data?.length) {
            const orderIds = Array.from(new Set(retRes.data.map((r: any) => r.voucher?.related_order_id).filter(Boolean)));
            if (orderIds.length > 0) {
                const { data: salesOrders } = await supabase.from('vgvina_sales_orders').select('id, facility_id').in('id', orderIds);
                salesOrders?.forEach(so => orderFacilityMap.set(so.id, so.facility_id));
            }
        }

        retRes.data?.forEach((item: any) => {
            const p = item.product;
            if (!p) return;
            const itemFacilityId = orderFacilityMap.get(item.voucher?.related_order_id);
            if (facilityId && itemFacilityId !== facilityId) return;

            ensureItem(p);
            reportMap[p.id].returnQty += item.quantity;
            reportMap[p.id].returnVal += Math.round(item.quantity * item.price);
        });

        return Object.values(reportMap).map((item: any) => ({
            ...item,
            netRevenue: item.totalRevenue - item.returnVal,
            profit: (item.totalRevenue - item.returnVal) - item.totalCost
        }));
    },

    async getInventorySummaryReport(startDate?: string, endDate?: string, facilityId?: string) {
        const products = await this.getProducts(facilityId);

        const [sales, purchases, transfers, scrapping, returns] = await Promise.all([
            supabase.from('vgvina_sales_order_items').select('product_id, quantity, order:order_id!inner(order_date, facility_id, status)').in('order.status', ['COMPLETED', 'DELIVERED']),
            supabase.from('vgvina_purchase_order_items').select('product_id, quantity, order:order_id!inner(order_date, facility_id, status)').in('order.status', ['COMPLETED', 'DELIVERED']),
            supabase.from('vgvina_internal_transfer_items').select('product_id, quantity, transfer:transfer_id!inner(transfer_date, from_facility_id, to_facility_id, status)').in('transfer.status', ['PENDING', 'COMPLETED']),
            supabase.from('vgvina_scrapping_voucher_items').select('product_id, quantity, voucher:scrapping_id!inner(scrapping_date, facility_id, status)').in('voucher.status', ['COMPLETED', 'APPROVED']),
            supabase.from('vgvina_return_voucher_items').select('product_id, quantity, voucher:return_id!inner(return_date, related_order_id, status)').in('voucher.status', ['COMPLETED', 'APPROVED'])
        ]);

        const startTS = startDate ? new Date(startDate).getTime() : 0;
        const endTS = endDate ? new Date(endDate + 'T23:59:59.999Z').getTime() : Infinity;

        // Returns facility map (try sales then purchase)
        let returnFacilityMap = new Map<string, string>();
        if (returns.data?.length) {
            const orderIds = Array.from(new Set(returns.data.map((r: any) => r.voucher?.related_order_id).filter(Boolean)));
            if (orderIds.length > 0) {
                const [{ data: so }, { data: po }] = await Promise.all([
                    supabase.from('vgvina_sales_orders').select('id, facility_id').in('id', orderIds),
                    supabase.from('vgvina_purchase_orders').select('id, facility_id').in('id', orderIds),
                ]);
                so?.forEach((o: any) => returnFacilityMap.set(o.id, String(o.facility_id)));
                po?.forEach((o: any) => { if (!returnFacilityMap.has(o.id)) returnFacilityMap.set(o.id, String(o.facility_id)); });
            }
        }

        return products.map(p => {
            let beginning = 0;
            let qtyIn = 0;
            let qtyOut = 0;

            const inFacility = (fid: any) => !facilityId || fid === facilityId;

            sales.data?.forEach(s => {
                if (s.product_id !== p.id) return;
                const fid = (s.order as any).facility_id;
                if (!inFacility(fid)) return;
                const ts = new Date((s.order as any).order_date).getTime();
                if (ts < startTS) beginning -= s.quantity;
                else if (ts <= endTS) qtyOut += s.quantity;
            });

            purchases.data?.forEach(pu => {
                if (pu.product_id !== p.id) return;
                const fid = (pu.order as any).facility_id;
                if (!inFacility(fid)) return;
                const ts = new Date((pu.order as any).order_date).getTime();
                if (ts < startTS) beginning += pu.quantity;
                else if (ts <= endTS) qtyIn += pu.quantity;
            });

            transfers.data?.forEach(t => {
                if (t.product_id !== p.id) return;
                const fromId = (t.transfer as any).from_facility_id;
                const toId = (t.transfer as any).to_facility_id;
                const status = (t.transfer as any).status;
                const ts = new Date((t.transfer as any).transfer_date).getTime();

                // Ghi nhận Xuất đi (fromId): khi PENDING hoặc COMPLETED
                if (inFacility(fromId) && (status === 'PENDING' || status === 'COMPLETED')) {
                    if (ts < startTS) beginning -= t.quantity;
                    else if (ts <= endTS) qtyOut += t.quantity;
                }
                // Ghi nhận Nhập đến (toId): CHỈ khi COMPLETED
                if (inFacility(toId) && status === 'COMPLETED') {
                    if (ts < startTS) beginning += t.quantity;
                    else if (ts <= endTS) qtyIn += t.quantity;
                }
            });

            scrapping.data?.forEach(sc => {
                if (sc.product_id !== p.id) return;
                const fid = (sc.voucher as any).facility_id;
                if (!inFacility(fid)) return;
                const ts = new Date((sc.voucher as any).scrapping_date).getTime();
                if (ts < startTS) beginning -= sc.quantity;
                else if (ts <= endTS) qtyOut += sc.quantity;
            });

            returns.data?.forEach(r => {
                if (r.product_id !== p.id) return;
                const fid = returnFacilityMap.get((r.voucher as any).related_order_id);
                if (!inFacility(fid)) return;
                const ts = new Date((r.voucher as any).return_date).getTime();
                if (ts < startTS) beginning += r.quantity;
                else if (ts <= endTS) qtyIn += r.quantity;
            });

            beginning = round4(beginning);
            qtyIn = round4(qtyIn);
            qtyOut = round4(qtyOut);
            const ending = round4(beginning + qtyIn - qtyOut);

            return {
                ...p,
                beginning,
                beginningValue: beginning * (p.price || 0),
                qtyIn,
                inValue: qtyIn * (p.price || 0),
                qtyOut,
                outValue: qtyOut * (p.price || 0),
                ending,
                endValue: ending * (p.price || 0)
            };
        });
    },

    async getVoucherMovementDetails(voucherId: string, type: string) {
        if (!voucherId) return null;
        let query: any = null;

        if (type === 'Xuất lẻ (Bán)') {
            query = supabase.from('vgvina_sales_orders').select(`
                *,
                partner:customer_id(name),
                facility:facility_id(name),
                items:vgvina_sales_order_items(quantity, price, notes, product:product_id(sku, name, unit))
            `).eq('id', voucherId).single();
        } else if (type === 'Nhập kho (Mua)') {
            query = supabase.from('vgvina_purchase_orders').select(`
                *,
                partner:supplier_id(name),
                facility:facility_id(name),
                items:vgvina_purchase_order_items(quantity, price, notes, product:product_id(sku, name, unit))
            `).eq('id', voucherId).single();
        } else if (type === 'Xuất điều chuyển' || type === 'Nhập điều chuyển') {
            query = supabase.from('vgvina_internal_transfers').select(`
                *,
                from_facility:from_facility_id(name),
                to_facility:to_facility_id(name),
                items:vgvina_internal_transfer_items(quantity, notes, product:product_id(sku, name, unit))
            `).eq('id', voucherId).single();
        } else if (type === 'Hủy hàng') {
            query = supabase.from('vgvina_scrapping_vouchers').select(`
                *,
                facility:facility_id(name),
                items:vgvina_scrapping_voucher_items(quantity, notes, product:product_id(sku, name, unit))
            `).eq('id', voucherId).single();
        } else if (type === 'Trả hàng') {
            query = supabase.from('vgvina_return_vouchers').select(`
                *,
                items:vgvina_return_voucher_items(quantity, price, notes, product:product_id(sku, name, unit))
            `).eq('id', voucherId).single();
        }

        if (!query) return null;
        const { data, error } = await query;
        if (error) {
            console.error('Failed fetching full voucher details:', error);
            return null;
        }
        return data;
    },

    // Tổng giá trị tồn kho theo GIÁ VỐN (weighted average cost từ purchase orders).
    // Nếu sản phẩm chưa từng được mua → fallback về giá bán (p.price) để không bỏ sót.
    async getInventoryValueAtCost(facilityId?: string): Promise<{
        totalValue: number;
        totalQuantity: number;
        skuCount: number;
        productsWithoutCost: number; // số SKU có tồn kho nhưng không có lịch sử mua (đang fallback)
    }> {
        const products = await this.getProducts(facilityId);

        // Lấy toàn bộ purchase order items (cross-facility) để xây bản đồ giá vốn trung bình theo product_id.
        // Cost là thuộc tính của sản phẩm (lịch sử mua), không phụ thuộc kho hiện tại.
        const { data: purchaseItems, error } = await supabase
            .from('vgvina_purchase_order_items')
            .select('product_id, quantity, price, order:order_id ( status )');
        if (error) {
            console.error('Error fetching purchase items for cost calc:', error);
            throw error;
        }

        const costAcc = new Map<string, { qty: number; value: number }>();
        for (const it of (purchaseItems || []) as any[]) {
            if (it.order?.status === 'CANCELLED') continue;
            const qty = Number(it.quantity) || 0;
            const price = Number(it.price) || 0;
            if (qty <= 0) continue;
            const cur = costAcc.get(it.product_id) || { qty: 0, value: 0 };
            cur.qty += qty;
            cur.value += qty * price;
            costAcc.set(it.product_id, cur);
        }

        let totalValue = 0;
        let totalQuantity = 0;
        let skuCount = 0;
        let productsWithoutCost = 0;

        for (const p of products) {
            const qty = Number(p.quantity) || 0;
            if (qty <= 0) continue;
            skuCount++;
            totalQuantity += qty;
            const c = costAcc.get(p.id);
            if (c && c.qty > 0) {
                totalValue += qty * (c.value / c.qty);
            } else if (p.price) {
                totalValue += qty * p.price;
                productsWithoutCost++;
            } else {
                productsWithoutCost++;
            }
        }

        return { totalValue, totalQuantity, skuCount, productsWithoutCost };
    },

    async syncInventory(productId?: string): Promise<{ product_id: string; facility_id: string; sku: string; name: string; old_quantity: number; new_quantity: number }[]> {
        const { data, error } = await supabase.rpc('sync_inventory_quantity', {
            p_product_id: productId || null
        });
        if (error) {
            console.error('Error syncing inventory:', error);
            throw error;
        }
        return data || [];
    },

    async deleteProduct(id: string) {
        // 1. Kiểm tra xem sản phẩm có phát sinh giao dịch nào không
        const [sales, purchases, transfers, scrapping, returns] = await Promise.all([
            supabase.from('vgvina_sales_order_items').select('id').eq('product_id', id).limit(1),
            supabase.from('vgvina_purchase_order_items').select('id').eq('product_id', id).limit(1),
            supabase.from('vgvina_internal_transfer_items').select('id').eq('product_id', id).limit(1),
            supabase.from('vgvina_scrapping_voucher_items').select('id').eq('product_id', id).limit(1),
            supabase.from('vgvina_return_voucher_items').select('id').eq('product_id', id).limit(1)
        ]);

        const hasTransactions = 
            (sales.data && sales.data.length > 0) ||
            (purchases.data && purchases.data.length > 0) ||
            (transfers.data && transfers.data.length > 0) ||
            (scrapping.data && scrapping.data.length > 0) ||
            (returns.data && returns.data.length > 0);

        if (hasTransactions) {
            throw new Error("Không thể xóa sản phẩm này vì đã có lịch sử nhập/xuất kho hoặc phát sinh giao dịch.");
        }

        // 2. Xóa tồn kho trong vgvina_inventory trước
        const { error: inventoryError } = await supabase
            .from('vgvina_inventory')
            .delete()
            .eq('product_id', id);

        if (inventoryError) {
            console.error("Lỗi khi xóa tồn kho chi nhánh của sản phẩm:", inventoryError);
            throw inventoryError;
        }

        // 3. Xóa sản phẩm chính
        const { error } = await supabase
            .from('vgvina_products')
            .delete()
            .eq('id', id);
            
        if (error) throw error;
    }
};
