// แสดงรายการท่าออกกำลังกาย แยกหมวด ไม่มีอุปกรณ์ / มีอุปกรณ์ (Exercise browser)
// ใช้กับ <div id="exBrowser" data-cats="cardio,lower"> — แสดงเฉพาะหมวดร่างกายที่ระบุ แยกตามอุปกรณ์ (utils.js: equipSections)

const exBox = $("#exBrowser");
const exCats = exBox.dataset.cats.split(",");
let exMode = "all";

function renderExercises() {
  const tx = t();
  const list = EX.filter(e => exCats.includes(e.cat));
  const card = e => `
    <div class="ex-card has-fig">
      <div class="fig" data-fig="${e.id}"></div>
      <b>${e[lang]}</b>
      <p>${lang === "th" ? e.cth : e.cen}</p>
      <span class="tag acc">${tx[`part_${e.cat}`].split(" (")[0]}</span>${e.jump ? `<span class="tag">${tx.tagJump}</span>` : ""}${e.adv ? `<span class="tag">${tx.tagAdv}</span>` : ""}${e.timed ? `<span class="tag">${tx.tagTimed}</span>` : ""}
    </div>`;
  exBox.innerHTML = equipTabs(exMode) + equipSections(list, exMode, card);
}

exBox.addEventListener("click", e => {
  const tab = e.target.closest("[data-eqmode]");
  if (tab) { exMode = tab.dataset.eqmode; renderExercises(); }
});
onRender(renderExercises);
