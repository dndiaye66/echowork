import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Star, ArrowRight, ChevronRight, Building2,
  Utensils, Landmark, ShoppingCart, Hospital, Briefcase,
  Factory, Phone, Zap, Truck, Wheat, GraduationCap,
  MapPin, Home, UtensilsCrossed, Monitor,
  TrendingUp, TrendingDown, MessageSquare, Shield, Users,
  LayoutGrid, Award, Lock, ArrowRightCircle, Scale,
} from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import Navbar from '../components/navbar';
import Foot from '../components/Foot';
import SearchAutocomplete from '../components/SearchAutocomplete';
import { useBestCompanies, useStats, useBarometer } from '../hooks/useHomeData';
import { useCategories } from '../hooks/useCategory';
import { vitrineService } from '../services/vitrineService';
import backgroundImage from '../assets/image/background_banner.png';
import campusPoster from '../assets/image/campus-challenge-2026.png';

// ── Brand color map for known Senegalese companies ────────────────────────
const BRAND_COLORS = {
  'orange-senegal':        { bg: 'bg-orange-500',  text: 'text-white' },
  'orange':                { bg: 'bg-orange-500',  text: 'text-white' },
  'wave':                  { bg: 'bg-teal-500',    text: 'text-white' },
  'wave-mobile':           { bg: 'bg-teal-500',    text: 'text-white' },
  'senelec':               { bg: 'bg-blue-900',    text: 'text-white' },
  'sonatel':               { bg: 'bg-green-600',   text: 'text-white' },
  'auchan':                { bg: 'bg-red-600',     text: 'text-white' },
  'auchan-senegal':        { bg: 'bg-red-600',     text: 'text-white' },
  'bdk':                   { bg: 'bg-emerald-700', text: 'text-white' },
  'free-senegal':          { bg: 'bg-red-500',     text: 'text-white' },
  'expresso':              { bg: 'bg-purple-600',  text: 'text-white' },
  'cbao':                  { bg: 'bg-blue-600',    text: 'text-white' },
  'sgbs':                  { bg: 'bg-red-700',     text: 'text-white' },
  'ecobank':               { bg: 'bg-cyan-600',    text: 'text-white' },
  'boa':                   { bg: 'bg-green-700',   text: 'text-white' },
  'bhs':                   { bg: 'bg-yellow-500',  text: 'text-white' },
  'alios-finance-senegal': { bg: 'bg-teal-600',    text: 'text-white' },
  'aims-senegal':          { bg: 'bg-lime-600',    text: 'text-white' },
};

// ── Category icon map ──────────────────────────────────────────────────────
const catMap = {
  'agriculture':                              { Icon: Wheat,           bg: 'bg-green-100',   color: 'text-green-700'   },
  'agriculture-et-alimentation':              { Icon: Wheat,           bg: 'bg-green-100',   color: 'text-green-700'   },
  'alimentation-et-boissons':                 { Icon: Utensils,        bg: 'bg-orange-100',  color: 'text-orange-700'  },
  'automobile':                               { Icon: Truck,           bg: 'bg-blue-100',    color: 'text-blue-700'    },
  'commerce-et-distribution':                 { Icon: ShoppingCart,    bg: 'bg-purple-100',  color: 'text-purple-700'  },
  'construction-et-btp':                      { Icon: Building2,       bg: 'bg-yellow-100',  color: 'text-yellow-800'  },
  'industrie':                                { Icon: Factory,         bg: 'bg-gray-100',    color: 'text-gray-700'    },
  'sante-et-pharmacie':                       { Icon: Hospital,        bg: 'bg-red-100',     color: 'text-red-700'     },
  'services':                                 { Icon: Briefcase,       bg: 'bg-indigo-100',  color: 'text-indigo-700'  },
  'telecommunications':                       { Icon: Phone,           bg: 'bg-cyan-100',    color: 'text-cyan-700'    },
  'energie-et-petrole':                       { Icon: Zap,             bg: 'bg-amber-100',   color: 'text-amber-700'   },
  'banques-et-institutions-financieres':      { Icon: Landmark,        bg: 'bg-emerald-100', color: 'text-emerald-700' },
  'etablissements-d-enseignement-superieur':  { Icon: GraduationCap,   bg: 'bg-violet-100',  color: 'text-violet-700'  },
  'ecole-et-enseignement-superieure':         { Icon: GraduationCap,   bg: 'bg-violet-100',  color: 'text-violet-700'  },
  'transport-et-logistique':                  { Icon: Truck,           bg: 'bg-sky-100',     color: 'text-sky-700'     },
  'immobilier':                               { Icon: Home,            bg: 'bg-rose-100',    color: 'text-rose-700'    },
  'restauration-et-hotellerie':               { Icon: UtensilsCrossed, bg: 'bg-orange-100',  color: 'text-orange-700'  },
  'informatique-et-numerique':                { Icon: Monitor,         bg: 'bg-blue-100',    color: 'text-blue-700'    },
  'services-publics':                         { Icon: Scale,           bg: 'bg-slate-100',   color: 'text-slate-700'   },
};

