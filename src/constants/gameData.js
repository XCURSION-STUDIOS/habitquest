export const STATS   = ["Physical","Mental","Spiritual","Social","Emotional"];
export const STAT_COL = {
  Physical:"#b03030", Mental:"#2060a0",
  Spiritual:"#7060c0", Social:"#b09020", Emotional:"#208060",
};
export const STAT_ICO = {
  Physical:"⚔", Mental:"◈", Spiritual:"✦", Social:"◉", Emotional:"♦",
};

export const DIFF = {
  "F-Rank": { xp:20,  gems:2,  col:"#444"    },
  "E-Rank": { xp:40,  gems:4,  col:"#607080" },
  "D-Rank": { xp:80,  gems:7,  col:"#208060" },
  "C-Rank": { xp:140, gems:12, col:"#2060a0" },
  "B-Rank": { xp:220, gems:20, col:"#c9a84c" },
  "A-Rank": { xp:340, gems:30, col:"#b03030" },
  "S-Rank": { xp:500, gems:45, col:"#6b4fb0" },
};

export const XP_PER_LEVEL   = 400;
export const QUEST_DAILY_LIMIT = 5;
export const QUEST_EXTRA_COST  = 20; // gems to unlock one extra quest slot

export const CLASSES = [
  { min:1,   name:"Beginner",   icon:"◌" },
  { min:5,   name:"Awakened",   icon:"◈" },
  { min:10,  name:"E-Class",    icon:"◇" },
  { min:20,  name:"D-Class",    icon:"◆" },
  { min:35,  name:"C-Class",    icon:"⬡" },
  { min:50,  name:"B-Class",    icon:"✦" },
  { min:70,  name:"A-Class",    icon:"★" },
  { min:90,  name:"S-Class",    icon:"⚔" },
  { min:100, name:"Elite",      icon:"⚡" },
];

