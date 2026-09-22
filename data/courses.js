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
     url      : site d'inscription (optionnel)

   ⏳ Liste 0 to 40 : à venir (communiquée par le staff le 22/09/2026).
   ──────────────────────────────────────────────────────────────────────────── */

window.COURSES = [
  /* ─── Noël · 10–15 km ─────────────────────────────────────────────────── */
  { id: "corrida-trail-ambarroise",  bloc: "noel", weekend: "2026-12-19", name: "Corrida-Trail Ambarroise",  dept: "01", km: 10, dplus: 450, tracks: ["100"] },
  { id: "trail-blanc-gashney",       bloc: "noel", weekend: "2026-12-19", name: "Trail Blanc du Gashney",    dept: "68", km: 14, dplus: 650, tracks: ["100"] },
  { id: "14-18-noctrail",            bloc: "noel", weekend: "2026-12-19", name: "La 14-18 Noctrail",         dept: "60", km: 15, dplus: 400, tracks: ["100"] },
  { id: "trail-de-noel-70",          bloc: "noel", weekend: "2026-12-19", name: "Trail de Noël",             dept: "70", km: 15, dplus: 280, tracks: ["100"] },
  { id: "nocturne-du-coeur",         bloc: "noel", weekend: "2026-12-19", name: "La Nocturne du Cœur",       dept: "31", km: 15, dplus: 300, tracks: ["100"] },
  { id: "nuit-des-fadarelles",       bloc: "noel", weekend: "2026-12-19", name: "La Nuit des Fadarelles",    dept: "48", km: 12, dplus: 410, tracks: ["100"] },
  { id: "trail-du-facteur",          bloc: "noel", weekend: "2026-12-19", name: "Trail du Facteur",          dept: "26", km: 15, dplus: 310, tracks: ["100"] },
  { id: "montee-de-chambles",        bloc: "noel", weekend: "2026-12-26", name: "Montée de Chambles",        dept: "42", km: 11, dplus: 250, tracks: ["100"] },
  { id: "trail-de-la-guigne",        bloc: "noel", weekend: "2026-12-26", name: "Trail de la Guigne",        dept: "14", km: 14, dplus: 160, tracks: ["100"] },

  /* ─── Mars · 20–30 km ─────────────────────────────────────────────────── */
  { id: "trail-retournacois",        bloc: "mars", weekend: "2027-03-20", name: "Trail Retournacois",        dept: "43", km: 24, dplus: 1100, tracks: ["100"] },
  { id: "trail-du-ventoux",          bloc: "mars", weekend: "2027-03-20", name: "Trail du Ventoux",          dept: "84", km: 29, dplus: 1350, tracks: ["100"] },
  /* EcoTrail : deux formats, deux jours différents → deux courses distinctes */
  { id: "ecotrail-paris-30",         bloc: "mars", weekend: "2027-03-20", date: "2027-03-20", name: "EcoTrail de Paris – 30 km", dept: "75", km: 29.5, dplus: 500, tracks: ["100"] },
  { id: "ecotrail-paris-22",         bloc: "mars", weekend: "2027-03-20", date: "2027-03-21", name: "EcoTrail de Paris – 22 km", dept: "75", km: 22,   dplus: 550, tracks: ["100"] },
  { id: "trail-mont-st-romain",      bloc: "mars", weekend: "2027-03-20", name: "Trail du Mont St Romain",   dept: "71", km: 30, dplus: 1000, tracks: ["100"] },
  { id: "sktrail",                   bloc: "mars", weekend: "2027-03-20", name: "SKTRAIL",                   dept: "64", km: 22, dplus: 1500, tracks: ["100"] },
  { id: "trail-des-grottes",         bloc: "mars", weekend: "2027-03-20", name: "Trail des Grottes",         dept: "73", km: 20, dplus: 1050, tracks: ["100"] },
  { id: "tour-pedestre-villers",     bloc: "mars", weekend: "2027-03-20", name: "Tour pédestre de Villers-lès-Nancy", dept: "54", km: 28, dplus: 420, tracks: ["100"] },
  { id: "trail-du-printemps",        bloc: "mars", weekend: "2027-03-20", name: "Trail du Printemps",        dept: "73", km: 25, dplus: 1280, tracks: ["100"] },
  { id: "grand-trail-garlaban",      bloc: "mars", weekend: "2027-03-27", name: "Grand Trail du Garlaban",   dept: "13", km: 28, dplus: 1700, tracks: ["100"] },
  { id: "trail-des-piqueurs",        bloc: "mars", weekend: "2027-03-27", name: "Trail des Piqueurs",        dept: "63", km: 25, dplus: 1000, tracks: ["100"] },
  { id: "trailversee-haute-joux",    bloc: "mars", weekend: "2027-03-27", name: "Trail'versée de la Haute Joux", dept: "39", km: 26, dplus: 980, tracks: ["100"] },
  { id: "trail-du-sanglier",         bloc: "mars", weekend: "2027-03-27", name: "Trail du Sanglier",         dept: "69", km: 28, dplus: 1200, tracks: ["100"] },
  { id: "trail-des-citadelles-relais", bloc: "mars", weekend: "2027-03-27", name: "Trail des Citadelles – Relais", dept: "09", km: 27, dplus: 1200, tracks: ["100"] },

  /* ─── Fin mai · début juin · 40 km max ────────────────────────────────── */
  { id: "maxi-race",                 bloc: "juin", weekend: "2027-05-29", name: "MaXi-Race",                 dept: "74", km: 42, dplus: 1800, tracks: ["100"] },
  { id: "cascades-de-l-alloix",      bloc: "juin", weekend: "2027-05-29", name: "Course des Cascades de l'Alloix", dept: "38", km: 35, dplus: 2000, tracks: ["100"] },
  { id: "alvitrail",                 bloc: "juin", weekend: "2027-05-29", name: "Alvitrail",                 dept: "46", km: 33, dplus: 1450, tracks: ["100"] },
  { id: "volta-fondeguilla",         bloc: "juin", weekend: "2027-05-29", name: "Volta al Terme de Fondeguilla", dept: "Espagne", km: 34.5, dplus: 2200, tracks: ["100"] },
  { id: "trail-cote-roannaise",      bloc: "juin", weekend: "2027-05-29", name: "Trail de la Côte Roannaise", dept: "42", km: 42, dplus: 2000, tracks: ["100"] },
  { id: "trail-des-marcaires",       bloc: "juin", weekend: "2027-05-29", name: "Trail des Marcaires",       dept: "68", km: 32, dplus: 1630, tracks: ["100"] },
  { id: "balcons-de-la-sure",        bloc: "juin", weekend: "2027-06-05", name: "Les Balcons de la Sure",    dept: "38", km: 32, dplus: 1600, tracks: ["100"] },
  { id: "integrale-du-bostet",       bloc: "juin", weekend: "2027-06-05", name: "L'Intégrale du Bostet",     dept: "73", km: 35, dplus: 2150, tracks: ["100"] },
  { id: "balcons-du-verdon",         bloc: "juin", weekend: "2027-06-05", name: "Balcons du Verdon",         dept: "04", km: 40, dplus: 1900, tracks: ["100"] },
  { id: "traversee-des-dentelles",   bloc: "juin", weekend: "2027-06-05", name: "Traversée des Dentelles",   dept: "84", km: 42, dplus: 2000, tracks: ["100"] },
  { id: "trail-du-cagire",           bloc: "juin", weekend: "2027-06-05", name: "Trail du Cagire",           dept: "31", km: 29, dplus: 1900, tracks: ["100"] },
  { id: "trail-des-millefonts",      bloc: "juin", weekend: "2027-06-05", name: "Trail des Millefonts",      dept: "06", km: 31, dplus: 2250, tracks: ["100"] },
  { id: "montan-aspe",               bloc: "juin", weekend: "2027-06-05", name: "Montan'Aspe",               dept: "64", km: 37, dplus: 2700, tracks: ["100"] },
  { id: "transju-trails",            bloc: "juin", weekend: "2027-06-05", name: "La Transju'Trails",         dept: "39", km: 42, dplus: 2200, tracks: ["100"] },

  /* ─── Début juillet · 40–50 km ────────────────────────────────────────── */
  { id: "chalmatrail",               bloc: "juillet", weekend: "2027-07-03", name: "Chalmatrail",            dept: "42", km: 45, dplus: 1840, tracks: ["100"] },
  { id: "trail-des-bauges",          bloc: "juillet", weekend: "2027-07-03", name: "Trail des Bauges",       dept: "73", km: 48, dplus: 2750, tracks: ["100"] },
  { id: "grand-raid-guillestrois-queyras", bloc: "juillet", weekend: "2027-07-03", name: "Grand Raid Guillestrois-Queyras", dept: "05", km: 48, dplus: 3200, tracks: ["100"] },
  { id: "tour-glaciers-vanoise",     bloc: "juillet", weekend: "2027-07-03", name: "Tour des Glaciers de la Vanoise", dept: "73", km: 41, dplus: 2850, tracks: ["100"] },
  /* Déplacée de « juin » → « juillet » le 22/09/2026 (signalé par Myriam) : l'édition 2026 a eu lieu le dim. 5 juillet */
  { id: "trail-hyeges-verdon",       bloc: "juillet", weekend: "2027-07-03", name: "Trail Hyèges Verdon",       dept: "04", km: 45, dplus: 2300, tracks: ["100"] }
];
