import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import ProtectedRoute from './ProtectedRoute';

// Layouts
import MainLayout from '../layouts/MainLayout';
import TenantLayout from '../layouts/TenantLayout';
import LandlordLayout from '../layouts/LandlordLayout';
import AdminLayout from '../layouts/AdminLayout';

// Eager load LandingPage for instant first paint
import LandingPage from '../pages/public/LandingPage';

// Lazy load secondary public & auth pages
const SearchResults = lazy(() => import('../pages/public/SearchResults'));
const RoomDetail = lazy(() => import('../pages/public/RoomDetail'));
const AuthPage = lazy(() => import('../pages/public/AuthPage'));
const ForgotPassword = lazy(() => import('../pages/public/ForgotPassword'));
const TermsOfService = lazy(() => import('../pages/public/TermsOfService'));
const PrivacyPolicy = lazy(() => import('../pages/public/PrivacyPolicy'));
const NotFound = lazy(() => import('../pages/public/NotFound'));
const PaymentReturn = lazy(() => import('../pages/payment/PaymentReturn'));

// Lazy load Tenant Pages
const TenantDashboard = lazy(() => import('../pages/tenant/TenantDashboard'));
const TenantApplications = lazy(() => import('../pages/tenant/TenantApplications'));
const TenantViewings = lazy(() => import('../pages/tenant/TenantViewings'));
const TenantLeases = lazy(() => import('../pages/tenant/TenantLeases'));
const RoommateMatcher = lazy(() => import('../pages/tenant/RoommateMatcher'));
const CreateRoommatePost = lazy(() => import('../pages/tenant/CreateRoommatePost'));
const TenantChatCenter = lazy(() => import('../pages/tenant/TenantChatCenter'));
const TenantProfile = lazy(() => import('../pages/tenant/TenantProfile'));
const TenantSettings = lazy(() => import('../pages/tenant/TenantSettings'));

// Lazy load Landlord Pages
const LandlordDashboard = lazy(() => import('../pages/landlord/LandlordDashboard'));
const LandlordApplications = lazy(() => import('../pages/landlord/LandlordApplications'));
const LandlordViewings = lazy(() => import('../pages/landlord/LandlordViewings'));
const LandlordLeases = lazy(() => import('../pages/landlord/LandlordLeases'));
const LeadAnalytics = lazy(() => import('../pages/landlord/LeadAnalytics'));
const SmartListingForm = lazy(() => import('../pages/landlord/SmartListingForm'));
const RoomManagement = lazy(() => import('../pages/landlord/RoomManagement'));
const TenantDiscovery = lazy(() => import('../pages/landlord/TenantDiscovery'));
const PricingCheckout = lazy(() => import('../pages/landlord/PricingCheckout'));
const BillingHistory = lazy(() => import('../pages/landlord/BillingHistory'));
const VerificationCenter = lazy(() => import('../pages/landlord/VerificationCenter'));
const LandlordChatCenter = lazy(() => import('../pages/landlord/LandlordChatCenter'));
const LandlordSettings = lazy(() => import('../pages/landlord/LandlordSettings'));

// Lazy load Admin Pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const VerificationModeration = lazy(() => import('../pages/admin/VerificationModeration'));
const ContentModeration = lazy(() => import('../pages/admin/ContentModeration'));
const AdminUsers = lazy(() => import('../pages/admin/AdminUsers'));
const AdminReports = lazy(() => import('../pages/admin/AdminReports'));
const AdminTransactions = lazy(() => import('../pages/admin/AdminTransactions'));

function RouteLoading() {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteLoading />}>
      <Routes>
      {/* PUBLIC ROUTES (Guest) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/room/:id" element={<RoomDetail />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/register" element={<Navigate to="/auth?tab=register" replace />} />
        <Route path="/auth/reset" element={<ForgotPassword />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms-of-service" element={<Navigate to="/terms" replace />} />
        <Route path="/privacy-policy" element={<Navigate to="/privacy" replace />} />
        <Route path="/dieu-khoan" element={<Navigate to="/terms" replace />} />
        <Route path="/chinh-sach-bao-mat" element={<Navigate to="/privacy" replace />} />
        <Route path="/payment/return" element={<PaymentReturn />} />
        
        {/* Legacy Redirects */}
        <Route path="/customer/matcher" element={<Navigate to="/tenant/match" replace />} />
      </Route>

      {/* TENANT ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['Tenant']} />}>
        <Route path="/tenant" element={<TenantLayout />}>
          <Route index element={<TenantDashboard />} />
          <Route path="applications" element={<TenantApplications />} />
          <Route path="viewings" element={<TenantViewings />} />
          <Route path="leases" element={<TenantLeases />} />
          <Route path="appointments" element={<Navigate to="/tenant/viewings" replace />} />
          <Route path="match" element={<RoommateMatcher />} />
          <Route path="post" element={<CreateRoommatePost />} />
          <Route path="chat" element={<TenantChatCenter />} />
          <Route path="profile" element={<TenantProfile />} />
          <Route path="settings" element={<TenantSettings />} />
        </Route>
      </Route>

      {/* LANDLORD ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['Landlord']} />}>
        <Route path="/landlord" element={<LandlordLayout />}>
          <Route index element={<LandlordDashboard />} />
          <Route path="applications" element={<LandlordApplications />} />
          <Route path="viewings" element={<LandlordViewings />} />
          <Route path="leases" element={<LandlordLeases />} />
          <Route path="appointments" element={<Navigate to="/landlord/viewings" replace />} />
          <Route path="analytics" element={<LeadAnalytics />} />
          <Route path="create" element={<SmartListingForm />} />
          <Route path="listing/new" element={<SmartListingForm />} />
          <Route path="create-room" element={<SmartListingForm />} />
          <Route path="new" element={<SmartListingForm />} />
          <Route path="rooms" element={<RoomManagement />} />
          <Route path="discover" element={<TenantDiscovery />} />
          <Route path="pricing" element={<PricingCheckout />} />
          <Route path="billing" element={<BillingHistory />} />
          <Route path="verify" element={<VerificationCenter />} />
          <Route path="chat" element={<LandlordChatCenter />} />
          <Route path="settings" element={<LandlordSettings />} />
          <Route path="dashboard" element={<Navigate to="/landlord" replace />} />
          <Route path="messages" element={<Navigate to="/landlord/chat" replace />} />
          <Route path="kyc" element={<Navigate to="/landlord/verify" replace />} />
        </Route>
      </Route>

      {/* ADMIN ROUTES */}
      <Route element={<ProtectedRoute allowedRoles={['Admin']} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="verify" element={<VerificationModeration />} />
          <Route path="rooms" element={<ContentModeration />} />
          <Route path="content" element={<ContentModeration />} />
          <Route path="users" element={<AdminUsers />} />
          <Route path="reports" element={<AdminReports />} />
          <Route path="transactions" element={<AdminTransactions />} />
        </Route>
      </Route>

      {/* 404 NOT FOUND */}
      <Route element={<MainLayout />}>
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
    </Suspense>
  );
}
