import { supabase } from '../supabaseClient';

export interface Role {
    id: string;
    name: string;
    display_name: string;
    description?: string;
    is_admin: boolean;
    created_at: string;
    updated_at: string;
}

export interface Permission {
    id: string;
    module: string;
    action: string;
    display_name: string;
    description?: string;
}

export interface RoleWithPermissions extends Role {
    permissions: Permission[];
}

export const roleService = {
    /**
     * Get all roles
     */
    async getRoles(): Promise<Role[]> {
        const { data, error } = await supabase
            .from('vgvina_roles')
            .select('*')
            .order('created_at', { ascending: true });

        if (error) {
            console.error('Error fetching roles:', error);
            throw error;
        }

        console.log('[roleService] All roles fetched:', data);
        return data || [];
    },

    /**
     * Get role by ID with permissions
     */
    async getRoleById(roleId: string): Promise<RoleWithPermissions | null> {
        const { data: roleData, error: roleError } = await supabase
            .from('vgvina_roles')
            .select('*')
            .eq('id', roleId)
            .single();

        if (roleError) {
            console.error('Error fetching role:', roleError);
            throw roleError;
        }

        // Get permissions for this role
        const { data: permissionsData, error: permissionsError } = await supabase
            .from('vgvina_role_permissions')
            .select(`
                permission:vgvina_permissions (
                    id,
                    module,
                    action,
                    display_name,
                    description
                )
            `)
            .eq('role_id', roleId);

        if (permissionsError) {
            console.error('Error fetching role permissions:', permissionsError);
            throw permissionsError;
        }

        const permissions = permissionsData?.map((item: any) => item.permission) || [];

        return {
            ...roleData,
            permissions
        };
    },

    /**
     * Create new role
     */
    async createRole(role: {
        name: string;
        display_name: string;
        description?: string;
        is_admin?: boolean;
    }): Promise<Role> {
        const { data, error } = await supabase
            .from('vgvina_roles')
            .insert({
                name: role.name,
                display_name: role.display_name,
                description: role.description,
                is_admin: role.is_admin || false
            })
            .select()
            .single();

        if (error) {
            console.error('Error creating role:', error);
            throw error;
        }

        return data;
    },

    /**
     * Update role
     */
    async updateRole(roleId: string, updates: {
        display_name?: string;
        description?: string;
    }): Promise<Role | null> {
        console.log('[roleService] Updating role:', roleId, updates);
        const { data, error } = await supabase
            .from('vgvina_roles')
            .update({
                display_name: updates.display_name,
                description: updates.description || ''
            })
            .eq('id', roleId)
            .select();

        if (error) {
            console.error('[roleService] Error updating role:', error);
            throw error;
        }

        console.log('[roleService] Update procedure completed. Returned data length:', data?.length);

        // If data is empty but no error, either RLS blocked SELECT or no changes were found.
        if (!data || data.length === 0) {
            console.warn('[roleService] No data returned from update. Checking if role exists...');
            const { data: exists } = await supabase.from('vgvina_roles').select('id').eq('id', roleId).single();
            if (!exists) throw new Error('Không tìm thấy Role để cập nhật.');
            // If it exists, assume update was attempted (even if values were same)
            return { id: roleId } as Role;
        }

        return data[0];
    },

    /**
     * Delete role (cannot delete admin role)
     */
    async deleteRole(roleId: string): Promise<void> {
        // Check if it's admin role
        const { data: role } = await supabase
            .from('vgvina_roles')
            .select('is_admin, name')
            .eq('id', roleId)
            .single();

        if (role?.is_admin || role?.name === 'admin') {
            throw new Error('Không thể xóa role Admin');
        }

        const { error } = await supabase
            .from('vgvina_roles')
            .delete()
            .eq('id', roleId);

        if (error) {
            console.error('Error deleting role:', error);
            throw error;
        }
    },

    /**
     * Get permissions for a role
     */
    async getRolePermissions(roleId: string): Promise<string[]> {
        const { data, error } = await supabase
            .from('vgvina_role_permissions')
            .select('permission_id')
            .eq('role_id', roleId);

        if (error) {
            console.error('Error fetching role permissions:', error);
            throw error;
        }

        return data?.map(item => item.permission_id) || [];
    },

    /**
     * Update role permissions
     */
    async updateRolePermissions(roleId: string, permissionIds: string[]): Promise<void> {
        // Delete existing permissions
        const { error: deleteError } = await supabase
            .from('vgvina_role_permissions')
            .delete()
            .eq('role_id', roleId);

        if (deleteError) {
            console.error('Error deleting role permissions:', deleteError);
            throw deleteError;
        }

        // Insert new permissions
        if (permissionIds.length > 0) {
            const rolePermissions = permissionIds.map(permissionId => ({
                role_id: roleId,
                permission_id: permissionId
            }));

            const { error: insertError } = await supabase
                .from('vgvina_role_permissions')
                .insert(rolePermissions);

            if (insertError) {
                console.error('Error inserting role permissions:', insertError);
                throw insertError;
            }
        }
    },

    /**
     * Get users count for a role
     */
    async getRoleUsersCount(roleId: string): Promise<number> {
        const { count, error } = await supabase
            .from('vgvina_users')
            .select('*', { count: 'exact', head: true })
            .eq('role_id', roleId);

        if (error) {
            console.error('Error counting role users:', error);
            throw error;
        }

        return count || 0;
    }
};
