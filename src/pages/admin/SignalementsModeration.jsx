import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, CheckCircle, XCircle, Clock, Loader2, ChevronRight, Eye } from 'lucide-react';
import AdminLayout from '../../components/AdminLayout';
import { reportsService } from '../../services/rankingsService';

const STATUS_CONFIG = {
  PENDING:       { label: 'En attente',     color: 'bg-yellow-50 text-yellow-700 border-yellow-200', dot: 'bg-yellow-400' },
  UNDER_REVIEW:  { label: 'En cours',       color: 'bg-blue-50 text-blue-700 border-blue-200',       dot: 'bg-blue-400' },
  VALIDATED:     { label: 'Validé',         color: 'bg-green-50 text-green-700 border-green-200',     dot: 'bg-green-500' },
  REJECTED:      { label: 'Rejeté',         color: 'bg-gray-50 text-gray-500 border-gray-200',        dot: 'bg-gray-400' },
};

const CATEGORY_LABELS = {
  CORRUPTION:               '🚨 Corruption',
  MAUVAIS_ACCUEIL:          '😠 Mauvais accueil',
  RETARD_ADMINISTRATIF:     '⏰ Retard administratif',
  NON_RESPECT_ENGAGEMENT:   '📋 Non-respect engagements',
  AUTRE:                    '📝 Autre',
};

export default function SignalementsModeration() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [selected, setSelected] = useState(null);
  const [note, setNote] = useState('');
  const [processing, setProcessing] = useState(false);

  useEffect(() => {
    setLoading(true);
    reportsService.getAll(filter)
      .then(setReports)
      .finally(() => setLoading(false));
  }, [filter]);

  const handleAction = async (id, status) => {
    setProcessing(true);
    try {
      const updated = await reportsService.updateStatus(id, status, note);
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, ...updated } : r)));
      setSelected(null);
      setNote('');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <AdminLayout title="Signalements citoyens">
      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {Object.entries(STATUS_CONFIG).map(([key, { label, dot }]) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`flex items-center gap-2 text-sm font-medium px-4 py-2 rounded-full transition-colors ${
              filter === key
                ? 'bg-red-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${filter === key ? 'bg-white' : dot}`} />
            {label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-40">
          <Loader2 size={24} className="animate-spin text-red-500" />
        </div>
      ) : reports.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <AlertTriangle size={30} className="mx-auto mb-3 opacity-30" />
          <p className="text-sm">Aucun signalement dans cette catégorie.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => {
            const { color } = STATUS_CONFIG[report.status] ?? STATUS_CONFIG.PENDING;
            const isOpen = selected?.id === report.id;
            return (
              <div key={report.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div
                  className="flex items-start gap-4 p-4 cursor-pointer hover:bg-gray-50 transition-colors"
                  onClick={() => setSelected(isOpen ? null : report)}
                >
                  <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center shrink-0">
                    <AlertTriangle size={18} className="text-orange-500" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-900 text-sm">
                        {CATEGORY_LABELS[report.category] ?? report.category}
                      </span>
                      <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${color}`}>
                        {STATUS_CONFIG[report.status]?.label}
                      </span>
                      {report.isAnonymous && (
                        <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Anonyme</span>
                      )}
                    </div>
                    <Link
                      to={`/companies/${report.company?.slug}`}
                      className="text-xs text-red-600 hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {report.company?.name}
                    </Link>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{report.description}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(report.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {report.user && !report.isAnonymous && ` · par ${report.user.username}`}
                    </p>
                  </div>
                  <ChevronRight
                    size={16}
                    className={`text-gray-300 shrink-0 transition-transform ${isOpen ? 'rotate-90' : ''}`}
                  />
                </div>

                {/* Detail panel */}
                {isOpen && (
                  <div className="border-t border-gray-50 px-4 pb-4 pt-3 bg-gray-50/50 space-y-3">
                    <p className="text-sm text-gray-700 whitespace-pre-line">{report.description}</p>
                    {report.evidence && (
                      <a
                        href={report.evidence}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-blue-600 hover:underline"
                      >
                        <Eye size={13} /> Voir la preuve jointe
                      </a>
                    )}
                    {report.status === 'PENDING' || report.status === 'UNDER_REVIEW' ? (
                      <div className="space-y-2 pt-1">
                        <textarea
                          value={note}
                          onChange={(e) => setNote(e.target.value)}
                          placeholder="Note de modération (optionnelle)..."
                          rows={2}
                          className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none bg-white"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(report.id, 'UNDER_REVIEW')}
                            disabled={processing}
                            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                          >
                            <Clock size={14} /> En cours d'examen
                          </button>
                          <button
                            onClick={() => handleAction(report.id, 'VALIDATED')}
                            disabled={processing}
                            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 bg-green-50 text-green-700 hover:bg-green-100 rounded-xl transition-colors"
                          >
                            {processing ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                            Valider
                          </button>
                          <button
                            onClick={() => handleAction(report.id, 'REJECTED')}
                            disabled={processing}
                            className="flex items-center gap-1.5 text-sm font-medium px-3 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-xl transition-colors"
                          >
                            <XCircle size={14} /> Rejeter
                          </button>
                        </div>
                      </div>
                    ) : (
                      report.moderatorNote && (
                        <p className="text-xs text-gray-500 italic">Note modérateur : {report.moderatorNote}</p>
                      )
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AdminLayout>
  );
}
