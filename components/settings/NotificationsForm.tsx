"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  getPushSubscriptionStatus,
  subscribeToPush,
  unsubscribeFromPush,
  type PushSubscriptionStatus,
} from "@/lib/pushClient";

export function NotificationsForm() {
  const [status, setStatus] = useState<PushSubscriptionStatus | "loading">("loading");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  useEffect(() => {
    getPushSubscriptionStatus().then(setStatus);
  }, []);

  async function handleEnable() {
    setBusy(true);
    setError(null);
    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!vapidKey) {
      setError("Push isn't configured on this deployment yet.");
      setBusy(false);
      return;
    }
    const result = await subscribeToPush(vapidKey);
    setBusy(false);
    if (!result.ok) {
      setError(result.error);
      setStatus(await getPushSubscriptionStatus());
      return;
    }
    setStatus("subscribed");
  }

  async function handleDisable() {
    setBusy(true);
    await unsubscribeFromPush();
    setStatus("not-subscribed");
    setTestMessage(null);
    setBusy(false);
  }

  async function handleTest() {
    setBusy(true);
    setTestMessage(null);
    setError(null);
    const res = await fetch("/api/push/test", { method: "POST" });
    const body = await res.json();
    setBusy(false);
    if (!res.ok) {
      setError(body.error ?? "The test notification couldn't be sent.");
      return;
    }
    setTestMessage("Sent — it should arrive on this device in a moment.");
  }

  if (status === "loading") {
    return <p className="text-sm text-ink-tertiary">Checking this device…</p>;
  }

  if (status === "unsupported") {
    return (
      <p className="text-sm text-ink-secondary">
        This browser doesn&apos;t support push notifications. On iPhone, Safari only supports them once The Brief
        is added to your Home Screen.
      </p>
    );
  }

  if (status === "denied") {
    return (
      <p className="text-sm text-ink-secondary">
        Notifications are blocked for this site. Re-enable them in your browser&apos;s site settings, then reload
        this page.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-ink-secondary">
        {status === "subscribed"
          ? "Enabled on this device — you'll get a reminder 3 days out, 1 day out, and the day something is due (assignments, career deadlines, certification exams, and Graduate & Law School dates)."
          : "Not enabled on this device yet. Reminders fire 3 days out, 1 day out, and the day something is due."}
      </p>

      {error && (
        <p className="rounded-lg border border-status-atRisk/30 bg-status-atRisk/10 px-3 py-2 text-sm text-status-atRisk">
          {error}
        </p>
      )}
      {testMessage && <p className="text-sm text-signal-bright">{testMessage}</p>}

      <div className="flex flex-wrap gap-2">
        {status === "subscribed" ? (
          <>
            <Button type="button" variant="ghost" onClick={handleDisable} disabled={busy}>
              Disable on this device
            </Button>
            <Button type="button" onClick={handleTest} disabled={busy}>
              {busy ? "Sending…" : "Send a test notification"}
            </Button>
          </>
        ) : (
          <Button type="button" onClick={handleEnable} disabled={busy}>
            {busy ? "Enabling…" : "Enable notifications"}
          </Button>
        )}
      </div>
    </div>
  );
}
