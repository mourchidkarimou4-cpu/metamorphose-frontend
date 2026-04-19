import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { evenementsAPI, newsletterAPI } from "../services/api";

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
  .actu-card {
    background:rgba(255,255,255,.025);
    border:1px solid rgba(255,255,255,.07);
    border-radius:8px;
    overflow:hidden;
    transition:border-color .3s, transform .3s, box-shadow .3s;
    display:flex;
    flex-direction:column;
  }
  .actu-card:hover {
    border-color:rgba(201,169,106,.3);
    transform:translateY(-4px);
    box-shadow:0 20px 60px rgba(0,0,0,.3);
  }
  .actu-input { width:100%; padding:12px 16px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:3px; color:#F8F5F2; font-family:'Montserrat',sans-serif; font-size:.88rem; font-weight:300; outline:none; transition:border-color .25s; }
  .actu-input:focus { border-color:rgba(201,169,106,.4); }
  .actu-label { font-family:'Montserrat',sans-serif; font-size:.62rem; letter-spacing:.16em; text-transform:uppercase; color:rgba(248,245,242,.4); display:block; margin-bottom:6px; }
  @media(max-width:768px) {
    .actu-grid { grid-template-columns:1fr !important; }
    .form-2col { grid-template-columns:1fr !important; }
    .coulisses-grid { grid-template-columns:1fr !important; }
  }
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

const ACTUS_DEFAUT = [
  {
    id:1, date:"Avril 2026", categorie:"Reconnaissance",
    titre:"Nomination parmi les 100 Leaders du Bénin",
    resume:"Prélia APEDO AHONON a été honorée d'être nommée parmi les 100 leaders du Bénin, une reconnaissance qui valorise l'impact, la vision et l'engagement portés à travers ce projet.",
    bouton:"Lire l'histoire complète", lien:"/evenements", color:"#C9A96A", photo:"",
  },
  {
    id:2, date:"Mars 2026", categorie:"Programme",
    titre:"Lancement de la Masterclass Confiance en Soi",
    resume:"Une nouvelle masterclass dédiée à la confiance en soi, à l'image et à l'affirmation personnelle est officiellement lancée.",
    bouton:"En savoir plus", lien:"/masterclass", color:"#C2185B", photo:"",
  },
];

export default function Actualites() {
  useReveal();
  const [actus, setActus] = useState(ACTUS_DEFAUT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    evenementsAPI.actualites()
      .then(r => { if (Array.isArray(r.data) && r.data.length > 0) setActus(r.data); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const [form, setForm]     = useState({ email:"", whatsapp:"" });
  const [done, setDone]     = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError]   = useState("");

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function inscrire(e) {
    e.preventDefault();
    if (!form.email.trim()) { setError("L'email est requis."); return; }
    setSending(true); setError("");
    try {
      await newsletterAPI.abonner({ email: form.email });
      setDone(true);
    } catch { setError("Erreur réseau. Réessayez."); }
    setSending(false);
  }

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ background:"#0A0A0A", color:"#F8F5F2", minHeight:"100vh" }}>

        {/* Nav */}
        <nav style={{ padding:"18px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"rgba(10,10,10,.95)", backdropFilter:"blur(20px)", zIndex:100 }}>
          <Link to="/" style={{ textDecoration:"none" }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem" }}>
              <span style={{color:"#F8F5F2"}}>Méta'</span>
              <span style={{color:"#C9A96A"}}>Morph'</span>
              <span style={{color:"#C2185B"}}>Ose</span>
            </span>
          </Link>
          <div style={{ display:"flex", gap:"16px", alignItems:"center" }}>
            <Link to="/" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}>Accueil</Link>
            <Link to="/evenements" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(248,245,242,.4)", textDecoration:"none" }}>Événements</Link>
            <Link to="/contact" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", background:"#C2185B", color:"#fff", textDecoration:"none", padding:"9px 18px", borderRadius:"2px" }}>S'inscrire</Link>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ padding:"100px 24px 72px", textAlign:"center", background:"linear-gradient(180deg,#0A0A0A,#110d09)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 50% at 50% 60%,rgba(201,169,106,.06),transparent)", pointerEvents:"none" }}/>
          <div style={{ position:"relative", maxWidth:"680px", margin:"0 auto" }}>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".3em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"16px", animation:"fadeUp .6s both" }}>
              Actualités
            </p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,6vw,3.5rem)", fontWeight:700, lineHeight:1.1, marginBottom:"20px", animation:"fadeUp .7s .1s both" }}>
              Les nouvelles de<br/>
              <em style={{ fontStyle:"italic", fontWeight:400, color:"#C9A96A" }}>Métamorphose</em>
            </h1>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:"1rem", color:"rgba(248,245,242,.55)", lineHeight:1.8, animation:"fadeUp .7s .2s both" }}>
              Reconnaissance, lancement de programmes, événements à venir — restez connectée à tout ce qui fait avancer cette communauté.
            </p>
          </div>
        </section>

        <div style={{ maxWidth:"1000px", margin:"0 auto", padding:"0 24px 100px" }}>

          {/* Actualités */}
          <section id="actus" style={{ padding:"72px 0 0" }}>
            <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"40px" }}>
              Dernières actualités
            </p>

            {loading ? (
              <div style={{ textAlign:"center", padding:"60px 0" }}>
                <div style={{ width:"32px", height:"32px", border:"2px solid rgba(201,169,106,.2)", borderTop:"2px solid #C9A96A", borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto" }}/>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"40px" }}>
                {actus.map((actu, i) => (
                  <div key={actu.id || i} className="reveal actu-card" style={{ transitionDelay:`${i*.1}s` }}>

                    {/* Bande couleur si pas de photo */}
                    {!actu.photo && (
                      <div style={{ height:"5px", background:`linear-gradient(90deg,${actu.color},transparent)` }}/>
                    )}

                    {/* Image pleine largeur */}
                    {actu.photo && (
                      <div style={{ width:"100%", background:"#0A0A0A" }}>
                        <img
                          src={actu.photo}
                          alt={actu.titre}
                          style={{ width:"100%", height:"auto", display:"block", maxHeight:"500px", objectFit:"contain" }}
                        />
                      </div>
                    )}

                    {/* Contenu texte */}
                    <div style={{ padding:"32px 36px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"12px", marginBottom:"16px", flexWrap:"wrap" }}>
                        <span style={{
                          padding:"4px 12px",
                          background:`${actu.color}18`,
                          border:`1px solid ${actu.color}35`,
                          borderRadius:"100px",
                          fontFamily:"'Montserrat',sans-serif",
                          fontSize:".6rem", fontWeight:600,
                          letterSpacing:".16em", textTransform:"uppercase",
                          color:actu.color,
                        }}>
                          {actu.categorie}
                        </span>
                        <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".7rem", color:"rgba(248,245,242,.3)", fontWeight:300 }}>
                          {actu.date}
                        </span>
                      </div>

                      <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.3rem,3vw,1.8rem)", fontWeight:600, lineHeight:1.25, marginBottom:"16px", color:"#F8F5F2" }}>
                        {actu.titre}
                      </h2>

                      <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.6)", lineHeight:1.85, marginBottom:"24px", maxWidth:"680px" }}>
                        {actu.resume}
                      </p>

                      {actu.lien && actu.bouton && (
                        <Link to={actu.lien} style={{
                          display:"inline-flex", alignItems:"center", gap:"8px",
                          fontFamily:"'Montserrat',sans-serif", fontSize:".72rem",
                          fontWeight:600, letterSpacing:".12em", textTransform:"uppercase",
                          color:actu.color, textDecoration:"none",
                          borderBottom:`1px solid ${actu.color}40`,
                          paddingBottom:"2px", transition:"border-color .25s",
                        }}>
                          {actu.bouton} →
                        </Link>
                      )}
                    </div>

                    {/* Séparateur décoratif */}
                    <div style={{ height:"1px", background:`linear-gradient(90deg,transparent,${actu.color}30,transparent)`, margin:"0 36px 32px" }}/>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Coulisses */}
          <section style={{ padding:"72px 0 0" }}>
            <div className="coulisses-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" }}>
              {[
                { titre:"Dans les coulisses", texte:"Métamorphose, c'est une vision, une mission et un mouvement porté par des femmes en transformation. Ici, découvrez les étapes de création, les réflexions et les moments forts qui construisent cette aventure.", color:"#C9A96A" },
                { titre:"L'impact en action", texte:"Chaque jour, des femmes entament ou poursuivent leur transformation. Plus qu'un programme, c'est un changement de regard sur soi, sur sa valeur et sur sa place dans le monde.", color:"#C2185B" },
              ].map((bloc, i) => (
                <div key={i} className="reveal" style={{ transitionDelay:`${i*.1}s`, padding:"36px 28px", background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.07)", borderLeft:`3px solid ${bloc.color}`, borderRadius:"4px" }}>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:600, color:bloc.color, marginBottom:"14px", lineHeight:1.3 }}>{bloc.titre}</h3>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.55)", lineHeight:1.8 }}>{bloc.texte}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Newsletter */}
          <section style={{ padding:"72px 0 0" }}>
            <div className="reveal" style={{ background:"rgba(255,255,255,.02)", border:"1px solid rgba(201,169,106,.12)", borderRadius:"8px", padding:"48px 40px" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"8px" }}>Newsletter</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.3rem,3vw,1.8rem)", fontWeight:600, marginBottom:"8px" }}>
                Ne manquez aucune actualité
              </h2>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.45)", marginBottom:"32px" }}>
                Recevez les annonces importantes, les nouveautés et les invitations en avant-première.
              </p>
              {done ? (
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", color:"#C9A96A", textAlign:"center" }}>
                  Inscription confirmée. À très bientôt.
                </p>
              ) : (
                <form onSubmit={inscrire}>
                  <div className="form-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"14px" }}>
                    <div>
                      <label className="actu-label">Email *</label>
                      <input className="actu-input" type="email" required value={form.email} onChange={e=>set("email",e.target.value)} placeholder="votre@email.com"/>
                    </div>
                    <div>
                      <label className="actu-label">WhatsApp</label>
                      <input className="actu-input" value={form.whatsapp} onChange={e=>set("whatsapp",e.target.value)} placeholder="+229 00 00 00 00"/>
                    </div>
                  </div>
                  {error && <p style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", borderRadius:"4px", padding:"10px 14px", fontSize:".78rem", color:"#f87171", marginBottom:"14px" }}>{error}</p>}
                  <button type="submit" disabled={sending} style={{ width:"100%", padding:"15px", background:"#C9A96A", border:"none", borderRadius:"3px", color:"#0A0A0A", fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:".78rem", letterSpacing:".16em", textTransform:"uppercase", cursor:sending?"not-allowed":"pointer", opacity:sending?.7:1 }}>
                    {sending ? "Inscription..." : "S'abonner aux actualités"}
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
