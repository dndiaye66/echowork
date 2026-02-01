import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/Config';
import Navbar from '../../components/navbar';
import Foot from '../../components/Foot';
import {
  TrendingUp,
  Users,
  Building2,
  MessageSquare,
  Star,
  Award,
  Download,
} from 'lucide-react';

function AnalyticsPage() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userAnalytics, setUserAnalytics] = useState(null);
  const [companyAnalytics, setCompanyAnalytics] = useState(null);
  const [reviewAnalytics, setReviewAnalytics] = useState(null);
  const [topCompanies, setTopCompanies] = useState([]);
  const [topCategories, setTopCategories] = useState([]);
  const [period, setPeriod] = useState('month');

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      alert('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
    fetchAnalytics();
  }, [isAuthenticated, user, navigate, period]);

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const [users, companies, reviews, topComp, topCat] = await Promise.all([
        axios.get(`/admin/analytics/users?period=${period}`),
        axios.get('/admin/analytics/companies'),
        axios.get('/admin/analytics/reviews'),
        axios.get('/admin/analytics/top-companies?limit=10'),
        axios.get('/admin/analytics/top-categories?limit=10'),
      ]);

      setUserAnalytics(users.data);
      setCompanyAnalytics(companies.data);
      setReviewAnalytics(reviews.data);
      setTopCompanies(topComp.data);
      setTopCategories(topCat.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      alert('Failed to load analytics');
    } finally {
      setLoading(false);
    }
  };

  const handleExport = async (type) => {
    try {
      const response = await axios.get(`/admin/export/${type}`);
      
      // Convert to CSV
      if (response.data && response.data.length > 0) {
        const headers = Object.keys(response.data[0]);
        const csvContent = [
          headers.join(','),
          ...response.data.map((row) =>
            headers.map((header) => `"${row[header] || ''}"`).join(',')
          ),
        ].join('\n');

        // Download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        alert(`${type.charAt(0).toUpperCase() + type.slice(1)} exported successfully`);
      } else {
        alert('No data to export');
      }
    } catch (error) {
      console.error(`Failed to export ${type}:`, error);
      alert(`Failed to export ${type}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="loading loading-spinner loading-lg"></div>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-base-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold flex items-center gap-2">
              <TrendingUp size={40} />
              Analytics & Reports
            </h1>
            <div className="flex gap-2">
              <button
                onClick={() => handleExport('users')}
                className="btn btn-sm btn-outline gap-2"
              >
                <Download size={16} />
                Users CSV
              </button>
              <button
                onClick={() => handleExport('companies')}
                className="btn btn-sm btn-outline gap-2"
              >
                <Download size={16} />
                Companies CSV
              </button>
              <button
                onClick={() => handleExport('reviews')}
                className="btn btn-sm btn-outline gap-2"
              >
                <Download size={16} />
                Reviews CSV
              </button>
            </div>
          </div>

          {/* User Analytics */}
          {userAnalytics && (
            <div className="card bg-base-100 shadow-xl mb-6">
              <div className="card-body">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="card-title text-2xl flex items-center gap-2">
                    <Users size={24} />
                    User Analytics
                  </h2>
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value)}
                    className="select select-bordered select-sm"
                  >
                    <option value="day">Last 24 Hours</option>
                    <option value="week">Last Week</option>
                    <option value="month">Last Month</option>
                    <option value="all">All Time</option>
                  </select>
                </div>
                <div className="stats stats-vertical lg:stats-horizontal shadow">
                  <div className="stat">
                    <div className="stat-title">New Users</div>
                    <div className="stat-value text-primary">{userAnalytics.totalUsers}</div>
                    <div className="stat-desc">In selected period</div>
                  </div>
                </div>

                {/* User registrations chart (simple display) */}
                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Registrations by Date</h3>
                  <div className="overflow-x-auto">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {Object.entries(userAnalytics.usersByDate || {}).map(([date, count]) => (
                          <tr key={date}>
                            <td>{date}</td>
                            <td>
                              <div className="flex items-center gap-2">
                                <div
                                  className="bg-primary h-4 rounded"
                                  style={{ width: `${Math.min(count * 20, 200)}px` }}
                                ></div>
                                <span className="font-semibold">{count}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Company Analytics */}
          {companyAnalytics && (
            <div className="card bg-base-100 shadow-xl mb-6">
              <div className="card-body">
                <h2 className="card-title text-2xl flex items-center gap-2 mb-4">
                  <Building2 size={24} />
                  Company Analytics
                </h2>
                <div className="stats stats-vertical lg:stats-horizontal shadow">
                  <div className="stat">
                    <div className="stat-title">Total Companies</div>
                    <div className="stat-value text-secondary">
                      {companyAnalytics.totalCompanies}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Verified</div>
                    <div className="stat-value text-success">
                      {companyAnalytics.verifiedCompanies}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Claimed</div>
                    <div className="stat-value text-accent">
                      {companyAnalytics.claimedCompanies}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Companies by Category</h3>
                  <div className="overflow-x-auto">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Category</th>
                          <th>Count</th>
                        </tr>
                      </thead>
                      <tbody>
                        {companyAnalytics.companiesByCategory.map((cat) => (
                          <tr key={cat.id}>
                            <td>{cat.name}</td>
                            <td>
                              <div className="flex items-center gap-2">
                                <div
                                  className="bg-secondary h-4 rounded"
                                  style={{
                                    width: `${Math.min(cat._count.companies * 10, 200)}px`,
                                  }}
                                ></div>
                                <span className="font-semibold">{cat._count.companies}</span>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Review Analytics */}
          {reviewAnalytics && (
            <div className="card bg-base-100 shadow-xl mb-6">
              <div className="card-body">
                <h2 className="card-title text-2xl flex items-center gap-2 mb-4">
                  <MessageSquare size={24} />
                  Review Analytics
                </h2>
                <div className="stats stats-vertical lg:stats-horizontal shadow">
                  <div className="stat">
                    <div className="stat-title">Total Reviews</div>
                    <div className="stat-value">{reviewAnalytics.totalReviews}</div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Approved</div>
                    <div className="stat-value text-success">
                      {reviewAnalytics.approvedReviews}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Pending</div>
                    <div className="stat-value text-warning">
                      {reviewAnalytics.pendingReviews}
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-title">Rejected</div>
                    <div className="stat-value text-error">
                      {reviewAnalytics.rejectedReviews}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold mb-2">Rating Distribution</h3>
                  <div className="space-y-2">
                    {[5, 4, 3, 2, 1].map((rating) => (
                      <div key={rating} className="flex items-center gap-2">
                        <span className="w-12 font-semibold">{rating} ⭐</span>
                        <div className="flex-1 bg-base-200 rounded-full h-6 overflow-hidden">
                          <div
                            className="bg-warning h-full flex items-center justify-end pr-2"
                            style={{
                              width: `${
                                reviewAnalytics.totalReviews > 0
                                  ? (reviewAnalytics.ratingDistribution[rating] /
                                      reviewAnalytics.totalReviews) *
                                    100
                                  : 0
                              }%`,
                            }}
                          >
                            <span className="text-xs font-semibold text-white">
                              {reviewAnalytics.ratingDistribution[rating] || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Companies and Categories */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top Companies */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl flex items-center gap-2 mb-4">
                  <Award size={24} />
                  Top 10 Companies
                </h2>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Company</th>
                        <th>Rating</th>
                        <th>Reviews</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCompanies.map((company, index) => (
                        <tr key={company.id}>
                          <td>{index + 1}</td>
                          <td>
                            <div>
                              <div className="font-semibold">{company.name}</div>
                              <div className="text-xs text-gray-500">{company.category}</div>
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-1">
                              <Star size={14} className="text-warning fill-warning" />
                              <span className="font-semibold">{company.averageRating}</span>
                            </div>
                          </td>
                          <td>{company.reviewCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Top Categories */}
            <div className="card bg-base-100 shadow-xl">
              <div className="card-body">
                <h2 className="card-title text-2xl flex items-center gap-2 mb-4">
                  <TrendingUp size={24} />
                  Top 10 Categories
                </h2>
                <div className="overflow-x-auto">
                  <table className="table table-sm">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Category</th>
                        <th>Companies</th>
                        <th>Reviews</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topCategories.map((category, index) => (
                        <tr key={category.id}>
                          <td>{index + 1}</td>
                          <td className="font-semibold">{category.name}</td>
                          <td>{category.totalCompanies}</td>
                          <td>{category.totalReviews}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Foot />
    </>
  );
}

export default AnalyticsPage;
