import { useState } from "react";
import { T, FONTS } from "../constants/theme.js";
import { HABIT_TEMPLATES, DIFF } from "../constants/gameData.js";

export default function HabitTemplatesModal({ onClose, onApply, th, game }) {
  const [selected, setSelected] = useState(null);
  const [mode, setMode]         = useState("add"); // "add" or "replace"
  const tmpl = HABIT_TEMPLATES.find(t => t.id === selected);
  const hasExisting = (game.daily?.length || 0) > 0;

  function apply() {
    if (!tmpl) return;
    const newDaily = tmpl.daily.map(h => ({
      id: Date.now() + Math.random(),
      name: h.name, type: h.type, diff: h.diff,
      streak: 0, best: 0,
    }));
    const newQuests = tmpl.quests.map(q => {
      const cfg = DIFF[q.diff];
      return {
        id: Date.now() + Math.random(),
        name: q.name, type: q.type, diff: q.diff,
        done: false, xp: cfg.xp * 3, gems: cfg.gems * 3,
      };
    });
    onApply({ daily: newDaily, quests: newQuests, mode });
    onClose();
  }

  return (
    <div style={{ position:"fixed",inset:0,zIndex:2000,background:"rgba(6,6,15,0.94)",backdropFilter:"blur(12px)",display:"flex",alignItems:"center",justifyContent:"center",padding:20,boxSizing:"border-box" }}>
      <div style={{ maxWidth:460,width:"100%",background:"linear-gradient(135deg,#0d0d1a,#111120)",border:`1px solid ${th.accent}40`,borderRadius:14,overflow:"hidden",boxShadow:`0 0 60px ${th.accent}10`,maxHeight:"90vh",display:"flex",flexDirection:"column" }}>
        <div style={{ padding:"20px 22px 0" }}>
          <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6 }}>
            <div style={{ fontFamily:FONTS.display,fontSize:22,color:"#eef2ff" }}>Habit Templates</div>
            <button onClick={onClose} style={{ background:"none",border:"none",color:T.dim,cursor:"pointer",fontSize:16 }}>✕</button>
          </div>
          <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim,marginBottom:16,lineHeight:1.6 }}>
            Choose a template to get started fast. Installs daily habits and starter quests.
          </div>
        </div>

        <div style={{ overflowY:"auto",padding:"0 22px",flex:1 }}>
          {/* Template grid */}
          <div style={{ display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16 }}>
            {HABIT_TEMPLATES.map(t => (
              <button key={t.id} onClick={() => setSelected(t.id)} style={{ padding:"12px 10px",background:selected===t.id?`${th.accent}15`:"transparent",border:`1px solid ${selected===t.id?th.accent:"var(--bg3)"}`,borderRadius:8,cursor:"pointer",textAlign:"left",transition:"all 0.2s" }}>
                <div style={{ fontSize:18,marginBottom:4 }}>{t.icon}</div>
                <div style={{ fontFamily:FONTS.display,fontSize:13,color:selected===t.id?th.accent:"#eef2ff",marginBottom:2 }}>{t.name}</div>
                <div style={{ fontFamily:FONTS.ui,fontSize:9,color:T.dim,lineHeight:1.5 }}>{t.desc}</div>
              </button>
            ))}
          </div>

          {/* Preview */}
          {tmpl && (
            <div style={{ marginBottom:16,padding:"14px",background:"var(--bg2)",borderRadius:8,border:`1px solid var(--bg3)` }}>
              <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:3,color:T.dim,marginBottom:10 }}>PREVIEW</div>
              <div style={{ fontFamily:FONTS.ui,fontSize:9,color:th.accent,marginBottom:6,letterSpacing:2 }}>DAILY HABITS</div>
              {tmpl.daily.map((h,i) => (
                <div key={i} style={{ fontFamily:FONTS.ui,fontSize:10,color:T.silver,marginBottom:3 }}>
                  · {h.name} <span style={{ color:T.dim }}>({h.type} · {h.diff})</span>
                </div>
              ))}
              <div style={{ fontFamily:FONTS.ui,fontSize:9,color:th.accent,marginBottom:6,letterSpacing:2,marginTop:10 }}>STARTER QUESTS</div>
              {tmpl.quests.map((q,i) => (
                <div key={i} style={{ fontFamily:FONTS.ui,fontSize:10,color:T.silver,marginBottom:3 }}>
                  · {q.name} <span style={{ color:T.dim }}>({q.type} · {q.diff})</span>
                </div>
              ))}
            </div>
          )}

          {/* Mode selector if existing habits */}
          {tmpl && hasExisting && (
            <div style={{ marginBottom:16 }}>
              <div style={{ fontFamily:FONTS.ui,fontSize:8,letterSpacing:2,color:T.dim,marginBottom:8 }}>YOU ALREADY HAVE HABITS —</div>
              <div style={{ display:"flex",gap:8 }}>
                {[{k:"add",l:"Add alongside existing"},{k:"replace",l:"Replace everything"}].map(m => (
                  <button key={m.k} onClick={() => setMode(m.k)} style={{ flex:1,padding:"9px 6px",background:mode===m.k?`${th.accent}15`:"transparent",border:`1px solid ${mode===m.k?th.accent:"var(--bg3)"}`,borderRadius:6,color:mode===m.k?th.accent:T.dim,fontFamily:FONTS.ui,fontSize:9,cursor:"pointer",transition:"all 0.2s" }}>
                    {m.l}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <div style={{ padding:"16px 22px",borderTop:`1px solid var(--bg3)`,display:"flex",gap:8 }}>
          <button onClick={onClose} style={{ flex:1,padding:"11px",background:"transparent",border:`1px solid var(--bg3)`,borderRadius:6,color:T.dim,fontFamily:FONTS.ui,fontSize:9,letterSpacing:2,cursor:"pointer" }}>
            CANCEL
          </button>
          <button onClick={apply} disabled={!selected} style={{ flex:2,padding:"11px",background:selected?`${th.accent}15`:"transparent",border:`1px solid ${selected?th.accent:"var(--bg3)"}`,borderRadius:6,color:selected?th.accent:T.dim,fontFamily:FONTS.ui,fontSize:9,letterSpacing:2,cursor:selected?"pointer":"not-allowed",transition:"all 0.2s" }}>
            APPLY TEMPLATE
          </button>
        </div>
      </div>
    </div>
  );
}
