import React, { useState } from 'react';
import { supabase } from '../src/supabaseClient';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [identifier, setIdentifier] = useState(''); // username or email
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const isHkd = typeof window !== 'undefined' && window.location.hostname === 'hkd.vgvina.com';

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (isHkd) {
            // HKD custom database authentication flow
            const { data: userData, error: lookupError } = await supabase
                .from('vgvina_users')
                .select('*')
                .eq('username', identifier)
                .maybeSingle();

            if (lookupError || !userData) {
                setError('Tên đăng nhập không tồn tại');
                setLoading(false);
                return;
            }

            if (userData.password_hash !== password) {
                setError('Sai mật khẩu');
                setLoading(false);
                return;
            }

            localStorage.setItem('hkd_user', JSON.stringify({
                id: userData.id,
                username: userData.username,
                email: userData.email,
                role: userData.role,
                full_name: userData.full_name
            }));
            setLoading(false);
            navigate('/dashboard');
            return;
        }

        let email = identifier;

        // If identifier doesn't contain @, it's a username - lookup email
        if (!identifier.includes('@')) {
            const { data: userData, error: lookupError } = await supabase
                .from('vgvina_users')
                .select('email')
                .eq('username', identifier)
                .single();

            if (lookupError || !userData) {
                setError('Tên đăng nhập không tồn tại');
                setLoading(false);
                return;
            }

            email = userData.email;
        }

        // Login with email
        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (authError) {
            setError('Sai email/tên đăng nhập hoặc mật khẩu');
            setLoading(false);
        } else {
            navigate('/dashboard');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
            <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">
                        Đăng nhập
                    </h1>
                    <p className="text-gray-600">{isHkd ? 'Tuổi Ngọc ERP System' : 'VGVINA ERP System'}</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Tên đăng nhập hoặc Email
                        </label>
                        <input
                            type="text"
                            value={identifier}
                            onChange={(e) => setIdentifier(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="username hoặc email@example.com"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Mật khẩu
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
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
                        {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
                    </button>
                </form>

                <p className="text-center mt-6 text-gray-600">
                    Chưa có tài khoản?{' '}
                    <a href="/#/register" className="text-blue-600 hover:underline font-semibold">
                        Đăng ký ngay
                    </a>
                </p>
            </div>
        </div>
    );
}
