import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from '../../api/Config';
import Navbar from '../../components/navbar';
import Foot from '../../components/Foot';
import { Plus, Edit2, Trash2, FolderTree, Building2 } from 'lucide-react';

function CategoriesManagement() {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    parentId: null,
  });

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') {
      alert('Access denied. Admin privileges required.');
      navigate('/');
      return;
    }
    fetchCategories();
  }, [isAuthenticated, user, navigate]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/admin/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      alert('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSlug = (name) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updated = { ...prev, [name]: value === '' ? null : value };
      // Auto-generate slug when name changes
      if (name === 'name') {
        updated.slug = handleCreateSlug(value);
      }
      return updated;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await axios.put(`/admin/categories/${editingCategory.id}`, formData);
        alert('Category updated successfully');
      } else {
        await axios.post('/admin/categories', formData);
        alert('Category created successfully');
      }
      setShowModal(false);
      setFormData({ name: '', slug: '', parentId: null });
      setEditingCategory(null);
      fetchCategories();
    } catch (error) {
      console.error('Failed to save category:', error);
      alert(error.response?.data?.message || 'Failed to save category');
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      slug: category.slug,
      parentId: category.parentId || null,
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this category?')) return;

    try {
      await axios.delete(`/admin/categories/${id}`);
      alert('Category deleted successfully');
      fetchCategories();
    } catch (error) {
      console.error('Failed to delete category:', error);
      alert(error.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleCreate = () => {
    setEditingCategory(null);
    setFormData({ name: '', slug: '', parentId: null });
    setShowModal(true);
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
              <FolderTree size={40} />
              Categories Management
            </h1>
            <button onClick={handleCreate} className="btn btn-primary gap-2">
              <Plus size={20} />
              Add Category
            </button>
          </div>

          <div className="card bg-base-100 shadow-xl">
            <div className="card-body">
              <div className="overflow-x-auto">
                <table className="table table-zebra">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Slug</th>
                      <th>Parent</th>
                      <th>Companies</th>
                      <th>Keywords</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category.id}>
                        <td>{category.id}</td>
                        <td className="font-semibold">{category.name}</td>
                        <td className="text-sm text-gray-600">{category.slug}</td>
                        <td>
                          {category.parent ? (
                            <span className="badge badge-sm">{category.parent.name}</span>
                          ) : (
                            <span className="text-gray-400">None</span>
                          )}
                        </td>
                        <td>
                          <div className="flex items-center gap-1">
                            <Building2 size={16} />
                            <span className="font-semibold">{category._count?.companies || 0}</span>
                          </div>
                        </td>
                        <td>{category._count?.keywords || 0}</td>
                        <td>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleEdit(category)}
                              className="btn btn-sm btn-ghost"
                            >
                              <Edit2 size={16} />
                            </button>
                            <button
                              onClick={() => handleDelete(category.id)}
                              className="btn btn-sm btn-ghost text-error"
                            >
                              <Trash2 size={16} />
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

      {/* Modal */}
      {showModal && (
        <div className="modal modal-open">
          <div className="modal-box">
            <h3 className="font-bold text-lg mb-4">
              {editingCategory ? 'Edit Category' : 'Create New Category'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Name *</span>
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="input input-bordered"
                  required
                />
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Slug *</span>
                </label>
                <input
                  type="text"
                  name="slug"
                  value={formData.slug}
                  onChange={handleInputChange}
                  className="input input-bordered"
                  required
                />
                <label className="label">
                  <span className="label-text-alt">Auto-generated from name</span>
                </label>
              </div>

              <div className="form-control mb-4">
                <label className="label">
                  <span className="label-text">Parent Category</span>
                </label>
                <select
                  name="parentId"
                  value={formData.parentId || ''}
                  onChange={handleInputChange}
                  className="select select-bordered"
                >
                  <option value="">None (Top Level)</option>
                  {categories
                    .filter((c) => !editingCategory || c.id !== editingCategory.id)
                    .map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                </select>
              </div>

              <div className="modal-action">
                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    setEditingCategory(null);
                    setFormData({ name: '', slug: '', parentId: null });
                  }}
                  className="btn"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingCategory ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Foot />
    </>
  );
}

export default CategoriesManagement;
