import { T, FONTS } from "../../constants/theme.js";
export default function BossBar({ game }) {
  if (!game.boss) return null;
  return (
    <div style={{ padding:"10px 14px",background:"#120006",border:`1px solid ${T.danger}40`,borderRadius:8,marginBottom:10 }}>
      <div style={{ fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:3,color:T.danger,marginBottom:3 }}>WEEKLY CHALLENGE</div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
        <span style={{ fontFamily:"var(--font-display)",fontSize:15,color:T.text }}>{game.boss.name}</span>
        <span style={{ fontFamily:"var(--font-ui)",fontSize:10,color:T.danger }}>{game.bossHPLeft}/{game.boss.hp}</span>
      </div>
      <div style={{ height:4,background:T.bg3,borderRadius:2 }}>
        <div style={{ height:"100%",width:`${(game.bossHPLeft/game.boss.hp)*100}%`,background:`linear-gradient(90deg,${T.danger},#dd6060)`,borderRadius:2,transition:"width 0.5s ease" }}/>
      </div>
    </div>
  );
}
