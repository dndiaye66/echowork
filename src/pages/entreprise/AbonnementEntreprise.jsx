import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CreditCard, Check, Zap, Crown, Star, Loader2, AlertCircle,
  Building2, ChevronRight, Shield, BarChart3, Sparkles, MessageSquare,
  Image, Globe, Phone as PhoneIcon, X, CheckCircle, ExternalLink,
} from 'lucide-react';
import EntrepriseLayout from '../../components/EntrepriseLayout';
import { entrepriseService } from '../../services/entrepriseService';

const WAVE_BASE = 'https://pay.wave.com/m/M_sn_O8Lki9HsJfSh/c/sn/?amount=';

const MONTHLY_PRICES = { FREE: 25000, PRO: 35000, PREMIUM: 50000 };
// Annual = 10 months (2 months free)
const ANNUAL_PRICES  = { FREE: 250000, PRO: 350000, PREMIUM: 500000 };

const PLANS = [
  {
    key: 'FREE',
    label: 'Basic',
    icon: Star,
    color: 'gray',
    description: 'Pour démarrer et gérer votre réputation en ligne.',
    features: [
      'Fiche entreprise publique',
      'Réception d\'avis clients',
      'Réponse aux avis',
      'Statistiques de base',
      '5 photos max',
    ],
    missing: [
      'Analyse IA des avis',
      'Badge "Vérifié"',
      'Statistiques avancées',
      'Priorité dans les résultats',
      'Support prioritaire',
    ],
  },
  {
    key: 'PRO',
    label: 'Pro',
    icon: Zap,
    color: 'red',
    popular: true,
    description: 'Pour les entreprises qui veulent se démarquer.',
    features: [
      'Tout du plan Basic',
      'Badge "Vérifié"',
      'Galerie photos illimitée',
      'Statistiques avancées',
      'Analyse IA des avis',
      'Priorité dans les résultats',
    ],
    missing: [
      'Support prioritaire 24/7',
      'Rapport mensuel dédié',
    ],
  },
  {
    key: 'PREMIUM',
    label: 'Premium',
    icon: Crown,
    color: 'amber',
    description: 'La solution complète pour les grandes entreprises.',
    features: [
      'Tout du plan Pro',
      'Support prioritaire 24/7',
      'Rapport mensuel détaillé',
      'Gestionnaire de compte dédié',
    ],
    missing: [],
  },
];

const PLAN_ORDER = { FREE: 0, PRO: 1, PREMIUM: 2 };

function fmt(n) {
  return n.toLocaleString('fr-FR');
}

