/* ────────────────────────────────────────────────────────────────────────────
   « Qui court où ? » — team 0 to 100 / 0 to 40
   Front vanilla. Les choix vivent dans un Google Sheet via Apps Script
   (API_URL dans config.js). Sans API_URL → mode démo (localStorage).
   ──────────────────────────────────────────────────────────────────────────── */

const APP_VERSION = "1.4.0";
/* Identité partagée avec le calendrier et la carte (même origine → même localStorage) */
const LS_ME      = "team_me";
const LS_ME_OLD  = "qco_me";
const LS_FILTER  = "qco_filter";
const LS_DEMO    = "qco_demo_choices";
const LS_CACHE   = "qco_choices_cache";   // derniers choix connus, pour l'affichage hors ligne

const $  = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

/* ─── État ─────────────────────────────────────────────────────────────────── */
const state = {
  me: null,            // id participant
  filter: "all",       // "all" | "100" | "40"
  choices: [],         // [{ participant, bloc, course, note, updated_at, validated }]
  loading: false,
  saving: null,        // bloc en cours d'enregistrement
  otherOpen: {},       // bloc → true quand le champ « autre course » est ouvert
  guestOpen: false,    // formulaire « je ne suis pas dans la liste » ouvert
  lastSync: null,
  offline: false       // vrai si le dernier chargement a échoué (on affiche le cache)
};

const PARTICIPANTS = (window.PARTICIPANTS || []).slice().sort((a, b) => a.name.localeCompare(b.name, "fr"));
const COURSES = window.COURSES || [];
const byId = Object.fromEntries(PARTICIPANTS.map(p => [p.id, p]));

/* Invités (pas dans le trombinoscope) : id "guest|<100|40>|<Prénom>", même convention que
   le calendrier. On les reconstitue à la volée depuis l'id, sans photo. */
const GUEST_PREFIX = "guest|";
function guestId(group, name) { return GUEST_PREFIX + group + "|" + name.trim(); }
function guestFromId(id) {
  if (typeof id !== "string" || !id.startsWith(GUEST_PREFIX)) return null;
  const [, group, name] = id.split("|");
  if (!name || !["100", "40"].includes(group)) return null;
  return { id, name, group, photo: "", guest: true };
}
function person(id) { return byId[id] || guestFromId(id); }
const courseById = Object.fromEntries(COURSES.map(c => [c.id, c]));
const DEMO = !API_URL;

/* ─── Utils ────────────────────────────────────────────────────────────────── */
function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, ch => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[ch]));
}
function initials(name) {
  return name.split(/[\s-]+/).map(w => w[0]).join("").slice(0, 2).toUpperCase();
}
function photoUrl(p) {
  if (!p.photo) return "";
  return /^https?:/.test(p.photo) ? p.photo : PHOTO_BASE + p.photo;
}
function avatar(p, size = "") {
  const cls = `ava ava--${p.group}${size ? " ava--" + size : ""}`;
  const url = photoUrl(p);
  return url
    ? `<span class="${cls}" title="${esc(p.name)}"><img src="${esc(url)}" alt="${esc(p.name)}" loading="lazy" onerror="this.replaceWith(document.createTextNode('${esc(initials(p.name))}'))" /></span>`
    : `<span class="${cls}" title="${esc(p.name)}">${esc(initials(p.name))}</span>`;
}
function fmtKm(v) { return typeof v === "number" ? String(v).replace(".", ",") + " km" : v; }
function fmtDplus(v) { return typeof v === "number" ? v.toLocaleString("fr-FR") + " m D+" : v; }
/* Ligne « inscriptions » d'une course : ouverture datée (avec J-n), déjà ouvertes, ou note libre */
function signupInfo(course) {
  const sg = course.signup;
  if (!sg) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  if (sg.open) {
    const d = new Date(sg.open + "T00:00:00");
    const days = Math.round((d - today) / 86400000);
    const when = d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
    if (days > 0) return { cls: days <= 21 ? "soon" : "", text: `Inscriptions : ouverture ${when} · J-${days}`, note: sg.note };
    if (days === 0) return { cls: "soon", text: "Inscriptions : ouverture AUJOURD'HUI", note: sg.note };
    return { cls: "open", text: `Inscriptions ouvertes depuis le ${when}`, note: sg.note };
  }
  if (sg.status === "open") return { cls: "open", text: "Inscriptions ouvertes", note: sg.note };
  return { cls: "", text: sg.note || "", note: null };
}

function fmtDay(iso) {
  const d = new Date(iso + "T12:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "numeric", month: "short" });
}
function normalize(s) {
  return String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
}
function toast(msg, kind = "") {
  const t = $("#toast");
  t.textContent = msg;
  t.className = "toast" + (kind ? " toast--" + kind : "");
  t.hidden = false;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { t.hidden = true; }, 2600);
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
    .map(c => person(c.participant)).filter(Boolean)
    .filter(isVisible)
    .sort((a, b) => a.name.localeCompare(b.name, "fr"));
}
function undecided(blocId) {
  return PARTICIPANTS.filter(p => isVisible(p) && !choiceOf(p.id, blocId));
}

