import React, { useState } from 'react';
import FilterBar from '../components/ui/FilterBar';
import { Page } from '../types';
import SummaryCard from '../components/ui/SummaryCard';
import { BaoCaoIcon, ExportIcon } from '../components/icons/Icons';
// import { salesOrders } from '../data/mockData';
const salesOrders: any[] = [];
import Pagination from '../components/ui/Pagination';
import { TableActions } from '../components/ui/TableActions';

const allColumns = [
  { key: 'branch', label: 'Chi nhánh' },
  { key: 'orderCount', label: 'Số đơn hàng' },
  { key: 'revenue', label: 'Doanh thu' },
  { key: 'profit', label: 'Lợi nhuận' },
];

const reportData = [
  { id: 1, branch: 'Chi nhánh trung tâm', orderCount: 850, revenue: 1500000000, profit: 500000000 },
  { id: 2, branch: 'Chi nhánh phía Bắc', orderCount: 220, revenue: 550000000, profit: 200000000 },
  { id: 3, branch: 'Chi nhánh phía Nam', orderCount: 210, revenue: 300000000, profit: 150000000 },
];

const Reports: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [visibleColumns, setVisibleColumns] = useState(["branch", "orderCount", "revenue", "profit"]);
  const [searchTerm, setSearchTerm] = useState('');

  const totalPages = Math.ceil(salesOrders.length / itemsPerPage);

  const renderCell = (reportItem: typeof reportData[0], columnKey: string) => {
    switch (columnKey) {
      case 'branch':
        return <span className="font-medium text-gray-900">{reportItem.branch}</span>;
      case 'orderCount':
        return <div className="text-right tabular-nums">{reportItem.orderCount}</div>;
      case 'revenue':
        return <div className="text-right tabular-nums">{reportItem.revenue.toLocaleString('vi-VN')} ₫</div>;
      case 'profit':
        return <div className="text-right tabular-nums">{reportItem.profit.toLocaleString('vi-VN')} ₫</div>;
      default:
        return reportItem[columnKey as keyof typeof reportItem];
    }
  };


  return (
    <>
      <FilterBar onSearch={() => { }} onTimeFilterChange={() => { }} pageTitle={Page.BaoCao} />

      <div className="flex space-x-4">
        <SummaryCard title="Doanh thu" value="2.35 Tỷ" icon={<BaoCaoIcon />} colorClass="bg-green-100 text-green-600" />
        <SummaryCard title="Chi phí" value="1.5 Tỷ" icon={<BaoCaoIcon />} colorClass="bg-red-100 text-red-600" />
        <SummaryCard title="Lợi nhuận" value="850 Tr" icon={<BaoCaoIcon />} colorClass="bg-blue-100 text-blue-600" />
      </div>

      <TableActions
        onSearch={setSearchTerm}
        searchPlaceholder="Tìm kiếm báo cáo..."
        primaryActions={[
          { label: 'Xuất file', icon: <ExportIcon />, onClick: () => { }, variant: 'secondary' },
        ]}
        columns={allColumns}
        visibleColumns={visibleColumns}
        onVisibleColumnsChange={setVisibleColumns}
      />

      <div className="bg-white rounded-lg shadow-sm p-4">
        <h3 className="text-lg font-semibold mb-4">Báo cáo Doanh thu theo Chi nhánh</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 bg-gray-50">
              <tr>
                {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => {
                  const isNumeric = ['orderCount', 'revenue', 'profit'].includes(col.key);
                  return (
                    <th key={col.key} scope="col" className={`px-6 py-3 ${isNumeric ? 'text-right' : ''}`}>
                      {col.label}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {reportData.map((item) => (
                <tr key={item.id} className="bg-white border-b hover:bg-gray-50">
                  {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => (
                    <td key={col.key} className="px-6 py-4">{renderCell(item, col.key)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
            totalItems={salesOrders.length}
          />
        </div>
      </div>
    </>
  );
};

export default Reports;