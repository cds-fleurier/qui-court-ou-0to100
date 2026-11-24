/**
 * « Qui court où ? » — backend Google Apps Script (Web App)
 * ------------------------------------------------------------------
 * Un Google Sheet, trois onglets :
 *   choix      : état courant, une ligne par (participant, bloc)
 *   journal    : historique des modifications (append only, patchs calendrier regroupés)
 *   calendrier : jours cochés du calendrier 0 to 100 (créé au premier enregistrement)
 *
 * GET  → { ok, choices:[...], generatedAt, features:["dossard"] }   (cache ~30 s, vidé à chaque écriture)
 * POST → body JSON { participant, bloc, course, note }  (course "" = retirer)
 *        → { ok, choices:[...] }
 * POST { type:"dossard", participant, bloc, value:true|false }  (26/10/2026)
 *        → coche « dossard acheté » sur le choix existant → { ok, choices:[...] }
 *        Le choix change de course → la case retombe (comme validated).
 *        `features` dans le GET : le site n'affiche le bouton que si le script le gère
 *        (un ancien script prendrait ce POST pour un retrait de course).
 *
 * Calendrier 0 to 100 (synchro des jours cochés entre appareils, v2 du 10/10/2026) :
 *   onglet calendrier : une ligne par (participant, track, scenario), done = JSON {"AAAA-MM-JJ": bool}
 * GET  ?cal=<participant>  → { ok, cal:[{ track, scenario, done, updated_at }] }
 * POST { type:"cal", participant, track, scenario, set:{ "AAAA-MM-JJ": bool, … } }
 *        → fusionne `set` dans `done` (seuls les jours envoyés changent) → { ok, done, updated_at }
 *
 * Toute erreur → { ok:false, error:"…" } (jamais de page HTML d'erreur Google).
 * Toute valeur texte écrite passe par safe() : pas d'injection de formule dans le Sheet.
 *
 * Déploiement : voir backend/README.md
 */

const SHEET_CHOIX   = "choix";
const SHEET_JOURNAL = "journal";
const HEADERS       = ["participant", "bloc", "course", "note", "updated_at", "validated", "dossard"];
const JOURNAL_HEADERS = ["at", "participant", "bloc", "course", "note", "action", "ancienne_course", "ancienne_note"];
const BLOCS_OK      = ["noel", "mars", "juin", "juillet"];
const SHEET_CAL     = "calendrier";
const CAL_HEADERS   = ["participant", "track", "scenario", "done", "updated_at"];
const TRACKS_OK     = ["0to100", "0to40"];
const SCENARIOS_OK  = ["week1", "week2"];

/* Limites (alignées sur le site : champ « autre course » maxlength 80, prénom invité 30 côté site,
   40 côté calendrier qui crée aussi des ids invités). */
const MAX_NOTE      = 80;
const RE_ROSTER_ID  = /^[a-z0-9-]{1,40}$/;
const RE_GUEST_ID   = /^guest\|(100|40)\|[^|\s=+\-@\u0000-\u001f][^|\u0000-\u001f]{0,39}$/;
const RE_COURSE_ID  = /^[a-z0-9-]{1,60}$/;
const CAL_FIRST_DAY = "2026-03-01";
const CAL_LAST_DAY  = "2027-09-30";
const CAL_MAX_KEYS_PER_CALL = 800;
const CAL_MAX_DAYS  = 620;          // jours stockés par ligne (la plage valide en compte 579)
const CAL_LOG_MERGE_MS = 30 * 60 * 1000; // patchs calendrier du même participant regroupés sur 30 min

const CACHE_KEY     = "choices_v1";
const CACHE_TTL_S   = 30;
const LOCK_MS       = 8000;

/* À lancer UNE FOIS depuis l'éditeur (menu Exécuter) : crée les onglets + en-têtes. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  [SHEET_CHOIX, SHEET_JOURNAL].forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    const headers = name === SHEET_JOURNAL ? JOURNAL_HEADERS : HEADERS;
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
      sh.setFrozenRows(1);
    }
  });
  const first = ss.getSheets()[0];
  if (first.getName() === "Feuille 1" || first.getName() === "Sheet1") ss.deleteSheet(first);
}

/* ─── Points d'entrée ──────────────────────────────────────────────────────── */
function doGet(e) {
  try {
    const params = (e && e.parameter) || {};
    if (params.cal) {
      const participant = String(params.cal || "").trim();
      if (!isParticipant(participant)) return json({ ok: false, error: "participant invalide" });
      return json({ ok: true, cal: readCal(participant) });
    }
    return json(choicesResponse());
  } catch (err) {
    return json({ ok: false, error: errMsg(err) });
  }
}

