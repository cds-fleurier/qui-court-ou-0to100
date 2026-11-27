/* ────────────────────────────────────────────────────────────────────────────
   « Qui court où ? » — team 0 to 100 / 0 to 40
   Front vanilla. Les choix vivent dans un Google Sheet via Apps Script
   (API_URL dans config.js). Sans API_URL → mode démo (localStorage).
   ──────────────────────────────────────────────────────────────────────────── */

const APP_VERSION = "1.11.1";
/* Identité partagée avec le calendrier et la carte (même origine → même localStorage) */
const LS_ME      = "team_me";
const LS_ME_OLD  = "qco_me";
const LS_GUEST_PENDING = "qco_guest_pending"; // id invité dont les choix restent à reprendre
const LS_FILTER  = "qco_filter";
const LS_DEMO    = "qco_demo_choices";
const LS_CACHE   = "qco_choices_cache";   // derniers choix connus : affichage immédiat + hors ligne
/* Même réponse, même origine : le calendrier (et le hub) la rangent sous cette clé, format { at, choices }.
   On lit la plus récente des deux au démarrage et on écrit les deux après chaque chargement. */
const LS_TEAM_CACHE = "team_choices_cache";
const API_TIMEOUT_MS = 15000;              // au-delà, la requête est abandonnée (boutons jamais bloqués)
const UNDO_MS = 6000;                      // durée du toast « Annuler »
const NOTE_MAX = 80;                       // « autre course » : même limite que le script (MAX_NOTE)

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ─── État ─────────────────────────────────────────────────────────────────── */
const state = {
  me: null,            // id participant
  filter: "all",       // "all" | "100" | "40"
  choices: [],         // ce qu'on affiche = server + écritures en cours (pending)
  server: [],          // dernier état connu du Sheet [{ participant, bloc, course, note, updated_at, validated, dossard }]
  pending: new Map(),  // "participant\nbloc" → { entry|null, seq } : écritures parties, pas encore confirmées
  seq: 0,              // numéro de chaque requête, dans l'ordre d'envoi
  appliedSeq: 0,       // numéro de la réponse qui a produit `server` (une plus ancienne ne l'écrase pas)
  lastWriteSeq: 0,     // numéro du dernier POST (un GET parti avant lui est périmé)
  dossardOk: false,    // le script du Sheet gère « dossard acheté » (features du GET) — sinon pas de bouton
  loading: false,
  otherOpen: {},       // bloc → true quand le champ « autre course » est ouvert
  guestOpen: false,    // formulaire « je ne suis pas dans la liste » ouvert
  lastSync: null,
  offline: false,      // vrai si le dernier chargement a échoué (on affiche le cache)
  infoOpen: new Set()  // cartes dont l'accordéon « infos » est ouvert (survit aux rafraîchissements)
};

const PARTICIPANTS = (window.PARTICIPANTS || []).slice().sort((a, b) => a.name.localeCompare(b.name, "fr"));
const COURSES = window.COURSES || [];
const byId = Object.fromEntries(PARTICIPANTS.map(p => [p.id, p]));

/* Invités (pas dans le trombinoscope) : id "guest|<100|40>|<Prénom>", même convention que
   le calendrier. On les reconstitue à la volée depuis l'id, sans photo. */
const GUEST_PREFIX = "guest|";
/* Prénom d'invité : pas de « | » (séparateur) ni de = + - @ en tête (refusés par le script). */
const GUEST_NAME_MAX = 30;
function cleanGuestName(name) { return String(name || "").replace(/\|/g, " ").trim().replace(/^[=+\-@\s]+/, "").slice(0, GUEST_NAME_MAX).trim(); }
function guestId(group, name) { return GUEST_PREFIX + group + "|" + cleanGuestName(name); }
function guestFromId(id) {
  if (typeof id !== "string" || !id.startsWith(GUEST_PREFIX)) return null;
  const [, group, name] = id.split("|");
  if (!name || !["100", "40"].includes(group)) return null;
  return { id, name, group, photo: "", guest: true };
}
function person(id) { return byId[id] || guestFromId(id); }
/* Invité ajouté depuis au trombinoscope : même groupe + même prénom exact (casse et accents
   ignorés) → son vrai id. Pas de rapprochement sur le premier mot : un invité « Julien »
   n'est pas forcément « Julien C ». Même règle que le calendrier. */
function rosterMatchForGuest(id) {
  const g = guestFromId(id);
  if (!g) return null;
  const n = normalize(g.name);
  const pool = PARTICIPANTS.filter(p => p.group === g.group);
  const exact = pool.filter(p => normalize(p.name) === n);
  return exact.length === 1 ? exact[0] : null;
}
const courseById = Object.fromEntries(COURSES.map(c => [c.id, c]));
const DEMO = !API_URL;

