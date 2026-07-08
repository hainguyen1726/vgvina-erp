import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { accountService } from '../src/services/accountService';
import { AdminAccount } from '../types';
import { PlusIcon, SearchIcon, ChevronLeftIcon, EditIcon, DeleteIcon, ChevronRightIcon } from '../components/icons/Icons';
import Pagination from '../components/ui/Pagination';
import { useNotification } from '../contexts/NotificationContext';
import ConfirmationModal from '../components/modals/ConfirmationModal';

type AccountType = 'Tiền mặt' | 'Ngân hàng' | 'Thẻ tín dụng';

const AddAccountModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (newAccount: Omit<AdminAccount, 'id'>) => void; }> = ({ isOpen, onClose, onSave }) => {
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const [name, setName] = useState('');
    const [type, setType] = useState<AccountType>('Ngân hàng');
    const [balance, setBalance] = useState<number | string>('');
    const [notes, setNotes] = useState('');
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');

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

    useEffect(() => {
        if (isOpen) {
            setName('');
            setType('Ngân hàng');
            setBalance('');
            setNotes('');
            setBankName('');
            setAccountNumber('');
            setAccountHolder('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            name,
            type,
            balance: parseFloat(String(balance)) || 0,
            notes,
            bank_name: bankName,
            account_number: accountNumber,
            account_holder: accountHolder
        });
        onClose();
    };

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={handleRequestClose}>
                <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                    <div className="p-6 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                        <h3 className="text-lg font-bold text-gray-900">Thêm tài khoản mới</h3>
                        <button type="button" onClick={handleRequestClose} className="text-gray-400 hover:text-gray-500">
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Tên tài khoản</label>
                            <input type="text" value={name} onChange={e => setName(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" required />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Loại tài khoản</label>
                            <select value={type} onChange={e => setType(e.target.value as AccountType)} className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500">
                                <option value="Ngân hàng">Ngân hàng</option>
                                <option value="Tiền mặt">Tiền mặt</option>
                                <option value="Thẻ tín dụng">Thẻ tín dụng</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Số dư ban đầu</label>
                            <input type="number" value={balance} onChange={e => setBalance(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Ghi chú</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                        </div>
                        {type !== 'Tiền mặt' && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ngân hàng</label>
                                    <input type="text" value={bankName} onChange={e => setBankName(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" placeholder="Ví dụ: Vietcombank" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Số tài khoản</label>
                                    <input type="text" value={accountNumber} onChange={e => setAccountNumber(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Chủ tài khoản</label>
                                    <input type="text" value={accountHolder} onChange={e => setAccountHolder(e.target.value)} className="mt-1 w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500" />
                                </div>
                            </>
                        )}
                    </div>
                    <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg border-t">
                        <button type="button" onClick={handleRequestClose} className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 font-medium text-gray-700">Hủy</button>
                        <button type="submit" className="px-4 py-2 text-sm text-white bg-[#0066cc] rounded-md hover:bg-[#0052a3] font-medium shadow-sm">Lưu</button>
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


const AdminAccounts: React.FC = () => {
    const { showNotification } = useNotification();
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(isMobile ? 8 : 12);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [accounts, setAccounts] = useState<AdminAccount[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAccounts();
    }, []);

    const fetchAccounts = async () => {
        try {
            setLoading(true);
            const data = await accountService.getAccounts();
            setAccounts(data);
        } catch (error) {
            console.error("Failed to fetch accounts", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            if (mobile !== isMobile) {
                setIsMobile(mobile);
                setItemsPerPage(mobile ? 8 : 12);
                setCurrentPage(1);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile]);

    const { totalBalance, accountCount } = useMemo(() => {
        const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
        const accountCount = accounts.length;
        return { totalBalance, accountCount };
    }, [accounts]);

    const filteredAccounts = accounts; // Placeholder for future search implementation
    const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
    const paginatedAccounts = filteredAccounts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleSaveAccount = async (newAccount: Omit<AdminAccount, 'id'>) => {
        try {
            await accountService.createAccount(newAccount);
            showNotification(`Tài khoản "${newAccount.name}" đã được tạo thành công.`, 'success');
            fetchAccounts();
        } catch (error) {
            console.error("Failed to save account", error);
            showNotification("Lỗi khi tạo tài khoản.", 'error');
        }
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b mb-6 gap-4">
                    <div className="flex items-center">
                        <Link to="/admin" className="p-2 rounded-md hover:bg-gray-100 mr-2">
                            <ChevronLeftIcon />
                        </Link>
                        <h1 className="text-xl font-bold text-gray-800 whitespace-nowrap">Quản lý tài khoản</h1>
                    </div>
                    <button onClick={() => setIsAddModalOpen(true)} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#0066cc] rounded-md hover:bg-[#0052a3] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0066cc]">
                        <PlusIcon className="mr-2" />
                        Thêm tài khoản
                    </button>
                </header>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="block bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <p className="text-sm font-medium text-blue-800">Tổng số dư</p>
                        <p className={`text-lg font-bold mt-1 ${totalBalance >= 0 ? 'text-blue-900' : 'text-red-600'}`}>
                            {totalBalance.toLocaleString('vi-VN')} ₫
                        </p>
                    </div>
                    <div className="block bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-600">Số lượng tài khoản</p>
                        <p className="text-lg font-bold text-gray-800 mt-1">{accountCount}</p>
                    </div>
                </div>

                <div className="mb-4">
                    <div className="relative">
                        <input
                            type="text"
                            placeholder="Tìm kiếm tài khoản..."
                            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                        />
                        <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <SearchIcon />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {paginatedAccounts.map(account => (
                        <Link to={`/admin/tai-khoan/${account.id}`} key={account.id} className="block bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border hover:border-blue-300">
                            <div>
                                <div className="flex justify-between items-start">
                                    <p className="font-semibold text-gray-800 truncate pr-4">{account.name}</p>
                                    <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full flex-shrink-0">{account.type}</span>
                                </div>
                                <p className={`text-sm font-bold mt-1 ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {account.balance.toLocaleString('vi-VN')} ₫
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-6 flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                        totalItems={filteredAccounts.length}
                        prevButtonContent={<ChevronLeftIcon />}
                        nextButtonContent={<ChevronRightIcon />}
                    />
                </div>
            </div>
            <AddAccountModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSave={handleSaveAccount} />
        </>
    );
}

export default AdminAccounts;