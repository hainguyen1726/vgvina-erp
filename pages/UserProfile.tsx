import React, { useState, useEffect } from 'react';
import { supabase } from '../src/supabaseClient';
import { userService } from '../src/services/userService';
import { User } from '../types';
import { useNotification } from '../contexts/NotificationContext';

const UserProfile: React.FC = () => {
    const { showNotification } = useNotification();
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [authUser, setAuthUser] = useState<any>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [saving, setSaving] = useState(false);

    // Form states
    const [editData, setEditData] = useState({
        full_name: '',
        phone_number: ''
    });

    const [passwordData, setPasswordData] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });

    useEffect(() => {
        fetchCurrentUser();
    }, []);

    const fetchCurrentUser = async () => {
        try {
            setLoading(true);
            const { data: { user } } = await supabase.auth.getUser();
            setAuthUser(user);

            if (user) {
                const users = await userService.getUsers();
                const matchedUser = users.find(u => {
                    const emailMatch = user.email && u.email === user.email;
                    const phoneMatch = user.phone && u.phone === user.phone;
                    return emailMatch || phoneMatch;
                });

                if (matchedUser) {
                    setCurrentUser(matchedUser);
                    setEditData({
                        full_name: matchedUser.full_name || '',
                        phone_number: matchedUser.phone || ''
                    });
                }
            }
        } catch (error) {
            console.error('Error fetching user:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveProfile = async () => {
        if (!currentUser) return;
        try {
            setSaving(true);
            await userService.updateUserProfile(currentUser.id, {
                full_name: editData.full_name,
                phone_number: editData.phone_number
            });
            showNotification('Đã cập nhật thông tin thành công!', 'success');
            setIsEditing(false);
            fetchCurrentUser();
        } catch (error) {
            console.error('Error saving profile:', error);
            showNotification('Lỗi khi cập nhật thông tin.', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!authUser?.email) return;

        if (passwordData.newPassword !== passwordData.confirmPassword) {
            showNotification('Mật khẩu xác nhận không khớp.', 'warning');
            return;
        }

        try {
            setSaving(true);
            await userService.verifyAndChangePassword(
                authUser.email,
                passwordData.oldPassword,
                passwordData.newPassword
            );
            showNotification('Đổi mật khẩu thành công!', 'success');
            setIsChangingPassword(false);
            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            showNotification(error.message || 'Lỗi khi đổi mật khẩu.', 'error');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-2xl mx-auto p-4 sm:p-6 h-full flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto p-4 sm:p-8">
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6 sm:p-8">
                    <h1 className="text-2xl font-bold text-white mb-2">Hồ sơ cá nhân</h1>
                    <p className="text-blue-100 text-sm">Quản lý thông tin tài khoản và bảo mật của bạn</p>
                </div>

                <div className="p-6 sm:p-8 space-y-8">
                    {/* Basic Info Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h2 className="text-lg font-semibold text-gray-800">Thông tin cơ bản</h2>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
                                >
                                    Chỉnh sửa
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-500">Họ và tên</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editData.full_name}
                                        onChange={(e) => setEditData({ ...editData, full_name: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium">{currentUser?.full_name || 'Chưa cập nhật'}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-500">Email (Không thể thay đổi)</label>
                                <p className="text-gray-900 font-medium bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 italic">
                                    {currentUser?.email || authUser?.email}
                                </p>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-500">Số điện thoại</label>
                                {isEditing ? (
                                    <input
                                        type="text"
                                        value={editData.phone_number}
                                        onChange={(e) => setEditData({ ...editData, phone_number: e.target.value })}
                                        className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                    />
                                ) : (
                                    <p className="text-gray-900 font-medium">{currentUser?.phone || 'Chưa cập nhật'}</p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-500">Chi nhánh & Vai trò</label>
                                <p className="text-gray-900">
                                    <span className="font-medium">{currentUser?.facility_name}</span>
                                    <span className="mx-2 text-gray-300">|</span>
                                    <span className="text-blue-600 font-medium">{currentUser?.role}</span>
                                </p>
                            </div>
                        </div>

                        {isEditing && (
                            <div className="flex justify-end gap-3 pt-2">
                                <button
                                    onClick={() => {
                                        setIsEditing(false);
                                        setEditData({
                                            full_name: currentUser?.full_name || '',
                                            phone_number: currentUser?.phone || ''
                                        });
                                    }}
                                    className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                >
                                    {saving ? 'Đang lưu...' : 'Lưu thay đổi'}
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Security Section */}
                    <div className="space-y-6 pt-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h2 className="text-lg font-semibold text-gray-800">Bảo mật</h2>
                            {!isChangingPassword && (
                                <button
                                    onClick={() => setIsChangingPassword(true)}
                                    className="text-sm font-medium text-blue-600 hover:text-blue-700 underline"
                                >
                                    Đổi mật khẩu
                                </button>
                            )}
                        </div>

                        {isChangingPassword ? (
                            <form onSubmit={handleChangePassword} className="bg-gray-50 p-6 rounded-xl border border-gray-200 space-y-4">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="sm:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu hiện tại</label>
                                        <input
                                            required
                                            type="password"
                                            value={passwordData.oldPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, oldPassword: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu mới</label>
                                        <input
                                            required
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Xác nhận mật khẩu mới</label>
                                        <input
                                            required
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                        />
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-2">
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsChangingPassword(false);
                                            setPasswordData({ oldPassword: '', newPassword: '', confirmPassword: '' });
                                        }}
                                        className="px-4 py-2 text-sm font-medium text-gray-600 border border-gray-300 rounded-lg hover:bg-white"
                                    >
                                        Hủy
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={saving}
                                        className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                                    >
                                        {saving ? 'Đang xử lý...' : 'Xác nhận đổi mật khẩu'}
                                    </button>
                                </div>
                            </form>
                        ) : (
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                    </svg>
                                </div>
                                <p>Mật khẩu của bạn giúp bảo vệ tài khoản. Bạn nên đổi mật khẩu định kỳ.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
