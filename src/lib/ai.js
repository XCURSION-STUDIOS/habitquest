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

// ── Weekly Review Data Builder ────────────────────────────────
export async function buildWeeklyData(game) {
  const days  = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const today = new Date();
  const week  = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr  = d.toISOString().split("T")[0];
    const dayName  = days[d.getDay()];
    const doneThat = game.done?.[dateStr] || {};
    const completed = game.daily.filter(h => doneThat[h.id] && doneThat[h.id] !== false);
    const total     = game.daily.length;

    // Time-of-day analysis from timestamps
    const times = completed.map(h => {
      const ts = doneThat[h.id];
      if (typeof ts === "string" && ts !== "true") {
        return new Date(ts).getHours();
      }
      return null;
    }).filter(t => t !== null);

    const avgHour = times.length > 0
      ? Math.round(times.reduce((a,b) => a+b, 0) / times.length)
      : null;

    week.push({
      date: dateStr,
      day: dayName,
      completed: completed.length,
      total,
      rate: total > 0 ? Math.round((completed.length / total) * 100) : 0,
      avgHour,
      mood: game.done?.[dateStr]?.mood || null,
      completedNames: completed.map(h => h.name),
    });
  }

  // Per-stat breakdown
  const statRates = {};
  const statList = ["Physical","Mental","Spiritual","Social","Emotional"];
  statList.forEach(stat => {
    const habitsOfStat = game.daily.filter(h => h.type === stat);
    if (habitsOfStat.length === 0) { statRates[stat] = null; return; }
    let totalDone = 0, totalPossible = 0;
    week.forEach(day => {
      habitsOfStat.forEach(h => {
        totalPossible++;
        const ts = game.done?.[day.date]?.[h.id];
        if (ts && ts !== false) totalDone++;
      });
    });
    statRates[stat] = Math.round((totalDone / totalPossible) * 100);
  });

  // Day-of-week performance
  const dayRates = {};
  week.forEach(d => { dayRates[d.day] = d.rate; });

  // Best/worst day
  const bestDay  = week.reduce((a,b) => a.rate >= b.rate ? a : b);
  const worstDay = week.reduce((a,b) => a.rate <= b.rate ? a : b);

  // Time pattern
  const allHours = week.flatMap(d => {
    const doneThat = game.done?.[d.date] || {};
    return game.daily.map(h => {
      const ts = doneThat[h.id];
      if (typeof ts === "string" && ts.length > 4) return new Date(ts).getHours();
      return null;
    }).filter(t => t !== null);
  });
  const avgCompletionHour = allHours.length > 0
    ? Math.round(allHours.reduce((a,b) => a+b, 0) / allHours.length)
    : null;

  const weekScore = Math.round(week.reduce((a,b) => a + b.rate, 0) / 7);

  return { week, statRates, dayRates, bestDay, worstDay, avgCompletionHour, weekScore };
}

export function buildArchitectPrompt(game, weekData) {
  const { week, statRates, dayRates, bestDay, worstDay, avgCompletionHour, weekScore } = weekData;

  const dayTable = week.map(d =>
    `${d.day} ${d.date}: ${d.completed}/${d.total} (${d.rate}%) | mood:${d.mood||"unset"}${d.avgHour!==null?` | avg time: ${d.avgHour}:00`:""}`
  ).join("\n");

  const statTable = Object.entries(statRates)
    .filter(([,v]) => v !== null)
    .map(([k,v]) => `${k}: ${v}%`)
    .join(", ");

  const timeNote = avgCompletionHour !== null
    ? `Average completion time this week: ${avgCompletionHour}:00 (${avgCompletionHour < 12 ? "morning" : avgCompletionHour < 17 ? "afternoon" : "evening"})`
    : "No timestamp data available yet for time analysis";

  return `You are The Architect — an executive AI coach conducting a formal weekly performance review. You are analytical, precise, and direct. You identify patterns humans miss. You do not motivate — you analyse and prescribe.

Player: ${game.char?.name || "Unknown"} | Level ${Math.floor((game.xp||0)/400)+1} | Abyss Depth: ${game.abyssDepth||0}

WEEKLY DATA:
${dayTable}

Stat completion rates: ${statTable}
Best day: ${bestDay.day} (${bestDay.rate}%) | Worst day: ${worstDay.day} (${worstDay.rate}%)
${timeNote}
Week score: ${weekScore}/100

Habits tracked: ${game.daily.map(h => `${h.name}(${h.type},${h.diff})`).join(", ")}

Conduct a structured weekly review with these exact sections:

## WEEK SCORE: ${weekScore}/100
[One sentence verdict on the week]

## PATTERNS IDENTIFIED
[2-3 specific patterns from the data — day-of-week trends, stat weaknesses, time patterns, mood correlations. Be specific with numbers.]

## CRITICAL FINDING
[The single most important insight from this week's data. What is the player not seeing?]

## RECOMMENDATIONS
[3 specific, actionable changes. Reference actual habits by name. If time data is available, suggest optimal scheduling times.]

## NEXT WEEK DIRECTIVE
[One clear primary focus for next week. One sentence.]

Be analytical. Use the actual numbers. Do not be vague or motivational. Max 280 words.`;
}
