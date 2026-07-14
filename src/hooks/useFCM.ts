import { useState, useEffect } from "react";

export function useFCM() {
  const [token, setToken] = useState<string | null>(null);
  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [supported, setSupported] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator) {
      setSupported(true);
      setPermission(Notification.permission);
    }
  }, []);

  const requestPermission = async (): Promise<string | null> => {
    if (!supported) return null;
    try {
      const result = await Notification.requestPermission();
      setPermission(result);
      if (result === "granted") {
        await navigator.serviceWorker.register("/firebase-messaging-sw.js");
        setToken("permission_granted");
        return "permission_granted";
      }
      return null;
    } catch (err) {
      console.error("[FCM] Permission request failed:", err);
      return null;
    }
  };

  const subscribe = async (userId: string) => {
    if (!token) return;
    await fetch("/api/notifications/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, token, type: "fcm" }),
    });
  };

  return { token, permission, supported, requestPermission, subscribe };
}
