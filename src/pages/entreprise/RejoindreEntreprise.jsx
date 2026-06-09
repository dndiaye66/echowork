import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Search, Building2, CheckCircle, ChevronRight, Loader2, AlertCircle, Star } from 'lucide-react';
import { companyService } from '../../services/companyService';
import { entrepriseService } from '../../services/entrepriseService';
import Navbar from '../../components/navbar';

export default function RejoindreEntreprise() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [claiming, setClaiming] = useState(null);
  const [claimed, setClaimed] = useState(null);
  const [error, setError] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setError('');
    setResults([]);
    try {
      const data = await companyService.searchAutocomplete(query, 10);
      setResults(data);
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

  if (claimed) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-lg mx-auto pt-20 px-4 text-center">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-10">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-5">
              <CheckCircle size={32} className="text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Fiche réclamée !</h2>
            <p className="text-gray-500 mb-2">
              Vous gérez maintenant la fiche de
            </p>
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
                onChange={(e) => setQuery(e.target.value)}
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
          <div className="space-y-3">
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
                    {company.category?.name} {company.ville ? `· ${company.ville}` : ''}
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

        {/* Mon entreprise n'est pas listée */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 mb-2">Votre entreprise n'est pas encore référencée ?</p>
          <Link
            to="/espace-entreprise/tableau-de-bord"
            className="text-sm font-medium text-red-600 hover:underline"
          >
            Contacter l'équipe EchoWork →
          </Link>
        </div>
      </div>
    </div>
  );
}
