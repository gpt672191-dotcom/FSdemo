// เช็กความพร้อมก่อนเริ่มออกกำลังกาย (ย่อจากแบบสอบถาม PAR-Q+) — ไม่บังคับ ไม่ส่งข้อมูลไปไหน เก็บในเครื่องนี้ (fs-parq)
// ถ้าตอบ "ใช่" ข้อใดข้อหนึ่ง แนะนำให้ปรึกษาแพทย์ก่อน และเสนอให้ใช้ท่าแรงกระแทกต่ำ (planner.html)

const PQ_T = {
  th: { title: "เช็กความพร้อมก่อนเริ่มออกกำลังกาย", sub: "7 คำถาม ใช้เวลา 1 นาที (จากแบบสอบถามสากล PAR-Q+) ไม่บังคับ ข้อมูลอยู่ในเครื่องนี้เท่านั้น",
    yes: "ใช่", no: "ไม่ใช่", done: "เช็กแล้ว", reset: "ทำใหม่",
    q: ["แพทย์เคยบอกว่าคุณมีโรคหัวใจ หรือความดันโลหิตสูง", "เคยเจ็บหน้าอกขณะพัก ระหว่างทำกิจวัตร หรือขณะออกกำลังกาย",
      "ในช่วง 12 เดือนที่ผ่านมา เคยเวียนหัวจนเสียการทรงตัว หรือหมดสติ", "มีโรคเรื้อรังอื่นที่แพทย์ดูแลอยู่ เช่น เบาหวาน โรคปอด โรคไต",
      "ใช้ยาประจำสำหรับโรคเรื้อรัง", "มีปัญหากระดูก ข้อ หรือกล้ามเนื้อ ที่อาจแย่ลงถ้าออกกำลังกายมากขึ้น",
      "แพทย์เคยบอกให้ออกกำลังกายภายใต้การดูแลเท่านั้น หรือกำลังตั้งครรภ์"],
    ok: "พร้อมเริ่มได้ เริ่มเบาๆ ก่อน แล้วค่อยเพิ่มความหนักทีละน้อย ถ้ารู้สึกผิดปกติให้หยุดทันที",
    see: "ควรปรึกษาแพทย์ก่อนเริ่มออกกำลังกายแบบหนักขึ้น ระหว่างนี้เดินเบาๆ ยืดเหยียด และเลือกท่าแรงกระแทกต่ำได้",
    joint: "เลือกท่าแรงกระแทกต่ำ (ไม่กระโดด) จะช่วยถนอมข้อ ถ้ายังปวดอยู่ควรปรึกษาแพทย์หรือนักกายภาพบำบัด",
    low: "ใช้ท่าแรงกระแทกต่ำในแผน", lowOn: "ตั้งเป็นท่าแรงกระแทกต่ำแล้ว", left: n => `ตอบอีก ${n} ข้อ` },
  en: { title: "Ready to start? Quick health check", sub: "7 questions, about 1 minute (based on the PAR-Q+). Optional, and the answers stay on this device.",
    yes: "Yes", no: "No", done: "Checked", reset: "Start over",
    q: ["Has a doctor ever said you have a heart condition or high blood pressure?", "Do you feel chest pain at rest, during daily activities or when you exercise?",
      "In the past 12 months, have you lost balance because of dizziness, or passed out?", "Do you have another long-term condition a doctor manages, such as diabetes or lung or kidney disease?",
      "Do you take regular medicine for a long-term condition?", "Do you have a bone, joint or muscle problem that could get worse with more activity?",
      "Has a doctor said you should only exercise under supervision, or are you pregnant?"],
    ok: "You're good to start. Begin gently and build up a little at a time. Stop if anything feels wrong.",
    see: "Talk to a doctor before doing harder exercise. Meanwhile, easy walks, stretching and low-impact moves are fine.",
    joint: "Low-impact (no-jump) moves are kinder to your joints. If the pain continues, see a doctor or physiotherapist.",
    low: "Use low-impact moves in my plan", lowOn: "Low-impact moves are on", left: n => `${n} left to answer` }
};

function renderParq() {
  const box = $("#parq"); if (!box) return;
  const tx = PQ_T[lang], ans = store.get("fs-parq", {});
  const answered = tx.q.filter((_, i) => ans[i] === true || ans[i] === false).length, done = answered === tx.q.length;
  const yesMain = [0, 1, 2, 3, 4, 6].some(i => ans[i] === true), yesJoint = ans[5] === true;
  const lowOn = typeof answers !== "undefined" && answers.impact === "low";
  const result = !done ? `<p class="pq-left">${tx.left(tx.q.length - answered)}</p>` :
    `<div class="pq-res ${yesMain ? "warn" : yesJoint ? "mid" : "ok"}">${icon(yesMain ? "alert" : yesJoint ? "heart" : "check")}<span>${yesMain ? tx.see : yesJoint ? tx.joint : tx.ok}</span></div>
     ${yesMain || yesJoint ? `<button type="button" class="btn ${lowOn ? "ghost" : ""} sm" data-pq-low ${lowOn ? "disabled" : ""}>${lowOn ? icon("check") + tx.lowOn : tx.low}</button>` : ""}`;
  const wasOpen = box.querySelector("details") ? box.querySelector("details").open : !done;
  box.innerHTML = `<div class="wrap"><details class="panel pq"${wasOpen ? " open" : ""}>
    <summary><span class="pq-ic">${icon("heart")}</span><span class="pq-t"><b>${tx.title}</b><small>${tx.sub}</small></span>${done ? `<span class="tag ${yesMain ? "" : "acc"}">${tx.done}</span>` : ""}${icon("chevron")}</summary>
    <ol class="pq-list">${tx.q.map((q, i) => `<li><span>${q}</span><div class="seg" role="group" aria-label="${esc(q)}">
      <button type="button" data-pq="${i}" data-v="1" class="${ans[i] === true ? "on" : ""}" aria-pressed="${ans[i] === true}">${tx.yes}</button>
      <button type="button" data-pq="${i}" data-v="0" class="${ans[i] === false ? "on" : ""}" aria-pressed="${ans[i] === false}">${tx.no}</button></div></li>`).join("")}</ol>
    <div class="pq-foot">${result}${answered ? `<button type="button" class="btn ghost sm" data-pq-reset>${tx.reset}</button>` : ""}</div>
  </details></div>`;
}
onRender(renderParq);

document.addEventListener("click", e => {
  const box = $("#parq"); if (!box || !box.contains(e.target)) return;
  const b = e.target.closest("[data-pq]");
  if (b) { const a = store.get("fs-parq", {}); a[b.dataset.pq] = b.dataset.v === "1"; store.set("fs-parq", a); return renderParq(); }
  if (e.target.closest("[data-pq-reset]")) { store.set("fs-parq", {}); return renderParq(); }
  if (e.target.closest("[data-pq-low]") && typeof answers !== "undefined") {
    answers.impact = "low"; store.set("fs-answers", answers);
    renderAll();
  }
});
