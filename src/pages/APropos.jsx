import { useState, useEffect } from "react";
import usePageBackground from "../hooks/usePageBackground";
import { Link } from "react-router-dom";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@1,300;1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { background:#0A0A0A; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  .reveal{opacity:0;transform:translateY(30px);transition:opacity .8s ease,transform .8s ease}
  .reveal.visible{opacity:1;transform:none}
  .story-grid{display:grid;grid-template-columns:1fr 340px;gap:64px;align-items:start}@media(max-width:900px){.story-grid{grid-template-columns:1fr !important;gap:32px}}
  .valeurs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}@media(max-width:768px){.valeurs-grid{grid-template-columns:repeat(2,1fr)}}@media(max-width:480px){.valeurs-grid{grid-template-columns:1fr}}
  @media(max-width:900px){
    .story-grid{grid-template-columns:1fr;gap:40px}
    .valeurs-grid{grid-template-columns:repeat(2,1fr)}
  }
  @media(max-width:540px){
    .valeurs-grid{grid-template-columns:1fr}
  }
`;

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function useSiteContent() {
  const [content, setContent] = useState({});
  useEffect(() => {
    let cancelled = false;
    function fetchContent() {
      fetch("https://metamorphose-backend.onrender.com/api/admin/config/public/")
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          if (cancelled) return;
          const map = {};
          if (Array.isArray(data)) data.forEach(i => { map[i.cle] = i.valeur; });
          setContent(map);
        })
        .catch(() => {
          if (cancelled) return;
          setTimeout(fetchContent, 6000);
        });
    }
    fetchContent();
    return () => { cancelled = true; };
  }, []);
  return (cle, def = "") => content[cle] || def;
}

export default function APropos() {
  usePageBackground("apropos");
  const get = useSiteContent();
  useReveal();

  const valeurs = get("valeurs_items","Authenticité:Être soi-même pleinement|Bienveillance:Évoluer dans un espace sûr|Excellence:Une expérience structurée|Empowerment:Reprendre le pouvoir|Spiritualité:Transformation profonde|Holistique:Intérieur, extérieur, action")
    .split("|").filter(Boolean).map(v => { const [t, d] = v.split(":"); return { titre:t, desc:d }; });

  const certs = get("prelia_certifications","Coach en Image certifiée|Styliste certifiée|Experte en transformation Personnelle|Oratrice & leader certifiée|Thérapeute du cœur certifiée|Coach Mind Education certifiée").split("|").filter(Boolean);

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ background:"#0A0A0A", color:"#F8F5F2", fontFamily:"'Montserrat',sans-serif", minHeight:"100vh" }}>

        <nav style={{ padding:"18px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"rgba(10,10,10,.95)", backdropFilter:"blur(20px)", zIndex:100 }}>
          <Link to="/" style={{ textDecoration:"none" }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem" }}>
              <span style={{color:"#F8F5F2"}}>Meta'</span>
              <span style={{color:"#C9A96A"}}>Morph'</span>
              <span style={{color:"#C2185B"}}>Ose</span>
            </span>
          </Link>
          <div style={{ display:"flex", gap:"16px", alignItems:"center" }}>
            <Link to="/" style={{ fontFamily:"'Montserrat'", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}>Accueil</Link>
            <Link to="/contact" style={{ fontFamily:"'Montserrat'", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", background:"#C2185B", color:"#fff", textDecoration:"none", padding:"9px 18px", borderRadius:"2px" }}>S'inscrire</Link>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ padding:"80px 24px 60px", textAlign:"center", background:"linear-gradient(180deg,#0A0A0A,#110d09)", position:"relative" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 40% at 50% 60%,rgba(201,169,106,.06),transparent 70%)" }}/>
          <div style={{ position:"relative", maxWidth:"640px", margin:"0 auto" }}>
            <p style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"14px", animation:"fadeUp .7s both" }}>À Propos</p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,6vw,3.2rem)", fontWeight:700, lineHeight:1.1, marginBottom:"20px", animation:"fadeUp .8s .1s both" }}>
              {get("prelia_titre","Une femme engagée à révéler l'essence des femmes.")}
            </h1>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.15rem", color:"rgba(248,245,242,.5)", lineHeight:1.7, animation:"fadeUp .8s .2s both" }}>
              {get("prelia_signature","Je ne crée pas des apparences. Je révèle des essences.")}
            </p>
          </div>
        </section>

        <div style={{ maxWidth:"1000px", margin:"0 auto", padding:"0 24px 80px" }}>

          {/* Storytelling */}
          <section style={{ padding:"72px 0 0" }}>
            <div className="story-grid">
              {/* Texte */}
              <div>
                <blockquote className="reveal" style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.4rem", color:"#EFC7D3", borderLeft:"2px solid #C2185B", paddingLeft:"24px", marginBottom:"36px", lineHeight:1.6 }}>
                  « {get("prelia_citation","Je sais ce que cela fait de se sentir invisible.")} »
                </blockquote>
                <p className="reveal" style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.65)", lineHeight:1.85, marginBottom:"20px" }}>
                  {get("prelia_texte1","")}
                </p>
                <p className="reveal" style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.65)", lineHeight:1.85, marginBottom:"32px" }}>
                  {get("prelia_texte2","")}
                </p>

                {/* Certifications */}
                <div className="reveal" style={{ marginBottom:"32px" }}>
                  <p style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"14px" }}>Certifications & Expertise</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                    {certs.map((c,i) => (
                      <span key={i} style={{ padding:"7px 14px", border:"1px solid rgba(201,169,106,.22)", borderRadius:"100px", fontFamily:"'Montserrat'", fontSize:".7rem", color:"rgba(201,169,106,.75)", fontWeight:500 }}>{c}</span>
                    ))}
                  </div>
                </div>

                <div className="reveal" style={{ display:"flex", gap:"14px", flexWrap:"wrap" }}>
                  <Link to="/contact" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#C2185B", color:"#fff", fontFamily:"'Montserrat'", fontWeight:600, fontSize:".75rem", letterSpacing:".15em", textTransform:"uppercase", padding:"15px 32px", borderRadius:"2px", textDecoration:"none" }}>
                    Rejoindre le programme
                  </Link>
                  <Link to="/programme" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"transparent", color:"#C9A96A", fontFamily:"'Montserrat'", fontWeight:500, fontSize:".75rem", letterSpacing:".15em", textTransform:"uppercase", padding:"14px 28px", border:"1px solid #C9A96A", borderRadius:"2px", textDecoration:"none" }}>
                    Découvrir le programme
                  </Link>
                </div>
              </div>

              {/* Photo */}
              <div className="reveal" style={{ position:"sticky", top:"90px" }}>
                <div style={{ position:"relative", paddingBottom:"130%", background:"linear-gradient(135deg,rgba(194,24,91,.1),rgba(201,169,106,.08))", border:"1px solid rgba(201,169,106,.18)", borderRadius:"4px", overflow:"hidden" }}>
                  {get("photo_prelia","") ? (
                    <img src={get("photo_prelia","")} alt="Prélia Apedo" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }}/>
                  ) : (
                    <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                      <p style={{ fontFamily:"'Montserrat'", fontSize:".65rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.3)" }}>Photo Prélia Apedo</p>
                    </div>
                  )}
                  <div style={{ position:"absolute", inset:"14px", border:"1px solid rgba(201,169,106,.08)", borderRadius:"2px", pointerEvents:"none" }}/>
                </div>
                <div style={{ textAlign:"center", marginTop:"16px" }}>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1rem", color:"#C9A96A", opacity:.85 }}>Prélia Apedo</p>
                  <p style={{ fontFamily:"'Montserrat'", fontSize:".6rem", letterSpacing:".12em", textTransform:"uppercase", color:"rgba(248,245,242,.25)", marginTop:"4px" }}>Fondatrice · White & Black · Meta'Morph'Ose</p>
                  {get("logo_white_black","") && (
                    <img src={get("logo_white_black","")} alt="White & Black" style={{ height:"20px", objectFit:"contain", opacity:.5, marginTop:"10px" }}/>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Valeurs */}
          <section style={{ padding:"72px 0 0" }}>
            <div style={{ textAlign:"center", marginBottom:"40px" }}>
              <p className="reveal" style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"12px" }}>Les Valeurs</p>
              <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:600 }}>
                {get("valeurs_titre","Une transformation portée par des valeurs fortes.")}
              </h2>
            </div>
            <div className="valeurs-grid">
              {valeurs.map((v,i) => (
                <div key={i} className="reveal" style={{ transitionDelay:`${i*.07}s`, padding:"24px 20px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.05)", borderRadius:"4px", transition:"all .35s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(201,169,106,.2)"; e.currentTarget.style.background="rgba(201,169,106,.04)"; e.currentTarget.style.transform="translateY(-3px)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,.05)"; e.currentTarget.style.background="rgba(255,255,255,.025)"; e.currentTarget.style.transform="none"; }}>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", fontWeight:600, color:"#C9A96A", marginBottom:"7px" }}>{v.titre}</h3>
                  <p style={{ fontFamily:"'Montserrat'", fontSize:".8rem", color:"rgba(248,245,242,.5)", fontWeight:300, lineHeight:1.65 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* White & Black */}
          <section className="reveal" style={{ padding:"72px 0 0" }}>
            <div style={{ padding:"48px 40px", background:"rgba(201,169,106,.04)", border:"1px solid rgba(201,169,106,.12)", borderRadius:"6px", display:"flex", gap:"40px", alignItems:"center", flexWrap:"wrap" }}>
              <div style={{ flex:1, minWidth:"200px" }}>
                {get("logo_white_black","") ? (
                  <img src={get("logo_white_black","")} alt="White & Black" style={{ height:"40px", objectFit:"contain", marginBottom:"16px" }}/>
                ) : (
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", fontWeight:600, marginBottom:"16px" }}>White & Black</p>
                )}
                <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.6)", lineHeight:1.8 }}>
                  La marque monochrome créée pour célébrer la dualité et la richesse de la féminité. Le blanc et le noir symbolisent l'équilibre entre la douceur et la puissance, la lumière et l'ombre.
                </p>
              </div>
              <div style={{ flexShrink:0 }}>
                <Link to="/programme" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"transparent", color:"#C9A96A", fontFamily:"'Montserrat'", fontWeight:500, fontSize:".72rem", letterSpacing:".15em", textTransform:"uppercase", padding:"13px 24px", border:"1px solid rgba(201,169,106,.3)", borderRadius:"2px", textDecoration:"none" }}>
                  Découvrir le programme
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  );
}
