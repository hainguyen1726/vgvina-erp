import { supabase } from '../supabaseClient';
import { Debt, DebtStatus } from '../../types';

export const debtService = {
    async getDebts(facilityId?: string, employeeId?: number): Promise<Debt[]> {
        let query = supabase
            .from('vgvina_debt_transactions')
            .select(`
                *,
                partner:partner_id ( name ),
                facility:facility_id ( name ),
                assignees:vgvina_debt_assignees (
                    employee:employee_id ( id, full_name )
                )
            `)
            .order('due_date', { ascending: true });

        if (facilityId) {
            query = query.eq('facility_id', facilityId);
        }

        if (employeeId) {
            query = query.filter('vgvina_debt_assignees.employee_id', 'eq', employeeId);
        }

        const { data, error } = await query;

        if (error) {
            console.error("Error fetching debts:", error);
            throw error;
        }

        return data.map((d: any) => ({
            id: d.id,
            partner_id: d.partner_id,
            partner_name: d.partner?.name,
            amount: d.amount,
            due_date: d.due_date || d.created_at, // Fallback if no due_date
            status: d.status,
            assigned_user_ids: (d.assignees || []).map((a: any) => String(a.employee?.id)),
            assigned_user_names: (d.assignees || []).map((a: any) => a.employee?.full_name).filter(Boolean),
            type: d.type,
            facility_name: d.facility?.name || d.facility_id
        }));
    },

    async updateDebt(debt: Partial<Debt>) {
        if (!debt.id) return;
        const { error } = await supabase
            .from('vgvina_debt_transactions')
            .update({
                status: debt.status,
                amount: debt.amount,
                due_date: debt.due_date
            })
            .eq('id', debt.id);

        if (error) throw error;
    },

    async createDebts(debts: Partial<Debt>[]) {
        const { data, error } = await supabase
            .from('vgvina_debt_transactions')
            .insert(debts.map(d => ({
                partner_id: d.partner_name, // Note: Assuming mapped to ID or name handling
                amount: d.amount,
                due_date: d.due_date,
                status: d.status,
                type: d.type
            })))
            .select();

        if (error) throw error;
        return data;
    },

    async deleteDebt(id: string) {
        const { error } = await supabase
            .from('vgvina_debt_transactions')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async reconcilePartnerDebts(partnerId: string, operatorName: string): Promise<void> {
        if (!partnerId) return;

        // 1. Fetch all debts of partner
        const { data: debts, error: debtsError } = await supabase
            .from('vgvina_debt_transactions')
            .select('*')
            .eq('partner_id', partnerId)
            .order('created_at', { ascending: true });

        if (debtsError) {
            console.error('[reconcilePartnerDebts] Error fetching debts:', debtsError);
            throw debtsError;
        }

        if (!debts || debts.length === 0) return;

        // 2. Fetch sales/purchase orders to find original amount
        const orderIds = debts.map(d => d.related_order_id).filter(Boolean);
        let salesOrders: any[] = [];
        let purchaseOrders: any[] = [];

        if (orderIds.length > 0) {
            const { data: sales } = await supabase
                .from('vgvina_sales_orders')
                .select('id, total_amount, discount, amount_paid')
                .in('id', orderIds);
            salesOrders = sales || [];

            const { data: purchases } = await supabase
                .from('vgvina_purchase_orders')
                .select('id, total_amount, discount, amount_paid')
                .in('id', orderIds);
            purchaseOrders = purchases || [];
        }

        const orderMap = new Map<string, number>();
        salesOrders.forEach(o => {
            const amt = Number(o.total_amount) - Number(o.discount || 0) - Number(o.amount_paid);
            orderMap.set(o.id, amt);
        });
        purchaseOrders.forEach(o => {
            const amt = Number(o.total_amount) - Number(o.discount || 0) - Number(o.amount_paid);
            orderMap.set(o.id, amt);
        });

        // 3. Reconstruct original debts amount (and clean up status back to UNPAID for calculation)
        const processedDebts = debts.map(d => {
            let originalAmount = Number(d.amount);
            if (d.related_order_id && orderMap.has(d.related_order_id)) {
                originalAmount = orderMap.get(d.related_order_id)!;
            }
            return {
                ...d,
                originalAmount,
                currentAmount: originalAmount,
                currentStatus: 'UNPAID'
            };
        });

        // 4. Fetch all real payments (exclude virtual TK KN / TK Nợ NCC account transactions)
        const { data: accounts } = await supabase
            .from('vgvina_accounts')
            .select('id, name');
        const debtAccountIds = (accounts || [])
            .filter(a => a.name === 'TK KN' || a.name === 'TK Nợ NCC')
            .map(a => a.id);

        let query = supabase
            .from('vgvina_financial_transactions')
            .select('*')
            .eq('partner_id', partnerId)
            .order('transaction_date', { ascending: true });

        if (debtAccountIds.length > 0) {
            query = query.not('account_id', 'in', `(${debtAccountIds.join(',')})`);
        }

        const { data: txns, error: txnsError } = await query;
        if (txnsError) {
            console.error('[reconcilePartnerDebts] Error fetching payment transactions:', txnsError);
            throw txnsError;
        }

        // Cash payments prefix code is usually PT- (Income) or PC- (Expense)
        const realPayments = (txns || []).filter(t => t.code.startsWith('PT-') || t.code.startsWith('PC-'));

        // 5. Apply payments to debts using FIFO
        realPayments.forEach(pay => {
            const payAmount = Number(pay.amount);
            const debtType = pay.type === 'INCOME' ? 'RECEIVABLE' : 'PAYABLE';
            let remaining = payAmount;

            for (const debt of processedDebts) {
                if (remaining <= 0) break;
                if (debt.type !== debtType || debt.currentStatus === 'PAID') continue;

                const debtAmt = debt.currentAmount;
                if (remaining >= debtAmt) {
                    remaining -= debtAmt;
                    debt.currentAmount = 0;
                    debt.currentStatus = 'PAID';
                } else {
                    debt.currentAmount = debtAmt - remaining;
                    debt.currentStatus = 'PARTIALLY_PAID';
                    remaining = 0;
                }
            }
        });

        // 6. Update database for changed debts
        for (const debt of processedDebts) {
            // Find the original DB record to check if amount or status changed
            const originalDbRecord = debts.find(d => d.id === debt.id);
            if (!originalDbRecord) continue;

            const isAmountChanged = Number(originalDbRecord.amount) !== debt.currentAmount;
            const isStatusChanged = originalDbRecord.status !== debt.currentStatus;

            if (isAmountChanged || isStatusChanged) {
                // Prepare new notes suffix with operator and date
                let baseNotes = originalDbRecord.notes || '';
                const syncNoteIdx = baseNotes.indexOf(' [Đồng bộ');
                if (syncNoteIdx !== -1) {
                    baseNotes = baseNotes.substring(0, syncNoteIdx);
                }
                const currentDateStr = new Date().toLocaleDateString('vi-VN');
                const syncNote = ` [Đồng bộ ${currentDateStr} bởi ${operatorName}]`;
                const newNotes = baseNotes + syncNote;

                const { error: updateError } = await supabase
                    .from('vgvina_debt_transactions')
                    .update({
                        amount: debt.currentAmount,
                        status: debt.currentStatus,
                        notes: newNotes
                    })
                    .eq('id', debt.id);

                if (updateError) {
                    console.error(`[reconcilePartnerDebts] Error updating debt ID ${debt.id}:`, updateError);
                }
            }
        }
    }
};
