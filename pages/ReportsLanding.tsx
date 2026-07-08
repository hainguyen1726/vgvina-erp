import React from 'react';
import { Link } from 'react-router-dom';
import { DonHangIcon, PieChartIcon, DoiTacIcon, DuplicateIcon, KhoIcon, ReturnIcon, DeleteIcon, ArrowsUpDownIcon } from '../components/icons/Icons';

const ReportsLanding: React.FC = () => {
  const reportSections = [
    { name: 'Xuất/Nhập', path: '/bao-cao/xuat-nhap', icon: <DonHangIcon />, color: 'blue' },
    { name: 'Bán hàng theo Hàng hóa', path: '/bao-cao/ban-hang-hang-hoa', icon: <DonHangIcon />, color: 'green' },
    { name: 'Tồn kho', path: '/bao-cao/ton-kho', icon: <KhoIcon />, color: 'orange' },
    { name: 'Tổng hợp Xuất Nhập Tồn', path: '/bao-cao/xuat-nhap-ton', icon: <KhoIcon />, color: 'teal' },
    { name: 'Chuyển Kho', path: '/bao-cao/chuyen-kho', icon: <ArrowsUpDownIcon className="w-full h-full" />, color: 'purple' },
    { name: 'Thu chi theo Hạng mục', path: '/bao-cao/thu-chi-hang-muc', icon: <PieChartIcon className="h-full w-full" />, color: 'green' },

    { name: 'Thu chi theo Đối tượng', path: '/bao-cao/thu-chi-doi-tuong', icon: <DoiTacIcon />, color: 'purple' },
    { name: 'Sổ chi tiết Công nợ', path: '/bao-cao/so-chi-tiet-cong-no', icon: <DoiTacIcon />, color: 'cyan' },
    { name: 'Báo cáo Trùng lặp', path: '/bao-cao/trung-lap', icon: <DuplicateIcon />, color: 'yellow' },
    { name: 'Báo cáo Trả Hàng', path: '/bao-cao/tra-hang', icon: <ReturnIcon />, color: 'red' },
    { name: 'Báo cáo Hủy Hàng', path: '/bao-cao/huy-hang', icon: <DeleteIcon />, color: 'gray' },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    orange: 'bg-orange-100 text-orange-600',
    red: 'bg-red-100 text-red-600',
    gray: 'bg-gray-200 text-gray-600',
    teal: 'bg-teal-100 text-teal-600',
    cyan: 'bg-cyan-100 text-cyan-600',
  };

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900">Trung tâm Báo cáo</h1>
        <p className="mt-2 text-lg text-gray-600">Chọn loại báo cáo bạn muốn xem</p>
      </div>
      <div className="mt-12 grid grid-cols-3 gap-4 sm:gap-6">
        {reportSections.map((section) => (
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

export default ReportsLanding;