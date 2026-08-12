import React, { useMemo, useState, useRef, useEffect } from 'react';
import { formatDate } from '../src/utils/dateUtils';
import FilterBar from '../components/ui/FilterBar';
import { FinancialTransaction, TransactionType } from '../types';
import { ExportIcon, ColumnOptionsIcon, ChevronLeftIcon, CalendarIcon, ChevronDownIcon, EditIcon, DeleteIcon, ArrowUpIcon, ArrowsUpDownIcon, ChevronRightIcon } from '../components/icons/Icons';
import Pagination from '../components/ui/Pagination';
import { TableActions } from '../components/ui/TableActions';
import EditTransactionModal from '../components/modals/EditTransactionModal';
import { useBranch } from '../contexts/BranchContext';
import { transactionService } from '../src/services/transactionService';
import { accountService } from '../src/services/accountService';
import { useNotification } from '../contexts/NotificationContext';

interface PartnerTotalData {
  name: string;
  total: number;
}

type TransactionWithAccount = FinancialTransaction & { account_name: string };

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


const processDataForPartnerTotalReport = (transactions: FinancialTransaction[]): PartnerTotalData[] => {
  const partnerMap: { [key: string]: number } = {};

  transactions.forEach(t => {
    const partnerName = t.partner_name || 'Giao dịch khác';
    if (!partnerMap[partnerName]) {
      partnerMap[partnerName] = 0;
    }
    // Net flow: Income is positive, Expense is negative
    const amount = t.type === TransactionType.INCOME ? t.amount : -t.amount;
    partnerMap[partnerName] += amount;
  });

  return Object.keys(partnerMap)
    .map(partnerName => ({
      name: partnerName,
      total: partnerMap[partnerName]
    }))
    .sort((a, b) => b.total - a.total);
};

