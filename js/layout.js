// ส่วนหัว เมนู หน้าต่างเข้าสู่ระบบ และส่วนท้าย ที่ใช้ร่วมกันทุกหน้า
// (Shared header, menu, login window and footer — written once here, added to every page)
// แต่ละหน้าบอกว่าตัวเองคือหน้าไหนผ่าน <body data-page="...">

const NAV = [
  { page: "home",   href: "index.html",       key: "navHome" },
  { page: "foryou", href: "for-you.html",     key: "navForYou" },
  { page: "muscle", href: "muscle.html",      key: "navMuscle" },
  { page: "lose",   href: "weight-loss.html", key: "navLose" },
  { page: "plan",   href: "planner.html",     key: "navPlan" },
  { page: "bmi",    href: "bmi.html",         key: "navBmi" },
  { page: "more",   href: "more.html",        key: "navMore" }
];
const PAGE = document.body.dataset.page;

const navLinks = NAV.map(n =>
  `<a href="${n.href}" data-i18n="${n.key}"${n.page === PAGE ? ' class="active" aria-current="page"' : ""}></a>`
).join("");

// Animated background: soft colour blobs and a dot grid
document.body.insertAdjacentHTML("afterbegin", '<div class="bg-fx" aria-hidden="true"><span class="blob b1"></span><span class="blob b2"></span><span class="blob b3"></span><span class="dots"></span></div>');

document.body.insertAdjacentHTML("afterbegin", `
<header>
  <div class="wrap nav">
    <a href="index.html" class="logo" aria-label="FitStart AI"><img class="logo-mark" src="img/logo.svg" alt="" width="34" height="34"><span>FitStart</span><span class="logo-ai">AI</span></a>
    <nav class="nav-links" id="navLinks">${navLinks}</nav>
    <div class="nav-right">
      <div class="lang" role="group" aria-label="Language">
        <button type="button" data-lang="th">TH</button>
        <button type="button" data-lang="en">EN</button>
      </div>
      <button type="button" class="btn sm" id="loginBtn" data-i18n="login"></button>
      <div class="user-menu" id="userMenu" hidden>
        <button type="button" class="user-btn" id="userBtn" aria-haspopup="true">
          <span class="avatar" id="avatar"></span><span class="uname" id="uname"></span>
        </button>
        <div class="dropdown" id="dropdown" hidden>
          <div class="who" id="whoEmail"></div>
          <a href="profile.html"><i data-icon="user"></i><span data-i18n="navProfile"></span></a>
          <a href="for-you.html"><i data-icon="sparkle"></i><span data-i18n="navForYou"></span></a>
          <a href="planner.html#myplans" id="ddPlans"><i data-icon="clipboard"></i><span data-i18n="myPlans"></span></a>
          <a href="settings.html"${PAGE === "settings" ? ' aria-current="page"' : ""}><i data-icon="gear"></i><span data-i18n="navSettings"></span></a>
          <button type="button" id="logoutBtn" data-i18n="logout"></button>
        </div>
      </div>
      <button type="button" class="menu-btn" id="menuBtn" aria-controls="navLinks" aria-expanded="false"><i data-icon="menu"></i></button>
    </div>
  </div>
</header>

<div class="modal-bg" id="authModal" hidden>
  <div class="modal" role="dialog" aria-modal="true" aria-labelledby="authTitle">
    <button type="button" class="close" id="authClose" aria-label="Close">✕</button>
    <h2 id="authTitle" style="margin:0 0 4px;font-size:1.35rem"></h2>
    <p id="authSub" style="margin:0;color:var(--muted);font-size:.92rem"></p>
    <div class="tabs">
      <button type="button" data-tab="login" data-i18n="login"></button>
      <button type="button" data-tab="signup" data-i18n="signup"></button>
    </div>
    <form id="authForm" novalidate>
      <div class="field" id="nameField">
        <label for="aName" data-i18n="name"></label>
        <input id="aName" type="text" autocomplete="name" maxlength="40">
      </div>
      <div class="field">
        <label for="aEmail" data-i18n="email"></label>
        <input id="aEmail" type="email" autocomplete="email" placeholder="you@example.com">
      </div>
      <div class="field">
        <label for="aPw" data-i18n="password"></label>
        <div class="pw-wrap">
          <input id="aPw" type="password" autocomplete="current-password">
          <button type="button" class="pw-toggle" data-for="aPw"></button>
        </div>
      </div>
      <div class="field" id="pw2Field">
        <label for="aPw2" data-i18n="confirmPw"></label>
        <div class="pw-wrap">
          <input id="aPw2" type="password" autocomplete="new-password">
          <button type="button" class="pw-toggle" data-for="aPw2"></button>
        </div>
      </div>
      <div id="bodyFields">
        <div class="body-title" data-i18n="bodyInfo"></div>
        <div class="field-row">
          <div class="field">
            <label for="aSex" data-i18n="sex"></label>
            <select id="aSex"><option value="m"></option><option value="f"></option></select>
          </div>
          <div class="field">
            <label for="aAge" data-i18n="age"></label>
            <input id="aAge" type="number" inputmode="numeric" min="13" max="90" placeholder="25">
          </div>
          <div class="field">
            <label for="aH" data-i18n="height"></label>
            <input id="aH" type="number" inputmode="decimal" min="100" max="230" placeholder="165">
          </div>
          <div class="field">
            <label for="aW" data-i18n="weight"></label>
            <input id="aW" type="number" inputmode="decimal" min="25" max="250" placeholder="60">
          </div>
        </div>
      </div>
      <div class="form-err" id="authErr" role="alert"></div>
      <button type="submit" class="btn" id="authSubmit"></button>
    </form>
    <div class="switch-line"><span id="switchText"></span> <button type="button" id="switchBtn"></button></div>
    <div class="demo-note"><i data-icon="flask"></i> <span data-i18n="demoNote"></span></div>
  </div>
</div>`);

