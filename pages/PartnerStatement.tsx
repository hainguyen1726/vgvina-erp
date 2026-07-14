import React, { useState, useMemo, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import FilterBar from '../components/ui/FilterBar';
import { TableActions } from '../components/ui/TableActions';
import Pagination from '../components/ui/Pagination';
import { partnerService } from '../src/services/partnerService';
import { formatDate } from '../src/utils/dateUtils';
import { excelUtils } from '../src/utils/excelUtils';
import { ExportIcon, DoiTacIcon, DonHangIcon, ThuChiIcon, CongNoIcon } from '../components/icons/Icons';
import { useBranch } from '../contexts/BranchContext';
import { Partner, PartnerType, SalesOrder, PurchaseOrder, FinancialTransaction, AdminAccount, TransactionType } from '../types';
import SearchableSelect from '../components/ui/SearchableSelect';
import SummaryCard from '../components/ui/SummaryCard';
import { useNotification } from '../contexts/NotificationContext';
import { accountService } from '../src/services/accountService';
import { orderService } from '../src/services/orderService';
import { transactionService } from '../src/services/transactionService';
import { debtService } from '../src/services/debtService';
import { SalesOrderDetailModal } from './SalesOrders';
import { IncomeExpenseDetailModal } from './IncomeExpense';
import VoucherModal from '../components/modals/VoucherModal';
import GlobalConfirmationModal from '../components/modals/ConfirmationModal';

type OrderType = SalesOrder | PurchaseOrder;

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
}> = ({ isOpen, onClose, onConfirm, title, message }) => {
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
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Hủy</button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700">Xác nhận Xóa</button>
                </div>
            </div>
        </div>
    );
};


