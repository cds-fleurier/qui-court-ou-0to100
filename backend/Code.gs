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
 * Déploiement : voir backend/README.md
 */

const SHEET_CHOIX   = "choix";
const SHEET_JOURNAL = "journal";
const HEADERS       = ["participant", "bloc", "course", "note", "updated_at", "validated"];
const BLOCS_OK      = ["noel", "mars", "juin", "juillet"];

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
  return json({ ok: true, choices: readChoices(), generatedAt: new Date().toISOString() });
}

function doPost(e) {
  try {
    const body = JSON.parse((e && e.postData && e.postData.contents) || "{}");
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
