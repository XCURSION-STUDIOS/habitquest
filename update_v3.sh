#!/bin/bash
# ═══════════════════════════════════════════════════════════════
# HabitQuest V2 — Rival System + The Architect + Habit Templates
# ═══════════════════════════════════════════════════════════════

echo "Building Rival System, The Architect, and Habit Templates..."

# ── 1. HABIT TEMPLATES DATA ─────────────────────────────────
python3 << 'PYEOF'
templates_code = '''
export const HABIT_TEMPLATES = [
  {
    id: "student",
    name: "The Student",
    icon: "◈",
    desc: "Built for academic performance and deep learning.",
    daily: [
      { name:"Study / Deep Work",  type:"Mental",    diff:"C-Rank" },
      { name:"Read 30 Minutes",    type:"Mental",    diff:"D-Rank" },
      { name:"Review Notes",       type:"Mental",    diff:"E-Rank" },
      { name:"Morning Walk",       type:"Physical",  diff:"E-Rank" },
    ],
    quests: [
      { name:"Complete a full textbook chapter",    type:"Mental",    diff:"C-Rank" },
      { name:"Score 90%+ on a practice test",       type:"Mental",    diff:"B-Rank" },
      { name:"Build a study schedule for the week", type:"Mental",    diff:"D-Rank" },
    ],
  },
  {
    id: "athlete",
    name: "The Athlete",
    icon: "⚔",
    desc: "Physical dominance and disciplined recovery.",
    daily: [
      { name:"Train / Work Out",       type:"Physical",  diff:"C-Rank" },
      { name:"Mobility & Stretching",  type:"Physical",  diff:"E-Rank" },
      { name:"Hit Protein Goal",       type:"Physical",  diff:"D-Rank" },
      { name:"Sleep 8 Hours",          type:"Physical",  diff:"D-Rank" },
    ],
    quests: [
      { name:"Run 5K without stopping",         type:"Physical", diff:"C-Rank" },
      { name:"Complete a full week of training", type:"Physical", diff:"B-Rank" },
      { name:"Set a new personal record",        type:"Physical", diff:"A-Rank" },
    ],
  },
  {
    id: "creative",
    name: "The Creative",
    icon: "✦",
    desc: "Consistent creative output and artistic growth.",
    daily: [
      { name:"Create Something Daily",  type:"Emotional", diff:"C-Rank" },
      { name:"Consume Inspiring Work",  type:"Mental",    diff:"E-Rank" },
      { name:"Freewrite 10 Minutes",    type:"Emotional", diff:"D-Rank" },
      { name:"No Doom Scrolling",       type:"Mental",    diff:"D-Rank" },
    ],
    quests: [
      { name:"Finish a creative project end-to-end", type:"Emotional", diff:"B-Rank" },
      { name:"Share your work publicly",              type:"Social",    diff:"C-Rank" },
      { name:"Learn one new creative technique",      type:"Mental",    diff:"D-Rank" },
    ],
  },
  {
    id: "entrepreneur",
    name: "The Entrepreneur",
    icon: "⬡",
    desc: "High output, networking, and relentless execution.",
    daily: [
      { name:"Deep Work Block (2hrs)",   type:"Mental",   diff:"B-Rank" },
      { name:"Reach Out to Someone",     type:"Social",   diff:"D-Rank" },
      { name:"Review Goals & Metrics",   type:"Mental",   diff:"E-Rank" },
      { name:"Exercise",                 type:"Physical", diff:"D-Rank" },
    ],
    quests: [
      { name:"Launch or ship something",             type:"Mental",  diff:"A-Rank" },
      { name:"Have 3 meaningful conversations",      type:"Social",  diff:"C-Rank" },
      { name:"Complete a course or skill module",    type:"Mental",  diff:"C-Rank" },
    ],
  },
  {
    id: "wellness",
    name: "The Wellness Path",
    icon: "★",
    desc: "Mental health, spiritual grounding, and emotional balance.",
    daily: [
      { name:"Meditate",              type:"Spiritual", diff:"D-Rank" },
      { name:"Journal",               type:"Emotional", diff:"D-Rank" },
      { name:"Gratitude Practice",    type:"Spiritual", diff:"E-Rank" },
      { name:"Time in Nature / Walk", type:"Physical",  diff:"E-Rank" },
    ],
    quests: [
      { name:"Complete a 7-day meditation streak",  type:"Spiritual", diff:"B-Rank" },
      { name:"Have a hard conversation you've been avoiding", type:"Emotional", diff:"C-Rank" },
      { name:"Digital detox for a full day",        type:"Spiritual", diff:"C-Rank" },
    ],
  },
  {
    id: "balanced",
    name: "The Balanced Build",
    icon: "◆",
    desc: "One habit per stat. Build everything simultaneously.",
    daily: [
      { name:"Exercise",     type:"Physical",  diff:"D-Rank" },
      { name:"Read",         type:"Mental",    diff:"D-Rank" },
      { name:"Meditate",     type:"Spiritual", diff:"E-Rank" },
      { name:"Connect",      type:"Social",    diff:"E-Rank" },
      { name:"Journal",      type:"Emotional", diff:"E-Rank" },
    ],
    quests: [
      { name:"Complete a full week with all 5 habits done daily", type:"Physical",  diff:"A-Rank" },
      { name:"Reach stat 10 in your weakest area",                type:"Mental",    diff:"B-Rank" },
      { name:"Go one week without missing a single habit",        type:"Spiritual", diff:"B-Rank" },
    ],
  },
];
'''

