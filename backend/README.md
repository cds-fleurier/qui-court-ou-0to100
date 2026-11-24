# Backend — Google Sheet + Apps Script

Zéro serveur : un Google Sheet fait office de base, un script Apps Script expose
deux endpoints JSON (GET lecture / POST écriture). Les participants n'ont pas besoin
de compte Google — l'app web appelle l'URL du script en anonyme.

## Déploiement (une fois, ~5 minutes, depuis le compte Google du staff)

1. Créer un Google Sheet vierge → le nommer `Qui court où — 0 to 100`.
2. Menu **Extensions → Apps Script**. Effacer le contenu de `Code.gs`, coller
   le contenu de `backend/Code.gs`, enregistrer (💾).
3. Dans la barre du haut, choisir la fonction **`setup`** puis **Exécuter**.
   Google demande d'autoriser le script → *Autoriser* (avertissement « application
   non validée » : *Paramètres avancés → Accéder à … (non sécurisé)*, c'est ton
   propre script). Les onglets `choix` et `journal` apparaissent dans le Sheet.
4. **Déployer → Nouveau déploiement** :
   - Type : **Application web**
   - Exécuter en tant que : **Moi**
   - Qui a accès : **Tout le monde**  ← indispensable (accès anonyme)
   - Déployer → copier l'**URL de l'application web** (`https://script.google.com/macros/s/…/exec`)
5. Coller cette URL dans `scripts/config.js` → `const API_URL = "…";`, commit, push.

Test rapide : ouvrir l'URL `/exec` dans un navigateur → `{"ok":true,"choices":[],…}`.

## Limiter le script à cette seule feuille (fait le 21/09/2026)

Par défaut `SpreadsheetApp` réclame l'accès à *toutes* les feuilles du compte. Le manifeste
`appsscript.json` (⚙️ Paramètres → « Afficher le fichier manifeste ») force un scope réduit :

```json
"oauthScopes": ["https://www.googleapis.com/auth/spreadsheets.currentonly"]
```

Après modification : enregistrer, relancer `setup`, puis publier une **nouvelle version** du
déploiement. Si une autorisation large avait déjà été accordée, la révoquer dans
https://myaccount.google.com/connections puis relancer `setup` pour ré-autoriser avec le
scope réduit (la Web App est indisponible entre les deux).

## Mise à jour du script (procédure à suivre à chaque modification)

1. Ouvrir le projet Apps Script du Sheet (Extensions → Apps Script), remplacer **tout** le contenu
   de `Code.gs` par celui du repo, enregistrer (💾). Ne pas toucher au manifeste `appsscript.json`.
2. **Déployer → Gérer les déploiements → ✏️ (le déploiement existant) → Version : Nouvelle version
   → Déployer.** Surtout PAS « Nouveau déploiement » : il crée une autre URL `/exec`, et le site
   comme le calendrier continueraient d'appeler l'ancienne.
   (Un simple « enregistrer » ne met PAS à jour l'application web.)
3. **Tester juste après** (lecture seule, sans rien écrire) :
   ```bash
   node -e 'fetch(process.argv[1]).then(r=>r.json()).then(d=>console.log(d.ok, d.choices&&d.choices.length, d.features))' "https://script.google.com/macros/s/…/exec"
   node -e 'fetch(process.argv[1]+"?cal=charles").then(r=>r.json()).then(d=>console.log(d.ok, d.cal&&d.cal.length))' "https://script.google.com/macros/s/…/exec"
   node -e 'fetch(process.argv[1]+"?cal=%3Dx").then(r=>r.json()).then(d=>console.log(d))' "https://script.google.com/macros/s/…/exec"
   ```
   Attendu : `true <nombre de choix> [ 'dossard' ]`, puis `true <0 à 2>`, puis `{ ok: false, error: 'participant invalide' }`
   (ce dernier prouve que la nouvelle version est en ligne). Utiliser `fetch` (Node), pas `curl`
   (curl suit mal la redirection vers googleusercontent).
4. Ouvrir le site, cocher/décocher un choix sur son propre prénom, vérifier le toast et l'onglet `journal`.

En cas de souci : Gérer les déploiements → ✏️ → Version : choisir la version précédente → Déployer
(retour arrière immédiat, même URL).

## Garde-fous (24/11/2026)

- **Formules neutralisées** : toute valeur texte écrite passe par `safe()` ; si elle commence par
  `=`, `+`, `-` ou `@`, elle est préfixée d'une apostrophe (Sheets l'affiche en texte et la retire à la lecture).
