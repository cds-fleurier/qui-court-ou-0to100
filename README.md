# Qui court où ? — team 0 to 100 / 0 to 40

Page web mobile-first : les courses de préparation validées par le staff (4 blocs de
week-ends), et **qui y va** — pour ne pas courir seul, ou changer de course pour
rejoindre quelqu'un.

**URL** : https://cds-fleurier.github.io/qui-court-ou-0to100/

Fait partie de l'écosystème team UTMB avec le
[calendrier](https://github.com/cds-fleurier/calendar-0-to-100-app) et la
[carte participants](https://github.com/cds-fleurier/carte-participants-0to100).

## Fonctionnement

1. Je choisis mon prénom (mémorisé sur le téléphone, clé `team_me` partagée avec le calendrier et la carte). Pas dans le trombinoscope → « Je ne suis pas dans la liste… » (prénom + parcours, id `guest|<100|40>|<Prénom>`).
2. Dans chaque bloc, « J'y vais » sur une course de la liste — ou « Autre course » (hors
   liste, à faire valider par le staff).
3. Tout le monde voit tout, tout de suite (rafraîchi au retour sur l'onglet et toutes les 90 s).

Les choix sont stockés dans un **Google Sheet** via Apps Script → voir `backend/README.md`.
Sans `API_URL` (config.js), l'app tourne en **mode démo** (localStorage).

## Structure

```
index.html
styles/main.css          thème « Dark Altitude » (mêmes tokens que la carte)
scripts/config.js        API_URL, BLOCS (4 blocs, contraintes km), PHOTO_BASE
scripts/app.js           logique (état, rendu, appels backend)
data/participants.js     roster — COPIE de carte-participants-0to100/data/participants.js
data/courses.js          liste des courses autorisées (staff) — LA donnée à maintenir
backend/Code.gs          Apps Script (GET/POST JSON sur le Sheet)
backend/README.md        déploiement du script
```

## Maintenance

- **Nouvelle course / liste 0 to 40** : éditer `data/courses.js` (id unique, ne jamais
  renommer un id déjà choisi par quelqu'un), commit, push.
- **Nouveau participant** : recopier `participants.js` depuis le repo de la carte
  (les photos sont chargées depuis le GitHub Pages de la carte, rien à copier ici).
- **Validation staff** : cocher `validated` dans l'onglet `choix` du Sheet.
- Bumper `APP_VERSION` (app.js) + `CHANGELOG.md` à chaque push.

## Déploiement

`git push origin main` → GitHub Pages (compte **cds-fleurier**).