# Append to gameData.js
with open('src/constants/gameData.js', 'r') as f:
    content = f.read()

if 'HABIT_TEMPLATES' not in content:
    content += '\n' + templates_code
    with open('src/constants/gameData.js', 'w') as f:
        f.write(content)
    print("HABIT_TEMPLATES added to gameData.js")
else:
    print("HABIT_TEMPLATES already present")
PYEOF

# ── 2. UPDATE DEFAULT_GAME with new fields ───────────────────
python3 << 'PYEOF'
with open('src/constants/gameData.js', 'r') as f:
    content = f.read()

old = '  penaltyMessage: null,'
new = '''  penaltyMessage: null,
  rivalEnabled: false,
  rival: null,
  weeklyReview: null,
  lastReviewDate: null,'''

if 'rivalEnabled' not in content:
    content = content.replace(old, new)
    with open('src/constants/gameData.js', 'w') as f:
        f.write(content)
    print("DEFAULT_GAME updated with rival + review fields")
else:
    print("Fields already present")
PYEOF

# ── 3. UPDATE gameLogic.js — timestamp completions ───────────
python3 << 'PYEOF'
with open('src/lib/gameLogic.js', 'r') as f:
    content = f.read()

# Store timestamp instead of true when completing a daily
old = '  done:  { ...game.done, [today]:{ ...(game.done[today]||{}), [id]:true } },'
new = '  done:  { ...game.done, [today]:{ ...(game.done[today]||{}), [id]:new Date().toISOString() } },'

if 'new Date().toISOString()' not in content:
    content = content.replace(old, new)

# Fix todayDone check — treat both true (legacy) and timestamp string as done
old_check = '  if (todayDone[id]) {'
new_check = '  if (todayDone[id] && todayDone[id] !== false) {'

content = content.replace(old_check, new_check)

# Add rival rollover logic + weekly review check to rolloverDay
old_return = '''  return {
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
  };'''

new_return = '''  // Rival progression
  let rival = game.rival;
  if (game.rivalEnabled && rival) {
    const rivalDailyXP = Math.round(avgCompletions * 60 * (0.85 + Math.random() * 0.3));
    const newRivalXP   = (rival.xp || 0) + rivalDailyXP;
    rival = { ...rival, xp: newRivalXP };
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
    rival,
    memory: { recentActivity, totalDays, avgCompletions, mostSkipped:leastActive, longestStreak },
  };'''

if 'rivalDailyXP' not in content:
    content = content.replace(old_return, new_return)

with open('src/lib/gameLogic.js', 'w') as f:
    f.write(content)
print("gameLogic.js updated")
PYEOF

# ── 4. ADD WEEKLY REVIEW ANALYSIS HELPERS to ai.js ──────────
python3 << 'PYEOF'
with open('src/lib/ai.js', 'r') as f:
    content = f.read()

new_functions = '''
// ── Weekly Review Data Builder ────────────────────────────────
export function buildWeeklyData(game) {
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
  const { STATS } = await import("../constants/gameData.js").catch(() => ({ STATS: ["Physical","Mental","Spiritual","Social","Emotional"] }));
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
  ).join("\\n");

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
'''

if 'buildWeeklyData' not in content:
    content += new_functions
    with open('src/lib/ai.js', 'w') as f:
        f.write(content)
    print("ai.js updated with weekly review helpers")
else:
    print("Already present")
PYEOF