/* ─── Backend ──────────────────────────────────────────────────────────────── */
async function loadChoices({ silent = false } = {}) {
  if (DEMO) {
    try { state.choices = JSON.parse(localStorage.getItem(LS_DEMO) || "[]"); } catch { state.choices = []; }
    state.lastSync = new Date();
    return;
  }
  state.loading = !silent;
  if (!silent) render();
  try {
    const res = await fetch(API_URL, { cache: "no-store" });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "réponse invalide");
    state.choices = data.choices || [];
    state.lastSync = new Date();
    state.offline = false;
    try { localStorage.setItem(LS_CACHE, JSON.stringify({ at: Date.now(), choices: state.choices })); } catch { /* plein */ }
  } catch (err) {
    console.error(err);
    state.offline = true;
    try {
      const cached = JSON.parse(localStorage.getItem(LS_CACHE) || "null");
      if (cached && Array.isArray(cached.choices)) { state.choices = cached.choices; state.lastSync = new Date(cached.at); }
    } catch { /* pas de cache */ }
    if (!silent) toast("Connexion impossible — affichage des derniers choix connus.", "err");
  } finally {
    state.loading = false;
  }
}

async function saveChoice(blocId, courseId, note = "") {
  if (!state.me) return;
  const payload = { participant: state.me, bloc: blocId, course: courseId || "", note: note || "" };

  // Optimiste : on applique tout de suite, on confirmera avec la réponse serveur.
  const before = state.choices;
  state.choices = before.filter(c => !(c.participant === state.me && c.bloc === blocId));
  if (courseId) state.choices.push({ ...payload, updated_at: new Date().toISOString(), validated: "" });
  state.saving = blocId;
  state.otherOpen[blocId] = false;
  render();

  if (DEMO) {
    localStorage.setItem(LS_DEMO, JSON.stringify(state.choices));
    state.saving = null;
    render();
    toast(courseId ? "C'est noté (mode démo, sur ce téléphone seulement)." : "Choix retiré.");
    return;
  }

  try {
    // Pas d'en-tête Content-Type → pas de preflight CORS (Apps Script ne gère pas OPTIONS).
    const res = await fetch(API_URL, { method: "POST", body: JSON.stringify(payload) });
    const data = await res.json();
    if (!data.ok) throw new Error(data.error || "échec enregistrement");
    if (Array.isArray(data.choices)) state.choices = data.choices;
    toast(courseId ? "C'est noté, tout le monde le voit." : "Choix retiré.");
  } catch (err) {
    console.error(err);
    state.choices = before;
    toast("Enregistrement impossible — réessaie.", "err");
  } finally {
    state.saving = null;
    render();
  }
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
    return `<a class="mchip ${cls}" href="#bloc-${b.id}"><span class="mchip-bloc">${b.emoji} ${esc(b.label)}</span><span class="mchip-course">${esc(label)}</span></a>`;
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
    <div class="runner-names">${people.map(p => esc(p.name)).join(", ")}</div>
  </div>`;
}

function courseCard(course, blocId, meChoice) {
  const runners = runnersOn(blocId, course.id);
  const isMine = meChoice && meChoice.course === course.id;
  const q = encodeURIComponent(`${course.name} trail 2027`);
  const link = course.url
    ? `<a class="clink" href="${esc(course.url)}" target="_blank" rel="noopener">site ↗</a>`
    : `<a class="clink clink--soft" href="https://www.google.com/search?q=${q}" target="_blank" rel="noopener">chercher ↗</a>`;
  const trackDots = course.tracks.map(t => `<i class="dot dot--${t}" title="0 to ${t}"></i>`).join("");
  const sg = signupInfo(course);
  const signupLine = sg && sg.text
    ? `<div class="csignup csignup--${sg.cls}" ${sg.note ? `title="${esc(sg.note)}"` : ""}>📝 ${esc(sg.text)}${sg.note && sg.cls ? ` <span class="csignup-note">— ${esc(sg.note)}</span>` : ""}</div>`
    : "";
  const day = course.date ? `<span class="cday">${esc(fmtDay(course.date))}</span>` : "";
  // Bouton uniquement si la course est autorisée pour MON parcours
  const me = state.me && person(state.me);
  const allowed = me && course.tracks.includes(me.group);
  const action = allowed ? (isMine
    ? `<button class="btn btn--on" data-act="clear" data-bloc="${blocId}" ${state.saving === blocId ? "disabled" : ""}>J'y vais ✓</button>`
    : `<button class="btn" data-act="pick" data-bloc="${blocId}" data-course="${esc(course.id)}" ${state.saving === blocId ? "disabled" : ""}>J'y vais</button>`) : "";
  return `<article class="course ${isMine ? "course--mine" : ""} ${runners.length ? "course--busy" : ""}" id="course-${esc(course.id)}">
    <div class="course-main">
      <div class="course-title">${trackDots}<span class="cname">${esc(course.name)}</span>${course.dept ? `<span class="cdept">${esc(course.dept)}</span>` : ""}</div>
      <div class="course-meta">${day}<span>${esc(fmtKm(course.km))}</span><span>·</span><span>${esc(fmtDplus(course.dplus))}</span><span>·</span>${link}</div>
      ${signupLine}
      ${avatarsRow(runners)}
      ${!runners.length ? `<div class="runner-names runner-names--none">personne pour l'instant</div>` : ""}
    </div>
    <div class="course-side">${action}</div>
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
      ? `<button class="btn btn--on" data-act="clear" data-bloc="${bloc.id}">J'y vais ✓</button>`
      : `<button class="btn" data-act="pick" data-bloc="${bloc.id}" data-course="${OTHER_COURSE}" data-note="${esc(g.note)}">J'y vais</button>`) : "";
    cards.push(`<article class="course course--other ${isMine ? "course--mine" : ""}">
      <div class="course-main">
        <div class="course-title"><span class="cname">${esc(g.note)}</span>${validated ? `<span class="cvalid">✓ validée par le staff</span>` : `<span class="cdept cdept--warn">hors liste · à valider</span>`}</div>
        ${avatarsRow(g.people.sort((a, b) => a.name.localeCompare(b.name, "fr")))}
      </div>
      <div class="course-side">${action}</div>
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
    <input type="text" name="note" maxlength="80" placeholder="Nom de la course (+ département)" value="${esc(val)}" required autocomplete="off" />
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

    const weekends = bloc.weekends.map(we => {
      const list = courses.filter(c => c.weekend === we.id);
      if (!list.length) return "";
      return `<div class="weekend"><h3 class="we-title">${esc(we.label)}</h3>${list.map(c => courseCard(c, bloc.id, meChoice)).join("")}</div>`;
    }).join("");

    const empty = !courses.length
      ? `<p class="empty">${state.filter === "40" ? "La liste 0 to 40 arrive — le staff la communique cette semaine." : "Aucune course dans ce bloc."}</p>`
      : "";

    const meClear = meChoice ? `<button class="btn btn--ghost btn--sm" data-act="clear" data-bloc="${bloc.id}">Je ne sais plus / retirer mon choix</button>` : "";

    return `<section class="card bloc" id="bloc-${bloc.id}">
      <header class="bloc-head">
        <div>
          <h2 class="bloc-title">${bloc.emoji} ${esc(bloc.label)}</h2>
          <div class="bloc-dates">${bloc.weekends.map(w => esc(w.label)).join(" · ")}</div>
        </div>
        <div class="bloc-km">${kmLabel}</div>
      </header>
      <div class="bloc-stat">${chosen} inscrit${chosen > 1 ? "s" : ""} · ${pending.length} sans choix</div>
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
  if (DEMO) {
    b.hidden = false;
    b.textContent = "Mode démo : les choix ne sont enregistrés que sur ce téléphone (backend pas encore branché).";
  } else {
    b.hidden = true;
  }
}

