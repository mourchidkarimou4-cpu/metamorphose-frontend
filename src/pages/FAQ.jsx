import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuraButton from '../components/AuraButton'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { background:#0A0A0A; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  .reveal{opacity:0;transform:translateY(20px);transition:opacity .7s ease,transform .7s ease}
  .reveal.visible{opacity:1;transform:none}
  .cat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:36px}@media(max-width:480px){.cat-grid{grid-template-columns:repeat(2,1fr)}}
`;

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
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
      fetch("/api/admin/config/public/")
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

export default function FAQPage() {
  const get = useSiteContent();
  const [open, setOpen] = useState(null);
  const [cat,  setCat]  = useState("tout");
  useReveal();

  const faqs = [
    { cat:"programme", q:get("faq_q1","À qui s'adresse Méta'Morph'Ose ?"),                            r:get("faq_r1","") },
    { cat:"programme", q:get("faq_q2","Comment se déroule l'accompagnement ?"),                       r:get("faq_r2","") },
    { cat:"programme", q:get("faq_q3","Est-ce fait pour moi si je manque de confiance ?"),            r:get("faq_r3","") },
    { cat:"programme", q:get("faq_q4","Vais-je seulement travailler mon image ?"),                    r:get("faq_r4","") },
    { cat:"logistique", q:get("faq_q5","Puis-je participer depuis un autre pays ?"),                  r:get("faq_r5","") },
    { cat:"logistique", q:get("faq_q6","Puis-je payer en plusieurs fois ?"),                          r:get("faq_r6","") },
    { cat:"logistique", q:"Est-ce que les séances sont enregistrées ?",                               r:"Oui. Les participantes au format Live ont accès aux replays des séances pour revoir les contenus à leur rythme." },
    { cat:"logistique", q:"Que se passe-t-il si je manque une séance ?",                              r:"Les replays sont disponibles. Pour le format présentiel, nous vous informons de la marche à suivre lors de votre inscription." },
    { cat:"resultats",  q:"Quels résultats puis-je espérer ?",                                         r:"Les participantes constatent une confiance renforcée, une image alignée, une meilleure affirmation de soi et plus de clarté sur leurs projets." },
    { cat:"resultats",  q:"Combien de temps pour voir des résultats ?",                               r:"Les premières transformations se font sentir dès les premières semaines. Le programme est conçu pour des résultats progressifs et durables." },
    { cat:"inscription", q:"Comment s'inscrire au programme ?",                                        r:"Remplissez le formulaire sur la page Contact et Prélia vous contactera sous 24–48h pour confirmer votre place." },
    { cat:"inscription", q:"Quand commence la prochaine vague ?",                                     r:"Les vagues sont ouvertes plusieurs fois par an. Après votre demande, Prélia vous communiquera la prochaine date disponible." },
  ].filter(f => f.q);

  const categories = [
    { id:"tout",        label:"Toutes" },
    { id:"programme",   label:"Le Programme" },
    { id:"logistique",  label:"Logistique" },
    { id:"resultats",   label:"Résultats" },
    { id:"inscription", label:"Inscription" },
  ];

  const filtered = cat === "tout" ? faqs : faqs.filter(f => f.cat === cat);

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

        <section style={{ padding:"80px 24px 0", textAlign:"center" }}>
          <p style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"14px", animation:"fadeUp .7s both" }}>FAQ</p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,5vw,3rem)", fontWeight:700, lineHeight:1.1, marginBottom:"16px", animation:"fadeUp .8s .1s both" }}>
            {get("faq_titre","Vos questions, nos réponses.")}
          </h1>
          <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:"clamp(.88rem,2vw,1rem)", color:"rgba(248,245,242,.5)", marginBottom:"48px", animation:"fadeUp .8s .2s both" }}>
            Toutes les réponses avant de prendre votre décision.
          </p>
        </section>

        <div style={{ maxWidth:"760px", margin:"0 auto", padding:"0 24px 80px" }}>

          {/* Filtres catégories */}
          <div className="cat-grid">
            {categories.map(c => (
              <button key={c.id} onClick={() => { setCat(c.id); setOpen(null); }} style={{
                padding:"10px 16px", border:`1px solid ${cat===c.id?"#C2185B":"rgba(255,255,255,.08)"}`,
                borderRadius:"3px", background:cat===c.id?"rgba(194,24,91,.1)":"transparent",
                color:cat===c.id?"#C2185B":"rgba(248,245,242,.45)",
                fontFamily:"'Montserrat'", fontSize:".68rem", fontWeight:500,
                letterSpacing:".1em", textTransform:"uppercase", cursor:"pointer", transition:"all .25s",
              }}>
                {c.label}
              </button>
            ))}
          </div>

          {/* Questions */}
          {filtered.map((f,i) => (
            <div key={i} className="reveal" style={{ borderBottom:"1px solid rgba(255,255,255,.06)", transitionDelay:`${i*.05}s` }}>
              <button onClick={() => setOpen(open===i?null:i)} style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"20px 0", background:"none", border:"none", cursor:"pointer", textAlign:"left", gap:"16px" }}>
                <span style={{ fontFamily:"'Montserrat'", fontSize:".9rem", fontWeight:500, color:open===i?"#C2185B":"rgba(248,245,242,.82)", transition:"color .3s", lineHeight:1.4 }}>{f.q}</span>
                <span style={{ color:"#C2185B", fontSize:"1.2rem", transform:open===i?"rotate(45deg)":"none", transition:"transform .35s", flexShrink:0 }}>+</span>
              </button>
              <div style={{ overflow:"hidden", maxHeight:open===i?"300px":"0", transition:"max-height .4s ease" }}>
                <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.58)", lineHeight:1.8, paddingBottom:"20px" }}>{f.r}</p>
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <p style={{ textAlign:"center", color:"rgba(248,245,242,.3)", fontStyle:"italic", padding:"40px 0" }}>Aucune question dans cette catégorie.</p>
          )}

          {/* Pas de réponse */}
          <div className="reveal" style={{ marginTop:"48px", padding:"32px", background:"rgba(201,169,106,.04)", border:"1px solid rgba(201,169,106,.12)", borderRadius:"4px", textAlign:"center" }}>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:600, marginBottom:"10px" }}>Vous ne trouvez pas votre réponse ?</p>
            <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.5)", marginBottom:"20px" }}>Contactez Prélia directement — elle répond personnellement.</p>
            <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
              <a href="https://wa.me/22901961140933" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#25D366", color:"#fff", fontFamily:"'Montserrat'", fontWeight:600, fontSize:".72rem", letterSpacing:".12em", textTransform:"uppercase", padding:"12px 24px", borderRadius:"3px", textDecoration:"none" }}>
                WhatsApp
              </a>
              <Link to="/contact" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#C2185B", color:"#fff", fontFamily:"'Montserrat'", fontWeight:600, fontSize:".72rem", letterSpacing:".12em", textTransform:"uppercase", padding:"12px 24px", borderRadius:"3px", textDecoration:"none" }}>
                Formulaire de contact
              </Link>
            </div>
          </div>
        </div>
      </div>
      <AuraButton />
    </>
  );
}
