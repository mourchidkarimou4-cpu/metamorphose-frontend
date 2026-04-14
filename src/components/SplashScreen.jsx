import { useState, useEffect } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500&family=Cormorant+Garamond:ital,wght@1,300&display=swap');

  @keyframes fadeIn    { from{opacity:0} to{opacity:1} }
  @keyframes fadeOut   { from{opacity:1} to{opacity:0} }
  @keyframes slideUp   { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:translateY(0)} }
  @keyframes drawLine  { from{width:0} to{width:100%} }
  @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes pulse     { 0%,100%{opacity:.4} 50%{opacity:1} }
  @keyframes scaleIn   { from{transform:scale(.92);opacity:0} to{transform:scale(1);opacity:1} }

  .splash-meta  { animation: slideUp .8s .3s both; }
  .splash-morph { animation: slideUp .8s .6s both; }
  .splash-ose   { animation: slideUp .8s .9s both; }
  .splash-line  { animation: drawLine .9s 1.1s both; }
  .splash-quote { animation: slideUp .8s 1.4s both; }
  .splash-dot   { animation: pulse 1.2s 1.8s ease-in-out infinite; }
`;

export default function SplashScreen({ onDone }) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    // Démarrer la sortie après 2.8s
    const exitTimer = setTimeout(() => setExiting(true), 4200);
    // Appeler onDone après la sortie (transition 0.8s)
    const doneTimer = setTimeout(() => onDone(), 5000);
    return () => { clearTimeout(exitTimer); clearTimeout(doneTimer); };
  }, []);

  return (
    <>
      <style>{STYLES}</style>
      <div style={{
        position:"fixed", inset:0, zIndex:9999,
        background:"#0A0A0A",
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        animation: exiting ? "fadeOut .8s forwards" : "fadeIn .5s both",
        overflow:"hidden",
      }}>

        {/* Orbes décoratifs */}
        <div style={{ position:"absolute", width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle,rgba(194,24,91,.08),transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", width:"300px", height:"300px", borderRadius:"50%", background:"radial-gradient(circle,rgba(201,169,106,.06),transparent 70%)", top:"20%", right:"15%", pointerEvents:"none" }}/>

        {/* Logo principal */}
        <div style={{ position:"relative", textAlign:"center", marginBottom:"32px" }}>

          {/* Sous-titre */}
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".4em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", marginBottom:"28px", animation:"slideUp .8s .1s both" }}>
            Programme de transformation féminine
          </p>

          {/* Nom principal */}
          <div style={{ display:"flex", alignItems:"baseline", justifyContent:"center", gap:"0", lineHeight:1 }}>
            <span className="splash-meta" style={{
              fontFamily:"'Playfair Display',serif",
              fontSize:"clamp(2.8rem,8vw,5.5rem)",
              fontWeight:700,
              color:"#F8F5F2",
              letterSpacing:"-.01em",
            }}>Méta'</span>
            <span className="splash-morph" style={{
              fontFamily:"'Playfair Display',serif",
              fontSize:"clamp(2.8rem,8vw,5.5rem)",
              fontWeight:700,
              background:"linear-gradient(135deg,#C9A96A,#E8D5A8,#C9A96A)",
              backgroundSize:"200% auto",
              WebkitBackgroundClip:"text",
              WebkitTextFillColor:"transparent",
              backgroundClip:"text",
              animation:"slideUp .8s .6s both, shimmer 3s 1.2s linear infinite",
              letterSpacing:"-.01em",
            }}>Morph'</span>
            <span className="splash-ose" style={{
              fontFamily:"'Playfair Display',serif",
              fontSize:"clamp(2.8rem,8vw,5.5rem)",
              fontWeight:700,
              color:"#C2185B",
              letterSpacing:"-.01em",
            }}>Ose</span>
          </div>

          {/* Ligne dorée */}
          <div className="splash-line" style={{
            height:"1px",
            background:"linear-gradient(90deg,transparent,#C9A96A,transparent)",
            marginTop:"20px",
          }}/>
        </div>

        {/* Citation */}
        <p className="splash-quote" style={{
          fontFamily:"'Cormorant Garamond',serif",
          fontStyle:"italic",
          fontSize:"clamp(1rem,2.5vw,1.25rem)",
          color:"rgba(248,245,242,.45)",
          letterSpacing:".03em",
          textAlign:"center",
          maxWidth:"420px",
          lineHeight:1.7,
          padding:"0 24px",
        }}>
          « Je ne crée pas des apparences.<br/>Je révèle des essences. »
        </p>

        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".55rem", letterSpacing:".25em", textTransform:"uppercase", color:"rgba(201,169,106,.35)", marginTop:"12px", animation:"slideUp .8s 1.6s both" }}>
          — Prélia AHONON
        </p>

        {/* Point clignotant */}
        <div className="splash-dot" style={{
          position:"absolute",
          bottom:"48px",
          width:"6px", height:"6px",
          borderRadius:"50%",
          background:"#C9A96A",
        }}/>

        {/* Barre de progression */}
        <div style={{
          position:"absolute",
          bottom:0, left:0,
          height:"2px",
          background:"linear-gradient(90deg,transparent,#C9A96A,#C2185B,transparent)",
          animation:"drawLine 4.2s linear both",
          opacity:.6,
        }}/>
      </div>
    </>
  );
}
