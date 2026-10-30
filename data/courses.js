/* ────────────────────────────────────────────────────────────────────────────
   Courses autorisées par le staff — 0 to 100 (liste du 21/09/2026)
   ────────────────────────────────────────────────────────────────────────────
   Un objet par course :
     id       : identifiant unique (kebab-case) — c'est lui qui est stocké
                dans le Sheet des choix, NE PAS LE RENOMMER une fois en prod
     bloc     : "noel" | "mars" | "juin" | "juillet" (cf. BLOCS dans config.js)
     weekend  : id du week-end dans le bloc (samedi, AAAA-MM-JJ)
     name     : nom de la course (« Nom – format » : le format s'affiche en sous-titre, sans la distance)
     format   : sous-titre imposé (optionnel), quand le découpage automatique du nom ne convient pas
     dept     : département (ou pays)
     date     : jour précis (AAAA-MM-JJ, optionnel) si la course n'est pas
                le samedi — ex. EcoTrail 22 km le dimanche
     km, dplus: distance / dénivelé (nombres)
     tracks   : parcours autorisés → ["100"], ["40"] ou ["100", "40"]
     url      : site officiel / page d'inscription
     signup   : { open: "AAAA-MM-JJ" (date d'ouverture connue), close: "AAAA-MM-JJ"
                (fin de la fenêtre, optionnel), status: "open" (déjà ouvertes) | "waitlist" | "full" (complet, pas de liste d'attente),
                waitlist: true (fenêtre close → liste d'attente),
                expect: "≈ janv." (ouverture estimée, courte : pastille),
                note: texte libre (affiché dans l'accordéon « infos ») } — relevé du 22/09/2026, voir
                docs/inscriptions_releve_2026-09-22.md

   Liste 0 to 40 (« proche de Saint-Étienne ») : tableau du staff reçu le 07/10/2026,
   + Ambertrail 21 km et TGV 25 km (validés à l'oral) — 12 cartes + relais Citadelles 15 km. D+ = ceux du tableau staff. Une course à
   deux formats (10 ou 15 km) = une carte par format. Format court d'une course
   déjà listée en 0 to 100 = carte distincte avec son propre id (`-10`, `-15`,
   `-20`), jamais un renommage ; même format = on ajoute "40" à `tracks`.
   ──────────────────────────────────────────────────────────────────────────── */

