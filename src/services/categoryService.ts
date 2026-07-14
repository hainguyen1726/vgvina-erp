import { supabase } from '../supabaseClient';

export interface Category {
    id: string;
    name: string;
    description?: string;
    type?: 'INCOME' | 'EXPENSE'; // For transaction categories
    count?: number; // Virtual count for UI
}

export const categoryService = {
    // --- Transaction Categories ---
    async getTransactionCategories(type?: 'INCOME' | 'EXPENSE'): Promise<Category[]> {
        let query = supabase.from('vgvina_transaction_categories').select('*');
        if (type) {
            query = query.eq('type', type);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data || [];
    },

    async createTransactionCategory(category: Omit<Category, 'id' | 'count'>) {
        const { data, error } = await supabase
            .from('vgvina_transaction_categories')
            .insert(category)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteTransactionCategory(id: string) {
        const { error } = await supabase.from('vgvina_transaction_categories').delete().eq('id', id);
        if (error) throw error;
    },

    // --- Product Categories ---
    async getProductCategories(): Promise<Category[]> {
        const { data, error } = await supabase.from('vgvina_product_categories').select('*');
        if (error) throw error;
        return data || [];
    },

    async createProductCategory(category: { name: string, description?: string }) {
        const { data, error } = await supabase
            .from('vgvina_product_categories')
            .insert(category)
            .select()
            .single();
        if (error) throw error;
        return data;
    },

    async deleteProductCategory(id: string) {
        const { error } = await supabase.from('vgvina_product_categories').delete().eq('id', id);
        if (error) throw error;
    },

    async updateProductCategory(id: string, category: { name: string, description?: string }) {
        const { data, error } = await supabase
            .from('vgvina_product_categories')
            .update(category)
            .eq('id', id)
            .select()
            .single();
        if (error) throw error;
        return data;
    }
};
