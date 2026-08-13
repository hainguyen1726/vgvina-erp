import React, { useState, useMemo, useEffect } from 'react';
import FilterBar from '../components/ui/FilterBar';
import SummaryCard from '../components/ui/SummaryCard';
import Pagination from '../components/ui/Pagination';
import { Page, DebtStatus } from '../types';
import { DoiTacIcon, ThuChiIcon, ExportIcon, ArrowUpIcon, ChevronDownIcon, ArrowsUpDownIcon, CongNoIcon } from '../components/icons/Icons';
import { useNotification } from '../contexts/NotificationContext';
import { useBranch } from '../contexts/BranchContext';
import { excelUtils } from '../src/utils/excelUtils';
import { debtService } from '../src/services/debtService';
import { userService } from '../src/services/userService';

const allColumns = [
  { key: 'name', label: 'Khách hàng' },
  { key: 'sale_name', label: 'Sale phụ trách' },
  { key: 'remainingDebt', label: 'Còn nợ' },
  { key: 'orderCount', label: 'Số khoản nợ' },
  { key: 'facility_name', label: 'Chi nhánh' },
];

// Modal chi tiết nợ của khách hàng
interface CustomerDebtItemDetail {
  id: string;
  code: string;
  order_date: string;
  remaining_debt: number;
  status: string;
}

const CustomerDebtDetailModal = ({ 
  isOpen, 
  onClose, 
  partnerName, 
  orders 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  partnerName: string; 
  orders: CustomerDebtItemDetail[] 
}) => {
  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      return new Date(dateStr).toLocaleDateString('vi-VN');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-bold text-gray-800">Chi tiết khoản nợ - {partnerName}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-xs text-gray-700 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">Mã / Chứng từ</th>
                <th className="px-4 py-3 text-left">Ngày phát sinh</th>
                <th className="px-4 py-3 text-right">Số tiền nợ</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order, idx) => (
                <tr key={order.id || idx} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-blue-600">{order.code}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{formatDate(order.order_date)}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">{formatCurrency(order.remaining_debt)}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                      order.status === DebtStatus.PARTIALLY_PAID ? 'bg-amber-100 text-amber-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {order.status === DebtStatus.PARTIALLY_PAID ? 'Thanh toán 1 phần' : 'Chưa thanh toán'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="border-t p-4 flex justify-end bg-gray-50 rounded-b-lg">
          <button onClick={onClose} className="px-5 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-medium text-sm">Đóng</button>
        </div>
      </div>
    </div>
  );
};

