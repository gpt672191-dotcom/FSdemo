// หน้าสร้างแผน: สร้างแผน ฟอร์มคำถาม และแผนที่บันทึกไว้ (Plan builder page)

let answers = { ...DEFAULTS, ...store.get("fs-answers", {}) };
let lastPlan = store.get("fs-plan", null); // { answers, seed }

// Links like planner.html?goal=muscle&impact=low pre-select answers
{
  const q = new URLSearchParams(location.search);
  for (const key of Object.keys(OPTIONS)) {
    if (OPTIONS[key].includes(q.get(key))) answers[key] = q.get(key);
  }
}

/* ---------- Plan generation ---------- */
function allowedEquip(eq) { return eq === "gym" ? ["none", "db", "gym"] : eq === "db" ? ["none", "db"] : ["none"]; }

function dose(ex, a) {
  const t = T[lang], beg = a.level === "beg";
  const side = ex.side ? ` ${t.perSide}` : "";
  if (ex.machine) return `${beg ? 8 : 12} ${t.min}`;
  if (ex.cat === "mobility") return `2 × ${beg ? 30 : 45}${t.sec}${side}`;
  if (ex.cat === "cardio") {
    const lose = a.goal === "lose" || a.goal === "endure";
    return beg ? `${lose ? 4 : 3} × 30${t.sec} / ${t.rest} 30${t.sec}` : `${lose ? 5 : 4} × 40${t.sec} / ${t.rest} 20${t.sec}`;
  }
  const sets = beg ? 2 : 3;
  if (ex.timed) return `${sets} × ${beg ? 20 : 40}${t.sec}${side}`;
  const reps = a.goal === "muscle" ? (beg ? "8–10" : "10–12") : (beg ? "10" : "12–15");
  return `${sets} × ${reps}${side}`;
}

const restSec = a => (a.goal === "muscle" ? 90 : a.goal === "flex" ? 15 : a.goal === "lose" ? 30 : 45);

function buildPlan(a, seed) {
  const rand = rng(seed);
  const eqOK = allowedEquip(a.equip);
  const pool = EX.filter(e =>
    eqOK.includes(e.eq) &&
    !(a.level === "beg" && e.adv) &&
    !(a.impact === "low" && e.jump)
  );
  // Prefer equipment-specific moves first when the user has equipment
  const byCat = {};
  for (const cat of ["lower", "upper", "core", "cardio", "mobility"]) {
    const items = shuffle(pool.filter(e => e.cat === cat), rand);
    if (a.equip !== "none") items.sort((x, y) => (y.eq !== "none") - (x.eq !== "none"));
    byCat[cat] = items;
  }
  const cursor = {};
  const tpls = TEMPLATES[a.goal];
  const n = COUNT[a.time];
  return SCHEDULE[a.days].map((weekday, i) => {
    const tpl = tpls[i % tpls.length];
    const used = new Set();
    const list = [];
    for (const cat of tpl.slots.slice(0, n)) {
      const items = byCat[cat];
      if (!items.length) continue;
      for (let k = 0; k < items.length; k++) {
        cursor[cat] = (cursor[cat] || 0) % items.length;
        const ex = items[cursor[cat]++];
        if (!used.has(ex.id)) { used.add(ex.id); list.push(ex); break; }
      }
    }
    return { weekday, type: tpl.type, list };
  });
}

// Which plan days are expanded (only the first day open by default, to keep the page tidy)
let openDays = new Set([0]);

