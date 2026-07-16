import React, { useState, useMemo, useEffect } from 'react';
import { formatDate } from '../src/utils/dateUtils';
import { Link } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import FilterBar from '../components/ui/FilterBar';
import SummaryCard from '../components/ui/SummaryCard';
import { Page, FinancialTransaction, TransactionType, SalesOrder, DebtStatus, OrderStatus } from '../types';
import { transactionService } from '../src/services/transactionService';
import { orderService } from '../src/services/orderService';
import { debtService } from '../src/services/debtService';
import { productService } from '../src/services/productService';
import { ChevronDownIcon, EditIcon, DeleteIcon, CongNoIcon, KhoIcon, DonHangIcon, ExportIcon } from '../components/icons/Icons';
import EditTransactionModal from '../components/modals/EditTransactionModal';
import { useNotification } from '../contexts/NotificationContext';
import { useBranch } from '../contexts/BranchContext';

type MetricType = 'sales' | 'expenses';

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

const getDateRanges = (filter: string, customDates?: { from: Date; to: Date }): { currentRange: [Date, Date], previousRange: [Date, Date], lastYearRange: [Date, Date] } => {
    const now = new Date();
    let currentStart: Date, currentEnd: Date;
    let previousStart: Date, previousEnd: Date;
    let lastYearStart: Date, lastYearEnd: Date;

    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);

    switch (filter) {
        case 'Hôm nay':
            currentStart = new Date(); currentStart.setHours(0, 0, 0, 0);
            currentEnd = new Date(currentStart); currentEnd.setHours(23, 59, 59, 999);
            previousStart = new Date(now.getTime() - 86400000); previousStart.setHours(0, 0, 0, 0);
            previousEnd = new Date(previousStart); previousEnd.setHours(23, 59, 59, 999);
            lastYearStart = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), 0, 0, 0, 0);
            lastYearEnd = new Date(lastYearStart); lastYearEnd.setHours(23, 59, 59, 999);
            break;
        case 'Hôm qua':
            currentStart = new Date(); currentStart.setDate(currentStart.getDate() - 1); currentStart.setHours(0, 0, 0, 0);
            currentEnd = new Date(currentStart); currentEnd.setHours(23, 59, 59, 999);
            previousStart = new Date(currentStart.getTime() - 86400000); previousStart.setHours(0, 0, 0, 0);
            previousEnd = new Date(previousStart); previousEnd.setHours(23, 59, 59, 999);
            lastYearStart = new Date(currentStart.getFullYear() - 1, currentStart.getMonth(), currentStart.getDate(), 0, 0, 0, 0);
            lastYearEnd = new Date(lastYearStart); lastYearEnd.setHours(23, 59, 59, 999);
            break;
        case 'Tuần này':
            const dayOfWeek = now.getDay();
            const diff = now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
            currentStart = new Date(new Date(now.setDate(diff)).setHours(0, 0, 0, 0));
            currentEnd = endOfToday;
            previousStart = new Date(currentStart.getTime() - 7 * 86400000);
            previousEnd = new Date(currentStart.getTime() - 1); previousEnd.setHours(23, 59, 59, 999);
            lastYearStart = new Date(currentStart.getFullYear() - 1, currentStart.getMonth(), currentStart.getDate());
            lastYearEnd = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate(), 23, 59, 59, 999);
            break;
        case 'Tháng này':
            currentStart = new Date(now.getFullYear(), now.getMonth(), 1);
            currentEnd = endOfToday;
            previousStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
            previousEnd = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
            lastYearStart = new Date(now.getFullYear() - 1, now.getMonth(), 1);
            lastYearEnd = new Date(now.getFullYear() - 1, now.getMonth() + 1, 0, 23, 59, 59, 999);
            break;
        case 'Quý này':
            const quarter = Math.floor(now.getMonth() / 3);
            currentStart = new Date(now.getFullYear(), quarter * 3, 1);
            currentEnd = endOfToday;
            previousStart = new Date(now.getFullYear(), quarter * 3 - 3, 1);
            previousEnd = new Date(now.getFullYear(), quarter * 3, 0, 23, 59, 59, 999);
            lastYearStart = new Date(now.getFullYear() - 1, quarter * 3, 1);
            lastYearEnd = new Date(now.getFullYear() - 1, quarter * 3 + 3, 0, 23, 59, 59, 999);
            break;
        case 'Năm nay':
            currentStart = new Date(now.getFullYear(), 0, 1);
            currentEnd = endOfToday;
            previousStart = new Date(now.getFullYear() - 1, 0, 1);
            previousEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
            lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
            lastYearEnd = new Date(now.getFullYear() - 1, 11, 31, 23, 59, 59, 999);
            break;
        case 'Tùy chọn':
            currentStart = customDates?.from ? new Date(customDates.from) : new Date(0);
            currentEnd = customDates?.to ? new Date(customDates.to) : new Date();
            currentStart.setHours(0, 0, 0, 0);
            currentEnd.setHours(23, 59, 59, 999);
            const duration = currentEnd.getTime() - currentStart.getTime();
            previousStart = new Date(currentStart.getTime() - duration);
            previousEnd = new Date(currentStart.getTime() - 1);
            lastYearStart = new Date(currentStart.getFullYear() - 1, currentStart.getMonth(), currentStart.getDate());
            lastYearEnd = new Date(currentEnd.getFullYear() - 1, currentEnd.getMonth(), currentEnd.getDate());
            break;
        default: // All time
            currentStart = new Date(0); currentEnd = new Date();
            previousStart = new Date(0); previousEnd = new Date(0);
            lastYearStart = new Date(0); lastYearEnd = new Date(0);
    }
    return { currentRange: [currentStart, currentEnd], previousRange: [previousStart, previousEnd], lastYearRange: [lastYearStart, lastYearEnd] };
};

