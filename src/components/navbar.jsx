import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, Menu, X, LogOut, LayoutDashboard, User,
  Utensils, Landmark, ShoppingCart, Hospital, Briefcase,
  Factory, Phone, Zap, Truck, Building2, Wheat, GraduationCap,
  Home, UtensilsCrossed, Monitor, Scale, BarChart3,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import SearchAutocomplete from './SearchAutocomplete';
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

export default function Navbar() {
  const { user, isAuthenticated, logout } = useAuth();
  const { categories } = useCategories();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catOpen, setCatOpen] = useState(false);
  const [exploreOpen, setExploreOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <nav className={`sticky top-0 z-50 w-full bg-white transition-shadow duration-200 ${scrolled ? 'shadow-md' : 'shadow-sm'}`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center h-14 gap-3">

          {/* Logo */}
          <Link to="/" className="shrink-0 text-xl font-black tracking-tight">
            <span className="text-red-600">ECHO</span>
            <span className="text-gray-900">WORK</span>
          </Link>

          {/* Search — desktop */}
          <div className="flex-1 max-w-md hidden md:block">
            <SearchAutocomplete placeholder="Rechercher une entreprise..." variant="light" />
          </div>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            <Link
              to="/"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Accueil
            </Link>

            {/* Explorer dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setExploreOpen(true)}
              onMouseLeave={() => setExploreOpen(false)}
            >
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                Explorer
                <ChevronDown size={14} className={`transition-transform duration-200 ${exploreOpen ? 'rotate-180' : ''}`} />
              </button>
              {exploreOpen && (
                <div className="absolute left-0 top-full pt-2 w-56 z-50">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 space-y-0.5">
                    <Link
                      to="/classements"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-red-50 transition-colors group"
                    >
                      <BarChart3 size={15} className="text-red-500 shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-800 group-hover:text-red-600 text-xs">Classements</p>
                        <p className="text-[10px] text-gray-400">Top entreprises par secteur</p>
                      </div>
                    </Link>
                    <Link
                      to="/carrieres"
                      className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm hover:bg-red-50 transition-colors group"
                    >
                      <Briefcase size={15} className="text-red-500 shrink-0" />
                      <div>
                        <p className="font-semibold text-gray-800 group-hover:text-red-600 text-xs">Carrières by EchoWork</p>
                        <p className="text-[10px] text-gray-400">Offres d'emploi au Sénégal</p>
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* Categories dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setCatOpen(true)}
              onMouseLeave={() => setCatOpen(false)}
            >
              <button className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors">
                Catégories
                <ChevronDown size={14} className={`transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`} />
              </button>
              {catOpen && categories?.length > 0 && (
                <div className="absolute left-0 top-full pt-2 w-72 z-50">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-2 grid grid-cols-2 gap-0.5">
                    {categories.map((cat) => {
                      const Icon = catIconMap[cat.slug] || Briefcase;
                      return (
                        <Link
                          key={cat.slug}
                          to={`/categories/${cat.slug}`}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-red-50 transition-colors group"
                        >
                          <Icon size={14} className="text-red-500 shrink-0" />
                          <span className="font-medium text-gray-700 group-hover:text-red-600 leading-tight text-xs">{cat.name}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Auth */}
            {isAuthenticated ? (
              <div className="dropdown dropdown-end ml-1">
                <label
                  tabIndex={0}
                  className="flex items-center gap-2 pl-3 pr-2 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-red-600 text-white flex items-center justify-center text-xs font-bold uppercase shrink-0">
                    {user?.username?.[0]}
                  </div>
                  <span className="text-sm font-medium text-gray-900 max-w-[5rem] truncate">{user?.username}</span>
                  <ChevronDown size={13} className="text-gray-500" />
                </label>
                <ul tabIndex={0} className="dropdown-content menu shadow-xl bg-white border border-gray-100 rounded-2xl w-48 p-1.5 mt-1">
                  <li>
                    <Link to="/profile" className="flex items-center gap-2 text-sm rounded-xl">
                      <User size={14} />
                      Mon profil
                    </Link>
                  </li>
                  {user?.role === 'ADMIN' && (
                    <li>
                      <Link to="/admin" className="flex items-center gap-2 text-sm rounded-xl">
                        <LayoutDashboard size={14} />
                        Administration
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={logout}
                      className="flex items-center gap-2 text-sm text-red-600 rounded-xl w-full text-left"
                    >
                      <LogOut size={14} />
                      Déconnexion
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="flex items-center gap-2 ml-1">
                <Link
                  to="/login"
                  className="px-4 py-1.5 text-sm font-medium text-gray-700 hover:text-red-600 border border-gray-200 rounded-full hover:border-red-300 transition-colors"
                >
                  Connexion
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-1.5 text-sm font-medium text-white bg-red-600 rounded-full hover:bg-red-700 transition-colors shadow-sm"
                >
                  Inscription
                </Link>
              </div>
            )}
          </div>

        </div>

        {/* Mobile search */}
        <div className="md:hidden pb-3">
          <SearchAutocomplete placeholder="Rechercher une entreprise..." variant="light" />
        </div>
      </div>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-40" onClick={closeMobile} />
          <div className="fixed inset-y-0 right-0 w-72 bg-white z-50 shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <span className="text-lg font-black">
                <span className="text-red-600">ECHO</span>
                <span className="text-gray-900">WORK</span>
              </span>
              <button onClick={closeMobile} className="p-2 rounded-lg hover:bg-gray-100">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
              <Link
                to="/"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
                onClick={closeMobile}
              >
                Accueil
              </Link>

              <div className="pt-2">
                <p className="px-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">Explorer</p>
                <Link
                  to="/classements"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                  onClick={closeMobile}
                >
                  <BarChart3 size={14} className="text-red-500" />
                  <span className="font-medium text-gray-700">Classements</span>
                </Link>
                <Link
                  to="/carrieres"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                  onClick={closeMobile}
                >
                  <Briefcase size={14} className="text-red-500" />
                  <div>
                    <span className="font-medium text-gray-700">Carrières by EchoWork</span>
                  </div>
                </Link>
              </div>

              <div className="pt-2">
                <p className="px-3 pb-1 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Catégories
                </p>
                <div className="space-y-0.5">
                  {categories?.map((cat) => {
                    const Icon = catIconMap[cat.slug] || Briefcase;
                    return (
                      <Link
                        key={cat.slug}
                        to={`/categories/${cat.slug}`}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                        onClick={closeMobile}
                      >
                        <Icon size={14} className="text-red-500 shrink-0" />
                        <span className="font-medium text-gray-700">{cat.name}</span>
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="px-4 py-4 border-t border-gray-100">
              {isAuthenticated ? (
                <div className="space-y-1">
                  <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-gray-50 mb-2">
                    <div className="w-8 h-8 rounded-full bg-red-600 text-white flex items-center justify-center text-sm font-bold uppercase shrink-0">
                      {user?.username?.[0]}
                    </div>
                    <span className="text-sm font-medium">{user?.username}</span>
                  </div>
                  <Link
                    to="/profile"
                    className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
                    onClick={closeMobile}
                  >
                    <User size={15} />
                    Mon profil
                  </Link>
                  {user?.role === 'ADMIN' && (
                    <Link
                      to="/admin"
                      className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-100 transition-colors"
                      onClick={closeMobile}
                    >
                      <LayoutDashboard size={15} />
                      Administration
                    </Link>
                  )}
                  <button
                    onClick={() => { logout(); closeMobile(); }}
                    className="flex items-center gap-2 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} />
                    Déconnexion
                  </button>
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  <Link
                    to="/login"
                    className="text-center py-2.5 border border-gray-200 rounded-full text-sm font-medium hover:border-red-300 hover:text-red-600 transition-colors"
                    onClick={closeMobile}
                  >
                    Connexion
                  </Link>
                  <Link
                    to="/signup"
                    className="text-center py-2.5 bg-red-600 text-white rounded-full text-sm font-medium hover:bg-red-700 transition-colors"
                    onClick={closeMobile}
                  >
                    Inscription
                  </Link>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
