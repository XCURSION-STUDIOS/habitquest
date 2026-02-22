#!/bin/bash
# ─────────────────────────────────────────────────────────────
# HabitQuest V2 — Full refactor script
# Run from /workspaces/HabitQuest with: bash refactor_v2.sh
# ─────────────────────────────────────────────────────────────

echo "Building HabitQuest V2..."

# Create folder structure
mkdir -p src/lib src/constants src/components/ui src/components/layout src/screens

# ─────────────────────────────────────────────────────────────
# CONSTANTS
# ─────────────────────────────────────────────────────────────

cat > src/constants/theme.js << 'FILEOF'
export const T = {
  bg0:"#06060f", bg1:"#0d0d1a", bg2:"#111120", bg3:"#1c1c30",
  gold:"#c9a84c", silver:"#7a8aaa", dim:"#3a4060",
  text:"#d8e0f0", textBright:"#eef2ff",
  danger:"#b03030", success:"#27a060", purple:"#6b4fb0",
  abyss:"#3a0000", sg:"#00cc88",
};

export const FONTS = {
  display: "'Cormorant Garamond','Georgia',serif",
  ui:      "'DM Mono','Courier New',monospace",
};

export const THEMES = {
  default: { accent:"#c9a84c", glow:"#c9a84c20", text:"#e8d090", name:"Classic Gold" },
  blood:   { accent:"#b03030", glow:"#b0303020", text:"#e07070", name:"Crimson"       },
  void:    { accent:"#6b4fb0", glow:"#6b4fb020", text:"#b090e0", name:"Void Purple"   },
  jade:    { accent:"#20a060", glow:"#20a06020", text:"#70d0a0", name:"Jade"          },
  iron:    { accent:"#7a8aaa", glow:"#7a8aaa20", text:"#b0c0d8", name:"Iron"          },
  ember:   { accent:"#e07020", glow:"#e0702020", text:"#f0a060", name:"Ember"         },
  frost:   { accent:"#40a0d0", glow:"#40a0d020", text:"#80c8e8", name:"Frost"         },
  toxic:   { accent:"#80c020", glow:"#80c02020", text:"#b0e060", name:"Toxic"         },
};

export const AESTHETICS = {
  default: {
    name: "Standard",
    desc: "Clean dark interface with gold accents.",
    cost: 0,
    preview: { bg:"#06060f", card:"#0d0d1a", accent:"#c9a84c", text:"#d8e0f0" },
  },
  neon: {
    name: "Neon City",
    desc: "Cyberpunk-inspired neon glow aesthetic.",
    cost: 500,
    preview: { bg:"#020010", card:"#080018", accent:"#00ffcc", text:"#c0f0ff" },
    overrides: {
      bg0:"#020010", bg1:"#080018", bg2:"#0a0020", bg3:"#140030",
      accent:"#00ffcc", glow:"#00ffcc20", text:"#c0f0ff",
    },
  },
  parchment: {
    name: "Ancient Scroll",
    desc: "Worn parchment and aged ink. Old-world feel.",
    cost: 400,
    preview: { bg:"#1a1408", card:"#231c0e", accent:"#c8a040", text:"#e8d8a0" },
    overrides: {
      bg0:"#1a1408", bg1:"#231c0e", bg2:"#2a2210", bg3:"#362c18",
      accent:"#c8a040", glow:"#c8a04020", text:"#e8d8a0",
    },
  },
  void_realm: {
    name: "Void Realm",
    desc: "Deep space aesthetic with cosmic accents.",
    cost: 600,
    preview: { bg:"#00000f", card:"#05050f", accent:"#8060ff", text:"#c0b0ff" },
    overrides: {
      bg0:"#00000f", bg1:"#05050f", bg2:"#080818", bg3:"#10102a",
      accent:"#8060ff", glow:"#8060ff20", text:"#c0b0ff",
    },
  },
};
FILEOF

cat > src/constants/gameData.js << 'FILEOF'
export const STATS   = ["Physical","Mental","Spiritual","Social","Emotional"];
export const STAT_COL = {
  Physical:"#b03030", Mental:"#2060a0",
  Spiritual:"#7060c0", Social:"#b09020", Emotional:"#208060",
};
export const STAT_ICO = {
  Physical:"⚔", Mental:"◈", Spiritual:"✦", Social:"◉", Emotional:"♦",
};

export const DIFF = {
  "F-Rank": { xp:20,  gems:2,  col:"#444"    },
  "E-Rank": { xp:40,  gems:4,  col:"#607080" },
  "D-Rank": { xp:80,  gems:7,  col:"#208060" },
  "C-Rank": { xp:140, gems:12, col:"#2060a0" },
  "B-Rank": { xp:220, gems:20, col:"#c9a84c" },
  "A-Rank": { xp:340, gems:30, col:"#b03030" },
  "S-Rank": { xp:500, gems:45, col:"#6b4fb0" },
};

export const XP_PER_LEVEL   = 400;
export const QUEST_DAILY_LIMIT = 5;
export const QUEST_EXTRA_COST  = 20; // gems to unlock one extra quest slot

export const CLASSES = [
  { min:1,   name:"Beginner",   icon:"◌" },
  { min:5,   name:"Awakened",   icon:"◈" },
  { min:10,  name:"E-Class",    icon:"◇" },
  { min:20,  name:"D-Class",    icon:"◆" },
  { min:35,  name:"C-Class",    icon:"⬡" },
  { min:50,  name:"B-Class",    icon:"✦" },
  { min:70,  name:"A-Class",    icon:"★" },
  { min:90,  name:"S-Class",    icon:"⚔" },
  { min:100, name:"Elite",      icon:"⚡" },
];

// ── Skill Tree ──────────────────────────────────────────────
// 5 branches × 4 tiers = 20 nodes
// Each node has: id, branch, tier, name, desc, effect, cost (skill points), requires (node id or null)
export const SKILL_TREE = {
  Physical: [
    { id:"ph1", tier:1, name:"Iron Body",         desc:"+10% XP from physical habits.",             effect:{ type:"xp_bonus", stat:"Physical", val:0.10 }, cost:1, requires:null },
    { id:"ph2", tier:2, name:"Endurance",          desc:"Physical streak breaks cost -1 Abyss depth instead of -2.", effect:{ type:"abyss_reduction", stat:"Physical" }, cost:2, requires:"ph1" },
    { id:"ph3", tier:3, name:"Peak Condition",     desc:"+20% XP from all habits on days you complete every physical task.", effect:{ type:"full_day_bonus", stat:"Physical", val:0.20 }, cost:3, requires:"ph2" },
    { id:"ph4", tier:4, name:"Elite Physique",     desc:"Physical stat gains count double permanently.", effect:{ type:"stat_double", stat:"Physical" }, cost:4, requires:"ph3" },
  ],
  Mental: [
    { id:"mn1", tier:1, name:"Sharp Focus",        desc:"+10% XP from mental habits.",               effect:{ type:"xp_bonus", stat:"Mental", val:0.10 }, cost:1, requires:null },
    { id:"mn2", tier:2, name:"Strategic Mind",     desc:"Quest XP rewards increased by 15%.",        effect:{ type:"quest_bonus", val:0.15 }, cost:2, requires:"mn1" },
    { id:"mn3", tier:3, name:"Deep Work",          desc:"Completing 3+ mental tasks in a day gives +50 bonus XP.", effect:{ type:"streak_day_bonus", stat:"Mental", count:3, val:50 }, cost:3, requires:"mn2" },
    { id:"mn4", tier:4, name:"Mastermind",         desc:"Mental stat gains count double permanently.", effect:{ type:"stat_double", stat:"Mental" }, cost:4, requires:"mn3" },
  ],
  Spiritual: [
    { id:"sp1", tier:1, name:"Inner Calm",         desc:"+10% XP from spiritual habits.",            effect:{ type:"xp_bonus", stat:"Spiritual", val:0.10 }, cost:1, requires:null },
    { id:"sp2", tier:2, name:"Mindfulness",        desc:"Low mood penalty reduced from -15% to -5% XP.", effect:{ type:"mood_penalty_reduction" }, cost:2, requires:"sp1" },
    { id:"sp3", tier:3, name:"Resilience",         desc:"Abyss depth cannot exceed 10 (down from 20).", effect:{ type:"abyss_cap", val:10 }, cost:3, requires:"sp2" },
    { id:"sp4", tier:4, name:"Enlightened",        desc:"Spiritual stat gains count double permanently.", effect:{ type:"stat_double", stat:"Spiritual" }, cost:4, requires:"sp3" },
  ],
  Social: [
    { id:"so1", tier:1, name:"Outgoing",           desc:"+10% XP from social habits.",               effect:{ type:"xp_bonus", stat:"Social", val:0.10 }, cost:1, requires:null },
    { id:"so2", tier:2, name:"Communicator",       desc:"+15% gem rewards across all tasks.",        effect:{ type:"gem_bonus", val:0.15 }, cost:2, requires:"so1" },
    { id:"so3", tier:3, name:"Influencer",         desc:"High mood XP bonus increased from +25% to +40%.", effect:{ type:"mood_bonus_increase", val:0.40 }, cost:3, requires:"so2" },
    { id:"so4", tier:4, name:"Leader",             desc:"Social stat gains count double permanently.", effect:{ type:"stat_double", stat:"Social" }, cost:4, requires:"so3" },
  ],
  Emotional: [
    { id:"em1", tier:1, name:"Self-Aware",         desc:"+10% XP from emotional habits.",            effect:{ type:"xp_bonus", stat:"Emotional", val:0.10 }, cost:1, requires:null },
    { id:"em2", tier:2, name:"Regulated",          desc:"Streak freeze item lasts 2 days instead of 1.", effect:{ type:"freeze_extend" }, cost:2, requires:"em1" },
    { id:"em3", tier:3, name:"Balanced",           desc:"Completing habits from 4+ different stats in one day gives +80 bonus XP.", effect:{ type:"variety_bonus", count:4, val:80 }, cost:3, requires:"em2" },
    { id:"em4", tier:4, name:"Mastery",            desc:"Emotional stat gains count double permanently.", effect:{ type:"stat_double", stat:"Emotional" }, cost:4, requires:"em3" },
  ],
  // Cross-branch unlocks (require nodes from 2 different branches)
  Cross: [
    { id:"cx1", name:"Tactician",   desc:"Unlocked Physical + Mental T2. Bonus +30 XP when you complete both a physical and mental task on the same day.", effect:{ type:"cross_bonus", stats:["Physical","Mental"], val:30 }, cost:3, requires:["ph2","mn2"], icon:"⚡" },
    { id:"cx2", name:"Sage",        desc:"Unlocked Mental + Spiritual T2. AI briefings gain additional insight based on your emotional patterns.", effect:{ type:"ai_enhanced_briefing" }, cost:3, requires:["mn2","sp2"], icon:"✦" },
    { id:"cx3", name:"Diplomat",    desc:"Unlocked Social + Emotional T2. Gem rewards doubled on days your mood is set to any value.", effect:{ type:"mood_gem_double" }, cost:3, requires:["so2","em2"], icon:"◉" },
  ],
};

export const SHOP_ITEMS = [
  { id:"xp2",  name:"XP Boost",        icon:"◈", cost:40,  type:"temp", desc:"2× XP on next 5 completions.", uses:5, val:2 },
  { id:"gem2", name:"Gem Boost",        icon:"✦", cost:35,  type:"temp", desc:"2× gems on next 5 completions.", uses:5, val:2 },
  { id:"frz",  name:"Streak Shield",    icon:"◇", cost:55,  type:"temp", desc:"Protects one streak from a missed day.", uses:1, val:1 },
  { id:"xp3",  name:"XP Surge",         icon:"⚡", cost:110, type:"temp", desc:"3× XP for next 3 completions.", uses:3, val:3 },
  { id:"xslot",name:"Extra Quest Slot", icon:"＋", cost:20,  type:"temp", desc:"Add one extra completable quest today.", uses:1, val:1, questSlot:true },
  { id:"pxp",  name:"Permanent XP+",    icon:"★", cost:250, type:"perm", desc:"+8% XP on every task, permanently.", effect:"+8% XP" },
  { id:"pgem", name:"Permanent Gem+",   icon:"⬡", cost:200, type:"perm", desc:"+10% gems every completion, permanently.", effect:"+10% Gems" },
  ...["Physical","Mental","Spiritual","Social","Emotional"].map(s => ({
    id:`p${s.toLowerCase().slice(0,4)}`,
    name:`${s} Boost`,
    icon:{ Physical:"⚔", Mental:"◈", Spiritual:"✦", Social:"◉", Emotional:"♦" }[s],
    cost:180, type:"perm",
    desc:`+20 ${s} stat ceiling.`,
    effect:`+20 ${s} Cap`, stat:s,
  })),
  { id:"th_blood", name:"Crimson Theme",   icon:"◆", cost:50,  type:"theme", desc:"Red accent theme.",    theme:"blood"  },
  { id:"th_void",  name:"Purple Theme",    icon:"⬡", cost:50,  type:"theme", desc:"Purple accent theme.", theme:"void"   },
  { id:"th_jade",  name:"Jade Theme",      icon:"✦", cost:50,  type:"theme", desc:"Green accent theme.",  theme:"jade"   },
  { id:"th_iron",  name:"Iron Theme",      icon:"◈", cost:50,  type:"theme", desc:"Grey accent theme.",   theme:"iron"   },
  { id:"th_ember", name:"Ember Theme",     icon:"🔥", cost:75,  type:"theme", desc:"Orange accent theme.", theme:"ember"  },
  { id:"th_frost", name:"Frost Theme",     icon:"❄", cost:75,  type:"theme", desc:"Blue accent theme.",   theme:"frost"  },
  { id:"th_toxic", name:"Toxic Theme",     icon:"☣", cost:75,  type:"theme", desc:"Green neon theme.",    theme:"toxic"  },
  { id:"ae_neon",       name:"Neon City",      icon:"⚡", cost:500, type:"aesthetic", desc:"Full cyberpunk aesthetic.", aesthetic:"neon"       },
  { id:"ae_parchment",  name:"Ancient Scroll", icon:"📜", cost:400, type:"aesthetic", desc:"Aged parchment aesthetic.", aesthetic:"parchment"  },
  { id:"ae_void_realm", name:"Void Realm",     icon:"🌌", cost:600, type:"aesthetic", desc:"Deep space aesthetic.",     aesthetic:"void_realm" },
  { id:"aura",    name:"Glow Effect",      icon:"⚡", cost:300, type:"cosm", desc:"Animated glow around your avatar." },
  { id:"tit_sm",  name:"Title: Shadow Monarch", icon:"◈", cost:100, type:"cosm", desc:"Equip the Shadow Monarch title.", titleVal:"Shadow Monarch" },
  { id:"tit_ar",  name:"Title: ARISE",     icon:"⚔", cost:300, type:"cosm", desc:"Equip the ARISE title.", titleVal:"ARISE" },
];

