import { Link } from 'react-router-dom';
import {
  Shield, Users, MessageSquare, TrendingUp, Star, ArrowRight,
  Search, Edit3, BarChart2,
} from 'lucide-react';
import Navbar from '../components/navbar';
import Foot from '../components/Foot';

const VALUES = [
  {
    Icon: Shield,
    title: 'Confiance',
    text: "Chaque avis publié sur EchoWork provient d'un utilisateur réel. Nous modérons activement la plateforme pour garantir des retours authentiques.",
  },
  {
    Icon: Users,
    title: 'Communauté',
    text: "EchoWork est construit par et pour les Sénégalais. Notre mission est de donner une voix collective aux consommateurs.",
  },
  {
    Icon: TrendingUp,
    title: 'Progrès',
    text: "Les retours partagés aident les entreprises à mieux comprendre leurs clients et à améliorer leurs services au quotidien.",
  },
];

export default function AProposPage() {
  return (
    <>
      <Navbar />

      {/* Header */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-14 md:py-20 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 text-xs font-semibold text-white/80 mb-5">
            <Star size={13} />
            À propos d'EchoWork
          </div>
          <h1 className="text-3xl md:text-4xl font-black mb-4 leading-tight">
            La plateforme de confiance des Sénégalais
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-xl mx-auto leading-relaxed">
            EchoWork connecte les citoyens sénégalais aux entreprises qui comptent dans leur
            quotidien, à travers des avis authentiques et transparents.
          </p>
        </div>
      </div>

      {/* Content */}
      <div className="bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-12 md:py-16">

          {/* Qui sommes-nous */}
          <div id="qui-sommes-nous" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 mb-10 scroll-mt-20">
            <h2 className="text-xl font-black text-gray-900 mb-3">Qui sommes-nous ?</h2>
            <p className="text-gray-500 leading-relaxed">
              EchoWork est une plateforme communautaire sénégalaise qui permet à chacun de noter,
              commenter et consulter des avis sur les entreprises et services du pays — banques,
              télécoms, commerces, écoles, santé et bien d'autres secteurs. Nous croyons qu'un
              marché transparent profite autant aux consommateurs qu'aux entreprises qui s'efforcent
              de bien servir leurs clients.
            </p>
          </div>

          {/* Mission */}
          <div id="notre-mission" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 mb-10 scroll-mt-20">
            <h2 className="text-xl font-black text-gray-900 mb-3">Notre mission</h2>
            <p className="text-gray-500 leading-relaxed mb-4">
              Au Sénégal, les consommateurs manquent encore d'un espace dédié pour partager leur
              expérience avec les entreprises locales. EchoWork comble ce vide : une plateforme
              communautaire où chacun peut noter, commenter et consulter des avis sur les banques,
              télécoms, commerces, écoles et bien d'autres secteurs.
            </p>
            <p className="text-gray-500 leading-relaxed">
              Notre objectif est simple — aider les Sénégalais à faire les meilleurs choix, et
              aider les entreprises à progresser grâce à des retours constructifs.
            </p>
          </div>

          {/* Comment ça marche */}
          <div id="comment-ca-marche" className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 md:p-10 mb-10 scroll-mt-20">
            <h2 className="text-xl font-black text-gray-900 mb-5">Comment ça marche ?</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { Icon: Search, step: '1', title: 'Recherchez', text: "Trouvez une entreprise par nom ou par secteur d'activité." },
                { Icon: Edit3,  step: '2', title: 'Partagez',   text: 'Donnez votre note et racontez votre expérience en quelques mots.' },
                { Icon: BarChart2, step: '3', title: 'Comparez', text: 'Consultez les classements et les avis pour faire le meilleur choix.' },
              ].map(({ Icon, step, title, text }) => (
                <div key={step}>
                  <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3 relative">
                    <Icon size={18} className="text-red-500" />
                    <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-600 text-white text-[10px] font-bold flex items-center justify-center">{step}</span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1">{title}</h3>
                  <p className="text-xs text-gray-500 leading-relaxed">{text}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Values */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
            {VALUES.map(({ Icon, title, text }) => (
              <div key={title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mb-4">
                  <Icon size={20} className="text-red-500" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{text}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border border-red-100 p-8 text-center">
            <MessageSquare size={28} className="text-red-500 mx-auto mb-3" />
            <h2 className="text-lg font-black text-gray-900 mb-2">Votre avis compte</h2>
            <p className="text-sm text-gray-500 mb-5 max-w-md mx-auto">
              Rejoignez la communauté EchoWork et aidez des milliers de Sénégalais à faire les
              meilleurs choix.
            </p>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-600 text-white rounded-full font-semibold text-sm hover:bg-red-700 transition-colors shadow-sm"
            >
              Créer un compte <ArrowRight size={14} />
            </Link>
          </div>

        </div>
      </div>

      <Foot />
    </>
  );
}
