import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { communauteAPI } from "../services/api";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --noir:#0A0A0A; --or:#C9A96A; --or-light:#E8D5A8;
    --rose:#C2185B; --blanc:#F8F5F2; --marine:#0D1B2A;
    --ff-t:'Playfair Display',Georgia,serif;
    --ff-b:'Montserrat',sans-serif;
    --ff-a:'Cormorant Garamond',Georgia,serif;
  }
  html { scroll-behavior:smooth; }
  body { background:var(--noir); color:var(--blanc); font-family:var(--ff-b); font-weight:300; line-height:1.7; overflow-x:hidden; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes shimmerGold { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes revealLine { from{width:0} to{width:40px} }
  .reveal { opacity:0; transform:translateY(30px); transition:opacity .8s ease,transform .8s ease; }
  .reveal.visible { opacity:1; transform:none; }
  .btn-primary { display:inline-flex; align-items:center; justify-content:center; padding:15px 36px; background:#C9A96A; border:none; border-radius:2px; color:#0A0A0A; font-family:'Montserrat',sans-serif; font-weight:700; font-size:.72rem; letter-spacing:.18em; text-transform:uppercase; cursor:pointer; transition:all .3s; text-decoration:none; }
  .btn-primary:hover { background:#E8D5A8; transform:translateY(-2px); }
  .btn-secondary { display:inline-flex; align-items:center; justify-content:center; padding:14px 32px; background:transparent; border:1px solid rgba(201,169,106,.35); border-radius:2px; color:#C9A96A; font-family:'Montserrat',sans-serif; font-weight:500; font-size:.72rem; letter-spacing:.18em; text-transform:uppercase; cursor:pointer; transition:all .3s; text-decoration:none; }
  .btn-secondary:hover { border-color:#C9A96A; background:rgba(201,169,106,.05); transform:translateY(-2px); }
  .principe-card { padding:36px 28px; background:rgba(255,255,255,.018); border:1px solid rgba(255,255,255,.06); border-left:2px solid rgba(201,169,106,.25); transition:border-color .4s, background .4s; }
  .principe-card:hover { border-left-color:#C9A96A; background:rgba(201,169,106,.025); }
  .checkbox-wrap { display:flex; align-items:center; gap:16px; padding:20px 24px; border:1px solid rgba(201,169,106,.2); border-radius:2px; cursor:pointer; transition:all .35s; background:rgba(255,255,255,.02); }
  .checkbox-wrap:hover { border-color:rgba(201,169,106,.45); background:rgba(201,169,106,.04); }
  .checkbox-wrap.checked { border-color:#C9A96A; background:rgba(201,169,106,.06); }
  .checkbox-box { width:20px; height:20px; border:1px solid rgba(201,169,106,.4); border-radius:2px; flex-shrink:0; display:flex; align-items:center; justify-content:center; transition:all .3s; }
  .checkbox-box.checked { background:#C9A96A; border-color:#C9A96A; }
  .check-mark { width:10px; height:6px; border-left:2px solid #0A0A0A; border-bottom:2px solid #0A0A0A; transform:rotate(-45deg) translateY(-1px); opacity:0; transition:opacity .2s; }
  .check-mark.visible { opacity:1; }
  .overlay { position:fixed; inset:0; background:rgba(0,0,0,.92); z-index:500; display:flex; align-items:center; justify-content:center; padding:24px; animation:fadeIn .3s both; backdrop-filter:blur(8px); }
  .modal-vip { background:linear-gradient(135deg,#080808,#0D1020); border:1px solid rgba(201,169,106,.2); border-radius:4px; max-width:480px; width:100%; padding:48px 40px; animation:fadeUp .4s both; position:relative; }
  @media(max-width:768px) {
    .modal-vip { padding:32px 20px !important; }
    .welcome-card { padding:32px 20px !important; }
    .principes-grid { grid-template-columns:1fr !important; }
  }
  .modal-vip::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,#C9A96A,transparent); }
  .c-input { width:100%; padding:13px 16px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:2px; color:#F8F5F2; font-family:'Montserrat',sans-serif; font-size:.88rem; font-weight:300; outline:none; transition:border-color .25s; letter-spacing:.03em; }
  .c-input:focus { border-color:rgba(201,169,106,.4); background:rgba(201,169,106,.02); }
  .c-label { font-family:'Montserrat',sans-serif; font-size:.58rem; letter-spacing:.2em; text-transform:uppercase; color:rgba(248,245,242,.35); display:block; margin-bottom:8px; }
  .welcome-card { background:linear-gradient(135deg,#080808,#0D1020); border:1px solid rgba(201,169,106,.2); border-radius:4px; max-width:640px; margin:0 auto; padding:48px 40px; position:relative; }
  .welcome-card::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,#C9A96A,transparent); }
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

const PRINCIPES = [
  {
    num: "01",
    titre: "Respect et bienveillance",
    texte: "Chaque femme ici est en chemin. Aucune critique blessante, aucun jugement, aucune comparaison toxique ne sont tolérés. Nous nous parlons avec respect, douceur et intelligence.",
  },
  {
    num: "02",
    titre: "Engagement et implication",
    texte: "Cette communauté n'est pas un espace passif. Tu es invitée à participer, partager et t'impliquer dans ton évolution. Plus tu t'engages, plus tu évolues.",
  },
  {
    num: "03",
    titre: "Authenticité",
    texte: "Sois vraie. Sois toi. Cet espace est un lieu sécurisé où tu peux t'exprimer sans masque, sans pression, sans peur du regard des autres.",
  },
  {
    num: "04",
    titre: "Aucune promotion personnelle",
    texte: "Pour préserver la qualité de l'expérience, la publicité, la vente et le spam ne sont pas autorisés sans validation préalable.",
  },
  {
    num: "05",
    titre: "Confidentialité absolue",
    texte: "Ce qui est partagé ici reste ici. Chaque membre doit se sentir en sécurité pour s'exprimer librement.",
  },
  {
    num: "06",
    titre: "Esprit de croissance",
    texte: "Ici, nous ne stagnons pas. Nous sommes des femmes qui apprennent, évoluent, se challengent et deviennent meilleures chaque jour.",
  },
  {
    num: "07",
    titre: "Responsabilité personnelle",
    texte: "Ta transformation t'appartient. La communauté est un soutien — mais c'est ton engagement qui fera la différence.",
  },
];

const WHATSAPP_COMMUNAUTE = "https://chat.whatsapp.com/K0yWRhfTnIzCTT3ilGoQw4?mode=gi_t";

// ── MODAL AUTHENTIFICATION VIP ────────────────────────────────────
function ModalAuth({ onClose, onSuccess }) {
  const [email,   setEmail]   = useState("");
  const [cle,     setCle]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const token = localStorage.getItem("mmorphose_token");

  async function valider(e) {
    e.preventDefault();
    if (!email.trim() || !cle.trim()) { setError("Tous les champs sont requis."); return; }
    setLoading(true); setError("");
    try {
      const res = await communauteAPI.verifierCle({ email: email.trim(), cle: cle.trim().toUpperCase() });
      if (res.data.acces) {
        onSuccess(false);
      } else {
        setError(res.data.detail || "Identifiants invalides.");
      }
    } catch { setError("Erreur réseau. Veuillez réessayer."); }
    setLoading(false);
  }

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-vip">
        <div style={{ textAlign:"center", marginBottom:"40px" }}>
          <div style={{ width:"30px", height:"1px", background:"rgba(201,169,106,.4)", margin:"0 auto 20px" }}/>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".55rem", letterSpacing:".35em", textTransform:"uppercase", color:"rgba(201,169,106,.45)", marginBottom:"14px" }}>
            Accès réservé
          </p>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.4rem,3vw,1.9rem)", fontWeight:400, lineHeight:1.15, color:"#F8F5F2", marginBottom:"10px" }}>
            Cercle privé<br/>
            <em style={{ fontStyle:"italic", fontWeight:300, color:"#C9A96A" }}>des Métamorphosées</em>
          </h2>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".78rem", color:"rgba(248,245,242,.35)", lineHeight:1.7 }}>
            Votre clé d'accès vous a été transmise personnellement par Coach Ahonon à la fin de votre programme.
          </p>
        </div>

        <form onSubmit={valider} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          <div>
            <label className="c-label">Adresse email</label>
            <input className="c-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="votre@email.com" autoComplete="email"/>
          </div>
          <div>
            <label className="c-label">Clé d'accès personnelle</label>
            <input className="c-input" value={cle} onChange={e=>setCle(e.target.value)} placeholder="Votre clé unique" autoComplete="off" style={{ letterSpacing:".06em" }}/>
          </div>

          {error && (
            <p style={{ background:"rgba(239,68,68,.07)", border:"1px solid rgba(239,68,68,.2)", borderRadius:"2px", padding:"10px 14px", fontFamily:"'Montserrat',sans-serif", fontSize:".75rem", color:"#f87171", lineHeight:1.5 }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ width:"100%", padding:"15px", marginTop:"8px" }}>
            {loading ? "Vérification en cours..." : "Accéder à la communauté"}
          </button>
        </form>

        <button onClick={onClose} style={{ display:"block", width:"100%", marginTop:"16px", padding:"10px", background:"none", border:"none", color:"rgba(248,245,242,.2)", fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", letterSpacing:".1em", textTransform:"uppercase", cursor:"pointer" }}>
          Fermer
        </button>
      </div>
    </div>
  );
}

// ── MESSAGE DE BIENVENUE ──────────────────────────────────────────
function MessageBienvenue({ onClose }) {
  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ maxWidth:"640px", width:"100%", maxHeight:"90vh", overflowY:"auto", padding:"24px" }}>
        <div className="welcome-card">
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".55rem", letterSpacing:".3em", textTransform:"uppercase", color:"rgba(201,169,106,.45)", marginBottom:"8px" }}>
            Message d'intégration automatique — Communauté Métamorphosées
          </p>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.3rem,3vw,1.8rem)", fontWeight:400, lineHeight:1.2, color:"#F8F5F2", marginBottom:"32px" }}>
            Bienvenue dans la communauté<br/>
            <em style={{ fontStyle:"italic", fontWeight:300, color:"#C9A96A" }}>des Métamorphosées.</em>
          </h2>

          <div style={{ borderTop:"1px solid rgba(201,169,106,.12)", paddingTop:"28px", display:"flex", flexDirection:"column", gap:"16px" }}>
            {[
              "Nous sommes heureuses de t'accueillir dans ce cercle privé, réservé aux femmes qui ont décidé de se choisir, de s'élever et de devenir une version plus confiante, plus affirmée et plus impactante d'elles-mêmes.",
              "Ton entrée ici marque une étape importante. Celle où tu ne fais plus ce chemin seule.",
            ].map((para, i) => (
              <p key={i} style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.6)", lineHeight:1.85 }}>{para}</p>
            ))}

            <div style={{ padding:"20px 24px", background:"rgba(201,169,106,.04)", border:"1px solid rgba(201,169,106,.1)", borderRadius:"2px" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", marginBottom:"12px" }}>Ici, tu trouveras</p>
              {["Du soutien", "Des échanges enrichissants", "De l'inspiration", "Une énergie collective qui te pousse à avancer"].map((item, i) => (
                <div key={i} style={{ display:"flex", gap:"12px", marginBottom:"8px" }}>
                  <div style={{ width:"3px", height:"3px", borderRadius:"50%", background:"rgba(201,169,106,.5)", flexShrink:0, marginTop:"9px" }}/>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.6)" }}>{item}</p>
                </div>
              ))}
            </div>

            <div style={{ padding:"20px 24px", background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.05)", borderRadius:"2px" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(248,245,242,.3)", marginBottom:"12px" }}>Pour bien commencer</p>
              {[
                "Présente-toi en quelques mots : nom, prénom, âge, date d'anniversaire, secteur d'activité, pays de résidence, situation matrimoniale avec ou sans enfant, ta passion, ce que Métamorphose t'a apporté, ce que tu attends de cette communauté.",
                "Prends le temps de lire le règlement.",
                "Et surtout, n'hésite pas à interagir.",
              ].map((item, i) => (
                <div key={i} style={{ display:"flex", gap:"12px", marginBottom:"8px" }}>
                  <div style={{ width:"3px", height:"3px", borderRadius:"50%", background:"rgba(248,245,242,.2)", flexShrink:0, marginTop:"9px" }}/>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.55)", lineHeight:1.7 }}>{item}</p>
                </div>
              ))}
            </div>

            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1rem", color:"rgba(201,169,106,.6)", lineHeight:1.8 }}>
              Plus tu participes, plus tu évolues.
            </p>

            <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.55)", lineHeight:1.85 }}>
              Nous sommes ravies de te compter parmi nous. Et nous avons hâte de te voir briller.
            </p>

            <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:".95rem", color:"rgba(248,245,242,.7)" }}>
              Bienvenue dans ton nouveau cercle.
            </p>
          </div>

          <div style={{ borderTop:"1px solid rgba(201,169,106,.12)", paddingTop:"28px", marginTop:"8px" }}>
            <a href={WHATSAPP_COMMUNAUTE} target="_blank" rel="noreferrer" className="btn-primary" style={{ display:"block", width:"100%", textAlign:"center", background:"#25D366", color:"#fff" }}>
              Intégrer la Communauté MMO
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── PAGE PRINCIPALE ───────────────────────────────────────────────
export default function Communaute() {
  useReveal();
  const [modal,    setModal]    = useState(null); // null | "auth" | "bienvenue"
  const [engaged,  setEngaged]  = useState(false);
  const [premiere, setPremiere] = useState(false);

  function ouvrirAuth() { setModal("auth"); }

  function onAuthSuccess(estPremiere) {
    setPremiere(estPremiere);
    setModal("bienvenue");
  }

  return (
    <>
      <style>{STYLES}</style>

      {modal === "auth" && (
        <ModalAuth onClose={() => setModal(null)} onSuccess={onAuthSuccess}/>
      )}
      {modal === "bienvenue" && (
        <MessageBienvenue onClose={() => setModal(null)}/>
      )}

      <div style={{ background:"#0A0A0A", color:"#F8F5F2", minHeight:"100vh" }}>

        {/* Nav */}
        <nav style={{ padding:"18px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"rgba(10,10,10,.97)", backdropFilter:"blur(20px)", zIndex:100 }}>
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
        <section style={{ padding:"120px 24px 80px", textAlign:"center", background:"linear-gradient(180deg,#0A0A0A 0%,#0D1020 100%)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 50% at 50% 70%,rgba(201,169,106,.05),transparent)", pointerEvents:"none" }}/>
          <div style={{ position:"relative", maxWidth:"700px", margin:"0 auto" }}>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".58rem", letterSpacing:".35em", textTransform:"uppercase", color:"rgba(201,169,106,.45)", marginBottom:"20px", animation:"fadeUp .6s both" }}>
              Cercle privé — Réservé aux Métamorphosées
            </p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,6vw,3.8rem)", fontWeight:400, lineHeight:1.08, marginBottom:"28px", animation:"fadeUp .7s .1s both" }}>
              Bienvenue dans<br/>
              <em style={{ fontStyle:"italic", fontWeight:300, background:"linear-gradient(135deg,#C9A96A,#E8D5A8,#C9A96A)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmerGold 4s linear infinite" }}>
                un espace d'exception.
              </em>
            </h1>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:"clamp(.88rem,2vw,1rem)", color:"rgba(248,245,242,.5)", lineHeight:1.9, marginBottom:"12px", animation:"fadeUp .7s .2s both", maxWidth:"560px", margin:"0 auto 12px" }}>
              Cette communauté est un cercle privé, réservé exclusivement aux femmes ayant suivi le programme Métamorphose. Ici, nous cultivons la croissance, l'élégance, le respect et l'élévation.
            </p>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1rem", color:"rgba(201,169,106,.55)", marginBottom:"40px", animation:"fadeUp .7s .25s both" }}>
              Pour préserver la qualité et l'énergie de cet espace, chaque membre s'engage à respecter les principes suivants.
            </p>
            <div className="btns-hero" style={{ display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap", animation:"fadeUp .7s .3s both" }}>
              <button className="btn-primary" onClick={ouvrirAuth}>
                Rejoindre la communauté MMO
              </button>
              <Link to="/contact" className="btn-secondary">
                Rejoindre le programme MMO
              </Link>
            </div>
          </div>
        </section>

        <div style={{ maxWidth:"1000px", margin:"0 auto", padding:"0 24px 120px" }}>

          {/* Séparateur */}
          <div style={{ display:"flex", alignItems:"center", gap:"24px", padding:"64px 0 48px" }}>
            <div style={{ flex:1, height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.2))" }}/>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".58rem", letterSpacing:".3em", textTransform:"uppercase", color:"rgba(201,169,106,.3)", whiteSpace:"nowrap" }}>Les 7 principes</p>
            <div style={{ flex:1, height:"1px", background:"linear-gradient(90deg,rgba(201,169,106,.2),transparent)" }}/>
          </div>

          {/* Principes */}
          <div className="principes-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px" }}>
            {PRINCIPES.map((p, i) => (
              <div key={i} className={`principe-card reveal`}
                style={{ transitionDelay:`${i*.07}s`, gridColumn: i === 6 ? "1 / -1" : "auto" }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:"14px", marginBottom:"14px" }}>
                  <span style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.3rem", color:"rgba(201,169,106,.25)", flexShrink:0 }}>{p.num}</span>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:".95rem", fontWeight:600, color:"rgba(248,245,242,.85)", lineHeight:1.3 }}>{p.titre}</h3>
                </div>
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".84rem", color:"rgba(248,245,242,.5)", lineHeight:1.85 }}>{p.texte}</p>
              </div>
            ))}
          </div>

          {/* Séparateur */}
          <div style={{ display:"flex", alignItems:"center", gap:"24px", padding:"64px 0 48px" }}>
            <div style={{ flex:1, height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.15))" }}/>
            <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"rgba(201,169,106,.3)" }}/>
            <div style={{ flex:1, height:"1px", background:"linear-gradient(90deg,rgba(201,169,106,.15),transparent)" }}/>
          </div>

          {/* Rappel final */}
          <section className="reveal" style={{ maxWidth:"680px", margin:"0 auto", textAlign:"center", marginBottom:"48px" }}>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".58rem", letterSpacing:".3em", textTransform:"uppercase", color:"rgba(201,169,106,.35)", marginBottom:"20px" }}>
              Rappel final
            </p>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"clamp(1.05rem,2.5vw,1.3rem)", color:"rgba(248,245,242,.65)", lineHeight:1.9, marginBottom:"20px" }}>
              Tu n'es pas ici par hasard. Tu fais partie d'un cercle de femmes qui ont décidé de se choisir, de s'élever et de devenir une référence dans leur vie personnelle et professionnelle.
            </p>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(.95rem,2vw,1.1rem)", color:"rgba(248,245,242,.8)", lineHeight:1.75 }}>
              Honore cet espace. Honore ton engagement.<br/>
              Et surtout — honore la femme que tu deviens.
            </p>
          </section>

          {/* Engagement */}
          <section className="reveal" style={{ maxWidth:"620px", margin:"0 auto 56px" }}>
            <div className={`checkbox-wrap ${engaged ? "checked" : ""}`} onClick={() => setEngaged(p => !p)}>
              <div className={`checkbox-box ${engaged ? "checked" : ""}`}>
                <div className={`check-mark ${engaged ? "visible" : ""}`}/>
              </div>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".78rem", fontWeight: engaged ? 500 : 300, color: engaged ? "#C9A96A" : "rgba(248,245,242,.55)", letterSpacing:".04em", lineHeight:1.6, transition:"all .3s" }}>
                Je m'engage à respecter ces règles et à évoluer pleinement
              </p>
            </div>
            {engaged && (
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:".9rem", color:"rgba(201,169,106,.5)", textAlign:"center", marginTop:"14px", animation:"fadeUp .5s both" }}>
                Ton engagement est acté. Bienvenue pleinement dans ce cercle.
              </p>
            )}
          </section>

          {/* Boutons pied de page */}
          <section className="reveal" style={{ textAlign:"center" }}>
            <div className="btns-hero" style={{ display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap" }}>
              <button className="btn-primary" onClick={ouvrirAuth}>
                Rejoindre la communauté MMO
              </button>
              <Link to="/contact" className="btn-secondary">
                Rejoindre le programme MMO
              </Link>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
