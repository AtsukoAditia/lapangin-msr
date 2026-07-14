// Firebase Messaging Service Worker
// Place at /firebase-messaging-sw.js (public directory root)
// Handles background push notifications from Firebase Cloud Messaging
//
// To configure: replace the placeholder values in firebaseConfig below
// with your actual Firebase project config.

importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js");

// ── Firebase config — replace with your project values ──
const firebaseConfig = {
  apiKey: "YOUR_FIREBASE_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
};

// Skip init if placeholder values remain (not configured)
const isConfigured = firebaseConfig.apiKey !== "YOUR_FIREBASE_API_KEY";

if (isConfigured) {
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();

  // Handle background messages
  messaging.onBackgroundMessage((payload) => {
    console.log("[FCM SW] Background message:", payload);

    const title = payload.notification?.title || "Lapangin";
    const options = {
      body: payload.notification?.body || "Anda punya notifikasi baru.",
      icon: payload.notification?.icon || "/icons/icon-192.png",
      badge: "/icons/icon-192.png",
      data: payload.data,
      tag: payload.data?.tag || "lapangin-notification",
    };

    return self.registration.showNotification(title, options);
  });
}

// Handle notification click (works regardless of config)
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  const url = event.notification.data?.url || "/";
  event.waitUntil(
    clients
      .matchAll({ type: "window", includeUncontrolled: true })
      .then((wins) => {
        for (const w of wins) {
          if (w.url.includes(url) && "focus" in w) return w.focus();
        }
        return clients.openWindow(url);
      })
  );
});
