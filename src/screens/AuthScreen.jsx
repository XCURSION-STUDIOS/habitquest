import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase.js";
import { T, FONTS } from "../constants/theme.js";

function XCursionLogo({ progress, accent }) {
  // Reconstructed from actual logo:
  // - Top: 1 large diamond (point up)
  // - Mid-upper: 2 wide diamonds left+right
  // - Center: hourglass figure (top triangle + bottom triangle + circle top + circle bottom)
  // - Mid-lower: 2 medium diamonds left+right  
  // - Bottom: 1 inverted triangle center + 2 small lens shapes left+right
  const shapes = [
    // Top large diamond
    { type:"diamond", cx:200, cy:52,  w:90, h:70,  delay:0    },
    // Mid-upper left diamond
    { type:"diamond", cx:90,  cy:118, w:78, h:90,  delay:0.06 },
    // Mid-upper right diamond
    { type:"diamond", cx:310, cy:118, w:78, h:90,  delay:0.06 },
    // Center top triangle (pointing down, top half of hourglass)
    { type:"tri-down", cx:200, cy:148, w:70, h:60, delay:0.13 },
    // Center circle top (waist of hourglass)
    { type:"circle", cx:200, cy:182, r:14,         delay:0.18 },
    // Center bottom triangle (pointing up, bottom half of hourglass)
    { type:"tri-up",  cx:200, cy:216, w:70, h:60,  delay:0.22 },
    // Center circle bottom
    { type:"circle", cx:200, cy:252, r:10,          delay:0.26 },
    // Mid-lower left diamond
    { type:"diamond", cx:90,  cy:232, w:58, h:70,  delay:0.30 },
    // Mid-lower right diamond
    { type:"diamond", cx:310, cy:232, w:58, h:70,  delay:0.30 },
    // Bottom center inverted diamond (small)
    { type:"diamond", cx:200, cy:296, w:54, h:44,  delay:0.36 },
    // Bottom left lens
    { type:"diamond", cx:112, cy:306, w:44, h:34,  delay:0.40 },
    // Bottom right lens
    { type:"diamond", cx:288, cy:306, w:44, h:34,  delay:0.40 },
  ];

  function renderShape(s, i) {
    const p = Math.max(0, Math.min(1, (progress - s.delay) / 0.22));
    const opacity = p;
    const scale = 0.3 + p * 0.7;

    let points = "";
    if (s.type === "diamond") {
      points = `0,${-s.h/2} ${s.w/2},0 0,${s.h/2} ${-s.w/2},0`;
    } else if (s.type === "tri-down") {
      points = `${-s.w/2},${-s.h/2} ${s.w/2},${-s.h/2} 0,${s.h/2}`;
    } else if (s.type === "tri-up") {
      points = `0,${-s.h/2} ${s.w/2},${s.h/2} ${-s.w/2},${s.h/2}`;
    }

    return (
      <g key={i} transform={`translate(${s.cx},${s.cy}) scale(${scale})`} style={{ opacity }}>
        {s.type === "circle" ? (
          <>
            <circle cx={0} cy={0} r={s.r} fill="url(#hatch2)" filter="url(#glow2)"/>
            <circle cx={0} cy={0} r={s.r} fill="none" stroke={accent} strokeWidth="0.8" opacity="0.5"/>
          </>
        ) : (
          <>
            <polygon points={points} fill="url(#hatch2)" filter="url(#glow2)"/>
            <polygon points={points} fill="none" stroke={accent} strokeWidth="0.8" opacity="0.4"/>
          </>
        )}
      </g>
    );
  }

  return (
    <svg viewBox="0 0 400 350" width="160" height="140" style={{ overflow:"visible" }}>
      <defs>
        <pattern id="hatch2" patternUnits="userSpaceOnUse" width="8" height="8">
          <line x1="0" y1="0" x2="8" y2="0" stroke="white" strokeWidth="1.4" opacity="0.95"/>
        </pattern>
        <filter id="glow2">
          <feGaussianBlur stdDeviation="2.5" result="blur"/>
          <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
        </filter>
      </defs>
      {shapes.map((s, i) => renderShape(s, i))}
    </svg>
  );
}

