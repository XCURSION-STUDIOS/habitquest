import { useState } from "react";
import { T, FONTS, THEMES } from "../constants/theme.js";
import { SKILL_TREE, STATS, STAT_COL, STAT_ICO, statColor } from "../constants/gameData.js";
import { canUnlockNode, getUnlockedNodes } from "../lib/gameLogic.js";
import { Card, SecTitle } from "../components/ui/index.jsx";

const TIER_LABELS = ["","Tier 1","Tier 2","Tier 3","Tier 4"];

function NodeCard({ node, unlocked, canUnlock, onUnlock, th }) {
  const [hov,setHov] = useState(false);
  const borderCol = unlocked ? T.success : canUnlock ? th.accent : T.bg3;
  const opacity   = unlocked ? 1 : canUnlock ? 1 : 0.45;
  return (
    <div onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)}
      style={{ padding:"10px 12px",background:unlocked?`${T.success}10`:hov&&canUnlock?`${th.accent}08`:"var(--bg2)",border:`1px solid ${borderCol}${unlocked?"60":"40"}`,borderRadius:8,transition:"all 0.2s",opacity,cursor:canUnlock&&!unlocked?"pointer":"default" }}>
      <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:4 }}>
        <span style={{ fontFamily:"var(--font-display)",fontSize:14,color:unlocked?"var(--success)":"var(--text)" }}>{node.name}</span>
        <span style={{ fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:1,color:unlocked?T.success:canUnlock?th.accent:T.dim,border:`1px solid ${unlocked?T.success+"40":canUnlock?th.accent+"40":"var(--bg3)"}`,padding:"2px 6px",borderRadius:3 }}>
          {unlocked?"UNLOCKED":`${node.cost} SP`}
        </span>
      </div>
      <div style={{ fontFamily:"var(--font-ui)",fontSize:10,color:T.silver,lineHeight:1.6,marginBottom:canUnlock&&!unlocked?8:0 }}>
        {node.desc}
      </div>
      {canUnlock&&!unlocked&&(
        <button onClick={onUnlock} style={{ width:"100%",padding:"7px",background:`${th.accent}15`,border:`1px solid ${th.accent}40`,borderRadius:5,color:th.accent,fontFamily:"var(--font-ui)",fontSize:9,letterSpacing:2,cursor:"pointer",transition:"background 0.2s" }}
          onMouseEnter={e=>e.currentTarget.style.background=`${th.accent}25`}
          onMouseLeave={e=>e.currentTarget.style.background=`${th.accent}15`}>
          UNLOCK — {node.cost} SP
        </button>
      )}
    </div>
  );
}

