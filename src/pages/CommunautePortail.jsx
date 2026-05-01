import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { configAPI } from "../services/api";

const API_BASE = import.meta.env.VITE_API_URL || '';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,300;1,400;1,600&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400;1,500&family=Montserrat:wght@200;300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --noir:#060608; --noir-v:#0d0b10; --noir-r:#100a08; --noir-c:#12080a;
    --or:#C9A96A; --or-c:#E8D5A8; --rose:#C2185B; --beige:#D8C1A0; --blanc:#F8F5F2;
    --ff-t:'Playfair Display',Georgia,serif;
    --ff-b:'Montserrat',sans-serif;
    --ff-a:'Cormorant Garamond',Georgia,serif;
  }
  html { scroll-behavior:smooth; }
  body { background:var(--noir); color:var(--blanc); font-family:var(--ff-b); font-weight:300; line-height:1.7; overflow-x:hidden; }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(40px)} to{opacity:1;transform:none} }
  @keyframes lineGrow { from{width:0} to{width:100%} }
  @keyframes shimmer  { 0%{background-position:-300% center} 100%{background-position:300% center} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes pulse    { 0%,100%{opacity:1} 50%{opacity:.6} }

  .scroll-bar { position:fixed;top:0;left:0;height:1px;z-index:9999;background:linear-gradient(90deg,#C9A96A,#C2185B);pointer-events:none;transition:width .1s linear; }
  .grain-overlay { position:fixed;inset:0;z-index:1;pointer-events:none;opacity:.04;mix-blend-mode:overlay;
    background-image:url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23n)' opacity='.4'/%3E%3C/svg%3E");
    background-size:200px; }

  .reveal { opacity:0; transform:translateY(40px); transition:opacity .9s cubic-bezier(.16,1,.3,1),transform .9s cubic-bezier(.16,1,.3,1); }
  .reveal.visible { opacity:1; transform:none; }

  .ligne-or      { height:1px; background:linear-gradient(90deg,transparent,#C9A96A,transparent); }
  .ligne-or-glow { height:1px; background:linear-gradient(90deg,transparent,#C9A96A,transparent); box-shadow:0 0 10px 1px rgba(201,169,106,.2); }
  .ligne-anim    { height:1px;width:0;background:linear-gradient(90deg,transparent,#C9A96A,transparent);animation:lineGrow 1.4s .6s cubic-bezier(.16,1,.3,1) forwards; }

  .s-label { font-family:var(--ff-b);font-weight:200;font-size:.58rem;letter-spacing:.42em;text-transform:uppercase;color:rgba(201,169,106,.55);margin-bottom:20px;display:flex;align-items:center;gap:16px; }
  .s-label::before { content:'';width:32px;height:2px;background:linear-gradient(90deg,#C9A96A,#C2185B);flex-shrink:0; }

  .citation { font-family:var(--ff-a);font-style:italic;font-size:clamp(1.2rem,2.8vw,1.7rem);color:rgba(201,169,106,.8);line-height:1.8;text-align:center;max-width:720px;margin:0 auto;padding:32px 0; }
  .citation::before,.citation::after { content:'';display:block;height:1px;width:100px;margin:0 auto;background:linear-gradient(90deg,transparent,rgba(201,169,106,.35),transparent); }
  .citation::before { margin-bottom:28px; }
  .citation::after  { margin-top:28px; }

  .btn-or   { display:inline-flex;align-items:center;justify-content:center;padding:15px 32px;background:#C9A96A;color:#060608;font-family:var(--ff-b);font-weight:700;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;border:none;border-radius:1px;cursor:pointer;text-decoration:none;transition:all .3s; }
  .btn-or:hover   { background:var(--or-c);transform:translateY(-2px);box-shadow:0 14px 40px rgba(201,169,106,.22); }
  .btn-rose { display:inline-flex;align-items:center;justify-content:center;padding:15px 32px;background:#C2185B;color:#fff;font-family:var(--ff-b);font-weight:700;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;border:none;border-radius:1px;cursor:pointer;text-decoration:none;transition:all .3s; }
  .btn-rose:hover { background:#a01049;transform:translateY(-2px);box-shadow:0 14px 40px rgba(194,24,91,.28); }
  .btn-ghost { display:inline-flex;align-items:center;justify-content:center;padding:14px 28px;background:transparent;color:rgba(201,169,106,.75);font-family:var(--ff-b);font-weight:400;font-size:.72rem;letter-spacing:.18em;text-transform:uppercase;border:1px solid rgba(201,169,106,.22);border-radius:1px;cursor:pointer;text-decoration:none;transition:all .3s; }
  .btn-ghost:hover { border-color:rgba(201,169,106,.6);color:#C9A96A;transform:translateY(-2px); }

  .valeur-card { position:relative;padding:36px 28px;background:rgba(255,255,255,.018);border:1px solid rgba(255,255,255,.055);overflow:hidden;transition:background .4s,transform .4s; }
  .valeur-card::before { content:'';position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,#C9A96A,#C2185B); }
  .valeur-card:hover { background:rgba(255,255,255,.03);transform:translateY(-4px); }
  .valeur-num { position:absolute;right:14px;bottom:10px;font-family:var(--ff-t);font-size:5rem;font-weight:700;color:rgba(201,169,106,.05);line-height:1;pointer-events:none;user-select:none; }

  .abo-card { padding:44px 36px;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.07);border-radius:2px;transition:transform .4s cubic-bezier(.16,1,.3,1),box-shadow .4s; }
  .abo-card:hover { transform:translateY(-8px);box-shadow:0 24px 60px rgba(0,0,0,.4); }
  .abo-card.star  { border-color:rgba(201,169,106,.28);background:rgba(201,169,106,.025);box-shadow:0 0 60px rgba(201,169,106,.07); }
  .abo-card.star:hover { transform:scale(1.02) translateY(-8px); }

  .abo-line { display:flex;align-items:flex-start;gap:10px;padding:8px 0;border-bottom:1px solid rgba(201,169,106,.07);font-family:var(--ff-b);font-size:.8rem;font-weight:300;color:rgba(248,245,242,.6);line-height:1.5; }
  .abo-line:last-child { border-bottom:none; }

  .faq-item { border-bottom:1px solid rgba(255,255,255,.06); }
  .faq-btn  { width:100%;display:flex;justify-content:space-between;align-items:center;padding:22px 0;background:none;border:none;cursor:pointer;text-align:left;gap:16px; }
  .faq-body { overflow:hidden;transition:max-height .45s cubic-bezier(.16,1,.3,1),opacity .35s; }

  .regle-item { display:flex;gap:16px;align-items:flex-start;padding:16px 0;border-bottom:1px solid rgba(255,255,255,.04); }
  .regle-item:last-child { border-bottom:none; }

  .form-input { width:100%;padding:15px 18px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.08);border-radius:1px;color:#F8F5F2;font-family:var(--ff-b);font-size:.88rem;font-weight:300;outline:none;transition:border-color .3s,box-shadow .3s; }
  .form-input:focus { border-color:rgba(201,169,106,.5);box-shadow:0 0 0 3px rgba(201,169,106,.07); }
  .form-label { font-family:var(--ff-b);font-size:.6rem;font-weight:400;letter-spacing:.2em;text-transform:uppercase;color:rgba(248,245,242,.38);display:block;margin-bottom:8px; }

  @media(max-width:900px){
    .valeurs-grid,.abos-grid,.btns-flex { grid-template-columns:1fr !important; }
    .btns-flex { flex-direction:column !important; align-items:stretch !important; }
    .form-2col  { grid-template-columns:1fr !important; }
  }
`;

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }), { threshold:.1 });
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function useScrollProgress() {
  useEffect(() => {
    const bar = document.querySelector(".scroll-bar");
    if (!bar) return;
    const fn = () => { bar.style.width = (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100) + "%"; };
    window.addEventListener("scroll", fn, { passive:true });
    return () => window.removeEventListener("scroll", fn);
  }, []);
}

function CheckIcon({ color="#C9A96A" }) {
  return (
    <svg style={{ flexShrink:0, marginTop:"3px" }} width="13" height="13" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  );
}

const VALEURS = [
  { num:"01", titre:"Authenticité",  desc:"C'est l'engagement d'être vraie, sans masque ni imitation. Dans le Cercle, chaque femme apprend à s'assumer pleinement telle qu'elle est." },
  { num:"02", titre:"Audace",        desc:"C'est le courage d'oser malgré la peur. On avance même quand on doute, on prend sa place sans attendre la permission." },
  { num:"03", titre:"Discipline",    desc:"C'est la constance dans l'action et la rigueur dans l'évolution. Chaque femme s'engage à rester alignée avec ses objectifs." },
  { num:"04", titre:"Élégance",      desc:"C'est l'art de se présenter, de parler et d'agir avec grâce. L'élégance ici est intérieure et extérieure." },
  { num:"05", titre:"Excellence",    desc:"C'est le refus de la médiocrité et le choix de toujours viser plus haut." },
  { num:"06", titre:"Solidarité",    desc:"C'est le soutien mutuel entre femmes du Cercle. On s'élève ensemble." },
  { num:"07", titre:"Responsabilité",desc:"C'est l'engagement de reprendre le contrôle de sa vie." },
];

const ABONNEMENTS = [
  {
    id:"elevation",
    badge:"Graine d'Élite",
    badgeColor:"rgba(194,24,91,.15)",
    badgeTextColor:"#e8799a",
    badgeBorder:"rgba(194,24,91,.3)",
    titre:"Élévation",
    prix:"45 000 FCFA",
    periode:"trimestre",
    star:false,
    inclus:[
      "1 masterclass par mois",
      "4 podcasts par mois",
      "Messages hebdomadaires + exercices",
      "1 challenge par mois",
      "Accès au groupe privé",
      "Replays",
    ],
    spirituel:[
      "Messages spirituels hebdomadaires",
      "Exercices d'introspection",
    ],
    paiement:[
      "25 000 FCFA à l'inscription",
      "20 000 FCFA après 3 semaines",
    ],
  },
  {
    id:"rayonnement",
    badge:"Étoile Ascendante",
    badgeColor:"rgba(201,169,106,.12)",
    badgeTextColor:"#E8D5A8",
    badgeBorder:"rgba(201,169,106,.35)",
    titre:"Rayonnement",
    prix:"75 000 FCFA",
    periode:"trimestre",
    star:true,
    inclus:[
      "Tout l'abonnement Élévation",
      "Coaching de groupe mensuel",
      "Ateliers pratiques",
      "Accompagnement projets",
      "Networking",
      "Mise en avant",
    ],
    spirituel:[
      "1 session spirituelle par mois",
      "Exercices guidés",
    ],
    paiement:[
      "25 000 FCFA à l'inscription",
      "25 000 FCFA après 3 semaines",
      "25 000 FCFA après 3 semaines (2e tranche)",
    ],
  },
  {
    id:"influence",
    badge:"Reine d'Impact",
    badgeColor:"rgba(10,10,10,.8)",
    badgeTextColor:"#C9A96A",
    badgeBorder:"rgba(201,169,106,.5)",
    titre:"Influence",
    prix:"120 000 FCFA",
    periode:"trimestre",
    star:false,
    inclus:[
      "Tout Élévation + Rayonnement",
      "2 coachings par mois",
      "Suivi personnalisé",
      "Accès prioritaire à la coach",
      "Analyse image & positionnement",
      "Accompagnement stratégique",
      "Opportunités exclusives",
      "Cercle élite",
    ],
    spirituel:[
      "2 sessions spirituelles par mois",
      "Travail profond sur identité & mission",
    ],
    paiement:[
      "50 000 FCFA à l'inscription",
      "50 000 FCFA après 1 mois",
      "20 000 FCFA après 2 semaines",
    ],
  },
];

const REGLES = [
  "Confidentialité absolue.",
  "Respect et bienveillance.",
  "Engagement actif.",
  "Zéro négativité toxique.",
  "Contribution et partage.",
  "Représentation de la marque Métamorphose.",
  "Respect des accès et abonnements.",
];

const FAQ = [
  {
    q:"Qui peut intégrer le Cercle Privé des Métamorphosés ?",
    r:"Le Cercle est exclusivement réservé aux femmes ayant participé au programme Métamorphose. C'est un espace de continuité conçu pour ancrer la transformation et favoriser une évolution durable.",
  },
  {
    q:"L'accès au Cercle est-il payant dès le début ?",
    r:"Non. L'accès au Cercle est entièrement gratuit pendant les 6 premiers mois après la fin du programme Métamorphose. Cette période permet de consolider la transformation et de vivre pleinement l'expérience du Cercle.",
  },
  {
    q:"Que se passe-t-il après les 6 mois gratuits ?",
    r:"Après les 6 mois, chaque femme est invitée à choisir un abonnement adapté à son niveau d'évolution et à ses objectifs. Elle est ensuite intégrée dans un groupe correspondant à son abonnement, tout en restant membre du Cercle global.",
  },
  {
    q:"Puis-je changer d'abonnement plus tard ?",
    r:"Oui. Les membres peuvent évoluer d'un abonnement à un autre à tout moment, selon leur croissance, leurs besoins et leurs objectifs.",
  },
  {
    q:"Que faire si je rencontre des difficultés de paiement ?",
    r:"En cas de difficulté de paiement, tu peux nous contacter directement via la page de contact du site ou WhatsApp. Nous t'accompagnerons afin de trouver la meilleure solution possible.",
  },
  {
    q:"Puis-je quitter le Cercle à tout moment ?",
    r:"Le Cercle Privé des Métamorphosés est un espace accessible à vie à toutes les femmes Métamorphosées, qu'elles soient abonnées ou non. Chaque membre peut ne pas renouveler son abonnement à la fin de la période, suspendre son abonnement après expiration, ou reprendre un abonnement à tout moment selon son évolution. Si une femme souhaite quitter définitivement le Cercle, elle en a également la liberté.",
  },
  {
    q:"Le Cercle est-il seulement un groupe WhatsApp ?",
    r:"Non. Le Cercle est un écosystème structuré de transformation comprenant des masterclass, des podcasts, des challenges, des ressources exclusives, des accompagnements et une communauté active. Ce n'est pas un simple groupe, mais un véritable espace d'évolution.",
  },
  {
    q:"Est-ce que je serai accompagnée personnellement ?",
    r:"L'accompagnement dépend de l'abonnement choisi. Plus le niveau est élevé, plus le suivi est rapproché, personnalisé et stratégique.",
  },
];

function FaqItem({ item }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="faq-item">
      <button className="faq-btn" onClick={() => setOpen(o => !o)}>
        <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.05rem", fontWeight:600, color:open?"#C9A96A":"#F8F5F2", transition:"color .3s", lineHeight:1.4 }}>
          {item.q}
        </span>
        <span style={{ width:"22px", height:"22px", border:`1px solid ${open?"rgba(201,169,106,.5)":"rgba(255,255,255,.12)"}`, borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, transition:"all .3s", background:open?"rgba(201,169,106,.08)":"transparent" }}>
          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={open?"#C9A96A":"rgba(248,245,242,.4)"} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ transform:open?"rotate(180deg)":"rotate(0)", transition:"transform .35s" }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </span>
      </button>
      <div className="faq-body" style={{ maxHeight:open?"400px":"0", opacity:open?1:0 }}>
        <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.6)", lineHeight:1.85, paddingBottom:"22px", paddingRight:"38px" }}>
          {item.r}
        </p>
      </div>
    </div>
  );
}


const WHATSAPP_COMMUNAUTE = "https://chat.whatsapp.com/K0yWRhfTnIzCTT3ilGoQw4?mode=gi_t";

function ModalAuth({ onClose, onSuccess }) {
  const [email, setEmail] = useState("");
  const [cle, setCle] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function valider(e) {
    e.preventDefault();
    if (!email.trim() || !cle.trim()) { setError("Tous les champs sont requis."); return; }
    setLoading(true); setError("");
    try {
      const res = await communauteAPI.verifierCle({ email: email.trim(), cle: cle.trim() });
      if (res.data.acces) { onSuccess(); }
      else { setError(res.data.detail || "Identifiants invalides."); }
    } catch { setError("Erreur réseau. Veuillez réessayer."); }
    setLoading(false);
  }

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.92)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", backdropFilter:"blur(8px)" }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background:"linear-gradient(135deg,#080808,#0D1020)", border:"1px solid rgba(201,169,106,.2)", borderRadius:"4px", maxWidth:"480px", width:"100%", padding:"48px 40px", position:"relative" }}>
        <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg,transparent,#C9A96A,transparent)" }}/>
        <div style={{ textAlign:"center", marginBottom:"40px" }}>
          <p style={{ fontFamily:"var(--ff-b)", fontSize:".55rem", letterSpacing:".35em", textTransform:"uppercase", color:"rgba(201,169,106,.45)", marginBottom:"14px" }}>Accès réservé</p>
          <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.4rem,3vw,1.9rem)", fontWeight:400, color:"#F8F5F2", marginBottom:"10px" }}>
            Cercle privé<br/><em style={{ fontStyle:"italic", fontWeight:300, color:"#C9A96A" }}>des Métamorphosées</em>
          </h2>
          <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".78rem", color:"rgba(248,245,242,.35)", lineHeight:1.7 }}>
            Votre clé d'accès vous a été transmise personnellement par Coach Prélia à la fin de votre programme.
          </p>
        </div>
        <form onSubmit={valider} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
          <div>
            <label style={{ fontFamily:"var(--ff-b)", fontSize:".58rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(248,245,242,.35)", display:"block", marginBottom:"8px" }}>Adresse email</label>
            <input className="form-input" type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="votre@email.com"/>
          </div>
          <div>
            <label style={{ fontFamily:"var(--ff-b)", fontSize:".58rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(248,245,242,.35)", display:"block", marginBottom:"8px" }}>Clé d'accès personnelle</label>
            <input className="form-input" value={cle} onChange={e=>setCle(e.target.value)} placeholder="Votre clé unique"/>
          </div>
          {error && <p style={{ background:"rgba(239,68,68,.07)", border:"1px solid rgba(239,68,68,.2)", borderRadius:"2px", padding:"10px 14px", fontFamily:"var(--ff-b)", fontSize:".75rem", color:"#f87171" }}>{error}</p>}
          <button type="submit" className="btn-rose" disabled={loading} style={{ width:"100%", padding:"15px", marginTop:"8px" }}>
            {loading ? "Vérification..." : "Accéder à la communauté"}
          </button>
        </form>
        <button onClick={onClose} style={{ display:"block", width:"100%", marginTop:"16px", padding:"10px", background:"none", border:"none", color:"rgba(248,245,242,.2)", fontFamily:"var(--ff-b)", fontSize:".68rem", letterSpacing:".1em", textTransform:"uppercase", cursor:"pointer" }}>Fermer</button>
      </div>
    </div>
  );
}

function MessageBienvenue({ onClose }) {
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.92)", zIndex:500, display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", backdropFilter:"blur(8px)" }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ maxWidth:"640px", width:"100%", maxHeight:"90vh", overflowY:"auto", padding:"24px" }}>
        <div style={{ background:"linear-gradient(135deg,#080808,#0D1020)", border:"1px solid rgba(201,169,106,.2)", borderRadius:"4px", padding:"48px 40px", position:"relative" }}>
          <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg,transparent,#C9A96A,transparent)" }}/>
          <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.3rem,3vw,1.8rem)", fontWeight:400, color:"#F8F5F2", marginBottom:"32px" }}>
            Bienvenue dans la communauté<br/><em style={{ fontStyle:"italic", fontWeight:300, color:"#C9A96A" }}>des Métamorphosées.</em>
          </h2>
          <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.6)", lineHeight:1.85, marginBottom:"24px" }}>
            Nous sommes heureuses de t'accueillir dans ce cercle privé, réservé aux femmes qui ont décidé de se choisir, de s'élever et de devenir une version plus confiante d'elles-mêmes.
          </p>
          <div style={{ borderTop:"1px solid rgba(201,169,106,.12)", paddingTop:"28px", marginTop:"8px" }}>
            <a href={WHATSAPP_COMMUNAUTE} target="_blank" rel="noreferrer" className="btn-or" style={{ display:"block", width:"100%", textAlign:"center", background:"#25D366", color:"#fff" }}>
              Intégrer la Communauté MMO
            </a>
          </div>
          <button onClick={onClose} style={{ display:"block", width:"100%", marginTop:"12px", padding:"10px", background:"none", border:"none", color:"rgba(248,245,242,.2)", fontFamily:"var(--ff-b)", fontSize:".68rem", letterSpacing:".1em", textTransform:"uppercase", cursor:"pointer" }}>Fermer</button>
        </div>
      </div>
    </div>
  );
}

export default function CommunautePortail() {
  useReveal();
  useScrollProgress();

  const [modal, setModal] = useState(null);
  function ouvrirAuth() { setModal("auth"); }
  function onAuthSuccess() { setModal("bienvenue"); }

  const abosRef = useRef(null);
  const formRef = useRef(null);

  const [payLinks, setPayLinks] = useState({});
  useEffect(() => {
    configAPI.public().then(res => {
      const map = {};
      if (Array.isArray(res.data)) res.data.forEach(i => { map[i.cle] = i.valeur; });
      setPayLinks(map);
    }).catch(() => {});
  }, []);

  const [showForm,  setShowForm]  = useState(false);
  const [aboId,     setAboId]     = useState("rayonnement");
  const [form,      setForm]      = useState({ nom:"", prenom:"", email:"", whatsapp:"" });
  const [step,      setStep]      = useState("form");
  const [token,     setToken]     = useState("");
  const [lienPaie,  setLienPaie]  = useState("");
  const [loading,   setLoading]   = useState(false);
  const [errForm,   setErrForm]   = useState("");

  function setF(k, v) { setForm(p => ({...p, [k]:v})); }

  function scrollToAbos() {
    abosRef.current?.scrollIntoView({ behavior:"smooth", block:"start" });
  }

  function ouvrirFormulaire(id = null) {
    if (id) setAboId(id);
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
      const lien = payLinks[`communaute_lien_${aboId}`] || payLinks["communaute_lien_paiement"] || "";
      setLienPaie(lien);
      setToken(`comm_${Date.now()}_${aboId}`);
      setStep("payer");
    } catch { setErrForm("Erreur réseau. Veuillez réessayer."); }
    setLoading(false);
  }

  const aboActif = ABONNEMENTS.find(a => a.id === aboId);

  return (
    <>
      <style>{STYLES}</style>
      {modal === "auth" && <ModalAuth onClose={() => setModal(null)} onSuccess={onAuthSuccess}/>}
      {modal === "bienvenue" && <MessageBienvenue onClose={() => setModal(null)}/>}
      <div className="grain-overlay"/>
      <div className="scroll-bar"/>

      <div style={{ background:"#060608", color:"#F8F5F2", minHeight:"100vh", position:"relative" }}>

        {/* NAV */}
        <nav style={{ padding:"20px 48px", borderBottom:"1px solid rgba(201,169,106,.08)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"rgba(6,6,8,.92)", backdropFilter:"blur(24px)", zIndex:100 }}>
          <Link to="/" style={{ textDecoration:"none" }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.05rem" }}>
              <span style={{color:"#F8F5F2"}}>Méta'</span>
              <span style={{color:"#C9A96A"}}>Morph'</span>
              <span style={{color:"#C2185B"}}>Ose</span>
            </span>
          </Link>
          <div style={{ display:"flex", gap:"20px", alignItems:"center" }}>
            <Link to="/" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".65rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(201,169,106,.4)", textDecoration:"none" }}>Accueil</Link>
            <button onClick={() => ouvrirFormulaire()} className="btn-rose" style={{ padding:"10px 22px", fontSize:".66rem" }}>Prendre mon abonnement</button>
          </div>
        </nav>

        {/* SECTION 1 : HERO */}
        <section style={{ background:"#060608", padding:"140px 48px 100px", textAlign:"center", position:"relative", overflow:"hidden", minHeight:"90vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
          <div style={{ position:"absolute", bottom:0, left:"50%", transform:"translateX(-50%)", width:"80%", height:"50%", background:"radial-gradient(ellipse 70% 60% at 50% 100%,rgba(194,24,91,.05),transparent)", pointerEvents:"none" }}/>
          <div style={{ position:"absolute", top:"30%", left:"50%", transform:"translateX(-50%)", width:"50%", height:"50%", background:"radial-gradient(ellipse 50% 40% at 50% 50%,rgba(201,169,106,.04),transparent)", pointerEvents:"none" }}/>

          <div style={{ position:"relative", maxWidth:"860px", margin:"0 auto" }}>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:200, fontSize:".56rem", letterSpacing:".5em", textTransform:"uppercase", color:"rgba(201,169,106,.45)", marginBottom:"24px", animation:"fadeUp .6s both" }}>
              Cercle Privé des Métamorphosés
            </p>
            <div className="ligne-anim" style={{ maxWidth:"100px", margin:"0 auto 40px" }}/>

            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2.2rem,5.5vw,4.2rem)", fontWeight:700, lineHeight:1.08, marginBottom:"28px", animation:"fadeUp .7s .15s both" }}>
              Bienvenue dans<br/>
              <em style={{ fontStyle:"italic", fontWeight:600, background:"linear-gradient(90deg,#C9A96A,#E8D5A8,#C9A96A,#f5ead6,#C9A96A)", backgroundSize:"300% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmer 5s linear infinite" }}>
                le Cercle Privé
              </em>
            </h1>

            <div style={{ display:"flex", justifyContent:"center", gap:"32px", marginBottom:"32px", animation:"fadeUp .7s .25s both", flexWrap:"wrap" }}>
              {["Un espace d'élévation","Une communauté de femmes transformées","Un cercle de leaders en devenir"].map((item, i) => (
                <div key={i} style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                  <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:"#C9A96A", flexShrink:0 }}/>
                  <span style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.55)" }}>{item}</span>
                </div>
              ))}
            </div>

            <div className="reveal citation" style={{ animation:"fadeUp .7s .35s both", marginBottom:"52px" }}>
              "Ici, ta transformation ne s'arrête pas. Elle s'ancre, elle s'élève et elle impacte. Tu n'es plus la même… maintenant, deviens celle qui marque le monde."
            </div>

            <div className="btns-flex" style={{ display:"flex", gap:"12px", flexWrap:"wrap", justifyContent:"center", animation:"fadeUp .7s .45s both" }}>
              <button onClick={ouvrirAuth} className="btn-rose">Rejoindre le Cercle Privé des Métamorphosés</button>
              <button onClick={scrollToAbos} className="btn-ghost">Prendre mon abonnement</button>
              <Link to="/programme" className="btn-ghost">Rejoindre le Programme Métamorphose</Link>
            </div>
          </div>
        </section>

        {/* SECTION 2 : QU'EST-CE QUE LE CERCLE ? */}
        <section style={{ background:"#0d0b10", padding:"100px 48px" }}>
          <div className="ligne-or-glow" style={{ maxWidth:"180px", margin:"0 auto 72px" }}/>
          <div style={{ maxWidth:"760px", margin:"0 auto", textAlign:"center" }}>
            <p className="reveal s-label" style={{ justifyContent:"center" }}>Qu'est-ce que le Cercle ?</p>
            <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.6rem,3.5vw,2.6rem)", fontWeight:600, lineHeight:1.2, marginBottom:"36px" }}>
              Un espace exclusif de continuité
            </h2>
            <div className="reveal" style={{ display:"flex", flexDirection:"column", gap:"18px" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".95rem", color:"rgba(248,245,242,.62)", lineHeight:1.9 }}>
                Le Cercle Privé des Métamorphosés est un espace exclusif réservé aux femmes ayant suivi le programme Métamorphose. C'est un environnement conçu pour : renforcer ta transformation, développer ta confiance, t'aider à t'affirmer, te rendre visible et impactante.
              </p>
              <div className="citation">
                Ici, tu ne marches plus seule. Tu évolues avec des femmes alignées, ambitieuses et engagées.
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3 : MISSION */}
        <section style={{ background:"#100a08", padding:"100px 48px" }}>
          <div style={{ maxWidth:"900px", margin:"0 auto" }}>
            <p className="reveal s-label">Notre mission</p>
            <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.5rem,3.5vw,2.2rem)", fontWeight:600, marginBottom:"48px" }}>
              Accompagner chaque femme à…
            </h2>
            <div className="reveal" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
              {["Consolider sa transformation","Développer son potentiel","S'affirmer avec audace","Devenir une femme leader et influente"].map((item, i) => (
                <div key={i} style={{ display:"flex", gap:"16px", alignItems:"flex-start", padding:"28px 24px", background:"rgba(255,255,255,.018)", border:"1px solid rgba(255,255,255,.055)" }}>
                  <div style={{ width:"32px", height:"32px", border:"1px solid rgba(201,169,106,.3)", borderRadius:"50%", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontFamily:"'Playfair Display',serif", fontSize:".78rem", color:"#C9A96A", fontWeight:600 }}>{String(i+1).padStart(2,"0")}</span>
                  </div>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.1rem", color:"rgba(248,245,242,.75)", lineHeight:1.6, paddingTop:"4px" }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 4 : VALEURS */}
        <section style={{ background:"#060608", padding:"100px 48px" }}>
          <div style={{ maxWidth:"1000px", margin:"0 auto" }}>
            <p className="reveal s-label">Nos valeurs</p>
            <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.5rem,3.5vw,2.2rem)", fontWeight:600, marginBottom:"52px" }}>
              Les piliers du Cercle
            </h2>
            <div className="valeurs-grid reveal" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"14px" }}>
              {VALEURS.map((v, i) => (
                <div key={v.num} className="valeur-card" style={{ transitionDelay:`${i*.07}s` }}>
                  <span className="valeur-num">{v.num}</span>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.05rem", fontWeight:600, color:"#C9A96A", marginBottom:"12px" }}>{v.titre}</h3>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".84rem", color:"rgba(248,245,242,.55)", lineHeight:1.8, position:"relative", zIndex:1 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 5 : CE QUE TU DEVIENS */}
        <section style={{ background:"#0d0b10", padding:"100px 48px", textAlign:"center" }}>
          <div style={{ maxWidth:"800px", margin:"0 auto" }}>
            <p className="reveal s-label" style={{ justifyContent:"center" }}>Ce que tu deviens ici</p>
            <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.5rem,3.5vw,2.2rem)", fontWeight:600, marginBottom:"48px" }}>
              Dans le Cercle, tu deviens…
            </h2>
            <div className="reveal" style={{ display:"flex", justifyContent:"center", gap:"14px", flexWrap:"wrap" }}>
              {["Une femme confiante","Une femme visible","Une femme impactante","Une femme libre du regard des autres","Une femme leader"].map((item, i) => (
                <div key={i} style={{ padding:"14px 28px", background:"rgba(201,169,106,.05)", border:"1px solid rgba(201,169,106,.15)", fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.05rem", color:"rgba(201,169,106,.8)" }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 6 : ACCÈS */}
        <section style={{ background:"#100a08", padding:"100px 48px" }}>
          <div style={{ maxWidth:"800px", margin:"0 auto" }}>
            <div className="reveal" style={{ padding:"52px 44px", background:"rgba(201,169,106,.03)", border:"1px solid rgba(201,169,106,.1)", position:"relative", textAlign:"center" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.35),transparent)" }}/>
              <p className="s-label" style={{ justifyContent:"center" }}>Accès au Cercle</p>
              <div style={{ display:"inline-flex", alignItems:"center", gap:"12px", padding:"14px 28px", background:"rgba(201,169,106,.08)", border:"1px solid rgba(201,169,106,.2)", marginBottom:"28px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#C9A96A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                <span style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:600, fontSize:".82rem", color:"#C9A96A", letterSpacing:".08em" }}>Accès GRATUIT pendant 6 mois</span>
              </div>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".92rem", color:"rgba(248,245,242,.55)", lineHeight:1.9, marginBottom:"24px" }}>
                Accès entièrement gratuit pendant 6 mois après le programme Métamorphose.
              </p>
              <div style={{ height:"1px", background:"linear-gradient(90deg,transparent,rgba(255,255,255,.08),transparent)", margin:"24px 0" }}/>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:200, fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"rgba(201,169,106,.45)", marginBottom:"14px" }}>Après les 6 mois</p>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".92rem", color:"rgba(248,245,242,.55)", lineHeight:1.9 }}>
                Tu choisis ton niveau d'accompagnement. Tu accèdes à des contenus et un suivi adaptés à ton évolution. Le Cercle principal reste actif pour toutes.
              </p>
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.35),transparent)" }}/>
            </div>
          </div>
        </section>

        {/* SECTION 7 : ABONNEMENTS */}
        <section ref={abosRef} style={{ background:"#060608", padding:"100px 48px" }}>
          <div style={{ maxWidth:"1060px", margin:"0 auto" }}>
            <p className="reveal s-label">Tarifs</p>
            <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.5rem,3.5vw,2.4rem)", fontWeight:600, marginBottom:"56px" }}>
              Choisissez votre abonnement
            </h2>
            <div className="abos-grid reveal" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"20px", alignItems:"start" }}>
              {ABONNEMENTS.map((abo, i) => (
                <div key={abo.id} className={`abo-card${abo.star?" star":""}`} style={{ transitionDelay:`${i*.1}s` }}>
                  {/* Badge */}
                  <div style={{ marginBottom:"20px" }}>
                    <span style={{ padding:"5px 14px", background:abo.badgeColor, border:`1px solid ${abo.badgeBorder}`, fontFamily:"'Montserrat',sans-serif", fontSize:".58rem", fontWeight:700, letterSpacing:".2em", textTransform:"uppercase", color:abo.badgeTextColor, display:"inline-block", animation:abo.star?"pulse 2.5s ease-in-out infinite":"none" }}>
                      {abo.badge}
                    </span>
                  </div>

                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.35rem", fontWeight:700, color:"#F8F5F2", marginBottom:"8px" }}>
                    Abonnement {abo.titre}
                  </h3>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.9rem", fontWeight:700, color:"#C9A96A", marginBottom:"6px" }}>{abo.prix}</p>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:200, fontSize:".65rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(248,245,242,.3)", marginBottom:"28px" }}>par {abo.periode}</p>

                  <div style={{ height:"1px", background:"linear-gradient(90deg,rgba(201,169,106,.2),transparent)", marginBottom:"22px" }}/>

                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:200, fontSize:".58rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(201,169,106,.45)", marginBottom:"14px" }}>Inclus</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"22px" }}>
                    {abo.inclus.map((item, j) => (
                      <div key={j} style={{ display:"flex", gap:"10px", alignItems:"flex-start" }}>
                        <CheckIcon/>
                        <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"rgba(248,245,242,.6)", fontWeight:300 }}>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ height:"1px", background:"linear-gradient(90deg,rgba(201,169,106,.15),transparent)", margin:"18px 0 16px" }}/>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:200, fontSize:".58rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(194,24,91,.45)", marginBottom:"12px" }}>Bonus spirituel</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"22px" }}>
                    {abo.spirituel.map((item, j) => (
                      <div key={j} className="abo-line">
                        <CheckIcon color="rgba(194,24,91,.6)"/>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>

                  <div style={{ height:"1px", background:"linear-gradient(90deg,rgba(255,255,255,.06),transparent)", margin:"18px 0 16px" }}/>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:200, fontSize:".58rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(248,245,242,.3)", marginBottom:"12px" }}>Paiement échelonné</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:"6px", marginBottom:"28px" }}>
                    {abo.paiement.map((item, j) => (
                      <p key={j} style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".8rem", color:"rgba(248,245,242,.45)", fontWeight:300 }}>
                        <span style={{ color:"#C9A96A", marginRight:"6px" }}>—</span>{item}
                      </p>
                    ))}
                  </div>

                  <button onClick={() => ouvrirFormulaire(abo.id)} className={abo.star ? "btn-or" : "btn-ghost"} style={{ width:"100%" }}>
                    Choisir cet abonnement
                  </button>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 8 : FONDATION */}
        <section style={{ background:"#0d0b10", padding:"100px 48px", textAlign:"center" }}>
          <div style={{ maxWidth:"700px", margin:"0 auto" }}>
            <div className="reveal" style={{ padding:"56px 44px", background:"rgba(255,255,255,.015)", border:"1px solid rgba(255,255,255,.055)", position:"relative" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.25),transparent)" }}/>
              <p className="s-label" style={{ justifyContent:"center" }}>Une vision plus grande</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:600, marginBottom:"20px" }}>
                La Fondation Métamorphose
              </h2>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".92rem", color:"rgba(248,245,242,.55)", lineHeight:1.9 }}>
                Une initiative portée par les femmes du Cercle pour impacter des vies, accompagner d'autres femmes, transformer des communautés.
              </p>
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.25),transparent)" }}/>
            </div>
          </div>
        </section>

        {/* SECTION 9 : APPEL FINAL */}
        <section style={{ background:"#100a08", padding:"120px 48px", textAlign:"center" }}>
          <div style={{ maxWidth:"800px", margin:"0 auto" }}>
            <div className="ligne-or" style={{ maxWidth:"100px", margin:"0 auto 56px" }}/>
            <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:700, lineHeight:1.1, marginBottom:"32px" }}>
              Tu as commencé ta transformation…
            </h2>
            <div className="reveal citation" style={{ marginBottom:"52px" }}>
              "Maintenant, élève-la."
            </div>
            <div className="reveal btns-flex" style={{ display:"flex", gap:"12px", flexWrap:"wrap", justifyContent:"center" }}>
              <button onClick={ouvrirAuth} className="btn-rose">Rejoindre le Cercle Privé des Métamorphosés</button>
              <button onClick={scrollToAbos} className="btn-ghost">Prendre mon abonnement</button>
            </div>
            <div className="ligne-or" style={{ maxWidth:"100px", margin:"56px auto 0" }}/>
          </div>
        </section>

        {/* SECTION 10 : RÈGLEMENT */}
        <section style={{ background:"#060608", padding:"100px 48px" }}>
          <div style={{ maxWidth:"700px", margin:"0 auto" }}>
            <p className="reveal s-label">Règlement intérieur</p>
            <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:600, marginBottom:"44px" }}>
              Nos engagements communs
            </h2>
            <div className="reveal" style={{ background:"rgba(255,255,255,.018)", border:"1px solid rgba(255,255,255,.055)", padding:"36px 36px" }}>
              {REGLES.map((regle, i) => (
                <div key={i} className="regle-item">
                  <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:700, color:"rgba(201,169,106,.4)", flexShrink:0, minWidth:"32px" }}>
                    {String(i+1).padStart(2,"0")}
                  </span>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.65)", lineHeight:1.7 }}>{regle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 11 : FAQ */}
        <section style={{ background:"#0d0b10", padding:"100px 48px" }}>
          <div style={{ maxWidth:"760px", margin:"0 auto" }}>
            <p className="reveal s-label">Questions fréquentes</p>
            <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:600, marginBottom:"52px" }}>FAQ du Cercle Privé</h2>
            <div className="reveal">
              {FAQ.map((item, i) => <FaqItem key={i} item={item}/>)}
            </div>
            {/* Message de clôture */}
            <div className="reveal" style={{ marginTop:"48px", padding:"36px 32px", background:"rgba(201,169,106,.03)", border:"1px solid rgba(201,169,106,.1)", textAlign:"center" }}>
              <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.05rem", fontWeight:600, marginBottom:"14px" }}>Tu as encore des questions ?</p>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.5)", lineHeight:1.8, marginBottom:"20px" }}>
                Notre équipe est disponible pour t'accompagner à chaque étape de ton parcours dans le Cercle Métamorphose.
              </p>
              <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
                <Link to="/contact" className="btn-ghost" style={{ fontSize:".68rem" }}>Page de contact</Link>
                <a href="https://wa.me/22901961140" target="_blank" rel="noreferrer" className="btn-ghost" style={{ fontSize:".68rem" }}>WhatsApp</a>
              </div>
            </div>
          </div>
        </section>

        {/* FORMULAIRE D'ABONNEMENT */}
        {showForm && (
          <section ref={formRef} style={{ background:"#060608", padding:"80px 48px" }}>
            <div style={{ maxWidth:"620px", margin:"0 auto", background:"rgba(255,255,255,.025)", border:"1px solid rgba(201,169,106,.14)", padding:"56px 48px", position:"relative" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg,transparent,#C9A96A,transparent)" }}/>

              {step === "form" && (
                <>
                  <p className="s-label">Abonnement</p>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.8rem", fontWeight:600, marginBottom:"8px" }}>Rejoindre le Cercle</h3>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.4)", marginBottom:"36px" }}>Remplissez le formulaire, puis procédez au paiement.</p>

                  {/* Sélecteur abonnement */}
                  <div style={{ marginBottom:"28px" }}>
                    <label className="form-label">Votre abonnement *</label>
                    <div style={{ display:"flex", gap:"8px", flexWrap:"wrap" }}>
                      {ABONNEMENTS.map(a => (
                        <button key={a.id} type="button"
                          onClick={() => setAboId(a.id)}
                          style={{ flex:1, padding:"13px 10px", borderRadius:"1px", cursor:"pointer", fontFamily:"'Montserrat',sans-serif", fontSize:".66rem", fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", transition:"all .25s", border:`1px solid ${aboId===a.id?"#C9A96A":"rgba(255,255,255,.07)"}`, background:aboId===a.id?"rgba(201,169,106,.07)":"transparent", color:aboId===a.id?"#C9A96A":"rgba(248,245,242,.4)", textAlign:"center", lineHeight:1.5 }}>
                          {a.titre}<br/><span style={{ fontSize:".6rem", fontWeight:300, opacity:.65 }}>{a.prix}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <form onSubmit={soumettre} noValidate>
                    <div className="form-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"14px" }}>
                      <div><label className="form-label">Nom *</label><input className="form-input" type="text" placeholder="Votre nom" value={form.nom} onChange={e=>setF("nom",e.target.value)}/></div>
                      <div><label className="form-label">Prénom *</label><input className="form-input" type="text" placeholder="Votre prénom" value={form.prenom} onChange={e=>setF("prenom",e.target.value)}/></div>
                    </div>
                    <div style={{ marginBottom:"14px" }}><label className="form-label">Adresse e-mail *</label><input className="form-input" type="email" placeholder="votre@email.com" value={form.email} onChange={e=>setF("email",e.target.value)}/></div>
                    <div style={{ marginBottom:"32px" }}><label className="form-label">Téléphone WhatsApp *</label><input className="form-input" type="tel" placeholder="+229 01 00 00 00" value={form.whatsapp} onChange={e=>setF("whatsapp",e.target.value)}/></div>

                    {errForm && (
                      <div style={{ padding:"12px 16px", background:"rgba(194,24,91,.08)", border:"1px solid rgba(194,24,91,.2)", marginBottom:"16px", fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"#C2185B" }}>{errForm}</div>
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
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", marginBottom:"36px" }}>
                    <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#4CAF50" }}/>
                    <div style={{ height:"1px", width:"48px", background:"rgba(201,169,106,.35)" }}/>
                    <div style={{ width:"10px", height:"10px", borderRadius:"50%", background:"#C9A96A", boxShadow:"0 0 12px rgba(201,169,106,.5)" }}/>
                    <div style={{ height:"1px", width:"48px", background:"rgba(255,255,255,.1)" }}/>
                    <div style={{ width:"8px", height:"8px", borderRadius:"50%", background:"rgba(255,255,255,.2)" }}/>
                  </div>

                  <p className="s-label" style={{ justifyContent:"center" }}>Étape 2 — Paiement</p>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.6rem", fontWeight:600, marginBottom:"8px" }}>Finalisez votre abonnement</h3>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.45)", marginBottom:"32px" }}>
                    Abonnement {aboActif?.titre} — <strong style={{ color:"#C9A96A", fontWeight:600 }}>{aboActif?.prix}</strong>
                  </p>

                  <div style={{ background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.06)", padding:"18px 22px", marginBottom:"28px", textAlign:"left" }}>
                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:200, fontSize:".58rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(248,245,242,.3)", marginBottom:"12px" }}>Récapitulatif</p>
                    <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", fontWeight:600 }}>{form.prenom} {form.nom}</p>
                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".84rem", color:"rgba(248,245,242,.45)", fontWeight:300 }}>{form.email}</p>
                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".84rem", color:"rgba(248,245,242,.45)", fontWeight:300 }}>{form.whatsapp}</p>
                    <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", color:"#C9A96A", marginTop:"12px", fontWeight:600 }}>{aboActif?.prix}</p>
                    {aboActif?.paiement && (
                      <div style={{ marginTop:"12px", display:"flex", flexDirection:"column", gap:"4px" }}>
                        {aboActif.paiement.map((p, i) => (
                          <p key={i} style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".78rem", color:"rgba(248,245,242,.35)", fontWeight:300 }}>
                            <span style={{ color:"rgba(201,169,106,.5)", marginRight:"6px" }}>—</span>{p}
                          </p>
                        ))}
                      </div>
                    )}
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

                  <button onClick={() => { setStep("done"); }} style={{ width:"100%", padding:"15px", background:"rgba(76,175,80,.07)", color:"#4CAF50", border:"1px solid rgba(76,175,80,.22)", fontFamily:"'Montserrat',sans-serif", fontWeight:600, fontSize:".7rem", letterSpacing:".14em", textTransform:"uppercase", cursor:"pointer" }}>
                    J'ai effectué mon paiement
                  </button>
                </div>
              )}

              {step === "done" && (
                <div style={{ textAlign:"center" }}>
                  <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:"rgba(201,169,106,.08)", border:"1px solid rgba(201,169,106,.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px" }}>
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A96A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:200, fontSize:".58rem", letterSpacing:".38em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", marginBottom:"12px" }}>Demande reçue</p>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.6rem", fontWeight:600, marginBottom:"16px" }}>
                    Merci, {form.prenom}.<br/>
                    <em style={{ fontStyle:"italic", fontWeight:400, color:"#C9A96A" }}>Bienvenue dans le Cercle.</em>
                  </h3>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.5)", lineHeight:1.8 }}>
                    Prélia APEDO AHONON vous contactera sous 24 à 48h pour confirmer votre accès.
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
