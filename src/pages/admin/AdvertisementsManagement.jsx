import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/Config';
import Navbar from '../../components/navbar';
import Foot from '../../components/Foot';

function AdvertisementsManagement() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [advertisements, setAdvertisements] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    imageUrl: 'https://via.placeholder.com/400x300?text=Annonce',
    companyId: '',
    startDate: '',
    endDate: '',
    isActive: true,
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      alert('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
    fetchData();
  }, [isAuthenticated, user, navigate]);

  const fetchData = async () => {
    try {
      const [adsRes, companiesRes] = await Promise.all([
        axios.get('/admin/advertisements'),
        axios.get('/companies'),
      ]);
      setAdvertisements(adsRes.data);
      setCompanies(companiesRes.data);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      alert('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        companyId: formData.companyId ? parseInt(formData.companyId) : undefined,
      };

      if (editingId) {
        await axios.put(`/admin/advertisements/${editingId}`, data);
        alert('Advertisement updated successfully');
      } else {
        await axios.post('/admin/advertisements', data);
        alert('Advertisement created successfully');
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ title: '', content: '', imageUrl: 'https://via.placeholder.com/400x300?text=Annonce', companyId: '', startDate: '', endDate: '', isActive: true });
      fetchData();
    } catch (error) {
      console.error('Failed to save advertisement:', error);
      alert(error.response?.data?.message || 'Failed to save advertisement');
    }
  };

  const handleEdit = (ad) => {
    setFormData({
      title: ad.title,
      content: ad.content,
      imageUrl: ad.imageUrl || 'https://via.placeholder.com/400x300?text=Annonce',
      companyId: ad.companyId ? ad.companyId.toString() : '',
      startDate: new Date(ad.startDate).toISOString().split('T')[0],
      endDate: new Date(ad.endDate).toISOString().split('T')[0],
      isActive: ad.isActive,
    });
    setEditingId(ad.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this advertisement?')) return;

    try {
      await axios.delete(`/admin/advertisements/${id}`);
      alert('Advertisement deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete advertisement:', error);
      alert(error.response?.data?.message || 'Failed to delete advertisement');
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-base-200 py-8">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-4xl font-bold">Advertisements Management</h1>
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({ title: '', content: '', imageUrl: 'https://via.placeholder.com/400x300?text=Annonce', companyId: '', startDate: '', endDate: '', isActive: true });
              }}
            >
              Add New Advertisement
            </button>
          </div>

          {showForm && (
            <div className="card bg-base-100 shadow-xl mb-8">
              <div className="card-body">
                <h2 className="card-title">{editingId ? 'Edit' : 'Add'} Advertisement</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Title *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Content *</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered"
                      value={formData.content}
                      onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                      rows={4}
                      placeholder="Lorem ipsum dolor sit amet, consectetur adipiscing elit..."
                      required
                    />
                  </div>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Image URL (default: placeholder)</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="https://via.placeholder.com/400x300?text=Annonce"
                    />
                  </div>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Company (optional)</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={formData.companyId}
                      onChange={(e) => setFormData({ ...formData, companyId: e.target.value })}
                    >
                      <option value="">No company (general ad)</option>
                      {companies.map((company) => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">Start Date *</span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        required
                      />
                    </div>

                    <div className="form-control">
                      <label className="label">
                        <span className="label-text">End Date *</span>
                      </label>
                      <input
                        type="date"
                        className="input input-bordered"
                        value={formData.endDate}
                        onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div className="form-control mb-4">
                    <label className="cursor-pointer label justify-start gap-2">
                      <input
                        type="checkbox"
                        className="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      />
                      <span className="label-text">Active</span>
                    </label>
                  </div>

                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary">
                      {editingId ? 'Update' : 'Create'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => {
                        setShowForm(false);
                        setEditingId(null);
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="table w-full bg-base-100">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Company</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {advertisements.map((ad) => (
                  <tr key={ad.id}>
                    <td>{ad.title}</td>
                    <td>{ad.company?.name || 'General'}</td>
                    <td>{new Date(ad.startDate).toLocaleDateString()}</td>
                    <td>{new Date(ad.endDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${ad.isActive ? 'badge-success' : 'badge-error'}`}>
                        {ad.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn btn-sm btn-info mr-2"
                        onClick={() => handleEdit(ad)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-error"
                        onClick={() => handleDelete(ad.id)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <Foot />
    </>
  );
}

export default AdvertisementsManagement;
