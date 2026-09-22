/* ────────────────────────────────────────────────────────────────────────────
   Courses autorisées par le staff — 0 to 100 (liste du 21/09/2026)
   ────────────────────────────────────────────────────────────────────────────
   Un objet par course :
     id       : identifiant unique (kebab-case) — c'est lui qui est stocké
                dans le Sheet des choix, NE PAS LE RENOMMER une fois en prod
     bloc     : "noel" | "mars" | "juin" | "juillet" (cf. BLOCS dans config.js)
     weekend  : id du week-end dans le bloc (samedi, AAAA-MM-JJ)
     name     : nom de la course
     dept     : département (ou pays)
     date     : jour précis (AAAA-MM-JJ, optionnel) si la course n'est pas
                le samedi — ex. EcoTrail 22 km le dimanche
     km, dplus: distance / dénivelé (nombres)
     tracks   : parcours autorisés → ["100"], ["40"] ou ["100", "40"]
     url      : site officiel / page d'inscription
     signup   : { open: "AAAA-MM-JJ" (date d'ouverture connue), status: "open" (déjà
                ouvertes), note: texte libre } — relevé du 22/09/2026, voir
                docs/inscriptions_releve_2026-09-22.md

   ⏳ Liste 0 to 40 : à venir (communiquée par le staff le 22/09/2026).
   ──────────────────────────────────────────────────────────────────────────── */

