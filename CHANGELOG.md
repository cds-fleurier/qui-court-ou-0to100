# Changelog

## 1.8.0 — 26 octobre 2026
Veille du 26/10 (27 courses, 3 agents, ouvertures et complets revérifiés sur les plateformes) → `docs/inscriptions_veille_2026-10-26.md`.
- Nouveau statut `signup.status: "full"` → pastille **« Complet »** (rouge clair).
- **Trail du Ventoux – Balcons 29 km : complet** (1 026 inscrits pour 950 places).
- **MaXi-Race** (42 et 20 km) : tirage terminé, complet → liste d'attente (sportips), Marathon le dim. 30/05.
- Ouvertes : **Corrida-Trail Ambarroise** 10 et 5 km (njuko, dim. 20/12), **Trail de la Guigne**, **Verdon**, **Transju'Trails** 42 et 15 km (liens directs vers les plateformes, prix et places).
- **Trail du Facteur** : sam. 19/12 à Hauterives, 17,2 km, ⚠️ sans doute déjà plein.
- **Nocturne du Cœur** : ouverture le 2/11 à 7h. **Fadarelles** : pré-inscription sur le site de l'orga, paiement sur place. **Chambles** : 27/12 confirmé.
- **Trail des Citadelles** : ⚠️ plus de relais 40 km en 2027 (40 km solo, relais à 4 sur le 73 km) — note sur les deux cartes, à revoir avec le staff ; calendrier des ouvertures 1/11 → 11/11.
- Estimations d'ouverture précisées (Piqueurs, Sanglier, Garlaban, Mont Saint-Romain, Grottes, Retournacois, Marcaires).

