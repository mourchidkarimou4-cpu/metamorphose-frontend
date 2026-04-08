import { useState, useEffect } from "react";
import usePageBackground from "../hooks/usePageBackground";
import { Link } from "react-router-dom";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { background:#0A0A0A; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  .reveal{opacity:0;transform:translateY(20px);transition:opacity .7s ease,transform .7s ease}
  .reveal.visible{opacity:1;transform:none}
  .cat-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:8px;margin-bottom:36px}@media(max-width:480px){.cat-grid{grid-template-columns:repeat(2,1fr)}}

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


export default function FAQPage() {
  usePageBackground("faq");
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
    </>
  );
}
