import { T, FONTS } from "../../constants/theme.js";
import { STATS, STAT_COL } from "../../constants/gameData.js";
export default function RadarChart({ stats, accent, size=210 }) {
  const cx=size/2,cy=size/2,r=size*0.36,n=STATS.length;
  const ang  = STATS.map((_,i)=>Math.PI*2*i/n-Math.PI/2);
  const pt   = (a,p)=>({x:cx+Math.cos(a)*r*p,y:cy+Math.sin(a)*r*p});
  const dpts = STATS.map((s,i)=>pt(ang[i],Math.min(stats[s]||1,100)/100));
  const dpath= dpts.map((p,i)=>`${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")+"Z";
  return (
    <svg width={size} height={size} style={{overflow:"visible"}}>
      <defs><radialGradient id="rg" cx="50%" cy="50%"><stop offset="0%" stopColor={accent} stopOpacity="0.2"/><stop offset="100%" stopColor={accent} stopOpacity="0.03"/></radialGradient></defs>
      {[.25,.5,.75,1].map(p=>{const rp=ang.map(a=>pt(a,p));const rpath=rp.map((x,i)=>`${i===0?"M":"L"}${x.x.toFixed(1)},${x.y.toFixed(1)}`).join(" ")+"Z";return <path key={p} d={rpath} fill="none" stroke={T.bg3} strokeWidth={1}/>;  })}
      {ang.map((a,i)=>{const o=pt(a,1);return <line key={i} x1={cx} y1={cy} x2={o.x.toFixed(1)} y2={o.y.toFixed(1)} stroke={T.bg3} strokeWidth={1}/>;  })}
      <path d={dpath} fill="url(#rg)" stroke={accent} strokeWidth={1.5}/>
      {STATS.map((s,i)=>{const lp=pt(ang[i],1.28);return <text key={s} x={lp.x.toFixed(1)} y={lp.y.toFixed(1)} textAnchor="middle" dominantBaseline="middle" fill={STAT_COL[s]} fontSize={9} fontFamily={FONTS.ui} fontWeight="700">{s.toUpperCase()}</text>;})}
    </svg>
  );
}
