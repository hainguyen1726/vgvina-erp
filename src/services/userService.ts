import { supabase } from '../supabaseClient';
import { User, EmployeeStatus } from '../../types';

export const userService = {
    async getUsers(): Promise<User[]> {
        console.log('[userService] Starting getUsers()...');

        // Get all users with their roles
        // Note: vgvina_users has BOTH:
        // - role (TEXT) - legacy column with values like "admin", "user"
        // - role_id (UUID) - new column for joining with vgvina_roles (may be NULL)
        const { data: usersData, error: usersError } = await supabase
            .from('vgvina_users')
            .select(`
                *,
                role_details:role_id (
                    id,
                    name,
                    display_name,
                    is_admin
                )
            `);

        if (usersError) {
            console.error('[userService] Error fetching users:', usersError);
            throw usersError;
        }

        console.log('[userService] Fetched users data:', usersData);
        console.log('[userService] Sample user:', usersData?.[0]);

        // Then, get all user-facility mappings
        const { data: userFacilitiesData, error: facilitiesError } = await supabase
            .from('vgvina_user_facilities')
            .select(`
                user_id,
                is_primary,
                facility:facility_id (
                    id,
                    name
                )
            `)
            .eq('is_primary', true);

        if (facilitiesError) {
            console.error('[userService] Error fetching user facilities:', facilitiesError);
            // Don't throw, just continue without facility data
        }

        console.log('[userService] Fetched facilities data:', userFacilitiesData);

        // Create a map of user_id -> facility_name for quick lookup
        const userFacilityMap = new Map<number, string>();
        if (userFacilitiesData) {
            userFacilitiesData.forEach((uf: any) => {
                if (uf.facility?.name) {
                    userFacilityMap.set(uf.user_id, uf.facility.name);
                }
            });
        }

        console.log('[userService] Facility map:', Object.fromEntries(userFacilityMap));

        const mappedUsers = usersData.map((item: any) => {
            // Determine role display name
            // Priority: role_details.display_name > role_details.name > role (TEXT column)
            const roleDisplayName = item.role_details?.display_name ||
                item.role_details?.name ||
                item.role ||
                'Chưa có role';

            // Determine if user is admin
            // Check both: role_details.is_admin (from vgvina_roles) OR role === 'admin' (TEXT column)
            const isAdmin = item.role_details?.is_admin === true ||
                item.role === 'admin' ||
                item.role === 'Admin';

            return {
                id: String(item.id),
                full_name: item.full_name,
                phone: item.phone_number,
                facility_name: userFacilityMap.get(item.id) || 'Chưa gán',
                status: item.status === 'Active' ? EmployeeStatus.DANG_LAM_VIEC :
                    (item.status === 'Pending' ? EmployeeStatus.CHO_PHE_DUYET : EmployeeStatus.DA_NGHI_VIEC),
                role: roleDisplayName,
                email: item.email,
                role_id: item.role_id,
                is_admin: isAdmin
            };
        });

        console.log('[userService] Mapped users:', mappedUsers);
        console.log('[userService] Sample mapped user:', mappedUsers[0]);

        return mappedUsers;
    },

    /**
     * Assign role to user
     */
    async assignRole(userId: number, roleId: string): Promise<void> {
        const { error } = await supabase
            .from('vgvina_users')
            .update({ role_id: roleId })
            .eq('id', userId);

        if (error) {
            console.error('Error assigning role:', error);
            throw error;
        }
    },

    /**
     * Get user's facilities
     */
    async getUserFacilities(userId: number): Promise<Array<{ id: string; name: string; is_primary: boolean }>> {
        const { data, error } = await supabase
            .from('vgvina_user_facilities')
            .select(`
                facility_id,
                is_primary,
                facility:facility_id (
                    id,
                    name
                )
            `)
            .eq('user_id', userId);

        if (error) {
            console.error('Error fetching user facilities:', error);
            throw error;
        }

        return data?.map((item: any) => ({
            id: item.facility?.id,
            name: item.facility?.name,
            is_primary: item.is_primary
        })) || [];
    },

    /**
     * Assign facilities to user
     */
    async assignFacilities(userId: number, facilityIds: string[], primaryFacilityId?: string): Promise<void> {
        // Delete existing facilities
        const { error: deleteError } = await supabase
            .from('vgvina_user_facilities')
            .delete()
            .eq('user_id', userId);

        if (deleteError) {
            console.error('Error deleting user facilities:', deleteError);
            throw deleteError;
        }

        // Insert new facilities
        if (facilityIds.length > 0) {
            const effectivePrimaryId = primaryFacilityId && facilityIds.includes(primaryFacilityId)
                ? primaryFacilityId
                : facilityIds[0];
            const userFacilities = facilityIds.map(facilityId => ({
                user_id: userId,
                facility_id: facilityId,
                is_primary: facilityId === effectivePrimaryId
            }));

            const { error: insertError } = await supabase
                .from('vgvina_user_facilities')
                .insert(userFacilities);

            if (insertError) {
                console.error('Error inserting user facilities:', insertError);
                throw insertError;
            }
        }
    },

    /**
     * Get user permissions
     */
    async getUserPermissions(userId: number): Promise<Array<{ module: string; action: string }>> {
        const { data, error } = await supabase
            .from('vgvina_users')
            .select(`
                role:role_id (
                    is_admin,
                    permissions:vgvina_role_permissions (
                        permission:permission_id (
                            module,
                            action
                        )
                    )
                )
            `)
            .eq('id', userId)
            .single();

        if (error) {
            console.error('Error fetching user permissions:', error);
            throw error;
        }

        const roleData = data?.role as any;

        // If admin, return all permissions
        if (roleData?.is_admin) {
            return [{ module: '*', action: '*' }];
        }

        return roleData?.permissions?.map((item: any) => ({
            module: item.permission?.module,
            action: item.permission?.action
        })) || [];
    },

    /**
     * Check if user has permission
     */
    async hasPermission(userId: number, module: string, action: string): Promise<boolean> {
        const permissions = await this.getUserPermissions(userId);

        // Check if admin (has all permissions)
        if (permissions.some(p => p.module === '*' && p.action === '*')) {
            return true;
        }

        // Check specific permission
        return permissions.some(p => p.module === module && p.action === action);
    },

    /**
     * Check if a username already exists
     */
    async checkUsernameExists(username: string): Promise<boolean> {
        if (!username) return false;
        const { count, error } = await supabase
            .from('vgvina_users')
            .select('*', { count: 'exact', head: true })
            .eq('username', username);

        if (error) {
            console.error('[userService] Error checking username:', error);
            return false;
        }
        return (count !== null && count > 0);
    },

    /**
     * Create a new user (SignUp + Insert into vgvina_users)
     */
    async createUser(userData: {
        email: string;
        password?: string;
        fullName: string;
        phone?: string;
        roleId?: string;
        facilityId?: string;       // legacy single (still supported)
        facilityIds?: string[];    // new: multiple facilities
        primaryFacilityId?: string;
        username: string;
    }): Promise<any> {
        console.log('[userService] Creating user:', userData);

        // 1. Check if username already exists
        const exists = await this.checkUsernameExists(userData.username);
        if (exists) {
            throw new Error(`Tên đăng nhập "${userData.username}" đã tồn tại trong hệ thống. Vui lòng chọn tên khác.`);
        }

        // 2. Insert into vgvina_users
        const { data: newUser, error: dbError } = await supabase
            .from('vgvina_users')
            .insert({
                email: userData.email,
                username: userData.username,
                full_name: userData.fullName,
                phone_number: userData.phone,
                role_id: userData.roleId || null,
                status: 'Active',
            })
            .select()
            .single();

        if (dbError) {
            if (dbError.code === '23505') {
                if (dbError.message?.includes('vgvina_users_username_key')) {
                    throw new Error(`Tên đăng nhập "${userData.username}" đã tồn tại trong hệ thống.`);
                }
                throw new Error('Dữ liệu cung cấp bị trùng lặp với một bản ghi đã có.');
            }
            throw dbError;
        }

        // 3. Assign facilities (supports multiple)
        const facilityIds = userData.facilityIds?.length
            ? userData.facilityIds
            : userData.facilityId ? [userData.facilityId] : [];

        if (facilityIds.length > 0 && newUser) {
            const primaryId = userData.primaryFacilityId || facilityIds[0];
            const rows = facilityIds.map(fid => ({
                user_id: newUser.id,
                facility_id: fid,
                is_primary: fid === primaryId,
            }));
            await supabase.from('vgvina_user_facilities').insert(rows);
        }

        // 3. Attempt to create Auth User via RPC if password provided
        if (userData.password) {
            const { error: rpcError } = await supabase.rpc('admin_create_user', {
                email: userData.email,
                password: userData.password,
                user_id: newUser.id,
                full_name: userData.fullName || ''
            });

            if (rpcError) {
                console.error('Failed to create Auth user via RPC:', rpcError);
                
                // Rollback: delete the newly created entries to avoid 'zombie' records
                await supabase.from('vgvina_user_facilities').delete().eq('user_id', newUser.id);
                await supabase.from('vgvina_users').delete().eq('id', newUser.id);

                let translatedError = rpcError.message;
                if (translatedError?.includes('Password should be at least')) {
                    translatedError = 'Mật khẩu phải có ít nhất 6 ký tự.';
                } else if (translatedError?.includes('already registered')) {
                     translatedError = 'Email này đã được sử dụng cho một tài khoản khác.';
                }

                throw new Error('Lỗi tạo tài khoản đăng nhập (Auth), đã hoàn tác dữ liệu: ' + translatedError);
            }
        }

        return newUser;
    },

    async updateUserPassword(email: string, newPassword: string): Promise<any> {
        if (!email) {
            throw new Error('User does not have an email address to reset password.');
        }

        // Try RPC first
        const { data, error } = await supabase.rpc('admin_reset_password_via_email', {
            target_email: email,
            new_password: newPassword
        });

        if (error) {
            console.error('RPC admin_reset_password_via_email failed:', error);
            // Return actual error message from RPC (e.g., "Access denied") or fallback
            throw new Error(error.message || 'Không thể đổi mật khẩu. Lỗi không xác định.');
        }
        return data;
    },

    async updateUserProfile(userId: string, data: { full_name?: string; phone_number?: string }): Promise<void> {
        const { error } = await supabase
            .from('vgvina_users')
            .update(data)
            .eq('id', userId);

        if (error) {
            console.error('Error updating user profile:', error);
            throw error;
        }
    },

    async verifyAndChangePassword(email: string, oldPassword: string, newPassword: string): Promise<void> {
        // 1. Verify old password by attempting to sign in
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email,
            password: oldPassword
        });

        if (signInError) {
            throw new Error('Mật khẩu cũ không chính xác.');
        }

        // 2. If valid, update to new password
        const { error: updateError } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (updateError) {
            console.error('Error updating password:', updateError);
            throw updateError;
        }
    },

    async deleteUser(userId: number): Promise<void> {
        const { error } = await supabase.rpc('admin_delete_user', {
            target_user_id: userId
        });

        if (error) {
            console.error('RPC admin_delete_user failed, attempting direct delete fallback:', error);
            // Fallback for orphaned users in vgvina_users that lack an auth record
            // (e.g., if admin_create_user failed historically, they get stuck)
            const { error: directError } = await supabase.from('vgvina_users').delete().eq('id', userId);
            
            if (directError) {
                console.error('Direct delete fallback failed:', directError);
                throw new Error(`Xoá thất bại bằng RPC: ${error.message} \n Xoá trực tiếp cũng thất bại: ${directError.message}`);
            }
        }
    }
};