/* ─── Utils ────────────────────────────────────────────────────────────────── */
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}
function initials(name) {
  return name.split(/[\s-]+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
}
/* Miniature 320 px générée côté carte (assets/photos/thumb/<nom>.jpeg) — 25 Ko au lieu de 2 Mo */
function photoUrl(p) {
  if (!p.photo) return "";
  if (/^https?:/.test(p.photo)) return p.photo;
  return PHOTO_BASE + p.photo.replace(/^(.*\/)([^/]+)\.[a-z]+$/i, "$1thumb/$2.jpeg");
}
function avatar(p, size = "") {
  const cls = `ava ava--${p.group}${size ? " ava--" + size : ""}`;
  const url = photoUrl(p);
  const ini = esc(initials(p.name));
  // Photo introuvable → initiales (data-initials), via l'écouteur « error » global de bind()
  return url
    ? `<span class="${cls}" title="${esc(p.name)}" data-initials="${ini}"><img src="${esc(url)}" alt="${esc(p.name)}" loading="lazy" /></span>`
    : `<span class="${cls}" title="${esc(p.name)}">${ini}</span>`;
}
function fmtKm(v) { return typeof v === "number" ? String(v).replace(".", ",") + " km" : v; }
function fmtDplus(v) { return typeof v === "number" ? v.toLocaleString("fr-FR") + " m D+" : (v || "D+ à préciser"); }
/* Pastille « inscriptions » d'une course : un libellé court et le même vocabulaire partout.
   Le détail (tarifs, plateforme, remarques) est dans sg.note, affiché dans l'accordéon. */
function signupInfo(course) {
  const sg = course.signup || {};
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const day = iso => new Date(iso + "T00:00:00");
  const fmt = d => d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  if (sg.close && day(sg.close) < today) {
    return sg.waitlist ? { cls: "wait", text: "Liste d'attente" } : { cls: "closed", text: "Closes" };
  }
  if (sg.status === "full") return { cls: "full", text: "Complet" };
  if (sg.status === "waitlist") return { cls: "wait", text: "Liste d'attente" };
  if (sg.open) {
    const days = Math.round((day(sg.open) - today) / 86400000);
    if (days > 0) return { cls: days <= 21 ? "soon" : "", text: `Ouverture le ${fmt(day(sg.open))} · J-${days}` };
    if (days === 0) return { cls: "soon", text: "Ouverture aujourd'hui" };
  }
  if (sg.open || sg.status === "open") {
    return { cls: "open", text: sg.close ? `Ouvertes jusqu'au ${fmt(day(sg.close))}` : "Ouvertes" };
  }
  if (sg.expect) return { cls: "", text: /^≈/.test(sg.expect) ? `Ouverture ${sg.expect}` : `Inscriptions ${sg.expect}` };
  return { cls: "", text: "Ouverture ?" };
}
/* « Trail Retournacois – 15 km « Casse Patte » » → titre + format sans la distance (déjà dans la ligne km) */
function splitName(name, format) {
  const i = name.indexOf(" – ");
  if (format) return { title: i < 0 ? name : name.slice(0, i), format };
  if (i < 0) return { title: name, format: "" };
  const rest = name.slice(i + 3).replace(/\b\d+(,\d+)? km\b/g, "").replace(/^[\s,–-]+|[\s,–-]+$/g, "").replace(/\s{2,}/g, " ");
  return { title: name.slice(0, i), format: rest };
}

function fmtDay(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}
function normalize(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
/* Toast = seule zone annoncée aux lecteurs d'écran (role=status). `action` : { label, fn } → bouton
   (ex. « Annuler »), affiché plus longtemps. */
function toast(msg, kind = "", action = null) {
  const t = $("#toast");
  const text = document.createElement("span");
  text.textContent = msg;
  t.replaceChildren(text);
  if (action) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "toast-act";
    b.textContent = action.label;
    b.addEventListener("click", () => { clearTimeout(toast._t); t.hidden = true; action.fn(); });
    t.append(b);
  }
  t.className = "toast" + (kind ? " toast--" + kind : "") + (action ? " toast--action" : "");
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; }, action ? UNDO_MS : 2600);
}
function visibleTracks() { return state.filter === "all" ? ["100", "40"] : [state.filter]; }
function isVisible(p) { return state.filter === "all" || p.group === state.filter; }

/* ─── Accès aux choix ──────────────────────────────────────────────────────── */
function choiceOf(participantId, blocId) {
  return state.choices.find(c => c.participant === participantId && c.bloc === blocId) || null;
}
function runnersOn(blocId, courseId, note) {
  const key = normalize(note);
  return state.choices
    .filter(c => c.bloc === blocId && c.course === courseId && (courseId !== OTHER_COURSE || normalize(c.note) === key))
    .map(c => { const p = person(c.participant); return p && { ...p, dossard: hasDossard(c) }; }).filter(Boolean)
    .filter(isVisible)
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
}
function hasDossard(choice) {
  return Boolean(choice) && /^(1|true|oui|x|ok|yes|✓)$/i.test(String(choice.dossard || "").trim());
}
function undecided(blocId) {
  return PARTICIPANTS.filter(p => isVisible(p) && !choiceOf(p.id, blocId));
}