// Static reviews removed — only real approved reviews from the API are shown

const STATIC_BAROMETER = [
  { slug: 'banques-et-institutions-financieres', label: 'Banques',          avg: 4.3, trend: 0.2,  count: 0 },
  { slug: 'telecommunications',                  label: 'Télécoms',         avg: 4.1, trend: -0.1, count: 0 },
  { slug: 'services',                            label: 'Services publics', avg: 3.2, trend: 0.3,  count: 0 },
  { slug: 'sante-et-pharmacie',                  label: 'Santé',            avg: 4.0, trend: 0.1,  count: 0 },
];

const SPARKLINE_COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#a855f7'];

function sparklineData(avg, trend, slug) {
  let seed = 0;
  for (let i = 0; i < slug.length; i++) seed = (seed * 31 + slug.charCodeAt(i)) >>> 0;
  const rand = () => { seed = (seed * 1103515245 + 12345) >>> 0; return (seed % 1000) / 1000; };
  const points = 7;
  const step = (trend || 0.15) / points;
  let v = avg - (trend || 0.15);
  return Array.from({ length: points }, (_, i) => {
    v += step + (rand() - 0.5) * 0.15;
    return { v: Math.max(0, parseFloat(v.toFixed(2))) };
  }).map((p, i, arr) => (i === arr.length - 1 ? { v: avg } : p));
}

