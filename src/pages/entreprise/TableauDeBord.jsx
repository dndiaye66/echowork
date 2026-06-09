import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Star, MessageSquare, TrendingUp, Building2, ChevronRight, Loader2, AlertCircle } from 'lucide-react';
import EntrepriseLayout from '../../components/EntrepriseLayout';
import { entrepriseService } from '../../services/entrepriseService';

function StatCard({ icon: Icon, label, value, color = 'red' }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
      <div className={`w-10 h-10 rounded-xl bg-${color}-50 flex items-center justify-center mb-3`}>
        <Icon size={20} className={`text-${color}-600`} />
      </div>
      <p className="text-2xl font-bold text-gray-900">{value}</p>
      <p className="text-sm text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}

export default function TableauDeBord() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    entrepriseService.getMyCompanies()
      .then(setCompanies)
      .catch(() => setError('Impossible de charger vos entreprises.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <EntrepriseLayout title="Vue d'ensemble">
        <div className="flex items-center justify-center h-48">
          <Loader2 size={28} className="animate-spin text-red-500" />
        </div>
      </EntrepriseLayout>
    );
  }

  if (error) {
    return (
      <EntrepriseLayout title="Vue d'ensemble">
        <div className="flex items-center gap-2 text-red-600 bg-red-50 rounded-xl p-4">
          <AlertCircle size={18} /> {error}
        </div>
      </EntrepriseLayout>
    );
  }

  if (companies.length === 0) {
    return (
      <EntrepriseLayout title="Vue d'ensemble">
        <div className="max-w-lg mx-auto text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
            <Building2 size={30} className="text-gray-400" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Aucune entreprise rattachée</h2>
          <p className="text-gray-500 text-sm mb-6">
            Réclamez la gestion de votre fiche pour commencer.
          </p>
          <Link
            to="/espace-entreprise/rejoindre"
            className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-6 py-3 rounded-full transition-colors"
          >
            Réclamer ma fiche
            <ChevronRight size={16} />
          </Link>
        </div>
      </EntrepriseLayout>
    );
  }

  return (
    <EntrepriseLayout title="Vue d'ensemble">
      <div className="space-y-6">
        {companies.map((company) => {
          const score = company.scores?.globalScore ?? 0;
          const total = company._count?.reviews ?? 0;

          return (
            <div key={company.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Company header */}
              <div className="flex items-center gap-4 p-5 border-b border-gray-50">
                {company.imageUrl ? (
                  <img src={company.imageUrl} alt={company.name} className="w-14 h-14 rounded-xl object-cover" />
                ) : (
                  <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center">
                    <Building2 size={26} className="text-gray-400" />
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className="font-bold text-gray-900">{company.name}</h2>
                    {company.isVerified && (
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-medium">
                        Vérifié
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500">{company.category?.name}</p>
                </div>
                <Link
                  to={`/espace-entreprise/tableau-de-bord/profil?id=${company.id}`}
                  className="text-sm font-medium text-red-600 hover:underline flex items-center gap-1"
                >
                  Modifier <ChevronRight size={14} />
                </Link>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 divide-x divide-gray-50 p-0">
                {[
                  { icon: Star, label: 'Note globale', value: score > 0 ? score.toFixed(1) : '—' },
                  { icon: MessageSquare, label: 'Total avis', value: total },
                  { icon: TrendingUp, label: 'Abonnement', value: company.subscription?.plan ?? 'FREE' },
                ].map(({ icon: Icon, label, value }) => (
                  <div key={label} className="flex flex-col items-center py-5 px-4">
                    <Icon size={18} className="text-red-500 mb-1.5" />
                    <span className="text-lg font-bold text-gray-900">{value}</span>
                    <span className="text-xs text-gray-400 mt-0.5">{label}</span>
                  </div>
                ))}
              </div>

              {/* Quick links */}
              <div className="flex gap-2 p-4 border-t border-gray-50">
                <Link
                  to={`/espace-entreprise/tableau-de-bord/avis?id=${company.id}`}
                  className="flex-1 text-center text-sm font-medium bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-600 py-2.5 rounded-xl transition-colors"
                >
                  Voir les avis
                </Link>
                <Link
                  to={`/companies/${company.slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center text-sm font-medium bg-gray-50 hover:bg-red-50 hover:text-red-600 text-gray-600 py-2.5 rounded-xl transition-colors"
                >
                  Voir la fiche
                </Link>
              </div>
            </div>
          );
        })}

        <Link
          to="/espace-entreprise/rejoindre"
          className="flex items-center justify-center gap-2 border-2 border-dashed border-gray-200 hover:border-red-300 hover:text-red-600 text-gray-400 rounded-2xl py-6 transition-colors text-sm font-medium"
        >
          <Building2 size={18} />
          Ajouter une autre entreprise
        </Link>
      </div>
    </EntrepriseLayout>
  );
}
