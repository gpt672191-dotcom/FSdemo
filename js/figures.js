// ตัวละครแอนิเมชั่น 2D ออกกำลังกาย (Animated 2D exercise characters)
// วิธีใช้ใน HTML:  <div class="fig" data-fig="squat"></div>
// ระบบจะวาดคนและขยับท่าให้อัตโนมัติ (ดูชื่อท่าทั้งหมดใน MOTIONS ด้านล่าง)
//
// How it works: each motion is a list of key poses. A pose sets the hip position,
// torso angle, and each arm/leg — either by joint angles {u, f} or by a hand/foot
// target {x, y, b} solved with 2-bone IK. Poses are blended smoothly in a loop.
// Angles are in degrees: 0 = pointing down, 90 = forward (right), 180 = up, -90 = back.

const FIGURES = (() => {
  const L = { torso: 26, neck: 4, head: 6.8, ua: 14, fa: 13, th: 18, sh: 18 };
  const RAD = Math.PI / 180;
  const dir = a => [Math.sin(a * RAD), Math.cos(a * RAD)];
  const add = (p, a, len) => { const d = dir(a); return [p[0] + d[0] * len, p[1] + d[1] * len]; };
  const angOf = (p, q) => Math.atan2(q[0] - p[0], q[1] - p[1]) / RAD;

  // 2-bone IK: elbow/knee position for a limb from root toward target
  function ik(root, tgt, a, b, bend) {
    const dx = tgt[0] - root[0], dy = tgt[1] - root[1];
    const d = Math.min(Math.max(Math.hypot(dx, dy), Math.abs(a - b) + 0.01), a + b - 0.01);
    const base = Math.atan2(dy, dx);
    const c = (a * a + d * d - b * b) / (2 * a * d);
    const ang = base + bend * Math.acos(Math.max(-1, Math.min(1, c)));
    return [[root[0] + Math.cos(ang) * a, root[1] + Math.sin(ang) * a], [root[0] + Math.cos(base) * d, root[1] + Math.sin(base) * d]];
  }
  function limb(root, s, la, lb) {
    if (s.x !== undefined) return ik(root, [s.x, s.y], la, lb, s.b || 1);
    const m = add(root, s.u, la);
    return [m, add(m, s.f, lb)];
  }

  // Blend two poses (numbers inside nested objects/arrays)
  function mix(p, q, k) {
    if (typeof p === "number") return p + (q - p) * k;
    if (Array.isArray(p)) return p.map((v, i) => mix(v, q[i], k));
    if (p && typeof p === "object") { const o = {}; for (const key in p) o[key] = key in q ? mix(p[key], q[key], k) : p[key]; return o; }
    return p;
  }

  // Joint positions for a pose
  function solve(p, front) {
    const H = p.hip, S = add(H, p.t, L.torso);
    const na = p.t + (p.ha || 0);
    const N = add(S, na, L.neck), C = add(N, na, L.head);
    const A = add(S, p.t + 180, 2.5); // arms attach just below the neck
    const so = p.so || [0, 0], ho = p.ho || [0, 0];
    const arms = [p.a1, p.a2].map((s, i) => { const r = [A[0] + so[i], A[1]]; const [m, e] = limb(r, s, L.ua, L.fa); return { r, m, e }; });
    const legs = [p.l1, p.l2].map((s, i) => {
      const r = [H[0] + ho[i], H[1]];
      const [m, e] = limb(r, s, L.th, L.sh);
      const fd = s.fd !== undefined ? s.fd : front ? (i ? -60 : 60) : angOf(m, e) + 90;
      return { r, m, e, toe: add(e, fd, front ? 3.5 : 5) };
    });
    return { H, S, N, C, na, arms, legs };
  }

  /* ---------------- Poses & motions ---------------- */
  const P = (o) => Object.assign({ hip: [60, 54], t: 180, ha: 0, a1: { u: 6, f: 10 }, a2: { u: -4, f: 0 }, l1: { x: 63, y: 90, b: -1 }, l2: { x: 57, y: 90, b: -1 } }, o);
  const FRONT = { so: [6, -6], ho: [3, -3] };
  const FP = (o) => Object.assign({ hip: [60, 54], t: 180, ha: 0, so: [6, -6], ho: [3, -3], a1: { u: 12, f: 8 }, a2: { u: -12, f: -8 }, l1: { x: 64, y: 90, b: -1 }, l2: { x: 56, y: 90, b: 1 } }, o);
  // Quadruped (hands & knees)
  const Q = (o) => Object.assign({ hip: [44, 70], t: 99, ha: 0, a1: { x: 69, y: 90, b: 1 }, a2: { x: 67, y: 90, b: 1 }, l1: { u: 0, f: -88 }, l2: { u: -3, f: -88 } }, o);
  // High plank
  const HP = (o) => Object.assign({ hip: [50, 70], t: 105, ha: 0, a1: { x: 78, y: 90, b: 1 }, a2: { x: 75, y: 90, b: 1 }, l1: { x: 20, y: 90, b: -1 }, l2: { x: 23, y: 90, b: -1 } }, o);
  // Lying on back, head to the left, knees bent
  const SUP = (o) => Object.assign({ hip: [60, 84], t: -90, ha: 0, a1: { u: 90, f: 90 }, a2: { u: 88, f: 88 }, l1: { x: 82, y: 90, b: -1 }, l2: { x: 79, y: 90, b: -1 } }, o);

  const STAND_A = { a1: { u: 6, f: 10 }, a2: { u: -4, f: 0 } };
  const bench = (x, y, w) => `<rect class="pr" x="${x}" y="${y}" width="${w}" height="3.5" rx="1.5"/><path class="pr2" d="M${x + 3} ${y + 3}V90M${x + w - 3} ${y + 3}V90"/>`;

  const M = {
    // ----- Lower body -----
    squat:   { f: [P({ a1: { u: 10, f: 14 }, a2: { u: 6, f: 10 } }), P({ hip: [48, 71], t: 148, a1: { u: 88, f: 88 }, a2: { u: 84, f: 84 }, l1: { x: 64, y: 90, b: -1 }, l2: { x: 60, y: 90, b: -1 } })], d: 900 },
    gsquat:  { f: [P({ a1: { u: 30, f: 165 }, a2: { u: 26, f: 160 } }), P({ hip: [48, 71], t: 150, a1: { u: 60, f: 190 }, a2: { u: 56, f: 186 }, l1: { x: 64, y: 90, b: -1 }, l2: { x: 60, y: 90, b: -1 } })], d: 900, db: [1, 0] },
    jsquat:  { f: [P({ hip: [48, 71], t: 148, a1: { u: 70, f: 70 }, a2: { u: 66, f: 66 } }), P({ a1: { u: 150, f: 165 }, a2: { u: 146, f: 160 } }), P({ hip: [60, 47], a1: { u: 170, f: 178 }, a2: { u: 166, f: 175 }, l1: { x: 63, y: 86, b: -1 }, l2: { x: 57, y: 86, b: -1 } })], d: [480, 260, 300] },
    lunge:   { f: [P({ a1: { u: 4, f: 4 }, a2: { u: -4, f: -4 }, l1: { x: 66, y: 90, b: -1 }, l2: { x: 56, y: 90, b: -1 } }), P({ hip: [54, 70], t: 178, a1: { u: 4, f: 4 }, a2: { u: -4, f: -4 }, l1: { x: 70, y: 90, b: -1 }, l2: { x: 34, y: 90, b: -1 } })], d: 900 },
    bridge:  { f: [SUP({ hip: [56, 84] }), SUP({ hip: [56, 71], t: -62, ha: -28 })], d: 900 },
    hipthrust: { f: [SUP({ hip: [52, 84], t: -132, ha: 40, a1: { u: -50, f: 0 }, a2: { u: -48, f: 0 }, l1: { x: 80, y: 90, b: -1 }, l2: { x: 77, y: 90, b: -1 } }), SUP({ hip: [55, 64], t: -88, ha: -4, a1: { u: -50, f: 0 }, a2: { u: -48, f: 0 }, l1: { x: 80, y: 90, b: -1 }, l2: { x: 77, y: 90, b: -1 } })], d: 900, props: bench(12, 62, 24) },
    wallsit: { f: [P({ hip: [46, 70], a1: { u: 90, f: 90 }, a2: { u: 86, f: 86 }, l1: { x: 66, y: 90, b: -1 }, l2: { x: 63, y: 90, b: -1 } }), P({ hip: [46, 71.5], a1: { u: 92, f: 92 }, a2: { u: 88, f: 88 }, l1: { x: 66, y: 90, b: -1 }, l2: { x: 63, y: 90, b: -1 } })], d: 1300, props: '<path class="pr" d="M38 12V90"/>' },
    calf:    { f: [P({ l1: { x: 63, y: 90, b: -1, fd: 90 }, l2: { x: 57, y: 90, b: -1, fd: 90 } }), P({ hip: [60, 50], l1: { x: 63, y: 86.5, b: -1, fd: 42 }, l2: { x: 57, y: 86.5, b: -1, fd: 42 } })], d: 700 },
    rdl:     { f: [P({ a1: { u: 2, f: 2 }, a2: { u: -2, f: -2 } }), P({ hip: [52, 57], t: 102, a1: { u: 4, f: 4 }, a2: { u: 0, f: 0 }, l1: { x: 62, y: 90, b: -1 }, l2: { x: 58, y: 90, b: -1 } })], d: 1000, db: [1, 1] },
    legpress:{ f: [P({ hip: [48, 76], t: -140, ha: 10, a1: { u: 20, f: 40 }, a2: { u: 16, f: 36 }, l1: { x: 70, y: 64, b: -1, fd: 175 }, l2: { x: 68, y: 66, b: -1, fd: 175 } }), P({ hip: [48, 76], t: -140, ha: 10, a1: { u: 20, f: 40 }, a2: { u: 16, f: 36 }, l1: { x: 86, y: 52, b: -1, fd: 150 }, l2: { x: 84, y: 54, b: -1, fd: 150 } })], d: 1000, props: '<path class="pr" d="M26 54L44 80H60"/><path class="pr2" d="M52 80V90M30 58V90"/>' },
    legcurl: { f: [P({ hip: [44, 72], t: 90, ha: 12, a1: { u: 100, f: 96 }, a2: { u: 98, f: 94 }, l1: { u: -90, f: -90 }, l2: { u: -92, f: -92 } }), P({ hip: [44, 72], t: 90, ha: 12, a1: { u: 100, f: 96 }, a2: { u: 98, f: 94 }, l1: { u: -90, f: -172 }, l2: { u: -92, f: -170 } })], d: 900, props: bench(22, 77.5, 66) },
    kickback:{ f: [Q(), Q({ l1: { u: -96, f: -182 } })], d: 750 },

    // ----- Upper body -----
    pushup:  { f: [HP(), HP({ hip: [54, 78], t: 94 })], d: 800 },
    inclinepush: { f: [HP({ hip: [50, 64], t: 130, a1: { x: 82, y: 70, b: 1 }, a2: { x: 80, y: 70, b: 1 }, l1: { x: 25, y: 90, b: -1 }, l2: { x: 27, y: 90, b: -1 } }), HP({ hip: [50, 70], t: 112, a1: { x: 82, y: 70, b: 1 }, a2: { x: 80, y: 70, b: 1 }, l1: { x: 25, y: 90, b: -1 }, l2: { x: 27, y: 90, b: -1 } })], d: 850, props: '<rect class="pr" x="76" y="70" width="24" height="20" rx="2"/>' },
    dip:     { f: [P({ hip: [54, 62], a1: { x: 47, y: 64, b: 1 }, a2: { x: 45, y: 64, b: 1 }, l1: { x: 78, y: 90, b: -1 }, l2: { x: 76, y: 90, b: -1 } }), P({ hip: [54, 73], a1: { x: 47, y: 64, b: 1 }, a2: { x: 45, y: 64, b: 1 }, l1: { x: 78, y: 90, b: -1 }, l2: { x: 76, y: 90, b: -1 } })], d: 850, props: '<rect class="pr" x="24" y="64" width="24" height="3.5" rx="1.5"/><path class="pr2" d="M27 67V90M45 67V90M27 64V44"/>' },
    superman:{ f: [P({ hip: [54, 82], t: 90, ha: 8, a1: { u: 96, f: 96 }, a2: { u: 98, f: 98 }, l1: { u: -90, f: -90 }, l2: { u: -91, f: -91 } }), P({ hip: [54, 83], t: 97, ha: 14, a1: { u: 106, f: 108 }, a2: { u: 104, f: 106 }, l1: { u: -100, f: -104 }, l2: { u: -99, f: -103 } })], d: 900 },
    pikepush:{ f: [HP({ hip: [54, 58], t: 66, a1: { x: 84, y: 90, b: 1 }, a2: { x: 82, y: 90, b: 1 }, l1: { x: 38, y: 90, b: -1 }, l2: { x: 40, y: 90, b: -1 } }), HP({ hip: [54, 62], t: 48, a1: { x: 84, y: 90, b: 1 }, a2: { x: 82, y: 90, b: 1 }, l1: { x: 38, y: 90, b: -1 }, l2: { x: 40, y: 90, b: -1 } })], d: 850 },
    dbrow:   { f: [P({ hip: [46, 58], t: 104, a1: { x: 72, y: 80, b: 1 }, a2: { x: 86, y: 68, b: -1 }, l1: { x: 52, y: 90, b: -1 }, l2: { x: 62, y: 90, b: -1 } }), P({ hip: [46, 58], t: 104, a1: { x: 58, y: 61, b: 1 }, a2: { x: 86, y: 68, b: -1 }, l1: { x: 52, y: 90, b: -1 }, l2: { x: 62, y: 90, b: -1 } })], d: 800, db: [1, 0], props: bench(80, 68, 26) },
    dbpress: { f: [P({ a1: { x: 67, y: 25, b: 1 }, a2: { x: 64, y: 26, b: 1 } }), P({ a1: { x: 63, y: 2, b: 1 }, a2: { x: 60, y: 3, b: 1 } })], d: 850, db: [1, 1] },
    floorpress: { f: [SUP({ hip: [62, 84], a1: { x: 43, y: 72, b: 1 }, a2: { x: 41, y: 73, b: 1 } }), SUP({ hip: [62, 84], a1: { x: 39, y: 57, b: 1 }, a2: { x: 37, y: 58, b: 1 } })], d: 850, db: [1, 1] },
    curl:    { f: [P({ a1: { u: 2, f: 6 }, a2: { u: -2, f: 2 } }), P({ a1: { u: 4, f: 150 }, a2: { u: -1, f: 142 } })], d: 750, db: [1, 1] },
    hammercurl: { f: [P({ a1: { u: 2, f: 4 }, a2: { u: -2, f: 0 } }), P({ a1: { u: 6, f: 140 }, a2: { u: 0, f: 132 } })], d: 800, db: [1, 1] },
    tricepext: { f: [P({ a1: { u: 170, f: -12 }, a2: { u: 166, f: -16 } }), P({ a1: { u: 172, f: -186 }, a2: { u: 168, f: -190 } })], d: 850, db: [1, 0] },
    frontraise: { f: [P({ a1: { u: 2, f: 2 }, a2: { u: -2, f: -2 } }), P({ a1: { u: 88, f: 90 }, a2: { u: 84, f: 86 } })], d: 900, db: [1, 1] },
    lateralraise: { f: [FP({ a1: { u: 10, f: 6 }, a2: { u: -10, f: -6 } }), FP({ a1: { u: 84, f: 88 }, a2: { u: -84, f: -88 } })], d: 900, db: [1, 1], front: 1 },
    pulldown:{ f: [P({ hip: [54, 70], a1: { x: 64, y: 12, b: 1 }, a2: { x: 60, y: 12, b: 1 }, l1: { u: 90, f: 0 }, l2: { u: 88, f: 2 } }), P({ hip: [54, 70], a1: { x: 66, y: 40, b: 1 }, a2: { x: 62, y: 40, b: 1 }, l1: { u: 90, f: 0 }, l2: { u: 88, f: 2 } })], d: 900, bar: 1, cable: [64, -4], props: '<rect class="pr" x="42" y="72" width="22" height="3.5" rx="1.5"/><path class="pr2" d="M53 75V90"/>' },
    cablerow:{ f: [P({ hip: [40, 82], t: 166, a1: { x: 86, y: 62, b: -1 }, a2: { x: 84, y: 63, b: -1 }, l1: { u: 84, f: 96 }, l2: { u: 86, f: 94 } }), P({ hip: [40, 82], t: 188, a1: { x: 50, y: 66, b: 1 }, a2: { x: 48, y: 66, b: 1 }, l1: { u: 84, f: 96 }, l2: { u: 86, f: 94 } })], d: 900, cable: [112, 62], grip: 1, props: '<path class="pr" d="M77 70V90"/>' },
    chestpress: { f: [P({ hip: [48, 68], t: 178, a1: { x: 66, y: 42, b: 1 }, a2: { x: 64, y: 42, b: 1 }, l1: { x: 70, y: 90, b: -1 }, l2: { x: 67, y: 90, b: -1 } }), P({ hip: [48, 68], t: 178, a1: { x: 77, y: 42, b: 1 }, a2: { x: 75, y: 42, b: 1 }, l1: { x: 70, y: 90, b: -1 }, l2: { x: 67, y: 90, b: -1 } })], d: 850, grip: 1, props: '<path class="pr" d="M41 34L43 70H60"/><path class="pr2" d="M52 70V90"/>' },
    pullup:  { f: [P({ hip: [58, 64], a1: { x: 64, y: 8, b: 1 }, a2: { x: 56, y: 8, b: 1 }, l1: { u: 10, f: -40 }, l2: { u: 6, f: -44 } }), P({ hip: [58, 46], a1: { x: 64, y: 8, b: 1 }, a2: { x: 56, y: 8, b: 1 }, l1: { u: 10, f: -40 }, l2: { u: 6, f: -44 } })], d: 950, noFloor: 1, props: '<path class="pr" d="M30 8H90"/><path class="pr2" d="M32 8V96M88 8V96"/>' },
    pushdown:{ f: [P({ a1: { u: 6, f: 112 }, a2: { u: 2, f: 106 } }), P({ a1: { u: 4, f: 6 }, a2: { u: 0, f: 2 } })], d: 800, cable: [86, -2], grip: 1 },

    // ----- Core -----
    plank:   { f: [HP({ hip: [50, 77.5], t: 94, a1: { u: 0, f: 90 }, a2: { u: -2, f: 88 }, l1: { x: 18, y: 90, b: -1 }, l2: { x: 21, y: 90, b: -1 } }), HP({ hip: [50, 76.5], t: 95, a1: { u: 0, f: 90 }, a2: { u: -2, f: 88 }, l1: { x: 18, y: 90, b: -1 }, l2: { x: 21, y: 90, b: -1 } })], d: 1200 },
    sideplank: { f: [HP({ hip: [50, 79], t: 96, a1: { u: 0, f: 90 }, a2: { u: 175, f: 180 }, l1: { x: 18, y: 90, b: -1 }, l2: { x: 21, y: 90, b: -1 } }), HP({ hip: [50, 75], t: 98, a1: { u: 0, f: 90 }, a2: { u: 178, f: 182 }, l1: { x: 18, y: 90, b: -1 }, l2: { x: 21, y: 90, b: -1 } })], d: 1000 },
    deadbug: { f: [
      SUP({ hip: [62, 82], a1: { u: 180, f: 180 }, a2: { u: 178, f: 178 }, l1: { u: 178, f: 90 }, l2: { u: 176, f: 92 } }),
      SUP({ hip: [62, 82], a1: { u: 248, f: 252 }, a2: { u: 178, f: 178 }, l1: { u: 178, f: 90 }, l2: { u: 118, f: 110 } }),
      SUP({ hip: [62, 82], a1: { u: 180, f: 180 }, a2: { u: 178, f: 178 }, l1: { u: 178, f: 90 }, l2: { u: 176, f: 92 } }),
      SUP({ hip: [62, 82], a1: { u: 180, f: 180 }, a2: { u: 246, f: 250 }, l1: { u: 118, f: 110 }, l2: { u: 176, f: 92 } })], d: 700 },
    birddog: { f: [Q(), Q({ a1: { x: 96, y: 62, b: 1 }, l2: { u: -92, f: -90 } }), Q(), Q({ a2: { x: 95, y: 63, b: 1 }, l1: { u: -92, f: -90 } })], d: 800 },
    crunch:  { f: [SUP({ hip: [58, 84], a1: { u: 110, f: 110 }, a2: { u: 112, f: 112 } }), SUP({ hip: [58, 84], t: -118, ha: 16, a1: { u: 96, f: 96 }, a2: { u: 98, f: 98 } })], d: 750 },
    legraise:{ f: [SUP({ hip: [60, 84], a1: { u: 88, f: 90 }, a2: { u: 86, f: 88 }, l1: { u: 88, f: 88 }, l2: { u: 86, f: 86 } }), SUP({ hip: [60, 84], a1: { u: 88, f: 90 }, a2: { u: 86, f: 88 }, l1: { u: 178, f: 178 }, l2: { u: 176, f: 176 } })], d: 1000 },
    shouldertap: { f: [HP(), HP({ a1: { x: 68, y: 68, b: 1 } }), HP(), HP({ a2: { x: 66, y: 68, b: 1 } })], d: 380 },

    // ----- Cardio -----
    jj:      { f: [FP(), FP({ hip: [60, 51], a1: { u: 150, f: 168 }, a2: { u: -150, f: -168 }, l1: { x: 76, y: 88, b: -1 }, l2: { x: 44, y: 88, b: 1 } })], d: 420, front: 1 },
    stepjack:{ f: [FP(), FP({ hip: [62, 55], a1: { u: 150, f: 168 }, a2: { u: -150, f: -168 }, l1: { x: 76, y: 90, b: -1 } }), FP(), FP({ hip: [58, 55], a1: { u: 150, f: 168 }, a2: { u: -150, f: -168 }, l2: { x: 44, y: 90, b: 1 } })], d: 480, front: 1 },
    highknee:{ f: [P({ t: 178, a1: { u: -35, f: 50 }, a2: { u: 40, f: 130 }, l1: { u: 92, f: 6 }, l2: { u: -4, f: -8 } }), P({ t: 178, a1: { u: 40, f: 130 }, a2: { u: -35, f: 50 }, l1: { u: -4, f: -8 }, l2: { u: 92, f: 6 } })], d: 260 },
    march:   { f: [P({ a1: { u: -25, f: 30 }, a2: { u: 30, f: 100 }, l1: { u: 70, f: 4 }, l2: { u: -2, f: -4 } }), P({ a1: { u: 30, f: 100 }, a2: { u: -25, f: 30 }, l1: { u: -2, f: -4 }, l2: { u: 70, f: 4 } })], d: 420 },
    climber: { f: [HP({ hip: [50, 68], t: 107, l1: { x: 48, y: 86, b: -1 }, l2: { x: 20, y: 90, b: -1 } }), HP({ hip: [50, 68], t: 107, l1: { x: 20, y: 90, b: -1 }, l2: { x: 48, y: 86, b: -1 } })], d: 280 },
    skater:  { f: [FP({ hip: [48, 57], t: 172, a1: { u: -40, f: -30 }, a2: { u: -60, f: -70 }, l1: { x: 54, y: 82, b: -1 }, l2: { x: 44, y: 90, b: 1 } }), FP({ hip: [72, 57], t: 188, a1: { u: 60, f: 70 }, a2: { u: 40, f: 30 }, l1: { x: 76, y: 90, b: -1 }, l2: { x: 66, y: 82, b: 1 } })], d: 480, front: 1 },
    boxstep: { f: [
      P({ hip: [58, 55], t: 176, a1: { x: 71, y: 22, b: 1 }, a2: { x: 68, y: 25, b: 1 }, l1: { x: 68, y: 90, b: -1 }, l2: { x: 50, y: 90, b: -1 } }),
      P({ hip: [59, 55], t: 172, a1: { x: 90, y: 25, b: 1 }, a2: { x: 68, y: 25, b: 1 }, l1: { x: 68, y: 90, b: -1 }, l2: { x: 50, y: 90, b: -1 } }),
      P({ hip: [58, 55], t: 176, a1: { x: 71, y: 22, b: 1 }, a2: { x: 68, y: 25, b: 1 }, l1: { x: 68, y: 90, b: -1 }, l2: { x: 50, y: 90, b: -1 } }),
      P({ hip: [59, 55], t: 172, a1: { x: 71, y: 22, b: 1 }, a2: { x: 88, y: 27, b: 1 }, l1: { x: 68, y: 90, b: -1 }, l2: { x: 50, y: 90, b: -1 } })], d: 230 },
    burpee:  { f: [
      P({ a1: { x: 63, y: 60, b: 1 }, a2: { x: 59, y: 60, b: 1 }, l1: { x: 63, y: 90, b: -1 }, l2: { x: 58, y: 90, b: -1 } }),
      P({ hip: [52, 74], t: 130, a1: { x: 76, y: 90, b: 1 }, a2: { x: 73, y: 90, b: 1 }, l1: { x: 63, y: 90, b: -1 }, l2: { x: 58, y: 90, b: -1 } }),
      P({ hip: [52, 70], t: 106, a1: { x: 78, y: 90, b: 1 }, a2: { x: 75, y: 90, b: 1 }, l1: { x: 22, y: 90, b: -1 }, l2: { x: 25, y: 90, b: -1 } }),
      P({ hip: [52, 74], t: 130, a1: { x: 76, y: 90, b: 1 }, a2: { x: 73, y: 90, b: 1 }, l1: { x: 63, y: 90, b: -1 }, l2: { x: 58, y: 90, b: -1 } }),
      P({ hip: [60, 48], a1: { x: 64, y: 0, b: 1 }, a2: { x: 60, y: 0, b: 1 }, l1: { x: 63, y: 87, b: -1 }, l2: { x: 58, y: 87, b: -1 } })], d: [360, 300, 360, 300, 380] },
    run: { f: [
      P({ hip: [60, 53], t: 170, a1: { u: -40, f: 40 }, a2: { u: 45, f: 140 }, l1: { x: 76, y: 88, b: -1 }, l2: { x: 42, y: 84, b: -1 } }),
      P({ hip: [60, 55], t: 170, a1: { u: 0, f: 90 }, a2: { u: 0, f: 90 }, l1: { x: 61, y: 90, b: -1 }, l2: { x: 56, y: 72, b: -1 } }),
      P({ hip: [60, 53], t: 170, a1: { u: 45, f: 140 }, a2: { u: -40, f: 40 }, l1: { x: 42, y: 84, b: -1 }, l2: { x: 76, y: 88, b: -1 } }),
      P({ hip: [60, 55], t: 170, a1: { u: 0, f: 90 }, a2: { u: 0, f: 90 }, l1: { x: 56, y: 72, b: -1 }, l2: { x: 61, y: 90, b: -1 } })], d: 200 },
    walk: { f: [
      P({ a1: { u: -22, f: -12 }, a2: { u: 24, f: 40 }, l1: { x: 72, y: 90, b: -1 }, l2: { x: 50, y: 90, b: -1 } }),
      P({ hip: [60, 53], a1: { u: 0, f: 6 }, a2: { u: 0, f: 6 }, l1: { x: 61, y: 90, b: -1 }, l2: { x: 60, y: 83, b: -1 } }),
      P({ a1: { u: 24, f: 40 }, a2: { u: -22, f: -12 }, l1: { x: 50, y: 90, b: -1 }, l2: { x: 72, y: 90, b: -1 } }),
      P({ hip: [60, 53], a1: { u: 0, f: 6 }, a2: { u: 0, f: 6 }, l1: { x: 60, y: 83, b: -1 }, l2: { x: 61, y: 90, b: -1 } })], d: 320 },
    bike: { f: [0, 1, 2, 3, 4, 5, 6, 7].map(i => {
        const a = i * 45, b = a + 180;
        const pd = th => ({ x: 63 + 8 * Math.sin(th * RAD), y: 79 + 8 * Math.cos(th * RAD), b: -1 });
        return P({ hip: [50, 54], t: 156, ha: -6, a1: { x: 78, y: 45, b: 1 }, a2: { x: 76, y: 45, b: 1 }, l1: pd(a), l2: pd(b) });
      }), d: 120,
      props: '<circle class="pr2" cx="34" cy="79" r="11"/><circle class="pr2" cx="92" cy="79" r="11"/><path class="pr" d="M34 79L50 56L63 79L84 50L92 79M63 79L34 79M44 54H56M80 46L86 44"/><circle class="pr2" cx="63" cy="79" r="8"/>' },
    rower: { f: [
      P({ hip: [56, 82], t: 158, a1: { x: 90, y: 64, b: 1 }, a2: { x: 88, y: 64, b: 1 }, l1: { x: 78, y: 80, b: -1, fd: 175 }, l2: { x: 76, y: 81, b: -1, fd: 175 } }),
      P({ hip: [40, 82], t: 200, a1: { x: 48, y: 62, b: 1 }, a2: { x: 46, y: 62, b: 1 }, l1: { x: 78, y: 80, b: -1, fd: 175 }, l2: { x: 76, y: 81, b: -1, fd: 175 } })], d: [700, 900], cable: [100, 64], grip: 1,
      props: '<path class="pr" d="M14 88H100M80 70V88"/>' },
    tread: { f: null, d: 320, props: '<path class="pr" d="M18 92.5H100M96 92.5L100 40H92"/>', noFloor: 1, from: "walk" },

    // ----- Mobility -----
    catcow:  { f: [Q({ hip: [44, 70], t: 100, ha: -32 }), Q({ hip: [44, 66], t: 95, ha: 38 })], d: 1300 },
    wgs:     { f: [P({ hip: [52, 74], t: 130, a1: { x: 77, y: 90, b: 1 }, a2: { x: 75, y: 90, b: 1 }, l1: { x: 77, y: 90, b: -1 }, l2: { x: 22, y: 90, b: -1 } }), P({ hip: [52, 74], t: 128, a1: { x: 77, y: 90, b: 1 }, a2: { x: 64, y: 18, b: 1 }, l1: { x: 77, y: 90, b: -1 }, l2: { x: 22, y: 90, b: -1 } })], d: 1200 },
    hipflex: { f: [P({ hip: [56, 70], a1: { u: 30, f: 60 }, a2: { u: 28, f: 58 }, l1: { x: 76, y: 90, b: -1 }, l2: { u: -8, f: -90 } }), P({ hip: [61, 72], t: 176, a1: { u: 30, f: 60 }, a2: { u: 28, f: 58 }, l1: { x: 76, y: 90, b: -1 }, l2: { u: -28, f: -90 } })], d: 1300 },
    hamstring: { f: [P({ hip: [50, 58], a1: { u: 10, f: 10 }, a2: { u: 8, f: 8 }, l1: { x: 72, y: 90, b: -1, fd: 140 }, l2: { x: 52, y: 90, b: -1, fd: 90 } }), P({ hip: [48, 60], t: 128, a1: { u: 36, f: 36 }, a2: { u: 34, f: 34 }, l1: { x: 72, y: 90, b: -1, fd: 140 }, l2: { x: 52, y: 90, b: -1, fd: 90 } })], d: 1300 },
    child:   { f: [P({ hip: [38, 80], t: 98, ha: 6, a1: { x: 96, y: 88, b: 1 }, a2: { x: 94, y: 88, b: 1 }, l1: { u: 70, f: -90 }, l2: { u: 68, f: -90 } }), P({ hip: [38, 78], t: 102, ha: 6, a1: { x: 96, y: 88, b: 1 }, a2: { x: 94, y: 88, b: 1 }, l1: { u: 70, f: -90 }, l2: { u: 68, f: -90 } })], d: 1500 },
    tspine:  { f: [SUP({ hip: [64, 82], a1: { u: 100, f: 100 } }), SUP({ hip: [64, 82], a1: { u: 180, f: 180 } }), SUP({ hip: [64, 82], a1: { u: 258, f: 262 } }), SUP({ hip: [64, 82], a1: { u: 180, f: 180 } })], d: 800 },
    dog:     { f: [HP({ hip: [50, 60], t: 50, a1: { x: 86, y: 90, b: 1 }, a2: { x: 84, y: 90, b: 1 }, l1: { x: 30, y: 90, b: 1 }, l2: { x: 33, y: 90, b: 1 } }), HP({ hip: [50, 58], t: 52, a1: { x: 86, y: 90, b: 1 }, a2: { x: 84, y: 90, b: 1 }, l1: { x: 31, y: 90, b: 1 }, l2: { x: 36, y: 86, b: 1 } })], d: 900 },

    // ----- Everyday (for illustrations) -----
    idle:    { f: [P(), P({ hip: [60, 54.6], a1: { u: 8, f: 12 }, a2: { u: -6, f: -2 } })], d: 1400 },
    wave:    { f: [P({ a1: { u: 150, f: 168 } }), P({ a1: { u: 150, f: 132 } })], d: 320 },
    drink:   { f: [P({ a1: { x: 67, y: 56, b: 1 } }), P({ ha: -18, a1: { x: 67, y: 20, b: 1 } }), P({ ha: -18, a1: { x: 67, y: 20, b: 1 } })], d: [900, 900, 700], bottle: 1 },
    sleep:   { f: [SUP({ hip: [68, 84], a1: { u: 80, f: 92 }, a2: { u: 78, f: 90 }, l1: { u: 90, f: 90 }, l2: { u: 88, f: 88 } }), SUP({ hip: [68, 83.3], a1: { u: 80, f: 92 }, a2: { u: 78, f: 90 }, l1: { u: 90, f: 90 }, l2: { u: 88, f: 88 } })], d: 1600, closed: 1, zzz: 1,
      props: '<ellipse class="pr" cx="27" cy="87" rx="10" ry="3.5"/>' }
  };
  M.tread.f = M.walk.f;

  // Exercises that reuse another motion
  const ALIAS = {};

  /* ---------------- Drawing ---------------- */
  const NS = "http://www.w3.org/2000/svg";
  const fx = n => n.toFixed(1);
  const line = (...pts) => "M" + pts.map(p => fx(p[0]) + " " + fx(p[1])).join("L");

  function create(el, name) {
    const m = M[ALIAS[name] || name] || M.idle;
    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("viewBox", "0 0 120 100");
    svg.setAttribute("aria-hidden", "true");
    svg.innerHTML = `
      <ellipse class="sh" cx="60" cy="91" rx="34" ry="3"/>
      ${m.noFloor ? "" : '<path class="fl" d="M8 90.5H112"/>'}
      ${m.props || ""}
      <path class="cb" data-k="cable"/>
      <g class="far"><path class="lg" data-k="l2"/><path class="sht" data-k="s2"/><path class="shoe" data-k="t2"/>
        <path class="arm" data-k="a2"/><path class="slv" data-k="v2"/><g data-k="d2"></g></g>
      <path class="tor" data-k="tor"/><path class="wst" data-k="wst"/><path class="nk" data-k="nk"/>
      <circle class="hair" r="7" data-k="hair"/><circle class="head" r="6.3" data-k="head"/><g data-k="eyes"></g>
      <g class="near"><path class="lg" data-k="l1"/><path class="sht" data-k="s1"/><path class="shoe" data-k="t1"/>
        <path class="arm" data-k="a1"/><path class="slv" data-k="v1"/><g data-k="d1"></g></g>
      ${m.zzz ? '<g class="zzz"><text x="22" y="66">z</text><text x="28" y="58">z</text><text x="35" y="49">Z</text></g>' : ""}`;
    el.textContent = "";
    el.append(svg);
    const k = {};
    svg.querySelectorAll("[data-k]").forEach(n => (k[n.dataset.k] = n));
    const durs = Array.isArray(m.d) ? m.d : m.f.map(() => m.d);
    return { el, svg, m, k, durs, total: durs.reduce((a, b) => a + b, 0), offset: Math.random() * 1000 };
  }

  function dumbbell(h, cls) {
    return `<g class="${cls}"><path class="dbb" d="M${fx(h[0] - 4.5)} ${fx(h[1])}H${fx(h[0] + 4.5)}"/><path class="dbp" d="M${fx(h[0] - 4.5)} ${fx(h[1] - 3)}V${fx(h[1] + 3)}M${fx(h[0] + 4.5)} ${fx(h[1] - 3)}V${fx(h[1] + 3)}"/></g>`;
  }

  function draw(inst, time) {
    const { m, k, durs, total } = inst;
    let t = (time + inst.offset) % total, i = 0;
    while (t > durs[i]) { t -= durs[i]; i++; }
    const e = 0.5 - 0.5 * Math.cos(Math.PI * (t / durs[i]));
    const pose = mix(m.f[i], m.f[(i + 1) % m.f.length], e);
    const J = solve(pose, m.front);
    const front = !!m.front;

    // Body
    k.tor.setAttribute("d", line(J.H, J.S));
    k.wst.setAttribute("d", line(J.H, add(J.H, pose.t, 5)));
    k.nk.setAttribute("d", line(J.S, J.N));
    const up = dir(J.na), back = front ? [0, 0] : [up[1], -up[0]];
    k.hair.setAttribute("cx", fx(J.C[0] + back[0] * 1.4 + up[0] * 1.3));
    k.hair.setAttribute("cy", fx(J.C[1] + back[1] * 1.4 + up[1] * 1.3));
    k.head.setAttribute("cx", fx(J.C[0])); k.head.setAttribute("cy", fx(J.C[1]));
    const fwd = [-back[0], -back[1]];
    const eye = (dx) => {
      const ex = J.C[0] + fwd[0] * 3.3 + dx - up[0] * 0.3, ey = J.C[1] + fwd[1] * 3.3 - up[1] * 0.3;
      return m.closed ? `<path class="eyel" d="M${fx(ex - 1.2)} ${fx(ey)}H${fx(ex + 1.2)}"/>` : `<circle class="eye" cx="${fx(ex)}" cy="${fx(ey)}" r="0.95"/>`;
    };
    k.eyes.innerHTML = front ? eye(-2.3) + eye(2.3) : eye(0);

    // Limbs
    [0, 1].forEach(n => {
      const a = J.arms[n], l = J.legs[n], s = String(n + 1);
      k["a" + s].setAttribute("d", line(a.r, a.m, a.e));
      k["v" + s].setAttribute("d", line(a.r, [a.r[0] + (a.m[0] - a.r[0]) * 0.5, a.r[1] + (a.m[1] - a.r[1]) * 0.5]));
      k["l" + s].setAttribute("d", line(l.r, l.m, l.e));
      k["s" + s].setAttribute("d", line(l.r, [l.r[0] + (l.m[0] - l.r[0]) * 0.62, l.r[1] + (l.m[1] - l.r[1]) * 0.62]));
      k["t" + s].setAttribute("d", line(l.e, l.toe));
      let prop = "";
      if (m.db && m.db[n]) prop = dumbbell(a.e, "db");
      if (m.grip && n === 0) prop = `<path class="dbb" d="M${fx(a.e[0])} ${fx(a.e[1] - 3)}V${fx(a.e[1] + 3)}"/>`;
      if (m.bar && n === 0) prop = `<path class="dbb" d="M${fx(a.e[0] - 14)} ${fx(a.e[1])}H${fx(a.e[0] + 8)}"/>`;
      if (m.bottle && n === 0) prop = `<rect class="btl" x="${fx(a.e[0] - 2)}" y="${fx(a.e[1] - 7)}" width="4" height="9" rx="1.5"/>`;
      k["d" + s].innerHTML = prop;
    });
    if (m.cable) k.cable.setAttribute("d", line(m.cable, J.arms[0].e));
  }

  /* ---------------- Animation loop ---------------- */
  const live = new Set();
  const visible = new WeakSet();
  const reduce = window.matchMedia && matchMedia("(prefers-reduced-motion: reduce)").matches;
  const io = "IntersectionObserver" in window
    ? new IntersectionObserver(es => es.forEach(en => (en.isIntersecting ? visible.add(en.target) : visible.delete(en.target))), { rootMargin: "100px" })
    : null;

  function mount(el) {
    if (el._fig) return;
    const inst = create(el, el.dataset.fig);
    el._fig = inst;
    live.add(inst);
    if (io) io.observe(el); else visible.add(el);
    draw(inst, inst.total * 0.35);
  }
  function mountAll(root = document) { root.querySelectorAll("[data-fig]").forEach(mount); }

  let running = false;
  function loop(now) {
    for (const inst of live) {
      if (!inst.el.isConnected) { live.delete(inst); if (io) io.unobserve(inst.el); continue; }
      if (visible.has(inst.el)) draw(inst, now);
    }
    requestAnimationFrame(loop);
  }
  function start() {
    mountAll();
    // Pick up figures added later (e.g. lists re-rendered on language switch)
    new MutationObserver(ms => ms.forEach(mu => mu.addedNodes.forEach(n => {
      if (n.nodeType !== 1) return;
      if (n.dataset && n.dataset.fig) mount(n);
      mountAll(n);
    }))).observe(document.body, { childList: true, subtree: true });
    if (!reduce && !running) { running = true; requestAnimationFrame(loop); }
  }

  return { start, mount, mountAll, names: Object.keys(M), draw, create };
})();

onRender(() => FIGURES.mountAll());
