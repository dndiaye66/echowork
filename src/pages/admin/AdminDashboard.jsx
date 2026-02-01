import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/Config';
import Navbar from '../../components/navbar';
import Foot from '../../components/Foot';
import { Users, Building2, MessageSquare, Briefcase, TrendingUp, CheckCircle, Clock, Star, FolderTree, BarChart3 } from 'lucide-react';

function AdminDashboard() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      alert('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
    fetchDashboardStats();
  }, [isAuthenticated, user, navigate]);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/admin/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Failed to fetch dashboard stats:', error);
      alert('Failed to load dashboard statistics');
    } finally {
      setLoading(false);
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
          <h1 className="text-4xl font-bold mb-8">Admin Dashboard</h1>
          
          {/* Statistics Cards */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div className="stat bg-base-100 shadow-xl rounded-lg">
                <div className="stat-figure text-primary">
                  <Users size={40} />
                </div>
                <div className="stat-title">Total Users</div>
                <div className="stat-value text-primary">{stats.stats.totalUsers}</div>
                <div className="stat-desc">Registered accounts</div>
              </div>

              <div className="stat bg-base-100 shadow-xl rounded-lg">
                <div className="stat-figure text-secondary">
                  <Building2 size={40} />
                </div>
                <div className="stat-title">Total Companies</div>
                <div className="stat-value text-secondary">{stats.stats.totalCompanies}</div>
                <div className="stat-desc">Listed companies</div>
              </div>

              <div className="stat bg-base-100 shadow-xl rounded-lg">
                <div className="stat-figure text-accent">
                  <MessageSquare size={40} />
                </div>
                <div className="stat-title">Total Reviews</div>
                <div className="stat-value text-accent">{stats.stats.totalReviews}</div>
                <div className="stat-desc">{stats.stats.approvedReviews} approved</div>
              </div>

              <div className="stat bg-base-100 shadow-xl rounded-lg">
                <div className="stat-figure text-warning">
                  <Star size={40} />
                </div>
                <div className="stat-title">Average Rating</div>
                <div className="stat-value text-warning">{stats.stats.averageRating}</div>
                <div className="stat-desc">Out of 5.0</div>
              </div>

              <div className="stat bg-base-100 shadow-xl rounded-lg">
                <div className="stat-figure text-info">
                  <Clock size={40} />
                </div>
                <div className="stat-title">Pending Reviews</div>
                <div className="stat-value text-info">{stats.stats.pendingReviews}</div>
                <div className="stat-desc">Awaiting moderation</div>
              </div>

              <div className="stat bg-base-100 shadow-xl rounded-lg">
                <div className="stat-figure text-success">
                  <CheckCircle size={40} />
                </div>
                <div className="stat-title">Approved Reviews</div>
                <div className="stat-value text-success">{stats.stats.approvedReviews}</div>
                <div className="stat-desc">Published reviews</div>
              </div>

              <div className="stat bg-base-100 shadow-xl rounded-lg">
                <div className="stat-figure text-primary">
                  <Briefcase size={40} />
                </div>
                <div className="stat-title">Job Offers</div>
                <div className="stat-value text-primary">{stats.stats.totalJobOffers}</div>
                <div className="stat-desc">Total postings</div>
              </div>

              <div className="stat bg-base-100 shadow-xl rounded-lg">
                <div className="stat-figure text-secondary">
                  <TrendingUp size={40} />
                </div>
                <div className="stat-title">Advertisements</div>
                <div className="stat-value text-secondary">{stats.stats.activeAdvertisements}</div>
                <div className="stat-desc">of {stats.stats.totalAdvertisements} total</div>
              </div>
            </div>
          )}

          {/* Management Cards */}
          <h2 className="text-3xl font-bold mb-6">Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div 
              className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => navigate('/admin/companies')}
            >
              <div className="card-body">
                <h2 className="card-title text-2xl">
                  <Building2 className="inline mr-2" />
                  Companies
                </h2>
                <p>Manage companies, add images, update information</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary">Manage</button>
                </div>
              </div>
            </div>

            <div 
              className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => navigate('/admin/categories')}
            >
              <div className="card-body">
                <h2 className="card-title text-2xl">
                  <FolderTree className="inline mr-2" />
                  Categories
                </h2>
                <p>Manage categories, create hierarchies, organize</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary">Manage</button>
                </div>
              </div>
            </div>

            <div 
              className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => navigate('/admin/users')}
            >
              <div className="card-body">
                <h2 className="card-title text-2xl">
                  <Users className="inline mr-2" />
                  Users
                </h2>
                <p>Manage users, roles, and permissions</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary">Manage</button>
                </div>
              </div>
            </div>

            <div 
              className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => navigate('/admin/reviews')}
            >
              <div className="card-body">
                <h2 className="card-title text-2xl">
                  <MessageSquare className="inline mr-2" />
                  Reviews Moderation
                </h2>
                <p>Approve or reject pending reviews</p>
                {stats && stats.stats.pendingReviews > 0 && (
                  <div className="badge badge-warning">
                    {stats.stats.pendingReviews} pending
                  </div>
                )}
                <div className="card-actions justify-end">
                  <button className="btn btn-primary">Moderate</button>
                </div>
              </div>
            </div>

            <div 
              className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => navigate('/admin/job-offers')}
            >
              <div className="card-body">
                <h2 className="card-title text-2xl">
                  <Briefcase className="inline mr-2" />
                  Job Offers
                </h2>
                <p>Create and manage job offers for companies</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary">Manage</button>
                </div>
              </div>
            </div>

            <div 
              className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => navigate('/admin/advertisements')}
            >
              <div className="card-body">
                <h2 className="card-title text-2xl">
                  <TrendingUp className="inline mr-2" />
                  Advertisements
                </h2>
                <p>Manage advertisements and promotions</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary">Manage</button>
                </div>
              </div>
            </div>

            <div 
              className="card bg-base-100 shadow-xl cursor-pointer hover:shadow-2xl transition-shadow"
              onClick={() => navigate('/admin/analytics')}
            >
              <div className="card-body">
                <h2 className="card-title text-2xl">
                  <BarChart3 className="inline mr-2" />
                  Analytics & Reports
                </h2>
                <p>View analytics, export data, and generate reports</p>
                <div className="card-actions justify-end">
                  <button className="btn btn-primary">View</button>
                </div>
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          {stats && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Recent Reviews</h2>
                  <div className="overflow-x-auto">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>User</th>
                          <th>Company</th>
                          <th>Rating</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentReviews.map((review) => (
                          <tr key={review.id}>
                            <td>{review.user.username}</td>
                            <td>{review.company.name}</td>
                            <td>
                              <div className="badge badge-sm">{review.rating}/5</div>
                            </td>
                            <td>
                              <div className={`badge badge-sm ${
                                review.status === 'APPROVED' ? 'badge-success' :
                                review.status === 'PENDING' ? 'badge-warning' :
                                'badge-error'
                              }`}>
                                {review.status}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <div className="card bg-base-100 shadow-xl">
                <div className="card-body">
                  <h2 className="card-title">Recent Users</h2>
                  <div className="overflow-x-auto">
                    <table className="table table-sm">
                      <thead>
                        <tr>
                          <th>Username</th>
                          <th>Email</th>
                          <th>Role</th>
                        </tr>
                      </thead>
                      <tbody>
                        {stats.recentUsers.map((user) => (
                          <tr key={user.id}>
                            <td>{user.username}</td>
                            <td className="text-xs">{user.email}</td>
                            <td>
                              <div className={`badge badge-sm ${
                                user.role === 'ADMIN' ? 'badge-error' :
                                user.role === 'MODERATOR' ? 'badge-warning' :
                                'badge-info'
                              }`}>
                                {user.role}
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
        </div>
      </div>
      <Foot />
    </>
  );
}

export default AdminDashboard;
