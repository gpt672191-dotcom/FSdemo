// ตัวจับเวลาพักระหว่างเซ็ต (Rest timer)

let tTotal = 60, tLeft = 60, tId = null, tEnd = 0;
function fmt(s) { return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`; }
function drawTimer() {
  $("#tDisplay").textContent = fmt(Math.ceil(tLeft));
  $("#tBar").style.width = `${(tLeft / tTotal) * 100}%`;
  $("#tStart").textContent = tId ? t().pause : t().start;
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
onRender(drawTimer);
