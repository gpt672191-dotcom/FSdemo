// สร้างแผนออกกำลังกาย (Plan generator and form)

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

function restText(a) {
  const t = T[lang];
  const s = a.goal === "muscle" ? 90 : a.goal === "flex" ? 15 : a.goal === "lose" ? 30 : 45;
  return `${t.rest} ${s}${t.sec}`;
}

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

function renderPlan() {
  const box = $("#plan");
  if (!lastPlan) { box.innerHTML = ""; return; }
  const a = lastPlan.answers, t = T[lang];
  const days = buildPlan(a, lastPlan.seed);
  const active = new Set(days.map(d => d.weekday));
  const total = +a.time;

  const summary = t.sumTpl(t.sumGoal[a.goal], t.lvName[a.level], a.days, a.time, t.sumFocus[a.goal]);
  const week = t.week.map((d, i) => `<div class="wd ${active.has(i) ? "on" : ""}">${d}</div>`).join("");
  const cards = days.map(d => `
    <article class="day">
      <div class="day-head">
        <h3>${t.weekFull[d.weekday]} · ${t.dayType[d.type]}</h3>
        <small>~${total} ${t.min} · ${restText(a)}</small>
      </div>
      <div class="phase">${t.warm}</div>
      <div class="phase-line">${t.warmTxt}</div>
      <div class="phase">${t.main}</div>
      <ol>
        ${d.list.map(ex => `
          <li>
            <div class="ex-top"><span class="ex-name">${ex[lang]}</span><span class="ex-dose">${dose(ex, a)}</span></div>
            <div class="ex-cue">${lang === "th" ? ex.cth : ex.cen}</div>
          </li>`).join("")}
      </ol>
      <div class="phase">${t.cool}</div>
      <div class="phase-line" style="padding-bottom:14px">${t.coolTxt}</div>
    </article>`).join("");

  box.innerHTML = `
    <div class="summary"><span class="ai-badge">AI</span><p>${summary}</p></div>
    <div class="week">${week}</div>
    <div class="days">${cards}</div>
    <p class="note">⚠️ ${t.planNote}</p>
    <div class="plan-actions">
      <button type="button" class="btn" id="saveBtn">${t.savePlan}</button>
      <button type="button" class="btn ghost" id="regen">${t.regen}</button>
      <button type="button" class="btn ghost" id="printBtn">${t.print}</button>
    </div>`;
  $("#saveBtn").onclick = savePlan;
  $("#regen").onclick = () => generate({ ...lastPlan.answers }, false);
  $("#printBtn").onclick = () => window.print();
}

function generate(a, scroll = true) {
  const box = $("#plan");
  box.innerHTML = `<div class="thinking"><span class="dots"><span></span><span></span><span></span></span>${T[lang].thinking}</div>`;
  if (scroll) box.scrollIntoView({ behavior: "smooth", block: "start" });
  setTimeout(() => {
    lastPlan = { answers: a, seed: Math.floor(Math.random() * 1e9) };
    store.set("fs-plan", lastPlan);
    renderPlan();
  }, 900);
}

/* ---------- Form ---------- */
function renderChips() {
  for (const group of Object.keys(OPTIONS)) {
    const wrap = $(`[data-group="${group}"]`);
    wrap.innerHTML = OPTIONS[group].map(v => `
      <label class="chip">
        <input type="radio" name="${group}" value="${v}" ${answers[group] === v ? "checked" : ""}>
        <span>${T[lang][`${group}_${v}`]}</span>
      </label>`).join("");
  }
}
$("#planForm").addEventListener("change", e => {
  if (e.target.name) { answers[e.target.name] = e.target.value; store.set("fs-answers", answers); }
});
$("#planForm").addEventListener("submit", e => { e.preventDefault(); generate({ ...answers }); });
