import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";

// ─────────────────────────────────────────────────────────────
// SUPABASE CLIENT
// Replace these with your actual values from supabase.com
// ─────────────────────────────────────────────────────────────
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// Edge function URL — set automatically from your Supabase project
const AI_PROXY_URL = `${SUPABASE_URL}/functions/v1/ai-proxy`;

// ─────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────
const T = {
  bg0:"#06060f", bg1:"#0d0d1a", bg2:"#111120", bg3:"#1c1c30",
  gold:"#c9a84c", silver:"#7a8aaa", dim:"#3a4060",
  text:"#d8e0f0", textBright:"#eef2ff",
  danger:"#b03030", success:"#27a060", purple:"#6b4fb0",
  abyss:"#3a0000", sg:"#00cc88",
};
const FONTS = {
  display:"'Cormorant Garamond','Georgia',serif",
  ui:"'DM Mono','Courier New',monospace",
};

// ─────────────────────────────────────────────────────────────
// GAME DATA
// ─────────────────────────────────────────────────────────────
const STATS   = ["Physical","Mental","Spiritual","Social","Emotional"];
const STAT_COL = { Physical:"#b03030",Mental:"#2060a0",Spiritual:"#7060c0",Social:"#b09020",Emotional:"#208060" };
const STAT_ICO = { Physical:"⚔",Mental:"◈",Spiritual:"✦",Social:"◉",Emotional:"♦" };
const DIFF = {
  "F-Rank":{ xp:20,  gems:2,  col:"#444"    },
  "E-Rank":{ xp:40,  gems:4,  col:"#607080" },
  "D-Rank":{ xp:80,  gems:7,  col:"#208060" },
  "C-Rank":{ xp:140, gems:12, col:"#2060a0" },
  "B-Rank":{ xp:220, gems:20, col:"#c9a84c" },
  "A-Rank":{ xp:340, gems:30, col:"#b03030" },
  "S-Rank":{ xp:500, gems:45, col:"#6b4fb0" },
};
const XP_PER_LEVEL = 400;
const getLevel = xp  => Math.floor(xp / XP_PER_LEVEL) + 1;
const getXPPct  = xp  => (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
const TODAY     = ()  => new Date().toISOString().split("T")[0];
const CLASSES   = [
  { min:1,   name:"Mortal",   icon:"◌" }, { min:5,  name:"Awakened", icon:"◈" },
  { min:10,  name:"E-Class",  icon:"◇" }, { min:20, name:"D-Class",  icon:"◆" },
  { min:35,  name:"C-Class",  icon:"⬡" }, { min:50, name:"B-Class",  icon:"✦" },
  { min:70,  name:"A-Class",  icon:"★" }, { min:90, name:"S-Class",  icon:"⚔" },
  { min:100, name:"National", icon:"⚡" },
];
const getClass = lvl => [...CLASSES].reverse().find(c => lvl >= c.min) || CLASSES[0];

const SHOP_ITEMS = [
  { id:"xp2",  name:"Soul Infusion",   icon:"◈", cost:40,  type:"temp", desc:"2× XP on next 5 completions.", uses:5, val:2 },
  { id:"gem2", name:"Fortune Seal",    icon:"✦", cost:35,  type:"temp", desc:"2× gems on next 5 completions.", uses:5, val:2 },
  { id:"frz",  name:"Temporal Stasis", icon:"◇", cost:55,  type:"temp", desc:"One streak survives a missed day.", uses:1, val:1 },
  { id:"xp3",  name:"Monarch's Surge", icon:"⚡", cost:110, type:"temp", desc:"3× XP for next 3 completions.", uses:3, val:3 },
  { id:"pxp",  name:"Eternal Resolve", icon:"★", cost:250, type:"perm", desc:"+8% XP on every task forever.", effect:"+8% XP" },
  { id:"pgem", name:"Midas Mark",      icon:"⬡", cost:200, type:"perm", desc:"+10% gems on every completion forever.", effect:"+10% Gems" },
  ...STATS.map(s => ({ id:`p${s.toLowerCase().slice(0,4)}`, name:`${s} Awakening`, icon:STAT_ICO[s], cost:180, type:"perm", desc:`+20 ${s} stat ceiling.`, effect:`+20 ${s} Cap`, stat:s })),
  { id:"th_blood", name:"Blood Oath",    icon:"◆", cost:50,  type:"cosm", desc:"Crimson accent theme.", theme:"blood" },
  { id:"th_void",  name:"The Void",      icon:"⬡", cost:50,  type:"cosm", desc:"Deep violet theme.",   theme:"void"  },
  { id:"th_jade",  name:"Jade Dynasty",  icon:"✦", cost:50,  type:"cosm", desc:"Ancient jade theme.",  theme:"jade"  },
  { id:"th_iron",  name:"Iron Realm",    icon:"◈", cost:50,  type:"cosm", desc:"Cold silver theme.",   theme:"iron"  },
  { id:"aura",     name:"Sovereign Aura",icon:"⚡", cost:300, type:"cosm", desc:"Animated sovereign aura." },
  { id:"tit_sm",   name:"Shadow Monarch",icon:"◈", cost:100, type:"cosm", desc:"Title: Shadow Monarch.", titleVal:"Shadow Monarch" },
  { id:"tit_ar",   name:"ARISE",         icon:"⚔", cost:300, type:"cosm", desc:"Title: ARISE.",          titleVal:"ARISE" },
];
const THEMES = {
  default:{ accent:"#c9a84c", glow:"#c9a84c20", text:"#e8d090" },
  blood:  { accent:"#b03030", glow:"#b0303020", text:"#e07070" },
  void:   { accent:"#6b4fb0", glow:"#6b4fb020", text:"#b090e0" },
  jade:   { accent:"#20a060", glow:"#20a06020", text:"#70d0a0" },
  iron:   { accent:"#7a8aaa", glow:"#7a8aaa20", text:"#b0c0d8" },
};

// ─────────────────────────────────────────────────────────────
// DEFAULT GAME STATE (merged with DB data on login)
// ─────────────────────────────────────────────────────────────
const DEFAULT_GAME = {
  char:{ name:"", age:"", occupation:"", bio:"" },
  setup: false,
  xp:0, gems:0,
  stats:{ Physical:1, Mental:1, Spiritual:1, Social:1, Emotional:1 },
  daily:[
    { id:1, name:"Work Out",    type:"Physical", diff:"D-Rank", streak:0, best:0 },
    { id:2, name:"Read",        type:"Mental",   diff:"D-Rank", streak:0, best:0 },
    { id:3, name:"Code / Learn",type:"Mental",   diff:"C-Rank", streak:0, best:0 },
  ],
  quests:[], done:{},
  perms:[], actives:[], cosmetics:[], titles:[],
  title:null, theme:"default", aura:false,
  shadowMission:null, shadowProgress:0,
  boss:null, bossHPLeft:0,
  abyssDepth:0, abyssActive:false,
  mood:null, lastMoodDate:null,
  lastDay: TODAY(),
  briefing:null, briefingDate:null,
  memory:{ recentActivity:[], totalDays:0, avgCompletions:0, mostSkipped:null, longestStreak:0 },
};

// ─────────────────────────────────────────────────────────────
// AI HELPERS
// ─────────────────────────────────────────────────────────────
function buildCharContext(state) {
  const level = getLevel(state.xp);
  const cls   = getClass(level);
  const today = TODAY();
  const done  = state.done?.[today] || {};
  const completedToday = state.daily?.filter(q => done[q.id]).map(q => q.name) || [];
  const statSummary    = STATS.map(s => `${s}:${state.stats?.[s]||1}`).join(", ");
  const weakest  = STATS.reduce((a,b) => (state.stats?.[a]||1) < (state.stats?.[b]||1) ? a : b);
  const strongest = STATS.reduce((a,b) => (state.stats?.[a]||1) > (state.stats?.[b]||1) ? a : b);
  const streaks  = state.daily?.map(q => `${q.name}(streak:${q.streak})`).join(", ") || "none";
  const hist     = state.memory?.recentActivity?.slice(-7) || [];
  return `
PLAYER: ${state.char?.name||"Unknown"} | Age: ${state.char?.age||"?"} | ${state.char?.occupation||"no occupation"}
Bio: ${state.char?.bio||"none"}
Level: ${level} (${cls.name}) | XP: ${state.xp} | Gems: ${state.gems} | Mood: ${state.mood||"unset"}
Stats: ${statSummary}
Weakest: ${weakest}(${state.stats?.[weakest]||1}) | Strongest: ${strongest}(${state.stats?.[strongest]||1})
Habits & streaks: ${streaks}
Completed today: ${completedToday.join(", ")||"none"}
Abyss depth: ${state.abyssDepth||0}/20
Active quests: ${state.quests?.filter(q=>!q.done).map(q=>`${q.name}(${q.diff})`).join(", ")||"none"}
Recent 7 days: ${hist.map(r=>`${r.date}:${r.count}tasks,mood=${r.mood||"?"}`).join(" | ")||"no history"}
Avg completions/day: ${state.memory?.avgCompletions?.toFixed(1)||"unknown"}
Most skipped stat: ${state.memory?.mostSkipped||"unknown"}
`.trim();
}

function buildSystemPrompt(ctx) {
  return `You are THE SYSTEM — the omniscient AI overseer of a solo levelling productivity RPG called HabitQuest. You speak in a terse, weighty, in-universe voice: cold, precise, occasionally poetic. You are not a chatbot. You are an ancient intelligence that monitors growth, knows weaknesses, issues judgements. Never warm or casual. Short paragraphs. No bullet points in free text.

Player data:
${ctx}

Rules:
- Always respond in character as THE SYSTEM
- Quest suggestions must use exact format: [QUEST: "Name" | Rank: X-Rank | Type: StatType | Reason: brief]
- Reference the player's actual stats, habits, and history
- Keep responses under 180 words unless listing multiple quests
- Never break character. Never say "I" — speak declaratively as THE SYSTEM`;
}

async function callAIProxy(anonKey, systemPrompt, userMessage, history = []) {
  const res = await fetch(AI_PROXY_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${anonKey}`,
    },
    body: JSON.stringify({ systemPrompt, userMessage, history }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error || `HTTP ${res.status}`);
  }
  const data = await res.json();
  return data.text || "";
}

// ─────────────────────────────────────────────────────────────
// SMALL SHARED COMPONENTS
// ─────────────────────────────────────────────────────────────
function GlobalCSS({ accent }) {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Mono:ital,wght@0,400;0,500&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;}
      ::-webkit-scrollbar{width:3px;}
      ::-webkit-scrollbar-track{background:#06060f;}
      ::-webkit-scrollbar-thumb{background:#1c1c30;border-radius:2px;}
      select option{background:#0d0d1a;}
      @keyframes toastIn{from{transform:translateX(20px);opacity:0;}to{transform:translateX(0);opacity:1;}}
      @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
      @keyframes lvlPop{0%{transform:scale(0.85) translateY(16px);opacity:0;}15%{transform:scale(1.02);opacity:1;}85%{transform:scale(1);opacity:1;}100%{transform:scale(0.95) translateY(-8px);opacity:0;}}
      @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.35;}}
      @keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}  }
      @keyframes auraAnim{
        0%{box-shadow:0 0 0 2px #c9a84c,0 0 14px #c9a84c25;}
        25%{box-shadow:0 0 0 2px ${accent},0 0 14px ${accent}25;}
        50%{box-shadow:0 0 0 2px #6b4fb0,0 0 14px #6b4fb025;}
        75%{box-shadow:0 0 0 2px #27a060,0 0 14px #27a06025;}
        100%{box-shadow:0 0 0 2px #c9a84c,0 0 14px #c9a84c25;}
      }
    `}</style>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  const s = { gold:{bg:"#120e00",bd:"#c9a84c",tx:"#e8d090"}, success:{bg:"#001a0a",bd:"#27a060",tx:"#60d090"}, danger:{bg:"#150000",bd:"#b03030",tx:"#d06060"}, info:{bg:"#0a0a18",bd:"#7a8aaa",tx:"#a0b0c8"}, system:{bg:"#001a0e",bd:"#00cc88",tx:"#00ee99"} }[toast.type] || {bg:"#120e00",bd:"#c9a84c",tx:"#e8d090"};
  return <div style={{ position:"fixed",top:20,right:16,zIndex:9999,maxWidth:300,padding:"12px 18px",borderRadius:8,background:s.bg,border:`1px solid ${s.bd}40`,color:s.tx,fontSize:12,fontFamily:FONTS.ui,animation:"toastIn 0.3s ease",boxShadow:`0 8px 32px ${s.bd}15`,lineHeight:1.6,whiteSpace:"pre-wrap" }}>{toast.msg}</div>;
}

function Card({ children, style, accent }) {
  return <div style={{ background:"linear-gradient(135deg,#0d0d1a,#111120)",border:`1px solid ${accent?accent+"30":T.bg3}`,borderRadius:10,padding:16,...style }}>{children}</div>;
}
function SecTitle({ children, col }) {
  return <div style={{ fontFamily:FONTS.ui,fontSize:9,letterSpacing:4,color:col||T.dim,marginBottom:14,textTransform:"uppercase",borderBottom:`1px solid ${T.bg3}`,paddingBottom:8 }}>{children}</div>;
}
function Btn({ children, onClick, disabled, danger, full, style }) {
  const [hov, setHov] = useState(false);
  return <button onClick={disabled?undefined:onClick} onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
    style={{ fontFamily:FONTS.ui,fontSize:10,letterSpacing:2,padding:"10px 16px",background:hov&&!disabled?(danger?"#b0303018":"#c9a84c12"):"transparent",border:`1px solid ${disabled?T.dim:danger?"#b0303060":"#c9a84c50"}`,borderRadius:6,color:disabled?T.dim:danger?T.danger:T.gold,cursor:disabled?"not-allowed":"pointer",transition:"all 0.2s",width:full?"100%":undefined,...style }}>{children}</button>;
}
function DiffTag({ diff }) {
  const c = DIFF[diff]||DIFF["D-Rank"];
  return <span style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,padding:"2px 7px",border:`1px solid ${c.col}50`,borderRadius:3,color:c.col,background:`${c.col}10` }}>{diff}</span>;
}
function RadarChart({ stats, accent, size=210 }) {
  const cx=size/2, cy=size/2, r=size*0.36, n=STATS.length;
  const ang = STATS.map((_,i) => Math.PI*2*i/n - Math.PI/2);
  const pt  = (a,p) => ({ x:cx+Math.cos(a)*r*p, y:cy+Math.sin(a)*r*p });
  const dpts = STATS.map((s,i) => pt(ang[i], Math.min(stats[s]||1,100)/100));
  const dpath = dpts.map((p,i)=>`${i===0?"M":"L"}${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ")+"Z";
  return (
    <svg width={size} height={size} style={{ overflow:"visible" }}>
      <defs><radialGradient id="rg" cx="50%" cy="50%"><stop offset="0%" stopColor={accent} stopOpacity="0.2"/><stop offset="100%" stopColor={accent} stopOpacity="0.03"/></radialGradient></defs>
      {[.25,.5,.75,1].map(p=>{const rp=ang.map(a=>pt(a,p));const rpath=rp.map((x,i)=>`${i===0?"M":"L"}${x.x.toFixed(1)},${x.y.toFixed(1)}`).join(" ")+"Z";return <path key={p} d={rpath} fill="none" stroke={T.bg3} strokeWidth={1}/>;  })}
      {ang.map((a,i)=>{const o=pt(a,1);return <line key={i} x1={cx} y1={cy} x2={o.x.toFixed(1)} y2={o.y.toFixed(1)} stroke={T.bg3} strokeWidth={1}/>;  })}
      <path d={dpath} fill="url(#rg)" stroke={accent} strokeWidth={1.5}/>
      {dpts.map((p,i)=><circle key={i} cx={p.x} cy={p.y} r={3.5} fill={STAT_COL[STATS[i]]} stroke={T.bg0} strokeWidth={1.5}/>)}
      {STATS.map((s,i)=>{const lp=pt(ang[i],1.28);return <text key={s} x={lp.x.toFixed(1)} y={lp.y.toFixed(1)} textAnchor="middle" dominantBaseline="middle" fill={STAT_COL[s]} fontSize={9} fontFamily={FONTS.ui} fontWeight="700">{s.toUpperCase()}</text>;})}
    </svg>
  );
}

// AI Status dot
function AIStatus({ status }) {
  // status: "idle" | "working" | "ok" | "error" | "offline"
  const cfg = {
    idle:    { col:T.dim,     label:"AI READY",    pulse:false },
    working: { col:"#c9a84c", label:"AI THINKING",  pulse:true  },
    ok:      { col:T.sg,     label:"AI CONNECTED", pulse:false },
    error:   { col:T.danger,  label:"AI ERROR",     pulse:false },
    offline: { col:T.dim,     label:"AI OFFLINE",   pulse:false },
  }[status] || { col:T.dim, label:"", pulse:false };
  return (
    <div style={{ display:"flex",alignItems:"center",gap:5 }}>
      <div style={{ width:6,height:6,borderRadius:"50%",background:cfg.col,animation:cfg.pulse?"pulse 1s ease-in-out infinite":"none",boxShadow:cfg.pulse?`0 0 6px ${cfg.col}`:undefined }}/>
      <span style={{ fontFamily:FONTS.ui,fontSize:7,letterSpacing:2,color:cfg.col }}>{cfg.label}</span>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// AUTH SCREEN  (Login / Register)
// ─────────────────────────────────────────────────────────────
function AuthScreen({ onAuth }) {
  const [mode, setMode]       = useState("login"); // "login" | "register"
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState("");

  const inp = { width:"100%",background:"rgba(13,13,26,0.9)",border:`1px solid ${T.bg3}`,borderRadius:7,color:T.text,padding:"12px 14px",fontFamily:FONTS.ui,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:12 };

  async function submit() {
    if (!email.trim() || !password.trim()) { setError("Email and password required."); return; }
    setLoading(true); setError("");
    try {
      let result;
      if (mode === "register") {
        result = await supabase.auth.signUp({ email: email.trim(), password });
        if (result.error) throw result.error;
        // For new users, the session may need email confirmation depending on Supabase settings
        // We'll handle both cases
        if (result.data.session) {
          onAuth(result.data.session.user);
        } else {
          setError("Check your email to confirm your account, then log in.");
        }
      } else {
        result = await supabase.auth.signInWithPassword({ email: email.trim(), password });
        if (result.error) throw result.error;
        onAuth(result.data.user);
      }
    } catch (e) {
      setError(e.message || "Authentication failed.");
    }
    setLoading(false);
  }

  return (
    <div style={{ fontFamily:FONTS.ui,background:T.bg0,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,boxSizing:"border-box" }}>
      <GlobalCSS accent="#c9a84c"/>
      <div style={{ maxWidth:360,width:"100%",textAlign:"center" }}>
        <div style={{ fontFamily:FONTS.display,fontSize:60,color:"#c9a84c",lineHeight:1,textShadow:"0 0 50px #c9a84c20",marginBottom:6 }}>HabitQuest</div>
        <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:5,color:T.dim,marginBottom:40 }}>FORGE YOUR LEGEND</div>

        {/* Mode toggle */}
        <div style={{ display:"flex",gap:0,marginBottom:24,border:`1px solid ${T.bg3}`,borderRadius:7,overflow:"hidden" }}>
          {["login","register"].map(m => (
            <button key={m} onClick={()=>{ setMode(m); setError(""); }} style={{ flex:1,padding:"10px",background:mode===m?"#c9a84c15":"transparent",border:"none",color:mode===m?"#c9a84c":T.dim,fontFamily:FONTS.ui,fontSize:9,letterSpacing:3,cursor:"pointer",transition:"all 0.2s",textTransform:"uppercase" }}>
              {m === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        <input
          value={email} onChange={e=>setEmail(e.target.value)}
          placeholder="Email" type="email" style={inp}
          onFocus={e=>e.target.style.borderColor="#c9a84c"}
          onBlur={e=>e.target.style.borderColor=T.bg3}
          onKeyDown={e=>e.key==="Enter"&&submit()}
        />
        <input
          value={password} onChange={e=>setPassword(e.target.value)}
          placeholder="Password" type="password" style={inp}
          onFocus={e=>e.target.style.borderColor="#c9a84c"}
          onBlur={e=>e.target.style.borderColor=T.bg3}
          onKeyDown={e=>e.key==="Enter"&&submit()}
        />

        {error && <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.danger,marginBottom:12,textAlign:"left",lineHeight:1.5 }}>{error}</div>}

        <button onClick={submit} disabled={loading} style={{ width:"100%",padding:"14px",background:"transparent",border:"1px solid #c9a84c50",borderRadius:7,color:"#c9a84c",fontFamily:FONTS.ui,fontSize:10,letterSpacing:4,cursor:loading?"not-allowed":"pointer",transition:"all 0.3s",boxShadow:"0 0 30px #c9a84c20",opacity:loading?0.6:1 }}>
          {loading ? "..." : mode === "login" ? "ENTER THE GATE" : "BEGIN YOUR JOURNEY"}
        </button>

        <div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.dim,marginTop:20,lineHeight:1.7 }}>
          {mode === "login" ? "No account? " : "Already registered? "}
          <button onClick={()=>{ setMode(mode==="login"?"register":"login"); setError(""); }} style={{ background:"none",border:"none",color:"#c9a84c",fontFamily:FONTS.ui,fontSize:9,cursor:"pointer",textDecoration:"underline" }}>
            {mode === "login" ? "Register here" : "Sign in"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// CHARACTER SETUP SCREEN (first-time only)
// ─────────────────────────────────────────────────────────────
function SetupScreen({ onComplete, th }) {
  const [form, setForm] = useState({ name:"", age:"", occupation:"", bio:"" });
  const inp = { width:"100%",background:"rgba(13,13,26,0.9)",border:`1px solid ${T.bg3}`,borderRadius:7,color:T.text,padding:"12px 14px",fontFamily:FONTS.ui,fontSize:13,outline:"none",boxSizing:"border-box",marginBottom:12 };
  return (
    <div style={{ fontFamily:FONTS.ui,background:T.bg0,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",padding:24,boxSizing:"border-box" }}>
      <GlobalCSS accent={th.accent}/>
      <div style={{ maxWidth:380,width:"100%",textAlign:"center" }}>
        <div style={{ fontFamily:FONTS.display,fontSize:64,color:th.accent,lineHeight:1,textShadow:`0 0 50px ${th.glow}`,marginBottom:4 }}>Arise.</div>
        <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:5,color:T.dim,marginBottom:40 }}>YOUR LEGEND BEGINS HERE</div>
        <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:3,color:T.dim,marginBottom:16,textAlign:"left" }}>CHARACTER REGISTRATION</div>
        {[["name","Name *"],["age","Age"],["occupation","Occupation / Class"]].map(([k,ph]) => (
          <input key={k} value={form[k]} onChange={e=>setForm(x=>({...x,[k]:e.target.value}))} placeholder={ph} style={inp}
            onFocus={e=>e.target.style.borderColor=th.accent} onBlur={e=>e.target.style.borderColor=T.bg3}
            onKeyDown={e=>e.key==="Enter"&&form.name.trim()&&onComplete(form)}/>
        ))}
        <textarea value={form.bio} onChange={e=>setForm(x=>({...x,bio:e.target.value}))} placeholder="Bio / backstory (the AI uses this to personalise your experience)" style={{ ...inp,height:80,resize:"none" }}
          onFocus={e=>e.target.style.borderColor=th.accent} onBlur={e=>e.target.style.borderColor=T.bg3}/>
        <button onClick={()=>form.name.trim()&&onComplete(form)} style={{ width:"100%",padding:"14px",background:"transparent",border:`1px solid ${th.accent}50`,borderRadius:7,color:th.accent,fontFamily:FONTS.ui,fontSize:10,letterSpacing:4,cursor:form.name.trim()?"pointer":"not-allowed",transition:"all 0.3s",marginTop:4,boxShadow:`0 0 30px ${th.glow}` }}
          onMouseEnter={e=>{if(form.name.trim()){e.target.style.background=`${th.accent}12`;}}} onMouseLeave={e=>{e.target.style.background="transparent";}}>
          ENTER THE GATE
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN APP
// ─────────────────────────────────────────────────────────────
export default function App() {
  // Auth state
  const [user,    setUser]    = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Game state (loaded from Supabase after login)
  const [game,    setGame]    = useState(DEFAULT_GAME);
  const [saving,  setSaving]  = useState(false);

  // UI state
  const [screen,  setScreen]  = useState("status");
  const [toast,   setToast]   = useState(null);
  const [lvlAnim, setLvlAnim] = useState(null);
  const [shopTab, setShopTab] = useState("temp");
  const [addingDaily, setAddingDaily] = useState(false);
  const [addingQuest, setAddingQuest] = useState(false);
  const [dailyForm, setDailyForm] = useState({ name:"",type:"Physical",diff:"D-Rank" });
  const [questForm, setQuestForm] = useState({ name:"",type:"Physical",diff:"C-Rank" });
  const [editChar,  setEditChar]  = useState(false);
  const [charForm,  setCharForm]  = useState(game.char);

  // AI state
  const [aiStatus,         setAiStatus]         = useState("idle");
  const [briefingLoading,  setBriefingLoading]  = useState(false);

  const showToast = useCallback((msg, type="gold", dur=3000) => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), dur);
  }, []);

  // ── Check existing session on mount ──
  useEffect(() => {
    supabase.auth.getSession().then(({ data:{ session } }) => {
      if (session?.user) setUser(session.user);
      setAuthLoading(false);
    });
    const { data:{ subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // ── Load game state when user logs in ──
  useEffect(() => {
    if (!user) return;
    loadGameState();
  }, [user]);

  async function loadGameState() {
    const { data, error } = await supabase
      .from("profiles")
      .select("game_state")
      .eq("id", user.id)
      .single();

    if (error && error.code !== "PGRST116") {
      console.error("Load error:", error);
      return;
    }
    if (data?.game_state) {
      setGame({ ...DEFAULT_GAME, ...data.game_state });
      setCharForm(data.game_state.char || DEFAULT_GAME.char);
    }
    // If no row exists yet, DEFAULT_GAME is used — profile row created on first save
  }

  // ── Save game state to Supabase (debounced) ──
  const saveTimer = useRef(null);
  const saveGame = useCallback((newGame) => {
    if (!user) return;
    clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      setSaving(true);
      await supabase.from("profiles").upsert({ id: user.id, game_state: newGame, updated_at: new Date().toISOString() });
      setSaving(false);
    }, 1500); // debounce 1.5s so rapid clicks don't spam the DB
  }, [user]);

  // ── Update helper ──
  const update = useCallback(fn => {
    setGame(prev => {
      const next = fn(prev);
      saveGame(next);
      return next;
    });
  }, [saveGame]);

  // ── Day rollover ──
  const today = TODAY();
  useEffect(() => {
    if (!game.setup || game.lastDay === today) return;
    update(s => {
      let broken = 0;
      const daily = s.daily.map(q => {
        if (!(s.done?.[s.lastDay]||{})[q.id]) { broken++; return {...q,streak:0}; }
        return q;
      });
      const newDepth = Math.min((s.abyssDepth||0)+broken, 20);
      const prev = s.memory || {};
      const recentActivity = [...(prev.recentActivity||[]), { date:s.lastDay, count:Object.values(s.done?.[s.lastDay]||{}).filter(Boolean).length, mood:s.mood }].slice(-30);
      const totalDays = (prev.totalDays||0)+1;
      const avgCompletions = recentActivity.reduce((a,r)=>a+r.count,0)/recentActivity.length;
      const statAct = {};
      s.daily.forEach(q => { if ((s.done?.[s.lastDay]||{})[q.id]) statAct[q.type]=(statAct[q.type]||0)+1; });
      const leastActive = STATS.reduce((a,b) => (statAct[a]||0)<(statAct[b]||0)?a:b);
      const longestStreak = Math.max(prev.longestStreak||0, ...s.daily.map(q=>q.best||0));
      return { ...s, daily, lastDay:today, mood:null, briefing:null, briefingDate:null, abyssDepth:newDepth, abyssActive:newDepth>=5, memory:{ recentActivity, totalDays, avgCompletions, mostSkipped:leastActive, longestStreak } };
    });
  }, [today, game.lastDay, game.setup]);

  // ── Auto-generate morning briefing ──
  useEffect(() => {
    if (!game.setup || game.briefingDate === today || briefingLoading) return;
    if (game.briefing) return;
    generateBriefing();
  }, [game.setup, today, game.briefingDate]);

  async function generateBriefing() {
    setBriefingLoading(true);
    setAiStatus("working");
    try {
      const ctx = buildCharContext(game);
      const sys = buildSystemPrompt(ctx);
      const prompt = `Generate a morning briefing for this player. 3-4 sentences in THE SYSTEM voice: acknowledge yesterday's performance, name their most critical current weakness, issue a directive for today. End with one shadow mission specific to their habits. Label it: SHADOW DIRECTIVE: [mission text]`;
      const text = await callAIProxy(SUPABASE_ANON, sys, prompt);
      let briefingText = text;
      let shadowMission = game.shadowMission;
      const match = text.match(/SHADOW DIRECTIVE:\s*(.+?)(?:\n|$)/i);
      if (match && !game.shadowMission) {
        shadowMission = { id:`ai_${Date.now()}`, name:"Shadow Directive", desc:match[1].trim(), req:{ type:"Any", count:1 }, xp:180, gems:18, aiGenerated:true };
        briefingText = text.replace(/SHADOW DIRECTIVE:.*$/im,"").trim();
      }
      update(s => ({ ...s, briefing:briefingText, briefingDate:today, shadowMission }));
      setAiStatus("ok");
    } catch(e) {
      console.warn("Briefing failed:", e.message);
      setAiStatus("error");
      showToast("System connection failed. AI briefing unavailable.", "danger");
    }
    setBriefingLoading(false);
  }

  // ── Multipliers ──
  function getMultipliers() {
    let xm=1, gm=1;
    for (const p of game.actives||[]) {
      if ((p.id==="xp2"||p.id==="xp3")&&p.left>0) xm=Math.max(xm,p.val);
      if (p.id==="gem2"&&p.left>0) gm=Math.max(gm,p.val);
    }
    if (game.perms?.find(p=>p.id==="pxp")) xm+=0.08;
    if (game.perms?.find(p=>p.id==="pgem")) gm+=0.10;
    if (game.mood==="high") xm+=0.25;
    if (game.mood==="low") xm-=0.15;
    return { xm:Math.max(0.1,xm), gm:Math.max(0.1,gm) };
  }

  // ── Complete daily ──
  function completeDaily(id) {
    const todayDone = game.done?.[today]||{};
    if (todayDone[id]) {
      const q = game.daily.find(q=>q.id===id);
      const cfg = DIFF[q.diff];
      update(s=>({...s,xp:Math.max(0,s.xp-cfg.xp),gems:Math.max(0,s.gems-cfg.gems),done:{...s.done,[today]:{...todayDone,[id]:false}},stats:{...s.stats,[q.type]:Math.max(1,(s.stats[q.type]||1)-1)},daily:s.daily.map(d=>d.id===id?{...d,streak:Math.max(0,d.streak-1)}:d)}));
      return;
    }
    const q = game.daily.find(q=>q.id===id);
    const cfg = DIFF[q.diff];
    const {xm,gm} = getMultipliers();
    const xpE = Math.round(cfg.xp*xm), gemE = Math.round(cfg.gems*gm);
    const oldLvl = getLevel(game.xp), newXP = game.xp+xpE;
    showToast(`+${xpE} XP  ·  +${gemE} gems${xm>1.05?"  ⚡":""}`, "gold");
    if (getLevel(newXP)>oldLvl) setTimeout(()=>{ setLvlAnim(getLevel(newXP)); setTimeout(()=>setLvlAnim(null),3500); },200);
    // consume actives
    update(s => {
      const actives = (s.actives||[]).map(p=>(p.id==="xp2"||p.id==="xp3"||p.id==="gem2")?{...p,left:p.left-1}:p).filter(p=>p.left>0);
      let sp=(s.shadowProgress||0), sm=s.shadowMission;
      if (sm) { sp+=1; if(sp>=sm.req.count){ showToast(`Shadow Directive complete. +${sm.xp} XP`,"system"); return {...s,actives,xp:newXP+sm.xp,gems:s.gems+gemE+sm.gems,done:{...s.done,[today]:{...(s.done[today]||{}),[id]:true}},stats:{...s.stats,[q.type]:Math.min((s.stats[q.type]||1)+1,100)},daily:s.daily.map(d=>d.id===id?{...d,streak:d.streak+1,best:Math.max(d.best||0,d.streak+1)}:d),shadowMission:null,shadowProgress:0,abyssDepth:Math.max(0,(s.abyssDepth||0)-1),abyssActive:Math.max(0,(s.abyssDepth||0)-1)>=5}; } }
      let bossHPLeft=s.bossHPLeft, boss=s.boss;
      if (boss) { bossHPLeft=Math.max(0,bossHPLeft-1); if(bossHPLeft===0){ showToast(`Boss defeated! +${boss.xp} XP`,"success",5000); return {...s,actives,xp:newXP+boss.xp,gems:s.gems+gemE+boss.gems,done:{...s.done,[today]:{...(s.done[today]||{}),[id]:true}},stats:{...s.stats,[q.type]:Math.min((s.stats[q.type]||1)+1,100)},daily:s.daily.map(d=>d.id===id?{...d,streak:d.streak+1,best:Math.max(d.best||0,d.streak+1)}:d),shadowMission:sm,shadowProgress:sp,boss:null,bossHPLeft:0,abyssDepth:Math.max(0,(s.abyssDepth||0)-2),abyssActive:Math.max(0,(s.abyssDepth||0)-2)>=5}; } }
      return {...s,actives,xp:newXP,gems:s.gems+gemE,done:{...s.done,[today]:{...(s.done[today]||{}),[id]:true}},stats:{...s.stats,[q.type]:Math.min((s.stats[q.type]||1)+1,100)},daily:s.daily.map(d=>d.id===id?{...d,streak:d.streak+1,best:Math.max(d.best||0,d.streak+1)}:d),shadowMission:sm,shadowProgress:sp,bossHPLeft,abyssDepth:Math.max(0,(s.abyssDepth||0)-1),abyssActive:Math.max(0,(s.abyssDepth||0)-1)>=5};
    });
  }

  function completeQuest(id) {
    const q = game.quests.find(q=>q.id===id);
    if (!q||q.done) return;
    showToast(`Quest complete — ${q.name}\n+${q.xp} XP  +${q.gems} gems`,"success");
    update(s=>({...s,xp:s.xp+q.xp,gems:s.gems+q.gems,stats:{...s.stats,[q.type]:Math.min((s.stats[q.type]||1)+3,100)},quests:s.quests.map(x=>x.id===id?{...x,done:true}:x)}));
  }

  function buyItem(item) {
    if (game.gems<item.cost){ showToast("Insufficient gems.","danger"); return; }
    if (item.type==="cosm") {
      if (game.cosmetics?.includes(item.id)){ showToast("Already owned.","info"); return; }
      let extra={};
      if (item.theme) extra.theme=item.theme;
      if (item.id==="aura") extra.aura=true;
      if (item.titleVal) extra.titles=[...(game.titles||[]),item.id];
      update(s=>({...s,gems:s.gems-item.cost,cosmetics:[...(s.cosmetics||[]),item.id],...extra}));
      showToast(`${item.name} unlocked.`,"gold"); return;
    }
    if (item.type==="perm") {
      if (game.perms?.find(p=>p.id===item.id)){ showToast("Already inscribed.","info"); return; }
      update(s=>({...s,gems:s.gems-item.cost,perms:[...(s.perms||[]),item]}));
      showToast(`${item.name} — permanently inscribed.`,"gold"); return;
    }
    update(s=>({...s,gems:s.gems-item.cost,actives:[...(s.actives||[]).filter(p=>p.id!==item.id),{...item,left:item.uses+((s.actives||[]).find(p=>p.id===item.id)?.left||0)}]}));
    showToast(`${item.name} activated.`,"gold");
  }

  async function signOut() {
    await supabase.auth.signOut();
    setGame(DEFAULT_GAME);
    setUser(null);
    setScreen("status");
  }

  // ── Loading / auth guard ──
  if (authLoading) return (
    <div style={{ background:T.bg0,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center" }}>
      <GlobalCSS accent="#c9a84c"/>
      <div style={{ fontFamily:FONTS.display,fontSize:32,color:"#c9a84c",animation:"pulse 1.5s ease-in-out infinite" }}>◈</div>
    </div>
  );
  if (!user) return <AuthScreen onAuth={u=>setUser(u)}/>;
  if (!game.setup) return <SetupScreen th={THEMES.default} onComplete={char=>update(s=>({...s,char,setup:true}))}/>;

  const th = THEMES[game.theme]||THEMES.default;
  const todayDone = game.done?.[today]||{};
  const doneCount = game.daily?.filter(q=>todayDone[q.id]).length||0;
  const allDone   = doneCount===game.daily?.length && game.daily?.length>0;
  const level     = getLevel(game.xp);
  const cls       = getClass(level);

  return (
    <div style={{ fontFamily:FONTS.ui,background:T.bg0,minHeight:"100vh",color:T.text,maxWidth:480,margin:"0 auto",position:"relative" }}>
      <GlobalCSS accent={th.accent}/>
      <Toast toast={toast}/>

      {/* Level-up overlay */}
      {lvlAnim && (
        <div style={{ position:"fixed",inset:0,zIndex:1000,background:"rgba(6,6,15,0.94)",backdropFilter:"blur(16px)",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",animation:"fadeIn 0.4s ease" }}>
          <div style={{ textAlign:"center",animation:"lvlPop 3.5s ease forwards" }}>
            <div style={{ fontFamily:FONTS.ui,fontSize:10,letterSpacing:6,color:T.dim,marginBottom:16 }}>LEVEL ATTAINED</div>
            <div style={{ fontFamily:FONTS.display,fontSize:96,color:th.accent,lineHeight:1,textShadow:`0 0 60px ${th.glow}` }}>{lvlAnim}</div>
            <div style={{ fontFamily:FONTS.display,fontSize:28,color:T.text,marginTop:8 }}>{getClass(lvlAnim).name}</div>
          </div>
        </div>
      )}

      {/* Abyss banner */}
      {game.abyssActive && (
        <div style={{ background:T.abyss,borderBottom:"1px solid #6a000050",padding:"7px 16px" }}>
          <span style={{ fontFamily:FONTS.ui,fontSize:9,letterSpacing:3,color:"#dd5050" }}>◆ THE ABYSS — Depth {game.abyssDepth}/20 — Complete tasks to resurface</span>
        </div>
      )}

      {/* Header */}
      <div style={{ padding:"14px 16px 0" }}>
        <div style={{ display:"flex",alignItems:"center",gap:12,marginBottom:10 }}>
          <div onClick={()=>setScreen("status")} style={{ width:48,height:48,borderRadius:"50%",background:T.bg1,border:`1px solid ${th.accent}40`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,cursor:"pointer",flexShrink:0,animation:game.aura?"auraAnim 2.5s linear infinite":"none" }}>
            {cls.icon}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginBottom:1,flexWrap:"wrap" }}>
              <span style={{ fontFamily:FONTS.display,fontSize:18,color:T.textBright }}>{game.char.name}</span>
              {game.title && <span style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:th.accent,border:`1px solid ${th.accent}30`,padding:"1px 7px",borderRadius:3 }}>{game.title}</span>}
              {saving && <span style={{ fontFamily:FONTS.ui,fontSize:7,letterSpacing:1,color:T.dim }}>saving…</span>}
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
          </div>
        </div>

        {/* Active perks strip */}
        {game.actives?.length>0 && (
          <div style={{ display:"flex",gap:5,flexWrap:"wrap",marginBottom:8 }}>
            {game.actives.map(p=><span key={p.id} style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:1,padding:"2px 8px",border:`1px solid ${th.accent}40`,borderRadius:20,color:th.accent }}>{p.icon} {p.name} ×{p.left}</span>)}
          </div>
        )}

        {/* Shadow mission */}
        {game.shadowMission && (
          <div style={{ padding:"10px 14px",background:"#080018",border:`1px solid ${T.purple}40`,borderRadius:8,marginBottom:10 }}>
            <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:3,color:T.purple,marginBottom:4 }}>◈ SHADOW DIRECTIVE{game.shadowMission.aiGenerated?" · AI GENERATED":""}</div>
            <div style={{ fontFamily:FONTS.display,fontSize:14,color:T.text,marginBottom:3 }}>{game.shadowMission.name}</div>
            <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.silver,lineHeight:1.5 }}>{game.shadowMission.desc}</div>
            <div style={{ display:"flex",alignItems:"center",gap:8,marginTop:8 }}>
              <div style={{ flex:1,height:2,background:T.bg3,borderRadius:1 }}>
                <div style={{ height:"100%",width:`${Math.min((game.shadowProgress/Math.max(game.shadowMission.req.count,1))*100,100)}%`,background:T.purple,borderRadius:1,transition:"width 0.4s ease" }}/>
              </div>
              <span style={{ fontFamily:FONTS.ui,fontSize:9,color:T.purple }}>{game.shadowProgress}/{game.shadowMission.req.count}</span>
              <span style={{ fontFamily:FONTS.ui,fontSize:8,color:T.dim }}>+{game.shadowMission.xp}xp</span>
            </div>
          </div>
        )}

        {/* Boss bar */}
        {game.boss && (
          <div style={{ padding:"10px 14px",background:"#120006",border:`1px solid ${T.danger}40`,borderRadius:8,marginBottom:10 }}>
            <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:3,color:T.danger,marginBottom:3 }}>⚔ WEEKLY BOSS</div>
            <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
              <span style={{ fontFamily:FONTS.display,fontSize:15,color:T.text }}>{game.boss.name}</span>
              <span style={{ fontFamily:FONTS.ui,fontSize:10,color:T.danger }}>{game.bossHPLeft}/{game.boss.hp}</span>
            </div>
            <div style={{ height:4,background:T.bg3,borderRadius:2 }}>
              <div style={{ height:"100%",width:`${(game.bossHPLeft/game.boss.hp)*100}%`,background:`linear-gradient(90deg,${T.danger},#dd6060)`,borderRadius:2,transition:"width 0.5s ease" }}/>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav style={{ display:"flex",borderBottom:`1px solid ${T.bg3}` }}>
          {[{id:"status",l:"STATUS"},{id:"daily",l:"DAILY"},{id:"quests",l:"QUESTS"},{id:"shop",l:"SHOP"},{id:"system",l:"⚙ SYSTEM"}].map(t=>(
            <button key={t.id} onClick={()=>setScreen(t.id)} style={{ flex:1,padding:"9px 0",fontFamily:FONTS.ui,fontSize:8,letterSpacing:t.id==="system"?1:2,background:"none",border:"none",cursor:"pointer",color:screen===t.id?th.accent:T.dim,borderBottom:screen===t.id?`1px solid ${th.accent}`:"1px solid transparent",transition:"color 0.2s",whiteSpace:"nowrap" }}>
              {t.l}
            </button>
          ))}
        </nav>
      </div>

      {/* Screen content */}
      <div style={{ padding:"16px 16px 60px" }}>
        {screen==="status" && <StatusScreen game={game} update={update} th={th} level={level} cls={cls} editChar={editChar} setEditChar={setEditChar} charForm={charForm} setCharForm={setCharForm} showToast={showToast} briefingLoading={briefingLoading} generateBriefing={generateBriefing} onSignOut={signOut}/>}
        {screen==="daily"  && <DailyScreen  game={game} update={update} th={th} today={today} todayDone={todayDone} doneCount={doneCount} allDone={allDone} completeDaily={completeDaily} addingDaily={addingDaily} setAddingDaily={setAddingDaily} dailyForm={dailyForm} setDailyForm={setDailyForm} showToast={showToast}/>}
        {screen==="quests" && <QuestsScreen game={game} update={update} th={th} completeQuest={completeQuest} addingQuest={addingQuest} setAddingQuest={setAddingQuest} questForm={questForm} setQuestForm={setQuestForm} showToast={showToast}/>}
        {screen==="shop"   && <ShopScreen   game={game} th={th} shopTab={shopTab} setShopTab={setShopTab} buyItem={buyItem}/>}
        {screen==="system" && <SystemScreen game={game} update={update} th={th} showToast={showToast} aiStatus={aiStatus} setAiStatus={setAiStatus} generateBriefing={generateBriefing} briefingLoading={briefingLoading} anonKey={SUPABASE_ANON}/>}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// STATUS SCREEN
