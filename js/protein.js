// โปรตีนวันนี้: เป้าหมายจากหน้าแนะนำ (recommend() ใน for-you.js) กดอาหารที่กินเพื่อรวมโปรตีน (Daily protein tracker, For-you page)
// เก็บในบัญชีผู้ใช้: user.protein = { "2026-11-24": { chicken: 1, egg: 2 } }
// ค่าโปรตีน/พลังงานเป็นค่าประมาณต่อ 1 หน่วยบริโภค (อ้างอิงฐานข้อมูลโภชนาการทั่วไป เช่น USDA) ใช้เป็นแนวทางเท่านั้น

const FOODS = [
  { id: "chicken", g: 31, kcal: 165, th: "อกไก่สุก 100 ก.", en: "Chicken breast, cooked 100 g" },
  { id: "egg",     g: 6,  kcal: 72,  th: "ไข่ไก่ 1 ฟอง", en: "1 egg" },
  { id: "milk",    g: 7,  kcal: 120, th: "นมจืด 1 กล่อง (200 มล.)", en: "Milk, 1 carton (200 ml)" },
  { id: "pork",    g: 26, kcal: 145, th: "หมูสันในสุก 100 ก.", en: "Pork tenderloin, cooked 100 g" },
  { id: "fish",    g: 17, kcal: 150, th: "ปลาทู 1 ตัว", en: "1 short mackerel" },
  { id: "tuna",    g: 20, kcal: 90,  th: "ทูน่ากระป๋องในน้ำแร่ 1 กระป๋อง", en: "Tuna in water, 1 can" },
  { id: "tofu",    g: 13, kcal: 120, th: "เต้าหู้แข็ง 100 ก.", en: "Firm tofu 100 g" },
  { id: "beans",   g: 14, kcal: 210, th: "ถั่วเขียวต้ม 1 ถ้วย", en: "Cooked mung beans, 1 cup" },
  { id: "yogurt",  g: 15, kcal: 100, th: "กรีกโยเกิร์ต 1 ถ้วย (150 ก.)", en: "Greek yogurt, 1 cup (150 g)" },
  { id: "whey",    g: 24, kcal: 120, th: "เวย์โปรตีน 1 สกู๊ป", en: "Whey protein, 1 scoop" },
  // common Thai street and convenience-store food (approximate)
  { id: "soymilk", g: 7,  kcal: 120, th: "นมถั่วเหลือง 1 กล่อง (250 มล.)", en: "Soy milk, 1 carton (250 ml)" },
  { id: "shrimp",  g: 20, kcal: 100, th: "กุ้งสุก 100 ก.", en: "Cooked shrimp 100 g" },
  { id: "kmk",     g: 25, kcal: 600, th: "ข้าวมันไก่ 1 จาน", en: "Khao man gai (chicken rice), 1 plate" },
  { id: "mooping", g: 6,  kcal: 90,  th: "หมูปิ้ง 1 ไม้", en: "Moo ping (grilled pork), 1 stick" },
  { id: "kaprao",  g: 22, kcal: 550, th: "ข้าวกะเพราไก่ 1 จาน (ไม่มีไข่)", en: "Basil chicken on rice, 1 plate (no egg)" },
  { id: "sousvide", g: 22, kcal: 110, th: "อกไก่นุ่มพร้อมทาน 1 ซอง", en: "Ready-to-eat chicken breast, 1 pack" }
];
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