function renderPlan() {
  const box = $("#plan");
  // Plans are for members only: guests see a sign-up / log-in prompt instead
  if (!currentUser()) {
    const tx = T[lang]; // (not t(): this function declares its own `t` below)
    box.innerHTML = `
      <div class="gate">
        <span class="gate-ico">${icon("lock")}</span>
        <div class="gate-txt"><b>${tx.gateTitle}</b><span>${tx.gateSub}</span></div>
        <div class="btn-row">
          <button type="button" class="btn" data-gate="signup">${tx.signup}</button>
          <button type="button" class="btn ghost" data-gate="login">${tx.login}</button>
        </div>
      </div>`;
    return;
  }
  if (!lastPlan) { box.innerHTML = ""; return; }
  const a = lastPlan.answers, t = T[lang];
  const days = buildPlan(a, lastPlan.seed);
  const active = new Set(days.map(d => d.weekday));
  const total = +a.time;

  const summary = t.sumTpl(t.sumGoal[a.goal], t.lvName[a.level], a.days, a.time, t.sumFocus[a.goal]);
  const byDay = Object.fromEntries(days.map(d => [d.weekday, d]));

  // Week strip: training days show the day type, the rest say "rest"
  const week = t.week.map((d, i) => `
    <div class="wk ${active.has(i) ? "on" : ""}">
      <b>${d}</b><small>${active.has(i) ? t.dayType[byDay[i].type] : t.restDay}</small>
    </div>`).join("");

  const stats = [
    [a.days, t.stDays], [a.time, t.stMin], [`${restSec(a)}${t.sec}`, t.stRest], [t.lvName[a.level], t.stLevel]
  ].map(([v, l]) => `<div class="pstat"><b>${v}</b><small>${l}</small></div>`).join("");

  const ticks = `<span class="ticks print-only" aria-hidden="true"><i></i><i></i><i></i><i></i></span>`;

  const cards = days.map((d, n) => `
    <article class="pday${openDays.has(n) ? " open" : ""}" data-day="${n}">
      <div class="pday-head" data-toggle-day="${n}" role="button" tabindex="0" aria-expanded="${openDays.has(n)}">
        <span class="pday-num">${n + 1}</span>
        <div class="pday-title"><h3>${t.weekFull[d.weekday]}</h3><span>${t.dayType[d.type]}</span></div>
        <span class="pday-meta">${t.nMoves(d.list.length)} · ~${total} ${t.min}</span>
        <button type="button" class="btn sm wo-day" data-wo-day="${n}">${icon("play")}<span>${t.woStartDay}</span></button>
        <span class="pday-chev" aria-hidden="true">${icon("chevron")}</span>
      </div>
      <div class="pday-body"><div class="pday-inner">
      <div class="phase-row"><span class="phase-tag">${t.warm}</span><span>${t.warmTxt}</span></div>
      <ol class="pex-list">
        ${d.list.map((ex, k) => `
          <li class="pex">
            <div class="fig mini" data-fig="${ex.id}"></div>
            <div class="pex-body">
              <div class="pex-name"><span class="pex-n">${k + 1}</span>${ex[lang]}</div>
              <div class="pex-cue">${lang === "th" ? ex.cth : ex.cen}</div>
              <span class="pex-dose">${dose(ex, a)}</span>
            </div>
            ${ticks}
          </li>`).join("")}
      </ol>
      <div class="phase-row"><span class="phase-tag">${t.cool}</span><span>${t.coolTxt}</span></div>
      </div></div>
    </article>`).join("");

  const u = typeof currentUser === "function" ? currentUser() : null;
  const dateFmt = new Intl.DateTimeFormat(lang === "th" ? "th-TH" : "en-GB", { dateStyle: "long" });

  box.innerHTML = `
    <div class="print-head print-only">
      <img src="img/logo.svg" alt="" width="40" height="40">
      <div><b>${t.printTitle}</b><small>FitStart AI${u ? ` · ${esc(u.name)}` : ""} · ${dateFmt.format(new Date())}</small></div>
    </div>
    <div class="summary"><span class="ai-badge">AI</span><p>${summary}</p></div>
    <div class="pstats">${stats}</div>
    <div class="week2">${week}</div>
    <p class="tick-note print-only">${t.tickNote}</p>
    <div class="pdays-bar"><button type="button" class="pdays-all${openDays.size === days.length ? " all-open" : ""}" data-all-days>${icon("chevron")}<span>${openDays.size === days.length ? t.collapseAll : t.expandAll}</span></button></div>
    <div class="pdays">${cards}</div>
    <p class="note">${icon("alert")} ${t.planNote}</p>
    <p class="print-foot print-only">${t.printFoot}</p>
    <div class="plan-actions">
      <button type="button" class="btn" id="saveBtn">${icon("save")}${t.savePlan}</button>
      <button type="button" class="btn ghost" id="regen">${icon("refresh")}${t.regen}</button>
      <button type="button" class="btn ghost" id="printBtn">${icon("printer")}${t.print}</button>
    </div>
    <div class="cal-row">
      <label for="calTime">${CAL_T[lang].time}</label>
      <input type="time" id="calTime" value="${store.get("fs-cal-time", "18:00")}">
      <button type="button" class="btn ghost" id="calBtn">${icon("calendar")}${CAL_T[lang].add}</button>
      <small>${CAL_T[lang].hint}</small>
    </div>`;
  $("#saveBtn").onclick = savePlan;
  $("#regen").onclick = () => generate({ ...lastPlan.answers }, false);
  $("#printBtn").onclick = () => window.print();
  $("#calBtn").onclick = () => downloadCalendar(days, a);
}

