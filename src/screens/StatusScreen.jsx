import { useState } from "react";
import { T, FONTS, THEMES } from "../constants/theme.js";
import { STATS, STAT_COL, STAT_ICO, XP_PER_LEVEL, SHOP_ITEMS } from "../constants/gameData.js";
import { getLevel, getXPPct, getClass } from "../lib/gameLogic.js";
import { Card, SecTitle, Btn } from "../components/ui/index.jsx";
import RadarChart from "../components/ui/RadarChart.jsx";

export default function StatusScreen({ game, update, th, showToast, briefingLoading, generateBriefing, onSignOut }) {
  const [editChar,setEditChar] = useState(false);
  const [charForm,setCharForm] = useState(game.char);
  const level       = getLevel(game.xp);
  const cls         = getClass(level);
  const ownedTitles = (game.titles||[]).map(id=>SHOP_ITEMS.find(i=>i.id===id)).filter(Boolean);
  const inp = { width:"100%",background:"var(--bg2)",border:`1px solid var(--bg3)`,borderRadius:6,color:"var(--text)",padding:"9px 12px",fontFamily:FONTS.ui,fontSize:12,outline:"none",marginBottom:8,boxSizing:"border-box" };

  return (
    <div>
      {/* Penalty message */}
      {game.penaltyMessage && (
        <Card style={{ marginBottom:14,border:`1px solid ${T.danger}40`,background:"#120000" }}>
          <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:3,color:T.danger,marginBottom:8 }}>YESTERDAY'S REPORT — {game.penaltyMessage.date}</div>
          <div style={{ fontFamily:FONTS.display,fontSize:14,color:"var(--text)",marginBottom:6 }}>
            You missed {game.penaltyMessage.broken} habit{game.penaltyMessage.broken>1?"s":""} yesterday.
          </div>
          <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.silver,lineHeight:1.7,marginBottom:8 }}>
            Missed: {game.penaltyMessage.missed.join(", ")}<br/>
            Abyss depth increased by {game.penaltyMessage.abyssChange}. Complete your habits today to recover.
          </div>
          <button onClick={()=>update(s=>({...s,penaltyMessage:null}))} style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,padding:"6px 12px",background:"transparent",border:`1px solid ${T.danger}40`,borderRadius:4,color:T.danger,cursor:"pointer" }}>
            ACKNOWLEDGE
          </button>
        </Card>
      )}

      {/* AI Briefing */}
      {(game.briefing||briefingLoading)&&(
        <Card style={{ marginBottom:14,border:`1px solid ${T.sg}30` }}>
          <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:4,color:T.sg,marginBottom:10 }}>AI BRIEFING — {game.briefingDate||"TODAY"}</div>
          {briefingLoading
            ? <div style={{ fontFamily:FONTS.ui,fontSize:11,color:T.dim,animation:"pulse 1.5s ease-in-out infinite" }}>Analysing your data...</div>
            : <div style={{ fontFamily:FONTS.display,fontSize:15,color:"var(--text)",lineHeight:1.8,whiteSpace:"pre-wrap" }}>{game.briefing}</div>
          }
        </Card>
      )}
      {!game.briefing&&!briefingLoading&&(
        <button onClick={generateBriefing} style={{ width:"100%",padding:"10px",marginBottom:14,background:"transparent",border:`1px dashed ${T.sg}40`,borderRadius:8,color:T.sg,fontFamily:FONTS.ui,fontSize:9,letterSpacing:3,cursor:"pointer" }}>
          GET TODAY'S BRIEFING
        </button>
      )}

      {/* Character card */}
      <Card style={{ marginBottom:14 }} accent={th.accent}>
        <div style={{ display:"flex",gap:14,alignItems:"flex-start" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ width:70,height:70,borderRadius:10,background:"var(--bg2)",border:`1px solid ${th.accent}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,marginBottom:6,animation:game.aura?"auraAnim 2.5s linear infinite":"none" }}>{cls.icon}</div>
            <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:T.dim }}>LVL {level}</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:FONTS.display,fontSize:22,color:T.textBright }}>{game.char.name}</div>
            {game.title&&<div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:th.accent,marginTop:2 }}>"{game.title}"</div>}
            <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:T.silver,marginTop:4 }}>{cls.icon} {cls.name.toUpperCase()}</div>
            {game.char.occupation&&<div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim,marginTop:2 }}>{game.char.occupation}</div>}
            {game.char.bio&&<div style={{ fontFamily:FONTS.display,fontSize:13,color:T.silver,marginTop:6,lineHeight:1.7,fontStyle:"italic" }}>"{game.char.bio}"</div>}
          </div>
          <button onClick={()=>{setCharForm(game.char);setEditChar(!editChar);}} style={{ background:"none",border:`1px solid var(--bg3)`,borderRadius:5,color:T.dim,padding:"4px 8px",cursor:"pointer",fontFamily:FONTS.ui,fontSize:10 }}>✎</button>
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

      {/* XP */}
      <Card style={{ marginBottom:14 }}>
        <SecTitle col={th.accent}>Experience & Progress</SecTitle>
        <div style={{ display:"flex",justifyContent:"space-between",fontFamily:FONTS.ui,fontSize:9,color:T.dim,marginBottom:6 }}>
          <span>Level {level} → {level+1}</span><span>{game.xp%XP_PER_LEVEL} / {XP_PER_LEVEL} XP</span>
        </div>
        <div style={{ height:3,background:"var(--bg3)",borderRadius:2,marginBottom:8 }}>
          <div style={{ height:"100%",width:`${getXPPct(game.xp)*100}%`,background:`linear-gradient(90deg,${th.accent}50,${th.accent})`,borderRadius:2,transition:"width 0.6s ease" }}/>
        </div>
        <div style={{ display:"flex",gap:16,fontFamily:FONTS.ui,fontSize:8,letterSpacing:1,color:T.dim }}>
          <span>{game.xp} XP total</span>
          <span>{game.gems} gems</span>
          {(game.skillPoints||0)>0&&<span style={{ color:T.purple }}>{game.skillPoints} skill points available</span>}
        </div>
      </Card>

      {/* Radar */}
      <Card style={{ marginBottom:14 }}>
        <SecTitle col={th.accent}>Stat Overview</SecTitle>
        <div style={{ display:"flex",justifyContent:"center",marginBottom:14 }}><RadarChart stats={game.stats} accent={th.accent} size={210}/></div>
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
      </Card>

      {game.abyssDepth>0&&(
        <Card style={{ marginBottom:14,border:"1px solid #6a000050" }}>
          <SecTitle col="#b03030">Recovery Needed</SecTitle>
          <div style={{ height:5,background:"var(--bg3)",borderRadius:3 }}>
            <div style={{ height:"100%",width:`${(game.abyssDepth/20)*100}%`,background:"linear-gradient(90deg,#3a0000,#b03030)",borderRadius:3 }}/>
          </div>
          <div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.dim,marginTop:5 }}>Depth {game.abyssDepth}/20 — complete daily habits to recover</div>
        </Card>
      )}

      <div style={{ marginTop:8,paddingTop:14,borderTop:`1px solid var(--bg3)` }}>
        <Btn onClick={onSignOut} danger full>SIGN OUT</Btn>
      </div>
    </div>
  );
}
