import { useState, useEffect } from "react";
import usePageBackground from "../hooks/usePageBackground";
import { Link } from "react-router-dom";
import AuraButton from "../components/AuraButton";
import SectionCadeaux from '../components/SectionCadeaux';
import { configAPI } from '../services/api';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { background:#0A0A0A; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  @media(max-width:768px){
    .prog-grid{grid-template-columns:1fr !important}
    .semaine-grid{grid-template-columns:1fr !important}
  }
  @media(max-width:480px){
    .prog-header{padding:60px 16px 40px !important}
    .prog-content{padding:0 16px 60px !important}
  }
  @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  .reveal{opacity:0;transform:translateY(30px);transition:opacity .8s ease,transform .8s ease}
  .reveal.visible{opacity:1;transform:none}
  .prog-grid{display:grid;grid-template-columns:160px 1fr;border-radius:4px;overflow:hidden}
  .bonus-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:16px}
  .pillar-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:20px}
  .items-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px 20px}
  @media(max-width:768px){
    .prog-grid{grid-template-columns:90px 1fr}
    .pillar-grid{grid-template-columns:1fr}
    .items-grid{grid-template-columns:1fr}
    .bonus-grid{grid-template-columns:1fr}
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
      configAPI.public()
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

export default function Programme() {
  usePageBackground("programme");
  const get = useSiteContent();
  useReveal();

  const parse = (key, def) => (get(key, def)).split("|").filter(Boolean);

  const semaines = [
    { phase:"MÉTA",  label:"Sem. 1–2", color:"#C2185B", desc:"Transformation intérieure", items:parse("meta_items","Identification des croyances limitantes|Travail sur la peur du regard des autres|Développement de l'estime de soi|Introspection guidée") },
    { phase:"MORPH", label:"Sem. 3–5", color:"#C9A96A", desc:"Image et identité révélées", items:parse("morph_items","Conscience de son image personnelle|Morphologie et colorimétrie|Style vestimentaire et identité visuelle|Posture et présence") },
    { phase:"OSE",   label:"Sem. 6–8", color:"#A8C8E0", desc:"Passage à l'action",         items:parse("ose_items","Affirmation de soi et art oratoire|Posture et impact|Passage à l'action concret|Plan de transformation futur") },
  ];

  const bonuses = [
    { num:"01", titre:"Accès aux replays", desc:"Toutes les sessions enregistrées disponibles à tout moment pour revoir à votre rythme." },
    { num:"02", titre:"Club des Métamorphosées", desc:"Communauté privée de femmes ayant vécu la transformation. Soutien et inspiration continus." },
    { num:"03", titre:"Gérer efficacement son temps", desc:"La méthode Eisenhower adaptée aux femmes ambitieuses pour prioriser l'essentiel." },
    { num:"04", titre:"Trouver la passion de son cœur", desc:"Guide pour reconnecter avec ce qui vous anime profondément et clarifier votre direction." },
    { num:"05", titre:"Se présenter avec impact", desc:"Apprenez à exprimer qui vous êtes avec assurance dans toutes les situations." },
    { num:"06", titre:"Affirmations quotidiennes", desc:"Un ensemble d'affirmations puissantes pour transformer votre dialogue intérieur." },
    { num:"07", titre:"Définir ses objectifs", desc:"Structurez vos ambitions et transformez vos idées en projets concrets et mesurables." },
  ];

  const formats = [
    { code:"F1", label:"Éclosion",            prix:"65 000",  color:"#C2185B", badge:"Startup",   detail:"2 séances par semaine en ligne avec un groupe bienveillant. Groupe WhatsApp privé inclus." },
    { code:"F2", label:"Révélation",          prix:"150 000", color:"#C9A96A", badge:"Populaire", detail:"Séances individuelles en ligne avec Prélia APEDO AHONON. Suivi 100% adapté à votre situation.", featured:true },
    { code:"F3", label:"Ascension",           prix:"250 000", color:"#A8C8E0", badge:"Ambitieux", detail:"1 séance par semaine en présentiel avec un groupe. Immersion physique et collective." },
    { code:"F4", label:"MMO Signature",       prix:"350 000", color:"#D8C1A0", badge:"Prestige",  detail:"Séances individuelles en présentiel avec Prélia APEDO AHONON. L'expérience la plus complète." },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ background:"#0A0A0A", color:"#F8F5F2", fontFamily:"'Montserrat',sans-serif", minHeight:"100vh" }}>

        {/* Nav */}
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
        <section style={{ padding:"80px 24px 60px", textAlign:"center", background:"linear-gradient(180deg,#0A0A0A 0%,#110d09 100%)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 40% at 50% 50%,rgba(194,24,91,.07),transparent 70%)" }}/>
          <div style={{ position:"relative", maxWidth:"700px", margin:"0 auto" }}>
            <p style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"16px", animation:"fadeUp .7s both" }}>Le Programme</p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,6vw,3.5rem)", fontWeight:700, lineHeight:1.1, marginBottom:"20px", animation:"fadeUp .8s .1s both" }}>
              Un programme de transformation<br/>
              <em style={{ fontStyle:"italic", fontWeight:400, background:"linear-gradient(135deg,#C9A96A,#E8D5A8,#C9A96A)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmer 4s linear infinite" }}>
                complet et durable.
              </em>
            </h1>
            <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:"clamp(.9rem,2vw,1.05rem)", color:"rgba(248,245,242,.6)", lineHeight:1.8, marginBottom:"36px", animation:"fadeUp .8s .2s both" }}>
              {get("methode_titre","8 semaines pour passer de la peur à la puissance.")}
            </p>
            <div style={{ display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap", animation:"fadeUp .8s .3s both" }}>
              <Link to="/contact" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#C2185B", color:"#fff", fontFamily:"'Montserrat'", fontWeight:600, fontSize:".75rem", letterSpacing:".15em", textTransform:"uppercase", padding:"16px 36px", borderRadius:"2px", textDecoration:"none" }}>
                Rejoindre le programme
              </Link>
              <a href="#semaines" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"transparent", color:"#C9A96A", fontFamily:"'Montserrat'", fontWeight:500, fontSize:".75rem", letterSpacing:".15em", textTransform:"uppercase", padding:"15px 32px", border:"1px solid #C9A96A", borderRadius:"2px", textDecoration:"none" }}>
                Découvrir le parcours
              </a>
            </div>
          </div>
        </section>

        <div style={{ maxWidth:"1000px", margin:"0 auto", padding:"0 24px 80px" }}>

          {/* 3 Piliers */}
          <section style={{ padding:"72px 0 0" }}>
            <div style={{ textAlign:"center", marginBottom:"48px" }}>
              <p className="reveal" style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"12px" }}>La Méthode</p>
              <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:600 }}>
                {get("methode_titre","Une méthode en 3 étapes.")}
              </h2>
            </div>
            <div className="pillar-grid">
              {[
                { code:"MÉTA",  color:"#C2185B", title:get("meta_titre","Transformation intérieure"),  desc:get("meta_desc",""),  weeks:get("meta_semaines","Semaines 1–2"),  bg:"rgba(194,24,91,.06)" },
                { code:"MORPH", color:"#C9A96A", title:get("morph_titre","Image et identité révélées"), desc:get("morph_desc",""), weeks:get("morph_semaines","Semaines 3–5"), bg:"rgba(201,169,106,.06)" },
                { code:"OSE",   color:"#A8C8E0", title:get("ose_titre","Passage à l'action"),           desc:get("ose_desc",""),   weeks:get("ose_semaines","Semaines 6–8"),   bg:"rgba(168,200,224,.05)" },
              ].map((p,i) => (
                <div key={i} className="reveal" style={{ transitionDelay:`${i*.12}s`, padding:"36px 28px", background:p.bg, border:`1px solid ${p.color}20`, borderTop:`3px solid ${p.color}`, borderRadius:"4px", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", bottom:"-8px", right:"12px", fontFamily:"'Playfair Display',serif", fontSize:"5rem", fontWeight:700, color:p.color, opacity:.04, lineHeight:1 }}>{p.code}</div>
                  <p style={{ fontFamily:"'Montserrat'", fontSize:".62rem", fontWeight:600, letterSpacing:".25em", textTransform:"uppercase", color:p.color, marginBottom:"8px" }}>{p.code} · {p.weeks}</p>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", fontWeight:600, marginBottom:"12px" }}>{p.title}</h3>
                  <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.6)", lineHeight:1.75 }}>{p.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* 8 Semaines */}
          <section id="semaines" style={{ padding:"72px 0 0" }}>
            <div style={{ textAlign:"center", marginBottom:"48px" }}>
              <p className="reveal" style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"12px" }}>Le Parcours</p>
              <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:600 }}>
                {get("programme_titre","8 semaines pour vous transformer.")}
              </h2>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"4px" }}>
              {semaines.map((s,i) => (
                <div key={i} className="reveal" style={{ transitionDelay:`${i*.12}s` }}>
                  <div className="prog-grid" style={{ border:`1px solid ${s.color}20` }}>
                    <div style={{ background:s.color==="#C2185B"?"rgba(194,24,91,.12)":s.color==="#C9A96A"?"rgba(201,169,106,.12)":"rgba(168,200,224,.08)", borderRight:`2px solid ${s.color}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"24px 12px", textAlign:"center", gap:"4px" }}>
                      <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", fontWeight:600, color:s.color }}>{s.phase}</span>
                      <span style={{ fontFamily:"'Montserrat'", fontSize:".58rem", letterSpacing:".12em", textTransform:"uppercase", color:"rgba(248,245,242,.35)" }}>{s.label}</span>
                    </div>
                    <div style={{ padding:"20px 28px", background:"rgba(255,255,255,.02)" }}>
                      <p style={{ fontFamily:"'Montserrat'", fontSize:".72rem", fontWeight:500, color:s.color, letterSpacing:".1em", textTransform:"uppercase", marginBottom:"12px" }}>{s.desc}</p>
                      <div className="items-grid">
                        {s.items.map((item,j) => (
                          <div key={j} style={{ display:"flex", gap:"8px", alignItems:"flex-start", fontFamily:"'Montserrat'", fontSize:".82rem", fontWeight:300, color:"rgba(248,245,242,.7)", lineHeight:1.5 }}>
                            <span style={{ width:"4px", height:"4px", borderRadius:"50%", background:s.color, flexShrink:0, marginTop:"7px" }}/>{item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Formats */}
          <section style={{ padding:"72px 0 0" }}>
            <div style={{ textAlign:"center", marginBottom:"48px" }}>
              <p className="reveal" style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"12px" }}>Les Formats</p>
              <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:600 }}>
                {get("formules_titre","Choisissez votre formule.")}
              </h2>
            </div>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"16px" }}>
              {formats.map((f,i) => (
                <div key={i} className="reveal" style={{ transitionDelay:`${i*.1}s`, padding:"28px 24px", background:f.featured?"rgba(10,10,10,.9)":"rgba(255,255,255,.025)", border:`1px solid ${f.featured?f.color:"rgba(255,255,255,.07)"}`, borderTop:`3px solid ${f.color}`, borderRadius:"4px", position:"relative" }}>
                  {f.badge && <div style={{ position:"absolute", top:"-1px", right:"16px", background:"#C9A96A", color:"#0A0A0A", fontFamily:"'Montserrat'", fontSize:".58rem", fontWeight:700, letterSpacing:".15em", textTransform:"uppercase", padding:"4px 10px", borderRadius:"0 0 3px 3px" }}>{f.badge}</div>}
                  <p style={{ fontFamily:"'Montserrat'", fontSize:".62rem", fontWeight:600, letterSpacing:".2em", textTransform:"uppercase", color:f.color, marginBottom:"8px" }}>{f.label}</p>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.6rem", fontWeight:700, marginBottom:"12px" }}>{f.prix} <span style={{ fontFamily:"'Montserrat'", fontSize:".75rem", color:"rgba(248,245,242,.4)" }}>FCFA</span></p>
                  <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".8rem", color:"rgba(248,245,242,.55)", lineHeight:1.7, marginBottom:"20px" }}>{f.detail}</p>
                  <Link to="/contact" style={{ display:"block", textAlign:"center", padding:"12px", background:f.featured?"#C2185B":"transparent", color:f.featured?"#fff":f.color, border:`1px solid ${f.featured?"#C2185B":f.color}`, borderRadius:"3px", fontFamily:"'Montserrat'", fontWeight:600, fontSize:".7rem", letterSpacing:".1em", textTransform:"uppercase", textDecoration:"none", transition:"all .3s" }}>
                    Je m'inscris
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* 7 Bonus */}
          <section style={{ padding:"72px 0 0" }}>
            <div style={{ textAlign:"center", marginBottom:"48px" }}>
              <p className="reveal" style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"12px" }}>Exclusifs</p>
              <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:600 }}>7 Bonus inclus dans chaque formule</h2>
            </div>
            <div className="bonus-grid">
              {bonuses.map((b,i) => (
                <div key={i} className="reveal" style={{ transitionDelay:`${i*.07}s`, display:"flex", gap:"16px", padding:"20px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(201,169,106,.1)", borderRadius:"4px" }}>
                  <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.4rem", fontWeight:700, color:"rgba(201,169,106,.4)", flexShrink:0, lineHeight:1 }}>{b.num}</span>
                  <div>
                    <p style={{ fontFamily:"'Montserrat'", fontWeight:500, fontSize:".88rem", marginBottom:"5px" }}>{b.titre}</p>
                    <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".78rem", color:"rgba(248,245,242,.5)", lineHeight:1.65 }}>{b.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* CTA */}
          <section className="reveal" style={{ padding:"72px 0 0", textAlign:"center" }}>
            <div style={{ padding:"52px 36px", background:"rgba(194,24,91,.06)", border:"1px solid rgba(194,24,91,.2)", borderRadius:"6px" }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:600, marginBottom:"16px" }}>
                Votre transformation peut commencer aujourd'hui.
              </h2>
              <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.55)", marginBottom:"32px", maxWidth:"440px", margin:"0 auto 32px", lineHeight:1.75 }}>
                Choisissez votre formule et rejoignez la prochaine vague Méta'Morph'Ose.
              </p>
              <div style={{ display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap" }}>
                <Link to="/contact" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#C2185B", color:"#fff", fontFamily:"'Montserrat'", fontWeight:600, fontSize:".75rem", letterSpacing:".15em", textTransform:"uppercase", padding:"16px 36px", borderRadius:"2px", textDecoration:"none" }}>
                  Je rejoins Méta'Morph'Ose
                </Link>
                <Link to="/temoignages" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"transparent", color:"#C9A96A", fontFamily:"'Montserrat'", fontWeight:500, fontSize:".75rem", letterSpacing:".15em", textTransform:"uppercase", padding:"15px 32px", border:"1px solid #C9A96A", borderRadius:"2px", textDecoration:"none" }}>
                  Voir les témoignages
                </Link>
              </div>
            </div>
          </section>
        </div>
      </div>
      <SectionCadeaux />
      <AuraButton />
    </>
  );
}
