// ท่าโปรด: ท่าที่กดหัวใจไว้ในหน้าต่างรายละเอียดท่า (exdetail.js) + เริ่มออกกำลังกายด้วยท่าโปรดได้ทันที (profile.html#favs)

const FAV_T = {
  th: { title: "ท่าโปรดของฉัน", sub: n => `${n} ท่า · กดการ์ดเพื่อดูวิธีทำ`, start: "เริ่มออกกำลังกายด้วยท่าโปรด", title2: "ท่าโปรด",
    none: "ยังไม่มีท่าโปรด เปิดท่าที่ชอบ (เช่น ในคลังท่า) แล้วกด \"เพิ่มเป็นท่าโปรด\"", browse: "ไปที่คลังท่า" },
  en: { title: "My favourite moves", sub: n => `${n} moves · tap a card to see how`, start: "Work out with my favourites", title2: "Favourites",
    none: "No favourites yet. Open a move you like (for example in the exercise library) and tap \"Add to favourites\".", browse: "Open the exercise library" }
};

function renderFavs() {
  const box = $("#favs"); if (!box) return;
  const u = currentUser(); box.hidden = !u; if (!u) return;
  const tx = FAV_T[lang], T0 = t(), list = (u.favs || []).map(id => EX.find(e => e.id === id)).filter(Boolean);
  // keep the cards (and their 3D figures) if nothing changed
  const key = list.map(e => e.id).join(",") + "|" + lang;
  if (box.dataset.key === key) return;
  box.dataset.key = key;
  box.innerHTML = `<div class="wrap"><div class="panel">
    <div class="fav-head">
      <div><h2 class="panel-title" style="margin:0">${icon("heart")} ${tx.title}</h2>${list.length ? `<p class="set-sub" style="margin:4px 0 0">${tx.sub(list.length)}</p>` : ""}</div>
      ${list.length ? `<button type="button" class="btn" id="favStart">${icon("play")}${tx.start}</button>` : ""}
    </div>
    ${list.length ? `<div class="ex-grid fav-grid">${list.map(e => `
      <div class="ex-card has-fig">
        <div class="fig" data-fig="${e.id}"></div>
        <b>${e[lang]}</b>
        <p>${lang === "th" ? e.cth : e.cen}</p>
        <span class="tag acc">${T0["part_" + e.cat].split(" (")[0]}</span><span class="tag">${T0["equip_" + e.eq]}</span>
      </div>`).join("")}</div>`
    : `<div class="empty"><p style="margin:0 0 14px">${tx.none}</p><a class="btn ghost sm" href="muscle.html#allex">${tx.browse}</a></div>`}
  </div></div>`;
  const st = $("#favStart");
  if (st) st.onclick = () => Workout.start({
    title: tx.title2, rest: 45,
    items: list.slice(0, 8).map(e => ({ ex: e, sets: e.cat === "mobility" ? 2 : 3, target: "8–12", secs: e.timed || e.cat === "cardio" || e.cat === "mobility" ? 30 : null }))
  });
}
onRender(renderFavs);
