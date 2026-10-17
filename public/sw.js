/*
 * Tools 站点 Service Worker
 *
 * 缓存策略：
 *   - 导航请求（任意路由）  network-first，失败回退到缓存的 index.html
 *                          —— SPA 深链离线也能打开（createBrowserRouter 走前端路由）
 *   - /api/ 请求           network-first，超时或失败回退缓存
 *   - 带 hash 的构建产物    cache-first（/assets/*），内容寻址，永久有效
 *   - public 静态资源       cache-first，按需缓存（monaco 16MB 不预缓存，用到才存）
 *   - manifest / 图标      network-first，小文件，保证换图标后能立刻生效
 *
 * 维护提示：改动预缓存清单或缓存策略后，把 VERSION 加一，旧缓存会在 activate 时清理。
 * 应用侧注册逻辑见 src/lib/pwa.ts（仅生产构建注册，避免缓存住 vite 的开发模块）。
 */

const VERSION = 'v1';

/** 预缓存：应用外壳，离线首屏所需 */
const SHELL_CACHE = `tools-shell-${VERSION}`;
const PAGE_CACHE = `tools-page-${VERSION}`;
const ASSET_CACHE = `tools-asset-${VERSION}`;
const API_CACHE = `tools-api-${VERSION}`;
const CURRENT_CACHES = [SHELL_CACHE, PAGE_CACHE, ASSET_CACHE, API_CACHE];

const SHELL_URLS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/favicon.ico',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

/** 网络优先结果的超时上限（ms） */
const NETWORK_TIMEOUT = 8000;

/** 各缓存的条目上限，超出后按写入顺序淘汰最旧的 */
const MAX_ENTRIES = {
  [ASSET_CACHE]: 400,
  [API_CACHE]: 60,
};

const INDEX_URL = '/index.html';

// ---------------------------------------------------------------- install

self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // 逐个放行：某个文件 404 不至于让整次安装失败
      await Promise.all(
        SHELL_URLS.map(async (url) => {
          try {
            const res = await fetch(url, { cache: 'reload' });
            if (res.ok) await cache.put(url, res);
          } catch {
            /* 离线安装：忽略，运行时网络优先会补齐 */
          }
        }),
      );
      await self.skipWaiting();
    })(),
  );
});

// --------------------------------------------------------------- activate

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys();
      await Promise.all(
        names
          .filter((name) => name.startsWith('tools-') && !CURRENT_CACHES.includes(name))
          .map((name) => caches.delete(name)),
      );
      await self.clients.claim();
    })(),
  );
});

// ------------------------------------------------------------------ fetch

self.addEventListener('fetch', (event) => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // 跨域（百度统计、聊天接口等）交回浏览器自己处理
  if (url.origin !== self.location.origin) return;

  // 音视频拖动进度条会带 Range，交给浏览器本体处理
  if (request.headers.has('range')) return;

  if (request.mode === 'navigate') {
    event.respondWith(handleNavigate(request));
    return;
  }

  if (isApi(url)) {
    event.respondWith(networkFirst(request, API_CACHE));
    return;
  }

  if (isVolatile(url)) {
    event.respondWith(networkFirst(request, SHELL_CACHE));
    return;
  }

  event.respondWith(cacheFirst(request, ASSET_CACHE));
});

/** SPA：所有路由回退到 index.html */
function isApi(url) {
  return url.pathname.startsWith('/api/');
}

/** 小文件、希望能立刻拿到新版本的资源 */
function isVolatile(url) {
  return (
    url.pathname === '/manifest.json' ||
    url.pathname.startsWith('/icons/') ||
    url.pathname.endsWith('/favicon.ico')
  );
}

// ---------------------------------------------------------------- 策略实现

async function handleNavigate(request) {
  const cache = await caches.open(PAGE_CACHE);
  try {
    const fresh = await fetch(request);
    if (fresh.ok) {
      await put(cache, INDEX_URL, fresh.clone(), true);
      return fresh;
    }
    // 服务器没配 SPA 回退时子路由会 404，此时用缓存的外壳顶上（前端路由照常工作）
    return (await matchShell()) || fresh;
  } catch {
    // 离线：用缓存的外壳顶上去，react-router 会接管剩余路由
    return (await matchShell()) || offlinePage();
  }
}

async function matchShell() {
  return (
    (await caches.open(PAGE_CACHE).then((c) => c.match(INDEX_URL))) ||
    (await caches.match(INDEX_URL)) ||
    (await caches.match('/'))
  );
}

function offlinePage() {
  return new Response('<h1>离线</h1><p>请先联网打开一次本站，之后即可离线使用。</p>', {
    status: 503,
    headers: { 'Content-Type': 'text/html; charset=utf-8' },
  });
}

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;

  const fresh = await fetch(request);
  if (fresh.ok && fresh.type === 'basic') {
    await put(cache, request, fresh.clone());
    await trim(cacheName);
  }
  return fresh;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), NETWORK_TIMEOUT);

  try {
    const fresh = await fetch(request, { signal: controller.signal });
    if (fresh.ok && fresh.type === 'basic') {
      await put(cache, request, fresh.clone());
      await trim(cacheName);
    }
    return fresh;
  } catch {
    const cached = await cache.match(request);
    if (cached) return cached;
    return new Response(JSON.stringify({ error: 'offline' }), {
      status: 503,
      headers: { 'Content-Type': 'application/json' },
    });
  } finally {
    clearTimeout(timer);
  }
}

/**
 * 写缓存失败（配额满等）不影响本次请求返回；
 * 默认不缓存 HTML —— 服务器的 SPA 回退会把「不存在的文件」也回成 200 index.html，
 * 那类响应存进缓存后，真实资源上线时反而会一直被旧 HTML 顶着。
 */
async function put(cache, request, response, allowHtml = false) {
  try {
    const contentType = response.headers.get('content-type') || '';
    if (!allowHtml && contentType.includes('text/html')) return;
    await cache.put(request, response);
  } catch {
    /* 忽略 */
  }
}

/** Cache.keys() 按写入顺序返回，从头淘汰最旧的 */
async function trim(cacheName) {
  const max = MAX_ENTRIES[cacheName];
  if (!max) return;
  const cache = await caches.open(cacheName);
  const keys = await cache.keys();
  if (keys.length <= max) return;
  await Promise.all(keys.slice(0, keys.length - max).map((key) => cache.delete(key)));
}

// ---------------------------------------------------------------- message

self.addEventListener('message', (event) => {
  const type = event.data && event.data.type;

  if (type === 'SKIP_WAITING') {
    self.skipWaiting();
    return;
  }

  if (type === 'CLEAR_CACHE') {
    event.waitUntil(
      (async () => {
        const names = await caches.keys();
        await Promise.all(names.map((name) => caches.delete(name)));
      })(),
    );
  }
});