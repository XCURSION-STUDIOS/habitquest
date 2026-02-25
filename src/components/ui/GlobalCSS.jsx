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
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Mono:ital,wght@0,400;0,500&family=Share+Tech+Mono&family=Cinzel:wght@400;600&family=Cinzel+Decorative:wght@400;700&family=Raleway:wght@300;400;500&family=IM+Fell+English:ital@0;1&family=Crimson+Text:ital,wght@0,400;0,600;1,400&family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Press+Start+2P&family=VT323&display=swap');

      :root {
        --bg0: ${bg0};
        --bg1: ${bg1};
        --bg2: ${bg2};
        --bg3: ${bg3};
        --accent: ${accent};
        --text: ${text};
        --font-display: ${df};
        --font-ui: ${uf};

        --success: ${V?.success || "#27a060"};
        --danger:  ${V?.danger  || "#b03030"};
        --purple:  ${V?.purple  || "#6b4fb0"};
        --dim:     ${V?.dim     || "#3a4060"};
        --silver:  ${V?.silver  || "#7a8aaa"};
        --card-radius: ${V?.cards?.borderRadius ?? 10}px;
        --card-shadow: ${(V?.cards?.shadow && V.cards.shadow !== "none") ? V.cards.shadow + " " + (V?.glow || "#c9a84c20") : "none"};
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