const DebtAgingReport: React.FC = () => {
  const { selectedFacilityId, selectedBranch, currentUser } = useBranch();
  const { showNotification } = useNotification();
  
  const isManager = useMemo(() => {
    if (!currentUser) return false;
    const adminRoles = ['admin', 'Admin', 'Quản trị viên', 'Quản lý Chi nhánh', 'Kế toán HO', 'Kế toán', 'Ban Lãnh đạo'];
    return currentUser.is_admin === true || adminRoles.includes(currentUser.role);
  }, [currentUser]);

  // State quản lý dữ liệu
  const [debts, setDebts] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State bộ lọc và UI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSaleId, setSelectedSaleId] = useState('');
  const [activeTab, setActiveTab] = useState<'CUSTOMER' | 'SALE'>('CUSTOMER');
  const [timeFilter, setTimeFilter] = useState<{ filter: string; dates?: { from: Date; to: Date } }>({ filter: 'All time' });
  
  // Phân trang
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(isMobile ? 10 : 30);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>({ key: 'remainingDebt', direction: 'descending' });
  const [visibleColumns] = useState(["name", "sale_name", "remainingDebt", "orderCount", "facility_name"]);

  // Chi tiết hóa đơn nợ của 1 khách hàng đang chọn
  const [selectedPartnerDetail, setSelectedPartnerDetail] = useState<{ name: string; orders: CustomerDebtItemDetail[] } | null>(null);

  // Load danh sách users
  useEffect(() => {
    userService.getUsers().then(setUsers).catch(console.error);
  }, []);

  // Fetch dữ liệu nợ từ vgvina_debt_transactions
  const fetchDebtData = async () => {
    try {
      setLoading(true);
      const isAdmin = currentUser?.is_admin === true ||
        ['admin', 'Admin', 'Quản trị viên', 'Kế toán HO', 'Ban Lãnh đạo', 'Quản lý Chi nhánh'].includes(currentUser?.role || '');

      const facilityFilter = selectedFacilityId === null
        ? (isAdmin ? undefined : '00000000-0000-0000-0000-000000000000')
        : selectedFacilityId;

      const employeeIdFilter = !isAdmin ? currentUser?.id : undefined;

      const data = await debtService.getDebts(facilityFilter || undefined, employeeIdFilter);

      // CHỈ LẤY: Công nợ Phải thu (RECEIVABLE) chưa thanh toán hết (status != PAID) có số tiền > 0
      const receivableDebts = (data || []).filter(d => 
        d.type === 'RECEIVABLE' && d.status !== DebtStatus.PAID && Number(d.amount) > 0
      );

      setDebts(receivableDebts);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu báo cáo công nợ:', err);
      showNotification('Không thể tải dữ liệu báo cáo công nợ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebtData();
  }, [selectedFacilityId]);

  // Xử lý thay đổi kích thước màn hình
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (mobile !== isMobile) {
        setIsMobile(mobile);
        setItemsPerPage(mobile ? 10 : 30);
        setCurrentPage(1);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  // Xử lý sự kiện thay đổi bộ lọc thời gian
  const handleTimeFilterChange = (filter: string, dates?: { from: Date; to: Date }) => {
    setTimeFilter({ filter, dates });
    setCurrentPage(1);
  };

  // Lọc danh sách khoản nợ theo khoảng thời gian được chọn
  const filteredByTimeDebts = useMemo(() => {
    if (!timeFilter || timeFilter.filter === 'All time') return debts;

    const now = new Date();
    let fromDate: Date | null = null;
    let toDate: Date | null = new Date();
    toDate.setHours(23, 59, 59, 999);

    switch (timeFilter.filter) {
      case 'Hôm nay':
        fromDate = new Date();
        fromDate.setHours(0, 0, 0, 0);
        break;
      case 'Hôm qua':
        fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - 1);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date();
        toDate.setDate(toDate.getDate() - 1);
        toDate.setHours(23, 59, 59, 999);
        break;
      case 'Tuần này': {
        const day = now.getDay();
        const diff = now.getDate() - (day === 0 ? 6 : day - 1);
        fromDate = new Date(now);
        fromDate.setDate(diff);
        fromDate.setHours(0, 0, 0, 0);
        break;
      }
      case 'Tháng này':
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        fromDate.setHours(0, 0, 0, 0);
        break;
      case 'Tháng trước':
        fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case 'Quý này': {
        const quarter = Math.floor(now.getMonth() / 3);
        fromDate = new Date(now.getFullYear(), quarter * 3, 1);
        fromDate.setHours(0, 0, 0, 0);
        break;
      }
      case 'Quý trước': {
        const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
        fromDate = new Date(now.getFullYear(), lastQuarter * 3, 1);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now.getFullYear(), (lastQuarter + 1) * 3, 0, 23, 59, 59, 999);
        break;
      }
      case 'Năm nay':
        fromDate = new Date(now.getFullYear(), 0, 1);
        fromDate.setHours(0, 0, 0, 0);
        break;
      case 'Năm trước':
        fromDate = new Date(now.getFullYear() - 1, 0, 1);
        fromDate.setHours(0, 0, 0, 0);
        toDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        break;
      case 'Tùy chọn':
        if (timeFilter.dates) {
          fromDate = new Date(timeFilter.dates.from);
          fromDate.setHours(0, 0, 0, 0);
          toDate = new Date(timeFilter.dates.to);
          toDate.setHours(23, 59, 59, 999);
        }
        break;
      default:
        return debts;
    }

    return debts.filter(debt => {
      const dateStr = debt.due_date || debt.created_at;
      if (!dateStr) return false;
      const debtDate = new Date(dateStr);
      if (fromDate && debtDate < fromDate) return false;
      if (toDate && debtDate > toDate) return false;
      return true;
    });
  }, [debts, timeFilter]);

  // Tính toán và cấu trúc lại dữ liệu nợ theo Khách hàng
  const customerDebts = useMemo(() => {
    const partnersMap: Record<string, {
      id: string;
      name: string;
      sale_name: string;
      facility_name: string;
      remainingDebt: number;
      orderCount: number;
      orders: CustomerDebtItemDetail[];
    }> = {};

    filteredByTimeDebts.forEach(debt => {
      const partnerName = debt.partner_name || 'Khách hàng chưa phân loại';
      const remainingDebt = Number(debt.amount) || 0;
      if (remainingDebt <= 0) return;

      const saleName = (debt.assigned_user_names && debt.assigned_user_names.length > 0)
        ? debt.assigned_user_names.join(', ')
        : 'Chưa gán';

      const debtItem: CustomerDebtItemDetail = {
        id: debt.id,
        code: (debt as any).code || debt.id.substring(0, 8).toUpperCase(),
        order_date: debt.due_date || debt.created_at,
        remaining_debt: remainingDebt,
        status: debt.status,
      };

      if (!partnersMap[partnerName]) {
        partnersMap[partnerName] = {
          id: debt.partner_id || debt.id,
          name: partnerName,
          sale_name: saleName,
          facility_name: debt.facility_name || 'Chưa gán',
          remainingDebt: 0,
          orderCount: 0,
          orders: []
        };
      }

      const item = partnersMap[partnerName];
      item.remainingDebt += remainingDebt;
      item.orderCount += 1;
      item.orders.push(debtItem);
    });

    return Object.values(partnersMap);
  }, [filteredByTimeDebts]);

  // Bộ lọc dữ liệu Khách hàng
  const filteredCustomerDebts = useMemo(() => {
    let result = customerDebts.filter(item => {
      // Lọc theo search term
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.sale_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Lọc theo Sale phụ trách
      const matchesSale = !selectedSaleId || item.sale_name.includes(
        users.find(u => u.id === selectedSaleId)?.full_name || ''
      );

      return matchesSearch && matchesSale;
    });

    // Sắp xếp
    if (sortConfig) {
      result.sort((a: any, b: any) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        if (typeof aVal === 'string' && typeof bVal === 'string') {
          return sortConfig.direction === 'ascending' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        }
        if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    return result;
  }, [customerDebts, searchTerm, selectedSaleId, sortConfig, users]);

  // Tổng hợp dữ liệu nợ theo nhân viên Sale
  const saleDebtsSummary = useMemo(() => {
    const saleMap: Record<string, {
      sale_name: string;
      remainingDebt: number;
      customerCount: number;
      orderCount: number;
    }> = {};

    customerDebts.forEach(cust => {
      const saleName = cust.sale_name;
      if (!saleMap[saleName]) {
        saleMap[saleName] = {
          sale_name: saleName,
          remainingDebt: 0,
          customerCount: 0,
          orderCount: 0,
        };
      }

      const item = saleMap[saleName];
      item.remainingDebt += cust.remainingDebt;
      item.customerCount += 1;
      item.orderCount += cust.orderCount;
    });

    return Object.values(saleMap);
  }, [customerDebts]);

  // Bộ lọc dữ liệu Sale
  const filteredSaleDebts = useMemo(() => {
    let result = saleDebtsSummary.filter(item => 
      item.sale_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sắp xếp mặc định theo nợ quản lý giảm dần
    result.sort((a, b) => b.remainingDebt - a.remainingDebt);
    return result;
  }, [saleDebtsSummary, searchTerm]);

  // Tổng số liệu báo cáo
  const totals = useMemo(() => {
    return filteredCustomerDebts.reduce((acc, curr) => ({
      remainingDebt: acc.remainingDebt + curr.remainingDebt,
      customerCount: acc.customerCount + 1,
      orderCount: acc.orderCount + curr.orderCount,
    }), { remainingDebt: 0, customerCount: 0, orderCount: 0 });
  }, [filteredCustomerDebts]);

  // Phân trang cho danh sách Khách hàng
  const totalPages = Math.ceil(filteredCustomerDebts.length / itemsPerPage);
  const paginatedCustomerDebts = filteredCustomerDebts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleExportExcel = () => {
    const exportCustData = filteredCustomerDebts.map((item, index) => ({
      'STT': index + 1,
      'Mã khách hàng': item.id.substring(0, 8).toUpperCase(),
      'Tên khách hàng': item.name,
      'Sale phụ trách': item.sale_name,
      'Còn nợ': item.remainingDebt,
      'Số khoản nợ': item.orderCount,
      'Chi nhánh': item.facility_name
    }));

    const exportSaleData = filteredSaleDebts.map((item, index) => ({
      'STT': index + 1,
      'Nhân viên Sale': item.sale_name,
      'Số khách hàng nợ': item.customerCount,
      'Số khoản nợ': item.orderCount,
      'Còn nợ quản lý': item.remainingDebt
    }));

    excelUtils.exportDebtAgingReport(
      exportCustData, 
      exportSaleData, 
      `BaoCaoCongNo_${new Date().toISOString().split('T')[0]}`,
      selectedBranch || 'Tất cả chi nhánh'
    );
    showNotification('Đang tải file Excel báo cáo công nợ...', 'success');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <FilterBar
        onSearch={setSearchTerm}
        onTimeFilterChange={handleTimeFilterChange}
        pageTitle="Báo cáo công nợ"
        backPath="/bao-cao"
        initialFilter="All time"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Tổng nợ phải thu" 
          value={formatCurrency(totals.remainingDebt)} 
          icon={<ThuChiIcon />} 
          colorClass="bg-red-100 text-red-600 font-bold" 
        />
        <SummaryCard 
          title="Khách hàng còn nợ" 
          value={`${totals.customerCount} Khách hàng`} 
          icon={<DoiTacIcon />} 
          colorClass="bg-blue-100 text-blue-600 font-bold" 
        />
        <SummaryCard 
          title="Số khoản nợ thực tế" 
          value={`${totals.orderCount} Khoản nợ`} 
          icon={<CongNoIcon />} 
          colorClass="bg-amber-100 text-amber-700 font-bold" 
        />
        <SummaryCard 
          title="Chi nhánh đang xem" 
          value={selectedBranch || 'Tất cả chi nhánh'} 
          icon={<DoiTacIcon />} 
          colorClass="bg-green-100 text-green-700 font-semibold" 
        />
      </div>

      {/* Tabs & Filters */}
      <div className="bg-white rounded-lg shadow-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Tabs */}
        <div className="flex bg-gray-100 p-1 rounded-lg self-start">
          <button 
            onClick={() => { setActiveTab('CUSTOMER'); setSearchTerm(''); }}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'CUSTOMER' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
          >
            📋 Theo khách hàng
          </button>
          {isManager && (
            <button 
              onClick={() => { setActiveTab('SALE'); setSearchTerm(''); }}
              className={`px-4 py-2 text-sm font-semibold rounded-md transition-colors ${activeTab === 'SALE' ? 'bg-white text-blue-700 shadow-sm' : 'text-gray-600 hover:text-gray-900'}`}
            >
              👤 Theo nhân viên Sale
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 items-center">
          <input
            type="text"
            placeholder={activeTab === 'CUSTOMER' ? 'Tìm khách hàng, Sale...' : 'Tìm nhân viên Sale...'}
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="px-3 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-64"
          />

          {activeTab === 'CUSTOMER' && isManager && (
            <select
              value={selectedSaleId}
              onChange={e => setSelectedSaleId(e.target.value)}
              className="px-3 py-2 border rounded-md text-sm bg-white outline-none focus:ring-1 focus:ring-blue-500"
            >
              <option value="">Tất cả nhân viên Sale</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          )}

          <button 
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-4 py-2 text-sm font-bold bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors ml-auto sm:ml-0"
          >
            <ExportIcon className="w-4 h-4" /> Xuất Excel
          </button>
        </div>
      </div>

      {/* Main Table View */}
      {activeTab === 'CUSTOMER' ? (
        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col flex-1">
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-xs text-gray-700 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3 text-left">STT</th>
                  {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => {
                    const isRight = ['remainingDebt', 'orderCount'].includes(col.key);
                    return (
                      <th 
                        key={col.key} 
                        className={`px-6 py-3 cursor-pointer ${isRight ? 'text-right' : 'text-left'}`}
                        onClick={() => requestSort(col.key)}
                      >
                        <div className={`flex items-center ${isRight ? 'justify-end' : ''}`}>
                          {col.label}
                          <span className="ml-1 shrink-0">
                            {sortConfig?.key === col.key ? (
                              sortConfig.direction === 'ascending' ? <ArrowUpIcon className="h-3.5 w-3.5" /> : <ChevronDownIcon className="h-3.5 w-3.5" />
                            ) : (
                              <ArrowsUpDownIcon className="h-3.5 w-3.5 text-gray-300" />
                            )}
                          </span>
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={allColumns.length + 1} className="px-6 py-8 text-center text-gray-500 font-medium">Đang tải dữ liệu công nợ...</td>
                  </tr>
                ) : paginatedCustomerDebts.length === 0 ? (
                  <tr>
                    <td colSpan={allColumns.length + 1} className="px-6 py-8 text-center text-gray-500 font-medium">Không tìm thấy khách hàng nào còn nợ</td>
                  </tr>
                ) : (
                  paginatedCustomerDebts.map((item, idx) => (
                    <tr 
                      key={item.id} 
                      className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                      onClick={() => setSelectedPartnerDetail({ name: item.name, orders: item.orders })}
                    >
                      <td className="px-6 py-4 text-left font-medium text-gray-500">
                        {(currentPage - 1) * itemsPerPage + idx + 1}
                      </td>
                      {visibleColumns.includes('name') && (
                        <td className="px-6 py-4 text-left font-semibold text-blue-600 hover:underline">
                          {item.name}
                        </td>
                      )}
                      {visibleColumns.includes('sale_name') && (
                        <td className="px-6 py-4 text-left">
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-800">
                            {item.sale_name}
                          </span>
                        </td>
                      )}
                      {visibleColumns.includes('remainingDebt') && (
                        <td className="px-6 py-4 text-right font-bold text-red-600 tabular-nums">
                          {formatCurrency(item.remainingDebt)}
                        </td>
                      )}
                      {visibleColumns.includes('orderCount') && (
                        <td className="px-6 py-4 text-right font-semibold text-gray-800">
                          {item.orderCount} khoản
                        </td>
                      )}
                      {visibleColumns.includes('facility_name') && (
                        <td className="px-6 py-4 text-left font-medium text-gray-600">
                          {item.facility_name}
                        </td>
                      )}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Tổng cộng footer */}
          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 font-bold text-sm">
            <div className="text-gray-600">TỔNG CỘNG ({filteredCustomerDebts.length} khách nợ):</div>
            <div className="flex gap-4 sm:gap-6 flex-wrap justify-end">
              <div className="text-right text-red-600 font-extrabold text-base">Tổng nợ: {formatCurrency(totals.remainingDebt)}</div>
            </div>
          </div>

          {/* Phân trang */}
          <div className="p-4 border-t border-gray-200">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              itemsPerPage={itemsPerPage}
              onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}
              totalItems={filteredCustomerDebts.length}
            />
          </div>
        </div>
      ) : (
        // TAB: Tổng hợp theo nhân viên Sale
        <div className="bg-white rounded-lg shadow-sm overflow-hidden flex flex-col flex-1">
          <div className="overflow-x-auto flex-1">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 text-xs text-gray-700 uppercase font-semibold">
                <tr>
                  <th className="px-6 py-3 text-left">STT</th>
                  <th className="px-6 py-3 text-left">Nhân viên Sale</th>
                  <th className="px-6 py-3 text-center">Số khách nợ</th>
                  <th className="px-6 py-3 text-center">Số khoản nợ</th>
                  <th className="px-6 py-3 text-right text-red-600">Tổng nợ quản lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-medium">Đang tải dữ liệu báo cáo...</td>
                  </tr>
                ) : filteredSaleDebts.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500 font-medium">Không có dữ liệu nợ theo Sale</td>
                  </tr>
                ) : (
                  filteredSaleDebts.map((item, idx) => (
                    <tr key={item.sale_name} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-left font-medium text-gray-500">{idx + 1}</td>
                      <td className="px-6 py-4 text-left font-semibold text-gray-800">{item.sale_name}</td>
                      <td className="px-6 py-4 text-center font-medium">{item.customerCount} KH</td>
                      <td className="px-6 py-4 text-center font-medium">{item.orderCount} khoản</td>
                      <td className="px-6 py-4 text-right font-bold text-red-600 tabular-nums">{formatCurrency(item.remainingDebt)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 font-bold text-sm">
            <div className="text-gray-600">TỔNG CỘNG:</div>
            <div className="flex gap-4 sm:gap-6 flex-wrap justify-end">
              <div className="text-right text-red-600 text-base">Tổng nợ: {formatCurrency(totals.remainingDebt)}</div>
            </div>
          </div>
        </div>
      )}

      {/* Modal chi tiết hóa đơn nợ */}
      <CustomerDebtDetailModal
        isOpen={!!selectedPartnerDetail}
        onClose={() => setSelectedPartnerDetail(null)}
        partnerName={selectedPartnerDetail?.name || ''}
        orders={selectedPartnerDetail?.orders || []}
      />
    </div>
  );
};

export default DebtAgingReport;
