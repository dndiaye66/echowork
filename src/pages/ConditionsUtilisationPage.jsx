import { FileText } from 'lucide-react';
import Navbar from '../components/navbar';
import Foot from '../components/Foot';

const SECTIONS = [
  {
    title: '1. Objet',
    text: "EchoWork est une plateforme communautaire permettant aux utilisateurs de consulter et de publier des avis sur des entreprises et services au Sénégal. L'utilisation du site implique l'acceptation pleine et entière des présentes conditions.",
  },
  {
    title: '2. Création de compte',
    text: "L'inscription est gratuite et requiert des informations exactes. Chaque utilisateur est responsable de la confidentialité de ses identifiants et des activités menées depuis son compte.",
  },
  {
    title: '3. Publication d\'avis',
    text: "Les avis doivent refléter une expérience réelle et personnelle avec l'entreprise concernée. Sont interdits : les propos diffamatoires, les faux avis, les contenus publicitaires déguisés et toute information mensongère.",
  },
  {
    title: '4. Modération',
    text: "EchoWork se réserve le droit de modérer, modifier ou supprimer tout contenu ne respectant pas les présentes conditions, sans préavis.",
  },
  {
    title: '5. Responsabilité',
    text: "EchoWork n'est pas l'auteur des avis publiés par ses utilisateurs et ne peut être tenu responsable de leur contenu. Chaque utilisateur reste responsable des propos qu'il publie.",
  },
  {
    title: '6. Propriété intellectuelle',
    text: "L'ensemble des éléments du site (textes, logos, interface) est protégé par le droit d'auteur. Toute reproduction non autorisée est interdite.",
  },
  {
    title: '7. Modification des conditions',
    text: 'EchoWork peut modifier les présentes conditions à tout moment. Les utilisateurs seront informés des changements significatifs.',
  },
];

export default function ConditionsUtilisationPage() {
  return (
    <>
      <Navbar />

      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-14 md:py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white/80 mb-5">
            <FileText size={13} />
            Conditions d'utilisation
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-2 leading-tight">
            Conditions d'utilisation
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
