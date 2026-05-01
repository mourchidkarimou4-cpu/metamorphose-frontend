import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import usePageBackground from "../hooks/usePageBackground";
import AuraButton from '../components/AuraButton';
import { Link, useNavigate } from "react-router-dom";
import { learningAPI } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || '';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --noir:#0A0A0A; --or:#C9A96A; --or-light:#E8D5A8;
    --rose:#C2185B; --beige:#D8C1A0; --blanc:#F8F5F2;
    --ff-t:'Playfair Display',Georgia,serif;
    --ff-b:'Montserrat',sans-serif;
    --ff-a:'Cormorant Garamond',Georgia,serif;
    --ease:cubic-bezier(0.4,0,0.2,1);
  }
  html { scroll-behavior:smooth; }
  body { background:var(--noir); color:var(--blanc); font-family:var(--ff-b); font-weight:300; line-height:1.7; overflow-x:hidden; }

  @keyframes fadeUp  { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes pulse-rose { 0%,100%{box-shadow:0 0 24px rgba(194,24,91,.35)} 50%{box-shadow:0 0 52px rgba(194,24,91,.65)} }

  .reveal { opacity:0; transform:translateY(30px); transition:opacity .8s ease,transform .8s ease; }
  .reveal.visible { opacity:1; transform:none; }

  .btn-p {
    display:inline-flex; align-items:center; justify-content:center; gap:10px;
    background:var(--rose); color:#fff; font-family:var(--ff-b); font-weight:700;
    font-size:.75rem; letter-spacing:.16em; text-transform:uppercase;
    padding:15px 32px; border:none; border-radius:2px; cursor:pointer;
    text-decoration:none; transition:all .35s var(--ease);
  }
  .btn-p:hover { background:#a01049; transform:translateY(-3px); box-shadow:0 14px 40px rgba(194,24,91,.4); }
  .btn-p:disabled { opacity:.6; cursor:not-allowed; transform:none; }

  .btn-or {
    display:inline-flex; align-items:center; justify-content:center; gap:10px;
    background:transparent; color:var(--or); font-family:var(--ff-b); font-weight:600;
    font-size:.72rem; letter-spacing:.16em; text-transform:uppercase;
    padding:12px 24px; border:1px solid var(--or); border-radius:2px; cursor:pointer;
    text-decoration:none; transition:all .35s;
  }
  .btn-or:hover { background:var(--or); color:var(--noir); }

  .btn-green {
    display:inline-flex; align-items:center; justify-content:center; gap:10px;
    background:rgba(37,211,102,.12); color:#25D366; font-family:var(--ff-b); font-weight:700;
    font-size:.72rem; letter-spacing:.16em; text-transform:uppercase;
    padding:12px 24px; border:1px solid rgba(37,211,102,.3); border-radius:2px; cursor:pointer;
    text-decoration:none; transition:all .35s;
  }
  .btn-green:hover { background:rgba(37,211,102,.2); }

  .cat-btn {
    padding:9px 20px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.08);
    border-radius:100px; color:rgba(248,245,242,.5); font-family:var(--ff-b); font-size:.65rem;
    letter-spacing:.12em; text-transform:uppercase; cursor:pointer; transition:all .25s;
  }
  .cat-btn.active, .cat-btn:hover {
    background:rgba(201,169,106,.12); border-color:rgba(201,169,106,.4); color:var(--or);
  }

  .product-card {
    background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.06);
    border-radius:8px; overflow:hidden; display:flex; flex-direction:column;
    transition:all .35s var(--ease);
  }
  .product-card:hover { border-color:rgba(201,169,106,.3); transform:translateY(-6px); box-shadow:0 24px 60px rgba(0,0,0,.4); }

  .verrou-overlay {
    position:absolute; inset:0; background:rgba(10,10,10,.7);
    display:flex; align-items:center; justify-content:center;
    backdrop-filter:blur(2px);
  }

  .modal-overlay {
    position:fixed; inset:0; background:rgba(0,0,0,.85); z-index:500;
    display:flex; align-items:center; justify-content:center; padding:20px;
    backdrop-filter:blur(8px);
  }
  .modal-box {
    background:#111; border:1px solid rgba(201,169,106,.2); border-radius:8px;
    padding:36px 32px; width:100%; max-width:480px; position:relative;
    max-height:90vh; overflow-y:auto; animation:fadeUp .3s both;
  }

  @media(max-width:768px) {
    .products-grid { grid-template-columns:1fr !important; }
    .modal-box { padding:24px 18px; }
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

const FORMAT_LABELS = { texte:'Article', video:'Vidéo', audio:'Audio', pdf:'PDF' };
const NIVEAU_COLORS = { debutant:'#4CAF50', intermediaire:'#C9A96A', avance:'#C2185B' };
const NIVEAU_LABELS = { debutant:'Débutant', intermediaire:'Intermédiaire', avance:'Avancé' };

/* ── Modal détail cours ────────────────────────────────────── */
function ModalCours({ cours, onClose }) {
  const navigate = useNavigate();
  const { token, user } = useAuth();

  if (!cours) return null;

  const gratuit    = !cours.prix || cours.prix === 0;
  const aAcces     = cours.a_acces;
  const lienAchat  = cours.lien_achat;

  function handleAcheter() {
    if (!token) { navigate("/espace-membre"); return; }
    if (lienAchat) {
      window.open(lienAchat, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <button onClick={onClose} style={{ position:"absolute", top:"16px", right:"18px", background:"none", border:"none", color:"rgba(201,169,106,.5)", fontSize:".8rem", cursor:"pointer", fontFamily:"var(--ff-b)", letterSpacing:".1em", textTransform:"uppercase" }}>
          Fermer
        </button>

        {/* En-tête */}
        <div style={{ marginBottom:"20px" }}>
          <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"10px" }}>
            {cours.format && (
              <span style={{ padding:"3px 10px", borderRadius:"100px", background:"rgba(201,169,106,.1)", border:"1px solid rgba(201,169,106,.25)", fontFamily:"var(--ff-b)", fontSize:".58rem", color:"var(--or)", letterSpacing:".1em", textTransform:"uppercase" }}>
                {FORMAT_LABELS[cours.format] || cours.format}
              </span>
            )}
            {cours.niveau && (
              <span style={{ padding:"3px 10px", borderRadius:"100px", background:`${NIVEAU_COLORS[cours.niveau]}18`, border:`1px solid ${NIVEAU_COLORS[cours.niveau]}40`, fontFamily:"var(--ff-b)", fontSize:".58rem", color:NIVEAU_COLORS[cours.niveau], letterSpacing:".1em", textTransform:"uppercase" }}>
                {NIVEAU_LABELS[cours.niveau] || cours.niveau}
              </span>
            )}
            {aAcces && (
              <span style={{ padding:"3px 10px", borderRadius:"100px", background:"rgba(37,211,102,.12)", border:"1px solid rgba(37,211,102,.3)", fontFamily:"var(--ff-b)", fontSize:".58rem", color:"#25D366", letterSpacing:".1em", textTransform:"uppercase" }}>
                Accès actif
              </span>
            )}
          </div>
          <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.4rem", fontWeight:600, marginBottom:"10px", lineHeight:1.3 }}>{cours.titre}</h2>
          <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.6)", lineHeight:1.8 }}>{cours.description}</p>
        </div>

        {/* Prix */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", borderRadius:"4px", marginBottom:"24px" }}>
          <span style={{ fontFamily:"var(--ff-b)", fontSize:".75rem", color:"rgba(248,245,242,.4)" }}>Prix</span>
          <span style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:700, color: gratuit ? "#25D366" : "var(--or)" }}>
            {gratuit ? "Gratuit" : `${cours.prix.toLocaleString("fr-FR")} FCFA`}
          </span>
        </div>

        {/* CTA */}
        {aAcces ? (
          <Link to="/mmo-learning" className="btn-green" style={{ width:"100%", textAlign:"center" }}>
            Accéder au cours
          </Link>
        ) : !token ? (
          <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
            <Link to="/espace-membre" onClick={onClose} className="btn-p" style={{ width:"100%", textAlign:"center" }}>
              Se connecter pour acheter
            </Link>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".68rem", color:"rgba(248,245,242,.3)", textAlign:"center" }}>
              Un compte est nécessaire pour recevoir ton accès après paiement.
            </p>
          </div>
        ) : lienAchat ? (
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            <button onClick={handleAcheter} className="btn-p" style={{ width:"100%", animation:"pulse-rose 3s ease-in-out infinite" }}>
              {gratuit ? "Obtenir gratuitement" : `Acheter — ${cours.prix?.toLocaleString("fr-FR")} FCFA`}
            </button>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", color:"rgba(248,245,242,.25)", textAlign:"center", lineHeight:1.6 }}>
              Tu seras redirigée vers la page de paiement sécurisée. Ton accès sera activé sous 24h par Coach Prélia APEDO AHONON.
            </p>
          </div>
        ) : (
          <div style={{ padding:"16px", background:"rgba(201,169,106,.05)", border:"1px solid rgba(201,169,106,.15)", borderRadius:"4px", textAlign:"center" }}>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".78rem", color:"rgba(248,245,242,.5)", lineHeight:1.7 }}>
              Contacte Coach Prélia APEDO AHONON sur WhatsApp pour obtenir ce cours.
            </p>
            <a href="https://wa.me/message/DI23LCDIMS5SF1" target="_blank" rel="noreferrer" className="btn-or" style={{ marginTop:"14px", display:"inline-flex" }}>
              Contacter sur WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── COMPOSANT PRINCIPAL ────────────────────────────────────── */
