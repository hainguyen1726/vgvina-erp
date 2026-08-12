export enum Page {
  Dashboard = 'Dashboard',
  ThuChi = 'Thu Chi',
  XuatNhap = 'Xuất/Nhập',
  CongNo = 'Công nợ',
  CanhBaoNo = 'Cảnh báo nợ',
  DoiTac = 'Đối tác',
  BaoCao = 'Báo cáo',
  QuanTri = 'Quản trị',
  TaoPhieu = 'Tạo phiếu',
  TonKho = 'Tồn Kho',
  NhapHang = 'Nhập Hàng',
  TraHang = 'Trả Hàng',
  HuyHang = 'Hủy Hàng',
}

export enum PartnerType {
  CUSTOMER = 'CUSTOMER',
  SUPPLIER = 'SUPPLIER',
}

export enum OrderStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED',
  DELIVERED = 'DELIVERED',
}

export enum DebtStatus {
  UNPAID = 'UNPAID',
  PARTIALLY_PAID = 'PARTIALLY_PAID',
  PAID = 'PAID',
}

export enum EmployeeStatus {
  CHO_PHE_DUYET = 'Pending',
  DANG_LAM_VIEC = 'Active',
  DA_NGHI_VIEC = 'Inactive',
}

export enum TransactionType {
  INCOME = 'INCOME',
  EXPENSE = 'EXPENSE',
  INTERNAL_TRANSFER = 'INTERNAL_TRANSFER',
}

export enum ReturnReason {
  DAMAGED = 'Hàng hỏng',
  WRONG_ITEM = 'Sai quy cách',
  CUSTOMER_REASON = 'Lý do khách hàng',
  OTHER = 'Khác',
}

export enum ReturnHandlingMethod {
  DEBT_DEDUCTION = 'Trừ công nợ',
  CASH_REFUND = 'Hoàn tiền mặt',
  BANK_REFUND = 'Hoàn chuyển khoản',
}

export enum ScrappingReason {
  EXPIRED = 'Hết hạn sử dụng',
  DAMAGED = 'Hư hỏng',
  LOST = 'Mất mát',
  OTHER = 'Lý do khác',
}

export interface Partner {
  id: string;
  name: string;
  type: PartnerType;
  tax_code?: string;
  address: string;
  phone: string;
  email: string;
  assigned_user_ids: string[]; // Keep for compatibility
  assigned_user_id?: string;   // Single assigned staff (BIGINT ID as string)
  facility_ids: string[]; // Updated for multiple facilities (UUIDs)
  balance?: number;
  totalBalance?: number;
  payment_term?: string;
  payment_due_days?: number;
}

export interface PartnerTransfer {
  id: string;
  partner_id: string;
  from_user_id?: string;
  from_user_name?: string;
  to_user_id: string;
  to_user_name: string;
  reason: string;
  created_by_name: string;
  created_at: string;
}

export interface OrderItem {
  id: string;
  product: Product;
  quantity: number;
  price: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  code: string;
  supplier_name: string;
  facility_name: string;
  status: OrderStatus;
  order_date: string;
  total_amount: number;
  amount_paid: number;
  assigned_user_ids: string[];
  assigned_user_names?: string[];
  items: OrderItem[];
  notes?: string;
}

export interface SalesOrder {
  id: string;
  code: string;
  customer_name: string;
  facility_name: string;
  status: OrderStatus;
  order_date: string;
  total_amount: number;
  amount_paid: number;
  assigned_user_ids: string[];
  assigned_user_names?: string[];
  items: OrderItem[];
  notes?: string;
}

export interface FinancialTransaction {
  id: string;
  code: string;
  type: TransactionType;
  transaction_date: string;
  amount: number;
  category: string;
  categoryId?: string;
  description: string;
  partner_name?: string;
  partnerId?: string;
  employee_ids: string[];
  employee_names: string[];
  accountId?: string;
  account_name?: string;
  facility_name: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  unit: string;
  category: string;
  category_id?: string;
  quantity: number;
  warehouse: string;
  facility_id?: string;
  price: number;
}

