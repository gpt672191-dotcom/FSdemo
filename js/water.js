// ดื่มน้ำวันนี้: เป้าหมายจากน้ำหนัก (ประมาณ 33 มล. ต่อ กก.) กดแก้วเพื่อบันทึก (Daily water tracker, For-you page)
// เก็บในบัญชีผู้ใช้: user.water = { "2026-11-24": 5 } (จำนวนแก้ว แก้วละ 250 มล.)

const WT = {
  th: { title: "ดื่มน้ำวันนี้", goal: (g, ml) => `เป้าหมาย ${g} แก้ว (ประมาณ ${(ml / 1000).toFixed(1)} ลิตร) คำนวณจากน้ำหนักของคุณ`,
    of: (n, g) => `${n} / ${g} แก้ว`, done: "ครบเป้าแล้ว เยี่ยมมาก", left: n => `อีก ${n} แก้ว`, add: "ดื่มเพิ่ม 1 แก้ว", undo: "ลด 1 แก้ว",
    glass: (i, on) => `แก้วที่ ${i}${on ? " (ดื่มแล้ว)" : ""}`, note: "วันที่ออกกำลังกายหรืออากาศร้อน ควรดื่มเพิ่มอีก 1–2 แก้ว", week: "7 วันล่าสุด" },
  en: { title: "Water today", goal: (g, ml) => `Goal ${g} glasses (about ${(ml / 1000).toFixed(1)} L), based on your weight`,
    of: (n, g) => `${n} / ${g} glasses`, done: "Goal reached, nice work", left: n => `${n} to go`, add: "Add a glass", undo: "Remove a glass",
    glass: (i, on) => `Glass ${i}${on ? " (done)" : ""}`, note: "On workout days or hot days, drink 1–2 extra glasses.", week: "Last 7 days" }
};
const wt = () => WT[lang];
const GLASS = 250;
const dayStr = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

function waterGoal(u) { const w = (u.profile && u.profile.weight) || 60; return Math.min(16, Math.max(6, Math.round(w * 33 / GLASS))); }
function setWater(n) {
  updateUser(u => { const g = waterGoal(u); u.water = { ...(u.water || {}), [dayStr()]: Math.max(0, Math.min(g + 4, n)) };
    // keep about two months
    const keys = Object.keys(u.water).sort(); while (keys.length > 60) delete u.water[keys.shift()]; });
  renderWater();
}

function renderWater() {
  const box = $("#fyWater"), u = currentUser();
  if (!box || !u || !hasBody(u.profile)) return;
  const tx = wt(), g = waterGoal(u), n = (u.water || {})[dayStr()] || 0, pc = Math.min(100, Math.round(n / g * 100));
  const glasses = [...Array(Math.max(g, n))].map((_, i) =>
    `<button type="button" class="wt-glass${i < n ? " on" : ""}${i >= g ? " extra" : ""}" data-i="${i}" aria-label="${tx.glass(i + 1, i < n)}" aria-pressed="${i < n}">${icon("droplet")}</button>`).join("");
  const vals = [];
  const week = [...Array(7)].map((_, k) => { const d = new Date(); d.setDate(d.getDate() - (6 - k)); const v = (u.water || {})[dayStr(d)] || 0;
    vals.push(v);
    return `<div class="wt-day${v >= g ? " ok" : ""}" title="${dayStr(d)}: ${v}"><i style="height:${Math.min(100, v / g * 100)}%"></i><small>${d.toLocaleDateString(lang === "th" ? "th-TH" : "en-GB", { weekday: "narrow" })}</small></div>`; }).join("");
  box.innerHTML = `
    <h2 class="panel-title">${icon("droplet")} ${tx.title}</h2>
    <p class="wt-goal">${tx.goal(g, g * GLASS)}</p>
    <div class="wt-top">
      <div class="wt-count"><b>${tx.of(n, g)}</b><span>${n >= g ? tx.done : tx.left(g - n)}</span></div>
      <div class="wt-btns">
        <button type="button" class="btn ghost sm" data-wt="-1" aria-label="${tx.undo}"${n ? "" : " disabled"}>−</button>
        <button type="button" class="btn sm" data-wt="1">${icon("plus")}<span>${tx.add}</span></button>
      </div>
    </div>
    <div class="wt-bar" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pc}"><i style="width:${pc}%"></i></div>
    <div class="wt-glasses">${glasses}</div>
    <div class="wt-week" role="img" aria-label="${tx.week}: ${vals.join(", ")} / ${g}">${week}</div>
    <p class="hint">${tx.note}</p>`;
}
onRender(renderWater);

document.addEventListener("click", e => {
  const box = $("#fyWater"); if (!box || !box.contains(e.target)) return;
  const u = currentUser(); if (!u) return;
  const n = (u.water || {})[dayStr()] || 0;
  const step = e.target.closest("[data-wt]"), gl = e.target.closest(".wt-glass");
  if (step) setWater(n + Number(step.dataset.wt));
  else if (gl) { const i = Number(gl.dataset.i); setWater(i + 1 === n ? i : i + 1); } // tap the last full glass to undo it
});