export const DEFAULT_GAME = {
  char: { name:"", age:"", occupation:"", bio:"" },
  setup: false,
  onboardingDone: false,
  xp:0, gems:0,
  stats: { Physical:1, Mental:1, Spiritual:1, Social:1, Emotional:1 },
  skillPoints: 0,
  unlockedNodes: [],
  daily: [
    { id:1, name:"Work Out",     type:"Physical", diff:"D-Rank", streak:0, best:0 },
    { id:2, name:"Read",         type:"Mental",   diff:"D-Rank", streak:0, best:0 },
    { id:3, name:"Study / Learn",type:"Mental",   diff:"C-Rank", streak:0, best:0 },
  ],
  quests:[], done:{},
  questCompletedToday: 0,
  questExtraSlots: 0,
  perms:[], actives:[], cosmetics:[], titles:[],
  title:null, theme:"default", aesthetic:"default", aura:false,
  shadowMission:null, shadowProgress:0,
  boss:null, bossHPLeft:0,
  abyssDepth:0, abyssActive:false,
  mood:null, lastMoodDate:null,
  lastDay: new Date().toISOString().split("T")[0],
  briefing:null, briefingDate:null,
  penaltyMessage: null,
  memory: {
    recentActivity:[], totalDays:0,
    avgCompletions:0, mostSkipped:null, longestStreak:0,
  },
};
FILEOF

# ─────────────────────────────────────────────────────────────
# LIB
# ─────────────────────────────────────────────────────────────

cat > src/lib/supabase.js << 'FILEOF'
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase     = createClient(SUPABASE_URL, SUPABASE_ANON);
export const ANON_KEY     = SUPABASE_ANON;
export const AI_PROXY_URL = `${SUPABASE_URL}/functions/v1/ai-proxy`;
FILEOF

cat > src/lib/ai.js << 'FILEOF'
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
FILEOF

cat > src/lib/gameLogic.js << 'FILEOF'
import { XP_PER_LEVEL, CLASSES, STATS, DIFF, SKILL_TREE, QUEST_DAILY_LIMIT } from "../constants/gameData.js";

