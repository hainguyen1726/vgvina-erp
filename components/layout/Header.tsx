import React, { useState, useRef, useEffect } from 'react';
import { NavLink, Link } from 'react-router-dom';
import { Page } from '../../types';
import { BellIcon, ChevronDownIcon, MapPinIcon } from '../icons/Icons';
import { useBranch } from '../../contexts/BranchContext';
import { supabase } from '../../src/supabaseClient';

interface HeaderProps {
  isSidebarCollapsed?: boolean;
}

const Header: React.FC<HeaderProps> = ({ isSidebarCollapsed = false }) => {
  /* const menuItems = [
    { name: Page.Dashboard, path: '/dashboard' },
    { name: Page.ThuChi, path: '/thu-chi' },
    { name: Page.TaoPhieu, path: '/tao-phieu' },
    { name: Page.CongNo, path: '/cong-no' },
    { name: Page.DoiTac, path: '/doi-tac' },
    { name: Page.BaoCao, path: '/bao-cao' },
  ]; */

  // We need to access currentUser before defining menuItems if we want to filter it.
  const { selectedBranch, setSelectedBranch, availableBranches, currentUser } = useBranch();

  const menuItems = [
    { name: Page.Dashboard, path: '/dashboard' },
    { name: Page.ThuChi, path: '/thu-chi' },
    { name: Page.TaoPhieu, path: '/tao-phieu' },
    { name: Page.CongNo, path: '/cong-no' },
    { name: Page.DoiTac, path: '/doi-tac' },
    { name: Page.BaoCao, path: '/bao-cao' },
  ];

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isBranchDropdownOpen, setIsBranchDropdownOpen] = useState(false);

  const userDropdownRef = useRef<HTMLDivElement>(null);
  const branchDropdownRef = useRef<HTMLDivElement>(null);

  const [show, setShow] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const allowedAdminRoles = ['Admin', 'admin', 'Quản trị viên', 'Quản lý Chi nhánh', 'Kế toán HO', 'Kế toán', 'Ban Lãnh đạo'];
  const canViewAdmin = currentUser?.role ? allowedAdminRoles.includes(currentUser.role) : false;

  // Show Quản trị menu for admin users
  if (canViewAdmin) {
    // Only add if not already present (React strict mode precaution)
    if (!menuItems.find(item => item.name === Page.QuanTri)) {
      menuItems.push({ name: Page.QuanTri, path: '/admin' });
    }
  }


  const controlNavbar = () => {
    if (typeof window !== 'undefined') {
      if (window.scrollY > lastScrollY && window.scrollY > 100) {
        setShow(false);
      } else {
        setShow(true);
      }
      setLastScrollY(window.scrollY);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (branchDropdownRef.current && !branchDropdownRef.current.contains(event.target as Node)) {
        setIsBranchDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  useEffect(() => {
    document.documentElement.style.setProperty('--header-height', show ? '4rem' : '0rem');
  }, [show]);

  const handleLogout = async () => {
    console.log('User logging out...');
    await supabase.auth.signOut();
    setIsUserDropdownOpen(false);
    // Redirect to login page
    window.location.href = '/#/login';
  };

  return (
    <>
      <header className={`flex items-center justify-between h-16 px-4 sm:px-6 bg-[#0066cc] text-white sticky top-0 z-30 transition-all duration-300 ${show ? 'translate-y-0' : '-translate-y-full'} ${isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'}`}>
        {/* Left part: Logo — hidden on desktop since it's in Sidebar */}
        <div className="flex items-center flex-shrink-0 md:hidden">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v.01" /></svg>
          <span className="ml-2 font-bold text-xl text-white">VGVINA</span>
        </div>

        {/* Middle part: Navigation — hidden on desktop since it's in Sidebar */}
        <div className="hidden items-center justify-center px-4">
          <nav className="flex items-center space-x-1">
            {menuItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 whitespace-nowrap ${isActive
                    ? 'bg-white/20'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'
                  }`
                }
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right part: Actions and User Info */}
        <div className="flex items-center flex-shrink-0 space-x-2 sm:space-x-4">
          <div className="relative" ref={branchDropdownRef}>
            {availableBranches.length > 1 ? (
              <button
                onClick={() => setIsBranchDropdownOpen(!isBranchDropdownOpen)}
                className="flex items-center text-sm font-medium text-white/90 hover:text-white focus:outline-none p-1 rounded-md hover:bg-white/10"
              >
                <MapPinIcon className="w-5 h-5 text-red-400" />
                <span className="ml-1.5 hidden sm:inline">{selectedBranch}</span>
                <ChevronDownIcon className="hidden sm:block" />
              </button>
            ) : (
              <div className="flex items-center text-sm font-medium text-white/90 p-1">
                <MapPinIcon className="w-5 h-5 text-red-400" />
                <span className="ml-1.5 hidden sm:inline">{selectedBranch}</span>
              </div>
            )}
            {isBranchDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <ul>
                  {availableBranches.map(branch => (
                    <li key={branch}>
                      <button
                        onClick={() => {
                          setSelectedBranch(branch);
                          setIsBranchDropdownOpen(false);
                        }}
                        className={`w-full text-left block px-4 py-2 text-sm ${selectedBranch === branch ? 'bg-gray-100 text-gray-900 font-semibold' : 'text-gray-700 hover:bg-gray-100'}`}
                      >
                        {branch}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button className="relative hidden md:block p-2 text-white/80 rounded-full hover:bg-white/10 hover:text-white focus:outline-none">
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full"></span>
            <BellIcon />
          </button>

          <div className="relative md:hidden" ref={userDropdownRef}>
            <button onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)} className="flex items-center focus:outline-none rounded-full p-0.5 hover:bg-white/10">
              <img
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full object-cover"
                src={currentUser?.avatar || 'https://ui-avatars.com/api/?name=User'}
                alt="User avatar"
              />
              <div className="ml-3 text-left hidden sm:block">
                <p className="text-sm font-semibold text-white">{currentUser?.name || 'User'}</p>
                <p className="text-xs text-white/80">{currentUser?.role || 'Loading...'}</p>
              </div>
              <ChevronDownIcon className="hidden sm:block" />
            </button>
            {isUserDropdownOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                <div className="px-4 py-3 border-b">
                  <p className="text-sm font-semibold text-gray-800">{currentUser?.name || 'User'}</p>
                  <p className="text-xs text-gray-500 truncate">{currentUser?.role || 'Loading...'}</p>
                </div>
                <div className="py-1">
                  <Link to="/profile" onClick={() => setIsUserDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Thông tin người dùng
                  </Link>
                  {canViewAdmin && (
                    <Link to="/admin" onClick={() => setIsUserDropdownOpen(false)} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Quản trị
                    </Link>
                  )}
                </div>
                <div className="py-1 border-t">
                  <button onClick={handleLogout} className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Đăng xuất
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;