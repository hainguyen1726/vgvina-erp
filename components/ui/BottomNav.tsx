import React from 'react';
import { NavLink } from 'react-router-dom';
import { DashboardIcon, CongNoIcon, PlusIcon, ThuChiIcon, GridIcon } from '../icons/Icons';

const BottomNav: React.FC = () => {
    const navItems = [
        { path: '/dashboard', label: 'Tổng quan', icon: <DashboardIcon /> },
        { path: '/cong-no', label: 'Công nợ', icon: <CongNoIcon /> },
        { path: '/tao-phieu', label: 'Tạo phiếu', icon: <PlusIcon className="w-6 h-6"/> },
        { path: '/thu-chi', label: 'Thu chi', icon: <ThuChiIcon /> },
        { path: '/more', label: 'Khác', icon: <GridIcon /> },
    ];

    return (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-t-md z-40">
            <div className="flex justify-around items-center h-16">
                {navItems.map(item => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        className={({ isActive }) => {
                            if (item.path === '/tao-phieu') {
                                return "-mt-6 flex items-center justify-center h-14 w-14 bg-[#0066cc] rounded-full border-4 border-gray-100 shadow-lg text-white hover:bg-[#0052a3] transition-colors";
                            }
                            return `flex flex-col items-center justify-center w-full text-xs transition-colors duration-200 ${isActive ? 'text-[#0066cc]' : 'text-gray-500 hover:text-[#0066cc]'}`;
                        }}
                    >
                        {item.path === '/tao-phieu' ? <PlusIcon className="w-7 h-7" /> : (
                            <>
                                {item.icon}
                                <span className="mt-1">{item.label}</span>
                            </>
                        )}
                    </NavLink>
                ))}
            </div>
        </nav>
    );
};

export default BottomNav;