import React, { useState, useEffect } from 'react';
import { User } from '../../types';
import { roleService, Role } from '../../src/services/roleService';
import { userService } from '../../src/services/userService';
import { transactionService } from '../../src/services/transactionService';
import { useNotification } from '../../contexts/NotificationContext';
import ConfirmationModal from './ConfirmationModal';

interface EditUserModalProps {
    user: User | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

interface Facility {
    id: string;
    name: string;
}

const EditUserModal: React.FC<EditUserModalProps> = ({ user, isOpen, onClose, onSave }) => {
    const [showConfirmClose, setShowConfirmClose] = useState(false);

    const handleRequestClose = () => {
        setShowConfirmClose(true);
    };

    // Handle ESC key to close modal handled below
    const { showNotification } = useNotification();
    const [roles, setRoles] = useState<Role[]>([]);
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [selectedRoleId, setSelectedRoleId] = useState<string>('');
    const [selectedFacilityIds, setSelectedFacilityIds] = useState<string[]>([]);
    const [primaryFacilityId, setPrimaryFacilityId] = useState<string>('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && user) {
            fetchData();
        }
    }, [isOpen, user]);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !showConfirmClose) {
                handleRequestClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, showConfirmClose]);

    const fetchData = async () => {
        try {
            const [rolesData, facilitiesData, userFacilities] = await Promise.all([
                roleService.getRoles(),
                transactionService.getFacilities(),
                userService.getUserFacilities(Number(user!.id))
            ]);

            setRoles(rolesData);
            setFacilities(facilitiesData);

            // Set current values
            setSelectedRoleId((user as any)?.role_id || '');
            setSelectedFacilityIds(userFacilities.map(f => f.id));
            setPrimaryFacilityId(userFacilities.find(f => f.is_primary)?.id || '');
        } catch (error) {
            console.error('Error fetching data:', error);
            showNotification('Lỗi khi tải dữ liệu', 'error');
        }
    };

    const handleSave = async () => {
        if (!user) return;

        setLoading(true);
        try {
            // Assign role
            if (selectedRoleId) {
                await userService.assignRole(Number(user.id), selectedRoleId);
            }

            // Assign facilities
            if (selectedFacilityIds.length > 0) {
                await userService.assignFacilities(
                    Number(user.id),
                    selectedFacilityIds,
                    primaryFacilityId || selectedFacilityIds[0]
                );
            }

            showNotification('Cập nhật thành công!', 'success');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving user:', error);
            showNotification('Lỗi khi cập nhật user', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleFacility = (facilityId: string) => {
        setSelectedFacilityIds(prev => {
            if (prev.includes(facilityId)) {
                // Remove facility
                const newIds = prev.filter(id => id !== facilityId);
                // If removing primary, clear primary
                if (facilityId === primaryFacilityId) {
                    setPrimaryFacilityId('');
                }
                return newIds;
            } else {
                // Add facility
                return [...prev, facilityId];
            }
        });
    };

    const handleSetPrimary = (facilityId: string) => {
        // Must be selected first
        if (!selectedFacilityIds.includes(facilityId)) {
            setSelectedFacilityIds(prev => [...prev, facilityId]);
        }
        setPrimaryFacilityId(facilityId);
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b p-4">
                    <h2 className="text-xl font-bold text-gray-800">
                        Chỉnh sửa: {user.full_name}
                    </h2>
                    <button
                        onClick={handleRequestClose}
                        className="text-gray-500 hover:text-gray-800 text-2xl"
                    >
                        &times;
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* User Info */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Thông tin cơ bản</h3>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                            <div>
                                <span className="text-gray-600">Email:</span>
                                <span className="ml-2 text-gray-900">{user.email || 'Chưa có'}</span>
                            </div>
                            <div>
                                <span className="text-gray-600">SĐT:</span>
                                <span className="ml-2 text-gray-900">{user.phone}</span>
                            </div>
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Vai trò *
                        </label>
                        <select
                            value={selectedRoleId}
                            onChange={(e) => setSelectedRoleId(e.target.value)}
                            className="w-full border border-gray-300 rounded-lg px-3 py-2"
                        >
                            <option value="">-- Chọn vai trò --</option>
                            {roles.map(role => (
                                <option key={role.id} value={role.id}>
                                    {role.display_name}
                                    {role.is_admin && ' (Admin)'}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Facilities Selection */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Khu vực / Cơ sở *
                        </label>
                        <div className="border border-gray-300 rounded-lg p-4 space-y-2 max-h-60 overflow-y-auto">
                            {facilities.length === 0 ? (
                                <p className="text-sm text-gray-500">Chưa có cơ sở nào</p>
                            ) : (
                                facilities.map(facility => {
                                    const isSelected = selectedFacilityIds.includes(facility.id);
                                    const isPrimary = primaryFacilityId === facility.id;

                                    return (
                                        <div
                                            key={facility.id}
                                            className={`flex items-center justify-between p-2 rounded ${isPrimary ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                                                }`}
                                        >
                                            <label className="flex items-center space-x-2 cursor-pointer flex-1">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleFacility(facility.id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">
                                                    {facility.name}
                                                    {isPrimary && (
                                                        <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            Chính
                                                        </span>
                                                    )}
                                                </span>
                                            </label>
                                            {isSelected && !isPrimary && (
                                                <button
                                                    onClick={() => handleSetPrimary(facility.id)}
                                                    className="text-xs text-blue-600 hover:text-blue-800 ml-2"
                                                >
                                                    Đặt làm chính
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            Chọn các khu vực mà user này có quyền truy cập. Đánh dấu một khu vực làm "Chính".
                        </p>
                    </div>
                </div>

                <div className="border-t p-4 flex justify-end gap-3">
                    <button
                        onClick={handleRequestClose}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading || !selectedRoleId || selectedFacilityIds.length === 0}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                </div>
            </div>

            <ConfirmationModal
                isOpen={showConfirmClose}
                onClose={() => setShowConfirmClose(false)}
                onConfirm={() => {
                    setShowConfirmClose(false);
                    onClose();
                }}
                title="Xác nhận Hủy"
                message="Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu."
                confirmText="Hủy bỏ"
            />
        </div>
    );
};

export default EditUserModal;
