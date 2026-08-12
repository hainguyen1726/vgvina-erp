import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useBranch } from '../contexts/BranchContext';
import { useNotification } from '../contexts/NotificationContext';
import { partnerService } from '../src/services/partnerService';
import { orderService } from '../src/services/orderService';
import { transactionService } from '../src/services/transactionService';
import { Partner, SalesOrder, FinancialTransaction, DebtWarningItem, OverdueOrderInfo, PartnerType } from '../types';
import SearchableSelect from '../components/ui/SearchableSelect';
import Pagination from '../components/ui/Pagination';
import { ExportIcon, SearchIcon, ChevronLeftIcon, ChevronRightIcon, PrintIcon, CloseIcon } from '../components/icons/Icons';
import * as XLSX from 'xlsx-js-style';
import PrintVoucherTemplate from '../components/print/PrintVoucherTemplate';

const formatCurrency = (val: number) => {
  return Math.round(val || 0).toLocaleString('vi-VN') + ' ₫';
};

const formatDate = (dateStr: string) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
};

export const DebtWarning: React.FC = () => {
  const { showNotification } = useNotification();
  const { selectedBranch, selectedFacilityId } = useBranch();

  // State
  const [activeTab, setActiveTab] = useState<'WARNINGS' | 'SETTINGS'>('WARNINGS');
  const [loading, setLoading] = useState(true);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);

  // Filter & Search states
  const [searchTerm, setSearchTerm] = useState('');
  const [warningLevelFilter, setWarningLevelFilter] = useState<string>('ALL'); // ALL | DANGER | WARNING | UPCOMING
  const [amountRangeFilter, setAmountRangeFilter] = useState<string>('ALL'); // ALL | 10M | 50M | 100M

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);

  // Settings Tab states
  const [editingDueDays, setEditingDueDays] = useState<{ [partnerId: string]: number }>({});
  const [savingPartnerId, setSavingPartnerId] = useState<string | null>(null);

  // Modals
  const [selectedWarningPartner, setSelectedWarningPartner] = useState<DebtWarningItem | null>(null);
  const [selectedOrderForDetail, setSelectedOrderForDetail] = useState<SalesOrder | OverdueOrderInfo | null>(null);
  const [printNoticeData, setPrintNoticeData] = useState<any | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [partnersData, ordersData, txnsData] = await Promise.all([
        partnerService.getPartners(),
        orderService.getSalesOrders(),
        transactionService.getTransactions()
      ]);

      // Only include Customers for debt warnings
      const customers = (partnersData || []).filter(
        p => p.type === PartnerType.CUSTOMER || String(p.type).toUpperCase() === PartnerType.CUSTOMER
      );

      setPartners(customers);
      setSalesOrders(ordersData || []);
      setTransactions(txnsData || []);
    } catch (err: any) {
      console.error('Error fetching data for debt warnings:', err);
      showNotification('Không thể tải dữ liệu cảnh báo nợ', 'error');
    } finally {
      setLoading(false);
    }
  };

  // 1. Calculate FIFO Debt & Overdue Status per Customer
  const debtWarningList = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const warnings: DebtWarningItem[] = [];

    partners.forEach(partner => {
      // Get all sales orders for this partner sorted by date ascending (oldest first)
      const customerOrders = salesOrders
        .filter(o => o.customer_name === partner.name)
        .sort((a, b) => new Date(a.order_date).getTime() - new Date(b.order_date).getTime());

      if (customerOrders.length === 0) return;

      const dueDays = Number(partner.payment_due_days) || 0;

      // Track order payments using FIFO
      const overdueOrders: OverdueOrderInfo[] = [];
      let totalOverdueForCustomer = 0;
      let maxDaysOverdueForCustomer = 0;

      customerOrders.forEach(order => {
        const orderTotal = Number(order.total_amount) || 0;
        const paid = Number(order.amount_paid) || 0;
        const remaining = orderTotal - paid;

        if (remaining <= 0) return; // Order is fully paid

        const orderDate = new Date(order.order_date);
        orderDate.setHours(0, 0, 0, 0);

        // Due Date = Order Date + payment_due_days
        const dueDate = new Date(orderDate);
        dueDate.setDate(dueDate.getDate() + dueDays);

        // Calculate days overdue
        const diffTime = today.getTime() - dueDate.getTime();
        const daysOverdue = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        // Order is overdue if daysOverdue > 0, or upcoming if -2 <= daysOverdue <= 0
        if (daysOverdue > 0 || (daysOverdue >= -2 && daysOverdue <= 0)) {
          if (daysOverdue > maxDaysOverdueForCustomer) {
            maxDaysOverdueForCustomer = daysOverdue;
          }

          totalOverdueForCustomer += remaining;

          overdueOrders.push({
            orderId: order.id,
            code: order.code,
            orderDate: order.order_date,
            dueDate: dueDate.toISOString().split('T')[0],
            totalAmount: orderTotal,
            amountPaid: paid,
            remainingAmount: remaining,
            daysOverdue: daysOverdue,
            status: order.status,
            facilityName: order.facility_name,
            items: order.items || [],
            notes: order.notes
          });
        }
      });

      if (overdueOrders.length > 0) {
        let level: 'DANGER' | 'WARNING' | 'UPCOMING' = 'UPCOMING';
        if (maxDaysOverdueForCustomer > 7) {
          level = 'DANGER';
        } else if (maxDaysOverdueForCustomer >= 1) {
          level = 'WARNING';
        } else {
          level = 'UPCOMING';
        }

        warnings.push({
          partnerId: partner.id,
          partnerName: partner.name,
          phone: partner.phone || '',
          address: partner.address || '',
          taxCode: partner.tax_code,
          paymentDueDays: dueDays,
          overdueOrdersCount: overdueOrders.length,
          totalOverdueAmount: totalOverdueForCustomer,
          maxDaysOverdue: maxDaysOverdueForCustomer,
          warningLevel: level,
          orders: overdueOrders,
          facilityName: partner.facility_ids && partner.facility_ids.length > 0 ? '' : 'Chung'
        });
      }
    });

    return warnings.sort((a, b) => b.maxDaysOverdue - a.maxDaysOverdue);
  }, [partners, salesOrders]);

  // 2. Filter warnings list
  const filteredWarnings = useMemo(() => {
    let list = debtWarningList;

    // Filter by branch
    if (selectedFacilityId && selectedBranch !== 'Tất cả chi nhánh') {
      list = list.filter(item =>
        item.orders.some(o => o.facilityName === selectedBranch)
      );
    }

    // Filter by warning level
    if (warningLevelFilter !== 'ALL') {
      list = list.filter(item => item.warningLevel === warningLevelFilter);
    }

    // Filter by amount range
    if (amountRangeFilter === '10M') {
      list = list.filter(item => item.totalOverdueAmount >= 10000000);
    } else if (amountRangeFilter === '50M') {
      list = list.filter(item => item.totalOverdueAmount >= 50000000);
    } else if (amountRangeFilter === '100M') {
      list = list.filter(item => item.totalOverdueAmount >= 100000000);
    }

    // Search filter (Partner name, phone, tax code, order code)
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      list = list.filter(item =>
        item.partnerName.toLowerCase().includes(term) ||
        item.phone.toLowerCase().includes(term) ||
        (item.taxCode && item.taxCode.toLowerCase().includes(term)) ||
        item.orders.some(o => o.code.toLowerCase().includes(term))
      );
    }

    return list;
  }, [debtWarningList, selectedFacilityId, selectedBranch, warningLevelFilter, amountRangeFilter, searchTerm]);

  // Summary Metrics
  const summaryMetrics = useMemo(() => {
    const dangerCount = filteredWarnings.filter(w => w.warningLevel === 'DANGER').length;
    const warningCount = filteredWarnings.filter(w => w.warningLevel === 'WARNING').length;
    const upcomingCount = filteredWarnings.filter(w => w.warningLevel === 'UPCOMING').length;

    const totalOverdueAmount = filteredWarnings.reduce((sum, w) => sum + w.totalOverdueAmount, 0);
    const totalOverdueOrders = filteredWarnings.reduce((sum, w) => sum + w.overdueOrdersCount, 0);

    return {
      totalCustomers: filteredWarnings.length,
      dangerCount,
      warningCount,
      upcomingCount,
      totalOverdueAmount,
      totalOverdueOrders
    };
  }, [filteredWarnings]);

  // Pagination for Warnings Table
  const totalPages = Math.ceil(filteredWarnings.length / itemsPerPage);
  const paginatedWarnings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredWarnings.slice(start, start + itemsPerPage);
  }, [filteredWarnings, currentPage, itemsPerPage]);

  // Save updated due days for partner
  const handleSavePartnerDueDays = async (partnerId: string) => {
    const newDays = editingDueDays[partnerId];
    if (newDays === undefined || newDays < 0) return;

    try {
      setSavingPartnerId(partnerId);
      await partnerService.updatePaymentDueDays(partnerId, Number(newDays));

      setPartners(prev =>
        prev.map(p => (p.id === partnerId ? { ...p, payment_due_days: Number(newDays) } : p))
      );

      showNotification('Đã cập nhật hạn nợ khách hàng thành công', 'success');
    } catch (err: any) {
      console.error('Failed to update partner payment_due_days:', err);
      showNotification('Lỗi khi lưu hạn công nợ', 'error');
    } finally {
      setSavingPartnerId(null);
    }
  };

  // Export Excel
  const handleExportExcel = () => {
    try {
      const exportData = filteredWarnings.map((item, index) => ({
        'STT': index + 1,
        'Khách hàng': item.partnerName,
        'Số điện thoại': item.phone,
        'Mã số thuế': item.taxCode || '',
        'Hạn công nợ (ngày)': item.paymentDueDays,
        'Số đơn quá hạn': item.overdueOrdersCount,
        'Tổng tiền nợ đến hạn (VNĐ)': item.totalOverdueAmount,
        'Quá hạn tối đa (ngày)': item.maxDaysOverdue > 0 ? item.maxDaysOverdue : 0,
        'Trạng thái cảnh báo':
          item.warningLevel === 'DANGER'
            ? 'Quá hạn nguy hiểm (>7 ngày)'
            : item.warningLevel === 'WARNING'
            ? 'Quá hạn (1-7 ngày)'
            : 'Sắp đến hạn (1-2 ngày)'
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'CanhBaoNo');
      XLSX.writeFile(workbook, `Bao_Cao_Canh_Bao_No_${new Date().toISOString().split('T')[0]}.xlsx`);
      showNotification('Xuất file Excel thành công', 'success');
    } catch (err: any) {
      console.error('Export Excel failed:', err);
      showNotification('Lỗi khi xuất file Excel', 'error');
    }
  };

  // Open Debt Notice Print Preview
  const handlePrintDebtNotice = (item: DebtWarningItem) => {
    const noticeData = {
      debtType: 'RECEIVABLE',
      partner: {
        name: item.partnerName,
        address: item.address,
        phone: item.phone,
        taxCode: item.taxCode
      },
      partnerType: 'CUSTOMER',
      dateRange: {
        from: item.orders[0]?.orderDate || new Date().toISOString(),
        to: new Date().toISOString()
      },
      transactions: item.orders.map(o => ({
        order_date: o.orderDate,
        code: o.code,
        items: o.items.map(i => ({ product: { name: i.product?.name || (i as any).name || 'Hàng hóa' } })),
        total_amount: o.remainingAmount
      })),
      summary: {
        total: item.totalOverdueAmount,
        paid: 0,
        remaining: item.totalOverdueAmount
      },
      bankInfo: {}
    };

    setPrintNoticeData(noticeData);
  };

  useEffect(() => {
    if (printNoticeData) {
      const timer = setTimeout(() => {
        try {
          window.print();
        } catch (e) {
          console.error("Print notice failed", e);
        } finally {
          setPrintNoticeData(null);
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [printNoticeData]);

  return (
    <div className="space-y-6">
      {/* Top Title & Tab Switching */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span>🚨</span> Cảnh Báo Nợ Đến Hạn & Quá Hạn
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Theo dõi hạn trả nợ của khách hàng theo thuật toán FIFO (đơn cũ trả trước)
          </p>
        </div>

        <div className="flex items-center bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('WARNINGS')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'WARNINGS' ? 'bg-white text-[#0066cc] shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            🚨 Danh sách Cảnh báo ({debtWarningList.length})
          </button>
          <button
            onClick={() => setActiveTab('SETTINGS')}
            className={`px-4 py-2 text-sm font-semibold rounded-md transition-all ${
              activeTab === 'SETTINGS' ? 'bg-white text-[#0066cc] shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            ⚙️ Cấu hình Hạn Nợ ({partners.length})
          </button>
        </div>
      </div>

      {activeTab === 'WARNINGS' && (
        <>
          {/* Summary Dashboard Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-red-500">
              <p className="text-xs font-medium text-gray-500 uppercase">Khách quá hạn nguy hiểm (&gt;7d)</p>
              <p className="text-2xl font-extrabold text-red-600 mt-1">{summaryMetrics.dangerCount} khách</p>
              <p className="text-xs text-gray-400 mt-1">Cần đòi nợ gấp</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-amber-500">
              <p className="text-xs font-medium text-gray-500 uppercase">Khách quá hạn (1 - 7d)</p>
              <p className="text-2xl font-extrabold text-amber-600 mt-1">{summaryMetrics.warningCount} khách</p>
              <p className="text-xs text-gray-400 mt-1">Cần gọi điện nhắc nợ</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-emerald-500">
              <p className="text-xs font-medium text-gray-500 uppercase">Khách sắp đến hạn (1 - 2d)</p>
              <p className="text-2xl font-extrabold text-emerald-600 mt-1">{summaryMetrics.upcomingCount} khách</p>
              <p className="text-xs text-gray-400 mt-1">Chuẩn bị gửi báo nợ</p>
            </div>

            <div className="bg-white p-4 rounded-lg shadow-sm border-l-4 border-[#0066cc]">
              <p className="text-xs font-medium text-gray-500 uppercase">Tổng tiền nợ đến hạn</p>
              <p className="text-2xl font-extrabold text-[#0066cc] mt-1">{formatCurrency(summaryMetrics.totalOverdueAmount)}</p>
              <p className="text-xs text-gray-400 mt-1">Từ {summaryMetrics.totalOverdueOrders} đơn chưa trả</p>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-lg shadow-sm space-y-3">
            <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3">
              {/* Search input */}
              <div className="relative flex-1">
                <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Tìm theo tên khách hàng, SĐT, mã đơn SO-..."
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-[#0066cc] focus:border-[#0066cc]"
                />
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportExcel}
                  className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 rounded-md transition-colors whitespace-nowrap"
                >
                  <ExportIcon className="w-4 h-4" />
                  <span>Xuất Excel</span>
                </button>
              </div>
            </div>

            {/* Sub Filters */}
            <div className="flex flex-wrap items-center gap-3 pt-2 border-t text-sm">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-gray-500">Mức độ:</span>
                <select
                  value={warningLevelFilter}
                  onChange={e => setWarningLevelFilter(e.target.value)}
                  className="px-2.5 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white"
                >
                  <option value="ALL">Tất cả mức độ</option>
                  <option value="DANGER">🔴 Nguy hiểm (&gt;7 ngày)</option>
                  <option value="WARNING">🟡 Quá hạn (1-7 ngày)</option>
                  <option value="UPCOMING">🟢 Sắp đến hạn (1-2 ngày)</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-gray-500">Dư nợ:</span>
                <select
                  value={amountRangeFilter}
                  onChange={e => setAmountRangeFilter(e.target.value)}
                  className="px-2.5 py-1 border border-gray-300 rounded-md text-xs font-medium text-gray-700 bg-white"
                >
                  <option value="ALL">Tất cả hạn mức</option>
                  <option value="10M">&gt; 10 triệu</option>
                  <option value="50M">&gt; 50 triệu</option>
                  <option value="100M">&gt; 100 triệu</option>
                </select>
              </div>
            </div>
          </div>

          {/* Main Debt Warning Table */}
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066cc]"></div>
              </div>
            ) : filteredWarnings.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <p className="text-lg font-medium">Không có cảnh báo nợ nào phù hợp</p>
                <p className="text-xs mt-1 text-gray-400">Tất cả khách hàng đã thanh toán đúng hạn hoặc chưa cài đặt hạn nợ</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 font-semibold border-b text-xs uppercase tracking-wider">
                    <tr>
                      <th className="px-4 py-3 text-center w-12">STT</th>
                      <th className="px-4 py-3">Khách hàng</th>
                      <th className="px-4 py-3 text-center">Hạn nợ</th>
                      <th className="px-4 py-3 text-center">Đơn quá hạn</th>
                      <th className="px-4 py-3 text-right">Tổng nợ đến hạn</th>
                      <th className="px-4 py-3 text-center">Mức độ</th>
                      <th className="px-4 py-3 text-center w-36">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {paginatedWarnings.map((item, idx) => (
                      <tr key={item.partnerId} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3.5 text-center text-gray-400">
                          {(currentPage - 1) * itemsPerPage + idx + 1}
                        </td>
                        <td className="px-4 py-3.5">
                          <p className="font-bold text-gray-900">{item.partnerName}</p>
                          <p className="text-xs text-gray-500 mt-0.5">{item.phone} {item.address ? `• ${item.address}` : ''}</p>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-block px-2.5 py-1 text-xs font-semibold bg-gray-100 text-gray-800 rounded-full">
                            {item.paymentDueDays} ngày
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <button
                            onClick={() => setSelectedWarningPartner(item)}
                            className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold text-[#0066cc] bg-blue-50 border border-blue-200 rounded-full hover:bg-blue-100 transition-colors"
                          >
                            <span>{item.overdueOrdersCount} đơn</span>
                            <span className="text-[10px] underline">Xem 🔍</span>
                          </button>
                        </td>
                        <td className="px-4 py-3.5 text-right font-extrabold text-red-600">
                          {formatCurrency(item.totalOverdueAmount)}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          {item.warningLevel === 'DANGER' && (
                            <span className="inline-block px-2.5 py-1 text-xs font-bold text-red-800 bg-red-100 border border-red-200 rounded-full">
                              🔴 Quá {item.maxDaysOverdue}d
                            </span>
                          )}
                          {item.warningLevel === 'WARNING' && (
                            <span className="inline-block px-2.5 py-1 text-xs font-bold text-amber-800 bg-amber-100 border border-amber-200 rounded-full">
                              🟡 Quá {item.maxDaysOverdue}d
                            </span>
                          )}
                          {item.warningLevel === 'UPCOMING' && (
                            <span className="inline-block px-2.5 py-1 text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-200 rounded-full">
                              🟢 Sắp đến hạn
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => handlePrintDebtNotice(item)}
                              title="Tạo & in Giấy nhắc nợ cho khách hàng"
                              className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300 rounded hover:bg-gray-50"
                            >
                              <PrintIcon className="w-3.5 h-3.5" />
                              <span>Nhắc nợ</span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {!loading && filteredWarnings.length > 0 && (
              <div className="p-4 border-t flex justify-center">
                <Pagination
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={setCurrentPage}
                  itemsPerPage={itemsPerPage}
                  onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                  totalItems={filteredWarnings.length}
                  prevButtonContent={<ChevronLeftIcon />}
                  nextButtonContent={<ChevronRightIcon />}
                />
              </div>
            )}
          </div>
        </>
      )}

      {/* Tab 2: Settings Tab - Set Payment Due Days per Partner */}
      {activeTab === 'SETTINGS' && (
        <div className="bg-white rounded-lg shadow-sm p-6 space-y-4">
          <div className="border-b pb-4">
            <h2 className="text-lg font-bold text-gray-900">Cấu Hình Hạn Công Nợ Cho Khách Hàng</h2>
            <p className="text-xs text-gray-500 mt-1">
              Nhập số ngày hạn trả nợ cho từng khách hàng (Ví dụ: 7 ngày, 10 ngày, 30 ngày). Đơn hàng vượt quá số ngày này sẽ tự động cảnh báo.
            </p>
          </div>

          <div className="relative max-w-md mb-4">
            <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm tên khách hàng..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm"
            />
          </div>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left text-gray-600">
              <thead className="bg-gray-50 text-gray-700 font-semibold border-b text-xs uppercase">
                <tr>
                  <th className="px-4 py-3 w-12 text-center">STT</th>
                  <th className="px-4 py-3">Tên Khách Hàng</th>
                  <th className="px-4 py-3">Số Điện Thoại / Địa Chỉ</th>
                  <th className="px-4 py-3 text-center w-48">Hạn Công Nợ (Ngày)</th>
                  <th className="px-4 py-3 text-center w-28">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {partners
                  .filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || (p.phone && p.phone.includes(searchTerm)))
                  .map((p, idx) => {
                    const currentDays = editingDueDays[p.id] !== undefined ? editingDueDays[p.id] : (p.payment_due_days || 0);
                    const isChanged = editingDueDays[p.id] !== undefined && editingDueDays[p.id] !== (p.payment_due_days || 0);

                    return (
                      <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 text-center text-gray-400">{idx + 1}</td>
                        <td className="px-4 py-3 font-semibold text-gray-900">{p.name}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">{p.phone} {p.address ? `• ${p.address}` : ''}</td>
                        <td className="px-4 py-3 text-center">
                          <div className="flex items-center justify-center gap-1">
                            <input
                              type="number"
                              min="0"
                              max="365"
                              value={currentDays}
                              onChange={e => setEditingDueDays({ ...editingDueDays, [p.id]: Math.max(0, parseInt(e.target.value) || 0) })}
                              className="w-24 px-3 py-1.5 border border-gray-300 rounded text-center font-bold text-[#0066cc] focus:ring-1 focus:ring-[#0066cc]"
                            />
                            <span className="text-xs text-gray-500 font-medium">ngày</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleSavePartnerDueDays(p.id)}
                            disabled={!isChanged || savingPartnerId === p.id}
                            className={`px-3 py-1.5 text-xs font-semibold rounded transition-colors ${
                              isChanged
                                ? 'bg-[#0066cc] text-white hover:bg-[#0052a3]'
                                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            }`}
                          >
                            {savingPartnerId === p.id ? 'Đang lưu...' : 'Lưu'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Drill-down Level 1 Modal: Overdue Orders List for a Customer */}
      {selectedWarningPartner && (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[85vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b p-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Danh sách đơn hàng chưa trả: <span className="text-[#0066cc]">{selectedWarningPartner.partnerName}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Hạn công nợ: <strong className="text-gray-800">{selectedWarningPartner.paymentDueDays} ngày</strong> • Số điện thoại: {selectedWarningPartner.phone}
                </p>
              </div>
              <button onClick={() => setSelectedWarningPartner(null)} className="text-gray-400 hover:text-gray-700 p-2">
                <CloseIcon />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="bg-gray-50 text-gray-700 font-semibold border-b text-xs uppercase">
                    <tr>
                      <th className="px-3 py-2.5 text-center">STT</th>
                      <th className="px-3 py-2.5">Mã Đơn</th>
                      <th className="px-3 py-2.5 text-center">Ngày đơn</th>
                      <th className="px-3 py-2.5 text-center">Ngày đến hạn</th>
                      <th className="px-3 py-2.5 text-right">Tổng tiền</th>
                      <th className="px-3 py-2.5 text-right">Đã trả</th>
                      <th className="px-3 py-2.5 text-right">Còn nợ</th>
                      <th className="px-3 py-2.5 text-center">Số ngày quá hạn</th>
                      <th className="px-3 py-2.5 text-center">Chi tiết</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {selectedWarningPartner.orders.map((ord, idx) => (
                      <tr key={ord.orderId} className="hover:bg-blue-50/50 transition-colors">
                        <td className="px-3 py-2.5 text-center text-gray-400">{idx + 1}</td>
                        <td className="px-3 py-2.5 font-bold text-gray-900">{ord.code}</td>
                        <td className="px-3 py-2.5 text-center">{formatDate(ord.orderDate)}</td>
                        <td className="px-3 py-2.5 text-center font-medium text-gray-700">{formatDate(ord.dueDate)}</td>
                        <td className="px-3 py-2.5 text-right">{formatCurrency(ord.totalAmount)}</td>
                        <td className="px-3 py-2.5 text-right text-green-600 font-medium">{formatCurrency(ord.amountPaid)}</td>
                        <td className="px-3 py-2.5 text-right font-bold text-red-600">{formatCurrency(ord.remainingAmount)}</td>
                        <td className="px-3 py-2.5 text-center">
                          {ord.daysOverdue > 0 ? (
                            <span className="font-bold text-red-600">Quá {ord.daysOverdue} ngày</span>
                          ) : (
                            <span className="font-semibold text-emerald-600">Còn {Math.abs(ord.daysOverdue)} ngày</span>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-center">
                          <button
                            onClick={() => setSelectedOrderForDetail(ord)}
                            className="px-2.5 py-1 text-xs font-semibold text-[#0066cc] bg-white border border-[#0066cc] rounded hover:bg-blue-50"
                          >
                            Xem 🔍
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="border-t p-4 flex justify-between items-center bg-gray-50 rounded-b-lg">
              <span className="text-sm font-bold text-gray-800">
                Tổng cộng nợ: <strong className="text-red-600 text-lg">{formatCurrency(selectedWarningPartner.totalOverdueAmount)}</strong>
              </span>
              <button
                onClick={() => setSelectedWarningPartner(null)}
                className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Drill-down Level 2 Modal: Order Itemized Details */}
      {selectedOrderForDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-[60] flex justify-center items-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b p-4">
              <div>
                <h3 className="text-lg font-bold text-gray-900">
                  Chi Tiết Đơn Hàng: <span className="text-[#0066cc]">{selectedOrderForDetail.code}</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  Ngày tạo: {formatDate(selectedOrderForDetail.order_date || (selectedOrderForDetail as any).orderDate)}
                </p>
              </div>
              <button onClick={() => setSelectedOrderForDetail(null)} className="text-gray-400 hover:text-gray-700 p-2">
                <CloseIcon />
              </button>
            </div>

            <div className="p-6 overflow-y-auto flex-1 space-y-4">
              <div className="overflow-x-auto border rounded-lg">
                <table className="w-full text-sm text-left text-gray-600">
                  <thead className="bg-gray-100 text-gray-700 font-semibold border-b text-xs uppercase">
                    <tr>
                      <th className="px-3 py-2 text-center w-12">STT</th>
                      <th className="px-3 py-2">Tên sản phẩm</th>
                      <th className="px-3 py-2 text-center">ĐVT</th>
                      <th className="px-3 py-2 text-center">Số lượng</th>
                      <th className="px-3 py-2 text-right">Đơn giá</th>
                      <th className="px-3 py-2 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {(selectedOrderForDetail.items || []).map((item, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-center text-gray-400">{idx + 1}</td>
                        <td className="px-3 py-2 font-medium text-gray-800">
                          {item.product?.name || (item as any).name || 'Sản phẩm'}
                        </td>
                        <td className="px-3 py-2 text-center text-xs">{item.product?.unit || 'Kg'}</td>
                        <td className="px-3 py-2 text-center font-bold">{item.quantity}</td>
                        <td className="px-3 py-2 text-right">{formatCurrency(item.price)}</td>
                        <td className="px-3 py-2 text-right font-bold text-gray-900">
                          {formatCurrency(item.quantity * item.price)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {selectedOrderForDetail.notes && (
                <div className="p-3 bg-gray-50 border rounded text-xs text-gray-600">
                  <strong>Ghi chú đơn hàng:</strong> {selectedOrderForDetail.notes}
                </div>
              )}
            </div>

            <div className="border-t p-4 flex justify-between items-center bg-gray-50 rounded-b-lg">
              <div className="text-sm font-bold">
                <span>Tổng giá trị đơn: </span>
                <span className="text-[#0066cc] text-base">{formatCurrency(selectedOrderForDetail.total_amount || (selectedOrderForDetail as any).totalAmount)}</span>
              </div>
              <button
                onClick={() => setSelectedOrderForDetail(null)}
                className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Hidden Print Container for Printable Debt Notice */}
      {printNoticeData && createPortal(
        <div id="print-section" className="hidden print:block bg-white p-0 m-0 z-[100]">
          <PrintVoucherTemplate voucherType="debt-notice" data={printNoticeData} />
        </div>,
        document.body
      )}
    </div>
  );
};

export default DebtWarning;