const Dashboard: React.FC = () => {
    const { showNotification } = useNotification();
    const { can, currentUser, selectedFacilityId } = useBranch();
    const [metricType, setMetricType] = useState<MetricType>('sales');
    const [timeFilter, setTimeFilter] = useState<{ filter: string; dates?: { from: Date; to: Date } }>({ filter: 'Tháng này' });

    const [transactions, setTransactions] = useState<FinancialTransaction[]>([]);
    const [salesOrders, setSalesOrders] = useState<any[]>([]); // Using any for now to match flexible service return or update type
    const [debts, setDebts] = useState<any[]>([]); // Using any to avoid strict type checks on initial load
    const [stockValue, setStockValue] = useState(0);
    const [stockSkuCount, setStockSkuCount] = useState(0);
    const [stockTotalQty, setStockTotalQty] = useState(0);
    const [stockWithoutCost, setStockWithoutCost] = useState(0);
    const [loading, setLoading] = useState(true);
    const [autoSyncTried, setAutoSyncTried] = useState(false);

    const [modalItem, setModalItem] = useState<FinancialTransaction | null>(null);
    const [itemToDelete, setItemToDelete] = useState<FinancialTransaction | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [transactionToEdit, setTransactionToEdit] = useState<FinancialTransaction | null>(null);

    useEffect(() => {
        if (can('sales_orders', 'view')) {
            setMetricType('sales');
        } else if (can('financial_transactions', 'view')) {
            setMetricType('expenses');
        }
    }, [currentUser]);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);

                // Calculate the oldest date required by the dashboard timeFilter to filter the database query
                let startDate: string | undefined = undefined;
                if (timeFilter.filter !== 'All time') {
                    const { currentRange, previousRange, lastYearRange } = getDateRanges(timeFilter.filter, timeFilter.dates);
                    const minTime = Math.min(
                        currentRange[0].getTime(),
                        previousRange[0].getTime(),
                        lastYearRange[0].getTime()
                    );
                    if (minTime > 0) {
                        startDate = new Date(minTime).toISOString().split('T')[0];
                    }
                }

                const [txs, orders, debtsData, stockSummary] = await Promise.all([
                    transactionService.getTransactions(undefined, undefined, selectedFacilityId || undefined, undefined, undefined, startDate),
                    orderService.getSalesOrders(selectedFacilityId || undefined, undefined, startDate),
                    debtService.getDebts(selectedFacilityId || undefined),
                    productService.getInventoryValueAtCost(selectedFacilityId || undefined)
                ]);

                const filteredTxs = txs.filter(t => t.account_name !== 'TK KN' && t.account_name !== 'TK Nợ NCC');
                setTransactions(filteredTxs);
                setSalesOrders(orders);
                setDebts(debtsData);

                let { totalValue, totalQuantity, skuCount, productsWithoutCost } = stockSummary;

                // Nếu giá trị tồn kho = 0 nhưng số lượng > 0 (vgvina_inventory chưa sync sau migration
                // 2026-05-05) — admin sẽ tự sync 1 lần rồi đọc lại.
                if (totalValue === 0 && totalQuantity > 0 && currentUser?.is_admin && !autoSyncTried) {
                    setAutoSyncTried(true);
                    try {
                        await productService.syncInventory();
                        const refreshed = await productService.getInventoryValueAtCost(selectedFacilityId || undefined);
                        totalValue = refreshed.totalValue;
                        totalQuantity = refreshed.totalQuantity;
                        skuCount = refreshed.skuCount;
                        productsWithoutCost = refreshed.productsWithoutCost;
                    } catch (e) {
                        console.warn('Auto-sync inventory failed:', e);
                    }
                }

                setStockValue(totalValue);
                setStockTotalQty(totalQuantity);
                setStockSkuCount(skuCount);
                setStockWithoutCost(productsWithoutCost);

            } catch (error) {
                console.error("Error fetching dashboard data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchDashboardData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedFacilityId, currentUser, timeFilter]);

    const handleTimeFilterChange = (filter: string, dates?: { from: Date; to: Date }) => {
        setTimeFilter({ filter, dates });
    };

    const handleEditClick = (item: FinancialTransaction) => {
        setTransactionToEdit(item);
        setIsEditModalOpen(true);
        setModalItem(null);
    };

    const handleDeleteClick = (item: FinancialTransaction) => {
        setItemToDelete(item);
        setModalItem(null);
    };

    const handleConfirmDelete = () => {
        if (itemToDelete) {
            setTransactions(prev => prev.filter(t => t.id !== itemToDelete.id));
            console.log("Confirmed delete for transaction:", itemToDelete.id);
        }
        setItemToDelete(null);
    };

    const handleSaveTransaction = (updatedTransaction: FinancialTransaction) => {
        setTransactions(prev => prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t));
        setIsEditModalOpen(false);
        setTransactionToEdit(null);
        showNotification(`Đã lưu giao dịch: ${updatedTransaction.code}`, 'success');
    };

    const handleCloseEditModal = () => {
        setIsEditModalOpen(false);
        setTransactionToEdit(null);
    };

    const formatLargeNumber = (num: number) => {
        if (num >= 1e9) {
            return (num / 1e9).toFixed(1).replace('.', ',') + ' Tỷ';
        }
        if (num >= 1e6) {
            return (num / 1e6).toFixed(1).replace('.', ',') + ' Tr';
        }
        return num.toLocaleString('vi-VN');
    };

    const processedData = useMemo(() => {
        const { currentRange, previousRange, lastYearRange } = getDateRanges(timeFilter.filter, timeFilter.dates);

        const dataSet = metricType === 'sales' ? salesOrders : transactions.filter(t => t.type === TransactionType.EXPENSE);

        // Fix: Used type guards (`in` operator) for safe property access on the union type `SalesOrder | FinancialTransaction`.
        const filterAndSum = (range: [Date, Date]) => {
            if (range[0].getTime() === range[1].getTime() && range[0].getTime() === 0) return 0;
            return dataSet.reduce((sum, item) => {
                const itemDate = new Date('customer_name' in item ? item.order_date : item.transaction_date);
                if (itemDate >= range[0] && itemDate <= range[1]) {
                    if ('customer_name' in item) {
                        const status = item.status;
                        if (status !== OrderStatus.COMPLETED && status !== OrderStatus.DELIVERED) {
                            return sum;
                        }
                    }
                    return sum + ('customer_name' in item ? item.total_amount : item.amount);
                }
                return sum;
            }, 0);
        };

        const currentTotal = filterAndSum(currentRange);
        const previousTotal = filterAndSum(previousRange);
        const lastYearTotal = filterAndSum(lastYearRange);

        const calculateChange = (current: number, previous: number) => {
            if (previous === 0) return null;
            return Math.round(((current - previous) / previous) * 100);
        };

        const vsPreviousChange = calculateChange(currentTotal, previousTotal);
        const vsLastYearChange = calculateChange(currentTotal, lastYearTotal);

        const dailyData: { [key: string]: number } = {};
        for (let d = new Date(currentRange[0]); d <= currentRange[1]; d.setDate(d.getDate() + 1)) {
            if (d > new Date()) break;
            const day = d.toISOString().split('T')[0];
            dailyData[day] = 0;
        }

        // Fix: Used type guards for safe property access here as well.
        dataSet.forEach(item => {
            const itemDate = new Date('customer_name' in item ? item.order_date : item.transaction_date);
            if (itemDate >= currentRange[0] && itemDate <= currentRange[1]) {
                if ('customer_name' in item) {
                    const status = item.status;
                    if (status !== OrderStatus.COMPLETED && status !== OrderStatus.DELIVERED) {
                        return;
                    }
                }
                const day = itemDate.toISOString().split('T')[0];
                if (dailyData.hasOwnProperty(day)) {
                    dailyData[day] += ('customer_name' in item ? item.total_amount : item.amount);
                }
            }
        });

        const dailyDataKeys = Object.keys(dailyData).sort();
        let chartData;
        const MAX_BARS = 30;

        if (dailyDataKeys.length > MAX_BARS) {
            chartData = [];
            const groupSize = Math.ceil(dailyDataKeys.length / MAX_BARS);
            for (let i = 0; i < dailyDataKeys.length; i += groupSize) {
                const chunkKeys = dailyDataKeys.slice(i, i + groupSize);
                if (chunkKeys.length === 0) continue;

                const totalValue = chunkKeys.reduce((sum, key) => sum + dailyData[key], 0);
                const name = formatDate(chunkKeys[0]);

                chartData.push({
                    name: name,
                    value: totalValue
                });
            }
        } else {
            chartData = dailyDataKeys.map(dateStr => ({
                name: formatDate(dateStr),
                value: dailyData[dateStr]
            }));
        }

        const periodLabels: { [key: string]: { current: string, previous: string } } = {
            'Hôm nay': { current: 'Hôm nay', previous: 'Hôm qua' },
            'Hôm qua': { current: 'Hôm qua', previous: 'Hôm kia' },
            'Tuần này': { current: 'Tuần này', previous: 'Tuần trước' },
            'Tháng này': { current: 'Tháng này', previous: 'Tháng trước' },
            'Quý này': { current: 'Quý này', previous: 'Quý trước' },
            'Năm nay': { current: 'Năm nay', previous: 'Năm trước' },
            'Tùy chọn': { current: 'Kỳ này', previous: 'Kỳ trước' },
            'All time': { current: 'Toàn thời gian', previous: 'N/A' },
        };

        const filterByDateRange = (items: any[], dateField: string, range: [Date, Date]) => {
            if (range[0].getTime() === new Date(0).getTime() && range[1].getTime() > new Date(0).getTime()) {
                return items;
            }
            return items.filter(item => {
                const itemDate = new Date(item[dateField]);
                return itemDate >= range[0] && itemDate <= range[1];
            });
        };

        const now = new Date();
        const filteredDebts = filterByDateRange(debts, 'due_date', currentRange);
        const payableDebts = filteredDebts.filter(d => d.type === 'PAYABLE' && d.status !== DebtStatus.PAID);
        const receivableDebts = filteredDebts.filter(d => d.type === 'RECEIVABLE' && d.status !== DebtStatus.PAID);

        const noNCC = payableDebts.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
        const khachNo = receivableDebts.reduce((sum: number, d: any) => sum + (d.amount || 0), 0);

        const noNCCSuppliers = new Set(payableDebts.map((d: any) => d.partner_id).filter(Boolean)).size;
        const khachNoCustomers = new Set(receivableDebts.map((d: any) => d.partner_id).filter(Boolean)).size;

        const noNCCOverdue = payableDebts
            .filter((d: any) => d.due_date && new Date(d.due_date) < now)
            .reduce((sum: number, d: any) => sum + (d.amount || 0), 0);
        const khachNoOverdue = receivableDebts
            .filter((d: any) => d.due_date && new Date(d.due_date) < now)
            .reduce((sum: number, d: any) => sum + (d.amount || 0), 0);

        const tonKhoValue = stockValue;

        const filteredSalesOrders = filterByDateRange(salesOrders, 'order_date', currentRange);
        const activeSalesOrders = filteredSalesOrders.filter((o: any) => o.status === OrderStatus.COMPLETED || o.status === OrderStatus.DELIVERED);
        const soDon = activeSalesOrders.length;
        const soDonCancelled = filteredSalesOrders.filter((o: any) => o.status === OrderStatus.CANCELLED).length;
        const soDonRevenue = activeSalesOrders.reduce((sum: number, o: any) => sum + (o.total_amount || 0), 0);

        const latestTransactions = [...transactions]
            .sort((a, b) => new Date(b.transaction_date).getTime() - new Date(a.transaction_date).getTime())
            .slice(0, 10);

        return {
            chartData,
            currentTotal,
            vsPreviousChange,
            vsLastYearChange,
            currentPeriodLabel: periodLabels[timeFilter.filter]?.current || 'Kỳ này',
            previousPeriodLabel: periodLabels[timeFilter.filter]?.previous || 'Kỳ trước',
            noNCC,
            noNCCSuppliers,
            noNCCOverdue,
            khachNo,
            khachNoCustomers,
            khachNoOverdue,
            tonKhoValue,
            soDon,
            soDonCancelled,
            soDonRevenue,
            latestTransactions,
        };

    }, [metricType, timeFilter, transactions, salesOrders, debts, stockValue]);

    const ChangeIndicator = ({ value }: { value: number | null }) => {
        if (value === null) {
            return <span className="text-[0.9rem] font-semibold text-gray-500">-- %</span>;
        }
        const color = value >= 0 ? 'text-green-500' : 'text-red-500';
        const arrow = value >= 0 ? '↑' : '↓';
        return (
            <span className={`text-[0.9rem] font-semibold ${color}`}>{Math.abs(value)}% {arrow}</span>
        );
    };

    return (
        <>
            <FilterBar onSearch={() => { }} onTimeFilterChange={handleTimeFilterChange} pageTitle={Page.Dashboard} initialFilter="Tháng này" />

            <div className="bg-white py-4 px-2 md:p-4 rounded-lg shadow-sm mt-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="relative">
                        <select
                            value={metricType}
                            onChange={e => setMetricType(e.target.value as MetricType)}
                            className="appearance-none text-[0.9rem] font-semibold bg-transparent pr-6 focus:outline-none"
                            style={{ fontWeight: 600 }}
                        >
                            {can('sales_orders', 'view') && <option value="sales">Doanh thu</option>}
                            {can('financial_transactions', 'view') && <option value="expenses">Chi phí</option>}
                        </select>
                        <ChevronDownIcon className="absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                    </div>
                </div>

                <div className="grid grid-cols-3 gap-2 text-left md:text-center border-b pb-4 mb-4">
                    <div>
                        <p className="text-[0.9rem] font-semibold text-gray-800" style={{ fontWeight: 600 }}>{processedData.currentTotal.toLocaleString('vi-VN')} ₫</p>
                        <p className="text-xs md:text-sm text-gray-500">{processedData.currentPeriodLabel}</p>
                    </div>
                    <div>
                        <ChangeIndicator value={processedData.vsPreviousChange} />
                        <p className="text-xs md:text-sm text-gray-500">{processedData.previousPeriodLabel}</p>
                    </div>
                    <div>
                        <ChangeIndicator value={processedData.vsLastYearChange} />
                        <p className="text-xs md:text-sm text-gray-500">Năm ngoái</p>
                    </div>
                </div>

                <div>
                    {processedData.chartData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <BarChart data={processedData.chartData} margin={{ top: 5, right: 8, left: -32, bottom: 5 }}>
                                <XAxis
                                    dataKey="name"
                                    tick={{ fontSize: 10 }}
                                    interval="preserveStartEnd"
                                    tickFormatter={(tick) => {
                                        const parts = tick.split('/');
                                        if (parts.length === 2 && (parts[0] === '1' || parseInt(parts[0]) % 5 === 0)) {
                                            return tick;
                                        }
                                        return '';
                                    }}
                                />
                                <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} tickFormatter={(value) => new Intl.NumberFormat('vi-VN', { notation: "compact", maximumFractionDigits: 1 }).format(value as number)} />
                                <Tooltip formatter={(value: number) => `${value.toLocaleString('vi-VN')} ₫`} />
                                <Bar dataKey="value" fill={metricType === 'sales' ? '#22c55e' : '#ef4444'} radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[250px] text-gray-500">
                            Không có dữ liệu cho khoảng thời gian này.
                        </div>
                    )}
                </div>

                <p className="text-center text-xs text-gray-400 mt-4">
                    Cập nhật lúc {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} ICT
                </p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                {(can('debt', 'view')) && (
                    <>
                        <SummaryCard
                            title="Nợ NCC"
                            value={`${formatLargeNumber(processedData.noNCC)} ₫`}
                            icon={<CongNoIcon />}
                            colorClass="bg-red-100 text-red-600"
                            linkTo="/cong-no?type=PAYABLE&status=OUTSTANDING"
                            subtitle={
                                processedData.noNCCSuppliers > 0
                                    ? (processedData.noNCCOverdue > 0
                                        ? `${processedData.noNCCSuppliers} NCC • Quá hạn: ${formatLargeNumber(processedData.noNCCOverdue)} ₫`
                                        : `${processedData.noNCCSuppliers} nhà cung cấp`)
                                    : 'Không có nợ'
                            }
                            tooltip={`Tổng nợ phải trả còn lại cho ${processedData.noNCCSuppliers} NCC. Quá hạn: ${processedData.noNCCOverdue.toLocaleString('vi-VN')} ₫`}
                        />
                        <SummaryCard
                            title="Khách nợ"
                            value={`${formatLargeNumber(processedData.khachNo)} ₫`}
                            icon={<CongNoIcon />}
                            colorClass="bg-green-100 text-green-600"
                            linkTo="/cong-no?type=RECEIVABLE&status=OUTSTANDING"
                            subtitle={
                                processedData.khachNoCustomers > 0
                                    ? (processedData.khachNoOverdue > 0
                                        ? `${processedData.khachNoCustomers} KH • Quá hạn: ${formatLargeNumber(processedData.khachNoOverdue)} ₫`
                                        : `${processedData.khachNoCustomers} khách hàng`)
                                    : 'Không có nợ'
                            }
                            tooltip={`Tổng nợ phải thu còn lại từ ${processedData.khachNoCustomers} khách. Quá hạn: ${processedData.khachNoOverdue.toLocaleString('vi-VN')} ₫`}
                        />
                    </>
                )}
                {can('inventory', 'view') && (
                    <SummaryCard
                        title="Tồn kho"
                        value={`${formatLargeNumber(processedData.tonKhoValue)} ₫`}
                        icon={<KhoIcon />}
                        colorClass="bg-blue-100 text-blue-600"
                        linkTo="/bao-cao/ton-kho"
                        subtitle={
                            loading
                                ? 'Đang tải...'
                                : stockTotalQty > 0
                                    ? `${stockSkuCount} SKU • ${stockTotalQty.toLocaleString('vi-VN')} đv${stockWithoutCost > 0 ? ` • ${stockWithoutCost} SKU thiếu giá vốn` : ''}`
                                    : (currentUser?.is_admin
                                        ? 'Chưa có dữ liệu — vào Tồn kho để đồng bộ'
                                        : 'Chưa có dữ liệu')
                        }
                        tooltip={`Tổng giá trị tồn kho theo GIÁ VỐN trung bình (weighted average từ lịch sử mua hàng). ${stockSkuCount} SKU có hàng, tổng ${stockTotalQty.toLocaleString('vi-VN')} đơn vị.${stockWithoutCost > 0 ? ` Lưu ý: ${stockWithoutCost} SKU không có lịch sử mua → tạm tính theo giá bán.` : ''}`}
                    />
                )}
                {can('sales_orders', 'view') && (
                    <SummaryCard
                        title={`Số đơn ${processedData.currentPeriodLabel.toLowerCase()}`}
                        value={String(processedData.soDon)}
                        icon={<DonHangIcon />}
                        colorClass="bg-indigo-100 text-indigo-600"
                        linkTo="/bao-cao/xuat-nhap"
                        subtitle={
                            processedData.soDon > 0
                                ? (processedData.soDonCancelled > 0
                                    ? `${formatLargeNumber(processedData.soDonRevenue)} ₫ • Hủy: ${processedData.soDonCancelled}`
                                    : `${formatLargeNumber(processedData.soDonRevenue)} ₫`)
                                : 'Không có đơn'
                        }
                        tooltip={`${processedData.soDon} đơn (loại trừ đã hủy). Doanh số ${processedData.soDonRevenue.toLocaleString('vi-VN')} ₫. ${processedData.soDonCancelled} đơn đã hủy không tính vào con số này.`}
                    />
                )}
            </div>

            {can('financial_transactions', 'view') && (
                <div className="bg-white p-4 rounded-lg shadow-sm mt-6">
                    <h2 className="text-lg font-bold text-gray-800 mb-3">Giao dịch mới nhất</h2>
                    <div className="space-y-2">
                        {processedData.latestTransactions.map((tx: FinancialTransaction) => (
                            <div
                                key={tx.id}
                                className="p-3 rounded-lg border cursor-pointer hover:bg-gray-50 transition-colors"
                                onClick={() => setModalItem(tx)}
                            >
                                <div className="flex justify-between items-start text-sm">
                                    <div className="pr-2">
                                        <p className="font-semibold text-gray-800 leading-tight">{tx.description}</p>
                                        <p className="text-xs text-gray-500 mt-0.5">{tx.category}</p>
                                    </div>
                                    <p className={`font-bold whitespace-nowrap ${tx.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'}`}>
                                        {tx.type === TransactionType.INCOME ? '+' : '-'} {tx.amount.toLocaleString('vi-VN')}₫
                                    </p>
                                </div>
                                <div className="flex justify-between items-center mt-1">
                                    <p className="text-xs text-gray-500">{tx.partner_name || 'Giao dịch nội bộ'}</p>
                                    <p className="text-xs text-gray-400">{formatDate(tx.transaction_date)}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <DetailModal item={modalItem} onClose={() => setModalItem(null)} onEditClick={handleEditClick} onDeleteClick={handleDeleteClick} showNotification={showNotification} />
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

export default Dashboard;