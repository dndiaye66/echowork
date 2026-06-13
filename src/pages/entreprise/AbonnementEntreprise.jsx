import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CreditCard, Check, Zap, Crown, Star, Loader2, AlertCircle,
  Building2, ChevronRight, Shield, BarChart3, Sparkles, MessageSquare,
  Image, Globe, Phone as PhoneIcon,
} from 'lucide-react';
import EntrepriseLayout from '../../components/EntrepriseLayout';
import { entrepriseService } from '../../services/entrepriseService';

const PLANS = [
  {
    key: 'FREE',
    label: 'Gratuit',
    price: '0',
    period: 'toujours',
    icon: Star,
    color: 'gray',
    description: 'Pour démarrer et gérer votre réputation en ligne.',
    features: [
      'Fiche entreprise publique',
      'Réception d\'avis clients',
      'Réponse aux avis',
      'Statistiques de base',
      '3 photos max',
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
    price: '15 000',
    period: 'mois',
    icon: Zap,
    color: 'red',
    popular: true,
    description: 'Pour les entreprises qui veulent se démarquer.',
    features: [
      'Tout du plan Gratuit',
      'Badge "Vérifié"',
      'Galerie photos illimitée',
      'Statistiques avancées',
      'Analyse IA des avis',
      'Priorité dans les résultats',
    ],
    missing: [
      'Support prioritaire 24/7',
      'Gestion multi-agences illimitée',
    ],
  },
  {
    key: 'PREMIUM',
    label: 'Premium',
    price: '35 000',
    period: 'mois',
    icon: Crown,
    color: 'amber',
    description: 'La solution complète pour les grandes entreprises.',
    features: [
      'Tout du plan Pro',
      'Support prioritaire 24/7',
      'Gestion multi-agences illimitée',
      'Intégration API',
      'Rapport mensuel détaillé',
      'Gestionnaire de compte dédié',
    ],
    missing: [],
  },
];

const PLAN_ORDER = { FREE: 0, PRO: 1, PREMIUM: 2 };

function PlanCard({ plan, currentPlan, company, onUpgrade }) {
  const Icon = plan.icon;
  const isCurrentPlan = currentPlan === plan.key;
  const isUpgrade = PLAN_ORDER[plan.key] > PLAN_ORDER[currentPlan ?? 'FREE'];
  const isDowngrade = PLAN_ORDER[plan.key] < PLAN_ORDER[currentPlan ?? 'FREE'];

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
        <div className="flex items-end gap-1">
          <span className="text-3xl font-extrabold text-gray-900">{plan.price}</span>
          {plan.price !== '0' && (
            <span className="text-sm text-gray-400 mb-1">FCFA / {plan.period}</span>
          )}
          {plan.price === '0' && (
            <span className="text-sm text-gray-400 mb-1">({plan.period})</span>
          )}
        </div>
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
          onClick={() => !isCurrentPlan && isUpgrade && onUpgrade(plan.key)}
          disabled={isCurrentPlan || isDowngrade}
          className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-colors ${btnClass}`}
        >
          {isCurrentPlan
            ? 'Plan actuel'
            : isUpgrade
            ? `Passer au plan ${plan.label}`
            : 'Non disponible'}
        </button>
      </div>
    </div>
  );
}

export default function AbonnementEntreprise() {
  const [searchParams] = useSearchParams();
  const companyId = parseInt(searchParams.get('id'), 10);

  const [companies, setCompanies] = useState([]);
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(true);
  const [upgradeModal, setUpgradeModal] = useState(null);

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

        {/* Company selector (if multiple) */}
        {companies.length > 1 && (
          <div className="flex gap-2 flex-wrap">
            {companies.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelected(c)}
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
                {currentPlan}
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
                  <p className={`text-sm font-medium ${
                    new Date(sub.endDate) < new Date() ? 'text-red-600' : 'text-gray-700'
                  }`}>{formatDate(sub.endDate)}</p>
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

          {currentPlan === 'FREE' && (
            <div className="mt-4 flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
              <Sparkles size={18} className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700">Passez à la vitesse supérieure</p>
                <p className="text-xs text-red-600 mt-0.5">
                  Débloquez l'analyse IA, le badge vérifié et les statistiques avancées avec le plan Pro.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Plans comparison */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-1">Choisissez votre plan</h2>
          <p className="text-sm text-gray-500 mb-5">Tous les prix sont en FCFA, hors taxes.</p>

          <div className="grid md:grid-cols-3 gap-5">
            {PLANS.map((plan) => (
              <PlanCard
                key={plan.key}
                plan={plan}
                currentPlan={currentPlan}
                company={selected}
                onUpgrade={(planKey) => setUpgradeModal(planKey)}
              />
            ))}
          </div>
        </div>

        {/* Features breakdown */}
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-900 mb-5">Ce qui est inclus dans chaque plan</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { icon: Building2, label: 'Fiche entreprise', free: true, pro: true, premium: true, desc: 'Page publique avec avis, note, infos' },
              { icon: MessageSquare, label: 'Réponse aux avis', free: true, pro: true, premium: true, desc: 'Répondez publiquement aux clients' },
              { icon: Shield, label: 'Badge Vérifié', free: false, pro: true, premium: true, desc: 'Marque de confiance sur votre fiche' },
              { icon: Image, label: 'Galerie photos', free: '3 max', pro: 'Illimité', premium: 'Illimité', desc: 'Photos de votre établissement' },
              { icon: BarChart3, label: 'Statistiques', free: 'Basiques', pro: 'Avancées', premium: 'Avancées', desc: 'Évolution de votre réputation' },
              { icon: Sparkles, label: 'Analyse IA', free: false, pro: true, premium: true, desc: 'Résumé et insights de vos avis' },
              { icon: Globe, label: 'Priorité résultats', free: false, pro: true, premium: true, desc: 'Apparaissez en tête des listes' },
              { icon: Crown, label: 'Support dédié', free: false, pro: false, premium: true, desc: 'Gestionnaire de compte personnel' },
            ].map(({ icon: Icon, label, free, pro, premium, desc }) => (
              <div key={label} className="flex items-start gap-3 py-3 border-b border-gray-50 last:border-0">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                  <Icon size={15} className="text-gray-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900">{label}</p>
                  <p className="text-xs text-gray-400">{desc}</p>
                </div>
                <div className="flex gap-3 shrink-0 text-xs font-medium">
                  <span className={free === true ? 'text-green-600' : free === false ? 'text-gray-300' : 'text-gray-600'}>
                    {free === true ? '✓' : free === false ? '–' : free}
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
            <span className="text-gray-500">FREE</span>
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
                Notre équipe vous accompagne pour trouver le plan adapté à votre entreprise.
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

      {/* Upgrade modal */}
      {upgradeModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="text-center mb-5">
              <div className="w-14 h-14 rounded-2xl bg-red-50 flex items-center justify-center mx-auto mb-3">
                <CreditCard size={26} className="text-red-600" />
              </div>
              <h3 className="font-bold text-gray-900 text-lg">
                Passer au plan {upgradeModal}
              </h3>
              <p className="text-sm text-gray-500 mt-1">
                Cette fonctionnalité sera bientôt disponible. Contactez-nous pour activer votre abonnement manuellement.
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setUpgradeModal(null)}
                className="flex-1 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Annuler
              </button>
              <a
                href={`mailto:contact@echowork.net?subject=Abonnement EchoWork — Plan ${upgradeModal}`}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm font-semibold text-center flex items-center justify-center gap-2 transition-colors"
              >
                Contacter <ChevronRight size={14} />
              </a>
            </div>
          </div>
        </div>
      )}
    </EntrepriseLayout>
  );
}
