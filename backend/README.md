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

## Mise à jour du script

Après une modification de `Code.gs` : **Déployer → Gérer les déploiements →
✏️ → Version : Nouvelle version → Déployer**. L'URL ne change pas.
(Un simple « enregistrer » ne met PAS à jour l'application web.)

## Onglet `choix` (état courant)

| participant | bloc | course | note | updated_at | validated |
|---|---|---|---|---|---|
| `id` de `data/participants.js` | `noel` · `mars` · `juin` · `juillet` | `id` de `data/courses.js`, ou `autre` | nom libre si `autre` | date | à cocher par le staff (`1`, `oui`, `x`, `✓`, ou case à cocher) |

- Le staff peut **éditer directement** le Sheet (corriger, valider, supprimer une ligne).
- La colonne `validated` est réinitialisée automatiquement si le participant change de course.
- L'onglet `journal` garde l'historique complet (qui a changé quoi, quand).

## Limites connues

- Pas d'authentification : n'importe qui ayant l'URL peut enregistrer un choix au nom
  de n'importe qui. Acceptable pour une team de 40 personnes ; le journal permet de
  retrouver un abus, et le Sheet de le corriger.
- Quotas Apps Script largement suffisants (≈ 20 000 appels/jour).
