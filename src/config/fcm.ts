export const FCM_CONFIG = {
  vapidKey: process.env.NEXT_PUBLIC_FCM_VAPID_KEY || "",
  enabled: !!process.env.NEXT_PUBLIC_FCM_VAPID_KEY,
};
