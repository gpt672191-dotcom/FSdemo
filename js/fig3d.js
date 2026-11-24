// ตัวละคร 3D (3D characters) — ใช้ท่าและจังหวะเดิมจาก js/figures.js แต่วาดเป็นโมเดล 3D ด้วย Three.js
// - ใช้ WebGL ตัวเดียวทั้งหน้า วาดทีละตัวแล้วคัดลอกภาพไปใส่แต่ละกรอบ (ประหยัดเครื่อง)
// - ถ้าเครื่องไม่รองรับ WebGL จะกลับไปใช้แบบ 2D อัตโนมัติ
// - data-fig="mannequin" data-hl="chest" = ร่างกาย 3D หมุนได้ ไฮไลต์กล้ามเนื้อสีแดง (ใช้ในหน้าสร้างกล้าม)

(() => {
  if (typeof THREE === "undefined" || typeof FIGURES === "undefined") return;
  let renderer;
  try {
    const probe = document.createElement("canvas");
    if (!(probe.getContext("webgl2") || probe.getContext("webgl"))) return; // no WebGL: keep 2D figures
  } catch { return; }
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: "low-power" });
    if (!renderer.getContext()) return;
  } catch { return; }
  window.FIG3D_OK = true;

  const F = FIGURES, S = 0.018;
  renderer.setPixelRatio(1);
  renderer.setClearColor(0x000000, 0);
  let bufW = 640, bufH = 640;
  renderer.setSize(bufW, bufH, false);

  /* ---------- Scene, lights, materials ---------- */
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(28, 1, 0.05, 60);
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6d5f8f, 1.15));
  const sun = new THREE.DirectionalLight(0xffffff, 1.7); sun.position.set(2.2, 4, 3.2); scene.add(sun);
  const rim = new THREE.DirectionalLight(0xc4b5fd, 1.0); rim.position.set(-3, 2.2, -2.5); scene.add(rim);

  const std = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: 0.62, metalness: 0, ...o });
  const MAT = {
    skin: std("#f2c4a0"), shirt: std("#8b5cf6"), short: std("#2f3b52"), shoe: std("#1f2937", { roughness: 0.45 }),
    sole: std("#f8fafc"), hair: std("#2b1d14", { roughness: 0.8 }), eye: std("#111827"),
    metal: std("#d4d8e0", { roughness: 0.28, metalness: 0.75 }), rubber: std("#1f2430", { roughness: 0.55 }),
    accent: std("#8b5cf6"), prop: std("#d9d4e6", { roughness: 0.7 }), propDark: std("#8f87a3", { roughness: 0.5, metalness: 0.3 }),
    bottle: std("#38bdf8", { roughness: 0.2 }),
    mann: std("#dcd7e8", { roughness: 0.5 }), hl: std("#f87171", { roughness: 0.45, emissive: "#991b1b", emissiveIntensity: 0.35 })
  };
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  function syncColors() {
    const set = (m, v) => { try { if (v && v.startsWith("#")) m.color.set(v); } catch {} };
    set(MAT.shirt, css("--accent")); set(MAT.accent, css("--accent"));
    set(MAT.short, css("--fig-short")); set(MAT.skin, css("--fig-skin"));
  }

  const G = { cyl: new THREE.CylinderGeometry(1, 1, 1, 18), sph: new THREE.SphereGeometry(1, 22, 16), box: new THREE.BoxGeometry(1, 1, 1),
    cap: new THREE.SphereGeometry(1, 22, 12, 0, Math.PI * 2, 0, Math.PI * 0.55) };
  const Y = new THREE.Vector3(0, 1, 0), X = new THREE.Vector3(1, 0, 0);
  const mesh = (g, m) => { const o = new THREE.Mesh(g, m); scene.add(o); return o; };
  const tmp = new THREE.Vector3(), tmp2 = new THREE.Vector3();

  // Place a unit cylinder between two points
  function seg(o, a, b, r) {
    tmp.subVectors(b, a); const len = Math.max(tmp.length(), 1e-4);
    o.position.copy(a).addScaledVector(tmp, 0.5);
    o.scale.set(r, len, r);
    o.quaternion.setFromUnitVectors(Y, tmp.divideScalar(len));
  }
  const ball = (o, p, r) => { o.position.copy(p); o.scale.setScalar(r); };
  const lerpV = (a, b, t) => new THREE.Vector3().lerpVectors(a, b, t);

  /* ---------- The character rig (shared, re-posed for every figure) ---------- */
  const R = {
    torso: mesh(G.cyl, MAT.shirt), chest: mesh(G.sph, MAT.shirt), waist: mesh(G.cyl, MAT.short), hip: mesh(G.sph, MAT.short),
    neck: mesh(G.cyl, MAT.skin), head: mesh(G.sph, MAT.skin), hair: mesh(G.cap, MAT.hair), eyes: [mesh(G.sph, MAT.eye), mesh(G.sph, MAT.eye)],
    side: [0, 1].map(() => ({
      shoulder: mesh(G.sph, MAT.shirt), sleeve: mesh(G.cyl, MAT.shirt), upper: mesh(G.cyl, MAT.skin), elbow: mesh(G.sph, MAT.skin),
      fore: mesh(G.cyl, MAT.skin), hand: mesh(G.sph, MAT.skin),
      short: mesh(G.cyl, MAT.short), thigh: mesh(G.cyl, MAT.skin), knee: mesh(G.sph, MAT.skin), shin: mesh(G.cyl, MAT.skin),
      shoe: mesh(G.box, MAT.shoe), sole: mesh(G.box, MAT.sole)
    })),
    // muscle pads, only shown on the 3D body map
    pec: [mesh(G.sph, MAT.mann), mesh(G.sph, MAT.mann)], abs: mesh(G.box, MAT.mann), lats: mesh(G.sph, MAT.mann),
    glute: [mesh(G.sph, MAT.mann), mesh(G.sph, MAT.mann)]
  };
  // Hand-held props
  function dumbbell() {
    const g = new THREE.Group();
    const bar = new THREE.Mesh(G.cyl, MAT.metal); bar.scale.set(0.011, 0.2, 0.011); bar.rotation.x = Math.PI / 2; g.add(bar);
    for (const z of [-0.075, 0.075]) {
      const p = new THREE.Mesh(G.cyl, MAT.rubber); p.scale.set(0.05, 0.034, 0.05); p.rotation.x = Math.PI / 2; p.position.z = z; g.add(p);
      const ring = new THREE.Mesh(G.cyl, MAT.accent); ring.scale.set(0.052, 0.008, 0.052); ring.rotation.x = Math.PI / 2; ring.position.z = z * 1.0; g.add(ring);
    }
    scene.add(g); return g;
  }
  const HP = { db: [dumbbell(), dumbbell()], grip: mesh(G.cyl, MAT.propDark), bar: mesh(G.cyl, MAT.metal), bottle: mesh(G.cyl, MAT.bottle), cable: mesh(G.cyl, MAT.propDark) };

  // Soft round shadow + faint floor disc
  const shadowTex = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 128;
    const g = c.getContext("2d"), r = g.createRadialGradient(64, 64, 4, 64, 64, 62);
    r.addColorStop(0, "rgba(0,0,0,.42)"); r.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = r; g.fillRect(0, 0, 128, 128);
    return new THREE.CanvasTexture(c);
  })();
  const shadow = mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false }));
  shadow.rotation.x = -Math.PI / 2;
  const floor = mesh(new THREE.CircleGeometry(1.25, 48), new THREE.MeshBasicMaterial({ color: 0x7c6ca8, transparent: true, opacity: 0.08, depthWrite: false }));
  floor.rotation.x = -Math.PI / 2; floor.position.y = -0.002;

  /* ---------- Scenery props, converted from each motion's 2D SVG props ---------- */
  const propCache = {};
  function buildProps(name, svg) {
    if (propCache[name]) return propCache[name];
    const g = new THREE.Group(); g.visible = false; scene.add(g);
    const P = (x, y, z = 0) => new THREE.Vector3((x - 60) * S, (90.5 - y) * S, z);
    const attrs = s => Object.fromEntries([...s.matchAll(/([\w-]+)="([^"]*)"/g)].map(m => [m[1], m[2]]));
    for (const [, tag, rest] of (svg || "").matchAll(/<(rect|path|circle|ellipse)\s+([^>]*?)\/?>/g)) {
      const a = attrs(rest), thin = (a.class || "").includes("pr2");
      if (tag === "rect") {
        const x = +a.x, y = +a.y, w = +a.width, h = +a.height;
        const o = new THREE.Mesh(G.box, MAT.prop); o.position.copy(P(x + w / 2, y + h / 2)); o.scale.set(w * S, h * S, 0.5); g.add(o);
      } else if (tag === "circle") {
        const o = new THREE.Mesh(new THREE.TorusGeometry(+a.r * S, 0.012, 10, 40), MAT.propDark); o.position.copy(P(+a.cx, +a.cy)); g.add(o);
      } else if (tag === "ellipse") {
        const o = new THREE.Mesh(G.sph, MAT.prop); o.position.copy(P(+a.cx, +a.cy)); o.scale.set(+a.rx * S, +a.ry * S, 0.16); g.add(o);
      } else if (tag === "path" && a.d) {
        let cur = [0, 0];
        for (const [, c, nums] of a.d.matchAll(/([MLHV])\s*([-\d.\s]+)/g)) {
          const v = nums.trim().split(/\s+/).map(Number);
          const next = c === "H" ? [v[0], cur[1]] : c === "V" ? [cur[0], v[0]] : [v[0], v[1]];
          if (c !== "M") {
            const A = P(cur[0], cur[1]), B = P(next[0], next[1]);
            const len = Math.hypot(next[0] - cur[0], next[1] - cur[1]);
            const horizontal = Math.abs(next[1] - cur[1]) < 1, vertical = Math.abs(next[0] - cur[0]) < 1;
            if (thin) {
              // legs / supports: a pair of round posts
              for (const z of [-0.2, 0.2]) { const o = new THREE.Mesh(G.cyl, MAT.propDark); seg(o, A.clone().setZ(z), B.clone().setZ(z), 0.014); g.add(o); }
            } else {
              const depth = (horizontal && cur[1] > 84) ? 0.5 : (vertical && len > 50) ? 0.9 : 0.07;
              const o = new THREE.Mesh(G.box, MAT.prop);
              o.position.copy(A).add(B).multiplyScalar(0.5);
              o.scale.set(Math.max(len * S, 0.02), 0.05, depth);
              o.quaternion.setFromUnitVectors(X, tmp2.subVectors(B, A).normalize());
              g.add(o);
            }
          }
          cur = next;
        }
      }
    }
    return (propCache[name] = g);
  }

  /* ---------- Posing ---------- */
  const MANN_POSE = { hip: [60, 54], t: 180, ha: 0, so: [7, -7], ho: [3, -3], a1: { u: 14, f: 8 }, a2: { u: -14, f: -8 },
    l1: { x: 64, y: 90, b: -1 }, l2: { x: 56, y: 90, b: 1 } };
  // Which parts light up on the body map
  const HL = {
    chest: r => r.pec, back: r => [r.lats], core: r => [r.abs], glutes: r => r.glute,
    shoulders: r => r.side.map(s => s.shoulder),
    arms: r => r.side.flatMap(s => [s.upper, s.elbow, s.fore]),
    legs: r => r.side.flatMap(s => [s.short, s.thigh, s.knee, s.shin])
  };
  // Close-up camera per muscle group: [target y, half height, base angle]
  const ZOOM = { chest: [1.02, 0.32, 0.25], back: [1.0, 0.36, Math.PI - 0.25], shoulders: [1.08, 0.34, 0.35], arms: [0.95, 0.5, 0.45],
    legs: [0.36, 0.44, 0.3], glutes: [0.62, 0.3, Math.PI - 0.35], core: [0.86, 0.3, 0.25] };

  function poseRig(J, front, m, mann, hlGroup) {
    const sideZ = (i, w) => (front ? 0 : (i === 0 ? w : -w));
    const P = (p, z = 0) => new THREE.Vector3((p[0] - 60) * S, (90.5 - p[1]) * S, z);
    const H = P(J.H), Sh = P(J.S), N = P(J.N), C = P(J.C);
    const up2 = F.dir(J.na);
    const torsoUp = tmp2.subVectors(Sh, H).normalize().clone();
    const body = front ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(torsoUp.y, -torsoUp.x, 0); // chest-facing direction
    const lat = new THREE.Vector3().crossVectors(torsoUp, body).normalize();

    seg(R.torso, H, Sh, 0.105); ball(R.chest, Sh, 0.108);
    seg(R.waist, H, lerpV(H, Sh, 0.22), 0.112); ball(R.hip, H, 0.108);
    seg(R.neck, Sh, N, 0.038); ball(R.head, C, 0.108);
    // hair cap sits on top/back of the head
    const headUp = new THREE.Vector3(up2[0], -up2[1], 0).normalize();
    const headFwd = front ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(headUp.y, -headUp.x, 0);
    R.hair.position.copy(C).addScaledVector(headFwd, -0.022).addScaledVector(headUp, 0.03);
    R.hair.scale.setScalar(0.114);
    R.hair.quaternion.setFromUnitVectors(Y, headUp);
    R.hair.rotateX(front ? -0.5 : 0); if (!front) R.hair.rotateZ(0.5);
    const headLat = new THREE.Vector3().crossVectors(headUp, headFwd).normalize();
    R.eyes.forEach((e, i) => {
      e.visible = !mann && !m.closed;
      const p = C.clone().addScaledVector(headFwd, 0.098).addScaledVector(headUp, 0.012).addScaledVector(headLat, i ? 0.038 : -0.038);
      ball(e, p, 0.014);
    });

    [0, 1].forEach(i => {
      const a = J.arms[i], l = J.legs[i], s = R.side[i];
      const aZ = sideZ(i, 0.16), lZ = sideZ(i, 0.085);
      const A0 = P(a.r, aZ), A1 = P(a.m, aZ), A2 = P(a.e, aZ);
      ball(s.shoulder, A0, 0.058);
      seg(s.sleeve, A0, lerpV(A0, A1, 0.55), 0.052);
      seg(s.upper, A0, A1, 0.044); ball(s.elbow, A1, 0.042);
      seg(s.fore, A1, A2, 0.036); ball(s.hand, A2, 0.04);
      const L0 = P(l.r, lZ), L1 = P(l.m, lZ), L2 = P(l.e, lZ), T = P(l.toe, lZ);
      seg(s.short, L0, lerpV(L0, L1, 0.62), 0.066);
      seg(s.thigh, L0, L1, 0.056); ball(s.knee, L1, 0.052);
      seg(s.shin, L1, L2, 0.046);
      // shoe: from ankle toward the toe (front view: toes point at the camera)
      const toeDir = front ? new THREE.Vector3(0, 0, 1) : tmp.subVectors(T, L2).normalize().clone();
      s.shoe.position.copy(L2).addScaledVector(toeDir, 0.04); s.shoe.position.y += 0.012;
      s.shoe.scale.set(0.15, 0.062, 0.078);
      s.shoe.quaternion.setFromUnitVectors(X, toeDir);
      s.sole.position.copy(s.shoe.position).addScaledVector(Y, -0.03); s.sole.scale.set(0.155, 0.014, 0.082); s.sole.quaternion.copy(s.shoe.quaternion);
      s.sleeve.visible = !mann;
      s.short.visible = true;
    });

    // Muscle pads (body map only), placed on the torso
    const padsOn = !!mann;
    R.pec.forEach((o, i) => { o.visible = padsOn; o.position.copy(Sh).addScaledVector(torsoUp, -0.07).addScaledVector(body, 0.075).addScaledVector(lat, i ? 0.05 : -0.05); o.scale.set(0.058, 0.048, 0.04); });
    R.abs.visible = padsOn; R.abs.position.copy(H).addScaledVector(torsoUp, 0.15).addScaledVector(body, 0.085); R.abs.scale.set(0.085, 0.17, 0.04);
    R.lats.visible = padsOn; R.lats.position.copy(Sh).addScaledVector(torsoUp, -0.1).addScaledVector(body, -0.08); R.lats.scale.set(0.11, 0.13, 0.04);
    R.glute.forEach((o, i) => { o.visible = padsOn; o.position.copy(H).addScaledVector(body, -0.07).addScaledVector(torsoUp, -0.02).addScaledVector(lat, i ? 0.052 : -0.052); o.scale.setScalar(0.068); });

    // Materials: normal outfit, or a light mannequin with the chosen muscles in red
    const all = [R.torso, R.chest, R.waist, R.hip, R.neck, R.head, ...R.side.flatMap(s => Object.values(s)), ...R.pec, R.abs, R.lats, ...R.glute];
    if (mann) {
      all.forEach(o => (o.material = MAT.mann));
      (HL[hlGroup] ? HL[hlGroup](R) : []).forEach(o => (o.material = MAT.hl));
      R.hair.material = MAT.mann; R.hair.visible = true;
    } else {
      [R.torso, R.chest, ...R.side.flatMap(s => [s.shoulder, s.sleeve])].forEach(o => (o.material = MAT.shirt));
      [R.waist, R.hip, ...R.side.map(s => s.short)].forEach(o => (o.material = MAT.short));
      [R.neck, R.head, ...R.side.flatMap(s => [s.upper, s.elbow, s.fore, s.hand, s.thigh, s.knee, s.shin])].forEach(o => (o.material = MAT.skin));
      R.side.forEach(s => { s.shoe.material = MAT.shoe; s.sole.material = MAT.sole; });
      R.hair.material = MAT.hair; R.hair.visible = true;
    }

    // Hand-held props
    const hand = i => R.side[i].hand.position;
    HP.db.forEach((g, i) => { g.visible = !mann && !!(m.db && m.db[i]); g.position.copy(hand(i)); });
    HP.grip.visible = !mann && !!m.grip; if (m.grip) { HP.grip.position.copy(hand(0)); HP.grip.scale.set(0.014, 0.16, 0.014); HP.grip.rotation.set(Math.PI / 2, 0, 0); }
    HP.bar.visible = !mann && !!m.bar; if (m.bar) { HP.bar.position.copy(hand(0)).setZ(0); HP.bar.scale.set(0.012, 0.8, 0.012); HP.bar.rotation.set(Math.PI / 2, 0, 0); }
    HP.bottle.visible = !mann && !!m.bottle; if (m.bottle) { HP.bottle.position.copy(hand(0)).add(new THREE.Vector3(0, 0.035, 0)); HP.bottle.scale.set(0.024, 0.13, 0.024); HP.bottle.rotation.set(0, 0, 0); }
    HP.cable.visible = !mann && !!m.cable; if (m.cable) seg(HP.cable, P(m.cable, 0), hand(0), 0.005);

    // Shadow under the body
    const xs = [H.x, ...R.side.map(s => s.shoe.position.x)], minX = Math.min(...xs), maxX = Math.max(...xs);
    shadow.position.set((minX + maxX) / 2, 0.001, 0);
    shadow.scale.set(Math.max(0.7, (maxX - minX) + 0.6), 0.55, 1);
    shadow.visible = !m.noFloor; floor.visible = !m.noFloor;
  }

  /* ---------- Realistic bodies: skinned human models posed with the same key poses ---------- */
  // Two models, both on the Mixamo skeleton:
  //   models/person.glb  a realistic young man (shirtless, shorts, sneakers) made with Ara 3D Gen from CC0 MakeHuman data, for every exercise figure
  //   models/body.glb    "X Bot", a smooth mannequin, for the muscle map (muscles are tinted red on it)
  // Each frame the bones are turned so every limb points the same way as the simple rig above. A model is
  // loaded the first time a figure needs it; until then (or if loading fails, e.g. when the page is opened
  // straight from disk) the simple rig is drawn instead.
  const BOTS = { fig: { url: "models/person.glb", masks: false }, mann: { url: "models/body.glb", masks: true } };
  const BMAT = {
    body: new THREE.MeshStandardMaterial({ color: "#ffffff", roughness: 0.62, metalness: 0, vertexColors: true }),
    joint: new THREE.MeshStandardMaterial({ color: "#6d5f94", roughness: 0.35, metalness: 0.15, vertexColors: true })
  };
  const BODY_TINT = new THREE.Color("#e7e3ef"), JOINT_TINT = new THREE.Color("#7b6aa6"), HL_TINT = new THREE.Color("#e11d48"), MANN_TINT = new THREE.Color("#dcd7e8");
  const qa = new THREE.Quaternion(), qb = new THREE.Quaternion(), va = new THREE.Vector3(), vb = new THREE.Vector3();

  const RIG_PARTS = () => [R.torso, R.chest, R.waist, R.hip, R.neck, R.head, R.hair, ...R.eyes, ...R.side.flatMap(s => Object.values(s)), ...R.pec, R.abs, R.lats, ...R.glute];
  function loadBot(BOT) {
    if (!THREE.GLTFLoader || BOT.loading) return;
    BOT.loading = true;
    new THREE.GLTFLoader().load(BOT.url, gltf => {
      const root = new THREE.Group(), model = gltf.scene;
      root.add(model); scene.add(root); root.visible = false;
      const bone = n => model.getObjectByName("mixamorig" + n) || model.getObjectByName(n);
      const B = {};
      ["Hips", "Spine", "Spine1", "Spine2", "Neck", "Head", "HeadTop_End"].forEach(n => (B[n] = bone(n)));
      for (const s of ["Left", "Right"]) ["Shoulder", "Arm", "ForeArm", "Hand", "HandMiddle1", "UpLeg", "Leg", "Foot", "ToeBase", "Toe_End"].forEach(n => (B[s + n] = bone(s + n)));
      if (Object.values(B).some(b => !b)) return;

      // Scale so the leg is as long as the simple rig's leg, and stand it on the floor
      root.updateMatrixWorld(true);
      const wp = o => o.getWorldPosition(new THREE.Vector3());
      const legLen = wp(B.LeftUpLeg).distanceTo(wp(B.LeftLeg)) + wp(B.LeftLeg).distanceTo(wp(B.LeftFoot));
      const k = (36 * S) / legLen; // simple-rig thigh + shin
      root.scale.setScalar(k); root.updateMatrixWorld(true);
      const meshes = [];
      model.traverse(o => { if (o.isSkinnedMesh) { meshes.push(o); o.frustumCulled = false; } });
      const box = new THREE.Box3().setFromObject(model, true);
      model.position.y -= box.min.y / k; root.updateMatrixWorld(true);

      // Rest pose: local rotations, and which way each bone points (toward its child joint)
      const rest = new Map();
      model.traverse(o => { if (o.isBone) rest.set(o, o.quaternion.clone()); });
      const axisTo = (b, c) => c.position.clone().normalize();
      const AX = new Map();
      const chain = [["Hips", "Spine"], ["Spine", "Spine1"], ["Spine1", "Spine2"], ["Spine2", "Neck"], ["Neck", "Head"], ["Head", "HeadTop_End"]];
      for (const s of ["Left", "Right"]) chain.push([s + "Arm", s + "ForeArm"], [s + "ForeArm", s + "Hand"], [s + "UpLeg", s + "Leg"], [s + "Leg", s + "Foot"], [s + "Foot", s + "ToeBase"]);
      chain.forEach(([a, c]) => AX.set(B[a], axisTo(B[a], B[c])));
      // How far the foot bone points below horizontal when standing, and ankle/toe heights
      const fdir = wp(B.LeftToeBase).sub(wp(B.LeftFoot)).normalize();
      const footPitch = Math.asin(Math.max(-1, Math.min(1, -fdir.y)));
      const ankleH = wp(B.LeftFoot).y, toeH = wp(B.LeftToeBase).y;

      // Muscle-group masks for the body map, from skin weights and the rest shape (model faces +Z)
      const J = n => wp(B[n]);
      const sh = J("LeftArm"), shR = J("RightArm"), hip = J("Hips"), sp2 = J("Spine2"), neck = J("Neck");
      const shW = Math.abs(sh.x - shR.x) / 2, unit = legLen * k; // unit ≈ leg length
      const sstep = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
      const GROUPS = ["chest", "back", "core", "glutes", "shoulders", "arms", "legs"];
      if (BOT.masks) meshes.forEach(mesh => {
        mesh.skeleton.update(); // bone matrices for getVertexPosition (normally done at first render)
        const g = mesh.geometry, n = g.attributes.position.count;
        const names = mesh.skeleton.bones.map(b => b.name.replace("mixamorig", "").replace(/^(Left|Right)/, ""));
        const ji = g.attributes.skinIndex, wi = g.attributes.skinWeight;
        // Rest-pose world positions, and normals rebuilt from the triangles (the file's normals are in quantized space)
        const pw = new Float32Array(n * 3), nw = new Float32Array(n * 3);
        const p = new THREE.Vector3(), nv = new THREE.Vector3(), e1 = new THREE.Vector3(), e2 = new THREE.Vector3();
        for (let i = 0; i < n; i++) { mesh.getVertexPosition(i, p); p.applyMatrix4(mesh.matrixWorld); p.toArray(pw, i * 3); }
        const idx = g.index.array;
        for (let t = 0; t < idx.length; t += 3) {
          const a = idx[t] * 3, b = idx[t + 1] * 3, c = idx[t + 2] * 3;
          e1.set(pw[b] - pw[a], pw[b + 1] - pw[a + 1], pw[b + 2] - pw[a + 2]);
          e2.set(pw[c] - pw[a], pw[c + 1] - pw[a + 1], pw[c + 2] - pw[a + 2]);
          e1.cross(e2);
          for (const v of [a, b, c]) { nw[v] += e1.x; nw[v + 1] += e1.y; nw[v + 2] += e1.z; }
        }
        const cols = {};
        GROUPS.forEach(k2 => (cols[k2] = new Float32Array(n * 3)));
        const plain = new Float32Array(n * 3).fill(1);
        const nm = new THREE.Matrix3().getNormalMatrix(mesh.matrixWorld), fileN = new THREE.Vector3();
        for (let i = 0; i < n; i++) {
          p.fromArray(pw, i * 3);
          nv.fromArray(nw, i * 3).normalize();
          // some triangles are wound the other way (mirrored half): trust the file's normal for the side it faces
          fileN.fromBufferAttribute(g.attributes.normal, i).applyMatrix3(nm);
          if (nv.dot(fileN) < 0) nv.negate();
          const w = {};
          const jv = [ji.getX(i), ji.getY(i), ji.getZ(i), ji.getW(i)], wv = [wi.getX(i), wi.getY(i), wi.getZ(i), wi.getW(i)];
          for (let c = 0; c < 4; c++) { const nmB = names[jv[c]]; w[nmB] = (w[nmB] || 0) + wv[c]; }
          const W = (...ns) => ns.reduce((a, b) => a + (w[b] || 0), 0);
          const front = sstep(0.05, 0.35, nv.z), backF = sstep(0.0, -0.3, nv.z), inside = sstep(shW * 1.3, shW * 1.0, Math.abs(p.x - hip.x));
          const dSh = Math.min(p.distanceTo(sh), p.distanceTo(shR));
          const shoulder = sstep(unit * 0.2, unit * 0.12, dSh) * Math.min(1, W("Arm", "Shoulder", "Spine2") * 1.4);
          const glute = W("Hips", "UpLeg") * backF * sstep(hip.y - unit * 0.36, hip.y - unit * 0.22, p.y) * sstep(hip.y + unit * 0.12, hip.y - unit * 0.02, p.y);
          const m = {
            chest: W("Spine2", "Shoulder", "Spine1") * front * inside * sstep(sp2.y - unit * 0.2, sp2.y - unit * 0.1, p.y) * sstep(neck.y, neck.y - unit * 0.07, p.y) * (1 - shoulder),
            back: W("Spine1", "Spine2", "Shoulder", "Spine") * backF * inside * sstep(hip.y + unit * 0.06, hip.y + unit * 0.16, p.y) * (1 - shoulder),
            core: W("Spine", "Spine1", "Hips") * front * sstep(hip.y - unit * 0.06, hip.y + unit * 0.02, p.y) * sstep(sp2.y, sp2.y - unit * 0.1, p.y),
            glutes: glute,
            shoulders: shoulder,
            arms: W("Arm", "ForeArm") * (1 - shoulder),
            legs: Math.max(0, W("UpLeg", "Leg") - glute) * sstep(hip.y - unit * 0.05, hip.y - unit * 0.2, p.y)
          };
          GROUPS.forEach(k2 => {
            const t = Math.min(1, m[k2] * 1.3), c = MANN_TINT.clone().lerp(HL_TINT, t);
            cols[k2].set([c.r, c.g, c.b], i * 3);
          });
        }
        const attrs = { plain: new THREE.BufferAttribute(plain, 3), mann: new THREE.BufferAttribute(new Float32Array(n * 3).map((_, j) => [MANN_TINT.r, MANN_TINT.g, MANN_TINT.b][j % 3]), 3) };
        GROUPS.forEach(k2 => (attrs[k2] = new THREE.BufferAttribute(cols[k2], 3)));
        mesh.userData.cols = attrs;
        g.setAttribute("color", attrs.plain);
        mesh.material = /joint/i.test(mesh.name) ? BMAT.joint : BMAT.body;
        mesh.userData.joint = /joint/i.test(mesh.name);
      });

      if (!BOT.masks) meshes.forEach(ms => dressPerson(ms.material));
      Object.assign(BOT, { ready: true, root, model, B, rest, AX, meshes, footPitch, ankleH, toeH, unit });
      F.refresh();
    }, undefined, e => { BOT.failed = true; F.refresh(); console.warn("3D body model not loaded; using the simple figure", e); });
  }

  // Person model: a touch of self-light so skin reads well on the dark cards
  function dressPerson(mt) {
    for (const m of Array.isArray(mt) ? mt : [mt]) {
      if (!m || !m.map || m.transparent) continue;
      m.emissiveMap = m.map; m.emissive = new THREE.Color(0xffffff); m.emissiveIntensity = 0.16;
      m.needsUpdate = true;
    }
  }

  // Turn a bone (swing only, no twist) so it points along world direction d
  function aim(BOT, b, d) {
    if (!d || d.lengthSq() < 1e-8) return;
    b.parent.getWorldQuaternion(qa);
    qb.copy(qa).multiply(b.quaternion);                    // current world rotation
    va.copy(BOT.AX.get(b)).applyQuaternion(qb);            // where it points now
    const delta = new THREE.Quaternion().setFromUnitVectors(va.normalize(), vb.copy(d).normalize());
    qb.premultiply(delta);
    b.quaternion.copy(qa.invert().multiply(qb));
    b.updateMatrixWorld(true);
  }

  function poseBot(BOT, J, front, m, mann, hlGroup) {
    const { root, B, rest } = BOT;
    const P = (p, z = 0) => new THREE.Vector3((p[0] - 60) * S, (90.5 - p[1]) * S, z);
    root.position.set(0, 0, 0);
    root.quaternion.setFromAxisAngle(Y, front ? 0 : Math.PI / 2); // side view: the body faces +X
    rest.forEach((q, b) => b.quaternion.copy(q));
    root.updateMatrixWorld(true);

    const H = P(J.H), Sh = P(J.S), C = P(J.C);
    const up = new THREE.Vector3().subVectors(Sh, H).normalize();
    const d2 = J.na !== undefined ? F.dir(J.na) : [0, -1];
    const headUp = new THREE.Vector3(d2[0], -d2[1], 0).normalize();
    ["Hips", "Spine", "Spine1", "Spine2"].forEach(n => aim(BOT, B[n], up));
    aim(BOT, B.Neck, headUp); aim(BOT, B.Head, headUp);

    // Simple-rig limb index -> model side. Side view faces +X so index 0 (near the camera) is the right side;
    // front view faces the camera so index 0 (screen right) is the left side.
    const sides = front ? ["Left", "Right"] : ["Right", "Left"];
    const lows = [H.y - 0.1, Sh.y - 0.1, C.y - 0.1];
    [0, 1].forEach(i => {
      const s = sides[i], a = J.arms[i], l = J.legs[i];
      const A0 = P(a.r), A1 = P(a.m), A2 = P(a.e), L0 = P(l.r), L1 = P(l.m), L2 = P(l.e), T = P(l.toe);
      aim(BOT, B[s + "Arm"], vb.subVectors(A1, A0).clone());
      aim(BOT, B[s + "ForeArm"], vb.subVectors(A2, A1).clone());
      aim(BOT, B[s + "UpLeg"], vb.subVectors(L1, L0).clone());
      const shin = new THREE.Vector3().subVectors(L2, L1).normalize();
      aim(BOT, B[s + "Leg"], shin);
      // foot: toes toward the rig's toe, sole facing away from the shin
      const toe = front ? new THREE.Vector3(i ? -0.12 : 0.12, 0, 1).normalize() : new THREE.Vector3().subVectors(T, L2).normalize();
      const down = shin.clone().addScaledVector(toe, -shin.dot(toe));
      if (down.lengthSq() < 1e-4) down.set(0, -1, 0); else down.normalize();
      aim(BOT, B[s + "Foot"], toe.multiplyScalar(Math.cos(BOT.footPitch)).addScaledVector(down, Math.sin(BOT.footPitch)));
      lows.push(A2.y - 0.02, L2.y - 0.009, T.y - 0.009);
    });

    // Place the body: hips over the rig's hips, lowest point at the rig's lowest point (feet/hands/back on the floor)
    const wp = (o, v = new THREE.Vector3()) => o.getWorldPosition(v);
    const hipW = wp(B.Hips);
    const bodyLow = Math.min(
      hipW.y - BOT.unit * 0.15, wp(B.Spine2).y - BOT.unit * 0.15, wp(B.Head).y - BOT.unit * 0.12,
      ...["Left", "Right"].flatMap(s => [wp(B[s + "Hand"]).y - BOT.unit * 0.04, wp(B[s + "Foot"]).y - BOT.ankleH, wp(B[s + "ToeBase"]).y - BOT.toeH]));
    const target = Math.max(0, Math.min(...lows));
    root.position.set(H.x - hipW.x, target - bodyLow, front ? 0 : -hipW.z);
    root.updateMatrixWorld(true);

    // Muscle map: light mannequin with one muscle group in red
    if (BOT.masks) BOT.meshes.forEach(ms => {
      const a = ms.userData.cols[hlGroup in ms.userData.cols ? hlGroup : "mann"];
      if (ms.geometry.attributes.color !== a) ms.geometry.setAttribute("color", a);
    });
    BMAT.body.color.copy(mann ? new THREE.Color(1, 1, 1) : BODY_TINT);
    BMAT.joint.color.set(mann ? "#ffffff" : JOINT_TINT);

    // Hand-held props sit in the palm
    const palm = i => { const s = sides[i]; return wp(B[s + "Hand"]).lerp(wp(B[s + "HandMiddle1"]), 0.6); };
    HP.db.forEach((g, i) => { g.visible = !mann && !!(m.db && m.db[i]); if (g.visible) g.position.copy(palm(i)); });
    HP.grip.visible = !mann && !!m.grip; if (m.grip) { HP.grip.position.copy(palm(0)); HP.grip.scale.set(0.014, 0.16, 0.014); HP.grip.rotation.set(Math.PI / 2, 0, 0); }
    HP.bar.visible = !mann && !!m.bar; if (m.bar) { const a = palm(0), b = palm(1); HP.bar.position.copy(a).add(b).multiplyScalar(0.5); HP.bar.scale.set(0.012, 0.8, 0.012); HP.bar.rotation.set(Math.PI / 2, 0, 0); }
    HP.bottle.visible = !mann && !!m.bottle; if (m.bottle) { HP.bottle.position.copy(palm(0)).add(new THREE.Vector3(0, 0.035, 0)); HP.bottle.scale.set(0.024, 0.13, 0.024); HP.bottle.rotation.set(0, 0, 0); }
    HP.cable.visible = !mann && !!m.cable; if (m.cable) seg(HP.cable, P(m.cable, 0), palm(0), 0.005);

    const xs = [wp(B.Hips).x, ...["Left", "Right"].map(s => wp(B[s + "Foot"]).x)], minX = Math.min(...xs), maxX = Math.max(...xs);
    shadow.position.set((minX + maxX) / 2, 0.001, 0);
    shadow.scale.set(Math.max(0.7, (maxX - minX) + 0.6), 0.55, 1);
    shadow.visible = !m.noFloor; floor.visible = !m.noFloor;
  }

  /* ---------- Backend used by figures.js ---------- */
  function create(el, name) {
    const mann = name === "mannequin";
    loadBot(BOTS[mann ? "mann" : "fig"]);
    const m = mann ? { f: [MANN_POSE], d: 1000, front: 1 } : (F.M[F.ALIAS[name] || name] || F.M.idle);
    el.textContent = "";
    const canvas = document.createElement("canvas");
    canvas.className = "fig3d";
    el.append(canvas);
    el.classList.add("is3d");
    const durs = Array.isArray(m.d) ? m.d : m.f.map(() => m.d);
    // Frame the camera on this move: bounding box of every key pose (+ scenery), in world units
    let fit = null;
    if (!mann) {
      const xs = [], ys = [0];
      const add = p => { xs.push((p[0] - 60) * S); ys.push((90.5 - p[1]) * S); };
      m.f.forEach(pose => {
        const J = F.solve(pose, m.front);
        [J.H, J.S, J.C, ...J.arms.flatMap(a => [a.m, a.e]), ...J.legs.flatMap(l => [l.m, l.e, l.toe])].forEach(add);
        ys.push((90.5 - J.C[1]) * S + 0.13);
      });
      const pg = buildProps(name, m.props);
      if (pg.children.length) { pg.visible = true; const bb = new THREE.Box3().setFromObject(pg); pg.visible = false; xs.push(bb.min.x, bb.max.x); ys.push(bb.min.y, bb.max.y); }
      const minX = Math.min(...xs), maxX = Math.max(...xs), minY = Math.min(...ys), maxY = Math.max(...ys);
      fit = { cx: (minX + maxX) / 2, cy: (minY + maxY) / 2, hw: (maxX - minX) / 2, hh: (maxY - minY) / 2 };
    }
    return {
      fit,
      el, canvas, ctx: canvas.getContext("2d"), is3d: true, m, durs, total: durs.reduce((a, b) => a + b, 0),
      offset: Math.random() * 1000, name, mann, hl: el.dataset.hl, zoom: el.dataset.zoom === "1",
      props: mann ? null : buildProps(name, m.props)
    };
  }

  let shown = null;
  function draw(inst, time) {
    const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    let w = Math.round(inst.el.clientWidth * dpr), h = Math.round(inst.el.clientHeight * dpr);
    if (!w || !h) return;
    const k = Math.min(1, 720 / Math.max(w, h)); w = Math.round(w * k); h = Math.round(h * k);
    if (w > bufW || h > bufH) { bufW = Math.max(bufW, w); bufH = Math.max(bufH, h); renderer.setSize(bufW, bufH, false); }
    if (inst.canvas.width !== w || inst.canvas.height !== h) { inst.canvas.width = w; inst.canvas.height = h; }

    // Pose at this moment (same easing as the 2D version)
    const { m, durs, total } = inst;
    let t = (time + inst.offset) % total, i = 0;
    while (t > durs[i]) { t -= durs[i]; i++; }
    const e = 0.5 - 0.5 * Math.cos(Math.PI * (t / durs[i]));
    const pose = F.mix(m.f[i], m.f[(i + 1) % m.f.length], e);
    const bot = BOTS[inst.mann ? "mann" : "fig"], J = F.solve(pose, m.front);
    // While the model downloads, show a loading pulse instead of the simple figure (used only if loading fails)
    const waiting = !bot.ready && !bot.failed && !!THREE.GLTFLoader;
    inst.el.classList.toggle("fig-loading", waiting);
    if (waiting) { inst.ctx.clearRect(0, 0, w, h); return; }
    for (const k in BOTS) if (BOTS[k].root) BOTS[k].root.visible = BOTS[k] === bot;
    if (bot.ready) { RIG_PARTS().forEach(o => (o.visible = false)); poseBot(bot, J, !!m.front, m, inst.mann, inst.hl); }
    else { RIG_PARTS().forEach(o => (o.visible = true)); poseRig(J, !!m.front, m, inst.mann, inst.hl); }
    // Figures on the home stage stand on their own glowing podium, so skip the floor disc
    if (inst.el.closest(".h3-stage")) floor.visible = false;

    if (shown !== inst.props) { if (shown) shown.visible = false; shown = inst.props; }
    if (shown) shown.visible = true;

    // Camera: a three-quarter view so the figure reads as 3D
    const aspect = w / h;
    let tx = 0, ty = 0.72, halfH = 0.84, halfW = 1.0, ang = m.front ? 0.32 : 0.42;
    if (inst.fit) {
      const f = inst.fit;
      tx = f.cx; ty = f.cy;
      // in a three-quarter view the width shrinks a little and depth shows instead
      halfW = Math.max(0.42, f.hw * Math.cos(ang) + 0.3 * Math.sin(ang) + 0.16);
      halfH = Math.max(0.5, f.hh + 0.09);
    }
    if (inst.mann) {
      const z = inst.zoom && ZOOM[inst.hl] ? ZOOM[inst.hl] : [0.78, 0.86, 0.3];
      ty = z[0]; halfH = z[1]; halfW = z[1] * 1.15;
      const still = F.motionOff();
      ang = inst.zoom ? z[2] + (still ? 0 : Math.sin(time * 0.0009) * 0.75) : (still ? 0.5 : time * 0.0005);
    }
    const tan = Math.tan((camera.fov * Math.PI) / 360);
    const dist = Math.max(halfH / tan, halfW / (tan * aspect)) + 0.1;
    const elev = 0.17;
    camera.aspect = aspect;
    camera.position.set(tx + Math.sin(ang) * Math.cos(elev) * dist, ty + Math.sin(elev) * dist, Math.cos(ang) * Math.cos(elev) * dist);
    camera.lookAt(tx, ty, 0);
    camera.updateProjectionMatrix();

    renderer.setViewport(0, 0, w, h); renderer.setScissor(0, 0, w, h); renderer.setScissorTest(true);
    renderer.clear();
    renderer.render(scene, camera);
    inst.ctx.clearRect(0, 0, w, h);
    inst.ctx.drawImage(renderer.domElement, 0, bufH - h, w, h, 0, 0, w, h);
  }

  syncColors();
  onRender(syncColors);
  F.backend = { create, draw };
})();
