import { useState, useEffect, useRef } from "react";
import { T, FONTS, THEMES, AESTHETICS } from "../constants/theme.js";
import { SHOP_ITEMS } from "../constants/gameData.js";
import { Card } from "../components/ui/index.jsx";

export default function ShopScreen({ game, th, buyItem, showToast, onPreview, onPreviewEnd }) {
  const [shopTab, setShopTab]       = useState("temp");
  const [previewing, setPreviewing] = useState(null);
  const [countdown, setCountdown]   = useState(0);
  const timerRef  = useRef(null);
  const countRef  = useRef(null);
  const items = SHOP_ITEMS.filter(i => i.type === shopTab);

  function startPreview(item) {
    clearTimeout(timerRef.current);
    clearInterval(countRef.current);
    onPreviewEnd();
    setPreviewing(item.id);
    setCountdown(5);
    if (item.type === "theme")     onPreview({ theme: item.theme });
    if (item.type === "aesthetic") onPreview({ aesthetic: item.aesthetic });
    if (item.type === "cosm") {
      if (item.id === "aura")    onPreview({ aura: true });
      if (item.titleVal)         onPreview({ title: item.titleVal });
    }
    countRef.current = setInterval(() => {
      setCountdown(c => { if (c <= 1) { clearInterval(countRef.current); return 0; } return c - 1; });
    }, 1000);
    timerRef.current = setTimeout(() => {
      onPreviewEnd();
      setPreviewing(null);
      setCountdown(0);
    }, 5000);
  }

  useEffect(() => () => {
    clearTimeout(timerRef.current);
    clearInterval(countRef.current);
    onPreviewEnd();
  }, []);

  return (
    <div>
      {previewing && (
        <div style={{ marginBottom:12,padding:"10px 14px",background:"#080018",border:`1px solid ${T.purple}60`,borderRadius:8,display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <span style={{ fontFamily:FONTS.ui,fontSize:9,letterSpacing:2,color:T.purple }}>PREVIEWING — REVERTS IN {countdown}s</span>
          <div style={{ display:"flex",gap:3 }}>
            {[1,2,3,4,5].map(i => (
              <div key={i} style={{ width:8,height:8,borderRadius:2,background:i<=countdown?T.purple:T.bg3,transition:"background 0.3s" }}/>
            ))}
          </div>
        </div>
      )}

      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
        <div style={{ fontFamily:FONTS.display,fontSize:13,color:T.silver }}>Spend gems on upgrades</div>
        <div style={{ fontFamily:FONTS.ui,fontSize:13,color:th.accent }}>◈ {game.gems}</div>
      </div>

      <div style={{ display:"flex",gap:5,marginBottom:12,flexWrap:"wrap" }}>
        {[{id:"temp",l:"BOOSTS"},{id:"perm",l:"PERMANENT"},{id:"theme",l:"THEMES"},{id:"aesthetic",l:"AESTHETICS"},{id:"cosm",l:"COSMETIC"}].map(t=>(
          <button key={t.id} onClick={()=>setShopTab(t.id)} style={{ flex:1,minWidth:60,padding:"7px 4px",background:shopTab===t.id?`${th.accent}15`:"transparent",border:`1px solid ${shopTab===t.id?th.accent:T.bg3}`,borderRadius:5,color:shopTab===t.id?th.accent:T.dim,fontFamily:FONTS.ui,fontSize:7,letterSpacing:1,cursor:"pointer",transition:"all 0.2s" }}>
            {t.l}
          </button>
        ))}
      </div>

      {items.map(item => {
        const owned   = game.perms?.find(p=>p.id===item.id)||(["cosm","theme","aesthetic"].includes(item.type)&&game.cosmetics?.includes(item.id));
        const active  = game.actives?.find(p=>p.id===item.id);
        const can     = game.gems >= item.cost;
        const isPrev  = previewing === item.id;
        const canPrev = ["theme","aesthetic","cosm"].includes(item.type);

        return (
          <Card key={item.id} style={{ marginBottom:10,border:`1px solid ${isPrev?T.purple+"60":owned?"#27a06030":can?T.bg3:T.bg2}`,opacity:!owned&&!can?0.5:1,transition:"border 0.3s" }}>
            <div style={{ display:"flex",gap:12,alignItems:"flex-start" }}>
              <div style={{ fontSize:20,color:th.accent,flexShrink:0,marginTop:2 }}>{item.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap" }}>
                  <span style={{ fontFamily:FONTS.display,fontSize:15,color:owned?"#40d090":T.text }}>{item.name}</span>
                  {owned&&<span style={{ fontFamily:FONTS.ui,fontSize:7,letterSpacing:2,color:"#27a060",border:"1px solid #27a06040",padding:"1px 5px",borderRadius:3 }}>OWNED</span>}
                  {active&&!owned&&<span style={{ fontFamily:FONTS.ui,fontSize:7,color:th.accent,border:`1px solid ${th.accent}40`,padding:"1px 5px",borderRadius:3 }}>×{active.left}</span>}
                  {isPrev&&<span style={{ fontFamily:FONTS.ui,fontSize:7,color:T.purple,border:`1px solid ${T.purple}40`,padding:"1px 5px",borderRadius:3 }}>PREVIEWING</span>}
                </div>
                <div style={{ fontFamily:FONTS.ui,fontSize:10,color:T.dim,lineHeight:1.6 }}>{item.desc}</div>
                {item.effect&&<div style={{ fontFamily:FONTS.ui,fontSize:9,color:th.accent,marginTop:3 }}>{item.effect}</div>}
              </div>
            </div>
            <div style={{ display:"flex",gap:8,marginTop:10 }}>
              {canPrev && !owned && (
                <button onClick={()=>startPreview(item)} style={{ flex:1,padding:"9px",background:isPrev?`${T.purple}15`:"transparent",border:`1px solid ${isPrev?T.purple:T.bg3}`,borderRadius:5,color:isPrev?T.purple:T.dim,fontFamily:FONTS.ui,fontSize:9,letterSpacing:2,cursor:"pointer",transition:"all 0.2s" }}>
                  {isPrev?`REVERTING IN ${countdown}s`:"PREVIEW 5s"}
                </button>
              )}
              {!owned && (
                <button onClick={()=>buyItem(item)} style={{ flex:2,padding:"9px",background:can?`${th.accent}10`:"transparent",border:`1px solid ${can?th.accent+"40":T.bg3}`,borderRadius:5,color:can?th.accent:T.dim,fontFamily:FONTS.ui,fontSize:9,letterSpacing:2,cursor:can?"pointer":"not-allowed",transition:"background 0.2s" }}
                  onMouseEnter={e=>{if(can)e.currentTarget.style.background=`${th.accent}20`;}}
                  onMouseLeave={e=>{if(can)e.currentTarget.style.background=`${th.accent}10`;}}>
                  {can?`◈ ${item.cost} — BUY`:`◈ ${item.cost} — NOT ENOUGH GEMS`}
                </button>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
