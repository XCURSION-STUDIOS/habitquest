import { T, FONTS } from "../constants/theme.js";
import { getLevel, getClass } from "../lib/gameLogic.js";

export default function RivalCard({ game, th }) {
  if (!game.rivalEnabled || !game.rival) return null;

  const rival      = game.rival;
  const rivalLevel = getLevel(rival.xp || 0);
  const rivalClass = getClass(rivalLevel);
  const myLevel    = getLevel(game.xp);
  const gap        = rival.xp - game.xp;
  const ahead      = gap > 0;

  return (
    <div style={{ marginBottom:14,padding:"14px 16px",background:ahead?"#120000":"#001208",border:`1px solid ${ahead?"#b0303040":"#27a06040"}`,borderRadius:10 }}>
      <div style={{ fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:3,color:ahead?T.danger:"#27a060",marginBottom:10 }}>
        {ahead ? "⚠ RIVAL AHEAD" : "◈ RIVAL BEHIND"}
      </div>
      <div style={{ display:"flex",alignItems:"center",gap:12 }}>
        <div style={{ width:42,height:42,borderRadius:"50%",background:T.bg2,border:`1px solid ${ahead?"#b0303060":"#27a06060"}`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18,flexShrink:0 }}>
          {rivalClass.icon}
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontFamily:"var(--font-display)",fontSize:16,color:"#eef2ff",marginBottom:2 }}>{rival.name}</div>
          <div style={{ fontFamily:"var(--font-ui)",fontSize:8,color:T.silver,letterSpacing:1 }}>
            {rivalClass.icon} {rivalClass.name.toUpperCase()} · LVL {rivalLevel}
          </div>
        </div>
        <div style={{ textAlign:"right",flexShrink:0 }}>
          <div style={{ fontFamily:"var(--font-display)",fontSize:20,color:ahead?T.danger:"#27a060" }}>
            {ahead ? "+" : "-"}{Math.abs(rivalLevel - myLevel)} LVL
          </div>
          <div style={{ fontFamily:"var(--font-ui)",fontSize:7,color:T.dim }}>
            {Math.abs(gap)} XP {ahead?"ahead":"behind"}
          </div>
        </div>
      </div>
      {rival.taunt && (
        <div style={{ marginTop:10,fontFamily:"var(--font-display)",fontSize:12,color:T.silver,fontStyle:"italic",lineHeight:1.6,borderTop:`1px solid ${T.bg3}`,paddingTop:8 }}>
          "{rival.taunt}"
        </div>
      )}
    </div>
  );
}
