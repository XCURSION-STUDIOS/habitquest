import { useState } from "react";
import { T, FONTS } from "../../constants/theme.js";
import { DIFF } from "../../constants/gameData.js";

export function Card({ children, style, accent }) {
  return (
    <div style={{ background:"linear-gradient(135deg,var(--bg1),var(--bg2))",border:`1px solid ${accent?accent+"30":"var(--bg3)"}`,borderRadius:"var(--card-radius)",boxShadow:"var(--card-shadow)",padding:16,...style }}>
      {children}
    </div>
  );
}
export function SecTitle({ children, col, style }) {
  return (
    <div style={{ fontFamily:"var(--font-ui)",fontSize:9,letterSpacing:4,color:col||T.dim,marginBottom:14,textTransform:"uppercase",borderBottom:"1px solid var(--bg3)",paddingBottom:8,...style }}>
      {children}
    </div>
  );
}
export function Btn({ children, onClick, disabled, danger, full, style }) {
  const [hov,setHov] = useState(false);
  return (
    <button onClick={disabled?undefined:onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ fontFamily:"var(--font-ui)",fontSize:10,letterSpacing:2,padding:"10px 16px",background:hov&&!disabled?(danger?"#b0303018":"#c9a84c12"):"transparent",border:`1px solid ${disabled?T.dim:danger?"#b0303060":"#c9a84c50"}`,borderRadius:6,color:disabled?T.dim:danger?T.danger:T.gold,cursor:disabled?"not-allowed":"pointer",transition:"all 0.2s",width:full?"100%":undefined,...style }}>
      {children}
    </button>
  );
}
export function DiffTag({ diff }) {
  const c = DIFF[diff]||DIFF["D-Rank"];
  return <span style={{ fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:2,padding:"2px 7px",border:`1px solid ${c.col}50`,borderRadius:3,color:c.col,background:`${c.col}10` }}>{diff}</span>;
}
export function AIStatus({ status }) {
  const cfg = {
    idle:   {col:T.dim,    label:"AI READY",    pulse:false},
    working:{col:"#c9a84c",label:"AI THINKING", pulse:true },
    ok:     {col:T.sg,     label:"AI ONLINE",   pulse:false},
    error:  {col:T.danger, label:"AI ERROR",    pulse:false},
    offline:{col:T.dim,    label:"AI OFFLINE",  pulse:false},
  }[status]||{col:T.dim,label:"",pulse:false};
  return (
    <div style={{ display:"flex",alignItems:"center",gap:5 }}>
      <div style={{ width:6,height:6,borderRadius:"50%",background:cfg.col,animation:cfg.pulse?"pulse 1s ease-in-out infinite":"none",boxShadow:cfg.pulse?`0 0 6px ${cfg.col}`:undefined }}/>
      <span style={{ fontFamily:"var(--font-ui)",fontSize:7,letterSpacing:2,color:cfg.col }}>{cfg.label}</span>
    </div>
  );
}
