import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/Config';
import Navbar from '../../components/navbar';
import Foot from '../../components/Foot';

function CompaniesManagement() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    categoryId: '',
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
      const [companiesRes, categoriesRes] = await Promise.all([
        axios.get('/companies'),
        axios.get('/categories'),
      ]);
      setCompanies(companiesRes.data);
      setCategories(categoriesRes.data);
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
        categoryId: parseInt(formData.categoryId),
      };

      if (editingId) {
        await axios.put(`/admin/companies/${editingId}`, data);
        alert('Company updated successfully');
      } else {
        await axios.post('/admin/companies', data);
        alert('Company created successfully');
      }

      setShowForm(false);
      setEditingId(null);
      setFormData({ name: '', slug: '', description: '', imageUrl: '', categoryId: '' });
      fetchData();
    } catch (error) {
      console.error('Failed to save company:', error);
      alert(error.response?.data?.message || 'Failed to save company');
    }
  };

  const handleEdit = (company) => {
    setFormData({
      name: company.name,
      slug: company.slug,
      description: company.description || '',
      imageUrl: company.imageUrl || '',
      categoryId: company.categoryId.toString(),
    });
    setEditingId(company.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this company?')) return;

    try {
      await axios.delete(`/admin/companies/${id}`);
      alert('Company deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Failed to delete company:', error);
      alert(error.response?.data?.message || 'Failed to delete company');
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
            <h1 className="text-4xl font-bold">Companies Management</h1>
            <button
              className="btn btn-primary"
              onClick={() => {
                setShowForm(true);
                setEditingId(null);
                setFormData({ name: '', slug: '', description: '', imageUrl: '', categoryId: '' });
              }}
            >
              Add New Company
            </button>
          </div>

          {showForm && (
            <div className="card bg-base-100 shadow-xl mb-8">
              <div className="card-body">
                <h2 className="card-title">{editingId ? 'Edit' : 'Add'} Company</h2>
                <form onSubmit={handleSubmit}>
                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Name *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Slug *</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={formData.slug}
                      onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                      required
                    />
                  </div>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Description</span>
                    </label>
                    <textarea
                      className="textarea textarea-bordered"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Image URL</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                    />
                  </div>

                  <div className="form-control mb-4">
                    <label className="label">
                      <span className="label-text">Category *</span>
                    </label>
                    <select
                      className="select select-bordered"
                      value={formData.categoryId}
                      onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                      required
                    >
                      <option value="">Select a category</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                          {cat.name}
                        </option>
                      ))}
                    </select>
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
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Category</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {companies.map((company) => (
                  <tr key={company.id}>
                    <td>{company.name}</td>
                    <td>{company.slug}</td>
                    <td>{company.category?.name}</td>
                    <td>
                      <button
                        className="btn btn-sm btn-info mr-2"
                        onClick={() => handleEdit(company)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-error"
                        onClick={() => handleDelete(company.id)}
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

export default CompaniesManagement;
