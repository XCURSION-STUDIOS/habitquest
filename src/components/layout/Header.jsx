import { useState } from "react";
import { T, FONTS, THEMES, getVisuals } from "../../constants/theme.js";
import { getLevel, getXPPct, getClass } from "../../lib/gameLogic.js";
import { AIStatus } from "../ui/index.jsx";

export default function Header({ game, screen, setScreen, aiStatus, saving, V }) {
  const [showBoosts, setShowBoosts] = useState(false);
  const th    = V?.th || THEMES[game.theme] || THEMES.default;
  const level = getLevel(game.xp);
  const cls   = getClass(level);
  const hasBoosts = game.actives?.length > 0;
  const frame = game.activeFrame === "frm_hex" ? "hexagon"
              : game.activeFrame === "frm_dbl" ? "double"
              : game.activeFrame === "frm_crn" ? "crown"
              : "circle";
  const xpBarStyle = game.activeXpBar === "xpb_spk" ? "spark"
                   : game.activeXpBar === "xpb_pls" ? "pulse"
                   : "default";
  const frameStyle = frame === "hexagon"
    ? { borderRadius:"18% 18% 18% 18% / 18% 18% 18% 18%", border:`2px solid ${th.accent}`, clipPath:"polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)" }
    : frame === "double"
    ? { borderRadius:"50%", border:`2px solid ${th.accent}`, outline:`3px solid ${th.accent}40`, outlineOffset:"2px" }
    : frame === "crown"
    ? { borderRadius:"50%", border:`2px solid ${th.accent}`, boxShadow:`0 -6px 16px ${th.accent}90, 0 -2px 8px ${th.accent}60, 0 0 0 2px ${th.accent}30` }
    : { borderRadius:"50%", border:`1px solid ${th.accent}40` };

  return (
    <div style={{ padding:"12px 16px 0" }}>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:8 }}>
        {/* Avatar */}
        <div style={{ position:"relative",flexShrink:0 }}>
          {frame==="crown"&&<div style={{ position:"absolute",top:-10,left:"50%",transform:"translateX(-50%)",fontSize:10,lineHeight:1,zIndex:1 }}>♛</div>}
          <div
            onClick={()=>setScreen("status")}
            className="header-avatar"
            style={{ width:36,height:36,background:V?.bg1||T.bg1,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer",animation:game.aura?"auraAnim 2.5s linear infinite":"none",...frameStyle }}
          >
            {cls.icon}
          </div>
        </div>

        {/* Name + class */}
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:1,flexWrap:"nowrap",overflow:"hidden" }}>
            <span style={{ fontFamily:"var(--font-display)",fontSize:16,color:T.textBright,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{game.char.name}</span>
            {game.title&&<span style={{ fontFamily:"var(--font-ui)",fontSize:7,letterSpacing:2,color:th.accent,border:`1px solid ${th.accent}30`,padding:"1px 6px",borderRadius:3,flexShrink:0 }}>{game.title}</span>}
            {saving&&<span style={{ fontFamily:"var(--font-ui)",fontSize:7,color:T.dim,flexShrink:0 }}>saving…</span>}
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <span style={{ fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:1,color:T.silver,whiteSpace:"nowrap" }}>LVL {level} · {cls.name.toUpperCase()}</span>
            <AIStatus status={aiStatus}/>
          </div>
          {/* XP bar */}
          <div style={{ marginTop:4,height:xpBarStyle==="pulse"?4:2,background:"var(--bg3)",borderRadius:1,transition:"height 0.3s" }}>
            <div style={{
              height:"100%",
              width:`${getXPPct(game.xp)*100}%`,
              background: xpBarStyle==="spark"
                ? `linear-gradient(90deg, ${th.accent}40, ${th.accent}, #fff, ${th.accent}, ${th.accent}40)`
                : `linear-gradient(90deg,${th.accent}60,${th.accent})`,
              backgroundSize: xpBarStyle==="spark" ? "200% 100%" : "100% 100%",
              borderRadius:1,
              transition:"width 0.6s ease",
              animation: xpBarStyle==="pulse" ? "xpPulse 1.5s ease-in-out infinite"
                       : xpBarStyle==="spark" ? "xpSpark 1.5s linear infinite"
                       : "none"
            }}/>
          </div>
        </div>

        {/* Gems + optional boosts toggle */}
        <div style={{ textAlign:"right",flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3 }}>
          {(()=>{
            const decay = game.decayDepth || 0;
            let gemDebuff = 0;
            if (decay >= 15)      gemDebuff = 50;
            else if (decay >= 10) gemDebuff = 35;
            else if (decay >= 5)  gemDebuff = 20;
            return (
              <div>
                <div style={{ fontFamily:"var(--font-ui)",fontSize:13,color:th.accent }}>◈ {game.gems}</div>
                {gemDebuff>0&&<div style={{ fontFamily:"var(--font-ui)",fontSize:7,color:"#c04040",textAlign:"right" }}>▼{gemDebuff}% gems</div>}
              </div>
            );
          })()}
          {(game.skillPoints||0)>0&&<div style={{ fontFamily:"var(--font-ui)",fontSize:8,color:T.purple }}>SP: {game.skillPoints}</div>}
          {hasBoosts&&(
            <button
              onClick={()=>setShowBoosts(v=>!v)}
              style={{ fontFamily:"var(--font-ui)",fontSize:7,letterSpacing:1,color:showBoosts?th.accent:T.dim,background:"none",border:`1px solid ${showBoosts?th.accent+"40":"var(--bg3)"}`,borderRadius:3,padding:"1px 5px",cursor:"pointer",transition:"all 0.2s" }}
            >
              {showBoosts ? "▾ BOOSTS" : "⚡ BOOSTS"}
            </button>
          )}
        </div>
      </div>

      {/* Boosts — only visible when expanded */}
      {hasBoosts && showBoosts && (
        <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:6,paddingLeft:4,animation:"fadeSlideDown 0.18s ease" }}>
          {game.actives.map(p=>(
            <span key={p.id} style={{ fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:1,padding:"2px 8px",border:`1px solid ${th.accent}40`,borderRadius:20,color:th.accent }}>
              {p.icon} {p.name} ×{p.left}
            </span>
          ))}
        </div>
      )}

      {/* Nav tabs */}
      <nav style={{ display:"flex",borderBottom:`1px solid ${V?.bg3||T.bg3}` }}>
        {[
          {id:"status",l:"STATUS"},
          {id:"daily",l:"DAILY"},
          {id:"quests",l:"QUESTS"},
          {id:"skills",l:"SKILLS"},
          {id:"shop",l:"SHOP"},
          {id:"system",l:"AI"},
          {id:"options",l:"⚙"},
        ].map(t=>(
          <button
            key={t.id}
            onClick={()=>setScreen(t.id)}
            style={{
              flex:1,
              padding:"9px 0 8px",
              fontFamily:"var(--font-ui)",
              fontSize:"var(--nav-font)",
              letterSpacing:1,
              background:"none",
              border:"none",
              cursor:"pointer",
              color:screen===t.id?th.accent:T.dim,
              borderBottom:screen===t.id?`2px solid ${th.accent}`:"2px solid transparent",
              transition:"color 0.18s, border-color 0.18s",
              whiteSpace:"nowrap",
              position:"relative",
            }}
          >
            {t.l}
            {/* Active dot */}
            {screen===t.id&&(
              <span style={{
                position:"absolute",
                bottom:-1,left:"50%",transform:"translateX(-50%)",
                width:4,height:4,borderRadius:"50%",
                background:th.accent,
                boxShadow:`0 0 6px ${th.accent}`,
                display:"block",
              }}/>
            )}
          </button>
        ))}
      </nav>
    </div>
  );
}
