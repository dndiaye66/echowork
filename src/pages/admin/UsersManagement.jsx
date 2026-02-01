import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/Config';
import Navbar from '../../components/navbar';
import Foot from '../../components/Foot';
import { Users, Shield, Trash2, Edit2, Key, CheckCircle, XCircle, Filter } from 'lucide-react';

function UsersManagement() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    role: 'all',
    verified: 'all',
  });
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [temporaryPassword, setTemporaryPassword] = useState('');
  const [editFormData, setEditFormData] = useState({
    username: '',
    email: '',
    phone: '',
    role: 'USER',
    isVerified: false,
  });

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
      setFilteredUsers(response.data);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      alert('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Apply filters
    let filtered = [...users];
    
    if (filters.role !== 'all') {
      filtered = filtered.filter(u => u.role === filters.role);
    }
    
    if (filters.verified !== 'all') {
      const isVerified = filters.verified === 'verified';
      filtered = filtered.filter(u => u.isVerified === isVerified);
    }
    
    setFilteredUsers(filtered);
  }, [filters, users]);

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

  const handleActivate = async (userId) => {
    try {
      await axios.post(`/admin/users/${userId}/activate`);
      alert('User activated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to activate user:', error);
      alert(error.response?.data?.message || 'Failed to activate user');
    }
  };

  const handleDeactivate = async (userId) => {
    if (!confirm('Are you sure you want to deactivate this user?')) return;
    
    try {
      await axios.post(`/admin/users/${userId}/deactivate`);
      alert('User deactivated successfully');
      fetchUsers();
    } catch (error) {
      console.error('Failed to deactivate user:', error);
      alert(error.response?.data?.message || 'Failed to deactivate user');
    }
  };

  const handleResetPassword = async (userId) => {
    if (!confirm('Are you sure you want to reset this user\'s password?')) return;
    
    try {
      const response = await axios.post(`/admin/users/${userId}/reset-password`);
      setTemporaryPassword(response.data.temporaryPassword);
      setShowPasswordModal(true);
    } catch (error) {
      console.error('Failed to reset password:', error);
      alert(error.response?.data?.message || 'Failed to reset password');
    }
  };

  const handleCopyPassword = () => {
    navigator.clipboard.writeText(temporaryPassword);
    alert('Password copied to clipboard!');
  };

  const handleEdit = (userItem) => {
    setEditingUser(userItem);
    setEditFormData({
      username: userItem.username,
      email: userItem.email,
      phone: userItem.phone || '',
      role: userItem.role,
      isVerified: userItem.isVerified,
    });
    setShowEditModal(true);
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`/admin/users/${editingUser.id}`, editFormData);
      alert('User updated successfully');
      setShowEditModal(false);
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Failed to update user:', error);
      alert(error.response?.data?.message || 'Failed to update user');
    }
  };

  const handleFilterChange = (filterName, value) => {
    setFilters(prev => ({
      ...prev,
      [filterName]: value,
    }));
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
              <div className="stat-value text-primary">{filteredUsers.length}</div>
              <div className="stat-desc">of {users.length} total</div>
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
            <div className="stat">
              <div className="stat-title">Verified</div>
              <div className="stat-value text-success">
                {users.filter(u => u.isVerified).length}
              </div>
            </div>
          </div>

          {/* Filters */}
          <div className="card bg-base-100 shadow-xl mb-6">
            <div className="card-body">
              <h2 className="card-title flex items-center gap-2 mb-4">
                <Filter size={20} />
                Filters
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Role</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={filters.role}
                    onChange={(e) => handleFilterChange('role', e.target.value)}
                  >
                    <option value="all">All Roles</option>
                    <option value="USER">Users</option>
                    <option value="MODERATOR">Moderators</option>
                    <option value="ADMIN">Admins</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Verification Status</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={filters.verified}
                    onChange={(e) => handleFilterChange('verified', e.target.value)}
                  >
                    <option value="all">All</option>
                    <option value="verified">Verified Only</option>
                    <option value="unverified">Unverified Only</option>
                  </select>
                </div>
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">&nbsp;</span>
                  </label>
                  <button
                    className="btn btn-ghost"
                    onClick={() => setFilters({ role: 'all', verified: 'all' })}
                  >
                    Clear Filters
                  </button>
                </div>
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
                    {filteredUsers.map((userItem) => (
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
                          <div className="flex gap-1">
                            <button
                              className="btn btn-xs btn-ghost"
                              onClick={() => handleEdit(userItem)}
                              title="Edit user"
                            >
                              <Edit2 size={14} />
                            </button>
                            <button
                              className="btn btn-xs btn-ghost"
                              onClick={() => handleResetPassword(userItem.id)}
                              disabled={userItem.id === user?.id}
                              title="Reset password"
                            >
                              <Key size={14} />
                            </button>
                            {userItem.isVerified ? (
                              <button
                                className="btn btn-xs btn-ghost text-warning"
                                onClick={() => handleDeactivate(userItem.id)}
                                disabled={userItem.id === user?.id}
                                title="Deactivate user"
                              >
                                <XCircle size={14} />
                              </button>
                            ) : (
                              <button
                                className="btn btn-xs btn-ghost text-success"
                                onClick={() => handleActivate(userItem.id)}
                                title="Activate user"
                              >
                                <CheckCircle size={14} />
                              </button>
                            )}
                            <button
                              className="btn btn-xs btn-error"
                              onClick={() => handleDelete(userItem.id)}
                              disabled={userItem.id === user?.id}
                              title="Delete user"
                            >
                              <Trash2 size={14} />
                            </button>
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
      </div>

      {/* Edit User Modal */}
      {showEditModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">Edit User</h3>
            <form onSubmit={handleEditSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Username</span>
                </label>
                <input
                  type="text"
                  value={editFormData.username}
                  onChange={(e) => setEditFormData({ ...editFormData, username: e.target.value })}
                  className="input input-bordered"
                  required
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Email</span>
                </label>
                <input
                  type="email"
                  value={editFormData.email}
                  onChange={(e) => setEditFormData({ ...editFormData, email: e.target.value })}
                  className="input input-bordered"
                  required
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Phone</span>
                </label>
                <input
                  type="text"
                  value={editFormData.phone}
                  onChange={(e) => setEditFormData({ ...editFormData, phone: e.target.value })}
                  className="input input-bordered"
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Role</span>
                </label>
                <select
                  value={editFormData.role}
                  onChange={(e) => setEditFormData({ ...editFormData, role: e.target.value })}
                  className="select select-bordered"
                  disabled={editingUser?.id === user?.id}
                >
                  <option value="USER">USER</option>
                  <option value="MODERATOR">MODERATOR</option>
                  <option value="ADMIN">ADMIN</option>
                </select>
              </div>

              <div className="form-control mb-4">
                <label className="label cursor-pointer">
                  <span className="label-text">Verified</span>
                  <input
                    type="checkbox"
                    checked={editFormData.isVerified}
                    onChange={(e) => setEditFormData({ ...editFormData, isVerified: e.target.checked })}
                    className="checkbox"
                  />
                </label>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setEditingUser(null);
                  }}
                  className="btn"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Update
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4 text-warning">⚠️ Password Reset</h3>
            <div className="alert alert-warning mb-4">
              <div>
                <span className="text-sm">
                  This is the only time this password will be shown. Please copy it and share it with the user securely.
                </span>
              </div>
            </div>
            <div className="form-control mb-4">
              <label className="label">
                <span className="label-text font-semibold">Temporary Password</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={temporaryPassword}
                  className="input input-bordered flex-1 font-mono"
                  readOnly
                />
                <button
                  type="button"
                  onClick={handleCopyPassword}
                  className="btn btn-primary"
                >
                  Copy
                </button>
              </div>
            </div>
            <div className="alert alert-info">
              <div>
                <span className="text-sm">
                  The user should change this password immediately after logging in.
                </span>
              </div>
            </div>
            <div className="modal-action">
              <button
                onClick={() => {
                  setShowPasswordModal(false);
                  setTemporaryPassword('');
                }}
                className="btn btn-primary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <Foot />
    </>
  );
}

export default UsersManagement;
