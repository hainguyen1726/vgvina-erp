import React, { useState, useMemo, useEffect } from 'react';
import { formatDate } from '../src/utils/dateUtils';
import { useLocation } from 'react-router-dom';
import FilterBar from '../components/ui/FilterBar';
import SummaryCard from '../components/ui/SummaryCard';
import Pagination from '../components/ui/Pagination';
import { TableActions } from '../components/ui/TableActions';
import VoucherModal from '../components/modals/VoucherModal';
import { Page, PurchaseOrder, OrderStatus } from '../types';
// import { purchaseOrders as mockOrders } from '../data/mockData';
const mockOrders: PurchaseOrder[] = [];
import { KhoIcon, ThuChiIcon, CongNoIcon, PlusIcon, ExportIcon, EditIcon, DeleteIcon } from '../components/icons/Icons';

// Confirmation Modal Component
interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (isOpen) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose]);
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <p className="mt-2 text-sm text-gray-600">{message}</p>
        </div>
        <div className="border-t p-4 flex justify-end bg-gray-50 rounded-b-lg space-x-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
            Hủy
          </button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700">
            Xác nhận Xóa
          </button>
        </div>
      </div>
    </div>
  );
};

const getStatusBadge = (status: OrderStatus) => {
  switch (status) {
    case OrderStatus.COMPLETED:
      return <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Hoàn thành</span>;
    case OrderStatus.PENDING:
      return <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">Chờ xử lý</span>;
    case OrderStatus.DELIVERED:
      return <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">Đã giao</span>;
    case OrderStatus.CANCELLED:
      return <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">Đã hủy</span>;
    default:
      return <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">Không xác định</span>;
  }
};

