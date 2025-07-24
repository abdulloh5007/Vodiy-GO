// This file needs to be in the public directory.
// It handles background push notifications.

// Import and initialize the Firebase SDK
import { initializeApp } from 'firebase/app';
import { getMessaging } from 'firebase/messaging/sw';

// TODO: Replace with your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBdz-2bJjg8zyUY30MRvQI-ZQ9UwKvizPM",
  authDomain: "gameroom-booking.firebaseapp.com",
  projectId: "gameroom-booking",
  storageBucket: "gameroom-booking.appspot.com",
  messagingSenderId: "505009384076",
  appId: "1:505009384076:web:f285d98d0f6dbd6a23a9a9"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// The rest of your service worker logic for handling pushes
self.addEventListener('push', (event) => {
  try {
    const data = event.data?.json() ?? {};

    const title = data.notification?.title || 'Новая заявка!';
    const options = {
      body: data.notification?.body || 'Пришла новая заявка, проверьте панель администратора.',
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      data: {
        url: data.fcmOptions?.link || data.data?.url || '/'
      }
    };

    event.waitUntil(
      self.registration.showNotification(title, options)
    );
  } catch (e) {
    console.error('Error handling push event:', e);
    // Fallback notification
    event.waitUntil(
      self.registration.showNotification('Новое уведомление', {
        body: 'Проверьте панель администратора',
        icon: '/icon-192.png'
      })
    );
  }
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // If a window is already open, focus it
      for (const client of clientList) {
        if (client.url === urlToOpen && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
