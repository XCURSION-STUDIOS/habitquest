import { FONTS } from "../../constants/theme.js";
export default function GlobalCSS({ accent }) {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Mono:ital,wght@0,400;0,500&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:${FONTS.ui};}
      ::-webkit-scrollbar{width:3px;}
      ::-webkit-scrollbar-track{background:#06060f;}
      ::-webkit-scrollbar-thumb{background:#1c1c30;border-radius:2px;}
      select option{background:#0d0d1a;}
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
        0%{box-shadow:0 0 0 2px #c9a84c,0 0 14px #c9a84c25;}
        25%{box-shadow:0 0 0 2px ${accent},0 0 14px ${accent}25;}
        50%{box-shadow:0 0 0 2px #6b4fb0,0 0 14px #6b4fb025;}
        75%{box-shadow:0 0 0 2px #27a060,0 0 14px #27a06025;}
        100%{box-shadow:0 0 0 2px #c9a84c,0 0 14px #c9a84c25;}
      }
      @keyframes particleDrift{
        0%{transform:translateY(0) translateX(0);opacity:0;}
        10%{opacity:1;}
        90%{opacity:0.6;}
        100%{transform:translateY(-100vh) translateX(var(--dx));opacity:0;}
      }
    `}</style>
  );
}
