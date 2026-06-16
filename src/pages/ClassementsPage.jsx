import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Trophy, Star, TrendingUp, TrendingDown, Minus,
  Building2, MapPin, Loader2, ChevronRight,
} from 'lucide-react';
import Navbar from '../components/navbar';
import Foot from '../components/Foot';
import { rankingsService } from '../services/rankingsService';

const CITIES = ['Dakar', 'Thiès', 'Saint-Louis', 'Kaolack', 'Ziguinchor', 'Touba', 'Mbour'];

const MEDAL = ['🥇', '🥈', '🥉'];

function TrendBadge({ trend }) {
  if (trend === 'up') return (
    <span className="flex items-center gap-0.5 text-green-600 text-xs font-medium">
      <TrendingUp size={12} /> En hausse
    </span>
  );
  if (trend === 'down') return (
    <span className="flex items-center gap-0.5 text-red-500 text-xs font-medium">
      <TrendingDown size={12} /> En baisse
    </span>
  );
  return <span className="flex items-center gap-0.5 text-gray-400 text-xs"><Minus size={12} /> Stable</span>;
}

function RankCard({ company }) {
  const { rank, name, slug, imageUrl, category, averageRating, reviewCount, isVerified, trend } = company;
  const hasReviews = reviewCount > 0;
  return (
    <Link
      to={`/companies/${slug}`}
      className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 hover:border-red-200 hover:shadow-md transition-all group"
    >
      <span className="text-2xl w-8 text-center shrink-0">
        {hasReviews ? (MEDAL[rank - 1] ?? `#${rank}`) : '—'}
      </span>
      {imageUrl ? (
        <img src={imageUrl} alt={name} className="w-12 h-12 rounded-xl object-cover shrink-0" />
      ) : (
        <div className="w-12 h-12 rounded-xl bg-red-50 flex items-center justify-center shrink-0 text-red-400 font-bold text-lg">
          {name?.[0]?.toUpperCase()}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-gray-900 truncate group-hover:text-red-600 transition-colors">
            {name}
          </span>
          {isVerified && (
            <span className="shrink-0 text-xs bg-green-50 text-green-600 px-1.5 py-0.5 rounded-full">✓</span>
          )}
        </div>
        <span className="text-xs text-gray-400">{category?.name}</span>
        {hasReviews && <div className="mt-1"><TrendBadge trend={trend} /></div>}
      </div>
      <div className="text-right shrink-0">
        {hasReviews ? (
          <>
            <div className="flex items-center gap-1 justify-end">
              <Star size={14} className="fill-red-500 text-red-500" />
              <span className="font-bold text-gray-900">{averageRating.toFixed(1)}</span>
            </div>
            <span className="text-xs text-gray-400">{reviewCount} avis</span>
          </>
        ) : (
          <span className="text-xs text-gray-300 italic">Aucun avis</span>
        )}
      </div>
      <ChevronRight size={16} className="text-gray-300 group-hover:text-red-400 shrink-0 transition-colors" />
    </Link>
  );
}

export default function ClassementsPage() {
  const [searchParams] = useSearchParams();
  const presetCategory = searchParams.get('category');
  const [tab, setTab] = useState('category');
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState('Dakar');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    rankingsService.getCategories().then((cats) => {
      setCategories(cats);
      if (presetCategory && cats.some((c) => c.slug === presetCategory)) {
        setSelectedCategory(presetCategory);
      } else if (cats.length > 0) {
        setSelectedCategory(cats[0].slug);
      }
    });
  }, [presetCategory]);

  useEffect(() => {
    if (tab === 'category' && !selectedCategory) return;
    fetchRankings();
  }, [tab, selectedCategory, selectedCity]);

  const fetchRankings = async () => {
    setLoading(true);
    setError('');
    try {
      const data =
        tab === 'category'
          ? await rankingsService.getByCategory(selectedCategory)
          : await rankingsService.getByCity(selectedCity);
      setResults(data);
      if (data.length === 0) setError('Aucune entreprise trouvée pour cette sélection.');
    } catch {
      setError('Erreur de chargement. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-12 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-300 text-sm font-medium px-3 py-1 rounded-full mb-4">
            <Trophy size={14} />
            Classements EchoWork
          </div>
          <h1 className="text-3xl font-bold mb-2">Les meilleures entreprises du Sénégal</h1>
          <p className="text-gray-400">Classements basés sur les avis vérifiés de la communauté.</p>
        </div>
      </div>

      <main className="max-w-3xl mx-auto w-full px-4 py-8 flex-1">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: 'category', label: 'Par secteur', icon: Building2 },
            { key: 'city', label: 'Par ville', icon: MapPin },
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-colors ${
                tab === key
                  ? 'bg-red-600 text-white shadow-sm'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600'
              }`}
            >
              <Icon size={15} />
              {label}
            </button>
          ))}
        </div>

        {/* Selector */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-6">
          {tab === 'category' ? (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Secteur d'activité
              </label>
              <div className="flex flex-wrap gap-2">
                {categories.map((cat) => (
                  <button
                    key={cat.slug}
                    onClick={() => setSelectedCategory(cat.slug)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCategory === cat.slug
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    {cat.name}
                    <span className="ml-1 text-xs opacity-60">({cat._count?.companies ?? 0})</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-2 uppercase tracking-wide">
                Ville
              </label>
              <div className="flex flex-wrap gap-2">
                {CITIES.map((city) => (
                  <button
                    key={city}
                    onClick={() => setSelectedCity(city)}
                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                      selectedCity === city
                        ? 'bg-red-600 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-red-50 hover:text-red-600'
                    }`}
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 size={28} className="animate-spin text-red-500" />
          </div>
        ) : error ? (
          <div className="text-center py-16 text-gray-400">
            <Trophy size={32} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm font-medium text-gray-500 mb-1">{error}</p>
            <p className="text-xs text-gray-400">Soyez le premier à noter une entreprise dans ce secteur !</p>
          </div>
        ) : (
          <div className="space-y-3">
            {results.map((company) => (
              <RankCard key={company.id} company={company} />
            ))}
          </div>
        )}
      </main>

      <Foot />
    </div>
  );
}