export const TODAY   = () => new Date().toISOString().split("T")[0];
export const getLevel = xp  => Math.floor(xp / XP_PER_LEVEL) + 1;
export const getXPPct = xp  => (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
export const getClass = lvl => [...CLASSES].reverse().find(c => lvl >= c.min) || CLASSES[0];

// Get all unlocked node objects
export function getUnlockedNodes(unlockedIds = []) {
  const all = [];
  Object.values(SKILL_TREE).flat().forEach(n => { if (unlockedIds.includes(n.id)) all.push(n); });
  return all;
}

// Check if a node can be unlocked
export function canUnlockNode(node, unlockedIds, skillPoints) {
  if (unlockedIds.includes(node.id)) return false;
  if (skillPoints < node.cost) return false;
  if (!node.requires) return true;
  if (Array.isArray(node.requires)) return node.requires.every(r => unlockedIds.includes(r));
  return unlockedIds.includes(node.requires);
}

// Apply skill tree effects to multipliers
export function getMultipliers(game, statType = null) {
  let xm = 1, gm = 1;
  const nodes = getUnlockedNodes(game.unlockedNodes || []);

  for (const p of game.actives || []) {
    if ((p.id === "xp2" || p.id === "xp3") && p.left > 0) xm = Math.max(xm, p.val);
    if (p.id === "gem2" && p.left > 0) gm = Math.max(gm, p.val);
  }
  if (game.perms?.find(p => p.id === "pxp"))  xm += 0.08;
  if (game.perms?.find(p => p.id === "pgem")) gm += 0.10;

  // Mood
  const moodPenalty = nodes.find(n => n.effect?.type === "mood_penalty_reduction") ? 0.05 : 0.15;
  const moodBonus   = nodes.find(n => n.effect?.type === "mood_bonus_increase")?.effect?.val || 0.25;
  if (game.mood === "high") xm += moodBonus;
  if (game.mood === "low")  xm -= moodPenalty;

  // Stat-specific XP bonus from skill tree
  if (statType) {
    nodes.forEach(n => {
      if (n.effect?.type === "xp_bonus" && n.effect?.stat === statType) xm += n.effect.val;
    });
  }

  // Gem bonus from Social tree
  nodes.forEach(n => {
    if (n.effect?.type === "gem_bonus") gm += n.effect.val;
  });

  // Diplomat cross: gem double on days mood is set
  if (nodes.find(n => n.effect?.type === "mood_gem_double") && game.mood) gm *= 2;

  return { xm: Math.max(0.1, xm), gm: Math.max(0.1, gm) };
}

export function getQuestLimit(game) {
  return QUEST_DAILY_LIMIT + (game.questExtraSlots || 0);
}

export function rolloverDay(game, today) {
  let broken = 0;
  const missedNames = [];
  const daily = game.daily.map(q => {
    if (!(game.done?.[game.lastDay] || {})[q.id]) {
      broken++;
      missedNames.push(q.name);
      return { ...q, streak:0 };
    }
    return q;
  });

  const nodes       = getUnlockedNodes(game.unlockedNodes || []);
  const abyssCap    = nodes.find(n => n.effect?.type === "abyss_cap")?.effect?.val || 20;
  const newDepth    = Math.min((game.abyssDepth || 0) + broken, abyssCap);
  const prev        = game.memory || {};
  const recentActivity = [
    ...(prev.recentActivity || []),
    { date:game.lastDay, count:Object.values(game.done?.[game.lastDay]||{}).filter(Boolean).length, mood:game.mood },
  ].slice(-30);
  const totalDays      = (prev.totalDays || 0) + 1;
  const avgCompletions = recentActivity.reduce((a,r) => a+r.count, 0) / recentActivity.length;
  const statAct = {};
  game.daily.forEach(q => { if ((game.done?.[game.lastDay]||{})[q.id]) statAct[q.type] = (statAct[q.type]||0)+1; });
  const leastActive   = STATS.reduce((a,b) => (statAct[a]||0) < (statAct[b]||0) ? a : b);
  const longestStreak = Math.max(prev.longestStreak||0, ...game.daily.map(q => q.best||0));

  // Penalty message
  let penaltyMessage = null;
  if (broken > 0) {
    penaltyMessage = {
      missed: missedNames,
      broken,
      abyssChange: broken,
      date: game.lastDay,
    };
  }

  return {
    ...game,
    daily,
    lastDay: today,
    mood: null,
    briefing: null,
    briefingDate: null,
    abyssDepth: newDepth,
    abyssActive: newDepth >= 5,
    questCompletedToday: 0,
    questExtraSlots: 0,
    penaltyMessage,
    memory: { recentActivity, totalDays, avgCompletions, mostSkipped:leastActive, longestStreak },
  };
}

export function applyCompleteDaily(game, id, today) {
  const todayDone = game.done?.[today] || {};
  if (todayDone[id]) {
    const q   = game.daily.find(q => q.id === id);
    const cfg = DIFF[q.diff];
    return {
      ...game,
      xp:    Math.max(0, game.xp - cfg.xp),
      gems:  Math.max(0, game.gems - cfg.gems),
      done:  { ...game.done, [today]:{ ...todayDone, [id]:false } },
      stats: { ...game.stats, [q.type]:Math.max(1,(game.stats[q.type]||1)-1) },
      daily: game.daily.map(d => d.id===id ? { ...d, streak:Math.max(0,d.streak-1) } : d),
    };
  }

  const q           = game.daily.find(q => q.id === id);
  const cfg         = DIFF[q.diff];
  const { xm, gm } = getMultipliers(game, q.type);
  const xpE         = Math.round(cfg.xp * xm);
  const gemE        = Math.round(cfg.gems * gm);
  const newXP       = game.xp + xpE;
  const actives     = (game.actives||[])
    .map(p => (p.id==="xp2"||p.id==="xp3"||p.id==="gem2") ? { ...p, left:p.left-1 } : p)
    .filter(p => p.left > 0);

  // Skill point award on level up
  const oldLevel    = getLevel(game.xp);
  const newLevel    = getLevel(newXP);
  const newSP       = (game.skillPoints||0) + (newLevel - oldLevel);

  let sp=game.shadowProgress||0, sm=game.shadowMission;
  let shadowBonus=0, shadowGemBonus=0, clearShadow=false;
  if (sm) { sp+=1; if(sp>=sm.req.count){ shadowBonus=sm.xp; shadowGemBonus=sm.gems||0; clearShadow=true; } }

  let bossHPLeft=game.bossHPLeft, boss=game.boss, bossBonus=0, bossGemBonus=0, clearBoss=false;
  if (boss) { bossHPLeft=Math.max(0,bossHPLeft-1); if(bossHPLeft===0){ bossBonus=boss.xp; bossGemBonus=boss.gems||0; clearBoss=true; } }

  const nodes         = getUnlockedNodes(game.unlockedNodes||[]);
  const statDouble    = nodes.find(n => n.effect?.type==="stat_double" && n.effect?.stat===q.type);
  const statGain      = statDouble ? 2 : 1;
  const newAbyssDepth = Math.max(0,(game.abyssDepth||0)-1);

  return {
    ...game,
    actives,
    skillPoints: newSP,
    xp:    newXP + shadowBonus + bossBonus,
    gems:  game.gems + gemE + shadowGemBonus + bossGemBonus,
    done:  { ...game.done, [today]:{ ...(game.done[today]||{}), [id]:true } },
    stats: { ...game.stats, [q.type]:Math.min((game.stats[q.type]||1)+statGain, 100) },
    daily: game.daily.map(d => d.id===id ? { ...d, streak:d.streak+1, best:Math.max(d.best||0,d.streak+1) } : d),
    shadowMission:  clearShadow ? null : sm,
    shadowProgress: clearShadow ? 0 : sp,
    boss:       clearBoss ? null : boss,
    bossHPLeft: clearBoss ? 0 : bossHPLeft,
    abyssDepth: newAbyssDepth,
    abyssActive: newAbyssDepth >= 5,
    _events: {
      levelUp:   newLevel > oldLevel,
      newLevel,
      xpEarned:  xpE,
      gemEarned: gemE,
      boosted:   xm > 1.05,
      shadowDone: clearShadow, shadowXP: shadowBonus,
      bossDone:   clearBoss,   bossXP:   bossBonus,
      skillPointGained: newLevel > oldLevel,
    },
  };
}

export function applyCompleteQuest(game, id, today) {
  const q = game.quests.find(q => q.id===id);
  if (!q || q.done) return { game, events:{} };
  const limit = getQuestLimit(game);
  if ((game.questCompletedToday||0) >= limit) return { game, events:{ error:`Daily quest limit reached (${limit}). Buy an Extra Quest Slot in the shop.` } };

  const nodes      = getUnlockedNodes(game.unlockedNodes||[]);
  const questBonus = nodes.find(n => n.effect?.type==="quest_bonus")?.effect?.val || 0;
  const xpFinal    = Math.round(q.xp * (1 + questBonus));

  return {
    game: {
      ...game,
      xp:    game.xp + xpFinal,
      gems:  game.gems + q.gems,
      stats: { ...game.stats, [q.type]:Math.min((game.stats[q.type]||1)+3, 100) },
      quests: game.quests.map(x => x.id===id ? { ...x, done:true } : x),
      questCompletedToday: (game.questCompletedToday||0)+1,
    },
    events: { xp:xpFinal, gems:q.gems, name:q.name },
  };
}

export function applyBuyItem(game, item) {
  if (game.gems < item.cost) return { game, error:"Not enough gems." };
  if (item.type === "theme") {
    if (game.cosmetics?.includes(item.id)) return { game, error:"Already owned." };
    return { game:{ ...game, gems:game.gems-item.cost, cosmetics:[...(game.cosmetics||[]),item.id], theme:item.theme } };
  }
  if (item.type === "aesthetic") {
    if (game.cosmetics?.includes(item.id)) return { game, error:"Already owned." };
    return { game:{ ...game, gems:game.gems-item.cost, cosmetics:[...(game.cosmetics||[]),item.id], aesthetic:item.aesthetic } };
  }
  if (item.type === "cosm") {
    if (game.cosmetics?.includes(item.id)) return { game, error:"Already owned." };
    let extra = {};
    if (item.id==="aura") extra.aura=true;
    if (item.titleVal) extra.titles=[...(game.titles||[]),item.id];
    return { game:{ ...game, gems:game.gems-item.cost, cosmetics:[...(game.cosmetics||[]),item.id],...extra } };
  }
  if (item.type === "perm") {
    if (game.perms?.find(p => p.id===item.id)) return { game, error:"Already unlocked." };
    return { game:{ ...game, gems:game.gems-item.cost, perms:[...(game.perms||[]),item] } };
  }
  if (item.questSlot) {
    return { game:{ ...game, gems:game.gems-item.cost, questExtraSlots:(game.questExtraSlots||0)+1 } };
  }
  return {
    game: {
      ...game,
      gems: game.gems-item.cost,
      actives: [
        ...(game.actives||[]).filter(p => p.id!==item.id),
        { ...item, left:item.uses+((game.actives||[]).find(p=>p.id===item.id)?.left||0) },
      ],
    },
  };
}

export function applyUnlockNode(game, nodeId) {
  const allNodes = Object.values(SKILL_TREE).flat();
  const node     = allNodes.find(n => n.id===nodeId);
  if (!node) return { game, error:"Node not found." };
  if (!canUnlockNode(node, game.unlockedNodes||[], game.skillPoints||0)) return { game, error:"Cannot unlock this node yet." };
  return {
    game: {
      ...game,
      skillPoints:    (game.skillPoints||0) - node.cost,
      unlockedNodes:  [...(game.unlockedNodes||[]), nodeId],
    },
  };
}
FILEOF

# ─────────────────────────────────────────────────────────────
# UI COMPONENTS
# ─────────────────────────────────────────────────────────────

cat > src/components/ui/GlobalCSS.jsx << 'FILEOF'
import { FONTS } from "../../constants/theme.js";
export default function GlobalCSS({ accent }) {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Mono:ital,wght@0,400;0,500&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:${FONTS.ui};}
      ::-webkit-scrollbar{width:3px;}
      ::-webkit-scrollbar-track{background:#06060f;}
      ::-webkit-scrollbar-thumb{background:#1c1c30;border-radius:2px;}
      select option{background:#0d0d1a;}
      @keyframes toastIn{from{transform:translateX(20px);opacity:0;}to{transform:translateX(0);opacity:1;}}
      @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
      @keyframes lvlPop{
        0%{transform:scale(0.85) translateY(16px);opacity:0;}
        15%{transform:scale(1.02);opacity:1;}
        85%{transform:scale(1);opacity:1;}
        100%{transform:scale(0.95) translateY(-8px);opacity:0;}
      }
      @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.35;}}
      @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}
      @keyframes auraAnim{
        0%{box-shadow:0 0 0 2px #c9a84c,0 0 14px #c9a84c25;}
        25%{box-shadow:0 0 0 2px ${accent},0 0 14px ${accent}25;}
        50%{box-shadow:0 0 0 2px #6b4fb0,0 0 14px #6b4fb025;}
        75%{box-shadow:0 0 0 2px #27a060,0 0 14px #27a06025;}
        100%{box-shadow:0 0 0 2px #c9a84c,0 0 14px #c9a84c25;}
      }
      @keyframes particleDrift{
        0%{transform:translateY(0) translateX(0);opacity:0;}
        10%{opacity:1;}
        90%{opacity:0.6;}
        100%{transform:translateY(-100vh) translateX(var(--dx));opacity:0;}
      }
    `}</style>
  );
}
FILEOF

cat > src/components/ui/Toast.jsx << 'FILEOF'
import { FONTS } from "../../constants/theme.js";
const STYLES = {
  gold:   {bg:"#120e00",bd:"#c9a84c",tx:"#e8d090"},
  success:{bg:"#001a0a",bd:"#27a060",tx:"#60d090"},
  danger: {bg:"#150000",bd:"#b03030",tx:"#d06060"},
  info:   {bg:"#0a0a18",bd:"#7a8aaa",tx:"#a0b0c8"},
  system: {bg:"#001a0e",bd:"#00cc88",tx:"#00ee99"},
};
export default function Toast({ toast }) {
  if (!toast) return null;
  const s = STYLES[toast.type] || STYLES.gold;
  return (
    <div style={{ position:"fixed",top:20,right:16,zIndex:9999,maxWidth:300,padding:"12px 18px",borderRadius:8,background:s.bg,border:`1px solid ${s.bd}40`,color:s.tx,fontSize:12,fontFamily:FONTS.ui,animation:"toastIn 0.3s ease",boxShadow:`0 8px 32px ${s.bd}15`,lineHeight:1.6,whiteSpace:"pre-wrap" }}>
      {toast.msg}
    </div>
  );
}
FILEOF

cat > src/components/ui/index.jsx << 'FILEOF'
import { useState } from "react";
import { T, FONTS } from "../../constants/theme.js";
import { DIFF } from "../../constants/gameData.js";

export function Card({ children, style, accent }) {
  return (
    <div style={{ background:"linear-gradient(135deg,#0d0d1a,#111120)",border:`1px solid ${accent?accent+"30":T.bg3}`,borderRadius:10,padding:16,...style }}>
      {children}
    </div>
  );
}
export function SecTitle({ children, col, style }) {
  return (
    <div style={{ fontFamily:FONTS.ui,fontSize:9,letterSpacing:4,color:col||T.dim,marginBottom:14,textTransform:"uppercase",borderBottom:`1px solid ${T.bg3}`,paddingBottom:8,...style }}>
      {children}
    </div>
  );
}
export function Btn({ children, onClick, disabled, danger, full, style }) {
  const [hov,setHov] = useState(false);
  return (
    <button onClick={disabled?undefined:onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ fontFamily:FONTS.ui,fontSize:10,letterSpacing:2,padding:"10px 16px",background:hov&&!disabled?(danger?"#b0303018":"#c9a84c12"):"transparent",border:`1px solid ${disabled?T.dim:danger?"#b0303060":"#c9a84c50"}`,borderRadius:6,color:disabled?T.dim:danger?T.danger:T.gold,cursor:disabled?"not-allowed":"pointer",transition:"all 0.2s",width:full?"100%":undefined,...style }}>
      {children}
    </button>
  );
}
export function DiffTag({ diff }) {
  const c = DIFF[diff]||DIFF["D-Rank"];
  return <span style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,padding:"2px 7px",border:`1px solid ${c.col}50`,borderRadius:3,color:c.col,background:`${c.col}10` }}>{diff}</span>;
}
export function AIStatus({ status }) {
  const cfg = {
    idle:   {col:T.dim,    label:"AI READY",    pulse:false},
    working:{col:"#c9a84c",label:"AI THINKING", pulse:true },
    ok:     {col:T.sg,     label:"AI ONLINE",   pulse:false},
    error:  {col:T.danger, label:"AI ERROR",    pulse:false},
    offline:{col:T.dim,    label:"AI OFFLINE",  pulse:false},
  }[status]||{col:T.dim,label:"",pulse:false};
  return (
    <div style={{ display:"flex",alignItems:"center",gap:5 }}>
      <div style={{ width:6,height:6,borderRadius:"50%",background:cfg.col,animation:cfg.pulse?"pulse 1s ease-in-out infinite":"none",boxShadow:cfg.pulse?`0 0 6px ${cfg.col}`:undefined }}/>
      <span style={{ fontFamily:FONTS.ui,fontSize:7,letterSpacing:2,color:cfg.col }}>{cfg.label}</span>
    </div>
  );
}
FILEOF

cat > src/components/ui/RadarChart.jsx << 'FILEOF'
import { T, FONTS } from "../../constants/theme.js";
import { STATS, STAT_COL } from "../../constants/gameData.js";
export default function RadarChart({ stats, accent, size=210 }) {
  const cx=size/2,cy=size/2,r=size*0.36,n=STATS.length;
  const ang  = STATS.map((_,i)=>Math.PI*2*i/n-Math.PI/2);
  const pt   = (a,p)=>({x:cx+Math.cos(a)*r*p,y:cy+Math.sin(a)*r*p});
  const dpts = STATS.map((s,i)=>pt(ang[i],Math.min(stats[s]||1,100)/100));
  const dpath= dpts.map((p,i)=>`${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")+"Z";
  return (
    <svg width={size} height={size} style={{overflow:"visible"}}>
      <defs><radialGradient id="rg" cx="50%" cy="50%"><stop offset="0%" stopColor={accent} stopOpacity="0.2"/><stop offset="100%" stopColor={accent} stopOpacity="0.03"/></radialGradient></defs>
      {[.25,.5,.75,1].map(p=>{const rp=ang.map(a=>pt(a,p));const rpath=rp.map((x,i)=>`${i===0?"M":"L"}${x.x.toFixed(1)},${x.y.toFixed(1)}`).join(" ")+"Z";return <path key={p} d={rpath} fill="none" stroke={T.bg3} strokeWidth={1}/>;  })}
      {ang.map((a,i)=>{const o=pt(a,1);return <line key={i} x1={cx} y1={cy} x2={o.x.toFixed(1)} y2={o.y.toFixed(1)} stroke={T.bg3} strokeWidth={1}/>;  })}
      <path d={dpath} fill="url(#rg)" stroke={accent} strokeWidth={1.5}/>
      {dpts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={3.5} fill={STAT_COL[STATS[i]]} stroke={T.bg0} strokeWidth={1.5}/>)}
      {STATS.map((s,i)=>{const lp=pt(ang[i],1.28);return <text key={s} x={lp.x.toFixed(1)} y={lp.y.toFixed(1)} textAnchor="middle" dominantBaseline="middle" fill={STAT_COL[s]} fontSize={9} fontFamily={FONTS.ui} fontWeight="700">{s.toUpperCase()}</text>;})}
    </svg>
  );
}
FILEOF

# ─────────────────────────────────────────────────────────────
# LAYOUT COMPONENTS
# ─────────────────────────────────────────────────────────────

cat > src/components/layout/Header.jsx << 'FILEOF'
import { T, FONTS, THEMES } from "../../constants/theme.js";
import { getLevel, getXPPct, getClass } from "../../lib/gameLogic.js";
import { AIStatus } from "../ui/index.jsx";

export default function Header({ game, screen, setScreen, aiStatus, saving }) {
  const th    = THEMES[game.theme]||THEMES.default;
  const level = getLevel(game.xp);
  const cls   = getClass(level);
  return (
    <div style={{ padding:"14px 16px 0" }}>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:10 }}>
        <div onClick={()=>setScreen("status")} style={{ width:48,height:48,borderRadius:"50%",background:T.bg1,border:`1px solid ${th.accent}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,cursor:"pointer",flexShrink:0,animation:game.aura?"auraAnim 2.5s linear infinite":"none" }}>
          {cls.icon}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:1,flexWrap:"wrap" }}>
            <span style={{ fontFamily:FONTS.display,fontSize:18,color:T.textBright }}>{game.char.name}</span>
            {game.title&&<span style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:th.accent,border:`1px solid ${th.accent}30`,padding:"1px 7px",borderRadius:3 }}>{game.title}</span>}
            {saving&&<span style={{ fontFamily:FONTS.ui,fontSize:7,color:T.dim }}>saving…</span>}
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:T.silver }}>{cls.icon} {cls.name.toUpperCase()} · LVL {level}</div>
            <AIStatus status={aiStatus}/>
          </div>
          <div style={{ marginTop:4,height:2,background:T.bg3,borderRadius:1 }}>
            <div style={{ height:"100%",width:`${getXPPct(game.xp)*100}%`,background:`linear-gradient(90deg,${th.accent}60,${th.accent})`,borderRadius:1,transition:"width 0.6s ease" }}/>
          </div>
        </div>
        <div style={{ textAlign:"right",flexShrink:0 }}>
          <div style={{ fontFamily:FONTS.ui,fontSize:13,color:th.accent }}>◈ {game.gems}</div>
          {(game.skillPoints||0)>0&&<div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.purple }}>SP: {game.skillPoints}</div>}
        </div>
      </div>
      {game.actives?.length>0&&(
        <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:8 }}>
          {game.actives.map(p=><span key={p.id} style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:1,padding:"2px 8px",border:`1px solid ${th.accent}40`,borderRadius:20,color:th.accent }}>{p.icon} {p.name} ×{p.left}</span>)}
        </div>
      )}
      <nav style={{ display:"flex",borderBottom:`1px solid ${T.bg3}` }}>
        {[{id:"status",l:"STATUS"},{id:"daily",l:"DAILY"},{id:"quests",l:"QUESTS"},{id:"skills",l:"SKILLS"},{id:"shop",l:"SHOP"},{id:"options",l:"⚙"}].map(t=>(
          <button key={t.id} onClick={()=>setScreen(t.id)} style={{ flex:1,padding:"9px 0",fontFamily:FONTS.ui,fontSize:8,letterSpacing:1,background:"none",border:"none",cursor:"pointer",color:screen===t.id?th.accent:T.dim,borderBottom:screen===t.id?`1px solid ${th.accent}`:"1px solid transparent",transition:"color 0.2s",whiteSpace:"nowrap" }}>
            {t.l}
          </button>
        ))}
      </nav>
    </div>
  );
}
FILEOF

cat > src/components/layout/ShadowMissionBar.jsx << 'FILEOF'
import { T, FONTS } from "../../constants/theme.js";
export default function ShadowMissionBar({ game }) {
  if (!game.shadowMission) return null;
  return (
    <div style={{ padding:"10px 14px",background:"#080018",border:`1px solid ${T.purple}40`,borderRadius:8,marginBottom:10 }}>
      <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:3,color:T.purple,marginBottom:4 }}>
        BONUS MISSION{game.shadowMission.aiGenerated?" · AI GENERATED":""}
      </div>
      <div style={{ fontFamily:FONTS.display,fontSize:14,color:T.text,marginBottom:3 }}>{game.shadowMission.name}</div>
      <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.silver,lineHeight:1.5 }}>{game.shadowMission.desc}</div>
      <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:8 }}>
        <div style={{ flex:1,height:2,background:T.bg3,borderRadius:1 }}>
          <div style={{ height:"100%",width:`${Math.min((game.shadowProgress/Math.max(game.shadowMission.req.count,1))*100,100)}%`,background:T.purple,borderRadius:1,transition:"width 0.4s ease" }}/>
        </div>
        <span style={{ fontFamily:FONTS.ui,fontSize:9,color:T.purple }}>{game.shadowProgress}/{game.shadowMission.req.count}</span>
        <span style={{ fontFamily:FONTS.ui,fontSize:8,color:T.dim }}>+{game.shadowMission.xp}xp</span>
      </div>
    </div>
  );
}
FILEOF

cat > src/components/layout/BossBar.jsx << 'FILEOF'
import { T, FONTS } from "../../constants/theme.js";
export default function BossBar({ game }) {
  if (!game.boss) return null;
  return (
    <div style={{ padding:"10px 14px",background:"#120006",border:`1px solid ${T.danger}40`,borderRadius:8,marginBottom:10 }}>
      <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:3,color:T.danger,marginBottom:3 }}>WEEKLY CHALLENGE</div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
        <span style={{ fontFamily:FONTS.display,fontSize:15,color:T.text }}>{game.boss.name}</span>
        <span style={{ fontFamily:FONTS.ui,fontSize:10,color:T.danger }}>{game.bossHPLeft}/{game.boss.hp}</span>
      </div>
      <div style={{ height:4,background:T.bg3,borderRadius:2 }}>
        <div style={{ height:"100%",width:`${(game.bossHPLeft/game.boss.hp)*100}%`,background:`linear-gradient(90deg,${T.danger},#dd6060)`,borderRadius:2,transition:"width 0.5s ease" }}/>
      </div>
    </div>
  );
}
FILEOF

# ─────────────────────────────────────────────────────────────
# SCREENS
# ─────────────────────────────────────────────────────────────

cat > src/screens/AuthScreen.jsx << 'FILEOF'
import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase.js";
import { T, FONTS } from "../constants/theme.js";
import GlobalCSS from "../components/ui/GlobalCSS.jsx";

function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.4 + 0.1,
      dx: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      color: ["#c9a84c","#6b4fb0","#00cc88","#7a8aaa"][Math.floor(Math.random()*4)],
    }));
    let raf;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2,"0");
        ctx.fill();
        p.y -= p.speed;
        p.x += p.dx;
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
      });
      // Draw faint connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i+1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x-particles[j].x, particles[i].y-particles[j].y);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(201,168,76,${0.06*(1-dist/80)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    const resize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none" }}/>;
}

