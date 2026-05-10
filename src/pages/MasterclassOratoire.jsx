import { useState, useEffect, useRef } from "react";
import usePageBackground from "../hooks/usePageBackground";
import { Link } from "react-router-dom";
import { configAPI } from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || '';

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
    --blanc: #F8F5F2; --marine: #0D1B2A;
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
    font-size:16px; font-weight:300; outline:none; transition:border .25s;
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

  .card-point {
    display:flex; gap:14px; align-items:flex-start;
    padding:18px 22px; border-radius:4px; margin-bottom:10px;
  }
  .card-point-or { background:rgba(201,169,106,.04); border:1px solid rgba(201,169,106,.12); }
  .card-point-green { background:rgba(37,211,102,.04); border:1px solid rgba(37,211,102,.15); }
  .card-point-rose { background:rgba(194,24,91,.04); border:1px solid rgba(194,24,91,.12); }

  .faq-item { border-bottom:1px solid rgba(255,255,255,.06); }
  .faq-btn { width:100%; display:flex; justify-content:space-between; align-items:center; padding:22px 0; background:none; border:none; cursor:pointer; text-align:left; gap:16px; }
  .faq-answer { overflow:hidden; transition:max-height .45s cubic-bezier(0.4,0,0.2,1); }

  .countdown-box {
    display:flex; flex-direction:column; align-items:center; gap:4px;
    background:rgba(194,24,91,.12); border:1px solid rgba(194,24,91,.3);
    border-radius:4px; padding:12px 16px; min-width:68px;
    animation:countIn .5s both;
  }

  @media(max-width:900px) {
    .hero-grid { grid-template-columns:1fr !important; }
    .two-col { grid-template-columns:1fr !important; }
    .prelia-grid { grid-template-columns:1fr !important; gap:32px !important; }
    .btn-p, .btn-or { width:100% !important; justify-content:center !important; }
  }