// Modal Component for Order Details
const DetailModal = ({ item, onClose, onEditClick, onDeleteClick }: { item: PurchaseOrder | null, onClose: () => void, onEditClick: (item: PurchaseOrder) => void, onDeleteClick: (item: PurchaseOrder) => void }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">Chi tiết phiếu nhập</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div><strong className="font-medium text-gray-600">Mã phiếu:</strong> <span className="text-gray-800">{item.code}</span></div>
            <div><strong className="font-medium text-gray-600">Ngày đặt:</strong> <span className="text-gray-800">{formatDate(item.order_date)}</span></div>
            <div className="col-span-2"><strong className="font-medium text-gray-600">Nhà cung cấp:</strong> <span className="text-gray-800">{item.supplier_name}</span></div>
            <div><strong className="font-medium text-gray-600">Tổng tiền:</strong> <span className="font-semibold text-blue-600">{item.total_amount.toLocaleString('vi-VN')} ₫</span></div>
            <div><strong className="font-medium text-gray-600">Đã thanh toán:</strong> <span className="font-semibold text-green-600">{item.amount_paid.toLocaleString('vi-VN')} ₫</span></div>
            <div><strong className="font-medium text-gray-600">Trạng thái:</strong> {getStatusBadge(item.status)}</div>
            <div><strong className="font-medium text-gray-600">Chi nhánh:</strong> <span className="text-gray-800">{item.facility_name}</span></div>
            <div className="col-span-2"><strong className="font-medium text-gray-600">Nhân viên:</strong> <span className="text-gray-800">{(item.assigned_user_names || []).join(', ')}</span></div>
          </div>
        </div>
        <div className="border-t p-4 flex justify-between items-center bg-gray-50 rounded-b-lg">
          <div className="flex items-center gap-2">
            <button onClick={() => onEditClick(item)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">
              <EditIcon className="w-4 h-4" /> Sửa
            </button>
            <button onClick={() => onDeleteClick(item)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100">
              <DeleteIcon className="w-4 h-4" /> Xóa
            </button>
          </div>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Đóng</button>
        </div>
      </div>
    </div>
  );
};


const allColumns = [
  { key: 'code', label: 'Mã phiếu' },
  { key: 'supplier_name', label: 'Nhà cung cấp' },
  { key: 'total_amount', label: 'Tổng tiền' },
  { key: 'amount_paid', label: 'Đã thanh toán' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'assigned_user', label: 'Nhân viên' },
  { key: 'facility_name', label: 'Chi nhánh' },
];

const ReportPurchasing: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleColumns, setVisibleColumns] = useState(["code", "supplier_name", "total_amount", "amount_paid", "status", "assigned_user", "facility_name"]);
  const [modalItem, setModalItem] = useState<PurchaseOrder | null>(null);
  const [itemToDelete, setItemToDelete] = useState<PurchaseOrder | null>(null);
  const [voucherModal, setVoucherModal] = useState({ isOpen: false, type: '' });

  const handleOpenVoucherModal = (type: string) => {
    setVoucherModal({ isOpen: true, type });
  };

  const handleCloseVoucherModal = () => {
    setVoucherModal({ isOpen: false, type: '' });
  };


  const filteredOrders = useMemo(() => {
    return mockOrders.filter(order =>
      order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.supplier_name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const groupedOrders = paginatedOrders.reduce((acc, order) => {
    const date = order.order_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(order);
    return acc;
  }, {} as Record<string, PurchaseOrder[]>);

  const handleEditClick = (item: PurchaseOrder) => {
    console.log("Editing order:", item.id);
    setModalItem(null);
  };

  const handleDeleteClick = (item: PurchaseOrder) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      console.log("Deleting order:", itemToDelete.id);
    }
    setItemToDelete(null);
    setModalItem(null);
  };


  const renderCell = (order: PurchaseOrder, columnKey: string) => {
    switch (columnKey) {
      case 'code':
        return <span className="font-medium text-gray-900 whitespace-nowrap">{order.code}</span>;
      case 'total_amount':
        return <div className="text-right whitespace-nowrap tabular-nums">{order.total_amount.toLocaleString('vi-VN')} ₫</div>;
      case 'amount_paid':
        return <div className="text-right whitespace-nowrap tabular-nums">{order.amount_paid.toLocaleString('vi-VN')} ₫</div>;
      case 'status':
        return getStatusBadge(order.status);
      default:
        const value = order[columnKey as keyof PurchaseOrder];
        return typeof value === 'string' || typeof value === 'number' ? String(value) : 'N/A';
    }
  };

  return (
    <>
      <FilterBar onSearch={setSearchTerm} onTimeFilterChange={() => { }} pageTitle={Page.NhapHang} />

      <div className="flex space-x-4">
        <SummaryCard title="Tổng tiền nhập" value="1.8 Tỷ" icon={<KhoIcon />} colorClass="bg-blue-100 text-blue-600" />
        <SummaryCard title="Đã thanh toán" value="1.1 Tỷ" icon={<ThuChiIcon />} colorClass="bg-green-100 text-green-600" />
        <SummaryCard title="Còn phải trả" value="700 Tr" icon={<CongNoIcon />} colorClass="bg-red-100 text-red-600" />
      </div>

      <TableActions
        onSearch={setSearchTerm}
        searchPlaceholder="Tìm theo mã phiếu, NCC..."
        primaryActions={[
          { label: 'Nhập hàng', icon: <PlusIcon />, onClick: () => handleOpenVoucherModal('purchase-order') },
          { label: 'Xuất file', icon: <ExportIcon />, onClick: () => { }, variant: 'secondary' },
        ]}
        columns={allColumns}
        visibleColumns={visibleColumns}
        onVisibleColumnsChange={setVisibleColumns}
      />

      <div className="bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 bg-gray-50">
              <tr>
                {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => {
                  const isNumeric = ['total_amount', 'amount_paid'].includes(col.key);
                  return (
                    <th key={col.key} scope="col" className={`px-6 py-3 cursor-pointer ${isNumeric ? 'text-right' : 'text-left'}`}>
                      {col.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedOrders).map(([date, orders]: [string, PurchaseOrder[]]) => (
                <React.Fragment key={date}>
                  <tr className="bg-gray-50 border-t border-b">
                    <td colSpan={visibleColumns.length} className="px-6 py-2 font-bold text-gray-700">
                      {formatDate(date)}
                    </td>
                  </tr>
                  {orders.map((order) => (
                    <tr key={order.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => setModalItem(order)}>
                      {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => (
                        <td key={col.key} className="px-6 py-4">{renderCell(order, col.key)}</td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
            totalItems={filteredOrders.length}
          />
        </div>
      </div>
      <DetailModal item={modalItem} onClose={() => setModalItem(null)} onEditClick={handleEditClick} onDeleteClick={handleDeleteClick} />
      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận Xóa Phiếu Nhập"
        message={`Bạn có chắc chắn muốn xóa phiếu nhập "${itemToDelete?.code}" không? Hành động này không thể hoàn tác.`}
      />
      <VoucherModal
        isOpen={voucherModal.isOpen}
        voucherType={voucherModal.type}
        onClose={handleCloseVoucherModal}
      />
    </>
  );
};

export default ReportPurchasing;