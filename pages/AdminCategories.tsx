import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { categoryService, Category } from '../src/services/categoryService';
import { PlusIcon, SearchIcon, ChevronLeftIcon, EditIcon, DeleteIcon, ChevronRightIcon } from '../components/icons/Icons';
import Pagination from '../components/ui/Pagination';
import { useNotification } from '../contexts/NotificationContext';

// Adapt Category to AdminCategory for UI if needed, or just use Category
type AdminCategory = Category;

// --- MODAL COMPONENTS ---

const ConfirmationModal: React.FC<{ isOpen: boolean; onClose: () => void; onConfirm: () => void; category: AdminCategory | null; }> = ({ isOpen, onClose, onConfirm, category }) => {
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);
    if (!isOpen || !category) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6"><h3 className="text-lg font-bold text-gray-900">Xác nhận Xóa</h3><p className="mt-2 text-sm text-gray-600">Bạn có chắc chắn muốn xóa hạng mục "{category.name}" không?</p></div>
                <div className="border-t p-4 flex justify-end bg-gray-50 rounded-b-lg space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Hủy</button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700">Xác nhận Xóa</button>
                </div>
            </div>
        </div>
    );
};

const AddEditModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (data: any) => void; category: AdminCategory | null; }> = ({ isOpen, onClose, onSave, category }) => {
    const [type, setType] = useState<'expense' | 'income'>('expense');
    const [parentName, setParentName] = useState('');
    const [childName, setChildName] = useState('');
    const [description, setDescription] = useState('');

    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            setType(category ? (category.type === 'INCOME' ? 'income' : 'expense') : 'expense');
            setParentName('');
            setChildName(category?.name || '');
            setDescription(category?.description || '');
        }
    }, [isOpen, category]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({ type, parentName, name: childName, description });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b"><h3 className="text-lg font-bold text-gray-900">{category ? 'Chỉnh sửa hạng mục' : 'Thêm hạng mục mới'}</h3></div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Loại hạng mục</label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2"><input type="radio" name="type" value="expense" checked={type === 'expense'} onChange={() => setType('expense')} className="form-radio" /> Chi</label>
                            <label className="flex items-center gap-2"><input type="radio" name="type" value="income" checked={type === 'income'} onChange={() => setType('income')} className="form-radio" /> Thu</label>
                        </div>
                    </div>
                    <div><label className="block text-sm font-medium text-gray-700">Hạng mục lớn</label><input type="text" value={parentName} onChange={e => setParentName(e.target.value)} placeholder="VD: Chi phí vận hành" className="mt-1 w-full p-2 border border-gray-300 rounded-md" /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Hạng mục con {parentName && '(tùy chọn)'}</label><input type="text" value={childName} onChange={e => setChildName(e.target.value)} placeholder="VD: Giao hàng" className="mt-1 w-full p-2 border border-gray-300 rounded-md" required /></div>
                    <div><label className="block text-sm font-medium text-gray-700">Mô tả (tùy chọn)</label><textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="mt-1 w-full p-2 border border-gray-300 rounded-md" /></div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-3">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-white border rounded-md hover:bg-gray-50">Hủy</button>
                    <button type="submit" className="px-4 py-2 text-sm text-white bg-[#0066cc] rounded-md hover:bg-[#0052a3]">Lưu</button>
                </div>
            </form>
        </div>
    );
};

const DetailModal: React.FC<{ isOpen: boolean; onClose: () => void; onEdit: () => void; onDelete: () => void; category: AdminCategory | null; }> = ({ isOpen, onClose, onEdit, onDelete, category }) => {
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);
    if (!isOpen || !category) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b"><h3 className="text-lg font-bold text-gray-900">Chi tiết hạng mục</h3></div>
                <div className="p-6 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-sm"><p className="text-gray-500">Tên:</p><p className="font-semibold col-span-2">{category.name}</p></div>
                    <div className="grid grid-cols-3 gap-2 text-sm"><p className="text-gray-500">Số giao dịch:</p><p className="col-span-2">{category.count}</p></div>
                    <div className="grid grid-cols-3 gap-2 text-sm"><p className="text-gray-500 self-start">Mô tả:</p><p className="col-span-2">{category.description || 'Không có'}</p></div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-3">
                    <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 text-sm bg-white border rounded-md hover:bg-gray-50"><EditIcon className="w-4 h-4" />Sửa</button>
                    <button onClick={onDelete} className="flex items-center gap-2 px-4 py-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100"><DeleteIcon className="w-4 h-4" />Xóa</button>
                    <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300">Đóng</button>
                </div>
            </div>
        </div>
    );
};