function doPost(e) {
  try {
    let body;
    try { body = JSON.parse((e && e.postData && e.postData.contents) || "{}"); }
    catch (_) { return json({ ok: false, error: "JSON invalide" }); }
    if (!body || typeof body !== "object" || Array.isArray(body)) return json({ ok: false, error: "requête invalide" });
    if (body.type === "cal") return json(calPatch(body));
    if (body.type === "dossard") return json(setDossard(body));
    if (body.type !== undefined) return json({ ok: false, error: "type inconnu" });
    return json(saveChoice(body));
  } catch (err) {
    return json({ ok: false, error: errMsg(err) });
  }
}

/* ─── Validation ───────────────────────────────────────────────────────────── */
function isParticipant(id) {
  return typeof id === "string" && (RE_ROSTER_ID.test(id) || RE_GUEST_ID.test(id));
}

/* Vraie date du calendrier, dans la plage du programme. */
function isCalDay(k) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(k);
  if (!m || k < CAL_FIRST_DAY || k > CAL_LAST_DAY) return false;
  const d = new Date(Date.UTC(+m[1], +m[2] - 1, +m[3]));
  return d.getUTCFullYear() === +m[1] && d.getUTCMonth() === +m[2] - 1 && d.getUTCDate() === +m[3];
}

/* ─── Choix de course ──────────────────────────────────────────────────────── */
function saveChoice(body) {
  const participant = str(body.participant);
  const bloc = str(body.bloc);
  const course = str(body.course);
  const note = str(body.note);
  if (!isParticipant(participant)) return { ok: false, error: "participant invalide" };
  if (BLOCS_OK.indexOf(bloc) === -1) return { ok: false, error: "bloc inconnu" };
  if (course && !RE_COURSE_ID.test(course)) return { ok: false, error: "course invalide" };
  if (note.length > MAX_NOTE) return { ok: false, error: "nom de course trop long (" + MAX_NOTE + " caractères max)" };
  return withLock(() => {
    upsert(participant, bloc, course, course ? note : "");
    return { ok: true, choices: refreshChoicesCache() };
  });
}

function upsert(participant, bloc, course, note) {
  const sh = sheet(SHEET_CHOIX);
  const last = sh.getLastRow();
  const now = new Date();
  let rowIndex = -1;
  let previous = null;
  if (last >= 2) {
    const rows = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
    for (let i = 0; i < rows.length; i++) {
      if (String(rows[i][0]) === participant && String(rows[i][1]) === bloc) { rowIndex = i + 2; previous = rows[i]; break; }
    }
  }
  const prevCourse = previous ? String(previous[2] || "") : "";
  const prevNote = previous ? String(previous[3] || "") : "";

  if (!course) {
    if (rowIndex > 0) {
      sh.deleteRow(rowIndex);
      log(now, participant, bloc, "", "", "retrait", prevCourse, prevNote);
    }
    return;
  }

  // Le choix change → la validation staff et le dossard tombent ; même choix → on les garde.
  const same = previous && prevCourse === course && prevNote === note;
  const validated = same ? previous[5] : "";
  const dossard = same ? previous[6] : "";
  const values = [[safe(participant), safe(bloc), safe(course), safe(note), now, validated, dossard]];
  if (rowIndex > 0) sh.getRange(rowIndex, 1, 1, HEADERS.length).setValues(values);
  else sh.appendRow(values[0]);
  if (!same) log(now, participant, bloc, course, note, rowIndex > 0 ? "modif" : "ajout", prevCourse, prevNote);
}

/* Case « dossard » : 1, true, oui, x, ✓ ou case à cocher Google Sheets. */
function isChecked(v) {
  return v === true || /^(1|true|oui|x|ok|yes|✓)$/i.test(String(v == null ? "" : v).trim());
}

function setDossard(body) {
  const participant = str(body.participant);
  const bloc = str(body.bloc);
  if (!isParticipant(participant)) return { ok: false, error: "participant invalide" };
  if (BLOCS_OK.indexOf(bloc) === -1) return { ok: false, error: "bloc inconnu" };
  const value = body.value === true;
  return withLock(() => {
    const sh = sheet(SHEET_CHOIX);
    // Feuilles créées avant le 26/10/2026 : l'en-tête de la 7e colonne manque.
    if (!String(sh.getRange(1, 7).getValue())) sh.getRange(1, 7).setValue("dossard").setFontWeight("bold");
    const last = sh.getLastRow();
    let rowIndex = -1, course = "";
    if (last >= 2) {
      const rows = sh.getRange(2, 1, last - 1, 3).getValues();
      for (let i = 0; i < rows.length; i++) {
        if (String(rows[i][0]) === participant && String(rows[i][1]) === bloc) { rowIndex = i + 2; course = String(rows[i][2]); break; }
      }
    }
    if (rowIndex < 0) return { ok: false, error: "pas de course choisie pour ce bloc" };
    sh.getRange(rowIndex, 7).setValue(value ? "1" : "");
    log(new Date(), participant, bloc, course, "", value ? "dossard" : "dossard retiré", "", "");
    return { ok: true, choices: refreshChoicesCache() };
  });
}

