import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/navbar';
import Foot from '../../components/Foot';
import {
  Star, MessageSquare, BarChart3, Shield, CheckCircle,
  ChevronRight, Building2, TrendingUp, Users,
} from 'lucide-react';

const FEATURES = [
  {
    icon: Building2,
    title: 'Gérez votre fiche',
    desc: 'Complétez votre profil : logo, description, horaires, coordonnées, réseaux sociaux et photos.',
  },
  {
    icon: MessageSquare,
    title: 'Répondez aux avis',
    desc: 'Dialoguez publiquement avec vos clients et montrez que vous êtes à l\'écoute.',
  },
  {
    icon: BarChart3,
    title: 'Suivez vos statistiques',
    desc: 'Visualisez l\'évolution de votre note, le volume d\'avis et les tendances.',
  },
  {
    icon: Shield,
    title: 'Fiche vérifiée',
    desc: 'Obtenez le badge entreprise vérifiée pour renforcer la confiance de vos clients.',
  },
];

const STEPS = [
  { num: '1', title: 'Créez votre compte', desc: 'Inscrivez-vous gratuitement en quelques secondes.' },
  { num: '2', title: 'Réclamez votre fiche', desc: 'Recherchez votre entreprise et réclamez-en la gestion.' },
  { num: '3', title: 'Complétez votre profil', desc: 'Ajoutez vos informations, photos et horaires.' },
  { num: '4', title: 'Engagez vos clients', desc: 'Répondez aux avis et gérez votre réputation.' },
];

export default function LandingEntreprise() {
  const { isAuthenticated } = useAuth();

  const ctaLink = isAuthenticated
    ? '/espace-entreprise/rejoindre'
    : '/signup?next=/espace-entreprise/rejoindre';

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      {/* Hero */}
      <section className="bg-gradient-to-br from-gray-900 to-gray-800 text-white py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-red-600/20 text-red-400 text-sm font-medium px-4 py-1.5 rounded-full mb-6">
            <Star size={14} fill="currentColor" />
            Espace Entreprise
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 leading-tight">
            Prenez le contrôle de<br />
            <span className="text-red-400">votre réputation en ligne</span>
          </h1>
          <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto">
            Rejoignez des centaines d'entreprises sénégalaises qui utilisent EchoWork
            pour gérer leurs avis clients et renforcer leur crédibilité.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to={ctaLink}
              className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3.5 rounded-full transition-colors"
            >
              Essayer 1 mois gratuit
              <ChevronRight size={18} />
            </Link>
            <Link
              to="#comment-ca-marche"
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-semibold px-8 py-3.5 rounded-full transition-colors"
            >
              Comment ça marche ?
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="border-b border-gray-100 py-10 px-4">
        <div className="max-w-4xl mx-auto grid grid-cols-3 gap-6 text-center">
          {[
            { value: '500+', label: 'Entreprises référencées' },
            { value: '10k+', label: 'Avis clients' },
            { value: '4.2', label: 'Note moyenne' },
          ].map(({ value, label }) => (
            <div key={label}>
              <p className="text-3xl font-bold text-red-600">{value}</p>
              <p className="text-sm text-gray-500 mt-1">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-3">
            Tout ce dont vous avez besoin
          </h2>
          <p className="text-gray-500 text-center mb-10">
            Un espace dédié pour gérer votre présence sur EchoWork.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                  <Icon size={22} className="text-red-600" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section id="comment-ca-marche" className="py-16 px-4">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-10">
            Comment ça marche ?
          </h2>
          <div className="space-y-6">
            {STEPS.map(({ num, title, desc }) => (
              <div key={num} className="flex gap-5 items-start">
                <div className="w-10 h-10 rounded-full bg-red-600 text-white flex items-center justify-center font-bold text-lg shrink-0">
                  {num}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 mb-1">{title}</h3>
                  <p className="text-gray-500 text-sm">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Plans */}
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 text-center mb-2">Nos offres</h2>
          <p className="text-gray-500 text-center mb-2">1 mois d'essai gratuit sur tous les plans.</p>
          <p className="text-xs text-gray-400 text-center mb-10">Sans engagement — résiliable à tout moment.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                plan: 'Basic',
                price: 'Gratuit',
                features: ["Fiche entreprise publique", "Réception d'avis clients", "Réponse aux avis"],
                highlighted: false,
                free: true,
              },
              {
                plan: 'Pro',
                price: '15 000',
                features: ['Tout le Basic', 'Badge vérifié', 'Galerie photos illimitée', 'Statistiques avancées', 'Analyse IA des avis'],
                highlighted: true,
              },
              {
                plan: 'Premium',
                price: '25 000',
                features: ['Tout le Pro', 'Priorité dans les résultats', 'Support prioritaire 24/7', 'Rapport mensuel dédié'],
                highlighted: false,
              },
            ].map(({ plan, price, features, highlighted, free }) => (
              <div
                key={plan}
                className={`rounded-2xl p-6 border ${
                  highlighted
                    ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-200'
                    : 'bg-white border-gray-100 shadow-sm'
                }`}
              >
                <h3 className={`font-bold text-lg mb-1 ${highlighted ? 'text-white' : 'text-gray-900'}`}>{plan}</h3>
                <div className="mb-1">
                  <span className={`text-2xl font-bold ${highlighted ? 'text-white' : 'text-gray-900'}`}>{price}</span>
                  {!free && <span className={`text-sm ml-1 ${highlighted ? 'text-red-200' : 'text-gray-400'}`}>FCFA/mois</span>}
                </div>
                <p className={`text-xs mb-5 ${highlighted ? 'text-red-200' : 'text-gray-400'}`}>
                  {free ? 'Toujours gratuit' : '1 mois offert à l\'inscription'}
                </p>
                <ul className="space-y-2 mb-6">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <CheckCircle size={15} className={highlighted ? 'text-red-200' : 'text-red-500'} />
                      <span className={highlighted ? 'text-red-100' : 'text-gray-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={ctaLink}
                  className={`block text-center text-sm font-semibold py-2.5 rounded-full transition-colors ${
                    highlighted
                      ? 'bg-white text-red-600 hover:bg-red-50'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  Essayer {plan} gratuitement
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="py-16 px-4 bg-gradient-to-br from-gray-900 to-gray-800 text-white text-center">
        <h2 className="text-2xl font-bold mb-4">Prêt à gérer votre réputation ?</h2>
        <p className="text-gray-400 mb-8">1 mois d'essai offert — sans carte bancaire, sans engagement.</p>
        <Link
          to={ctaLink}
          className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-8 py-3.5 rounded-full transition-colors"
        >
          Commencer maintenant
          <ChevronRight size={18} />
        </Link>
      </section>

      <Foot />
    </div>
  );
}
