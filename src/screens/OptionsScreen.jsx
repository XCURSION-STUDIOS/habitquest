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