function generate(a, scroll = true) {
  const box = $("#plan");
  box.innerHTML = `<div class="thinking"><span class="dots"><span></span><span></span><span></span></span>${T[lang].thinking}</div>`;
  if (scroll) box.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => {
    lastPlan = { answers: a, seed: Math.floor(Math.random() * 1e9) };
    openDays = new Set([0]);
    store.set("fs-plan", lastPlan);
    renderPlan();
  }, 900);
}

/* ---------- Form ---------- */
// Icons for the card-style questions
const OPT_ICON = {
  goal: { lose: "flame", muscle: "dumbbell", endure: "heart", flex: "stretch" },
  equip: { none: "home", db: "dumbbell", gym: "building" }
};

function renderChips() {
  const tx = T[lang];
  for (const group of Object.keys(OPTIONS)) {
    const wrap = $(`[data-group="${group}"]`);
    if (group === "impact") {
      // On/off switch: on = sensitive knees/ankles (no jumping)
      wrap.innerHTML = `
        <span class="pf-switch-txt"><b>${tx.qImpact}</b><small>${tx.impact_low}</small></span>
        <span class="switch"><input type="checkbox" name="impact" ${answers.impact === "low" ? "checked" : ""}><span></span></span>`;
      continue;
    }
    const cards = wrap.classList.contains("opt-cards");
    wrap.innerHTML = OPTIONS[group].map(v => {
      const on = answers[group] === v ? "checked" : "";
      const label = tx[`${group}_${v}`];
      const inner = cards
        ? `<span class="oc-ico">${icon(OPT_ICON[group][v])}</span><b>${label}</b><small>${tx[`${group}D_${v}`] || ""}</small>`
        : `<span>${label}</span>`;
      return `<label class="${cards ? "oc" : "sg"}"><input type="radio" name="${group}" value="${v}" ${on}>${inner}</label>`;
    }).join("");
  }
}
$("#planForm").addEventListener("change", e => {
  const el = e.target;
  if (!el.name) return;
  answers[el.name] = el.type === "checkbox" ? (el.checked ? "low" : "any") : el.value;
  store.set("fs-answers", answers);
});
$("#planForm").addEventListener("submit", e => {
  e.preventDefault();
  const go = () => generate({ ...answers });
  // Must be logged in to build a plan; after logging in / signing up, the plan is built straight away
  if (!currentUser()) { toast(t().gateToast); openAuth("signup", go); return; }
  go();
});
$("#plan").addEventListener("click", e => {
  const b = e.target.closest("[data-gate]");
  if (b) openAuth(b.dataset.gate, () => generate({ ...answers }));
  const d = e.target.closest("[data-wo-day]");
  if (d) { startDayWorkout(+d.dataset.woDay); return; }
  if (e.target.closest("[data-all-days]")) {
    const n = $$("#plan .pday").length;
    openDays = openDays.size === n ? new Set() : new Set([...Array(n).keys()]);
    renderPlan(); return;
  }
  const h = e.target.closest("[data-toggle-day]");
  if (h) toggleDay(+h.dataset.toggleDay);
});
$("#plan").addEventListener("keydown", e => {
  const h = e.target.closest("[data-toggle-day]");
  if (h && e.target === h && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); toggleDay(+h.dataset.toggleDay); }
});

