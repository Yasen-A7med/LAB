/* Main Ultraviolet Service Worker */
importScripts('/baremux/index.js');
importScripts('/uv/uv.bundle.js');
importScripts('/uv/uv.config.js');
importScripts('/uv/uv.sw.js');

if (self.bareMux && self.bareMux.BareClient) {
    self.Ultraviolet.BareClient = self.bareMux.BareClient;
}

const sw = new UVServiceWorker();

self.addEventListener('install', event => {
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

self.addEventListener('fetch', (event) => {
    event.respondWith(sw.fetch(event));
});
