import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Star, MessageSquare, TrendingUp, Building2, ChevronRight,
  Loader2, AlertCircle, Plus, MapPin, Phone, X, Check,
  GitBranch,
} from 'lucide-react';
import EntrepriseLayout from '../../components/EntrepriseLayout';
import { entrepriseService } from '../../services/entrepriseService';

const API_BASE = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000';

function resolveUrl(url) {
  if (!url) return null;
  if (url.startsWith('/')) return url;
  if (url.startsWith('http://')) return url.replace('http://', 'https://');
  return url;
}

function CompanyCard({ company, isChild = false }) {
  const score = company.scores?.globalScore ?? 0;
  const total = company._count?.reviews ?? 0;
  const branchCount = company._count?.branches ?? 0;

  return (
    <div className={`bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden ${isChild ? 'ml-4 md:ml-8 border-l-4 border-l-red-100' : ''}`}>
      {/* Cover */}
      {company.coverImageUrl && !isChild && (
        <div className="h-28 overflow-hidden">
          <img
            src={resolveUrl(company.coverImageUrl)}
            alt="Couverture"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-4 p-5 border-b border-gray-50">
        <div className="relative shrink-0">
          {company.imageUrl ? (
            <img
              src={resolveUrl(company.imageUrl)}
              alt={company.name}
              className={`rounded-xl object-cover ${isChild ? 'w-10 h-10' : 'w-14 h-14'}`}
            />
          ) : (
            <div className={`rounded-xl bg-gray-100 flex items-center justify-center ${isChild ? 'w-10 h-10' : 'w-14 h-14'}`}>
              <Building2 size={isChild ? 18 : 26} className="text-gray-400" />
            </div>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="font-bold text-gray-900 truncate">{company.name}</h2>
            {company.isVerified && (
              <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium shrink-0">
                Vérifié
              </span>
            )}
            {isChild && (
              <span className="text-xs bg-red-50 text-red-500 px-2 py-0.5 rounded-full font-medium shrink-0">
                Agence
              </span>
            )}
          </div>
          <p className="text-sm text-gray-500">{company.category?.name}</p>
          {(company.ville || company.adresse) && (
            <div className="flex items-center gap-1 text-xs text-gray-400 mt-0.5">
              <MapPin size={10} />
              {company.ville || company.adresse}
            </div>
          )}
        </div>

        <Link
          to={`/espace-entreprise/tableau-de-bord/profil?id=${company.id}`}
          className="text-sm font-medium text-red-600 hover:underline flex items-center gap-1 shrink-0"
        >
          Modifier <ChevronRight size={14} />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 divide-x divide-gray-50">
        {[
          { icon: Star, label: 'Note', value: score > 0 ? score.toFixed(1) : '—' },
          { icon: MessageSquare, label: 'Avis', value: total },
          { icon: TrendingUp, label: 'Abonnement', value: company.subscription?.plan ?? 'FREE' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex flex-col items-center py-4 px-3">
            <Icon size={16} className="text-red-500 mb-1" />
            <span className="text-base font-bold text-gray-900">{value}</span>
            <span className="text-[10px] text-gray-400">{label}</span>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 p-4 border-t border-gray-50 flex-wrap">
        <Link
          to={`/espace-entreprise/tableau-de-bord/avis?id=${company.id}`}
          className="flex-1 min-w-[120px] text-center text-sm font-medium bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-600 py-2.5 rounded-xl transition-colors"
        >
          Voir les avis
        </Link>
        <Link
          to={`/companies/${company.slug}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 min-w-[120px] text-center text-sm font-medium bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-600 py-2.5 rounded-xl transition-colors"
        >
          Voir la fiche
        </Link>
        {!isChild && (
          <Link
            to={`/espace-entreprise/tableau-de-bord/agences?id=${company.id}`}
            className="flex items-center justify-center gap-1.5 text-sm font-medium bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-600 px-4 py-2.5 rounded-xl transition-colors"
          >
            <GitBranch size={14} />
            {branchCount > 0 ? `${branchCount} agence${branchCount > 1 ? 's' : ''}` : 'Agences'}
          </Link>
        )}
      </div>
    </div>
  );
}

function CreateBranchModal({ parentId, onClose, onCreated }) {
  const [form, setForm] = useState({ name: '', ville: '', adresse: '', tel: '', description: '' });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    setSaving(true);
    setError('');
    try {
      const branch = await entrepriseService.createBranch(parentId, form);
      onCreated(branch);
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <GitBranch size={18} className="text-red-500" /> Créer une agence
          </h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-xl px-3 py-2 text-sm">
              <AlertCircle size={15} /> {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'agence *</label>
            <input
              type="text"
              required
              placeholder="Ex : Agence Plateau, Mermoz Branch..."
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin size={12} className="inline mr-1" />Ville
              </label>
              <input
                type="text"
                placeholder="Dakar"
                value={form.ville}
                onChange={(e) => setForm((f) => ({ ...f, ville: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone size={12} className="inline mr-1" />Téléphone
              </label>
              <input
                type="tel"
                placeholder="+221 77..."
                value={form.tel}
                onChange={(e) => setForm((f) => ({ ...f, tel: e.target.value }))}
                className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              type="text"
              placeholder="Rue 10, Plateau"
              value={form.adresse}
              onChange={(e) => setForm((f) => ({ ...f, adresse: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (optionnel)</label>
            <textarea
              rows={2}
              placeholder="Services spécifiques à cette agence..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={saving || !form.name.trim()}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              Créer l'agence
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function TableauDeBord() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [branchModal, setBranchModal] = useState(null); // parentId

  useEffect(() => {
    entrepriseService.getMyCompanies()
      .then(setCompanies)
      .catch(() => setError('Impossible de charger vos entreprises.'))
      .finally(() => setLoading(false));
  }, []);

  const handleBranchCreated = (branch) => {
    setBranchModal(null);
    // Add branch to the parent company's branches list in state
    setCompanies((prev) =>
      prev.map((c) =>
        c.id === branch.parentCompanyId
          ? { ...c, branches: [...(c.branches ?? []), branch], _count: { ...c._count, branches: (c._count?.branches ?? 0) + 1 } }
          : c
      )
    );
  };

  if (loading) {
    return (
      <EntrepriseLayout title="Vue d'ensemble">
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin text-red-500" />
        </div>
      </EntrepriseLayout>
    );
  }

  if (error) {
    return (
      <EntrepriseLayout title="Vue d'ensemble">
        <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl p-4">
          <AlertCircle size={18} /> {error}
        </div>
      </EntrepriseLayout>
    );
  }

  if (companies.length === 0) {
    return (
      <EntrepriseLayout title="Vue d'ensemble">
        <div className="max-w-lg mx-auto text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Building2 size={30} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Aucune entreprise rattachée</h2>
          <p className="text-gray-500 text-sm mb-6">
            Réclamez la gestion de votre fiche pour commencer.
          </p>
          <Link
            to="/espace-entreprise/rejoindre"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Réclamer ma fiche
            <ChevronRight size={16} />
          </Link>
        </div>
      </EntrepriseLayout>
    );
  }

  return (
    <EntrepriseLayout title="Vue d'ensemble">
      <div className="space-y-8">
        {companies.map((company) => (
          <div key={company.id} className="space-y-3">
            {/* Main company */}
            <CompanyCard company={company} />

            {/* Branches */}
            {(company.branches ?? []).length > 0 && (
              <div className="space-y-3 pl-4 md:pl-8 border-l-2 border-gray-100 ml-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <GitBranch size={12} /> Agences ({company.branches.length})
                </p>
                {company.branches.map((branch) => (
                  <CompanyCard key={branch.id} company={branch} isChild />
                ))}
              </div>
            )}

            {/* Create branch button */}
            <button
              onClick={() => setBranchModal(company.id)}
              className="flex items-center gap-2 w-full border-2 border-dashed border-gray-200 hover:border-red-300 hover:text-red-600 text-gray-400 rounded-2xl py-4 px-5 transition-colors text-sm font-medium"
            >
              <Plus size={16} />
              Ajouter une agence / succursale
            </button>
          </div>
        ))}

        {/* Claim another company */}
        <Link
          to="/espace-entreprise/rejoindre"
          className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-red-300 hover:text-red-600 text-gray-400 rounded-2xl py-6 transition-colors text-sm font-medium"
        >
          <Building2 size={18} />
          Réclamer une autre entreprise
        </Link>
      </div>

      {/* Create branch modal */}
      {branchModal && (
        <CreateBranchModal
          parentId={branchModal}
          onClose={() => setBranchModal(null)}
          onCreated={handleBranchCreated}
        />
      )}
    </EntrepriseLayout>
  );
}
