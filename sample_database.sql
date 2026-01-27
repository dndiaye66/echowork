-- ===============================================
-- EchoWork Database Sample Data
-- PostgreSQL SQL Script
-- ===============================================
-- This file contains sample data for testing the EchoWork application
-- Import this file into your PostgreSQL database to see:
-- - Categories of companies
-- - Sample companies in each category
-- - Users (both regular and admin)
-- - Reviews and ratings
-- - Job offers
-- - Advertisements
-- ===============================================

-- Note: This assumes tables already exist (run Prisma migrations first)
-- If tables don't exist, uncomment the CREATE TABLE statements below

-- ===============================================
-- CLEAR EXISTING DATA (Optional - use with caution)
-- ===============================================
-- Uncomment these lines if you want to start fresh
-- TRUNCATE TABLE "Advertisement" CASCADE;
-- TRUNCATE TABLE "JobOffer" CASCADE;
-- TRUNCATE TABLE "Review" CASCADE;
-- TRUNCATE TABLE "Company" CASCADE;
-- TRUNCATE TABLE "Category" CASCADE;
-- TRUNCATE TABLE "User" CASCADE;

-- ===============================================
-- USERS
-- ===============================================
-- Password for all users is 'password123' (hashed with bcrypt)
-- Note: In production, use proper password hashing
INSERT INTO "User" (id, username, email, password, role, "createdAt", "updatedAt") VALUES
(1, 'admin', 'admin@echowork.sn', '$2b$10$YourHashedPasswordHere1', 'ADMIN', NOW(), NOW()),
(2, 'john_doe', 'john@example.com', '$2b$10$YourHashedPasswordHere2', 'USER', NOW(), NOW()),
(3, 'marie_diop', 'marie@example.com', '$2b$10$YourHashedPasswordHere3', 'USER', NOW(), NOW()),
(4, 'ousmane_fall', 'ousmane@example.com', '$2b$10$YourHashedPasswordHere4', 'USER', NOW(), NOW()),
(5, 'awa_ndiaye', 'awa@example.com', '$2b$10$YourHashedPasswordHere5', 'USER', NOW(), NOW()),
(6, 'fatou_sow', 'fatou@example.com', '$2b$10$YourHashedPasswordHere6', 'USER', NOW(), NOW()),
(7, 'ibrahima_sy', 'ibrahima@example.com', '$2b$10$YourHashedPasswordHere7', 'USER', NOW(), NOW()),
(8, 'aissatou_ba', 'aissatou@example.com', '$2b$10$YourHashedPasswordHere8', 'USER', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Reset user sequence
SELECT setval('"User_id_seq"', (SELECT MAX(id) FROM "User"));

-- ===============================================
-- CATEGORIES
-- ===============================================
INSERT INTO "Category" (id, name, slug) VALUES
(1, 'Banques', 'banques'),
(2, 'Restaurants', 'restaurants'),
(3, 'Services publics', 'services-publics'),
(4, 'Hôtels', 'hotels'),
(5, 'Healthcare', 'healthcare'),
(6, 'Vente au détail', 'vente-detail')
ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name;

-- Reset category sequence
SELECT setval('"Category_id_seq"', (SELECT MAX(id) FROM "Category"));

-- ===============================================
-- COMPANIES - BANQUES
-- ===============================================
INSERT INTO "Company" (id, name, slug, description, "imageUrl", ville, adresse, tel, activite, "categoryId", "createdAt", "updatedAt") VALUES
(1, 'Banque de Dakar', 'banque-de-dakar', 'Banque commerciale offrant des services bancaires complets', NULL, 'Dakar', 'Avenue Léopold Sédar Senghor, Plateau', '+221 33 823 45 67', 'Services bancaires et financiers', 1, NOW(), NOW()),
(2, 'Ecobank Sénégal', 'ecobank-senegal', 'Banque panafricaine avec services innovants', NULL, 'Dakar', 'Boulevard de la République, Centre-ville', '+221 33 849 23 45', 'Banque commerciale', 1, NOW(), NOW()),
(3, 'SGBS (Société Générale)', 'sgbs-societe-generale', 'Filiale sénégalaise de la Société Générale', NULL, 'Dakar', 'Place de l''Indépendance', '+221 33 839 73 73', 'Services bancaires internationaux', 1, NOW(), NOW()),
(4, 'CBAO Attijariwafa Bank', 'cbao-attijariwafa-bank', 'Leader de la banque au Sénégal', NULL, 'Dakar', '1, Place de l''Indépendance', '+221 33 839 90 10', 'Banque de détail et entreprise', 1, NOW(), NOW()),
(5, 'BOA Sénégal', 'boa-senegal', 'Bank of Africa, services aux particuliers et entreprises', NULL, 'Dakar', 'Rue Vincens x Rue Raffenel', '+221 33 849 53 00', 'Banque commerciale', 1, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ===============================================
-- COMPANIES - RESTAURANTS
-- ===============================================
INSERT INTO "Company" (id, name, slug, description, "imageUrl", ville, adresse, tel, activite, "categoryId", "createdAt", "updatedAt") VALUES
(6, 'Le Lagon 1', 'le-lagon-1', 'Restaurant gastronomique avec vue sur l''océan', NULL, 'Dakar', 'Route de la Corniche Ouest, Almadies', '+221 33 820 10 58', 'Restaurant gastronomique', 2, NOW(), NOW()),
(7, 'Chez Loutcha', 'chez-loutcha', 'Cuisine sénégalaise traditionnelle authentique', NULL, 'Dakar', 'Rue Moussé Diop, Plateau', '+221 33 821 90 58', 'Restaurant local', 2, NOW(), NOW()),
(8, 'La Calebasse', 'la-calebasse', 'Spécialités africaines et internationales', NULL, 'Dakar', 'Route de Ngor, Les Almadies', '+221 33 820 57 47', 'Restaurant traditionnel', 2, NOW(), NOW()),
(9, 'Le Djembé', 'le-djembe', 'Ambiance africaine et plats traditionnels', NULL, 'Dakar', 'Rue de Thann x Blaise Diagne', '+221 33 822 24 71', 'Restaurant bar', 2, NOW(), NOW()),
(10, 'Ocean Blue', 'ocean-blue', 'Fruits de mer frais et cuisine internationale', NULL, 'Dakar', 'Pointe des Almadies', '+221 77 555 44 33', 'Restaurant de fruits de mer', 2, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ===============================================
-- COMPANIES - SERVICES PUBLICS
-- ===============================================
INSERT INTO "Company" (id, name, slug, description, "imageUrl", ville, adresse, tel, activite, "categoryId", "createdAt", "updatedAt") VALUES
(11, 'SENELEC', 'senelec', 'Société Nationale d''Électricité du Sénégal', NULL, 'Dakar', 'Rue Vincens x El Hadji Malick Sy', '+221 33 839 31 31', 'Production et distribution d''électricité', 3, NOW(), NOW()),
(12, 'SDE (Sénégalaise des Eaux)', 'sde-senegalaise-des-eaux', 'Distribution de l''eau potable au Sénégal', NULL, 'Dakar', 'Hann Maristes', '+221 800 00 11 11', 'Distribution d''eau potable', 3, NOW(), NOW()),
(13, 'La Poste Sénégal', 'la-poste-senegal', 'Services postaux et financiers', NULL, 'Dakar', 'Boulevard El Hadji Djily Mbaye', '+221 33 823 00 32', 'Services postaux', 3, NOW(), NOW()),
(14, 'Mairie de Dakar', 'mairie-de-dakar', 'Administration municipale de Dakar', NULL, 'Dakar', 'Place de l''Indépendance', '+221 33 849 13 00', 'Administration publique', 3, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ===============================================
-- COMPANIES - HOTELS
-- ===============================================
INSERT INTO "Company" (id, name, slug, description, "imageUrl", ville, adresse, tel, activite, "categoryId", "createdAt", "updatedAt") VALUES
(15, 'Radisson Blu Hotel Dakar', 'radisson-blu-hotel-dakar', 'Hôtel 5 étoiles avec vue panoramique sur l''océan', NULL, 'Dakar', 'Route de la Corniche Ouest', '+221 33 869 20 00', 'Hôtel de luxe', 4, NOW(), NOW()),
(16, 'Hôtel Terrou-Bi', 'hotel-terrou-bi', 'Complexe hôtelier de luxe avec casino', NULL, 'Dakar', 'Route de la Corniche Ouest', '+221 33 839 90 00', 'Hôtel & Resort', 4, NOW(), NOW()),
(17, 'Pullman Dakar Teranga', 'pullman-dakar-teranga', 'Hôtel d''affaires moderne au centre-ville', NULL, 'Dakar', 'Place de l''Indépendance', '+221 33 849 24 24', 'Hôtel business', 4, NOW(), NOW()),
(18, 'King Fahd Palace', 'king-fahd-palace', 'Hôtel de prestige avec service premium', NULL, 'Dakar', 'Route de la Corniche Ouest, Almadies', '+221 33 869 68 69', 'Hôtel 5 étoiles', 4, NOW(), NOW()),
(19, 'Onomo Hotel Dakar', 'onomo-hotel-dakar', 'Hôtel moderne et abordable', NULL, 'Dakar', 'Route de l''Aéroport', '+221 33 869 13 13', 'Hôtel économique', 4, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ===============================================
-- COMPANIES - HEALTHCARE
-- ===============================================
INSERT INTO "Company" (id, name, slug, description, "imageUrl", ville, adresse, tel, activite, "categoryId", "createdAt", "updatedAt") VALUES
(20, 'Hôpital Principal de Dakar', 'hopital-principal-de-dakar', 'Principal hôpital militaire du Sénégal', NULL, 'Dakar', 'Avenue Nelson Mandela', '+221 33 839 50 50', 'Hôpital général', 5, NOW(), NOW()),
(21, 'Clinique de la Madeleine', 'clinique-de-la-madeleine', 'Clinique privée moderne avec équipements de pointe', NULL, 'Dakar', 'Route de Ouakam', '+221 33 860 20 20', 'Clinique privée', 5, NOW(), NOW()),
(22, 'Hôpital Aristide Le Dantec', 'hopital-aristide-le-dantec', 'Hôpital public universitaire', NULL, 'Dakar', 'Avenue Pasteur', '+221 33 839 50 42', 'Hôpital universitaire', 5, NOW(), NOW()),
(23, 'Polyclinique Madiba', 'polyclinique-madiba', 'Centre médical avec services multidisciplinaires', NULL, 'Dakar', 'Liberté 6', '+221 33 867 17 17', 'Polyclinique', 5, NOW(), NOW()),
(24, 'Centre Médical Suma Assistance', 'centre-medical-suma-assistance', 'Soins médicaux d''urgence et consultation', NULL, 'Dakar', 'Mermoz Pyrotechnie', '+221 33 824 24 18', 'Centre médical', 5, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- ===============================================
-- COMPANIES - VENTE AU DETAIL
-- ===============================================
INSERT INTO "Company" (id, name, slug, description, "imageUrl", ville, adresse, tel, activite, "categoryId", "createdAt", "updatedAt") VALUES
(25, 'Auchan Sénégal', 'auchan-senegal', 'Hypermarché moderne avec large gamme de produits', NULL, 'Dakar', 'Sea Plaza, Les Almadies', '+221 33 869 60 00', 'Hypermarché', 6, NOW(), NOW()),
(26, 'Casino Supermarché', 'casino-supermarche', 'Chaîne de supermarchés de proximité', NULL, 'Dakar', 'Diverses localisations', '+221 33 824 50 60', 'Supermarché', 6, NOW(), NOW()),
(27, 'Exclusive', 'exclusive', 'Magasin de produits de luxe et mode', NULL, 'Dakar', 'Sea Plaza, Les Almadies', '+221 33 820 20 02', 'Boutique de luxe', 6, NOW(), NOW()),
(28, 'Marché Kermel', 'marche-kermel', 'Marché traditionnel avec produits frais', NULL, 'Dakar', 'Place Kermel, Plateau', '+221 77 123 45 67', 'Marché traditionnel', 6, NOW(), NOW()),
(29, 'Score Touba Sandaga', 'score-touba-sandaga', 'Supermarché populaire au centre-ville', NULL, 'Dakar', 'Rue Sandaga', '+221 33 821 66 66', 'Supermarché', 6, NOW(), NOW())
ON CONFLICT (slug) DO NOTHING;

-- Reset company sequence
SELECT setval('"Company_id_seq"', (SELECT MAX(id) FROM "Company"));

-- ===============================================
-- REVIEWS
-- ===============================================
-- Reviews for Banques
INSERT INTO "Review" (id, rating, comment, "userId", "companyId", upvotes, downvotes, "createdAt", "updatedAt") VALUES
(1, 5, 'Excellent service bancaire, personnel très professionnel et réactif. Je recommande vivement!', 2, 1, 15, 2, NOW() - INTERVAL '10 days', NOW()),
(2, 4, 'Bonne banque mais les délais peuvent être longs parfois. Dans l''ensemble satisfait.', 3, 1, 8, 1, NOW() - INTERVAL '8 days', NOW()),
(3, 5, 'Services en ligne très pratiques. L''application mobile fonctionne parfaitement.', 4, 2, 20, 0, NOW() - INTERVAL '5 days', NOW()),
(4, 3, 'Service correct mais files d''attente assez longues en agence.', 5, 2, 5, 3, NOW() - INTERVAL '4 days', NOW()),
(5, 5, 'Meilleure banque du Sénégal! Service client exceptionnel.', 6, 3, 25, 1, NOW() - INTERVAL '7 days', NOW()),

-- Reviews for Restaurants
(6, 5, 'Cuisine exceptionnelle avec une vue magnifique! Le thiéboudienne est délicieux.', 2, 6, 18, 0, NOW() - INTERVAL '6 days', NOW()),
(7, 4, 'Très bon restaurant, ambiance agréable. Prix un peu élevés.', 3, 6, 10, 2, NOW() - INTERVAL '5 days', NOW()),
(8, 5, 'Meilleur restaurant de cuisine sénégalaise à Dakar! Authentique et savoureux.', 4, 7, 22, 0, NOW() - INTERVAL '9 days', NOW()),
(9, 4, 'Bonne nourriture, service rapide et personnel accueillant.', 5, 7, 12, 1, NOW() - INTERVAL '3 days', NOW()),
(10, 5, 'Excellente découverte! Les plats sont délicieux et copieux.', 6, 8, 16, 0, NOW() - INTERVAL '2 days', NOW()),

-- Reviews for Hotels
(11, 5, 'Hôtel magnifique avec vue sur mer. Petit-déjeuner somptueux!', 2, 15, 30, 1, NOW() - INTERVAL '12 days', NOW()),
(12, 4, 'Très bon séjour, chambres confortables et propres.', 3, 15, 14, 0, NOW() - INTERVAL '8 days', NOW()),
(13, 5, 'Service impeccable, personnel aux petits soins. Je reviendrai!', 4, 16, 28, 2, NOW() - INTERVAL '11 days', NOW()),
(14, 4, 'Bon rapport qualité-prix, bien situé au centre-ville.', 5, 17, 11, 1, NOW() - INTERVAL '6 days', NOW()),
(15, 3, 'Hôtel correct mais un peu vieillissant. Service moyen.', 6, 17, 5, 4, NOW() - INTERVAL '4 days', NOW()),

-- Reviews for Healthcare
(16, 5, 'Excellent hôpital, médecins compétents et équipements modernes.', 2, 20, 35, 2, NOW() - INTERVAL '15 days', NOW()),
(17, 4, 'Bon service médical, mais l''attente peut être longue aux urgences.', 3, 20, 18, 3, NOW() - INTERVAL '10 days', NOW()),
(18, 5, 'Clinique très professionnelle, soins de qualité. Je recommande!', 4, 21, 25, 0, NOW() - INTERVAL '7 days', NOW()),
(19, 5, 'Personnel médical très attentionné. Équipements de dernière génération.', 5, 21, 22, 1, NOW() - INTERVAL '5 days', NOW()),
(20, 4, 'Bonne clinique mais les tarifs sont assez élevés.', 6, 21, 8, 2, NOW() - INTERVAL '3 days', NOW()),
(21, 3, 'Service acceptable mais manque de personnel. Temps d''attente trop long.', 7, 22, 6, 5, NOW() - INTERVAL '9 days', NOW()),
(22, 5, 'Excellente polyclinique! Médecins très professionnels.', 8, 23, 19, 0, NOW() - INTERVAL '4 days', NOW()),

-- Reviews for Vente au détail
(23, 5, 'Grand choix de produits, très bien organisé. Prix compétitifs.', 2, 25, 20, 1, NOW() - INTERVAL '6 days', NOW()),
(24, 4, 'Bon supermarché avec produits de qualité. Parking pratique.', 3, 25, 12, 0, NOW() - INTERVAL '4 days', NOW()),
(25, 5, 'Supermarché de proximité très pratique. Personnel aimable.', 4, 26, 15, 1, NOW() - INTERVAL '3 days', NOW()),
(26, 4, 'Belle boutique avec marques de luxe. Service client excellent.', 5, 27, 10, 0, NOW() - INTERVAL '8 days', NOW()),
(27, 5, 'Marché authentique avec produits frais du jour. Incontournable!', 6, 28, 25, 2, NOW() - INTERVAL '5 days', NOW()),

-- Reviews for Services publics
(28, 2, 'Trop de coupures d''électricité. Service client peu réactif.', 7, 11, 40, 5, NOW() - INTERVAL '14 days', NOW()),
(29, 3, 'Service s''améliore mais reste beaucoup de problèmes à résoudre.', 8, 11, 15, 8, NOW() - INTERVAL '7 days', NOW()),
(30, 3, 'Distribution d''eau parfois irrégulière. Besoin d''amélioration.', 2, 12, 12, 6, NOW() - INTERVAL '5 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Reset review sequence
SELECT setval('"Review_id_seq"', (SELECT MAX(id) FROM "Review"));

-- ===============================================
-- JOB OFFERS
-- ===============================================
INSERT INTO "JobOffer" (id, title, description, salary, location, "companyId", "isActive", "createdAt", "updatedAt") VALUES
(1, 'Conseiller Clientèle', 'Nous recherchons un conseiller clientèle dynamique pour rejoindre notre équipe. Vous serez en charge de l''accueil et du conseil de nos clients.', '250 000 - 350 000 FCFA', 'Dakar, Plateau', 1, true, NOW() - INTERVAL '5 days', NOW()),
(2, 'Chargé de Crédit', 'Analyser les demandes de crédit et accompagner les clients dans leurs projets de financement.', '400 000 - 600 000 FCFA', 'Dakar', 3, true, NOW() - INTERVAL '3 days', NOW()),
(3, 'Chef Cuisinier', 'Chef cuisinier expérimenté en cuisine sénégalaise et internationale. Minimum 5 ans d''expérience.', '500 000 - 700 000 FCFA', 'Dakar, Almadies', 6, true, NOW() - INTERVAL '7 days', NOW()),
(4, 'Serveur/Serveuse', 'Personne dynamique et souriante pour service en salle. Expérience souhaitée.', '150 000 - 200 000 FCFA', 'Dakar, Plateau', 7, true, NOW() - INTERVAL '2 days', NOW()),
(5, 'Réceptionniste d''Hôtel', 'Accueil des clients, gestion des réservations et coordination avec les autres services.', '200 000 - 300 000 FCFA', 'Dakar', 15, true, NOW() - INTERVAL '6 days', NOW()),
(6, 'Directeur d''Hôtel', 'Management complet de l''établissement. Expérience minimum 10 ans dans l''hôtellerie de luxe.', '1 500 000 - 2 500 000 FCFA', 'Dakar, Almadies', 18, true, NOW() - INTERVAL '10 days', NOW()),
(7, 'Infirmier(ère)', 'Soins aux patients, administration des traitements. Diplôme d''État requis.', '300 000 - 450 000 FCFA', 'Dakar', 21, true, NOW() - INTERVAL '4 days', NOW()),
(8, 'Médecin Généraliste', 'Consultation, diagnostic et suivi des patients. Doctorat en médecine requis.', '800 000 - 1 200 000 FCFA', 'Dakar', 23, true, NOW() - INTERVAL '8 days', NOW()),
(9, 'Caissier(ère)', 'Encaissement des clients, gestion de caisse. Rigueur et honnêteté indispensables.', '120 000 - 180 000 FCFA', 'Dakar', 25, true, NOW() - INTERVAL '3 days', NOW()),
(10, 'Responsable Rayon', 'Gestion d''un rayon, commandes, mise en rayon, gestion d''équipe.', '350 000 - 500 000 FCFA', 'Dakar, Almadies', 25, true, NOW() - INTERVAL '5 days', NOW()),
(11, 'Technicien Électricien', 'Maintenance et dépannage du réseau électrique. Formation technique requise.', '250 000 - 400 000 FCFA', 'Dakar et région', 11, true, NOW() - INTERVAL '9 days', NOW()),
(12, 'Agent d''Accueil', 'Accueil du public, orientation et gestion des demandes.', '150 000 - 220 000 FCFA', 'Dakar', 14, true, NOW() - INTERVAL '4 days', NOW())
ON CONFLICT (id) DO NOTHING;

-- Reset job offer sequence
SELECT setval('"JobOffer_id_seq"', (SELECT MAX(id) FROM "JobOffer"));

-- ===============================================
-- ADVERTISEMENTS
-- ===============================================
INSERT INTO "Advertisement" (id, title, content, "imageUrl", "companyId", "startDate", "endDate", "isActive", "createdAt", "updatedAt") VALUES
(1, 'Promotion Spéciale Rentrée', 'Ouvrez un compte épargne et bénéficiez de 5% de taux d''intérêt la première année!', NULL, 1, NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days', true, NOW(), NOW()),
(2, 'Crédit Immobilier Avantageux', 'Taux préférentiel de 6% sur 20 ans. Réalisez votre rêve immobilier!', NULL, 3, NOW() - INTERVAL '5 days', NOW() + INTERVAL '25 days', true, NOW(), NOW()),
(3, 'Menu Découverte à -30%', 'Tous les jeudis, découvrez notre menu gastronomique 5 services à prix réduit.', NULL, 6, NOW() - INTERVAL '2 days', NOW() + INTERVAL '28 days', true, NOW(), NOW()),
(4, 'Brunch du Weekend', 'Brunch buffet tous les samedis et dimanches de 10h à 15h. 15 000 FCFA/personne.', NULL, 8, NOW() - INTERVAL '1 day', NOW() + INTERVAL '60 days', true, NOW(), NOW()),
(5, 'Offre Séjour d''Été', 'Réservez 3 nuits et payez seulement 2! Offre valable jusqu''à fin août.', NULL, 15, NOW() - INTERVAL '7 days', NOW() + INTERVAL '60 days', true, NOW(), NOW()),
(6, 'Package Lune de Miel', 'Package romantique tout inclus avec spa et dîner aux chandelles. À partir de 350 000 FCFA.', NULL, 16, NOW() - INTERVAL '4 days', NOW() + INTERVAL '90 days', true, NOW(), NOW()),
(7, 'Bilan de Santé Complet', 'Checkup complet à prix promotionnel: 50 000 FCFA au lieu de 75 000 FCFA.', NULL, 21, NOW() - INTERVAL '6 days', NOW() + INTERVAL '30 days', true, NOW(), NOW()),
(8, 'Vaccination Gratuite', 'Campagne de vaccination gratuite pour les enfants de 0 à 5 ans.', NULL, 22, NOW() - INTERVAL '10 days', NOW() + INTERVAL '20 days', true, NOW(), NOW()),
(9, 'Soldes d''Été -50%', 'Jusqu''à 50% de réduction sur une sélection d''articles. Ne manquez pas cette occasion!', NULL, 25, NOW() - INTERVAL '3 days', NOW() + INTERVAL '27 days', true, NOW(), NOW()),
(10, 'Carte Fidélité', 'Inscrivez-vous à notre programme de fidélité et cumulez des points à chaque achat!', NULL, 26, NOW() - INTERVAL '15 days', NOW() + INTERVAL '345 days', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Reset advertisement sequence
SELECT setval('"Advertisement_id_seq"', (SELECT MAX(id) FROM "Advertisement"));

-- ===============================================
-- VERIFICATION QUERIES
-- ===============================================
-- Run these queries to verify the data was imported correctly:

-- Check categories
-- SELECT id, name, slug FROM "Category" ORDER BY id;

-- Check companies count by category
-- SELECT c.name as category, COUNT(co.*) as company_count 
-- FROM "Category" c 
-- LEFT JOIN "Company" co ON c.id = co."categoryId" 
-- GROUP BY c.id, c.name 
-- ORDER BY c.id;

-- Check users
-- SELECT id, username, email, role FROM "User" ORDER BY id;

-- Check reviews with company names
-- SELECT r.id, u.username, c.name as company, r.rating, r.comment 
-- FROM "Review" r 
-- JOIN "User" u ON r."userId" = u.id 
-- JOIN "Company" c ON r."companyId" = c.id 
-- ORDER BY r.id 
-- LIMIT 10;

-- Check active job offers
-- SELECT j.title, c.name as company, j.salary, j.location 
-- FROM "JobOffer" j 
-- JOIN "Company" c ON j."companyId" = c.id 
-- WHERE j."isActive" = true 
-- ORDER BY j."createdAt" DESC;

-- Check active advertisements
-- SELECT a.title, c.name as company, a."startDate", a."endDate" 
-- FROM "Advertisement" a 
-- LEFT JOIN "Company" c ON a."companyId" = c.id 
-- WHERE a."isActive" = true 
-- ORDER BY a."createdAt" DESC;

-- ===============================================
-- IMPORTANT NOTES FOR PASSWORDS
-- ===============================================
-- The passwords in this file are placeholders (YourHashedPasswordHere1, etc.)
-- To generate actual bcrypt hashes, use:
-- 
-- For Node.js:
-- const bcrypt = require('bcrypt');
-- const hash = await bcrypt.hash('password123', 10);
-- 
-- Or use an online bcrypt generator with cost factor 10
-- 
-- Replace all instances of '$2b$10$YourHashedPasswordHere#' with actual bcrypt hashes
-- ===============================================

-- ===============================================
-- SCRIPT COMPLETE
-- ===============================================
-- Data import completed successfully!
-- Total inserted:
-- - 8 Users (including 1 admin)
-- - 6 Categories
-- - 29 Companies
-- - 30 Reviews
-- - 12 Job Offers
-- - 10 Advertisements
-- ===============================================
