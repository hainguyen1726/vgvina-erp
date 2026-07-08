import React, { useState, useMemo, useEffect } from 'react';
import FilterBar from '../components/ui/FilterBar';
import SummaryCard from '../components/ui/SummaryCard';
import Pagination from '../components/ui/Pagination';
import { TableActions } from '../components/ui/TableActions';
import { Page } from '../types';
import { productService } from '../src/services/productService';
import { KhoIcon, PlusIcon, ExportIcon, ArrowUpIcon, ChevronDownIcon, ArrowsUpDownIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/icons/Icons';
import { useNotification } from '../contexts/NotificationContext';
import { useBranch } from '../contexts/BranchContext';
import { excelUtils } from '../src/utils/excelUtils';
import ProductMovementModal from '../components/modals/ProductMovementModal';

const allColumns = [
    { key: 'sku', label: 'Mã hàng' },
    { key: 'name', label: 'Tên hàng hóa' },
    { key: 'unit', label: 'Đơn vị' },
    { key: 'beginning', label: 'Sl đầu kỳ' },
    { key: 'beginningValue', label: 'Gt đầu kỳ' },
    { key: 'qtyIn', label: 'Sl nhập' },
    { key: 'inValue', label: 'Gt nhập' },
    { key: 'qtyOut', label: 'Sl xuất' },
    { key: 'outValue', label: 'Gt xuất' },
    { key: 'ending', label: 'Sl cuối kỳ' },
    { key: 'endValue', label: 'Gt cuối kỳ' },
];

const ReportInventorySummary: React.FC = () => {
    const { selectedFacilityId, selectedBranch, currentUser } = useBranch();
    const { showNotification } = useNotification();
    const [reportData, setReportData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [dateRange, setDateRange] = useState<{ from?: string; to?: string }>({});
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(isMobile ? 10 : 30);
    const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>({ key: 'name', direction: 'ascending' });
    const [visibleColumns, setVisibleColumns] = useState(["sku", "name", "unit", "beginning", "beginningValue", "qtyIn", "inValue", "qtyOut", "outValue", "ending", "endValue"]);

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
            const data = await productService.getInventorySummaryReport(dateRange.from, dateRange.to, selectedFacilityId || undefined);
            setReportData(data);
        } catch (error) {
            console.error("Failed to fetch report", error);
            showNotification("Không thể tải báo cáo xuất nhập tồn", "error");
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
            beginning: acc.beginning + curr.beginning,
            beginningValue: acc.beginningValue + (curr.beginningValue || 0),
            qtyIn: acc.qtyIn + curr.qtyIn,
            inValue: acc.inValue + (curr.inValue || 0),
            qtyOut: acc.qtyOut + curr.qtyOut,
            outValue: acc.outValue + (curr.outValue || 0),
            ending: acc.ending + curr.ending,
            endValue: acc.endValue + (curr.endValue || 0)
        }), {
            beginning: 0, beginningValue: 0,
            qtyIn: 0, inValue: 0,
            qtyOut: 0, outValue: 0,
            ending: 0, endValue: 0
        });
    }, [filteredData]);

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleExportExcel = () => {
        // Map data to match the expected format for exportInventorySummaryStyled
        const exportData = filteredData.map(item => ({
            sku: item.sku,
            name: item.name,
            beginning: item.beginning,
            beginningValue: item.beginningValue || 0,
            in: item.qtyIn,
            inValue: item.inValue || 0,
            out: item.qtyOut,
            outValue: item.outValue || 0,
            end: item.ending,
            endValue: item.endValue || 0
        }));
        excelUtils.exportInventorySummaryStyled(
            exportData,
            'BaoCaoXuatNhapTon',
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
                pageTitle="Báo cáo xuất nhập tồn (Sổ tổng hợp)"
                backPath="/bao-cao"
            />

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <SummaryCard title="Hàng phát sinh" value={filteredData.filter(p => p.qtyIn > 0 || p.qtyOut > 0).length.toLocaleString()} icon={<KhoIcon />} colorClass="bg-blue-100 text-blue-600" />
                <SummaryCard title="Tổng nhập" value={totals.qtyIn.toLocaleString()} icon={<KhoIcon />} colorClass="bg-green-100 text-green-600" />
                <SummaryCard title="Tổng xuất" value={totals.qtyOut.toLocaleString()} icon={<KhoIcon />} colorClass="bg-orange-100 text-orange-600" />
                <SummaryCard title="Tồn cuối kỳ" value={totals.ending.toLocaleString()} icon={<KhoIcon />} colorClass="bg-purple-100 text-purple-600" />
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
                                    const isNumeric = ['beginning', 'beginningValue', 'qtyIn', 'inValue', 'qtyOut', 'outValue', 'ending', 'endValue'].includes(col.key);
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
                                <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                                    {visibleColumns.includes('sku') && (
                                        <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600 cursor-pointer hover:underline" onClick={() => setSelectedProduct({ id: item.id || item.productId || item.sku, name: item.name, sku: item.sku })}>
                                            {item.sku}
                                        </td>
                                    )}
                                    {visibleColumns.includes('name') && <td className="px-6 py-4">{item.name}</td>}
                                    {visibleColumns.includes('unit') && <td className="px-6 py-4 whitespace-nowrap">{item.unit}</td>}
                                    {visibleColumns.includes('beginning') && <td className="px-6 py-4 whitespace-nowrap text-right tabular-nums">{item.beginning.toLocaleString()}</td>}
                                    {visibleColumns.includes('beginningValue') && <td className="px-6 py-4 whitespace-nowrap text-right tabular-nums">{formatCurrency(item.beginningValue || 0)}</td>}
                                    {visibleColumns.includes('qtyIn') && <td className="px-6 py-4 whitespace-nowrap text-right text-green-600 font-medium tabular-nums">+{item.qtyIn.toLocaleString()}</td>}
                                    {visibleColumns.includes('inValue') && <td className="px-6 py-4 whitespace-nowrap text-right text-green-600 tabular-nums">{formatCurrency(item.inValue || 0)}</td>}
                                    {visibleColumns.includes('qtyOut') && <td className="px-6 py-4 whitespace-nowrap text-right text-orange-600 font-medium tabular-nums">-{item.qtyOut.toLocaleString()}</td>}
                                    {visibleColumns.includes('outValue') && <td className="px-6 py-4 whitespace-nowrap text-right text-orange-600 tabular-nums">{formatCurrency(item.outValue || 0)}</td>}
                                    {visibleColumns.includes('ending') && <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-gray-900 tabular-nums">{item.ending.toLocaleString()}</td>}
                                    {visibleColumns.includes('endValue') && <td className="px-6 py-4 whitespace-nowrap text-right font-bold text-blue-700 tabular-nums">{formatCurrency(item.endValue || 0)}</td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <div className="px-6 py-4 border-t border-gray-100 flex justify-between items-center bg-gray-50 font-bold">
                    <div className="text-gray-600">TỔNG CỘNG:</div>
                    <div className="flex gap-4 sm:gap-6 flex-wrap justify-end">
                        {visibleColumns.includes('beginning') && <div className="text-right">T.Đầu: {totals.beginning.toLocaleString()} <br /><span className="text-gray-400 font-normal">{formatCurrency(totals.beginningValue)}</span></div>}
                        {visibleColumns.includes('qtyIn') && <div className="text-right text-green-700">T.Nhập: {totals.qtyIn.toLocaleString()} <br /><span className="text-gray-400 font-normal">{formatCurrency(totals.inValue)}</span></div>}
                        {visibleColumns.includes('qtyOut') && <div className="text-right text-orange-700">T.Xuất: {totals.qtyOut.toLocaleString()} <br /><span className="text-gray-400 font-normal">{formatCurrency(totals.outValue)}</span></div>}
                        {visibleColumns.includes('ending') && <div className="text-right text-purple-700">T.Cuối: {totals.ending.toLocaleString()} <br /><span className="text-gray-400 font-normal text-blue-600">{formatCurrency(totals.endValue)}</span></div>}
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
            />
        </div>
    );
};

export default ReportInventorySummary;