`;

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
      setError("Veuillez remplir tous les champs obligatoires."); return;
    }
    setLoading(true); setError("");
    try {
      const slugRes = await fetch(`${API_BASE}/api/masterclass/art-oratoire/`);
      const mc      = slugRes.ok ? await slugRes.json() : null;

      if (mc) {
        const res = await fetch(`${API_BASE}/api/masterclass/${mc.id}/reserver/`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prenom, nom: "", email, telephone: indicatif + tel.replace(/\D/g,"") }),
        });
        if (res.ok || res.status === 201) {
          onSuccess({ prenom, email, whatsapp: indicatif + tel }); return;
        }
        const d = await res.json().catch(()=>({}));
        setError(d.detail || "Une erreur est survenue. Réessayez.");
      } else {
        onSuccess({ prenom, email, whatsapp: indicatif + tel });
      }
    } catch {
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
          {PAYS_INDICATIFS.map(p => <option key={p.code} value={p.code}>{p.pays} {p.code}</option>)}
        </select>
        <input className="form-input" type="tel" placeholder="Numéro WhatsApp *" value={tel} onChange={e=>setTel(e.target.value)} required/>
      </div>
      {error && <p style={{ fontFamily:"var(--ff-b)", fontSize:".8rem", color:"#ef5350" }}>{error}</p>}
      <button type="submit" className="btn-p" disabled={loading} style={{ width:"100%", animation:"pulse-rose 3s ease-in-out infinite", fontSize:".8rem" }}>
        {loading ? (
          <><div style={{ width:"18px", height:"18px", border:"2px solid rgba(255,255,255,.3)", borderTopColor:"#fff", borderRadius:"50%", animation:"spin .7s linear infinite" }}/> Inscription en cours…</>
        ) : "JE RÉSERVE MA PLACE MAINTENANT"}
      </button>
      <p style={{ fontFamily:"var(--ff-b)", fontSize:".68rem", color:"rgba(248,245,242,.3)", textAlign:"center", lineHeight:1.6 }}>
        100% gratuit · Aucune carte bancaire requise · Places limitées
      </p>
    </form>
  );
}

function MessageSucces({ inscrit, whatsappGroupe }) {
  return (
    <div style={{ textAlign:"center", padding:"40px 32px", background:"rgba(201,169,106,.05)", border:"1px solid rgba(201,169,106,.2)", borderRadius:"6px", animation:"fadeUp .6s both" }}>
      <div style={{ width:"64px", height:"64px", borderRadius:"50%", background:"rgba(201,169,106,.15)", border:"2px solid rgba(201,169,106,.4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontFamily:"var(--ff-t)", fontSize:"1.5rem", color:"var(--or)" }}>✓</div>
      <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--or)", marginBottom:"12px" }}>Réservation confirmée</p>
      <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.2rem,4vw,1.6rem)", fontWeight:600, marginBottom:"20px", lineHeight:1.3 }}>
        {inscrit?.prenom ? `Merci ${inscrit.prenom} !` : "Merci !"}<br/>
        <em style={{ fontStyle:"italic", fontWeight:400, color:"var(--or)" }}>Votre place est réservée.</em>
      </h3>
      <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.7)", lineHeight:1.85, marginBottom:"28px", maxWidth:"480px", margin:"0 auto 28px" }}>
        Rejoignez le groupe WhatsApp pour recevoir toutes les informations pratiques avant le jour J et vous préparer au mieux pour cette expérience.
      </p>
      {whatsappGroupe && (
        <a href={whatsappGroupe} target="_blank" rel="noreferrer" className="btn-p" style={{ display:"inline-flex", gap:"12px", margin:"0 auto" }}>
          <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
          REJOINDRE LE GROUPE WHATSAPP
        </a>
      )}
    </div>
  );
}

const FAQS = [
  { q:"La masterclass est-elle gratuite ?", r:"Oui, cette masterclass est entièrement gratuite." },
  { q:"À qui s'adresse cette masterclass ?", r:"À toute personne souhaitant améliorer sa prise de parole et développer une communication plus impactante et authentique." },
  { q:"Dois-je déjà avoir de l'expérience en prise de parole ?", r:"Non. Cette masterclass est accessible aussi bien aux débutantes qu'aux personnes souhaitant renforcer leurs compétences." },
  { q:"Combien de temps dure la masterclass ?", r:"Toutes les informations pratiques seront communiquées après l'inscription." },
  { q:"Vais-je recevoir un support après la session ?", r:"Oui, les participantes recevront un guide bonus exclusif pour compléter l'expérience." },
  { q:"Que vais-je apprendre concrètement ?", r:"Tu découvriras des clés pratiques pour mieux structurer tes idées, t'exprimer avec plus d'aisance, renforcer ta présence et développer ton impact à l'oral." },
  { q:"Cette masterclass est-elle faite pour les entrepreneures uniquement ?", r:"Non. Les enseignements peuvent être utiles aussi bien dans la vie personnelle que professionnelle." },
  { q:"Comment participer à la masterclass ?", r:"Il te suffit de réserver ta place en cliquant sur le bouton d'inscription." },
];

function FAQ() {
  const [open, setOpen] = useState(null);
  return (
    <div>
      {FAQS.map((f, i) => (
        <div key={i} className="faq-item">
          <button className="faq-btn" onClick={() => setOpen(open===i?null:i)}>
            <span style={{ fontFamily:"var(--ff-b)", fontSize:".88rem", fontWeight:500, color:open===i?"var(--or)":"rgba(248,245,242,.85)", transition:"color .3s", lineHeight:1.5 }}>{f.q}</span>
            <span style={{ color:"var(--or)", fontSize:"1.2rem", transform:open===i?"rotate(45deg)":"none", transition:"transform .35s", flexShrink:0 }}>+</span>
          </button>
          <div className="faq-answer" style={{ maxHeight:open===i?"400px":"0" }}>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.5)", lineHeight:1.8, paddingBottom:"22px" }}>{f.r}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function MasterclassOratoire() {
  const [photoPrelia,    setPhotoPrelia]    = useState("");
  const [dateEvent,      setDateEvent]      = useState("2026-12-31T17:00:00Z");
  const [whatsappGroupe, setWhatsappGroupe] = useState("");
  const [placesMax,      setPlacesMax]      = useState(500);
  const [placesRest,     setPlacesRest]     = useState(500);
  const [inscrit,        setInscrit]        = useState(null);
  const formRef = useRef(null);
  const time    = useCountdown(dateEvent);
  usePageBackground("live");
  useReveal();

  useEffect(() => {
    configAPI.public()
      .then(r => r.data)
      .then(data => {
        const map = {};
        if (Array.isArray(data)) data.forEach(item => { map[item.cle] = item.valeur; });
        if (map.photo_prelia)    setPhotoPrelia(map.photo_prelia);
        if (map.mc2_date)        setDateEvent(map.mc2_date);
        if (map.mc2_whatsapp)    setWhatsappGroupe(map.mc2_whatsapp);
      })
      .catch(() => {});

    fetch(`${API_BASE}/api/masterclass/art-oratoire/`)
      .then(r => r.ok ? r.json() : null)
      .then(mc => {
        if (mc) { setPlacesMax(mc.places_max || 500); setPlacesRest(mc.places_restantes ?? 500); }
      })
      .catch(() => {});
  }, []);

  function scrollToForm() { formRef.current?.scrollIntoView({ behavior:"smooth", block:"center" }); }

  return (
    <>
      <style>{STYLES}</style>

      {/* NAVBAR */}
      <nav style={{ padding:"16px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"rgba(10,10,10,.96)", backdropFilter:"blur(20px)", zIndex:200 }}>
        <Link to="/" style={{ textDecoration:"none" }}>
          <span style={{ fontFamily:"var(--ff-t)", fontSize:"1rem" }}>
            <span style={{color:"var(--blanc)"}}>Meta'</span>
            <span style={{color:"var(--or)"}}>Morph'</span>
            <span style={{color:"var(--rose)"}}>Ose</span>
          </span>
        </Link>
        <button onClick={scrollToForm} className="btn-p" style={{ padding:"10px 20px", fontSize:".66rem", width:"auto" }}>
          Réserver ma place
        </button>
      </nav>

      <main>

        {/* HERO */}
        <section style={{ padding:"80px 24px 60px", background:"linear-gradient(135deg,#0A0A0A 0%,#0d1b2a 40%,#0A0A0A 100%)", position:"relative", overflow:"hidden", minHeight:"90vh", display:"flex", alignItems:"center" }}>
          <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
            <div style={{ position:"absolute", top:"-10%", left:"-5%", width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle,rgba(13,27,42,.4),transparent 70%)", animation:"orb 10s ease-in-out infinite" }}/>
            <div style={{ position:"absolute", bottom:"10%", right:"-5%", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(201,169,106,.08),transparent 70%)", animation:"orb 12s ease-in-out infinite 2s" }}/>
          </div>

          <div style={{ maxWidth:"1100px", margin:"0 auto", position:"relative", zIndex:1, width:"100%" }}>

            <div style={{ textAlign:"center", marginBottom:"36px" }}>
              <div style={{ marginBottom:"20px" }}>
                <span className="places-badge">
                  <span style={{ width:"8px", height:"8px", borderRadius:"50%", background:"var(--rose)", flexShrink:0 }}/>
                  PLACES LIMITEES — {placesRest} RESTANTES SUR {placesMax}
                </span>
              </div>
              <p style={{ fontFamily:"var(--ff-b)", fontSize:".7rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--or)", marginBottom:"16px" }}>
                MASTERCLASSE GRATUITE EN DIRECT
              </p>
              {!time.expired ? (
                <div style={{ display:"flex", gap:"10px", justifyContent:"center", flexWrap:"wrap", marginBottom:"8px" }}>
                  {[{v:time.days,l:"Jours"},{v:time.hours,l:"Heures"},{v:time.minutes,l:"Min"},{v:time.seconds,l:"Sec"}].map((t,i) => (
                    <div key={i} className="countdown-box" style={{ animationDelay:`${i*.1}s` }}>
                      <span style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.6rem,5vw,2.4rem)", fontWeight:700, color:"var(--rose)", lineHeight:1 }}>{String(t.v).padStart(2,"0")}</span>
                      <span style={{ fontFamily:"var(--ff-b)", fontSize:".55rem", letterSpacing:".12em", textTransform:"uppercase", color:"rgba(248,245,242,.35)" }}>{t.l}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".8rem", color:"var(--rose)", letterSpacing:".1em" }}>La masterclasse a eu lieu. Restez connectée pour la prochaine édition.</p>
              )}
            </div>

            <div className="hero-grid" style={{ display:"grid", gridTemplateColumns:"1fr 420px", gap:"60px", alignItems:"center" }}>

              {/* Gauche */}
              <div>
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"var(--or)", marginBottom:"16px", animation:"fadeUp .6s both" }}>Masterclasse</p>
                <h1 style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.8rem,5vw,3rem)", fontWeight:700, lineHeight:1.1, marginBottom:"20px", animation:"fadeUp .8s .1s both" }}>
                  <em style={{ fontStyle:"italic", fontWeight:400, background:"linear-gradient(135deg,var(--or),var(--or-light),var(--or))", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmer 4s linear infinite", display:"block", marginBottom:"8px" }}>
                    Ose t'exprimer,
                  </em>
                  Affirme ta voix et marque les esprits
                </h1>
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".78rem", letterSpacing:".12em", textTransform:"uppercase", color:"var(--or)", marginBottom:"16px", animation:"fadeUp .8s .15s both" }}>
                  Les clés pour développer une communication impactante et authentique
                </p>
                <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:"clamp(.9rem,2.5vw,1.05rem)", color:"rgba(248,245,242,.65)", lineHeight:1.85, marginBottom:"16px", animation:"fadeUp .8s .2s both" }}>
                  Et si ta manière de t'exprimer changeait ton impact ?
                </p>
                <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.6)", lineHeight:1.85, marginBottom:"12px", animation:"fadeUp .8s .25s both" }}>
                  Dans ta vie personnelle comme professionnelle, ta façon de t'exprimer influence ta présence, ta crédibilité et ton impact.
                </p>
                <div style={{ padding:"16px 20px", background:"rgba(201,169,106,.05)", border:"1px solid rgba(201,169,106,.12)", borderLeft:"3px solid var(--or)", marginBottom:"28px", animation:"fadeUp .8s .3s both" }}>
                  <p style={{ fontFamily:"var(--ff-b)", fontWeight:400, fontSize:".88rem", color:"rgba(248,245,242,.8)", lineHeight:1.8 }}>
                    La prise de parole n'est pas un don. C'est une compétence qui se développe. Et tu peux commencer dès maintenant.
                  </p>
                </div>
                <div style={{ display:"flex", gap:"28px", flexWrap:"wrap", animation:"fadeUp .8s .4s both" }}>
                  {[{val:"100%",label:"Gratuit"},{val:placesMax.toString(),label:"Places max"},{val:"+100",label:"Femmes accompagnées"}].map((s,i) => (
                    <div key={i} style={{ textAlign:"center" }}>
                      <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.6rem", fontWeight:700, color:"var(--rose)", lineHeight:1 }}>{s.val}</p>
                      <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".14em", textTransform:"uppercase", color:"rgba(248,245,242,.35)", fontWeight:500 }}>{s.label}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Droite — Formulaire */}
              <div ref={formRef} style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(201,169,106,.15)", borderRadius:"8px", padding:"36px 28px", backdropFilter:"blur(10px)" }}>
                {inscrit ? <MessageSucces inscrit={inscrit} whatsappGroupe={whatsappGroupe}/> : (
                  <>
                    <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--rose)", marginBottom:"8px" }}>Inscription gratuite</p>
                    <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.3rem", fontWeight:600, marginBottom:"6px" }}>Réservez votre place maintenant</h2>
                    <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".78rem", color:"rgba(248,245,242,.4)", marginBottom:"24px", lineHeight:1.6 }}>
                      Masterclasse Art Oratoire · En direct
                    </p>
                    <FormulaireInscription onSuccess={setInscrit}/>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* SEPARATEUR */}
        <div style={{ height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.25),transparent)", margin:"0 24px" }}/>

        {/* CE QUE TU VAS DECOUVRIR */}
        <section style={{ padding:"80px 24px", background:"linear-gradient(180deg,#0A0A0A,#0d1420)" }}>
          <div style={{ maxWidth:"1000px", margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"48px" }}>
              <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"var(--rose)", marginBottom:"12px" }}>Au programme</p>
              <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:600, marginBottom:"16px" }}>Ce que tu vas découvrir</h2>
              <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.5)", lineHeight:1.8, maxWidth:"600px", margin:"0 auto" }}>
                Au cours de cette masterclass, tu vas apprendre à :
              </p>
            </div>
            <div className="two-col reveal" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"56px" }}>
              {[
                "Structurer une prise de parole claire",
                "T'exprimer avec plus d'aisance",
                "Capter l'attention",
                "Renforcer ton impact à l'oral",
              ].map((item, i) => (
                <div key={i} className="card-point card-point-or">
                  <span style={{ color:"var(--or)", fontSize:"1rem", flexShrink:0, marginTop:"2px" }}>→</span>
                  <p style={{ fontFamily:"var(--ff-b)", fontWeight:400, fontSize:".88rem", color:"rgba(248,245,242,.85)", lineHeight:1.6 }}>{item}</p>
                </div>
              ))}
            </div>

            <div style={{ textAlign:"center", marginBottom:"40px" }}>
              <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:600, marginBottom:"16px" }}>Ce que tu vas vivre</h2>
              <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.5)", lineHeight:1.8 }}>
                Une experience :
              </p>
            </div>
            <div className="two-col reveal" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"40px" }}>
              {[
                { mot:"Structuree", desc:"Un parcours clair et progressif pour avancer pas a pas." },
                { mot:"Inspirante", desc:"Des enseignements concrets qui vous motivent a passer à l'action." },
                { mot:"Concrete", desc:"Des outils directement applicables dans votre quotidien." },
                { mot:"Accessible", desc:"Un moment ouvert a toutes, quel que soit votre niveau." },
              ].map((item, i) => (
                <div key={i} style={{ padding:"24px", background:"rgba(13,27,42,.4)", border:"1px solid rgba(201,169,106,.1)", borderTop:"2px solid var(--or)", borderRadius:"4px" }}>
                  <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.1rem", fontWeight:600, color:"var(--or)", marginBottom:"8px" }}>{item.mot}</p>
                  <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.55)", lineHeight:1.7 }}>{item.desc}</p>
                </div>
              ))}
            </div>
            <p className="reveal" style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1.1rem", color:"rgba(201,169,106,.6)", textAlign:"center", lineHeight:1.8 }}>
              Un moment dédié à ton évolution.
            </p>
            <div className="reveal" style={{ textAlign:"center", marginTop:"32px" }}>
              <button onClick={scrollToForm} className="btn-p" style={{ animation:"pulse-rose 3s ease-in-out infinite" }}>
                JE M'INSCRIS À LA MASTERCLASS
              </button>
            </div>
          </div>
        </section>

        {/* A PROPOS DE PRELIA */}
        <section style={{ padding:"80px 24px", background:"linear-gradient(180deg,#0d1420,#111820)" }}>
          <div style={{ maxWidth:"900px", margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"48px" }}>
              <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"var(--or)", marginBottom:"12px" }}>Votre coach</p>
              <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:600 }}>À propos de Prélia APEDO AHONON</h2>
            </div>
            <div className="prelia-grid reveal" style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:"48px", alignItems:"start" }}>
              <div>
                <div style={{ position:"relative", paddingBottom:"120%", background:"linear-gradient(135deg,rgba(13,27,42,.4),rgba(201,169,106,.08))", border:"1px solid rgba(201,169,106,.15)", borderRadius:"4px", overflow:"hidden", marginBottom:"16px" }}>
                  {photoPrelia ? (
                    <img src={photoPrelia} alt="Prélia APEDO AHONON" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }}/>
                  ) : (
                    <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <p style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", letterSpacing:".1em", textTransform:"uppercase", color:"rgba(201,169,106,.3)", textAlign:"center" }}>Photo Prélia APEDO AHONON</p>
                    </div>
                  )}
                </div>
                <div style={{ textAlign:"center" }}>
                  <p style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1rem", color:"var(--or)" }}>Prélia APEDO AHONON</p>
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", color:"rgba(248,245,242,.3)", marginTop:"4px" }}>Coach en Image · Fondatrice White & Black</p>
                </div>
              </div>
              <div>
                <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.7)", lineHeight:1.85, marginBottom:"16px" }}>
                  Je suis <strong style={{color:"var(--blanc)"}}>Prélia APEDO AHONON</strong>, Communicatrice de formation. Coach en Image, Conférencière, Oratrice et Leader Certifiee. Promotrice de la marque <strong style={{color:"var(--or)"}}>White & Black</strong> et Fondatrice du programme <strong style={{color:"var(--or)"}}>Méta'Morph'Ose</strong>.
                </p>
                <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.7)", lineHeight:1.85, marginBottom:"24px" }}>
                  J'accompagne les femmes a développer leur image, leur confiance et leur expression. Mon engagement : vous aider a devenir pleinement vous-même pour rayonner dans tous les aspects de votre vie.
                </p>
                <blockquote style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1.1rem", color:"var(--or)", borderLeft:"2px solid var(--rose)", paddingLeft:"20px", lineHeight:1.65, marginBottom:"20px" }}>
                  « Aujourd'hui, j'aide les femmes a trouver leur voix et a s'exprimer avec puissance et authenticité. »
                </blockquote>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                  {['Coach en Image certifiée','Styliste certifiée','Communicatrice de formation','Oratrice et Leader certifiée','Conférencière','Thérapeute du coeur certifiée','Coach Mind Education certifiée'].map((c,i) => (
                    <span key={i} style={{ padding:"6px 14px", border:"1px solid rgba(201,169,106,.2)", borderRadius:"100px", fontFamily:"var(--ff-b)", fontSize:".66rem", color:"rgba(201,169,106,.75)", fontWeight:500 }}>{c}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* POUR TOI / PAS POUR TOI */}
        <section style={{ padding:"80px 24px", background:"linear-gradient(180deg,#111820,#0d1b2a)" }}>
          <div style={{ maxWidth:"1000px", margin:"0 auto" }}>
            <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:600, textAlign:"center", marginBottom:"48px" }}>
              Cette masterclass est-elle faite pour toi ?
            </h2>
            <div className="two-col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px", marginBottom:"48px" }}>

              {/* Pour */}
              <div className="reveal" style={{ padding:"36px 28px", background:"rgba(201,169,106,.03)", border:"1px solid rgba(201,169,106,.15)", borderTop:"3px solid rgba(201,169,106,.5)", borderRadius:"6px" }}>
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--or)", marginBottom:"20px", fontWeight:600 }}>
                  Cette masterclass est faite pour toi si…
                </p>
                {[
                  "Tu souhaites ameliorer ta manière de t'exprimer",
                  "Tu veux gagner en aisance lors de tes prises de parole",
                  "Tu veux apprendre a structurer clairement tes idées",
                  "Tu veux developper une communication plus impactante et authentique",
                  "Tu veux renforcer ta présence et ton assurance à l'oral",
                  "Tu souhaites mieux capter l'attention lorsque tu parles",
                  "Tu veux développer ton impact dans ta vie personnelle ou professionnelle",
                  "Tu veux apprendre a transmettre tes idées avec plus de clarté et de fluidité",
                  "Tu es prête à évoluer et à pratiquer pour progresser",
                  "Tu veux developper une communication alignée avec la personne que tu es réellement",
                ].map((item, i) => (
                  <div key={i} style={{ display:"flex", gap:"12px", alignItems:"flex-start", marginBottom:"12px" }}>
                    <span style={{ color:"var(--or)", flexShrink:0, fontSize:"1rem" }}>✓</span>
                    <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.8)", lineHeight:1.6 }}>{item}</p>
                  </div>
                ))}
              </div>

              {/* Pas pour */}
              <div className="reveal" style={{ padding:"36px 28px", background:"rgba(239,83,80,.03)", border:"1px solid rgba(239,83,80,.12)", borderTop:"3px solid rgba(239,83,80,.4)", borderRadius:"6px" }}>
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(239,83,80,.7)", marginBottom:"20px", fontWeight:600 }}>
                  Cette masterclass n'est pas pour toi si…
                </p>
                {[
                  "Tu cherches une solution instantanée sans pratique",
                  "Tu n'es pas prête à appliquer les conseils partagés",
                  "Tu ne souhaites pas évoluer dans ta manière de communiquer",
                  "Tu penses que la prise de parole ne s'apprend pas",
                  "Tu veux uniquement regarder sans passer à l'action",
                  "Tu refuses de sortir progressivement de ta zone de confort",
                  "Tu recherches une approche agressive ou artificielle de la communication",
                ].map((item, i) => (
                  <div key={i} style={{ display:"flex", gap:"12px", alignItems:"flex-start", marginBottom:"12px" }}>
                    <span style={{ fontFamily:"var(--ff-b)", fontSize:".85rem", fontWeight:700, color:"rgba(239,83,80,.6)", flexShrink:0 }}>✕</span>
                    <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.5)", lineHeight:1.6 }}>{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="reveal" style={{ textAlign:"center" }}>
              <button onClick={scrollToForm} className="btn-p" style={{ animation:"pulse-rose 3s ease-in-out infinite" }}>
                OUI, JE VEUX DÉVELOPPER MON IMPACT
              </button>
            </div>
          </div>
        </section>

        {/* BONUS */}
        <section style={{ padding:"80px 24px", background:"linear-gradient(180deg,#0d1b2a,#0A0A0A)" }}>
          <div style={{ maxWidth:"800px", margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"40px" }}>
              <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"var(--rose)", marginBottom:"12px" }}>Surprise exclusive</p>
              <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:600 }}>Bonus exclusif</h2>
            </div>
            <div className="reveal" style={{ padding:"40px 36px", background:"rgba(201,169,106,.04)", border:"1px solid rgba(201,169,106,.15)", borderTop:"3px solid var(--or)", borderRadius:"6px" }}>
              <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.7)", lineHeight:1.85, marginBottom:"20px" }}>
                Une surprise attend toutes les participantes à la masterclass… En participant a cette expérience, tu recevras également un guide exclusif offert :
              </p>
              <div style={{ padding:"24px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(201,169,106,.1)", borderRadius:"4px", marginBottom:"24px", textAlign:"center" }}>
                <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.3rem", fontWeight:600, color:"var(--or)", marginBottom:"8px" }}>
                  "L'Art de se Presenter avec Impact et Assurance"
                </p>
                <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".78rem", color:"rgba(248,245,242,.4)" }}>Guide pratique exclusif offert a toutes les participantes</p>
              </div>
              <p style={{ fontFamily:"var(--ff-b)", fontWeight:400, fontSize:".85rem", color:"rgba(248,245,242,.7)", marginBottom:"16px" }}>
                Un guide pratique conçu pour t'aider à :
              </p>
              {[
                "Structurer une présentation claire et fluide",
                "Faire une première impression plus marquante",
                "Developper une présence plus assurée",
                "Mieux communiquer ton identité et ta valeur",
              ].map((item, i) => (
                <div key={i} style={{ display:"flex", gap:"12px", alignItems:"flex-start", marginBottom:"10px" }}>
                  <span style={{ color:"var(--or)", flexShrink:0 }}>→</span>
                  <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.75)", lineHeight:1.6 }}>{item}</p>
                </div>
              ))}
              <p style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:".95rem", color:"rgba(201,169,106,.6)", marginTop:"20px", lineHeight:1.7 }}>
                Un support complémentaire pour renforcer ton expérience durant la masterclass.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section style={{ padding:"80px 24px", background:"#0f0f0f", borderTop:"1px solid rgba(201,169,106,.08)" }}>
          <div style={{ maxWidth:"760px", margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"56px" }}>
              <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", marginBottom:"12px" }}>Questions fréquentes</p>
              <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.6rem,3vw,2.2rem)", fontWeight:600 }}>Tout ce que vous devez savoir</h2>
            </div>
            <FAQ/>
          </div>
        </section>

        {/* CTA FINAL */}
        <section style={{ padding:"100px 24px", background:"linear-gradient(180deg,#0f0f0f,#0d1b2a)", textAlign:"center" }}>
          <div style={{ maxWidth:"680px", margin:"0 auto" }}>
            <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.8rem,5vw,3rem)", fontWeight:700, lineHeight:1.1, marginBottom:"20px" }}>
              Prête à développer ton impact ?
            </h2>
            <p className="reveal" style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1.1rem", color:"rgba(201,169,106,.6)", lineHeight:1.8, marginBottom:"16px" }}>
              Rejoins cette expérience et découvre une nouvelle manière de t'exprimer avec plus d'assurance et d'authenticité.
            </p>
            <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.5)", marginBottom:"40px", lineHeight:1.8 }}>
              Ta voix mérite d'être entendue. Ton impact mérite d'être amplifié.<br/>
              <strong style={{color:"var(--blanc)"}}>Commence ici.</strong>
            </p>
            <div className="reveal">
              <button onClick={scrollToForm} className="btn-p" style={{ padding:"20px 52px", fontSize:".82rem", animation:"pulse-rose 3s ease-in-out infinite" }}>
                JE PARTICIPE À LA MASTERCLASS
              </button>
            </div>
          </div>
        </section>

      </main>

      {/* FOOTER */}
      <footer style={{ padding:"32px 24px", background:"var(--noir)", borderTop:"1px solid rgba(201,169,106,.1)", textAlign:"center" }}>
        <Link to="/" style={{ fontFamily:"var(--ff-t)", fontSize:".95rem", textDecoration:"none" }}>
          <span style={{color:"var(--blanc)"}}>Meta'</span>
          <span style={{color:"var(--or)"}}>Morph'</span>
          <span style={{color:"var(--rose)"}}>Ose</span>
        </Link>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".7rem", color:"rgba(248,245,242,.2)", marginTop:"8px" }}>
          © 2026 Méta'Morph'Ose · White & Black · Prélia APEDO AHONON
        </p>
      </footer>
    </>
  );
}
