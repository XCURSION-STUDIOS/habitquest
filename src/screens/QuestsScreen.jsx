import { useState } from "react";
import { T, FONTS } from "../constants/theme.js";
import { STATS, DIFF, STAT_COL, STAT_ICO, QUEST_DAILY_LIMIT } from "../constants/gameData.js";
import { getQuestLimit } from "../lib/gameLogic.js";
import { Card, Btn, DiffTag } from "../components/ui/index.jsx";

export default function QuestsScreen({ game, update, th, completeQuest, showToast }) {
  const [filter,setFilter]       = useState("active");
  const [adding,setAdding]       = useState(false);
  const [questForm,setQuestForm] = useState({ name:"",type:"Physical",diff:"C-Rank",notes:"",dueDate:"" });
  const [expanded,setExpanded]   = useState(null);

  const shown    = game.quests?.filter(q=>filter==="active"?!q.done:q.done)||[];
  const limit    = getQuestLimit(game);
  const todayUsed= game.questCompletedToday||0;
  const sel = { flex:1,background:"var(--bg2)",border:`1px solid var(--bg3)`,borderRadius:5,color:"var(--text)",padding:"8px",fontFamily:"var(--font-ui)",fontSize:10,outline:"none" };

  function calcRewards(diff, dueDate) {
    const cfg = DIFF[diff];
    const base = { xp: cfg.xp * 3, gems: cfg.gems * 3 };
    if (!dueDate) return base;
    const days = Math.min(365, Math.max(1, Math.ceil((new Date(dueDate) - new Date()) / (1000*60*60*24))));
    const mult = 1 + 6 * Math.log10(days);
    return { xp: Math.round(base.xp * mult), gems: Math.round(base.gems * mult) };
  }

  function addQuest() {
    if (!questForm.name.trim()) return;
    const { xp, gems } = calcRewards(questForm.diff, questForm.dueDate);
    update(s=>({...s,quests:[...(s.quests||[]),{ id:Date.now(),name:questForm.name.trim(),type:questForm.type,diff:questForm.diff,done:false,xp,gems,notes:questForm.notes.trim()||null,dueDate:questForm.dueDate||null }]}));
    setQuestForm({name:"",type:"Physical",diff:"C-Rank",notes:"",dueDate:""});
    setAdding(false);
    showToast("Quest added.","gold");
  }

  return (
    <div>
      {/* Daily limit indicator */}
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:12,padding:"8px 14px",background:"var(--bg1)",border:`1px solid var(--bg3)`,borderRadius:8 }}>
        <div style={{ fontFamily:"var(--font-ui)",fontSize:9,color:T.dim }}>Quests completed today</div>
        <div style={{ display:"flex",alignItems:"center",gap:8 }}>
          <div style={{ display:"flex",gap:3 }}>
            {Array.from({length:limit}).map((_,i)=>(
              <div key={i} style={{ width:10,height:10,borderRadius:2,background:i<todayUsed?T.gold:"var(--bg3)",transition:"background 0.3s" }}/>
            ))}
          </div>
          <span style={{ fontFamily:"var(--font-ui)",fontSize:9,color:todayUsed>=limit?T.danger:T.silver }}>{todayUsed}/{limit}</span>
        </div>
      </div>

      <div style={{ display:"flex",gap:8,marginBottom:12 }}>
        {["active","completed"].map(f=>(
          <button key={f} onClick={()=>setFilter(f)} style={{ flex:1,padding:"8px",background:"transparent",border:`1px solid ${filter===f?th.accent:"var(--bg3)"}`,borderRadius:5,color:filter===f?th.accent:T.dim,fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:2,cursor:"pointer",transition:"all 0.2s" }}>
            {f.toUpperCase()} ({(game.quests?.filter(q=>f==="active"?!q.done:q.done)||[]).length})
          </button>
        ))}
      </div>

      {shown.length===0&&(
        <div style={{ textAlign:"center",padding:"48px 0",fontFamily:"var(--font-display)",fontSize:16,color:T.dim,lineHeight:2 }}>
          {filter==="active"?"No active quests.\nAdd your first goal below.":"No completed quests yet."}
        </div>
      )}

      {shown.map(q=>{
        const cfg=DIFF[q.diff], isExpanded=expanded===q.id;
        return (
          <Card key={q.id} style={{ marginBottom:10,border:`1px solid ${q.done?"#27a06030":cfg.col+"30"}` }}>
            <div style={{ display:"flex",gap:10,alignItems:"flex-start" }}>
              <div style={{ fontSize:14,color:STAT_COL[q.type]||T.dim,marginTop:3,flexShrink:0 }}>{q.done?"✓":STAT_ICO[q.type]}</div>
              <div style={{ flex:1,cursor:q.notes?"pointer":"default" }} onClick={()=>q.notes&&setExpanded(isExpanded?null:q.id)}>
                <div style={{ display:"flex",gap:7,flexWrap:"wrap",alignItems:"center",marginBottom:5 }}>
                  <span style={{ fontFamily:"var(--font-display)",fontSize:16,color:q.done?"#40d090":"var(--text)",textDecoration:q.done?"line-through":"none" }}>{q.name}</span>
                  <DiffTag diff={q.diff}/>
                  {q.notes&&<span style={{ fontFamily:"var(--font-ui)",fontSize:7,color:T.dim,border:`1px solid var(--bg3)`,padding:"1px 5px",borderRadius:3 }}>HAS NOTES</span>}
                </div>
                <div style={{ fontFamily:"var(--font-ui)",fontSize:9,color:T.dim }}>
                  <span style={{ color:STAT_COL[q.type] }}>{q.type}</span>{" · +"}{q.xp} XP · +{q.gems} gems · +3 {q.type}
                </div>
                {q.dueDate&&(()=>{
                  const days = Math.ceil((new Date(q.dueDate) - new Date()) / (1000*60*60*24));
                  const overdue = days < 0;
                  const color = overdue ? T.danger : days <= 3 ? "#e07828" : T.dim;
                  const label = overdue ? `${Math.abs(days)}d overdue` : days === 0 ? "due today" : `${days}d left`;
                  return <div style={{ fontFamily:"var(--font-ui)",fontSize:8,color,marginTop:2 }}>⏱ {label} · due {new Date(q.dueDate).toLocaleDateString()}</div>;
                })()}
                {isExpanded&&q.notes&&(
                  <div style={{ marginTop:8,padding:"8px 10px",background:"var(--bg2)",borderRadius:5,fontFamily:"var(--font-ui)",fontSize:10,color:T.silver,lineHeight:1.7,whiteSpace:"pre-wrap" }}>
                    {q.notes}
                  </div>
                )}
              </div>
              <button onClick={()=>update(s=>({...s,quests:s.quests.filter(x=>x.id!==q.id)}))} style={{ background:"none",border:"none",color:T.dim,cursor:"pointer",fontSize:11 }}
                onMouseEnter={e=>e.target.style.color=T.danger} onMouseLeave={e=>e.target.style.color=T.dim}>✕</button>
            </div>
            {!q.done&&(
              <button onClick={()=>completeQuest(q.id)} style={{ marginTop:10,width:"100%",padding:"9px",background:`${cfg.col}10`,border:`1px solid ${cfg.col}40`,borderRadius:5,color:cfg.col,fontFamily:"var(--font-ui)",fontSize:9,letterSpacing:2,cursor:todayUsed>=limit?"not-allowed":"pointer",transition:"background 0.2s",opacity:todayUsed>=limit?0.5:1 }}
                onMouseEnter={e=>{if(todayUsed<limit)e.currentTarget.style.background=`${cfg.col}20`;}}
                onMouseLeave={e=>{e.currentTarget.style.background=`${cfg.col}10`;}}>
                {todayUsed>=limit?`LIMIT REACHED (${limit}/day) — Buy extra slot in shop`:"MARK COMPLETE"}
              </button>
            )}
          </Card>
        );
      })}

      {adding?(
        <Card style={{ marginTop:8 }}>
          <input autoFocus value={questForm.name} onChange={e=>setQuestForm(x=>({...x,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addQuest()} placeholder="Quest name..."
            style={{ width:"100%",background:"var(--bg2)",border:`1px solid var(--bg3)`,borderRadius:5,color:"var(--text)",padding:"9px 12px",fontFamily:"var(--font-ui)",fontSize:12,outline:"none",boxSizing:"border-box",marginBottom:10 }}/>
          <div style={{ display:"flex",gap:8,marginBottom:10 }}>
            <select value={questForm.type} onChange={e=>setQuestForm(x=>({...x,type:e.target.value}))} style={sel}>{STATS.map(s=><option key={s}>{s}</option>)}</select>
            <select value={questForm.diff} onChange={e=>setQuestForm(x=>({...x,diff:e.target.value}))} style={sel}>{Object.keys(DIFF).map(d=><option key={d}>{d}</option>)}</select>
          </div>
          <textarea value={questForm.notes} onChange={e=>setQuestForm(x=>({...x,notes:e.target.value}))} placeholder="Notes (optional) — sub-tasks, context, links..."
            style={{ width:"100%",background:"var(--bg2)",border:`1px solid var(--bg3)`,borderRadius:5,color:"var(--text)",padding:"9px 12px",fontFamily:"var(--font-ui)",fontSize:11,outline:"none",boxSizing:"border-box",marginBottom:10,height:64,resize:"none" }}/>
          <div style={{ marginBottom:10 }}>
            <div style={{ fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:2,color:T.dim,marginBottom:5 }}>DUE DATE (optional)</div>
            <input type="date" value={questForm.dueDate} onChange={e=>setQuestForm(x=>({...x,dueDate:e.target.value}))}
              style={{ width:"100%",background:"var(--bg2)",border:`1px solid var(--bg3)`,borderRadius:5,color:"var(--text)",padding:"9px 12px",fontFamily:"var(--font-ui)",fontSize:11,outline:"none",boxSizing:"border-box",colorScheme:"dark" }}/>
          </div>
          {(()=>{
            const { xp, gems } = calcRewards(questForm.diff, questForm.dueDate);
            return (
              <div style={{ marginBottom:10,padding:"8px 12px",background:"var(--bg2)",borderRadius:5,border:`1px solid var(--bg3)`,fontFamily:"var(--font-ui)",fontSize:9,color:th.accent,display:"flex",gap:16 }}>
                <span>REWARD</span>
                <span>+{xp} XP</span>
                <span>+{gems} gems</span>
                {questForm.dueDate && (() => {
                  const days = Math.max(1, Math.ceil((new Date(questForm.dueDate) - new Date()) / (1000*60*60*24)));
                  return <span style={{ color:T.dim }}>{days}d deadline</span>;
                })()}
              </div>
            );
          })()}
          <div style={{ display:"flex",gap:8 }}><Btn full onClick={addQuest}>ADD QUEST</Btn><Btn danger onClick={()=>setAdding(false)}>✕</Btn></div>
        </Card>
      ):(
        <button onClick={()=>setAdding(true)} style={{ width:"100%",marginTop:8,padding:"12px",background:"transparent",border:`1px dashed var(--bg3)`,borderRadius:8,color:T.dim,fontFamily:"var(--font-ui)",fontSize:9,letterSpacing:3,cursor:"pointer",transition:"all 0.2s" }}
          onMouseEnter={e=>{e.target.style.borderColor=th.accent;e.target.style.color=th.accent;}} onMouseLeave={e=>{e.target.style.borderColor=T.bg3;e.target.style.color=T.dim;}}>
          + ADD QUEST
        </button>
      )}
    </div>
  );
}
