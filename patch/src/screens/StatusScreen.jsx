import { useState } from "react";
import { T, FONTS, THEMES } from "../constants/theme.js";
import { STATS, STAT_COL, STAT_ICO, XP_PER_LEVEL, SHOP_ITEMS } from "../constants/gameData.js";
import { getLevel, getXPPct, getClass } from "../lib/gameLogic.js";
import { Card, SecTitle, Btn } from "../components/ui/index.jsx";
import RadarChart from "../components/ui/RadarChart.jsx";

function CollapsibleSection({ label, color, defaultOpen=false, badge, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={{ marginBottom:12 }}>
      <button
        onClick={()=>setOpen(v=>!v)}
        style={{
          width:"100%",
          display:"flex",
          alignItems:"center",
          justifyContent:"space-between",
          padding:"10px 14px",
          background:"var(--bg1)",
          border:`1px solid ${open ? color+"50" : "var(--bg3)"}`,
          borderRadius: open ? "8px 8px 0 0" : 8,
          cursor:"pointer",
          transition:"all 0.2s",
        }}
      >
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <span style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:3,color: open ? color : T.dim }}>{label}</span>
          {badge&&<span style={{ fontFamily:FONTS.ui,fontSize:7,padding:"1px 6px",borderRadius:10,background:color+"20",color,border:`1px solid ${color}30` }}>{badge}</span>}
        </div>
        <span style={{ fontFamily:FONTS.ui,fontSize:10,color: open ? color : T.dim,transition:"transform 0.2s",display:"inline-block",transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
      </button>
      {open&&(
        <div style={{
          border:`1px solid ${color+"40"}`,
          borderTop:"none",
          borderRadius:"0 0 8px 8px",
          padding:"12px 14px",
          background:"var(--bg1)",
          animation:"fadeSlideDown 0.18s ease",
        }}>
          {children}
        </div>
      )}
    </div>
  );
}

function RivalSection({ game, th }) {
  if (!game.rivalEnabled || !game.rival) return null;
  const rival      = game.rival;
  const rivalLevel = getLevel(rival.xp || 0);
  const rivalClass = getClass(rivalLevel);
  const myLevel    = getLevel(game.xp);
  const gap        = rival.xp - game.xp;
  const ahead      = gap > 0;
  const color      = ahead ? T.danger : "#27a060";

  return (
    <CollapsibleSection label="RIVAL" color={color} badge={ahead ? "AHEAD" : "BEHIND"}>
      <div style={{ display:"flex",alignItems:"center",gap:12 }}>
        <div style={{ width:42,height:42,borderRadius:"50%",background:T.bg2,border:`1px solid ${color}60`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>
          {rivalClass.icon}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:FONTS.display,fontSize:16,color:"#eef2ff",marginBottom:2 }}>{rival.name}</div>
          <div style={{ fontFamily:FONTS.ui,fontSize:8,color:T.silver,letterSpacing:1 }}>
            {rivalClass.icon} {rivalClass.name.toUpperCase()} · LVL {rivalLevel}
          </div>
        </div>
        <div style={{ textAlign:"right",flexShrink:0 }}>
          <div style={{ fontFamily:FONTS.display,fontSize:20,color }}>{ahead?"+":"-"}{Math.abs(rivalLevel-myLevel)} LVL</div>
          <div style={{ fontFamily:FONTS.ui,fontSize:7,color:T.dim }}>{Math.abs(gap)} XP {ahead?"ahead":"behind"}</div>
        </div>
      </div>
      {rival.taunt&&(
        <div style={{ marginTop:10,fontFamily:FONTS.display,fontSize:12,color:T.silver,fontStyle:"italic",lineHeight:1.6,borderTop:`1px solid ${T.bg3}`,paddingTop:8 }}>
          "{rival.taunt}"
        </div>
      )}
    </CollapsibleSection>
  );
}

function BonusMissionSection({ game }) {
  if (!game.bonusMission) return null;
  return (
    <CollapsibleSection label="BONUS MISSION" color={T.purple} badge={game.bonusMission.aiGenerated?"AI":null}>
      <div style={{ fontFamily:FONTS.display,fontSize:14,color:T.text,marginBottom:3 }}>{game.bonusMission.name}</div>
      <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.silver,lineHeight:1.5,marginBottom:8 }}>{game.bonusMission.desc}</div>
      <div style={{ display:"flex",alignItems:"center",gap:8 }}>
        <div style={{ flex:1,height:2,background:T.bg3,borderRadius:1 }}>
          <div style={{ height:"100%",width:`${Math.min((game.bonusProgress/Math.max(game.bonusMission.req.count,1))*100,100)}%`,background:T.purple,borderRadius:1,transition:"width 0.4s ease" }}/>
        </div>
        <span style={{ fontFamily:FONTS.ui,fontSize:9,color:T.purple }}>{game.bonusProgress}/{game.bonusMission.req.count}</span>
        <span style={{ fontFamily:FONTS.ui,fontSize:8,color:T.dim }}>+{game.bonusMission.xp}xp</span>
      </div>
    </CollapsibleSection>
  );
}