// ── Skill Tree ──────────────────────────────────────────────
// 5 branches × 4 tiers = 20 nodes
// Each node has: id, branch, tier, name, desc, effect, cost (skill points), requires (node id or null)
export const SKILL_TREE = {
  Physical: [
    { id:"ph1", tier:1, name:"Iron Body",         desc:"+10% XP from physical habits.",             effect:{ type:"xp_bonus", stat:"Physical", val:0.10 }, cost:1, requires:null },
    { id:"ph2", tier:2, name:"Endurance",          desc:"Physical streak breaks cost -1 Decay depth instead of -2.", effect:{ type:"decay_reduction", stat:"Physical" }, cost:2, requires:"ph1" },
    { id:"ph3", tier:3, name:"Peak Condition",     desc:"+20% XP from all habits on days you complete every physical task.", effect:{ type:"full_day_bonus", stat:"Physical", val:0.20 }, cost:3, requires:"ph2" },
    { id:"ph4", tier:4, name:"Elite Physique",     desc:"Physical stat gains count double permanently.", effect:{ type:"stat_double", stat:"Physical" }, cost:4, requires:"ph3" },
  ],
  Mental: [
    { id:"mn1", tier:1, name:"Sharp Focus",        desc:"+10% XP from mental habits.",               effect:{ type:"xp_bonus", stat:"Mental", val:0.10 }, cost:1, requires:null },
    { id:"mn2", tier:2, name:"Strategic Mind",     desc:"Quest XP rewards increased by 15%.",        effect:{ type:"quest_bonus", val:0.15 }, cost:2, requires:"mn1" },
    { id:"mn3", tier:3, name:"Deep Work",          desc:"Completing 3+ mental tasks in a day gives +50 bonus XP.", effect:{ type:"streak_day_bonus", stat:"Mental", count:3, val:50 }, cost:3, requires:"mn2" },
    { id:"mn4", tier:4, name:"Mastermind",         desc:"Mental stat gains count double permanently.", effect:{ type:"stat_double", stat:"Mental" }, cost:4, requires:"mn3" },
  ],
  Spiritual: [
    { id:"sp1", tier:1, name:"Inner Calm",         desc:"+10% XP from spiritual habits.",            effect:{ type:"xp_bonus", stat:"Spiritual", val:0.10 }, cost:1, requires:null },
    { id:"sp2", tier:2, name:"Mindfulness",        desc:"Low mood penalty reduced from -15% to -5% XP.", effect:{ type:"mood_penalty_reduction" }, cost:2, requires:"sp1" },
    { id:"sp3", tier:3, name:"Resilience",         desc:"Decay depth cannot exceed 10 (down from 20).", effect:{ type:"decay_cap", val:10 }, cost:3, requires:"sp2" },
    { id:"sp4", tier:4, name:"Enlightened",        desc:"Spiritual stat gains count double permanently.", effect:{ type:"stat_double", stat:"Spiritual" }, cost:4, requires:"sp3" },
  ],
  Social: [
    { id:"so1", tier:1, name:"Outgoing",           desc:"+10% XP from social habits.",               effect:{ type:"xp_bonus", stat:"Social", val:0.10 }, cost:1, requires:null },
    { id:"so2", tier:2, name:"Communicator",       desc:"+15% gem rewards across all tasks.",        effect:{ type:"gem_bonus", val:0.15 }, cost:2, requires:"so1" },
    { id:"so3", tier:3, name:"Influencer",         desc:"High mood XP bonus increased from +25% to +40%.", effect:{ type:"mood_bonus_increase", val:0.40 }, cost:3, requires:"so2" },
    { id:"so4", tier:4, name:"Leader",             desc:"Social stat gains count double permanently.", effect:{ type:"stat_double", stat:"Social" }, cost:4, requires:"so3" },
  ],
  Emotional: [
    { id:"em1", tier:1, name:"Self-Aware",         desc:"+10% XP from emotional habits.",            effect:{ type:"xp_bonus", stat:"Emotional", val:0.10 }, cost:1, requires:null },
    { id:"em2", tier:2, name:"Regulated",          desc:"Streak freeze item lasts 2 days instead of 1.", effect:{ type:"freeze_extend" }, cost:2, requires:"em1" },
    { id:"em3", tier:3, name:"Balanced",           desc:"Completing habits from 4+ different stats in one day gives +80 bonus XP.", effect:{ type:"variety_bonus", count:4, val:80 }, cost:3, requires:"em2" },
    { id:"em4", tier:4, name:"Mastery",            desc:"Emotional stat gains count double permanently.", effect:{ type:"stat_double", stat:"Emotional" }, cost:4, requires:"em3" },
  ],
  // Cross-branch unlocks (require nodes from 2 different branches)
  Cross: [
    { id:"cx1", name:"Tactician",   desc:"Unlocked Physical + Mental T2. Bonus +30 XP when you complete both a physical and mental task on the same day.", effect:{ type:"cross_bonus", stats:["Physical","Mental"], val:30 }, cost:3, requires:["ph2","mn2"], icon:"⚡" },
    { id:"cx2", name:"Sage",        desc:"Unlocked Mental + Spiritual T2. AI briefings gain additional insight based on your emotional patterns.", effect:{ type:"ai_enhanced_briefing" }, cost:3, requires:["mn2","sp2"], icon:"✦" },
    { id:"cx3", name:"Diplomat",    desc:"Unlocked Social + Emotional T2. Gem rewards doubled on days your mood is set to any value.", effect:{ type:"mood_gem_double" }, cost:3, requires:["so2","em2"], icon:"◉" },
  ],
};

