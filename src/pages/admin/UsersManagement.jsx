import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/Config';
import Navbar from '../../components/navbar';
import Foot from '../../components/Foot';
import { Users, Shield, Trash2 } from 'lucide-react';

function UsersManagement() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      alert('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
    fetchUsers();
  }, [isAuthenticated, user, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    if (!confirm(`Are you sure you want to change this user's role to ${newRole}?`)) return;

    try {
      await axios.put(`/admin/users/${userId}/role`, { role: newRole });
      alert('User role updated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user role:', error);
      alert(error.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) return;

    try {
      await axios.delete(`/admin/users/${userId}`);
      alert('User deleted successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to delete user:', error);
      alert(error.response?.data?.message || 'Failed to delete user');
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
              <Users size={40} />
              Users Management
            </h1>
            <button
              className="btn btn-ghost"
              onClick={() => navigate('/admin')}
            >
              ← Back to Dashboard
            </button>
          </div>

          <div className="stats stats-horizontal shadow mb-8">
            <div className="stat">
              <div className="stat-title">Total Users</div>
              <div className="stat-value text-primary">{users.length}</div>
            </div>
            <div className="stat">
              <div className="stat-title">Admins</div>
              <div className="stat-value text-error">
                {users.filter(u => u.role === 'ADMIN').length}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Moderators</div>
              <div className="stat-value text-warning">
                {users.filter(u => u.role === 'MODERATOR').length}
              </div>
            </div>
            <div className="stat">
              <div className="stat-title">Regular Users</div>
              <div className="stat-value text-info">
                {users.filter(u => u.role === 'USER').length}
              </div>
            </div>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="table w-full">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Verified</th>
                      <th>Reviews</th>
                      <th>Claimed Companies</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((userItem) => (
                      <tr key={userItem.id}>
                        <td>{userItem.id}</td>
                        <td className="font-semibold">{userItem.username}</td>
                        <td>{userItem.email}</td>
                        <td>{userItem.phone || '-'}</td>
                        <td>
                          <select
                            className={`select select-sm ${
                              userItem.role === 'ADMIN' ? 'select-error' :
                              userItem.role === 'MODERATOR' ? 'select-warning' :
                              'select-info'
                            }`}
                            value={userItem.role}
                            onChange={(e) => handleRoleChange(userItem.id, e.target.value)}
                            disabled={userItem.id === user?.id}
                          >
                            <option value="USER">USER</option>
                            <option value="MODERATOR">MODERATOR</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        </td>
                        <td>
                          {userItem.isVerified ? (
                            <div className="badge badge-success">✓</div>
                          ) : (
                            <div className="badge badge-warning">✗</div>
                          )}
                        </td>
                        <td>
                          <div className="badge badge-neutral">
                            {userItem._count.reviews}
                          </div>
                        </td>
                        <td>
                          <div className="badge badge-neutral">
                            {userItem._count.claimedCompanies}
                          </div>
                        </td>
                        <td className="text-xs">
                          {new Date(userItem.createdAt).toLocaleDateString()}
                        </td>
                        <td>
                          <button
                            className="btn btn-sm btn-error"
                            onClick={() => handleDelete(userItem.id)}
                            disabled={userItem.id === user?.id}
                            title="Delete user"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Foot />
    </>
  );
}

export default UsersManagement;