const AdminCategories: React.FC = () => {
    const { showNotification } = useNotification();
    const [viewType, setViewType] = useState<'expense' | 'income'>('expense');
    const [allCategories, setAllCategories] = useState<{ expense: AdminCategory[], income: AdminCategory[] }>({ expense: [], income: [] });
    const [loading, setLoading] = useState(true);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<AdminCategory | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<AdminCategory | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const [expense, income] = await Promise.all([
                categoryService.getTransactionCategories('EXPENSE'),
                categoryService.getTransactionCategories('INCOME')
            ]);
            setAllCategories({ expense, income });
        } catch (error) {
            console.error("Failed to fetch categories", error);
        } finally {
            setLoading(false);
        }
    };

    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(isMobile ? 8 : 12);

    useEffect(() => {
        const handleResize = () => {
            const mobile = window.innerWidth < 768;
            if (mobile !== isMobile) {
                setIsMobile(mobile);
                setItemsPerPage(mobile ? 8 : 12);
                setCurrentPage(1);
            }
        };
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [isMobile]);

    const filteredCategories = useMemo(() => {
        const sourceData = allCategories[viewType];
        return sourceData.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [allCategories, viewType, searchTerm]);

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const paginatedCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleOpenAddModal = () => { setSelectedCategory(null); setIsAddEditModalOpen(true); };
    const handleOpenDetailModal = (category: AdminCategory) => { setSelectedCategory(category); setIsDetailModalOpen(true); };
    const handleOpenEditModal = () => { setIsDetailModalOpen(false); setIsAddEditModalOpen(true); };
    const handleOpenDeleteModal = () => { setIsDetailModalOpen(false); setCategoryToDelete(selectedCategory); };
    const handleCloseModals = () => { setIsAddEditModalOpen(false); setIsDetailModalOpen(false); setCategoryToDelete(null); setSelectedCategory(null); };

    const handleSave = async (data: { type: 'expense' | 'income', parentName: string, name: string, description?: string }) => {
        const fullName = data.parentName ? `${data.parentName} > ${data.name}` : data.name;
        // In this implementation, we map 'expense'/'income' UI type to 'EXPENSE'/'INCOME' API type
        const apiType = data.type === 'expense' ? 'EXPENSE' : 'INCOME';

        try {
            if (selectedCategory) {
                // Update not implemented in service yet, let's assume create for now or just log
                // To implement update, need to add updateTransactionCategory to service
                console.warn("Update category not fully implemented in service");
                showNotification(`Tính năng sửa đang được cập nhật. Giả lập sửa: ${fullName}`, 'info');
            } else {
                await categoryService.createTransactionCategory({
                    name: fullName,
                    description: data.description,
                    type: apiType
                });
                showNotification(`Đã thêm hạng mục: ${fullName}`, 'success');
            }
            fetchCategories();
            handleCloseModals();
        } catch (error) {
            console.error("Error saving category", error);
            showNotification("Lỗi khi lưu hạng mục", "error");
        }
    };

    const handleConfirmDelete = async () => {
        if (categoryToDelete) {
            try {
                await categoryService.deleteTransactionCategory(categoryToDelete.id);
                showNotification(`Đã xóa hạng mục: ${categoryToDelete.name}`, 'success');
                fetchCategories();
                handleCloseModals();
            } catch (error) {
                console.error("Error deleting category", error);
                showNotification("Lỗi khi xóa hạng mục", "error");
            }
        }
    };

    return (
        <>
            <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                <header className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 border-b mb-4 gap-4">
                    <div className="flex items-center">
                        <Link to="/admin" className="p-2 rounded-md hover:bg-gray-100 mr-2"><ChevronLeftIcon /></Link>
                        <h1 className="text-xl font-bold text-gray-800 whitespace-nowrap">Quản lý hạng mục</h1>
                    </div>
                    <button onClick={handleOpenAddModal} className="w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-[#0066cc] rounded-md hover:bg-[#0052a3]">
                        <PlusIcon className="mr-2" /> Thêm hạng mục
                    </button>
                </header>

                <div className="mb-4">
                    <div className="relative"><input type="text" placeholder="Tìm kiếm hạng mục..." onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#0066cc]" /><div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none"><SearchIcon /></div></div>
                </div>

                <div>
                    <div className="border-b border-gray-200">
                        <nav className="-mb-px flex space-x-6">
                            <button onClick={() => setViewType('expense')} className={`py-3 px-1 border-b-2 font-medium text-sm ${viewType === 'expense' ? 'border-[#0066cc] text-[#0066cc]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Hạng mục chi</button>
                            <button onClick={() => setViewType('income')} className={`py-3 px-1 border-b-2 font-medium text-sm ${viewType === 'income' ? 'border-[#0066cc] text-[#0066cc]' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}>Hạng mục thu</button>
                        </nav>
                    </div>

                    <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {paginatedCategories.map(category => (
                            <div key={category.id} onClick={() => handleOpenDetailModal(category)} className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer border hover:border-blue-300">
                                <p className="font-semibold text-gray-800">{category.name}</p>
                                <p className="text-sm text-gray-500">{category.count} giao dịch</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className={`mt-6 flex ${isMobile ? 'justify-center' : 'justify-end'}`}>
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        itemsPerPage={itemsPerPage}
                        onItemsPerPageChange={(val) => { setItemsPerPage(val); setCurrentPage(1); }}
                        totalItems={filteredCategories.length}
                        prevButtonContent={isMobile ? <ChevronLeftIcon /> : "Trước"}
                        nextButtonContent={isMobile ? <ChevronRightIcon /> : "Sau"}
                    />
                </div>
            </div>

            <DetailModal isOpen={isDetailModalOpen} onClose={handleCloseModals} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} category={selectedCategory} />
            <AddEditModal isOpen={isAddEditModalOpen} onClose={handleCloseModals} onSave={handleSave} category={selectedCategory} />
            <ConfirmationModal isOpen={!!categoryToDelete} onClose={handleCloseModals} onConfirm={handleConfirmDelete} category={categoryToDelete} />
        </>
    );
}

export default AdminCategories;