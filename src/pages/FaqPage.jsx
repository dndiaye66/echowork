import { HelpCircle, ChevronDown } from 'lucide-react';
import Navbar from '../components/navbar';
import Foot from '../components/Foot';

const FAQS = [
  {
    q: 'Comment publier un avis sur une entreprise ?',
    a: "Créez un compte gratuit, recherchez l'entreprise concernée sur sa page, puis utilisez le formulaire d'avis pour attribuer une note et décrire votre expérience.",
  },
  {
    q: 'Les avis sont-ils vérifiés ?',
    a: "Oui. Chaque avis est rattaché à un compte utilisateur et passe par une modération avant publication afin de limiter les faux avis et les contenus abusifs.",
  },
  {
    q: 'Puis-je modifier ou supprimer mon avis ?',
    a: "Vous pouvez gérer vos avis depuis votre profil. Contactez notre équipe via la page Contact si vous avez besoin d'aide supplémentaire.",
  },
  {
    q: "Comment sont calculés les classements d'entreprises ?",
    a: "Les classements se basent sur la moyenne des notes et le nombre d'avis approuvés, par secteur d'activité et à l'échelle nationale.",
  },
  {
    q: 'EchoWork est-il gratuit ?',
    a: "Oui, la création de compte et la publication d'avis sont entièrement gratuites pour les utilisateurs.",
  },
  {
    q: 'Comment signaler un avis abusif ou un faux avis ?',
    a: "Utilisez la page Contact pour nous signaler tout contenu qui vous semble abusif, mensonger ou contraire à nos conditions d'utilisation.",
  },
];

export default function FaqPage() {
  return (
    <>
      <Navbar />

      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-14 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white/80 mb-5">
            <HelpCircle size={13} />
            FAQ
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
            Questions fréquentes
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            Tout ce qu'il faut savoir pour bien utiliser EchoWork.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 space-y-3">
          {FAQS.map(({ q, a }) => (
            <details key={q} className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <summary className="flex items-center justify-between gap-3 px-6 py-4 cursor-pointer list-none">
                <span className="font-semibold text-gray-900 text-sm md:text-base">{q}</span>
                <ChevronDown size={16} className="text-gray-400 group-open:rotate-180 transition-transform shrink-0" />
              </summary>
              <p className="px-6 pb-5 text-sm text-gray-500 leading-relaxed">{a}</p>
            </details>
          ))}
        </div>
      </div>

      <Foot />
    </>
  );
}
