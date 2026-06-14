import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Star, MessageSquare, Loader2, AlertCircle, CheckCircle,
  ChevronDown, ChevronUp, Send, Pencil, Trash2,
} from 'lucide-react';
import EntrepriseLayout from '../../components/EntrepriseLayout';
import { entrepriseService } from '../../services/entrepriseService';

function StarRow({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={13}
          className={i <= rating ? 'fill-red-500 text-red-500' : 'fill-gray-200 text-gray-200'}
        />
      ))}
    </div>
  );
}

function ReviewCard({ review, onReplyCreated, onReplyUpdated, onReplyDeleted }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [content, setContent] = useState(review.reply?.content ?? '');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async () => {
    if (!content.trim() || content.length < 10) return;
    setSaving(true);
    setStatus(null);
    try {
      if (review.reply) {
        const updated = await entrepriseService.updateReply(review.id, content);
        onReplyUpdated(review.id, updated);
      } else {
        const created = await entrepriseService.createReply(review.id, content);
        onReplyCreated(review.id, created);
      }
      setEditing(false);
      setStatus('success');
    } catch {
      setStatus('error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Supprimer cette réponse ?')) return;
    try {
      await entrepriseService.deleteReply(review.id);
      onReplyDeleted(review.id);
      setContent('');
      setEditing(false);
    } catch {
      setStatus('error');
    }
  };

  const initials = review.user?.username?.[0]?.toUpperCase() ?? '?';

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      {/* Review */}
      <div className="p-5">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm shrink-0">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-gray-900 text-sm">{review.user?.username}</span>
              {review.user?.isVerified && (
                <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                  Vérifié
                </span>
              )}
              <StarRow rating={review.rating} />
              <span className="text-xs text-gray-400 ml-auto">
                {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
              </span>
            </div>
            <p className="text-sm text-gray-700 mt-2 leading-relaxed">{review.comment}</p>
          </div>
        </div>
      </div>

      {/* Reply section */}
      <div className="border-t border-gray-50">
        {review.reply && !editing ? (
          <div className="bg-gray-50 px-5 py-4">
            <div className="flex items-start gap-2">
              <MessageSquare size={15} className="text-red-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-red-600 mb-1">Réponse officielle</p>
                <p className="text-sm text-gray-700">{review.reply.content}</p>
              </div>
              <div className="flex gap-1 shrink-0">
                <button
                  onClick={() => { setEditing(true); setContent(review.reply.content); }}
                  className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-700 transition-colors"
                >
                  <Pencil size={13} />
                </button>
                <button
                  onClick={handleDelete}
                  className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600 transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={() => setOpen((v) => !v)}
              className="flex items-center gap-2 w-full px-5 py-3 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50/50 transition-colors"
            >
              <MessageSquare size={15} />
              {review.reply ? 'Modifier la réponse' : 'Répondre à cet avis'}
              {open || editing ? <ChevronUp size={14} className="ml-auto" /> : <ChevronDown size={14} className="ml-auto" />}
            </button>

            {(open || editing) && (
              <div className="px-5 pb-4">
                {status === 'success' && (
                  <div className="flex items-center gap-2 text-green-600 text-xs mb-2">
                    <CheckCircle size={13} /> Réponse enregistrée.
                  </div>
                )}
                {status === 'error' && (
                  <div className="flex items-center gap-2 text-red-600 text-xs mb-2">
                    <AlertCircle size={13} /> Erreur. Veuillez réessayer.
                  </div>
                )}
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Rédigez votre réponse officielle... (min. 10 caractères)"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
                />
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-400">{content.length}/1000</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => { setOpen(false); setEditing(false); setContent(review.reply?.content ?? ''); }}
                      className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleSubmit}
                      disabled={saving || content.trim().length < 10}
                      className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white text-sm font-semibold px-4 py-1.5 rounded-lg transition-colors"
                    >
                      {saving ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
                      Publier
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AvisEntreprise() {
  const [searchParams] = useSearchParams();
  const companyId = parseInt(searchParams.get('id'), 10);

  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const load = async (id) => {
      try {
        const data = await entrepriseService.getDashboard(id);
        setDashboard(data);
      } catch {
        setError('Impossible de charger les avis.');
      } finally {
        setLoading(false);
      }
    };

    if (companyId && !isNaN(companyId)) {
      load(companyId);
    } else {
      entrepriseService.getMyCompanies()
        .then((list) => {
          if (list.length > 0) load(list[0].id);
          else setLoading(false);
        })
        .catch(() => { setError('Impossible de charger les avis.'); setLoading(false); });
    }
  }, [companyId]);

  const handleReplyCreated = (reviewId, reply) => {
    setDashboard((d) => ({
      ...d,
      reviews: d.reviews.map((r) => r.id === reviewId ? { ...r, reply } : r),
    }));
  };
  const handleReplyUpdated = (reviewId, reply) => handleReplyCreated(reviewId, reply);
  const handleReplyDeleted = (reviewId) => {
    setDashboard((d) => ({
      ...d,
      reviews: d.reviews.map((r) => r.id === reviewId ? { ...r, reply: null } : r),
    }));
  };

  const reviews = dashboard?.reviews ?? [];
  const filtered = filter === 'replied'
    ? reviews.filter((r) => r.reply)
    : filter === 'pending'
    ? reviews.filter((r) => !r.reply)
    : reviews;

  const repliedCount = reviews.filter((r) => r.reply).length;
  const pendingCount = reviews.filter((r) => !r.reply).length;

  if (loading) {
    return (
      <EntrepriseLayout title="Avis clients">
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin text-red-500" />
        </div>
      </EntrepriseLayout>
    );
  }

  if (error) {
    return (
      <EntrepriseLayout title="Avis clients">
        <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl p-4">
          <AlertCircle size={18} /> {error}
        </div>
      </EntrepriseLayout>
    );
  }

  return (
    <EntrepriseLayout title={`Avis clients — ${dashboard?.name ?? ''}`}>
      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {[
          { label: 'Total avis', value: reviews.length, color: 'gray' },
          { label: 'Répondus', value: repliedCount, color: 'green' },
          { label: 'En attente', value: pendingCount, color: 'red' },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
            <p className={`text-2xl font-bold text-${color}-600`}>{value}</p>
            <p className="text-xs text-gray-500 mt-0.5">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-5">
        {[
          { key: 'all', label: `Tous (${reviews.length})` },
          { key: 'pending', label: `Sans réponse (${pendingCount})` },
          { key: 'replied', label: `Répondus (${repliedCount})` },
        ].map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`text-sm font-medium px-4 py-2 rounded-full transition-colors ${
              filter === key
                ? 'bg-red-600 text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:border-red-300 hover:text-red-600'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Reviews list */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <MessageSquare size={32} className="mx-auto mb-3 opacity-40" />
          <p className="text-sm">Aucun avis dans cette catégorie.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((review) => (
            <ReviewCard
              key={review.id}
              review={review}
              onReplyCreated={handleReplyCreated}
              onReplyUpdated={handleReplyUpdated}
              onReplyDeleted={handleReplyDeleted}
            />
          ))}
        </div>
      )}
    </EntrepriseLayout>
  );
}