/* ─── Backend ──────────────────────────────────────────────────────────────── */
/* Requête vers le script du Sheet, abandonnée après 15 s. `body` absent → GET.
   Le tout premier GET est lancé dès le <head> par config.js (window.__qcoChoices) : on le reprend. */
async function api(body) {
  if (!body && window.__qcoChoices) {
    const early = window.__qcoChoices;
    window.__qcoChoices = null;
    const data = await early;
    if (!data || !data.ok) throw new Error((data && data.error) || "réponse invalide");
    return data;
  }
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), API_TIMEOUT_MS);
  try {
    // POST sans Content-Type → pas de preflight CORS (Apps Script ne gère pas OPTIONS).
    const opts = body ? { method: "POST", body: JSON.stringify(body), signal: ctrl.signal } : { cache: "no-store", signal: ctrl.signal };
    const res = await fetch(API_URL, opts);
    const data = await res.json();
    if (!data || !data.ok) throw new Error((data && data.error) || "réponse invalide");
    return data;
  } finally {
    clearTimeout(timer);
  }
}

const pendingKey = (participant, blocId) => participant + "\n" + blocId;
function isSaving(blocId) { return Boolean(state.me) && state.pending.has(pendingKey(state.me, blocId)); }

/* Ce qu'on affiche = l'état du Sheet, recouvert par les écritures pas encore confirmées. */
function recompute() {
  const overlay = [...state.pending.values()];
  state.choices = overlay.length
    ? state.server.filter(c => !state.pending.has(pendingKey(c.participant, c.bloc))).concat(overlay.map(p => p.entry).filter(Boolean))
    : state.server;
}

/* Réponse du Sheet. Plus récente que l'état affiché → elle le remplace ; plus ancienne (réponses
   arrivées dans le désordre) → on n'en garde que la ligne qu'elle vient d'écrire. */
function applyServer(choices, seq, own = null) {
  if (seq >= state.appliedSeq) {
    state.server = choices;
    state.appliedSeq = seq;
  } else if (own) {
    const fresh = choices.find(c => c.participant === own.participant && c.bloc === own.bloc);
    state.server = state.server.filter(c => !(c.participant === own.participant && c.bloc === own.bloc)).concat(fresh ? [fresh] : []);
  }
}

function readCache() {
  const read = key => { try { const v = JSON.parse(localStorage.getItem(key) || "null"); return v && Array.isArray(v.choices) ? v : null; } catch { return null; } };
  const own = read(LS_CACHE), team = read(LS_TEAM_CACHE);
  if (own && team) return (team.at || 0) > (own.at || 0) ? { ...team, dossardOk: own.dossardOk } : own;
  return own || team;
}
function writeCache(data) {
  const at = Date.now();
  try { localStorage.setItem(LS_CACHE, JSON.stringify({ at, choices: state.server, dossardOk: state.dossardOk })); } catch { /* plein */ }
  try { localStorage.setItem(LS_TEAM_CACHE, JSON.stringify({ at, choices: data.choices })); } catch { /* plein */ }
}

/* Affichage immédiat des derniers choix connus (cette app, le calendrier ou le hub), avant le réseau. */
function showCache() {
  const cached = readCache();
  if (!cached) return;
  state.server = cached.choices;
  if (typeof cached.dossardOk === "boolean") state.dossardOk = cached.dossardOk;
  else state.dossardOk = cached.choices.some(c => "dossard" in c);
  state.lastSync = cached.at ? new Date(cached.at) : null;
  recompute();
}

async function loadChoices({ silent = false } = {}) {
  if (DEMO) {
    try { state.server = JSON.parse(localStorage.getItem(LS_DEMO) || "[]"); } catch { state.server = []; }
    recompute();
    state.lastSync = new Date();
    return;
  }
  state.loading = !silent;
  if (!silent) render();
  const seq = ++state.seq;
  try {
    const data = await api();
    // Un « J'y vais » est parti pendant ce chargement (ou est en cours) : sa réponse fait foi
    if (state.lastWriteSeq > seq || state.pending.size) return;
    applyServer(Array.isArray(data.choices) ? data.choices : [], seq);
    recompute();
    state.dossardOk = Array.isArray(data.features) && data.features.includes("dossard");
    state.lastSync = new Date();
    state.offline = false;
    writeCache(data);
  } catch (err) {
    console.error(err);
    state.offline = true; // on garde ce qui est affiché (données fraîches précédentes ou cache)
    if (!silent) toast("Connexion impossible — affichage des derniers choix connus.", "err");
  } finally {
    state.loading = false;
  }
}

/* Écriture optimiste : `entry` (ou null = retrait) s'affiche tout de suite, puis la réponse du Sheet
   fait foi. Échec ou délai dépassé → l'écriture en attente disparaît, l'affichage revient seul. */
