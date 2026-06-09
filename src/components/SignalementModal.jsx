import { useState } from 'react';
import { X, AlertTriangle, Loader2, CheckCircle, Shield } from 'lucide-react';
import { reportsService } from '../services/rankingsService';
import { useAuth } from '../contexts/AuthContext';

const CATEGORIES = [
  { value: 'CORRUPTION', label: '🚨 Corruption', desc: 'Demande de pot-de-vin, favoritisme' },
  { value: 'MAUVAIS_ACCUEIL', label: '😠 Mauvais accueil', desc: 'Comportement irrespectueux, discrimination' },
  { value: 'RETARD_ADMINISTRATIF', label: '⏰ Retard administratif', desc: 'Dossiers bloqués, délais non respectés' },
  { value: 'NON_RESPECT_ENGAGEMENT', label: '📋 Non-respect des engagements', desc: 'Promesses non tenues, contrats non honorés' },
  { value: 'AUTRE', label: '📝 Autre', desc: 'Tout autre comportement problématique' },
];

export default function SignalementModal({ company, onClose }) {
  const { isAuthenticated } = useAuth();
  const [form, setForm] = useState({
    category: '',
    description: '',
    evidence: '',
    isAnonymous: false,
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.category) { setError('Veuillez choisir une catégorie.'); return; }
    if (form.description.length < 50) { setError('La description doit contenir au moins 50 caractères.'); return; }

    setSubmitting(true);
    setError('');
    try {
      await reportsService.create({ ...form, companyId: company.id });
      setSuccess(true);
    } catch (err) {
      setError(err?.response?.data?.message ?? 'Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50">
      <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-gray-100 sticky top-0 bg-white">
          <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
            <AlertTriangle size={18} className="text-orange-500" />
          </div>
          <div className="flex-1">
            <h2 className="font-semibold text-gray-900">Signaler un problème</h2>
            <p className="text-xs text-gray-400 truncate">{company.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div className="p-8 text-center">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={28} className="text-green-500" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-2">Signalement envoyé</h3>
            <p className="text-sm text-gray-500 mb-1">
              Votre signalement a été transmis à l'équipe de modération.
            </p>
            <p className="text-xs text-gray-400">Délai de traitement : 48h ouvrées.</p>
            <button onClick={onClose} className="mt-6 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-2.5 rounded-xl text-sm transition-colors">
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 space-y-5">
            {/* Catégorie */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de problème <span className="text-red-500">*</span>
              </label>
              <div className="space-y-2">
                {CATEGORIES.map(({ value, label, desc }) => (
                  <label
                    key={value}
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
                      form.category === value
                        ? 'border-red-400 bg-red-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="category"
                      value={value}
                      checked={form.category === value}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      className="mt-1 accent-red-600"
                    />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{label}</p>
                      <p className="text-xs text-gray-500">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description détaillée <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                rows={4}
                maxLength={2000}
                placeholder="Décrivez les faits de manière précise et objective (min. 50 caractères)..."
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 resize-none"
              />
              <div className="flex justify-between mt-1">
                <span className={`text-xs ${form.description.length < 50 ? 'text-red-400' : 'text-gray-400'}`}>
                  {form.description.length}/2000 {form.description.length < 50 && `(${50 - form.description.length} manquants)`}
                </span>
              </div>
            </div>

            {/* Evidence */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lien vers une preuve <span className="text-gray-400 font-normal">(optionnel)</span>
              </label>
              <input
                type="url"
                value={form.evidence}
                onChange={(e) => setForm((f) => ({ ...f, evidence: e.target.value }))}
                placeholder="https://... (capture d'écran, document en ligne)"
                className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-red-500"
              />
            </div>

            {/* Anonymat */}
            {isAuthenticated && (
              <label className="flex items-start gap-3 p-3 rounded-xl border border-gray-200 cursor-pointer hover:border-gray-300 transition-colors">
                <input
                  type="checkbox"
                  checked={form.isAnonymous}
                  onChange={(e) => setForm((f) => ({ ...f, isAnonymous: e.target.checked }))}
                  className="mt-1 accent-red-600"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 flex items-center gap-1.5">
                    <Shield size={13} className="text-gray-400" />
                    Signaler anonymement
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Votre identité ne sera pas visible par l'entreprise signalée.
                  </p>
                </div>
              </label>
            )}

            {error && (
              <div className="flex items-start gap-2 bg-red-50 text-red-600 border border-red-100 rounded-xl px-3 py-2.5 text-sm">
                <AlertTriangle size={15} className="mt-0.5 shrink-0" /> {error}
              </div>
            )}

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl text-sm transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={submitting}
                className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white font-semibold py-3 rounded-xl text-sm transition-colors">
                {submitting ? <Loader2 size={15} className="animate-spin" /> : <AlertTriangle size={15} />}
                Envoyer le signalement
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
