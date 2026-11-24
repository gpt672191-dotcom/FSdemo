// คลังท่าทั้งหมด: ค้นหาชื่อท่า / กล้ามเนื้อ, กรองตามส่วนของร่างกายและอุปกรณ์ (Full exercise library, muscle.html#allex)
// กดการ์ดเพื่อดูรายละเอียด (js/exdetail.js)

const XL = {
  th: { title: n => `คลังท่าทั้งหมด (${n} ท่า)`, sub: "ค้นหาท่าที่อยากรู้ หรือกรองตามส่วนของร่างกายและอุปกรณ์ กดการ์ดเพื่อดูวิธีทำ",
    search: "ค้นหา เช่น สควอท, อก, ดัมเบล", all: "ทั้งหมด", anyEq: "อุปกรณ์ทั้งหมด", count: (n, all) => n === all ? `${all} ท่า` : `พบ ${n} จาก ${all} ท่า`,
    none: "ไม่พบท่าที่ค้นหา ลองคำอื่นหรือเปลี่ยนตัวกรอง", clear: "ล้างการค้นหา" },
  en: { title: n => `All exercises (${n})`, sub: "Search for a move, or filter by body part and equipment. Tap a card to see how to do it.",
    search: "Search, e.g. squat, chest, dumbbell", all: "All", anyEq: "Any equipment", count: (n, all) => n === all ? `${all} moves` : `${n} of ${all} moves`,
    none: "No moves match. Try another word or change the filters.", clear: "Clear search" }
};
const xl = () => XL[lang];
const XL_CATS = ["lower", "upper", "core", "cardio", "mobility"], XL_EQ = ["none", "db", "gym"];
let xlCat = "all", xlEq = "all";

function xlText(e) {
  const tx = t(), mus = ((typeof MUSCLES !== "undefined" && MUSCLES[e.id]) || []).map(m => tx["mg_" + m]);
  // search both languages so "squat" and "สควอท" both work
  return [e.th, e.en, e.cth, e.cen, tx["part_" + e.cat], tx["equip_" + e.eq], ...mus,
    T.th["equip_" + e.eq], T.en["equip_" + e.eq], T.th["part_" + e.cat], T.en["part_" + e.cat]].join(" ").toLowerCase();
}

// A search word that is exactly a muscle name ("อก", "chest", "ขา") filters by muscle group,
// because short Thai words also appear inside other words ("อก" is inside "ออก")
function muscleWord(w) {
  for (const g of ["chest", "back", "shoulders", "arms", "legs", "glutes", "core"])
    if ([T.th["mg_" + g], T.en["mg_" + g]].some(l => l && l.toLowerCase() === w)) return g;
  return null;
}

function renderLibrary() {
  const box = $("#allex"); if (!box) return;
  const tx = t(), x = xl();
  if (!box.dataset.built) {
    box.dataset.built = 1;
    box.innerHTML = `<div class="wrap">
      <div class="sec-head"><h2 id="xlTitle"></h2><p id="xlSub"></p></div>
      <div class="xl-tools">
        <label class="xl-search">${icon("search")}<input id="xlQ" type="search" autocomplete="off"><button type="button" id="xlClear" hidden></button></label>
        <div class="xl-chips" id="xlCats" role="group"></div>
        <div class="xl-chips" id="xlEqs" role="group"></div>
      </div>
      <p class="xl-count" id="xlCount" aria-live="polite"></p>
      <div class="ex-grid" id="xlGrid"></div>
      <p class="xl-none" id="xlNone" hidden></p>
    </div>`;
    $("#xlQ").addEventListener("input", renderLibrary);
    $("#xlClear").onclick = () => { $("#xlQ").value = ""; renderLibrary(); $("#xlQ").focus(); };
    box.addEventListener("click", e => {
      const c = e.target.closest("[data-xlcat]"), q = e.target.closest("[data-xleq]");
      if (c) { xlCat = c.dataset.xlcat; renderLibrary(); }
      if (q) { xlEq = q.dataset.xleq; renderLibrary(); }
    });
  }
  $("#xlTitle").textContent = x.title(EX.length);
  $("#xlSub").textContent = x.sub;
  $("#xlQ").placeholder = x.search; $("#xlQ").setAttribute("aria-label", x.search);
  $("#xlClear").setAttribute("aria-label", x.clear); $("#xlClear").innerHTML = icon("close");
  const chip = (attr, val, label, on) => `<button type="button" ${attr}="${val}" class="xl-chip${on ? " on" : ""}" aria-pressed="${on}">${label}</button>`;
  $("#xlCats").innerHTML = chip("data-xlcat", "all", x.all, xlCat === "all") + XL_CATS.map(c => chip("data-xlcat", c, tx["part_" + c].split(" (")[0], xlCat === c)).join("");
  $("#xlEqs").innerHTML = chip("data-xleq", "all", x.anyEq, xlEq === "all") + XL_EQ.map(q => chip("data-xleq", q, tx["equip_" + q], xlEq === q)).join("");

  const words = $("#xlQ").value.trim().toLowerCase().split(/\s+/).filter(Boolean);
  $("#xlClear").hidden = !words.length;
  const list = EX.filter(e => (xlCat === "all" || e.cat === xlCat) && (xlEq === "all" || e.eq === xlEq))
    .filter(e => { const s = xlText(e); return words.every(w => muscleWord(w) ? ((typeof MUSCLES !== "undefined" && MUSCLES[e.id]) || []).includes(muscleWord(w)) : s.includes(w)); });
  $("#xlCount").textContent = x.count(list.length, EX.length);
  $("#xlNone").hidden = list.length > 0; $("#xlNone").textContent = x.none;
  // keep existing cards (and their 3D figures) when the list is the same
  const key = list.map(e => e.id).join(",") + "|" + lang;
  if ($("#xlGrid").dataset.key === key) return;
  $("#xlGrid").dataset.key = key;
  $("#xlGrid").innerHTML = list.map(e => `
    <div class="ex-card has-fig">
      <div class="fig" data-fig="${e.id}"></div>
      <b>${e[lang]}</b>
      <p>${lang === "th" ? e.cth : e.cen}</p>
      <span class="tag acc">${tx["part_" + e.cat].split(" (")[0]}</span><span class="tag">${tx["equip_" + e.eq]}</span>
    </div>`).join("");
}
onRender(renderLibrary);
