// ระบบสมาชิกแบบจำลอง และแผนที่บันทึกไว้ (Demo accounts and saved plans)

/* ---------- Accounts (DEMO: stored in this browser only) ----------
   fs-users:   { [email]: { name, email, salt, hash, created, plans: [{ answers, seed, savedAt }] } }
   fs-session: email of the logged-in user                                                      */
const getUsers = () => store.get("fs-users", {});
const setUsers = u => store.set("fs-users", u);
let session = store.get("fs-session", null);
if (session && !getUsers()[session]) session = null;
const currentUser = () => (session ? getUsers()[session] : null);

async function hashPw(pw, salt) {
  const data = new TextEncoder().encode(salt + ":" + pw);
  if (window.crypto && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback for browsers without crypto.subtle (demo only)
  let h = 2166136261;
  for (const b of data) { h ^= b; h = Math.imul(h, 16777619) >>> 0; }
  return "f" + h.toString(16);
}
const newSalt = () => Math.random().toString(36).slice(2) + Date.now().toString(36);

let authMode = "login";
let afterLogin = null; // action to run once logged in (e.g. save plan)

function openAuth(mode = "login", then = null) {
  authMode = mode; afterLogin = then;
  $("#authForm").reset();
  $("#authErr").textContent = "";
  $$(".pw-toggle").forEach(b => { $("#" + b.dataset.for).type = "password"; });
  $("#authModal").hidden = false;
  renderAuth();
  setTimeout(() => (mode === "signup" ? $("#aName") : $("#aEmail")).focus(), 30);
}
function closeAuth() { $("#authModal").hidden = true; afterLogin = null; }

function renderAuth() {
  const t = T[lang], up = authMode === "signup";
  $("#authTitle").textContent = up ? t.signupTitle : t.loginTitle;
  $("#authSub").textContent = up ? t.signupSub : t.loginSub;
  $("#authSubmit").textContent = up ? t.signup : t.login;
  $("#switchText").textContent = up ? t.haveAcc : t.noAcc;
  $("#switchBtn").textContent = up ? t.login : t.signup;
  $("#nameField").hidden = !up;
  $("#pw2Field").hidden = !up;
  $("#aPw").autocomplete = up ? "new-password" : "current-password";
  $$(".tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === authMode));
  $$(".pw-toggle").forEach(b => { b.textContent = $("#" + b.dataset.for).type === "password" ? t.show : t.hide; });
}

function switchMode(m) { authMode = m; $("#authErr").textContent = ""; renderAuth(); }
$$(".tabs button").forEach(b => b.onclick = () => switchMode(b.dataset.tab));
$("#switchBtn").onclick = () => switchMode(authMode === "login" ? "signup" : "login");
$$(".pw-toggle").forEach(b => b.onclick = () => {
  const inp = $("#" + b.dataset.for);
  inp.type = inp.type === "password" ? "text" : "password";
  renderAuth();
});
$("#authClose").onclick = closeAuth;
$("#authModal").addEventListener("click", e => { if (e.target.id === "authModal") closeAuth(); });
document.addEventListener("keydown", e => { if (e.key === "Escape" && !$("#authModal").hidden) closeAuth(); });

$("#authForm").addEventListener("submit", async e => {
  e.preventDefault();
  const t = T[lang], err = $("#authErr");
  const name = $("#aName").value.trim();
  const email = $("#aEmail").value.trim().toLowerCase();
  const pw = $("#aPw").value, pw2 = $("#aPw2").value;
  const users = getUsers();
  const fail = msg => { err.textContent = msg; };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail(t.errEmail);

  if (authMode === "signup") {
    if (!name) return fail(t.errName);
    if (pw.length < 8) return fail(t.errPwLen);
    if (pw !== pw2) return fail(t.errPwMatch);
    if (users[email]) return fail(t.errTaken);
    const salt = newSalt();
    users[email] = { name, email, salt, hash: await hashPw(pw, salt), created: Date.now(), plans: [] };
    setUsers(users);
    loginAs(email);
    toast(t.welcomeNew(name));
  } else {
    const u = users[email];
    if (!u || (await hashPw(pw, u.salt)) !== u.hash) return fail(t.errLogin);
    loginAs(email);
    toast(t.welcomeBack(u.name));
  }
  const next = afterLogin;
  closeAuth();
  if (next) next();
});

function loginAs(email) { session = email; store.set("fs-session", email); renderAccount(); }
function logout() {
  session = null; store.set("fs-session", null);
  $("#dropdown").hidden = true;
  renderAccount(); toast(T[lang].byeMsg);
}

function renderAccount() {
  const u = currentUser();
  $("#loginBtn").hidden = !!u;
  $("#userMenu").hidden = !u;
  $("#myplans").hidden = !u;
  if (u) {
    $("#avatar").textContent = u.name.trim().charAt(0).toUpperCase() || "?";
    $("#uname").textContent = u.name;
    $("#whoEmail").textContent = u.email;
  }
  renderSaved();
}

$("#loginBtn").onclick = () => openAuth("login");
$("#logoutBtn").onclick = logout;
$("#userBtn").onclick = e => { e.stopPropagation(); $("#dropdown").hidden = !$("#dropdown").hidden; };
$("#ddPlans").onclick = () => { $("#dropdown").hidden = true; };
document.addEventListener("click", e => { if (!e.target.closest(".user-menu")) $("#dropdown").hidden = true; });

/* ---------- Saved plans ---------- */
function savePlan() {
  const t = T[lang];
  if (!lastPlan) return;
  if (!currentUser()) { toast(t.loginToSave); openAuth("login", savePlan); return; }
  const users = getUsers(), u = users[session];
  if (u.plans.some(p => p.seed === lastPlan.seed && JSON.stringify(p.answers) === JSON.stringify(lastPlan.answers))) {
    toast(t.alreadySaved); return;
  }
  u.plans.unshift({ answers: lastPlan.answers, seed: lastPlan.seed, savedAt: Date.now() });
  setUsers(users);
  renderSaved();
  toast(t.savedMsg);
}

function renderSaved() {
  const box = $("#savedList"), u = currentUser(), t = T[lang];
  if (!u) { box.innerHTML = ""; return; }
  if (!u.plans.length) { box.innerHTML = `<div class="empty">${t.noPlans}</div>`; return; }
  const dateFmt = new Intl.DateTimeFormat(lang === "th" ? "th-TH" : "en-GB", { dateStyle: "medium", timeStyle: "short" });
  box.innerHTML = u.plans.map((p, i) => {
    const a = p.answers;
    return `
      <div class="saved">
        <div>
          <b>${t.sumGoal[a.goal].replace(/^./, c => c.toUpperCase())} · ${t.lvName[a.level]}</b>
          <small>${a.days} × ${a.time} ${t.min} · ${t[`equip_${a.equip}`]} · ${t.savedOn} ${dateFmt.format(p.savedAt)}</small>
        </div>
        <div class="acts">
          <button type="button" class="btn sm" data-open="${i}">${t.open}</button>
          <button type="button" class="btn sm ghost" data-del="${i}">${t.del}</button>
        </div>
      </div>`;
  }).join("");
}

$("#savedList").addEventListener("click", e => {
  const t = T[lang];
  const openI = e.target.dataset.open, delI = e.target.dataset.del;
  const users = getUsers(), u = users[session];
  if (!u) return;
  if (openI !== undefined) {
    const p = u.plans[+openI];
    lastPlan = { answers: p.answers, seed: p.seed };
    answers = { ...p.answers };
    store.set("fs-plan", lastPlan); store.set("fs-answers", answers);
    renderChips(); renderPlan();
    $("#plan").scrollIntoView({ behavior: "smooth", block: "start" });
  }
  if (delI !== undefined) {
    // Two-step delete: first tap arms the button, second tap deletes
    if (e.target.dataset.armed) {
      u.plans.splice(+delI, 1); setUsers(users); renderSaved(); toast(t.deleted);
    } else {
      e.target.dataset.armed = "1"; e.target.textContent = t.delConfirm;
      setTimeout(() => { if (e.target.isConnected) { delete e.target.dataset.armed; e.target.textContent = t.del; } }, 3000);
    }
  }
});