/* ─── Lecture + cache ──────────────────────────────────────────────────────── */
function sheet(name) {
  const sh = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(name);
  if (!sh) throw new Error("Onglet manquant : " + name + " — lance setup()");
  return sh;
}

function readChoices() {
  const sh = sheet(SHEET_CHOIX);
  const last = sh.getLastRow();
  if (last < 2) return [];
  const rows = sh.getRange(2, 1, last - 1, HEADERS.length).getValues();
  return rows
    .filter(r => r[0] && r[1] && r[2])
    .map(r => ({
      participant: String(r[0]),
      bloc: String(r[1]),
      course: String(r[2]),
      note: String(r[3] || ""),
      updated_at: r[4] instanceof Date ? r[4].toISOString() : String(r[4] || ""),
      validated: r[5] === true ? "1" : String(r[5] || ""),
      dossard: isChecked(r[6]) ? "1" : ""
    }));
}

/* GET principal. Le cache (30 s) est réécrit à chaque écriture, sous le même verrou :
   une lecture ne peut donc jamais y remettre un état antérieur à une écriture.
   Une modification faite à la main dans le Sheet apparaît au plus tard 30 s après. */
function choicesResponse() {
  const cache = scriptCache();
  const hit = cache && cache.get(CACHE_KEY);
  if (hit) {
    try { return JSON.parse(hit); } catch (_) { /* cache illisible : on relit */ }
  }
  const lock = LockService.getScriptLock();
  const locked = lock.tryLock(3000);
  try {
    return locked ? buildAndCache() : buildResponse(readChoices());
  } finally {
    if (locked) lock.releaseLock();
  }
}

function buildResponse(choices) {
  return { ok: true, choices: choices, generatedAt: new Date().toISOString(), features: ["dossard"] };
}

function buildAndCache() {
  const res = buildResponse(readChoices());
  const cache = scriptCache();
  if (cache) {
    try { cache.put(CACHE_KEY, JSON.stringify(res), CACHE_TTL_S); } catch (_) { /* > 100 Ko : pas de cache */ }
  }
  return res;
}

/* À appeler sous verrou, juste après une écriture dans `choix`. */
function refreshChoicesCache() {
  return buildAndCache().choices;
}

function scriptCache() {
  try { return CacheService.getScriptCache(); } catch (_) { return null; }
}

/* ─── Outils ───────────────────────────────────────────────────────────────── */
function withLock(fn) {
  const lock = LockService.getScriptLock();
  if (!lock.tryLock(LOCK_MS)) return { ok: false, error: "serveur occupé, réessaie dans un instant" };
  try { return fn(); }
  finally { lock.releaseLock(); }
}

function log(at, participant, bloc, course, note, action, prevCourse, prevNote) {
  try {
    const sh = journalSheet();
    sh.appendRow([at, safe(participant), safe(bloc), safe(course), safe(note), safe(action), safe(prevCourse || ""), safe(prevNote || "")]);
  } catch (_) { /* le journal ne doit jamais faire échouer une écriture */ }
}

function journalSheet() {
  const sh = sheet(SHEET_JOURNAL);
  // Journaux créés avant le 24/11/2026 : 6 colonnes → on ajoute les en-têtes « ancienne_* ».
  if (sh.getLastColumn() < JOURNAL_HEADERS.length) {
    sh.getRange(1, 1, 1, JOURNAL_HEADERS.length).setValues([JOURNAL_HEADERS.map(safe)]).setFontWeight("bold");
  }
  return sh;
}

/* Valeur entrante → texte nettoyé (pas encore neutralisé : la validation se fait sur le texte brut). */
function str(v) {
  return String(v == null ? "" : v).trim();
}

/* LE point de passage de toute valeur texte écrite dans le Sheet : une valeur commençant par
   = + - @ serait interprétée comme une formule → préfixe ' (Sheets le masque et le retire à la lecture). */
function safe(v) {
  const s = String(v == null ? "" : v);
  return /^\s*[=+\-@]/.test(s) ? "'" + s : s;
}

function errMsg(err) {
  return String((err && err.message) || err || "erreur").slice(0, 200);
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}

