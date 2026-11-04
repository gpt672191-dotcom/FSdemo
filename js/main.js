// เริ่มต้นหน้าเว็บ — ต้องโหลดเป็นไฟล์สุดท้ายเสมอ (Start-up — always load this file last)

renderAll();

// Sections hidden until login (e.g. #myplans) can't be scrolled to on load, so scroll after rendering
if (location.hash) {
  const target = document.getElementById(location.hash.slice(1));
  if (target && !target.hidden) setTimeout(() => target.scrollIntoView(), 50);
}
