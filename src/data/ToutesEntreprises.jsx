// data/toutesLesEntreprises.js
// Importation des différents entreprise
import Banques from "./Banques"; 
import Restaurants from "./Restaurants";
import Pharma from "./Pharma"
import ServicePublic from "./ServicePublic"
import VenteDetails from "./VenteDetails"

const ToutesEntreprises = [
  ...Banques.map(b => ({ ...b, categorie: "Banques" })),
  ...Restaurants.map(r => ({ ...r, categorie: "Restaurants" })),
  ...Pharma.map(r => ({ ...r, categorie: "Pharma" })),
  ...ServicePublic .map(r => ({ ...r, categorie: "ServicePublic" })),
  ...VenteDetails .map(r => ({ ...r, categorie: "VenteDetails" })),

];

export default ToutesEntreprises;
