export const T = {
  bg0:"#06060f", bg1:"#0d0d1a", bg2:"#111120", bg3:"#1c1c30",
  gold:"#c9a84c", silver:"#7a8aaa", dim:"#3a4060",
  text:"#d8e0f0", textBright:"#eef2ff",
  danger:"#b03030", success:"#27a060", purple:"#6b4fb0",
  abyss:"#3a0000", sg:"#00cc88",
};

export const FONTS = {
  display: "'Cormorant Garamond','Georgia',serif",
  ui:      "'DM Mono','Courier New',monospace",
};

export const THEMES = {
  default: { accent:"#c9a84c", glow:"#c9a84c20", text:"#e8d090", name:"Classic Gold" },
  blood:   { accent:"#b03030", glow:"#b0303020", text:"#e07070", name:"Crimson"       },
  void:    { accent:"#6b4fb0", glow:"#6b4fb020", text:"#b090e0", name:"Void Purple"   },
  jade:    { accent:"#20a060", glow:"#20a06020", text:"#70d0a0", name:"Jade"          },
  iron:    { accent:"#7a8aaa", glow:"#7a8aaa20", text:"#b0c0d8", name:"Iron"          },
  ember:   { accent:"#e07020", glow:"#e0702020", text:"#f0a060", name:"Ember"         },
  frost:   { accent:"#40a0d0", glow:"#40a0d020", text:"#80c8e8", name:"Frost"         },
  toxic:   { accent:"#80c020", glow:"#80c02020", text:"#b0e060", name:"Toxic"         },
};

export const AESTHETICS = {
  default: {
    name: "Standard",
    desc: "Clean dark interface with gold accents.",
    cost: 0,
    preview: { bg:"#06060f", card:"#0d0d1a", accent:"#c9a84c", text:"#d8e0f0" },
  },
  neon: {
    name: "Neon City",
    desc: "Cyberpunk-inspired neon glow aesthetic.",
    cost: 500,
    preview: { bg:"#020010", card:"#080018", accent:"#00ffcc", text:"#c0f0ff" },
    overrides: {
      bg0:"#020010", bg1:"#080018", bg2:"#0a0020", bg3:"#140030",
      accent:"#00ffcc", glow:"#00ffcc20", text:"#c0f0ff",
    },
  },
  parchment: {
    name: "Ancient Scroll",
    desc: "Worn parchment and aged ink. Old-world feel.",
    cost: 400,
    preview: { bg:"#1a1408", card:"#231c0e", accent:"#c8a040", text:"#e8d8a0" },
    overrides: {
      bg0:"#1a1408", bg1:"#231c0e", bg2:"#2a2210", bg3:"#362c18",
      accent:"#c8a040", glow:"#c8a04020", text:"#e8d8a0",
    },
  },
  void_realm: {
    name: "Void Realm",
    desc: "Deep space aesthetic with cosmic accents.",
    cost: 600,
    preview: { bg:"#00000f", card:"#05050f", accent:"#8060ff", text:"#c0b0ff" },
    overrides: {
      bg0:"#00000f", bg1:"#05050f", bg2:"#080818", bg3:"#10102a",
      accent:"#8060ff", glow:"#8060ff20", text:"#c0b0ff",
    },
  },
};
