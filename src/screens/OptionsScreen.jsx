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
      <Card style={{ marginBottom:14,border:`1px solid ${game.rivalEnabled?"#b0303030":"var(--bg3)"}` }}>
        <SecTitle col={game.rivalEnabled?T.danger:T.dim}>Rival System</SecTitle>
        <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim,lineHeight:1.7,marginBottom:12 }}>
          The AI generates a rival based on your weaknesses. They level up every day you play — stay ahead or fall behind.
          {game.rival && <span style={{ color:T.silver }}> Current rival: <strong>{game.rival.name}</strong>.</span>}
        </div>
        <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:game.rivalEnabled?10:0 }}>
          <button onClick={()=>update(s=>({...s,rivalEnabled:!s.rivalEnabled}))} style={{ display:"flex",alignItems:"center",gap:8,padding:"9px 14px",background:game.rivalEnabled?`${T.danger}15`:"transparent",border:`1px solid ${game.rivalEnabled?T.danger:"var(--bg3)"}`,borderRadius:6,color:game.rivalEnabled?T.danger:T.dim,fontFamily:FONTS.ui,fontSize:9,letterSpacing:2,cursor:"pointer",transition:"all 0.2s" }}>
            <div style={{ width:10,height:10,borderRadius:"50%",background:game.rivalEnabled?T.danger:"var(--bg3)",transition:"background 0.2s" }}/>
            {game.rivalEnabled?"RIVAL ENABLED":"RIVAL DISABLED"}
          </button>
        </div>
        {game.rivalEnabled && !game.rival && (
          <Btn full onClick={onGenerateRival}>GENERATE MY RIVAL</Btn>
        )}
        {game.rivalEnabled && game.rival && (
          <button onClick={()=>{ if(window.confirm("Replace your current rival?")) onGenerateRival(); }} style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,padding:"6px 12px",background:"transparent",border:`1px solid var(--bg3)`,borderRadius:4,color:T.dim,cursor:"pointer" }}>
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
            <button key={key} onClick={()=>{update(s=>({...s,theme:key}));showToast(`Theme changed to ${val.name}.`,"gold");}} style={{ display:"flex",alignItems:"center",gap:6,padding:"7px 12px",background:game.theme===key?`${val.accent}15`:"transparent",border:`1px solid ${game.theme===key?val.accent:"var(--bg3)"}`,borderRadius:5,cursor:"pointer",transition:"all 0.2s" }}>
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
