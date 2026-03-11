import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import InstallPrompt from "./components/InstallPrompt";
import BottomNav from "./components/BottomNav";
import CategoryPage from "./pages/CategoryPage";
import VitrinePage from "./pages/VitrinePage";
import CompanyPage from "./pages/CompanyPage";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import AdminDashboard from "./pages/admin/AdminDashboard";
import CompaniesManagement from "./pages/admin/CompaniesManagement";
import JobOffersManagement from "./pages/admin/JobOffersManagement";
import AdvertisementsManagement from "./pages/admin/AdvertisementsManagement";
import UsersManagement from "./pages/admin/UsersManagement";
import ReviewsModeration from "./pages/admin/ReviewsModeration";
import CategoriesManagement from "./pages/admin/CategoriesManagement";
import AnalyticsPage from "./pages/admin/AnalyticsPage";
import AuthCallback from "./pages/AuthCallback";
import ConfirmEmailPage from "./pages/ConfirmEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import OtpVerifyPage from "./pages/OtpVerifyPage";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* ── Public ── */}
          <Route path="/" element={<VitrinePage />} />
          <Route path="/categories/:slug" element={<CategoryPage />} />
          <Route path="/companies/:slug" element={<CompanyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/confirm-email" element={<ConfirmEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/verify-otp" element={<OtpVerifyPage />} />

          {/* ── Admin (ADMIN role only) ── */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/companies"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CompaniesManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/job-offers"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <JobOffersManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/advertisements"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdvertisementsManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <UsersManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/reviews"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <ReviewsModeration />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/categories"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CategoriesManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/analytics"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AnalyticsPage />
              </ProtectedRoute>
            }
          />
        </Routes>
        <BottomNav />
      </Router>
      <InstallPrompt />
    </AuthProvider>
  );
}

export default App;
