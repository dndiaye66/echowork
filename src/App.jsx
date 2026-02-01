import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
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

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<VitrinePage />} />
          <Route path="/categories/:slug" element={<CategoryPage />} />
          <Route path="/companies/:slug" element={<CompanyPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/companies" element={<CompaniesManagement />} />
          <Route path="/admin/job-offers" element={<JobOffersManagement />} />
          <Route path="/admin/advertisements" element={<AdvertisementsManagement />} />
          <Route path="/admin/users" element={<UsersManagement />} />
          <Route path="/admin/reviews" element={<ReviewsModeration />} />
          <Route path="/admin/categories" element={<CategoriesManagement />} />
          <Route path="/admin/analytics" element={<AnalyticsPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
