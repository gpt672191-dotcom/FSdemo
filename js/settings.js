// หน้าตั้งค่า: ธีม ภาษา ภาพเคลื่อนไหว และจัดการบัญชี (Settings page)
// การแสดงผลเก็บใน fs-prefs (ทั้งเบราว์เซอร์) — ดู prefs()/applyPrefs() ใน utils.js

function setPref(key, value) {
  const p = prefs();
  p[key] = value;
  store.set("fs-prefs", p);
  applyPrefs();
}

let clearArmed = false, clearTimer; // "delete all plans" needs a second click

function renderSettings() {
  const tx = t(), p = prefs(), u = currentUser();
  const mark = (b, on) => { b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); };
  $$("#themeSeg button").forEach(b => mark(b, b.dataset.theme === (p.theme || "auto")));
  $$("#langSeg button").forEach(b => mark(b, b.dataset.setlang === lang));
  $("#themeSeg").setAttribute("aria-label", tx.sTheme);
  $("#langSeg").setAttribute("aria-label", tx.sLang);
  $("#motionToggle").checked = !!p.motion;

  $("#sGuest").hidden = !!u;
  $("#sAccount").hidden = !u;
  if (!u) return;
  $("#sEmail").textContent = u.email;
  $("#sPlansInfo").textContent = tx.plansCount(u.plans.length);
  $("#clearPlansBtn").disabled = !u.plans.length;
  $("#clearPlansTxt").textContent = clearArmed ? tx.delConfirm : tx.sClearBtn;
}
onRender(renderSettings);

/* ---------- Display ---------- */
$$("#themeSeg button").forEach(b => b.onclick = () => { setPref("theme", b.dataset.theme); renderSettings(); });
$$("#langSeg button").forEach(b => b.onclick = () => { lang = b.dataset.setlang; store.set("fs-lang", lang); renderAll(); });
$("#motionToggle").onchange = e => { setPref("motion", e.target.checked); toast(t().sSaved); };
$("#resetPrefs").onclick = () => { store.set("fs-prefs", {}); applyPrefs(); renderSettings(); toast(t().sResetDone); };

/* ---------- Account ---------- */
$("#sLogin").onclick = () => openAuth("login");
$("#sSignup").onclick = () => openAuth("signup");

$("#pwForm").addEventListener("submit", async e => {
  e.preventDefault();
  const tx = t(), err = $("#pwErr"), u = currentUser();
  if (!u) return;
  const cur = $("#sPwCur").value, pw = $("#sPwNew").value, pw2 = $("#sPwNew2").value;
  if ((await hashPw(cur, u.salt)) !== u.hash) { err.textContent = tx.errPwCur; return; }
  if (pw.length < 8) { err.textContent = tx.errPwLen; return; }
  if (pw !== pw2) { err.textContent = tx.errPwMatch; return; }
  if (pw === cur) { err.textContent = tx.errPwSame; return; }
  const salt = newSalt(), hash = await hashPw(pw, salt);
  updateUser(x => { x.salt = salt; x.hash = hash; });
  e.target.reset();
  err.textContent = "";
  renderAll();
  toast(tx.pwChanged);
});

$("#exportBtn").onclick = () => {
  const u = currentUser();
  if (!u) return;
  const { salt, hash, ...data } = u; // never export the password hash
  const blob = new Blob([JSON.stringify({ app: "FitStart AI", exportedAt: new Date().toISOString(), ...data }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `fitstart-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast(t().exported);
};

/* ---------- Import a file made by "Download my data" (moving to another phone or browser) ---------- */
// Merges into the logged-in account; nothing already saved here is removed.
const IMP_T = {
  th: { t: "นำเข้าข้อมูล", d: "ย้ายมาจากเครื่องอื่น: เลือกไฟล์ที่ได้จาก \"ดาวน์โหลดข้อมูล\" ระบบจะรวมกับข้อมูลในเครื่องนี้ ไม่ลบของเดิม", btn: "เลือกไฟล์",
    bad: "ไฟล์นี้ไม่ใช่ไฟล์ข้อมูลของ FitStart AI", done: (p, l) => `นำเข้าแล้ว: แผน ${p} แผน, ประวัติออกกำลังกาย ${l} ครั้ง` },
  en: { t: "Import data", d: "Moving from another device: pick a file made with \"Download my data\". It is merged with this account; nothing here is removed.", btn: "Choose file",
    bad: "This isn't a FitStart AI data file", done: (p, l) => `Imported: ${p} plans, ${l} workouts` }
};
onRender(() => {
  if (!$("#importT")) return;
  const x = IMP_T[lang];
  $("#importT").textContent = x.t; $("#importD").textContent = x.d; $("#importBtnT").textContent = x.btn;
});
function mergeImport(u, d) {
  const byKey = (a, b, key) => { const m = new Map(); [...(a || []), ...(b || [])].forEach(x => m.set(key(x), x)); return [...m.values()]; };
  const before = { p: (u.plans || []).length, l: (u.log || []).length };
  u.plans = byKey(u.plans, d.plans, p => p.seed + ":" + JSON.stringify(p.answers)).slice(-50);
  u.log = byKey(u.log, d.log, x => [x.d, x.t, x.mins, x.sets].join("|")).sort((a, b) => (a.d < b.d ? -1 : 1)).slice(-500);
  u.weights = byKey(u.weights, d.weights, x => x.d).sort((a, b) => (a.d < b.d ? -1 : 1)).slice(-200);
  u.waist = byKey(u.waist, d.waist, x => x.d).sort((a, b) => (a.d < b.d ? -1 : 1)).slice(-200);
  u.water = { ...(d.water || {}), ...(u.water || {}) };
  u.protein = { ...(d.protein || {}), ...(u.protein || {}) };
  if (!hasBody(u.profile) && d.profile && hasBody(d.profile)) u.profile = d.profile;
  return { p: u.plans.length - before.p, l: u.log.length - before.l };
}
$("#importFile").addEventListener("change", async e => {
  const f = e.target.files[0], x = IMP_T[lang];
  e.target.value = "";
  if (!f || !currentUser()) return;
  let d;
  try { d = JSON.parse(await f.text()); } catch { return toast(x.bad); }
  if (!d || d.app !== "FitStart AI") return toast(x.bad);
  let added;
  updateUser(u => { added = mergeImport(u, d); });
  renderAll();
  toast(x.done(added.p, added.l));
});

$("#clearPlansBtn").onclick = () => {
  clearTimeout(clearTimer);
  if (!clearArmed) {
    clearArmed = true;
    clearTimer = setTimeout(() => { clearArmed = false; renderSettings(); }, 3000);
  } else {
    clearArmed = false;
    updateUser(u => { u.plans = []; });
    toast(t().plansCleared);
  }
  renderAll();
};

$("#delForm").addEventListener("submit", async e => {
  e.preventDefault();
  const tx = t(), u = currentUser();
  if (!u) return;
  if ((await hashPw($("#sDelPw").value, u.salt)) !== u.hash) { $("#delErr").textContent = tx.errPwCur; return; }
  const users = getUsers();
  delete users[session];
  setUsers(users);
  session = null;
  store.set("fs-session", null);
  e.target.reset();
  $("#delErr").textContent = "";
  renderAll();
  toast(tx.accDeleted);
});
// The "Choose file" label works with the keyboard too
$("#importLbl").addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); $("#importFile").click(); } });
