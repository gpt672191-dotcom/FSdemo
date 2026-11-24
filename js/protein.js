// โปรตีนวันนี้: เป้าหมายจากหน้าแนะนำ (recommend() ใน for-you.js) กดอาหารที่กินเพื่อรวมโปรตีน (Daily protein tracker, For-you page)
// เก็บในบัญชีผู้ใช้: user.protein = { "2026-11-24": { chicken: 1, egg: 2 } }
// ค่าโปรตีน/พลังงานเป็นค่าประมาณต่อ 1 หน่วยบริโภค (อ้างอิงฐานข้อมูลโภชนาการทั่วไป เช่น USDA) ใช้เป็นแนวทางเท่านั้น

// FOODS (the food list) lives in js/data.js, so the coach and data import can use it on every page
const PR_T = {
  th: { title: "โปรตีนวันนี้", goal: (a, b) => `เป้าหมาย ${a}–${b} กรัมต่อวัน (จากน้ำหนักและเป้าหมายของคุณ)`, total: g => `${g} กรัม`, kcal: k => `ประมาณ ${k} kcal จากรายการนี้`,
    left: n => `อีก ${n} กรัมถึงเป้าขั้นต่ำ`, done: "ถึงเป้าแล้ว ดีมาก", add: n => `เพิ่ม ${n}`, remove: n => `ลด ${n}`, reset: "ล้างของวันนี้",
    note: "ตัวเลขเป็นค่าประมาณ แบ่งกินโปรตีนให้ครบทุกมื้อดีกว่ากินมื้อเดียวเยอะๆ" },
  en: { title: "Protein today", goal: (a, b) => `Goal ${a}–${b} g a day (from your weight and goal)`, total: g => `${g} g`, kcal: k => `About ${k} kcal from these foods`,
    left: n => `${n} g to reach the low end`, done: "Goal reached, nice", add: n => `Add ${n}`, remove: n => `Remove ${n}`, reset: "Clear today",
    note: "Numbers are estimates. Spreading protein over every meal works better than one big serving." }
};
const prt = () => PR_T[lang];
const prDay = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function setFood(id, delta) {
  updateUser(u => {
    const day = { ...((u.protein || {})[prDay()] || {}) };
    day[id] = Math.max(0, Math.min(20, (day[id] || 0) + delta));
    if (!day[id]) delete day[id];
    u.protein = { ...(u.protein || {}), [prDay()]: day };
    const keys = Object.keys(u.protein).sort(); while (keys.length > 60) delete u.protein[keys.shift()];
  });
  renderProtein();
}

// phones: show the first foods (plus anything eaten today); the rest behind "show all"
const PR_SHORT = 8;
let prAll = false;
// last 7 days of protein as small bars (same look as the water tracker); full bar = the low end of the goal
function prWeek(u, lo) {
  const all = u.protein || {};
  const days = [...Array(7)].map((_, k) => { const d = new Date(); d.setDate(d.getDate() - (6 - k)); const day = all[prDay(d)] || {};
    return { d, g: FOODS.reduce((a, f) => a + f.g * (day[f.id] || 0), 0) }; });
  if (!days.some(x => x.g)) return "";
  const label = lang === "th" ? "7 วันล่าสุด (กรัม)" : "Last 7 days (g)";
  return `<div class="wt-week pr-week" role="img" aria-label="${label}: ${days.map(x => x.g).join(", ")}">${days.map(x =>
    `<div class="wt-day${x.g >= lo ? " ok" : ""}" title="${prDay(x.d)}: ${x.g} g"><i style="height:${Math.min(100, x.g / lo * 100)}%"></i><small>${x.d.toLocaleDateString(lang === "th" ? "th-TH" : "en-GB", { weekday: "narrow" })}</small></div>`).join("")}</div>`;
}
function renderProtein() {
  const box = $("#fyProtein"), u = currentUser();
  if (!box || !u || !hasBody(u.profile) || typeof recommend !== "function") return;
  const tx = prt(), [lo, hi] = recommend(u.profile).protein, day = (u.protein || {})[prDay()] || {};
  const total = FOODS.reduce((a, f) => a + f.g * (day[f.id] || 0), 0), kcal = FOODS.reduce((a, f) => a + f.kcal * (day[f.id] || 0), 0);
  const pc = Math.min(100, Math.round(total / hi * 100)), loPc = Math.round(lo / hi * 100);
  box.innerHTML = `
    <h2 class="panel-title">${icon("egg")} ${tx.title}</h2>
    <p class="wt-goal">${tx.goal(lo, hi)}</p>
    <div class="wt-top">
      <div class="wt-count"><b>${tx.total(total)}</b><span>${total >= lo ? tx.done : tx.left(lo - total)}${kcal ? " · " + tx.kcal(kcal) : ""}</span></div>
      ${total ? `<button type="button" class="btn ghost sm" data-pr-reset>${tx.reset}</button>` : ""}
    </div>
    <div class="pr-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${hi}" aria-valuenow="${total}" aria-label="${tx.title}">
      <i style="width:${pc}%"></i><span class="pr-lo" style="left:${loPc}%"></span>
    </div>
    <ul class="pr-foods">${FOODS.filter((f, i) => prAll || i < PR_SHORT || day[f.id]).map(f => {
      const n = day[f.id] || 0, name = f[lang];
      return `<li class="pr-food${n ? " on" : ""}">
        <div class="pr-txt"><b>${esc(name)}</b><small>${f.g} g · ${f.kcal} kcal</small></div>
        <div class="pr-ctl">
          <button type="button" data-pr="${f.id}" data-d="-1" aria-label="${esc(tx.remove(name))}"${n ? "" : " disabled"}>−</button>
          <span aria-live="polite">${n}</span>
          <button type="button" data-pr="${f.id}" data-d="1" aria-label="${esc(tx.add(name))}">+</button>
        </div>
      </li>`; }).join("")}</ul>
    ${prWeek(u, lo)}
    ${FOODS.length > PR_SHORT ? `<button type="button" class="btn ghost sm pr-more" data-pr-all aria-expanded="${prAll}">${prAll ? (lang === "th" ? "แสดงน้อยลง" : "Show fewer") : (lang === "th" ? `ดูเมนูทั้งหมด (${FOODS.length})` : `Show all foods (${FOODS.length})`)}</button>` : ""}
    <p class="hint">${tx.note}</p>`;
}
onRender(renderProtein);

document.addEventListener("click", e => {
  const box = $("#fyProtein"); if (!box || !box.contains(e.target) || !currentUser()) return;
  const b = e.target.closest("[data-pr]");
  if (b) return setFood(b.dataset.pr, Number(b.dataset.d));
  if (e.target.closest("[data-pr-all]")) { prAll = !prAll; renderProtein(); const m = $("[data-pr-all]"); if (m) m.focus(); return; }
  if (e.target.closest("[data-pr-reset]")) {
    updateUser(u => { if (u.protein) delete u.protein[prDay()]; });
    renderProtein();
  }
});
