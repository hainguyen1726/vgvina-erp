import React, { useState, useEffect } from 'react';
import { auditLogService } from '../../src/services/auditLogService';
import { AuditLog } from '../../types';

interface RecordHistoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    tableName: string;
    recordId: string;
    recordCode: string;
}

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

const formatDateTime = (dateStr: string) => {
    const d = new Date(dateStr);
    const date = d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return `${date} ${time}`;
};

export const RecordHistoryModal: React.FC<RecordHistoryModalProps> = ({
    isOpen,
    onClose,
    tableName,
    recordId,
    recordCode,
}) => {
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) {
            window.addEventListener('keydown', handleEsc);
            loadHistory();
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, tableName, recordId]);

    const loadHistory = async () => {
        try {
            setLoading(true);
            const data = await auditLogService.getLogsByRecordId(tableName, recordId);
            setLogs(data);
        } catch (error) {
            console.error('Failed to load history logs:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const readableTableName = TABLE_NAME_MAP[tableName] || tableName;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[100] flex justify-end" onClick={onClose}>
            <div 
                className="bg-white h-full w-full max-w-2xl shadow-2xl flex flex-col"
                onClick={e => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div className="p-4 border-b flex justify-between items-center bg-gray-50">
                    <div>
                        <h3 className="text-lg font-semibold text-gray-800">
                            Lịch sử chỉnh sửa
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                            {readableTableName}: <span className="font-medium text-gray-700">{recordCode}</span>
                        </p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="text-gray-400 hover:text-gray-600 text-2xl p-1 rounded-full hover:bg-gray-100 transition-colors leading-none"
                    >
                        &times;
                    </button>
                </div>

                {/* Modal Content */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-48 space-y-2">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                            <span className="text-sm text-gray-500">Đang tải lịch sử...</span>
                        </div>
                    ) : logs.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-48 text-gray-400">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mb-2">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            <span className="text-sm">Chưa có lịch sử ghi nhận cho phiếu này</span>
                        </div>
                    ) : (
                        <div className="relative border-l border-gray-200 ml-4 pl-6 space-y-8">
                            {logs.map((log) => {
                                const allKeys = new Set([
                                    ...Object.keys(log.oldValues || {}),
                                    ...Object.keys(log.newValues || {})
                                ]);
                                
                                const changes: { key: string; oldValue: any; newValue: any }[] = [];
                                allKeys.forEach(key => {
                                    if (key === 'updated_at' || key === 'id' || key === 'created_at' || key === 'facility_id') return;
                                    const oldVal = log.oldValues?.[key];
                                    const newVal = log.newValues?.[key];
                                    if (oldVal !== newVal) {
                                        changes.push({ key, oldValue: oldVal, newValue: newVal });
                                    }
                                });

                                let actionBadge = null;
                                switch (log.action) {
                                    case 'CREATE':
                                        actionBadge = <span className="px-2 py-0.5 text-xs font-medium text-green-700 bg-green-50 rounded border border-green-200">Khởi tạo</span>;
                                        break;
                                    case 'UPDATE':
                                        actionBadge = <span className="px-2 py-0.5 text-xs font-medium text-blue-700 bg-blue-50 rounded border border-blue-200">Cập nhật</span>;
                                        break;
                                    case 'DELETE':
                                        actionBadge = <span className="px-2 py-0.5 text-xs font-medium text-red-700 bg-red-50 rounded border border-red-200">Xóa</span>;
                                        break;
                                }

                                return (
                                    <div key={log.id} className="relative">
                                        {/* Timeline dot */}
                                        <div className={`absolute -left-[31px] top-1.5 w-4 h-4 rounded-full border-4 bg-white ${
                                            log.action === 'CREATE' ? 'border-green-500' : 
                                            log.action === 'DELETE' ? 'border-red-500' : 'border-blue-500'
                                        }`} />

                                        {/* Entry Header */}
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="text-sm font-medium text-gray-800">
                                                {log.userName}
                                            </span>
                                            {actionBadge}
                                            <span className="text-xs text-gray-400 font-mono ml-auto">
                                                {formatDateTime(log.timestamp)}
                                            </span>
                                        </div>

                                        {/* Entry Changes Details */}
                                        <div className="bg-gray-50 border border-gray-100 rounded-lg p-3 text-sm">
                                            {log.action === 'CREATE' ? (
                                                <div className="text-gray-600">
                                                    Đã khởi tạo phiếu thành công trên hệ thống.
                                                </div>
                                            ) : log.action === 'DELETE' ? (
                                                <div className="text-red-600">
                                                    Đã xóa phiếu khỏi hệ thống.
                                                </div>
                                            ) : changes.length === 0 ? (
                                                <div className="text-gray-500 italic">
                                                    Không có thay đổi dữ liệu hoặc chỉ cập nhật thời gian.
                                                </div>
                                            ) : (
                                                <div className="overflow-x-auto">
                                                    <table className="w-full text-xs text-left border-collapse">
                                                        <thead>
                                                            <tr className="border-b border-gray-200 text-gray-400 font-medium">
                                                                <th className="py-1 pr-2 w-1/3">Tên trường</th>
                                                                <th className="py-1 px-2">Giá trị cũ</th>
                                                                <th className="py-1 pl-2">Giá trị mới</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-gray-100">
                                                            {changes.map(c => (
                                                                <tr key={c.key} className="bg-red-50/20">
                                                                    <td className="py-1.5 pr-2 font-normal text-gray-600">
                                                                        {FIELD_NAME_MAP[c.key] || c.key}
                                                                    </td>
                                                                    <td className="py-1.5 px-2 font-normal text-gray-500">
                                                                        {c.oldValue !== null && c.oldValue !== undefined ? String(c.oldValue) : '-'}
                                                                    </td>
                                                                    <td className="py-1.5 pl-2 font-normal text-red-600">
                                                                        {c.newValue !== null && c.newValue !== undefined ? String(c.newValue) : '-'}
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-end rounded-b-lg">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Đóng
                    </button>
                </div>
            </div>
        </div>
    );
};
