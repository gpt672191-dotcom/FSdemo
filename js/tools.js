// เครื่องคำนวณ BMI และตัวจับเวลาพัก (BMI calculator and rest timer)

/* ---------- BMI ---------- */
function renderBMI() {
  const t = T[lang], h = parseFloat($("#h").value), w = parseFloat($("#w").value), out = $("#bmiOut");
  if (!(h >= 100 && h <= 230 && w >= 25 && w <= 250)) { out.innerHTML = `<span style="color:var(--muted)">${t.bmiEmpty}</span>`; return; }
  const bmi = w / ((h / 100) ** 2);
  const idx = bmi < 18.5 ? 0 : bmi < 23 ? 1 : bmi < 25 ? 2 : 3;
  // Map BMI 14–34 onto the bar
  const pos = Math.min(100, Math.max(0, (bmi - 14) / 20 * 100));
  out.innerHTML = `
    <b>${bmi.toFixed(1)}</b> · ${t.bmiCat[idx]}
    <div class="bmi-bar"><i style="left:${pos}%"></i></div>
    <div style="color:var(--muted);font-size:.92rem">${t.bmiAdvice[idx]}</div>`;
}
$("#h").addEventListener("input", renderBMI);
$("#w").addEventListener("input", renderBMI);

/* ---------- Rest timer ---------- */
let tTotal = 60, tLeft = 60, tId = null, tEnd = 0;
function fmt(s) { return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }
function drawTimer() {
  $("#tDisplay").textContent = fmt(Math.ceil(tLeft));
  $("#tBar").style.width = `${(tLeft / tTotal) * 100}%`;
  $("#tStart").textContent = tId ? T[lang].pause : T[lang].start;
}
function beep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    [0, .25, .5].forEach(d => {
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.frequency.value = 880; o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(.2, ctx.currentTime + d); g.gain.exponentialRampToValueAtTime(.001, ctx.currentTime + d + .2);
      o.start(ctx.currentTime + d); o.stop(ctx.currentTime + d + .2);
    });
  } catch {}
  if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
}
function stopTimer() { clearInterval(tId); tId = null; }
$("#tStart").onclick = () => {
  if (tId) { stopTimer(); drawTimer(); return; }
  if (tLeft <= 0) tLeft = tTotal;
  tEnd = Date.now() + tLeft * 1000;
  tId = setInterval(() => {
    tLeft = Math.max(0, (tEnd - Date.now()) / 1000);
    if (tLeft <= 0) { stopTimer(); beep(); }
    drawTimer();
  }, 200);
  drawTimer();
};
$("#tReset").onclick = () => { stopTimer(); tLeft = tTotal; drawTimer(); };
$("#presets").addEventListener("click", e => {
  const s = e.target.dataset.sec; if (!s) return;
  stopTimer(); tTotal = tLeft = +s; drawTimer();
});
