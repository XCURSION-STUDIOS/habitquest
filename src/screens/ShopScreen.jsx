import { useState } from "react";
import { T, FONTS, THEMES, AESTHETICS } from "../constants/theme.js";
import { SHOP_ITEMS } from "../constants/gameData.js";
import { Card } from "../components/ui/index.jsx";

function AestheticPreview({ aesthetic }) {
  const p = aesthetic.preview;
  return (
    <div style={{ borderRadius:6,overflow:"hidden",border:`1px solid ${p.accent}30`,marginBottom:8 }}>
      <div style={{ background:p.bg,padding:"8px 10px",display:"flex",flexDirection:"column",gap:4 }}>
        <div style={{ background:p.card,borderRadius:4,padding:"6px 8px",border:`1px solid ${p.accent}20` }}>
          <div style={{ fontFamily:"'DM Mono',monospace",fontSize:8,color:p.accent,letterSpacing:2 }}>PREVIEW</div>
          <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:14,color:p.text,marginTop:2 }}>{aesthetic.name}</div>
          <div style={{ height:2,background:`${p.accent}30`,borderRadius:1,marginTop:4 }}>
            <div style={{ height:"100%",width:"60%",background:p.accent,borderRadius:1 }}/>
          </div>
        </div>
        <div style={{ display:"flex",gap:4 }}>
          {[40,70,55].map((w,i)=>(
            <div key={i} style={{ height:4,borderRadius:2,background:`${p.accent}${["80","40","60"][i]}`,flex:w }}/>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function ShopScreen({ game, th, buyItem, showToast }) {
  const [shopTab,setShopTab]           = useState("temp");
  const [previewAesthetic,setPreview]  = useState(null);
  const items = SHOP_ITEMS.filter(i=>i.type===shopTab);

  return (
    <div>
      <div style={{ display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12 }}>
        <div style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:13,color:T.silver }}>Spend gems on upgrades</div>
        <div style={{ fontFamily:"'DM Mono',monospace",fontSize:13,color:th.accent }}>◈ {game.gems}</div>
      </div>

      <div style={{ display:"flex",gap:5,marginBottom:12,flexWrap:"wrap" }}>
        {[{id:"temp",l:"BOOSTS"},{id:"perm",l:"PERMANENT"},{id:"theme",l:"THEMES"},{id:"aesthetic",l:"AESTHETICS"},{id:"cosm",l:"COSMETIC"}].map(t=>(
          <button key={t.id} onClick={()=>setShopTab(t.id)} style={{ flex:1,minWidth:60,padding:"7px 4px",background:shopTab===t.id?`${th.accent}15`:"transparent",border:`1px solid ${shopTab===t.id?th.accent:T.bg3}`,borderRadius:5,color:shopTab===t.id?th.accent:T.dim,fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:1,cursor:"pointer",transition:"all 0.2s" }}>
            {t.l}
          </button>
        ))}
      </div>

      {shopTab==="aesthetic"&&(
        <div style={{ fontFamily:"'DM Mono',monospace",fontSize:9,color:T.dim,lineHeight:1.6,marginBottom:12,padding:"10px 12px",background:T.bg1,border:`1px solid ${T.bg3}`,borderRadius:7 }}>
          Aesthetics change the entire look of the app — backgrounds, card styles, and colour palette. Tap "Preview" before buying.
        </div>
      )}

      {items.map(item=>{
        const owned  = game.perms?.find(p=>p.id===item.id)||(["cosm","theme","aesthetic"].includes(item.type)&&game.cosmetics?.includes(item.id));
        const active = game.actives?.find(p=>p.id===item.id);
        const can    = game.gems>=item.cost;
        const aesthetic = item.aesthetic ? AESTHETICS[item.aesthetic] : null;
        const isPreviewOpen = previewAesthetic===item.id;
        return (
          <Card key={item.id} style={{ marginBottom:10,border:`1px solid ${owned?"#27a06030":can?T.bg3:T.bg2}`,opacity:!owned&&!can?0.5:1 }}>
            <div style={{ display:"flex",gap:12,alignItems:"flex-start" }}>
              <div style={{ fontSize:20,color:th.accent,flexShrink:0,marginTop:2 }}>{item.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ display:"flex",gap:8,alignItems:"center",marginBottom:4,flexWrap:"wrap" }}>
                  <span style={{ fontFamily:"'Cormorant Garamond',serif",fontSize:15,color:owned?"#40d090":T.text }}>{item.name}</span>
                  {owned&&<span style={{ fontFamily:"'DM Mono',monospace",fontSize:7,letterSpacing:2,color:"#27a060",border:"1px solid #27a06040",padding:"1px 5px",borderRadius:3 }}>OWNED</span>}
                  {active&&!owned&&<span style={{ fontFamily:"'DM Mono',monospace",fontSize:7,color:th.accent,border:`1px solid ${th.accent}40`,padding:"1px 5px",borderRadius:3 }}>×{active.left}</span>}
                </div>
                <div style={{ fontFamily:"'DM Mono',monospace",fontSize:10,color:T.dim,lineHeight:1.6 }}>{item.desc}</div>
                {item.effect&&<div style={{ fontFamily:"'DM Mono',monospace",fontSize:9,color:th.accent,marginTop:3 }}>{item.effect}</div>}
              </div>
            </div>

            {/* Aesthetic preview toggle */}
            {aesthetic&&(
              <div style={{ marginTop:10 }}>
                <button onClick={()=>setPreview(isPreviewOpen?null:item.id)} style={{ fontFamily:"'DM Mono',monospace",fontSize:8,letterSpacing:2,padding:"5px 10px",background:"transparent",border:`1px solid ${T.bg3}`,borderRadius:4,color:T.dim,cursor:"pointer",marginBottom:isPreviewOpen?8:0 }}>
                  {isPreviewOpen?"HIDE PREVIEW":"PREVIEW"}
                </button>
                {isPreviewOpen&&<AestheticPreview aesthetic={aesthetic}/>}
              </div>
            )}

            {!owned&&(
              <button onClick={()=>buyItem(item)} style={{ marginTop:10,width:"100%",padding:"9px",background:can?`${th.accent}10`:"transparent",border:`1px solid ${can?th.accent+"40":T.bg3}`,borderRadius:5,color:can?th.accent:T.dim,fontFamily:"'DM Mono',monospace",fontSize:9,letterSpacing:2,cursor:can?"pointer":"not-allowed",transition:"background 0.2s" }}
                onMouseEnter={e=>{if(can)e.currentTarget.style.background=`${th.accent}20`;}}
                onMouseLeave={e=>{if(can)e.currentTarget.style.background=`${th.accent}10`;}}>
                {can?`◈ ${item.cost} — BUY`:`◈ ${item.cost} — NOT ENOUGH GEMS`}
              </button>
            )}
          </Card>
        );
      })}
    </div>
  );
}