# ── 5. CREATE HabitTemplatesModal ────────────────────────────
cat > src/screens/HabitTemplatesModal.jsx << 'FILEOF'
import { useState } from "react";
import { T, FONTS } from "../constants/theme.js";
import { HABIT_TEMPLATES, DIFF } from "../constants/gameData.js";

export default function HabitTemplatesModal({ onClose, onApply, th, game }) {
  const [selected, setSelected] = useState(null);
  const [mode, setMode]         = useState("add"); // "add" or "replace"
  const tmpl = HABIT_TEMPLATES.find(t => t.id === selected);
  const hasExisting = (game.daily?.length || 0) > 0;

  function apply() {
    if (!tmpl) return;
    const newDaily = tmpl.daily.map(h => ({
      id: Date.now() + Math.random(),
      name: h.name, type: h.type, diff: h.diff,
      streak: 0, best: 0,
    }));
    const newQuests = tmpl.quests.map(q => {
      const cfg = DIFF[q.diff];
      return {
        id: Date.now() + Math.random(),
        name: q.name, type: q.type, diff: q.diff,
        done: false, xp: cfg.xp * 3, gems: cfg.gems * 3,
      };
    });
    onApply({ daily: newDaily, quests: newQuests, mode });
    onClose();
  }

  return (
    <div style={{ position:"fixed",inset:0,zIndex:2000,background:"rgba(6,6,15,0.94)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,boxSizing:"border-box" }}>
      <div style={{ maxWidth:460,width:"100%",background:"linear-gradient(135deg,#0d0d1a,#111120)",border:`1px solid ${th.accent}40`,borderRadius:14,overflow:"hidden",boxShadow:`0 0 60px ${th.accent}10`,maxHeight:"90vh",display:"flex",flexDirection:"column" }}>
        <div style={{ padding:"20px 22px 0" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
            <div style={{ fontFamily:FONTS.display,fontSize:22,color:"#eef2ff" }}>Habit Templates</div>
            <button onClick={onClose} style={{ background:"none",border:"none",color:T.dim,cursor:"pointer",fontSize:16 }}>✕</button>
          </div>
          <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim,marginBottom:16,lineHeight:1.6 }}>
            Choose a template to get started fast. Installs daily habits and starter quests.
          </div>
        </div>

        <div style={{ overflowY:"auto",padding:"0 22px",flex:1 }}>
          {/* Template grid */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16 }}>
            {HABIT_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setSelected(t.id)} style={{ padding:"12px 10px",background:selected===t.id?`${th.accent}15`:"transparent",border:`1px solid ${selected===t.id?th.accent:T.bg3}`,borderRadius:8,cursor:"pointer",textAlign:"left",transition:"all 0.2s" }}>
                <div style={{ fontSize:18,marginBottom:4 }}>{t.icon}</div>
                <div style={{ fontFamily:FONTS.display,fontSize:13,color:selected===t.id?th.accent:"#eef2ff",marginBottom:2 }}>{t.name}</div>
                <div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.dim,lineHeight:1.5 }}>{t.desc}</div>
              </button>
            ))}
          </div>

          {/* Preview */}
          {tmpl && (
            <div style={{ marginBottom:16,padding:"14px",background:T.bg2,borderRadius:8,border:`1px solid ${T.bg3}` }}>
              <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:3,color:T.dim,marginBottom:10 }}>PREVIEW</div>
              <div style={{ fontFamily:FONTS.ui,fontSize:9,color:th.accent,marginBottom:6,letterSpacing:2 }}>DAILY HABITS</div>
              {tmpl.daily.map((h,i) => (
                <div key={i} style={{ fontFamily:FONTS.ui,fontSize:10,color:T.silver,marginBottom:3 }}>
                  · {h.name} <span style={{ color:T.dim }}>({h.type} · {h.diff})</span>
                </div>
              ))}
              <div style={{ fontFamily:FONTS.ui,fontSize:9,color:th.accent,marginBottom:6,letterSpacing:2,marginTop:10 }}>STARTER QUESTS</div>
              {tmpl.quests.map((q,i) => (
                <div key={i} style={{ fontFamily:FONTS.ui,fontSize:10,color:T.silver,marginBottom:3 }}>
                  · {q.name} <span style={{ color:T.dim }}>({q.type} · {q.diff})</span>
                </div>
              ))}
            </div>
          )}

          {/* Mode selector if existing habits */}
          {tmpl && hasExisting && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:T.dim,marginBottom:8 }}>YOU ALREADY HAVE HABITS —</div>
              <div style={{ display:"flex",gap:8 }}>
                {[{k:"add",l:"Add alongside existing"},{k:"replace",l:"Replace everything"}].map(m => (
                  <button key={m.k} onClick={() => setMode(m.k)} style={{ flex:1,padding:"9px 6px",background:mode===m.k?`${th.accent}15`:"transparent",border:`1px solid ${mode===m.k?th.accent:T.bg3}`,borderRadius:6,color:mode===m.k?th.accent:T.dim,fontFamily:FONTS.ui,fontSize:9,cursor:"pointer",transition:"all 0.2s" }}>
                    {m.l}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding:"16px 22px",borderTop:`1px solid ${T.bg3}`,display:"flex",gap:8 }}>
          <button onClick={onClose} style={{ flex:1,padding:"11px",background:"transparent",border:`1px solid ${T.bg3}`,borderRadius:6,color:T.dim,fontFamily:FONTS.ui,fontSize:9,letterSpacing:2,cursor:"pointer" }}>
            CANCEL
          </button>
          <button onClick={apply} disabled={!selected} style={{ flex:2,padding:"11px",background:selected?`${th.accent}15`:"transparent",border:`1px solid ${selected?th.accent:T.bg3}`,borderRadius:6,color:selected?th.accent:T.dim,fontFamily:FONTS.ui,fontSize:9,letterSpacing:2,cursor:selected?"pointer":"not-allowed",transition:"all 0.2s" }}>
            APPLY TEMPLATE
          </button>
        </div>
      </div>
    </div>
  );
}
FILEOF

