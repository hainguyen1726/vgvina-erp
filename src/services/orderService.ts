import { supabase } from '../supabaseClient';
import { SalesOrder, PurchaseOrder, OrderItem, OrderStatus, TransactionType } from '../../types';

// Types for creating orders (omitting auto-generated fields)
export interface CreateOrderPayload {
    code: string;
    partnerId: string; // Customer or Supplier ID
    facilityId: string;
    assignedUserIds: string[];
    orderDate: string;
    status: OrderStatus;
    items: {
        productId: string;
        quantity: number;
        price: number;
        notes?: string;
    }[];
    totalAmount: number;
    amountPaid: number;
    discount?: number;
    notes?: string;
    accountId?: string; // Required if amountPaid > 0
}

export const orderService = {
    // NEW: Fetch recent prices for a specific partner and product
    async getRecentPrices(partnerId: string, productId: string, type: 'SALES' | 'PURCHASE', limit: number = 5) {
        const itemTable = type === 'SALES' ? 'vgvina_sales_order_items' : 'vgvina_purchase_order_items';
        const orderTable = type === 'SALES' ? 'vgvina_sales_orders' : 'vgvina_purchase_orders';
        const partnerColumn = type === 'SALES' ? 'customer_id' : 'supplier_id';

        const { data, error } = await supabase
            .from(itemTable)
            .select(`
                quantity,
                price,
                order:${orderTable}!inner (
                    code,
                    order_date,
                    status,
                    ${partnerColumn}
                )
            `)
            .eq('product_id', productId)
            .eq(`order.${partnerColumn}`, partnerId)
            .eq('order.status', 'COMPLETED')
            .order('order.order_date' as any, { ascending: false }) // Cast to any to bypass type check on joined columns, or use raw string if supported
            .limit(limit);

        if (error) {
            console.error('[orderService] Error fetching recent prices:', error);
            // Fallback: PostgREST sometimes struggles with ordering by an inner joined column directly using JS client depending on version. 
            // If it fails, we fetch without order, then sort in JS (since limit is small, this is safe enough for a fallback).
            const fallbackQuery = await supabase
                .from(itemTable)
                .select(`quantity, price, order:${orderTable}!inner(code, order_date, status, ${partnerColumn})`)
                .eq('product_id', productId)
                .eq(`order.${partnerColumn}`, partnerId)
                .eq('order.status', 'COMPLETED');
            
            if (fallbackQuery.error) throw fallbackQuery.error;
            
            return (fallbackQuery.data || [])
                .sort((a: any, b: any) => new Date(b.order.order_date).getTime() - new Date(a.order.order_date).getTime())
                .slice(0, limit)
                .map((item: any) => ({
                    code: item.order.code,
                    date: item.order.order_date,
                    quantity: item.quantity,
                    price: item.price
                }));
        }

        return (data || []).map((item: any) => ({
            code: item.order.code,
            date: item.order.order_date,
            quantity: item.quantity,
            price: item.price
        }));
    },

    async createSalesOrder(payload: CreateOrderPayload) {
        // 1. Create Order
        const { data: orderData, error: orderError } = await supabase
            .from('vgvina_sales_orders')
            .insert({
                code: payload.code,
                customer_id: payload.partnerId,
                facility_id: payload.facilityId,
                assigned_user_id: payload.assignedUserIds.length > 0 ? payload.assignedUserIds[0] : null,
                order_date: payload.orderDate,
                status: payload.status,
                total_amount: payload.totalAmount,
                amount_paid: payload.amountPaid,
                notes: payload.notes,
                account_id: payload.accountId // NEW: Save account_id
            })
            .select()
            .single();

        if (orderError) throw orderError;

        const orderId = orderData.id;

        // 2. Create Order Assignees
        if (payload.assignedUserIds.length > 0) {
            const assignees = payload.assignedUserIds.map(empId => ({
                order_id: orderId,
                employee_id: empId
            }));
            await supabase.from('vgvina_sales_order_assignees').insert(assignees);
        }

        // 3. Create Order Items
        const orderItems = payload.items.map(item => ({
            order_id: orderId,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes
        }));

        const { error: itemsError } = await supabase
            .from('vgvina_sales_order_items')
            .insert(orderItems);

        if (itemsError) {
            await supabase.from('vgvina_sales_orders').delete().eq('id', orderId);
            throw itemsError;
        }

        // 4. Handle Financial & Debt Transactions if not PENDING
        if (payload.status !== 'PENDING') {
            await this.handleTransactions(orderId, 'SALES', payload);
        }

        return orderData;
    },

    async createPurchaseOrder(payload: CreateOrderPayload) {
        // 1. Create Order
        const { data: orderData, error: orderError } = await supabase
            .from('vgvina_purchase_orders')
            .insert({
                code: payload.code,
                supplier_id: payload.partnerId,
                facility_id: payload.facilityId,
                assigned_user_id: payload.assignedUserIds.length > 0 ? payload.assignedUserIds[0] : null,
                order_date: payload.orderDate,
                status: payload.status,
                total_amount: payload.totalAmount,
                amount_paid: payload.amountPaid,
                notes: payload.notes,
                account_id: payload.accountId // NEW: Save account_id
            })
            .select()
            .single();

        if (orderError) throw orderError;

        const orderId = orderData.id;

        // 2. Create Order Assignees
        if (payload.assignedUserIds.length > 0) {
            const assignees = payload.assignedUserIds.map(empId => ({
                order_id: orderId,
                employee_id: empId
            }));
            await supabase.from('vgvina_purchase_order_assignees').insert(assignees);
        }

        // 3. Create Order Items
        const orderItems = payload.items.map(item => ({
            order_id: orderId,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes
        }));

        const { error: itemsError } = await supabase
            .from('vgvina_purchase_order_items')
            .insert(orderItems);

        if (itemsError) {
            await supabase.from('vgvina_purchase_orders').delete().eq('id', orderId);
            throw itemsError;
        }

        // 4. Handle Financial & Debt Transactions if not PENDING
        if (payload.status !== 'PENDING') {
            await this.handleTransactions(orderId, 'PURCHASE', payload);
        }

        return orderData;
    },

    async handleTransactions(orderId: string, type: 'SALES' | 'PURCHASE', payload: CreateOrderPayload) {
        const remaining = payload.totalAmount - (payload.discount || 0) - payload.amountPaid;
        const isSales = type === 'SALES';
        const defaultDebtAccountName = isSales ? 'TK KN' : 'TK Nợ NCC';

        // Helper fetch default debt account
        const { data: debtAccData } = await supabase
            .from('vgvina_accounts')
            .select('id')
            .eq('name', defaultDebtAccountName)
            .single();
        const defaultDebtAccountId = debtAccData?.id;

        // A. Financial Transaction (if paid > 0)
        if (payload.amountPaid > 0 && payload.accountId) {
            // Fetch Category ID for "Doanh thu Bán hàng" or "Chi phí nguyên vật liệu"
            const categoryName = isSales ? 'Doanh thu Bán hàng' : 'Chi phí nguyên vật liệu';
            const { data: catData } = await supabase
                .from('vgvina_transaction_categories')
                .select('id')
                .eq('name', categoryName)
                .single();

            const categoryId = catData?.id;

            // Use transactionService or manually insert
            const { data: txn } = await supabase.from('vgvina_financial_transactions').insert({
                code: `${isSales ? 'PT' : 'PC'}-${Date.now()}`,
                type: isSales ? 'INCOME' : 'EXPENSE',
                transaction_date: payload.orderDate,
                amount: payload.amountPaid,
                category_id: categoryId,
                description: `${isSales ? 'Bán' : 'Mua'} hàng theo đơn ${payload.code}`,
                partner_id: payload.partnerId,
                facility_id: payload.facilityId,
                account_id: payload.accountId,
                employee_id: payload.assignedUserIds.length > 0 ? payload.assignedUserIds[0] : null,
                related_order_id: orderId,
                related_order_type: type
            }).select().single();

            if (txn && payload.assignedUserIds.length > 0) {
                const txnAssignees = payload.assignedUserIds.map(empId => ({
                    transaction_id: txn.id,
                    employee_id: empId
                }));
                await supabase.from('vgvina_transaction_assignees').insert(txnAssignees);
            }

            // --- Update Account Balance ---
            if (payload.accountId) {
                const { data: account } = await supabase
                    .from('vgvina_accounts')
                    .select('balance')
                    .eq('id', payload.accountId)
                    .single();

                if (account) {
                    const currentBalance = Number(account.balance) || 0;
                    const transactionAmount = Number(payload.amountPaid) || 0;
                    // Sales: INCOME (+), Purchase: EXPENSE (-)
                    const newBalance = isSales
                        ? currentBalance + transactionAmount
                        : currentBalance - transactionAmount;

                    await supabase
                        .from('vgvina_accounts')
                        .update({ balance: newBalance })
                        .eq('id', payload.accountId);
                }
            }
            // --- End Update Account Balance ---
        }

        // B. Debt Transaction (if remaining > 0)
        if (remaining > 0) {
            const { data: debt } = await supabase.from('vgvina_debt_transactions').insert({
                partner_id: payload.partnerId,
                amount: remaining,
                type: isSales ? 'RECEIVABLE' : 'PAYABLE',
                due_date: null,
                status: 'UNPAID',
                facility_id: payload.facilityId,
                assigned_user_id: payload.assignedUserIds.length > 0 ? payload.assignedUserIds[0] : null,
                notes: `Công nợ từ đơn ${payload.code}`,
                related_order_id: orderId,
                related_order_type: type
            }).select().single();

            if (debt && payload.assignedUserIds.length > 0) {
                const debtAssignees = payload.assignedUserIds.map(empId => ({
                    debt_id: debt.id,
                    employee_id: empId
                }));
                await supabase.from('vgvina_debt_assignees').insert(debtAssignees);
            }

            // --- Create Financial Transaction for Debt Account and Update Balance ---
            if (defaultDebtAccountId) {
                const debtCategoryName = isSales ? 'Bán hàng (Ghi nợ)' : 'Chi phí mua hàng (Ghi nợ)';
                const { data: catData } = await supabase
                    .from('vgvina_transaction_categories')
                    .select('id')
                    .eq('name', debtCategoryName)
                    .single();

                const categoryName = isSales ? 'Doanh thu Bán hàng' : 'Chi phí nguyên vật liệu';
                const { data: defaultCatData } = await supabase.from('vgvina_transaction_categories').select('id').eq('name', categoryName).single();
                const fallbackCatId = catData?.id || defaultCatData?.id;

                const { data: debtTxn } = await supabase.from('vgvina_financial_transactions').insert({
                    code: `${isSales ? 'PT(N)' : 'PC(N)'}-${Date.now()}`,
                    type: isSales ? 'INCOME' : 'EXPENSE',
                    transaction_date: payload.orderDate,
                    amount: remaining,
                    category_id: fallbackCatId,
                    description: `Phát sinh công nợ từ đơn ${payload.code}`,
                    partner_id: payload.partnerId,
                    facility_id: payload.facilityId,
                    account_id: defaultDebtAccountId,
                    employee_id: payload.assignedUserIds.length > 0 ? payload.assignedUserIds[0] : null,
                    related_order_id: orderId,
                    related_order_type: type
                }).select().single();

                if (debtTxn && payload.assignedUserIds.length > 0) {
                    const debtTxnAssignees = payload.assignedUserIds.map(empId => ({
                        transaction_id: debtTxn.id,
                        employee_id: empId
                    }));
                    await supabase.from('vgvina_transaction_assignees').insert(debtTxnAssignees);
                }

                // Update balance of TK KN / TK Nợ NCC
                const { data: debtAccBalanceData } = await supabase.from('vgvina_accounts').select('balance').eq('id', defaultDebtAccountId).single();
                if (debtAccBalanceData) {
                    const currentDebtBalance = Number(debtAccBalanceData.balance) || 0;
                    // Tăng số nợ (dù là thu hay chi, vì sổ quỹ Nợ thể hiện bề mặt "đang bị nợ" hoặc "đang thiếu nợ")
                    // Tuy nhiên, đối với Sổ Quỹ:
                    // TK KN (Tài sản) -> Tăng -> Cộng
                    // TK Nợ NCC (Nguồn vốn) -> Tăng nợ -> Bản chất trong sổ quỹ dòng tiền là Âm, hay là ta cứ coi Nợ là Số dương đi?
                    // Theo như code transaction service: INCOME = (+), EXPENSE = (-)
                    // Phải đồng nhất logic:
                    // - Bán hàng (INCOME): Dòng tiền "ảo" vào TK KN -> Tăng số dư (Đúng, nợ phải thu tăng)
                    // - Mua hàng (EXPENSE): Dòng tiền "ảo" ra hỏi TK Nợ NCC -> Trừ số dư gốc (Số dư âm càng lớn = nợ càng nhiều)
                    const newDebtBalance = isSales
                        ? currentDebtBalance + remaining
                        : currentDebtBalance - remaining;

                    await supabase.from('vgvina_accounts').update({ balance: newDebtBalance }).eq('id', defaultDebtAccountId);
                }
            }
            // --- End Financial Transaction for Debt Account ---
        }
    },

    async getSalesOrders(facilityId?: string, employeeId?: number, startDate?: string, endDate?: string): Promise<SalesOrder[]> {
        // Try join first (preferred)
        try {
            let query = supabase
                .from('vgvina_sales_orders')
                .select(`
                    *,
                    partner:customer_id ( name ),
                    items:vgvina_sales_order_items (*, product:product_id ( id, name, sku, unit )),
                    facility:facility_id ( name ),
                    assignees:vgvina_sales_order_assignees (
                        employee:employee_id ( id, full_name )
                    )
                `)
                .order('order_date', { ascending: false });

            if (facilityId) query = query.eq('facility_id', facilityId);
            if (employeeId) query = query.filter('vgvina_sales_order_assignees.employee_id', 'eq', employeeId);
            if (startDate) query = query.gte('order_date', startDate);
            if (endDate) query = query.lte('order_date', endDate);

            const { data, error } = await query;
            if (error) throw error;

            return data.map((order: any) => ({
                ...order,
                customer_name: order.partner?.name,
                facility_name: order.facility?.name,
                items: order.items,
                assigned_user_ids: (order.assignees || []).map((a: any) => String(a.employee?.id)),
                assigned_user_names: (order.assignees || []).map((a: any) => a.employee?.full_name).filter(Boolean)
            }));
        } catch (err: any) {
            console.warn("[orderService] Sales order JOIN failed, falling back to basic fetch:", err.message);
            // Fallback: Fetch orders without assignees
            let query = supabase
                .from('vgvina_sales_orders')
                .select(`*, partner:customer_id ( name ), items:vgvina_sales_order_items (*, product:product_id ( id, name, sku, unit )), facility:facility_id ( name )`)
                .order('order_date', { ascending: false });

            if (facilityId) query = query.eq('facility_id', facilityId);
            if (startDate) query = query.gte('order_date', startDate);
            if (endDate) query = query.lte('order_date', endDate);

            const { data, error } = await query;
            if (error) throw error;

            return data.map((order: any) => ({
                ...order,
                customer_name: order.partner?.name,
                facility_name: order.facility?.name,
                items: order.items,
                assigned_user_ids: [],
                assigned_user_names: []
            }));
        }
    },

    async getSalesOrderById(id: string): Promise<SalesOrder | null> {
        const query = supabase
            .from('vgvina_sales_orders')
            .select(`
                *,
                partner:customer_id ( name ),
                items:vgvina_sales_order_items (*, product:product_id ( id, name, sku, unit )),
                facility:facility_id ( name ),
                assignees:vgvina_sales_order_assignees (
                    employee:employee_id ( id, full_name )
                )
            `)
            .eq('id', id)
            .single();

        const { data, error } = await query;
        if (error || !data) return null;

        return {
            ...data,
            customer_name: data.partner?.name,
            items: data.items,
            facility_name: data.facility?.name,
            assigned_user_ids: (data.assignees || []).map((a: any) => String(a.employee?.id)),
            assigned_user_names: (data.assignees || []).map((a: any) => a.employee?.full_name).filter(Boolean)
        };
    },

    async getPurchaseOrderById(id: string): Promise<PurchaseOrder | null> {
        const query = supabase
            .from('vgvina_purchase_orders')
            .select(`
                *,
                partner:supplier_id ( name ),
                items:vgvina_purchase_order_items (*, product:product_id ( id, name, sku, unit )),
                facility:facility_id ( name ),
                assignees:vgvina_purchase_order_assignees (
                    employee:employee_id ( id, full_name )
                )
            `)
            .eq('id', id)
            .single();

        const { data, error } = await query;
        if (error || !data) return null;

        return {
            ...data,
            supplier_name: data.partner?.name,
            items: data.items,
            facility_name: data.facility?.name,
            assigned_user_ids: (data.assignees || []).map((a: any) => String(a.employee?.id)),
            assigned_user_names: (data.assignees || []).map((a: any) => a.employee?.full_name).filter(Boolean)
        };
    },

    async getPurchaseOrders(facilityId?: string, employeeId?: number, startDate?: string, endDate?: string): Promise<PurchaseOrder[]> {
        // Try join first
        try {
            let query = supabase
                .from('vgvina_purchase_orders')
                .select(`
                    *,
                    partner:supplier_id ( name ),
                    items:vgvina_purchase_order_items (*, product:product_id ( id, name, sku, unit )),
                    facility:facility_id ( name ),
                    assignees:vgvina_purchase_order_assignees (
                        employee:employee_id ( id, full_name )
                    )
                `)
                .order('order_date', { ascending: false });

            if (facilityId) query = query.eq('facility_id', facilityId);
            if (employeeId) query = query.filter('vgvina_purchase_order_assignees.employee_id', 'eq', employeeId);
            if (startDate) query = query.gte('order_date', startDate);
            if (endDate) query = query.lte('order_date', endDate);

            const { data, error } = await query;
            if (error) throw error;

            return data.map((order: any) => ({
                ...order,
                supplier_name: order.partner?.name,
                facility_name: order.facility?.name,
                items: order.items,
                assigned_user_ids: (order.assignees || []).map((a: any) => String(a.employee?.id)),
                assigned_user_names: (order.assignees || []).map((a: any) => a.employee?.full_name).filter(Boolean)
            }));
        } catch (err: any) {
            console.warn("[orderService] Purchase order JOIN failed, falling back to basic fetch:", err.message);
            let query = supabase
                .from('vgvina_purchase_orders')
                .select(`*, partner:supplier_id ( name ), items:vgvina_purchase_order_items (*, product:product_id ( id, name, sku, unit )), facility:facility_id ( name )`)
                .order('order_date', { ascending: false });

            if (facilityId) query = query.eq('facility_id', facilityId);
            if (startDate) query = query.gte('order_date', startDate);
            if (endDate) query = query.lte('order_date', endDate);

            const { data, error } = await query;
            if (error) throw error;

            return data.map((order: any) => ({
                ...order,
                supplier_name: order.partner?.name,
                facility_name: order.facility?.name,
                items: order.items,
                assigned_user_ids: [],
                assigned_user_names: []
            }));
        }
    },

    // ============================================
    // INTERNAL TRANSFER
    // ============================================
    async createInternalTransfer(payload: {
        code: string;
        transferDate: string;
        fromFacilityId: string;
        toFacilityId: string;
        assignedUserIds: string[];
        items: {
            productId: string;
            quantity: number;
            notes?: string;
        }[];
        notes?: string;
        status?: string;
    }) {
        // 1. Create Internal Transfer record
        const { data: transferData, error: transferError } = await supabase
            .from('vgvina_internal_transfers')
            .insert({
                code: payload.code,
                transfer_date: payload.transferDate,
                from_facility_id: payload.fromFacilityId,
                to_facility_id: payload.toFacilityId,
                assigned_user_id: payload.assignedUserIds.length > 0 ? payload.assignedUserIds[0] : null,
                status: payload.status || 'PENDING',
                notes: payload.notes
            })
            .select()
            .single();

        if (transferError) throw transferError;

        const transferId = transferData.id;

        // 2. Create Transfer Assignees
        if (payload.assignedUserIds.length > 0) {
            const assignees = payload.assignedUserIds.map(empId => ({
                transfer_id: transferId,
                employee_id: empId
            }));
            await supabase.from('vgvina_internal_transfer_assignees').insert(assignees);
        }

        // 3. Create Transfer Items
        const transferItems = payload.items.map(item => ({
            transfer_id: transferId,
            product_id: item.productId,
            quantity: item.quantity,
            notes: item.notes
        }));

        const { error: itemsError } = await supabase
            .from('vgvina_internal_transfer_items')
            .insert(transferItems);

        if (itemsError) throw itemsError;

        return transferData;
    },

    async updateInternalTransfer(id: string, payload: {
        code: string;
        transferDate: string;
        fromFacilityId: string;
        toFacilityId: string;
        assignedUserIds: string[];
        items: {
            id?: string;
            productId: string;
            quantity: number;
            notes?: string;
        }[];
        notes?: string;
        status?: 'PENDING' | 'COMPLETED' | 'CANCELLED';
    }) {
        // 1. Update Internal Transfer header
        const { error: headerError } = await supabase
            .from('vgvina_internal_transfers')
            .update({
                code: payload.code,
                transfer_date: payload.transferDate,
                from_facility_id: payload.fromFacilityId,
                to_facility_id: payload.toFacilityId,
                assigned_user_id: payload.assignedUserIds.length > 0 ? payload.assignedUserIds[0] : null,
                status: payload.status || 'PENDING',
                notes: payload.notes,
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        if (headerError) throw headerError;

        // 2. Update Assignees (Simple approach: delete and re-insert)
        await supabase.from('vgvina_internal_transfer_assignees').delete().eq('transfer_id', id);
        if (payload.assignedUserIds.length > 0) {
            const assignees = payload.assignedUserIds.map(empId => ({
                transfer_id: id,
                employee_id: empId
            }));
            await supabase.from('vgvina_internal_transfer_assignees').insert(assignees);
        }

        // 3. Update Items
        // Get existing items to identify what to delete
        const { data: existingItems } = await supabase
            .from('vgvina_internal_transfer_items')
            .select('id')
            .eq('transfer_id', id);

        const existingItemIds = (existingItems || []).map(i => i.id);
        const incomingItemIds = payload.items.map(i => i.id).filter(Boolean);

        // Delete items that are no longer in the payload
        const idsToDelete = existingItemIds.filter(id => !incomingItemIds.includes(id));
        if (idsToDelete.length > 0) {
            await supabase.from('vgvina_internal_transfer_items').delete().in('id', idsToDelete);
        }

        // Upsert incoming items
        for (const item of payload.items) {
            if (item.id) {
                // Update existing
                await supabase
                    .from('vgvina_internal_transfer_items')
                    .update({
                        product_id: item.productId,
                        quantity: item.quantity,
                        notes: item.notes
                    })
                    .eq('id', item.id);
            } else {
                // Insert new
                await supabase
                    .from('vgvina_internal_transfer_items')
                    .insert({
                        transfer_id: id,
                        product_id: item.productId,
                        quantity: item.quantity,
                        notes: item.notes
                    });
            }
        }
    },

    async updateInternalTransferStatus(id: string, status: 'PENDING' | 'COMPLETED' | 'CANCELLED') {
        const { error } = await supabase
            .from('vgvina_internal_transfers')
            .update({ status })
            .eq('id', id);
        if (error) throw error;
    },

    async deleteInternalTransfer(id: string) {
        // Items will be deleted automatically if CASCADE is setup, 
        // but let's be safe if it's not
        await supabase.from('vgvina_internal_transfer_items').delete().eq('transfer_id', id);
        const { error } = await supabase.from('vgvina_internal_transfers').delete().eq('id', id);
        if (error) throw error;
    },

    // ============================================
    // RETURN VOUCHER
    // ============================================
    async createReturnVoucher(payload: {
        code: string;
        returnDate: string;
        relatedOrderId: string;
        assignedUserIds: string[];
        reason: string;
        handlingMethod: string;
        items: {
            productId: string;
            quantity: number;
            price: number;
            notes?: string;
        }[];
        returnFee?: number;
        discount?: number;
        refundAccountId?: string;
        notes?: string;
        status?: string;
        facilityId?: string;
        partnerId?: string;
    }) {
        // 1. Create Return Voucher record
        const { data: returnData, error: returnError } = await supabase
            .from('vgvina_return_vouchers')
            .insert({
                code: payload.code,
                return_date: payload.returnDate,
                related_order_id: payload.relatedOrderId,
                reason: payload.reason,
                handling_method: payload.handlingMethod,
                return_fee: payload.returnFee || 0,
                discount: payload.discount || 0,
                refund_account_id: payload.refundAccountId,
                notes: payload.notes,
                status: payload.status || 'PENDING'
            })
            .select()
            .single();

        if (returnError) throw returnError;

        const returnId = returnData.id;

        // 2. Create Return Assignees
        if (payload.assignedUserIds.length > 0) {
            const assignees = payload.assignedUserIds.map(empId => ({
                return_id: returnId,
                employee_id: empId
            }));
            await supabase.from('vgvina_return_assignees').insert(assignees);
        }

        // 3. Create Return Items
        const returnItems = payload.items.map(item => ({
            return_id: returnId,
            product_id: item.productId,
            quantity: item.quantity,
            price: item.price,
            notes: item.notes
        }));

        const { error: itemsError } = await supabase
            .from('vgvina_return_voucher_items')
            .insert(returnItems);

        if (itemsError) throw itemsError;

        // 4. If refund needed, create financial transaction
        // Only if it's not PENDING
        if (payload.status !== 'PENDING' && payload.refundAccountId && payload.items.length > 0) {
            const totalRefund = payload.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
                - (payload.returnFee || 0)
                - (payload.discount || 0);

            if (totalRefund > 0) {
                const { data: txn } = await supabase.from('vgvina_financial_transactions').insert({
                    code: `REFUND-${payload.code}`,
                    type: 'EXPENSE',
                    transaction_date: payload.returnDate,
                    amount: totalRefund,
                    description: `Hoàn tiền cho phiếu trả hàng ${payload.code}`,
                    account_id: payload.refundAccountId,
                    employee_id: payload.assignedUserIds.length > 0 ? payload.assignedUserIds[0] : null,
                    facility_id: payload.facilityId || null,
                    partner_id: payload.partnerId || null
                }).select().single();

                if (txn && payload.assignedUserIds.length > 0) {
                    const txnAssignees = payload.assignedUserIds.map(empId => ({
                        transaction_id: txn.id,
                        employee_id: empId
                    }));
                    await supabase.from('vgvina_transaction_assignees').insert(txnAssignees);
                }
            }
        }

        // 5. If "Trừ công nợ", settle outstanding debts
        if (payload.status !== 'PENDING' && payload.handlingMethod === 'Trừ công nợ' && payload.partnerId) {
            let isSales = true;
            if (payload.relatedOrderId) {
                const { data: salesOrder } = await supabase
                    .from('vgvina_sales_orders')
                    .select('id')
                    .eq('id', payload.relatedOrderId);
                isSales = !!(salesOrder && salesOrder.length > 0);
            }

            const debtType = isSales ? 'RECEIVABLE' : 'PAYABLE';
            const totalRefund = payload.items.reduce((sum, item) => sum + (item.quantity * item.price), 0)
                - (payload.returnFee || 0)
                - (payload.discount || 0);

            if (totalRefund > 0) {
                // A. Fetch outstanding debts for this partner
                const { data: debts } = await supabase
                    .from('vgvina_debt_transactions')
                    .select('*')
                    .eq('partner_id', payload.partnerId)
                    .eq('type', debtType)
                    .in('status', ['UNPAID', 'PARTIALLY_PAID'])
                    .order('created_at', { ascending: true });

                let remainingRefund = totalRefund;
                if (debts && debts.length > 0) {
                    for (const debt of debts) {
                        if (remainingRefund <= 0) break;
                        const debtAmount = Number(debt.amount);
                        let updateData = {};
                        if (remainingRefund >= debtAmount) {
                            updateData = { amount: 0, status: 'PAID' };
                            remainingRefund -= debtAmount;
                        } else {
                            updateData = { amount: debtAmount - remainingRefund, status: 'PARTIALLY_PAID' };
                            remainingRefund = 0;
                        }
                        await supabase
                            .from('vgvina_debt_transactions')
                            .update(updateData)
                            .eq('id', debt.id);
                    }
                }

                // B. Log virtual transaction in TK KN / TK Nợ NCC and update balance
                const defaultDebtAccountName = isSales ? 'TK KN' : 'TK Nợ NCC';
                const debtTxnType = isSales ? 'EXPENSE' : 'INCOME';

                const { data: debtAccData } = await supabase
                    .from('vgvina_accounts')
                    .select('id, balance')
                    .eq('name', defaultDebtAccountName)
                    .single();

                if (debtAccData) {
                    const debtAccountId = debtAccData.id;
                    const debtAccountBalance = Number(debtAccData.balance) || 0;

                    const debtCategoryName = isSales ? 'Bán hàng (Giảm nợ)' : 'Chi phí mua hàng (Giảm nợ)';
                    const { data: catData } = await supabase
                        .from('vgvina_transaction_categories')
                        .select('id')
                        .eq('name', debtCategoryName)
                        .single();
                    const categoryName = isSales ? 'Bán hàng' : 'Chi phí nguyên vật liệu';
                    const { data: defaultCatData } = await supabase.from('vgvina_transaction_categories').select('id').eq('name', categoryName).single();
                    const fallbackCatId = catData?.id || defaultCatData?.id;

                    const { data: debtTxn } = await supabase.from('vgvina_financial_transactions').insert({
                        code: `RET-DED-${payload.code}`,
                        type: debtTxnType,
                        transaction_date: payload.returnDate,
                        amount: totalRefund,
                        category_id: fallbackCatId,
                        description: `Trừ công nợ từ phiếu trả hàng ${payload.code}`,
                        partner_id: payload.partnerId,
                        facility_id: payload.facilityId || null,
                        account_id: debtAccountId,
                        employee_id: payload.assignedUserIds.length > 0 ? payload.assignedUserIds[0] : null,
                        related_order_id: returnId,
                        related_order_type: 'RETURN'
                    }).select().single();

                    if (debtTxn && payload.assignedUserIds.length > 0) {
                        const debtTxnAssignees = payload.assignedUserIds.map(empId => ({
                            transaction_id: debtTxn.id,
                            employee_id: empId
                        }));
                        await supabase.from('vgvina_transaction_assignees').insert(debtTxnAssignees);
                    }

                    // Update balance of TK KN / TK Nợ NCC
                    const newDebtBalance = debtTxnType === 'INCOME'
                        ? debtAccountBalance + totalRefund
                        : debtAccountBalance - totalRefund;

                    await supabase.from('vgvina_accounts').update({ balance: newDebtBalance }).eq('id', debtAccountId);
                }
            }
        }

        return returnData;
    },

    // ============================================
    // SCRAPPING VOUCHER
    // ============================================
    async createScrappingVoucher(payload: {
        code: string;
        scrappingDate: string;
        facilityId: string;
        assignedUserIds: string[];
        reason: string;
        items: {
            productId: string;
            quantity: number;
            notes?: string;
        }[];
        notes?: string;
        status?: string;
    }) {
        // 1. Create Scrapping Voucher record
        const { data: scrappingData, error: scrappingError } = await supabase
            .from('vgvina_scrapping_vouchers')
            .insert({
                code: payload.code,
                scrapping_date: payload.scrappingDate,
                facility_id: payload.facilityId,
                assigned_user_id: payload.assignedUserIds.length > 0 ? payload.assignedUserIds[0] : null,
                reason: payload.reason,
                notes: payload.notes,
                status: payload.status || 'PENDING'
            })
            .select()
            .single();

        if (scrappingError) throw scrappingError;

        const scrappingId = scrappingData.id;

        // 2. Create Scrapping Assignees
        if (payload.assignedUserIds.length > 0) {
            const assignees = payload.assignedUserIds.map(empId => ({
                scrapping_id: scrappingId,
                employee_id: empId
            }));
            await supabase.from('vgvina_scrapping_assignees').insert(assignees);
        }

        // 3. Create Scrapping Items
        const scrappingItems = payload.items.map(item => ({
            scrapping_id: scrappingId,
            product_id: item.productId,
            quantity: item.quantity,
            notes: item.notes
        }));

        const { error: itemsError } = await supabase
            .from('vgvina_scrapping_voucher_items')
            .insert(scrappingItems);

        if (itemsError) throw itemsError;

        return scrappingData;
    },

    async deleteReturnVoucher(id: string): Promise<void> {
        await supabase.from('vgvina_return_voucher_items').delete().eq('return_id', id);
        await supabase.from('vgvina_return_assignees').delete().eq('return_id', id);
        const { error } = await supabase.from('vgvina_return_vouchers').delete().eq('id', id);
        if (error) throw error;
    },

    async getReturnVouchers(facilityId?: string, employeeId?: number): Promise<any[]> {
        try {
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

            if (employeeId) query = query.filter('vgvina_return_assignees.employee_id', 'eq', employeeId);

            const { data: returnsData, error: returnsError } = await query;
            if (returnsError) throw returnsError;

            if (!returnsData || returnsData.length === 0) return [];

            // Fetch sales orders to match customer name and facility_id
            const { data: salesOrders, error: salesError } = await supabase
                .from('vgvina_sales_orders')
                .select('id, code, facility_id, partner:customer_id ( name )');
            if (salesError) throw salesError;

            // Fetch purchase orders to match supplier name and facility_id
            const { data: purchaseOrders, error: purchaseError } = await supabase
                .from('vgvina_purchase_orders')
                .select('id, code, facility_id, partner:supplier_id ( name )');
            if (purchaseError) throw purchaseError;

            const salesMap = new Map(salesOrders.map(o => [o.id, o]));
            const purchaseMap = new Map(purchaseOrders.map(o => [o.id, o]));

            let mappedReturns = returnsData.map((v: any) => {
                const salesOrder = salesMap.get(v.related_order_id);
                const purchaseOrder = purchaseMap.get(v.related_order_id);

                let partnerName = 'N/A';
                let relatedOrderCode = 'N/A';
                if (salesOrder) {
                    partnerName = (salesOrder.partner as any)?.name || 'N/A';
                    relatedOrderCode = salesOrder.code;
                } else if (purchaseOrder) {
                    partnerName = (purchaseOrder.partner as any)?.name || 'N/A';
                    relatedOrderCode = purchaseOrder.code;
                }

                return {
                    ...v,
                    customer_name: partnerName,
                    related_order_code: relatedOrderCode,
                    assigned_user_ids: (v.assignees || []).map((a: any) => String(a.employee?.id)),
                    assigned_user_names: (v.assignees || []).map((a: any) => a.employee?.full_name).filter(Boolean),
                    items: (v.items || []).map((i: any) => ({
                        ...i,
                        product: i.product || { name: 'Unknown', sku: 'N/A', unit: '?' }
                    })),
                    total_amount: (v.items || []).reduce((sum: number, item: any) => sum + (Number(item.quantity) * Number(item.price)), 0) - Number(v.return_fee || 0) - Number(v.discount || 0)
                };
            });

            if (facilityId) {
                mappedReturns = mappedReturns.filter((v: any) => {
                    const salesOrder = salesMap.get(v.related_order_id);
                    const purchaseOrder = purchaseMap.get(v.related_order_id);
                    const orderFacilityId = salesOrder?.facility_id || purchaseOrder?.facility_id;
                    return orderFacilityId === facilityId;
                });
            }

            return mappedReturns;
        } catch (err: any) {
            console.error("[orderService] getReturnVouchers error:", err.message);
            throw err;
        }
    },

    async getInternalTransfers(facilityId?: string, employeeId?: number): Promise<any[]> {
        try {
            let query = supabase
                .from('vgvina_internal_transfers')
                .select(`
                    *,
                    from_facility:from_facility_id ( name ),
                    to_facility:to_facility_id ( name ),
                    items:vgvina_internal_transfer_items (
                        *,
                        product:product_id ( id, name, sku, unit, price )
                    ),
                    assignees:vgvina_internal_transfer_assignees (
                        employee:employee_id ( id, full_name )
                    )
                `)
                .order('created_at', { ascending: false });

            if (facilityId) {
                query = query.or(`from_facility_id.eq.${facilityId},to_facility_id.eq.${facilityId}`);
            }
            if (employeeId) query = query.filter('vgvina_internal_transfer_assignees.employee_id', 'eq', employeeId);

            const { data, error } = await query;
            if (error) throw error;

            return data.map((v: any) => ({
                ...v,
                from_warehouse: v.from_facility?.name || 'N/A',
                to_warehouse: v.to_facility?.name || 'N/A',
                from_facility_name: v.from_facility?.name,
                to_facility_name: v.to_facility?.name,
                assigned_user_ids: (v.assignees || []).map((a: any) => String(a.employee?.id)),
                assigned_user_names: (v.assignees || []).map((a: any) => a.employee?.full_name).filter(Boolean),
                items: (v.items || []).map((i: any) => ({
                    ...i,
                    product: i.product || { name: 'Unknown', sku: 'N/A', unit: '?', price: 0 }
                }))
            }));
        } catch (err: any) {
            console.warn("[orderService] Internal transfer JOIN failed, falling back:", err.message);
            let query = supabase
                .from('vgvina_internal_transfers')
                .select(`*, from_facility:from_facility_id ( name ), to_facility:to_facility_id ( name )`)
                .order('created_at', { ascending: false });

            if (facilityId) {
                query = query.or(`from_facility_id.eq.${facilityId},to_facility_id.eq.${facilityId}`);
            }

            const { data, error } = await query;
            if (error) throw error;
            return data.map((v: any) => ({
                ...v,
                from_warehouse: v.from_facility?.name || 'N/A',
                to_warehouse: v.to_facility?.name || 'N/A',
                from_facility_name: v.from_facility?.name,
                to_facility_name: v.to_facility?.name,
                assigned_user_ids: [],
                assigned_user_names: [],
                items: []
            }));
        }
    },

    async getScrappingVouchers(facilityId?: string, employeeId?: number): Promise<any[]> {
        try {
            let query = supabase
                .from('vgvina_scrapping_vouchers')
                .select(`
                    *,
                    facility:facility_id ( name ),
                    items:vgvina_scrapping_voucher_items (
                        *,
                        product:product_id ( id, name, sku, unit, price )
                    ),
                    assignees:vgvina_scrapping_assignees (
                        employee:employee_id ( id, full_name )
                    )
                `)
                .order('created_at', { ascending: false });

            if (facilityId) query = query.eq('facility_id', facilityId);
            if (employeeId) query = query.filter('vgvina_scrapping_assignees.employee_id', 'eq', employeeId);

            const { data, error } = await query;
            if (error) throw error;

            return data.map((v: any) => ({
                ...v,
                facility_name: v.facility?.name,
                assigned_user_ids: (v.assignees || []).map((a: any) => String(a.employee?.id)),
                assigned_user_names: (v.assignees || []).map((a: any) => a.employee?.full_name).filter(Boolean),
                items: (v.items || []).map((i: any) => ({
                    ...i,
                    product: i.product || { name: 'Unknown', sku: 'N/A', unit: '?', price: 0 }
                }))
            }));
        } catch (err: any) {
            console.warn("[orderService] Scrapping voucher JOIN failed, falling back:", err.message);
            let query = supabase
                .from('vgvina_scrapping_vouchers')
                .select(`*, facility:facility_id ( name )`)
                .order('created_at', { ascending: false });

            if (facilityId) query = query.eq('facility_id', facilityId);

            const { data, error } = await query;
            if (error) throw error;
            return data.map((v: any) => ({
                ...v,
                facility_name: v.facility?.name,
                assigned_user_ids: [],
                assigned_user_names: [],
                items: []
            }));
        }
    },
    async deleteSalesOrder(id: string) {
        // 1. Cleanup transactions and reverse balances
        await this.cleanupTransactions(id, 'SALES');
        // 2. Delete items
        await supabase.from('vgvina_sales_order_items').delete().eq('order_id', id);
        // 3. Delete order
        const { error } = await supabase.from('vgvina_sales_orders').delete().eq('id', id);
        if (error) throw error;
    },

    async deletePurchaseOrder(id: string) {
        // 1. Cleanup transactions and reverse balances
        await this.cleanupTransactions(id, 'PURCHASE');
        // 2. Delete items
        await supabase.from('vgvina_purchase_order_items').delete().eq('order_id', id);
        // 3. Delete order
        const { error } = await supabase.from('vgvina_purchase_orders').delete().eq('id', id);
        if (error) throw error;
    },

    async cleanupTransactions(orderId: string, type: 'SALES' | 'PURCHASE') {
        const isSales = type === 'SALES';

        // 1. Fetch related financial transactions to reverse balances
        const { data: txns } = await supabase
            .from('vgvina_financial_transactions')
            .select('id, amount, type, account_id')
            .eq('related_order_id', orderId)
            .eq('related_order_type', type);

        if (txns && txns.length > 0) {
            for (const txn of txns) {
                if (txn.account_id) {
                    const { data: account } = await supabase
                        .from('vgvina_accounts')
                        .select('balance')
                        .eq('id', txn.account_id)
                        .single();

                    if (account) {
                        const currentBalance = Number(account.balance) || 0;
                        const amt = Number(txn.amount) || 0;
                        // Reverse: Subtract if INCOME, add if EXPENSE
                        const newBalance = txn.type === 'INCOME'
                            ? currentBalance - amt
                            : currentBalance + amt;

                        await supabase.from('vgvina_accounts').update({ balance: newBalance }).eq('id', txn.account_id);
                    }
                }
                // Delete transaction assignees
                await supabase.from('vgvina_transaction_assignees').delete().eq('transaction_id', txn.id);
            }
            // Delete transactions
            await supabase.from('vgvina_financial_transactions').delete().eq('related_order_id', orderId).eq('related_order_type', type);
        }

        // 2. Delete related debt transactions and debt assignees
        const { data: debts } = await supabase
            .from('vgvina_debt_transactions')
            .select('id')
            .eq('related_order_id', orderId)
            .eq('related_order_type', type);

        if (debts && debts.length > 0) {
            for (const debt of debts) {
                await supabase.from('vgvina_debt_assignees').delete().eq('debt_id', debt.id);
            }
            await supabase.from('vgvina_debt_transactions').delete().eq('related_order_id', orderId).eq('related_order_type', type);
        }
    },

    async updateSalesOrder(id: string, payload: Partial<CreateOrderPayload>) {
        // 1. Fetch existing order to merge and check status
        const { data: existing } = await supabase
            .from('vgvina_sales_orders')
            .select('*')
            .eq('id', id)
            .single();

        if (!existing) throw new Error("Order not found");

        const oldStatus = existing.status;
        const newStatus = payload.status || oldStatus;

        // 2. Cleanup old transactions if it was already COMPLETED
        if (oldStatus === 'COMPLETED') {
            await this.cleanupTransactions(id, 'SALES');
        }

        // 3. Update Order record (keep old status for now so item triggers are status-aware correctly)
        //    We will update the status at the end to avoid double-deduction via status-change trigger
        const { error: orderError } = await supabase
            .from('vgvina_sales_orders')
            .update({
                code: payload.code,
                customer_id: payload.partnerId,
                facility_id: payload.facilityId,
                assigned_user_id: payload.assignedUserIds && payload.assignedUserIds.length > 0 ? payload.assignedUserIds[0] : undefined,
                order_date: payload.orderDate,
                status: oldStatus, // Keep old status during item sync
                total_amount: payload.totalAmount,
                amount_paid: payload.amountPaid,
                notes: payload.notes,
                account_id: payload.accountId
            })
            .eq('id', id);

        if (orderError) throw orderError;

        if (payload.assignedUserIds) {
            await supabase.from('vgvina_sales_order_assignees').delete().eq('order_id', id);
            if (payload.assignedUserIds.length > 0) {
                const assignees = payload.assignedUserIds.map(empId => ({ order_id: id, employee_id: empId }));
                await supabase.from('vgvina_sales_order_assignees').insert(assignees);
            }
        }

        // 4. Sync items while order is in old status (so item triggers won't double-deduct)
        if (payload.items) {
            await supabase.from('vgvina_sales_order_items').delete().eq('order_id', id);
            const orderItems = payload.items.map(item => ({
                order_id: id,
                product_id: item.productId,
                quantity: item.quantity,
                price: item.price,
                notes: item.notes
            }));
            const { error: itemsError } = await supabase.from('vgvina_sales_order_items').insert(orderItems);
            if (itemsError) throw itemsError;
        }

        // 5. Now update status — if changing to COMPLETED, the DB status-change trigger fires HERE
        //    and sees the FINAL items (after sync above), so inventory is deducted exactly once
        if (newStatus !== oldStatus) {
            const { error: statusError } = await supabase
                .from('vgvina_sales_orders')
                .update({ status: newStatus })
                .eq('id', id);
            if (statusError) throw statusError;
        }

        // 6. Regenerate transactions if status is COMPLETED
        if (newStatus === 'COMPLETED') {
            const fullPayload: CreateOrderPayload = {
                code: payload.code || existing.code,
                partnerId: payload.partnerId || existing.customer_id,
                facilityId: payload.facilityId || existing.facility_id,
                assignedUserIds: payload.assignedUserIds || [],
                orderDate: payload.orderDate || existing.order_date,
                status: newStatus as OrderStatus,
                items: payload.items || [],
                totalAmount: payload.totalAmount ?? existing.total_amount,
                amountPaid: payload.amountPaid ?? existing.amount_paid,
                discount: payload.discount ?? (existing as any).discount ?? 0,
                notes: payload.notes || existing.notes,
                accountId: payload.accountId || (existing as any).account_id
            };

            if (!payload.assignedUserIds && existing.assigned_user_id) {
                fullPayload.assignedUserIds = [String(existing.assigned_user_id)];
            }

            await this.handleTransactions(id, 'SALES', fullPayload);
        }
    },


    async updatePurchaseOrder(id: string, payload: Partial<CreateOrderPayload>) {
        // 1. Fetch existing order to merge and check status
        const { data: existing } = await supabase
            .from('vgvina_purchase_orders')
            .select('*')
            .eq('id', id)
            .single();

        if (!existing) throw new Error("Order not found");

        // 2. Cleanup old transactions if it was already COMPLETED
        if (existing.status === 'COMPLETED') {
            await this.cleanupTransactions(id, 'PURCHASE');
        }

        // 3. Update Order record
        const { error: orderError } = await supabase
            .from('vgvina_purchase_orders')
            .update({
                code: payload.code,
                supplier_id: payload.partnerId,
                facility_id: payload.facilityId,
                assigned_user_id: payload.assignedUserIds && payload.assignedUserIds.length > 0 ? payload.assignedUserIds[0] : undefined,
                order_date: payload.orderDate,
                status: payload.status,
                total_amount: payload.totalAmount,
                amount_paid: payload.amountPaid,
                notes: payload.notes,
                account_id: payload.accountId // NEW: Update account_id
            })
            .eq('id', id);

        if (orderError) throw orderError;

        if (payload.assignedUserIds) {
            await supabase.from('vgvina_purchase_order_assignees').delete().eq('order_id', id);
            if (payload.assignedUserIds.length > 0) {
                const assignees = payload.assignedUserIds.map(empId => ({ order_id: id, employee_id: empId }));
                await supabase.from('vgvina_purchase_order_assignees').insert(assignees);
            }
        }

        if (payload.items) {
            await supabase.from('vgvina_purchase_order_items').delete().eq('order_id', id);
            const orderItems = payload.items.map(item => ({
                order_id: id,
                product_id: item.productId,
                quantity: item.quantity,
                price: item.price,
                notes: item.notes
            }));
            const { error: itemsError } = await supabase.from('vgvina_purchase_order_items').insert(orderItems);
            if (itemsError) throw itemsError;
        }

        // 4. Regenerate transactions if status is COMPLETED
        const newStatus = payload.status || existing.status;
        if (newStatus === 'COMPLETED') {
            const fullPayload: CreateOrderPayload = {
                code: payload.code || existing.code,
                partnerId: payload.partnerId || existing.supplier_id,
                facilityId: payload.facilityId || existing.facility_id,
                assignedUserIds: payload.assignedUserIds || [],
                orderDate: payload.orderDate || existing.order_date,
                status: newStatus as OrderStatus,
                items: payload.items || [],
                totalAmount: payload.totalAmount ?? existing.total_amount,
                amountPaid: payload.amountPaid ?? existing.amount_paid,
                discount: payload.discount ?? (existing as any).discount ?? 0,
                notes: payload.notes || existing.notes,
                accountId: payload.accountId || (existing as any).account_id
            };

            if (!payload.assignedUserIds && existing.assigned_user_id) {
                fullPayload.assignedUserIds = [String(existing.assigned_user_id)];
            }

            await this.handleTransactions(id, 'PURCHASE', fullPayload);
        }
    }
};
