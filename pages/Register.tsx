import React, { useState } from 'react';
import { supabase } from '../src/supabaseClient';
import { useNavigate } from 'react-router-dom';

// Success Modal Component
interface SuccessModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const SuccessModal: React.FC<SuccessModalProps> = ({ isOpen, onClose }) => {
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 transform transition-all">
                <div className="text-center">
                    {/* Success Icon */}
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-4">
                        <svg className="h-10 w-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>

                    {/* Title */}
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        Đăng ký thành công!
                    </h3>

                    {/* Message */}
                    <p className="text-gray-600 mb-6">
                        Vui lòng chờ Admin phê duyệt
                    </p>

                    {/* Button */}
                    <button
                        onClick={onClose}
                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors shadow-lg"
                    >
                        Đăng nhập ngay
                    </button>
                </div>
            </div>
        </div>
    );
};

export default function Register() {
    const isHkd = typeof window !== 'undefined' && window.location.hostname === 'hkd.vgvina.com';
    const [username, setUsername] = useState('');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        // Validate passwords match
        if (password !== confirmPassword) {
            setError('Mật khẩu xác nhận không khớp');
            setLoading(false);
            return;
        }

        // Validate password strength
        if (password.length < 6) {
            setError('Mật khẩu phải có ít nhất 6 ký tự');
            setLoading(false);
            return;
        }

        // 1. Check if username already exists
        const { data: existingUser } = await supabase
            .from('vgvina_users')
            .select('username')
            .eq('username', username)
            .single();

        if (existingUser) {
            setError('Tên đăng nhập đã tồn tại');
            setLoading(false);
            return;
        }

        if (isHkd) {
            // HKD custom database registration (bypass Supabase Auth)
            const { error: userError } = await supabase
                .from('vgvina_users')
                .insert({
                    username,
                    email,
                    full_name: fullName,
                    phone_number: phone,
                    role: 'Guest',
                    status: 'Pending',
                    password_hash: password
                });

            if (userError) {
                setError('Không thể tạo hồ sơ người dùng: ' + userError.message);
                setLoading(false);
            } else {
                setLoading(false);
                setShowSuccessModal(true);
            }
            return;
        }

        // 2. Create Supabase Auth user (without email confirmation)
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                emailRedirectTo: window.location.origin,
                data: {
                    full_name: fullName,
                    app_name: 'vgvina', // Tag to identify the source application
                }
            }
        });

        if (authError) {
            // Log warning but store error to show if user is null
            console.warn('Auth Error:', authError.message);

            // If we strictly need a user object and don't get one, we must show this error
            // Don't suppress it blindly anymore
        }

        // CRITICAL: Ensure Auth User was actually created
        if (!authData.user || authError) {
            console.error('Registration failed:', authError);
            const msg = authError?.message || 'Không có phản hồi từ hệ thống xác thực.';

            // Helpful message for the specific email issue
            if (msg.includes('confirmation') || msg.includes('email')) {
                setError(`Lỗi cấu hình Email: ${msg}. (Server chưa bật Auto Confirm?)`);
            } else {
                setError(`Đăng ký thất bại: ${msg}`);
            }

            setLoading(false);
            return;
        }

        // 3. Create entry in vgvina_users
        const { error: userError } = await supabase
            .from('vgvina_users')
            .insert({
                // Link with Auth User ID if possible, but currently we use separate ID
                // Ideally we should store auth_id here
                username,
                email,
                full_name: fullName,
                phone_number: phone,
                role: 'Guest', // Default role, admin will approve
                status: 'Pending',
            });

        if (userError) {
            setError('Không thể tạo hồ sơ người dùng: ' + userError.message);
            setLoading(false);
        } else {
            // Success - show modal
            setLoading(false);
            setShowSuccessModal(true);
        }
    };

    const handleModalClose = () => {
        setShowSuccessModal(false);
        navigate('/login');
    };

    return (
        <>
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">
                            Đăng ký
                        </h1>
                        <p className="text-gray-600">{isHkd ? 'Tạo tài khoản Tuổi Ngọc ERP' : 'Tạo tài khoản VGVINA ERP'}</p>
                    </div>

                    <form onSubmit={handleRegister} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Tên đăng nhập <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={username}
                                onChange={(e) => setUsername(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="username"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Họ và tên <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="Nguyễn Văn A"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="email@example.com"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Số điện thoại <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="0123456789"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mật khẩu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                            <p className="text-xs text-gray-500 mt-1">Tối thiểu 6 ký tự</p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Xác nhận mật khẩu <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                                placeholder="••••••••"
                                required
                            />
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm border border-red-200">
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl"
                        >
                            {loading ? 'Đang đăng ký...' : 'Đăng ký'}
                        </button>
                    </form>

                    <p className="text-center mt-6 text-gray-600">
                        Đã có tài khoản?{' '}
                        <a href="/#/login" className="text-blue-600 hover:underline font-semibold">
                            Đăng nhập ngay
                        </a>
                    </p>
                </div>
            </div>

            {/* Success Modal */}
            <SuccessModal isOpen={showSuccessModal} onClose={handleModalClose} />
        </>
    );
}
