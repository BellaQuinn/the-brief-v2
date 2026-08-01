import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { sendPushNotification } from "@/lib/webpush";
import type { PushSubscriptionRecord } from "@/types/database.types";

export async function POST() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not signed in." }, { status: 401 });

  const { data: subscriptions } = await supabase.from("push_subscriptions").select("*").eq("user_id", user.id);
  const typed = (subscriptions as PushSubscriptionRecord[]) ?? [];

  if (typed.length === 0) {
    return NextResponse.json({ error: "No device is enrolled yet — enable notifications first." }, { status: 400 });
  }

  const results = await Promise.all(
    typed.map((sub) =>
      sendPushNotification(sub, {
        title: "The Brief",
        body: "Ready when you are, Operator. Notifications are working.",
        url: "/brief",
      })
    )
  );

  const expiredIds = typed.filter((_, i) => !results[i]!.ok && (results[i] as { expired: boolean }).expired).map((s) => s.id);
  if (expiredIds.length > 0) {
    await supabase.from("push_subscriptions").delete().in("id", expiredIds);
  }

  const sentCount = results.filter((r) => r.ok).length;
  if (sentCount === 0) {
    return NextResponse.json({ error: "Delivery failed on every enrolled device." }, { status: 502 });
  }

  return NextResponse.json({ ok: true, sentCount, expiredRemoved: expiredIds.length });
}
