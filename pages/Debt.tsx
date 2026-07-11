import React, { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { formatDate } from '../src/utils/dateUtils';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import FilterBar from '../components/ui/FilterBar';
import SummaryCard from '../components/ui/SummaryCard';
import Pagination from '../components/ui/Pagination';
import { TableActions } from '../components/ui/TableActions';
import { Page, Debt as DebtType, DebtStatus, AdminAccount } from '../types';
import { debtService } from '../src/services/debtService';
import { accountService } from '../src/services/accountService';
import { partnerService } from '../src/services/partnerService';
import { transactionService } from '../src/services/transactionService';
import { orderService } from '../src/services/orderService';
import { excelUtils } from '../src/utils/excelUtils';
import PrintVoucherTemplate from '../components/print/PrintVoucherTemplate';
import { CongNoIcon, ExportIcon, EditIcon, DeleteIcon, ArrowUpIcon, ChevronDownIcon, ArrowsUpDownIcon, ChevronLeftIcon, ColumnOptionsIcon, PlusIcon, ThuChiIcon } from '../components/icons/Icons';
import { useBranch } from '../contexts/BranchContext';
import { useNotification } from '../contexts/NotificationContext';
import { TransactionType } from '../types';
import ConfirmationModal from '../components/modals/ConfirmationModal';
import { SalesOrderDetailModal } from './SalesOrders';
import { IncomeExpenseDetailModal } from './IncomeExpense';
import VoucherModal from '../components/modals/VoucherModal';
import EditTransactionModal from '../components/modals/EditTransactionModal';
import { RecordHistoryModal } from '../components/modals/RecordHistoryModal';

const getStatusBadge = (status: DebtStatus) => {
  switch (status) {
    case DebtStatus.PAID:
      return <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Đã thanh toán</span>;
    case DebtStatus.PARTIALLY_PAID:
      return <span className="px-2 py-1 text-xs font-medium text-yellow-800 bg-yellow-100 rounded-full">Thanh toán 1 phần</span>;
    case DebtStatus.UNPAID:
      return <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">Chưa thanh toán</span>;
    default:
      return <span className="px-2 py-1 text-xs font-medium text-gray-800 bg-gray-100 rounded-full">Không xác định</span>;
  }
};

// Modal Component for Debt Details
const DetailModal = ({ item, onClose, onEditClick, onDeleteClick }: { item: DebtType | null, onClose: () => void, onEditClick: (item: DebtType) => void, onDeleteClick: (item: DebtType) => void }) => {
  const { currentUser } = useBranch();
  const [showHistory, setShowHistory] = useState(false);
  const isAdmin = currentUser?.is_admin === true ||
    ['admin', 'Admin', 'Quản trị viên', 'Kế toán HO', 'Ban Lãnh đạo', 'Quản lý Chi nhánh'].includes(currentUser?.role || '');

  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (item) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [item, onClose]);
  const { showNotification } = useNotification();
  const navigate = useNavigate();

  const handleExport = () => {
    if (!item) return;
    console.log("Exporting debt to Excel:", JSON.stringify(item, null, 2));
    showNotification(`Đã xuất dữ liệu công nợ của ${item.partner_name} ra console.`, 'info');
  };

  const [isPrinting, setIsPrinting] = useState(false);
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [accountHolder, setAccountHolder] = useState('');
  const [adminAccounts, setAdminAccounts] = useState<AdminAccount[]>([]);
  const [selectedAdminAccountId, setSelectedAdminAccountId] = useState('');
  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  useEffect(() => {
    if (item?.type === 'RECEIVABLE') {
      accountService.getAccounts().then(setAdminAccounts).catch(console.error);
    }

    // Fetch payment history
    if (item?.partner_id) {
      setLoadingHistory(true);
      const type = item.type === 'RECEIVABLE' ? TransactionType.INCOME : TransactionType.EXPENSE;
      transactionService.getTransactions(type, undefined, undefined, undefined, item.partner_id)
        .then(data => {
          // Filter transactions that took place on or after the debt start date
          const debtDate = item.due_date ? new Date(new Date(item.due_date).getTime() - 30 * 24 * 60 * 60 * 1000) : new Date(0);
          const related = data.filter(t => t.transaction_date && new Date(t.transaction_date) >= debtDate);
          setHistory(related);
        })
        .catch(console.error)
        .finally(() => setLoadingHistory(false));
    }
  }, [item]);

  const handleAdminAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const accountId = e.target.value;
    setSelectedAdminAccountId(accountId);
    const account = adminAccounts.find(a => a.id === accountId);
    if (account) {
      setBankName(account.bank_name || '');
      setAccountNumber(account.account_number || '');
      setAccountHolder(account.account_holder || '');
    }
  };

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
    if (!item) return null;
    const refDate = item.due_date ? new Date(item.due_date) : new Date();
    const startOfMonth = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
    const endOfMonth = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);

    return {
      date: new Date().toISOString(),
      dateRange: {
        from: startOfMonth.toISOString(),
        to: endOfMonth.toISOString()
      },
      partner: {
        name: item.partner_name,
      },
      transactions: [{
        order_date: item.due_date,
        code: '---',
        items: [{ product: { name: item.type === 'RECEIVABLE' ? 'Phải thu' : 'Phải trả' } }],
        total_amount: item.amount,
      }],
      summary: {
        total: item.amount,
        paid: item.status === 'PAID' ? item.amount : 0,
        remaining: item.status === 'PAID' ? 0 : item.amount,
      },
      assignedUser: item.assigned_user_names?.join(', ') || (item as any).assigned_user || 'N/A',
      debtType: item.type,
      bankInfo: {
        bankName,
        accountNumber,
        accountHolder
      }
    };
  };

  if (!item) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-xl" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center border-b p-4">
            <h3 className="text-lg font-semibold text-gray-800">Chi tiết công nợ</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
          </div>
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-4 items-center text-sm">
              <p className="text-gray-500 col-span-1">Đối tác:</p>
              <p className="font-semibold text-gray-800 col-span-2">{item.partner_name}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center text-sm">
              <p className="text-gray-500 col-span-1">Loại công nợ:</p>
              <p className="font-medium col-span-2">{item.type === 'RECEIVABLE' ? 'Phải thu' : 'Phải trả'}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center text-sm">
              <p className="text-gray-500 col-span-1">Ngày phát sinh:</p>
              <p className="font-medium col-span-2">{formatDate(new Date(new Date(item.due_date).getTime() - 30 * 24 * 60 * 60 * 1000))}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center text-sm">
              <p className="text-gray-500 col-span-1">Hạn thanh toán:</p>
              <p className="font-medium col-span-2">{formatDate(item.due_date)}</p>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center text-sm">
              <p className="text-gray-500 col-span-1">Số tiền:</p>
              <p className={`font-bold text-right col-span-2 ${item.type === 'RECEIVABLE' ? 'text-green-600' : 'text-red-600'}`}>{(item.amount || 0).toLocaleString('vi-VN')} ₫</p>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center text-sm">
              <p className="text-gray-500 col-span-1">Trạng thái:</p>
              <div className="col-span-2 flex justify-end">{getStatusBadge(item.status)}</div>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center text-sm mb-4">
              <p className="text-gray-500 col-span-1">Phụ trách:</p>
              <p className="font-medium col-span-2 text-right">{item.assigned_user_names?.join(', ') || (item as any).assigned_user || 'N/A'}</p>
            </div>

            {/* Payment History Section */}
            <div className="mt-6 border-t pt-4">
              <h4 className="text-sm font-bold text-gray-700 mb-2 uppercase tracking-wide">Lịch sử thanh toán</h4>
              {loadingHistory ? (
                <p className="text-xs text-center text-gray-500 py-4">Đang tải lịch sử...</p>
              ) : history.length > 0 ? (
                <div className="overflow-hidden border border-gray-100 rounded-lg">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-gray-50 text-gray-500 font-semibold">
                      <tr>
                        <th className="px-3 py-2">Ngày</th>
                        <th className="px-3 py-2">Số phiếu</th>
                        <th className="px-3 py-2 text-right">Số tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                      {history.map(txn => (
                        <tr key={txn.id} className="hover:bg-gray-50">
                          <td className="px-3 py-2">{formatDate(txn.transaction_date)}</td>
                          <td className="px-3 py-2 font-medium text-blue-600">{txn.code}</td>
                          <td className="px-3 py-2 text-right font-semibold">{(txn.amount || 0).toLocaleString('vi-VN')} đ</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-center text-gray-500 py-4">Chưa có giao dịch thanh toán nào.</p>
              )}
            </div>

            {/* Bank Info Input Fields for Printing */}
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 space-y-3">
              <div className="flex justify-between items-center">
                <p className="text-xs font-bold text-blue-800 italic">
                  {item.type === 'RECEIVABLE' ? 'Thông tin tài khoản nhận thanh toán' : 'Thông tin tài khoản nhà cung cấp'}
                </p>
                {item.type === 'RECEIVABLE' && adminAccounts.length > 0 && (
                  <select
                    value={selectedAdminAccountId}
                    onChange={handleAdminAccountChange}
                    className="text-xs p-1 border border-blue-200 rounded bg-white outline-none focus:ring-1 focus:ring-blue-400"
                  >
                    <option value="">-- Chọn tài khoản mẫu --</option>
                    {adminAccounts.filter(a => a.type === 'Ngân hàng').map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </select>
                )}
              </div>
              <div className="space-y-1">
                <label className="text-xs text-blue-700">Ngân hàng</label>
                <input
                  type="text"
                  value={bankName}
                  onChange={e => setBankName(e.target.value)}
                  placeholder="Ví dụ: Vietcombank"
                  className="w-full p-2 text-sm border border-blue-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-blue-700">Số tài khoản</label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={e => setAccountNumber(e.target.value)}
                    placeholder="Số tài khoản"
                    className="w-full p-2 text-sm border border-blue-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-blue-700">Chủ tài khoản</label>
                  <input
                    type="text"
                    value={accountHolder}
                    onChange={e => setAccountHolder(e.target.value)}
                    placeholder="Tên chủ TK"
                    className="w-full p-2 text-sm border border-blue-200 rounded-md focus:ring-1 focus:ring-blue-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="border-t p-4 flex flex-wrap sm:flex-nowrap justify-between gap-2 bg-gray-50 rounded-b-lg">
            {isAdmin && (
              <button 
                onClick={() => setShowHistory(true)} 
                className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs sm:text-sm font-medium bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 text-gray-500">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                </svg>
                Lịch sử
              </button>
            )}
            <button onClick={() => setIsPrinting(true)} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs sm:text-sm font-medium bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]">
              In phiếu
            </button>
            <button onClick={handleExport} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs sm:text-sm font-medium bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200">
              <ExportIcon className="w-4 h-4 hidden sm:block" /> Xuất file
            </button>
            <button onClick={() => onEditClick(item)} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs sm:text-sm font-medium bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50">
              <EditIcon className="w-4 h-4 hidden sm:block" /> Sửa
            </button>
            <button
              onClick={() => { onClose(); navigate(`/bao-cao/so-chi-tiet-cong-no?partnerId=${item.partner_id}`); }}
              className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs sm:text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 whitespace-nowrap"
            >
              <CongNoIcon className="w-4 h-4 hidden xl:block" /> Sổ chi tiết
            </button>
            <button onClick={() => onDeleteClick(item)} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs sm:text-sm font-medium bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100">
              <DeleteIcon className="w-4 h-4 hidden sm:block" /> Xóa
            </button>
            <button onClick={onClose} className="flex-1 flex items-center justify-center gap-1.5 px-2 py-2 text-xs sm:text-sm font-medium bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">
              Đóng
            </button>
          </div>
        </div>
      </div>

      {isPrinting && createPortal(
        <div id="print-section" className="hidden print:block bg-white p-0 m-0 z-[100]">
          <PrintVoucherTemplate voucherType="debt-notice" data={getPrintData()} />
        </div>,
        document.body
      )}

      {showHistory && (
        <RecordHistoryModal
          isOpen={showHistory}
          onClose={() => setShowHistory(false)}
          tableName="vgvina_debt_transactions"
          recordId={String(item.id)}
          recordCode={item.code || `CN-${item.partner_name}`}
        />
      )}
    </>
  );
};

const ReturnVoucherDetailModal = ({ 
  item, 
  onClose, 
  onEditClick, 
  onDeleteClick 
}: { 
  item: any | null, 
  onClose: () => void, 
  onEditClick: (item: any) => void, 
  onDeleteClick: (item: any) => void 
}) => {
  const { can } = useBranch();
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (item) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [item, onClose]);
  const { showNotification } = useNotification();
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    if (isPrinting) {
      const timer = setTimeout(() => {
        window.print();
        setIsPrinting(false);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPrinting]);

  if (!item) return null;

  const handleExport = () => {
    try {
      excelUtils.exportReturnVoucherStyled(item);
      showNotification(`Đã xuất file Excel cho phiếu trả hàng ${item.code}`, 'success');
    } catch (err: any) {
      showNotification('Không thể xuất file Excel: ' + err.message, 'error');
    }
  };

  const getPrintData = () => {
    return {
      ...item,
      partner: { name: item.customer_name },
      items: item.items.map((i: any) => ({
        sku: i.product?.sku || 'N/A',
        name: i.product?.name || 'Unknown',
        unit: i.product?.unit || '?',
        quantity: i.quantity,
        price: i.price,
        total: i.quantity * i.price
      })),
      summary: {
        total: item.total_amount + Number(item.return_fee || 0) + Number(item.discount || 0),
        discount: Number(item.discount || 0),
        return_fee: Number(item.return_fee || 0),
        final: item.total_amount
      }
    };
  };

  return (
    <>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
        <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center border-b p-4">
            <h3 className="text-lg font-semibold text-gray-800">Chi tiết phiếu trả hàng</h3>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
          </div>
          <div className="p-6 max-h-[70vh] overflow-y-auto">
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 mb-6 text-sm">
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Mã phiếu:</span>
                <span className="text-gray-800 font-semibold">{item.code}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Ngày trả:</span>
                <span className="text-gray-800 font-medium">{formatDate(item.return_date)}</span>
              </div>
              <div className="flex justify-between border-b pb-1 col-span-2">
                <span className="text-gray-500">Đối tác:</span>
                <span className="text-gray-800 font-semibold">{item.customer_name}</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Phương thức xử lý:</span>
                <span className="text-gray-800 font-medium">
                  {item.handling_method === 'REFUND' ? 'Hoàn tiền' : item.handling_method === 'DEBT_DEDUCTION' ? 'Trừ nợ' : 'Khác'}
                </span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500">Trạng thái:</span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                  {item.status === 'COMPLETED' ? 'Đã hoàn thành' : item.status}
                </span>
              </div>
              {item.notes && (
                <div className="flex justify-between border-b pb-1 col-span-2">
                  <span className="text-gray-500 shrink-0 mr-4">Lý do/Ghi chú:</span>
                  <span className="text-gray-800 text-right">{item.notes}</span>
                </div>
              )}
            </div>
            
            <div className="pt-4 border-t">
              <h4 className="font-semibold text-gray-700 mb-2">Chi tiết sản phẩm trả lại</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="bg-gray-50 text-gray-600">
                    <tr>
                      <th className="p-2">Stt</th>
                      <th className="p-2">Tên sản phẩm</th>
                      <th className="p-2">Đvt</th>
                      <th className="p-2 text-right">Số lượng</th>
                      <th className="p-2 text-right">Đơn giá</th>
                      <th className="p-2 text-right">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {item.items.map((orderItem: any, index: number) => (
                      <tr key={orderItem.id || index}>
                        <td className="p-2 text-center">{index + 1}</td>
                        <td className="p-2">{orderItem.product?.name || 'Unknown'}</td>
                        <td className="p-2">{orderItem.product?.unit || 'N/A'}</td>
                        <td className="p-2 text-right tabular-nums">{orderItem.quantity}</td>
                        <td className="p-2 text-right tabular-nums">{orderItem.price.toLocaleString('vi-VN')} đ</td>
                        <td className="p-2 text-right font-medium tabular-nums">{(orderItem.quantity * orderItem.price).toLocaleString('vi-VN')} đ</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 space-y-1.5 text-sm flex flex-col items-end pr-2 border-t pt-3">
                <div className="flex justify-between w-64">
                  <span className="text-gray-500">Tổng giá trị hàng trả:</span>
                  <span className="font-semibold text-gray-800">{(item.total_amount + Number(item.return_fee || 0) + Number(item.discount || 0)).toLocaleString('vi-VN')} ₫</span>
                </div>
                {Number(item.return_fee || 0) > 0 && (
                  <div className="flex justify-between w-64 text-red-600">
                    <span>Phí trả hàng:</span>
                    <span>-{Number(item.return_fee || 0).toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
                {Number(item.discount || 0) > 0 && (
                  <div className="flex justify-between w-64 text-red-600">
                    <span>Giảm giá thêm:</span>
                    <span>-{Number(item.discount || 0).toLocaleString('vi-VN')} ₫</span>
                  </div>
                )}
                <div className="flex justify-between w-64 border-t pt-1 font-bold text-blue-600 text-base">
                  <span>Tổng tiền trả:</span>
                  <span>{item.total_amount.toLocaleString('vi-VN')} ₫</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t p-4 flex justify-end items-center bg-gray-50 rounded-b-lg space-x-2">
            <button onClick={() => setIsPrinting(true)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-[#0066cc] text-white rounded-lg hover:bg-[#0052a3]">
              In phiếu
            </button>
            <button onClick={handleExport} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200">
              <ExportIcon className="w-4 h-4" /> Xuất file
            </button>
            {can('sales_orders', 'edit') && (
              <button onClick={() => onEditClick(item)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50">
                <EditIcon className="w-4 h-4" /> Sửa
              </button>
            )}
            {can('sales_orders', 'delete') && (
              <button onClick={() => onDeleteClick(item)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
                <DeleteIcon className="w-4 h-4" /> Xóa
              </button>
            )}
            <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Đóng</button>
          </div>
        </div>
      </div>

      {isPrinting && createPortal(
        <div id="print-section" className="hidden print:block bg-white p-0 m-0 z-[100]">
          <PrintVoucherTemplate voucherType="return-voucher" data={getPrintData()} />
        </div>,
        document.body
      )}
    </>
  );
};

const allColumns = [
  { key: 'partner_name', label: 'Đối tác', w: '25%' },
  { key: 'amount', label: 'Số tiền', w: '15%' },
  { key: 'due_date', label: 'Hạn thanh toán', w: '15%' },
  { key: 'status', label: 'Trạng thái', w: '15%' },
  { key: 'type', label: 'Loại công nợ', w: '10%' },
  { key: 'assigned_user', label: 'Nhân viên', w: '10%' },
  { key: 'facility_name', label: 'Chi nhánh', w: '10%' },
];

const Debt: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(30);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleColumns, setVisibleColumns] = useState(["partner_name", "amount", "due_date", "status", "type", "assigned_user", "facility_name"]);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [modalItem, setModalItem] = useState<DebtType | null>(null);
  const [itemToDelete, setItemToDelete] = useState<DebtType | null>(null);
  const [dataToImport, setDataToImport] = useState<Omit<DebtType, 'id'>[] | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [timeFilter, setTimeFilter] = useState<{ filter: string; dates?: { from: Date; to: Date } }>({ filter: 'All time' });
  const [selectedPartnerName, setSelectedPartnerName] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [debtToEdit, setDebtToEdit] = useState<DebtType | null>(null);
  const [expandedDebtId, setExpandedDebtId] = useState<string | null>(null);
  const [statementData, setStatementData] = useState<any[]>([]);
  const [loadingStatement, setLoadingStatement] = useState(false);
  const [expandedTimeFilter, setExpandedTimeFilter] = useState<string>('All time');
  const [expandedFromDate, setExpandedFromDate] = useState<string>('');
  const [expandedToDate, setExpandedToDate] = useState<string>('');
  const [salesModalItem, setSalesModalItem] = useState<any | null>(null);
  const [txnModalItem, setTxnModalItem] = useState<any | null>(null);
  const [itemToDeleteFromStatement, setItemToDeleteFromStatement] = useState<any | null>(null);
  const [voucherModal, setVoucherModal] = useState<{ isOpen: boolean; type: string; initialData?: any }>({ isOpen: false, type: '' });
  const [printDebtItem, setPrintDebtItem] = useState<DebtType | null>(null);
  const [isPrintingDebt, setIsPrintingDebt] = useState(false);
  const [isEditTransactionModalOpen, setIsEditTransactionModalOpen] = useState(false);
  const [transactionToEdit, setTransactionToEdit] = useState<any>(null);
  const [returnVoucherModalItem, setReturnVoucherModalItem] = useState<any | null>(null);
  const { showNotification } = useNotification();

  const location = useLocation();
  const navigate = useNavigate();
  const { selectedFacilityId, selectedBranch, currentUser } = useBranch();

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const filters: string[] = [];
    const type = searchParams.get('type');
    const status = searchParams.get('status');

    if (type) filters.push(type);
    if (status === 'OUTSTANDING') filters.push('OUTSTANDING');
    if (status === 'PAID') filters.push('PAID_FILTER');

    setActiveFilters(filters);
    setCurrentPage(1);
  }, [location.search]);

  const handleFilterToggle = (filter: string) => {
    setActiveFilters(prev => {
      let newFilters = prev.filter(f => f !== 'PAID_FILTER');
      const isCurrentlyActive = newFilters.includes(filter);
      if (isCurrentlyActive) {
        newFilters = newFilters.filter(f => f !== filter);
      } else {
        newFilters.push(filter);
      }
      return newFilters;
    });
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

  const [debts, setDebts] = useState<DebtType[]>([]);
  const [loading, setLoading] = useState(true);
  const [transactionStats, setTransactionStats] = useState({ income: 0, expense: 0 });
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchDebts();
    fetchStats();
  }, [selectedFacilityId, timeFilter]);

  const fetchStats = async () => {
    try {
      const facilityFilter = selectedFacilityId === null
        ? (currentUser?.is_admin ? undefined : '00000000-0000-0000-0000-000000000000')
        : selectedFacilityId;

      const stats = await transactionService.getTransactionStats({
        facilityId: facilityFilter || undefined,
        fromDate: timeFilter.filter !== 'All' ? timeFilter.dates?.from?.toISOString() : undefined,
        toDate: timeFilter.filter !== 'All' ? timeFilter.dates?.to?.toISOString() : undefined,
      });
      setTransactionStats(stats);
    } catch (error) {
      console.error("Failed to fetch transaction stats", error);
    }
  };

  const fetchDebts = async () => {
    try {
      setLoading(true);
      // If user is not admin and selectedFacilityId is null, they should see nothing (isolation)
      const isAdmin = currentUser?.is_admin === true ||
        ['admin', 'Admin', 'Quản trị viên', 'Kế toán HO', 'Ban Lãnh đạo', 'Quản lý Chi nhánh'].includes(currentUser?.role || '');

      const facilityFilter = selectedFacilityId === null
        ? (isAdmin ? undefined : '00000000-0000-0000-0000-000000000000')
        : selectedFacilityId;

      const employeeIdFilter = !isAdmin ? currentUser?.id : undefined;

      const data = await debtService.getDebts(facilityFilter || undefined, employeeIdFilter);
      setDebts(data);
    } catch (error) {
      console.error("Failed to fetch debts", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    excelUtils.exportTemplate(['Tên đối tác', 'Số tiền', 'Hạn thanh toán (YYYY-MM-DD)', 'Loại (RECEIVABLE/PAYABLE)', 'Trạng thái (UNPAID/PAID)'], 'Mau_CongNo');
  };

  const handleExportExcel = () => {
    const exportData = debts.map(d => ({
      'Đối tác': d.partner_name,
      'Số tiền': d.amount,
      'Hạn thanh toán': formatDate(d.due_date),
      'Loại': d.type === 'RECEIVABLE' ? 'Phải thu' : 'Phải trả',
      'Trạng thái': d.status === DebtStatus.PAID ? 'Đã thanh toán' : (d.status === DebtStatus.PARTIALLY_PAID ? 'Thanh toán 1 phần' : 'Chưa thanh toán'),
      'Nhân viên': d.assigned_user_names?.join(', ') || (d as any).assigned_user || 'N/A',
      'Chi nhánh': d.facility_name || 'N/A'
    }));
    excelUtils.exportDebtsStyled(exportData, 'DanhSachCongNo', selectedBranch || 'Tất cả');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const fileData = await excelUtils.readExcel(e.target.files[0]);
        // Fetch partners to map names to IDs
        const partners = await partnerService.getPartners();

        const mappedData = fileData.map((row: any) => {
          const partnerName = row['Tên đối tác'];
          const partner = partners.find(p => p.name === partnerName);
          // If partner not found, technically we should fail or ask user to create partner first.
          // For now, using raw name if ID not found (logic in service needs to handle this or ERROR will occur if FK constraint exists)
          // Actually service uses 'partner_id' column. If we pass name, postgres might complain if it's uuid type.
          // Assuming user inputs valid name existing in DB.

          return {
            amount: row['Số tiền'] || 0,
            due_date: row['Hạn thanh toán (YYYY-MM-DD)'] || new Date().toISOString().split('T')[0],
            type: row['Loại (RECEIVABLE/PAYABLE)'] as 'RECEIVABLE' | 'PAYABLE',
            status: (row['Trạng thái (UNPAID/PAID)'] as DebtStatus) || DebtStatus.UNPAID,
            partner_name: partner ? partner.id : undefined // Service expects param mapped to partner_id
          };
        }).filter(d => d.partner_name); // Filter out invalid partners

        if (mappedData.length < fileData.length) {
          showNotification(`Cảnh báo: ${fileData.length - mappedData.length} dòng bị bỏ qua do không tìm thấy Tên đối tác trong hệ thống.`, 'warning');
        }

        if (mappedData.length > 0) {
          setDataToImport(mappedData as any);
        }
      } catch (error) {
        console.error("Import failed:", error);
        showNotification("Lỗi khi import dữ liệu. Kiểm tra format file.", 'error');
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!dataToImport) return;
    try {
      await debtService.createDebts(dataToImport as any);
      showNotification('Import thành công!', 'success');
      fetchDebts();
    } catch (error) {
      console.error("Import failed:", error);
      showNotification("Lỗi khi import dữ liệu. Vui lòng kiểm tra lại file.", 'error');
    }
    setDataToImport(null);
  };

  const sortedDebts = useMemo(() => {
    let filteredDebts = debts.filter(debt =>
      debt.partner_name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

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
      filteredDebts = filteredDebts.filter(d => {
        const dueDate = new Date(d.due_date);
        if (fromDate && dueDate < fromDate) return false;
        if (toDate && dueDate > toDate) return false;
        return true;
      });
    }

    const typeFilters = activeFilters.filter(f => f === 'RECEIVABLE' || f === 'PAYABLE');
    if (typeFilters.length > 0) {
      filteredDebts = filteredDebts.filter(debt => typeFilters.includes(debt.type));
    }
    if (activeFilters.includes('OUTSTANDING')) {
      filteredDebts = filteredDebts.filter(debt => debt.status !== DebtStatus.PAID);
    }
    if (activeFilters.includes('PAID_FILTER')) {
      filteredDebts = filteredDebts.filter(debt => debt.status === DebtStatus.PAID || debt.status === DebtStatus.PARTIALLY_PAID);
    }
    if (activeFilters.includes('EMPLOYEE')) {
      filteredDebts = filteredDebts.filter(debt => debt.assigned_user_ids.includes(currentUser.id));
    }

    if (sortConfig) {
      filteredDebts.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof DebtType];
        const bValue = b[sortConfig.key as keyof DebtType];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          if (sortConfig.key === 'due_date') {
            const dateA = new Date(aValue).getTime();
            const dateB = new Date(bValue).getTime();
            if (dateA < dateB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (dateA > dateB) return sortConfig.direction === 'ascending' ? 1 : -1; // FIXED: Logic was returning 1 for <
            return 0;
          }
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }

    return filteredDebts;
  }, [searchTerm, activeFilters, sortConfig, timeFilter, debts]);

  const partnerGroupedDebts = useMemo(() => {
    const partnerMap = new Map<string, { receivable: number; payable: number }>();
    sortedDebts.forEach(debt => {
      const partnerData = partnerMap.get(debt.partner_name) || { receivable: 0, payable: 0 };
      if (debt.type === 'RECEIVABLE') {
        partnerData.receivable += debt.amount;
      } else {
        partnerData.payable += debt.amount;
      }
      partnerMap.set(debt.partner_name, partnerData);
    });
    return Array.from(partnerMap.entries()).map(([name, { receivable, payable }]) => {
      const netAmount = receivable - payable;
      return { name, totalAmount: netAmount };
    });
  }, [sortedDebts]);

  const totalPages = Math.ceil(sortedDebts.length / itemsPerPage);
  const paginatedDebts = sortedDebts.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEditClick = (item: DebtType) => {
    setDebtToEdit(item);
    setIsEditModalOpen(true);
    setModalItem(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setDebtToEdit(null);
  };

  const handleSaveDebt = async (updatedDebt: DebtType) => {
    try {
      await debtService.updateDebt(updatedDebt);
      showNotification(`Đã cập nhật công nợ cho ${updatedDebt.partner_name}.`, 'success');
      setIsEditModalOpen(false);
      fetchDebts();
      if (expandedDebtId === updatedDebt.id) {
        await fetchPartnerStatementData(updatedDebt.partner_id, expandedTimeFilter, expandedFromDate, expandedToDate);
      }
    } catch (error) {
      console.error("Failed to save debt:", error);
      showNotification("Lỗi khi cập nhật công nợ.", 'error');
    }
  };

  const handleOpenVoucherModal = (type: string, initialData?: any) => setVoucherModal({ isOpen: true, type, initialData });
  const handleCloseVoucherModal = () => {
    setVoucherModal({ isOpen: false, type: '' });
    fetchDebts();
    if (expandedDebtId) {
      const activeDebt = debts.find(d => d.id === expandedDebtId);
      if (activeDebt) {
        fetchPartnerStatementData(activeDebt.partner_id, expandedTimeFilter, expandedFromDate, expandedToDate);
      }
    }
  };

  const handleEditTransaction = (item: any) => {
    setTxnModalItem(null);
    setTransactionToEdit(item);
    setIsEditTransactionModalOpen(true);
  };

  const handleSaveTransaction = async (updatedTransaction: any) => {
    try {
      await transactionService.updateTransaction(updatedTransaction.id, updatedTransaction);
      setIsEditTransactionModalOpen(false);
      setTransactionToEdit(null);
      showNotification(`Đã lưu giao dịch: ${updatedTransaction.code}`, 'success');
      
      fetchDebts();
      if (expandedDebtId) {
        const activeDebt = debts.find(d => d.id === expandedDebtId);
        if (activeDebt) {
          await fetchPartnerStatementData(activeDebt.partner_id, expandedTimeFilter, expandedFromDate, expandedToDate);
        }
      }
    } catch (err: any) {
      showNotification("Lỗi khi lưu giao dịch: " + err.message, 'error');
    }
  };

  const handlePrintDebt = (debtItem: DebtType) => {
    setPrintDebtItem(debtItem);
    setIsPrintingDebt(true);
  };

  useEffect(() => {
    if (isPrintingDebt && printDebtItem) {
      const timer = setTimeout(() => {
        window.print();
        setIsPrintingDebt(false);
        setPrintDebtItem(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isPrintingDebt, printDebtItem]);

  const getPrintData = (debtItem: DebtType) => {
    const refDate = debtItem.due_date ? new Date(debtItem.due_date) : new Date();
    const startOfMonth = new Date(refDate.getFullYear(), refDate.getMonth(), 1);
    const endOfMonth = new Date(refDate.getFullYear(), refDate.getMonth() + 1, 0);

    return {
      date: new Date().toISOString(),
      dateRange: {
        from: startOfMonth.toISOString(),
        to: endOfMonth.toISOString()
      },
      partner: {
        name: debtItem.partner_name,
      },
      transactions: [{
        order_date: debtItem.due_date,
        code: '---',
        items: [{ product: { name: debtItem.type === 'RECEIVABLE' ? 'Phải thu' : 'Phải trả' } }],
        total_amount: debtItem.amount,
      }],
      summary: {
        total: debtItem.amount,
        paid: debtItem.status === 'PAID' ? debtItem.amount : 0,
        remaining: debtItem.status === 'PAID' ? 0 : debtItem.amount,
      },
      assignedUser: debtItem.assigned_user_names?.join(', ') || (debtItem as any).assigned_user || 'N/A',
      debtType: debtItem.type,
      bankInfo: {
        bankName: '',
        accountNumber: '',
        accountHolder: ''
      }
    };
  };

  const handleExportStatement = (partnerName: string) => {
    const exportData = statementData.map(a => ({
      'Ngày': formatDate(a.date),
      'Mã': a.code,
      'Mô tả': a.description,
      'Tăng': a.increase,
      'Giảm': a.decrease,
      'Dư': a.balance,
      'Ghi chú': a.notes || ''
    }));
    excelUtils.exportPartnerStatementStyled(exportData, `SoChiTietCongNo_${partnerName}`, partnerName, selectedBranch || 'Tất cả');
  };

  const handleDeleteClick = (item: DebtType) => { setItemToDelete(item); };

  const fetchPartnerStatementData = async (partnerId: string, filter: string, customFrom?: string, customTo?: string) => {
    setLoadingStatement(true);
    try {
      let fromStr: string | undefined = undefined;
      let toStr: string | undefined = undefined;
      const now = new Date();

      if (filter === 'Hôm nay') {
        fromStr = now.toISOString().split('T')[0];
        toStr = fromStr;
      } else if (filter === 'Hôm qua') {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        fromStr = yesterday.toISOString().split('T')[0];
        toStr = fromStr;
      } else if (filter === 'Tuần này') {
        const dayOfWeek = now.getDay();
        const diff = now.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1);
        const startOfWeek = new Date(now.setDate(diff));
        fromStr = startOfWeek.toISOString().split('T')[0];
        toStr = new Date().toISOString().split('T')[0];
      } else if (filter === 'Tháng này') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        fromStr = startOfMonth.toISOString().split('T')[0];
        toStr = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
      } else if (filter === 'Tháng trước') {
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        fromStr = startOfLastMonth.toISOString().split('T')[0];
        toStr = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
      } else if (filter === 'Năm nay') {
        fromStr = `${now.getFullYear()}-01-01`;
        toStr = `${now.getFullYear()}-12-31`;
      } else if (filter === 'Tùy chọn') {
        fromStr = customFrom;
        toStr = customTo;
      }

      const data = await partnerService.getPartnerStatement(
        partnerId,
        fromStr,
        toStr,
        selectedFacilityId || undefined
      );

      // Build running balance
      let balance = 0;
      const withBalance = data.map((a: any) => {
        balance += (a.increase || 0) - (a.decrease || 0);
        return { ...a, balance };
      });
      setStatementData([...withBalance].reverse());
    } catch (err) {
      console.error('Statement fetch error:', err);
      setStatementData([]);
    } finally {
      setLoadingStatement(false);
    }
  };

  const handlePartnerExpandToggle = async (debt: DebtType, e: React.MouseEvent) => {
    e.stopPropagation();
    if (expandedDebtId === debt.id) {
      setExpandedDebtId(null);
      setStatementData([]);
      return;
    }
    setExpandedDebtId(debt.id);
    setExpandedTimeFilter('All time');
    setExpandedFromDate('');
    setExpandedToDate('');
    await fetchPartnerStatementData(debt.partner_id, 'All time');
  };

  const handleExpandedTimeFilterChange = async (partnerId: string, filter: string) => {
    setExpandedTimeFilter(filter);
    if (filter !== 'Tùy chọn') {
      await fetchPartnerStatementData(partnerId, filter);
    }
  };

  const handleExpandedCustomDateChange = async (partnerId: string, from: string, to: string) => {
    setExpandedFromDate(from);
    setExpandedToDate(to);
    if (from && to) {
      await fetchPartnerStatementData(partnerId, 'Tùy chọn', from, to);
    }
  };

  const handleActivityClick = async (row: any, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      setLoadingStatement(true);
      if (row.type === 'SALES_ORDER') {
        const data = await orderService.getSalesOrderById(row.id);
        setSalesModalItem(data);
      } else if (row.type === 'PURCHASE_ORDER') {
        const data = await orderService.getPurchaseOrderById(row.id);
        setSalesModalItem(data);
      } else if (row.type === 'PAYMENT_RECEIVED' || row.type === 'PAYMENT_MADE') {
        const data = await transactionService.getTransactionById(row.id);
        setTxnModalItem(data);
      } else if (row.type === 'RETURN_VOUCHER') {
        const data = await orderService.getReturnVouchers();
        const found = data.find((v: any) => v.id === row.id);
        if (found) {
          setReturnVoucherModalItem(found);
        } else {
          showNotification('Không tìm thấy thông tin chi tiết của phiếu trả hàng.', 'warning');
        }
      }
    } catch (err: any) {
      console.error('Error fetching detail', err);
      showNotification('Không thể tải chi tiết chứng từ: ' + err.message, 'error');
    } finally {
      setLoadingStatement(false);
    }
  };

  const handleDeleteOrder = (item: any) => {
    setSalesModalItem(null);
    setItemToDeleteFromStatement({ ...item, statementDeleteType: 'ORDER' });
  };

  const handleDeleteTransaction = (item: any) => {
    setTxnModalItem(null);
    setItemToDeleteFromStatement({ ...item, statementDeleteType: 'TRANSACTION' });
  };

  const handleDeleteReturnVoucher = (item: any) => {
    setReturnVoucherModalItem(null);
    setItemToDeleteFromStatement({ ...item, statementDeleteType: 'RETURN_VOUCHER' });
  };

  const handleConfirmDeleteFromStatement = async () => {
    if (!itemToDeleteFromStatement) return;
    try {
      if (itemToDeleteFromStatement.statementDeleteType === 'ORDER') {
        if ('customer_name' in itemToDeleteFromStatement) {
          await orderService.deleteSalesOrder(itemToDeleteFromStatement.id);
        } else {
          await orderService.deletePurchaseOrder(itemToDeleteFromStatement.id);
        }
      } else if (itemToDeleteFromStatement.statementDeleteType === 'RETURN_VOUCHER') {
        await orderService.deleteReturnVoucher(itemToDeleteFromStatement.id);
      } else {
        await transactionService.deleteTransaction(itemToDeleteFromStatement.id);
      }
      showNotification('Đã xóa chứng từ thành công', 'success');
      
      fetchDebts();
      if (expandedDebtId) {
        const activeDebt = debts.find(d => d.id === expandedDebtId);
        if (activeDebt) {
          await fetchPartnerStatementData(activeDebt.partner_id, expandedTimeFilter, expandedFromDate, expandedToDate);
        }
      }
    } catch (error: any) {
      console.error("Delete from statement failed", error);
      showNotification('Lỗi khi xóa chứng từ: ' + error.message, 'error');
    } finally {
      setItemToDeleteFromStatement(null);
    }
  };
  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await debtService.deleteDebt(itemToDelete.id);
        showNotification(`Đã xóa công nợ cho ${itemToDelete.partner_name}.`, 'success');
        fetchDebts();
        if (expandedDebtId === itemToDelete.id) {
          setExpandedDebtId(null);
          setStatementData([]);
        }
      } catch (error) {
        console.error("Failed to delete debt:", error);
        showNotification("Lỗi khi xóa công nợ.", 'error');
      }
    }
    setItemToDelete(null);
    setModalItem(null);
  };

  const renderCell = (debt: DebtType, columnKey: string) => {
    switch (columnKey) {
      case 'partner_name':
        return (
          <div className="truncate" title={debt.partner_name}>
            <button
              onClick={(e) => handlePartnerExpandToggle(debt, e)}
              className={`font-medium text-left hover:underline transition-colors ${
                expandedDebtId === debt.id ? 'text-[#0052a3] underline' : 'text-[#0066cc]'
              }`}
            >
              {debt.partner_name}
            </button>
          </div>
        );
      case 'amount': return <div className={`font-medium tabular-nums text-right truncate ${debt.type === 'RECEIVABLE' ? 'text-green-600' : 'text-red-600'}`}>{debt.amount.toLocaleString('vi-VN')} ₫</div>;
      case 'due_date': return <div className="truncate">{formatDate(debt.due_date)}</div>;
      case 'status': return <div className="truncate">{getStatusBadge(debt.status)}</div>;
      case 'type': return <div className="truncate">{debt.type === 'RECEIVABLE' ? 'Phải thu' : 'Phải trả'}</div>;
      case 'assigned_user':
        const user = debt.assigned_user_names?.join(', ') || (debt as any).assigned_user || 'N/A';
        return <div className="truncate" title={user}>{user}</div>;
      default:
        const value = debt[columnKey as keyof DebtType];
        const valStr = typeof value === 'string' || typeof value === 'number' ? String(value) : 'N/A';
        return <div className="truncate" title={valStr}>{valStr}</div>;
    }
  };

  const filterConfig = [{ key: 'OUTSTANDING', label: 'Còn nợ' }, { key: 'PAYABLE', label: 'Phải trả' }, { key: 'RECEIVABLE', label: 'Phải thu' }];
  const filterButtons = (<> {filterConfig.map(f => (<button key={f.key} onClick={() => handleFilterToggle(f.key)} className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${activeFilters.includes(f.key) ? 'bg-[#0066cc] text-white shadow-sm' : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'}`} > {f.label} </button>))} </>);

  const renderPartnerDetailView = () => {
    const partnerDebts = sortedDebts.filter(d => d.partner_name === selectedPartnerName);
    return (
      <>
        <div className="flex items-center gap-2 mb-4">
          <button onClick={() => setSelectedPartnerName(null)} className="p-2 rounded-full hover:bg-gray-200 transition-colors">
            <ChevronLeftIcon />
          </button>
          <h1 className="text-xl font-bold text-gray-800">Công nợ: {selectedPartnerName}</h1>
        </div>
        <div className="space-y-3">
          {partnerDebts.length > 0 ? partnerDebts.map(debt => (
            <div key={debt.id} onClick={() => setModalItem(debt)} className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors">
              <div className="flex justify-between items-start">
                <div className="flex-1 pr-2">
                  <p className="font-semibold text-sm">{debt.type === 'RECEIVABLE' ? 'Phải thu' : 'Phải trả'}</p>
                  <p className="text-xs text-gray-500">Hạn: {formatDate(debt.due_date)}</p>
                </div>
                <div className="text-right">
                  <p className={`font-bold text-sm ${debt.type === 'RECEIVABLE' ? 'text-green-600' : 'text-red-600'}`}>
                    {debt.amount.toLocaleString('vi-VN')} ₫
                  </p>
                  {getStatusBadge(debt.status)}
                </div>
              </div>
            </div>
          )) : (
            <p className="text-center text-gray-500 py-8">Không có công nợ cho đối tác này.</p>
          )}
        </div>
      </>
    );
  };

  const EditDebtModal = ({ isOpen, onClose, onSave, item }: { isOpen: boolean, onClose: () => void, onSave: (item: DebtType) => void, item: DebtType | null }) => {
    const [showConfirmClose, setShowConfirmClose] = useState(false);

    const handleRequestClose = () => setShowConfirmClose(true);

    React.useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen && !showConfirmClose) handleRequestClose(); };
      if (isOpen) window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose, showConfirmClose]);
    const [formData, setFormData] = useState<DebtType | null>(null);

    useEffect(() => {
      if (item) setFormData({ ...item });
    }, [item, isOpen]);

    if (!isOpen || !item || !formData) return null;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center border-b p-4">
            <h3 className="text-lg font-semibold text-gray-800">Chỉnh sửa công nợ</h3>
            <button onClick={handleRequestClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <p className="text-sm font-medium text-gray-500 mb-1">Đối tác: <span className="text-gray-900 font-bold">{formData.partner_name}</span></p>
              <p className="text-xs text-gray-400">Loại: {formData.type === 'RECEIVABLE' ? 'Phải thu' : 'Phải trả'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền (₫)</label>
              <input
                required
                type="number"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: Number(e.target.value) })}
                className="w-full px-3 py-2 border rounded-md focus:ring-[#0066cc] focus:border-[#0066cc]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hạn thanh toán</label>
              <input
                required
                type="date"
                value={formData.due_date ? new Date(formData.due_date).toISOString().split('T')[0] : ''}
                onChange={e => setFormData({ ...formData, due_date: e.target.value })}
                className="w-full px-3 py-2 border rounded-md focus:ring-[#0066cc] focus:border-[#0066cc]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Trạng thái</label>
              <select
                value={formData.status}
                onChange={e => setFormData({ ...formData, status: e.target.value as DebtStatus })}
                className="w-full px-3 py-2 border rounded-md focus:ring-[#0066cc] focus:border-[#0066cc]"
              >
                <option value={DebtStatus.UNPAID}>Chưa thanh toán</option>
                <option value={DebtStatus.PARTIALLY_PAID}>Thanh toán 1 phần</option>
                <option value={DebtStatus.PAID}>Đã thanh toán</option>
              </select>
            </div>
          </form>
          <div className="border-t p-4 flex justify-end gap-2 bg-gray-50">
            <button type="button" onClick={handleRequestClose} className="px-4 py-2 bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50">Hủy</button>
            <button type="submit" onClick={handleSubmit} className="px-4 py-2 bg-[#0066cc] text-white rounded-md hover:bg-[#0052a3]">Lưu</button>
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
          confirmText="Hủy bỏ"
        />
      </div>
    );
  };

  const { totalReceivable, totalPayable, totalCollected, totalPaid } = useMemo(() => {
    // Filter based on 'debts' (all time) or 'sortedDebts' (filtered)?
    // Usually summaries show "All time" status unless filtered. 
    // The previous hardcoded cards implied "All time" totals or "Current Outstanding".
    // Let's use 'debts' (unfiltered list from DB) to give global context, 
    // OR 'sortedDebts' if we want them to reflect the current filter view.
    // Given the UI usually shows "Total Outstanding" at the top regardless of search, let's use 'debts'.
    // However, if the user filters by time, maybe they want to see movement in that time?
    // Let's us 'debts' for now to represent the "Dashboard" state of debts.

    const receivable = debts
      .filter(d => d.type === 'RECEIVABLE' && d.status !== DebtStatus.PAID)
      .reduce((sum, d) => sum + d.amount, 0);

    const payable = debts
      .filter(d => d.type === 'PAYABLE' && d.status !== DebtStatus.PAID)
      .reduce((sum, d) => sum + d.amount, 0);

    return {
      totalReceivable: receivable,
      totalPayable: payable,
      totalCollected: transactionStats.income,
      totalPaid: transactionStats.expense
    };
  }, [debts, transactionStats]);

  const formatLargeCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `${(value / 1000000000).toFixed(1)} Tỷ`;
    } else if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)} Tr`;
    }
    return `${value.toLocaleString('vi-VN')} ₫`;
  };

  if (selectedPartnerName) {
    return (
      <>
        {renderPartnerDetailView()}
        <DetailModal item={modalItem} onClose={() => setModalItem(null)} onEditClick={handleEditClick} onDeleteClick={handleDeleteClick} />
        <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleConfirmDelete} title="Xác nhận Xóa Công Nợ" message={`Bạn có chắc chắn muốn xóa công nợ này không?`} confirmText="Xác nhận Xóa" />
        <EditDebtModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} onSave={handleSaveDebt} item={debtToEdit} />
      </>
    )
  }

  return (
    <>
      <FilterBar onSearch={setSearchTerm} onTimeFilterChange={handleTimeFilterChange} pageTitle="Công nợ" />

      {/* Desktop Summary Cards */}
      <div className="hidden md:flex space-x-4 mb-4">
        <SummaryCard title="Tổng phải thu" value={formatLargeCurrency(totalReceivable)} icon={<CongNoIcon />} colorClass="bg-yellow-100 text-yellow-600" linkTo="/cong-no?type=RECEIVABLE&status=OUTSTANDING" />
        <SummaryCard title="Tổng phải trả" value={formatLargeCurrency(totalPayable)} icon={<CongNoIcon />} colorClass="bg-red-100 text-red-600" linkTo="/cong-no?type=PAYABLE&status=OUTSTANDING" />
        <SummaryCard title="Đã thu" value={formatLargeCurrency(totalCollected)} icon={<CongNoIcon />} colorClass="bg-green-100 text-green-600" linkTo="/cong-no?type=RECEIVABLE&status=PAID" />
        <SummaryCard title="Đã trả" value={formatLargeCurrency(totalPaid)} icon={<CongNoIcon />} colorClass="bg-blue-100 text-blue-600" linkTo="/cong-no?type=PAYABLE&status=PAID" />
      </div>

      {/* Mobile Summary Cards */}
      <div className="md:hidden grid grid-cols-2 gap-4 mb-4">
        <Link to="/cong-no?type=RECEIVABLE&status=OUTSTANDING" className="block bg-white p-3 rounded-lg shadow-sm">
          <p className="text-xs font-medium text-gray-500">Tổng phải thu</p>
          <p className="text-base font-bold text-green-600 mt-1">{formatLargeCurrency(totalReceivable)}</p>
        </Link>
        <Link to="/cong-no?type=PAYABLE&status=OUTSTANDING" className="block bg-white p-3 rounded-lg shadow-sm">
          <p className="text-xs font-medium text-gray-500">Tổng phải trả</p>
          <p className="text-base font-bold text-red-600 mt-1">{formatLargeCurrency(totalPayable)}</p>
        </Link>
      </div>

      {/* Desktop Filters */}
      <div className="hidden md:block">
        <TableActions
          onSearch={setSearchTerm}
          searchPlaceholder="Tìm theo đối tác..."
          primaryActions={[{ label: 'Xuất file', icon: <ExportIcon />, onClick: handleExportExcel, variant: 'secondary' },]}
          filterActions={filterButtons}
          columns={allColumns}
          visibleColumns={visibleColumns}
          onVisibleColumnsChange={setVisibleColumns}
        />
      </div>

      {/* Mobile Actions/Filters */}
      <div className="md:hidden mb-4">
        <div className="flex items-stretch space-x-2">
          <div className="flex-grow flex items-stretch space-x-2">
            {filterConfig.map(f => (
              <button
                key={f.key}
                onClick={() => handleFilterToggle(f.key)}
                className={`flex-1 text-center px-2 py-2 text-sm font-medium rounded-md transition-colors ${activeFilters.includes(f.key)
                  ? 'bg-[#0066cc] text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                  }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <button className="flex-shrink-0 p-2 text-white bg-green-600 border-transparent rounded-md shadow-sm hover:bg-green-700 flex items-center justify-center">
            <ExportIcon className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden md:block bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 table-fixed">
            <thead className="text-xs text-gray-700 bg-gray-50">
              <tr>
                {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => (
                  <th key={col.key} scope="col" style={{ width: col.w }} className={`px-2 sm:px-3 py-3 cursor-pointer truncate ${col.key === 'amount' ? 'text-right' : 'text-left'}`} title={col.label} onClick={() => requestSort(col.key)}>
                    <div className={`flex items-center min-w-0 ${col.key === 'amount' ? 'justify-end' : ''}`}>
                      <span className="truncate">{col.label}</span>
                      <span className="ml-1 shrink-0">
                        {sortConfig?.key === col.key ? (
                          sortConfig.direction === 'ascending' ? <ArrowUpIcon className="h-4 w-4" /> : <ChevronDownIcon className="h-4 w-4 ml-0" />
                        ) : (
                          <ArrowsUpDownIcon className="h-4 w-4 text-gray-300" />
                        )}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedDebts.map((debt) => {
                const colCount = allColumns.filter(c => visibleColumns.includes(c.key)).length;
                return (
                  <React.Fragment key={debt.id}>
                    <tr className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={(e) => handlePartnerExpandToggle(debt, e)}>
                      {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => (
                        <td key={col.key} className={`px-2 sm:px-3 py-4 truncate ${col.key === 'amount' ? 'text-right' : 'text-left'}`}>
                          {renderCell(debt, col.key)}
                        </td>
                      ))}
                    </tr>
                    {expandedDebtId === debt.id && (
                      <tr className="bg-blue-50/20">
                        <td colSpan={colCount} className="px-4 py-4 border-b" onClick={e => e.stopPropagation()}>
                          <div className="bg-white rounded-lg border border-blue-200 overflow-hidden shadow-sm">
                            <div className="flex items-center justify-between px-4 py-3 bg-blue-50 border-b border-blue-200">
                              <h4 className="text-sm font-bold text-blue-800 flex items-center gap-2">
                                <CongNoIcon className="w-4 h-4" />
                                Sổ chi tiết công nợ: <span className="text-blue-600">{debt.partner_name}</span>
                              </h4>
                              <button
                                onClick={() => { setExpandedDebtId(null); setStatementData([]); }}
                                className="text-blue-400 hover:text-blue-600 text-lg leading-none font-bold"
                              >&times;</button>
                            </div>
                            
                            {/* Date filters and Actions inside expanded row */}
                            <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-gray-100 bg-gray-50/50">
                              {/* Date Filters */}
                              <div className="flex flex-wrap items-center gap-3 text-xs">
                                <span className="text-gray-500 font-medium shrink-0">Khoảng thời gian:</span>
                                <div className="flex flex-wrap items-center gap-1.5">
                                  {['All time', 'Hôm nay', 'Hôm qua', 'Tuần này', 'Tháng này', 'Tháng trước', 'Năm nay', 'Tùy chọn'].map((opt) => (
                                    <button
                                      key={opt}
                                      onClick={() => handleExpandedTimeFilterChange(debt.partner_id, opt)}
                                      className={`px-2.5 py-1 rounded-md transition-all font-medium border ${
                                        expandedTimeFilter === opt
                                          ? 'bg-[#0066cc] text-white border-[#0066cc] shadow-sm'
                                          : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                      }`}
                                    >
                                      {opt === 'All time' ? 'Tất cả' : opt}
                                    </button>
                                  ))}
                                </div>
                                {expandedTimeFilter === 'Tùy chọn' && (
                                  <div className="flex items-center gap-2 shrink-0 ml-auto sm:ml-0">
                                    <input
                                      type="date"
                                      value={expandedFromDate}
                                      onChange={(e) => handleExpandedCustomDateChange(debt.partner_id, e.target.value, expandedToDate)}
                                      className="px-2 py-1 border border-gray-200 rounded-md outline-none focus:border-blue-500 text-xs"
                                    />
                                    <span className="text-gray-400">đến</span>
                                    <input
                                      type="date"
                                      value={expandedToDate}
                                      onChange={(e) => handleExpandedCustomDateChange(debt.partner_id, expandedFromDate, e.target.value)}
                                      className="px-2 py-1 border border-gray-200 rounded-md outline-none focus:border-blue-500 text-xs"
                                    />
                                  </div>
                                )}
                              </div>

                              {/* Actions Bar */}
                              <div className="flex items-center gap-2 shrink-0 text-xs ml-auto sm:ml-0">
                                <button
                                  onClick={() => handlePrintDebt(debt)}
                                  className="flex items-center gap-1 px-3 py-1.5 font-medium bg-[#0066cc] text-white rounded-md hover:bg-[#0052a3] shadow-sm transition-all"
                                >
                                  In phiếu
                                </button>
                                <button
                                  onClick={() => handleExportStatement(debt.partner_name)}
                                  className="flex items-center gap-1 px-3 py-1.5 font-medium bg-green-50 text-green-700 border border-green-200 rounded-md hover:bg-green-100 transition-all"
                                >
                                  <ExportIcon className="w-3.5 h-3.5" /> Xuất file
                                </button>
                                <button
                                  onClick={() => handleOpenVoucherModal('return-voucher', { partner_id: debt.partner_id, partner_name: debt.partner_name })}
                                  className="flex items-center gap-1 px-3 py-1.5 font-medium bg-orange-50 text-orange-700 border border-orange-200 rounded-md hover:bg-orange-100 transition-all"
                                >
                                  Trả hàng
                                </button>
                                <button
                                  onClick={() => handleEditClick(debt)}
                                  className="flex items-center gap-1 px-3 py-1.5 font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 transition-all"
                                >
                                  <EditIcon className="w-3.5 h-3.5" /> Sửa
                                </button>
                                <button
                                  onClick={() => handleDeleteClick(debt)}
                                  className="flex items-center gap-1 px-3 py-1.5 font-medium bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100 transition-all"
                                >
                                  <DeleteIcon className="w-3.5 h-3.5" /> Xóa
                                </button>
                              </div>
                            </div>

                            {loadingStatement ? (
                              <div className="flex items-center justify-center gap-2 py-8 text-gray-500">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                                <span className="text-sm">Đang tải sổ chi tiết...</span>
                              </div>
                            ) : statementData.length === 0 ? (
                              <p className="text-center text-sm text-gray-400 py-6 italic">Không có giao dịch nào trong khoảng thời gian đã chọn.</p>
                            ) : (
                              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                                <table className="w-full text-xs text-left">
                                  <thead className="bg-gray-50 text-gray-600 sticky top-0 border-b">
                                    <tr>
                                      <th className="px-4 py-2 font-semibold">Ngày</th>
                                      <th className="px-4 py-2 font-semibold">Chứng từ</th>
                                      <th className="px-4 py-2 font-semibold">Diễn giải</th>
                                      <th className="px-4 py-2 text-right font-semibold">Tăng (nợ)</th>
                                      <th className="px-4 py-2 text-right font-semibold">Giảm (có)</th>
                                      <th className="px-4 py-2 text-right font-semibold">Số dư</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-gray-100">
                                    {statementData.map((row: any) => (
                                      <tr key={row.id} className="hover:bg-gray-50">
                                        <td className="px-4 py-2 whitespace-nowrap text-gray-600">{formatDate(row.date)}</td>
                                        <td 
                                          className="px-4 py-2 font-semibold text-blue-600 cursor-pointer hover:underline hover:text-blue-800"
                                          onClick={(e) => handleActivityClick(row, e)}
                                          title="Xem chi tiết chứng từ"
                                        >
                                          {row.code}
                                        </td>
                                        <td className="px-4 py-2 max-w-xs truncate text-gray-700" title={row.description}>{row.description}</td>
                                        <td className="px-4 py-2 text-right text-gray-900 tabular-nums">
                                          {row.increase > 0 ? row.increase.toLocaleString('vi-VN') + ' ₫' : '-'}
                                        </td>
                                        <td className="px-4 py-2 text-right text-green-600 tabular-nums">
                                          {row.decrease > 0 ? row.decrease.toLocaleString('vi-VN') + ' ₫' : '-'}
                                        </td>
                                        <td className={`px-4 py-2 text-right font-bold tabular-nums ${row.balance >= 0 ? 'text-gray-800' : 'text-red-600'}`}>
                                          {row.balance.toLocaleString('vi-VN')} ₫
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
        <div className="p-4"> <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={itemsPerPage} onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }} totalItems={sortedDebts.length} /> </div>
      </div>

      {/* Mobile Partner List */}
      <div className="md:hidden space-y-3">
        {partnerGroupedDebts.map(partner => (
          <div key={partner.name} onClick={() => setSelectedPartnerName(partner.name)} className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors flex justify-between items-center">
            <p className="font-semibold text-gray-800">{partner.name}</p>
            <p className={`text-sm font-bold ${partner.totalAmount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {partner.totalAmount.toLocaleString('vi-VN')} ₫
            </p>
          </div>
        ))}
      </div>

      <DetailModal item={modalItem} onClose={() => setModalItem(null)} onEditClick={handleEditClick} onDeleteClick={handleDeleteClick} />
      <ConfirmationModal isOpen={!!itemToDelete} onClose={() => setItemToDelete(null)} onConfirm={handleConfirmDelete} title="Xác nhận Xóa Công Nợ" message={`Bạn có chắc chắn muốn xóa công nợ của "${itemToDelete?.partner_name}" không? Hành động này không thể hoàn tác.`} confirmText="Xác nhận Xóa" />
      <EditDebtModal isOpen={isEditModalOpen} onClose={handleCloseEditModal} onSave={handleSaveDebt} item={debtToEdit} />

      <SalesOrderDetailModal
        item={salesModalItem}
        onClose={() => setSalesModalItem(null)}
        onEditClick={(item) => {
          setSalesModalItem(null);
          handleOpenVoucherModal('customer_name' in item ? 'delivery-note' : 'purchase-order', item);
        }}
        onDeleteClick={handleDeleteOrder}
        onReturnClick={(order) => {
          setSalesModalItem(null);
          handleOpenVoucherModal('return-voucher', order);
        }}
      />

      <IncomeExpenseDetailModal
        item={txnModalItem}
        onClose={() => setTxnModalItem(null)}
        onEditClick={handleEditTransaction}
        onDeleteClick={handleDeleteTransaction}
      />

      <ReturnVoucherDetailModal
        item={returnVoucherModalItem}
        onClose={() => setReturnVoucherModalItem(null)}
        onEditClick={(item) => {
          setReturnVoucherModalItem(null);
          handleOpenVoucherModal('return-voucher', item);
        }}
        onDeleteClick={handleDeleteReturnVoucher}
      />

      <ConfirmationModal
        isOpen={!!itemToDeleteFromStatement}
        onClose={() => setItemToDeleteFromStatement(null)}
        onConfirm={handleConfirmDeleteFromStatement}
        title="Xác nhận Xóa Chứng Từ"
        message={`Bạn có chắc chắn muốn xóa chứng từ này không? Hành động này không thể hoàn tác.`}
        confirmText="Xác nhận Xóa"
      />

      <ConfirmationModal
        isOpen={!!dataToImport && dataToImport.length > 0}
        onClose={() => setDataToImport(null)}
        onConfirm={handleConfirmImport}
        title="Xác nhận Import"
        message={`Chắc chắn muốn import ${dataToImport?.length || 0} dòng công nợ?`}
        confirmText="Import"
      />
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls" />

      <EditTransactionModal
        isOpen={isEditTransactionModalOpen}
        onClose={() => { setIsEditTransactionModalOpen(false); setTransactionToEdit(null); }}
        onSave={handleSaveTransaction}
        transaction={transactionToEdit}
      />

      <VoucherModal
        isOpen={voucherModal.isOpen}
        voucherType={voucherModal.type}
        initialData={voucherModal.initialData}
        onClose={handleCloseVoucherModal}
      />

      {isPrintingDebt && printDebtItem && createPortal(
        <div id="print-section" className="hidden print:block bg-white p-0 m-0 z-[100]">
          <PrintVoucherTemplate voucherType="debt-notice" data={getPrintData(printDebtItem)} />
        </div>,
        document.body
      )}
    </>
  );
};

export default Debt;