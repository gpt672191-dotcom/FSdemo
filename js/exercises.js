// แสดงรายการท่าออกกำลังกายจากคลังท่า (Exercise browser)
// ใช้กับ <div id="exBrowser" data-cats="lower,upper,core"> — แสดงเฉพาะหมวดที่ระบุ กรองตามอุปกรณ์ได้

const exBox = $("#exBrowser");
const exCats = exBox.dataset.cats.split(",");
let exEquip = "all";

function renderExercises() {
  const tx = t();
  const filters = ["all", "none", "db", "gym"].map(e =>
    `<button type="button" data-eq="${e}" class="${e === exEquip ? "on" : ""}">${e === "all" ? tx.eqAll : tx[`equip_${e}`]}</button>`
  ).join("");
  const groups = exCats.map(cat => {
    const items = EX.filter(e => e.cat === cat && (exEquip === "all" || e.eq === exEquip));
    if (!items.length) return "";
    return `
      <div class="ex-group">
        <h3>${tx[`part_${cat}`]} <small style="color:var(--muted);font-weight:400">(${items.length})</small></h3>
        <div class="ex-grid">
          ${items.map(e => `
            <div class="ex-card has-fig">
              <div class="fig" data-fig="${e.id}"></div>
              <b>${e[lang]}</b>
              <p>${lang === "th" ? e.cth : e.cen}</p>
              <span class="tag acc">${tx[`equip_${e.eq}`]}</span>${e.jump ? `<span class="tag">${tx.tagJump}</span>` : ""}${e.adv ? `<span class="tag">${tx.tagAdv}</span>` : ""}${e.timed ? `<span class="tag">${tx.tagTimed}</span>` : ""}
            </div>`).join("")}
        </div>
      </div>`;
  }).join("");
  exBox.innerHTML = `<div class="ex-filter">${filters}</div>${groups}`;
}

exBox.addEventListener("click", e => {
  const eq = e.target.dataset.eq;
  if (eq) { exEquip = eq; renderExercises(); }
});
onRender(renderExercises);
