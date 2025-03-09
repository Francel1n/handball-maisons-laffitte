// Service Worker pour la PWA
const CACHE_NAME = 'handball-ml-v1';
const STATIC_CACHE_NAME = 'handball-ml-static-v1';
const DYNAMIC_CACHE_NAME = 'handball-ml-dynamic-v1';

// Ressources à mettre en cache lors de l'installation
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/offline.html',
  '/manifest.json',
  '/icons/site.webmanifest',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  '/icons/android-chrome-192x192.png',
  '/icons/android-chrome-512x512.png',
  '/icons/apple-touch-icon.png',
  '/icons/favicon-16x16.png',
  '/icons/favicon-32x32.png'
];

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Mise en cache des ressources statiques');
        return cache.addAll(STATIC_ASSETS);
      })
  );
});

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (
            cacheName !== STATIC_CACHE_NAME && 
            cacheName !== DYNAMIC_CACHE_NAME
          ) {
            console.log('[Service Worker] Suppression de l\'ancien cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  return self.clients.claim();
});

// Stratégie de cache pour les différentes requêtes
self.addEventListener('fetch', (event) => {
  const request = event.request;
  const url = new URL(request.url);

  // Ne pas intercepter les requêtes vers l'API Supabase
  if (url.href.includes('supabase.co')) {
    return;
  }

  // Stratégie pour les requêtes de navigation (HTML)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .catch(() => {
          return caches.match('/offline.html');
        })
    );
    return;
  }

  // Stratégie Cache First pour les ressources statiques (images, CSS, JS)
  if (
    request.destination === 'style' || 
    request.destination === 'script' || 
    request.destination === 'font' ||
    request.destination === 'image'
  ) {
    event.respondWith(
      caches.match(request)
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(request)
            .then((fetchResponse) => {
              return caches.open(STATIC_CACHE_NAME)
                .then((cache) => {
                  cache.put(request, fetchResponse.clone());
                  return fetchResponse;
                });
            })
            .catch((error) => {
              console.error('[Service Worker] Erreur lors de la récupération:', error);
            });
        })
    );
    return;
  }

  // Stratégie Network First pour les autres requêtes
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Mise en cache de la nouvelle réponse
        let responseClone = response.clone();
        caches.open(DYNAMIC_CACHE_NAME)
          .then((cache) => {
            cache.put(request, responseClone);
          });
        return response;
      })
      .catch(() => {
        // Utilisation du cache en cas d'échec du réseau
        return caches.match(request);
      })
  );
});

// Gestion des notifications push (si nécessaire)
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json();
    
    const options = {
      body: data.body || 'Nouvelle notification',
      icon: '/icons/android-chrome-192x192.png',
      badge: '/icons/favicon-32x32.png',
      data: {
        url: data.url || '/'
      }
    };
    
    event.waitUntil(
      self.registration.showNotification(
        data.title || 'Handball Maisons-Laffitte', 
        options
      )
    );
  }
});

// Gestion des clics sur les notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});