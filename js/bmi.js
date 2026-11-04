// หน้าคำนวณ BMI (BMI page) — ใช้เกณฑ์คนเอเชีย WHO Asia-Pacific

const BMI_LINKS = ["muscle.html", "planner.html", "weight-loss.html", "weight-loss.html"];

function renderBMI() {
  const tx = t(), h = num("h", 100, 230), w = num("w", 25, 250), out = $("#bmiOut");
  if (isNaN(h) || isNaN(w)) { out.innerHTML = `<span style="color:var(--muted)">${tx.bmiEmpty}</span>`; return; }
  const m = h / 100;
  const bmi = w / (m * m);
  const idx = bmi < 18.5 ? 0 : bmi < 23 ? 1 : bmi < 25 ? 2 : 3;
  // Map BMI 14–34 onto the bar
  const pos = Math.min(100, Math.max(0, (bmi - 14) / 20 * 100));
  const lo = (18.5 * m * m).toFixed(1), hi = (22.9 * m * m).toFixed(1);
  out.innerHTML = `
    <b>${bmi.toFixed(1)}</b> · ${tx.bmiCat[idx]}
    <div class="bmi-bar"><i style="left:${pos}%"></i></div>
    <div style="color:var(--muted);font-size:.92rem">${tx.bmiAdvice[idx]}</div>
    <p style="margin:10px 0 0;font-size:.92rem">${tx.idealRange(lo, hi)}</p>
    <p style="margin:10px 0 0"><a href="${BMI_LINKS[idx]}" style="color:var(--accent);font-weight:600;text-decoration:none">${tx.bmiLink[idx]}</a></p>`;
}

function renderBmiTable() {
  const tx = t();
  const rows = [
    ["#60a5fa", "< 18.5"], ["#22c55e", "18.5 – 22.9"], ["#f59e0b", "23 – 24.9"], ["#ef4444", "≥ 25"]
  ];
  $("#bmiTable").innerHTML = rows.map(([c, r], i) =>
    `<tr><td><span class="dot" style="background:${c}"></span>${tx.bmiCat[i]}</td><td style="text-align:right">${r}</td></tr>`
  ).join("");
}

$("#h").addEventListener("input", renderBMI);
$("#w").addEventListener("input", renderBMI);
onRender(renderBMI);
onRender(renderBmiTable);
