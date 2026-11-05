// แชทโค้ช: ผู้ช่วยตอบอัตโนมัติ (Rule-based chat coach)
// ตอบจากข้อมูลในเว็บ + ข้อมูลร่างกายของผู้ใช้ ไม่ได้เรียก AI จริง และไม่ส่งข้อมูลออกนอกเบราว์เซอร์
// ถ้าจะต่อ AI จริงในอนาคต: แทนที่ฟังก์ชัน reply() ด้วยการเรียก API ผ่านเซิร์ฟเวอร์กลาง (ห้ามใส่ API key ในไฟล์นี้)

const COACH_T = {
  th: {
    title: "โค้ช FitStart", sub: "ผู้ช่วยตอบอัตโนมัติ", open: "ปรึกษาโค้ช", placeholder: "พิมพ์คำถาม เช่น ลดพุงยังไงดี",
    note: "ตอบอัตโนมัติจากข้อมูลในเว็บ ไม่ใช่คำแนะนำทางการแพทย์", clear: "ล้างแชท",
    hello: n => `สวัสดีครับ${n ? " คุณ" + n : ""}! ผมเป็นโค้ชผู้ช่วยของ FitStart ถามเรื่องออกกำลังกาย อาหาร หรือท่าต่างๆ ได้เลยครับ`,
    chips: ["BMI ของฉัน", "ควรกินกี่แคลอรี่", "ลดพุงยังไง", "ท่าสร้างกล้ามอก", "เริ่มยังไงดี", "ออกกำลังกายที่บ้าน"],
    askBody: "บอกส่วนสูง (ซม.) และน้ำหนัก (กก.) มาได้เลยครับ เช่น \"170 65\" หรือสมัครสมาชิกแล้วกรอกข้อมูลไว้ ผมจะจำให้",
    bmi: (b, cat, lo, hi) => `BMI ของคุณคือ <b>${b}</b> อยู่ในเกณฑ์ <b>${cat}</b> (เกณฑ์คนเอเชีย)<br>น้ำหนักที่เหมาะกับส่วนสูงนี้คือ ${lo}–${hi} กก.`,
    kcal: (bmr, tdee, lose) => `ร่างกายคุณใช้พลังงานประมาณ <b>${tdee} kcal/วัน</b> (พลังงานพื้นฐาน ${bmr})<br>ถ้าอยากลดน้ำหนัก กินประมาณ <b>${lose} kcal/วัน</b> จะลดได้ราว 0.25–0.5 กก./สัปดาห์`,
    kcalNeed: "ต้องรู้เพศ อายุ ส่วนสูง น้ำหนักก่อนครับ กรอกในหน้าข้อมูลส่วนตัว หรือใช้เครื่องคำนวณในหน้าลดน้ำหนักได้เลย",
    protein: (lo, hi, w) => `สำหรับน้ำหนัก ${w} กก. ควรกินโปรตีนประมาณ <b>${lo}–${hi} กรัม/วัน</b> แบ่งกินทุกมื้อ เช่น อกไก่ ไข่ ปลา นม เต้าหู้`,
    proteinNeed: "บอกน้ำหนักตัวมาได้เลยครับ เช่น \"น้ำหนัก 60\" ผมจะคำนวณโปรตีนให้",
    lose: "ลดน้ำหนักให้ได้ผล ทำ 4 อย่างนี้ครับ<br>1. กินน้อยกว่าที่ใช้ประมาณ 300–500 kcal/วัน<br>2. ฝึกแรงต้าน 2–3 วัน/สัปดาห์ เพื่อรักษากล้าม<br>3. เดินให้ได้ 7,000–10,000 ก้าว/วัน<br>4. นอน 7–9 ชั่วโมง<br>ลดพุงเฉพาะจุดไม่ได้นะครับ ต้องลดไขมันทั้งตัว",
    muscle: "สร้างกล้ามให้ได้ผล:<br>1. ฝึกแรงต้าน 8–12 ครั้งต่อเซ็ต ครั้งสุดท้ายต้องรู้สึกหนัก<br>2. ฝึกแต่ละส่วน 2 ครั้ง/สัปดาห์<br>3. กินโปรตีน 1.6–2.2 กรัม ต่อน้ำหนักตัว 1 กก.<br>4. เพิ่มน้ำหนักหรือจำนวนครั้งทีละนิด",
    group: g => `ท่าแนะนำสำหรับ<b>${g}</b>ครับ (เริ่มจากท่าไม่ใช้อุปกรณ์):`,
    exInfo: (n, cue, ms, eq, dose) => `<b>${n}</b><br>วิธีทำ: ${cue}<br>กล้ามเนื้อที่ใช้: ${ms}<br>อุปกรณ์: ${eq} · ${dose}`,
    home: "ท่าที่ทำที่บ้านได้ ไม่ต้องใช้อุปกรณ์ครับ ลองสร้างแผนแบบ \"ไม่มีอุปกรณ์\" ได้ด้วย",
    start: "เริ่มแบบนี้ครับ:<br>1. เริ่ม 2–3 วัน/สัปดาห์ ครั้งละ 15–30 นาที<br>2. เน้นท่าถูกต้องก่อน ยังไม่ต้องหนัก<br>3. วอร์มอัพ 5 นาทีทุกครั้ง<br>4. ให้ AI จัดแผนให้ แล้วทำตามไปทีละสัปดาห์",
    busy: "เวลาน้อยก็ได้ผลครับ ลองวงจร 15 นาที: สควอท วิดพื้น เมาเทนไคลม์เบอร์ แพลงก์ ทำท่าละ 40 วินาที พัก 20 วินาที วน 3 รอบ",
    pain: "ถ้าเจ็บแปลบ บวม หรือปวดข้อ <b>ให้หยุดทันที</b> และพักครับ ถ้าไม่ดีขึ้นใน 2–3 วัน หรือปวดมาก ควรพบแพทย์<br>ส่วนอาการเมื่อย 1–3 วันหลังออกกำลังกายเป็นเรื่องปกติ",
    sleep: "พักผ่อนสำคัญมากครับ กล้ามเนื้อซ่อมแซมตอนพัก นอน 7–9 ชั่วโมง และดื่มน้ำประมาณ 30–35 มล. ต่อน้ำหนักตัว 1 กก. ต่อวัน",
    food: "กินให้ครบหมู่ เน้นโปรตีนทุกมื้อ ผักครึ่งจาน ข้าวหรือแป้งพอประมาณ ลดของทอด ของหวาน และน้ำหวานครับ",
    plan: "ให้ AI จัดตารางออกกำลังกายให้ได้เลยครับ เลือกเป้าหมาย วัน เวลา อุปกรณ์ แล้วกดสร้างแผน",
    thanks: "ยินดีครับ! สู้ๆ นะครับ มีอะไรถามได้ตลอด",
    fallback: "ขอโทษครับ ผมยังตอบเรื่องนี้ไม่ได้ ลองถามเรื่องเหล่านี้ดูนะครับ",
    linkMuscle: "หน้าสร้างกล้าม", linkLose: "หน้าลดน้ำหนัก", linkPlan: "สร้างแผน", linkBmi: "คำนวณ BMI", linkProfile: "ข้อมูลส่วนตัว", linkMore: "เคล็ดลับ"
  },
  en: {
    title: "FitStart Coach", sub: "Automatic helper", open: "Ask the coach", placeholder: "Ask something, e.g. how to lose belly fat",
    note: "Automatic answers from this site. Not medical advice.", clear: "Clear chat",
    hello: n => `Hi${n ? " " + n : ""}! I'm FitStart's coach helper. Ask me about workouts, food or any exercise.`,
    chips: ["My BMI", "How many calories?", "Lose belly fat", "Chest exercises", "How do I start?", "Home workout"],
    askBody: "Tell me your height (cm) and weight (kg), e.g. \"170 65\". Or sign up and fill in your profile so I remember.",
    bmi: (b, cat, lo, hi) => `Your BMI is <b>${b}</b>, which is <b>${cat}</b> (Asian cut-offs).<br>A healthy weight for your height is ${lo}–${hi} kg.`,
    kcal: (bmr, tdee, lose) => `You burn about <b>${tdee} kcal/day</b> (base ${bmr}).<br>To lose weight, eat about <b>${lose} kcal/day</b> for roughly 0.25–0.5 kg per week.`,
    kcalNeed: "I need your sex, age, height and weight first. Fill in your profile, or use the calculator on the Lose weight page.",
    protein: (lo, hi, w) => `At ${w} kg, aim for about <b>${lo}–${hi} g of protein a day</b>, spread over your meals: chicken, eggs, fish, milk, tofu.`,
    proteinNeed: "Tell me your weight, e.g. \"weight 60\", and I'll work out your protein.",
    lose: "To lose weight, do these 4 things:<br>1. Eat 300–500 kcal/day less than you burn<br>2. Strength train 2–3 days/week to keep muscle<br>3. Walk 7,000–10,000 steps a day<br>4. Sleep 7–9 hours<br>You can't spot-reduce belly fat; you lose fat all over.",
    muscle: "To build muscle:<br>1. Lift for 8–12 reps per set, with the last rep hard<br>2. Train each muscle twice a week<br>3. Eat 1.6–2.2 g protein per kg of body weight<br>4. Add a little weight or reps over time",
    group: g => `Recommended <b>${g}</b> exercises (no-equipment ones first):`,
    exInfo: (n, cue, ms, eq, dose) => `<b>${n}</b><br>How: ${cue}<br>Muscles: ${ms}<br>Equipment: ${eq} · ${dose}`,
    home: "Here are moves you can do at home with no equipment. You can also build a no-equipment plan.",
    start: "Start like this:<br>1. 2–3 days a week, 15–30 minutes each<br>2. Focus on good form before going heavy<br>3. Warm up for 5 minutes every time<br>4. Let AI build your plan, then follow it week by week",
    busy: "Short on time? Try a 15-minute circuit: squat, push-up, mountain climbers, plank. 40 s on, 20 s rest, 3 rounds.",
    pain: "If you feel sharp pain, swelling or joint pain, <b>stop right away</b> and rest. If it isn't better in 2–3 days or it's severe, see a doctor.<br>Muscle soreness for 1–3 days after training is normal.",
    sleep: "Rest matters: muscles repair while you sleep. Get 7–9 hours, and drink about 30–35 ml of water per kg of body weight a day.",
    food: "Eat balanced meals: protein every meal, half a plate of veg, a moderate portion of rice or carbs, and less fried food, sweets and sugary drinks.",
    plan: "Let AI build your workout schedule: pick your goal, days, time and equipment, then press generate.",
    thanks: "You're welcome! Keep going, and ask me anytime.",
    fallback: "Sorry, I can't answer that yet. Try one of these:",
    linkMuscle: "Build muscle page", linkLose: "Lose weight page", linkPlan: "Build a plan", linkBmi: "BMI calculator", linkProfile: "My profile", linkMore: "Tips"
  }
};
const ct = () => COACH_T[lang];

