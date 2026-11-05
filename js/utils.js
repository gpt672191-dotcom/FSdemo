// ตัวช่วยทั่วไป ใช้ร่วมกันทุกหน้า (Shared helpers for every page)

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// localStorage wrapper that never throws (private mode, blocked storage, etc.)
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

let lang = store.get("fs-lang", "th");

// Display preferences from the Settings page (this browser only): { theme: "auto"|"light"|"dark", motion: true|false }
const prefs = () => store.get("fs-prefs", {});
function applyPrefs() {
  const p = prefs(), r = document.documentElement;
  if (p.theme === "light" || p.theme === "dark") r.dataset.theme = p.theme; else delete r.dataset.theme;
  if (p.motion) r.dataset.motion = "reduce"; else delete r.dataset.motion;
}
applyPrefs();
const t = () => T[lang];

// Each file registers a function that redraws its part of the page.
// renderAll() runs them all — used on start-up, language switch, and login/logout.
const renderers = [];
const onRender = fn => renderers.push(fn);
const renderAll = () => renderers.forEach(fn => fn());

// Fill every [data-i18n] element with text in the current language
onRender(() => {
  document.documentElement.lang = lang;
  $$("[data-i18n]").forEach(el => { el.textContent = t()[el.dataset.i18n]; });
  $$("[data-i18n-html]").forEach(el => { el.innerHTML = t()[el.dataset.i18nHtml]; });
});

// Small deterministic random so the same seed gives the same plan
function rng(seed) {
  return () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
}
function shuffle(arr, rand) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

// Read a number from an input; returns NaN when empty or out of range
function num(id, min, max) {
  const v = parseFloat($("#" + id).value);
  return v >= min && v <= max ? v : NaN;
}

/* ---------- Health formulas (shared by BMI, calculators, profile, for-you) ---------- */
const ACT_FACTORS = [1.2, 1.375, 1.55, 1.725, 1.9]; // activity levels 1–5
const health = {
  bmi: (w, h) => w / ((h / 100) ** 2),
  // Asian cut-offs (WHO Asia-Pacific): 0 under, 1 normal, 2 overweight, 3 obese
  bmiIdx: b => (b < 18.5 ? 0 : b < 23 ? 1 : b < 25 ? 2 : 3),
  ideal: h => [18.5 * (h / 100) ** 2, 22.9 * (h / 100) ** 2],
  // Mifflin-St Jeor
  bmr: (w, h, age, sex) => 10 * w + 6.25 * h - 5 * age + (sex === "f" ? -161 : 5),
  minKcal: sex => (sex === "f" ? 1200 : 1500)
};
const round10 = x => Math.round(x / 10) * 10;

/* ---------- Exercises grouped by equipment ----------
   Tabs: all | none (no equipment) | with (dumbbells + gym machines).
   equipSections(list, mode, card) returns the HTML; card(e) draws one exercise card. */
const EQ_MODES = ["all", "none", "with"];

function equipTabs(mode) {
  const tx = t();
  return `<div class="eq-tabs" role="tablist">${EQ_MODES.map(m =>
    `<button type="button" role="tab" data-eqmode="${m}" aria-selected="${m === mode}" class="${m === mode ? "on" : ""}">${icon(m === "none" ? "user" : m === "with" ? "dumbbell" : "grid")}${tx[`eqTab_${m}`]}</button>`
  ).join("")}</div>`;
}

function equipSections(list, mode, card) {
  const tx = t();
  const by = eq => list.filter(e => e.eq === eq);
  const none = by("none"), db = by("db"), gym = by("gym");
  const grid = items => `<div class="ex-grid">${items.map(card).join("")}</div>`;
  const sub = (key, items) => items.length
    ? `<div class="eq-sub"><h4>${tx[`sec_${key}`]} <small>${tx.mgCount(items.length)}</small></h4>${grid(items)}</div>` : "";
  const block = (key, count, body) => `
    <section class="eq-cat eq-${key}">
      <div class="eq-cat-head">
        <span class="eq-cat-ico">${icon(key === "none" ? "user" : "dumbbell")}</span>
        <div><h3>${tx[`sec_${key}`]} <span class="eq-count">${tx.mgCount(count)}</span></h3><p>${tx[`secD_${key}`]}</p></div>
      </div>
      ${body}
    </section>`;

  let html = "";
  if (mode !== "with" && none.length) html += block("none", none.length, grid(none));
  if (mode !== "none" && db.length + gym.length) html += block("with", db.length + gym.length, sub("db", db) + sub("gym", gym));
  return html || `<div class="empty">${tx.mgNone}</div>`;
}

/* ---------- Toast ---------- */
let toastId;
function toast(msg) {
  let el = $(".toast");
  if (!el) { el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status"); document.body.append(el); }
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastId); toastId = setTimeout(() => { el.hidden = true; }, 2600);
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