export default function AuthScreen({ onAuth }) {
  const [mode,setMode]         = useState("login");
  const [email,setEmail]       = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading]   = useState(false);
  const [error,setError]       = useState("");
  const inp = { width:"100%",background:"rgba(13,13,26,0.85)",border:`1px solid ${T.bg3}`,borderRadius:7,color:T.text,padding:"12px 14px",fontFamily:FONTS.ui,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:12 };

  async function submit() {
    if (!email.trim()||!password.trim()){ setError("Email and password required."); return; }
    setLoading(true); setError("");
    try {
      if (mode==="register") {
        const { data, error } = await supabase.auth.signUp({ email:email.trim(), password });
        if (error) throw error;
        if (data.session) onAuth(data.session.user);
        else setError("Check your email to confirm your account, then sign in.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email:email.trim(), password });
        if (error) throw error;
        onAuth(data.user);
      }
    } catch(e) { setError(e.message||"Authentication failed."); }
    setLoading(false);
  }

  return (
    <div style={{ fontFamily:FONTS.ui,background:T.bg0,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,boxSizing:"border-box",position:"relative" }}>
      <GlobalCSS accent="#c9a84c"/>
      <ParticleCanvas/>
      <div style={{ maxWidth:360,width:"100%",textAlign:"center",position:"relative",zIndex:1 }}>
        <div style={{ fontFamily:FONTS.display,fontSize:60,color:"#c9a84c",lineHeight:1,textShadow:"0 0 60px #c9a84c30",marginBottom:6,animation:"float 3s ease-in-out infinite" }}>HabitQuest</div>
        <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:5,color:T.dim,marginBottom:40 }}>BUILD BETTER HABITS</div>
        <div style={{ display:"flex",gap:0,marginBottom:24,border:`1px solid ${T.bg3}`,borderRadius:7,overflow:"hidden",background:"rgba(13,13,26,0.7)" }}>
          {["login","register"].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setError("");}} style={{ flex:1,padding:"10px",background:mode===m?"#c9a84c15":"transparent",border:"none",color:mode===m?"#c9a84c":T.dim,fontFamily:FONTS.ui,fontSize:9,letterSpacing:3,cursor:"pointer",transition:"all 0.2s",textTransform:"uppercase" }}>
              {m==="login"?"Sign In":"Register"}
            </button>
          ))}
        </div>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" style={inp}
          onFocus={e=>e.target.style.borderColor="#c9a84c"} onBlur={e=>e.target.style.borderColor=T.bg3}
          onKeyDown={e=>e.key==="Enter"&&submit()}/>
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" style={inp}
          onFocus={e=>e.target.style.borderColor="#c9a84c"} onBlur={e=>e.target.style.borderColor=T.bg3}
          onKeyDown={e=>e.key==="Enter"&&submit()}/>
        {error&&<div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.danger,marginBottom:12,textAlign:"left",lineHeight:1.5 }}>{error}</div>}
        <button onClick={submit} disabled={loading} style={{ width:"100%",padding:"14px",background:"rgba(13,13,26,0.8)",border:"1px solid #c9a84c50",borderRadius:7,color:"#c9a84c",fontFamily:FONTS.ui,fontSize:10,letterSpacing:4,cursor:loading?"not-allowed":"pointer",transition:"all 0.3s",boxShadow:"0 0 30px #c9a84c20",opacity:loading?0.6:1 }}>
          {loading?"...":(mode==="login"?"SIGN IN":"CREATE ACCOUNT")}
        </button>
        <div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.dim,marginTop:20,lineHeight:1.7 }}>
          {mode==="login"?"No account? ":"Already registered? "}
          <button onClick={()=>{setMode(mode==="login"?"register":"login");setError("");}} style={{ background:"none",border:"none",color:"#c9a84c",fontFamily:FONTS.ui,fontSize:9,cursor:"pointer",textDecoration:"underline" }}>
            {mode==="login"?"Register here":"Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
FILEOF

cat > src/screens/SetupScreen.jsx << 'FILEOF'
import { useState } from "react";
import { T, FONTS } from "../constants/theme.js";
import GlobalCSS from "../components/ui/GlobalCSS.jsx";

export default function SetupScreen({ onComplete, th }) {
  const [form,setForm] = useState({ name:"",age:"",occupation:"",bio:"" });
  const inp = { width:"100%",background:"rgba(13,13,26,0.9)",border:`1px solid ${T.bg3}`,borderRadius:7,color:T.text,padding:"12px 14px",fontFamily:FONTS.ui,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:12 };
  return (
    <div style={{ fontFamily:FONTS.ui,background:T.bg0,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,boxSizing:"border-box" }}>
      <GlobalCSS accent={th.accent}/>
      <div style={{ maxWidth:380,width:"100%",textAlign:"center" }}>
        <div style={{ fontFamily:FONTS.display,fontSize:64,color:th.accent,lineHeight:1,textShadow:`0 0 50px ${th.glow}`,marginBottom:4 }}>Welcome.</div>
        <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:5,color:T.dim,marginBottom:40 }}>SET UP YOUR PROFILE</div>
        <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:3,color:T.dim,marginBottom:16,textAlign:"left" }}>YOUR DETAILS</div>
        {[["name","Your name *"],["age","Age"],["occupation","Occupation / Role"]].map(([k,ph])=>(
          <input key={k} value={form[k]} onChange={e=>setForm(x=>({...x,[k]:e.target.value}))} placeholder={ph} style={inp}
            onFocus={e=>e.target.style.borderColor=th.accent} onBlur={e=>e.target.style.borderColor=T.bg3}
            onKeyDown={e=>e.key==="Enter"&&form.name.trim()&&onComplete(form)}/>
        ))}
        <textarea value={form.bio} onChange={e=>setForm(x=>({...x,bio:e.target.value}))} placeholder="A short bio — the AI uses this to personalise your experience"
          style={{ ...inp,height:80,resize:"none" }}
          onFocus={e=>e.target.style.borderColor=th.accent} onBlur={e=>e.target.style.borderColor=T.bg3}/>
        <button onClick={()=>form.name.trim()&&onComplete(form)} style={{ width:"100%",padding:"14px",background:"transparent",border:`1px solid ${th.accent}50`,borderRadius:7,color:th.accent,fontFamily:FONTS.ui,fontSize:10,letterSpacing:4,cursor:form.name.trim()?"pointer":"not-allowed",transition:"all 0.3s",marginTop:4,boxShadow:`0 0 30px ${th.glow}` }}
          onMouseEnter={e=>{if(form.name.trim())e.target.style.background=`${th.accent}12`;}} onMouseLeave={e=>{e.target.style.background="transparent";}}>
          GET STARTED
        </button>
      </div>
    </div>
  );
}
FILEOF

cat > src/screens/OnboardingModal.jsx << 'FILEOF'
import { useState } from "react";
import { T, FONTS, THEMES } from "../constants/theme.js";

const STEPS = [
  {
    title: "Welcome to HabitQuest",
    icon: "◈",
    body: `HabitQuest turns your daily habits and goals into a progression system — like a video game, but for real life.

Complete habits every day to earn XP and gems. Level up to unlock new class titles. Build streaks to grow your stats. The more consistent you are, the more powerful your character becomes.

Everything is tied to what you actually do — not what you plan to do.`,
  },
  {
    title: "Daily Habits",
    icon: "⚔",
    body: `Daily habits are the core of HabitQuest. These are tasks you want to complete every single day — things like working out, reading, or studying.

Each habit has a difficulty rank (F through S) and a stat type (Physical, Mental, Spiritual, Social, or Emotional). Completing it gives you XP and gems based on the difficulty.

Build a streak by completing the habit multiple days in a row. Streaks are tracked and rewarded. Miss a day and your streak resets — so consistency matters.

You can add your own habits, set their difficulty, and assign them to the right stat.`,
  },
  {
    title: "Stats & The Radar Chart",
    icon: "✦",
    body: `Your character has 5 stats: Physical, Mental, Spiritual, Social, and Emotional.

Each stat grows when you complete habits assigned to it. The radar chart on your Status screen shows your stat balance at a glance — a well-rounded chart means you're developing across all areas.

Stats don't just look good. They're used by the AI to identify your weaknesses and give you personalised recommendations. A lopsided chart means the AI will push you to address the neglected areas.`,
  },
  {
    title: "Quests",
    icon: "◆",
    body: `Quests are larger one-off goals — things that take more than a single day. Write a project proposal. Run a 5K. Finish a course.

Each quest has a difficulty rank and a stat type. Completing a quest gives significantly more XP and gems than a daily habit, and boosts your stat by 3 points.

You can complete up to 5 quests per day to prevent gaming the system. If you genuinely need more, you can buy extra quest slots in the shop using gems.

Quests can have notes attached — use these to add context, sub-tasks, or anything else relevant.`,
  },
  {
    title: "Skill Tree",
    icon: "🌿",
    body: `The skill tree lets you specialise your character. Every time you gain a level, you earn 1 Skill Point.

Spend Skill Points to unlock nodes in the skill tree — one branch per stat. Each branch has 4 tiers. Invest heavily in Physical and you'll unlock powerful physical-focused perks. Ignore a branch and it fades over time.

Cross-branch nodes unlock when you've invested in two different branches — these give unique bonuses that reward balanced development.

Access the skill tree from the SKILLS tab in the navigation.`,
  },
  {
    title: "The Penalty System",
    icon: "◌",
    body: `If you don't complete all your daily habits by midnight, you'll receive a penalty report the next morning.

Missed habits increase your Abyss Depth. The deeper you go, the harder recovery becomes. At depth 5+ you enter an active Abyss state shown at the top of the screen.

Every habit you complete reduces your Abyss Depth by 1. Completing a bonus mission reduces it faster.

The penalty system is designed to make consistency feel meaningful — not to punish you for having a bad day. Life happens. The goal is to get back on track quickly.`,
  },
  {
    title: "AI Coaching",
    icon: "◈",
    body: `HabitQuest has a built-in AI coach that analyses your actual data — your stats, streaks, habits, mood, and history.

Every morning you receive a personalised briefing: a short analysis of your recent performance with a focus area for the day. It also generates a bonus mission tailored to your specific weak points.

The System Terminal (in the AI tab — currently shown as ⚙ SYSTEM in the nav) lets you chat directly with the AI. Ask it to suggest quests, analyse your progress, or recommend what to focus on next.

The AI knows your character. The more you use HabitQuest, the more useful its advice becomes.`,
  },
  {
    title: "You're ready.",
    icon: "★",
    body: `That's everything you need to get started.

A few quick tips:
- Set your mood each morning in the Daily tab — it affects your XP multiplier for the day
- Check your AI briefing every morning on the Status screen
- Visit the Skills tab once you've levelled up a few times
- Use the shop to buy boosts when you've saved up enough gems

You can find this guide again any time in the Options screen.

Good luck.`,
  },
];

