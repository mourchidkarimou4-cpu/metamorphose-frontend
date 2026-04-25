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
  @media(max-width:768px) {
    .form-grid-2 { grid-template-columns:1fr !important; }
  }
  .evt-input { width:100%; padding:12px 16px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:3px; color:#F8F5F2; font-family:'Montserrat',sans-serif; font-size:.88rem; font-weight:300; outline:none; transition:border-color .25s; }
  .evt-input:focus { border-color:rgba(201,169,106,.4); }
  .evt-label { font-family:'Montserrat',sans-serif; font-size:.62rem; letter-spacing:.16em; text-transform:uppercase; color:rgba(248,245,242,.4); display:block; margin-bottom:6px; }
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

const EVENEMENTS_DEFAUT = [
  {
    id: 1,
    titre: "Masterclass OSER",
    badge: "100% GRATUIT",
    badge_color: "#4CAF50",
    date: "Dimanche 26 avril à 17h GMT+1",
    lieu: "En ligne",
    description: "Cette masterclass est conçue pour t'aider à sortir du regard des autres, reprendre confiance en toi et commencer à incarner une image alignée avec ta vraie valeur. Tu vas apprendre à dépasser la peur du jugement, t'affirmer avec plus de confiance, améliorer ton image personnelle et professionnelle, poser les bases de ton identité forte.",
    bouton: "Je m'inscris à la masterclass OSE",
    lien: "/masterclass",
  },
  {
    id: 2,
    titre: "Nomination des 100 Leaders du Bénin",
    badge: "Événement",
    badge_color: "#C9A96A",
    date: "Samedi 25 avril",
    lieu: "Salle de fête LUCIDE, Godomey",
    description: "Un moment fort et symbolique. Prélia APEDO AHONON sera officiellement nommée parmi les 100 leaders du Bénin, une reconnaissance du travail, de l'impact et de la vision portée à travers Métamorphose. Cet événement représente une étape importante dans un parcours d'engagement, de leadership et de transformation.",
    bouton: "Voir les détails de la cérémonie",
    lien: "/actualites",
  },
  {
    id: 3,
    titre: "Brunch Métamorphose",
    badge: "Décembre 2026",
    badge_color: "#C2185B",
    date: "Décembre 2026",
    lieu: "À préciser — Bénin",
    description: "Le Brunch Métamorphose est une expérience exclusive pensée pour réunir les femmes de la communauté dans un cadre élégant, intime et inspirant. C'est un moment de célébration, de connexion et de croissance. Au programme : échanges authentiques entre femmes ambitieuses, partage d'expériences de transformation, discussions autour de l'image, de la confiance et du leadership, ambiance élégante et conviviale, inspiration et networking.",
    bouton: "Je veux participer au Brunch Métamorphose",
    lien: "/brunch",
  },
];

export default function Evenements() {
  useReveal();
  const [evenements, setEvenements] = useState(EVENEMENTS_DEFAUT);
  useEffect(() => {
    evenementsAPI.liste().then(r => { if (Array.isArray(r.data) && r.data.length > 0) setEvenements(r.data); }).catch(() => {});
  }, []);
  const [form, setForm] = useState({ nom:"", prenom:"", email:"", whatsapp:"" });
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function inscrire(e) {
    e.preventDefault();
    if (!form.email.trim()) { setError("L'email est requis."); return; }
    setLoading(true); setError("");
    try {
      await newsletterAPI.abonner({ email: form.email, prenom: form.prenom });
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
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 50% at 50% 60%,rgba(194,24,91,.07),transparent)", pointerEvents:"none" }}/>
          <div style={{ position:"relative", maxWidth:"680px", margin:"0 auto" }}>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".3em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"16px", animation:"fadeUp .6s both" }}>Événements</p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,6vw,3.5rem)", fontWeight:700, lineHeight:1.1, marginBottom:"20px", animation:"fadeUp .7s .1s both" }}>
              Les événements Métamorphose
            </h1>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:"1rem", color:"rgba(248,245,242,.55)", lineHeight:1.8, animation:"fadeUp .7s .2s both", marginBottom:"36px" }}>
              Participe à des expériences puissantes conçues pour t'élever, te transformer
              et t'aider à incarner une nouvelle version de toi-même.
            </p>
            <a href="#evenements" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#C2185B", color:"#fff", fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:".75rem", letterSpacing:".16em", textTransform:"uppercase", padding:"15px 32px", borderRadius:"2px", textDecoration:"none", animation:"fadeUp .7s .3s both" }}>
              Voir les événements à venir
            </a>
          </div>
        </section>

        <div style={{ maxWidth:"960px", margin:"0 auto", padding:"0 24px 100px" }}>

          {/* Intro */}
          <section style={{ padding:"64px 0 0", textAlign:"center" }}>
            <p className="reveal" style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.15rem", color:"rgba(248,245,242,.65)", lineHeight:1.9, maxWidth:"640px", margin:"0 auto" }}>
              Chaque événement Métamorphose est une opportunité de transformation.
              Masterclass, cérémonies, rencontres et expériences live — tout est conçu
              pour t'aider à évoluer, t'affirmer et prendre ta place.
              Ici, tu ne fais pas que participer. Tu changes de niveau.
            </p>
          </section>

          {/* Événements */}
          <section id="evenements" style={{ padding:"72px 0 0" }}>
            <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"40px" }}>
              Événements à venir
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:"32px" }}>
              {evenements.map((evt, i) => (
                <div key={evt.id} className="reveal" style={{ transitionDelay:`${i*.1}s`, background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"6px", overflow:"hidden", display:"grid", gridTemplateColumns:evt.photo?"1fr 1fr":"1fr" }}>
                  {!evt.photo && <div style={{ height:"8px", background:`linear-gradient(90deg,${evt.badge_color}40,transparent)` }}/>}
                  <div style={{ padding:"36px 32px" }}>
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", flexWrap:"wrap", gap:"12px", marginBottom:"20px" }}>
                      <div>
                        <span style={{ display:"inline-block", padding:"4px 12px", background:`${evt.badge_color}15`, border:`1px solid ${evt.badge_color}40`, borderRadius:"100px", fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", fontWeight:600, letterSpacing:".15em", textTransform:"uppercase", color:evt.badge_color, marginBottom:"12px" }}>
                          {evt.badge}
                        </span>
                        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.3rem,3vw,1.8rem)", fontWeight:600, lineHeight:1.2 }}>{evt.titre}</h2>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:"24px", flexWrap:"wrap", marginBottom:"20px" }}>
                      <div>
                        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(248,245,242,.3)", marginBottom:"4px" }}>Date</p>
                        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"#C9A96A", fontWeight:500 }}>{evt.date}</p>
                      </div>
                      <div>
                        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(248,245,242,.3)", marginBottom:"4px" }}>Lieu</p>
                        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"rgba(248,245,242,.7)", fontWeight:300 }}>{evt.lieu}</p>
                      </div>
                    </div>
                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.55)", lineHeight:1.8, marginBottom:"24px" }}>
                      {evt.description}
                    </p>
                    <Link to={evt.lien} style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"transparent", color:"#C9A96A", border:"1px solid rgba(201,169,106,.3)", fontFamily:"'Montserrat',sans-serif", fontWeight:600, fontSize:".72rem", letterSpacing:".12em", textTransform:"uppercase", padding:"12px 24px", borderRadius:"2px", textDecoration:"none" }}>
                      {evt.bouton}
                    </Link>
                  </div>
                  {evt.photo && (
                    <div style={{ overflow:"hidden", minHeight:"300px" }}>
                      <img src={evt.photo} alt={evt.titre} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center" }}/>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Pourquoi participer */}
          <section style={{ padding:"72px 0 0" }}>
            <div className="reveal" style={{ padding:"48px 24px", background:"rgba(201,169,106,.04)", border:"1px solid rgba(201,169,106,.12)", borderRadius:"6px" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"14px" }}>Pourquoi participer</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.3rem,3vw,1.8rem)", fontWeight:600, marginBottom:"20px" }}>
                Pourquoi assister aux événements Métamorphose ?
              </h2>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.6)", lineHeight:1.9 }}>
                Parce que la transformation ne se fait pas seulement en ligne. Elle se vit.
                Elle se ressent. Elle se déclenche dans l'expérience. Ces événements sont
                des espaces où tu passes à un autre niveau : mentalement, émotionnellement
                et dans ton identité.
              </p>
            </div>
          </section>

          {/* Urgence */}
          <section style={{ padding:"72px 0 0", textAlign:"center" }}>
            <div className="reveal">
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.15rem", color:"rgba(248,245,242,.6)", lineHeight:1.9, maxWidth:"560px", margin:"0 auto 28px" }}>
                Les places sont parfois limitées. Et certaines opportunités ne se présentent
                qu'une seule fois. Ne regarde pas les changements — deviens-en actrice.
              </p>
              <a href="#inscription" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#C2185B", color:"#fff", fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:".75rem", letterSpacing:".16em", textTransform:"uppercase", padding:"15px 32px", borderRadius:"2px", textDecoration:"none" }}>
                Je rejoins les événements Métamorphose
              </a>
            </div>
          </section>

          {/* Inscription */}
          <section id="inscription" style={{ padding:"72px 0 0" }}>
            <div style={{ background:"rgba(255,255,255,.02)", border:"1px solid rgba(201,169,106,.12)", borderRadius:"6px", padding:"48px 24px" }}>
              <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"8px" }}>Inscription</p>
              <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.3rem,3vw,1.8rem)", fontWeight:600, marginBottom:"32px" }}>
                Ne manque aucun événement
              </h2>

              {done ? (
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", color:"#C9A96A", textAlign:"center" }}>
                  Inscription confirmée. Vous serez informée en priorité.
                </p>
              ) : (
                <form onSubmit={inscrire}>
                  <div className="form-grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"14px" }}>
                    <div>
                      <label className="evt-label">Nom</label>
                      <input className="evt-input" value={form.nom} onChange={e=>set("nom",e.target.value)} placeholder="Votre nom"/>
                    </div>
                    <div>
                      <label className="evt-label">Prénom</label>
                      <input className="evt-input" value={form.prenom} onChange={e=>set("prenom",e.target.value)} placeholder="Votre prénom"/>
                    </div>
                    <div>
                      <label className="evt-label">Email *</label>
                      <input className="evt-input" type="email" required value={form.email} onChange={e=>set("email",e.target.value)} placeholder="votre@email.com"/>
                    </div>
                    <div>
                      <label className="evt-label">WhatsApp</label>
                      <input className="evt-input" value={form.whatsapp} onChange={e=>set("whatsapp",e.target.value)} placeholder="+229 00 00 00 00"/>
                    </div>
                  </div>
                  {error && <p style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", borderRadius:"4px", padding:"10px 14px", fontSize:".78rem", color:"#f87171", marginBottom:"14px" }}>{error}</p>}
                  <button type="submit" disabled={loading}
                    style={{ width:"100%", padding:"15px", background:"#C9A96A", border:"none", borderRadius:"3px", color:"#0A0A0A", fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:".78rem", letterSpacing:".16em", textTransform:"uppercase", cursor:loading?"not-allowed":"pointer", opacity:loading?.7:1 }}>
                    {loading ? "Inscription..." : "Recevoir les prochaines dates"}
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
