import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { configAPI } from "../services/api";

const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';

// ── STYLES ──────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,300;1,400;1,600&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400;1,500&family=Montserrat:wght@200;300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --noir:#060608; --noir-v:#0d0b10; --noir-r:#100a08; --noir-c:#12080a;
    --or:#C9A96A; --or-c:#E8D5A8; --or-p:#f5ead6;
    --rose:#C2185B; --beige:#D8C1A0; --blanc:#F8F5F2;
    --ff-t:'Playfair Display',Georgia,serif;
    --ff-b:'Montserrat',sans-serif;
    --ff-a:'Cormorant Garamond',Georgia,serif;
  }
  html { scroll-behavior:smooth; }
  body { background:var(--noir); color:var(--blanc); font-family:var(--ff-b); font-weight:300; line-height:1.7; overflow-x:hidden; }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:none} }
  @keyframes lineGrow { from{width:0} to{width:100%} }
  @keyframes shimmer  { 0%{background-position:-300% center} 100%{background-position:300% center} }
  @keyframes pulse    { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:.75;transform:scale(1.07)} }
  @keyframes ripple   { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(2.4);opacity:0} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes fall     { 0%{transform:translateY(-10px) rotate(0deg);opacity:0} 10%{opacity:.5} 90%{opacity:.2} 100%{transform:translateY(100vh) rotate(720deg);opacity:0} }

  .scroll-bar { position:fixed;top:0;left:0;height:1px;z-index:9999;background:linear-gradient(90deg,#C9A96A,#C2185B);pointer-events:none;transition:width .1s linear; }

  .reveal { opacity:0; transform:translateY(40px); transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1); }
  .reveal.visible { opacity:1; transform:none; }

  .grain-overlay { position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.04;mix-blend-mode:overlay;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E");
    background-size:200px; }

  .ligne-or { height:1px; background:linear-gradient(90deg,transparent,#C9A96A,transparent); }
  .ligne-or-glow { height:1px; background:linear-gradient(90deg,transparent,#C9A96A,transparent); box-shadow:0 0 10px 1px rgba(201,169,106,.25); }
  .ligne-anim { height:1px; width:0; background:linear-gradient(90deg,transparent,#C9A96A,transparent); animation:lineGrow 1.4s .6s cubic-bezier(.16,1,.3,1) forwards; }

  .s-label { font-family:var(--ff-b);font-weight:200;font-size:.58rem;letter-spacing:.42em;text-transform:uppercase;color:rgba(201,169,106,.55);margin-bottom:20px;display:flex;align-items:center;gap:16px; }
  .s-label::before { content:'';width:32px;height:2px;background:linear-gradient(90deg,#C9A96A,#C2185B);flex-shrink:0; }

  .citation { font-family:var(--ff-a);font-style:italic;font-size:clamp(1.3rem,2.8vw,1.75rem);color:rgba(201,169,106,.8);line-height:1.8;text-align:center;max-width:720px;margin:0 auto;padding:36px 0; }
  .citation::before,.citation::after { content:'';display:block;height:1px;width:100px;margin:0 auto;background:linear-gradient(90deg,transparent,rgba(201,169,106,.35),transparent); }
  .citation::before { margin-bottom:32px; }
  .citation::after  { margin-top:32px; }

  .btn-or   { display:inline-flex;align-items:center;justify-content:center;padding:15px 32px;background:#C9A96A;color:#060608;font-family:var(--ff-b);font-weight:700;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;border:none;border-radius:1px;cursor:pointer;text-decoration:none;transition:all .3s; }
  .btn-or:hover   { background:var(--or-c);transform:translateY(-2px);box-shadow:0 14px 40px rgba(201,169,106,.22); }
  .btn-rose { display:inline-flex;align-items:center;justify-content:center;padding:15px 32px;background:#C2185B;color:#fff;font-family:var(--ff-b);font-weight:700;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;border:none;border-radius:1px;cursor:pointer;text-decoration:none;transition:all .3s; }
  .btn-rose:hover { background:#a01049;transform:translateY(-2px);box-shadow:0 14px 40px rgba(194,24,91,.28); }
  .btn-ghost { display:inline-flex;align-items:center;justify-content:center;padding:14px 28px;background:transparent;color:rgba(201,169,106,.75);font-family:var(--ff-b);font-weight:400;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;border:1px solid rgba(201,169,106,.22);border-radius:1px;cursor:pointer;text-decoration:none;transition:all .3s; }
  .btn-ghost:hover { border-color:rgba(201,169,106,.6);color:#C9A96A;transform:translateY(-2px); }

  .pilier-card { position:relative;padding:40px 48px 40px 36px;background:rgba(255,255,255,.018);border:1px solid rgba(255,255,255,.055);border-left:2px solid transparent;background-clip:padding-box;overflow:hidden;transition:background .4s,transform .4s; }
  .pilier-card::before { content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:linear-gradient(180deg,#C9A96A,#C2185B); }
  .pilier-card:hover { background:rgba(255,255,255,.028);transform:translateX(4px); }
  .pilier-num { position:absolute;right:16px;top:50%;transform:translateY(-50%);font-family:var(--ff-t);font-size:7rem;font-weight:700;color:rgba(201,169,106,.055);line-height:1;pointer-events:none;user-select:none; }

  .pass-card { padding:44px 36px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.07);border-radius:2px;transition:transform .4s cubic-bezier(.16,1,.3,1),box-shadow .4s,border-color .4s; }
  .pass-card:hover { transform:translateY(-8px);box-shadow:0 24px 60px rgba(0,0,0,.4); }
  .pass-card.featured { border-color:rgba(194,24,91,.28);background:rgba(194,24,91,.025);transform:scale(1.02);box-shadow:0 0 60px rgba(194,24,91,.08),0 24px 60px rgba(0,0,0,.5); }
  .pass-card.featured:hover { transform:scale(1.02) translateY(-8px); }

  .guide-line { display:flex;align-items:flex-start;gap:10px;padding:9px 0;border-bottom:1px solid rgba(201,169,106,.07);font-family:var(--ff-b);font-size:.8rem;font-weight:300;color:rgba(248,245,242,.58);line-height:1.5; }
  .guide-line:last-child { border-bottom:none; }

  .panel-card { padding:40px 32px;background:rgba(255,255,255,.014);border:1px solid rgba(255,255,255,.05);border-top:1px solid rgba(201,169,106,.18);transition:background .3s; }
  .panel-card:hover { background:rgba(255,255,255,.025); }

  .form-input { width:100%;padding:15px 18px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:1px;color:#F8F5F2;font-family:var(--ff-b);font-size:.88rem;font-weight:300;outline:none;transition:border-color .3s,box-shadow .3s; }
  .form-input:focus { border-color:rgba(201,169,106,.5);box-shadow:0 0 0 3px rgba(201,169,106,.07); }
  .form-label { font-family:var(--ff-b);font-size:.6rem;font-weight:400;letter-spacing:.2em;text-transform:uppercase;color:rgba(248,245,242,.38);display:block;margin-bottom:8px; }
  .pass-btn { flex:1;padding:14px 10px;border-radius:1px;cursor:pointer;font-family:var(--ff-b);font-size:.66rem;font-weight:600;letter-spacing:.1em;text-transform:uppercase;transition:all .25s;border:1px solid rgba(255,255,255,.07);background:transparent;color:rgba(248,245,242,.4);text-align:center;line-height:1.5; }
  .pass-btn:hover { border-color:rgba(201,169,106,.3);color:rgba(201,169,106,.7); }
  .pass-btn.actif { border-color:#C9A96A;color:#C9A96A;background:rgba(201,169,106,.07);box-shadow:inset 0 0 0 1px rgba(201,169,106,.18); }

  @media(max-width:900px){
    .passes-grid,.panels-grid,.piliers-grid { grid-template-columns:1fr !important; }
    .btns-flex { flex-direction:column !important; align-items:stretch !important; }
    .form-2col { grid-template-columns:1fr !important; }
    .hero-title { font-size:clamp(2rem,8vw,3.5rem) !important; }
  }
`;

// ── CONSTANTES ──────────────────────────────────────────────────────────────
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
  { id:"metamorphosee", label:"Pass Métamorphosée", sous:"Réservée pour les femmes du programme Métamorphose 2026", prix:"50 000 FCFA", montant:50000, featured:false, inclus:["Accès complet","Panels","Distinction officielle","Photos professionnelles","Photos avec les invités d'honneur panélistes","Networking"], guides:[], valeur_guides:null, reduction:null, cadeau:null },
  { id:"decouverte", label:"Pass Découverte", sous:"Réservée pour les femmes participantes au Brunch", prix:"30 000 FCFA", montant:30000, featured:true, inclus:["Accès brunch","Panels","Networking","Photos","Ebook Métamorphose"], guides:GUIDES, valeur_guides:"7 guides d'une valeur de 15 000 FCFA chacun, soit 105 000 FCFA", reduction:"10% de réduction sur le programme Métamorphose (valable pour deux semaines après le brunch).", cadeau:null },
  { id:"vip", label:"Pass VIP", sous:"Réservée pour les femmes participantes au Brunch", prix:"60 000 FCFA", montant:60000, featured:false, inclus:["Accès complet au brunch","Place privilégiée","Rencontre avec la coach","Photos professionnelles avec les officielles","Networking premium"], guides:GUIDES, valeur_guides:"7 guides d'une valeur de 15 000 FCFA chacun, soit 105 000 FCFA", reduction:"15% de réduction sur le programme Métamorphose (valable pour trois semaines après le brunch).", cadeau:"Cadeau exclusif : Ebook Métamorphose + les 3 guides qui l'accompagnent." },
];

const PILIERS = [
  { num:"01", titre:"Connexion", desc:"Créer des relations authentiques et puissantes entre femmes ambitieuses.", items:["Networking stratégique","Opportunités de collaboration","Création de liens durables"] },
  { num:"02", titre:"Élévation", desc:"Favoriser la croissance personnelle et professionnelle.", items:["Enseignements","Prises de conscience","Développement intérieur"] },
  { num:"03", titre:"Distinction & Reconnaissance", desc:"Un moment fort pour honorer et valoriser les parcours inspirants.", items:["Distinction des femmes Métamorphosées","Nomination de l'Ambassadrice Métamorphose 2026 : Une femme qui incarne les valeurs, l'impact et la transformation du mouvement","Hommage aux leaders engagés : Femmes et hommes qui contribuent à l'épanouissement et au développement de la gent féminine"] },
  { num:"04", titre:"Panels", desc:"Des échanges puissants autour de thématiques profondes.", items:["Discussions inspirantes","Partages d'expériences","Déclics transformationnels"] },
  { num:"05", titre:"Expérience", desc:"Une immersion élégante et émotionnelle.", items:["Brunch raffiné","Ambiance premium","Moments inoubliables"] },
];

const PANELS = [
  { num:"Panel 1", titre:"Identité", sous:"S'assumer pleinement : dépasser le regard des autres.", objectif:"Se libérer du regard extérieur et s'accepter pleinement.", apprentissage:"Comprendre ses blocages, renforcer son identité, développer sa confiance.", resultat:"Affirmation de soi, liberté intérieure, confiance solide." },
  { num:"Panel 2", titre:"Image & Visibilité", sous:"Oser se montrer : l'image comme levier de puissance.", objectif:"Faire de son image un outil d'impact.", apprentissage:"Valoriser son apparence, travailler sa posture, améliorer sa présence.", resultat:"Image forte, confiance visible, aisance publique." },
  { num:"Panel 3", titre:"Impact & Action", sous:"Devenir une femme d'influence : passer à l'action et impacter.", objectif:"Transformer les prises de conscience en actions concrètes.", apprentissage:"Structurer ses objectifs, passer à l'action, développer son leadership.", resultat:"Clarté, action immédiate, impact réel." },
];

// ── HOOKS ───────────────────────────────────────────────────────────────────
function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }), { threshold:0.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function useScrollProgress() {
  useEffect(() => {
    const bar = document.querySelector(".scroll-bar");
    if (!bar) return;
    const onScroll = () => {
      const pct = window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100;
      bar.style.width = pct + "%";
    };
    window.addEventListener("scroll", onScroll, { passive:true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
}

// ── SOUS-COMPOSANTS ──────────────────────────────────────────────────────────
function CheckIcon({ color = "#C9A96A" }) {
  return (
    <svg style={{ flexShrink:0, marginTop:"3px" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

function Separateur({ my = "80px" }) {
  return <div className="ligne-or" style={{ maxWidth:"600px", margin:`${my} auto` }}/>;
}

function ZoneBoutons({ onReserver, onScrollPass, reverse = false }) {
  return (
    <div className="btns-flex" style={{ display:"flex", gap:"12px", flexWrap:"wrap", alignItems:"center" }}>
      {reverse ? (
        <>
          <button onClick={onScrollPass} className="btn-or">Choisir mon pass</button>
          <button onClick={onReserver}   className="btn-ghost">Réserver ma place</button>
        </>
      ) : (
        <>
          <button onClick={onReserver}   className="btn-rose">Réserver ma place</button>
          <button onClick={onScrollPass} className="btn-ghost">Choisir mon pass</button>
        </>
      )}
      <a href="https://wa.me/22901961140" target="_blank" rel="noreferrer" className="btn-ghost">Me contacter</a>
      <Link to="/programme" className="btn-ghost">Découvrir le programme</Link>
    </div>
  );
}

// ── COMPOSANT PRINCIPAL ──────────────────────────────────────────────────────
export default function Brunch() {
  useReveal();
  useScrollProgress();

  const passesRef = useRef(null);
  const formRef   = useRef(null);

  const [payLinks, setPayLinks] = useState({});
  useEffect(() => {
    configAPI.public().then(res => {
      const map = {};
      if (Array.isArray(res.data)) res.data.forEach(i => { map[i.cle] = i.valeur; });
      setPayLinks(map);
    }).catch(() => {});
  }, []);

  const [showForm,    setShowForm]    = useState(false);
  const [typePass,    setTypePass]    = useState("decouverte");
  const [form,        setForm]        = useState({ nom:"", prenom:"", email:"", whatsapp:"" });
  const [step,        setStep]        = useState("form");
  const [token,       setToken]       = useState("");
  const [lienPaie,    setLienPaie]    = useState("");
  const [loading,     setLoading]     = useState(false);
  const [errForm,     setErrForm]     = useState("");

  function setF(k, v) { setForm(p => ({...p, [k]:v})); }

  function scrollToPass() {
    passesRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });
  }

  function ouvrirFormulaire(passId = null) {
    if (passId) setTypePass(passId);
    setShowForm(true);
    setStep("form");
    setErrForm("");
    setTimeout(() => formRef.current?.scrollIntoView({ behavior:"smooth", block:"center" }), 120);
  }

  async function soumettre(e) {
    e.preventDefault();
    if (!form.nom.trim() || !form.prenom.trim() || !form.email.trim() || !form.whatsapp.trim()) {
      setErrForm("Tous les champs sont requis."); return;
    }
    setLoading(true); setErrForm("");
    try {
      const res = await fetch(`${API_BASE}/api/auth/reserver-brunch/`, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ ...form, type_pass:typePass }),
      });
      const data = await res.json();
      if (res.ok) {
        setToken(data.token);
        setLienPaie(payLinks[`brunch_lien_${typePass}`] || payLinks["brunch_lien_paiement"] || data.lien_paiement || "");
        setStep("payer");
      } else {
        setErrForm(data.detail || "Une erreur est survenue.");
      }
    } catch { setErrForm("Erreur réseau. Veuillez réessayer."); }
    setLoading(false);
  }

  async function declarerPaiement() {
    try {
      await fetch(`${API_BASE}/api/auth/valider-brunch/`, {
        method:"POST", headers:{ "Content-Type":"application/json" },
        body: JSON.stringify({ token }),
      });
    } catch {}
    window.location.href = `/brunch/success?token=${token}`;
  }

  const passActif = PASSES.find(p => p.id === typePass);
  const BG = ["#060608", "#0d0b10", "#100a08", "#060608", "#0d0b10", "#100a08", "#060608", "#0d0b10", "#100a08", "#12080a", "#060608", "#0d0b10"];

  return (
    <>
      <style>{STYLES}</style>
      <div className="grain-overlay"/>
      <div className="scroll-bar"/>

      <div style={{ background:"#060608", color:"#F8F5F2", minHeight:"100vh", position:"relative" }}>

        {/* ── NAV ── */}
        <nav style={{ padding:"20px 48px", borderBottom:"1px solid rgba(201,169,106,.08)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"rgba(6,6,8,.92)", backdropFilter:"blur(24px)", zIndex:100 }}>
          <Link to="/" style={{ textDecoration:"none" }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.05rem", letterSpacing:".02em" }}>
              <span style={{color:"#F8F5F2"}}>Méta'</span>
              <span style={{color:"#C9A96A"}}>Morph'</span>
              <span style={{color:"#C2185B"}}>Ose</span>
            </span>
          </Link>
          <div style={{ display:"flex", gap:"20px", alignItems:"center" }}>
            <Link to="/" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".65rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(201,169,106,.4)", textDecoration:"none", transition:"color .3s" }}>Accueil</Link>
            <button onClick={() => ouvrirFormulaire()} className="btn-rose" style={{ padding:"10px 22px", fontSize:".66rem" }}>Réserver ma place</button>
          </div>
        </nav>

        {/* ── SECTION 1 : HERO ── */}
        <section style={{ background:"#060608", padding:"140px 48px 100px", textAlign:"center", position:"relative", overflow:"hidden", minHeight:"92vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          {/* Lueur rose bas */}
          <div style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", width:"80%", height:"40%", background:"radial-gradient(ellipse 70% 60% at 50% 100%,rgba(194,24,91,.06),transparent)", pointerEvents:"none" }}/>
          {/* Lueur or centre */}
          <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translateX(-50%)", width:"60%", height:"60%", background:"radial-gradient(ellipse 50% 40% at 50% 50%,rgba(201,169,106,.04),transparent)", pointerEvents:"none" }}/>

          <div style={{ position:"relative", maxWidth:"860px", margin:"0 auto" }}>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:200, fontSize:".56rem", letterSpacing:".5em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", marginBottom:"24px", animation:"fadeUp .6s both" }}>
              Page de vente officielle
            </p>

            {/* Ligne or animée */}
            <div className="ligne-anim" style={{ maxWidth:"120px", margin:"0 auto 40px" }}/>

            <h1 className="hero-title" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2.8rem,6.5vw,5rem)", fontWeight:700, lineHeight:1.05, marginBottom:"28px", animation:"fadeUp .7s .15s both" }}>
              Le Brunch des<br/>
              <em style={{
                fontStyle:"italic", fontWeight:600,
                background:"linear-gradient(90deg,#C9A96A,#E8D5A8,#C9A96A,#f5ead6,#C9A96A)",
                backgroundSize:"300% auto",
                WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
                backgroundClip:"text",
                animation:"shimmer 5s linear infinite",
              }}>
                Métamorphosées 2026
              </em>
            </h1>

            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"clamp(1.15rem,2.5vw,1.5rem)", color:"rgba(248,245,242,.55)", marginBottom:"24px", animation:"fadeUp .7s .3s both", letterSpacing:".02em" }}>
              Célébrer. Connecter. Élever. Distinguer.
            </p>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:"1rem", color:"rgba(248,245,242,.45)", marginBottom:"52px", animation:"fadeUp .7s .4s both" }}>
              Tu n'es plus la même femme… Il est temps de le célébrer.
            </p>

            {/* Infos clés */}
            <div style={{ display:"inline-flex", gap:"48px", marginBottom:"60px", animation:"fadeUp .7s .45s both", flexWrap:"wrap", justifyContent:"center" }}>
              {[["Bénin","Pays"],["Décembre 2026","Date"],["À préciser","Lieu exact"]].map(([val, lbl]) => (
                <div key={lbl} style={{ textAlign:"center" }}>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:200, fontSize:".55rem", letterSpacing:".3em", textTransform:"uppercase", color:"rgba(201,169,106,.4)", marginBottom:"6px" }}>{lbl}</p>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", fontWeight:600, color:"rgba(248,245,242,.85)" }}>{val}</p>
                </div>
              ))}
            </div>

            <div style={{ animation:"fadeUp .7s .5s both" }}>
              <ZoneBoutons onReserver={() => ouvrirFormulaire()} onScrollPass={scrollToPass}/>
            </div>
          </div>
        </section>

        {/* ── SECTION 2 : QU'EST-CE QUE LE BRUNCH ? ── */}
        <section style={{ background:"#0d0b10", padding:"100px 48px" }}>
          <div className="ligne-or-glow" style={{ maxWidth:"200px", margin:"0 auto 80px" }}/>
          <div style={{ maxWidth:"760px", margin:"0 auto", textAlign:"center" }}>
            <p className="reveal s-label" style={{ justifyContent:"center" }}>Qu'est-ce que le Brunch ?</p>
            <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.6rem,3.5vw,2.6rem)", fontWeight:600, lineHeight:1.2, marginBottom:"36px" }}>
              Un événement annuel d'exception
            </h2>
            <div className="reveal" style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:"1rem", color:"rgba(248,245,242,.62)", lineHeight:1.9 }}>
                Le Brunch des Métamorphosées est un événement annuel d'exception organisé dans différents pays d'Afrique, réunissant des femmes ambitieuses, élégantes et audacieuses.
              </p>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:"1rem", color:"rgba(248,245,242,.62)", lineHeight:1.9 }}>
                C'est un espace unique où se rencontrent : transformation, connexion, inspiration, reconnaissance.
              </p>
            </div>
            <div className="reveal citation" style={{ marginTop:"16px" }}>
              Ce n'est pas un simple événement. C'est une expérience immersive et transformatrice.
            </div>
          </div>
        </section>

        {/* ── SECTION 3 : VISION & MISSION ── */}
        <section style={{ background:"#100a08", padding:"100px 48px" }}>
          <div style={{ maxWidth:"960px", margin:"0 auto", display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px" }}>
            {[
              { id:"Vision",   texte:"Créer un écosystème de femmes africaines confiantes, visibles, influentes et impactantes.", couleur:"#C9A96A" },
              { id:"Mission",  texte:"Rassembler, élever, connecter et valoriser les femmes afin de les amener à incarner leur plein potentiel et à devenir des leaders dans leurs domaines.", couleur:"#C2185B" },
            ].map((item, i) => (
              <div key={item.id} className="reveal" style={{ transitionDelay:`${i*.12}s`, padding:"44px 36px", background:"rgba(255,255,255,.018)", border:"1px solid rgba(255,255,255,.055)", position:"relative", overflow:"hidden" }}>
                <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg,${item.couleur},transparent)` }}/>
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:200, fontSize:".56rem", letterSpacing:".38em", textTransform:"uppercase", color:item.couleur, marginBottom:"16px", opacity:.7 }}>{item.id}</p>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.25rem", color:"rgba(248,245,242,.8)", lineHeight:1.75 }}>{item.texte}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── SECTION 4 : LES 5 PILIERS ── */}
        <section style={{ background:"#060608", padding:"100px 48px" }}>
          <div style={{ maxWidth:"960px", margin:"0 auto" }}>
            <p className="reveal s-label">Les fondements</p>
            <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.6rem,3.5vw,2.4rem)", fontWeight:600, lineHeight:1.2, marginBottom:"56px" }}>Les 5 Piliers du Brunch</h2>
            <div className="piliers-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
              {PILIERS.map((p, i) => (
                <div key={p.num} className={`pilier-card reveal${i===4?" ":""}`} style={{ transitionDelay:`${i*.1}s`, gridColumn:i===4?"1 / -1":"auto" }}>
                  <span className="pilier-num">{p.num}</span>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.15rem", fontWeight:600, color:"#C9A96A", marginBottom:"10px" }}>{p.titre}</h3>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".86rem", color:"rgba(248,245,242,.5)", lineHeight:1.75, marginBottom:"18px" }}>{p.desc}</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:"7px" }}>
                    {p.items.map((item, j) => (
                      <div key={j} style={{ display:"flex", gap:"10px", alignItems:"flex-start" }}>
                        <CheckIcon/>
                        <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"rgba(248,245,242,.55)", fontWeight:300 }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="reveal" style={{ marginTop:"56px" }}>
              <ZoneBoutons reverse onReserver={() => ouvrirFormulaire()} onScrollPass={scrollToPass}/>
            </div>
          </div>
        </section>

        {/* ── SECTION 5 : THÈME CENTRAL ── */}
        <section style={{ background:"#0d0b10", padding:"100px 48px" }}>
          <div style={{ maxWidth:"800px", margin:"0 auto", textAlign:"center" }}>
            <div className="reveal" style={{ padding:"64px 48px", background:"rgba(194,24,91,.04)", border:"1px solid rgba(194,24,91,.15)", position:"relative" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg,transparent,rgba(194,24,91,.4),transparent)" }}/>
              <p className="s-label" style={{ justifyContent:"center" }}>Le thème central</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.5rem,3.5vw,2.4rem)", fontWeight:700, lineHeight:1.15, marginBottom:"32px" }}>
                L'Audace d'une Femme :<br/>
                <em style={{ fontStyle:"italic", fontWeight:400, color:"#C2185B" }}>Frein ou Tremplin ?</em>
              </h2>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".95rem", color:"rgba(248,245,242,.6)", lineHeight:1.9, marginBottom:"28px" }}>
                Chaque femme a du potentiel. Mais tout se joue ici : Oser ou se retenir.<br/>Certaines se limitent par peur. D'autres osent… et transforment leur vie.
              </p>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:200, fontSize:".7rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", marginBottom:"20px" }}>Objectif : Créer un déclic pour</p>
              <div style={{ display:"flex", justifyContent:"center", gap:"20px", flexWrap:"wrap" }}>
                {["Dépasser ses peurs","Renforcer sa confiance","Passer à l'action"].map((item, i) => (
                  <div key={i} style={{ padding:"10px 22px", background:"rgba(194,24,91,.08)", border:"1px solid rgba(194,24,91,.2)", fontFamily:"'Montserrat',sans-serif", fontSize:".8rem", color:"rgba(248,245,242,.7)" }}>{item}</div>
                ))}
              </div>
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg,transparent,rgba(194,24,91,.4),transparent)" }}/>
            </div>
          </div>
        </section>

        {/* ── SECTION 6 : LES PANELS ── */}
        <section style={{ background:"#100a08", padding:"100px 48px" }}>
          <div style={{ maxWidth:"1000px", margin:"0 auto" }}>
            <p className="reveal s-label">Au programme</p>
            <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.6rem,3.5vw,2.4rem)", fontWeight:600, marginBottom:"52px" }}>Les Panels</h2>
            <div className="panels-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"16px" }}>
              {PANELS.map((panel, i) => (
                <div key={i} className="panel-card reveal" style={{ transitionDelay:`${i*.12}s` }}>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:200, fontSize:".55rem", letterSpacing:".3em", textTransform:"uppercase", color:"rgba(194,24,91,.6)", marginBottom:"10px" }}>{panel.num}</p>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", fontWeight:600, color:"#C9A96A", marginBottom:"12px" }}>{panel.titre}</h3>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.05rem", color:"rgba(248,245,242,.6)", marginBottom:"24px", lineHeight:1.7 }}>{panel.sous}</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                    {[["Objectif",panel.objectif],["Apprentissage",panel.apprentissage],["Résultat",panel.resultat]].map(([lbl, val]) => (
                      <div key={lbl}>
                        <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:200, fontSize:".55rem", letterSpacing:".25em", textTransform:"uppercase", color:"rgba(201,169,106,.45)", marginBottom:"5px" }}>{lbl}</p>
                        <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.55)", lineHeight:1.7 }}>{val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 7 : L'EXPÉRIENCE ── */}
        <section style={{ background:"#060608", padding:"100px 48px", textAlign:"center" }}>
          <div style={{ maxWidth:"800px", margin:"0 auto" }}>
            <p className="reveal s-label" style={{ justifyContent:"center" }}>Ce que tu vas vivre</p>
            <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.6rem,3.5vw,2.2rem)", fontWeight:600, marginBottom:"48px" }}>L'Expérience</h2>
            <div className="reveal" style={{ display:"flex", justifyContent:"center", gap:"14px", flexWrap:"wrap" }}>
              {["Accueil & photos professionnelles","Brunch raffiné","Networking stratégique","Panels inspirants","Moments d'émotion","Distinctions officielles"].map((item, i) => (
                <div key={i} style={{ padding:"12px 22px", background:"rgba(201,169,106,.05)", border:"1px solid rgba(201,169,106,.12)", fontFamily:"'Montserrat',sans-serif", fontSize:".8rem", fontWeight:300, color:"rgba(248,245,242,.7)", letterSpacing:".04em" }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 8 : DRESS CODE ── */}
        <section style={{ background:"#0d0b10", padding:"100px 48px", textAlign:"center" }}>
          <div style={{ maxWidth:"760px", margin:"0 auto" }}>
            <div className="reveal" style={{ padding:"64px 48px", background:"rgba(201,169,106,.03)", border:"1px solid rgba(201,169,106,.1)", position:"relative" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.35),transparent)" }}/>
              <p className="s-label" style={{ justifyContent:"center" }}>Dress Code</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.5rem,3.5vw,2.2rem)", fontWeight:600, marginBottom:"32px", letterSpacing:".04em" }}>Élégance Audacieuse</h2>
              <div className="ligne-or" style={{ maxWidth:"80px", margin:"0 auto 36px" }}/>
              <blockquote style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"clamp(1.2rem,2.8vw,1.6rem)", color:"rgba(201,169,106,.82)", lineHeight:1.75, maxWidth:"580px", margin:"0 auto 48px" }}>
                "Habille-toi comme la femme que tu veux devenir et comme celle que tu es appelée à être."
              </blockquote>
              <ZoneBoutons onReserver={() => ouvrirFormulaire()} onScrollPass={scrollToPass}/>
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.35),transparent)" }}/>
            </div>
          </div>
        </section>

        {/* ── SECTION 9 : LES PASS ── */}
        <section ref={passesRef} style={{ background:"#100a08", padding:"100px 48px" }}>
          <div style={{ maxWidth:"1060px", margin:"0 auto" }}>
            <p className="reveal s-label">Tarifs</p>
            <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.6rem,3.5vw,2.4rem)", fontWeight:600, marginBottom:"56px" }}>Choisissez votre Pass</h2>
            <div className="passes-grid reveal" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"20px", alignItems:"start" }}>
              {PASSES.map((pass, i) => (
                <div key={pass.id} className={`pass-card${pass.featured?" featured":""}`} style={{ transitionDelay:`${i*.1}s` }}>
                  {pass.featured && (
                    <div style={{ textAlign:"center", marginBottom:"18px" }}>
                      <span style={{ padding:"4px 16px", background:"rgba(194,24,91,.12)", border:"1px solid rgba(194,24,91,.28)", fontFamily:"'Montserrat',sans-serif", fontSize:".58rem", fontWeight:600, letterSpacing:".2em", textTransform:"uppercase", color:"#C2185B", animation:"pulse 2.5s ease-in-out infinite", display:"inline-block" }}>
                        Le plus populaire
                      </span>
                    </div>
                  )}
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:200, fontSize:".58rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(248,245,242,.35)", marginBottom:"8px" }}>{pass.sous}</p>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", fontWeight:700, color:"#F8F5F2", marginBottom:"10px" }}>{pass.label}</h3>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.9rem", fontWeight:700, color:"#C9A96A", marginBottom:"28px" }}>{pass.prix}</p>

                  <div style={{ height:"1px", background:"linear-gradient(90deg,rgba(201,169,106,.2),transparent)", marginBottom:"22px" }}/>

                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:200, fontSize:".58rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(201,169,106,.45)", marginBottom:"14px" }}>Inclus</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:"9px", marginBottom:"22px" }}>
                    {pass.inclus.map((item, j) => (
                      <div key={j} style={{ display:"flex", gap:"10px", alignItems:"flex-start" }}>
                        <CheckIcon/>
                        <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"rgba(248,245,242,.62)", fontWeight:300 }}>{item}</span>
                      </div>
                    ))}
                  </div>

                  {pass.guides.length > 0 && (
                    <>
                      <div style={{ height:"1px", background:"linear-gradient(90deg,rgba(201,169,106,.15),transparent)", margin:"20px 0 18px" }}/>
                      <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:200, fontSize:".58rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", marginBottom:"6px" }}>Bonus</p>
                      <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:".95rem", color:"rgba(201,169,106,.65)", marginBottom:"14px" }}>{pass.valeur_guides}</p>
                      <div style={{ display:"flex", flexDirection:"column" }}>
                        {pass.guides.map((guide, j) => (
                          <div key={j} className="guide-line">
                            <CheckIcon color="rgba(201,169,106,.5)"/>
                            <span>{guide}</span>
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {pass.cadeau && (
                    <div style={{ marginTop:"16px", padding:"14px 16px", background:"rgba(201,169,106,.05)", border:"1px solid rgba(201,169,106,.12)" }}>
                      <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".8rem", color:"rgba(201,169,106,.75)", fontWeight:400, lineHeight:1.6 }}>{pass.cadeau}</p>
                    </div>
                  )}

                  {pass.reduction && (
                    <p style={{ marginTop:"14px", fontFamily:"'Montserrat',sans-serif", fontSize:".78rem", color:"rgba(194,24,91,.7)", fontWeight:300, lineHeight:1.6, fontStyle:"italic" }}>
                      {pass.reduction}
                    </p>
                  )}

                  <button onClick={() => ouvrirFormulaire(pass.id)} className={pass.featured ? "btn-rose" : "btn-ghost"} style={{ width:"100%", marginTop:"30px" }}>
                    Choisir ce pass
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── SECTION 10 : MODALITÉS ── */}
        <section style={{ background:"#060608", padding:"80px 48px" }}>
          <div style={{ maxWidth:"700px", margin:"0 auto" }}>
            <div className="reveal" style={{ padding:"44px 40px", background:"rgba(255,255,255,.018)", border:"1px solid rgba(201,169,106,.08)" }}>
              <p className="s-label">Modalités de paiement</p>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", fontWeight:600, marginBottom:"20px" }}>Paiement en 3 tranches</h3>
              <div style={{ display:"flex", gap:"14px", flexWrap:"wrap", marginBottom:"20px" }}>
                {["Mai","Juin","Juillet"].map((mois, i) => (
                  <div key={i} style={{ padding:"10px 28px", background:"rgba(201,169,106,.07)", border:"1px solid rgba(201,169,106,.18)", fontFamily:"'Montserrat',sans-serif", fontSize:".85rem", color:"#C9A96A", fontWeight:500, letterSpacing:".08em" }}>
                    {mois}
                  </div>
                ))}
              </div>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.45)" }}>
                Date limite : <strong style={{ color:"#C2185B", fontWeight:600 }}>31 juillet 2026</strong>
              </p>
            </div>
          </div>
        </section>

        {/* ── SECTION 11 : TEST D'AUDACE ── */}
        <section style={{ background:"#0d0b10", padding:"80px 48px", textAlign:"center" }}>
          <div style={{ maxWidth:"700px", margin:"0 auto" }}>
            <div className="reveal" style={{ padding:"52px 40px", background:"rgba(194,24,91,.03)", border:"1px solid rgba(194,24,91,.1)" }}>
              <p className="s-label" style={{ justifyContent:"center" }}>Expérience unique</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:600, marginBottom:"24px" }}>Test d'Audace</h2>
              <div style={{ display:"flex", justifyContent:"center", gap:"14px", flexWrap:"wrap" }}>
                {["Évaluer ton niveau","Identifier tes blocages","Recevoir un profil personnalisé","Obtenir des recommandations"].map((item, i) => (
                  <div key={i} style={{ padding:"10px 20px", background:"rgba(194,24,91,.07)", border:"1px solid rgba(194,24,91,.18)", fontFamily:"'Montserrat',sans-serif", fontSize:".78rem", fontWeight:300, color:"rgba(248,245,242,.68)" }}>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 12 : APPEL FINAL ── */}
        <section style={{ background:"#100a08", padding:"120px 48px", textAlign:"center" }}>
          <div style={{ maxWidth:"800px", margin:"0 auto" }}>
            <div className="ligne-or" style={{ maxWidth:"120px", margin:"0 auto 60px" }}/>
            <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:700, lineHeight:1.1, marginBottom:"24px" }}>
              Ne reste pas spectatrice.
            </h2>
            <p className="reveal" style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"clamp(1rem,2.5vw,1.3rem)", color:"rgba(248,245,242,.5)", lineHeight:1.8, marginBottom:"12px" }}>
              Viens vivre l'expérience. Viens t'élever. Viens incarner ta transformation.
            </p>
            <div className="reveal citation" style={{ marginTop:"8px", marginBottom:"56px" }}>
              "Ta vie ne changera pas quand tu seras prête… Elle changera le jour où tu oseras."
            </div>
            <div className="reveal">
              <ZoneBoutons onReserver={() => ouvrirFormulaire()} onScrollPass={scrollToPass}/>
            </div>
            <div className="ligne-or" style={{ maxWidth:"120px", margin:"60px auto 0" }}/>
          </div>
        </section>

        {/* ── FORMULAIRE ── */}
        {showForm && (
          <section ref={formRef} style={{ background:"#060608", padding:"80px 48px" }}>
            <div style={{ maxWidth:"620px", margin:"0 auto", background:"rgba(255,255,255,.025)", border:"1px solid rgba(201,169,106,.14)", padding:"56px 48px", position:"relative" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg,transparent,#C9A96A,transparent)" }}/>

              {step === "form" && (
                <>
                  <p className="s-label">Inscription</p>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.8rem", fontWeight:600, marginBottom:"8px" }}>Réserver ma place</h3>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.4)", marginBottom:"36px" }}>
                    Remplissez le formulaire, puis procédez au paiement sécurisé.
                  </p>

                  {/* Sélecteur pass */}
                  <div style={{ marginBottom:"28px" }}>
                    <label className="form-label">Votre pass *</label>
                    <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                      {PASSES.map(p => (
                        <button key={p.id} type="button" className={`pass-btn${typePass===p.id?" actif":""}`} onClick={() => setTypePass(p.id)}>
                          {p.label}<br/><span style={{ fontSize:".6rem", fontWeight:300, opacity:.65 }}>{p.prix}</span>
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
                    <div style={{ marginBottom:"32px" }}>
                      <label className="form-label">Téléphone WhatsApp *</label>
                      <input className="form-input" type="tel" placeholder="+229 01 00 00 00" value={form.whatsapp} onChange={e=>setF("whatsapp",e.target.value)}/>
                    </div>
                    {errForm && (
                      <div style={{ padding:"12px 16px", background:"rgba(194,24,91,.08)", border:"1px solid rgba(194,24,91,.2)", marginBottom:"16px", fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"#C2185B" }}>
                        {errForm}
                      </div>
                    )}
                    <button type="submit" disabled={loading} className="btn-or" style={{ width:"100%", padding:"18px", fontSize:".74rem" }}>
                      {loading ? (
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
                  {/* Étapes */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", marginBottom:"36px" }}>
                    <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#4CAF50" }}/>
                    <div style={{ height:"1px", width:"48px", background:"rgba(201,169,106,.35)" }}/>
                    <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#C9A96A", boxShadow:"0 0 12px rgba(201,169,106,.5)" }}/>
                    <div style={{ height:"1px", width:"48px", background:"rgba(255,255,255,.1)" }}/>
                    <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"rgba(255,255,255,.2)" }}/>
                  </div>

                  <p className="s-label" style={{ justifyContent:"center" }}>Étape 2 — Paiement</p>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.6rem", fontWeight:600, marginBottom:"8px" }}>Finalisez votre inscription</h3>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.45)", marginBottom:"32px" }}>
                    {passActif?.label} — <strong style={{ color:"#C9A96A", fontWeight:600 }}>{passActif?.prix}</strong>
                  </p>

                  {/* Récap */}
                  <div style={{ background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.06)", padding:"18px 22px", marginBottom:"28px", textAlign:"left" }}>
                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:200, fontSize:".58rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(248,245,242,.3)", marginBottom:"12px" }}>Récapitulatif</p>
                    <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", fontWeight:600 }}>{form.prenom} {form.nom}</p>
                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".84rem", color:"rgba(248,245,242,.45)", fontWeight:300 }}>{form.email}</p>
                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".84rem", color:"rgba(248,245,242,.45)", fontWeight:300 }}>{form.whatsapp}</p>
                    <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", color:"#C9A96A", marginTop:"12px", fontWeight:600 }}>{passActif?.prix}</p>
                  </div>

                  {lienPaie ? (
                    <a href={lienPaie} target="_blank" rel="noreferrer" className="btn-or" style={{ width:"100%", padding:"18px", fontSize:".74rem", display:"flex", marginBottom:"12px" }}>
                      Cliquer ici pour payer
                    </a>
                  ) : (
                    <div style={{ padding:"22px", background:"rgba(201,169,106,.04)", border:"1px dashed rgba(201,169,106,.18)", marginBottom:"12px", textAlign:"center" }}>
                      <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".85rem", color:"rgba(201,169,106,.7)", marginBottom:"10px" }}>Lien de paiement bientôt disponible</p>
                      <a href="https://wa.me/22901961140" target="_blank" rel="noreferrer" style={{ color:"#25D366", fontSize:".82rem", textDecoration:"none" }}>
                        Contacter Prélia APEDO AHONON sur WhatsApp
                      </a>
                    </div>
                  )}

                  <button onClick={declarerPaiement} style={{ width:"100%", padding:"15px", background:"rgba(76,175,80,.07)", color:"#4CAF50", border:"1px solid rgba(76,175,80,.22)", fontFamily:"'Montserrat',sans-serif", fontWeight:600, fontSize:".7rem", letterSpacing:".14em", textTransform:"uppercase", cursor:"pointer", transition:"all .3s" }}>
                    J'ai effectué mon paiement
                  </button>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", color:"rgba(248,245,242,.25)", marginTop:"14px", fontWeight:300 }}>
                    En cliquant ci-dessus, vous confirmez avoir réglé le montant correspondant à votre pass.
                  </p>
                </div>
              )}

              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.2),transparent)" }}/>
            </div>
          </section>
        )}

      </div>
    </>
  );
}