export default function OnboardingModal({ onClose, th }) {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast  = step === STEPS.length - 1;

  return (
    <div style={{ position:"fixed",inset:0,zIndex:2000,background:"rgba(6,6,15,0.92)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,boxSizing:"border-box" }}>
      <div style={{ maxWidth:440,width:"100%",background:"linear-gradient(135deg,#0d0d1a,#111120)",border:`1px solid ${th.accent}40`,borderRadius:14,overflow:"hidden",boxShadow:`0 0 60px ${th.glow}` }}>
        {/* Progress bar */}
        <div style={{ height:2,background:T.bg3 }}>
          <div style={{ height:"100%",width:`${((step+1)/STEPS.length)*100}%`,background:th.accent,transition:"width 0.4s ease" }}/>
        </div>

        <div style={{ padding:28 }}>
          {/* Step counter */}
          <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:3,color:T.dim,marginBottom:16 }}>
            STEP {step+1} OF {STEPS.length}
          </div>

          {/* Icon + title */}
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:20 }}>
            <div style={{ width:48,height:48,borderRadius:10,background:`${th.accent}15`,border:`1px solid ${th.accent}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:th.accent,flexShrink:0 }}>
              {current.icon}
            </div>
            <div style={{ fontFamily:FONTS.display,fontSize:22,color:T.textBright,lineHeight:1.2 }}>
              {current.title}
            </div>
          </div>

          {/* Body */}
          <div style={{ fontFamily:FONTS.ui,fontSize:12,color:T.silver,lineHeight:1.9,whiteSpace:"pre-wrap",marginBottom:28,maxHeight:260,overflowY:"auto" }}>
            {current.body}
          </div>

          {/* Navigation */}
          <div style={{ display:"flex",gap:10,alignItems:"center" }}>
            {step > 0 && (
              <button onClick={()=>setStep(s=>s-1)} style={{ padding:"10px 16px",background:"transparent",border:`1px solid ${T.bg3}`,borderRadius:6,color:T.dim,fontFamily:FONTS.ui,fontSize:9,letterSpacing:2,cursor:"pointer" }}>
                BACK
              </button>
            )}
            <div style={{ flex:1 }}/>
            {/* Dot indicators */}
            <div style={{ display:"flex",gap:5 }}>
              {STEPS.map((_,i)=>(
                <div key={i} onClick={()=>setStep(i)} style={{ width:i===step?16:6,height:6,borderRadius:3,background:i===step?th.accent:T.bg3,transition:"all 0.3s",cursor:"pointer" }}/>
              ))}
            </div>
            <div style={{ flex:1 }}/>
            <button onClick={isLast?onClose:()=>setStep(s=>s+1)} style={{ padding:"10px 20px",background:`${th.accent}15`,border:`1px solid ${th.accent}50`,borderRadius:6,color:th.accent,fontFamily:FONTS.ui,fontSize:9,letterSpacing:2,cursor:"pointer",transition:"all 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.background=`${th.accent}25`}
              onMouseLeave={e=>e.currentTarget.style.background=`${th.accent}15`}>
              {isLast?"LET'S GO":"NEXT"}
            </button>
          </div>

          {/* Skip */}
          {!isLast && (
            <div style={{ textAlign:"center",marginTop:14 }}>
              <button onClick={onClose} style={{ background:"none",border:"none",color:T.dim,fontFamily:FONTS.ui,fontSize:9,cursor:"pointer",letterSpacing:1 }}>
                Skip guide
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
FILEOF

cat > src/screens/StatusScreen.jsx << 'FILEOF'
import { useState } from "react";
import { T, FONTS, THEMES } from "../constants/theme.js";
import { STATS, STAT_COL, STAT_ICO, XP_PER_LEVEL, SHOP_ITEMS } from "../constants/gameData.js";
import { getLevel, getXPPct, getClass } from "../lib/gameLogic.js";
import { Card, SecTitle, Btn } from "../components/ui/index.jsx";
import RadarChart from "../components/ui/RadarChart.jsx";

export default function StatusScreen({ game, update, th, showToast, briefingLoading, generateBriefing, onSignOut }) {
  const [editChar,setEditChar] = useState(false);
  const [charForm,setCharForm] = useState(game.char);
  const level       = getLevel(game.xp);
  const cls         = getClass(level);
  const ownedTitles = (game.titles||[]).map(id=>SHOP_ITEMS.find(i=>i.id===id)).filter(Boolean);
  const inp = { width:"100%",background:T.bg2,border:`1px solid ${T.bg3}`,borderRadius:6,color:T.text,padding:"9px 12px",fontFamily:FONTS.ui,fontSize:12,outline:"none",marginBottom:8,boxSizing:"border-box" };

  return (
    <div>
      {/* Penalty message */}
      {game.penaltyMessage && (
        <Card style={{ marginBottom:14,border:`1px solid ${T.danger}40`,background:"#120000" }}>
          <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:3,color:T.danger,marginBottom:8 }}>YESTERDAY'S REPORT — {game.penaltyMessage.date}</div>
          <div style={{ fontFamily:FONTS.display,fontSize:14,color:T.text,marginBottom:6 }}>
            You missed {game.penaltyMessage.broken} habit{game.penaltyMessage.broken>1?"s":""} yesterday.
          </div>
          <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.silver,lineHeight:1.7,marginBottom:8 }}>
            Missed: {game.penaltyMessage.missed.join(", ")}<br/>
            Abyss depth increased by {game.penaltyMessage.abyssChange}. Complete your habits today to recover.
          </div>
          <button onClick={()=>update(s=>({...s,penaltyMessage:null}))} style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,padding:"6px 12px",background:"transparent",border:`1px solid ${T.danger}40`,borderRadius:4,color:T.danger,cursor:"pointer" }}>
            ACKNOWLEDGE
          </button>
        </Card>
      )}

      {/* AI Briefing */}
      {(game.briefing||briefingLoading)&&(
        <Card style={{ marginBottom:14,border:`1px solid ${T.sg}30` }}>
          <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:4,color:T.sg,marginBottom:10 }}>AI BRIEFING — {game.briefingDate||"TODAY"}</div>
          {briefingLoading
            ? <div style={{ fontFamily:FONTS.ui,fontSize:11,color:T.dim,animation:"pulse 1.5s ease-in-out infinite" }}>Analysing your data...</div>
            : <div style={{ fontFamily:FONTS.display,fontSize:15,color:T.text,lineHeight:1.8,whiteSpace:"pre-wrap" }}>{game.briefing}</div>
          }
        </Card>
      )}
      {!game.briefing&&!briefingLoading&&(
        <button onClick={generateBriefing} style={{ width:"100%",padding:"10px",marginBottom:14,background:"transparent",border:`1px dashed ${T.sg}40`,borderRadius:8,color:T.sg,fontFamily:FONTS.ui,fontSize:9,letterSpacing:3,cursor:"pointer" }}>
          GET TODAY'S BRIEFING
        </button>
      )}

      {/* Character card */}
      <Card style={{ marginBottom:14 }} accent={th.accent}>
        <div style={{ display:"flex",gap:14,alignItems:"flex-start" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ width:70,height:70,borderRadius:10,background:T.bg2,border:`1px solid ${th.accent}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,marginBottom:6,animation:game.aura?"auraAnim 2.5s linear infinite":"none" }}>{cls.icon}</div>
            <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:T.dim }}>LVL {level}</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:FONTS.display,fontSize:22,color:T.textBright }}>{game.char.name}</div>
            {game.title&&<div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:th.accent,marginTop:2 }}>"{game.title}"</div>}
            <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:T.silver,marginTop:4 }}>{cls.icon} {cls.name.toUpperCase()}</div>
            {game.char.occupation&&<div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim,marginTop:2 }}>{game.char.occupation}</div>}
            {game.char.bio&&<div style={{ fontFamily:FONTS.display,fontSize:13,color:T.silver,marginTop:6,lineHeight:1.7,fontStyle:"italic" }}>"{game.char.bio}"</div>}
          </div>
          <button onClick={()=>{setCharForm(game.char);setEditChar(!editChar);}} style={{ background:"none",border:`1px solid ${T.bg3}`,borderRadius:5,color:T.dim,padding:"4px 8px",cursor:"pointer",fontFamily:FONTS.ui,fontSize:10 }}>✎</button>
        </div>
        {editChar&&(
          <div style={{ marginTop:14,borderTop:`1px solid ${T.bg3}`,paddingTop:14 }}>
            {["name","age","occupation"].map(k=>(
              <input key={k} value={charForm[k]||""} onChange={e=>setCharForm(x=>({...x,[k]:e.target.value}))} placeholder={k} style={inp}/>
            ))}
            <textarea value={charForm.bio||""} onChange={e=>setCharForm(x=>({...x,bio:e.target.value}))} placeholder="bio" style={{ ...inp,height:64,resize:"none",marginBottom:10 }}/>
            {ownedTitles.length>0&&(
              <div style={{ marginBottom:10 }}>
                <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:T.dim,marginBottom:6 }}>TITLE</div>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                  <button onClick={()=>update(s=>({...s,title:null}))} style={{ fontFamily:FONTS.ui,fontSize:8,padding:"4px 10px",background:!game.title?T.bg3:"transparent",border:`1px solid ${T.bg3}`,borderRadius:4,color:T.silver,cursor:"pointer" }}>None</button>
                  {ownedTitles.map(t=>(
                    <button key={t.id} onClick={()=>update(s=>({...s,title:t.titleVal}))} style={{ fontFamily:FONTS.ui,fontSize:8,padding:"4px 10px",background:game.title===t.titleVal?T.bg3:"transparent",border:`1px solid ${th.accent}40`,borderRadius:4,color:th.accent,cursor:"pointer" }}>{t.titleVal}</button>
                  ))}
                </div>
              </div>
            )}
            <Btn onClick={()=>{update(s=>({...s,char:charForm}));setEditChar(false);showToast("Profile updated.","gold");}} full>SAVE</Btn>
          </div>
        )}
      </Card>

      {/* XP */}
      <Card style={{ marginBottom:14 }}>
        <SecTitle col={th.accent}>Experience & Progress</SecTitle>
        <div style={{ display:"flex",justifyContent:"space-between",fontFamily:FONTS.ui,fontSize:9,color:T.dim,marginBottom:6 }}>
          <span>Level {level} → {level+1}</span><span>{game.xp%XP_PER_LEVEL} / {XP_PER_LEVEL} XP</span>
        </div>
        <div style={{ height:3,background:T.bg3,borderRadius:2,marginBottom:8 }}>
          <div style={{ height:"100%",width:`${getXPPct(game.xp)*100}%`,background:`linear-gradient(90deg,${th.accent}50,${th.accent})`,borderRadius:2,transition:"width 0.6s ease" }}/>
        </div>
        <div style={{ display:"flex",gap:16,fontFamily:FONTS.ui,fontSize:8,letterSpacing:1,color:T.dim }}>
          <span>{game.xp} XP total</span>
          <span>{game.gems} gems</span>
          {(game.skillPoints||0)>0&&<span style={{ color:T.purple }}>{game.skillPoints} skill points available</span>}
        </div>
      </Card>

      {/* Radar */}
      <Card style={{ marginBottom:14 }}>
        <SecTitle col={th.accent}>Stat Overview</SecTitle>
        <div style={{ display:"flex",justifyContent:"center",marginBottom:14 }}><RadarChart stats={game.stats} accent={th.accent} size={210}/></div>
        {STATS.map(s=>(
          <div key={s} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:7 }}>
            <div style={{ fontFamily:FONTS.ui,fontSize:9,color:STAT_COL[s],width:18,textAlign:"center" }}>{STAT_ICO[s]}</div>
            <div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.silver,width:64,letterSpacing:1 }}>{s.toUpperCase()}</div>
            <div style={{ flex:1,height:3,background:T.bg3,borderRadius:2 }}>
              <div style={{ height:"100%",width:`${Math.min(game.stats[s]||1,100)}%`,background:STAT_COL[s],borderRadius:2,transition:"width 0.6s ease",boxShadow:`0 0 5px ${STAT_COL[s]}50` }}/>
            </div>
            <div style={{ fontFamily:FONTS.ui,fontSize:10,color:STAT_COL[s],width:22,textAlign:"right" }}>{game.stats[s]||1}</div>
          </div>
        ))}
      </Card>

      {game.abyssDepth>0&&(
        <Card style={{ marginBottom:14,border:"1px solid #6a000050" }}>
          <SecTitle col="#b03030">Recovery Needed</SecTitle>
          <div style={{ height:5,background:T.bg3,borderRadius:3 }}>
            <div style={{ height:"100%",width:`${(game.abyssDepth/20)*100}%`,background:"linear-gradient(90deg,#3a0000,#b03030)",borderRadius:3 }}/>
          </div>
          <div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.dim,marginTop:5 }}>Depth {game.abyssDepth}/20 — complete daily habits to recover</div>
        </Card>
      )}

      <div style={{ marginTop:8,paddingTop:14,borderTop:`1px solid ${T.bg3}` }}>
        <Btn onClick={onSignOut} danger full>SIGN OUT</Btn>
      </div>
    </div>
  );
}
FILEOF

cat > src/screens/DailyScreen.jsx << 'FILEOF'
import { useState } from "react";
import { T, FONTS } from "../constants/theme.js";
import { STATS, DIFF, STAT_COL } from "../constants/gameData.js";
import { Card, Btn, DiffTag } from "../components/ui/index.jsx";

