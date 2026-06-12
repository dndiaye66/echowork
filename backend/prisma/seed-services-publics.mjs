/**
 * Seed : catégorie "Services Publics" + toutes les agences et établissements publics du Sénégal
 * Usage  : node prisma/seed-services-publics.mjs
 * Depuis : /var/www/echowork/backend
 *
 * ✅ Crée la catégorie si elle n'existe pas
 * 🔄 Migre les entreprises existantes (SENELEC, DDD…) vers cette catégorie
 * ✅ Crée les nouvelles agences si elles n'existent pas encore
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// ── Données des agences ──────────────────────────────────────────────────────
const AGENCIES = [

  // ── PRÉSIDENCE / PRIMATURE ──────────────────────────────────────────────
  {
    name: 'SOGEPA-SN — Société de Gestion du Patrimoine bâti de l\'État',
    slug: 'sogepa-sn',
    description: 'Gère, entretient et valorise le patrimoine immobilier bâti de l\'État sénégalais. Supervise les concessions et baux des propriétés de l\'État.',
    activite: 'Gestion du patrimoine immobilier de l\'État',
    ville: 'Dakar',
  },
  {
    name: 'Délégation générale aux Pôles Urbains de Diamniadio et du Lac Rose',
    slug: 'delegation-poles-urbains-diamniadio',
    description: 'Pilote le développement, l\'aménagement et la promotion des pôles urbains de Diamniadio et du Lac Rose. Dirigé par Bara DIOUF (Délégué général), nommé en avril 2024.',
    activite: 'Aménagement urbain et développement des pôles urbains',
    ville: 'Diamniadio',
  },
  {
    name: 'DGPSN — Délégation générale à la Protection sociale et à la Solidarité nationale',
    slug: 'dgpsn',
    description: 'Coordonne et supervise les programmes nationaux de protection sociale, les transferts monétaires et les filets sociaux au Sénégal. Dirigé par Matar SENE.',
    activite: 'Protection sociale et solidarité nationale',
    ville: 'Dakar',
  },
  {
    name: 'ARCOP — Autorité de Régulation de la Commande publique',
    slug: 'arcop',
    description: 'Régule et contrôle la passation des marchés publics au Sénégal. Garantit la transparence, l\'équité et la bonne utilisation des deniers publics dans les appels d\'offres. Dirigé par Moustapha DJITTE.',
    activite: 'Régulation des marchés publics et commande publique',
    ville: 'Dakar',
    website: 'https://www.arcop.sn',
  },
  {
    name: 'CNRA — Conseil national de Régulation de l\'Audiovisuel',
    slug: 'cnra',
    description: 'Régule le secteur de l\'audiovisuel et veille au respect de la déontologie dans les médias sénégalais. Assure l\'équité de traitement dans l\'espace médiatique. Dirigé par Mamadou Oumar NDIAYE.',
    activite: 'Régulation de l\'audiovisuel et de la presse',
    ville: 'Dakar',
  },
  {
    name: 'ANRAC — Agence nationale de Relance des activités économiques en Casamance',
    slug: 'anrac',
    description: 'Soutient le développement économique et la reconstruction de la Casamance à travers des programmes de financement, d\'infrastructure et d\'accompagnement des populations.',
    activite: 'Développement économique de la Casamance',
    ville: 'Ziguinchor',
  },

  // ── ÉCONOMIE / FINANCES ──────────────────────────────────────────────────
  {
    name: 'CDC — Caisse des Dépôts et Consignations du Sénégal',
    slug: 'cdc-senegal',
    description: 'Institution financière publique qui gère les dépôts obligatoires des notaires, huissiers et officiers ministériels. Finance des projets d\'intérêt général et soutient l\'investissement public. Dirigé par Fadilou KEITA.',
    activite: 'Gestion des dépôts publics et financement d\'intérêt général',
    ville: 'Dakar',
    website: 'https://www.cdc.sn',
  },
  {
    name: 'FONSIS — Fonds Souverain d\'Investissements Stratégiques',
    slug: 'fonsis',
    description: 'Fonds souverain du Sénégal qui investit dans des secteurs stratégiques pour le développement économique national. Gère les participations de l\'État dans les grandes entreprises. Dirigé par Babacar GNING.',
    activite: 'Investissements stratégiques et gestion du fonds souverain',
    ville: 'Dakar',
    website: 'https://www.fonsis.org',
  },
  {
    name: 'FONAMIF — Fonds National de Microfinance',
    slug: 'fonamif',
    description: 'Facilite l\'accès au financement pour les populations à faibles revenus et les micro-entrepreneurs. Soutient le développement du secteur de la microfinance au Sénégal. Dirigé par Amadou Tidiane DIALLO.',
    activite: 'Microfinance et inclusion financière',
    ville: 'Dakar',
  },
  {
    name: 'FONGIP — Fonds de Garantie des Investissements prioritaires',
    slug: 'fongip',
    description: 'Apporte des garanties financières aux PME et entrepreneurs sénégalais pour faciliter leur accès au crédit bancaire. Stimule l\'investissement privé au Sénégal.',
    activite: 'Garanties financières pour PME et entrepreneurs',
    ville: 'Dakar',
    website: 'https://www.fongip.sn',
  },

  // ── INDUSTRIE / COMMERCE ────────────────────────────────────────────────
  {
    name: 'ARM — Agence de Régulation des Marchés',
    slug: 'arm-senegal',
    description: 'Régule les marchés des denrées de première nécessité au Sénégal. Surveille les prix, lutte contre la spéculation et garantit l\'approvisionnement correct du marché national. Dirigé par Babacar SEMBENE.',
    activite: 'Régulation des marchés des denrées alimentaires de base',
    ville: 'Dakar',
    website: 'https://www.arm.sn',
  },
  {
    name: 'ASPIT — Agence sénégalaise pour la Propriété industrielle et l\'Innovation technologique',
    slug: 'aspit',
    description: 'Gère la propriété industrielle, les brevets, marques, dessins et modèles au Sénégal. Accompagne l\'innovation et protège les inventeurs sénégalais. Dirigé par Françoise FAYE.',
    activite: 'Propriété industrielle, brevets et innovation',
    ville: 'Dakar',
  },
  {
    name: 'ASN — Association Sénégalaise de Normalisation',
    slug: 'asn-senegal',
    description: 'Élabore et diffuse les normes techniques applicables au Sénégal. Garantit la qualité des produits et services et facilite les échanges commerciaux. Dirigé par Massamba NDIAYE.',
    activite: 'Normalisation et contrôle qualité des produits',
    ville: 'Dakar',
  },
  {
    name: 'APROSI — Agence d\'Aménagement et de Promotion des Sites Industriels',
    slug: 'aprosi',
    description: 'Aménage, gère et commercialise les zones industrielles du Sénégal. Attire les investisseurs en leur offrant des sites industriels viabilisés. Dirigé par Mamadou Lamine NDIAYE.',
    activite: 'Zones industrielles et promotion de l\'investissement industriel',
    ville: 'Dakar',
  },
  {
    name: 'ADEPME — Agence de Développement et d\'Encadrement des PME',
    slug: 'adepme',
    description: 'Accompagne les petites et moyennes entreprises sénégalaises dans leur création, structuration et développement. Offre des formations, conseils et mises en relation. Dirigé par Marie Rose FAYE.',
    activite: 'Développement, financement et encadrement des PME',
    ville: 'Dakar',
    website: 'https://www.adepme.sn',
  },
  {
    name: 'CICES — Centre international du Commerce Extérieur du Sénégal',
    slug: 'cices',
    description: 'Organise les grandes foires et expositions internationales au Sénégal, notamment la FIDAK. Promeut les exportations sénégalaises et les échanges commerciaux. Dirigé par Justin CORREA.',
    activite: 'Foires internationales et promotion du commerce extérieur',
    ville: 'Dakar',
    website: 'https://www.cices.sn',
  },
  {
    name: 'PROMOGEM — Programme de Modernisation et de Gestion des Marchés',
    slug: 'promogem',
    description: 'Modernise et améliore la gestion et l\'infrastructure des marchés alimentaires publics au Sénégal pour des conditions d\'hygiène et de commerce optimales. Coordonné par Rougui Aladji SOW.',
    activite: 'Modernisation des marchés alimentaires et commerciaux',
    ville: 'Dakar',
  },

  // ── ÉNERGIE / PÉTROLE / MINES ───────────────────────────────────────────
  {
    name: 'SENELEC — Société nationale d\'Electricité',
    slug: 'senelec',
    description: 'Fournit l\'électricité à l\'ensemble du territoire sénégalais. Gère la production, le transport et la distribution de l\'énergie électrique. Interlocuteur principal des ménages et entreprises pour leur alimentation en courant. Dirigé par Papa Toby GAYE.',
    activite: 'Production, transport et distribution d\'électricité',
    ville: 'Dakar',
    website: 'https://www.senelec.sn',
  },
  {
    name: 'PETROSEN Holding SA — Société des Pétroles du Sénégal',
    slug: 'petrosen-holding',
    description: 'Holding public qui gère les participations de l\'État sénégalais dans le secteur pétrolier et gazier. Représente les intérêts nationaux dans les contrats d\'exploration et de production. Dirigé par Alioune GUEYE.',
    activite: 'Pétrole, gaz naturel et participations de l\'État',
    ville: 'Dakar',
    website: 'https://www.petrosen.sn',
  },
  {
    name: 'PETROSEN Trading and Services SA',
    slug: 'petrosen-trading',
    description: 'Filiale commerciale de PETROSEN chargée du négoce des hydrocarbures et de la fourniture de services dans le secteur pétrolier sénégalais. Dirigé par Mouhamadou DIOP.',
    activite: 'Commerce et services pétroliers',
    ville: 'Dakar',
  },
  {
    name: 'ASER — Agence sénégalaise d\'Electrification rurale',
    slug: 'aser-senegal',
    description: 'Assure l\'électrification des zones rurales non desservies par le réseau SENELEC. Déploie des solutions solaires et favorise l\'accès universel à l\'énergie. Dirigé par Jean Michel SENE.',
    activite: 'Électrification rurale et énergie solaire',
    ville: 'Dakar',
    website: 'https://www.aser.sn',
  },
  {
    name: 'AEME — Agence pour l\'Economie et la Maîtrise d\'Energie',
    slug: 'aeme',
    description: 'Promeut l\'efficacité énergétique, les économies d\'énergie et les énergies renouvelables au Sénégal. Accompagne les entreprises et ménages dans la réduction de leur consommation énergétique. Dirigé par Mame Coumba NDIAYE.',
    activite: 'Efficacité énergétique et maîtrise de la consommation',
    ville: 'Dakar',
    website: 'https://www.aeme.sn',
  },
  {
    name: 'SOMISEN — Société des Mines du Sénégal',
    slug: 'somisen',
    description: 'Représente et gère les participations de l\'État sénégalais dans le secteur minier. Contribue à la valorisation des ressources minières nationales. Dirigé par Ngagne Demba TOURE.',
    activite: 'Mines, ressources minières et participations de l\'État',
    ville: 'Dakar',
  },
  {
    name: 'SAR — Société africaine de Raffinage',
    slug: 'sar-senegal',
    description: 'Unique raffinerie du Sénégal, transforme le pétrole brut importé en produits pétroliers finis (essence, gasoil, fuel) pour le marché national et sous-régional. Dirigé par Mamadou Abib DIOP.',
    activite: 'Raffinage pétrolier et distribution de produits pétroliers',
    ville: 'Dakar',
  },
  {
    name: 'SOGEM — Société de Gestion de l\'Énergie de Manantali',
    slug: 'sogem',
    description: 'Gère la centrale hydroélectrique de Manantali pour le compte des États membres de l\'OMVS (Mali, Mauritanie, Sénégal). Assure la production et la répartition de l\'énergie entre les trois pays. Dirigé par Julien SAGNA.',
    activite: 'Gestion de l\'énergie hydroélectrique régionale (OMVS)',
    ville: 'Dakar',
  },

  // ── INFRASTRUCTURES / TRANSPORTS ────────────────────────────────────────
  {
    name: 'APIX SA — Agence pour la Promotion des Investissements et des Grands Travaux',
    slug: 'apix-sa',
    description: 'Guichet unique des investisseurs étrangers au Sénégal. Facilite les formalités de création d\'entreprise et coordonne la réalisation des grands projets d\'infrastructure nationaux. Dirigé par Bacary Sega BATHILY.',
    activite: 'Promotion des investissements et grands travaux d\'infrastructure',
    ville: 'Dakar',
    website: 'https://www.apix.sn',
  },
  {
    name: 'Port Autonome de Dakar',
    slug: 'port-autonome-dakar',
    description: 'Gère le principal port maritime du Sénégal et hub commercial de l\'Afrique de l\'Ouest. Traite conteneurs, vracs, véhicules et passagers. Dirigé par Waly DIOUF BODIANG.',
    activite: 'Gestion portuaire et commerce maritime international',
    ville: 'Dakar',
    website: 'https://www.portdakar.sn',
  },
  {
    name: 'AIBD SA — Aéroport International Blaise DIAGNE',
    slug: 'aibd-sa',
    description: 'Exploite et gère l\'aéroport international Blaise Diagne de Diass, principal hub aérien du Sénégal. Accueille des millions de passagers par an et connecte le Sénégal au monde. Dirigé par Cheikh Mamadou Abiboulaye DIEYE.',
    activite: 'Gestion aéroportuaire et services aux passagers',
    ville: 'Diass',
    website: 'https://www.aibd.sn',
  },
  {
    name: 'CFS — Société nationale des Chemins de Fer du Sénégal',
    slug: 'cfs-senegal',
    description: 'Gère et développe le réseau ferroviaire national sénégalais. Assure le transport de voyageurs et de marchandises par voie ferrée. Dirigé par Ibrahima BA.',
    activite: 'Transport ferroviaire national',
    ville: 'Dakar',
  },
  {
    name: 'Dakar Dem Dikk',
    slug: 'dakar-dem-dikk',
    description: 'Société nationale de transport urbain et interurbain de Dakar. Exploite un réseau de bus desservant la capitale et les principales villes du Sénégal. Interlocuteur quotidien de millions de Dakarois. Dirigé par Assane MBENGUE.',
    activite: 'Transport en commun urbain et interurbain par bus',
    ville: 'Dakar',
  },
  {
    name: 'COSEC — Conseil sénégalais des Chargeurs',
    slug: 'cosec',
    description: 'Défend les intérêts des chargeurs sénégalais dans le transport maritime et terrestre. Accompagne les importateurs et exportateurs dans leurs démarches logistiques. Dirigé par Ndeye Rokhaya THIAM.',
    activite: 'Représentation des chargeurs et facilitation du commerce international',
    ville: 'Dakar',
    website: 'https://www.cosec.sn',
  },
  {
    name: 'SAFRU SA — Société d\'Aménagement Foncier et de Rénovation urbaine',
    slug: 'safru-sa',
    description: 'Assure l\'aménagement foncier et la rénovation urbaine pour améliorer le cadre de vie des populations sénégalaises. Intervient dans la restructuration des quartiers informels. Dirigé par Ibrahima THIOYE.',
    activite: 'Aménagement foncier et rénovation des quartiers urbains',
    ville: 'Dakar',
  },

  // ── SANTÉ ────────────────────────────────────────────────────────────────
  {
    name: 'DGS — Direction générale de la Santé',
    slug: 'dgs-senegal',
    description: 'Dirige et coordonne la politique sanitaire nationale du Sénégal. Supervise les programmes de prévention, de lutte contre les épidémies et de santé publique. Dirigé par Dr Ousmane CISSE.',
    activite: 'Administration et politique de santé publique nationale',
    ville: 'Dakar',
    website: 'https://www.sante.gouv.sn',
  },
  {
    name: 'CMU — Agence sénégalaise de la Couverture Maladie Universelle',
    slug: 'cmu-senegal',
    description: 'Gère et développe le programme de couverture maladie universelle (mutuelles de santé) pour garantir l\'accès aux soins des populations vulnérables. Dirigé par SEGA GUEYE.',
    activite: 'Couverture maladie universelle et mutualité de santé',
    ville: 'Dakar',
    website: 'https://www.cmu.sn',
  },
  {
    name: 'ONAS — Office national de l\'Assainissement du Sénégal',
    slug: 'onas',
    description: 'Assure la collecte, le transport et le traitement des eaux usées dans les zones urbaines et périurbaines du Sénégal. Gère le réseau d\'assainissement et les stations d\'épuration. Dirigé par Dr Cheikh DIENG.',
    activite: 'Assainissement, collecte et traitement des eaux usées',
    ville: 'Dakar',
    website: 'https://www.onas.sn',
  },

  // ── HYDRAULIQUE / EAU ───────────────────────────────────────────────────
  {
    name: 'SONES — Société nationale des Eaux du Sénégal',
    slug: 'sones',
    description: 'Assure la production et la distribution de l\'eau potable sur l\'ensemble du territoire sénégalais. Gère les infrastructures hydrauliques et délègue la distribution à SEN\'EAU. Dirigé par Abdoul NIANG.',
    activite: 'Production et distribution d\'eau potable',
    ville: 'Dakar',
    website: 'https://www.sones.sn',
  },
  {
    name: 'OFOR — Office des Forages Ruraux',
    slug: 'ofor',
    description: 'Gère et entretient les forages ruraux et les systèmes d\'adduction d\'eau dans les zones rurales du Sénégal pour garantir l\'accès à l\'eau potable en dehors des villes.',
    activite: 'Forages ruraux et accès à l\'eau en zone rurale',
    ville: 'Dakar',
  },

  // ── AGRICULTURE / ENVIRONNEMENT ──────────────────────────────────────────
  {
    name: 'Agence sénégalaise de Reforestation et de la Grande Muraille Verte',
    slug: 'agence-grande-muraille-verte',
    description: 'Coordonne les programmes nationaux de reforestation et la mise en œuvre de la Grande Muraille Verte au Sénégal. Lutte contre la désertification et protège la biodiversité. Dirigé par Sékouna DIATTA.',
    activite: 'Reforestation, reboisement et lutte contre la désertification',
    ville: 'Dakar',
  },
  {
    name: 'ISRA — Institut sénégalais de Recherches agricoles',
    slug: 'isra',
    description: 'Mène des recherches scientifiques pour améliorer la productivité agricole, l\'élevage et la gestion des ressources naturelles au Sénégal. Développe des variétés adaptées au contexte sénégalais.',
    activite: 'Recherche agronomique et développement agricole',
    ville: 'Dakar',
    website: 'https://www.isra.sn',
  },
  {
    name: 'SAED — Société d\'Aménagement et d\'Exploitation des terres du Delta',
    slug: 'saed',
    description: 'Aménage et met en valeur les terres agricoles de la vallée et du delta du fleuve Sénégal pour la riziculture et l\'horticulture irriguée. Soutient les agriculteurs de Saint-Louis et du nord du pays.',
    activite: 'Aménagement agricole du Delta du fleuve Sénégal',
    ville: 'Saint-Louis',
    website: 'https://www.saed.sn',
  },
  {
    name: 'ANA — Agence nationale de l\'Aquaculture',
    slug: 'ana-aquaculture',
    description: 'Développe et promeut l\'aquaculture au Sénégal comme secteur stratégique pour la sécurité alimentaire et la création d\'emplois. Encadre les aquaculteurs et vulgarise les bonnes pratiques.',
    activite: 'Développement de l\'aquaculture et pisciculture',
    ville: 'Dakar',
  },

  // ── PÊCHES / MARITIME ────────────────────────────────────────────────────
  {
    name: 'ANAM — Agence nationale des Affaires maritimes',
    slug: 'anam-senegal',
    description: 'Régule les activités maritimes au Sénégal : immatriculation et contrôle des navires, sécurité de la navigation, certification des marins et inspections des bateaux de pêche. Dirigé par Bécaye DIOP.',
    activite: 'Régulation maritime, sécurité en mer et certification des marins',
    ville: 'Dakar',
  },
  {
    name: 'COSAMA — Consortium sénégalais d\'Activités maritimes',
    slug: 'cosama',
    description: 'Promeut et développe les activités maritimes sénégalaises dans le commerce, le transport naval et les services portuaires. Dirigé par Baba TALL.',
    activite: 'Activités maritimes commerciales et services navals',
    ville: 'Dakar',
  },

  // ── URBANISME / LOGEMENT ────────────────────────────────────────────────
  {
    name: 'SN-HLM — Société nationale des Habitations à Loyer Modéré',
    slug: 'sn-hlm',
    description: 'Construit et gère des logements sociaux abordables pour les ménages à revenus modestes et moyens. Principal bailleur social du Sénégal. Dirigé par Bassirou KEBE.',
    activite: 'Logements sociaux et habitations à loyer modéré',
    ville: 'Dakar',
    website: 'https://www.snhlm.sn',
  },
  {
    name: 'SICAP SA — Société immobilière du Cap Vert',
    slug: 'sicap-sa',
    description: 'Réalise des programmes de logement et d\'aménagement immobilier pour les fonctionnaires et ménages sénégalais. Gère un important parc immobilier à Dakar et en régions. Dirigé par Mouhamadou Moctar MAGASSOUBA.',
    activite: 'Promotion immobilière et logements fonctionnaires',
    ville: 'Dakar',
    website: 'https://www.sicap.sn',
  },
  {
    name: 'ANAT — Agence nationale de l\'Aménagement du Territoire',
    slug: 'anat-senegal',
    description: 'Planifie et coordonne l\'aménagement équilibré du territoire sénégalais entre ses différentes régions. Élabore les schémas directeurs et les plans d\'occupation des sols. Dirigé par Tidiane SIDIBE.',
    activite: 'Aménagement du territoire et planification régionale',
    ville: 'Dakar',
  },

  // ── COMMUNICATION / TÉLÉCOMS / NUMÉRIQUE ────────────────────────────────
  {
    name: 'RTS — Radiotélévision Sénégalaise',
    slug: 'rts-senegal',
    description: 'Télévision et radio publique nationale du Sénégal. Produit et diffuse des programmes d\'information, de culture et de divertissement en français et en langues nationales. Dirigé par Pape Alé NIANG.',
    activite: 'Audiovisuel public national, radio et télévision',
    ville: 'Dakar',
    website: 'https://www.rts.sn',
  },
  {
    name: 'SN-La Poste',
    slug: 'sn-la-poste',
    description: 'Service postal national du Sénégal. Offre des services de courrier, de colis, de transfert d\'argent (Postefinances) et de services financiers postaux à travers son réseau national. Dirigé par Maguette KANE.',
    activite: 'Services postaux, courrier et services financiers postaux',
    ville: 'Dakar',
    website: 'https://www.laposte.sn',
  },
  {
    name: 'ARTP — Autorité de Régulation des Télécommunications et des Postes',
    slug: 'artp',
    description: 'Régule le secteur des télécommunications, d\'Internet et des postes au Sénégal. Attribue les licences, définit les tarifs de référence et veille à une concurrence loyale entre opérateurs. Dirigé par Dahirou THIAM.',
    activite: 'Régulation des télécommunications, Internet et services postaux',
    ville: 'Dakar',
    website: 'https://www.artp.sn',
  },
  {
    name: 'SENUM SA — Sénégal Numérique',
    slug: 'senum-sa',
    description: 'Structure publique chargée du déploiement de l\'infrastructure numérique nationale, du très haut débit et de la transformation digitale de l\'État sénégalais. Dirigé par Isidore DIOUF.',
    activite: 'Infrastructure numérique, haut débit et e-gouvernement',
    ville: 'Dakar',
  },
  {
    name: 'TDS-SA — Société Télédiffusion du Sénégal',
    slug: 'tds-sa',
    description: 'Gère l\'infrastructure de diffusion de la Télévision Numérique Terrestre (TNT) au Sénégal. Assure la couverture numérique du territoire et la migration de l\'analogique vers le numérique. Dirigé par Aminata SARR.',
    activite: 'Télédiffusion numérique terrestre (TNT)',
    ville: 'Dakar',
  },
  {
    name: 'APS — Agence de Presse Sénégalaise',
    slug: 'aps-senegal',
    description: 'Agence de presse officielle du Sénégal. Collecte, traite et diffuse l\'information nationale et internationale auprès des médias et institutions. Dirigé par Momar DIONGUE.',
    activite: 'Information, dépêches de presse et agence nationale d\'information',
    ville: 'Dakar',
    website: 'https://www.aps.sn',
  },

  // ── CULTURE / TOURISME / ARTISANAT ──────────────────────────────────────
  {
    name: 'SAPCO SA — Société d\'Aménagement et de Promotion des Côtes et Zones touristiques',
    slug: 'sapco-sa',
    description: 'Aménage et développe les zones touristiques du Sénégal, notamment Saly-Portudal et la Petite Côte. Commercialise les terrains touristiques auprès des opérateurs hôteliers. Dirigé par Serigne Mamadou MBOUP.',
    activite: 'Aménagement touristique et zones côtières',
    ville: 'Saly',
    website: 'https://www.sapco.sn',
  },
  {
    name: 'ASPT — Agence sénégalaise de Promotion touristique',
    slug: 'aspt-senegal',
    description: 'Promeut la destination Sénégal à l\'international et développe l\'attractivité touristique nationale. Soutient les acteurs du tourisme et assure la promotion des sites culturels et naturels.',
    activite: 'Promotion touristique nationale et internationale',
    ville: 'Dakar',
    website: 'https://www.tourisme.sn',
  },
  {
    name: 'Musée des Civilisations noires',
    slug: 'musee-civilisations-noires',
    description: 'Musée national dédié aux civilisations africaines et à la diaspora. Espace culturel et éducatif de référence à Dakar qui valorise le patrimoine commun des peuples noirs. Dirigé par Mohamed Abdallah LY.',
    activite: 'Patrimoine culturel africain, musée national et éducation',
    ville: 'Dakar',
  },
  {
    name: 'Grand Théâtre national Daniel Sorano',
    slug: 'grand-theatre-national',
    description: 'Principale scène nationale du Sénégal, accueille spectacles, concerts, théâtre et événements culturels majeurs. Fleuron de la vie culturelle dakaroise.',
    activite: 'Arts du spectacle, culture et événements nationaux',
    ville: 'Dakar',
  },

  // ── ENSEIGNEMENT SUPÉRIEUR ──────────────────────────────────────────────
  {
    name: 'COUD — Centre des Œuvres universitaires de Dakar',
    slug: 'coud',
    description: 'Gère les services sociaux, restaurants universitaires et hébergements des étudiants de l\'UCAD (Université Cheikh Anta Diop). Facilite l\'accès aux études pour les étudiants boursiers. Dirigé par Ndéné MBODJ.',
    activite: 'Œuvres universitaires, restaurants et résidences étudiantes',
    ville: 'Dakar',
    website: 'https://www.coud.sn',
  },

  // ── EMPLOI / JEUNESSE ────────────────────────────────────────────────────
  {
    name: 'ANPEJ — Agence nationale pour la Promotion et l\'Emploi des Jeunes',
    slug: 'anpej',
    description: 'Facilite l\'insertion professionnelle et l\'entrepreneuriat des jeunes sénégalais à travers des formations qualifiantes, du placement et du financement. Secrétaire général : Babacar Wagane FAYE.',
    activite: 'Emploi des jeunes, formation professionnelle et entrepreneuriat',
    ville: 'Dakar',
    website: 'https://www.anpej.sn',
  },

  // ── MICROFINANCE / INCLUSION ─────────────────────────────────────────────
  {
    name: 'DER/FJ — Délégation générale à l\'Entrepreneuriat Rapide des Femmes et des Jeunes',
    slug: 'der-fj',
    description: 'Finance et accompagne les femmes et jeunes entrepreneurs sénégalais pour créer des activités génératrices de revenus et sortir de la pauvreté. Structure de financement populaire pour les micro-projets.',
    activite: 'Financement de l\'entrepreneuriat féminin et des jeunes',
    ville: 'Dakar',
    website: 'https://www.derfj.sn',
  },

  // ── LOTERIE / JEUX ───────────────────────────────────────────────────────
  {
    name: 'LONASE — Loterie nationale sénégalaise',
    slug: 'lonase',
    description: 'Société nationale qui gère les jeux de hasard légaux au Sénégal (tiercé, loterie, paris sportifs). Reverse une partie de ses bénéfices au financement du sport et de l\'éducation nationale.',
    activite: 'Jeux de hasard légaux, loterie nationale et paris sportifs',
    ville: 'Dakar',
    website: 'https://www.lonase.sn',
  },

  // ── STATISTIQUES ─────────────────────────────────────────────────────────
  {
    name: 'ANSD — Agence nationale de la Statistique et de la Démographie',
    slug: 'ansd',
    description: 'Produit les statistiques officielles du Sénégal : recensement général de la population, enquêtes sur le niveau de vie, indicateurs économiques, sociaux et démographiques. Référence pour la planification nationale.',
    activite: 'Statistiques nationales, recensements et démographie',
    ville: 'Dakar',
    website: 'https://www.ansd.sn',
  },

  // ── SÉCURITÉ / INTÉRIEUR ─────────────────────────────────────────────────
  {
    name: 'ASP — Agence d\'Assistance à la Sécurité de Proximité',
    slug: 'asp-senegal',
    description: 'Assure la sécurité de proximité dans les quartiers, marchés et espaces publics du Sénégal, en complément des forces de police et de gendarmerie. Recrute et forme des agents de sécurité de proximité.',
    activite: 'Sécurité de proximité dans les espaces publics',
    ville: 'Dakar',
  },
];

// ── Script principal ─────────────────────────────────────────────────────────
async function main() {
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('  🌱  SEED : Services Publics & Agences de l\'État sénégalais');
  console.log('═══════════════════════════════════════════════════════════════\n');

  // 1. Créer / récupérer la catégorie
  const category = await prisma.category.upsert({
    where:  { slug: 'services-publics' },
    update: { name: 'Services Publics et Agences de l\'État' },
    create: { name: 'Services Publics et Agences de l\'État', slug: 'services-publics' },
  });
  console.log(`✅ Catégorie : "${category.name}" (ID: ${category.id})\n`);

  // 2. Insérer / migrer chaque agence
  let created  = 0;
  let migrated = 0;
  let errors   = 0;

  for (const agency of AGENCIES) {
    try {
      const result = await prisma.company.upsert({
        where: { slug: agency.slug },
        update: {
          categoryId:  category.id,
          description: agency.description,
          activite:    agency.activite,
          ville:       agency.ville || 'Dakar',
          ...(agency.website ? { website: agency.website } : {}),
        },
        create: {
          name:        agency.name,
          slug:        agency.slug,
          description: agency.description,
          activite:    agency.activite,
          ville:       agency.ville || 'Dakar',
          categoryId:  category.id,
          ...(agency.website ? { website: agency.website } : {}),
        },
      });

      const existed = result.createdAt < result.updatedAt;
      if (existed) {
        migrated++;
        console.log(`  🔄  ${agency.name}`);
      } else {
        created++;
        console.log(`  ✅  ${agency.name}`);
      }
    } catch (err) {
      errors++;
      console.error(`  ❌  ${agency.name} → ${err.message}`);
    }
  }

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log(`  ✅  ${created} agences créées`);
  console.log(`  🔄  ${migrated} entreprises migrées vers "Services Publics"`);
  if (errors) console.log(`  ❌  ${errors} erreurs`);
  console.log('═══════════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
