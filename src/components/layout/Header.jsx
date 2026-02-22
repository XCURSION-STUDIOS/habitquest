import { T, FONTS, THEMES, getVisuals } from "../../constants/theme.js";
import { getLevel, getXPPct, getClass } from "../../lib/gameLogic.js";
import { AIStatus } from "../ui/index.jsx";

export default function Header({ game, screen, setScreen, aiStatus, saving, V }) {
  const th    = V?.th || THEMES[game.theme] || THEMES.default;
  const fonts = V?.fonts || { display: T.display, ui: T.ui };
  const level = getLevel(game.xp);
  const cls   = getClass(level);
  return (
    <div style={{ padding:"14px 16px 0" }}>
      <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:10 }}>
        <div onClick={()=>setScreen("status")} className="header-avatar" style={{ borderRadius:"50%",background:V?.bg1||T.bg1,border:`1px solid ${th.accent}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,cursor:"pointer",flexShrink:0,animation:game.aura?"auraAnim 2.5s linear infinite":"none" }}>
          {cls.icon}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:1,flexWrap:"wrap" }}>
            <span style={{ fontFamily:FONTS.display,fontSize:18,color:T.textBright }}>{game.char.name}</span>
            {game.title&&<span style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:th.accent,border:`1px solid ${th.accent}30`,padding:"1px 7px",borderRadius:3 }}>{game.title}</span>}
            {saving&&<span style={{ fontFamily:FONTS.ui,fontSize:7,color:T.dim }}>saving…</span>}
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:10 }}>
            <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:T.silver }}>{cls.icon} {cls.name.toUpperCase()} · LVL {level}</div>
            <AIStatus status={aiStatus}/>
          </div>
          <div style={{ marginTop:4,height:2,background:T.bg3,borderRadius:1 }}>
            <div style={{ height:"100%",width:`${getXPPct(game.xp)*100}%`,background:`linear-gradient(90deg,${th.accent}60,${th.accent})`,borderRadius:1,transition:"width 0.6s ease" }}/>
          </div>
        </div>
        <div style={{ textAlign:"right",flexShrink:0 }}>
          <div style={{ fontFamily:FONTS.ui,fontSize:13,color:th.accent }}>◈ {game.gems}</div>
          {(game.skillPoints||0)>0&&<div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.purple }}>SP: {game.skillPoints}</div>}
        </div>
      </div>
      {game.actives?.length>0&&(
        <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:8 }}>
          {game.actives.map(p=><span key={p.id} style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:1,padding:"2px 8px",border:`1px solid ${th.accent}40`,borderRadius:20,color:th.accent }}>{p.icon} {p.name} ×{p.left}</span>)}
        </div>
      )}
      <nav style={{ display:"flex",borderBottom:`1px solid ${V?.bg3||T.bg3}` }}>
        {[{id:"status",l:"STATUS"},{id:"daily",l:"DAILY"},{id:"quests",l:"QUESTS"},{id:"skills",l:"SKILLS"},{id:"shop",l:"SHOP"},{id:"options",l:"⚙"}].map(t=>(
          <button key={t.id} onClick={()=>setScreen(t.id)} style={{ flex:1,padding:"9px 0",fontFamily:FONTS.ui,fontSize:"var(--nav-font)",letterSpacing:1,background:"none",border:"none",cursor:"pointer",color:screen===t.id?th.accent:T.dim,borderBottom:screen===t.id?`1px solid ${th.accent}`:"1px solid transparent",transition:"color 0.2s",whiteSpace:"nowrap" }}>
            {t.l}
          </button>
        ))}
      </nav>
    </div>
  );
}