function GradientCanvas({ phase, accent }) {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);
  const timeRef   = useRef(0);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    function resize() { canvas.width=window.innerWidth; canvas.height=window.innerHeight; }
    resize();
    window.addEventListener("resize", resize);
    function draw() {
      timeRef.current += 0.003;
      const t=timeRef.current, w=canvas.width, h=canvas.height;
      ctx.clearRect(0,0,w,h);
      ctx.fillStyle="#00000f";
      ctx.fillRect(0,0,w,h);
      const orbs=[
        {x:0.3+Math.sin(t*0.7)*0.2,  y:0.3+Math.cos(t*0.5)*0.2,  r:0.55, col:accent+"38"},
        {x:0.7+Math.cos(t*0.6)*0.15, y:0.6+Math.sin(t*0.8)*0.2,  r:0.45, col:"#6b4fb055"},
        {x:0.5+Math.sin(t*0.4)*0.25, y:0.8+Math.cos(t*0.3)*0.15, r:0.4,  col:accent+"22"},
      ];
      orbs.forEach(orb=>{
        const grd=ctx.createRadialGradient(orb.x*w,orb.y*h,0,orb.x*w,orb.y*h,orb.r*w);
        grd.addColorStop(0,orb.col); grd.addColorStop(1,"transparent");
        ctx.fillStyle=grd; ctx.fillRect(0,0,w,h);
      });

      rafRef.current=requestAnimationFrame(draw);
    }
    draw();
    return ()=>{ cancelAnimationFrame(rafRef.current); window.removeEventListener("resize",resize); };
  },[accent]);
  return <canvas ref={canvasRef} style={{ position:"fixed",inset:0,zIndex:0,opacity:Math.min(1,phase*1.5),transition:"opacity 0.8s ease" }}/>;
}

function HalftoneGrid({ phase, accent }) {
  const cols=22, rows=16;
  return (
    <div style={{ position:"fixed",inset:0,zIndex:1,pointerEvents:"none",opacity:Math.min(0.3,phase*0.45),transition:"opacity 1.5s ease" }}>
      {Array.from({length:rows}).map((_,r)=>
        Array.from({length:cols}).map((_,c)=>{
          const delay=((r*cols+c)/(rows*cols))*2.5;
          const dist=Math.sqrt(Math.pow((c/cols)-0.5,2)+Math.pow((r/rows)-0.5,2));
          const size=Math.max(1,3.5-dist*4);
          return <div key={`${r}-${c}`} style={{ position:"absolute",left:`${(c/cols)*100}%`,top:`${(r/rows)*100}%`,width:size,height:size,borderRadius:"50%",background:accent,opacity:0.4,animation:`dotPulse 3.5s ease-in-out ${delay}s infinite`,transform:"translate(-50%,-50%)" }}/>;
        })
      )}
    </div>
  );
}