async function write(participant, blocId, entry, body) {
  const seq = ++state.seq;
  const key = pendingKey(participant, blocId);
  state.lastWriteSeq = seq;
  state.pending.set(key, { entry, seq });
  recompute();
  render();
  if (DEMO) {
    state.pending.delete(key);
    state.server = state.choices;
    recompute();
    try { localStorage.setItem(LS_DEMO, JSON.stringify(state.server)); } catch { /* plein */ }
    render();
    return true;
  }
  let ok = false;
  try {
    const data = await api(body);
    if (Array.isArray(data.choices)) applyServer(data.choices, seq, { participant, bloc: blocId });
    else applyServer(state.server.filter(c => !(c.participant === participant && c.bloc === blocId)).concat(entry ? [entry] : []), seq);
    ok = true;
  } catch (err) {
    console.error(err);
  } finally {
    if (state.pending.get(key)?.seq === seq) state.pending.delete(key);
    recompute();
    render();
  }
  return ok;
}

function snapshotOf(choice) {
  return choice ? { course: choice.course, note: choice.note || "", dossard: hasDossard(choice) } : null;
}

/* `undo` : retirer ou changer un choix propose « Annuler » pendant 6 s (ancien choix + dossard). */
async function saveChoice(blocId, courseId, note = "", { undo = true, dossard = false } = {}) {
  if (!state.me) return false;
  const me = state.me;
  const prev = snapshotOf(choiceOf(me, blocId));
  state.otherOpen[blocId] = false;
  const entry = courseId
    ? { participant: me, bloc: blocId, course: courseId, note: note || "", updated_at: new Date().toISOString(), validated: "", dossard: dossard ? "1" : "" }
    : null;
  const ok = await write(me, blocId, entry, { participant: me, bloc: blocId, course: courseId || "", note: note || "" });
  if (!ok) { toast("Enregistrement impossible — réessaie.", "err"); return false; }
  if (!undo) return true;
  const changed = prev && (!courseId || prev.course !== courseId || prev.note !== (note || ""));
  if (changed) {
    toast(courseId ? "Course changée" : "Choix retiré", "", { label: "Annuler", fn: () => restoreChoice(me, blocId, prev) });
  } else {
    toast(DEMO ? "C'est noté (mode démo, sur ce téléphone seulement)." : "C'est noté, tout le monde le voit.");
  }
  return true;
}

/* « Annuler » : on renvoie l'ancien choix, puis le dossard (le script le remet à zéro à chaque changement). */
async function restoreChoice(me, blocId, prev) {
  if (state.me !== me) return;
  const ok = await saveChoice(blocId, prev.course, prev.note, { undo: false, dossard: prev.dossard });
  if (!ok) return;
  if (prev.dossard && (DEMO || state.dossardOk)) await saveDossard(blocId, true, { quiet: true });
  toast("Choix rétabli.");
}

/* « J'ai mon dossard » : se coche sur SON choix du bloc, visible par toute la team.
   Retombe tout seul si on change de course (côté script). */
async function saveDossard(blocId, value, { quiet = false } = {}) {
  const me = state.me;
  const mine = me && choiceOf(me, blocId);
  if (!mine || (!DEMO && !state.dossardOk)) return false;
  const ok = await write(me, blocId, { ...mine, dossard: value ? "1" : "" }, { type: "dossard", participant: me, bloc: blocId, value });
  if (!ok) toast("Enregistrement impossible — réessaie.", "err");
  else if (!quiet) toast(value ? "🎟️ Dossard noté, bravo !" : "Dossard retiré.");
  return ok;
}

function dossardButton(blocId, choice) {
  if (!choice || (!DEMO && !state.dossardOk)) return "";
  const on = hasDossard(choice);
  return `<button class="btn btn--dossard ${on ? "btn--dossard-on" : ""}" data-act="dossard" data-bloc="${blocId}" data-value="${on ? "0" : "1"}" ${isSaving(blocId) ? "disabled" : ""}>${on ? "🎟️ Dossard ✓" : "🎟️ J'ai mon dossard"}</button>`;
}

/* ─── Rendu ────────────────────────────────────────────────────────────────── */
function renderMeSelect() {
  const sel = $("#me-select");
  const groups = { "100": [], "40": [] };
  PARTICIPANTS.forEach(p => (groups[p.group] || groups["100"]).push(p));
  const guest = guestFromId(state.me);
  sel.innerHTML = `<option value="">— choisis ton prénom —</option>` +
    [["100", "0 to 100"], ["40", "0 to 40"]].map(([g, label]) =>
      `<optgroup label="${label}">` +
      groups[g].map(p => `<option value="${esc(p.id)}">${esc(p.name)}</option>`).join("") +
      `</optgroup>`).join("") +
    (guest ? `<option value="${esc(guest.id)}">${esc(guest.name)} (invité)</option>` : "") +
    `<option value="__other">Je ne suis pas dans la liste…</option>`;
  sel.value = state.me || "";
}

