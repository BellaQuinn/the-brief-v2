import webpush from "web-push";

let configured = false;

function ensureConfigured() {
  if (configured) return;
  webpush.setVapidDetails(
    "mailto:ktalley132@gmail.com",
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    process.env.VAPID_PRIVATE_KEY!
  );
  configured = true;
}

export interface PushPayload {
  title: string;
  body: string;
  url: string;
}

export interface StoredPushSubscription {
  endpoint: string;
  p256dh: string;
  auth: string;
}

export type PushSendResult = { ok: true } | { ok: false; expired: boolean; error: string };

// Sends one push. Callers should delete the subscription when `expired`
// comes back true (410 Gone/404 -- the standard signal a browser has
// dropped a subscription, e.g. the user uninstalled or cleared data).
export async function sendPushNotification(
  subscription: StoredPushSubscription,
  payload: PushPayload
): Promise<PushSendResult> {
  ensureConfigured();

  try {
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: { p256dh: subscription.p256dh, auth: subscription.auth },
      },
      JSON.stringify(payload)
    );
    return { ok: true };
  } catch (error) {
    const statusCode = (error as { statusCode?: number }).statusCode;
    const expired = statusCode === 404 || statusCode === 410;
    return { ok: false, expired, error: error instanceof Error ? error.message : "Unknown push error" };
  }
}
