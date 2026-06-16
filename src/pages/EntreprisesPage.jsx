import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2, Search, X, Star, ChevronRight, Loader2, AlertCircle,
} from 'lucide-react';
import Navbar from '../components/navbar';
import Foot from '../components/Foot';
import { companyService } from '../services/companyService';
import { useCategories } from '../hooks/useCategory';

export default function EntreprisesPage() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const { categories } = useCategories();

  useEffect(() => {
    setLoading(true);
    companyService.getAll()
      .then(setCompanies)
      .catch(() => setError('Impossible de charger les entreprises.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = companies;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter((c) => c.name.toLowerCase().includes(q));
    }
    if (categoryId) {
      list = list.filter((c) => String(c.category?.id) === categoryId);
    }
    return list;
  }, [companies, search, categoryId]);

  return (
    <>
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-10 md:py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white/80 mb-4">
            <Building2 size={13} />
            Entreprises référencées
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3 leading-tight">
            Toutes les entreprises du Sénégal
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto">
            Parcourez et comparez les entreprises notées par la communauté EchoWork.
          </p>

          {/* Search */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Nom de l'entreprise…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-9 py-3 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-red-400 bg-white"
              />
              {search && (
                <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  <X size={14} />
                </button>
              )}
            </div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="py-3 px-4 rounded-xl text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-red-400 min-w-[160px]"
            >
              <option value="">Tous les secteurs</option>
              {categories?.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {!loading && !error && (
            <p className="text-sm text-gray-400 mb-5">
              {filtered.length} entreprise{filtered.length !== 1 ? 's' : ''}
              {(search || categoryId) ? ' correspondant à votre recherche' : ' référencées'}
            </p>
          )}

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={28} className="animate-spin text-red-500" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 text-red-500 py-16">
              <AlertCircle size={18} /> {error}
            </div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
              <Building2 size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">Aucune entreprise trouvée</p>
              {(search || categoryId) && (
                <button
                  onClick={() => { setSearch(''); setCategoryId(''); }}
                  className="mt-3 text-sm text-red-600 hover:underline"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filtered.map((c) => (
                <Link
                  key={c.id}
                  to={`/companies/${c.slug}`}
                  className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:shadow-md hover:border-red-200 transition-all group"
                >
                  {c.imageUrl ? (
                    <img
                      src={c.imageUrl}
                      alt={c.name}
                      className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0 text-red-400 font-bold text-lg">
                      {c.name?.[0]?.toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-gray-900 text-sm group-hover:text-red-600 transition-colors truncate">
                      {c.name}
                    </h2>
                    <span className="text-xs text-gray-400">{c.category?.name}</span>
                    {c.reviewCount > 0 ? (
                      <div className="flex items-center gap-1 mt-1">
                        <Star size={12} className="fill-red-500 text-red-500" />
                        <span className="text-xs font-semibold text-gray-700">{Number(c.averageRating || 0).toFixed(1)}</span>
                        <span className="text-xs text-gray-400">({c.reviewCount} avis)</span>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-300 italic">Aucun avis</span>
                    )}
                  </div>
                  <ChevronRight size={16} className="text-gray-300 group-hover:text-red-400 transition-colors shrink-0" />
                </Link>
              ))}
            </div>
          )}

        </div>
      </div>

      <Foot />
    </>
  );
}
