import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_URL from "../config";

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
  .reveal { opacity:0; transform:translateY(30px); transition:opacity .8s ease,transform .8s ease; }
  .reveal.visible { opacity:1; transform:none; }
  .brunch-input { width:100%; padding:12px 16px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:3px; color:#F8F5F2; font-family:'Montserrat',sans-serif; font-size:.88rem; font-weight:300; outline:none; transition:border-color .25s; }
  .brunch-input:focus { border-color:rgba(201,169,106,.4); }
  .brunch-label { font-family:'Montserrat',sans-serif; font-size:.62rem; letter-spacing:.16em; text-transform:uppercase; color:rgba(248,245,242,.4); display:block; margin-bottom:6px; }
  .statut-btn { flex:1; padding:14px; border-radius:3px; border:1px solid rgba(255,255,255,.1); background:transparent; color:rgba(248,245,242,.6); font-family:'Montserrat',sans-serif; font-size:.78rem; font-weight:500; cursor:pointer; transition:all .25s; text-align:center; }
  .statut-btn.selected { border-color:#C9A96A; color:#C9A96A; background:rgba(201,169,106,.08); }
  @media(max-width:768px) { .tarifs-grid { grid-template-columns:1fr !important; } .form-2col { grid-template-columns:1fr !important; } .cibles-grid { grid-template-columns:1fr !important; } }
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

export default function Brunch() {
  useReveal();

  const [statut,  setStatut]  = useState("metamorphosee");
  const [form,    setForm]    = useState({ nom:"", prenom:"", email:"", telephone:"", message:"" });
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const prix = statut === "metamorphosee" ? 50000 : 30000;
  const prixLabel = statut === "metamorphosee" ? "50 000 FCFA" : "30 000 FCFA";

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function inscrire(e) {
    e.preventDefault();
    if (!form.email.trim()) { setError("L'email est requis."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/contenu/newsletter/abonner/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, prenom: form.prenom }),
      });
      if (res.ok) setDone(true);
      else setError("Une erreur est survenue.");
    } catch { setError("Erreur réseau."); }
    setLoading(false);
  }

  const EXPERIENCE = [
    "Brunch élégant et convivial",
    "Cérémonie de reconnaissance et remise de certificats",
    "Panels de discussion inspirants",
    "Networking entre femmes ambitieuses",
    "Partages d'expériences de transformation",
    "Moments de célébration collective",
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
          <div style={{ display:"flex", gap:"16px", alignItems:"center" }}>
            <Link to="/" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}>Accueil</Link>
            <a href="#inscription" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", background:"#C2185B", color:"#fff", textDecoration:"none", padding:"9px 18px", borderRadius:"2px" }}>Réserver ma place</a>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ padding:"100px 24px 72px", textAlign:"center", background:"linear-gradient(180deg,#0A0A0A 0%,#18100d 100%)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 50% at 50% 60%,rgba(201,169,106,.08),transparent)", pointerEvents:"none" }}/>
          <div style={{ position:"relative", maxWidth:"680px", margin:"0 auto" }}>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".3em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"16px", animation:"fadeUp .6s both" }}>
              Événement annuel exclusif
            </p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,6vw,3.5rem)", fontWeight:700, lineHeight:1.1, marginBottom:"20px", animation:"fadeUp .7s .1s both" }}>
              Brunch des Métamorphosées
            </h1>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:"1rem", color:"rgba(248,245,242,.55)", lineHeight:1.8, animation:"fadeUp .7s .2s both", marginBottom:"24px" }}>
              Un rendez-vous annuel exclusif qui célèbre, honore et connecte
              les femmes en transformation et les femmes leaders.
            </p>
            <div style={{ display:"flex", gap:"20px", justifyContent:"center", flexWrap:"wrap", marginBottom:"36px", animation:"fadeUp .7s .25s both" }}>
              <div style={{ textAlign:"center" }}>
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(248,245,242,.3)", marginBottom:"4px" }}>Date</p>
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:".95rem", color:"#C9A96A" }}>Décembre 2026</p>
              </div>
              <div style={{ width:"1px", background:"rgba(255,255,255,.08)" }}/>
              <div style={{ textAlign:"center" }}>
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(248,245,242,.3)", marginBottom:"4px" }}>Lieu</p>
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:".95rem", color:"rgba(248,245,242,.7)" }}>Bénin — à préciser</p>
              </div>
            </div>
            <a href="#inscription" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#C9A96A", color:"#0A0A0A", fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:".75rem", letterSpacing:".16em", textTransform:"uppercase", padding:"15px 32px", borderRadius:"2px", textDecoration:"none", animation:"fadeUp .7s .3s both" }}>
              Participer au Brunch des Métamorphosées
            </a>
          </div>
        </section>

        <div style={{ maxWidth:"960px", margin:"0 auto", padding:"0 24px 100px" }}>

          {/* Intro & Cibles */}
          <section style={{ padding:"72px 0 0" }}>
            <p className="reveal" style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.15rem", color:"rgba(248,245,242,.65)", lineHeight:1.9, maxWidth:"680px", margin:"0 auto 48px", textAlign:"center" }}>
              Le Brunch des Métamorphosées est un événement annuel unique organisé par Métamorphose.
              Il rassemble des femmes ayant suivi le parcours Métamorphose ainsi que des femmes leaders
              et ambitieuses désireuses de vivre une expérience de transformation, de partage et de réseautage.
            </p>

            <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"24px" }}>
              Pour qui ?
            </p>
            <div className="cibles-grid reveal" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" }}>
              {[
                {
                  titre: "Les Métamorphosées",
                  desc: "Les femmes ayant suivi le programme Métamorphose et faisant partie de la communauté.",
                  color: "#C9A96A",
                },
                {
                  titre: "Les femmes leaders et ambitieuses",
                  desc: "Des femmes de l'extérieur qui souhaitent se ressourcer, rencontrer d'autres femmes inspirantes, vivre une expérience de transformation, développer leur réseau et découvrir l'univers Métamorphose.",
                  color: "#C2185B",
                },
              ].map((c, i) => (
                <div key={i} style={{ padding:"32px 28px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.07)", borderLeft:`3px solid ${c.color}`, borderRadius:"3px" }}>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:600, color:c.color, marginBottom:"12px" }}>{c.titre}</h3>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.6)", lineHeight:1.75 }}>{c.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Tarifs */}
          <section style={{ padding:"72px 0 0" }}>
            <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"32px" }}>
              Tarifs et avantages
            </p>
            <div className="tarifs-grid reveal" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px", marginBottom:"24px" }}>
              {/* Métamorphosées */}
              <div style={{ padding:"36px 28px", background:"rgba(201,169,106,.04)", border:"1px solid rgba(201,169,106,.2)", borderTop:"3px solid #C9A96A", borderRadius:"4px" }}>
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".2em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"8px" }}>Métamorphosées</p>
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"2rem", fontWeight:700, color:"#C9A96A", marginBottom:"20px" }}>50 000 <span style={{fontSize:"1rem",fontWeight:300}}>FCFA</span></p>
                {["Accès complet au brunch","Cérémonie de reconnaissance","Remise de certificats","Networking et panels","Expérience complète Métamorphose"].map((item, i) => (
                  <div key={i} style={{ display:"flex", gap:"10px", marginBottom:"10px" }}>
                    <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:"#C9A96A", flexShrink:0, marginTop:"8px" }}/>
                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"rgba(248,245,242,.7)", fontWeight:300 }}>{item}</p>
                  </div>
                ))}
              </div>

              {/* Femmes extérieures */}
              <div style={{ padding:"36px 28px", background:"rgba(194,24,91,.04)", border:"1px solid rgba(194,24,91,.2)", borderTop:"3px solid #C2185B", borderRadius:"4px" }}>
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".2em", textTransform:"uppercase", color:"#C2185B", marginBottom:"8px" }}>Femmes extérieures</p>
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"2rem", fontWeight:700, color:"#C2185B", marginBottom:"20px" }}>30 000 <span style={{fontSize:"1rem",fontWeight:300}}>FCFA</span></p>
                {["Accès au brunch","Panels et networking","Partages d'expérience","Immersion dans l'univers Métamorphose"].map((item, i) => (
                  <div key={i} style={{ display:"flex", gap:"10px", marginBottom:"10px" }}>
                    <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:"#C2185B", flexShrink:0, marginTop:"8px" }}/>
                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"rgba(248,245,242,.7)", fontWeight:300 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Bonus */}
            <div className="reveal" style={{ padding:"28px 32px", background:"rgba(201,169,106,.06)", border:"1px solid rgba(201,169,106,.15)", borderRadius:"4px" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".2em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"10px" }}>Bonus exclusif</p>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.7)", lineHeight:1.8 }}>
                Les femmes extérieures qui participent au brunch à 50 000 FCFA bénéficient d'un avantage exclusif :
                10% de réduction sur le programme Métamorphose, un appel découverte avec Prélia AHONON
                d'une valeur de 100 000 FCFA, et l'accès aux 7 Bonus du programme.
              </p>
            </div>
          </section>

          {/* Expérience */}
          <section style={{ padding:"72px 0 0" }}>
            <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"32px" }}>
              L'expérience
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:"14px" }}>
              {EXPERIENCE.map((item, i) => (
                <div key={i} className="reveal" style={{ transitionDelay:`${i*.07}s`, padding:"20px 22px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.06)", borderRadius:"4px", display:"flex", gap:"12px", alignItems:"flex-start" }}>
                  <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:"#C9A96A", flexShrink:0, marginTop:"8px" }}/>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".85rem", color:"rgba(248,245,242,.7)", fontWeight:300, lineHeight:1.6 }}>{item}</p>
                </div>
              ))}
            </div>

            {/* Dimension internationale */}
            <div className="reveal" style={{ marginTop:"24px", padding:"28px 32px", background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.06)", borderRadius:"4px" }}>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1rem", color:"rgba(248,245,242,.6)", lineHeight:1.8 }}>
                Le Brunch des Métamorphosées est un événement annuel appelé à se déployer dans différents pays.
                L'édition 2026 se tiendra au Bénin et marque une étape importante dans la croissance
                du mouvement Métamorphose.
              </p>
            </div>
          </section>

          {/* Formulaire inscription */}
          <section id="inscription" style={{ padding:"72px 0 0" }}>
            <div style={{ background:"rgba(255,255,255,.02)", border:"1px solid rgba(201,169,106,.12)", borderRadius:"6px", padding:"48px 40px" }}>
              <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"8px" }}>Inscription</p>
              <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.3rem,3vw,1.8rem)", fontWeight:600, marginBottom:"32px" }}>
                Réserver ma place au brunch
              </h2>

              {done ? (
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", color:"#C9A96A", textAlign:"center", padding:"32px 0" }}>
                  Votre inscription a été reçue. Prélia AHONON vous contactera pour confirmer votre place.
                </p>
              ) : (
                <form onSubmit={inscrire}>
                  {/* Statut */}
                  <div style={{ marginBottom:"24px" }}>
                    <label className="brunch-label">Votre statut</label>
                    <div style={{ display:"flex", gap:"12px" }}>
                      <button type="button" className={`statut-btn ${statut==="metamorphosee"?"selected":""}`} onClick={()=>setStatut("metamorphosee")}>
                        Métamorphosée — 50 000 FCFA
                      </button>
                      <button type="button" className={`statut-btn ${statut==="exterieure"?"selected":""}`} onClick={()=>setStatut("exterieure")}>
                        Invitée extérieure — 30 000 FCFA
                      </button>
                    </div>
                  </div>

                  <div className="form-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"14px" }}>
                    <div>
                      <label className="brunch-label">Nom</label>
                      <input className="brunch-input" value={form.nom} onChange={e=>set("nom",e.target.value)} placeholder="Votre nom"/>
                    </div>
                    <div>
                      <label className="brunch-label">Prénom</label>
                      <input className="brunch-input" value={form.prenom} onChange={e=>set("prenom",e.target.value)} placeholder="Votre prénom"/>
                    </div>
                    <div>
                      <label className="brunch-label">Email *</label>
                      <input className="brunch-input" type="email" required value={form.email} onChange={e=>set("email",e.target.value)} placeholder="votre@email.com"/>
                    </div>
                    <div>
                      <label className="brunch-label">Téléphone</label>
                      <input className="brunch-input" value={form.telephone} onChange={e=>set("telephone",e.target.value)} placeholder="+229 00 00 00 00"/>
                    </div>
                  </div>

                  <div style={{ marginBottom:"24px" }}>
                    <label className="brunch-label">Message (optionnel)</label>
                    <textarea className="brunch-input" rows={3} value={form.message} onChange={e=>set("message",e.target.value)} placeholder="Un message pour Prélia AHONON..." style={{ resize:"vertical" }}/>
                  </div>

                  {error && <p style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", borderRadius:"4px", padding:"10px 14px", fontSize:".78rem", color:"#f87171", marginBottom:"16px" }}>{error}</p>}

                  <button type="submit" disabled={loading}
                    style={{ width:"100%", padding:"16px", background:"#C9A96A", border:"none", borderRadius:"3px", color:"#0A0A0A", fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:".78rem", letterSpacing:".16em", textTransform:"uppercase", cursor:loading?"not-allowed":"pointer", opacity:loading?.7:1 }}>
                    {loading ? "Traitement..." : `Je réserve ma place — ${prixLabel}`}
                  </button>
                </form>
              )}
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
