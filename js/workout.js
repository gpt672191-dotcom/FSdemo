// โหมดนำออกกำลังกาย: บอกท่าต่อไป → นับ 5-4-3-2-1 → ออกกำลังกาย → พักนับถอยหลัง (ข้าม / +15 วิ ได้) → ท่าต่อไป
// (Guided workout player — full-screen overlay)
//
// Workout.start({ title, rest: 60, items: [{ ex, sets: 3, target: "8–12", secs: null }] })
//   ex     = an exercise from EX (data.js)
//   target = rep text shown for rep-based moves (secs = null → user presses "Done")
//   secs   = seconds for timed moves (plank, cardio intervals) — counts down by itself

const WO_T = {
  th: {
    move: "ท่า", next: "ท่าต่อไป", ready: "เตรียมตัว", work: "ออกกำลังกาย", rest: "พัก", set: "เซ็ต", of: "จาก",
    reps: n => `${n} ครั้ง`, secs: n => `${n} วินาที`, done: "เสร็จแล้ว", skip: "ข้าม", add: "+15 วิ",
    pause: "หยุด", resume: "เล่นต่อ", close: "ปิด", sound: "เสียง", upNext: "ถัดไป",
    finTitle: "เยี่ยมมาก! ออกกำลังกายเสร็จแล้ว", finSub: "พักดื่มน้ำ แล้วยืดกล้ามเนื้อเบาๆ นะ",
    finEx: "ท่า", finSets: "เซ็ต", finMin: "นาที", again: "เล่นอีกครั้ง",
    sayNext: (n, s, all) => `ท่าต่อไป ${n} เซ็ตที่ ${s} จาก ${all}`, sayRest: "พักก่อน", sayGo: "เริ่ม", sayDone: "เยี่ยมมาก ออกกำลังกายเสร็จแล้ว",
    tapDone: "ทำครบแล้วกด \"เสร็จแล้ว\""
  },
  en: {
    move: "Move", next: "Next up", ready: "Get ready", work: "Work", rest: "Rest", set: "Set", of: "of",
    reps: n => `${n} reps`, secs: n => `${n} seconds`, done: "Done", skip: "Skip", add: "+15 s",
    pause: "Pause", resume: "Resume", close: "Close", sound: "Sound", upNext: "Up next",
    finTitle: "Great job! Workout complete", finSub: "Have some water and stretch gently.",
    finEx: "exercises", finSets: "sets", finMin: "min", again: "Do it again",
    sayNext: (n, s, all) => `Next, ${n}. Set ${s} of ${all}`, sayRest: "Rest", sayGo: "Go", sayDone: "Great job, workout complete",
    tapDone: "Press \"Done\" when you finish the set"
  }
};

