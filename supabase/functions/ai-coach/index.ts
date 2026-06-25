// AI coach: workout suggestions, adaptive targets, personalized verse, weekly recap,
// and assessment-based starting goals. All routed through Lovable AI Gateway.
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY")!;
const MODEL = "google/gemini-3-flash-preview";

type Action =
  | "suggest_workout"
  | "weekly_recap"
  | "verse_for_struggle"
  | "assessment_goals";

async function callAI(messages: { role: string; content: string }[], json = false) {
  const r = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${LOVABLE_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: MODEL,
      messages,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!r.ok) {
    const text = await r.text();
    throw new Error(`AI ${r.status}: ${text.slice(0, 300)}`);
  }
  const data = await r.json();
  return data.choices?.[0]?.message?.content ?? "";
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    if (!LOVABLE_API_KEY) throw new Error("Missing LOVABLE_API_KEY");
    const body = await req.json();
    const action = body.action as Action;

    if (action === "suggest_workout") {
      const logs = (body.logs ?? []).slice(-14);
      const summary = logs.map((l: any) =>
        `${l.workout_date}: P${l.pushups || 0} S${l.situps || 0} Sq${l.squat_count || 0} L${l.ladder_percent || 0}% Pl${l.plank_seconds || 0}s DH${l.deadhang_seconds || 0}s`
      ).join("\n") || "no recent logs";
      const out = await callAI([
        { role: "system", content: "You are an encouraging Christian strength coach. Reply in <=70 words. Give one specific workout plan for today based on recent history. Avoid emojis. End with a 1-line motivating note rooted in perseverance." },
        { role: "user", content: `Last 14 days:\n${summary}\n\nSuggest today's workout.` },
      ]);
      return Response.json({ suggestion: out }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "weekly_recap") {
      const logs = (body.logs ?? []).slice(-7);
      const totals = logs.reduce((a: any, l: any) => ({
        pushups: a.pushups + (l.pushups || 0),
        situps: a.situps + (l.situps || 0),
        squats: a.squats + (l.squat_count || 0),
        plank: a.plank + (l.plank_seconds || 0),
        deadhang: a.deadhang + (l.deadhang_seconds || 0),
        days: a.days + 1,
      }), { pushups: 0, situps: 0, squats: 0, plank: 0, deadhang: 0, days: 0 });
      const out = await callAI([
        { role: "system", content: "Christian strength coach. Reply with two short paragraphs separated by a blank line: (1) 'What you crushed' — celebrate top wins from the data. (2) 'Focus next week' — one concrete, actionable focus. Max 90 words total. No emojis." },
        { role: "user", content: `Week stats: ${totals.days} active days, ${totals.pushups} pushups, ${totals.situps} situps, ${totals.squats} squats, ${totals.plank}s plank, ${totals.deadhang}s dead hang.` },
      ]);
      return Response.json({ recap: out }, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "verse_for_struggle") {
      const struggle = String(body.struggle ?? "").slice(0, 200);
      const raw = await callAI([
        { role: "system", content: "You are a pastor recommending Scripture. Return ONLY JSON: {\"reference\":\"Book Ch:V\",\"verse\":\"NIV text\",\"why\":\"one sentence\"}. Use NIV translation." },
        { role: "user", content: `Recommend one Bible verse for someone facing: ${struggle}` },
      ], true);
      let parsed: any = {};
      try { parsed = JSON.parse(raw); } catch { parsed = { reference: "", verse: raw, why: "" }; }
      return Response.json(parsed, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "assessment_goals") {
      const a = body.answers ?? {};
      const raw = await callAI([
        { role: "system", content: "Return ONLY JSON with integer daily goals tailored to the user's level. Schema: {\"pushups\":int,\"situps\":int,\"squat_count\":int,\"plank_seconds\":int,\"deadhang_seconds\":int,\"ladder_percent\":int}. Beginners should see attainable numbers; advanced get a stretch." },
        { role: "user", content: `Level: ${a.level}. Max pushups in one set: ${a.maxPushups}. Workouts per week: ${a.frequency}. Primary goal: ${a.goal}. Generate starting daily goals.` },
      ], true);
      let parsed: any = {};
      try { parsed = JSON.parse(raw); } catch { parsed = {}; }
      return Response.json(parsed, { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "unknown action" }), {
      status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e instanceof Error ? e.message : e) }), {
      status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