// ─────────────────────────────────────────────────────────────
function StatusScreen({ game, update, th, level, cls, editChar, setEditChar, charForm, setCharForm, showToast, briefingLoading, generateBriefing, onSignOut }) {
  const inp = { width:"100%",background:T.bg2,border:`1px solid ${T.bg3}`,borderRadius:6,color:T.text,padding:"9px 12px",fontFamily:FONTS.ui,fontSize:12,outline:"none",marginBottom:8,boxSizing:"border-box" };
  const ownedTitles = (game.titles||[]).map(id=>SHOP_ITEMS.find(i=>i.id===id)).filter(Boolean);
  return (
    <div>
      {/* AI Briefing */}
      {(game.briefing||briefingLoading) && (
        <Card style={{ marginBottom:14,border:`1px solid ${T.sg}30` }}>
          <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:4,color:T.sg,marginBottom:10 }}>◈ SYSTEM BRIEFING — {game.briefingDate||"TODAY"}</div>
          {briefingLoading
            ? <div style={{ fontFamily:FONTS.ui,fontSize:11,color:T.dim,animation:"pulse 1.5s ease-in-out infinite" }}>The System is observing...</div>
            : <div style={{ fontFamily:FONTS.display,fontSize:15,color:T.text,lineHeight:1.8,whiteSpace:"pre-wrap" }}>{game.briefing}</div>
          }
        </Card>
      )}
      {!game.briefing && !briefingLoading && (
        <button onClick={generateBriefing} style={{ width:"100%",padding:"10px",marginBottom:14,background:"transparent",border:`1px dashed ${T.sg}40`,borderRadius:8,color:T.sg,fontFamily:FONTS.ui,fontSize:9,letterSpacing:3,cursor:"pointer" }}>
          ◈ REQUEST SYSTEM BRIEFING
        </button>
      )}

      {/* Char card */}
      <Card style={{ marginBottom:14 }} accent={th.accent}>
        <div style={{ display:"flex",gap:14,alignItems:"flex-start" }}>
          <div style={{ textAlign:"center" }}>
            <div style={{ width:70,height:70,borderRadius:10,background:T.bg2,border:`1px solid ${th.accent}30`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:34,marginBottom:6,animation:game.aura?"auraAnim 2.5s linear infinite":"none" }}>{cls.icon}</div>
            <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:T.dim }}>LVL {level}</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:FONTS.display,fontSize:22,color:T.textBright }}>{game.char.name}</div>
            {game.title && <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:th.accent,marginTop:2 }}>"{game.title}"</div>}
            <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:T.silver,marginTop:4 }}>{cls.icon} {cls.name.toUpperCase()}</div>
            {game.char.occupation && <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim,marginTop:2 }}>{game.char.occupation}</div>}
            {game.char.bio && <div style={{ fontFamily:FONTS.display,fontSize:13,color:T.silver,marginTop:6,lineHeight:1.7,fontStyle:"italic" }}>"{game.char.bio}"</div>}
          </div>
          <button onClick={()=>{ setCharForm(game.char); setEditChar(!editChar); }} style={{ background:"none",border:`1px solid ${T.bg3}`,borderRadius:5,color:T.dim,padding:"4px 8px",cursor:"pointer",fontFamily:FONTS.ui,fontSize:10 }}>✎</button>
        </div>
        {editChar && (
          <div style={{ marginTop:14,borderTop:`1px solid ${T.bg3}`,paddingTop:14 }}>
            {["name","age","occupation"].map(k=><input key={k} value={charForm[k]||""} onChange={e=>setCharForm(x=>({...x,[k]:e.target.value}))} placeholder={k} style={inp}/>)}
            <textarea value={charForm.bio||""} onChange={e=>setCharForm(x=>({...x,bio:e.target.value}))} placeholder="bio" style={{ ...inp,height:64,resize:"none",marginBottom:10 }}/>
            {ownedTitles.length>0 && (
              <div style={{ marginBottom:10 }}>
                <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:T.dim,marginBottom:6 }}>TITLE</div>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                  <button onClick={()=>update(s=>({...s,title:null}))} style={{ fontFamily:FONTS.ui,fontSize:8,padding:"4px 10px",background:!game.title?T.bg3:"transparent",border:`1px solid ${T.bg3}`,borderRadius:4,color:T.silver,cursor:"pointer" }}>None</button>
                  {ownedTitles.map(t=><button key={t.id} onClick={()=>update(s=>({...s,title:t.titleVal}))} style={{ fontFamily:FONTS.ui,fontSize:8,padding:"4px 10px",background:game.title===t.titleVal?T.bg3:"transparent",border:`1px solid ${th.accent}40`,borderRadius:4,color:th.accent,cursor:"pointer" }}>{t.titleVal}</button>)}
                </div>
              </div>
            )}
            <Btn onClick={()=>{ update(s=>({...s,char:charForm})); setEditChar(false); showToast("Character updated.","gold"); }} full>SAVE</Btn>
          </div>
        )}
      </Card>

      {/* XP */}
      <Card style={{ marginBottom:14 }}>
        <SecTitle col={th.accent}>Experience</SecTitle>
        <div style={{ display:"flex",justifyContent:"space-between",fontFamily:FONTS.ui,fontSize:9,color:T.dim,marginBottom:6 }}>
          <span>LVL {level} → {level+1}</span><span>{game.xp%XP_PER_LEVEL} / {XP_PER_LEVEL}</span>
        </div>
        <div style={{ height:3,background:T.bg3,borderRadius:2,marginBottom:8 }}>
          <div style={{ height:"100%",width:`${getXPPct(game.xp)*100}%`,background:`linear-gradient(90deg,${th.accent}50,${th.accent})`,borderRadius:2,transition:"width 0.6s ease" }}/>
        </div>
        <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:T.dim }}>{game.xp} XP TOTAL · {game.gems} GEMS</div>
      </Card>

      {/* Radar */}
      <Card style={{ marginBottom:14 }}>
        <SecTitle col={th.accent}>Stats Overview</SecTitle>
        <div style={{ display:"flex",justifyContent:"center",marginBottom:14 }}><RadarChart stats={game.stats} accent={th.accent} size={210}/></div>
        {STATS.map(s=>(
          <div key={s} style={{ display:"flex",alignItems:"center",gap:10,marginBottom:7 }}>
            <div style={{ fontFamily:FONTS.ui,fontSize:9,color:STAT_COL[s],width:18,textAlign:"center" }}>{STAT_ICO[s]}</div>
            <div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.silver,width:64,letterSpacing:1 }}>{s.toUpperCase()}</div>
            <div style={{ flex:1,height:3,background:T.bg3,borderRadius:2 }}>
              <div style={{ height:"100%",width:`${Math.min(game.stats[s]||1,100)}%`,background:STAT_COL[s],borderRadius:2,transition:"width 0.6s ease",boxShadow:`0 0 5px ${STAT_COL[s]}50` }}/>
            </div>
            <div style={{ fontFamily:FONTS.ui,fontSize:10,color:STAT_COL[s],width:22,textAlign:"right" }}>{game.stats[s]||1}</div>
          </div>
        ))}
      </Card>

      {game.abyssDepth>0 && (
        <Card style={{ marginBottom:14,border:"1px solid #6a000050" }}>
          <SecTitle col="#b03030">The Abyss</SecTitle>
          <div style={{ height:5,background:T.bg3,borderRadius:3 }}>
            <div style={{ height:"100%",width:`${(game.abyssDepth/20)*100}%`,background:"linear-gradient(90deg,#3a0000,#b03030)",borderRadius:3 }}/>
          </div>
          <div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.dim,marginTop:5 }}>Depth {game.abyssDepth}/20</div>
        </Card>
      )}

      {/* Sign out */}
      <div style={{ marginTop:8,paddingTop:14,borderTop:`1px solid ${T.bg3}` }}>
        <Btn onClick={onSignOut} danger full>SIGN OUT</Btn>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// DAILY SCREEN
