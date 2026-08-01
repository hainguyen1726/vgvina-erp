import React, { useState, useEffect } from 'react';
import { SearchIcon, NguoiDungIcon, EditIcon, DeleteIcon } from '../components/icons/Icons';
import { useNotification } from '../contexts/NotificationContext';
import { userService } from '../src/services/userService';
import { facilityService, Facility } from '../src/services/facilityService';
import { User, EmployeeStatus } from '../types';
import EditUserModal from '../components/modals/EditUserModal';
import AddUserModal from '../components/modals/AddUserModal';
import ChangePasswordModal from '../components/modals/ChangePasswordModal';
import { supabase } from '../src/supabaseClient';

// --- Modal Components ---

import ConfirmationModal from '../components/modals/ConfirmationModal';

// User Detail Modal
interface UserDetailModalProps {
  member: User | null;
  onClose: () => void;
  onEdit: (member: User) => void;
  onDelete: (member: User) => void;
  onPasswordReset: (member: User) => void;
}

const UserDetailModal: React.FC<UserDetailModalProps> = ({ member, onClose, onEdit, onDelete, onPasswordReset }) => {
  React.useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    if (member) window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [member, onClose]);
  if (!member) return null;

  // Use placeholder avatar if not provided (userService doesn't return avatar yet, so use UI Avatar or similar)
  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=random`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center border-b p-4">
          <h3 className="text-lg font-semibold text-gray-800">Chi tiết thành viên</h3>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-2xl leading-none">&times;</button>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-4">
            <img src={avatarUrl} alt={member.full_name} className="w-20 h-20 rounded-full" />
            <div>
              <p className="text-xl font-bold text-gray-900">{member.full_name}</p>
              <p className="text-sm text-gray-500">{member.email || 'Chưa cập nhật email'}</p>
              <p className="text-sm text-gray-500">{member.phone}</p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4 items-center text-sm border-t pt-4">
            <p className="text-gray-500 col-span-1">Vai trò:</p>
            <p className="text-gray-800 font-medium col-span-2">{member.role}</p>

            <p className="text-gray-500 col-span-1">Trạng thái:</p>
            <p className="col-span-2">{member.status === EmployeeStatus.DANG_LAM_VIEC
              ? <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">Đang làm việc</span>
              : <span className="px-2 py-1 text-xs font-medium text-red-800 bg-red-100 rounded-full">{member.status}</span>}
            </p>

            <p className="text-gray-500 col-span-1">Chi nhánh:</p>
            <p className="text-gray-800 col-span-2">{member.facility_name}</p>
          </div>
        </div>
        <div className="border-t p-4 flex justify-end items-center bg-gray-50 rounded-b-lg space-x-2">
          <button onClick={() => onPasswordReset(member)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-yellow-50 text-yellow-700 border border-yellow-200 rounded-lg hover:bg-yellow-100">
            Đổi mật khẩu
          </button>
          <button onClick={() => onEdit(member)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50">
            <EditIcon className="w-4 h-4" /> Sửa
          </button>
          <button onClick={() => onDelete(member)} className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium bg-white text-red-600 border border-red-200 rounded-lg hover:bg-red-50">
            <DeleteIcon className="w-4 h-4" /> Xóa
          </button>
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300">Đóng</button>
        </div>
      </div>
    </div>
  );
};


// Facility Dropdown Component with save functionality
const FacilityDropdown: React.FC<{
  userId: number;
  initialFacility: string;
  facilities: Facility[];
  onUpdate: () => void;
}> = ({ userId, initialFacility, facilities, onUpdate }) => {
  const { showNotification } = useNotification();
  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const facilityName = e.target.value;
    const facility = facilities.find(f => f.name === facilityName);

    try {
      await userService.assignFacilities(userId, facility.id ? [facility.id] : [], facility.id);
      onUpdate();
    } catch (error) {
      console.error('Failed to update facility:', error);
      showNotification('Không thể cập nhật chi nhánh', 'error');
    }

  };

  return (
    <select
      defaultValue={initialFacility || ""}
      onChange={handleChange}
      className="text-sm font-medium border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
    >
      <option value="">Chưa gán</option>
      {facilities.map(facility => (
        <option key={facility.id} value={facility.name}>{facility.name}</option>
      ))}
    </select>
  );
};

// Role Dropdown Component with save functionality
const RoleDropdown: React.FC<{
  userId: number;
  initialRoleId: string | null;
  initialRoleName: string;
  onUpdate: () => void;
}> = ({ userId, initialRoleId, initialRoleName, onUpdate }) => {
  const { showNotification } = useNotification();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      const { data, error } = await supabase
        .from('vgvina_roles')
        .select('id, name, display_name')
        .order('created_at', { ascending: true });

      if (error) throw error;
      setRoles(data || []);
    } catch (err) {
      console.error('Error fetching roles for dropdown:', err);
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const roleId = e.target.value;
    if (!roleId) return;

    setLoading(true);
    try {
      // Find the selected role to get its display name (for legacy column update)
      const selectedRole = roles.find(r => r.id === roleId);
      const roleDisplayName = selectedRole?.display_name || selectedRole?.name || 'User';

      // Update BOTH role_id (new system) and role (legacy column)
      const { error } = await supabase
        .from('vgvina_users')
        .update({
          role_id: roleId,
          role: roleDisplayName // Keep legacy column in sync for display consistency
        })
        .eq('id', userId);

      if (error) throw error;
      onUpdate();
    } catch (error) {
      console.error('Failed to update role:', error);
      showNotification('Không thể cập nhật vai trò', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      <select
        value={initialRoleId || ""}
        onChange={handleChange}
        disabled={loading}
        className="block w-full text-sm font-medium border-gray-300 rounded-md shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 disabled:bg-gray-50"
      >
        <option value="" disabled>-- Chọn vai trò --</option>
        {roles.map(role => (
          <option key={role.id} value={role.id}>
            {role.display_name || role.name}
          </option>
        ))}
        {/* If the current role is not in the list (legacy/manual), show it as an option */}
        {initialRoleId === null && initialRoleName && (
          <option value="" disabled>{initialRoleName} (Cũ)</option>
        )}
      </select>
      {loading && (
        <div className="absolute right-8 top-1/2 -translate-y-1/2">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></div>
        </div>
      )}
    </div>
  );
};


const Users: React.FC = () => {
  const [members, setMembers] = useState<User[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<User | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<User | null>(null);
  const [memberToReject, setMemberToReject] = useState<User | null>(null);
  const [memberToEdit, setMemberToEdit] = useState<User | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isChangePasswordModalOpen, setIsChangePasswordModalOpen] = useState(false);
  const [memberToChangePassword, setMemberToChangePassword] = useState<User | null>(null);
  const { showNotification } = useNotification();

  useEffect(() => {
    fetchUsers();
    fetchFacilities();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await userService.getUsers();
      setMembers(data);
    } catch (error) {
      console.error("Failed to fetch users:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFacilities = async () => {
    try {
      const data = await facilityService.getFacilities();
      setFacilities(data);
    } catch (error) {
      console.error("Failed to fetch facilities:", error);
    }
  };

  const handleEdit = (member: User) => {
    setMemberToEdit(member);
    setIsEditModalOpen(true);
    setSelectedMember(null);
  };

  const handleSaveEdit = () => {
    fetchUsers(); // Refresh the list
  };

  const handleAddUser = async (userData: any) => {
    try {
      await userService.createUser(userData);
      showNotification('Tạo thành viên thành công', 'success');
      fetchUsers();
    } catch (error: any) {
      console.error('Failed to create user:', error);
      throw error; // Re-throw to be caught by Modal
    }
  };

  /**
   * Change password for a user
   */
  const handleChangePassword = async (password: string) => {
    if (memberToChangePassword) {
      if (!memberToChangePassword.email) {
        showNotification("Thành viên này không có email, không thể đổi mật khẩu qua hệ thống.", 'warning');
        return;
      }
      try {
        await userService.updateUserPassword(memberToChangePassword.email, password);
        showNotification('Đổi mật khẩu thành công!', 'success');
        setIsChangePasswordModalOpen(false);
        setMemberToChangePassword(null);
      } catch (error: any) {
        console.error('Error changing password:', error);
        showNotification('Lỗi khi đổi mật khẩu: ' + (error.message || 'Không xác định'), 'error');
      }
    }
  };
  const openChangePasswordModal = (member: User) => {
    setMemberToChangePassword(member);
    setIsChangePasswordModalOpen(true);
    // Close detail modal if open
    setSelectedMember(null);
  };

  const handleDelete = (member: User) => {
    setMemberToDelete(member);
    setSelectedMember(null);
  };

  const handleConfirmDelete = async () => {
    if (memberToDelete) {
      try {
        await userService.deleteUser(Number(memberToDelete.id));
        showNotification(`Đã xóa thành viên: ${memberToDelete.full_name}`, 'success');
        setMemberToDelete(null);
        fetchUsers(); // Refresh the list
      } catch (error: any) {
        console.error('Failed to delete user:', error);
        showNotification(error?.message || 'Lỗi khi xóa thành viên.', 'error');
      }
    }
  };

  const handleApprove = async (member: User) => {
    try {
      const { error } = await supabase
        .from('vgvina_users')
        // Set status to Active and Role to user (so they can enter the app)
        .update({
          status: EmployeeStatus.DANG_LAM_VIEC,
          role: 'user'
        })
        .eq('id', member.id);

      if (error) throw error;
      showNotification(`Đã phê duyệt thành viên: ${member.full_name}`, 'success');
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      showNotification('Có lỗi xảy ra khi phê duyệt.', 'error');
    }
  };

  const handleReject = async (member: User) => {
    setMemberToReject(member);
  };

  const handleConfirmReject = async () => {
    if (!memberToReject) return;

    try {
      // Option 1: Set to Inactive
      const { error } = await supabase
        .from('vgvina_users')
        .update({ status: EmployeeStatus.DA_NGHI_VIEC })
        .eq('id', memberToReject.id);

      if (error) throw error;
      fetchUsers();
      setMemberToReject(null);
    } catch (error) {
      console.error('Error rejecting user:', error);
      showNotification('Có lỗi xảy ra khi từ chối.', 'error');
    }
  };

  if (loading) {
    return <div className="p-6">Đang tải dữ liệu...</div>;
  }

  return (
    <>
      <div className="bg-gray-100 min-h-full">
        <div className="bg-[#0066cc] text-white p-6 shadow-md">
          <h1 className="text-2xl font-bold">Quản lý thành viên</h1>
          <p className="mt-1">Phê duyệt và quản lý vai trò của các thành viên</p>
        </div>
        <div className="p-4 sm:p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center text-gray-600">
              <NguoiDungIcon />
              <span className="ml-2 font-semibold">{members.length} thành viên</span>
            </div>
            <div className="flex gap-4">
              <div className="relative w-full max-w-xs">
                <input
                  type="text"
                  placeholder="Tìm kiếm mọi thứ..."
                  className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-[#0066cc]"
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <SearchIcon />
                </div>
              </div>
              <button onClick={() => setIsAddModalOpen(true)} className="flex items-center px-4 py-2 bg-[#0066cc] text-white text-sm font-medium rounded-full hover:bg-[#0052a3]">
                + Thêm thành viên
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {members.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Chưa có thành viên nào.</div>
            ) : (
              members.map(member => (
                <div
                  key={member.id}
                  onClick={() => setSelectedMember(member)}
                  className="bg-white p-4 rounded-lg shadow-sm transition hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4 cursor-pointer"
                >
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.full_name)}&background=random`}
                        alt={member.full_name}
                        className="w-12 h-12 rounded-full"
                      />
                      {member.status === EmployeeStatus.DANG_LAM_VIEC && (
                        <span className="absolute bottom-0 right-0 block h-4 w-4 rounded-full bg-green-500 border-2 border-white">
                          <svg className="h-full w-full text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"></path></svg>
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{member.full_name}</p>
                      <p className="text-sm text-gray-500">{member.email}</p>
                      <div className="mt-2 w-48" onClick={(e) => e.stopPropagation()}>
                        {member.status === EmployeeStatus.CHO_PHE_DUYET ? (
                          <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800">Chờ phê duyệt</span>
                        ) : (
                          <RoleDropdown userId={member.id} initialRoleId={member.role_id} initialRoleName={member.role} onUpdate={fetchUsers} />
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center w-full sm:w-auto space-y-2 sm:space-y-0 sm:space-x-4">
                    <div className="w-full sm:w-48" onClick={(e) => e.stopPropagation()}>
                      {member.status === EmployeeStatus.CHO_PHE_DUYET ? (
                        <div className="text-sm text-gray-500 text-right">Chưa gán chi nhánh</div>
                      ) : !(member as any).is_admin ? (
                        <div>
                          <label className="block text-xs text-gray-500 mb-1 sm:hidden">Chi nhánh</label>
                          <FacilityDropdown
                            userId={member.id}
                            initialFacility={member.facility_name}
                            facilities={facilities}
                            onUpdate={fetchUsers}
                          />
                        </div>
                      ) : (
                        <p className="text-gray-400 italic text-right">Tất cả chi nhánh</p>
                      )}
                    </div>

                    {member.status === EmployeeStatus.CHO_PHE_DUYET && (
                      <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-2" onClick={(e) => e.stopPropagation()}>
                        <div className="flex space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleApprove(member);
                            }}
                            className="flex-1 w-full text-sm bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                          >
                            Phê duyệt
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleReject(member);
                            }}
                            className="flex-1 w-full text-sm bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-md transition duration-300"
                          >
                            Từ chối
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
      <UserDetailModal
        member={selectedMember}
        onClose={() => setSelectedMember(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onPasswordReset={openChangePasswordModal}
      />
      <ConfirmationModal
        isOpen={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Xác nhận Xóa Thành viên"
        message={`Bạn có chắc chắn muốn xóa thành viên "${memberToDelete?.full_name}" không? Hành động này không thể hoàn tác.`}
        confirmText="Xác nhận Xóa"
      />
      <ConfirmationModal
        isOpen={!!memberToReject}
        onClose={() => setMemberToReject(null)}
        onConfirm={handleConfirmReject}
        title="Xác nhận Từ chối"
        message={`Bạn có chắc chắn muốn từ chối yêu cầu của "${memberToReject?.full_name}" không?`}
        confirmText="Từ chối"
      />
      <EditUserModal
        user={memberToEdit}
        isOpen={isEditModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setMemberToEdit(null);
        }}
        onSave={handleSaveEdit}
      />

      <AddUserModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSave={handleAddUser}
      />

      <ChangePasswordModal
        isOpen={isChangePasswordModalOpen}
        onClose={() => { setIsChangePasswordModalOpen(false); setMemberToChangePassword(null); }}
        onSave={handleChangePassword}
        username={memberToChangePassword?.full_name}
      />
    </>
  );
};

export default Users;
