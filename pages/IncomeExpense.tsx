import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatDate } from '../src/utils/dateUtils';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import FilterBar from '../components/ui/FilterBar';
import SummaryCard from '../components/ui/SummaryCard';
import Pagination from '../components/ui/Pagination';
import { TableActions } from '../components/ui/TableActions';
import VoucherModal from '../components/modals/VoucherModal';
import EditTransactionModal from '../components/modals/EditTransactionModal';
import { ImportTransactionsModal } from '../components/modals/ImportTransactionsModal';
import { Page, FinancialTransaction, TransactionType, AdminAccount } from '../types';
import { transactionService } from '../src/services/transactionService';
import { accountService } from '../src/services/accountService';
import { excelUtils } from '../src/utils/excelUtils';
import PrintVoucherTemplate from '../components/print/PrintVoucherTemplate';
import { ThuChiIcon, PlusIcon, ExportIcon, ImportIcon, EditIcon, DeleteIcon, ArrowUpIcon, ChevronDownIcon, ArrowsUpDownIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/icons/Icons';
import { useNotification } from '../contexts/NotificationContext';
import { useBranch } from '../contexts/BranchContext';
import SearchableSelect from '../components/ui/SearchableSelect';
import { RecordHistoryModal } from '../components/modals/RecordHistoryModal';

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


// Modal Component for Transaction Details
export const IncomeExpenseDetailModal = ({ item, onClose, onEditClick, onDeleteClick }: { item: FinancialTransaction | null, onClose: () => void, onEditClick: (item: FinancialTransaction) => void, onDeleteClick: (item: FinancialTransaction) => void }) => {
  const { can, currentUser } = useBranch();
  const [showHistory, setShowHistory] = useState(false);
  const isAdmin = currentUser?.is_admin === true ||
    ['admin', 'Admin', 'Quản trị viên', 'Kế toán HO', 'Ban Lãnh đạo', 'Quản lý Chi nhánh'].includes(currentUser?.role || '');

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

  const handleExport = () => {
    try {
      excelUtils.exportIncomeExpenseVoucherStyled(item);
      showNotification(`Đã xuất file Excel cho phiếu ${item.code}`, 'success');
    } catch (err: any) {
      showNotification('Không thể xuất file Excel: ' + err.message, 'error');
    }
  };

  const getPrintData = () => {
    return {
      code: item.code,
      date: item.transaction_date,
      partner: { name: item.partner_name || 'N/A' },
      assignedUser: item.employee_names?.join(', ') || 'N/A',
      account: (item as any).account_name, // Assuming account_name exists on item or we need to look it up.
      notes: item.description,
      type: item.type,
      amount: item.amount,
      reason: item.description, // Use description as reason
      // category: item.category // Template doesn't show category explicitly for simple receipt but we can put it in notes or reason if needed
    };
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center border-b p-4">
            <h3 className="text-lg font-semibold text-gray-800">Chi tiết giao dịch</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
          </div>
          <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-3 gap-4 items-center text-sm">
              <p className="text-gray-500 col-span-1">Mã phiếu:</p>
              <p className="text-gray-800 font-medium col-span-2">{item.code}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center text-sm">
              <p className="text-gray-500 col-span-1">Ngày:</p>
              <p className="text-gray-800 col-span-2">{formatDate(item.transaction_date)}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center text-sm">
              <p className="text-gray-500 col-span-1">Số tiền:</p>
              <p className={`font-semibold col-span-2 text-right tabular-nums ${item.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>{item.amount.toLocaleString('vi-VN')} ₫</p>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center text-sm">
              <p className="text-gray-500 col-span-1">Loại:</p>
              <p className="text-gray-800 col-span-2">{item.type === TransactionType.INCOME ? 'Thu' : 'Chi'}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center text-sm">
              <p className="text-gray-500 col-span-1">Hạng mục:</p>
              <p className="text-gray-800 col-span-2">{item.category}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center text-sm">
              <p className="text-gray-500 col-span-1">Đối tác:</p>
              <p className="text-gray-800 col-span-2">{item.partner_name || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center text-sm">
              <p className="text-gray-500 col-span-1">Nhân viên:</p>
              <p className="text-gray-800 col-span-2 text-right">{item.employee_names?.join(', ') || 'N/A'}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <p className="text-gray-500 col-span-1 self-start">Mô tả:</p>
              <p className="text-gray-800 col-span-2">{item.description}</p>
            </div>
          </div>
          <div className="border-t p-4 flex justify-end items-center bg-gray-50 rounded-b-lg space-x-2">
            {isAdmin && (
              <button 
                onClick={() => setShowHistory(true)} 
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 mr-auto whitespace-nowrap"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Lịch sử
              </button>
            )}
            <button onClick={() => setIsPrinting(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3] whitespace-nowrap">
              In phiếu
            </button>
            <button onClick={handleExport} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200 whitespace-nowrap">
              <ExportIcon className="w-4 h-4" /> Xuất file
            </button>
            {onEditClick && can('financial_transactions', 'edit') && (
              <button onClick={() => onEditClick(item)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 whitespace-nowrap">
                <EditIcon className="w-4 h-4" /> Sửa
              </button>
            )}
            {onDeleteClick && can('financial_transactions', 'delete') && (
              <button onClick={() => onDeleteClick(item)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50 whitespace-nowrap">
                <DeleteIcon className="w-4 h-4" /> Xóa
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 whitespace-nowrap">Đóng</button>
          </div>
        </div>
      </div>

      {isPrinting && createPortal(
        <div id="print-section" className="hidden print:block bg-white p-0 m-0 z-[100]">
          <PrintVoucherTemplate voucherType="income-expense-voucher" data={getPrintData()} />
        </div>,
        document.body
      )}

      {showHistory && (
        <RecordHistoryModal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          tableName="vgvina_financial_transactions"
          recordId={String(item.id)}
          recordCode={item.code}
        />
      )}
    </>
  );
};

const allColumns = [
  { key: 'code', label: 'Mã phiếu', w: '8%' },
  { key: 'transaction_date', label: 'Thời gian', w: '10%' },
  { key: 'description', label: 'Mô tả', w: '16%' },
  { key: 'partner_name', label: 'Người nộp/nhận', w: '13%' },
  { key: 'facility_name', label: 'Chi nhánh', w: '9%' },
  { key: 'account_name', label: 'Tài khoản', w: '9%' },
  { key: 'type', label: 'Loại', w: '6%' },
  { key: 'employee_name', label: 'Nhân viên', w: '8%' },
  { key: 'category', label: 'Danh mục', w: '9%' },
  { key: 'amount', label: 'Giá trị', w: '12%' },
];

type TransactionWithAccount = FinancialTransaction & { account_name: string };

const IncomeExpense: React.FC = () => {
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(isMobile ? 8 : 30);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleColumns, setVisibleColumns] = useState(["code", "transaction_date", "description", "partner_name", "facility_name", "account_name", "type", "employee_name", "category", "amount"]);
  const [modalItem, setModalItem] = useState<FinancialTransaction | null>(null);
  const [itemToDelete, setItemToDelete] = useState<FinancialTransaction | null>(null);
  const { showNotification } = useNotification();
  const [voucherModal, setVoucherModal] = useState({ isOpen: false, type: '' });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [timeFilter, setTimeFilter] = useState<{ filter: string; dates?: { from: Date; to: Date } }>({ filter: 'Tháng này' });
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<FinancialTransaction | null>(null);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('');
  const [accounts, setAccounts] = useState<AdminAccount[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);

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

  const { selectedFacilityId, selectedBranch, currentUser, can } = useBranch();
  const location = useLocation();
  const navigate = useNavigate();
  const searchParams = new URLSearchParams(location.search);
  const typeFilter = searchParams.get('type');

  useEffect(() => {
    fetchTransactions();
  }, [selectedFacilityId, currentUser, timeFilter, typeFilter]);

  // Load accounts for filters on mount
  useEffect(() => {
    accountService.getAccounts()
      .then(data => {
        // Filter out TK KN and TK Nợ NCC only for VGVINA
        const isHkdSite = typeof window !== 'undefined' && (window.location.hostname === 'hkd.vgvina.com' || window.location.hostname.includes('hkd'));
        const cashAccounts = isHkdSite ? data : data.filter(acc => acc.name !== 'TK KN' && acc.name !== 'TK Nợ NCC');
        setAccounts(cashAccounts);
      })
      .catch(err => console.error("Error loading accounts:", err));
  }, []);

  // Load visible columns from localStorage on mount (or when user logs in)
  useEffect(() => {
    if (currentUser?.id) {
      const savedColumns = localStorage.getItem(`income_expense_columns_${currentUser.id}`);
      if (savedColumns) {
        try {
          setVisibleColumns(JSON.parse(savedColumns));
        } catch (e) {
          console.error("Failed to parse saved columns", e);
        }
      }
    }
  }, [currentUser?.id]);

  // Save visible columns to localStorage whenever they change
  useEffect(() => {
    if (currentUser?.id) {
      localStorage.setItem(`income_expense_columns_${currentUser.id}`, JSON.stringify(visibleColumns));
    }
  }, [visibleColumns, currentUser?.id]);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      // If user is not admin, filter by their own ID. 
      // If no currentUser yet (loading), don't fetch or fetch empty.
      const isAdmin = currentUser?.is_admin === true ||
        ['admin', 'Admin', 'Quản trị viên', 'Kế toán HO', 'Ban Lãnh đạo', 'Quản lý Chi nhánh'].includes(currentUser?.role || '');
      const employeeIdFilter = !isAdmin ? currentUser?.id : undefined;

      // Calculate start and end dates based on timeFilter to query database efficiently
      const now = new Date();
      let fromDate: string | undefined;
      let toDate: string | undefined;

      switch (timeFilter.filter) {
        case 'Hôm nay':
          fromDate = toDate = now.toISOString().split('T')[0];
          break;
        case 'Hôm qua':
          const yesterday = new Date();
          yesterday.setDate(yesterday.getDate() - 1);
          fromDate = toDate = yesterday.toISOString().split('T')[0];
          break;
        case 'Tuần này':
          const day = now.getDay();
          const diff = now.getDate() - (day === 0 ? 6 : day - 1);
          fromDate = new Date(now.setDate(diff)).toISOString().split('T')[0];
          toDate = new Date().toISOString().split('T')[0];
          break;
        case 'Tháng này':
          fromDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
          toDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
          break;
        case 'Tháng trước':
          fromDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
          toDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
          break;
        case 'Quý này':
          const quarter = Math.floor(now.getMonth() / 3);
          fromDate = new Date(now.getFullYear(), quarter * 3, 1).toISOString().split('T')[0];
          toDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0).toISOString().split('T')[0];
          break;
        case 'Quý trước':
          const lastQuarter = Math.floor(now.getMonth() / 3) - 1;
          fromDate = new Date(now.getFullYear(), lastQuarter * 3, 1).toISOString().split('T')[0];
          toDate = new Date(now.getFullYear(), (lastQuarter + 1) * 3, 0).toISOString().split('T')[0];
          break;
        case 'Năm nay':
          fromDate = new Date(now.getFullYear(), 0, 1).toISOString().split('T')[0];
          toDate = new Date(now.getFullYear(), 11, 31).toISOString().split('T')[0];
          break;
        case 'Năm trước':
          fromDate = new Date(now.getFullYear() - 1, 0, 1).toISOString().split('T')[0];
          toDate = new Date(now.getFullYear() - 1, 11, 31).toISOString().split('T')[0];
          break;
        case 'Tùy chọn':
          if (timeFilter.dates) {
            fromDate = timeFilter.dates.from.toISOString().split('T')[0];
            toDate = timeFilter.dates.to.toISOString().split('T')[0];
          }
          break;
      }

      const data = await transactionService.getTransactions(
        typeFilter || 'All',
        undefined,
        selectedFacilityId || undefined,
        employeeIdFilter,
        undefined,
        fromDate,
        toDate
      );
      const isHkdSite = typeof window !== 'undefined' && (window.location.hostname === 'hkd.vgvina.com' || window.location.hostname.includes('hkd'));
      const filteredData = isHkdSite ? data : data.filter(t => t.account_name !== 'TK KN' && t.account_name !== 'TK Nợ NCC');
      setTransactions(filteredData);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
    } finally {
      setLoading(false);
    }
  };

  // Consolidated re-fetch effects into main trigger

  const handleOpenVoucherModal = (type: string) => {
    setVoucherModal({ isOpen: true, type });
  };

  const handleCloseVoucherModal = () => {
    setVoucherModal({ isOpen: false, type: '' });
  };

  const handleTimeFilterChange = (filter: string, dates?: { from: Date; to: Date }) => {
    setTimeFilter({ filter, dates });
    setCurrentPage(1);
  };

  const handleTypeChange = (val: string) => {
    if (val) {
      navigate(`/thu-chi?type=${val}`);
    } else {
      navigate('/thu-chi');
    }
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedTransactions = useMemo(() => {
    // Account name mapping is now done in service, but we might need accountService for filters later. 
    // The transaction object from service should already have account_name if we updated it.

    // In types.ts, FinancialTransaction interface might need 'account_name'.
    // Or we extend it here.
    let txns = transactions; // Assuming transactions already have account_name mapped from service

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
      txns = txns.filter(t => {
        const transactionDate = new Date(t.transaction_date);
        if (fromDate && transactionDate < fromDate) return false;
        if (toDate && transactionDate > toDate) return false;
        return true;
      });
    }

    // Search filtering
    txns = txns.filter(t =>
      t.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t as any).account_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.partner_name && t.partner_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    // Type filtering
    if (typeFilter) {
      if (Object.values(TransactionType).includes(typeFilter as TransactionType)) {
        txns = txns.filter(t => t.type === typeFilter);
      }
    }

    // Account filtering
    if (selectedAccountId) {
      txns = txns.filter(t => String(t.accountId) === String(selectedAccountId));
    }

    // Sorting
    if (sortConfig) {
      txns.sort((a, b) => {
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
    }

    return txns;
  }, [transactions, searchTerm, typeFilter, sortConfig, timeFilter, selectedAccountId]);

  const totalPages = Math.ceil(sortedTransactions.length / itemsPerPage);
  const paginatedTransactions: FinancialTransaction[] = sortedTransactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const groupedTransactions = paginatedTransactions.reduce((acc, transaction) => {
    const date = transaction.transaction_date;
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(transaction);
    return acc;
  }, {} as Record<string, FinancialTransaction[]>);

  const handleEditClick = (item: FinancialTransaction) => {
    setTransactionToEdit(item);
    setIsEditModalOpen(true);
    setModalItem(null);
  };

  const handleDeleteClick = (item: FinancialTransaction) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = () => {
    if (itemToDelete) {
      // setTransactions(prev => prev.filter(t => t.id !== itemToDelete.id)); 
      transactionService.deleteTransaction(itemToDelete.id).then(() => {
        console.log("Deleted transaction:", itemToDelete.id);
        fetchTransactions();
      }).catch(err => showNotification("Lỗi khi xóa: " + err.message, 'error'));
    }
    setItemToDelete(null);
    setModalItem(null);
  };

  const handleSaveTransaction = (updatedTransaction: FinancialTransaction) => {
    // setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
    transactionService.updateTransaction(updatedTransaction.id, updatedTransaction).then(() => {
      setIsEditModalOpen(false);
      setTransactionToEdit(null);
      showNotification(`Đã lưu giao dịch: ${updatedTransaction.code}`, 'success');
      fetchTransactions();
    }).catch(err => showNotification("Lỗi khi lưu: " + err.message, 'error'));
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setTransactionToEdit(null);
  };

  const handleExportExcel = () => {
    if (sortedTransactions.length === 0) {
      showNotification('Không có dữ liệu để xuất.', 'info');
      return;
    }
    const exportData = sortedTransactions.map((t, idx) => ({
      'STT': idx + 1,
      'Mã phiếu': t.code,
      'Thời gian': formatDate(t.transaction_date),
      'Loại': t.type === TransactionType.INCOME ? 'Thu' : 'Chi',
      'Mô tả': t.description || '',
      'Người nộp/nhận': t.partner_name || '',
      'Chi nhánh': (t as any).facility_name || '',
      'Tài khoản': (t as any).account_name || '',
      'Nhân viên': t.employee_names?.join(', ') || '',
      'Danh mục': (t as any).category || '',
      'Giá trị': t.type === TransactionType.INCOME ? t.amount : -t.amount,
    }));
    const now = new Date();
    const ts = `${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}_${now.getHours().toString().padStart(2, '0')}${now.getMinutes().toString().padStart(2, '0')}`;
    const branchSlug = (selectedBranch || 'TatCa').replace(/\s+/g, '');
    excelUtils.exportFinancialTransactionsStyled(exportData, `ThuChi_${branchSlug}_${ts}`, selectedBranch || 'Tất cả');
    showNotification(`Đã xuất ${exportData.length} giao dịch ra file Excel.`, 'success');
  };

  const renderCell = (transaction: FinancialTransaction, columnKey: string) => {
    switch (columnKey) {
      case 'code':
        return <div className="font-medium text-gray-900 truncate" title={transaction.code}>{transaction.code}</div>;
      case 'amount':
        const amountStr = `${transaction.type === TransactionType.INCOME ? '+' : '-'} ${transaction.amount.toLocaleString('vi-VN')} ₫`;
        return (
          <div className={`font-medium truncate tabular-nums text-right ${transaction.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`} title={amountStr}>
            {amountStr}
          </div>
        );
      case 'type':
        return <div className="truncate">{transaction.type === TransactionType.INCOME ? 'Thu' : 'Chi'}</div>;
      case 'partner_name':
        const partner = transaction.partner_name || 'N/A';
        return <div className="truncate" title={partner}>{partner}</div>;
      case 'transaction_date':
        return <div className="truncate">{formatDate(transaction.transaction_date)}</div>;
      case 'account_name':
        const account = (transaction as any).account_name || 'N/A';
        return <div className="truncate" title={account}>{account}</div>;
      case 'employee_name':
        const emp = transaction.employee_names?.join(', ') || 'N/A';
        return <div className="truncate" title={emp}>{emp}</div>;
      case 'description':
        const desc = transaction.description || '';
        return <div className="truncate" title={desc}>{desc}</div>;
      case 'category':
        const cat = typeof (transaction as any)[columnKey] === 'string' ? (transaction as any)[columnKey] : 'N/A';
        return <div className="truncate" title={cat}>{cat}</div>;
      case 'facility_name':
        const fac = typeof (transaction as any)[columnKey] === 'string' ? (transaction as any)[columnKey] : 'N/A';
        return <div className="truncate" title={fac}>{fac}</div>;
      default:
        const value = (transaction as any)[columnKey];
        const valStr = typeof value === 'string' || typeof value === 'number' ? String(value) : 'N/A';
        return <div className="truncate" title={valStr}>{valStr}</div>;
    }
  };

  const { totalIncome, totalExpense, netAmount } = useMemo(() => {
    let txns = transactions;

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
      txns = txns.filter(t => {
        const transactionDate = new Date(t.transaction_date);
        if (fromDate && transactionDate < fromDate) return false;
        if (toDate && transactionDate > toDate) return false;
        return true;
      });
    }

    // Account filtering
    if (selectedAccountId) {
      txns = txns.filter(t => String(t.accountId) === String(selectedAccountId));
    }

    const income = txns
      .filter(t => t.type === TransactionType.INCOME)
      .reduce((sum, t) => sum + t.amount, 0);

    const expense = txns
      .filter(t => t.type === TransactionType.EXPENSE)
      .reduce((sum, t) => sum + t.amount, 0);

    const net = income - expense;

    return { totalIncome: income, totalExpense: expense, netAmount: net };
  }, [transactions, timeFilter, selectedAccountId]);

  const formatLargeCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} Tỷ`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} Tr`;
    }
    return `${value.toLocaleString('vi-VN')} ₫`;
  };

  return (
    <>
      <FilterBar onSearch={setSearchTerm} onTimeFilterChange={handleTimeFilterChange} pageTitle={Page.ThuChi} initialFilter="Tháng này" />

      {/* Desktop Summary Cards */}
      <div className="hidden md:flex space-x-6">
        <SummaryCard title="Tổng thu" value={formatLargeCurrency(totalIncome)} icon={<ThuChiIcon />} colorClass="bg-green-100 text-green-600" linkTo="/thu-chi?type=INCOME" />
        <SummaryCard title="Tổng chi" value={formatLargeCurrency(totalExpense)} icon={<ThuChiIcon />} colorClass="bg-red-100 text-red-600" linkTo="/thu-chi?type=EXPENSE" />
        <SummaryCard title="Chênh lệch" value={(netAmount > 0 ? '+' : '') + formatLargeCurrency(netAmount)} icon={<ThuChiIcon />} colorClass="bg-blue-100 text-blue-600" linkTo="/thu-chi" />
      </div>

      {/* Mobile Summary Cards */}
      <div className="md:hidden grid grid-cols-2 gap-4">
        <Link to="/thu-chi?type=INCOME" className="block bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-gray-500 font-medium">Tổng thu</p>
          <p className="text-base font-bold text-green-600 mt-1">{formatLargeCurrency(totalIncome)}</p>
        </Link>
        <Link to="/thu-chi?type=EXPENSE" className="block bg-white p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow">
          <p className="text-xs text-gray-500 font-medium">Tổng chi</p>
          <p className="text-base font-bold text-red-600 mt-1">{formatLargeCurrency(totalExpense)}</p>
        </Link>
      </div>

      <TableActions
        onSearch={setSearchTerm}
        searchPlaceholder="Tìm theo mã phiếu, đối tác..."
        filterActions={
          <div className="flex flex-wrap items-center gap-2">
            <div className="w-28 sm:w-36">
              <SearchableSelect
                options={accounts.map(acc => ({ id: acc.id, name: acc.name }))}
                value={selectedAccountId}
                onChange={(val) => {
                  setSelectedAccountId(val);
                  setCurrentPage(1);
                }}
                placeholder="Tài khoản"
              />
            </div>
            <div className="w-24 sm:w-32">
              <SearchableSelect
                options={[
                  { id: 'INCOME', name: 'Thu' },
                  { id: 'EXPENSE', name: 'Chi' }
                ]}
                value={typeFilter || ''}
                onChange={(val) => {
                  handleTypeChange(val);
                  setCurrentPage(1);
                }}
                placeholder="Loại"
              />
            </div>
          </div>
        }
        primaryActions={[
          {
            label: 'Tạo phiếu',
            icon: <PlusIcon />,
            onClick: () => { }, // Handled by dropdown
            subActions: [
              ...(can('financial_transactions', 'create') ? [{ label: 'Phiếu thu/chi', onClick: () => handleOpenVoucherModal('income-expense-voucher') }] : []),
              ...(can('purchase_orders', 'create') ? [{ label: 'Phiếu nhập hàng', onClick: () => handleOpenVoucherModal('purchase-order') }] : []),
              ...(can('sales_orders', 'create') ? [{ label: 'Phiếu xuất hàng', onClick: () => handleOpenVoucherModal('delivery-note') }] : []),
              ...(can('debt', 'edit') ? [{ label: 'Thông báo công nợ khách', onClick: () => handleOpenVoucherModal('debt-notice') }] : []),
              ...(can('inventory', 'delete') ? [{ label: 'Phiếu thanh lý', onClick: () => handleOpenVoucherModal('liquidation') }] : []),
            ],
          },
          ...(can('financial_transactions', 'create') ? [{ label: 'Nhập file', icon: <ImportIcon />, onClick: () => setIsImportModalOpen(true), variant: 'secondary' as any }] : []),
          ...(can('reports', 'export') ? [{ label: 'Xuất file', icon: <ExportIcon />, onClick: handleExportExcel, variant: 'secondary' as any }] : []),
        ]}
        columns={allColumns}
        visibleColumns={visibleColumns}
        onVisibleColumnsChange={setVisibleColumns}
      />

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 table-fixed">
            <thead className="text-xs text-gray-700 bg-gray-50">
              <tr>
                {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => (
                  <th key={col.key} scope="col" style={{ width: col.w }} className={`px-2 sm:px-3 py-3 cursor-pointer truncate ${col.key === 'amount' ? 'text-right' : 'text-left'}`} title={col.label} onClick={() => requestSort(col.key)}>
                    <div className={`flex items-center min-w-0 ${col.key === 'amount' ? 'justify-end' : ''}`}>
                      <span className="truncate">{col.label}</span>
                      <span className="ml-1 shrink-0">
                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === 'ascending' ? <ArrowUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4 ml-0" />
                        ) : (
                          <ArrowsUpDownIcon className="h-4 w-4 text-gray-300" />
                        )}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(groupedTransactions).map(([date, transactions]) => (
                <React.Fragment key={date}>
                  <tr className="bg-gray-50 border-t border-b">
                    <td colSpan={visibleColumns.length} className="px-2 sm:px-3 py-2 font-bold text-gray-700">
                      {formatDate(date)}
                    </td>
                  </tr>
                  {transactions.map((t) => (
                    <tr key={t.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => setModalItem(t)}>
                      {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => (
                        <td key={col.key} className={`px-2 sm:px-3 py-4 truncate ${col.key === 'amount' ? 'text-right' : 'text-left'}`}>
                          {renderCell(t, col.key)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        <div className="hidden md:block p-4">
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

      {/* Mobile Card List */}
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
              <p className={`font-bold whitespace-nowrap tabular-nums mt-0.5 text-right ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                {t.type === TransactionType.INCOME ? '+' : '-'} {t.amount.toLocaleString('vi-VN')} ₫
              </p>
            </div>
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">{t.partner_name || 'Giao dịch nội bộ'}</p>
              <p className="text-xs text-gray-400">{formatDate(t.transaction_date)}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="md:hidden mt-4">
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

      <IncomeExpenseDetailModal item={modalItem} onClose={() => setModalItem(null)} onEditClick={handleEditClick} onDeleteClick={handleDeleteClick} />
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
      <VoucherModal
        isOpen={voucherModal.isOpen}
        voucherType={voucherModal.type}
        onClose={handleCloseVoucherModal}
      />
      <ImportTransactionsModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={fetchTransactions}
      />
    </>
  );
};

export default IncomeExpense;