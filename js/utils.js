// ตัวช่วยทั่วไป ใช้ร่วมกันทุกหน้า (Shared helpers for every page)

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];

// localStorage wrapper that never throws (private mode, blocked storage, etc.)
const store = {
  get(k, d) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
};

let lang = store.get("fs-lang", "th");
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

/* ---------- Toast ---------- */
let toastId;
function toast(msg) {
  let el = $(".toast");
  if (!el) { el = document.createElement("div"); el.className = "toast"; el.setAttribute("role", "status"); document.body.append(el); }
  el.textContent = msg; el.hidden = false;
  clearTimeout(toastId); toastId = setTimeout(() => { el.hidden = true; }, 2600);
}
const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
