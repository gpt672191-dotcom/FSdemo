// เริ่มต้นหน้าเว็บ — ต้องโหลดเป็นไฟล์สุดท้ายเสมอ (Start-up — always load this file last)

renderAll();
// show the page now that everything is drawn (see .js-wait in style.css)
document.documentElement.classList.remove("js-wait");
if (typeof FIGURES !== "undefined") FIGURES.start(); // animated characters

// Sections hidden until login (e.g. #myplans) can't be scrolled to on load, so scroll after rendering
// Content above the target (3D figures, cards) can still grow after the first jump, so jump again a few
// times while the page settles, unless the user has started scrolling by themselves.
if (location.hash) {
  const target = document.getElementById(location.hash.slice(1));
  if (target) {
    let userMoved = false;
    const stop = () => { userMoved = true; };
    ["wheel", "touchstart", "keydown", "mousedown"].forEach(ev => addEventListener(ev, stop, { once: true, passive: true }));
    [50, 400, 1000, 2000].forEach(ms => setTimeout(() => { if (!userMoved && !target.hidden) target.scrollIntoView({ behavior: "instant", block: "start" }); }, ms));
  }
}

// Installable app + works offline (sw.js). Only over http(s), not when a file is opened from disk.
if ("serviceWorker" in navigator && location.protocol.startsWith("http")) {
  window.addEventListener("load", () => navigator.serviceWorker.register("sw.js").catch(() => {}));
}
