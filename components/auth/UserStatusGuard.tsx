import React, { useEffect, useState } from 'react';
import { useBranch } from '../../contexts/BranchContext';
import PendingApproval from '../../pages/PendingApproval';
import { EmployeeStatus } from '../../types';

interface UserStatusGuardProps {
    children: React.ReactNode;
}

const UserStatusGuard: React.FC<UserStatusGuardProps> = ({ children }) => {
    const { currentUser, loading } = useBranch();
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        if (!loading && currentUser) {
            // Check via Role (Guest) or Status (Pending)
            // Assuming we map 'Pennig' status correctly or Role 'Guest'
            // The logic: If user is Pending OR (Role is Guest AND not specifically Admin)

            // Note: BranchContext maps status from DB. Check typical 'Pending' values
            const status = (currentUser as any).status || ''; // Casting if status missing in interface
            const role = currentUser.role || '';

            // Condition: Status is Pending OR Role is Guest
            if (status === 'Pending' || status === 'Chờ phê duyệt' || role === 'Guest') {
                setIsPending(true);
            } else {
                setIsPending(false);
            }
        }
    }, [currentUser, loading]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (isPending) {
        return <PendingApproval />;
    }

    return <>{children}</>;
};

export default UserStatusGuard;