window.COURSES = [
  /* ─── Noël · 10–15 km ─────────────────────────────────────────────────── */
  { id: "corrida-trail-ambarroise",  bloc: "noel", weekend: "2026-12-19", date: "2026-12-20", name: "Corrida-Trail Ambarroise",  dept: "01", km: 10, dplus: 450, tracks: ["100"],
    url: "https://in.njuko.com/corrida-trail-ambarroise-2026", signup: { status: "open", note: "ouvertes depuis le 5/10 sur njuko (jusqu'au 19/12 16h) — dim. 20/12/2026 à 10h, 13 € ; 300 places (≈ 250 libres au 26/10)" } },
  { id: "corrida-trail-ambarroise-5", bloc: "noel", weekend: "2026-12-19", date: "2026-12-20", name: "Corrida-Trail Ambarroise – 5 km", dept: "01", km: 5, tracks: ["40"],
    url: "https://in.njuko.com/corrida-trail-ambarroise-2026", signup: { status: "open", note: "même événement que le 10 km (Ambérieu-en-Bugey) — ouvertes sur njuko, dim. 20/12/2026 à 10h, 7 €, dès 13 ans ; 120 places (≈ 100 libres au 26/10) ; D+ non publié" } },
  { id: "trail-blanc-gashney",       bloc: "noel", weekend: "2026-12-19", name: "Trail Blanc du Gaschney",   dept: "68", km: 14, dplus: 650, tracks: ["100"],
    url: "https://www.sporkrono.fr/courses/1767212816/trail-blanc-du-gaschney/", signup: { status: "open", note: "sam. 19/12/2026 (11e édition) — ouvertes sur sporkrono depuis début oct. ; neige non garantie" } },
  { id: "14-18-noctrail",            bloc: "noel", weekend: "2026-12-19", name: "La 14-18 Noctrail",         dept: "60", km: 15, dplus: 400, tracks: ["100"],
    url: "https://www.la-1418.com/noctrail/", signup: { status: "open", note: "1 000 places, sur adeorun" } },
  { id: "trail-de-noel-70",          bloc: "noel", weekend: "2026-12-19", name: "Trail de Noël",             dept: "70", km: 15, dplus: 280, tracks: ["100"],
    url: "https://dampierre-sur-linotte.fr/traildenoel", signup: { expect: "≈ nov.", note: "rien de publié pour 2026 au 26/10 (le site parle de 2025, « Trail des Dolines », 15 et 10 km) — 2025 : dim. 21/12, inscriptions sur registration4all / le-sportif.com" } },
  { id: "nocturne-du-coeur",         bloc: "noel", weekend: "2026-12-19", name: "La Nocturne du Cœur",       dept: "31", km: 15, dplus: 300, tracks: ["100"],
    url: "https://chrono-start.com/Inscription/Course/detail/c/5565", signup: { open: "2026-11-02", note: "ouverture lun. 2/11/2026 à 7h (chrono-start) — sam. 19/12/2026 à Verfeil, 15 km à 18h : 18 € (9 km 15 €), au profit du Téléthon" } },
  { id: "nuit-des-fadarelles",       bloc: "noel", weekend: "2026-12-19", name: "La Nuit des Fadarelles",    dept: "48", km: 12, dplus: 410, tracks: ["100"],
    url: "https://www.triathlonlangognenaussac.fr/?page_id=2311", signup: { expect: "pré-inscription", note: "sam. 19/12/2026 à Fontanes, départ 18h30 — pré-inscription annoncée sur le site de l'orga, paiement sur place uniquement (le « 14 km » fait 12,3 km : 15 € ; 8 km 10 €), 249 places ; le lien klikego mène encore à l'édition 2025" } },
  { id: "trail-du-facteur",          bloc: "noel", weekend: "2026-12-19", name: "Trail du Facteur",          dept: "26", km: 17.2, dplus: 310, tracks: ["100"],
    url: "https://new.sportsnconnect.com/client/events/4qo9BijVbdkDbP17rsqxmg-le-trail-du-facteur-2026", signup: { status: "open", note: "⚠️ sans doute déjà plein : 375 places sur le 17,2 km et 325 sur le 9,2 km, les 100 places restantes semblent réservées aux sponsors (sportsnconnect, 26/10) — sam. 19/12/2026 à Hauterives, 17,2 km à 13h30, jusqu'à 17 €, inscriptions jusqu'au 16/12" } },
  { id: "montee-de-chambles",        bloc: "noel", weekend: "2026-12-26", date: "2026-12-27", name: "Montée de Chambles",        dept: "42", km: 11, dplus: 310, tracks: ["100", "40"],
    url: "https://www.logicourse.fr/inscriptions-3/1079-mdc2026.html", signup: { status: "open", close: "2026-12-21", note: "ouvertes (logicourse, 30/10) — dim. 27/12/2026, départ 10h, 11 km 310 D+ ; 16 € (15 € licenciés FFA) ; 1 500 dossards ; clôture lun. 21/12 à minuit" } },
  { id: "trail-de-la-guigne",        bloc: "noel", weekend: "2026-12-26", date: "2026-12-27", name: "Trail de la Guigne",        dept: "14", km: 14, dplus: 160, tracks: ["100"],
    url: "https://chronometrage.com/prices/traildelaguigne-1", signup: { status: "open", note: "ouvertes (chronometrage.com) — dim. 27/12/2026, 14 km à 9h30 : 13 € ; ≈ 610 places libres sur 750 mi-oct. (28/29 km : 25 € jusqu'au 20/11)" } },

  /* ─── Mars · 20–30 km ─────────────────────────────────────────────────── */
  { id: "trail-retournacois",        bloc: "mars", weekend: "2027-03-20", name: "Trail Retournacois – 24 km « VO2 Suc »",        dept: "43", km: 24, dplus: 1100, tracks: ["100"],
    url: "https://www.chronopuces.fr/trail-retournacois-2026", signup: { expect: "≈ mi-déc.", note: "2027 pas encore publié sur chronopuces au 26/10 — 2026 : dim. 22/03, ouvertes du 19/12/2025 au 21/03 (10 km 10–12 €, 15 km 13–15 €, 24 km 20–24 €)" } },
  { id: "trail-retournacois-10",     bloc: "mars", weekend: "2027-03-20", name: "Trail Retournacois – 10 km « La Bosse à Bloc »", dept: "43", km: 10, dplus: 360, tracks: ["40"],
    url: "https://www.chronopuces.fr/trail-retournacois-2026", signup: { expect: "≈ mi-déc.", note: "date 2027 à confirmer — 2026 : ouvertes du 19/12 au 21/03 → attendre mi-déc. 2026 (chronopuces)" } },
  { id: "trail-retournacois-15",     bloc: "mars", weekend: "2027-03-20", name: "Trail Retournacois – 15 km « Casse Patte »", dept: "43", km: 15, dplus: 700, tracks: ["40"],
    url: "https://www.chronopuces.fr/trail-retournacois-2026", signup: { expect: "≈ mi-déc.", note: "date 2027 à confirmer — 2026 : ouvertes du 19/12 au 21/03 → attendre mi-déc. 2026 (chronopuces)" } },
  { id: "trail-du-ventoux",          bloc: "mars", weekend: "2027-03-20", date: "2027-03-21", name: "Trail du Ventoux – 29 km « Balcons du Ventoux »",          dept: "84", km: 29, dplus: 1350, tracks: ["100"],
    url: "https://in.njuko.com/trail-du-ventoux-20271786456525480?currentPage=select-competition", signup: { status: "full", note: "⛔ Balcons du Ventoux 29 km COMPLET (1 026 inscrits pour 950 places, njuko 26/10) — ouvert le 3/10 à 8h ; dim. 21/03/2027. L'Origine 48 km, l'Intégrale et le Sprint sont complets aussi ; restaient quelques places sur l'Évasion 64 km et l'Ultra 105 km" } },
  /* EcoTrail : deux formats, deux jours différents → deux courses distinctes */
  { id: "ecotrail-paris-30",         bloc: "mars", weekend: "2027-03-20", date: "2027-03-20", name: "EcoTrail de Paris – 30 km", dept: "75", km: 29.5, dplus: 500, tracks: ["100"],
    url: "https://in.njuko.com/salomon-ecotrail-paris-printemps-2027?currentPage=select-competition", signup: { status: "full", note: "⛔ COMPLET sur njuko au 26/10 (0 dossard restant sur 3 500) — revente de dossards annoncée (« être prévenu ») ; sam. 20/03/2027 à 8h30. Le 22 km (58 €) et le 35 km restent ouverts" } },
  { id: "ecotrail-paris-22",         bloc: "mars", weekend: "2027-03-20", date: "2027-03-21", name: "EcoTrail de Paris – 22 km", dept: "75", km: 22,   dplus: 550, tracks: ["100"],
    url: "https://www.ecotrailparis.com/course/trail-20-km", signup: { status: "open", note: "sur njuko" } },
  { id: "ecotrail-paris-10",         bloc: "mars", weekend: "2027-03-20", date: "2027-03-21", name: "EcoTrail de Paris – 10 km", dept: "92", km: 10.2, dplus: 170, tracks: ["40"],
    url: "https://in.njuko.com/salomon-ecotrail-paris-printemps-2027?currentPage=select-competition", signup: { status: "open", note: "« l'initiation au trail » de l'EcoTrail : dim. 21/03/2027, départ 10h30 du Domaine national de Saint-Cloud (boucle) — ouvertes sur njuko, 37 € + frais (2e palier au 26/10), 2 500 places" } },
  { id: "trail-mont-st-romain",      bloc: "mars", weekend: "2027-03-20", name: "Trail du Mont Saint-Romain",   dept: "71", km: 30, dplus: 1000, tracks: ["100"],
    url: "https://trail-mont-saint-romain.fr/", signup: { expect: "≈ mi-déc.", note: "2027 pas encore sur yaka au 26/10 — 2026 : ouverture le 19/12/2025 vers 12h (13 à 28 €)" } },
  { id: "sktrail",                   bloc: "mars", weekend: "2027-03-20", name: "SKTRAIL",                   dept: "64", km: 22, dplus: 1500, tracks: ["100"],
    url: "https://www.sarakorrika.com/", signup: { note: "Sara Korrika Trail — 650 dossards, 25 € ; date 2027 à confirmer (dernier dim. de mars → 28/03 ?)" } },
  { id: "trail-des-grottes",         bloc: "mars", weekend: "2027-03-27", date: "2027-03-28", name: "Trail des Grottes – 21 km « Grand Trail des Grottes »", dept: "73", km: 21, dplus: 1050, tracks: ["100"],
    url: "https://grottes-saint-christophe.com/", signup: { expect: "≈ janv.", note: "annoncé dim. 28/03/2027 — 2026 : inscriptions sur milesrepublic.com, +5 € après le 16/03 ; rien pour 2027 au 26/10" } },
  { id: "trail-des-grottes-10",      bloc: "mars", weekend: "2027-03-27", date: "2027-03-28", name: "Trail des Grottes – 10 km « Petit Trail des Grottes »", dept: "73", km: 10, dplus: 490, tracks: ["40"],
    url: "https://grottes-saint-christophe.com/", signup: { expect: "≈ janv.", note: "dim. 28/03/2027, départ 9h45 (2026), passage dans la grotte inférieure — ouverture ≈ janv. (ledossard.com), comme le 21 km" } },
  { id: "tour-pedestre-villers",     bloc: "mars", weekend: "2027-03-20", name: "Tour pédestre de Villers-lès-Nancy", dept: "54", km: 28, dplus: 420, tracks: ["100"],
    url: "https://tour-pedestre.fr/", signup: { note: "2027 non annoncé — 2026 : dim. 22/03, 25 €, chronopro" } },
  { id: "trail-du-printemps",        bloc: "mars", weekend: "2027-03-20", name: "Trail du Printemps",        dept: "73", km: 25, dplus: 1280, tracks: ["100"],
    url: "https://fr.milesrepublic.com/event/trail-du-printemps-9228", signup: { note: "2027 non annoncé — 2026 : dim. 22/03" } },
  { id: "grand-trail-garlaban",      bloc: "mars", weekend: "2027-03-27", name: "Grand Trail du Garlaban",   dept: "13", km: 28, dplus: 1700, tracks: ["100"],
    url: "https://www.grandtraildugarlaban.fr/", signup: { expect: "≈ mi-déc.", note: "2027 pas encore sur sportips au 26/10 — 2026 : dim. 29/03, ouverture le 15/12/2025 à 9h" } },
  { id: "trail-des-piqueurs",        bloc: "mars", weekend: "2027-03-27", name: "Trail des Piqueurs",        dept: "63", km: 25, dplus: 1000, tracks: ["100"],
    url: "https://traildespiqueurs.fr/inscriptions/", signup: { expect: "≈ mi-nov.", note: "2027 pas encore sur sport-up au 26/10 — 2026 : ouverture le 19/11/2025 à 9h, complet puis liste d'attente (11 km 14 €, 25 km 23 €) ; se remplit vite, surveiller mi-nov." } },
  { id: "trailversee-haute-joux",    bloc: "mars", weekend: "2027-03-27", date: "2027-03-28", name: "Trail'versée de la Haute-Joux", dept: "39", km: 26, dplus: 980, tracks: ["100"],
    url: "https://www.skiclubduplateaudenozeroy.com/", signup: { expect: "≈ janv.", note: "3e édition dim. 28/03/2027 au départ de Doye (site officiel) — ouverture ≈ janv. (njuko en 2026)" } },
  { id: "trail-du-sanglier",         bloc: "mars", weekend: "2027-03-27", date: "2027-03-27", name: "Trail du Sanglier",         dept: "69", km: 28, dplus: 1200, tracks: ["100"],
    url: "https://traildusanglier.com/", signup: { expect: "≈ nov.", note: "sam. 27/03/2027 confirmé par les organisateurs (30/10), inscriptions bientôt — 2026 : ouvertures par distance (28 km le 22/10, 15 km le 7/11, 10 et 40 km le 19/11) ; 28 km 25 €" } },
  { id: "trail-des-jonquilles-10",   bloc: "mars", weekend: "2027-03-27", name: "Trail des Jonquilles – 10 km « La Tige »", dept: "43", km: 10, dplus: 200, tracks: ["40"],
    url: "https://finishers.com/course/trail-des-jonquilles-du-haut-lignon", signup: { note: "Tence (Haut-Lignon) — date 2027 à confirmer (2026 : 27–29/03, 2027 : dim. 28/03 selon Finishers) ; contact traildesjonquilles.hautlignon@gmail.com" } },
  { id: "trail-des-jonquilles-15",   bloc: "mars", weekend: "2027-03-27", name: "Trail des Jonquilles – 15 km « La Pétale »", dept: "43", km: 15, dplus: 280, tracks: ["40"],
    url: "https://finishers.com/course/trail-des-jonquilles-du-haut-lignon", signup: { note: "Tence (Haut-Lignon) — date 2027 à confirmer (2026 : 27–29/03, 2027 : dim. 28/03 selon Finishers) ; contact traildesjonquilles.hautlignon@gmail.com" } },
  /* Relais à 2 sur le 40 km : tronçon 27 km (0 to 100) + tronçon 15 km (0 to 40) — Alice × Mims */
  { id: "trail-des-citadelles-relais", bloc: "mars", weekend: "2027-03-27", date: "2027-03-28", name: "Trail des Citadelles – Relais 73 km à 4, tronçon 27 km", format: "Relais 73 km à 4 (ton tronçon)", dept: "09", km: 27, dplus: 1200, tracks: ["100"],
    url: "https://chrono-start.com/Inscription/Course/detail/c/5240", signup: { open: "2026-11-11", note: "Alice et Milène font équipe avec 2 autres coureurs — relais du 73 km (D+ 3400) uniquement à 4, sections de 15 à 27 km (découpage sur http://trail-des-citadelles.blogspot.com/p/73km.html) — ouverture mer. 11/11/2026 à 15h sur chrono-start, 88 € l'équipe (hors commission) ; une seule inscription pour l'équipe, ⚠️ part vite, être devant l'écran à l'heure ; liste d'attente dès janvier" } },
  { id: "trail-des-citadelles-relais-15", bloc: "mars", weekend: "2027-03-27", date: "2027-03-28", name: "Trail des Citadelles – Relais 73 km à 4, tronçon 15 km", format: "Relais 73 km à 4 (ton tronçon)", dept: "09", km: 15, dplus: null, tracks: ["40"],
    url: "https://chrono-start.com/Inscription/Course/detail/c/5240", signup: { open: "2026-11-11", note: "Milène et Alice font équipe avec 2 autres coureurs — relais du 73 km (D+ 3400) uniquement à 4, sections de 15 à 27 km (découpage sur http://trail-des-citadelles.blogspot.com/p/73km.html) — ouverture mer. 11/11/2026 à 15h sur chrono-start, 88 € l'équipe (hors commission) ; une seule inscription pour l'équipe, ⚠️ part vite, être devant l'écran à l'heure ; liste d'attente dès janvier" } },

  /* ─── Fin mai · début juin · 40 km max ────────────────────────────────── */
  { id: "run-ecully-20",             bloc: "juin", weekend: "2027-05-29", name: "Run Écully – 20 km",       dept: "69", km: 20, dplus: 400, tracks: ["40"],
    url: "https://www.mytrails.com/fr/events/run-ecully_Cu8VB", signup: { note: "date 2027 à confirmer — 2026 : dim. 31/05, campus de l'École Centrale de Lyon, départ 9h, 23,50 € (Finishers)" } },
  { id: "trail-eolienne-23",         bloc: "juin", weekend: "2027-05-29", name: "Trail de l'Éolienne – 23 km « Grand Défi »", dept: "69", km: 23, dplus: 940, tracks: ["40"],
    url: "https://ententeouestlyonnais.athle.org/", signup: { note: "Les Sauvages (près de Tarare), sam. 29/05/2027 — 2026 : départ 16h ; contact trail.eolienne@gmail.com" } },
  { id: "maxi-race",                 bloc: "juin", weekend: "2027-05-29", date: "2027-05-30", name: "MaXi-Race – 42 km « Marathon eXpérience »",                 dept: "74", km: 42, dplus: 1800, tracks: ["100"],
    url: "https://sportips.fr/inscription/MAXIRACE27/liste-attente", signup: { status: "waitlist", note: "tirage au sort fait, COMPLET — liste d'attente ouverte à tous (sportips) ; revente de dossards du 20/10/2026 au 15/04/2027 ; dim. 30/05/2027 à 6h" } },
  { id: "maxi-race-quart-de-tour",   bloc: "juin", weekend: "2027-05-29", date: "2027-05-29", name: "MaXi-Race – 20 km « Quart de tOur du lac »", dept: "74", km: 20, dplus: 410, tracks: ["40"],
    url: "https://sportips.fr/inscription/MAXIRACE27/liste-attente", signup: { status: "waitlist", note: "trail « négatif » Semnoz → Annecy (410 D+ / 1450 D−), sam. 29/05/2027 à 9h — tirage au sort fait, COMPLET : liste d'attente ouverte à tous (sportips), revente de dossards jusqu'au 15/04/2027" } },
  { id: "cascades-de-l-alloix",      bloc: "juin", weekend: "2027-05-29", date: "2027-05-30", name: "Course des Cascades – 40 km", dept: "38", km: 40, dplus: 2000, tracks: ["100"],
    url: "https://coursedescascades.fr/cdc40/", signup: { note: "édition 2027 confirmée : dim. 30/05/2027, CDC40 « La grande aventure » (parcours renouvelé, 40 km / 2000 D+, Chartreuse) — inscriptions « bientôt » (club CSVM 07 68 28 18 18)" } },
  { id: "alvitrail",                 bloc: "juin", weekend: "2027-05-29", name: "Trail du Rocamadour AOP",   dept: "46", km: 33, dplus: 1450, tracks: ["100"],
    url: "https://www.alvitrail46.fr/", signup: { expect: "≈ janv.", note: "= Trail du Rocamadour — 2026 : dim. 31/05, ouverture ≈ janv. (chrono-start)" } },
  { id: "volta-fondeguilla",         bloc: "juin", weekend: "2027-05-29", date: "2027-05-29", name: "Volta al Terme de Fondeguilla", dept: "Espagne", km: 34.5, dplus: 2200, tracks: ["100"],
    url: "https://www.voltaalterme.eu/", signup: { expect: "≈ fin févr.", note: "44e édition sam. 29/05/2027 (site officiel), 400 places — 2026 : ouvertes du 28/02 au 24/05, 35 € → attendre fin février 2027" } },
  { id: "trail-cote-roannaise",      bloc: "juin", weekend: "2027-05-29", name: "Trail de la Côte Roannaise – 42 km « La CRRASSEUSE »", dept: "42", km: 42, dplus: 2000, tracks: ["100"],
    url: "https://chronospheres.fr/evenements/detail/TRAIL-DE-LA-COTE-ROANNAISE-2026-1386", signup: { expect: "≈ 20 févr.", note: "⚠️ date 2027 pas encore arrêtée : certains sites annoncent le dim. 23/05, l'organisateur dit que cette date « se profile » sans être fixée (info d'une participante, 27/10) — le 23/05 tomberait hors du week-end du bloc ; 42 km limité à 80 dossards, ouverture ≈ 20 février" } },
  /* Déplacée du WE 29–30 mai → 5–6 juin le 07/10/2026 : le site officiel annonce le 6 juin 2027 */
  { id: "trail-des-marcaires",       bloc: "juin", weekend: "2027-06-05", date: "2027-06-06", name: "Trail des Marcaires – 32 km « Le Défi de Muhlbach »",       dept: "68", km: 32, dplus: 1630, tracks: ["100"],
    url: "https://www.sporkrono.fr/courses/821171475/trail-des-marcaires/", signup: { expect: "≈ déc./janv.", note: "dim. 6/06/2027 (site officiel) — sporkrono : « Inscription à venir » au 26/10 (la plateforme annonce 34 km, le site 32 km)" } },
  { id: "balcons-de-la-sure",        bloc: "juin", weekend: "2027-06-05", date: "2027-06-06", name: "Trail du Circuit de la Sure – 32 km « Les Balcons de la Sure »", dept: "38", km: 32, dplus: 1600, tracks: ["100"],
    url: "https://trailcircuitdelasure.fr/", signup: { expect: "≈ janv.", note: "dim. 6/06/2027 confirmé, départ Voiron — 30 €, ouverture ≈ janv. (njuko)" } },
  { id: "tour-de-vouise-12",         bloc: "juin", weekend: "2027-06-05", date: "2027-06-06", name: "Trail du Circuit de la Sure – 12 km « Le Tour de Vouise »", dept: "38", km: 12, dplus: 660, tracks: ["40"],
    url: "https://trailcircuitdelasure.fr/les-courses/", signup: { expect: "≈ janv.", note: "dim. 6/06/2027, Voiron — ouverture ≈ janv. (njuko), comme le 32 km" } },
  { id: "integrale-du-bostet",       bloc: "juin", weekend: "2027-06-05", name: "Trail du Bostet – 35 km « L'Intégrale du Bostet »",     dept: "73", km: 35, dplus: 2150, tracks: ["100"],
    url: "https://www.teambostet.com/trail-du-bostet", signup: { expect: "jusqu'à la veille", note: "50 €, départ 11h — inscriptions jusqu'à la veille, même sur place" } },
  { id: "balcons-du-verdon",         bloc: "juin", weekend: "2027-06-05", date: "2027-06-06", name: "Var Verdon Trail Canyon – 40 km « Trail des Balcons du Verdon »", dept: "04", km: 40, dplus: 1900, tracks: ["100"],
    url: "https://in.njuko.com/var-verdon-trail-canyon-20271789120408157?currentPage=select-competition", signup: { status: "open", note: "ouvertes depuis le 15/10 (njuko) — dim. 6/06/2027 à 6h, 70 € (tarif des 300 premiers)" } },
  { id: "traversee-des-dentelles",   bloc: "juin", weekend: "2027-06-05", date: "2027-06-06", name: "La Traversée des Dentelles – 42 km « Marathon des Dentelles »",   dept: "84", km: 42, dplus: 2000, tracks: ["100"],
    url: "https://www.finishers.com/book/event/2NUWP", signup: { status: "open", note: "ouvertes sur Finishers (billetterie officielle, vu le 26/10) — dim. 6/06/2027 à 5h30 au départ de Gigondas, 52 € + frais de gestion ; places limitées" } },
  { id: "trail-du-cagire",           bloc: "juin", weekend: "2027-06-05", date: "2027-06-06", name: "Trail du Cagire – 29 km « La Grande Boucle »",           dept: "31", km: 29, dplus: 1900, tracks: ["100"],
    url: "https://www.lesgalopinsducagire.fr/le-trail-du-cagire/", signup: { expect: "bientôt", note: "dim. 6/06/2027 confirmé (14e édition) — 34 €, départ 8h, « infos et inscriptions bientôt »" } },
  { id: "trail-des-millefonts",      bloc: "juin", weekend: "2027-06-05", name: "Trail des Millefonts",      dept: "06", km: 31, dplus: 2250, tracks: ["100"],
    url: "https://www.facebook.com/trailsdesmillefonts/", signup: { expect: "≈ mars", note: "annoncé 5–6/06/2027 — ouverture ≈ mars (sport-up)" } },
  { id: "montan-aspe",               bloc: "juin", weekend: "2027-06-05", name: "Montan'Aspe – 37 km « Défi de l'Ourdinse »",               dept: "64", km: 37, dplus: 2700, tracks: ["100"],
    url: "https://www.trail-montanaspe.com/", signup: { expect: "≈ janv.", note: "Défi de l'Ourdinse — 2027 non annoncé, 2026 : ven. 5/06, ouverture ≈ janv. (njuko)" } },
  { id: "transju-trails",            bloc: "juin", weekend: "2027-06-05", date: "2027-06-06", name: "La Transju'Trails",         dept: "39", km: 42, dplus: 2200, tracks: ["100"],
    url: "https://in.njuko.com/taktiksport-transjutrail2027", signup: { status: "open", note: "ouvertes depuis le 8/10 (njuko) — dim. 6/06/2027 à 7h, 55 € jusqu'au 29/03/2027 ; ≈ 510 places libres sur 1 100 au 26/10" } },
  { id: "transju-trails-15",         bloc: "juin", weekend: "2027-06-05", date: "2027-06-06", name: "La Transju'Trails – 15 km", dept: "39", km: 15, dplus: 870, tracks: ["40"],
    url: "https://in.njuko.com/taktiksport-transjutrail2027", signup: { status: "open", note: "dim. 6/06/2027 à 10h30, boucle au départ des Tuffes (Les Rousses) — ouvertes (njuko), 25 € jusqu'au 29/03/2027 ; ≈ 500 places libres sur 750 au 26/10" } },
  { id: "ambertrail-21",             bloc: "juin", weekend: "2027-05-29", name: "Ambertrail – 21 km « Tour de Saint-Ferréol »", dept: "63", km: 21, dplus: 700, tracks: ["40"],
    url: "https://www.ambertrail.fr", signup: { note: "date 2027 à confirmer — 2026 : dim. 31/05, départ 9h30 gare de Marsac-en-Livradois, arrivée Ambert" } },
  { id: "franchevill-trail-25",      bloc: "juin", weekend: "2027-06-05", name: "Franchevill'Trail – 25 km « Trail du Fort »", dept: "69", km: 25, dplus: 530, tracks: ["40"],
    url: "https://gotrail.run/fr/evenement/franchevilltrail", signup: { note: "Francheville (métropole de Lyon) — date 2027 à confirmer (2026 : sam. 6/06, départ 17h)" } },

  /* ─── Début juillet · 40–50 km ────────────────────────────────────────── */
  { id: "chalmatrail",               bloc: "juillet", weekend: "2027-07-03", name: "Chalmatrail – 45 km « Chalma'Rathon »",            dept: "42", km: 45, dplus: 1840, tracks: ["100"],
    url: "https://escoutoux.net/Chalmatrail", signup: { expect: "≈ 20 déc.", note: "2026 : ouvertes le 20 déc. 2025 → attendre ~20 déc. 2026 (logicourse), départ 7h" } },
  { id: "courir-pour-des-momes-20",  bloc: "juillet", weekend: "2027-07-03", name: "Courir pour des Mômes – 20 km", dept: "42", km: 20, dplus: 700, tracks: ["40"],
    url: "https://www.logicourse.fr", signup: { note: "Graix (Pilat, près du Bessat) — date 2027 à confirmer ; 400 dossards, au profit de Marabout de Ficelle (cancers rares de l'enfant)" } },
  { id: "chalmatrail-20",            bloc: "juillet", weekend: "2027-07-03", name: "Chalmatrail – 20 km « Chalma'Classique »", dept: "42", km: 20, dplus: 720, tracks: ["40"],
    url: "https://escoutoux.net/Chalmatrail", signup: { expect: "≈ 20 déc.", note: "2026 : ouvertes le 20 déc. 2025 → attendre ~20 déc. 2026 (logicourse)" } },
  { id: "trail-des-bauges",          bloc: "juillet", weekend: "2027-07-03", name: "Trail des Bauges – 47 km « Trail Expert »", dept: "73", km: 47, dplus: 2750, tracks: ["100"],
    url: "https://traildesbauges.wixsite.com/traildesbauges/48-km", signup: { expect: "≈ févr.", note: "2027 non annoncé — 2026 : dim. 5/07, nouveau tracé de 47 km, ouverture ≈ février (njuko)" } },
  { id: "trail-des-bauges-23",       bloc: "juillet", weekend: "2027-07-03", name: "Trail des Bauges – 23 km « Trail Sportif »", dept: "73", km: 23, dplus: 1500, tracks: ["40"],
    url: "https://traildesbauges.wixsite.com/traildesbauges/21-km", signup: { expect: "≈ févr.", note: "2027 non annoncé — 2026 : dim. 5/07, nouveau tracé de 23 km (D+ ≈ 1500 selon les participants, non publié sur le site), ouverture ≈ février (njuko)" } },
  { id: "grand-raid-guillestrois-queyras", bloc: "juillet", weekend: "2027-07-03", name: "Grand Raid Guillestrois-Queyras – 48 km « Le Trail des Lacs »", dept: "05", km: 48, dplus: 3200, tracks: ["100"],
    url: "https://grandraidduguillestrois-queyras.com/inscriptions/", signup: { open: "2026-11-01", note: "ouverture dim. 1er nov. 2026 à 9h (registration4all, tous formats) — Trail des Lacs sam. 3/07/2027 à 8h ; 65 € jusqu'au 31/01/2027 puis 70 € ; ⚠️ jauge fermée sans liste d'attente, être à l'heure" } },
  { id: "tour-glaciers-vanoise",     bloc: "juillet", weekend: "2027-07-03", name: "Tour des Glaciers de la Vanoise – 41 km « L'Incontournable »", dept: "73", km: 41, dplus: 2850, tracks: ["100"],
    url: "https://inscriptions.as2pic.org/tour-des-glaciers-de-la-vanoise", signup: { status: "open", note: "ouvertes depuis le 25/10/2026 18h (as2pic) — 60 € + frais ; 249 places restantes au 26/10 (le 73 km est déjà complet, ne pas traîner) ; dim. 4/07/2027, départ 5h" } },
  { id: "tour-glaciers-vanoise-25",  bloc: "juillet", weekend: "2027-07-03", name: "Tour des Glaciers de la Vanoise – 25 km « Pralo vu du Ciel »", dept: "73", km: 25, dplus: 1750, tracks: ["40"],
    url: "https://inscriptions.as2pic.org/tour-des-glaciers-de-la-vanoise", signup: { status: "open", note: "ouvertes depuis le 25/10/2026 18h (as2pic) — 30 € + frais ; 388 places restantes au 26/10 ; Pralognan, dim. 4/07/2027, départ 7h" } },
  /* Déplacée de « juin » → « juillet » le 22/09/2026 (signalé par Myriam) : l'édition 2026 a eu lieu le dim. 5 juillet */
  { id: "trail-hyeges-verdon",       bloc: "juillet", weekend: "2027-07-03", name: "Trail Hyèges Verdon",       dept: "04", km: 45, dplus: 2300, tracks: ["100"],
    url: "https://www.thvtrail.fr/", signup: { expect: "≈ févr./mars", note: "2026 : dim. 5/07 — ouverture ≈ fév./mars (sportips)" } }
];
