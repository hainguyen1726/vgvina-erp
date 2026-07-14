import React, { useState, useMemo, useEffect } from 'react';
import FilterBar from '../components/ui/FilterBar';
import SummaryCard from '../components/ui/SummaryCard';
import Pagination from '../components/ui/Pagination';
import { TableActions } from '../components/ui/TableActions';
import { Page } from '../types';
import { productService } from '../src/services/productService';
import { DonHangIcon, ThuChiIcon, ExportIcon, ArrowUpIcon, ChevronDownIcon, ArrowsUpDownIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/icons/Icons';
import { useNotification } from '../contexts/NotificationContext';
import { useBranch } from '../contexts/BranchContext';
import { excelUtils } from '../src/utils/excelUtils';
import ProductMovementModal from '../components/modals/ProductMovementModal';

const allColumns = [
    { key: 'sku', label: 'Mã hàng' },
    { key: 'name', label: 'Tên hàng hóa' },
    { key: 'category', label: 'Danh mục' },
    { key: 'unit', label: 'Đơn vị' },
    { key: 'totalQty', label: 'Sl bán' },
    { key: 'totalRevenue', label: 'Doanh thu' },
    { key: 'returnQty', label: 'Sl trả' },
    { key: 'returnVal', label: 'Giá trị trả' },
    { key: 'netRevenue', label: 'Doanh thu thuần' },
];

const ReportProductSales: React.FC = () => {
    const { selectedFacilityId, selectedBranch, currentUser } = useBranch();
    const { showNotification } = useNotification();
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(isMobile ? 10 : 30);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>({ key: 'netRevenue', direction: 'descending' });
    const [visibleColumns, setVisibleColumns] = useState(["sku", "name", "category", "unit", "totalQty", "totalRevenue", "returnQty", "returnVal", "netRevenue"]);

    const [selectedProduct, setSelectedProduct] = useState<any>(null);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            if (mobile !== isMobile) {
                setIsMobile(mobile);
                setItemsPerPage(mobile ? 10 : 30);
                setCurrentPage(1);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile]);

    useEffect(() => {
        fetchReport();
    }, [selectedFacilityId, dateRange]);

    const fetchReport = async () => {
        try {
            setLoading(true);
            const data = await productService.getProductSalesReport(dateRange.from, dateRange.to, selectedFacilityId || undefined);
            setReportData(data);
        } catch (error) {
            console.error("Failed to fetch report", error);
            showNotification("Không thể tải báo cáo bán hàng", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleTimeFilterChange = (filter: string, dates?: { from: Date; to: Date }) => {
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

    const requestSort = (key: string) => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
            direction = 'descending';
        }
        setSortConfig({ key, direction });
    };

    const filteredData = useMemo(() => {
        let result = reportData.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.sku.toLowerCase().includes(searchTerm.toLowerCase())
        );

        if (sortConfig !== null) {
            result.sort((a, b) => {
                const aValue = a[sortConfig.key];
                const bValue = b[sortConfig.key];
                if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
                if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [searchTerm, sortConfig, reportData]);

    const totals = useMemo(() => {
        return filteredData.reduce((acc, curr) => ({
            qty: acc.qty + curr.totalQty,
            revenue: acc.revenue + curr.totalRevenue,
            returnQty: acc.returnQty + curr.returnQty,
            returnVal: acc.returnVal + curr.returnVal,
            netRevenue: acc.netRevenue + curr.netRevenue
        }), { qty: 0, revenue: 0, returnQty: 0, returnVal: 0, netRevenue: 0 });
    }, [filteredData]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleExportExcel = () => {
        excelUtils.exportProductSalesStyled(
            filteredData,
            'BaoCaoBanHangTheoHangHoa',
            dateRange.from || '',
            dateRange.to || '',
            selectedBranch || 'Tất cả'
        );
    };

    const formatCurrency = (val: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(val);
    };

    return (
        <div className="flex flex-col h-full">
            <FilterBar
                onSearch={setSearchTerm}
                onTimeFilterChange={handleTimeFilterChange}
                pageTitle="Báo cáo bán hàng theo hàng hóa"
                backPath="/bao-cao"
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <SummaryCard title="Tổng sản phẩm" value={filteredData.length.toLocaleString()} icon={<DonHangIcon />} colorClass="bg-blue-100 text-blue-600" />
                <SummaryCard title="Tổng doanh thu" value={formatCurrency(totals.revenue)} icon={<ThuChiIcon />} colorClass="bg-green-100 text-green-600" />
                <SummaryCard title="Tổng lợi nhuận" value={formatCurrency(totals.profit)} icon={<ThuChiIcon />} colorClass="bg-purple-100 text-purple-600" />
            </div>

            <TableActions
                onSearch={setSearchTerm}
                searchPlaceholder="Tìm theo mã hoặc tên hàng hóa..."
                primaryActions={[
                    { label: 'Xuất file', icon: <ExportIcon />, onClick: handleExportExcel, variant: 'secondary' },
                ]}
                columns={allColumns}
                visibleColumns={visibleColumns}
                onVisibleColumnsChange={setVisibleColumns}
            />

            <div className="flex-1 bg-white rounded-lg shadow-sm overflow-hidden flex flex-col">
                <div className="overflow-x-auto flex-1">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50 text-xs text-gray-700">
                            <tr>
                                {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => {
                                    const isNumeric = ['totalQty', 'totalRevenue', 'returnQty', 'returnVal', 'netRevenue'].includes(col.key);
                                    return (
                                        <th key={col.key} className={`px-6 py-3 cursor-pointer ${isNumeric ? 'text-right' : 'text-left'}`} onClick={() => requestSort(col.key)}>
                                            <div className={`flex items-center min-w-0 ${isNumeric ? 'justify-end' : ''}`}>
                                                {col.label}
                                                <span className="ml-1.5 shrink-0">{sortConfig?.key === col.key ? (sortConfig.direction === 'ascending' ? <ArrowUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4" />) : (<ArrowsUpDownIcon className="h-4 w-4 text-gray-300" />)}</span>
                                            </div>
                                        </th>
                                    );
                                })}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {paginatedData.map((item, idx) => (
                                <tr key={item.productId} className="hover:bg-gray-50 transition-colors">
                                    {visibleColumns.includes('sku') && (
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => setSelectedProduct({ id: item.productId, name: item.name, sku: item.sku })}>
                                            {item.sku}
                                        </td>
                                    )}
                                    {visibleColumns.includes('name') && <td className="px-6 py-4 text-left">{item.name}</td>}
                                    {visibleColumns.includes('category') && <td className="px-6 py-4 text-left whitespace-nowrap text-gray-500">{item.category}</td>}
                                    {visibleColumns.includes('unit') && <td className="px-6 py-4 whitespace-nowrap text-left">{item.unit}</td>}
                                    {visibleColumns.includes('totalQty') && <td className="px-6 py-4 whitespace-nowrap text-right tabular-nums">{item.totalQty.toLocaleString()}</td>}
                                    {visibleColumns.includes('totalRevenue') && <td className="px-6 py-4 whitespace-nowrap text-right font-medium tabular-nums">{formatCurrency(item.totalRevenue)}</td>}
                                    {visibleColumns.includes('returnQty') && <td className="px-6 py-4 whitespace-nowrap text-right text-orange-600 tabular-nums">{item.returnQty.toLocaleString()}</td>}
                                    {visibleColumns.includes('returnVal') && <td className="px-6 py-4 whitespace-nowrap text-right text-orange-600 font-medium tabular-nums">-{formatCurrency(item.returnVal)}</td>}
                                    {visibleColumns.includes('netRevenue') && <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-blue-700 tabular-nums">{formatCurrency(item.netRevenue)}</td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 font-bold">
                    <div className="text-gray-600">TỔNG CỘNG:</div>
                    <div className="flex gap-4 sm:gap-6 flex-wrap justify-end">
                        {visibleColumns.includes('totalQty') && <div className="text-right">SL: {totals.qty.toLocaleString()}</div>}
                        {visibleColumns.includes('totalRevenue') && <div className="text-right">DT: {formatCurrency(totals.revenue)}</div>}
                        {visibleColumns.includes('returnQty') && <div className="text-right text-orange-700">Trả: {totals.returnQty.toLocaleString()}</div>}
                        {visibleColumns.includes('returnVal') && <div className="text-right text-orange-700">Giá trị trả: -{formatCurrency(totals.returnVal)}</div>}
                        {visibleColumns.includes('netRevenue') && <div className="text-right text-blue-700">DT Thuần: {formatCurrency(totals.netRevenue)}</div>}
                    </div>
                </div>

                <div className="p-4 border-t border-gray-200">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={(v) => { setItemsPerPage(v); setCurrentPage(1); }}
                        totalItems={filteredData.length}
                    />
                </div>
            </div>

            <ProductMovementModal
                isOpen={!!selectedProduct}
                onClose={() => setSelectedProduct(null)}
                product={selectedProduct}
                dateRange={dateRange}
                typeFilters={['Xuất lẻ (Bán)', 'Trả hàng']}
            />
        </div>
    );
};

export default ReportProductSales;