const PartnerStatement: React.FC = () => {
    const location = useLocation();
    const { selectedFacilityId, selectedBranch, currentUser } = useBranch();
    const { showNotification } = useNotification();
    const searchParams = new URLSearchParams(location.search);
    const initialPartnerId = searchParams.get('partnerId') || '';

    const [partners, setPartners] = useState<Partner[]>([]);
    const [selectedPartnerId, setSelectedPartnerId] = useState(initialPartnerId);
    
    const handleReconcileDebt = async () => {
        if (!selectedPartnerId) return;
        try {
            showNotification('Đang đồng bộ công nợ...', 'info');
            await debtService.reconcilePartnerDebts(selectedPartnerId, currentUser?.name || 'Hệ thống');
            showNotification('Đồng bộ công nợ thành công!', 'success');
            fetchStatement();
        } catch (error: any) {
            console.error("Reconcile debt failed", error);
            showNotification('Lỗi khi đồng bộ công nợ: ' + error.message, 'error');
        }
    };
    const [activities, setActivities] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(30);
    const [searchTerm, setSearchTerm] = useState('');
    const [timeFilterLabel, setTimeFilterLabel] = useState('Tháng này');

    const [salesModalItem, setSalesModalItem] = useState<OrderType | null>(null);
    const [txnModalItem, setTxnModalItem] = useState<FinancialTransaction | null>(null);

    const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
    const [itemToDelete, setItemToDelete] = useState<any | null>(null);

    // State for Payment Modal
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [accounts, setAccounts] = useState<AdminAccount[]>([]);
    const [categories, setCategories] = useState<any[]>([]);
    const [paymentAmount, setPaymentAmount] = useState('');
    const [selectedAccountId, setSelectedAccountId] = useState('');
    const [selectedCategoryId, setSelectedCategoryId] = useState('');
    const [paymentDate, setPaymentDate] = useState('');
    const [paymentDescription, setPaymentDescription] = useState('');
    const [isSavingPayment, setIsSavingPayment] = useState(false);
    const [futureDateWarning, setFutureDateWarning] = useState<{
        isOpen: boolean;
        onConfirm: () => void;
        date: string;
    } | null>(null);

    const [voucherModal, setVoucherModal] = useState<{ isOpen: boolean; type: string; initialData?: any }>({ isOpen: false, type: '' });
    const handleOpenVoucherModal = (type: string, initialData?: any) => setVoucherModal({ isOpen: true, type, initialData });
    const handleCloseVoucherModal = () => { setVoucherModal({ isOpen: false, type: '' }); fetchStatement(); };

    useEffect(() => {
        setTimeFilterLabel('Tháng này');
    }, []);

    // Fetch accounts and categories when Payment Modal opens
    useEffect(() => {
        if (isPaymentModalOpen) {
            // Load accounts
            accountService.getAccounts()
                .then(data => {
                    // Filter out TK KN & TK Nợ NCC
                    const cashAccounts = data.filter(acc => acc.name !== 'TK KN' && acc.name !== 'TK Nợ NCC');
                    setAccounts(cashAccounts);
                    if (cashAccounts.length > 0) setSelectedAccountId(cashAccounts[0].id);
                })
                .catch(console.error);

            // Load categories based on partner type
            const partner = partners.find(p => p.id === selectedPartnerId);
            if (partner) {
                const type = partner.type === 'CUSTOMER' ? 'INCOME' : 'EXPENSE';
                transactionService.getCategories(type)
                    .then(cats => {
                        setCategories(cats);
                        // Find default category like "Thu nợ khách hàng" or "Chi trả nợ NCC"
                        const defaultCat = cats.find(c => c.name.toLowerCase().includes('nợ')) || cats[0];
                        if (defaultCat) setSelectedCategoryId(defaultCat.id);
                    })
                    .catch(console.error);

                // Set default date and description
                setPaymentDate(new Date().toISOString().split('T')[0]);
                setPaymentDescription(
                    partner.type === 'CUSTOMER'
                        ? `Thu nợ từ khách hàng ${partner.name}`
                        : `Chi trả nợ nhà cung cấp ${partner.name}`
                );
                setPaymentAmount('');
            }
        }
    }, [isPaymentModalOpen, selectedPartnerId, partners]);

    const handlePaymentSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedPartnerId || !paymentAmount || !selectedAccountId || !selectedCategoryId) return;

        const partner = partners.find(p => p.id === selectedPartnerId);
        if (!partner) return;

        const proceed = async () => {
            try {
                setIsSavingPayment(true);
                const type = partner.type === 'CUSTOMER' ? TransactionType.INCOME : TransactionType.EXPENSE;
                
                // If selectedFacilityId is null (all branches), fallback to partner's facility_id or first facility in system
                const facilityId = selectedFacilityId || partner.facility_ids?.[0] || null;

                await transactionService.createFinancialTransaction({
                    type,
                    amount: Number(paymentAmount),
                    categoryId: selectedCategoryId,
                    description: paymentDescription,
                    partnerId: selectedPartnerId,
                    accountId: selectedAccountId,
                    assignedUserIds: [],
                    transactionDate: paymentDate,
                    facilityId: facilityId
                });

                showNotification('Ghi nhận thanh toán công nợ thành công', 'success');
                setIsPaymentModalOpen(false);
                fetchStatement(); // Reload statement list
            } catch (error: any) {
                console.error("Failed to process payment:", error);
                showNotification(`Lỗi khi thanh toán: ${error.message}`, 'error');
            } finally {
                setIsSavingPayment(false);
            }
        };

        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        if (paymentDate > todayStr) {
            setFutureDateWarning({
                isOpen: true,
                onConfirm: () => {
                    setFutureDateWarning(null);
                    proceed();
                },
                date: paymentDate
            });
            return;
        }
        await proceed();
    };

    useEffect(() => {
        fetchPartners();
    }, [selectedFacilityId]);

    useEffect(() => {
        if (selectedPartnerId) {
            fetchStatement();
        } else {
            setActivities([]);
        }
    }, [selectedPartnerId, dateRange, selectedFacilityId]);

    const fetchPartners = async () => {
        try {
            const data = await partnerService.getPartners(undefined, selectedFacilityId || undefined);
            setPartners(data);
        } catch (error) {
            console.error("Failed to fetch partners", error);
        }
    };

    const fetchStatement = async () => {
        try {
            setLoading(true);
            const data = await partnerService.getPartnerStatement(selectedPartnerId, dateRange.from, dateRange.to, selectedFacilityId || undefined);
            setActivities(data);
        } catch (error) {
            console.error("Failed to fetch statement", error);
            showNotification("Không thể tải sổ chi tiết công nợ", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleTimeFilterChange = (filter: string, dates?: { from: Date; to: Date }) => {
        setTimeFilterLabel(filter);
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

    const { activitiesWithBalance, summary } = useMemo(() => {
        let balance = 0;
        let totalIncrease = 0;
        let totalDecrease = 0;

        const withBalance = activities.map(a => {
            balance += (a.increase || 0) - (a.decrease || 0);
            totalIncrease += a.increase || 0;
            totalDecrease += a.decrease || 0;
            return { ...a, balance };
        });

        return {
            activitiesWithBalance: withBalance,
            summary: {
                totalIncrease,
                totalDecrease,
                finalBalance: balance
            }
        };
    }, [activities]);

    const displayActivities = useMemo(() => {
        return [...activitiesWithBalance].reverse();
    }, [activitiesWithBalance]);

    const filteredActivities = useMemo(() => {
        return displayActivities.filter(a =>
            a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            a.code.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [displayActivities, searchTerm]);

    const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
    const paginatedActivities = filteredActivities.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleRowClick = async (item: any) => {
        try {
            setLoading(true);
            if (item.type === 'SALES_ORDER') {
                const data = await orderService.getSalesOrderById(item.id);
                setSalesModalItem(data);
            } else if (item.type === 'PURCHASE_ORDER') {
                const data = await orderService.getPurchaseOrderById(item.id);
                setSalesModalItem(data);
            } else if (item.type === 'PAYMENT_RECEIVED' || item.type === 'PAYMENT_MADE') {
                const data = await transactionService.getTransactionById(item.id);
                setTxnModalItem(data);
            }
        } catch (e: any) {
            console.error("Lỗi khi tải chi tiết", e);
            showNotification('Lỗi khi tải chi tiết phần tử: ' + e.message, 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteOrder = (item: any) => {
        setSalesModalItem(null);
        setItemToDelete(item);
    };

    const handleDeleteTransaction = (item: any) => {
        setTxnModalItem(null);
        setItemToDelete(item);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            setLoading(true);
            if (itemToDelete.type === 'SALES_ORDER' || ('customer_name' in itemToDelete)) {
                await orderService.deleteSalesOrder(itemToDelete.id);
            } else if (itemToDelete.type === 'PURCHASE_ORDER' || ('supplier_name' in itemToDelete)) {
                await orderService.deletePurchaseOrder(itemToDelete.id);
            } else if (itemToDelete.type === 'PAYMENT_RECEIVED' || itemToDelete.type === 'PAYMENT_MADE' || itemToDelete.type === 'INCOME' || itemToDelete.type === 'EXPENSE') {
                await transactionService.deleteTransaction(itemToDelete.id);
            }
            showNotification('Đã xóa thành công', 'success');
            fetchStatement();
        } catch (error: any) {
            console.error("Delete failed", error);
            showNotification('Lỗi khi xóa: ' + error.message, 'error');
        } finally {
            setLoading(false);
            setItemToDelete(null);
        }
    };

    const handleExport = () => {
        const partnerName = partners.find(p => p.id === selectedPartnerId)?.name || 'DoiTac';
        const exportData = displayActivities.map(a => ({
            'Ngày': formatDate(a.date),
            'Mã': a.code,
            'Mô tả': a.description,
            'Tăng': a.increase,
            'Giảm': a.decrease,
            'Dư': a.balance,
            'Ghi chú': a.notes || ''
        }));
        excelUtils.exportPartnerStatementStyled(exportData, `SoChiTietCongNo_${partnerName}`, partnerName, selectedBranch || 'Tất cả');
    };

    const timeOptions = ['Hôm nay', 'Hôm qua', 'Tuần này', 'Tháng này', 'Năm nay', 'All time', 'Tùy chọn'];

    return (
        <div className="flex flex-col h-full">
            <FilterBar onSearch={setSearchTerm} onTimeFilterChange={handleTimeFilterChange} pageTitle="Sổ chi tiết Công nợ" backPath="/bao-cao" />

            <div className="p-4 md:p-6 space-y-4">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[300px]">
                        <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                            <DoiTacIcon className="w-4 h-4 text-[#0066cc]" /> Chọn Đối tác
                        </label>
                        <SearchableSelect
                            options={partners.map(p => ({
                                id: p.id,
                                name: `${p.name} (${p.type === PartnerType.CUSTOMER ? 'KH' : 'NCC'})`
                            }))}
                            value={selectedPartnerId}
                            onChange={(value) => setSelectedPartnerId(value)}
                            placeholder="Tìm kiếm đối tác để xem chi tiết..."
                            className="w-full"
                        />
                    </div>
                </div>

                {selectedPartnerId ? (
                    <>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <SummaryCard
                                title="Tổng phát sinh tăng"
                                value={summary.totalIncrease.toLocaleString('vi-VN') + ' ₫'}
                                icon={<DonHangIcon />}
                                colorClass="bg-red-50 text-red-600"
                            />
                            <SummaryCard
                                title="Tổng phát sinh giảm"
                                value={summary.totalDecrease.toLocaleString('vi-VN') + ' ₫'}
                                icon={<ThuChiIcon />}
                                colorClass="bg-green-50 text-green-600"
                            />
                            <SummaryCard
                                title="Công nợ cuối kỳ"
                                value={summary.finalBalance.toLocaleString('vi-VN') + ' ₫'}
                                icon={<CongNoIcon />}
                                colorClass="bg-blue-50 text-blue-600"
                            />
                        </div>

                        <TableActions
                            onSearch={setSearchTerm}
                            searchPlaceholder="Tìm theo mã hoặc mô tả..."
                            primaryActions={[
                                { label: 'Thanh toán', icon: <ThuChiIcon />, onClick: () => setIsPaymentModalOpen(true) },
                                { label: 'Đồng bộ công nợ', icon: <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" /></svg>, onClick: handleReconcileDebt, variant: 'secondary' },
                                { label: 'Xuất file', icon: <ExportIcon />, onClick: handleExport, variant: 'secondary' },
                            ]}
                            columns={[]}
                            visibleColumns={[]}
                            onVisibleColumnsChange={() => { }}
                        />

                        <div className="bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left text-gray-500">
                                    <thead className="text-xs text-gray-700 bg-gray-50 border-b">
                                        <tr>
                                            <th className="px-6 py-3">Ngày</th>
                                            <th className="px-6 py-3">Chứng từ</th>
                                            <th className="px-6 py-3">Diễn giải</th>
                                            <th className="px-6 py-3 text-right">Tăng (nợ)</th>
                                            <th className="px-6 py-3 text-right">Giảm (có)</th>
                                            <th className="px-6 py-3 text-right">Số dư</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-200">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center gap-2">
                                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066cc]"></div>
                                                        <span className="text-gray-500">Đang tải dữ liệu...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : paginatedActivities.length === 0 ? (
                                            <tr>
                                                <td colSpan={6} className="px-6 py-12 text-center text-gray-500 italic">
                                                    Không có giao dịch nào trong khoảng thời gian {timeFilterLabel.toLowerCase()}.
                                                </td>
                                            </tr>
                                        ) : (
                                            paginatedActivities.map((item) => (
                                                <tr key={item.id} className="bg-white border-b hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleRowClick(item)}>
                                                    <td className="px-6 py-4 whitespace-nowrap">{formatDate(item.date)}</td>
                                                    <td className="px-6 py-4 font-medium text-blue-600">{item.code}</td>
                                                    <td className="px-6 py-4 max-w-xs truncate">{item.description}</td>
                                                    <td className="px-6 py-4 text-right font-medium text-gray-900 tabular-nums">
                                                        {item.increase > 0 ? item.increase.toLocaleString('vi-VN') + ' ₫' : '-'}
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-medium text-green-600 tabular-nums">
                                                        {item.decrease > 0 ? item.decrease.toLocaleString('vi-VN') + ' ₫' : '-'}
                                                    </td>
                                                    <td className={`px-6 py-4 text-right font-bold tabular-nums ${item.balance >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                                                        {item.balance.toLocaleString('vi-VN')} ₫
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    {!loading && paginatedActivities.length > 0 && (
                                        <tfoot className="bg-gray-50 font-bold border-t">
                                            <tr>
                                                <td colSpan={3} className="px-6 py-3 text-right text-gray-700 uppercase">Tổng cộng kỳ này</td>
                                                <td className="px-6 py-3 text-right text-red-600 tabular-nums">{summary.totalIncrease.toLocaleString('vi-VN')} ₫</td>
                                                <td className="px-6 py-3 text-right text-green-600 tabular-nums">{summary.totalDecrease.toLocaleString('vi-VN')} ₫</td>
                                                <td className="px-6 py-3 text-right text-blue-700 tabular-nums">{summary.finalBalance.toLocaleString('vi-VN')} ₫</td>
                                            </tr>
                                        </tfoot>
                                    )}
                                </table>
                            </div>
                            <div className="p-4 border-t bg-gray-50">
                                <Pagination
                                    currentPage={currentPage}
                                    totalPages={totalPages}
                                    onPageChange={setCurrentPage}
                                    itemsPerPage={itemsPerPage}
                                    onItemsPerPageChange={setItemsPerPage}
                                    totalItems={filteredActivities.length}
                                />
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="bg-white p-12 rounded-xl border border-dashed border-gray-300 text-center shadow-sm">
                        <DoiTacIcon className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Chưa chọn đối tác</h3>
                        <p className="text-gray-500 max-w-sm mx-auto">Vui lòng chọn một Khách hàng hoặc Nhà cung cấp từ ô tìm kiếm phía trên để xem sổ chi tiết công nợ và các giao dịch phát sinh.</p>
                    </div>
                )}
            </div>

            <SalesOrderDetailModal
                item={salesModalItem}
                onClose={() => setSalesModalItem(null)}
                onEditClick={() => { setSalesModalItem(null); /* Handle edit navigation or state later */ }}
                onDeleteClick={handleDeleteOrder}
                onReturnClick={(order) => {
                    setSalesModalItem(null);
                    handleOpenVoucherModal('return-voucher', order);
                }}
            />

            <IncomeExpenseDetailModal
                item={txnModalItem}
                onClose={() => setTxnModalItem(null)}
                onEditClick={() => { setTxnModalItem(null); /* Handle edit later */ }}
                onDeleteClick={handleDeleteTransaction}
            />

            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Xác nhận Xóa"
                message={`Bạn có chắc chắn muốn xóa chứng từ này không? Hành động này không thể hoàn tác.`}
            />

            {/* Payment Modal */}
            {isPaymentModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center border-b p-4">
                            <h3 className="text-lg font-semibold text-gray-800">Thanh toán Công nợ</h3>
                            <button onClick={() => setIsPaymentModalOpen(false)} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
                        </div>
                        <form onSubmit={handlePaymentSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">Đối tác</label>
                                <p className="text-sm font-semibold text-gray-800 mt-1">
                                    {partners.find(p => p.id === selectedPartnerId)?.name}
                                </p>
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 uppercase">Loại giao dịch</label>
                                <p className="text-sm font-semibold text-gray-800 mt-1">
                                    {partners.find(p => p.id === selectedPartnerId)?.type === 'CUSTOMER' ? 'Thu tiền (Giảm nợ)' : 'Chi tiền (Giảm nợ)'}
                                </p>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền thanh toán (₫)</label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    autoFocus
                                    value={paymentAmount}
                                    onChange={e => setPaymentAmount(e.target.value)}
                                    placeholder="Nhập số tiền"
                                    className="w-full px-3 py-2 border rounded-md focus:ring-[#0066cc] focus:border-[#0066cc] outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Tài khoản thanh toán</label>
                                <select
                                    required
                                    value={selectedAccountId}
                                    onChange={e => setSelectedAccountId(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-[#0066cc] focus:border-[#0066cc] outline-none text-sm bg-white"
                                >
                                    {accounts.map(acc => (
                                        <option key={acc.id} value={acc.id}>{acc.name} ({acc.type})</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Hạng mục</label>
                                <select
                                    required
                                    value={selectedCategoryId}
                                    onChange={e => setSelectedCategoryId(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-[#0066cc] focus:border-[#0066cc] outline-none text-sm bg-white"
                                >
                                    {categories.map(cat => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Ngày thanh toán</label>
                                <input
                                    required
                                    type="date"
                                    value={paymentDate}
                                    onChange={e => setPaymentDate(e.target.value)}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-[#0066cc] focus:border-[#0066cc] outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả / Ghi chú</label>
                                <textarea
                                    value={paymentDescription}
                                    onChange={e => setPaymentDescription(e.target.value)}
                                    rows={2}
                                    className="w-full px-3 py-2 border rounded-md focus:ring-[#0066cc] focus:border-[#0066cc] outline-none text-sm"
                                ></textarea>
                            </div>
                            <div className="border-t pt-4 flex justify-end gap-2 bg-gray-50 -mx-6 -mb-6 p-4 rounded-b-lg">
                                <button
                                    type="button"
                                    onClick={() => setIsPaymentModalOpen(false)}
                                    className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                                    disabled={isSavingPayment}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 text-sm font-medium bg-[#0066cc] text-white rounded-md hover:bg-[#0052a3] flex items-center gap-1.5"
                                    disabled={isSavingPayment}
                                >
                                    {isSavingPayment ? (
                                        <>
                                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                            Đang lưu...
                                        </>
                                    ) : 'Xác nhận'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <VoucherModal isOpen={voucherModal.isOpen} voucherType={voucherModal.type} initialData={voucherModal.initialData} onClose={handleCloseVoucherModal} />

            {futureDateWarning && (
                <GlobalConfirmationModal
                    isOpen={futureDateWarning.isOpen}
                    onClose={() => setFutureDateWarning(null)}
                    onConfirm={futureDateWarning.onConfirm}
                    title="Cảnh báo: Ngày trong tương lai"
                    message={`Ngày thanh toán bạn chọn (${new Date(futureDateWarning.date).toLocaleDateString('vi-VN')}) là một ngày trong tương lai. Bạn có chắc chắn muốn tiếp tục ghi nhận giao dịch này không?`}
                    confirmText="Tiếp tục"
                    cancelText="Quay lại"
                />
            )}
        </div>
    );
};

export default PartnerStatement;
