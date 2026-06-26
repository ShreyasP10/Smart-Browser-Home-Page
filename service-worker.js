/*
 * Service Worker for Smart Browser Home
 * - Precaches the app shell (HTML/CSS/JS/icons) for instant offline loads.
 * - Uses stale-while-revalidate for CDN assets (FontAwesome, Google Fonts, local images).
 * - Provides a cache-first fallback so the start page works fully offline.
 * - Handles updates gracefully: new versions activate and clean up old caches.
 */

const CACHE_VERSION = 'sbh-v1';
const APP_SHELL = [
    './',
    './index.html',
    './style.css',
    './script.js',
    './manifest.json',
    './icon-192.png',
    './icon-512.png',
    './icon-maskable-192.png',
    './icon-maskable-512.png'
];

// Origins served over the network at runtime that we mirror into the cache.
const RUNTIME_CACHE_HOSTS = [
    'cdnjs.cloudflare.com',        // FontAwesome
    'fonts.googleapis.com',        // Inter font CSS
    'fonts.gstatic.com'            // Inter font files
];

const isCacheableRuntime = (url) =>
    RUNTIME_CACHE_HOSTS.includes(url.hostname) ||
    (url.origin === self.location.origin &&
        /\.(png|jpe?g|gif|webp|svg|ico|woff2?)$/i.test(url.pathname));

// --- Install: precache the app shell. ---------------------------------------
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then((cache) => cache.addAll(APP_SHELL))
            .then(() => self.skipWaiting())
            .catch((err) => console.warn('[SW] precache failed:', err))
    );
});

// --- Activate: evict stale caches and take control immediately. -------------
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys()
            .then((keys) => Promise.all(
                keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))
            ))
            .then(() => self.clients.claim())
    );
});

// --- Fetch: route requests to the right caching strategy. -------------------
self.addEventListener('fetch', (event) => {
    const req = event.request;

    // Only handle GET; ignore non-http(s) (e.g. chrome-extension://, data:).
    if (req.method !== 'GET') return;
    let url;
    try { url = new URL(req.url); } catch { return; }
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return;

    // Navigations (page loads) -> network-first, fall back to cached shell offline.
    if (req.mode === 'navigate') {
        event.respondWith(networkFirstNavigation(req));
        return;
    }

    // App-shell assets (same origin, non-image) -> cache-first.
    if (url.origin === self.location.origin && !isCacheableRuntime(url)) {
        event.respondWith(cacheFirst(req));
        return;
    }

    // CDN assets & images -> stale-while-revalidate.
    if (isCacheableRuntime(url)) {
        event.respondWith(staleWhileRevalidate(req));
        return;
    }
});

async function networkFirstNavigation(req) {
    try {
        const fresh = await fetch(req);
        const cache = await caches.open(CACHE_VERSION);
        cache.put('./index.html', fresh.clone()).catch(() => {});
        return fresh;
    } catch (err) {
        const cache = await caches.open(CACHE_VERSION);
        return (await cache.match(req)) || (await cache.match('./index.html')) || Response.error();
    }
}

async function cacheFirst(req) {
    const cached = await caches.match(req);
    if (cached) return cached;
    try {
        const fresh = await fetch(req);
        if (fresh && fresh.ok && fresh.type === 'basic') {
            const cache = await caches.open(CACHE_VERSION);
            cache.put(req, fresh.clone());
        }
        return fresh;
    } catch (err) {
        // Offline with nothing cached: a transparent 1x1 PNG so <img> doesn't break.
        if (req.destination === 'image') return BROKEN_IMAGE;
        return Response.error();
    }
}

async function staleWhileRevalidate(req) {
    const cache = await caches.open(CACHE_VERSION);
    const cached = await cache.match(req);
    const network = fetch(req)
        .then((fresh) => {
            if (fresh && (fresh.ok || fresh.type === 'opaque')) {
                cache.put(req, fresh.clone()).catch(() => {});
            }
            return fresh;
        })
        .catch(() => null);
    return cached || (await network) || Response.error();
}

// Tiny transparent PNG for missing images when offline.
const BROKEN_IMAGE = new Response(
    Uint8Array.from(atob(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+M8AAAMBAQDJ/pLvAAAAAElFTkSuQmCC'
    ), (c) => c.charCodeAt(0)),
    { headers: { 'Content-Type': 'image/png' }, status: 200 }
);

// --- Messaging: allow the page to trigger an immediate update. --------------
self.addEventListener('message', (event) => {
    if (event.data === 'SKIP_WAITING') self.skipWaiting();
});