# ── 6. CREATE WeeklyReviewModal (The Architect) ──────────────
cat > src/screens/WeeklyReviewModal.jsx << 'FILEOF'
import { useState, useEffect } from "react";
import { T, FONTS } from "../constants/theme.js";
import { buildWeeklyData, buildArchitectPrompt, callAIProxy } from "../lib/ai.js";

export default function WeeklyReviewModal({ game, onClose, th, showToast }) {
  const [status,  setStatus]  = useState("loading"); // loading | done | error
  const [review,  setReview]  = useState(null);
  const [weekData,setWeekData]= useState(null);

  useEffect(() => {
    generate();
  }, []);

  async function generate() {
    setStatus("loading");
    try {
      const wd  = buildWeeklyData(game);
      setWeekData(wd);
      const sys = buildArchitectPrompt(game, wd);
      const txt = await callAIProxy(sys, "Conduct the weekly review now.", []);
      setReview(txt);
      setStatus("done");
    } catch(e) {
      setStatus("error");
      showToast("Review failed: " + e.message, "danger");
    }
  }

  const scoreColor = weekData
    ? weekData.weekScore >= 80 ? "#27a060"
    : weekData.weekScore >= 50 ? "#c9a84c"
    : "#b03030"
    : T.dim;

  return (
    <div style={{ position:"fixed",inset:0,zIndex:2000,background:"rgba(2,2,10,0.97)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,boxSizing:"border-box",overflow:"auto" }}>
      <div style={{ maxWidth:500,width:"100%",maxHeight:"92vh",display:"flex",flexDirection:"column" }}>

        {/* Header */}
        <div style={{ marginBottom:20,borderBottom:`1px solid ${T.bg3}`,paddingBottom:16 }}>
          <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:6,color:T.dim,marginBottom:8 }}>
            WEEKLY PERFORMANCE REVIEW
          </div>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div style={{ fontFamily:FONTS.display,fontSize:32,color:"#eef2ff" }}>The Architect</div>
            {weekData && (
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:FONTS.display,fontSize:42,color:scoreColor,lineHeight:1 }}>{weekData.weekScore}</div>
                <div style={{ fontFamily:FONTS.ui,fontSize:7,letterSpacing:3,color:T.dim }}>WEEK SCORE</div>
              </div>
            )}
          </div>
        </div>

        {/* Week grid */}
        {weekData && (
          <div style={{ display:"flex",gap:4,marginBottom:20 }}>
            {weekData.week.map((d,i) => (
              <div key={i} style={{ flex:1,textAlign:"center" }}>
                <div style={{ fontFamily:FONTS.ui,fontSize:7,color:T.dim,marginBottom:4 }}>{d.day}</div>
                <div style={{ height:48,background:T.bg2,borderRadius:4,position:"relative",overflow:"hidden" }}>
                  <div style={{ position:"absolute",bottom:0,left:0,right:0,height:`${d.rate}%`,background:d.rate>=80?"#27a060":d.rate>=50?"#c9a84c":"#b03030",opacity:0.7,transition:"height 0.6s ease" }}/>
                </div>
                <div style={{ fontFamily:FONTS.ui,fontSize:7,color:T.silver,marginTop:3 }}>{d.rate}%</div>
              </div>
            ))}
          </div>
        )}

        {/* Stat breakdown */}
        {weekData && (
          <div style={{ display:"flex",gap:6,marginBottom:20,flexWrap:"wrap" }}>
            {Object.entries(weekData.statRates).filter(([,v])=>v!==null).map(([stat,rate])=>(
              <div key={stat} style={{ flex:1,minWidth:70,padding:"8px 10px",background:T.bg1,border:`1px solid ${T.bg3}`,borderRadius:6,textAlign:"center" }}>
                <div style={{ fontFamily:FONTS.ui,fontSize:16,color:rate>=70?"#27a060":rate>=40?"#c9a84c":"#b03030",marginBottom:2 }}>{rate}%</div>
                <div style={{ fontFamily:FONTS.ui,fontSize:7,color:T.dim,letterSpacing:1 }}>{stat.toUpperCase().slice(0,4)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Review content */}
        <div style={{ flex:1,overflowY:"auto",background:T.bg1,border:`1px solid ${T.bg3}`,borderRadius:10,padding:18,marginBottom:16 }}>
          {status === "loading" && (
            <div style={{ textAlign:"center",padding:"40px 0" }}>
              <div style={{ fontFamily:FONTS.ui,fontSize:9,letterSpacing:4,color:T.dim,animation:"pulse 1.5s ease-in-out infinite" }}>
                THE ARCHITECT IS ANALYSING YOUR WEEK...
              </div>
              <div style={{ fontFamily:FONTS.ui,fontSize:8,color:T.dim,marginTop:12,opacity:0.5 }}>
                Identifying patterns · Correlating data · Preparing recommendations
              </div>
            </div>
          )}
          {status === "error" && (
            <div style={{ fontFamily:FONTS.ui,fontSize:11,color:T.danger,lineHeight:1.7 }}>
              Analysis failed. Check your connection and try again.
            </div>
          )}
          {status === "done" && review && (
            <div style={{ fontFamily:FONTS.display,fontSize:14,color:"#d8e0f0",lineHeight:1.9,whiteSpace:"pre-wrap" }}>
              {review}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display:"flex",gap:8 }}>
          {status !== "loading" && (
            <button onClick={generate} style={{ flex:1,padding:"11px",background:"transparent",border:`1px solid ${T.bg3}`,borderRadius:6,color:T.dim,fontFamily:FONTS.ui,fontSize:9,letterSpacing:2,cursor:"pointer" }}>
              REGENERATE
            </button>
          )}
          <button onClick={onClose} style={{ flex:2,padding:"11px",background:`${th.accent}15`,border:`1px solid ${th.accent}40`,borderRadius:6,color:th.accent,fontFamily:FONTS.ui,fontSize:9,letterSpacing:2,cursor:"pointer" }}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
FILEOF

# ── 7. CREATE RivalCard component ────────────────────────────
cat > src/screens/RivalCard.jsx << 'FILEOF'
import { T, FONTS } from "../constants/theme.js";
import { getLevel, getClass } from "../lib/gameLogic.js";

export default function RivalCard({ game, th }) {
  if (!game.rivalEnabled || !game.rival) return null;

  const rival      = game.rival;
  const rivalLevel = getLevel(rival.xp || 0);
  const rivalClass = getClass(rivalLevel);
  const myLevel    = getLevel(game.xp);
  const gap        = rival.xp - game.xp;
  const ahead      = gap > 0;

  return (
    <div style={{ marginBottom:14,padding:"14px 16px",background:ahead?"#120000":"#001208",border:`1px solid ${ahead?"#b0303040":"#27a06040"}`,borderRadius:10 }}>
      <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:3,color:ahead?T.danger:"#27a060",marginBottom:10 }}>
        {ahead ? "⚠ RIVAL AHEAD" : "◈ RIVAL BEHIND"}
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:12 }}>
        <div style={{ width:42,height:42,borderRadius:"50%",background:T.bg2,border:`1px solid ${ahead?"#b0303060":"#27a06060"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>
          {rivalClass.icon}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:FONTS.display,fontSize:16,color:"#eef2ff",marginBottom:2 }}>{rival.name}</div>
          <div style={{ fontFamily:FONTS.ui,fontSize:8,color:T.silver,letterSpacing:1 }}>
            {rivalClass.icon} {rivalClass.name.toUpperCase()} · LVL {rivalLevel}
          </div>
        </div>
        <div style={{ textAlign:"right",flexShrink:0 }}>
          <div style={{ fontFamily:FONTS.display,fontSize:20,color:ahead?T.danger:"#27a060" }}>
            {ahead ? "+" : "-"}{Math.abs(rivalLevel - myLevel)} LVL
          </div>
          <div style={{ fontFamily:FONTS.ui,fontSize:7,color:T.dim }}>
            {Math.abs(gap)} XP {ahead?"ahead":"behind"}
          </div>
        </div>
      </div>
      {rival.taunt && (
        <div style={{ marginTop:10,fontFamily:FONTS.display,fontSize:12,color:T.silver,fontStyle:"italic",lineHeight:1.6,borderTop:`1px solid ${T.bg3}`,paddingTop:8 }}>
          "{rival.taunt}"
        </div>
      )}
    </div>
  );
}
FILEOF

# ── 8. UPDATE OptionsScreen — rival toggle + review trigger ──
cat > src/screens/OptionsScreen.jsx << 'FILEOF'
import { useState } from "react";
import { T, FONTS, THEMES } from "../constants/theme.js";
import { Card, SecTitle, Btn } from "../components/ui/index.jsx";
import OnboardingModal from "./OnboardingModal.jsx";
import WeeklyReviewModal from "./WeeklyReviewModal.jsx";

export default function OptionsScreen({ game, update, th, showToast, onSignOut, onGenerateRival }) {
  const [showGuide,  setShowGuide]  = useState(false);
  const [showReview, setShowReview] = useState(false);

  const lastReview = game.lastReviewDate
    ? new Date(game.lastReviewDate).toLocaleDateString()
    : "Never";

  return (
    <div>
      {showGuide  && <OnboardingModal onClose={()=>setShowGuide(false)} th={th}/>}
      {showReview && <WeeklyReviewModal game={game} onClose={()=>{setShowReview(false); update(s=>({...s,lastReviewDate:new Date().toISOString()}));}} th={th} showToast={showToast}/>}

      {/* The Architect */}
      <Card style={{ marginBottom:14,border:`1px solid ${T.sg}30` }}>
        <SecTitle col={T.sg}>The Architect — Weekly Review</SecTitle>
        <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim,lineHeight:1.7,marginBottom:12 }}>
          A structured AI analysis of your full week. Identifies patterns, correlates mood and timing data, and prescribes specific changes. Last review: {lastReview}.
        </div>
        <Btn full onClick={()=>setShowReview(true)}>RUN WEEKLY REVIEW</Btn>
      </Card>

      {/* Rival System */}
      <Card style={{ marginBottom:14,border:`1px solid ${game.rivalEnabled?"#b0303030":T.bg3}` }}>
        <SecTitle col={game.rivalEnabled?T.danger:T.dim}>Rival System</SecTitle>
        <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim,lineHeight:1.7,marginBottom:12 }}>
          The AI generates a rival based on your weaknesses. They level up every day you play — stay ahead or fall behind.
          {game.rival && <span style={{ color:T.silver }}> Current rival: <strong>{game.rival.name}</strong>.</span>}
        </div>
        <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:game.rivalEnabled?10:0 }}>
          <button onClick={()=>update(s=>({...s,rivalEnabled:!s.rivalEnabled}))} style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 14px",background:game.rivalEnabled?`${T.danger}15`:"transparent",border:`1px solid ${game.rivalEnabled?T.danger:T.bg3}`,borderRadius:6,color:game.rivalEnabled?T.danger:T.dim,fontFamily:FONTS.ui,fontSize:9,letterSpacing:2,cursor:"pointer",transition:"all 0.2s" }}>
            <div style={{ width:10,height:10,borderRadius:"50%",background:game.rivalEnabled?T.danger:T.bg3,transition:"background 0.2s" }}/>
            {game.rivalEnabled?"RIVAL ENABLED":"RIVAL DISABLED"}
          </button>
        </div>
        {game.rivalEnabled && !game.rival && (
          <Btn full onClick={onGenerateRival}>GENERATE MY RIVAL</Btn>
        )}
        {game.rivalEnabled && game.rival && (
          <button onClick={()=>{ if(window.confirm("Replace your current rival?")) onGenerateRival(); }} style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,padding:"6px 12px",background:"transparent",border:`1px solid ${T.bg3}`,borderRadius:4,color:T.dim,cursor:"pointer" }}>
            REGENERATE RIVAL
          </button>
        )}
      </Card>

      {/* Guide */}
      <Card style={{ marginBottom:14 }}>
        <SecTitle col={th.accent}>Help & Guide</SecTitle>
        <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim,lineHeight:1.7,marginBottom:12 }}>
          New to HabitQuest? The guide covers everything — habits, stats, quests, the skill tree, and the AI coach.
        </div>
        <Btn full onClick={()=>setShowGuide(true)}>OPEN GUIDE</Btn>
      </Card>

      {/* Appearance */}
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

      {/* Account */}
      <Card style={{ marginBottom:14 }}>
        <SecTitle col={th.accent}>Account</SecTitle>
        <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim,marginBottom:12,lineHeight:1.6 }}>
          Your data is saved automatically and synced across devices.
        </div>
        <Btn onClick={onSignOut} danger full>SIGN OUT</Btn>
      </Card>

      {/* Danger Zone */}
      <Card style={{ marginBottom:14 }}>
        <SecTitle col={T.danger}>Danger Zone</SecTitle>
        <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim,marginBottom:12,lineHeight:1.6 }}>
          Resetting your progress cannot be undone. All XP, gems, stats, and habits will be lost.
        </div>
        <Btn onClick={()=>{
          if(window.confirm("Are you sure? This cannot be undone."))
            update(()=>({ char:game.char,setup:true,onboardingDone:true,xp:0,gems:0,stats:{Physical:1,Mental:1,Spiritual:1,Social:1,Emotional:1},skillPoints:0,unlockedNodes:[],daily:[],quests:[],done:{},perms:[],actives:[],cosmetics:[],titles:[],title:null,theme:"default",aesthetic:"default",aura:false,shadowMission:null,shadowProgress:0,boss:null,bossHPLeft:0,abyssDepth:0,abyssActive:false,mood:null,lastMoodDate:null,lastDay:new Date().toISOString().split("T")[0],briefing:null,briefingDate:null,penaltyMessage:null,rivalEnabled:false,rival:null,weeklyReview:null,lastReviewDate:null,memory:{recentActivity:[],totalDays:0,avgCompletions:0,mostSkipped:null,longestStreak:0} }));
        }} danger>RESET ALL PROGRESS</Btn>
      </Card>

      <div style={{ textAlign:"center",marginTop:20,fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:T.dim }}>
        HABITQUEST V2 · BUILD BETTER HABITS
      </div>
    </div>
  );
}
FILEOF

# ── 9. UPDATE DailyScreen — add templates button ─────────────
python3 << 'PYEOF'
with open('src/screens/DailyScreen.jsx', 'r') as f:
    content = f.read()

# Add HabitTemplatesModal import
if 'HabitTemplatesModal' not in content:
    content = content.replace(
        'import { Card, Btn, DiffTag } from "../components/ui/index.jsx";',
        'import { Card, Btn, DiffTag } from "../components/ui/index.jsx";\nimport HabitTemplatesModal from "./HabitTemplatesModal.jsx";'
    )

# Add showTemplates state
content = content.replace(
    '  const [adding,setAdding]       = useState(false);',
    '  const [adding,setAdding]       = useState(false);\n  const [showTemplates,setShowTemplates] = useState(false);'
)

# Add modal render + templates button before the add habit button
old_add_btn = '        <button onClick={()=>setAdding(true)} style={{ width:"100%",marginTop:8,padding:"12px",background:"transparent",border:`1px dashed ${T.bg3}`'
new_add_btn = '''        {showTemplates && (
          <HabitTemplatesModal
            game={game} th={th}
            onClose={()=>setShowTemplates(false)}
            onApply={({daily:newDaily, quests:newQuests, mode})=>{
              update(s=>({
                ...s,
                daily: mode==="replace" ? newDaily.map(h=>({...h,id:Date.now()+Math.random()})) : [...(s.daily||[]), ...newDaily.map(h=>({...h,id:Date.now()+Math.random()}))],
                quests: mode==="replace" ? newQuests.map(q=>({...q,id:Date.now()+Math.random()})) : [...(s.quests||[]), ...newQuests.map(q=>({...q,id:Date.now()+Math.random()}))],
              }));
              showToast("Template applied!", "success");
            }}
          />
        )}
        <button onClick={()=>setShowTemplates(true)} style={{ width:"100%",marginTop:8,marginBottom:6,padding:"10px",background:"transparent",border:`1px dashed ${T.purple}40`,borderRadius:8,color:T.purple,fontFamily:FONTS.ui,fontSize:9,letterSpacing:3,cursor:"pointer",transition:"all 0.2s" }}
          onMouseEnter={e=>{e.target.style.borderColor=T.purple;e.target.style.opacity="0.8";}} onMouseLeave={e=>{e.target.style.borderColor=`${T.purple}40`;e.target.style.opacity="1";}}>
          ◈ HABIT TEMPLATES
        </button>
        <button onClick={()=>setAdding(true)} style={{ width:"100%",marginTop:8,padding:"12px",background:"transparent",border:`1px dashed ${T.bg3}`'''

if 'HABIT TEMPLATES' not in content:
    content = content.replace(old_add_btn, new_add_btn)

with open('src/screens/DailyScreen.jsx', 'w') as f:
    f.write(content)
print("DailyScreen updated")
PYEOF

# ── 10. UPDATE App.jsx — rival generation + rival card ───────
python3 << 'PYEOF'
with open('src/App.jsx', 'r') as f:
    content = f.read()

# Add RivalCard import
if 'RivalCard' not in content:
    content = content.replace(
        'import OptionsScreen    from "./screens/OptionsScreen.jsx";',
        'import OptionsScreen    from "./screens/OptionsScreen.jsx";\nimport RivalCard        from "./screens/RivalCard.jsx";'
    )

# Add rival generation function before signOut
old_signout = '  async function signOut() {'
new_rival = '''  async function generateRival() {
    const { buildCharContext, buildSystemPrompt, callAIProxy } = await import("./lib/ai.js");
    showToast("Generating your rival...", "info", 8000);
    try {
      const ctx = buildCharContext(game);
      const prompt = `Based on this player's data, generate a rival character. The rival should be strong in areas the player is weak, and have a personality that contrasts theirs.

Respond with ONLY a JSON object (no markdown, no explanation):
{
  "name": "rival's full name",
  "personality": "one sentence description of their personality and style",
  "taunt": "a short provocative quote from the rival directed at the player (max 15 words)",
  "xpOffset": -200
}

xpOffset should be between -400 and +100 (negative means rival starts slightly behind, positive means ahead).`;

      const reply = await callAIProxy(buildSystemPrompt(ctx), prompt, []);
      const clean = reply.replace(/```json|```/g, "").trim();
      const data  = JSON.parse(clean);
      const rivalXP = Math.max(0, (game.xp || 0) + (data.xpOffset || -200));
      update(s => ({
        ...s,
        rival: {
          name:        data.name || "The Shadow",
          personality: data.personality || "A ruthless competitor who never rests.",
          taunt:       data.taunt || "You think consistency is enough? Think again.",
          xp:          rivalXP,
        }
      }));
      showToast(`Rival generated: ${data.name}`, "danger", 4000);
    } catch(e) {
      showToast("Failed to generate rival: " + e.message, "danger");
    }
  }

  async function signOut() {'''

if 'generateRival' not in content:
    content = content.replace(old_signout, new_rival)

# Add RivalCard to status screen area
old_rival_area = '<ShadowMissionBar game={game}/>'
new_rival_area = '<RivalCard game={game} th={th}/>\n        <ShadowMissionBar game={game}/>'

if '<RivalCard' not in content:
    content = content.replace(old_rival_area, new_rival_area)

# Pass generateRival to OptionsScreen
content = content.replace(
    '{screen==="options"&&<OptionsScreen game={game} update={update} th={th} V={V} showToast={showToast} onSignOut={signOut}/>}',
    '{screen==="options"&&<OptionsScreen game={game} update={update} th={th} V={V} showToast={showToast} onSignOut={signOut} onGenerateRival={generateRival}/>}'
)

with open('src/App.jsx', 'w') as f:
    f.write(content)
print("App.jsx updated with rival logic")
PYEOF

echo ""
echo "✅ Rival System + The Architect + Habit Templates complete!"
echo ""
echo "New features:"
echo "  - Rival System: toggle in Options → Generate My Rival → appears on Status screen"
echo "  - The Architect: Options → Run Weekly Review → full pattern analysis"
echo "  - Habit Templates: Daily screen → ◈ HABIT TEMPLATES button → 6 packs"
echo "  - Completion timestamps now stored for time-of-day pattern analysis"
echo ""
echo "Run: npm run build (check for errors) then npm run dev -- --host 0.0.0.0"