function renderMeSummary() {
  const box = $("#me-summary");
  const hint = $("#me-hint");
  const me = state.me && person(state.me);
  const guestForm = $("#guest-form");
  if (guestForm) guestForm.hidden = !state.guestOpen;
  if (!me) { box.hidden = true; hint.hidden = state.guestOpen; return; }
  hint.hidden = true;
  box.hidden = false;
  const chips = BLOCS.map(b => {
    const c = choiceOf(me.id, b.id);
    let label = "à choisir", cls = "mchip--todo";
    if (c) {
      cls = "mchip--ok";
      label = c.course === OTHER_COURSE ? (c.note || "Autre course") : (courseById[c.course]?.name || c.course);
      if (c.course === OTHER_COURSE) cls += " mchip--other";
    }
    return `<a class="mchip ${cls}" href="#bloc-${b.id}"><span class="mchip-bloc">${b.emoji} ${esc(b.label)}</span><span class="mchip-line"><span class="mchip-course">${esc(label)}</span>${hasDossard(c) ? '<span class="mchip-bib" title="dossard acheté">🎟️</span>' : ""}</span></a>`;
  }).join("");
  const done = BLOCS.filter(b => choiceOf(me.id, b.id)).length;
  box.innerHTML = `
    <div class="me-head">${avatar(me, "lg")}<div><div class="me-name">${esc(me.name)}${me.guest ? ' <span class="chip">invité</span>' : ""}</div><div class="me-track chip chip--${me.group}">0 to ${me.group}</div></div>
      <div class="me-progress">${done}/${BLOCS.length} <small>courses choisies</small></div></div>
    <div class="me-chips">${chips}</div>`;
}

function avatarsRow(people, { max = 8 } = {}) {
  if (!people.length) return "";
  const shown = people.slice(0, max);
  const rest = people.length - shown.length;
  return `<div class="runners">
    <div class="ava-stack">${shown.map(p => avatar(p)).join("")}${rest > 0 ? `<span class="ava ava--more">+${rest}</span>` : ""}</div>
    <div class="runner-names">${people.map(p => esc(p.name) + (p.dossard ? ' <span class="dossard" title="dossard acheté">🎟️</span>' : "")).join(", ")}</div>
  </div>`;
}

function courseCard(course, blocId, meChoice, homonyms = new Set()) {
  const runners = runnersOn(blocId, course.id);
  const isMine = meChoice && meChoice.course === course.id;
  const split = splitName(course.name, course.format);
  const format = split.format;
  // Deux cartes affichées sous le même nom (EcoTrail 22 / 30 km…) : la distance va dans le titre
  // (distance du nom officiel si elle y figure — « EcoTrail 30 km » plutôt que 29,5 — sinon km)
  const named = (course.name.match(/\d+(,\d+)? km/g) || []).pop();
  const title = homonyms.has(split.title) ? `${split.title} ${named || fmtKm(course.km)}` : split.title;
  const trackDots = course.tracks.map(t => `<i class="dot dot--${t}" title="0 to ${t}"></i>`).join("");
  const sg = signupInfo(course);
  const note = course.signup && course.signup.note;
  const q = encodeURIComponent(`${course.name} trail 2027`);
  const link = course.url
    ? `<a class="clink" href="${esc(course.url)}" target="_blank" rel="noopener">${sg.cls === "open" ? "S'inscrire" : "Site de la course"} ↗</a>`
    : `<a class="clink clink--soft" href="https://www.google.com/search?q=${q}" target="_blank" rel="noopener">Chercher la course ↗</a>`;
  const facts = [
    course.date ? `<span class="cday">${esc(fmtDay(course.date))}</span>` : "",
    `<span>${esc(fmtKm(course.km))}</span>`,
    `<span>${esc(fmtDplus(course.dplus))}</span>`
  ].filter(Boolean).join(`<span class="sep">·</span>`);
  // Bouton uniquement si la course est autorisée pour MON parcours
  const me = state.me && person(state.me);
  const allowed = me && course.tracks.includes(me.group);
  const action = allowed ? (isMine
    ? `<button class="btn btn--on" data-act="clear" data-bloc="${blocId}" ${isSaving(blocId) ? "disabled" : ""}>J'y vais ✓</button>${dossardButton(blocId, meChoice)}`
    : `<button class="btn" data-act="pick" data-bloc="${blocId}" data-course="${esc(course.id)}" ${isSaving(blocId) ? "disabled" : ""}>J'y vais</button>`) : "";
  return `<article class="course ${isMine ? "course--mine" : ""} ${runners.length ? "course--busy" : ""}" id="course-${esc(course.id)}" data-key="course-${esc(course.id)}">
    <div class="course-top">
      <div class="course-head">
        <div class="course-title">${trackDots}<span class="cname">${esc(title)}</span>${course.dept ? `<span class="cdept">${esc(course.dept)}</span>` : ""}</div>
        ${format ? `<div class="cformat">${esc(format)}</div>` : ""}
      </div>
      <div class="course-side">${action}</div>
    </div>
    <div class="course-meta">${facts}<span class="pill pill--${sg.cls || "none"}">${esc(sg.text)}</span></div>
    ${avatarsRow(runners)}
    <details class="cinfo" data-course="${esc(course.id)}" ${state.infoOpen.has(course.id) ? "open" : ""}>
      <summary>Infos</summary>
      <div class="cinfo-body">${note ? `<p>${esc(note)}</p>` : ""}<p>${link}</p></div>
    </details>
  </article>`;
}

