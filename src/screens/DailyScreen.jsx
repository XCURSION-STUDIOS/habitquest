import { useState } from "react";
import { T, FONTS } from "../constants/theme.js";
import { STATS, DIFF, STAT_COL } from "../constants/gameData.js";
import { Card, Btn, DiffTag } from "../components/ui/index.jsx";
import HabitTemplatesModal from "./HabitTemplatesModal.jsx";

export default function DailyScreen({ game, update, th, V, today, todayDone, doneCount, allDone, completeDaily, showToast }) {
  const [adding,setAdding]       = useState(false);
  const [showTemplates,setShowTemplates] = useState(false);
  const [showMood,setShowMood]   = useState(false);
  const [dailyForm,setDailyForm] = useState({ name:"",type:"Physical",diff:"D-Rank" });
  const sel = { flex:1,background:"var(--bg2)",border:`1px solid var(--bg3)`,borderRadius:5,color:"var(--text)",padding:"8px",fontFamily:"var(--font-ui)",fontSize:10,outline:"none" };

  function setMood(m) {
    if (game.lastMoodDate===today){ showToast("Mood already set for today.","info"); return; }
    update(s=>({...s,mood:m,lastMoodDate:today}));
    showToast(m==="high"?"High energy — +25% XP today.":m==="low"?"Low energy noted — reduced XP penalty.":"Steady day. Normal XP rates.","gold");
    setShowMood(false);
  }

  function addDaily() {
    if (!dailyForm.name.trim()) return;
    update(s=>({...s,daily:[...s.daily,{id:Date.now(),name:dailyForm.name.trim(),type:dailyForm.type,diff:dailyForm.diff,streak:0,best:0}]}));
    setDailyForm({name:"",type:"Physical",diff:"D-Rank"});
    setAdding(false);
    showToast("Habit added.","gold");
  }

  const moodAlreadySet = game.lastMoodDate===today;
  const moodLabel = game.mood==="high"?"⚡ High energy":game.mood==="low"?"↓ Low energy":"— Steady";

  return (
    <div>
      {!moodAlreadySet&&(
        <div style={{ display:"flex",alignItems:"center",gap:10,padding:"10px 14px",marginBottom:12,background:`${th.accent}08`,border:`1px solid ${th.accent}30`,borderRadius:8,cursor:"pointer" }} onClick={()=>setShowMood(true)}>
          <span style={{ fontSize:16 }}>🌤</span>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:2,color:th.accent }}>SET YOUR MOOD</div>
            <div style={{ fontFamily:"var(--font-ui)",fontSize:9,color:T.dim,marginTop:1 }}>Affects your XP for the day — tap to set</div>
          </div>
          <span style={{ fontFamily:"var(--font-ui)",fontSize:9,color:th.accent }}>→</span>
        </div>
      )}
      {showTemplates && (
        <HabitTemplatesModal
          game={game} th={th}
          onClose={()=>setShowTemplates(false)}
          onApply={({daily:newDaily, quests:newQuests, mode})=>{
            update(s=>({
              ...s,
              daily: mode==="replace" ? newDaily.map(h=>({...h,id:Date.now()+Math.random()})) : [...(s.daily||[]), ...newDaily.map(h=>({...h,id:Date.now()+Math.random()}))],
              quests: mode==="replace" ? newQuests.map(q=>({...q,id:Date.now()+Math.random()})) : [...(s.quests||[]), ...newQuests.map(q=>({...q,id:Date.now()+Math.random()}))],
            }));
            showToast("Template applied!", "success");
          }}
        />
      )}

      {/* Progress summary */}
      <Card style={{ marginBottom:12,border:`1px solid ${allDone?"var(--success)40":"var(--bg3)"}`,background:allDone?"var(--bg1)":undefined }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:"var(--font-display)",fontSize:16,color:allDone?"var(--success)":"var(--text)" }}>
              {allDone?"All habits completed!":` ${doneCount} / ${game.daily?.length||0} completed`}
            </div>
            <div style={{ fontFamily:"var(--font-ui)",fontSize:9,color:T.dim,marginTop:2 }}>
              {game.mood==="high"?"⚡ +25% XP active":game.mood==="low"?"↓ −15% XP active":""}
            </div>
          </div>
          <div style={{ display:"flex",alignItems:"center",gap:8,flexShrink:0 }}>
            {(game.daily?.length||0)>0&&(
              <div style={{ fontFamily:"var(--font-display)",fontSize:26,color:th.accent }}>{Math.round((doneCount/(game.daily?.length||1))*100)}%</div>
            )}
            {/* Mood toggle */}
            {!moodAlreadySet&&(
              <button
                onClick={()=>setShowMood(v=>!v)}
                style={{ fontFamily:"var(--font-ui)",fontSize:7,letterSpacing:1,padding:"3px 8px",background:"none",border:`1px solid ${showMood?th.accent+"40":"var(--bg3)"}`,borderRadius:4,color:showMood?th.accent:T.dim,cursor:"pointer",transition:"all 0.2s" }}
              >
                SET MOOD
              </button>
            )}
            {moodAlreadySet&&(
              <span style={{ fontFamily:"var(--font-ui)",fontSize:8,color:T.dim }}>{moodLabel}</span>
            )}
          </div>
        </div>
        {(game.daily?.length||0)>0&&(
          <div style={{ marginTop:10,height:2,background:"var(--bg3)",borderRadius:1 }}>
            <div style={{ height:"100%",width:`${(doneCount/(game.daily?.length||1))*100}%`,background:allDone?"var(--success)":th.accent,borderRadius:1,transition:"width 0.4s ease" }}/>
          </div>
        )}
      </Card>

      {/* Mood selector — expandable */}
      {!moodAlreadySet&&showMood&&(
        <Card style={{ marginBottom:12,animation:"fadeSlideDown 0.18s ease" }}>
          <div style={{ fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:3,color:T.dim,marginBottom:10 }}>HOW ARE YOU FEELING TODAY?</div>
          <div style={{ display:"flex",gap:8 }}>
            {[{k:"low",l:"Low energy",s:"−15% XP"},{k:"normal",l:"Steady",s:"Normal XP"},{k:"high",l:"High energy",s:"+25% XP"}].map(m=>(
              <button key={m.k} onClick={()=>setMood(m.k)} style={{ flex:1,padding:"10px 6px",background:"transparent",border:`1px solid var(--bg3)`,borderRadius:6,color:T.silver,fontFamily:"var(--font-ui)",fontSize:9,cursor:"pointer",transition:"all 0.2s",display:"flex",flexDirection:"column",alignItems:"center",gap:3 }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor=th.accent;e.currentTarget.style.color=th.accent;}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor=T.bg3;e.currentTarget.style.color=T.silver;}}>
                <span>{m.l}</span><span style={{ fontSize:8,color:T.dim }}>{m.s}</span>
              </button>
            ))}
          </div>
        </Card>
      )}

      {/* Bonus Mission card */}
      {game.bonusMission && (
        <div onClick={()=>{
          if(game.bonusMission.done) return;
          update(s=>({...s, bonusMission:{...s.bonusMission,done:true}, xp:(s.xp||0)+180, gems:(s.gems||0)+18, decayDepth:Math.max(0,(s.decayDepth||0)-2) }));
        }}
          style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 16px",marginBottom:16,
            background:game.bonusMission.done?"var(--bg1)":`linear-gradient(135deg,${V.purple}18,${V.bg2})`,
            border:`1px solid ${game.bonusMission.done?V.purple+"30":V.purple+"60"}`,
            borderRadius:"var(--card-radius)",cursor:game.bonusMission.done?"default":"pointer",
            transition:"all 0.2s",userSelect:"none",opacity:game.bonusMission.done?0.6:1 }}>
          <div style={{ width:18,height:18,borderRadius:3,
            border:`1px solid ${game.bonusMission.done?V.purple:V.purple}`,
            background:game.bonusMission.done?V.purple+"30":"transparent",
            display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
            {game.bonusMission.done
              ? <span style={{ color:V.purple,fontSize:11 }}>✓</span>
              : <span style={{ color:V.purple,fontSize:9 }}>◈</span>}
          </div>
          <div style={{ flex:1 }}>
            <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:3 }}>
              <span style={{ fontFamily:"var(--font-display)",fontSize:15,color:"var(--text)",
                textDecoration:game.bonusMission.done?"line-through":"none",
                textDecorationColor:V.purple+"60" }}>{game.bonusMission.name}</span>
              <span style={{ fontFamily:"var(--font-ui)",fontSize:7,letterSpacing:2,color:V.purple,border:`1px solid ${V.purple}40`,padding:"1px 5px",borderRadius:3 }}>
                {game.bonusMission.done?"COMPLETE":"AI BONUS"}
              </span>
            </div>
            <div style={{ fontFamily:"var(--font-ui)",fontSize:9,color:V.silver,lineHeight:1.5 }}>{game.bonusMission.desc}</div>
            <div style={{ fontFamily:"var(--font-ui)",fontSize:8,color:V.purple,marginTop:4 }}>+180 XP · +18 gems · −2 decay</div>
          </div>
        </div>
      )}

      {/* Habit list */}
      {game.daily?.map(q=>{
        const done=!!todayDone[q.id],cfg=DIFF[q.diff];
        return (
          <div key={q.id} onClick={()=>completeDaily(q.id)} style={{ display:"flex",alignItems:"center",gap:12,padding:"14px 16px",marginBottom:8,background:done?"var(--bg1)":"var(--bg1)",border:`1px solid ${done?"var(--success)30":"var(--bg3)"}`,borderRadius:8,cursor:"pointer",transition:"all 0.2s",userSelect:"none" }}>
            <div style={{ width:18,height:18,borderRadius:3,border:`1px solid ${done?"var(--success)":"#2a3050"}`,background:done?"var(--success)15":"transparent",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}>
              {done&&<span style={{ color:"var(--success)",fontSize:11 }}>✓</span>}
            </div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex",alignItems:"center",gap:7,marginBottom:3,flexWrap:"wrap" }}>
                <span style={{ fontFamily:"var(--font-display)",fontSize:15,color:done?"var(--success)":"var(--text)",textDecoration:done?"line-through":"none",textDecorationColor:"var(--success)60" }}>{q.name}</span>
                <DiffTag diff={q.diff}/>
              </div>
              <div style={{ fontFamily:"var(--font-ui)",fontSize:8,color:T.dim }}>
                <span style={{ color:STAT_COL[q.type] }}>{q.type.toUpperCase()}</span>{" · +"}{cfg.xp} XP · +{cfg.gems} gems
              </div>
            </div>
            <div style={{ textAlign:"right",flexShrink:0 }}>
              <div style={{ fontFamily:"var(--font-display)",fontSize:13,color:q.streak>=14?T.gold:q.streak>=7?"#b03030":T.dim }}>{q.streak>0?`${q.streak}d`:"—"}</div>
              {q.best>0&&<div style={{ fontFamily:"var(--font-ui)",fontSize:7,color:T.dim }}>best {q.best}</div>}
            </div>
            <button onClick={e=>{e.stopPropagation();update(s=>({...s,daily:s.daily.filter(d=>d.id!==q.id)}));}} style={{ background:"none",border:"none",color:T.dim,cursor:"pointer",fontSize:11,padding:4,flexShrink:0 }}
              onMouseEnter={e=>e.target.style.color=T.danger} onMouseLeave={e=>e.target.style.color=T.dim}>✕</button>
          </div>
        );
      })}

      {adding?(
        <Card style={{ marginTop:8 }}>
          <input autoFocus value={dailyForm.name} onChange={e=>setDailyForm(x=>({...x,name:e.target.value}))} onKeyDown={e=>e.key==="Enter"&&addDaily()} placeholder="Habit name..." style={{ width:"100%",background:"var(--bg2)",border:`1px solid var(--bg3)`,borderRadius:5,color:"var(--text)",padding:"9px 12px",fontFamily:"var(--font-ui)",fontSize:12,outline:"none",boxSizing:"border-box",marginBottom:10 }}/>
          <div style={{ display:"flex",gap:8,marginBottom:10 }}>
            <select value={dailyForm.type} onChange={e=>setDailyForm(x=>({...x,type:e.target.value}))} style={sel}>{STATS.map(s=><option key={s}>{s}</option>)}<option value="General">General</option></select>
            <select value={dailyForm.diff} onChange={e=>setDailyForm(x=>({...x,diff:e.target.value}))} style={sel}>{Object.keys(DIFF).map(d=><option key={d}>{d}</option>)}</select>
          </div>
          <div style={{ display:"flex",gap:8 }}><Btn full onClick={addDaily}>ADD HABIT</Btn><Btn danger onClick={()=>setAdding(false)}>✕</Btn></div>
        </Card>
      ):(
        <>
          <button onClick={()=>setShowTemplates(true)} style={{ width:"100%",marginBottom:6,padding:"10px",background:"transparent",border:`1px dashed ${T.purple}40`,borderRadius:8,color:T.purple,fontFamily:"var(--font-ui)",fontSize:9,letterSpacing:3,cursor:"pointer" }}>
            ◈ HABIT TEMPLATES
          </button>
          <button onClick={()=>setAdding(true)} style={{ width:"100%",marginTop:8,padding:"12px",background:"transparent",border:`1px dashed var(--bg3)`,borderRadius:8,color:T.dim,fontFamily:"var(--font-ui)",fontSize:9,letterSpacing:3,cursor:"pointer",transition:"all 0.2s" }}
            onMouseEnter={e=>{e.target.style.borderColor=th.accent;e.target.style.color=th.accent;}} onMouseLeave={e=>{e.target.style.borderColor=T.bg3;e.target.style.color=T.dim;}}>
            + ADD DAILY HABIT
          </button>
        </>
      )}
    </div>
  );
}
