import React from 'react';
import { useBranch } from '../contexts/BranchContext';
import { supabase } from '../src/supabaseClient';
import { useNavigate } from 'react-router-dom';

const PendingApproval: React.FC = () => {
    const { currentUser } = useBranch();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6">
                        <svg className="h-8 w-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>

                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng ký thành công!</h2>
                    <p className="text-gray-600 mb-6">
                        Tài khoản <span className="font-semibold">{currentUser?.name}</span> ({currentUser?.email}) của bạn đang chờ Quản trị viên phê duyệt.
                    </p>

                    <div className="bg-blue-50 p-4 rounded-md mb-6">
                        <p className="text-sm text-blue-700">
                            Vui lòng liên hệ Admin để được kích hoạt tài khoản nhanh chóng.
                        </p>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                        Đăng xuất
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PendingApproval;
