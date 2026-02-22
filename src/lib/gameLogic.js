import { XP_PER_LEVEL, CLASSES, STATS, DIFF, SKILL_TREE, QUEST_DAILY_LIMIT } from "../constants/gameData.js";

export const TODAY   = () => new Date().toISOString().split("T")[0];
export const getLevel = xp  => Math.floor(xp / XP_PER_LEVEL) + 1;
export const getXPPct = xp  => (xp % XP_PER_LEVEL) / XP_PER_LEVEL;
export const getClass = lvl => [...CLASSES].reverse().find(c => lvl >= c.min) || CLASSES[0];

// Get all unlocked node objects
export function getUnlockedNodes(unlockedIds = []) {
  const all = [];
  Object.values(SKILL_TREE).flat().forEach(n => { if (unlockedIds.includes(n.id)) all.push(n); });
  return all;
}

// Check if a node can be unlocked
export function canUnlockNode(node, unlockedIds, skillPoints) {
  if (unlockedIds.includes(node.id)) return false;
  if (skillPoints < node.cost) return false;
  if (!node.requires) return true;
  if (Array.isArray(node.requires)) return node.requires.every(r => unlockedIds.includes(r));
  return unlockedIds.includes(node.requires);
}

// Apply skill tree effects to multipliers
export function getMultipliers(game, statType = null) {
  let xm = 1, gm = 1;
  const nodes = getUnlockedNodes(game.unlockedNodes || []);

  for (const p of game.actives || []) {
    if ((p.id === "xp2" || p.id === "xp3") && p.left > 0) xm = Math.max(xm, p.val);
    if (p.id === "gem2" && p.left > 0) gm = Math.max(gm, p.val);
  }
  if (game.perms?.find(p => p.id === "pxp"))  xm += 0.08;
  if (game.perms?.find(p => p.id === "pgem")) gm += 0.10;

  // Mood
  const moodPenalty = nodes.find(n => n.effect?.type === "mood_penalty_reduction") ? 0.05 : 0.15;
  const moodBonus   = nodes.find(n => n.effect?.type === "mood_bonus_increase")?.effect?.val || 0.25;
  if (game.mood === "high") xm += moodBonus;
  if (game.mood === "low")  xm -= moodPenalty;

  // Stat-specific XP bonus from skill tree
  if (statType) {
    nodes.forEach(n => {
      if (n.effect?.type === "xp_bonus" && n.effect?.stat === statType) xm += n.effect.val;
    });
  }

  // Gem bonus from Social tree
  nodes.forEach(n => {
    if (n.effect?.type === "gem_bonus") gm += n.effect.val;
  });

  // Diplomat cross: gem double on days mood is set
  if (nodes.find(n => n.effect?.type === "mood_gem_double") && game.mood) gm *= 2;

  return { xm: Math.max(0.1, xm), gm: Math.max(0.1, gm) };
}

export function getQuestLimit(game) {
  return QUEST_DAILY_LIMIT + (game.questExtraSlots || 0);
}

export function rolloverDay(game, today) {
  let broken = 0;
  const missedNames = [];
  const daily = game.daily.map(q => {
    if (!(game.done?.[game.lastDay] || {})[q.id]) {
      broken++;
      missedNames.push(q.name);
      return { ...q, streak:0 };
    }
    return q;
  });

  const nodes       = getUnlockedNodes(game.unlockedNodes || []);
  const abyssCap    = nodes.find(n => n.effect?.type === "abyss_cap")?.effect?.val || 20;
  const newDepth    = Math.min((game.abyssDepth || 0) + broken, abyssCap);
  const prev        = game.memory || {};
  const recentActivity = [
    ...(prev.recentActivity || []),
    { date:game.lastDay, count:Object.values(game.done?.[game.lastDay]||{}).filter(Boolean).length, mood:game.mood },
  ].slice(-30);
  const totalDays      = (prev.totalDays || 0) + 1;
  const avgCompletions = recentActivity.reduce((a,r) => a+r.count, 0) / recentActivity.length;
  const statAct = {};
  game.daily.forEach(q => { if ((game.done?.[game.lastDay]||{})[q.id]) statAct[q.type] = (statAct[q.type]||0)+1; });
  const leastActive   = STATS.reduce((a,b) => (statAct[a]||0) < (statAct[b]||0) ? a : b);
  const longestStreak = Math.max(prev.longestStreak||0, ...game.daily.map(q => q.best||0));

  // Penalty message
  let penaltyMessage = null;
  if (broken > 0) {
    penaltyMessage = {
      missed: missedNames,
      broken,
      abyssChange: broken,
      date: game.lastDay,
    };
  }

  return {
    ...game,
    daily,
    lastDay: today,
    mood: null,
    briefing: null,
    briefingDate: null,
    abyssDepth: newDepth,
    abyssActive: newDepth >= 5,
    questCompletedToday: 0,
    questExtraSlots: 0,
    penaltyMessage,
    memory: { recentActivity, totalDays, avgCompletions, mostSkipped:leastActive, longestStreak },
  };
}

