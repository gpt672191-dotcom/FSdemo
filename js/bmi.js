// หน้าคำนวณ BMI (BMI page) — ใช้เกณฑ์คนเอเชีย WHO Asia-Pacific

const BMI_LINKS = ["muscle.html", "planner.html", "weight-loss.html", "weight-loss.html"];

function renderBMI() {
  const tx = t(), h = num("h", 100, 230), w = num("w", 25, 250), out = $("#bmiOut");
  if (isNaN(h) || isNaN(w)) { out.innerHTML = `<span style="color:var(--muted)">${tx.bmiEmpty}</span>`; return; }
  const m = h / 100;
  const bmi = w / (m * m);
  const idx = bmi < 18.5 ? 0 : bmi < 23 ? 1 : bmi < 25 ? 2 : 3;
  // Map BMI 14–34 onto the bar
  const pos = Math.min(100, Math.max(0, (bmi - 14) / 20 * 100));
  const lo = (18.5 * m * m).toFixed(1), hi = (22.9 * m * m).toFixed(1);
  out.innerHTML = `
    <b>${bmi.toFixed(1)}</b> · ${tx.bmiCat[idx]}
    <div class="bmi-bar"><i style="left:${pos}%"></i></div>
    <div style="color:var(--muted);font-size:.92rem">${tx.bmiAdvice[idx]}</div>
    <p style="margin:10px 0 0;font-size:.92rem">${tx.idealRange(lo, hi)}</p>
    ${teenNote()}
    ${pathHTML(w, +lo, +hi)}
    <p style="margin:10px 0 0"><a href="${BMI_LINKS[idx]}" style="color:var(--accent);font-weight:600;text-decoration:none">${tx.bmiLink[idx]}</a></p>`;
}

/* ---------- Under 18: adult BMI cut-offs don't fit a growing body ---------- */
const TEEN_T = {
  th: (a, any) => `${any ? "ถ้าอายุต่ำกว่า 18 ปี" : `คุณอายุ ${a} ปี`}: เกณฑ์ BMI ข้างบนเป็นของผู้ใหญ่ วัยรุ่นร่างกายยังโตอยู่ ต้องดูเทียบกับอายุและเพศ (กราฟ BMI ตามอายุของ WHO) ใช้ผลนี้เป็นแนวทางคร่าวๆ อย่าอดอาหารเพื่อลดน้ำหนัก ถ้ากังวลปรึกษาครูพยาบาลหรือแพทย์`,
  en: (a, any) => `${any ? "If you are under 18" : `You are ${a}`}: the cut-offs above are for adults. Teens are still growing, so BMI has to be compared by age and sex (WHO BMI-for-age charts). Use this result as a rough guide only, don't diet hard to lose weight, and talk to a school nurse or doctor if you're worried.`
};
function teenNote() {
  const u = typeof currentUser === "function" && currentUser(), age = u && u.profile && +u.profile.age;
  if (age && age >= 18) return "";
  // logged in and under 18: always shown; not logged in (age unknown): shown as a general note
  return `<p class="teen-note">${icon("alert")}<span>${TEEN_T[lang](age, !age)}</span></p>`;
}