export default function SkillsScreen({ game, update, th, V, showToast }) {
  const [activeBranch, setActiveBranch] = useState("Physical");
  const unlocked = game.unlockedNodes||[];
  const sp       = game.skillPoints||0;

  function unlock(nodeId) {
    const allNodes = Object.values(SKILL_TREE).flat();
    const node     = allNodes.find(n=>n.id===nodeId);
    if (!node) return;
    if (!canUnlockNode(node,unlocked,sp)){ showToast("Cannot unlock this node yet.","danger"); return; }
    update(s=>({
      ...s,
      skillPoints: (s.skillPoints||0)-node.cost,
      unlockedNodes: [...(s.unlockedNodes||[]),nodeId],
    }));
    showToast(`${node.name} unlocked!`,"success");
  }

  const branchNodes = SKILL_TREE[activeBranch]||[];
  const crossNodes  = SKILL_TREE.Cross||[];

  return (
    <div>
      {/* Header */}
      <Card style={{ marginBottom:14,border:`1px solid ${T.purple}40` }}>
        <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between" }}>
          <div>
            <div style={{ fontFamily:"var(--font-display)",fontSize:18,color:T.textBright,marginBottom:4 }}>Skill Tree</div>
            <div style={{ fontFamily:"var(--font-ui)",fontSize:10,color:T.dim }}>Spend skill points to unlock specialisations. Earn 1 point per level.</div>
          </div>
          <div style={{ textAlign:"right" }}>
            <div style={{ fontFamily:"var(--font-ui)",fontSize:22,color:T.purple }}>{sp}</div>
            <div style={{ fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:2,color:T.dim }}>SKILL POINTS</div>
          </div>
        </div>
        {sp>0&&<div style={{ marginTop:10,fontFamily:"var(--font-ui)",fontSize:10,color:T.purple }}>You have {sp} unspent skill point{sp>1?"s":""}. Select a branch to spend them.</div>}
      </Card>

      {/* Branch tabs */}
      <div style={{ display:"flex",gap:5,marginBottom:14,flexWrap:"wrap" }}>
        {STATS.map(s=>{
          const branchUnlocked = SKILL_TREE[s].filter(n=>unlocked.includes(n.id)).length;
          const isActive = activeBranch===s;
          return (
            <button key={s} onClick={()=>setActiveBranch(s)} style={{ flex:1,minWidth:60,padding:"8px 4px",background:isActive?`${statColor(s, game.aesthetic)}18`:"transparent",border:`1px solid ${isActive?statColor(s, game.aesthetic):"var(--bg3)"}`,borderRadius:6,color:isActive?statColor(s, game.aesthetic):T.dim,fontFamily:"var(--font-ui)",fontSize:8,letterSpacing:1,cursor:"pointer",transition:"all 0.2s",display:"flex",flexDirection:"column",alignItems:"center",gap:2 }}>
              <span style={{ fontSize:14 }}>{STAT_ICO[s]}</span>
              <span>{s.toUpperCase()}</span>
              <span style={{ fontSize:7,color:T.dim }}>{branchUnlocked}/4</span>
            </button>
          );
        })}
      </div>

      {/* Branch nodes */}
      <div style={{ marginBottom:14 }}>
        <SecTitle col={statColor(activeBranch, game.aesthetic)}>{activeBranch} Branch</SecTitle>
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {branchNodes.map((node,i)=>{
            const isUnlocked = unlocked.includes(node.id);
            const canU       = canUnlockNode(node,unlocked,sp);
            // Draw connector line between tiers
            return (
              <div key={node.id}>
                {i>0&&(
                  <div style={{ display:"flex",justifyContent:"center",margin:"2px 0" }}>
                    <div style={{ width:1,height:16,background:unlocked.includes(branchNodes[i-1].id)?statColor(activeBranch, game.aesthetic):"var(--bg3)",transition:"background 0.3s" }}/>
                  </div>
                )}
                <div style={{ display:"flex",alignItems:"center",gap:8 }}>
                  <div style={{ fontFamily:"var(--font-ui)",fontSize:7,letterSpacing:1,color:T.dim,width:40,flexShrink:0,textAlign:"right" }}>{TIER_LABELS[node.tier]}</div>
                  <div style={{ flex:1 }}>
                    <NodeCard node={node} unlocked={isUnlocked} canUnlock={canU} onUnlock={()=>unlock(node.id)} th={th}/>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Cross-branch nodes */}
      <div>
        <SecTitle col={T.gold}>Cross-Branch Unlocks</SecTitle>
        <div style={{ fontFamily:"var(--font-ui)",fontSize:10,color:T.dim,marginBottom:12,lineHeight:1.6 }}>
          These unlock when you've invested in two different branches. They reward balanced development.
        </div>
        <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
          {crossNodes.map(node=>{
            const isUnlocked = unlocked.includes(node.id);
            const canU       = canUnlockNode(node,unlocked,sp);
            const reqLabels  = node.requires.map(r=>{
              const found = Object.values(SKILL_TREE).flat().find(n=>n.id===r);
              return found?.name||r;
            });
            return (
              <div key={node.id}>
                <div style={{ fontFamily:"var(--font-ui)",fontSize:8,color:T.dim,marginBottom:4,letterSpacing:1 }}>
                  Requires: {reqLabels.join(" + ")}
                </div>
                <NodeCard node={node} unlocked={isUnlocked} canUnlock={canU} onUnlock={()=>unlock(node.id)} th={th}/>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
