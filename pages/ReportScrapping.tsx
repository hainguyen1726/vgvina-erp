import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLocation } from 'react-router-dom';
import FilterBar from '../components/ui/FilterBar';
import SummaryCard from '../components/ui/SummaryCard';
import Pagination from '../components/ui/Pagination';
import { TableActions } from '../components/ui/TableActions';
import VoucherModal from '../components/modals/VoucherModal';
import PrintVoucherTemplate from '../components/print/PrintVoucherTemplate';
import { Page, ScrappingVoucher } from '../types';
import { orderService } from '../src/services/orderService';
import { useBranch } from '../contexts/BranchContext';
import { DeleteIcon, PlusIcon, ExportIcon, EditIcon, ArrowsUpDownIcon, ArrowUpIcon, ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/icons/Icons';
import { useNotification } from '../contexts/NotificationContext';
import { formatDate } from '../src/utils/dateUtils';

// Confirmation Modal
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

// Detail Modal
const DetailModal = ({ item, onClose, onEditClick, onDeleteClick }: { item: ScrappingVoucher | null, onClose: () => void, onEditClick: (item: ScrappingVoucher) => void, onDeleteClick: (item: ScrappingVoucher) => void }) => {
    const { showNotification } = useNotification();
    const [isPrinting, setIsPrinting] = useState(false);

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
            date: item?.scrapping_date,
            items: item?.items.map(i => ({
                name: i.product.name,
                quantity: i.quantity,
                price: i.quantity > 0 ? i.value / i.quantity : 0,
                total: i.value,
                notes: i.notes
            })),
            reason: item?.reason,
            summary: {
                total: item?.total_value
            }
        };
    };

    if (!item) return null;

    const handleExport = () => {
        console.log("Exporting scrapping voucher to Excel:", JSON.stringify(item, null, 2));
        showNotification(`Đã xuất dữ liệu cho phiếu ${item.code} ra console.`, 'info');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b p-4">
                    <h3 className="text-lg font-semibold text-gray-800">Chi tiết phiếu hủy hàng</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="space-y-3 mb-4">
                        <div className="grid grid-cols-3 gap-4 text-sm"><p className="text-gray-500">Mã phiếu:</p><p className="font-medium col-span-2">{item.code}</p></div>
                        <div className="grid grid-cols-3 gap-4 text-sm"><p className="text-gray-500">Ngày hủy:</p><p className="col-span-2">{formatDate(item.scrapping_date)}</p></div>
                        <div className="grid grid-cols-3 gap-4 text-sm"><p className="text-gray-500">Người tạo:</p><p className="font-medium col-span-2">{item.creator_user}</p></div>
                        <div className="grid grid-cols-3 gap-4 text-sm"><p className="text-gray-500">Lý do:</p><p className="col-span-2">{item.reason}</p></div>
                        <div className="grid grid-cols-3 gap-4 text-sm"><p className="text-gray-500">Tổng giá trị:</p><p className="font-semibold text-red-600 col-span-2 text-right tabular-nums">{item.total_value.toLocaleString('vi-VN')} ₫</p></div>
                    </div>
                    <div className="pt-4 border-t"><h4 className="font-semibold mb-2">Chi tiết sản phẩm hủy</h4>
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50"><tr><th className="p-2 text-left">Sản phẩm</th><th className="p-2 text-right">Số lượng</th><th className="p-2 text-right">Giá trị</th><th className="p-2 text-left">Ghi chú</th></tr></thead>
                            <tbody>{item.items.map(i => <tr key={i.id} className="border-b"><td className="p-2">{i.product.name}</td><td className="p-2 text-right tabular-nums">{i.quantity}</td><td className="p-2 text-right tabular-nums">{i.value.toLocaleString('vi-VN')}</td><td className="p-2">{i.notes}</td></tr>)}</tbody>
                        </table>
                    </div>
                </div>
                <div className="border-t p-4 flex justify-end items-center bg-gray-50 rounded-b-lg space-x-2">
                    <button onClick={() => setIsPrinting(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]">
                        In phiếu
                    </button>
                    <button onClick={handleExport} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200">
                        <ExportIcon className="w-4 h-4" /> Xuất file
                    </button>
                    <button onClick={() => onEditClick(item)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"><EditIcon className="w-4 h-4" /> Sửa</button>
                    <button onClick={() => onDeleteClick(item)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50"><DeleteIcon className="w-4 h-4" /> Xóa</button>
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Đóng</button>
                </div>
            </div>
            {isPrinting && createPortal(
                <div id="print-section" className="hidden print:block bg-white p-0 m-0 z-[100]">
                    <PrintVoucherTemplate voucherType="scrapping-voucher" data={getPrintData()} />
                </div>,
                document.body
            )}
        </div>
    );
};

const allColumns = [
    { key: 'scrapping_date', label: 'Ngày hủy' },
    { key: 'code', label: 'Mã phiếu' },
    { key: 'total_value', label: 'Giá trị hủy' },
    { key: 'reason', label: 'Lý do' },
    { key: 'creator_user', label: 'Người tạo' },
];

const ReportScrapping: React.FC = () => {
    const { showNotification } = useNotification();
    const { selectedFacilityId, currentUser } = useBranch();
    const [vouchers, setVouchers] = useState<ScrappingVoucher[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(30);
    const [searchTerm, setSearchTerm] = useState('');
    const [modalItem, setModalItem] = useState<ScrappingVoucher | null>(null);
    const [itemToDelete, setItemToDelete] = useState<ScrappingVoucher | null>(null);
    const [voucherModal, setVoucherModal] = useState({ isOpen: false, type: '' });
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
    const [visibleColumns, setVisibleColumns] = useState(["scrapping_date", "code", "total_value", "reason", "creator_user"]);
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
            const data = await orderService.getScrappingVouchers(selectedFacilityId || undefined, employeeIdFilter);
            setVouchers(data as any[]);

            if (actionParam === 'view' && voucherIdParam) {
                const itemToView = data.find((v: any) => String(v.id) === voucherIdParam);
                if (itemToView) {
                    setModalItem(itemToView as any);
                }
            }
        } catch (error) {
            console.error("Failed to fetch scrapping vouchers", error);
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
                const itemDate = new Date(item.scrapping_date);
                if (fromDate && itemDate < fromDate) return false;
                if (toDate && itemDate > toDate) return false;
                return true;
            });
        }

        // Search filtering
        sortableItems = sortableItems.filter(item =>
            item.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.reason.toLowerCase().includes(searchTerm.toLowerCase())
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

    const totalCount = sortedData.length;
    const totalValue = sortedData.reduce((sum, item) => sum + (item.total_value || 0), 0);
    const totalQuantity = sortedData.reduce((sum, v) => sum + (v.items || []).reduce((itemSum, i) => itemSum + (Number(i.quantity) || 0), 0), 0);

    const totalPages = Math.ceil(sortedData.length / itemsPerPage);
    const paginatedData = sortedData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleEditClick = (item: ScrappingVoucher) => { console.log("Editing:", item.id); setModalItem(null); };
    const handleDeleteClick = (item: ScrappingVoucher) => setItemToDelete(item);
    const handleConfirmDelete = () => { if (itemToDelete) console.log("Deleting:", itemToDelete.id); setItemToDelete(null); setModalItem(null); };

    const renderCell = (item: ScrappingVoucher, columnKey: string) => {
        switch (columnKey) {
            case 'code': return <span className="font-medium text-gray-900">{item.code}</span>;
            case 'total_value': return <div className="font-medium text-red-600 text-right tabular-nums">{item.total_value.toLocaleString('vi-VN')} ₫</div>;
            case 'scrapping_date': return formatDate(item.scrapping_date);
            default: const value = item[columnKey as keyof ScrappingVoucher]; return String(value);
        }
    };

    return (
        <>
            <FilterBar onSearch={setSearchTerm} onTimeFilterChange={handleTimeFilterChange} pageTitle={Page.HuyHang} backPath="/bao-cao" />

            {/* Desktop Summary Cards */}
            <div className="hidden md:flex md:space-x-4">
                <SummaryCard title="Tổng số phiếu" value={String(totalCount)} icon={<div className="w-6 h-6 text-blue-600"><PlusIcon /></div>} colorClass="bg-blue-100" />
                <SummaryCard title="Tổng số lượng" value={String(totalQuantity)} icon={<div className="w-6 h-6 text-orange-600"><PlusIcon /></div>} colorClass="bg-orange-100" />
                <SummaryCard title="Tổng giá trị hủy" value={totalValue.toLocaleString('vi-VN') + ' ₫'} icon={<div className="w-6 h-6 text-red-600"><PlusIcon /></div>} colorClass="bg-red-100" />
            </div>

            {/* Mobile Summary Cards */}
            <div className="md:hidden grid grid-cols-2 gap-4">
                <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-xs font-medium text-gray-500">Tổng phiếu</p>
                    <p className="text-base font-bold text-blue-600 mt-1">{totalCount}</p>
                </div>
                <div className="bg-white p-3 rounded-lg shadow-sm">
                    <p className="text-xs font-medium text-gray-500">Tổng giá trị</p>
                    <p className="text-base font-bold text-red-600 mt-1">{(totalValue / 1000000).toFixed(1)}Tr</p>
                </div>
            </div>

            <TableActions
                onSearch={setSearchTerm} searchPlaceholder="Tìm theo mã phiếu, người tạo..."
                primaryActions={[
                    { label: 'Tạo phiếu hủy hàng', icon: <PlusIcon />, onClick: () => setVoucherModal({ isOpen: true, type: 'scrapping-voucher' }) },
                    { label: 'Xuất file', icon: <ExportIcon />, onClick: () => { }, variant: 'secondary' },
                ]}
                columns={allColumns} visibleColumns={visibleColumns} onVisibleColumnsChange={setVisibleColumns}
            />

            {/* Desktop Table */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="text-xs text-gray-700 bg-gray-50">
                            <tr>{allColumns.filter(c => visibleColumns.includes(c.key)).map(col => {
                                const isNumeric = ['total_value'].includes(col.key);
                                return (
                                    <th key={col.key} scope="col" className={`px-6 py-3 cursor-pointer ${isNumeric ? 'text-right' : 'text-left'}`} onClick={() => requestSort(col.key)}>
                                        <div className={`flex items-center ${isNumeric ? 'justify-end' : ''}`}>{col.label}
                                            <span className="ml-1.5">{sortConfig?.key === col.key ? (sortConfig.direction === 'ascending' ? <ArrowUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4 ml-0" />) : (<ArrowsUpDownIcon className="h-4 w-4 text-gray-300" />)}</span>
                                        </div>
                                    </th>
                                );
                            })}
                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((item) => (
                                <tr key={item.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => setModalItem(item)}>
                                    {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => <td key={col.key} className="px-6 py-4">{renderCell(item, col.key)}</td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {paginatedData.length > 0 &&
                    <div className="p-4">
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={setItemsPerPage} totalItems={sortedData.length} />
                    </div>
                }
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden mt-4 space-y-3">
                {paginatedData.map((item) => (
                    <div
                        key={item.id}
                        className="bg-white p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
                        onClick={() => setModalItem(item)}
                    >
                        <div className="flex justify-between items-start text-sm">
                            <div className="pr-2">
                                <p className="font-semibold text-gray-800 leading-tight">{item.code}</p>
                                <p className="text-xs text-gray-500 mt-0.5">{item.creator_user}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold whitespace-nowrap text-red-600">
                                    - {item.total_value.toLocaleString('vi-VN')} ₫
                                </p>
                                <p className="text-xs text-gray-500 mt-1">{item.reason}</p>
                            </div>
                        </div>
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-xs text-gray-500">{item.facility_name}</p>
                            <p className="text-xs text-gray-400">{formatDate(item.scrapping_date)}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Mobile Pagination */}
            <div className="md:hidden mt-4 flex justify-center">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                    totalItems={sortedData.length}
                    prevButtonContent={<ChevronLeftIcon />}
                    nextButtonContent={<ChevronRightIcon />}
                />
            </div>

            <DetailModal item={modalItem} onClose={() => setModalItem(null)} onEditClick={handleEditClick} onDeleteClick={handleDeleteClick} />
            <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleConfirmDelete} title="Xác nhận Xóa Phiếu Hủy" message={`Bạn có chắc chắn muốn xóa phiếu "${itemToDelete?.code}"?`} />
            <VoucherModal isOpen={voucherModal.isOpen} voucherType={voucherModal.type} onClose={() => setVoucherModal({ isOpen: false, type: '' })} />
        </>
    );
};

export default ReportScrapping;