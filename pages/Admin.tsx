import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { AccountIcon, CategoryIcon, DoiTacIcon, NguoiDungIcon, HistoryIcon } from '../components/icons/Icons';
import { debtService } from '../src/services/debtService';
import { useBranch } from '../contexts/BranchContext';
import { useNotification } from '../contexts/NotificationContext';

const SyncIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-full h-full">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
  </svg>
);

const Admin: React.FC = () => {
  const { currentUser } = useBranch();
  const { showNotification } = useNotification();
  const [isSyncing, setIsSyncing] = useState(false);

  const adminSections = [
    { name: 'Tài khoản', path: '/admin/tai-khoan', icon: <AccountIcon />, color: 'blue' },
    { name: 'Hạng mục', path: '/admin/hang-muc', icon: <CategoryIcon />, color: 'green' },
    { name: 'Danh mục sản phẩm', path: '/admin/danh-muc-san-pham', icon: <CategoryIcon />, color: 'pink' },
    { name: 'Đối tượng', path: '/admin/doi-tuong', icon: <DoiTacIcon />, color: 'purple' },
    { name: 'Chi nhánh', path: '/admin/chi-nhanh', icon: <CategoryIcon />, color: 'yellow' },
    { name: 'Thành viên', path: '/admin/thanh-vien', icon: <NguoiDungIcon />, color: 'indigo' },
    { name: 'Vai trò & Quyền', path: '/admin/roles', icon: <NguoiDungIcon />, color: 'orange' },
    { name: 'Kiểm tra lịch sử', path: '/admin/history', icon: <HistoryIcon />, color: 'teal' },
  ];

  const colorClasses = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    pink: 'bg-pink-100 text-pink-600',
    purple: 'bg-purple-100 text-purple-600',
    yellow: 'bg-yellow-100 text-yellow-600',
    indigo: 'bg-indigo-100 text-indigo-600',
    orange: 'bg-orange-100 text-orange-600',
    teal: 'bg-teal-100 text-teal-600',
  };

  const handleSyncAllDebts = async () => {
    if (isSyncing) return;
    const confirmSync = window.confirm(
      'Bạn có chắc chắn muốn tính toán và cấn trừ lại toàn bộ công nợ của tất cả đối tác theo thứ tự FIFO? Quá trình này sẽ sửa lại toàn bộ số liệu công nợ cũ cho khớp với dòng tiền thực tế.'
    );
    if (!confirmSync) return;

    try {
      setIsSyncing(true);
      showNotification('Bắt đầu đồng bộ và khớp công nợ toàn hệ thống...', 'info');
      await debtService.reconcileAllPartnersDebts(currentUser?.name || 'Admin');
      showNotification('Đồng bộ toàn bộ công nợ thành công!', 'success');
    } catch (error: any) {
      console.error('Error syncing all debts:', error);
      showNotification('Đồng bộ công nợ thất bại: ' + error.message, 'error');
    } finally {
      setIsSyncing(false);
    }
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

      {/* Công cụ hệ thống (System Tools) */}
      <div className="mt-10 border-t pt-8">
        <h2 className="text-lg font-bold text-gray-800 mb-4">Công cụ hệ thống</h2>
        <div className="bg-white rounded-xl shadow-md p-6 flex flex-col sm:flex-row items-center justify-between border border-gray-150">
          <div className="mb-4 sm:mb-0 sm:mr-6 text-center sm:text-left">
            <h3 className="font-semibold text-gray-800 flex items-center justify-center sm:justify-start">
              <span className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0"><SyncIcon /></span>
              Đồng bộ toàn bộ công nợ đối tác
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Quét toàn bộ hóa đơn và phiếu thu/chi trên hệ thống để tính toán, cấn trừ lại công nợ theo thứ tự FIFO (Vào trước Xuất trước).
            </p>
          </div>
          <button
            onClick={handleSyncAllDebts}
            disabled={isSyncing}
            className={`w-full sm:w-auto px-5 py-3 rounded-lg font-semibold text-white shadow-md transition-all duration-200 flex items-center justify-center ${
              isSyncing
                ? 'bg-blue-400 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg active:scale-95'
            }`}
          >
            {isSyncing ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang xử lý...
              </>
            ) : (
              '🔄 Đồng bộ ngay'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Admin;
