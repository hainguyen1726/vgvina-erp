import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import Pagination from '../components/ui/Pagination';
import FilterBar from '../components/ui/FilterBar';
import SummaryCard from '../components/ui/SummaryCard';
import { InternalTransferVoucher } from '../types';
import { orderService } from '../src/services/orderService';
import { userService } from '../src/services/userService';
import { productService } from '../src/services/productService';
import { transactionService } from '../src/services/transactionService';
import { useBranch } from '../contexts/BranchContext';
import { ExportIcon, CloseIcon, ArrowsUpDownIcon, ChevronLeftIcon, ChevronRightIcon, PlusIcon, EditIcon, DeleteIcon } from '../components/icons/Icons';
import { useNotification } from '../contexts/NotificationContext';
import { TableActions } from '../components/ui/TableActions';
import VoucherModal from '../components/modals/VoucherModal';
import SearchableSelect from '../components/ui/SearchableSelect';
import SearchableMultiSelect from '../components/ui/SearchableMultiSelect';
import PrintVoucherTemplate from '../components/print/PrintVoucherTemplate';
import { formatDate } from '../src/utils/dateUtils';
import GlobalConfirmationModal from '../components/modals/ConfirmationModal';
import { RecordHistoryModal } from '../components/modals/RecordHistoryModal';


