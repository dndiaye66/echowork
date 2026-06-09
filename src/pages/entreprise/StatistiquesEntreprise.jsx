import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import {
  Eye, MessageSquare, Star, TrendingUp, Users, Loader2,
  AlertCircle, BarChart3, Building2, ChevronRight,
} from 'lucide-react';
import EntrepriseLayout from '../../components/EntrepriseLayout';
import { analyticsService } from '../../services/rankingsService';
import { entrepriseService } from '../../services/entrepriseService';

function StatCard({ icon: Icon, label, value, sub, color = 'red' }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center mb-3`}>
        <Icon size={20} className={`text-${color}-600`} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
      {sub && <p className="text-xs text-gray-400 mt-1">{sub}</p>}
    </div>
  );
}

function RatingTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-xl shadow-md px-3 py-2 text-sm">
      <p className="text-gray-500 mb-1">{label}</p>
      <p className="font-bold text-red-600">
        {payload[0].value != null ? `${payload[0].value} / 5` : 'Aucun avis'}
      </p>
    </div>
  );
}

export default function StatistiquesEntreprise() {
  const [searchParams] = useSearchParams();
  const companyId = parseInt(searchParams.get('id'), 10);

  const [companies, setCompanies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    entrepriseService.getMyCompanies().then((list) => {
      setCompanies(list);
      const initial = companyId ? list.find((c) => c.id === companyId) : list[0];
      if (initial) setSelected(initial);
    });
  }, []);

  useEffect(() => {
    if (!selected) return;
    setLoading(true);
    setError('');
    analyticsService.getAnalytics(selected.id)
      .then(setAnalytics)
      .catch(() => setError('Impossible de charger les statistiques.'))
      .finally(() => setLoading(false));
  }, [selected]);

  const chartData = (analytics?.ratingHistory ?? []).map((h) => ({
    month: h.month.slice(5),
    note: h.avg,
    avis: h.count,
  }));

  return (
    <EntrepriseLayout title="Statistiques">
      {/* Company selector */}
      {companies.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {companies.map((c) => (
            <button
              key={c.id}
              onClick={() => setSelected(c)}
              className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                selected?.id === c.id
                  ? 'bg-red-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin text-red-500" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl p-4">
          <AlertCircle size={18} /> {error}
        </div>
      ) : analytics ? (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              icon={Eye} label="Vues de la fiche" color="blue"
              value={analytics.views.total.toLocaleString('fr-FR')}
              sub={`${analytics.views.thisMonth} ce mois (${analytics.views.trend})`}
            />
            <StatCard
              icon={MessageSquare} label="Avis reçus" color="red"
              value={analytics.reviews.total}
              sub={`${analytics.reviews.thisMonth} ce mois (${analytics.reviews.trend})`}
            />
            <StatCard
              icon={Star} label="Note globale" color="yellow"
              value={analytics.globalAvg > 0 ? analytics.globalAvg.toFixed(1) : '—'}
              sub="Moyenne de tous les avis"
            />
            <StatCard
              icon={TrendingUp} label="Taux de réponse" color="green"
              value={`${analytics.responseRate}%`}
              sub="des avis ont une réponse"
            />
          </div>

          {/* Competitor comparison */}
          {analytics.competitorAvg != null && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Users size={18} className="text-red-500" />
                Comparaison avec la concurrence
              </h3>
              <div className="space-y-3">
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium text-gray-900">{selected?.name}</span>
                    <span className="font-bold text-red-600">{analytics.globalAvg.toFixed(1)} / 5</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-500 rounded-full transition-all duration-700"
                      style={{ width: `${(analytics.globalAvg / 5) * 100}%` }}
                    />
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-gray-500">Moyenne du secteur</span>
                    <span className="font-medium text-gray-600">{analytics.competitorAvg.toFixed(1)} / 5</span>
                  </div>
                  <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gray-300 rounded-full transition-all duration-700"
                      style={{ width: `${(analytics.competitorAvg / 5) * 100}%` }}
                    />
                  </div>
                </div>
                <p className={`text-sm font-medium ${analytics.globalAvg >= analytics.competitorAvg ? 'text-green-600' : 'text-orange-500'}`}>
                  {analytics.globalAvg >= analytics.competitorAvg
                    ? `✓ +${(analytics.globalAvg - analytics.competitorAvg).toFixed(2)} points au-dessus de la moyenne`
                    : `⚠ ${(analytics.competitorAvg - analytics.globalAvg).toFixed(2)} points en-dessous de la moyenne`}
                </p>
              </div>
            </div>
          )}

          {/* Rating history chart */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-5 flex items-center gap-2">
              <BarChart3 size={18} className="text-red-500" />
              Évolution de la note (12 derniers mois)
            </h3>
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="ratingGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis domain={[0, 5]} tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <Tooltip content={<RatingTooltip />} />
                <Area
                  type="monotone"
                  dataKey="note"
                  stroke="#ef4444"
                  strokeWidth={2}
                  fill="url(#ratingGradient)"
                  dot={{ fill: '#ef4444', r: 3 }}
                  connectNulls={false}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="text-center py-20 text-gray-400">
          <Building2 size={32} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucune donnée disponible.</p>
          <Link
            to="/espace-entreprise/rejoindre"
            className="inline-flex items-center gap-1 text-red-600 text-sm mt-3 hover:underline"
          >
            Réclamer une fiche <ChevronRight size={14} />
          </Link>
        </div>
      )}
    </EntrepriseLayout>
  );
}
