import { AI_PROXY_URL, ANON_KEY } from "./supabase.js";
import { getLevel, getClass, TODAY } from "./gameLogic.js";
import { STATS } from "../constants/gameData.js";

export function buildCharContext(game) {
  const level          = getLevel(game.xp);
  const cls            = getClass(level);
  const today          = TODAY();
  const done           = game.done?.[today] || {};
  const completedToday = game.daily?.filter(q => done[q.id]).map(q => q.name) || [];
  const statSummary    = STATS.map(s => `${s}:${game.stats?.[s] || 1}`).join(", ");
  const weakest        = STATS.reduce((a,b) => (game.stats?.[a]||1) < (game.stats?.[b]||1) ? a : b);
  const strongest      = STATS.reduce((a,b) => (game.stats?.[a]||1) > (game.stats?.[b]||1) ? a : b);
  const streaks        = game.daily?.map(q => `${q.name}(streak:${q.streak})`).join(", ") || "none";
  const hist           = game.memory?.recentActivity?.slice(-7) || [];
  return `
PLAYER: ${game.char?.name||"Unknown"} | Age: ${game.char?.age||"?"} | ${game.char?.occupation||"no occupation"}
Bio: ${game.char?.bio||"none"}
Level: ${level} (${cls.name}) | XP: ${game.xp} | Gems: ${game.gems} | Mood: ${game.mood||"unset"}
Stats: ${statSummary}
Weakest: ${weakest}(${game.stats?.[weakest]||1}) | Strongest: ${strongest}(${game.stats?.[strongest]||1})
Habits & streaks: ${streaks}
Completed today: ${completedToday.join(", ")||"none"}
Abyss depth: ${game.abyssDepth||0}/20
Active quests: ${game.quests?.filter(q=>!q.done).map(q=>`${q.name}(${q.diff})`).join(", ")||"none"}
Recent 7 days: ${hist.map(r=>`${r.date}:${r.count}tasks,mood=${r.mood||"?"}`).join(" | ")||"no history"}
Avg completions/day: ${game.memory?.avgCompletions?.toFixed(1)||"unknown"}
Most skipped stat: ${game.memory?.mostSkipped||"unknown"}
`.trim();
}

export function buildSystemPrompt(ctx) {
  return `You are the AI system for HabitQuest, a productivity RPG. You give clear, direct, personalised coaching advice based on the player's actual data. Your tone is confident and honest — not harsh, not overly warm. You reference specific numbers, habits, and patterns from their data. Keep responses concise and practical.

Player data:
${ctx}

Rules:
- Always reference the player's actual stats and habits
- Quest suggestions must use exact format: [QUEST: "Name" | Rank: X-Rank | Type: StatType | Reason: brief]
- Keep responses under 180 words unless listing multiple quests
- Be direct and specific, not vague or motivational-poster generic`;
}

export async function callAIProxy(systemPrompt, userMessage, history = []) {
  const res = await fetch(AI_PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type":  "application/json",
      "Authorization": `Bearer ${ANON_KEY}`,
    },
    body: JSON.stringify({ systemPrompt, userMessage, history }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.text || "";
}

export function parseSuggestedQuests(text) {
  const matches = [...text.matchAll(/\[QUEST:\s*"([^"]+)"\s*\|\s*Rank:\s*([^|]+)\s*\|\s*Type:\s*([^|]+)\s*\|\s*Reason:\s*([^\]]+)\]/gi)];
  return matches.map(m => ({
    name:m[1].trim(), diff:m[2].trim(), type:m[3].trim(), reason:m[4].trim(),
  }));
}