/* ---------------- The coach's "brain" ---------------- */
const KW = {
  pain: ["ปวด", "เจ็บ", "บาดเจ็บ", "บวม", "pain", "hurt", "injur", "sore"],
  hello: ["สวัสดี", "หวัดดี", "ดีครับ", "ดีค่ะ", "hello", "hi ", "hey"],
  thanks: ["ขอบคุณ", "ขอบใจ", "thank", "thx"],
  bmi: ["bmi", "บีเอ็มไอ", "ดัชนีมวล", "อ้วนไหม", "อ้วนมั้ย", "น้ำหนักเกิน"],
  kcal: ["แคล", "kcal", "calorie", "พลังงาน", "tdee", "bmr", "กินเท่าไหร่", "กินเท่าไร"],
  protein: ["โปรตีน", "protein", "เวย์", "whey"],
  lose: ["ลดน้ำหนัก", "ลดพุง", "ลดไขมัน", "น้ำหนักขึ้น", "อ้วน", "พุง", "ผอม", "lose", "fat", "belly", "slim", "weight gain"],
  muscle: ["สร้างกล้าม", "เพิ่มกล้าม", "กล้ามโต", "build muscle", "gain muscle", "bulk"],
  home: ["ที่บ้าน", "ไม่มีอุปกรณ์", "ไม่มีเครื่อง", "home", "no equipment", "bodyweight"],
  start: ["เริ่ม", "มือใหม่", "ไม่เคย", "start", "beginner", "new to"],
  busy: ["ไม่มีเวลา", "เวลาน้อย", "ยุ่ง", "busy", "no time", "quick"],
  sleep: ["นอน", "พักผ่อน", "ดื่มน้ำ", "กินน้ำ", "sleep", "rest", "water"],
  food: ["อาหาร", "กินอะไร", "เมนู", "food", "diet", "eat", "meal"],
  plan: ["แผน", "ตาราง", "plan", "schedule", "program"]
};
const GROUP_KW = {
  chest: ["อก", "chest", "pec"], back: ["หลัง", "back", "lat"], shoulders: ["ไหล่", "shoulder", "delt"],
  arms: ["แขน", "arm", "bicep", "tricep", "ไบเซ็ป", "ไทรเซ็ป"], legs: ["ขา", "ต้นขา", "น่อง", "leg", "thigh", "calf"],
  glutes: ["ก้น", "สะโพก", "glute", "butt", "hip"], core: ["หน้าท้อง", "ซิกแพ็ก", "abs", "core", "six pack", "sixpack"]
};
const has = (m, list) => list.some(k => m.includes(k));

