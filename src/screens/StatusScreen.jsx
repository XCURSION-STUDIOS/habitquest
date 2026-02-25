import { useState } from "react";
import { T, FONTS, THEMES } from "../constants/theme.js";
import { STATS, STAT_COL, STAT_ICO, statColor } from "../constants/gameData.js";
import { getLevel, getXPPct, getXPInLevel, getXPForLevel, getClass } from "../lib/gameLogic.js";
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
          <span style={{ fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:3,color: open ? color : T.dim }}>{label}</span>
          {badge&&<span style={{ fontFamily:"var(--font-ui)",fontSize:7,padding:"1px 6px",borderRadius:10,background:color+"20",color,border:`1px solid ${color}30` }}>{badge}</span>}
        </div>
        <span style={{ fontFamily:"var(--font-ui)",fontSize:10,color: open ? color : T.dim,transition:"transform 0.2s",display:"inline-block",transform: open ? "rotate(180deg)" : "rotate(0deg)" }}>▾</span>
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

function RivalSection({ game, th, V }) {
  if (!game.rivalEnabled || !game.rival) return null;
  const rival      = game.rival;
  const rivalLevel = getLevel(rival.xp || 0);
  const rivalClass = getClass(rivalLevel);
  const myLevel    = getLevel(game.xp);
  const gap        = rival.xp - game.xp;
  const ahead      = gap > 0;
  const color      = ahead ? T.danger : "var(--success)";

  return (
    <CollapsibleSection label="RIVAL" color={color} badge={ahead ? "AHEAD" : "BEHIND"}>
      <div style={{ display:"flex",alignItems:"center",gap:12 }}>
        <div style={{ width:42,height:42,borderRadius:"50%",background:T.bg2,border:`1px solid ${color}60`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>
          {rivalClass.icon}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"var(--font-display)",fontSize:16,color:"#eef2ff",marginBottom:2 }}>{rival.name}</div>
          <div style={{ fontFamily:"var(--font-ui)",fontSize:8,color:T.silver,letterSpacing:1 }}>
            {rivalClass.icon} {rivalClass.name.toUpperCase()} · LVL {rivalLevel}
          </div>
        </div>
        <div style={{ textAlign:"right",flexShrink:0 }}>
          <div style={{ fontFamily:"var(--font-display)",fontSize:20,color }}>{ahead?"+":"-"}{Math.abs(rivalLevel-myLevel)} LVL</div>
          <div style={{ fontFamily:"var(--font-ui)",fontSize:7,color:T.dim }}>{Math.abs(gap)} XP {ahead?"ahead":"behind"}</div>
        </div>
      </div>
      {/* Rival stat bars */}
      {game.rival.stats && (()=>{
        const statEntries = Object.entries(game.rival.stats);
        const maxVal = Math.max(...statEntries.map(([,v])=>v), 1);
        return (
          <div style={{ marginTop:12 }}>
            {statEntries.map(([stat, val]) => (
              <div key={stat} style={{ display:"flex",alignItems:"center",gap:8,marginBottom:5 }}>
                <span style={{ fontFamily:"var(--font-ui)",fontSize:8,color:statColor(stat, game.aesthetic),letterSpacing:1,width:64,flexShrink:0 }}>{stat.toUpperCase()}</span>
                <div style={{ flex:1,height:4,background:V.bg3,borderRadius:2 }}>
                  <div style={{ height:"100%",width:`${(val/Math.pow(10,Math.ceil(Math.log10(Math.max(maxVal,1)))))*100}%`,background:statColor(stat, game.aesthetic),borderRadius:2,transition:"width 0.4s ease" }}/>
                </div>
                <span style={{ fontFamily:"var(--font-ui)",fontSize:8,color:V.dim,width:24,textAlign:"right" }}>{Math.round(val)}</span>
              </div>
            ))}
          </div>
        );
      })()}
      {/* Rival XP progress bar */}
      {(()=>{
        const xpIntoLevel = getXPInLevel(rival.xp||0);
        const xpNeeded = getXPForLevel(rivalLevel);
        const pct = Math.min((xpIntoLevel/xpNeeded)*100,100);
        return (
          <div style={{ marginTop:10 }}>
            <div style={{ display:"flex",justifyContent:"space-between",marginBottom:4 }}>
              <span style={{ fontFamily:"var(--font-ui)",fontSize:8,color:V.dim }}>LVL {rivalLevel} → {rivalLevel+1}</span>
              <span style={{ fontFamily:"var(--font-ui)",fontSize:8,color:V.dim }}>{xpIntoLevel}/{xpNeeded} XP</span>
            </div>
            <div style={{ height:3,background:V.bg3,borderRadius:2 }}>
              <div style={{ height:"100%",width:`${pct}%`,background:color,borderRadius:2,transition:"width 0.4s ease" }}/>
            </div>
          </div>
        );
      })()}
      {rival.taunt&&(
        <div style={{ marginTop:10,fontFamily:"var(--font-display)",fontSize:12,color:V.silver,fontStyle:"italic",lineHeight:1.6,borderTop:`1px solid ${V.bg3}`,paddingTop:8 }}>
          "{rival.taunt}"
        </div>
      )}
    </CollapsibleSection>
  );
}

