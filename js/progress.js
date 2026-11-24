// ติดตามความคืบหน้า: บันทึกการออกกำลังกาย วันต่อเนื่อง ปฏิทิน และกราฟน้ำหนัก (Progress tracking)
// ข้อมูลเก็บในบัญชีผู้ใช้ (แบบจำลอง ในเบราว์เซอร์นี้):
//   user.log     = [{ d: "2026-11-09", t: "อก", sets: 15, mins: 22 }]
//   user.weights = [{ d: "2026-11-09", w: 70.5 }]

const PG_T = {
  th: { title: "ความคืบหน้า", streak: "วันต่อเนื่อง", total: "ออกกำลังกายทั้งหมด", week: "สัปดาห์นี้", mins: "นาทีรวม",
    times: "ครั้ง", days: "วัน", cal: "12 สัปดาห์ล่าสุด", less: "น้อย", more: "มาก", recent: "ล่าสุด", none: "ยังไม่มีบันทึก เริ่มออกกำลังกายด้วยโหมดนำออกกำลังกาย แล้วระบบจะบันทึกให้อัตโนมัติ",
    wTitle: "น้ำหนัก", wAdd: "บันทึก", wPh: "น้ำหนักวันนี้ (กก.)", wNone: "บันทึกน้ำหนักสัปดาห์ละครั้ง เพื่อดูแนวโน้ม", wChange: d => `${d > 0 ? "+" : ""}${d.toFixed(1)} กก. จากครั้งแรก`,
    wSaved: "บันทึกน้ำหนักแล้ว", wErr: "กรอกน้ำหนัก 25–250 กก.",
    logged: "บันทึกลงความคืบหน้าแล้ว", loginToLog: "เข้าสู่ระบบเพื่อบันทึกความคืบหน้า",
    hello: n => `สวัสดี ${n}`, helloSub: (s, w) => s ? `ต่อเนื่อง ${s} วัน · สัปดาห์นี้ ${w} ครั้ง` : (w ? `สัปดาห์นี้ ${w} ครั้ง` : "วันนี้เริ่มออกกำลังกายกันเลย!"),
    goPlan: "ไปที่แผนของฉัน", goProgress: "ดูความคืบหน้า", mins2: n => `${n} นาที`,
    badges: "เหรียญรางวัล", badgesSub: (a, b) => `ได้แล้ว ${a} จาก ${b} เหรียญ`, got: "ได้แล้ว",
    b_first: ["ก้าวแรก", "ออกกำลังกายครั้งแรก"], b_streak3: ["ติดต่อ 3 วัน", "ออกกำลังกาย 3 วันติด"], b_streak7: ["ครบสัปดาห์", "ออกกำลังกาย 7 วันติด"],
    b_ten: ["ขยันสิบครั้ง", "ออกกำลังกายครบ 10 ครั้ง"], b_thirty: ["นักสู้", "ออกกำลังกายครบ 30 ครั้ง"], b_mins: ["300 นาที", "รวมเวลาออกกำลังกาย 300 นาที"],
    b_plan: ["มีแผนแล้ว", "บันทึกแผนออกกำลังกาย 1 แผน"], b_weigh: ["ติดตามน้ำหนัก", "บันทึกน้ำหนัก 2 ครั้งขึ้นไป"], b_water: ["ดื่มน้ำครบ", "ดื่มน้ำครบเป้าในหน้าแนะนำ 1 วัน"] },
  en: { title: "Progress", streak: "day streak", total: "workouts", week: "this week", mins: "total minutes",
    times: "", days: "", cal: "Last 12 weeks", less: "Less", more: "More", recent: "Recent", none: "No workouts yet. Use guided workout mode and they'll be saved automatically.",
    wTitle: "Weight", wAdd: "Save", wPh: "Today's weight (kg)", wNone: "Log your weight once a week to see the trend.", wChange: d => `${d > 0 ? "+" : ""}${d.toFixed(1)} kg since first entry`,
    wSaved: "Weight saved", wErr: "Enter a weight from 25 to 250 kg",
    logged: "Saved to your progress", loginToLog: "Log in to save your progress",
    hello: n => `Hi ${n}`, helloSub: (s, w) => s ? `${s}-day streak · ${w} this week` : (w ? `${w} workouts this week` : "Let's get moving today!"),
    goPlan: "Go to my plan", goProgress: "See progress", mins2: n => `${n} min`,
    badges: "Badges", badgesSub: (a, b) => `${a} of ${b} earned`, got: "Earned",
    b_first: ["First step", "Your first workout"], b_streak3: ["3 in a row", "Work out 3 days in a row"], b_streak7: ["Full week", "Work out 7 days in a row"],
    b_ten: ["Ten down", "Finish 10 workouts"], b_thirty: ["Fighter", "Finish 30 workouts"], b_mins: ["300 minutes", "300 minutes of exercise in total"],
    b_plan: ["Planner", "Save a workout plan"], b_weigh: ["On the scale", "Log your weight twice"], b_water: ["Hydrated", "Reach your water goal for a day"] }
};
const pt = () => PG_T[lang];

