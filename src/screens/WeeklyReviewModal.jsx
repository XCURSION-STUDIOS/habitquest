import { useState, useEffect } from "react";
import { T, FONTS } from "../constants/theme.js";
import { buildWeeklyData, buildArchitectPrompt, callAIProxy } from "../lib/ai.js";

export default function WeeklyReviewModal({ game, onClose, th, showToast }) {
  const [status,  setStatus]  = useState("loading"); // loading | done | error
  const [review,  setReview]  = useState(null);
  const [weekData,setWeekData]= useState(null);

  useEffect(() => {
    generate();
  }, []);

  async function generate() {
    setStatus("loading");
    try {
      const wd  = await buildWeeklyData(game);
      setWeekData(wd);
      const sys = buildArchitectPrompt(game, wd);
      const txt = await callAIProxy(sys, "Conduct the weekly review now.", []);
      setReview(txt);
      setStatus("done");
    } catch(e) {
      setStatus("error");
      showToast("Review failed: " + e.message, "danger");
    }
  }

  const scoreColor = weekData
    ? weekData.weekScore >= 80 ? "#27a060"
    : weekData.weekScore >= 50 ? "#c9a84c"
    : "#b03030"
    : T.dim;

  return (
    <div style={{ position:"fixed",inset:0,zIndex:2000,background:"rgba(2,2,10,0.97)",backdropFilter:"blur(16px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,boxSizing:"border-box",overflow:"auto" }}>
      <div style={{ maxWidth:500,width:"100%",maxHeight:"92vh",display:"flex",flexDirection:"column" }}>

        {/* Header */}
        <div style={{ marginBottom:20,borderBottom:`1px solid var(--bg3)`,paddingBottom:16 }}>
          <div style={{ fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:6,color:T.dim,marginBottom:8 }}>
            WEEKLY PERFORMANCE REVIEW
          </div>
          <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
            <div style={{ fontFamily:"var(--font-display)",fontSize:32,color:"#eef2ff" }}>The Architect</div>
            {weekData && (
              <div style={{ textAlign:"right" }}>
                <div style={{ fontFamily:"var(--font-display)",fontSize:42,color:scoreColor,lineHeight:1 }}>{weekData.weekScore}</div>
                <div style={{ fontFamily:"var(--font-ui)",fontSize:7,letterSpacing:3,color:T.dim }}>WEEK SCORE</div>
              </div>
            )}
          </div>
        </div>

        {/* Week grid */}
        {weekData && (
          <div style={{ display:"flex",gap:4,marginBottom:20 }}>
            {weekData.week.map((d,i) => (
              <div key={i} style={{ flex:1,textAlign:"center" }}>
                <div style={{ fontFamily:"var(--font-ui)",fontSize:7,color:T.dim,marginBottom:4 }}>{d.day}</div>
                <div style={{ height:48,background:"var(--bg2)",borderRadius:4,position:"relative",overflow:"hidden" }}>
                  <div style={{ position:"absolute",bottom:0,left:0,right:0,height:`${d.rate}%`,background:d.rate>=80?"#27a060":d.rate>=50?"#c9a84c":"#b03030",opacity:0.7,transition:"height 0.6s ease" }}/>
                </div>
                <div style={{ fontFamily:"var(--font-ui)",fontSize:7,color:T.silver,marginTop:3 }}>{d.rate}%</div>
              </div>
            ))}
          </div>
        )}

        {/* Stat breakdown */}
        {weekData && (
          <div style={{ display:"flex",gap:6,marginBottom:20,flexWrap:"wrap" }}>
            {Object.entries(weekData.statRates).filter(([,v])=>v!==null).map(([stat,rate])=>(
              <div key={stat} style={{ flex:1,minWidth:70,padding:"8px 10px",background:"var(--bg1)",border:`1px solid var(--bg3)`,borderRadius:6,textAlign:"center" }}>
                <div style={{ fontFamily:"var(--font-ui)",fontSize:16,color:rate>=70?"#27a060":rate>=40?"#c9a84c":"#b03030",marginBottom:2 }}>{rate}%</div>
                <div style={{ fontFamily:"var(--font-ui)",fontSize:7,color:T.dim,letterSpacing:1 }}>{stat.toUpperCase().slice(0,4)}</div>
              </div>
            ))}
          </div>
        )}

        {/* Review content */}
        <div style={{ flex:1,overflowY:"auto",background:"var(--bg1)",border:`1px solid var(--bg3)`,borderRadius:10,padding:18,marginBottom:16 }}>
          {status === "loading" && (
            <div style={{ textAlign:"center",padding:"40px 0" }}>
              <div style={{ fontFamily:"var(--font-ui)",fontSize:9,letterSpacing:4,color:T.dim,animation:"pulse 1.5s ease-in-out infinite" }}>
                THE ARCHITECT IS ANALYSING YOUR WEEK...
              </div>
              <div style={{ fontFamily:"var(--font-ui)",fontSize:8,color:T.dim,marginTop:12,opacity:0.5 }}>
                Identifying patterns · Correlating data · Preparing recommendations
              </div>
            </div>
          )}
          {status === "error" && (
            <div style={{ fontFamily:"var(--font-ui)",fontSize:11,color:T.danger,lineHeight:1.7 }}>
              Analysis failed. Check your connection and try again.
            </div>
          )}
          {status === "done" && review && (
            <div style={{ fontFamily:"var(--font-display)",fontSize:14,color:"#d8e0f0",lineHeight:1.9,whiteSpace:"pre-wrap" }}>
              {review}
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{ display:"flex",gap:8 }}>
          {status !== "loading" && (
            <button onClick={generate} style={{ flex:1,padding:"11px",background:"transparent",border:`1px solid var(--bg3)`,borderRadius:6,color:T.dim,fontFamily:"var(--font-ui)",fontSize:9,letterSpacing:2,cursor:"pointer" }}>
              REGENERATE
            </button>
          )}
          <button onClick={onClose} style={{ flex:2,padding:"11px",background:`${th.accent}15`,border:`1px solid ${th.accent}40`,borderRadius:6,color:th.accent,fontFamily:"var(--font-ui)",fontSize:9,letterSpacing:2,cursor:"pointer" }}>
            CLOSE
          </button>
        </div>
      </div>
    </div>
  );
}