$("main").insertAdjacentHTML("afterend", `
<footer>
  <div class="wrap">
    <nav class="foot-links">${NAV.map(n => `<a href="${n.href}" data-i18n="${n.key}"></a>`).join("")}</nav>
    <p data-i18n="disclaimer"></p>
    <p>© 2026 FitStart AI</p>
  </div>
</footer>`);

/* ---------- Bottom tab bar (phones only, shown by CSS) ---------- */
const TABS = [
  { page: "home",   href: "index.html",       key: "navHome",   ic: "home" },
  { page: "muscle", href: "muscle.html",      key: "navMuscle", ic: "dumbbell" },
  { page: "lose",   href: "weight-loss.html", key: "navLose",   ic: "flame" },
  { page: "plan",   href: "planner.html",     key: "navPlan",   ic: "clipboard" }
];
document.body.insertAdjacentHTML("beforeend", `
<nav class="tabbar" aria-label="Main">
  ${TABS.map(n => `<a href="${n.href}"${n.page === PAGE ? ' class="on" aria-current="page"' : ""}><i data-icon="${n.ic}"></i><span data-i18n="${n.key}"></span></a>`).join("")}
  <button type="button" id="tabMenu" aria-controls="navLinks" aria-expanded="false"${TABS.some(n => n.page === PAGE) ? "" : ' class="on"'}><i data-icon="menu"></i><span data-i18n="menu"></span></button>
</nav>`);

/* ---------- Mobile menu (header ☰ on tablets, "Menu" tab on phones) ---------- */
function toggleMenu(e) {
  e.stopPropagation();
  const open = $("#navLinks").classList.toggle("open");
  $("#menuBtn").setAttribute("aria-expanded", open);
  $("#tabMenu").setAttribute("aria-expanded", open);
}
$("#menuBtn").onclick = toggleMenu;
$("#tabMenu").onclick = toggleMenu;
document.addEventListener("click", e => {
  if (!e.target.closest("#navLinks")) {
    $("#navLinks").classList.remove("open");
    $("#menuBtn").setAttribute("aria-expanded", "false");
    $("#tabMenu").setAttribute("aria-expanded", "false");
  }
});

/* ---------- Language switch ---------- */
$$(".lang button").forEach(b => b.onclick = () => { lang = b.dataset.lang; store.set("fs-lang", lang); renderAll(); });
onRender(() => {
  $$(".lang button").forEach(b => b.classList.toggle("on", b.dataset.lang === lang));
  $("#menuBtn").setAttribute("aria-label", t().menu);
  // Male/female labels in every sex <select> on the page
  $$("select#aSex, select#cSex, select#fSex").forEach(s => { s.options[0].textContent = t().male; s.options[1].textContent = t().female; });
});
