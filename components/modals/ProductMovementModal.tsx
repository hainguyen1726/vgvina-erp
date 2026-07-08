import React, { useState, useEffect, useMemo } from 'react';
import { productService } from '../../src/services/productService';
import { formatDate } from '../../src/utils/dateUtils';
import { excelUtils } from '../../src/utils/excelUtils';
import { ExcelIcon } from '../icons/Icons';
import { useBranch } from '../../contexts/BranchContext';

interface ProductMovementModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: any;
    dateRange: { from?: string; to?: string };
    typeFilters?: string[];
    facilityId?: string;   // override facility scope; if omitted, uses BranchContext's selectedFacilityId
}

const ProductMovementModal: React.FC<ProductMovementModalProps> = ({ isOpen, onClose, product, dateRange, typeFilters, facilityId }) => {
    const { selectedFacilityId } = useBranch();
    const effectiveFacilityId = facilityId !== undefined ? facilityId : (selectedFacilityId || undefined);
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);
    const [movements, setMovements] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);

    const [localDateFrom, setLocalDateFrom] = useState('');
    const [localDateTo, setLocalDateTo] = useState('');

    const [selectedVoucher, setSelectedVoucher] = useState<any | null>(null);
    const [voucherDetails, setVoucherDetails] = useState<any | null>(null);
    const [loadingVoucherItems, setLoadingVoucherItems] = useState(false);

    // Format quantity/balance for display: trim trailing zeros, cap at 4 decimals,
    // and absorb floating-point drift from legacy data.
    const formatQty = (n: any) => {
        const num = Number(n);
        if (!Number.isFinite(num)) return '-';
        return (Math.round(num * 10000) / 10000).toLocaleString('vi-VN', { maximumFractionDigits: 4 });
    };

    const getVoucherOriginUrl = (type: string, id: string) => {
        if (!type || !id) return '#';
        if (type.includes('Bán') || type.includes('Mua')) return `/bao-cao/xuat-nhap?action=view&voucherId=${id}`;
        if (type.includes('điều chuyển')) return `/bao-cao/chuyen-kho?action=view&voucherId=${id}`;
        if (type.includes('Trả')) return `/bao-cao/tra-hang?action=view&voucherId=${id}`;
        if (type.includes('Hủy')) return `/bao-cao/huy-hang?action=view&voucherId=${id}`;
        return '#';
    };

    const handleVoucherClick = async (m: any) => {
        if (!m.voucherId) return;
        setSelectedVoucher(m);
        setLoadingVoucherItems(true);
        try {
            const data = await productService.getVoucherMovementDetails(m.voucherId, m.type);
            setVoucherDetails(data);
        } catch (err) {
            console.error("Lỗi lấy chi tiết phiếu", err);
        } finally {
            setLoadingVoucherItems(false);
        }
    };

    useEffect(() => {
        if (isOpen && product) {
            fetchMovements();
        }

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                if (selectedVoucher) {
                    setSelectedVoucher(null);
                } else {
                    onClose();
                }
            }
        };

        if (isOpen) {
            window.addEventListener('keydown', handleEscape);
        }

        return () => {
            window.removeEventListener('keydown', handleEscape);
        };
    }, [isOpen, product, dateRange, selectedVoucher, onClose, effectiveFacilityId]);

    const fetchMovements = async () => {
        if (!product) return;
        setLoading(true);
        try {
            // Note: Currently getInventoryMovementHistory gets ALL movements. 
            // We'll filter it down locally based on dateRange to ensure accurate totals within the period.
            const data = await productService.getInventoryMovementHistory(product.id || product.productId, effectiveFacilityId || undefined);
            setMovements(data);
        } catch (error) {
            console.error('Failed to fetch movements:', error);
        } finally {
            setLoading(false);
        }
    };

    const displayMovements = useMemo(() => {
        if (!movements || movements.length === 0) return [];
        let filtered = movements;

        if (localDateFrom) {
            const fromTs = new Date(localDateFrom).getTime();
            filtered = filtered.filter(m => new Date(m.date).getTime() >= fromTs);
        }
        if (localDateTo) {
            const toTs = new Date(localDateTo + 'T23:59:59.999Z').getTime();
            filtered = filtered.filter(m => new Date(m.date).getTime() <= toTs);
        }
        if (typeFilters && typeFilters.length > 0) {
            filtered = filtered.filter(m => typeFilters.includes(m.type));
        }

        // Recalculate balance for the filtered display (optional, but requested for KiotViet logic)
        // Round each step to 4 decimals to avoid IEEE 754 drift in the running total.
        let currentBalance = 0;
        return filtered.map(m => {
            currentBalance = Math.round((currentBalance + Number(m.qty_in) - Number(m.qty_out)) * 10000) / 10000;
            return { ...m, balance: currentBalance };
        }).reverse();

    }, [movements, localDateFrom, localDateTo, typeFilters]);

    const handleExport = () => {
        if (!product || displayMovements.length === 0) return;
        excelUtils.exportInventoryCard(
            product,
            displayMovements,
            `TheKho_${product.sku}`,
            product.warehouse || 'Tất cả'
        );
    };


    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-gray-200">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Thẻ kho</h2>
                        <p className="text-gray-600 mt-1">Sản phẩm: <span className="font-semibold">{product?.name}</span> ({product?.sku})</p>
                    </div>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                            <input
                                type="date"
                                value={localDateFrom}
                                onChange={(e) => setLocalDateFrom(e.target.value)}
                                className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                            />
                            <span className="text-gray-500">-</span>
                            <input
                                type="date"
                                value={localDateTo}
                                onChange={(e) => setLocalDateTo(e.target.value)}
                                className="border border-gray-300 rounded-md px-2 py-1.5 text-sm"
                            />
                        </div>
                        <button
                            onClick={handleExport}
                            className="flex items-center gap-1.5 px-4 py-2 bg-green-100 text-green-700 border border-green-200 rounded-md hover:bg-green-200 text-sm font-medium transition-colors"
                        >
                            <ExcelIcon className="w-4 h-4" /> Xuất Excel
                        </button>
                        <button onClick={onClose} className="text-gray-500 hover:text-gray-700 p-2 ml-4 border-l pl-4 border-gray-200">
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                    </div>
                </div>

                <div className="p-6 overflow-y-auto flex-1">
                    {loading ? (
                        <div className="flex justify-center items-center py-10">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200 border">
                                <thead className="bg-gray-50 text-xs font-medium text-gray-500 tracking-wider">
                                    <tr>
                                        <th className="px-4 py-3 text-left border-b">Ngày</th>
                                        <th className="px-4 py-3 text-left border-b">Loại chứng từ</th>
                                        <th className="px-4 py-3 text-left border-b">Mã chứng từ</th>
                                        <th className="px-4 py-3 text-left border-b">Đối tác</th>
                                        <th className="px-4 py-3 text-right border-b text-green-600">Sl nhập</th>
                                        <th className="px-4 py-3 text-right border-b text-red-600">Sl xuất</th>
                                        <th className="px-4 py-3 text-right border-b">Tồn kho</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                                    {displayMovements.length > 0 ? displayMovements.map((m, idx) => (
                                        <tr key={idx} className="hover:bg-gray-50">
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-500">{formatDate(m.date)}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-gray-800 font-medium">{m.type}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-blue-600 font-medium">
                                                {m.voucherId ? (
                                                    <button onClick={() => handleVoucherClick(m)} className="hover:underline text-left">
                                                        {m.code}
                                                    </button>
                                                ) : (
                                                    m.code
                                                )}
                                            </td>
                                            <td className="px-4 py-3 text-gray-600">{m.partner}</td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right text-green-600 font-medium">
                                                {Number(m.qty_in) > 0 ? `+${formatQty(m.qty_in)}` : '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right text-red-600 font-medium">
                                                {Number(m.qty_out) > 0 ? `-${formatQty(m.qty_out)}` : '-'}
                                            </td>
                                            <td className="px-4 py-3 whitespace-nowrap text-right font-bold text-gray-900 border-l border-gray-100 bg-gray-50/50">
                                                {formatQty(m.balance)}
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={7} className="px-4 py-8 text-center text-gray-500 italic">Không có giao dịch nào trong khoảng thời gian này.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                <div className="p-4 border-t border-gray-200 bg-gray-50 flex justify-end">
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-100 font-medium transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>

            {/* Sub-modal: Voucher Details */}
            {selectedVoucher && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black bg-opacity-50" onClick={() => setSelectedVoucher(null)}>
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl flex flex-col max-h-[80vh]" onClick={e => e.stopPropagation()}>
                        <div className="flex justify-between items-center p-5 border-b border-gray-200">
                            <div>
                                <h3 className="text-lg font-bold text-gray-800">Chi tiết chứng từ</h3>
                                <div className="text-gray-600 mt-1 flex items-center space-x-4">
                                    <span>Mã: <span className="font-semibold">{selectedVoucher.code}</span></span>
                                    <span>Loại: <span className="font-semibold">{selectedVoucher.type}</span></span>
                                    <span>Ngày: <span className="font-semibold">{formatDate(selectedVoucher.date)}</span></span>
                                    <span className="border-l border-gray-300 h-4 mx-2"></span>
                                    <a
                                        href={getVoucherOriginUrl(selectedVoucher.type, selectedVoucher.voucherId)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center text-sm font-medium transition-colors cursor-pointer"
                                    >
                                        <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg>
                                        Mở phiếu
                                    </a>
                                </div>
                            </div>
                            <button onClick={() => setSelectedVoucher(null)} className="text-gray-500 hover:text-gray-700 p-2">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>

                        <div className="p-5 overflow-y-auto flex-1">
                            {loadingVoucherItems ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                                </div>
                            ) : voucherDetails && voucherDetails.items && voucherDetails.items.length > 0 ? (
                                <>
                                    <div className="space-y-3 mb-6">
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                                            {selectedVoucher.type.includes('Bán') && (
                                                <>
                                                    <div><span className="text-gray-500">Khách hàng:</span> <span className="font-medium text-gray-800">{voucherDetails.partner?.name || 'Vãng lai'}</span></div>
                                                    <div><span className="text-gray-500">Chi nhánh:</span> <span className="font-medium text-gray-800">{voucherDetails.facility?.name || 'N/A'}</span></div>
                                                    <div><span className="text-gray-500">Tổng tiền:</span> <span className="font-medium text-blue-600">{(voucherDetails.total_amount || 0).toLocaleString('vi-VN')} ₫</span></div>
                                                    <div><span className="text-gray-500">Đã thanh toán:</span> <span className="font-medium text-green-600">{(voucherDetails.amount_paid || 0).toLocaleString('vi-VN')} ₫</span></div>
                                                </>
                                            )}
                                            {selectedVoucher.type.includes('Mua') && (
                                                <>
                                                    <div><span className="text-gray-500">Nhà cung cấp:</span> <span className="font-medium text-gray-800">{voucherDetails.partner?.name || 'N/A'}</span></div>
                                                    <div><span className="text-gray-500">Chi nhánh:</span> <span className="font-medium text-gray-800">{voucherDetails.facility?.name || 'N/A'}</span></div>
                                                    <div><span className="text-gray-500">Tổng tiền:</span> <span className="font-medium text-blue-600">{(voucherDetails.total_amount || 0).toLocaleString('vi-VN')} ₫</span></div>
                                                    <div><span className="text-gray-500">Đã thanh toán:</span> <span className="font-medium text-green-600">{(voucherDetails.amount_paid || 0).toLocaleString('vi-VN')} ₫</span></div>
                                                </>
                                            )}
                                            {selectedVoucher.type.includes('điều chuyển') && (
                                                <>
                                                    <div><span className="text-gray-500">Chi nhánh xuất:</span> <span className="font-medium text-gray-800">{voucherDetails.from_facility?.name || 'N/A'}</span></div>
                                                    <div><span className="text-gray-500">Chi nhánh nhập:</span> <span className="font-medium text-gray-800">{voucherDetails.to_facility?.name || 'N/A'}</span></div>
                                                </>
                                            )}
                                            {selectedVoucher.type.includes('Hủy') && (
                                                <>
                                                    <div><span className="text-gray-500">Chi nhánh:</span> <span className="font-medium text-gray-800">{voucherDetails.facility?.name || 'N/A'}</span></div>
                                                    <div><span className="text-gray-500">Lý do:</span> <span className="font-medium text-gray-800">{voucherDetails.reason || 'N/A'}</span></div>
                                                </>
                                            )}
                                            {selectedVoucher.type.includes('Trả') && (
                                                <>
                                                    <div><span className="text-gray-500">Trạng thái:</span> <span className="font-medium text-gray-800">{voucherDetails.status || 'N/A'}</span></div>
                                                </>
                                            )}
                                            {voucherDetails.notes && (
                                                <div className="col-span-full"><span className="text-gray-500">Ghi chú:</span> <span className="font-medium text-gray-800">{voucherDetails.notes}</span></div>
                                            )}
                                        </div>
                                    </div>

                                    <h4 className="font-semibold text-gray-700 mb-3 border-t pt-4">Chi tiết hàng hóa</h4>
                                    <table className="min-w-full divide-y divide-gray-200 border text-sm">
                                        <thead className="bg-gray-50 text-gray-500">
                                            <tr>
                                                <th className="px-4 py-2 text-left border-b font-medium">Mã hàng</th>
                                                <th className="px-4 py-2 text-left border-b font-medium">Tên hàng</th>
                                                <th className="px-4 py-2 text-center border-b font-medium">Đvt</th>
                                                <th className="px-4 py-2 text-right border-b font-medium">Số lượng</th>
                                                {voucherDetails.items.some((i: any) => i.price !== undefined) && (
                                                    <th className="px-4 py-2 text-right border-b font-medium">Đơn giá</th>
                                                )}
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {voucherDetails.items.map((item: any, i: number) => (
                                                <tr key={i} className="hover:bg-gray-50">
                                                    <td className="px-4 py-2 text-blue-600">{item.product?.sku}</td>
                                                    <td className="px-4 py-2 font-medium text-gray-800">{item.product?.name}</td>
                                                    <td className="px-4 py-2 text-center text-gray-600">{item.product?.unit}</td>
                                                    <td className="px-4 py-2 text-right font-semibold text-gray-900">{item.quantity}</td>
                                                    {item.price !== undefined && (
                                                        <td className="px-4 py-2 text-right text-gray-600">
                                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(item.price || 0)}
                                                        </td>
                                                    )}
                                                </tr>
                                            ))}
                                        </tbody>
                                        {((selectedVoucher.type.includes('Mua') || selectedVoucher.type.includes('Bán')) && voucherDetails.total_amount) && (
                                            <tfoot>
                                                <tr className="bg-gray-50 font-semibold">
                                                    <td colSpan={4} className="px-4 py-2 text-right border-t">Tổng cộng</td>
                                                    <td className="px-4 py-2 text-right border-t text-blue-600">{voucherDetails.total_amount.toLocaleString('vi-VN')} ₫</td>
                                                </tr>
                                            </tfoot>
                                        )}
                                    </table>
                                </>
                            ) : (
                                <div className="text-center py-8 text-gray-500 italic">Không có chi tiết hàng hóa</div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductMovementModal;