// ─────────────────────────────────────────────────────────────
function DailyScreen({ game, update, th, today, todayDone, doneCount, allDone, completeDaily, addingDaily, setAddingDaily, dailyForm, setDailyForm, showToast }) {
  function setMood(m) {
    if (game.lastMoodDate===today){ showToast("Mood already set.","info"); return; }
    update(s=>({...s,mood:m,lastMoodDate:today}));
    showToast(m==="high"?"Charged. +25% XP active.":m==="low"?"Low energy noted. −15% XP.":"Balance maintained.","gold");
  }
  function addDaily() {
    if (!dailyForm.name.trim()) return;
    update(s=>({...s,daily:[...s.daily,{id:Date.now(),name:dailyForm.name.trim(),type:dailyForm.type,diff:dailyForm.diff,streak:0,best:0}]}));
    setDailyForm({name:"",type:"Physical",diff:"D-Rank"}); setAddingDaily(false);
    showToast("Habit inscribed.","gold");
  }
  const sel = { flex:1,background:T.bg2,border:`1px solid ${T.bg3}`,borderRadius:5,color:T.text,padding:"8px",fontFamily:FONTS.ui,fontSize:10,outline:"none" };
  return (
    <div>
      {game.lastMoodDate!==today && (
        <Card style={{ marginBottom:12 }}>
          <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:3,color:T.dim,marginBottom:10 }}>MORNING CALIBRATION</div>
          <div style={{ display:"flex",gap:8 }}>
            {[{k:"low",l:"◌ Low",s:"−15% XP"},{k:"normal",l:"◈ Steady",s:"normal"},{k:"high",l:"★ Charged",s:"+25% XP"}].map(m=>(
              <button key={m.k} onClick={()=>setMood(m.k)} style={{ flex:1,padding:"10px 6px",background:"transparent",border:`1px solid ${T.bg3}`,borderRadius:6,color:T.silver,fontFamily:FONTS.ui,fontSize:9,cursor:"pointer",transition:"all 0.2s",display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=th.accent;e.currentTarget.style.color=th.accent;}} onMouseLeave={e=>{e.currentTarget.style.borderColor=T.bg3;e.currentTarget.style.color=T.silver;}}>
                <span>{m.l}</span><span style={{ fontSize:8,color:T.dim }}>{m.s}</span>
              </button>
            ))}
          </div>
        </Card>
      )}
      <Card style={{ marginBottom:12,border:`1px solid ${allDone?"#27a06040":T.bg3}`,background:allDone?"#001a0a":undefined }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:FONTS.display,fontSize:16,color:allDone?"#40d090":T.text }}>{allDone?"All tasks complete.": `${doneCount} / ${game.daily?.length||0} complete`}</div>
            <div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.dim,marginTop:2 }}>{game.mood==="high"?" ⚡ +25% XP":game.mood==="low"?" −15% XP":""}</div>
          </div>
          {(game.daily?.length||0)>0 && <div style={{ fontFamily:FONTS.display,fontSize:26,color:th.accent }}>{Math.round((doneCount/(game.daily?.length||1))*100)}%</div>}
        </div>
        {(game.daily?.length||0)>0 && (
          <div style={{ marginTop:10,height:2,background:T.bg3,borderRadius:1 }}>
            <div style={{ height:"100%",width:`${(doneCount/(game.daily?.length||1))*100}%`,background:allDone?"#27a060":th.accent,borderRadius:1,transition:"width 0.4s ease" }}/>
          </div>
        )}
      </Card>
      {game.daily?.map(q=>{
        const done=!!todayDone[q.id], cfg=DIFF[q.diff];
        return (
          <div key={q.id} onClick={()=>completeDaily(q.id)} style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 16px",marginBottom:8,background:done?"#001a0a":T.bg1,border:`1px solid ${done?"#27a06030":T.bg3}`,borderRadius:8,cursor:"pointer",transition:"all 0.2s",userSelect:"none" }}>
            <div style={{ width:18,height:18,borderRadius:3,border:`1px solid ${done?"#27a060":"#2a3050"}`,background:done?"#27a06015":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              {done && <span style={{ color:"#27a060",fontSize:11 }}>✓</span>}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap" }}>
                <span style={{ fontFamily:FONTS.display,fontSize:15,color:done?"#40d090":T.text,textDecoration:done?"line-through":"none",textDecorationColor:"#27a06060" }}>{q.name}</span>
                <DiffTag diff={q.diff}/>
              </div>
              <div style={{ fontFamily:FONTS.ui,fontSize:8,color:T.dim }}>
                <span style={{ color:STAT_COL[q.type] }}>{q.type.toUpperCase()}</span>{" · +"}{ cfg.xp} xp · +{cfg.gems} ◈
              </div>
            </div>
            <div style={{ textAlign:"right",flexShrink:0 }}>
              <div style={{ fontFamily:FONTS.display,fontSize:13,color:q.streak>=14?T.gold:q.streak>=7?"#b03030":T.dim }}>{q.streak>0?`${q.streak}d`:"—"}</div>
              {q.best>0 && <div style={{ fontFamily:FONTS.ui,fontSize:7,color:T.dim }}>best {q.best}</div>}
            </div>
            <button onClick={e=>{e.stopPropagation();update(s=>({...s,daily:s.daily.filter(d=>d.id!==q.id)}));}} style={{ background:"none",border:"none",color:T.dim,cursor:"pointer",fontSize:11,padding:4,flexShrink:0 }}
              onMouseEnter={e=>e.target.style.color=T.danger} onMouseLeave={e=>e.target.style.color=T.dim}>✕</button>
          </div>
        );
      })}
      {addingDaily ? (
        <Card style={{ marginTop:8 }}>
          <input autoFocus value={dailyForm.name} onChange={e=>setDailyForm(x=>({...x,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addDaily()} placeholder="Habit name..." style={{ width:"100%",background:T.bg2,border:`1px solid ${T.bg3}`,borderRadius:5,color:T.text,padding:"9px 12px",fontFamily:FONTS.ui,fontSize:12,outline:"none",boxSizing:"border-box",marginBottom:10 }}/>
          <div style={{ display:"flex",gap:8,marginBottom:10 }}>
            <select value={dailyForm.type} onChange={e=>setDailyForm(x=>({...x,type:e.target.value}))} style={sel}>
              {STATS.map(s=><option key={s}>{s}</option>)}<option value="General">General</option>
            </select>
            <select value={dailyForm.diff} onChange={e=>setDailyForm(x=>({...x,diff:e.target.value}))} style={sel}>
              {Object.keys(DIFF).map(d=><option key={d}>{d}</option>)}
            </select>
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <Btn full onClick={addDaily}>INSCRIBE</Btn>
            <Btn danger onClick={()=>setAddingDaily(false)}>✕</Btn>
          </div>
        </Card>
      ) : (
        <button onClick={()=>setAddingDaily(true)} style={{ width:"100%",marginTop:8,padding:"12px",background:"transparent",border:`1px dashed ${T.bg3}`,borderRadius:8,color:T.dim,fontFamily:FONTS.ui,fontSize:9,letterSpacing:3,cursor:"pointer",transition:"all 0.2s" }}
          onMouseEnter={e=>{e.target.style.borderColor=th.accent;e.target.style.color=th.accent;}} onMouseLeave={e=>{e.target.style.borderColor=T.bg3;e.target.style.color=T.dim;}}>
          + ADD DAILY HABIT
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// QUESTS SCREEN
// ─────────────────────────────────────────────────────────────
function QuestsScreen({ game, update, th, completeQuest, addingQuest, setAddingQuest, questForm, setQuestForm, showToast }) {
  const [filter, setFilter] = useState("active");
  const shown = game.quests?.filter(q=>filter==="active"?!q.done:q.done)||[];
  const sel = { flex:1,background:T.bg2,border:`1px solid ${T.bg3}`,borderRadius:5,color:T.text,padding:"8px",fontFamily:FONTS.ui,fontSize:10,outline:"none" };
  function addQuest() {
    if (!questForm.name.trim()) return;
    const cfg=DIFF[questForm.diff];
    update(s=>({...s,quests:[...(s.quests||[]),{id:Date.now(),name:questForm.name.trim(),type:questForm.type,diff:questForm.diff,done:false,xp:cfg.xp*3,gems:cfg.gems*3}]}));
    setQuestForm({name:"",type:"Physical",diff:"C-Rank"}); setAddingQuest(false);
    showToast("Quest logged.","gold");
  }
  return (
    <div>
      <div style={{ display:"flex",gap:8,marginBottom:12 }}>
        {["active","completed"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ flex:1,padding:"8px",background:"transparent",border:`1px solid ${filter===f?th.accent:T.bg3}`,borderRadius:5,color:filter===f?th.accent:T.dim,fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,cursor:"pointer",transition:"all 0.2s" }}>
            {f.toUpperCase()} ({(game.quests?.filter(q=>f==="active"?!q.done:q.done)||[]).length})
          </button>
        ))}
      </div>
      {shown.length===0 && <div style={{ textAlign:"center",padding:"48px 0",fontFamily:FONTS.display,fontSize:16,color:T.dim,lineHeight:2 }}>{filter==="active"?"No active quests.\nDefine your next challenge.":"No completed quests yet."}</div>}
      {shown.map(q=>{
        const cfg=DIFF[q.diff];
        return (
          <Card key={q.id} style={{ marginBottom:10,border:`1px solid ${q.done?"#27a06030":cfg.col+"30"}` }}>
            <div style={{ display:"flex",gap:10,alignItems:"flex-start" }}>
              <div style={{ fontSize:14,color:STAT_COL[q.type]||T.dim,marginTop:3,flexShrink:0 }}>{q.done?"✓":STAT_ICO[q.type]}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex",gap:7,flexWrap:"wrap",alignItems:"center",marginBottom:5 }}>
                  <span style={{ fontFamily:FONTS.display,fontSize:16,color:q.done?"#40d090":T.text,textDecoration:q.done?"line-through":"none" }}>{q.name}</span>
                  <DiffTag diff={q.diff}/>
                </div>
                <div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.dim }}>
                  <span style={{ color:STAT_COL[q.type] }}>{q.type}</span> · +{q.xp} xp · +{q.gems} ◈ · +3 {q.type}
                </div>
              </div>
              <button onClick={()=>update(s=>({...s,quests:s.quests.filter(x=>x.id!==q.id)}))} style={{ background:"none",border:"none",color:T.dim,cursor:"pointer",fontSize:11 }}
                onMouseEnter={e=>e.target.style.color=T.danger} onMouseLeave={e=>e.target.style.color=T.dim}>✕</button>
            </div>
            {!q.done && <button onClick={()=>completeQuest(q.id)} style={{ marginTop:10,width:"100%",padding:"9px",background:`${cfg.col}10`,border:`1px solid ${cfg.col}40`,borderRadius:5,color:cfg.col,fontFamily:FONTS.ui,fontSize:9,letterSpacing:2,cursor:"pointer",transition:"background 0.2s" }}
              onMouseEnter={e=>e.currentTarget.style.background=`${cfg.col}20`} onMouseLeave={e=>e.currentTarget.style.background=`${cfg.col}10`}>MARK COMPLETE</button>}
          </Card>
        );
      })}
      {addingQuest ? (
        <Card style={{ marginTop:8 }}>
          <input autoFocus value={questForm.name} onChange={e=>setQuestForm(x=>({...x,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addQuest()} placeholder="Quest name..." style={{ width:"100%",background:T.bg2,border:`1px solid ${T.bg3}`,borderRadius:5,color:T.text,padding:"9px 12px",fontFamily:FONTS.ui,fontSize:12,outline:"none",boxSizing:"border-box",marginBottom:10 }}/>
          <div style={{ display:"flex",gap:8,marginBottom:10 }}>
            <select value={questForm.type} onChange={e=>setQuestForm(x=>({...x,type:e.target.value}))} style={sel}>{STATS.map(s=><option key={s}>{s}</option>)}</select>
            <select value={questForm.diff} onChange={e=>setQuestForm(x=>({...x,diff:e.target.value}))} style={sel}>{Object.keys(DIFF).map(d=><option key={d}>{d}</option>)}</select>
          </div>
          <div style={{ display:"flex",gap:8 }}>
            <Btn full onClick={addQuest}>LOG QUEST</Btn>
            <Btn danger onClick={()=>setAddingQuest(false)}>✕</Btn>
          </div>
        </Card>
      ) : (
        <button onClick={()=>setAddingQuest(true)} style={{ width:"100%",marginTop:8,padding:"12px",background:"transparent",border:`1px dashed ${T.bg3}`,borderRadius:8,color:T.dim,fontFamily:FONTS.ui,fontSize:9,letterSpacing:3,cursor:"pointer",transition:"all 0.2s" }}
          onMouseEnter={e=>{e.target.style.borderColor=th.accent;e.target.style.color=th.accent;}} onMouseLeave={e=>{e.target.style.borderColor=T.bg3;e.target.style.color=T.dim;}}>
          + LOG NEW QUEST
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SHOP SCREEN
// ─────────────────────────────────────────────────────────────
function ShopScreen({ game, th, shopTab, setShopTab, buyItem }) {
  const items = SHOP_ITEMS.filter(i=>i.type===shopTab);
  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
        <div style={{ fontFamily:FONTS.display,fontSize:13,color:T.silver }}>Exchange Gems for Power</div>
        <div style={{ fontFamily:FONTS.ui,fontSize:13,color:th.accent }}>◈ {game.gems}</div>
      </div>
      <div style={{ display:"flex",gap:6,marginBottom:12 }}>
        {[{id:"temp",l:"TEMP"},{id:"perm",l:"PERM"},{id:"cosm",l:"COSMETIC"}].map(t=>(
          <button key={t.id} onClick={()=>setShopTab(t.id)} style={{ flex:1,padding:"8px 4px",background:shopTab===t.id?`${th.accent}15`:"transparent",border:`1px solid ${shopTab===t.id?th.accent:T.bg3}`,borderRadius:5,color:shopTab===t.id?th.accent:T.dim,fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,cursor:"pointer",transition:"all 0.2s" }}>
            {t.l}
          </button>
        ))}
      </div>
      {items.map(item=>{
        const owned=game.perms?.find(p=>p.id===item.id)||(item.type==="cosm"&&game.cosmetics?.includes(item.id));
        const active=game.actives?.find(p=>p.id===item.id);
        const can=game.gems>=item.cost;
        return (
          <Card key={item.id} style={{ marginBottom:10,border:`1px solid ${owned?"#27a06030":can?T.bg3:T.bg2}`,opacity:!owned&&!can?0.5:1 }}>
            <div style={{ display:"flex",gap:12,alignItems:"flex-start" }}>
              <div style={{ fontSize:20,color:th.accent,flexShrink:0,marginTop:2 }}>{item.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap" }}>
                  <span style={{ fontFamily:FONTS.display,fontSize:15,color:owned?"#40d090":T.text }}>{item.name}</span>
                  {owned && <span style={{ fontFamily:FONTS.ui,fontSize:7,letterSpacing:2,color:"#27a060",border:"1px solid #27a06040",padding:"1px 5px",borderRadius:3 }}>OWNED</span>}
                  {active&&!owned && <span style={{ fontFamily:FONTS.ui,fontSize:7,color:th.accent,border:`1px solid ${th.accent}40`,padding:"1px 5px",borderRadius:3 }}>×{active.left}</span>}
                </div>
                <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim,lineHeight:1.6 }}>{item.desc}</div>
                {item.effect && <div style={{ fontFamily:FONTS.ui,fontSize:9,color:th.accent,marginTop:3 }}>{item.effect}</div>}
              </div>
            </div>
            {!owned && <button onClick={()=>buyItem(item)} style={{ marginTop:10,width:"100%",padding:"9px",background:can?`${th.accent}10`:"transparent",border:`1px solid ${can?th.accent+"40":T.bg3}`,borderRadius:5,color:can?th.accent:T.dim,fontFamily:FONTS.ui,fontSize:9,letterSpacing:2,cursor:can?"pointer":"not-allowed",transition:"background 0.2s" }}
              onMouseEnter={e=>{if(can)e.currentTarget.style.background=`${th.accent}20`;}} onMouseLeave={e=>{if(can)e.currentTarget.style.background=`${th.accent}10`;}}>
              {can?`◈ ${item.cost} — ACQUIRE`:`◈ ${item.cost} — INSUFFICIENT`}
            </button>}
          </Card>
        );
      })}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// SYSTEM TERMINAL SCREEN
// ─────────────────────────────────────────────────────────────
function SystemScreen({ game, update, th, showToast, aiStatus, setAiStatus, generateBriefing, briefingLoading, anonKey }) {
  const [messages, setMessages] = useState([
    { role:"system", text:`System Terminal online.\nIdentified: ${game.char?.name||"Unknown"} — ${getClass(getLevel(game.xp)).name} — Level ${getLevel(game.xp)}\n\nAddress The System.` }
  ]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [chatHistory, setChatHistory] = useState([]);
  const bottomRef = useRef(null);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior:"smooth" }); }, [messages]);

  async function send() {
    if (!input.trim()||loading) return;
    const userMsg = input.trim(); setInput("");
    setMessages(m=>[...m,{ role:"user",text:userMsg }]);
    setLoading(true); setAiStatus("working");
    try {
      const ctx = buildCharContext(game);
      const sys = buildSystemPrompt(ctx);
      const history = chatHistory.slice(-8);
      const reply = await callAIProxy(anonKey, sys, userMsg, history);
      const questMatches = [...reply.matchAll(/\[QUEST:\s*"([^"]+)"\s*\|\s*Rank:\s*([^|]+)\s*\|\s*Type:\s*([^|]+)\s*\|\s*Reason:\s*([^\]]+)\]/gi)];
      setMessages(m=>[...m,{ role:"system",text:reply,parsedQuests:questMatches.map(m=>({ name:m[1].trim(),diff:m[2].trim(),type:m[3].trim(),reason:m[4].trim() })) }]);
      setChatHistory(h=>[...h,{ role:"user",text:userMsg },{ role:"model",text:reply }]);
      setAiStatus("ok");
    } catch(e) {
      setMessages(m=>[...m,{ role:"system",text:`Connection interrupted.\n${e.message}`,error:true }]);
      setAiStatus("error");
    }
    setLoading(false);
  }

  function addSuggestedQuest(q) {
    const diff = Object.keys(DIFF).find(d=>d.toLowerCase()===q.diff.toLowerCase().trim())||"C-Rank";
    const type = STATS.find(s=>s.toLowerCase()===q.type.toLowerCase().trim())||"Physical";
    const cfg  = DIFF[diff];
    update(s=>({...s,quests:[...(s.quests||[]),{ id:Date.now(),name:q.name,type,diff,done:false,xp:cfg.xp*3,gems:cfg.gems*3 }]}));
    showToast(`Quest added: ${q.name}`,"success");
  }

  const QUICK = [
    "What should I focus on this week?",
    "Suggest 2 quests based on my weaknesses",
    "How is my progress? What am I neglecting?",
    "Issue me a personalised shadow mission",
    "Are my daily habits ranked correctly?",
  ];

  return (
    <div>
      {/* Status card */}
      <Card style={{ marginBottom:14,border:`1px solid ${T.sg}30` }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
          <SecTitle col={T.sg} style={{ marginBottom:0 }}>AI CONNECTION</SecTitle>
          <AIStatus status={aiStatus}/>
        </div>
        <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim,lineHeight:1.7 }}>
          Powered by Gemini 2.5 Flash Lite via a secure server proxy. Your data never leaves the server unencrypted. AI requests are low-frequency — one briefing per day plus terminal queries.
        </div>
        <button onClick={generateBriefing} disabled={briefingLoading} style={{ marginTop:10,width:"100%",padding:"9px",background:"transparent",border:`1px solid ${T.sg}40`,borderRadius:5,color:briefingLoading?T.dim:T.sg,fontFamily:FONTS.ui,fontSize:9,letterSpacing:3,cursor:briefingLoading?"not-allowed":"pointer" }}>
          {briefingLoading?"GENERATING...":"◈ REGENERATE DAILY BRIEFING"}
        </button>
      </Card>

      {/* Terminal */}
      <Card style={{ padding:0,overflow:"hidden" }}>
        <div style={{ padding:"10px 14px",borderBottom:`1px solid ${T.bg3}`,fontFamily:FONTS.ui,fontSize:8,letterSpacing:4,color:T.sg,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <span>◈ SYSTEM TERMINAL</span>
          <AIStatus status={loading?"working":aiStatus}/>
        </div>

        <div style={{ height:340,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:12 }}>
          {messages.map((m,i)=>(
            <div key={i} style={{ display:"flex",flexDirection:"column",gap:6,alignItems:m.role==="user"?"flex-end":"flex-start" }}>
              <div style={{ maxWidth:"88%",padding:"10px 14px",borderRadius:8,background:m.role==="user"?`${th.accent}15`:m.error?"#1a0000":T.bg2,border:`1px solid ${m.role==="user"?th.accent+"40":m.error?T.danger+"40":T.bg3}`,fontFamily:m.role==="system"?FONTS.display:FONTS.ui,fontSize:m.role==="system"?13:12,color:T.text,lineHeight:1.7,whiteSpace:"pre-wrap" }}>
                {m.role==="system" && <span style={{ fontFamily:FONTS.ui,fontSize:7,letterSpacing:3,color:T.sg,display:"block",marginBottom:6 }}>THE SYSTEM</span>}
                {m.text}
              </div>
              {m.parsedQuests?.length>0 && (
                <div style={{ maxWidth:"88%",display:"flex",flexDirection:"column",gap:5 }}>
                  {m.parsedQuests.map((q,qi)=>(
                    <button key={qi} onClick={()=>addSuggestedQuest(q)} style={{ padding:"7px 12px",background:`${T.sg}10`,border:`1px solid ${T.sg}40`,borderRadius:5,color:T.sg,fontFamily:FONTS.ui,fontSize:9,cursor:"pointer",textAlign:"left",transition:"background 0.2s" }}
                      onMouseEnter={e=>e.currentTarget.style.background=`${T.sg}20`} onMouseLeave={e=>e.currentTarget.style.background=`${T.sg}10`}>
                      ＋ Add to quests: "{q.name}"
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading && <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.sg,animation:"pulse 1.2s ease-in-out infinite" }}>The System is processing...</div>}
          <div ref={bottomRef}/>
        </div>

        <div style={{ padding:"8px 14px",borderTop:`1px solid ${T.bg3}`,display:"flex",gap:5,flexWrap:"wrap" }}>
          {QUICK.map((q,i)=>(
            <button key={i} onClick={()=>setInput(q)} style={{ fontFamily:FONTS.ui,fontSize:8,padding:"4px 9px",background:"transparent",border:`1px solid ${T.bg3}`,borderRadius:4,color:T.dim,cursor:"pointer",transition:"all 0.2s" }}
              onMouseEnter={e=>{e.target.style.borderColor=th.accent;e.target.style.color=th.accent;}} onMouseLeave={e=>{e.target.style.borderColor=T.bg3;e.target.style.color=T.dim;}}>
              {q}
            </button>
          ))}
        </div>

        <div style={{ display:"flex",borderTop:`1px solid ${T.bg3}` }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Address The System..." style={{ flex:1,background:T.bg1,border:"none",color:T.text,padding:"12px 16px",fontFamily:FONTS.ui,fontSize:12,outline:"none" }}/>
          <button onClick={send} disabled={loading||!input.trim()} style={{ padding:"12px 18px",background:loading||!input.trim()?"transparent":`${th.accent}15`,border:"none",borderLeft:`1px solid ${T.bg3}`,color:loading||!input.trim()?T.dim:th.accent,fontFamily:FONTS.ui,fontSize:10,letterSpacing:1,cursor:loading||!input.trim()?"not-allowed":"pointer",transition:"all 0.2s" }}>
            {loading?"...":"SEND"}
          </button>
        </div>
      </Card>
    </div>
  );
}
