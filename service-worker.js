const CACHE_NAME = "salidas-cache-v4.3"; // Incrementar versión para forzar actualización
const urlsToCache = [
  "/",
  "/index.html",
  "/app.js",
  "/manifest.json",
  "/images/logo2.png",
  "/images/icon-192.png",
  "/images/icon-512.png",
  "/images/favicon.ico",
  "/listado_funcionarios.json",
  "/listado_vehiculos.json",
  "/listado_equipamiento.json"
];

// Instalación del service worker
self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log("Opened cache");
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Forzar la activación del nuevo service worker
        return self.skipWaiting();
      })
  );
});

// Activación del service worker y limpieza de cachés antiguas
self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log("Deleting old cache:", cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      // Tomar control de todas las páginas abiertas
      return self.clients.claim();
    })
  );
});

// Estrategia de red: Network First con fallback a cache
self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Si la respuesta es válida, la guardamos en caché
        if (response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        // Si la red falla, buscamos en caché
        return caches.match(event.request)
          .then(response => {
            if (response) {
              return response;
            }
            // Si no está en caché, devolvemos una página de error offline
            if (event.request.destination === "document") {
              return caches.match("/index.html");
            }
          });
      })
  );
});

// Escuchar mensajes desde la aplicación
self.addEventListener("message", event => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});