export interface Debt {
  id: string;
  code?: string;
  partner_id: string;
  partner_name: string;
  amount: number;
  due_date: string;
  status: DebtStatus;
  assigned_user_ids: string[];
  assigned_user_names?: string[];
  type: 'RECEIVABLE' | 'PAYABLE';
  facility_name: string;
}

export interface User {
  id: string;
  full_name: string;
  phone: string;
  facility_name: string;
  status: EmployeeStatus;
  role: string;
  email?: string;
  username?: string;
  role_id?: string;
  facility_id?: string;
  is_admin?: boolean;
}

export interface ReturnVoucher {
  id: string;
  code: string;
  related_order_code: string;
  return_date: string;
  customer_name: string;
  original_order_id: string;
  reason: ReturnReason;
  assigned_user_ids: string[];
  assigned_user_names?: string[];
  handler_user: string;
  items: OrderItem[];
  total_amount: number;
  handling_method: ReturnHandlingMethod;
  facility_name: string;
  return_fee?: number;
  discount?: number;
  notes?: string;
  refund_account_id?: string;
}

export interface ScrappingVoucherItem {
  id: string;
  product: Product;
  quantity: number;
  value: number;
  notes?: string;
}

export interface ScrappingVoucher {
  id: string;
  code: string;
  scrapping_date: string;
  assigned_user_ids: string[];
  assigned_user_names?: string[];
  creator_user: string;
  reason: ScrappingReason;
  items: ScrappingVoucherItem[];
  total_value: number;
  facility_name: string;
}

export interface ProductEditHistory {
  id: string;
  productId: string;
  editorName: string;
  editTimestamp: string;
  changes: {
    field: keyof Product;
    oldValue: any;
    newValue: any;
  }[];
}

export interface AuditLog {
  id: string;
  tableName: string; // table_name in DB
  recordId: string; // record_id in DB
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  oldValues?: Record<string, any> | null; // old_values in DB
  newValues?: Record<string, any> | null; // new_values in DB
  userId?: number; // user_id in DB
  userName?: string; // Joined from vgvina_users
  timestamp: string; // created_at in DB (ISO 8601)
}

export interface InternalTransferItem {
  id: string;
  product: Product;
  quantity: number;
  notes?: string;
}

export interface InternalTransferVoucher {
  id: string;
  code: string;
  transfer_date: string;
  from_warehouse: string;
  to_warehouse: string;
  from_facility_id: string;
  to_facility_id: string;
  assigned_user_ids: string[];
  assigned_user_names?: string[];
  creator_user: string;
  items: InternalTransferItem[];
  notes?: string;
  facility_name: string;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
}

export interface AdminAccount {
  id: string;
  name: string;
  type: 'Tiền mặt' | 'Ngân hàng' | 'Thẻ tín dụng';
  balance: number;
  initial_balance?: number;
  notes?: string;
  account_number?: string;
  bank_name?: string;
  account_holder?: string;
}

export interface OverdueOrderInfo {
  orderId: string;
  code: string;
  orderDate: string;
  dueDate: string;
  totalAmount: number;
  amountPaid: number;
  remainingAmount: number;
  daysOverdue: number;
  status: OrderStatus;
  facilityName: string;
  items: OrderItem[];
  notes?: string;
}

export interface DebtWarningItem {
  partnerId: string;
  partnerName: string;
  phone: string;
  address: string;
  taxCode?: string;
  paymentDueDays: number;
  overdueOrdersCount: number;
  totalOverdueAmount: number;
  maxDaysOverdue: number;
  warningLevel: 'DANGER' | 'WARNING' | 'UPCOMING'; // DANGER (>7d overdue), WARNING (1-7d overdue), UPCOMING (1-2d until due)
  orders: OverdueOrderInfo[];
  facilityName?: string;
}