function otherCards(bloc, meChoice) {
  // Regroupe les « autre course » par nom normalisé
  const groups = new Map();
  state.choices.filter(c => c.bloc === bloc.id && c.course === OTHER_COURSE).forEach(c => {
    const key = normalize(c.note) || "(sans nom)";
    if (!groups.has(key)) groups.set(key, { note: c.note || "Autre course", people: [] });
    const p = person(c.participant);
    if (p && isVisible(p)) groups.get(key).people.push(p);
  });
  const cards = [];
  groups.forEach((g, key) => {
    if (!g.people.length) return;
    const isMine = meChoice && meChoice.course === OTHER_COURSE && normalize(meChoice.note) === key;
    /* Hors liste : « à valider » tant que le staff n'a pas coché la ligne dans le Sheet */
    const validated = isMine && /^(1|true|oui|x|ok|yes|✓)$/i.test(String(meChoice.validated || "").trim());
    const action = state.me ? (isMine
      ? `<button class="btn btn--on" data-act="clear" data-bloc="${bloc.id}" ${isSaving(bloc.id) ? "disabled" : ""}>J'y vais ✓</button>${dossardButton(bloc.id, meChoice)}`
      : `<button class="btn" data-act="pick" data-bloc="${bloc.id}" data-course="${OTHER_COURSE}" data-note="${esc(g.note)}" ${isSaving(bloc.id) ? "disabled" : ""}>J'y vais</button>`) : "";
    cards.push(`<article class="course course--other ${isMine ? "course--mine" : ""}" data-key="other-${esc(bloc.id)}-${esc(key)}">
      <div class="course-top">
        <div class="course-head">
          <div class="course-title"><span class="cname">${esc(g.note)}</span></div>
        </div>
        <div class="course-side">${action}</div>
      </div>
      <div class="course-meta">${validated ? `<span class="pill pill--open">✓ validée par le staff</span>` : `<span class="pill pill--soon">Hors liste · à valider</span>`}</div>
      ${avatarsRow(g.people.sort((a, b) => a.name.localeCompare(b.name, "fr")))}
    </article>`);
  });
  return cards.join("");
}

function otherForm(bloc, meChoice) {
  if (!state.me) return "";
  const open = !!state.otherOpen[bloc.id];
  if (!open) {
    return `<button class="btn btn--ghost btn--wide" data-act="other-open" data-bloc="${bloc.id}">+ Autre course (hors liste, à faire valider)</button>`;
  }
  const val = meChoice && meChoice.course === OTHER_COURSE ? meChoice.note : "";
  return `<form class="other-form" data-bloc="${bloc.id}">
    <input type="text" name="note" maxlength="${NOTE_MAX}" placeholder="Nom de la course (+ département)" value="${esc(val)}" required autocomplete="off" />
    <button class="btn" type="submit">J'y vais</button>
    <button class="btn btn--ghost" type="button" data-act="other-close" data-bloc="${bloc.id}">Annuler</button>
  </form>`;
}

function renderBlocs() {
  const me = state.me && person(state.me);
  const tracks = visibleTracks();
  $("#blocs").innerHTML = BLOCS.map(bloc => {
    const meChoice = me ? choiceOf(me.id, bloc.id) : null;
    const courses = COURSES.filter(c => c.bloc === bloc.id && c.tracks.some(t => tracks.includes(t)));
    const kmLabel = tracks.map(t => `<span class="chip chip--${t}">0 to ${t} · ${esc(bloc.km[t])}</span>`).join("");
    const pending = undecided(bloc.id);
    const chosen = PARTICIPANTS.filter(p => isVisible(p) && choiceOf(p.id, bloc.id)).length;
    const bibs = PARTICIPANTS.filter(p => isVisible(p) && hasDossard(choiceOf(p.id, bloc.id))).length;

    // Homonymes calculés sur tout le bloc, quel que soit le filtre : le titre ne change pas selon la vue
    const titles = COURSES.filter(c => c.bloc === bloc.id).map(c => splitName(c.name, c.format).title);
    const homonyms = new Set(titles.filter((t, i) => titles.indexOf(t) !== i));
    const weekends = bloc.weekends.map(we => {
      const list = courses.filter(c => c.weekend === we.id);
      if (!list.length) return "";
      return `<div class="weekend"><h3 class="we-title">${esc(we.label)}</h3>${list.map(c => courseCard(c, bloc.id, meChoice, homonyms)).join("")}</div>`;
    }).join("");

    const empty = !courses.length
      ? `<p class="empty">Aucune course dans ce bloc.</p>`
      : "";

    const meClear = meChoice ? `<button class="btn btn--ghost btn--sm" data-act="clear" data-bloc="${bloc.id}" ${isSaving(bloc.id) ? "disabled" : ""}>Je ne sais plus / retirer mon choix</button>` : "";

    return `<section class="card bloc" id="bloc-${bloc.id}">
      <header class="bloc-head">
        <div>
          <h2 class="bloc-title">${bloc.emoji} ${esc(bloc.label)}</h2>
          <div class="bloc-dates">${bloc.weekends.map(w => esc(w.label)).join(" · ")}</div>
        </div>
        <div class="bloc-km">${kmLabel}</div>
      </header>
      <div class="bloc-stat">${chosen} inscrit${chosen > 1 ? "s" : ""}${bibs ? ` · 🎟️ ${bibs} dossard${bibs > 1 ? "s" : ""}` : ""} · ${pending.length} sans choix</div>
      ${weekends}${empty}
      ${otherCards(bloc, meChoice)}
      <div class="bloc-actions">${otherForm(bloc, meChoice)}${meClear}</div>
      ${pending.length ? `<details class="pending"><summary>Pas encore choisi (${pending.length})</summary>${avatarsRow(pending, { max: 12 })}</details>` : ""}
    </section>`;
  }).join("");
}

