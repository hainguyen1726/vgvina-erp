import React from 'react';
import { Partner, User, TransactionType, OrderItem, SalesOrder, PurchaseOrder, PartnerType } from '../../types';
import { numberToWords } from '../../src/utils/numberToWords';
import { getCompanyInfo } from '../../src/utils/companyInfo';

interface VoucherData {
    code?: string;
    date: string;
    partner?: { name: string; address?: string; phone?: string; taxCode?: string };
    assignedUser?: string;
    account?: string; // Payment account name
    items?: any[];
    summary?: {
        total: number;
        discount: number;
        paid: number;
        remaining: number;
    };
    notes?: string;
    // For specific types
    reason?: string;
    warehouse?: string; // For internal transfer
    toWarehouse?: string; // For internal transfer
    type?: TransactionType; // For income/expense
    amount?: number; // For income/expense
}

interface PrintVoucherTemplateProps {
    voucherType: string;
    data: VoucherData | any;
}

const PrintVoucherTemplate: React.FC<PrintVoucherTemplateProps> = ({ voucherType, data }) => {
    const company = getCompanyInfo();

    const getVoucherTypeLabel = (type: string) => {
        switch (type) {
            case 'income-expense-voucher':
                return data.type === TransactionType.INCOME ? 'PHIẾU THU' : 'PHIẾU CHI';
            case 'purchase-order': return 'PHIẾU NHẬP KHO';
            case 'delivery-note': return 'PHIẾU GIAO HÀNG';
            case 'debt-notice': return 'THÔNG BÁO CÔNG NỢ';
            case 'return-voucher': return 'PHIẾU TRẢ HÀNG';
            case 'internal-transfer': return 'PHIẾU CHUYỂN KHO';
            case 'scrapping-voucher': return 'PHIẾU HỦY HÀNG';
            default: return 'PHIẾU';
        }
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return `Ngày ${date.getDate()} tháng ${date.getMonth() + 1} năm ${date.getFullYear()}`;
    };

    const formatCurrency = (amount: number) => {
        return (amount || 0).toLocaleString('vi-VN') + ' ₫';
    };



    const PrintFooter = () => (
        <div className="print-footer hidden print:flex">
            <span>{company.footerText}</span>
        </div>
    );

    // Special render for Debt Notice (Full statement table from VoucherModal)
    if (voucherType === 'debt-notice' && data.partner && data.rows) {
        return (
            <div className="print-container leading-relaxed text-sm text-black" style={{ fontFamily: '"Times New Roman", Times, serif' }}>

                {/* Header */}
                <div className="flex justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-base uppercase">{company.name}</h3>
                        {company.taxCode && <p>MST/Mã số HKD: {company.taxCode}</p>}
                        <p>Địa chỉ: {company.address}</p>
                        <p>Điện thoại: {company.phone}</p>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold uppercase mb-1">
                        {data.partnerType === 'CUSTOMER' ? 'THÔNG BÁO CÔNG NỢ' : 'XÁC NHẬN CÔNG NỢ'}
                    </h1>
                    <p className="italic">{formatDate(new Date().toISOString())}</p>
                    {data.dateRange && (
                        <p>Kỳ báo cáo: Từ {new Date(data.dateRange.from).toLocaleDateString('vi-VN')} đến {new Date(data.dateRange.to).toLocaleDateString('vi-VN')}</p>
                    )}
                </div>

                <div className="grid grid-cols-2 mb-6 text-sm">
                    <div>
                        <p><span className="font-bold">{data.partnerType === 'CUSTOMER' ? 'Kính gửi:' : 'Đơn vị:'}</span> {data.partner.name}</p>
                        {data.partner.address && <p>Địa chỉ: {data.partner.address}</p>}
                        {data.partner.phone && <p>Điện thoại: {data.partner.phone}</p>}
                    </div>
                    <div className="text-right flex flex-col items-end gap-1 font-bold">
                        <div className="flex gap-4 w-64"><span className="text-left w-32">Nợ đầu kỳ:</span> <span className="flex-1 text-right">{formatCurrency(data.summary.openingRemaining)}</span></div>
                        <div className="flex gap-4 w-64">
                            <span className="text-left w-32">Phát sinh:</span> 
                            <span className="flex-1 text-right text-red-600">+{formatCurrency(data.summary.totalIn)}</span>
                            <span className="flex-1 text-right text-green-600">-{formatCurrency(data.summary.totalOut)}</span>
                        </div>
                        <div className="flex gap-4 w-64"><span className="text-left w-32">Nợ cuối kỳ:</span> <span className="flex-1 text-right text-lg text-blue-600">{formatCurrency(data.summary.closingRemaining)}</span></div>
                    </div>
                </div>

                <table className="w-full border-collapse border border-black mb-6 text-xs">
                    <thead>
                        <tr className="bg-gray-100 font-bold">
                            <th className="border border-black p-1 text-center">Thời gian</th>
                            <th className="border border-black p-1 text-center">Mã</th>
                            <th className="border border-black p-1 text-center">Diễn giải</th>
                            <th className="border border-black p-1 text-center">ĐVT</th>
                            <th className="border border-black p-1 text-center">Số lượng</th>
                            <th className="border border-black p-1 text-center">Giá bán/trả</th>
                            <th className="border border-black p-1 text-center">Thành tiền</th>
                            <th className="border border-black p-1 text-center">Ghi nợ</th>
                            <th className="border border-black p-1 text-center">Ghi có</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.rows.map((r: any, idx: number) => (
                            <tr key={idx} className={r.isHeader ? 'font-bold bg-gray-50' : 'text-gray-700'}>
                                <td className="border border-black p-1 text-center">{r.date}</td>
                                <td className="border border-black p-1">{r.code}</td>
                                <td className="border border-black p-1" style={{ paddingLeft: r.isHeader ? '4px' : '16px' }}>{r.description}</td>
                                <td className="border border-black p-1 text-center">{r.unit}</td>
                                <td className="border border-black p-1 text-right">{r.quantity}</td>
                                <td className="border border-black p-1 text-right">
                                    {typeof r.price === 'number' ? r.price.toLocaleString('vi-VN') : r.price}
                                </td>
                                <td className="border border-black p-1 text-right">
                                    {typeof r.amount === 'number' ? r.amount.toLocaleString('vi-VN') : r.amount}
                                </td>
                                <td className="border border-black p-1 text-right text-red-600">
                                    {typeof r.debit === 'number' ? r.debit.toLocaleString('vi-VN') : r.debit}
                                </td>
                                <td className="border border-black p-1 text-right text-green-600">
                                    {typeof r.credit === 'number' ? r.credit.toLocaleString('vi-VN') : r.credit}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {data.partnerType === 'CUSTOMER' && (
                    <div className="mb-8 pl-4 border-l-4 border-gray-300 text-xs italic">
                        <p className="font-bold mb-1">Quý khách vui lòng thanh toán bằng TM hoặc CK theo thông tin tài khoản dưới đây:</p>
                        <p>- Ngân hàng: <span className="font-bold">{data.bankInfo?.bankName || company.bankInfo?.bankName || '...'}{(data.bankInfo?.branch || company.bankInfo?.branch) ? ` - ${data.bankInfo?.branch || company.bankInfo?.branch}` : ''}</span></p>
                        <p>- Số tài khoản: <span className="font-bold">{data.bankInfo?.accountNumber || company.bankInfo?.accountNumber || '...'}</span></p>
                        <p>- Chủ tài khoản: <span className="font-bold">{data.bankInfo?.accountHolder || company.bankInfo?.accountHolder || '...'}</span></p>
                        {(data.bankInfo?.swiftCode || company.bankInfo?.swiftCode) && (
                            <p>- SWIFT Code: <span className="font-bold">{data.bankInfo?.swiftCode || company.bankInfo?.swiftCode}</span></p>
                        )}
                    </div>
                )}

                <div className="flex justify-between text-center mt-12 break-inside-avoid">
                    <div className="w-1/3">
                        <p className="font-bold">Người lập biểu</p>
                        <p className="italic text-xs">(Ký, họ tên)</p>
                        <br /><br /><br /><br />
                        <p></p>
                    </div>
                    <div className="w-1/3">
                        <p className="font-bold">Kế toán trưởng</p>
                        <p className="italic text-xs">(Ký, họ tên)</p>
                    </div>
                    <div className="w-1/3">
                        <p className="font-bold">{data.partnerType === 'CUSTOMER' ? 'Xác nhận của Khách hàng' : 'Xác nhận của Nhà cung cấp'}</p>
                        <p className="italic text-xs">(Ký, đóng dấu, họ tên)</p>
                    </div>
                </div>
                <PrintFooter />
            </div>
        );
    }

    // Special render for Debt Notice (Legacy single row from Debt.tsx)
    if (voucherType === 'debt-notice' && data.partner && data.transactions) {
        return (
            <div className="print-container leading-relaxed text-sm text-black" style={{ fontFamily: '"Times New Roman", Times, serif' }}>

                {/* Header */}
                <div className="flex justify-between mb-6">
                    <div>
                        <h3 className="font-bold text-base uppercase">{company.name}</h3>
                        {company.taxCode && <p>MST/Mã số HKD: {company.taxCode}</p>}
                        <p>Địa chỉ: {company.address}</p>
                        <p>Điện thoại: {company.phone}</p>
                    </div>
                </div>

                <div className="text-center mb-6">
                    <h1 className="text-2xl font-bold uppercase mb-1">
                        {data.debtType === 'RECEIVABLE' ? 'THÔNG BÁO CÔNG NỢ' : 'XÁC NHẬN CÔNG NỢ'}
                    </h1>
                    <p className="italic">{formatDate(new Date().toISOString())}</p>
                    {data.dateRange && (
                        <p>Kỳ báo cáo: Từ {new Date(data.dateRange.from).toLocaleDateString('vi-VN')} đến {new Date(data.dateRange.to).toLocaleDateString('vi-VN')}</p>
                    )}
                </div>

                <div className="mb-6">
                    <p><span className="font-bold">{data.debtType === 'RECEIVABLE' ? 'Kính gửi:' : 'Đơn vị:'}</span> {data.partner.name}</p>
                    {data.partner.address && <p>Địa chỉ: {data.partner.address}</p>}
                    {data.partner.phone && <p>Điện thoại: {data.partner.phone}</p>}
                </div>

                <table className="w-full border-collapse border border-black mb-6 text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-2 text-center w-12">STT</th>
                            <th className="border border-black p-2 text-center">Ngày</th>
                            <th className="border border-black p-2 text-center">Mã phiếu</th>
                            <th className="border border-black p-2 text-center">Diễn giải</th>
                            <th className="border border-black p-2 text-right">Số tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.transactions.map((t: any, index: number) => (
                            <tr key={index}>
                                <td className="border border-black p-2 text-center">{index + 1}</td>
                                <td className="border border-black p-2 text-center">{new Date(t.order_date).toLocaleDateString('vi-VN')}</td>
                                <td className="border border-black p-2">{t.code}</td>
                                <td className="border border-black p-2">
                                    {t.items?.map((i: any) => i.product ? i.product.name : (i.product_name || 'Sản phẩm không xác định')).join(', ')}
                                </td>
                                <td className="border border-black p-2 text-right">{formatCurrency(t.total_amount)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        <tr className="font-bold">
                            <td colSpan={4} className="border border-black p-2 text-right">Tổng phát sinh:</td>
                            <td className="border border-black p-2 text-right">{formatCurrency(data.summary.total)}</td>
                        </tr>
                        <tr className="font-bold">
                            <td colSpan={4} className="border border-black p-2 text-right">Đã thanh toán:</td>
                            <td className="border border-black p-2 text-right">{formatCurrency(data.summary.paid)}</td>
                        </tr>
                        <tr className="font-bold text-lg">
                            <td colSpan={4} className="border border-black p-2 text-right">
                                {data.debtType === 'RECEIVABLE' ? 'CÒN LẠI PHẢI THU:' : 'CÒN LẠI PHẢI TRẢ:'}
                            </td>
                            <td className="border border-black p-2 text-right">{formatCurrency(data.summary.remaining)}</td>
                        </tr>
                    </tfoot>
                </table>

                <div className="mb-8">
                    <p className="font-bold underline mb-2">Thông tin thanh toán:</p>
                    <p>
                        {data.debtType === 'RECEIVABLE'
                            ? 'Quý khách vui lòng thanh toán số tiền còn lại vào tài khoản sau:'
                            : 'Thông tin tài khoản nhận thanh toán của Quý đối tác:'}
                    </p>
                    <p>- Ngân hàng: {data.bankInfo?.bankName || company.bankInfo?.bankName || '...'}{(data.bankInfo?.branch || company.bankInfo?.branch) ? ` - ${data.bankInfo?.branch || company.bankInfo?.branch}` : ''}</p>
                    <p>- Số tài khoản: {data.bankInfo?.accountNumber || company.bankInfo?.accountNumber || '...'}</p>
                    <p>- Chủ tài khoản: {data.bankInfo?.accountHolder || company.bankInfo?.accountHolder || '...'}</p>
                    {(data.bankInfo?.swiftCode || company.bankInfo?.swiftCode) && (
                        <p>- SWIFT Code: {data.bankInfo?.swiftCode || company.bankInfo?.swiftCode}</p>
                    )}
                    <p>- Nội dung: Thanh toan cong no {data.partner.name}</p>
                </div>

                <div className="flex justify-between text-center mt-12 break-inside-avoid">
                    <div className="w-1/3">
                        <p className="font-bold">Người lập biểu</p>
                        <p className="italic text-xs">(Ký, họ tên)</p>
                        <br /><br /><br /><br />
                        <p></p>
                    </div>
                    <div className="w-1/3">
                        <p className="font-bold">Kế toán trưởng</p>
                        <p className="italic text-xs">(Ký, họ tên)</p>
                    </div>
                    <div className="w-1/3">
                        <p className="font-bold">{data.debtType === 'RECEIVABLE' ? 'Xác nhận của Khách hàng' : 'Xác nhận của Nhà cung cấp'}</p>
                        <p className="italic text-xs">(Ký, đóng dấu, họ tên)</p>
                    </div>
                </div>
                <PrintFooter />
            </div>
        );
    }

    // Default Template for other vouchers
    return (
        <div className="print-container leading-relaxed text-sm text-black" style={{ fontFamily: '"Times New Roman", Times, serif' }}>


            {/* Header */}
            <div className="flex justify-between mb-6">
                <div>
                    <h3 className="font-bold text-base uppercase">{company.name}</h3>
                    {company.taxCode && <p>MST/Mã số HKD: {company.taxCode}</p>}
                    <p>Địa chỉ: {company.address}</p>
                    <p>Điện thoại: {company.phone}</p>
                </div>
                <div className="text-right">
                    <p className="font-bold">Mẫu số: ...</p>
                    <p className="italic">Ký hiệu: ...</p>
                </div>
            </div>

            <div className="text-center mb-6">
                <h1 className="text-2xl font-bold uppercase mb-1">{getVoucherTypeLabel(voucherType)}</h1>
                <p className="italic">{formatDate(data.date)}</p>
                {data.code && <p className="font-bold mt-1">Số: {data.code}</p>}
            </div>

            {/* General Info */}
            <div className="mb-6 space-y-1">
                {data.partner && (
                    <div className="flex">
                        <span className="w-32 font-bold">{voucherType === 'purchase-order' ? 'Nhà cung cấp:' : 'Khách hàng:'}</span>
                        <span>{data.partner.name}</span>
                    </div>
                )}
                {data.partner?.address && (
                    <div className="flex">
                        <span className="w-32 font-bold">Địa chỉ:</span>
                        <span>{data.partner.address}</span>
                    </div>
                )}
                {data.partner?.phone && (
                    <div className="flex">
                        <span className="w-32 font-bold">Điện thoại:</span>
                        <span>{data.partner.phone}</span>
                    </div>
                )}

                {data.reason && (
                    <div className="flex">
                        <span className="w-32 font-bold">Lý do:</span>
                        <span>{data.reason}</span>
                    </div>
                )}

                {data.warehouse && (
                    <div className="flex">
                        <span className="w-32 font-bold">Kho xuất:</span>
                        <span>{data.warehouse}</span>
                    </div>
                )}
                {data.toWarehouse && (
                    <div className="flex">
                        <span className="w-32 font-bold">Kho nhập:</span>
                        <span>{data.toWarehouse}</span>
                    </div>
                )}

                {data.notes && (
                    <div className="flex">
                        <span className="w-32 font-bold">Ghi chú:</span>
                        <span>{data.notes}</span>
                    </div>
                )}

                {data.facility && (
                    <div className="flex">
                        <span className="w-32 font-bold">Chi nhánh:</span>
                        <span>{data.facility}</span>
                    </div>
                )}
            </div>

            {/* Items Table (if items exist) */}
            {data.items && data.items.length > 0 && (
                <table className="w-full border-collapse border border-black mb-6 text-sm">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="border border-black p-2 text-center w-12">STT</th>
                            <th className="border border-black p-2 text-center">
                                {voucherType === 'internal-transfer' ? 'Hàng hóa' : 'Tên nhãn hiệu, quy cách, phẩm chất vật tư, dụng cụ, sản phẩm, hàng hoá'}
                            </th>
                            <th className="border border-black p-2 text-center w-16">Mã số</th>
                            <th className="border border-black p-2 text-center w-16">ĐVT</th>
                            <th className="border border-black p-2 text-center w-20">Số lượng</th>
                            <th className="border border-black p-2 text-center w-24">Đơn giá</th>
                            <th className="border border-black p-2 text-center w-28">Thành tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.items.map((item: any, index: number) => (
                            <tr key={index}>
                                <td className="border border-black p-2 text-center">{index + 1}</td>
                                <td className="border border-black p-2">{item.name}</td>
                                <td className="border border-black p-2 text-center">{item.sku}</td>
                                <td className="border border-black p-2 text-center">{item.unit}</td>
                                <td className="border border-black p-2 text-center">{item.quantity}</td>
                                <td className="border border-black p-2 text-right">{formatCurrency(item.price)}</td>
                                <td className="border border-black p-2 text-right">{formatCurrency(item.total)}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot>
                        {/* Optional Discount/Paid rows could go here if detail needed */}
                        <tr className="font-bold">
                            <td colSpan={6} className="border border-black p-2 text-right">Tổng cộng:</td>
                            <td className="border border-black p-2 text-right">{formatCurrency(data.summary?.total || 0)}</td>
                        </tr>
                    </tfoot>
                </table>
            )}

            {/* Summary for non-item vouchers like simple Income/Expense */}
            {(!data.items || data.items.length === 0) && data.amount && (
                <div className="mb-6 font-bold text-lg">
                    Số tiền: {formatCurrency(data.amount)}
                </div>
            )}

            {/* Text amount */}
            <div className="mb-6 italic">
                (Bằng chữ: {numberToWords(data.amount || data.summary?.total || 0)})
            </div>

            {/* Default Bank Account For Delivery Note */}
            {voucherType === 'delivery-note' && (
                <div className="mb-6 pl-4 border-l-4 border-gray-300">
                    <p className="font-bold mb-1">Quý khách có thể thanh toán theo thông tin tài khoản như sau:</p>
                    <div className="flex gap-16 mb-1">
                        <p><span className="italic">Ngân hàng:</span> {data.bankInfo?.bankName || company.bankInfo?.bankName || '...'}</p>
                        <p><span className="italic">STK:</span> {data.bankInfo?.accountNumber || company.bankInfo?.accountNumber || '...'}</p>
                    </div>
                    <p><span className="italic">Tên TK:</span> {data.bankInfo?.accountHolder || company.bankInfo?.accountHolder || company.name}</p>
                </div>
            )}

            {/* Valid for all */}
            {voucherType !== 'internal-transfer' && (
                <div className="text-right italic mb-8">
                    {formatDate(data.date)}
                </div>
            )}

            <div className={`flex ${voucherType === 'delivery-note' ? 'justify-around' : 'justify-between'} text-center mt-4 break-inside-avoid`}>
                <div className={voucherType === 'delivery-note' ? 'w-1/2' : 'w-1/4'}>
                    <p className="font-bold">{voucherType === 'delivery-note' ? 'Người bán hàng' : 'Người lập phiếu'}</p>
                    <p className="italic text-xs">(Ký, họ tên)</p>
                    <br /><br /><br /><br />
                    <p></p>
                </div>
                <div className={voucherType === 'delivery-note' ? 'w-1/2' : 'w-1/4'}>
                    <p className="font-bold">{voucherType === 'delivery-note' ? 'Người nhận hàng' : 'Người giao hàng'}</p>
                    <p className="italic text-xs">(Ký, họ tên)</p>
                </div>
                {voucherType !== 'delivery-note' && (
                    <>
                        <div className="w-1/4">
                            <p className="font-bold">Thủ kho</p>
                            <p className="italic text-xs">(Ký, họ tên)</p>
                        </div>
                        <div className="w-1/4">
                            <p className="font-bold">Giám đốc</p>
                            <p className="italic text-xs">(Ký, họ tên)</p>
                        </div>
                    </>
                )}
            </div>
            <PrintFooter />
        </div>
    );
};

export default PrintVoucherTemplate;