- **Validation stricte** (sinon `{ ok:false, error }`, rien n'est écrit) :
  participant = id du roster `^[a-z0-9-]{1,40}$` ou invité `guest|100|Prénom` / `guest|40|Prénom`
  (prénom ≤ 40 caractères — limite du calendrier ; le site en autorise 30 —, sans `|` ni = + - @ en tête) ;
  bloc ∈ noel/mars/juin/juillet ; course = `^[a-z0-9-]{1,60}$` ou vide ; note ≤ 80 caractères (= le champ du site) ;
  calendrier : track ∈ 0to100/0to40, scenario ∈ week1/week2, clés = vraies dates du 2026-03-01 au 2027-09-30,
  ≤ 800 clés par appel, ≤ 620 jours stockés par ligne (les clés hors plage déjà stockées sont purgées au patch suivant).
- **Toujours du JSON** : `doGet` / `doPost` sous try/catch ; verrou (`LockService`, 8 s) sur toutes
  les écritures → `{ ok:false, error:"serveur occupé, réessaie dans un instant" }` s'il n'est pas obtenu.
- **Cache** (`CacheService`, 30 s) sur le GET principal : réécrit sous le verrou à chaque écriture
  (pas de retour en arrière possible) ; une modification faite **à la main dans le Sheet** apparaît
  sur le site au plus tard 30 s après. Le GET `?cal=` n'est pas mis en cache.

## Onglet `choix` (état courant)

| participant | bloc | course | note | updated_at | validated | dossard |
|---|---|---|---|---|---|---|
| `id` de `data/participants.js` | `noel` · `mars` · `juin` · `juillet` | `id` de `data/courses.js`, ou `autre` | nom libre si `autre` | date | à cocher par le staff (`1`, `oui`, `x`, `✓`, ou case à cocher) | `1` = dossard acheté (coché par le coureur dans l'app, ou par le staff) |

- Le staff peut **éditer directement** le Sheet (corriger, valider, supprimer une ligne).
- Les colonnes `validated` et `dossard` sont réinitialisées automatiquement si le participant change de course.
- `dossard` (26/10/2026) : `POST { type:"dossard", participant, bloc, value:true|false }` ; l'en-tête de la colonne G est ajouté au premier usage. Le GET renvoie `features:["dossard"]` : l'app n'affiche le bouton que si ce marqueur est présent.
- L'onglet `journal` garde l'historique : `at, participant, bloc, course, note, action, ancienne_course, ancienne_note`
  (les deux dernières colonnes depuis le 24/11/2026, ajoutées automatiquement à la première écriture).
  Un renvoi du même choix n'ajoute pas de ligne ; un retrait sans choix existant non plus.

## Invité qui entre ensuite dans le trombinoscope

Ses choix sont enregistrés sous l'id `guest|<100|40>|<Prénom>`. Une fois la personne ajoutée
à `participants.js` (carte), remplacer cet id par le nouvel `id` dans la colonne `participant`
de l'onglet `choix` (et lui dire de se re-sélectionner dans « C'est moi »).

## Limites connues

- Pas d'authentification : n'importe qui ayant l'URL peut enregistrer un choix au nom
  de n'importe qui. Acceptable pour une team de 40 personnes ; le journal permet de
  retrouver un abus, et le Sheet de le corriger.
- Quotas Apps Script largement suffisants (≈ 20 000 appels/jour).


## Onglet `calendrier` (synchro du calendrier 0 to 100, depuis le 10/10/2026)

Créé automatiquement au premier enregistrement (pas besoin de relancer `setup`).

| participant | track | scenario | done | updated_at |
|---|---|---|---|---|
| id de la team (`participants.js` ou `guest|…`) | `0to100` · `0to40` | `week1` · `week2` | JSON `{"AAAA-MM-JJ": true/false}` | date |

- `GET ?cal=<participant>` → `{ ok, cal:[{ track, scenario, done, updated_at }] }`
- `POST { type:"cal", participant, track, scenario, set:{…} }` → fusionne `set` dans `done` (seuls les jours envoyés changent).
- Journal (depuis le 24/11/2026) : action `calendrier`, colonne `bloc` = `track/scenario`, colonne `note` = `+N / −M`
  (jours cochés / décochés réellement changés). Les patchs du même participant sur le même calendrier
  sont cumulés dans la même ligne tant qu'ils se suivent à moins de 30 min → une ligne par série de clics,
  aucune ligne si rien n'a changé.
- Les routes de « Qui court où ? » (GET sans paramètre, POST sans `type`) sont inchangées.
