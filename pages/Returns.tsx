import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import FilterBar from '../components/ui/FilterBar';
import SummaryCard from '../components/ui/SummaryCard';
import Pagination from '../components/ui/Pagination';
import { TableActions } from '../components/ui/TableActions';
import VoucherModal from '../components/modals/VoucherModal';
import { Page, ReturnVoucher, ReturnReason, ReturnHandlingMethod } from '../types';
import PrintVoucherTemplate from '../components/print/PrintVoucherTemplate';
import { orderService } from '../src/services/orderService';
import { useBranch } from '../contexts/BranchContext';
import { ReturnIcon, PlusIcon, ExportIcon, EditIcon, DeleteIcon, ArrowsUpDownIcon, ArrowUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/icons/Icons';
import { formatDate } from '../src/utils/dateUtils';
import { useNotification } from '../contexts/NotificationContext';
import { excelUtils } from '../src/utils/excelUtils';
import { RecordHistoryModal } from '../components/modals/RecordHistoryModal';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message }) => {
  useEffect(() => {
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
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Hủy</button>
          <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700">Xác nhận Xóa</button>
        </div>
      </div>
    </div>
  );
};



const allColumns = [
  { key: 'code', label: 'Mã phiếu' },
  { key: 'customer_name', label: 'Khách hàng' },
  { key: 'return_date', label: 'Ngày trả' },
  { key: 'total_amount', label: 'Tổng tiền' },
  { key: 'reason', label: 'Lý do' },
  { key: 'handling_method', label: 'Phương thức xử lý' },
  { key: 'handler_user', label: 'Người xử lý' },
];

const Returns: React.FC = () => {
  const { showNotification } = useNotification();
  const { selectedFacilityId, currentUser } = useBranch();
  const [returnVouchers, setReturnVouchers] = useState<ReturnVoucher[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [printItem, setPrintItem] = useState<ReturnVoucher | null>(null);
  const [isPrinting, setIsPrinting] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<ReturnVoucher | null>(null);
  const [editItem, setEditItem] = useState<ReturnVoucher | null>(null);
  const [voucherModal, setVoucherModal] = useState({ isOpen: false, type: '' });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [visibleColumns, setVisibleColumns] = useState(["code", "customer_name", "return_date", "total_amount", "reason", "handling_method", "handler_user"]);
  const [timeFilter, setTimeFilter] = useState<{ filter: string; dates?: { from: Date; to: Date } }>({ filter: 'All time' });
  const [historyModal, setHistoryModal] = useState<{ isOpen: boolean; recordId: string; recordCode: string } | null>(null);

  const isAdmin = currentUser?.is_admin === true ||
    ['admin', 'Admin', 'Quản trị viên', 'Kế toán HO', 'Ban Lãnh đạo', 'Quản lý Chi nhánh'].includes(currentUser?.role || '');

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const actionParam = searchParams.get('action');
  const voucherIdParam = searchParams.get('voucherId');

  useEffect(() => {
    fetchReturnVouchers();
  }, [selectedFacilityId, currentUser]);

  useEffect(() => {
    if (isPrinting && printItem) {
      const timer = setTimeout(() => {
        window.print();
        setIsPrinting(false);
        setPrintItem(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPrinting, printItem]);

  const fetchReturnVouchers = async () => {
    try {
      setLoading(true);
      const isAdmin = currentUser?.is_admin === true ||
        ['admin', 'Admin', 'Quản trị viên', 'Kế toán HO', 'Ban Lãnh đạo', 'Quản lý Chi nhánh'].includes(currentUser?.role || '');
      const employeeIdFilter = !isAdmin ? currentUser?.id : undefined;
      const data = await orderService.getReturnVouchers(selectedFacilityId || undefined, employeeIdFilter);
      setReturnVouchers(data);

      if (actionParam === 'view' && voucherIdParam) {
        const itemToView = data.find(v => String(v.id) === voucherIdParam);
        if (itemToView) {
          setExpandedId(String(itemToView.id));
        }
      }
    } catch (error) {
      console.error("Failed to fetch return vouchers", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeFilterChange = (filter: string, dates?: { from: Date; to: Date }) => {
    setTimeFilter({ filter, dates });
    setCurrentPage(1);
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...returnVouchers];

    // Time filtering
    const now = new Date();
    let fromDate: Date | null = null;
    let toDate: Date | null = new Date();
    toDate.setHours(23, 59, 59, 999);

    switch (timeFilter.filter) {
      case 'Hôm nay': fromDate = new Date(); fromDate.setHours(0, 0, 0, 0); break;
      case 'Hôm qua':
        fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 1);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setDate(toDate.getDate() - 1);
        toDate.setHours(23, 59, 59, 999);
        break;
      case 'Tuần này': fromDate = new Date(); const dayOfWeek = fromDate.getDay(); const diff = fromDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1); fromDate = new Date(fromDate.setDate(diff)); fromDate.setHours(0, 0, 0, 0); break;
      case 'Tháng này': fromDate = new Date(now.getFullYear(), now.getMonth(), 1); break;
      case 'Quý này': const quarter = Math.floor(now.getMonth() / 3); fromDate = new Date(now.getFullYear(), quarter * 3, 1); break;
      case 'Năm nay': fromDate = new Date(now.getFullYear(), 0, 1); break;
      case 'Tùy chọn':
        fromDate = timeFilter.dates?.from ? new Date(timeFilter.dates.from) : null;
        toDate = timeFilter.dates?.to ? new Date(timeFilter.dates.to) : null;
        if (fromDate) fromDate.setHours(0, 0, 0, 0);
        if (toDate) toDate.setHours(23, 59, 59, 999);
        break;
      default: fromDate = null; toDate = null; break; // All time
    }

    if (fromDate || toDate) {
      sortableItems = sortableItems.filter(item => {
        const itemDate = new Date(item.return_date);
        if (fromDate && itemDate < fromDate) return false;
        if (toDate && itemDate > toDate) return false;
        return true;
      });
    }

    // Search filtering
    sortableItems = sortableItems.filter(item =>
      item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.related_order_code.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof ReturnVoucher];
        const bValue = b[sortConfig.key as keyof ReturnVoucher];
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }
        if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [returnVouchers, searchTerm, sortConfig, timeFilter]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEditClick = (item: ReturnVoucher) => { 
    setEditItem(item);
    setVoucherModal({ isOpen: true, type: 'return-voucher' });
  };
  const handleDeleteClick = (item: ReturnVoucher) => setItemToDelete(item);
  const handleConfirmDelete = async () => { 
    if (itemToDelete) {
      try {
        await orderService.deleteReturnVoucher(itemToDelete.id);
        showNotification(`Đã xóa phiếu "${itemToDelete.code}" thành công.`, 'success');
        fetchReturnVouchers();
      } catch (error) {
        console.error('Delete error:', error);
        showNotification('Xóa phiếu thất bại. Vui lòng thử lại.', 'error');
      }
    }
    setItemToDelete(null); 
    setExpandedId(null); 
  };

  const handlePrintVoucher = (item: ReturnVoucher) => {
    setPrintItem(item);
    setIsPrinting(true);
  };

  const handleExportVoucher = (item: ReturnVoucher) => {
    try {
      excelUtils.exportReturnVoucherStyled(item);
      showNotification(`Đã xuất phiếu "${item.code}" ra file Excel.`, 'success');
    } catch (error) {
      console.error('Export error:', error);
      showNotification('Xuất file thất bại. Vui lòng thử lại.', 'error');
    }
  };

  const renderCell = (item: ReturnVoucher, columnKey: string) => {
    switch (columnKey) {
      case 'code': return <span className="font-medium text-gray-900 whitespace-nowrap">{item.code}</span>;
      case 'total_amount': return <div className="font-medium text-red-600 text-right whitespace-nowrap tabular-nums">{item.total_amount.toLocaleString('vi-VN')} ₫</div>;
      case 'return_date': return formatDate(item.return_date);
      case 'handler_user': return item.assigned_user_names?.join(', ') || item.handler_user || 'N/A';
      default: const value = item[columnKey as keyof ReturnVoucher]; return typeof value === 'string' || typeof value === 'number' ? String(value) : 'N/A';
    }
  };

  const totalReturns = sortedData.length;
  const totalAmount = sortedData.reduce((sum, item) => sum + item.total_amount, 0);
  const summaryCards = [
    { title: 'Tổng số phiếu trả', value: String(totalReturns), icon: <ReturnIcon />, colorClass: 'bg-emerald-100 text-emerald-600' },
    { title: 'Tổng giá trị hàng trả', value: `${totalAmount.toLocaleString('vi-VN')} ₫`, icon: <ReturnIcon />, colorClass: 'bg-amber-100 text-amber-600' },
  ];

  return (
    <>
      <FilterBar onSearch={setSearchTerm} onTimeFilterChange={handleTimeFilterChange} pageTitle="Báo cáo Trả Hàng" backPath="/bao-cao" initialFilter="Tháng này" />

      {/* Desktop Summary Cards */}
      <div className="hidden md:flex md:space-x-4">
        {summaryCards.map((card, index) => (
          <SummaryCard
            key={index}
            title={card.title}
            value={card.value}
            icon={<div className="w-6 h-6">{card.icon}</div>}
            colorClass={card.colorClass}
          />
        ))}
      </div>

      {/* Mobile Summary Cards */}
      <div className="md:hidden grid grid-cols-2 gap-4">
        <div className="block bg-white p-3 rounded-lg shadow-sm">
          <p className="text-xs font-medium text-gray-500">Tổng phiếu trả hàng</p>
          <p className="text-base font-bold text-blue-600 mt-1">{String(totalReturns)}</p>
        </div>
        <div className="block bg-white p-3 rounded-lg shadow-sm">
          <p className="text-xs font-medium text-gray-500">Tổng tiền trả lại</p>
          <p className="text-base font-bold text-red-600 mt-1">{totalAmount.toLocaleString('vi-VN')} ₫</p>
        </div>
      </div>


      <TableActions
        onSearch={setSearchTerm}
        searchPlaceholder="Tìm theo mã phiếu, khách hàng..."
        primaryActions={[
          { label: 'Tạo phiếu trả hàng', icon: <PlusIcon />, onClick: () => setVoucherModal({ isOpen: true, type: 'return-voucher' }) },
          { label: 'Xuất file', icon: <ExportIcon />, onClick: () => { }, variant: 'secondary' },
        ]}
        columns={allColumns}
        visibleColumns={visibleColumns}
        onVisibleColumnsChange={setVisibleColumns}
      />

      <div className="hidden md:block bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 bg-gray-50">
              <tr>{allColumns.filter(c => visibleColumns.includes(c.key)).map(col => {
                const isNumeric = ['total_amount'].includes(col.key);
                return (
                  <th key={col.key} scope="col" className={`px-6 py-3 cursor-pointer ${isNumeric ? 'text-right' : 'text-left'}`} onClick={() => requestSort(col.key)}>
                    <div className={`flex items-center min-w-0 ${isNumeric ? 'justify-end' : ''}`}>
                      {col.label}
                      <span className="ml-1.5 shrink-0">{sortConfig?.key === col.key ? (sortConfig.direction === 'ascending' ? <ArrowUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4 ml-0" />) : (<ArrowsUpDownIcon className="h-4 w-4 text-gray-300" />)}</span>
                    </div>
                  </th>
                );
              })}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((item) => {
                const isExpanded = expandedId === String(item.id);
                return (
                  <React.Fragment key={item.id}>
                    <tr 
                      className={`bg-white border-b hover:bg-gray-50 cursor-pointer transition-colors duration-200 ${isExpanded ? 'bg-blue-50/20' : ''}`} 
                      onClick={() => setExpandedId(prev => prev === String(item.id) ? null : String(item.id))}
                    >
                      {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => (
                        <td key={col.key} className="px-6 py-4">
                          {col.key === 'code' ? (
                            <div className="flex items-center space-x-2">
                              <span className={`transform transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-90' : ''}`}>
                                <ChevronRightIcon className="w-4 h-4 text-gray-400" />
                              </span>
                              {renderCell(item, col.key)}
                            </div>
                          ) : (
                            renderCell(item, col.key)
                          )}
                        </td>
                      ))}
                    </tr>
                    {isExpanded && (
                      <tr className="bg-gray-50/30">
                        <td colSpan={allColumns.filter(c => visibleColumns.includes(c.key)).length} className="px-8 py-6 border-b">
                          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="p-5">
                              <div className="flex justify-between items-start mb-6">
                                <div>
                                  <h4 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                    <span>Chi tiết phiếu trả hàng</span>
                                    <span className="text-blue-600 bg-blue-50 px-2 py-0.5 rounded text-xs font-semibold">{item.code}</span>
                                  </h4>
                                  <p className="text-xs text-gray-500 mt-1">Ngày trả hàng: {formatDate(item.return_date)}</p>
                                </div>
                                <div className="flex space-x-2 shrink-0">
                                  <button onClick={() => handlePrintVoucher(item)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3] transition-colors whitespace-nowrap">
                                    In phiếu
                                  </button>
                                  <button onClick={() => handleExportVoucher(item)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200 transition-colors whitespace-nowrap">
                                    Xuất file
                                  </button>
                                  {isAdmin && (
                                    <button 
                                      onClick={() => setHistoryModal({ isOpen: true, recordId: String(item.id), recordCode: item.code })} 
                                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap"
                                    >
                                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3.5 h-3.5 text-gray-500">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                      </svg>
                                      Lịch sử
                                    </button>
                                  )}
                                  <button onClick={() => handleEditClick(item)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors whitespace-nowrap">
                                    Sửa
                                  </button>
                                  <button onClick={() => handleDeleteClick(item)} className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors whitespace-nowrap">
                                    Xóa
                                  </button>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-sm mb-6 border-b pb-6">
                                <div>
                                  <p className="text-gray-400 text-xs uppercase font-semibold">Khách hàng</p>
                                  <p className="text-gray-900 font-medium mt-1">{item.customer_name}</p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs uppercase font-semibold">Đơn gốc / Phương thức xử lý</p>
                                  <p className="text-gray-950 mt-1">
                                    Đơn gốc: <span className="text-blue-600 font-medium hover:underline cursor-pointer">{item.related_order_code}</span>
                                    <br />
                                    Xử lý: <span className="font-medium text-gray-950">{item.handling_method}</span>
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs uppercase font-semibold">Lý do & Ghi chú</p>
                                  <p className="text-gray-950 mt-1">
                                    Lý do: <span className="font-medium text-gray-950">{item.reason}</span>
                                    {item.notes && (
                                      <>
                                        <br />
                                        Ghi chú: <span className="text-gray-500 italic">{item.notes}</span>
                                      </>
                                    )}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-gray-400 text-xs uppercase font-semibold">Giá trị & Người xử lý</p>
                                  <p className="text-gray-950 mt-1">
                                    Tổng tiền: <span className="font-bold text-red-600">{(item.total_amount || 0).toLocaleString('vi-VN')} ₫</span>
                                    <br />
                                    Nhân viên: <span className="font-medium text-gray-950">{item.assigned_user_names?.join(', ') || item.handler_user || 'N/A'}</span>
                                  </p>
                                </div>
                              </div>

                              <div>
                                <h5 className="font-semibold text-gray-700 text-xs uppercase mb-3">Chi tiết mặt hàng trả lại</h5>
                                <div className="overflow-x-auto border border-gray-100 rounded-lg">
                                  <table className="w-full text-sm text-left text-gray-600">
                                    <thead className="bg-gray-50 text-gray-700 text-xs uppercase">
                                      <tr>
                                        <th className="p-3 text-center w-12">Stt</th>
                                        <th className="p-3">Tên sản phẩm</th>
                                        <th className="p-3 text-center w-24">ĐVT</th>
                                        <th className="p-3 text-right w-28">Số lượng</th>
                                        <th className="p-3 text-right w-36">Đơn giá</th>
                                        <th className="p-3 text-right w-36">Thành tiền</th>
                                      </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                      {(item.items || []).map((orderItem, idx) => {
                                        const priceVal = orderItem.price ?? 0;
                                        const qtyVal = orderItem.quantity ?? 0;
                                        return (
                                          <tr key={orderItem.id || idx} className="hover:bg-gray-50/50">
                                            <td className="p-3 text-center text-gray-400 font-medium">{idx + 1}</td>
                                            <td className="p-3 font-medium text-gray-900">{(orderItem.product?.name) || 'Unknown'}</td>
                                            <td className="p-3 text-center">{(orderItem.product?.unit) || 'N/A'}</td>
                                            <td className="p-3 text-right font-medium tabular-nums">{qtyVal}</td>
                                            <td className="p-3 text-right tabular-nums">{priceVal.toLocaleString('vi-VN')} ₫</td>
                                            <td className="p-3 text-right font-semibold text-gray-950 tabular-nums">{(qtyVal * priceVal).toLocaleString('vi-VN')} ₫</td>
                                          </tr>
                                        );
                                      })}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }} totalItems={sortedData.length} />
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden mt-4 space-y-3">
        {paginatedData.map((item) => {
          const isExpanded = expandedId === String(item.id);
          return (
            <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-100 overflow-hidden">
              <div
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${isExpanded ? 'bg-blue-50/20' : ''}`}
                onClick={() => setExpandedId(prev => prev === String(item.id) ? null : String(item.id))}
              >
                <div className="flex justify-between items-start text-sm">
                  <div className="pr-2">
                    <div className="flex items-center space-x-2">
                      <span className={`transform transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-90' : ''}`}>
                        <ChevronRightIcon className="w-3.5 h-3.5 text-gray-400" />
                      </span>
                      <p className="font-semibold text-gray-800 leading-tight">{item.code}</p>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 pl-5.5">{item.customer_name}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold whitespace-nowrap text-red-600">
                      - {(item.total_amount || 0).toLocaleString('vi-VN')} ₫
                    </p>
                    <p className="text-xs text-gray-500 mt-1">{item.reason}</p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-2 pl-5.5">
                  <p className="text-xs text-gray-500">{item.handling_method}</p>
                  <p className="text-xs text-gray-400">{formatDate(item.return_date)}</p>
                </div>
              </div>

              {isExpanded && (
                <div className="border-t border-gray-100 p-4 bg-gray-50/50 space-y-4 text-xs" onClick={e => e.stopPropagation()}>
                  <div className="grid grid-cols-2 gap-3 text-gray-700">
                    <div>
                      <span className="text-gray-400 uppercase tracking-wider block font-semibold text-[10px]">Đơn hàng gốc</span>
                      <span className="font-medium text-gray-900 mt-0.5 block">{item.related_order_code}</span>
                    </div>
                    <div>
                      <span className="text-gray-400 uppercase tracking-wider block font-semibold text-[10px]">Nhân viên xử lý</span>
                      <span className="font-medium text-gray-900 mt-0.5 block">{item.assigned_user_names?.join(', ') || item.handler_user || 'N/A'}</span>
                    </div>
                    <div className="col-span-2">
                      <span className="text-gray-400 uppercase tracking-wider block font-semibold text-[10px]">Ghi chú</span>
                      <span className="text-gray-800 mt-0.5 block italic">{item.notes || 'Không có ghi chú'}</span>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-3">
                    <p className="font-bold text-gray-800 uppercase tracking-wider text-[10px] mb-2">Chi tiết sản phẩm</p>
                    <div className="space-y-2">
                      {(item.items || []).map((orderItem, idx) => {
                        const priceVal = orderItem.price ?? 0;
                        const qtyVal = orderItem.quantity ?? 0;
                        return (
                          <div key={orderItem.id || idx} className="bg-white p-2.5 rounded border border-gray-100 flex justify-between items-center">
                            <div>
                              <p className="font-semibold text-gray-900">{(orderItem.product?.name) || 'Unknown'}</p>
                              <p className="text-[10px] text-gray-400 mt-0.5">
                                Đơn giá: {priceVal.toLocaleString('vi-VN')} ₫ | ĐVT: {(orderItem.product?.unit) || 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-bold text-gray-900">x{qtyVal}</p>
                              <p className="font-semibold text-blue-600 mt-0.5">{(qtyVal * priceVal).toLocaleString('vi-VN')} ₫</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 border-t border-gray-100 pt-3">
                    <button onClick={() => handlePrintVoucher(item)} className="px-3 py-1.5 bg-[#0066cc] text-white rounded font-medium hover:bg-[#0052a3] transition-colors">
                      In phiếu
                    </button>
                    <button onClick={() => handleExportVoucher(item)} className="px-3 py-1.5 bg-green-100 text-green-700 border border-green-200 rounded font-medium hover:bg-green-200 transition-colors">
                      Xuất
                    </button>
                    <button onClick={() => handleEditClick(item)} className="px-3 py-1.5 bg-white text-gray-800 border border-gray-300 rounded font-medium hover:bg-gray-50 transition-colors">
                      Sửa
                    </button>
                    <button onClick={() => handleDeleteClick(item)} className="px-3 py-1.5 bg-white text-red-600 border border-red-200 rounded font-medium hover:bg-red-50 transition-colors">
                      Xóa
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile Pagination */}
      <div className="md:hidden mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
          totalItems={sortedData.length}
          prevButtonContent={<ChevronLeftIcon />}
          nextButtonContent={<ChevronRightIcon />}
        />
      </div>

      <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleConfirmDelete} title={`Xác nhận Xóa`} message={`Bạn có chắc chắn muốn xóa phiếu "${itemToDelete?.code}" không?`} />
      <VoucherModal
        isOpen={voucherModal.isOpen}
        voucherType={voucherModal.type}
        initialData={editItem}
        onClose={() => {
          setVoucherModal({ isOpen: false, type: '' });
          setEditItem(null);
          fetchReturnVouchers();
        }}
      />

      {isPrinting && printItem && createPortal(
        <div id="print-section" className="hidden print:block bg-white p-0 m-0 z-[100]">
          <PrintVoucherTemplate voucherType="return-voucher" data={{
            code: printItem.code,
            date: printItem.return_date,
            partner: { name: printItem.customer_name },
            items: printItem.items.map(i => ({
              sku: i.product?.sku || 'N/A',
              name: i.product?.name || 'Unknown',
              unit: i.product?.unit || '?',
              quantity: i.quantity,
              price: i.price,
              total: i.quantity * i.price
            })),
            summary: {
              total: printItem.total_amount,
            },
            reason: printItem.reason,
            notes: `Đơn hàng gốc: ${printItem.related_order_code} - Xử lý: ${printItem.handling_method}`
          }} />
        </div>,
        document.body
      )}

      {historyModal && (
        <RecordHistoryModal
          isOpen={historyModal.isOpen}
          onClose={() => setHistoryModal(null)}
          tableName="vgvina_return_vouchers"
          recordId={historyModal.recordId}
          recordCode={historyModal.recordCode}
        />
      )}
    </>
  );
};

export default Returns;