export const SHOP_ITEMS = [
  { id:"xp2",  name:"XP Boost",        icon:"◈", cost:40,  type:"temp", desc:"2× XP on next 5 completions.", uses:5, val:2 },
  { id:"gem2", name:"Gem Boost",        icon:"✦", cost:35,  type:"temp", desc:"2× gems on next 5 completions.", uses:5, val:2 },
  { id:"frz",  name:"Streak Shield",    icon:"◇", cost:55,  type:"temp", desc:"Protects one streak from a missed day.", uses:1, val:1 },
  { id:"xp3",  name:"XP Surge",         icon:"⚡", cost:110, type:"temp", desc:"3× XP for next 3 completions.", uses:3, val:3 },
  { id:"xslot",name:"Extra Quest Slot", icon:"＋", cost:20,  type:"temp", desc:"Add one extra completable quest today.", uses:1, val:1, questSlot:true },
  { id:"pxp",  name:"Permanent XP+",    icon:"★", cost:250, type:"perm", desc:"+8% XP on every task, permanently.", effect:"+8% XP" },
  { id:"pgem", name:"Permanent Gem+",   icon:"⬡", cost:200, type:"perm", desc:"+10% gems every completion, permanently.", effect:"+10% Gems" },
  ...["Physical","Mental","Spiritual","Social","Emotional"].map(s => ({
    id:`p${s.toLowerCase().slice(0,4)}`,
    name:`${s} Boost`,
    icon:{ Physical:"⚔", Mental:"◈", Spiritual:"✦", Social:"◉", Emotional:"♦" }[s],
    cost:180, type:"perm",
    desc:`+20 ${s} stat ceiling.`,
    effect:`+20 ${s} Cap`, stat:s,
  })),
  { id:"th_blood", name:"Crimson Theme",   icon:"◆", cost:50,  type:"theme", desc:"Red accent theme.",    theme:"blood"  },
  { id:"th_void",  name:"Purple Theme",    icon:"⬡", cost:50,  type:"theme", desc:"Purple accent theme.", theme:"void"   },
  { id:"th_jade",  name:"Jade Theme",      icon:"✦", cost:50,  type:"theme", desc:"Green accent theme.",  theme:"jade"   },
  { id:"th_iron",  name:"Iron Theme",      icon:"◈", cost:50,  type:"theme", desc:"Grey accent theme.",   theme:"iron"   },
  { id:"th_ember", name:"Ember Theme",     icon:"🔥", cost:75,  type:"theme", desc:"Orange accent theme.", theme:"ember"  },
  { id:"th_frost", name:"Frost Theme",     icon:"❄", cost:75,  type:"theme", desc:"Blue accent theme.",   theme:"frost"  },
  { id:"th_toxic", name:"Toxic Theme",     icon:"☣", cost:75,  type:"theme", desc:"Green neon theme.",    theme:"toxic"  },
  { id:"ae_default",    name:"Standard",       icon:"◈", cost:0,   type:"aesthetic", desc:"The default HabitQuest look.", aesthetic:"default"    },
  { id:"ae_neon",       name:"Neon City",      icon:"⚡", cost:500, type:"aesthetic", desc:"Full cyberpunk aesthetic.", aesthetic:"neon"       },
  { id:"ae_parchment",  name:"Ancient Scroll", icon:"📜", cost:400, type:"aesthetic", desc:"Aged parchment aesthetic.", aesthetic:"parchment"  },
  { id:"ae_void_realm", name:"Void Realm",     icon:"🌌", cost:600, type:"aesthetic", desc:"Deep space aesthetic.",     aesthetic:"void_realm" },
  { id:"ae_blood_moon", name:"Blood Moon",     icon:"🩸", cost:550, type:"aesthetic", desc:"Gothic ceremony. Sharp edges. Ancient power.", aesthetic:"blood_moon" },
  { id:"ae_arctic",     name:"Arctic",         icon:"❄️", cost:450, type:"aesthetic", desc:"Minimal and clinical. Pure focus.",            aesthetic:"arctic"     },
  { id:"ae_gilded",     name:"Gilded",         icon:"👑", cost:700, type:"aesthetic", desc:"Opulent gold on black. Maximum prestige.",      aesthetic:"gilded"     },
  { id:"aura",    name:"Glow Effect",      icon:"⚡", cost:300, type:"cosm", desc:"Animated glow around your avatar." },
  { id:"tit_sm",  name:"Title: Shadow Monarch", icon:"◈", cost:100, type:"cosm", desc:"Equip the Shadow Monarch title.", titleVal:"Shadow Monarch" },
  { id:"tit_ar",  name:"Title: ARISE",        icon:"⚔",  cost:300,  type:"cosm", desc:"Equip the ARISE title.", titleVal:"ARISE" },
  { id:"tit_ph",  name:"Title: Phantom",       icon:"◈",  cost:250,  type:"cosm", desc:"Equip the Phantom title.", titleVal:"Phantom" },
  { id:"frm_hex", name:"Avatar: Hexagon",      icon:"⬡",  cost:200,  type:"cosm", desc:"Hexagonal avatar frame.", frameVal:"hexagon" },
  { id:"frm_dbl", name:"Avatar: Double Ring",  icon:"◎",  cost:350,  type:"cosm", desc:"Double ring avatar frame.", frameVal:"double" },
  { id:"frm_crn", name:"Avatar: Crown",        icon:"♛",  cost:500,  type:"cosm", desc:"Crown avatar frame.", frameVal:"crown" },
  { id:"xpb_pls", name:"XP Bar: Pulse",        icon:"〜", cost:300,  type:"cosm", desc:"Pulsing glow on your XP bar.", xpBarVal:"pulse" },
  { id:"xpb_spk", name:"XP Bar: Spark",        icon:"✦",  cost:400,  type:"cosm", desc:"Spark animation on your XP bar.", xpBarVal:"spark" },
];

