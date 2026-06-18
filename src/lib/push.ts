import { supabase } from "@/integrations/supabase/client";

const FALLBACK_VAPID_PUBLIC_KEY =
  "BAAPEjVP2UqZtdbeJuOf-ZQwMaCLadFVsztJHN8VRtR3Xqs6rWX5O8gavY-M2ZkxoRAdsyUc_ypvc09pwH9Bii0";

let vapidPublicKeyPromise: Promise<string> | null = null;

async function getVapidPublicKey() {
  vapidPublicKeyPromise ??= supabase.functions
    .invoke("public-config")
    .then(({ data }) => (data as { vapidPublicKey?: string } | null)?.vapidPublicKey || FALLBACK_VAPID_PUBLIC_KEY)
    .catch(() => FALLBACK_VAPID_PUBLIC_KEY);
  return vapidPublicKeyPromise;
}

export async function clearPushRegistration(userId: string) {
  await supabase.from("push_subscriptions").delete().eq("user_id", userId);
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    try { await sub.unsubscribe(); } catch { /* ignore */ }
  }
}

function urlBase64ToUint8Array(base64: string) {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  const out = new Uint8Array(raw.length);
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i);
  return out;
}

function bufToB64Url(buf: ArrayBuffer | null) {
  if (!buf) return "";
  const bytes = new Uint8Array(buf);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function pushSupported() {
  return (
    typeof window !== "undefined" &&
    "serviceWorker" in navigator &&
    "PushManager" in window &&
    "Notification" in window
  );
}

function keysMatch(a: ArrayBuffer | null, b: Uint8Array) {
  if (!a) return false;
  const av = new Uint8Array(a);
  if (av.length !== b.length) return false;
  for (let i = 0; i < av.length; i++) if (av[i] !== b[i]) return false;
  return true;
}

export async function enablePush(userId: string): Promise<PushSubscription> {
  if (!pushSupported()) throw new Error("Push not supported on this device.");
  const perm = await Notification.requestPermission();
  if (perm !== "granted") throw new Error("Notification permission denied.");

  const reg = await navigator.serviceWorker.ready;
  const vapidBytes = urlBase64ToUint8Array(await getVapidPublicKey());
  let sub = await reg.pushManager.getSubscription();
  // If an existing subscription was made with a different VAPID key, replace it.
  if (sub) {
    const existingKey = (sub.options as PushSubscriptionOptions)?.applicationServerKey ?? null;
    if (!keysMatch(existingKey as ArrayBuffer | null, vapidBytes)) {
      const staleEndpoint = sub.endpoint;
      try { await sub.unsubscribe(); } catch { /* ignore */ }
      try { await supabase.from("push_subscriptions").delete().eq("endpoint", staleEndpoint); } catch { /* ignore */ }
      sub = null;
    }
  }
  if (!sub) {
    sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidBytes,
    });
  }
  const json = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
  const endpoint = json.endpoint ?? sub.endpoint;
  const p256dh = json.keys?.p256dh ?? bufToB64Url(sub.getKey("p256dh"));
  const auth = json.keys?.auth ?? bufToB64Url(sub.getKey("auth"));

  const { error } = await supabase
    .from("push_subscriptions")
    .upsert(
      {
        user_id: userId,
        endpoint,
        p256dh,
        auth,
        user_agent: navigator.userAgent,
      },
      { onConflict: "endpoint" },
    );
  if (error) throw error;

  // Ensure a preferences row exists with the user's tz.
  const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  await supabase
    .from("notification_preferences")
    .upsert({ user_id: userId, timezone: tz }, { onConflict: "user_id" });

  return sub;
}

export async function disablePush(userId: string) {
  if (!pushSupported()) return;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (sub) {
    const endpoint = sub.endpoint;
    try { await sub.unsubscribe(); } catch { /* ignore */ }
    await supabase.from("push_subscriptions").delete().eq("user_id", userId).eq("endpoint", endpoint);
  }
}

export async function hasActiveSubscription() {
  if (!pushSupported()) return false;
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  return !!sub;
}
