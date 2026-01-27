import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import ToutesEntreprises from "../data/ToutesEntreprises";
import { Star, ThumbsUp, ThumbsDown, MapPin, ChartNetwork, Phone } from "lucide-react";
import Navbar from "../components/navbar";
import Foot from "../components/Foot";
import imageBack2 from "../assets/image/imgback2.jpg";
import { useCompanyReviews } from "../hooks/useReviews";
import { reviewService } from "../services/reviewService";
import { useVoting } from "../hooks/useVoting";

const CompanyPage = () => {
  const { slug } = useParams();
  const [entreprise, setEntreprise] = useState(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  // Hook pour les votes
  const { upvote, downvote, votingStates } = useVoting();

  // On trouve l'entreprise
  useEffect(() => {
    const found = ToutesEntreprises.find((e) => e.slug === slug);
    setEntreprise(found);
  }, [slug]);

  // Hook pour récupérer les avis dynamiques
  const { reviews, loading, refresh } = useCompanyReviews(entreprise?.id);

  // Soumission de l'avis
  const handleSubmitReview = async () => {
    if (!comment || rating === 0) {
      alert("Veuillez remplir tous les champs");
      return;
    }

    try {
      await reviewService.createReview({ 
        companyId: entreprise.id, 
        comment, 
        rating 
      });
      setComment("");
      setRating(0);
      refresh(); // Recharge les avis
      alert("Avis publié avec succès!");
    } catch (error) {
      console.error("Erreur lors de la publication de l'avis:", error);
      if (error.response?.status === 401) {
        alert("Vous devez être connecté pour publier un avis.");
      } else {
        alert("Erreur lors de la publication de l'avis.");
      }
    }
  };

  // Gestion des votes
  const handleUpvote = async (reviewId) => {
    try {
      await upvote(reviewId);
      refresh(); // Recharge les avis pour afficher les nouveaux scores
    } catch (error) {
      console.error("Erreur lors du vote:", error);
    }
  };

  const handleDownvote = async (reviewId) => {
    try {
      await downvote(reviewId);
      refresh(); // Recharge les avis pour afficher les nouveaux scores
    } catch (error) {
      console.error("Erreur lors du vote:", error);
    }
  };

  if (!entreprise) {
    return <p>Entreprise non trouvée</p>;
  }

  return (
    <>
      <Navbar />

      {/* IMAGE DE FOND */}
      <div
        className="relative w-full min-h-[60vh] flex items-center justify-start text-white"
        style={{
          backgroundImage: `url(${imageBack2})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50 z-0"></div>
        <div className="relative z-10 h-full flex items-start justify-start px-10">
          <div className="max-w-xl text-left">
            <h1 className="text-4xl font-bold">{entreprise.name}</h1>
            <div className="flex flex-row gap-4">
              <div className="flex items-center my-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`mr-1 ${i < Math.round(entreprise.stars) ? "text-red-600" : "text-gray-300"}`}
                  />
                ))}
              </div>
              <p className="text-red-600 font-bold text-xl">
                <strong className="text-white">Catégorie :</strong> {entreprise.categorie}
              </p>
            </div>
            <div>
              <h2 className="font-bold text-lg">Description :</h2>
              <p className="mb-2">{entreprise.description}</p>
            </div>

            <div className="flex items-center gap-2 mt-2">
              <div className="flex items-center gap-2 border-2 border-black p-2 bg-white">
                <ChartNetwork className="text-black" size={24} />
                <a
                  href={entreprise.website}
                  className="underline text-lg text-black"
                  target="_blank"
                  rel="noreferrer"
                >
                  Site Web
                </a>
              </div>
              <div className="flex items-center gap-2 border-2 border-black p-2 bg-white">
                <Phone className="text-black" size={24} />
                <a
                  href={`tel:${entreprise.contact}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-black underline"
                >
                  Contactez l'entreprise
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* TÉMOIGNAGES */}
      <div className="bg-gray-100 py-4 px-4 md:px-20">
        <h2 className="text-3xl text-center font-black mb-6">Témoignages</h2>

        <div className="divide-y divide-gray-300 mb-4 md:px-20 bg-white py-4 px-4 rounded-2xl shadow max-w-7xl mx-auto">
          {loading ? (
            <p>Chargement des avis...</p>
          ) : reviews && reviews.length > 0 ? (
            reviews.map((avis) => (
              <div key={avis.id} className="bg-white max-w-3xl p-6">
                <p className="font-semibold">{avis.user?.email || "Anonyme"}</p>
                <div className="flex items-center my-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`mr-1 ${i < avis.rating ? "text-red-600" : "text-gray-300"}`}
                    />
                  ))}
                </div>
                <p>{avis.comment}</p>
                <div className="flex gap-2 mt-2 items-center">
                  <button
                    onClick={() => handleUpvote(avis.id)}
                    disabled={votingStates[avis.id]}
                    className="flex items-center gap-1 disabled:opacity-50"
                  >
                    <ThumbsUp className="text-white bg-red-600 p-1 rounded-full cursor-pointer hover:bg-red-700" size={32} />
                    <span className="text-sm font-semibold">{avis.upvotes || 0}</span>
                  </button>
                  <button
                    onClick={() => handleDownvote(avis.id)}
                    disabled={votingStates[avis.id]}
                    className="flex items-center gap-1 disabled:opacity-50"
                  >
                    <ThumbsDown className="text-white bg-red-600 p-1 rounded-full cursor-pointer hover:bg-red-700" size={32} />
                    <span className="text-sm font-semibold">{avis.downvotes || 0}</span>
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p>Aucun avis pour cette entreprise.</p>
          )}
        </div>

        {/* FORMULAIRE D’AVIS */}
        <div className="bg-white p-6 rounded-xl shadow-md mx-auto py-4 px-4 md:px-20 max-w-7xl">
          <h3 className="text-xl font-bold mb-4">Laissez votre avis</h3>
          <textarea
            rows={5}
            className="w-full border-2 border-gray-300 p-3 rounded mb-2 focus:outline-none focus:ring-2 focus:ring-red-600"
            placeholder="Écrivez ici votre avis..."
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex items-center gap-2 mb-4">
            {[1, 2, 3, 4, 5].map((num) => (
              <Star
                key={num}
                size={24}
                className={num <= rating ? "text-red-600 cursor-pointer" : "text-gray-300 cursor-pointer"}
                onClick={() => setRating(num)}
              />
            ))}
          </div>
          <p className="text-sm text-gray-500 mb-4">Maximum 85 caractères</p>
          <button
            onClick={handleSubmitReview}
            className="bg-red-600 text-white px-6 py-2 rounded-full font-semibold hover:bg-red-700"
          >
            Publier votre avis
          </button>
        </div>
      </div>

      <Foot />
    </>
  );
};

export default CompanyPage;
