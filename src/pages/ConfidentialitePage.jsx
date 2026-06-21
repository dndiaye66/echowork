import { Lock } from 'lucide-react';
import Navbar from '../components/navbar';
import Foot from '../components/Foot';

const SECTIONS = [
  {
    title: '1. Données collectées',
    text: "EchoWork collecte les informations fournies lors de l'inscription (nom d'utilisateur, email) ainsi que les avis et interactions publiés sur la plateforme.",
  },
  {
    title: '2. Utilisation des données',
    text: 'Les données sont utilisées pour le fonctionnement du service : authentification, affichage des avis, statistiques agrégées et communications liées au compte.',
  },
  {
    title: '3. Partage des données',
    text: "EchoWork ne vend ni ne partage vos données personnelles avec des tiers à des fins commerciales. Les avis publiés sont visibles publiquement par nature.",
  },
  {
    title: '4. Sécurité',
    text: 'Des mesures techniques raisonnables sont mises en place pour protéger vos données contre tout accès non autorisé.',
  },
  {
    title: '5. Vos droits',
    text: "Vous pouvez demander l'accès, la correction ou la suppression de vos données personnelles en nous contactant directement.",
  },
  {
    title: '6. Cookies',
    text: 'Le site utilise des cookies essentiels au fonctionnement (session, préférences) et ne réalise pas de tracking publicitaire tiers.',
  },
];

export default function ConfidentialitePage() {
  return (
    <>
      <Navbar />

      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-14 md:py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white/80 mb-5">
            <Lock size={13} />
            Politique de confidentialité
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2 leading-tight">
            Politique de confidentialité
          </h1>
          <p className="text-white/50 text-xs">Dernière mise à jour : juin 2026</p>
        </div>
      </div>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 space-y-8">
          {SECTIONS.map(({ title, text }) => (
            <div key={title}>
              <h2 className="font-bold text-gray-900 mb-2">{title}</h2>
              <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </div>

      <Foot />
    </>
  );
}
