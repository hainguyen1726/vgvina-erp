import { supabase } from '../supabaseClient';

export interface Permission {
    id: string;
    module: string;
    action: string;
    display_name: string;
    description?: string;
}

export interface PermissionsByModule {
    [module: string]: Permission[];
}

export const permissionService = {
    /**
     * Get all permissions
     */
    async getPermissions(): Promise<Permission[]> {
        const { data, error } = await supabase
            .from('vgvina_permissions')
            .select('*')
            .order('module', { ascending: true })
            .order('action', { ascending: true });

        if (error) {
            console.error('Error fetching permissions:', error);
            throw error;
        }

        return data || [];
    },

    /**
     * Get permissions grouped by module
     */
    async getPermissionsByModule(): Promise<PermissionsByModule> {
        const permissions = await this.getPermissions();

        const grouped: PermissionsByModule = {};
        permissions.forEach(permission => {
            if (!grouped[permission.module]) {
                grouped[permission.module] = [];
            }
            grouped[permission.module].push(permission);
        });

        return grouped;
    },

    /**
     * Get module display names (Vietnamese)
     */
    getModuleDisplayName(module: string): string {
        const moduleNames: { [key: string]: string } = {
            'partners': 'Đối tác',
            'products': 'Sản phẩm',
            'sales_orders': 'Đơn bán hàng',
            'purchase_orders': 'Đơn mua hàng',
            'financial_transactions': 'Thu/Chi',
            'debt': 'Công nợ',
            'inventory': 'Kho',
            'reports': 'Báo cáo',
            'admin': 'Quản trị'
        };
        return moduleNames[module] || module;
    },

    /**
     * Get action display names (Vietnamese)
     */
    getActionDisplayName(action: string): string {
        const actionNames: { [key: string]: string } = {
            'view': 'Xem',
            'create': 'Tạo',
            'edit': 'Sửa',
            'delete': 'Xóa',
            'export': 'Xuất'
        };
        return actionNames[action] || action;
    },

    /**
     * Create new permission (admin only)
     */
    async createPermission(permission: {
        module: string;
        action: string;
        display_name: string;
        description?: string;
    }): Promise<Permission> {
        const { data, error } = await supabase
            .from('vgvina_permissions')
            .insert(permission)
            .select()
            .single();

        if (error) {
            console.error('Error creating permission:', error);
            throw error;
        }

        return data;
    }
};
