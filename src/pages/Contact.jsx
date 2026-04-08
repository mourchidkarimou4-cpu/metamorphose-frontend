import { useState , useEffect } from "react";
import usePageBackground from "../hooks/usePageBackground";
import { Link } from "react-router-dom";
import InscriptionForm from "../components/InscriptionForm";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Montserrat:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { background:#0A0A0A; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  .contact-grid { display:grid; grid-template-columns:1fr 420px; gap:60px; align-items:start; }@media(max-width:1024px){.contact-grid{grid-template-columns:1fr !important;gap:40px}}
  .faq-grid     { display:grid; grid-template-columns:1fr 1fr; gap:24px; }@media(max-width:768px){.faq-grid{grid-template-columns:1fr !important}}
  @media(max-width:1024px) {
    .contact-grid { grid-template-columns:1fr; gap:48px; }
    .faq-grid     { grid-template-columns:1fr; }
  }
  @media(max-width:768px) {
    .contact-grid { grid-template-columns:1fr; gap:36px; }
    .faq-grid     { grid-template-columns:1fr; }
  }

  /* ── AJOUTS DESIGN GLOBAL ── */
  @keyframes particle{0%{transform:translateY(0) rotate(0deg);opacity:.7}100%{transform:translateY(-100vh) rotate(720deg);opacity:0}}
  @keyframes shimmer-or{0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes pulse-or{0%,100%{box-shadow:0 0 20px rgba(201,169,106,.2)}50%{box-shadow:0 0 40px rgba(201,169,106,.5)}}
  @keyframes float-up{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

  /* Scrollbar signature */
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(201,169,106,.4);border-radius:2px}

  /* Hover card amélioré */
  .card-hover{transition:transform .4s cubic-bezier(0.4,0,0.2,1),box-shadow .4s cubic-bezier(0.4,0,0.2,1),border-color .4s cubic-bezier(0.4,0,0.2,1) !important}
  .card-hover:hover{transform:translateY(-10px) scale(1.02) !important;box-shadow:0 20px 60px rgba(0,0,0,.45),0 0 30px rgba(201,169,106,.07) !important}

  /* Boutons enrichis */
  .btn-p{transition:background .25s,transform .25s,box-shadow .25s !important}
  .btn-p:hover{transform:translateY(-3px) !important;box-shadow:0 14px 40px rgba(194,24,91,.38) !important}
  .btn-s{transition:all .25s !important}
  .btn-s:hover{transform:translateY(-3px) !important}

  /* Sélection texte */
  ::selection{background:rgba(194,24,91,.3);color:#F8F5F2}

  /* Gold line */
  .gold-line-anim{height:1px;background:linear-gradient(90deg,transparent,#C9A96A,transparent);opacity:.25;margin:0}
`;

// ── PARTICULES DORÉES ────────────────────────────────────────
function GoldParticles() {{
  const pts = [
    {{s:3,x:"12%",d:"0s",  du:"7s", o:.5}},
    {{s:2,x:"32%",d:"1.3s",du:"9s", o:.35}},
    {{s:4,x:"55%",d:"0.6s",du:"6s", o:.55}},
    {{s:2,x:"75%",d:"2.1s",du:"8s", o:.4}},
    {{s:3,x:"88%",d:"1s",  du:"7.5s",o:.45}},
  ];
  return (
    <>
      <BackToTop />
      <GoldCursor />
      <GoldParticles />
      <div style={{{{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}}}>
      {{pts.map((p,i) => (
        <div key={{i}} style={{{{
          position:"absolute", bottom:"-10px", left:p.x,
          width:`${{p.s}}px`, height:`${{p.s}}px`, borderRadius:"50%",
          background:`rgba(201,169,106,${{p.o}})`,
          boxShadow:`0 0 ${{p.s*2}}px rgba(201,169,106,${{p.o}})`,
          animation:`particle ${{p.du}} ${{p.d}} ease-in infinite`,
        }}}}/>
      ))}}
    </div>
  );
}}

// ── BOUTON RETOUR EN HAUT ────────────────────────────────────
function BackToTop() {{
  const [vis, setVis] = useState(false);
  useEffect(() => {{
    const fn = () => setVis(window.scrollY > 400);
    window.addEventListener("scroll", fn, {{passive:true}});
    return () => window.removeEventListener("scroll", fn);
  }}, []);
  if (!vis) return null;
  return (
    <button onClick={{()=>window.scrollTo({{top:0,behavior:"smooth"}})}}
      style={{{{
        position:"fixed", bottom:"148px", right:"16px", zIndex:148,
        width:"44px", height:"44px", borderRadius:"50%",
        background:"rgba(201,169,106,.1)", border:"1px solid rgba(201,169,106,.3)",
        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
        backdropFilter:"blur(12px)", transition:"all .3s",
      }}}}
      onMouseEnter={{e=>{{e.currentTarget.style.background="rgba(201,169,106,.22)";e.currentTarget.style.transform="translateY(-3px)"}}}}
      onMouseLeave={{e=>{{e.currentTarget.style.background="rgba(201,169,106,.1)";e.currentTarget.style.transform="none"}}}}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 12V4M4 8l4-4 4 4" stroke="#C9A96A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}}

// ── CURSEUR LUMINEUX ─────────────────────────────────────────
function GoldCursor() {{
  const [pos, setPos] = useState({{x:-200,y:-200}});
  useEffect(() => {{
    const fn = e => setPos({{x:e.clientX, y:e.clientY}});
    window.addEventListener("mousemove", fn, {{passive:true}});
    return () => window.removeEventListener("mousemove", fn);
  }}, []);
  return (
    <div style={{{{
      position:"fixed", left:pos.x-200, top:pos.y-200,
      width:"400px", height:"400px", borderRadius:"50%",
      background:"radial-gradient(circle,rgba(201,169,106,.04) 0%,transparent 70%)",
      pointerEvents:"none", zIndex:9998, transition:"left .08s linear, top .08s linear",
    }}}}/>
  );
}}


export default function Contact() {
  usePageBackground("contact");
  const [submitted, setSubmitted] = useState(false);

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ background:"#0A0A0A", minHeight:"100vh", color:"#F8F5F2", fontFamily:"'Montserrat',sans-serif" }}>

        <nav style={{ padding:"18px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <Link to="/" style={{ textDecoration:"none" }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem" }}>
              <span style={{ color:"#F8F5F2" }}>Meta'</span>
              <span style={{ color:"#C9A96A" }}>Morph'</span>
              <span style={{ color:"#C2185B" }}>Ose</span>
            </span>
          </Link>
          <Link to="/" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}>
            Retour
          </Link>
        </nav>

        <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"60px 20px" }}>

          <div style={{ textAlign:"center", marginBottom:"56px", animation:"fadeUp .7s both" }}>
            <p style={{ fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"14px" }}>Contact et Inscription</p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.8rem,5vw,3.2rem)", fontWeight:600, lineHeight:1.1, marginBottom:"20px" }}>
              Prête à commencer votre<br/>
              <em style={{ fontStyle:"italic", color:"#C9A96A" }}>transformation ?</em>
            </h1>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.05rem", color:"rgba(248,245,242,.5)", maxWidth:"480px", margin:"0 auto" }}>
              Chaque transformation commence par une décision. La décision de se choisir.
            </p>
          </div>

          <div className="contact-grid">

            {/* Infos */}
            <div style={{ animation:"fadeUp .7s .1s both" }}>
              <div style={{ marginBottom:"40px" }}>
                <p style={{ fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"16px" }}>Les 4 formules disponibles</p>
                {[
                  { label:"Live · Groupe",      prix:"65 000 FCFA",  desc:"2 séances/semaine · En ligne · Groupe",   color:"#C2185B" },
                  { label:"Live · Privé",        prix:"150 000 FCFA", desc:"Séances individuelles · En ligne",         color:"#C9A96A" },
                  { label:"Présentiel · Groupe", prix:"250 000 FCFA", desc:"1 séance/semaine · En présentiel",         color:"#A8C8E0" },
                  { label:"Présentiel · Privé",  prix:"350 000 FCFA", desc:"Individuel · En présentiel",               color:"#D8C1A0" },
                ].map((f,i) => (
                  <div key={i} style={{ display:"flex", gap:"14px", alignItems:"flex-start", padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
                    <div style={{ width:"3px", minHeight:"36px", background:f.color, borderRadius:"2px", flexShrink:0, marginTop:"2px" }}/>
                    <div style={{ flex:1 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"3px", flexWrap:"wrap", gap:"4px" }}>
                        <span style={{ fontWeight:500, fontSize:".85rem" }}>{f.label}</span>
                        <span style={{ fontWeight:600, fontSize:".8rem", color:f.color }}>{f.prix}</span>
                      </div>
                      <p style={{ fontWeight:300, fontSize:".75rem", color:"rgba(248,245,242,.4)" }}>{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div style={{ marginBottom:"36px" }}>
                <p style={{ fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"14px" }}>Toutes les formules incluent</p>
                {["8 semaines d'accompagnement","7 guides PDF bonus","Club des Métamorphosées","Exercices pratiques","Replays (format live)"].map((item,i) => (
                  <div key={i} style={{ display:"flex", gap:"10px", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.65)", marginBottom:"8px" }}>
                    <span style={{ width:"4px", height:"4px", borderRadius:"50%", background:"#C2185B", flexShrink:0, marginTop:"8px" }}/>{item}
                  </div>
                ))}
              </div>

              <div style={{ padding:"24px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(201,169,106,.12)", borderRadius:"4px", marginBottom:"28px" }}>
                <p style={{ fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"14px" }}>Contact direct</p>
                {[
                  { href:"https://wa.me/22901961140933", label:"+229 01 96 11 40 93" },
                  { href:"https://wa.me/22901593765600", label:"+229 01 59 37 65 60" },
                  { href:"mailto:whiteblackdress22@gmail.com", label:"whiteblackdress22@gmail.com" },
                ].map((c,i) => (
                  <a key={i} href={c.href} style={{ display:"block", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.65)", textDecoration:"none", marginBottom:"8px", transition:"color .3s" }}
                    onMouseEnter={e=>e.target.style.color="#C9A96A"}
                    onMouseLeave={e=>e.target.style.color="rgba(248,245,242,.65)"}>
                    {c.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Formulaire */}
            <div style={{ animation:"fadeUp .7s .2s both" }}>
              <InscriptionForm theme="dark" onSuccess={() => setSubmitted(true)} />
            </div>
          </div>

          {/* FAQ */}
          <div style={{ marginTop:"64px", padding:"40px 32px", background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.05)", borderRadius:"4px" }}>
            <p style={{ fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"20px", textAlign:"center" }}>Questions fréquentes</p>
            <div className="faq-grid">
              {[
                { q:"Quand commence la prochaine vague ?",    a:"Les vagues sont ouvertes plusieurs fois par an. Prélia vous informera après votre inscription." },
                { q:"Puis-je participer depuis l'étranger ?", a:"Oui. Le format Live est accessible depuis n'importe quel pays." },
                { q:"Puis-je payer en plusieurs fois ?",      a:"Contactez Prélia sur WhatsApp pour discuter des modalités." },
                { q:"Que se passe-t-il après l'inscription ?",a:"Prélia vous contacte sous 24–48h pour confirmer votre place." },
              ].map((f,i) => (
                <div key={i} style={{ padding:"16px 0", borderTop:"1px solid rgba(255,255,255,.05)" }}>
                  <p style={{ fontWeight:500, fontSize:".85rem", marginBottom:"8px" }}>{f.q}</p>
                  <p style={{ fontWeight:300, fontSize:".8rem", color:"rgba(248,245,242,.5)", lineHeight:1.7 }}>{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
