import { Link } from 'react-router-dom';
import {
  Landmark, Phone, Briefcase, Hospital, TrendingUp, TrendingDown, BarChart3,
} from 'lucide-react';
import Navbar from '../components/navbar';
import Foot from '../components/Foot';
import { useBarometer } from '../hooks/useHomeData';

const baroIcons = {
  'banques-et-institutions-financieres': { Icon: Landmark,  bg: 'bg-emerald-50', color: 'text-emerald-600', border: 'border-emerald-100' },
  'telecommunications':                  { Icon: Phone,     bg: 'bg-cyan-50',    color: 'text-cyan-600',    border: 'border-cyan-100'    },
  'services':                            { Icon: Briefcase, bg: 'bg-violet-50',  color: 'text-violet-600',  border: 'border-violet-100'  },
  'sante-et-pharmacie':                  { Icon: Hospital,  bg: 'bg-red-50',     color: 'text-red-600',     border: 'border-red-100'     },
};

const STATIC_BAROMETER = [
  { slug: 'banques-et-institutions-financieres', label: 'Banques',          avg: 4.3, trend: 0.2,  count: 0 },
  { slug: 'telecommunications',                  label: 'Télécoms',         avg: 4.1, trend: -0.1, count: 0 },
  { slug: 'services',                            label: 'Services publics', avg: 3.2, trend: 0.3,  count: 0 },
  { slug: 'sante-et-pharmacie',                  label: 'Santé',            avg: 4.0, trend: 0.1,  count: 0 },
];

export default function InsightsPage() {
  const { data: baroData } = useBarometer();
  const barometer = baroData?.filter((b) => b.avg !== null).length > 0 ? baroData : STATIC_BAROMETER;

  return (
    <>
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-10 md:py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white/80 mb-4">
            <BarChart3 size={13} />
            EchoWork Insights
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3 leading-tight">
            Le baromètre EchoWork
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto">
            La satisfaction des Sénégalais en temps réel dans les principaux secteurs d'activité.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-5xl mx-auto px-4 py-10 md:py-14">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
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

          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 text-center">
            <p className="text-sm text-gray-500 max-w-lg mx-auto leading-relaxed">
              Ces scores sont calculés à partir des avis publiés et approuvés sur EchoWork.
              Plus la communauté partage son expérience, plus le baromètre reflète fidèlement
              la réalité du marché sénégalais.
            </p>
          </div>

        </div>
      </div>

      <Foot />
    </>
  );
}
