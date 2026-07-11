import React, { useState, useMemo, useEffect, useRef } from 'react';
import { formatDateTime, formatDate } from '../src/utils/dateUtils';
import FilterBar from '../components/ui/FilterBar';
import SummaryCard from '../components/ui/SummaryCard';
import Pagination from '../components/ui/Pagination';
import { TableActions } from '../components/ui/TableActions';
import VoucherModal from '../components/modals/VoucherModal';
import { Page, Product } from '../types';
import { productService } from '../src/services/productService';

import { KhoIcon, PlusIcon, ExportIcon, ArrowUpIcon, ChevronDownIcon, ArrowsUpDownIcon, EditIcon, DeleteIcon, ChevronLeftIcon, ChevronRightIcon, ExcelIcon } from '../components/icons/Icons';
import { useNotification } from '../contexts/NotificationContext';
import SearchableSelect from '../components/ui/SearchableSelect';
import { categoryService, Category } from '../src/services/categoryService';
import { Facility } from '../src/services/facilityService';
import { excelUtils } from '../src/utils/excelUtils';
import { auditLogService } from '../src/services/auditLogService';
import { AuditLog } from '../types';
import ProductMovementModal from '../components/modals/ProductMovementModal';

const allColumns = [
    { key: 'sku', label: 'Mã sku' },
    { key: 'name', label: 'Tên sản phẩm' },
    { key: 'unit', label: 'Đơn vị' },
    { key: 'quantity', label: 'Tồn kho' },
    { key: 'warehouse', label: 'Kho' },
    { key: 'category', label: 'Danh mục' },
];

// --- MODAL COMPONENTS ---

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
                <div className="p-6"><h3 className="text-lg font-bold text-gray-900">{title}</h3><p className="mt-2 text-sm text-gray-600">{message}</p></div>
                <div className="border-t p-4 flex justify-end bg-gray-50 rounded-b-lg space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Hủy</button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700">Xác nhận Xóa</button>
                </div>
            </div>
        </div>
    );
};

const FIELD_NAME_MAP: Record<string, string> = {
    'sku': 'Mã SKU',
    'name': 'Tên sản phẩm',
    'unit': 'Đơn vị tính',
    'price': 'Đơn giá',
    'quantity': 'Số lượng',
    'category_id': 'Danh mục',
    'notes': 'Ghi chú',
    'facility_id': 'Chi nhánh/Kho'
};

interface EditHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}

