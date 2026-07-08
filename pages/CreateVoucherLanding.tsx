import React, { useState } from 'react';
import { Page } from '../types';
import VoucherModal from '../components/modals/VoucherModal';
import { DonHangIcon, PlusIcon, CongNoIcon, DeleteIcon, ReturnIcon, ArrowsUpDownIcon, ThuChiIcon } from '../components/icons/Icons';
import { useBranch } from '../contexts/BranchContext';

const CreateVoucherLanding: React.FC = () => {
  const { can } = useBranch();
  const [voucherModal, setVoucherModal] = useState({ isOpen: false, type: '' });

  const handleOpenVoucherModal = (type: string) => {
    setVoucherModal({ isOpen: true, type });
  };

  const handleCloseVoucherModal = () => {
    setVoucherModal({ isOpen: false, type: '' });
  };

  const voucherSections = [
    { name: 'Phiếu Thu/Chi', type: 'income-expense-voucher', icon: <ThuChiIcon />, color: 'cyan', module: 'financial_transactions' },
    { name: 'Phiếu Nhập Hàng', type: 'purchase-order', icon: <PlusIcon />, color: 'blue', module: 'purchase_orders' },
    { name: 'Phiếu Giao Hàng', type: 'delivery-note', icon: <DonHangIcon />, color: 'blue', module: 'sales_orders' },
    { name: 'Phiếu Chuyển Kho', type: 'internal-transfer', icon: <ArrowsUpDownIcon className="w-full h-full" />, color: 'teal', module: 'inventory' },
    { name: 'Phiếu Trả Hàng', type: 'return-voucher', icon: <ReturnIcon />, color: 'orange', module: 'sales_orders' },
    { name: 'Phiếu Hủy Hàng', type: 'scrapping-voucher', icon: <DeleteIcon />, color: 'gray', module: 'inventory' },
    { name: 'Thông Báo Công Nợ', type: 'debt-notice', icon: <CongNoIcon />, color: 'yellow', module: 'debt' },
  ];

  const allowedVoucherSections = voucherSections.filter(section => can(section.module, 'create'));

  const colorClasses = {
    cyan: 'bg-cyan-100 text-cyan-600',
    green: 'bg-green-100 text-green-600',
    red: 'bg-red-100 text-red-600',
    blue: 'bg-blue-100 text-blue-600',
    teal: 'bg-teal-100 text-teal-600',
    orange: 'bg-orange-100 text-orange-600',
    gray: 'bg-gray-200 text-gray-600',
    yellow: 'bg-yellow-100 text-yellow-600',
  };

  return (
    <>
      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">{Page.TaoPhieu}</h1>
          <p className="mt-2 text-lg text-gray-600">Chọn loại phiếu bạn muốn tạo</p>
        </div>
        <div className="mt-12 grid grid-cols-3 sm:grid-cols-4 gap-4">
          {allowedVoucherSections.length > 0 ? (
            allowedVoucherSections.map((section) => (
              <button
                key={section.name}
                onClick={() => handleOpenVoucherModal(section.type)}
                className="group block p-3 bg-white rounded-xl shadow-md hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300 text-center"
              >
                <div className="flex flex-col items-center justify-center">
                  <div className={`flex items-center justify-center h-12 w-12 rounded-full ${colorClasses[section.color as keyof typeof colorClasses]} transition-colors duration-300 group-hover:bg-opacity-80 p-2`}>
                    <div className="h-full w-full">{section.icon}</div>
                  </div>
                  <p className="mt-2 text-xs font-semibold text-gray-800 h-8 flex items-center justify-center">{section.name}</p>
                </div>
              </button>
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-gray-500">
              Bạn không có quyền tạo bất kỳ loại phiếu nào. Vui lòng liên hệ quản trị viên.
            </div>
          )}
        </div>
      </div>
      <VoucherModal
        isOpen={voucherModal.isOpen}
        voucherType={voucherModal.type}
        onClose={handleCloseVoucherModal}
      />
    </>
  );
};

export default CreateVoucherLanding;