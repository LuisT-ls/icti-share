/**
 * Service Worker para cache offline e PWA
 * Versão: 1.0.0
 */

const CACHE_NAME = "icti-share-v1";
const STATIC_CACHE_NAME = "icti-share-static-v1";
const DYNAMIC_CACHE_NAME = "icti-share-dynamic-v1";

// Recursos estáticos para cache
const STATIC_ASSETS = [
  "/",
  "/materiais",
  "/og-image.jpg",
  "/pdf.worker.min.mjs",
];

// Estratégias de cache
const CACHE_STRATEGIES = {
  // Cache First: para recursos estáticos
  CACHE_FIRST: "cache-first",
  // Network First: para conteúdo dinâmico
  NETWORK_FIRST: "network-first",
  // Stale While Revalidate: para recursos que podem ser atualizados em background
  STALE_WHILE_REVALIDATE: "stale-while-revalidate",
};

// Instalar Service Worker
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME).then((cache) => {
      console.log("[SW] Caching static assets");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Ativar Service Worker
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => {
            return (
              name !== STATIC_CACHE_NAME &&
              name !== DYNAMIC_CACHE_NAME &&
              name.startsWith("icti-share-")
            );
          })
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      );
    })
  );
  return self.clients.claim();
});

// Interceptar requisições
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar requisições não GET
  if (request.method !== "GET") {
    return;
  }

  // Ignorar requisições de API e autenticação
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/_next/") ||
    url.pathname.startsWith("/auth/")
  ) {
    return;
  }

  // Estratégia: Network First para páginas dinâmicas
  if (request.destination === "document") {
    event.respondWith(networkFirstStrategy(request));
  }
  // Estratégia: Cache First para assets estáticos
  else if (
    request.destination === "image" ||
    request.destination === "script" ||
    request.destination === "style" ||
    request.destination === "font"
  ) {
    event.respondWith(cacheFirstStrategy(request));
  }
  // Estratégia: Stale While Revalidate para outros recursos
  else {
    event.respondWith(staleWhileRevalidateStrategy(request));
  }
});

// Network First: tenta rede primeiro, fallback para cache
async function networkFirstStrategy(request) {
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(DYNAMIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log("[SW] Network failed, trying cache:", request.url);
    const cachedResponse = await caches.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    // Fallback para página offline
    if (request.destination === "document") {
      return caches.match("/");
    }
    throw error;
  }
}

// Cache First: verifica cache primeiro, fallback para rede
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      const cache = await caches.open(STATIC_CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    console.log("[SW] Failed to fetch:", request.url);
    throw error;
  }
}

// Stale While Revalidate: retorna cache imediatamente e atualiza em background
async function staleWhileRevalidateStrategy(request) {
  const cache = await caches.open(DYNAMIC_CACHE_NAME);
  const cachedResponse = await cache.match(request);

  const fetchPromise = fetch(request)
    .then((networkResponse) => {
      if (networkResponse.ok) {
        cache.put(request, networkResponse.clone());
      }
      return networkResponse;
    })
    .catch(() => {
      // Ignorar erros de rede
    });

  // Retornar cache imediatamente se disponível
  return cachedResponse || fetchPromise;
}
