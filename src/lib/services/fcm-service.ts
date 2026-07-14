import { FCM_CONFIG } from "@/config/fcm";

export interface NotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
}

export async function sendPushNotification(
  token: string,
  payload: NotificationPayload,
): Promise<boolean> {
  if (!FCM_CONFIG.enabled) return false;

  try {
    const response = await fetch(
      `https://fcm.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/messages:send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${await getAccessToken()}`,
        },
        body: JSON.stringify({
          message: {
            token,
            notification: {
              title: payload.title,
              body: payload.body,
              image: payload.icon,
            },
            webpush: payload.url
              ? { fcm_options: { link: payload.url } }
              : undefined,
          },
        }),
      },
    );
    return response.ok;
  } catch (err) {
    console.error("[FCM] Send failed:", err);
    return false;
  }
}

async function getAccessToken(): Promise<string> {
  // Uses Google Application Default Credentials or service account
  const { GoogleAuth } = await import("google-auth-library");
  const auth = new GoogleAuth({
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });
  const client = await auth.getClient();
  const token = await client.getAccessToken();
  return token.token || "";
}
