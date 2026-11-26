/* Plexus offline helper — keeps the last copy of the app pages so Plexus still opens with no network.
   Network first: when you're online you always get the newest version; the saved copy is used only offline.
   Stores only the app's own pages (index.html, sandbox.html) — never patient data (that stays in the app's own storage). */
const CACHE = 'plexus-app-v1';
self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { e.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', e => {
  const r = e.request;
  if(r.method !== 'GET' || r.mode !== 'navigate' || new URL(r.url).origin !== self.location.origin) return;
  e.respondWith((async () => {
    const key = new URL(r.url); key.search = ''; key.hash = '';
    try{
      const res = await fetch(r, {cache:'no-store'});
      if(res && res.ok){ const c = await caches.open(CACHE); c.put(key.href, res.clone()); }
      return res;
    }catch(err){
      const c = await caches.open(CACHE), hit = await c.match(key.href) || await c.match(new URL('./', self.location).href) || await c.match(new URL('index.html', self.location).href);
      if(hit) return hit;
      throw err;
    }
  })());
});
