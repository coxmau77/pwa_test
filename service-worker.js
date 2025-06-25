// service-worker.js

// Nombre de la caché
const CACHE_NAME = 'pwa-basic-cache-v1';
// Archivos a cachear
const urlsToCache = [
    '/',
    '/index.html',
    '/manifest.json',
    // Puedes añadir otros archivos si tu app los necesita para funcionar offline,
    // como archivos CSS, JS o imágenes, pero para esta app básica no es estrictamente necesario.
    // 'https://cdn.tailwindcss.com' // Si quisieras cachear el CDN de Tailwind, aunque no recomendado para versiones de desarrollo
];

// Evento de instalación del Service Worker
self.addEventListener('install', (event) => {
    console.log('Service Worker: Evento de instalación.');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                console.log('Service Worker: Almacenando archivos en caché.');
                return cache.addAll(urlsToCache);
            })
            .then(() => self.skipWaiting()) // Forzar la activación del Service Worker inmediatamente
    );
});

// Evento de activación del Service Worker
self.addEventListener('activate', (event) => {
    console.log('Service Worker: Evento de activación.');
    event.waitUntil(
        // Eliminar cachés antiguas
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Service Worker: Eliminando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Tomar el control de las páginas abiertas
    );
});

// Evento de 'fetch' para interceptar solicitudes de red
self.addEventListener('fetch', (event) => {
    // Intentar servir los archivos desde la caché primero
    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Si el archivo está en caché, devolverlo
                if (response) {
                    return response;
                }
                // Si no está en caché, buscarlo en la red
                return fetch(event.request)
                    .catch(() => {
                        // Si la red falla y no hay caché, puedes devolver una página offline, si tuvieras una.
                        // Para esta app básica, simplemente se mostrará un error del navegador.
                        console.error('Service Worker: Error de red o archivo no cacheado para:', event.request.url);
                    });
            })
    );
});
