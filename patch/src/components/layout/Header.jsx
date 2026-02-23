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

  return (
    <div style={{ padding:"12px 16px 0" }}>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:8 }}>
        {/* Avatar */}
        <div
          onClick={()=>setScreen("status")}
          className="header-avatar"
          style={{ width:36,height:36,borderRadius:"50%",background:V?.bg1||T.bg1,border:`1px solid ${th.accent}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,cursor:"pointer",flexShrink:0,animation:game.aura?"auraAnim 2.5s linear infinite":"none" }}
        >
          {cls.icon}
        </div>

        {/* Name + class */}
        <div style={{ flex:1,minWidth:0 }}>
          <div style={{ display:"flex",alignItems:"center",gap:6,marginBottom:1,flexWrap:"nowrap",overflow:"hidden" }}>
            <span style={{ fontFamily:FONTS.display,fontSize:16,color:T.textBright,whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis" }}>{game.char.name}</span>
            {game.title&&<span style={{ fontFamily:FONTS.ui,fontSize:7,letterSpacing:2,color:th.accent,border:`1px solid ${th.accent}30`,padding:"1px 6px",borderRadius:3,flexShrink:0 }}>{game.title}</span>}
            {saving&&<span style={{ fontFamily:FONTS.ui,fontSize:7,color:T.dim,flexShrink:0 }}>saving…</span>}
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8 }}>
            <span style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:1,color:T.silver,whiteSpace:"nowrap" }}>LVL {level} · {cls.name.toUpperCase()}</span>
            <AIStatus status={aiStatus}/>
          </div>
          {/* XP bar */}
          <div style={{ marginTop:4,height:2,background:"var(--bg3)",borderRadius:1 }}>
            <div style={{ height:"100%",width:`${getXPPct(game.xp)*100}%`,background:`linear-gradient(90deg,${th.accent}60,${th.accent})`,borderRadius:1,transition:"width 0.6s ease" }}/>
          </div>
        </div>

        {/* Gems + optional boosts toggle */}
        <div style={{ textAlign:"right",flexShrink:0,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:3 }}>
          <div style={{ fontFamily:FONTS.ui,fontSize:13,color:th.accent }}>◈ {game.gems}</div>
          {(game.skillPoints||0)>0&&<div style={{ fontFamily:FONTS.ui,fontSize:8,color:T.purple }}>SP: {game.skillPoints}</div>}
          {hasBoosts&&(
            <button
              onClick={()=>setShowBoosts(v=>!v)}
              style={{ fontFamily:FONTS.ui,fontSize:7,letterSpacing:1,color:showBoosts?th.accent:T.dim,background:"none",border:`1px solid ${showBoosts?th.accent+"40":"var(--bg3)"}`,borderRadius:3,padding:"1px 5px",cursor:"pointer",transition:"all 0.2s" }}
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
            <span key={p.id} style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:1,padding:"2px 8px",border:`1px solid ${th.accent}40`,borderRadius:20,color:th.accent }}>
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
              fontFamily:FONTS.ui,
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
