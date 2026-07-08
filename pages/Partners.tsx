import React, { useState, useMemo, useEffect, useRef } from 'react';
import { formatDate } from '../src/utils/dateUtils';
import { Link, useNavigate } from 'react-router-dom';
import FilterBar from '../components/ui/FilterBar';
import SummaryCard from '../components/ui/SummaryCard';
import Pagination from '../components/ui/Pagination';
import { TableActions } from '../components/ui/TableActions';
import { Page, Partner, PartnerType } from '../types';
import { partnerService } from '../src/services/partnerService';
import { excelUtils } from '../src/utils/excelUtils';
import { DoiTacIcon, PlusIcon, ExportIcon, EditIcon, DeleteIcon, ArrowUpIcon, ChevronDownIcon, ArrowsUpDownIcon, ChevronLeftIcon, ChevronRightIcon } from '../components/icons/Icons';
import { useBranch } from '../contexts/BranchContext';
import { supabase } from '../src/supabaseClient';
import { userService } from '../src/services/userService';
import SearchableMultiSelect from '../components/ui/SearchableMultiSelect';
import SearchableSelect from '../components/ui/SearchableSelect';
import { useNotification } from '../contexts/NotificationContext';

import ConfirmationModal from '../components/modals/ConfirmationModal';

// Modal Component for Partner Details
const DetailModal = ({ item, onClose, onEditClick, onDeleteClick, onTransferClick, transferHistory }: { 
  item: Partner | null, 
  onClose: () => void, 
  onEditClick: (item: Partner) => void, 
  onDeleteClick: (item: Partner) => void,
  onTransferClick: (item: Partner) => void,
  transferHistory: any[]
}) => {
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (item) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [item, onClose]);
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  if (!item) return null;

  const handleExport = () => {
    console.log("Exporting partner to Excel:", JSON.stringify(item, null, 2));
    showNotification(`Đã xuất dữ liệu cho đối tác ${item.name} ra console.`, 'info');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">Chi tiết đối tác</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6 space-y-3 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-3 gap-4 items-center text-sm">
            <p className="text-gray-500 col-span-1">Tên đối tác:</p>
            <p className="text-gray-800 font-medium col-span-2">{item.name}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center text-sm">
            <p className="text-gray-500 col-span-1">Loại:</p>
            <p className="text-gray-800 col-span-2">{item.type === PartnerType.CUSTOMER ? 'Khách hàng' : 'Nhà cung cấp'}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center text-sm">
            <p className="text-gray-500 col-span-1">Mã số thuế:</p>
            <p className="text-gray-800 col-span-2">{item.tax_code || 'N/A'}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center text-sm">
            <p className="text-gray-500 col-span-1">Địa chỉ:</p>
            <p className="text-gray-800 col-span-2">{item.address}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center text-sm">
            <p className="text-gray-500 col-span-1">SĐT:</p>
            <p className="text-gray-800 col-span-2">{item.phone}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center text-sm">
            <p className="text-gray-500 col-span-1">Email:</p>
            <p className="text-gray-800 col-span-2">{item.email}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center text-sm">
            <p className="text-gray-500 col-span-1">Nhân viên gán:</p>
            <p className="text-gray-800 col-span-2 text-right">{item.assigned_user_ids?.length || 0} nhân viên</p>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center text-sm">
            <p className="text-gray-500 col-span-1">Chi nhánh gán:</p>
            <p className="text-gray-800 col-span-2 text-right">{item.facility_ids?.length || 0} chi nhánh</p>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center text-sm">
            <p className="text-gray-500 col-span-1">Kỳ hạn thanh toán:</p>
            <p className="text-gray-800 col-span-2 text-right">{item.payment_term || 'Không có'}</p>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center text-sm">
            <p className="text-gray-500 col-span-1">Hạn nợ (số ngày):</p>
            <p className="text-gray-800 col-span-2 text-right">{item.payment_due_days || 0} ngày</p>
          </div>

          {/* Lịch sử chuyển giao */}
          {transferHistory && transferHistory.length > 0 && (
            <div className="border-t pt-3 mt-3">
              <h4 className="font-semibold text-sm text-gray-700 mb-2 flex items-center gap-1.5">
                📋 Lịch sử bàn giao Sale phụ trách
              </h4>
              <div className="space-y-2 max-h-36 overflow-y-auto pr-1 text-xs">
                {transferHistory.map((h: any) => (
                  <div key={h.id} className="p-2 bg-gray-50 rounded border border-gray-100">
                    <div className="flex justify-between font-medium text-gray-800">
                      <span>Chuyển từ: <strong className="text-gray-500">{h.from_user_name}</strong> ➔ <strong className="text-blue-600">{h.to_user_name}</strong></span>
                      <span className="text-gray-400 font-normal">{new Date(h.created_at).toLocaleDateString('vi-VN')}</span>
                    </div>
                    <p className="text-gray-600 mt-1"><span className="text-gray-400">Lý do:</span> {h.reason}</p>
                    <p className="text-[10px] text-gray-400 text-right mt-0.5">Thực hiện bởi: {h.created_by_name}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="border-t p-4 flex justify-end items-center bg-gray-50 rounded-b-lg space-x-2">
          <button onClick={handleExport} className="flex items-center sm:gap-1.5 p-2.5 sm:px-4 sm:py-2 text-sm font-medium bg-green-100 text-green-700 border border-green-200 rounded-lg hover:bg-green-200">
            <ExportIcon className="w-4 h-4" />
            <span className="hidden sm:inline">Xuất file</span>
          </button>
          <button onClick={() => onTransferClick(item)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-orange-50 text-orange-700 border border-orange-200 rounded-lg hover:bg-orange-100">
            🔄 Bàn giao Sale
          </button>
          <button onClick={() => onEditClick(item)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50">
            <EditIcon className="w-4 h-4" /> Sửa
          </button>
          <button
            onClick={() => { onClose(); navigate(`/bao-cao/so-chi-tiet-cong-no?partnerId=${item.id}`); }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-blue-50 text-blue-700 border border-blue-200 rounded-md hover:bg-blue-100"
          >
            <DoiTacIcon className="w-4 h-4" /> Xem sổ chi tiết
          </button>
          <button onClick={() => onDeleteClick(item)} className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100">
            <DeleteIcon className="w-4 h-4" /> Xóa
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Đóng</button>
        </div>
      </div>
    </div>
  );
};

const TransferPartnerModal = ({ isOpen, onClose, partner, allUsers, onTransfer }: {
  isOpen: boolean;
  onClose: () => void;
  partner: Partner | null;
  allUsers: any[];
  onTransfer: (toUserId: string, reason: string) => Promise<void>;
}) => {
  const [toUserId, setToUserId] = useState('');
  const [reason, setReason] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen && partner) {
      setToUserId('');
      setReason('');
    }
  }, [isOpen, partner]);

  if (!isOpen || !partner) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!toUserId || !reason.trim()) return;
    try {
      setIsSaving(true);
      await onTransfer(toUserId, reason);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi chuyển giao.');
    } finally {
      setIsSaving(false);
    }
  };

  const availableSales = allUsers.filter(u => String(u.id) !== String(partner.assigned_user_id));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-bold text-gray-800">Bàn giao khách hàng</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-500 uppercase">Khách hàng cần bàn giao</label>
            <p className="text-sm font-semibold text-gray-800 mt-1">{partner.name}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Chọn nhân viên Sale mới *</label>
            <select
              required
              value={toUserId}
              onChange={e => setToUserId(e.target.value)}
              className="w-full px-3 py-2 border rounded-md focus:ring-[#0066cc] focus:border-[#0066cc] outline-none text-sm bg-white"
            >
              <option value="">Chọn nhân viên nhận bàn giao...</option>
              {availableSales.map(u => (
                <option key={u.id} value={u.id}>{u.full_name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Lý do bàn giao *</label>
            <textarea
              required
              value={reason}
              onChange={e => setReason(e.target.value)}
              rows={3}
              placeholder="Nhập lý do bàn giao khách hàng này..."
              className="w-full px-3 py-2 border rounded-md focus:ring-[#0066cc] focus:border-[#0066cc] outline-none text-sm"
            ></textarea>
          </div>
          <div className="border-t pt-4 flex justify-end gap-2 bg-gray-50 -mx-6 -mb-6 p-4 rounded-b-lg">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium bg-white border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              disabled={isSaving}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium bg-orange-600 text-white rounded-md hover:bg-orange-700"
              disabled={isSaving || !toUserId || !reason.trim()}
            >
              {isSaving ? 'Đang bàn giao...' : 'Xác nhận Bàn giao'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};



const allColumns = [
  { key: 'name', label: 'Tên đối tác' },
  { key: 'type', label: 'Loại' },
  { key: 'phone', label: 'Số điện thoại' },
  { key: 'email', label: 'Email' },
  { key: 'address', label: 'Địa chỉ' },
  { key: 'balance', label: 'Công nợ' },
  { key: 'assigned_user', label: 'Nv/cn gán' },
];

const Partners: React.FC = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(isMobile ? 8 : 30);
  const [searchTerm, setSearchTerm] = useState('');
  const [visibleColumns, setVisibleColumns] = useState(["name", "type", "phone", "email", "address", "balance", "assigned_user"]);
  const [modalItem, setModalItem] = useState<Partner | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Partner | null>(null);
  const [dataToImport, setDataToImport] = useState<Omit<Partner, 'id'>[] | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'ascending' | 'descending' } | null>(null);
  const [activeFilter, setActiveFilter] = useState<'ALL' | PartnerType>('ALL');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [partnerToEdit, setPartnerToEdit] = useState<Partner | null>(null);
  const [partners, setPartners] = useState<Partner[]>([]);
  const [loading, setLoading] = useState(true);
  const [allUsersList, setAllUsersList] = useState<any[]>([]);
  const [transferHistory, setTransferHistory] = useState<any[]>([]);
  const [partnerToTransfer, setPartnerToTransfer] = useState<Partner | null>(null);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const { selectedFacilityId, selectedBranch, currentUser } = useBranch();
  const { showNotification } = useNotification();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    userService.getUsers().then(setAllUsersList).catch(console.error);
  }, []);

  useEffect(() => {
    if (modalItem) {
      partnerService.getPartnerTransferHistory(modalItem.id)
        .then(setTransferHistory)
        .catch(err => console.error("Lỗi khi tải lịch sử bàn giao:", err));
    } else {
      setTransferHistory([]);
    }
  }, [modalItem]);

  const handleTransferPartner = async (toUserId: string, reason: string) => {
    if (!partnerToTransfer || !currentUser) return;
    try {
      await partnerService.transferPartner(partnerToTransfer.id, toUserId, reason, String(currentUser.id));
      showNotification(`Đã bàn giao khách hàng ${partnerToTransfer.name} thành công.`, 'success');
      setIsTransferModalOpen(false);
      setPartnerToTransfer(null);
      fetchPartners();
    } catch (err: any) {
      console.error("Lỗi khi bàn giao đối tác:", err);
      showNotification(`Lỗi khi bàn giao: ${err.message || err}`, 'error');
      throw err;
    }
  };

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

  const handleFilterClick = (filter: 'ALL' | PartnerType) => {
    setActiveFilter(filter);
    setCurrentPage(1);
  };

  const requestSort = (key: string) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  useEffect(() => {
    fetchPartners();
  }, [selectedFacilityId]);

  const fetchPartners = async () => {
    try {
      setLoading(true);
      // If user is not admin and selectedFacilityId is null, they should see nothing (isolation)
      const facilityFilter = selectedFacilityId === null
        ? (currentUser?.is_admin ? undefined : '00000000-0000-0000-0000-000000000000')
        : selectedFacilityId;

      const data = await partnerService.getPartners(
        undefined,
        facilityFilter
      );
      setPartners(data);
    } catch (error) {
      console.error("Failed to fetch partners", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadTemplate = () => {
    excelUtils.exportTemplate(['Tên đối tác', 'Loại', 'SĐT', 'Email', 'Địa chỉ', 'Mã số thuế'], 'Mau_DoiTac');
  };

  const handleExportExcel = () => {
    const exportData = partners.map(p => ({
      'Tên đối tác': p.name,
      'Loại': p.type === PartnerType.CUSTOMER ? 'Khách hàng' : 'Nhà cung cấp',
      'SĐT': p.phone,
      'Email': p.email,
      'Địa chỉ': p.address,
      'Mã số thuế': p.tax_code,
      'Công nợ': p.balance || 0,
      'Công nợ tổng': p.totalBalance || 0,
      'Số NV': p.assigned_user_ids?.length || 0,
      'Số Chi nhánh': p.facility_ids?.length || 0,
      type: p.type // for coloring properly
    }));
    excelUtils.exportPartnersStyled(exportData, 'DanhSachDoiTac', selectedBranch || 'Tất cả');
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      try {
        const data = await excelUtils.readExcel(e.target.files[0]);
        // Map columns
        const mappedData: Omit<Partner, 'id'>[] = data.map((row: any) => ({
          name: row['Tên đối tác'] || row['name'] || '',
          type: (row['Loại'] === 'Khách hàng' || row['Loại'] === 'CUSTOMER' || row['type'] === 'CUSTOMER') ? PartnerType.CUSTOMER : PartnerType.SUPPLIER,
          phone: row['SĐT'] || row['phone'] || '',
          email: row['Email'] || row['email'] || '',
          address: row['Địa chỉ'] || row['address'] || '',
          tax_code: row['Mã số thuế'] || row['tax_code'] || '',
          assigned_user_ids: [],
          facility_ids: selectedFacilityId ? [selectedFacilityId] : []
        }));

        setDataToImport(mappedData);
      } catch (error) {
        console.error("Import failed:", error);
        showNotification("Lỗi khi đọc dữ liệu file Excel.", 'error');
      }
      // Reset input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleConfirmImport = async () => {
    if (!dataToImport) return;
    try {
      await partnerService.createPartners(dataToImport);
      showNotification('Import thành công!', 'success');
      fetchPartners();
    } catch (error) {
      console.error("Import failed:", error);
      showNotification("Lỗi khi import dữ liệu. Vui lòng kiểm tra lại file.", 'error');
    }
    setDataToImport(null);
  };

  const sortedPartners = useMemo(() => {
    let filteredPartners = [...partners];

    if (activeFilter !== 'ALL') {
      filteredPartners = filteredPartners.filter(p => p.type === activeFilter);
    }

    let sortablePartners = filteredPartners.filter(p =>
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.phone || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.tax_code || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (sortConfig) {
      sortablePartners.sort((a, b) => {
        const aValue = a[sortConfig.key as keyof Partner];
        const bValue = b[sortConfig.key as keyof Partner];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
        }

        if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortablePartners;
  }, [searchTerm, sortConfig, activeFilter]);

  const totalPages = Math.ceil(sortedPartners.length / itemsPerPage);
  const paginatedPartners = sortedPartners.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleEditClick = (item: Partner) => {
    setPartnerToEdit(item);
    setIsEditModalOpen(true);
    setModalItem(null);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setPartnerToEdit(null);
  };

  const handleSavePartner = async (updatedPartner: Partner) => {
    try {
      if (updatedPartner.id) {
        await partnerService.updatePartner(updatedPartner.id, updatedPartner);
        showNotification(`Đã cập nhật thông tin cho ${updatedPartner.name}.`, 'success');
      } else {
        await partnerService.createPartner({
          ...updatedPartner,
          facility_ids: updatedPartner.facility_ids?.length > 0 ? updatedPartner.facility_ids : (selectedFacilityId ? [selectedFacilityId] : [])
        });
        showNotification(`Đã tạo đối tác ${updatedPartner.name}.`, 'success');
      }
      setIsEditModalOpen(false);
      setIsAddModalOpen(false);
      fetchPartners();
    } catch (error) {
      console.error("Failed to save partner:", error);
      showNotification("Lỗi khi lưu thông tin đối tác.", 'error');
    }
  };

  const handleDeleteClick = (item: Partner) => {
    setItemToDelete(item);
  };

  const handleConfirmDelete = async () => {
    if (itemToDelete) {
      try {
        await partnerService.deletePartner(itemToDelete.id);
        showNotification(`Đã xóa đối tác ${itemToDelete.name}.`, 'success');
        fetchPartners();
      } catch (error) {
        console.error("Failed to delete partner:", error);
        showNotification("Lỗi khi xóa đối tác.", 'error');
      }
    }
    setItemToDelete(null);
    setModalItem(null);
  };

  const renderCell = (p: Partner, columnKey: string) => {
    switch (columnKey) {
      case 'name':
        return (
          <Link
            to={`/bao-cao/so-chi-tiet-cong-no?partnerId=${p.id}`}
            className="font-medium text-[#0066cc] hover:underline"
          >
            {p.name}
          </Link>
        );
      case 'type':
        return p.type === PartnerType.CUSTOMER ? 'Khách hàng' : 'Nhà cung cấp';
      case 'assigned_user':
        const assignedUser = allUsersList.find(u => String(u.id) === String(p.assigned_user_id));
        const assignedName = assignedUser ? assignedUser.full_name : 'Chưa gán';
        const facilityCount = p.facility_ids?.length || 0;
        return (
          <div className="text-xs leading-tight">
            <div className="font-medium text-blue-600 truncate">{assignedName}</div>
            <div className="text-gray-500 truncate">{facilityCount} CN</div>
          </div>
        );
      case 'balance':
        const balance = p.balance || 0;
        return (
          <div className={`font-semibold ${balance > 0 ? 'text-red-600' : (balance < 0 ? 'text-green-600' : 'text-gray-900')}`}>
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(balance)}
          </div>
        );
      default:
        const value = p[columnKey as keyof Partner];
        return typeof value === 'string' || typeof value === 'number' ? String(value) : 'N/A';
    }
  };

  const PartnerFormModal = ({ isOpen, onClose, onSave, item, title }: { isOpen: boolean, onClose: () => void, onSave: (item: Partner) => void, item: Partner | null, title: string }) => {
    const defaultPartner: Partner = {
      id: '',
      name: '',
      type: PartnerType.CUSTOMER,
      tax_code: '',
      address: '',
      phone: '',
      email: '',
      assigned_user_ids: [],
      assigned_user_id: '',
      facility_ids: [],
      payment_term: '',
      payment_due_days: 0
    };

    const [formData, setFormData] = useState<Partner>(item || defaultPartner);
    const [allFacilities, setAllFacilities] = useState<any[]>([]);
    const [allUsers, setAllUsers] = useState<any[]>([]);

    useEffect(() => {
      setFormData(item || defaultPartner);
      if (isOpen) {
        fetchMetadata();
      }
    }, [item, isOpen]);

    const [showConfirmClose, setShowConfirmClose] = useState(false);

    const handleRequestClose = () => setShowConfirmClose(true);

    React.useEffect(() => {
      const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen && !showConfirmClose) handleRequestClose(); };
      if (isOpen) window.addEventListener('keydown', handleEsc);
      return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose, showConfirmClose]);

    const fetchMetadata = async () => {
      try {
        const [fData, uData] = await Promise.all([
          supabase.from('vgvina_facilities').select('id, name'),
          userService.getUsers()
        ]);
        if (fData.data) setAllFacilities(fData.data);
        if (uData) setAllUsers(uData);
      } catch (err) {
        console.error("Failed to fetch metadata for form", err);
      }
    };

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave(formData);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const { name, value } = e.target;
      setFormData(prev => ({ ...prev, [name]: value }));
    };



    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]" onClick={e => e.stopPropagation()}>
          <div className="flex justify-between items-center border-b p-4">
            <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
            <button onClick={handleRequestClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
          </div>
          <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Tên đối tác *</label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-[#0066cc] focus:border-[#0066cc]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Loại đối tác</label>
                <select name="type" value={formData.type} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-[#0066cc] focus:border-[#0066cc]">
                  <option value={PartnerType.CUSTOMER}>Khách hàng</option>
                  <option value={PartnerType.SUPPLIER}>Nhà cung cấp</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã số thuế</label>
                <input type="text" name="tax_code" value={formData.tax_code || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-[#0066cc] focus:border-[#0066cc]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SĐT</label>
                <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-[#0066cc] focus:border-[#0066cc]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-[#0066cc] focus:border-[#0066cc]" />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Địa chỉ</label>
                <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className="w-full px-3 py-2 border rounded-md focus:ring-[#0066cc] focus:border-[#0066cc]" />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Thời gian thanh toán</label>
                <input type="text" name="payment_term" value={formData.payment_term || ''} onChange={handleChange} placeholder="Ví dụ: 3-5 ngày, tt luôn" className="w-full px-3 py-2 border rounded-md focus:ring-[#0066cc] focus:border-[#0066cc]" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hạn nợ (Số ngày)</label>
                <input type="number" name="payment_due_days" value={formData.payment_due_days || 0} onChange={handleChange} min="0" className="w-full px-3 py-2 border rounded-md focus:ring-[#0066cc] focus:border-[#0066cc]" />
              </div>

              {/* Searchable Multi-Assignment */}
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Gán cho Chi nhánh</label>
                <SearchableMultiSelect
                  options={allFacilities}
                  selectedIds={formData.facility_ids || []}
                  onChange={(ids) => setFormData(prev => ({ ...prev, facility_ids: ids as string[] }))}
                  placeholder="Chọn chi nhánh..."
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Gán cho Nhân viên Sale phụ trách</label>
                <SearchableSelect
                  options={allUsers.map(u => ({ id: String(u.id), name: u.full_name }))}
                  value={formData.assigned_user_id || ''}
                  onChange={(id) => setFormData(prev => ({ 
                    ...prev, 
                    assigned_user_id: id || undefined,
                    assigned_user_ids: id ? [id] : []
                  }))}
                  placeholder="Chọn nhân viên sale..."
                />
              </div>
            </div>
          </form>
          <div className="border-t p-4 flex justify-end gap-2 bg-gray-50 mt-auto">
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

  const customerCount = useMemo(() => partners.filter(p => p.type === PartnerType.CUSTOMER).length, [partners]);
  const supplierCount = useMemo(() => partners.filter(p => p.type === PartnerType.SUPPLIER).length, [partners]);
  const totalCount = partners.length;

  return (
    <>
      <FilterBar onSearch={setSearchTerm} onTimeFilterChange={() => { }} pageTitle={Page.DoiTac} />

      {/* Mobile Summary Cards */}
      <div className="md:hidden grid grid-cols-2 gap-4 mb-4">
        <div onClick={() => handleFilterClick(PartnerType.CUSTOMER)} className={`block bg-white p-3 rounded-lg shadow-sm cursor-pointer ${activeFilter === PartnerType.CUSTOMER ? 'ring-2 ring-[#0066cc]' : ''}`}>
          <p className="text-xs font-medium text-gray-500">Tổng khách hàng</p>
          <p className="text-base font-bold text-blue-600 mt-1">{String(customerCount)}</p>
        </div>
        <div onClick={() => handleFilterClick(PartnerType.SUPPLIER)} className={`block bg-white p-3 rounded-lg shadow-sm cursor-pointer ${activeFilter === PartnerType.SUPPLIER ? 'ring-2 ring-[#0066cc]' : ''}`}>
          <p className="text-xs font-medium text-gray-500">Tổng NCC</p>
          <p className="text-base font-bold text-indigo-600 mt-1">{String(supplierCount)}</p>
        </div>
      </div>

      {/* Desktop Summary Cards */}
      <div className="hidden md:flex space-x-6">
        <div onClick={() => handleFilterClick(PartnerType.CUSTOMER)} className={`flex-1 cursor-pointer rounded-lg transition-all duration-200 ${activeFilter === PartnerType.CUSTOMER ? 'ring-2 ring-offset-2 ring-[#0066cc] shadow-lg' : 'ring-0'}`}>
          <SummaryCard title="Tổng khách hàng" value={String(customerCount)} icon={<DoiTacIcon />} colorClass="bg-blue-100 text-blue-600" />
        </div>
        <div onClick={() => handleFilterClick(PartnerType.SUPPLIER)} className={`flex-1 cursor-pointer rounded-lg transition-all duration-200 ${activeFilter === PartnerType.SUPPLIER ? 'ring-2 ring-offset-2 ring-[#0066cc] shadow-lg' : 'ring-0'}`}>
          <SummaryCard title="Tổng nhà cung cấp" value={String(supplierCount)} icon={<DoiTacIcon />} colorClass="bg-indigo-100 text-indigo-600" />
        </div>
        <div onClick={() => handleFilterClick('ALL')} className={`flex-1 cursor-pointer rounded-lg transition-all duration-200 ${activeFilter === 'ALL' ? 'ring-2 ring-offset-2 ring-[#0066cc] shadow-lg' : 'ring-0'}`}>
          <SummaryCard title="Tất cả đối tác" value={String(totalCount)} icon={<DoiTacIcon />} colorClass="bg-green-100 text-green-600" />
        </div>
      </div>

      <div className="hidden md:block">
        <TableActions
          onSearch={setSearchTerm}
          searchPlaceholder="Tìm theo tên, SĐT, email..."
          primaryActions={[
            { label: 'Tải mẫu', icon: <ExportIcon />, onClick: handleDownloadTemplate, variant: 'secondary' },
            { label: 'Import', icon: <PlusIcon />, onClick: handleImportClick, variant: 'secondary' },
            { label: 'Xuất file', icon: <ExportIcon />, onClick: handleExportExcel, variant: 'secondary' },
            { label: 'Thêm đối tác', icon: <PlusIcon />, onClick: () => setIsAddModalOpen(true) },
          ]}
          columns={allColumns}
          visibleColumns={visibleColumns}
          onVisibleColumnsChange={setVisibleColumns}
        />
      </div>

      <div className="hidden md:block bg-white rounded-lg shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500">
            <thead className="text-xs text-gray-700 bg-gray-50">
              <tr>
                {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => (
                  <th key={col.key} scope="col" className="px-6 py-3 cursor-pointer" onClick={() => requestSort(col.key)}>
                    <div className="flex items-center">
                      {col.label}
                      <span className="ml-1.5">
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
              {paginatedPartners.map((partner) => (
                <tr key={partner.id} className="bg-white border-b hover:bg-gray-50 cursor-pointer" onClick={() => setModalItem(partner)}>
                  {allColumns.filter(c => visibleColumns.includes(c.key)).map(col => (
                    <td key={col.key} className="px-6 py-4">{renderCell(partner, col.key)}</td>
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
            totalItems={sortedPartners.length}
          />
        </div>
      </div>

      {/* Mobile Card List */}
      <div className="md:hidden mt-4 space-y-3">
        {paginatedPartners.map((partner) => (
          <div
            key={partner.id}
            className="bg-white p-4 rounded-lg shadow-sm cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => setModalItem(partner)}
          >
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-800">{partner.name}</p>
                <p className={`text-xs mt-1 ${partner.type === PartnerType.CUSTOMER ? 'text-blue-600' : 'text-indigo-600'}`}>
                  {partner.type === PartnerType.CUSTOMER ? 'Khách hàng' : 'Nhà cung cấp'}
                </p>
              </div>
              <div className="text-right text-sm flex-shrink-0 ml-2">
                <p className="text-gray-600">{partner.phone}</p>
                <p className={`font-bold mt-1 ${((partner.balance || 0) > 0) ? 'text-red-600' : (partner.balance || 0) < 0 ? 'text-green-600' : 'text-gray-900'}`}>
                  {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(partner.balance || 0)}
                </p>
                <p className="text-xs text-gray-400 mt-1 truncate">{partner.assigned_user}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Mobile Pagination */}
      <div className="md:hidden mt-4">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
          totalItems={sortedPartners.length}
          prevButtonContent={<ChevronLeftIcon />}
          nextButtonContent={<ChevronRightIcon />}
        />
      </div>

      <DetailModal 
        item={modalItem} 
        onClose={() => setModalItem(null)} 
        onEditClick={handleEditClick} 
        onDeleteClick={handleDeleteClick} 
        onTransferClick={(item) => { setPartnerToTransfer(item); setIsTransferModalOpen(true); }}
        transferHistory={transferHistory}
      />
      <TransferPartnerModal 
        isOpen={isTransferModalOpen} 
        onClose={() => { setIsTransferModalOpen(false); setPartnerToTransfer(null); }}
        partner={partnerToTransfer}
        allUsers={allUsersList}
        onTransfer={handleTransferPartner}
      />
      <ConfirmationModal
        isOpen={!!itemToDelete}
        onClose={() => setItemToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận Xóa Đối Tác"
        message={`Bạn có chắc chắn muốn xóa đối tác "${itemToDelete?.name}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xác nhận Xóa"
      />

      <ConfirmationModal
        isOpen={!!dataToImport && dataToImport.length > 0}
        onClose={() => setDataToImport(null)}
        onConfirm={handleConfirmImport}
        title="Xác nhận Import"
        message={`Chắc chắn muốn import ${dataToImport?.length || 0} đối tác?`}
        confirmText="Import"
      />

      <PartnerFormModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSave={handleSavePartner}
        item={partnerToEdit}
        title="Chỉnh sửa đối tác"
      />

      <PartnerFormModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleSavePartner}
        item={null}
        title="Thêm đối tác mới"
      />
      <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx, .xls" />
    </>
  );
};

export default Partners;