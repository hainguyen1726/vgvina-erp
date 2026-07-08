import { supabase } from '../supabaseClient';
import { FinancialTransaction, TransactionType } from '../../types';

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

    async getTransactions(type?: TransactionType | string, accountId?: string, facilityId?: string, employeeId?: number, partnerId?: string): Promise<FinancialTransaction[]> {
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
            // Note: Supabase doesn't support complex join filtering directly in simple .select() 
            // without using a RPC or specific filter syntax if the relationship is set up.
            // For now, if we have many-to-many, we can filter by the junction table.

            // Re-fetch using the junction table filter
            query = query.filter('vgvina_transaction_assignees.employee_id', 'eq', employeeId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching transactions:', error);
            throw error;
        }

        return data.map((item: any) => {
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
                // We leave employee_id null in the main table or use the first one as primary
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

            const { error: assigneeError } = await supabase
                .from('vgvina_transaction_assignees')
                .insert(assignees);

            if (assigneeError) {
                console.error("Error inserting transaction assignees:", assigneeError);
            }
        }

        // 3. Auto-settle Debt if partnerId is provided
        if (payload.partnerId) {
            // Determine debt type to settle
            const debtType = payload.type === TransactionType.INCOME ? 'RECEIVABLE' : 'PAYABLE';
            let totalSettledAmount = 0;

            // Fetch outstanding debts for this partner
            const { data: debts, error: debtsError } = await supabase
                .from('vgvina_debt_transactions')
                .select('*')
                .eq('partner_id', payload.partnerId)
                .eq('type', debtType)
                .in('status', ['UNPAID', 'PARTIALLY_PAID'])
                .order('created_at', { ascending: true });

            if (debtsError) {
                console.error("Error fetching debts for settlement:", debtsError);
            }

            if (debts && debts.length > 0) {
                let remainingPayment = Number(payload.amount);

                for (const debt of debts) {
                    if (remainingPayment <= 0) break;

                    const debtAmount = Number(debt.amount);
                    let updateData: any = {};

                    if (remainingPayment >= debtAmount) {
                        // Debt is fully paid
                        updateData = {
                            amount: 0,
                            status: 'PAID'
                        };
                        remainingPayment -= debtAmount;
                        totalSettledAmount += debtAmount;
                    } else {
                        // Debt is partially paid
                        updateData = {
                            amount: debtAmount - remainingPayment,
                            status: 'PARTIALLY_PAID'
                        };
                        totalSettledAmount += remainingPayment;
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

            // --- Log Settlement in TK KN / TK Nợ NCC for the full transaction amount ---
            const settlementAmount = Number(payload.amount);
            if (settlementAmount > 0) {
                const defaultDebtAccountName = payload.type === TransactionType.INCOME ? 'TK KN' : 'TK Nợ NCC';

                // Determine transaction type for debt account (reverse of the cash transaction)
                // If I receive cash (INCOME) for debt -> My receivable debt decreases -> EXPENSE from TK KN
                // If I pay cash (EXPENSE) for debt -> My payable debt decreases -> INCOME to TK Nợ NCC
                const debtTxnType = payload.type === TransactionType.INCOME ? 'EXPENSE' : 'INCOME';

                const { data: debtAccData } = await supabase
                    .from('vgvina_accounts')
                    .select('id, balance')
                    .eq('name', defaultDebtAccountName)
                    .single();

                if (debtAccData) {
                    const debtAccountId = debtAccData.id;
                    const debtAccountBalance = Number(debtAccData.balance) || 0;

                    // Fallback category for debt settlement
                    const debtCategoryName = payload.type === TransactionType.INCOME ? 'Bán hàng (Giảm nợ)' : 'Chi phí mua hàng (Giảm nợ)';
                    const { data: catData } = await supabase.from('vgvina_transaction_categories').select('id').eq('name', debtCategoryName).single();
                    const categoryName = payload.type === TransactionType.INCOME ? 'Bán hàng' : 'Chi phí nguyên vật liệu';
                    const { data: defaultCatData } = await supabase.from('vgvina_transaction_categories').select('id').eq('name', categoryName).single();
                    const fallbackCatId = catData?.id || defaultCatData?.id;

                    // Insert virtual transaction for debt account
                    const { data: debtTxn } = await supabase.from('vgvina_financial_transactions').insert({
                        code: `${debtTxnType === 'INCOME' ? 'PT(N)' : 'PC(N)'}-${Date.now()}`,
                        type: debtTxnType,
                        transaction_date: payload.transactionDate,
                        amount: settlementAmount,
                        category_id: fallbackCatId,
                        description: `Giảm trừ công nợ khách hàng/NCC (Thanh toán: ${transaction.code})`,
                        partner_id: payload.partnerId,
                        facility_id: payload.facilityId || null,
                        account_id: debtAccountId,
                        employee_id: payload.assignedUserIds.length > 0 ? payload.assignedUserIds[0] : null,
                        related_transaction_id: transaction.id // Link back to original cash transaction
                    }).select().single();

                    if (debtTxn && payload.assignedUserIds.length > 0) {
                        const debtTxnAssignees = payload.assignedUserIds.map(empId => ({
                            transaction_id: debtTxn.id,
                            employee_id: empId
                        }));
                        await supabase.from('vgvina_transaction_assignees').insert(debtTxnAssignees);
                    }

                    // Update balance of TK KN / TK Nợ NCC
                    // Receivable Debt (TK KN): decrease balance (EXPENSE logic in general account is current - amt )
                    // Payable Debt (TK Nợ NCC): decrease negative balance (INCOME logic in general account is current + amt)
                    const newDebtBalance = debtTxnType === 'INCOME'
                        ? debtAccountBalance + settlementAmount
                        : debtAccountBalance - settlementAmount;

                    await supabase.from('vgvina_accounts').update({ balance: newDebtBalance }).eq('id', debtAccountId);
                }
            }
            // --- End Log Settlement ---
        }

        // 4. Update Account Balance
        if (payload.accountId) {
            // First fetch current balance
            const { data: account, error: accountError } = await supabase
                .from('vgvina_accounts')
                .select('balance')
                .eq('id', payload.accountId)
                .single();

            if (!accountError && account) {
                const currentBalance = Number(account.balance) || 0;
                const transactionAmount = Number(payload.amount);

                // Add if INCOME, subtract if EXPENSE
                const newBalance = payload.type === TransactionType.INCOME
                    ? currentBalance + transactionAmount
                    : currentBalance - transactionAmount;

                const { error: balanceUpdateError } = await supabase
                    .from('vgvina_accounts')
                    .update({ balance: newBalance })
                    .eq('id', payload.accountId);

                if (balanceUpdateError) {
                    console.error("Error updating account balance:", balanceUpdateError);
                }
            } else {
                console.error("Error fetching account for balance update:", accountError);
            }
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

        // 2. Find any related virtual debt transactions and reverse them too
        const { data: relatedTxns } = await supabase
            .from('vgvina_financial_transactions')
            .select('id, amount, type, account_id')
            .eq('related_transaction_id', id);

        if (relatedTxns && relatedTxns.length > 0) {
            for (const relTxn of relatedTxns) {
                // Reverse virtual debt account balance
                if (relTxn.account_id) {
                    const { data: debtAcc } = await supabase.from('vgvina_accounts').select('balance').eq('id', relTxn.account_id).single();
                    if (debtAcc) {
                        const currentBalance = Number(debtAcc.balance) || 0;
                        const amt = Number(relTxn.amount) || 0;
                        // Reverse: Subtract if INCOME, add if EXPENSE
                        const newBalance = relTxn.type === TransactionType.INCOME
                            ? currentBalance - amt
                            : currentBalance + amt;
                        await supabase.from('vgvina_accounts').update({ balance: newBalance }).eq('id', relTxn.account_id);
                    }
                }
                // Delete the virtual transaction
                await supabase.from('vgvina_financial_transactions').delete().eq('id', relTxn.id);
            }
        }

        // 3. Delete the main transaction
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
                // Step 1: Revert old virtual transaction
                if (oldTxn.partner_id) {
                    await this.revertDebtTransactions(oldTxn.partner_id, oldTxn.type, oldTxn.amount);
                    const { data: oldRelatedTxns } = await supabase
                        .from('vgvina_financial_transactions')
                        .select('id, amount, type, account_id')
                        .eq('related_transaction_id', id);

                    if (oldRelatedTxns && oldRelatedTxns.length > 0) {
                        for (const relTxn of oldRelatedTxns) {
                            if (relTxn.account_id) {
                                const { data: debtAcc } = await supabase.from('vgvina_accounts').select('balance').eq('id', relTxn.account_id).single();
                                if (debtAcc) {
                                    const currentBalance = Number(debtAcc.balance) || 0;
                                    const amt = Number(relTxn.amount) || 0;
                                    const newBalance = relTxn.type === TransactionType.INCOME
                                        ? currentBalance - amt
                                        : currentBalance + amt;
                                    await supabase.from('vgvina_accounts').update({ balance: newBalance }).eq('id', relTxn.account_id);
                                }
                            }
                            await supabase.from('vgvina_financial_transactions').delete().eq('id', relTxn.id);
                        }
                    }
                }

                // Step 2: Create new virtual transaction if updatedTxn has partner
                if (updatedTxn.partner_id) {
                    await this.settleDebtTransactions(updatedTxn.partner_id, updatedTxn.type, updatedTxn.amount);
                    const defaultDebtAccountName = updatedTxn.type === TransactionType.INCOME ? 'TK KN' : 'TK Nợ NCC';
                    const debtTxnType = updatedTxn.type === TransactionType.INCOME ? 'EXPENSE' : 'INCOME';

                    const { data: debtAccData } = await supabase
                        .from('vgvina_accounts')
                        .select('id, balance')
                        .eq('name', defaultDebtAccountName)
                        .single();

                    if (debtAccData) {
                        const debtAccountId = debtAccData.id;
                        const debtAccountBalance = Number(debtAccData.balance) || 0;

                        const debtCategoryName = updatedTxn.type === TransactionType.INCOME ? 'Bán hàng (Giảm nợ)' : 'Chi phí mua hàng (Giảm nợ)';
                        const { data: catData } = await supabase.from('vgvina_transaction_categories').select('id').eq('name', debtCategoryName).single();
                        const categoryName = updatedTxn.type === TransactionType.INCOME ? 'Bán hàng' : 'Chi phí nguyên vật liệu';
                        const { data: defaultCatData } = await supabase.from('vgvina_transaction_categories').select('id').eq('name', categoryName).single();
                        const fallbackCatId = catData?.id || defaultCatData?.id;

                        const { data: debtTxn } = await supabase.from('vgvina_financial_transactions').insert({
                            code: `${debtTxnType === 'INCOME' ? 'PT(N)' : 'PC(N)'}-${Date.now()}`,
                            type: debtTxnType,
                            transaction_date: updatedTxn.transaction_date,
                            amount: updatedTxn.amount,
                            category_id: fallbackCatId,
                            description: `Giảm trừ công nợ khách hàng/NCC (Thanh toán: ${updatedTxn.code})`,
                            partner_id: updatedTxn.partner_id,
                            facility_id: updatedTxn.facility_id || null,
                            account_id: debtAccountId,
                            employee_id: updatedTxn.employee_id || null,
                            related_transaction_id: id
                        }).select().single();

                        if (debtTxn && updatedTxn.employee_id) {
                            await supabase.from('vgvina_transaction_assignees').insert({
                                transaction_id: debtTxn.id,
                                employee_id: updatedTxn.employee_id
                            });
                        }

                        const newDebtBalance = debtTxnType === 'INCOME'
                            ? debtAccountBalance + Number(updatedTxn.amount)
                            : debtAccountBalance - Number(updatedTxn.amount);

                        await supabase.from('vgvina_accounts').update({ balance: newDebtBalance }).eq('id', debtAccountId);
                    }
                }
            }
            // Case D: Same partner, but amount changed
            else if (oldTxn.partner_id && Number(oldTxn.amount) !== Number(updatedTxn.amount)) {
                const difference = Number(updatedTxn.amount) - Number(oldTxn.amount);

                if (difference > 0) {
                    await this.settleDebtTransactions(updatedTxn.partner_id, updatedTxn.type, difference);
                } else if (difference < 0) {
                    await this.revertDebtTransactions(updatedTxn.partner_id, updatedTxn.type, -difference);
                }

                const { data: relatedTxns } = await supabase
                    .from('vgvina_financial_transactions')
                    .select('id, amount, type, account_id')
                    .eq('related_transaction_id', id);

                if (relatedTxns && relatedTxns.length > 0) {
                    for (const relTxn of relatedTxns) {
                        const newRelAmount = Number(relTxn.amount) + difference;

                        // Update virtual debt account balance
                        if (relTxn.account_id) {
                            const { data: debtAcc } = await supabase.from('vgvina_accounts').select('balance').eq('id', relTxn.account_id).single();
                            if (debtAcc) {
                                const balance = Number(debtAcc.balance) || 0;
                                const finalBalance = relTxn.type === TransactionType.INCOME
                                    ? balance + difference
                                    : balance - difference;
                                await supabase.from('vgvina_accounts').update({ balance: finalBalance }).eq('id', relTxn.account_id);
                            }
                        }

                        // If amount drops to 0 or below, delete it. Else update it.
                        if (newRelAmount <= 0) {
                            await supabase.from('vgvina_financial_transactions').delete().eq('id', relTxn.id);
                        } else {
                            await supabase.from('vgvina_financial_transactions').update({ amount: newRelAmount }).eq('id', relTxn.id);
                        }
                    }
                }
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
    }
};
