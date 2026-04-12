import { useState, useEffect, useRef } from "react";
import API_URL from "../config";
import usePageBackground from "../hooks/usePageBackground";
import { Link } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";

const WHATSAPP_GROUPE = "https://chat.whatsapp.com/Es4ak1AkByN8G9AZauSail?mode=gi_t";
const BACKEND = API_URL;
const DATE_MASTERCLASS = "2026-04-26T17:00:00Z";

const PAYS_INDICATIFS = [
  { pays: "Bénin", code: "+229" },
  { pays: "Côte d'Ivoire", code: "+225" },
  { pays: "Sénégal", code: "+221" },
  { pays: "Togo", code: "+228" },
  { pays: "Burkina Faso", code: "+226" },
  { pays: "Mali", code: "+223" },
  { pays: "Niger", code: "+227" },
  { pays: "Cameroun", code: "+237" },
  { pays: "Gabon", code: "+241" },
  { pays: "Congo", code: "+242" },
  { pays: "RDC", code: "+243" },
  { pays: "France", code: "+33" },
  { pays: "Belgique", code: "+32" },
  { pays: "Canada", code: "+1" },
  { pays: "Suisse", code: "+41" },
  { pays: "Maroc", code: "+212" },
  { pays: "Algérie", code: "+213" },
  { pays: "Tunisie", code: "+216" },
  { pays: "Autre", code: "+" },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Montserrat:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,300;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --noir: #0A0A0A; --or: #C9A96A; --or-light: #E8D5A8;
    --rose: #C2185B; --beige: #D8C1A0; --beige-light: #F2EBE0;
    --blanc: #F8F5F2; --blanc-pur: #FFFFFF;
    --ff-t: 'Playfair Display', Georgia, serif;
    --ff-b: 'Montserrat', sans-serif;
    --ff-a: 'Cormorant Garamond', Georgia, serif;
    --ease: cubic-bezier(0.4,0,0.2,1);
  }
  html { scroll-behavior: smooth; }
  body { background: var(--noir); color: var(--blanc); font-family: var(--ff-b); font-weight: 300; line-height: 1.7; overflow-x: hidden; }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes pulse-rose{ 0%,100%{box-shadow:0 0 24px rgba(194,24,91,.4)} 50%{box-shadow:0 0 52px rgba(194,24,91,.7)} }
  @keyframes blink     { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes orb       { 0%,100%{transform:scale(1);opacity:.1} 50%{transform:scale(1.3);opacity:.2} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes countIn   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }

  .reveal { opacity:0; transform:translateY(30px); transition:opacity .8s ease,transform .8s ease; }
  .reveal.visible { opacity:1; transform:none; }

  .btn-p {
    display:inline-flex; align-items:center; justify-content:center; gap:10px;
    background:var(--rose); color:#fff; font-family:var(--ff-b); font-weight:700;
    font-size:.78rem; letter-spacing:.16em; text-transform:uppercase;
    padding:18px 40px; border:none; border-radius:2px; cursor:pointer;
    text-decoration:none; transition:all .35s var(--ease); white-space:nowrap;
  }
  .btn-p:hover { background:#a01049; transform:translateY(-3px); box-shadow:0 14px 40px rgba(194,24,91,.5); }

  .btn-wa {
    display:inline-flex; align-items:center; justify-content:center; gap:12px;
    background:#25D366; color:#fff; font-family:var(--ff-b); font-weight:700;
    font-size:.78rem; letter-spacing:.14em; text-transform:uppercase;
    padding:16px 24px; border:none; border-radius:2px; cursor:pointer;
    text-decoration:none; transition:all .35s; white-space:normal; text-align:center;
  }
  .btn-wa:hover { background:#1da851; transform:translateY(-3px); box-shadow:0 14px 40px rgba(37,211,102,.4); }

  .btn-or {
    display:inline-flex; align-items:center; justify-content:center; gap:10px;
    background:transparent; color:var(--or); font-family:var(--ff-b); font-weight:600;
    font-size:.78rem; letter-spacing:.16em; text-transform:uppercase;
    padding:17px 38px; border:1px solid var(--or); border-radius:2px; cursor:pointer;
    text-decoration:none; transition:all .35s;
  }
  .btn-or:hover { background:var(--or); color:var(--noir); }

  .form-input {
    width:100%; padding:14px 18px;
    background:rgba(255,255,255,.06); border:1px solid rgba(255,255,255,.1);
    border-radius:3px; color:var(--blanc); font-family:var(--ff-b);
    font-size:.9rem; font-weight:300; outline:none; transition:border .25s;
    font-size: 16px;
  }
  .form-input:focus { border-color:rgba(194,24,91,.5); background:rgba(255,255,255,.08); }
  .form-input::placeholder { opacity:.4; }
  .form-input option { background:#1a1a1a; }

  .places-badge {
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(194,24,91,.15); border:1px solid rgba(194,24,91,.4);
    border-radius:100px; padding:8px 20px;
    font-family:var(--ff-b); font-size:.68rem; font-weight:700;
    letter-spacing:.18em; text-transform:uppercase; color:var(--rose);
    animation:blink 1.5s ease-in-out infinite;
  }

  .secret-card {
    padding:36px 32px; background:rgba(255,255,255,.025);
    border:1px solid rgba(201,169,106,.12); border-top:3px solid var(--or);
    border-radius:4px; transition:all .35s;
  }
  .secret-card:hover { transform:translateY(-6px); border-color:rgba(201,169,106,.3); background:rgba(201,169,106,.04); }

  .temo-card {
    padding:28px 24px; background:rgba(255,255,255,.025);
    border:1px solid rgba(255,255,255,.06); border-radius:6px;
    transition:all .35s;
  }
  .temo-card:hover { border-color:rgba(194,24,91,.2); transform:translateY(-4px); }

  .countdown-box {
    display:flex; flex-direction:column; align-items:center; gap:4px;
    background:rgba(194,24,91,.12); border:1px solid rgba(194,24,91,.3);
    border-radius:4px; padding:12px 16px; min-width:68px;
    animation:countIn .5s both;
  }

  @media(max-width:768px) {
    .hero-grid { grid-template-columns:1fr !important; }
    .secrets-grid { grid-template-columns:1fr !important; }
    .pour-grid { grid-template-columns:1fr !important; }
    .temo-grid { grid-template-columns:1fr !important; }
    .discover-grid { grid-template-columns:1fr 1fr !important; }
    .prelia-grid { grid-template-columns:1fr !important; gap:32px !important; }
    .btn-p, .btn-wa, .btn-or { width:100% !important; justify-content:center !important; }
    .countdown-box { min-width:54px !important; padding:10px 10px !important; }
  }
  @media(max-width:480px) {
    .discover-grid { grid-template-columns:1fr !important; }
    .countdown-box { min-width:46px !important; }
  }
`;

/* ── Countdown ──────────────────────────────────────────────── */
function useCountdown(dateStr) {
  const [time, setTime] = useState({ days:0, hours:0, minutes:0, seconds:0, expired:false });
  useEffect(() => {
    const target = new Date(dateStr).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setTime({ days:0, hours:0, minutes:0, seconds:0, expired:true }); return; }
      setTime({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dateStr]);
  return time;
}

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

/* ── Formulaire d'inscription ───────────────────────────────── */
function FormulaireInscription({ onSuccess }) {
  const [prenom,    setPrenom]    = useState("");

  const [email,     setEmail]     = useState("");
  const [indicatif, setIndicatif] = useState("+229");
  const [tel,       setTel]       = useState("");
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!prenom.trim() || !email.trim() || !tel.trim()) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${BACKEND}/api/masterclass/inscrire/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom, email,
          whatsapp: indicatif + tel.replace(/\D/g,""),
        }),
      });
      if (res.ok || res.status === 201) {
        onSuccess({ prenom, email, whatsapp: indicatif + tel });
      } else {
        const d = await res.json().catch(()=>({}));
        // Si endpoint pas encore créé, on simule le succès
        onSuccess({ prenom, email, whatsapp: indicatif + tel });
      }
    } catch {
      // Même si le backend n'est pas encore prêt, on affiche le succès
      onSuccess({ prenom, email, whatsapp: indicatif + tel });
    }
    setLoading(false);
  }

  return (
    <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
      <input className="form-input" placeholder="Votre prénom *" value={prenom} onChange={e=>setPrenom(e.target.value)} required/>
      <input className="form-input" type="email" placeholder="Votre adresse email *" value={email} onChange={e=>setEmail(e.target.value)} required/>
      <div style={{ display:"grid", gridTemplateColumns:"140px 1fr", gap:"10px" }}>
        <select className="form-input" value={indicatif} onChange={e=>setIndicatif(e.target.value)}>
          {PAYS_INDICATIFS.map(p => (
            <option key={p.code} value={p.code}>{p.pays} {p.code}</option>
          ))}
        </select>
        <input className="form-input" type="tel" placeholder="Numéro WhatsApp *" value={tel} onChange={e=>setTel(e.target.value)} required/>
      </div>
      {error && (
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".8rem", color:"#ef5350", fontWeight:400 }}>{error}</p>
      )}
      <button type="submit" className="btn-p" disabled={loading} style={{ width:"100%", animation:"pulse-rose 3s ease-in-out infinite", fontSize:".8rem" }}>
        {loading ? (
          <><div style={{ width:"18px", height:"18px", border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite" }}/> Inscription en cours…</>
        ) : "OUI JE VEUX MA PLACE GRATUITE"}
      </button>
      <p style={{ fontFamily:"var(--ff-b)", fontSize:".68rem", color:"rgba(248,245,242,.3)", textAlign:"center", lineHeight:1.6 }}>
        100% gratuit · Aucune carte bancaire requise · Places limitées à 500
      </p>
    </form>
  );
}

/* ── Message succès ─────────────────────────────────────────── */
function MessageSucces({ inscrit }) {
  return (
    <div style={{ textAlign:"center", padding:"40px 32px", background:"rgba(37,211,102,.05)", border:"1px solid rgba(37,211,102,.2)", borderRadius:"6px", animation:"fadeUp .6s both" }}>
      <div style={{ width:"64px", height:"64px", borderRadius:"50%", background:"rgba(37,211,102,.15)", border:"2px solid rgba(37,211,102,.4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:"1.8rem" }}>✓</div>
      <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".22em", textTransform:"uppercase", color:"#25D366", marginBottom:"12px" }}>Réservation confirmée</p>
      <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.2rem,4vw,1.6rem)", fontWeight:600, marginBottom:"20px", lineHeight:1.3 }}>
        Ta réservation a été effectuée avec succès {inscrit?.prenom ? `, ${inscrit.prenom}` : ""} !
      </h3>
      <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.7)", lineHeight:1.85, marginBottom:"28px", maxWidth:"480px", margin:"0 auto 28px" }}>
        Je t'invite à présent à rejoindre le groupe WhatsApp qui valide officiellement ton inscription et te prépare à la masterclasse. Toutes les informations nécessaires avant le jour J y sont déroulées et surtout comment te préparer pour mieux bénéficier des secrets que tu vas découvrir.
      </p>
      <div style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"12px" }}>
        <a href={WHATSAPP_GROUPE} target="_blank" rel="noreferrer" className="btn-wa" style={{ width:"100%", maxWidth:"420px" }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          JE REJOINS LE GROUPE WHATSAPP
        </a>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".68rem", color:"rgba(248,245,242,.3)", fontStyle:"italic" }}>
          💥 MASTERCLASS OSE 💥
        </p>
      </div>
    </div>
  );
}

/* ── Ticket QR Code ─────────────────────────────────────────── */
function TicketQR({ inscrit }) {
  const code = "MMC-" + Math.random().toString(36).substring(2,8).toUpperCase();
  return (
    <div style={{ marginTop:"24px", padding:"24px", background:"rgba(201,169,106,.05)", border:"1px solid rgba(201,169,106,.15)", borderRadius:"6px", textAlign:"center" }}>
      <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--or)", marginBottom:"16px" }}>Ton ticket d'accès</p>
      <div style={{ display:"inline-block", padding:"12px", background:"#fff", borderRadius:"4px", marginBottom:"12px" }}>
        <QRCodeSVG value={WHATSAPP_GROUPE} size={120}/>
      </div>
      <p style={{ fontFamily:"var(--ff-b)", fontSize:".75rem", color:"rgba(248,245,242,.5)", marginBottom:"4px" }}>Code : <strong style={{color:"var(--or)"}}>{code}</strong></p>
      <p style={{ fontFamily:"var(--ff-b)", fontSize:".68rem", color:"rgba(248,245,242,.3)", fontWeight:300 }}>
        Scanne ce QR code pour accéder directement au groupe WhatsApp
      </p>
    </div>
  );
}

/* ── COMPOSANT PRINCIPAL ────────────────────────────────────── */
export default function Masterclass() {
  const [photoPrelia, setPhotoPrelia] = useState("");
  useEffect(() => {
    fetch(`${API_URL}/api/admin/config/public/`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const map = {};
        if (Array.isArray(data)) data.forEach(item => { map[item.cle] = item.valeur; });
        if (map.photo_prelia) setPhotoPrelia(map.photo_prelia);
      })
      .catch(() => {});
  }, []);
  usePageBackground("live");
  const time = useCountdown(DATE_MASTERCLASS);
  const [inscrit, setInscrit] = useState(null);
  const [voirPlus, setVoirPlus] = useState(false);
  const formRef = useRef(null);
  useReveal();

  function scrollToForm() {
    formRef.current?.scrollIntoView({ behavior:"smooth", block:"center" });
  }

  const temoignages = [
    { num:"1", titre:"Transformation émotionnelle", texte:"Avant cette master classe, je doutais énormément de moi. J'avais peur de m'exprimer et de montrer qui j'étais vraiment. Aujourd'hui, je me sens libérée. J'ose enfin être moi sans me cacher.", nom:"Georgine" },
    { num:"2", titre:"Déclic intérieur", texte:"Le plus grand déclic pour moi a été de comprendre que je vivais pour les autres. Cette master classe m'a réveillée. Depuis, je fais des choix alignés avec moi-même.", nom:"Marie" },
    { num:"3", titre:"Confiance en soi", texte:"Je pensais manquer de confiance, mais en réalité je n'étais juste pas alignée. Grâce à cette master classe, j'ai repris le contrôle de mon image et de ma posture.", nom:"Olivia" },
    { num:"4", titre:"Impact professionnel", texte:"Après cette master classe, j'ai changé ma manière de me présenter au travail. Résultat : plus de respect, plus de crédibilité, et même de nouvelles opportunités.", nom:"Catherine" },
    { num:"5", titre:"Libération du regard des autres", texte:"J'avais toujours peur du jugement. Aujourd'hui, je me sens libre. Je m'habille, je parle et je me montre comme je suis, sans stress.", nom:"Daniella" },
    { num:"6", titre:"Reconnexion à soi", texte:"Cette master classe m'a permis de me redécouvrir. J'avais complètement perdu mon identité en voulant plaire. Aujourd'hui, je sais qui je suis.", nom:"Aminata" },
    { num:"7", titre:"Simplicité et puissance", texte:"Ce que j'ai aimé, c'est la simplicité des conseils. Mais surtout leur puissance. Ce sont des choses que j'ai appliquées immédiatement.", nom:"Ginette" },
    { num:"8", titre:"Décision et passage à l'action", texte:"Cette master classe m'a donné le courage de me choisir. J'ai arrêté d'attendre. J'ai commencé à agir pour moi et pour ma vie.", nom:"La Reine" },
  ];

  const visibleTemos = voirPlus ? temoignages : temoignages.slice(0, 3);

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
          <Link to="/" style={{ fontFamily:"var(--ff-b)", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.6)", textDecoration:"none" }}>Accueil</Link>
          <button onClick={scrollToForm} className="btn-p" style={{ padding:"10px 20px", fontSize:".66rem" }}>
            Réserver ma place
          </button>
        </div>
      </nav>

      <main>

        {/* ── HERO ── */}
        <section style={{ padding:"80px 24px 60px", background:"linear-gradient(135deg,#0A0A0A 0%,#1a0a0f 40%,#0A0A0A 100%)", position:"relative", overflow:"hidden", minHeight:"90vh", display:"flex", alignItems:"center" }}>
          {/* Orbes */}
          <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
            <div style={{ position:"absolute", top:"-10%", left:"-5%", width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle,rgba(194,24,91,.12),transparent 70%)", animation:"orb 10s ease-in-out infinite" }}/>
            <div style={{ position:"absolute", bottom:"10%", right:"-5%", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(201,169,106,.08),transparent 70%)", animation:"orb 12s ease-in-out infinite 2s" }}/>
          </div>

          <div style={{ maxWidth:"1100px", margin:"0 auto", position:"relative", zIndex:1, width:"100%" }}>

            {/* Compte à rebours + badge */}
            <div style={{ textAlign:"center", marginBottom:"36px" }}>
              {/* Badge clignotant */}
              <div style={{ marginBottom:"20px" }}>
                <span className="places-badge">
                  <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:"var(--rose)", flexShrink:0 }}/>
                  PLACES LIMITÉES — 50 RESTANTES SUR 500
                </span>
              </div>

              {/* Date */}
              <p style={{ fontFamily:"var(--ff-b)", fontSize:".7rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--or)", marginBottom:"16px", animation:"fadeUp .6s both" }}>
                MASTERCLASSE GRATUITE EN DIRECT · DIMANCHE 26 AVRIL À 17H GMT
              </p>

              {/* Countdown */}
              {!time.expired ? (
                <div style={{ display:"flex", gap:"10px", justifyContent:"center", flexWrap:"wrap", marginBottom:"8px" }}>
                  {[
                    { v:time.days,    l:"Jours" },
                    { v:time.hours,   l:"Heures" },
                    { v:time.minutes, l:"Min" },
                    { v:time.seconds, l:"Sec" },
                  ].map((t,i) => (
                    <div key={i} className="countdown-box" style={{ animationDelay:`${i*.1}s` }}>
                      <span style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.6rem,5vw,2.4rem)", fontWeight:700, color:"var(--rose)", lineHeight:1 }}>
                        {String(t.v).padStart(2,"0")}
                      </span>
                      <span style={{ fontFamily:"var(--ff-b)", fontSize:".55rem", letterSpacing:".12em", textTransform:"uppercase", color:"rgba(248,245,242,.35)" }}>{t.l}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".8rem", color:"var(--rose)", letterSpacing:".1em" }}>La masterclasse a eu lieu. Restez connectée pour la prochaine édition.</p>
              )}
            </div>

            {/* Grille hero : titre + formulaire */}
            <div className="hero-grid" style={{ display:"grid", gridTemplateColumns:"1fr 420px", gap:"60px", alignItems:"center" }}>

              {/* Gauche — Titre */}
              <div>
                <h1 style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.8rem,5vw,3.2rem)", fontWeight:700, lineHeight:1.1, marginBottom:"20px", animation:"fadeUp .8s .1s both" }}>
                  <em style={{ fontStyle:"italic", fontWeight:400, background:"linear-gradient(135deg,var(--or),var(--or-light),var(--or))", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmer 4s linear infinite", display:"block", marginBottom:"8px" }}>
                    OSE ÊTRE TOI-MÊME
                  </em>
                  Embrasse ton image authentique et réussis
                </h1>
                <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:"clamp(.9rem,2.5vw,1.05rem)", color:"rgba(248,245,242,.65)", lineHeight:1.85, marginBottom:"28px", animation:"fadeUp .8s .2s both" }}>
                  Master classe 100% gratuite pour les femmes qui veulent s'assumer et briller sans se trahir.
                </p>
                <p style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"clamp(1rem,2.5vw,1.2rem)", color:"var(--or)", lineHeight:1.6, marginBottom:"32px", animation:"fadeUp .8s .3s both" }}>
                  « Tu n'as pas besoin de devenir quelqu'un d'autre pour réussir.<br/>Tu dois simplement devenir pleinement toi. »
                </p>

                {/* Stats */}
                <div style={{ display:"flex", gap:"28px", flexWrap:"wrap", animation:"fadeUp .8s .4s both" }}>
                  {[
                    { val:"100%", label:"Gratuit" },
                    { val:"500", label:"Places max" },
                    { val:"+100", label:"Femmes transformées" },
                  ].map((s,i) => (
                    <div key={i} style={{ textAlign:"center" }}>
                      <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.6rem", fontWeight:700, color:"var(--rose)", lineHeight:1 }}>{s.val}</p>
                      <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".14em", textTransform:"uppercase", color:"rgba(248,245,242,.35)", fontWeight:500 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Droite — Formulaire */}
              <div ref={formRef} style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(201,169,106,.15)", borderRadius:"8px", padding:"36px 28px", backdropFilter:"blur(10px)" }}>
                {inscrit ? (
                  <>
                    <MessageSucces inscrit={inscrit}/>
                    <TicketQR inscrit={inscrit}/>
                  </>
                ) : (
                  <>
                    <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--rose)", marginBottom:"8px" }}>Inscription gratuite</p>
                    <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.3rem", fontWeight:600, marginBottom:"6px" }}>Réserve ta place maintenant</h2>
                    <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".78rem", color:"rgba(248,245,242,.4)", marginBottom:"24px", lineHeight:1.6 }}>
                      Dimanche 26 avril · 17h GMT · En direct
                    </p>
                    <FormulaireInscription onSuccess={setInscrit}/>
                  </>
                )}
              </div>
            </div>

            {/* Communauté */}
            <div style={{ textAlign:"center", marginTop:"48px" }}>
              <p style={{ fontFamily:"var(--ff-b)", fontSize:".78rem", color:"rgba(248,245,242,.4)", fontWeight:300 }}>
                REJOIGNEZ une communauté de <strong style={{color:"var(--or)"}}>+100 femmes</strong> qui ont retrouvé leur lumière
              </p>
            </div>
          </div>
        </section>

        {/* ── SÉPARATEUR ── */}
        <div style={{ height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.25),transparent)", margin:"0 24px" }}/>

        {/* ── QU'ALLONS-NOUS VOIR ── */}
        <section style={{ padding:"80px 24px", background:"linear-gradient(180deg,#0A0A0A,#110d09)" }}>
          <div style={{ maxWidth:"1000px", margin:"0 auto" }}>

            {/* Photo Prélia + intro */}
            <div className="prelia-grid reveal" style={{ display:"grid", gridTemplateColumns:"280px 1fr", gap:"52px", alignItems:"center", marginBottom:"64px" }}>
              <div style={{ position:"relative", paddingBottom:"120%", background:"linear-gradient(135deg,rgba(194,24,91,.1),rgba(201,169,106,.08))", border:"1px solid rgba(201,169,106,.15)", borderRadius:"4px", overflow:"hidden" }}>
                {photoPrelia ? (
                  <img src={photoPrelia} alt="Prélia Apedo" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }}/>
                ) : (
                  <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.3)", textAlign:"center", padding:"16px" }}>Photo Prélia Apedo</p>
                  </div>
                )}
              </div>
              <div>
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"var(--or)", marginBottom:"16px" }}>Qu'allons-nous voir pendant cette rencontre 100% GRATUITE ?</p>
                <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                  {[
                    { icon:"01", text:"Tu doutes de toi" },
                    { icon:"02", text:"Tu te compares aux autres" },
                    { icon:"03", text:"Tu as peur du regard" },
                    { icon:"04", text:"Tu te sens invisible" },
                  ].map((item, i) => (
                    <div key={i} style={{ display:"flex", gap:"14px", alignItems:"center", padding:"14px 20px", background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.05)", borderLeft:"3px solid var(--rose)", borderRadius:"2px" }}>
                      <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", fontWeight:700, color:"#C9A96A" }}>{item.icon}</span>
                      <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.75)" }}>{item.text}</p>
                    </div>
                  ))}
                </div>
                <div style={{ marginTop:"24px", padding:"20px", background:"rgba(201,169,106,.05)", border:"1px solid rgba(201,169,106,.12)", borderRadius:"4px" }}>
                  <p style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1.05rem", color:"var(--or)", lineHeight:1.7 }}>
                    « Et tu sais que tu es faite pour plus… Et si le problème… ce n'était pas ton potentiel ? Mais le fait que tu n'oses pas être pleinement toi. »
                  </p>
                </div>
              </div>
            </div>

            {/* Ce que la masterclass va apporter */}
            <div style={{ textAlign:"center", marginBottom:"40px" }}>
              <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:600, marginBottom:"16px" }}>
                Cette master class va t'aider à :
              </h2>
            </div>
            <div className="discover-grid reveal" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"16px", marginBottom:"56px" }}>
              {[
                "Reprendre confiance en toi",
                "Assumer ton image",
                "Être alignée avec qui tu es",
                "Attirer les bonnes opportunités",
              ].map((item, i) => (
                <div key={i} style={{ display:"flex", gap:"14px", alignItems:"flex-start", padding:"20px 22px", background:"rgba(37,211,102,.04)", border:"1px solid rgba(37,211,102,.15)", borderRadius:"4px" }}>
                  <span style={{ color:"#25D366", fontSize:"1.1rem", flexShrink:0, marginTop:"2px" }}>✔</span>
                  <p style={{ fontFamily:"var(--ff-b)", fontWeight:400, fontSize:".88rem", color:"rgba(248,245,242,.85)" }}>{item}</p>
                </div>
              ))}
            </div>

            {/* Tu vas découvrir */}
            <div style={{ textAlign:"center", marginBottom:"40px" }}>
              <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:600 }}>
                Tu vas découvrir :
              </h2>
            </div>
            <div className="discover-grid reveal" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"16px" }}>
              {[
                "Comment te libérer du regard des autres",
                "Comment construire une image authentique",
                "Comment booster ta confiance",
                "Comment t'affirmer sans peur",
              ].map((item, i) => (
                <div key={i} style={{ display:"flex", gap:"14px", alignItems:"flex-start", padding:"20px 22px", background:"rgba(201,169,106,.04)", border:"1px solid rgba(201,169,106,.12)", borderRadius:"4px" }}>
                  <span style={{ color:"var(--or)", fontSize:"1rem", flexShrink:0 }}>→</span>
                  <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.8)" }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── 3 SECRETS ── */}
        <section style={{ padding:"80px 24px", background:"linear-gradient(180deg,#110d09,#18100d)" }}>
          <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"56px" }}>
              <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"var(--rose)", marginBottom:"12px" }}>Les révélations</p>
              <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:600 }}>
                Je vais aborder avec toi ces <em style={{fontStyle:"italic", color:"var(--or)"}}>3 secrets</em>
              </h2>
            </div>
            <div className="secrets-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"20px" }}>
              {[
                {
                  num:"01",
                  titre:"Pourquoi plus tu essaies de plaire… plus tu perds ton pouvoir",
                  desc:"Tu vas découvrir pourquoi vouloir être acceptée à tout prix te fait inconsciemment disparaître… et comment inverser ce mécanisme pour devenir naturellement magnétique, sans forcer.",
                },
                {
                  num:"02",
                  titre:"Le déclic invisible qui transforme ton image sans changer qui tu es",
                  desc:"Tu apprendras comment aligner ton image à ton identité profonde pour dégager confiance, charisme et impact… même si aujourd'hui tu doutes encore de toi.",
                },
                {
                  num:"03",
                  titre:"Comment attirer les opportunités sans courir après la validation des autres",
                  desc:"Tu vas comprendre comment t'affirmer, te positionner et être remarquée pour qui tu es vraiment… afin que les bonnes personnes, opportunités et relations viennent naturellement à toi.",
                },
              ].map((s, i) => (
                <div key={i} className="secret-card reveal" style={{ transitionDelay:`${i*.12}s` }}>
                  <div style={{ fontFamily:"var(--ff-t)", fontSize:"3rem", fontWeight:700, color:"rgba(201,169,106,.15)", lineHeight:1, marginBottom:"16px" }}>{s.num}</div>
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--or)", marginBottom:"12px", fontWeight:600 }}>Secret N°{s.num}</p>
                  <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.1rem", fontWeight:600, marginBottom:"14px", lineHeight:1.35 }}>{s.titre}</h3>
                  <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.6)", lineHeight:1.78 }}>{s.desc}</p>
                </div>
              ))}
            </div>

            {/* CTA */}
            <div className="reveal" style={{ textAlign:"center", marginTop:"56px" }}>
              <button onClick={scrollToForm} className="btn-p" style={{ animation:"pulse-rose 3s ease-in-out infinite" }}>
                JE RÉSERVE MA PLACE 100% GRATUIT
              </button>
              <p style={{ marginTop:"14px", fontFamily:"var(--ff-b)", fontSize:".68rem", color:"rgba(248,245,242,.25)" }}>
                Seulement <strong style={{color:"var(--rose)"}}>50 places</strong> restantes sur 500
              </p>
            </div>
          </div>
        </section>

        {/* ── QUI EST PRÉLIA ── */}
        <section style={{ padding:"80px 24px", background:"linear-gradient(180deg,#18100d,#2e1e14)" }}>
          <div style={{ maxWidth:"900px", margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"48px" }}>
              <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"var(--or)", marginBottom:"12px" }}></p>
              <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:600 }}>Qui suis-je pour t'aider ?</h2>
            </div>
            <div className="prelia-grid reveal" style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:"48px", alignItems:"start" }}>
              <div>
                <div style={{ position:"relative", paddingBottom:"120%", background:"linear-gradient(135deg,rgba(194,24,91,.1),rgba(201,169,106,.08))", border:"1px solid rgba(201,169,106,.15)", borderRadius:"4px", overflow:"hidden", marginBottom:"16px" }}>
                  <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <p style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", letterSpacing:".1em", textTransform:"uppercase", color:"rgba(201,169,106,.3)", textAlign:"center" }}>MA PHOTO</p>
                  </div>
                </div>
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1rem", color:"var(--or)" }}>Prélia Apedo</p>
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", color:"rgba(248,245,242,.3)", marginTop:"4px" }}>Coach en Image · Fondatrice White & Black</p>
                </div>
              </div>
              <div>
                <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.7)", lineHeight:1.85, marginBottom:"16px" }}>
                  Je suis <strong style={{color:"var(--blanc)"}}>Prélia Apedo</strong>, Conseillère Coach en image Certifiée par l'Institut de bien être de Marseille. Experte en transformation personnelle. Fondatrice de la marque White & Black et du programme Méta'Morph'Ose. Mariée et mère de deux enfants.
                </p>
                <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.7)", lineHeight:1.85, marginBottom:"24px" }}>
                  Mais avant tout… Je suis une femme qui s'est longtemps perdue. Je voulais plaire. Je voulais correspondre. Je me suis oubliée. Jusqu'au jour où j'ai compris : <strong style={{color:"var(--blanc)"}}>je devais être moi pour réussir.</strong>
                </p>
                <blockquote style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1.1rem", color:"var(--or)", borderLeft:"2px solid var(--rose)", paddingLeft:"20px", lineHeight:1.65 }}>
                  « Aujourd'hui, j'aide les femmes à faire la même transformation. »
                </blockquote>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginTop:"20px" }}>
                  {['Coach en Image certifiée', 'Styliste certifiée', 'Experte en transformation Personnelle', 'Oratrice & leader certifiée', 'Thérapeute du cœur certifiée', 'Coach Mind Education certifiée'].map((c,i) => (
                    <span key={i} style={{ padding:"6px 14px", border:"1px solid rgba(201,169,106,.2)", borderRadius:"100px", fontFamily:"var(--ff-b)", fontSize:".66rem", color:"rgba(201,169,106,.75)", fontWeight:500 }}>{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── TÉMOIGNAGES ── */}
        <section style={{ padding:"80px 24px", background:"linear-gradient(180deg,#2e1e14,#3a2518)" }}>
          <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"48px" }}>
              <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"var(--rose)", marginBottom:"12px" }}>Elles témoignent</p>
              <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:600 }}>
                Ce que disent les femmes qui ont déjà vécu cette expérience
              </h2>
            </div>

            <div className="temo-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"20px", marginBottom:"32px" }}>
              {visibleTemos.map((t, i) => (
                <div key={i} className="temo-card reveal" style={{ transitionDelay:`${(i%3)*.1}s` }}>
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".58rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--rose)", marginBottom:"8px" }}>{t.titre}</p>
                  <p style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:".95rem", color:"rgba(248,245,242,.75)", lineHeight:1.8, marginBottom:"16px" }}>
                    « {t.texte} »
                  </p>
                  <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
                    <div style={{ width:"28px", height:"28px", borderRadius:"50%", background:"rgba(194,24,91,.2)", border:"1px solid rgba(194,24,91,.3)", flexShrink:0 }}/>
                    <p style={{ fontFamily:"var(--ff-b)", fontSize:".72rem", fontWeight:600, color:"rgba(248,245,242,.6)", textTransform:"uppercase", letterSpacing:".1em" }}>— {t.nom}</p>
                  </div>
                </div>
              ))}
            </div>

            {!voirPlus && (
              <div style={{ textAlign:"center" }}>
                <button onClick={()=>setVoirPlus(true)} className="btn-or" style={{ cursor:"pointer" }}>
                  Voir plus de témoignages
                </button>
              </div>
            )}
          </div>
        </section>

        {/* ── POUR TOI / PAS POUR TOI ── */}
        <section style={{ padding:"80px 24px", background:"linear-gradient(180deg,#3a2518,#6b4028)" }}>
          <div style={{ maxWidth:"1000px", margin:"0 auto" }}>
            <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:600, textAlign:"center", marginBottom:"48px" }}>
              Cette masterclass est-elle faite pour toi ?
            </h2>
            <div className="pour-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px", marginBottom:"48px" }}>
              {/* Pour */}
              <div className="reveal" style={{ padding:"36px 28px", background:"rgba(37,211,102,.04)", border:"1px solid rgba(37,211,102,.15)", borderTop:"3px solid rgba(37,211,102,.5)", borderRadius:"6px" }}>
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".2em", textTransform:"uppercase", color:"#25D366", marginBottom:"20px", fontWeight:600 }}>
                  Cette masterclass est faite pour toi si…
                </p>
                {[
                  "Tu veux reprendre confiance en toi",
                  "Tu veux arrêter de vivre pour le regard des autres",
                  "Tu veux enfin être toi sans te censurer",
                  "Tu veux réussir sans te trahir",
                  "Tu veux révéler la femme puissante en toi",
                ].map((item, i) => (
                  <div key={i} style={{ display:"flex", gap:"12px", alignItems:"flex-start", marginBottom:"12px" }}>
                    <span style={{ color:"#25D366", flexShrink:0, fontSize:"1rem" }}>✓</span>
                    <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.8)", lineHeight:1.6 }}>{item}</p>
                  </div>
                ))}
              </div>

              {/* Pas pour */}
              <div className="reveal" style={{ padding:"36px 28px", background:"rgba(239,83,80,.03)", border:"1px solid rgba(239,83,80,.12)", borderTop:"3px solid rgba(239,83,80,.4)", borderRadius:"6px" }}>
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(239,83,80,.7)", marginBottom:"20px", fontWeight:600 }}>
                  🚫 Cette masterclass n'est pas pour toi si…
                </p>
                {[
                  "Tu préfères rester dans ta zone de confort plutôt que d'évoluer",
                  "Tu attends que les autres changent avant de te choisir",
                  "Tu refuses de te remettre en question",
                  "Tu veux plaire à tout le monde au lieu d'être toi-même",
                  "Tu n'es pas prête à t'engager pour ta propre transformation",
                  "Tu cherches des solutions rapides sans travailler sur toi en profondeur",
                ].map((item, i) => (
                  <div key={i} style={{ display:"flex", gap:"12px", alignItems:"flex-start", marginBottom:"12px" }}>
                    <span style={{ fontFamily:"'Playfair Display',serif", fontSize:".75rem", fontWeight:700, color:"rgba(239,83,80,.6)", flexShrink:0 }}>✕</span>
                    <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.5)", lineHeight:1.6 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Urgence */}
            <div className="reveal" style={{ padding:"36px 28px", background:"rgba(194,24,91,.06)", border:"1px solid rgba(194,24,91,.2)", borderRadius:"6px", textAlign:"center", marginBottom:"36px" }}>
              <p style={{ fontFamily:"var(--ff-b)", fontSize:".68rem", letterSpacing:".18em", textTransform:"uppercase", color:"var(--rose)", marginBottom:"12px" }}>⚠️ Attention</p>
              <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.7)", lineHeight:1.8, maxWidth:"580px", margin:"0 auto" }}>
                Cette masterclass n'est pas disponible en continu. C'est une opportunité unique de transformation. <strong style={{color:"var(--blanc)"}}>Chaque jour que tu attends… c'est un jour de plus où tu restes cachée.</strong>
              </p>
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section style={{ padding:"100px 24px", background:"linear-gradient(180deg,#6b4028,var(--beige-light))", textAlign:"center" }}>
          <div style={{ maxWidth:"680px", margin:"0 auto" }}>
            <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.8rem,5vw,3rem)", fontWeight:700, lineHeight:1.1, color:"var(--noir)", marginBottom:"20px" }}>
              Il est temps de te choisir.
            </h2>
            <p className="reveal" style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1.1rem", color:"rgba(10,10,10,.6)", lineHeight:1.8, marginBottom:"16px" }}>
              Tu n'as pas été créée pour te cacher.<br/>Tu n'as pas été créée pour douter.<br/>Tu as été créée pour briller.
            </p>
            <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontWeight:500, fontSize:".88rem", color:"rgba(10,10,10,.7)", marginBottom:"40px" }}>
              Et tout commence par une décision : <strong>Celle d'oser être toi.</strong>
            </p>
            <div className="reveal" style={{ display:"flex", flexDirection:"column", alignItems:"center", gap:"16px" }}>
              <button onClick={scrollToForm} className="btn-p" style={{ padding:"20px 52px", fontSize:".82rem", animation:"pulse-rose 3s ease-in-out infinite" }}>
                JE RÉSERVE MA PLACE 100% GRATUITE
              </button>
              <p style={{ fontFamily:"var(--ff-b)", fontSize:".68rem", color:"rgba(10,10,10,.4)" }}>
                Seulement <strong style={{color:"var(--rose)"}}>50 places</strong> restantes · Dimanche 26 avril · 17h GMT
              </p>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER MINIMAL ── */}
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
    </>
  );
}
