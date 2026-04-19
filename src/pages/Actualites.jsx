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
  .actu-input { width:100%; padding:12px 16px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:3px; color:#F8F5F2; font-family:'Montserrat',sans-serif; font-size:.88rem; font-weight:300; outline:none; transition:border-color .25s; }
  .actu-input:focus { border-color:rgba(201,169,106,.4); }
  .actu-label { font-family:'Montserrat',sans-serif; font-size:.62rem; letter-spacing:.16em; text-transform:uppercase; color:rgba(248,245,242,.4); display:block; margin-bottom:6px; }
  .actu-card { background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.07); border-radius:6px; overflow:hidden; transition:border-color .3s,transform .3s; }
  .actu-card:hover { border-color:rgba(201,169,106,.25); transform:translateY(-4px); }
  @media(max-width:768px) { .actu-grid { grid-template-columns:1fr !important; } .form-2col { grid-template-columns:1fr !important; } }
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

const ACTUS = [
  {
    date: "Avril 2026",
    categorie: "Reconnaissance",
    titre: "Nomination parmi les 100 Leaders du Bénin",
    resume: "Une étape marquante dans le parcours Métamorphose. Prélia APEDO AHONON a été honorée d'être nommée parmi les 100 leaders du Bénin, une reconnaissance qui valorise l'impact, la vision et l'engagement portés à travers ce projet.",
    bouton: "Lire l'histoire complète",
    lien: "/evenements",
    color: "#C9A96A",
  },
  {
    date: "Avril 2026",
    categorie: "Formation",
    titre: "Lancement de la Masterclass OSE",
    resume: "Une nouvelle masterclass dédiée à la confiance en soi, à l'image et à l'affirmation personnelle est officiellement lancée. Une expérience conçue pour aider les femmes à dépasser le regard des autres et à s'assumer pleinement.",
    bouton: "Découvrir la masterclass",
    lien: "/masterclass",
    color: "#C2185B",
  },
  {
    date: "Décembre 2026",
    categorie: "Événement",
    titre: "Annonce du Brunch Métamorphose 2026",
    resume: "Un événement exclusif réunissant les femmes de la communauté dans un cadre élégant, inspirant et transformateur. Un moment de partage, de connexion et d'élévation collective.",
    bouton: "En savoir plus sur l'événement",
    lien: "/brunch",
    color: "#A8C8E0",
  },
];

