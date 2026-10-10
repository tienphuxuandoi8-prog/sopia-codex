/**
 * SOPHIA CODEX - SERVICE WORKER (PWA OFFLINE CAPABILITY)
 * Quản lý bộ nhớ đệm (Cache) cho toàn bộ tài nguyên tĩnh và API REST,
 * hỗ trợ đọc sách offline, tối ưu hóa tốc độ tải trang (Web Vitals).
 */

const CACHE_NAME = 'sophia-codex-v1.0.0';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/admin.html',
  '/manifest.json',
  '/css/style.css',
  '/js/app.js',
  '/js/admin.js',
  '/js/reader.js',
  '/js/audio.js',
  '/js/bgm.js',
  '/js/ai-chat.js',
  '/js/quote-card.js',
  '/js/data.js',
  '/js/books-data/suy-tuong.js',
  '/js/books-data/dao-duc-kinh.js',
  '/assets/covers/ban-ve-tu-do.svg',
  '/assets/covers/cong-hoa.svg',
  '/assets/covers/dao-duc-kinh.svg',
  '/assets/covers/suy-tuong.svg',
  '/assets/covers/zarathustra.svg'
];

// 1. Cài đặt Service Worker và lưu Cache các tài nguyên tĩnh cốt lõi
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('🏛️ [ServiceWorker] Đang nạp sẵn tài nguyên tĩnh cho chế độ Offline...');
      return cache.addAll(STATIC_ASSETS).catch(err => {
        console.warn('⚠️ [ServiceWorker] Cảnh báo lưu đệm một số tài nguyên:', err);
      });
    }).then(() => self.skipWaiting())
  );
});

// 2. Kích hoạt và dọn dẹp các bản Cache cũ
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('🧹 [ServiceWorker] Xóa bộ nhớ đệm phiên bản cũ:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Xử lý yêu cầu Fetch (Chiến lược Cache-First cho Static Assets & Network-First cho REST API)
self.addEventListener('fetch', event => {
  const requestUrl = new URL(event.request.url);

  // Đối với các REST API (/api/*): Sử dụng chiến lược Network-First, lưu đệm GET phản hồi
  if (requestUrl.pathname.startsWith('/api/')) {
    if (event.request.method !== 'GET') {
      return; // Không lưu cache các request POST/PUT/DELETE
    }
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse.status === 200) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
          }
          return networkResponse;
        })
        .catch(async () => {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            return cachedResponse;
          }
          return new Response(
            JSON.stringify({ error: 'Bạn đang ở chế độ Ngoại tuyến (Offline). Dữ liệu API được phục vụ từ bộ nhớ đệm.' }),
            { status: 503, headers: { 'Content-Type': 'application/json; charset=utf-8' } }
          );
        })
    );
    return;
  }

  // Đối với Static Assets (HTML, CSS, JS, SVG, Fonts): Chiến lược Cache-First với Stale-While-Revalidate
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Cập nhật ngầm bộ nhớ đệm nếu có kết nối mạng
        fetch(event.request).then(networkResponse => {
          if (networkResponse.status === 200 && event.request.method === 'GET') {
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse));
          }
        }).catch(() => {});
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        if (networkResponse.status === 200 && event.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, responseClone));
        }
        return networkResponse;
      }).catch(() => {
        if (event.request.headers.get('accept')?.includes('text/html')) {
          return caches.match('/index.html');
        }
      });
    })
  );
});
