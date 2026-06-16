import { Link } from 'react-router-dom';
import {
  Star, ArrowRight, ChevronRight, Building2,
  Utensils, Landmark, ShoppingCart, Hospital, Briefcase,
  Factory, Phone, Zap, Truck, Wheat, GraduationCap,
  MapPin, Home, UtensilsCrossed, Monitor, Smartphone,
  TrendingUp, TrendingDown, MessageSquare, Shield, Users,
  LayoutGrid, Award, Lock, ArrowRightCircle, Scale,
} from 'lucide-react';
import Navbar from '../components/navbar';
import Foot from '../components/Foot';
import SearchAutocomplete from '../components/SearchAutocomplete';
import { useBestCompanies, useStats, useRecentReviews, useBarometer } from '../hooks/useHomeData';
import { useCategories } from '../hooks/useCategory';
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

const baroIcons = {
  'banques-et-institutions-financieres': { Icon: Landmark,  bg: 'bg-emerald-50', color: 'text-emerald-600', border: 'border-emerald-100' },
  'telecommunications':                  { Icon: Phone,     bg: 'bg-cyan-50',    color: 'text-cyan-600',    border: 'border-cyan-100'    },
  'services':                            { Icon: Briefcase, bg: 'bg-violet-50',  color: 'text-violet-600',  border: 'border-violet-100'  },
  'sante-et-pharmacie':                  { Icon: Hospital,  bg: 'bg-red-50',     color: 'text-red-600',     border: 'border-red-100'     },
};

// Static reviews removed — only real approved reviews from the API are shown

const STATIC_BAROMETER = [
  { slug: 'banques-et-institutions-financieres', label: 'Banques',          avg: 4.3, trend: 0.2,  count: 0 },
  { slug: 'telecommunications',                  label: 'Télécoms',         avg: 4.1, trend: -0.1, count: 0 },
  { slug: 'services',                            label: 'Services publics', avg: 3.2, trend: 0.3,  count: 0 },
  { slug: 'sante-et-pharmacie',                  label: 'Santé',            avg: 4.0, trend: 0.1,  count: 0 },
];

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

