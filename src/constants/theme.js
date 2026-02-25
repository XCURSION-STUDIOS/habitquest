export const FONTS = {
  display: "'Cormorant Garamond','Georgia',serif",
  ui:      "'DM Mono','Courier New',monospace",
};

// Base dark palette (used when no aesthetic active)
export const T = {
  bg0:"#06060f", bg1:"#0d0d1a", bg2:"#111120", bg3:"#1c1c30",
  gold:"#c9a84c", silver:"#7a8aaa", dim:"#3a4060",
  text:"#d8e0f0", textBright:"#eef2ff",
  danger:"#b03030", success:"#27a060", purple:"#6b4fb0",
  abyss:"#3a0000", sg:"#00cc88",
};

// Themes: each defines accent + full background palette
export const THEMES = {
  default: {
    name:"Classic Gold",
    accent:"#c9a84c", glow:"#c9a84c20", text:"#e8d090",
    bg0:"#06060f", bg1:"#0d0d1a", bg2:"#111120", bg3:"#1c1c30",
  },
  blood: {
    name:"Crimson",
    accent:"#c03030", glow:"#c0303020", text:"#e07070",
    bg0:"#0a0000", bg1:"#120004", bg2:"#180008", bg3:"#28000e",
  },
  void: {
    name:"Void Purple",
    accent:"#7b5fc0", glow:"#7b5fc020", text:"#c0a0f0",
    bg0:"#04020e", bg1:"#080418", bg2:"#0c0820", bg3:"#18102e",
  },
  jade: {
    name:"Jade",
    accent:"#20b060", glow:"#20b06020", text:"#70d8a0",
    bg0:"#020a04", bg1:"#041008", bg2:"#06160a", bg3:"#0e2414",
  },
  iron: {
    name:"Iron",
    accent:"#8a9ab8", glow:"#8a9ab820", text:"#b8c8e0",
    bg0:"#060810", bg1:"#0c1018", bg2:"#101520", bg3:"#1a2030",
  },
  ember: {
    name:"Ember",
    accent:"#e07828", glow:"#e0782820", text:"#f0a868",
    bg0:"#0a0400", bg1:"#120800", bg2:"#180c00", bg3:"#281800",
  },
  frost: {
    name:"Frost",
    accent:"#48b0e0", glow:"#48b0e020", text:"#90d0f0",
    bg0:"#00080e", bg1:"#000e18", bg2:"#001220", bg3:"#001c30",
  },
  toxic: {
    name:"Toxic",
    accent:"#88d020", glow:"#88d02020", text:"#b8f060",
    bg0:"#020800", bg1:"#040e00", bg2:"#061200", bg3:"#0e1e00",
  },
};

