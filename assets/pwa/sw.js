const CACHE_NAME = 'doce-acerto-v29';
const ASSETS = [
  '../../index.html',
  './manifest.json',
  '../css/style.css',
  '../js/script.js',
  '../data/config.json',
  '../icon-512.png',
  '../imgs/menu-background.png',
  '../imgs/logo-doce-acerto.png',
  '../imgs/mascot-red-apple.png',
  '../imgs/mascot-blueberry.png',
  '../imgs/mascot-lemon.png',
  '../imgs/mascot-green-apple.png',
  '../imgs/mascot-orange.png',
  '../imgs/mascot-grape.png',
  '../img/backgrounds_fases_doce_acerto/01-colina-dos-pirulitos.png',
  '../img/backgrounds_fases_doce_acerto/02-planicie-do-bolo.png',
  '../img/backgrounds_fases_doce_acerto/03-montanha-de-chocolate.png',
  '../img/backgrounds_fases_doce_acerto/04-vale-do-sorvete.png',
  '../img/backgrounds_fases_doce_acerto/05-castelo-de-acucar.png',
  '../img/estrada-doce.png',
  '../img/maquina_chiclete.png',
  '../img/bolinhas_chiclete_frutinhas_v2/01-vermelho-maca.png',
  '../img/bolinhas_chiclete_frutinhas_v2/02-azul-blueberry.png',
  '../img/bolinhas_chiclete_frutinhas_v2/03-amarelo-limao.png',
  '../img/bolinhas_chiclete_frutinhas_v2/04-verde-maca-verde.png',
  '../img/bolinhas_chiclete_frutinhas_v2/05-laranja-laranja.png',
  '../img/bolinhas_chiclete_frutinhas_v2/06-roxo-uva.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key))))
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request)).catch(() => {
      if (event.request.mode === 'navigate') return caches.match('../../index.html');
    })
  );
});
