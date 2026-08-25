import { supabase } from '../supabaseClient';
import { FinancialTransaction, TransactionType } from '../../types';
import { debtService } from './debtService';

export const transactionService = {
    async revertDebtTransactions(partnerId: string, type: 'INCOME' | 'EXPENSE', amount: number) {
        if (amount <= 0) return;
        const debtType = type === 'INCOME' ? 'RECEIVABLE' : 'PAYABLE';
        let remainingRevert = amount;

        // Fetch debts that might have been paid (PAID or PARTIALLY_PAID)
        const { data: debts, error: debtsError } = await supabase
            .from('vgvina_debt_transactions')
            .select('*')
            .eq('partner_id', partnerId)
            .eq('type', debtType)
            .in('status', ['PAID', 'PARTIALLY_PAID'])
            .order('created_at', { ascending: false }); // LIFO

        if (debtsError) {
            console.error("Error fetching debts for revert:", debtsError);
            return;
        }

        if (debts && debts.length > 0) {
            for (const debt of debts) {
                if (remainingRevert <= 0) break;

                let originalDebt = 999999999999;
                if (debt.related_order_id && debt.related_order_type) {
                    const orderTable = debt.related_order_type === 'SALES' ? 'vgvina_sales_orders' : 'vgvina_purchase_orders';
                    const { data: orderData } = await supabase
                        .from(orderTable)
                        .select('total_amount, discount, amount_paid')
                        .eq('id', debt.related_order_id)
                        .single();
                    
                    if (orderData) {
                        originalDebt = Number(orderData.total_amount) - Number(orderData.discount || 0) - Number(orderData.amount_paid);
                    }
                }

                const currentAmount = Number(debt.amount) || 0;
                const maxRecoverable = originalDebt - currentAmount;

                if (maxRecoverable <= 0) continue;

                const toRecover = Math.min(remainingRevert, maxRecoverable);
                const newAmount = currentAmount + toRecover;
                
                // Determine new status
                const newStatus = newAmount >= originalDebt ? 'UNPAID' : 'PARTIALLY_PAID';

                const { error: updateError } = await supabase
                    .from('vgvina_debt_transactions')
                    .update({
                        amount: newAmount,
                        status: newStatus
                    })
                    .eq('id', debt.id);

                if (updateError) {
                    console.error(`Error reverting debt transaction ${debt.id}:`, updateError);
                }

                remainingRevert -= toRecover;
            }
        }
    },

    async settleDebtTransactions(partnerId: string, type: 'INCOME' | 'EXPENSE', amount: number) {
        if (amount <= 0) return;
        const debtType = type === 'INCOME' ? 'RECEIVABLE' : 'PAYABLE';
        let remainingPayment = amount;

        // Fetch outstanding debts
        const { data: debts, error: debtsError } = await supabase
            .from('vgvina_debt_transactions')
            .select('*')
            .eq('partner_id', partnerId)
            .eq('type', debtType)
            .in('status', ['UNPAID', 'PARTIALLY_PAID'])
            .order('created_at', { ascending: true }); // FIFO

        if (debtsError) {
            console.error("Error fetching debts for settlement:", debtsError);
            return;
        }

        if (debts && debts.length > 0) {
            for (const debt of debts) {
                if (remainingPayment <= 0) break;

                const debtAmount = Number(debt.amount) || 0;
                let updateData: any = {};

                if (remainingPayment >= debtAmount) {
                    updateData = {
                        amount: 0,
                        status: 'PAID'
                    };
                    remainingPayment -= debtAmount;
                } else {
                    updateData = {
                        amount: debtAmount - remainingPayment,
                        status: 'PARTIALLY_PAID'
                    };
                    remainingPayment = 0;
                }

                const { error: updateError } = await supabase
                    .from('vgvina_debt_transactions')
                    .update(updateData)
                    .eq('id', debt.id);

                if (updateError) {
                    console.error(`Error updating debt ${debt.id}:`, updateError);
                }
            }
        }
    },

    async getTransactions(
        type?: TransactionType | string, 
        accountId?: string, 
        facilityId?: string, 
        employeeId?: number, 
        partnerId?: string,
        startDate?: string,
        endDate?: string,
        partnerType?: 'CUSTOMER' | 'SUPPLIER'
    ): Promise<FinancialTransaction[]> {
        let query = supabase.from('vgvina_financial_transactions')
            .select(`
                *,
                partner:partner_id ( id, name, type ),
                facility:facility_id ( name ),
                category:category_id ( name ),
                account:account_id ( name ),
                assignees:vgvina_transaction_assignees (
                    employee:employee_id ( id, full_name )
                )
            `)
            .order('transaction_date', { ascending: false });

        if (type && type !== 'All') {
            query = query.eq('type', type);
        }

        if (accountId) {
            query = query.eq('account_id', accountId);
        }

        if (facilityId) {
            query = query.eq('facility_id', facilityId);
        }

        if (partnerId) {
            query = query.eq('partner_id', partnerId);
        }

        if (employeeId) {
            // Filter transactions where employeeId is in the assignees list
            query = query.filter('vgvina_transaction_assignees.employee_id', 'eq', employeeId);
        }

        if (startDate) {
            query = query.gte('transaction_date', startDate);
        }

        if (endDate) {
            query = query.lte('transaction_date', endDate);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }

        let filteredData = data || [];
        if (partnerType) {
            filteredData = filteredData.filter((item: any) => item.partner && item.partner.type === partnerType);
        }

        return filteredData.map((item: any) => {
            const assignees = item.assignees || [];
            const employee_names = assignees.map((a: any) => a.employee?.full_name).filter(Boolean);
            const employee_ids = assignees.map((a: any) => String(a.employee?.id)).filter(Boolean);

            return {
                id: item.id,
                code: item.code,
                type: item.type as TransactionType,
                transaction_date: item.transaction_date,
                amount: item.amount,
                category: item.category?.name || '',
                categoryId: item.category_id,
                description: item.description,
                partner_name: item.partner?.name,
                partnerId: item.partner_id,
                employee_ids: employee_ids,
                employee_names: employee_names,
                accountId: item.account_id,
                account_name: item.account?.name || 'N/A',
                facility_name: item.facility?.name || '',
            };
        });
    },

    async getTransactionById(id: string): Promise<FinancialTransaction | null> {
        let query = supabase.from('vgvina_financial_transactions')
            .select(`
                *,
                partner:partner_id ( name ),
                facility:facility_id ( name ),
                category:category_id ( name ),
                account:account_id ( name ),
                assignees:vgvina_transaction_assignees (
                    employee:employee_id ( id, full_name )
                )
            `)
            .eq('id', id)
            .single();

        const { data, error } = await query;
        if (error || !data) return null;

        const assignees = data.assignees || [];
        const employee_names = assignees.map((a: any) => a.employee?.full_name).filter(Boolean);
        const employee_ids = assignees.map((a: any) => String(a.employee?.id)).filter(Boolean);

        return {
            id: data.id,
            code: data.code,
            type: data.type as TransactionType,
            transaction_date: data.transaction_date,
            amount: data.amount,
            category: data.category?.name || '',
            categoryId: data.category_id,
            description: data.description,
            partner_name: data.partner?.name,
            partnerId: data.partner_id,
            employee_ids: employee_ids,
            employee_names: employee_names,
            accountId: data.account_id,
            account_name: data.account?.name || 'N/A',
            facility_name: data.facility?.name || '',
        };
    },

    async createFinancialTransaction(payload: {
        type: TransactionType;
        amount: number;
        categoryId: string;
        description: string;
        partnerId?: string;
        accountId: string;
        assignedUserIds: string[];
        transactionDate: string;
        facilityId: string;
        operatorName?: string;
    }) {
        // 1. Insert Transaction
        const { data: transaction, error: transactionError } = await supabase
            .from('vgvina_financial_transactions')
            .insert({
                code: `${payload.type === TransactionType.INCOME ? 'PT' : 'PC'}-${Date.now()}`,
                type: payload.type,
                transaction_date: payload.transactionDate,
                amount: payload.amount,
                category_id: payload.categoryId,
                description: payload.description,
                partner_id: payload.partnerId || null,
                facility_id: payload.facilityId || null,
                account_id: payload.accountId,
                employee_id: payload.assignedUserIds.length > 0 ? payload.assignedUserIds[0] : null
            })
            .select()
            .single();

        if (transactionError) throw transactionError;

        // 2. Insert Assignees
        if (payload.assignedUserIds.length > 0) {
            const assignees = payload.assignedUserIds.map(empId => ({
                transaction_id: transaction.id,
                employee_id: empId
            }));
            await supabase.from('vgvina_transaction_assignees').insert(assignees);
        }

        // --- Update Cash Account Balance ---
        const { data: account } = await supabase
            .from('vgvina_accounts')
            .select('balance')
            .eq('id', payload.accountId)
            .single();

        if (account) {
            const currentBalance = Number(account.balance) || 0;
            const amt = Number(payload.amount) || 0;
            const newBalance = payload.type === TransactionType.INCOME
                ? currentBalance + amt
                : currentBalance - amt;

            await supabase.from('vgvina_accounts').update({ balance: newBalance }).eq('id', payload.accountId);
        }

        // 3. Auto-settle Debt if partnerId is provided
        if (payload.partnerId) {
            await debtService.reconcilePartnerDebts(payload.partnerId, payload.operatorName || 'Hệ thống');
        }

        return transaction;
    },

    async deleteTransaction(id: string) {
        // 1. Fetch transaction to know amount, type, and accountId
        const { data: transaction, error: fetchError } = await supabase
            .from('vgvina_financial_transactions')
            .select('amount, type, account_id, partner_id')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error("Error fetching transaction before deletion:", fetchError);
            throw fetchError;
        }

        // Revert detailed debt transactions if partner is associated
        if (transaction && transaction.partner_id) {
            await this.revertDebtTransactions(transaction.partner_id, transaction.type, transaction.amount);
        }

        // 2. Delete the main transaction
        const { error } = await supabase
            .from('vgvina_financial_transactions')
            .delete()
            .eq('id', id);
        if (error) throw error;

        // 4. Reverse the main account balance
        if (transaction && transaction.account_id) {
            const { data: account, error: accountError } = await supabase
                .from('vgvina_accounts')
                .select('balance')
                .eq('id', transaction.account_id)
                .single();

            if (!accountError && account) {
                const currentBalance = Number(account.balance) || 0;
                const transactionAmount = Number(transaction.amount) || 0;

                // Reverse: Subtract if INCOME, add if EXPENSE
                const newBalance = transaction.type === TransactionType.INCOME
                    ? currentBalance - transactionAmount
                    : currentBalance + transactionAmount;

                const { error: balanceUpdateError } = await supabase
                    .from('vgvina_accounts')
                    .update({ balance: newBalance })
                    .eq('id', transaction.account_id);

                if (balanceUpdateError) {
                    console.error("Error reversing account balance on deletion:", balanceUpdateError);
                }
            }
        }
    },

    async updateTransaction(id: string, updates: Partial<FinancialTransaction>) {
        // 1. Fetch old transaction to reverse its effect
        const { data: oldTxn, error: fetchError } = await supabase
            .from('vgvina_financial_transactions')
            .select('amount, type, account_id, partner_id, facility_id, employee_id, code')
            .eq('id', id)
            .single();

        if (fetchError) {
            console.error("Error fetching transaction before update:", fetchError);
            throw fetchError;
        }

        // 2. Update the transaction
        const { data: updatedTxn, error } = await supabase
            .from('vgvina_financial_transactions')
            .update({
                amount: updates.amount,
                description: updates.description,
                transaction_date: updates.transaction_date,
                category_id: updates.categoryId,
                account_id: updates.accountId,
                partner_id: updates.partnerId !== undefined ? (updates.partnerId || null) : undefined
            })
            .eq('id', id)
            .select('amount, type, account_id, partner_id, facility_id, employee_id, code, transaction_date')
            .single();

        if (error) throw error;

        // 3. Synchronize date to related virtual transactions if updated
        if (updates.transaction_date) {
            const { error: relDateError } = await supabase
                .from('vgvina_financial_transactions')
                .update({ transaction_date: updates.transaction_date })
                .eq('related_transaction_id', id);

            if (relDateError) {
                console.error("Error updating related virtual transactions date:", relDateError);
            }
        }

        // 3. Update Account Balances
        if (oldTxn && updatedTxn) {
            // Case A: Changed the account entirely
            if (oldTxn.account_id !== updatedTxn.account_id) {
                // Completely reverse from old account
                if (oldTxn.account_id) {
                    const { data: oldAccount } = await supabase.from('vgvina_accounts').select('balance').eq('id', oldTxn.account_id).single();
                    if (oldAccount) {
                        const balance = Number(oldAccount.balance) || 0;
                        const amt = Number(oldTxn.amount) || 0;
                        const newOldBalance = oldTxn.type === TransactionType.INCOME ? balance - amt : balance + amt;
                        await supabase.from('vgvina_accounts').update({ balance: newOldBalance }).eq('id', oldTxn.account_id);
                    }
                }
                // Apply to new account
                if (updatedTxn.account_id) {
                    const { data: newAccount } = await supabase.from('vgvina_accounts').select('balance').eq('id', updatedTxn.account_id).single();
                    if (newAccount) {
                        const balance = Number(newAccount.balance) || 0;
                        const amt = Number(updatedTxn.amount) || 0;
                        const newNewBalance = updatedTxn.type === TransactionType.INCOME ? balance + amt : balance - amt;
                        await supabase.from('vgvina_accounts').update({ balance: newNewBalance }).eq('id', updatedTxn.account_id);
                    }
                }
            }
            // Case B: Same account, amount might have changed
            else if (oldTxn.account_id && Number(oldTxn.amount) !== Number(updatedTxn.amount)) {
                const { data: account } = await supabase.from('vgvina_accounts').select('balance').eq('id', oldTxn.account_id).single();
                if (account) {
                    const balance = Number(account.balance) || 0;
                    const oldAmt = Number(oldTxn.amount) || 0;
                    const newAmt = Number(updatedTxn.amount) || 0;
                    const difference = newAmt - oldAmt;

                    // If INCOME: increasing amount increases balance
                    // If EXPENSE: increasing amount decreases balance
                    const finalBalance = oldTxn.type === TransactionType.INCOME ? balance + difference : balance - difference;
                    await supabase.from('vgvina_accounts').update({ balance: finalBalance }).eq('id', oldTxn.account_id);
                }
            }

            // Case C: Partner changed
            if (oldTxn.partner_id !== updatedTxn.partner_id) {
                if (oldTxn.partner_id) {
                    await this.revertDebtTransactions(oldTxn.partner_id, oldTxn.type, oldTxn.amount);
                    await debtService.reconcilePartnerDebts(oldTxn.partner_id, 'Hệ thống');
                }
                if (updatedTxn.partner_id) {
                    await debtService.reconcilePartnerDebts(updatedTxn.partner_id, 'Hệ thống');
                }
            }
            // Case D: Same partner, but amount changed
            else if (oldTxn.partner_id && Number(oldTxn.amount) !== Number(updatedTxn.amount)) {
                await debtService.reconcilePartnerDebts(oldTxn.partner_id, 'Hệ thống');
            }
        }
    },

    async getCategories(type: TransactionType | string) {
        const { data, error } = await supabase
            .from('vgvina_transaction_categories')
            .select('id, name')
            .eq('type', type);

        if (error) throw error;
        return data || [];
    },

    async getFacilities() {
        const { data, error } = await supabase.from('vgvina_facilities').select('id, name');
        if (error) throw error;
        return data || [];
    },

    async getTransactionStats(filters: {
        partnerId?: string;
        facilityId?: string;
        fromDate?: string;
        toDate?: string;
    }) {
        let query = supabase.from('vgvina_financial_transactions').select('amount, type, partner_id');

        if (filters.partnerId) query = query.eq('partner_id', filters.partnerId);
        if (filters.facilityId && filters.facilityId !== 'all') query = query.eq('facility_id', filters.facilityId);
        if (filters.fromDate) query = query.gte('transaction_date', filters.fromDate);
        if (filters.toDate) query = query.lte('transaction_date', filters.toDate);

        const { data, error } = await query;
        if (error) throw error;

        const income = data
            .filter(t => t.type === TransactionType.INCOME)
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const expense = data
            .filter(t => t.type === TransactionType.EXPENSE && t.partner_id)
            .reduce((sum, t) => sum + Number(t.amount), 0);

        return { income, expense };
    },

    async getAccountLedgerTransactions(accountName: 'TK KN' | 'TK Nợ NCC'): Promise<FinancialTransaction[]> {
        const isKn = accountName === 'TK KN';

        // 1. Fetch financial transactions for CUSTOMER or SUPPLIER
        const targetPartnerType = isKn ? 'CUSTOMER' : 'SUPPLIER';
        const finTxns = await this.getTransactions('All', undefined, undefined, undefined, undefined, undefined, undefined, targetPartnerType);

        // 2. Fetch orders (Sales Orders for TK KN, Purchase Orders for TK Nợ NCC)
        let orderActivities: FinancialTransaction[] = [];

        if (isKn) {
            const { data: salesData } = await supabase
                .from('vgvina_sales_orders')
                .select(`
                    id, code, total_amount, order_date, notes,
                    customer:customer_id ( name ),
                    facility:facility_id ( name )
                `)
                .order('order_date', { ascending: false });

            (salesData || []).forEach((s: any) => {
                const amt = Number(s.total_amount) || 0;
                if (amt <= 0) return;
                orderActivities.push({
                    id: `sales_${s.id}`,
                    code: s.code,
                    type: TransactionType.EXPENSE, // For TK KN: EXPENSE represents increase in customer debt (+)
                    transaction_date: s.order_date,
                    amount: amt,
                    category: 'Bán hàng',
                    categoryId: '',
                    description: `Hóa đơn bán hàng: ${s.code}`,
                    facility_name: s.facility?.name || '',
                    partner_name: s.customer?.name || 'Khách hàng',
                    partnerId: s.customer_id,
                    account_name: 'TK KN',
                    accountId: '',
                    employee_ids: [],
                    employee_names: []
                });
            });
        } else {
            const { data: purchaseData } = await supabase
                .from('vgvina_purchase_orders')
                .select(`
                    id, code, total_amount, order_date, notes,
                    supplier:supplier_id ( name ),
                    facility:facility_id ( name )
                `)
                .order('order_date', { ascending: false });

            (purchaseData || []).forEach((p: any) => {
                const amt = Number(p.total_amount) || 0;
                if (amt <= 0) return;
                orderActivities.push({
                    id: `purchase_${p.id}`,
                    code: p.code,
                    type: TransactionType.INCOME, // For TK Nợ NCC: INCOME represents increase in supplier debt liability (-)
                    transaction_date: p.order_date,
                    amount: amt,
                    category: 'Mua hàng',
                    categoryId: '',
                    description: `Hóa đơn mua hàng: ${p.code}`,
                    facility_name: p.facility?.name || '',
                    partner_name: p.supplier?.name || 'Nhà cung cấp',
                    partnerId: p.supplier_id,
                    account_name: 'TK Nợ NCC',
                    accountId: '',
                    employee_ids: [],
                    employee_names: []
                });
            });
        }

        // 3. Fetch Return Vouchers
        let returnActivities: FinancialTransaction[] = [];
        const { data: returnData } = await supabase
            .from('vgvina_return_vouchers')
            .select(`
                id, code, created_at, return_fee, discount, status, related_order_id,
                items:vgvina_return_voucher_items ( quantity, price )
            `);

        if (returnData && returnData.length > 0) {
            const orderIds = returnData.map((r: any) => r.related_order_id).filter(Boolean);
            let salesMap = new Map<string, any>();
            let purchaseMap = new Map<string, any>();

            if (orderIds.length > 0) {
                const { data: sales } = await supabase.from('vgvina_sales_orders').select('id, code, customer_id, customer:customer_id(name)').in('id', orderIds);
                (sales || []).forEach(s => salesMap.set(s.id, s));

                const { data: purchases } = await supabase.from('vgvina_purchase_orders').select('id, code, supplier_id, supplier:supplier_id(name)').in('id', orderIds);
                (purchases || []).forEach(p => purchaseMap.set(p.id, p));
            }

            (returnData || []).forEach((r: any) => {
                if (r.status !== 'COMPLETED' && r.status !== 'APPROVED') return;
                const itemsTotal = (r.items || []).reduce((sum: number, item: any) => 
                    sum + Math.round(Number(item.quantity || 0) * Number(item.price || 0)), 0);
                const netTotal = itemsTotal - Number(r.return_fee || 0) - Number(r.discount || 0);
                if (netTotal <= 0) return;

                const salesMatch = salesMap.get(r.related_order_id);
                const purchaseMatch = purchaseMap.get(r.related_order_id);

                if (isKn && salesMatch) {
                    returnActivities.push({
                        id: `return_${r.id}`,
                        code: r.code,
                        type: TransactionType.INCOME, // For TK KN: INCOME represents decrease in customer debt (-)
                        transaction_date: r.created_at,
                        amount: netTotal,
                        category: 'Trả hàng',
                        categoryId: '',
                        description: `Khách trả hàng: ${r.code}`,
                        facility_name: '',
                        partner_name: salesMatch.customer?.name || 'Khách hàng',
                        partnerId: salesMatch.customer_id,
                        account_name: 'TK KN',
                        accountId: '',
                        employee_ids: [],
                        employee_names: []
                    });
                } else if (!isKn && purchaseMatch) {
                    returnActivities.push({
                        id: `return_${r.id}`,
                        code: r.code,
                        type: TransactionType.EXPENSE, // For TK Nợ NCC: EXPENSE represents decrease in supplier debt liability (+)
                        transaction_date: r.created_at,
                        amount: netTotal,
                        category: 'Trả hàng',
                        categoryId: '',
                        description: `Trả hàng nhà cung cấp: ${r.code}`,
                        facility_name: '',
                        partner_name: purchaseMatch.supplier?.name || 'Nhà cung cấp',
                        partnerId: purchaseMatch.supplier_id,
                        account_name: 'TK Nợ NCC',
                        accountId: '',
                        employee_ids: [],
                        employee_names: []
                    });
                }
            });
        }

        // Combine and sort by date descending
        const allLedger = [...finTxns, ...orderActivities, ...returnActivities];
        allLedger.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
        return allLedger;
    }
};