// ── Wave Payment Modal ────────────────────────────────────────────
function WaveModal({ plan, period, company, onClose, onSuccess }) {
  const amount = period === 'annual' ? ANNUAL_PRICES[plan.key] : MONTHLY_PRICES[plan.key];
  const waveUrl = `${WAVE_BASE}${amount}`;

  const [wavePaid, setWavePaid] = useState(false);
  const [wavePhone, setWavePhone] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleConfirm = async () => {
    if (!wavePhone.trim()) return;
    setSaving(true);
    setError('');
    try {
      await entrepriseService.subscribe(company.id, {
        plan: plan.key,
        period,
        amount,
        wavePhone: wavePhone.trim(),
      });
      onSuccess();
    } catch (err) {
      setError(err?.response?.data?.message || 'Erreur lors de la confirmation. Réessayez.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center">
              <CreditCard size={16} className="text-blue-600" />
            </div>
            <h3 className="font-bold text-gray-900">
              Paiement — {plan.label} {period === 'annual' ? 'Annuel' : 'Mensuel'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Amount summary */}
          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between">
            <div>
              <p className="text-xs text-gray-500 mb-0.5">Montant à payer</p>
              <p className="text-2xl font-extrabold text-gray-900">{fmt(amount)} <span className="text-base font-medium text-gray-400">FCFA</span></p>
              <p className="text-xs text-gray-400 mt-0.5">
                {period === 'annual'
                  ? `${fmt(MONTHLY_PRICES[plan.key])} FCFA × 10 mois (2 mois offerts)`
                  : `1 mois payé + 1 mois offert`}
              </p>
            </div>
            <div className={`text-xs font-bold px-3 py-1.5 rounded-full ${
              plan.color === 'red' ? 'bg-red-50 text-red-600' :
              plan.color === 'amber' ? 'bg-amber-50 text-amber-700' :
              'bg-gray-100 text-gray-600'
            }`}>
              {plan.label}
            </div>
          </div>

          {!wavePaid ? (
            <>
              <div className="text-center space-y-3">
                <p className="text-sm text-gray-600">
                  Cliquez sur le bouton ci-dessous pour payer via Wave.
                  Revenez ensuite confirmer votre paiement.
                </p>
                <a
                  href={waveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setTimeout(() => setWavePaid(true), 1500)}
                  className="flex items-center justify-center gap-2 w-full bg-[#1BBAE1] hover:bg-[#17a8cc] text-white font-bold py-3.5 rounded-xl transition-colors text-base"
                >
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/>
                  </svg>
                  Payer {fmt(amount)} FCFA avec Wave
                  <ExternalLink size={16} />
                </a>
                <button
                  onClick={() => setWavePaid(true)}
                  className="text-xs text-gray-400 hover:text-gray-600 underline"
                >
                  J'ai déjà effectué le paiement
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-xl px-4 py-3 text-sm text-green-700">
                <CheckCircle size={16} className="shrink-0" />
                Paiement Wave effectué ? Confirmez avec votre numéro Wave.
              </div>

              {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-600 rounded-xl px-3 py-2.5 text-sm">
                  <AlertCircle size={15} className="shrink-0" /> {error}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                  Numéro Wave utilisé pour le paiement
                </label>
                <input
                  type="tel"
                  value={wavePhone}
                  onChange={(e) => setWavePhone(e.target.value)}
                  placeholder="+221 77 000 00 00"
                  className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-xs text-gray-400 mt-1">
                  Ce numéro nous permet de vérifier votre paiement.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setWavePaid(false)}
                  className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
                >
                  Retour
                </button>
                <button
                  onClick={handleConfirm}
                  disabled={saving || !wavePhone.trim()}
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
                >
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <CheckCircle size={15} />}
                  Confirmer le paiement
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Plan Card ─────────────────────────────────────────────────────
function PlanCard({ plan, currentPlan, billingPeriod, onSubscribe }) {
  const Icon = plan.icon;
  const isCurrentPlan = currentPlan === plan.key;
  const isUpgrade = PLAN_ORDER[plan.key] > PLAN_ORDER[currentPlan ?? 'FREE'];
  const isDowngrade = PLAN_ORDER[plan.key] < PLAN_ORDER[currentPlan ?? 'FREE'];
  const monthlyPrice = MONTHLY_PRICES[plan.key];
  const annualPrice  = ANNUAL_PRICES[plan.key];
  const displayPrice = billingPeriod === 'annual' ? annualPrice : monthlyPrice;
  const monthlyEquiv = billingPeriod === 'annual' ? Math.round(annualPrice / 12) : monthlyPrice;

  const borderClass = plan.popular
    ? 'border-red-500 ring-2 ring-red-500 ring-offset-2'
    : 'border-gray-200';

  const iconBg = {
    gray: 'bg-gray-100 text-gray-500',
    red: 'bg-red-100 text-red-600',
    amber: 'bg-amber-100 text-amber-600',
  }[plan.color];

  const btnClass = isCurrentPlan
    ? 'bg-gray-100 text-gray-400 cursor-default'
    : isUpgrade
    ? 'bg-red-600 hover:bg-red-700 text-white'
    : 'border border-gray-300 text-gray-600 hover:bg-gray-50';

  return (
    <div className={`relative bg-white rounded-2xl border ${borderClass} shadow-sm flex flex-col`}>
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full">
            Le plus populaire
          </span>
        </div>
      )}

      <div className="p-6 border-b border-gray-100">
        <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center mb-3`}>
          <Icon size={20} />
        </div>
        <h3 className="font-bold text-gray-900 text-lg">{plan.label}</h3>
        <p className="text-xs text-gray-500 mt-0.5 mb-3">{plan.description}</p>

        {billingPeriod === 'annual' ? (
          <div>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-extrabold text-gray-900">{fmt(annualPrice)}</span>
              <span className="text-sm text-gray-400 mb-1">FCFA / an</span>
            </div>
            <p className="text-xs text-gray-400">soit {fmt(monthlyEquiv)} FCFA / mois</p>
            <span className="inline-block mt-1.5 text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full">
              2 mois offerts
            </span>
          </div>
        ) : (
          <div>
            <div className="flex items-end gap-1">
              <span className="text-3xl font-extrabold text-gray-900">{fmt(monthlyPrice)}</span>
              <span className="text-sm text-gray-400 mb-1">FCFA / mois</span>
            </div>
            <span className="inline-block mt-1.5 text-xs bg-green-50 text-green-700 font-semibold px-2 py-0.5 rounded-full">
              1 mois offert
            </span>
          </div>
        )}
      </div>

      <div className="p-6 flex-1 space-y-2">
        {plan.features.map((f) => (
          <div key={f} className="flex items-start gap-2 text-sm text-gray-700">
            <Check size={15} className="text-green-500 mt-0.5 shrink-0" />
            {f}
          </div>
        ))}
        {plan.missing.map((f) => (
          <div key={f} className="flex items-start gap-2 text-sm text-gray-400 line-through">
            <div className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            {f}
          </div>
        ))}
      </div>

      <div className="p-6 pt-0">
        <button
          onClick={() => !isCurrentPlan && isUpgrade && onSubscribe(plan)}
          disabled={isCurrentPlan || isDowngrade}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${btnClass}`}
        >
          {isCurrentPlan
            ? 'Plan actuel'
            : isUpgrade
            ? `Payer avec Wave`
            : 'Non disponible'}
        </button>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────
export default function AbonnementEntreprise() {
  const [searchParams] = useSearchParams();
  const companyId = parseInt(searchParams.get('id'), 10);

  const [companies, setCompanies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [billingPeriod, setBillingPeriod] = useState('monthly');
  const [paymentModal, setPaymentModal] = useState(null); // { plan }
  const [successPlan, setSuccessPlan] = useState(null);

  useEffect(() => {
    entrepriseService.getMyCompanies()
      .then((list) => {
        setCompanies(list);
        if (list.length > 0) {
          const initial = !isNaN(companyId)
            ? list.find((c) => c.id === companyId) ?? list[0]
            : list[0];
          setSelected(initial);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [companyId]);

  const handleSuccess = () => {
    setSuccessPlan(paymentModal?.plan);
    setPaymentModal(null);
    // Refresh company data
    entrepriseService.getMyCompanies().then((list) => {
      setCompanies(list);
      const refreshed = list.find((c) => c.id === selected?.id);
      if (refreshed) setSelected(refreshed);
    });
  };

  const currentPlan = selected?.subscription?.plan ?? 'FREE';
  const sub = selected?.subscription;

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }) : '—';

  if (loading) {
    return (
      <EntrepriseLayout title="Abonnement">
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin text-red-500" />
        </div>
      </EntrepriseLayout>
    );
  }

  if (!selected) {
    return (
      <EntrepriseLayout title="Abonnement">
        <div className="max-w-lg mx-auto text-center py-20">
          <Building2 size={48} className="mx-auto text-gray-200 mb-4" />
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Aucune entreprise rattachée</h2>
          <p className="text-gray-500 text-sm">Réclamez une fiche pour gérer votre abonnement.</p>
        </div>
      </EntrepriseLayout>
    );
  }

  return (
    <EntrepriseLayout title="Abonnement">
      <div className="max-w-4xl space-y-8">

        {/* Success banner */}
        {successPlan && (
          <div className="flex items-center gap-3 bg-green-50 border border-green-100 rounded-xl px-5 py-4 text-green-700">
            <CheckCircle size={20} className="shrink-0" />
            <div>
              <p className="font-semibold">Paiement enregistré — Plan {successPlan.label} activé !</p>
              <p className="text-sm text-green-600 mt-0.5">Votre abonnement sera confirmé après vérification de votre paiement Wave.</p>
            </div>
          </div>
        )}

        {/* Company selector */}
        {companies.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {companies.map((c) => (
              <button
                key={c.id}
                onClick={() => { setSelected(c); setSuccessPlan(null); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  selected?.id === c.id
                    ? 'bg-red-50 border-red-300 text-red-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
              >
                <Building2 size={14} />
                {c.name}
              </button>
            ))}
          </div>
        )}

        {/* Current plan status */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Entreprise</p>
              <h2 className="font-bold text-gray-900 text-xl">{selected.name}</h2>
            </div>
            <div className="text-right">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Plan actuel</p>
              <span className={`inline-flex items-center gap-1.5 font-bold text-lg px-3 py-1 rounded-full ${
                currentPlan === 'PREMIUM'
                  ? 'bg-amber-50 text-amber-700'
                  : currentPlan === 'PRO'
                  ? 'bg-red-50 text-red-700'
                  : 'bg-gray-100 text-gray-600'
              }`}>
                {currentPlan === 'PREMIUM' && <Crown size={16} />}
                {currentPlan === 'PRO' && <Zap size={16} />}
                {currentPlan === 'FREE' && <Star size={16} />}
                {currentPlan === 'FREE' ? 'Basic' : currentPlan}
              </span>
            </div>
          </div>

          {sub && (
            <div className="mt-4 pt-4 border-t border-gray-50 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Début</p>
                <p className="text-sm font-medium text-gray-700">{formatDate(sub.startDate)}</p>
              </div>
              {sub.endDate && (
                <div>
                  <p className="text-xs text-gray-400 mb-0.5">Expiration</p>
                  <p className={`text-sm font-medium ${new Date(sub.endDate) < new Date() ? 'text-red-600' : 'text-gray-700'}`}>
                    {formatDate(sub.endDate)}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Statut</p>
                <span className={`text-sm font-medium ${sub.isActive ? 'text-green-600' : 'text-red-500'}`}>
                  {sub.isActive ? 'Actif' : 'Inactif'}
                </span>
              </div>
            </div>
          )}

          <div className="mt-4 flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl px-4 py-3">
            <CreditCard size={18} className="text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-blue-700">Paiement via Wave</p>
              <p className="text-xs text-blue-600 mt-0.5">
                1 mois offert sur tous les plans — sans engagement, résiliable à tout moment.
              </p>
            </div>
          </div>
        </section>

        {/* Billing toggle */}
        <div>
          <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Choisissez votre plan</h2>
              <p className="text-sm text-gray-500">Prix en FCFA, hors taxes.</p>
            </div>

            <div className="flex items-center bg-gray-100 rounded-xl p-1 gap-1">
              <button
                onClick={() => setBillingPeriod('monthly')}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  billingPeriod === 'monthly'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Mensuel
              </button>
              <button
                onClick={() => setBillingPeriod('annual')}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                  billingPeriod === 'annual'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Annuel
                <span className="bg-green-100 text-green-700 text-xs font-bold px-1.5 py-0.5 rounded-full">
                  -17%
                </span>
              </button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-5">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.key}
                plan={plan}
                currentPlan={currentPlan}
                billingPeriod={billingPeriod}
                onSubscribe={(p) => setPaymentModal({ plan: p })}
              />
            ))}
          </div>
        </div>

        {/* Features breakdown */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Ce qui est inclus dans chaque plan</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Building2, label: 'Fiche entreprise', basic: true, pro: true, premium: true, desc: 'Page publique avec avis, note, infos' },
              { icon: MessageSquare, label: 'Réponse aux avis', basic: true, pro: true, premium: true, desc: 'Répondez publiquement aux clients' },
              { icon: Shield, label: 'Badge Vérifié', basic: false, pro: true, premium: true, desc: 'Marque de confiance sur votre fiche' },
              { icon: Image, label: 'Galerie photos', basic: '5 max', pro: 'Illimité', premium: 'Illimité', desc: 'Photos de votre établissement' },
              { icon: BarChart3, label: 'Statistiques', basic: 'Basiques', pro: 'Avancées', premium: 'Avancées', desc: 'Évolution de votre réputation' },
              { icon: Sparkles, label: 'Analyse IA', basic: false, pro: true, premium: true, desc: 'Résumé et insights de vos avis' },
              { icon: Globe, label: 'Priorité résultats', basic: false, pro: true, premium: true, desc: 'Apparaissez en tête des listes' },
              { icon: Crown, label: 'Support dédié', basic: false, pro: false, premium: true, desc: 'Gestionnaire de compte personnel' },
            ].map(({ icon: Icon, label, basic, pro, premium, desc }) => (
              <div key={label} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <div className="flex gap-3 shrink-0 text-xs font-medium">
                  <span className={basic === true ? 'text-green-600' : basic === false ? 'text-gray-300' : 'text-gray-600'}>
                    {basic === true ? '✓' : basic === false ? '–' : basic}
                  </span>
                  <span className={pro === true ? 'text-red-500' : pro === false ? 'text-gray-300' : 'text-red-500'}>
                    {pro === true ? '✓' : pro === false ? '–' : pro}
                  </span>
                  <span className={premium === true ? 'text-amber-600' : premium === false ? 'text-gray-300' : 'text-amber-600'}>
                    {premium === true ? '✓' : premium === false ? '–' : premium}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="flex gap-3 justify-end mt-3 text-xs font-bold">
            <span className="text-gray-500">BASIC</span>
            <span className="text-red-600">PRO</span>
            <span className="text-amber-600">PREMIUM</span>
          </div>
        </section>

        {/* Contact CTA */}
        <section className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl p-6 text-white">
          <div className="flex items-start justify-between gap-6 flex-wrap">
            <div>
              <h2 className="font-bold text-lg mb-1">Besoin d'aide pour choisir ?</h2>
              <p className="text-gray-400 text-sm">
                Notre équipe vous accompagne pour trouver le plan adapté.
              </p>
            </div>
            <a
              href="mailto:contact@echowork.net"
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-colors text-sm shrink-0"
            >
              <PhoneIcon size={15} />
              Nous contacter
            </a>
          </div>
        </section>
      </div>

      {/* Wave payment modal */}
      {paymentModal && (
        <WaveModal
          plan={paymentModal.plan}
          period={billingPeriod}
          company={selected}
          onClose={() => setPaymentModal(null)}
          onSuccess={handleSuccess}
        />
      )}
    </EntrepriseLayout>
  );
}
