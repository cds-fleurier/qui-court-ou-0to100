/**
 * « Qui court où ? » — backend Google Apps Script (Web App)
 * ------------------------------------------------------------------
 * Un Google Sheet, deux onglets :
 *   choix   : état courant, une ligne par (participant, bloc)
 *   journal : historique de toutes les modifications (append only)
 *
 * GET  → { ok, choices:[...], generatedAt }
 * POST → body JSON { participant, bloc, course, note }  (course "" = retirer)
 *        → { ok, choices:[...] }
 *
 * Calendrier 0 to 100 (synchro des jours cochés entre appareils, v2 du 10/10/2026) :
 *   onglet calendrier : une ligne par (participant, track, scenario), done = JSON {"AAAA-MM-JJ": bool}
 * GET  ?cal=<participant>  → { ok, cal:[{ track, scenario, done, updated_at }] }
 * POST { type:"cal", participant, track, scenario, set:{ "AAAA-MM-JJ": bool, … } }
 *        → fusionne `set` dans `done` (seuls les jours envoyés changent) → { ok, done, updated_at }
 *
 * Déploiement : voir backend/README.md
 */

const SHEET_CHOIX   = "choix";
const SHEET_JOURNAL = "journal";
const HEADERS       = ["participant", "bloc", "course", "note", "updated_at", "validated"];
const BLOCS_OK      = ["noel", "mars", "juin", "juillet"];
const SHEET_CAL     = "calendrier";
const CAL_HEADERS   = ["participant", "track", "scenario", "done", "updated_at"];
const TRACKS_OK     = ["0to100", "0to40"];

/* À lancer UNE FOIS depuis l'éditeur (menu Exécuter) : crée les onglets + en-têtes. */
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  [SHEET_CHOIX, SHEET_JOURNAL].forEach(name => {
    let sh = ss.getSheetByName(name);
    if (!sh) sh = ss.insertSheet(name);
    const headers = name === SHEET_JOURNAL ? ["at", "participant", "bloc", "course", "note", "action"] : HEADERS;
    if (sh.getLastRow() === 0) {
      sh.getRange(1, 1, 1, headers.length).setValues([headers]).setFontWeight("bold");
      sh.setFrozenRows(1);
    }
  });
  const first = ss.getSheets()[0];
  if (first.getName() === "Feuille 1" || first.getName() === "Sheet1") ss.deleteSheet(first);
}

function doGet(e) {
  const calFor = e && e.parameter && e.parameter.cal;
  if (calFor) {
    try { return json({ ok: true, cal: readCal(clean(calFor, 60)) }); }
    catch (err) { return json({ ok: false, error: String(err) }); }
  }
  return json({ ok: true, choices: readChoices(), generatedAt: new Date().toISOString() });
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
    if (body.type === "cal") return json(calPatch(body));
    const participant = clean(body.participant, 40);
    const bloc = clean(body.bloc, 20);
    const course = clean(body.course, 80);
    const note = clean(body.note, 120);
    if (!participant || !bloc) return json({ ok: false, error: "participant et bloc requis" });
    if (BLOCS_OK.indexOf(bloc) === -1) return json({ ok: false, error: "bloc inconnu : " + bloc });

    const lock = LockService.getScriptLock();
    lock.waitLock(8000);
    try {
      upsert(participant, bloc, course, note);
    } finally {
      lock.releaseLock();
    }
    return json({ ok: true, choices: readChoices() });
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

/* ─── Données ──────────────────────────────────────────────────────────────── */
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
      validated: r[5] === true ? "1" : String(r[5] || "")
    }));
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

  if (!course) {
    if (rowIndex > 0) sh.deleteRow(rowIndex);
    log(now, participant, bloc, "", "", "retrait");
    return;
  }

  // Le choix change → la validation staff tombe ; même choix → on la garde.
  const same = previous && String(previous[2]) === course && String(previous[3] || "") === note;
  const validated = same ? previous[5] : "";
  const values = [[participant, bloc, course, note, now, validated]];
  if (rowIndex > 0) sh.getRange(rowIndex, 1, 1, HEADERS.length).setValues(values);
  else sh.appendRow(values[0]);
  log(now, participant, bloc, course, note, rowIndex > 0 ? "modif" : "ajout");
}

function log(at, participant, bloc, course, note, action) {
  try { sheet(SHEET_JOURNAL).appendRow([at, participant, bloc, course, note, action]); } catch (_) {}
}

function clean(v, max) {
  return String(v == null ? "" : v).trim().slice(0, max);
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
  try { const v = JSON.parse(String(raw || "{}")); return v && typeof v === "object" ? v : {}; }
  catch (_) { return {}; }
}

function readCal(participant) {
  if (!participant) return [];
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
  const participant = clean(body.participant, 60);
  const track = clean(body.track, 10);
  const scenario = clean(body.scenario, 20);
  if (!participant || !scenario) return { ok: false, error: "participant et scenario requis" };
  if (TRACKS_OK.indexOf(track) === -1) return { ok: false, error: "track inconnu : " + track };
  const set = {};
  let n = 0;
  Object.keys(body.set || {}).forEach(k => {
    if (n < 800 && /^\d{4}-\d{2}-\d{2}$/.test(k)) { set[k] = body.set[k] === true; n++; }
  });

  const lock = LockService.getScriptLock();
  lock.waitLock(8000);
  try {
    const sh = calSheet();
    const last = sh.getLastRow();
    let rowIndex = -1, done = {};
    if (last >= 2) {
      const rows = sh.getRange(2, 1, last - 1, CAL_HEADERS.length).getValues();
      for (let i = 0; i < rows.length; i++) {
        if (String(rows[i][0]) === participant && String(rows[i][1]) === track && String(rows[i][2]) === scenario) {
          rowIndex = i + 2; done = parseDone(rows[i][3]); break;
        }
      }
    }
    Object.keys(set).forEach(k => { done[k] = set[k]; });
    const now = new Date();
    const values = [[participant, track, scenario, JSON.stringify(done), now]];
    if (rowIndex > 0) sh.getRange(rowIndex, 1, 1, CAL_HEADERS.length).setValues(values);
    else sh.appendRow(values[0]);
    return { ok: true, done: done, updated_at: now.toISOString() };
  } finally {
    lock.releaseLock();
  }
}