// Open/close one day without redrawing the whole plan
function toggleDay(i) {
  const card = $(`#plan .pday[data-day="${i}"]`);
  if (!card) return;
  const open = !card.classList.contains("open");
  card.classList.toggle("open", open);
  card.querySelector(".pday-head").setAttribute("aria-expanded", open);
  if (open) openDays.add(i); else openDays.delete(i);
  const n = $$("#plan .pday").length, all = $("[data-all-days]");
  all.classList.toggle("all-open", openDays.size === n);
  all.querySelector("span").textContent = openDays.size === n ? T[lang].collapseAll : T[lang].expandAll;
}

/* ---------- Guided workout for one plan day (js/workout.js) ---------- */
// Same sets / reps / seconds as the plan card shows (see dose())
function woItem(ex, a) {
  const beg = a.level === "beg";
  if (ex.machine) return { ex, sets: 1, secs: (beg ? 8 : 12) * 60 };
  if (ex.cat === "mobility") return { ex, sets: 2, secs: beg ? 30 : 45 };
  if (ex.cat === "cardio") {
    const lose = a.goal === "lose" || a.goal === "endure";
    return beg ? { ex, sets: lose ? 4 : 3, secs: 30 } : { ex, sets: lose ? 5 : 4, secs: 40 };
  }
  const sets = beg ? 2 : 3;
  if (ex.timed) return { ex, sets, secs: beg ? 20 : 40 };
  return { ex, sets, target: a.goal === "muscle" ? (beg ? "8–10" : "10–12") : (beg ? "10" : "12–15"), secs: null };
}
function startDayWorkout(i) {
  if (!lastPlan) return;
  const a = lastPlan.answers, tx = T[lang];
  const d = buildPlan(a, lastPlan.seed)[i];
  Workout.start({ title: `${tx.weekFull[d.weekday]} · ${tx.dayType[d.type]}`, rest: restSec(a), items: d.list.map(ex => woItem(ex, a)) });
}
onRender(renderChips);
onRender(renderPlan);

/* ---------- Saved plans (needs auth.js) ---------- */
function savePlan() {
  const tx = t();
  if (!lastPlan) return;
  if (!currentUser()) { toast(tx.loginToSave); openAuth("login", savePlan); return; }
  const users = getUsers(), u = users[session];
  if (u.plans.some(p => p.seed === lastPlan.seed && JSON.stringify(p.answers) === JSON.stringify(lastPlan.answers))) {
    toast(tx.alreadySaved); return;
  }
  u.plans.unshift({ answers: lastPlan.answers, seed: lastPlan.seed, savedAt: Date.now() });
  setUsers(users);
  renderSaved();
  toast(tx.savedMsg);
}

function renderSaved() {
  const box = $("#savedList"), u = currentUser(), tx = t();
  $("#myplans").hidden = !u;
  if (!u) { box.innerHTML = ""; return; }
  if (!u.plans.length) { box.innerHTML = `<div class="empty">${tx.noPlans}</div>`; return; }
  const dateFmt = new Intl.DateTimeFormat(lang === "th" ? "th-TH" : "en-GB", { dateStyle: "medium", timeStyle: "short" });
  box.innerHTML = u.plans.map((p, i) => {
    const a = p.answers;
    return `
      <div class="saved">
        <div>
          <b>${tx.sumGoal[a.goal].replace(/^./, c => c.toUpperCase())} · ${tx.lvName[a.level]}</b>
          <small>${a.days} × ${a.time} ${tx.min} · ${tx[`equip_${a.equip}`]} · ${tx.savedOn} ${dateFmt.format(p.savedAt)}</small>
        </div>
        <div class="acts">
          <button type="button" class="btn sm" data-open="${i}">${tx.open}</button>
          <button type="button" class="btn sm ghost" data-del="${i}">${tx.del}</button>
        </div>
      </div>`;
  }).join("");
}
onRender(renderSaved);