export const DEFAULT_GAME = {
  char: { name:"", age:"", occupation:"", bio:"" },
  setup: false,
  onboardingDone: false,
  xp:0, gems:0,
  stats: { Physical:1, Mental:1, Spiritual:1, Social:1, Emotional:1 },
  skillPoints: 0,
  unlockedNodes: [],
  daily: [
    { id:1, name:"Work Out",     type:"Physical", diff:"D-Rank", streak:0, best:0 },
    { id:2, name:"Read",         type:"Mental",   diff:"D-Rank", streak:0, best:0 },
    { id:3, name:"Study / Learn",type:"Mental",   diff:"C-Rank", streak:0, best:0 },
  ],
  quests:[], done:{},
  questCompletedToday: 0,
  questExtraSlots: 0,
  perms:[], actives:[], cosmetics:[], titles:[],
  title:null, theme:"default", aesthetic:"default", aura:false,
  bonusMission:null, bonusProgress:0,
  decayDepth:0, decayActive:false,
  mood:null, lastMoodDate:null,
  lastDay: new Date().toISOString().split("T")[0],
  briefing:null, briefingDate:null,
  penaltyMessage: null,
  rivalEnabled: false,
  rival: null,
  weeklyReview: null,
  lastReviewDate: null,
  memory: {
    recentActivity:[], totalDays:0,
    avgCompletions:0, mostSkipped:null, longestStreak:0,
  },
};


