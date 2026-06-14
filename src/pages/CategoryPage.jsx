import { useState, useMemo, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  Search, X, Star, Building2, MapPin, ChevronRight,
  Utensils, Landmark, ShoppingCart, Hospital, Briefcase,
  Factory, Phone, Zap, Truck, Wheat, GraduationCap,
  Home, UtensilsCrossed, Monitor, Scale,
} from 'lucide-react';
import Navbar from '../components/navbar';
import Foot from '../components/Foot';
import { useCompaniesByCategory } from '../hooks/useCompany';
import { useCategories } from '../hooks/useCategory';

const catIconMap = {
  'agriculture': Wheat,
  'agriculture-et-alimentation': Wheat,
  'alimentation-et-boissons': Utensils,
  'automobile': Truck,
  'commerce-et-distribution': ShoppingCart,
  'construction-et-btp': Building2,
  'industrie': Factory,
  'sante-et-pharmacie': Hospital,
  'services': Briefcase,
  'telecommunications': Phone,
  'energie-et-petrole': Zap,
  'banques-et-institutions-financieres': Landmark,
  'etablissements-d-enseignement-superieur': GraduationCap,
  'ecole-et-enseignement-superieure': GraduationCap,
  'transport-et-logistique': Truck,
  'immobilier': Home,
  'restauration-et-hotellerie': UtensilsCrossed,
  'informatique-et-numerique': Monitor,
  'services-publics': Scale,
};

function StarDisplay({ rating, size = 13 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? 'fill-red-500 text-red-500' : 'fill-gray-200 text-gray-200'}
        />
      ))}
    </div>
  );
}

