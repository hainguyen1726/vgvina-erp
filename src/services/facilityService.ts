import { supabase } from '../supabaseClient';

export interface Facility {
    id: string;
    name: string;
    address?: string;
    created_at?: string;
}

export const facilityService = {
    /**
     * Get all facilities
     */
    async getFacilities(): Promise<Facility[]> {
        const { data, error } = await supabase
            .from('vgvina_facilities')
            .select('*')
            .order('name', { ascending: true });

        if (error) {
            console.error('Error fetching facilities:', error);
            throw error;
        }

        return data || [];
    },

    /**
     * Get facility by ID
     */
    async getFacilityById(facilityId: string): Promise<Facility | null> {
        const { data, error } = await supabase
            .from('vgvina_facilities')
            .select('*')
            .eq('id', facilityId)
            .single();

        if (error) {
            console.error('Error fetching facility:', error);
            throw error;
        }

        return data;
    },

    /**
     * Create new facility
     */
    async createFacility(facility: {
        name: string;
        address?: string;
    }): Promise<Facility> {
        const { data, error } = await supabase
            .from('vgvina_facilities')
            .insert(facility)
            .select()
            .single();

        if (error) {
            console.error('Error creating facility:', error);
            throw error;
        }

        return data;
    },

    /**
     * Update facility
     */
    async updateFacility(facilityId: string, updates: {
        name?: string;
        address?: string;
    }): Promise<void> {
        const { error } = await supabase
            .from('vgvina_facilities')
            .update(updates)
            .eq('id', facilityId);

        if (error) {
            console.error('Error updating facility:', error);
            throw error;
        }
    },

    /**
     * Delete facility
     */
    async deleteFacility(facilityId: string): Promise<void> {
        const { error } = await supabase
            .from('vgvina_facilities')
            .delete()
            .eq('id', facilityId);

        if (error) {
            console.error('Error deleting facility:', error);
            throw error;
        }
    },

    /**
     * Get users count for a facility
     */
    async getFacilityUsersCount(facilityId: string): Promise<number> {
        const { count, error } = await supabase
            .from('vgvina_user_facilities')
            .select('*', { count: 'exact', head: true })
            .eq('facility_id', facilityId);

        if (error) {
            console.error('Error counting facility users:', error);
            throw error;
        }

        return count || 0;
    },

    /**
     * Get partners count for a facility
     */
    async getFacilityPartnersCount(facilityId: string): Promise<number> {
        const { count, error } = await supabase
            .from('vgvina_partner_facilities')
            .select('*', { count: 'exact', head: true })
            .eq('facility_id', facilityId);

        if (error) {
            console.error('Error counting facility partners:', error);
            throw error;
        }

        return count || 0;
    }
};
