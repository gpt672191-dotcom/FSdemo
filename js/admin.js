// หน้าผู้ดูแลระบบ: สถิติ จัดการผู้ใช้ ประกาศ และข้อมูล (Admin page)
// ระบบนี้เป็นแบบจำลอง: ข้อมูลผู้ใช้อยู่ใน localStorage ของเบราว์เซอร์นี้ (fs-users)
//   user.role   = "admin" | undefined   ผู้ดูแลระบบ
//   user.banned = true                   ถูกระงับ เข้าสู่ระบบไม่ได้
//   user.sample = true                   ผู้ใช้ตัวอย่างที่สร้างจากปุ่มในหน้านี้

const AD_T = {
  th: {
    pill: "สำหรับผู้ดูแลระบบ", title: "ระบบผู้ดูแล", lead: "ดูภาพรวมการใช้งาน จัดการบัญชีผู้ใช้ และส่งประกาศถึงทุกหน้าของเว็บไซต์",
    guardT: "หน้านี้สำหรับผู้ดูแลระบบเท่านั้น", guardS: "เข้าสู่ระบบด้วยบัญชีที่มีสิทธิ์ผู้ดูแลเพื่อใช้งาน", demoAcc: "บัญชีทดลอง:",
    sUsers: "ผู้ใช้ทั้งหมด", sNew: "สมัครใหม่ 7 วัน", sActive: "ใช้งานใน 7 วัน", sPlans: "แผนที่บันทึก", sWorkouts: "ออกกำลังกายรวม", sBanned: "ถูกระงับ",
    chSign: "ผู้สมัครใหม่ 14 วันล่าสุด", chGoal: "เป้าหมายจากแผนที่บันทึก", noGoal: "ยังไม่มีแผนที่บันทึก",
    chUse: "การใช้ฟีเจอร์", chUseSub: "สัดส่วนผู้ใช้ที่เคยใช้แต่ละฟีเจอร์", chFeel: "ความรู้สึกหลังออกกำลังกาย", chFeelSub: "จากคำตอบหลังจบโหมดนำออกกำลังกาย",
    fWork: "โหมดนำออกกำลังกาย", fPlan: "บันทึกแผน", fWater: "ตัวนับน้ำ", fProtein: "ตัวนับโปรตีน", fWeight: "บันทึกน้ำหนัก", fWaist: "บันทึกรอบเอว",
    feelEasy: "ง่ายไป", feelOk: "พอดี", feelHard: "หนักไป", noFeel: "ยังไม่มีคำตอบ", nUsers: n => `${n} คน`,
    uTitle: "ผู้ใช้", search: "ค้นหาชื่อหรืออีเมล", fAll: "ทั้งหมด", fAdmin: "แอดมิน", fBanned: "ถูกระงับ",
    cUser: "ผู้ใช้", cJoined: "สมัครเมื่อ", cPlans: "แผน", cWorkouts: "ออกกำลังกาย", cBmi: "BMI", cStatus: "สถานะ",
    none: "ไม่พบผู้ใช้", manage: "จัดการ",
    stAdmin: "แอดมิน", stBanned: "ถูกระงับ", stActive: "ปกติ", stSample: "ตัวอย่าง", you: "คุณ",
    iSex: "เพศ", iAge: "อายุ", iHW: "ส่วนสูง / น้ำหนัก", iLast: "เข้าระบบล่าสุด", iPlans: "แผนที่บันทึก", iWorkouts: "ออกกำลังกาย", iMins: "นาทีรวม",
    male: "ชาย", female: "หญิง", never: "ยังไม่เคย", recent: "ออกกำลังกายล่าสุด", noLog: "ยังไม่มีบันทึกการออกกำลังกาย",
    ban: "ระงับบัญชี", unban: "ยกเลิกการระงับ", mkAdmin: "ตั้งเป็นแอดมิน", rmAdmin: "ถอนสิทธิ์แอดมิน",
    resetPw: "รีเซ็ตรหัสผ่าน", del: "ลบบัญชี", sure: "กดอีกครั้งเพื่อยืนยัน",
    newPw: p => `รหัสผ่านใหม่ชั่วคราว: <code>${p}</code> แจ้งผู้ใช้ให้เปลี่ยนในหน้าตั้งค่า`,
    selfNote: "นี่คือบัญชีของคุณ จัดการสิทธิ์ตัวเองไม่ได้", lastAdmin: "ต้องมีแอดมินอย่างน้อย 1 คน",
    tBanned: n => `ระงับบัญชี ${n} แล้ว`, tUnbanned: n => `ยกเลิกการระงับ ${n} แล้ว`, tAdmin: n => `${n} เป็นแอดมินแล้ว`, tUnadmin: n => `ถอนสิทธิ์แอดมินของ ${n} แล้ว`,
    tReset: "รีเซ็ตรหัสผ่านแล้ว", tDel: n => `ลบบัญชี ${n} แล้ว`,
    aTitle: "ประกาศ", aSub: "ข้อความที่ตั้งไว้จะแสดงเป็นแถบใต้เมนูในทุกหน้า (ในเบราว์เซอร์นี้)", aText: "ข้อความประกาศ",
    aPh: "เช่น สัปดาห์นี้มีท่าออกกำลังกายใหม่ 5 ท่า ลองดูเลย", aKind: "รูปแบบ", aInfo: "ทั่วไป", aWarn: "สำคัญ",
    aOn: "แสดงประกาศ", aOnD: "ปิดไว้ได้โดยไม่ต้องลบข้อความ", aSave: "บันทึกประกาศ", aSaved: "บันทึกประกาศแล้ว", aEmpty: "กรอกข้อความประกาศก่อน",
    dTitle: "ข้อมูล", dSample: "ผู้ใช้ตัวอย่าง", dSampleD: "เพิ่มผู้ใช้จำลอง 10 คนพร้อมประวัติการออกกำลังกาย ไว้สาธิตหน้านี้ (รหัสผ่าน demo1234)",
    dSampleAdd: "เพิ่มผู้ใช้ตัวอย่าง", dSampleDel: n => `ลบผู้ใช้ตัวอย่าง (${n})`, tSampleAdd: "เพิ่มผู้ใช้ตัวอย่าง 10 คนแล้ว", tSampleDel: "ลบผู้ใช้ตัวอย่างแล้ว",
    dExport: "ส่งออกข้อมูลผู้ใช้", dExportD: "ดาวน์โหลดไฟล์ JSON ของผู้ใช้ทั้งหมด (ไม่รวมรหัสผ่าน)", exported: "ดาวน์โหลดไฟล์แล้ว"
  },
  en: {
    pill: "Admins only", title: "Admin panel", lead: "See how the site is used, manage user accounts, and post an announcement on every page.",
    guardT: "This page is for admins only", guardS: "Log in with an admin account to continue.", demoAcc: "Demo account:",
    sUsers: "Total users", sNew: "New in 7 days", sActive: "Active in 7 days", sPlans: "Saved plans", sWorkouts: "Workouts logged", sBanned: "Suspended",
    chSign: "Sign-ups, last 14 days", chGoal: "Goals in saved plans", noGoal: "No saved plans yet",
    chUse: "Feature use", chUseSub: "Share of users who have used each feature", chFeel: "How workouts felt", chFeelSub: "Answers given at the end of guided workouts",
    fWork: "Guided workouts", fPlan: "Saved a plan", fWater: "Water tracker", fProtein: "Protein tracker", fWeight: "Weight log", fWaist: "Waist log",
    feelEasy: "Too easy", feelOk: "Just right", feelHard: "Too hard", noFeel: "No answers yet", nUsers: n => `${n} users`,
    uTitle: "Users", search: "Search name or email", fAll: "All", fAdmin: "Admins", fBanned: "Suspended",
    cUser: "User", cJoined: "Joined", cPlans: "Plans", cWorkouts: "Workouts", cBmi: "BMI", cStatus: "Status",
    none: "No users found", manage: "Manage",
    stAdmin: "Admin", stBanned: "Suspended", stActive: "Active", stSample: "Sample", you: "You",
    iSex: "Sex", iAge: "Age", iHW: "Height / weight", iLast: "Last login", iPlans: "Saved plans", iWorkouts: "Workouts", iMins: "Total minutes",
    male: "Male", female: "Female", never: "Never", recent: "Recent workouts", noLog: "No workouts logged yet",
    ban: "Suspend", unban: "Lift suspension", mkAdmin: "Make admin", rmAdmin: "Remove admin",
    resetPw: "Reset password", del: "Delete account", sure: "Click again to confirm",
    newPw: p => `Temporary password: <code>${p}</code> Ask the user to change it in Settings.`,
    selfNote: "This is your account. You can't change your own access.", lastAdmin: "There must be at least one admin",
    tBanned: n => `${n} suspended`, tUnbanned: n => `${n} can log in again`, tAdmin: n => `${n} is now an admin`, tUnadmin: n => `${n} is no longer an admin`,
    tReset: "Password reset", tDel: n => `${n} deleted`,
    aTitle: "Announcement", aSub: "Shown as a bar under the menu on every page (in this browser).", aText: "Message",
    aPh: "e.g. 5 new exercises this week, check them out", aKind: "Style", aInfo: "Normal", aWarn: "Important",
    aOn: "Show announcement", aOnD: "Turn it off without deleting the text", aSave: "Save announcement", aSaved: "Announcement saved", aEmpty: "Write a message first",
    dTitle: "Data", dSample: "Sample users", dSampleD: "Add 10 fake users with workout history to demo this page (password demo1234).",
    dSampleAdd: "Add sample users", dSampleDel: n => `Delete sample users (${n})`, tSampleAdd: "Added 10 sample users", tSampleDel: "Sample users deleted",
    dExport: "Export user data", dExportD: "Download every user as a JSON file (no passwords).", exported: "File downloaded"
  }
};
const at = () => AD_T[lang];

