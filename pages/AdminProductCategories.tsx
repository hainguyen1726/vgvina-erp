import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { categoryService, Category } from '../src/services/categoryService';
import { PlusIcon, SearchIcon, ChevronLeftIcon, EditIcon, DeleteIcon } from '../components/icons/Icons';
import Pagination from '../components/ui/Pagination';
import { useNotification } from '../contexts/NotificationContext';

type ProductCategory = Category;

// --- MODAL COMPONENTS ---

const ConfirmationModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onConfirm: () => void; 
    category: ProductCategory | null; 
}> = ({ isOpen, onClose, onConfirm, category }) => {
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen || !category) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900">Xác nhận Xóa</h3>
                    <p className="mt-2 text-sm text-gray-600">Bạn có chắc chắn muốn xóa danh mục sản phẩm "{category.name}" không?</p>
                    <p className="mt-1 text-xs text-red-500 font-medium">* Lưu ý: Thao tác này không thể hoàn tác và có thể ảnh hưởng đến sản phẩm thuộc danh mục này.</p>
                </div>
                <div className="border-t p-4 flex justify-end bg-gray-50 rounded-b-lg space-x-3">
                    <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-white text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50">Hủy</button>
                    <button onClick={onConfirm} className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-md hover:bg-red-700">Xác nhận Xóa</button>
                </div>
            </div>
        </div>
    );
};

const AddEditModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onSave: (data: { name: string; description?: string }) => void; 
    category: ProductCategory | null; 
}> = ({ isOpen, onClose, onSave, category }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');

    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    useEffect(() => {
        if (isOpen) {
            setName(category?.name || '');
            setDescription(category?.description || '');
        }
    }, [isOpen, category]);

    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim()) return;
        onSave({ name: name.trim(), description: description.trim() });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h3 className="text-lg font-bold text-gray-900">{category ? 'Chỉnh sửa danh mục' : 'Thêm danh mục sản phẩm mới'}</h3>
                </div>
                <div className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Tên danh mục <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={e => setName(e.target.value)} 
                            placeholder="VD: Tôm đông lạnh" 
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none" 
                            required 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả (tùy chọn)</label>
                        <textarea 
                            value={description} 
                            onChange={e => setDescription(e.target.value)} 
                            rows={3} 
                            placeholder="Mô tả ngắn gọn về danh mục này..." 
                            className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 outline-none" 
                        />
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg border-t">
                    <button type="button" onClick={onClose} className="px-4 py-2 text-sm bg-white border rounded-md hover:bg-gray-50 text-gray-700">Hủy</button>
                    <button type="submit" className="px-4 py-2 text-sm text-white bg-[#0066cc] rounded-md hover:bg-[#0052a3]">Lưu</button>
                </div>
            </form>
        </div>
    );
};

const DetailModal: React.FC<{ 
    isOpen: boolean; 
    onClose: () => void; 
    onEdit: () => void; 
    onDelete: () => void; 
    category: ProductCategory | null; 
}> = ({ isOpen, onClose, onEdit, onDelete, category }) => {
    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        if (isOpen) window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);

    if (!isOpen || !category) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b">
                    <h3 className="text-lg font-bold text-gray-900">Chi tiết danh mục</h3>
                </div>
                <div className="p-6 space-y-3">
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <p className="text-gray-500">Tên danh mục:</p>
                        <p className="font-semibold col-span-2 text-gray-900">{category.name}</p>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                        <p className="text-gray-500 self-start">Mô tả:</p>
                        <p className="col-span-2 text-gray-700">{category.description || 'Không có'}</p>
                    </div>
                </div>
                <div className="p-4 bg-gray-50 flex justify-end gap-3 rounded-b-lg border-t">
                    <button onClick={onEdit} className="flex items-center gap-2 px-4 py-2 text-sm bg-white border rounded-md hover:bg-gray-50 text-gray-700">
                        <EditIcon className="w-4 h-4" />Sửa
                    </button>
                    <button onClick={onDelete} className="flex items-center gap-2 px-4 py-2 text-sm bg-red-50 text-red-700 border border-red-200 rounded-md hover:bg-red-100">
                        <DeleteIcon className="w-4 h-4" />Xóa
                    </button>
                    <button onClick={onClose} className="px-4 py-2 text-sm bg-gray-200 rounded-md hover:bg-gray-300 text-gray-700">Đóng</button>
                </div>
            </div>
        </div>
    );
};

