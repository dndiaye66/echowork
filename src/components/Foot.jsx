import { Link } from 'react-router-dom';
import {
  Heart, MapPin, ExternalLink,
  Utensils, Landmark, ShoppingCart, Hospital, Briefcase,
  Factory, Phone, Zap, Truck, Building2, Wheat, GraduationCap,
} from 'lucide-react';

const categories = [
  { name: 'Agriculture', slug: 'agriculture', Icon: Wheat },
  { name: 'Alimentation & Boissons', slug: 'alimentation-et-boissons', Icon: Utensils },
  { name: 'Automobile', slug: 'automobile', Icon: Truck },
  { name: 'Commerce & Distribution', slug: 'commerce-et-distribution', Icon: ShoppingCart },
  { name: 'Santé & Pharmacie', slug: 'sante-et-pharmacie', Icon: Hospital },
  { name: 'Services', slug: 'services', Icon: Briefcase },
  { name: 'Banques & Finance', slug: 'banques-et-institutions-financieres', Icon: Landmark },
  { name: 'Industrie', slug: 'industrie', Icon: Factory },
];

const quickLinks = [
  { label: 'Accueil', href: '/' },
  { label: 'Connexion', href: '/login' },
  { label: 'Inscription', href: '/signup' },
];

export default function Foot() {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 py-14">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">

          {/* Brand */}
          <div>
            <h2 className="text-2xl font-black mb-3">
              <span className="text-red-500">ECHO</span>WORK
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed mb-5">
              La plateforme communautaire de référence pour noter et évaluer
              les entreprises et services au Sénégal.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin size={13} />
              Dakar, Sénégal
            </div>
          </div>

          {/* Categories */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Catégories
            </h3>
            <ul className="grid grid-cols-2 gap-1.5">
              {categories.map(({ name, slug, Icon }) => (
                <li key={slug}>
                  <Link
                    to={`/categories/${slug}`}
                    className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors group"
                  >
                    <Icon size={11} className="text-red-500/60 group-hover:text-red-400 transition-colors shrink-0" />
                    <span className="truncate">{name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Liens utiles
            </h3>
            <ul className="space-y-2.5">
              {quickLinks.map(({ label, href }) => (
                <li key={href}>
                  <Link
                    to={href}
                    className="text-sm text-gray-400 hover:text-white transition-colors"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Stats */}
            <div className="mt-6 flex flex-col gap-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span className="text-gray-400">Service disponible 24h/7j</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Building2 size={12} className="text-red-400" />
                <span className="text-gray-400">Toutes catégories d'entreprises</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-gray-600">
            © {new Date().getFullYear()} EchoWork. Tous droits réservés.
          </p>
          <p className="text-xs text-gray-600 flex items-center gap-1">
            Fait avec <Heart size={11} className="text-red-500 fill-red-500 mx-0.5" /> au Sénégal
          </p>
        </div>
      </div>
    </footer>
  );
}