// Remember what we last asked, so "170 65" after "BMI?" is understood
let coachWaiting = null;

function bodyFrom(u) { return u && hasBody(u.profile) ? u.profile : null; }

function exCard(ids) { return ids.slice(0, 4); }

function reply(raw) {
  const tx = ct(), m = " " + raw.toLowerCase().trim() + " ";
  const u = currentUser(), p = bodyFrom(u);
  const nums = (raw.match(/\d+(\.\d+)?/g) || []).map(Number);
  const links = (...ls) => ls.map(([href, label]) => ({ href, label }));

  // Numbers after we asked for height/weight
  if (coachWaiting === "bmi" && nums.length >= 2) {
    coachWaiting = null;
    let h = nums.find(n => n >= 100 && n <= 230), w = nums.find(n => n !== h && n >= 25 && n <= 250);
    if (h && w) return bmiAnswer(h, w);
  }
  if (coachWaiting === "protein" && nums.length) {
    coachWaiting = null;
    const w = nums.find(n => n >= 25 && n <= 250);
    if (w) return proteinAnswer(w);
  }

  if (has(m, KW.pain)) return { text: tx.pain, links: links(["more.html#faq", tx.linkMore]) };
  if (has(m, KW.thanks)) return { text: tx.thanks };
  if (has(m, KW.bmi)) {
    if (p) return bmiAnswer(p.height, p.weight);
    const h = nums.find(n => n >= 100 && n <= 230), w = nums.find(n => n !== h && n >= 25 && n <= 250);
    if (h && w) return bmiAnswer(h, w);
    coachWaiting = "bmi";
    return { text: tx.askBody, links: links(["bmi.html", tx.linkBmi]) };
  }
  if (has(m, KW.kcal)) {
    if (!p) return { text: tx.kcalNeed, links: links(["weight-loss.html", tx.linkLose], ["profile.html", tx.linkProfile]) };
    const bmr = health.bmr(p.weight, p.height, p.age, p.sex), tdee = bmr * ACT_FACTORS[(p.activity || 1) - 1];
    return { text: tx.kcal(round10(bmr), round10(tdee), round10(Math.max(health.minKcal(p.sex), tdee - 500))), links: links(["for-you.html", t().navForYou]) };
  }
  if (has(m, KW.protein)) {
    if (p) return proteinAnswer(p.weight);
    const w = nums.find(n => n >= 25 && n <= 250);
    if (w) return proteinAnswer(w);
    coachWaiting = "protein";
    return { text: tx.proteinNeed };
  }

  // A specific exercise by name (longest match wins)
  const hit = EX.map(e => {
    const names = [e.th.split(" (")[0], e.en].map(s => s.toLowerCase());
    const n = names.find(s => s.length > 2 && m.includes(s));
    return n ? { e, len: n.length } : null;
  }).filter(Boolean).sort((a, b) => b.len - a.len)[0];
  if (hit) {
    const e = hit.e, T0 = t();
    const ms = (MUSCLES[e.id] || []).map(g => T0[`mg_${g}`]).join(", ") || T0[`part_${e.cat}`];
    const dose = e.timed ? T0.mgDoseTimed : T0.mgDose;
    return { text: tx.exInfo(e[lang], lang === "th" ? e.cth : e.cen, ms, T0[`equip_${e.eq}`], dose), ex: [e.id] };
  }

  if (has(m, KW.lose)) return { text: tx.lose, links: links(["weight-loss.html", tx.linkLose], ["planner.html?goal=lose", tx.linkPlan]) };

  // A muscle group
  const g = Object.keys(GROUP_KW).find(k => has(m, GROUP_KW[k]));
  if (g) {
    const list = EX.filter(e => (MUSCLES[e.id] || [])[0] === g).sort((a, b) => (a.eq === "none" ? 0 : 1) - (b.eq === "none" ? 0 : 1));
    return { text: tx.group(t()[`mg_${g}`]), ex: exCard(list.map(e => e.id)), links: links([`muscle.html#${g}`, tx.linkMuscle]) };
  }
  if (has(m, KW.muscle)) return { text: tx.muscle, links: links(["muscle.html", tx.linkMuscle], ["planner.html?goal=muscle", tx.linkPlan]) };
  if (has(m, KW.home)) return { text: tx.home, ex: ["squat", "pushup", "bridge", "plank"], links: links(["planner.html?equip=none", tx.linkPlan]) };
  if (has(m, KW.busy)) return { text: tx.busy, ex: ["squat", "pushup", "climber", "plank"] };
  if (has(m, KW.start)) return { text: tx.start, links: links(["planner.html", tx.linkPlan]) };
  if (has(m, KW.food)) return { text: tx.food, links: links(["weight-loss.html", tx.linkLose]) };
  if (has(m, KW.sleep)) return { text: tx.sleep };
  if (has(m, KW.plan)) return { text: tx.plan, links: links(["planner.html", tx.linkPlan]) };
  if (has(m, KW.hello)) return { text: tx.hello(u && u.name), chips: tx.chips };
  return { text: tx.fallback, chips: tx.chips };

  function bmiAnswer(h, w) {
    const b = health.bmi(w, h), [lo, hi] = health.ideal(h).map(x => x.toFixed(1));
    return { text: tx.bmi(b.toFixed(1), t().bmiCat[health.bmiIdx(b)], lo, hi), links: links(["for-you.html", t().navForYou]) };
  }
  function proteinAnswer(w) {
    return { text: tx.protein(Math.round(w * 1.6), Math.round(w * 2.2), w), links: links(["muscle.html", tx.linkMuscle]) };
  }
}

