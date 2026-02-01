import { useState, useEffect } from 'react';

const publicVapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export default function usePushNotifications() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [permission, setPermission] = useState<NotificationPermission>('default');

  useEffect(() => {
    if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
      setPermission(Notification.permission);
      navigator.serviceWorker.ready.then(registration => {
        registration.pushManager.getSubscription().then(sub => {
          setIsSubscribed(!!sub);
        });
      });
    }
  }, []);

  const subscribe = async () => {
    console.log("Using VAPID Key:", publicVapidKey); // DEBUG LOG
    if (!publicVapidKey) {
      console.error("VAPID Public Key not found!");
      alert("Eroare internă: Cheia VAPID lipsește din configurare.");
      return;
    }

    if (Notification.permission === 'denied') {
      alert("Notificările sunt blocate din browser. Te rugăm să le deblochezi din setările de lângă bara de adresă (iconița lacăt/setări) și să încerci din nou.");
      return;
    }

    try {
      if (!('serviceWorker' in navigator)) {
        throw new Error("Service Worker nu este suportat. Verifică dacă ești pe HTTPS sau ai setat 'Insecure origins' corect.");
      }
      const registration = await navigator.serviceWorker.ready;

      const convertedVapidKey = urlBase64ToUint8Array(publicVapidKey);
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: convertedVapidKey
      });

      // Send to backend
      const response = await fetch('/api/notifications/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ subscription }),
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${await response.text()}`);
      }

      setIsSubscribed(true);
      setPermission(Notification.permission);
      alert("Te-ai abonat cu succes la notificări! 🎉");
    } catch (error: any) {
      console.error("Failed to subscribe:", error);
      if (error.name === 'NotAllowedError' || error.message.includes('Permission denied')) {
        alert("Accesul la notificări a fost respins. Trebuie să dai 'Permite' (Allow) când ești întrebat.");
      } else {
        alert(`Eroare tehnică la abonare: ${error.message}\n\nTe rugăm să reîncarci pagina sau să încerci alt browser.`);
      }
    }
  };

  return { isSubscribed, subscribe, permission };
}
