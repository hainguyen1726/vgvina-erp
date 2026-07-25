import React, { useState, useMemo, useEffect } from 'react';
import { formatDate } from '../src/utils/dateUtils';
import { useParams, Link } from 'react-router-dom';
import { FinancialTransaction, TransactionType } from '../types';
import { accountService } from '../src/services/accountService';
import { transactionService } from '../src/services/transactionService';
import { AdminAccount } from '../types';
import { ChevronLeftIcon, EditIcon, DeleteIcon, ExportIcon, SearchIcon, ArrowUpSolidIcon, ArrowDownSolidIcon, ChevronRightIcon } from '../components/icons/Icons';
import EditTransactionModal from '../components/modals/EditTransactionModal';
import Pagination from '../components/ui/Pagination';
import { useNotification } from '../contexts/NotificationContext';
import ConfirmationModal from '../components/modals/ConfirmationModal';

type AccountType = 'Tiền mặt' | 'Ngân hàng' | 'Thẻ tín dụng';



// Modal Component for Transaction Details
const DetailModal = ({ item, onClose, onEditClick, onDeleteClick, showNotification }: { item: FinancialTransaction | null, onClose: () => void, onEditClick: (item: FinancialTransaction) => void, onDeleteClick: (item: FinancialTransaction) => void, showNotification: (msg: string, type: 'success' | 'error' | 'info' | 'warning') => void }) => {
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (item) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [item, onClose]);
    if (!item) return null;

    const handleExport = () => {
        console.log("Exporting transaction to Excel:", JSON.stringify(item, null, 2));
        showNotification(`Đã xuất dữ liệu cho phiếu ${item.code} ra console.`, 'info');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
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
                        <p className={`font-semibold col-span-2 text-right ${item.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>{item.amount.toLocaleString('vi-VN')} ₫</p>
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
                        <p className="text-gray-800 col-span-2 text-right">{(item.employee_names || []).join(', ')}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                        <p className="text-gray-500 col-span-1 self-start">Mô tả:</p>
                        <p className="text-gray-800 col-span-2">{item.description}</p>
                    </div>
                </div>
                <div className="border-t p-4 flex justify-end items-center bg-gray-50 rounded-b-lg space-x-2">
                    <button onClick={handleExport} className="flex items-center sm:gap-1.5 p-2.5 sm:px-4 sm:py-2 text-sm font-medium bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200">
                        <ExportIcon className="w-4 h-4" />
                        <span className="hidden sm:inline">Xuất file</span>
                    </button>
                    <button onClick={() => onEditClick(item)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50">
                        <EditIcon className="w-4 h-4" /> Sửa
                    </button>
                    <button onClick={() => onDeleteClick(item)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                        <DeleteIcon className="w-4 h-4" /> Xóa
                    </button>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Đóng</button>
                </div>
            </div>
        </div>
    );
};

// Edit Account Modal
const EditAccountModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (account: AdminAccount) => void; accountData: AdminAccount | null; }> = ({ isOpen, onClose, onSave, accountData }) => {
    const [showConfirmClose, setShowConfirmClose] = useState(false);

    const handleRequestClose = () => {
        setShowConfirmClose(true);
    };

    const handleConfirmClose = () => {
        setShowConfirmClose(false);
        onClose();
    };

    const handleCancelClose = () => {
        setShowConfirmClose(false);
    };

    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (!showConfirmClose) handleRequestClose();
            }
        };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose, showConfirmClose]);
    const [formData, setFormData] = useState<(Omit<AdminAccount, 'balance' | 'initial_balance'> & { balance: number | string; initial_balance?: number | string }) | null>(null);

    useEffect(() => {
        setFormData(accountData);
    }, [accountData]);

    if (!isOpen || !formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            onSave({
                ...formData,
                balance: parseFloat(String(formData.balance)) || 0,
                initial_balance: formData.initial_balance !== undefined && formData.initial_balance !== '' ? parseFloat(String(formData.initial_balance)) : undefined,
            });
        }
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={handleRequestClose}>
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                        <h3 className="text-lg font-bold text-gray-900">Chỉnh sửa tài khoản</h3>
                        <button type="button" onClick={handleRequestClose} className="text-gray-400 hover:text-gray-500">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tên tài khoản</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Loại tài khoản</label>
                            <select name="type" value={formData.type} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                                <option value="Ngân hàng">Ngân hàng</option>
                                <option value="Tiền mặt">Tiền mặt</option>
                                <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Số dư ban đầu (Đầu kỳ)</label>
                            <input type="number" name="initial_balance" value={formData.initial_balance ?? ''} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Số dư trước các giao dịch" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Số dư hiện tại</label>
                            <input type="number" name="balance" value={formData.balance} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                            <textarea name="notes" value={formData.notes || ''} onChange={handleChange} rows={3} className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                        </div>
                        {formData.type !== 'Tiền mặt' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ngân hàng</label>
                                    <input type="text" name="bank_name" value={formData.bank_name || ''} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Ví dụ: Vietcombank" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Số tài khoản</label>
                                    <input type="text" name="account_number" value={formData.account_number || ''} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Chủ tài khoản</label>
                                    <input type="text" name="account_holder" value={formData.account_holder || ''} onChange={handleChange} className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg border-t">
                        <button type="button" onClick={handleRequestClose} className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium text-gray-700">Hủy</button>
                        <button type="submit" className="px-4 py-2 text-sm text-white bg-[#0066cc] rounded-md hover:bg-[#0052a3] font-medium shadow-sm">Lưu thay đổi</button>
                    </div>
                </form>
            </div>

            <ConfirmationModal
                isOpen={showConfirmClose}
                onClose={handleCancelClose}
                onConfirm={handleConfirmClose}
                title="Xác nhận thoát"
                message="Bạn có thay đổi chưa lưu. Bạn có chắc chắn muốn thoát không?"
                confirmText="Thoát"
                cancelText="Tiếp tục chỉnh sửa"
            />
        </>
    );
};


export const AdminAccountDetail: React.FC = () => {
    const { showNotification } = useNotification();
    const { accountId } = useParams<{ accountId: string }>();
    const [transactionsData, setTransactionsData] = useState<FinancialTransaction[]>([]);
    const [account, setAccount] = useState<AdminAccount | null>(null);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterOption, setFilterOption] = useState('all'); // 'all', 'INCOME', 'EXPENSE'
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(isMobile ? 8 : 30);

    const [modalItem, setModalItem] = useState<FinancialTransaction | null>(null);
    const [itemToDelete, setItemToDelete] = useState<FinancialTransaction | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<FinancialTransaction | null>(null);

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

    useEffect(() => {
        const fetchData = async () => {
            if (!accountId) return;
            try {
                setLoading(true);
                // Fetch account details (we need a getAccountById or just filter from all)
                const accounts = await accountService.getAccounts();
                const foundAccount = accounts.find(a => a.id === accountId);
                setAccount(foundAccount || null);

                // Fetch transactions for this account
                const txns = await transactionService.getTransactions('All', accountId);
                setTransactionsData(txns);
            } catch (error) {
                console.error("Error fetching account detail", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [accountId]);

    // const account = useMemo(() => adminAccounts.find(acc => acc.id === accountId), [accountId]); // Replaced by state

    const { totalIn, totalOut, transactions, currentBalance, initialBalance, netChange } = useMemo(() => {
        if (!accountId || !account) return { totalIn: 0, totalOut: 0, transactions: [], currentBalance: 0, initialBalance: 0, netChange: 0 };

        const allAccountTransactions = transactionsData.filter(t => t.accountId === accountId);

        const totalIn = allAccountTransactions.reduce((sum, t) => t.type === TransactionType.INCOME ? sum + t.amount : sum, 0);
        const totalOut = allAccountTransactions.reduce((sum, t) => t.type === TransactionType.EXPENSE ? sum + t.amount : sum, 0);

        const netChange = totalIn - totalOut;
        const initialBalance = account.initial_balance !== undefined && account.initial_balance !== null
            ? account.initial_balance
            : account.balance - netChange;

        // Số dư thực tế = Số dư đầu kỳ + Tổng vào - Tổng ra
        const currentBalance = initialBalance + totalIn - totalOut;

        let filteredTransactions = [...allAccountTransactions];

        if (filterOption !== 'all') {
            filteredTransactions = filteredTransactions.filter(t => t.type === filterOption);
        }

        if (searchTerm) {
            const lowercasedFilter = searchTerm.toLowerCase();
            filteredTransactions = filteredTransactions.filter(t =>
                t.description.toLowerCase().includes(lowercasedFilter) ||
                (t.partner_name && t.partner_name.toLowerCase().includes(lowercasedFilter))
            );
        }

        filteredTransactions.sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime());

        return { totalIn, totalOut, transactions: filteredTransactions, currentBalance, initialBalance, netChange };
    }, [accountId, account, searchTerm, filterOption, transactionsData]);

    const totalPages = Math.ceil(transactions.length / itemsPerPage);
    const paginatedTransactions = transactions.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const groupedTransactions = paginatedTransactions.reduce((acc, transaction) => {
        const date = transaction.transaction_date;
        if (!acc[date]) acc[date] = [];
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
        setModalItem(null);
    };

    const handleConfirmTransactionDelete = () => {
        if (itemToDelete) {
            transactionService.deleteTransaction(itemToDelete.id).then(() => {
                setTransactionsData(prev => prev.filter(t => t.id !== itemToDelete.id));
                console.log("Deleted transaction:", itemToDelete.id);
            });
        }
        setItemToDelete(null);
    };

    const handleSaveTransaction = (updatedTransaction: FinancialTransaction) => {
        transactionService.updateTransaction(updatedTransaction.id, updatedTransaction).then(() => {
            setTransactionsData(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
            setIsEditModalOpen(false);
            setTransactionToEdit(null);
            showNotification(`Đã lưu giao dịch: ${updatedTransaction.code}`, 'success');
        });
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setTransactionToEdit(null);
    };

    const handleSaveAccountEdit = async (updatedAccount: AdminAccount) => {
        try {
            const initBal = updatedAccount.initial_balance !== undefined && updatedAccount.initial_balance !== null && !isNaN(Number(updatedAccount.initial_balance))
                ? Number(updatedAccount.initial_balance)
                : 0;
            const computedBalance = initBal + netChange;
            const finalAccount: AdminAccount = {
                ...updatedAccount,
                initial_balance: initBal,
                balance: computedBalance
            };
            await accountService.updateAccount(finalAccount.id, finalAccount);
            setAccount(finalAccount);
            setIsEditModalOpen(false);
            showNotification(`Đã cập nhật số dư đầu kỳ thành công! Số dư thực tế: ${computedBalance.toLocaleString('vi-VN')} ₫`, 'success');
        } catch (error: any) {
            console.error("Failed to update account", error);
            showNotification("Lỗi khi cập nhật tài khoản: " + (error?.message || 'Vui lòng thử lại.'), 'error');
        }
    };

    const handleRecalculateBalance = async () => {
        if (!accountId) return;
        try {
            const newBal = await accountService.recalculateAccountBalance(accountId);
            setAccount(prev => prev ? { ...prev, balance: newBal } : null);
            showNotification(`Đã đồng bộ lại số dư chuẩn: ${newBal.toLocaleString('vi-VN')} ₫`, 'success');
        } catch (error) {
            console.error("Failed to recalculate balance", error);
            showNotification("Lỗi khi đồng bộ lại số dư.", 'error');
        }
    };

    const handleConfirmAccountDelete = async () => {
        if (!account) return;
        try {
            await accountService.deleteAccount(account.id);
            setIsDeleteModalOpen(false);
            showNotification(`Đã xóa tài khoản: ${account.name}.`, 'success');
            // Redirect after delete
            window.location.href = '/admin/tai-khoan';
        } catch (error) {
            console.error("Failed to delete account", error);
            showNotification("Lỗi khi xóa tài khoản.", 'error');
        }
    };

    if (!account) {
        return (
            <div className="p-4">
                <Link to="/admin/tai-khoan" className="flex items-center text-sm font-medium text-blue-600 hover:underline mb-4">
                    <ChevronLeftIcon /> Quay lại danh sách
                </Link>
                <p>Không tìm thấy tài khoản.</p>
            </div>
        );
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm p-4 mb-4">
                <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center">
                        <Link to="/admin/tai-khoan" className="p-2 rounded-full hover:bg-gray-100 mr-2 -ml-2">
                            <ChevronLeftIcon />
                        </Link>
                        <div>
                            <h1 className="text-xl font-bold text-gray-800">{account.name}</h1>
                            <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">{account.type}</span>
                        </div>
                    </div>
                    <div className="flex items-center space-x-2 text-gray-500">
                        <button onClick={handleRecalculateBalance} className="px-2.5 py-1 text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-md transition-colors flex items-center gap-1" title="Đồng bộ lại số dư theo giao dịch">
                            🔄 Đồng bộ số dư
                        </button>
                        <button onClick={() => setIsEditModalOpen(true)} className="p-1.5 rounded-full hover:bg-blue-100 hover:text-blue-600" title="Chỉnh sửa tài khoản"><EditIcon /></button>
                        <button onClick={() => setIsDeleteModalOpen(true)} className="p-1.5 rounded-full hover:bg-red-100 hover:text-red-600" title="Xóa tài khoản"><DeleteIcon /></button>
                    </div>
                </div>
                <p className="text-sm font-medium text-gray-500">Số dư thực tế hiện tại (Đầu kỳ + Vào - Ra)</p>
                <p className={`text-2xl font-bold mt-1 ${currentBalance >= 0 ? 'text-[#0066cc]' : 'text-red-600'}`}>{currentBalance.toLocaleString('vi-VN')} đ</p>
            </div>


            <div className="bg-white rounded-xl shadow-sm p-4">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-lg font-bold text-gray-800">Lịch sử giao dịch</h2>
                    <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-white bg-green-600 border-transparent rounded-md shadow-sm hover:bg-green-700">
                        <ExportIcon />
                        <span className="hidden sm:inline">Xuất Excel ({transactions.length})</span>
                    </button>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <p className="text-xs text-blue-800 font-medium">Số dư đầu kỳ</p>
                        <p className="text-lg font-bold text-blue-900 mt-1">{initialBalance.toLocaleString('vi-VN')} ₫</p>
                    </div>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                        <p className="text-xs text-green-800 font-medium">Tổng tiền vào (+)</p>
                        <p className="text-lg font-bold text-green-900 mt-1">{totalIn.toLocaleString('vi-VN')} ₫</p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-xs text-red-800 font-medium">Tổng tiền ra (-)</p>
                        <p className="text-lg font-bold text-red-900 mt-1">{totalOut.toLocaleString('vi-VN')} ₫</p>
                    </div>
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                        <p className="text-xs text-purple-800 font-medium">Biến động thuần (Vào - Ra)</p>
                        <p className={`text-lg font-bold mt-1 ${netChange >= 0 ? 'text-purple-900' : 'text-red-700'}`}>
                            {netChange >= 0 ? '+' : ''}{netChange.toLocaleString('vi-VN')} ₫
                        </p>
                    </div>
                </div>

                <div className="bg-blue-50/70 border border-blue-200/80 rounded-lg p-2.5 mb-4 text-xs text-blue-900 flex items-center justify-between">
                    <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-blue-800">💡 Công thức đối soát:</span>
                        <span>Số dư hiện tại ({currentBalance.toLocaleString('vi-VN')} ₫)</span>
                        <span>=</span>
                        <span className="font-medium text-blue-900">Đầu kỳ ({initialBalance.toLocaleString('vi-VN')} ₫)</span>
                        <span>+</span>
                        <span className="font-medium text-green-700">Vào ({totalIn.toLocaleString('vi-VN')} ₫)</span>
                        <span>-</span>
                        <span className="font-medium text-red-700">Ra ({totalOut.toLocaleString('vi-VN')} ₫)</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    <div className="relative flex-grow">
                        <input
                            type="text"
                            placeholder="Tìm theo mô tả, đối tác..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon /></div>
                    </div>
                    <div className="flex items-stretch bg-gray-100 rounded-md p-0.5">
                        <button onClick={() => setFilterOption('all')} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterOption === 'all' ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600'}`}>Tất cả</button>
                        <button onClick={() => setFilterOption(TransactionType.INCOME)} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterOption === TransactionType.INCOME ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600'}`}>Tiền vào</button>
                        <button onClick={() => setFilterOption(TransactionType.EXPENSE)} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${filterOption === TransactionType.EXPENSE ? 'bg-white text-gray-800 shadow-sm' : 'text-gray-600'}`}>Tiền ra</button>
                    </div>
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-sm">
                        <tbody>
                            {/* FIX: Replaced Object.entries with Object.keys to avoid potential TypeScript type inference issues. */}
                            {Object.keys(groupedTransactions).map((date) => {
                                const transactionsOnDate = groupedTransactions[date];
                                return (
                                    <React.Fragment key={date}>
                                        <tr className="bg-gray-50">
                                            <td colSpan={3} className="px-4 py-2 font-bold text-gray-700">{formatDate(date)}</td>
                                        </tr>
                                        {transactionsOnDate.map(t => (
                                            <tr key={t.id} className="border-b hover:bg-gray-50 cursor-pointer" onClick={() => setModalItem(t)}>
                                                <td className="px-4 py-3 w-1/2">
                                                    <p className="font-medium text-gray-800">{t.description}</p>
                                                    <p className="text-xs text-gray-500">{t.partner_name || 'Giao dịch nội bộ'}</p>
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <p className={`font-semibold ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                                                        {t.type === TransactionType.INCOME ? '+' : '-'} {t.amount.toLocaleString('vi-VN')} ₫
                                                    </p>
                                                </td>
                                                <td className="px-4 py-3 text-right text-xs text-gray-500 w-1/6 whitespace-nowrap">{t.code}</td>
                                            </tr>
                                        ))}
                                    </React.Fragment>
                                )
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card List */}
                <div className="md:hidden mt-4 space-y-3">
                    {paginatedTransactions.map((t) => (
                        <div key={t.id} onClick={() => setModalItem(t)} className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border">
                            <div className="flex justify-between items-start text-sm">
                                <div className="pr-2">
                                    <p className="font-semibold text-gray-800 leading-tight">{t.description}</p>
                                    <p className="text-xs text-gray-500 mt-0.5">{t.partner_name || 'Giao dịch nội bộ'}</p>
                                </div>
                                <p className={`font-bold whitespace-nowrap ${t.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                                    {t.type === TransactionType.INCOME ? '+' : '-'} {t.amount.toLocaleString('vi-VN')}
                                </p>
                            </div>
                            <div className="flex justify-between items-center mt-1">
                                <p className="text-xs text-gray-500">{t.code}</p>
                                <p className="text-xs text-gray-400">{formatDate(t.transaction_date)}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {transactions.length > 0 && (
                    <div className="mt-6 flex justify-center">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                            totalItems={transactions.length}
                            prevButtonContent={<ChevronLeftIcon />}
                            nextButtonContent={<ChevronRightIcon />}
                        />
                    </div>
                )}

                {transactions.length === 0 && <p className="text-center py-10 text-gray-500">Không có giao dịch nào phù hợp.</p>}
            </div>

            <DetailModal item={modalItem} onClose={() => setModalItem(null)} onEditClick={handleEditClick} onDeleteClick={handleDeleteClick} showNotification={showNotification} />
            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleConfirmTransactionDelete}
                title="Xác nhận Xóa Giao Dịch"
                message={`Bạn có chắc chắn muốn xóa giao dịch "${itemToDelete?.code}" không? Hành động này không thể hoàn tác.`}
                confirmText="Xác nhận Xóa"
            />
            <EditTransactionModal
                isOpen={isEditModalOpen && !!transactionToEdit}
                onClose={handleCloseEditModal}
                onSave={handleSaveTransaction}
                transaction={transactionToEdit}
            />
            <EditAccountModal
                isOpen={isEditModalOpen && !transactionToEdit}
                onClose={() => setIsEditModalOpen(false)}
                onSave={handleSaveAccountEdit}
                accountData={account || null}
            />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={handleConfirmAccountDelete}
                title="Xác nhận Xóa Tài khoản"
                message={`Bạn có chắc chắn muốn xóa tài khoản "${account.name}" không? Hành động này sẽ xóa vĩnh viễn và không thể hoàn tác.`}
                confirmText="Xác nhận Xóa"
            />
        </>
    );
};