const Workout = (() => {
  const wt = () => WO_T[lang];
  let S = null;           // current session
  let soundOn = store.get("fs-wo-sound", true);
  let audio = null, wake = null;

  /* ---------- sound + voice ---------- */
  function beep(freq = 880, len = .15) {
    if (!soundOn) return;
    try {
      audio = audio || new (window.AudioContext || window.webkitAudioContext)();
      const o = audio.createOscillator(), g = audio.createGain();
      o.frequency.value = freq; o.connect(g); g.connect(audio.destination);
      g.gain.setValueAtTime(.25, audio.currentTime); g.gain.exponentialRampToValueAtTime(.001, audio.currentTime + len);
      o.start(); o.stop(audio.currentTime + len);
    } catch {}
  }
  function say(text) {
    if (!soundOn || !("speechSynthesis" in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(text);
      u.lang = lang === "th" ? "th-TH" : "en-US";
      const v = speechSynthesis.getVoices().find(v => v.lang && v.lang.replace("_", "-").startsWith(u.lang.slice(0, 2)));
      if (v) u.voice = v;
      u.rate = 1;
      speechSynthesis.speak(u);
    } catch {}
  }

  /* ---------- build the step list ---------- */
  function build(items) {
    const steps = [];
    items.forEach((it, i) => {
      for (let s = 1; s <= it.sets; s++) {
        steps.push({ kind: "count", it, s, dur: 5 });
        steps.push({ kind: "work", it, s, dur: it.secs || 0 });
        const last = i === items.length - 1 && s === it.sets;
        if (!last) steps.push({ kind: "rest", dur: S.rest });
      }
    });
    // Each rest step knows what comes next
    steps.forEach((st, k) => { if (st.kind === "rest") { const n = steps[k + 1]; st.next = { it: n.it, s: n.s }; } });
    return steps;
  }

  /* ---------- overlay ---------- */
  function mount() {
    document.body.insertAdjacentHTML("beforeend", `
      <div class="wo" id="wo" role="dialog" aria-modal="true">
        <div class="wo-top">
          <button type="button" class="wo-ic" data-wo="close" aria-label="close">${icon("close")}</button>
          <div class="wo-title"><b id="woTitle"></b><small id="woStep"></small></div>
          <button type="button" class="wo-ic" data-wo="sound" id="woSound" aria-label="sound"></button>
        </div>
        <div class="wo-prog"><i id="woProg"></i></div>
        <div class="wo-body" id="woBody"></div>
      </div>`);
    document.body.classList.add("wo-open");
    $("#wo").addEventListener("click", onClick);
    drawSound();
  }
  function drawSound() {
    const b = $("#woSound"); if (!b) return;
    b.innerHTML = soundOn ? icon("bell") : icon("bellOff");
    b.classList.toggle("off", !soundOn);
  }

  const ring = (cls = "") => `
    <div class="wo-ring ${cls}">
      <svg viewBox="0 0 120 120"><circle class="wo-track" cx="60" cy="60" r="54"/><circle class="wo-arc" id="woArc" cx="60" cy="60" r="54"/></svg>
      <div class="wo-num" id="woNum"></div>
    </div>`;

  function render() {
    const tx = wt(), st = S.steps[S.i], body = $("#woBody");
    $("#woTitle").textContent = S.title;
    const cur = st.it || st.next.it, setNo = st.s || st.next.s;
    $("#woStep").textContent = `${tx.move} ${S.items.indexOf(cur) + 1}/${S.items.length} · ${tx.set} ${setNo}/${cur.sets}`;
    $("#woProg").style.width = `${(S.i / S.steps.length) * 100}%`;
    const pauseBtn = `<button type="button" class="wo-btn ghost" data-wo="pause">${S.paused ? icon("play") + tx.resume : icon("pause") + tx.pause}</button>`;
    const exName = it => it.ex[lang];
    const goal = it => (it.secs ? tx.secs(it.secs) : tx.reps(it.target));

    if (st.kind === "count") {
      body.className = "wo-body is-count";
      body.innerHTML = `
        <span class="wo-tag">${tx.next}</span>
        <h2 class="wo-name">${exName(st.it)}</h2>
        <p class="wo-sub">${tx.set} ${st.s}/${st.it.sets} · ${goal(st.it)}</p>
        <div class="wo-fig"><div class="fig" data-fig="${st.it.ex.id}"></div></div>
        ${ring("big")}
        <div class="wo-ctrl">${pauseBtn}<button type="button" class="wo-btn" data-wo="skip">${icon("skip")}${tx.skip}</button></div>`;
    } else if (st.kind === "work") {
      body.className = "wo-body is-work";
      const cue = lang === "th" ? st.it.ex.cth : st.it.ex.cen;
      body.innerHTML = `
        <span class="wo-tag work">${tx.work} · ${tx.set} ${st.s}/${st.it.sets}</span>
        <h2 class="wo-name">${exName(st.it)}</h2>
        <p class="wo-sub">${cue}</p>
        <div class="wo-fig big"><div class="fig" data-fig="${st.it.ex.id}"></div></div>
        ${st.dur ? ring() : `<div class="wo-reps"><b>${st.it.target}</b><span>${tx.reps("").trim()}</span><small>${tx.tapDone}</small></div>`}
        <div class="wo-ctrl">
          ${st.dur ? pauseBtn : ""}
          <button type="button" class="wo-btn main" data-wo="skip">${icon("check")}${tx.done}</button>
        </div>`;
    } else if (st.kind === "rest") {
      body.className = "wo-body is-rest";
      body.innerHTML = `
        <span class="wo-tag rest">${tx.rest}</span>
        ${ring("big")}
        <div class="wo-ctrl">
          <button type="button" class="wo-btn ghost" data-wo="add">${tx.add}</button>
          ${pauseBtn}
          <button type="button" class="wo-btn main" data-wo="skip">${icon("skip")}${tx.skip}</button>
        </div>
        <div class="wo-next">
          <div class="fig" data-fig="${st.next.it.ex.id}"></div>
          <div><small>${tx.upNext}</small><b>${exName(st.next.it)}</b><span>${tx.set} ${st.next.s}/${st.next.it.sets} · ${goal(st.next.it)}</span></div>
        </div>`;
    }
    tick(true);
  }

  function finish() {
    clearInterval(S.timer);
    const tx = wt(), mins = Math.max(1, Math.round((Date.now() - S.started) / 60000));
    const sets = S.items.reduce((a, it) => a + it.sets, 0);
    // Save to progress (progress.js), if the page has it and the user is logged in
    let saved = "";
    if (typeof Progress !== "undefined") {
      saved = Progress.logWorkout({ t: S.title, sets, mins })
        ? `<p class="wo-saved">${icon("check")}${pt().logged}</p>`
        : `<p class="wo-saved off">${pt().loginToLog}</p>`;
    }
    $("#woProg").style.width = "100%";
    $("#woStep").textContent = "";
    $("#woBody").className = "wo-body is-done";
    $("#woBody").innerHTML = `
      <div class="wo-trophy">${icon("trophy")}</div>
      <h2 class="wo-name">${tx.finTitle}</h2>
      <p class="wo-sub">${tx.finSub}</p>
      ${saved}
      <div class="wo-stats">
        <div><b>${S.items.length}</b><span>${tx.finEx}</span></div>
        <div><b>${sets}</b><span>${tx.finSets}</span></div>
        <div><b>${mins}</b><span>${tx.finMin}</span></div>
      </div>
      <div class="wo-ctrl">
        <button type="button" class="wo-btn ghost" data-wo="again">${icon("refresh")}${tx.again}</button>
        <button type="button" class="wo-btn main" data-wo="close">${tx.close}</button>
      </div>`;
    beep(660, .2); setTimeout(() => beep(990, .35), 220);
    say(tx.sayDone);
  }

  /* ---------- timing ---------- */
  function enter(i) {
    S.i = i;
    if (i >= S.steps.length) return finish();
    const st = S.steps[i], tx = wt();
    S.total = st.dur * 1000;
    S.end = Date.now() + S.total;
    S.lastSec = null;
    if (st.kind === "count") say(tx.sayNext(st.it.ex[lang], st.s, st.it.sets));
    if (st.kind === "rest") say(tx.sayRest);
    if (st.kind === "work") { beep(1200, .25); }
    render();
  }

  function tick(force) {
    if (!S || S.i >= S.steps.length) return;
    const st = S.steps[S.i];
    if (!st.dur) return; // rep-based work waits for "Done"
    const left = S.paused ? S.left : Math.max(0, S.end - Date.now());
    const sec = Math.ceil(left / 1000);
    const num = $("#woNum"), arc = $("#woArc");
    if (num) num.textContent = st.kind === "count" ? (sec || "") : `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, "0")}`;
    if (arc) arc.style.strokeDashoffset = String(339.3 * (1 - left / S.total));
    if (!S.paused && sec !== S.lastSec) {
      // Beeps on the last 3 seconds of every countdown
      if (sec > 0 && sec <= 3 && !force) beep(st.kind === "count" ? 760 : 660, .12);
      S.lastSec = sec;
    }
    if (!S.paused && left <= 0 && !force) enter(S.i + 1);
  }

  function onClick(e) {
    const b = e.target.closest("[data-wo]"); if (!b) return;
    const act = b.dataset.wo;
    if (act === "close") return stop();
    if (act === "sound") { soundOn = !soundOn; store.set("fs-wo-sound", soundOn); if (!soundOn && "speechSynthesis" in window) speechSynthesis.cancel(); return drawSound(); }
    if (act === "again") { const o = S.opts; stop(); return start(o); }
    if (!S) return;
    if (act === "skip") return enter(S.i + 1);
    if (act === "add") { if (S.paused) S.left += 15000; else S.end += 15000; S.total += 15000; return tick(true); }
    if (act === "pause") {
      if (S.paused) { S.end = Date.now() + S.left; S.paused = false; }
      else { S.left = Math.max(0, S.end - Date.now()); S.paused = true; }
      render();
    }
  }
  function onKey(e) {
    if (!S) return;
    if (e.key === "Escape") stop();
  }

  /* ---------- public ---------- */
  async function start(opts) {
    if (S) stop();
    S = { opts, title: opts.title, items: opts.items, rest: opts.rest || 60, i: 0, paused: false, started: Date.now() };
    S.steps = build(S.items);
    mount();
    try { if ("wakeLock" in navigator) wake = await navigator.wakeLock.request("screen"); } catch {}
    S.timer = setInterval(() => tick(false), 100);
    document.addEventListener("keydown", onKey);
    beep(880, .01); // unlock audio on this user gesture
    enter(0);
  }
  function stop() {
    if (S) clearInterval(S.timer);
    S = null;
    document.removeEventListener("keydown", onKey);
    if ("speechSynthesis" in window) try { speechSynthesis.cancel(); } catch {}
    try { if (wake) wake.release(); } catch {}
    wake = null;
    const el = $("#wo"); if (el) el.remove();
    document.body.classList.remove("wo-open");
  }
  return { start, stop };
})();
