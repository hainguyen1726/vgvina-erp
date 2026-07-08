import { supabase } from '../supabaseClient';

export const partnerFacilityService = {
    /**
     * Get facilities for a partner
     */
    async getPartnerFacilities(partnerId: string): Promise<string[]> {
        const { data, error } = await supabase
            .from('vgvina_partner_facilities')
            .select('facility_id')
            .eq('partner_id', partnerId);

        if (error) {
            console.error('Error fetching partner facilities:', error);
            throw error;
        }

        return data?.map(item => item.facility_id) || [];
    },

    /**
     * Assign facilities to partner
     */
    async assignFacilities(partnerId: string, facilityIds: string[]): Promise<void> {
        // Delete existing facilities
        const { error: deleteError } = await supabase
            .from('vgvina_partner_facilities')
            .delete()
            .eq('partner_id', partnerId);

        if (deleteError) {
            console.error('Error deleting partner facilities:', deleteError);
            throw deleteError;
        }

        // Insert new facilities
        if (facilityIds.length > 0) {
            const partnerFacilities = facilityIds.map(facilityId => ({
                partner_id: partnerId,
                facility_id: facilityId
            }));

            const { error: insertError } = await supabase
                .from('vgvina_partner_facilities')
                .insert(partnerFacilities);

            if (insertError) {
                console.error('Error inserting partner facilities:', insertError);
                throw insertError;
            }
        }
    }
};
