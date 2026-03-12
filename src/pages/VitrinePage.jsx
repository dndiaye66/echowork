import { Link } from 'react-router-dom';
import {
  Star, ArrowRight, ChevronRight, TrendingDown, Award,
  Search, Shield, Users, MessageSquare, Building2,
  Utensils, Landmark, ShoppingCart, Hospital, Briefcase,
  Factory, Phone, Zap, Truck, Wheat, GraduationCap,
  Briefcase as JobIcon, Rocket, Globe, TrendingUp,
  MapPin, Banknote, Clock, Home, UtensilsCrossed, Monitor, Package,
} from 'lucide-react';
import Navbar from '../components/navbar';
import Foot from '../components/Foot';
import SearchAutocomplete from '../components/SearchAutocomplete';
import { useBestCompanies, useWorstCompanies, useStats, useJobOffers } from '../hooks/useHomeData';
import { useCategories } from '../hooks/useCategory';
import backgroundImage from '../assets/image/imgbackground.jpg';

const categoryIconMap = {
  'agriculture': { Icon: Wheat, bg: 'bg-green-100', color: 'text-green-700' },
  'agriculture-et-alimentation': { Icon: Wheat, bg: 'bg-green-100', color: 'text-green-700' },
  'alimentation-et-boissons': { Icon: Utensils, bg: 'bg-orange-100', color: 'text-orange-700' },
  'automobile': { Icon: Truck, bg: 'bg-blue-100', color: 'text-blue-700' },
  'commerce-et-distribution': { Icon: ShoppingCart, bg: 'bg-purple-100', color: 'text-purple-700' },
  'construction-et-btp': { Icon: Building2, bg: 'bg-yellow-100', color: 'text-yellow-800' },
  'industrie': { Icon: Factory, bg: 'bg-gray-100', color: 'text-gray-700' },
  'sante-et-pharmacie': { Icon: Hospital, bg: 'bg-red-100', color: 'text-red-700' },
  'services': { Icon: Briefcase, bg: 'bg-indigo-100', color: 'text-indigo-700' },
  'telecommunications': { Icon: Phone, bg: 'bg-cyan-100', color: 'text-cyan-700' },
  'energie-et-petrole': { Icon: Zap, bg: 'bg-amber-100', color: 'text-amber-700' },
  'banques-et-institutions-financieres': { Icon: Landmark, bg: 'bg-emerald-100', color: 'text-emerald-700' },
  'etablissements-d-enseignement-superieur': { Icon: GraduationCap, bg: 'bg-violet-100', color: 'text-violet-700' },
  'ecole-et-enseignement-superieure': { Icon: GraduationCap, bg: 'bg-violet-100', color: 'text-violet-700' },
  'transport-et-logistique': { Icon: Truck, bg: 'bg-sky-100', color: 'text-sky-700' },
  'immobilier': { Icon: Home, bg: 'bg-rose-100', color: 'text-rose-700' },
  'restauration-et-hotellerie': { Icon: UtensilsCrossed, bg: 'bg-orange-100', color: 'text-orange-700' },
  'informatique-et-numerique': { Icon: Monitor, bg: 'bg-blue-100', color: 'text-blue-700' },
};

/* ── Rating utilities ── */
function roundToHalf(val) {
  return Math.round(val * 2) / 2;
}

function getRatingInfo(avg) {
  if (!avg || avg === 0) return null;
  if (avg < 1.5)  return { label: 'Mauvais',    color: 'bg-red-100 text-red-700' };
  if (avg < 2.5)  return { label: 'Médiocre',   color: 'bg-orange-100 text-orange-700' };
  if (avg < 3.5)  return { label: 'Moyen',      color: 'bg-yellow-100 text-yellow-700' };
  if (avg < 4.5)  return { label: 'Bon',        color: 'bg-green-100 text-green-700' };
  return           { label: 'Excellent',  color: 'bg-emerald-100 text-emerald-700' };
}