const AdminProductCategories: React.FC = () => {
    const { showNotification } = useNotification();
    const [categories, setCategories] = useState<ProductCategory[]>([]);
    const [loading, setLoading] = useState(true);
    const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<ProductCategory | null>(null);
    const [categoryToDelete, setCategoryToDelete] = useState<ProductCategory | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            setLoading(true);
            const data = await categoryService.getProductCategories();
            setCategories(data);
        } catch (error: any) {
            console.error("Failed to fetch product categories", error);
            showNotification("Lỗi khi tải danh mục sản phẩm", "error");
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
        return categories.filter(c => c.name.toLowerCase().includes(searchTerm.toLowerCase()));
    }, [categories, searchTerm]);

    const totalPages = Math.ceil(filteredCategories.length / itemsPerPage);
    const paginatedCategories = filteredCategories.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const handleOpenAddModal = () => { setSelectedCategory(null); setIsAddEditModalOpen(true); };
    const handleOpenDetailModal = (category: ProductCategory) => { setSelectedCategory(category); setIsDetailModalOpen(true); };
    const handleOpenEditModal = () => { setIsDetailModalOpen(false); setIsAddEditModalOpen(true); };
    const handleOpenDeleteModal = () => { setIsDetailModalOpen(false); setCategoryToDelete(selectedCategory); };
    const handleCloseModals = () => { setIsAddEditModalOpen(false); setIsDetailModalOpen(false); setCategoryToDelete(null); setSelectedCategory(null); };

    const handleSave = async (data: { name: string; description?: string }) => {
        try {
            if (selectedCategory) {
                await categoryService.updateProductCategory(selectedCategory.id, data);
                showNotification(`Đã cập nhật danh mục: ${data.name}`, 'success');
            } else {
                await categoryService.createProductCategory(data);
                showNotification(`Đã thêm danh mục: ${data.name}`, 'success');
            }
            fetchCategories();
            handleCloseModals();
        } catch (error: any) {
            console.error("Error saving product category", error);
            showNotification("Lỗi khi lưu danh mục sản phẩm: " + error.message, "error");
        }
    };

    const handleConfirmDelete = async () => {
        if (!categoryToDelete) return;
        try {
            await categoryService.deleteProductCategory(categoryToDelete.id);
            showNotification(`Đã xóa danh mục: ${categoryToDelete.name}`, 'success');
            fetchCategories();
            handleCloseModals();
        } catch (error: any) {
            console.error("Error deleting product category", error);
            showNotification("Lỗi khi xóa danh mục sản phẩm: " + error.message, "error");
        }
    };

    return (
        <div className="p-4 md:p-6 space-y-4 max-w-7xl mx-auto bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link to="/admin" className="p-2 rounded-full hover:bg-gray-200 text-gray-600 transition-colors">
                        <ChevronLeftIcon className="w-5 h-5" />
                    </Link>
                    <h1 className="text-xl font-bold text-gray-800">Quản lý Danh mục Sản phẩm</h1>
                </div>
                <button
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0066cc] text-white rounded-md hover:bg-[#0052a3] shadow-sm font-medium transition-all text-sm animate-fade-in"
                >
                    <PlusIcon className="w-4 h-4" /> Thêm danh mục
                </button>
            </div>

            {/* Filter bar */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex items-center justify-between gap-4">
                <div className="relative flex-1 max-w-md">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <SearchIcon className="w-4 h-4" />
                    </span>
                    <input
                        type="text"
                        placeholder="Tìm kiếm danh mục sản phẩm..."
                        value={searchTerm}
                        onChange={e => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        className="w-full pl-10 pr-4 py-2 border rounded-md text-sm outline-none focus:border-blue-500"
                    />
                </div>
                <div className="text-sm text-gray-500 font-medium">
                    Tổng số: <span className="text-gray-900 font-bold">{filteredCategories.length}</span> danh mục
                </div>
            </div>

            {/* Content Table / Grid */}
            {loading ? (
                <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#0066cc]"></div>
                    <span className="text-gray-500 text-sm">Đang tải danh mục sản phẩm...</span>
                </div>
            ) : filteredCategories.length === 0 ? (
                <div className="bg-white p-12 rounded-lg shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-500 italic">Không tìm thấy danh mục sản phẩm nào phù hợp.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {/* Desktop Table View */}
                    <div className="hidden md:block bg-white rounded-lg shadow-sm overflow-hidden border border-gray-200">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 bg-gray-50 border-b">
                                <tr>
                                    <th className="px-6 py-3 font-semibold">Tên danh mục</th>
                                    <th className="px-6 py-3 font-semibold">Mô tả</th>
                                    <th className="px-6 py-3 text-right font-semibold">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {paginatedCategories.map(cat => (
                                    <tr 
                                        key={cat.id} 
                                        className="hover:bg-gray-50 cursor-pointer bg-white transition-colors"
                                        onClick={() => handleOpenDetailModal(cat)}
                                    >
                                        <td className="px-6 py-4 font-medium text-gray-900 max-w-xs truncate">{cat.name}</td>
                                        <td className="px-6 py-4 text-gray-600 max-w-md truncate">{cat.description || '-'}</td>
                                        <td className="px-6 py-4 text-right" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-end gap-3">
                                                <button 
                                                    onClick={() => { setSelectedCategory(cat); setIsAddEditModalOpen(true); }}
                                                    className="p-1 hover:bg-gray-100 rounded text-blue-600 hover:text-blue-800 transition-colors"
                                                    title="Chỉnh sửa"
                                                >
                                                    <EditIcon className="w-4 h-4" />
                                                </button>
                                                <button 
                                                    onClick={() => setCategoryToDelete(cat)}
                                                    className="p-1 hover:bg-gray-100 rounded text-red-600 hover:text-red-800 transition-colors"
                                                    title="Xóa"
                                                >
                                                    <DeleteIcon className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Grid View */}
                    <div className="md:hidden grid grid-cols-1 gap-3">
                        {paginatedCategories.map(cat => (
                            <div 
                                key={cat.id} 
                                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 space-y-2"
                                onClick={() => handleOpenDetailModal(cat)}
                            >
                                <div className="flex justify-between items-start gap-2">
                                    <h4 className="font-bold text-gray-900 text-sm leading-tight">{cat.name}</h4>
                                    <div className="flex items-center gap-1 shrink-0" onClick={e => e.stopPropagation()}>
                                        <button 
                                            onClick={() => { setSelectedCategory(cat); setIsAddEditModalOpen(true); }}
                                            className="p-1.5 hover:bg-gray-100 rounded text-blue-600"
                                        >
                                            <EditIcon className="w-4 h-4" />
                                        </button>
                                        <button 
                                            onClick={() => setCategoryToDelete(cat)}
                                            className="p-1.5 hover:bg-gray-100 rounded text-red-600"
                                        >
                                            <DeleteIcon className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 line-clamp-2">{cat.description || 'Không có mô tả'}</p>
                            </div>
                        ))}
                    </div>

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <div className="flex justify-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                            <Pagination
                                currentPage={currentPage}
                                totalPages={totalPages}
                                onPageChange={setCurrentPage}
                            />
                        </div>
                    )}
                </div>
            )}

            {/* Modals */}
            <AddEditModal isOpen={isAddEditModalOpen} onClose={handleCloseModals} onSave={handleSave} category={selectedCategory} />
            <DetailModal isOpen={isDetailModalOpen} onClose={handleCloseModals} onEdit={handleOpenEditModal} onDelete={handleOpenDeleteModal} category={selectedCategory} />
            <ConfirmationModal isOpen={!!categoryToDelete} onClose={handleCloseModals} onConfirm={handleConfirmDelete} category={categoryToDelete} />
        </div>
    );
};

export default AdminProductCategories;
