// หน้าแรก: เวที 3D สลับท่าออกกำลังกายอัตโนมัติ (Home hero stage)

(() => {
  const stage = $("#heroStage");
  if (!stage) return;
  const MOVES = ["squat", "dbpress", "jj", "lunge", "curl", "climber", "lateralraise"];
  const HOLD = 4800; // ms per move
  let k = 0, timer = null;

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
      stage.classList.remove("swap");
    }, 260);
  }

  onRender(label);
  const loop = () => { if (document.documentElement.dataset.motion !== "reduce") show(k + 1); };
  timer = setInterval(loop, HOLD);
  $("#heroDots").addEventListener("click", e => {
    const i = [...e.currentTarget.children].indexOf(e.target);
    if (i < 0) return;
    clearInterval(timer); show(i); timer = setInterval(loop, HOLD);
  });
})();
