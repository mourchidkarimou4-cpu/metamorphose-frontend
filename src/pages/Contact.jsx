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
`;

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
                  { href:"{WHATSAPP_URL}", label:"+229 01 96 11 40 93" },
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
