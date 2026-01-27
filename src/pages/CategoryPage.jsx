import React from "react";
import Foot from "../components/Foot";
import { useParams, Link } from "react-router-dom";
import categoriesEntreprises from "../data/CategoriesEntreprises";
import Navbar from "../components/navbar";
import { Search, MessageCircleMore, Star, ChartNetwork } from "lucide-react";
import { useCompaniesByCategory } from '../hooks/useCompany';

// Simulation d'avis
const monAvis = [
  {
    user: "Awa Diop",
    entreprise: "Banque de Dakar",
    comment: "Très bon service !",
  },
  {
    user: "Ousmane",
    entreprise: "Restaurant Le Délice",
    comment: "Accueil chaleureux.",
  },
];

const CategoryPage = () => {
  const { slug } = useParams();
  const { companies: filteredEntreprises = [], loading, error } = useCompaniesByCategory(slug);

  // Filtrage des avis
  const avisPourCategorie = monAvis.filter((avis) =>
    filteredEntreprises.some((e) => e.name === avis.entreprise)
  );

  // Gestion du chargement ou d'erreur
  if (loading) return <p className="text-center p-10">Chargement...</p>;
  if (error) return <p className="text-center p-10 text-red-600">Erreur : {error}</p>;

  return (
    <>
      <Navbar />
      <div className="bg-gray-100">
        <div className="container bg-gray-100 w-full mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">

          {/* Colonne gauche - Catégories + Avis */}
          <div className="bg-white py-6 rounded-2xl ml-20 px-4 lg:w-1/4 space-y-8">
            <div>
              <h2 className="text-2xl font-black mb-2">Autres catégories d'entreprise</h2>
              <ul className="list-none space-y-2">
                {categoriesEntreprises.map((cat) => (
                  <li key={cat.slug}>
                    <Link
                      to={`/categories/${cat.slug}`}
                      className={`inline-block px-4 py-2 border rounded-full capitalize font-medium ${
                        cat.slug === slug
                          ? 'bg-red-600 text-white'
                          : 'text-black hover:bg-red-600 hover:text-white'
                      }`}
                    >
                      {cat.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Derniers avis */}
            <div>
              <h2 className="text-xl font-bold mb-2">Derniers avis</h2>
              <ul className="space-y-4">
                {avisPourCategorie.length > 0 ? (
                  avisPourCategorie.map((avis, i) => (
                    <li key={i} className="rounded shadow bg-white p-4">
                      <div className="flex gap-4 items-center mb-2">
                        <MessageCircleMore className="text-white bg-red-600 rounded-full" size={28} />
                        <p className="font-black">
                          {avis.user} - <span className="text-red-600">{avis.entreprise}</span>
                        </p>
                      </div>
                      <p className="italic text-gray-800">"{avis.comment}"</p>
                    </li>
                  ))
                ) : (
                  <li className="text-gray-500 italic">Aucun avis pour cette catégorie.</li>
                )}
              </ul>
            </div>
          </div>

          {/* Colonne droite - Liste des entreprises */}
          <div className="lg:w-2/3 rounded-2xl bg-white">
            <p className="text-2xl text-gray-500 p-4 pl-8 font-black">Classement</p>
            <h1 className="text-3xl font-black mb-4 capitalize pl-8">
              Les {slug ? slug.replace("-", " ") : "entreprises"} au Sénégal
            </h1>

            {filteredEntreprises.length > 0 ? (
              <div className="flex flex-col divide-y divide-gray-300 gap-6">
                {filteredEntreprises.map((e) => (
                  <div
                    key={e.slug}
                    className="card bg-white p-4 rounded-lg pl-8 max-w-[90%] mx-10 hover:bg-gray-300 transition block"
                  >
                    <Link to={`/entreprise/${e.slug}`} className="block hover:underline">
                      <div className="flex gap-3 items-center mb-2">
                        <img src={e.logo} alt={`Logo de ${e.name}`} className="w-36 object-contain" />
                        <h2 className="text-2xl font-bold">{e.name}</h2>
                      </div>
                      <p>{e.address}</p>
                      <div className="flex items-center gap-1 mb-2">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={20}
                            className={
                              i < Math.round(e.stars) ? "text-red-600" : "text-gray-300"
                            }
                          />
                        ))}
                      </div>
                    </Link>

                    <div className="flex flex-row border-2 border-red-600 p-1 w-fit gap-2 mt-2">
                      <ChartNetwork className="text-black" />
                      <a
                        href={e.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-black underline"
                      >
                        Voir le site
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600 px-8">Aucune entreprise trouvée pour cette catégorie.</p>
            )}
          </div>

        </div>
        <Foot />
      </div>
    </>
  );
};

export default CategoryPage;