export default function Actualites() {
  useReveal();
  const [actus, setActus] = useState(ACTUS);
  useEffect(() => {
    evenementsAPI.actualites().then(r => { if (Array.isArray(r.data) && r.data.length > 0) setActus(r.data); }).catch(() => {});
  }, []);
  const [form,    setForm]    = useState({ email:"", whatsapp:"" });
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function inscrire(e) {
    e.preventDefault();
    if (!form.email.trim()) { setError("L'email est requis."); return; }
    setLoading(true); setError("");
    try {
      await newsletterAPI.abonner({ email: form.email });
      setDone(true);
    } catch { setError("Erreur réseau."); }
    setLoading(false);
  }

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
            <Link to="/contact" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", background:"#C2185B", color:"#fff", textDecoration:"none", padding:"9px 18px", borderRadius:"2px" }}>S'inscrire</Link>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ padding:"100px 24px 72px", textAlign:"center", background:"linear-gradient(180deg,#0A0A0A,#110d09)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 50% at 50% 60%,rgba(201,169,106,.06),transparent)", pointerEvents:"none" }}/>
          <div style={{ position:"relative", maxWidth:"680px", margin:"0 auto" }}>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".3em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"16px", animation:"fadeUp .6s both" }}>Actualités</p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,6vw,3.5rem)", fontWeight:700, lineHeight:1.1, marginBottom:"20px", animation:"fadeUp .7s .1s both" }}>
              Actualités Métamorphose
            </h1>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:"1rem", color:"rgba(248,245,242,.55)", lineHeight:1.8, animation:"fadeUp .7s .2s both", marginBottom:"36px" }}>
              Découvrez les nouveautés, les coulisses, les moments forts et l'évolution
              de la communauté Métamorphose.
            </p>
            <a href="#actus" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#C9A96A", color:"#0A0A0A", fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:".75rem", letterSpacing:".16em", textTransform:"uppercase", padding:"15px 32px", borderRadius:"2px", textDecoration:"none", animation:"fadeUp .7s .3s both" }}>
              Explorer les actualités
            </a>
          </div>
        </section>

        <div style={{ maxWidth:"960px", margin:"0 auto", padding:"0 24px 100px" }}>

          {/* Intro */}
          <section style={{ padding:"64px 0 0", textAlign:"center" }}>
            <p className="reveal" style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.15rem", color:"rgba(248,245,242,.65)", lineHeight:1.9, maxWidth:"640px", margin:"0 auto" }}>
              Métamorphose est un mouvement en constante évolution. Cette page vous ouvre
              les portes des coulisses : les annonces importantes, les réussites, les moments
              forts et les prochaines étapes de cette aventure humaine et transformationnelle.
              Ici, vous restez connectée à l'essentiel.
            </p>
          </section>

          {/* Cartes actualités */}
          <section id="actus" style={{ padding:"72px 0 0" }}>
            <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"32px" }}>
              Dernières actualités
            </p>
            <div className="actu-grid reveal" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"20px" }}>
              {actus.map((actu, i) => (
                <div key={i} className="actu-card" style={{ transitionDelay:`${i*.1}s`, display:"grid", gridTemplateColumns:actu.photo?"1fr 1fr":"1fr" }}>
                  {!actu.photo && <div style={{ height:"4px", background:`linear-gradient(90deg,${actu.color},transparent)` }}/>}
                  <div style={{ padding:"28px 24px" }}>
                    <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"14px" }}>
                      <span style={{ padding:"3px 10px", background:`${actu.color}15`, border:`1px solid ${actu.color}30`, borderRadius:"100px", fontFamily:"'Montserrat',sans-serif", fontSize:".58rem", fontWeight:600, letterSpacing:".14em", textTransform:"uppercase", color:actu.color }}>
                        {actu.categorie}
                      </span>
                      <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".65rem", color:"rgba(248,245,242,.3)", fontWeight:300 }}>{actu.date}</span>
                    </div>
                    <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:600, lineHeight:1.3, marginBottom:"14px" }}>{actu.titre}</h3>
                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.55)", lineHeight:1.75, marginBottom:"20px" }}>
                      {actu.resume}
                    </p>
                    <Link to={actu.lien} style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".7rem", fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", color:actu.color, textDecoration:"none" }}>
                      {actu.bouton} →
                    </Link>
                  </div>
                  {actu.photo && (
                    <div style={{ overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", background:"#0A0A0A" }}>
                      <img src={actu.photo} alt={actu.titre} style={{ width:"100%", height:"auto", objectFit:"contain" }}/>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Coulisses & Impact */}
          <section style={{ padding:"72px 0 0" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" }}>
              {[
                {
                  titre: "Dans les coulisses de Métamorphose",
                  texte: "Métamorphose, ce n'est pas seulement des programmes et des événements. C'est une vision, une mission et un mouvement porté par des femmes en transformation. Ici, vous découvrirez les étapes de création, les réflexions, les réussites et les moments forts qui construisent cette aventure.",
                },
                {
                  titre: "L'impact en action",
                  texte: "Chaque jour, des femmes entament ou poursuivent leur transformation à travers Métamorphose. Plus qu'un programme, c'est un changement de regard sur soi, sur sa valeur et sur sa place dans le monde.",
                },
              ].map((bloc, i) => (
                <div key={i} className="reveal" style={{ transitionDelay:`${i*.1}s`, padding:"36px 28px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"6px" }}>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:600, color:"#C9A96A", marginBottom:"14px", lineHeight:1.3 }}>{bloc.titre}</h3>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.55)", lineHeight:1.8 }}>{bloc.texte}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Newsletter */}
          <section style={{ padding:"72px 0 0" }}>
            <div style={{ background:"rgba(255,255,255,.02)", border:"1px solid rgba(201,169,106,.12)", borderRadius:"6px", padding:"48px 40px" }}>
              <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"8px" }}>Newsletter</p>
              <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.3rem,3vw,1.8rem)", fontWeight:600, marginBottom:"32px" }}>
                Ne manquez aucune actualité
              </h2>
              {done ? (
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", color:"#C9A96A", textAlign:"center" }}>
                  Inscription confirmée. Vous recevrez toutes nos actualités.
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
                  <button type="submit" disabled={loading}
                    style={{ width:"100%", padding:"15px", background:"#C9A96A", border:"none", borderRadius:"3px", color:"#0A0A0A", fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:".78rem", letterSpacing:".16em", textTransform:"uppercase", cursor:loading?"not-allowed":"pointer", opacity:loading?.7:1 }}>
                    {loading ? "Inscription..." : "S'abonner aux actualités Métamorphose"}
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