// Aesthetics: complete visual overhauls (override theme entirely)
export const AESTHETICS = {
  default: {
    name:"Standard",
    desc:"The default HabitQuest look.",
    cost:0,
    fonts: { display:"'Cormorant Garamond','Georgia',serif", ui:"'DM Mono','Courier New',monospace" },
    colors: null, // uses theme
    cards: { borderRadius:10, borderStyle:"1px solid", shadow:"none" },
    preview: { bg:"#06060f", card:"#0d0d1a", accent:"#c9a84c", text:"#d8e0f0", font:"serif" },
  },
  neon: {
    name:"Neon City",
    desc:"Cyberpunk streets. Neon lights. Everything glows.",
    cost:500,
    fonts: { display:"'Share Tech Mono','Courier New',monospace", ui:"'DM Mono','Courier New',monospace" },
    colors: {
      bg0:"#010008", bg1:"#04000f", bg2:"#060014", bg3:"#0c0028",
      accent:"#00ffcc", glow:"#00ffcc25", text:"#b0fff0",
      silver:"#40c0b0", dim:"#206050", textBright:"#e0fffa",
      success:"#00ff88", danger:"#ff2060", purple:"#cc00ff", sg:"#00ffcc",
    },
    cards: { borderRadius:4, borderStyle:"1px solid", shadow:"0 0 12px" },
    preview: { bg:"#010008", card:"#060014", accent:"#00ffcc", text:"#b0fff0", font:"mono" },
  },
  parchment: {
    name:"Ancient Scroll",
    desc:"Worn parchment. Aged ink. Knowledge from another age.",
    cost:400,
    fonts: { display:"'IM Fell English','Georgia',serif", ui:"'IM Fell English','Georgia',serif" },
    colors: {
      bg0:"#1a1208", bg1:"#22180a", bg2:"#2a1e0e", bg3:"#382a16",
      accent:"#c8941c", glow:"#c8941c20", text:"#e8d494",
      silver:"#a89060", dim:"#806840", textBright:"#f4e8b0",
      success:"#507830", danger:"#8b2020", purple:"#604878", sg:"#507830",
    },
    cards: { borderRadius:2, borderStyle:"1px solid", shadow:"none" },
    preview: { bg:"#1a1208", card:"#2a1e0e", accent:"#c8941c", text:"#e8d494", font:"serif" },
  },
  void_realm: {
    name:"Void Realm",
    desc:"The space between stars. Cosmic and infinite.",
    cost:600,
    fonts: { display:"'Cinzel','Georgia',serif", ui:"'Raleway','Arial',sans-serif" },
    colors: {
      bg0:"#00000a", bg1:"#02000f", bg2:"#040014", bg3:"#08001e",
      accent:"#9060ff", glow:"#9060ff30", text:"#c8b0ff",
      silver:"#7060a0", dim:"#302060", textBright:"#e8d8ff",
      success:"#4060ff", danger:"#ff3060", purple:"#c040ff", sg:"#6080ff",
    },
    cards: { borderRadius:16, borderStyle:"1px solid", shadow:"0 0 20px" },
    preview: { bg:"#00000a", card:"#040014", accent:"#9060ff", text:"#c8b0ff", font:"serif" },
  },
  blood_moon: {
    name:"Blood Moon",
    desc:"Gothic ceremony. Ancient power. The ritual begins.",
    cost:550,
    fonts: { display:"'Cinzel Decorative','Georgia',serif", ui:"'Crimson Text','Georgia',serif" },
    colors: {
      bg0:"#0a0005", bg1:"#120008", bg2:"#1a000c", bg3:"#280010",
      accent:"#cc2244", glow:"#cc224430", text:"#e8b0b8",
      silver:"#a06070", dim:"#602040", textBright:"#ffd0d8",
      success:"#806020", danger:"#ff1040", purple:"#8020a0", sg:"#cc2244",
    },
    cards: { borderRadius:0, borderStyle:"2px solid", shadow:"none" },
    preview: { bg:"#0a0005", card:"#1a000c", accent:"#cc2244", text:"#e8b0b8", font:"serif" },
  },
  arctic: {
    name:"Arctic",
    desc:"Stillness. Clarity. Nothing but the signal.",
    cost:450,
    fonts: { display:"'Raleway','Arial',sans-serif", ui:"'Raleway','Arial',sans-serif" },
    colors: {
      bg0:"#06080f", bg1:"#090c16", bg2:"#0c1020", bg3:"#141828",
      accent:"#88c8f0", glow:"#88c8f020", text:"#c8dff0",
      silver:"#6090b0", dim:"#304060", textBright:"#e8f4ff",
      success:"#40c090", danger:"#e04060", purple:"#8090e0", sg:"#40c090",
    },
    cards: { borderRadius:2, borderStyle:"1px solid", shadow:"none" },
    preview: { bg:"#06080f", card:"#0c1020", accent:"#88c8f0", text:"#c8dff0", font:"sans" },
  },
  pixel: {
    name:"Console",
    desc:"Retro terminal. Monochrome. Pure signal.",
    cost:480,
    fonts: { display:"Press Start 2P, Courier New, monospace", ui:"VT323, Courier New, monospace" },
    colors: {
      bg0:"#000000", bg1:"#080808", bg2:"#101010", bg3:"#1a1a1a",
      accent:"#ffffff", glow:"#ffffff15", text:"#cccccc",
      silver:"#888888", dim:"#444444", textBright:"#ffffff",
      success:"#aaaaaa", danger:"#ffffff", purple:"#cccccc", sg:"#ffffff",
    },
    cards: { borderRadius:0, borderStyle:"1px dashed", shadow:"none" },
    preview: { bg:"#000000", card:"#101010", accent:"#ffffff", text:"#cccccc", font:"mono" },
  },
  gilded: {
    name:"Gilded",
    desc:"Opulence. Prestige. Every detail deliberate.",
    cost:700,
    fonts: { display:"'Playfair Display','Georgia',serif", ui:"'Cormorant Garamond','Georgia',serif" },
    colors: {
      bg0:"#080600", bg1:"#100e00", bg2:"#181400", bg3:"#241e04",
      accent:"#d4a820", glow:"#d4a82030", text:"#e8d898",
      silver:"#b09040", dim:"#806820", textBright:"#fff0b0",
      success:"#608030", danger:"#c03020", purple:"#806090", sg:"#d4a820",
    },
    cards: { borderRadius:6, borderStyle:"2px solid", shadow:"0 4px 20px" },
    preview: { bg:"#080600", card:"#181400", accent:"#d4a820", text:"#e8d898", font:"serif" },
  },
};

// Get the active visual config (aesthetic overrides theme)
export function getVisuals(game) {
  const aesthetic = AESTHETICS[game.aesthetic] || AESTHETICS.default;
  const theme     = THEMES[game.theme] || THEMES.default;

  if (aesthetic.colors) {
    // Aesthetic overrides everything
    return {
      ...T,
      ...aesthetic.colors,
      accent: aesthetic.colors.accent,
      glow:   aesthetic.colors.glow,
      fonts:  aesthetic.fonts,
      cards:  aesthetic.cards,
      th: { accent: aesthetic.colors.accent, glow: aesthetic.colors.glow, text: aesthetic.colors.text, name: aesthetic.name },
    };
  }

  // No aesthetic — use theme backgrounds
  return {
    ...T,
    bg0: theme.bg0, bg1: theme.bg1, bg2: theme.bg2, bg3: theme.bg3,
    accent: theme.accent,
    glow:   theme.glow,
    fonts:  aesthetic.fonts,
    cards:  aesthetic.cards,
    th: { accent: theme.accent, glow: theme.glow, text: theme.text, name: theme.name },
  };
}