export default function AuthScreen({ onAuth }) {
  const [phase,setPhase]               = useState(0);
  const [logoProgress,setLogoProgress] = useState(0);
  const [mode,setMode]                 = useState("login");
  const [email,setEmail]               = useState("");
  const [password,setPassword]         = useState("");
  const [loading,setLoading]           = useState(false);
  const [error,setError]               = useState("");
  const accent = "#c9a84c";

  useEffect(()=>{
    // Slower, more cinematic timing
    const t1=setTimeout(()=>setPhase(1), 400);   // bg fades in
    const t2=setTimeout(()=>{                     // logo assembles over ~2.5s
      let p=0;
      const iv=setInterval(()=>{ p+=0.010; setLogoProgress(Math.min(p,1)); if(p>=1)clearInterval(iv); },16);
    }, 900);
    const t3=setTimeout(()=>setPhase(2), 4200);  // logo holds longer, then fades
    const t4=setTimeout(()=>setPhase(3), 5200);  // login slides in
    return ()=>[t1,t2,t3,t4].forEach(clearTimeout);
  },[]);

  async function submit(){
    if(!email.trim()||!password.trim()){setError("Email and password required.");return;}
    setLoading(true);setError("");
    try{
      if(mode==="register"){
        const{data,error}=await supabase.auth.signUp({email:email.trim(),password});
        if(error)throw error;
        if(data.session)onAuth(data.session.user);
        else setError("Check your email to confirm your account, then sign in.");
      }else{
        const{data,error}=await supabase.auth.signInWithPassword({email:email.trim(),password});
        if(error)throw error;
        onAuth(data.user);
      }
    }catch(e){setError(e.message||"Authentication failed.");}
    setLoading(false);
  }

  const inp={width:"100%",background:"rgba(6,6,15,0.7)",border:`1px solid ${accent}30`,borderRadius:6,color:"#e8d090",padding:"13px 16px",fontFamily:FONTS.ui,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:12,backdropFilter:"blur(8px)",transition:"border-color 0.3s"};

  return (
    <div style={{ fontFamily:FONTS.ui,background:"#00000f",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,boxSizing:"border-box",position:"relative",overflow:"hidden" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,600;1,400&family=DM+Mono:wght@400;500&display=swap');
        @keyframes dotPulse{0%,100%{opacity:0.15;transform:translate(-50%,-50%) scale(0.7);}50%{opacity:0.5;transform:translate(-50%,-50%) scale(1.2);}}
        @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-10px);}}
        @keyframes shimmer{0%{background-position:200% center;}100%{background-position:-200% center;}}
        @keyframes loginSlideUp{from{transform:translateY(40px) perspective(600px) rotateX(10deg);opacity:0;}to{transform:translateY(0) perspective(600px) rotateX(0deg);opacity:1;}}
        @keyframes titleCrash{0%{transform:translateY(60px) perspective(800px) rotateX(25deg);opacity:0;letter-spacing:0.3em;}60%{transform:translateY(-4px) perspective(800px) rotateX(-2deg);opacity:1;}100%{transform:translateY(0) perspective(800px) rotateX(0deg);opacity:1;letter-spacing:0.05em;}}
        @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.4;}}
        @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
      `}</style>

      <GradientCanvas phase={phase} accent={accent}/>
      <HalftoneGrid phase={phase} accent={accent}/>

      {/* Scanlines */}
      <div style={{ position:"fixed",inset:0,zIndex:2,pointerEvents:"none",background:"linear-gradient(transparent 50%,rgba(0,0,0,0.03) 50%)",backgroundSize:"100% 3px",opacity:0.4 }}/>

      {/* Logo intro */}
      <div style={{ position:"fixed",inset:0,zIndex:10,display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",pointerEvents:"none",opacity:phase>=2?0:phase>=1?1:0,transform:phase>=2?"scale(1.12)":"scale(1)",transition:"opacity 1s ease, transform 1s ease" }}>
        <div style={{ animation:phase>=1&&phase<2?"float 4s ease-in-out infinite":"none" }}>
          <XCursionLogo progress={logoProgress} accent={accent}/>
        </div>
        <div style={{ marginTop:28,fontFamily:FONTS.ui,fontSize:9,letterSpacing:8,opacity:logoProgress>0.65?1:0,transition:"opacity 0.8s ease",background:`linear-gradient(90deg,${accent},#fff,${accent})`,backgroundSize:"200% auto",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",animation:logoProgress>0.65?"shimmer 3.5s linear infinite":"none" }}>
          XCURSION STUDIOS
        </div>
        <div style={{ marginTop:10,fontFamily:FONTS.ui,fontSize:7,letterSpacing:5,color:T.dim,opacity:logoProgress>0.82?1:0,transition:"opacity 0.8s ease 0.4s" }}>
          PRESENTS
        </div>
      </div>

      {/* Login */}
      <div style={{ maxWidth:"min(380px, 90vw)",width:"100%",textAlign:"center",position:"relative",zIndex:20,opacity:phase>=3?1:0,transition:"opacity 0.1s" }}>
        {phase>=3&&(
          <>
            <div style={{ fontFamily:FONTS.ui,fontSize:7,letterSpacing:5,color:T.dim,marginBottom:32,animation:"fadeIn 0.8s ease forwards" }}>
              AN XCURSION STUDIOS APP
            </div>
            <div style={{ fontFamily:FONTS.display,fontSize:"clamp(48px, 10vw, 88px)",color:accent,lineHeight:0.9,marginBottom:6,textShadow:`0 0 80px ${accent}40,0 0 20px ${accent}20`,animation:"titleCrash 0.9s cubic-bezier(0.16,1,0.3,1) forwards",transformOrigin:"center bottom" }}>
              HabitQuest
            </div>
            <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:6,color:T.dim,marginBottom:48,animation:"fadeIn 0.8s ease 0.5s both" }}>
              BUILD BETTER HABITS
            </div>
            <div style={{ background:"rgba(6,6,15,0.75)",border:`1px solid ${accent}20`,borderRadius:12,padding:"28px 24px",backdropFilter:"blur(20px)",boxShadow:`0 32px 64px rgba(0,0,0,0.6),0 0 0 1px ${accent}10,inset 0 1px 0 ${accent}15`,animation:"loginSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both" }}>
              <div style={{ display:"flex",marginBottom:24,border:`1px solid ${accent}20`,borderRadius:7,overflow:"hidden",background:"rgba(0,0,0,0.3)" }}>
                {["login","register"].map(m=>(
                  <button key={m} onClick={()=>{setMode(m);setError("");}} style={{ flex:1,padding:"10px",background:mode===m?`${accent}15`:"transparent",border:"none",color:mode===m?accent:T.dim,fontFamily:FONTS.ui,fontSize:9,letterSpacing:3,cursor:"pointer",transition:"all 0.2s",textTransform:"uppercase",borderBottom:mode===m?`1px solid ${accent}`:"1px solid transparent" }}>
                    {m==="login"?"Sign In":"Register"}
                  </button>
                ))}
              </div>
              <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" style={inp}
                onFocus={e=>e.target.style.borderColor=accent} onBlur={e=>e.target.style.borderColor=`${accent}30`}
                onKeyDown={e=>e.key==="Enter"&&submit()}/>
              <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" style={inp}
                onFocus={e=>e.target.style.borderColor=accent} onBlur={e=>e.target.style.borderColor=`${accent}30`}
                onKeyDown={e=>e.key==="Enter"&&submit()}/>
              {error&&<div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.danger,marginBottom:12,textAlign:"left",lineHeight:1.5 }}>{error}</div>}
              <button onClick={submit} disabled={loading} style={{ width:"100%",padding:"14px",background:`linear-gradient(135deg,${accent}18,${accent}08)`,border:`1px solid ${accent}50`,borderRadius:7,color:accent,fontFamily:FONTS.ui,fontSize:10,letterSpacing:4,cursor:loading?"not-allowed":"pointer",transition:"all 0.3s",boxShadow:`0 0 30px ${accent}15`,opacity:loading?0.6:1 }}
                onMouseEnter={e=>{if(!loading)e.currentTarget.style.background=`linear-gradient(135deg,${accent}28,${accent}18)`;}}
                onMouseLeave={e=>{e.currentTarget.style.background=`linear-gradient(135deg,${accent}18,${accent}08)`;}}>
                {loading?"...":(mode==="login"?"SIGN IN":"CREATE ACCOUNT")}
              </button>
              <div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.dim,marginTop:16,lineHeight:1.7 }}>
                {mode==="login"?"No account? ":"Already registered? "}
                <button onClick={()=>{setMode(mode==="login"?"register":"login");setError("");}} style={{ background:"none",border:"none",color:accent,fontFamily:FONTS.ui,fontSize:9,cursor:"pointer",textDecoration:"underline" }}>
                  {mode==="login"?"Register here":"Sign in"}
                </button>
              </div>
            </div>
            <div style={{ marginTop:24,fontFamily:FONTS.ui,fontSize:7,letterSpacing:3,color:T.dim,opacity:0.5,animation:"fadeIn 1.2s ease 1s both" }}>
              © XCURSION STUDIOS
            </div>
          </>
        )}
      </div>
    </div>
  );
}