const Progress = (() => {
  const key = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  const today = () => key(new Date());
  const user = () => currentUser();

  function logWorkout(entry) {
    if (!user()) return false;
    updateUser(u => { u.log = [...(u.log || []), { d: today(), ...entry }].slice(-500); });
    return true;
  }
  function addWeight(w) {
    updateUser(u => {
      const list = (u.weights || []).filter(x => x.d !== today());
      u.weights = [...list, { d: today(), w }].slice(-200);
      u.profile = { ...(u.profile || {}), weight: w }; // keep recommendations up to date
      const f = document.getElementById("fW"); if (f) f.value = w;
    });
  }
  function stats(u) {
    const log = u.log || [];
    const daysSet = new Set(log.map(x => x.d));
    let streak = 0;
    const d = new Date();
    if (!daysSet.has(key(d))) d.setDate(d.getDate() - 1); // streak still counts if you trained yesterday
    while (daysSet.has(key(d))) { streak++; d.setDate(d.getDate() - 1); }
    const monday = new Date(); monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    const weekStart = key(monday);
    // longest run of consecutive days ever (for badges)
    let best = 0, run = 0, prev = null;
    [...daysSet].sort().forEach(k => {
      const t = new Date(k + "T00:00:00").getTime();
      run = prev !== null && Math.round((t - prev) / 864e5) === 1 ? run + 1 : 1;
      best = Math.max(best, run); prev = t;
    });
    return {
      streak, best, total: log.length,
      week: log.filter(x => x.d >= weekStart).length,
      mins: log.reduce((a, x) => a + (x.mins || 0), 0),
      perDay: log.reduce((m, x) => (m[x.d] = (m[x.d] || 0) + 1, m), {})
    };
  }
  return { logWorkout, addWeight, stats, key };
})();

/* ---------- Badges: [id, icon, current value, target] ---------- */
function badgeList(u, s) {
  const w = (u.profile && u.profile.weight) || 60, goal = Math.min(16, Math.max(6, Math.round(w * 33 / 250)));
  const waterBest = Math.max(0, ...Object.values(u.water || {}));
  return [
    ["first", "play", s.total, 1], ["streak3", "flame", s.best, 3], ["streak7", "calendar", s.best, 7],
    ["ten", "dumbbell", s.total, 10], ["thirty", "trophy", s.total, 30], ["mins", "gauge", s.mins, 300],
    ["plan", "clipboard", (u.plans || []).length, 1], ["weigh", "scale", (u.weights || []).length, 2], ["water", "droplet", waterBest >= goal ? 1 : 0, 1]
  ];
}
function badgesHTML(u, s) {
  const tx = pt(), list = badgeList(u, s), got = list.filter(b => b[2] >= b[3]).length;
  return `<div class="bd-head"><div class="pg-sub" style="margin:0">${tx.badges}</div><span class="bd-count">${tx.badgesSub(got, list.length)}</span></div>
    <ul class="badges">${list.map(([id, ic, v, max]) => {
      const ok = v >= max, [name, desc] = tx["b_" + id];
      return `<li class="badge${ok ? " ok" : ""}" title="${esc(desc)}">
        <span class="bd-ic">${icon(ok ? ic : "lock")}</span>
        <b>${esc(name)}</b><small>${esc(desc)}</small>
        ${ok ? `<em>${tx.got}</em>` : max > 1 ? `<div class="bd-bar" role="progressbar" aria-valuemin="0" aria-valuemax="${max}" aria-valuenow="${Math.min(v, max)}" aria-label="${esc(name)}"><i style="width:${Math.min(100, v / max * 100)}%"></i></div><em class="bd-n">${Math.min(v, max)} / ${max}</em>` : ""}
      </li>`; }).join("")}</ul>`;
}

/* ---------- Profile page: progress panel ---------- */
function weightChart(ws) {
  const pts = ws.slice(-20);
  if (pts.length < 2) return "";
  const W = 900, H = 200, P = 28;
  const vals = pts.map(p => p.w), lo = Math.min(...vals) - 1, hi = Math.max(...vals) + 1;
  const x = i => P + (i * (W - P * 2)) / (pts.length - 1), y = v => H - P - ((v - lo) / (hi - lo)) * (H - P * 2);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.w).toFixed(1)}`).join("");
  const area = `${line}L${x(pts.length - 1)} ${H - P}L${x(0)} ${H - P}Z`;
  const short = d => d.slice(5).replace("-", "/");
  return `<svg class="w-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="weight chart">
    <defs><linearGradient id="wg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".35"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
    <path d="${area}" fill="url(#wg)"/><path d="${line}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    ${pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.w)}" r="4" fill="var(--surface)" stroke="var(--accent)" stroke-width="2.5"><title>${p.d}: ${p.w} kg</title></circle>`).join("")}
    <text x="${x(0)}" y="${H - 6}" class="w-lbl">${short(pts[0].d)}</text>
    <text x="${x(pts.length - 1)}" y="${H - 6}" class="w-lbl" text-anchor="end">${short(pts[pts.length - 1].d)}</text>
    <text x="${x(pts.length - 1)}" y="${y(pts[pts.length - 1].w) - 12}" class="w-val" text-anchor="end">${pts[pts.length - 1].w}</text>
  </svg>`;
}