export function applyCompleteDaily(game, id, today) {
  const todayDone = game.done?.[today] || {};
  if (todayDone[id]) {
    const q   = game.daily.find(q => q.id === id);
    const cfg = DIFF[q.diff];
    return {
      ...game,
      xp:    Math.max(0, game.xp - cfg.xp),
      gems:  Math.max(0, game.gems - cfg.gems),
      done:  { ...game.done, [today]:{ ...todayDone, [id]:false } },
      stats: { ...game.stats, [q.type]:Math.max(1,(game.stats[q.type]||1)-1) },
      daily: game.daily.map(d => d.id===id ? { ...d, streak:Math.max(0,d.streak-1) } : d),
    };
  }

  const q           = game.daily.find(q => q.id === id);
  const cfg         = DIFF[q.diff];
  const { xm, gm } = getMultipliers(game, q.type);
  const xpE         = Math.round(cfg.xp * xm);
  const gemE        = Math.round(cfg.gems * gm);
  const newXP       = game.xp + xpE;
  const actives     = (game.actives||[])
    .map(p => (p.id==="xp2"||p.id==="xp3"||p.id==="gem2") ? { ...p, left:p.left-1 } : p)
    .filter(p => p.left > 0);

  // Skill point award on level up
  const oldLevel    = getLevel(game.xp);
  const newLevel    = getLevel(newXP);
  const newSP       = (game.skillPoints||0) + (newLevel - oldLevel);

  let sp=game.shadowProgress||0, sm=game.shadowMission;
  let shadowBonus=0, shadowGemBonus=0, clearShadow=false;
  if (sm) { sp+=1; if(sp>=sm.req.count){ shadowBonus=sm.xp; shadowGemBonus=sm.gems||0; clearShadow=true; } }

  let bossHPLeft=game.bossHPLeft, boss=game.boss, bossBonus=0, bossGemBonus=0, clearBoss=false;
  if (boss) { bossHPLeft=Math.max(0,bossHPLeft-1); if(bossHPLeft===0){ bossBonus=boss.xp; bossGemBonus=boss.gems||0; clearBoss=true; } }

  const nodes         = getUnlockedNodes(game.unlockedNodes||[]);
  const statDouble    = nodes.find(n => n.effect?.type==="stat_double" && n.effect?.stat===q.type);
  const statGain      = statDouble ? 2 : 1;
  const newAbyssDepth = Math.max(0,(game.abyssDepth||0)-1);

  return {
    ...game,
    actives,
    skillPoints: newSP,
    xp:    newXP + shadowBonus + bossBonus,
    gems:  game.gems + gemE + shadowGemBonus + bossGemBonus,
    done:  { ...game.done, [today]:{ ...(game.done[today]||{}), [id]:true } },
    stats: { ...game.stats, [q.type]:Math.min((game.stats[q.type]||1)+statGain, 100) },
    daily: game.daily.map(d => d.id===id ? { ...d, streak:d.streak+1, best:Math.max(d.best||0,d.streak+1) } : d),
    shadowMission:  clearShadow ? null : sm,
    shadowProgress: clearShadow ? 0 : sp,
    boss:       clearBoss ? null : boss,
    bossHPLeft: clearBoss ? 0 : bossHPLeft,
    abyssDepth: newAbyssDepth,
    abyssActive: newAbyssDepth >= 5,
    _events: {
      levelUp:   newLevel > oldLevel,
      newLevel,
      xpEarned:  xpE,
      gemEarned: gemE,
      boosted:   xm > 1.05,
      shadowDone: clearShadow, shadowXP: shadowBonus,
      bossDone:   clearBoss,   bossXP:   bossBonus,
      skillPointGained: newLevel > oldLevel,
    },
  };
}

