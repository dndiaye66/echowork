import React from "react";
import backgroundImage from '../assets/image/imgbackground.jpg';
import imageEmploi from "../assets/image/imgrmploie.jpg";
import Foot from "../components/Foot";
import { Link } from "react-router-dom";
import { useBestCompanies, useWorstCompanies } from '../hooks/useHomeData';
import { useCategories } from '../hooks/useCategory';
import SearchAutocomplete from "../components/SearchAutocomplete";

import {
  Utensils,
  Landmark,
  Users,
  ShoppingCart,
  Hospital,
  Search,
  Star,
  MapPin,
  ChartNetwork,
  Hotel,
  ArrowRight,
  Briefcase,
  Factory,
  Phone,
  Zap,
  Wrench,
  Truck,
  Building2,
  Wheat,
  GraduationCap,
} from "lucide-react";

// Icon mapping for categories based on their names
const categoryIconMap = {
  "agriculture": Wheat,
  "alimentation-et-boissons": Utensils,
  "automobile": Truck,
  "commerce-et-distribution": ShoppingCart,
  "construction-et-btp": Building2,
  "industrie": Factory,
  "sante-et-pharmacie": Hospital,
  "services": Briefcase,
  "telecommunications": Phone,
  "energie-et-petrole": Zap,
  "etablissements-d-enseignement-superieur": GraduationCap,
};

const VitrinePage = () => {
  const { data: companies, loading, error } = useBestCompanies();
  const { data: worstCompanies, loading: worstLoading, error: worstError } = useWorstCompanies();
  const { categories, loading: categoriesLoading, error: categoriesError } = useCategories();

  return (
    <>
      <div className="bg-gray-100">
        <div
          className="relative w-full min-h-[60vh] flex items-center justify-center text-center text-white"
          style={{
            backgroundImage: `url(${backgroundImage})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="absolute inset-0 bg-black/50 z-0"></div>

          <div className="absolute top-4 left-4 z-10">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold">
              <span className="text-red-600 font-black rounded">ECHO</span>WORK
            </h1>
          </div>

          <div className="relative z-10 flex-1 flex flex-col items-center justify-center text-center mt-10">
            <h1 className="text-3xl md:text-6xl font-black mb-4">Donnez votre avis,</h1>
            <h1 className="text-3xl md:text-6xl font-black mb-4">
              faites évoluer les{" "}
              <span className="bg-red-600 rounded-lg text-white px-2 py-1 font-black">
                entreprises
              </span>
            </h1>
            <SearchAutocomplete placeholder="Rechercher une catégorie ou entreprise..." />
          </div>
        </div>

        <div className="p-6">
          <h1 className="text-4xl text-center font-black p-4 mb-4">Catégories d'entreprises</h1>
          {categoriesLoading ? (
            <p className="text-center text-gray-600">Chargement des catégories...</p>
          ) : categoriesError ? (
            <p className="text-center text-red-500">Erreur : {categoriesError}</p>
          ) : (
            <div className="flex justify-center">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {categories.map((category) => {
                  const Icon = categoryIconMap[category.slug] || Briefcase;
                  return (
                    <Link to={`/categories/${category.slug}`} key={category.slug}>
                      <div className="gap-4 card w-full px-8 max-w-xs h-40 bg-base-100 card-xl shadow-md hover:scale-105 hover:shadow-[0_0_20px_#ef4444] transition duration-300 ease-in-out rounded-2xl flex-col justify-center items-center text-center">
                        <Icon size={32} className="text-red-400" />
                        <span className="font-bold text-xl">{category.name}</span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      <div>
        <div className="flex flex-col lg:flex-row px-4 gap-4 lg-w-2/5 rounded-2xl shadow-2xl">
          {/* Colonne gauche */}
          <div className="lg:w-1/3 flex flex-col space-y-4">
            {/* Emplois + pubs */}
            <section className="bg-white space-y-4 rounded-xl shadow p-4">
              <img src={imageEmploi} alt="Emplois" className="w-full rounded-xl h-auto" />
              {/* ... (conserve ici les offres d'emploi comme tu l'avais écrit) */}
            </section>

            <section className="rounded-xl p-4 card bg-base-100  shadow-lg">
              <div className="bg-yellow-100 p-4 rounded shadow text-center">
                <h3 className="text-xl font-bold mb-2">🔔 Annonce Promotionnelle</h3>
                <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</p>
                <a href="#" className="text-red-600 underline font-semibold">En savoir plus</a>
              </div>
            </section>

            <section className="flex flex-row gap-x-14">
              <div className="card bg-base-100 w-60 shadow-lg">
                <figure>
                  <img src="https://via.placeholder.com/400x300?text=Annonce+1" alt="Annonce 1" className="h-50 w-full object-cover rounded-2xl" />
                </figure>
                <div className="card-body">
                  <h2 className="card-title text-red-600 font-black">Annonce 1</h2>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
              </div>

              <div className="card bg-base-100 w-60 shadow-lg">
                <figure>
                  <img src="https://placehold.co/600x400/png" alt="Annonce 2" className="h-50 w-full object-cover rounded-2xl" />
                </figure>
                <div className="card-body">
                  <h2 className="card-title text-red-600 font-black">Annonce 2</h2>
                  <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit.</p>
                </div>
              </div>
            </section>

            {/* Entreprises en baisse */}
            <section className="mt-8 bg-white rounded-xl shadow p-4">
              <h2 className="text-2xl font-black text-black mb-4">Les entreprises en baisse</h2>
              {worstLoading ? (
                <p className="text-center text-gray-600">Chargement...</p>
              ) : worstError ? (
                <p className="text-center text-red-500">Erreur : {worstError}</p>
              ) : (
                <ul className="space-y-4">
                  {worstCompanies?.map((item) => (
                    <li key={item.id || item.slug} className="border-b pb-2">
                      <p className="font-semibold text-gray-800">
                        {item.name} <span className="text-sm text-gray-500">(0 j'aime)</span>
                      </p>
                      <div className="flex mt-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            size={16}
                            className="text-gray-300"
                          />
                        ))}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </div>

          {/* Colonne droite : données dynamiques */}
          <div className="w-full lg:w-2/3 flex flex-col space-y- shadow-2xl rounded-2xl px-4 sm:px-8">
            <p className="text-2xl pt-8 ml-2 md:ml-12">Classement</p>
            <h2 className="text-3xl font-black mb-4 ml-2 md:ml-12 py-2">Top 10 des entreprises les mieux notées</h2>

            {loading ? (
              <p className="text-center text-gray-600">Chargement des entreprises...</p>
            ) : error ? (
              <p className="text-center text-red-500">Erreur : {error}</p>
            ) : (
              <ul className="space-y-3">
                {companies?.map((company, i) => (
                  <li key={i} className="p-2 ml-12 flex flex-col gap-1 bg-white">
                    <p className="text-xl font-bold text-black">{i + 1}. {company.name}</p>
                    <p className="flex items-center text-lg font-black text-gray-700">
                      <MapPin size={24} className="mr-1" /> {company.adresse || company.ville || "N/A"}
                    </p>
                    <p className="text-black text-sm mt-2">{company.description}</p>

                    <div className="flex">
                      {[...Array(5)].map((_, starIdx) => (
                        <Star
                          key={starIdx}
                          size={20}
                          className="text-gray-300"
                        />
                      ))}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <Foot />
    </>
  );
};

export default VitrinePage;
