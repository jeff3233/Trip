// 離線快取：先給快取（秒開、國外沒網路也能用），背景再抓新版，下次開啟生效
const CACHE = 'trip-v1';
const CDN = /^(cdn\.jsdelivr\.net|www\.gstatic\.com)$/;

self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', e => e.waitUntil(self.clients.claim()));

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || (url.origin !== location.origin && !CDN.test(url.host))) return; // Firestore 等 API 不快取
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: true });
    const net = fetch(req).then(res => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    }).catch(() => hit);
    return hit || net;
  }));
});
