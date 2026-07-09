import React, { useState, useRef, useEffect } from 'react';
import * as XLSX from 'xlsx-js-style';
import { excelUtils } from '../../src/utils/excelUtils';
import { transactionService } from '../../src/services/transactionService';
import { partnerService } from '../../src/services/partnerService';
import { categoryService } from '../../src/services/categoryService';
import { userService } from '../../src/services/userService';
import { facilityService } from '../../src/services/facilityService';
import { accountService } from '../../src/services/accountService';
import { useBranch } from '../../contexts/BranchContext';
import { useNotification } from '../../contexts/NotificationContext';
import { TransactionType } from '../../types';

interface ImportTransactionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

interface ValidationError {
  row: number;
  field: string;
  value: string;
  message: string;
}

export const ImportTransactionsModal: React.FC<ImportTransactionsModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { showNotification } = useNotification();
  const { selectedFacilityId } = useBranch();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loadingResources, setLoadingResources] = useState(false);
  const [validating, setValidating] = useState(false);
  const [importing, setImporting] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [errors, setErrors] = useState<ValidationError[]>([]);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [parsedData, setParsedData] = useState<any[]>([]);

  // Resource lists for validation mapping
  const [accounts, setAccounts] = useState<any[]>([]);
  const [partners, setPartners] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [facilities, setFacilities] = useState<any[]>([]);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !importing) onClose();
    };
    if (isOpen) {
      window.addEventListener('keydown', handleEsc);
      loadResources();
    }
    return () => window.removeEventListener('keydown', handleEsc);
  }, [isOpen]);

  const loadResources = async () => {
    try {
      setLoadingResources(true);
      const [accs, pts, cats, usrs, facs] = await Promise.all([
        accountService.getAccounts(),
        partnerService.getPartners(),
        categoryService.getTransactionCategories(),
        userService.getUsers(),
        facilityService.getFacilities(),
      ]);

      // Only allow cash/bank accounts, exclude virtual debt accounts
      const cashAccounts = accs.filter(
        (acc) => acc.name !== 'TK KN' && acc.name !== 'TK Nợ NCC'
      );

      setAccounts(cashAccounts);
      setPartners(pts);
      setCategories(cats);
      setUsers(usrs);
      setFacilities(facs);
    } catch (error: any) {
      console.error('Error loading resources for import validation:', error);
      showNotification('Không thể tải dữ liệu kiểm tra hệ thống: ' + error.message, 'error');
    } finally {
      setLoadingResources(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      processFile(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      processFile(file);
    }
  };

  const downloadTemplate = () => {
    const headers = [
      'STT',
      'Mã phiếu',
      'Thời gian',
      'Loại',
      'Mô tả',
      'Người nộp/nhận',
      'Chi nhánh',
      'Tài khoản',
      'Nhân viên',
      'Danh mục',
      'Giá trị',
    ];
    const sampleData = [
      [
        1,
        '',
        '09/07/2026 11:00',
        'Thu',
        'Thu tiền hàng bán lẻ',
        partners[0]?.name || 'Nguyễn Văn Khách',
        facilities[0]?.name || 'Chi nhánh chính',
        accounts[0]?.name || 'Tiền mặt',
        users[0]?.full_name || 'Nguyễn Văn Admin',
        categories.find((c) => c.type === 'INCOME')?.name || 'Doanh thu bán hàng',
        150000,
      ],
      [
        2,
        '',
        '09/07/2026 14:30',
        'Chi',
        'Chi tiền mua văn phòng phẩm',
        '',
        facilities[0]?.name || 'Chi nhánh chính',
        accounts[0]?.name || 'Tiền mặt',
        users[0]?.full_name || 'Nguyễn Văn Admin',
        categories.find((c) => c.type === 'EXPENSE')?.name || 'Chi phí quản lý',
        500000,
      ],
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...sampleData]);
    const wb = XLSX.utils.book_new();

    // Simple header styling for template
    const headerStyle = {
      font: { bold: true, name: 'Arial', sz: 10, color: { rgb: 'FFFFFF' } },
      alignment: { horizontal: 'center', vertical: 'center' },
      fill: { type: 'pattern', pattern: 'solid', fgColor: { rgb: '1F4E78' } },
    };

    // Apply column widths
    ws['!cols'] = headers.map((h) => ({ wch: Math.max(h.length + 5, 15) }));

    const range = XLSX.utils.decode_range(ws['!ref']!);
    for (let C = 0; C <= range.e.c; ++C) {
      const cellRef = XLSX.utils.encode_cell({ r: 0, c: C });
      if (ws[cellRef]) ws[cellRef].s = headerStyle;
    }

    XLSX.utils.book_append_sheet(wb, ws, 'MauImport');
    XLSX.writeFile(wb, 'Mau_Import_Thu_Chi.xlsx');
  };

  const parseExcelDate = (dateVal: any): string | null => {
    if (!dateVal) return null;
    if (typeof dateVal === 'number') {
      const date = new Date(Math.round((dateVal - 25569) * 86400 * 1000));
      if (!isNaN(date.getTime())) return date.toISOString();
    }
    if (dateVal instanceof Date) {
      if (!isNaN(dateVal.getTime())) return dateVal.toISOString();
    }
    if (typeof dateVal === 'string') {
      const trimmed = dateVal.trim();
      // Match DD/MM/YYYY HH:mm:ss or DD/MM/YYYY HH:mm or DD/MM/YYYY
      const dmyRegex = /^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;
      const dmyMatch = trimmed.match(dmyRegex);
      if (dmyMatch) {
        const day = Number(dmyMatch[1]);
        const month = Number(dmyMatch[2]);
        const year = Number(dmyMatch[3]);
        const hour = dmyMatch[4] ? Number(dmyMatch[4]) : 12;
        const min = dmyMatch[5] ? Number(dmyMatch[5]) : 0;
        const sec = dmyMatch[6] ? Number(dmyMatch[6]) : 0;
        const date = new Date(year, month - 1, day, hour, min, sec);
        if (!isNaN(date.getTime())) return date.toISOString();
      }

      // Match YYYY-MM-DD HH:mm:ss or YYYY-MM-DD
      const ymdRegex = /^(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?$/;
      const ymdMatch = trimmed.match(ymdRegex);
      if (ymdMatch) {
        const year = Number(ymdMatch[1]);
        const month = Number(ymdMatch[2]);
        const day = Number(ymdMatch[3]);
        const hour = ymdMatch[4] ? Number(ymdMatch[4]) : 12;
        const min = ymdMatch[5] ? Number(ymdMatch[5]) : 0;
        const sec = ymdMatch[6] ? Number(ymdMatch[6]) : 0;
        const date = new Date(year, month - 1, day, hour, min, sec);
        if (!isNaN(date.getTime())) return date.toISOString();
      }

      const parsed = new Date(trimmed);
      if (!isNaN(parsed.getTime())) return parsed.toISOString();
    }
    return null;
  };

  const processFile = async (file: File) => {
    setFileName(file.name);
    setErrors([]);
    setParsedData([]);
    setValidating(true);

    try {
      const data = await excelUtils.readExcel(file);
      if (!data || data.length === 0) {
        setErrors([
          {
            row: 0,
            field: 'File',
            value: '',
            message: 'Tệp Excel trống hoặc không đúng cấu trúc mẫu.',
          },
        ]);
        return;
      }

      // Perform validation
      const validationErrors: ValidationError[] = [];
      const validPayloads: any[] = [];

      data.forEach((row: any, index: number) => {
        const rowNum = index + 2; // Row number in Excel sheet (1-based + 1 header)

        // 1. Validate 'Loại' (Thu / Chi)
        const typeStr = String(row['Loại'] || '').trim();
        let type: TransactionType | null = null;
        if (typeStr.toLowerCase() === 'thu') {
          type = TransactionType.INCOME;
        } else if (typeStr.toLowerCase() === 'chi') {
          type = TransactionType.EXPENSE;
        } else {
          validationErrors.push({
            row: rowNum,
            field: 'Loại',
            value: typeStr,
            message: "Loại giao dịch không hợp lệ. Phải là 'Thu' hoặc 'Chi'.",
          });
        }

        // 2. Validate 'Thời gian' (Ngày giao dịch)
        const rawDate = row['Thời gian'];
        const transactionDate = parseExcelDate(rawDate);
        if (!transactionDate) {
          validationErrors.push({
            row: rowNum,
            field: 'Thời gian',
            value: String(rawDate || ''),
            message: 'Định dạng ngày giao dịch không hợp lệ (ví dụ đúng: 09/07/2026 11:00).',
          });
        }

        // 3. Validate 'Giá trị' (Số tiền)
        const rawAmount = row['Giá trị'];
        const amount = Math.abs(Number(rawAmount));
        if (isNaN(amount) || amount <= 0) {
          validationErrors.push({
            row: rowNum,
            field: 'Giá trị',
            value: String(rawAmount || ''),
            message: 'Giá trị (số tiền) phải là số dương lớn hơn 0.',
          });
        }

        // 4. Validate 'Tài khoản'
        const accountName = String(row['Tài khoản'] || '').trim();
        const matchedAccount = accounts.find(
          (acc) => acc.name.toLowerCase() === accountName.toLowerCase()
        );

        if (!accountName) {
          validationErrors.push({
            row: rowNum,
            field: 'Tài khoản',
            value: '',
            message: 'Tên tài khoản không được để trống.',
          });
        } else if (accountName === 'TK KN' || accountName === 'TK Nợ NCC') {
          validationErrors.push({
            row: rowNum,
            field: 'Tài khoản',
            value: accountName,
            message: `Tài khoản công nợ '${accountName}' không được sử dụng để import trực tiếp.`,
          });
        } else if (!matchedAccount) {
          validationErrors.push({
            row: rowNum,
            field: 'Tài khoản',
            value: accountName,
            message: `Tài khoản '${accountName}' không tồn tại trên hệ thống hoặc không đúng loại.`,
          });
        }

        // 5. Validate 'Danh mục'
        const categoryName = String(row['Danh mục'] || '').trim();
        const matchedCategory = categories.find(
          (c) => c.name.toLowerCase() === categoryName.toLowerCase()
        );
        if (!categoryName) {
          validationErrors.push({
            row: rowNum,
            field: 'Danh mục',
            value: '',
            message: 'Danh mục thu/chi không được để trống.',
          });
        } else if (!matchedCategory) {
          validationErrors.push({
            row: rowNum,
            field: 'Danh mục',
            value: categoryName,
            message: `Danh mục '${categoryName}' không tồn tại trên hệ thống.`,
          });
        }

        // 6. Validate 'Người nộp/nhận' (Đối tác - Không bắt buộc)
        const partnerName = String(row['Người nộp/nhận'] || '').trim();
        let partnerId: string | undefined = undefined;
        if (partnerName) {
          const matchedPartner = partners.find(
            (p) => p.name.toLowerCase() === partnerName.toLowerCase()
          );
          if (!matchedPartner) {
            validationErrors.push({
              row: rowNum,
              field: 'Người nộp/nhận',
              value: partnerName,
              message: `Đối tác '${partnerName}' không tồn tại trên hệ thống.`,
            });
          } else {
            partnerId = matchedPartner.id;
          }
        }

        // 7. Validate 'Chi nhánh'
        const facilityName = String(row['Chi nhánh'] || '').trim();
        let facilityId = selectedFacilityId || '';
        if (facilityName) {
          const matchedFacility = facilities.find(
            (f) => f.name.toLowerCase() === facilityName.toLowerCase()
          );
          if (!matchedFacility) {
            validationErrors.push({
              row: rowNum,
              field: 'Chi nhánh',
              value: facilityName,
              message: `Chi nhánh '${facilityName}' không tồn tại trên hệ thống.`,
            });
          } else {
            facilityId = matchedFacility.id;
          }
        }

        // 8. Validate 'Nhân viên'
        const employeeNamesStr = String(row['Nhân viên'] || '').trim();
        const assignedUserIds: string[] = [];
        if (employeeNamesStr) {
          const empNames = employeeNamesStr.split(',').map((name) => name.trim());
          for (const name of empNames) {
            const matchedUser = users.find(
              (u) => u.full_name.toLowerCase() === name.toLowerCase()
            );
            if (!matchedUser) {
              validationErrors.push({
                row: rowNum,
                field: 'Nhân viên',
                value: name,
                message: `Nhân viên '${name}' không tồn tại trên hệ thống.`,
              });
            } else {
              assignedUserIds.push(String(matchedUser.id));
            }
          }
        }

        // If no errors for this row, collect for insertion
        if (type && transactionDate && !isNaN(amount) && matchedAccount && matchedCategory && facilityId) {
          validPayloads.push({
            type,
            amount,
            categoryId: matchedCategory.id,
            description: String(row['Mô tả'] || '').trim() || `Import bulk từ file ${file.name}`,
            partnerId,
            accountId: matchedAccount.id,
            assignedUserIds,
            transactionDate,
            facilityId,
          });
        }
      });

      setErrors(validationErrors);
      if (validationErrors.length === 0) {
        setParsedData(validPayloads);
        showNotification(
          `Kiểm tra tệp thành công! Không phát hiện lỗi. Sẵn sàng import ${validPayloads.length} dòng.`,
          'success'
        );
      } else {
        showNotification(
          `Tìm thấy ${validationErrors.length} lỗi trong tệp Excel. Vui lòng kiểm tra lại.`,
          'error'
        );
      }
    } catch (err: any) {
      console.error(err);
      setErrors([
        {
          row: 0,
          field: 'File',
          value: '',
          message: 'Không thể đọc tệp Excel. Vui lòng kiểm tra đúng định dạng tệp.',
        },
      ]);
    } finally {
      setValidating(false);
    }
  };

  const handleStartImport = async () => {
    if (parsedData.length === 0) return;
    setImporting(true);
    setImportProgress({ current: 0, total: parsedData.length });

    let count = 0;
    try {
      // Process sequentially to prevent general account balance race conditions in Supabase
      for (const payload of parsedData) {
        await transactionService.createFinancialTransaction(payload);
        count++;
        setImportProgress({ current: count, total: parsedData.length });
      }
      showNotification(`Nhập thành công ${count} phiếu thu/chi.`, 'success');
      onSuccess();
      onClose();
      // Reset state
      setFileName('');
      setParsedData([]);
      setErrors([]);
    } catch (error: any) {
      console.error('Error during bulk transaction import:', error);
      showNotification(
        `Đã xảy ra lỗi khi đang import dòng ${count + 1}: ` + error.message,
        'error'
      );
    } finally {
      setImporting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-65 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in">
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b p-5 bg-gray-50">
          <div>
            <h3 className="text-xl font-bold text-gray-800">Nhập bulk phiếu thu/chi từ file Excel</h3>
            <p className="text-xs text-gray-500 mt-1">
              Nhập hàng loạt phiếu thu chi theo mẫu cấu trúc xuất file của hệ thống.
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={importing}
            className="text-gray-400 hover:text-gray-700 text-2xl leading-none font-medium p-1 disabled:opacity-50"
          >
            &times;
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* File drag and drop section */}
          {!importing && (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragActive
                  ? 'border-[#0066cc] bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx, .xls"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex flex-col items-center justify-center space-y-2">
                <svg
                  className="w-12 h-12 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                <p className="text-sm font-semibold text-gray-700">
                  {fileName ? `File đã chọn: ${fileName}` : 'Kéo thả file Excel vào đây, hoặc click để chọn'}
                </p>
                <p className="text-xs text-gray-500">Hỗ trợ các định dạng file .xlsx, .xls</p>
              </div>
            </div>
          )}

          {/* Guidelines / Template Downloader */}
          {!importing && parsedData.length === 0 && errors.length === 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 space-y-2">
              <h4 className="font-bold">💡 Hướng dẫn chuẩn bị file:</h4>
              <ul className="list-disc pl-5 space-y-1 text-xs">
                <li>Cấu trúc các cột phải khớp hoàn toàn với file mẫu hoặc file Xuất Excel của hệ thống.</li>
                <li><strong>Thời gian:</strong> Đúng định dạng ngày giờ (VD: 09/07/2026 11:00).</li>
                <li><strong>Loại:</strong> Ghi rõ "Thu" hoặc "Chi".</li>
                <li><strong>Giá trị:</strong> Nhập số tiền lớn hơn 0.</li>
                <li><strong>Tài khoản:</strong> Nhập đúng tên tài khoản (Không được dùng TK KN hoặc TK Nợ NCC).</li>
                <li><strong>Danh mục:</strong> Trùng với danh mục hiện có trên phần mềm.</li>
              </ul>
              <div className="pt-2">
                <button
                  onClick={downloadTemplate}
                  disabled={loadingResources}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-[#0066cc] rounded hover:bg-[#0052a3] disabled:opacity-50 transition-colors"
                >
                  📥 Tải file Excel mẫu
                </button>
              </div>
            </div>
          )}

          {/* Validation Loader */}
          {validating && (
            <div className="flex flex-col items-center justify-center py-10 space-y-3">
              <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-sm font-medium text-gray-600">Đang đọc dữ liệu và kiểm tra lỗi...</p>
            </div>
          )}

          {/* Import Loader with Progress */}
          {importing && (
            <div className="py-12 space-y-6">
              <div className="text-center space-y-2">
                <h4 className="text-lg font-bold text-gray-800">Đang lưu phiếu vào cơ sở dữ liệu...</h4>
                <p className="text-sm text-gray-500">
                  Xử lý tuần tự để đảm bảo an toàn số dư tài khoản. Vui lòng không đóng cửa sổ này.
                </p>
              </div>
              <div className="max-w-md mx-auto space-y-2">
                <div className="flex justify-between text-xs text-gray-600 font-semibold">
                  <span>Tiến độ: {importProgress.current} / {importProgress.total} phiếu</span>
                  <span>{Math.round((importProgress.current / importProgress.total) * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3.5 overflow-hidden">
                  <div
                    className="bg-[#0066cc] h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${(importProgress.current / importProgress.total) * 100}%` }}
                  ></div>
                </div>
              </div>
            </div>
          )}

          {/* Validation Error List */}
          {errors.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-red-600 flex items-center gap-1.5">
                  ❌ Phát hiện {errors.length} lỗi cần sửa trong file Excel:
                </h4>
                <button
                  onClick={() => {
                    setErrors([]);
                    setFileName('');
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Chọn file khác
                </button>
              </div>
              <div className="border border-red-200 rounded-lg overflow-hidden max-h-[30vh] overflow-y-auto">
                <table className="w-full text-xs text-left text-gray-700">
                  <thead className="bg-red-50 text-red-800 font-semibold sticky top-0">
                    <tr>
                      <th className="px-4 py-2 w-16 text-center">Dòng</th>
                      <th className="px-4 py-2 w-28">Cột dữ liệu</th>
                      <th className="px-4 py-2 w-32">Giá trị trong file</th>
                      <th className="px-4 py-2">Mô tả chi tiết lỗi</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-red-100 bg-white">
                    {errors.map((err, i) => (
                      <tr key={i} className="hover:bg-red-50 bg-red-50 bg-opacity-25">
                        <td className="px-4 py-2 text-center font-bold">{err.row || '-'}</td>
                        <td className="px-4 py-2 font-semibold text-gray-800">{err.field}</td>
                        <td className="px-4 py-2 font-mono truncate max-w-[120px]" title={err.value}>
                          {err.value || '(Trống)'}
                        </td>
                        <td className="px-4 py-2 text-red-600 font-medium">{err.message}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-xs text-gray-500 italic">
                * Lưu ý: Hãy sửa toàn bộ các lỗi trên trong file Excel của bạn, lưu lại rồi chọn file để quét lại.
              </p>
            </div>
          )}

          {/* Valid Preview grid */}
          {!importing && parsedData.length > 0 && errors.length === 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-bold text-green-600 flex items-center gap-1.5">
                  ✅ Tệp Excel hợp lệ! Xem trước {parsedData.length} phiếu sẵn sàng nhập:
                </h4>
                <button
                  onClick={() => {
                    setParsedData([]);
                    setFileName('');
                  }}
                  className="text-xs text-blue-600 hover:underline"
                >
                  Chọn file khác
                </button>
              </div>
              <div className="border border-green-200 rounded-lg overflow-hidden max-h-[30vh] overflow-y-auto">
                <table className="w-full text-xs text-left text-gray-700">
                  <thead className="bg-green-50 text-green-800 font-semibold sticky top-0">
                    <tr>
                      <th className="px-4 py-2 w-12 text-center">#</th>
                      <th className="px-4 py-2">Thời gian</th>
                      <th className="px-4 py-2 w-16 text-center">Loại</th>
                      <th className="px-4 py-2">Tài khoản</th>
                      <th className="px-4 py-2">Hạng mục</th>
                      <th className="px-4 py-2">Đối tác</th>
                      <th className="px-4 py-2">Mô tả</th>
                      <th className="px-4 py-2 text-right">Số tiền</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-green-100 bg-white">
                    {parsedData.slice(0, 100).map((row, i) => {
                      const accName = accounts.find((a) => a.id === row.accountId)?.name || 'N/A';
                      const catName = categories.find((c) => c.id === row.categoryId)?.name || 'N/A';
                      const partnerName = partners.find((p) => p.id === row.partnerId)?.name || 'Khách lẻ/Nội bộ';
                      return (
                        <tr key={i} className="hover:bg-green-50 bg-green-50 bg-opacity-10">
                          <td className="px-4 py-2 text-center font-semibold text-gray-500">{i + 1}</td>
                          <td className="px-4 py-2 whitespace-nowrap">
                            {new Date(row.transactionDate).toLocaleString('vi-VN')}
                          </td>
                          <td className="px-4 py-2 text-center">
                            <span
                              className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                row.type === TransactionType.INCOME
                                  ? 'bg-green-100 text-green-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {row.type === TransactionType.INCOME ? 'Thu' : 'Chi'}
                            </span>
                          </td>
                          <td className="px-4 py-2 font-medium">{accName}</td>
                          <td className="px-4 py-2">{catName}</td>
                          <td className="px-4 py-2 truncate max-w-[120px]" title={partnerName}>
                            {partnerName}
                          </td>
                          <td className="px-4 py-2 truncate max-w-[150px]" title={row.description}>
                            {row.description}
                          </td>
                          <td
                            className={`px-4 py-2 text-right font-bold tabular-nums ${
                              row.type === TransactionType.INCOME ? 'text-green-600' : 'text-red-600'
                            }`}
                          >
                            {row.amount.toLocaleString('vi-VN')} ₫
                          </td>
                        </tr>
                      );
                    })}
                    {parsedData.length > 100 && (
                      <tr className="bg-gray-50 text-gray-500">
                        <td colSpan={8} className="px-4 py-3 text-center italic">
                          Và {parsedData.length - 100} phiếu thu/chi khác...
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="border-t p-4 flex justify-end bg-gray-50 space-x-3">
          <button
            onClick={onClose}
            disabled={importing}
            className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
          >
            Đóng
          </button>
          {!importing && parsedData.length > 0 && errors.length === 0 && (
            <button
              onClick={handleStartImport}
              className="px-5 py-2 text-sm font-semibold bg-green-600 hover:bg-green-700 text-white rounded-md shadow-md transition-colors"
            >
              🚀 Xác nhận Import
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
