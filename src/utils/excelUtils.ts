import * as XLSX from 'xlsx-js-style';
import { numberToWords } from './numberToWords';
import { getCompanyInfo } from './companyInfo';

export const getCompanyUnitHeader = () => {
    const company = getCompanyInfo();
    let text = `Đơn vị: ${company.name}`;
    if (company.taxCode) text += ` | MST: ${company.taxCode}`;
    text += ` | ĐT: ${company.phone}`;
    return text;
};

export const getFileNameWithPrefix = (fileName: string) => {
    const company = getCompanyInfo();
    const prefix = company.isHkd ? 'TuoiNgoc_' : '';
    if (fileName.startsWith('TuoiNgoc_')) return fileName;
    return `${prefix}${fileName}`;
};

export const excelUtils = {
    exportToExcel: <T>(data: T[], fileName: string, sheetName: string = 'Sheet1') => {
        const worksheet = XLSX.utils.json_to_sheet(data);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        XLSX.writeFile(workbook, `${getFileNameWithPrefix(fileName)}.xlsx`);
    },

    exportTemplate: (columns: string[], fileName: string) => {
        const worksheet = XLSX.utils.aoa_to_sheet([columns]);
        const workbook = XLSX.utils.book_new();

        // Style header for template
        const headerStyle = {
            font: { bold: true, name: 'Arial', sz: 10, color: { rgb: 'FFFFFF' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { rgb: '1F4E78' } }, // Professional Dark Blue
            border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
            }
        };

        const range = XLSX.utils.decode_range(worksheet['!ref']!);
        
        // Auto columns width
        worksheet['!cols'] = columns.map(col => ({ wch: Math.max(col.length + 5, 15) }));

        for (let C = 0; C <= range.e.c; ++C) {
            const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
            if (worksheet[cellRef]) {
                worksheet[cellRef].s = headerStyle;
            }
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
        XLSX.writeFile(workbook, `${getFileNameWithPrefix(fileName)}_Template.xlsx`);
    },

    readExcel: (file: File): Promise<any[]> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target?.result as ArrayBuffer);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const sheetName = workbook.SheetNames[0];
                    const worksheet = workbook.Sheets[sheetName];
                    const jsonData = XLSX.utils.sheet_to_json(worksheet);
                    resolve(jsonData);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = (error) => reject(error);
            reader.readAsArrayBuffer(file);
        });
    },

    exportProductSalesStyled: (
        data: any[],
        fileName: string,
        dateFrom: string,
        dateTo: string,
        facilityName: string = 'Tất cả'
    ) => {
        // Prepare the workbook and worksheet
        const wb = XLSX.utils.book_new();

        const now = new Date();
        const currentDateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const dateFromStr = dateFrom ? new Date(dateFrom).toLocaleDateString('vi-VN') : '...';
        const dateToStr = dateTo ? new Date(dateTo).toLocaleDateString('vi-VN') : '...';

        const headerRowStyle = {
            font: { bold: true, name: 'Arial', sz: 10 },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
                top: { style: 'thin', color: { rgb: '9BC2E6' } },
                bottom: { style: 'thin', color: { rgb: '9BC2E6' } }
            }
        };

        const totalRowStyle = {
            font: { bold: true, name: 'Arial', sz: 10 },
            alignment: { vertical: 'center' },
            border: {
                bottom: { style: 'thin', color: { rgb: '9BC2E6' } }
            }
        };

        const netRevenueStyle = {
            font: { bold: true, name: 'Arial', sz: 10, color: { rgb: '0066CC' } }
        };

        // Header Rows Array
        const wsData: any[][] = [
            [],
            [`Ngày lập: ${currentDateStr}`, null, 'Báo cáo bán hàng theo hàng hóa'],
            [null, null, `Từ ngày ${dateFromStr} đến ngày ${dateToStr}`],
            [null, null, `Chi nhánh: ${facilityName}`],
            [null, null, `Bảng giá: Tất cả`],
            [],
            [null, null, null, null, null, null, '(Đã phân bổ giảm giá hóa đơn, giảm giá phiếu trả)'],
            ['Mã hàng', 'Tên hàng', 'Danh mục', 'SL Bán', 'Doanh thu', 'SL Trả', 'Giá trị trả', 'Doanh thu thuần']
        ];

        let totalQty = 0;
        let totalRevenue = 0;
        let totalReturnQty = 0; // default 0 for now
        let totalReturnVal = 0; // default 0 for now
        let totalNet = 0;

        // Data rows
        const rows = data.map(item => {
            const qty = Number(item.totalQty || 0);
            const rev = Number(item.totalRevenue || 0);
            const retQty = Number(item.returnQty || 0);
            const retVal = Number(item.returnVal || 0);
            const net = rev - retVal;

            totalQty += qty;
            totalRevenue += rev;
            totalReturnQty += retQty;
            totalReturnVal += retVal;
            totalNet += net;

            return [
                item.sku,
                item.name,
                item.category || 'Chưa phân loại',
                qty,
                rev,
                retQty,
                retVal,
                net
            ];
        });

        // Summary row
        wsData.push([
            `SL mặt hàng: ${data.length}`,
            null,
            null,
            totalQty,
            totalRevenue,
            totalReturnQty,
            totalReturnVal,
            totalNet
        ]);

        wsData.push(...rows);

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Styling
        const range = XLSX.utils.decode_range(ws['!ref']!);

        // Title formatting
        ws['C2'].s = { font: { bold: true, sz: 14, name: 'Arial' }, alignment: { horizontal: 'center' } };
        ws['A2'].s = { font: { italic: true, sz: 10, name: 'Arial', color: { rgb: '555555' } } };
        ws['C3'].s = { alignment: { horizontal: 'center' }, font: { name: 'Arial', sz: 10, color: { rgb: '555555' } } };
        ws['C4'].s = { alignment: { horizontal: 'center' }, font: { name: 'Arial', sz: 10, color: { rgb: '555555' } } };
        ws['C5'].s = { alignment: { horizontal: 'center' }, font: { name: 'Arial', sz: 10, color: { rgb: '555555' } } };
        ws['G7'].s = { alignment: { horizontal: 'right' }, font: { italic: true, sz: 10, name: 'Arial', color: { rgb: '555555' } } };

        // Merges
        ws['!merges'] = [
            { s: { r: 1, c: 2 }, e: { r: 1, c: 7 } }, // Title
            { s: { r: 2, c: 2 }, e: { r: 2, c: 7 } }, // Date
            { s: { r: 3, c: 2 }, e: { r: 3, c: 7 } }, // Facility
            { s: { r: 4, c: 2 }, e: { r: 4, c: 7 } }, // Price List
            { s: { r: 6, c: 6 }, e: { r: 6, c: 7 } }, // Note
        ];

        // Column widths
        ws['!cols'] = [
            { wch: 15 }, // A
            { wch: 30 }, // B
            { wch: 15 }, // C (Danh mục)
            { wch: 12 }, // D
            { wch: 15 }, // E
            { wch: 10 }, // F
            { wch: 15 }, // G
            { wch: 15 }, // H
        ];

        // Format headers & data
        for (let R = 7; R <= range.e.r; ++R) {
            for (let C = 0; C <= range.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' };

                const cell = ws[cellRef];

                if (R === 7) {
                    // Header row
                    cell.s = headerRowStyle;
                } else if (R === 8) {
                    // Total row
                    cell.s = { ...totalRowStyle };
                    if (C === 7) {
                        cell.s = { ...totalRowStyle, ...netRevenueStyle };
                    }
                } else {
                    // Data rows
                    const isNum = C >= 3;
                    cell.s = {
                        font: { name: 'Arial', sz: 10 },
                        alignment: { horizontal: isNum ? 'right' : 'left', vertical: 'center' },
                        border: { bottom: { style: 'dotted', color: { rgb: 'CCCCCC' } } }
                    };
                    if (C === 0) cell.s.font.color = { rgb: '0066CC' }; // SKU color
                    if (isNum && typeof cell.v === 'number') {
                        cell.z = '#,##0'; // Number format
                    }
                }
            }
        }

        XLSX.utils.book_append_sheet(wb, ws, 'BigProductBySaleByCat');
        XLSX.writeFile(wb, `${getFileNameWithPrefix(fileName)}.xlsx`);
    },

    exportInventorySummaryStyled: (
        data: any[],
        fileName: string,
        dateFrom: string,
        dateTo: string,
        facilityName: string = 'Tất cả'
    ) => {
        const wb = XLSX.utils.book_new();

        const now = new Date();
        const currentDateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const dateFromStr = dateFrom ? new Date(dateFrom).toLocaleDateString('vi-VN') : '...';
        const dateToStr = dateTo ? new Date(dateTo).toLocaleDateString('vi-VN') : '...';

        const headerRowStyle = {
            font: { bold: true, name: 'Arial', sz: 10 },
            alignment: { horizontal: 'center', vertical: 'center' },
            border: {
                top: { style: 'thin', color: { rgb: '9BC2E6' } },
                bottom: { style: 'thin', color: { rgb: '9BC2E6' } }
            }
        };

        const totalRowStyle = {
            font: { bold: true, name: 'Arial', sz: 10 },
            alignment: { vertical: 'center' },
            border: {
                bottom: { style: 'thin', color: { rgb: '9BC2E6' } }
            }
        };

        const finalValueStyle = {
            font: { bold: true, name: 'Arial', sz: 10, color: { rgb: '0066CC' } }
        };

        const wsData: any[][] = [
            [],
            [`Ngày lập: ${currentDateStr}`, null, 'Báo cáo xuất nhập tồn'],
            [null, null, `Từ ngày ${dateFromStr} đến ngày ${dateToStr}`],
            [null, null, `Chi nhánh: ${facilityName}`],
            [],
            ['Mã hàng', 'Tên hàng', 'Danh mục', 'Tồn đầu kỳ', 'Giá trị đầu kỳ', 'SL Nhập', 'Giá trị nhập', 'SL Xuất', 'Giá trị xuất', 'Tồn cuối kỳ', 'Giá trị cuối kỳ']
        ];

        let tBeg = 0, tBegV = 0, tIn = 0, tInV = 0, tOut = 0, tOutV = 0, tEnd = 0, tEndV = 0;

        const rows = data.map(item => {
            const b = Number(item.beginning || 0);
            const bv = Number(item.beginningValue || 0);
            const i = Number(item.in || 0);
            const iv = Number(item.inValue || 0);
            const o = Number(item.out || 0);
            const ov = Number(item.outValue || 0);
            const e = Number(item.end || 0);
            const ev = Number(item.endValue || 0);

            tBeg += b; tBegV += bv;
            tIn += i; tInV += iv;
            tOut += o; tOutV += ov;
            tEnd += e; tEndV += ev;

            return [
                item.sku,
                item.name,
                item.category || 'Chưa phân loại',
                b, bv, i, iv, o, ov, e, ev
            ];
        });

        wsData.push([
            `SL mặt hàng: ${data.length}`,
            null,
            null,
            tBeg, tBegV, tIn, tInV, tOut, tOutV, tEnd, tEndV
        ]);

        wsData.push(...rows);

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        const range = XLSX.utils.decode_range(ws['!ref']!);

        ws['C2'].s = { font: { bold: true, sz: 14, name: 'Arial' }, alignment: { horizontal: 'center' } };
        ws['A2'].s = { font: { italic: true, sz: 10, name: 'Arial', color: { rgb: '555555' } } };
        ws['C3'].s = { alignment: { horizontal: 'center' }, font: { name: 'Arial', sz: 10, color: { rgb: '555555' } } };
        ws['C4'].s = { alignment: { horizontal: 'center' }, font: { name: 'Arial', sz: 10, color: { rgb: '555555' } } };

        ws['!merges'] = [
            { s: { r: 1, c: 2 }, e: { r: 1, c: 10 } },
            { s: { r: 2, c: 2 }, e: { r: 2, c: 10 } },
            { s: { r: 3, c: 2 }, e: { r: 3, c: 10 } }
        ];

        ws['!cols'] = [
            { wch: 15 }, // Mã
            { wch: 30 }, // Tên
            { wch: 15 }, // Danh mục
            { wch: 10 }, { wch: 15 }, // Đầu kỳ
            { wch: 10 }, { wch: 15 }, // Nhập
            { wch: 10 }, { wch: 15 }, // Xuất
            { wch: 10 }, { wch: 15 }, // Cuối kỳ
        ];

        for (let R = 5; R <= range.e.r; ++R) {
            for (let C = 0; C <= range.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' };
                const cell = ws[cellRef];

                if (R === 5) {
                    cell.s = headerRowStyle;
                } else if (R === 6) {
                    cell.s = { ...totalRowStyle };
                    if (C === 10) cell.s = { ...totalRowStyle, ...finalValueStyle };
                } else {
                    const isNum = C >= 3;
                    cell.s = {
                        font: { name: 'Arial', sz: 10 },
                        alignment: { horizontal: isNum ? 'right' : 'left', vertical: 'center' },
                        border: { bottom: { style: 'dotted', color: { rgb: 'CCCCCC' } } }
                    };
                    if (C === 0) cell.s.font.color = { rgb: '0066CC' };
                    if (isNum && typeof cell.v === 'number') {
                        cell.z = '#,##0';
                    }
                }
            }
        }

        XLSX.utils.book_append_sheet(wb, ws, 'ProducInOutStock');
        XLSX.writeFile(wb, `${getFileNameWithPrefix(fileName)}.xlsx`);
    },

    exportPartnersStyled: (
        data: any[],
        fileName: string,
        facilityName: string = 'Tất cả'
    ) => {
        const wb = XLSX.utils.book_new();

        const now = new Date();
        const currentDateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const headerRowStyle = {
            font: { bold: true, name: 'Arial', sz: 10, color: { rgb: 'FFFFFF' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            fill: { fgColor: { rgb: '4F81BD' } }, // Professional blue header
            border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
            }
        };

        const titleStyle = {
            font: { bold: true, sz: 16, name: 'Arial', color: { rgb: '1F497D' } },
            alignment: { horizontal: 'center' }
        };

        const wsData: any[][] = [
            [],
            [`Ngày lập: ${currentDateStr}`, null, 'DANH SÁCH ĐỐI TÁC'],
            [null, null, `Chi nhánh: ${facilityName}`],
            [],
            ['STT', 'Tên đối tác', 'Loại', 'Số điện thoại', 'Email', 'Địa chỉ', 'Mã số thuế', 'Công nợ', 'Công nợ tổng', 'Số NV', 'Số Chi nhánh']
        ];

        let customerCount = 0;
        let supplierCount = 0;

        const rows = data.map((item, index) => {
            if (item.type === 'CUSTOMER' || item['Loại'] === 'Khách hàng') customerCount++;
            else supplierCount++;

            return [
                index + 1,
                item['Tên đối tác'] || item.name,
                item['Loại'] || (item.type === 'CUSTOMER' ? 'Khách hàng' : 'Nhà cung cấp'),
                item['SĐT'] || item.phone,
                item['Email'] || item.email,
                item['Địa chỉ'] || item.address,
                item['Mã số thuế'] || item.tax_code,
                item['Công nợ'] || 0,
                item['Công nợ tổng'] || 0,
                item['Số NV'] || 0,
                item['Số Chi nhánh'] || 0
            ];
        });

        wsData.push(...rows);

        // Add summary at the bottom
        wsData.push([]);
        wsData.push(['', 'Tổng số Khách hàng:', customerCount]);
        wsData.push(['', 'Tổng số Nhà cung cấp:', supplierCount]);
        wsData.push(['', 'Tổng cộng:', data.length]);

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        const range = XLSX.utils.decode_range(ws['!ref']!);

        // Styling
        ws['C2'].s = titleStyle;
        ws['A2'].s = { font: { italic: true, sz: 10, name: 'Arial', color: { rgb: '555555' } } };
        ws['C3'].s = { alignment: { horizontal: 'center' }, font: { name: 'Arial', sz: 10, italic: true } };

        ws['!merges'] = [
            { s: { r: 1, c: 2 }, e: { r: 1, c: 10 } }, // Title
            { s: { r: 2, c: 2 }, e: { r: 2, c: 10 } }, // Facility
        ];

        ws['!cols'] = [
            { wch: 5 },   // STT
            { wch: 35 },  // Tên đối tác
            { wch: 15 },  // Loại
            { wch: 15 },  // SĐT
            { wch: 25 },  // Email
            { wch: 40 },  // Địa chỉ
            { wch: 15 },  // Mã số thuế
            { wch: 15 },  // Công nợ
            { wch: 18 },  // Công nợ tổng
            { wch: 8 },   // Số NV
            { wch: 12 },  // Số Chi nhánh
        ];

        for (let R = 4; R <= range.e.r; ++R) {
            for (let C = 0; C <= range.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellRef] && R === 4) ws[cellRef] = { v: '', t: 's' };
                if (!ws[cellRef]) continue;

                const cell = ws[cellRef];

                if (R === 4) {
                    cell.s = headerRowStyle;
                } else if (R >= 5 && R < 5 + data.length) {
                    const isCurrency = C === 7 || C === 8;
                    const isNum = C === 0 || C === 9 || C === 10;
                    cell.s = {
                        font: { name: 'Arial', sz: 10 },
                        alignment: { 
                            horizontal: isCurrency ? 'right' : (isNum ? 'center' : 'left'), 
                            vertical: 'center' 
                        },
                        border: {
                            top: { style: 'thin', color: { rgb: 'D9D9D9' } },
                            bottom: { style: 'thin', color: { rgb: 'D9D9D9' } },
                            left: { style: 'thin', color: { rgb: 'D9D9D9' } },
                            right: { style: 'thin', color: { rgb: 'D9D9D9' } }
                        }
                    };

                    // Alternate row colors for readibility
                    if (R % 2 !== 0) {
                        cell.s.fill = { fgColor: { rgb: 'F2F2F2' } };
                    }

                    if (C === 1) cell.s.font.color = { rgb: '0066CC' }; // Name color
                    if (C === 2) { // Type color
                        cell.s.font.bold = true;
                        cell.s.font.color = cell.v === 'Khách hàng' ? { rgb: '00B050' } : { rgb: 'E26B0A' };
                    }
                    if (isCurrency && typeof cell.v === 'number') {
                        cell.z = '#,##0';
                    }
                } else if (R >= 5 + data.length + 1) {
                    // Summary rows style
                    cell.s = {
                        font: { bold: true, name: 'Arial', sz: 10 },
                        alignment: { horizontal: C === 1 ? 'right' : 'left' }
                    };
                }
            }
        }

        XLSX.utils.book_append_sheet(wb, ws, 'DanhSachDoiTac');
        XLSX.writeFile(wb, `${getFileNameWithPrefix(fileName)}.xlsx`);
    },

    exportDebtsStyled: (
        data: any[],
        fileName: string,
        facilityName: string = 'Tất cả'
    ) => {
        const wb = XLSX.utils.book_new();

        const now = new Date();
        const currentDateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const headerRowStyle = {
            font: { bold: true, name: 'Arial', sz: 10, color: { rgb: 'FFFFFF' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            fill: { fgColor: { rgb: '17365D' } }, // Professional dark blue header
            border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
            }
        };

        const titleStyle = {
            font: { bold: true, sz: 16, name: 'Arial', color: { rgb: '0F243E' } },
            alignment: { horizontal: 'center' }
        };

        const wsData: any[][] = [
            [],
            [`Ngày lập: ${currentDateStr}`, null, 'DANH SÁCH CÔNG NỢ'],
            [null, null, `Chi nhánh: ${facilityName}`],
            [],
            ['STT', 'Tên đối tác', 'Số tiền', 'Hạn thanh toán', 'Loại công nợ', 'Trạng thái', 'Nhân viên phụ trách', 'Chi nhánh']
        ];

        let totalReceivable = 0;
        let totalPayable = 0;

        const rows = data.map((item, index) => {
            const amount = Number(item['Số tiền'] || 0);
            if (item['Loại'] === 'Phải thu') totalReceivable += amount;
            else if (item['Loại'] === 'Phải trả') totalPayable += amount;

            return [
                index + 1,
                item['Đối tác'],
                amount,
                item['Hạn thanh toán'],
                item['Loại'],
                item['Trạng thái'],
                item['Nhân viên'],
                item['Chi nhánh']
            ];
        });

        wsData.push(...rows);

        // Add summary at the bottom
        wsData.push([]);
        wsData.push(['', 'Tổng phải thu:', totalReceivable]);
        wsData.push(['', 'Tổng phải trả:', totalPayable]);

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const range = XLSX.utils.decode_range(ws['!ref']!);

        // Styling
        ws['C2'].s = titleStyle;
        ws['A2'].s = { font: { italic: true, sz: 10, name: 'Arial', color: { rgb: '555555' } }, alignment: { horizontal: 'left' } };
        ws['C3'].s = { alignment: { horizontal: 'center' }, font: { name: 'Arial', sz: 10, italic: true } };

        ws['!merges'] = [
            { s: { r: 1, c: 2 }, e: { r: 1, c: 5 } }, // Title
            { s: { r: 2, c: 2 }, e: { r: 2, c: 5 } }, // Facility
        ];

        ws['!cols'] = [
            { wch: 5 },   // STT
            { wch: 35 },  // Đối tác
            { wch: 18 },  // Số tiền
            { wch: 15 },  // Hạn
            { wch: 15 },  // Loại
            { wch: 20 },  // Trạng thái
            { wch: 20 },  // NV
            { wch: 20 },  // CN
        ];

        for (let R = 4; R <= range.e.r; ++R) {
            for (let C = 0; C <= range.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellRef] && R === 4) ws[cellRef] = { v: '', t: 's' };
                if (!ws[cellRef]) continue;

                const cell = ws[cellRef];

                if (R === 4) {
                    cell.s = headerRowStyle;
                } else if (R >= 5 && R < 5 + data.length) {
                    const isNum = C === 0;
                    const isAmount = C === 2;
                    cell.s = {
                        font: { name: 'Arial', sz: 10 },
                        alignment: { horizontal: isNum ? 'center' : (isAmount ? 'right' : 'left'), vertical: 'center' },
                        border: {
                            top: { style: 'thin', color: { rgb: 'D9D9D9' } },
                            bottom: { style: 'thin', color: { rgb: 'D9D9D9' } },
                            left: { style: 'thin', color: { rgb: 'D9D9D9' } },
                            right: { style: 'thin', color: { rgb: 'D9D9D9' } }
                        }
                    };

                    if (R % 2 !== 0) cell.s.fill = { fgColor: { rgb: 'F2F2F2' } };
                    if (C === 1) cell.s.font.color = { rgb: '0066CC' }; // Name color

                    if (isAmount && typeof cell.v === 'number') {
                        cell.z = '#,##0'; // format money
                        // color based on type
                        if (data[R - 5]['Loại'] === 'Phải thu') {
                            cell.s.font.color = { rgb: '00B050' };
                        } else {
                            cell.s.font.color = { rgb: 'C00000' };
                        }
                    }

                    if (C === 4) { // Loại
                        cell.s.font.bold = true;
                        if (cell.v === 'Phải thu') cell.s.font.color = { rgb: '00B050' };
                        if (cell.v === 'Phải trả') cell.s.font.color = { rgb: 'C00000' };
                    }

                    if (C === 5) { // Trạng thái
                        cell.s.font.bold = true;
                        if (cell.v === 'Đã thanh toán') cell.s.font.color = { rgb: '00B050' };
                        else if (cell.v === 'Chưa thanh toán') cell.s.font.color = { rgb: 'C00000' };
                        else cell.s.font.color = { rgb: 'E26B0A' };
                    }
                } else if (R >= 5 + data.length + 1) {
                    // Summary
                    cell.s = {
                        font: { bold: true, name: 'Arial', sz: 12 },
                        alignment: { horizontal: C === 1 ? 'right' : 'left' }
                    };
                    if (C === 2) {
                        cell.s.alignment.horizontal = 'right';
                        cell.z = '#,##0';
                        if (cell.v === totalReceivable) cell.s.font.color = { rgb: '00B050' };
                        if (cell.v === totalPayable) cell.s.font.color = { rgb: 'C00000' };
                    }
                }
            }
        }

        XLSX.utils.book_append_sheet(wb, ws, 'DanhSachCongNo');
        XLSX.writeFile(wb, `${getFileNameWithPrefix(fileName)}.xlsx`);
    },

    exportPartnerStatementStyled: (
        data: any[],
        fileName: string,
        partnerName: string,
        facilityName: string = 'Tất cả'
    ) => {
        const wb = XLSX.utils.book_new();

        const now = new Date();
        const currentDateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const headerRowStyle = {
            font: { bold: true, name: 'Arial', sz: 10, color: { rgb: 'FFFFFF' } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            fill: { fgColor: { rgb: '0066CC' } }, // Professional blue header
            border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
            }
        };

        const titleStyle = {
            font: { bold: true, sz: 16, name: 'Arial', color: { rgb: '003366' } },
            alignment: { horizontal: 'center' }
        };

        const wsData: any[][] = [
            [],
            [`Ngày lập: ${currentDateStr}`, null, 'SỔ CHI TIẾT CÔNG NỢ'],
            [null, null, `ĐỐI TÁC: ${partnerName.toUpperCase()}`],
            [null, null, `Chi nhánh: ${facilityName}`],
            [],
            ['STT', 'Ngày', 'Mã chứng từ', 'Mô tả', 'Phát sinh tăng (Nợ)', 'Phát sinh giảm (Có)', 'Số dư', 'Ghi chú']
        ];

        let totalIncrease = 0;
        let totalDecrease = 0;

        const rows = data.map((item, index) => {
            const inc = Number(item['Tăng'] || 0);
            const dec = Number(item['Giảm'] || 0);
            const bal = Number(item['Dư'] || 0);

            totalIncrease += inc;
            totalDecrease += dec;

            return [
                index + 1,
                item['Ngày'],
                item['Mã'],
                item['Mô tả'],
                inc, // Number instead of formatted string for export
                dec,
                bal,
                item['Ghi chú']
            ];
        });

        wsData.push(...rows);

        // Add summary at the bottom
        const summaryStartRow = 6 + data.length;
        wsData.push([]);
        wsData.push(['', '', '', 'Cộng phát sinh:', totalIncrease, totalDecrease, '', '']);
        wsData.push(['', '', '', 'Số dư cuối kỳ:', '', '', data.length > 0 ? Number(data[data.length - 1]['Dư'] || 0) : 0, '']);

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const range = XLSX.utils.decode_range(ws['!ref']!);

        // Styling
        ws['C2'].s = titleStyle;
        ws['C3'].s = { alignment: { horizontal: 'center' }, font: { name: 'Arial', sz: 12, bold: true, color: { rgb: '555555' } } };
        ws['C4'].s = { alignment: { horizontal: 'center' }, font: { name: 'Arial', sz: 10, italic: true } };
        ws['A2'].s = { font: { italic: true, sz: 10, name: 'Arial', color: { rgb: '555555' } }, alignment: { horizontal: 'left' } };

        ws['!merges'] = [
            { s: { r: 1, c: 2 }, e: { r: 1, c: 7 } }, // Title
            { s: { r: 2, c: 2 }, e: { r: 2, c: 7 } }, // Partner Name
            { s: { r: 3, c: 2 }, e: { r: 3, c: 7 } }, // Facility
            { s: { r: summaryStartRow + 1, c: 3 }, e: { r: summaryStartRow + 1, c: 3 } }, // Summary 1
            { s: { r: summaryStartRow + 2, c: 3 }, e: { r: summaryStartRow + 2, c: 3 } }, // Summary 2
        ];

        ws['!cols'] = [
            { wch: 5 },   // STT
            { wch: 15 },  // Ngày
            { wch: 20 },  // Mã
            { wch: 40 },  // Mô tả
            { wch: 20 },  // Nợ
            { wch: 20 },  // Có
            { wch: 20 },  // Dư
            { wch: 30 },  // Ghi chú
        ];

        for (let R = 5; R <= range.e.r; ++R) {
            for (let C = 0; C <= range.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellRef] && R === 5) ws[cellRef] = { v: '', t: 's' };
                if (!ws[cellRef]) continue;

                const cell = ws[cellRef];

                if (R === 5) { // Table Header
                    cell.s = headerRowStyle;
                } else if (R >= 6 && R < 6 + data.length) { // Data rows
                    const isNum = C === 0;
                    const isMoney = C >= 4 && C <= 6;

                    cell.s = {
                        font: { name: 'Arial', sz: 10 },
                        alignment: { horizontal: isNum ? 'center' : (isMoney ? 'right' : 'left'), vertical: 'center' },
                        border: {
                            top: { style: 'thin', color: { rgb: 'D9D9D9' } },
                            bottom: { style: 'thin', color: { rgb: 'D9D9D9' } },
                            left: { style: 'thin', color: { rgb: 'D9D9D9' } },
                            right: { style: 'thin', color: { rgb: 'D9D9D9' } }
                        }
                    };

                    if (R % 2 !== 0) cell.s.fill = { fgColor: { rgb: 'F5F7FA' } }; // Light blue-grey alternating

                    if (C === 2) cell.s.font.color = { rgb: '0066CC' }; // Code color

                    if (isMoney && typeof cell.v === 'number') {
                        cell.z = '#,##0'; // format money
                        // color coding
                        if (C === 4 && cell.v > 0) cell.s.font.color = { rgb: 'C00000' }; // Tăng Nợ (Đỏ)
                        if (C === 5 && cell.v > 0) cell.s.font.color = { rgb: '00B050' }; // Giảm Có (Xanh)
                        if (C === 6) cell.s.font.bold = true; // Số dư in đậm
                    }
                } else if (R === summaryStartRow + 1 || R === summaryStartRow + 2) {
                    // Summary rows
                    cell.s = {
                        font: { bold: true, name: 'Arial', sz: 11 },
                        alignment: { horizontal: C === 3 ? 'right' : 'left' }
                    };

                    // Format summary values
                    if (R === summaryStartRow + 1 && (C === 4 || C === 5)) {
                        cell.s.alignment.horizontal = 'right';
                        cell.z = '#,##0';
                        if (C === 4) cell.s.font.color = { rgb: 'C00000' };
                        if (C === 5) cell.s.font.color = { rgb: '00B050' };
                    }

                    if (R === summaryStartRow + 2 && C === 6) {
                        cell.s.alignment.horizontal = 'right';
                        cell.z = '#,##0';
                        cell.s.font.color = { rgb: '0066CC' };
                        cell.s.font.sz = 12;
                    }
                }
            }
        }

        XLSX.utils.book_append_sheet(wb, ws, 'SoChiTietCongNo');
        XLSX.writeFile(wb, `${getFileNameWithPrefix(fileName)}.xlsx`);
    },

    exportInventoryCard: (
        product: any,
        history: any[],
        fileName: string,
        facilityName: string = 'Tất cả'
    ) => {
        const wb = XLSX.utils.book_new();

        const now = new Date();
        const currentDateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const headerRowStyle = {
            font: { bold: true, name: 'Arial', sz: 10, color: { rgb: '333333' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'E5F2E5' } },
            border: {
                top: { style: 'thin', color: { rgb: 'CCCCCC' } },
                bottom: { style: 'thin', color: { rgb: 'CCCCCC' } },
                left: { style: 'thin', color: { rgb: 'CCCCCC' } },
                right: { style: 'thin', color: { rgb: 'CCCCCC' } }
            }
        };

        const wsData: any[][] = [
            [],
            [null, null, 'THẺ KHO'],
            [null, null, `Ngày in: ${currentDateStr}`],
            [null, null, `Mã hàng hóa: ${product.sku}`],
            [null, null, `Tên hàng hóa: ${product.name}`],
            [null, null, `Đơn vị tính: ${product.unit || 'Lẻ'}`],
            [null, null, `Kho hàng: ${facilityName}`],
            [],
            ['Chứng từ', 'Thời gian', 'Loại giao dịch', 'Đối tác', 'Giá GD', 'Giá vốn', 'Số lượng', 'Tồn cuối']
        ];

        let totalIn = 0;
        let totalOut = 0;

        if (!history || history.length === 0) {
            wsData.push([
                '-',
                new Date().toLocaleDateString('vi-VN'),
                'Tồn kho ban đầu',
                '-',
                product.price,
                0,
                0,
                product.quantity
            ]);
        } else {
            const rows = history.map(item => {
                totalIn += Number(item.qty_in || 0);
                totalOut += Number(item.qty_out || 0);

                const qtyDiff = Number(item.qty_in || 0) > 0 ? Number(item.qty_in || 0) : -Number(item.qty_out || 0);

                return [
                    item.code || '-',
                    new Date(item.date).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' }),
                    item.type || '-',
                    item.partner || '-',
                    Number(item.price || 0),
                    0, // Giá vốn (Placeholder do dữ liệu hiện tại chưa bóc tách sâu giá vốn mỗi giao dịch)
                    qtyDiff,
                    Number(item.balance || 0)
                ];
            });

            wsData.push(...rows);
        }

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Styling
        ws['!merges'] = [
            { s: { r: 1, c: 2 }, e: { r: 1, c: 7 } },
            { s: { r: 2, c: 2 }, e: { r: 2, c: 7 } },
            { s: { r: 3, c: 2 }, e: { r: 3, c: 7 } },
            { s: { r: 4, c: 2 }, e: { r: 4, c: 7 } },
            { s: { r: 5, c: 2 }, e: { r: 5, c: 7 } },
            { s: { r: 6, c: 2 }, e: { r: 6, c: 7 } },
        ];

        ws['C2'].s = { font: { bold: true, sz: 16, name: 'Arial', color: { rgb: '333333' } }, alignment: { horizontal: 'center' } };
        ws['C3'].s = { alignment: { horizontal: 'center' }, font: { name: 'Arial', sz: 10, italic: true } };
        ws['C4'].s = { alignment: { horizontal: 'center' }, font: { name: 'Arial', sz: 10, bold: true } };
        ws['C5'].s = { alignment: { horizontal: 'center' }, font: { name: 'Arial', sz: 10, bold: true } };
        ws['C6'].s = { alignment: { horizontal: 'center' }, font: { name: 'Arial', sz: 10 } };
        ws['C7'].s = { alignment: { horizontal: 'center' }, font: { name: 'Arial', sz: 10 } };

        // Column widths
        ws['!cols'] = [
            { wch: 15 }, // Chứng từ
            { wch: 20 }, // Thời gian
            { wch: 20 }, // Loại GD
            { wch: 25 }, // Đối tác
            { wch: 15 }, // Giá GD
            { wch: 15 }, // Giá vốn
            { wch: 15 }, // Số lượng
            { wch: 15 }, // Tồn cuối
        ];

        const range = XLSX.utils.decode_range(ws['!ref']!);

        for (let R = 8; R <= range.e.r; ++R) {
            for (let C = 0; C <= range.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' };

                const cell = ws[cellRef];

                if (R === 8) {
                    // Header row
                    cell.s = { ...headerRowStyle };
                } else if (R > 8) {
                    const isNum = C >= 4;
                    cell.s = {
                        font: { name: 'Arial', sz: 10, color: { rgb: '333333' } },
                        alignment: { horizontal: isNum ? 'right' : (C === 0 || C === 1 ? 'center' : 'left'), vertical: 'center' },
                        border: { bottom: { style: 'thin', color: { rgb: 'EEEEEE' } } }
                    };
                    if (C === 0) cell.s.font.color = { rgb: '0066CC' }; // Mã chứng từ màu xanh

                    if (isNum && typeof cell.v === 'number') {
                        cell.z = '#,##0'; // Number format
                    }
                }
            }
        }

        XLSX.utils.book_append_sheet(wb, ws, 'TheKhoChiTiet');
        XLSX.writeFile(wb, `${getFileNameWithPrefix(fileName)}.xlsx`);
    },

    exportInventoryList: (
        data: any[],
        fileName: string,
        facilityName: string = 'Tất cả'
    ) => {
        const wb = XLSX.utils.book_new();

        const now = new Date();
        const currentDateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const headerRowStyle = {
            font: { bold: true, name: 'Arial', sz: 10, color: { rgb: 'FFFFFF' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { rgb: '0066CC' } },
            border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
            }
        };

        const totalRowStyle = {
            font: { bold: true, name: 'Arial', sz: 10, color: { rgb: '0066CC' } },
            alignment: { vertical: 'center' },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'E8F0FE' } },
            border: {
                bottom: { style: 'thin', color: { rgb: '9BC2E6' } }
            }
        };

        const wsData: any[][] = [
            [],
            [null, null, 'BÁO CÁO DANH SÁCH HÀNG HÓA TỒN KHO'],
            [null, null, `Ngày xuất: ${currentDateStr}`],
            [null, null, `Kho hàng: ${facilityName}`],
            [],
            ['STT', 'Mã SKU', 'Tên sản phẩm', 'Đơn vị', 'Danh mục', 'Kho', 'Số lượng', 'Đơn giá', 'Tổng giá trị']
        ];

        let totalQty = 0;
        let totalVal = 0;

        const rows = data.map((item, index) => {
            const qty = Number(item.quantity) || 0;
            const price = Number(item.price) || 0;
            const val = Math.round(qty * price);

            totalQty += qty;
            totalVal += val;

            return [
                index + 1,
                item.sku,
                item.name,
                item.unit,
                item.category,
                item.warehouse,
                qty,
                price,
                val
            ];
        });

        // Add rows
        wsData.push(...rows);

        // Add Summary row
        wsData.push([
            '', '', `Tổng cộng: ${data.length} SP`, '', '', '', totalQty, '', totalVal
        ]);

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Styling Title
        ws['!merges'] = [
            { s: { r: 1, c: 2 }, e: { r: 1, c: 8 } },
            { s: { r: 2, c: 2 }, e: { r: 2, c: 8 } },
            { s: { r: 3, c: 2 }, e: { r: 3, c: 8 } },
            { s: { r: wsData.length - 1, c: 2 }, e: { r: wsData.length - 1, c: 5 } } // Merge Total text
        ];

        ws['C2'].s = { font: { bold: true, sz: 16, name: 'Arial', color: { rgb: '0066CC' } }, alignment: { horizontal: 'center' } };
        ws['C3'].s = { alignment: { horizontal: 'center' }, font: { name: 'Arial', sz: 10, italic: true } };
        ws['C4'].s = { alignment: { horizontal: 'center' }, font: { name: 'Arial', sz: 10, bold: true } };

        // Column widths
        ws['!cols'] = [
            { wch: 6 },  // STT
            { wch: 15 }, // Mã SKU
            { wch: 35 }, // Tên
            { wch: 10 }, // Đơn vị
            { wch: 15 }, // Danh mục
            { wch: 20 }, // Kho
            { wch: 12 }, // Số lượng
            { wch: 15 }, // Đơn giá
            { wch: 20 }  // Tổng giá trị
        ];

        const range = XLSX.utils.decode_range(ws['!ref']!);

        for (let R = 5; R <= range.e.r; ++R) {
            for (let C = 0; C <= range.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' };

                const cell = ws[cellRef];

                if (R === 5) { // Header
                    cell.s = { ...headerRowStyle };
                } else if (R === range.e.r) { // Total Row
                    cell.s = { ...totalRowStyle };
                    if (C >= 6) {
                        cell.s.alignment = { horizontal: 'right' };
                        cell.z = '#,##0';
                        if (C === 6) cell.s.font.color = { rgb: '00B050' }; // Green for Qty
                        if (C === 8) cell.s.font.color = { rgb: 'C00000' }; // Red for Val
                    }
                } else if (R > 5) {
                    const isNum = C >= 6;
                    cell.s = {
                        font: { name: 'Arial', sz: 10 },
                        alignment: { horizontal: isNum ? 'right' : (C === 0 ? 'center' : 'left'), vertical: 'center' },
                        border: {
                            top: { style: 'thin', color: { rgb: 'E0E0E0' } },
                            bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
                            left: { style: 'thin', color: { rgb: 'E0E0E0' } },
                            right: { style: 'thin', color: { rgb: 'E0E0E0' } }
                        }
                    };
                    if (isNum && typeof cell.v === 'number') {
                        cell.z = '#,##0';
                    }
                    if (C === 1) cell.s.font.color = { rgb: '0066CC' }; // SKU color
                    if (R % 2 !== 0) {
                        cell.s.fill = { fgColor: { rgb: 'F9F9F9' } };
                    }
                }
            }
        }

        XLSX.utils.book_append_sheet(wb, ws, 'DanhSachTonKho');
        XLSX.writeFile(wb, `${getFileNameWithPrefix(fileName)}.xlsx`);
    },

    exportOrdersKiotVietStyle: (
        data: any[],
        fileName: string,
        isExport: boolean
    ) => {
        const wb = XLSX.utils.book_new();

        const headerRowStyle = {
            font: { bold: true, name: 'Arial', sz: 10, color: { rgb: 'FFFFFF' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { rgb: '4F81BD' } },
            border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
            }
        };

        const headers = [
            'Mã chứng từ',
            'Thời gian',
            isExport ? 'Tên khách hàng' : 'Nhà cung cấp',
            'Chi nhánh',
            'Tên hàng',
            'ĐVT',
            'Số lượng',
            isExport ? 'Giá bán' : 'Giá nhập',
            'Thành tiền',
            isExport ? 'Khách đã trả' : 'Đã thanh toán',
            'Còn nợ',
            'Ghi chú'
        ];

        const wsData: any[][] = [headers];
        const rowBgColors: string[] = ['4F81BD']; // Header color

        data.forEach((order, index) => {
            const orderCode = order.code || '';
            const branch = order.facility_name || '';
            const orderDateStr = order.order_date;
            const createdAtStr = order.created_at;
            const notes = order.notes || '';
            
            let orderDate = '';
            if (orderDateStr) {
                 const dDate = new Date(orderDateStr);
                 const dTime = createdAtStr ? new Date(createdAtStr) : dDate;
                 orderDate = `${dDate.getDate().toString().padStart(2, '0')}/${(dDate.getMonth() + 1).toString().padStart(2, '0')}/${dDate.getFullYear()} ${dTime.getHours().toString().padStart(2, '0')}:${dTime.getMinutes().toString().padStart(2, '0')}:${dTime.getSeconds().toString().padStart(2, '0')}`;
            }

            const partnerName = isExport ? order.customer_name : order.supplier_name;
            const amountPaid = order.amount_paid || 0;
            const remaining = (order.total_amount || 0) - amountPaid;

            const bgColor = index % 2 === 0 ? 'FFFFFF' : 'EBF1DE'; // Light green alternate background by order

            if (order.items && order.items.length > 0) {
                order.items.forEach((item: any) => {
                    const itemName = item.product?.name || '';
                    const unit = item.product?.unit || '';
                    const qty = item.quantity || 0;
                    const price = item.price || 0;
                    const lineTotal = Math.round(qty * price);

                    wsData.push([
                        orderCode,
                        orderDate,
                        partnerName,
                        branch,
                        itemName,
                        unit,
                        qty,
                        price,
                        lineTotal,
                        amountPaid,
                        remaining,
                        notes
                    ]);
                    rowBgColors.push(bgColor);
                });
            } else {
                wsData.push([
                    orderCode,
                    orderDate,
                    partnerName,
                    branch,
                    '',
                    '',
                    0,
                    0,
                    0,
                    amountPaid,
                    remaining,
                    notes
                ]);
                rowBgColors.push(bgColor);
            }
        });

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        ws['!cols'] = [
            { wch: 20 }, // Mã chứng từ
            { wch: 18 }, // Thời gian
            { wch: 30 }, // Tên KH/NCC
            { wch: 20 }, // Chi nhánh
            { wch: 35 }, // Tên hàng
            { wch: 10 }, // ĐVT
            { wch: 10 }, // Số lượng
            { wch: 15 }, // Giá
            { wch: 15 }, // Thành tiền
            { wch: 15 }, // Khách đã trả
            { wch: 15 }, // Còn nợ
            { wch: 25 }, // Ghi chú
        ];

        const range = XLSX.utils.decode_range(ws['!ref']!);

        for (let R = 0; R <= range.e.r; ++R) {
            for (let C = 0; C <= range.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellRef] && R === 0) ws[cellRef] = { v: '', t: 's' };
                if (!ws[cellRef]) continue;

                const cell = ws[cellRef];

                if (R === 0) {
                    cell.s = { ...headerRowStyle };
                } else {
                    const isNum = [6, 7, 8, 9, 10].includes(C);
                    cell.s = {
                        font: { name: 'Arial', sz: 10 },
                        alignment: { horizontal: isNum && C !== 6 ? 'right' : (C === 6 ? 'center' : 'left'), vertical: 'center' },
                        border: {
                            top: { style: 'thin', color: { rgb: 'E0E0E0' } },
                            bottom: { style: 'thin', color: { rgb: 'E0E0E0' } },
                            left: { style: 'thin', color: { rgb: 'E0E0E0' } },
                            right: { style: 'thin', color: { rgb: 'E0E0E0' } }
                        }
                    };
                    
                    if (rowBgColors[R] && rowBgColors[R] !== 'FFFFFF') {
                        cell.s.fill = { fgColor: { rgb: rowBgColors[R] } };
                    }

                    if (isNum && typeof cell.v === 'number') {
                         if (C === 6) {
                             cell.z = '#,##0.##';
                         } else {
                             cell.z = '#,##0';
                         }
                    }
                }
            }
        }

        XLSX.utils.book_append_sheet(wb, ws, isExport ? 'BaoCaoXuat' : 'BaoCaoNhap');
        XLSX.writeFile(wb, `${getFileNameWithPrefix(fileName)}.xlsx`);
    },

    exportReturnVoucherStyled: (item: any) => {
        const wb = XLSX.utils.book_new();
        const now = new Date();
        const currentDateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const returnDate = item.return_date ? new Date(item.return_date).toLocaleDateString('vi-VN') : '';

        const headerStyle = {
            font: { bold: true, name: 'Arial', sz: 10, color: { rgb: 'FFFFFF' } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            fill: { fgColor: { rgb: 'C00000' } },
            border: { top: { style: 'thin', color: { rgb: '000000' } }, bottom: { style: 'thin', color: { rgb: '000000' } }, left: { style: 'thin', color: { rgb: '000000' } }, right: { style: 'thin', color: { rgb: '000000' } } }
        };

        const wsData: any[][] = [
            [],
            [`Ngày lập: ${currentDateStr}`, null, null, 'PHIẾU TRẢ HÀNG'],
            [null, null, null, item.code],
            [],
            ['Khách hàng:', item.customer_name || '', null, 'Ngày trả:', returnDate],
            ['Đơn hàng gốc:', item.related_order_code || '', null, 'Lý do:', item.reason || ''],
            ['Phương thức xử lý:', item.handling_method || '', null, 'Người xử lý:', (item.assigned_user_names || []).join(', ') || item.handler_user || ''],
            ['Ghi chú:', item.notes || ''],
            [],
            ['STT', 'Mã hàng', 'Tên hàng', 'Đơn vị', 'Số lượng', 'Đơn giá', 'Thành tiền']
        ];

        const items = item.items || [];
        items.forEach((orderItem: any, idx: number) => {
            const qty = Number(orderItem.quantity || 0);
            const price = Number(orderItem.price || 0);
            wsData.push([
                idx + 1,
                orderItem.product?.sku || '',
                orderItem.product?.name || '',
                orderItem.product?.unit || '',
                qty,
                price,
                Math.round(qty * price)
            ]);
        });

        wsData.push([]);
        wsData.push([null, null, null, null, null, 'Tổng cộng:', item.total_amount || 0]);

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const range = XLSX.utils.decode_range(ws['!ref']!);

        // Title
        if (ws['D2']) ws['D2'].s = { font: { bold: true, sz: 16, name: 'Arial', color: { rgb: 'C00000' } }, alignment: { horizontal: 'center' } };
        if (ws['D3']) ws['D3'].s = { font: { bold: true, sz: 12, name: 'Arial', color: { rgb: '555555' } }, alignment: { horizontal: 'center' } };
        if (ws['A2']) ws['A2'].s = { font: { italic: true, sz: 10, name: 'Arial', color: { rgb: '555555' } } };

        ws['!merges'] = [
            { s: { r: 1, c: 3 }, e: { r: 1, c: 6 } },
            { s: { r: 2, c: 3 }, e: { r: 2, c: 6 } },
        ];

        ws['!cols'] = [
            { wch: 5 }, { wch: 15 }, { wch: 35 }, { wch: 10 }, { wch: 10 }, { wch: 15 }, { wch: 18 }
        ];

        const headerRow = 9; // 0-indexed row 9
        for (let R = headerRow; R <= range.e.r; ++R) {
            for (let C = 0; C <= 6; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' };
                const cell = ws[cellRef];

                if (R === headerRow) {
                    cell.s = headerStyle;
                } else if (R === range.e.r) {
                    // Total row
                    cell.s = {
                        font: { bold: true, name: 'Arial', sz: 11, color: C === 6 ? { rgb: 'C00000' } : undefined },
                        alignment: { horizontal: C === 6 ? 'right' : (C === 5 ? 'right' : 'left') }
                    };
                    if (C === 6 && typeof cell.v === 'number') cell.z = '#,##0';
                } else {
                    const isMoney = C >= 4;
                    cell.s = {
                        font: { name: 'Arial', sz: 10 },
                        alignment: { horizontal: isMoney ? 'right' : (C === 0 ? 'center' : 'left'), vertical: 'center' },
                        border: { bottom: { style: 'dotted', color: { rgb: 'CCCCCC' } } }
                    };
                    if (C === 1) cell.s.font.color = { rgb: '0066CC' };
                    if (isMoney && typeof cell.v === 'number') cell.z = '#,##0';
                }
            }
        }

        XLSX.utils.book_append_sheet(wb, ws, 'PhieuTraHang');
        XLSX.writeFile(wb, `${getFileNameWithPrefix(item.code)}_TraHang.xlsx`);
    },

    exportDebtAgingReport: (
        customerData: any[],
        saleData: any[],
        fileName: string,
        facilityName: string = 'Tất cả'
    ) => {
        const wb = XLSX.utils.book_new();
        const now = new Date();
        const currentDateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        // Sheet 1: Công nợ theo Khách hàng
        const headerCustStyle = {
            font: { bold: true, name: 'Arial', sz: 10, color: { rgb: 'FFFFFF' } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            fill: { fgColor: { rgb: '1F4E78' } }, // Dark Blue
            border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
            }
        };

        const wsCustData: any[][] = [
            [],
            [`Ngày lập: ${currentDateStr}`, null, 'BÁO CÁO PHÂN TÍCH TUỔI NỢ THEO KHÁCH HÀNG'],
            [null, null, `Chi nhánh: ${facilityName}`],
            [],
            ['STT', 'Mã KH', 'Tên khách hàng', 'Sale phụ trách', 'Kỳ hạn thanh toán', 'Tổng nợ phải thu', 'Trong hạn', 'Quá hạn 1-7 ngày', 'Quá hạn 8-30 ngày', 'Quá hạn >30 ngày', 'Chi nhánh']
        ];

        let totalDebt = 0, totalInTerm = 0, total1to7 = 0, total8to30 = 0, totalOver30 = 0;

        customerData.forEach((item: any) => {
            totalDebt += Number(item['Tổng nợ']) || 0;
            totalInTerm += Number(item['Trong hạn']) || 0;
            total1to7 += Number(item['Quá hạn 1-7 ngày']) || 0;
            total8to30 += Number(item['Quá hạn 8-30 ngày']) || 0;
            totalOver30 += Number(item['Quá hạn >30 ngày']) || 0;

            wsCustData.push([
                item['STT'],
                item['Mã khách hàng'],
                item['Tên khách hàng'],
                item['Sale phụ trách'],
                item['Kỳ hạn thanh toán'],
                item['Tổng nợ'],
                item['Trong hạn'] || 0,
                item['Quá hạn 1-7 ngày'] || 0,
                item['Quá hạn 8-30 ngày'] || 0,
                item['Quá hạn >30 ngày'] || 0,
                item['Chi nhánh']
            ]);
        });

        // Summary row
        wsCustData.push([]);
        wsCustData.push([
            null, null, 'TỔNG CỘNG', null, null,
            totalDebt,
            totalInTerm,
            total1to7,
            total8to30,
            totalOver30,
            null
        ]);

        const wsCust = XLSX.utils.aoa_to_sheet(wsCustData);
        const rangeCust = XLSX.utils.decode_range(wsCust['!ref']!);

        // Title formatting
        wsCust['C2'].s = { font: { bold: true, sz: 14, name: 'Arial', color: { rgb: '1F4E78' } }, alignment: { horizontal: 'center' } };
        wsCust['A2'].s = { font: { italic: true, sz: 10, name: 'Arial', color: { rgb: '555555' } } };
        wsCust['C3'].s = { alignment: { horizontal: 'center' }, font: { name: 'Arial', sz: 10, italic: true } };

        wsCust['!merges'] = [
            { s: { r: 1, c: 2 }, e: { r: 1, c: 9 } },
            { s: { r: 2, c: 2 }, e: { r: 2, c: 9 } },
        ];

        wsCust['!cols'] = [
            { wch: 5 }, { wch: 12 }, { wch: 30 }, { wch: 20 }, { wch: 20 },
            { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 20 }
        ];

        const headerRowCust = 4;
        for (let R = headerRowCust; R <= rangeCust.e.r; ++R) {
            for (let C = 0; C <= 10; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                if (!wsCust[cellRef] && R === headerRowCust) wsCust[cellRef] = { v: '', t: 's' };
                if (!wsCust[cellRef]) continue;
                const cell = wsCust[cellRef];

                if (R === headerRowCust) {
                    cell.s = headerCustStyle;
                } else if (R === rangeCust.e.r) {
                    // Total Row
                    cell.s = {
                        font: { bold: true, name: 'Arial', sz: 11 },
                        alignment: { horizontal: C >= 5 ? 'right' : 'left' }
                    };
                    if (C >= 5 && typeof cell.v === 'number') {
                        cell.z = '#,##0';
                        if (C === 9) cell.s.font.color = { rgb: 'C00000' }; // Over30 (red)
                        if (C === 8) cell.s.font.color = { rgb: 'E26B0A' }; // 8to30 (orange)
                        if (C === 6) cell.s.font.color = { rgb: '00B050' }; // inTerm (green)
                    }
                } else if (R > headerRowCust && R < rangeCust.e.r - 1) {
                    // Data Row
                    const isMoney = C >= 5 && C <= 9;
                    cell.s = {
                        font: { name: 'Arial', sz: 10 },
                        alignment: { horizontal: C === 0 ? 'center' : (isMoney ? 'right' : 'left'), vertical: 'center' },
                        border: { bottom: { style: 'dotted', color: { rgb: 'CCCCCC' } } }
                    };

                    if (R % 2 !== 0) cell.s.fill = { fgColor: { rgb: 'F9FBFD' } };

                    if (C === 2) cell.s.font.color = { rgb: '0066CC' };
                    if (isMoney && typeof cell.v === 'number') {
                        cell.z = '#,##0';
                        if (cell.v > 0) {
                            if (C === 9) cell.s.font.color = { rgb: 'C00000' };
                            if (C === 8) cell.s.font.color = { rgb: 'E26B0A' };
                            if (C === 7) cell.s.font.color = { rgb: 'FFC000' };
                            if (C === 6) cell.s.font.color = { rgb: '00B050' };
                        }
                    }
                }
            }
        }

        XLSX.utils.book_append_sheet(wb, wsCust, 'TuoiNoKhachHang');

        // Sheet 2: Công nợ theo Sale
        const headerSaleStyle = {
            font: { bold: true, name: 'Arial', sz: 10, color: { rgb: 'FFFFFF' } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            fill: { fgColor: { rgb: '333F48' } }, // Slate/Dark grey
            border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
            }
        };

        const wsSaleData: any[][] = [
            [],
            [`Ngày lập: ${currentDateStr}`, null, 'TỔNG HỢP CÔNG NỢ THEO NHÂN VIÊN SALE'],
            [null, null, `Chi nhánh: ${facilityName}`],
            [],
            ['STT', 'Nhân viên Sale', 'Số khách hàng nợ', 'Tổng nợ quản lý', 'Trong hạn', 'Quá hạn 1-7 ngày', 'Quá hạn 8-30 ngày', 'Quá hạn >30 ngày']
        ];

        let sCust = 0, sDebt = 0, sIn = 0, s1 = 0, s8 = 0, sOver = 0;
        saleData.forEach((item: any) => {
            sCust += Number(item['Số khách hàng nợ']) || 0;
            sDebt += Number(item['Tổng nợ quản lý']) || 0;
            sIn += Number(item['Trong hạn']) || 0;
            s1 += Number(item['Quá hạn 1-7 ngày']) || 0;
            s8 += Number(item['Quá hạn 8-30 ngày']) || 0;
            sOver += Number(item['Quá hạn >30 ngày']) || 0;

            wsSaleData.push([
                item['STT'],
                item['Nhân viên Sale'],
                item['Số khách hàng nợ'],
                item['Tổng nợ quản lý'],
                item['Trong hạn'] || 0,
                item['Quá hạn 1-7 ngày'] || 0,
                item['Quá hạn 8-30 ngày'] || 0,
                item['Quá hạn >30 ngày'] || 0
            ]);
        });

        // Summary row
        wsSaleData.push([]);
        wsSaleData.push([
            null, 'TỔNG CỘNG', sCust, sDebt, sIn, s1, s8, sOver
        ]);

        const wsSale = XLSX.utils.aoa_to_sheet(wsSaleData);
        const rangeSale = XLSX.utils.decode_range(wsSale['!ref']!);

        wsSale['C2'].s = { font: { bold: true, sz: 14, name: 'Arial', color: { rgb: '333F48' } }, alignment: { horizontal: 'center' } };
        wsSale['A2'].s = { font: { italic: true, sz: 10, name: 'Arial', color: { rgb: '555555' } } };
        wsSale['C3'].s = { alignment: { horizontal: 'center' }, font: { name: 'Arial', sz: 10, italic: true } };

        wsSale['!merges'] = [
            { s: { r: 1, c: 2 }, e: { r: 1, c: 7 } },
            { s: { r: 2, c: 2 }, e: { r: 2, c: 7 } },
        ];

        wsSale['!cols'] = [
            { wch: 5 }, { wch: 25 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }, { wch: 18 }
        ];

        const headerRowSale = 4;
        for (let R = headerRowSale; R <= rangeSale.e.r; ++R) {
            for (let C = 0; C <= 7; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                if (!wsSale[cellRef] && R === headerRowSale) wsSale[cellRef] = { v: '', t: 's' };
                if (!wsSale[cellRef]) continue;
                const cell = wsSale[cellRef];

                if (R === headerRowSale) {
                    cell.s = headerSaleStyle;
                } else if (R === rangeSale.e.r) {
                    cell.s = {
                        font: { bold: true, name: 'Arial', sz: 11 },
                        alignment: { horizontal: C >= 2 ? 'right' : 'left' }
                    };
                    if (C >= 2 && typeof cell.v === 'number') {
                        cell.z = C === 2 ? '#,##0' : '#,##0';
                        if (C === 7) cell.s.font.color = { rgb: 'C00000' };
                        if (C === 6) cell.s.font.color = { rgb: 'E26B0A' };
                        if (C === 4) cell.s.font.color = { rgb: '00B050' };
                    }
                } else if (R > headerRowSale && R < rangeSale.e.r - 1) {
                    const isMoney = C >= 3;
                    cell.s = {
                        font: { name: 'Arial', sz: 10 },
                        alignment: { horizontal: C === 0 || C === 2 ? 'center' : (isMoney ? 'right' : 'left'), vertical: 'center' },
                        border: { bottom: { style: 'dotted', color: { rgb: 'CCCCCC' } } }
                    };
                    if (R % 2 !== 0) cell.s.fill = { fgColor: { rgb: 'F5F7FA' } };

                    if (C === 1) cell.s.font.bold = true;
                    if (isMoney && typeof cell.v === 'number') {
                        cell.z = '#,##0';
                        if (cell.v > 0) {
                            if (C === 7) cell.s.font.color = { rgb: 'C00000' };
                            if (C === 6) cell.s.font.color = { rgb: 'E26B0A' };
                            if (C === 5) cell.s.font.color = { rgb: 'FFC000' };
                            if (C === 4) cell.s.font.color = { rgb: '00B050' };
                        }
                    }
                }
            }
        }

        XLSX.utils.book_append_sheet(wb, wsSale, 'TongHopTheoSale');

        XLSX.writeFile(wb, `${getFileNameWithPrefix(fileName)}.xlsx`);
    },

    exportReturnVouchersListStyled: (data: any[], facilityName: string = 'Tất cả') => {
        const wb = XLSX.utils.book_new();
        const now = new Date();
        const currentDateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const headerStyle = {
            font: { bold: true, name: 'Arial', sz: 10, color: { rgb: 'FFFFFF' } },
            alignment: { horizontal: 'center', vertical: 'center' },
            fill: { fgColor: { rgb: 'C00000' } },
            border: { top: { style: 'thin', color: { rgb: '000000' } }, bottom: { style: 'thin', color: { rgb: '000000' } }, left: { style: 'thin', color: { rgb: '000000' } }, right: { style: 'thin', color: { rgb: '000000' } } }
        };

        const wsData: any[][] = [
            [],
            [`Ngày lập: ${currentDateStr}`, null, 'BÁO CÁO TRẢ HÀNG'],
            [null, null, `Chi nhánh: ${facilityName}`],
            [],
            ['STT', 'Mã phiếu', 'Khách hàng', 'Ngày trả', 'Đơn hàng gốc', 'Lý do', 'Phương thức xử lý', 'Người xử lý', 'Tổng tiền']
        ];

        let totalAmount = 0;
        data.forEach((item: any, idx: number) => {
            const amount = Number(item.total_amount || 0);
            totalAmount += amount;
            wsData.push([
                idx + 1,
                item.code,
                item.customer_name || '',
                item.return_date ? new Date(item.return_date).toLocaleDateString('vi-VN') : '',
                item.related_order_code || '',
                item.reason || '',
                item.handling_method || '',
                (item.assigned_user_names || []).join(', ') || item.handler_user || '',
                amount
            ]);
        });

        wsData.push([]);
        wsData.push([null, null, null, null, null, null, null, 'Tổng cộng:', totalAmount]);

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const range = XLSX.utils.decode_range(ws['!ref']!);

        if (ws['C2']) ws['C2'].s = { font: { bold: true, sz: 14, name: 'Arial', color: { rgb: 'C00000' } }, alignment: { horizontal: 'center' } };
        if (ws['A2']) ws['A2'].s = { font: { italic: true, sz: 10, name: 'Arial', color: { rgb: '555555' } } };
        if (ws['C3']) ws['C3'].s = { alignment: { horizontal: 'center' }, font: { name: 'Arial', sz: 10, italic: true } };

        ws['!merges'] = [
            { s: { r: 1, c: 2 }, e: { r: 1, c: 8 } },
            { s: { r: 2, c: 2 }, e: { r: 2, c: 8 } },
        ];

        ws['!cols'] = [
            { wch: 5 }, { wch: 18 }, { wch: 28 }, { wch: 12 },
            { wch: 18 }, { wch: 25 }, { wch: 22 }, { wch: 22 }, { wch: 18 }
        ];

        const headerRow = 4;
        for (let R = headerRow; R <= range.e.r; ++R) {
            for (let C = 0; C <= 8; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellRef]) ws[cellRef] = { v: '', t: 's' };
                const cell = ws[cellRef];

                if (R === headerRow) {
                    cell.s = headerStyle;
                } else if (R === range.e.r) {
                    cell.s = {
                        font: { bold: true, name: 'Arial', sz: 11, color: C === 8 ? { rgb: 'C00000' } : undefined },
                        alignment: { horizontal: C === 7 ? 'right' : (C === 8 ? 'right' : 'left') }
                    };
                    if (C === 8 && typeof cell.v === 'number') cell.z = '#,##0';
                } else if (R > headerRow && R < range.e.r - 1) {
                    cell.s = {
                        font: { name: 'Arial', sz: 10 },
                        alignment: { horizontal: C === 0 ? 'center' : (C === 8 ? 'right' : 'left'), vertical: 'center' },
                        border: { bottom: { style: 'dotted', color: { rgb: 'CCCCCC' } } }
                    };
                    if (R % 2 !== 0) cell.s.fill = { fgColor: { rgb: 'FFF5F5' } };
                    if (C === 1) cell.s.font.color = { rgb: '0066CC' };
                    if (C === 8 && typeof cell.v === 'number') {
                        cell.z = '#,##0';
                        cell.s.font.color = { rgb: 'C00000' };
                    }
                }
            }
        }

        XLSX.utils.book_append_sheet(wb, ws, 'BaoCaoTraHang');
        XLSX.writeFile(wb, `${getFileNameWithPrefix('BaoCao_TraHang_' + now.getDate().toString().padStart(2, '0'))}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getFullYear()}.xlsx`);
    },

    exportFinancialTransactionsStyled: (
        data: any[],
        fileName: string,
        facilityName: string = 'Tất cả'
    ) => {
        const wb = XLSX.utils.book_new();
        const now = new Date();
        const currentDateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;

        const headerRowStyle = {
            font: { bold: true, name: 'Arial', sz: 10, color: { rgb: 'FFFFFF' } },
            alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
            fill: { type: 'pattern', pattern: 'solid', fgColor: { rgb: '1F4E78' } }, // Professional Dark Blue
            border: {
                top: { style: 'thin', color: { rgb: '000000' } },
                bottom: { style: 'thin', color: { rgb: '000000' } },
                left: { style: 'thin', color: { rgb: '000000' } },
                right: { style: 'thin', color: { rgb: '000000' } }
            }
        };

        const titleStyle = {
            font: { bold: true, sz: 16, name: 'Arial', color: { rgb: '1F4E78' } },
            alignment: { horizontal: 'center' }
        };

        const wsData: any[][] = [
            [],
            [`Ngày lập: ${currentDateStr}`, null, null, 'DANH SÁCH THU CHI PHÁT SINH'],
            [null, null, null, `Chi nhánh: ${facilityName}`],
            [],
            ['STT', 'Mã phiếu', 'Thời gian', 'Loại', 'Mô tả', 'Người nộp/nhận', 'Chi nhánh', 'Tài khoản', 'Nhân viên', 'Danh mục', 'Giá trị']
        ];

        let totalIncome = 0;
        let totalExpense = 0;

        const rows = data.map((item, index) => {
            const amount = Number(item['Giá trị'] || 0);
            const isIncome = item['Loại'] === 'Thu';
            if (isIncome) {
                totalIncome += Math.abs(amount);
            } else {
                totalExpense += Math.abs(amount);
            }

            return [
                index + 1,
                item['Mã phiếu'] || '',
                item['Thời gian'] || '',
                item['Loại'] || '',
                item['Mô tả'] || '',
                item['Người nộp/nhận'] || '',
                item['Chi nhánh'] || '',
                item['Tài khoản'] || '',
                item['Nhân viên'] || '',
                item['Danh mục'] || '',
                amount
            ];
        });

        wsData.push(...rows);

        // Add summary at the bottom
        const summaryStartRow = 5 + data.length;
        wsData.push([]);
        wsData.push([null, null, null, 'Tổng thu:', null, null, null, null, null, null, totalIncome]);
        wsData.push([null, null, null, 'Tổng chi:', null, null, null, null, null, null, totalExpense]);
        wsData.push([null, null, null, 'Thu thuần (Chênh lệch):', null, null, null, null, null, null, totalIncome - totalExpense]);

        const ws = XLSX.utils.aoa_to_sheet(wsData);
        const range = XLSX.utils.decode_range(ws['!ref']!);

        // Styling
        ws['D2'].s = titleStyle;
        ws['D3'].s = { alignment: { horizontal: 'center' }, font: { name: 'Arial', sz: 10, italic: true } };
        ws['A2'].s = { font: { italic: true, sz: 10, name: 'Arial', color: { rgb: '555555' } }, alignment: { horizontal: 'left' } };

        ws['!merges'] = [
            { s: { r: 1, c: 3 }, e: { r: 1, c: 7 } }, // Title
            { s: { r: 2, c: 3 }, e: { r: 2, c: 7 } }, // Facility
            // Merge summary label columns (e.g. columns D to J) for readability
            { s: { r: summaryStartRow + 1, c: 3 }, e: { r: summaryStartRow + 1, c: 9 } },
            { s: { r: summaryStartRow + 2, c: 3 }, e: { r: summaryStartRow + 2, c: 9 } },
            { s: { r: summaryStartRow + 3, c: 3 }, e: { r: summaryStartRow + 3, c: 9 } },
        ];

        ws['!cols'] = [
            { wch: 6 },   // STT
            { wch: 18 },  // Mã phiếu
            { wch: 18 },  // Thời gian
            { wch: 8 },   // Loại
            { wch: 30 },  // Mô tả
            { wch: 25 },  // Người nộp/nhận
            { wch: 18 },  // Chi nhánh
            { wch: 18 },  // Tài khoản
            { wch: 20 },  // Nhân viên
            { wch: 18 },  // Danh mục
            { wch: 18 },  // Giá trị
        ];

        for (let R = 4; R <= range.e.r; ++R) {
            for (let C = 0; C <= range.e.c; ++C) {
                const cellRef = XLSX.utils.encode_cell({ r: R, c: C });
                if (!ws[cellRef] && R === 4) ws[cellRef] = { v: '', t: 's' };
                if (!ws[cellRef]) continue;

                const cell = ws[cellRef];

                if (R === 4) { // Table Header
                    cell.s = headerRowStyle;
                } else if (R >= 5 && R < 5 + data.length) { // Data rows
                    const isNum = C === 0;
                    const isMoney = C === 10;

                    cell.s = {
                        font: { name: 'Arial', sz: 10 },
                        alignment: { 
                            horizontal: isNum ? 'center' : (isMoney ? 'right' : 'left'), 
                            vertical: 'center' 
                        },
                        border: {
                            top: { style: 'thin', color: { rgb: 'D9D9D9' } },
                            bottom: { style: 'thin', color: { rgb: 'D9D9D9' } },
                            left: { style: 'thin', color: { rgb: 'D9D9D9' } },
                            right: { style: 'thin', color: { rgb: 'D9D9D9' } }
                        }
                    };

                    if (R % 2 !== 0) cell.s.fill = { fgColor: { rgb: 'F5F7FA' } }; // Alternating rows

                    if (C === 1) cell.s.font.color = { rgb: '0066CC' }; // Mã phiếu color

                    if (C === 3) { // Loại (Thu / Chi)
                        cell.s.font.bold = true;
                        cell.s.alignment.horizontal = 'center';
                        if (cell.v === 'Thu') cell.s.font.color = { rgb: '00B050' }; // Xanh lá
                        else cell.s.font.color = { rgb: 'C00000' }; // Đỏ
                    }

                    if (isMoney && typeof cell.v === 'number') {
                        cell.z = '#,##0'; // format money
                        if (cell.v > 0) {
                            cell.s.font.color = { rgb: '00B050' };
                        } else {
                            cell.s.font.color = { rgb: 'C00000' };
                        }
                    }
                } else if (R >= summaryStartRow + 1 && R <= summaryStartRow + 3) {
                    // Summary rows style
                    cell.s = {
                        font: { bold: true, name: 'Arial', sz: 10 },
                        alignment: { horizontal: C === 3 ? 'right' : 'left' }
                    };
                    
                    if (C === 10) {
                        cell.s.alignment.horizontal = 'right';
                        cell.z = '#,##0';
                        if (R === summaryStartRow + 1) cell.s.font.color = { rgb: '00B050' }; // Tổng thu màu xanh
                        if (R === summaryStartRow + 2) cell.s.font.color = { rgb: 'C00000' }; // Tổng chi màu đỏ
                        if (R === summaryStartRow + 3) {
                            cell.s.font.sz = 11;
                            if (cell.v >= 0) cell.s.font.color = { rgb: '00B050' };
                            else cell.s.font.color = { rgb: 'C00000' };
                        }
                    }
                }
            }
        }

        XLSX.utils.book_append_sheet(wb, ws, 'BaoCaoThuChi');
        XLSX.writeFile(wb, `${getFileNameWithPrefix(fileName)}.xlsx`);
    },

    exportIncomeExpenseVoucherStyled: (item: any) => {
        const wb = XLSX.utils.book_new();
        const now = new Date();
        const currentDateStr = `${now.getDate().toString().padStart(2, '0')}/${(now.getMonth() + 1).toString().padStart(2, '0')}/${now.getFullYear()} ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
        const company = getCompanyInfo();
        
        const isIncome = item.type === 'INCOME';
        const titleText = isIncome ? 'PHIẾU THU' : 'PHIẾU CHI';
        const titleColor = isIncome ? '00B050' : 'C00000'; // Green for Income, Red for Expense
        const bankLine = company.bankInfo
            ? `NH: ${company.bankInfo.bankName}${company.bankInfo.branch ? ' - ' + company.bankInfo.branch : ''} | STK: ${company.bankInfo.accountNumber} | CTK: ${company.bankInfo.accountHolder}`
            : '';

        const labelStyle = {
            font: { bold: true, name: 'Arial', sz: 10 },
            alignment: { horizontal: 'left' }
        };

        const valueStyle = {
            font: { name: 'Arial', sz: 10 },
            alignment: { horizontal: 'left' }
        };

        const wsData: any[][] = [
            [company.name, null, null, titleText],
            [`${company.address} | ĐT: ${company.phone}${company.taxCode ? ' | MST: ' + company.taxCode : ''}`, null, null, item.code],
            [],
            [`Ngày lập: ${currentDateStr}`],
            [],
            [isIncome ? 'Người nộp tiền:' : 'Người nhận tiền:', item.partner_name || 'N/A'],
            ['Ngày giao dịch:', item.transaction_date ? new Date(item.transaction_date).toLocaleDateString('vi-VN') : ''],
            ['Tài khoản:', item.account_name || 'N/A', null, 'Hạng mục:', item.category || 'N/A'],
            ['Nhân viên:', item.employee_names?.join(', ') || 'N/A'],
            ['Lý do thu/chi:', item.description || ''],
            [],
            ['Số tiền:', item.amount || 0],
            ['Bằng chữ:', numberToWords(item.amount || 0)],
            [],
            ...(bankLine ? [['Thông tin NH:', bankLine]] : []),
        ];

        const ws = XLSX.utils.aoa_to_sheet(wsData);

        // Title styling (r0 = company name + title, r1 = address + code, r3 = date)
        const titleRef = XLSX.utils.encode_cell({ r: 0, c: 3 });
        const codeRef = XLSX.utils.encode_cell({ r: 1, c: 3 });
        const companyNameRef = XLSX.utils.encode_cell({ r: 0, c: 0 });
        const addressRef = XLSX.utils.encode_cell({ r: 1, c: 0 });
        const dateRef = XLSX.utils.encode_cell({ r: 3, c: 0 });
        if (ws[titleRef]) ws[titleRef].s = { font: { bold: true, sz: 16, name: 'Arial', color: { rgb: titleColor } }, alignment: { horizontal: 'center' } };
        if (ws[codeRef]) ws[codeRef].s = { font: { bold: true, sz: 12, name: 'Arial', color: { rgb: '555555' } }, alignment: { horizontal: 'center' } };
        if (ws[companyNameRef]) ws[companyNameRef].s = { font: { bold: true, sz: 11, name: 'Arial' }, alignment: { horizontal: 'left' } };
        if (ws[addressRef]) ws[addressRef].s = { font: { italic: true, sz: 9, name: 'Arial', color: { rgb: '555555' } }, alignment: { horizontal: 'left' } };
        if (ws[dateRef]) ws[dateRef].s = { font: { italic: true, sz: 10, name: 'Arial', color: { rgb: '555555' } } };

        ws['!merges'] = [
            { s: { r: 0, c: 0 }, e: { r: 0, c: 2 } },  // Company name merge
            { s: { r: 0, c: 3 }, e: { r: 0, c: 6 } },  // Title merge
            { s: { r: 1, c: 0 }, e: { r: 1, c: 2 } },  // Address merge
            { s: { r: 1, c: 3 }, e: { r: 1, c: 6 } },  // Code merge
            { s: { r: 3, c: 0 }, e: { r: 3, c: 6 } },  // Date merge
            { s: { r: 5, c: 1 }, e: { r: 5, c: 6 } },  // Partner merge
            { s: { r: 6, c: 1 }, e: { r: 6, c: 6 } },  // Date merge
            { s: { r: 8, c: 1 }, e: { r: 8, c: 6 } },  // Employee merge
            { s: { r: 9, c: 1 }, e: { r: 9, c: 6 } },  // Description merge
            { s: { r: 12, c: 1 }, e: { r: 12, c: 6 } }, // Words merge
            ...(bankLine ? [{ s: { r: 14, c: 1 }, e: { r: 14, c: 6 } }] : []), // Bank info merge
        ];

        ws['!cols'] = [
            { wch: 18 }, { wch: 25 }, { wch: 10 }, { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 }
        ];

        // Format individual cells
        const labelRows = [5, 6, 7, 8, 9, 11, 12];
        labelRows.forEach(r => {
            const cellRefLabel = XLSX.utils.encode_cell({ r, c: 0 });
            if (ws[cellRefLabel]) ws[cellRefLabel].s = labelStyle;
            
            const cellRefValue = XLSX.utils.encode_cell({ r, c: 1 });
            if (ws[cellRefValue]) {
                if (r === 11) { // Money amount row
                    ws[cellRefValue].s = { font: { bold: true, sz: 12, name: 'Arial', color: { rgb: titleColor } }, alignment: { horizontal: 'left' } };
                    ws[cellRefValue].z = '#,##0 "\u20ab"';
                } else if (r === 12) { // Words row
                    ws[cellRefValue].s = { font: { italic: true, name: 'Arial', sz: 10 }, alignment: { horizontal: 'left' } };
                } else {
                    ws[cellRefValue].s = valueStyle;
                }
            }
        });

        // Hạng mục label and value (row 7)
        const cellRefCatLabel = XLSX.utils.encode_cell({ r: 7, c: 3 });
        if (ws[cellRefCatLabel]) ws[cellRefCatLabel].s = labelStyle;
        const cellRefCatValue = XLSX.utils.encode_cell({ r: 7, c: 4 });
        if (ws[cellRefCatValue]) ws[cellRefCatValue].s = valueStyle;

        // Bank info row styling
        if (bankLine) {
            const bankLabelRef = XLSX.utils.encode_cell({ r: 14, c: 0 });
            const bankValueRef = XLSX.utils.encode_cell({ r: 14, c: 1 });
            if (ws[bankLabelRef]) ws[bankLabelRef].s = labelStyle;
            if (ws[bankValueRef]) ws[bankValueRef].s = { font: { name: 'Arial', sz: 9, italic: true, color: { rgb: '555555' } }, alignment: { horizontal: 'left' } };
        }

        XLSX.utils.book_append_sheet(wb, ws, titleText);
        XLSX.writeFile(wb, `${getFileNameWithPrefix(item.code)}.xlsx`);
    }
};