function renderProgress() {
  const box = $("#progress"); if (!box) return;
  const u = currentUser();
  box.hidden = !u; if (!u) return;
  const tx = pt(), s = Progress.stats(u);
  // 12-week calendar, columns = weeks (Mon..Sun)
  const end = new Date(), start = new Date(); start.setDate(end.getDate() - ((end.getDay() + 6) % 7) - 7 * 11);
  let cells = "";
  for (let i = 0; i < 84; i++) {
    const d = new Date(start); d.setDate(start.getDate() + i);
    const k = Progress.key(d), n = s.perDay[k] || 0, future = d > end;
    cells += `<i class="hm l${Math.min(n, 3)}${future ? " fut" : ""}" title="${k}${n ? ` · ${n}` : ""}"></i>`;
  }
  const recent = [...(u.log || [])].sort((a, b) => (a.d < b.d ? -1 : 1)).slice(-5).reverse().map(x => `<li><b>${esc(x.t)}</b><span>${x.d.slice(5).replace("-", "/")} · ${tx.mins2(x.mins || 0)}</span></li>`).join("");
  const ws = u.weights || [];
  const change = ws.length >= 2 ? `<span class="w-change ${ws[ws.length - 1].w - ws[0].w <= 0 ? "down" : "up"}">${tx.wChange(ws[ws.length - 1].w - ws[0].w)}</span>` : "";
  box.innerHTML = `
    <div class="wrap">
      <div class="panel">
        <h2 class="panel-title">${icon("trending")} ${tx.title}</h2>
        <div class="pg-stats">
          <div class="pg-stat hot"><b>${s.streak}</b><span>${icon("flame")}${tx.streak}</span></div>
          <div class="pg-stat"><b>${s.week}</b><span>${tx.week}</span></div>
          <div class="pg-stat"><b>${s.total}</b><span>${tx.total}</span></div>
          <div class="pg-stat"><b>${s.mins}</b><span>${tx.mins}</span></div>
        </div>
        <div class="bd-wrap">${badgesHTML(u, s)}</div>
        <div class="pg-two">
          <div>
            <div class="pg-sub">${tx.cal}</div>
            <div class="heat">${cells}</div>
            <div class="heat-key"><span>${tx.less}</span><i class="hm l0"></i><i class="hm l1"></i><i class="hm l2"></i><i class="hm l3"></i><span>${tx.more}</span></div>
          </div>
          <div>
            <div class="pg-sub">${tx.recent}</div>
            ${recent ? `<ul class="pg-recent">${recent}</ul>` : `<p class="hint" style="margin:0">${tx.none}</p>`}
          </div>
        </div>
        <div class="pg-w">
          <div class="pg-w-head"><div class="pg-sub" style="margin:0">${tx.wTitle}</div>${change}</div>
          ${weightChart(ws) || `<p class="hint">${tx.wNone}</p>`}
          <form class="pg-w-form" id="wForm" novalidate>
            <input id="wIn" type="number" inputmode="decimal" step="0.1" min="25" max="250" placeholder="${tx.wPh}" value="${(u.profile && u.profile.weight) || ""}">
            <button type="submit" class="btn">${icon("plus")}${tx.wAdd}</button>
          </form>
        </div>
      </div>
    </div>`;
}
onRender(renderProgress);
document.addEventListener("submit", e => {
  if (e.target.id !== "wForm") return;
  e.preventDefault();
  const w = num("wIn", 25, 250);
  if (isNaN(w)) { toast(pt().wErr); return; }
  Progress.addWeight(Math.round(w * 10) / 10);
  renderAll(); toast(pt().wSaved);
});

/* ---------- Home: greeting strip for logged-in users ---------- */
onRender(() => {
  const box = $("#homeHello"); if (!box) return;
  const u = currentUser();
  box.hidden = !u; if (!u) return;
  const tx = pt(), s = Progress.stats(u);
  box.innerHTML = `
    <div class="hello">
      <span class="avatar">${esc(u.name.trim().charAt(0).toUpperCase())}</span>
      <div class="hello-txt"><b>${esc(tx.hello(u.name))}</b><span>${s.streak ? icon("flame") : ""}${tx.helloSub(s.streak, s.week)}</span></div>
      <div class="btn-row"><a class="btn sm" href="planner.html#plan">${icon("play")}${tx.goPlan}</a><a class="btn sm ghost" href="profile.html#progress">${tx.goProgress}</a></div>
    </div>`;
});
