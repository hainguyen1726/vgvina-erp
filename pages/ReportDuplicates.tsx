import React, { useState, useMemo, useEffect } from 'react';
import FilterBar from '../components/ui/FilterBar';
import { formatDate } from '../src/utils/dateUtils';
import { FinancialTransaction, TransactionType } from '../types';
import { ArrowUpIcon, ChevronDownIcon, ArrowsUpDownIcon, EditIcon, DeleteIcon, ChevronLeftIcon, ChevronRightIcon, ExportIcon } from '../components/icons/Icons';
import EditTransactionModal from '../components/modals/EditTransactionModal';
import Pagination from '../components/ui/Pagination';
import { transactionService } from '../src/services/transactionService';
import { useNotification } from '../contexts/NotificationContext';

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
const DetailModal = ({ item, onClose, onEditClick, onDeleteClick, showNotification }: { item: FinancialTransaction | null, onClose: () => void, onEditClick: (item: FinancialTransaction) => void, onDeleteClick: (item: FinancialTransaction) => void, showNotification: (message: string, type: 'success' | 'error' | 'warning' | 'info') => void }) => {
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (item) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [item, onClose]);
  if (!item) return null;

  const handleExport = () => {
    console.log("Exporting transaction to Excel:", JSON.stringify(item, null, 2));
    showNotification(`Đã xuất dữ liệu cho phiếu ${item.code} ra file Excel.`, 'success');
  };

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
            <div className="col-span-2"><strong className="font-medium text-gray-600">Số tiền:</strong> <span className={`font-semibold text-right tabular-nums inline-block ${item.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>{item.amount.toLocaleString('vi-VN')} ₫</span></div>
            <div><strong className="font-medium text-gray-600">Loại:</strong> <span className="text-gray-800">{item.type === TransactionType.INCOME ? 'Thu' : 'Chi'}</span></div>
            <div><strong className="font-medium text-gray-600">Hạng mục:</strong> <span className="text-gray-800">{item.category}</span></div>
            <div className="col-span-2"><strong className="font-medium text-gray-600">Đối tác:</strong> <span className="text-gray-800">{item.partner_name || 'N/A'}</span></div>
            <div className="col-span-2"><strong className="font-medium text-gray-600">Nhân viên:</strong> <span className="text-gray-800">{(item.employee_names || []).join(', ')}</span></div>
            <div className="col-span-2"><strong className="font-medium text-gray-600">Mô tả:</strong> <p className="text-gray-800 mt-1">{item.description}</p></div>
          </div>
        </div>
        <div className="border-t p-4 flex justify-between items-center bg-gray-50 rounded-b-lg">
          <div className="flex items-center gap-2">
            <button onClick={handleExport} className="flex items-center sm:gap-1.5 p-2.5 sm:px-4 sm:py-2 text-sm font-medium bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200">
              <ExportIcon className="w-4 h-4" />
              <span className="hidden sm:inline">Xuất file</span>
            </button>
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


const findDuplicates = (transactions: FinancialTransaction[]) => {
  const groups: Record<string, FinancialTransaction[]> = {};

  transactions.forEach(t => {
    // Create a unique key based on the specified criteria
    const key = [
      t.transaction_date,
      t.type,
      t.amount,
      t.description,
      t.partner_name || 'N/A'
    ].join('||');

    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(t);
  });

  return Object.values(groups).filter(group => group.length > 1);
};


const ReportDuplicates: React.FC = () => {
  const { showNotification } = useNotification();
  const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [timeFilter, setTimeFilter] = useState<{ filter: string; dates?: { from: Date; to: Date } }>({ filter: 'All time' });
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [modalItem, setModalItem] = useState<FinancialTransaction | null>(null);
  const [itemToDelete, setItemToDelete] = useState<FinancialTransaction | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<FinancialTransaction | null>(null);

  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(isMobile ? 8 : 10);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await transactionService.getTransactions();
      setTransactions(data);
    } catch (error) {
      console.error("Failed to fetch transactions", error);
      showNotification("Không thể tải danh sách giao dịch", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      if (mobile !== isMobile) {
        setIsMobile(mobile);
        setItemsPerPage(mobile ? 8 : 10);
        setCurrentPage(1);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);

  const handleTimeFilterChange = (filter: string, dates?: { from: Date; to: Date }) => {
    setTimeFilter({ filter, dates });
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const duplicateGroups = useMemo(() => {
    let filteredTxs = transactions;

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
      default: fromDate = null; toDate = null; break;
    }

    if (fromDate || toDate) {
      filteredTxs = filteredTxs.filter(t => {
        const transactionDate = new Date(t.transaction_date);
        if (fromDate && transactionDate < fromDate) return false;
        if (toDate && transactionDate > toDate) return false;
        return true;
      });
    }

    const groups = findDuplicates(filteredTxs);

    if (sortConfig) {
      return groups.map(group => {
        return [...group].sort((a, b) => {
          const aValue = a[sortConfig.key as keyof FinancialTransaction];
          const bValue = b[sortConfig.key as keyof FinancialTransaction];

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
          }
          if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        });
      });
    }

    return groups;
  }, [transactions, timeFilter, sortConfig]);

  const totalPages = Math.ceil(duplicateGroups.length / itemsPerPage);
  const paginatedGroups = useMemo(() => {
    return duplicateGroups.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
  }, [duplicateGroups, currentPage, itemsPerPage]);

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

  const columns = [
    { key: 'code', label: 'Mã phiếu' },
    { key: 'transaction_date', label: 'Ngày' },
    { key: 'partner_name', label: 'Đối tượng' },
    { key: 'amount', label: 'Số tiền' },
    { key: 'description', label: 'Mô tả' },
  ];

  return (
    <>
      <FilterBar onSearch={() => { }} onTimeFilterChange={handleTimeFilterChange} pageTitle="Báo cáo Trùng lặp" backPath="/bao-cao" />
      <div className="p-4 sm:p-6 bg-white rounded-lg shadow-sm">
        {loading ? (
          <div className="flex justify-center items-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-yellow-500"></div>
          </div>
        ) : (
          <>
            {duplicateGroups.length > 0 ? (
              <>
                {/* Desktop View */}
                <div className="hidden md:block space-y-8">
                  {paginatedGroups.map((group, index) => (
                    <div key={index} className="p-4 border border-yellow-300 rounded-lg bg-yellow-50">
                      <h3 className="text-lg font-semibold text-yellow-800 mb-3">
                        Nhóm trùng lặp #{((currentPage - 1) * itemsPerPage) + index + 1} - ({group.length} giao dịch)
                      </h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-700">
                          <thead className="text-xs text-gray-800 bg-yellow-100">
                            <tr>
                              {columns.map(col => {
                                const isNumeric = ['amount'].includes(col.key);
                                return (
                                  <th key={col.key} scope="col" className={`px-4 py-3 cursor-pointer ${isNumeric ? 'text-right' : 'text-left'}`} onClick={() => requestSort(col.key)}>
                                    <div className={`flex items-center min-w-0 ${isNumeric ? 'justify-end' : ''}`}>
                                      {col.label}
                                      <span className="ml-1.5 shrink-0">
                                        {sortConfig?.key === col.key ? (
                                          sortConfig.direction === 'ascending' ? <ArrowUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4 ml-0" />
                                        ) : (
                                          <ArrowsUpDownIcon className="h-4 w-4 text-gray-400" />
                                        )}
                                      </span>
                                    </div>
                                  </th>
                                );
                              })}
                            </tr>
                          </thead>
                          <tbody>
                            {group.map((t) => (
                              <tr key={t.id} className="bg-white border-b border-yellow-200 hover:bg-yellow-50/50 cursor-pointer" onClick={() => setModalItem(t)}>
                                <td className="px-4 py-3 font-medium text-gray-900">{t.code}</td>
                                <td className="px-4 py-3">{formatDate(t.transaction_date)}</td>
                                <td className="px-4 py-3">{t.partner_name || 'N/A'}</td>
                                <td className={`px-4 py-3 text-right font-medium tabular-nums ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                                  {t.type === TransactionType.INCOME ? '+' : '-'} {t.amount.toLocaleString('vi-VN')} ₫
                                </td>
                                <td className="px-4 py-3">{t.description}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Mobile View */}
                <div className="md:hidden space-y-4">
                  {paginatedGroups.map((group, index) => (
                    <div key={index} className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                      <h3 className="text-base font-semibold text-yellow-800 mb-2">
                        Nhóm trùng lặp #{((currentPage - 1) * itemsPerPage) + index + 1} ({group.length} giao dịch)
                      </h3>
                      <div className="space-y-2">
                        {group.map(t => (
                          <div key={t.id} onClick={() => setModalItem(t)} className="bg-white p-2.5 rounded-md border border-gray-200 cursor-pointer hover:bg-gray-50">
                            <div className="flex justify-between items-start text-sm">
                              <div className="pr-2">
                                <p className="font-semibold text-gray-800 leading-tight">{t.description}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{t.code}</p>
                              </div>
                              <p className={`font-bold whitespace-nowrap ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                                {t.type === TransactionType.INCOME ? '+' : '-'} {t.amount.toLocaleString('vi-VN')}
                              </p>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                              <p className="text-xs text-gray-500">{t.partner_name || 'Giao dịch nội bộ'}</p>
                              <p className="text-xs text-gray-400">{formatDate(t.transaction_date)}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination for Desktop */}
                <div className="hidden md:block mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                    totalItems={duplicateGroups.length}
                  />
                </div>
                {/* Pagination for Mobile */}
                <div className="md:hidden mt-6 flex justify-center">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                    totalItems={duplicateGroups.length}
                    prevButtonContent={<ChevronLeftIcon />}
                    nextButtonContent={<ChevronRightIcon />}
                  />
                </div>
              </>
            ) : (
              <p className="mt-2 text-gray-600 text-center py-10">Không tìm thấy giao dịch nào bị trùng lặp trong khoảng thời gian đã chọn.</p>
            )}
          </>
        )}
      </div>
      <DetailModal
        item={modalItem}
        onClose={() => setModalItem(null)}
        onEditClick={handleEditClick}
        onDeleteClick={handleDeleteClick}
        showNotification={showNotification}
      />
      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận Xóa Giao Dịch"
        message={`Bạn có chắc chắn muốn xóa giao dịch "${itemToDelete?.code}" không? Hành động này có thể giúp giải quyết vấn đề trùng lặp.`}
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

export default ReportDuplicates;