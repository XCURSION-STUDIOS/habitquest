import { useState } from "react";
import { T, FONTS } from "../constants/theme.js";
import GlobalCSS from "../components/ui/GlobalCSS.jsx";

export default function SetupScreen({ onComplete, th }) {
  const [form,setForm] = useState({ name:"",age:"",occupation:"",bio:"" });
  const inp = { width:"100%",background:"rgba(13,13,26,0.9)",border:`1px solid ${T.bg3}`,borderRadius:7,color:T.text,padding:"12px 14px",fontFamily:"var(--font-ui)",fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:12 };
  return (
    <div style={{ fontFamily:"var(--font-ui)",background:T.bg0,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,boxSizing:"border-box" }}>
      <GlobalCSS accent={th.accent}/>
      <div style={{ maxWidth:380,width:"100%",textAlign:"center" }}>
        <div style={{ fontFamily:"var(--font-display)",fontSize:64,color:th.accent,lineHeight:1,textShadow:`0 0 50px ${th.glow}`,marginBottom:4 }}>Welcome.</div>
        <div style={{ fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:5,color:T.dim,marginBottom:40 }}>SET UP YOUR PROFILE</div>
        <div style={{ fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:3,color:T.dim,marginBottom:16,textAlign:"left" }}>YOUR DETAILS</div>
        {[["name","Your name *"],["age","Age"],["occupation","Occupation / Role"]].map(([k,ph])=>(
          <input key={k} value={form[k]} onChange={e=>setForm(x=>({...x,[k]:e.target.value}))} placeholder={ph} style={inp}
            onFocus={e=>e.target.style.borderColor=th.accent} onBlur={e=>e.target.style.borderColor=T.bg3}
            onKeyDown={e=>e.key==="Enter"&&form.name.trim()&&onComplete(form)}/>
        ))}
        <textarea value={form.bio} onChange={e=>setForm(x=>({...x,bio:e.target.value}))} placeholder="A short bio — the AI uses this to personalise your experience"
          style={{ ...inp,height:80,resize:"none" }}
          onFocus={e=>e.target.style.borderColor=th.accent} onBlur={e=>e.target.style.borderColor=T.bg3}/>
        <button onClick={()=>form.name.trim()&&onComplete(form)} style={{ width:"100%",padding:"14px",background:"transparent",border:`1px solid ${th.accent}50`,borderRadius:7,color:th.accent,fontFamily:"var(--font-ui)",fontSize:10,letterSpacing:4,cursor:form.name.trim()?"pointer":"not-allowed",transition:"all 0.3s",marginTop:4,boxShadow:`0 0 30px ${th.glow}` }}
          onMouseEnter={e=>{if(form.name.trim())e.target.style.background=`${th.accent}12`;}} onMouseLeave={e=>{e.target.style.background="transparent";}}>
          GET STARTED
        </button>
      </div>
    </div>
  );
}
