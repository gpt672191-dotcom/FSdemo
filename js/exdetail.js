// กดการ์ดท่าออกกำลังกาย -> หน้าต่างรายละเอียด: ตัวละครขนาดใหญ่ วิธีทำ จำนวนเซ็ต กล้ามเนื้อที่ใช้ ข้อควรระวัง
// (Exercise detail window; works on any page that shows .ex-card with a .fig[data-fig])

const XD = {
  th: { open: n => `ดูรายละเอียดท่า ${n}`, how: "วิธีทำ", dose: "จำนวนที่แนะนำสำหรับมือใหม่", works: "กล้ามเนื้อที่ใช้",
    tips: "เคล็ดลับ", tip1: "หายใจออกตอนออกแรง หายใจเข้าตอนผ่อน", tip2: "ทำช้าๆ คุมจังหวะ ดีกว่าทำเร็วแต่ท่าผิด", tip3: "ถ้าเจ็บหรือปวดผิดปกติ ให้หยุดทันที",
    jump: "ท่านี้มีการกระโดด ถ้ามีปัญหาเข่าหรือน้ำหนักมาก ให้เลือกท่าที่ไม่กระโดดแทน", adv: "ท่านี้เหมาะกับคนที่ฝึกมาสักพักแล้ว มือใหม่ลองท่าง่ายก่อน",
    timer: "เปิดตัวจับเวลา", close: "ปิด", mistakes: "ข้อผิดพลาดที่พบบ่อย", steps: "ปรับระดับท่า", easier: "ง่ายลง", harder: "ยากขึ้น", fav: "เพิ่มเป็นท่าโปรด", unfav: "ท่าโปรดแล้ว", favAdded: "เพิ่มในท่าโปรดแล้ว ดูได้ที่หน้าข้อมูลส่วนตัว", favRemoved: "นำออกจากท่าโปรดแล้ว", favLogin: "เข้าสู่ระบบเพื่อเก็บท่าโปรด" },
  en: { open: n => `Show details for ${n}`, how: "How to do it", dose: "Beginner amount", works: "Muscles worked",
    tips: "Tips", tip1: "Breathe out as you push, in as you return", tip2: "Slow and controlled beats fast with bad form", tip3: "Stop right away if something hurts",
    jump: "This move has jumping. If your knees hurt or you carry extra weight, pick a no-jump move instead.", adv: "Best after a few weeks of training. Beginners can start with an easier move.",
    timer: "Open the timer", close: "Close", mistakes: "Common mistakes", steps: "Make it easier or harder", easier: "Easier", harder: "Harder", fav: "Add to favourites", unfav: "In favourites", favAdded: "Added to favourites. See them on your profile.", favRemoved: "Removed from favourites", favLogin: "Log in to save favourites" }
};
const xd = () => XD[lang];

document.body.insertAdjacentHTML("beforeend", `<dialog class="xd" id="xdDlg" aria-labelledby="xdName">
  <button type="button" class="xd-x" id="xdX"></button>
  <div class="xd-body" id="xdBody"></div>
</dialog>`);

const exById = id => EX.find(e => e.id === id);

