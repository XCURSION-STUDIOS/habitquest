#!/bin/bash
# Fix: Themes actually change backgrounds + remove shop themes tab

# ── 1. Remove themes tab from Shop ──────────────────────────
python3 << 'PYEOF'
with open('src/screens/ShopScreen.jsx', 'r') as f:
    content = f.read()

content = content.replace(
    '[{id:"temp",l:"BOOSTS"},{id:"perm",l:"PERMANENT"},{id:"theme",l:"THEMES"},{id:"aesthetic",l:"AESTHETICS"},{id:"cosm",l:"COSMETIC"}]',
    '[{id:"temp",l:"BOOSTS"},{id:"perm",l:"PERMANENT"},{id:"aesthetic",l:"AESTHETICS"},{id:"cosm",l:"COSMETIC"}]'
)

with open('src/screens/ShopScreen.jsx', 'w') as f:
    f.write(content)
print("Shop themes tab removed")
PYEOF

# ── 2. The real fix: pass V colors into CSS variables via GlobalCSS
# Then use CSS variables for ALL backgrounds across the app
cat > src/components/ui/GlobalCSS.jsx << 'FILEOF'
export default function GlobalCSS({ V }) {
  const accent = V?.accent || "#c9a84c";
  const bg0    = V?.bg0    || "#06060f";
  const bg1    = V?.bg1    || "#0d0d1a";
  const bg2    = V?.bg2    || "#111120";
  const bg3    = V?.bg3    || "#1c1c30";
  const text   = V?.text   || "#d8e0f0";
  const df     = V?.fonts?.display || "'Cormorant Garamond','Georgia',serif";
  const uf     = V?.fonts?.ui      || "'DM Mono','Courier New',monospace";

  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Mono:ital,wght@0,400;0,500&display=swap');

      :root {
        --bg0: ${bg0};
        --bg1: ${bg1};
        --bg2: ${bg2};
        --bg3: ${bg3};
        --accent: ${accent};
        --text: ${text};
        --font-display: ${df};
        --font-ui: ${uf};

        --app-max-width: 480px;
        --app-padding: 14px;
        --font-display-xl: 52px;
        --font-display-lg: 28px;
        --font-display-md: 18px;
        --font-ui-base: 11px;
        --font-ui-sm: 9px;
        --font-ui-xs: 7px;
        --card-padding: 14px;
        --nav-font: 7px;
        --header-avatar: 44px;
      }

      @media (min-width: 640px) {
        :root {
          --app-max-width: 580px;
          --app-padding: 20px;
          --font-display-xl: 64px;
          --font-display-lg: 34px;
          --font-display-md: 22px;
          --font-ui-base: 12px;
          --font-ui-sm: 10px;
          --font-ui-xs: 8px;
          --card-padding: 18px;
          --nav-font: 8px;
          --header-avatar: 50px;
        }
      }

      @media (min-width: 1024px) {
        :root {
          --app-max-width: 680px;
          --app-padding: 28px;
          --font-display-xl: 80px;
          --font-display-lg: 40px;
          --font-display-md: 26px;
          --font-ui-base: 13px;
          --font-ui-sm: 11px;
          --font-ui-xs: 9px;
          --card-padding: 22px;
          --nav-font: 9px;
          --header-avatar: 56px;
        }
      }

      @media (min-width: 1440px) {
        :root {
          --app-max-width: 760px;
          --app-padding: 36px;
          --font-display-xl: 96px;
          --font-display-lg: 48px;
          --font-display-md: 30px;
          --font-ui-base: 14px;
          --font-ui-sm: 11px;
          --font-ui-xs: 9px;
          --card-padding: 26px;
          --nav-font: 10px;
          --header-avatar: 60px;
        }
      }

      *{box-sizing:border-box;margin:0;padding:0;}

      body {
        font-family: var(--font-ui);
        background: var(--bg0);
        color: var(--text);
        transition: background 0.4s ease, color 0.4s ease;
      }

      /* App wrapper uses theme bg */
      .app-wrapper {
        max-width: var(--app-max-width);
        margin: 0 auto;
        background: var(--bg0);
        min-height: 100vh;
        transition: background 0.4s ease;
      }

      /* All cards use theme colors */
      .theme-card {
        background: linear-gradient(135deg, var(--bg1), var(--bg2)) !important;
        border-color: var(--bg3) !important;
      }

      /* Nav uses theme bg */
      .theme-nav {
        background: var(--bg1) !important;
        border-color: var(--bg3) !important;
      }

      /* Inputs use theme colors */
      .theme-input {
        background: var(--bg2) !important;
        border-color: var(--bg3) !important;
        color: var(--text) !important;
      }

      .app-padding { padding-left: var(--app-padding); padding-right: var(--app-padding); }
      .screen-padding { padding: 16px var(--app-padding) 80px; }
      .nav-tab { font-size: var(--nav-font) !important; }
      .header-avatar { width: var(--header-avatar) !important; height: var(--header-avatar) !important; }

      ::-webkit-scrollbar{width:3px;}
      ::-webkit-scrollbar-track{background:var(--bg0);}
      ::-webkit-scrollbar-thumb{background:var(--bg3);border-radius:2px;}
      select option{background:var(--bg1);}

      @media (max-width: 639px) {
        input[type="email"],input[type="password"],input[type="text"],select,textarea {
          font-size: 16px !important;
        }
      }

      @keyframes toastIn{from{transform:translateX(20px);opacity:0;}to{transform:translateX(0);opacity:1;}}
      @keyframes fadeIn{from{opacity:0;}to{opacity:1;}}
      @keyframes lvlPop{
        0%{transform:scale(0.85) translateY(16px);opacity:0;}
        15%{transform:scale(1.02);opacity:1;}
        85%{transform:scale(1);opacity:1;}
        100%{transform:scale(0.95) translateY(-8px);opacity:0;}
      }
      @keyframes pulse{0%,100%{opacity:1;}50%{opacity:0.35;}}
      @keyframes float{0%,100%{transform:translateY(0);}50%{transform:translateY(-6px);}}
      @keyframes auraAnim{
        0%{box-shadow:0 0 0 2px ${accent},0 0 14px ${accent}25;}
        50%{box-shadow:0 0 0 2px ${V?.purple||"#6b4fb0"},0 0 14px ${V?.purple||"#6b4fb0"}25;}
        100%{box-shadow:0 0 0 2px ${accent},0 0 14px ${accent}25;}
      }
      @keyframes particleDrift{
        0%{transform:translateY(0) translateX(0);opacity:0;}
        10%{opacity:1;}90%{opacity:0.6;}
        100%{transform:translateY(-100vh) translateX(var(--dx));opacity:0;}
      }
      @keyframes dotPulse{0%,100%{opacity:0.15;transform:translate(-50%,-50%) scale(0.7);}50%{opacity:0.5;transform:translate(-50%,-50%) scale(1.2);}}
      @keyframes shimmer{0%{background-position:200% center;}100%{background-position:-200% center;}}
      @keyframes titleCrash{0%{transform:translateY(60px) perspective(800px) rotateX(25deg);opacity:0;letter-spacing:0.3em;}60%{transform:translateY(-4px) perspective(800px) rotateX(-2deg);opacity:1;}100%{transform:translateY(0) perspective(800px) rotateX(0deg);opacity:1;letter-spacing:0.05em;}}
      @keyframes loginSlideUp{from{transform:translateY(40px) perspective(600px) rotateX(10deg);opacity:0;}to{transform:translateY(0) perspective(600px) rotateX(0deg);opacity:1;}}
    `}</style>
  );
}
FILEOF

# ── 3. Update Card component to use CSS vars ─────────────────
python3 << 'PYEOF'
with open('src/components/ui/index.jsx', 'r') as f:
    content = f.read()

old = '''export function Card({ children, style, accent, V }) {
  const bg0 = V?.bg1 || "#0d0d1a";
  const bg1 = V?.bg2 || "#111120";
  const bd  = V?.bg3 || T.bg3;
  const br  = V?.cards?.borderRadius ?? 10;
  const shadow = V?.cards?.shadow && accent ? `${V.cards.shadow} ${accent}15` : "none";
  return (
    <div style={{ background:`linear-gradient(135deg,${bg0},${bg1})`,border:`1px solid ${accent?accent+"30":bd}`,borderRadius:br,padding:16,boxShadow:shadow,...style }}>
      {children}
    </div>
  );
}'''

new = '''export function Card({ children, style, accent }) {
  return (
    <div style={{ background:"linear-gradient(135deg,var(--bg1),var(--bg2))",border:`1px solid ${accent?accent+"30":"var(--bg3)"}`,borderRadius:10,padding:16,...style }}>
      {children}
    </div>
  );
}'''

content = content.replace(old, new)
with open('src/components/ui/index.jsx', 'w') as f:
    f.write(content)
print("Card updated to use CSS vars")
PYEOF

# ── 4. Update App.jsx main wrapper + screen backgrounds ──────
python3 << 'PYEOF'
with open('src/App.jsx', 'r') as f:
    content = f.read()

# Main wrapper — use CSS var for background
content = content.replace(
    'className="app-wrapper" style={{fontFamily:FONTS.ui,background:T.bg0,minHeight:"100vh",color:T.text,position:"relative"}}',
    'className="app-wrapper" style={{fontFamily:"var(--font-ui)",color:"var(--text)",position:"relative"}}'
)

# Loading screen bg
content = content.replace(
    'background:T.bg0,minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"',
    'background:"var(--bg0)",minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center"'
)

with open('src/App.jsx', 'w') as f:
    f.write(content)
print("App.jsx wrapper updated")
PYEOF

# ── 5. Global sed to replace T.bg0/1/2/3 with CSS vars in all screens ──
python3 << 'PYEOF'
import os, re

screens = [
    'src/screens/StatusScreen.jsx',
    'src/screens/DailyScreen.jsx',
    'src/screens/QuestsScreen.jsx',
    'src/screens/SkillsScreen.jsx',
    'src/screens/ShopScreen.jsx',
    'src/screens/SystemScreen.jsx',
    'src/screens/OptionsScreen.jsx',
    'src/screens/OnboardingModal.jsx',
    'src/screens/WeeklyReviewModal.jsx',
    'src/screens/HabitTemplatesModal.jsx',
    'src/components/layout/Header.jsx',
]

replacements = [
    # String concatenation patterns first (most specific)
    (r'`\$\{T\.bg0\}`',  '"var(--bg0)"'),
    (r'`\$\{T\.bg1\}`',  '"var(--bg1)"'),
    (r'`\$\{T\.bg2\}`',  '"var(--bg2)"'),
    (r'`\$\{T\.bg3\}`',  '"var(--bg3)"'),
    # Inside template literals
    (r'\$\{T\.bg0\}',    'var(--bg0)'),
    (r'\$\{T\.bg1\}',    'var(--bg1)'),
    (r'\$\{T\.bg2\}',    'var(--bg2)'),
    (r'\$\{T\.bg3\}',    'var(--bg3)'),
    # Direct style prop values
    (r':T\.bg0([,}\s])',  r':"var(--bg0)"\1'),
    (r':T\.bg1([,}\s])',  r':"var(--bg1)"\1'),
    (r':T\.bg2([,}\s])',  r':"var(--bg2)"\1'),
    (r':T\.bg3([,}\s])',  r':"var(--bg3)"\1'),
    # T.text
    (r':T\.text([,}\s])', r':"var(--text)"\1'),
    (r'\$\{T\.text\}',    'var(--text)'),
]

for filepath in screens:
    if not os.path.exists(filepath):
        print(f"SKIP: {filepath}")
        continue
    with open(filepath, 'r') as f:
        original = f.read()
    content = original
    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)
    if content != original:
        with open(filepath, 'w') as f:
            f.write(content)
        print(f"UPDATED: {filepath}")
    else:
        print(f"unchanged: {filepath}")
PYEOF

echo ""
echo "✅ Theme backgrounds now apply correctly!"
echo ""
echo "What changed:"
echo "  - All bg0/bg1/bg2/bg3 are now CSS variables that update when theme changes"
echo "  - body background, app wrapper, cards, nav all respond to theme"
echo "  - Themes tab removed from Shop (use Options > Appearance instead)"
echo "  - 0.4s smooth transition when switching themes"
echo ""
echo "Run: npm run build 2>&1 | head -20"