import { useState } from "react";
import { getLevel, getXPInLevel, getXPForLevel, rolloverDay, TODAY, getMultipliers } from "../lib/gameLogic.js";
import { T, FONTS, THEMES } from "../constants/theme.js";
import { Card, SecTitle, Btn } from "../components/ui/index.jsx";
import OnboardingModal from "./OnboardingModal.jsx";
import WeeklyReviewModal from "./WeeklyReviewModal.jsx";

export default function OptionsScreen({ game, update, th, showToast, onSignOut, onGenerateRival }) {
  const [showGuide,  setShowGuide]  = useState(false);
  const [showDev,    setShowDev]    = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [charForm,   setCharForm]   = useState(game.char);
  const inp = { width:"100%",background:"var(--bg2)",border:"1px solid var(--bg3)",borderRadius:6,color:"var(--text)",padding:"9px 12px",fontFamily:"var(--font-ui)",fontSize:12,outline:"none",marginBottom:8,boxSizing:"border-box" };

  const lastReview = game.lastReviewDate
    ? new Date(game.lastReviewDate).toLocaleDateString()
    : "Never";

  return (
    <div>
      {showGuide  && <OnboardingModal onClose={()=>setShowGuide(false)} th={th}/>}
      {showReview && <WeeklyReviewModal game={game} onClose={()=>{setShowReview(false); update(s=>({...s,lastReviewDate:new Date().toISOString()}));}} th={th} showToast={showToast}/>}

      <Card style={{ marginBottom:14 }}>
        <SecTitle col={th.accent}>Character Profile</SecTitle>
        {["name","age","occupation"].map(k=>(
          <input key={k} value={charForm[k]||""} onChange={e=>setCharForm(x=>({...x,[k]:e.target.value}))} placeholder={k} style={inp}/>
        ))}
        <textarea value={charForm.bio||""} onChange={e=>setCharForm(x=>({...x,bio:e.target.value}))} placeholder="Bio (optional)" style={{ ...inp,height:64,resize:"none",marginBottom:10 }}/>
        <Btn onClick={()=>{update(s=>({...s,char:charForm}));showToast("Profile updated.","gold");}} full>SAVE PROFILE</Btn>
      </Card>

      {/* The Architect */}
      <Card style={{ marginBottom:14,border:`1px solid ${T.sg}30` }}>
        <SecTitle col={T.sg}>The Architect — Weekly Review</SecTitle>
        <div style={{ fontFamily:"var(--font-ui)",fontSize:10,color:T.dim,lineHeight:1.7,marginBottom:12 }}>
          A structured AI analysis of your full week. Identifies patterns, correlates mood and timing data, and prescribes specific changes. Last review: {lastReview}.
        </div>
        <Btn full onClick={()=>setShowReview(true)}>RUN WEEKLY REVIEW</Btn>
      </Card>

      {/* Rival System */}
      <Card style={{ marginBottom:14,border:`1px solid ${game.rivalEnabled?"#b0303030":"var(--bg3)"}` }}>
        <SecTitle col={game.rivalEnabled?T.danger:T.dim}>Rival System</SecTitle>
        <div style={{ fontFamily:"var(--font-ui)",fontSize:10,color:T.dim,lineHeight:1.7,marginBottom:12 }}>
          The AI generates a rival based on your weaknesses. They level up every day you play — stay ahead or fall behind.
          {game.rival && <span style={{ color:T.silver }}> Current rival: <strong>{game.rival.name}</strong>.</span>}
        </div>
        <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:game.rivalEnabled?10:0 }}>
          <button onClick={()=>update(s=>({...s,rivalEnabled:!s.rivalEnabled}))} style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 14px",background:game.rivalEnabled?`${T.danger}15`:"transparent",border:`1px solid ${game.rivalEnabled?T.danger:"var(--bg3)"}`,borderRadius:6,color:game.rivalEnabled?T.danger:T.dim,fontFamily:"var(--font-ui)",fontSize:9,letterSpacing:2,cursor:"pointer",transition:"all 0.2s" }}>
            <div style={{ width:10,height:10,borderRadius:"50%",background:game.rivalEnabled?T.danger:"var(--bg3)",transition:"background 0.2s" }}/>
            {game.rivalEnabled?"RIVAL ENABLED":"RIVAL DISABLED"}
          </button>
        </div>
        {game.rivalEnabled && !game.rival && (
          <Btn full onClick={onGenerateRival}>GENERATE MY RIVAL</Btn>
        )}
        {game.rivalEnabled && game.rival && (
          <button onClick={()=>{ if(window.confirm("Replace your current rival?")) onGenerateRival(); }} style={{ fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:2,padding:"6px 12px",background:"transparent",border:`1px solid var(--bg3)`,borderRadius:4,color:T.dim,cursor:"pointer" }}>
            REGENERATE RIVAL
          </button>
        )}
      </Card>

      {/* Guide */}
      <Card style={{ marginBottom:14 }}>
        <SecTitle col={th.accent}>Help & Guide</SecTitle>
        <div style={{ fontFamily:"var(--font-ui)",fontSize:10,color:T.dim,lineHeight:1.7,marginBottom:12 }}>
          New to HabitQuest? The guide covers everything — habits, stats, quests, the skill tree, and the AI coach.
        </div>
        <Btn full onClick={()=>setShowGuide(true)}>OPEN GUIDE</Btn>
      </Card>

      {/* Appearance */}
      <Card style={{ marginBottom:14 }}>
        <SecTitle col={th.accent}>Appearance</SecTitle>
        <div style={{ fontFamily:"var(--font-ui)",fontSize:9,color:T.dim,marginBottom:10 }}>Current theme: {THEMES[game.theme]?.name||"Classic Gold"}</div>
        <div style={{ display:"flex",gap:8,flexWrap:"wrap" }}>
          {Object.entries(THEMES).map(([key,val])=>(
            <button key={key} onClick={()=>{update(s=>({...s,theme:key}));showToast(`Theme changed to ${val.name}.`,"gold");}} style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 12px",background:game.theme===key?`${val.accent}15`:"transparent",border:`1px solid ${game.theme===key?val.accent:"var(--bg3)"}`,borderRadius:5,cursor:"pointer",transition:"all 0.2s" }}>
              <div style={{ width:10,height:10,borderRadius:"50%",background:val.accent }}/>
              <span style={{ fontFamily:"var(--font-ui)",fontSize:9,color:game.theme===key?val.accent:T.dim }}>{val.name}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* Account */}
      <Card style={{ marginBottom:14 }}>
        <SecTitle col={th.accent}>Account</SecTitle>
        <div style={{ fontFamily:"var(--font-ui)",fontSize:10,color:T.dim,marginBottom:12,lineHeight:1.6 }}>
          Your data is saved automatically and synced across devices.
        </div>
        <Btn onClick={onSignOut} danger full>SIGN OUT</Btn>
      </Card>

      {/* Danger Zone */}
      <Card style={{ marginBottom:14 }}>
        <SecTitle col={T.danger}>Danger Zone</SecTitle>
        <div style={{ fontFamily:"var(--font-ui)",fontSize:10,color:T.dim,marginBottom:12,lineHeight:1.6 }}>
          Resetting your progress cannot be undone. All XP, gems, stats, and habits will be lost.
        </div>
        <Btn onClick={()=>{
          if(window.confirm("Are you sure? This cannot be undone."))
            update(()=>({ char:game.char,setup:true,onboardingDone:true,xp:0,gems:0,stats:{Physical:1,Mental:1,Spiritual:1,Social:1,Emotional:1},skillPoints:0,unlockedNodes:[],daily:[],quests:[],done:{},perms:[],actives:[],cosmetics:[],titles:[],title:null,theme:"default",aesthetic:"default",aura:false,bonusMission:null,bonusProgress:0,boss:null,bossHPLeft:0,abyssDepth:0,abyssActive:false,mood:null,lastMoodDate:null,lastDay:new Date().toISOString().split("T")[0],briefing:null,briefingDate:null,penaltyMessage:null,rivalEnabled:false,rival:null,weeklyReview:null,lastReviewDate:null,memory:{recentActivity:[],totalDays:0,avgCompletions:0,mostSkipped:null,longestStreak:0} }));
        }} danger>RESET ALL PROGRESS</Btn>
      </Card>

      <div style={{ textAlign:"center",marginTop:20,fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:2,color:T.dim }}>
        HABITQUEST V2 · BUILD BETTER HABITS
      </div>
      <div style={{ textAlign:"center",marginTop:8 }}>
        <button onClick={()=>setShowDev(v=>!v)}
          style={{ fontFamily:"var(--font-ui)",fontSize:7,letterSpacing:2,color:T.dim,background:"none",border:`1px solid var(--bg3)`,borderRadius:4,padding:"3px 10px",cursor:"pointer",opacity:0.4 }}>
          {showDev?"HIDE DEV":"DEV"}
        </button>
      </div>

      {showDev&&(()=>{
        const myLevel   = getLevel(game.xp);
        const rivalLevel = game.rival ? getLevel(game.rival.xp||0) : null;
        const today     = TODAY();
        const decayDepth = game.decayDepth||0;
        const gap       = rivalLevel ? myLevel - rivalLevel : null;
        const catchUpMult = gap !== null ? (gap > 0 ? 1+Math.min(gap*0.15,1.5) : Math.max(1-Math.abs(gap)*0.05,0.7)) : null;
        const avgComp   = game.memory?.recentActivity?.length
          ? (game.memory.recentActivity.reduce((a,r)=>a+r.count,0)/game.memory.recentActivity.length).toFixed(2)
          : "N/A";
        // Habit completion rate
        const recentAct = game.memory?.recentActivity || [];
        const last7  = recentAct.slice(-7);
        const last30 = recentAct.slice(-30);
        const habitCount = game.daily?.length || 1;
        const rate7  = last7.length  ? ((last7.reduce((a,r)=>a+r.count,0)  / (last7.length  * habitCount)) * 100).toFixed(1) + "%" : "N/A";
        const rate30 = last30.length ? ((last30.reduce((a,r)=>a+r.count,0) / (last30.length * habitCount)) * 100).toFixed(1) + "%" : "N/A";

        // Projected rival XP tonight
        const projectedRivalXP = catchUpMult !== null
          ? Math.round(parseFloat(avgComp) * 60 * 0.85 * catchUpMult)
          : null;

        // Storage size
        const saveStr = JSON.stringify(game);
        const saveKB  = (new Blob([saveStr]).size / 1024).toFixed(1) + " KB";
        const doneKeys = Object.keys(game.done || {}).length;

        // XP sources (approximate from memory)
        const totalDays = game.memory?.totalDays || 1;
        const estHabitXP = Math.round((game.memory?.recentActivity||[]).reduce((a,r)=>a+r.count,0) * 60);

        // Recent penalty history
        const penaltyHistory = game.memory?.recentActivity?.slice(-5).reverse() || [];

        const rows = [
          ["── DATES ──", ""],
          ["today", today],
          ["lastDay", game.lastDay],
          ["rollover due", game.lastDay !== today ? "YES" : "no"],
          ["── PLAYER ──", ""],
          ["xp", game.xp],
          ["level", myLevel],
          ["xp in level", getXPInLevel(game.xp)],
          ["xp needed", getXPForLevel(myLevel)],
          ["gems", game.gems],
          ["decay depth", decayDepth],
          ["decay active", game.decayActive ? "yes" : "no"],
          ["── HABITS ──", ""],
          ["habit count", habitCount],
          ["completion rate 7d", rate7],
          ["completion rate 30d", rate30],
          ["avg completions/day", avgComp],
          ["── RIVAL ──", ""],
          ["enabled", game.rivalEnabled ? "yes" : "no"],
          ["name", game.rival?.name || "none"],
          ["xp", game.rival?.xp ?? "—"],
          ["level", rivalLevel ?? "—"],
          ["level gap", gap !== null ? (gap > 0 ? `player +${gap}` : gap < 0 ? `rival +${Math.abs(gap)}` : "tied") : "—"],
          ["catchup mult", catchUpMult !== null ? catchUpMult.toFixed(2)+"x" : "—"],
          ["proj. XP tonight", projectedRivalXP !== null ? projectedRivalXP : "—"],
          ...(game.rival?.stats ? Object.entries(game.rival.stats).map(([k,v])=>[`rival ${k}`, Math.round(v)]) : []),
          ["── MEMORY ──", ""],
          ["total days tracked", game.memory?.totalDays ?? 0],
          ["longest streak", game.memory?.longestStreak ?? 0],
          ["── STORAGE ──", ""],
          ["save size", saveKB],
          ["done entries", doneKeys + " days"],
          ["est. habit XP earned", estHabitXP],
          ["── BUFFS & DEBUFFS ──", ""],
          ["xp multiplier", (()=>{ const {xm} = getMultipliers(game); return xm.toFixed(2)+"x" + (xm>1?" ▲":" ▼"); })()],
          ["gem multiplier", (()=>{ const {gm} = getMultipliers(game); return gm.toFixed(2)+"x" + (gm>1?" ▲":" ▼"); })()],
          ["mood", game.mood || "none"],
          ["active boosts", (game.actives||[]).map(a=>a.id).join(", ")||"none"],
          ["perm unlocks", (game.perms||[]).map(p=>p.id).join(", ")||"none"],
          ["skill nodes", (game.unlockedNodes||[]).length + " unlocked"],
          ["── COSMETICS ──", ""],
          ["aesthetic", game.aesthetic||"default"],
          ["theme", game.theme||"default"],
          ["activeFrame", game.activeFrame||"none"],
          ["activeXpBar", game.activeXpBar||"none"],
          ["owned cosmetics", (game.cosmetics||[]).join(", ")||"none"],
        ];
        return (
          <div style={{ marginTop:16,padding:14,background:"var(--bg1)",border:`1px solid ${th.accent}40`,borderRadius:8 }}>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10 }}>
              <span style={{ fontFamily:"var(--font-ui)",fontSize:9,letterSpacing:2,color:th.accent }}>DEV PANEL</span>
              <div style={{ display:"flex",gap:8 }}>
                <button onClick={()=>update(s=>rolloverDay(s,today))}
                  style={{ fontFamily:"var(--font-ui)",fontSize:8,padding:"4px 8px",background:`${th.accent}15`,border:`1px solid ${th.accent}40`,borderRadius:4,color:th.accent,cursor:"pointer" }}>
                  FORCE ROLLOVER
                </button>
                <button onClick={()=>update(s=>({...s,decayDepth:Math.min((s.decayDepth||0)+1,20)}))}
                  style={{ fontFamily:"var(--font-ui)",fontSize:8,padding:"4px 8px",background:"transparent",border:`1px solid ${T.danger}40`,borderRadius:4,color:T.danger,cursor:"pointer" }}>
                  +DECAY
                </button>
                <button onClick={()=>update(s=>({...s,decayDepth:Math.max((s.decayDepth||0)-1,0)}))}
                  style={{ fontFamily:"var(--font-ui)",fontSize:8,padding:"4px 8px",background:"transparent",border:`1px solid var(--success)`,borderRadius:4,color:"var(--success)",cursor:"pointer" }}>
                  −DECAY
                </button>
                <button onClick={()=>setShowDev(false)}
                  style={{ fontFamily:"var(--font-ui)",fontSize:8,padding:"4px 8px",background:"transparent",border:`1px solid var(--bg3)`,borderRadius:4,color:T.dim,cursor:"pointer" }}>
                  CLOSE
                </button>
              </div>
            </div>
            {rows.map(([k,v],i)=>k.startsWith("──") ? (
              <div key={i} style={{ fontFamily:"var(--font-ui)",fontSize:7,letterSpacing:2,color:th.accent,marginTop:8,marginBottom:4 }}>{k}</div>
            ) : (
              <div key={i} style={{ display:"flex",justifyContent:"space-between",fontFamily:"var(--font-ui)",fontSize:9,color:T.silver,borderBottom:`1px solid var(--bg3)`,padding:"3px 0" }}>
                <span style={{ color:T.dim }}>{k}</span>
                <span>{String(v)}</span>
              </div>
            ))}
          {penaltyHistory.length > 0 && (
            <div style={{ marginTop:12 }}>
              <div style={{ fontFamily:"var(--font-ui)",fontSize:7,letterSpacing:2,color:th.accent,marginBottom:6 }}>── RECENT ACTIVITY (LAST 5 DAYS) ──</div>
              {penaltyHistory.map((r,i)=>(
                <div key={i} style={{ display:"flex",justifyContent:"space-between",fontFamily:"var(--font-ui)",fontSize:9,color:T.silver,borderBottom:`1px solid var(--bg3)`,padding:"3px 0" }}>
                  <span style={{ color:T.dim }}>{r.date}</span>
                  <span>{r.count}/{habitCount} habits · mood: {r.mood||"—"}</span>
                </div>
              ))}
            </div>
          )}
          </div>
        );
      })()}
    </div>
  );
}
