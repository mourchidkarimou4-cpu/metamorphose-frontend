import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { donAPI } from "../services/api";

const MONTANTS = [10000, 25000, 42000, 65000, 150000, 350000];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --noir:#0A0A0A; --or:#C9A96A; --or-light:#E8D5A8;
    --rose:#C2185B; --blanc:#F8F5F2;
    --ff-t:'Playfair Display',Georgia,serif;
    --ff-b:'Montserrat',sans-serif;
    --ff-a:'Cormorant Garamond',Georgia,serif;
  }
  html { scroll-behavior:smooth; }
  body { background:var(--noir); color:var(--blanc); font-family:var(--ff-b); font-weight:300; line-height:1.7; overflow-x:hidden; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  .reveal { opacity:0; transform:translateY(30px); transition:opacity .8s ease,transform .8s ease; }
  .reveal.visible { opacity:1; transform:none; }
  @media(max-width:768px) {
    .form-grid { grid-template-columns:1fr !important; }
    .impact-grid { grid-template-columns:1fr !important; }
  }
  .montant-btn { padding:14px 20px; border:1px solid rgba(201,169,106,.2); border-radius:3px; background:transparent; color:rgba(248,245,242,.7); font-family:'Montserrat',sans-serif; font-size:.82rem; font-weight:500; cursor:pointer; transition:all .25s; text-align:center; }
  .montant-btn:hover { border-color:rgba(201,169,106,.5); color:#C9A96A; background:rgba(201,169,106,.04); }
  .montant-btn.selected { border-color:#C9A96A; color:#C9A96A; background:rgba(201,169,106,.08); }
  .don-input { width:100%; padding:12px 16px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:3px; color:var(--blanc); font-family:'Montserrat',sans-serif; font-size:.88rem; font-weight:300; outline:none; transition:border-color .25s; }
  .don-input:focus { border-color:rgba(201,169,106,.4); }
  .don-label { font-family:'Montserrat',sans-serif; font-size:.62rem; letter-spacing:.16em; text-transform:uppercase; color:rgba(248,245,242,.4); display:block; margin-bottom:6px; }
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

export default function Don() {
  useReveal();

  const [montantSelectionne, setMontantSelectionne] = useState(65000);
  const [autreMontnant,      setAutreMontant]        = useState("");
  const [form, setForm] = useState({ nom:"", prenom:"", email:"", telephone:"", message:"", anonyme:false });
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");

  const montantFinal = autreMontnant ? parseInt(autreMontnant) : montantSelectionne;

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function soumettre(e) {
    e.preventDefault();
    if (!form.email.trim()) { setError("L'email est requis."); return; }
    if (!montantFinal || montantFinal < 1000) { setError("Veuillez choisir un montant valide."); return; }
    setLoading(true); setError("");
    try {
      const res = await donAPI.soumettre({ ...form, montant: montantFinal });
      res.ok = res.status < 300;
      if (res.ok) setDone(true);
      else setError("Une erreur est survenue. Veuillez réessayer.");
    } catch { setError("Erreur réseau. Veuillez réessayer."); }
    setLoading(false);
  }

  const IMPACT = [
    { montant:"10 000 FCFA",  desc:"Contribue au développement des contenus" },
    { montant:"42 000 FCFA",  desc:"Soutient un mois d'hébergement" },
    { montant:"70 000 FCFA",  desc:"Participe à l'accès à une formation" },
    { montant:"160 000 FCFA", desc:"Finance un accompagnement privé" },
    { montant:"370 000 FCFA", desc:"Impact direct sur une transformation complète" },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ background:"#0A0A0A", color:"#F8F5F2", minHeight:"100vh" }}>

        {/* Nav */}
        <nav style={{ padding:"18px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"rgba(10,10,10,.95)", backdropFilter:"blur(20px)", zIndex:100 }}>
          <Link to="/" style={{ textDecoration:"none" }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem" }}>
              <span style={{color:"#F8F5F2"}}>Meta'</span>
              <span style={{color:"#C9A96A"}}>Morph'</span>
              <span style={{color:"#C2185B"}}>Ose</span>
            </span>
          </Link>
          <Link to="/" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}>Accueil</Link>
        </nav>

        {/* Hero */}
        <section style={{ padding:"100px 24px 72px", textAlign:"center", background:"linear-gradient(180deg,#0A0A0A,#110d09)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 50% at 50% 60%,rgba(201,169,106,.06),transparent)", pointerEvents:"none" }}/>
          <div style={{ position:"relative", maxWidth:"680px", margin:"0 auto" }}>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".3em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"16px", animation:"fadeUp .6s both" }}>
              Faire un don
            </p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,6vw,3.5rem)", fontWeight:700, lineHeight:1.1, marginBottom:"20px", animation:"fadeUp .7s .1s both" }}>
              Soutenez une transformation.<br/>Impactez des vies.
            </h1>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:"1rem", color:"rgba(248,245,242,.55)", lineHeight:1.8, animation:"fadeUp .7s .2s both", marginBottom:"36px" }}>
              Votre contribution permet d'accompagner des femmes à reprendre confiance en elles,
              à améliorer leur image et à transformer leur vie.
            </p>
            <a href="#formulaire" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#C9A96A", color:"#0A0A0A", fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:".75rem", letterSpacing:".16em", textTransform:"uppercase", padding:"16px 36px", borderRadius:"2px", textDecoration:"none", animation:"fadeUp .7s .3s both" }}>
              Soutenir maintenant
            </a>
          </div>
        </section>

        <div style={{ maxWidth:"960px", margin:"0 auto", padding:"0 24px 100px" }}>

          {/* Pourquoi votre soutien */}
          <section style={{ padding:"72px 0 0" }}>
            <div style={{ maxWidth:"680px", margin:"0 auto", textAlign:"center" }}>
              <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"14px" }}>Pourquoi votre soutien est important</p>
              <p className="reveal" style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.2rem", color:"rgba(248,245,242,.75)", lineHeight:1.8 }}>
                Chaque femme mérite de se sentir belle, confiante et légitime. À travers Métamorphose,
                nous accompagnons des femmes à se reconstruire, à se révéler et à prendre leur place
                dans leur vie personnelle et professionnelle. Mais certaines n'ont pas les moyens
                d'accéder à cet accompagnement. Votre don devient alors une opportunité.
                Une porte ouverte. Un nouveau départ.
              </p>
            </div>
          </section>

          {/* Impact */}
          <section style={{ padding:"72px 0 0" }}>
            <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"32px", textAlign:"center" }}>Votre don fait la différence</p>
            <div className="impact-grid reveal" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:"16px" }}>
              {IMPACT.map((item, i) => (
                <div key={i} style={{ padding:"28px 24px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(201,169,106,.1)", borderLeft:"3px solid #C9A96A", borderRadius:"3px" }}>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:600, color:"#C9A96A", marginBottom:"8px" }}>{item.montant}</p>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"rgba(248,245,242,.6)", fontWeight:300, lineHeight:1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Formulaire */}
          <section id="formulaire" style={{ padding:"72px 0 0" }}>
            <div style={{ background:"rgba(255,255,255,.02)", border:"1px solid rgba(201,169,106,.12)", borderRadius:"6px", padding:"48px 24px" }}>
              <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"8px" }}>Choisissez votre contribution</p>
              <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:600, marginBottom:"32px" }}>
                Faire un don
              </h2>

              {done ? (
                <div style={{ textAlign:"center", padding:"48px 24px" }}>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.6rem", fontWeight:600, color:"#C9A96A", marginBottom:"16px" }}>Merci pour votre soutien.</p>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, color:"rgba(248,245,242,.55)", lineHeight:1.8 }}>
                    Votre don n'est pas simplement un montant. C'est un acte de soutien.
                    Un acte d'amour. Un acte de transformation.
                  </p>
                </div>
              ) : (
                <form onSubmit={soumettre}>
                  {/* Montants */}
                  <div style={{ marginBottom:"24px" }}>
                    <label className="don-label">Montant (FCFA)</label>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:"10px", marginBottom:"12px" }}>
                      {MONTANTS.map(m => (
                        <button key={m} type="button"
                          className={`montant-btn ${montantSelectionne===m && !autreMontnant ? "selected" : ""}`}
                          onClick={() => { setMontantSelectionne(m); setAutreMontant(""); }}>
                          {m.toLocaleString("fr-FR")}
                        </button>
                      ))}
                    </div>
                    <input
                      className="don-input" type="number" min="1000"
                      placeholder="Autre montant (FCFA)"
                      value={autreMontnant}
                      onChange={e => { setAutreMontant(e.target.value); setMontantSelectionne(0); }}
                    />
                  </div>

                  {/* Infos */}
                  <div className="form-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"14px" }}>
                    <div>
                      <label className="don-label">Nom</label>
                      <input className="don-input" value={form.nom} onChange={e=>set("nom",e.target.value)} placeholder="Votre nom"/>
                    </div>
                    <div>
                      <label className="don-label">Prénom</label>
                      <input className="don-input" value={form.prenom} onChange={e=>set("prenom",e.target.value)} placeholder="Votre prénom"/>
                    </div>
                    <div>
                      <label className="don-label">Email *</label>
                      <input className="don-input" type="email" required value={form.email} onChange={e=>set("email",e.target.value)} placeholder="votre@email.com"/>
                    </div>
                    <div>
                      <label className="don-label">Téléphone</label>
                      <input className="don-input" value={form.telephone} onChange={e=>set("telephone",e.target.value)} placeholder="+229 00 00 00 00"/>
                    </div>
                  </div>

                  <div style={{ marginBottom:"14px" }}>
                    <label className="don-label">Message de soutien (optionnel)</label>
                    <textarea className="don-input" rows={3} value={form.message} onChange={e=>set("message",e.target.value)} placeholder="Un mot d'encouragement..." style={{ resize:"vertical" }}/>
                  </div>

                  <label style={{ display:"flex", alignItems:"center", gap:"10px", cursor:"pointer", marginBottom:"24px" }}>
                    <input type="checkbox" checked={form.anonyme} onChange={e=>set("anonyme",e.target.checked)}
                      style={{ width:"16px", height:"16px", accentColor:"#C9A96A" }}/>
                    <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"rgba(248,245,242,.6)", fontWeight:300 }}>
                      Je souhaite rester anonyme
                    </span>
                  </label>

                  {error && <p style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", borderRadius:"4px", padding:"10px 14px", fontSize:".78rem", color:"#f87171", marginBottom:"16px" }}>{error}</p>}

                  <button type="submit" disabled={loading}
                    style={{ width:"100%", padding:"16px", background:"#C9A96A", border:"none", borderRadius:"3px", color:"#0A0A0A", fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:".78rem", letterSpacing:".16em", textTransform:"uppercase", cursor:loading?"not-allowed":"pointer", opacity:loading?.7:1 }}>
                    {loading ? "Traitement en cours..." : `Je soutiens cette transformation — ${montantFinal.toLocaleString("fr-FR")} FCFA`}
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* Preuve sociale */}
          <section style={{ padding:"72px 0 0", textAlign:"center" }}>
            <div className="reveal" style={{ padding:"48px 32px", background:"rgba(201,169,106,.04)", border:"1px solid rgba(201,169,106,.12)", borderRadius:"6px" }}>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.3rem", color:"rgba(248,245,242,.7)", lineHeight:1.8, marginBottom:"32px" }}>
                Déjà de nombreuses femmes accompagnées dans leur transformation personnelle
                et leur confiance en elles.
              </p>
              <div style={{ height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.3),transparent)", marginBottom:"32px" }}/>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.1rem", color:"rgba(248,245,242,.5)", lineHeight:1.8, marginBottom:"28px" }}>
                Votre don n'est pas simplement un montant. C'est un acte de soutien.
                Un acte d'amour. Un acte de transformation.
                Merci de faire partie de cette mission.
              </p>
              <a href="#formulaire" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#C9A96A", color:"#0A0A0A", fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:".75rem", letterSpacing:".16em", textTransform:"uppercase", padding:"15px 32px", borderRadius:"2px", textDecoration:"none" }}>
                Soutenir une transformation maintenant
              </a>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