function StarRating({ rating, size = 14 }) {
  const rounded = roundToHalf(rating);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => {
        const full = i <= Math.floor(rounded);
        const half = !full && i - 0.5 === rounded;
        return (
          <span key={i} className="relative inline-block" style={{ width: size, height: size }}>
            {/* Empty star base */}
            <Star size={size} className="fill-gray-200 text-gray-200 absolute inset-0" />
            {/* Full star */}
            {full && <Star size={size} className="fill-red-500 text-red-500 absolute inset-0" />}
            {/* Half star */}
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

function CompanyRankCard({ company, rank }) {
  const avg = company.averageRating || company.scores?.globalScore || 0;
  const info = getRatingInfo(avg);
  return (
    <Link
      to={`/companies/${company.slug}`}
      className="flex items-center gap-3 p-4 hover:bg-gray-50 transition-colors group"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center text-sm font-black shrink-0 ${
        rank === 1 ? 'bg-yellow-400 text-yellow-900' :
        rank === 2 ? 'bg-gray-300 text-gray-700' :
        rank === 3 ? 'bg-amber-600/80 text-white' :
        'bg-gray-100 text-gray-400'
      }`}>
        {rank}
      </div>

      {company.imageUrl ? (
        <img src={company.imageUrl} alt={company.name} className="w-10 h-10 rounded-xl object-cover bg-gray-100 shrink-0" />
      ) : (
        <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
          <Building2 size={16} className="text-red-400" />
        </div>
      )}

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-gray-900 truncate text-sm group-hover:text-red-600 transition-colors">
          {company.name}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <StarRating rating={avg} size={12} />
          {avg > 0 ? (
            <>
              <span className="text-xs font-bold text-gray-700">{Number(avg).toFixed(1)}</span>
              {info && (
                <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full ${info.color}`}>
                  {info.label}
                </span>
              )}
            </>
          ) : (
            <span className="text-xs text-gray-400 italic">Pas encore noté</span>
          )}
        </div>
        {company.reviewCount > 0 && (
          <p className="text-xs text-gray-400 mt-0.5">{company.reviewCount} avis</p>
        )}
      </div>

      <ChevronRight size={15} className="text-gray-300 group-hover:text-red-400 transition-colors shrink-0" />
    </Link>
  );
}

