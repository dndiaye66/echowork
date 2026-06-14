import { useEffect, useState } from 'react';
import AdminLayout from '../../components/AdminLayout';
import axios from '../../api/Config';
import {
  Plus, Edit2, Trash2, Search, X, Building2,
  CheckCircle, XCircle, ChevronDown, ChevronUp,
} from 'lucide-react';

const toSlug = (t) =>
  t.toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

// ─── Company Modal ────────────────────────────────────────────────────────────

function CompanyModal({ modal, categories, onClose, onSaved }) {
  const isEdit = !!modal.id;
  const initial = modal.data || {};

  const [form, setForm] = useState({
    name: initial.name || '',
    slug: initial.slug || '',
    description: initial.description || '',
    categoryId: initial.categoryId ? String(initial.categoryId) : '',
    tel: initial.tel || '',
    ville: initial.ville || '',
    adresse: initial.adresse || '',
    activite: initial.activite || '',
    ninea: initial.ninea || '',
    rccm: initial.rccm || '',
    size: initial.size || '',
    isVerified: initial.isVerified ?? false,
  });
  const [slugManual, setSlugManual] = useState(isEdit);
  const [extra, setExtra] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleName = (v) => {
    setForm((prev) => {
      const autoSlug = !slugManual || prev.slug === toSlug(prev.name);
      return { ...prev, name: v, slug: autoSlug ? toSlug(v) : prev.slug };
    });
  };

  const handleField = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);
    try {
      const { imageUrl: _omit, ...rest } = form;
      const payload = {
        ...rest,
        categoryId: form.categoryId ? parseInt(form.categoryId) : undefined,
        isVerified: form.isVerified,
        size: form.size || undefined,
      };
      if (isEdit) {
        await axios.put(`/admin/companies/${modal.id}`, payload);
      } else {
        await axios.post('/admin/companies', payload);
      }
      onSaved();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal modal-open">
      <div className="modal-box w-11/12 max-w-2xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-lg">
            {isEdit ? "Modifier l'entreprise" : 'Nouvelle entreprise'}
          </h3>
          <button className="btn btn-ghost btn-sm btn-square" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        {error && (
          <div className="alert alert-error mb-4 text-sm">{error}</div>
        )}

        <form onSubmit={handleSave} className="space-y-3">
          {/* Name + Slug */}
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-medium">Nom *</span>
              </label>
              <input
                type="text"
                className="input input-bordered input-sm"
                value={form.name}
                onChange={(e) => handleName(e.target.value)}
                required
              />
            </div>
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-medium">Slug *</span>
              </label>
              <input
                type="text"
                className="input input-bordered input-sm font-mono text-xs"
                value={form.slug}
                onChange={(e) => {
                  setSlugManual(true);
                  handleField('slug', e.target.value);
                }}
                required
              />
            </div>
          </div>

          {/* Category + Size */}
          <div className="grid grid-cols-2 gap-3">
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-medium">Catégorie</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={form.categoryId}
                onChange={(e) => handleField('categoryId', e.target.value)}
              >
                <option value="">— Sélectionner —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="form-control">
              <label className="label py-1">
                <span className="label-text text-xs font-medium">Taille</span>
              </label>
              <select
                className="select select-bordered select-sm"
                value={form.size}
                onChange={(e) => handleField('size', e.target.value)}
              >
                <option value="">— Sélectionner —</option>
                <option value="TPE">TPE</option>
                <option value="PME">PME</option>
                <option value="GRANDE">Grande entreprise</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div className="form-control">
            <label className="label py-1">
              <span className="label-text text-xs font-medium">Description</span>
            </label>
            <textarea
              className="textarea textarea-bordered textarea-sm"
              rows={3}
              value={form.description}
              onChange={(e) => handleField('description', e.target.value)}
            />
          </div>


          {/* Collapsible extra info */}
          <div className="border border-base-300 rounded-lg overflow-hidden">
            <button
              type="button"
              className="flex items-center justify-between w-full px-4 py-2.5 bg-base-200 hover:bg-base-300 transition-colors text-sm font-medium"
              onClick={() => setExtra((v) => !v)}
            >
              <span>Informations supplémentaires</span>
              {extra ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
            </button>
            {extra && (
              <div className="p-4 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs font-medium">Téléphone</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm"
                      value={form.tel}
                      onChange={(e) => handleField('tel', e.target.value)}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs font-medium">Ville</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm"
                      value={form.ville}
                      onChange={(e) => handleField('ville', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-medium">Adresse</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered input-sm"
                    value={form.adresse}
                    onChange={(e) => handleField('adresse', e.target.value)}
                  />
                </div>
                <div className="form-control">
                  <label className="label py-1">
                    <span className="label-text text-xs font-medium">Activité</span>
                  </label>
                  <input
                    type="text"
                    className="input input-bordered input-sm"
                    value={form.activite}
                    onChange={(e) => handleField('activite', e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs font-medium">NINEA</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm"
                      value={form.ninea}
                      onChange={(e) => handleField('ninea', e.target.value)}
                    />
                  </div>
                  <div className="form-control">
                    <label className="label py-1">
                      <span className="label-text text-xs font-medium">RCCM</span>
                    </label>
                    <input
                      type="text"
                      className="input input-bordered input-sm"
                      value={form.rccm}
                      onChange={(e) => handleField('rccm', e.target.value)}
                    />
                  </div>
                </div>
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3 py-1">
                    <input
                      type="checkbox"
                      className="checkbox checkbox-sm checkbox-success"
                      checked={form.isVerified}
                      onChange={(e) => handleField('isVerified', e.target.checked)}
                    />
                    <span className="label-text text-xs font-medium">Entreprise vérifiée</span>
                  </label>
                </div>
              </div>
            )}
          </div>

          <div className="modal-action pt-2">
            <button type="button" className="btn btn-ghost btn-sm" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={saving}>
              {saving && <span className="loading loading-spinner loading-xs" />}
              {isEdit ? 'Enregistrer' : 'Créer'}
            </button>
          </div>
        </form>
      </div>
      <div className="modal-backdrop" onClick={onClose} />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

function CompaniesManagement() {
  const [companies, setCompanies] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterV, setFilterV] = useState('');
  const [modal, setModal] = useState(null); // null | { data, id }

  const fetchAll = async () => {
    try {
      const [compRes, catRes] = await Promise.all([
        axios.get('/companies'),
        axios.get('/categories'),
      ]);
      setCompanies(compRes.data);
      setCategories(catRes.data);
    } catch (err) {
      console.error('Erreur chargement:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  const filtered = companies.filter((c) => {
    const q = search.toLowerCase();
    const matchSearch =
      !q ||
      c.name?.toLowerCase().includes(q) ||
      c.ninea?.toLowerCase().includes(q) ||
      c.ville?.toLowerCase().includes(q);
    const matchCat = !filterCat || String(c.categoryId) === filterCat;
    const matchV =
      filterV === '' ? true :
      filterV === 'verified' ? c.isVerified :
      !c.isVerified;
    return matchSearch && matchCat && matchV;
  });

  const handleDelete = async (id) => {
    if (!confirm('Supprimer cette entreprise ?')) return;
    try {
      await axios.delete(`/admin/companies/${id}`);
      setCompanies((prev) => prev.filter((c) => c.id !== id));
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const handleToggleVerify = async (company) => {
    try {
      await axios.put(`/admin/companies/${company.id}`, { isVerified: !company.isVerified });
      setCompanies((prev) =>
        prev.map((c) => c.id === company.id ? { ...c, isVerified: !c.isVerified } : c)
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Erreur');
    }
  };

  const openCreate = () => setModal({ data: null, id: null });
  const openEdit = (c) => setModal({ data: c, id: c.id });
  const closeModal = () => setModal(null);
  const onSaved = () => { closeModal(); fetchAll(); };

  if (loading) {
    return (
      <AdminLayout title="Entreprises">
        <div className="flex items-center justify-center h-64">
          <span className="loading loading-spinner loading-lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Entreprises">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
          <input
            type="text"
            className="input input-bordered input-sm w-full pl-9"
            placeholder="Nom, NINEA, ville…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button
              className="absolute right-2 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content"
              onClick={() => setSearch('')}
            >
              <X size={13} />
            </button>
          )}
        </div>

        <select
          className="select select-bordered select-sm"
          value={filterCat}
          onChange={(e) => setFilterCat(e.target.value)}
        >
          <option value="">Toutes catégories</option>
          {categories.map((c) => (
            <option key={c.id} value={String(c.id)}>{c.name}</option>
          ))}
        </select>

        <select
          className="select select-bordered select-sm"
          value={filterV}
          onChange={(e) => setFilterV(e.target.value)}
        >
          <option value="">Tout statut</option>
          <option value="verified">Vérifiées</option>
          <option value="unverified">Non vérifiées</option>
        </select>

        <button className="btn btn-primary btn-sm gap-2 ml-auto" onClick={openCreate}>
          <Plus size={15} />
          Ajouter
        </button>
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-sm text-base-content/60 mb-4">
        <span>{filtered.length} entreprise{filtered.length !== 1 ? 's' : ''}</span>
        <span>·</span>
        <span>{companies.filter((c) => c.isVerified).length} vérifiées</span>
      </div>

      {/* Table */}
      <div className="card bg-base-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-sm">
            <thead>
              <tr className="text-xs text-base-content/50 uppercase tracking-wide">
                <th>Entreprise</th>
                <th>Catégorie</th>
                <th>Ville</th>
                <th>NINEA</th>
                <th>Taille</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-base-content/40">
                    <Building2 size={32} className="mx-auto mb-2 opacity-30" />
                    Aucune entreprise trouvée
                  </td>
                </tr>
              )}
              {filtered.map((c) => (
                <tr key={c.id} className="hover">
                  <td>
                    <div className="flex items-center gap-2.5">
                      {c.imageUrl ? (
                        <img
                          src={c.imageUrl}
                          alt={c.name}
                          className="w-8 h-8 rounded object-cover shrink-0 bg-base-200"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded bg-primary/10 flex items-center justify-center shrink-0">
                          <Building2 size={14} className="text-primary" />
                        </div>
                      )}
                      <div>
                        <p className="font-semibold text-sm leading-none">{c.name}</p>
                        <p className="text-xs text-base-content/40 font-mono mt-0.5">{c.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td>
                    {c.category?.name ? (
                      <span className="badge badge-sm badge-ghost">{c.category.name}</span>
                    ) : (
                      <span className="text-base-content/30 text-xs">—</span>
                    )}
                  </td>
                  <td className="text-sm">
                    {c.ville || <span className="text-base-content/30">—</span>}
                  </td>
                  <td className="text-xs font-mono">
                    {c.ninea || <span className="text-base-content/30">—</span>}
                  </td>
                  <td>
                    {c.size ? (
                      <span className="badge badge-sm badge-outline">{c.size}</span>
                    ) : (
                      <span className="text-base-content/30 text-xs">—</span>
                    )}
                  </td>
                  <td>
                    <button
                      onClick={() => handleToggleVerify(c)}
                      className={`badge badge-sm cursor-pointer border-0 gap-1 ${
                        c.isVerified ? 'badge-success' : 'badge-warning'
                      }`}
                    >
                      {c.isVerified ? (
                        <><CheckCircle size={11} /> Vérifié</>
                      ) : (
                        <><XCircle size={11} /> En attente</>
                      )}
                    </button>
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      <button
                        className="btn btn-ghost btn-xs"
                        onClick={() => openEdit(c)}
                        title="Modifier"
                      >
                        <Edit2 size={13} />
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-error"
                        onClick={() => handleDelete(c.id)}
                        title="Supprimer"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {modal && (
        <CompanyModal
          modal={modal}
          categories={categories}
          onClose={closeModal}
          onSaved={onSaved}
        />
      )}
    </AdminLayout>
  );
}

export default CompaniesManagement;
