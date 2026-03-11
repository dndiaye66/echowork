import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User, Mail, Phone, Star, FileText, Settings, LogOut,
  ChevronRight, CheckCircle2, Clock, XCircle, Edit3, Lock,
  Eye, EyeOff, Save, AlertCircle, ThumbsUp, ThumbsDown,
} from 'lucide-react';
import axios from '../api/Config';
import { useAuth } from '../contexts/AuthContext';
import Navbar from '../components/navbar';

/* ── Star rating display ── */
function Stars({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          size={14}
          className={s <= rating ? 'text-red-500 fill-red-500' : 'text-gray-200 fill-gray-200'}
        />
      ))}
    </div>
  );
}

/* ── Review status badge ── */
function StatusBadge({ status }) {
  const map = {
    APPROVED: { label: 'Publié', icon: CheckCircle2, cls: 'bg-green-50 text-green-700 border-green-200' },
    PENDING:  { label: 'En attente', icon: Clock, cls: 'bg-amber-50 text-amber-700 border-amber-200' },
    REJECTED: { label: 'Rejeté', icon: XCircle, cls: 'bg-red-50 text-red-700 border-red-200' },
  };
  const { label, icon: Icon, cls } = map[status] || map.PENDING;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cls}`}>
      <Icon size={11} />
      {label}
    </span>
  );
}

/* ── Context label ── */
const contextLabel = { CLIENT: 'Client', EMPLOYEE: 'Employé', SUPPLIER: 'Fournisseur', OTHER: 'Autre' };

export default function ProfilePage() {
  const { user, logout, login, token } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState('reviews');

  // Profile data
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Reviews
  const [reviews, setReviews] = useState([]);
  const [reviewsMeta, setReviewsMeta] = useState(null);
  const [reviewsPage, setReviewsPage] = useState(1);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  // Edit profile form
  const [editForm, setEditForm] = useState({ username: '', email: '', phone: '', fullName: '', profileType: 'CLIENT' });
  const [editSaving, setEditSaving] = useState(false);
  const [editMsg, setEditMsg] = useState(null);

  // Change password form
  const [pwdForm, setPwdForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdMsg, setPwdMsg] = useState(null);
  const [showPwd, setShowPwd] = useState({ current: false, new: false, confirm: false });

  // Load profile
  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    axios.get('/users/me').then((res) => {
      setProfile(res.data);
      setEditForm({
        username: res.data.username || '',
        email: res.data.email || '',
        phone: res.data.phone || '',
        fullName: res.data.profile?.fullName || '',
        profileType: res.data.profile?.profileType || 'CLIENT',
      });
    }).finally(() => setProfileLoading(false));
  }, [user, navigate]);

  // Load reviews
  useEffect(() => {
    if (tab !== 'reviews') return;
    setReviewsLoading(true);
    axios.get(`/users/me/reviews?page=${reviewsPage}&limit=8`)
      .then((res) => { setReviews(res.data.data); setReviewsMeta(res.data.meta); })
      .finally(() => setReviewsLoading(false));
  }, [tab, reviewsPage]);

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditMsg(null);
    try {
      const res = await axios.patch('/users/me', editForm);
      setProfile(res.data);
      // Update auth context if username/email changed
      login({ ...user, username: res.data.username, email: res.data.email }, token);
      setEditMsg({ type: 'success', text: 'Profil mis à jour avec succès !' });
    } catch (err) {
      setEditMsg({ type: 'error', text: err.response?.data?.message || 'Erreur lors de la mise à jour.' });
    } finally {
      setEditSaving(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (pwdForm.newPassword !== pwdForm.confirmPassword) {
      setPwdMsg({ type: 'error', text: 'Les mots de passe ne correspondent pas.' });
      return;
    }
    setPwdSaving(true);
    setPwdMsg(null);
    try {
      await axios.patch('/users/me/password', {
        currentPassword: pwdForm.currentPassword,
        newPassword: pwdForm.newPassword,
      });
      setPwdMsg({ type: 'success', text: 'Mot de passe changé avec succès !' });
      setPwdForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      setPwdMsg({ type: 'error', text: err.response?.data?.message || 'Erreur lors du changement.' });
    } finally {
      setPwdSaving(false);
    }
  };

  if (profileLoading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <span className="loading loading-spinner loading-lg text-red-500" />
        </div>
      </>
    );
  }

  const joinDate = profile?.createdAt
    ? new Date(profile.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
    : '';

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto px-4 py-8">

          {/* ── Profile header ── */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white text-3xl font-black uppercase shadow-lg shrink-0">
                {profile?.username?.[0]}
              </div>

              {/* Info */}
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-900 truncate">{profile?.username}</h1>
                  {profile?.isVerified && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 size={11} /> Vérifié
                    </span>
                  )}
                </div>
                {profile?.profile?.fullName && (
                  <p className="text-sm text-gray-500 mb-1">{profile.profile.fullName}</p>
                )}
                <p className="text-sm text-gray-400">Membre depuis {joinDate}</p>
              </div>

              {/* Stats */}
              <div className="flex gap-4 shrink-0">
                <div className="text-center px-4 py-2 bg-gray-50 rounded-xl">
                  <div className="text-2xl font-black text-gray-900">{profile?.stats?.totalReviews ?? 0}</div>
                  <div className="text-xs text-gray-500 mt-0.5">Avis écrits</div>
                </div>
                {profile?.stats?.avgRating && (
                  <div className="text-center px-4 py-2 bg-red-50 rounded-xl">
                    <div className="text-2xl font-black text-red-600">{profile.stats.avgRating}</div>
                    <div className="text-xs text-gray-500 mt-0.5">Note moy.</div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Tabs ── */}
          <div className="flex gap-1 mb-6 bg-white border border-gray-100 rounded-xl p-1 shadow-sm w-fit">
            {[
              { id: 'reviews', label: 'Mes avis', icon: FileText },
              { id: 'settings', label: 'Paramètres', icon: Settings },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  tab === id
                    ? 'bg-red-600 text-white shadow-sm'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* ── Tab: Reviews ── */}
          {tab === 'reviews' && (
            <div>
              {reviewsLoading ? (
                <div className="flex justify-center py-16">
                  <span className="loading loading-spinner loading-md text-red-500" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-12 text-center">
                  <FileText size={40} className="text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 font-medium">Vous n'avez pas encore écrit d'avis.</p>
                  <Link to="/" className="mt-4 inline-block text-sm text-red-600 hover:underline">
                    Découvrir les entreprises
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                      <div className="flex items-start gap-4">
                        {/* Company logo */}
                        <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden shrink-0">
                          {review.company.imageUrl ? (
                            <img src={review.company.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-lg font-bold text-gray-400">{review.company.name[0]}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                            <Link
                              to={`/companies/${review.company.slug}`}
                              className="font-semibold text-gray-900 hover:text-red-600 transition-colors"
                            >
                              {review.company.name}
                            </Link>
                            <StatusBadge status={review.status} />
                          </div>

                          <div className="flex items-center gap-3 mb-2">
                            <Stars rating={review.rating} />
                            <span className="text-xs text-gray-400">
                              {contextLabel[review.context]}
                            </span>
                            <span className="text-xs text-gray-400">
                              {new Date(review.createdAt).toLocaleDateString('fr-FR')}
                            </span>
                          </div>

                          <p className="text-sm text-gray-600 leading-relaxed line-clamp-3">{review.comment}</p>

                          {review.status === 'APPROVED' && (
                            <div className="flex items-center gap-3 mt-2">
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <ThumbsUp size={12} /> {review.upvotes}
                              </span>
                              <span className="flex items-center gap-1 text-xs text-gray-400">
                                <ThumbsDown size={12} /> {review.downvotes}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* Pagination */}
                  {reviewsMeta && reviewsMeta.totalPages > 1 && (
                    <div className="flex justify-center gap-2 pt-4">
                      {Array.from({ length: reviewsMeta.totalPages }, (_, i) => i + 1).map((p) => (
                        <button
                          key={p}
                          onClick={() => setReviewsPage(p)}
                          className={`w-9 h-9 rounded-lg text-sm font-medium transition-all ${
                            p === reviewsPage
                              ? 'bg-red-600 text-white'
                              : 'bg-white border border-gray-200 text-gray-700 hover:border-red-300'
                          }`}
                        >
                          {p}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* ── Tab: Settings ── */}
          {tab === 'settings' && (
            <div className="space-y-6">

              {/* Edit profile */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Edit3 size={18} className="text-red-500" />
                  <h2 className="text-base font-bold text-gray-900">Informations personnelles</h2>
                </div>

                {editMsg && (
                  <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm ${
                    editMsg.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {editMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                    {editMsg.text}
                  </div>
                )}

                <form onSubmit={handleSaveProfile} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nom d'utilisateur</label>
                      <div className="relative">
                        <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="text"
                          value={editForm.username}
                          onChange={(e) => setEditForm({ ...editForm, username: e.target.value })}
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Adresse email</label>
                      <div className="relative">
                        <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="email"
                          value={editForm.email}
                          onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Téléphone</label>
                      <div className="relative">
                        <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                          type="tel"
                          value={editForm.phone}
                          onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                          placeholder="+221 77 000 00 00"
                          className="w-full pl-9 pr-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nom complet</label>
                      <input
                        type="text"
                        value={editForm.fullName}
                        onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                        placeholder="Prénom et nom"
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Type de profil</label>
                      <select
                        value={editForm.profileType}
                        onChange={(e) => setEditForm({ ...editForm, profileType: e.target.value })}
                        className="w-full px-3 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400 bg-white"
                      >
                        <option value="CLIENT">Client</option>
                        <option value="EMPLOYEE">Employé</option>
                        <option value="SUPPLIER">Fournisseur</option>
                        <option value="OTHER">Autre</option>
                      </select>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={editSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 disabled:opacity-60 transition-colors"
                  >
                    {editSaving ? <span className="loading loading-spinner loading-xs" /> : <Save size={15} />}
                    Enregistrer
                  </button>
                </form>
              </div>

              {/* Change password */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center gap-2 mb-5">
                  <Lock size={18} className="text-red-500" />
                  <h2 className="text-base font-bold text-gray-900">Changer le mot de passe</h2>
                </div>

                {pwdMsg && (
                  <div className={`flex items-center gap-2 p-3 rounded-xl mb-4 text-sm ${
                    pwdMsg.type === 'success'
                      ? 'bg-green-50 text-green-700 border border-green-200'
                      : 'bg-red-50 text-red-700 border border-red-200'
                  }`}>
                    {pwdMsg.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                    {pwdMsg.text}
                  </div>
                )}

                <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                  {[
                    { key: 'currentPassword', label: 'Mot de passe actuel' },
                    { key: 'newPassword', label: 'Nouveau mot de passe' },
                    { key: 'confirmPassword', label: 'Confirmer le nouveau mot de passe' },
                  ].map(({ key, label }) => (
                    <div key={key}>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">{label}</label>
                      <div className="relative">
                        <input
                          type={showPwd[key.replace('Password', '').replace('confirm', 'confirm')] ? 'text' : 'password'}
                          value={pwdForm[key]}
                          onChange={(e) => setPwdForm({ ...pwdForm, [key]: e.target.value })}
                          className="w-full pl-3 pr-10 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-red-400"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const k = key === 'currentPassword' ? 'current' : key === 'newPassword' ? 'new' : 'confirm';
                            setShowPwd((p) => ({ ...p, [k]: !p[k] }));
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showPwd[key === 'currentPassword' ? 'current' : key === 'newPassword' ? 'new' : 'confirm']
                            ? <EyeOff size={15} />
                            : <Eye size={15} />}
                        </button>
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={pwdSaving}
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white text-sm font-medium rounded-xl hover:bg-red-700 disabled:opacity-60 transition-colors"
                  >
                    {pwdSaving ? <span className="loading loading-spinner loading-xs" /> : <Save size={15} />}
                    Changer le mot de passe
                  </button>
                </form>
              </div>

              {/* Logout */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-base font-bold text-gray-900">Déconnexion</h2>
                    <p className="text-sm text-gray-500 mt-0.5">Vous serez déconnecté de tous les appareils.</p>
                  </div>
                  <button
                    onClick={() => { logout(); navigate('/'); }}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={15} />
                    Se déconnecter
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>
    </>
  );
}
