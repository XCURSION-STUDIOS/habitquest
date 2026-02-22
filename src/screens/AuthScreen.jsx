import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase.js";
import { T, FONTS } from "../constants/theme.js";
import GlobalCSS from "../components/ui/GlobalCSS.jsx";

function ParticleCanvas() {
  const canvasRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 1.5 + 0.3,
      speed: Math.random() * 0.4 + 0.1,
      dx: (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.5 + 0.1,
      color: ["#c9a84c","#6b4fb0","#00cc88","#7a8aaa"][Math.floor(Math.random()*4)],
    }));
    let raf;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      particles.forEach(p => {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = p.color + Math.floor(p.opacity * 255).toString(16).padStart(2,"0");
        ctx.fill();
        p.y -= p.speed;
        p.x += p.dx;
        if (p.y < -5) { p.y = canvas.height + 5; p.x = Math.random() * canvas.width; }
      });
      // Draw faint connection lines
      for (let i = 0; i < particles.length; i++) {
        for (let j = i+1; j < particles.length; j++) {
          const dist = Math.hypot(particles[i].x-particles[j].x, particles[i].y-particles[j].y);
          if (dist < 80) {
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(201,168,76,${0.06*(1-dist/80)})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(draw);
    }
    draw();
    const resize = () => { canvas.width=window.innerWidth; canvas.height=window.innerHeight; };
    window.addEventListener("resize", resize);
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} style={{ position:"fixed",inset:0,zIndex:0,pointerEvents:"none" }}/>;
}

export default function AuthScreen({ onAuth }) {
  const [mode,setMode]         = useState("login");
  const [email,setEmail]       = useState("");
  const [password,setPassword] = useState("");
  const [loading,setLoading]   = useState(false);
  const [error,setError]       = useState("");
  const inp = { width:"100%",background:"rgba(13,13,26,0.85)",border:`1px solid ${T.bg3}`,borderRadius:7,color:T.text,padding:"12px 14px",fontFamily:FONTS.ui,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:12 };

  async function submit() {
    if (!email.trim()||!password.trim()){ setError("Email and password required."); return; }
    setLoading(true); setError("");
    try {
      if (mode==="register") {
        const { data, error } = await supabase.auth.signUp({ email:email.trim(), password });
        if (error) throw error;
        if (data.session) onAuth(data.session.user);
        else setError("Check your email to confirm your account, then sign in.");
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email:email.trim(), password });
        if (error) throw error;
        onAuth(data.user);
      }
    } catch(e) { setError(e.message||"Authentication failed."); }
    setLoading(false);
  }

  return (
    <div style={{ fontFamily:FONTS.ui,background:T.bg0,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,boxSizing:"border-box",position:"relative" }}>
      <GlobalCSS accent="#c9a84c"/>
      <ParticleCanvas/>
      <div style={{ maxWidth:360,width:"100%",textAlign:"center",position:"relative",zIndex:1 }}>
        <div style={{ fontFamily:FONTS.display,fontSize:60,color:"#c9a84c",lineHeight:1,textShadow:"0 0 60px #c9a84c30",marginBottom:6,animation:"float 3s ease-in-out infinite" }}>HabitQuest</div>
        <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:5,color:T.dim,marginBottom:40 }}>BUILD BETTER HABITS</div>
        <div style={{ display:"flex",gap:0,marginBottom:24,border:`1px solid ${T.bg3}`,borderRadius:7,overflow:"hidden",background:"rgba(13,13,26,0.7)" }}>
          {["login","register"].map(m=>(
            <button key={m} onClick={()=>{setMode(m);setError("");}} style={{ flex:1,padding:"10px",background:mode===m?"#c9a84c15":"transparent",border:"none",color:mode===m?"#c9a84c":T.dim,fontFamily:FONTS.ui,fontSize:9,letterSpacing:3,cursor:"pointer",transition:"all 0.2s",textTransform:"uppercase" }}>
              {m==="login"?"Sign In":"Register"}
            </button>
          ))}
        </div>
        <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" type="email" style={inp}
          onFocus={e=>e.target.style.borderColor="#c9a84c"} onBlur={e=>e.target.style.borderColor=T.bg3}
          onKeyDown={e=>e.key==="Enter"&&submit()}/>
        <input value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" type="password" style={inp}
          onFocus={e=>e.target.style.borderColor="#c9a84c"} onBlur={e=>e.target.style.borderColor=T.bg3}
          onKeyDown={e=>e.key==="Enter"&&submit()}/>
        {error&&<div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.danger,marginBottom:12,textAlign:"left",lineHeight:1.5 }}>{error}</div>}
        <button onClick={submit} disabled={loading} style={{ width:"100%",padding:"14px",background:"rgba(13,13,26,0.8)",border:"1px solid #c9a84c50",borderRadius:7,color:"#c9a84c",fontFamily:FONTS.ui,fontSize:10,letterSpacing:4,cursor:loading?"not-allowed":"pointer",transition:"all 0.3s",boxShadow:"0 0 30px #c9a84c20",opacity:loading?0.6:1 }}>
          {loading?"...":(mode==="login"?"SIGN IN":"CREATE ACCOUNT")}
        </button>
        <div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.dim,marginTop:20,lineHeight:1.7 }}>
          {mode==="login"?"No account? ":"Already registered? "}
          <button onClick={()=>{setMode(mode==="login"?"register":"login");setError("");}} style={{ background:"none",border:"none",color:"#c9a84c",fontFamily:FONTS.ui,fontSize:9,cursor:"pointer",textDecoration:"underline" }}>
            {mode==="login"?"Register here":"Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}
