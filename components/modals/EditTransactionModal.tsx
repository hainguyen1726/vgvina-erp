import React, { useState, useEffect } from 'react';
import { FinancialTransaction, Partner, User, TransactionType } from '../../types';
import { partnerService } from '../../src/services/partnerService';
import { userService } from '../../src/services/userService';
import { accountService } from '../../src/services/accountService';
import { transactionService } from '../../src/services/transactionService';
import ConfirmationModal from './ConfirmationModal';

interface EditTransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (transaction: FinancialTransaction) => void;
    transaction: FinancialTransaction | null;
}

const EditTransactionModal: React.FC<EditTransactionModalProps> = ({ isOpen, onClose, onSave, transaction }) => {
    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const [futureDateWarning, setFutureDateWarning] = useState<{
        isOpen: boolean;
        onConfirm: () => void;
        date: string;
    } | null>(null);

    const handleRequestClose = () => {
        setShowConfirmClose(true);
    };

    // Handle ESC key to close modal handled below
    const [formData, setFormData] = useState<Omit<FinancialTransaction, 'amount'> & { amount: number | string; } | null>(null);
    const [partnersList, setPartnersList] = useState<Partner[]>([]);
    const [usersList, setUsersList] = useState<User[]>([]);
    const [accountsList, setAccountsList] = useState<{ id: string, name: string }[]>([]);
    const [incomeCats, setIncomeCats] = useState<{ id: string, name: string }[]>([]);
    const [expenseCats, setExpenseCats] = useState<{ id: string, name: string }[]>([]);

    useEffect(() => {
        const fetchOptions = async () => {
            try {
                const [p, u, a, catsIncome, catsExpense] = await Promise.all([
                    partnerService.getPartners(),
                    userService.getUsers(),
                    accountService.getAccounts(),
                    transactionService.getCategories(TransactionType.INCOME),
                    transactionService.getCategories(TransactionType.EXPENSE)
                ]);
                setPartnersList(p);
                setUsersList(u);
                setAccountsList(a);
                setIncomeCats(catsIncome);
                setExpenseCats(catsExpense);
            } catch (err) {
                console.error("Failed to fetch options for edit modal", err);
            }
        };
        if (isOpen) {
            fetchOptions();
        }
    }, [isOpen]);

    useEffect(() => {
        if (formData) {
            const currentCats = formData.type === TransactionType.INCOME ? incomeCats : expenseCats;
            if (currentCats.length > 0 && !currentCats.some(c => c.id === formData.categoryId)) {
                setFormData(prev => prev ? { ...prev, categoryId: '' } : null);
            }
        }
    }, [formData?.type, incomeCats, expenseCats]);

    useEffect(() => {
        if (isOpen) {
            setFormData(transaction ? { ...transaction } : null);
        }
    }, [isOpen, transaction]);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !showConfirmClose) {
                handleRequestClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, showConfirmClose]);

    if (!isOpen || !formData) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => prev ? { ...prev, [name]: value } : null);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => prev ? { ...prev, amount: value } : null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (formData) {
            const proceed = () => {
                onSave({
                    ...formData,
                    amount: parseFloat(String(formData.amount)) || 0
                });
            };

            const now = new Date();
            const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
            if (formData.transaction_date > todayStr) {
                setFutureDateWarning({
                    isOpen: true,
                    onConfirm: () => {
                        setFutureDateWarning(null);
                        proceed();
                    },
                    date: formData.transaction_date
                });
                return;
            }
            proceed();
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center border-b p-4">
                        <h3 className="text-xl font-bold text-gray-800">Sửa giao dịch: {formData.code}</h3>
                        <button type="button" onClick={handleRequestClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
                    </div>
                    <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <label className="font-medium text-gray-700">Mã phiếu</label>
                                <input type="text" name="code" value={formData.code} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md bg-gray-100" readOnly />
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium text-gray-700">Ngày</label>
                                <input type="date" name="transaction_date" value={formData.transaction_date} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" required />
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium text-gray-700">Loại giao dịch</label>
                                <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md" required>
                                    <option value={TransactionType.INCOME}>Thu</option>
                                    <option value={TransactionType.EXPENSE}>Chi</option>
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium text-gray-700">Số tiền</label>
                                <input type="number" name="amount" value={formData.amount} onChange={handleAmountChange} className="w-full p-2 border border-gray-300 rounded-md" required />
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium text-gray-700">Hạng mục <span className="text-red-500">*</span></label>
                                <select 
                                    name="categoryId" 
                                    value={formData.categoryId || ''} 
                                    onChange={handleChange} 
                                    className="w-full p-2 border border-gray-300 rounded-md" 
                                    required
                                >
                                    <option value="">Chọn hạng mục</option>
                                    {(formData.type === TransactionType.INCOME ? incomeCats : expenseCats).map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium text-gray-700">Tài khoản</label>
                                <select name="accountId" value={formData.accountId} onChange={handleChange} className="w-full p-2 border border-gray-300 rounded-md">
                                    <option value="">Chọn tài khoản</option>
                                    {accountsList.map(acc => <option key={acc.id} value={acc.id}>{acc.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium text-gray-700">Đối tác</label>
                                <select
                                    name="partnerId"
                                    value={formData.partnerId || ''}
                                    onChange={(e) => {
                                        const selectedId = e.target.value;
                                        const partner = partnersList.find(p => p.id === selectedId);
                                        setFormData(prev => prev ? {
                                            ...prev,
                                            partnerId: selectedId || null,
                                            partner_name: partner ? partner.name : null
                                        } : null);
                                    }}
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                >
                                    <option value="">Không có</option>
                                    {partnersList.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium text-gray-700">Nhân viên</label>
                                <select
                                    name="employee_name"
                                    value={formData.employee_name}
                                    onChange={handleChange}
                                    className="w-full p-2 border border-gray-300 rounded-md" required>
                                    <option value="">Chọn nhân viên</option>
                                    {usersList.map(u => <option key={u.id} value={u.full_name}>{u.full_name}</option>)}
                                </select>
                            </div>
                            <div className="space-y-1 md:col-span-2">
                                <label className="font-medium text-gray-700">Mô tả</label>
                                <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full p-2 border border-gray-300 rounded-md"></textarea>
                            </div>
                        </div>
                    </div>
                    <div className="border-t p-4 flex justify-end items-center bg-gray-50 rounded-b-lg gap-2">
                        <button type="button" onClick={handleRequestClose} className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap">
                            Hủy
                        </button>
                        <button type="submit" className="px-4 py-2 text-sm font-medium bg-[#0066cc] text-white rounded-md hover:bg-[#0052a3] whitespace-nowrap">
                            Lưu thay đổi
                        </button>
                    </div>
                </form>
            </div>

            <ConfirmationModal
                isOpen={showConfirmClose}
                onClose={() => setShowConfirmClose(false)}
                onConfirm={() => {
                    setShowConfirmClose(false);
                    onClose();
                }}
                title="Xác nhận Hủy"
                message="Bạn có chắc chắn muốn hủy? Các thay đổi sẽ không được lưu."
                confirmText="Hủy bỏ"
            />

            {futureDateWarning && (
                <ConfirmationModal
                    isOpen={futureDateWarning.isOpen}
                    onClose={() => setFutureDateWarning(null)}
                    onConfirm={futureDateWarning.onConfirm}
                    title="Cảnh báo: Ngày trong tương lai"
                    message={`Ngày giao dịch bạn chọn (${new Date(futureDateWarning.date).toLocaleDateString('vi-VN')}) là một ngày trong tương lai. Bạn có chắc chắn muốn tiếp tục ghi nhận giao dịch này không?`}
                    confirmText="Tiếp tục"
                    cancelText="Quay lại"
                />
            )}
        </div>
    );
};

export default EditTransactionModal;