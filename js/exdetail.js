// กดการ์ดท่าออกกำลังกาย -> หน้าต่างรายละเอียด: ตัวละครขนาดใหญ่ วิธีทำ จำนวนเซ็ต กล้ามเนื้อที่ใช้ ข้อควรระวัง
// (Exercise detail window; works on any page that shows .ex-card with a .fig[data-fig])

const XD = {
  th: { open: n => `ดูรายละเอียดท่า ${n}`, how: "วิธีทำ", dose: "จำนวนที่แนะนำสำหรับมือใหม่", works: "กล้ามเนื้อที่ใช้",
    tips: "เคล็ดลับ", tip1: "หายใจออกตอนออกแรง หายใจเข้าตอนผ่อน", tip2: "ทำช้าๆ คุมจังหวะ ดีกว่าทำเร็วแต่ท่าผิด", tip3: "ถ้าเจ็บหรือปวดผิดปกติ ให้หยุดทันที",
    jump: "ท่านี้มีการกระโดด ถ้ามีปัญหาเข่าหรือน้ำหนักมาก ให้เลือกท่าที่ไม่กระโดดแทน", adv: "ท่านี้เหมาะกับคนที่ฝึกมาสักพักแล้ว มือใหม่ลองท่าง่ายก่อน",
    timer: "เปิดตัวจับเวลา", close: "ปิด", fav: "เพิ่มเป็นท่าโปรด", unfav: "ท่าโปรดแล้ว", favAdded: "เพิ่มในท่าโปรดแล้ว ดูได้ที่หน้าข้อมูลส่วนตัว", favRemoved: "นำออกจากท่าโปรดแล้ว", favLogin: "เข้าสู่ระบบเพื่อเก็บท่าโปรด" },
  en: { open: n => `Show details for ${n}`, how: "How to do it", dose: "Beginner amount", works: "Muscles worked",
    tips: "Tips", tip1: "Breathe out as you push, in as you return", tip2: "Slow and controlled beats fast with bad form", tip3: "Stop right away if something hurts",
    jump: "This move has jumping. If your knees hurt or you carry extra weight, pick a no-jump move instead.", adv: "Best after a few weeks of training. Beginners can start with an easier move.",
    timer: "Open the timer", close: "Close", fav: "Add to favourites", unfav: "In favourites", favAdded: "Added to favourites. See them on your profile.", favRemoved: "Removed from favourites", favLogin: "Log in to save favourites" }
};
const xd = () => XD[lang];

document.body.insertAdjacentHTML("beforeend", `<dialog class="xd" id="xdDlg" aria-labelledby="xdName">
  <button type="button" class="xd-x" id="xdX"></button>
  <div class="xd-body" id="xdBody"></div>
</dialog>`);

const exById = id => EX.find(e => e.id === id);

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
