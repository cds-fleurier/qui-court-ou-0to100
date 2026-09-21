/* ────────────────────────────────────────────────────────────────────────────
   Configuration « Qui court où ? » — team 0 to 100 / 0 to 40
   ──────────────────────────────────────────────────────────────────────────── */

/* URL du Web App Google Apps Script (backend/Code.gs déployé en « Application web »).
   Vide → mode démo : les choix restent dans le localStorage du téléphone. */
const API_URL = "https://script.google.com/macros/s/AKfycbwS1c6LgGqqLaanrQvfPyprFUqocJZlvQG0sDPcZbSrqKRtCY8FmhBBWgBUd0diy5n3/exec";

/* Les photos vivent dans le repo de la carte participants (pas de doublon). */
const PHOTO_BASE = "https://cds-fleurier.github.io/carte-participants-0to100/";

/* Les 4 blocs de week-ends (contraintes staff, 14/09/2026 — mêmes valeurs que l'app calendrier). */
const BLOCS = [
  {
    id: "noel", label: "Noël", emoji: "🎄",
    weekends: [
      { id: "2026-12-19", label: "19–20 déc. 2026" },
      { id: "2026-12-26", label: "26–27 déc. 2026" }
    ],
    km: { "100": "10–15 km", "40": "10–15 km" }
  },
  {
    id: "mars", label: "Mars", emoji: "🌱",
    weekends: [
      { id: "2027-03-20", label: "20–21 mars 2027" },
      { id: "2027-03-27", label: "27–28 mars 2027" }
    ],
    km: { "100": "20–30 km", "40": "10–15 km" }
  },
  {
    id: "juin", label: "Fin mai · début juin", emoji: "☀️",
    weekends: [
      { id: "2027-05-29", label: "29–30 mai 2027" },
      { id: "2027-06-05", label: "5–6 juin 2027" }
    ],
    km: { "100": "40 km max", "40": "20 km max" }
  },
  {
    id: "juillet", label: "Début juillet", emoji: "🏔️",
    weekends: [
      { id: "2027-07-03", label: "3–4 juil. 2027" }
    ],
    km: { "100": "40–50 km", "40": "20–25 km" }
  }
];

/* Identifiant réservé pour « une autre course » (hors liste, à faire valider). */
const OTHER_COURSE = "autre";

/* Rafraîchissement automatique des choix (ms) quand l'onglet est visible. */
const REFRESH_MS = 90 * 1000;
