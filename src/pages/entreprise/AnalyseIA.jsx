import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Sparkles, CheckCircle, AlertTriangle, RefreshCw,
  Loader2, AlertCircle, TrendingUp,
} from 'lucide-react';
import EntrepriseLayout from '../../components/EntrepriseLayout';
import { analyticsService } from '../../services/rankingsService';
import { entrepriseService } from '../../services/entrepriseService';

function SentimentBar({ label, value, color }) {
  return (
    <div className="flex items-center gap-3">
      <span className={`text-xs font-medium w-16 ${color}`}>{label}</span>
      <div className="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${
            color === 'text-green-600' ? 'bg-green-500' :
            color === 'text-gray-500' ? 'bg-gray-400' : 'bg-red-500'
          }`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-sm font-bold text-gray-700 w-10 text-right">{value}%</span>
    </div>
  );
}

export default function AnalyseIA() {
  const [searchParams] = useSearchParams();
  const companyId = parseInt(searchParams.get('id'), 10);

  const [companies, setCompanies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
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
    analyticsService.getAnalysis(selected.id)
      .then(setAnalysis)
      .catch(() => setAnalysis(null))
      .finally(() => setLoading(false));
  }, [selected]);

  const handleGenerate = async () => {
    if (!selected) return;
    setGenerating(true);
    setError('');
    try {
      const result = await analyticsService.generateAnalysis(selected.id);
      setAnalysis(result);
    } catch (err) {
      const msg = err?.response?.data?.message;
      setError(msg ?? "Erreur lors de la génération. Vérifiez que vous avez au moins 5 avis approuvés.");
    } finally {
      setGenerating(false);
    }
  };

  const generatedDate = analysis?.generatedAt
    ? new Date(analysis.generatedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    : null;

  return (
    <EntrepriseLayout title="Analyse IA">
      {/* Company selector */}
      {companies.length > 1 && (
        <div className="flex gap-2 mb-6 flex-wrap">
          {companies.map((c) => (
            <button key={c.id} onClick={() => setSelected(c)}
              className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
                selected?.id === c.id ? 'bg-red-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      )}

      <div className="max-w-2xl space-y-5">
        {/* Header card */}
        <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-2xl p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Sparkles size={20} className="text-yellow-400" />
                <span className="font-bold text-lg">Analyse automatique par IA</span>
              </div>
              <p className="text-gray-400 text-sm">
                Synthèse intelligente de tous les avis clients de{' '}
                <span className="text-white font-medium">{selected?.name ?? '...'}</span>.
              </p>
              {generatedDate && (
                <p className="text-xs text-gray-500 mt-2">Dernière analyse : {generatedDate} · {analysis.reviewCount} avis</p>
              )}
            </div>
            <button
              onClick={handleGenerate}
              disabled={generating || loading}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0"
            >
              {generating ? <Loader2 size={15} className="animate-spin" /> : <RefreshCw size={15} />}
              {analysis ? 'Regénérer' : 'Générer'}
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 bg-red-50 text-red-600 border border-red-100 rounded-xl p-4 text-sm">
            <AlertCircle size={16} className="mt-0.5 shrink-0" /> {error}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center h-32">
            <Loader2 size={24} className="animate-spin text-red-500" />
          </div>
        ) : analysis ? (
          <>
            {/* Sentiment */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={18} className="text-red-500" />
                Sentiment global
              </h3>
              <div className="space-y-3">
                <SentimentBar label="Positif" value={analysis.sentimentPos} color="text-green-600" />
                <SentimentBar label="Neutre" value={analysis.sentimentNeu} color="text-gray-500" />
                <SentimentBar label="Négatif" value={analysis.sentimentNeg} color="text-red-500" />
              </div>
            </div>

            {/* Strengths */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <CheckCircle size={18} className="text-green-500" />
                Points forts
              </h3>
              <ul className="space-y-2.5">
                {(analysis.strengths ?? []).map((s, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-green-50 text-green-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700">{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Weaknesses */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <AlertTriangle size={18} className="text-orange-500" />
                Points à améliorer
              </h3>
              <ul className="space-y-2.5">
                {(analysis.weaknesses ?? []).map((w, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-sm text-gray-700">{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          </>
        ) : !generating ? (
          <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100 shadow-sm">
            <Sparkles size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium text-gray-600 mb-1">Aucune analyse disponible</p>
            <p className="text-sm">Cliquez sur "Générer" pour lancer l'analyse IA.</p>
            <p className="text-xs mt-2">Nécessite au moins 5 avis approuvés.</p>
          </div>
        ) : null}
      </div>
    </EntrepriseLayout>
  );
}
