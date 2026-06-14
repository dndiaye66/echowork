import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Newspaper, Plus, Trash2, Loader2, AlertCircle, CheckCircle,
  Megaphone, Tag, CalendarDays, Link2, Copy, Check,
} from 'lucide-react';
import EntrepriseLayout from '../../components/EntrepriseLayout';
import { entrepriseService } from '../../services/entrepriseService';

const POST_TYPES = [
  { value: 'ANNONCE', label: 'Annonce', icon: Megaphone, color: 'bg-blue-50 text-blue-600' },
  { value: 'OFFRE', label: 'Offre', icon: Tag, color: 'bg-green-50 text-green-600' },
  { value: 'EVENEMENT', label: 'Événement', icon: CalendarDays, color: 'bg-purple-50 text-purple-600' },
];

function TypeBadge({ type }) {
  const t = POST_TYPES.find((p) => p.value === type) ?? POST_TYPES[0];
  const Icon = t.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${t.color}`}>
      <Icon size={11} /> {t.label}
    </span>
  );
}

function InviteLink({ company }) {
  const [copied, setCopied] = useState(false);
  const url = `${window.location.origin}/companies/${company.slug}?action=review&ref=invite`;

  const copy = async () => {
    await navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 rounded-2xl p-5 mb-6">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-9 h-9 rounded-xl bg-red-100 flex items-center justify-center shrink-0">
          <Link2 size={18} className="text-red-600" />
        </div>
        <div>
          <h3 className="font-semibold text-gray-900 text-sm">Lien d'invitation d'avis</h3>
          <p className="text-xs text-gray-500 mt-0.5">Partagez ce lien à vos clients pour les inviter à laisser un avis.</p>
        </div>
      </div>
      <div className="flex items-center gap-2 bg-white border border-red-100 rounded-xl px-3 py-2.5">
        <span className="flex-1 text-xs text-gray-500 truncate">{url}</span>
        <button
          onClick={copy}
          className="shrink-0 flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white transition-colors"
        >
          {copied ? <Check size={13} /> : <Copy size={13} />}
          {copied ? 'Copié !' : 'Copier'}
        </button>
      </div>
    </div>
  );
}

function PostForm({ companyId, onCreated }) {
  const [form, setForm] = useState({ type: 'ANNONCE', title: '', content: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { setError('Le titre est requis.'); return; }
    if (!form.content.trim() || form.content.length < 20) { setError('Le contenu doit faire au moins 20 caractères.'); return; }
    setSubmitting(true);
    setError('');
    try {
      const post = await entrepriseService.createPost(companyId, form);
      onCreated(post);
      setForm({ type: 'ANNONCE', title: '', content: '' });
    } catch {
      setError('Erreur lors de la publication. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 mb-6">
      <h3 className="font-semibold text-gray-900 text-sm mb-4 flex items-center gap-2">
        <Plus size={16} className="text-red-500" /> Nouvelle publication
      </h3>

      {/* Type selector */}
      <div className="flex gap-2 mb-4 flex-wrap">
        {POST_TYPES.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setForm((f) => ({ ...f, type: value }))}
            className={`flex items-center gap-1.5 text-xs font-medium px-3 py-2 rounded-xl border transition-colors ${
              form.type === value
                ? 'border-red-400 bg-red-50 text-red-700'
                : 'border-gray-200 text-gray-500 hover:border-gray-300'
            }`}
          >
            <Icon size={13} /> {label}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        <input
          type="text"
          placeholder="Titre de la publication *"
          maxLength={100}
          value={form.title}
          onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
        />
        <textarea
          placeholder="Contenu de la publication (min. 20 caractères)..."
          maxLength={1000}
          rows={4}
          value={form.content}
          onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
          className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
        />
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">{form.content.length}/1000</span>
          {error && (
            <span className="flex items-center gap-1 text-xs text-red-600">
              <AlertCircle size={12} /> {error}
            </span>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={submitting}
        className="mt-4 flex items-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
      >
        {submitting ? <Loader2 size={14} className="animate-spin" /> : <Newspaper size={14} />}
        Publier
      </button>
    </form>
  );
}

export default function PublicationsEntreprise() {
  const [searchParams] = useSearchParams();
  const companyId = parseInt(searchParams.get('id'), 10);

  const [companies, setCompanies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(null);
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    entrepriseService.getMyCompanies().then((list) => {
      setCompanies(list);
      const target = list.find((c) => c.id === companyId) ?? list[0] ?? null;
      setSelected(target);
    });
  }, [companyId]);

  const loadPosts = useCallback(async (id) => {
    setLoading(true);
    setError('');
    try {
      const data = await entrepriseService.getPosts(id);
      setPosts(data);
    } catch {
      setError('Impossible de charger les publications.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selected) loadPosts(selected.id);
  }, [selected, loadPosts]);

  const handleCreated = (post) => setPosts((prev) => [post, ...prev]);

  const handleDelete = async (postId) => {
    if (!window.confirm('Supprimer cette publication ?')) return;
    setDeleting(postId);
    try {
      await entrepriseService.deletePost(selected.id, postId);
      setPosts((prev) => prev.filter((p) => p.id !== postId));
      setDeleteSuccess(true);
      setTimeout(() => setDeleteSuccess(false), 2000);
    } catch {
      setError('Erreur lors de la suppression.');
    } finally {
      setDeleting(null);
    }
  };

  return (
    <EntrepriseLayout title="Publications">
      {/* Company selector */}
      {companies.length > 1 && (
        <div className="mb-6">
          <select
            className="border border-gray-200 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 bg-white"
            value={selected?.id ?? ''}
            onChange={(e) => {
              const c = companies.find((x) => x.id === parseInt(e.target.value, 10));
              setSelected(c);
            }}
          >
            {companies.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {selected && <InviteLink company={selected} />}

      {deleteSuccess && (
        <div className="flex items-center gap-2 bg-green-50 text-green-700 border border-green-100 rounded-xl px-4 py-3 text-sm mb-4">
          <CheckCircle size={15} /> Publication supprimée.
        </div>
      )}

      {selected && (
        <PostForm companyId={selected.id} onCreated={handleCreated} />
      )}

      {/* Posts list */}
      <h3 className="font-semibold text-gray-700 text-sm mb-3">
        {posts.length} publication{posts.length !== 1 ? 's' : ''} en ligne
      </h3>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 size={24} className="animate-spin text-red-500" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 text-red-600 text-sm py-8 justify-center">
          <AlertCircle size={16} /> {error}
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm py-14 text-center">
          <Newspaper size={36} className="text-gray-200 mx-auto mb-3" />
          <p className="text-gray-400 text-sm font-medium">Aucune publication pour l'instant.</p>
          <p className="text-gray-300 text-xs mt-1">Créez votre première annonce, offre ou événement.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <TypeBadge type={post.type} />
                    <span className="text-xs text-gray-400">
                      {new Date(post.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                  <h4 className="font-semibold text-gray-900 text-sm leading-snug">{post.title}</h4>
                  <p className="text-sm text-gray-500 mt-1 line-clamp-3 whitespace-pre-line">{post.content}</p>
                </div>
                <button
                  onClick={() => handleDelete(post.id)}
                  disabled={deleting === post.id}
                  className="shrink-0 p-2 hover:bg-red-50 text-gray-300 hover:text-red-500 rounded-lg transition-colors"
                >
                  {deleting === post.id
                    ? <Loader2 size={15} className="animate-spin" />
                    : <Trash2 size={15} />
                  }
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </EntrepriseLayout>
  );
}
