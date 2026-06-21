import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  ChevronDown, Menu, X, LogOut, LayoutDashboard, User,
  Utensils, Landmark, ShoppingCart, Hospital, Briefcase,
  Factory, Phone, Zap, Truck, Building2, Wheat, GraduationCap,
  Home, UtensilsCrossed, Monitor, Scale, BarChart3, Search, Bell,
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
  const [scrolled, setScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const searchPanelRef = useRef(null);
  const notifPanelRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClickOutside = (e) => {
      if (searchPanelRef.current && !searchPanelRef.current.contains(e.target)) setSearchOpen(false);
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
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

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1 ml-auto">
            <Link
              to="/entreprises"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Entreprises
            </Link>

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

            <Link
              to="/classements"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Classements
            </Link>
            <Link
              to="/a-propos"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              À propos
            </Link>
            <Link
              to="/insights"
              className="px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              Insights
            </Link>

            {/* Search toggle */}
            <div className="relative ml-1" ref={searchPanelRef}>
              <button
                onClick={() => setSearchOpen((v) => !v)}
                className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Rechercher"
              >
                <Search size={17} />
              </button>
              {searchOpen && (
                <div className="absolute right-0 top-full pt-2 w-80 z-50">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-3">
                    <SearchAutocomplete placeholder="Rechercher une entreprise..." variant="light" />
                  </div>
                </div>
              )}
            </div>

            {/* Notifications */}
            <div className="relative" ref={notifPanelRef}>
              <button
                onClick={() => setNotifOpen((v) => !v)}
                className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Notifications"
              >
                <Bell size={17} />
              </button>
              {notifOpen && (
                <div className="absolute right-0 top-full pt-2 w-64 z-50">
                  <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-4 text-center">
                    <Bell size={20} className="text-gray-300 mx-auto mb-2" />
                    <p className="text-xs text-gray-400">Aucune notification pour le moment</p>
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
              <Link
                to="/entreprises"
                className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
                onClick={closeMobile}
              >
                Entreprises
              </Link>

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

              <div className="pt-2 space-y-0.5">
                <Link
                  to="/classements"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                  onClick={closeMobile}
                >
                  <BarChart3 size={14} className="text-red-500" />
                  <span className="font-medium text-gray-700">Classements</span>
                </Link>
                <Link
                  to="/a-propos"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                  onClick={closeMobile}
                >
                  <span className="font-medium text-gray-700 ml-[26px]">À propos</span>
                </Link>
                <Link
                  to="/insights"
                  className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm hover:bg-red-50 hover:text-red-600 transition-colors"
                  onClick={closeMobile}
                >
                  <span className="font-medium text-gray-700 ml-[26px]">Insights</span>
                </Link>
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
