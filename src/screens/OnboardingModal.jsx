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
    title: "Daily Habits & Mood",
    icon: "⚔",
    body: `Daily habits are the core of HabitQuest — tasks you want to complete every single day. Each habit has a difficulty rank (F through S) and a stat type (Physical, Mental, Spiritual, Social, or Emotional). Completing it earns XP and gems based on difficulty.

Build streaks by completing habits on consecutive days. Miss a day and your streak resets — so consistency matters.

Each morning, tap SET MOOD on the Daily screen. High Energy gives +25% XP for the day. Low Energy softens your penalty if you miss habits. You can only set it once per day.

Use HABIT TEMPLATES to load a curated starter set if you're not sure where to begin.`,
  },
  {
    title: "Stats & The Radar Chart",
    icon: "✦",
    body: `Your character has 5 stats: Physical, Mental, Spiritual, Social, and Emotional. Each grows when you complete habits assigned to it.

The radar chart on your Status screen shows your balance at a glance. Tap SHOW BARS to see the detailed breakdown beneath it.

Stats are used by the AI to identify your weaknesses and give personalised recommendations. A lopsided chart means the AI will push you to address the areas you're neglecting.`,
  },
  {
    title: "Quests",
    icon: "◆",
    body: `Quests are larger one-off goals — things that take real effort. Write a project proposal. Run a 5K. Finish a course.

Each quest has a difficulty rank and stat type. Completing one gives significantly more XP and gems than a daily habit, and boosts your stat by 3 points.

You can complete up to 5 quests per day. Buy extra quest slots in the Shop if you need more. Attach notes to quests for context or sub-tasks.`,
  },
  {
    title: "Skill Tree",
    icon: "🌿",
    body: `Every time you level up, you earn 1 Skill Point — shown in the header when you have some to spend.

The skill tree has one branch per stat, each with 4 tiers. Unlock nodes to gain permanent passive bonuses: faster XP, gem multipliers, streak protection, and more.

Cross-branch nodes unlock when you've invested in two different branches, rewarding balanced development.

Access the skill tree from the SKILLS tab.`,
  },
  {
    title: "Habit Decay",
    icon: "◌",
    body: `Miss habits and your Habit Decay increases — 1 point per missed habit at the end of each day. The deeper it gets, the more it hurts.

At depth 5+ a warning bar appears at the top of the app. Your gem income is penalised based on how deep you've fallen: depth 5 = -20% gems, depth 10 = -35%, depth 15 = -50%. The deeper you go, the harder it is to rebuild your economy and buy boosts.

Recovery: every habit you complete reduces decay by 1. Miss 3 habits and you need 3 completions just to break even. Bonus Missions reduce decay faster — use them when you're in the hole.

You'll receive a penalty report each morning after a missed day. Acknowledge it and get back on track.`,
  },
  {
    title: "Bonus Missions & AI Briefing",
    icon: "◈",
    body: `Every morning your AI generates a personalised Briefing on your Status screen — a short analysis of recent performance with a specific focus area for the day.

It also generates a Bonus Mission: a new personalised task targeted at your weakest stat — something concrete you wouldn't normally do. It appears as a highlighted card at the top of your Daily screen. Tap it to complete it and earn +180 XP, +18 gems, and −2 Habit Decay.

The AI tab lets you chat directly with your coach. Ask it to suggest quests, analyse your stats, or tell you what to focus on next. The more data you build up, the sharper its advice becomes.`,
  },
  {
    title: "The Rival System",
    icon: "⚔",
    body: `Enable the Rival System in Options. The AI generates a rival character built around your weaknesses — stronger where you are weak.

Your rival gains XP every day at midnight, calculated from your own average daily completions over the last 30 days. Average 3 habits a day and they gain roughly 180 XP per day. They start behind you, but that head start won't last if you slack off.

When your rival overtakes you, they begin siphoning your XP — every habit earns less until you pull back ahead:
· 1 level behind = -10% XP
· 3 levels behind = -25% XP
· 5+ levels behind = -40% XP

Disable the rival in Options at any time to remove the siphon. Check the Rival card on Status to track the gap.`,
  },
  {
    title: "Shop, Settings & You're Ready",
    icon: "★",
    body: `The Shop lets you spend gems on temporary boosts (XP Boost, Gem Boost, Streak Shield), permanent upgrades, and cosmetics like titles and the avatar glow effect. Active boosts are shown under the BOOSTS button in the header.

Your character profile — name, bio, occupation — can be edited any time in Options. Themes are there too.

A few tips to get started:
· Set your mood every morning in the Daily tab
· Check your AI briefing on Status each day
· Visit Skills once you've levelled up a few times
· Use the Shop when you've saved enough gems

You can reopen this guide any time from Options. Good luck.`,
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
        <div style={{ height:2,background:"var(--bg3)" }}>
          <div style={{ height:"100%",width:`${((step+1)/STEPS.length)*100}%`,background:th.accent,transition:"width 0.4s ease" }}/>
        </div>

        <div style={{ padding:28 }}>
          {/* Step counter */}
          <div style={{ fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:3,color:T.dim,marginBottom:16 }}>
            STEP {step+1} OF {STEPS.length}
          </div>

          {/* Icon + title */}
          <div style={{ display:"flex",alignItems:"center",gap:14,marginBottom:20 }}>
            <div style={{ width:48,height:48,borderRadius:10,background:`${th.accent}15`,border:`1px solid ${th.accent}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,color:th.accent,flexShrink:0 }}>
              {current.icon}
            </div>
            <div style={{ fontFamily:"var(--font-display)",fontSize:22,color:T.textBright,lineHeight:1.2 }}>
              {current.title}
            </div>
          </div>

          {/* Body */}
          <div style={{ fontFamily:"var(--font-ui)",fontSize:12,color:T.silver,lineHeight:1.9,whiteSpace:"pre-wrap",marginBottom:28,maxHeight:260,overflowY:"auto" }}>
            {current.body}
          </div>

          {/* Navigation */}
          <div style={{ display:"flex",gap:10,alignItems:"center" }}>
            {step > 0 && (
              <button onClick={()=>setStep(s=>s-1)} style={{ padding:"10px 16px",background:"transparent",border:`1px solid var(--bg3)`,borderRadius:6,color:T.dim,fontFamily:"var(--font-ui)",fontSize:9,letterSpacing:2,cursor:"pointer" }}>
                BACK
              </button>
            )}
            <div style={{ flex:1 }}/>
            {/* Dot indicators */}
            <div style={{ display:"flex",gap:5 }}>
              {STEPS.map((_,i)=>(
                <div key={i} onClick={()=>setStep(i)} style={{ width:i===step?16:6,height:6,borderRadius:3,background:i===step?th.accent:"var(--bg3)",transition:"all 0.3s",cursor:"pointer" }}/>
              ))}
            </div>
            <div style={{ flex:1 }}/>
            <button onClick={isLast?onClose:()=>setStep(s=>s+1)} style={{ padding:"10px 20px",background:`${th.accent}15`,border:`1px solid ${th.accent}50`,borderRadius:6,color:th.accent,fontFamily:"var(--font-ui)",fontSize:9,letterSpacing:2,cursor:"pointer",transition:"all 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.background=`${th.accent}25`}
              onMouseLeave={e=>e.currentTarget.style.background=`${th.accent}15`}>
              {isLast?"LET'S GO":"NEXT"}
            </button>
          </div>

          {/* Skip */}
          {!isLast && (
            <div style={{ textAlign:"center",marginTop:14 }}>
              <button onClick={onClose} style={{ background:"none",border:"none",color:T.dim,fontFamily:"var(--font-ui)",fontSize:9,cursor:"pointer",letterSpacing:1 }}>
                Skip guide
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
