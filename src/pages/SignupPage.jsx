import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from '../api/Config';
import {
  Eye, EyeOff, User, Mail, Lock, CheckCircle2, ArrowRight,
  Star, Building2, Phone, FileText, X,
} from 'lucide-react';

/* ── Welcome modal shown after successful signup ── */
function WelcomeModal({ username, onClose }) {
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((c) => {
        if (c <= 1) { clearInterval(timer); onClose(); return 0; }
        return c - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Modal card */}
      <div className="relative bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden animate-[fadeInScale_0.4s_ease-out]">

        {/* Red gradient top */}
        <div className="bg-gradient-to-br from-red-600 to-red-700 px-8 pt-10 pb-16 text-center text-white relative overflow-hidden">
          <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-4 -left-6 w-24 h-24 rounded-full bg-white/10" />

          <div className="relative z-10 flex justify-center mb-4">
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
              <Star size={40} className="text-white" fill="currentColor" />
            </div>
          </div>

          <h2 className="relative z-10 text-3xl font-extrabold mb-1">Bienvenue sur EchoWork !</h2>
          <p className="relative z-10 text-white/80 text-base">
            Bonjour <span className="font-bold text-white">@{username}</span> 🎉
          </p>
        </div>

        {/* White bottom content */}
        <div className="px-8 py-6 -mt-8 relative">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-5">
            <div className="flex items-start gap-3">
              <Mail size={18} className="text-amber-600 shrink-0 mt-0.5" />
              <p className="text-amber-800 text-sm leading-relaxed">
                <strong>Un email de confirmation vous a été envoyé.</strong> Veuillez vérifier
                votre boîte mail pour activer votre compte et pouvoir publier des avis.
              </p>
            </div>
          </div>

          <ul className="space-y-2 mb-6">
            {[
              'Consultez des milliers d\'avis vérifiés',
              'Découvrez les meilleures entreprises',
              'Notez dès que votre compte est activé',
            ].map((feat) => (
              <li key={feat} className="flex items-center gap-2 text-sm text-gray-600">
                <CheckCircle2 size={16} className="text-red-500 shrink-0" />
                {feat}
              </li>
            ))}
          </ul>

          <button
            onClick={onClose}
            className="btn btn-primary w-full gap-2 rounded-xl"
          >
            <Sparkles size={16} />
            Continuer
            <span className="ml-auto bg-white/20 rounded-full text-xs px-2 py-0.5">{countdown}s</span>
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fadeInScale {
          from { opacity: 0; transform: scale(0.85) translateY(20px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </div>
  );
}

function CguModal({ onClose, onAccept }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: '85vh' }}>

        {/* Header */}
        <div className="flex items-center gap-3 p-5 border-b border-gray-100 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center">
            <FileText size={18} className="text-red-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900 text-sm">Conditions Générales d'Utilisation</h2>
            <p className="text-xs text-gray-400">EchoWork · Droit sénégalais</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1 px-6 py-5 text-sm text-gray-700 space-y-5">
          <section>
            <h3 className="font-semibold text-gray-900 mb-1">1. Objet</h3>
            <p>Les présentes Conditions Générales d'Utilisation définissent les règles applicables à l'utilisation de la plateforme EchoWork.</p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">2. Inscription</h3>
            <p>L'utilisateur s'engage à fournir des informations exactes lors de son inscription.</p>
            <p className="mt-1">Il est responsable de la confidentialité de ses identifiants de connexion.</p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">3. Publication d'avis</h3>
            <p className="mb-2">Tout utilisateur peut publier un avis concernant une entreprise ou un service après une expérience réelle.</p>
            <p className="mb-1">L'utilisateur s'engage à publier des contenus :</p>
            <ul className="list-disc list-inside space-y-0.5 text-gray-600 pl-1">
              <li>Sincères ;</li>
              <li>Respectueux ;</li>
              <li>Fondés sur des faits réels ;</li>
              <li>Non diffamatoires ;</li>
              <li>Non injurieux ;</li>
              <li>Non discriminatoires.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">4. Contenus interdits</h3>
            <p className="mb-1">Il est interdit de publier :</p>
            <ul className="list-disc list-inside space-y-0.5 text-gray-600 pl-1">
              <li>De fausses informations ;</li>
              <li>Des propos diffamatoires ;</li>
              <li>Des insultes ;</li>
              <li>Des menaces ;</li>
              <li>Des données personnelles de tiers ;</li>
              <li>Des contenus contraires aux lois sénégalaises.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">5. Modération</h3>
            <p className="mb-1">EchoWork se réserve le droit de :</p>
            <ul className="list-disc list-inside space-y-0.5 text-gray-600 pl-1">
              <li>Vérifier certains avis ;</li>
              <li>Demander des justificatifs ;</li>
              <li>Suspendre ou supprimer un contenu litigieux ;</li>
              <li>Suspendre ou supprimer un compte utilisateur.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">6. Droit de réponse des entreprises</h3>
            <p>Toute entreprise référencée sur EchoWork peut répondre aux avis publiés la concernant.</p>
            <p className="mt-1">Elle peut également signaler un contenu qu'elle estime inexact ou contraire aux présentes conditions.</p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">7. Responsabilité</h3>
            <p>Les avis publiés engagent exclusivement leurs auteurs.</p>
            <p className="mt-1">EchoWork agit en qualité d'hébergeur et de modérateur de la plateforme.</p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">8. Suspension de compte</h3>
            <p>Tout manquement aux présentes CGU peut entraîner la suspension ou la suppression du compte concerné.</p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">9. Modification</h3>
            <p>EchoWork se réserve le droit de modifier les présentes CGU à tout moment.</p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">10. Droit applicable</h3>
            <p>Les présentes CGU sont soumises au droit sénégalais.</p>
          </section>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-5 border-t border-gray-100 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl text-sm transition-colors"
          >
            Fermer
          </button>
          <button
            type="button"
            onClick={onAccept}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
          >
            <CheckCircle2 size={15} />
            J'accepte les CGU
          </button>
        </div>
      </div>
    </div>
  );
}

