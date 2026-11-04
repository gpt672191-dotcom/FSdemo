// ระบบสมาชิกแบบจำลอง (Demo sign-up / log-in) — ข้อมูลเก็บในเบราว์เซอร์นี้เท่านั้น
//   fs-users:   { [email]: { name, email, salt, hash, created, plans: [{ answers, seed, savedAt }] } }
//   fs-session: email of the logged-in user

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

/* ---------- Login window ---------- */
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
  const tx = t(), up = authMode === "signup";
  $("#authTitle").textContent = up ? tx.signupTitle : tx.loginTitle;
  $("#authSub").textContent = up ? tx.signupSub : tx.loginSub;
  $("#authSubmit").textContent = up ? tx.signup : tx.login;
  $("#switchText").textContent = up ? tx.haveAcc : tx.noAcc;
  $("#switchBtn").textContent = up ? tx.login : tx.signup;
  $("#nameField").hidden = !up;
  $("#pw2Field").hidden = !up;
  $("#aPw").autocomplete = up ? "new-password" : "current-password";
  $$(".tabs button").forEach(b => b.classList.toggle("on", b.dataset.tab === authMode));
  $$(".pw-toggle").forEach(b => { b.textContent = $("#" + b.dataset.for).type === "password" ? tx.show : tx.hide; });
}
onRender(renderAuth);

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
  const tx = t(), err = $("#authErr");
  const name = $("#aName").value.trim();
  const email = $("#aEmail").value.trim().toLowerCase();
  const pw = $("#aPw").value, pw2 = $("#aPw2").value;
  const users = getUsers();
  const fail = msg => { err.textContent = msg; };

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return fail(tx.errEmail);

  if (authMode === "signup") {
    if (!name) return fail(tx.errName);
    if (pw.length < 8) return fail(tx.errPwLen);
    if (pw !== pw2) return fail(tx.errPwMatch);
    if (users[email]) return fail(tx.errTaken);
    const salt = newSalt();
    users[email] = { name, email, salt, hash: await hashPw(pw, salt), created: Date.now(), plans: [] };
    setUsers(users);
    loginAs(email);
    toast(tx.welcomeNew(name));
  } else {
    const u = users[email];
    if (!u || (await hashPw(pw, u.salt)) !== u.hash) return fail(tx.errLogin);
    loginAs(email);
    toast(tx.welcomeBack(u.name));
  }
  const next = afterLogin;
  closeAuth();
  if (next) next();
});

function loginAs(email) { session = email; store.set("fs-session", email); renderAll(); }
function logout() {
  session = null; store.set("fs-session", null);
  $("#dropdown").hidden = true;
  renderAll(); toast(t().byeMsg);
}

/* ---------- Header account button ---------- */
onRender(() => {
  const u = currentUser();
  $("#loginBtn").hidden = !!u;
  $("#userMenu").hidden = !u;
  if (u) {
    $("#avatar").textContent = u.name.trim().charAt(0).toUpperCase() || "?";
    $("#uname").textContent = u.name;
    $("#whoEmail").textContent = u.email;
  }
});

$("#loginBtn").onclick = () => openAuth("login");
$("#logoutBtn").onclick = logout;
$("#userBtn").onclick = e => { e.stopPropagation(); $("#dropdown").hidden = !$("#dropdown").hidden; };
$("#ddPlans").onclick = () => { $("#dropdown").hidden = true; };
document.addEventListener("click", e => { if (!e.target.closest(".user-menu")) $("#dropdown").hidden = true; });
