import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import * as XLSX from 'xlsx-js-style';
import { PlusIcon, DeleteIcon, ExcelIcon } from '../icons/Icons';
import { Partner, PartnerType, Product, User, SalesOrder, PurchaseOrder, OrderItem, OrderStatus, ReturnReason, ReturnHandlingMethod, ScrappingReason, TransactionType } from '../../types';
import { userService } from '../../src/services/userService';
import { partnerService } from '../../src/services/partnerService';
import { productService } from '../../src/services/productService';
import { accountService } from '../../src/services/accountService';
import { orderService } from '../../src/services/orderService';
import { transactionService } from '../../src/services/transactionService';
import { useBranch } from '../../contexts/BranchContext';
import { supabase } from '../../src/supabaseClient';
import SearchableSelect from '../ui/SearchableSelect';
import SearchableMultiSelect from '../ui/SearchableMultiSelect';
import PrintVoucherTemplate from '../print/PrintVoucherTemplate';
import { useNotification } from '../../contexts/NotificationContext';
import ConfirmationModal from './ConfirmationModal';

const HistoryIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
    </svg>
);

const NoteIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={className || "w-4 h-4"}>
        <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />
    </svg>
);

// Interfaces for fetched data
interface Account {
    id: string;
    name: string;
    bank_name?: string;
    account_number?: string;
    account_holder?: string;
    type?: string;
}

interface Category {
    id: string;
    name: string;
    type: TransactionType;
}

interface VoucherModalProps {
    isOpen: boolean;
    onClose: () => void;
    voucherType: string;
    initialData?: any;
}

interface VoucherItem {
    id: number;
    product: Product | null;
    quantity: number | string;
    price: number | string;
    notes: string;
}

const getVoucherTitle = (type: string) => {
    switch (type) {
        case 'income-expense-voucher': return 'Phiếu Thu/Chi';
        case 'purchase-order': return 'Phiếu Nhập Hàng';
        case 'delivery-note': return 'Phiếu Giao Hàng';
        case 'debt-notice': return 'Thông Báo Công Nợ';
        case 'return-voucher': return 'Phiếu Trả Hàng';
        case 'internal-transfer': return 'Phiếu Chuyển Kho Nội Bộ';
        case 'scrapping-voucher': return 'Phiếu Hủy Hàng';
        default: return 'Tạo Phiếu';
    }
};

interface DebtRow {
    id: string;
    isHeader?: boolean;
    date: string;
    code: string;
    description: string;
    unit: string;
    quantity: number | string;
    price: number | string;
    amount: number | string;
    debit: number | string;
    credit: number | string;
}

interface DebtNoticePreviewData {
    partner: Partner;
    partnerType: PartnerType;
    dateRange: { from: string, to: string };
    rows: DebtRow[];
    summary: {
        openingRemaining: number;
        totalIn: number;
        totalOut: number;
        closingRemaining: number;
    };
    bankInfo?: {
        bankName: string;
        accountNumber: string;
        accountHolder: string;
    };
}


