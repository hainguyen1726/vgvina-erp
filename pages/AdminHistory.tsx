import React, { useState, useMemo, useEffect } from 'react';
import { formatDateTime } from '../src/utils/dateUtils';
import { Link } from 'react-router-dom';

import { AuditLog } from '../types';
import { auditLogService } from '../src/services/auditLogService';
import { userService } from '../src/services/userService';
import Pagination from '../components/ui/Pagination';
import { ExportIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/icons/Icons';

const TABLE_NAME_MAP: Record<string, string> = {
    'vgvina_sales_orders': 'Đơn bán hàng',
    'vgvina_purchase_orders': 'Đơn mua hàng',
    'vgvina_inventory_stock': 'Tồn kho',
    'vgvina_debt_transactions': 'Công nợ',
    'vgvina_partners': 'Đối tác',
    'vgvina_products': 'Sản phẩm',
    'vgvina_financial_transactions': 'Thu chi',
    'vgvina_accounts': 'Tài khoản',
    'vgvina_users': 'Người dùng',
    'vgvina_internal_transfers': 'Chuyển kho nội bộ',
    'vgvina_return_vouchers': 'Phiếu trả hàng',
    'vgvina_scrapping_vouchers': 'Phiếu hủy hàng',
};

const FIELD_NAME_MAP: Record<string, string> = {
    // Chung
    'id': 'Mã hệ thống (ID)',
    'code': 'Mã chứng từ',
    'name': 'Tên',
    'created_at': 'Ngày tạo',
    'updated_at': 'Cập nhật lúc',
    'notes': 'Ghi chú',
    'description': 'Mô tả',
    'status': 'Trạng thái',
    
    // Đối tác (vgvina_partners)
    'type': 'Phân loại',
    'phone': 'Số điện thoại',
    'email': 'Email',
    'address': 'Địa chỉ',
    'tax_code': 'Mã số thuế',
    'assigned_user_id': 'Nhân viên phụ trách',
    'facility_id': 'Chi nhánh/Kho',
    
    // Sản phẩm (vgvina_products)
    'sku': 'Mã sản phẩm (SKU)',
    'unit': 'Đơn vị tính',
    'price': 'Đơn giá',
    'quantity': 'Số lượng',
    'category_id': 'Danh mục',
    
    // Đơn bán hàng / Đơn mua hàng (vgvina_sales_orders & vgvina_purchase_orders)
    'customer_id': 'Khách hàng',
    'supplier_id': 'Nhà cung cấp',
    'order_date': 'Ngày đặt hàng',
    'total_amount': 'Tổng tiền',
    'amount_paid': 'Đã thanh toán',
    
    // Thu chi (vgvina_financial_transactions)
    'transaction_date': 'Ngày giao dịch',
    'amount': 'Số tiền',
    'partner_id': 'Đối tác',
    'account_id': 'Tài khoản',
    'employee_id': 'Nhân viên thực hiện',
    'related_order_id': 'Đơn hàng liên quan',
    'related_order_type': 'Loại đơn liên quan',
    
    // Công nợ (vgvina_debt_transactions)
    'due_date': 'Hạn thanh toán',
    
    // Tài khoản (vgvina_accounts)
    'balance': 'Số dư',
    'details': 'Chi tiết tài khoản',
    'bank_name': 'Tên ngân hàng',
    'account_holder': 'Chủ tài khoản',
    'account_number': 'Số tài khoản',
    
    // Người dùng (vgvina_users)
    'username': 'Tên đăng nhập',
    'full_name': 'Họ và tên',
    'phone_number': 'Số điện thoại',
    'role': 'Vai trò',
    'role_id': 'Mã nhóm vai trò',
    'last_login_at': 'Đăng nhập cuối',
};

// Detail Modal Component
interface DetailModalProps {
    log: AuditLog | null;
    onClose: () => void;
}

const DetailModal: React.FC<DetailModalProps> = ({ log, onClose }) => {
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);
    
    if (!log) return null;

    const allKeys = new Set([
        ...Object.keys(log.oldValues || {}),
        ...Object.keys(log.newValues || {})
    ]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center border-b p-4">
                    <h3 className="text-lg font-semibold text-gray-800">Chi tiết thay đổi cho {TABLE_NAME_MAP[log.tableName] || log.tableName} #{log.recordId}</h3>
                    <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
                </div>
                <div className="p-6 max-h-[70vh] overflow-y-auto">
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div><strong className="font-medium text-gray-600">Người sửa:</strong> <span className="text-gray-800">{log.userName || 'Unknown'}</span></div>
                        <div><strong className="font-medium text-gray-600">Thời gian:</strong> <span className="text-gray-800">{formatDateTime(log.timestamp)}</span></div>
                    </div>
                    <table className="w-full text-sm border-collapse border">
                        <thead className="bg-gray-100">
                            <tr>
                                <th className="border p-2 font-medium text-left text-gray-700 w-1/3">Tên trường</th>
                                <th className="border p-2 font-medium text-left text-gray-700 w-1/3">Giá trị cũ</th>
                                <th className="border p-2 font-medium text-left text-gray-700 w-1/3">Giá trị mới</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Array.from(allKeys).map(key => {
                                const oldValue = log.oldValues?.[key];
                                const newValue = log.newValues?.[key];
                                const isChanged = oldValue !== newValue;
                                return (
                                    <tr key={key} className={`${isChanged ? 'bg-red-50/30' : ''}`}>
                                        <td className="border p-2 font-normal text-gray-700">{FIELD_NAME_MAP[key] || key}</td>
                                        <td className="border p-2 font-normal text-gray-500">{oldValue !== undefined ? String(oldValue) : ''}</td>
                                        <td className={`border p-2 font-normal ${isChanged ? 'text-red-600' : 'text-gray-800'}`}>
                                            {newValue !== undefined ? String(newValue) : ''}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
                <div className="border-t p-4 flex justify-end bg-gray-50 rounded-b-lg">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">Đóng</button>
                </div>
            </div>
        </div>
    );
};

const AdminHistory: React.FC = () => {
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [filters, setFilters] = useState({
        user: 'all',
        dateFrom: '',
        dateTo: '',
        objectType: 'all',
        action: 'all'
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(isMobile ? 8 : 30);
    const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
    const [usersList, setUsersList] = useState<any[]>([]);
    const [logs, setLogs] = useState<AuditLog[]>([]);

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

    const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
        setFilters({ ...filters, [e.target.name]: e.target.value });
        setCurrentPage(1);
    };

    useEffect(() => {
        userService.getUsers().then(setUsersList).catch(err => console.error("Error fetching users for logs:", err));
    }, []);

    useEffect(() => {
        auditLogService.getAuditLogs({
            user: filters.user,
            objectType: filters.objectType,
            action: filters.action,
            dateFrom: filters.dateFrom,
            dateTo: filters.dateTo
        }).then(setLogs).catch(err => console.error("Error fetching logs:", err));
    }, [filters]);

    const filteredLogs = useMemo(() => {
        return logs;
    }, [logs]);

    const totalPages = Math.ceil(filteredLogs.length / itemsPerPage);
    const paginatedLogs = filteredLogs.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const getActionBadge = (action: 'CREATE' | 'UPDATE' | 'DELETE') => {
        if (action === 'CREATE') return <span className="font-bold text-green-600">TẠO MỚI</span>;
        if (action === 'UPDATE') return <span className="font-bold text-blue-600">CẬP NHẬT</span>;
        if (action === 'DELETE') return <span className="font-bold text-red-600">XÓA</span>;
        return action;
    };

    const generateDescription = (log: AuditLog) => {
        const actionText = log.action === 'CREATE' ? 'đã tạo' : (log.action === 'UPDATE' ? 'đã cập nhật' : 'đã xóa');
        const objectName = TABLE_NAME_MAP[log.tableName] || log.tableName;
        return `${actionText} ${objectName} #${log.recordId}.`;
    };

    return (
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <header className="flex items-center pb-4 border-b mb-4">
                <Link to="/admin" className="p-2 rounded-md hover:bg-gray-100 mr-2">
                    <ChevronLeftIcon />
                </Link>
                <h1 className="text-xl font-bold text-gray-800">Kiểm tra lịch sử (Logs)</h1>
            </header>

            {/* Filter Panel */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Người dùng</label>
                    <select name="user" value={filters.user} onChange={handleFilterChange} className="w-full p-2 text-sm border border-gray-300 rounded-md">
                        <option value="all">Tất cả người dùng</option>
                        {usersList.map(u => u.email && (
                            <option key={u.id} value={u.id}>
                                {u.full_name ? `${u.full_name} (${u.email})` : u.email}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Đối tượng</label>
                    <select name="objectType" value={filters.objectType} onChange={handleFilterChange} className="w-full p-2 text-sm border border-gray-300 rounded-md">
                        <option value="all">Tất cả đối tượng</option>
                        {Object.entries(TABLE_NAME_MAP).map(([key, value]) => <option key={key} value={key}>{value}</option>)}
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Hành động</label>
                    <select name="action" value={filters.action} onChange={handleFilterChange} className="w-full p-2 text-sm border border-gray-300 rounded-md">
                        <option value="all">Tất cả</option>
                        <option value="UPDATE">Cập nhật</option>
                        <option value="DELETE">Xóa</option>
                    </select>
                </div>
                <div className="space-y-1">
                    <label className="text-sm font-medium text-gray-700">Thời gian</label>
                    <div className="flex gap-2">
                        <input type="date" name="dateFrom" value={filters.dateFrom} onChange={handleFilterChange} className="w-full p-2 text-sm border border-gray-300 rounded-md" />
                        <input type="date" name="dateTo" value={filters.dateTo} onChange={handleFilterChange} className="w-full p-2 text-sm border border-gray-300 rounded-md" />
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-gray-600">{filteredLogs.length} kết quả</span>
                <button className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-white bg-green-600 border-transparent rounded-md shadow-sm hover:bg-green-700">
                    <ExportIcon /> <span className="hidden sm:inline">Xuất Excel</span>
                </button>
            </div>

            {/* Desktop Log Table */}
            <div className="hidden md:block overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 bg-gray-50">
                        <tr>
                            <th className="px-4 py-3">Thời gian</th>
                            <th className="px-4 py-3">Người thực hiện</th>
                            <th className="px-4 py-3">Hành động</th>
                            <th className="px-4 py-3">Mô tả chi tiết</th>
                            <th className="px-4 py-3">Chi tiết</th>
                        </tr>
                    </thead>
                    <tbody>
                        {paginatedLogs.map(log => (
                            <tr key={log.id} className="bg-white border-b hover:bg-gray-50">
                                <td className="px-4 py-3 whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                                <td className="px-4 py-3 font-medium text-gray-900">{log.userName || 'Unknown'}</td>
                                <td className="px-4 py-3">{getActionBadge(log.action)}</td>
                                <td className="px-4 py-3">{generateDescription(log)}</td>
                                <td className="px-4 py-3">
                                    <button onClick={() => setSelectedLog(log)} className="font-medium text-blue-600 hover:underline">[Xem]</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile Card List */}
            <div className="md:hidden space-y-3">
                {paginatedLogs.map(log => (
                    <div
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className="bg-gray-50 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors border"
                    >
                        <div className="flex justify-between items-start text-xs text-gray-500 mb-2">
                            <p className="font-medium text-gray-700 break-all">{log.userName || 'Unknown'}</p>
                            <p className="flex-shrink-0 ml-2">{formatDateTime(log.timestamp)}</p>
                        </div>
                        <p className="text-sm text-gray-800">
                            {getActionBadge(log.action)} {generateDescription(log)}
                        </p>
                    </div>
                ))}
            </div>

            {paginatedLogs.length === 0 && <p className="text-center py-10 text-gray-500">Không có dữ liệu lịch sử phù hợp.</p>}

            {/* Desktop Pagination */}
            <div className="hidden md:block p-4">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                    totalItems={filteredLogs.length}
                />
            </div>

            {/* Mobile Pagination */}
            <div className="md:hidden mt-4 flex justify-center">
                <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    itemsPerPage={itemsPerPage}
                    onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                    totalItems={filteredLogs.length}
                    prevButtonContent={<ChevronLeftIcon />}
                    nextButtonContent={<ChevronRightIcon />}
                />
            </div>

            <DetailModal log={selectedLog} onClose={() => setSelectedLog(null)} />
        </div>
    );
};

export default AdminHistory;