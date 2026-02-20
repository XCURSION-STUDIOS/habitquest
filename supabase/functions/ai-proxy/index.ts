// supabase/functions/ai-proxy/index.ts
// @ts-nocheck
// Deploy with: supabase functions deploy ai-proxy

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_MODEL    = "gemini-2.5-flash-lite";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const corsHeaders = {
  "Access-Control-Allow-Origin":  "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { systemPrompt, userMessage, history = [] } = await req.json();

    if (!userMessage) {
      return new Response(JSON.stringify({ error: "userMessage is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Gemini API key stored securely as env variable — never exposed to frontend
    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) {
      return new Response(JSON.stringify({ error: "AI service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Build conversation history for multi-turn terminal chat
    const contents = [];
    for (const h of history) {
      contents.push({ role: h.role, parts: [{ text: h.text }] });
    }
    contents.push({ role: "user", parts: [{ text: userMessage }] });

    const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: {
          maxOutputTokens: 600,
          temperature: 0.85,
        },
      }),
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.json().catch(() => ({}));
      const errMsg  = errBody?.error?.message || `Gemini HTTP ${geminiRes.status}`;
      console.error("Gemini error:", errMsg);
      return new Response(JSON.stringify({ error: errMsg }), {
        status: 502,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    return new Response(JSON.stringify({ text }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
