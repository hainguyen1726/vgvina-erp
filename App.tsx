import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './src/supabaseClient';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import IncomeExpense from './pages/IncomeExpense';
import Warehouse from './pages/Warehouse';
import SalesOrders from './pages/SalesOrders';
import Debt from './pages/Debt';
import Partners from './pages/Partners';
import Users from './pages/Users';
import UserProfile from './pages/UserProfile';
import Admin from './pages/Admin';
import ReportsLanding from './pages/ReportsLanding';
import ReportIncomeExpenseCategory from './pages/ReportIncomeExpenseCategory';
import ReportIncomeExpensePartner from './pages/ReportIncomeExpensePartner';
import ReportDuplicates from './pages/ReportDuplicates';
import AdminAccounts from './pages/AdminAccounts';
import AdminCategories from './pages/AdminCategories';
import AdminProductCategories from './pages/AdminProductCategories';
import AdminPartners from './pages/AdminPartners';
import { AdminAccountDetail } from './pages/AdminAccountDetail';
import CreateVoucherLanding from './pages/CreateVoucherLanding';
import Returns from './pages/Returns';
import ReportScrapping from './pages/ReportScrapping';
import AdminHistory from './pages/AdminHistory';
import AdminRoles from './pages/AdminRoles';
import AdminFacilities from './pages/AdminFacilities';
import DebtAgingReport from './pages/DebtAgingReport';
import { BranchProvider, useBranch } from './contexts/BranchContext';
import UserStatusGuard from './components/auth/UserStatusGuard';
import More from './pages/More';
import ReportInternalTransfer from './pages/ReportInternalTransfer';
import ReportProductSales from './pages/ReportProductSales';
import ReportInventorySummary from './pages/ReportInventorySummary';
import Login from './pages/Login';
import Register from './pages/Register';
import PartnerStatement from './pages/PartnerStatement';
import { NotificationProvider } from './contexts/NotificationContext';
import Notification from './components/ui/Notification';

const RequireAdmin = ({ children }: { children: React.ReactElement }) => {
  const { currentUser } = useBranch();

  // Wait for user to load
  if (!currentUser || !currentUser.role) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  // Check if user is admin using multiple criteria
  const isAdmin =
    currentUser.is_admin === true ||
    currentUser.role?.toLowerCase() === 'admin' ||
    currentUser.role === 'Admin' ||
    currentUser.role === 'Quản trị viên';

  if (!isAdmin) {
    console.warn('[RequireAdmin] Access denied - redirecting to dashboard');
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Helper component to protect routes by permission
const RequirePermission = ({ module, action = 'view', children }: { module: string; action?: string; children: React.ReactElement }) => {
  const { currentUser, can, loading } = useBranch();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return <Navigate to="/login" replace />;

  if (!can(module, action)) {
    console.warn(`[RequirePermission] Access denied for ${module}:${action} - redirecting to dashboard`);
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Protected routes wrapper
const ProtectedRoutes = ({ children }: { children: React.ReactElement }) => {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const isHkd = typeof window !== 'undefined' && window.location.hostname === 'hkd.vgvina.com';
    if (isHkd) {
      const localUser = localStorage.getItem('hkd_user');
      if (localUser) {
        setSession({ user: JSON.parse(localUser) });
      } else {
        setSession(null);
      }
      setLoading(false);
      return;
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App: React.FC = () => {
  useEffect(() => {
    const isHkd = typeof window !== 'undefined' && window.location.hostname === 'hkd.vgvina.com';
    if (isHkd) {
      document.title = 'Tuổi Ngọc';
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.rel = 'icon';
        document.getElementsByTagName('head')[0].appendChild(link);
      }
      link.href = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="90" font-size="90">💚</text></svg>';
    } else {
      document.title = 'VGVINA';
      let link = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (link) {
        link.href = '/favicon.ico';
      }
    }
  }, []);

  return (
    <NotificationProvider>
      <Notification />
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoutes>
                <BranchProvider>
                  <UserStatusGuard>
                    <Layout>
                      <Routes>
                        <Route path="/" element={<Navigate to="/dashboard" replace />} />
                        <Route path="/dashboard" element={<Dashboard />} />
                        <Route path="/thu-chi" element={<RequirePermission module="financial_transactions"><IncomeExpense /></RequirePermission>} />
                        <Route path="/tao-phieu" element={<CreateVoucherLanding />} />
                        <Route path="/cong-no" element={<RequirePermission module="debt"><Debt /></RequirePermission>} />
                        <Route path="/doi-tac" element={<RequirePermission module="partners"><Partners /></RequirePermission>} />

                        <Route path="/bao-cao" element={<RequirePermission module="reports"><ReportsLanding /></RequirePermission>} />
                        <Route path="/bao-cao/xuat-nhap" element={<SalesOrders />} />
                        <Route path="/bao-cao/ton-kho" element={<RequirePermission module="inventory"><Warehouse /></RequirePermission>} />
                        <Route path="/bao-cao/ban-hang-hang-hoa" element={<ReportProductSales />} />
                        <Route path="/bao-cao/xuat-nhap-ton" element={<ReportInventorySummary />} />
                        <Route path="/bao-cao/chuyen-kho" element={<ReportInternalTransfer />} />
                        <Route path="/bao-cao/thu-chi-hang-muc" element={<ReportIncomeExpenseCategory />} />
                        <Route path="/bao-cao/thu-chi-doi-tuong" element={<ReportIncomeExpensePartner />} />
                        <Route path="/bao-cao/trung-lap" element={<ReportDuplicates />} />
                        <Route path="/bao-cao/tra-hang" element={<Returns />} />
                        <Route path="/bao-cao/so-chi-tiet-cong-no" element={<PartnerStatement />} />
                        <Route path="/bao-cao/huy-hang" element={<ReportScrapping />} />
                        <Route path="/bao-cao-cong-no" element={<DebtAgingReport />} />

                        <Route path="/profile" element={<UserProfile />} />
                        <Route path="/more" element={<More />} />

                        {/* Application of Admin Protection */}
                        <Route path="/admin" element={<RequireAdmin><Admin /></RequireAdmin>} />
                        <Route path="/admin/tai-khoan" element={<RequireAdmin><AdminAccounts /></RequireAdmin>} />
                        <Route path="/admin/tai-khoan/:accountId" element={<RequireAdmin><AdminAccountDetail /></RequireAdmin>} />
                        <Route path="/admin/hang-muc" element={<RequireAdmin><AdminCategories /></RequireAdmin>} />
                        <Route path="/admin/danh-muc-san-pham" element={<RequireAdmin><AdminProductCategories /></RequireAdmin>} />
                        <Route path="/admin/doi-tuong" element={<RequireAdmin><AdminPartners /></RequireAdmin>} />
                        <Route path="/admin/thanh-vien" element={<RequireAdmin><Users /></RequireAdmin>} />
                        <Route path="/admin/history" element={<RequireAdmin><AdminHistory /></RequireAdmin>} />
                        <Route path="/admin/roles" element={<RequireAdmin><AdminRoles /></RequireAdmin>} />
                        <Route path="/admin/chi-nhanh" element={<RequireAdmin><AdminFacilities /></RequireAdmin>} />
                      </Routes>
                    </Layout>
                  </UserStatusGuard>
                </BranchProvider>
              </ProtectedRoutes>
            }
          />
        </Routes>
      </BrowserRouter>
    </NotificationProvider>
  );
};

export default App;