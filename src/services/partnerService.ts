import { supabase } from '../supabaseClient';
import { Partner, PartnerType } from '../../types';

export const partnerService = {
    async getPartners(type?: PartnerType, facilityId?: string): Promise<Partner[]> {
        let query = supabase.from('vgvina_partners').select(`
            *,
            facilities:vgvina_partner_facilities(facility_id),
            users:vgvina_partner_users(user_id)
        `);

        if (type) {
            query = query.eq('type', type);
        }

        // Filter by facility if specified
        // Note: For multi-facility, we need to check if ANY of the partner's facilities match
        if (facilityId) {
            const { data: partnerIds } = await supabase
                .from('vgvina_partner_facilities')
                .select('partner_id')
                .eq('facility_id', facilityId);

            if (partnerIds) {
                query = query.in('id', partnerIds.map(p => p.partner_id));
            } else {
                return []; // No partners in this facility
            }
        }

        const { data, error } = await query;
        if (error) {
            console.error('Error fetching partners:', error);
            throw error;
        }

        // Fetch balances for the partners
        // 1. Sales
        const { data: salesData } = await supabase
            .from('vgvina_sales_orders')
            .select('customer_id, total_amount, facility_id');

        // 2. Purchases
        const { data: purchaseData } = await supabase
            .from('vgvina_purchase_orders')
            .select('supplier_id, total_amount, facility_id');

        // 3. Transactions
        const { data: txnData } = await supabase
            .from('vgvina_financial_transactions')
            .select('partner_id, amount, type, facility_id, account:account_id ( name )');

        return data.map((item: any) => {
            const pId = item.id;
            let balance = 0;
            let totalBalance = 0;

            // Tính totalBalance (toàn hệ thống)
            if (salesData) {
                totalBalance += salesData
                    .filter(s => s.customer_id === pId)
                    .reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);
            }
            if (purchaseData) {
                totalBalance += purchaseData
                    .filter(p => p.supplier_id === pId)
                    .reduce((sum, p) => sum + (Number(p.total_amount) || 0), 0);
            }
            if (txnData) {
                const partnerTxns = txnData.filter(t => t.partner_id === pId && (t.account as any)?.name !== 'TK KN' && (t.account as any)?.name !== 'TK Nợ NCC');
                const txnSum = partnerTxns.reduce((sum, t) => {
                    const amt = Number(t.amount) || 0;
                    if (item.type === 'CUSTOMER') {
                        // For Customer: INCOME decreases debt (-), EXPENSE increases debt (+)
                        return sum + (t.type === 'INCOME' ? -amt : amt);
                    } else {
                        // For Supplier: EXPENSE decreases debt (-), INCOME increases debt (+)
                        return sum + (t.type === 'EXPENSE' ? -amt : amt);
                    }
                }, 0);
                totalBalance += txnSum;
            }

            // Tính balance (theo chi nhánh nếu có)
            if (facilityId) {
                if (salesData) {
                    balance += salesData
                        .filter(s => s.customer_id === pId && s.facility_id === facilityId)
                        .reduce((sum, s) => sum + (Number(s.total_amount) || 0), 0);
                }
                if (purchaseData) {
                    balance += purchaseData
                        .filter(p => p.supplier_id === pId && p.facility_id === facilityId)
                        .reduce((sum, p) => sum + (Number(p.total_amount) || 0), 0);
                }
                if (txnData) {
                    const partnerTxns = txnData.filter(t => t.partner_id === pId && t.facility_id === facilityId && (t.account as any)?.name !== 'TK KN' && (t.account as any)?.name !== 'TK Nợ NCC');
                    const txnSum = partnerTxns.reduce((sum, t) => {
                        const amt = Number(t.amount) || 0;
                        if (item.type === 'CUSTOMER') {
                            // For Customer: INCOME decreases debt (-), EXPENSE increases debt (+)
                            return sum + (t.type === 'INCOME' ? -amt : amt);
                        } else {
                            // For Supplier: EXPENSE decreases debt (-), INCOME increases debt (+)
                            return sum + (t.type === 'EXPENSE' ? -amt : amt);
                        }
                    }, 0);
                    balance += txnSum;
                }
            } else {
                balance = totalBalance;
            }

            return {
                id: item.id,
                name: item.name,
                type: item.type as PartnerType,
                tax_code: item.tax_code,
                address: item.address,
                phone: item.phone,
                email: item.email,
                assigned_user_ids: item.users?.map((u: any) => String(u.user_id)) || [],
                assigned_user_id: item.assigned_user_id ? String(item.assigned_user_id) : undefined,
                facility_ids: item.facilities?.map((f: any) => f.facility_id) || [],
                balance: balance,
                totalBalance: totalBalance,
                payment_term: item.payment_term,
                payment_due_days: item.payment_due_days
            };
        });
    },

    async createPartner(partner: Omit<Partner, 'id'>) {
        const { data: newPartner, error: partnerError } = await supabase
            .from('vgvina_partners')
            .insert([{
                name: partner.name,
                type: partner.type,
                tax_code: partner.tax_code,
                address: partner.address,
                phone: partner.phone,
                email: partner.email,
                assigned_user_id: partner.assigned_user_id || null,
                payment_term: partner.payment_term || null,
                payment_due_days: partner.payment_due_days || 0
            }])
            .select()
            .single();

        if (partnerError) throw partnerError;

        // Insert junction tables
        const promises = [];
        if (partner.facility_ids?.length > 0) {
            promises.push(supabase.from('vgvina_partner_facilities').insert(
                partner.facility_ids.map(fId => ({ partner_id: newPartner.id, facility_id: fId }))
            ));
        }
        if (partner.assigned_user_id) {
            promises.push(supabase.from('vgvina_partner_users').insert([{
                partner_id: newPartner.id,
                user_id: partner.assigned_user_id
            }]));
        } else if (partner.assigned_user_ids?.length > 0) {
            promises.push(supabase.from('vgvina_partner_users').insert(
                partner.assigned_user_ids.map(uId => ({ partner_id: newPartner.id, user_id: uId }))
            ));
        }

        await Promise.all(promises);
        return newPartner;
    },

    async createPartners(partners: Omit<Partner, 'id'>[]) {
        // Bulk implementation for imports (simpler, may not handle multi-assignments well without loop)
        const { data, error } = await supabase
            .from('vgvina_partners')
            .insert(partners.map(p => ({
                name: p.name,
                type: p.type,
                tax_code: p.tax_code,
                address: p.address,
                phone: p.phone,
                email: p.email,
                assigned_user_id: p.assigned_user_id || null,
                payment_term: p.payment_term || null,
                payment_due_days: p.payment_due_days || 0
            })))
            .select();

        if (error) throw error;
        return data;
    },

    async updatePartner(id: string, partner: Partial<Partner>) {
        const { data: updatedPartner, error: partnerError } = await supabase
            .from('vgvina_partners')
            .update({
                name: partner.name,
                type: partner.type,
                tax_code: partner.tax_code,
                address: partner.address,
                phone: partner.phone,
                email: partner.email,
                assigned_user_id: partner.assigned_user_id || null,
                payment_term: partner.payment_term || null,
                payment_due_days: partner.payment_due_days || 0
            })
            .eq('id', id)
            .select()
            .single();

        if (partnerError) throw partnerError;

        // Sync junction tables
        const promises = [];

        // Sync facilities
        if (partner.facility_ids !== undefined) {
            promises.push((async () => {
                await supabase.from('vgvina_partner_facilities').delete().eq('partner_id', id);
                if (partner.facility_ids.length > 0) {
                    await supabase.from('vgvina_partner_facilities').insert(
                        partner.facility_ids.map(fId => ({ partner_id: id, facility_id: fId }))
                    );
                }
            })());
        }

        // Sync users
        if (partner.assigned_user_id !== undefined || partner.assigned_user_ids !== undefined) {
            const uIdToAssign = partner.assigned_user_id || partner.assigned_user_ids?.[0];
            promises.push((async () => {
                await supabase.from('vgvina_partner_users').delete().eq('partner_id', id);
                if (uIdToAssign) {
                    await supabase.from('vgvina_partner_users').insert([{ partner_id: id, user_id: uIdToAssign }]);
                }
            })());
        }

        await Promise.all(promises);
        return updatedPartner;
    },

    async deletePartner(id: string) {
        const { error } = await supabase
            .from('vgvina_partners')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async getPartnerStatement(partnerId: string, fromDate?: string, toDate?: string, facilityId?: string) {
        // Fetch partner details first to know partner type
        const { data: partnerData, error: partnerError } = await supabase
            .from('vgvina_partners')
            .select('type')
            .eq('id', partnerId)
            .single();

        if (partnerError) throw partnerError;
        const partnerType = partnerData?.type;

        // 1. Fetch Sales Orders (increase receivable)
        let salesQuery = supabase
            .from('vgvina_sales_orders')
            .select('id, code, order_date, total_amount, notes')
            .eq('customer_id', partnerId);
        if (facilityId) salesQuery = salesQuery.eq('facility_id', facilityId);

        // 2. Fetch Purchase Orders (increase payable)
        let purchaseQuery = supabase
            .from('vgvina_purchase_orders')
            .select('id, code, order_date, total_amount, notes')
            .eq('supplier_id', partnerId);
        if (facilityId) purchaseQuery = purchaseQuery.eq('facility_id', facilityId);

        // 3. Fetch Financial Transactions (decrease debt)
        let txnQuery = supabase
            .from('vgvina_financial_transactions')
            .select('id, code, transaction_date, amount, type, description, account:account_id ( name )')
            .eq('partner_id', partnerId);
        if (facilityId) txnQuery = txnQuery.eq('facility_id', facilityId);

        // 4. Fetch Return Vouchers (decrease debt)
        let returnQuery = supabase
            .from('vgvina_return_vouchers')
            .select(`
                id, code, return_date, return_fee, discount, status, notes, handling_method, related_order_id,
                items:vgvina_return_voucher_items ( quantity, price )
            `);

        // Apply date filters if provided
        if (fromDate) {
            salesQuery = salesQuery.gte('order_date', fromDate);
            purchaseQuery = purchaseQuery.gte('order_date', fromDate);
            txnQuery = txnQuery.gte('transaction_date', fromDate);
            returnQuery = returnQuery.gte('return_date', fromDate);
        }
        if (toDate) {
            salesQuery = salesQuery.lte('order_date', toDate);
            purchaseQuery = purchaseQuery.lte('order_date', toDate);
            txnQuery = txnQuery.lte('transaction_date', toDate);
            returnQuery = returnQuery.lte('return_date', toDate);
        }

        const [sales, purchases, txns, returns] = await Promise.all([
            salesQuery,
            purchaseQuery,
            txnQuery,
            returnQuery
        ]);

        if (sales.error) throw sales.error;
        if (purchases.error) throw purchases.error;
        if (txns.error) throw txns.error;
        if (returns.error) throw returns.error;

        const salesOrderIds = (sales.data || []).map(s => s.id);
        const purchaseOrderIds = (purchases.data || []).map(p => p.id);

        // Filter returns that are related to this partner's sales or purchase orders
        const partnerReturns = (returns.data || []).filter(r => 
            salesOrderIds.includes(r.related_order_id) || purchaseOrderIds.includes(r.related_order_id)
        );

        const returnsActivities = partnerReturns
            .filter(r => r.status === 'COMPLETED' || r.status === 'APPROVED')
            .map(r => {
                const itemsTotal = (r.items || []).reduce((sum: number, item: any) => 
                    sum + Math.round(Number(item.quantity || 0) * Number(item.price || 0)), 0);
                const netTotal = itemsTotal - Number(r.return_fee || 0) - Number(r.discount || 0);

                const isCustomerReturn = salesOrderIds.includes(r.related_order_id);

                return {
                    id: r.id,
                    code: r.code,
                    date: r.return_date,
                    description: isCustomerReturn 
                        ? `Khách trả lại hàng: ${r.code}` 
                        : `Trả hàng cho nhà cung cấp: ${r.code}`,
                    increase: 0,
                    decrease: netTotal,
                    type: 'RETURN_VOUCHER',
                    notes: r.notes || ''
                };
            });

        // Combine and normalize data
        const activities = [
            ...(sales.data || []).map(s => ({
                id: s.id,
                code: s.code,
                date: s.order_date,
                description: `Hóa đơn bán hàng: ${s.code}`,
                increase: s.total_amount, // For customer, this increases receivable
                decrease: 0,
                type: 'SALES_ORDER',
                notes: s.notes
            })),
            ...(purchases.data || []).map(p => ({
                id: p.id,
                code: p.code,
                date: p.order_date,
                description: `Hóa đơn mua hàng: ${p.code}`,
                increase: p.total_amount, // For supplier, this increases payable
                decrease: 0,
                type: 'PURCHASE_ORDER',
                notes: p.notes
            })),
            ...(txns.data || [])
                .filter(t => (t.account as any)?.name !== 'TK KN' && (t.account as any)?.name !== 'TK Nợ NCC')
                .map(t => {
                    let increase = 0;
                    let decrease = 0;
                    if (partnerType === 'CUSTOMER') {
                        if (t.type === 'INCOME') {
                            decrease = t.amount;
                        } else {
                            increase = t.amount;
                        }
                    } else {
                        // SUPPLIER
                        if (t.type === 'EXPENSE') {
                            decrease = t.amount;
                        } else {
                            increase = t.amount;
                        }
                    }
                    return {
                        id: t.id,
                        code: t.code,
                        date: t.transaction_date,
                        description: t.description || (t.type === 'INCOME' ? 'Phiếu thu tiền' : 'Phiếu chi tiền'),
                        increase,
                        decrease,
                        type: t.type === 'INCOME' ? 'PAYMENT_RECEIVED' : 'PAYMENT_MADE',
                        notes: ''
                    };
                }),
            ...returnsActivities
        ];

        // Sort by date
        activities.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        return activities;
    },

    async transferPartner(partnerId: string, toUserId: string, reason: string, currentUserId: string): Promise<void> {
        // 1. Lấy thông tin sale hiện tại của khách hàng trước khi chuyển giao
        const { data: partnerData, error: fetchError } = await supabase
            .from('vgvina_partners')
            .select('assigned_user_id')
            .eq('id', partnerId)
            .single();
        if (fetchError) throw fetchError;
        const fromUserId = partnerData?.assigned_user_id || null;

        // Nếu sale mới trùng sale cũ thì không làm gì
        if (fromUserId && String(fromUserId) === String(toUserId)) {
            throw new Error("Không thể chuyển giao cho cùng một nhân viên Sale phụ trách hiện tại.");
        }

        // 2. Thực hiện cập nhật đối tác
        const { error: updateError } = await supabase
            .from('vgvina_partners')
            .update({ assigned_user_id: toUserId })
            .eq('id', partnerId);
        if (updateError) throw updateError;

        // 3. Đồng bộ bảng phụ vgvina_partner_users
        await supabase.from('vgvina_partner_users').delete().eq('partner_id', partnerId);
        await supabase.from('vgvina_partner_users').insert([{ partner_id: partnerId, user_id: toUserId }]);

        // 4. Lưu log lịch sử chuyển giao
        const { error: logError } = await supabase
            .from('vgvina_partner_transfers')
            .insert([{
                partner_id: partnerId,
                from_user_id: fromUserId,
                to_user_id: toUserId,
                reason: reason,
                created_by: currentUserId
            }]);
        if (logError) throw logError;
    },

    async getPartnerTransferHistory(partnerId: string): Promise<any[]> {
        const { data, error } = await supabase
            .from('vgvina_partner_transfers')
            .select(`
                id,
                partner_id,
                from_user_id,
                to_user_id,
                reason,
                created_at,
                from_user:from_user_id ( full_name ),
                to_user:to_user_id ( full_name ),
                creator:created_by ( full_name )
            `)
            .eq('partner_id', partnerId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching partner transfer history:', error);
            throw error;
        }

        return (data || []).map((t: any) => ({
            id: String(t.id),
            partner_id: t.partner_id,
            from_user_id: t.from_user_id ? String(t.from_user_id) : undefined,
            from_user_name: t.from_user?.full_name || 'Không có',
            to_user_id: String(t.to_user_id),
            to_user_name: t.to_user?.full_name || 'Không rõ',
            reason: t.reason || '',
            created_by_name: t.creator?.full_name || 'Hệ thống',
            created_at: t.created_at
        }));
    }
};
