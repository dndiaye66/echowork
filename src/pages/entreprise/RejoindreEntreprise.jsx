import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  Search, Building2, CheckCircle, ChevronRight, Loader2, AlertCircle,
  Star, Plus, MapPin, Phone, Globe, X,
} from 'lucide-react';
import { companyService } from '../../services/companyService';
import { entrepriseService } from '../../services/entrepriseService';
import apiClient from '../../api/Config';
import Navbar from '../../components/navbar';

function CreateModal({ initialName, onClose, onCreated }) {
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    name: initialName || '',
    categoryId: '',
    ville: '',
    adresse: '',
    tel: '',
    description: '',
    website: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiClient.get('/categories').then((r) => setCategories(r.data)).catch(() => {});
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.categoryId) return;
    setSaving(true);
    setError('');
    try {
      const company = await entrepriseService.createCompany({
        ...form,
        categoryId: parseInt(form.categoryId, 10),
      });
      onCreated(company);
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(msg || 'Erreur lors de la création. Veuillez réessayer.');
    } finally {
      setSaving(false);
    }
  };

  const field = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 sticky top-0 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-red-100 flex items-center justify-center">
              <Plus size={16} className="text-red-600" />
            </div>
            <h3 className="font-bold text-gray-900">Créer ma fiche entreprise</h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-xl px-3 py-2.5 text-sm">
              <AlertCircle size={15} className="shrink-0" /> {error}
            </div>
          )}

          <div className="bg-blue-50 border border-blue-100 rounded-xl px-4 py-3 text-xs text-blue-700">
            Votre fiche sera visible publiquement après validation par l'équipe EchoWork.
          </div>

          {/* Nom */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom de l'entreprise <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => field('name', e.target.value)}
              placeholder="Ex : Sonatel, Orange Sénégal..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Secteur d'activité <span className="text-red-500">*</span>
            </label>
            <select
              required
              value={form.categoryId}
              onChange={(e) => field('categoryId', e.target.value)}
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            >
              <option value="">-- Choisir un secteur --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>

          {/* Ville + Téléphone */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <MapPin size={12} className="inline mr-1" />Ville
              </label>
              <input
                type="text"
                value={form.ville}
                onChange={(e) => field('ville', e.target.value)}
                placeholder="Dakar"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                <Phone size={12} className="inline mr-1" />Téléphone
              </label>
              <input
                type="tel"
                value={form.tel}
                onChange={(e) => field('tel', e.target.value)}
                placeholder="+221 77..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Adresse */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
            <input
              type="text"
              value={form.adresse}
              onChange={(e) => field('adresse', e.target.value)}
              placeholder="Rue 10, Plateau"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Site web */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              <Globe size={12} className="inline mr-1" />Site web
            </label>
            <input
              type="url"
              value={form.website}
              onChange={(e) => field('website', e.target.value)}
              placeholder="https://votre-site.com"
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description <span className="text-gray-400 font-normal">(optionnel)</span>
            </label>
            <textarea
              rows={3}
              value={form.description}
              onChange={(e) => field('description', e.target.value)}
              placeholder="Décrivez brièvement votre entreprise..."
              className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>

          {/* Actions */}
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
              disabled={saving || !form.name.trim() || !form.categoryId}
              className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
              Créer ma fiche
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function RejoindreEntreprise() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [claiming, setClaiming] = useState(null);
  const [claimed, setClaimed] = useState(null);
  const [claimMode, setClaimMode] = useState('claim'); // 'claim' | 'create'
  const [error, setError] = useState('');
  const [searched, setSearched] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError('');
    setResults([]);
    setSearched(false);
    try {
      const data = await companyService.searchAutocomplete(query, 10);
      setResults(data);
      setSearched(true);
      if (data.length === 0) setError('Aucune entreprise trouvée pour cette recherche.');
    } catch {
      setError('Erreur lors de la recherche. Veuillez réessayer.');
    } finally {
      setSearching(false);
    }
  };

  const handleClaim = async (company) => {
    setClaiming(company.id);
    setError('');
    try {
      await entrepriseService.claim(company.id);
      setClaimMode('claim');
      setClaimed(company);
    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg?.includes('déjà')) {
        setError('Cette entreprise a déjà été réclamée par un autre utilisateur.');
      } else {
        setError('Erreur lors de la réclamation. Veuillez réessayer.');
      }
    } finally {
      setClaiming(null);
    }
  };

  const handleCreated = (company) => {
    setShowCreate(false);
    setClaimMode('create');
    setClaimed(company);
  };

  if (claimed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto pt-20 px-4 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              {claimMode === 'create' ? 'Fiche créée avec succès !' : 'Fiche réclamée !'}
            </h2>
            <p className="text-gray-500 mb-2">Vous gérez maintenant la fiche de</p>
            <p className="font-semibold text-gray-900 text-lg mb-6">{claimed.name}</p>
            <button
              onClick={() => navigate('/espace-entreprise/tableau-de-bord')}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3 rounded-full transition-colors w-full justify-center"
            >
              Accéder au tableau de bord
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-2xl mx-auto pt-12 pb-20 px-4">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-14 h-14 rounded-2xl bg-red-600 flex items-center justify-center mx-auto mb-4">
            <Building2 size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Réclamez votre fiche</h1>
          <p className="text-gray-500">
            Recherchez votre entreprise pour en prendre la gestion.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom de votre entreprise
          </label>
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSearched(false); setResults([]); setError(''); }}
                placeholder="Ex: Orange, Sonatel, CBAO..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              disabled={searching || !query.trim()}
              className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors flex items-center gap-2"
            >
              {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              Chercher
            </button>
          </div>
        </form>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3 mb-4 text-sm">
            <AlertCircle size={16} className="shrink-0" />
            {error}
          </div>
        )}

        {/* Results */}
        {results.length > 0 && (
          <div className="space-y-3 mb-6">
            <p className="text-sm text-gray-500">{results.length} entreprise(s) trouvée(s)</p>
            {results.map((company) => (
              <div
                key={company.id}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4"
              >
                {company.imageUrl ? (
                  <img
                    src={company.imageUrl}
                    alt={company.name}
                    className="w-12 h-12 rounded-xl object-cover shrink-0"
                  />
                ) : (
                  <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                    <Building2 size={22} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 truncate">{company.name}</p>
                  <p className="text-xs text-gray-400 truncate">
                    {company.category?.name}{company.ville ? ` · ${company.ville}` : ''}
                  </p>
                  {company.averageRating > 0 && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <Star size={11} className="fill-red-500 text-red-500" />
                      <span className="text-xs text-gray-500">
                        {company.averageRating.toFixed(1)} ({company.reviewCount} avis)
                      </span>
                    </div>
                  )}
                </div>
                <button
                  onClick={() => handleClaim(company)}
                  disabled={claiming === company.id}
                  className="bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex items-center gap-1.5 shrink-0"
                >
                  {claiming === company.id ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <CheckCircle size={14} />
                  )}
                  Réclamer
                </button>
              </div>
            ))}
          </div>
        )}

        {/* "Not found" block — shown after a search with no results */}
        {searched && results.length === 0 && (
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <Building2 size={22} className="text-gray-400" />
            </div>
            <p className="font-semibold text-gray-900 mb-1">"{query}" n'est pas encore référencée</p>
            <p className="text-sm text-gray-500 mb-5">
              Créez la fiche de votre entreprise et prenez-en la gestion immédiatement.
            </p>
            <button
              onClick={() => setShowCreate(true)}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full transition-colors text-sm"
            >
              <Plus size={16} />
              Créer la fiche "{query}"
            </button>
          </div>
        )}

        {/* Create link — always shown at bottom */}
        {!(searched && results.length === 0) && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500 mb-2">Votre entreprise n'est pas encore référencée ?</p>
            <button
              onClick={() => setShowCreate(true)}
              className="text-sm font-medium text-red-600 hover:underline inline-flex items-center gap-1"
            >
              <Plus size={14} />
              Créer ma fiche entreprise
            </button>
          </div>
        )}
      </div>

      {/* Create modal */}
      {showCreate && (
        <CreateModal
          initialName={query}
          onClose={() => setShowCreate(false)}
          onCreated={handleCreated}
        />
      )}
    </div>
  );
}
