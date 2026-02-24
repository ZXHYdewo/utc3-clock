const CACHE_NAME = 'clock-cache-v4'; // 升级版本号，确保新的缓存逻辑生效
// 这里列出了我们需要在本地备份的文件，这样断网时 App 也能运行
const urlsToCache = [
  './',
  './index.html',
  './manifest.json'
];

// 安装阶段：把核心文件存入本地缓存
self.addEventListener('install', event => {
  self.skipWaiting(); 
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// 激活阶段：自动把以前旧的缓存全部删掉，保持干净
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('清理旧缓存:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 核心修改：“网络优先 (Network First)”策略
// 每次打开先去网上拿最新排版的代码，只有断网时才用本地的备用数据
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .catch(() => {
        // 如果断网了，才会退而求其次去缓存里找
        return caches.match(event.request);
      })
  );
});
