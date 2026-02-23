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
    body: `Daily habits are the core of HabitQuest. Tasks you want to complete every single day — working out, reading, studying, whatever matters to you.

Each habit has a difficulty rank (F through S) and a stat type (Physical, Mental, Spiritual, Social, or Emotional). Completing it earns XP and gems based on difficulty.

Tap SET MOOD at the top of the Daily screen each morning — High Energy gives +25% XP, Low Energy reduces your penalty if you miss habits. You can only set it once per day.

Build streaks by completing habits on consecutive days. Miss a day and your streak resets.`,
  },
  {
    title: "Stats & The Radar Chart",
    icon: "✦",
    body: `Your character has 5 stats: Physical, Mental, Spiritual, Social, and Emotional.

Each stat grows when you complete habits assigned to it. The radar chart on your Status screen shows your balance at a glance — a well-rounded chart means you're developing across all areas.

Tap SHOW BARS on the Status screen to see the detailed breakdown beneath the radar chart.

Stats are used by the AI to identify your weaknesses and give personalised recommendations. A lopsided chart means the AI will push you to address the neglected areas.`,
  },
  {
    title: "Quests",
    icon: "◆",
    body: `Quests are larger one-off goals — things that take more than a single day. Write a project proposal. Run a 5K. Finish a course.

Each quest has a difficulty rank and a stat type. Completing a quest gives significantly more XP and gems than a daily habit, and boosts your stat by 3 points.

You can complete up to 5 quests per day. If you need more, buy extra quest slots in the shop using gems.

Quests can have notes attached — use these for context, sub-tasks, or anything relevant.`,
  },
  {
    title: "Skill Tree",
    icon: "🌿",
    body: `The skill tree lets you specialise your character. Every time you gain a level, you earn 1 Skill Point.

Spend Skill Points to unlock nodes — one branch per stat, each with 4 tiers. Invest heavily in one branch to unlock powerful perks for that stat. Cross-branch nodes unlock when you've invested in two different branches.

Your available Skill Points are shown in the header whenever you have some to spend.

Access the skill tree from the SKILLS tab.`,
  },
  {
    title: "The Penalty System",
    icon: "◌",
    body: `If you don't complete all your daily habits by midnight, you'll receive a penalty report the next morning — shown as a collapsible card at the top of your Status screen.

Missed habits increase your Abyss Depth. At depth 5+ you enter an active Abyss state shown at the top of the screen. Every habit you complete reduces your depth by 1.

The penalty system makes consistency feel meaningful — not to punish you for having a bad day. Life happens. The goal is to get back on track quickly.`,
  },
  {
    title: "AI Coaching",
    icon: "◈",
    body: `HabitQuest has a built-in AI coach that analyses your actual data — stats, streaks, habits, mood, and history.

Every morning you receive a personalised briefing on your Status screen: a short analysis of recent performance with a focus area for the day. It also generates a Bonus Mission tailored to your weak points — visible as a collapsible card on Status.

The AI tab lets you chat directly with the coach. Ask it to suggest quests, analyse your progress, or recommend what to focus on next.

You can also generate an AI Rival in Options — a character built around your weaknesses who levels up every day you play.`,
  },
  {
    title: "Navigation & Settings",
    icon: "★",
    body: `The nav bar has 7 tabs: STATUS, DAILY, QUESTS, SKILLS, SHOP, AI, and Options.

STATUS is your home screen — XP progress, today's completion, radar chart, briefing, and collapsible sections for rival and bonus mission.

Active boosts from the shop are hidden behind the BOOSTS button in the header to keep things clean.

Your character profile (name, bio, occupation) can be edited any time in Options at the top of the page. Themes and appearance are also in Options.

You can reopen this guide any time from Options.`,
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