/* ---------------- Chat window ---------------- */
document.body.insertAdjacentHTML("beforeend", `
<button type="button" class="coach-fab" id="coachFab" aria-controls="coachPanel" aria-expanded="false">
  ${icon("chat")}<span id="coachFabTxt"></span>
</button>
<section class="coach" id="coachPanel" hidden aria-label="Chat">
  <div class="coach-head">
    <img src="img/logo.svg" alt="" width="36" height="36">
    <div class="coach-who"><b id="coachTitle"></b><small><i class="coach-dot"></i><span id="coachSub"></span></small></div>
    <button type="button" class="coach-x" id="coachClear" title="">${icon("refresh")}</button>
    <button type="button" class="coach-x" id="coachClose" aria-label="Close">${icon("close")}</button>
  </div>
  <div class="coach-log" id="coachLog" aria-live="polite"></div>
  <div class="coach-chips" id="coachChips"></div>
  <form class="coach-input" id="coachForm" autocomplete="off">
    <input id="coachIn" type="text" maxlength="200">
    <button type="submit" class="coach-send" aria-label="Send">${icon("send")}</button>
  </form>
  <p class="coach-note" id="coachNote"></p>
</section>`);

const coachLog = $("#coachLog");
let coachHistory = (() => { try { return JSON.parse(sessionStorage.getItem("fs-coach") || "[]"); } catch { return []; } })();
const saveHistory = () => { try { sessionStorage.setItem("fs-coach", JSON.stringify(coachHistory.slice(-40))); } catch {} };