export default function DailyScreen({ game, update, th, today, todayDone, doneCount, allDone, completeDaily, showToast }) {
  const [adding,setAdding]       = useState(false);
  const [dailyForm,setDailyForm] = useState({ name:"",type:"Physical",diff:"D-Rank" });
  const sel = { flex:1,background:T.bg2,border:`1px solid ${T.bg3}`,borderRadius:5,color:T.text,padding:"8px",fontFamily:FONTS.ui,fontSize:10,outline:"none" };

  function setMood(m) {
    if (game.lastMoodDate===today){ showToast("Mood already set for today.","info"); return; }
    update(s=>({...s,mood:m,lastMoodDate:today}));
    showToast(m==="high"?"High energy — +25% XP today.":m==="low"?"Low energy noted — reduced XP penalty.":"Steady day. Normal XP rates.","gold");
  }

  function addDaily() {
    if (!dailyForm.name.trim()) return;
    update(s=>({...s,daily:[...s.daily,{id:Date.now(),name:dailyForm.name.trim(),type:dailyForm.type,diff:dailyForm.diff,streak:0,best:0}]}));
    setDailyForm({name:"",type:"Physical",diff:"D-Rank"});
    setAdding(false);
    showToast("Habit added.","gold");
  }

  return (
    <div>
      {game.lastMoodDate!==today&&(
        <Card style={{ marginBottom:12 }}>
          <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:3,color:T.dim,marginBottom:10 }}>HOW ARE YOU FEELING TODAY?</div>
          <div style={{ display:"flex",gap:8 }}>
            {[{k:"low",l:"Low energy",s:"−15% XP"},{k:"normal",l:"Steady",s:"Normal XP"},{k:"high",l:"High energy",s:"+25% XP"}].map(m=>(
              <button key={m.k} onClick={()=>setMood(m.k)} style={{ flex:1,padding:"10px 6px",background:"transparent",border:`1px solid ${T.bg3}`,borderRadius:6,color:T.silver,fontFamily:FONTS.ui,fontSize:9,cursor:"pointer",transition:"all 0.2s",display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=th.accent;e.currentTarget.style.color=th.accent;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=T.bg3;e.currentTarget.style.color=T.silver;}}>
                <span>{m.l}</span><span style={{ fontSize:8,color:T.dim }}>{m.s}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      <Card style={{ marginBottom:12,border:`1px solid ${allDone?"#27a06040":T.bg3}`,background:allDone?"#001a0a":undefined }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:FONTS.display,fontSize:16,color:allDone?"#40d090":T.text }}>
              {allDone?"All habits completed for today.":`${doneCount} / ${game.daily?.length||0} completed`}
            </div>
            <div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.dim,marginTop:2 }}>
              {game.mood==="high"?"⚡ +25% XP active":game.mood==="low"?"−15% XP active":""}
            </div>
          </div>
          {(game.daily?.length||0)>0&&<div style={{ fontFamily:FONTS.display,fontSize:26,color:th.accent }}>{Math.round((doneCount/(game.daily?.length||1))*100)}%</div>}
        </div>
        {(game.daily?.length||0)>0&&(
          <div style={{ marginTop:10,height:2,background:T.bg3,borderRadius:1 }}>
            <div style={{ height:"100%",width:`${(doneCount/(game.daily?.length||1))*100}%`,background:allDone?"#27a060":th.accent,borderRadius:1,transition:"width 0.4s ease" }}/>
          </div>
        )}
      </Card>

      {game.daily?.map(q=>{
        const done=!!todayDone[q.id],cfg=DIFF[q.diff];
        return (
          <div key={q.id} onClick={()=>completeDaily(q.id)} style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 16px",marginBottom:8,background:done?"#001a0a":T.bg1,border:`1px solid ${done?"#27a06030":T.bg3}`,borderRadius:8,cursor:"pointer",transition:"all 0.2s",userSelect:"none" }}>
            <div style={{ width:18,height:18,borderRadius:3,border:`1px solid ${done?"#27a060":"#2a3050"}`,background:done?"#27a06015":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              {done&&<span style={{ color:"#27a060",fontSize:11 }}>✓</span>}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap" }}>
                <span style={{ fontFamily:FONTS.display,fontSize:15,color:done?"#40d090":T.text,textDecoration:done?"line-through":"none",textDecorationColor:"#27a06060" }}>{q.name}</span>
                <DiffTag diff={q.diff}/>
              </div>
              <div style={{ fontFamily:FONTS.ui,fontSize:8,color:T.dim }}>
                <span style={{ color:STAT_COL[q.type] }}>{q.type.toUpperCase()}</span>{" · +"}{ cfg.xp} XP · +{cfg.gems} gems
              </div>
            </div>
            <div style={{ textAlign:"right",flexShrink:0 }}>
              <div style={{ fontFamily:FONTS.display,fontSize:13,color:q.streak>=14?T.gold:q.streak>=7?"#b03030":T.dim }}>{q.streak>0?`${q.streak}d`:"—"}</div>
              {q.best>0&&<div style={{ fontFamily:FONTS.ui,fontSize:7,color:T.dim }}>best {q.best}</div>}
            </div>
            <button onClick={e=>{e.stopPropagation();update(s=>({...s,daily:s.daily.filter(d=>d.id!==q.id)}));}} style={{ background:"none",border:"none",color:T.dim,cursor:"pointer",fontSize:11,padding:4,flexShrink:0 }}
              onMouseEnter={e=>e.target.style.color=T.danger} onMouseLeave={e=>e.target.style.color=T.dim}>✕</button>
          </div>
        );
      })}

      {adding?(
        <Card style={{ marginTop:8 }}>
          <input autoFocus value={dailyForm.name} onChange={e=>setDailyForm(x=>({...x,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addDaily()} placeholder="Habit name..." style={{ width:"100%",background:T.bg2,border:`1px solid ${T.bg3}`,borderRadius:5,color:T.text,padding:"9px 12px",fontFamily:FONTS.ui,fontSize:12,outline:"none",boxSizing:"border-box",marginBottom:10 }}/>
          <div style={{ display:"flex",gap:8,marginBottom:10 }}>
            <select value={dailyForm.type} onChange={e=>setDailyForm(x=>({...x,type:e.target.value}))} style={sel}>{STATS.map(s=><option key={s}>{s}</option>)}<option value="General">General</option></select>
            <select value={dailyForm.diff} onChange={e=>setDailyForm(x=>({...x,diff:e.target.value}))} style={sel}>{Object.keys(DIFF).map(d=><option key={d}>{d}</option>)}</select>
          </div>
          <div style={{ display:"flex",gap:8 }}><Btn full onClick={addDaily}>ADD HABIT</Btn><Btn danger onClick={()=>setAdding(false)}>✕</Btn></div>
        </Card>
      ):(
        <button onClick={()=>setAdding(true)} style={{ width:"100%",marginTop:8,padding:"12px",background:"transparent",border:`1px dashed ${T.bg3}`,borderRadius:8,color:T.dim,fontFamily:FONTS.ui,fontSize:9,letterSpacing:3,cursor:"pointer",transition:"all 0.2s" }}
          onMouseEnter={e=>{e.target.style.borderColor=th.accent;e.target.style.color=th.accent;}} onMouseLeave={e=>{e.target.style.borderColor=T.bg3;e.target.style.color=T.dim;}}>
          + ADD DAILY HABIT
        </button>
      )}
    </div>
  );
}
FILEOF

cat > src/screens/QuestsScreen.jsx << 'FILEOF'
import { useState } from "react";
import { T, FONTS } from "../constants/theme.js";
import { STATS, DIFF, STAT_COL, STAT_ICO, QUEST_DAILY_LIMIT } from "../constants/gameData.js";
import { getQuestLimit } from "../lib/gameLogic.js";
import { Card, Btn, DiffTag } from "../components/ui/index.jsx";

export default function QuestsScreen({ game, update, th, completeQuest, showToast }) {
  const [filter,setFilter]       = useState("active");
  const [adding,setAdding]       = useState(false);
  const [questForm,setQuestForm] = useState({ name:"",type:"Physical",diff:"C-Rank",notes:"" });
  const [expanded,setExpanded]   = useState(null);

  const shown    = game.quests?.filter(q=>filter==="active"?!q.done:q.done)||[];
  const limit    = getQuestLimit(game);
  const todayUsed= game.questCompletedToday||0;
  const sel = { flex:1,background:T.bg2,border:`1px solid ${T.bg3}`,borderRadius:5,color:T.text,padding:"8px",fontFamily:FONTS.ui,fontSize:10,outline:"none" };

  function addQuest() {
    if (!questForm.name.trim()) return;
    const cfg = DIFF[questForm.diff];
    update(s=>({...s,quests:[...(s.quests||[]),{ id:Date.now(),name:questForm.name.trim(),type:questForm.type,diff:questForm.diff,done:false,xp:cfg.xp*3,gems:cfg.gems*3,notes:questForm.notes.trim()||null }]}));
    setQuestForm({name:"",type:"Physical",diff:"C-Rank",notes:""});
    setAdding(false);
    showToast("Quest added.","gold");
  }

  return (
    <div>
      {/* Daily limit indicator */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,padding:"8px 14px",background:T.bg1,border:`1px solid ${T.bg3}`,borderRadius:8 }}>
        <div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.dim }}>Quests completed today</div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ display:"flex",gap:3 }}>
            {Array.from({length:limit}).map((_,i)=>(
              <div key={i} style={{ width:10,height:10,borderRadius:2,background:i<todayUsed?T.gold:T.bg3,transition:"background 0.3s" }}/>
            ))}
          </div>
          <span style={{ fontFamily:FONTS.ui,fontSize:9,color:todayUsed>=limit?T.danger:T.silver }}>{todayUsed}/{limit}</span>
        </div>
      </div>

      <div style={{ display:"flex",gap:8,marginBottom:12 }}>
        {["active","completed"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ flex:1,padding:"8px",background:"transparent",border:`1px solid ${filter===f?th.accent:T.bg3}`,borderRadius:5,color:filter===f?th.accent:T.dim,fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,cursor:"pointer",transition:"all 0.2s" }}>
            {f.toUpperCase()} ({(game.quests?.filter(q=>f==="active"?!q.done:q.done)||[]).length})
          </button>
        ))}
      </div>

      {shown.length===0&&(
        <div style={{ textAlign:"center",padding:"48px 0",fontFamily:FONTS.display,fontSize:16,color:T.dim,lineHeight:2 }}>
          {filter==="active"?"No active quests.\nAdd your first goal below.":"No completed quests yet."}
        </div>
      )}

      {shown.map(q=>{
        const cfg=DIFF[q.diff], isExpanded=expanded===q.id;
        return (
          <Card key={q.id} style={{ marginBottom:10,border:`1px solid ${q.done?"#27a06030":cfg.col+"30"}` }}>
            <div style={{ display:"flex",gap:10,alignItems:"flex-start" }}>
              <div style={{ fontSize:14,color:STAT_COL[q.type]||T.dim,marginTop:3,flexShrink:0 }}>{q.done?"✓":STAT_ICO[q.type]}</div>
              <div style={{ flex:1,cursor:q.notes?"pointer":"default" }} onClick={()=>q.notes&&setExpanded(isExpanded?null:q.id)}>
                <div style={{ display:"flex",gap:7,flexWrap:"wrap",alignItems:"center",marginBottom:5 }}>
                  <span style={{ fontFamily:FONTS.display,fontSize:16,color:q.done?"#40d090":T.text,textDecoration:q.done?"line-through":"none" }}>{q.name}</span>
                  <DiffTag diff={q.diff}/>
                  {q.notes&&<span style={{ fontFamily:FONTS.ui,fontSize:7,color:T.dim,border:`1px solid ${T.bg3}`,padding:"1px 5px",borderRadius:3 }}>HAS NOTES</span>}
                </div>
                <div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.dim }}>
                  <span style={{ color:STAT_COL[q.type] }}>{q.type}</span>{" · +"}{ q.xp} XP · +{q.gems} gems · +3 {q.type}
                </div>
                {isExpanded&&q.notes&&(
                  <div style={{ marginTop:8,padding:"8px 10px",background:T.bg2,borderRadius:5,fontFamily:FONTS.ui,fontSize:10,color:T.silver,lineHeight:1.7,whiteSpace:"pre-wrap" }}>
                    {q.notes}
                  </div>
                )}
              </div>
              <button onClick={()=>update(s=>({...s,quests:s.quests.filter(x=>x.id!==q.id)}))} style={{ background:"none",border:"none",color:T.dim,cursor:"pointer",fontSize:11 }}
                onMouseEnter={e=>e.target.style.color=T.danger} onMouseLeave={e=>e.target.style.color=T.dim}>✕</button>
            </div>
            {!q.done&&(
              <button onClick={()=>completeQuest(q.id)} style={{ marginTop:10,width:"100%",padding:"9px",background:`${cfg.col}10`,border:`1px solid ${cfg.col}40`,borderRadius:5,color:cfg.col,fontFamily:FONTS.ui,fontSize:9,letterSpacing:2,cursor:todayUsed>=limit?"not-allowed":"pointer",transition:"background 0.2s",opacity:todayUsed>=limit?0.5:1 }}
                onMouseEnter={e=>{if(todayUsed<limit)e.currentTarget.style.background=`${cfg.col}20`;}}
                onMouseLeave={e=>{e.currentTarget.style.background=`${cfg.col}10`;}}>
                {todayUsed>=limit?`LIMIT REACHED (${limit}/day) — Buy extra slot in shop`:"MARK COMPLETE"}
              </button>
            )}
          </Card>
        );
      })}

      {adding?(
        <Card style={{ marginTop:8 }}>
          <input autoFocus value={questForm.name} onChange={e=>setQuestForm(x=>({...x,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addQuest()} placeholder="Quest name..."
            style={{ width:"100%",background:T.bg2,border:`1px solid ${T.bg3}`,borderRadius:5,color:T.text,padding:"9px 12px",fontFamily:FONTS.ui,fontSize:12,outline:"none",boxSizing:"border-box",marginBottom:10 }}/>
          <div style={{ display:"flex",gap:8,marginBottom:10 }}>
            <select value={questForm.type} onChange={e=>setQuestForm(x=>({...x,type:e.target.value}))} style={sel}>{STATS.map(s=><option key={s}>{s}</option>)}</select>
            <select value={questForm.diff} onChange={e=>setQuestForm(x=>({...x,diff:e.target.value}))} style={sel}>{Object.keys(DIFF).map(d=><option key={d}>{d}</option>)}</select>
          </div>
          <textarea value={questForm.notes} onChange={e=>setQuestForm(x=>({...x,notes:e.target.value}))} placeholder="Notes (optional) — sub-tasks, context, links..."
            style={{ width:"100%",background:T.bg2,border:`1px solid ${T.bg3}`,borderRadius:5,color:T.text,padding:"9px 12px",fontFamily:FONTS.ui,fontSize:11,outline:"none",boxSizing:"border-box",marginBottom:10,height:64,resize:"none" }}/>
          <div style={{ display:"flex",gap:8 }}><Btn full onClick={addQuest}>ADD QUEST</Btn><Btn danger onClick={()=>setAdding(false)}>✕</Btn></div>
        </Card>
      ):(
        <button onClick={()=>setAdding(true)} style={{ width:"100%",marginTop:8,padding:"12px",background:"transparent",border:`1px dashed ${T.bg3}`,borderRadius:8,color:T.dim,fontFamily:FONTS.ui,fontSize:9,letterSpacing:3,cursor:"pointer",transition:"all 0.2s" }}
          onMouseEnter={e=>{e.target.style.borderColor=th.accent;e.target.style.color=th.accent;}} onMouseLeave={e=>{e.target.style.borderColor=T.bg3;e.target.style.color=T.dim;}}>
          + ADD QUEST
        </button>
      )}
    </div>
  );
}
FILEOF

cat > src/screens/SkillsScreen.jsx << 'FILEOF'
import { useState } from "react";
import { T, FONTS, THEMES } from "../constants/theme.js";
import { SKILL_TREE, STATS, STAT_COL, STAT_ICO } from "../constants/gameData.js";
import { canUnlockNode, getUnlockedNodes } from "../lib/gameLogic.js";
import { Card, SecTitle } from "../components/ui/index.jsx";

const TIER_LABELS = ["","Tier 1","Tier 2","Tier 3","Tier 4"];

function NodeCard({ node, unlocked, canUnlock, onUnlock, th }) {
  const [hov,setHov] = useState(false);
  const borderCol = unlocked ? T.success : canUnlock ? th.accent : T.bg3;
  const opacity   = unlocked ? 1 : canUnlock ? 1 : 0.45;
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ padding:"10px 12px",background:unlocked?`${T.success}10`:hov&&canUnlock?`${th.accent}08`:T.bg2,border:`1px solid ${borderCol}${unlocked?"60":"40"}`,borderRadius:8,transition:"all 0.2s",opacity,cursor:canUnlock&&!unlocked?"pointer":"default" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4 }}>
        <span style={{ fontFamily:FONTS.display,fontSize:14,color:unlocked?"#40d090":T.text }}>{node.name}</span>
        <span style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:1,color:unlocked?T.success:canUnlock?th.accent:T.dim,border:`1px solid ${unlocked?T.success+"40":canUnlock?th.accent+"40":T.bg3}`,padding:"2px 6px",borderRadius:3 }}>
          {unlocked?"UNLOCKED":`${node.cost} SP`}
        </span>
      </div>
      <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.silver,lineHeight:1.6,marginBottom:canUnlock&&!unlocked?8:0 }}>
        {node.desc}
      </div>
      {canUnlock&&!unlocked&&(
        <button onClick={onUnlock} style={{ width:"100%",padding:"7px",background:`${th.accent}15`,border:`1px solid ${th.accent}40`,borderRadius:5,color:th.accent,fontFamily:FONTS.ui,fontSize:9,letterSpacing:2,cursor:"pointer",transition:"background 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.background=`${th.accent}25`}
          onMouseLeave={e=>e.currentTarget.style.background=`${th.accent}15`}>
          UNLOCK — {node.cost} SP
        </button>
      )}
    </div>
  );
}

