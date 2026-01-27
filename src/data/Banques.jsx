// data/banques.js; les données des entreprises bancaires
import bislogo from "../assets/logoscompany/bis.webp";
import cbaologo from "../assets/logoscompany/CBAO.webp";
import balogo from "../assets/logoscompany/Logo-banque-atlantique.webp";
import sglogo from "../assets/logoscompany/societe-general.webp";
import ubalogo from "../assets/logoscompany/uba.webp";


const Banques = [
  {
    name: "Banque Atlantique",
    logo: balogo,
    stars: 4.5,
    website: "http://banqueatlantique.net/",
    contact: "(221) 33 849 92 92",
    address: "40 Boulevard de la république en face de la Cathédrale – Dakar",
    description: "Banque Atlantique offre le choix parmi une gamme de cartes la plus complète.",
    slug: "Banque Atlantique",
  },
  {
    name: "Société Générale",
    logo: sglogo,
    stars: 4.0,
    website: "https://societegenerale.sn/fr/",
    contact: " (+221) 33 839 42 42",
    address: "Dakar, Sénégal",
    description: "Avec le Prêt Célébrations, profitez d'un financement avantageux et préparez les fếtes en toute sérénité !",
    slug: "Société Générale",
  },
  {
    name: "UBA",
    logo: ubalogo,
    stars: 4.0,
    website: "https://www.ubasenegal.com/",
    contact: " (+221) 800805100 ",
    address: "Dakar, Sénégal",
    description: "Le service de banque en ligne UBA vous offre un accès illimité et sécurisé à votre compte, à tout moment et en tout lieu, sur votre ordinateur, tablette, smartphone ou tout autre appareil mobile. Bienvenue à la banque mobile !",
    slug: "UBA",
  },
  {
    name: "Banque Islamique du Sénégal",
    logo: bislogo,
    stars: 5.0,
    website: "https://bis-bank.com/",
    contact: " (+221) 33 849 62 62",
    address: "Almadies Zone 12, niveau rond-point, Dakar-Sénégal",
    description: "Bénéficiez de toutes les opérations financières en conformité avec les principes de la finance Islamique .",
    slug: "Banque Islamique du Sénégal",
  },
  {
    name: "CBAO Attijariwafa bank",
    logo: cbaologo,
    stars: 3.0,
    website: "https://www.attijariwafabank.com/en/international-subsidiaries/CBAO-S%C3%A9n%C3%A9gal",
    contact: " +221 33 849 60 60",
    address: "1, place de l’indépendance, BP.129 - Dakar, Sénégal",
    description: "For this, CBAO has redesigned its processes, its distribution model and its recruitment policy, A broad customer segmentation plan was conducted for the overall upgrade of the subsidiary in terms of operational, business and risk management efficiency.!",
    slug: "CBAO Attijariwafa bank",
  },
];

export default Banques;