// Common mistakes per body area, and easier / harder versions of a move
const XD_MISTAKES = {
  th: { lower: ["เข่าหุบเข้าด้านใน ให้เข่าชี้ทางเดียวกับปลายเท้า", "ส้นเท้ายกขึ้น ให้น้ำหนักอยู่กลางเท้าถึงส้นเท้า", "หลังงอ ให้อกเปิด หลังตรง"],
        upper: ["ยักไหล่ขึ้นหาหู ให้ไหล่ลงต่ำและผ่อนคลาย", "ใช้แรงเหวี่ยง ให้ทำช้าๆ คุมทั้งขึ้นและลง", "ทำไม่สุดช่วง ทำให้ได้ผลน้อยลง"],
        core: ["แอ่นหลังล่าง ให้เกร็งหน้าท้องดึงสะดือเข้า", "กลั้นหายใจ ให้หายใจต่อเนื่อง", "ดึงคอหรือก้มหน้าเกินไป ให้คอเป็นแนวเดียวกับหลัง"],
        cardio: ["ลงเท้าแรงทั้งฝ่าเท้า ให้ลงเบาๆ ด้วยปลายเท้าแล้วตามด้วยส้น", "ก้มหลังเวลาเหนื่อย ให้ยืดอกขึ้น", "เร่งเร็วจนท่าเสีย ช้าลงได้ ท่าถูกสำคัญกว่า"],
        mobility: ["เด้งตัวเพื่อให้ยืดได้ไกลขึ้น ให้ค้างนิ่งแทน", "ยืดจนเจ็บ ควรรู้สึกตึงพอดี ไม่เจ็บ", "กลั้นหายใจ ให้หายใจยาวๆ ช่วยให้กล้ามคลาย"] },
  en: { lower: ["Knees caving in: keep knees pointing the same way as your toes", "Heels lifting: keep your weight mid-foot to heel", "Rounded back: chest up, back straight"],
        upper: ["Shrugging: keep your shoulders down and relaxed", "Swinging: move slowly and control both directions", "Half reps: use the full range for better results"],
        core: ["Arching the lower back: brace your belly", "Holding your breath: keep breathing", "Pulling on the neck: keep it in line with your back"],
        cardio: ["Landing flat and hard: land softly, toes first", "Hunching when tired: lift your chest", "Rushing until form breaks: slow down, form first"],
        mobility: ["Bouncing to go further: hold still instead", "Stretching into pain: aim for a gentle pull", "Holding your breath: long breaths help muscles relax"] }
};
const XD_STEPS = { // id: [easier, harder]
  pushup: [["inclinepush"], ["pikepush", "dip"]], inclinepush: [[], ["pushup"]], pikepush: [["pushup"], []], dip: [["inclinepush"], []],
  squat: [["wallsit"], ["lunge", "jsquat"]], wallsit: [[], ["squat"]], lunge: [["squat"], ["jsquat", "skater"]], jsquat: [["squat"], []],
  bridge: [[], ["hipthrust", "kickback"]], hipthrust: [["bridge"], []], plank: [["birddog", "deadbug"], ["shouldertap", "sideplank"]],
  sideplank: [["plank"], []], shouldertap: [["plank"], ["climber"]], crunch: [["deadbug"], ["legraise"]], legraise: [["crunch"], []],
  deadbug: [[], ["crunch", "plank"]], birddog: [[], ["plank"]], jj: [["stepjack"], ["burpee"]], stepjack: [[], ["jj"]],
  march: [[], ["highknee"]], highknee: [["march"], ["climber"]], climber: [["shouldertap"], ["burpee"]], burpee: [["climber", "squat"], []],
  skater: [["lunge"], []], superman: [[], ["birddog"]]
};
function xdSteps(e) {
  if (XD_STEPS[e.id]) return XD_STEPS[e.id].map(l => l.map(exById).filter(Boolean));
  // otherwise: same main muscle and equipment; easier = not hard, harder = hard (jump / intermediate)
  const main = ((typeof MUSCLES !== "undefined" && MUSCLES[e.id]) || [])[0], hard = x => !!(x.adv || x.jump);
  const same = EX.filter(x => x.id !== e.id && x.eq === e.eq && (main ? ((typeof MUSCLES !== "undefined" && MUSCLES[x.id]) || [])[0] === main : x.cat === e.cat));
  return hard(e) ? [same.filter(x => !hard(x)).slice(0, 2), []] : [[], same.filter(hard).slice(0, 2)];
}

// Favourite moves (user.favs = ["squat", ...]); listed on the profile page (js/favs.js)
const isFav = id => { const u = currentUser(); return !!(u && (u.favs || []).includes(id)); };
const favBtn = id => `<button type="button" class="btn sm ${isFav(id) ? "" : "ghost"} xd-fav" data-fav="${id}" aria-pressed="${isFav(id)}">${icon("heart")}${isFav(id) ? xd().unfav : xd().fav}</button>`;
function toggleFav(id) {
  const x = xd();
  if (!currentUser()) { toast(x.favLogin); $("#xdDlg").close(); openAuth("login"); return; }
  const was = isFav(id);
  updateUser(u => { const f = u.favs || []; u.favs = was ? f.filter(v => v !== id) : [...f, id].slice(-30); });
  const b = $(`.xd-fav[data-fav="${id}"]`); if (b) b.outerHTML = favBtn(id);
  toast(was ? x.favRemoved : x.favAdded);
  renderAll();
}
document.addEventListener("click", ev => { const b = ev.target.closest("[data-fav]"); if (b) toggleFav(b.dataset.fav); });
// "Easier / harder" chips swap the window to that move
document.addEventListener("click", ev => { const b = ev.target.closest("[data-xd-go]"); if (!b) return; $("#xdDlg").close(); openExercise(b.dataset.xdGo); });