function bubbleHTML(msg) {
  if (msg.who === "me") return `<div class="cm me">${esc(msg.text)}</div>`;
  const r = msg.r;
  const ex = (r.ex || []).map(id => {
    const e = EX.find(x => x.id === id);
    return e ? `<div class="cm-ex"><div class="fig" data-fig="${e.id}"></div><span>${e[lang]}</span></div>` : "";
  }).join("");
  const links = (r.links || []).map(l => `<a class="cm-link" href="${l.href}">${l.label} →</a>`).join("");
  return `<div class="cm bot"><div>${r.text}</div>${ex ? `<div class="cm-exs">${ex}</div>` : ""}${links ? `<div class="cm-links">${links}</div>` : ""}</div>`;
}

function drawLog() {
  coachLog.innerHTML = coachHistory.map(bubbleHTML).join("");
  coachLog.scrollTop = coachLog.scrollHeight;
  const last = [...coachHistory].reverse().find(x => x.who === "bot");
  const chips = (last && last.r.chips) || ct().chips;
  $("#coachChips").innerHTML = chips.map(c => `<button type="button" class="coach-chip">${esc(c)}</button>`).join("");
}

function greet() {
  const u = currentUser();
  coachHistory = [{ who: "bot", r: { text: ct().hello(u && u.name), chips: ct().chips } }];
  saveHistory(); drawLog();
}