window.COURSES = [
  /* ─── Noël · 10–15 km ─────────────────────────────────────────────────── */
  { id: "corrida-trail-ambarroise",  bloc: "noel", weekend: "2026-12-19", name: "Corrida-Trail Ambarroise",  dept: "01", km: 10, dplus: 450, tracks: ["100"],
    url: "https://www.facebook.com/corridatrailambarroise/", signup: { note: "2026 non annoncé — 2025 : dim. 21/12, inscriptions ouvertes en nov. (njuko)" } },
  { id: "trail-blanc-gashney",       bloc: "noel", weekend: "2026-12-19", name: "Trail Blanc du Gashney",    dept: "68", km: 14, dplus: 650, tracks: ["100"],
    url: "https://www.colmartrailaventures.fr/trail-blanc-gaschney", signup: { note: "« bientôt ouvertes » (sept. 2026), via sporkrono" } },
  { id: "14-18-noctrail",            bloc: "noel", weekend: "2026-12-19", name: "La 14-18 Noctrail",         dept: "60", km: 15, dplus: 400, tracks: ["100"],
    url: "https://www.la-1418.com/noctrail/", signup: { status: "open", note: "1 000 places, sur adeorun" } },
  { id: "trail-de-noel-70",          bloc: "noel", weekend: "2026-12-19", name: "Trail de Noël",             dept: "70", km: 15, dplus: 280, tracks: ["100"],
    url: "https://dampierre-sur-linotte.fr/traildenoel", signup: { note: "2026 non annoncé — 2025 : dim. 21/12, ouverture en nov." } },
  { id: "nocturne-du-coeur",         bloc: "noel", weekend: "2026-12-19", name: "La Nocturne du Cœur",       dept: "31", km: 15, dplus: 300, tracks: ["100"],
    url: "https://trailducassoulet.fr/lanocturneducoeur.html", signup: { note: "pas encore ouvertes — 2025 : ouverture oct./nov. sur chrono-start (Téléthon)" } },
  { id: "nuit-des-fadarelles",       bloc: "noel", weekend: "2026-12-19", name: "La Nuit des Fadarelles",    dept: "48", km: 12, dplus: 410, tracks: ["100"],
    url: "https://www.triathlonlangognenaussac.fr/?page_id=2306", signup: { note: "ouverture non annoncée (≈ nov.), 15 €" } },
  { id: "trail-du-facteur",          bloc: "noel", weekend: "2026-12-19", name: "Trail du Facteur",          dept: "26", km: 15, dplus: 310, tracks: ["100"],
    url: "https://cs-galaurien-cyclo-trail.sportsregions.fr", signup: { note: "ouverture non annoncée, 12–15 € (départ 13h)" } },
  { id: "montee-de-chambles",        bloc: "noel", weekend: "2026-12-26", date: "2026-12-27", name: "Montée de Chambles",        dept: "42", km: 11, dplus: 250, tracks: ["100"],
    url: "https://www.logicourse.fr", signup: { note: "ouverture ≈ fin nov. sur logicourse, 14 €, 1 000 dossards" } },
  { id: "trail-de-la-guigne",        bloc: "noel", weekend: "2026-12-26", date: "2026-12-27", name: "Trail de la Guigne",        dept: "14", km: 14, dplus: 160, tracks: ["100"],
    url: "https://traildelaguigne.fr/", signup: { open: "2026-10-01", note: "ouverture le 1er octobre 2026" } },

  /* ─── Mars · 20–30 km ─────────────────────────────────────────────────── */
  { id: "trail-retournacois",        bloc: "mars", weekend: "2027-03-20", name: "Trail Retournacois",        dept: "43", km: 24, dplus: 1100, tracks: ["100"],
    url: "https://www.chronopuces.fr/trail-retournacois-2026", signup: { note: "2026 : ouvertes du 19/12 au 21/03 → attendre mi-déc. 2026 (chronopuces)" } },
  { id: "trail-du-ventoux",          bloc: "mars", weekend: "2027-03-20", name: "Trail du Ventoux",          dept: "84", km: 29, dplus: 1350, tracks: ["100"],
    url: "https://trailduventoux.fr/", signup: { open: "2026-10-03", note: "ouverture samedi 3 octobre 2026 — très demandé, s'inscrire vite" } },
  /* EcoTrail : deux formats, deux jours différents → deux courses distinctes */
  { id: "ecotrail-paris-30",         bloc: "mars", weekend: "2027-03-20", date: "2027-03-20", name: "EcoTrail de Paris – 30 km", dept: "75", km: 29.5, dplus: 500, tracks: ["100"],
    url: "https://www.ecotrailparis.com/course/trail-30-km", signup: { status: "open", note: "3 500 places, distance la plus demandée (njuko)" } },
  { id: "ecotrail-paris-22",         bloc: "mars", weekend: "2027-03-20", date: "2027-03-21", name: "EcoTrail de Paris – 22 km", dept: "75", km: 22,   dplus: 550, tracks: ["100"],
    url: "https://www.ecotrailparis.com/course/trail-20-km", signup: { status: "open", note: "sur njuko" } },
  { id: "trail-mont-st-romain",      bloc: "mars", weekend: "2027-03-20", name: "Trail du Mont St Romain",   dept: "71", km: 30, dplus: 1000, tracks: ["100"],
    url: "https://trail-mont-saint-romain.fr/", signup: { note: "2027 non annoncé — 2026 ≈ déc. sur yaka-chrono ; suivre la page FB" } },
  { id: "sktrail",                   bloc: "mars", weekend: "2027-03-20", name: "SKTRAIL",                   dept: "64", km: 22, dplus: 1500, tracks: ["100"],
    url: "https://www.sarakorrika.com/", signup: { note: "Sara Korrika Trail — 650 dossards, 25 € ; date 2027 à confirmer (dernier dim. de mars → 28/03 ?)" } },
  { id: "trail-des-grottes",         bloc: "mars", weekend: "2027-03-27", date: "2027-03-28", name: "Trail des Grottes",         dept: "73", km: 20, dplus: 1050, tracks: ["100"],
    url: "https://grottes-saint-christophe.com/", signup: { note: "annoncé dim. 28/03/2027 — ouverture ≈ janv. (ledossard.com), +5 € après le 16/03" } },
  { id: "tour-pedestre-villers",     bloc: "mars", weekend: "2027-03-20", name: "Tour pédestre de Villers-lès-Nancy", dept: "54", km: 28, dplus: 420, tracks: ["100"],
    url: "https://tour-pedestre.fr/", signup: { note: "2027 non annoncé — 2026 : dim. 22/03, 25 €, chronopro" } },
  { id: "trail-du-printemps",        bloc: "mars", weekend: "2027-03-20", name: "Trail du Printemps",        dept: "73", km: 25, dplus: 1280, tracks: ["100"],
    url: "https://fr.milesrepublic.com/event/trail-du-printemps-9228", signup: { note: "2027 non annoncé — 2026 : dim. 22/03" } },
  { id: "grand-trail-garlaban",      bloc: "mars", weekend: "2027-03-27", name: "Grand Trail du Garlaban",   dept: "13", km: 28, dplus: 1700, tracks: ["100"],
    url: "https://www.grandtraildugarlaban.fr/", signup: { note: "2027 non annoncé — 2026 : dim. 29/03, ouverture ≈ déc. (sportips)" } },
  { id: "trail-des-piqueurs",        bloc: "mars", weekend: "2027-03-27", name: "Trail des Piqueurs",        dept: "63", km: 25, dplus: 1000, tracks: ["100"],
    url: "https://traildespiqueurs.fr/inscriptions/", signup: { note: "⚠️ édition 2026 complète (liste d'attente) — ouverture ≈ nov./déc. (sport-up), se remplit vite" } },
  { id: "trailversee-haute-joux",    bloc: "mars", weekend: "2027-03-27", name: "Trail'versée de la Haute Joux", dept: "39", km: 26, dplus: 980, tracks: ["100"],
    url: "https://www.skiclubduplateaudenozeroy.com/", signup: { note: "2027 non annoncé — 2026 : dim. 29/03, ouverture ≈ janv. (njuko)" } },
  { id: "trail-du-sanglier",         bloc: "mars", weekend: "2027-03-27", name: "Trail du Sanglier",         dept: "69", km: 28, dplus: 1200, tracks: ["100"],
    url: "https://traildusanglier.com/", signup: { note: "2027 non annoncé — 2026 : dim. 29/03, 25 €, ouverture ≈ déc. (yaka)" } },
  /* Relais à 2 sur le 40 km : tronçon 27 km (0 to 100) + tronçon 15 km (0 to 40) — Alice × Mims */
  { id: "trail-des-citadelles-relais", bloc: "mars", weekend: "2027-03-27", date: "2027-03-28", name: "Trail des Citadelles – Relais 40 km, tronçon 27 km", dept: "09", km: 27, dplus: 1200, tracks: ["100"],
    url: "http://trail-des-citadelles.blogspot.com/", signup: { open: "2026-11-08", note: "40 km (relais) : dim. 8 nov. 15h — ⚠️ complet en quelques heures, être devant l'écran à l'heure (26 km solo : 1er nov. 17h)" } },
  { id: "trail-des-citadelles-relais-15", bloc: "mars", weekend: "2027-03-27", date: "2027-03-28", name: "Trail des Citadelles – Relais 40 km, tronçon 15 km", dept: "09", km: 15, dplus: null, tracks: ["40"],
    url: "http://trail-des-citadelles.blogspot.com/", signup: { open: "2026-11-08", note: "40 km (relais) : dim. 8 nov. 15h — ⚠️ complet en quelques heures ; l'inscription du relais se fait en binôme" } },

  /* ─── Fin mai · début juin · 40 km max ────────────────────────────────── */
  { id: "maxi-race",                 bloc: "juin", weekend: "2027-05-29", name: "MaXi-Race",                 dept: "74", km: 42, dplus: 1800, tracks: ["100"],
    url: "https://www.maxi-race.org/en/inscriptions/", signup: { open: "2026-10-01", note: "pré-inscriptions du 1er au 7 oct. 2026 (10h → 18h), puis tirage au sort 8–10 oct., liste d'attente dès le 13" } },
  { id: "cascades-de-l-alloix",      bloc: "juin", weekend: "2027-05-29", name: "Course des Cascades de l'Alloix", dept: "38", km: 35, dplus: 2000, tracks: ["100"],
    url: "https://coursedescascades.fr/", signup: { note: "⚠️ édition 2027 incertaine — site officiel en maintenance, aucune annonce (club CSVM 07 68 28 18 18)" } },
  { id: "alvitrail",                 bloc: "juin", weekend: "2027-05-29", name: "Alvitrail",                 dept: "46", km: 33, dplus: 1450, tracks: ["100"],
    url: "https://www.alvitrail46.fr/", signup: { note: "= Trail du Rocamadour — 2026 : dim. 31/05, ouverture ≈ janv. (chrono-start)" } },
  { id: "volta-fondeguilla",         bloc: "juin", weekend: "2027-05-29", name: "Volta al Terme de Fondeguilla", dept: "Espagne", km: 34.5, dplus: 2200, tracks: ["100"],
    url: "https://www.voltaalterme.eu/", signup: { note: "2026 : ouvertes du 28/02 au 24/05, 35 € → attendre fin février 2027" } },
  { id: "trail-cote-roannaise",      bloc: "juin", weekend: "2027-05-29", name: "Trail de la Côte Roannaise", dept: "42", km: 42, dplus: 2000, tracks: ["100"],
    url: "https://chronospheres.fr/evenements/detail/TRAIL-DE-LA-COTE-ROANNAISE-2026-1386", signup: { note: "⚠️ 42 km limité à 80 dossards — ouverture ≈ 20 février" } },
  { id: "trail-des-marcaires",       bloc: "juin", weekend: "2027-05-29", name: "Trail des Marcaires",       dept: "68", km: 32, dplus: 1630, tracks: ["100"],
    url: "https://www.traildesmarcaires.com/", signup: { note: "annoncé dim. 30/05/2027 — ouverture ≈ déc./janv. (sporkrono)" } },
  { id: "balcons-de-la-sure",        bloc: "juin", weekend: "2027-06-05", date: "2027-06-06", name: "Les Balcons de la Sure",    dept: "38", km: 32, dplus: 1600, tracks: ["100"],
    url: "https://trailcircuitdelasure.fr/", signup: { note: "30 € — ouverture ≈ janv. (njuko)" } },
  { id: "integrale-du-bostet",       bloc: "juin", weekend: "2027-06-05", name: "L'Intégrale du Bostet",     dept: "73", km: 35, dplus: 2150, tracks: ["100"],
    url: "https://www.teambostet.com/trail-du-bostet", signup: { note: "50 €, départ 11h — inscriptions jusqu'à la veille, même sur place" } },
  { id: "balcons-du-verdon",         bloc: "juin", weekend: "2027-06-05", name: "Balcons du Verdon",         dept: "04", km: 40, dplus: 1900, tracks: ["100"],
    url: "https://varverdontrailcanyon.com/en/register-for-a-race/", signup: { open: "2026-10-15", note: "ouverture le 15 octobre 2026 (Var Verdon Trail Canyon)" } },
  { id: "traversee-des-dentelles",   bloc: "juin", weekend: "2027-06-05", name: "Traversée des Dentelles",   dept: "84", km: 42, dplus: 2000, tracks: ["100"],
    url: "https://www.traverseedesdentelles.com/", signup: { note: "2027 non annoncé — 2026 : 6–7/06, ouverture ≈ janv. (finishers), places limitées" } },
  { id: "trail-du-cagire",           bloc: "juin", weekend: "2027-06-05", date: "2027-06-06", name: "Trail du Cagire",           dept: "31", km: 29, dplus: 1900, tracks: ["100"],
    url: "https://www.lesgalopinsducagire.fr/le-trail-du-cagire/", signup: { note: "34 €, départ 8h — « infos et inscriptions bientôt » (chrono-start)" } },
  { id: "trail-des-millefonts",      bloc: "juin", weekend: "2027-06-05", name: "Trail des Millefonts",      dept: "06", km: 31, dplus: 2250, tracks: ["100"],
    url: "https://www.facebook.com/trailsdesmillefonts/", signup: { note: "annoncé 5–6/06/2027 — ouverture ≈ mars (sport-up)" } },
  { id: "montan-aspe",               bloc: "juin", weekend: "2027-06-05", name: "Montan'Aspe",               dept: "64", km: 37, dplus: 2700, tracks: ["100"],
    url: "https://www.trail-montanaspe.com/", signup: { note: "Défi de l'Ourdinse — 2027 non annoncé, 2026 : ven. 5/06, ouverture ≈ janv. (njuko)" } },
  { id: "transju-trails",            bloc: "juin", weekend: "2027-06-05", name: "La Transju'Trails",         dept: "39", km: 42, dplus: 2200, tracks: ["100"],
    url: "https://www.latransju.com/en/evenements/la-transju-trail/", signup: { open: "2026-10-08", note: "ouverture jeudi 8 octobre 2026 à 12h — tarifs préférentiels jusqu'à fin mars" } },

  /* ─── Début juillet · 40–50 km ────────────────────────────────────────── */
  { id: "chalmatrail",               bloc: "juillet", weekend: "2027-07-03", name: "Chalmatrail",            dept: "42", km: 45, dplus: 1840, tracks: ["100"],
    url: "https://escoutoux.net/Chalmatrail", signup: { note: "2026 : ouvertes le 20 déc. 2025 → attendre ~20 déc. 2026 (logicourse), départ 7h" } },
  { id: "trail-des-bauges",          bloc: "juillet", weekend: "2027-07-03", name: "Trail des Bauges",       dept: "73", km: 48, dplus: 2750, tracks: ["100"],
    url: "https://traildesbauges.wixsite.com/traildesbauges", signup: { note: "2027 non annoncé — 2026 : dim. 5/07, ouverture ≈ février (njuko)" } },
  { id: "grand-raid-guillestrois-queyras", bloc: "juillet", weekend: "2027-07-03", name: "Grand Raid Guillestrois-Queyras", dept: "05", km: 48, dplus: 3200, tracks: ["100"],
    url: "https://grandraidduguillestrois-queyras.com/inscriptions/", signup: { note: "Trail des Lacs 48 km — 60 € jusqu'au 31/01 puis 65 € (sportips) ; ouverture ≈ oct./nov. ; ⚠️ jauge fermée sans liste d'attente" } },
  { id: "tour-glaciers-vanoise",     bloc: "juillet", weekend: "2027-07-03", name: "Tour des Glaciers de la Vanoise", dept: "73", km: 41, dplus: 2850, tracks: ["100"],
    url: "https://www.sibotrails.com/trail/tour-des-glaciers-de-la-vanoise/", signup: { note: "course « L'Incontournable » 41 km (le TGV fait 73 km) — 2026 : ouverture lun. 20 oct. 2025 → probable ~19 oct. 2026, se remplit vite" } },
  /* Déplacée de « juin » → « juillet » le 22/09/2026 (signalé par Myriam) : l'édition 2026 a eu lieu le dim. 5 juillet */
  { id: "trail-hyeges-verdon",       bloc: "juillet", weekend: "2027-07-03", name: "Trail Hyèges Verdon",       dept: "04", km: 45, dplus: 2300, tracks: ["100"],
    url: "https://www.thvtrail.fr/", signup: { note: "2026 : dim. 5/07 — ouverture ≈ fév./mars (sportips)" } }
];
