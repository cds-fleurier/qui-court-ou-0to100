# Changelog

## 1.5.1 — 7 octobre 2026
- **Veille inscriptions** sur les 44 courses sans date d'ouverture connue → `docs/inscriptions_veille_2026-10-07.md`.
  - **Ouvertes** : Trail Blanc du Gashney (sporkrono), Traversée des Dentelles 2027 (Finishers).
  - **Trail des Marcaires déplacé au WE 5–6 juin** (dim. 6/06/2027 selon le site officiel).
  - Dates 2027 confirmées : Balcons de la Sure et Trail du Cagire (6/06). Notes mises à jour : Guillestrois-Queyras, Volta al Terme, Cascades de l'Alloix.
  - Trail des Jonquilles : lien corrigé (GoTrail renvoyait vers un événement belge).

## 1.5.0 — 7 octobre 2026
- **Liste 0 to 40 validée par le staff** (tableau « proche de Saint-Étienne », D+ du staff) — 12 cartes + relais Citadelles 15 km :
  - Noël : Montée de Chambles 11 km / 300 D+ (même course que le 0 to 100, ouverte aux deux parcours ; D+ corrigé 250 → 300) ;
  - 20–21 mars : Trail Retournacois 10 km / 360 D+ ou 15 km / 700 D+ ;
  - 27–28 mars : Trail des Jonquilles (Tence) 10 km / 200 D+ ou 15 km / 280 D+ ;
  - 29–30 mai : Run Écully 20 km / 400 D+, Trail de l'Éolienne (Les Sauvages) 23 km / 940 D+, Ambertrail (63) 21 km « Tour de Saint-Ferréol » / 700 D+ ;
  - 5–6 juin : Franchevill'Trail 25 km / 530 D+ ;
  - 3–4 juillet : Courir pour des Mômes (Graix) 20 km / 700 D+, Chalmatrail 20 km / 720 D+, Tour des Glaciers de la Vanoise 25 km « Pralo vu du Ciel » / 1750 D+.
  Une carte par format ; les formats courts de courses déjà listées en 0 to 100 ont leur propre id, les ids existants ne bougent pas.
- Plus de message « La liste 0 to 40 arrive ».
- Cache : `?v=<version>` sur le style et les scripts dans `index.html`.

## 1.4.4 — 22 septembre 2026
- Avatars servis en miniatures 320 px (générées côté carte) au lieu des photos originales de 2 Mo.

## 1.4.3 — 22 septembre 2026 (relecture)
- Le roster est chargé depuis la carte (comme le calendrier) : plus de copie locale de `participants.js` à synchroniser.
- Fix : le rafraîchissement automatique ne redessine plus la page pendant qu'on tape une
  « autre course » (le texte était perdu), ni pendant un enregistrement.
- Fix : un chargement parti avant un « J'y vais » ne peut plus écraser le choix à l'écran.
- `signup.close` : fenêtre d'inscription fermée (MaXi-Race après le 7 oct.) affichée comme telle.

## 1.4.2 — 22 septembre 2026
- Trail des Citadelles : relais à 2 sur le 40 km → tronçon 27 km (0 to 100, id inchangé) + nouveau tronçon 15 km (0 to 40, première course 0 to 40 de la liste). Ouverture du 40 km : dim. 8 nov. 15h.

## 1.4.0 — 22 septembre 2026
- **Inscriptions** : relevé des 42 courses (site officiel, date 2027 quand confirmée, état ou date
  d'ouverture des inscriptions) → `url` + `signup` dans `data/courses.js`, ligne 📝 sur chaque carte
  avec compte à rebours J-n quand l'ouverture est datée (orange si ≤ 21 jours, vert si ouvertes).
  Relevé complet : `docs/inscriptions_releve_2026-09-22.md`.
- Dates précises ajoutées quand confirmées (Montée de Chambles et Guigne le dim. 27/12, Citadelles
  dim. 28/03, Balcons de la Sure et Cagire dim. 6/06…). Trail des Grottes déplacé sur le WE 27–28 mars.

## 1.3.3 — 22 septembre 2026
- Trail Hyèges Verdon déplacé du bloc fin mai/juin au bloc début juillet (édition 2026 le dim. 5 juillet — merci Myriam).

## 1.3.2 — 21 septembre 2026
- Une course de la liste est validée par définition (badge « ✓ staff » retiré) ; une « autre course » affiche « ✓ validée par le staff » une fois cochée dans le Sheet.

## 1.3.1 — 21 septembre 2026
- Cache des derniers choix connus (`qco_choices_cache`) : si le Sheet est injoignable, on affiche le cache avec la mention « hors ligne » au lieu d'un tableau vide.

## 1.3.0 — 21 septembre 2026
- Mode invité : « Je ne suis pas dans la liste… » → prénom + parcours, id `guest|<100|40>|<Prénom>` (même convention que le calendrier), avatar initiales, visible par tous.

## 1.2.0 — 21 septembre 2026
- Identité partagée avec le calendrier et la carte : clé localStorage `team_me` (migration depuis `qco_me`). Le calendrier affiche désormais les courses choisies ici.

## 1.1.0 — 21 septembre 2026
- Barre d'onglets partagée de la team (hub `0to100-hub/nav.js`) : Calendrier · Carte · Qui court où · Séances, en bas d'écran. Toast remonté au-dessus de la barre.

## 1.0.2 — 21 septembre 2026
- Roster : ajout de William (0 to 100), synchro depuis la carte.

## 1.0.1 — 21 septembre 2026
- Backend branché : Google Sheet « Qui court ou » + Apps Script (API_URL), fin du mode démo.

## 1.0.0 — 21 septembre 2026
- Première version : 4 blocs (Noël, mars, fin mai/juin, début juillet), 42 courses
  autorisées 0 to 100 (liste staff du 21/09), sélection « J'y vais », « Autre course »
  hors liste, résumé perso 0/4, filtre par parcours, « pas encore choisi » par bloc.
- EcoTrail de Paris séparé en deux courses (30 km sam. 20/03, 22 km dim. 21/03).
- Backend Google Sheet + Apps Script (`backend/`), mode démo sans API_URL.
- Liste 0 to 40 : en attente du staff.
