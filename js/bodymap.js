// ภาพร่างกายด้านหน้า + ด้านหลัง ไฮไลต์กล้ามเนื้อที่เลือกเป็นสีแดงอ่อน (Body map)
// วิธีใช้: bodyMap("chest") ได้ภาพทั้งตัว, bodyMap("chest", true) ซูมเฉพาะส่วนนั้น — กลุ่มที่ใช้ได้: chest back shoulders arms legs glutes core
// วาดเฉพาะร่างกายซีกซ้าย แล้วสะท้อนเป็นซีกขวาอัตโนมัติ

const bodyMap = (() => {
  // Outline of the left half of the body (arm, torso, leg) — mirrored for the right half
  const HALF = "M30 20L22 21.5Q16 22.5 13.5 26Q11 29 10.5 34L9 46L7.5 58L6.5 66Q6 69 8 69.5Q10 70 10.5 67L12.5 58L14.5 47L16 40L17.5 50L18 60L18.5 66L19.5 80L20 92L20.5 104L20 113Q19.5 117 23 117L26.5 117Q27.5 116 27 113L27.5 104L28.5 92L29 80L30 68Z";

  const DELT = "M13.5 26Q16 22.5 21 22.5Q18 26 17 31Q14.5 32 11.5 31Q12 28 13.5 26Z";
  const UPPER_ARM = "M12 32Q15 31.5 16.6 33L15.6 41Q13.5 43 11 41Q11 36 12 32Z";
  const FOREARM = "M10.6 44Q13 43 14.8 45L12.8 57Q11 58.5 9 57Q9.2 50 10.6 44Z";

  // Muscle shapes, left side only
  const FRONT = {
    delt: DELT,
    pec: "M19 25Q24 23.5 29.3 24.5L29.3 34Q24 36.5 19.5 33Q18 29 19 25Z",
    bicep: UPPER_ARM,
    forearm: FOREARM,
    abs: ['<rect class="CLS" x="25" y="37" width="4.2" height="5" rx="1.2"/>', '<rect class="CLS" x="25" y="43" width="4.2" height="5" rx="1.2"/>', '<rect class="CLS" x="25" y="49" width="4.2" height="5.5" rx="1.2"/>'],
    oblique: "M19.8 36Q22.5 38 24.3 38L24.3 56Q21 56 19 52Q18.3 44 19.8 36Z",
    quad: "M20 68Q25 66.5 29.2 69L28.6 86Q26 91 22.5 90Q20 86 19.8 78Z",
    shin: "M21 95Q23.5 94 25.5 95.5L25 108Q23 110 21.5 108Z"
  };
  const BACK = {
    trap: "M30 20.5L24 22Q21 23 21 23.5Q25 26 28 31L30 33Z",
    delt: DELT,
    lat: "M19.5 27Q24 28 29.3 33L29.3 44Q24 47 20 41Q18.5 33 19.5 27Z",
    lowback: "M24 46Q27 46 29.3 45.5L29.3 57Q26 58 24 56Z",
    tricep: UPPER_ARM,
    forearm: FOREARM,
    glute: "M19.5 59Q25 57 29.4 59.5L29.4 70Q25 73 20.5 71Q18.8 66 19.5 59Z",
    ham: "M20 74Q25 73 29 75L28.6 88Q26 91 22.5 90Q20 85 20 74Z",
    calf: "M20.8 93Q24 92 27.3 93.5Q27.8 100 26 105Q23.5 107 21.5 104Q20.2 98 20.8 93Z"
  };

  // Which shapes light up for each muscle group (f = front view, b = back view)
  const HL = {
    chest:     { f: ["pec"] },
    back:      { b: ["trap", "lat", "lowback"] },
    shoulders: { f: ["delt"], b: ["delt"] },
    arms:      { f: ["bicep", "forearm"], b: ["tricep", "forearm"] },
    legs:      { f: ["quad", "shin"], b: ["ham", "calf"] },
    glutes:    { b: ["glute"] },
    core:      { f: ["abs", "oblique"] }
  };

  const MIRROR = 'transform="translate(60,0) scale(-1,1)"';

  function view(shapes, lit, x, back) {
    const parts = Object.entries(shapes).map(([k, d]) => {
      const cls = lit.includes(k) ? "bm-m hl" : "bm-m";
      return (Array.isArray(d) ? d : [d]).map(p => (p[0] === "M" ? `<path class="${cls}" d="${p}"/>` : p.replace("CLS", cls))).join("");
    }).join("");
    const hair = back
      ? '<ellipse class="bm-hair" cx="30" cy="9.2" rx="6.2" ry="7"/>'
      : '<path class="bm-hair" d="M24 8.5Q24.5 2 30 2.3Q35.5 2 36 8.5Q33 5.2 30 5.4Q27 5.2 24 8.5Z"/>';
    return `<g transform="translate(${x},0)">
      <g class="bm-base"><ellipse cx="30" cy="10" rx="6" ry="7.5"/><rect x="27" y="15" width="6" height="7" rx="2"/><path d="${HALF}"/><path d="${HALF}" ${MIRROR}/></g>
      ${hair}
      <g>${parts}</g><g ${MIRROR}>${parts}</g>
    </g>`;
  }

  // Close-up framing per group: x, y, width, height in the full drawing (front view at x 3, back view at x 67)
  const ZOOM = {
    chest:     [9, 15, 48, 33],
    back:      [71, 16, 52, 36],
    shoulders: [7, 15, 52, 36],
    arms:      [5, 20, 56, 39],
    legs:      [4, 64, 54, 37],
    glutes:    [77, 52, 40, 28],
    core:      [13, 30, 40, 28]
  };

  // zoom = true: close-up on the highlighted area (used on the small cards)
  return (group, zoom) => {
    const hl = HL[group] || {};
    const vb = zoom && ZOOM[group] ? ZOOM[group].join(" ") : "0 0 130 120";
    return `<svg class="bodymap" viewBox="${vb}" aria-hidden="true">${view(FRONT, hl.f || [], 3, false)}${view(BACK, hl.b || [], 67, true)}</svg>`;
  };
})();
