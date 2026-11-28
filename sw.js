// Guarda la aplicación en el teléfono para volver a abrirla sin internet.
const CACHE = 'himnario-verde-v19';

const PRECACHE = [
  './',
  './index.html',
  './main.dart.js',
  './flutter.js',
  './flutter_bootstrap.js',
  './manifest.json',
  './favicon.png',
  './version.json',
  './icons/Icon-192.png',
  './icons/Icon-512.png',
  './icons/Icon-maskable-192.png',
  './icons/Icon-maskable-512.png',
  './icons/apple-touch-icon.png',
  './canvaskit/canvaskit.js',
  './canvaskit/canvaskit.wasm',
  './assets/AssetManifest.bin',
  './assets/AssetManifest.bin.json',
  './assets/FontManifest.json',
  './assets/fonts/MaterialIcons-Regular.otf',
  './assets/assets/content/hymns.json',
  './assets/assets/content/tonos_himnario_verde.csv',
  './assets/assets/config/himnos_ocultos.txt',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(PRECACHE))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') {
    return;
  }
  // Solo guarda los archivos de la app. Firebase (cuentas y datos) y el
  // panel de administración (admin/) van siempre por internet.
  const url = new URL(request.url);
  const base = new URL('./', self.location.href);
  if (url.origin !== base.origin || !url.pathname.startsWith(base.pathname)) {
    return;
  }
  if (url.pathname.startsWith(base.pathname + 'admin/')) {
    return;
  }
  event.respondWith(
    caches.open(CACHE).then(async (cache) => {
      const cached = await cache.match(request);
      if (cached) {
        return cached;
      }
      const response = await fetch(request);
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    }),
  );
});
