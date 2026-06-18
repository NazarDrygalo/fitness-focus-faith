// Returns public runtime config. DSN and VAPID public key are publishable; safe to expose.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve((req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  return new Response(
    JSON.stringify({
      sentryDsn: Deno.env.get("SENTRY_DSN") ?? "",
      vapidPublicKey: Deno.env.get("VAPID_PUBLIC_KEY") ?? "",
    }),
    {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
        "Cache-Control": "public, max-age=300",
      },
    },
  );
});
