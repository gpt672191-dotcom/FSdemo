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
    feel: { easy: "ง่ายไป", ok: "พอดี", hard: "หนักไป" },
    upTip: "3 ครั้งล่าสุดคุณบอกว่าง่ายไป ลองเพิ่มระดับเป็น \"ฝึกมาบ้างแล้ว\" ดูไหม", upBtn: "สร้างแผนระดับกลาง",
    downTip: "ช่วงนี้รู้สึกหนักไป ลองลดเวลาต่อวัน หรือเลือกท่าแบบไม่กระโดด ร่างกายจะค่อยๆ ปรับตัว", downBtn: "ปรับแผนให้เบาลง",
    today: "วันนี้", todayWork: (d, m, n) => `${d} · ${m} นาที · ${n} ท่า`, todayRest: "วันพัก พักผ่อนหรือเดินเบาๆ ก็พอ", stretchBtn: "ยืดเหยียดเบาๆ 8 นาที", stretchTitle: "ยืดเหยียดวันพัก", startToday: "เริ่มของวันนี้", noPlan: "ยังไม่มีแผน สร้างแผนแรกใช้เวลา 1 นาที", makePlan: "สร้างแผน",
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
    feel: { easy: "too easy", ok: "just right", hard: "too hard" },
    upTip: "Your last 3 workouts felt too easy. Ready to move up to intermediate?", upBtn: "Make an intermediate plan",
    downTip: "Workouts have felt too hard lately. Try shorter sessions or no-jump moves; your body will adapt.", downBtn: "Make it lighter",
    today: "Today", todayWork: (d, m, n) => `${d} · ${m} min · ${n} moves`, todayRest: "Rest day. Relax or take an easy walk.", stretchBtn: "Gentle 8-min stretch", stretchTitle: "Rest-day stretch", startToday: "Start today's workout", noPlan: "No plan yet. Your first plan takes a minute.", makePlan: "Make a plan",
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
    document.dispatchEvent(new Event("fs-logged"));
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
    const prevMon = new Date(monday); prevMon.setDate(prevMon.getDate() - 7);
    const lastStart = key(prevMon), thisWeek = log.filter(x => x.d >= weekStart), lastWeek = log.filter(x => x.d >= lastStart && x.d < weekStart);
    const sumMins = l => l.reduce((a, x) => a + (x.mins || 0), 0);
    return {
      streak, best, total: log.length,
      week: thisWeek.length, weekMins: sumMins(thisWeek), lastWeek: lastWeek.length, lastWeekMins: sumMins(lastWeek),
      weekDays: new Set(thisWeek.map(x => x.d)).size,
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

/* ---------- Weekly goal: training days this week vs the plan, and this week vs last week ---------- */
const WK_T = {
  th: { title: "เป้าหมายสัปดาห์นี้", of: (a, b) => `${a}/${b} วัน`, sub: b => `ตามแผน ${b} วันต่อสัปดาห์`, done: "ครบตามแผนแล้ว เยี่ยมมาก",
    left: n => `อีก ${n} วันจะครบ`, vs: "เทียบสัปดาห์ที่แล้ว", times: "ครั้ง", mins: "นาที", same: "เท่าเดิม", noPlan: "ยังไม่มีแผน ใช้เป้าหมาย 3 วันต่อสัปดาห์" },
  en: { title: "This week's goal", of: (a, b) => `${a}/${b} days`, sub: b => `Your plan: ${b} days a week`, done: "Goal reached, great work",
    left: n => `${n} more day${n > 1 ? "s" : ""} to go`, vs: "Compared with last week", times: "workouts", mins: "minutes", same: "same", noPlan: "No plan yet, using 3 days a week" }
};
function weekGoalHTML(s) {
  const tx = WK_T[lang], plan = store.get("fs-plan", null), goal = plan && plan.answers ? +plan.answers.days : 3;
  const done = Math.min(s.weekDays, goal), pc = done / goal, R = 34, C = 2 * Math.PI * R;
  const diff = (a, b, unit) => { const d = a - b; return `<b class="${d > 0 ? "up" : d < 0 ? "down" : ""}">${d > 0 ? "+" : ""}${d === 0 ? tx.same : d}</b> ${unit}`; };
  return `<div class="wk-goal">
    <svg class="wk-ring" viewBox="0 0 80 80" role="img" aria-label="${tx.of(done, goal)}">
      <circle cx="40" cy="40" r="${R}" class="wk-track"/><circle cx="40" cy="40" r="${R}" class="wk-arc" stroke-dasharray="${C}" stroke-dashoffset="${C * (1 - pc)}"/>
      <text x="40" y="45" text-anchor="middle">${done}/${goal}</text>
    </svg>
    <div class="wk-txt"><b>${tx.title}</b><span>${s.weekDays >= goal ? tx.done : tx.left(goal - done)}</span><small>${plan ? tx.sub(goal) : tx.noPlan}</small></div>
    <div class="wk-vs"><small>${tx.vs}</small><span>${diff(s.week, s.lastWeek, tx.times)}</span><span>${diff(s.weekMins, s.lastWeekMins, tx.mins)}</span></div>
  </div>`;
}

/* ---------- Log a workout done outside guided mode (walk, run, football...) ---------- */
// kcal estimate = MET x body weight (kg) x hours (Compendium of Physical Activities, rounded)
const ACTS = [["walk", 3.5], ["run", 8], ["bike", 6], ["swim", 6], ["ball", 7], ["gym", 5], ["yoga", 2.5], ["other", 4]];
const MAN_T = {
  th: { title: "บันทึกการออกกำลังกายเอง", sub: "ออกกำลังกายนอกโหมดนำ เช่น เดิน วิ่ง เตะบอล ก็นับรวมวันต่อเนื่อง เหรียญ และเป้าสัปดาห์ได้",
    act: "กิจกรรม", mins: "กี่นาที", date: "วันที่", feel: "รู้สึก", add: "บันทึก", err: "กรอกเวลา 1–600 นาที และวันที่ไม่เกินวันนี้",
    saved: (k) => `บันทึกแล้ว เผาผลาญประมาณ ${k} kcal`,
    names: { walk: "เดินเร็ว", run: "วิ่ง", bike: "ปั่นจักรยาน", swim: "ว่ายน้ำ", ball: "ฟุตบอล / กีฬา", gym: "ฟิตเนส", yoga: "โยคะ / ยืดเหยียด", other: "อื่นๆ" },
    feels: { "": "-", easy: "ง่ายไป", ok: "พอดี", hard: "หนักไป" } },
  en: { title: "Log a workout yourself", sub: "Exercise outside guided mode, like walking, running or football, still counts toward your streak, badges and weekly goal.",
    act: "Activity", mins: "Minutes", date: "Date", feel: "Felt", add: "Save", err: "Enter 1–600 minutes and a date that isn't in the future",
    saved: (k) => `Saved. About ${k} kcal burned`,
    names: { walk: "Brisk walk", run: "Run", bike: "Cycling", swim: "Swimming", ball: "Football / sport", gym: "Gym", yoga: "Yoga / stretching", other: "Other" },
    feels: { "": "-", easy: "Too easy", ok: "Just right", hard: "Too hard" } }
};
function manualHTML() {
  const tx = MAN_T[lang], today = Progress.key(new Date());
  return `<form class="man-log" id="manForm" novalidate>
    <div class="pg-sub" style="margin:0">${tx.title}</div><p class="hint" style="margin:2px 0 10px">${tx.sub}</p>
    <div class="man-grid">
      <div class="field"><label for="manAct">${tx.act}</label><select id="manAct">${ACTS.map(([id]) => `<option value="${id}">${tx.names[id]}</option>`).join("")}</select></div>
      <div class="field"><label for="manMin">${tx.mins}</label><input id="manMin" type="number" inputmode="numeric" min="1" max="600" value="30"></div>
      <div class="field"><label for="manDate">${tx.date}</label><input id="manDate" type="date" max="${today}" value="${today}"></div>
      <div class="field"><label for="manFeel">${tx.feel}</label><select id="manFeel">${Object.entries(tx.feels).map(([k, v]) => `<option value="${k}">${v}</option>`).join("")}</select></div>
      <button type="submit" class="btn">${icon("plus")}${tx.add}</button>
    </div>
  </form>`;
}
document.addEventListener("submit", e => {
  if (e.target.id !== "manForm") return;
  e.preventDefault();
  const tx = MAN_T[lang], u = currentUser(); if (!u) return;
  const mins = Math.round(+$("#manMin").value), d = $("#manDate").value, act = $("#manAct").value, feel = $("#manFeel").value;
  if (!(mins >= 1 && mins <= 600) || !/^\d{4}-\d{2}-\d{2}$/.test(d) || d > Progress.key(new Date())) { toast(tx.err); return; }
  const met = (ACTS.find(a => a[0] === act) || ACTS[ACTS.length - 1])[1];
  const kcal = Math.round(met * ((u.profile && u.profile.weight) || 60) * mins / 60);
  updateUser(x => { x.log = [...(x.log || []), { d, t: tx.names[act], sets: 0, mins, kcal, manual: act, ...(feel ? { feel } : {}) }].sort((a, b) => (a.d < b.d ? -1 : 1)).slice(-500); });
  renderAll(); toast(tx.saved(kcal));
});

/* ---------- Full workout history, with delete (second tap confirms) ---------- */
const HIST_T = {
  th: { show: n => `ดูประวัติทั้งหมด (${n})`, hide: "ซ่อนประวัติ", del: "ลบ", sure: "ยืนยันลบ", deleted: "ลบรายการแล้ว", delLabel: (t, d) => `ลบ ${t} วันที่ ${d}` },
  en: { show: n => `Show full history (${n})`, hide: "Hide history", del: "Delete", sure: "Confirm", deleted: "Entry deleted", delLabel: (t, d) => `Delete ${t} on ${d}` }
};
let histOpen = false, histArmed = null, histTimer;
function historyHTML(u) {
  const tx = HIST_T[lang], ptx = pt();
  // keep the original index so delete removes the right entry
  const rows = (u.log || []).map((x, i) => ({ x, i })).sort((a, b) => (a.x.d < b.x.d ? 1 : a.x.d > b.x.d ? -1 : b.i - a.i));
  return `<ul class="hist-list">${rows.map(({ x, i }) => `<li>
    <div><b>${esc(x.t || "-")}</b><small>${esc(x.d)} · ${ptx.mins2(x.mins || 0)}${x.sets ? ` · ${x.sets} ${lang === "th" ? "เซ็ต" : "sets"}` : ""}${x.feel && ptx.feel[x.feel] ? ` · ${ptx.feel[x.feel]}` : ""}</small></div>
    <button type="button" class="btn ghost danger sm" data-hist-del="${i}" aria-label="${esc(tx.delLabel(x.t || "-", x.d))}">${histArmed === i ? tx.sure : icon("trash")}</button>
  </li>`).join("")}</ul>`;
}
document.addEventListener("click", e => {
  if (e.target.closest("[data-hist]")) { histOpen = !histOpen; histArmed = null; return renderProgress(); }
  const d = e.target.closest("[data-hist-del]"); if (!d) return;
  const i = Number(d.dataset.histDel);
  clearTimeout(histTimer);
  if (histArmed !== i) { histArmed = i; histTimer = setTimeout(() => { histArmed = null; renderProgress(); }, 3000); return renderProgress(); }
  histArmed = null;
  updateUser(u => { u.log = (u.log || []).filter((_, k) => k !== i); });
  renderAll(); toast(HIST_T[lang].deleted);
});

/* ---------- Profile page: progress panel ---------- */
function weightChart(ws, unit = "kg", gid = "wg") {
  const pts = ws.slice(-20);
  if (pts.length < 2) return "";
  const W = 900, H = 200, P = 28;
  const vals = pts.map(p => p.w), lo = Math.min(...vals) - 1, hi = Math.max(...vals) + 1;
  const x = i => P + (i * (W - P * 2)) / (pts.length - 1), y = v => H - P - ((v - lo) / (hi - lo)) * (H - P * 2);
  const line = pts.map((p, i) => `${i ? "L" : "M"}${x(i).toFixed(1)} ${y(p.w).toFixed(1)}`).join("");
  const area = `${line}L${x(pts.length - 1)} ${H - P}L${x(0)} ${H - P}Z`;
  const short = d => d.slice(5).replace("-", "/");
  return `<svg class="w-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="${unit === "kg" ? "weight" : "waist"} chart">
    <defs><linearGradient id="${gid}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="var(--accent)" stop-opacity=".35"/><stop offset="1" stop-color="var(--accent)" stop-opacity="0"/></linearGradient></defs>
    <path d="${area}" fill="url(#${gid})"/><path d="${line}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    ${pts.map((p, i) => `<circle cx="${x(i)}" cy="${y(p.w)}" r="4" fill="var(--surface)" stroke="var(--accent)" stroke-width="2.5"><title>${p.d}: ${p.w} ${unit}</title></circle>`).join("")}
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
  const recent = [...(u.log || [])].sort((a, b) => (a.d < b.d ? -1 : 1)).slice(-5).reverse().map(x => `<li><b>${esc(x.t)}</b><span>${x.d.slice(5).replace("-", "/")} · ${tx.mins2(x.mins || 0)}${x.feel ? ` · ${tx.feel[x.feel]}` : ""}</span></li>`).join("");
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
        ${weekGoalHTML(s)}
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
            ${(u.log || []).length ? `<button type="button" class="btn ghost sm hist-toggle" data-hist aria-expanded="${histOpen}">${histOpen ? HIST_T[lang].hide : HIST_T[lang].show((u.log || []).length)}</button>` : ""}
            ${histOpen ? historyHTML(u) : ""}
          </div>
        </div>
        ${manualHTML()}
        <div class="pg-w">
          <div class="pg-w-head"><div class="pg-sub" style="margin:0">${tx.wTitle}</div>${change}</div>
          ${weightChart(ws) || `<p class="hint">${tx.wNone}</p>`}
          <form class="pg-w-form" id="wForm" novalidate>
            <input id="wIn" type="number" inputmode="decimal" step="0.1" min="25" max="250" placeholder="${tx.wPh}" value="${(u.profile && u.profile.weight) || ""}">
            <button type="submit" class="btn">${icon("plus")}${tx.wAdd}</button>
          </form>
        </div>
        ${waistHTML(u)}
      </div>
    </div>`;
}
onRender(renderProgress);

/* ---------- Waist (cm): often shrinks even when the scale doesn't move ---------- */
const WAIST_T = {
  th: { title: "รอบเอว", ph: "รอบเอววันนี้ (ซม.)", none: "วัดรอบเอวระดับสะดือ หายใจออกปกติ สัปดาห์ละครั้ง น้ำหนักไม่ลงแต่เอวลดก็ถือว่าได้ผล",
    ratio: (r, ok) => `รอบเอว/ส่วนสูง = ${r} ${ok ? "อยู่ในเกณฑ์ดี (ต่ำกว่า 0.5)" : "เกิน 0.5 ควรลดรอบเอว (เกณฑ์: รอบเอวไม่ควรเกินครึ่งหนึ่งของส่วนสูง)"}`,
    change: d => `${d > 0 ? "+" : ""}${d.toFixed(1)} ซม. จากครั้งแรก`, saved: "บันทึกรอบเอวแล้ว", err: "กรอกรอบเอว 40–200 ซม." },
  en: { title: "Waist", ph: "Today's waist (cm)", none: "Measure at the belly button after a normal breath out, once a week. A smaller waist counts even if your weight stays the same.",
    ratio: (r, ok) => `Waist-to-height = ${r} ${ok ? "is in the healthy range (under 0.5)" : "is above 0.5; aim to bring your waist under half your height"}`,
    change: d => `${d > 0 ? "+" : ""}${d.toFixed(1)} cm since first entry`, saved: "Waist saved", err: "Enter a waist from 40 to 200 cm" }
};
function waistHTML(u) {
  const tx = WAIST_T[lang], ws = u.waist || [], last = ws[ws.length - 1], h = u.profile && u.profile.height;
  const change = ws.length >= 2 ? `<span class="w-change ${last.w - ws[0].w <= 0 ? "down" : "up"}">${tx.change(last.w - ws[0].w)}</span>` : "";
  const r = last && h ? last.w / h : null;
  return `<div class="pg-w">
    <div class="pg-w-head"><div class="pg-sub" style="margin:0">${tx.title}</div>${change}</div>
    ${weightChart(ws, "cm", "wg2") || `<p class="hint">${tx.none}</p>`}
    ${r ? `<p class="waist-ratio ${r < 0.5 ? "ok" : "warn"}">${icon(r < 0.5 ? "check" : "alert")}<span>${tx.ratio(r.toFixed(2), r < 0.5)}</span></p>` : ""}
    <form class="pg-w-form" id="waistForm" novalidate>
      <input id="waistIn" type="number" inputmode="decimal" step="0.5" min="40" max="200" placeholder="${tx.ph}" value="${last ? last.w : ""}" aria-label="${tx.ph}">
      <button type="submit" class="btn">${icon("plus")}${pt().wAdd}</button>
    </form>
  </div>`;
}
document.addEventListener("submit", e => {
  if (e.target.id !== "waistForm") return;
  e.preventDefault();
  const w = num("waistIn", 40, 200), tx = WAIST_T[lang];
  if (isNaN(w)) { toast(tx.err); return; }
  const day = Progress.key(new Date());
  updateUser(u => { u.waist = [...(u.waist || []).filter(x => x.d !== day), { d: day, w: Math.round(w * 2) / 2 }].slice(-200); });
  renderAll(); toast(tx.saved);
});

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
  // Today's workout from the current plan (same schedule the planner uses: SCHEDULE / TEMPLATES in data.js)
  const plan = store.get("fs-plan", null);
  let today = `<div class="hello-today">${icon("clipboard")}<span>${tx.noPlan}</span><a class="btn sm" href="planner.html">${tx.makePlan}</a></div>`;
  if (plan && plan.answers && SCHEDULE[plan.answers.days]) {
    const a = plan.answers, wd = (new Date().getDay() + 6) % 7, i = SCHEDULE[a.days].indexOf(wd);
    if (i < 0) today = `<div class="hello-today rest">${icon("moon")}<span><b>${tx.today}</b> ${tx.todayRest}</span>${typeof Workout !== "undefined" ? `<button type="button" class="btn sm" data-stretch>${icon("stretch")}${tx.stretchBtn}</button>` : `<a class="btn sm ghost" href="planner.html#plan">${tx.goPlan}</a>`}</div>`;
    else {
      const tpl = TEMPLATES[a.goal][i % TEMPLATES[a.goal].length];
      today = `<div class="hello-today">${icon("calendar")}<span><b>${tx.today}</b> ${tx.todayWork(t().dayType[tpl.type], a.time, COUNT[a.time])}</span><a class="btn sm" href="planner.html?day=${i}#plan">${icon("play")}${tx.startToday}</a></div>`;
    }
  }
  // Level tip from how the last workouts felt (asked at the end of each guided workout)
  const feels = (u.log || []).filter(x => x.feel).slice(-3).map(x => x.feel);
  const lvl = plan && plan.answers ? plan.answers.level : "beg";
  let tip = "";
  if (feels.length === 3 && feels.every(f => f === "easy") && lvl === "beg")
    tip = `<div class="hello-today tip">${icon("trending")}<span>${tx.upTip}</span><a class="btn sm" href="planner.html?level=int">${tx.upBtn}</a></div>`;
  else if (feels.length >= 2 && feels.filter(f => f === "hard").length >= 2)
    tip = `<div class="hello-today tip">${icon("heart")}<span>${tx.downTip}</span><a class="btn sm ghost" href="planner.html?time=15&impact=low">${tx.downBtn}</a></div>`;
  box.innerHTML = `
    <div class="hello">
      <span class="avatar">${esc(u.name.trim().charAt(0).toUpperCase())}</span>
      <div class="hello-txt"><b>${esc(tx.hello(u.name))}</b><span>${s.streak ? icon("flame") : ""}${tx.helloSub(s.streak, s.week)}</span></div>
      <div class="btn-row"><a class="btn sm ghost" href="planner.html#plan">${tx.goPlan}</a><a class="btn sm ghost" href="profile.html#progress">${tx.goProgress}</a></div>
      ${today}${tip}
    </div>`;
});

// Rest day: a short guided stretch (7 mobility moves, 1 x 45 s each, no extra warm-up)
const REST_STRETCH = ["catcow", "wgs", "hipflex", "hamstring", "tspine", "child", "dog"];
document.addEventListener("click", e => {
  if (!e.target.closest("[data-stretch]") || typeof Workout === "undefined") return;
  Workout.start({ title: pt().stretchTitle, rest: 10, warm: false,
    items: REST_STRETCH.map(id => EX.find(x => x.id === id)).filter(Boolean).map(ex => ({ ex, sets: 1, secs: 45 })) });
});
