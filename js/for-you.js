// หน้าแนะนำ: คำแนะนำจากน้ำหนัก ส่วนสูง อายุ ที่กรอกไว้ (For-you page)
// ใช้กฎง่ายๆ ไม่ได้เรียก AI จริง — ปรับกฎได้ที่ recommend() ด้านล่าง

// Turn a profile into a recommendation
function recommend(p) {
  const b = health.bmi(p.weight, p.height);
  const idx = health.bmiIdx(b);
  const senior = p.age >= 60, teen = p.age < 18;

  // Goal
  let goal, why;
  if (senior && idx < 2) { goal = "flex"; why = "why_senior"; }
  else if (idx >= 2) { goal = "lose"; why = idx === 2 ? "why_over" : "why_obese"; }
  else { goal = "muscle"; why = idx === 0 ? "why_under" : "why_normal"; }

  const lowImpact = idx === 3 || p.age >= 55;

  // Calories (teens never get a deficit; they stay at maintenance)
  const activity = p.activity || 1;
  const tdee = health.bmr(p.weight, p.height, p.age, p.sex) * ACT_FACTORS[activity - 1];
  let kcal = tdee, kcalNote = "rCalNote_keep";
  if (goal === "lose" && !teen) {
    const floor = health.minKcal(p.sex);
    kcal = Math.max(floor, tdee - 500);
    kcalNote = kcal === floor ? "rCalNote_floor" : "rCalNote_lose";
  }
  if (goal === "muscle") { kcal = tdee + 250; kcalNote = "rCalNote_muscle"; }

  // Protein: for higher BMI, base it on the top of the healthy weight range instead of current weight
  const refW = idx >= 2 ? health.ideal(p.height)[1] : p.weight;
  const [pLo, pHi] = goal === "flex" ? [1.0, 1.2] : [1.6, 2.2];

  // Tips
  const tips = ["tipWarm"];
  if (lowImpact) tips.push("tipJoint");
  if (senior) tips.push("tipSenior");
  if (teen) tips.push("tipTeen");
  if (idx === 0) tips.push("tipEat");
  if (idx === 3 || senior) tips.push("tipDoctor");
  tips.push("tipProgress");

  const plan = { goal, level: "beg", days: "3", time: "30",equip: "none", impact: lowImpact ? "low" : "any" };

  return {
    bmi: b, idx, goal, why, lowImpact, activity, plan, tips,
    kcal: round10(kcal), kcalNote,
    protein: [Math.round(refW * pLo), Math.round(refW * pHi)],
    water: (p.weight * 0.033).toFixed(1),
    steps: senior || idx === 3 ? "6,000–8,000" : "7,000–10,000"
  };
}

// Pick 6 bodyweight exercises that fit the goal and joint needs
function pickExercises(r) {
  const cats = { muscle: ["lower", "upper", "core"], lose: ["cardio", "lower", "upper"], flex: ["mobility", "core", "lower"] }[r.goal];
  return cats.flatMap(cat =>
    EX.filter(e => e.cat === cat && e.eq === "none" && !e.adv && !(r.lowImpact && e.jump)).slice(0, 2)
  );
}

function renderForYou() {
  const tx = t(), u = currentUser();
  const p = u && u.profile;
  $("#fyGuest").hidden = !!u;
  $("#fyNoBody").hidden = !u || hasBody(p);
  $("#fyMain").hidden = !u || !hasBody(p);
  $("#fyLead").textContent = u ? tx.rLead(u.name) : tx.rLeadGuest;
  if (!u || !hasBody(p)) return;

  const r = recommend(p);
  const [lo, hi] = health.ideal(p.height).map(x => x.toFixed(1));

  $("#fyGoal").innerHTML = `
    <div class="result-row">
      <div class="result"><small>BMI</small><b>${r.bmi.toFixed(1)}</b> ${tx.bmiCat[r.idx]}</div>
      <div class="result acc"><small>${tx.rGoalTitle}</small><b>${tx[`goal_${r.goal}`]}</b></div>
    </div>
    <p class="hint">${tx[r.why]} · ${tx.idealRange(lo, hi)}</p>`;

  $("#fyNumbers").innerHTML = `
    <div class="result acc"><small>${tx.rCal}</small><b>${r.kcal.toLocaleString()}</b> ${tx.kcal}<small>${tx[r.kcalNote]}</small></div>
    <div class="result"><small>${tx.rProtein}</small><b>${r.protein[0]}–${r.protein[1]}</b> ${tx.gPerDay}</div>
    <div class="result"><small>${tx.rWater}</small><b>${r.water}</b> ${tx.liters}</div>
    <div class="result"><small>${tx.rSteps}</small><b>${r.steps}</b> ${tx.steps}</div>`;

  const sel = $("#fyAct");
  sel.innerHTML = ACT_FACTORS.map((_, i) => `<option value="${i + 1}">${tx[`act_${i + 1}`]}</option>`).join("");
  sel.value = String(r.activity);

  const q = new URLSearchParams(r.plan).toString();
  $("#fyPlan").innerHTML = `
    <p style="margin:0 0 14px">${tx.rPlanDesc(tx[`goal_${r.goal}`], r.plan.days, r.plan.time, r.lowImpact)}</p>
    <a class="btn" href="planner.html?${q}">${tx.rPlanBtn}</a>`;

  $("#fyEx").innerHTML = pickExercises(r).map(e => `
    <div class="ex-card">
      <b>${e[lang]}</b>
      <p>${lang === "th" ? e.cth : e.cen}</p>
      <span class="tag acc">${tx[`part_${e.cat}`].split(" (")[0]}</span>
    </div>`).join("");

  $("#fyTips").innerHTML = r.tips.map(k => `<li>${tx[k]}</li>`).join("");
}
onRender(renderForYou);

$("#fyAct").addEventListener("change", e => {
  updateUser(u => { u.profile = { ...u.profile, activity: +e.target.value }; });
  renderForYou();
});
$("#fyLogin").onclick = () => openAuth("login");
$("#fySignup").onclick = () => openAuth("signup");