// ── Utilities ──────────────────────────────────────────────────────────────
function roundToHalf(v) { return Math.round((v || 0) * 2) / 2; }

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)      return "À l'instant";
  if (diff < 3600)    return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400)   return `Il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 2592000) return `Il y a ${Math.floor(diff / 86400)} j`;
  return `Il y a ${Math.floor(diff / 2592000)} mois`;
}

function formatCount(n) {
  if (!n) return '—';
  if (n >= 1000) return `${(Math.floor(n / 1000) * 1000).toLocaleString('fr')}+`;
  if (n >= 100)  return `${Math.floor(n / 10) * 10}+`;
  return `${n}`;
}

// Garde le dernier avis par entreprise, dans l'ordre du plus récent au plus ancien
function dedupeByCompany(reviews, limit) {
  const seen = new Set();
  const result = [];
  for (const r of reviews) {
    const key = r.company?.id ?? r.companyId;
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(r);
    if (result.length >= limit) break;
  }
  return result;
}

// ── Sub-components ─────────────────────────────────────────────────────────
function StarRating({ rating, size = 14 }) {
  const r = roundToHalf(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const full = i <= Math.floor(r);
        const half = !full && i - 0.5 === r;
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            <Star size={size} className="fill-gray-200 text-gray-200 absolute inset-0" />
            {full && <Star size={size} className="fill-red-500 text-red-500 absolute inset-0" />}
            {half && (
              <span className="absolute inset-0 overflow-hidden" style={{ width: '50%' }}>
                <Star size={size} className="fill-red-500 text-red-500" />
              </span>
            )}
          </span>
        );
      })}
    </div>
  );
}

function Sparkline({ data, color }) {
  const gradId = `spark-${color.replace('#', '')}`;
  return (
    <ResponsiveContainer width="100%" height={48}>
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          type="monotone"
          dataKey="v"
          stroke={color}
          strokeWidth={2}
          fill={`url(#${gradId})`}
          dot={{ r: 2, fill: color, strokeWidth: 0 }}
          activeDot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ── Floating company card (hero decoration) ────────────────────────────────
function HeroCard({ company, className }) {
  const avg = parseFloat(company?.averageRating || 0);
  if (!company) return null;
  return (
    <div className={`absolute bg-white rounded-2xl shadow-lg border border-gray-100 p-3 flex items-center gap-3 w-52 ${className}`}>
      {company.imageUrl ? (
        <img src={company.imageUrl} alt={company.name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
      ) : (() => {
        const brand = BRAND_COLORS[company.slug];
        return (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-black text-base ${brand ? `${brand.bg} ${brand.text}` : 'bg-red-50 text-red-500'}`}>
            {company.name?.[0]?.toUpperCase()}
          </div>
        );
      })()}
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 text-xs truncate">{company.name}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <StarRating rating={avg} size={10} />
          <span className="text-xs font-bold text-gray-600">{avg.toFixed(1)}</span>
        </div>
        {+company.reviewCount > 0 && (
          <p className="text-[10px] text-gray-400 mt-0.5">{company.reviewCount} avis</p>
        )}
      </div>
    </div>
  );
}

// ── Main page ──────────────────────────────────────────────────────────────
export default function VitrinePage() {
  const { data: companies, loading: companiesLoading } = useBestCompanies();
  const { categories, loading: catLoading } = useCategories();
  const { data: stats } = useStats();
  const { data: baroData } = useBarometer();
  const [recentReviews, setRecentReviews] = useState([]);

  useEffect(() => {
    vitrineService.getRecentReviews(30).then(setRecentReviews);
  }, []);

  const topCompanies  = companies?.slice(0, 6) || [];
  const rankCompanies = companies?.slice(0, 5) || [];
  const visibleCats   = categories?.slice(0, 7) || [];
  const hasMoreCats   = (categories?.length || 0) > 7;
  const reviews       = dedupeByCompany(recentReviews, 5);
  const barometer     = baroData?.filter(b => b.avg !== null).length > 0 ? baroData : STATIC_BAROMETER;

  return (
    <>
      <Navbar />

      {/* ── 1. Hero — split layout ────────────────────────────────────────── */}
      <section className="bg-white border-b border-gray-100 overflow-hidden relative">

        {/* Decorative background glows */}
        <div className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-red-100 opacity-25 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-80 h-80 rounded-full bg-rose-100 opacity-20 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 left-1/3 w-96 h-96 rounded-full bg-red-50 opacity-30 blur-3xl pointer-events-none" />
        <div className="absolute top-8 right-1/2 w-48 h-48 rounded-full bg-pink-100 opacity-15 blur-2xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 md:py-20 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            {/* Left: Text content */}
            <div>
              <div className="inline-flex items-center gap-2 bg-white border border-red-200 rounded-full px-4 py-1.5 text-xs font-semibold text-red-600 mb-6 shadow-sm">
                <Shield size={13} className="shrink-0" />
                La plateforme d'avis et de classement des entreprises au Sénégal
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.05] mb-3">
                Notez les{' '}
                <span className="text-red-600">entreprises</span>{' '}
                du Sénégal.
              </h1>
              <div className="flex items-center gap-1 mb-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} size={18} className="fill-red-500 text-red-500" />
                ))}
              </div>
              <p className="text-gray-500 text-base md:text-lg mb-7 leading-relaxed max-w-lg">
                Consultez des avis authentiques, comparez les services et partagez votre
                expérience pour aider la communauté à faire les meilleurs choix.
              </p>

              <div className="mb-6">
                <SearchAutocomplete placeholder="Rechercher une entreprise, un service..." variant="light" />
              </div>

              <div className="flex items-center gap-3 flex-wrap mb-10">
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-full font-semibold text-sm hover:bg-red-700 transition-colors shadow-sm"
                >
                  <Star size={13} fill="currentColor" /> Donner un avis
                </Link>
                <a
                  href="#categories"
                  className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-full font-semibold text-sm hover:border-red-300 hover:text-red-600 transition-colors"
                >
                  Explorer les entreprises <ArrowRightCircle size={14} />
                </a>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {[
                  { Icon: Building2,   iconBg: 'bg-red-50',    iconColor: 'text-red-500',    n: formatCount(stats?.companyCount),  l1: 'Entreprises', l2: 'référencées' },
                  { Icon: LayoutGrid,  iconBg: 'bg-green-50',  iconColor: 'text-green-600',  n: formatCount(stats?.categoryCount), l1: 'Secteurs',    l2: "d'activité" },
                  { Icon: Users,       iconBg: 'bg-purple-50', iconColor: 'text-purple-500', n: formatCount(stats?.reviewCount),   l1: 'Avis',        l2: 'publiés' },
                  { Icon: Award,       iconBg: 'bg-amber-50',  iconColor: 'text-amber-500',  n: formatCount(stats?.userCount),     l1: 'Utilisateurs', l2: 'actifs' },
                ].map(({ Icon, iconBg, iconColor, n, l1, l2 }) => (
                  <div key={l1} className="flex items-center gap-2.5 bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 shadow-sm">
                    <div className={`w-9 h-9 rounded-lg ${iconBg} flex items-center justify-center shrink-0`}>
                      <Icon size={17} className={iconColor} />
                    </div>
                    <div>
                      <p className="text-lg font-black text-gray-900 leading-none">{n}</p>
                      <p className="text-[11px] text-gray-500 leading-tight">{l1}</p>
                      <p className="text-[10px] text-gray-400 leading-tight">{l2}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Photo + floating company cards (desktop only) */}
            <div className="hidden lg:block relative h-[420px]">

              {/* Red dot pattern — top right corner */}
              <div
                className="absolute top-0 right-0 w-28 h-28 z-0 opacity-70"
                style={{
                  backgroundImage: 'radial-gradient(circle, #dc2626 1.5px, transparent 1.5px)',
                  backgroundSize: '14px 14px',
                }}
              />

              {/* Photo */}
              <div className="absolute inset-x-12 inset-y-0 rounded-3xl overflow-hidden shadow-xl z-10">
                <img
                  src={backgroundImage}
                  alt="Utilisatrice Echowork"
                  className="w-full h-full object-cover object-center"
                />
                {/* Subtle overlay */}
                <div className="absolute inset-0 bg-white/5" />
              </div>

              {/* Floating cards */}
              {companiesLoading ? (
                <>
                  <div className="absolute top-8 left-0 w-52 h-16 bg-white rounded-2xl shadow-lg animate-pulse z-20" />
                  <div className="absolute top-[9rem] right-0 w-52 h-16 bg-white rounded-2xl shadow-lg animate-pulse z-20" />
                  <div className="absolute top-[17rem] left-4 w-52 h-16 bg-white rounded-2xl shadow-lg animate-pulse z-20" />
                </>
              ) : (
                <>
                  <HeroCard company={topCompanies[0]} className="top-8 left-0 z-20 shadow-xl" />
                  <HeroCard company={topCompanies[1]} className="top-[9rem] right-0 z-20 shadow-xl" />
                  <HeroCard company={topCompanies[2]} className="top-[17rem] left-4 z-20 shadow-xl" />
                </>
              )}

              {/* Testimonial card */}
              <div className="absolute bottom-0 left-8 right-8 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3.5 flex items-start gap-3 z-20">
                <span className="text-red-400 text-2xl font-serif leading-none mt-0.5 shrink-0">"</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-800 leading-snug mb-2">
                    Grâce aux avis Echowork, j'ai toujours fait les bons choix.
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                      {[
                        'bg-amber-400','bg-rose-400','bg-violet-400','bg-teal-400',
                      ].map((bg, i) => (
                        <div key={i} className={`w-6 h-6 rounded-full ${bg} border-2 border-white shrink-0`} />
                      ))}
                    </div>
                    <span className="text-[11px] text-gray-500 font-medium">+950 utilisateurs actifs</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ── Pourquoi Echowork ────────────────────────────────────────────── */}
      <section className="bg-white py-8 px-4 md:px-8">
        <div className="max-w-7xl mx-auto bg-red-50/60 rounded-3xl px-6 md:px-10 py-6 md:py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { Icon: Shield,        title: 'Avis authentiques',         desc: 'Des avis vérifiés pour des informations fiables.' },
              { Icon: Award,         title: 'Classements objectifs',     desc: 'Découvrez les entreprises les mieux notées.' },
              { Icon: MessageSquare, title: 'Partagez votre expérience', desc: "Votre avis aide la communauté à faire les bons choix." },
              { Icon: Lock,          title: '100% sécurisé',             desc: 'Vos données sont protégées et confidentielles.' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 shadow-sm">
                  <Icon size={18} className="text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{title}</p>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Catégories ─────────────────────────────────────────────────── */}
      <section id="categories" className="bg-white py-10 md:py-14 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl md:text-2xl font-black text-gray-900">Explorez par catégorie</h2>
          </div>

          {catLoading ? (
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {[...Array(8)].map((_, i) => <div key={i} className="h-20 rounded-2xl bg-gray-100 animate-pulse" />)}
            </div>
          ) : (
            <div className="grid grid-cols-4 md:grid-cols-8 gap-3">
              {visibleCats.map((cat) => {
                const conf = catMap[cat.slug] || { Icon: Briefcase, bg: 'bg-gray-100', color: 'text-gray-700' };
                const count = cat._count?.companies || 0;
                return (
                  <Link
                    key={cat.slug}
                    to={`/categories/${cat.slug}`}
                    className="group flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 border border-gray-100 hover:bg-red-50 hover:border-red-200 transition-all duration-200"
                  >
                    <div className={`w-9 h-9 md:w-10 md:h-10 rounded-xl flex items-center justify-center ${conf.bg}`}>
                      <conf.Icon size={16} className={`${conf.color} md:hidden`} />
                      <conf.Icon size={18} className={`${conf.color} hidden md:block`} />
                    </div>
                    <span className="text-[10px] md:text-xs font-semibold text-gray-700 text-center leading-tight group-hover:text-red-600 transition-colors">
                      {cat.name}
                    </span>
                    {count > 0 && (
                      <span className="hidden md:block text-[10px] text-gray-400">{count} entreprises</span>
                    )}
                  </Link>
                );
              })}
              {hasMoreCats && (
                <Link
                  to="/classements"
                  className="group flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-gray-50 border border-dashed border-gray-200 hover:bg-red-50 hover:border-red-200 transition-all duration-200"
                >
                  <div className="w-9 h-9 md:w-10 md:h-10 rounded-xl bg-gray-200 flex items-center justify-center text-gray-500 font-bold text-xs">
                    +{(categories?.length || 0) - 7}
                  </div>
                  <span className="text-[10px] md:text-xs font-semibold text-gray-500 group-hover:text-red-600 transition-colors text-center">
                    Voir plus
                  </span>
                  {(categories?.length || 0) > 7 && (
                    <span className="hidden md:block text-[10px] text-gray-400">{(categories?.length || 0) - 7}+ catégories</span>
                  )}
                </Link>
              )}
            </div>
          )}
        </div>
      </section>

      {/* ── Aperçu rapide — mieux notées / insights / avis récents ────────── */}
      <section className="bg-gray-50 py-10 md:py-14 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5">

          {/* Les entreprises les mieux notées */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900 text-sm md:text-base">Les entreprises les mieux notées</h3>
              <Link to="/classements" className="hidden sm:flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline underline-offset-2 shrink-0">
                Voir le classement complet <ArrowRight size={12} />
              </Link>
            </div>
            <div className="divide-y divide-gray-50">
              {companiesLoading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 py-3">
                    <div className="w-6 h-6 rounded-full bg-gray-100 animate-pulse shrink-0" />
                    <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3.5 bg-gray-100 rounded animate-pulse w-2/3" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/3" />
                    </div>
                  </div>
                ))
              ) : rankCompanies.map((co, i) => {
                const avg = parseFloat(co.averageRating || 0);
                const brand = BRAND_COLORS[co.slug];
                return (
                  <Link
                    key={co.id}
                    to={`/companies/${co.slug}`}
                    className="flex items-center gap-3 py-3 hover:bg-gray-50/60 -mx-1 px-1 rounded-xl transition-colors group"
                  >
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0 ${
                      i === 0 ? 'bg-amber-400 text-amber-900' : 'bg-gray-700 text-white'
                    }`}>
                      {i + 1}
                    </span>
                    {co.imageUrl ? (
                      <img src={co.imageUrl} alt={co.name} className="w-9 h-9 rounded-xl object-cover shrink-0" />
                    ) : (
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 font-bold text-sm ${brand ? `${brand.bg} ${brand.text}` : 'bg-red-50 text-red-400'}`}>
                        {co.name?.[0]}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-red-600 transition-colors">{co.name}</p>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <StarRating rating={avg} size={11} />
                        <span className="text-xs font-bold text-gray-700">{avg.toFixed(1)}</span>
                        <span className="text-xs text-gray-400">({co.reviewCount || 0} avis)</span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* EchoWork Insights */}
          <div className="lg:col-span-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900 text-sm md:text-base">Echowork Insights</h3>
              <Link to="/insights" className="hidden sm:flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline underline-offset-2 shrink-0">
                Voir les insights <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-4">
              {barometer.slice(0, 3).map((b, i) => {
                const color = SPARKLINE_COLORS[i % SPARKLINE_COLORS.length];
                const trendPos = b.trend > 0;
                const trendNeutral = !b.trend || b.trend === 0;
                return (
                  <div key={b.slug}>
                    <p className="text-[11px] font-semibold text-gray-600 mb-1 truncate">Satisfaction {b.label?.toLowerCase()}</p>
                    <Sparkline data={sparklineData(b.avg, b.trend, b.slug)} color={color} />
                    <div className="flex items-center gap-1.5 mt-1">
                      <span className="text-lg font-black text-gray-900">
                        {b.avg}<span className="text-xs font-semibold text-gray-400">/5</span>
                      </span>
                      {!trendNeutral && (
                        <span className={`flex items-center gap-0.5 text-[10px] font-bold ${trendPos ? 'text-green-600' : 'text-red-500'}`}>
                          {trendPos ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                          {trendPos ? '+' : ''}{b.trend} ce mois
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Avis récents */}
          <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-gray-900 text-sm md:text-base">Avis récents</h3>
              <Link to="/avis-recents" className="hidden sm:flex items-center gap-1 text-xs font-semibold text-red-600 hover:underline underline-offset-2 shrink-0">
                Voir tous les avis <ArrowRight size={12} />
              </Link>
            </div>
            <div className="space-y-3 flex-1">
              {reviews.length > 0 ? (
                reviews.map((r) => (
                  <div key={r.id} className="flex items-start gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-red-500 font-bold text-xs">
                      {r.user?.username?.[0]?.toUpperCase() || '?'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-900 truncate">{r.user?.username}</p>
                      <div className="flex items-center gap-1 mt-0.5 mb-1">
                        <StarRating rating={r.rating} size={10} />
                      </div>
                      <p className="text-xs text-gray-500 leading-snug line-clamp-2">"{r.comment}"</p>
                      <p className="text-[10px] text-gray-300 mt-0.5">{timeAgo(r.createdAt)}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-gray-400 text-center py-6">Aucun avis récent</p>
              )}
            </div>
            <Link
              to="/signup"
              className="mt-4 flex items-center justify-center gap-2 px-4 py-2 border border-red-200 text-red-600 rounded-full text-xs font-semibold hover:bg-red-50 transition-colors"
            >
              <Star size={12} /> Donner un avis
            </Link>
          </div>

        </div>
      </section>

      {/* ── CTA — Votre avis compte ────────────────────────────────────────── */}
      <section className="bg-white py-10 md:py-14 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="relative overflow-hidden bg-red-600 rounded-3xl px-6 md:px-10 py-8 md:py-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div
              className="absolute top-0 left-0 w-32 h-32 opacity-20 pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(circle, #fff 1.5px, transparent 1.5px)', backgroundSize: '14px 14px' }}
            />
            <div className="flex items-center gap-4 relative z-10">
              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0">
                <Star size={22} className="text-red-600 fill-red-600" />
              </div>
              <div>
                <h2 className="text-lg md:text-xl font-black text-white leading-tight">
                  Votre avis compte, ensemble construisons la confiance.
                </h2>
                <p className="text-white/80 text-sm mt-1 max-w-md">
                  Partagez votre expérience et aidez des milliers de personnes à faire les bons choix au quotidien.
                </p>
              </div>
            </div>
            <Link
              to="/signup"
              className="relative z-10 shrink-0 inline-flex items-center gap-2 px-6 py-3 bg-white text-red-600 rounded-full font-bold text-sm hover:bg-red-50 transition-colors shadow-sm"
            >
              Donner mon avis <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Campus Challenge Banner ───────────────────── */}
      <section className="bg-gray-950 py-16 md:py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <Link
            to="/campus"
            className="group flex flex-col md:flex-row items-center gap-10 md:gap-14 rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 hover:border-red-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/20 p-8 md:p-14"
          >
            {/* Poster */}
            <div className="shrink-0 w-64 md:w-96">
              <img
                src={campusPoster}
                alt="EchoWork Campus Challenge 2026"
                className="w-full rounded-2xl shadow-xl group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 bg-red-600/20 border border-red-500/30 text-red-400 text-sm font-bold px-4 py-1.5 rounded-full mb-5">
                <GraduationCap size={14} /> Du 15 Juin au 15 Juillet 2026
              </span>
              <h2 className="text-3xl md:text-5xl font-black text-white leading-tight mb-4">
                EchoWork <span className="text-red-500">Campus Challenge</span> 2026
              </h2>
              <p className="text-gray-400 text-base md:text-lg mb-7 max-w-xl">
                Le 1er classement participatif des écoles et universités du Sénégal par les étudiants.
                Ton avis compte, ton école progresse !
              </p>
              <div className="inline-flex items-center gap-2 bg-red-600 group-hover:bg-red-700 text-white font-bold px-8 py-3.5 rounded-full text-base transition-colors">
                <Star size={16} /> Participer maintenant
                <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="mt-4 text-sm text-gray-600">
                Classement national publié le 20 Juillet 2026
              </p>
            </div>
          </Link>
        </div>
      </section>

      <Foot />
      <div className="md:hidden h-16" />
    </>
  );
}
