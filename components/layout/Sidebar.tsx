import React, { useState, useEffect } from 'react';
import { NavLink, Link, useLocation } from 'react-router-dom';
import { Page } from '../../types';
import { DashboardIcon, ThuChiIcon, CongNoIcon, DoiTacIcon, BaoCaoIcon, AdminIcon, MenuIcon, ChevronLeftIcon, ChevronDownIcon, PlusIcon } from '../icons/Icons';
import { useBranch } from '../../contexts/BranchContext';
import { supabase } from '../../src/supabaseClient';

interface SidebarProps {
  onCollapsedChange?: (isCollapsed: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onCollapsedChange }) => {
  const { currentUser } = useBranch();

  const allowedAdminRoles = ['Admin', 'admin', 'Quản trị viên', 'Quản lý Chi nhánh', 'Kế toán HO', 'Kế toán', 'Ban Lãnh đạo'];
  const canViewAdmin = currentUser?.role ? allowedAdminRoles.includes(currentUser.role) : false;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/#/login';
  };
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const location = useLocation();

  const baseMenuItems = [
    { name: Page.Dashboard, path: '/dashboard', icon: <DashboardIcon /> },
    { name: Page.ThuChi, path: '/thu-chi', icon: <ThuChiIcon /> },
    { name: Page.TaoPhieu, path: '/tao-phieu', icon: <PlusIcon /> },
    { name: Page.CongNo, path: '/cong-no', icon: <CongNoIcon /> },
    { name: Page.DoiTac, path: '/doi-tac', icon: <DoiTacIcon /> },
    { name: 'Báo cáo công nợ', path: '/bao-cao-cong-no', icon: <BaoCaoIcon /> },
    {
      name: Page.BaoCao,
      icon: <BaoCaoIcon />,
      subItems: [
        { name: 'Tổng quan', path: '/bao-cao' },
        { name: Page.XuatNhap, path: '/bao-cao/xuat-nhap' },
        { name: Page.TonKho, path: '/bao-cao/ton-kho' },
        { name: 'Bán hàng theo Hàng hóa', path: '/bao-cao/ban-hang-hang-hoa' },
        { name: 'Tổng hợp Xuất Nhập Tồn', path: '/bao-cao/xuat-nhap-ton' },
        { name: 'Chuyển kho', path: '/bao-cao/chuyen-kho' },
        { name: 'Thu chi Hạng mục', path: '/bao-cao/thu-chi-hang-muc' },
        { name: 'Thu chi Đối tượng', path: '/bao-cao/thu-chi-doi-tuong' },
        { name: 'Sổ chi tiết công nợ', path: '/bao-cao/so-chi-tiet-cong-no' },
        { name: 'Trùng lặp', path: '/bao-cao/trung-lap' },
        { name: 'Trả hàng', path: '/bao-cao/tra-hang' },
        { name: 'Hủy hàng', path: '/bao-cao/huy-hang' },
      ]
    },
  ];

  const menuItems = canViewAdmin
    ? [...baseMenuItems, {
        name: Page.QuanTri,
        icon: <AdminIcon />,
        subItems: [
          { name: 'Tổng quan', path: '/admin' },
          { name: 'Tài khoản', path: '/admin/tai-khoan' },
          { name: 'Hạng mục', path: '/admin/hang-muc' },
          { name: 'Danh mục sản phẩm', path: '/admin/danh-muc-san-pham' },
          { name: 'Đối tượng', path: '/admin/doi-tuong' },
          { name: 'Quản lý thành viên', path: '/admin/thanh-vien' }
        ]
      }]
    : baseMenuItems;

  useEffect(() => {
    const parentMenu = menuItems.find(item =>
      item.subItems?.some(subItem => location.pathname.startsWith(subItem.path))
    );
    if (parentMenu) {
      setOpenMenu(parentMenu.name);
    }
  }, [location.pathname]);

  const handleToggleCollapsed = (val: boolean) => {
    setIsCollapsed(val);
    onCollapsedChange?.(val);
  };

  const toggleMenu = (name: string) => {
    setOpenMenu(openMenu === name ? null : name);
  };

  return (
    <aside className={`hidden md:flex flex-col bg-white shadow-md transition-all duration-300 fixed top-0 left-0 h-full z-30 ${isCollapsed ? 'w-20' : 'w-64'}`}>
      {/* Header: Logo + Collapse Toggle */}
      <div className="flex items-center justify-between h-16 px-4 border-b flex-shrink-0">
        {!isCollapsed && (
          <div className="flex items-center">
            <svg className="w-8 h-8 text-[#0066cc]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>
            <span className="ml-2 font-bold text-xl text-[#0066cc]">VGVINA</span>
          </div>
        )}
        <button
          onClick={() => handleToggleCollapsed(!isCollapsed)}
          className="p-2 rounded-md hover:bg-gray-100 focus:outline-none ml-auto"
        >
          {isCollapsed ? <MenuIcon /> : <ChevronLeftIcon />}
        </button>
      </div>

      {/* User Info */}
      <div className={`flex items-center px-4 py-3 border-b flex-shrink-0 ${isCollapsed ? 'justify-center' : ''}`}>
        <Link to="/profile" className="flex-shrink-0">
          <img
            className="w-9 h-9 rounded-full object-cover"
            src={currentUser?.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(currentUser?.name || 'U')}&background=0066cc&color=fff`}
            alt="avatar"
          />
        </Link>
        {!isCollapsed && (
          <div className="ml-3 min-w-0">
            <p className="text-sm font-semibold text-gray-800 truncate">{currentUser?.name || 'User'}</p>
            <p className="text-xs text-gray-500 truncate">{currentUser?.role || ''}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="mt-2 flex-1 overflow-y-auto">
        <ul>
          {menuItems.map((item) => (
            <li key={item.name} className="px-4 py-1">
              {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.name)}
                    className={`flex items-center justify-between w-full p-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      openMenu === item.name ? 'text-gray-900' : 'text-gray-600'
                    } hover:bg-gray-100 hover:text-gray-900 ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <div className="flex items-center">
                      <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
                      {!isCollapsed && <span className="ml-3 flex-1 whitespace-nowrap">{item.name}</span>}
                    </div>
                    {!isCollapsed && (
                      <span className={`transform transition-transform duration-200 ${openMenu === item.name ? 'rotate-180' : ''}`}>
                        <ChevronDownIcon />
                      </span>
                    )}
                  </button>
                  {!isCollapsed && openMenu === item.name && (
                    <ul className="pl-6 mt-1 space-y-1">
                      {item.subItems.map(subItem => (
                        <li key={subItem.name}>
                          <NavLink
                            to={subItem.path}
                            end={subItem.path === '/bao-cao'}
                            className={({ isActive }) =>
                              `flex items-center p-2 text-xs font-medium rounded-lg transition-colors duration-200 ${
                                isActive ? 'bg-[#0066cc] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                              }`
                            }
                          >
                            {subItem.name}
                          </NavLink>
                        </li>
                      ))}
                    </ul>
                  )}
                </>
              ) : (
                <NavLink
                  to={item.path!}
                  className={({ isActive }) =>
                    `flex items-center p-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive ? 'bg-[#0066cc] text-white shadow-sm' : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                    } ${isCollapsed ? 'justify-center' : ''}`
                  }
                  title={isCollapsed ? item.name : ''}
                >
                  <span className="flex-shrink-0 w-5 h-5">{item.icon}</span>
                  {!isCollapsed && <span className="ml-3 flex-1 whitespace-nowrap">{item.name}</span>}
                </NavLink>
              )}
            </li>
          ))}
        </ul>
      </nav>

      {/* Footer: Profile + Logout */}
      <div className="border-t flex-shrink-0">
        <Link
          to="/profile"
          className={`flex items-center px-4 py-3 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? 'Hồ sơ' : ''}
        >
          <span className="flex-shrink-0 w-5 h-5">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
          </span>
          {!isCollapsed && <span className="ml-3">Hồ sơ</span>}
        </Link>
        <button
          onClick={handleLogout}
          className={`flex items-center w-full px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors ${isCollapsed ? 'justify-center' : ''}`}
          title={isCollapsed ? 'Đăng xuất' : ''}
        >
          <span className="flex-shrink-0 w-5 h-5">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          </span>
          {!isCollapsed && <span className="ml-3">Đăng xuất</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
