// หน้าสร้างกล้าม: เลือกกล้ามเนื้อแต่ละส่วน แล้วดูท่าของส่วนนั้น (Muscle-group browser)
// ลิงก์ตรงไปส่วนที่ต้องการได้ เช่น muscle.html#chest, muscle.html#legs

const MG_FIG = { chest: "pushup", back: "dbrow", shoulders: "dbpress", arms: "curl", legs: "squat", glutes: "bridge", core: "crunch" };
let mgSel = MUSCLE_GROUPS.includes(location.hash.slice(1)) ? location.hash.slice(1) : "chest";
let mgEq = "all";

// Exercises for a group: ones where it's the main muscle come first
function exercisesFor(g) {
  const main = id => (MUSCLES[id][0] === g ? 0 : 1);
  return EX.filter(e => MUSCLES[e.id] && MUSCLES[e.id].includes(g)).sort((a, b) => main(a.id) - main(b.id));
}

function renderGroups() {
  const tx = t();
  $("#mgGrid").innerHTML = MUSCLE_GROUPS.map(g => `
    <button type="button" class="mg-card${g === mgSel ? " on" : ""}" data-g="${g}" aria-pressed="${g === mgSel}">
      <div class="bm-wrap zoom">${bodyMap(g, true)}</div>
      <b>${tx[`mg_${g}`]}</b>
      <small>${tx.mgCount(exercisesFor(g).length)}</small>
    </button>`).join("");
}

function renderDetail() {
  const tx = t(), g = mgSel;
  const all = exercisesFor(g);
  const list = all.filter(e => mgEq === "all" || e.eq === mgEq);
  const filters = ["all", "none", "db", "gym"].map(e =>
    `<button type="button" data-eq="${e}" class="${e === mgEq ? "on" : ""}">${e === "all" ? tx.eqAll : tx[`equip_${e}`]}</button>`).join("");

  const cards = list.map(e => {
    const others = MUSCLES[e.id].filter(m => m !== g).map(m => `<span class="tag">${tx[`mg_${m}`]}</span>`).join("");
    const dose = (e.timed ? tx.mgDoseTimed : tx.mgDose) + (e.side ? ` · ${tx.perSide}` : "");
    return `
      <div class="ex-card has-fig">
        <div class="fig" data-fig="${e.id}"></div>
        <b>${e[lang]}</b>
        <p>${lang === "th" ? e.cth : e.cen}</p>
        <div class="ex-dose" style="margin-bottom:8px">${dose}</div>
        <span class="tag acc">${tx[`equip_${e.eq}`]}</span>${others}
      </div>`;
  }).join("");

  $("#mgDetail").innerHTML = `
    <div class="wrap">
      <div class="panel mg-head">
        <div>
          <span class="pill">${tx.mgPill}</span>
          <h2>${tx[`mg_${g}`]}</h2>
          <p class="lead" style="margin:0 0 14px">${tx[`mgd_${g}`]}</p>
          <ul class="tip-list">${tx[`mgt_${g}`].map(s => `<li>${s}</li>`).join("")}</ul>
        </div>
        <div class="bm-wrap big">${bodyMap(g)}</div>
      </div>
      <div class="sec-head" style="margin:28px 0 16px"><h2 style="font-size:1.3rem">${tx.mgExTitle(tx[`mg_${g}`], all.length)}</h2></div>
      <div class="ex-filter">${filters}</div>
      <div class="ex-grid">${cards || `<div class="empty" style="grid-column:1/-1">${tx.mgNone}</div>`}</div>
    </div>`;
}

$("#mgGrid").addEventListener("click", e => {
  const card = e.target.closest("[data-g]");
  if (!card) return;
  mgSel = card.dataset.g; mgEq = "all";
  $$(".mg-card").forEach(c => { c.classList.toggle("on", c === card); c.setAttribute("aria-pressed", c === card); });
  history.replaceState(null, "", "#" + mgSel);
  renderDetail();
  $("#mgDetail").scrollIntoView({ behavior: "smooth", block: "start" });
});
$("#mgDetail").addEventListener("click", e => {
  const eq = e.target.dataset.eq;
  if (eq) { mgEq = eq; renderDetail(); }
});

onRender(renderGroups);
onRender(renderDetail);

// Opened with a link like muscle.html#legs: jump to that group's details
if (location.hash.slice(1) === mgSel) setTimeout(() => $("#mgDetail").scrollIntoView(), 80);
