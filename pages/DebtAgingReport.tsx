import React, { useState, useMemo, useEffect } from 'react';
import FilterBar from '../components/ui/FilterBar';
import SummaryCard from '../components/ui/SummaryCard';
import Pagination from '../components/ui/Pagination';
import { TableActions } from '../components/ui/TableActions';
import { Page, PartnerType, OrderStatus } from '../types';
import { DoiTacIcon, ThuChiIcon, ExportIcon, ArrowUpIcon, ChevronDownIcon, ArrowsUpDownIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/icons/Icons';
import { useNotification } from '../contexts/NotificationContext';
import { useBranch } from '../contexts/BranchContext';
import { excelUtils } from '../src/utils/excelUtils';
import { supabase } from '../src/supabaseClient';
import { userService } from '../src/services/userService';

const allColumns = [
  { key: 'name', label: 'Khách hàng' },
  { key: 'sale_name', label: 'Sale phụ trách' },
  { key: 'payment_term', label: 'Kỳ hạn thanh toán' },
  { key: 'totalDebt', label: 'Tổng nợ' },
  { key: 'inTerm', label: 'Trong hạn' },
  { key: 'overdue1to7', label: 'Quá hạn 1-7' },
  { key: 'overdue8to30', label: 'Quá hạn 8-30' },
  { key: 'overdueOver30', label: 'Quá hạn >30' },
];

// Modal chi tiết đơn hàng nợ của khách hàng
interface OrderDebtDetail {
  id: string;
  code: string;
  order_date: string;
  total_amount: number;
  amount_paid: number;
  remaining_debt: number;
  days_diff: number;
  due_days: number;
  overdue_days: number;
  status_label: string;
  status_color: string;
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
  orders: OrderDebtDetail[] 
}) => {
  if (!isOpen) return null;

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-bold text-gray-800">Chi tiết hóa đơn nợ - {partnerName}</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50 text-xs text-gray-700 uppercase font-semibold">
              <tr>
                <th className="px-4 py-3 text-left">Mã đơn hàng</th>
                <th className="px-4 py-3 text-left">Ngày đơn</th>
                <th className="px-4 py-3 text-right">Tổng giá trị</th>
                <th className="px-4 py-3 text-right">Đã thanh toán</th>
                <th className="px-4 py-3 text-right">Còn nợ</th>
                <th className="px-4 py-3 text-center">Hạn nợ</th>
                <th className="px-4 py-3 text-center">Số ngày nợ</th>
                <th className="px-4 py-3 text-center">Quá hạn</th>
                <th className="px-4 py-3 text-center">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-semibold text-blue-600">{order.code}</td>
                  <td className="px-4 py-3 whitespace-nowrap">{new Date(order.order_date).toLocaleDateString('vi-VN')}</td>
                  <td className="px-4 py-3 text-right font-medium">{formatCurrency(order.total_amount)}</td>
                  <td className="px-4 py-3 text-right text-green-600">{formatCurrency(order.amount_paid)}</td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">{formatCurrency(order.remaining_debt)}</td>
                  <td className="px-4 py-3 text-center">{order.due_days} ngày</td>
                  <td className="px-4 py-3 text-center">{order.days_diff} ngày</td>
                  <td className="px-4 py-3 text-center font-semibold text-orange-600">
                    {order.overdue_days > 0 ? `${order.overdue_days} ngày` : 'Trong hạn'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${order.status_color}`}>
                      {order.status_label}
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
  const [salesOrders, setSalesOrders] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State bộ lọc và UI
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSaleId, setSelectedSaleId] = useState('');
  const [selectedBranchId, setSelectedBranchId] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [activeTab, setActiveTab] = useState<'CUSTOMER' | 'SALE'>('CUSTOMER');
  const [timeFilter, setTimeFilter] = useState<{ filter: string; dates?: { from: Date; to: Date } }>({ filter: 'All time' });
  
  // Phân trang
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(isMobile ? 10 : 30);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>({ key: 'totalDebt', direction: 'descending' });
  const [visibleColumns, setVisibleColumns] = useState(["name", "sale_name", "payment_term", "totalDebt", "inTerm", "overdue1to7", "overdue8to30", "overdueOver30"]);

  // Chi tiết hóa đơn nợ của 1 khách hàng đang chọn
  const [selectedPartnerDetail, setSelectedPartnerDetail] = useState<{ name: string; orders: OrderDebtDetail[] } | null>(null);

  // Load danh sách users
  useEffect(() => {
    userService.getUsers().then(setUsers).catch(console.error);
  }, []);

  // Fetch sales orders có nợ
  const fetchDebtData = async () => {
    try {
      setLoading(true);
      // Query sales orders nợ
      // có status COMPLETED hoặc DELIVERED
      let ordersQuery = supabase
        .from('vgvina_sales_orders')
        .select(`
          id,
          code,
          order_date,
          total_amount,
          amount_paid,
          status,
          facility_id,
          vgvina_facilities(name),
          customer:customer_id(
            id,
            name,
            payment_due_days,
            payment_term,
            assigned_user_id
          )
        `)
        .in('status', [OrderStatus.COMPLETED, OrderStatus.DELIVERED]);

      // Áp dụng chi nhánh từ BranchContext nếu không phải admin hoặc admin đã chọn chi nhánh
      const currentFacilityId = selectedFacilityId || selectedBranchId;
      if (currentFacilityId) {
        ordersQuery = ordersQuery.eq('facility_id', currentFacilityId);
      }

      const { data: ordersData, error: ordersError } = await ordersQuery;
      if (ordersError) throw ordersError;

      // Lọc các đơn nợ thực tế ở phía Client để tránh cú pháp SQL raw không tương thích
      const debtOrders = (ordersData || []).filter((o: any) => {
        const total = Number(o.total_amount) || 0;
        const paid = Number(o.amount_paid) || 0;
        return total > paid;
      });

      setSalesOrders(debtOrders);
    } catch (err) {
      console.error('Lỗi khi tải dữ liệu báo cáo công nợ:', err);
      showNotification('Không thể tải dữ liệu báo cáo công nợ', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebtData();
  }, [selectedFacilityId, selectedBranchId]);

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

  // Hàm tính số ngày chênh lệch giữa 2 ngày
  // Cập nhật ngày mốc tính tuổi nợ (cutoffDate): là ngày cuối cùng của kỳ lọc được chọn, hoặc ngày hiện tại
  const cutoffDate = useMemo(() => {
    if (!timeFilter || timeFilter.filter === 'All time') return new Date();

    const now = new Date();
    switch (timeFilter.filter) {
      case 'Hôm nay':
        return now;
      case 'Hôm qua': {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        return yesterday;
      }
      case 'Tuần này':
        return now;
      case 'Tháng này':
        return now;
      case 'Tháng trước':
        return new Date(now.getFullYear(), now.getMonth(), 0);
      case 'Quý này':
        return now;
      case 'Quý trước': {
        const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
        return new Date(now.getFullYear(), (lastQuarter + 1) * 3, 0);
      }
      case 'Năm nay':
        return now;
      case 'Năm trước':
        return new Date(now.getFullYear() - 1, 11, 31);
      case 'Tùy chọn':
        return timeFilter.dates?.to ? new Date(timeFilter.dates.to) : now;
      default:
        return now;
    }
  }, [timeFilter]);

  // Hàm tính số ngày chênh lệch từ ngày đơn hàng đến ngày mốc cutoffDate
  const getDaysDifference = (orderDateStr: string, refDate: Date) => {
    const target = new Date(refDate);
    target.setHours(0, 0, 0, 0);
    const orderDate = new Date(orderDateStr);
    orderDate.setHours(0, 0, 0, 0);
    const diffTime = target.getTime() - orderDate.getTime();
    return Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
  };

  // Xử lý sự kiện thay đổi bộ lọc thời gian
  const handleTimeFilterChange = (filter: string, dates?: { from: Date; to: Date }) => {
    setTimeFilter({ filter, dates });
  };

  // Lọc danh sách đơn hàng nợ theo khoảng thời gian được chọn
  const filteredByTimeSalesOrders = useMemo(() => {
    if (!timeFilter || timeFilter.filter === 'All time') return salesOrders;

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
        return salesOrders;
    }

    return salesOrders.filter(order => {
      if (!order.order_date) return false;
      const orderDate = new Date(order.order_date);
      if (fromDate && orderDate < fromDate) return false;
      if (toDate && orderDate > toDate) return false;
      return true;
    });
  }, [salesOrders, timeFilter]);

  // Tính toán và cấu trúc lại dữ liệu nợ theo Khách hàng
  const customerDebts = useMemo(() => {
    const partnersMap: Record<string, {
      id: string;
      name: string;
      payment_term: string;
      due_days: number;
      assigned_user_id: string;
      sale_name: string;
      facility_name: string;
      totalDebt: number;
      inTerm: number;
      overdue1to7: number;
      overdue8to30: number;
      overdueOver30: number;
      orders: OrderDebtDetail[];
    }> = {};

    filteredByTimeSalesOrders.forEach(order => {
      const customer = order.customer;
      if (!customer) return;

      // Nếu không phải quản lý/admin, chỉ xem khách hàng được gán cho chính Sale đó
      if (!isManager && currentUser) {
        if (String(customer.assigned_user_id) !== String(currentUser.id)) {
          return;
        }
      }

      const customerId = customer.id;
      const totalAmount = Number(order.total_amount) || 0;
      const amountPaid = Number(order.amount_paid) || 0;
      const remainingDebt = totalAmount - amountPaid;

      if (remainingDebt <= 0) return;

      const dueDays = Number(customer.payment_due_days) || 0;
      const daysDiff = getDaysDifference(order.order_date, cutoffDate);
      const overdueDays = daysDiff - dueDays;

      // Tìm tên Sale phụ trách
      const saleUser = users.find(u => String(u.id) === String(customer.assigned_user_id));
      const saleName = saleUser ? saleUser.full_name : 'Chưa gán';

      // Phân bổ nợ
      let inTerm = 0;
      let overdue1to7 = 0;
      let overdue8to30 = 0;
      let overdueOver30 = 0;

      let statusLabel = 'Trong hạn';
      let statusColor = 'bg-green-50 text-green-700';

      if (overdueDays <= 0) {
        inTerm = remainingDebt;
      } else if (overdueDays <= 7) {
        overdue1to7 = remainingDebt;
        statusLabel = 'Quá hạn 1-7 ngày';
        statusColor = 'bg-yellow-50 text-yellow-700';
      } else if (overdueDays <= 30) {
        overdue8to30 = remainingDebt;
        statusLabel = 'Quá hạn 8-30 ngày';
        statusColor = 'bg-orange-50 text-orange-700';
      } else {
        overdueOver30 = remainingDebt;
        statusLabel = 'Quá hạn >30 ngày';
        statusColor = 'bg-red-50 text-red-700';
      }

      const orderDebt: OrderDebtDetail = {
        id: order.id,
        code: order.code,
        order_date: order.order_date,
        total_amount: totalAmount,
        amount_paid: amountPaid,
        remaining_debt: remainingDebt,
        days_diff: daysDiff,
        due_days: dueDays,
        overdue_days: overdueDays,
        status_label: statusLabel,
        status_color: statusColor
      };

      if (!partnersMap[customerId]) {
        partnersMap[customerId] = {
          id: customerId,
          name: customer.name,
          payment_term: customer.payment_term || 'Không có',
          due_days: dueDays,
          assigned_user_id: customer.assigned_user_id ? String(customer.assigned_user_id) : '',
          sale_name: saleName,
          facility_name: order.vgvina_facilities?.name || 'Chưa gán',
          totalDebt: 0,
          inTerm: 0,
          overdue1to7: 0,
          overdue8to30: 0,
          overdueOver30: 0,
          orders: []
        };
      }

      const item = partnersMap[customerId];
      item.totalDebt += remainingDebt;
      item.inTerm += inTerm;
      item.overdue1to7 += overdue1to7;
      item.overdue8to30 += overdue8to30;
      item.overdueOver30 += overdueOver30;
      item.orders.push(orderDebt);
    });

    return Object.values(partnersMap);
  }, [filteredByTimeSalesOrders, users, isManager, currentUser, cutoffDate]);

  // Bộ lọc dữ liệu Khách hàng
  const filteredCustomerDebts = useMemo(() => {
    let result = customerDebts.filter(item => {
      // 1. Lọc theo search term
      const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.sale_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Lọc theo Sale phụ trách
      const matchesSale = !selectedSaleId || item.assigned_user_id === selectedSaleId;
      
      // 3. Lọc theo chỉ xem nợ quá hạn
      const matchesOverdue = !overdueOnly || (item.overdue1to7 + item.overdue8to30 + item.overdueOver30) > 0;

      return matchesSearch && matchesSale && matchesOverdue;
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
  }, [customerDebts, searchTerm, selectedSaleId, overdueOnly, sortConfig]);

  // Tổng hợp dữ liệu nợ theo nhân viên Sale
  const saleDebtsSummary = useMemo(() => {
    const saleMap: Record<string, {
      sale_name: string;
      totalDebt: number;
      inTerm: number;
      overdue1to7: number;
      overdue8to30: number;
      overdueOver30: number;
      customerCount: number;
    }> = {};

    customerDebts.forEach(cust => {
      const saleName = cust.sale_name;
      if (!saleMap[saleName]) {
        saleMap[saleName] = {
          sale_name: saleName,
          totalDebt: 0,
          inTerm: 0,
          overdue1to7: 0,
          overdue8to30: 0,
          overdueOver30: 0,
          customerCount: 0
        };
      }

      const item = saleMap[saleName];
      item.totalDebt += cust.totalDebt;
      item.inTerm += cust.inTerm;
      item.overdue1to7 += cust.overdue1to7;
      item.overdue8to30 += cust.overdue8to30;
      item.overdueOver30 += cust.overdueOver30;
      item.customerCount += 1;
    });

    return Object.values(saleMap);
  }, [customerDebts]);

  // Bộ lọc dữ liệu Sale
  const filteredSaleDebts = useMemo(() => {
    let result = saleDebtsSummary.filter(item => 
      item.sale_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Sắp xếp mặc định theo tổng nợ quản lý giảm dần
    result.sort((a, b) => b.totalDebt - a.totalDebt);
    return result;
  }, [saleDebtsSummary, searchTerm]);

  // Tổng số liệu báo cáo
  const totals = useMemo(() => {
    return filteredCustomerDebts.reduce((acc, curr) => ({
      total: acc.total + curr.totalDebt,
      inTerm: acc.inTerm + curr.inTerm,
      overdue1to7: acc.overdue1to7 + curr.overdue1to7,
      overdue8to30: acc.overdue8to30 + curr.overdue8to30,
      overdueOver30: acc.overdueOver30 + curr.overdueOver30,
      overdueTotal: acc.overdueTotal + curr.overdue1to7 + curr.overdue8to30 + curr.overdueOver30
    }), { total: 0, inTerm: 0, overdue1to7: 0, overdue8to30: 0, overdueOver30: 0, overdueTotal: 0 });
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
    // Chuyển đổi dữ liệu để phục vụ xuất Excel
    const exportCustData = filteredCustomerDebts.map((item, index) => ({
      'STT': index + 1,
      'Mã khách hàng': item.id.substring(0, 8).toUpperCase(),
      'Tên khách hàng': item.name,
      'Sale phụ trách': item.sale_name,
      'Kỳ hạn thanh toán': item.payment_term,
      'Tổng nợ': item.totalDebt,
      'Trong hạn': item.inTerm,
      'Quá hạn 1-7 ngày': item.overdue1to7,
      'Quá hạn 8-30 ngày': item.overdue8to30,
      'Quá hạn >30 ngày': item.overdueOver30,
      'Chi nhánh': item.facility_name
    }));

    const exportSaleData = filteredSaleDebts.map((item, index) => ({
      'STT': index + 1,
      'Nhân viên Sale': item.sale_name,
      'Số khách hàng nợ': item.customerCount,
      'Tổng nợ quản lý': item.totalDebt,
      'Trong hạn': item.inTerm,
      'Quá hạn 1-7 ngày': item.overdue1to7,
      'Quá hạn 8-30 ngày': item.overdue8to30,
      'Quá hạn >30 ngày': item.overdueOver30
    }));

    excelUtils.exportDebtAgingReport(
      exportCustData, 
      exportSaleData, 
      `BaoCaoTuoiNo_${new Date().toISOString().split('T')[0]}`,
      selectedBranch || 'Tất cả chi nhánh'
    );
    showNotification('Đang tải file Excel báo cáo công nợ...', 'success');
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
  };

  // Xác định màu nền tối ưu cho cả dòng dựa vào tình trạng quá hạn cao nhất
  const getRowOverdueClass = (item: any) => {
    if (item.overdueOver30 > 0) return 'bg-red-50/40 hover:bg-red-50/80 transition-colors';
    if (item.overdue8to30 > 0) return 'bg-orange-50/30 hover:bg-orange-50/70 transition-colors';
    if (item.overdue1to7 > 0) return 'bg-yellow-50/30 hover:bg-yellow-50/70 transition-colors';
    return 'bg-white hover:bg-gray-50/80 transition-colors';
  };

  return (
    <div className="flex flex-col h-full space-y-4">
      <FilterBar
        onSearch={setSearchTerm}
        onTimeFilterChange={handleTimeFilterChange}
        pageTitle="Phân tích tuổi nợ công nợ"
        backPath="/bao-cao"
        initialFilter="All time"
      />

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <SummaryCard 
          title="Tổng nợ phải thu" 
          value={formatCurrency(totals.total)} 
          icon={<ThuChiIcon />} 
          colorClass="bg-blue-100 text-blue-600 font-bold" 
        />
        <SummaryCard 
          title="Nợ trong hạn" 
          value={formatCurrency(totals.inTerm)} 
          icon={<DoiTacIcon />} 
          colorClass="bg-green-100 text-green-600 font-semibold" 
        />
        <SummaryCard 
          title="Tổng nợ quá hạn" 
          value={formatCurrency(totals.overdueTotal)} 
          icon={<ThuChiIcon />} 
          colorClass="bg-red-100 text-red-600 font-bold" 
        />
        <div className="bg-white rounded-lg p-4 shadow-sm flex flex-col justify-between">
          <div>
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Cơ cấu tuổi nợ quá hạn</p>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-yellow-600 font-medium">1-7 ngày:</span>
                <span className="font-semibold text-gray-800">{formatCurrency(totals.overdue1to7)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-orange-600 font-medium">8-30 ngày:</span>
                <span className="font-semibold text-gray-800">{formatCurrency(totals.overdue8to30)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-red-600 font-medium">&gt;30 ngày:</span>
                <span className="font-semibold text-gray-800">{formatCurrency(totals.overdueOver30)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Biểu đồ cơ cấu tuổi nợ trực quan bằng thanh ProgressBar */}
      <div className="bg-white rounded-lg p-5 shadow-sm space-y-3">
        <h4 className="text-sm font-bold text-gray-700">Tỷ lệ cơ cấu tuổi nợ thực tế</h4>
        <div className="w-full h-5 bg-gray-100 rounded-full flex overflow-hidden">
          {totals.total > 0 ? (
            <>
              {totals.inTerm > 0 && (
                <div 
                  style={{ width: `${(totals.inTerm / totals.total) * 100}%` }} 
                  className="bg-green-500 hover:opacity-90 transition-opacity flex items-center justify-center text-[10px] text-white font-bold"
                  title={`Trong hạn: ${((totals.inTerm / totals.total) * 100).toFixed(1)}%`}
                >
                  {((totals.inTerm / totals.total) * 100) > 8 && `${((totals.inTerm / totals.total) * 100).toFixed(0)}%`}
                </div>
              )}
              {totals.overdue1to7 > 0 && (
                <div 
                  style={{ width: `${(totals.overdue1to7 / totals.total) * 100}%` }} 
                  className="bg-yellow-400 hover:opacity-90 transition-opacity flex items-center justify-center text-[10px] text-gray-800 font-bold"
                  title={`Quá hạn 1-7 ngày: ${((totals.overdue1to7 / totals.total) * 100).toFixed(1)}%`}
                >
                  {((totals.overdue1to7 / totals.total) * 100) > 8 && `${((totals.overdue1to7 / totals.total) * 100).toFixed(0)}%`}
                </div>
              )}
              {totals.overdue8to30 > 0 && (
                <div 
                  style={{ width: `${(totals.overdue8to30 / totals.total) * 100}%` }} 
                  className="bg-orange-500 hover:opacity-90 transition-opacity flex items-center justify-center text-[10px] text-white font-bold"
                  title={`Quá hạn 8-30 ngày: ${((totals.overdue8to30 / totals.total) * 100).toFixed(1)}%`}
                >
                  {((totals.overdue8to30 / totals.total) * 100) > 8 && `${((totals.overdue8to30 / totals.total) * 100).toFixed(0)}%`}
                </div>
              )}
              {totals.overdueOver30 > 0 && (
                <div 
                  style={{ width: `${(totals.overdueOver30 / totals.total) * 100}%` }} 
                  className="bg-red-600 hover:opacity-90 transition-opacity flex items-center justify-center text-[10px] text-white font-bold"
                  title={`Quá hạn >30 ngày: ${((totals.overdueOver30 / totals.total) * 100).toFixed(1)}%`}
                >
                  {((totals.overdueOver30 / totals.total) * 100) > 8 && `${((totals.overdueOver30 / totals.total) * 100).toFixed(0)}%`}
                </div>
              )}
            </>
          ) : (
            <div className="w-full flex items-center justify-center text-xs text-gray-400 font-medium">Không có dữ liệu công nợ</div>
          )}
        </div>
        {totals.total > 0 && (
          <div className="flex flex-wrap gap-4 text-xs font-semibold justify-center">
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-green-500 rounded-sm"></span> Trong hạn ({formatCurrency(totals.inTerm)})</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-yellow-400 rounded-sm"></span> Quá hạn 1-7 ngày ({formatCurrency(totals.overdue1to7)})</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-orange-500 rounded-sm"></span> Quá hạn 8-30 ngày ({formatCurrency(totals.overdue8to30)})</span>
            <span className="flex items-center gap-1.5"><span className="w-3 h-3 bg-red-600 rounded-sm"></span> Quá hạn &gt;30 ngày ({formatCurrency(totals.overdueOver30)})</span>
          </div>
        )}
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
            className="px-3 py-2 border rounded-md text-sm outline-none focus:ring-1 focus:ring-blue-500 w-full sm:w-56"
          />

          {activeTab === 'CUSTOMER' && (
            <>
              {/* Filter Sale */}
              {isManager && (
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

              {/* Filter chỉ xem quá hạn */}
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={overdueOnly}
                  onChange={e => setOverdueOnly(e.target.checked)}
                  className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                Chỉ xem quá hạn
              </label>
            </>
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
                  {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => {
                    const isRight = ['totalDebt', 'inTerm', 'overdue1to7', 'overdue8to30', 'overdueOver30'].includes(col.key);
                    return (
                      <th 
                        key={col.key} 
                        className={`px-6 py-3 cursor-pointer ${isRight ? 'text-right' : 'text-left'}`}
                        onClick={() => requestSort(col.key)}
                      >
                        <div className={`flex items-center ${isRight ? 'justify-end' : ''}`}>
                          {col.key === 'name' ? 'Khách hàng' :
                           col.key === 'sale_name' ? 'Sale phụ trách' :
                           col.key === 'payment_term' ? 'Kỳ hạn TT' :
                           col.key === 'totalDebt' ? 'Tổng nợ' :
                           col.key === 'inTerm' ? 'Trong hạn' :
                           col.key === 'overdue1to7' ? 'Quá hạn 1-7' :
                           col.key === 'overdue8to30' ? 'Quá hạn 8-30' :
                           col.key === 'overdueOver30' ? 'Quá hạn >30' : ''}
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
                    <td colSpan={allColumns.length} className="px-6 py-8 text-center text-gray-500 font-medium">Đang tải dữ liệu công nợ...</td>
                  </tr>
                ) : paginatedCustomerDebts.length === 0 ? (
                  <tr>
                    <td colSpan={allColumns.length} className="px-6 py-8 text-center text-gray-500 font-medium">Không tìm thấy khách hàng có nợ phù hợp</td>
                  </tr>
                ) : (
                  paginatedCustomerDebts.map((item, idx) => (
                    <tr 
                      key={item.id} 
                      className={`${getRowOverdueClass(item)} cursor-pointer`}
                      onClick={() => setSelectedPartnerDetail({ name: item.name, orders: item.orders })}
                    >
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
                      {visibleColumns.includes('payment_term') && (
                        <td className="px-6 py-4 text-left font-medium text-gray-600">
                          {item.payment_term}
                        </td>
                      )}
                      {visibleColumns.includes('totalDebt') && (
                        <td className="px-6 py-4 text-right font-bold text-gray-900 tabular-nums">
                          {formatCurrency(item.totalDebt)}
                        </td>
                      )}
                      {visibleColumns.includes('inTerm') && (
                        <td className="px-6 py-4 text-right text-green-700 font-semibold bg-green-50/20 tabular-nums">
                          {item.inTerm > 0 ? formatCurrency(item.inTerm) : '-'}
                        </td>
                      )}
                      {visibleColumns.includes('overdue1to7') && (
                        <td className="px-6 py-4 text-right text-yellow-700 font-semibold bg-yellow-50/20 tabular-nums">
                          {item.overdue1to7 > 0 ? formatCurrency(item.overdue1to7) : '-'}
                        </td>
                      )}
                      {visibleColumns.includes('overdue8to30') && (
                        <td className="px-6 py-4 text-right text-orange-700 font-semibold bg-orange-50/20 tabular-nums">
                          {item.overdue8to30 > 0 ? formatCurrency(item.overdue8to30) : '-'}
                        </td>
                      )}
                      {visibleColumns.includes('overdueOver30') && (
                        <td className="px-6 py-4 text-right text-red-700 font-bold bg-red-50/20 tabular-nums">
                          {item.overdueOver30 > 0 ? formatCurrency(item.overdueOver30) : '-'}
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
              <div className="text-right text-gray-900">Tổng: {formatCurrency(totals.total)}</div>
              <div className="text-right text-green-700">Trong hạn: {formatCurrency(totals.inTerm)}</div>
              <div className="text-right text-yellow-700">QH 1-7: {formatCurrency(totals.overdue1to7)}</div>
              <div className="text-right text-orange-700">QH 8-30: {formatCurrency(totals.overdue8to30)}</div>
              <div className="text-right text-red-700 font-extrabold">QH &gt;30: {formatCurrency(totals.overdueOver30)}</div>
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
                  <th className="px-6 py-3 text-center">Số khách hàng nợ</th>
                  <th className="px-6 py-3 text-right">Tổng nợ quản lý</th>
                  <th className="px-6 py-3 text-right text-green-700">Nợ trong hạn</th>
                  <th className="px-6 py-3 text-right text-yellow-700">QH 1-7 ngày</th>
                  <th className="px-6 py-3 text-right text-orange-700">QH 8-30 ngày</th>
                  <th className="px-6 py-3 text-right text-red-700">QH &gt;30 ngày</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500 font-medium">Đang tải dữ liệu báo cáo...</td>
                  </tr>
                ) : filteredSaleDebts.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500 font-medium">Không có dữ liệu nợ theo Sale</td>
                  </tr>
                ) : (
                  filteredSaleDebts.map((item, idx) => (
                    <tr key={item.sale_name} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-left font-medium text-gray-500">{idx + 1}</td>
                      <td className="px-6 py-4 text-left font-semibold text-gray-800">{item.sale_name}</td>
                      <td className="px-6 py-4 text-center font-medium">{item.customerCount}</td>
                      <td className="px-6 py-4 text-right font-bold text-gray-900 tabular-nums">{formatCurrency(item.totalDebt)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-green-700 bg-green-50/10 tabular-nums">{formatCurrency(item.inTerm)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-yellow-700 bg-yellow-50/10 tabular-nums">{formatCurrency(item.overdue1to7)}</td>
                      <td className="px-6 py-4 text-right font-semibold text-orange-700 bg-orange-50/10 tabular-nums">{formatCurrency(item.overdue8to30)}</td>
                      <td className="px-6 py-4 text-right font-bold text-red-700 bg-red-50/10 tabular-nums">{formatCurrency(item.overdueOver30)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 font-bold text-sm">
            <div className="text-gray-600">TỔNG CỘNG:</div>
            <div className="flex gap-4 sm:gap-6 flex-wrap justify-end">
              <div className="text-right text-gray-900">Tổng: {formatCurrency(totals.total)}</div>
              <div className="text-right text-green-700">Trong hạn: {formatCurrency(totals.inTerm)}</div>
              <div className="text-right text-yellow-700">QH 1-7: {formatCurrency(totals.overdue1to7)}</div>
              <div className="text-right text-orange-700">QH 8-30: {formatCurrency(totals.overdue8to30)}</div>
              <div className="text-right text-red-700">QH &gt;30: {formatCurrency(totals.overdueOver30)}</div>
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
