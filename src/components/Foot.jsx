import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Heart, MapPin, Facebook, Instagram, Linkedin, Youtube, ChevronDown,
} from 'lucide-react';

const EXPLORER_LINKS = [
  { label: 'Entreprises', href: '/entreprises' },
  { label: 'Catégories', href: '/#categories' },
  { label: 'Classements', href: '/classements' },
  { label: 'Insights', href: '/insights' },
  { label: 'Avis récents', href: '/avis-recents' },
  { label: 'Campus Challenge', href: '/campus' },
];

const A_PROPOS_LINKS = [
  { label: 'Qui sommes-nous ?', href: '/a-propos#qui-sommes-nous' },
  { label: 'Comment ça marche ?', href: '/a-propos#comment-ca-marche' },
  { label: 'Notre mission', href: '/a-propos#notre-mission' },
  { label: 'Carrières', href: '/carrieres' },
  { label: 'Contact', href: '/contact' },
];

const AIDE_LINKS = [
  { label: "Centre d'aide", href: '/aide' },
  { label: 'FAQ', href: '/faq' },
  { label: "Conditions d'utilisation", href: '/conditions-utilisation' },
  { label: 'Politique de confidentialité', href: '/confidentialite' },
  { label: 'Nous contacter', href: '/contact' },
];

export default function Foot() {
  const [langOpen, setLangOpen] = useState(false);

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">

          {/* Brand */}
          <div>
            <h2 className="text-2xl font-black mb-3">
              <span className="text-red-500">ECHO</span>WORK
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              La plateforme de confiance des Sénégalais. Ensemble, construisons une
              économie plus transparente et plus fiable.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-500 mb-5">
              <MapPin size={13} />
              Dakar, Sénégal
            </div>
            <div className="flex items-center gap-3">
              <a href="#" aria-label="Facebook" className="text-gray-500 hover:text-white transition-colors">
                <Facebook size={16} />
              </a>
              <a href="#" aria-label="Instagram" className="text-gray-500 hover:text-white transition-colors">
                <Instagram size={16} />
              </a>
              <a href="#" aria-label="LinkedIn" className="text-gray-500 hover:text-white transition-colors">
                <Linkedin size={16} />
              </a>
              <a href="#" aria-label="YouTube" className="text-gray-500 hover:text-white transition-colors">
                <Youtube size={16} />
              </a>
            </div>
          </div>

          {/* Explorer */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Explorer
            </h3>
            <ul className="space-y-2.5">
              {EXPLORER_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* À propos */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              À propos
            </h3>
            <ul className="space-y-2.5">
              {A_PROPOS_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Aide & Support */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Aide &amp; Support
            </h3>
            <ul className="space-y-2.5">
              {AIDE_LINKS.map(({ label, href }) => (
                <li key={label}>
                  <Link to={href} className="text-sm text-gray-400 hover:text-white transition-colors">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} EchoWork. Tous droits réservés.
          </p>
          <p className="text-xs text-gray-600 flex items-center gap-1">
            Fait avec <Heart size={11} className="text-red-500 fill-red-500 mx-0.5" /> au Sénégal
          </p>
          <div className="relative">
            <button
              onClick={() => setLangOpen((v) => !v)}
              className="flex items-center gap-1 text-xs text-gray-400 hover:text-white transition-colors"
            >
              Français
              <ChevronDown size={12} className={`transition-transform ${langOpen ? 'rotate-180' : ''}`} />
            </button>
            {langOpen && (
              <div className="absolute right-0 bottom-full mb-2 w-32 bg-gray-800 border border-white/10 rounded-xl shadow-xl p-1.5 z-10">
                <span className="block px-2.5 py-1.5 text-xs text-white rounded-lg bg-white/10">Français</span>
                <span className="block px-2.5 py-1.5 text-xs text-gray-500 rounded-lg cursor-not-allowed">English (bientôt)</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </footer>
  );
}
