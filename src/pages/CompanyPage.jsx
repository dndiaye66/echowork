import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import {
  Star, ThumbsUp, ThumbsDown, MapPin, Phone,
  Building2, ChevronRight, CheckCircle, AlertCircle, Mail, AlertTriangle,
} from 'lucide-react';
import Navbar from '../components/navbar';
import Foot from '../components/Foot';
import { reviewService } from '../services/reviewService';
import { companyService } from '../services/companyService';
import { analyticsService } from '../services/rankingsService';
import { useVoting } from '../hooks/useVoting';
import { useAuth } from '../contexts/AuthContext';
import axios from '../api/Config';
import SignalementModal from '../components/SignalementModal';

function StarDisplay({ rating, size = 16 }) {
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

function StarPicker({ rating, onRate }) {
  const [hovered, setHovered] = useState(0);
  const active = hovered || rating;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((i) => (
        <button
          key={i}
          type="button"
          onClick={() => onRate(i)}
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          className="p-0.5 transition-transform hover:scale-110"
        >
          <Star
            size={28}
            className={i <= active ? 'fill-red-500 text-red-500' : 'fill-gray-200 text-gray-200'}
          />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ label, count, total }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-500 w-3 text-right font-medium">{label}</span>
      <Star size={11} className="fill-red-400 text-red-400 shrink-0" />
      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
        <div className="h-full bg-red-500 rounded-full transition-all duration-700" style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-gray-400 w-8">{Math.round(pct)}%</span>
    </div>
  );
}

export default function CompanyPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();

  const [company, setCompany] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comment, setComment] = useState('');
  const [rating, setRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null); // 'success' | 'error' | 'updated'
  const [editMode, setEditMode] = useState(false);
  const [existingReview, setExistingReview] = useState(null);

  const { upvote, downvote, votingStates } = useVoting();
  const [userVotes, setUserVotes] = useState({});
  const [showSignalement, setShowSignalement] = useState(false);

  const fetchUserVotes = async (companyId) => {
    if (!isAuthenticated) return;
    try {
      const res = await axios.get(`/reviews/user-votes?companyId=${companyId}`);
      setUserVotes(res.data || {});
    } catch {}
  };

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const data = await companyService.getCompanyBySlug(slug);
        if (!cancelled) {
          setCompany(data);
          analyticsService.trackView(data.id, 'direct');
          const reviewList = data.reviews || [];
          setReviews(reviewList);
          if (user?.id) {
            const mine = reviewList.find((r) => r.user?.id === user.id);
            if (mine) setExistingReview(mine);
            // Fetch user's votes for this company
            fetchUserVotes(data.id);
          }
        }
      } catch {
        if (!cancelled) setError('Entreprise non trouvée');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug, user?.id]);

  const refreshReviews = async () => {
    try {
      const data = await companyService.getCompanyBySlug(slug);
      const reviewList = data.reviews || [];
      setReviews(reviewList);
      if (user?.id) {
        const mine = reviewList.find((r) => r.user?.id === user.id);
        setExistingReview(mine || null);
        fetchUserVotes(data.id);
      }
    } catch {}
  };

  const enterEditMode = () => {
    if (existingReview) {
      setRating(existingReview.rating);
      setComment(existingReview.comment || '');
      setEditMode(true);
      setSubmitStatus(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) { navigate('/login', { state: { from: location.pathname } }); return; }
    if (rating === 0) return;
    setSubmitting(true);
    setSubmitStatus(null);
    try {
      if (editMode && existingReview) {
        await reviewService.updateReview(existingReview.id, { rating, comment });
        setSubmitStatus('updated');
      } else {
        await reviewService.createReview({ companyId: company.id, comment, rating });
        setSubmitStatus('success');
      }
      setEditMode(false);
      setComment('');
      setRating(0);
      await refreshReviews();
      setTimeout(() => setSubmitStatus(null), 4000);
    } catch (err) {
      if (err.response?.status === 401) { navigate('/login', { state: { from: location.pathname } }); return; }
      if (err.response?.status === 403) {
        setSubmitStatus('unverified');
        return;
      }
      if (err.response?.status === 409) {
        // Already reviewed — switch to edit mode
        const reviewId = err.response.data?.reviewId;
        if (reviewId) {
          const mine = reviews.find((r) => r.id === reviewId) || existingReview;
          if (mine) { setExistingReview(mine); enterEditMode(); }
        }
        return;
      }
      setSubmitStatus('error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleVote = async (reviewId, type) => {
    if (!isAuthenticated) { navigate('/login', { state: { from: location.pathname } }); return; }
    try {
      const result = type === 'upvote' ? await upvote(reviewId) : await downvote(reviewId);
      // Update local vote state optimistically
      if (result?.userVote !== undefined) {
        setUserVotes((prev) => ({ ...prev, [reviewId]: result.userVote }));
      }
      // Update review counts in local state
      if (result?.upvotes !== undefined) {
        setReviews((prev) => prev.map((r) =>
          r.id === reviewId ? { ...r, upvotes: result.upvotes, downvotes: result.downvotes } : r
        ));
      }
    } catch {}
  };

  if (loading) return (
    <>
      <Navbar />
      <div className="flex items-center justify-center min-h-[60vh] bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <span className="loading loading-spinner loading-lg text-red-600" />
          <p className="text-gray-400 text-sm">Chargement...</p>
        </div>
      </div>
      <Foot />
    </>
  );

  if (error || !company) return (
    <>
      <Navbar />
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-gray-50 px-4">
        <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center">
          <Building2 size={36} className="text-gray-300" />
        </div>
        <p className="text-xl font-bold text-gray-900">Entreprise introuvable</p>
        <p className="text-gray-400 text-sm">Cette entreprise nexiste pas ou a ete supprimee.</p>
        <Link to="/" className="px-5 py-2.5 bg-red-600 text-white rounded-full text-sm font-semibold hover:bg-red-700 transition-colors">
          Retour a l accueil
        </Link>
      </div>
      <Foot />
    </>
  );

  const avg = reviews.length > 0
    ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length
    : 0;

  const ratingCounts = [5, 4, 3, 2, 1].map((n) => ({
    label: n,
    count: reviews.filter((r) => r.rating === n).length,
  }));

  return (
    <>
      <Navbar />

      {/* Company header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
        <div className="max-w-6xl mx-auto px-4 py-7 md:py-12">
          <div className="flex items-center gap-1.5 text-xs text-white/40 mb-4 md:mb-6">
            <Link to="/" className="hover:text-white/80 transition-colors">Accueil</Link>
            <ChevronRight size={11} />
            {company.category && (
              <>
                <Link to={`/categories/${company.category.slug}`} className="hover:text-white/80 transition-colors">
                  {company.category.name}
                </Link>
                <ChevronRight size={11} />
              </>
            )}
            <span className="text-white/70 truncate">{company.name}</span>
          </div>

          <div className="flex flex-row md:flex-col md:items-start gap-4 md:gap-6">
            <div className="flex items-start gap-3 md:gap-6 flex-1">
              <div className="shrink-0">
                {company.imageUrl ? (
                  <img src={company.imageUrl} alt={company.name} className="w-16 h-16 md:w-24 md:h-24 rounded-2xl object-cover ring-2 ring-white/10" />
                ) : (
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-2xl bg-white/10 flex items-center justify-center ring-2 ring-white/10">
                    <Building2 size={26} className="text-white/50" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-1.5 md:gap-2 mb-1.5 md:mb-2">
                  {company.category && (
                    <span className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] md:text-xs font-medium">{company.category.name}</span>
                  )}
                  {company.isVerified && (
                    <span className="flex items-center gap-1 px-2 py-0.5 bg-green-500/20 text-green-300 rounded-full text-[10px] md:text-xs font-medium">
                      <CheckCircle size={10} /> Vérifié
                    </span>
                  )}
                </div>

                <h1 className="text-xl md:text-4xl font-black mb-2 md:mb-3 leading-tight">{company.name}</h1>

                <div className="flex flex-wrap items-center gap-2 md:gap-4 mb-2 md:mb-4">
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <StarDisplay rating={avg} size={15} />
                    <span className="text-base md:text-xl font-bold">{avg > 0 ? Number(avg).toFixed(1) : '—'}</span>
                    <span className="text-white/50 text-xs md:text-sm">({reviews.length} avis)</span>
                  </div>
                </div>

                {company.description && (
                  <p className="text-white/65 text-xs md:text-sm max-w-xl leading-relaxed mb-2 md:mb-4 line-clamp-2 md:line-clamp-none">{company.description}</p>
                )}

                <div className="flex flex-wrap gap-2 md:gap-3">
                  {company.ville && (
                    <div className="flex items-center gap-1 md:gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full bg-white/10 text-xs md:text-sm text-white/70">
                      <MapPin size={11} />{company.ville}
                    </div>
                  )}
                  {company.tel && (
                    <a href={`tel:${company.tel}`} className="flex items-center gap-1 md:gap-1.5 px-2.5 py-1 md:px-3 md:py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-xs md:text-sm text-white/70 hover:text-white transition-colors">
                      <Phone size={11} />{company.tel}
                    </a>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 py-5 md:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 md:gap-8">

            {/* Reviews column */}
            <div className="lg:col-span-2 space-y-4 md:space-y-6 order-2 lg:order-1">
              {reviews.length > 0 && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 md:p-6">
                  <h2 className="text-sm md:text-base font-bold text-gray-900 mb-4 md:mb-5">Résumé des avis</h2>
                  <div className="flex items-center gap-8">
                    <div className="text-center shrink-0">
                      <p className="text-5xl font-black text-gray-900 leading-none">{Number(avg).toFixed(1)}</p>
                      <div className="mt-2"><StarDisplay rating={avg} size={18} /></div>
                      <p className="text-xs text-gray-400 mt-1.5">{reviews.length} avis</p>
                    </div>
                    <div className="flex-1 space-y-2">
                      {ratingCounts.map(({ label, count }) => (
                        <RatingBar key={label} label={label} count={count} total={reviews.length} />
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-4 md:px-6 py-3.5 md:py-4 border-b border-gray-100">
                  <h2 className="text-sm md:text-base font-bold text-gray-900">
                    Avis{reviews.length > 0 ? ` (${reviews.length})` : ''}
                  </h2>
                </div>

                {reviews.length === 0 ? (
                  <div className="py-14 text-center">
                    <Building2 size={36} className="text-gray-200 mx-auto mb-3" />
                    <p className="font-medium text-gray-400">Aucun avis pour l instant</p>
                    <p className="text-sm text-gray-300 mt-1">Soyez le premier a donner votre avis</p>
                  </div>
                ) : (
                  <div className="divide-y divide-gray-50">
                    {reviews.map((review) => (
                      <div key={review.id} className="px-4 md:px-6 py-4 md:py-5">
                        <div className="flex items-start justify-between gap-4 mb-3">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-red-100 flex items-center justify-center text-sm font-bold text-red-600 uppercase shrink-0">
                              {review.user?.username?.[0] || 'A'}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-sm">{review.user?.username || 'Anonyme'}</p>
                              {review.createdAt && (
                                <p className="text-xs text-gray-400">
                                  Posté le {new Date(review.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                                </p>
                              )}
                              {review.user?.createdAt && (
                                <p className="text-xs text-gray-300">
                                  Membre depuis {new Date(review.user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                                </p>
                              )}
                            </div>
                          </div>
                          <StarDisplay rating={review.rating} size={14} />
                        </div>

                        <p className="text-sm text-gray-700 leading-relaxed">{review.comment}</p>

                        <div className="flex items-center gap-2 mt-3">
                          <button
                            onClick={() => handleVote(review.id, 'upvote')}
                            disabled={votingStates[review.id]}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors disabled:opacity-40 ${
                              userVotes[review.id] === 'LIKE'
                                ? 'border-green-400 text-green-700 bg-green-50'
                                : 'border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600 hover:bg-green-50'
                            }`}
                          >
                            <ThumbsUp size={11} />{review.upvotes || 0}
                          </button>
                          <button
                            onClick={() => handleVote(review.id, 'downvote')}
                            disabled={votingStates[review.id]}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-colors disabled:opacity-40 ${
                              userVotes[review.id] === 'DISLIKE'
                                ? 'border-red-400 text-red-700 bg-red-50'
                                : 'border-gray-200 text-gray-500 hover:border-red-300 hover:text-red-600 hover:bg-red-50'
                            }`}
                          >
                            <ThumbsDown size={11} />{review.downvotes || 0}
                          </button>
                          {review.context && (
                            <span className="ml-1 px-2 py-0.5 bg-gray-100 rounded-full text-xs text-gray-400">{review.context}</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-4 md:space-y-5 order-1 lg:order-2">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-base font-bold text-gray-900 mb-1">Votre avis</h2>

                {!isAuthenticated ? (
                  <div className="text-center py-4">
                    <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
                      <Star size={22} className="text-gray-300" />
                    </div>
                    <p className="text-sm text-gray-500 mb-4">Connectez-vous pour publier un avis</p>
                    <Link to="/login" className="block w-full py-2.5 text-center text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition-colors">
                      Se connecter
                    </Link>
                    <Link to="/signup" className="block mt-2 w-full py-2.5 text-center text-sm font-semibold text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors">
                      Créer un compte
                    </Link>
                  </div>
                ) : existingReview && !editMode ? (
                  /* Already reviewed — show existing review summary */
                  <div>
                    <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5 mb-4 mt-3">
                      <CheckCircle size={14} className="text-green-600 shrink-0" />
                      <p className="text-sm text-green-700 font-medium">Vous avez déjà noté cette entreprise</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-4 mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <StarDisplay rating={existingReview.rating} size={16} />
                        <span className="text-sm font-bold text-gray-700">{existingReview.rating}/5</span>
                      </div>
                      {existingReview.comment && (
                        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{existingReview.comment}</p>
                      )}
                    </div>
                    <button
                      onClick={enterEditMode}
                      className="w-full py-2.5 border border-red-300 text-red-600 rounded-xl text-sm font-semibold hover:bg-red-50 transition-colors"
                    >
                      Modifier mon avis
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    {editMode && (
                      <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 text-xs text-amber-700 font-medium">
                        <AlertCircle size={13} /> Modification de votre avis existant
                      </div>
                    )}
                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">Votre note</label>
                      <StarPicker rating={rating} onRate={setRating} />
                      {rating === 0 && <p className="text-xs text-gray-300 mt-1">Cliquez pour noter</p>}
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide block mb-2">
                        Commentaire <span className="text-gray-300 font-normal normal-case">(optionnel)</span>
                      </label>
                      <textarea
                        rows={4}
                        className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent resize-none"
                        placeholder="Partagez votre expérience avec cette entreprise..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        maxLength={500}
                      />
                      <p className="text-xs text-gray-300 text-right mt-1">{comment.length}/500</p>
                    </div>
                    {submitStatus === 'success' && (
                      <div className="flex items-center gap-2 text-sm text-green-600 bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                        <CheckCircle size={14} /> Avis publié avec succès !
                      </div>
                    )}
                    {submitStatus === 'updated' && (
                      <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 border border-blue-200 rounded-xl px-3 py-2.5">
                        <CheckCircle size={14} /> Avis modifié avec succès !
                      </div>
                    )}
                    {submitStatus === 'unverified' && (
                      <div className="flex items-start gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2.5">
                        <Mail size={14} className="shrink-0 mt-0.5" />
                        <span>Vous devez d'abord valider votre compte via l'email de confirmation envoyé.</span>
                      </div>
                    )}
                    {submitStatus === 'error' && (
                      <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2.5">
                        <AlertCircle size={14} /> Erreur lors de la publication.
                      </div>
                    )}
                    <div className="flex gap-2">
                      {editMode && (
                        <button
                          type="button"
                          onClick={() => { setEditMode(false); setRating(0); setComment(''); }}
                          className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-colors"
                        >
                          Annuler
                        </button>
                      )}
                      <button
                        type="submit"
                        disabled={submitting || rating === 0}
                        className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-sm font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {submitting ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="loading loading-spinner loading-xs" />
                            {editMode ? 'Modification...' : 'Publication...'}
                          </span>
                        ) : editMode ? 'Enregistrer' : 'Publier mon avis'}
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {(company.adresse || company.ninea || company.rccm || company.activite || company.size) && (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <h3 className="text-sm font-bold text-gray-900 mb-4">Informations</h3>
                  <dl className="space-y-3">
                    {company.adresse && (
                      <div>
                        <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Adresse</dt>
                        <dd className="text-sm text-gray-700 mt-0.5">{company.adresse}</dd>
                      </div>
                    )}
                    {company.activite && (
                      <div>
                        <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Activite</dt>
                        <dd className="text-sm text-gray-700 mt-0.5">{company.activite}</dd>
                      </div>
                    )}
                    {company.size && (
                      <div>
                        <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Taille</dt>
                        <dd className="text-sm text-gray-700 mt-0.5">{company.size}</dd>
                      </div>
                    )}
                    {company.ninea && (
                      <div>
                        <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">NINEA</dt>
                        <dd className="text-sm font-mono text-gray-700 mt-0.5">{company.ninea}</dd>
                      </div>
                    )}
                    {company.rccm && (
                      <div>
                        <dt className="text-xs font-semibold text-gray-400 uppercase tracking-wide">RCCM</dt>
                        <dd className="text-sm font-mono text-gray-700 mt-0.5">{company.rccm}</dd>
                      </div>
                    )}
                  </dl>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {company.jobOffers?.length > 0 && (
        <section className="py-10 px-4 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-black text-gray-900 mb-6">
              Offres emploi <span className="ml-1 text-sm font-medium text-gray-400">({company.jobOffers.length})</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {company.jobOffers.map((job) => (
                <div key={job.id} className="bg-gray-50 rounded-2xl p-5 border border-gray-100 hover:border-red-200 transition-colors">
                  <h3 className="font-bold text-gray-900 mb-2">{job.title}</h3>
                  <p className="text-sm text-gray-500 line-clamp-3 leading-relaxed">{job.description}</p>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs">
                    {job.location && <span className="flex items-center gap-1 text-gray-400"><MapPin size={11} />{job.location}</span>}
                    {job.salary && <span className="font-semibold text-green-600">{job.salary}</span>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {company.advertisements?.length > 0 && (
        <section className="py-10 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Annonces</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {company.advertisements.map((ad) => (
                <div key={ad.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                  {ad.imageUrl && <img src={ad.imageUrl} alt={ad.title} className="w-full h-48 object-cover" />}
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-1">{ad.title}</h3>
                    <p className="text-sm text-gray-500 leading-relaxed">{ad.content}</p>
                    {ad.endDate && <p className="text-xs text-gray-300 mt-2">Jusqu au {new Date(ad.endDate).toLocaleDateString('fr-FR')}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Signalement citoyen */}
      <div className="max-w-4xl mx-auto px-4 pb-6 text-center">
        <button
          onClick={() => setShowSignalement(true)}
          className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-orange-500 transition-colors"
        >
          <AlertTriangle size={12} />
          Signaler un problème avec cette entreprise
        </button>
      </div>

      {showSignalement && (
        <SignalementModal company={company} onClose={() => setShowSignalement(false)} />
      )}

      <div className="md:hidden h-20" />
      <Foot />
    </>
  );
}
