import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import FilterBar from '../components/ui/FilterBar';
import SummaryCard from '../components/ui/SummaryCard';
import Pagination from '../components/ui/Pagination';
import { TableActions } from '../components/ui/TableActions';
import VoucherModal from '../components/modals/VoucherModal';
import { Page, SalesOrder, PurchaseOrder, OrderStatus, OrderItem, TransactionType } from '../types';
import { orderService } from '../src/services/orderService';
import PrintVoucherTemplate from '../components/print/PrintVoucherTemplate';
// import { salesOrders as mockSalesOrders, purchaseOrders as mockPurchaseOrders } from '../data/mockData';
import { DonHangIcon, ThuChiIcon, CongNoIcon, PlusIcon, ExportIcon, EditIcon, DeleteIcon, KhoIcon, ArrowUpIcon, ChevronDownIcon, ArrowsUpDownIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/icons/Icons';
import { formatDate } from '../src/utils/dateUtils';
import { excelUtils } from '../src/utils/excelUtils';
import { useNotification } from '../contexts/NotificationContext';
import { useBranch } from '../contexts/BranchContext';

type OrderType = SalesOrder | PurchaseOrder;

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
export const SalesOrderDetailModal = ({ item, onClose, onEditClick, onDeleteClick, onReturnClick }: { item: OrderType | null, onClose: () => void, onEditClick: (item: OrderType) => void, onDeleteClick: (item: OrderType) => void, onReturnClick?: (item: OrderType) => void }) => {
  const { can } = useBranch();
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (item) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [item, onClose]);
  const { showNotification } = useNotification();
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (isPrinting) {
      const timer = setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPrinting]);

  if (!item) return null;
  const isSalesOrder = 'customer_name' in item;

  const handleExport = () => {
    try {
      excelUtils.exportOrdersKiotVietStyle([item], item.code, isSalesOrder);
      showNotification(`Đã xuất dữ liệu cho phiếu ${item.code} thành công.`, 'success');
    } catch (error: any) {
      showNotification(`Lỗi xuất file Excel: ${error.message}`, 'error');
    }
  };

  const getPrintData = () => {
    return {
      code: item.code,
      date: item.order_date,
      partner: { name: isSalesOrder ? (item as SalesOrder).customer_name : (item as PurchaseOrder).supplier_name },
      assignedUser: item.assigned_user_names?.join(', ') || (item as any).assigned_user || 'N/A',
      items: item.items.map(i => ({
        sku: i.product.sku,
        name: i.product.name,
        unit: i.product.unit,
        quantity: i.quantity,
        price: i.price,
        total: i.quantity * i.price
      })),
      summary: {
        total: item.total_amount,
        paid: item.amount_paid,
        remaining: item.total_amount - item.amount_paid
      },
      facility: item.facility_name, // Pass facility if template supports it, or put in notes
      notes: item.notes || '', // Pass actual order notes instead of branch name
    };
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center border-b p-4">
            <h3 className="text-lg font-semibold text-gray-800">Chi tiết {isSalesOrder ? 'đơn hàng' : 'phiếu nhập'}</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-3 gap-4 items-center text-sm">
                <p className="text-gray-500 col-span-1">Mã phiếu:</p>
                <p className="text-gray-800 font-medium col-span-2">{item.code}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center text-sm">
                <p className="text-gray-500 col-span-1">Ngày đặt:</p>
                <p className="text-gray-800 col-span-2">{formatDate(item.order_date)}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center text-sm">
                <p className="text-gray-500 col-span-1">{isSalesOrder ? 'Khách hàng' : 'Nhà cung cấp'}:</p>
                <p className="text-gray-800 font-medium col-span-2">{isSalesOrder ? (item as any).customer_name : (item as any).supplier_name}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center text-sm">
                <p className="text-gray-500 col-span-1">Tổng tiền:</p>
                <p className="font-semibold text-blue-600 col-span-2 text-right tabular-nums">{item.total_amount.toLocaleString('vi-VN')} ₫</p>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center text-sm">
                <p className="text-gray-500 col-span-1">Đã thanh toán:</p>
                <p className="font-semibold text-green-600 col-span-2 text-right tabular-nums">{item.amount_paid.toLocaleString('vi-VN')} ₫</p>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center text-sm">
                <p className="text-gray-500 col-span-1">Trạng thái:</p>
                <div className="col-span-2 flex justify-end">{getStatusBadge(item.status)}</div>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center text-sm">
                <p className="text-gray-500 col-span-1">Chi nhánh:</p>
                <p className="text-gray-800 col-span-2 text-right">{item.facility_name}</p>
              </div>
              <div className="grid grid-cols-3 gap-4 items-center text-sm">
                <p className="text-gray-500 col-span-1">Nhân viên:</p>
                <p className="text-gray-800 col-span-2 text-right">{item.assigned_user_names?.join(', ') || (item as any).assigned_user || 'N/A'}</p>
              </div>
              {item.notes && (
                <div className="grid grid-cols-3 gap-4 items-start text-sm">
                  <p className="text-gray-500 col-span-1">Ghi chú:</p>
                  <p className="text-gray-800 col-span-2 text-right italic whitespace-pre-wrap text-amber-800 bg-amber-50 p-2 rounded border border-amber-100">{item.notes}</p>
                </div>
              )}
            </div>
            <div className="pt-4 border-t col-span-2">
              <h4 className="font-semibold text-gray-700 mb-2">Chi tiết mặt hàng</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="p-2">Stt</th>
                      <th className="p-2">Tên sản phẩm</th>
                      <th className="p-2">Đvt</th>
                      <th className="p-2 text-right">Số lượng</th>
                      <th className="p-2 text-right">Đơn giá</th>
                      <th className="p-2 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {item.items.map((orderItem, index) => (
                      <tr key={orderItem.id}>
                        <td className="p-2 text-center">{index + 1}</td>
                        <td className="p-2">{orderItem.product.name}</td>
                        <td className="p-2">{orderItem.product.unit}</td>
                        <td className="p-2 text-right tabular-nums">{orderItem.quantity}</td>
                        <td className="p-2 text-right tabular-nums">{orderItem.price.toLocaleString('vi-VN')}</td>
                        <td className="p-2 text-right font-medium tabular-nums">{(orderItem.quantity * orderItem.price).toLocaleString('vi-VN')}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="bg-gray-50 font-semibold">
                      <td colSpan={5} className="p-2 text-right">Tổng cộng</td>
                      <td className="p-2 text-right text-blue-600">{item.total_amount.toLocaleString('vi-VN')} ₫</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>
          <div className="border-t p-4 flex justify-end items-center bg-gray-50 rounded-b-lg space-x-2">
            {isSalesOrder && item.status === OrderStatus.COMPLETED && (
              <button 
                onClick={() => onReturnClick?.(item)} 
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors"
                title="Khách trả hàng cho đơn này"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
                </svg>
                Trả hàng
              </button>
            )}
            <button onClick={() => setIsPrinting(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]">
              In phiếu
            </button>
            <button onClick={handleExport} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200">
              <ExportIcon className="w-4 h-4" /> Xuất file
            </button>
            {onEditClick && can(isSalesOrder ? 'sales_orders' : 'purchase_orders', 'edit') && (
              <button onClick={() => onEditClick(item)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50">
                <EditIcon className="w-4 h-4" /> Sửa
              </button>
            )}
            {onDeleteClick && can(isSalesOrder ? 'sales_orders' : 'purchase_orders', 'delete') && (
              <button onClick={() => onDeleteClick(item)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                <DeleteIcon className="w-4 h-4" /> Xóa
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Đóng</button>
          </div>
        </div>
      </div>

      {isPrinting && createPortal(
        <div id="print-section" className="hidden print:block bg-white p-0 m-0 z-[100]">
          <PrintVoucherTemplate voucherType={isSalesOrder ? 'delivery-note' : 'purchase-order'} data={getPrintData()} />
        </div>,
        document.body
      )}
    </>
  );
};

const ReportInventoryTransactions: React.FC = () => {
  const [viewMode, setViewMode] = useState<'export' | 'import'>('export');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(isMobile ? 8 : 30);
  const [searchTerm, setSearchTerm] = useState('');
  const [modalItem, setModalItem] = useState<OrderType | null>(null);
  const [itemToDelete, setItemToDelete] = useState<OrderType | null>(null);
  const [voucherModal, setVoucherModal] = useState<{ isOpen: boolean; type: string; initialData?: any }>({ isOpen: false, type: '' });
  const { showNotification } = useNotification();
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});

  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const actionParam = searchParams.get('action');
  const voucherIdParam = searchParams.get('voucherId');

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (mobile !== isMobile) {
        setIsMobile(mobile);
        setItemsPerPage(mobile ? 8 : 30);
        setCurrentPage(1);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  const handleOpenVoucherModal = (type: string, initialData?: any) => setVoucherModal({ isOpen: true, type, initialData });
  const handleCloseVoucherModal = () => { setVoucherModal({ isOpen: false, type: '' }); fetchOrders(); };

  const { selectedFacilityId, currentUser, can } = useBranch();
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (can('sales_orders', 'view')) {
      setViewMode('export');
    } else if (can('purchase_orders', 'view')) {
      setViewMode('import');
    }
  }, [currentUser]);

  useEffect(() => {
    fetchOrders();
  }, [selectedFacilityId, currentUser, dateRange]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const isAdmin = currentUser?.is_admin === true ||
        ['admin', 'Admin', 'Quản trị viên', 'Kế toán HO', 'Ban Lãnh đạo', 'Quản lý Chi nhánh'].includes(currentUser?.role || '');
      const employeeIdFilter = !isAdmin ? currentUser?.id : undefined;

      const [sales, purchases] = await Promise.all([
        orderService.getSalesOrders(selectedFacilityId || undefined, employeeIdFilter, dateRange.from, dateRange.to),
        orderService.getPurchaseOrders(selectedFacilityId || undefined, employeeIdFilter, dateRange.from, dateRange.to)
      ]);
      setSalesOrders(sales);
      setPurchaseOrders(purchases);

      if (actionParam === 'view' && voucherIdParam) {
        const itemToView = sales.find(s => String(s.id) === voucherIdParam) || purchases.find(p => String(p.id) === voucherIdParam);
        if (itemToView) {
          setViewMode('customer_name' in itemToView ? 'export' : 'import');
          setModalItem(itemToView);
        }
      }
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setLoading(false);
    }
  };

  const handleTimeFilterChange = (filter: string, dates?: { from: Date; to: Date }) => {
    if (filter === 'All time') {
      setDateRange({});
      return;
    }

    if (filter === 'Tùy chọn' && dates) {
      setDateRange({
        from: dates.from.toISOString().split('T')[0],
        to: dates.to.toISOString().split('T')[0]
      });
      return;
    }

    const now = new Date();
    let from: string | undefined;
    let to: string | undefined;

    switch (filter) {
      case 'Hôm nay':
        from = to = now.toISOString().split('T')[0];
        break;
      case 'Hôm qua':
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        from = to = yesterday.toISOString().split('T')[0];
        break;
      case 'Tuần này':
        const day = now.getDay();
        const diff = now.getDate() - (day === 0 ? 6 : day - 1);
        from = new Date(now.setDate(diff)).toISOString().split('T')[0];
        to = new Date().toISOString().split('T')[0];
        break;
      case 'Tháng này':
        from = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
        to = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
        break;
      case 'Quý này':
        const quarter = Math.floor(now.getMonth() / 3);
        from = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
        to = new Date(now.getFullYear(), (quarter + 1) * 3, 0).toISOString().split('T')[0];
        break;
      case 'Năm nay':
        from = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
        to = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
        break;
    }

    setDateRange({ from, to });
  };

  const handleExportExcel = () => {
    const isExport = viewMode === 'export';
    excelUtils.exportOrdersKiotVietStyle(sortedData, isExport ? 'DanhSachDonBanHang' : 'DanhSachDonNhapHang', isExport);
  };

  const { data, partnerLabel, searchPlaceholder, summaryCards, totalSalesOrders, totalPurchaseOrders } = useMemo(() => {
    const isExport = viewMode === 'export';
    const currentData = isExport ? salesOrders : purchaseOrders;

    // Calculate summaries based on REAL data
    const totalCount = currentData.length;
    const totalRevenue = currentData.reduce((acc, curr) => acc + (curr.total_amount || 0), 0);
    const totalPaid = currentData.reduce((acc, curr) => acc + (curr.amount_paid || 0), 0);
    const totalDebt = totalRevenue - totalPaid;

    const salesSummary = [
      { title: "Tổng số đơn", value: String(totalCount), icon: <DonHangIcon />, colorClass: "bg-blue-100 text-blue-600" },
      { title: "Tổng doanh thu", value: `${(totalRevenue / 1000000).toFixed(1)} Tr`, icon: <ThuChiIcon />, colorClass: "bg-green-100 text-green-600" },
      { title: "Còn phải thu", value: `${(totalDebt / 1000000).toFixed(1)} Tr`, icon: <CongNoIcon />, colorClass: "bg-yellow-100 text-yellow-600" }
    ];

    const purchaseSummary = [
      { title: "Tổng tiền nhập", value: `${(totalRevenue / 1000000).toFixed(1)} Tr`, icon: <KhoIcon />, colorClass: "bg-blue-100 text-blue-600" },
      { title: "Đã thanh toán", value: `${(totalPaid / 1000000).toFixed(1)} Tr`, icon: <ThuChiIcon />, colorClass: "bg-green-100 text-green-600" },
      { title: "Còn phải trả", value: `${(totalDebt / 1000000).toFixed(1)} Tr`, icon: <CongNoIcon />, colorClass: "bg-red-100 text-red-600" }
    ];

    const salesDataConfig = {
      data: salesOrders,
      partnerLabel: 'Khách hàng',
      searchPlaceholder: 'Tìm theo mã đơn, khách hàng...',
      summaryCards: salesSummary,
    };
    const purchaseDataConfig = {
      data: purchaseOrders,
      partnerLabel: 'Nhà cung cấp',
      searchPlaceholder: 'Tìm theo mã phiếu, NCC...',
      summaryCards: purchaseSummary,
    };
    return {
      ...(isExport ? salesDataConfig : purchaseDataConfig),
      totalSalesOrders: salesOrders.length,
      totalPurchaseOrders: purchaseOrders.length
    };
  }, [viewMode, salesOrders, purchaseOrders]);

  const allColumns = useMemo(() => [
    { key: 'code', label: 'Mã phiếu' },
    { key: 'partner_name', label: partnerLabel },
    { key: 'total_amount', label: 'Tổng tiền' },
    { key: 'amount_paid', label: 'Đã thanh toán' },
    { key: 'status', label: 'Trạng thái' },
    { key: 'assigned_user', label: 'Nhân viên' },
    { key: 'facility_name', label: 'Chi nhánh' },
    { key: 'order_date', label: 'Ngày' },
  ], [partnerLabel]);

  const [visibleColumns, setVisibleColumns] = useState(["code", "partner_name", "total_amount", "amount_paid", "status", "assigned_user", "facility_name", "order_date"]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableItems = [...data].filter(order => {
      const partnerName = 'customer_name' in order ? order.customer_name : order.supplier_name;
      return order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        partnerName.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (sortConfig) {
      sortableItems.sort((a, b) => {
        let aValue: any, bValue: any;

        if (sortConfig.key === 'partner_name') {
          aValue = 'customer_name' in a ? a.customer_name : a.supplier_name;
          bValue = 'customer_name' in b ? b.customer_name : b.supplier_name;
        } else {
          aValue = a[sortConfig.key as keyof OrderType];
          bValue = b[sortConfig.key as keyof OrderType];
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (sortConfig.key === 'order_date') {
            const dateA = new Date(aValue).getTime();
            const dateB = new Date(bValue).getTime();
            if (dateA < dateB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (dateA > dateB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
          }
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [searchTerm, data, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / itemsPerPage);
  const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const groupedData = paginatedData.reduce((acc, order) => {
    const date = order.order_date;
    if (!acc[date]) acc[date] = [];
    acc[date].push(order);
    return acc;
  }, {} as Record<string, OrderType[]>);

  const handleEditClick = (item: OrderType) => {
    setModalItem(null);
    handleOpenVoucherModal('customer_name' in item ? 'delivery-note' : 'purchase-order', item);
  };
  const handleDeleteClick = (item: OrderType) => setItemToDelete(item);
  const handleConfirmDelete = async () => {
    if (!itemToDelete) return;
    try {
      setLoading(true);
      if ('customer_name' in itemToDelete) {
        await orderService.deleteSalesOrder(itemToDelete.id);
      } else {
        await orderService.deletePurchaseOrder(itemToDelete.id);
      }
      showNotification('Xóa thành công', 'success');
      fetchOrders();
    } catch (err: any) {
      showNotification('Lỗi khi xóa: ' + err.message, 'error');
    } finally {
      setItemToDelete(null);
      setModalItem(null);
      setLoading(false);
    }
  };

  const renderCell = (order: OrderType, columnKey: string) => {
    switch (columnKey) {
      case 'code': return <span className="font-medium text-gray-900 whitespace-nowrap">{order.code}</span>;
      case 'total_amount': return <div className="text-right whitespace-nowrap tabular-nums">{order.total_amount.toLocaleString('vi-VN')} ₫</div>;
      case 'amount_paid': return <div className="text-right whitespace-nowrap tabular-nums">{order.amount_paid.toLocaleString('vi-VN')} ₫</div>;
      case 'status': return getStatusBadge(order.status);
      case 'partner_name': return 'customer_name' in order ? order.customer_name : order.supplier_name;
      case 'order_date': return formatDate(order.order_date);
      case 'assigned_user': return order.assigned_user_names?.join(', ') || (order as any).assigned_user || 'N/A';
      default: const value = order[columnKey as keyof OrderType]; return typeof value === 'string' || typeof value === 'number' ? String(value) : 'N/A';
    }
  };

  const filterButtons = (
    <div className="flex items-center space-x-2">
      {can('sales_orders', 'view') && (
        <button onClick={() => setViewMode('export')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${viewMode === 'export' ? 'bg-[#0066cc] text-white' : 'bg-white text-gray-700 border'}`}>Xuất kho</button>
      )}
      {can('purchase_orders', 'view') && (
        <button onClick={() => setViewMode('import')} className={`px-3 py-1.5 text-sm font-medium rounded-md ${viewMode === 'import' ? 'bg-[#0066cc] text-white' : 'bg-white text-gray-700 border'}`}>Nhập kho</button>
      )}
    </div>
  );

  return (
    <>
      <FilterBar onSearch={setSearchTerm} onTimeFilterChange={handleTimeFilterChange} pageTitle={Page.XuatNhap} backPath="/bao-cao" />

      <div className="hidden md:flex space-x-4">
        {summaryCards.map(card => <SummaryCard key={card.title} {...card} />)}
      </div>

      <div className="md:hidden grid grid-cols-2 gap-4">
        <SummaryCard title="Tổng số đơn xuất" value={String(totalSalesOrders)} icon={<DonHangIcon />} colorClass="bg-blue-100 text-blue-600" />
        <SummaryCard title="Tổng số đơn nhập" value={String(totalPurchaseOrders)} icon={<KhoIcon />} colorClass="bg-indigo-100 text-indigo-600" />
      </div>


      <TableActions
        onSearch={setSearchTerm}
        searchPlaceholder={searchPlaceholder}
        filterActions={filterButtons}
        primaryActions={[
          {
            label: 'Tạo phiếu', icon: <PlusIcon />, onClick: () => { }, subActions: [
              ...(can('financial_transactions', 'create') ? [{ label: 'Phiếu thu/chi', onClick: () => handleOpenVoucherModal('income-expense-voucher') }] : []),
              ...(can('purchase_orders', 'create') ? [{ label: 'Phiếu nhập hàng', onClick: () => handleOpenVoucherModal('purchase-order') }] : []),
              ...(can('sales_orders', 'create') ? [{ label: 'Phiếu xuất hàng', onClick: () => handleOpenVoucherModal('delivery-note') }] : []),
            ],
          },
          ...(can('reports', 'export') ? [{ label: 'Xuất file', icon: <ExportIcon />, onClick: handleExportExcel, variant: 'secondary' as any }] : []),
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
                const isNumeric = ['total_amount', 'amount_paid'].includes(col.key);
                return (
                  <th key={col.key} scope="col" className={`px-6 py-3 cursor-pointer ${isNumeric ? 'text-right' : 'text-left'}`} onClick={() => requestSort(col.key)}>
                    <div className={`flex items-center min-w-0 ${isNumeric ? 'justify-end' : ''}`}>
                      {col.label}
                      <span className="ml-1.5 shrink-0">
                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === 'ascending' ? <ArrowUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4 ml-0" />
                        ) : (
                          <ArrowsUpDownIcon className="h-4 w-4 text-gray-300" />
                        )}
                      </span>
                    </div>
                  </th>
                );
              })}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedData).map(([date, orders]: [string, OrderType[]]) => (
                <React.Fragment key={date}>
                  <tr className="bg-gray-50 border-t border-b"><td colSpan={visibleColumns.length} className="px-6 py-2 font-bold text-gray-700">{formatDate(date)}</td></tr>
                  {orders.map((order: SalesOrder | PurchaseOrder) => (<tr key={order.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => setModalItem(order)}>{allColumns.filter(c => visibleColumns.includes(c.key)).map(col => <td key={col.key} className="px-6 py-4">{renderCell(order, col.key)}</td>)}</tr>))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4">
          <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }} totalItems={sortedData.length} />
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden mt-4 space-y-3">
        {paginatedData.map((order) => {
          const isSales = 'customer_name' in order;
          return (
            <div
              key={order.id}
              className="bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setModalItem(order)}
            >
              <div className="flex justify-between items-start text-sm">
                <div className="pr-2">
                  <p className="font-semibold text-gray-800 leading-tight">{order.code}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{isSales ? order.customer_name : order.supplier_name}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold whitespace-nowrap ${isSales ? 'text-green-600' : 'text-blue-600'}`}>
                    {order.total_amount.toLocaleString('vi-VN')} ₫
                  </p>
                  <div className="mt-1">{getStatusBadge(order.status)}</div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">{order.facility_name}</p>
                <p className="text-xs text-gray-400">{formatDate(order.order_date)}</p>
              </div>
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


      <SalesOrderDetailModal 
        item={modalItem} 
        onClose={() => setModalItem(null)} 
        onEditClick={handleEditClick} 
        onDeleteClick={handleDeleteClick} 
        onReturnClick={(order) => {
          setModalItem(null);
          handleOpenVoucherModal('return-voucher', order);
        }}
      />
      <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleConfirmDelete} title={`Xác nhận Xóa`} message={`Bạn có chắc chắn muốn xóa phiếu "${itemToDelete?.code}" không?`} />
      <VoucherModal isOpen={voucherModal.isOpen} voucherType={voucherModal.type} initialData={voucherModal.initialData} onClose={handleCloseVoucherModal} />
    </>
  );
};

export default ReportInventoryTransactions;