/* ── Job offer card ── */
function JobCard({ job }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-red-200 transition-all duration-200 group">
      <div className="flex items-start gap-4">
        {job.company?.imageUrl ? (
          <img src={job.company.imageUrl} alt={job.company.name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
            <Building2 size={20} className="text-red-400" />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base group-hover:text-red-600 transition-colors truncate">
            {job.title}
          </h3>
          <p className="text-sm text-gray-500 mt-0.5">{job.company?.name || 'Entreprise'}</p>

          <div className="flex flex-wrap items-center gap-3 mt-3">
            {job.location && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <MapPin size={11} /> {job.location}
              </span>
            )}
            {job.salary && (
              <span className="flex items-center gap-1 text-xs text-gray-400">
                <Banknote size={11} /> {job.salary}
              </span>
            )}
          </div>

          {job.description && (
            <p className="text-sm text-gray-400 mt-2 line-clamp-2 leading-relaxed">{job.description}</p>
          )}
        </div>

        <div className="shrink-0">
          <span className="inline-block text-xs bg-green-100 text-green-700 font-semibold px-2.5 py-1 rounded-full">
            CDI
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Placeholder job card shown when no jobs from API ── */
function JobPlaceholder({ title, company, location, type, salary }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
          <Building2 size={20} className="text-gray-300" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-gray-900 text-base">{title}</h3>
          <p className="text-sm text-gray-400 mt-0.5">{company}</p>
          <div className="flex flex-wrap items-center gap-3 mt-2">
            <span className="flex items-center gap-1 text-xs text-gray-300"><MapPin size={11} />{location}</span>
            {salary && <span className="flex items-center gap-1 text-xs text-gray-300"><Banknote size={11} />{salary}</span>}
          </div>
        </div>
        <span className="inline-block text-xs bg-blue-100 text-blue-700 font-semibold px-2.5 py-1 rounded-full shrink-0">{type}</span>
      </div>
    </div>
  );
}

const STATIC_JOBS = [
  { title: 'Responsable Marketing Digital', company: 'TechSénégal', location: 'Dakar', type: 'CDI', salary: '350k–500k FCFA' },
  { title: 'Développeur Full Stack', company: 'InnovateSN', location: 'Dakar (Hybride)', type: 'CDI', salary: '400k–700k FCFA' },
  { title: 'Commercial Terrain', company: 'DistribPlus', location: 'Thiès', type: 'CDD', salary: 'À définir' },
];

export default function VitrinePage() {
  const { data: companies, loading, error } = useBestCompanies();
  const { data: worstCompanies, loading: worstLoading } = useWorstCompanies();
  const { categories, loading: catLoading } = useCategories();
  const { data: stats } = useStats();
  const { data: jobsData } = useJobOffers();
  const jobs = jobsData || [];
  const hasJobs = jobs.length > 0;

  function formatCount(n) {
    if (!n) return '—';
    if (n >= 1000) return `${Math.floor(n / 100) * 100}+`;
    if (n >= 100)  return `${Math.floor(n / 10) * 10}+`;
    return `${n}`;
  }

  return (
    <>
      <Navbar />

      {/* ─── Hero ─────────────────────────────────────────────────────────────── */}
      <section
        className="relative min-h-[55vh] md:min-h-[75vh] flex items-center justify-center text-white"
        style={{ backgroundImage: `url(${backgroundImage})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/55 to-black/70" />

        <div className="relative z-10 w-full max-w-3xl mx-auto px-4 py-10 md:py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-3 py-1 text-xs md:text-sm mb-4 md:mb-7">
            <span className="w-1.5 h-1.5 md:w-2 md:h-2 bg-green-400 rounded-full animate-pulse" />
            La plateforme de confiance au Sénégal
          </div>

          <h1 className="text-3xl md:text-5xl font-black leading-tight mb-3 md:mb-4">
            ⭐ Notez les entreprises et{' '}
            <span className="text-red-400">partagez vos expériences</span>{' '}
            avec la communauté
          </h1>
          <p className="hidden md:block text-lg md:text-xl text-white/75 mb-10 max-w-xl mx-auto leading-relaxed">
            Exprimez-vous en toute transparence et responsabilité pour aider les autres à faire les bons choix.
          </p>
          <p className="md:hidden text-sm text-white/70 mb-6 max-w-xs mx-auto leading-relaxed">
            Exprimez-vous et aidez la communauté à faire les bons choix
          </p>

          <div className="max-w-lg mx-auto">
            <SearchAutocomplete placeholder="Rechercher une entreprise..." />
          </div>

          <div className="flex items-center justify-center gap-6 md:gap-10 mt-8 md:mt-12">
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-black">{formatCount(stats?.companyCount)}</p>
              <p className="text-[10px] md:text-xs text-white/55 uppercase tracking-widest mt-1">Entreprises</p>
            </div>
            <div className="w-px h-8 md:h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-black">{formatCount(stats?.categoryCount)}</p>
              <p className="text-[10px] md:text-xs text-white/55 uppercase tracking-widest mt-1">Catégories</p>
            </div>
            <div className="w-px h-8 md:h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-2xl md:text-3xl font-black">{stats?.reviewCount > 0 ? formatCount(stats.reviewCount) : '0'}</p>
              <p className="text-[10px] md:text-xs text-white/55 uppercase tracking-widest mt-1">Avis publiés</p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Categories ───────────────────────────────────────────────────────── */}
      <section className="bg-gray-50 py-10 md:py-16">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-6 md:mb-10 px-4">
            <h2 className="text-2xl md:text-3xl font-black text-gray-900">Explorez par secteur</h2>
            <p className="text-gray-500 mt-1.5 text-sm hidden md:block">Trouvez les meilleures entreprises dans chaque domaine d'activité</p>
          </div>

          {catLoading ? (
            <div className="flex md:grid gap-3 md:gap-4 md:grid-cols-4 overflow-x-auto px-4 pb-2 md:pb-0 scrollbar-hide">
              {[...Array(8)].map((_, i) => <div key={i} className="h-24 w-28 md:w-auto md:h-28 rounded-2xl bg-gray-200 animate-pulse shrink-0" />)}
            </div>
          ) : (
            <>
              {/* Mobile: horizontal scroll */}
              <div className="md:hidden flex gap-3 overflow-x-auto px-4 pb-3 scrollbar-hide">
                {categories?.map((cat) => {
                  const conf = categoryIconMap[cat.slug] || { Icon: Briefcase, bg: 'bg-gray-100', color: 'text-gray-700' };
                  return (
                    <Link
                      key={cat.slug}
                      to={`/categories/${cat.slug}`}
                      className="group flex flex-col items-center gap-2 p-3 rounded-2xl bg-white border border-gray-100 shadow-sm active:scale-95 transition-transform shrink-0 w-24"
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${conf.bg}`}>
                        <conf.Icon size={18} className={conf.color} />
                      </div>
                      <span className="text-[10px] font-semibold text-gray-700 text-center leading-tight">
                        {cat.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
              {/* Desktop: grid */}
              <div className="hidden md:grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 px-4">
                {categories?.map((cat) => {
                  const conf = categoryIconMap[cat.slug] || { Icon: Briefcase, bg: 'bg-gray-100', color: 'text-gray-700' };
                  return (
                    <Link
                      key={cat.slug}
                      to={`/categories/${cat.slug}`}
                      className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-white border border-gray-100 shadow-sm hover:shadow-md hover:border-red-200 hover:-translate-y-0.5 transition-all duration-200"
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${conf.bg}`}>
                        <conf.Icon size={22} className={conf.color} />
                      </div>
                      <span className="text-xs font-semibold text-gray-700 text-center leading-tight group-hover:text-red-600 transition-colors">
                        {cat.name}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </section>

      {/* ─── How it works ─────────────────────────────────────────────────────── */}
      <section className="py-10 md:py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Comment ça marche ?</h2>
          <p className="text-gray-400 mb-8 md:mb-12 text-sm">Simple, rapide et efficace</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              { step: '01', title: 'Recherchez', desc: 'Trouvez une entreprise ou un service par catégorie ou par nom grâce à notre recherche intelligente.', Icon: Search, bg: 'bg-blue-100', color: 'text-blue-600' },
              { step: '02', title: 'Lisez les avis', desc: "Consultez les expériences authentiques de la communauté pour prendre les meilleures décisions.", Icon: MessageSquare, bg: 'bg-green-100', color: 'text-green-600' },
              { step: '03', title: 'Partagez', desc: "Publiez votre avis et contribuez à rendre les entreprises sénégalaises plus transparentes.", Icon: Users, bg: 'bg-red-100', color: 'text-red-600' },
            ].map(({ step, title, desc, Icon, bg, color }) => (
              <div key={step} className="flex flex-col items-center text-center">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${bg}`}>
                  <Icon size={24} className={color} />
                </div>
                <span className="text-xs font-bold text-gray-300 tracking-widest mb-1">ÉTAPE {step}</span>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <Link to="/signup" className="inline-flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-full font-semibold text-sm hover:bg-red-700 transition-colors shadow-sm">
              Commencer maintenant <ArrowRight size={15} />
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Rankings ─────────────────────────────────────────────────────────── */}
      <section className="bg-white py-10 md:py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">

            {/* Top 10 */}
            <div className="lg:col-span-3">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-yellow-100 flex items-center justify-center">
                  <Award size={20} className="text-yellow-600" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Classement national</p>
                  <h2 className="text-xl font-black text-gray-900">🏆 Les entreprises les plus appréciées</h2>
                  <p className="text-xs text-gray-400 mt-0.5">Les entreprises qui offrent les meilleures expériences selon les utilisateurs.</p>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                {loading ? (
                  [...Array(6)].map((_, i) => (
                    <div key={i} className="flex items-center gap-4 p-4">
                      <div className="w-9 h-9 rounded-xl bg-gray-100 animate-pulse" />
                      <div className="w-10 h-10 rounded-xl bg-gray-100 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-gray-100 rounded animate-pulse w-3/4" />
                        <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2" />
                      </div>
                    </div>
                  ))
                ) : error ? (
                  <p className="p-10 text-center text-gray-400 text-sm">Impossible de charger les entreprises</p>
                ) : companies?.length === 0 ? (
                  <p className="p-10 text-center text-gray-400 text-sm">Aucune entreprise pour l'instant</p>
                ) : (
                  companies?.slice(0, 10).map((company, i) => (
                    <CompanyRankCard key={company.id || company.slug} company={company} rank={i + 1} />
                  ))
                )}
              </div>
            </div>

            {/* Right panel */}
            <div className="lg:col-span-2 space-y-6">
              {/* Worst companies */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center">
                    <TrendingDown size={20} className="text-red-600" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Axes d'amélioration</p>
                    <h2 className="text-lg font-black text-gray-900">📊 Expériences à améliorer</h2>
                    <p className="text-xs text-gray-400 mt-0.5">Les entreprises pour lesquelles les utilisateurs ont signalé des axes d'amélioration.</p>
                  </div>
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-50">
                  {worstLoading ? (
                    [...Array(4)].map((_, i) => <div key={i} className="flex items-center gap-3 p-3"><div className="flex-1 h-4 bg-gray-100 rounded animate-pulse" /></div>)
                  ) : worstCompanies?.length === 0 ? (
                    <p className="p-6 text-center text-gray-400 text-sm">Aucune donnée disponible</p>
                  ) : (
                    worstCompanies?.slice(0, 5).map((company) => (
                      <Link
                        key={company.id || company.slug}
                        to={`/companies/${company.slug}`}
                        className="flex items-center gap-3 p-3.5 hover:bg-gray-50 transition-colors group"
                      >
                        <div className="w-7 h-7 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                          <Building2 size={13} className="text-red-400" />
                        </div>
                        <span className="text-sm font-medium text-gray-700 truncate flex-1 group-hover:text-red-600 transition-colors">
                          {company.name}
                        </span>
                        <StarRating rating={company.averageRating || 0} size={11} />
                      </Link>
                    ))
                  )}
                </div>
              </div>

              {/* CTA for businesses */}
              <div className="bg-gradient-to-br from-red-600 to-red-700 rounded-2xl p-6 text-white">
                <Shield size={26} className="mb-3 text-white/80" />
                <h3 className="text-lg font-black mb-2">Vous êtes une entreprise ?</h3>
                <p className="text-sm text-white/75 mb-5 leading-relaxed">
                  Rejoignez EchoWork pour renforcer votre visibilité, répondre aux avis
                  et gagner la confiance de vos clients.
                </p>
                <Link
                  to="/signup"
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-red-600 rounded-xl text-sm font-bold hover:bg-red-50 transition-colors"
                >
                  Commencer gratuitement <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Offres d'emploi ──────────────────────────────────────────────────── */}
      <section className="py-14 px-4 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <JobIcon size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Carrières & Opportunités</p>
                <h2 className="text-xl font-black text-gray-900">Offres d'emploi</h2>
              </div>
            </div>
            <Link to="/signup" className="text-sm text-red-600 font-semibold hover:underline underline-offset-2 hidden sm:block">
              Publier une offre →
            </Link>
          </div>

          <div className="space-y-4">
            {hasJobs
              ? jobs.slice(0, 5).map((job) => <JobCard key={job.id} job={job} />)
              : STATIC_JOBS.map((j) => <JobPlaceholder key={j.title} {...j} />)
            }
          </div>

          {!hasJobs && (
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-300 mb-3">Vous recrutez ? Publiez votre offre gratuitement.</p>
              <Link to="/signup" className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 text-white rounded-full text-sm font-semibold hover:bg-blue-700 transition-colors">
                Déposer une offre <ArrowRight size={14} />
              </Link>
            </div>
          )}
        </div>
      </section>

      {/* ─── Écosystème entrepreneurial ───────────────────────────────────────── */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-red-50 text-red-600 border border-red-100 rounded-full px-4 py-1.5 text-xs font-semibold mb-4">
              <Rocket size={13} /> Écosystème sénégalais
            </div>
            <h2 className="text-3xl font-black text-gray-900">L'entrepreneuriat au Sénégal</h2>
            <p className="text-gray-500 mt-2 text-sm max-w-xl mx-auto">
              Rejoignez un écosystème dynamique en pleine croissance. EchoWork vous connecte
              aux meilleures ressources pour développer votre activité.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              {
                Icon: Globe,
                bg: 'bg-emerald-100',
                color: 'text-emerald-700',
                title: 'Marché en expansion',
                desc: "Le Sénégal affiche une croissance régulière depuis plus de 10 ans, portée par les secteurs du numérique, de l'énergie et des services.",
                stat: '+6% PIB/an',
                statColor: 'text-emerald-600',
              },
              {
                Icon: TrendingUp,
                bg: 'bg-blue-100',
                color: 'text-blue-700',
                title: 'Startups & Innovation',
                desc: "Dakar s'impose comme hub tech de l'Afrique de l'Ouest. Des centaines de startups se lancent chaque année dans la fintech, l'agritech et l'e-commerce.",
                stat: '500+ startups',
                statColor: 'text-blue-600',
              },
              {
                Icon: Users,
                bg: 'bg-violet-100',
                color: 'text-violet-700',
                title: 'Communauté active',
                desc: "EchoWork connecte consommateurs et entreprises. Rejoignez une communauté de milliers d'utilisateurs qui façonnent la transparence économique.",
                stat: '10k+ utilisateurs',
                statColor: 'text-violet-600',
              },
            ].map(({ Icon, bg, color, title, desc, stat, statColor }) => (
              <div key={title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${bg}`}>
                  <Icon size={22} className={color} />
                </div>
                <p className={`text-2xl font-black mb-1 ${statColor}`}>{stat}</p>
                <h3 className="text-base font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>

          {/* CTA band */}
          <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
            <div>
              <h3 className="text-2xl font-black mb-1">Prêt à rejoindre EchoWork ?</h3>
              <p className="text-white/60 text-sm">
                Inscription gratuite — pour les particuliers comme pour les entreprises.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Link
                to="/signup"
                className="px-6 py-3 bg-red-600 text-white rounded-full font-bold text-sm hover:bg-red-700 transition-colors shadow-lg"
              >
                S'inscrire gratuitement
              </Link>
              <Link
                to="/login"
                className="px-6 py-3 border border-white/30 text-white rounded-full font-semibold text-sm hover:bg-white/10 transition-colors"
              >
                Se connecter
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Trust banner ─────────────────────────────────────────────────────── */}
      <section className="py-10 px-4 bg-gray-50 border-t border-gray-100">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { value: '100%', label: 'Avis vérifiés par la communauté', Icon: Shield, color: 'text-green-500' },
              { value: 'Gratuit', label: 'Publication et lecture des avis', Icon: Star, color: 'text-yellow-500' },
              { value: 'Sénégal', label: "Plateforme dédiée à l'Afrique de l'Ouest", Icon: Building2, color: 'text-red-500' },
            ].map(({ value, label, Icon, color }) => (
              <div key={value} className="flex flex-col items-center gap-2">
                <Icon size={28} className={`${color} mb-1`} />
                <p className="text-2xl font-black text-gray-900">{value}</p>
                <p className="text-sm text-gray-500">{label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Foot />
      {/* Espace pour la barre de navigation mobile */}
      <div className="md:hidden h-16" />
    </>
  );
}
