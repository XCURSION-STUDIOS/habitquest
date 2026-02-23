import { useState, useRef, useEffect } from "react";
import { T, FONTS } from "../constants/theme.js";
import { DIFF, STATS } from "../constants/gameData.js";
import { getLevel, getClass } from "../lib/gameLogic.js";
import { buildCharContext, buildSystemPrompt, callAIProxy, parseSuggestedQuests } from "../lib/ai.js";
import { Card, SecTitle, AIStatus } from "../components/ui/index.jsx";

const QUICK = [
  "What should I focus on this week?",
  "Suggest 2 quests based on my weaknesses",
  "Analyse my progress and what I'm neglecting",
  "Generate a personalised bonus mission for me",
  "Are my daily habits ranked correctly?",
];

export default function SystemScreen({ game, update, th, showToast, aiStatus, setAiStatus, generateBriefing, briefingLoading }) {
  const [messages,setChatMessages] = useState([
    { role:"system", text:`AI Coach connected.\nProfile: ${game.char?.name||"Unknown"} — ${getClass(getLevel(game.xp)).name} — Level ${getLevel(game.xp)}\n\nAsk me anything about your progress.` },
  ]);
  const [input,setInput]         = useState("");
  const [loading,setLoading]     = useState(false);
  const [history,setHistory]     = useState([]);
  const bottomRef = useRef(null);
  useEffect(()=>{ bottomRef.current?.scrollIntoView({behavior:"smooth"}); },[messages]);

  async function send() {
    if (!input.trim()||loading) return;
    const userMsg=input.trim(); setInput("");
    setChatMessages(m=>[...m,{role:"user",text:userMsg}]);
    setLoading(true); setAiStatus("working");
    try {
      const ctx=buildCharContext(game),sys=buildSystemPrompt(ctx);
      const reply=await callAIProxy(sys,userMsg,history.slice(-8));
      const parsedQuests=parseSuggestedQuests(reply);
      setChatMessages(m=>[...m,{role:"system",text:reply,parsedQuests}]);
      setHistory(h=>[...h,{role:"user",text:userMsg},{role:"model",text:reply}]);
      setAiStatus("ok");
    } catch(e) {
      setChatMessages(m=>[...m,{role:"system",text:`Connection failed.\n${e.message}`,error:true}]);
      setAiStatus("error");
    }
    setLoading(false);
  }

  function addSuggestedQuest(q) {
    const diff=Object.keys(DIFF).find(d=>d.toLowerCase()===q.diff.toLowerCase().trim())||"C-Rank";
    const type=STATS.find(s=>s.toLowerCase()===q.type.toLowerCase().trim())||"Physical";
    const cfg=DIFF[diff];
    update(s=>({...s,quests:[...(s.quests||[]),{id:Date.now(),name:q.name,type,diff,done:false,xp:cfg.xp*3,gems:cfg.gems*3}]}));
    showToast(`Quest added: ${q.name}`,"success");
  }

  return (
    <div>
      <Card style={{ marginBottom:14,border:`1px solid ${T.sg}30` }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:8 }}>
          <SecTitle col={T.sg}>AI Coach</SecTitle>
          <AIStatus status={aiStatus}/>
        </div>
        <div style={{ fontFamily:"var(--font-ui)",fontSize:10,color:T.dim,lineHeight:1.7 }}>
          Powered by Gemini AI via a secure server proxy. Your API key is never exposed to the browser. The AI has access to your full profile, stats, and history.
        </div>
        <button onClick={generateBriefing} disabled={briefingLoading} style={{ marginTop:10,width:"100%",padding:"9px",background:"transparent",border:`1px solid ${T.sg}40`,borderRadius:5,color:briefingLoading?T.dim:T.sg,fontFamily:"var(--font-ui)",fontSize:9,letterSpacing:3,cursor:briefingLoading?"not-allowed":"pointer" }}>
          {briefingLoading?"GENERATING...":"REGENERATE TODAY'S BRIEFING"}
        </button>
      </Card>

      <Card style={{ padding:0,overflow:"hidden" }}>
        <div style={{ padding:"10px 14px",borderBottom:`1px solid var(--bg3)`,fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:4,color:T.sg,display:"flex",justifyContent:"space-between",alignItems:"center" }}>
          <span>AI COACH CHAT</span>
          <AIStatus status={loading?"working":aiStatus}/>
        </div>
        <div style={{ height:340,overflowY:"auto",padding:14,display:"flex",flexDirection:"column",gap:12 }}>
          {messages.map((m,i)=>(
            <div key={i} style={{ display:"flex",flexDirection:"column",gap:6,alignItems:m.role==="user"?"flex-end":"flex-start" }}>
              <div style={{ maxWidth:"88%",padding:"10px 14px",borderRadius:8,background:m.role==="user"?`${th.accent}15`:m.error?"#1a0000":"var(--bg2)",border:`1px solid ${m.role==="user"?`${th.accent}40`:m.error?`${T.danger}40`:"var(--bg3)"}`,fontFamily:m.role==="system"?FONTS.display:FONTS.ui,fontSize:m.role==="system"?13:12,color:"var(--text)",lineHeight:1.7,whiteSpace:"pre-wrap" }}>
                {m.role==="system"&&<span style={{ fontFamily:"var(--font-ui)",fontSize:7,letterSpacing:3,color:T.sg,display:"block",marginBottom:6 }}>AI COACH</span>}
                {m.text}
              </div>
              {m.parsedQuests?.length>0&&(
                <div style={{ maxWidth:"88%",display:"flex",flexDirection:"column",gap:5 }}>
                  {m.parsedQuests.map((q,qi)=>(
                    <button key={qi} onClick={()=>addSuggestedQuest(q)} style={{ padding:"7px 12px",background:`${T.sg}10`,border:`1px solid ${T.sg}40`,borderRadius:5,color:T.sg,fontFamily:"var(--font-ui)",fontSize:9,cursor:"pointer",textAlign:"left",transition:"background 0.2s" }}
                      onMouseEnter={e=>e.currentTarget.style.background=`${T.sg}20`} onMouseLeave={e=>e.currentTarget.style.background=`${T.sg}10`}>
                      + Add to quests: "{q.name}"
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {loading&&<div style={{ fontFamily:"var(--font-ui)",fontSize:10,color:T.sg,animation:"pulse 1.2s ease-in-out infinite" }}>Thinking...</div>}
          <div ref={bottomRef}/>
        </div>
        <div style={{ padding:"8px 14px",borderTop:`1px solid var(--bg3)`,display:"flex",gap:5,flexWrap:"wrap" }}>
          {QUICK.map((q,i)=>(
            <button key={i} onClick={()=>setInput(q)} style={{ fontFamily:"var(--font-ui)",fontSize:8,padding:"4px 9px",background:"transparent",border:`1px solid var(--bg3)`,borderRadius:4,color:T.dim,cursor:"pointer",transition:"all 0.2s" }}
              onMouseEnter={e=>{e.target.style.borderColor=th.accent;e.target.style.color=th.accent;}} onMouseLeave={e=>{e.target.style.borderColor=T.bg3;e.target.style.color=T.dim;}}>
              {q}
            </button>
          ))}
        </div>
        <div style={{ display:"flex",borderTop:`1px solid var(--bg3)` }}>
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&!e.shiftKey&&send()} placeholder="Ask the AI coach..." style={{ flex:1,background:"var(--bg1)",border:"none",color:"var(--text)",padding:"12px 16px",fontFamily:"var(--font-ui)",fontSize:12,outline:"none" }}/>
          <button onClick={send} disabled={loading||!input.trim()} style={{ padding:"12px 18px",background:loading||!input.trim()?"transparent":`${th.accent}15`,border:"none",borderLeft:`1px solid var(--bg3)`,color:loading||!input.trim()?T.dim:th.accent,fontFamily:"var(--font-ui)",fontSize:10,letterSpacing:1,cursor:loading||!input.trim()?"not-allowed":"pointer",transition:"all 0.2s" }}>
            {loading?"...":"SEND"}
          </button>
        </div>
      </Card>
    </div>
  );
}
