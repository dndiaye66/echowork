// data/Restaurants.jsx
import lagon1 from "../assets/logoscompany/lagon-1.jpg";
import logotacos from "../assets/logoscompany/LOGO-TACOS.webp";
import oriental from "../assets/logoscompany/imgoriental.jpg";
import terasse from "../assets/logoscompany/terasse.webp";




const Restaurants = [
  {
    name: "Lagon 1",
    logo: lagon1,
    stars: 4.5,
    website: "https://www.lelagondakar.com/lelagon1/",
    contact: "(+221) 33 821 53 22",
    address: "Route de la Corniche Est, Dakar",
    description: "Notre cuisine vous verra voyager à travers la carte avec des saveurs fines et Internationales pour tous les goûts.Dans chacun des plats, la fraicheur est à l'honneur. Des associations d'épices aux produits rigoureusement sélectionnés, en résulte des plats gourmands, au gout inégalé.",
    slug: "Lagon 1",
  },
  {
    name: "Tacos de Lyon",
    logo: logotacos,
    stars: 4.0,
    website: "https://tacosdelyon.sn/",
    contact: "(+221) 33 864 55 65",
    address: "Corniche, Place du Souvenir, Dakar",
    description: "Spécialiste des tacos à la française.",
    slug: "Tacos de Lyon",
  },
  {
    name: "L'oriental",
    logo: oriental,
    stars: 5.0,
    website: "https://tacosdelyon.sn/",
    contact: "(+221) 33 842 21 72",
    address: "60 Rue Amadou Assane Ndoye, Dakar, Sénégal",
    description: "Les menus proposés par le restaurant sont principalement orientales. Certain plats auront une dénomination authentique comme le houmous, kebbeh, kafta etc…mais à cause de la mondialisation, d’autres plats sont à la carte : le Poulet crispy, pizza italienne, paninni…bref on y retrouve un menu varié composé de salade en entrée, de poulet et viande en plat de résistance et de desserts.",
    slug: "L'oriental",
  },
  {
    name: "La Terasse",
    logo: terasse,
    stars: 5.0,
    website: "https://terroubi.com/fr/restaurant-la-terrasse.html",
    contact: "(+221) 33 839 90 39",
    address: "Boulevard Martin Luther King BP 1179 DAKAR",
    description: "Tout le monde se retrouve avec bonheur à La Terrasse, la brasserie du Terrou-Bi. Le restaurant de Dakar vue sur mer vous reçoit dans un cadre idyllique pour des déjeuners et dîners savoureux et ensoleillés. Dans l’agréable fraîcheur de la vaste terrasse ombragée, vous bénéficiez d’un panorama exceptionnel avec en toile de fond les îles de la Madeleine. Plaisir d’être là en famille, en couple, avec vos amis ou pour un déjeuner d’affaires en semaine. ",
    slug: "La Terasse",
  },
];

export default Restaurants;
