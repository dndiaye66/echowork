import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Star, Loader2, AlertCircle } from 'lucide-react';
import Navbar from '../components/navbar';
import Foot from '../components/Foot';
import { vitrineService } from '../services/vitrineService';

function StarRow({ rating, size = 13 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          size={size}
          className={i <= Math.round(rating) ? 'fill-red-500 text-red-500' : 'fill-gray-200 text-gray-200'}
        />
      ))}
    </div>
  );
}

function timeAgo(dateStr) {
  const diff = Math.floor((Date.now() - new Date(dateStr)) / 1000);
  if (diff < 60)      return "À l'instant";
  if (diff < 3600)    return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400)   return `Il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 2592000) return `Il y a ${Math.floor(diff / 86400)} j`;
  return `Il y a ${Math.floor(diff / 2592000)} mois`;
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

export default function AvisRecentsPage() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    vitrineService.getRecentReviews(50)
      .then((data) => setReviews(dedupeByCompany(data, 50)))
      .catch(() => setError('Impossible de charger les avis.'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <Navbar />

      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-10 md:py-14 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white/80 mb-4">
            <MessageSquare size={13} />
            Avis récents
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-3 leading-tight">
            Derniers avis publiés
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto">
            Les expériences les plus récemment partagées par la communauté EchoWork.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-2xl mx-auto px-4 py-8">

          {loading ? (
            <div className="flex justify-center py-16">
              <Loader2 size={28} className="animate-spin text-red-500" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center gap-2 text-red-500 py-16">
              <AlertCircle size={18} /> {error}
            </div>
          ) : reviews.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-16 text-center">
              <MessageSquare size={40} className="text-gray-200 mx-auto mb-3" />
              <p className="text-gray-400 font-medium">Aucun avis pour le moment</p>
            </div>
          ) : (
            <div className="space-y-3">
              {reviews.map((r) => {
                const co = r.company;
                return (
                  <div key={r.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4">
                    <div className="flex items-start gap-3">
                      {co?.imageUrl ? (
                        <img src={co.imageUrl} alt={co.name} className="w-10 h-10 rounded-xl object-cover shrink-0" />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center shrink-0 text-red-500 font-bold">
                          {co?.name?.[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <Link
                          to={co?.slug ? `/companies/${co.slug}` : '#'}
                          className="font-semibold text-gray-900 text-sm hover:text-red-600 transition-colors"
                        >
                          {co?.name || 'Entreprise'}
                        </Link>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <StarRow rating={r.rating} size={11} />
                          <span className="text-xs font-bold text-gray-600">{r.rating}.0</span>
                        </div>
                      </div>
                      <span className="text-xs text-gray-300 shrink-0">{timeAgo(r.createdAt)}</span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mt-3">"{r.comment}"</p>
                    <div className="flex items-center gap-2 pt-3 mt-3 border-t border-gray-50">
                      <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center text-[10px] font-bold text-gray-500 shrink-0">
                        {r.user?.username?.[0]?.toUpperCase() || '?'}
                      </div>
                      <span className="text-xs font-medium text-gray-600">{r.user?.username}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

        </div>
      </div>

      <Foot />
    </>
  );
}
