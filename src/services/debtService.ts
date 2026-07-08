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
    }
};