export function applyCompleteQuest(game, id, today) {
  const q = game.quests.find(q => q.id===id);
  if (!q || q.done) return { game, events:{} };
  const limit = getQuestLimit(game);
  if ((game.questCompletedToday||0) >= limit) return { game, events:{ error:`Daily quest limit reached (${limit}). Buy an Extra Quest Slot in the shop.` } };

  const nodes      = getUnlockedNodes(game.unlockedNodes||[]);
  const questBonus = nodes.find(n => n.effect?.type==="quest_bonus")?.effect?.val || 0;
  const xpFinal    = Math.round(q.xp * (1 + questBonus));

  return {
    game: {
      ...game,
      xp:    game.xp + xpFinal,
      gems:  game.gems + q.gems,
      stats: { ...game.stats, [q.type]:Math.min((game.stats[q.type]||1)+3, 100) },
      quests: game.quests.map(x => x.id===id ? { ...x, done:true } : x),
      questCompletedToday: (game.questCompletedToday||0)+1,
    },
    events: { xp:xpFinal, gems:q.gems, name:q.name },
  };
}

export function applyBuyItem(game, item) {
  if (game.gems < item.cost) return { game, error:"Not enough gems." };
  if (item.type === "theme") {
    if (game.cosmetics?.includes(item.id)) return { game, error:"Already owned." };
    return { game:{ ...game, gems:game.gems-item.cost, cosmetics:[...(game.cosmetics||[]),item.id], theme:item.theme } };
  }
  if (item.type === "aesthetic") {
    if (game.cosmetics?.includes(item.id)) return { game, error:"Already owned." };
    return { game:{ ...game, gems:game.gems-item.cost, cosmetics:[...(game.cosmetics||[]),item.id], aesthetic:item.aesthetic } };
  }
  if (item.type === "cosm") {
    if (game.cosmetics?.includes(item.id)) return { game, error:"Already owned." };
    let extra = {};
    if (item.id==="aura") extra.aura=true;
    if (item.titleVal) extra.titles=[...(game.titles||[]),item.id];
    return { game:{ ...game, gems:game.gems-item.cost, cosmetics:[...(game.cosmetics||[]),item.id],...extra } };
  }
  if (item.type === "perm") {
    if (game.perms?.find(p => p.id===item.id)) return { game, error:"Already unlocked." };
    return { game:{ ...game, gems:game.gems-item.cost, perms:[...(game.perms||[]),item] } };
  }
  if (item.questSlot) {
    return { game:{ ...game, gems:game.gems-item.cost, questExtraSlots:(game.questExtraSlots||0)+1 } };
  }
  return {
    game: {
      ...game,
      gems: game.gems-item.cost,
      actives: [
        ...(game.actives||[]).filter(p => p.id!==item.id),
        { ...item, left:item.uses+((game.actives||[]).find(p=>p.id===item.id)?.left||0) },
      ],
    },
  };
}

export function applyUnlockNode(game, nodeId) {
  const allNodes = Object.values(SKILL_TREE).flat();
  const node     = allNodes.find(n => n.id===nodeId);
  if (!node) return { game, error:"Node not found." };
  if (!canUnlockNode(node, game.unlockedNodes||[], game.skillPoints||0)) return { game, error:"Cannot unlock this node yet." };
  return {
    game: {
      ...game,
      skillPoints:    (game.skillPoints||0) - node.cost,
      unlockedNodes:  [...(game.unlockedNodes||[]), nodeId],
    },
  };
}
