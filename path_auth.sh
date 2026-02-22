#!/bin/bash
# Patch: Responsive design for mobile, tablet, and desktop

python3 << 'PYEOF'
import re

# ── App.jsx: widen max-width and add responsive padding ──────
with open('src/App.jsx', 'r') as f:
    content = f.read()

content = content.replace(
    'style={{fontFamily:FONTS.ui,background:T.bg0,minHeight:"100vh",color:T.text,maxWidth:480,margin:"0 auto",position:"relative"}}',
    'style={{fontFamily:FONTS.ui,background:T.bg0,minHeight:"100vh",color:T.text,maxWidth:"var(--app-max-width, 600px)",margin:"0 auto",position:"relative"}}'
)

with open('src/App.jsx', 'w') as f:
    f.write(content)
print("App.jsx patched")
PYEOF

# ── GlobalCSS: add responsive CSS variables + breakpoints ────
cat > src/components/ui/GlobalCSS.jsx << 'FILEOF'
export default function GlobalCSS({ V }) {
  const accent = V?.accent || "#c9a84c";
  const bg0    = V?.bg0    || "#06060f";
  const df     = V?.fonts?.display || "'Cormorant Garamond','Georgia',serif";
  const uf     = V?.fonts?.ui      || "'DM Mono','Courier New',monospace";
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Mono:ital,wght@0,400;0,500&display=swap');

      /* ── Responsive layout variables ── */
      :root {
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

      /* Tablet (640px+) */
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

      /* Desktop (1024px+) */
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

      /* Wide desktop (1440px+) */
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
      body{font-family:${uf};background:${bg0};}
      ::-webkit-scrollbar{width:3px;}
      ::-webkit-scrollbar-track{background:${bg0};}
      ::-webkit-scrollbar-thumb{background:${V?.bg3||"#1c1c30"};border-radius:2px;}
      select option{background:${V?.bg1||"#0d0d1a"};}

      /* Responsive app wrapper */
      .app-wrapper {
        max-width: var(--app-max-width);
        margin: 0 auto;
      }
      .app-padding {
        padding-left: var(--app-padding);
        padding-right: var(--app-padding);
      }
      .screen-padding {
        padding: 16px var(--app-padding) 80px;
      }

      /* Responsive nav */
      .nav-tab {
        font-size: var(--nav-font) !important;
      }

      /* Responsive cards */
      .r-card {
        padding: var(--card-padding) !important;
      }

      /* Responsive header avatar */
      .header-avatar {
        width: var(--header-avatar) !important;
        height: var(--header-avatar) !important;
      }

      /* Touch targets - minimum 44px on mobile */
      @media (max-width: 639px) {
        button { min-height: 36px; }
        input, select, textarea { min-height: 44px; font-size: 16px !important; }
      }

      /* Prevent iOS zoom on input focus */
      @media (max-width: 639px) {
        input[type="email"],
        input[type="password"],
        input[type="text"],
        select,
        textarea {
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
    `}</style>
  );
}
FILEOF

# ── Patch App.jsx to use CSS classes for layout ──────────────
python3 << 'PYEOF'
with open('src/App.jsx', 'r') as f:
    content = f.read()

# Update main wrapper to use CSS variable
content = content.replace(
    'style={{fontFamily:FONTS.ui,background:T.bg0,minHeight:"100vh",color:T.text,maxWidth:"var(--app-max-width, 600px)",margin:"0 auto",position:"relative"}}',
    'className="app-wrapper" style={{fontFamily:FONTS.ui,background:T.bg0,minHeight:"100vh",color:T.text,position:"relative"}}'
)

# Update screen content padding
content = content.replace(
    'style={{padding:"16px 16px 60px"}}',
    'className="screen-padding"'
)

# Update header+mission bar padding
content = content.replace(
    'style={{padding:"0 16px"}}',
    'className="app-padding" style={{paddingTop:0,paddingBottom:0}}'
)

with open('src/App.jsx', 'w') as f:
    f.write(content)
print("App.jsx layout classes applied")
PYEOF

# ── Patch Header to use responsive sizing ────────────────────
python3 << 'PYEOF'
with open('src/components/layout/Header.jsx', 'r') as f:
    content = f.read()

# Avatar size
content = content.replace(
    'style={{ width:48,height:48,borderRadius:"50%"',
    'className="header-avatar" style={{ borderRadius:"50%"'
)

# Nav font size
content = content.replace(
    'fontSize:8,letterSpacing:1,background:"none",border:"none"',
    'fontSize:"var(--nav-font)",letterSpacing:1,background:"none",border:"none"'
)

with open('src/components/layout/Header.jsx', 'w') as f:
    f.write(content)
print("Header patched")
PYEOF

# ── Patch AuthScreen for responsive login card ───────────────
python3 << 'PYEOF'
with open('src/screens/AuthScreen.jsx', 'r') as f:
    content = f.read()

# Make login card responsive
content = content.replace(
    'style={{ maxWidth:380,width:"100%"',
    'style={{ maxWidth:"min(380px, 90vw)",width:"100%"'
)

# Responsive title font
content = content.replace(
    'fontSize:72,color:accent,lineHeight:0.9',
    'fontSize:"clamp(48px, 10vw, 88px)",color:accent,lineHeight:0.9'
)

with open('src/screens/AuthScreen.jsx', 'w') as f:
    f.write(content)
print("AuthScreen patched")
PYEOF

# ── Patch Toast position for wider screens ───────────────────
python3 << 'PYEOF'
with open('src/components/ui/Toast.jsx', 'r') as f:
    content = f.read()

content = content.replace(
    'position:"fixed",top:20,right:16,zIndex:9999,maxWidth:300',
    'position:"fixed",top:20,right:"max(16px, calc(50vw - 340px))",zIndex:9999,maxWidth:320'
)

with open('src/components/ui/Toast.jsx', 'w') as f:
    f.write(content)
print("Toast patched")
PYEOF

echo ""
echo "✅ Responsive design applied!"
echo ""
echo "Breakpoints:"
echo "  Mobile  (<640px):  480px wide, compact spacing"
echo "  Tablet  (640px+):  580px wide, medium spacing"  
echo "  Desktop (1024px+): 680px wide, generous spacing"
echo "  Wide    (1440px+): 760px wide, maximum spacing"
echo ""
echo "Also fixed: iOS zoom on input focus (font-size 16px)"
echo ""
echo "Run: npm run dev -- --host 0.0.0.0"