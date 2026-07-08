import { supabase } from '../supabaseClient';

import { AdminAccount } from '../../types';

export const accountService = {
    async getAccounts(): Promise<AdminAccount[]> {
        // Assuming we migrate vgvina_accounts table functionality. 
        // For now, if table exists we fetch, otherwise we might return mock if table empty or not perfectly aligned yet.
        // But based on schema, vgvina_accounts exists.

        const { data, error } = await supabase
            .from('vgvina_accounts')
            .select('*');

        if (error) {
            console.error('Error fetching accounts:', error);
            throw error;
        }

        return data.map((item: any) => ({
            id: item.id,
            name: item.name,
            balance: item.balance,
            type: item.type === 'CASH' ? 'Tiền mặt' : (item.type === 'CREDIT' ? 'Thẻ tín dụng' : 'Ngân hàng'),
            notes: item.details,
            bank_name: item.bank_name,
            account_number: item.account_number,
            account_holder: item.account_holder
        }));
    },

    async createAccount(account: Omit<AdminAccount, 'id'>) {
        const { data, error } = await supabase
            .from('vgvina_accounts')
            .insert({
                name: account.name,
                type: account.type === 'Tiền mặt' ? 'CASH' : (account.type === 'Thẻ tín dụng' ? 'CREDIT' : 'BANK'),
                balance: account.balance,
                details: account.notes,
                bank_name: account.bank_name,
                account_number: account.account_number,
                account_holder: account.account_holder
            })
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async updateAccount(id: string, updates: Partial<AdminAccount>) {
        const { data, error } = await supabase
            .from('vgvina_accounts')
            .update({
                name: updates.name,
                type: updates.type ? (updates.type === 'Tiền mặt' ? 'CASH' : (updates.type === 'Thẻ tín dụng' ? 'CREDIT' : 'BANK')) : undefined,
                balance: updates.balance,
                details: updates.notes,
                bank_name: updates.bank_name,
                account_number: updates.account_number,
                account_holder: updates.account_holder
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    },

    async deleteAccount(id: string) {
        const { error } = await supabase
            .from('vgvina_accounts')
            .delete()
            .eq('id', id);

        if (error) throw error;
    }
};