function ratingLabel(avg) {
  if (!avg) return null;
  if (avg < 1.5) return { t: 'Mauvais',  c: 'bg-red-100 text-red-700' };
  if (avg < 2.5) return { t: 'Médiocre', c: 'bg-orange-100 text-orange-700' };
  if (avg < 3.5) return { t: 'Moyen',    c: 'bg-yellow-100 text-yellow-700' };
  if (avg < 4.5) return { t: 'Bon',      c: 'bg-green-100 text-green-700' };
  return               { t: 'Excellent', c: 'bg-emerald-100 text-emerald-700' };
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

function CompanyCard({ company }) {
  const avg = parseFloat(company.averageRating || 0);
  const brand = BRAND_COLORS[company.slug];
  return (
    <Link
      to={`/companies/${company.slug}`}
      className="group shrink-0 w-36 md:w-auto bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 hover:-translate-y-1 transition-all duration-200 overflow-hidden"
    >
      {/* Colored brand header */}
      <div className={`h-20 flex items-center justify-center ${brand ? brand.bg : 'bg-gradient-to-br from-red-50 to-red-100'}`}>
        {company.imageUrl ? (
          <img src={company.imageUrl} alt={company.name} className="w-12 h-12 object-contain" />
        ) : (
          <span className={`text-3xl font-black ${brand ? brand.text : 'text-red-400'}`}>
            {company.name?.[0]?.toUpperCase()}
          </span>
        )}
      </div>
      {/* Card body */}
      <div className="p-3">
        <p className="font-semibold text-gray-900 text-xs leading-tight line-clamp-2 group-hover:text-red-600 transition-colors mb-1.5">
          {company.name}
        </p>
        <div className="flex items-center gap-1 mb-1">
          <StarRating rating={avg} size={10} />
          <span className="text-xs font-bold text-gray-700">{avg.toFixed(1)}</span>
        </div>
        {+company.reviewCount > 0 && (
          <p className="text-[10px] text-gray-400">{company.reviewCount} avis</p>
        )}
      </div>
    </Link>
  );
}

function ReviewCard({ review }) {
  const co = review.company;
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-4 flex flex-col gap-2.5 hover:shadow-sm transition-shadow">
      <div className="flex items-start gap-2.5">
        {co?.imageUrl ? (
          <img src={co.imageUrl} alt={co.name} className="w-8 h-8 rounded-lg object-cover shrink-0" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center shrink-0 text-red-500 font-bold text-sm">
            {co?.name?.[0]?.toUpperCase() || '?'}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <Link
            to={co?.slug ? `/companies/${co.slug}` : '#'}
            className="font-semibold text-gray-900 text-sm hover:text-red-600 transition-colors block truncate"
          >
            {co?.name || 'Entreprise'}
          </Link>
          <div className="flex items-center gap-1.5 mt-0.5">
            <StarRating rating={review.rating} size={11} />
            <span className="text-xs font-bold text-gray-600">{review.rating}.0</span>
          </div>
        </div>
      </div>
      <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">
        "{review.comment}"
      </p>
      <div className="flex items-center gap-2 pt-1.5 border-t border-gray-50">
        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
          {review.user?.username?.[0]?.toUpperCase() || '?'}
        </div>
        <span className="text-xs font-medium text-gray-600 flex-1 truncate">{review.user?.username}</span>
        <span className="text-xs text-gray-400 shrink-0">{timeAgo(review.createdAt)}</span>
      </div>
    </div>
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
  const { data: reviewsData } = useRecentReviews();
  const { data: baroData } = useBarometer();

  const topCompanies  = companies?.slice(0, 6) || [];
  const rankCompanies = companies?.slice(0, 5) || [];
  const visibleCats   = categories?.slice(0, 7) || [];
  const hasMoreCats   = (categories?.length || 0) > 7;
  const reviews       = reviewsData?.slice(0, 4) ?? [];
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
                La plateforme de confiance des Sénégalais
              </div>

              <h1 className="text-4xl md:text-5xl font-black text-gray-900 leading-[1.05] mb-4">
                Trouvez les meilleures entreprises du{' '}
                <span className="text-red-600">Sénégal</span>
              </h1>
              <p className="text-gray-500 text-base md:text-lg mb-7 leading-relaxed max-w-lg">
                Consultez des avis authentiques et partagez votre expérience
                pour aider la communauté à faire les meilleurs choix.
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
                  { Icon: Users,       iconBg: 'bg-purple-50', iconColor: 'text-purple-500', n: '1 000+',                          l1: 'Avis',        l2: 'publiés' },
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

      {/* ── Trust features strip ────────────────────────────────────────── */}
      <section className="bg-white py-6 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {[
              { Icon: Shield,        title: 'Avis authentiques',         desc: 'Des avis vérifiés pour des informations fiables.' },
              { Icon: Award,         title: 'Classements objectifs',     desc: 'Découvrez les entreprises les mieux notées.' },
              { Icon: MessageSquare, title: 'Partagez votre expérience', desc: "Votre avis aide la communauté à faire les bons choix." },
              { Icon: Lock,          title: '100% sécurisé',             desc: 'Vos données sont protégées et confidentielles.' },
            ].map(({ Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
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

      {/* ── 2. Entreprises populaires ─────────────────────────────────────── */}
      <section className="bg-gray-50 py-10 md:py-14">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-6 px-4 md:px-8">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Tendances</p>
              <h2 className="text-xl md:text-2xl font-black text-gray-900">Les entreprises les plus consultées</h2>
            </div>
            <Link to="/classements" className="hidden sm:flex items-center gap-1 text-sm font-semibold text-red-600 hover:underline underline-offset-2 shrink-0">
              Voir tout <ChevronRight size={15} />
            </Link>
          </div>

          {companiesLoading ? (
            <div className="flex gap-4 px-4 md:px-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="shrink-0 w-40 h-28 rounded-2xl bg-gray-200 animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              <div className="md:hidden flex gap-3 overflow-x-auto px-4 pb-3 scrollbar-hide">
                {topCompanies.map(c => <CompanyCard key={c.id} company={c} />)}
              </div>
              <div className="hidden md:grid grid-cols-3 lg:grid-cols-6 gap-4 px-4 md:px-8">
                {topCompanies.map(c => <CompanyCard key={c.id} company={c} />)}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── 3. Catégories ─────────────────────────────────────────────────── */}
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

      {/* ── 4+5. Classement national + Avis récents (côte à côte) ────────── */}
      <section className="bg-gray-50 py-10 md:py-14 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">

          {/* Classement — col 3 */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-5">
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Classement national</p>
                <h2 className="text-xl font-black text-gray-900">🏆 Top entreprises du Sénégal</h2>
              </div>
              <Link to="/classements" className="text-xs font-semibold text-red-600 hover:underline underline-offset-2 flex items-center gap-1 shrink-0">
                Voir le classement complet <ChevronRight size={13} />
              </Link>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
              {companiesLoading ? (
                [...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-4">
                    <div className="w-8 h-8 rounded-xl bg-gray-100 animate-pulse shrink-0" />
                    <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                    </div>
                  </div>
                ))
              ) : rankCompanies.map((co, i) => {
                const avg = parseFloat(co.averageRating || 0);
                const info = ratingLabel(avg);
                return (
                  <Link
                    key={co.id}
                    to={`/companies/${co.slug}`}
                    className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors group"
                  >
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
                      i === 0 ? 'bg-yellow-400 text-yellow-900' :
                      i === 1 ? 'bg-gray-300 text-gray-700' :
                      i === 2 ? 'bg-amber-600/80 text-white' :
                                'bg-gray-100 text-gray-400'
                    }`}>
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </div>

                    {co.imageUrl ? (
                      <img src={co.imageUrl} alt={co.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                    ) : (() => {
                      const brand = BRAND_COLORS[co.slug];
                      return (
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold ${brand ? `${brand.bg} ${brand.text}` : 'bg-red-50 text-red-400'}`}>
                          {co.name?.[0]}
                        </div>
                      );
                    })()}

                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm truncate group-hover:text-red-600 transition-colors">
                        {co.name}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <StarRating rating={avg} size={11} />
                        <span className="text-xs font-bold text-gray-700">{avg.toFixed(1)}</span>
                        {info && <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${info.c}`}>{info.t}</span>}
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-xs text-gray-400">{co.reviewCount} avis</p>
                      <ChevronRight size={13} className="text-gray-300 group-hover:text-red-400 mt-1 ml-auto" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Avis récents — col 2 */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <span className="text-xs text-gray-400 font-medium">En direct</span>
                </div>
                <h2 className="text-xl font-black text-gray-900">Derniers avis publiés</h2>
              </div>
            </div>

            <div className="space-y-3">
              {reviews.length > 0 ? (
                reviews.map(r => <ReviewCard key={r.id} review={r} />)
              ) : (
                <div className="text-center py-10 text-gray-400">
                  <MessageSquare size={28} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm font-medium text-gray-500">Aucun avis récent</p>
                  <p className="text-xs mt-1">Soyez le premier à noter une entreprise !</p>
                </div>
              )}
            </div>
          </div>

        </div>
      </section>

      {/* ── 6. Pour les entreprises ──────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 py-14 md:py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

            <div>
              <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-3 py-1.5 text-xs font-semibold text-white/80 mb-5">
                <Building2 size={12} /> Vous êtes une entreprise ?
              </div>
              <h2 className="text-3xl md:text-4xl font-black text-white mb-4 leading-tight">
                Réclamez votre fiche<br />
                <span className="text-red-400">Echowork</span>
              </h2>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">
                Répondez aux avis, gagnez en visibilité et renforcez
                la confiance de vos clients sur la plateforme.
              </p>
              <ul className="space-y-2.5 mb-8">
                {[
                  'Gérez vos avis et répondez aux clients',
                  'Analysez votre e-réputation en temps réel',
                  'Attirez plus de clients avec une fiche complète',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-white/80 text-sm">
                    <span className="w-5 h-5 rounded-full bg-red-500/20 flex items-center justify-center shrink-0">
                      <Shield size={10} className="text-red-400" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex items-center gap-4">
                <Link
                  to="/espace-entreprise"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full font-semibold text-sm hover:bg-red-700 transition-colors shadow-lg"
                >
                  En savoir plus <ArrowRight size={14} />
                </Link>
                <span className="text-white/40 text-xs">Inscriptions bientôt disponibles</span>
              </div>
            </div>

            {/* Mini dashboard mockup */}
            <div className="hidden lg:flex justify-center">
              <div className="bg-white/10 backdrop-blur border border-white/20 rounded-2xl p-5 w-72 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-orange-500 flex items-center justify-center text-white font-black text-base shrink-0">O</div>
                  <div>
                    <p className="text-white font-semibold text-sm">Orange Sénégal</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                      <StarRating rating={4.5} size={11} />
                      <span className="text-white/70 text-xs">4.5</span>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[['4.5', 'Note'], ['234', 'Avis'], ['12.5k', 'Vues']].map(([v, l]) => (
                    <div key={l} className="bg-white/10 rounded-xl p-2.5 text-center">
                      <p className="text-white font-bold text-sm">{v}</p>
                      <p className="text-white/50 text-[10px] mt-0.5">{l}</p>
                    </div>
                  ))}
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-white/40 text-[10px] mb-2">Évolution des avis</p>
                  <div className="flex items-end gap-1 h-10">
                    {[3, 4, 5, 4, 6, 5, 7, 6, 8, 7, 9, 8].map((h, i) => (
                      <div key={i} className="flex-1 bg-red-400/50 rounded-sm" style={{ height: `${h * 10}%` }} />
                    ))}
                  </div>
                </div>
                <div className="bg-white/5 rounded-xl p-3">
                  <p className="text-white/40 text-[10px] mb-2">Répartition des notes</p>
                  {[['5★', 60], ['4★', 25], ['3★', 10], ['2★', 4], ['1★', 1]].map(([label, pct]) => (
                    <div key={label} className="flex items-center gap-2 mb-1">
                      <span className="text-white/50 text-[10px] w-5 shrink-0">{label}</span>
                      <div className="flex-1 bg-white/10 rounded-full h-1.5">
                        <div className="bg-red-400 h-1.5 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 7. Baromètre Echowork ────────────────────────────────────────── */}
      <section className="bg-gray-50 py-10 md:py-14 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Données nationales</p>
            <h2 className="text-xl md:text-2xl font-black text-gray-900">Le baromètre Echowork</h2>
            <p className="text-gray-500 text-sm mt-1">La satisfaction des Sénégalais en temps réel dans les principaux secteurs</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {barometer.map((b) => {
              const conf = baroIcons[b.slug] || { Icon: Briefcase, bg: 'bg-gray-50', color: 'text-gray-600', border: 'border-gray-100' };
              const Icon = conf.Icon;
              const trendPos = b.trend > 0;
              const trendNeutral = !b.trend || b.trend === 0;
              return (
                <Link
                  key={b.slug}
                  to={`/categories/${b.slug}`}
                  className={`group bg-white rounded-2xl border ${conf.border} shadow-sm hover:shadow-md p-5 transition-all duration-200 hover:-translate-y-0.5`}
                >
                  <div className={`w-10 h-10 rounded-xl ${conf.bg} flex items-center justify-center mb-4`}>
                    <Icon size={18} className={conf.color} />
                  </div>
                  <p className="text-xs text-gray-400 font-medium mb-0.5">Satisfaction</p>
                  <p className="text-sm font-semibold text-gray-700 mb-3">{b.label}</p>
                  <p className="text-3xl font-black text-gray-900 mb-1">
                    {b.avg !== null ? b.avg : '—'}
                    <span className="text-base font-semibold text-gray-400">/5</span>
                  </p>
                  {b.trend !== null && (
                    <div className={`flex items-center gap-1 text-xs font-semibold mb-2 ${
                      trendNeutral ? 'text-gray-400' : trendPos ? 'text-green-600' : 'text-red-500'
                    }`}>
                      {!trendNeutral && (trendPos ? <TrendingUp size={11} /> : <TrendingDown size={11} />)}
                      {!trendNeutral && `${trendPos ? '+' : ''}${b.trend} ce mois`}
                      {trendNeutral && 'Stable ce mois'}
                    </div>
                  )}
                  <p className="text-[10px] text-gray-400 group-hover:text-red-500 transition-colors">
                    Voir le détail →
                  </p>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── 8. Application mobile ─────────────────────────────────────────── */}
      <section className="bg-white py-10 md:py-14 px-4 md:px-8 border-t border-gray-100">
        <div className="max-w-7xl mx-auto">
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-3xl border border-red-100 px-8 py-10 flex flex-col md:flex-row items-center gap-8">
            <div className="w-16 h-16 md:w-20 md:h-20 rounded-3xl bg-white shadow-md flex items-center justify-center shrink-0">
              <Smartphone size={32} className="text-red-500" />
            </div>
            <div className="flex-1 text-center md:text-left">
              <h2 className="text-xl md:text-2xl font-black text-gray-900 mb-2">
                Echowork partout avec vous !
              </h2>
              <p className="text-gray-500 text-sm mb-6">
                Bientôt disponible sur mobile pour consulter et partager des avis où que vous soyez.
              </p>
              <div className="flex items-center gap-3 justify-center md:justify-start">
                <span className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-semibold opacity-75 cursor-not-allowed">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.7 9.05 7.4c1.4-.07 2.38.72 3.2.73.96-.12 1.87-.93 3.22-.82 2.44.2 3.68 2.03 3.68 2.03-3.25 1.96-2.72 6.42 1.07 7.67-.73 1.9-1.71 3.63-3.17 4.27zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" /></svg>
                  Télécharger sur l'App Store
                </span>
                <span className="flex items-center gap-2 px-4 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-semibold opacity-75 cursor-not-allowed">
                  <svg viewBox="0 0 24 24" className="w-4 h-4 fill-current"><path d="M3.18 23.76c.34.19.72.24 1.1.14l12.44-7.18-2.58-2.58L3.18 23.76zm16.46-10.03L16.9 12l2.74-1.73-12.46-7.21C6.8 2.97 6.4 2.93 6.06 3.1L17.05 14.1l2.59-0.37zM2.38 4.04A2 2 0 0 0 2 5v14a2 2 0 0 0 .37.96l.07.07L14.32 12l-11.87-7.96-.07-.07zM19.64 10.27L17 8.8 14.32 12 17 15.2l2.64-1.47c.76-.42.76-1.62 0-2.05l-.01.59z" /></svg>
                  Télécharger sur Google Play
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Campus Challenge Banner ───────────────────── */}
      <section className="bg-gray-950 py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <Link
            to="/campus"
            className="group flex flex-col md:flex-row items-center gap-8 rounded-3xl overflow-hidden bg-gradient-to-br from-gray-900 to-gray-800 border border-white/10 hover:border-red-500/40 transition-all duration-300 hover:shadow-2xl hover:shadow-red-900/20 p-6 md:p-8"
          >
            {/* Poster */}
            <div className="shrink-0 w-48 md:w-56">
              <img
                src={campusPoster}
                alt="EchoWork Campus Challenge 2026"
                className="w-full rounded-2xl shadow-xl group-hover:scale-105 transition-transform duration-300"
              />
            </div>

            {/* Text */}
            <div className="flex-1 text-center md:text-left">
              <span className="inline-flex items-center gap-1.5 bg-red-600/20 border border-red-500/30 text-red-400 text-xs font-bold px-3 py-1 rounded-full mb-4">
                <GraduationCap size={11} /> Du 15 Juin au 15 Juillet 2026
              </span>
              <h2 className="text-2xl md:text-3xl font-black text-white leading-tight mb-2">
                EchoWork <span className="text-red-500">Campus Challenge</span> 2026
              </h2>
              <p className="text-gray-400 text-sm md:text-base mb-5 max-w-lg">
                Le 1er classement participatif des écoles et universités du Sénégal par les étudiants.
                Ton avis compte, ton école progresse !
              </p>
              <div className="inline-flex items-center gap-2 bg-red-600 group-hover:bg-red-700 text-white font-bold px-6 py-2.5 rounded-full text-sm transition-colors">
                <Star size={14} /> Participer maintenant
                <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
              <p className="mt-3 text-xs text-gray-600">
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
