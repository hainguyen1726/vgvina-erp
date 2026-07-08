import { supabase } from '../supabaseClient';
import { User, EmployeeStatus } from '../../types';

export const authService = {
    async login(username: string): Promise<User | null> {
        // Simple lookup by username for now as per "Custom User Table" requirement without complex auth flow yet
        const { data, error } = await supabase
            .from('vgvina_users')
            .select('*, facility:vgvina_facilities(name)')
            .eq('username', username)
            .single();

        if (error) {
            console.error('Login error:', error);
            return null;
        }

        if (!data) return null;

        return {
            id: data.id,
            full_name: data.full_name,
            phone: data.phone_number,
            facility_name: data.facility?.name || '',
            status: data.status === 'Active' ? EmployeeStatus.DANG_LAM_VIEC : EmployeeStatus.DA_NGHI_VIEC,
            role: data.role,
            email: data.email
        };
    }
};
