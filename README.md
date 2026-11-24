# Qui court où ? — team 0 to 100 / 0 to 40

Page web mobile-first : les courses de préparation validées par le staff (4 blocs de
week-ends), et **qui y va** — pour ne pas courir seul, ou changer de course pour
rejoindre quelqu'un.

**URL** : https://cds-fleurier.github.io/qui-court-ou-0to100/

Fait partie de l'écosystème team UTMB avec le
[calendrier](https://github.com/cds-fleurier/calendar-0-to-100-app) et la
[carte participants](https://github.com/cds-fleurier/carte-participants-0to100).

## Fonctionnement

1. Je choisis mon prénom (mémorisé sur le téléphone, clé `team_me` partagée avec le calendrier et la carte). Pas dans le trombinoscope → « Je ne suis pas dans la liste… » (prénom + parcours, id `guest|<100|40>|<Prénom>`). Une fois ajouté à la carte (même groupe, même prénom exact), l'invité bascule tout seul sur sa vraie fiche et ses choix sont repris.
2. Dans chaque bloc, « J'y vais » sur une course de la liste — ou « Autre course » (hors
   liste, à faire valider par le staff).
3. Tout le monde voit tout, tout de suite (rafraîchi au retour sur l'onglet et toutes les 90 s).
   Retirer ou changer un choix propose « Annuler » pendant 6 s (ancien choix + dossard renvoyés).
4. Une fois le dossard acheté : « 🎟️ J'ai mon dossard » sous « J'y vais ✓ » (v1.9.0). Le 🎟️ s'affiche à côté du
   prénom, dans le résumé perso et dans le compteur du bloc. Il retombe tout seul si on change de course. Le bouton
   n'apparaît que si le script du Sheet annonce `features: ["dossard"]` : un script plus ancien prendrait l'envoi
   pour un retrait de course.

Les choix sont stockés dans un **Google Sheet** via Apps Script → voir `backend/README.md`.
Sans `API_URL` (config.js), l'app tourne en **mode démo** (localStorage).

### Chargement rapide (v1.11.0)
- `config.js` est chargé en tête de `<head>` et lance aussitôt le GET (`window.__qcoChoices`, abandon à 15 s),
  repris par `app.js` ; `preconnect` vers `script.google.com` et `script.googleusercontent.com`.
- Au démarrage, les derniers choix connus s'affichent avant le réseau : la plus récente des clés
  localStorage `qco_choices_cache` (`{ at, choices, dossardOk }`) et `team_choices_cache` (`{ at, choices }`,
  écrite aussi par le calendrier et le hub, même origine). Après chaque GET réussi, l'app écrit les deux.
- Toute requête est abandonnée après 15 s ; les écritures sont optimistes et une réponse plus ancienne
  que l'état affiché ne l'écrase pas (seule la ligne qu'elle a écrite est reprise).

## Structure

```
index.html
styles/main.css          thème « Dark Altitude » (mêmes tokens que la carte)
scripts/config.js        API_URL, BLOCS (4 blocs, contraintes km), PHOTO_BASE
scripts/app.js           logique (état, rendu, appels backend)
data/courses.js          liste des courses autorisées (staff) — LA donnée à maintenir
backend/Code.gs          Apps Script (GET/POST JSON sur le Sheet)
backend/README.md        déploiement du script
```

## Maintenance

- **Nouvelle course / liste 0 to 40** : éditer `data/courses.js` (id unique, ne jamais
  renommer un id déjà choisi par quelqu'un), commit, push. Champs `url` + `signup`
  (`open` = date d'ouverture connue, `status: "open"` = déjà ouvertes, `note` libre) : relevé
  dans `docs/inscriptions_releve_2026-09-22.md`, à rafraîchir quand les organisateurs annoncent 2027.
- **À chaque version** : bumper `APP_VERSION` (`scripts/app.js`) **et** les `?v=` de `index.html`
  (style + 3 scripts, dont `config.js` en tête du `<head>`) — sinon les téléphones gardent jusqu'à 10 min l'ancien `courses.js` en cache
  (GitHub Pages sert `max-age=600`).
- **Nouveau participant** : l'ajouter dans le repo de la carte, c'est tout — le roster et les
  photos sont chargés depuis le GitHub Pages de la carte (`participants.js`), rien ici.
- **Validation staff** : cocher `validated` dans l'onglet `choix` du Sheet.
- Bumper `APP_VERSION` (app.js) + `CHANGELOG.md` à chaque push.

## Déploiement

`git push origin main` → GitHub Pages (compte **cds-fleurier**).
