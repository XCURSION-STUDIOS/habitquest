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
        <div style={{ height:2,background:"var(--bg3)" }}>
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
              <button onClick={()=>setStep(s=>s-1)} style={{ padding:"10px 16px",background:"transparent",border:`1px solid var(--bg3)`,borderRadius:6,color:T.dim,fontFamily:FONTS.ui,fontSize:9,letterSpacing:2,cursor:"pointer" }}>
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