function render() {
  renderMeSummary();
  renderBlocs();
  renderCount();
  renderBanner();
  $$(".seg").forEach(s => s.classList.toggle("is-active", s.dataset.filter === state.filter));
}

/* ─── Événements ───────────────────────────────────────────────────────────── */
function bind() {
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
    state.otherOpen = {};
    render();
  });

  $("#guest-form")?.addEventListener("submit", e => {
    e.preventDefault();
    const f = e.target;
    const name = f.name.value.trim().replace(/\|/g, " ").slice(0, 30);
    const group = f.group.value;
    if (!name || !["100", "40"].includes(group)) return;
    state.me = guestId(group, name);
    localStorage.setItem(LS_ME, state.me);
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
    else if (act === "other-open") { state.otherOpen[bloc] = true; render(); $(`.other-form[data-bloc="${bloc}"] input`)?.focus(); }
    else if (act === "other-close") { state.otherOpen[bloc] = false; render(); }
  });

  $("#blocs").addEventListener("submit", e => {
    const form = e.target.closest(".other-form");
    if (!form) return;
    e.preventDefault();
    const note = form.note.value.trim();
    if (!note) return;
    saveChoice(form.dataset.bloc, OTHER_COURSE, note);
  });

  // Rafraîchissement : au retour sur l'onglet + périodique quand visible
  document.addEventListener("visibilitychange", async () => {
    if (document.visibilityState === "visible") { await loadChoices({ silent: true }); render(); }
  });
  setInterval(async () => {
    if (document.visibilityState === "visible" && !state.saving) { await loadChoices({ silent: true }); render(); }
  }, REFRESH_MS);
}

/* ─── Init ─────────────────────────────────────────────────────────────────── */
(async function init() {
  state.me = localStorage.getItem(LS_ME) || localStorage.getItem(LS_ME_OLD) || null;
  if (state.me && !person(state.me)) state.me = null;
  if (state.me) { localStorage.setItem(LS_ME, state.me); localStorage.removeItem(LS_ME_OLD); }
  state.filter = localStorage.getItem(LS_FILTER) || "all";
  if (!["all", "100", "40"].includes(state.filter)) state.filter = "all";
  $("#version").textContent = `v${APP_VERSION}`;
  renderMeSelect();
  bind();
  render();
  await loadChoices();
  render();
})();
