import { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard, Building2, FolderTree, Users, MessageSquare,
  Briefcase, TrendingUp, BarChart3, Star, LogOut, Menu, Bell, ChevronRight, AlertTriangle,
} from 'lucide-react';

const NAV = [
  { label: 'Tableau de bord', icon: LayoutDashboard, path: '/admin' },
  { label: 'Entreprises', icon: Building2, path: '/admin/companies' },
  { label: 'Catégories', icon: FolderTree, path: '/admin/categories' },
  { label: 'Utilisateurs', icon: Users, path: '/admin/users' },
  { label: 'Modération avis', icon: MessageSquare, path: '/admin/reviews', badge: true },
  { label: 'Signalements', icon: AlertTriangle, path: '/admin/signalements' },
  { label: "Offres d'emploi", icon: Briefcase, path: '/admin/job-offers' },
  { label: 'Publicités', icon: TrendingUp, path: '/admin/advertisements' },
  { label: 'Analytiques', icon: BarChart3, path: '/admin/analytics' },
];

function AdminLayout({ children, title, pendingCount = 0 }) {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated || user?.role !== 'ADMIN') navigate('/');
  }, [isAuthenticated, user, navigate]);

  const active = (path) =>
    path === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(path);

  const SidebarContent = () => (
    <aside className="flex flex-col h-full bg-base-100 border-r border-base-200 w-64">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-base-200 shrink-0">
        <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
          <Star size={18} className="text-primary-content" fill="currentColor" />
        </div>
        <div>
          <p className="font-bold text-sm">EchoWork</p>
          <p className="text-xs text-base-content/40">Administration</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
        {NAV.map(({ label, icon: Icon, path, badge }) => {
          const on = active(path);
          return (
            <Link
              key={path}
              to={path}
              onClick={() => setOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                on ? 'bg-primary text-primary-content shadow-sm' : 'text-base-content/60 hover:bg-base-200 hover:text-base-content'
              }`}
            >
              <Icon size={17} />
              <span className="flex-1">{label}</span>
              {badge && pendingCount > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${on ? 'bg-primary-content/20 text-primary-content' : 'bg-warning text-warning-content'}`}>
                  {pendingCount}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-4 py-4 border-t border-base-200 shrink-0">
        <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-base-200/50">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xs uppercase shrink-0">
            {user?.username?.[0] ?? 'A'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold truncate">{user?.username}</p>
            <p className="text-xs text-base-content/40 truncate">{user?.email}</p>
          </div>
          <button
            onClick={() => { logout?.(); navigate('/'); }}
            className="text-base-content/30 hover:text-error transition-colors"
            title="Déconnexion"
          >
            <LogOut size={15} />
          </button>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="flex h-screen bg-base-200 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden lg:flex shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile overlay */}
      {open && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div className="relative z-10 flex w-64"><SidebarContent /></div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-base-100 border-b border-base-200 px-6 py-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <button className="lg:hidden btn btn-ghost btn-sm btn-square" onClick={() => setOpen(true)}>
              <Menu size={18} />
            </button>
            <div>
              <h1 className="text-base font-bold leading-none">{title}</h1>
              <nav className="text-xs text-base-content/40 mt-0.5 flex items-center gap-1">
                <Link to="/admin" className="hover:text-primary">Admin</Link>
                {title !== 'Tableau de bord' && (
                  <>
                    <ChevronRight size={11} />
                    <span>{title}</span>
                  </>
                )}
              </nav>
            </div>
          </div>
          {pendingCount > 0 && (
            <Link to="/admin/reviews" className="btn btn-warning btn-sm gap-1.5">
              <Bell size={14} />
              <span className="hidden sm:inline">{pendingCount} en attente</span>
              <span className="sm:hidden">{pendingCount}</span>
            </Link>
          )}
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
    </div>
  );
}

export default AdminLayout;