function PolitiqueModal({ onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col" style={{ maxHeight: '85vh' }}>

        <div className="flex items-center gap-3 p-5 border-b border-gray-100 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
            <FileText size={18} className="text-blue-600" />
          </div>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900 text-sm">Politique de Confidentialité</h2>
            <p className="text-xs text-gray-400">EchoWork · Dernière mise à jour : juin 2025</p>
          </div>
          <button type="button" onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 text-sm text-gray-700 space-y-5">
          <section>
            <h3 className="font-semibold text-gray-900 mb-1">1. Présentation</h3>
            <p>EchoWork est une plateforme communautaire permettant aux utilisateurs de consulter, partager et publier des avis sur les entreprises et services présents au Sénégal.</p>
            <p className="mt-1">La protection de vos données personnelles constitue une priorité pour EchoWork. La présente politique explique quelles données sont collectées, pourquoi elles le sont et comment elles sont protégées.</p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">2. Responsable du traitement</h3>
            <p>Le responsable du traitement des données collectées sur la plateforme EchoWork est :</p>
            <div className="mt-2 bg-gray-50 rounded-xl p-3 text-gray-600">
              <p className="font-medium text-gray-800">EchoWork</p>
              <p>Dakar, Sénégal</p>
              <a href="mailto:contact@echowork.net" className="text-red-600 hover:underline">contact@echowork.net</a>
            </div>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">3. Données collectées</h3>
            <p className="font-medium text-gray-800 mb-1">Données d'identification</p>
            <ul className="list-disc list-inside space-y-0.5 text-gray-600 pl-1 mb-3">
              <li>Pseudo</li>
              <li>Adresse e-mail</li>
              <li>Numéro de téléphone (pour les entreprises)</li>
              <li>Photo de profil (facultative)</li>
            </ul>
            <p className="font-medium text-gray-800 mb-1">Données de connexion</p>
            <ul className="list-disc list-inside space-y-0.5 text-gray-600 pl-1 mb-3">
              <li>Adresse IP</li>
              <li>Date et heure de connexion</li>
              <li>Type d'appareil et navigateur utilisé</li>
            </ul>
            <p className="font-medium text-gray-800 mb-1">Données liées aux avis</p>
            <ul className="list-disc list-inside space-y-0.5 text-gray-600 pl-1">
              <li>Notes attribuées</li>
              <li>Commentaires publiés</li>
              <li>Réponses aux avis</li>
              <li>Signalements effectués</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">4. Finalités de la collecte</h3>
            <p className="mb-1">Les données sont utilisées afin de :</p>
            <ul className="list-disc list-inside space-y-0.5 text-gray-600 pl-1">
              <li>Créer et gérer les comptes utilisateurs ;</li>
              <li>Garantir l'authenticité des avis ;</li>
              <li>Prévenir les fraudes et abus ;</li>
              <li>Assurer la sécurité de la plateforme ;</li>
              <li>Produire des statistiques anonymisées ;</li>
              <li>Améliorer les services proposés ;</li>
              <li>Répondre aux obligations légales.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">5. Conservation des données</h3>
            <p>Les données sont conservées uniquement pendant la durée nécessaire à la réalisation des finalités pour lesquelles elles ont été collectées et conformément à la réglementation applicable.</p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">6. Partage des données</h3>
            <p className="mb-1">EchoWork ne vend aucune donnée personnelle.</p>
            <p className="mb-1">Les données peuvent être communiquées :</p>
            <ul className="list-disc list-inside space-y-0.5 text-gray-600 pl-1">
              <li>Aux prestataires techniques assurant l'hébergement et la maintenance ;</li>
              <li>Aux autorités compétentes lorsqu'une obligation légale l'exige.</li>
            </ul>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">7. Sécurité</h3>
            <p>EchoWork met en œuvre des mesures techniques et organisationnelles destinées à protéger les données contre tout accès non autorisé, perte, divulgation ou destruction.</p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-2">8. Vos droits</h3>
            <p className="mb-1">Conformément à la réglementation applicable, vous disposez des droits suivants :</p>
            <ul className="list-disc list-inside space-y-0.5 text-gray-600 pl-1 mb-2">
              <li>Droit d'accès ;</li>
              <li>Droit de rectification ;</li>
              <li>Droit de suppression ;</li>
              <li>Droit d'opposition ;</li>
              <li>Droit à la limitation du traitement.</li>
            </ul>
            <p>Toute demande peut être adressée à : <a href="mailto:contact@echowork.net" className="text-red-600 hover:underline">contact@echowork.net</a></p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">9. Cookies</h3>
            <p>EchoWork utilise des cookies nécessaires au bon fonctionnement de la plateforme ainsi que des cookies de mesure d'audience.</p>
          </section>

          <section>
            <h3 className="font-semibold text-gray-900 mb-1">10. Contact</h3>
            <p>Pour toute question relative à la protection des données personnelles :</p>
            <div className="mt-2 text-gray-600">
              <a href="mailto:contact@echowork.net" className="text-red-600 hover:underline">contact@echowork.net</a>
              <p>Dakar, Sénégal</p>
            </div>
          </section>
        </div>

        <div className="shrink-0 p-5 border-t border-gray-100">
          <button
            type="button"
            onClick={onClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-3 rounded-xl text-sm transition-colors"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}

function PasswordStrength({ password }) {
  const checks = [
    { label: '6 caractères minimum', ok: password.length >= 6 },
    { label: 'Une majuscule', ok: /[A-Z]/.test(password) },
    { label: 'Un chiffre', ok: /[0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.ok).length;
  const colors = ['bg-error', 'bg-warning', 'bg-warning', 'bg-success'];
  const labels = ['', 'Faible', 'Moyen', 'Fort'];

  if (!password) return null;

  return (
    <div className="mt-2 space-y-1">
      <div className="flex gap-1">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`h-1 flex-1 rounded-full transition-all duration-300 ${
              i < score ? colors[score] : 'bg-base-300'
            }`}
          />
        ))}
      </div>
      <p className={`text-xs font-medium ${score === 3 ? 'text-success' : score >= 2 ? 'text-warning' : 'text-error'}`}>
        {labels[score]}
      </p>
      <ul className="space-y-0.5">
        {checks.map((c) => (
          <li key={c.label} className={`text-xs flex items-center gap-1 ${c.ok ? 'text-success' : 'text-base-content/40'}`}>
            <CheckCircle2 size={11} />
            {c.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

function SignupPage() {
  const [accountType, setAccountType] = useState('personal'); // 'personal' | 'company'
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [acceptedCgu, setAcceptedCgu] = useState(false);
  const [showCguModal, setShowCguModal] = useState(false);
  const [showPolitiqueModal, setShowPolitiqueModal] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const isCompany = accountType === 'company';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Adresse email invalide.');
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      setLoading(false);
      return;
    }

    if (isCompany) {
      if (!companyName.trim()) { setError("Le nom de l'entreprise est requis."); setLoading(false); return; }
      if (!firstName.trim()) { setError('Le prénom du responsable est requis.'); setLoading(false); return; }
      if (!lastName.trim()) { setError('Le nom du responsable est requis.'); setLoading(false); return; }
      if (!phone.trim()) { setError('Le numéro de téléphone est requis.'); setLoading(false); return; }
    } else {
      if (!username || username.length < 3) {
        setError('Le pseudo doit contenir au moins 3 caractères.');
        setLoading(false);
        return;
      }
    }

    if (!acceptedCgu) {
      setError('Vous devez accepter les Conditions Générales d\'Utilisation pour vous inscrire.');
      setLoading(false);
      return;
    }

    try {
      const payload = isCompany
        ? { email, password, firstName, lastName, phone, companyName: companyName.trim(), accountType: 'company' }
        : { username, email, password };

      const response = await axios.post('/auth/signup', payload);
      navigate('/verify-otp', {
        state: {
          email,
          accessToken: response.data.accessToken,
          user: response.data.user,
        },
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Inscription échouée. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  /* ── Left-panel content per account type ── */
  const leftContent = isCompany
    ? {
        title: 'Votre vitrine digitale',
        subtitle: 'Inscrivez votre entreprise sur EchoWork et renforcez votre réputation auprès de milliers de Sénégalais.',
        features: [
          'Tableau de bord dédié à votre entreprise',
          'Répondez aux avis de vos clients',
          'Boostez votre visibilité avec des publications',
        ],
      }
    : {
        title: 'Rejoignez la communauté',
        subtitle: 'La plateforme de référence pour noter et évaluer les entreprises au Sénégal.',
        features: [
          'Notez les entreprises en toute transparence',
          'Consultez des milliers d\'avis vérifiés',
          'Trouvez les meilleures entreprises par secteur',
        ],
      };

  return (
    <>
    <div className="min-h-screen flex">

      {/* ── Left panel (branding) ── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-primary via-primary/90 to-secondary flex-col items-center justify-center p-12 text-primary-content">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-64 h-64 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-white blur-3xl" />
        </div>

        <div className="relative z-10 max-w-md text-center">
          <div className="mb-8 flex justify-center">
            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-xl">
              {isCompany
                ? <Building2 size={40} className="text-white" />
                : <Star size={40} className="text-white" fill="currentColor" />
              }
            </div>
          </div>

          <h1 className="text-4xl font-extrabold mb-4 tracking-tight">EchoWork</h1>
          <p className="text-xl font-light mb-8 text-white/80">{leftContent.subtitle}</p>

          <ul className="space-y-4 text-left">
            {leftContent.features.map((feat) => (
              <li key={feat} className="flex items-start gap-3">
                <CheckCircle2 size={20} className="mt-0.5 shrink-0 text-white/90" />
                <span className="text-white/85 text-sm">{feat}</span>
              </li>
            ))}
          </ul>

          <div className="mt-12 pt-8 border-t border-white/20">
            <p className="text-white/60 text-sm">Déjà inscrit ?</p>
            <Link
              to="/login"
              className="mt-2 inline-flex items-center gap-2 text-white font-semibold hover:underline underline-offset-4"
            >
              Se connecter <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>

      {/* ── Right panel (form) ── */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 bg-base-100">
        <div className="w-full max-w-md">

          {/* Mobile logo */}
          <div className="lg:hidden flex justify-center mb-8">
            <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center">
              <Star size={28} className="text-primary" fill="currentColor" />
            </div>
          </div>

          <div className="mb-6">
            <h2 className="text-3xl font-bold text-base-content">Créer un compte</h2>
            <p className="text-base-content/50 mt-1 text-sm">Rejoignez EchoWork gratuitement.</p>
          </div>


          {error && (
            <div className="alert alert-error mb-5 py-3">
              <svg className="shrink-0 w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
              </svg>
              <span className="text-sm">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* Company name — only for company accounts */}
            {isCompany && (
              <div>
                <label className="block text-sm font-medium text-base-content mb-1.5">
                  Nom de l'entreprise <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <input
                    type="text"
                    placeholder="Ex: Société Sénégalaise XYZ"
                    className="input input-bordered w-full pl-9 focus:input-primary transition-all"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required={isCompany}
                  />
                </div>
              </div>
            )}

            {/* Company: Prénom + Nom côte à côte */}
            {isCompany ? (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-base-content mb-1.5">
                    Prénom <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                    <input
                      type="text"
                      placeholder="Prénom"
                      className="input input-bordered w-full pl-9 focus:input-primary transition-all"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-base-content mb-1.5">
                    Nom <span className="text-error">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Nom de famille"
                    className="input input-bordered w-full focus:input-primary transition-all"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                  />
                </div>
              </div>
            ) : (
              /* Personal: Pseudo */
              <div>
                <label className="block text-sm font-medium text-base-content mb-1.5">
                  Pseudo <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <input
                    type="text"
                    placeholder="Votre pseudo"
                    className="input input-bordered w-full pl-9 focus:input-primary transition-all"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required={!isCompany}
                    minLength={3}
                  />
                </div>
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-sm font-medium text-base-content mb-1.5">
                {isCompany ? 'Email professionnel' : 'Adresse email'} <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type="email"
                  placeholder={isCompany ? 'contact@monentreprise.sn' : 'vous@exemple.com'}
                  className="input input-bordered w-full pl-9 focus:input-primary transition-all"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Phone — company only */}
            {isCompany && (
              <div>
                <label className="block text-sm font-medium text-base-content mb-1.5">
                  Numéro de téléphone <span className="text-error">*</span>
                </label>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                  <input
                    type="tel"
                    placeholder="Ex: 77 123 45 67"
                    className="input input-bordered w-full pl-9 focus:input-primary transition-all"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            )}

            {/* Password */}
            <div>
              <label className="block text-sm font-medium text-base-content mb-1.5">
                Mot de passe <span className="text-error">*</span>
              </label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-base-content/40" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Au moins 6 caractères"
                  className="input input-bordered w-full pl-9 pr-10 focus:input-primary transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-base-content/40 hover:text-base-content transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              <PasswordStrength password={password} />
            </div>

            {/* CGU */}
            <label className="flex items-start gap-3 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={acceptedCgu}
                onChange={(e) => setAcceptedCgu(e.target.checked)}
                className="mt-0.5 accent-red-600 shrink-0"
              />
              <span className="text-sm text-gray-600 leading-snug">
                J'ai lu et j'accepte les{' '}
                <button
                  type="button"
                  onClick={() => setShowCguModal(true)}
                  className="text-red-600 hover:underline font-medium underline-offset-2"
                >
                  CGU
                </button>
                {' '}et la{' '}
                <button
                  type="button"
                  onClick={() => setShowPolitiqueModal(true)}
                  className="text-red-600 hover:underline font-medium underline-offset-2"
                >
                  Politique de Confidentialité
                </button>
                {' '}d'EchoWork <span className="text-red-500">*</span>
              </span>
            </label>

            {/* Submit */}
            <button
              type="submit"
              className="btn btn-primary w-full mt-2 gap-2"
              disabled={loading}
            >
              {loading ? (
                <span className="loading loading-spinner loading-sm" />
              ) : (
                <>
                  {isCompany ? 'Inscrire mon entreprise' : 'Créer mon compte'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Bouton Google — uniquement pour compte personnel */}
          {!isCompany && (
            <>
              <div className="flex items-center gap-3 my-5">
                <div className="flex-1 h-px bg-base-300" />
                <span className="text-xs text-base-content/40 font-medium">OU</span>
                <div className="flex-1 h-px bg-base-300" />
              </div>

              <a
                href={`${import.meta.env.VITE_API_URL}/auth/google`}
                className="btn btn-outline w-full gap-3 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-700 font-medium"
              >
                <svg viewBox="0 0 24 24" width="18" height="18">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                </svg>
                S'inscrire avec Google
              </a>
            </>
          )}

          <p className="text-center text-sm text-base-content/50 mt-6">
            Déjà un compte ?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline underline-offset-2">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>

    {showCguModal && (
      <CguModal
        onClose={() => setShowCguModal(false)}
        onAccept={() => { setAcceptedCgu(true); setShowCguModal(false); }}
      />
    )}

    {showPolitiqueModal && (
      <PolitiqueModal onClose={() => setShowPolitiqueModal(false)} />
    )}
</>
  );
}

export default SignupPage;
