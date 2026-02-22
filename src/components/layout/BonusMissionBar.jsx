import { T, FONTS } from "../../constants/theme.js";
export default function BonusMissionBar({ game }) {
  if (!game.bonusMission) return null;
  return (
    <div style={{ padding:"10px 14px",background:"#080018",border:`1px solid ${T.purple}40`,borderRadius:8,marginBottom:10 }}>
      <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:3,color:T.purple,marginBottom:4 }}>
        BONUS MISSION · OPTIONAL{game.bonusMission.aiGenerated?" · AI GENERATED":""}
      </div>
      <div style={{ fontFamily:FONTS.display,fontSize:14,color:T.text,marginBottom:3 }}>{game.bonusMission.name}</div>
      <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.silver,lineHeight:1.5 }}>{game.bonusMission.desc}</div>
      <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:8 }}>
        <div style={{ flex:1,height:2,background:T.bg3,borderRadius:1 }}>
          <div style={{ height:"100%",width:`${Math.min((game.bonusProgress/Math.max(game.bonusMission.req.count,1))*100,100)}%`,background:T.purple,borderRadius:1,transition:"width 0.4s ease" }}/>
        </div>
        <span style={{ fontFamily:FONTS.ui,fontSize:9,color:T.purple }}>{game.bonusProgress}/{game.bonusMission.req.count}</span>
        <span style={{ fontFamily:FONTS.ui,fontSize:8,color:T.dim }}>+{game.bonusMission.xp}xp</span>
      </div>
    </div>
  );
}
