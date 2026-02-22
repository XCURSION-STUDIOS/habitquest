export default function GlobalCSS({ V }) {
  const accent = V?.accent || "#c9a84c";
  const bg0    = V?.bg0    || "#06060f";
  const df     = V?.fonts?.display || "'Cormorant Garamond','Georgia',serif";
  const uf     = V?.fonts?.ui      || "'DM Mono','Courier New',monospace";
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Mono:ital,wght@0,400;0,500&display=swap');
      *{box-sizing:border-box;margin:0;padding:0;}
      body{font-family:${uf};background:${bg0};}
      ::-webkit-scrollbar{width:3px;}
      ::-webkit-scrollbar-track{background:${bg0};}
      ::-webkit-scrollbar-thumb{background:${V?.bg3||"#1c1c30"};border-radius:2px;}
      select option{background:${V?.bg1||"#0d0d1a"};}
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
