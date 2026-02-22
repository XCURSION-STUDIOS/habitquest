import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./lib/supabase.js";
import { buildCharContext, buildSystemPrompt, callAIProxy } from "./lib/ai.js";
import { TODAY, getLevel, getClass, rolloverDay, applyCompleteDaily, applyCompleteQuest, applyBuyItem } from "./lib/gameLogic.js";
import { DEFAULT_GAME } from "./constants/gameData.js";
import { T, FONTS, THEMES } from "./constants/theme.js";

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

// Temporary error display for debugging
window.addEventListener('error', (e) => {
  document.body.innerHTML = `<div style="background:#06060f;color:#ff6060;padding:20px;font-family:monospace;font-size:11px;white-space:pre-wrap;word-break:break-all">${e.message}\n\n${e.filename}:${e.lineno}</div>`
})
window.addEventListener('unhandledrejection', (e) => {
  document.body.innerHTML = `<div style="background:#06060f;color:#ff6060;padding:20px;font-family:monospace;font-size:11px;white-space:pre-wrap;word-break:break-all">PROMISE: ${e.reason}</div>`
})

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