function openExercise(id) {
  const e = exById(id); if (!e) return;
  const tx = t(), x = xd(), dlg = $("#xdDlg");
  const dose = (e.timed ? tx.mgDoseTimed : tx.mgDose) + (e.side ? ` · ${tx.perSide}` : "");
  const muscles = ((typeof MUSCLES !== "undefined" && MUSCLES[e.id]) || []).map(m => `<span class="tag acc">${tx["mg_" + m]}</span>`).join("");
  $("#xdBody").innerHTML = `
    <div class="fig xd-fig" data-fig="${e.id}"></div>
    <div class="xd-info">
      <h2 id="xdName">${esc(e[lang])}</h2>
      <div class="xd-tags"><span class="tag">${tx["equip_" + e.eq]}</span>${e.jump ? `<span class="tag">${tx.tagJump}</span>` : ""}${e.adv ? `<span class="tag">${tx.tagAdv}</span>` : ""}</div>
      <h3>${x.how}</h3><p>${esc(lang === "th" ? e.cth : e.cen)}</p>
      <h3>${x.dose}</h3><p class="xd-dose">${dose}</p>
      ${muscles ? `<h3>${x.works}</h3><div class="xd-tags">${muscles}</div>` : ""}
      ${e.jump || e.adv ? `<p class="xd-warn">${icon("alert")}<span>${e.jump ? x.jump : x.adv}</span></p>` : ""}
      <h3>${x.mistakes}</h3>
      <ul class="xd-tips xd-miss">${(XD_MISTAKES[lang][e.cat] || []).map(m => `<li>${m}</li>`).join("")}</ul>
      ${(() => { const [easy, hard] = xdSteps(e); const chips = l => l.map(o => `<button type="button" class="xd-step" data-xd-go="${o.id}">${esc(o[lang])}</button>`).join("");
        return easy.length || hard.length ? `<h3>${x.steps}</h3><div class="xd-steps">${easy.length ? `<div><small>${x.easier}</small>${chips(easy)}</div>` : ""}${hard.length ? `<div><small>${x.harder}</small>${chips(hard)}</div>` : ""}</div>` : ""; })()}
      <h3>${x.tips}</h3>
      <ul class="xd-tips"><li>${x.tip1}</li><li>${x.tip2}</li><li>${x.tip3}</li></ul>
      <div class="btn-row">${favBtn(e.id)}<a class="btn ghost sm" href="more.html#timer">${icon("gauge")}${x.timer}</a></div>
    </div>`;
  $("#xdX").setAttribute("aria-label", x.close);
  $("#xdX").innerHTML = icon("close");
  dlg.showModal();
  if (typeof FIGURES !== "undefined") FIGURES.mountAll(dlg);
}

// Make every exercise card behave like a button (mouse, keyboard, screen readers)
function markCards() {
  $$(".ex-card.has-fig").forEach(c => {
    const f = c.querySelector(".fig[data-fig]"), e = f && exById(f.dataset.fig);
    if (!e) return;
    c.dataset.xd = e.id; c.tabIndex = 0; c.setAttribute("role", "button");
    c.setAttribute("aria-label", xd().open(e[lang]));
  });
}
let markQueued = false;
new MutationObserver(() => { if (!markQueued) { markQueued = true; requestAnimationFrame(() => { markQueued = false; markCards(); }); } })
  .observe(document.body, { childList: true, subtree: true });
onRender(markCards);

document.addEventListener("click", ev => {
  const c = ev.target.closest(".ex-card[data-xd]");
  if (c && !ev.target.closest("a,button")) openExercise(c.dataset.xd);
});
document.addEventListener("keydown", ev => {
  const c = ev.target.closest && ev.target.closest(".ex-card[data-xd]");
  if (c && ev.target === c && (ev.key === "Enter" || ev.key === " ")) { ev.preventDefault(); openExercise(c.dataset.xd); }
});
$("#xdX").onclick = () => $("#xdDlg").close();
$("#xdDlg").addEventListener("click", ev => { if (ev.target.id === "xdDlg") $("#xdDlg").close(); });
