// Service worker: lets FitStart AI open without internet and be installed as an app.
// Pages, scripts and styles: network first (always the newest when online), saved copy when offline.
// 3D models and icons: saved copy first (they are big and rarely change), refreshed in the background.
const CACHE = "fitstart-v3"; // change the name to make every phone drop its old saved copies
const CORE = ["./", "index.html", "muscle.html", "weight-loss.html", "planner.html", "bmi.html", "more.html", "for-you.html", "profile.html", "settings.html"];

// Save every page, plus the exact scripts and styles each page links to (with their ?v=), so any page works offline
// even if it was never opened before. 3D files are not included here (large); they are saved the first time they load.
async function precache() {
  const c = await caches.open(CACHE), assets = new Set();
  await Promise.all(CORE.map(async page => {
    try {
      const r = await fetch(page, { cache: "no-cache" }); if (!r.ok) return;
      await c.put(page, r.clone());
      const html = await r.text();
      for (const m of html.matchAll(/(?:src|href)="((?:js|css|img)\/[^"]+)"/g)) assets.add(m[1]);
    } catch {}
  }));
  await Promise.all([...assets].map(a => fetch(a).then(r => r.ok && c.put(a, r)).catch(() => {})));
}
self.addEventListener("install", e => {
  e.waitUntil(precache().catch(() => {}));
  self.skipWaiting();
});
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== "GET" || url.origin !== location.origin) return; // fonts etc. go straight to the network
  const heavy = /\.(glb|png|svg|webp|jpg)$/.test(url.pathname);
  if (heavy) {
    e.respondWith(caches.open(CACHE).then(async c => {
      const hit = await c.match(req, { ignoreSearch: true });
      const net = fetch(req).then(r => { if (r.ok) c.put(req, r.clone()); return r; }).catch(() => hit);
      return hit || net;
    }));
    return;
  }
  e.respondWith(fetch(req).then(r => {
    if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
    return r;
  }).catch(() => caches.match(req, { ignoreSearch: true }).then(r => r || caches.match("index.html"))));
});
