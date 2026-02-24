import { useState, useEffect, useRef, useCallback } from "react";
import { supabase } from "./lib/supabase.js";
import { buildCharContext, buildSystemPrompt, callAIProxy } from "./lib/ai.js";
import { TODAY, getLevel, getClass, rolloverDay, applyCompleteDaily, applyCompleteQuest, applyBuyItem } from "./lib/gameLogic.js";
import { DEFAULT_GAME } from "./constants/gameData.js";
import { T, FONTS, THEMES, AESTHETICS, getVisuals } from "./constants/theme.js";

import GlobalCSS        from "./components/ui/GlobalCSS.jsx";
import Toast            from "./components/ui/Toast.jsx";
import Header           from "./components/layout/Header.jsx";

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

// Nav order for direction detection
const NAV_ORDER = ["status","daily","quests","skills","shop","system","options"];

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
  const [prevScreen,setPrevScreen]   = useState("status");
  const [transitioning,setTransitioning] = useState(false);
  const [transDir,setTransDir]       = useState(1); // 1 = right, -1 = left
  const [toast,setToast]             = useState(null);
  const [lvlAnim,setLvlAnim]         = useState(null);
  const [aiStatus,setAiStatus]       = useState("idle");
  const [briefingLoading,setBriefingLoading] = useState(false);
  const [previewOverride,setPreviewOverride] = useState(null);
  const [showOnboarding,setShowOnboarding]   = useState(false);
  const transTimerRef = useRef(null);

  const showToast = useCallback((msg,type="gold",dur=3000)=>{
    setToast({msg,type}); setTimeout(()=>setToast(null),dur);
  },[]);

  // Animated screen switch
  const navigateTo = useCallback((newScreen) => {
    if (newScreen === screen || transitioning) return;
    const fromIdx = NAV_ORDER.indexOf(screen);
    const toIdx   = NAV_ORDER.indexOf(newScreen);
    const dir = toIdx >= fromIdx ? 1 : -1;
    setTransDir(dir);
    setTransitioning(true);
    clearTimeout(transTimerRef.current);
    transTimerRef.current = setTimeout(() => {
      setScreen(newScreen);
      setPrevScreen(screen);
      setTransitioning(false);
    }, 220);
  }, [screen, transitioning]);

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
      const prompt=`Give this player a morning briefing. 3-4 sentences: note yesterday's performance, identify their most critical weak area, give a clear directive for today.

Then generate a specific bonus mission for today — a concrete new action they wouldn't normally do, targeted at their weakest stat. It should be achievable in one day and feel meaningful. Do NOT just repeat one of their existing habits.

Label it exactly: BONUS MISSION: [mission name] | [short description of what to do]`;
      const text=await callAIProxy(sys,prompt);
      let briefingText=text,bonusMission=game.bonusMission;
      const match=text.match(/BONUS MISSION:\s*(.+?)(?:\n|$)/i);
      if(match&&!game.bonusMission){
        const parts = match[1].split("|").map(s=>s.trim());
        const bmName = parts[0] || "Daily Bonus Mission";
        const bmDesc = parts[1] || parts[0] || "";
        bonusMission={id:`ai_${Date.now()}`,name:bmName,desc:bmDesc,req:{type:"Any",count:1},xp:180,gems:18,aiGenerated:true,done:false};
        briefingText=text.replace(/BONUS MISSION:.*$/im,"").trim();
      }
      update(s=>({...s,briefing:briefingText,briefingDate:today,bonusMission}));
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
    if(item._reapply){
      if(item.type==="aesthetic"){
        update(s=>({...s,aesthetic:item.aesthetic}));
        showToast(`${item.name} applied.`,"gold");
      } else if(item.id==="aura"){
        update(s=>({...s,aura:!s.aura}));
        showToast(game.aura?"Glow effect disabled.":"Glow effect enabled.","gold");
      } else if(item.titleVal){
        const newTitle = game.title===item.titleVal ? null : item.titleVal;
        update(s=>({...s,title:newTitle}));
        showToast(newTitle?`Title "${newTitle}" equipped.`:"Title removed.","gold");
      } else if(item.frameVal){
        const isActive = game.activeFrame === item.id;
        update(s=>({...s, activeFrame: isActive ? null : item.id}));
        showToast(isActive?`${item.name} deactivated.`:`${item.name} equipped.`,"gold");
      } else if(item.xpBarVal){
        const isActive = game.activeXpBar === item.id;
        update(s=>({...s, activeXpBar: isActive ? null : item.id}));
        showToast(isActive?`${item.name} deactivated.`:`${item.name} equipped.`,"gold");
      }
      return;
    }
    const {game:next,error}=applyBuyItem(game,item);
    if(error){ showToast(error,"danger"); return; }
    showToast(item.type==="perm"?`${item.name} unlocked permanently.`:item.type==="aesthetic"?`${item.name} aesthetic applied.`:item.type==="theme"?`Theme changed to ${item.name}.`:`${item.name} activated.`,"gold");
    update(()=>next);
  }

  function handlePreview(overrides) { setPreviewOverride(overrides); }
  function handlePreviewEnd() { setPreviewOverride(null); }

  async function generateRival() {
    const { buildCharContext, buildSystemPrompt, callAIProxy } = await import("./lib/ai.js");
    showToast("Generating your rival...", "info", 8000);
    try {
      const ctx = buildCharContext(game);
      const randomSeed = Math.random().toString(36).substring(2,8);
      const prompt = `Based on this player's data, generate a rival character (seed: ${randomSeed}). The name should feel mystical and evocative but varied — draw inspiration from diverse cultures, mythologies, and languages worldwide. Each generation should feel distinctly different. The personality should contrast the player's in an interesting way.

Respond with ONLY a JSON object (no markdown, no explanation):
{
  "name": "rival's full name",
  "personality": "one sentence description of their personality and style",
  "taunt": "a short provocative quote from the rival directed at the player (max 15 words)",
  "xpOffset": -200,
  "stats": {
    "Physical": 7,
    "Mental": 5,
    "Spiritual": 4,
    "Social": 6,
    "Emotional": 3
  }
}

Stats should be values 1-10. Make the rival strong (7-10) in the player's weakest stats and weaker (1-5) in the player's strongest stats. xpOffset should be between -400 and +100.`;

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
          stats:       data.stats || { Physical:7, Mental:7, Spiritual:7, Social:7, Emotional:7 },
        }
      }));
      showToast(`Rival generated: ${data.name}`, "danger", 4000);
    } catch(e) {
      showToast("Failed to generate rival: " + e.message, "danger");
    }
  }

  async function signOut() {
    await supabase.auth.signOut();
    setGame(DEFAULT_GAME); setUser(null); setScreen("status");
  }

  const previewTheme = previewOverride?.theme || game.theme;
  const previewAesthetic = previewOverride?.aesthetic || game.aesthetic;
  const previewAura = previewOverride?.aura ?? game.aura;
  const previewTitle = previewOverride?.title ?? game.title;
  const previewCosmetics = previewOverride?.cosmetics ?? game.cosmetics;
  const displayGame = previewOverride
    ? { ...game, theme:previewTheme, aesthetic:previewAesthetic, aura:previewAura, title:previewTitle, cosmetics:previewCosmetics }
    : game;
  const V  = getVisuals(displayGame);
  const th = V.th;

  if(authLoading) return (
    <div style={{background:"var(--bg0)",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"}}>
      <GlobalCSS V={V}/>
      <div style={{fontFamily:"var(--font-display)",fontSize:32,color:"#c9a84c",animation:"pulse 1.5s ease-in-out infinite"}}>◈</div>
    </div>
  );

  if(!user)       return <AuthScreen onAuth={u=>setUser(u)}/>;
  if(!game.setup) return <SetupScreen th={th} onComplete={char=>update(s=>({...s,char,setup:true}))}/>;

  const today2    = TODAY();
  const todayDone = game.done?.[today2]||{};
  const doneCount = game.daily?.filter(q=>todayDone[q.id]).length||0;
  const allDone   = doneCount===(game.daily?.length||0)&&(game.daily?.length||0)>0;

  // Transition styles
  const slideOut = {
    transform: transitioning ? `translateX(${-transDir * 40}px) scale(0.97)` : "translateX(0) scale(1)",
    opacity: transitioning ? 0 : 1,
    transition: "transform 0.22s cubic-bezier(0.4,0,0.2,1), opacity 0.22s ease",
    pointerEvents: transitioning ? "none" : "auto",
  };

  return (
    <div className="app-wrapper" style={{fontFamily:"var(--font-ui)",color:"var(--text)",position:"relative"}}>
      <GlobalCSS V={V}/>
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
            <div style={{fontFamily:"var(--font-ui)",fontSize:10,letterSpacing:6,color:T.dim,marginBottom:16}}>LEVEL UP</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:96,color:th.accent,lineHeight:1,textShadow:`0 0 60px ${th.glow}`}}>{lvlAnim}</div>
            <div style={{fontFamily:"var(--font-display)",fontSize:28,color:T.text,marginTop:8}}>{getClass(lvlAnim).name}</div>
            <div style={{fontFamily:"var(--font-ui)",fontSize:9,color:T.purple,marginTop:8,letterSpacing:2}}>+1 SKILL POINT EARNED</div>
          </div>
        </div>
      )}

      {game.decayActive&&(
        <div style={{background:T.abyss,borderBottom:"1px solid #6a000050",padding:"7px 16px"}}>
          <span style={{fontFamily:"var(--font-ui)",fontSize:9,letterSpacing:3,color:"#dd5050"}}>
            ⚠ HABIT DECAY — Depth {game.decayDepth}/20 — Complete habits to recover
          </span>
        </div>
      )}

      <Header game={displayGame} screen={screen} setScreen={navigateTo} aiStatus={aiStatus} saving={saving} V={V}/>


      <div className="screen-padding" style={slideOut}>
        {screen==="status" &&<StatusScreen game={game} update={update} th={th} V={V} showToast={showToast} briefingLoading={briefingLoading} generateBriefing={generateBriefing} onSignOut={signOut}/>}
        {screen==="daily"  &&<DailyScreen  game={game} update={update} th={th} V={V} today={today2} todayDone={todayDone} doneCount={doneCount} allDone={allDone} completeDaily={completeDaily} showToast={showToast}/>}
        {screen==="quests" &&<QuestsScreen game={game} update={update} th={th} V={V} completeQuest={completeQuest} showToast={showToast}/>}
        {screen==="skills" &&<SkillsScreen game={game} update={update} th={th} V={V} showToast={showToast}/>}
        {screen==="shop"   &&<ShopScreen   game={game} th={th} V={V} buyItem={buyItem} showToast={showToast} onPreview={handlePreview} onPreviewEnd={handlePreviewEnd}/>}
        {screen==="system" &&<SystemScreen game={game} update={update} th={th} V={V} showToast={showToast} aiStatus={aiStatus} setAiStatus={setAiStatus} generateBriefing={generateBriefing} briefingLoading={briefingLoading}/>}
        {screen==="options"&&<OptionsScreen game={game} update={update} th={th} V={V} showToast={showToast} onSignOut={signOut} onGenerateRival={generateRival}/>}
      </div>
    </div>
  );
}