const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }: { isOpen: boolean, onClose: () => void, onConfirm: () => void, title: string, message: string }) => {
    useEffect(() => {
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
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700">Xác nhận</button>
                </div>
            </div>
        </div>
    );
};

const DetailModal = ({ item, onClose, onConfirm, onEditClick, onDeleteClick }: {
    item: InternalTransferVoucher | null,
    onClose: () => void,
    onConfirm: (id: string) => void,
    onEditClick: (item: InternalTransferVoucher) => void,
    onDeleteClick: (item: InternalTransferVoucher) => void,
}) => {
    const { currentUser } = useBranch();
    const [showHistory, setShowHistory] = useState(false);
    const [isPrinting, setIsPrinting] = useState(false);

    const isAdmin = currentUser?.is_admin === true ||
        ['admin', 'Admin', 'Quản trị viên', 'Kế toán HO', 'Ban Lãnh đạo', 'Quản lý Chi nhánh'].includes(currentUser?.role || '');

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (item) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [item, onClose]);

    useEffect(() => {
        if (isPrinting) {
            const timer = setTimeout(() => {
                window.print();
                setIsPrinting(false);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, [isPrinting]);

    const getPrintData = () => {
        return {
            code: item?.code,
            date: item?.transfer_date,
            warehouse: item?.from_warehouse,
            toWarehouse: item?.to_warehouse,
            items: item?.items.map(i => ({
                sku: i.product.sku,
                name: i.product.name,
                unit: i.product.unit,
                quantity: i.quantity,
                price: 0,
                total: 0
            })),
            notes: item?.notes,
            summary: {
                total: 0
            }
        };
    };

    if (!item) return null;
    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
                <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-between items-center border-b p-4">
                        <h3 className="text-lg font-semibold text-gray-800">Chi tiết Phiếu Chuyển kho: {item.code}</h3>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-800 p-2 rounded-full">
                            <CloseIcon />
                        </button>
                    </div>
                    <div className="p-6 max-h-[70vh] overflow-y-auto">
                        {/* General Info */}
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3 text-sm mb-6">
                            <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Mã phiếu:</span><span className="font-semibold">{item.code}</span></div>
                            <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Ngày tạo:</span><span>{formatDate(item.transfer_date)}</span></div>
                            <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Kho đi:</span><span className="font-semibold">{item.from_warehouse}</span></div>
                            <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Kho đến:</span><span className="font-semibold">{item.to_warehouse}</span></div>
                            <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Người tạo:</span><span>{item.creator_user}</span></div>
                            <div className="flex justify-between border-b pb-2"><span className="text-gray-500">Trạng thái:</span><span>{item.status === 'PENDING' ? <span className="text-orange-600 font-semibold">Đang chờ</span> : <span className="text-green-600 font-semibold">Đã hoàn thành</span>}</span></div>
                            <div className="col-span-2"><span className="text-gray-500">Ghi chú:</span><p className="mt-1 text-gray-800">{item.notes || 'Không có'}</p></div>
                        </div>

                        {/* Product List */}
                        <h4 className="font-semibold text-gray-700 mb-2">Danh sách sản phẩm</h4>
                        <div className="overflow-x-auto border rounded-lg">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="p-2 text-left">Mã sp (sku)</th>
                                        <th className="p-2 text-left">Tên sản phẩm</th>
                                        <th className="p-2 text-center">Đơn vị</th>
                                        <th className="p-2 text-right">Số lượng</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y">
                                    {item.items.map((transferItem) => (
                                        <tr key={transferItem.id}>
                                            <td className="p-2">{transferItem.product.sku}</td>
                                            <td className="p-2 font-medium">{transferItem.product.name}</td>
                                            <td className="p-2 text-center">{transferItem.product.unit}</td>
                                            <td className="p-2 text-right font-semibold tabular-nums">{transferItem.quantity.toLocaleString('vi-VN')}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                    <div className="border-t p-4 flex justify-end items-center bg-gray-50 rounded-b-lg space-x-2">
                        {isAdmin && (
                            <button 
                                onClick={() => setShowHistory(true)} 
                                className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white text-gray-800 border border-gray-300 rounded-md hover:bg-gray-50 mr-auto whitespace-nowrap"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                                Lịch sử
                            </button>
                        )}
                        <button onClick={() => onEditClick(item)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap">
                            <EditIcon className="w-4 h-4" /> Sửa
                        </button>
                        <button onClick={() => onDeleteClick(item)} className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium bg-white text-red-600 border border-red-200 rounded-md hover:bg-red-50 whitespace-nowrap">
                            <DeleteIcon className="w-4 h-4" /> Xóa
                        </button>
                        {item.status === 'PENDING' && (
                            <button onClick={() => onConfirm(item.id)} className="px-3 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 whitespace-nowrap">
                                Xác nhận Hoàn thành
                            </button>
                        )}
                        <button onClick={() => setIsPrinting(true)} className="px-3 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 whitespace-nowrap">In phiếu</button>
                        <button onClick={onClose} className="px-3 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 whitespace-nowrap">Đóng</button>
                    </div>
                </div>
            </div>
            {isPrinting && createPortal(
                <div id="print-section" className="hidden print:block bg-white p-0 m-0 z-[100]">
                    <PrintVoucherTemplate voucherType="internal-transfer" data={getPrintData()} />
                </div>,
                document.body
            )}
            {showHistory && (
                <RecordHistoryModal
                    isOpen={showHistory}
                    onClose={() => setShowHistory(false)}
                    tableName="vgvina_internal_transfers"
                    recordId={String(item.id)}
                    recordCode={item.code}
                />
            )}
        </>
    );
};

import { Product, User as AppUser, InternalTransferItem } from '../types';

const EditVoucherModal = ({ isOpen, onClose, item, onSave }: { isOpen: boolean, onClose: () => void, item: InternalTransferVoucher | null, onSave: (item: any) => void }) => {
    const { showNotification } = useNotification();
    const [facilities, setFacilities] = useState<{ id: string, name: string }[]>([]);
    const [users, setUsers] = useState<AppUser[]>([]);
    const [products, setProducts] = useState<Product[]>([]);
    const [loadingResources, setLoadingResources] = useState(false);

    // Form State
    const [code, setCode] = useState('');
    const [date, setDate] = useState('');
    const [fromFac, setFromFac] = useState('');
    const [toFac, setToFac] = useState('');
    const [status, setStatus] = useState<'PENDING' | 'COMPLETED' | 'CANCELLED'>('PENDING');
    const [notes, setNotes] = useState('');
    const [assignedIds, setAssignedIds] = useState<string[]>([]);
    const [items, setItems] = useState<{ id?: string, product: Product | null, quantity: number, notes?: string }[]>([]);

    const [showConfirmClose, setShowConfirmClose] = useState(false);
    const [futureDateWarning, setFutureDateWarning] = useState<{
        isOpen: boolean;
        onConfirm: () => void;
        date: string;
    } | null>(null);

    const handleRequestClose = () => setShowConfirmClose(true);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen && !showConfirmClose) handleRequestClose(); };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose, showConfirmClose]);

    useEffect(() => {
        if (isOpen && item) {
            setCode(item.code);
            setDate(new Date(item.transfer_date).toISOString().split('T')[0]);
            setFromFac(item.from_facility_id);
            setToFac(item.to_facility_id);
            setStatus(item.status as any);
            setNotes(item.notes || '');
            setAssignedIds(item.assigned_user_ids || []);
            setItems(item.items.map(i => ({
                id: i.id,
                product: i.product,
                quantity: i.quantity,
                notes: i.notes
            })));
            fetchResources();
        }
    }, [isOpen, item]);

    const fetchResources = async () => {
        setLoadingResources(true);
        try {
            const [facs, usrs] = await Promise.all([
                transactionService.getFacilities(),
                userService.getUsers()
            ]);
            setFacilities(facs);
            setUsers(usrs);
        } catch (error) {
            console.error("Error fetching resources", error);
        } finally {
            setLoadingResources(false);
        }
    };

    // Re-fetch products when from warehouse changes
    useEffect(() => {
        if (isOpen && fromFac) {
            productService.getProducts(fromFac).then(setProducts);
        }
    }, [isOpen, fromFac]);

    const handleAddItem = () => {
        setItems([...items, { product: null, quantity: 1 }]);
    };

    const handleRemoveItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    };

    const handleItemChange = (index: number, field: string, value: any) => {
        const newItems = [...items];
        newItems[index] = { ...newItems[index], [field]: value };
        if (field === 'product' && value) {
            newItems[index].quantity = 1;
        }
        setItems(newItems);
    };

    const handleSave = async () => {
        if (!fromFac || !toFac || items.length === 0) {
            showNotification("Vui lòng điền đầy đủ thông tin", "warning");
            return;
        }
        if (fromFac === toFac) {
            showNotification("Kho nhập và kho xuất không được trùng nhau", "warning");
            return;
        }
        const hasNoProduct = items.some(i => !i.product);
        if (hasNoProduct) {
            showNotification("Vui lòng chọn sản phẩm cho tất cả các dòng", "warning");
            return;
        }

        const proceed = () => {
            const payload = {
                code,
                transferDate: date,
                fromFacilityId: fromFac,
                toFacilityId: toFac,
                assignedUserIds: assignedIds,
                status,
                notes,
                items: items.map(i => ({
                    id: i.id,
                    productId: i.product!.id,
                    quantity: i.quantity,
                    notes: i.notes
                }))
            };
            onSave(payload);
        };

        const now = new Date();
        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
        if (date > todayStr) {
            setFutureDateWarning({
                isOpen: true,
                onConfirm: () => {
                    setFutureDateWarning(null);
                    proceed();
                },
                date: date
            });
            return;
        }
        proceed();
    };

    if (!isOpen || !item) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b p-4">
                    <h3 className="text-lg font-bold text-gray-900">Chỉnh sửa phiếu chuyển kho: {item.code}</h3>
                    <button onClick={handleRequestClose} className="text-gray-500 hover:text-gray-800 p-2 rounded-full"><CloseIcon /></button>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mã phiếu</label>
                            <input type="text" value={code} onChange={e => setCode(e.target.value)} className="w-full p-2 border rounded text-sm bg-gray-50" readOnly />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày chuyển</label>
                            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full p-2 border rounded text-sm" />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</label>
                            <select value={status} onChange={e => setStatus(e.target.value as any)} className="w-full p-2 border rounded text-sm">
                                <option value="PENDING">Đang chờ</option>
                                <option value="COMPLETED">Đã hoàn thành</option>
                                <option value="CANCELLED">Đã hủy</option>
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Kho xuất</label>
                            {(() => {
                                const canSeeAll = currentUser?.is_admin === true ||
                                    ['admin', 'Admin', 'Quản trị viên', 'Kế toán HO', 'Ban Lãnh đạo'].includes(currentUser?.role || '');
                                const assignedIds = new Set((currentUser?.assigned_facilities || []).map(f => String(f.id)));
                                if (currentUser?.facility_id) assignedIds.add(String(currentUser.facility_id));
                                const availFacs = (canSeeAll || !currentUser || assignedIds.size === 0)
                                    ? facilities
                                    : facilities.filter(f => assignedIds.has(String(f.id)));
                                return (
                                    <SearchableSelect
                                        options={availFacs.map(f => ({ id: f.id, name: f.name }))}
                                        value={fromFac}
                                        onChange={setFromFac}
                                        placeholder="Chọn kho xuất"
                                        disabled={!canSeeAll}
                                    />
                                );
                            })()}
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Kho nhập</label>
                            <SearchableSelect
                                options={facilities.map(f => ({ id: f.id, name: f.name }))}
                                value={toFac}
                                onChange={setToFac}
                                placeholder="Chọn kho nhập"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Người thực hiện</label>
                            <SearchableMultiSelect
                                options={users.map(u => ({ id: String(u.id), name: u.full_name }))}
                                selectedIds={assignedIds}
                                onChange={setAssignedIds}
                                placeholder="Chọn người thực hiện"
                            />
                        </div>
                        <div className="md:col-span-3 space-y-1">
                            <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Ghi chú</label>
                            <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} className="w-full p-2 border rounded text-sm"></textarea>
                        </div>
                    </div>

                    <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                                <tr>
                                    <th className="p-2 text-left w-10">#</th>
                                    <th className="p-2 text-left">Sản phẩm</th>
                                    <th className="p-2 text-center w-24">Đơn vị</th>
                                    <th className="p-2 text-right w-32">Số lượng</th>
                                    <th className="p-2 text-center w-12 text-red-500"><DeleteIcon className="w-4 h-4 mx-auto" /></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {items.map((it, idx) => (
                                    <tr key={idx}>
                                        <td className="p-2 text-gray-400">{idx + 1}</td>
                                        <td className="p-2">
                                            <SearchableSelect
                                                options={products.map(p => ({ id: p.id, name: `${p.sku} - ${p.name}` }))}
                                                value={it.product?.id || ''}
                                                onChange={(id) => handleItemChange(idx, 'product', products.find(p => p.id === id))}
                                                placeholder="Chọn sản phẩm"
                                            />
                                        </td>
                                        <td className="p-2 text-center text-gray-500">{it.product?.unit || '-'}</td>
                                        <td className="p-2">
                                            <input
                                                type="number"
                                                value={it.quantity}
                                                onChange={(e) => handleItemChange(idx, 'quantity', parseFloat(e.target.value))}
                                                className="w-full p-1 border rounded text-right tabular-nums"
                                            />
                                        </td>
                                        <td className="p-2 text-center">
                                            <button onClick={() => handleRemoveItem(idx)} className="text-red-400 hover:text-red-600">
                                                <DeleteIcon className="w-4 h-4 mx-auto" />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        <button onClick={handleAddItem} className="w-full py-2 bg-gray-50 text-blue-600 hover:bg-gray-100 flex items-center justify-center gap-1.5 text-sm font-medium">
                            <PlusIcon className="w-4 h-4" /> Thêm sản phẩm
                        </button>
                    </div>

                    {status === 'COMPLETED' && (
                        <div className="mt-4 p-3 bg-orange-50 border border-orange-200 rounded text-orange-800 text-xs">
                            <p className="font-bold mb-1">CẢNH BÁO:</p>
                            Phiếu này đã hoàn thành. Việc chỉnh sửa số lượng hoặc đổi kho sẽ tự động điều chỉnh tồn kho của các kho liên quan. Hãy chắc chắn về sự thay đổi này.
                        </div>
                    )}
                </div>

                <div className="border-t p-4 flex justify-end bg-gray-50 rounded-b-lg space-x-3">
                    <button onClick={handleRequestClose} className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Hủy</button>
                    <button onClick={handleSave} className="px-6 py-2 text-sm font-medium bg-blue-600 text-white rounded-md hover:bg-blue-700 shadow-sm">Lưu thay đổi</button>
                </div>
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
            />

            {futureDateWarning && (
                <GlobalConfirmationModal
                    isOpen={futureDateWarning.isOpen}
                    onClose={() => setFutureDateWarning(null)}
                    onConfirm={futureDateWarning.onConfirm}
                    title="Cảnh báo: Ngày trong tương lai"
                    message={`Ngày chuyển kho bạn chọn (${new Date(futureDateWarning.date).toLocaleDateString('vi-VN')}) là một ngày trong tương lai. Bạn có chắc chắn muốn tiếp tục ghi nhận giao dịch này không?`}
                    confirmText="Tiếp tục"
                    cancelText="Quay lại"
                />
            )}
        </div>
    );
};

const ReportInternalTransfer: React.FC = () => {
    const { showNotification } = useNotification();
    const { selectedFacilityId, currentUser } = useBranch();
    const [vouchers, setVouchers] = useState<InternalTransferVoucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(30);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalItem, setModalItem] = useState<InternalTransferVoucher | null>(null);
    const [itemToDelete, setItemToDelete] = useState<InternalTransferVoucher | null>(null);
    const [voucherModal, setVoucherModal] = useState({ isOpen: false, type: '' });
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
    const [visibleColumns, setVisibleColumns] = useState(["transfer_date", "code", "from_warehouse", "to_warehouse", "creator_user", "status"]);
    const [timeFilter, setTimeFilter] = useState<{ filter: string; dates?: { from: Date; to: Date } }>({ filter: 'All time' });

    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const actionParam = searchParams.get('action');
    const voucherIdParam = searchParams.get('voucherId');

    useEffect(() => {
        fetchVouchers();
    }, [selectedFacilityId, currentUser]);

    const fetchVouchers = async () => {
        try {
            setLoading(true);
            const isAdmin = currentUser?.is_admin === true ||
              ['admin', 'Admin', 'Quản trị viên', 'Kế toán HO', 'Ban Lãnh đạo', 'Quản lý Chi nhánh'].includes(currentUser?.role || '');
            const employeeIdFilter = !isAdmin ? currentUser?.id : undefined;
            const data = await orderService.getInternalTransfers(selectedFacilityId || undefined, employeeIdFilter);
            setVouchers(data as any[]);

            if (actionParam === 'view' && voucherIdParam) {
                const itemToView = data.find((v: any) => String(v.id) === voucherIdParam);
                if (itemToView) {
                    setSelectedVoucher(itemToView as any);
                }
            }
        } catch (error) {
            console.error("Failed to fetch internal transfers", error);
        } finally {
            setLoading(false);
        }
    };

    const handleTimeFilterChange = (filter: string, dates?: { from: Date; to: Date }) => {
        setTimeFilter({ filter, dates });
        setCurrentPage(1);
    };

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const sortedData = useMemo(() => {
        let sortableItems = [...vouchers];

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
            sortableItems = sortableItems.filter(item => {
                const itemDate = new Date(item.transfer_date);
                if (fromDate && itemDate < fromDate) return false;
                if (toDate && itemDate > toDate) return false;
                return true;
            });
        }

        // Search filtering
        sortableItems = sortableItems.filter(item =>
            item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.from_warehouse || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (item.to_warehouse || '').toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortConfig) {
            sortableItems.sort((a, b) => {
                const aValue = (a as any)[sortConfig.key];
                const bValue = (b as any)[sortConfig.key];
                if (typeof aValue === 'string' && typeof bValue === 'string') {
                    return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                }
                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
                }
                return 0;
            });
        }
        return sortableItems;
    }, [searchTerm, sortConfig, timeFilter, vouchers]);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [selectedVoucher, setSelectedVoucher] = useState<InternalTransferVoucher | null>(null);
    const [statusFilter, setStatusFilter] = useState<'ALL' | 'PENDING' | 'COMPLETED' | 'CANCELLED'>('ALL');
    const [voucherToEdit, setVoucherToEdit] = useState<InternalTransferVoucher | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);


    const allColumns = useMemo(() => [
        { key: 'transfer_date', label: 'Ngày chuyển' },
        { key: 'code', label: 'Mã phiếu' },
        { key: 'from_warehouse', label: 'Kho đi' },
        { key: 'to_warehouse', label: 'Kho đến' },
        { key: 'creator_user', label: 'Người tạo' },
        { key: 'status', label: 'Trạng thái' },
    ], []);


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


    const { summaryValue, pendingCount } = useMemo(() => {
        const pendingCount = sortedData.filter(v => v.status === 'PENDING').length;
        const totalValue = sortedData.filter(v => v.status !== 'CANCELLED').reduce((total, voucher) => {
            const voucherValue = (voucher.items || []).reduce((sum, item) =>
                sum + (Number(item.quantity || 0) * (Number(item.product?.price || 0))), 0);
            return total + voucherValue;
        }, 0);
        return { summaryValue: totalValue, pendingCount };
    }, [sortedData]);

    const filteredData = useMemo(() => {
        let data = [...sortedData];

        if (statusFilter !== 'ALL') {
            data = data.filter(v => v.status === statusFilter);
        }

        return data.sort((a, b) => new Date(b.transfer_date).getTime() - new Date(a.transfer_date).getTime());
    }, [sortedData, searchTerm, statusFilter]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);


    const handleConfirmCompletion = async (id: string) => {
        try {
            await orderService.updateInternalTransferStatus(id, 'COMPLETED');
            setVouchers(vouchers.map(v => v.id === id ? { ...v, status: 'COMPLETED' } : v));
            setSelectedVoucher(prev => prev ? { ...prev, status: 'COMPLETED' } : null);
            showNotification(`Đã xác nhận hoàn thành phiếu ${id}`, 'success');
        } catch (error) {
            console.error("Failed to confirm completion", error);
            showNotification("Lỗi khi xác nhận hoàn thành phiếu", 'error');
        }
    };

    const handleEditClick = (item: InternalTransferVoucher) => {
        setVoucherToEdit(item);
        setIsEditModalOpen(true);
        setSelectedVoucher(null);
    };

    const handleDeleteClick = (item: InternalTransferVoucher) => {
        setItemToDelete(item);
        setSelectedVoucher(null);
    };

    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        try {
            await orderService.deleteInternalTransfer(itemToDelete.id);
            setVouchers(prev => prev.filter(v => v.id !== itemToDelete.id));
            showNotification(`Đã xóa phiếu ${itemToDelete.code}`, 'success');
            setItemToDelete(null);
        } catch (error) {
            console.error("Failed to delete internal transfer", error);
            showNotification("Lỗi khi xóa phiếu", 'error');
        }
    };

    const handleSaveVoucher = async (payload: any) => {
        if (!voucherToEdit) return;
        try {
            await orderService.updateInternalTransfer(voucherToEdit.id, payload);
            await fetchVouchers();
            setIsEditModalOpen(false);
            setVoucherToEdit(null);
            showNotification(`Đã lưu phiếu ${payload.code}.`, 'success');
        } catch (error) {
            console.error("Failed to save voucher", error);
            showNotification("Lỗi khi lưu phiếu", 'error');
        }
    };

    const getStatusBadge = (status: 'PENDING' | 'COMPLETED' | 'CANCELLED') => {
        switch (status) {
            case 'COMPLETED': return <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Đã hoàn thành</span>;
            case 'PENDING': return <span className="px-2 py-1 text-xs font-medium text-orange-800 bg-orange-100 rounded-full">Đang chờ</span>;
            case 'CANCELLED': return <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">Đã hủy</span>;
            default: return null;
        }
    };

    const renderCell = (voucher: InternalTransferVoucher, columnKey: string) => {
        switch (columnKey) {
            case 'transfer_date': return formatDate(voucher.transfer_date);
            case 'code': return <span className="font-semibold text-blue-600">{voucher.code}</span>;
            case 'status': return getStatusBadge(voucher.status);
            default:
                const value = voucher[columnKey as keyof InternalTransferVoucher];
                return typeof value === 'string' ? value : '';
        }
    };

    const handleOpenVoucherModal = (type: string) => setVoucherModal({ isOpen: true, type });
    const handleCloseVoucherModal = () => setVoucherModal({ isOpen: false, type: '' });

    return (
        <>
            <FilterBar onSearch={setSearchTerm} onTimeFilterChange={handleTimeFilterChange} pageTitle="Chuyển kho" backPath="/bao-cao" />

            {/* Desktop Summary Cards */}
            <div className="hidden md:grid md:grid-cols-2 gap-4 mb-4">
                <div className={`cursor-pointer rounded-lg transition-all duration-200 ${statusFilter === 'ALL' ? 'ring-2 ring-offset-2 ring-teal-500 shadow-lg' : ''}`} onClick={() => setStatusFilter('ALL')}>
                    <SummaryCard title="Giá trị chuyển" value={`${summaryValue.toLocaleString('vi-VN')} ₫`} icon={<ArrowsUpDownIcon className="w-6 h-6" />} colorClass="bg-teal-100 text-teal-600" />
                </div>
                <div className={`cursor-pointer rounded-lg transition-all duration-200 ${statusFilter === 'PENDING' ? 'ring-2 ring-offset-2 ring-orange-500 shadow-lg' : ''}`} onClick={() => setStatusFilter(prev => prev === 'PENDING' ? 'ALL' : 'PENDING')}>
                    <SummaryCard title="Chưa hoàn thành" value={String(pendingCount)} icon={<ArrowsUpDownIcon className="w-6 h-6" />} colorClass="bg-orange-100 text-orange-600" />
                </div>
            </div>

            {/* Mobile Summary Cards */}
            <div className="md:hidden grid grid-cols-2 gap-4 mb-4">
                <div
                    className={`block bg-white p-3 rounded-lg shadow-sm cursor-pointer transition-all duration-200 ${statusFilter === 'ALL' ? 'ring-2 ring-teal-500' : ''}`}
                    onClick={() => setStatusFilter('ALL')}
                >
                    <p className="text-xs font-medium text-gray-500">Giá trị chuyển</p>
                    <p className="text-base font-bold text-teal-600 mt-1">{summaryValue.toLocaleString('vi-VN')} ₫</p>
                </div>
                <div
                    className={`block bg-white p-3 rounded-lg shadow-sm cursor-pointer transition-all duration-200 ${statusFilter === 'PENDING' ? 'ring-2 ring-orange-500' : ''}`}
                    onClick={() => setStatusFilter(prev => prev === 'PENDING' ? 'ALL' : 'PENDING')}
                >
                    <p className="text-xs font-medium text-gray-500">Chưa hoàn thành</p>
                    <p className="text-base font-bold text-orange-600 mt-1">{String(pendingCount)}</p>
                </div>
            </div>

            <TableActions
                onSearch={setSearchTerm}
                searchPlaceholder="Tìm theo mã phiếu, kho, người tạo..."
                primaryActions={[
                    { label: 'Chuyển kho', icon: <PlusIcon />, onClick: () => handleOpenVoucherModal('internal-transfer') },
                    { label: 'Xuất file', icon: <ExportIcon />, onClick: () => { }, variant: 'secondary' },
                ]}
                columns={allColumns}
                visibleColumns={visibleColumns}
                onVisibleColumnsChange={setVisibleColumns}
            />


            {/* Table for Desktop */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => (
                                    <th key={col.key} className={`p-3 text-left ${col.key === 'status' ? 'text-center' : ''}`}>{col.label}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {paginatedData.map(v => (
                                <tr key={v.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => setSelectedVoucher(v)}>
                                    {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => (
                                        <td key={col.key} className={`p-3 whitespace-nowrap ${col.key === 'status' ? 'text-center' : ''}`}>{renderCell(v, col.key)}</td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {paginatedData.length === 0 && (
                        <div className="text-center py-10 text-gray-500">Không có dữ liệu phù hợp.</div>
                    )}
                </div>
                {filteredData.length > 0 && (
                    <div className="hidden md:block p-4">
                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                            totalItems={filteredData.length}
                        />
                    </div>
                )}
            </div>

            {/* Card list for Mobile */}
            <div className="md:hidden space-y-3">
                {paginatedData.map(v => (
                    <div key={v.id} onClick={() => setSelectedVoucher(v)} className="bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50">
                        <div className="flex justify-between items-start text-sm mb-2">
                            <div>
                                <p className="font-semibold text-blue-600">{v.code}</p>
                                <p className="text-xs text-gray-500">{formatDate(v.transfer_date)}</p>
                            </div>
                            {getStatusBadge(v.status)}
                        </div>
                        <div className="text-sm text-gray-700">
                            <p><span className="text-gray-500">Từ:</span> {v.from_warehouse}</p>
                            <p><span className="text-gray-500">Đến:</span> {v.to_warehouse}</p>
                        </div>
                        <p className="text-xs text-right text-gray-400 mt-1">{v.creator_user}</p>
                    </div>
                ))}
                {paginatedData.length === 0 && !isMobile && (
                    <div className="text-center py-10 text-gray-500">Không có dữ liệu phù hợp.</div>
                )}
            </div>

            {/* Mobile Pagination */}
            {filteredData.length > 0 && (
                <div className="md:hidden mt-4 flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                        totalItems={filteredData.length}
                        prevButtonContent={<ChevronLeftIcon />}
                        nextButtonContent={<ChevronRightIcon />}
                    />
                </div>
            )}

            <DetailModal
                item={selectedVoucher}
                onClose={() => setSelectedVoucher(null)}
                onConfirm={handleConfirmCompletion}
                onEditClick={handleEditClick}
                onDeleteClick={handleDeleteClick}
            />
            <EditVoucherModal
                isOpen={isEditModalOpen}
                onClose={() => {
                    setIsEditModalOpen(false);
                    setVoucherToEdit(null);
                }}
                item={voucherToEdit}
                onSave={handleSaveVoucher}
            />
            <ConfirmationModal
                isOpen={!!itemToDelete}
                onClose={() => setItemToDelete(null)}
                onConfirm={handleConfirmDelete}
                title="Xác nhận Xóa Phiếu"
                message={`Bạn có chắc chắn muốn xóa phiếu chuyển kho "${itemToDelete?.code}" không?`}
            />
            <VoucherModal
                isOpen={voucherModal.isOpen}
                voucherType={voucherModal.type}
                onClose={handleCloseVoucherModal}
            />
        </>
    );
};

export default ReportInternalTransfer;