export default function Store() {
  usePageBackground("store");
  useReveal();

  const [cours, setCours]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [categorie, setCategorie] = useState("tout");
  const [selectionne, setSelectionne] = useState(null);

  const { token, user } = useAuth();

  useEffect(() => {
    chargerCours();
  }, []);

  async function chargerCours() {
    setLoading(true);
    try {
      // Si connecté, charger mes-cours pour avoir a_acces, sinon liste publique
      const endpoint = token ? '/api/learning/mes-cours/' : '/api/learning/';
      const res = await fetch(endpoint, {
        headers: token ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await res.json();

      if (token) {
        // mes-cours retourne les cours avec accès — on charge aussi la liste publique
        const resPublic = await fetch(`${API_BASE}/api/learning/`);
        const dataPublic = await resPublic.json();
        const idsAvecAcces = new Set((Array.isArray(data) ? data : []).map(c => c.id));
        const merged = (Array.isArray(dataPublic) ? dataPublic : []).map(c => ({
          ...c,
          a_acces: idsAvecAcces.has(c.id)
        }));
        setCours(merged);
      } else {
        setCours(Array.isArray(data) ? data : []);
      }
    } catch {
      setCours([]);
    }
    setLoading(false);
  }

  const categories = [
    { id:"tout",      label:"Tout" },
    { id:"texte",     label:"Articles" },
    { id:"video",     label:"Vidéos" },
    { id:"audio",     label:"Audio" },
    { id:"pdf",       label:"PDF" },
  ];

  const coursFiltres = categorie === "tout"
    ? cours
    : cours.filter(c => c.format === categorie);

  return (
    <>
      <style>{STYLES}</style>

      {/* NAVBAR */}
      <nav style={{ padding:"16px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"rgba(10,10,10,.96)", backdropFilter:"blur(20px)", zIndex:200 }}>
        <Link to="/" style={{ textDecoration:"none" }}>
          <span style={{ fontFamily:"var(--ff-t)", fontSize:"1rem" }}>
            <span style={{color:"var(--blanc)"}}>Méta'</span>
            <span style={{color:"var(--or)"}}>Morph'</span>
            <span style={{color:"var(--rose)"}}>Ose</span>
          </span>
        </Link>
        <div style={{ display:"flex", gap:"16px", alignItems:"center" }}>
          {user ? (
            <Link to="/dashboard" style={{ fontFamily:"var(--ff-b)", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--or)", textDecoration:"none" }}>
              Mon espace
            </Link>
          ) : (
            <Link to="/espace-membre" style={{ fontFamily:"var(--ff-b)", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}>
              Se connecter
            </Link>
          )}
          <Link to="/contact" className="btn-p" style={{ padding:"10px 20px", fontSize:".66rem" }}>S'inscrire</Link>
        </div>
      </nav>

      <main>
        {/* HERO */}
        <section style={{ padding:"80px 24px 60px", background:"linear-gradient(135deg,#0A0A0A 0%,#1a0a0f 40%,#0A0A0A 100%)", textAlign:"center", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
            <div style={{ position:"absolute", top:"-10%", left:"-5%", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(201,169,106,.08),transparent 70%)" }}/>
            <div style={{ position:"absolute", bottom:"10%", right:"-5%", width:"300px", height:"300px", borderRadius:"50%", background:"radial-gradient(circle,rgba(194,24,91,.08),transparent 70%)" }}/>
          </div>
          <div style={{ position:"relative", maxWidth:"700px", margin:"0 auto" }}>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"var(--or)", marginBottom:"16px", animation:"fadeUp .7s both" }}>
              Méta'Morph'Ose Store
            </p>
            <h1 style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(2rem,6vw,3.5rem)", fontWeight:700, lineHeight:1.1, marginBottom:"20px", animation:"fadeUp .8s .1s both" }}>
              <em style={{ fontStyle:"italic", fontWeight:400, background:"linear-gradient(135deg,var(--or),var(--or-light),var(--or))", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmer 4s linear infinite" }}>
                Ta transformation, à ton rythme.
              </em>
            </h1>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:"clamp(.9rem,2.5vw,1.05rem)", color:"rgba(248,245,242,.6)", lineHeight:1.8, animation:"fadeUp .8s .2s both" }}>
              Formations et contenus premium de Coach Prélia APEDO AHONON pour chaque étape de ta révélation.
            </p>
          </div>
        </section>

        {/* FILTRES */}
        <section style={{ padding:"40px 24px 0", background:"var(--noir)" }}>
          <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
            <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", justifyContent:"center" }}>
              {categories.map(cat => (
                <button key={cat.id} className={`cat-btn ${categorie === cat.id ? "active" : ""}`} onClick={() => setCategorie(cat.id)}>
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* COURS */}
        <section style={{ padding:"48px 24px 80px", background:"var(--noir)" }}>
          <div style={{ maxWidth:"1100px", margin:"0 auto" }}>

            {loading ? (
              <div style={{ textAlign:"center", padding:"80px 24px" }}>
                <div style={{ width:"32px", height:"32px", border:"2px solid rgba(201,169,106,.2)", borderTopColor:"var(--or)", borderRadius:"50%", animation:"spin .8s linear infinite", margin:"0 auto 16px" }}/>
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".78rem", color:"rgba(248,245,242,.3)" }}>Chargement des formations...</p>
              </div>
            ) : coursFiltres.length === 0 ? (
              <div style={{ textAlign:"center", padding:"80px 24px" }}>
                <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.2rem", color:"rgba(248,245,242,.3)" }}>Aucune formation dans cette catégorie pour le moment.</p>
              </div>
            ) : (
              <div className="products-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"24px" }}>
                {coursFiltres.map((c, i) => {
                  const gratuit = !c.prix || c.prix === 0;
                  const aAcces  = c.a_acces;
                  return (
                    <div key={c.id || i} className="product-card reveal" style={{ transitionDelay:`${(i%3)*.1}s` }}>

                      {/* Image */}
                      <div style={{ height:"180px", background: c.image ? `url(${c.image}) center/cover` : "linear-gradient(135deg,rgba(201,169,106,.1),rgba(194,24,91,.06))", position:"relative", overflow:"hidden" }}>
                        {!c.image && (
                          <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                            <span style={{ fontFamily:"var(--ff-t)", fontSize:"2.5rem", color:"rgba(201,169,106,.2)", fontStyle:"italic" }}>MMO</span>
                          </div>
                        )}
                        {/* Badge format */}
                        <div style={{ position:"absolute", top:"14px", left:"14px" }}>
                          <span style={{ padding:"3px 10px", borderRadius:"100px", background:"rgba(10,10,10,.8)", border:"1px solid rgba(201,169,106,.3)", fontFamily:"var(--ff-b)", fontSize:".55rem", color:"var(--or)", letterSpacing:".1em", textTransform:"uppercase" }}>
                            {FORMAT_LABELS[c.format] || c.format}
                          </span>
                        </div>
                        {/* Badge accès */}
                        {aAcces && (
                          <div style={{ position:"absolute", top:"14px", right:"14px" }}>
                            <span style={{ padding:"3px 10px", borderRadius:"100px", background:"rgba(37,211,102,.15)", border:"1px solid rgba(37,211,102,.4)", fontFamily:"var(--ff-b)", fontSize:".55rem", color:"#25D366", letterSpacing:".1em", textTransform:"uppercase" }}>
                              Débloqué
                            </span>
                          </div>
                        )}
                        {/* Verrou */}
                        {!aAcces && !gratuit && (
                          <div className="verrou-overlay">
                            <div style={{ textAlign:"center" }}>
                              <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"rgba(201,169,106,.15)", border:"1px solid rgba(201,169,106,.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 8px" }}>
                                <svg width="14" height="16" viewBox="0 0 14 16" fill="none">
                                  <rect x="2" y="7" width="10" height="8" rx="2" fill="rgba(201,169,106,.8)"/>
                                  <path d="M4 7V5a3 3 0 016 0v2" stroke="rgba(201,169,106,.8)" strokeWidth="1.5" strokeLinecap="round"/>
                                </svg>
                              </div>
                              <p style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"rgba(201,169,106,.7)", letterSpacing:".1em", textTransform:"uppercase" }}>Accès requis</p>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Contenu */}
                      <div style={{ padding:"22px 20px", flex:1, display:"flex", flexDirection:"column" }}>
                        <div style={{ display:"flex", gap:"6px", marginBottom:"8px", flexWrap:"wrap" }}>
                          {c.niveau && (
                            <span style={{ padding:"2px 8px", borderRadius:"100px", background:`${NIVEAU_COLORS[c.niveau]}15`, border:`1px solid ${NIVEAU_COLORS[c.niveau]}30`, fontFamily:"var(--ff-b)", fontSize:".55rem", color:NIVEAU_COLORS[c.niveau], letterSpacing:".08em", textTransform:"uppercase" }}>
                              {NIVEAU_LABELS[c.niveau]}
                            </span>
                          )}
                          {c.duree && (
                            <span style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"rgba(248,245,242,.3)" }}>{c.duree}</span>
                          )}
                        </div>
                        <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.05rem", fontWeight:600, marginBottom:"8px", lineHeight:1.3 }}>{c.titre}</h3>
                        <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".78rem", color:"rgba(248,245,242,.5)", lineHeight:1.7, marginBottom:"16px", flex:1 }}>
                          {c.description?.substring(0,100)}{c.description?.length > 100 ? "…" : ""}
                        </p>

                        {/* Prix + CTA */}
                        <div style={{ borderTop:"1px solid rgba(255,255,255,.05)", paddingTop:"16px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:"12px" }}>
                          <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.2rem", fontWeight:700, color: gratuit ? "#25D366" : "var(--or)", lineHeight:1 }}>
                            {gratuit ? "Gratuit" : `${c.prix?.toLocaleString("fr-FR")} FCFA`}
                          </p>
                          {aAcces ? (
                            <Link to="/mmo-learning" className="btn-green" style={{ padding:"10px 18px", fontSize:".63rem", flexShrink:0 }}>
                              Accéder
                            </Link>
                          ) : (
                            <button onClick={() => setSelectionne(c)} className="btn-p" style={{ padding:"10px 18px", fontSize:".63rem", flexShrink:0 }}>
                              {gratuit ? "Obtenir" : "Acheter"}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* BANNIERE */}
        <section style={{ padding:"80px 24px", background:"linear-gradient(135deg,#2e1e14,#3a2518)", textAlign:"center" }}>
          <div style={{ maxWidth:"680px", margin:"0 auto" }}>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"var(--or)", marginBottom:"12px" }}>Tu veux aller plus loin ?</p>
            <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:600, marginBottom:"16px" }}>
              Rejoins le programme Méta'Morph'Ose
            </h2>
            <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.55)", lineHeight:1.8, marginBottom:"32px" }}>
              8 semaines d'accompagnement intensif pour transformer ton image, ta confiance et ta vie.
            </p>
            <div className="reveal" style={{ display:"flex", gap:"16px", justifyContent:"center", flexWrap:"wrap" }}>
              <Link to="/contact" className="btn-p" style={{ animation:"pulse-rose 3s ease-in-out infinite" }}>
                Rejoindre le programme
              </Link>
              <Link to="/programme" className="btn-or">
                Découvrir le programme
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer style={{ padding:"32px 24px", background:"var(--noir)", borderTop:"1px solid rgba(201,169,106,.1)", textAlign:"center" }}>
        <Link to="/" style={{ fontFamily:"var(--ff-t)", fontSize:".95rem", textDecoration:"none" }}>
          <span style={{color:"var(--blanc)"}}>Méta'</span>
          <span style={{color:"var(--or)"}}>Morph'</span>
          <span style={{color:"var(--rose)"}}>Ose</span>
        </Link>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".7rem", color:"rgba(248,245,242,.2)", marginTop:"8px" }}>
          © 2026 Méta'Morph'Ose · White & Black · Prélia APEDO AHONON
        </p>
      </footer>

      {/* MODAL */}
      {selectionne && (
        <ModalCours cours={selectionne} onClose={() => setSelectionne(null)} />
      )}

      <AuraButton />
    </>
  );
}