export default function SkillsScreen({ game, update, th, showToast }) {
  const [activeBranch, setActiveBranch] = useState("Physical");
  const unlocked = game.unlockedNodes||[];
  const sp       = game.skillPoints||0;

  function unlock(nodeId) {
    const allNodes = Object.values(SKILL_TREE).flat();
    const node     = allNodes.find(n=>n.id===nodeId);
    if (!node) return;
    if (!canUnlockNode(node,unlocked,sp)){ showToast("Cannot unlock this node yet.","danger"); return; }
    update(s=>({
      ...s,
      skillPoints: (s.skillPoints||0)-node.cost,
      unlockedNodes: [...(s.unlockedNodes||[]),nodeId],
    }));
    showToast(`${node.name} unlocked!`,"success");
  }

  const branchNodes = SKILL_TREE[activeBranch]||[];
  const crossNodes  = SKILL_TREE.Cross||[];

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom:14,border:`1px solid ${T.purple}40` }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:FONTS.display,fontSize:18,color:T.textBright,marginBottom:4 }}>Skill Tree</div>
            <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim }}>Spend skill points to unlock specialisations. Earn 1 point per level.</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:FONTS.ui,fontSize:22,color:T.purple }}>{sp}</div>
            <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:T.dim }}>SKILL POINTS</div>
          </div>
        </div>
        {sp>0&&<div style={{ marginTop:10,fontFamily:FONTS.ui,fontSize:10,color:T.purple }}>You have {sp} unspent skill point{sp>1?"s":""}. Select a branch to spend them.</div>}
      </Card>

      {/* Branch tabs */}
      <div style={{ display:"flex",gap:5,marginBottom:14,flexWrap:"wrap" }}>
        {STATS.map(s=>{
          const branchUnlocked = SKILL_TREE[s].filter(n=>unlocked.includes(n.id)).length;
          const isActive = activeBranch===s;
          return (
            <button key={s} onClick={()=>setActiveBranch(s)} style={{ flex:1,minWidth:60,padding:"8px 4px",background:isActive?`${STAT_COL[s]}18`:"transparent",border:`1px solid ${isActive?STAT_COL[s]:T.bg3}`,borderRadius:6,color:isActive?STAT_COL[s]:T.dim,fontFamily:FONTS.ui,fontSize:8,letterSpacing:1,cursor:"pointer",transition:"all 0.2s",display:"flex",flexDirection:"column",alignItems:"center",gap:2 }}>
              <span style={{ fontSize:14 }}>{STAT_ICO[s]}</span>
              <span>{s.toUpperCase()}</span>
              <span style={{ fontSize:7,color:T.dim }}>{branchUnlocked}/4</span>
            </button>
          );
        })}
      </div>

      {/* Branch nodes */}
      <div style={{ marginBottom:14 }}>
        <SecTitle col={STAT_COL[activeBranch]}>{activeBranch} Branch</SecTitle>
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {branchNodes.map((node,i)=>{
            const isUnlocked = unlocked.includes(node.id);
            const canU       = canUnlockNode(node,unlocked,sp);
            // Draw connector line between tiers
            return (
              <div key={node.id}>
                {i>0&&(
                  <div style={{ display:"flex",justifyContent:"center",margin:"2px 0" }}>
                    <div style={{ width:1,height:16,background:unlocked.includes(branchNodes[i-1].id)?STAT_COL[activeBranch]:T.bg3,transition:"background 0.3s" }}/>
                  </div>
                )}
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <div style={{ fontFamily:FONTS.ui,fontSize:7,letterSpacing:1,color:T.dim,width:40,flexShrink:0,textAlign:"right" }}>{TIER_LABELS[node.tier]}</div>
                  <div style={{ flex:1 }}>
                    <NodeCard node={node} unlocked={isUnlocked} canUnlock={canU} onUnlock={()=>unlock(node.id)} th={th}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross-branch nodes */}
      <div>
        <SecTitle col={T.gold}>Cross-Branch Unlocks</SecTitle>
        <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim,marginBottom:12,lineHeight:1.6 }}>
          These unlock when you've invested in two different branches. They reward balanced development.
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {crossNodes.map(node=>{
            const isUnlocked = unlocked.includes(node.id);
            const canU       = canUnlockNode(node,unlocked,sp);
            const reqLabels  = node.requires.map(r=>{
              const found = Object.values(SKILL_TREE).flat().find(n=>n.id===r);
              return found?.name||r;
            });
            return (
              <div key={node.id}>
                <div style={{ fontFamily:FONTS.ui,fontSize:8,color:T.dim,marginBottom:4,letterSpacing:1 }}>
                  Requires: {reqLabels.join(" + ")}
                </div>
                <NodeCard node={node} unlocked={isUnlocked} canUnlock={canU} onUnlock={()=>unlock(node.id)} th={th}/>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
FILEOF

cat > src/screens/ShopScreen.jsx << 'FILEOF'
import { useState } from "react";
import { T, FONTS, THEMES, AESTHETICS } from "../constants/theme.js";
import { SHOP_ITEMS } from "../constants/gameData.js";
import { Card } from "../components/ui/index.jsx";

function AestheticPreview({ aesthetic }) {
  const p = aesthetic.preview;
  return (
    <div style={{ borderRadius:6,overflow:"hidden",border:`1px solid ${p.accent}30`,marginBottom:8 }}>
      <div style={{ background:p.bg,padding:"8px 10px",display:"flex",flexDirection:"column",gap:4 }}>
        <div style={{ background:p.card,borderRadius:4,padding:"6px 8px",border:`1px solid ${p.accent}20` }}>
          <div style={{ fontFamily:"'DM Mono',monospace",fontSize:8,color:p.accent,letterSpacing:2 }}>PREVIEW</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:p.text,marginTop:2 }}>{aesthetic.name}</div>
          <div style={{ height:2,background:`${p.accent}30`,borderRadius:1,marginTop:4 }}>
            <div style={{ height:"100%",width:"60%",background:p.accent,borderRadius:1 }}/>
          </div>
        </div>
        <div style={{ display:"flex",gap:4 }}>
          {[40,70,55].map((w,i)=>(
            <div key={i} style={{ height:4,borderRadius:2,background:`${p.accent}${["80","40","60"][i]}`,flex:w }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ShopScreen({ game, th, buyItem, showToast }) {
  const [shopTab,setShopTab]           = useState("temp");
  const [previewAesthetic,setPreview]  = useState(null);
  const items = SHOP_ITEMS.filter(i=>i.type===shopTab);

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:T.silver }}>Spend gems on upgrades</div>
        <div style={{ fontFamily:"'DM Mono',monospace",fontSize:13,color:th.accent }}>◈ {game.gems}</div>
      </div>

      <div style={{ display:"flex",gap:5,marginBottom:12,flexWrap:"wrap" }}>
        {[{id:"temp",l:"BOOSTS"},{id:"perm",l:"PERMANENT"},{id:"theme",l:"THEMES"},{id:"aesthetic",l:"AESTHETICS"},{id:"cosm",l:"COSMETIC"}].map(t=>(
          <button key={t.id} onClick={()=>setShopTab(t.id)} style={{ flex:1,minWidth:60,padding:"7px 4px",background:shopTab===t.id?`${th.accent}15`:"transparent",border:`1px solid ${shopTab===t.id?th.accent:T.bg3}`,borderRadius:5,color:shopTab===t.id?th.accent:T.dim,fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:1,cursor:"pointer",transition:"all 0.2s" }}>
            {t.l}
          </button>
        ))}
      </div>

      {shopTab==="aesthetic"&&(
        <div style={{ fontFamily:"'DM Mono',monospace",fontSize:9,color:T.dim,lineHeight:1.6,marginBottom:12,padding:"10px 12px",background:T.bg1,border:`1px solid ${T.bg3}`,borderRadius:7 }}>
          Aesthetics change the entire look of the app — backgrounds, card styles, and colour palette. Tap "Preview" before buying.
        </div>
      )}

      {items.map(item=>{
        const owned  = game.perms?.find(p=>p.id===item.id)||(["cosm","theme","aesthetic"].includes(item.type)&&game.cosmetics?.includes(item.id));
        const active = game.actives?.find(p=>p.id===item.id);
        const can    = game.gems>=item.cost;
        const aesthetic = item.aesthetic ? AESTHETICS[item.aesthetic] : null;
        const isPreviewOpen = previewAesthetic===item.id;
        return (
          <Card key={item.id} style={{ marginBottom:10,border:`1px solid ${owned?"#27a06030":can?T.bg3:T.bg2}`,opacity:!owned&&!can?0.5:1 }}>
            <div style={{ display:"flex",gap:12,alignItems:"flex-start" }}>
              <div style={{ fontSize:20,color:th.accent,flexShrink:0,marginTop:2 }}>{item.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:owned?"#40d090":T.text }}>{item.name}</span>
                  {owned&&<span style={{ fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:2,color:"#27a060",border:"1px solid #27a06040",padding:"1px 5px",borderRadius:3 }}>OWNED</span>}
                  {active&&!owned&&<span style={{ fontFamily:"'DM Mono',monospace",fontSize:7,color:th.accent,border:`1px solid ${th.accent}40`,padding:"1px 5px",borderRadius:3 }}>×{active.left}</span>}
                </div>
                <div style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:T.dim,lineHeight:1.6 }}>{item.desc}</div>
                {item.effect&&<div style={{ fontFamily:"'DM Mono',monospace",fontSize:9,color:th.accent,marginTop:3 }}>{item.effect}</div>}
              </div>
            </div>

            {/* Aesthetic preview toggle */}
            {aesthetic&&(
              <div style={{ marginTop:10 }}>
                <button onClick={()=>setPreview(isPreviewOpen?null:item.id)} style={{ fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:2,padding:"5px 10px",background:"transparent",border:`1px solid ${T.bg3}`,borderRadius:4,color:T.dim,cursor:"pointer",marginBottom:isPreviewOpen?8:0 }}>
                  {isPreviewOpen?"HIDE PREVIEW":"PREVIEW"}
                </button>
                {isPreviewOpen&&<AestheticPreview aesthetic={aesthetic}/>}
              </div>
            )}

            {!owned&&(
              <button onClick={()=>buyItem(item)} style={{ marginTop:10,width:"100%",padding:"9px",background:can?`${th.accent}10`:"transparent",border:`1px solid ${can?th.accent+"40":T.bg3}`,borderRadius:5,color:can?th.accent:T.dim,fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,cursor:can?"pointer":"not-allowed",transition:"background 0.2s" }}
                onMouseEnter={e=>{if(can)e.currentTarget.style.background=`${th.accent}20`;}}
                onMouseLeave={e=>{if(can)e.currentTarget.style.background=`${th.accent}10`;}}>
                {can?`◈ ${item.cost} — BUY`:`◈ ${item.cost} — NOT ENOUGH GEMS`}
              </button>
            )}
          </Card>
        );
      })}
    </div>
  );
}
FILEOF

cat > src/screens/SystemScreen.jsx << 'FILEOF'
import { useState, useRef, useEffect } from "react";
import { T, FONTS } from "../constants/theme.js";
import { DIFF, STATS } from "../constants/gameData.js";
import { getLevel, getClass } from "../lib/gameLogic.js";
import { buildCharContext, buildSystemPrompt, callAIProxy, parseSuggestedQuests } from "../lib/ai.js";
import { Card, SecTitle, AIStatus } from "../components/ui/index.jsx";

const QUICK = [
  "What should I focus on this week?",
  "Suggest 2 quests based on my weaknesses",
  "Analyse my progress and what I'm neglecting",
  "Generate a personalised bonus mission for me",
  "Are my daily habits ranked correctly?",
];

export default function SystemScreen({ game, update, th, showToast, aiStatus, setAiStatus, generateBriefing, briefingLoading }) {
  const [messages,setChatMessages] = useState([
    { role:"system", text:`AI Coach connected.\nProfile: ${game.char?.name||"Unknown"} — ${getClass(getLevel(game.xp)).name} — Level ${getLevel(game.xp)}\n\nAsk me anything about your progress.` },
  ]);
  const [input,setInput]         = useState("");
  const [loading,setLoading]     = useState(false);
  const [history,setHistory]     = useState([]);
  const bottomRef = useRef(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  async function send() {
    if (!input.trim()||loading) return;
    const userMsg=input.trim(); setInput("");
    setChatMessages(m=>[...m,{role:"user",text:userMsg}]);
    setLoading(true); setAiStatus("working");
    try {
      const ctx=buildCharContext(game),sys=buildSystemPrompt(ctx);
      const reply=await callAIProxy(sys,userMsg,history.slice(-8));
      const parsedQuests=parseSuggestedQuests(reply);
      setChatMessages(m=>[...m,{role:"system",text:reply,parsedQuests}]);
      setHistory(h=>[...h,{role:"user",text:userMsg},{role:"model",text:reply}]);
      setAiStatus("ok");
    } catch(e) {
      setChatMessages(m=>[...m,{role:"system",text:`Connection failed.\n${e.message}`,error:true}]);
      setAiStatus("error");
    }
    setLoading(false);
  }

  function addSuggestedQuest(q) {
    const diff=Object.keys(DIFF).find(d=>d.toLowerCase()===q.diff.toLowerCase().trim())||"C-Rank";
    const type=STATS.find(s=>s.toLowerCase()===q.type.toLowerCase().trim())||"Physical";
    const cfg=DIFF[diff];
    update(s=>({...s,quests:[...(s.quests||[]),{id:Date.now(),name:q.name,type,diff,done:false,xp:cfg.xp*3,gems:cfg.gems*3}]}));
    showToast(`Quest added: ${q.name}`,"success");
  }

  return (
    <div>
      <Card style={{ marginBottom:14,border:`1px solid ${T.sg}30` }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
          <SecTitle col={T.sg}>AI Coach</SecTitle>
          <AIStatus status={aiStatus}/>
        </div>
        <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim,lineHeight:1.7 }}>
          Powered by Gemini AI via a secure server proxy. Your API key is never exposed to the browser. The AI has access to your full profile, stats, and history.
        </div>
        <button onClick={generateBriefing} disabled={briefingLoading} style={{ marginTop:10,width:"100%",padding:"9px",background:"transparent",border:`1px solid ${T.sg}40`,borderRadius:5,color:briefingLoading?T.dim:T.sg,fontFamily:FONTS.ui,fontSize:9,letterSpacing:3,cursor:briefingLoading?"not-allowed":"pointer" }}>
          {briefingLoading?"GENERATING...":"REGENERATE TODAY'S BRIEFING"}
        </button>
      </Card>

      <Card style={{ padding:0,overflow:"hidden" }}>
        <div style={{ padding:"10px 14px",borderBottom:`1px solid ${T.bg3}`,fontFamily:FONTS.ui,fontSize:8,letterSpacing:4,color:T.sg,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <span>AI COACH CHAT</span>
          <AIStatus status={loading?"working":aiStatus}/>
        </div>
        <div style={{ height:340,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:12 }}>
          {messages.map((m,i)=>(
            <div key={i} style={{ display:"flex",flexDirection:"column",gap:6,alignItems:m.role==="user"?"flex-end":"flex-start" }}>
              <div style={{ maxWidth:"88%",padding:"10px 14px",borderRadius:8,background:m.role==="user"?`${th.accent}15`:m.error?"#1a0000":T.bg2,border:`1px solid ${m.role==="user"?th.accent+"40":m.error?T.danger+"40":T.bg3}`,fontFamily:m.role==="system"?FONTS.display:FONTS.ui,fontSize:m.role==="system"?13:12,color:T.text,lineHeight:1.7,whiteSpace:"pre-wrap" }}>
                {m.role==="system"&&<span style={{ fontFamily:FONTS.ui,fontSize:7,letterSpacing:3,color:T.sg,display:"block",marginBottom:6 }}>AI COACH</span>}
                {m.text}
              </div>
              {m.parsedQuests?.length>0&&(
                <div style={{ maxWidth:"88%",display:"flex",flexDirection:"column",gap:5 }}>
                  {m.parsedQuests.map((q,qi)=>(
                    <button key={qi} onClick={()=>addSuggestedQuest(q)} style={{ padding:"7px 12px",background:`${T.sg}10`,border:`1px solid ${T.sg}40`,borderRadius:5,color:T.sg,fontFamily:FONTS.ui,fontSize:9,cursor:"pointer",textAlign:"left",transition:"background 0.2s" }}
                      onMouseEnter={e=>e.currentTarget.style.background=`${T.sg}20`} onMouseLeave={e=>e.currentTarget.style.background=`${T.sg}10`}>
                      + Add to quests: "{q.name}"
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading&&<div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.sg,animation:"pulse 1.2s ease-in-out infinite" }}>Thinking...</div>}
          <div ref={bottomRef}/>
        </div>
        <div style={{ padding:"8px 14px",borderTop:`1px solid ${T.bg3}`,display:"flex",gap:5,flexWrap:"wrap" }}>
          {QUICK.map((q,i)=>(
            <button key={i} onClick={()=>setInput(q)} style={{ fontFamily:FONTS.ui,fontSize:8,padding:"4px 9px",background:"transparent",border:`1px solid ${T.bg3}`,borderRadius:4,color:T.dim,cursor:"pointer",transition:"all 0.2s" }}
              onMouseEnter={e=>{e.target.style.borderColor=th.accent;e.target.style.color=th.accent;}} onMouseLeave={e=>{e.target.style.borderColor=T.bg3;e.target.style.color=T.dim;}}>
              {q}
            </button>
          ))}
        </div>
        <div style={{ display:"flex",borderTop:`1px solid ${T.bg3}` }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Ask the AI coach..." style={{ flex:1,background:T.bg1,border:"none",color:T.text,padding:"12px 16px",fontFamily:FONTS.ui,fontSize:12,outline:"none" }}/>
          <button onClick={send} disabled={loading||!input.trim()} style={{ padding:"12px 18px",background:loading||!input.trim()?"transparent":`${th.accent}15`,border:"none",borderLeft:`1px solid ${T.bg3}`,color:loading||!input.trim()?T.dim:th.accent,fontFamily:FONTS.ui,fontSize:10,letterSpacing:1,cursor:loading||!input.trim()?"not-allowed":"pointer",transition:"all 0.2s" }}>
            {loading?"...":"SEND"}
          </button>
        </div>
      </Card>
    </div>
  );
}
FILEOF

cat > src/screens/OptionsScreen.jsx << 'FILEOF'
import { useState } from "react";
import { T, FONTS, THEMES } from "../constants/theme.js";
import { Card, SecTitle, Btn } from "../components/ui/index.jsx";
import OnboardingModal from "./OnboardingModal.jsx";

export default function OptionsScreen({ game, update, th, showToast, onSignOut }) {
  const [showGuide, setShowGuide] = useState(false);

  return (
    <div>
      {showGuide&&<OnboardingModal onClose={()=>setShowGuide(false)} th={th}/>}

      <Card style={{ marginBottom:14 }}>
        <SecTitle col={th.accent}>Help & Guide</SecTitle>
        <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim,lineHeight:1.7,marginBottom:12 }}>
          New to HabitQuest? The guide covers everything — habits, stats, quests, the skill tree, and the AI coach.
        </div>
        <Btn full onClick={()=>setShowGuide(true)}>OPEN GUIDE</Btn>
      </Card>

      <Card style={{ marginBottom:14 }}>
        <SecTitle col={th.accent}>Appearance</SecTitle>
        <div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.dim,marginBottom:10 }}>Current theme: {THEMES[game.theme]?.name||"Classic Gold"}</div>
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
          {Object.entries(THEMES).map(([key,val])=>(
            <button key={key} onClick={()=>{update(s=>({...s,theme:key}));showToast(`Theme changed to ${val.name}.`,"gold");}} style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 12px",background:game.theme===key?`${val.accent}15`:"transparent",border:`1px solid ${game.theme===key?val.accent:T.bg3}`,borderRadius:5,cursor:"pointer",transition:"all 0.2s" }}>
              <div style={{ width:10,height:10,borderRadius:"50%",background:val.accent }}/>
              <span style={{ fontFamily:FONTS.ui,fontSize:9,color:game.theme===key?val.accent:T.dim }}>{val.name}</span>
            </button>
          ))}
        </div>
      </Card>

      <Card style={{ marginBottom:14 }}>
        <SecTitle col={th.accent}>Account</SecTitle>
        <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim,marginBottom:12,lineHeight:1.6 }}>
          Your data is saved automatically and synced across all your devices. Sign out to switch accounts.
        </div>
        <Btn onClick={onSignOut} danger full>SIGN OUT</Btn>
      </Card>

      <Card style={{ marginBottom:14 }}>
        <SecTitle col={T.danger}>Danger Zone</SecTitle>
        <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim,marginBottom:12,lineHeight:1.6 }}>
          Resetting your progress cannot be undone. All XP, gems, stats, and habits will be lost.
        </div>
        <Btn onClick={()=>{
          if(window.confirm("Are you sure? This cannot be undone."))
            update(()=>({ char:game.char, setup:true, onboardingDone:true, xp:0, gems:0, stats:{ Physical:1,Mental:1,Spiritual:1,Social:1,Emotional:1 }, skillPoints:0, unlockedNodes:[], daily:[], quests:[], done:{}, perms:[], actives:[], cosmetics:[], titles:[], title:null, theme:"default", aesthetic:"default", aura:false, shadowMission:null, shadowProgress:0, boss:null, bossHPLeft:0, abyssDepth:0, abyssActive:false, mood:null, lastMoodDate:null, lastDay:new Date().toISOString().split("T")[0], briefing:null, briefingDate:null, penaltyMessage:null, memory:{ recentActivity:[], totalDays:0, avgCompletions:0, mostSkipped:null, longestStreak:0 } }));
        }} danger>RESET ALL PROGRESS</Btn>
      </Card>

      <div style={{ textAlign:"center",marginTop:20,fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:T.dim }}>
        HABITQUEST V2 · BUILD BETTER HABITS
      </div>
    </div>
  );
}
FILEOF

# ─────────────────────────────────────────────────────────────
# APP.JSX
# ─────────────────────────────────────────────────────────────

cat > src/App.jsx << 'FILEOF'
import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./lib/supabase.js";
import { buildCharContext, buildSystemPrompt, callAIProxy } from "./lib/ai.js";
import { TODAY, getLevel, getClass, rolloverDay, applyCompleteDaily, applyCompleteQuest, applyBuyItem } from "./lib/gameLogic.js";
import { DEFAULT_GAME, THEMES } from "./constants/gameData.js";
import { T, FONTS } from "./constants/theme.js";

import GlobalCSS        from "./components/ui/GlobalCSS.jsx";
import Toast            from "./components/ui/Toast.jsx";
import Header           from "./components/layout/Header.jsx";
import ShadowMissionBar from "./components/layout/ShadowMissionBar.jsx";
import BossBar          from "./components/layout/BossBar.jsx";

import AuthScreen       from "./screens/AuthScreen.jsx";
import SetupScreen      from "./screens/SetupScreen.jsx";
import OnboardingModal  from "./screens/OnboardingModal.jsx";
import StatusScreen     from "./screens/StatusScreen.jsx";
import DailyScreen      from "./screens/DailyScreen.jsx";
import QuestsScreen     from "./screens/QuestsScreen.jsx";
import SkillsScreen     from "./screens/SkillsScreen.jsx";
import ShopScreen       from "./screens/ShopScreen.jsx";
import SystemScreen     from "./screens/SystemScreen.jsx";
import OptionsScreen    from "./screens/OptionsScreen.jsx";

export default function App() {
  const [user,setUser]               = useState(null);
  const [authLoading,setAuthLoading] = useState(true);
  const [game,setGame]               = useState(DEFAULT_GAME);
  const [saving,setSaving]           = useState(false);
  const [screen,setScreen]           = useState("status");
  const [toast,setToast]             = useState(null);
  const [lvlAnim,setLvlAnim]         = useState(null);
  const [aiStatus,setAiStatus]       = useState("idle");
  const [briefingLoading,setBriefingLoading] = useState(false);
  const [showOnboarding,setShowOnboarding]   = useState(false);

  const showToast = useCallback((msg,type="gold",dur=3000)=>{
    setToast({msg,type}); setTimeout(()=>setToast(null),dur);
  },[]);

  useEffect(()=>{
    supabase.auth.getSession().then(({data:{session}})=>{
      if(session?.user) setUser(session.user);
      setAuthLoading(false);
    });
    const {data:{subscription}} = supabase.auth.onAuthStateChange((_,session)=>setUser(session?.user||null));
    return ()=>subscription.unsubscribe();
  },[]);

  useEffect(()=>{
    if(!user) return;
    (async()=>{
      const {data,error} = await supabase.from("profiles").select("game_state").eq("id",user.id).single();
      if(error&&error.code!=="PGRST116"){ console.error(error); return; }
      if(data?.game_state){
        const loaded = {...DEFAULT_GAME,...data.game_state};
        setGame(loaded);
        if(!loaded.onboardingDone) setShowOnboarding(true);
      } else {
        setShowOnboarding(true);
      }
    })();
  },[user]);

  const saveTimer = useRef(null);
  const saveGame  = useCallback((newGame)=>{
    if(!user) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async()=>{
      setSaving(true);
      await supabase.from("profiles").upsert({id:user.id,game_state:newGame,updated_at:new Date().toISOString()});
      setSaving(false);
    },1500);
  },[user]);

  const update = useCallback(fn=>{
    setGame(prev=>{ const next=fn(prev); saveGame(next); return next; });
  },[saveGame]);

  const today = TODAY();
  useEffect(()=>{
    if(!game.setup||game.lastDay===today) return;
    update(s=>rolloverDay(s,today));
  },[today,game.setup,game.lastDay]);

  useEffect(()=>{
    if(!game.setup||game.briefingDate===today||briefingLoading||game.briefing) return;
    generateBriefing();
  },[game.setup,today,game.briefingDate]);

  async function generateBriefing() {
    setBriefingLoading(true); setAiStatus("working");
    try {
      const ctx=buildCharContext(game),sys=buildSystemPrompt(ctx);
      const prompt=`Give this player a morning briefing. 3-4 sentences: note yesterday's performance, identify their most critical weak area, give a clear directive for today. End with one specific bonus mission based on their actual habits. Label it: BONUS MISSION: [mission description]`;
      const text=await callAIProxy(sys,prompt);
      let briefingText=text,shadowMission=game.shadowMission;
      const match=text.match(/BONUS MISSION:\s*(.+?)(?:\n|$)/i);
      if(match&&!game.shadowMission){
        shadowMission={id:`ai_${Date.now()}`,name:"Daily Bonus Mission",desc:match[1].trim(),req:{type:"Any",count:1},xp:180,gems:18,aiGenerated:true};
        briefingText=text.replace(/BONUS MISSION:.*$/im,"").trim();
      }
      update(s=>({...s,briefing:briefingText,briefingDate:today,shadowMission}));
      setAiStatus("ok");
    } catch(e) {
      console.warn("Briefing failed:",e.message);
      setAiStatus("error");
      showToast("AI briefing unavailable. Check your connection.","danger");
    }
    setBriefingLoading(false);
  }

  function completeDaily(id) {
    const result=applyCompleteDaily(game,id,today);
    const ev=result._events||{};
    const clean={...result}; delete clean._events;
    if(ev.levelUp) setTimeout(()=>{ setLvlAnim(ev.newLevel); setTimeout(()=>setLvlAnim(null),3500); },200);
    if(ev.shadowDone) showToast(`Bonus mission complete! +${ev.shadowXP} XP`,"system");
    else if(ev.bossDone) showToast(`Weekly challenge complete! +${ev.bossXP} XP`,"success",5000);
    else if(!game.done?.[today]?.[id]) showToast(`+${ev.xpEarned} XP  ·  +${ev.gemEarned} gems${ev.boosted?"  ⚡":""}`,ev.skillPointGained?"success":"gold");
    if(ev.skillPointGained) setTimeout(()=>showToast("Level up! +1 Skill Point earned. Visit the Skills tab.","info",5000),400);
    update(()=>clean);
  }

  function completeQuest(id) {
    const {game:next,events}=applyCompleteQuest(game,id,today);
    if(events.error){ showToast(events.error,"danger"); return; }
    showToast(`Quest complete — ${events.name}\n+${events.xp} XP  +${events.gems} gems`,"success");
    update(()=>next);
  }

  function buyItem(item) {
    const {game:next,error}=applyBuyItem(game,item);
    if(error){ showToast(error,"danger"); return; }
    showToast(item.type==="perm"?`${item.name} unlocked permanently.`:item.type==="aesthetic"?`${item.name} aesthetic applied.`:item.type==="theme"?`Theme changed to ${item.name}.`:`${item.name} activated.`,"gold");
    update(()=>next);
  }

  async function signOut() {
    await supabase.auth.signOut();
    setGame(DEFAULT_GAME); setUser(null); setScreen("status");
  }

  const th = THEMES[game.theme]||THEMES.default;

  if(authLoading) return (
    <div style={{background:T.bg0,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <GlobalCSS accent="#c9a84c"/>
      <div style={{fontFamily:FONTS.display,fontSize:32,color:"#c9a84c",animation:"pulse 1.5s ease-in-out infinite"}}>◈</div>
    </div>
  );

  if(!user)       return <AuthScreen onAuth={u=>setUser(u)}/>;
  if(!game.setup) return <SetupScreen th={th} onComplete={char=>update(s=>({...s,char,setup:true}))}/>;

  const today2    = TODAY();
  const todayDone = game.done?.[today2]||{};
  const doneCount = game.daily?.filter(q=>todayDone[q.id]).length||0;
  const allDone   = doneCount===(game.daily?.length||0)&&(game.daily?.length||0)>0;

  return (
    <div style={{fontFamily:FONTS.ui,background:T.bg0,minHeight:"100vh",color:T.text,maxWidth:480,margin:"0 auto",position:"relative"}}>
      <GlobalCSS accent={th.accent}/>
      <Toast toast={toast}/>

      {showOnboarding&&(
        <OnboardingModal th={th} onClose={()=>{
          setShowOnboarding(false);
          update(s=>({...s,onboardingDone:true}));
        }}/>
      )}

      {lvlAnim&&(
        <div style={{position:"fixed",inset:0,zIndex:1000,background:"rgba(6,6,15,0.94)",backdropFilter:"blur(16px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.4s ease"}}>
          <div style={{textAlign:"center",animation:"lvlPop 3.5s ease forwards"}}>
            <div style={{fontFamily:FONTS.ui,fontSize:10,letterSpacing:6,color:T.dim,marginBottom:16}}>LEVEL UP</div>
            <div style={{fontFamily:FONTS.display,fontSize:96,color:th.accent,lineHeight:1,textShadow:`0 0 60px ${th.glow}`}}>{lvlAnim}</div>
            <div style={{fontFamily:FONTS.display,fontSize:28,color:T.text,marginTop:8}}>{getClass(lvlAnim).name}</div>
            <div style={{fontFamily:FONTS.ui,fontSize:9,color:T.purple,marginTop:8,letterSpacing:2}}>+1 SKILL POINT EARNED</div>
          </div>
        </div>
      )}

      {game.abyssActive&&(
        <div style={{background:T.abyss,borderBottom:"1px solid #6a000050",padding:"7px 16px"}}>
          <span style={{fontFamily:FONTS.ui,fontSize:9,letterSpacing:3,color:"#dd5050"}}>
            ⚠ RECOVERY NEEDED — Depth {game.abyssDepth}/20 — Complete habits to recover
          </span>
        </div>
      )}

      <Header game={game} screen={screen} setScreen={setScreen} aiStatus={aiStatus} saving={saving}/>

      <div style={{padding:"0 16px"}}>
        <ShadowMissionBar game={game}/>
        <BossBar game={game}/>
      </div>

      <div style={{padding:"16px 16px 60px"}}>
        {screen==="status" &&<StatusScreen game={game} update={update} th={th} showToast={showToast} briefingLoading={briefingLoading} generateBriefing={generateBriefing} onSignOut={signOut}/>}
        {screen==="daily"  &&<DailyScreen  game={game} update={update} th={th} today={today2} todayDone={todayDone} doneCount={doneCount} allDone={allDone} completeDaily={completeDaily} showToast={showToast}/>}
        {screen==="quests" &&<QuestsScreen game={game} update={update} th={th} completeQuest={completeQuest} showToast={showToast}/>}
        {screen==="skills" &&<SkillsScreen game={game} update={update} th={th} showToast={showToast}/>}
        {screen==="shop"   &&<ShopScreen   game={game} th={th} buyItem={buyItem} showToast={showToast}/>}
        {screen==="system" &&<SystemScreen game={game} update={update} th={th} showToast={showToast} aiStatus={aiStatus} setAiStatus={setAiStatus} generateBriefing={generateBriefing} briefingLoading={briefingLoading}/>}
        {screen==="options"&&<OptionsScreen game={game} update={update} th={th} showToast={showToast} onSignOut={signOut}/>}
      </div>
    </div>
  );
}
FILEOF

echo ""
echo "✅ HabitQuest V2 build complete!"
echo ""
echo "Files created:"
find src -name "*.jsx" -o -name "*.js" | sort
echo ""
echo "Next steps:"
echo "  1. npm install"
echo "  2. npm run dev  (test locally)"
echo "  3. git add . && git commit -m 'V2: skill tree, onboarding, quest notes, penalties, aesthetics, particles' && git push"
FILEOF

echo "Script file created at refactor_v2.sh"