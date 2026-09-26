// supabase/functions/ai-proxy/index.ts
// Deploy with: supabase functions deploy ai-proxy

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GEMINI_MODEL = Deno.env.get("GEMINI_MODEL") || "gemini-3.5-flash-lite";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;
const ALLOWED_ORIGINS = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "https://habitquest-tau.vercel.app",
]);
const requestBuckets = new Map<string, { startedAt: number; count: number }>();
const RATE_WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 20;
const MAX_BODY_BYTES = 32_000;

function headersFor(origin: string | null) {
  const headers: Record<string, string> = {
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Content-Type": "application/json",
  };
  if (origin && ALLOWED_ORIGINS.has(origin)) headers["Access-Control-Allow-Origin"] = origin;
  return headers;
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), { status, headers: headersFor(origin) });
}

serve(async (req) => {
  const origin = req.headers.get("origin");
  if (req.method === "OPTIONS") return new Response("ok", { status: 204, headers: headersFor(origin) });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405, origin);

  try {
    const authHeader = req.headers.get("authorization") || "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Authentication required" }, 401, origin);

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
    if (!supabaseUrl || !supabaseKey) return json({ error: "Auth service is not configured" }, 500, origin);

    const userClient = createClient(supabaseUrl, supabaseKey, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) return json({ error: "Authentication required" }, 401, origin);

    const existing = requestBuckets.get(user.id);
    const now = Date.now();
    if (!existing || now - existing.startedAt >= RATE_WINDOW_MS) {
      requestBuckets.set(user.id, { startedAt: now, count: 1 });
    } else if (existing.count >= MAX_REQUESTS_PER_WINDOW) {
      return json({ error: "AI request limit reached. Please try again shortly." }, 429, origin);
    } else {
      existing.count += 1;
    }

    const contentLength = Number(req.headers.get("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) return json({ error: "Request is too large" }, 413, origin);
    const rawBody = await req.text();
    if (new TextEncoder().encode(rawBody).length > MAX_BODY_BYTES) return json({ error: "Request is too large" }, 413, origin);

    const { systemPrompt = "", userMessage = "", history = [] } = JSON.parse(rawBody);
    if (typeof userMessage !== "string" || !userMessage.trim()) return json({ error: "userMessage is required" }, 400, origin);
    if (userMessage.length > 4000 || typeof systemPrompt !== "string" || systemPrompt.length > 12000 || !Array.isArray(history) || history.length > 8) {
      return json({ error: "AI request exceeds the allowed limits" }, 400, origin);
    }

    const geminiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiKey) return json({ error: "AI service is not configured" }, 500, origin);

    const contents = history.map((item: { role?: string; text?: string }) => ({
      role: item.role === "model" ? "model" : "user",
      parts: [{ text: typeof item.text === "string" ? item.text.slice(0, 4000) : "" }],
    }));
    contents.push({ role: "user", parts: [{ text: userMessage }] });

    const geminiRes = await fetch(`${GEMINI_ENDPOINT}?key=${geminiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemPrompt }] },
        contents,
        generationConfig: { maxOutputTokens: 600, temperature: 0.85 },
      }),
    });

    if (!geminiRes.ok) {
      const errBody = await geminiRes.json().catch(() => ({}));
      console.error("Gemini error:", errBody?.error?.message || `Gemini HTTP ${geminiRes.status}`);
      return json({ error: "AI service request failed" }, 502, origin);
    }

    const data = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";
    return json({ text }, 200, origin);
  } catch (error) {
    console.error("AI proxy error:", error);
    return json({ error: "AI service request failed" }, 500, origin);
  }
});
