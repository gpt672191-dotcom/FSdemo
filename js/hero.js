// หน้าแรก: เวที 3D สลับท่าออกกำลังกายอัตโนมัติ + ตัวเลขชีพจร/แคลอรี่/จำนวนครั้ง (Home hero stage)

(() => {
  const stage = $("#heroStage");
  if (!stage) return;
  const MOVES = ["squat", "dbpress", "jj", "lunge", "curl", "climber", "lateralraise"];
  const HOLD = 4800; // ms per move
  let k = 0, reps = 0, kcal = 245, bpm = 128, timer = null;

  const muscles = ex => {
    const tx = t(), ms = (MUSCLES[ex.id] || []).map(g => tx[`mg_${g}`]);
    return ms.length ? ms.slice(0, 3).join(" · ") : tx[`part_${ex.cat}`].split(" (")[0];
  };
  function label() {
    const ex = EX.find(e => e.id === MOVES[k]);
    $("#heroMove").textContent = ex ? ex[lang].split(" (")[0] : "";
    $("#heroMuscles").textContent = ex ? muscles(ex) : "";
    $("#heroDots").innerHTML = MOVES.map((_, i) => `<i class="${i === k ? "on" : ""}"></i>`).join("");
  }
  function show(next) {
    k = (next + MOVES.length) % MOVES.length;
    stage.classList.add("swap");
    setTimeout(() => {
      stage.innerHTML = `<div class="fig" data-fig="${MOVES[k]}"></div>`; // figures.js mounts it automatically
      label();
      reps = 0;
      stage.classList.remove("swap");
    }, 260);
  }

  // Live-looking numbers
  function tick() {
    if (document.documentElement.dataset.motion === "reduce") return;
    reps = Math.min(12, reps + 1);
    bpm = Math.max(112, Math.min(156, bpm + Math.round(Math.random() * 6 - 2)));
    kcal += Math.random() < 0.6 ? 1 : 0;
    $("#heroReps").textContent = reps;
    $("#heroRepArc").style.strokeDashoffset = String(113.1 * (1 - reps / 12));
    $("#heroBpm").textContent = bpm;
    $("#heroKcal").textContent = kcal;
  }

  onRender(label);
  setInterval(tick, 420);
  const loop = () => { if (document.documentElement.dataset.motion !== "reduce") show(k + 1); };
  timer = setInterval(loop, HOLD);
  $("#heroDots").addEventListener("click", e => {
    const i = [...e.currentTarget.children].indexOf(e.target);
    if (i < 0) return;
    clearInterval(timer); show(i); timer = setInterval(loop, HOLD);
  });
})();