const EditHistoryModal: React.FC<EditHistoryModalProps> = ({ isOpen, onClose, product }) => {
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);
    const [history, setHistory] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

    useEffect(() => {
        if (isOpen && product) {
            setLoading(true);
            auditLogService.getLogsByRecordId('vgvina_products', product.id)
                .then(data => {
                    setHistory(data);
                    setLoading(false);
                })
                .catch(err => {
                    console.error("Error loading product history:", err);
                    setLoading(false);
                });
        }
    }, [isOpen, product]);

    if (!isOpen || !product) return null;

    const renderAction = (action: string) => {
        switch (action) {
            case 'CREATE': return <span className="text-green-600 font-bold">TẠO MỚI</span>;
            case 'UPDATE': return <span className="text-blue-600 font-bold">CẬP NHẬT</span>;
            case 'DELETE': return <span className="text-red-600 font-bold">XÓA</span>;
            default: return action;
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b p-4">
                    <h3 className="text-lg font-semibold text-gray-800">Lịch sử chỉnh sửa: {product.name}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {loading ? (
                        <div className="flex justify-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : history.length === 0 ? (
                        <p className="text-center py-10 text-gray-500">Chưa có lịch sử chỉnh sửa cho sản phẩm này.</p>
                    ) : (
                        <div className="space-y-4">
                            {history.map((log) => {
                                const isExpanded = selectedLog?.id === log.id;
                                const allKeys = new Set([
                                    ...Object.keys(log.oldValues || {}),
                                    ...Object.keys(log.newValues || {})
                                ]);

                                return (
                                    <div key={log.id} className="border rounded-lg overflow-hidden transition-all">
                                        <div
                                            className={`p-3 flex justify-between items-center cursor-pointer hover:bg-gray-50 ${isExpanded ? 'bg-blue-50 border-b' : ''}`}
                                            onClick={() => setSelectedLog(isExpanded ? null : log)}
                                        >
                                            <div className="flex items-center space-x-3">
                                                <div className="text-sm">
                                                    <p className="font-semibold text-gray-800">{formatDateTime(log.timestamp)}</p>
                                                    <p className="text-xs text-gray-500">Bởi: {log.userName}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center space-x-3">
                                                {renderAction(log.action)}
                                                <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                                                    <ChevronDownIcon className="w-5 h-5 text-gray-400" />
                                                </span>
                                            </div>
                                        </div>

                                        {isExpanded && (
                                            <div className="p-3 bg-white">
                                                <table className="w-full text-xs border-collapse">
                                                    <thead>
                                                        <tr className="bg-gray-50">
                                                            <th className="border p-2 text-left w-1/4">Trường</th>
                                                            <th className="border p-2 text-left">Giá trị cũ</th>
                                                            <th className="border p-2 text-left">Giá trị mới</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {Array.from(allKeys).filter(k => !['id', 'created_at', 'updated_at', 'facility_id'].includes(k)).map(key => {
                                                            const oldVal = log.oldValues?.[key];
                                                            const newVal = log.newValues?.[key];
                                                            if (oldVal === newVal) return null;
                                                            return (
                                                                <tr key={key} className="bg-red-50/30">
                                                                    <td className="border p-2 font-normal text-gray-700">{FIELD_NAME_MAP[key] || key}</td>
                                                                    <td className="border p-2 text-right text-gray-500 line-through tabular-nums font-normal">{oldVal !== null && oldVal !== undefined ? String(oldVal) : '-'}</td>
                                                                    <td className="border p-2 text-right text-red-600 font-normal tabular-nums">{newVal !== null && newVal !== undefined ? String(newVal) : '-'}</td>
                                                                </tr>
                                                            );
                                                        })}
                                                    </tbody>
                                                </table>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="border-t p-4 flex justify-end bg-gray-50 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Đóng</button>
                </div>
            </div>
        </div>
    );
};

interface EditProductModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (product: Product) => void;
    product: Product | null;
    facilities: Facility[];
    categories: Category[];
}

const EditProductModal: React.FC<EditProductModalProps> = ({ isOpen, onClose, onSave, product, facilities, categories }) => {
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);
    const emptyProduct: Product = {
        id: '',
        sku: '',
        name: '',
        unit: '',
        category: '',
        category_id: '',
        quantity: 0,
        warehouse: '',
        facility_id: '',
        price: 0
    };

    const [formData, setFormData] = useState<Product>(product || emptyProduct);
    useEffect(() => { setFormData(product || emptyProduct); }, [product]);
    if (!isOpen) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'quantity' || name === 'price' ? parseFloat(value) : value }));
    };

    const handleSubmit = (e: React.FormEvent) => { e.preventDefault(); onSave(formData); };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[70] flex justify-center items-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b p-4">
                    <h3 className="text-lg font-semibold text-gray-800">{product?.id ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h3>
                    <button type="button" onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Mã SKU</label>
                        <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Ví dụ: SP001" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Tên sản phẩm</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Nhập tên sản phẩm" required />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Đơn vị tính</label>
                        <input type="text" name="unit" value={formData.unit} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Ví dụ: Kg, Cái, Thùng" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Danh mục</label>
                        <SearchableSelect
                            options={categories.map(c => ({ id: c.id, name: c.name }))}
                            value={formData.category_id || ''}
                            onChange={(val) => {
                                const cat = categories.find(c => c.id === val);
                                setFormData(prev => ({ ...prev, category_id: val, category: cat?.name || '' }));
                            }}
                            placeholder="Chọn hạng mục"
                        />
                    </div>
                    {/* Tồn kho không nhập tay khi tạo/sửa sản phẩm — luôn = 0 lúc tạo,
                         về sau cập nhật qua phiếu nhập (PO) hoặc Đồng bộ tồn kho. */}
                    {/* Sản phẩm là master toàn hệ thống — không gán kho lúc tạo;
                         tồn theo từng chi nhánh ở bảng vgvina_inventory. */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700">Giá vốn</label>
                        <input type="number" name="price" value={formData.price} onChange={handleChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" />
                    </div>
                </div>
                <div className="border-t p-4 flex justify-end bg-gray-50 rounded-b-lg space-x-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Hủy</button>
                    <button type="submit" className="px-4 py-2 text-sm font-medium bg-[#0066cc] text-white rounded-md hover:bg-[#0052a3]">{product?.id ? 'Lưu thay đổi' : 'Thêm sản phẩm'}</button>
                </div>
            </form>
        </div>
    );
};




interface ProductDetailModalProps {
    product: Product | null;
    onClose: () => void;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    onHistory: (product: Product) => void;
    onTheKho: (product: Product) => void;
    onExport: (product: Product) => void;
    canEdit: boolean;
    canDelete: boolean;
}

const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, onClose, onEdit, onDelete, onHistory, onTheKho, onExport, canEdit, canDelete }) => {
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (product) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [product, onClose]);
    const { showNotification } = useNotification();
    if (!product) return null;

    if (!product) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b p-4"><h3 className="text-lg font-semibold text-gray-800">Chi tiết sản phẩm</h3><button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button></div>
                <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-3 gap-4 items-center text-sm">
                        <p className="text-gray-500 col-span-1">Mã SKU:</p>
                        <p className="font-medium text-gray-800 col-span-2">{product.sku}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center text-sm">
                        <p className="text-gray-500 col-span-1">Tên sản phẩm:</p>
                        <p className="font-medium text-gray-800 col-span-2">{product.name}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center text-sm">
                        <p className="text-gray-500 col-span-1">Đơn vị:</p>
                        <p className="text-gray-800 col-span-2">{product.unit}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center text-sm">
                        <p className="text-gray-500 col-span-1">Danh mục:</p>
                        <p className="text-gray-800 col-span-2">{product.category}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-4 items-center text-sm">
                        <p className="text-gray-500 col-span-1">Tổng tồn kho:</p>
                        <p className="font-semibold text-gray-800 col-span-2 text-right">{product.quantity.toLocaleString('vi-VN')} {product.unit}</p>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                        <h4 className="font-semibold text-gray-700 mb-2 text-sm">Tồn kho theo chi nhánh</h4>
                        <ul className="space-y-2 text-sm">
                            {(() => {
                                const list = ((product as any).inventoryByFacility || []) as { facility_id: string; facility_name: string; quantity: number }[];
                                if (list.length === 0) {
                                    return (
                                        <li className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                            <span className="text-gray-500 italic">Chưa có tồn ở chi nhánh nào</span>
                                            <span className="font-medium text-gray-800">0 {product.unit}</span>
                                        </li>
                                    );
                                }
                                return list.map(inv => (
                                    <li key={inv.facility_id} className="flex justify-between items-center bg-gray-50 p-2 rounded-md">
                                        <span className="text-gray-600">{inv.facility_name || 'Chi nhánh'}:</span>
                                        <span className="font-medium text-gray-800">{inv.quantity.toLocaleString('vi-VN')} {product.unit}</span>
                                    </li>
                                ));
                            })()}
                        </ul>
                    </div>

                </div>
                <div className="border-t p-4 flex justify-end items-center bg-gray-50 rounded-b-lg space-x-2">
                    <button onClick={() => onExport(product)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200">
                        <ExportIcon className="w-4 h-4" /> Xuất file
                    </button>
                    <button onClick={() => onTheKho(product)} className="px-4 py-2 text-sm font-medium bg-blue-100 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-200">Thẻ kho</button>
                    <button onClick={() => onHistory(product)} className="px-4 py-2 text-sm font-medium bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50">Lịch sử</button>
                    {canEdit && <button onClick={() => onEdit(product)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"><EditIcon className="w-4 h-4" />Sửa</button>}
                    {canDelete && <button onClick={() => onDelete(product)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50"><DeleteIcon className="w-4 h-4" />Xóa</button>}
                </div>
            </div>
        </div>
    );
};


// --- MAIN COMPONENT ---

import { useBranch } from '../contexts/BranchContext';

const Warehouse: React.FC = () => {
    const { selectedFacilityId, currentUser, facilities, availableBranches } = useBranch();
    const { showNotification } = useNotification();
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInitialData = async () => {
            try {
                setLoading(true);
                // Fetch categories
                const cats = await categoryService.getProductCategories();
                setCategories(cats);

                // Fetch products
                const facilityFilter = selectedFacilityId === null
                    ? (currentUser?.is_admin ? undefined : '00000000-0000-0000-0000-000000000000')
                    : selectedFacilityId;

                // ⚠️ DEBUG: Log when non-admin has no facility
                if (selectedFacilityId === null && !currentUser?.is_admin) {
                    console.warn('[Warehouse] ⚠️ Non-admin user has NO facility assigned!', {
                        user: currentUser?.name,
                        branch: currentUser?.branch,
                        available: availableBranches,
                        selectedFacilityId,
                        reason: 'Check vgvina_user_facilities - user may not be mapped to any facility'
                    });
                    // Show notification to user
                    showNotification(
                        'Cảnh báo: Bạn chưa được gán chi nhánh. Liên hệ quản trị viên.',
                        'warning'
                    );
                }

                const data = await productService.getProducts(facilityFilter);
                setProducts(data);
            } catch (error) {
                console.error("Failed to fetch data", error);
            } finally {
                setLoading(false);
            }
        };
        fetchInitialData();
    }, [selectedFacilityId, currentUser, availableBranches, showNotification]);

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(isMobile ? 8 : 30);
    const [searchTerm, setSearchTerm] = useState('');
    const [visibleColumns, setVisibleColumns] = useState(["sku", "name", "unit", "quantity", "warehouse", "category"]);
    const [voucherModal, setVoucherModal] = useState({ isOpen: false, type: '' });
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
    const [isSyncing, setIsSyncing] = useState(false);

    // State for modals
    const [detailModalItem, setDetailModalItem] = useState<Product | null>(null);
    const [editModalItem, setEditModalItem] = useState<Product | null>(null);
    const [isAddingNew, setIsAddingNew] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [historyModalItem, setHistoryModalItem] = useState<Product | null>(null);
    const [theKhoModalItem, setTheKhoModalItem] = useState<Product | null>(null);
    const [itemToDelete, setItemToDelete] = useState<Product | null>(null);

    // --- Permissions Check ---
    const canDelete = currentUser?.is_admin;
    const canEdit = currentUser?.is_admin || currentUser?.role === 'Nhân viên kho';

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

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const { sortedProducts, totalQuantity } = useMemo(() => {
        let sortableProducts = [...products].filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.sku.toLowerCase().includes(searchTerm.toLowerCase()));

        if (sortConfig !== null) {
            sortableProducts.sort((a, b) => {
                const aValue = a[sortConfig.key as keyof Product];
                const bValue = b[sortConfig.key as keyof Product];
                if (typeof aValue === 'string' && typeof bValue === 'string') return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }

        const quantity = products.reduce((sum, p) => sum + p.quantity, 0);

        return { sortedProducts: sortableProducts, totalQuantity: quantity };
    }, [searchTerm, sortConfig, products]);

    const totalPages = Math.ceil(sortedProducts.length / itemsPerPage);
    const paginatedProducts = sortedProducts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleOpenVoucherModal = (type: string) => setVoucherModal({ isOpen: true, type });
    const handleCloseVoucherModal = () => setVoucherModal({ isOpen: false, type: '' });

    // --- Modal Handlers ---
    const handleRowClick = (product: Product) => setDetailModalItem(product);
    const handleOpenEdit = (product: Product) => { setDetailModalItem(null); setEditModalItem(product); setIsAddingNew(false); };
    const handleOpenCreate = () => { setEditModalItem(null); setIsAddingNew(true); };
    const handleOpenHistory = (product: Product) => {
        setDetailModalItem(null);
        setHistoryModalItem(product);
    };
    const handleOpenTheKho = (product: Product) => {
        setDetailModalItem(null);
        setTheKhoModalItem(product);
    };
    const handleDeleteClick = (product: Product) => { setDetailModalItem(null); setItemToDelete(product); };

    const handleSaveProduct = async (productData: Product) => {
        try {
            if (productData.id) {
                // Update
                await productService.updateProduct(productData);
                setProducts(products.map(p => p.id === productData.id ? productData : p));
                showNotification('Cập nhật sản phẩm thành công', 'success');
            } else {
                // Create
                const newProduct = await productService.createProduct(productData);
                if (newProduct) {
                    // Map back to our Product type if needed, or just re-fetch
                    // For now, let's just re-fetch to be safe and accurate
                    const facilityFilter = selectedFacilityId === null
                        ? (currentUser?.is_admin ? undefined : '00000000-0000-0000-0000-000000000000')
                        : selectedFacilityId;
                    const data = await productService.getProducts(facilityFilter);
                    setProducts(data);
                    showNotification('Thêm sản phẩm mới thành công', 'success');
                }
            }
            setEditModalItem(null);
            setIsAddingNew(false);
        } catch (error: any) {
            showNotification('Lỗi khi lưu sản phẩm: ' + error.message, 'error');
        }
    };

    const handleConfirmDelete = async () => {
        if (itemToDelete) {
            try {
                await productService.deleteProduct(itemToDelete.id);
                setProducts(products.filter(p => p.id !== itemToDelete.id));
                showNotification('Xóa sản phẩm thành công', 'success');
            } catch (error: any) {
                console.error("Failed to delete product:", error);
                if (error.message?.includes('violates foreign key constraint') || error.code === '23503') {
                    showNotification('Không thể xóa sản phẩm này vì đã có lịch sử nhập/xuất kho hoặc phát sinh giao dịch.', 'error');
                } else {
                    showNotification('Không thể xóa sản phẩm: ' + error.message, 'error');
                }
            } finally {
                setItemToDelete(null);
            }
        }
    };

    const handleExport = async (product: Product) => {
        try {
            showNotification(`Đang chuẩn bị dữ liệu thẻ kho cho ${product.name}...`, 'info');
            const history = await productService.getInventoryMovementHistory(product.id);

            excelUtils.exportInventoryCard(product, history || [], `TheKho_${product.sku}`, product.warehouse || 'Tất cả');
            showNotification(`Đã xuất thẻ kho cho sản phẩm ${product.name}.`, 'success');
        } catch (error: any) {
            console.error("Export failed:", error);
            showNotification("Lỗi khi xuất dữ liệu: " + error.message, 'error');
        }
    };

    const handleSyncInventory = async () => {
        if (!currentUser?.is_admin) return;
        setIsSyncing(true);
        try {
            showNotification('Đang đồng bộ tồn kho...', 'info');
            const results = await productService.syncInventory();
            const changed = results.filter(r => r.old_quantity !== r.new_quantity);
            // Reload products after sync
            const facilityFilter = selectedFacilityId === null
                ? (currentUser?.is_admin ? undefined : '00000000-0000-0000-0000-000000000000')
                : selectedFacilityId;
            const data = await productService.getProducts(facilityFilter);
            setProducts(data);
            if (changed.length > 0) {
                showNotification(`✅ Đồng bộ xong! ${changed.length} sản phẩm được cập nhật.`, 'success');
            } else {
                showNotification('✅ Tồn kho đã chính xác, không cần cập nhật.', 'success');
            }
        } catch (error: any) {
            showNotification('Lỗi đồng bộ: ' + error.message, 'error');
        } finally {
            setIsSyncing(false);
        }
    };

    const handleExportAll = () => {
        const dataToExport = sortedProducts.map(p => ({
            sku: p.sku,
            name: p.name,
            unit: p.unit,
            category: p.category,
            warehouse: p.warehouse,
            quantity: p.quantity,
            price: p.price
        }));
        const facilityName = selectedFacilityId ? (facilities.find(f => f.id === selectedFacilityId)?.name || 'Tất cả') : 'Tất cả';
        excelUtils.exportInventoryList(dataToExport, `DanhSachTonKho_${new Date().toISOString().split('T')[0]}`, facilityName);
        showNotification(`Đã xuất danh sách ${sortedProducts.length} sản phẩm ra file Excel.`, 'success');
    };

    const handleImportClick = () => {
        if (fileInputRef.current) {
            fileInputRef.current.click();
        }
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            showNotification('Đang đọc file Excel...', 'info');
            const data = await excelUtils.readExcel(file);

            if (data && data.length > 0) {
                // Determine headers row, typically they are the first object keys mapping
                const mappedProducts = data.map((item: any) => ({
                    sku: item['Mã SKU'] || item['sku'] || item['Mã sku'] || item['Mã hàng'],
                    name: item['Tên sản phẩm'] || item['name'] || item['Tên hàng'],
                    unit: item['Đơn vị'] || item['unit'] || 'Cái',
                    quantity: Number(item['Số lượng'] || item['Tồn kho'] || item['quantity'] || 0),
                    price: Number(item['Đơn giá'] || item['Giá bán'] || item['price'] || 0),
                })).filter(p => !!p.sku && !!p.name);

                if (mappedProducts.length === 0) {
                    showNotification('Không tìm thấy dữ liệu hợp lệ (Cần cột "Mã SKU" và "Tên sản phẩm")', 'warning');
                    return;
                }

                showNotification(`Đang nhập khẩu ${mappedProducts.length} sản phẩm...`, 'info');

                // Add facility_id and category_id for imported products if defaults are set
                const productsToUpsert = mappedProducts.map(p => ({
                    ...p,
                    facility_id: selectedFacilityId || facilities[0]?.id || null, // Default to current facility
                }));

                await productService.bulkUpsertProducts(productsToUpsert);
                showNotification(`Nhập thành công ${mappedProducts.length} sản phẩm!`, 'success');

                // Refresh list
                const facilityFilter = selectedFacilityId === null
                    ? (currentUser?.is_admin ? undefined : '00000000-0000-0000-0000-000000000000')
                    : selectedFacilityId;
                const freshData = await productService.getProducts(facilityFilter);
                setProducts(freshData);
            } else {
                showNotification('File trống hoặc không đúng định dạng', 'warning');
            }
        } catch (error: any) {
            console.error('Import error', error);
            showNotification('Lỗi khi import file: ' + error.message, 'error');
        } finally {
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const renderCell = (product: Product, columnKey: string) => {
        switch (columnKey) {
            case 'sku': return <span className="font-medium text-gray-900 whitespace-nowrap">{product.sku}</span>;
            case 'quantity': return <div className="text-right whitespace-nowrap tabular-nums">{product.quantity}</div>;
            case 'warehouse': return product.warehouse || <span className="text-red-500 italic text-xs">Chưa gán</span>;
            default: const value = product[columnKey as keyof Product]; return typeof value === 'string' || typeof value === 'number' ? String(value) : 'N/A';
        }
    };

    return (
        <>
            <FilterBar onSearch={setSearchTerm} onTimeFilterChange={() => { }} pageTitle={Page.TonKho} backPath="/bao-cao" />

            {/* Desktop Summary Cards */}
            <div className="hidden md:flex space-x-4">
                <SummaryCard title="Giá trị tồn kho" value={totalQuantity > 0 ? ((products.reduce((sum, p) => sum + (p.quantity * p.price), 0)) / 1000000000 > 1 ? (products.reduce((sum, p) => sum + (p.quantity * p.price), 0) / 1000000000).toFixed(1) + " Tỷ" : (products.reduce((sum, p) => sum + (p.quantity * p.price), 0) / 1000000).toFixed(1) + " Tr") : "0 ₫"} icon={<KhoIcon />} colorClass="bg-blue-100 text-blue-600" />
                <SummaryCard title="Tổng số lượng" value={totalQuantity.toLocaleString('vi-VN')} icon={<KhoIcon />} colorClass="bg-green-100 text-green-600" />
                <SummaryCard title="Sản phẩm dưới định mức" value={products.filter(p => p.quantity < 10).length.toString()} icon={<KhoIcon />} colorClass="bg-yellow-100 text-yellow-600" />
            </div>

            {/* Mobile Summary Cards */}
            <div className="md:hidden grid grid-cols-2 gap-4">
                <div className="block bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-xs font-medium text-gray-500">Giá trị tồn</p>
                    <p className="text-base font-bold text-blue-600 mt-1">{totalQuantity > 0 ? ((products.reduce((sum, p) => sum + (p.quantity * p.price), 0)) / 1000000000 > 1 ? (products.reduce((sum, p) => sum + (p.quantity * p.price), 0) / 1000000000).toFixed(1) + " Tỷ" : (products.reduce((sum, p) => sum + (p.quantity * p.price), 0) / 1000000).toFixed(1) + " Tr") : "0 ₫"}</p>
                </div>
                <div className="block bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-xs font-medium text-gray-500">Tổng số lượng</p>
                    <p className="text-base font-bold text-gray-800 mt-1">{totalQuantity.toLocaleString('vi-VN')}</p>
                </div>
            </div>

            <TableActions
                onSearch={setSearchTerm}
                searchPlaceholder="Tìm theo mã hoặc tên sản phẩm..."
                primaryActions={[
                    { label: 'Thêm sản phẩm', icon: <PlusIcon />, onClick: handleOpenCreate },
                    { label: 'Tạo phiếu', icon: <PlusIcon />, onClick: () => { }, subActions: [{ label: 'Phiếu thu/chi', onClick: () => handleOpenVoucherModal('income-expense-voucher') }, { label: 'Phiếu nhập hàng', onClick: () => handleOpenVoucherModal('purchase-order') }, { label: 'Phiếu xuất hàng', onClick: () => handleOpenVoucherModal('delivery-note') }, { label: 'Thông báo công nợ khách', onClick: () => handleOpenVoucherModal('debt-notice') }, { label: 'Phiếu thanh lý', onClick: () => handleOpenVoucherModal('liquidation') }] },
                    { label: 'Import Excel', icon: <ExcelIcon />, onClick: handleImportClick, variant: 'secondary' },
                    { label: 'Xuất file', icon: <ExportIcon />, onClick: handleExportAll, variant: 'secondary' },
                    ...(currentUser?.is_admin ? [{ label: isSyncing ? 'Đang đồng bộ...' : '🔄 Đồng bộ tồn kho', onClick: handleSyncInventory, variant: 'secondary' as const }] : [])
                ]}
                columns={allColumns} visibleColumns={visibleColumns} onVisibleColumnsChange={setVisibleColumns}
            />

            <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept=".xlsx, .xls, .csv"
                onChange={handleFileUpload}
            />

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-gray-500">
                        <thead className="text-xs text-gray-700 bg-gray-50">
                            <tr>
                                {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => {
                                    const isNumeric = ['quantity', 'price'].includes(col.key);
                                    return (
                                        <th key={col.key} scope="col" className={`px-6 py-3 cursor-pointer ${isNumeric ? 'text-right' : 'text-left'}`} onClick={() => requestSort(col.key)}>
                                            <div className={`flex items-center min-w-0 ${isNumeric ? 'justify-end' : ''}`}>
                                                {col.label}
                                                <span className="ml-1.5 shrink-0">{sortConfig?.key === col.key ? (sortConfig.direction === 'ascending' ? <ArrowUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4 ml-0" />) : (<ArrowsUpDownIcon className="h-4 w-4 text-gray-300" />)}</span>
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedProducts.map((product) => (
                                <tr key={product.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(product)}>
                                    {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => (<td key={col.key} className="px-6 py-4">{renderCell(product, col.key)}</td>))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-4"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }} totalItems={sortedProducts.length} /></div>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden mt-4 space-y-3">
                {paginatedProducts.map((product) => (
                    <div
                        key={product.id}
                        className="bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => handleRowClick(product)}
                    >
                        <div className="flex justify-between items-start text-sm">
                            <div className="pr-2">
                                <p className="font-semibold text-gray-800 leading-tight">{product.name}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{product.sku}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold whitespace-nowrap text-gray-800">
                                    {product.quantity.toLocaleString('vi-VN')} <span className="font-normal text-xs">{product.unit}</span>
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{product.category}</p>
                            </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">{product.warehouse}</p>
                    </div>
                ))}
            </div>

            {/* Mobile Pagination */}
            <div className="md:hidden mt-4">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                    totalItems={sortedProducts.length}
                    prevButtonContent={<ChevronLeftIcon />}
                    nextButtonContent={<ChevronRightIcon />}
                />
            </div>


            <VoucherModal isOpen={voucherModal.isOpen} voucherType={voucherModal.type} onClose={handleCloseVoucherModal} />

            {/* Detail, Edit, History, and Confirmation Modals */}
            <ProductDetailModal product={detailModalItem} onClose={() => setDetailModalItem(null)} onEdit={handleOpenEdit} onDelete={handleDeleteClick} onHistory={handleOpenHistory} onTheKho={handleOpenTheKho} onExport={handleExport} canEdit={canEdit} canDelete={canDelete} />
            <EditProductModal
                isOpen={!!editModalItem || isAddingNew}
                onClose={() => { setEditModalItem(null); setIsAddingNew(false); }}
                onSave={handleSaveProduct}
                product={editModalItem}
                facilities={facilities}
                categories={categories}
            />
            <EditHistoryModal isOpen={!!historyModalItem} onClose={() => setHistoryModalItem(null)} product={historyModalItem} />
            <ProductMovementModal isOpen={!!theKhoModalItem} onClose={() => setTheKhoModalItem(null)} product={theKhoModalItem} dateRange={{}} />
            <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleConfirmDelete} title={`Xác nhận Xóa Sản phẩm`} message={`Bạn có chắc chắn muốn xóa sản phẩm "${itemToDelete?.name}" không?`} />
        </>
    );
};

export default Warehouse;