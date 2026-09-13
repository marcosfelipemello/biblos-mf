/* global importScripts, firebase, clients */

// Service Worker do Firebase Cloud Messaging para Biblos MF
// Convive com o service worker do vite-plugin-pwa (arquivos e escopos separados)

importScripts("https://www.gstatic.com/firebasejs/12.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/12.7.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyCG8j-KgPOLIVdTTCmiGtQA7VVT_5ysFM8",
  authDomain: "banco-de-dados---dho.firebaseapp.com",
  projectId: "banco-de-dados---dho",
  storageBucket: "banco-de-dados---dho.firebasestorage.app",
  messagingSenderId: "688145715081",
  appId: "1:688145715081:web:e17c953b50424da5a41b58",
  measurementId: "G-N3SWSYDHM3",
});

const messaging = firebase.messaging();

// O servidor manda SÓ dados (sem o bloco `notification`), de propósito: assim
// quem desenha o aviso é só este arquivo, uma vez. Ver netlify/lib/push.js.
messaging.onBackgroundMessage((payload) => {
  const dados = payload.data || {};
  const title = dados.title || "Biblos";
  const options = {
    body: dados.body || "",
    icon: "/pwa-192x192.png",
    badge: "/pwa-192x192.png",
    // Aviso do mesmo tipo substitui o anterior em vez de empilhar.
    tag: dados.tipo || "biblos",
    data: dados,
  };

  self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((clientList) => {
        for (const client of clientList) {
          if (client.url && "focus" in client) {
            return client.focus();
          }
        }
        if (clients.openWindow) {
          return clients.openWindow("/");
        }
      })
  );
});
