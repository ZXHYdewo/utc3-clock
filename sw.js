const CACHE_NAME = 'clock-cache-v2'; // 升级了版本号，强迫浏览器更新
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

self.addEventListener('install', event => {
  self.skipWaiting(); // 强制立即接管控制权
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 激活时，自动把旧的坏缓存全部删掉
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 核心修改：改为“网络优先 (Network First)”策略
// 每次都先去网上拿最新代码，只有断网时才用缓存。彻底杜绝UI更新不出来的问题！
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