function ask(text) {
  text = text.trim();
  if (!text) return;
  coachHistory.push({ who: "me", text });
  drawLog();
  coachLog.insertAdjacentHTML("beforeend", '<div class="cm bot typing"><span></span><span></span><span></span></div>');
  coachLog.scrollTop = coachLog.scrollHeight;
  setTimeout(() => {
    coachHistory.push({ who: "bot", r: reply(text) });
    saveHistory(); drawLog();
  }, 550);
}

function setOpen(open) {
  $("#coachPanel").hidden = !open;
  $("#coachFab").setAttribute("aria-expanded", open);
  document.body.classList.toggle("coach-open", open);
  if (open) {
    if (!coachHistory.length) greet(); else drawLog();
    setTimeout(() => $("#coachIn").focus(), 50);
  }
}

$("#coachFab").onclick = () => setOpen($("#coachPanel").hidden);
$("#coachClose").onclick = () => setOpen(false);
$("#coachClear").onclick = () => { coachWaiting = null; greet(); };
$("#coachForm").addEventListener("submit", e => { e.preventDefault(); const v = $("#coachIn").value; $("#coachIn").value = ""; ask(v); });
$("#coachChips").addEventListener("click", e => { const b = e.target.closest(".coach-chip"); if (b) ask(b.textContent); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#coachPanel").hidden) setOpen(false); });

onRender(() => {
  const tx = ct();
  $("#coachFabTxt").textContent = tx.open;
  $("#coachFab").setAttribute("aria-label", tx.open);
  $("#coachTitle").textContent = tx.title;
  $("#coachSub").textContent = tx.sub;
  $("#coachIn").placeholder = tx.placeholder;
  $("#coachNote").textContent = tx.note;
  $("#coachClear").title = tx.clear; $("#coachClear").setAttribute("aria-label", tx.clear);
  if (!$("#coachPanel").hidden) drawLog();
});
