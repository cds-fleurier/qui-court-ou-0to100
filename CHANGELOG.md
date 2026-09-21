# Changelog

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
