import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase, MapPin, Search, X, Building2,
  ChevronRight, Loader2, AlertCircle, Banknote,
} from 'lucide-react';
import Navbar from '../components/navbar';
import Foot from '../components/Foot';
import { jobsService } from '../services/jobsService';
import { useCategories } from '../hooks/useCategory';

export default function CarrieresPage() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const { categories } = useCategories();

  useEffect(() => {
    setLoading(true);
    jobsService.getAll()
      .then(setJobs)
      .catch(() => setError('Impossible de charger les offres.'))
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    let list = jobs;
    if (search) {
      const q = search.toLowerCase();
      list = list.filter(
        (j) =>
          j.title.toLowerCase().includes(q) ||
          j.company?.name.toLowerCase().includes(q) ||
          j.location?.toLowerCase().includes(q),
      );
    }
    if (categoryId) {
      list = list.filter((j) => String(j.company?.category?.id) === categoryId);
    }
    return list;
  }, [jobs, search, categoryId]);

  return (
    <>
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-10 md:py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white/80 mb-4">
            <Briefcase size={13} />
            Carrières by EchoWork
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3 leading-tight">
            Offres d'emploi au Sénégal
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto">
            Découvrez les opportunités publiées par les entreprises référencées sur EchoWork.
          </p>

          {/* Search */}
          <div className="mt-8 flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto">
            <div className="relative flex-1">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Poste, entreprise, ville…"
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
        <div className="max-w-4xl mx-auto px-4 py-8">

          {/* Count */}
          {!loading && !error && (
            <p className="text-sm text-gray-400 mb-5">
              {filtered.length} offre{filtered.length !== 1 ? 's' : ''}
              {(search || categoryId) ? ' correspondant à votre recherche' : ' disponibles'}
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
              <Briefcase size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">Aucune offre trouvée</p>
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
            <div className="space-y-3">
              {filtered.map((job) => (
                <Link
                  key={job.id}
                  to={`/companies/${job.company?.slug}`}
                  className="flex items-start gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-5 hover:shadow-md hover:border-red-200 transition-all group"
                >
                  {/* Company logo */}
                  {job.company?.imageUrl ? (
                    <img
                      src={job.company.imageUrl}
                      alt={job.company.name}
                      className="w-12 h-12 rounded-xl object-cover bg-gray-100 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0">
                      <Building2 size={20} className="text-red-400" />
                    </div>
                  )}

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h2 className="font-bold text-gray-900 text-sm md:text-base group-hover:text-red-600 transition-colors leading-snug">
                      {job.title}
                    </h2>
                    <p className="text-sm text-red-600 font-medium mt-0.5">{job.company?.name}</p>
                    <p className="text-sm text-gray-500 mt-1.5 line-clamp-2 leading-relaxed">{job.description}</p>
                    <div className="flex flex-wrap items-center gap-3 mt-2.5">
                      {job.location && (
                        <span className="flex items-center gap-1 text-xs text-gray-400">
                          <MapPin size={11} /> {job.location}
                        </span>
                      )}
                      {job.salary && (
                        <span className="flex items-center gap-1 text-xs font-semibold text-green-600">
                          <Banknote size={11} /> {job.salary}
                        </span>
                      )}
                      {job.company?.category && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
                          {job.company.category.name}
                        </span>
                      )}
                      <span className="text-xs text-gray-300 ml-auto">
                        {new Date(job.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>
                  </div>

                  <ChevronRight size={16} className="text-gray-300 group-hover:text-red-400 transition-colors shrink-0 mt-1" />
                </Link>
              ))}
            </div>
          )}

          {/* CTA entreprise */}
          <div className="mt-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-center text-white">
            <Briefcase size={28} className="mx-auto mb-3 text-white/60" />
            <h3 className="font-bold text-lg mb-1">Vous recrutez ?</h3>
            <p className="text-white/60 text-sm mb-4">Publiez vos offres d'emploi gratuitement sur EchoWork.</p>
            <Link
              to="/espace-entreprise"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-2.5 rounded-full text-sm transition-colors"
            >
              Inscrire mon entreprise <ChevronRight size={15} />
            </Link>
          </div>
        </div>
      </div>

      <Foot />
    </>
  );
}
