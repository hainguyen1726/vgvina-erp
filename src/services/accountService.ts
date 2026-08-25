import { supabase } from '../supabaseClient';
import { partnerService } from './partnerService';
import { AdminAccount } from '../../types';

export const accountService = {
    async getAccounts(): Promise<AdminAccount[]> {
        const { data: accountsData, error } = await supabase
            .from('vgvina_accounts')
            .select('*');

        if (error) {
            console.error('Error fetching accounts:', error);
            throw error;
        }

        // Fetch transaction totals to ensure outside card balance ALWAYS matches inside detail ledger
        const { data: txns } = await supabase
            .from('vgvina_financial_transactions')
            .select('account_id, amount, type');

        const totalsByAccount: Record<string, { totalIn: number; totalOut: number }> = {};
        (txns || []).forEach((t: any) => {
            if (!t.account_id) return;
            if (!totalsByAccount[t.account_id]) {
                totalsByAccount[t.account_id] = { totalIn: 0, totalOut: 0 };
            }
            const amt = Number(t.amount) || 0;
            if (t.type === 'INCOME') totalsByAccount[t.account_id].totalIn += amt;
            else if (t.type === 'EXPENSE') totalsByAccount[t.account_id].totalOut += amt;
        });

        return accountsData.map((item: any) => {
            if (item.name === 'TK KN' || item.name === 'TK Nợ NCC') {
                const bal = Number(item.balance || 0);
                return {
                    id: item.id,
                    name: item.name,
                    balance: bal,
                    initial_balance: bal,
                    type: item.type === 'CASH' ? 'Tiền mặt' : (item.type === 'CREDIT' ? 'Thẻ tín dụng' : 'Ngân hàng'),
                    notes: item.details,
                    bank_name: item.bank_name,
                    account_number: item.account_number,
                    account_holder: item.account_holder
                };
            }

            const totals = totalsByAccount[item.id] || { totalIn: 0, totalOut: 0 };
            const netChange = totals.totalIn - totals.totalOut;
            const initBal = item.initial_balance !== undefined && item.initial_balance !== null
                ? Number(item.initial_balance)
                : (Number(item.balance || 0) - netChange);
            
            const computedBalance = initBal + netChange;

            return {
                id: item.id,
                name: item.name,
                balance: computedBalance,
                initial_balance: initBal,
                type: item.type === 'CASH' ? 'Tiền mặt' : (item.type === 'CREDIT' ? 'Thẻ tín dụng' : 'Ngân hàng'),
                notes: item.details,
                bank_name: item.bank_name,
                account_number: item.account_number,
                account_holder: item.account_holder
            };
        });
    },

    async createAccount(account: Omit<AdminAccount, 'id'>) {
        const payload: any = {
            name: account.name,
            type: account.type === 'Tiền mặt' ? 'CASH' : (account.type === 'Thẻ tín dụng' ? 'CREDIT' : 'BANK'),
            balance: account.balance,
            details: account.notes,
            bank_name: account.bank_name,
            account_number: account.account_number,
            account_holder: account.account_holder
        };

        let { data, error } = await supabase
            .from('vgvina_accounts')
            .insert({
                ...payload,
                ...(account.initial_balance !== undefined ? { initial_balance: account.initial_balance } : {})
            })
            .select()
            .single();

        if (error && (error.code === 'PGRST204' || error.code === '42703' || error.message?.includes('initial_balance'))) {
            const res = await supabase
                .from('vgvina_accounts')
                .insert(payload)
                .select()
                .single();
            data = res.data;
            error = res.error;
        }

        if (error) throw error;
        return data;
    },

    async updateAccount(id: string, updates: Partial<AdminAccount>) {
        const payload: any = {
            name: updates.name,
            type: updates.type ? (updates.type === 'Tiền mặt' ? 'CASH' : (updates.type === 'Thẻ tín dụng' ? 'CREDIT' : 'BANK')) : undefined,
            balance: updates.balance,
            details: updates.notes,
            bank_name: updates.bank_name,
            account_number: updates.account_number,
            account_holder: updates.account_holder
        };

        let { data, error } = await supabase
            .from('vgvina_accounts')
            .update({
                ...payload,
                ...(updates.initial_balance !== undefined ? { initial_balance: updates.initial_balance } : {})
            })
            .eq('id', id)
            .select()
            .single();

        if (error && (error.code === 'PGRST204' || error.code === '42703' || error.message?.includes('initial_balance'))) {
            const res = await supabase
                .from('vgvina_accounts')
                .update(payload)
                .eq('id', id)
                .select()
                .single();
            data = res.data;
            error = res.error;
        }

        if (error) throw error;
        return data;
    },

    async deleteAccount(id: string) {
        const { error } = await supabase
            .from('vgvina_accounts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    },

    async recalculateAccountBalance(accountId: string): Promise<number> {
        let accountData: any = null;
        let { data: accData, error: accError } = await supabase
            .from('vgvina_accounts')
            .select('name, initial_balance, balance')
            .eq('id', accountId)
            .single();

        if (accError && (accError.code === 'PGRST204' || accError.code === '42703' || accError.message?.includes('initial_balance'))) {
            const res = await supabase
                .from('vgvina_accounts')
                .select('name, balance')
                .eq('id', accountId)
                .single();
            accountData = res.data;
        } else if (accError) {
            throw accError;
        } else {
            accountData = accData;
        }

        if (accountData?.name === 'TK KN') {
            const partners = await partnerService.getPartners();
            const total = partners
                .filter(p => p.type === 'CUSTOMER')
                .reduce((s, p) => s + (Number(p.totalBalance) || 0), 0);
            await supabase.from('vgvina_accounts').update({ balance: total }).eq('id', accountId);
            return total;
        }

        if (accountData?.name === 'TK Nợ NCC') {
            const partners = await partnerService.getPartners();
            const total = partners
                .filter(p => p.type === 'SUPPLIER')
                .reduce((s, p) => s + (Number(p.totalBalance) || 0), 0);
            const bal = -total;
            await supabase.from('vgvina_accounts').update({ balance: bal }).eq('id', accountId);
            return bal;
        }

        const { data: txns, error: txnError } = await supabase
            .from('vgvina_financial_transactions')
            .select('amount, type')
            .eq('account_id', accountId);

        if (txnError) throw txnError;

        const totalIn = (txns || []).reduce((sum: any, t: any) => t.type === 'INCOME' ? sum + Number(t.amount) : sum, 0);
        const totalOut = (txns || []).reduce((sum: any, t: any) => t.type === 'EXPENSE' ? sum + Number(t.amount) : sum, 0);

        const netChange = totalIn - totalOut;
        const initialBalance = accountData?.initial_balance !== undefined && accountData?.initial_balance !== null
            ? Number(accountData.initial_balance)
            : (Number(accountData?.balance || 0) - netChange);

        const computedBalance = initialBalance + netChange;

        await supabase
            .from('vgvina_accounts')
            .update({ balance: computedBalance })
            .eq('id', accountId);

        return computedBalance;
    },

    async syncDebtAccountsBalance(): Promise<{ recBalance: number; nccBalance: number }> {
        const { data: accounts } = await supabase
            .from('vgvina_accounts')
            .select('id, name')
            .in('name', ['TK KN', 'TK Nợ NCC']);

        const tkKn = accounts?.find(a => a.name === 'TK KN');
        const tkNcc = accounts?.find(a => a.name === 'TK Nợ NCC');

        let recBalance = 0;
        let nccBalance = 0;

        if (tkKn) {
            recBalance = await this.recalculateAccountBalance(tkKn.id);
        }
        if (tkNcc) {
            nccBalance = await this.recalculateAccountBalance(tkNcc.id);
        }

        return { recBalance, nccBalance };
    },

    async recalculateAllAccountBalances(): Promise<void> {
        const { data: accounts, error } = await supabase
            .from('vgvina_accounts')
            .select('id');

        if (error) {
            console.error('Error fetching accounts for recalculation:', error);
            return;
        }

        for (const acc of accounts || []) {
            await this.recalculateAccountBalance(acc.id);
        }
    }
};

