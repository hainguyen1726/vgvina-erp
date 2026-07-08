import React, { useState, useEffect } from 'react';
import ConfirmationModal from './ConfirmationModal';

interface ChangePasswordModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (newPassword: string) => Promise<void>;
    username?: string;
}

const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({ isOpen, onClose, onSave, username }) => {
    const [showConfirmClose, setShowConfirmClose] = useState(false);

    const handleRequestClose = () => {
        setShowConfirmClose(true);
    };

    // ESC handled below
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (isOpen) {
            setPassword('');
            setConfirmPassword('');
            setError('');
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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            return;
        }
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            return;
        }

        setLoading(true);
        setError('');
        try {
            await onSave(password);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Có lỗi xảy ra khi đổi mật khẩu');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-sm">
                <div className="p-6 border-b">
                    <h3 className="text-lg font-bold text-gray-800">Đổi mật khẩu {username ? `cho ${username}` : ''}</h3>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && <div className="p-3 bg-red-100 text-red-700 rounded text-sm">{error}</div>}

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mật khẩu mới</label>
                        <input
                            type="password"
                            required
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Nhập mật khẩu mới"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700">Xác nhận mật khẩu</label>
                        <input
                            type="password"
                            required
                            value={confirmPassword}
                            onChange={e => setConfirmPassword(e.target.value)}
                            className="mt-1 w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 outline-none"
                            placeholder="Nhập lại mật khẩu"
                        />
                    </div>

                    <div className="pt-4 flex justify-end space-x-3">
                        <button type="button" onClick={handleRequestClose} className="px-4 py-2 border rounded hover:bg-gray-50">Hủy</button>
                        <button type="submit" disabled={loading} className="px-4 py-2 bg-yellow-600 text-white rounded hover:bg-yellow-700 disabled:opacity-50">
                            {loading ? 'Đang xử lý...' : 'Đổi mật khẩu'}
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
                message="Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu."
                confirmText="Hủy bỏ"
            />
        </div>
    );
};

export default ChangePasswordModal;
