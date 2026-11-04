// เริ่มต้นแอป และสลับภาษา (Start-up and language switch)

/* ---------- Language ---------- */
function applyLang() {
  const t = T[lang];
  document.documentElement.lang = lang;
  $$("[data-i18n]").forEach(el => { el.textContent = t[el.dataset.i18n]; });
  $$("[data-i18n-html]").forEach(el => { el.innerHTML = t[el.dataset.i18nHtml]; });
  $$(".lang button").forEach(b => b.classList.toggle("on", b.dataset.lang === lang));
  renderChips(); renderPlan(); renderBMI(); drawTimer(); renderAuth(); renderAccount();
}
$$(".lang button").forEach(b => b.onclick = () => { lang = b.dataset.lang; store.set("fs-lang", lang); applyLang(); });

applyLang();
