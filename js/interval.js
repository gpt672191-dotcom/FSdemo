// จับเวลาแบบช่วง (Interval timer): ออกแรง / พัก สลับกันหลายรอบ มีเสียงเตือน (more.html#interval)

const IV_T = {
  th: { title: "จับเวลาแบบช่วง (Interval)", sub: "ออกแรงสลับพักหลายรอบ เหมาะกับคาร์ดิโอและวงจรเผาผลาญ มีเสียงบอกทุกช่วง",
    work: "ออกแรง (วินาที)", rest: "พัก (วินาที)", rounds: "จำนวนรอบ", ready: "เตรียมตัว", go: "ออกแรง", relax: "พัก", done: "ครบแล้ว เยี่ยมมาก",
    round: (a, b) => `รอบ ${a}/${b}`, total: s => `รวม ${Math.floor(s / 60)} นาที ${s % 60} วินาที`, start: "เริ่ม", pause: "หยุด", resume: "เล่นต่อ", reset: "รีเซ็ต",
    presets: [["มือใหม่", 20, 40, 6], ["ทาบาตะ", 20, 10, 8], ["30/30", 30, 30, 10]] },
  en: { title: "Interval timer", sub: "Work and rest for several rounds. Great for cardio and circuits, with a sound at every switch.",
    work: "Work (seconds)", rest: "Rest (seconds)", rounds: "Rounds", ready: "Get ready", go: "Work", relax: "Rest", done: "All done, great job",
    round: (a, b) => `Round ${a}/${b}`, total: s => `Total ${Math.floor(s / 60)} min ${s % 60} s`, start: "Start", pause: "Pause", resume: "Resume", reset: "Reset",
    presets: [["Beginner", 20, 40, 6], ["Tabata", 20, 10, 8], ["30/30", 30, 30, 10]] }
};
const ivt = () => IV_T[lang];

const IV = { phases: [], i: 0, end: 0, left: 0, running: false, timer: null, audio: null, wake: null, lastSec: null };
const ivNum = (id, lo, hi, d) => { const v = Math.round(+$("#" + id).value); return v >= lo && v <= hi ? v : d; };

function ivBeep(freq, len) {
  try {
    IV.audio = IV.audio || new (window.AudioContext || window.webkitAudioContext)();
    const o = IV.audio.createOscillator(), g = IV.audio.createGain();
    o.frequency.value = freq; o.connect(g); g.connect(IV.audio.destination);
    g.gain.setValueAtTime(.25, IV.audio.currentTime); g.gain.exponentialRampToValueAtTime(.001, IV.audio.currentTime + len);
    o.start(); o.stop(IV.audio.currentTime + len);
  } catch {}
}

function ivBuild() {
  const w = ivNum("ivWork", 5, 600, 30), r = ivNum("ivRest", 0, 600, 15), n = ivNum("ivRounds", 1, 50, 8);
  const ph = [{ k: "ready", s: 5 }];
  for (let i = 1; i <= n; i++) { ph.push({ k: "go", s: w, r: i, n }); if (i < n && r) ph.push({ k: "relax", s: r, r: i, n }); }
  return ph;
}

function ivDraw() {
  const tx = ivt(), box = $("#ivBox"); if (!box) return;
  const ph = IV.phases[IV.i], sec = Math.ceil(IV.left);
  const k = ph ? ph.k : (IV.finished ? "done" : "idle");
  box.dataset.phase = k;
  $("#ivPhase").textContent = { ready: tx.ready, go: tx.go, relax: tx.relax, done: tx.done, idle: "" }[k];
  $("#ivRound").textContent = ph && ph.r ? tx.round(ph.r, ph.n) : "";
  $("#ivTime").textContent = ph ? `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(sec % 60).padStart(2, "0")}` : "00:00";
  $("#ivBar").style.width = ph ? `${(IV.left / ph.s) * 100}%` : "0%";
  $("#ivStart").textContent = IV.running ? tx.pause : (IV.phases.length && !IV.finished ? tx.resume : tx.start);
  const w = ivNum("ivWork", 5, 600, 30), r = ivNum("ivRest", 0, 600, 15), n = ivNum("ivRounds", 1, 50, 8);
  $("#ivTotal").textContent = tx.total(w * n + r * (n - 1));
}