// Modal Component for Transaction Details
const DetailModal = ({ item, onClose, onEditClick, onDeleteClick }: { item: FinancialTransaction | null, onClose: () => void, onEditClick: (item: FinancialTransaction) => void, onDeleteClick: (item: FinancialTransaction) => void }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">Chi tiết giao dịch</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
            <div><strong className="font-medium text-gray-600">Mã phiếu:</strong> <span className="text-gray-800">{item.code}</span></div>
            <div><strong className="font-medium text-gray-600">Ngày:</strong> <span className="text-gray-800">{formatDate(item.transaction_date)}</span></div>
            <div className="col-span-2"><strong className="font-medium text-gray-600">Số tiền:</strong> <span className={`font-semibold tabular-nums inline-block text-right ${item.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>{item.amount.toLocaleString('vi-VN')} ₫</span></div>
            <div><strong className="font-medium text-gray-600">Loại:</strong> <span className="text-gray-800">{item.type === TransactionType.INCOME ? 'Thu' : 'Chi'}</span></div>
            <div><strong className="font-medium text-gray-600">Hạng mục:</strong> <span className="text-gray-800">{item.category}</span></div>
            <div className="col-span-2"><strong className="font-medium text-gray-600">Đối tác:</strong> <span className="text-gray-800">{item.partner_name || 'N/A'}</span></div>
            <div className="col-span-2"><strong className="font-medium text-gray-600">Nhân viên:</strong> <span className="text-gray-800">{(item.employee_names || []).join(', ')}</span></div>
            <div className="col-span-2"><strong className="font-medium text-gray-600">Mô tả:</strong> <p className="text-gray-800 mt-1">{item.description}</p></div>
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

const ReportIncomeExpensePartner: React.FC = () => {
  const { showNotification } = useNotification();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [adminAccounts, setAdminAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPartner, setSelectedPartner] = useState<PartnerTotalData | null>(null);
  const [modalItem, setModalItem] = useState<FinancialTransaction | null>(null);
  const [itemToDelete, setItemToDelete] = useState<FinancialTransaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<FinancialTransaction | null>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(isMobile ? 8 : 30);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [visibleDetailColumns, setVisibleDetailColumns] = useState<string[]>(['transaction_date', 'description', 'category', 'facility_name', 'account_name', 'amount']);

  const { currentUser, selectedBranch, selectedFacilityId } = useBranch();

  const [selectedTimeFilter, setSelectedTimeFilter] = useState('All time');
  const [customDates, setCustomDates] = useState<{ from: string; to: string }>({ from: '', to: '' });

  const handleTimeFilterChange = (filter: string, dates?: { from: Date; to: Date }) => {
    setSelectedTimeFilter(filter);
    if (dates) {
      setCustomDates({
        from: dates.from.toISOString().split('T')[0],
        to: dates.to.toISOString().split('T')[0]
      });
    }
    setCurrentPage(1);
  };

  // Load visible columns from localStorage
  useEffect(() => {
    if (currentUser?.id) {
      const savedColumns = localStorage.getItem(`income_expense_partner_detail_columns_v2_${currentUser.id}`);
      if (savedColumns) {
        try {
          setVisibleDetailColumns(JSON.parse(savedColumns));
        } catch (e) {
          console.error("Failed to parse saved columns", e);
        }
      }
    }
  }, [currentUser?.id]);

  // Save visible columns to localStorage
  useEffect(() => {
    if (currentUser?.id) {
      localStorage.setItem(`income_expense_partner_detail_columns_v2_${currentUser.id}`, JSON.stringify(visibleDetailColumns));
    }
  }, [visibleDetailColumns, currentUser?.id]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [transactionsData, accountsData] = await Promise.all([
        transactionService.getTransactions(),
        accountService.getAccounts()
      ]);
      setTransactions(transactionsData);
      setAdminAccounts(accountsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
      showNotification("Không thể tải dữ liệu báo cáo", "error");
    } finally {
      setLoading(false);
    }
  };

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

  // Filter transactions by branch, date range, and search term
  const filteredTransactions = useMemo(() => {
    let result = transactions;

    // Filter by branch
    if (selectedFacilityId && selectedBranch !== 'Tất cả chi nhánh') {
      result = result.filter(t => t.facility_id === selectedFacilityId || t.facility_name === selectedBranch);
    }

    // Filter by date range
    const now = new Date();
    let fromDate: Date | null = null;
    let toDate: Date | null = new Date();
    toDate.setHours(23, 59, 59, 999);

    switch (selectedTimeFilter) {
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
      case 'Tuần này':
        fromDate = new Date();
        const dayOfWeek = fromDate.getDay();
        const diff = fromDate.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
        fromDate = new Date(fromDate.setDate(diff));
        fromDate.setHours(0, 0, 0, 0);
        break;
      case 'Tháng này':
        fromDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'Tháng trước':
        fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        toDate = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
        break;
      case 'Quý này':
        const quarter = Math.floor(now.getMonth() / 3);
        fromDate = new Date(now.getFullYear(), quarter * 3, 1);
        break;
      case 'Quý trước':
        const prevQuarter = Math.floor(now.getMonth() / 3) - 1;
        const qYear = prevQuarter < 0 ? now.getFullYear() - 1 : now.getFullYear();
        const qMonth = prevQuarter < 0 ? 9 : prevQuarter * 3;
        fromDate = new Date(qYear, qMonth, 1);
        toDate = new Date(qYear, qMonth + 3, 0, 23, 59, 59, 999);
        break;
      case 'Năm nay':
        fromDate = new Date(now.getFullYear(), 0, 1);
        break;
      case 'Năm trước':
        fromDate = new Date(now.getFullYear() - 1, 0, 1);
        toDate = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
        break;
      case 'Tùy chọn':
        fromDate = customDates.from ? new Date(customDates.from) : null;
        toDate = customDates.to ? new Date(customDates.to) : null;
        if (fromDate) fromDate.setHours(0, 0, 0, 0);
        if (toDate) toDate.setHours(23, 59, 59, 999);
        break;
      default:
        fromDate = null;
        toDate = null;
        break;
    }

    if (fromDate || toDate) {
      result = result.filter(t => {
        const transactionDate = new Date(t.transaction_date);
        if (fromDate && transactionDate < fromDate) return false;
        if (toDate && transactionDate > toDate) return false;
        return true;
      });
    }

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(t =>
        t.description.toLowerCase().includes(term) ||
        (t.partner_name && t.partner_name.toLowerCase().includes(term)) ||
        (t.category && t.category.toLowerCase().includes(term)) ||
        (t.code && t.code.toLowerCase().includes(term))
      );
    }

    return result;
  }, [transactions, selectedFacilityId, selectedBranch, selectedTimeFilter, customDates, searchTerm]);

  const partnerData = useMemo(() => processDataForPartnerTotalReport(filteredTransactions), [filteredTransactions]);

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedTransactions = useMemo(() => {
    if (!selectedPartner) return [];

    const partnerKey = selectedPartner.name === 'Giao dịch khác' ? undefined : selectedPartner.name;
    const accountMap = new Map(adminAccounts.map(acc => [acc.id, acc.name]));

    let filtered: TransactionWithAccount[] = filteredTransactions
      .filter(t => (partnerKey === undefined ? t.partner_name === undefined : t.partner_name === partnerKey))
      .map(t => ({
        ...t,
        account_name: t.accountId ? accountMap.get(t.accountId) || 'N/A' : 'N/A'
      }));

    if (sortConfig) {
      filtered.sort((a, b) => {
        const aValue = (a as any)[sortConfig.key];
        const bValue = (b as any)[sortConfig.key];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (sortConfig.key === 'transaction_date') {
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
    } else {
      filtered.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());
    }

    return filtered;
  }, [selectedPartner, filteredTransactions, sortConfig, adminAccounts]);

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions = sortedTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const groupedTransactions = useMemo(() => paginatedTransactions.reduce((acc, transaction) => {
    const date = transaction.transaction_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, TransactionWithAccount[]>), [paginatedTransactions]);

  // FIX: Added missing function definitions and component logic.
  const handlePartnerClick = (partner: PartnerTotalData) => {
    setSelectedPartner(partner);
    setCurrentPage(1);
    setSearchTerm('');
    setSelectedTimeFilter('All time');
    setIsCustomRangeVisible(false);
    setSortConfig(null);
  };

  const maxTotal = useMemo(() => {
    if (partnerData.length === 0) return 0;
    return Math.max(...partnerData.map(item => Math.abs(item.total)));
  }, [partnerData]);

  const formatCurrency = (value: number) => `${value.toLocaleString('vi-VN')} ₫`;

  const handleTimeSelect = (option: string) => {
    setSelectedTimeFilter(option);
    setIsTimeDropdownOpen(false);
    if (option === 'Tùy chọn') {
      setTempCustomDates(customDates);
      setIsCustomRangeVisible(true);
    } else {
      setIsCustomRangeVisible(false);
      setCurrentPage(1);
    }
  };

  const handleCustomDateApply = () => {
    setCustomDates(tempCustomDates);
    setIsCustomRangeVisible(false);
    setCurrentPage(1);
  };

  const handleEditClick = (item: FinancialTransaction) => {
    setTransactionToEdit(item);
    setIsEditModalOpen(true);
    setModalItem(null);
  };

  const handleDeleteClick = (item: FinancialTransaction) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await transactionService.deleteTransaction(itemToDelete.id);
        setTransactions(prev => prev.filter(t => t.id !== itemToDelete.id));
        showNotification(`Đã xóa giao dịch ${itemToDelete.code}`, 'success');
      } catch (error) {
        console.error("Failed to delete transaction:", error);
        showNotification('Không thể xóa giao dịch. Vui lòng thử lại.', 'error');
      }
    }
    setItemToDelete(null);
    setModalItem(null);
  };

  const handleSaveTransaction = async (updatedTransaction: FinancialTransaction) => {
    try {
      await transactionService.updateTransaction(updatedTransaction.id, updatedTransaction);
      setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
      showNotification(`Đã cập nhật giao dịch ${updatedTransaction.code}`, 'success');
    } catch (error) {
      console.error("Failed to update transaction:", error);
      showNotification('Không thể cập nhật giao dịch. Vui lòng thử lại.', 'error');
    }
    setIsEditModalOpen(false);
    setTransactionToEdit(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setTransactionToEdit(null);
  };

  const renderCell = (transaction: TransactionWithAccount, columnKey: string) => {
    switch (columnKey) {
      case 'transaction_date': return formatDate(transaction.transaction_date);
      case 'description': return transaction.description;
      case 'category': return transaction.category;
      case 'facility_name': return transaction.facility_name;
      case 'account_name': return transaction.account_name;
      case 'amount':
        return (
          <span className={`font-medium ${transaction.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'} text-right w-full block tabular-nums`}>
            {transaction.type === TransactionType.INCOME ? '+' : '-'} {formatCurrency(transaction.amount)}
          </span>
        );
      default: return '';
    }
  };

  const renderDetailView = () => {
    if (!selectedPartner) return null;

    const detailColumns = [
      { key: 'transaction_date', label: 'Ngày' },
      { key: 'description', label: 'Mô tả' },
      { key: 'category', label: 'Hạng mục' },
      { key: 'facility_name', label: 'Chi nhánh' },
      { key: 'account_name', label: 'Tài khoản' },
      { key: 'amount', label: 'Số tiền' },
    ];

    const timeOptions = ['Hôm nay', 'Hôm qua', 'Tuần này', 'Tháng này', 'Quý này', 'Năm nay', 'All time', 'Tùy chọn'];
    const timeFilterComponent = (
      <div className="relative" ref={timeDropdownRef}>
        <button
          onClick={() => setIsTimeDropdownOpen(!isTimeDropdownOpen)}
          className="flex items-center justify-between w-48 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066cc]"
        >
          <span className="flex items-center">
            <CalendarIcon className="mr-2" />
            {selectedTimeFilter}
          </span>
          <ChevronDownIcon />
        </button>
        {isTimeDropdownOpen && (
          <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-30">
            <ul className="py-1">
              {timeOptions.map((option) => (
                <li key={option}>
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleTimeSelect(option); }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    {option}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );

    return (
      <div>
        <div className="flex items-center gap-4 mb-4">
          <button onClick={() => setSelectedPartner(null)} className="p-2 rounded-md hover:bg-gray-200">
            <ChevronLeftIcon />
          </button>
          <h2 className="text-xl font-bold text-gray-800">Báo cáo chi tiết: {selectedPartner.name}</h2>
        </div>

        <TableActions
          onSearch={setSearchTerm}
          searchPlaceholder="Tìm theo mô tả, hạng mục..."
          primaryActions={[{ label: 'Xuất file', icon: <ExportIcon />, onClick: () => { }, variant: 'secondary' },]}
          filterActions={timeFilterComponent}
          columns={detailColumns}
          visibleColumns={visibleDetailColumns}
          onVisibleColumnsChange={setVisibleDetailColumns}
        />

        {isCustomRangeVisible && (
          <div className="my-2 p-4 bg-white border rounded-md shadow-sm flex items-center space-x-4 justify-end">
            <div className="flex items-center space-x-2">
              <label htmlFor="from-date" className="text-sm font-medium text-gray-700">Từ</label>
              <input type="date" id="from-date" value={tempCustomDates.from} onChange={e => setTempCustomDates({ ...tempCustomDates, from: e.target.value })} className="w-40 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0066cc]" />
            </div>
            <div className="flex items-center space-x-2">
              <label htmlFor="to-date" className="text-sm font-medium text-gray-700">Đến</label>
              <input type="date" id="to-date" value={tempCustomDates.to} onChange={e => setTempCustomDates({ ...tempCustomDates, to: e.target.value })} className="w-40 px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-[#0066cc]" />
            </div>
            <button
              onClick={handleCustomDateApply}
              className="px-4 py-1.5 text-sm font-medium text-white bg-[#0066cc] rounded-md hover:bg-[#0052a3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066cc]"
            >
              Áp dụng
            </button>
          </div>
        )}

        <div className="hidden md:block bg-white rounded-lg shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left text-gray-500">
              <thead className="text-xs text-gray-700 bg-gray-50">
                <tr>
                  {detailColumns.filter(c => visibleDetailColumns.includes(c.key)).map(col => {
                    const isNumeric = ['amount'].includes(col.key);
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
                      </th>);
                  })}
                </tr>
              </thead>
              <tbody>
                {Object.entries(groupedTransactions).map(([date, transactions]: [string, TransactionWithAccount[]]) => (
                  <React.Fragment key={date}>
                    <tr className="bg-gray-50 border-t border-b">
                      <td colSpan={visibleDetailColumns.length} className="px-6 py-2 font-bold text-gray-700">
                        {formatDate(date)}
                      </td>
                    </tr>
                    {transactions.map((t) => (
                      <tr key={t.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => setModalItem(t)}>
                        {detailColumns.filter(c => visibleDetailColumns.includes(c.key)).map(col => (
                          <td key={col.key} className="px-6 py-4 whitespace-nowrap">{renderCell(t, col.key)}</td>
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
              totalItems={sortedTransactions.length}
            />
          </div>
        </div>

        <div className="md:hidden mt-4 space-y-3">
          {paginatedTransactions.map((t) => (
            <div
              key={t.id}
              className="bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setModalItem(t)}
            >
              <div className="flex justify-between items-start text-sm">
                <div className="pr-2">
                  <p className="font-semibold text-gray-800 leading-tight">{t.description}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{t.category}</p>
                </div>
                <p className={`font-bold whitespace-nowrap ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                  {t.type === TransactionType.INCOME ? '+' : '-'} {t.amount.toLocaleString('vi-VN')}
                </p>
              </div>
              <div className="flex justify-between items-center mt-1">
                <p className="text-xs text-gray-500">{t.account_name}</p>
                <p className="text-xs text-gray-400">{formatDate(t.transaction_date)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="md:hidden mt-4 flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
            totalItems={sortedTransactions.length}
            prevButtonContent={<ChevronLeftIcon />}
            nextButtonContent={<ChevronRightIcon />}
          />
        </div>
      </div>
    );
  };

  const renderListView = () => (
    <>
      <FilterBar
        onSearch={setSearchTerm}
        onTimeFilterChange={handleTimeFilterChange}
        pageTitle="Báo cáo thu chi theo đối tượng"
        backPath="/bao-cao"
        initialFilter={selectedTimeFilter}
      />
      <div className="bg-white p-6 rounded-lg shadow-sm mt-4">
        <div className="flex justify-end items-center mb-4">
          <div className="flex items-center space-x-2">
            <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 border-transparent rounded-md shadow-sm hover:bg-green-700">
              <ExportIcon />
              <span>Xuất file</span>
            </button>
            <button className="p-2 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50">
              <ColumnOptionsIcon />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          {partnerData.length === 0 ? (
            <div className="text-center py-10 text-gray-500">Không có dữ liệu thu chi theo đối tượng</div>
          ) : (
            partnerData.map((item) => (
              <div
                key={item.name}
                className="border-b border-gray-200 py-4 last:border-0 last:pb-0 cursor-pointer hover:bg-gray-50 -mx-6 px-6"
                onClick={() => handlePartnerClick(item)}
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-800">{item.name}</span>
                  <span className={`text-sm font-medium ${item.total >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {item.total >= 0 ? '+' : ''} {formatCurrency(item.total)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`${item.total >= 0 ? 'bg-green-500' : 'bg-red-500'} h-2 rounded-full`}
                    style={{ width: `${maxTotal > 0 ? (Math.abs(item.total) / maxTotal) * 100 : 0}%` }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );

  return (
    <>
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066cc]"></div>
        </div>
      ) : (
        <>
          {selectedPartner ? renderDetailView() : renderListView()}
        </>
      )}
      <DetailModal item={modalItem} onClose={() => setModalItem(null)} onEditClick={handleEditClick} onDeleteClick={handleDeleteClick} />
      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận Xóa Giao Dịch"
        message={`Bạn có chắc chắn muốn xóa giao dịch "${itemToDelete?.code}" không? Hành động này không thể hoàn tác.`}
      />
      <EditTransactionModal
        isOpen={isEditModalOpen}
        onClose={handleCloseEditModal}
        onSave={handleSaveTransaction}
        transaction={transactionToEdit}
      />
    </>
  );
};

// FIX: Changed export from ReportIncomeExpenseCategory to ReportIncomeExpensePartner.
export default ReportIncomeExpensePartner;
