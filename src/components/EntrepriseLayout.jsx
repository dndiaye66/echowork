import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Building2, MessageSquare, BarChart3,
  CreditCard, LogOut, Menu, Star, ChevronRight, Sparkles,
} from 'lucide-react';

const NAV = [
  { label: 'Vue d\'ensemble', icon: LayoutDashboard, path: '/espace-entreprise/tableau-de-bord' },
  { label: 'Mon profil', icon: Building2, path: '/espace-entreprise/tableau-de-bord/profil' },
  { label: 'Avis clients', icon: MessageSquare, path: '/espace-entreprise/tableau-de-bord/avis' },
  { label: 'Statistiques', icon: BarChart3, path: '/espace-entreprise/tableau-de-bord/statistiques' },
  { label: 'Analyse IA', icon: Sparkles, path: '/espace-entreprise/tableau-de-bord/analyse-ia' },
  { label: 'Abonnement', icon: CreditCard, path: '/espace-entreprise/tableau-de-bord/abonnement' },
];

export default function EntrepriseLayout({ children, title }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const SidebarContent = () => (
    <aside className="flex flex-col h-full bg-white border-r border-gray-100 w-64">
      <div className="flex items-center gap-3 px-5 py-5 border-b border-gray-100 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-red-600 flex items-center justify-center">
          <Star size={18} className="text-white" fill="currentColor" />
        </div>
        <div>
          <p className="font-bold text-sm text-gray-900">EchoWork</p>
          <p className="text-xs text-gray-400">Espace Entreprise</p>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV.map(({ label, icon: Icon, path }) => {
          const active = isActive(path);
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setDrawerOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                active
                  ? 'bg-red-50 text-red-600'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              <Icon size={18} className={active ? 'text-red-600' : 'text-gray-400'} />
              <span className="flex-1">{label}</span>
              {active && <ChevronRight size={14} className="text-red-400" />}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-gray-100 p-4">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold text-sm">
            {user?.username?.[0]?.toUpperCase() ?? 'E'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">{user?.username}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 w-full px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <LogOut size={16} />
          Déconnexion
        </button>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar desktop */}
      <div className="hidden lg:flex shrink-0">
        <SidebarContent />
      </div>

      {/* Drawer mobile */}
      {drawerOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-64 flex flex-col">
            <SidebarContent />
          </div>
          <div className="flex-1 bg-black/40" onClick={() => setDrawerOpen(false)} />
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-100 px-4 lg:px-6 py-4 flex items-center gap-4 shrink-0">
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            onClick={() => setDrawerOpen(true)}
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-semibold text-gray-900 flex-1">{title}</h1>
          <Link
            to="/"
            className="text-sm text-gray-500 hover:text-red-600 transition-colors"
          >
            Voir le site
          </Link>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
