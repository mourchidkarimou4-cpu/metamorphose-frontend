import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { configAPI } from "../services/api";

const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --noir:#0A0A0A; --or:#C9A96A; --or-light:#E8D5A8;
    --rose:#C2185B; --blanc:#F8F5F2; --beige:#D8C1A0;
    --ff-t:'Playfair Display',Georgia,serif;
    --ff-b:'Montserrat',sans-serif;
    --ff-a:'Cormorant Garamond',Georgia,serif;
  }
  html { scroll-behavior:smooth; }
  body { background:var(--noir); color:var(--blanc); font-family:var(--ff-b); font-weight:300; line-height:1.7; overflow-x:hidden; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes spin { to{transform:rotate(360deg)} }
  .reveal { opacity:0; transform:translateY(30px); transition:opacity .8s ease,transform .8s ease; }
  .reveal.visible { opacity:1; transform:none; }
  .btn-or {
    display:inline-flex; align-items:center; justify-content:center;
    padding:15px 32px; background:#C9A96A; color:#0A0A0A;
    font-family:'Montserrat',sans-serif; font-weight:700; font-size:.72rem;
    letter-spacing:.16em; text-transform:uppercase; border:none;
    border-radius:2px; cursor:pointer; text-decoration:none;
    transition:all .3s;
  }
  .btn-or:hover { background:#E8D5A8; transform:translateY(-2px); }
  .btn-rose {
    display:inline-flex; align-items:center; justify-content:center;
    padding:15px 32px; background:#C2185B; color:#fff;
    font-family:'Montserrat',sans-serif; font-weight:700; font-size:.72rem;
    letter-spacing:.16em; text-transform:uppercase; border:none;
    border-radius:2px; cursor:pointer; text-decoration:none;
    transition:all .3s;
  }
  .btn-rose:hover { background:#a01049; transform:translateY(-2px); }
  .btn-outline {
    display:inline-flex; align-items:center; justify-content:center;
    padding:14px 28px; background:transparent; color:#C9A96A;
    font-family:'Montserrat',sans-serif; font-weight:500; font-size:.72rem;
    letter-spacing:.16em; text-transform:uppercase;
    border:1px solid rgba(201,169,106,.35); border-radius:2px;
    cursor:pointer; text-decoration:none; transition:all .3s;
  }
  .btn-outline:hover { border-color:#C9A96A; background:rgba(201,169,106,.05); transform:translateY(-2px); }
  .pilier-card {
    padding:36px 28px; background:rgba(255,255,255,.02);
    border:1px solid rgba(255,255,255,.06);
    border-left:3px solid #C9A96A; border-radius:3px;
    transition:border-color .3s, background .3s;
  }
  .pilier-card:hover { border-left-color:#C2185B; background:rgba(194,24,91,.02); }
  .pass-card {
    padding:40px 32px; background:rgba(255,255,255,.025);
    border:1px solid rgba(255,255,255,.07); border-radius:6px;
    transition:all .35s;
  }
  .pass-card:hover { transform:translateY(-6px); border-color:rgba(201,169,106,.3); box-shadow:0 20px 60px rgba(0,0,0,.4); }
  .pass-card.featured { border:1px solid rgba(194,24,91,.4); background:rgba(194,24,91,.04); }
  .panel-card {
    padding:36px 32px; background:rgba(255,255,255,.02);
    border:1px solid rgba(255,255,255,.06); border-radius:4px;
  }
  .form-input {
    width:100%; padding:14px 18px;
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.09);
    border-radius:3px; color:#F8F5F2;
    font-family:'Montserrat',sans-serif; font-size:.88rem; font-weight:300;
    outline:none; transition:border-color .25s;
  }
  .form-input:focus { border-color:rgba(201,169,106,.5); }
  .form-label {
    font-family:'Montserrat',sans-serif; font-size:.62rem; letter-spacing:.16em;
    text-transform:uppercase; color:rgba(248,245,242,.45);
    display:block; margin-bottom:7px;
  }
  .pass-select-btn {
    flex:1; padding:14px 16px; border-radius:3px; cursor:pointer;
    font-family:'Montserrat',sans-serif; font-size:.72rem; font-weight:600;
    letter-spacing:.1em; text-transform:uppercase; transition:all .25s;
    border:1px solid rgba(255,255,255,.1); background:transparent;
    color:rgba(248,245,242,.5); text-align:center;
  }
  .pass-select-btn.active { border-color:#C9A96A; color:#C9A96A; background:rgba(201,169,106,.08); }
  .guide-item {
    display:flex; align-items:flex-start; gap:10px;
    padding:8px 0; border-bottom:1px solid rgba(255,255,255,.04);
    font-family:'Montserrat',sans-serif; font-size:.82rem;
    color:rgba(248,245,242,.65); font-weight:300;
  }
  .guide-item:last-child { border-bottom:none; }
  @media(max-width:768px) {
    .piliers-grid { grid-template-columns:1fr !important; }
    .passes-grid  { grid-template-columns:1fr !important; }
    .panels-grid  { grid-template-columns:1fr !important; }
    .btns-zone    { flex-direction:column !important; align-items:stretch !important; }
    .form-2col    { grid-template-columns:1fr !important; }
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

function IconDot() {
  return <span style={{ display:"inline-block", width:"5px", height:"5px", borderRadius:"50%", background:"#C9A96A", flexShrink:0, marginTop:"8px" }}/>;
}

function BtnsZone({ onReserver, onScrollPass }) {
  return (
    <div className="btns-zone" style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
      <button onClick={onReserver} className="btn-rose">Réserver ma place</button>
      <button onClick={onScrollPass} className="btn-outline">Choisir mon pass</button>
      <a href="https://wa.me/22901961140" target="_blank" rel="noreferrer" className="btn-outline">Me contacter</a>
      <Link to="/programme" className="btn-outline">Découvrir le programme Métamorphose</Link>
    </div>
  );
}

function BtnsZone2({ onReserver, onScrollPass }) {
  return (
    <div className="btns-zone" style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
      <button onClick={onScrollPass} className="btn-or">Choisir mon pass</button>
      <button onClick={onReserver} className="btn-outline">Réserver ma place</button>
      <a href="https://wa.me/22901961140" target="_blank" rel="noreferrer" className="btn-outline">Me contacter</a>
      <Link to="/programme" className="btn-outline">Découvrir le programme Métamorphose</Link>
    </div>
  );
}

const GUIDES = [
  "Replay de toutes les séances",
  "Guide de gestion du temps",
  "Guide pour trouver ta passion",
  "Accès au club des Métamorphosés",
  "Guide des affirmations positives",
  "Guide « se présenter avec impact »",
  "Guide SMART & vision de vie",
];

const PASSES = [
  {
    id: "metamorphosee",
    label: "Pass Métamorphosée",
    sous: "Réservée pour les femmes du programme Métamorphose 2026",
    prix: "50 000 FCFA",
    montant: 50000,
    featured: false,
    inclus: [
      "Accès complet",
      "Panels",
      "Distinction officielle",
      "Photos professionnelles",
      "Photos avec les invités d'honneur panélistes",
      "Networking",
    ],
    guides: [],
    reduction: null,
    cadeau: null,
  },
  {
    id: "decouverte",
    label: "Pass Découverte",
    sous: "Réservée pour les femmes participantes au Brunch",
    prix: "30 000 FCFA",
    montant: 30000,
    featured: true,
    inclus: [
      "Accès brunch",
      "Panels",
      "Networking",
      "Photos",
      "Ebook Métamorphose",
    ],
    guides: GUIDES,
    valeur_guides: "7 guides d'une valeur de 15 000 FCFA chacun, soit 105 000 FCFA",
    reduction: "10% de réduction sur le programme Métamorphose (valable pour deux semaines après le brunch).",
    cadeau: null,
  },
  {
    id: "vip",
    label: "Pass VIP",
    sous: "Réservée pour les femmes participantes au Brunch",
    prix: "60 000 FCFA",
    montant: 60000,
    featured: false,
    inclus: [
      "Accès complet au brunch",
      "Place privilégiée",
      "Rencontre avec la coach",
      "Photos professionnelles avec les officielles",
      "Networking premium",
    ],
    guides: GUIDES,
    valeur_guides: "7 guides d'une valeur de 15 000 FCFA chacun, soit 105 000 FCFA",
    reduction: "15% de réduction sur le programme Métamorphose (valable pour trois semaines après le brunch).",
    cadeau: "Cadeau exclusif : Ebook Métamorphose + les 3 guides qui l'accompagnent.",
  },
];

export default function Brunch() {
  useReveal();
  const passesRef = useRef(null);
  const formRef   = useRef(null);

  // Liens paiement depuis CMS
  const [payLinks, setPayLinks] = useState({});
  useEffect(() => {
    configAPI.public().then(res => {
      const map = {};
      if (Array.isArray(res.data)) res.data.forEach(i => { map[i.cle] = i.valeur; });
      setPayLinks(map);
    }).catch(() => {});
  }, []);

  // Formulaire
  const [showForm,   setShowForm]   = useState(false);
  const [typePass,   setTypePass]   = useState("decouverte");
  const [form,       setForm]       = useState({ nom:"", prenom:"", email:"", whatsapp:"" });
  const [step,       setStep]       = useState("form"); // form | payer | done
  const [token,      setToken]      = useState("");
  const [lienPaie,   setLienPaie]   = useState("");
  const [loadingForm,setLoadingForm]= useState(false);
  const [errForm,    setErrForm]    = useState("");

  function setF(k, v) { setForm(p => ({...p, [k]: v})); }

  function scrollToPass() {
    passesRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });
  }

  function ouvrirFormulaire(passId = null) {
    if (passId) setTypePass(passId);
    setShowForm(true);
    setStep("form");
    setErrForm("");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior:"smooth", block:"center" }), 100);
  }

  async function soumettre(e) {
    e.preventDefault();
    if (!form.nom.trim() || !form.prenom.trim() || !form.email.trim() || !form.whatsapp.trim()) {
      setErrForm("Tous les champs sont requis."); return;
    }
    setLoadingForm(true); setErrForm("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/reserver-brunch/`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ ...form, type_pass: typePass }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        // Lien paiement : depuis CMS ou depuis la réponse API
        const lien = payLinks[`brunch_lien_${typePass}`]
          || payLinks["brunch_lien_paiement"]
          || data.lien_paiement
          || "";
        setLienPaie(lien);
        setStep("payer");
      } else {
        setErrForm(data.detail || "Une erreur est survenue.");
      }
    } catch {
      setErrForm("Erreur réseau. Veuillez réessayer.");
    }
    setLoadingForm(false);
  }

  async function declarerPaiement() {
    try {
      await fetch(`${API_BASE}/api/auth/valider-brunch/`, {
        method:"POST",
        headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ token }),
      });
    } catch {}
    // Rediriger vers la page de succès sécurisée
    window.location.href = `/brunch/success?token=${token}`;
  }

  const passSelectionne = PASSES.find(p => p.id === typePass);

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ background:"#0A0A0A", color:"#F8F5F2", minHeight:"100vh" }}>

        {/* Nav */}
        <nav style={{ padding:"18px 32px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"rgba(10,10,10,.95)", backdropFilter:"blur(20px)", zIndex:100 }}>
          <Link to="/" style={{ textDecoration:"none" }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem" }}>
              <span style={{color:"#F8F5F2"}}>Méta'</span>
              <span style={{color:"#C9A96A"}}>Morph'</span>
              <span style={{color:"#C2185B"}}>Ose</span>
            </span>
          </Link>
          <div style={{ display:"flex", gap:"16px", alignItems:"center" }}>
            <Link to="/" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}>Accueil</Link>
            <button onClick={() => ouvrirFormulaire()} className="btn-rose" style={{ padding:"9px 18px", fontSize:".68rem" }}>Réserver ma place</button>
          </div>
        </nav>

        {/* ── SECTION 1 : HERO ─────────────────────────────────── */}
        <section style={{ padding:"120px 24px 80px", textAlign:"center", background:"linear-gradient(180deg,#0A0A0A,#0d0507)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 60% at 50% 80%,rgba(194,24,91,.05),transparent)", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 50% 40% at 50% 20%,rgba(201,169,106,.04),transparent)", pointerEvents:"none" }}/>
          <div style={{ position:"relative", maxWidth:"800px", margin:"0 auto" }}>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".58rem", letterSpacing:".4em", textTransform:"uppercase", color:"rgba(201,169,106,.6)", marginBottom:"20px", animation:"fadeUp .5s both" }}>
              Page de vente officielle
            </p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2.2rem,7vw,4.5rem)", fontWeight:700, lineHeight:1.05, marginBottom:"24px", animation:"fadeUp .6s .1s both" }}>
              Le Brunch des<br/>
              <em style={{ fontStyle:"italic", fontWeight:400, background:"linear-gradient(135deg,#C9A96A,#E8D5A8,#C9A96A)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmer 4s linear infinite" }}>
                Métamorphosées 2026
              </em>
            </h1>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"clamp(1.1rem,3vw,1.5rem)", color:"rgba(248,245,242,.6)", marginBottom:"20px", animation:"fadeUp .6s .2s both" }}>
              Célébrer. Connecter. Élever. Distinguer.
            </p>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:"1rem", color:"rgba(248,245,242,.5)", marginBottom:"40px", animation:"fadeUp .6s .3s both" }}>
              Tu n'es plus la même femme… Il est temps de le célébrer.
            </p>

            {/* Infos clés */}
            <div style={{ display:"inline-flex", gap:"32px", marginBottom:"48px", animation:"fadeUp .6s .35s both", flexWrap:"wrap", justifyContent:"center" }}>
              {[["Bénin", "Lieu"], ["Décembre 2026", "Date"], ["À préciser", "Lieu exact"]].map(([val, lbl]) => (
                <div key={lbl} style={{ textAlign:"center" }}>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", marginBottom:"4px" }}>{lbl}</p>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:".95rem", color:"#F8F5F2" }}>{val}</p>
                </div>
              ))}
            </div>

            <div style={{ animation:"fadeUp .6s .4s both" }}>
              <BtnsZone onReserver={() => ouvrirFormulaire()} onScrollPass={scrollToPass}/>
            </div>
          </div>
        </section>

        <div style={{ maxWidth:"1000px", margin:"0 auto", padding:"0 24px 100px" }}>

          {/* ── SECTION 2 : QU'EST-CE QUE LE BRUNCH ? ─────────── */}
          <section style={{ padding:"80px 0 0" }}>
            <div style={{ maxWidth:"720px", margin:"0 auto", textAlign:"center" }}>
              <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"20px" }}>
                Qu'est-ce que le Brunch ?
              </p>
              <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.5rem,4vw,2.5rem)", fontWeight:600, lineHeight:1.2, marginBottom:"28px" }}>
                Un événement annuel d'exception
              </h2>
              <div className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:"1rem", color:"rgba(248,245,242,.65)", lineHeight:1.9 }}>
                <p style={{ marginBottom:"16px" }}>
                  Le Brunch des Métamorphosées est un événement annuel d'exception organisé dans différents pays d'Afrique, réunissant des femmes ambitieuses, élégantes et audacieuses.
                </p>
                <p style={{ marginBottom:"16px" }}>
                  C'est un espace unique où se rencontrent : transformation, connexion, inspiration, reconnaissance.
                </p>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.15rem", color:"rgba(201,169,106,.7)" }}>
                  Ce n'est pas un simple événement. C'est une expérience immersive et transformatrice.
                </p>
              </div>
            </div>
          </section>

          {/* ── SECTION 3 : VISION & MISSION ───────────────────── */}
          <section style={{ padding:"72px 0 0" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"20px" }}>
              {[
                { label:"Vision", titre:"Notre Vision", texte:"Créer un écosystème de femmes africaines confiantes, visibles, influentes et impactantes.", color:"#C9A96A" },
                { label:"Mission", titre:"Notre Mission", texte:"Rassembler, élever, connecter et valoriser les femmes afin de les amener à incarner leur plein potentiel et à devenir des leaders dans leurs domaines.", color:"#C2185B" },
              ].map((item, i) => (
                <div key={i} className="reveal" style={{ transitionDelay:`${i*.1}s`, padding:"40px 32px", background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.06)", borderLeft:`3px solid ${item.color}`, borderRadius:"3px" }}>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".58rem", letterSpacing:".25em", textTransform:"uppercase", color:item.color, marginBottom:"12px" }}>{item.label}</p>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", fontWeight:600, marginBottom:"16px" }}>{item.titre}</h3>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.6)", lineHeight:1.85 }}>{item.texte}</p>
                </div>
              ))}
            </div>
          </section>

          {/* ── SECTION 4 : LES 5 PILIERS ──────────────────────── */}
          <section style={{ padding:"80px 0 0" }}>
            <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"12px", textAlign:"center" }}>Les fondements</p>
            <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:600, lineHeight:1.2, marginBottom:"48px", textAlign:"center" }}>Les 5 Piliers du Brunch</h2>
            <div className="piliers-grid reveal" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
              {[
                { num:"01", titre:"Connexion", desc:"Créer des relations authentiques et puissantes entre femmes ambitieuses.", items:["Networking stratégique", "Opportunités de collaboration", "Création de liens durables"] },
                { num:"02", titre:"Élévation", desc:"Favoriser la croissance personnelle et professionnelle.", items:["Enseignements", "Prises de conscience", "Développement intérieur"] },
                { num:"03", titre:"Distinction & Reconnaissance", desc:"Un moment fort pour honorer et valoriser les parcours inspirants.", items:["Distinction des femmes Métamorphosées", "Nomination de l'Ambassadrice Métamorphose 2026 : Une femme qui incarne les valeurs, l'impact et la transformation du mouvement", "Hommage aux leaders engagés : Femmes et hommes qui contribuent à l'épanouissement et au développement de la gent féminine"] },
                { num:"04", titre:"Panels", desc:"Des échanges puissants autour de thématiques profondes.", items:["Discussions inspirantes", "Partages d'expériences", "Déclics transformationnels"] },
                { num:"05", titre:"Expérience", desc:"Une immersion élégante et émotionnelle.", items:["Brunch raffiné", "Ambiance premium", "Moments inoubliables"] },
              ].map((p, i) => (
                <div key={i} className={`pilier-card${i===4?" reveal":"  reveal"}`} style={{ transitionDelay:`${i*.08}s`, gridColumn: i===4 ? "1 / -1" : "auto" }}>
                  <div style={{ display:"flex", alignItems:"flex-start", gap:"16px" }}>
                    <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"2rem", fontWeight:700, color:"rgba(201,169,106,.15)", lineHeight:1, flexShrink:0 }}>{p.num}</span>
                    <div>
                      <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:600, color:"#C9A96A", marginBottom:"8px" }}>{p.titre}</h3>
                      <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.55)", lineHeight:1.7, marginBottom:"14px" }}>{p.desc}</p>
                      <div style={{ display:"flex", flexDirection:"column", gap:"6px" }}>
                        {p.items.map((item, j) => (
                          <div key={j} style={{ display:"flex", gap:"8px", alignItems:"flex-start" }}>
                            <IconDot/>
                            <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"rgba(248,245,242,.6)", fontWeight:300 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="reveal" style={{ marginTop:"48px" }}>
              <BtnsZone2 onReserver={() => ouvrirFormulaire()} onScrollPass={scrollToPass}/>
            </div>
          </section>

          {/* ── SECTION 5 : THÈME CENTRAL ───────────────────────── */}
          <section style={{ padding:"80px 0 0" }}>
            <div className="reveal" style={{ padding:"56px 48px", background:"linear-gradient(135deg,rgba(194,24,91,.08),rgba(201,169,106,.04))", border:"1px solid rgba(194,24,91,.2)", borderRadius:"8px", textAlign:"center" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".3em", textTransform:"uppercase", color:"#C2185B", marginBottom:"16px" }}>Le thème central</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.4rem,4vw,2.4rem)", fontWeight:700, lineHeight:1.15, marginBottom:"28px" }}>
                L'Audace d'une Femme :<br/>
                <em style={{ fontStyle:"italic", fontWeight:400, color:"#C2185B" }}>Frein ou Tremplin ?</em>
              </h2>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".95rem", color:"rgba(248,245,242,.65)", lineHeight:1.9, maxWidth:"580px", margin:"0 auto 24px" }}>
                Chaque femme a du potentiel. Mais tout se joue ici : Oser ou se retenir. Certaines se limitent par peur. D'autres osent… et transforment leur vie.
              </p>
              <div style={{ display:"flex", justifyContent:"center", gap:"24px", flexWrap:"wrap" }}>
                {["Dépasser ses peurs", "Renforcer sa confiance", "Passer à l'action"].map((item, i) => (
                  <div key={i} style={{ display:"flex", alignItems:"center", gap:"8px" }}>
                    <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#C2185B" }}/>
                    <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"rgba(248,245,242,.7)", fontWeight:400 }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── SECTION 6 : LES PANELS ──────────────────────────── */}
          <section style={{ padding:"80px 0 0" }}>
            <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"12px", textAlign:"center" }}>Au programme</p>
            <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:600, marginBottom:"40px", textAlign:"center" }}>Les Panels</h2>
            <div className="panels-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px" }}>
              {[
                {
                  num:"Panel 1", titre:"Identité",
                  sous:"S'assumer pleinement : dépasser le regard des autres.",
                  objectif:"Se libérer du regard extérieur et s'accepter pleinement.",
                  apprentissage:"Comprendre ses blocages, renforcer son identité, développer sa confiance.",
                  resultat:"Affirmation de soi, liberté intérieure, confiance solide.",
                },
                {
                  num:"Panel 2", titre:"Image & Visibilité",
                  sous:"Oser se montrer : l'image comme levier de puissance.",
                  objectif:"Faire de son image un outil d'impact.",
                  apprentissage:"Valoriser son apparence, travailler sa posture, améliorer sa présence.",
                  resultat:"Image forte, confiance visible, aisance publique.",
                },
                {
                  num:"Panel 3", titre:"Impact & Action",
                  sous:"Devenir une femme d'influence : passer à l'action et impacter.",
                  objectif:"Transformer les prises de conscience en actions concrètes.",
                  apprentissage:"Structurer ses objectifs, passer à l'action, développer son leadership.",
                  resultat:"Clarté, action immédiate, impact réel.",
                },
              ].map((panel, i) => (
                <div key={i} className="panel-card reveal" style={{ transitionDelay:`${i*.1}s` }}>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".58rem", letterSpacing:".2em", textTransform:"uppercase", color:"#C2185B", marginBottom:"8px" }}>{panel.num}</p>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", fontWeight:600, color:"#C9A96A", marginBottom:"10px" }}>{panel.titre}</h3>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1rem", color:"rgba(248,245,242,.65)", marginBottom:"20px", lineHeight:1.7 }}>{panel.sous}</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                    {[["Objectif", panel.objectif], ["Apprentissage", panel.apprentissage], ["Résultat", panel.resultat]].map(([lbl, val]) => (
                      <div key={lbl}>
                        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", marginBottom:"4px" }}>{lbl}</p>
                        <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.6)", lineHeight:1.7 }}>{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* ── SECTION 7 : L'EXPÉRIENCE ────────────────────────── */}
          <section style={{ padding:"72px 0 0" }}>
            <div className="reveal" style={{ textAlign:"center", padding:"56px 32px", background:"rgba(255,255,255,.015)", border:"1px solid rgba(255,255,255,.06)", borderRadius:"6px" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"16px" }}>Ce que tu vas vivre</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.4rem,4vw,2rem)", fontWeight:600, marginBottom:"36px" }}>L'Expérience</h2>
              <div style={{ display:"flex", justifyContent:"center", gap:"20px", flexWrap:"wrap", maxWidth:"720px", margin:"0 auto" }}>
                {["Accueil & photos professionnelles", "Brunch raffiné", "Networking stratégique", "Panels inspirants", "Moments d'émotion", "Distinctions officielles"].map((item, i) => (
                  <div key={i} style={{ padding:"12px 20px", background:"rgba(201,169,106,.06)", border:"1px solid rgba(201,169,106,.15)", borderRadius:"100px", fontFamily:"'Montserrat',sans-serif", fontSize:".78rem", fontWeight:400, color:"rgba(248,245,242,.75)" }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── SECTION 8 : DRESS CODE ──────────────────────────── */}
          <section style={{ padding:"72px 0 0" }}>
            <div className="reveal" style={{ textAlign:"center", padding:"56px 40px", background:"linear-gradient(135deg,rgba(201,169,106,.06),rgba(216,193,160,.03))", border:"1px solid rgba(201,169,106,.15)", borderRadius:"8px" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".3em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"12px" }}>Dress Code</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:600, marginBottom:"28px" }}>Élégance Audacieuse</h2>
              <div style={{ height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.4),transparent)", maxWidth:"300px", margin:"0 auto 32px" }}/>
              <blockquote style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"clamp(1.1rem,3vw,1.5rem)", color:"rgba(201,169,106,.85)", lineHeight:1.7, maxWidth:"600px", margin:"0 auto 40px" }}>
                "Habille-toi comme la femme que tu veux devenir et comme celle que tu es appelée à être."
              </blockquote>
              <BtnsZone onReserver={() => ouvrirFormulaire()} onScrollPass={scrollToPass}/>
            </div>
          </section>

          {/* ── SECTION 9 : LES PASS ────────────────────────────── */}
          <section ref={passesRef} style={{ padding:"80px 0 0" }}>
            <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"12px", textAlign:"center" }}>Tarifs</p>
            <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:600, marginBottom:"48px", textAlign:"center" }}>Choisissez votre Pass</h2>
            <div className="passes-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"20px" }}>
              {PASSES.map((pass, i) => (
                <div key={pass.id} className={`pass-card reveal${pass.featured?" featured":""}`} style={{ transitionDelay:`${i*.1}s` }}>
                  {pass.featured && (
                    <div style={{ textAlign:"center", marginBottom:"16px" }}>
                      <span style={{ padding:"4px 14px", background:"rgba(194,24,91,.15)", border:"1px solid rgba(194,24,91,.3)", borderRadius:"100px", fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", fontWeight:600, letterSpacing:".15em", textTransform:"uppercase", color:"#C2185B" }}>
                        Le plus populaire
                      </span>
                    </div>
                  )}
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(248,245,242,.4)", marginBottom:"8px" }}>{pass.sous}</p>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", fontWeight:700, color:"#F8F5F2", marginBottom:"8px" }}>{pass.label}</h3>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.8rem", fontWeight:700, color:"#C9A96A", marginBottom:"24px" }}>{pass.prix}</p>

                  <div style={{ height:"1px", background:"rgba(255,255,255,.06)", marginBottom:"20px" }}/>

                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", marginBottom:"12px" }}>Inclus</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"20px" }}>
                    {pass.inclus.map((item, j) => (
                      <div key={j} className="guide-item">
                        <svg style={{ flexShrink:0, marginTop:"2px" }} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A96A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  {pass.guides.length > 0 && (
                    <>
                      <div style={{ height:"1px", background:"rgba(255,255,255,.06)", marginBottom:"16px" }}/>
                      <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".15em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"6px" }}>Bonus</p>
                      <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".75rem", color:"rgba(201,169,106,.7)", fontWeight:500, marginBottom:"12px" }}>{pass.valeur_guides}</p>
                      <div style={{ display:"flex", flexDirection:"column" }}>
                        {pass.guides.map((guide, j) => (
                          <div key={j} className="guide-item">
                            <svg style={{ flexShrink:0, marginTop:"2px" }} width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#C9A96A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                            <span>{guide}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {pass.cadeau && (
                    <div style={{ marginTop:"16px", padding:"12px 14px", background:"rgba(201,169,106,.06)", border:"1px solid rgba(201,169,106,.15)", borderRadius:"3px" }}>
                      <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".78rem", color:"#C9A96A", fontWeight:500, lineHeight:1.6 }}>{pass.cadeau}</p>
                    </div>
                  )}

                  {pass.reduction && (
                    <p style={{ marginTop:"14px", fontFamily:"'Montserrat',sans-serif", fontSize:".78rem", color:"rgba(194,24,91,.8)", fontWeight:400, lineHeight:1.6 }}>
                      {pass.reduction}
                    </p>
                  )}

                  <button onClick={() => ouvrirFormulaire(pass.id)} className={pass.featured ? "btn-rose" : "btn-outline"} style={{ width:"100%", marginTop:"28px" }}>
                    Choisir ce pass
                  </button>
                </div>
              ))}
            </div>
          </section>

          {/* ── SECTION 10 : MODALITÉS ──────────────────────────── */}
          <section style={{ padding:"64px 0 0" }}>
            <div className="reveal" style={{ padding:"40px 36px", background:"rgba(255,255,255,.02)", border:"1px solid rgba(201,169,106,.1)", borderRadius:"6px" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"16px" }}>Modalités de paiement</p>
              <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.15rem", fontWeight:600, marginBottom:"12px" }}>Paiement en 3 tranches</p>
              <div style={{ display:"flex", gap:"16px", flexWrap:"wrap", marginBottom:"16px" }}>
                {["Mai", "Juin", "Juillet"].map((mois, i) => (
                  <div key={i} style={{ padding:"10px 24px", background:"rgba(201,169,106,.08)", border:"1px solid rgba(201,169,106,.2)", borderRadius:"3px", fontFamily:"'Montserrat',sans-serif", fontSize:".85rem", color:"#C9A96A", fontWeight:500 }}>
                    {mois}
                  </div>
                ))}
              </div>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.5)" }}>
                Date limite : <strong style={{ color:"#C2185B" }}>31 juillet 2026</strong>
              </p>
            </div>
          </section>

          {/* ── SECTION 11 : TEST D'AUDACE ──────────────────────── */}
          <section style={{ padding:"72px 0 0" }}>
            <div className="reveal" style={{ padding:"48px 40px", background:"rgba(194,24,91,.04)", border:"1px solid rgba(194,24,91,.15)", borderRadius:"8px", textAlign:"center" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".3em", textTransform:"uppercase", color:"#C2185B", marginBottom:"16px" }}>Expérience unique</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.3rem,3vw,1.8rem)", fontWeight:600, marginBottom:"20px" }}>Test d'Audace</h2>
              <div style={{ display:"flex", justifyContent:"center", gap:"20px", flexWrap:"wrap" }}>
                {["Évaluer ton niveau", "Identifier tes blocages", "Recevoir un profil personnalisé", "Obtenir des recommandations"].map((item, i) => (
                  <div key={i} style={{ padding:"10px 20px", background:"rgba(194,24,91,.08)", border:"1px solid rgba(194,24,91,.2)", borderRadius:"100px", fontFamily:"'Montserrat',sans-serif", fontSize:".78rem", color:"rgba(248,245,242,.7)" }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ── SECTION 12 : APPEL FINAL ────────────────────────── */}
          <section style={{ padding:"80px 0 0" }}>
            <div className="reveal" style={{ textAlign:"center", padding:"72px 40px", background:"linear-gradient(135deg,rgba(10,10,10,1),rgba(13,5,7,1))", border:"1px solid rgba(201,169,106,.1)", borderRadius:"8px" }}>
              <div style={{ height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.3),transparent)", maxWidth:"200px", margin:"0 auto 40px" }}/>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.8rem,5vw,3rem)", fontWeight:700, lineHeight:1.15, marginBottom:"24px" }}>
                Ne reste pas spectatrice.
              </h2>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"clamp(1rem,2.5vw,1.3rem)", color:"rgba(248,245,242,.55)", lineHeight:1.8, marginBottom:"12px" }}>
                Viens vivre l'expérience, Viens t'élever, Viens incarner ta transformation.
              </p>
              <blockquote style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"clamp(1.1rem,3vw,1.5rem)", color:"#C9A96A", lineHeight:1.7, maxWidth:"600px", margin:"0 auto 48px" }}>
                "Ta vie ne changera pas quand tu seras prête… Elle changera le jour où tu oseras."
              </blockquote>
              <BtnsZone onReserver={() => ouvrirFormulaire()} onScrollPass={scrollToPass}/>
            </div>
          </section>

          {/* ── FORMULAIRE D'INSCRIPTION ─────────────────────────── */}
          {showForm && (
            <section ref={formRef} style={{ padding:"64px 0 0" }}>
              <div style={{ maxWidth:"600px", margin:"0 auto", background:"rgba(255,255,255,.025)", border:"1px solid rgba(201,169,106,.2)", borderRadius:"8px", padding:"48px 40px" }}>

                {step === "form" && (
                  <>
                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"8px" }}>Inscription</p>
                    <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.6rem", fontWeight:600, marginBottom:"8px" }}>Réserver ma place</h3>
                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.45)", marginBottom:"32px" }}>
                      Remplissez le formulaire ci-dessous, puis procédez au paiement sécurisé.
                    </p>

                    {/* Sélecteur Pass */}
                    <div style={{ marginBottom:"24px" }}>
                      <label className="form-label">Votre pass *</label>
                      <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                        {PASSES.map(p => (
                          <button key={p.id} type="button"
                            className={`pass-select-btn${typePass===p.id?" active":""}`}
                            onClick={() => setTypePass(p.id)}>
                            {p.label}<br/>
                            <span style={{ fontSize:".68rem", fontWeight:400, opacity:.7 }}>{p.prix}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <form onSubmit={soumettre} noValidate>
                      <div className="form-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"14px" }}>
                        <div>
                          <label className="form-label">Nom *</label>
                          <input className="form-input" type="text" placeholder="Votre nom" value={form.nom} onChange={e=>setF("nom",e.target.value)}/>
                        </div>
                        <div>
                          <label className="form-label">Prénom *</label>
                          <input className="form-input" type="text" placeholder="Votre prénom" value={form.prenom} onChange={e=>setF("prenom",e.target.value)}/>
                        </div>
                      </div>
                      <div style={{ marginBottom:"14px" }}>
                        <label className="form-label">Adresse e-mail *</label>
                        <input className="form-input" type="email" placeholder="votre@email.com" value={form.email} onChange={e=>setF("email",e.target.value)}/>
                      </div>
                      <div style={{ marginBottom:"28px" }}>
                        <label className="form-label">Téléphone WhatsApp *</label>
                        <input className="form-input" type="tel" placeholder="+229 01 00 00 00" value={form.whatsapp} onChange={e=>setF("whatsapp",e.target.value)}/>
                      </div>

                      {errForm && (
                        <div style={{ padding:"12px 16px", background:"rgba(194,24,91,.08)", border:"1px solid rgba(194,24,91,.2)", borderRadius:"3px", marginBottom:"16px", fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"#C2185B" }}>
                          {errForm}
                        </div>
                      )}

                      <button type="submit" disabled={loadingForm} className="btn-or" style={{ width:"100%", padding:"17px", fontSize:".75rem" }}>
                        {loadingForm ? (
                          <span style={{ display:"flex", alignItems:"center", gap:"10px", justifyContent:"center" }}>
                            <span style={{ width:"16px", height:"16px", border:"2px solid rgba(0,0,0,.2)", borderTop:"2px solid #0A0A0A", borderRadius:"50%", animation:"spin .7s linear infinite" }}/>
                            Traitement…
                          </span>
                        ) : "Continuer vers le paiement"}
                      </button>
                    </form>
                  </>
                )}

                {step === "payer" && (
                  <div style={{ textAlign:"center" }}>
                    {/* Indicateur d'étapes */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", marginBottom:"32px" }}>
                      <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#4CAF50" }}/>
                      <div style={{ height:"1px", width:"40px", background:"rgba(201,169,106,.4)" }}/>
                      <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#C9A96A" }}/>
                      <div style={{ height:"1px", width:"40px", background:"rgba(255,255,255,.1)" }}/>
                      <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"rgba(255,255,255,.2)" }}/>
                    </div>

                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"8px" }}>Étape 2 — Paiement</p>
                    <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", fontWeight:600, marginBottom:"8px" }}>Finalisez votre inscription</h3>
                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.5)", marginBottom:"28px" }}>
                      {passSelectionne?.label} — <strong style={{ color:"#C9A96A" }}>{passSelectionne?.prix}</strong>
                    </p>

                    {/* Récap */}
                    <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"4px", padding:"16px 20px", marginBottom:"24px", textAlign:"left" }}>
                      <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".14em", textTransform:"uppercase", color:"rgba(248,245,242,.35)", marginBottom:"10px" }}>Récapitulatif</p>
                      <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".88rem", fontWeight:500 }}>{form.prenom} {form.nom}</p>
                      <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"rgba(248,245,242,.5)", fontWeight:300 }}>{form.email}</p>
                      <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"rgba(248,245,242,.5)", fontWeight:300 }}>{form.whatsapp}</p>
                      <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", color:"#C9A96A", marginTop:"10px", fontWeight:600 }}>{passSelectionne?.prix}</p>
                    </div>

                    {lienPaie ? (
                      <a href={lienPaie} target="_blank" rel="noreferrer" className="btn-or" style={{ width:"100%", padding:"17px", fontSize:".75rem", display:"flex" }}>
                        Cliquer ici pour payer
                      </a>
                    ) : (
                      <div style={{ padding:"20px", background:"rgba(201,169,106,.05)", border:"1px dashed rgba(201,169,106,.2)", borderRadius:"4px", marginBottom:"12px" }}>
                        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".85rem", color:"#C9A96A", marginBottom:"8px", fontWeight:500 }}>Lien de paiement bientôt disponible</p>
                        <a href="https://wa.me/22901961140" target="_blank" rel="noreferrer" style={{ color:"#25D366", fontSize:".82rem", textDecoration:"none" }}>
                          Contacter Prélia APEDO AHONON sur WhatsApp
                        </a>
                      </div>
                    )}

                    <button onClick={declarerPaiement} style={{ width:"100%", marginTop:"12px", padding:"14px", background:"rgba(76,175,80,.08)", color:"#4CAF50", border:"1px solid rgba(76,175,80,.25)", borderRadius:"3px", fontFamily:"'Montserrat',sans-serif", fontWeight:600, fontSize:".72rem", letterSpacing:".14em", textTransform:"uppercase", cursor:"pointer" }}>
                      J'ai effectué mon paiement
                    </button>
                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".7rem", color:"rgba(248,245,242,.3)", marginTop:"12px", fontWeight:300 }}>
                      En cliquant "J'ai effectué mon paiement", vous confirmez avoir réglé le montant correspondant.
                    </p>
                  </div>
                )}

              </div>
            </section>
          )}

        </div>
      </div>
    </>
  );
}