/* ---------- Path to a healthy weight: how many kg and how long at a safe pace ---------- */
// Safe pace: lose 0.25–0.5 kg a week; gain 0.25–0.5 kg a week (with strength training)
const PATH_T = {
  th: { title: "เส้นทางสู่น้ำหนักที่เหมาะสม", in: "น้ำหนักอยู่ในช่วงที่เหมาะสมแล้ว เป้าหมายคือรักษาไว้ ออกกำลังกายสม่ำเสมอและกินให้สมดุล",
    lose: (kg, a, b) => `ลดอีกประมาณ <b>${kg} กก.</b> จะถึงช่วงที่เหมาะสม ในจังหวะที่ปลอดภัย (0.25–0.5 กก./สัปดาห์) ใช้เวลาประมาณ <b>${a}–${b} สัปดาห์</b>`,
    gain: (kg, a, b) => `เพิ่มอีกประมาณ <b>${kg} กก.</b> จะถึงช่วงที่เหมาะสม แนะนำเพิ่มช้าๆ (0.25–0.5 กก./สัปดาห์) พร้อมฝึกสร้างกล้าม ใช้เวลาประมาณ <b>${a}–${b} สัปดาห์</b>`,
    first: kg => `ก้าวแรก: ลด 5% ของน้ำหนักตัว (${kg} กก.) ก็ช่วยสุขภาพได้แล้ว`,
    planLose: "สร้างแผนลดน้ำหนัก", planGain: "สร้างแผนเพิ่มกล้าม", planKeep: "สร้างแผนรักษาสุขภาพ", note: "ตัวเลขเป็นค่าประมาณ ใช้เป็นแนวทาง ไม่ใช่คำแนะนำทางการแพทย์" },
  en: { title: "Path to a healthy weight", in: "You're in the healthy range. The goal is to stay there with regular exercise and balanced meals.",
    lose: (kg, a, b) => `About <b>${kg} kg</b> to lose to reach the healthy range. At a safe pace (0.25–0.5 kg a week) that's roughly <b>${a}–${b} weeks</b>.`,
    gain: (kg, a, b) => `About <b>${kg} kg</b> to gain to reach the healthy range. Go slowly (0.25–0.5 kg a week) with strength training: roughly <b>${a}–${b} weeks</b>.`,
    first: kg => `First step: losing 5% of your weight (${kg} kg) already helps your health.`,
    planLose: "Make a weight-loss plan", planGain: "Make a muscle plan", planKeep: "Make a stay-healthy plan", note: "Estimates only, not medical advice." }
};
function pathHTML(w, lo, hi) {
  const tx = PATH_T[lang];
  let body, link;
  if (w > hi) {
    const kg = Math.round((w - hi) * 10) / 10;
    body = tx.lose(kg, Math.ceil(kg / 0.5), Math.ceil(kg / 0.25)) + (kg > 5 ? `<br><small>${tx.first(Math.round(w * 0.05 * 10) / 10)}</small>` : "");
    link = `<a class="btn sm" href="planner.html?goal=lose">${icon("sparkle")}${tx.planLose}</a>`;
  } else if (w < lo) {
    const kg = Math.round((lo - w) * 10) / 10;
    body = tx.gain(kg, Math.ceil(kg / 0.5), Math.ceil(kg / 0.25));
    link = `<a class="btn sm" href="planner.html?goal=muscle">${icon("sparkle")}${tx.planGain}</a>`;
  } else {
    body = tx.in;
    link = `<a class="btn ghost sm" href="planner.html?goal=endure">${icon("sparkle")}${tx.planKeep}</a>`;
  }
  return `<div class="bmi-path"><b class="bmi-path-t">${icon("trending")}${tx.title}</b><p>${body}</p>${link}<small class="bmi-path-n">${tx.note}</small></div>`;
}

function renderBmiTable() {
  const tx = t();
  const rows = [
    ["#60a5fa", "< 18.5"], ["#22c55e", "18.5 – 22.9"], ["#f59e0b", "23 – 24.9"], ["#ef4444", "≥ 25"]
  ];
  $("#bmiTable").innerHTML = rows.map(([c, r], i) =>
    `<tr><td><span class="dot" style="background:${c}"></span>${tx.bmiCat[i]}</td><td style="text-align:right">${r}</td></tr>`
  ).join("");
}

// Prefill from the logged-in user's profile, if any
{
  const u = currentUser();
  if (u && hasBody(u.profile)) { $("#h").value = u.profile.height; $("#w").value = u.profile.weight; }
}

$("#h").addEventListener("input", renderBMI);
$("#w").addEventListener("input", renderBMI);
onRender(renderBMI);
onRender(renderBmiTable);
