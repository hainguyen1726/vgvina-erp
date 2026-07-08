import React, { useState, useEffect } from 'react';
import { Partner } from '../../types';
import { facilityService, Facility } from '../../src/services/facilityService';
import { partnerFacilityService } from '../../src/services/partnerFacilityService';
import { useNotification } from '../../contexts/NotificationContext';
import ConfirmationModal from './ConfirmationModal';

interface AssignFacilitiesModalProps {
    partner: Partner | null;
    isOpen: boolean;
    onClose: () => void;
    onSave: () => void;
}

const AssignFacilitiesModal: React.FC<AssignFacilitiesModalProps> = ({ partner, isOpen, onClose, onSave }) => {
    const [showConfirmClose, setShowConfirmClose] = useState(false);

    const handleRequestClose = () => {
        setShowConfirmClose(true);
    };

    // ESC Handled below
    const { showNotification } = useNotification();
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [selectedFacilityIds, setSelectedFacilityIds] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen && partner) {
            fetchData();
        }
    }, [isOpen, partner]);

    // Handle ESC key to close modal
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen && !showConfirmClose) {
                handleRequestClose();
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose, showConfirmClose]);

    const fetchData = async () => {
        try {
            const [facilitiesData, partnerFacilities] = await Promise.all([
                facilityService.getFacilities(),
                partnerFacilityService.getPartnerFacilities(partner!.id)
            ]);

            setFacilities(facilitiesData);
            setSelectedFacilityIds(partnerFacilities);
        } catch (error) {
            console.error('Error fetching data:', error);
            showNotification('Lỗi khi tải dữ liệu', 'error');
        }
    };

    const handleSave = async () => {
        if (!partner) return;

        setLoading(true);
        try {
            await partnerFacilityService.assignFacilities(partner.id, selectedFacilityIds);
            showNotification('Gán chi nhánh thành công!', 'success');
            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving facilities:', error);
            showNotification('Lỗi khi gán chi nhánh', 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleFacility = (facilityId: string) => {
        setSelectedFacilityIds(prev => {
            if (prev.includes(facilityId)) {
                return prev.filter(id => id !== facilityId);
            } else {
                return [...prev, facilityId];
            }
        });
    };

    const selectAll = () => {
        setSelectedFacilityIds(facilities.map(f => f.id));
    };

    const deselectAll = () => {
        setSelectedFacilityIds([]);
    };

    if (!isOpen || !partner) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center border-b p-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-800">Gán Chi nhánh</h2>
                        <p className="text-sm text-gray-600 mt-1">{partner.name}</p>
                    </div>
                    <button
                        onClick={handleRequestClose}
                        className="text-gray-500 hover:text-gray-800 text-2xl"
                    >
                        &times;
                    </button>
                </div>

                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                            Chọn chi nhánh ({selectedFacilityIds.length}/{facilities.length})
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={selectAll}
                                className="text-xs text-blue-600 hover:text-blue-800"
                            >
                                Chọn tất cả
                            </button>
                            <span className="text-gray-400">|</span>
                            <button
                                onClick={deselectAll}
                                className="text-xs text-blue-600 hover:text-blue-800"
                            >
                                Bỏ chọn
                            </button>
                        </div>
                    </div>

                    <div className="border border-gray-300 rounded-lg p-4 space-y-2 max-h-96 overflow-y-auto">
                        {facilities.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-4">
                                Chưa có chi nhánh nào. Vui lòng tạo chi nhánh trước.
                            </p>
                        ) : (
                            facilities.map(facility => {
                                const isSelected = selectedFacilityIds.includes(facility.id);

                                return (
                                    <div
                                        key={facility.id}
                                        className={`flex items-start p-3 rounded hover:bg-gray-50 ${isSelected ? 'bg-blue-50 border border-blue-200' : 'border border-transparent'
                                            }`}
                                    >
                                        <label className="flex items-start space-x-3 cursor-pointer flex-1">
                                            <input
                                                type="checkbox"
                                                checked={isSelected}
                                                onChange={() => toggleFacility(facility.id)}
                                                className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900">
                                                    {facility.name}
                                                </p>
                                                {facility.address && (
                                                    <p className="text-xs text-gray-500 mt-0.5">
                                                        {facility.address}
                                                    </p>
                                                )}
                                            </div>
                                        </label>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <p className="mt-3 text-xs text-gray-500">
                        Đối tác này sẽ hiển thị cho users thuộc các chi nhánh được chọn.
                        Admin và Giám đốc của chi nhánh sẽ có quyền xem và quản lý.
                    </p>
                </div>

                <div className="border-t p-4 flex justify-end gap-3">
                    <button
                        onClick={handleRequestClose}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                    >
                        Hủy
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Đang lưu...' : 'Lưu'}
                    </button>
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

export default AssignFacilitiesModal;