export default function StatusScreen({ game, update, th, showToast, briefingLoading, generateBriefing, onSignOut }) {
  const [editChar,setEditChar] = useState(false);
  const [charForm,setCharForm] = useState(game.char);
  const [showStats,setShowStats] = useState(false);

  const level       = getLevel(game.xp);
  const cls         = getClass(level);
  const ownedTitles = (game.titles||[]).map(id=>SHOP_ITEMS.find(i=>i.id===id)).filter(Boolean);
  const inp = { width:"100%",background:"var(--bg2)",border:`1px solid var(--bg3)`,borderRadius:6,color:"var(--text)",padding:"9px 12px",fontFamily:FONTS.ui,fontSize:12,outline:"none",marginBottom:8,boxSizing:"border-box" };

  // Today's completion
  const today = game.lastDay;
  const todayDone = game.done?.[today]||{};
  const doneCount = game.daily?.filter(q=>todayDone[q.id]).length||0;
  const total = game.daily?.length||0;
  const completionPct = total > 0 ? Math.round((doneCount/total)*100) : 0;

  return (
    <div>
      {/* Penalty message — collapsible if exists */}
      {game.penaltyMessage&&(
        <CollapsibleSection label={`YESTERDAY'S REPORT — ${game.penaltyMessage.date}`} color={T.danger} defaultOpen={true}>
          <div style={{ fontFamily:FONTS.display,fontSize:14,color:"var(--text)",marginBottom:6 }}>
            You missed {game.penaltyMessage.broken} habit{game.penaltyMessage.broken>1?"s":""} yesterday.
          </div>
          <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.silver,lineHeight:1.7,marginBottom:8 }}>
            Missed: {game.penaltyMessage.missed.join(", ")}<br/>
            Abyss depth increased by {game.penaltyMessage.abyssChange}.
          </div>
          <button onClick={()=>update(s=>({...s,penaltyMessage:null}))} style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,padding:"6px 12px",background:"transparent",border:`1px solid ${T.danger}40`,borderRadius:4,color:T.danger,cursor:"pointer" }}>
            ACKNOWLEDGE
          </button>
        </CollapsibleSection>
      )}

      {/* Character card */}
      <Card style={{ marginBottom:12 }} accent={th.accent}>
        <div style={{ display:"flex",gap:14,alignItems:"flex-start" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ width:64,height:64,borderRadius:10,background:"var(--bg2)",border:`1px solid ${th.accent}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:30,marginBottom:4,animation:game.aura?"auraAnim 2.5s linear infinite":"none" }}>{cls.icon}</div>
            <div style={{ fontFamily:FONTS.ui,fontSize:7,letterSpacing:2,color:T.dim }}>LVL {level}</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:FONTS.display,fontSize:20,color:T.textBright }}>{game.char.name}</div>
            {game.title&&<div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:th.accent,marginTop:2 }}>"{game.title}"</div>}
            <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:T.silver,marginTop:3 }}>{cls.icon} {cls.name.toUpperCase()}</div>
            {game.char.occupation&&<div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim,marginTop:2 }}>{game.char.occupation}</div>}
            {game.char.bio&&<div style={{ fontFamily:FONTS.display,fontSize:13,color:T.silver,marginTop:5,lineHeight:1.7,fontStyle:"italic" }}>"{game.char.bio}"</div>}

            {/* XP bar inline */}
            <div style={{ marginTop:8 }}>
              <div style={{ display:"flex",justifyContent:"space-between",fontFamily:FONTS.ui,fontSize:8,color:T.dim,marginBottom:4 }}>
                <span>{game.xp} XP · {game.gems} ◈</span>
                <span>{game.xp%XP_PER_LEVEL}/{XP_PER_LEVEL} to next</span>
              </div>
              <div style={{ height:2,background:"var(--bg3)",borderRadius:1 }}>
                <div style={{ height:"100%",width:`${getXPPct(game.xp)*100}%`,background:`linear-gradient(90deg,${th.accent}50,${th.accent})`,borderRadius:1,transition:"width 0.6s ease" }}/>
              </div>
            </div>
          </div>
          <button onClick={()=>{setCharForm(game.char);setEditChar(!editChar);}} style={{ background:"none",border:`1px solid var(--bg3)`,borderRadius:5,color:T.dim,padding:"4px 8px",cursor:"pointer",fontFamily:FONTS.ui,fontSize:10,flexShrink:0 }}>✎</button>
        </div>

        {editChar&&(
          <div style={{ marginTop:14,borderTop:`1px solid var(--bg3)`,paddingTop:14 }}>
            {["name","age","occupation"].map(k=>(
              <input key={k} value={charForm[k]||""} onChange={e=>setCharForm(x=>({...x,[k]:e.target.value}))} placeholder={k} style={inp}/>
            ))}
            <textarea value={charForm.bio||""} onChange={e=>setCharForm(x=>({...x,bio:e.target.value}))} placeholder="bio" style={{ ...inp,height:64,resize:"none",marginBottom:10 }}/>
            {ownedTitles.length>0&&(
              <div style={{ marginBottom:10 }}>
                <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:T.dim,marginBottom:6 }}>TITLE</div>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                  <button onClick={()=>update(s=>({...s,title:null}))} style={{ fontFamily:FONTS.ui,fontSize:8,padding:"4px 10px",background:!game.title?T.bg3:"transparent",border:`1px solid var(--bg3)`,borderRadius:4,color:T.silver,cursor:"pointer" }}>None</button>
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

      {/* Today's completion at-a-glance */}
      <div style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 14px",marginBottom:12,background:"var(--bg1)",border:`1px solid ${total>0&&doneCount===total?"#27a06040":"var(--bg3)"}`,borderRadius:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:3,color:T.dim,marginBottom:3 }}>TODAY</div>
          <div style={{ fontFamily:FONTS.display,fontSize:14,color:doneCount===total&&total>0?"#40d090":"var(--text)" }}>
            {total===0?"No habits yet":doneCount===total?"All complete!":` ${doneCount} / ${total} habits done`}
          </div>
        </div>
        {total>0&&(
          <div style={{ fontFamily:FONTS.display,fontSize:28,color:th.accent,flexShrink:0 }}>{completionPct}%</div>
        )}
      </div>

      {/* Radar chart — always visible */}
      <Card style={{ marginBottom:12 }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
          <SecTitle col={th.accent}>Stat Overview</SecTitle>
          <button onClick={()=>setShowStats(v=>!v)} style={{ fontFamily:FONTS.ui,fontSize:7,letterSpacing:2,color:showStats?th.accent:T.dim,background:"none",border:`1px solid ${showStats?th.accent+"40":"var(--bg3)"}`,borderRadius:3,padding:"2px 8px",cursor:"pointer",transition:"all 0.2s" }}>
            {showStats?"HIDE BARS":"SHOW BARS"}
          </button>
        </div>
        <div style={{ display:"flex",justifyContent:"center",marginBottom:showStats?14:0 }}>
          <RadarChart stats={game.stats} accent={th.accent} size={210}/>
        </div>
        {showStats&&(
          <div style={{ animation:"fadeSlideDown 0.18s ease" }}>
            {STATS.map(s=>(
              <div key={s} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:7 }}>
                <div style={{ fontFamily:FONTS.ui,fontSize:9,color:STAT_COL[s],width:18,textAlign:"center" }}>{STAT_ICO[s]}</div>
                <div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.silver,width:64,letterSpacing:1 }}>{s.toUpperCase()}</div>
                <div style={{ flex:1,height:3,background:"var(--bg3)",borderRadius:2 }}>
                  <div style={{ height:"100%",width:`${Math.min(game.stats[s]||1,100)}%`,background:STAT_COL[s],borderRadius:2,transition:"width 0.6s ease",boxShadow:`0 0 5px ${STAT_COL[s]}50` }}/>
                </div>
                <div style={{ fontFamily:FONTS.ui,fontSize:10,color:STAT_COL[s],width:22,textAlign:"right" }}>{game.stats[s]||1}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* AI Briefing */}
      {(game.briefing||briefingLoading)&&(
        <Card style={{ marginBottom:12,border:`1px solid ${T.sg}30` }}>
          <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:4,color:T.sg,marginBottom:10 }}>AI BRIEFING — {game.briefingDate||"TODAY"}</div>
          {briefingLoading
            ? <div style={{ fontFamily:FONTS.ui,fontSize:11,color:T.dim,animation:"pulse 1.5s ease-in-out infinite" }}>Analysing your data...</div>
            : <div style={{ fontFamily:FONTS.display,fontSize:15,color:"var(--text)",lineHeight:1.8,whiteSpace:"pre-wrap" }}>{game.briefing}</div>
          }
        </Card>
      )}
      {!game.briefing&&!briefingLoading&&(
        <button onClick={generateBriefing} style={{ width:"100%",padding:"10px",marginBottom:12,background:"transparent",border:`1px dashed ${T.sg}40`,borderRadius:8,color:T.sg,fontFamily:FONTS.ui,fontSize:9,letterSpacing:3,cursor:"pointer" }}>
          GET TODAY'S BRIEFING
        </button>
      )}

      {/* Abyss depth */}
      {game.abyssDepth>0&&(
        <Card style={{ marginBottom:12,border:"1px solid #6a000050" }}>
          <SecTitle col="#b03030">Recovery Needed</SecTitle>
          <div style={{ height:4,background:"var(--bg3)",borderRadius:3 }}>
            <div style={{ height:"100%",width:`${(game.abyssDepth/20)*100}%`,background:"linear-gradient(90deg,#3a0000,#b03030)",borderRadius:3 }}/>
          </div>
          <div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.dim,marginTop:5 }}>Depth {game.abyssDepth}/20 — complete daily habits to recover</div>
        </Card>
      )}

      {/* Collapsible sections */}
      <BonusMissionSection game={game}/>
      <RivalSection game={game} th={th}/>

      <div style={{ marginTop:8,paddingTop:14,borderTop:`1px solid var(--bg3)` }}>
        <Btn onClick={onSignOut} danger full>SIGN OUT</Btn>
      </div>
    </div>
  );
}