/* ─── Calendrier : jours cochés ────────────────────────────────────────────── */
function calSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_CAL);
  if (!sh) {
    sh = ss.insertSheet(SHEET_CAL);
    sh.getRange(1, 1, 1, CAL_HEADERS.length).setValues([CAL_HEADERS]).setFontWeight("bold");
    sh.setFrozenRows(1);
  }
  return sh;
}

function parseDone(raw) {
  try {
    const v = JSON.parse(String(raw || "{}"));
    return v && typeof v === "object" && !Array.isArray(v) ? v : {};
  } catch (_) { return {}; }
}

function readCal(participant) {
  const sh = calSheet();
  const last = sh.getLastRow();
  if (last < 2) return [];
  return sh.getRange(2, 1, last - 1, CAL_HEADERS.length).getValues()
    .filter(r => String(r[0]) === participant)
    .map(r => ({
      track: String(r[1]),
      scenario: String(r[2]),
      done: parseDone(r[3]),
      updated_at: r[4] instanceof Date ? r[4].toISOString() : String(r[4] || "")
    }));
}

function calPatch(body) {
  const participant = str(body.participant);
  const track = str(body.track);
  const scenario = str(body.scenario);
  if (!isParticipant(participant)) return { ok: false, error: "participant invalide" };
  if (TRACKS_OK.indexOf(track) === -1) return { ok: false, error: "track inconnu" };
  if (SCENARIOS_OK.indexOf(scenario) === -1) return { ok: false, error: "scenario inconnu" };
  const raw = body.set == null ? {} : body.set;
  if (typeof raw !== "object" || Array.isArray(raw)) return { ok: false, error: "set invalide" };
  const keys = Object.keys(raw);
  if (keys.length > CAL_MAX_KEYS_PER_CALL) return { ok: false, error: "trop de jours dans un seul envoi" };
  for (let i = 0; i < keys.length; i++) {
    if (!isCalDay(keys[i])) return { ok: false, error: "date invalide : " + String(keys[i]).slice(0, 20) };
  }

  return withLock(() => {
    const sh = calSheet();
    const last = sh.getLastRow();
    let rowIndex = -1, stored = {};
    if (last >= 2) {
      const rows = sh.getRange(2, 1, last - 1, CAL_HEADERS.length).getValues();
      for (let i = 0; i < rows.length; i++) {
        if (String(rows[i][0]) === participant && String(rows[i][1]) === track && String(rows[i][2]) === scenario) {
          rowIndex = i + 2; stored = parseDone(rows[i][3]); break;
        }
      }
    }
    // On ne garde que des vrais jours du programme (purge d'éventuelles clés anciennes invalides).
    const done = {};
    Object.keys(stored).forEach(k => { if (isCalDay(k)) done[k] = stored[k] === true; });
    let plus = 0, minus = 0;
    keys.forEach(k => {
      const v = raw[k] === true;
      if (done[k] !== v) { if (v) plus++; else minus++; }
      done[k] = v;
    });
    if (Object.keys(done).length > CAL_MAX_DAYS) return { ok: false, error: "trop de jours enregistrés" };
    const now = new Date();
    const values = [[safe(participant), safe(track), safe(scenario), safe(JSON.stringify(done)), now]];
    if (rowIndex > 0) sh.getRange(rowIndex, 1, 1, CAL_HEADERS.length).setValues(values);
    else sh.appendRow(values[0]);
    if (plus || minus) logCal(now, participant, track + "/" + scenario, plus, minus);
    return { ok: true, done: done, updated_at: now.toISOString() };
  });
}

/* Une ligne « calendrier » par série de clics : si la dernière ligne du journal est un patch du
   même participant sur le même calendrier depuis moins de 30 min, on cumule dedans. */
function logCal(now, participant, which, plus, minus) {
  try {
    const sh = journalSheet();
    const last = sh.getLastRow();
    if (last >= 2) {
      const r = sh.getRange(last, 1, 1, 6).getValues()[0];
      const at = r[0] instanceof Date ? r[0].getTime() : NaN;
      const m = /^'?\+(\d+) \/ −(\d+)$/.exec(String(r[4]));
      if (String(r[5]) === "calendrier" && String(r[1]) === participant && String(r[2]) === which && m && now.getTime() - at < CAL_LOG_MERGE_MS) {
        sh.getRange(last, 1).setValue(now);
        sh.getRange(last, 5).setValue(safe("+" + (+m[1] + plus) + " / −" + (+m[2] + minus)));
        return;
      }
    }
    sh.appendRow([now, safe(participant), safe(which), "", safe("+" + plus + " / −" + minus), "calendrier", "", ""]);
  } catch (_) { /* jamais bloquant */ }
}