export default function StatusScreen({ game, update, th, V, showToast, briefingLoading, generateBriefing, onSignOut }) {
  const [showStats,setShowStats] = useState(false);

  const level       = getLevel(game.xp);
  const cls         = getClass(level);
  const inp = { width:"100%",background:"var(--bg2)",border:`1px solid var(--bg3)`,borderRadius:6,color:"var(--text)",padding:"9px 12px",fontFamily:"var(--font-ui)",fontSize:12,outline:"none",marginBottom:8,boxSizing:"border-box" };

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
          {game.penaltyMessage.broken > 0 && (
            <>
              <div style={{ fontFamily:"var(--font-display)",fontSize:14,color:"var(--text)",marginBottom:6 }}>
                You missed {game.penaltyMessage.broken} habit{game.penaltyMessage.broken>1?"s":""} yesterday.
              </div>
              <div style={{ fontFamily:"var(--font-ui)",fontSize:10,color:T.silver,lineHeight:1.7,marginBottom:8 }}>
                Missed: {game.penaltyMessage.missed.join(", ")}<br/>
                Habit Decay increased by {game.penaltyMessage.decayChange}.
              </div>
            </>
          )}
          {game.penaltyMessage.rivalLevelUp && (
            <div style={{ fontFamily:"var(--font-ui)",fontSize:10,color:V.danger,lineHeight:1.7,marginBottom:6 }}>
              ⚠ {game.penaltyMessage.rivalName} levelled up to LVL {game.penaltyMessage.rivalLevelUp}!
            </div>
          )}
          {game.penaltyMessage.rivalStatUps?.length > 0 && (
            <div style={{ fontFamily:"var(--font-ui)",fontSize:10,color:V.danger,lineHeight:1.7,marginBottom:8 }}>
              ⚠ {game.penaltyMessage.rivalName} improved: {game.penaltyMessage.rivalStatUps.join(", ")}.
            </div>
          )}
          <button onClick={()=>update(s=>({...s,penaltyMessage:null}))} style={{ fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:2,padding:"6px 12px",background:"transparent",border:`1px solid ${T.danger}40`,borderRadius:4,color:T.danger,cursor:"pointer" }}>
            ACKNOWLEDGE
          </button>
        </CollapsibleSection>
      )}

      <Card style={{ marginBottom:12 }}>
        <SecTitle col={th.accent}>Experience & Progress</SecTitle>
        <div style={{ display:"flex",justifyContent:"space-between",fontFamily:"var(--font-ui)",fontSize:9,color:T.dim,marginBottom:6 }}>
          <span>Level {level} to {level+1}</span><span>{getXPInLevel(game.xp)} / {getXPForLevel(level)} XP</span>
        </div>
        <div style={{ height:3,background:"var(--bg3)",borderRadius:2,marginBottom:8 }}>
          <div style={{ height:"100%",width:`${getXPPct(game.xp)*100}%`,background:`linear-gradient(90deg,${th.accent}50,${th.accent})`,borderRadius:2,transition:"width 0.6s ease" }}/>
        </div>
        <div style={{ display:"flex",gap:16,fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:1,color:T.dim }}>
          <span>{game.xp} XP total</span>
          <span>{game.gems} gems</span>
          {(game.skillPoints||0)>0&&<span style={{ color:T.purple }}>{game.skillPoints} skill points available</span>}
        </div>
      </Card>

      {/* Today's completion at-a-glance */}
      <div style={{ display:"flex",alignItems:"center",gap:12,padding:"10px 14px",marginBottom:12,background:"var(--bg1)",border:`1px solid ${total>0&&doneCount===total?"var(--success)40":"var(--bg3)"}`,borderRadius:8 }}>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:3,color:T.dim,marginBottom:3 }}>TODAY</div>
          <div style={{ fontFamily:"var(--font-display)",fontSize:14,color:doneCount===total&&total>0?"var(--success)":"var(--text)" }}>
            {total===0?"No habits yet":doneCount===total?"All complete!":` ${doneCount} / ${total} habits done`}
          </div>
        </div>
        {total>0&&(
          <div style={{ fontFamily:"var(--font-display)",fontSize:28,color:th.accent,flexShrink:0 }}>{completionPct}%</div>
        )}
      </div>

      {/* Radar chart — always visible */}
      <Card style={{ marginBottom:12 }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:10 }}>
          <SecTitle col={th.accent}>Stat Overview</SecTitle>
          <button onClick={()=>setShowStats(v=>!v)} style={{ fontFamily:"var(--font-ui)",fontSize:7,letterSpacing:2,color:showStats?th.accent:T.dim,background:"none",border:`1px solid ${showStats?th.accent+"40":"var(--bg3)"}`,borderRadius:3,padding:"2px 8px",cursor:"pointer",transition:"all 0.2s" }}>
            {showStats?"HIDE BARS":"SHOW BARS"}
          </button>
        </div>
        <div style={{ display:"flex",justifyContent:"center",marginBottom:showStats?14:0 }}>
          <RadarChart stats={game.stats} accent={th.accent} bg={V.bg3} size={210} aesthetic={game.aesthetic}/>
        </div>
        {showStats&&(
          <div style={{ animation:"fadeSlideDown 0.18s ease" }}>
            {STATS.map(s=>(
              <div key={s} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:7 }}>
                <div style={{ fontFamily:"var(--font-ui)",fontSize:9,color:statColor(s, game.aesthetic),width:18,textAlign:"center" }}>{STAT_ICO[s]}</div>
                <div style={{ fontFamily:"var(--font-ui)",fontSize:9,color:T.silver,width:64,letterSpacing:1 }}>{s.toUpperCase()}</div>
                <div style={{ flex:1,height:3,background:"var(--bg3)",borderRadius:2 }}>
                  <div style={{ height:"100%",width:`${((game.stats[s]||1)/Math.pow(10,Math.ceil(Math.log10(Math.max(...STATS.map(s=>game.stats[s]||1),1)))))*100}%`,background:statColor(s, game.aesthetic),borderRadius:2,transition:"width 0.6s ease",boxShadow:`0 0 5px ${statColor(s, game.aesthetic)}50` }}/>
                </div>
                <div style={{ fontFamily:"var(--font-ui)",fontSize:10,color:statColor(s, game.aesthetic),width:22,textAlign:"right" }}>{game.stats[s]||1}</div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* AI Briefing */}
      {(game.briefing||briefingLoading)&&(
        <Card style={{ marginBottom:12,border:`1px solid ${T.sg}30` }}>
          <div style={{ fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:4,color:T.sg,marginBottom:10 }}>AI BRIEFING — {game.briefingDate||"TODAY"}</div>
          {briefingLoading
            ? <div style={{ fontFamily:"var(--font-ui)",fontSize:11,color:T.dim,animation:"pulse 1.5s ease-in-out infinite" }}>Analysing your data...</div>
            : <div style={{ fontFamily:"var(--font-display)",fontSize:15,color:"var(--text)",lineHeight:1.8,whiteSpace:"pre-wrap" }}>{game.briefing}</div>
          }
        </Card>
      )}
      {!game.briefing&&!briefingLoading&&(
        <button onClick={generateBriefing} style={{ width:"100%",padding:"10px",marginBottom:12,background:"transparent",border:`1px dashed ${T.sg}40`,borderRadius:8,color:T.sg,fontFamily:"var(--font-ui)",fontSize:9,letterSpacing:3,cursor:"pointer" }}>
          GET TODAY'S BRIEFING
        </button>
      )}

      {/* Habit Decay */}
      {game.decayDepth>0&&(
        <Card style={{ marginBottom:12,border:"1px solid #6a000050" }}>
          <SecTitle col="#b03030">Habit Decay</SecTitle>
          <div style={{ height:4,background:"var(--bg3)",borderRadius:3 }}>
            <div style={{ height:"100%",width:`${(game.decayDepth/20)*100}%`,background:"linear-gradient(90deg,#3a0000,#b03030)",borderRadius:3 }}/>
          </div>
          <div style={{ fontFamily:"var(--font-ui)",fontSize:9,color:T.dim,marginTop:5 }}>Decay {game.decayDepth}/20 — complete habits to reduce decay</div>
        </Card>
      )}

      {/* Collapsible sections */}
      <RivalSection game={game} th={th} V={V}/>

      <div style={{ marginTop:8,paddingTop:14,borderTop:`1px solid var(--bg3)` }}>
        <Btn onClick={onSignOut} danger full>SIGN OUT</Btn>
      </div>
    </div>
  );
}
