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
