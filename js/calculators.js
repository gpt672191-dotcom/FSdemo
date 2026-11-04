// เครื่องคำนวณโปรตีน (หน้าสร้างกล้าม) และแคลอรี่ (หน้าลดน้ำหนัก)
// (Protein and calorie calculators) — each runs only if its box is on the page

/* ---------- Protein: 1.6–2.2 g per kg body weight ---------- */
if ($("#protOut")) {
  const renderProtein = () => {
    const tx = t(), w = num("pw", 25, 250), out = $("#protOut");
    if (isNaN(w)) { out.innerHTML = `<span style="color:var(--muted)">${tx.calEmpty}</span>`; return; }
    const lo = Math.round(w * 1.6), hi = Math.round(w * 2.2);
    const chicken = Math.round(((lo + hi) / 2) / 0.31 / 10) * 10; // grams of chicken breast at ~31 g protein / 100 g
    out.innerHTML = `
      <div class="result-row">
        <div class="result"><small>${tx.protMin}</small><b>${lo}</b> ${tx.gPerDay}</div>
        <div class="result acc"><small>${tx.protMax}</small><b>${hi}</b> ${tx.gPerDay}</div>
      </div>
      <p class="hint">${tx.protHint(chicken)}</p>`;
  };
  $("#pw").addEventListener("input", renderProtein);
  onRender(renderProtein);
}

/* ---------- Calories: Mifflin-St Jeor BMR × activity factor ---------- */
if ($("#calOut")) {
  const FACTORS = [1.2, 1.375, 1.55, 1.725, 1.9];
  const renderCalories = () => {
    const tx = t(), out = $("#calOut");
    // Activity select text follows the language
    const sel = $("#cAct"), cur = sel.value || "1";
    sel.innerHTML = FACTORS.map((_, i) => `<option value="${i + 1}">${tx[`act_${i + 1}`]}</option>`).join("");
    sel.value = cur;
    $("#cSex").options[0].textContent = tx.male;
    $("#cSex").options[1].textContent = tx.female;

    const age = num("cAge", 15, 90), h = num("cH", 100, 230), w = num("cW", 25, 250);
    if (isNaN(age) || isNaN(h) || isNaN(w)) { out.innerHTML = `<span style="color:var(--muted)">${tx.calEmpty}</span>`; return; }
    const bmr = 10 * w + 6.25 * h - 5 * age + ($("#cSex").value === "m" ? 5 : -161);
    const tdee = bmr * FACTORS[+sel.value - 1];
    // Common safe floor: 1,500 kcal (men) / 1,200 kcal (women)
    const floor = $("#cSex").value === "m" ? 1500 : 1200;
    const lose = Math.max(floor, tdee - 500), fast = Math.max(floor, tdee - 750);
    const r = x => Math.round(x / 10) * 10;
    out.innerHTML = `
      <div class="result-row">
        <div class="result"><small>${tx.calBmr}</small><b>${r(bmr)}</b> ${tx.kcal}</div>
        <div class="result"><small>${tx.calMaintain}</small><b>${r(tdee)}</b> ${tx.kcal}</div>
        <div class="result acc"><small>${tx.calLose}</small><b>${r(lose)}</b> ${tx.kcal}</div>
        <div class="result"><small>${tx.calLoseFast}</small><b>${r(fast)}</b> ${tx.kcal}</div>
      </div>
      <p class="hint">${tx.calHint}</p>`;
  };
  ["cSex", "cAge", "cH", "cW", "cAct"].forEach(id => $("#" + id).addEventListener("input", renderCalories));
  onRender(renderCalories);
}
