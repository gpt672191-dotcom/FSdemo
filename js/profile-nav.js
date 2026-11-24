// เมนูลัดหน้าข้อมูลส่วนตัว: ปุ่มไปยังแต่ละส่วน และไฮไลต์ส่วนที่กำลังดูอยู่ (profile.html)

const PN_T = {
  th: { overview: "ภาพรวม", progress: "ความคืบหน้า", log: "บันทึกเอง", body: "น้ำหนัก/เอว", favs: "ท่าโปรด", edit: "แก้ไขข้อมูล" },
  en: { overview: "Overview", progress: "Progress", log: "Log", body: "Weight/waist", favs: "Favourites", edit: "Edit" }
};
// [label key, element to jump to]
const PN_ITEMS = [["overview", "#overview"], ["progress", "#progress"], ["log", "#manForm"], ["body", "#wForm"], ["favs", "#favs"], ["edit", "#edit"]];

function renderPnav() {
  const nav = $("#pnav"); if (!nav) return;
  const tx = PN_T[lang];
  nav.innerHTML = `<div class="wrap">${PN_ITEMS.filter(([, sel]) => { const el = $(sel); return el && !el.closest("[hidden]"); })
    .map(([k, sel]) => `<a href="${sel}" data-jump="${sel}">${tx[k]}</a>`).join("")}</div>`;
  spyPnav();
}
onRender(renderPnav);

document.addEventListener("click", e => {
  const a = e.target.closest("[data-jump]"); if (!a) return;
  e.preventDefault();
  const el = $(a.dataset.jump); if (!el) return;
  const target = el.closest(".pg-w, .man-log") || el;
  const top = target.getBoundingClientRect().top + scrollY - (($("header") || {}).offsetHeight || 64) - 56;
  window.scrollTo({ top, behavior: document.documentElement.dataset.motion === "reduce" ? "auto" : "smooth" });
});

// Highlight the section in view
function spyPnav() {
  const links = $$("#pnav [data-jump]"); if (!links.length) return;
  const line = (($("header") || {}).offsetHeight || 64) + 70;
  let cur = links[0];
  for (const a of links) { const el = $(a.dataset.jump); if (el && (el.closest(".pg-w, .man-log") || el).getBoundingClientRect().top <= line) cur = a; }
  links.forEach(a => { const on = a === cur; a.classList.toggle("on", on); if (on) a.setAttribute("aria-current", "true"); else a.removeAttribute("aria-current"); });
  // keep the active chip visible inside the scrolling bar
  const bar = $("#pnav .wrap");
  if (bar && cur) { const l = cur.offsetLeft - bar.offsetLeft, r = l + cur.offsetWidth; if (l < bar.scrollLeft || r > bar.scrollLeft + bar.clientWidth) bar.scrollLeft = l - 16; }
}
let pnavTick = false;
window.addEventListener("scroll", () => { if (!pnavTick) { pnavTick = true; requestAnimationFrame(() => { pnavTick = false; spyPnav(); }); } }, { passive: true });