function renderCount() {
  const total = PARTICIPANTS.filter(isVisible).length;
  const sync = state.lastSync ? ` · ${state.offline ? "hors ligne, vu à" : "maj"} ${state.lastSync.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : "";
  $("#count").textContent = `${total} coureur${total > 1 ? "s" : ""}${state.loading ? " · chargement…" : sync}`;
}

function renderBanner() {
  const b = $("#banner");
  const msgs = [];
  if (DEMO) msgs.push("Mode démo : les choix ne sont enregistrés que sur ce téléphone (backend pas encore branché).");
  // Le roster vient du site de la carte : s'il n'a pas chargé, pas de prénoms à choisir
  if (!PARTICIPANTS.length) msgs.push("La liste des participants n'a pas pu être chargée. Les courses restent visibles ; recharge la page dans un moment pour choisir ton prénom.");
  b.hidden = !msgs.length;
  b.classList.toggle("banner--neutral", !DEMO && msgs.length > 0);
  b.textContent = msgs.join(" ");
}

/* Le rendu reconstruit les blocs : on remet le focus clavier / VoiceOver sur le même bouton
   (ou, s'il a changé — « J'y vais » → « J'y vais ✓ » —, sur le bouton de la même carte). */
function focusKey() {
  const el = document.activeElement;
  if (!el || !el.closest || !el.closest("#blocs") || el.matches("input, textarea")) return null;
  const card = el.closest("[data-key]");
  return { act: el.dataset.act, bloc: el.dataset.bloc, card: card && card.dataset.key, summary: el.matches("summary") };
}
function restoreFocus(k) {
  if (!k) return;
  const root = (k.card && $(`#blocs [data-key="${CSS.escape(k.card)}"]`)) || (k.bloc && $(`#bloc-${CSS.escape(k.bloc)}`));
  if (!root) return;
  const target = (k.summary && $("summary", root))
    || (k.act && $(`[data-act="${k.act}"]${k.bloc ? `[data-bloc="${CSS.escape(k.bloc)}"]` : ""}`, root))
    || (k.card && $(".course-side [data-act]", root));
  if (!target) return;
  if (target.disabled) lostFocus = k; // bouton grisé pendant l'enregistrement : on réessaie au rendu suivant
  else target.focus({ preventScroll: true });
}
let lostFocus = null;

function render() {
  const k = focusKey() || (document.activeElement === document.body ? lostFocus : null);
  lostFocus = null;
  renderMeSummary();
  renderBlocs();
  renderCount();
  renderBanner();
  $$(".seg").forEach(s => {
    const on = s.dataset.filter === state.filter;
    s.classList.toggle("is-active", on);
    s.setAttribute("aria-pressed", on ? "true" : "false");
  });
  restoreFocus(k);
}

