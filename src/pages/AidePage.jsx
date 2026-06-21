import { Link } from 'react-router-dom';
import { LifeBuoy, HelpCircle, Mail, User, Building2, ShieldCheck } from 'lucide-react';
import Navbar from '../components/navbar';
import Foot from '../components/Foot';

const TOPICS = [
  { Icon: User,        title: 'Mon compte',        text: "Créer un compte, modifier mon profil, réinitialiser mon mot de passe.", to: '/profile' },
  { Icon: Building2,    title: 'Entreprises',       text: 'Rechercher une entreprise, consulter ses avis et son classement.', to: '/entreprises' },
  { Icon: ShieldCheck,  title: 'Avis & modération', text: 'Comment publier un avis et comment EchoWork modère les contenus.', to: '/faq' },
  { Icon: Mail,         title: 'Nous contacter',    text: "Une question qui n'a pas de réponse ici ? Écrivez-nous.", to: '/contact' },
];

export default function AidePage() {
  return (
    <>
      <Navbar />

      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-14 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white/80 mb-5">
            <LifeBuoy size={13} />
            Centre d'aide
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
            Comment pouvons-nous vous aider ?
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Retrouvez les réponses aux questions les plus fréquentes sur EchoWork.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
            {TOPICS.map(({ Icon, title, text, to }) => (
              <Link
                key={title}
                to={to}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 hover:border-red-200 hover:shadow-md transition-all group"
              >
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-red-500" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1 group-hover:text-red-600 transition-colors">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
              </Link>
            ))}
          </div>

          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-100 p-8 text-center">
            <HelpCircle size={28} className="text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-black text-gray-900 mb-2">Vous ne trouvez pas de réponse ?</h2>
            <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">
              Consultez notre FAQ détaillée ou contactez directement notre équipe.
            </p>
            <div className="flex items-center justify-center gap-3 flex-wrap">
              <Link
                to="/faq"
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-full font-semibold text-sm hover:bg-red-700 transition-colors shadow-sm"
              >
                Voir la FAQ
              </Link>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-300 text-gray-700 rounded-full font-semibold text-sm hover:border-red-300 hover:text-red-600 transition-colors"
              >
                Nous contacter
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Foot />
    </>
  );
}
