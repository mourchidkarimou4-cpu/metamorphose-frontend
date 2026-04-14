import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import usePageBackground from "../hooks/usePageBackground";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@1,300&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  @keyframes fadeUp   { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  @keyframes float    { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
  @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes orb      { 0%,100%{transform:scale(1);opacity:.08} 50%{transform:scale(1.3);opacity:.15} }
  @keyframes countdown{ from{width:100%} to{width:0%} }
`;

export default function NotFound() {
  usePageBackground("notfound");
  const navigate   = useNavigate();
  const [count, setCount] = useState(10);

  // Countdown auto-redirect vers /
  useEffect(() => {
    if (count <= 0) { navigate("/"); return; }
    const t = setTimeout(() => setCount(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count]);

  const links = [
    { label:"Accueil",       href:"/" },
    { label:"Le Programme",  href:"/programme" },
    { label:"À Propos",      href:"/a-propos" },
    { label:"Témoignages",   href:"/temoignages" },
    { label:"FAQ",           href:"/faq" },
    { label:"Contact",       href:"/contact" },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ background:"#0A0A0A", minHeight:"100vh", color:"#F8F5F2", fontFamily:"'Montserrat',sans-serif", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px", textAlign:"center", position:"relative", overflow:"hidden" }}>

        {/* Orbes */}
        <div style={{ position:"absolute", width:"600px", height:"600px", borderRadius:"50%", background:"radial-gradient(circle,rgba(194,24,91,.08),transparent 70%)", top:"50%", left:"50%", transform:"translate(-50%,-50%)", animation:"orb 8s ease-in-out infinite", pointerEvents:"none" }}/>
        <div style={{ position:"absolute", width:"300px", height:"300px", borderRadius:"50%", background:"radial-gradient(circle,rgba(201,169,106,.06),transparent 70%)", top:"10%", right:"10%", animation:"orb 10s ease-in-out infinite 2s", pointerEvents:"none" }}/>

        {/* Logo */}
        <Link to="/" style={{ textDecoration:"none", marginBottom:"48px", animation:"fadeUp .6s both" }}>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem" }}>
            <span style={{color:"#F8F5F2"}}>Meta'</span>
            <span style={{color:"#C9A96A"}}>Morph'</span>
            <span style={{color:"#C2185B"}}>Ose</span>
          </span>
        </Link>

        {/* 404 */}
        <div style={{ animation:"float 4s ease-in-out infinite", marginBottom:"24px" }}>
          <p style={{
            fontFamily:"'Playfair Display',serif",
            fontSize:"clamp(6rem,20vw,12rem)",
            fontWeight:700,
            lineHeight:1,
            background:"linear-gradient(135deg,#C9A96A,#E8D5A8,#C9A96A)",
            backgroundSize:"200% auto",
            WebkitBackgroundClip:"text",
            WebkitTextFillColor:"transparent",
            backgroundClip:"text",
            animation:"shimmer 4s linear infinite",
          }}>404</p>
        </div>

        {/* Message */}
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.4rem,4vw,2rem)", fontWeight:600, marginBottom:"12px", animation:"fadeUp .7s .2s both" }}>
          Cette page s'est transformée.
        </h1>
        <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.1rem", color:"rgba(248,245,242,.5)", marginBottom:"8px", maxWidth:"420px", lineHeight:1.7, animation:"fadeUp .7s .3s both" }}>
          La page que vous cherchez n'existe pas ou a été déplacée.
        </p>

        {/* Countdown */}
        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".72rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", marginBottom:"32px", animation:"fadeUp .7s .4s both" }}>
          Redirection dans <span style={{ color:"#C9A96A", fontWeight:600 }}>{count}</span> secondes
        </p>
        <div style={{ width:"120px", height:"2px", background:"rgba(255,255,255,.08)", borderRadius:"1px", marginBottom:"40px", overflow:"hidden", animation:"fadeUp .7s .4s both" }}>
          <div style={{ height:"100%", background:"linear-gradient(90deg,#C9A96A,#C2185B)", borderRadius:"1px", animation:`countdown ${count+1}s linear forwards` }}/>
        </div>

        {/* Boutons principaux */}
        <div style={{ display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap", marginBottom:"48px", animation:"fadeUp .7s .5s both" }}>
          <Link to="/" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#C2185B", color:"#fff", fontFamily:"'Montserrat',sans-serif", fontWeight:600, fontSize:".75rem", letterSpacing:".15em", textTransform:"uppercase", padding:"15px 32px", borderRadius:"2px", textDecoration:"none", transition:"all .3s" }}
            onMouseEnter={e=>e.currentTarget.style.background="#a01049"}
            onMouseLeave={e=>e.currentTarget.style.background="#C2185B"}>
            Retour à l'accueil
          </Link>
          <Link to="/contact" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"transparent", color:"#C9A96A", fontFamily:"'Montserrat',sans-serif", fontWeight:500, fontSize:".75rem", letterSpacing:".15em", textTransform:"uppercase", padding:"14px 28px", border:"1px solid #C9A96A", borderRadius:"2px", textDecoration:"none", transition:"all .3s" }}
            onMouseEnter={e=>{e.currentTarget.style.background="#C9A96A";e.currentTarget.style.color="#0A0A0A"}}
            onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color="#C9A96A"}}>
            Nous contacter
          </Link>
        </div>

        {/* Liens rapides */}
        <div style={{ animation:"fadeUp .7s .6s both" }}>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(248,245,242,.25)", marginBottom:"16px" }}>
            Pages disponibles
          </p>
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", justifyContent:"center" }}>
            {links.map((l,i) => (
              <Link key={i} to={l.href} style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".72rem", fontWeight:400, color:"rgba(248,245,242,.4)", textDecoration:"none", padding:"7px 14px", border:"1px solid rgba(255,255,255,.07)", borderRadius:"100px", transition:"all .3s" }}
                onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(201,169,106,.3)";e.currentTarget.style.color="#C9A96A"}}
                onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.07)";e.currentTarget.style.color="rgba(248,245,242,.4)"}}>
                {l.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Citation */}
        <p style={{ position:"absolute", bottom:"24px", fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:".88rem", color:"rgba(248,245,242,.15)", animation:"fadeUp .7s .8s both" }}>
          « Je ne crée pas des apparences. Je révèle des essences. » — Prélia AHONON
        </p>
      </div>
    </>
  );
}