/* ─── Événements ───────────────────────────────────────────────────────────── */
function bind() {
  // Photo d'avatar introuvable → initiales (« error » ne remonte pas → capture)
  document.addEventListener("error", e => {
    const img = e.target;
    if (img && img.tagName === "IMG" && img.parentElement && img.parentElement.dataset.initials !== undefined) {
      img.parentElement.textContent = img.parentElement.dataset.initials;
    }
  }, true);

  $("#me-select").addEventListener("change", e => {
    if (e.target.value === "__other") {
      state.guestOpen = true;
      render();
      $("#guest-form input[name=name]")?.focus();
      return;
    }
    state.guestOpen = false;
    state.me = e.target.value || null;
    if (state.me) localStorage.setItem(LS_ME, state.me); else localStorage.removeItem(LS_ME);
    // On n'affiche d'emblée que les courses de son parcours (le filtre « Tous » reste à un tap)
    const me = state.me && person(state.me);
    if (me) { state.filter = me.group; localStorage.setItem(LS_FILTER, state.filter); }
    state.otherOpen = {};
    render();
  });

  $("#guest-form")?.addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target;
    const name = cleanGuestName(f.name.value);
    const group = f.group.value;
    if (!name || !["100", "40"].includes(group)) return;
    state.me = guestId(group, name);
    localStorage.setItem(LS_ME, state.me);
    state.filter = group; localStorage.setItem(LS_FILTER, state.filter);
    state.guestOpen = false;
    state.otherOpen = {};
    renderMeSelect();
    render();
    toast(`Bienvenue ${name} ! Tes choix sont visibles par toute la team.`);
  });
  $("#guest-cancel")?.addEventListener("click", () => { state.guestOpen = false; renderMeSelect(); render(); });

  $$(".seg").forEach(btn => btn.addEventListener("click", () => {
    state.filter = btn.dataset.filter;
    localStorage.setItem(LS_FILTER, state.filter);
    render();
  }));

  $("#blocs").addEventListener("click", e => {
    const btn = e.target.closest("[data-act]");
    if (!btn) return;
    const { act, bloc, course, note } = btn.dataset;
    if (act === "pick") saveChoice(bloc, course, note || "");
    else if (act === "clear") saveChoice(bloc, "", "");
    else if (act === "dossard") saveDossard(bloc, btn.dataset.value === "1");
    else if (act === "other-open") { state.otherOpen[bloc] = true; render(); $(`.other-form[data-bloc="${bloc}"] input`)?.focus(); }
    else if (act === "other-close") { state.otherOpen[bloc] = false; render(); }
  });

  // L'accordéon « infos » reste ouvert après un rafraîchissement (« toggle » ne remonte pas → capture)
  $("#blocs").addEventListener("toggle", e => {
    const d = e.target;
    if (!d.matches || !d.matches(".cinfo")) return;
    if (d.open) state.infoOpen.add(d.dataset.course); else state.infoOpen.delete(d.dataset.course);
  }, true);

  $("#blocs").addEventListener("submit", e => {
    const form = e.target.closest(".other-form");
    if (!form) return;
    e.preventDefault();
    const note = form.note.value.trim();
    if (!note) return;
    saveChoice(form.dataset.bloc, OTHER_COURSE, note);
  });

  // Rafraîchissement : au retour sur l'onglet + périodique quand visible.
  // Jamais pendant un enregistrement, et on ne redessine pas si quelqu'un est en train de
  // taper dans un formulaire de la page (le rendu reconstruit tout le DOM des blocs).
  function typing() {
    const el = document.activeElement;
    return !!(el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA") && el.closest("#blocs, #guest-form"));
  }
  async function refresh() {
    if (document.visibilityState !== "visible" || state.pending.size) return;
    await loadChoices({ silent: true });
    if (!state.pending.size && !typing()) render();
  }
  document.addEventListener("visibilitychange", refresh);
  setInterval(refresh, REFRESH_MS);
}

/* Reprend les choix faits en invité sous le vrai id (sans écraser un choix déjà fait
   avec le vrai id), puis retire ceux de l'invité. Lancé sur l'appareil de la personne
   après son ajout au trombinoscope ; l'id invité reste en attente jusqu'à la réussite. */
async function migrateGuestChoices(oldId) {
  if (DEMO || state.offline) return;
  const old = state.choices.filter(c => c.participant === oldId && c.course);
  if (!old.length) { localStorage.removeItem(LS_GUEST_PENDING); return; }
  const me = state.me;
  for (const c of old) {
    const taken = state.choices.some(x => x.participant === me && x.bloc === c.bloc && x.course);
    if (!taken) {
      const entry = { participant: me, bloc: c.bloc, course: c.course, note: c.note || "", updated_at: new Date().toISOString(), validated: "", dossard: "" };
      if (!await write(me, c.bloc, entry, { participant: me, bloc: c.bloc, course: c.course, note: c.note || "" })) return; // nouvel essai au prochain chargement
    }
    if (!await write(oldId, c.bloc, null, { participant: oldId, bloc: c.bloc, course: "", note: "" })) return;
  }
  localStorage.removeItem(LS_GUEST_PENDING);
  toast("Tes choix d'invité sont maintenant sous ton prénom.");
}

/* ─── Init ─────────────────────────────────────────────────────────────────── */
(async function init() {
  state.me = localStorage.getItem(LS_ME) || localStorage.getItem(LS_ME_OLD) || null;
  if (state.me && !person(state.me)) state.me = null;
  const upgraded = state.me && rosterMatchForGuest(state.me);
  if (upgraded) { localStorage.setItem(LS_GUEST_PENDING, state.me); state.me = upgraded.id; }
  if (state.me) { localStorage.setItem(LS_ME, state.me); localStorage.removeItem(LS_ME_OLD); }
  state.filter = localStorage.getItem(LS_FILTER) || (state.me && person(state.me)?.group) || "all";
  if (!["all", "100", "40"].includes(state.filter)) state.filter = "all";
  $("#version").textContent = `v${APP_VERSION}`;
  renderMeSelect();
  bind();
  if (!DEMO) showCache(); // derniers choix connus tout de suite, remplacés dès que le Sheet répond
  render();
  await loadChoices();
  const guestPending = localStorage.getItem(LS_GUEST_PENDING);
  if (guestPending && state.me) await migrateGuestChoices(guestPending);
  render();
})();
