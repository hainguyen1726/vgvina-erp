import React, { useState, useEffect } from 'react';
import { supabase } from '../../src/supabaseClient';
import { userService } from '../../src/services/userService';
import ConfirmationModal from './ConfirmationModal';

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (userData: any) => Promise<void>;
}

const AddUserModal: React.FC<AddUserModalProps> = ({ isOpen, onClose, onSave }) => {
    const [showConfirmClose, setShowConfirmClose] = useState(false);

    const handleRequestClose = () => {
        setShowConfirmClose(true);
    };

    // ESC handled below
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        full_name: '',
        email: '',
        phone: '',
        roleId: '',
    });
    const [selectedFacilityIds, setSelectedFacilityIds] = useState<string[]>([]);
    const [primaryFacilityId, setPrimaryFacilityId] = useState<string>('');
    const [roles, setRoles] = useState<any[]>([]);
    const [facilities, setFacilities] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [usernameError, setUsernameError] = useState('');
    const [isCheckingUsername, setIsCheckingUsername] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchRolesAndFacilities();
            setFormData({
                username: '',
                password: '',
                full_name: '',
                email: '',
                phone: '',
                roleId: '',
            });
            setSelectedFacilityIds([]);
            setPrimaryFacilityId('');
            setError('');
            setUsernameError('');
        }
    }, [isOpen]);

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

    // Debounced username checking
    useEffect(() => {
        const checkUsername = async () => {
            if (!formData.username || formData.username.trim().length < 2) {
                setUsernameError('');
                return;
            }
            setIsCheckingUsername(true);
            try {
                const exists = await userService.checkUsernameExists(formData.username.trim());
                if (exists) {
                    setUsernameError('Tên đăng nhập này đã tồn tại trong hệ thống.');
                } else {
                    setUsernameError('');
                }
            } catch (err) {
                console.error('Error checking username', err);
            } finally {
                setIsCheckingUsername(false);
            }
        };

        const timeoutId = setTimeout(checkUsername, 500);
        return () => clearTimeout(timeoutId);
    }, [formData.username]);

    const fetchRolesAndFacilities = async () => {
        try {
            const { data: rolesData } = await supabase.from('vgvina_roles').select('*');
            const { data: facilitiesData } = await supabase.from('vgvina_facilities').select('*');
            setRoles(rolesData || []);
            setFacilities(facilitiesData || []);
        } catch (err) {
            console.error('Error fetching data:', err);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const toggleFacility = (facilityId: string) => {
        setSelectedFacilityIds(prev => {
            if (prev.includes(facilityId)) {
                const newIds = prev.filter(id => id !== facilityId);
                if (facilityId === primaryFacilityId) setPrimaryFacilityId('');
                return newIds;
            }
            return [...prev, facilityId];
        });
    };

    const handleSetPrimary = (facilityId: string) => {
        if (!selectedFacilityIds.includes(facilityId)) {
            setSelectedFacilityIds(prev => [...prev, facilityId]);
        }
        setPrimaryFacilityId(facilityId);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (usernameError) {
            setError('Vui lòng chọn tên đăng nhập khác.');
            return;
        }

        setLoading(true);
        setError('');
        try {
            const effectiveEmail = formData.email.trim()
                || `${formData.username.trim().toLowerCase()}@vgvina.com`;
            await onSave({
                ...formData,
                email: effectiveEmail,
                fullName: formData.full_name,
                facilityIds: selectedFacilityIds,
                primaryFacilityId: primaryFacilityId || selectedFacilityIds[0] || '',
            });
            onClose();
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi tạo thành viên');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b flex justify-between items-center">
                    <h3 className="text-xl font-bold text-gray-800">Thêm thành viên mới</h3>
                    <button onClick={handleRequestClose} className="text-gray-500 hover:text-gray-700">&times;</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tên đăng nhập <span className="text-red-500">*</span></label>
                        <input type="text" name="username" required value={formData.username} onChange={handleChange} className={`mt-1 w-full p-2 border rounded ${usernameError ? 'border-red-500 focus:ring-red-500 focus:border-red-500' : 'border-gray-300 focus:ring-[#0066cc] focus:border-[#0066cc]'}`} placeholder="user123" />
                        {isCheckingUsername && <p className="text-xs text-blue-500 mt-1">Đang kiểm tra...</p>}
                        {usernameError && <p className="text-xs text-red-500 mt-1">{usernameError}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mật khẩu <span className="text-red-500">*</span></label>
                        <input type="password" name="password" required value={formData.password} onChange={handleChange} className="mt-1 w-full p-2 border rounded" placeholder="******" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Họ và tên <span className="text-red-500">*</span></label>
                        <input type="text" name="full_name" required value={formData.full_name} onChange={handleChange} className="mt-1 w-full p-2 border rounded" placeholder="Nguyễn Văn A" />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Email</label>
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="mt-1 w-full p-2 border rounded" placeholder="email@example.com" />
                        <p className="text-xs text-gray-500 mt-1">Để trống sẽ tự sinh email nội bộ từ tên đăng nhập. Đăng nhập vẫn dùng được tên đăng nhập.</p>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Số điện thoại</label>
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="mt-1 w-full p-2 border rounded" placeholder="090..." />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Vai trò</label>
                        <select name="roleId" value={formData.roleId} onChange={handleChange} className="mt-1 w-full p-2 border rounded">
                            <option value="">-- Chọn vai trò --</option>
                            {roles.map(r => (
                                <option key={r.id} value={r.id}>{r.display_name || r.name}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Chi nhánh ({selectedFacilityIds.length} đã chọn)
                        </label>
                        <div className="border border-gray-300 rounded-lg p-3 space-y-1.5 max-h-44 overflow-y-auto">
                            {facilities.length === 0 ? (
                                <p className="text-sm text-gray-500 text-center py-2">Chưa có chi nhánh nào.</p>
                            ) : (
                                facilities.map(f => {
                                    const isSelected = selectedFacilityIds.includes(f.id);
                                    const isPrimary = primaryFacilityId === f.id;
                                    return (
                                        <div key={f.id} className={`flex items-center justify-between p-1.5 rounded ${isPrimary ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'}`}>
                                            <label className="flex items-center space-x-2 cursor-pointer flex-1">
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() => toggleFacility(f.id)}
                                                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                                />
                                                <span className="text-sm text-gray-700">
                                                    {f.name}
                                                    {isPrimary && <span className="ml-2 px-1.5 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-700">Chính</span>}
                                                </span>
                                            </label>
                                            {isSelected && !isPrimary && (
                                                <button type="button" onClick={() => handleSetPrimary(f.id)} className="text-xs text-blue-600 hover:text-blue-800 ml-2 shrink-0">
                                                    Đặt chính
                                                </button>
                                            )}
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={handleRequestClose} className="px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50">
                            {loading ? 'Đang tạo...' : 'Tạo thành viên'}
                        </button>
                    </div>
                </form>
            </div>

            <ConfirmationModal
                isOpen={showConfirmClose}
                onClose={() => setShowConfirmClose(false)}
                onConfirm={() => {
                    setShowConfirmClose(false);
                    onClose();
                }}
                title="Xác nhận Hủy"
                message="Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được nhập."
                confirmText="Hủy bỏ"
            />
        </div>
    );
};

export default AddUserModal;
