import React from 'react';
import { Link } from 'react-router-dom';
import { AccountIcon, CategoryIcon, DoiTacIcon, NguoiDungIcon, HistoryIcon } from '../components/icons/Icons';

const Admin: React.FC = () => {
  const adminSections = [
    { name: 'Tài khoản', path: '/admin/tai-khoan', icon: <AccountIcon />, color: 'blue' },
    { name: 'Hạng mục', path: '/admin/hang-muc', icon: <CategoryIcon />, color: 'green' },
    { name: 'Đối tượng', path: '/admin/doi-tuong', icon: <DoiTacIcon />, color: 'purple' },
    { name: 'Chi nhánh', path: '/admin/chi-nhanh', icon: <CategoryIcon />, color: 'yellow' },
    { name: 'Thành viên', path: '/admin/thanh-vien', icon: <NguoiDungIcon />, color: 'indigo' },
    { name: 'Vai trò & Quyền', path: '/admin/roles', icon: <NguoiDungIcon />, color: 'orange' },
    { name: 'Kiểm tra lịch sử', path: '/admin/history', icon: <HistoryIcon />, color: 'teal' },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    orange: 'bg-orange-100 text-orange-600',
    teal: 'bg-teal-100 text-teal-600',
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Quản lý dữ liệu</h1>
        <p className="mt-2 text-lg text-gray-600">Chọn loại dữ liệu bạn muốn quản lý</p>
      </div>
      <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-6">
        {adminSections.map((section) => (
          <Link
            key={section.name}
            to={section.path}
            className="group block p-4 bg-white rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex flex-col items-center justify-center text-center">
              <div className={`flex items-center justify-center h-12 w-12 rounded-full ${colorClasses[section.color as keyof typeof colorClasses]} transition-colors duration-300 group-hover:bg-opacity-80 p-2`}>
                <div className="h-full w-full">{section.icon}</div>
              </div>
              <p className="mt-2 text-xs sm:text-sm font-semibold text-gray-800 h-10 flex items-center justify-center">{section.name}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Admin;