export const HABIT_TEMPLATES = [
  {
    id: "student",
    name: "The Student",
    icon: "◈",
    desc: "Built for academic performance and deep learning.",
    daily: [
      { name:"Study / Deep Work",  type:"Mental",    diff:"C-Rank" },
      { name:"Read 30 Minutes",    type:"Mental",    diff:"D-Rank" },
      { name:"Review Notes",       type:"Mental",    diff:"E-Rank" },
      { name:"Morning Walk",       type:"Physical",  diff:"E-Rank" },
    ],
    quests: [
      { name:"Complete a full textbook chapter",    type:"Mental",    diff:"C-Rank" },
      { name:"Score 90%+ on a practice test",       type:"Mental",    diff:"B-Rank" },
      { name:"Build a study schedule for the week", type:"Mental",    diff:"D-Rank" },
    ],
  },
  {
    id: "athlete",
    name: "The Athlete",
    icon: "⚔",
    desc: "Physical dominance and disciplined recovery.",
    daily: [
      { name:"Train / Work Out",       type:"Physical",  diff:"C-Rank" },
      { name:"Mobility & Stretching",  type:"Physical",  diff:"E-Rank" },
      { name:"Hit Protein Goal",       type:"Physical",  diff:"D-Rank" },
      { name:"Sleep 8 Hours",          type:"Physical",  diff:"D-Rank" },
    ],
    quests: [
      { name:"Run 5K without stopping",         type:"Physical", diff:"C-Rank" },
      { name:"Complete a full week of training", type:"Physical", diff:"B-Rank" },
      { name:"Set a new personal record",        type:"Physical", diff:"A-Rank" },
    ],
  },
  {
    id: "creative",
    name: "The Creative",
    icon: "✦",
    desc: "Consistent creative output and artistic growth.",
    daily: [
      { name:"Create Something Daily",  type:"Emotional", diff:"C-Rank" },
      { name:"Consume Inspiring Work",  type:"Mental",    diff:"E-Rank" },
      { name:"Freewrite 10 Minutes",    type:"Emotional", diff:"D-Rank" },
      { name:"No Doom Scrolling",       type:"Mental",    diff:"D-Rank" },
    ],
    quests: [
      { name:"Finish a creative project end-to-end", type:"Emotional", diff:"B-Rank" },
      { name:"Share your work publicly",              type:"Social",    diff:"C-Rank" },
      { name:"Learn one new creative technique",      type:"Mental",    diff:"D-Rank" },
    ],
  },
  {
    id: "entrepreneur",
    name: "The Entrepreneur",
    icon: "⬡",
    desc: "High output, networking, and relentless execution.",
    daily: [
      { name:"Deep Work Block (2hrs)",   type:"Mental",   diff:"B-Rank" },
      { name:"Reach Out to Someone",     type:"Social",   diff:"D-Rank" },
      { name:"Review Goals & Metrics",   type:"Mental",   diff:"E-Rank" },
      { name:"Exercise",                 type:"Physical", diff:"D-Rank" },
    ],
    quests: [
      { name:"Launch or ship something",             type:"Mental",  diff:"A-Rank" },
      { name:"Have 3 meaningful conversations",      type:"Social",  diff:"C-Rank" },
      { name:"Complete a course or skill module",    type:"Mental",  diff:"C-Rank" },
    ],
  },
  {
    id: "wellness",
    name: "The Wellness Path",
    icon: "★",
    desc: "Mental health, spiritual grounding, and emotional balance.",
    daily: [
      { name:"Meditate",              type:"Spiritual", diff:"D-Rank" },
      { name:"Journal",               type:"Emotional", diff:"D-Rank" },
      { name:"Gratitude Practice",    type:"Spiritual", diff:"E-Rank" },
      { name:"Time in Nature / Walk", type:"Physical",  diff:"E-Rank" },
    ],
    quests: [
      { name:"Complete a 7-day meditation streak",  type:"Spiritual", diff:"B-Rank" },
      { name:"Have a hard conversation you've been avoiding", type:"Emotional", diff:"C-Rank" },
      { name:"Digital detox for a full day",        type:"Spiritual", diff:"C-Rank" },
    ],
  },
  {
    id: "balanced",
    name: "The Balanced Build",
    icon: "◆",
    desc: "One habit per stat. Build everything simultaneously.",
    daily: [
      { name:"Exercise",     type:"Physical",  diff:"D-Rank" },
      { name:"Read",         type:"Mental",    diff:"D-Rank" },
      { name:"Meditate",     type:"Spiritual", diff:"E-Rank" },
      { name:"Connect",      type:"Social",    diff:"E-Rank" },
      { name:"Journal",      type:"Emotional", diff:"E-Rank" },
    ],
    quests: [
      { name:"Complete a full week with all 5 habits done daily", type:"Physical",  diff:"A-Rank" },
      { name:"Reach stat 10 in your weakest area",                type:"Mental",    diff:"B-Rank" },
      { name:"Go one week without missing a single habit",        type:"Spiritual", diff:"B-Rank" },
    ],
  },
];
