import React, { useState, useEffect } from 'react';
import { roleService, Role, RoleWithPermissions } from '../src/services/roleService';
import { permissionService, Permission, PermissionsByModule } from '../src/services/permissionService';
import { PlusIcon, DeleteIcon } from '../components/icons/Icons';
import { useNotification } from '../contexts/NotificationContext';

const AdminRoles: React.FC = () => {
    const [roles, setRoles] = useState<Role[]>([]);
    const [permissions, setPermissions] = useState<PermissionsByModule>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { showNotification } = useNotification();

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRole, setSelectedRole] = useState<RoleWithPermissions | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        display_name: '',
        description: ''
    });
    const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setIsDeleteModalOpen(false);
                resetForm();
            }
        };
        if (isCreateModalOpen || isEditModalOpen || isDeleteModalOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isCreateModalOpen, isEditModalOpen, isDeleteModalOpen]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [rolesData, permissionsData] = await Promise.all([
                roleService.getRoles(),
                permissionService.getPermissionsByModule()
            ]);
            setRoles(rolesData);
            setPermissions(permissionsData);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRole = async () => {
        try {
            const newRole = await roleService.createRole(formData);
            await roleService.updateRolePermissions(newRole.id, selectedPermissions);
            await fetchData();
            showNotification('Tạo role mới thành công', 'success');
            setIsCreateModalOpen(false);
            resetForm();
        } catch (err) {
            console.error('Error creating role:', err);
            showNotification('Lỗi khi tạo role', 'error');
        }
    };

    const handleEditRole = async () => {
        if (!selectedRole) return;
        console.log('[AdminRoles] handleEditRole starting...', selectedRole.id, formData);
        try {
            const result = await roleService.updateRole(selectedRole.id, {
                display_name: formData.display_name,
                description: formData.description
            });
            console.log('[AdminRoles] updateRole result:', result);
            await roleService.updateRolePermissions(selectedRole.id, selectedPermissions);
            await fetchData();
            showNotification('Cập nhật role thành công', 'success');
            setIsEditModalOpen(false);
            resetForm();
        } catch (err) {
            console.error('Error updating role:', err);
            showNotification('Lỗi khi cập nhật role', 'error');
        }
    };

    const handleDeleteRole = async () => {
        if (!selectedRole) return;
        try {
            await roleService.deleteRole(selectedRole.id);
            await fetchData();
            showNotification('Đã xóa role thành công', 'success');
            setIsDeleteModalOpen(false);
            setSelectedRole(null);
        } catch (err: any) {
            console.error('Error deleting role:', err);
            showNotification(err.message || 'Lỗi khi xóa role', 'error');
        }
    };

    const openEditModal = async (role: Role) => {
        try {
            const roleWithPermissions = await roleService.getRoleById(role.id);
            if (roleWithPermissions) {
                setSelectedRole(roleWithPermissions);
                setFormData({
                    name: roleWithPermissions.name,
                    display_name: roleWithPermissions.display_name,
                    description: roleWithPermissions.description || ''
                });
                setSelectedPermissions(roleWithPermissions.permissions.map(p => p.id));
                setIsEditModalOpen(true);
            }
        } catch (err) {
            console.error('Error loading role:', err);
            showNotification('Lỗi khi tải thông tin role', 'error');
        }
    };

    const openDeleteModal = (role: Role) => {
        setSelectedRole(role as RoleWithPermissions);
        setIsDeleteModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ name: '', display_name: '', description: '' });
        setSelectedPermissions([]);
        setSelectedRole(null);
    };

    const togglePermission = (permissionId: string) => {
        setSelectedPermissions(prev =>
            prev.includes(permissionId)
                ? prev.filter(id => id !== permissionId)
                : [...prev, permissionId]
        );
    };

    const toggleModulePermissions = (module: string) => {
        const modulePermissionIds = permissions[module]?.map(p => p.id) || [];
        const allSelected = modulePermissionIds.every(id => selectedPermissions.includes(id));

        if (allSelected) {
            // Deselect all
            setSelectedPermissions(prev => prev.filter(id => !modulePermissionIds.includes(id)));
        } else {
            // Select all
            setSelectedPermissions(prev => [...new Set([...prev, ...modulePermissionIds])]);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
                <p className="text-red-800">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản Lý Roles</h1>
                    <p className="text-gray-600 mt-1">Tạo và quản lý các vai trò người dùng</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <PlusIcon />
                    Tạo Role Mới
                </button>
            </div>

            {/* Roles Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Tên role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Tên hiển thị</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Mô tả</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500">Admin</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {roles.map(role => (
                            <tr key={role.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                    {role.name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {role.display_name}
                                </td>
                                <td className="px-6 py-4 text-sm text-gray-600">
                                    {role.description || '-'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    {role.is_admin ? (
                                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                            Admin
                                        </span>
                                    ) : (
                                        <span className="text-gray-400">-</span>
                                    )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    <button
                                        onClick={() => openEditModal(role)}
                                        className="text-blue-600 hover:text-blue-900 mr-4"
                                    >
                                        Sửa
                                    </button>
                                    {!role.is_admin && role.name !== 'admin' && (
                                        <button
                                            onClick={() => openDeleteModal(role)}
                                            className="text-red-600 hover:text-red-900"
                                        >
                                            Xóa
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Create/Edit Modal */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center border-b p-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                {isCreateModalOpen ? 'Tạo Role Mới' : 'Sửa Role'}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setIsEditModalOpen(false);
                                    resetForm();
                                }}
                                className="text-gray-500 hover:text-gray-800 text-2xl"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Basic Info */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-4">Thông tin cơ bản</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tên Role (Code) *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            disabled={isEditModalOpen}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 disabled:bg-gray-100"
                                            placeholder="vd: nhanvien_kho"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Tên hiển thị *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.display_name}
                                            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                            placeholder="vd: Nhân viên kho"
                                        />
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Mô tả
                                    </label>
                                    <textarea
                                        value={formData.description}
                                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                        className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                        rows={2}
                                        placeholder="Mô tả vai trò và trách nhiệm"
                                    />
                                </div>
                            </div>

                            {/* Permissions */}
                            <div>
                                <h3 className="text-lg font-semibold mb-4">Phân quyền</h3>
                                <div className="space-y-4">
                                    {Object.entries(permissions).map(([module, perms]) => {
                                        const permArray = perms as Permission[];
                                        return (
                                            <div key={module} className="border border-gray-200 rounded-lg p-4">
                                                <div className="flex items-center justify-between mb-3">
                                                    <h4 className="font-semibold text-gray-900">
                                                        {permissionService.getModuleDisplayName(module)}
                                                    </h4>
                                                    <button
                                                        onClick={() => toggleModulePermissions(module)}
                                                        className="text-sm text-blue-600 hover:text-blue-800"
                                                    >
                                                        {permArray.every(p => selectedPermissions.includes(p.id))
                                                            ? 'Bỏ chọn tất cả'
                                                            : 'Chọn tất cả'}
                                                    </button>
                                                </div>
                                                <div className="grid grid-cols-4 gap-3">
                                                    {permArray.map(permission => (
                                                        <label
                                                            key={permission.id}
                                                            className="flex items-center space-x-2 cursor-pointer"
                                                        >
                                                            <input
                                                                type="checkbox"
                                                                checked={selectedPermissions.includes(permission.id)}
                                                                onChange={() => togglePermission(permission.id)}
                                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                            />
                                                            <span className="text-sm text-gray-700">
                                                                {permission.display_name}
                                                            </span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>

                        <div className="border-t p-4 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setIsEditModalOpen(false);
                                    resetForm();
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={isCreateModalOpen ? handleCreateRole : handleEditRole}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                {isCreateModalOpen ? 'Tạo Role' : 'Cập nhật'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedRole && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Xác nhận xóa</h3>
                        <p className="text-gray-600 mb-6">
                            Bạn có chắc chắn muốn xóa role <strong>{selectedRole.display_name}</strong>?
                            Hành động này không thể hoàn tác.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedRole(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDeleteRole}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminRoles;