## 1.7.1 — 26 octobre 2026
- **Tour des Glaciers de la Vanoise** (41 km « L'Incontournable » et 25 km « Pralo vu du Ciel ») : inscriptions **ouvertes** depuis le 25/10 à 18h, lues sur la plateforme as2pic (dossard déjà validé côté team). Lien des cartes vers la page d'inscription. 41 km : 60 € + frais, départ 5h, 249 places restantes au 26/10 ; 25 km : 30 € + frais, départ 7h, 388 places restantes ; le 73 km est déjà complet.

## 1.7.0 — 19 octobre 2026
- **Invité → vraie fiche automatique** : si l'identité mémorisée est un invité (`guest|<100|40>|<Prénom>`) et qu'une fiche du trombinoscope a le même groupe et le même prénom exact (casse et accents ignorés), « C'est moi » bascule tout seul sur la vraie fiche. Les choix faits en invité sont repris sous le vrai id (sans écraser un choix déjà fait) puis retirés de l'invité ; en cas d'échec réseau, nouvel essai au chargement suivant (`qco_guest_pending`). Même règle que le calendrier 3.3.0. Cas d'origine : Jérémy.
- `APP_VERSION` remis en phase avec le cache-busting (`1.6.0` affiché depuis la 1.6.1).

## 1.6.6 — 18 octobre 2026
Veille inscriptions du 18/10 (3 agents, 49 courses sans ouverture confirmée) → `docs/inscriptions_veille_2026-10-18.md`.
- **Grand Raid Guillestrois-Queyras** : ouverture **dim. 1er nov. 2026 à 9h** (lue sur le formulaire registration4all, tous formats), Trail des Lacs sam. 3/07/2027 à 8h, 65 € puis 70 € au 1/02.
- **Trail'versée de la Haute-Joux** : dim. 28/03/2027 confirmé (Doye, site officiel).
- **Tour des Glaciers de la Vanoise** (41 et 25 km) : ouverture du 25/10 à 18h confirmée sur la page inscriptions officielle (trailsvanoise.fr, qui écrit « 25 Octobre 2027 », coquille probable), lien des cartes vers cette page.
- **Volta al Terme** : sam. 29/05/2027 confirmé par le site officiel (44e édition).

## 1.6.5 — 18 octobre 2026
- **Corrida-Trail Ambarroise – 5 km** : nouvelle carte 0 to 40 (`corrida-trail-ambarroise-5`, même événement que le 10 km 0 to 100 ; 7 €, dès 13 ans, D+ non publié).
- **Course des Cascades** : édition 2027 confirmée (dim. 30/05, site officiel) — carte « Course des Cascades – 40 km » (« de l'Alloix » retiré), **40 km au lieu de 35** (CDC40, parcours renouvelé), lien vers la page CDC40.
- **Trail du Rocamadour AOP** remplace « Alvitrail » (nom du club organisateur) ; **Var Verdon Trail Canyon – 40 km « Trail des Balcons du Verdon »** (page épreuves officielle). Ids inchangés.
- **Trail des Bauges** : la carte 0 to 100 devient « 47 km « Trail Expert » » (47 km au lieu de 48 : nouveau tracé du site officiel ; id `trail-des-bauges` inchangé) ; nouvelle carte **0 to 40 « 23 km « Trail Sportif » »** (`trail-des-bauges-23`, ≈ 1500 D+). Ben et Samuel (« Trail des bauges 23km 1500 D+ » en « autre ») basculés dessus après mise en ligne.
- Samuel et Lucie l'avaient saisie en « autre » (« Corrida Trail Ambarroise ») → basculés sur `corrida-trail-ambarroise-5` après mise en ligne.

## 1.6.4 — 18 octobre 2026
- **Trail du Circuit de la Sure** (dim. 6/06/2027, Voiron) : la carte 0 to 100 devient « 32 km « Les Balcons de la Sure » » (id `balcons-de-la-sure` inchangé) ; nouvelle carte **0 to 40 « 12 km « Le Tour de Vouise » »** (`tour-de-vouise-12`, 660 D+, site officiel).
- Samuel l'avait saisie en « autre » (« Trail du circuit de la Sure ») → basculé sur `tour-de-vouise-12` après mise en ligne.
- **Noms harmonisés** au format « Événement – N km « Nom de la course » » : 17 cartes renommées d'après les sites officiels (VO2 Suc, La Bosse à Bloc, Balcons du Ventoux, Marathon eXpérience, La CRRASSEUSE, Le Défi de Muhlbach, Marathon des Dentelles, La Grande Boucle, Défi de l'Ourdinse, Chalma'Rathon, Le Trail des Lacs…), formats remis entre guillemets (Quart de tOur du lac, Trail du Fort, Chalma'Classique), orthographes Mont Saint-Romain et Haute-Joux. Ids inchangés. Détail, noms non appliqués et écarts km/D+ relevés : `docs/noms_courses_2026-10-18.md`.

## 1.6.3 — 18 octobre 2026
- **Trail des Grottes** (dim. 28/03/2027) : la carte 0 to 100 devient « 21 km « Grand Trail des Grottes » » (21 km au lieu de 20, id `trail-des-grottes` inchangé) ; nouvelle carte **0 to 40 « 10 km « Petit Trail des Grottes » »** (`trail-des-grottes-10`, 490 D+, départ 9h45 en 2026).
- Samuel l'avait saisie en « autre » (« Trail des Grottes ») → basculé sur `trail-des-grottes-10` après mise en ligne.

## 1.6.2 — 18 octobre 2026
- **Tour des Glaciers de la Vanoise** : la carte 0 to 100 devient « 41 km « L'Incontournable » » (même présentation que le 25 km « Pralo vu du Ciel »). Inscriptions : **ouverture dim. 25 oct. 2026 à 18h** (info transmise par Charles le 18/10), reportée aussi sur le 25 km. Course le dim. 4/07/2027 (site Sibotrails).

## 1.6.1 — 10 octobre 2026 (backend seulement)
- Apps Script : routes de synchro du **calendrier 0 to 100** (`GET ?cal=`, `POST {type:"cal"}`, onglet `calendrier` créé à la volée). Routes existantes inchangées. Voir `backend/README.md`.

## 1.6.0 — 9 octobre 2026
- **Refonte des cartes course, plus lisibles et harmonisées** :
  - titre = nom de la course, le format en sous-titre (« Casse Patte », « Grand Défi »…), la distance n'est plus répétée ;
  - une ligne unique jour · km · D+ ;
  - **pastille d'inscription courte, même vocabulaire partout** : Ouvertes · Ouverture le 8 nov. · J-30 · Ouverture ≈ janv. · Ouverture ? · Liste d'attente · Closes (nouveaux champs `signup.expect`, `signup.waitlist`, `status: "waitlist"`) ;
  - **accordéon « Infos »** pour tout le reste (tarifs, plateforme, remarques, lien vers le site) ; il reste ouvert pendant les rafraîchissements ;
  - « personne pour l'instant » retiré ;
  - deux cartes du même nom dans un bloc (EcoTrail, Jonquilles, Retournacois…) : la distance est ajoutée au titre (« EcoTrail de Paris 30 km »).
- Choisir son prénom bascule le filtre sur son parcours (0 to 40 ou 0 to 100) ; « Tous » reste à un tap.
- Champ `format` optionnel (sous-titre imposé) : utilisé pour le relais des Citadelles.

## 1.5.4 — 9 octobre 2026
- **0 to 40 : La Transju'Trails – 15 km** (dim. 6/06/2027, 870 D+, boucle au départ des Tuffes, Les Rousses). Inscriptions ouvertes depuis le 8 oct. sur njuko (annonce officielle).
- Pauline l'avait saisie en « autre » (« Trans ju trail (39) 15km ») → basculée sur `transju-trails-15` après mise en ligne.

## 1.5.3 — 7 octobre 2026
- **0 to 40 : MaXi-Race – Quart de tOur du Lac** validé (sam. 29/05/2027, ~20 km / 410 D+ / 1450 D−, trail en descente Semnoz → Annecy). Pré-inscriptions du 1er au 2 oct. 2026 puis tirage au sort : affichée « inscriptions closes », liste d'attente annoncée par l'organisation.
- Bloc fin mai · début juin, 0 to 40 : libellé « 20 km max » → « 20–25 km » (Ambertrail 21, Éolienne 23, Franchevill 25 km).

## 1.5.2 — 7 octobre 2026
- Correction : Traversée des Dentelles **pas encore ouverte**. Le lien « Inscriptions 2027 » du site officiel mène à une liste d'attente sur Finishers, pas à l'inscription.
- Orthographe : Trail Blanc du **Gaschney** (l'id `trail-blanc-gashney` ne change pas, il est stocké dans le Sheet).

## 1.5.1 — 7 octobre 2026
- **Veille inscriptions** sur les 44 courses sans date d'ouverture connue → `docs/inscriptions_veille_2026-10-07.md`.
  - **Ouvertes** : Trail Blanc du Gaschney (sporkrono). ~~Traversée des Dentelles~~ : erreur, corrigée en 1.5.2.
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