export default function CategoryPage() {
  const { slug } = useParams();
  const { companies = [], loading, error } = useCompaniesByCategory(slug);
  const { categories } = useCategories();
  const [search, setSearch] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [displayCount, setDisplayCount] = useState(20);

  useEffect(() => { setDisplayCount(20); }, [search, ratingFilter]);

  const filtered = useMemo(() => {
    let list = companies;
    if (search) list = list.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    if (ratingFilter) list = list.filter((c) => Math.round(c.averageRating || 0) >= parseInt(ratingFilter));
    return list;
  }, [companies, search, ratingFilter]);

  const displayed = filtered.slice(0, displayCount);
  const currentCategory = categories?.find((c) => c.slug === slug);
  const CatIcon = catIconMap[slug] || Briefcase;

  if (loading) return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <span className="loading loading-spinner loading-lg text-red-600" />
      </div>
      <Foot />
    </>
  );

  if (error) return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <p className="text-red-600 font-medium">Erreur : {error}</p>
      </div>
      <Foot />
    </>
  );

  return (
    <>
      <Navbar />

      {/* Category header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-7 md:py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-1.5 text-xs text-white/40 mb-3">
            <Link to="/" className="hover:text-white/80 transition-colors">Accueil</Link>
            <ChevronRight size={11} />
            <span className="text-white">{currentCategory?.name || slug?.replace(/-/g, ' ')}</span>
          </div>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-11 h-11 md:w-14 md:h-14 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
              <CatIcon size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-black capitalize">
                {currentCategory?.name || slug?.replace(/-/g, ' ')}
              </h1>
              <p className="text-white/55 text-xs md:text-sm mt-0.5">
                {companies.length} entreprise{companies.length !== 1 ? 's' : ''} au Sénégal
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-8">

            {/* Sidebar */}
            <aside className="lg:w-56 shrink-0">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sticky top-20">
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Autres categories</h3>
                <div className="space-y-0.5">
                  {categories?.map((cat) => {
                    const Icon = catIconMap[cat.slug] || Briefcase;
                    const active = cat.slug === slug;
                    return (
                      <Link
                        key={cat.slug}
                        to={`/categories/${cat.slug}`}
                        className={`flex items-center gap-2 px-2.5 py-2 rounded-xl text-xs transition-colors ${
                          active
                            ? 'bg-red-600 text-white font-semibold'
                            : 'text-gray-600 hover:bg-red-50 hover:text-red-600'
                        }`}
                      >
                        <Icon size={13} className={active ? 'text-white/80' : 'text-red-400'} />
                        <span className="truncate leading-tight">{cat.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </aside>

            {/* Main content */}
            <div className="flex-1 min-w-0">

              {/* Search and filter */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-5">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Rechercher une entreprise..."
                      className="w-full pl-9 pr-9 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                    {search && (
                      <button
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        onClick={() => setSearch('')}
                      >
                        <X size={13} />
                      </button>
                    )}
                  </div>
                  <select
                    className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 bg-white text-gray-700"
                    value={ratingFilter}
                    onChange={(e) => setRatingFilter(e.target.value)}
                  >
                    <option value="">Toutes les notes</option>
                    <option value="5">5 etoiles</option>
                    <option value="4">4+ etoiles</option>
                    <option value="3">3+ etoiles</option>
                    <option value="2">2+ etoiles</option>
                  </select>
                </div>
                {filtered.length !== companies.length && (
                  <p className="text-xs text-gray-400 mt-2">
                    {filtered.length} resultat{filtered.length !== 1 ? 's' : ''}
                  </p>
                )}
              </div>

              {/* Companies list */}
              {displayed.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-16 text-center">
                  <Building2 size={40} className="text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">Aucune entreprise trouvée</p>
                  {(search || ratingFilter) && (
                    <button
                      className="mt-3 text-sm text-red-600 hover:underline"
                      onClick={() => { setSearch(''); setRatingFilter(''); }}
                    >
                      Réinitialiser les filtres
                    </button>
                  )}
                </div>
              ) : (
                <div className="space-y-2.5">
                  {displayed.map((company, i) => {
                    const avg = company.averageRating || 0;
                    return (
                      <Link
                        key={company.slug}
                        to={`/companies/${company.slug}`}
                        className="flex items-center gap-3 md:gap-4 bg-white rounded-2xl shadow-sm border border-gray-100 p-3.5 md:p-5 hover:shadow-md hover:border-red-200 active:scale-[0.99] transition-all duration-200 group"
                      >
                        {/* Rank badge */}
                        <div className={`w-7 h-7 md:w-8 md:h-8 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                          i === 0 ? 'bg-yellow-400 text-yellow-900' :
                          i === 1 ? 'bg-gray-300 text-gray-700' :
                          i === 2 ? 'bg-amber-600/70 text-white' :
                          'bg-gray-100 text-gray-400'
                        }`}>
                          {i + 1}
                        </div>

                        {/* Logo */}
                        {company.imageUrl ? (
                          <img
                            src={company.imageUrl}
                            alt={company.name}
                            className="w-11 h-11 md:w-14 md:h-14 rounded-xl object-cover bg-gray-100 shrink-0"
                          />
                        ) : (
                          <div className="w-11 h-11 md:w-14 md:h-14 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
                            <Building2 size={18} className="text-red-400" />
                          </div>
                        )}

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <h2 className="font-bold text-gray-900 text-sm md:text-base group-hover:text-red-600 transition-colors leading-snug truncate">
                              {company.name}
                            </h2>
                            {company.subscription?.isActive && company.subscription?.plan === 'PREMIUM' && (
                              <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700">★ PREMIUM</span>
                            )}
                            {company.subscription?.isActive && company.subscription?.plan === 'PRO' && (
                              <span className="shrink-0 text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-blue-100 text-blue-700">✦ PRO</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <StarDisplay rating={avg} size={11} />
                            {avg > 0 && (
                              <span className="text-xs text-gray-400">{Number(avg).toFixed(1)}</span>
                            )}
                          </div>
                          {(company.ville || company.adresse) && (
                            <div className="flex items-center gap-1 text-[10px] text-gray-300 mt-0.5">
                              <MapPin size={9} />
                              {company.ville || company.adresse}
                            </div>
                          )}
                        </div>

                        <ChevronRight size={15} className="text-gray-300 group-hover:text-red-400 transition-colors shrink-0" />
                      </Link>
                    );
                  })}
                </div>
              )}

              {/* Show more */}
              {filtered.length > displayCount && (
                <div className="flex justify-center mt-6">
                  <button
                    onClick={() => setDisplayCount((n) => n + 20)}
                    className="px-6 py-2.5 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 transition-colors shadow-sm"
                  >
                    Afficher plus ({filtered.length - displayCount} restant{filtered.length - displayCount > 1 ? 's' : ''})
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="md:hidden h-20" />
      <Foot />
    </>
  );
}
