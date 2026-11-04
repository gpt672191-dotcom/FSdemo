// หน้าข้อมูลส่วนตัว: แสดงและแก้ไขข้อมูลสมาชิก (Profile page)

let profileFilled = false; // fill the edit form once, so a language switch doesn't wipe typing

function renderProfile() {
  const tx = t(), u = currentUser();
  $("#pGuest").hidden = !!u;
  $("#pMain").hidden = !u;
  if (!u) { profileFilled = false; return; }

  const p = u.profile || {};
  const dateFmt = new Intl.DateTimeFormat(lang === "th" ? "th-TH" : "en-GB", { dateStyle: "long" });
  $("#pAvatar").textContent = u.name.trim().charAt(0).toUpperCase() || "?";
  $("#pName").textContent = u.name;
  $("#pEmail").textContent = u.email;
  $("#pSince").textContent = `${tx.memberSince} ${dateFmt.format(u.created)}`;
  $("#pPlans").textContent = tx.plansCount(u.plans.length);

  const val = (v, unit) => (v ? `<b>${v}</b> ${unit}` : `<span style="color:var(--muted)">${tx.notSet}</span>`);
  let bmiHtml = `<span style="color:var(--muted)">${tx.notSet}</span>`;
  if (p.height && p.weight) {
    const b = health.bmi(p.weight, p.height);
    bmiHtml = `<b>${b.toFixed(1)}</b> ${tx.bmiCat[health.bmiIdx(b)]}`;
  }
  const label = s => s.split(" (")[0]; // "น้ำหนัก (กก.)" -> "น้ำหนัก" since the unit is shown after the number
  $("#pStats").innerHTML = `
    <div class="result"><small>${label(tx.weight)}</small>${val(p.weight, tx.kg)}</div>
    <div class="result"><small>${label(tx.height)}</small>${val(p.height, tx.cm)}</div>
    <div class="result"><small>${label(tx.age)}</small>${val(p.age, tx.years)}</div>
    <div class="result"><small>${tx.sex}</small>${p.sex ? `<b>${p.sex === "f" ? tx.female : tx.male}</b>` : val(0)}</div>
    <div class="result acc"><small>BMI</small>${bmiHtml}</div>`;

  if (!profileFilled) {
    $("#fName").value = u.name;
    $("#fSex").value = p.sex || "m";
    $("#fAge").value = p.age || "";
    $("#fH").value = p.height || "";
    $("#fW").value = p.weight || "";
    profileFilled = true;
  }
}
onRender(renderProfile);

$("#pLogin").onclick = () => openAuth("login");
$("#pSignup").onclick = () => openAuth("signup");

$("#profileForm").addEventListener("submit", e => {
  e.preventDefault();
  const tx = t(), err = $("#fErr");
  const name = $("#fName").value.trim();
  if (!name) { err.textContent = tx.errName; return; }
  const body = readBody("f");
  if (body.error) { err.textContent = tx[body.error]; return; }
  err.textContent = "";
  updateUser(u => { u.name = name; u.profile = { ...(u.profile || {}), ...body.data }; });
  renderAll();
  toast(tx.savedProfile);
});
