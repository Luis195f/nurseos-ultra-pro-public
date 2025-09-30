self.addEventListener('install', e => { self.skipWaiting(); });
self.addEventListener('activate', e => { self.clients.claim(); });
const API = '/api/';
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if(url.pathname.startsWith(API) && e.request.method === 'POST'){
    e.respondWith((async () => {
      try { return await fetch(e.request.clone()); }
      catch {
        const body = await e.request.clone().text();
        const key = 'outbox-' + Date.now();
        await caches.open('outbox').then(c => c.put(new Request(key), new Response(body)));
        return new Response('Guardado en outbox offline', { status: 202 });
      }
    })());
  }
});
