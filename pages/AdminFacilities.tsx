import React, { useState, useEffect } from 'react';
import { facilityService, Facility } from '../src/services/facilityService';
import { PlusIcon, EditIcon, DeleteIcon } from '../components/icons/Icons';
import { useNotification } from '../contexts/NotificationContext';

const AdminFacilities: React.FC = () => {
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { showNotification } = useNotification();

    // Modal states
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedFacility, setSelectedFacility] = useState<Facility | null>(null);

    // Form states
    const [formData, setFormData] = useState({
        name: '',
        address: ''
    });

    // Stats
    const [facilityStats, setFacilityStats] = useState<{ [key: string]: { users: number; partners: number } }>({});

    useEffect(() => {
        fetchData();
    }, []);

    React.useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                setIsCreateModalOpen(false);
                setIsEditModalOpen(false);
                setIsDeleteModalOpen(false);
                resetForm();
            }
        };
        if (isCreateModalOpen || isEditModalOpen || isDeleteModalOpen) {
            window.addEventListener('keydown', handleEsc);
        }
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isCreateModalOpen, isEditModalOpen, isDeleteModalOpen]);

    const fetchData = async () => {
        setLoading(true);
        try {
            const data = await facilityService.getFacilities();
            setFacilities(data);

            // Fetch stats for each facility
            const stats: { [key: string]: { users: number; partners: number } } = {};
            await Promise.all(
                data.map(async (facility) => {
                    const [usersCount, partnersCount] = await Promise.all([
                        facilityService.getFacilityUsersCount(facility.id),
                        facilityService.getFacilityPartnersCount(facility.id)
                    ]);
                    stats[facility.id] = { users: usersCount, partners: partnersCount };
                })
            );
            setFacilityStats(stats);
        } catch (err) {
            console.error('Error fetching data:', err);
            setError('Không thể tải dữ liệu');
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async () => {
        try {
            await facilityService.createFacility(formData);
            await fetchData();
            setIsCreateModalOpen(false);
            resetForm();
        } catch (err) {
            console.error('Error creating facility:', err);
            showNotification('Lỗi khi tạo chi nhánh', 'error');
        }
    };

    const handleEdit = async () => {
        if (!selectedFacility) return;
        try {
            await facilityService.updateFacility(selectedFacility.id, formData);
            await fetchData();
            setIsEditModalOpen(false);
            resetForm();
        } catch (err) {
            console.error('Error updating facility:', err);
            showNotification('Lỗi khi cập nhật chi nhánh', 'error');
        }
    };

    const handleDelete = async () => {
        if (!selectedFacility) return;
        try {
            await facilityService.deleteFacility(selectedFacility.id);
            await fetchData();
            setIsDeleteModalOpen(false);
            setSelectedFacility(null);
        } catch (err: any) {
            console.error('Error deleting facility:', err);
            showNotification(err.message || 'Lỗi khi xóa chi nhánh', 'error');
        }
    };

    const openEditModal = (facility: Facility) => {
        setSelectedFacility(facility);
        setFormData({
            name: facility.name,
            address: facility.address || ''
        });
        setIsEditModalOpen(true);
    };

    const openDeleteModal = (facility: Facility) => {
        setSelectedFacility(facility);
        setIsDeleteModalOpen(true);
    };

    const resetForm = () => {
        setFormData({ name: '', address: '' });
        setSelectedFacility(null);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 m-4">
                <p className="text-red-800">{error}</p>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Quản Lý Chi Nhánh</h1>
                    <p className="text-gray-600 mt-1">Tạo và quản lý các chi nhánh/khu vực</p>
                </div>
                <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                    <PlusIcon />
                    Tạo Chi Nhánh Mới
                </button>
            </div>

            {/* Facilities Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {facilities.map(facility => (
                    <div key={facility.id} className="bg-white rounded-lg shadow-md p-5 hover:shadow-lg transition-shadow">
                        <div className="flex justify-between items-start mb-3">
                            <h3 className="text-lg font-bold text-gray-900">{facility.name}</h3>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => openEditModal(facility)}
                                    className="text-blue-600 hover:text-blue-800 p-1"
                                    title="Sửa"
                                >
                                    <EditIcon className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={() => openDeleteModal(facility)}
                                    className="text-red-600 hover:text-red-800 p-1"
                                    title="Xóa"
                                >
                                    <DeleteIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-2 text-sm text-gray-600">
                            {facility.address && (
                                <p className="flex items-start gap-2">
                                    <span className="font-medium">Địa chỉ:</span>
                                    <span className="flex-1">{facility.address}</span>
                                </p>
                            )}
                        </div>

                        <div className="mt-4 pt-4 border-t border-gray-200 flex gap-4 text-sm">
                            <div className="flex items-center gap-1">
                                <span className="font-semibold text-blue-600">
                                    {facilityStats[facility.id]?.users || 0}
                                </span>
                                <span className="text-gray-600">Users</span>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-semibold text-green-600">
                                    {facilityStats[facility.id]?.partners || 0}
                                </span>
                                <span className="text-gray-600">Đối tác</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {facilities.length === 0 && (
                <div className="text-center py-12 bg-gray-50 rounded-lg">
                    <p className="text-gray-600">Chưa có chi nhánh nào. Tạo chi nhánh đầu tiên!</p>
                </div>
            )}

            {/* Create/Edit Modal */}
            {(isCreateModalOpen || isEditModalOpen) && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                        <div className="flex justify-between items-center border-b p-4">
                            <h2 className="text-xl font-bold text-gray-800">
                                {isCreateModalOpen ? 'Tạo Chi Nhánh Mới' : 'Sửa Chi Nhánh'}
                            </h2>
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setIsEditModalOpen(false);
                                    resetForm();
                                }}
                                className="text-gray-500 hover:text-gray-800 text-2xl"
                            >
                                &times;
                            </button>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tên chi nhánh *
                                </label>
                                <input
                                    type="text"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    placeholder="vd: Chi nhánh Hà Nội"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Địa chỉ
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    rows={2}
                                    placeholder="Địa chỉ chi nhánh"
                                />
                            </div>
                        </div>

                        <div className="border-t p-4 flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsCreateModalOpen(false);
                                    setIsEditModalOpen(false);
                                    resetForm();
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={isCreateModalOpen ? handleCreate : handleEdit}
                                disabled={!formData.name}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {isCreateModalOpen ? 'Tạo' : 'Cập nhật'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {isDeleteModalOpen && selectedFacility && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-lg font-bold text-gray-900 mb-4">Xác nhận xóa</h3>
                        <p className="text-gray-600 mb-2">
                            Bạn có chắc chắn muốn xóa chi nhánh <strong>{selectedFacility.name}</strong>?
                        </p>
                        {facilityStats[selectedFacility.id] && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded p-3 mb-4">
                                <p className="text-sm text-yellow-800">
                                    Chi nhánh này có <strong>{facilityStats[selectedFacility.id].users} users</strong> và{' '}
                                    <strong>{facilityStats[selectedFacility.id].partners} đối tác</strong>.
                                </p>
                            </div>
                        )}
                        <p className="text-sm text-gray-500 mb-6">Hành động này không thể hoàn tác.</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setIsDeleteModalOpen(false);
                                    setSelectedFacility(null);
                                }}
                                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleDelete}
                                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                            >
                                Xóa
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminFacilities;
