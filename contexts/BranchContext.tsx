import React, { createContext, useState, useContext, useMemo, ReactNode, useEffect } from 'react';
import { facilityService, Facility } from '../src/services/facilityService';
import { supabase } from '../src/supabaseClient';
import { userService } from '../src/services/userService';
import { User } from '../types';

interface CurrentUser {
  id: number;
  name: string;
  role: string;
  branch: string;
  facility_id?: string; // New: Current user's primary facility ID
  assigned_facilities?: Array<{ id: string; name: string; is_primary: boolean }>; // All assigned facilities
  avatar: string;
  email?: string;
  phone?: string;
  is_admin?: boolean;
  permissions?: Array<{ module: string; action: string }>;
}

interface BranchContextType {
  selectedBranch: string;
  selectedFacilityId: string | null; // New: Facility ID for filtering
  setSelectedBranch: (branch: string) => void;
  availableBranches: string[];
  facilities: Facility[];
  currentUser: CurrentUser | null;
  loading: boolean;
  can: (module: string, action: string) => boolean;
}

const BranchContext = createContext<BranchContextType | undefined>(undefined);

export const BranchProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>('Tất cả chi nhánh');
  const [selectedFacilityId, setSelectedFacilityId] = useState<string | null>(null);

  // Add 'Quản trị viên' and other localized roles
  const allAccessRoles = ['Admin', 'admin', 'Quản trị viên', 'Kế toán HO', 'Ban Lãnh đạo'];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const facilitiesData = await facilityService.getFacilities();
      setFacilities(facilitiesData);

      const { data: { user: authUser } } = await supabase.auth.getUser();

      if (authUser) {
        // Build query for vgvina_users
        let query = supabase
          .from('vgvina_users')
          .select(`
            *,
            role_details:role_id (
                id,
                name,
                display_name,
                is_admin,
                permissions:vgvina_role_permissions (
                    permission:permission_id (
                        module,
                        action
                    )
                )
            ),
            facilities:vgvina_user_facilities (
                is_primary,
                facility_id,
                facility:vgvina_facilities (
                    name
                )
            )
          `);

        // Match by email OR phone_number, but ONLY if they are not null/undefined
        const filterParts = [];
        if (authUser.email) filterParts.push(`email.eq.${authUser.email}`);
        if (authUser.phone) filterParts.push(`phone_number.eq.${authUser.phone}`);

        if (filterParts.length === 0) {
          console.warn('[BranchContext] Auth user has no email or phone');
          setLoading(false);
          return;
        }

        const { data: matchedUser, error: userError } = await query
          .or(filterParts.join(','))
          .maybeSingle();

        if (userError) {
          console.error('[BranchContext] Error fetching user profile:', userError);
        }

        if (matchedUser) {
          const isAdmin = matchedUser.role_details?.is_admin === true ||
            ['admin', 'Admin', 'Quản trị viên', 'Kế toán HO', 'Ban Lãnh đạo'].includes(matchedUser.role);

          // Build full list of assigned facilities (preserve primary-first ordering)
          const rawFacilities = (matchedUser.facilities as any[]) || [];
          const assignedFacilities = rawFacilities
            .filter(f => f.facility_id && f.facility?.name)
            .map(f => ({
              id: f.facility_id as string,
              name: f.facility.name as string,
              is_primary: !!f.is_primary,
            }))
            .sort((a, b) => Number(b.is_primary) - Number(a.is_primary));

          const primaryFacility = assignedFacilities.find(f => f.is_primary) || assignedFacilities[0];
          const facilityName = primaryFacility?.name || (isAdmin ? 'Tất cả chi nhánh' : 'Chưa gán');
          const facilityId = primaryFacility?.id;

          const roleName = matchedUser.role_details?.display_name ||
            matchedUser.role_details?.name ||
            matchedUser.role ||
            'User';

          setCurrentUser({
            id: Number(matchedUser.id),
            name: matchedUser.full_name,
            role: roleName,
            branch: facilityName,
            facility_id: facilityId,
            assigned_facilities: assignedFacilities,
            avatar: 'https://ui-avatars.com/api/?name=' + encodeURIComponent(matchedUser.full_name),
            email: matchedUser.email,
            phone: matchedUser.phone_number,
            is_admin: isAdmin,
            permissions: (matchedUser.role_details as any)?.permissions?.map((p: any) => ({
              module: p.permission?.module,
              action: p.permission?.action
            })) || []
          });

          // Set a direct facility fallback so staff still get scoped data even if
          // the branch-name sync cannot resolve immediately.
          if (!isAdmin && facilityId) {
            setSelectedBranch(facilityName);
            setSelectedFacilityId(facilityId);
          }
        } else {
          // Fallback
          setCurrentUser({
            id: 0,
            name: authUser.email || 'User',
            role: 'Admin',
            branch: 'Tất cả chi nhánh',
            avatar: 'https://ui-avatars.com/api/?name=User',
            email: authUser.email,
            is_admin: true,
            permissions: [{ module: '*', action: '*' }]
          });
        }
      } else {
        console.warn('[BranchContext] No auth user found');
      }
    } catch (error) {
      console.error('[BranchContext] Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const availableBranches = useMemo(() => {
    if (!currentUser || loading) return ['Tất cả chi nhánh'];

    // Check is_admin OR role
    const canSeeAll = currentUser.is_admin || allAccessRoles.includes(currentUser.role);
    const branchNames = facilities.map(f => f.name);

    if (canSeeAll) {
      return ['Tất cả chi nhánh', ...branchNames];
    }

    // Non-admin: show all facilities the user has been assigned to (one-by-one switch).
    // We intentionally don't offer "Tất cả chi nhánh" here because most pages filter
    // by a single facility_id; aggregating across multiple assignments would require
    // wider plumbing and isn't needed for current use cases.
    const assigned = currentUser.assigned_facilities || [];
    if (assigned.length === 0) return [currentUser.branch];
    return assigned.map(f => f.name);
  }, [currentUser, facilities, loading]);

  // Update selectedBranch when availableBranches changes
  useEffect(() => {
    if (availableBranches.length > 0) {
      const isCurrentSelectedValid = availableBranches.includes(selectedBranch);
      if (!isCurrentSelectedValid) {
        setSelectedBranch(availableBranches[0]);
      }
    }
  }, [availableBranches]);

  // Sync selectedFacilityId with selectedBranch
  useEffect(() => {
    if (selectedBranch === 'Tất cả chi nhánh') {
      if (currentUser?.facility_id && !currentUser.is_admin) {
        setSelectedFacilityId(currentUser.facility_id);
      } else {
        setSelectedFacilityId(null);
      }
    } else {
      const facility = facilities.find(f => f.name === selectedBranch);
      if (facility) {
        setSelectedFacilityId(facility.id || null);
      } else if (currentUser?.facility_id && !currentUser.is_admin) {
        // If the name lookup fails, keep the authenticated user's primary facility.
        setSelectedFacilityId(currentUser.facility_id);
      }
    }
  }, [selectedBranch, facilities, currentUser]);

  const can = (module: string, action: string): boolean => {
    if (!currentUser) return false;
    if (currentUser.is_admin) return true;
    if (!currentUser.permissions) return false;

    return currentUser.permissions.some(p =>
      (p.module === module || p.module === '*') &&
      (p.action === action || p.action === '*')
    );
  };

  const value = {
    selectedBranch,
    selectedFacilityId,
    setSelectedBranch,
    availableBranches,
    facilities,
    currentUser,
    loading,
    can
  };

  return (
    <BranchContext.Provider value={value}>
      {children}
    </BranchContext.Provider>
  );
};

export const useBranch = (): BranchContextType => {
  const context = useContext(BranchContext);
  if (context === undefined) {
    throw new Error('useBranch must be used within a BranchProvider');
  }
  return context;
};