const DAY = 864e5;
const dayKey = ms => { const d = new Date(ms); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`; };
const fmtDate = ms => ms ? new Date(ms).toLocaleDateString(lang === "th" ? "th-TH" : "en-GB", { day: "numeric", month: "short", year: "numeric" }) : at().never;
const userBmi = u => { const p = u.profile; return p && p.height && p.weight ? health.bmi(p.weight, p.height) : null; };
const initial = u => (u.name || "?").trim().charAt(0).toUpperCase() || "?";
const admins = () => Object.values(getUsers()).filter(u => u.role === "admin");

let adFilter = "all", openEmail = null, armed = null, armTimer;

function renderAdmin() {
  const tx = at();
  $$("[data-ad]").forEach(el => { el.textContent = tx[el.dataset.ad]; });
  $("#adQ").placeholder = tx.search;
  $("#adQ").setAttribute("aria-label", tx.search);
  $("#annText").placeholder = tx.aPh;
  $("#adFilter").setAttribute("aria-label", tx.uTitle);

  const ok = isAdmin();
  $("#adGuard").hidden = ok;
  $("#adMain").hidden = !ok;
  if (!ok) { if ($("#adDlg").open) $("#adDlg").close(); return; }

  const list = Object.values(getUsers()), now = Date.now();
  const logs = list.flatMap(u => u.log || []);
  const weekAgo = dayKey(now - 6 * DAY);
  const active = list.filter(u => (u.lastLogin && u.lastLogin > now - 7 * DAY) || (u.log || []).some(l => l.d >= weekAgo)).length;
  const stats = [
    ["users", list.length, tx.sUsers], ["plus", list.filter(u => u.created > now - 7 * DAY).length, tx.sNew],
    ["trending", active, tx.sActive], ["clipboard", list.reduce((n, u) => n + (u.plans || []).length, 0), tx.sPlans],
    ["dumbbell", logs.length, tx.sWorkouts], ["ban", list.filter(u => u.banned).length, tx.sBanned]
  ];
  $("#adStats").innerHTML = stats.map(([ic, n, l]) => `<div class="ad-stat"><span class="ad-stat-ic">${icon(ic)}</span><b>${n.toLocaleString()}</b><small>${l}</small></div>`).join("");

  // Sign-ups per day, last 14 days
  const days = [...Array(14)].map((_, i) => dayKey(now - (13 - i) * DAY));
  const counts = days.map(d => list.filter(u => u.created && dayKey(u.created) === d).length);
  const max = Math.max(1, ...counts);
  $("#adSignChart").innerHTML = days.map((d, i) =>
    `<div class="ad-bar" title="${d}: ${counts[i]}"><span class="ad-bar-n">${counts[i] || ""}</span><i style="height:${Math.max(3, counts[i] / max * 100)}%"></i><small>${+d.slice(8)}</small></div>`).join("");

  // Goal of each saved plan
  const goals = {};
  list.forEach(u => (u.plans || []).forEach(p => { const g = p.answers && p.answers.goal; if (g) goals[g] = (goals[g] || 0) + 1; }));
  const gTotal = Object.values(goals).reduce((a, b) => a + b, 0);
  $("#adGoalChart").innerHTML = gTotal ? OPTIONS.goal.map(g => {
    const n = goals[g] || 0, pc = Math.round(n / gTotal * 100);
    return `<div class="ad-hbar"><span>${esc(t()["goal_" + g])}</span><div><i style="width:${pc}%"></i></div><b>${pc}%</b></div>`;
  }).join("") : `<p class="ad-none">${tx.noGoal}</p>`;

  // Feature use (share of users) and workout feelings
  const used = (f) => list.filter(f).length;
  const nonEmpty = o => o && Object.keys(o).length > 0;
  const feats = [
    [tx.fWork, used(u => (u.log || []).length)], [tx.fPlan, used(u => (u.plans || []).length)],
    [tx.fWater, used(u => nonEmpty(u.water))], [tx.fProtein, used(u => nonEmpty(u.protein))],
    [tx.fWeight, used(u => (u.weights || []).length)], [tx.fWaist, used(u => (u.waist || []).length)]
  ];
  $("#adUseChart").innerHTML = feats.map(([label, n]) => {
    const pc = list.length ? Math.round(n / list.length * 100) : 0;
    return `<div class="ad-hbar"><span>${esc(label)}</span><div><i style="width:${pc}%"></i></div><b title="${tx.nUsers(n)}">${pc}%</b></div>`;
  }).join("");
  const feels = { easy: 0, ok: 0, hard: 0 };
  logs.forEach(l => { if (l.feel in feels) feels[l.feel]++; });
  const fTotal = feels.easy + feels.ok + feels.hard;
  $("#adFeelChart").innerHTML = fTotal ? [["easy", tx.feelEasy], ["ok", tx.feelOk], ["hard", tx.feelHard]].map(([k, label]) => {
    const pc = Math.round(feels[k] / fTotal * 100);
    return `<div class="ad-hbar feel-${k}"><span>${label}</span><div><i style="width:${pc}%"></i></div><b>${pc}%</b></div>`;
  }).join("") : `<p class="ad-none">${tx.noFeel}</p>`;

  // User table
  $$("#adFilter button").forEach(b => { b.classList.toggle("on", b.dataset.f === adFilter); b.setAttribute("aria-pressed", b.dataset.f === adFilter); });
  const q = $("#adQ").value.trim().toLowerCase();
  const rows = list
    .filter(u => adFilter === "all" || (adFilter === "admin" ? u.role === "admin" : u.banned))
    .filter(u => !q || (u.name || "").toLowerCase().includes(q) || u.email.includes(q))
    .sort((a, b) => (b.role === "admin") - (a.role === "admin") || (b.created || 0) - (a.created || 0));
  $("#adRows").innerHTML = rows.map(u => {
    const b = userBmi(u);
    return `<tr${u.banned ? ' class="off"' : ""}>
      <td><div class="ad-u"><span class="avatar">${esc(initial(u))}</span><div><b>${esc(u.name || "-")}${u.email === session ? ` <span class="tag acc">${tx.you}</span>` : ""}</b><small>${esc(u.email)}</small></div></div></td>
      <td data-l="${tx.cJoined}">${fmtDate(u.created)}</td>
      <td data-l="${tx.cPlans}">${(u.plans || []).length}</td>
      <td data-l="${tx.cWorkouts}">${(u.log || []).length}</td>
      <td data-l="${tx.cBmi}">${b ? b.toFixed(1) : "-"}</td>
      <td data-l="${tx.cStatus}">${statusTags(u)}</td>
      <td><button type="button" class="btn ghost sm" data-open="${esc(u.email)}">${tx.manage}</button></td>
    </tr>`;
  }).join("");
  $("#adNone").hidden = rows.length > 0;

  // Announcement form (only fill once, so typing isn't overwritten)
  const a = store.get("fs-announce", { on: false, text: "", kind: "info" });
  if (!$("#annForm").dataset.filled) { $("#annText").value = a.text || ""; $("#annOn").checked = !!a.on; $("#annForm").dataset.kind = a.kind || "info"; $("#annForm").dataset.filled = 1; }
  $$("#annKind button").forEach(b => { const on = b.dataset.k === $("#annForm").dataset.kind; b.classList.toggle("on", on); b.setAttribute("aria-pressed", on); });

  const nSample = list.filter(u => u.sample).length;
  $("#adSampleDelTxt").textContent = armed === "sample" ? tx.sure : tx.dSampleDel(nSample);
  $("#adSampleDel").disabled = !nSample;

  if (openEmail) renderDialog();
}
onRender(renderAdmin);

function statusTags(u) {
  const tx = at();
  return (u.role === "admin" ? `<span class="tag acc">${tx.stAdmin}</span>` : "") +
    (u.banned ? `<span class="tag ad-red">${tx.stBanned}</span>` : u.role === "admin" ? "" : `<span class="tag ad-green">${tx.stActive}</span>`) +
    (u.sample ? `<span class="tag">${tx.stSample}</span>` : "");
}

/* ---------- One user ---------- */
function renderDialog() {
  const tx = at(), u = getUsers()[openEmail];
  if (!u) { $("#adDlg").close(); openEmail = null; return; }
  const p = u.profile || {}, log = u.log || [], self = u.email === session;
  $("#adDlgAv").textContent = initial(u);
  $("#adDlgName").textContent = u.name || "-";
  $("#adDlgEmail").textContent = u.email;
  $("#adDlgTags").innerHTML = statusTags(u);
  const info = [
    [tx.iSex, p.sex ? (p.sex === "f" ? tx.female : tx.male) : "-"], [tx.iAge, p.age || "-"],
    [tx.iHW, p.height ? `${p.height} cm / ${p.weight} kg` : "-"], [tx.cBmi, userBmi(u) ? userBmi(u).toFixed(1) : "-"],
    [tx.cJoined, fmtDate(u.created)], [tx.iLast, fmtDate(u.lastLogin)],
    [tx.iPlans, (u.plans || []).length], [tx.iWorkouts, log.length], [tx.iMins, log.reduce((n, l) => n + (l.mins || 0), 0)]
  ];
  $("#adDlgInfo").innerHTML = info.map(([k, v]) => `<div><small>${k}</small><b>${esc(v)}</b></div>`).join("");
  $("#adDlgLog").innerHTML = `<h3>${tx.recent}</h3>` + (log.length
    ? `<ul>${log.slice(-4).reverse().map(l => `<li><span>${esc(l.t || "-")}</span><small>${esc(l.d)} · ${l.mins || 0} ${t().min}</small></li>`).join("")}</ul>`
    : `<p class="ad-none">${tx.noLog}</p>`);
  const btn = (act, label, cls = "ghost") => `<button type="button" class="btn ${cls} sm" data-act="${act}">${armed === act + openEmail ? tx.sure : label}</button>`;
  $("#adDlgActs").innerHTML = self ? `<p class="ad-none">${tx.selfNote}</p>` :
    btn("admin", u.role === "admin" ? tx.rmAdmin : tx.mkAdmin) +
    btn("ban", u.banned ? tx.unban : tx.ban, u.banned ? "ghost" : "ghost danger") +
    btn("reset", tx.resetPw) +
    btn("del", tx.del, "danger");
}

function openUser(email) {
  openEmail = email; armed = null;
  $("#adDlgPw").hidden = true;
  renderDialog();
  $("#adDlg").showModal();
}

// Destructive actions need a second click within 3 seconds
function confirmTwice(key) {
  clearTimeout(armTimer);
  if (armed === key) { armed = null; return true; }
  armed = key;
  armTimer = setTimeout(() => { armed = null; renderAll(); }, 3000);
  renderAll();
  return false;
}

function changeUser(email, fn) {
  const users = getUsers();
  if (!users[email]) return;
  fn(users[email], users);
  setUsers(users);
  renderAll();
}

$("#adDlgActs").addEventListener("click", async e => {
  const b = e.target.closest("[data-act]");
  if (!b || !openEmail || openEmail === session) return;
  const tx = at(), email = openEmail, u = getUsers()[email], name = u.name || email;
  const act = b.dataset.act;
  if (act === "admin") {
    if (u.role === "admin" && admins().length <= 1) return toast(tx.lastAdmin);
    changeUser(email, x => { if (x.role === "admin") delete x.role; else x.role = "admin"; });
    toast(u.role === "admin" ? tx.tUnadmin(name) : tx.tAdmin(name));
  } else if (act === "ban") {
    if (!u.banned && !confirmTwice("ban" + email)) return;
    changeUser(email, x => { x.banned = !x.banned; });
    toast(u.banned ? tx.tUnbanned(name) : tx.tBanned(name));
  } else if (act === "reset") {
    if (!confirmTwice("reset" + email)) return;
    const pw = Math.random().toString(36).slice(2, 6) + Math.floor(1000 + Math.random() * 9000);
    const salt = newSalt(), hash = await hashPw(pw, salt);
    changeUser(email, x => { x.salt = salt; x.hash = hash; });
    $("#adDlgPw").innerHTML = tx.newPw(pw);
    $("#adDlgPw").hidden = false;
    toast(tx.tReset);
  } else if (act === "del") {
    if (u.role === "admin" && admins().length <= 1) return toast(tx.lastAdmin);
    if (!confirmTwice("del" + email)) return;
    openEmail = null;
    $("#adDlg").close();
    changeUser(email, (x, all) => { delete all[email]; });
    toast(tx.tDel(name));
  }
});

$("#adRows").addEventListener("click", e => { const b = e.target.closest("[data-open]"); if (b) openUser(b.dataset.open); });
$("#adDlgX").onclick = () => $("#adDlg").close();
$("#adDlg").addEventListener("click", e => { if (e.target.id === "adDlg") $("#adDlg").close(); }); // click outside
$("#adDlg").addEventListener("close", () => { openEmail = null; armed = null; });

/* ---------- Search, filter, login ---------- */
$("#adQ").addEventListener("input", renderAdmin);
$$("#adFilter button").forEach(b => b.onclick = () => { adFilter = b.dataset.f; renderAdmin(); });
$("#adLogin").onclick = () => openAuth("login");

/* ---------- Announcement ---------- */
$$("#annKind button").forEach(b => b.onclick = () => { $("#annForm").dataset.kind = b.dataset.k; renderAdmin(); });
$("#annForm").addEventListener("submit", e => {
  e.preventDefault();
  const text = $("#annText").value.trim();
  if (!text && $("#annOn").checked) return toast(at().aEmpty);
  store.set("fs-announce", { on: $("#annOn").checked, text, kind: $("#annForm").dataset.kind, id: Date.now() });
  try { sessionStorage.removeItem("fs-announce-x"); } catch {}
  renderAll();
  toast(at().aSaved);
});

/* ---------- Sample users and export ---------- */
const SAMPLE_NAMES = ["สมชาย ใจดี", "สุดารัตน์ แก้วงาม", "ณัฐพล ศรีสุข", "กมลชนก บุญมา", "ธนกร ทองดี", "พิมพ์ชนก รักไทย", "อนุชา วงศ์ใหญ่", "ศิริพร มีสุข", "วีรภัทร สายทอง", "ปวีณา จันทร์เพ็ญ"];
const SAMPLE_WORK = ["ทั้งตัว", "คาร์ดิโอ", "แกนกลาง", "อก", "ขา", "หลัง", "ยืดเหยียด"];

$("#adSampleAdd").onclick = async () => {
  const users = getUsers(), now = Date.now();
  const salt = newSalt(), hash = await hashPw("demo1234", salt);
  let r = rng(now % 100000);
  SAMPLE_NAMES.forEach((name, i) => {
    const email = `user${i + 1}@demo.fitstart.ai`;
    const sex = i % 2 ? "f" : "m", h = Math.round(sex === "f" ? 152 + r() * 16 : 162 + r() * 20);
    const w = Math.round((h / 100) ** 2 * (18.5 + r() * 11));
    const created = now - Math.floor(r() * 14) * DAY - Math.floor(r() * DAY / 2);
    const log = [...Array(Math.floor(r() * 12))].map(() => ({
      d: dayKey(created + Math.floor(r() * (now - created))), t: SAMPLE_WORK[Math.floor(r() * SAMPLE_WORK.length)],
      sets: 8 + Math.floor(r() * 12), mins: 12 + Math.floor(r() * 30), feel: ["easy", "ok", "ok", "ok", "hard"][Math.floor(r() * 5)]
    })).sort((a, b) => (a.d < b.d ? -1 : 1));
    // some sample users also use the trackers
    const recent = [...Array(5)].map((_, k) => dayKey(now - k * DAY));
    const water = r() < 0.6 ? Object.fromEntries(recent.map(d => [d, 3 + Math.floor(r() * 8)])) : {};
    const protein = r() < 0.45 ? { [recent[0]]: { chicken: 1, egg: 1 + Math.floor(r() * 3) } } : {};
    const weights = r() < 0.5 ? [{ d: dayKey(created), w }, { d: recent[0], w: Math.round((w - r() * 2) * 10) / 10 }] : [];
    const waist = r() < 0.35 ? [{ d: dayKey(created), w: Math.round(h * (0.42 + r() * 0.12)) }] : [];
    const plans = [...Array(Math.floor(r() * 3))].map(() => ({
      answers: { ...DEFAULTS, goal: OPTIONS.goal[Math.floor(r() * OPTIONS.goal.length)] }, seed: Math.floor(r() * 1e9), savedAt: created + DAY
    }));
    users[email] = { name, email, salt, hash, created, lastLogin: log.length ? now - Math.floor(r() * 9) * DAY : created, plans, log, water, protein, weights, waist,
      profile: { sex, age: 16 + Math.floor(r() * 30), height: h, weight: w }, sample: true, banned: i === 7 };
  });
  setUsers(users);
  renderAll();
  toast(at().tSampleAdd);
};

$("#adSampleDel").onclick = () => {
  if (!confirmTwice("sample")) return;
  const users = getUsers();
  for (const k of Object.keys(users)) if (users[k].sample && k !== session) delete users[k];
  setUsers(users);
  renderAll();
  toast(at().tSampleDel);
};

$("#adExport").onclick = () => {
  const all = Object.values(getUsers()).map(({ salt, hash, ...u }) => u); // never export password hashes
  const blob = new Blob([JSON.stringify({ app: "FitStart AI", exportedAt: new Date().toISOString(), users: all }, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = `fitstart-users-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  toast(at().exported);
};

// The demo admin account is created asynchronously on first visit; redraw once it exists
adminReady.then(renderAll);
