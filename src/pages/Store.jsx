import { useState, useEffect } from "react";
import usePageBackground from "../hooks/usePageBackground";
import AuraButton from '../components/AuraButton'
import { Link, useNavigate } from "react-router-dom";

const KKIAPAY_PUBLIC_KEY = "VOTRE_CLE_PUBLIQUE_KKIAPAY"; // À remplacer
const BACKEND = "";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --noir:#0A0A0A; --or:#C9A96A; --or-light:#E8D5A8;
    --rose:#C2185B; --beige:#D8C1A0; --beige-light:#F2EBE0;
    --blanc:#F8F5F2; --blanc-pur:#FFFFFF;
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

  .product-card {
    background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.06);
    border-radius:6px; overflow:hidden; transition:all .35s var(--ease);
    display:flex; flex-direction:column;
  }
  .product-card:hover { transform:translateY(-8px); border-color:rgba(201,169,106,.2); box-shadow:0 20px 60px rgba(0,0,0,.4); }

  .cat-btn {
    padding:10px 22px; background:transparent; border:1px solid rgba(255,255,255,.08);
    border-radius:100px; color:rgba(248,245,242,.5); font-family:var(--ff-b);
    font-size:.65rem; font-weight:500; letter-spacing:.14em; text-transform:uppercase;
    cursor:pointer; transition:all .3s;
  }
  .cat-btn.active { background:var(--rose); border-color:var(--rose); color:#fff; }
  .cat-btn:hover:not(.active) { border-color:rgba(201,169,106,.3); color:var(--or); }

  .badge {
    display:inline-block; padding:4px 10px; border-radius:100px;
    font-family:var(--ff-b); font-size:.58rem; font-weight:600;
    letter-spacing:.14em; text-transform:uppercase;
  }

  .modal-overlay {
    position:fixed; inset:0; z-index:500; background:rgba(10,10,10,.92);
    backdrop-filter:blur(14px); display:flex; align-items:center; justify-content:center;
    padding:20px; animation:fadeUp .3s both;
  }
  .modal-box {
    background:#141414; border:1px solid rgba(201,169,106,.15); border-radius:8px;
    padding:40px 32px; max-width:480px; width:100%; position:relative;
    max-height:90vh; overflow-y:auto;
  }

  @media(max-width:768px) {
    .products-grid { grid-template-columns:1fr !important; }
    .store-hero-grid { grid-template-columns:1fr !important; }
  }
  @media(max-width:480px) {
    .products-grid { grid-template-columns:1fr !important; }
    .modal-box { padding:28px 20px !important; }
    .btn-p, .btn-or { width:100% !important; justify-content:center !important; }
  }
`;

const PRODUITS_DEFAUT = [
  {
    id: 1,
    categorie: "guide",
    titre: "Guide Méthode Eisenhower",
    sous_titre: "Pour les femmes ambitieuses",
    description: "Apprenez à prioriser ce qui compte vraiment, sortir de la procrastination et passer à l'action avec discipline. Un guide complet et actionnable.",
    prix: 2500,
    gratuit: true,
    badge: "Gratuit",
    badge_color: "#25D366",
    inclus: ["PDF téléchargeable", "Exercices pratiques", "Tableau de priorisation", "Accès immédiat"],
    image_bg: "linear-gradient(135deg,rgba(201,169,106,.15),rgba(201,169,106,.05))",
    image_icon: "📋",
  },
  {
    id: 2,
    categorie: "guide",
    titre: "Guide Confiance en Soi",
    sous_titre: "Révèle ta lumière intérieure",
    description: "Un guide complet pour reconstruire une estime solide, identifier tes blocages et développer une confiance authentique et durable.",
    prix: 5000,
    badge: "Nouveau",
    badge_color: "var(--rose)",
    inclus: ["PDF 30 pages", "Exercices guidés", "Affirmations quotidiennes", "Accès immédiat"],
    image_bg: "linear-gradient(135deg,rgba(194,24,91,.15),rgba(194,24,91,.05))",
    image_icon: "✨",
  },
  {
    id: 3,
    categorie: "formation",
    titre: "Formation Image Authentique",
    sous_titre: "Aligne ton image à ton identité",
    description: "Une formation complète sur la morphologie, la colorimétrie et la construction d'une identité visuelle qui te ressemble vraiment.",
    prix: 25000,
    badge: "Bestseller",
    badge_color: "var(--or)",
    inclus: ["5 modules vidéo", "Workbook PDF", "Accès à vie", "Support WhatsApp", "Certificat"],
    image_bg: "linear-gradient(135deg,rgba(168,200,224,.15),rgba(168,200,224,.05))",
    image_icon: "🎓",
  },
  {
    id: 4,
    categorie: "formation",
    titre: "Masterclass OSEZ",
    sous_titre: "Embrasse ton image authentique",
    description: "L'enregistrement complet de la Masterclass OSEZ — 3 secrets pour te libérer du regard des autres et attirer les opportunités.",
    prix: 10000,
    badge: "Replay",
    badge_color: "#A8C8E0",
    inclus: ["Replay vidéo HD", "Audio MP3", "PDF résumé", "Accès immédiat"],
    image_bg: "linear-gradient(135deg,rgba(168,200,224,.12),rgba(201,169,106,.08))",
    image_icon: "🎬",
  },
  {
    id: 5,
    categorie: "replay",
    titre: "Pack Replays MMO — Vague 1",
    sous_titre: "8 semaines de transformation",
    description: "Accédez à tous les replays de la première vague Méta'Morph'Ose. 8 semaines de contenu premium pour votre transformation.",
    prix: 35000,
    badge: "Pack",
    badge_color: "var(--rose)",
    inclus: ["16 replays vidéo", "Audio MP3 de chaque session", "Guides PDF bonus", "Accès 6 mois"],
    image_bg: "linear-gradient(135deg,rgba(194,24,91,.12),rgba(201,169,106,.08))",
    image_icon: "📹",
  },
  {
    id: 6,
    categorie: "replay",
    titre: "Affirmations Quotidiennes",
    sous_titre: "Audio de 21 jours",
    description: "21 jours d'affirmations puissantes enregistrées par Prélia Apedo. Transformez votre dialogue intérieur chaque matin.",
    prix: 7500,
    badge: "Audio",
    badge_color: "#C9A96A",
    inclus: ["21 fichiers audio", "Guide d'utilisation", "Calendrier 21 jours", "Accès immédiat"],
    image_bg: "linear-gradient(135deg,rgba(201,169,106,.15),rgba(194,24,91,.05))",
    image_icon: "🎵",
  },
];

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

/* ── Modal Achat ────────────────────────────────────────────── */
function ModalAchat({ produit, onClose }) {
  const [step, setStep] = useState("details"); // details | form | success
  const [nom, setNom] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const token = localStorage.getItem("mmorphose_token");
  const user = JSON.parse(localStorage.getItem("mmorphose_user") || "null");

  function lancerPaiement() {
    if (!nom.trim() || !email.trim()) return;
    setLoading(true);

    // Intégration KKiaPay
    if (window.openKkiapayWidget) {
      window.openKkiapayWidget({
        amount: produit.prix,
        api_key: KKIAPAY_PUBLIC_KEY,
        sandbox: true, // Mettre false en production
        email: email,
        name: nom,
        callback: `${window.location.origin}/store/confirmation`,
        theme: "#C2185B",
      });

      window.addSuccessListener(response => {
        setStep("success");
        setLoading(false);
      });
    } else {
      // KKiaPay pas encore chargé — simulation
      setTimeout(() => {
        setStep("success");
        setLoading(false);
      }, 1500);
    }
  }

  return (
    <div className="modal-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal-box">
        <button onClick={onClose} style={{ position:"absolute", top:"16px", right:"18px", background:"none", border:"none", color:"rgba(201,169,106,.5)", fontSize:".8rem", cursor:"pointer", fontFamily:"var(--ff-b)", letterSpacing:".1em", textTransform:"uppercase" }}>
          Fermer
        </button>

        {step === "details" && (
          <div style={{ animation:"fadeUp .4s both" }}>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--or)", marginBottom:"8px" }}>{produit.categorie}</p>
            <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.4rem", fontWeight:600, marginBottom:"6px" }}>{produit.titre}</h2>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.5)", marginBottom:"20px" }}>{produit.description}</p>

            <div style={{ marginBottom:"20px" }}>
              <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(248,245,242,.4)", marginBottom:"10px" }}>Ce que vous recevez :</p>
              {produit.inclus.map((item, i) => (
                <div key={i} style={{ display:"flex", gap:"10px", marginBottom:"8px" }}>
                  <span style={{ color:"#25D366", flexShrink:0 }}>✓</span>
                  <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.75)" }}>{item}</p>
                </div>
              ))}
            </div>

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", borderRadius:"4px", marginBottom:"20px" }}>
              <span style={{ fontFamily:"var(--ff-b)", fontSize:".78rem", color:"rgba(248,245,242,.5)" }}>Prix total</span>
              <span style={{ fontFamily:"var(--ff-t)", fontSize:"1.4rem", fontWeight:700, color: produit.gratuit ? "#25D366" : "var(--or)" }}>
                {produit.gratuit ? "Gratuit" : `${produit.prix.toLocaleString("fr-FR")} FCFA`}
              </span>
            </div>

            {produit.gratuit ? (
              <button onClick={() => setStep("form")} className="btn-p" style={{ width:"100%" }}>
                Obtenir gratuitement
              </button>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
                {token ? (
                  <button onClick={() => setStep("form")} className="btn-p" style={{ width:"100%", animation:"pulse-rose 3s ease-in-out infinite" }}>
                    Acheter maintenant
                  </button>
                ) : (
                  <>
                    <button onClick={() => setStep("form")} className="btn-p" style={{ width:"100%" }}>
                      Continuer sans compte
                    </button>
                    <Link to="/espace-membre" onClick={onClose} className="btn-or" style={{ width:"100%", textAlign:"center" }}>
                      Se connecter pour acheter
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {step === "form" && (
          <div style={{ animation:"fadeUp .4s both" }}>
            <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.3rem", fontWeight:600, marginBottom:"6px" }}>
              {produit.gratuit ? "Recevoir le guide" : "Finaliser l'achat"}
            </h2>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".78rem", color:"rgba(248,245,242,.4)", marginBottom:"24px" }}>
              {produit.gratuit ? "Entrez votre email pour recevoir le guide." : "Vos informations de facturation"}
            </p>

            <div style={{ display:"flex", flexDirection:"column", gap:"12px", marginBottom:"20px" }}>
              <input
                value={nom} onChange={e=>setNom(e.target.value)}
                placeholder="Votre prénom *"
                style={{ width:"100%", padding:"13px 16px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"3px", color:"var(--blanc)", fontFamily:"var(--ff-b)", fontSize:".88rem", fontWeight:300, outline:"none", fontSize:"16px" }}
              />
              <input
                type="email" value={email} onChange={e=>setEmail(e.target.value)}
                placeholder="Votre email *"
                style={{ width:"100%", padding:"13px 16px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"3px", color:"var(--blanc)", fontFamily:"var(--ff-b)", fontSize:".88rem", fontWeight:300, outline:"none", fontSize:"16px" }}
              />
            </div>

            {produit.gratuit ? (
              <button onClick={() => setStep("success")} className="btn-p" style={{ width:"100%" }} disabled={!nom || !email}>
                Recevoir mon guide gratuit
              </button>
            ) : (
              <button onClick={lancerPaiement} className="btn-p" style={{ width:"100%", animation:"pulse-rose 3s ease-in-out infinite" }} disabled={loading || !nom || !email}>
                {loading ? (
                  <><div style={{ width:"16px", height:"16px", border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite" }}/> Traitement…</>
                ) : `Payer ${produit.prix.toLocaleString("fr-FR")} FCFA`}
              </button>
            )}

            <p style={{ marginTop:"12px", fontFamily:"var(--ff-b)", fontSize:".65rem", color:"rgba(248,245,242,.25)", textAlign:"center", lineHeight:1.6 }}>
              {produit.gratuit ? "Aucune carte bancaire requise · 100% gratuit" : "Paiement sécurisé via KKiaPay · Mobile Money · Carte bancaire"}
            </p>
          </div>
        )}

        {step === "success" && (
          <div style={{ textAlign:"center", animation:"fadeUp .4s both" }}>
            <div style={{ width:"64px", height:"64px", borderRadius:"50%", background:"rgba(37,211,102,.12)", border:"2px solid rgba(37,211,102,.4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:"1.8rem" }}>✓</div>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:"#25D366", marginBottom:"10px" }}>
              {produit.gratuit ? "Guide envoyé" : "Paiement confirmé"}
            </p>
            <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.4rem", fontWeight:600, marginBottom:"14px" }}>
              {produit.gratuit ? "Vérifie ta boîte mail !" : "Merci pour ton achat !"}
            </h3>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.6)", lineHeight:1.8, marginBottom:"24px" }}>
              {produit.gratuit
                ? `${nom}, ton guide a été envoyé à ${email}. Pense à vérifier tes spams si tu ne le vois pas.`
                : `${nom}, tu vas recevoir un email de confirmation à ${email} avec ton accès au produit.`
              }
            </p>
            <button onClick={onClose} className="btn-or" style={{ cursor:"pointer" }}>
              Continuer mes achats
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── COMPOSANT PRINCIPAL ────────────────────────────────────── */
export default function Store() {
  usePageBackground("store");
  const [categorie, setCategorie] = useState("tout");
  const [produitSelectionne, setProduitSelectionne] = useState(null);
  useReveal();

  // Charger KKiaPay
  useEffect(() => {
    if (!document.getElementById("kkiapay-script")) {
      const script = document.createElement("script");
      script.id = "kkiapay-script";
      script.src = "https://cdn.kkiapay.me/k.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const categories = [
    { id:"tout",      label:"Tout" },
    { id:"guide",     label:"Guides PDF" },
    { id:"formation", label:"Formations" },
    { id:"replay",    label:"Replays & Audio" },
  ];

  const produitsFiltres = categorie === "tout"
    ? PRODUITS_DEFAUT
    : PRODUITS_DEFAUT.filter(p => p.categorie === categorie);

  return (
    <>
      <style>{STYLES}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ padding:"16px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"rgba(10,10,10,.96)", backdropFilter:"blur(20px)", zIndex:200 }}>
        <Link to="/" style={{ textDecoration:"none" }}>
          <span style={{ fontFamily:"var(--ff-t)", fontSize:"1rem" }}>
            <span style={{color:"var(--blanc)"}}>Meta'</span>
            <span style={{color:"var(--or)"}}>Morph'</span>
            <span style={{color:"var(--rose)"}}>Ose</span>
          </span>
        </Link>
        <div style={{ display:"flex", gap:"16px", alignItems:"center" }}>
          <Link to="/" style={{ fontFamily:"var(--ff-b)", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}>Accueil</Link>
          <Link to="/contact" className="btn-p" style={{ padding:"10px 20px", fontSize:".66rem" }}>S'inscrire</Link>
        </div>
      </nav>

      <main>

        {/* ── HERO ── */}
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
              Guides, formations et replays premium pour accompagner chaque étape de ta révélation.
            </p>
          </div>
        </section>

        {/* ── FILTRES ── */}
        <section style={{ padding:"40px 24px 0", background:"var(--noir)" }}>
          <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
            <div style={{ display:"flex", gap:"10px", flexWrap:"wrap", justifyContent:"center" }}>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  className={`cat-btn ${categorie === cat.id ? "active" : ""}`}
                  onClick={() => setCategorie(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* ── PRODUITS ── */}
        <section style={{ padding:"48px 24px 80px", background:"var(--noir)" }}>
          <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
            <div className="products-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"24px" }}>
              {produitsFiltres.map((produit, i) => (
                <div key={produit.id} className="product-card reveal" style={{ transitionDelay:`${(i%3)*.1}s` }}>

                  {/* Image / Icône */}
                  <div style={{ height:"180px", background:produit.image_bg, display:"flex", alignItems:"center", justifyContent:"center", position:"relative", overflow:"hidden" }}>
                    <span style={{ fontSize:"4rem" }}>{produit.image_icon}</span>
                    {/* Badge */}
                    <div style={{ position:"absolute", top:"14px", left:"14px" }}>
                      <span className="badge" style={{ background:`${produit.badge_color}20`, border:`1px solid ${produit.badge_color}50`, color:produit.badge_color }}>
                        {produit.badge}
                      </span>
                    </div>
                    {/* Catégorie */}
                    <div style={{ position:"absolute", top:"14px", right:"14px" }}>
                      <span style={{ fontFamily:"var(--ff-b)", fontSize:".55rem", letterSpacing:".14em", textTransform:"uppercase", color:"rgba(248,245,242,.35)", fontWeight:500 }}>
                        {produit.categorie === "guide" ? "Guide PDF" : produit.categorie === "formation" ? "Formation" : "Replay"}
                      </span>
                    </div>
                  </div>

                  {/* Contenu */}
                  <div style={{ padding:"24px 22px", flex:1, display:"flex", flexDirection:"column" }}>
                    <p style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", letterSpacing:".14em", textTransform:"uppercase", color:"rgba(248,245,242,.35)", marginBottom:"6px", fontWeight:500 }}>
                      {produit.sous_titre}
                    </p>
                    <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.1rem", fontWeight:600, marginBottom:"10px", lineHeight:1.3 }}>{produit.titre}</h3>
                    <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".8rem", color:"rgba(248,245,242,.55)", lineHeight:1.7, marginBottom:"16px", flex:1 }}>
                      {produit.description.substring(0, 100)}…
                    </p>

                    {/* Inclus (3 premiers) */}
                    <div style={{ marginBottom:"20px" }}>
                      {produit.inclus.slice(0,3).map((item,j) => (
                        <div key={j} style={{ display:"flex", gap:"8px", marginBottom:"5px" }}>
                          <span style={{ color:"var(--or)", fontSize:".75rem", flexShrink:0 }}>✓</span>
                          <p style={{ fontFamily:"var(--ff-b)", fontSize:".72rem", fontWeight:300, color:"rgba(248,245,242,.6)" }}>{item}</p>
                        </div>
                      ))}
                    </div>

                    {/* Prix + bouton */}
                    <div style={{ borderTop:"1px solid rgba(255,255,255,.05)", paddingTop:"16px", display:"flex", justifyContent:"space-between", alignItems:"center", gap:"12px" }}>
                      <div>
                        <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.3rem", fontWeight:700, color: produit.gratuit ? "#25D366" : "var(--or)", lineHeight:1 }}>
                          {produit.gratuit ? "Gratuit" : `${produit.prix.toLocaleString("fr-FR")} FCFA`}
                        </p>
                      </div>
                      <button onClick={() => setProduitSelectionne(produit)} className="btn-p" style={{ padding:"11px 20px", fontSize:".66rem", flexShrink:0 }}>
                        {produit.gratuit ? "Obtenir" : "Acheter"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Message si vide */}
            {produitsFiltres.length === 0 && (
              <div style={{ textAlign:"center", padding:"80px 24px" }}>
                <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.2rem", color:"rgba(248,245,242,.3)" }}>Aucun produit dans cette catégorie pour le moment.</p>
              </div>
            )}
          </div>
        </section>

        {/* ── BANNIÈRE PROGRAMME ── */}
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

      {/* ── FOOTER ── */}
      <footer style={{ padding:"32px 24px", background:"var(--noir)", borderTop:"1px solid rgba(201,169,106,.1)", textAlign:"center" }}>
        <Link to="/" style={{ fontFamily:"var(--ff-t)", fontSize:".95rem", textDecoration:"none" }}>
          <span style={{color:"var(--blanc)"}}>Meta'</span>
          <span style={{color:"var(--or)"}}>Morph'</span>
          <span style={{color:"var(--rose)"}}>Ose</span>
        </Link>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".7rem", color:"rgba(248,245,242,.2)", marginTop:"8px" }}>
          © 2026 Meta'Morph'Ose · White & Black · Prélia Apedo
        </p>
      </footer>

      {/* ── MODAL ACHAT ── */}
      {produitSelectionne && (
        <ModalAchat
          produit={produitSelectionne}
          onClose={() => setProduitSelectionne(null)}
        />
      )}
      <AuraButton />
    </>
  );
}
