import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase     = createClient(SUPABASE_URL, SUPABASE_ANON);
export const ANON_KEY     = SUPABASE_ANON;
export const AI_PROXY_URL = `${SUPABASE_URL}/functions/v1/ai-proxy`;