$("#savedList").addEventListener("click", e => {
  const tx = t();
  const openI = e.target.dataset.open, delI = e.target.dataset.del;
  const users = getUsers(), u = users[session];
  if (!u) return;
  if (openI !== undefined) {
    const p = u.plans[+openI];
    lastPlan = { answers: p.answers, seed: p.seed };
    answers = { ...p.answers };
    store.set("fs-plan", lastPlan); store.set("fs-answers", answers);
    renderChips(); renderPlan();
    $("#plan").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (delI !== undefined) {
    // Two-step delete: first tap arms the button, second tap deletes
    if (e.target.dataset.armed) {
      u.plans.splice(+delI, 1); setUsers(users); renderSaved(); toast(tx.deleted);
    } else {
      e.target.dataset.armed = "1"; e.target.textContent = tx.delConfirm;
      setTimeout(() => { if (e.target.isConnected) { delete e.target.dataset.armed; e.target.textContent = tx.del; } }, 3000);
    }
  }
});

/* ---------- Add the plan to the phone's calendar (.ics file, repeats weekly for 8 weeks, reminder 30 min before) ---------- */
const CAL_T = {
  th: { time: "เวลาออกกำลังกาย", add: "เพิ่มลงปฏิทิน", hint: "ได้ไฟล์ปฏิทิน เปิดแล้วจะเพิ่มทุกวันที่ต้องฝึก 8 สัปดาห์ พร้อมเตือนก่อน 30 นาที",
    done: "ดาวน์โหลดไฟล์ปฏิทินแล้ว เปิดไฟล์เพื่อเพิ่มลงปฏิทิน", title: d => `FitStart: ${d}`, remind: "อีก 30 นาทีได้เวลาออกกำลังกาย" },
  en: { time: "Workout time", add: "Add to calendar", hint: "Downloads a calendar file: every training day for 8 weeks, with a reminder 30 min before.",
    done: "Calendar file downloaded. Open it to add the workouts.", title: d => `FitStart: ${d}`, remind: "Workout in 30 minutes" }
};
function downloadCalendar(days, a) {
  const tx = T[lang], ct = CAL_T[lang];
  const tm = ($("#calTime").value || "18:00").split(":").map(Number);
  store.set("fs-cal-time", $("#calTime").value || "18:00");
  const pad = n => String(n).padStart(2, "0");
  const stamp = d => `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}T${pad(d.getHours())}${pad(d.getMinutes())}00`;
  const NL = String.fromCharCode(10), CRLF = String.fromCharCode(13, 10), BS = String.fromCharCode(92);
  // iCalendar text: backslash, comma and semicolon get a backslash; line breaks become a literal \n
  const esc = x => String(x).split(BS).join(BS + BS).replace(/([,;])/g, BS + "$1").split(NL).join(BS + "n");
  const now = new Date(), utc = now.toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
  const ev = days.map((d, i) => {
    // next date for this weekday (0 = Monday), today counts if the time has not passed yet
    const start = new Date(now); start.setHours(tm[0], tm[1] || 0, 0, 0);
    let add = (d.weekday - ((start.getDay() + 6) % 7) + 7) % 7;
    if (add === 0 && start <= now) add = 7;
    start.setDate(start.getDate() + add);
    const name = `${tx.weekFull[d.weekday]} · ${tx.dayType[d.type]}`;
    const desc = d.list.map((e, k) => `${k + 1}. ${e[lang]}`).join(NL) + NL + NL + "https://gpt672191-dotcom.github.io/FSdemo/planner.html";
    return ["BEGIN:VEVENT", `UID:fitstart-${now.getTime()}-${i}@fitstart`, `DTSTAMP:${utc}`, `DTSTART:${stamp(start)}`, `DURATION:PT${+a.time}M`,
      "RRULE:FREQ=WEEKLY;COUNT=8", `SUMMARY:${esc(ct.title(tx.dayType[d.type]))}`, `DESCRIPTION:${esc(name + NL + desc)}`,
      "BEGIN:VALARM", "ACTION:DISPLAY", `DESCRIPTION:${esc(ct.remind)}`, "TRIGGER:-PT30M", "END:VALARM", "END:VEVENT"].join(CRLF);
  });
  const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//FitStart AI//Plan//TH", "CALSCALE:GREGORIAN", ...ev, "END:VCALENDAR"].join(CRLF);
  const blob = new Blob([ics], { type: "text/calendar;charset=utf-8" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob); link.download = "fitstart-plan.ics";
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 1500);
  toast(ct.done);
}