const VoucherModal: React.FC<VoucherModalProps> = ({ isOpen, onClose, voucherType, initialData }) => {
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
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') handleRequestClose(); };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen]);
    const { showNotification } = useNotification();
    const { selectedFacilityId, currentUser, can } = useBranch();
    // Data State
    const [partners, setPartners] = useState<Partner[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [recentPricesData, setRecentPricesData] = useState<any[]>([]);
    const [isLoadingRecentPrices, setIsLoadingRecentPrices] = useState(false);
    const [recentPricesTargetItemId, setRecentPricesTargetItemId] = useState<string | null>(null);
    const [noteTargetItemId, setNoteTargetItemId] = useState<string | null>(null);
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [incomeCategories, setIncomeCategories] = useState<Category[]>([]);
    const [expenseCategories, setExpenseCategories] = useState<Category[]>([]);
    const [facilities, setFacilities] = useState<{ id: string, name: string }[]>([]);

    // State for local facility override if needed, otherwise uses selectedFacilityId from context
    const [localFacilityId, setLocalFacilityId] = useState<string>('');

    // Loading and Error State
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const isSavingRef = React.useRef(false);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // State for full voucher form
    const [items, setItems] = useState<VoucherItem[]>([]);
    const [partnerId, setPartnerId] = useState<string>('');
    const [voucherDate, setVoucherDate] = useState(new Date().toISOString().split('T')[0]);
    const [futureDateWarning, setFutureDateWarning] = useState<{
        isOpen: boolean;
        onConfirm: () => void;
        date: string;
    } | null>(null);
    const [assignedUserIds, setAssignedUserIds] = useState<string[]>([]);
    const [accountId, setAccountId] = useState<string>('');
    const [amountPaid, setAmountPaid] = useState<number | string>('');

    // State for debt notice form
    const [partnerTypeForNotice, setPartnerTypeForNotice] = useState<PartnerType>(PartnerType.CUSTOMER);
    const [selectedPartnerIdForNotice, setSelectedPartnerIdForNotice] = useState<string>('');
    const [dateRangeForNotice, setDateRangeForNotice] = useState({
        from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
        to: new Date().toISOString().split('T')[0]
    });
    const [bankName, setBankName] = useState('');
    const [accountNumber, setAccountNumber] = useState('');
    const [accountHolder, setAccountHolder] = useState('');
    const [selectedAdminAccountId, setSelectedAdminAccountId] = useState<string>('');
    const [previewData, setPreviewData] = useState<DebtNoticePreviewData | null>(null);

    // State for return voucher
    const [relatedOrderId, setRelatedOrderId] = useState<string>('');
    const [reason, setReason] = useState<ReturnReason>(ReturnReason.DAMAGED);
    const [handlingMethod, setHandlingMethod] = useState<ReturnHandlingMethod>(ReturnHandlingMethod.DEBT_DEDUCTION);
    const [returnFee, setReturnFee] = useState<number | string>('');
    const [discount, setDiscount] = useState<number | string>('');
    const [refundAccountId, setRefundAccountId] = useState('');
    const [returnNotes, setReturnNotes] = useState('');

    // State for return voucher live stock
    const [liveStockMap, setLiveStockMap] = useState<Record<string, number>>({});

    // State for internal transfer
    const [fromWarehouse, setFromWarehouse] = useState('');
    const [toWarehouse, setToWarehouse] = useState('');
    const [generalNotes, setGeneralNotes] = useState('');
    const [internalTransferCode, setInternalTransferCode] = useState('');
    // Products filtered by selected export warehouse (for internal transfer)
    const [transferProducts, setTransferProducts] = useState<Product[]>([]);
    const [isFetchingTransferProducts, setIsFetchingTransferProducts] = useState(false);

    // State for scrapping voucher
    const [scrappingReason, setScrappingReason] = useState<ScrappingReason>(ScrappingReason.DAMAGED);
    const [scrappingCode, setScrappingCode] = useState('');

    // State for simple income/expense voucher
    const [amount, setAmount] = useState<number | string>('');
    const [categoryId, setCategoryId] = useState('');
    const [description, setDescription] = useState('');
    const [transactionType, setTransactionType] = useState<TransactionType>(TransactionType.EXPENSE);

    const [isPrintPreview, setIsPrintPreview] = useState(false);

    // Handle Print Trigger
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') handleRequestClose();
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen]);

    useEffect(() => {
        if (isPrintPreview) {
            const timer = setTimeout(() => {
                try {
                    window.print();
                } catch (e) {
                    console.error("Print failed:", e);
                } finally {
                    setIsPrintPreview(false);
                    onClose();
                }
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isPrintPreview, onClose]);

    const getPrintData = () => {
        const partner = partners.find(p => p.id === partnerId);
        const assignedUsers = users.filter(u => assignedUserIds.includes(String(u.id)));
        const account = accounts.find(a => a.id === accountId);

        // Common data structure
        const baseData = {
            code: voucherType === 'internal-transfer' ? internalTransferCode : (voucherType === 'scrapping-voucher' ? scrappingCode : ''),
            date: voucherDate,
            partner: partner ? { name: partner.name, address: partner.address, phone: partner.phone, taxCode: partner.tax_code } : null,
            assignedUser: assignedUsers.map(u => u.full_name).join(', '),
            account: account ? account.name : '',
            notes: generalNotes || description || returnNotes,
        };

        if (voucherType === 'debt-notice') {
            return previewData;
        }

        if (voucherType === 'income-expense-voucher') {
            return {
                ...baseData,
                type: transactionType,
                amount: parseFloat(String(amount)) || 0,
                reason: description,
                // Category name?
                // category: ...
            };
        }

        // For item based vouchers
        return {
            ...baseData,
            items: items.map(item => ({
                sku: item.product?.sku,
                name: item.product?.name,
                unit: item.product?.unit,
                quantity: parseFloat(String(item.quantity)) || 0,
                price: parseFloat(String(item.price)) || 0,
                total: Math.round((parseFloat(String(item.quantity)) || 0) * (parseFloat(String(item.price)) || 0)),
            })),
            summary: {
                total: totalAmount,
                discount: parseFloat(String(discount)) || 0,
                paid: parseFloat(String(amountPaid)) || 0,
                remaining: totalAmount - (parseFloat(String(discount)) || 0) - (parseFloat(String(amountPaid)) || 0),
            },
            warehouse: facilities.find(f => f.id === fromWarehouse)?.name,
            toWarehouse: facilities.find(f => f.id === toWarehouse)?.name,
            reason: voucherType === 'return-voucher' ? reason : (voucherType === 'scrapping-voucher' ? scrappingReason : ''),
        };
    };


    // Derived customer from related order (TODO: Need to fetch real orders for return voucher)
    // For now we disable Return Voucher fetching or mock it until we update it properly
    const [salesOrders, setSalesOrders] = useState<SalesOrder[]>([]);
    const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
    const relatedOrder = useMemo(() => {
        if (initialData && initialData.id === relatedOrderId) {
            return initialData;
        }
        return salesOrders.find(o => o.id === relatedOrderId);
    }, [relatedOrderId, salesOrders, initialData]);

    const salesOrderOptions = useMemo(() => {
        const options = salesOrders.map(o => ({ id: o.id, name: `${o.code} - ${o.customer_name}` }));
        if (initialData && voucherType === 'return-voucher') {
            const exists = options.some(opt => opt.id === initialData.id);
            if (!exists) {
                options.unshift({ id: initialData.id, name: `${initialData.code} - ${initialData.customer_name}` });
            }
        }
        return options;
    }, [salesOrders, initialData, voucherType]);

    const availableProductsForReturn = useMemo(() => relatedOrder ? relatedOrder.items.map(item => item.product) : [], [relatedOrder]);

    const categoryOptions = transactionType === TransactionType.INCOME ? incomeCategories : expenseCategories;

    const [fetchStatus, setFetchStatus] = useState<Record<string, 'pending' | 'success' | 'fail'>>({});
    const [showDebug, setShowDebug] = useState(false);

    useEffect(() => {
        const withTimeout = async (promise: Promise<any>, name: string) => {
            const timeout = new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`${name} Timeout (10s)`)), 10000)
            );
            return Promise.race([promise, timeout]);
        };

        const fetchData = async () => {
            setIsLoading(true);
            setFetchError(null);
            const errors: string[] = [];
            const status: Record<string, 'pending' | 'success' | 'fail'> = {
                Partners: 'pending', Products: 'pending', Users: 'pending', Accounts: 'pending',
                IncCats: 'pending', ExpCats: 'pending', Facilities: 'pending', SalesOrders: 'pending', PurchaseOrders: 'pending'
            };
            setFetchStatus({ ...status });

            const loadResource = async (name: string, fetcher: () => Promise<any>, setter: (val: any) => void) => {
                try {
                    const data = await withTimeout(fetcher(), name);
                    setter(data);
                    status[name] = 'success';
                } catch (err: any) {
                    console.error(`[VoucherModal] Error loading ${name}:`, err);
                    status[name] = 'fail';
                    errors.push(`${name}:${err.message || 'Unknown'}`);
                }
                setFetchStatus({ ...status });
            };

            // Sequential fetching to pinpoint the hang
            await loadResource('Partners', () => partnerService.getPartners(), setPartners);
            await loadResource('Products', () => productService.getProducts(), setProducts);
            await loadResource('Users', () => userService.getUsers(), setUsers);
            await loadResource('Accounts', () => accountService.getAccounts(), setAccounts);
            await loadResource('IncCats', () => transactionService.getCategories(TransactionType.INCOME), setIncomeCategories as any);
            await loadResource('ExpCats', () => transactionService.getCategories(TransactionType.EXPENSE), setExpenseCategories as any);
            await loadResource('Facilities', () => transactionService.getFacilities(), setFacilities);
            await loadResource('SalesOrders', () => orderService.getSalesOrders(), setSalesOrders);
            await loadResource('PurchaseOrders', () => orderService.getPurchaseOrders(), setPurchaseOrders);

            if (errors.length > 0) {
                setFetchError(`Failures: ${errors.join(', ')}`);
            }
            setIsLoading(false);
        };

        if (isOpen) {
            fetchData();
            (window as any).forceFetchData = fetchData;
        }

        return () => {
            delete (window as any).forceFetchData;
        };
    }, [isOpen]);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    const canSeeAllFacilities = useMemo(() => {
        if (!currentUser) return true;
        return (
            currentUser.is_admin === true ||
            ['Admin', 'admin', 'Quản trị viên', 'Kế toán HO', 'Ban Lãnh đạo'].includes(currentUser.role || '')
        );
    }, [currentUser]);

    const userAvailableFacilities = useMemo(() => {
        if (canSeeAllFacilities || !currentUser) {
            return facilities;
        }
        const assignedIds = new Set((currentUser.assigned_facilities || []).map(f => String(f.id)));
        if (currentUser.facility_id) {
            assignedIds.add(String(currentUser.facility_id));
        }
        if (assignedIds.size === 0) {
            return facilities;
        }
        return facilities.filter(f => assignedIds.has(String(f.id)));
    }, [facilities, currentUser, canSeeAllFacilities]);

    // Set default facility based on current branch selection or user
    useEffect(() => {
        if (!canSeeAllFacilities && currentUser?.facility_id) {
            setLocalFacilityId(currentUser.facility_id);
            setFromWarehouse(currentUser.facility_id);
        } else if (selectedFacilityId) {
            setLocalFacilityId(selectedFacilityId);
        } else if (currentUser?.facility_id) {
            setLocalFacilityId(currentUser.facility_id);
        } else if (currentUser && facilities.length > 0) {
            const matchedFacility = facilities.find(f => f.name === currentUser.branch);
            if (matchedFacility) {
                setLocalFacilityId(matchedFacility.id);
            } else if (facilities.length > 0) {
                setLocalFacilityId(facilities[0].id);
            }
        }
    }, [currentUser, facilities, selectedFacilityId, canSeeAllFacilities]);

    useEffect(() => {
        if (voucherType === 'return-voucher' && relatedOrder) {
            if (relatedOrder.items && relatedOrder.items.length > 0) {
                setItems(relatedOrder.items.map((i: any) => ({
                    id: i.id || Date.now() + Math.random(),
                    product: i.product,
                    quantity: '', // Để trống số lượng trả hàng ban đầu theo yêu cầu
                    price: i.price,
                    notes: i.notes || '',
                    originalQuantity: i.quantity // Lưu số lượng mua gốc
                })));

                // Tải tồn kho live của sản phẩm tại chi nhánh xuất hàng của đơn gốc này
                const productIds = relatedOrder.items.map((i: any) => i.product?.id || i.product_id).filter(Boolean) as string[];
                if (productIds.length > 0) {
                    productService.getLiveStock(productIds, relatedOrder.facility_id)
                        .then(stockData => {
                            const newMap: Record<string, number> = {};
                            stockData.forEach(item => {
                                newMap[item.id] = item.quantity;
                            });
                            setLiveStockMap(newMap);
                        })
                        .catch(err => console.error("Failed to load live stock for return voucher:", err));
                }
            } else {
                setItems([{ id: 1, product: null, quantity: '', price: '', notes: '' }]);
            }
        }
    }, [relatedOrder, voucherType]);

    // This effect will run whenever the transactionType changes, ensuring category is valid
    useEffect(() => {
        if (voucherType === 'income-expense-voucher') {
            const currentCategoryExists = categoryOptions.some(c => c.id === categoryId);
            if (!currentCategoryExists) {
                setCategoryId('');
            }
        }
    }, [transactionType, voucherType, categoryId, categoryOptions]);

    useEffect(() => {
        // Reset form when modal opens for a new voucher type
        if (isOpen) {
            if (initialData && (voucherType === 'delivery-note' || voucherType === 'purchase-order')) {
                const isSales = voucherType === 'delivery-note';
                setPartnerId(isSales ? initialData.customer_id : initialData.supplier_id);
                setVoucherDate(initialData.order_date?.split('T')[0] || new Date().toISOString().split('T')[0]);
                setAssignedUserIds(initialData.assigned_user_ids || []);
                setAmountPaid(initialData.amount_paid || 0);
                setLocalFacilityId(initialData.facility_id || '');
                setGeneralNotes(initialData.notes || '');
                setAccountId(initialData.account_id || ''); // NEW: Load account selection

                if (initialData.items && initialData.items.length > 0) {
                    setItems(initialData.items.map((i: any) => ({
                        id: i.id || Date.now() + Math.random(),
                        product: i.product,
                        quantity: i.quantity,
                        price: i.price,
                        notes: i.notes || ''
                    })));
                } else {
                    setItems([{ id: 1, product: null, quantity: '', price: '', notes: '' }]);
                }
            } else if (initialData && voucherType === 'return-voucher') {
                setRelatedOrderId(initialData.id);
                setPartnerId(initialData.customer_id || '');
                setVoucherDate(new Date().toISOString().split('T')[0]);
                setAssignedUserIds(currentUser?.id ? [String(currentUser.id)] : []);
                setReturnFee('');
                setDiscount('');
                setRefundAccountId('');
                setReturnNotes(`Trả hàng cho đơn ${initialData.code}`);

                if (initialData.items && initialData.items.length > 0) {
                    setItems(initialData.items.map((i: any) => ({
                        id: i.id || Date.now() + Math.random(),
                        product: i.product,
                        quantity: '', // Để trống số lượng trả hàng ban đầu theo yêu cầu
                        price: i.price,
                        notes: i.notes || '',
                        originalQuantity: i.quantity // Lưu số lượng mua gốc
                    })));
                } else {
                    setItems([{ id: 1, product: null, quantity: '', price: '', notes: '' }]);
                }
            } else {
                // Reset for full voucher form
                setItems([{ id: 1, product: null, quantity: '', price: '', notes: '' }]);
                setPartnerId('');
                setVoucherDate(new Date().toISOString().split('T')[0]);
                setAssignedUserIds(currentUser?.id ? [String(currentUser.id)] : []);
                setAccountId('');
                setAmountPaid('');
                setGeneralNotes('');
            }

            // Reset for debt notice form
            setPartnerTypeForNotice(PartnerType.CUSTOMER);
            setSelectedPartnerIdForNotice('');
            setDateRangeForNotice({
                from: new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
                to: new Date().toISOString().split('T')[0]
            });
            setPreviewData(null);
            setSelectedAdminAccountId('');

            // Reset for return voucher form
            if (voucherType !== 'return-voucher' || !initialData) {
                setRelatedOrderId('');
                setReason(ReturnReason.DAMAGED);
                setHandlingMethod(ReturnHandlingMethod.DEBT_DEDUCTION);
                setReturnFee('');
                setDiscount('');
                setRefundAccountId('');
                setReturnNotes('');
            }


            // Reset for internal transfer and scrapping form
            setFromWarehouse('');
            setToWarehouse('');
            setScrappingReason(ScrappingReason.DAMAGED);

            // Reset for income/expense form
            setAmount('');
            setCategoryId('');
            setDescription('');
            setTransactionType(TransactionType.EXPENSE);

            if (voucherType === 'internal-transfer') {
                const newCode = `PCK${String(Math.floor(Math.random() * 900000) + 100000)}`;
                setInternalTransferCode(newCode);
            }
            if (voucherType === 'scrapping-voucher' && !initialData) {
                const newCode = `PHH${String(Math.floor(Math.random() * 900000) + 100000)}`;
                setScrappingCode(newCode);
            }
        }
    }, [isOpen, voucherType, initialData]);

    // Re-fetch products filtered by fromWarehouse whenever user changes the export warehouse
    useEffect(() => {
        if (voucherType !== 'internal-transfer') return;
        // Clear stale product selections in all rows when warehouse changes
        setItems(prev => prev.map(item => ({ ...item, product: null })));
        if (!fromWarehouse) {
            setTransferProducts([]);
            return;
        }
        const fetchTransferProducts = async () => {
            setIsFetchingTransferProducts(true);
            try {
                const data = await productService.getProducts(fromWarehouse);
                setTransferProducts(data);
            } catch (err) {
                console.error('[VoucherModal] Error fetching transfer products:', err);
                setTransferProducts([]);
            } finally {
                setIsFetchingTransferProducts(false);
            }
        };
        fetchTransferProducts();
    }, [fromWarehouse, voucherType]);

    const handleAddItem = () => {
        setItems([...items, { id: Date.now(), product: null, quantity: '', price: '', notes: '' }]);
    };

    const handleRemoveItem = (id: number) => {
        setItems(items.filter(item => item.id !== id));
    };

    const handleItemChange = (id: number, field: keyof VoucherItem, value: any) => {
        setItems(items.map(item => {
            if (item.id === id) {
                const updatedItem = { ...item, [field]: value };
                if (field === 'product' && updatedItem.product) {
                    updatedItem.price = updatedItem.product.price; // Auto-fill price
                    updatedItem.quantity = 1;
                }
                return updatedItem;
            }
            return item;
        }));
    };

    const handleProductSelect = (id: number, productId: string) => {
        const selectedProduct = products.find(p => p.id === productId) || null;
        handleItemChange(id, 'product', selectedProduct);
    };

    const totalAmount = useMemo(() => {
        return items.reduce((sum, item) => sum + Math.round((parseFloat(String(item.quantity)) || 0) * (parseFloat(String(item.price)) || 0)), 0);
    }, [items]);

    // Tên tài khoản nợ mặc định theo loại phiếu
    const defaultDebtAccountName = voucherType === 'delivery-note' ? 'TK KN' : 'TK Nợ NCC';
    const amountPaidNum = parseFloat(String(amountPaid)) || 0;
    const defaultDebtAccount = useMemo(
        () => accounts.find(a => a.name === defaultDebtAccountName),
        [accounts, defaultDebtAccountName]
    );

    const returnVoucherNetTotal = useMemo(() => (totalAmount - (parseFloat(String(returnFee)) || 0) - (parseFloat(String(discount)) || 0)), [totalAmount, returnFee, discount]);

    const handleFetchRecentPrices = async (itemId: number, productId: string) => {
        if (!partnerId) {
            showNotification("Vui lòng chọn đối tác trước khi xem giá gần nhất.", "warning");
            return;
        }
        setRecentPricesTargetItemId(itemId.toString());
        setIsLoadingRecentPrices(true);
        try {
            const isSales = voucherType === 'delivery-note';
            const data = await orderService.getRecentPrices(partnerId, productId, isSales ? 'SALES' : 'PURCHASE');
            setRecentPricesData(data);
        } catch (error) {
            console.error("Error fetching recent prices:", error);
            showNotification("Không thể tải giá gần nhất.", "error");
            setRecentPricesData([]);
        } finally {
            setIsLoadingRecentPrices(false);
        }
    };

    const handleApplyRecentPrice = (itemId: number, price: number) => {
        handleItemChange(itemId, 'price', price);
        setRecentPricesTargetItemId(null); // Close the popover
    };

    const handleExport = () => {
        const partner = partners.find(p => p.id === partnerId);
        const assignedUsers = users.filter(u => assignedUserIds.includes(String(u.id)));
        const account = accounts.find(a => a.id === accountId);
        const dataToExport = {
            voucherType: getVoucherTitle(voucherType),
            date: voucherDate,
            partner: partner ? { name: partner.name, address: partner.address } : null,
            assignedUser: assignedUsers.map(u => u.full_name).join(', '),
            account: account ? account.name : null,
            items: items.map(item => ({
                sku: item.product?.sku,
                name: item.product?.name,
                unit: item.product?.unit,
                quantity: parseFloat(String(item.quantity)) || 0,
                price: parseFloat(String(item.price)) || 0,
                total: Math.round((parseFloat(String(item.quantity)) || 0) * (parseFloat(String(item.price)) || 0)),
                notes: item.notes
            })),
            summary: {
                total: totalAmount,
                discount: parseFloat(String(discount)) || 0,
                paid: parseFloat(String(amountPaid)) || 0,
                remaining: totalAmount - (parseFloat(String(discount)) || 0) - (parseFloat(String(amountPaid)) || 0),
            }
        };
        console.log("Data for Excel Export:", JSON.stringify(dataToExport, null, 2));
        showNotification('Dữ liệu đã được chuẩn bị và in ra console. (Kiểm tra bằng cách nhấn F12)', 'info');
    };

    const handleSaveDraft = () => {
        handleConfirm(false, OrderStatus.PENDING);
    };

    const handleConfirm = async (shouldPrint = false, status: OrderStatus | string = OrderStatus.COMPLETED) => {
        const proceed = () => executeConfirm(shouldPrint, status);
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        if (voucherDate > todayStr) {
            setFutureDateWarning({
                isOpen: true,
                onConfirm: () => {
                    setFutureDateWarning(null);
                    proceed();
                },
                date: voucherDate
            });
            return;
        }
        await proceed();
    };

    const executeConfirm = async (shouldPrint = false, status: OrderStatus | string = OrderStatus.COMPLETED) => {
        if (isSavingRef.current) return;
        const module = voucherType === 'delivery-note' ? 'sales_orders' : (voucherType === 'purchase-order' ? 'purchase_orders' : 'inventory');
        if (!can(module, 'create')) {
            showNotification("Bạn không có quyền tạo loại phiếu này.", "error");
            return;
        }
        try {
            isSavingRef.current = true;
            setIsSaving(true);
            if (voucherType === 'delivery-note' || voucherType === 'purchase-order') {
                const isSales = voucherType === 'delivery-note';

                const validItems = items.filter(item => item.product && item.product.id && Number(item.quantity) > 0);

                if (!partnerId || validItems.length === 0) {
                    showNotification("Vui lòng chọn đối tác và chọn ít nhất 1 sản phẩm với số lượng lớn hơn 0.", "warning");
                    return;
                }

                if (!localFacilityId && !selectedFacilityId) {
                    showNotification("Vui lòng chọn cơ sở.", "warning");
                    return;
                }

                // --- Smart account resolution ---
                let resolvedAccountId = accountId;
                if (amountPaidNum > 0) {
                    // Khách/NCC đã thanh toán: bắt buộc phải chọn tài khoản
                    if (!accountId) {
                        showNotification(
                            isSales
                                ? "Khách đã thanh toán, vui lòng chọn tài khoản tiền vào."
                                : "Đã trả NCC, vui lòng chọn tài khoản tiền ra.",
                            "warning"
                        );
                        return;
                    }
                } else {
                    // Chưa thanh toán: tự động dùng tài khoản nợ mặc định
                    if (defaultDebtAccount) {
                        resolvedAccountId = defaultDebtAccount.id;
                    } else {
                        showNotification(
                            `Không tìm thấy tài khoản "${defaultDebtAccountName}" trong hệ thống. Vui lòng kiểm tra danh mục tài khoản.`,
                            "error"
                        );
                        return;
                    }
                }
                // --- End smart account resolution ---

                const payload = {
                    code: (initialData && initialData.code) ? initialData.code : `${isSales ? 'SO' : 'PO'}-${Date.now()}`,
                    partnerId,
                    facilityId: localFacilityId || selectedFacilityId || '',
                    assignedUserIds: assignedUserIds,
                    orderDate: voucherDate,
                    status: status as OrderStatus,
                    items: validItems.map(item => ({
                        productId: item.product?.id || '',
                        quantity: Number(item.quantity) || 0,
                        price: Number(item.price) || 0,
                        notes: item.notes
                    })),
                    totalAmount: totalAmount,
                    amountPaid: amountPaidNum,
                    discount: Number(discount) || 0,
                    notes: generalNotes,
                    accountId: resolvedAccountId || undefined
                };

                // Stock Validation for Sales (Delivery Note) — fetch LIVE stock from DB.
                // When editing an order that was already COMPLETED, its quantities have already
                // been deducted from live stock. Add them back before comparing, otherwise
                // re-saving the same order (e.g. just to fix the price) falsely triggers
                // "không đủ tồn kho".
                if (isSales && status !== OrderStatus.PENDING) {
                    const productIdsToCheck = validItems.map(i => i.product?.id).filter(Boolean) as string[];
                    // Tồn được kiểm tra theo facility của phiếu này (vgvina_inventory)
                    const orderFacility = (payload.facilityId as string) || undefined;
                    const liveStock = await productService.getLiveStock(productIdsToCheck, orderFacility);
                    const availableMap = new Map<string, number>();
                    for (const ls of liveStock) availableMap.set(ls.id, Number(ls.quantity) || 0);

                    const isEditingCompleted = !!(initialData && initialData.id && initialData.status === OrderStatus.COMPLETED);
                    if (isEditingCompleted && Array.isArray(initialData.items)) {
                        for (const oldItem of initialData.items) {
                            const pid = oldItem.product_id || oldItem.productId || oldItem.product?.id;
                            if (!pid) continue;
                            availableMap.set(pid, (availableMap.get(pid) ?? 0) + (Number(oldItem.quantity) || 0));
                        }
                    }

                    for (const item of validItems) {
                        if (!item.product) continue;
                        const availableQty = availableMap.get(item.product.id) ?? 0;
                        if (Number(item.quantity) > availableQty) {
                            showNotification(`Sản phẩm "${item.product.name}" không đủ tồn kho (Hiện có: ${availableQty}, Yêu cầu: ${item.quantity})`, "warning");
                            return;
                        }
                    }
                }

                if (isSales) {
                    if (initialData && initialData.id) {
                        await orderService.updateSalesOrder(initialData.id, payload);
                    } else {
                        await orderService.createSalesOrder(payload);
                    }
                } else {
                    if (initialData && initialData.id) {
                        await orderService.updatePurchaseOrder(initialData.id, payload);
                    } else {
                        await orderService.createPurchaseOrder(payload);
                    }
                }

                if (shouldPrint) {
                    setIsPrintPreview(true);
                } else {
                    showNotification(initialData ? "Cập nhật đơn thành công!" : "Tạo đơn thành công!", "success");
                    onClose();
                }
            } else if (voucherType === 'internal-transfer') {
                const validItems = items.filter(item => item.product && item.product.id && Number(item.quantity) > 0);

                if (!fromWarehouse || !toWarehouse || validItems.length === 0) {
                    showNotification("Vui lòng chọn kho xuất, kho nhập và chọn ít nhất 1 sản phẩm với số lượng lớn hơn 0.", "warning");
                    return;
                }

                // Stock Validation for Internal Transfer
                if (status !== OrderStatus.PENDING) {
                    const isEditingActiveTransfer = !!(initialData && initialData.id && (initialData.status === 'PENDING' || initialData.status === 'COMPLETED'));
                    const oldQtyMap = new Map<string, number>();
                    if (isEditingActiveTransfer && Array.isArray(initialData.items)) {
                        for (const oldItem of initialData.items) {
                            const pid = oldItem.product_id || oldItem.productId || oldItem.product?.id;
                            if (pid) {
                                oldQtyMap.set(pid, (oldQtyMap.get(pid) ?? 0) + (Number(oldItem.quantity) || 0));
                            }
                        }
                    }

                    for (const item of validItems) {
                        if (item.product) {
                            const oldQty = oldQtyMap.get(item.product.id) ?? 0;
                            const availableQty = item.product.quantity + oldQty;
                            if (Number(item.quantity) > availableQty) {
                                showNotification(`Sản phẩm "${item.product.name}" không đủ tồn kho tại kho xuất (Hiện có: ${availableQty}, Yêu cầu: ${item.quantity})`, "warning");
                                return;
                            }
                        }
                    }
                }
                await orderService.createInternalTransfer({
                    code: internalTransferCode,
                    transferDate: voucherDate,
                    fromFacilityId: fromWarehouse,
                    toFacilityId: toWarehouse,
                    assignedUserIds: assignedUserIds,
                    items: validItems.map(item => ({
                        productId: item.product?.id || '',
                        quantity: Number(item.quantity) || 0,
                        notes: item.notes
                    })),
                    notes: generalNotes,
                    status: status
                });
                showNotification(status === OrderStatus.PENDING ? "Lưu tạm phiếu chuyển kho thành công!" : "Tạo phiếu chuyển kho thành công!", "success");
                onClose();
            } else if (voucherType === 'scrapping-voucher') {
                if (!localFacilityId && !selectedFacilityId) {
                    showNotification("Vui lòng chọn cơ sở.", "warning");
                    return;
                }
                const validItems = items.filter(item => item.product && item.product.id && Number(item.quantity) > 0);
                if (validItems.length === 0) {
                    showNotification("Vui lòng chọn ít nhất 1 sản phẩm với số lượng lớn hơn 0.", "warning");
                    return;
                }
                await orderService.createScrappingVoucher({
                    code: scrappingCode,
                    scrappingDate: voucherDate,
                    facilityId: localFacilityId || selectedFacilityId || '',
                    assignedUserIds: assignedUserIds,
                    reason: scrappingReason,
                    items: validItems.map(item => ({
                        productId: item.product?.id || '',
                        quantity: Number(item.quantity) || 0,
                        notes: item.notes
                    })),
                    notes: generalNotes,
                    status: status
                });
                showNotification(status === OrderStatus.PENDING ? "Lưu tạm phiếu hủy hàng thành công!" : "Tạo phiếu hủy hàng thành công!", "success");
                onClose();
            } else if (voucherType === 'return-voucher') {
                const validItems = items.filter(item => item.product && item.product.id && Number(item.quantity) > 0);
                if (!relatedOrderId || validItems.length === 0) {
                    showNotification("Vui lòng chọn đơn hàng liên quan và chọn ít nhất 1 sản phẩm với số lượng lớn hơn 0.", "warning");
                    return;
                }
                await orderService.createReturnVoucher({
                    code: `RET-${Date.now()}`,
                    returnDate: voucherDate,
                    relatedOrderId: relatedOrderId,
                    assignedUserIds: assignedUserIds,
                    reason: reason,
                    handlingMethod: handlingMethod,
                    items: validItems.map(item => ({
                        productId: item.product?.id || '',
                        quantity: Number(item.quantity) || 0,
                        price: Number(item.price) || 0,
                        notes: item.notes
                    })),
                    returnFee: Number(returnFee) || 0,
                    discount: Number(discount) || 0,
                    refundAccountId: refundAccountId || undefined,
                    notes: returnNotes,
                    status: status,
                    facilityId: relatedOrder?.facility_id || undefined,
                    partnerId: partnerId || undefined
                });
                showNotification(status === OrderStatus.PENDING ? "Lưu tạm phiếu hàng trả thành công!" : "Tạo phiếu hàng trả thành công!", "success");
                onClose();
            } else {
                if (voucherType === 'debt-notice') {
                    if (shouldPrint) {
                        setIsPrintPreview(true);
                    } else {
                        onClose();
                    }
                    return;
                }

                showNotification("Tính năng lưu cho loại phiếu này đang phát triển. (Nhưng có thể in thử)", "info");
                if (shouldPrint) {
                    setIsPrintPreview(true);
                } else {
                    onClose();
                }
            }
        } catch (error) {
            console.error("Error creating order:", error);
            showNotification("Có lỗi xảy ra khi tạo đơn: " + (error as any).message, "error");
        } finally {
            isSavingRef.current = false;
            setIsSaving(false);
        }
    };

    const handleConfirmIncomeExpense = async (shouldPrint = false) => {
        const proceed = () => executeConfirmIncomeExpense(shouldPrint);
        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        if (voucherDate > todayStr) {
            setFutureDateWarning({
                isOpen: true,
                onConfirm: () => {
                    setFutureDateWarning(null);
                    proceed();
                },
                date: voucherDate
            });
            return;
        }
        await proceed();
    };

    const executeConfirmIncomeExpense = async (shouldPrint = false) => {
        if (isSavingRef.current) return;
        if (!can('financial_transactions', 'create')) {
            showNotification("Bạn không có quyền tạo phiếu thu/chi.", "error");
            return;
        }
        const partner = partners.find(p => p.id === partnerId);
        const selectedUsers = users.filter(u => assignedUserIds.includes(String(u.id)));
        const account = accounts.find(a => a.id === accountId);
        const category = categoryOptions.find(c => c.id === categoryId);
        const numericAmount = parseFloat(String(amount)) || 0;

        if (assignedUserIds.length === 0 || !account || !category || numericAmount <= 0) {
            showNotification('Vui lòng điền đầy đủ các trường bắt buộc (*): Người thực hiện, Tài khoản, Hạng mục và Số tiền phải lớn hơn 0.', 'warning');
            return;
        }

        if (!localFacilityId && !selectedFacilityId) {
            showNotification("Vui lòng chọn cơ sở.", "warning");
            return;
        }

        try {
            isSavingRef.current = true;
            setIsSaving(true);
            await transactionService.createFinancialTransaction({
                type: transactionType,
                amount: numericAmount,
                categoryId: category.id,
                description: description,
                partnerId: partner?.id,
                facilityId: selectedFacilityId,
                accountId: account.id,
                assignedUserIds: assignedUserIds,
                transactionDate: voucherDate,
                operatorName: currentUser?.name || 'Hệ thống'
            });

            if (shouldPrint) {
                setIsPrintPreview(true);
            } else {
                showNotification(`Đã xác nhận thành công Phiếu ${transactionType === TransactionType.INCOME ? 'Thu' : 'Chi'}`, 'success');
                onClose();
            }
        } catch (error) {
            console.error("Error creating transaction:", error);
            showNotification("Lỗi khi tạo phiếu thu/chi: " + (error as any).message, 'error');
        } finally {
            isSavingRef.current = false;
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    const renderIncomeExpenseForm = () => {
        return (
            <>
                <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="space-y-1">
                            <label className="font-medium text-gray-700">Ngày <span className="text-red-500">*</span></label>
                            <input type="date" value={voucherDate} onChange={e => setVoucherDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div className="space-y-1">
                            <label className="font-medium text-gray-700">Loại phiếu <span className="text-red-500">*</span></label>
                            <div className="flex items-center space-x-4 p-2 border border-gray-300 rounded-md">
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="transactionType" value={TransactionType.EXPENSE} checked={transactionType === TransactionType.EXPENSE} onChange={() => setTransactionType(TransactionType.EXPENSE)} className="h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500" />
                                    <span className="ml-2 text-gray-700">Chi</span>
                                </label>
                                <label className="flex items-center cursor-pointer">
                                    <input type="radio" name="transactionType" value={TransactionType.INCOME} checked={transactionType === TransactionType.INCOME} onChange={() => setTransactionType(TransactionType.INCOME)} className="h-4 w-4 text-green-600 border-gray-300 focus:ring-green-500" />
                                    <span className="ml-2 text-gray-700">Thu</span>
                                </label>
                            </div>
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="font-medium text-gray-700">Hạng mục <span className="text-red-500">*</span></label>
                            <SearchableSelect
                                options={categoryOptions.map(c => ({ id: c.id, name: c.name }))}
                                value={categoryId}
                                onChange={setCategoryId}
                                placeholder={isLoading ? "Đang tải hạng mục..." : (categoryOptions.length === 0 ? "Không có hạng mục nào" : `Chọn hạng mục (${categoryOptions.length})`)}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="font-medium text-gray-700">Số tiền <span className="text-red-500">*</span></label>
                            <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" required />
                        </div>
                        <div className="space-y-1">
                            <label className="font-medium text-gray-700">Đối tượng</label>
                            <SearchableSelect
                                options={partners.map(p => ({ id: p.id, name: p.name }))}
                                value={partnerId}
                                onChange={setPartnerId}
                                placeholder={`Chọn đối tượng (${partners.length})`}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="font-medium text-gray-700">Tài khoản <span className="text-red-500">*</span></label>
                            <SearchableSelect
                                options={accounts.map(a => ({ id: a.id, name: a.name }))}
                                value={accountId}
                                onChange={setAccountId}
                                placeholder={`Chọn tài khoản (${accounts.length})`}
                                required
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="font-medium text-gray-700">Người thực hiện <span className="text-red-500">*</span></label>
                            <SearchableMultiSelect
                                options={users.map(u => ({ id: u.id, name: u.full_name }))}
                                selectedIds={assignedUserIds}
                                onChange={(ids) => setAssignedUserIds(ids.map(String))}
                                placeholder={`Chọn người thực hiện (${users.length})`}
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="font-medium text-gray-700">Cơ sở</label>
                            <SearchableSelect
                                options={userAvailableFacilities.map(f => ({ id: f.id, name: f.name }))}
                                value={localFacilityId}
                                onChange={setLocalFacilityId}
                                placeholder={`Chọn cơ sở (${userAvailableFacilities.length})`}
                                disabled={!canSeeAllFacilities}
                            />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                            <label className="font-medium text-gray-700">Mô tả</label>
                            <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full p-2 border border-gray-300 rounded-md"></textarea>
                        </div>
                    </div>
                </div>
                <div className="border-t p-4 flex justify-end items-center bg-gray-50 rounded-b-lg gap-2">
                    <button type="button" onClick={handleRequestClose} className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap">
                        Hủy
                    </button>
                    <button type="button" onClick={handleSaveDraft} className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap">
                        Lưu tạm
                    </button>
                    <button type="button" onClick={() => handleConfirmIncomeExpense(true)} className="px-4 py-2 text-sm font-medium bg-[#0066cc] text-white rounded-md hover:bg-[#0052a3] whitespace-nowrap">
                        Xác nhận & In
                    </button>
                    <button type="button" onClick={() => handleConfirmIncomeExpense(false)} className="px-4 py-2 text-sm font-medium bg-[#0066cc] text-white rounded-md hover:bg-[#0052a3] whitespace-nowrap">
                        Xác nhận
                    </button>
                </div>
            </>
        )
    };

    const renderFullVoucherForm = () => (
        <>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <label className="font-medium text-gray-700">{voucherType === 'purchase-order' ? 'Nhà cung cấp' : 'Khách hàng'}</label>
                        <SearchableSelect
                            options={partners.filter(p => {
                                const typeToCheck = voucherType === 'purchase-order' ? PartnerType.SUPPLIER : PartnerType.CUSTOMER;
                                return p.type === typeToCheck || String(p.type).toUpperCase() === typeToCheck;
                            }).map(p => ({ id: p.id, name: p.name }))}
                            value={partnerId}
                            onChange={setPartnerId}
                            placeholder="Chọn đối tác"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="font-medium text-gray-700">Ngày</label>
                        <input type="date" value={voucherDate} onChange={e => setVoucherDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div className="space-y-1">
                        <label className="font-medium text-gray-700">Mã phiếu</label>
                        <input type="text" placeholder="Tự động tạo hoặc nhập tay" className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    {/* Tài khoản: chỉ hiện khi đã nhập số tiền thanh toán */}
                    {amountPaidNum > 0 ? (
                        <div className="space-y-1">
                            <label className="font-medium text-gray-700">
                                Tài khoản <span className="text-red-500">*</span>
                                <span className="ml-2 text-xs text-gray-500">(bắt buộc khi có thanh toán)</span>
                            </label>
                            <SearchableSelect
                                options={accounts.map(acc => ({ id: acc.id, name: acc.name }))}
                                value={accountId}
                                onChange={setAccountId}
                                placeholder="Chọn tài khoản tiền vào/ra"
                            />
                        </div>
                    ) : (
                        <div className="space-y-1">
                            <label className="font-medium text-gray-700">Tài khoản</label>
                            <div className="flex items-center gap-2 w-full p-2 border border-dashed border-gray-300 rounded-md bg-gray-50 text-sm text-gray-500">
                                <span className="text-blue-500">⚡</span>
                                <span>Tự động ghi vào: <strong className="text-gray-700">{defaultDebtAccountName}</strong></span>
                                {defaultDebtAccount
                                    ? <span className="ml-auto text-green-600 text-xs">✓ Tìm thấy</span>
                                    : <span className="ml-auto text-red-500 text-xs">⚠ Không tìm thấy</span>
                                }
                            </div>
                        </div>
                    )}
                    <div className="space-y-1">
                        <label className="font-medium text-gray-700">Cơ sở</label>
                        <SearchableSelect
                            options={userAvailableFacilities.map(f => ({ id: f.id, name: f.name }))}
                            value={localFacilityId}
                            onChange={setLocalFacilityId}
                            placeholder="Chọn cơ sở"
                            disabled={!canSeeAllFacilities}
                        />
                    </div>
                    {voucherType === 'delivery-note' && (
                        <div className="space-y-1">
                            <label className="font-medium text-gray-700">Phụ trách</label>
                            <SearchableMultiSelect
                                options={users.map(u => ({ id: u.id, name: u.full_name }))}
                                selectedIds={assignedUserIds}
                                onChange={(ids) => setAssignedUserIds(ids.map(String))}
                                placeholder="Chọn nhân viên"
                            />
                        </div>
                    )}
                    <div className="space-y-1 md:col-span-2">
                        <label className="font-medium text-gray-700">Ghi chú</label>
                        <textarea
                            value={generalNotes}
                            onChange={(e) => setGeneralNotes(e.target.value)}
                            rows={2}
                            placeholder="Ghi chú thêm về đơn hàng..."
                            className="w-full p-2 border border-gray-300 rounded-md text-sm"
                        />
                    </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto border-t pt-4">
                    <table className="w-full text-sm">
                        <thead className="text-left text-gray-600">
                            <tr>
                                <th className="p-2 w-1/12">Stt</th>
                                <th className="p-2 w-4/12">Tên mặt hàng</th>
                                <th className="p-2 w-2/12">Số lượng</th>
                                <th className="p-2 w-2/12">Đơn giá</th>
                                <th className="p-2 w-2/12">Thành tiền</th>
                                <th className="p-2 w-1/12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <React.Fragment key={item.id}>
                                    <tr className="border-b">
                                        <td className="p-1 text-center">{index + 1}</td>
                                        <td className="p-1">
                                            <SearchableSelect
                                                options={(() => {
                                                    const targetFacilityId = voucherType === 'internal-transfer' ? fromWarehouse : (localFacilityId || selectedFacilityId);
                                                    return products.map(p => {
                                                        const inv = (p as any).inventoryByFacility?.find((i: any) => i.facility_id === targetFacilityId);
                                                        const qty = inv?.quantity ?? 0;
                                                        return {
                                                            id: p.id,
                                                            name: `${p.sku || ''} - ${p.name} (SL: ${qty})`
                                                        };
                                                    });
                                                })()}
                                                value={item.product?.id || ''}
                                                onChange={(val) => handleProductSelect(item.id, val)}
                                                placeholder="Chọn sản phẩm"
                                                className="w-full"
                                            />
                                        </td>
                                        <td className="p-1">
                                            <input
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                                className="w-full p-1.5 border border-gray-300 rounded-md text-sm"
                                            />
                                        </td>
                                        <td className="p-1 relative">
                                            <div className="flex items-center gap-1">
                                                <input
                                                    type="number"
                                                    value={item.price}
                                                    onChange={(e) => handleItemChange(item.id, 'price', e.target.value)}
                                                    className="w-full p-1.5 border border-gray-300 rounded-md text-sm"
                                                />
                                                {item.product && (voucherType === 'delivery-note' || voucherType === 'purchase-order') && (
                                                    <button 
                                                        onClick={() => handleFetchRecentPrices(item.id as any, item.product!.id)}
                                                        className="p-1.5 text-gray-500 hover:text-[#0066cc] bg-gray-100 border border-gray-200 rounded-md transition-colors"
                                                        title="Xem giá bán/nhập gần nhất"
                                                    >
                                                        <HistoryIcon />
                                                    </button>
                                                )}
                                            </div>
                                            {/* Recent Prices Popover */}
                                            {recentPricesTargetItemId === item.id.toString() && (
                                                <div className="absolute top-10 right-0 w-80 bg-white border shadow-xl rounded-md z-50 p-3">
                                                    <div className="flex justify-between items-center mb-2 border-b pb-1">
                                                        <span className="font-semibold text-sm text-gray-700">Giá bán gần nhất</span>
                                                        <button onClick={() => setRecentPricesTargetItemId(null)} className="text-gray-400 hover:text-gray-600">✕</button>
                                                    </div>
                                                    {isLoadingRecentPrices ? (
                                                        <div className="text-xs text-center py-4 text-gray-500">Đang tải...</div>
                                                    ) : recentPricesData.length === 0 ? (
                                                        <div className="text-xs text-center py-4 text-gray-500">Đối tác này chưa từng mua/bán mặt hàng này.</div>
                                                    ) : (
                                                        <div className="max-h-48 overflow-y-auto">
                                                            <table className="w-full text-xs text-left">
                                                                <thead className="bg-gray-50 text-gray-600">
                                                                    <tr>
                                                                        <th className="p-1 font-medium">Mã phiếu/Ngày</th>
                                                                        <th className="p-1 font-medium text-right">SL</th>
                                                                        <th className="p-1 font-medium text-right">Đơn giá</th>
                                                                        <th className="p-1 font-medium text-center"></th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody>
                                                                    {recentPricesData.map((rp: any, idx) => (
                                                                        <tr key={idx} className="border-b last:border-0 hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => handleApplyRecentPrice(item.id as any, rp.price)}>
                                                                            <td className="p-1 py-2">
                                                                                <div className="font-medium text-blue-600">{rp.code}</div>
                                                                                <div className="text-gray-500 text-[10px]">{new Date(rp.date).toLocaleDateString('vi-VN')}</div>
                                                                            </td>
                                                                            <td className="p-1 py-2 text-right text-gray-600">
                                                                                {rp.quantity}
                                                                            </td>
                                                                            <td className="p-1 py-2 text-right font-medium text-gray-800">
                                                                                {Number(rp.price).toLocaleString('vi-VN')}
                                                                            </td>
                                                                            <td className="p-1 py-2 text-center">
                                                                                <button 
                                                                                    className="px-2 py-1 bg-green-50 text-green-600 hover:bg-green-600 hover:text-white rounded text-[10px] whitespace-nowrap transition-colors"
                                                                                >
                                                                                    Áp dụng
                                                                                </button>
                                                                            </td>
                                                                        </tr>
                                                                    ))}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-1 text-right font-medium pr-2">{Math.round((parseFloat(String(item.quantity)) || 0) * (parseFloat(String(item.price)) || 0)).toLocaleString('vi-VN')}</td>
                                        <td className="p-1 text-center whitespace-nowrap">
                                            <button 
                                                onClick={() => setNoteTargetItemId(noteTargetItemId === item.id ? null : item.id)} 
                                                className={`p-1 mr-1 rounded transition-colors ${item.notes ? 'text-blue-600 bg-blue-50' : 'text-gray-400 hover:text-blue-500 hover:bg-gray-100'}`}
                                                title="Ghi chú nội bộ cho sản phẩm"
                                            >
                                                <NoteIcon className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 hover:bg-red-50 rounded p-1 transition-colors" title="Xóa dòng">
                                                <DeleteIcon className="w-4 h-4" />
                                            </button>
                                        </td>
                                    </tr>
                                    {(noteTargetItemId === item.id || item.notes) && (
                                        <tr className="bg-blue-50/20 border-b">
                                            <td colSpan={6} className="p-2 pb-3">
                                                <div className="flex items-start gap-2 max-w-2xl px-2">
                                                    <span className="mt-1.5 text-blue-500 opacity-70 flex-shrink-0" title="Ghi chú về mặt hàng này">
                                                        <NoteIcon className="w-4 h-4" />
                                                    </span>
                                                    <textarea 
                                                        value={item.notes || ''} 
                                                        onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                                                        placeholder="Nhập ghi chú riêng cho sản phẩm này..."
                                                        className="w-full text-sm p-2 border border-blue-200 rounded focus:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-400 bg-white"
                                                        rows={2}
                                                    />
                                                </div>
                                            </td>
                                        </tr>
                                    )}
                                </React.Fragment>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button onClick={handleAddItem} className="flex items-center gap-2 text-sm font-medium text-[#0066cc] hover:underline mt-2">
                    <PlusIcon className="w-4 h-4" /> Thêm dòng
                </button>

                {/* Summary */}
                <div className="border-t pt-4 mt-4 space-y-2 text-right text-sm">
                    <div className="flex justify-end items-center gap-4">
                        <span className="font-medium text-gray-600">Tổng cộng:</span>
                        <span className="font-semibold text-gray-800 w-36">{totalAmount.toLocaleString('vi-VN')} ₫</span>
                    </div>
                    <div className="flex justify-end items-center gap-4">
                        <span className="font-medium text-gray-600">Giảm giá:</span>
                        <input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-36 p-1.5 border border-gray-300 rounded-md text-sm text-right" />
                    </div>
                    <div className="flex justify-end items-center gap-4">
                        <span className="font-medium text-gray-600">Đã thanh toán:</span>
                        <input type="number" value={amountPaid} onChange={(e) => setAmountPaid(e.target.value)} className="w-36 p-1.5 border border-gray-300 rounded-md text-sm text-right" />
                    </div>
                    <div className="flex justify-end items-center gap-4">
                        <span className="font-medium text-gray-600">Còn lại:</span>
                        <span className="font-semibold text-red-600 w-36">{(totalAmount - (parseFloat(String(discount)) || 0) - (parseFloat(String(amountPaid)) || 0)).toLocaleString('vi-VN')} ₫</span>
                    </div>
                </div>
            </div>
            <div className="border-t p-4 flex justify-between items-center bg-gray-50 rounded-b-lg">
                <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white border border-green-700 rounded-md hover:bg-green-700 whitespace-nowrap">
                    <ExcelIcon className="w-4 h-4" /> Xác nhận & Xuất Excel
                </button>
                <div className="flex items-center gap-2">
                    <button onClick={handleRequestClose} className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap">
                        Hủy
                    </button>
                    <button type="button" onClick={handleSaveDraft} className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap">
                        Lưu tạm
                    </button>
                    <button onClick={() => handleConfirm(true)} className="px-4 py-2 text-sm font-medium bg-[#0066cc] text-white rounded-md hover:bg-[#0052a3] whitespace-nowrap">
                        Xác nhận & In
                    </button>
                    <button onClick={() => handleConfirm(false)} className="px-4 py-2 text-sm font-medium bg-[#0066cc] text-white rounded-md hover:bg-[#0052a3] whitespace-nowrap">
                        Xác nhận
                    </button>
                </div>
            </div>
        </>
    );

    const renderDebtNoticeForm = () => {
        const filteredPartners = partners.filter(p => p.type === partnerTypeForNotice);

        const handleGeneratePreview = async () => {
            const partner = partners.find(p => p.id === selectedPartnerIdForNotice);
            if (!partner) {
                showNotification("Vui lòng chọn đối tác.", "warning");
                return;
            }

            const fromDateObj = new Date(dateRangeForNotice.from);
            fromDateObj.setHours(0, 0, 0, 0);
            const toDateObj = new Date(dateRangeForNotice.to);
            toDateObj.setHours(23, 59, 59, 999);

            let allOrders = partnerTypeForNotice === PartnerType.CUSTOMER
                ? salesOrders.filter(o => o.customer_name === partner.name)
                : purchaseOrders.filter(o => (o as any).supplier_name === partner.name);

            const allPaymentsRaw = await transactionService.getTransactions('All', undefined, undefined, undefined, selectedPartnerIdForNotice);
            const allPayments = allPaymentsRaw.filter(t => t.account_name !== 'TK KN' && t.account_name !== 'TK Nợ NCC');

            // Fetch Return Vouchers related to partner's orders
            const partnerOrderIds = allOrders.map(o => o.id);
            let partnerReturns: any[] = [];
            if (partnerOrderIds.length > 0) {
                const { data: returnVouchers, error: returnError } = await supabase
                    .from('vgvina_return_vouchers')
                    .select(`
                        id, code, return_date, return_fee, discount, status, notes, handling_method, related_order_id,
                        items:vgvina_return_voucher_items (
                            id,
                            quantity,
                            price,
                            notes,
                            product:product_id ( id, name, sku, unit )
                        )
                    `)
                    .in('status', ['COMPLETED', 'APPROVED']);

                if (returnError) {
                    console.error("Lỗi khi tải phiếu trả hàng:", returnError);
                } else {
                    partnerReturns = (returnVouchers || []).filter(r => partnerOrderIds.includes(r.related_order_id));
                }
            }

            const getReturnNetTotal = (r: any) => {
                const itemsTotal = (r.items || []).reduce((sum: number, item: any) => 
                    sum + Math.round(Number(item.quantity || 0) * Number(item.price || 0)), 0);
                return itemsTotal - Number(r.return_fee || 0) - Number(r.discount || 0);
            };

            // Calculate return before period
            const returnsBefore = partnerReturns.filter(r => new Date(r.return_date) < fromDateObj);
            const returnedBefore = returnsBefore.reduce((sum, r) => sum + getReturnNetTotal(r), 0);

            // Calculate initial balance
            let openingRemaining = 0;
            const ordersBefore = allOrders.filter(o => new Date(o.order_date) < fromDateObj);
            const paymentsBefore = allPayments.filter(t => new Date(t.transaction_date) < fromDateObj);

            const orderedBefore = ordersBefore.reduce((sum, o) => sum + o.total_amount, 0);
            let paidBefore = 0;
            if (partnerTypeForNotice === PartnerType.CUSTOMER) {
                paidBefore = paymentsBefore.filter(t => t.type === TransactionType.INCOME).reduce((sum, t) => sum + Number(t.amount), 0);
            } else {
                paidBefore = paymentsBefore.filter(t => t.type === TransactionType.EXPENSE).reduce((sum, t) => sum + Number(t.amount), 0);
            }
            openingRemaining = orderedBefore - paidBefore - returnedBefore;

            // In-period rows
            const inPeriodOrders = allOrders.filter(o => {
                const d = new Date(o.order_date); return d >= fromDateObj && d <= toDateObj;
            });
            const validPaymentsInPeriod = allPayments.filter(t => {
                const d = new Date(t.transaction_date); return d >= fromDateObj && d <= toDateObj;
            }).filter(t => partnerTypeForNotice === PartnerType.CUSTOMER ? t.type === TransactionType.INCOME : t.type === TransactionType.EXPENSE);
            const returnsInPeriod = partnerReturns.filter(r => {
                const d = new Date(r.return_date); return d >= fromDateObj && d <= toDateObj;
            });

            let totalIn = 0;
            let totalOut = 0;
            const rowEvents: { type: string, date: number, data: any }[] = [];

            inPeriodOrders.forEach(o => {
                const d = new Date(o.order_date);
                rowEvents.push({ type: 'order', date: d.getTime(), data: o });
            });
            validPaymentsInPeriod.forEach(t => {
                const d = new Date(t.transaction_date);
                rowEvents.push({ type: 'payment', date: d.getTime(), data: t });
            });
            returnsInPeriod.forEach(r => {
                const d = new Date(r.return_date);
                rowEvents.push({ type: 'return', date: d.getTime(), data: r });
            });
            rowEvents.sort((a, b) => a.date - b.date);

            const generatedRows: DebtRow[] = [];
            rowEvents.forEach(ev => {
                if (ev.type === 'order') {
                    const o = ev.data;
                    const dateStr = new Date(o.order_date).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
                    totalIn += o.total_amount;
                    generatedRows.push({
                        id: o.id, isHeader: true, date: dateStr, code: o.code, 
                        description: partnerTypeForNotice === PartnerType.CUSTOMER ? 'Bán hàng' : 'Nhập hàng',
                        unit: '', quantity: '', price: '', amount: '',
                        debit: partnerTypeForNotice === PartnerType.CUSTOMER ? o.total_amount : '',
                        credit: partnerTypeForNotice === PartnerType.SUPPLIER ? o.total_amount : ''
                    });
                    if (o.items && o.items.length > 0) {
                        o.items.forEach((item: OrderItem) => {
                            const isShip = item.product?.name?.toLowerCase().includes('vận chuyển');
                            generatedRows.push({
                                id: item.id + '_it', isHeader: false, date: '', code: item.product?.sku || '', description: item.product?.name || (item as any).product_name || '',
                                unit: item.product?.unit || (isShip ? 'lần' : ''), quantity: item.quantity, price: item.price, amount: Math.round(item.quantity * item.price),
                                debit: '', credit: ''
                            });
                        });
                    }
                } else if (ev.type === 'payment') {
                    const t = ev.data;
                    const dateStr = new Date(t.transaction_date).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
                    totalOut += Number(t.amount);
                    generatedRows.push({
                        id: t.id, isHeader: true, date: dateStr, code: t.code, description: 'Thanh toán',
                        unit: '', quantity: '', price: '', amount: '',
                        debit: partnerTypeForNotice === PartnerType.SUPPLIER ? Number(t.amount) : '',
                        credit: partnerTypeForNotice === PartnerType.CUSTOMER ? Number(t.amount) : ''
                    });
                    if (t.description) {
                        generatedRows.push({
                            id: t.id + '_desc', isHeader: false, date: '', code: '', description: t.description,
                            unit: '', quantity: '', price: '', amount: '', debit: '', credit: ''
                        });
                    }
                } else if (ev.type === 'return') {
                    const r = ev.data;
                    const dateStr = new Date(r.return_date).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });
                    const netTotal = getReturnNetTotal(r);
                    totalOut += netTotal;

                    generatedRows.push({
                        id: r.id, isHeader: true, date: dateStr, code: r.code,
                        description: partnerTypeForNotice === PartnerType.CUSTOMER ? 'Khách trả hàng' : 'Trả hàng cho NCC',
                        unit: '', quantity: '', price: '', amount: '',
                        debit: partnerTypeForNotice === PartnerType.SUPPLIER ? netTotal : '',
                        credit: partnerTypeForNotice === PartnerType.CUSTOMER ? netTotal : ''
                    });

                    if (r.items && r.items.length > 0) {
                        r.items.forEach((item: any) => {
                            generatedRows.push({
                                id: item.id + '_ret_it', isHeader: false, date: '', code: item.product?.sku || '', description: item.product?.name || item.product_name || '',
                                unit: item.product?.unit || '', quantity: item.quantity, price: item.price, amount: Math.round(item.quantity * item.price),
                                debit: '', credit: ''
                            });
                        });
                    }

                    if (Number(r.return_fee) > 0 || Number(r.discount) > 0) {
                        const feeDesc = [];
                        if (Number(r.return_fee) > 0) feeDesc.push(`Phí trả hàng: ${Number(r.return_fee).toLocaleString('vi-VN')}đ`);
                        if (Number(r.discount) > 0) feeDesc.push(`Giảm giá: ${Number(r.discount).toLocaleString('vi-VN')}đ`);
                        generatedRows.push({
                            id: r.id + '_fee_desc', isHeader: false, date: '', code: '', description: `(${feeDesc.join(', ')})`,
                            unit: '', quantity: '', price: '', amount: '', debit: '', credit: ''
                        });
                    }
                }
            });

            setPreviewData({
                partner, partnerType: partnerTypeForNotice, dateRange: dateRangeForNotice,
                rows: generatedRows,
                summary: { openingRemaining, totalIn, totalOut, closingRemaining: openingRemaining + totalIn - totalOut },
                bankInfo: { bankName, accountNumber, accountHolder }
            });
        };

        const handleDebtNoticeExport = () => {
            if (!previewData) return;
            const wb = XLSX.utils.book_new();
            const dateStr = `Từ ngày ${new Date(previewData.dateRange.from).toLocaleDateString('vi-VN')} đến ngày ${new Date(previewData.dateRange.to).toLocaleDateString('vi-VN')}`;

            // Define styles
            const headerStyle = { font: { bold: true, name: 'Arial', sz: 16, color: { rgb: '003366' } }, alignment: { horizontal: 'center', vertical: 'center' } };
            const labelStyle = { font: { bold: true, name: 'Arial', sz: 10, color: { rgb: '333333' } } };

            const tableHeaderStyle = {
                font: { bold: true, name: 'Arial', sz: 10, color: { rgb: 'FFFFFF' } },
                alignment: { horizontal: 'center', vertical: 'center' },
                fill: { type: 'pattern', pattern: 'solid', fgColor: { rgb: '0070C0' } },
                border: {
                    top: { style: 'thin', color: { rgb: '000000' } },
                    bottom: { style: 'thin', color: { rgb: '000000' } },
                    left: { style: 'thin', color: { rgb: '000000' } },
                    right: { style: 'thin', color: { rgb: '000000' } }
                }
            };

            const borderThin = { style: 'thin', color: { rgb: 'E5E7EB' } };

            const wsData: any[][] = [
                [],
                ['SỔ CHI TIẾT CÔNG NỢ'],
                [dateStr],
                ['Khách hàng', previewData.partner.name, null, null, null, 'Nợ đầu kỳ', previewData.summary.openingRemaining],
                ['Mã KH', previewData.partner.phone || '', null, null, null, 'Phát sinh trong kỳ', previewData.summary.totalIn, previewData.summary.totalOut],
                ['Điện thoại', previewData.partner.phone || '', null, null, null, 'Nợ cuối kỳ', previewData.summary.closingRemaining],
                [],
                ['Thời gian', 'Mã', 'Diễn giải', 'ĐVT', 'Số lượng', 'Giá bán/trả', 'Thành tiền', 'Ghi nợ', 'Ghi có'],
            ];

            previewData.rows.forEach(r => {
                wsData.push([
                    r.date, r.code, r.description, r.unit, r.quantity, r.price, r.amount, r.debit, r.credit
                ]);
            });

            const ws = XLSX.utils.aoa_to_sheet(wsData);
            const range = XLSX.utils.decode_range(ws['!ref']!);

            ws['!merges'] = [
                { s: { r: 1, c: 0 }, e: { r: 1, c: 8 } },
                { s: { r: 2, c: 0 }, e: { r: 2, c: 8 } },
                { s: { r: 3, c: 1 }, e: { r: 3, c: 4 } },
                { s: { r: 4, c: 1 }, e: { r: 4, c: 4 } },
                { s: { r: 5, c: 1 }, e: { r: 5, c: 4 } },
            ];

            ws['!cols'] = [{ wch: 15 }, { wch: 15 }, { wch: 35 }, { wch: 8 }, { wch: 10 }, { wch: 12 }, { wch: 15 }, { wch: 15 }, { wch: 15 }];

            for (let R = 0; R <= range.e.r; ++R) {
                for (let C = 0; C <= range.e.c; ++C) {
                    const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                    if (!ws[cellRef] && R === 7) ws[cellRef] = { v: '', t: 's' };
                    if (!ws[cellRef]) continue;

                    const cell = ws[cellRef];

                    if (R === 1) cell.s = headerStyle;
                    else if (R === 2) cell.s = { font: { italic: true, name: 'Arial', sz: 10, color: { rgb: '666666' } }, alignment: { horizontal: 'center' } };
                    else if (R >= 3 && R <= 5) {
                        cell.s = { font: { name: 'Arial', sz: 10 }, alignment: { vertical: 'center' } };
                        if (C === 0 || C === 5) cell.s = labelStyle;
                        if (C >= 6 && typeof cell.v === 'number') {
                            cell.z = '#,##0';
                            cell.s = { ...labelStyle, alignment: { horizontal: 'right' } };
                            if (R === 4 && C === 6) cell.s.font.color = { rgb: 'C00000' }; // Phát sinh Nợ
                            if (R === 4 && C === 7) cell.s.font.color = { rgb: '00B050' }; // Phát sinh Có
                            if (R === 5 && C === 6) cell.s.font.color = { rgb: '0070C0' }; // Nợ cuối kỳ
                        }
                    } else if (R === 7) {
                        cell.s = tableHeaderStyle;
                    } else if (R > 7) {
                        cell.s = {
                            font: { name: 'Arial', sz: 10 },
                            alignment: { vertical: 'center' },
                            border: { bottom: borderThin, left: borderThin, right: borderThin, top: borderThin }
                        };
                        const isHeaderRow = previewData.rows[R - 8]?.isHeader;
                        if (isHeaderRow) {
                            cell.s.font.bold = true;
                            cell.s.fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'F9F9F9' } };
                        }

                        if (C >= 4 && typeof cell.v === 'number') {
                            cell.z = '#,##0';
                            cell.s.alignment = { horizontal: 'right', vertical: 'center' };
                        } else if (C === 0 || C === 1 || C === 3) {
                            cell.s.alignment = { horizontal: 'center', vertical: 'center' };
                        }

                        if (C === 7 && typeof cell.v === 'number') {
                            cell.z = '#,##0';
                            cell.s.font.color = { rgb: 'C00000' };
                            cell.s.alignment = { horizontal: 'right', vertical: 'center' };
                        }
                        if (C === 8 && typeof cell.v === 'number') {
                            cell.z = '#,##0';
                            cell.s.font.color = { rgb: '00B050' };
                            cell.s.alignment = { horizontal: 'right', vertical: 'center' };
                        }
                    }
                }
            }
            XLSX.utils.book_append_sheet(wb, ws, 'CongNoChiTiet');
            XLSX.writeFile(wb, `CongNo_${previewData.partner.name}_${new Date().getTime()}.xlsx`);
            showNotification('Xuất Excel thành công!', 'success');
        };

        const renderPreview = () => {
            if (!previewData) return null;
            const { partner, rows, summary, dateRange, bankInfo } = previewData;

            return (
                <div className="p-4 border rounded-lg bg-gray-50 text-xs mt-4">
                    <div className="text-center mb-4">
                        <h2 className="font-bold text-base">Công nợ chi tiết khách hàng</h2>
                        <p>Từ ngày {new Date(dateRange.from).toLocaleDateString('vi-VN')} đến ngày {new Date(dateRange.to).toLocaleDateString('vi-VN')}</p>
                    </div>

                    <div className="grid grid-cols-2 mb-4">
                        <div>
                            <p><span className="font-bold w-24 inline-block">Khách hàng</span>: {partner.name}</p>
                            <p><span className="font-bold w-24 inline-block">Mã KH</span>: {partner.phone || ''}</p>
                            <p><span className="font-bold w-24 inline-block">Điện thoại</span>: {partner.phone || ''}</p>
                        </div>
                        <div className="text-right flex flex-col items-end gap-1">
                            <div className="flex gap-4 w-64"><span className="font-bold w-32 text-left">Nợ đầu kỳ</span> <span className="flex-1 text-right">{summary.openingRemaining.toLocaleString('vi-VN')}</span></div>
                            <div className="flex gap-4 w-64"><span className="font-bold w-32 text-left">Phát sinh trong kỳ</span> <span className="flex-1 text-right">{summary.totalIn.toLocaleString('vi-VN')}</span><span className="flex-1 text-right text-green-600">{summary.totalOut.toLocaleString('vi-VN')}</span></div>
                            <div className="flex gap-4 w-64"><span className="font-bold w-32 text-left">Nợ cuối kỳ</span> <span className="flex-1 text-right font-bold text-red-600">{summary.closingRemaining.toLocaleString('vi-VN')}</span></div>
                        </div>
                    </div>

                    <table className="w-full border-collapse border border-gray-300">
                        <thead className="bg-gray-200 font-bold">
                            <tr>
                                <td className="border p-1 text-center">Thời gian</td>
                                <td className="border p-1 text-center">Mã</td>
                                <td className="border p-1 text-center">Diễn giải</td>
                                <td className="border p-1 text-center">ĐVT</td>
                                <td className="border p-1 text-center">Số lượng</td>
                                <td className="border p-1 text-center">Giá bán/trả</td>
                                <td className="border p-1 text-center">Thành tiền</td>
                                <td className="border p-1 text-center">Ghi nợ</td>
                                <td className="border p-1 text-center">Ghi có</td>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.map(r => (
                                <tr key={r.id} className={r.isHeader ? 'font-bold bg-white' : 'text-gray-600 bg-gray-50'}>
                                    <td className="border-b border-l border-r border-gray-300 border-dotted p-1 text-center">{r.date}</td>
                                    <td className="border-b border-l border-r border-gray-300 border-dotted p-1">{r.code}</td>
                                    <td className="border-b border-l border-r border-gray-300 border-dotted p-1" style={{ paddingLeft: r.isHeader ? '4px' : '20px' }}>{r.description}</td>
                                    <td className="border-b border-l border-r border-gray-300 border-dotted p-1 text-center">{r.unit}</td>
                                    <td className="border-b border-l border-r border-gray-300 border-dotted p-1 text-right">{r.quantity}</td>
                                    <td className="border-b border-l border-r border-gray-300 border-dotted p-1 text-right">{typeof r.price === 'number' ? r.price.toLocaleString('vi-VN') : r.price}</td>
                                    <td className="border-b border-l border-r border-gray-300 border-dotted p-1 text-right">{typeof r.amount === 'number' ? r.amount.toLocaleString('vi-VN') : r.amount}</td>
                                    <td className="border-b border-l border-r border-gray-300 border-dotted p-1 text-right text-red-600">{typeof r.debit === 'number' ? r.debit.toLocaleString('vi-VN') : r.debit}</td>
                                    <td className="border-b border-l border-r border-gray-300 border-dotted p-1 text-right text-green-600">{typeof r.credit === 'number' ? r.credit.toLocaleString('vi-VN') : r.credit}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {partnerTypeForNotice === PartnerType.CUSTOMER && (
                        <div className="mt-4 italic text-xs text-gray-500">
                            <p>Quý khách vui lòng thanh toán bằng TM hoặc CK theo thông tin tài khoản dưới đây:</p>
                            <p>- Ngân hàng: <span className="font-bold">{bankInfo?.bankName || '...'}</span></p>
                            <p>- Số tài khoản: <span className="font-bold">{bankInfo?.accountNumber || '...'}</span></p>
                            <p>- Chủ tài khoản: <span className="font-bold">{bankInfo?.accountHolder || '...'}</span></p>
                        </div>
                    )}
                </div>
            );
        };

        return (
            <>
                <div className="p-6 max-h-[65vh] overflow-y-auto">
                    {/* Controls */}
                    <div className="space-y-4">
                        <div className="flex items-center p-1 bg-gray-200 rounded-lg">
                            <button onClick={() => setPartnerTypeForNotice(PartnerType.CUSTOMER)} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${partnerTypeForNotice === PartnerType.CUSTOMER ? 'bg-white text-[#0066cc] shadow' : 'text-gray-600'}`}>Công nợ Khách hàng</button>
                            <button onClick={() => setPartnerTypeForNotice(PartnerType.SUPPLIER)} className={`flex-1 py-2 text-sm font-semibold rounded-md transition-colors ${partnerTypeForNotice === PartnerType.SUPPLIER ? 'bg-white text-[#0066cc] shadow' : 'text-gray-600'}`}>Công nợ NCC</button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div className="space-y-1 col-span-3 md:col-span-1">
                                <label className="font-medium text-gray-700 text-sm">Đối tác</label>
                                <SearchableSelect
                                    options={filteredPartners.map(p => ({ id: p.id, name: p.name }))}
                                    value={selectedPartnerIdForNotice}
                                    onChange={setSelectedPartnerIdForNotice}
                                    placeholder="Chọn đối tác"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium text-gray-700 text-sm">Từ ngày</label>
                                <input type="date" value={dateRangeForNotice.from} onChange={e => setDateRangeForNotice({ ...dateRangeForNotice, from: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium text-gray-700 text-sm">Đến ngày</label>
                                <input type="date" value={dateRangeForNotice.to} onChange={e => setDateRangeForNotice({ ...dateRangeForNotice, to: e.target.value })} className="w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                        </div>

                        {/* Admin Account Selection for Auto-fill */}
                        <div className="space-y-1">
                            <label className="font-medium text-gray-700 text-sm">Chọn tài khoản mẫu (Auto-fill)</label>
                            <SearchableSelect
                                options={accounts.filter(a => a.type !== 'Tiền mặt').map(a => ({ id: a.id, name: a.name }))}
                                value={selectedAdminAccountId}
                                onChange={(val) => {
                                    setSelectedAdminAccountId(val);
                                    const acc = accounts.find(a => a.id === val);
                                    if (acc) {
                                        setBankName(acc.bank_name || '');
                                        setAccountNumber(acc.account_number || '');
                                        setAccountHolder(acc.account_holder || '');
                                    }
                                }}
                                placeholder="-- Chọn tài khoản để tự động điền --"
                            />
                        </div>

                        {/* Bank Info Fields */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                            <div className="space-y-1">
                                <label className="font-medium text-blue-800 text-xs">Ngân hàng</label>
                                <input
                                    type="text"
                                    value={bankName}
                                    onChange={e => setBankName(e.target.value)}
                                    placeholder="Ví dụ: Vietcombank"
                                    className="w-full p-2 text-sm border border-blue-200 rounded-md"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium text-blue-800 text-xs">Số tài khoản</label>
                                <input
                                    type="text"
                                    value={accountNumber}
                                    onChange={e => setAccountNumber(e.target.value)}
                                    placeholder="Số tài khoản"
                                    className="w-full p-2 text-sm border border-blue-200 rounded-md"
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium text-blue-800 text-xs">Chủ tài khoản</label>
                                <input
                                    type="text"
                                    value={accountHolder}
                                    onChange={e => setAccountHolder(e.target.value)}
                                    placeholder="Tên chủ tài khoản"
                                    className="w-full p-2 text-sm border border-blue-200 rounded-md"
                                />
                            </div>
                        </div>
                        <button onClick={handleGeneratePreview} className="w-full px-4 py-2 text-sm font-medium bg-[#0066cc] text-white rounded-md hover:bg-[#0052a3]">
                            Xem công nợ
                        </button>
                    </div>
                    {/* Preview */}
                    {renderPreview()}
                </div>
                <div className="border-t p-4 flex justify-end items-center bg-gray-50 rounded-b-lg gap-2">
                    <button onClick={handleDebtNoticeExport} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-green-600 text-white border border-green-700 rounded-md hover:bg-green-700 whitespace-nowrap">
                        <ExcelIcon className="w-4 h-4" /> Xuất Excel
                    </button>
                    <button onClick={() => handleConfirm(true)} className="px-4 py-2 text-sm font-medium bg-[#0066cc] text-white rounded-md hover:bg-[#0052a3] whitespace-nowrap">
                        In thông báo
                    </button>
                    <button onClick={handleRequestClose} className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap">
                        Đóng
                    </button>
                </div>
            </>
        )
    };

    const renderReturnVoucherForm = () => {
        return (
            <>
                <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                    {/* General Info */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-sm font-semibold px-2">Thông tin chung</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1">
                                <label className="font-medium text-gray-700">Đơn hàng gốc <span className="text-red-500">*</span></label>
                                <SearchableSelect
                                    options={salesOrderOptions}
                                    value={relatedOrderId}
                                    onChange={setRelatedOrderId}
                                    placeholder="Chọn đơn hàng"
                                    required
                                />
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium text-gray-700">Khách hàng</label>
                                <input type="text" value={relatedOrder?.customer_name || ''} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-100" />
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium text-gray-700">Ngày trả hàng <span className="text-red-500">*</span></label>
                                <input type="date" value={voucherDate} onChange={e => setVoucherDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                            </div>
                            <div className="space-y-1">
                                <label className="font-medium text-gray-700">Người xử lý <span className="text-red-500">*</span></label>
                                <SearchableMultiSelect
                                    options={users.map(u => ({ id: u.id, name: u.full_name }))}
                                    selectedIds={assignedUserIds}
                                    onChange={(ids) => setAssignedUserIds(ids.map(String))}
                                    placeholder="Chọn nhân viên"
                                />
                            </div>
                        </div>
                    </fieldset>

                    {/* Items Table */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-sm font-semibold px-2">Chi tiết hàng trả</legend>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="text-left text-gray-600">
                                    <tr>
                                        <th className="p-2 w-1/12">#</th>
                                        <th className="p-2 w-4/12">Tên mặt hàng</th>
                                        <th className="p-2 w-1.5/12 text-center">SL mua gốc</th>
                                        <th className="p-2 w-1.5/12 text-center">Tồn hiện tại</th>
                                        <th className="p-2 w-1.5/12 text-center">SL trả</th>
                                        <th className="p-2 w-1.5/12">Đơn giá</th>
                                        <th className="p-2 w-1.5/12">Thành tiền</th>
                                        <th className="p-2 w-0.5/12"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {items.map((item, index) => {
                                        const originalQty = (item as any).originalQuantity ?? '';
                                        const liveStock = item.product ? (liveStockMap[item.product.id] ?? 0) : 0;
                                        return (
                                            <tr key={item.id} className="border-b">
                                                <td className="p-1 text-center">{index + 1}</td>
                                                <td className="p-1">
                                                    <SearchableSelect
                                                        options={availableProductsForReturn.filter(p => p !== null).map(p => ({
                                                            id: p!.id,
                                                            name: `${p!.sku || ''} - ${p!.name}`
                                                        }))}
                                                        value={item.product?.id || ''}
                                                        onChange={(val) => handleProductSelect(item.id, val)}
                                                        placeholder="Chọn sản phẩm"
                                                        disabled={!relatedOrder}
                                                    />
                                                </td>
                                                <td className="p-1 text-center text-gray-600 font-medium">{originalQty}</td>
                                                <td className="p-1 text-center text-blue-600 font-semibold">{liveStock}</td>
                                                <td className="p-1">
                                                    <input 
                                                        type="number" 
                                                        value={item.quantity} 
                                                        onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} 
                                                        className="w-full p-1.5 border border-gray-300 rounded-md text-center"
                                                        placeholder="0"
                                                    />
                                                </td>
                                                <td className="p-1">
                                                    <input 
                                                        type="number" 
                                                        value={item.price} 
                                                        onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} 
                                                        className="w-full p-1.5 border border-gray-300 rounded-md" 
                                                    />
                                                </td>
                                                <td className="p-1 text-right font-medium">{Math.round((parseFloat(String(item.quantity)) || 0) * (parseFloat(String(item.price)) || 0)).toLocaleString('vi-VN')}</td>
                                                <td className="p-1 text-center">
                                                    <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 p-1">
                                                        <DeleteIcon className="w-4 h-4" />
                                                    </button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                        <button onClick={handleAddItem} className="flex items-center gap-2 text-sm font-medium text-[#0066cc] hover:underline mt-2">
                            <PlusIcon className="w-4 h-4" /> Thêm dòng
                        </button>
                    </fieldset>

                    {/* Payment Info */}
                    <fieldset className="border p-4 rounded-md">
                        <legend className="text-sm font-semibold px-2">Thông tin thanh toán</legend>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div className="space-y-1"><label className="font-medium text-gray-700">Lý do trả hàng <span className="text-red-500">*</span></label>
                                <SearchableSelect
                                    options={Object.values(ReturnReason).map(r => ({ id: r, name: r }))}
                                    value={reason}
                                    onChange={setReason}
                                    placeholder="Chọn lý do"
                                />
                            </div>
                            <div className="space-y-1"><label className="font-medium text-gray-700">Phương thức xử lý <span className="text-red-500">*</span></label>
                                <SearchableSelect
                                    options={Object.values(ReturnHandlingMethod).map(m => ({ id: m, name: m }))}
                                    value={handlingMethod}
                                    onChange={setHandlingMethod}
                                    placeholder="Chọn phương thức"
                                />
                            </div>
                            {handlingMethod !== ReturnHandlingMethod.DEBT_DEDUCTION && (
                                <div className="space-y-1 md:col-span-2">
                                    <label className="font-medium text-gray-700">Tài khoản thanh toán <span className="text-red-500">*</span></label>
                                    <SearchableSelect
                                        options={accounts.map(acc => ({ id: acc.id, name: acc.name }))}
                                        value={refundAccountId}
                                        onChange={setRefundAccountId}
                                        placeholder="Chọn tài khoản"
                                        required
                                    />
                                </div>
                            )}
                            <div className="md:col-span-2 space-y-1"><label className="font-medium text-gray-700">Ghi chú</label><textarea value={returnNotes} onChange={e => setReturnNotes(e.target.value)} rows={2} className="w-full p-2 border border-gray-300 rounded-md"></textarea></div>
                            <div className="md:col-span-2 space-y-2 text-right">
                                <div className="flex justify-end items-center gap-4"><span className="text-gray-600">Tổng tiền hàng trả:</span><span className="font-semibold w-36">{totalAmount.toLocaleString('vi-VN')} ₫</span></div>
                                <div className="flex justify-end items-center gap-4"><span className="text-gray-600">Phí trả hàng:</span><input type="number" value={returnFee} onChange={(e) => setReturnFee(e.target.value)} className="w-36 p-1.5 border border-gray-300 rounded-md text-sm text-right" /></div>
                                <div className="flex justify-end items-center gap-4"><span className="text-gray-600">Giảm giá:</span><input type="number" value={discount} onChange={(e) => setDiscount(e.target.value)} className="w-36 p-1.5 border border-gray-300 rounded-md text-sm text-right" /></div>
                                <div className="flex justify-end items-center gap-4 text-base"><span className="font-semibold text-gray-800">Cần trả khách:</span><span className="font-bold text-red-600 w-36">{returnVoucherNetTotal.toLocaleString('vi-VN')} ₫</span></div>
                            </div>
                        </div>
                    </fieldset>
                </div>
                <div className="border-t p-4 flex justify-end items-center bg-gray-50 rounded-b-lg gap-2">
                    <button type="button" onClick={handleRequestClose} className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap">Hủy</button>
                    <button type="button" onClick={handleSaveDraft} className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap">Lưu tạm</button>
                    <button type="button" onClick={() => handleConfirm(true)} className="px-4 py-2 text-sm font-medium bg-[#0066cc] text-white rounded-md hover:bg-[#0052a3] whitespace-nowrap">Xác nhận & In</button>
                    <button type="button" onClick={() => handleConfirm(false)} className="px-4 py-2 text-sm font-medium bg-[#0066cc] text-white rounded-md hover:bg-[#0052a3] whitespace-nowrap">Xác nhận</button>
                </div>
            </>
        );
    };

    const renderInternalTransferForm = () => (
        <>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <label className="font-medium text-gray-700">Mã phiếu</label>
                        <input type="text" value={internalTransferCode} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-100" />
                    </div>
                    <div className="space-y-1">
                        <label className="font-medium text-gray-700">Ngày chuyển</label>
                        <input type="date" value={voucherDate} onChange={e => setVoucherDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div className="space-y-1">
                        <label className="font-medium text-gray-700">Người tạo phiếu</label>
                        <SearchableMultiSelect
                            options={users.map(u => ({ id: u.id, name: u.full_name }))}
                            selectedIds={assignedUserIds}
                            onChange={(ids) => setAssignedUserIds(ids.map(String))}
                            placeholder="Chọn nhân viên"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="font-medium text-gray-700">Kho xuất</label>
                        <SearchableSelect
                            options={userAvailableFacilities.map(w => ({ id: w.id, name: w.name }))}
                            value={fromWarehouse}
                            onChange={setFromWarehouse}
                            placeholder="Chọn kho xuất"
                            disabled={!canSeeAllFacilities}
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="font-medium text-gray-700">Kho nhập</label>
                        <SearchableSelect
                            options={facilities.filter(w => w.id !== fromWarehouse).map(w => ({ id: w.id, name: w.name }))}
                            value={toWarehouse}
                            onChange={setToWarehouse}
                            placeholder="Chọn kho nhập"
                        />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <label className="font-medium text-gray-700">Ghi chú chung</label>
                        <textarea value={generalNotes} onChange={e => setGeneralNotes(e.target.value)} rows={2} className="w-full p-2 border border-gray-300 rounded-md"></textarea>
                    </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto border-t pt-4">
                    <table className="w-full text-sm">
                        <thead className="text-left text-gray-600">
                            <tr>
                                <th className="p-2 w-1/12">Stt</th>
                                <th className="p-2 w-2/12">Mã sp</th>
                                <th className="p-2 w-3/12">Tên mặt hàng</th>
                                <th className="p-2 w-1/12 text-center">Đvt</th>
                                <th className="p-2 w-2/12">Số lượng</th>
                                <th className="p-2 w-2/12">Ghi chú</th>
                                <th className="p-2 w-1/12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item.id} className="border-b">
                                    <td className="p-1 text-center align-middle">{index + 1}</td>
                                    <td className="p-1 align-middle">
                                        <span className="text-gray-600 text-xs px-2">{item.product?.sku || ''}</span>
                                    </td>
                                    <td className="p-1 align-middle">
                                        <SearchableSelect
                                            options={transferProducts.map(p => ({
                                                id: p.id,
                                                name: `${p.sku || ''} - ${p.name} (SL: ${p.quantity})`
                                            }))}
                                            value={item.product?.id || ''}
                                            onChange={(val) => handleProductSelect(item.id, val)}
                                            placeholder={!fromWarehouse ? 'Vui lòng chọn kho xuất trước' : isFetchingTransferProducts ? 'Đang tải...' : 'Chọn sản phẩm'}
                                            disabled={!fromWarehouse || isFetchingTransferProducts}
                                            className="w-full"
                                        />
                                    </td>
                                    <td className="p-1 text-center align-middle">
                                        <span className="text-gray-600">{item.product?.unit || ''}</span>
                                    </td>
                                    <td className="p-1 align-middle">
                                        <input
                                            type="number"
                                            value={item.quantity}
                                            onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)}
                                            className="w-full p-1.5 border border-gray-300 rounded-md text-sm"
                                        />
                                    </td>
                                    <td className="p-1 align-middle">
                                        <input
                                            type="text"
                                            value={item.notes}
                                            onChange={(e) => handleItemChange(item.id, 'notes', e.target.value)}
                                            className="w-full p-1.5 border border-gray-300 rounded-md text-sm"
                                        />
                                    </td>
                                    <td className="p-1 text-center align-middle">
                                        <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 p-1">
                                            <DeleteIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button onClick={handleAddItem} className="flex items-center gap-2 text-sm font-medium text-[#0066cc] hover:underline mt-2">
                    <PlusIcon className="w-4 h-4" /> Thêm dòng
                </button>
            </div>
            <div className="border-t p-4 flex justify-end items-center bg-gray-50 rounded-b-lg gap-2">
                <button onClick={handleRequestClose} className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap">
                    Hủy
                </button>
                <button type="button" onClick={handleSaveDraft} className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap">
                    Lưu tạm
                </button>
                <button onClick={() => handleConfirm(true, OrderStatus.PENDING)} className="px-4 py-2 text-sm font-medium bg-[#0066cc] text-white rounded-md hover:bg-[#0052a3] whitespace-nowrap">
                    Xác nhận & In
                </button>
                <button onClick={() => handleConfirm(false, OrderStatus.PENDING)} className="px-4 py-2 text-sm font-medium bg-[#0066cc] text-white rounded-md hover:bg-[#0052a3] whitespace-nowrap">
                    Xác nhận
                </button>
            </div>
        </>
    );

    const renderScrappingVoucherForm = () => (
        <>
            <div className="p-6 space-y-4 max-h-[65vh] overflow-y-auto">
                {/* Header Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="space-y-1">
                        <label className="font-medium text-gray-700">Mã phiếu</label>
                        <input type="text" value={scrappingCode} readOnly className="w-full p-2 border border-gray-300 rounded-md bg-gray-100" />
                    </div>
                    <div className="space-y-1">
                        <label className="font-medium text-gray-700">Ngày hủy</label>
                        <input type="date" value={voucherDate} onChange={e => setVoucherDate(e.target.value)} className="w-full p-2 border border-gray-300 rounded-md" />
                    </div>
                    <div className="space-y-1">
                        <label className="font-medium text-gray-700">Người tạo phiếu</label>
                        <SearchableMultiSelect
                            options={users.map(u => ({ id: u.id, name: u.full_name }))}
                            selectedIds={assignedUserIds}
                            onChange={(ids) => setAssignedUserIds(ids.map(String))}
                            placeholder="Chọn nhân viên"
                        />
                    </div>
                    <div className="space-y-1">
                        <label className="font-medium text-gray-700">Lý do hủy</label>
                        <SearchableSelect
                            options={Object.values(ScrappingReason).map(r => ({ id: r, name: r }))}
                            value={scrappingReason}
                            onChange={setScrappingReason}
                            placeholder="Chọn lý do"
                        />
                    </div>
                    <div className="space-y-1 md:col-span-2">
                        <label className="font-medium text-gray-700">Ghi chú chung</label>
                        <textarea value={generalNotes} onChange={e => setGeneralNotes(e.target.value)} rows={2} className="w-full p-2 border border-gray-300 rounded-md"></textarea>
                    </div>
                </div>

                {/* Items Table */}
                <div className="overflow-x-auto border-t pt-4">
                    <table className="w-full text-sm">
                        <thead className="text-left text-gray-600">
                            <tr>
                                <th className="p-2 w-1/12">Stt</th>
                                <th className="p-2 w-4/12">Tên mặt hàng</th>
                                <th className="p-2 w-2/12">Số lượng hủy</th>
                                <th className="p-2 w-2/12">Giá trị đơn vị</th>
                                <th className="p-2 w-2/12">Tổng giá trị</th>
                                <th className="p-2 w-1/12"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, index) => (
                                <tr key={item.id} className="border-b">
                                    <td className="p-1 text-center">{index + 1}</td>
                                    <td className="p-1">
                                        <SearchableSelect
                                            options={products.map(p => ({
                                                id: p.id,
                                                name: `${p.sku || ''} - ${p.name} (SL: ${p.quantity})`
                                            }))}
                                            value={item.product?.id || ''}
                                            onChange={(val) => handleProductSelect(item.id, val)}
                                            placeholder="Chọn sản phẩm"
                                            className="w-full"
                                        />
                                    </td>
                                    <td className="p-1">
                                        <input type="number" value={item.quantity} onChange={(e) => handleItemChange(item.id, 'quantity', e.target.value)} className="w-full p-1.5 border border-gray-300 rounded-md text-sm" />
                                    </td>
                                    <td className="p-1">
                                        <input type="number" value={item.price} onChange={(e) => handleItemChange(item.id, 'price', e.target.value)} className="w-full p-1.5 border border-gray-300 rounded-md text-sm" placeholder="Giá vốn" />
                                    </td>
                                    <td className="p-1 text-right font-medium pr-2">{Math.round((parseFloat(String(item.quantity)) || 0) * (parseFloat(String(item.price)) || 0)).toLocaleString('vi-VN')}</td>
                                    <td className="p-1 text-center">
                                        <button onClick={() => handleRemoveItem(item.id)} className="text-red-500 hover:text-red-700 p-1">
                                            <DeleteIcon className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <button onClick={handleAddItem} className="flex items-center gap-2 text-sm font-medium text-[#0066cc] hover:underline mt-2">
                    <PlusIcon className="w-4 h-4" /> Thêm dòng
                </button>
                {/* Summary */}
                <div className="border-t pt-4 mt-4 space-y-2 text-right text-sm">
                    <div className="flex justify-end items-center gap-4">
                        <span className="font-medium text-gray-600">Tổng giá trị hủy:</span>
                        <span className="font-semibold text-red-600 w-36">{totalAmount.toLocaleString('vi-VN')} ₫</span>
                    </div>
                </div>
            </div>
            <div className="border-t p-4 flex justify-end items-center bg-gray-50 rounded-b-lg gap-2">
                <button type="button" onClick={handleRequestClose} className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap">
                    Hủy
                </button>
                <button type="button" onClick={handleSaveDraft} className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap">
                    Lưu tạm
                </button>
                <button onClick={() => handleConfirm(true)} className="px-4 py-2 text-sm font-medium bg-[#0066cc] text-white rounded-md hover:bg-[#0052a3] whitespace-nowrap">
                    Xác nhận & In
                </button>
                <button onClick={() => handleConfirm(false)} className="px-4 py-2 text-sm font-medium bg-[#0066cc] text-white rounded-md hover:bg-[#0052a3] whitespace-nowrap">
                    Xác nhận
                </button>
            </div>
        </>
    );

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={(e) => e.stopPropagation()}>
                <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                    <div
                        className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg cursor-pointer"
                        onClick={() => setShowDebug(!showDebug)}
                    >
                        <h3 className="text-lg font-bold text-gray-900">
                            {getVoucherTitle(voucherType)}
                            {showDebug && <span className="ml-2 text-xs font-normal text-blue-500">(Diagnostics On)</span>}
                        </h3>
                        <button onClick={handleRequestClose} className="text-gray-400 hover:text-gray-500"><svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg></button>
                    </div>

                    {/* Debug Info (Only in dev) */}
                    {showDebug && (
                        <div className="bg-yellow-100 p-2 text-[10px] border-b text-gray-700 flex flex-wrap items-center gap-x-3 gap-y-1">
                            <div className="flex items-center gap-1 font-mono">
                                <span className="font-bold">Status:</span>
                                {Object.entries(fetchStatus).map(([name, status]) => (
                                    <span key={name} className={`px-1 rounded ${status === 'success' ? 'bg-green-200 text-green-800' : (status === 'fail' ? 'bg-red-200 text-red-800' : 'bg-blue-100 text-blue-600 animate-pulse')}`}>
                                        {name[0]}{status === 'success' ? '✓' : (status === 'fail' ? '✗' : '...')}
                                    </span>
                                ))}
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-bold">Counts:</span>
                                P:{partners.length}, Pr:{products.length}, U:{users.length}, A:{accounts.length}, IC:{incomeCategories.length}, EC:{expenseCategories.length}, F:{facilities.length}
                            </div>
                            <button
                                onClick={(e) => { e.stopPropagation(); (window as any).forceFetchData?.(); }}
                                className="px-2 py-0.5 bg-white border border-gray-300 rounded hover:bg-gray-50 text-[10px] font-bold"
                            >
                                RETRY FETCH
                            </button>
                            {fetchError && <div className="w-full text-red-600 font-bold overflow-hidden text-ellipsis">ERROR: {fetchError}</div>}
                        </div>
                    )}

                    {voucherType === 'income-expense-voucher' && renderIncomeExpenseForm()}
                    {(voucherType === 'purchase-order' || voucherType === 'delivery-note') && renderFullVoucherForm()}
                    {voucherType === 'debt-notice' && renderDebtNoticeForm()}
                    {voucherType === 'return-voucher' && renderReturnVoucherForm()}
                    {voucherType === 'internal-transfer' && renderInternalTransferForm()}
                    {voucherType === 'scrapping-voucher' && renderScrappingVoucherForm()}

                </div>
            </div>

            {isPrintPreview && createPortal(
                <div id="print-section" className="hidden print:block bg-white p-0 m-0 z-[100]">
                    <PrintVoucherTemplate voucherType={voucherType} data={getPrintData()} />
                </div>,
                document.body
            )}

            <ConfirmationModal
                isOpen={showConfirmClose}
                onClose={handleCancelClose}
                onConfirm={handleConfirmClose}
                title="Xác nhận đóng"
                message="Bạn có chắc chắn muốn đóng? Mọi thay đổi chưa được lưu sẽ bị mất."
                confirmText="Đóng"
                cancelText="Hủy"
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
        </>
    );
};

export default VoucherModal;