function ivEnter(i) {
  IV.i = i; IV.lastSec = null;
  const ph = IV.phases[i];
  if (!ph) { ivStop(); IV.finished = true; IV.phases = []; ivBeep(660, .2); setTimeout(() => ivBeep(990, .4), 220); if (navigator.vibrate) navigator.vibrate([200, 100, 200, 100, 300]); ivDraw(); return; }
  IV.left = ph.s; IV.end = Date.now() + ph.s * 1000;
  if (ph.k === "go") { ivBeep(1200, .35); if (navigator.vibrate) navigator.vibrate(300); }
  if (ph.k === "relax") { ivBeep(500, .35); if (navigator.vibrate) navigator.vibrate([100, 80, 100]); }
  ivDraw();
}

function ivTick() {
  if (!IV.running) return;
  IV.left = Math.max(0, (IV.end - Date.now()) / 1000);
  const sec = Math.ceil(IV.left);
  if (sec !== IV.lastSec && sec > 0 && sec <= 3) ivBeep(760, .1);
  IV.lastSec = sec;
  if (IV.left <= 0) return ivEnter(IV.i + 1);
  ivDraw();
}

async function ivStartStop() {
  if (IV.running) { IV.running = false; IV.left = Math.max(0, (IV.end - Date.now()) / 1000); clearInterval(IV.timer); ivDraw(); return; }
  if (!IV.phases.length) { IV.phases = ivBuild(); IV.finished = false; ivEnter(0); }
  else IV.end = Date.now() + IV.left * 1000;
  IV.running = true;
  ivBeep(880, .01); // unlock audio on this tap
  try { if ("wakeLock" in navigator && !IV.wake) IV.wake = await navigator.wakeLock.request("screen"); } catch {}
  clearInterval(IV.timer); IV.timer = setInterval(ivTick, 100);
  ivDraw();
}
function ivStop() {
  IV.running = false; clearInterval(IV.timer);
  try { if (IV.wake) IV.wake.release(); } catch {}
  IV.wake = null;
}

function ivRender() {
  const sec = $("#interval"); if (!sec) return;
  const tx = ivt();
  if (!sec.dataset.built) {
    sec.dataset.built = 1;
    sec.innerHTML = `<div class="wrap" style="max-width:520px"><div class="panel tool">
      <h2 class="sub-h" id="ivTitle"></h2><p id="ivSub"></p>
      <div class="center" id="ivPresets"></div>
      <div class="iv-fields">
        <div class="field"><label for="ivWork" id="ivWorkL"></label><input id="ivWork" type="number" inputmode="numeric" min="5" max="600" value="30"></div>
        <div class="field"><label for="ivRest" id="ivRestL"></label><input id="ivRest" type="number" inputmode="numeric" min="0" max="600" value="15"></div>
        <div class="field"><label for="ivRounds" id="ivRoundsL"></label><input id="ivRounds" type="number" inputmode="numeric" min="1" max="50" value="8"></div>
      </div>
      <p class="iv-total" id="ivTotal"></p>
      <div class="iv-box" id="ivBox" aria-live="polite">
        <div class="iv-phase" id="ivPhase"></div>
        <div class="timer-display" id="ivTime">00:00</div>
        <div class="iv-round" id="ivRound"></div>
        <div class="timer-ring"><div id="ivBar"></div></div>
      </div>
      <div class="center"><button type="button" class="btn" id="ivStart"></button><button type="button" class="btn ghost" id="ivReset"></button></div>
    </div></div>`;
    $("#ivStart").onclick = ivStartStop;
    $("#ivReset").onclick = () => { ivStop(); IV.phases = []; IV.finished = false; IV.left = 0; ivDraw(); };
    $("#ivPresets").addEventListener("click", e => {
      const b = e.target.closest("[data-iv]"); if (!b) return;
      const [w, r, n] = b.dataset.iv.split(",");
      $("#ivWork").value = w; $("#ivRest").value = r; $("#ivRounds").value = n;
      ivStop(); IV.phases = []; IV.finished = false; ivDraw();
    });
    sec.addEventListener("input", e => { if (e.target.matches("input") && !IV.running) { IV.phases = []; IV.finished = false; ivDraw(); } });
  }
  $("#ivTitle").textContent = tx.title; $("#ivSub").textContent = tx.sub;
  $("#ivWorkL").textContent = tx.work; $("#ivRestL").textContent = tx.rest; $("#ivRoundsL").textContent = tx.rounds;
  $("#ivReset").textContent = tx.reset;
  $("#ivPresets").innerHTML = tx.presets.map(([name, w, r, n]) => `<button type="button" class="btn ghost sm" data-iv="${w},${r},${n}">${name} <small>${w}/${r} × ${n}</small></button>`).join("");
  ivDraw();
}
onRender(ivRender);
