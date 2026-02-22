import { FONTS } from "../../constants/theme.js";
const STYLES = {
  gold:   {bg:"#120e00",bd:"#c9a84c",tx:"#e8d090"},
  success:{bg:"#001a0a",bd:"#27a060",tx:"#60d090"},
  danger: {bg:"#150000",bd:"#b03030",tx:"#d06060"},
  info:   {bg:"#0a0a18",bd:"#7a8aaa",tx:"#a0b0c8"},
  system: {bg:"#001a0e",bd:"#00cc88",tx:"#00ee99"},
};
export default function Toast({ toast }) {
  if (!toast) return null;
  const s = STYLES[toast.type] || STYLES.gold;
  return (
    <div style={{ position:"fixed",top:20,right:"max(16px, calc(50vw - 340px))",zIndex:9999,maxWidth:320,padding:"12px 18px",borderRadius:8,background:s.bg,border:`1px solid ${s.bd}40`,color:s.tx,fontSize:12,fontFamily:FONTS.ui,animation:"toastIn 0.3s ease",boxShadow:`0 8px 32px ${s.bd}15`,lineHeight:1.6,whiteSpace:"pre-wrap" }}>
      {toast.msg}
    </div>
  );
}
