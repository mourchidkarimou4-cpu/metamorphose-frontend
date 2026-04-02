import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import DiagnosticTest from "../components/DiagnosticTest";
import AuthModal from "../components/AuthModal";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Montserrat:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@1,300;1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --noir:#0A0A0A; --or:#C9A96A; --or-light:#E8D5A8;
    --rose:#C2185B; --rose-light:#EFC7D3; --beige:#D8C1A0;
    --beige-light:#F2EBE0; --blanc:#F8F5F2; --blanc-pur:#FFFFFF;
    --ff-t:'Playfair Display',Georgia,serif;
    --ff-b:'Montserrat',sans-serif;
    --ff-a:'Cormorant Garamond',Georgia,serif;
    --ease:cubic-bezier(0.4,0,0.2,1);
  }
  html{scroll-behavior:smooth}
  body{background:var(--noir);color:var(--blanc);font-family:var(--ff-b);font-weight:300;line-height:1.7;-webkit-font-smoothing:antialiased;overflow-x:hidden}
  ::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:var(--noir)}::-webkit-scrollbar-thumb{background:var(--or);border-radius:2px}

  @keyframes shimmer{0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-14px)}}
  @keyframes pulse-rose{0%,100%{box-shadow:0 0 24px rgba(194,24,91,.35)}50%{box-shadow:0 0 52px rgba(194,24,91,.65)}}
  @keyframes orb{0%,100%{transform:scale(1) translate(0,0);opacity:.12}40%{transform:scale(1.3) translate(20px,-15px);opacity:.22}70%{transform:scale(.85) translate(-15px,10px);opacity:.08}}
  @media(max-width:768px){
    .nav-desktop{display:none !important}
    .hamburger{display:block !important}
    .grid-formules{grid-template-columns:1fr !important}
    .story-grid{grid-template-columns:1fr !important}
  }
  @media(max-width:480px){
    .btn-group{flex-direction:column !important;width:100%}
    .btn-group a,.btn-group button{width:100% !important;justify-content:center !important}
  }
  @keyframes revealUp{from{opacity:0;transform:translateY(50px)}to{opacity:1;transform:translateY(0)}}
  @keyframes revealLeft{from{opacity:0;transform:translateX(-40px)}to{opacity:1;transform:none}}
  @keyframes revealRight{from{opacity:0;transform:translateX(40px)}to{opacity:1;transform:none}}
  @keyframes revealScale{from{opacity:0;transform:scale(.93)}to{opacity:1;transform:scale(1)}}
  @keyframes particle{0%{transform:translateY(0) rotate(0deg);opacity:.7}100%{transform:translateY(-100vh) rotate(720deg);opacity:0}}
  @keyframes shimmerGold{0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes ornament{from{width:0;opacity:0}to{width:100%;opacity:1}}
  @keyframes countUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
  .reveal-left{opacity:0;transform:translateX(-40px);transition:opacity .9s ease,transform .9s ease}
  .reveal-left.visible{opacity:1;transform:none}
  .reveal-right{opacity:0;transform:translateX(40px);transition:opacity .9s ease,transform .9s ease}
  .reveal-right.visible{opacity:1;transform:none}
  .reveal-scale{opacity:0;transform:scale(.93);transition:opacity .8s ease,transform .8s ease}
  .reveal-scale.visible{opacity:1;transform:scale(1)}
  .reveal-dramatic{opacity:0;transform:translateY(60px) scale(.97);filter:blur(4px);transition:opacity 1s ease,transform 1s ease,filter 1s ease}
  .reveal-dramatic.visible{opacity:1;transform:none;filter:blur(0)}
  .formule-card{transition:transform .35s var(--ease),border-color .35s var(--ease),box-shadow .35s var(--ease)}
  .formule-card:hover{transform:translateY(-8px) scale(1.02);box-shadow:0 20px 60px rgba(0,0,0,.4)}
  @keyframes slideIn{from{opacity:0;transform:scale(1.05)}to{opacity:1;transform:scale(1)}}
  @keyframes slideOut{from{opacity:1;transform:scale(1)}to{opacity:0;transform:scale(1.05)}}
  .slide-active{animation:slideIn 1.2s ease both}
  .slide-exit{animation:slideOut 1.2s ease both}

  /* ── Boutons ── */
  .btn-p{display:inline-flex;align-items:center;justify-content:center;gap:10px;background:var(--rose);color:#fff;font-family:var(--ff-b);font-weight:600;font-size:.76rem;letter-spacing:.16em;text-transform:uppercase;padding:16px 36px;border:none;border-radius:2px;cursor:pointer;text-decoration:none;transition:all .35s var(--ease);white-space:nowrap}
  .btn-p:hover{background:#a01049;transform:translateY(-3px);box-shadow:0 14px 40px rgba(194,24,91,.4)}
  .btn-s{display:inline-flex;align-items:center;justify-content:center;gap:10px;background:transparent;color:var(--or);font-family:var(--ff-b);font-weight:500;font-size:.76rem;letter-spacing:.16em;text-transform:uppercase;padding:15px 34px;border:1px solid var(--or);border-radius:2px;cursor:pointer;text-decoration:none;transition:all .35s var(--ease);white-space:nowrap}
  .btn-s:hover{background:var(--or);color:var(--noir);transform:translateY(-3px)}
  .btn-s-dark{display:inline-flex;align-items:center;justify-content:center;gap:10px;background:transparent;color:rgba(10,10,10,.7);font-family:var(--ff-b);font-weight:500;font-size:.76rem;letter-spacing:.16em;text-transform:uppercase;padding:15px 34px;border:1px solid rgba(10,10,10,.3);border-radius:2px;cursor:pointer;text-decoration:none;transition:all .35s var(--ease);white-space:nowrap}
  .btn-s-dark:hover{background:var(--noir);color:var(--blanc)}

  /* ── Labels ── */
  .label{font-family:var(--ff-b);font-size:.65rem;font-weight:500;letter-spacing:.28em;text-transform:uppercase;display:flex;align-items:center;gap:12px;margin-bottom:14px}
  .label::before{content:'';display:block;width:28px;height:1px}
  .label-light{color:var(--or)}.label-light::before{background:var(--or)}
  .label-dark{color:rgba(10,10,10,.4)}.label-dark::before{background:rgba(10,10,10,.4)}

  /* ── Reveal ── */
  .reveal{opacity:0;transform:translateY(40px);transition:opacity .9s var(--ease),transform .9s var(--ease)}
  .reveal.visible{opacity:1;transform:none}
  .reveal-left{opacity:0;transform:translateX(-40px);transition:opacity .9s var(--ease),transform .9s var(--ease)}
  .reveal-left.visible{opacity:1;transform:none}
  .reveal-right{opacity:0;transform:translateX(40px);transition:opacity .9s var(--ease),transform .9s var(--ease)}
  .reveal-right.visible{opacity:1;transform:none}
  .gold-line{height:1px;background:linear-gradient(90deg,transparent,var(--or),transparent);opacity:.25}

  /* ── Grilles responsive ── */
  .grid-2{display:grid;grid-template-columns:1fr 1fr;gap:24px}
  .grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}
  .grid-prelia{display:grid;grid-template-columns:360px 1fr;gap:72px;align-items:center}
  .grid-formules{display:grid;grid-template-columns:repeat(2,1fr);gap:20px}
  .grid-footer{display:grid;grid-template-columns:1fr 1fr 1fr;gap:48px}
  .grid-programme{display:grid;grid-template-columns:140px 1fr}
  .grid-avant-apres{display:grid;grid-template-columns:1fr 40px 1fr;align-items:center}

  /* ── DESKTOP (défaut) ── */
  .desktop-only{display:flex}
  .mobile-only{display:none}
  .nav-links{display:flex}
  .nav-ctas{display:flex}

  /* ── TABLETTE (max 1024px) ── */
  @media(max-width:1024px){
    .grid-prelia{grid-template-columns:280px 1fr;gap:48px}
    .grid-footer{grid-template-columns:1fr 1fr;gap:32px}
    .grid-formules{grid-template-columns:1fr 1fr}
    .nav-links{gap:20px}
  }

  /* ── MOBILE (max 768px) ── */
  @media(max-width:768px){
    .desktop-only{display:none !important}
    .mobile-only{display:flex !important}
    .nav-links{display:none !important}
    .nav-ctas{display:none !important}

    .grid-2{grid-template-columns:1fr !important}
    .grid-3{grid-template-columns:1fr !important}
    .grid-prelia{grid-template-columns:1fr !important;gap:32px}
    .grid-formules{grid-template-columns:1fr !important}
    .grid-footer{grid-template-columns:1fr !important;gap:32px}
    .grid-programme{grid-template-columns:100px 1fr}
    .grid-avant-apres{grid-template-columns:1fr 24px 1fr}

    .btn-p,.btn-s,.btn-s-dark{width:100%;justify-content:center;padding:15px 24px;font-size:.72rem}
    .section-pad{padding:80px 20px !important}
    .section-pad-sm{padding:60px 20px !important}
    .hero-title{font-size:clamp(2.2rem,10vw,3.5rem) !important}
    .hero-sub{font-size:.9rem !important}
    .h2-title{font-size:clamp(1.5rem,6vw,2rem) !important}
    .pillar-card{padding:28px 20px !important}
    .formule-card{padding:28px 24px !important}
    .prelia-photo{max-width:280px;margin:0 auto}
  }

  /* ── PETIT MOBILE (max 480px) ── */
  @media(max-width:480px){
    .grid-avant-apres{grid-template-columns:1fr !important}
    .avant-label{display:none}
    .btn-group{flex-direction:column !important;align-items:stretch}
    .grid-programme{grid-template-columns:80px 1fr}
    .programme-items{grid-template-columns:1fr !important}
  }
`;

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal,.reveal-left,.reveal-right");
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.15 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

function useScrollTheme() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const h = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      setProgress(Math.min(window.scrollY / max, 1));
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return progress;
}

function useSiteContent() {
  const [content, setContent] = useState({});
  const [loaded,  setLoaded]  = useState(false);

  useEffect(() => {
    let cancelled = false;
    function fetchContent() {
      fetch("/api/admin/config/public/")
        .then(r => {
          if (!r.ok) throw new Error("API indisponible");
          return r.json();
        })
        .then(data => {
          if (cancelled) return;
          const map = {};
          if (Array.isArray(data)) data.forEach(item => { map[item.cle] = item.valeur; });
          setContent(map);
          setLoaded(true);
        })
        .catch(() => {
          if (cancelled) return;
          // Backend en cold start Render — réessayer dans 6 secondes
          setTimeout(fetchContent, 6000);
        });
    }
    fetchContent();
    return () => { cancelled = true; };
  }, []);
  const get = (cle, defaut = "") => content[cle] || defaut;

  // Appliquer le favicon dynamiquement
  useEffect(() => {
    if (content["favicon"]) {
      let link = document.querySelector("link[rel~='icon']");
      if (!link) {
        link = document.createElement("link");
        link.rel = "icon";
        document.head.appendChild(link);
      }
      link.href = content["favicon"];
    }
  }, [content]);

  return { get, loaded };
}


/* ── Compteur animé au scroll ───────────────────────────────── */
function useCountUp(target, duration = 2000, isVisible = false) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (!isVisible) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isVisible, target]);
  return count;
}

function StatCard({ valeur, label, delay="0s" }) {
  const ref = useRef(null);
  const [started, setStarted] = useState(false);
  const num    = parseInt(String(valeur).replace(/[^0-9]/g,"")) || 0;
  const suffix = String(valeur).replace(/[0-9]/g,"");
  const count  = useCountUp(num, 2200, started);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if(e.isIntersecting) setStarted(true); }, { threshold:.5 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <div ref={ref} style={{ textAlign:"center", padding:"32px 20px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.05)", borderBottom:"3px solid rgba(201,169,106,.4)", borderRadius:"4px", transition:"all .3s", animation:`countUp .7s ${delay} both` }}
      onMouseEnter={e=>{ e.currentTarget.style.borderBottomColor="#C9A96A"; e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.background="rgba(201,169,106,.04)"; }}
      onMouseLeave={e=>{ e.currentTarget.style.borderBottomColor="rgba(201,169,106,.4)"; e.currentTarget.style.transform="none"; e.currentTarget.style.background="rgba(255,255,255,.025)"; }}>
      <p style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(2.2rem,5vw,3.5rem)", fontWeight:700, lineHeight:1, marginBottom:"10px", background:"linear-gradient(135deg,#C9A96A,#E8D5A8,#C9A96A)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmerGold 3s linear infinite" }}>
        {started ? count : 0}{suffix}
      </p>
      <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(248,245,242,.4)", fontWeight:500 }}>{label}</p>
    </div>
  );
}

function StatsSection({ get }) {
  const stats = [
    { valeur: get("stat_femmes","200+"),  label: get("stat_label1","Femmes transformées") },
    { valeur: get("stat_pays","15+"),     label: get("stat_label2","Pays représentés") },
    { valeur: get("stat_semaines","8"),   label: get("stat_label3","Semaines de programme") },
    { valeur: get("stat_4","98%"),        label: get("stat_label4","Taux de satisfaction") },
  ];
  return (
    <section style={{ padding:"80px 24px" }}>
      <div style={{ maxWidth:"900px", margin:"0 auto" }}>
        <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"var(--or)", textAlign:"center", marginBottom:"40px" }}>En chiffres</p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))", gap:"16px" }}>
          {stats.map((s,i) => <StatCard key={i} valeur={s.valeur} label={s.label} delay={`${i*.12}s`}/>)}
        </div>
      </div>
    </section>
  );
}

function useCountdown(dateStr) {
  const [time, setTime] = useState({ days:0, hours:0, minutes:0, seconds:0 });
  useEffect(() => {
    if (!dateStr) return;
    const target = new Date(dateStr).getTime();
    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) { setTime({ days:0, hours:0, minutes:0, seconds:0 }); return; }
      setTime({
        days:    Math.floor(diff / 86400000),
        hours:   Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
      });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [dateStr]);
  return time;
}

function VagueSection({ get }) {
  const active     = get("vague_active","0") === "1";
  const total      = parseInt(get("vague_places_total","20"));
  const prises     = parseInt(get("vague_places_prises","0"));
  const restantes  = Math.max(0, total - prises);
  const pct        = Math.min(100, Math.round((prises / total) * 100));
  const dateFerme  = get("vague_date_fermeture","");
  const nomVague   = get("vague_nom","Prochaine vague");
  const time       = useCountdown(dateFerme);

  if (!active) return null;

  return (
    <div style={{
      background:"rgba(194,24,91,.06)", border:"1px solid rgba(194,24,91,.2)",
      borderRadius:"4px", padding:"24px 28px", margin:"0 auto 0",
      maxWidth:"900px",
    }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", flexWrap:"wrap", gap:"16px", marginBottom:"16px" }}>
        <div>
          <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--rose)", marginBottom:"4px" }}>
            {nomVague}
          </p>
          <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.1rem", fontWeight:600 }}>
            Plus que <span style={{ color:"var(--rose)" }}>{restantes} place{restantes > 1?"s":""}</span> disponible{restantes > 1?"s":""}
          </p>
        </div>

        {dateFerme && (
          <div style={{ display:"flex", gap:"10px", alignItems:"center" }}>
            {[
              { v:time.days,    l:"jours" },
              { v:time.hours,   l:"heures" },
              { v:time.minutes, l:"min" },
              { v:time.seconds, l:"sec" },
            ].map((t,i) => (
              <div key={i} style={{ textAlign:"center" }}>
                <div style={{ background:"rgba(194,24,91,.15)", border:"1px solid rgba(194,24,91,.3)", borderRadius:"3px", padding:"8px 12px", fontFamily:"var(--ff-t)", fontSize:"1.3rem", fontWeight:700, color:"var(--rose)", minWidth:"44px" }}>
                  {String(t.v).padStart(2,"0")}
                </div>
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".55rem", letterSpacing:".1em", textTransform:"uppercase", color:"rgba(248,245,242,.35)", marginTop:"4px" }}>{t.l}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Barre de progression */}
      <div style={{ height:"4px", background:"rgba(255,255,255,.08)", borderRadius:"2px", overflow:"hidden", marginBottom:"8px" }}>
        <div style={{ height:"100%", width:`${pct}%`, background:"linear-gradient(90deg,var(--rose),#e91e8c)", borderRadius:"2px", transition:"width 1s var(--ease)" }}/>
      </div>
      <p style={{ fontFamily:"var(--ff-b)", fontSize:".7rem", color:"rgba(248,245,242,.4)", fontWeight:300 }}>
        {prises} inscription{prises > 1?"s":""} sur {total} places · Les inscriptions ferment le {dateFerme ? new Date(dateFerme).toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric" }) : ""}
      </p>
    </div>
  );
}

/* ── Calculateur de formule ─────────────────────────────────── */
function CalculateurFormule({ onClose }) {
  const [step,    setStep]    = useState(0);
  const [answers, setAnswers] = useState({});
  const [result,  setResult]  = useState(null);

  const questions = [
    {
      id:"budget",
      question:"Quel est votre budget pour cette transformation ?",
      options:[
        { label:"Jusqu'à 65 000 FCFA",   value:"F1" },
        { label:"Jusqu'à 150 000 FCFA",  value:"F2" },
        { label:"Jusqu'à 250 000 FCFA",  value:"F3" },
        { label:"Je veux le meilleur",   value:"F4" },
      ]
    },
    {
      id:"format",
      question:"Vous préférez un accompagnement en ligne ou en présentiel ?",
      options:[
        { label:"En ligne — depuis chez moi",          value:"online" },
        { label:"En présentiel — je veux être là",     value:"presentiel" },
        { label:"Peu importe, je veux des résultats",  value:"any" },
      ]
    },
    {
      id:"suivi",
      question:"Quel type de suivi vous correspond le mieux ?",
      options:[
        { label:"En groupe — j'aime la dynamique collective", value:"groupe" },
        { label:"En privé — je veux un suivi personnalisé",   value:"prive" },
      ]
    },
    {
      id:"disponibilite",
      question:"Quelle est votre disponibilité ?",
      options:[
        { label:"2 séances par semaine — je suis disponible",       value:"high" },
        { label:"1 séance par semaine — je gère mon temps",         value:"medium" },
        { label:"Je préfère avancer à mon rythme avec les replays", value:"flexible" },
      ]
    },
  ];

  const FORMULES = {
    F1: { label:"Live · Groupe",      prix:"65 000 FCFA",  desc:"2 séances/semaine en ligne avec un groupe bienveillant. Idéal pour démarrer.", color:"#C2185B" },
    F2: { label:"Live · Privé",       prix:"150 000 FCFA", desc:"Accompagnement individuel en ligne avec Prélia. Suivi personnalisé et adapté.", color:"#C9A96A" },
    F3: { label:"Présentiel · Groupe",prix:"250 000 FCFA", desc:"1 séance/semaine en présentiel avec un groupe. Immersion physique complète.",  color:"#A8C8E0" },
    F4: { label:"Présentiel · Privé", prix:"350 000 FCFA", desc:"Accompagnement individuel en présentiel avec Prélia. L'expérience ultime.",   color:"#D8C1A0" },
  };

  function calcResult(ans) {
    // Logique de recommandation
    if (ans.budget === "F1") return "F1";
    if (ans.budget === "F4") return "F4";
    if (ans.format === "presentiel" && ans.suivi === "prive")  return "F4";
    if (ans.format === "presentiel" && ans.suivi === "groupe") return "F3";
    if (ans.format === "online"     && ans.suivi === "prive")  return "F2";
    if (ans.suivi  === "prive")   return "F2";
    if (ans.budget === "F3")      return "F3";
    if (ans.budget === "F2")      return "F2";
    return "F1";
  }

  function answer(val) {
    const q   = questions[step];
    const ans = { ...answers, [q.id]: val };
    setAnswers(ans);
    if (step < questions.length - 1) {
      setStep(s => s + 1);
    } else {
      setResult(calcResult(ans));
    }
  }

  return (
    <div style={{ position:"fixed", inset:0, zIndex:600, background:"rgba(10,10,10,.92)", backdropFilter:"blur(14px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"20px" }}
      onClick={e => { if(e.target===e.currentTarget) onClose(); }}>
      <div style={{ maxWidth:"560px", width:"100%", background:"#141414", border:"1px solid rgba(201,169,106,.15)", borderRadius:"6px", padding:"40px 32px", position:"relative" }}>
        <button onClick={onClose} style={{ position:"absolute", top:"16px", right:"18px", background:"none", border:"none", color:"rgba(201,169,106,.5)", fontSize:"1rem", cursor:"pointer", fontFamily:"var(--ff-b)", letterSpacing:".1em", textTransform:"uppercase" }}>Fermer</button>

        {!result ? (
          <>
            {/* Progress */}
            <div style={{ display:"flex", gap:"6px", marginBottom:"28px" }}>
              {questions.map((_,i) => (
                <div key={i} style={{ flex:1, height:"3px", borderRadius:"2px", background: i <= step ? "var(--rose)" : "rgba(255,255,255,.1)", transition:"background .3s" }}/>
              ))}
            </div>

            <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--or)", marginBottom:"12px" }}>
              Question {step+1} sur {questions.length}
            </p>
            <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.3rem", fontWeight:600, color:"var(--blanc)", marginBottom:"28px", lineHeight:1.3 }}>
              {questions[step].question}
            </h3>

            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              {questions[step].options.map((opt,i) => (
                <button key={i} onClick={() => answer(opt.value)} style={{
                  padding:"16px 20px", background:"rgba(255,255,255,.03)",
                  border:"1px solid rgba(255,255,255,.08)", borderRadius:"4px",
                  color:"rgba(248,245,242,.8)", fontFamily:"var(--ff-b)",
                  fontSize:".88rem", fontWeight:300, cursor:"pointer",
                  textAlign:"left", transition:"all .25s",
                }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(194,24,91,.4)"; e.currentTarget.style.background="rgba(194,24,91,.06)"; e.currentTarget.style.color="#fff"; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,.08)"; e.currentTarget.style.background="rgba(255,255,255,.03)"; e.currentTarget.style.color="rgba(248,245,242,.8)"; }}>
                  {opt.label}
                </button>
              ))}
            </div>

            {step > 0 && (
              <button onClick={()=>setStep(s=>s-1)} style={{ marginTop:"16px", background:"none", border:"none", color:"rgba(248,245,242,.3)", fontFamily:"var(--ff-b)", fontSize:".72rem", cursor:"pointer", letterSpacing:".1em", textTransform:"uppercase" }}>
                Retour
              </button>
            )}
          </>
        ) : (
          // Résultat
          <div style={{ textAlign:"center", animation:"revealUp .5s both" }}>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"var(--or)", marginBottom:"12px" }}>
              Notre recommandation
            </p>
            <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.6rem", fontWeight:600, marginBottom:"8px" }}>
              {FORMULES[result].label}
            </h3>
            <p style={{ fontFamily:"var(--ff-t)", fontSize:"2rem", fontWeight:700, color:FORMULES[result].color, marginBottom:"16px" }}>
              {FORMULES[result].prix}
            </p>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.6)", lineHeight:1.75, marginBottom:"32px", maxWidth:"400px", margin:"0 auto 32px" }}>
              {FORMULES[result].desc}
            </p>
            <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
              <a href="/contact" className="btn-p" onClick={onClose}>
                Je m'inscris à cette formule
              </a>
              <button onClick={()=>{ setStep(0); setAnswers({}); setResult(null); }} className="btn-s" style={{ cursor:"pointer" }}>
                Recommencer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Chat WhatsApp flottant ─────────────────────────────────── */
function WhatsAppButton({ get }) {
  const [open, setOpen] = useState(false);
  const numero  = get("whatsapp_numero","22901961140933");
  const message = encodeURIComponent(get("whatsapp_message","Bonjour Prélia, je suis intéressée par Méta'Morph'Ose."));
  const url     = `https://wa.me/${numero}?text=${message}`;

  return (
    <div style={{ position:"fixed", bottom:"80px", right:"16px", zIndex:149, display:"flex", flexDirection:"column", alignItems:"flex-end", gap:"10px" }}>
      {open && (
        <div style={{ background:"#1a1a1a", border:"1px solid rgba(201,169,106,.2)", borderRadius:"8px", padding:"20px", maxWidth:"280px", boxShadow:"0 8px 32px rgba(0,0,0,.5)", animation:"revealUp .3s both" }}>
          <p style={{ fontFamily:"var(--ff-b)", fontSize:".7rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--or)", marginBottom:"8px" }}>Contacter Prélia</p>
          <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.65)", lineHeight:1.65, marginBottom:"16px" }}>
            Posez vos questions directement sur WhatsApp. Prélia vous répond personnellement.
          </p>
          <a href={url} target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"8px", background:"#25D366", color:"#fff", fontFamily:"var(--ff-b)", fontWeight:600, fontSize:".72rem", letterSpacing:".1em", textTransform:"uppercase", padding:"12px 20px", borderRadius:"4px", textDecoration:"none" }}>
            Ouvrir WhatsApp
          </a>
          <div style={{ marginTop:"12px", display:"flex", flexDirection:"column", gap:"6px" }}>
            <a href={`tel:+${numero}`} style={{ fontFamily:"var(--ff-b)", fontSize:".75rem", color:"rgba(248,245,242,.4)", textDecoration:"none", textAlign:"center" }}>
              +{numero.replace(/(\d{3})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/,"$1 $2 $3 $4 $5 $6")}
            </a>
          </div>
        </div>
      )}
      <button onClick={()=>setOpen(!open)} style={{
        width:"52px", height:"52px", borderRadius:"50%",
        background: open ? "rgba(255,255,255,.1)" : "#25D366",
        border: open ? "1px solid rgba(255,255,255,.15)" : "none",
        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
        boxShadow:"0 4px 20px rgba(0,0,0,.4)", transition:"all .3s",
      }}>
        {open ? (
          <span style={{ color:"rgba(248,245,242,.6)", fontSize:".75rem", fontFamily:"var(--ff-b)", letterSpacing:".05em" }}>X</span>
        ) : (
          <svg viewBox="0 0 24 24" width="26" height="26" fill="#fff">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        )}
      </button>
    </div>
  );
}

function Orb({ style }) {
  return <div style={{ position:"absolute", borderRadius:"50%", background:"radial-gradient(circle,rgba(201,169,106,.28),transparent 70%)", animation:"orb 10s ease-in-out infinite", pointerEvents:"none", ...style }}/>;
}

function Navbar({ scrollProgress, onAuthOpen, get }) {
  const [scrolled,  setScrolled]  = useState(false);
  const [menuOpen,  setMenuOpen]  = useState(false);
  const user   = JSON.parse(localStorage.getItem("mmorphose_user") || "null");
  const isDark = Math.round(scrollProgress * 100) < 55;

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  const navBg      = scrolled ? (isDark ? "rgba(10,10,10,.96)" : "rgba(248,245,242,.96)") : "transparent";
  const textColor  = !scrolled ? "#F8F5F2" : isDark ? "#F8F5F2" : "#0A0A0A";
  const borderColor= scrolled ? (isDark ? "rgba(201,169,106,.15)" : "rgba(10,10,10,.08)") : "transparent";

  const links = [
    { label:"Programme", href:"/programme", ext:true },
    { label:"Prélia",    href:"/a-propos",  ext:true },
    { label:"Formules",  href:"#formules",  ext:false },
    { label:"Contact",   href:"/contact",   ext:true },
  ];

  return (
    <>
      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:200, padding:scrolled?"14px 24px":"22px 24px", background:navBg, backdropFilter:scrolled?"blur(24px)":"none", borderBottom:`1px solid ${borderColor}`, display:"flex", alignItems:"center", justifyContent:"space-between", transition:"all .4s var(--ease)" }}>

        {/* Logo */}
        <a href="#" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:"10px", flexShrink:0 }}>
          {get("logo_site","") && (
            <img src={get("logo_site","")} alt="Logo" style={{ height:"30px", objectFit:"contain" }}/>
          )}
          <span style={{ fontFamily:"var(--ff-t)", fontSize:"1rem" }}>
            <span style={{ color:isDark||!scrolled?"var(--blanc)":"var(--noir)" }}>Meta'</span>
            <span style={{ color:"var(--or)" }}>Morph'</span>
            <span style={{ color:"var(--rose)" }}>Ose</span>
          </span>
        </a>

        {/* Links desktop */}
        <ul className="nav-links" style={{ gap:"24px", listStyle:"none", fontFamily:"var(--ff-b)", fontSize:".68rem", fontWeight:500, letterSpacing:".12em", textTransform:"uppercase" }}>
          {links.map(l => (
            <li key={l.label}>
              <a href={l.href} style={{ color:textColor, textDecoration:"none", opacity:.75, transition:"opacity .3s" }}
                onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=.75}>{l.label}</a>
            </li>
          ))}
          <li>
            <Link to="/brunch" style={{ color:"var(--or)", textDecoration:"none", opacity:.75 }}
              onMouseEnter={e=>e.target.style.opacity=1} onMouseLeave={e=>e.target.style.opacity=.75}>Le Brunch</Link>
          </li>
        </ul>

        {/* CTAs desktop */}
        <div className="nav-ctas" style={{ alignItems:"center", gap:"10px", flexShrink:0 }}>
          {user ? (
            <Link to="/dashboard" style={{ fontFamily:"var(--ff-b)", fontSize:".66rem", fontWeight:500, letterSpacing:".1em", textTransform:"uppercase", color:"var(--or)", textDecoration:"none", border:"1px solid rgba(201,169,106,.3)", borderRadius:"3px", padding:"9px 16px", transition:"all .3s", whiteSpace:"nowrap" }}
              onMouseEnter={e=>e.currentTarget.style.background="rgba(201,169,106,.08)"}
              onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
              Mon espace
            </Link>
          ) : (
            <button onClick={() => onAuthOpen("login")} style={{ fontFamily:"var(--ff-b)", fontSize:".66rem", fontWeight:500, letterSpacing:".1em", textTransform:"uppercase", color:isDark||!scrolled?"rgba(248,245,242,.6)":"rgba(10,10,10,.5)", background:"none", border:"none", cursor:"pointer", padding:"9px 4px", whiteSpace:"nowrap" }}
              onMouseEnter={e=>e.target.style.color="var(--or)"}
              onMouseLeave={e=>e.target.style.color=isDark||!scrolled?"rgba(248,245,242,.6)":"rgba(10,10,10,.5)"}>
              Espace membre
            </button>
          )}
          <button onClick={() => onAuthOpen("inscription")} className="btn-p" style={{ padding:"10px 20px", fontSize:".66rem" }}>
            S'inscrire
          </button>
        </div>

        {/* Burger mobile */}
        <button onClick={()=>setMenuOpen(true)} className="mobile-only" style={{ background:"none", border:"1px solid rgba(201,169,106,.3)", borderRadius:"3px", color:"var(--or)", padding:"8px 14px", cursor:"pointer", fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".1em", textTransform:"uppercase" }}>
          Menu
        </button>
      </nav>
      {/* Bandeau fermeture inscriptions */}
      {get("vague_active","1") === "1" && get("vague_date_fermeture","") && (() => {
        const dateF = new Date(get("vague_date_fermeture",""));
        const diff  = dateF - new Date();
        if (diff <= 0) return null;
        const jours  = Math.floor(diff / (1000*60*60*24));
        const heures = Math.floor((diff % (1000*60*60*24)) / (1000*60*60));
        return (
          <div style={{ background:"linear-gradient(90deg,#C2185B,#a01049)", padding:"10px 24px", textAlign:"center", position:"sticky", top:"57px", zIndex:99 }}>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".72rem", fontWeight:600, letterSpacing:".15em", textTransform:"uppercase", color:"#fff" }}>
              Fermeture des inscriptions dans{" "}
              <span style={{ color:"#FFD700", fontWeight:700 }}>{jours > 0 ? `${jours}j ${heures}h` : `${heures}h`}</span>
              {" "}— {parseInt(get("vague_places_total","0")) - parseInt(get("vague_places_prises","0"))} places restantes
            </p>
          </div>
        );
      })()}


      {/* Menu mobile plein écran */}
      {menuOpen && (
        <div style={{ position:"fixed", inset:0, background:"rgba(10,10,10,.99)", zIndex:300, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"0", overflowY:"auto", padding:"80px 24px 40px" }}>
          <button onClick={()=>setMenuOpen(false)} style={{ position:"absolute", top:"20px", right:"20px", background:"none", border:"1px solid rgba(201,169,106,.25)", borderRadius:"3px", color:"var(--or)", padding:"8px 16px", cursor:"pointer", fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".1em", textTransform:"uppercase" }}>
            Fermer
          </button>

          {/* Logo mobile */}
          <div style={{ marginBottom:"40px", textAlign:"center" }}>
            {get("logo_site","") && <img src={get("logo_site","")} alt="Logo" style={{ height:"40px", objectFit:"contain", marginBottom:"8px" }}/>}
            <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.2rem" }}>
              <span style={{ color:"var(--blanc)" }}>Meta'</span>
              <span style={{ color:"var(--or)" }}>Morph'</span>
              <span style={{ color:"var(--rose)" }}>Ose</span>
            </p>
          </div>

          {/* Liens */}
          {[
            ...links,
            { label:"Témoignages", href:"/temoignages", ext:true },
            { label:"FAQ",         href:"/faq",         ext:true },
            { label:"Le Brunch",   href:"/brunch",      ext:true },
            { label:"Carte Cadeau",href:"/carte-cadeau",ext:true },
          ].map((l,i) => (
            <Link key={l.label} to={l.href} onClick={()=>setMenuOpen(false)} style={{ fontFamily:"var(--ff-t)", fontSize:"1.4rem", color:"var(--blanc)", textDecoration:"none", padding:"14px 0", borderBottom:"1px solid rgba(255,255,255,.05)", width:"100%", textAlign:"center", transition:"color .3s" }}
              onMouseEnter={e=>e.target.style.color="var(--or)"}
              onMouseLeave={e=>e.target.style.color="var(--blanc)"}>
              {l.label}
            </Link>
          ))}

          {/* CTAs mobile */}
          <div style={{ display:"flex", flexDirection:"column", gap:"12px", marginTop:"32px", width:"100%" }}>
            <button onClick={()=>{onAuthOpen("inscription");setMenuOpen(false);}} className="btn-p" style={{ width:"100%", padding:"16px", fontSize:".75rem" }}>
              S'inscrire
            </button>
            {user ? (
              <Link to="/dashboard" onClick={()=>setMenuOpen(false)} className="btn-s" style={{ width:"100%", padding:"15px", fontSize:".75rem", textAlign:"center" }}>
                Mon espace
              </Link>
            ) : (
              <button onClick={()=>{onAuthOpen("login");setMenuOpen(false);}} className="btn-s" style={{ width:"100%", padding:"15px", fontSize:".75rem" }}>
                Espace membre
              </button>
            )}
          </div>
        </div>
      )}
    </>
  );
}


/* ── DIAPORAMA HERO ─────────────────────────────────────────── */
const SLIDES = [
  {
    // Slide 1 — Gradient rose/noir élégant
    bg: "linear-gradient(135deg, #0A0A0A 0%, #1a0a0f 40%, #2d0a1a 70%, #0A0A0A 100%)",
    overlay: "radial-gradient(ellipse 80% 60% at 30% 50%, rgba(194,24,91,.25), transparent 70%)",
  },
  {
    // Slide 2 — Gradient or/noir
    bg: "linear-gradient(135deg, #0A0A0A 0%, #0f0d08 30%, #1a1508 60%, #0A0A0A 100%)",
    overlay: "radial-gradient(ellipse 80% 60% at 70% 40%, rgba(201,169,106,.2), transparent 70%)",
  },
  {
    // Slide 3 — Gradient profond bleuté
    bg: "linear-gradient(135deg, #050810 0%, #080d1a 40%, #0d1020 70%, #0A0A0A 100%)",
    overlay: "radial-gradient(ellipse 80% 60% at 50% 60%, rgba(100,130,200,.15), transparent 70%)",
  },
  {
    // Slide 4 — Gradient chaud bordeaux
    bg: "linear-gradient(135deg, #0A0A0A 0%, #150508 35%, #200a10 65%, #0A0A0A 100%)",
    overlay: "radial-gradient(ellipse 70% 70% at 60% 30%, rgba(180,20,60,.2), transparent 70%)",
  },
];

function HeroDiaporama({ get }) {
  const [current, setCurrent] = useState(0);
  const [prev,    setPrev]    = useState(null);

  // Récupérer les slides uploadées depuis le dashboard
  const uploadedSlides = [1,2,3,4,5]
    .map(i => get(`slide_${i}`, ""))
    .filter(Boolean);

  const activeSlides = uploadedSlides.length > 0 ? uploadedSlides : null;
  const totalSlides  = activeSlides ? activeSlides.length : SLIDES.length;

  useEffect(() => {
    const interval = setInterval(() => {
      setPrev(current);
      setCurrent(c => (c + 1) % totalSlides);
      setTimeout(() => setPrev(null), 1200);
    }, 5000);
    return () => clearInterval(interval);
  }, [current, totalSlides]);

  const heroImg = get("image_hero", "");

  return (
    <div style={{ position:"absolute", inset:0, overflow:"hidden" }}>
      {/* Slides — images uploadées ou gradients par défaut */}
      {(activeSlides || SLIDES).map((slide, i) => (
        <div key={i} style={{
          position:"absolute", inset:0,
          background: activeSlides
            ? `url(${slide}) center/cover no-repeat`
            : slide.bg,
          opacity: i === current ? 1 : 0,
          transition:"opacity 1.2s ease",
          zIndex: i === current ? 1 : 0,
        }}>
          {activeSlides ? (
            <div style={{ position:"absolute", inset:0, background:"rgba(10,10,10,.55)" }}/>
          ) : (
            <div style={{ position:"absolute", inset:0, background:slide.overlay }}/>
          )}
        </div>
      ))}

      {/* Particules décoratifs — cercles lumineux */}
      <div style={{ position:"absolute", inset:0, zIndex:2, pointerEvents:"none", overflow:"hidden" }}>
        {[
          { size:400, top:"-10%", left:"-5%",  color:"rgba(194,24,91,.08)",   delay:"0s" },
          { size:300, top:"60%",  right:"-5%", color:"rgba(201,169,106,.06)", delay:"2s" },
          { size:200, top:"20%",  right:"20%", color:"rgba(194,24,91,.05)",   delay:"1s" },
        ].map((orb,i) => (
          <div key={i} style={{
            position:"absolute", borderRadius:"50%",
            width:orb.size, height:orb.size,
            top:orb.top, left:orb.left, right:orb.right,
            background:`radial-gradient(circle, ${orb.color}, transparent 70%)`,
            animation:`orb 10s ease-in-out infinite`,
            animationDelay:orb.delay,
          }}/>
        ))}
      </div>

      {/* Particules flottantes dorées */}
      <div style={{ position:"absolute", inset:0, zIndex:3, pointerEvents:"none", overflow:"hidden" }}>
        {[
          { size:4, left:"15%",  delay:"0s",   dur:"12s",  color:"rgba(201,169,106,.6)" },
          { size:3, left:"30%",  delay:"2s",   dur:"15s",  color:"rgba(201,169,106,.4)" },
          { size:5, left:"50%",  delay:"4s",   dur:"10s",  color:"rgba(194,24,91,.5)" },
          { size:3, left:"65%",  delay:"1s",   dur:"13s",  color:"rgba(201,169,106,.5)" },
          { size:4, left:"80%",  delay:"3s",   dur:"11s",  color:"rgba(201,169,106,.3)" },
          { size:2, left:"22%",  delay:"6s",   dur:"14s",  color:"rgba(194,24,91,.4)" },
          { size:3, left:"75%",  delay:"5s",   dur:"16s",  color:"rgba(201,169,106,.5)" },
          { size:5, left:"42%",  delay:"7s",   dur:"9s",   color:"rgba(194,24,91,.3)" },
        ].map((p,i) => (
          <div key={i} style={{
            position:"absolute",
            bottom:"-20px",
            left:p.left,
            width:`${p.size}px`,
            height:`${p.size}px`,
            borderRadius:"50%",
            background:p.color,
            animation:`particle ${p.dur} ${p.delay} linear infinite`,
            boxShadow:`0 0 ${p.size*2}px ${p.color}`,
          }}/>
        ))}
      </div>

      {/* Indicateurs de slides */}
      <div style={{
        position:"absolute", bottom:"80px", left:"50%", transform:"translateX(-50%)",
        display:"flex", gap:"8px", zIndex:3,
      }}>
        {(activeSlides || SLIDES).map((_,i) => (
          <button key={i} onClick={() => { setPrev(current); setCurrent(i); }}
            style={{
              width: i===current ? "24px" : "6px",
              height:"6px", borderRadius:"3px",
              background: i===current ? "var(--or)" : "rgba(255,255,255,.25)",
              border:"none", cursor:"pointer",
              transition:"all .4s var(--ease)",
            }}
          />
        ))}
      </div>
    </div>
  );
}


/* ── SÉPARATEUR DORÉ ────────────────────────────────────────── */
function GoldDivider() {
  return (
    <div className="reveal" style={{ display:"flex", alignItems:"center", gap:"16px", padding:"0 24px", maxWidth:"900px", margin:"0 auto" }}>
      <div style={{ flex:1, height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.3))" }}/>
      <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
        <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:"rgba(201,169,106,.4)" }}/>
        <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#C9A96A" }}/>
        <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:"rgba(201,169,106,.4)" }}/>
      </div>
      <div style={{ flex:1, height:"1px", background:"linear-gradient(90deg,rgba(201,169,106,.3),transparent)" }}/>
    </div>
  );
}

function Hero({ get }) {
  const [offset, setOffset] = useState(0);
  useEffect(() => {
    function handleScroll() { setOffset(window.scrollY); }
    window.addEventListener("scroll", handleScroll, { passive:true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <section id="accueil" style={{ position:"relative", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", textAlign:"center", padding:"100px 20px 100px", background:"var(--noir)", overflow:"hidden", color:"var(--blanc)" }}>
      <HeroDiaporama get={get} />

      {/* Contenu au-dessus du diaporama */}
      <div style={{ position:"relative", zIndex:10, display:"flex", flexDirection:"column", alignItems:"center", maxWidth:"900px", width:"100%", transform:`translateY(${offset * 0.25}px)`, transition:"transform .05s linear" }}>

      <p style={{ fontFamily:"var(--ff-b)", fontSize:".66rem", letterSpacing:".28em", textTransform:"uppercase", color:"var(--or)", opacity:.8, marginBottom:"28px", animation:"revealUp .8s both" }}>
        {get("hero_mention","Un programme créé par Prélia Apedo · Fondatrice de White & Black")}
      </p>

      <h1 className="hero-title" style={{ position:"relative", fontFamily:"var(--ff-t)", fontSize:"clamp(2.2rem,8vw,6.5rem)", fontWeight:700, lineHeight:1.06, marginBottom:"24px", animation:"revealUp .9s .15s both" }}>
        <em style={{ fontStyle:"italic", fontWeight:400, background:"linear-gradient(135deg,var(--or),var(--or-light),var(--or))", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmer 4s linear infinite" }}>
          {get("hero_titre","De l'ombre à la lumière en 60 jours.")}
        </em>
      </h1>

      <p className="hero-sub" style={{ position:"relative", fontFamily:"var(--ff-b)", fontWeight:300, fontSize:"clamp(.9rem,3vw,1.12rem)", lineHeight:1.8, color:"rgba(248,245,242,.6)", maxWidth:"600px", marginBottom:"40px", animation:"revealUp .9s .3s both" }}>
        {get("hero_sous_titre","Libérez-vous du regard des autres, révélez votre identité profonde et osez prendre votre place.")}
      </p>

      <div className="btn-group" style={{ position:"relative", display:"flex", flexWrap:"wrap", gap:"16px", justifyContent:"center", animation:"revealUp .9s .45s both", width:"100%", maxWidth:"480px" }}>
        <a href="#formules" className="btn-p" style={{ animation:"pulse-rose 3s ease-in-out infinite" }}>
          {get("hero_btn1","Je rejoins l'aventure")}
        </a>
        <a href="#methode" className="btn-s">{get("hero_btn2","Découvrir le programme")}</a>
      </div>

      </div>{/* fin wrapper contenu */}

      <div style={{ position:"absolute", bottom:"36px", left:"50%", transform:"translateX(-50%)", display:"flex", flexDirection:"column", alignItems:"center", gap:"6px", animation:"revealUp .9s .7s both", zIndex:10 }}>
        <span style={{ fontSize:".58rem", letterSpacing:".22em", textTransform:"uppercase", color:"rgba(201,169,106,.45)" }}>Découvrir</span>
        <div style={{ width:"1px", height:"48px", background:"linear-gradient(to bottom,var(--or),transparent)", animation:"float 2.2s ease-in-out infinite" }}/>
      </div>
    </section>
  );
}

function Probleme({ get }) {
  const frictions = [1,2,3,4,5].map(i => get(`probleme_item${i}`,"")).filter(Boolean);
  return (
    <section className="section-pad" style={{ padding:"90px 24px", background:"linear-gradient(180deg,var(--noir) 0%,#110d09 100%)", color:"var(--blanc)", textAlign:"center" }}>
      <div style={{ maxWidth:"780px", margin:"0 auto" }}>
        <span className="label label-light reveal" style={{ justifyContent:"center" }}>Vous vous reconnaissez ?</span>
        <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.7rem,4vw,2.9rem)", fontWeight:600, lineHeight:1.2, marginBottom:"28px" }}>
          {get("probleme_titre","Et si ce qui vous freine n'était pas un manque d'alignement ?")}
        </h2>
        <p className="reveal" style={{ color:"rgba(248,245,242,.55)", fontWeight:300, maxWidth:"520px", margin:"0 auto 56px" }}>
          {get("probleme_intro","Vous sentez au fond de vous que vous êtes capable de plus.")}
        </p>
        <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:"14px" }}>
          {frictions.slice(0,3).map((f,i) => (
            <li key={i} className="reveal" style={{ transitionDelay:`${i*.1}s` }}>
              <div style={{ display:"flex", alignItems:"center", gap:"16px", padding:"18px 28px", textAlign:"left", background:"rgba(255,255,255,.025)", border:"1px solid rgba(201,169,106,.08)", borderLeft:"3px solid var(--rose)", borderRadius:"2px", fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.8)" }}>
                <span style={{ width:"5px", height:"5px", borderRadius:"50%", background:"var(--rose)", flexShrink:0 }}/>{f}
              </div>
            </li>
          ))}
        </ul>
        <p className="reveal" style={{ marginTop:"52px", fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1.35rem", color:"var(--or)", lineHeight:1.6 }}>
          {get("probleme_citation","Vous n'avez pas besoin de devenir quelqu'un d'autre.")}
        </p>
      </div>
    </section>
  );
}

function Methode({ get }) {
  const pillars = [
    { code:"MÉTA",  weeks:get("meta_semaines","Sem. 1—2"),  color:"var(--rose)", title:get("meta_titre","Transformation intérieure"),  desc:get("meta_desc",""),  bg:"rgba(194,24,91,.06)" },
    { code:"MORPH", weeks:get("morph_semaines","Sem. 3—5"), color:"var(--or)",   title:get("morph_titre","Image et identité révélées"), desc:get("morph_desc",""), bg:"rgba(201,169,106,.06)" },
    { code:"OSE",   weeks:get("ose_semaines","Sem. 6—8"),   color:"#A8C8E0",     title:get("ose_titre","Passage à l'action"),           desc:get("ose_desc",""),   bg:"rgba(168,200,224,.05)" },
  ];
  return (
    <section id="methode" className="section-pad" style={{ padding:"90px 24px", background:"linear-gradient(180deg,#110d09 0%,#18100d 100%)", color:"var(--blanc)" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"72px" }}>
          <span className="label label-light reveal" style={{ justifyContent:"center" }}>La Méthode</span>
          <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:600, lineHeight:1.2 }}>
            {get("methode_titre","Une méthode puissante en 3 étapes pour vous transformer en profondeur.")}
          </h2>
        </div>
        <div className="grid-3" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"20px" }}>
          {pillars.map((p,i) => (
            <div key={i} className="reveal" style={{ transitionDelay:`${i*.15}s`, padding:"44px 34px", background:p.bg, border:`1px solid ${p.color}20`, borderTop:`3px solid ${p.color}`, borderRadius:"4px", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute", bottom:"-12px", right:"16px", fontFamily:"var(--ff-t)", fontSize:"5.5rem", fontWeight:700, color:p.color, opacity:.04, lineHeight:1 }}>{p.code}</div>
              <div style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", fontWeight:600, letterSpacing:".28em", textTransform:"uppercase", color:p.color, marginBottom:"8px" }}>{p.code} · {p.weeks}</div>
              <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.3rem", fontWeight:600, marginBottom:"14px" }}>{p.title}</h3>
              <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.62)", lineHeight:1.78 }}>{p.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Programme({ get }) {
  const semaines = [
    { num:"1–2", phase:"MÉTA",  color:"var(--rose)", label:"Transformation intérieure", items:get("meta_items","").split("|").filter(Boolean)||["Identifier vos blocages","Libérer le regard des autres","Guérir les blessures d'image","Construire une estime solide"] },
    { num:"3",   phase:"MORPH", color:"var(--or)",   label:"Identité visuelle",          items:get("morph_items","").split("|").filter(Boolean)||["Découvrir votre style authentique","Morphologie et colorimétrie","Créer votre signature visuelle"] },
    { num:"4",   phase:"MORPH", color:"var(--or)",   label:"Image alignée",              items:["Aligner intérieur et extérieur","Dresser votre garde-robe idéale","Posture et présence physique"] },
    { num:"5",   phase:"MORPH", color:"var(--or)",   label:"Présence magnétique",        items:["Langage corporel","Développer son charisme","Communication non-verbale"] },
    { num:"6",   phase:"OSE",   color:"#A8C8E0",     label:"S'affirmer",                 items:get("ose_items","").split("|").filter(Boolean)||["Assertivité et leadership","Prendre sa place","Sortir de la zone de confort"] },
    { num:"7",   phase:"OSE",   color:"#A8C8E0",     label:"Discipline & Action",        items:["Méthode Eisenhower","Gestion du temps","Plan d'action concret"] },
    { num:"8",   phase:"OSE",   color:"#A8C8E0",     label:"Incarner sa Méta'Morph'Ose", items:["Intégration finale","Projection vers l'avenir","Célébration de votre transformation"] },
  ];
  const [open, setOpen] = useState(null);

  return (
    <section style={{ padding:"120px 24px" }}>
      <div style={{ maxWidth:"800px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"56px" }}>
          <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"var(--or)", marginBottom:"12px" }}>Le Programme</p>
          <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.6rem,4vw,2.5rem)", fontWeight:600, lineHeight:1.2, marginBottom:"16px" }}>
            {get("programme_titre","8 semaines pour vous révéler")}
          </h2>
        </div>

        {/* Timeline verticale */}
        <div style={{ position:"relative" }}>
          {/* Ligne verticale */}
          <div style={{ position:"absolute", left:"28px", top:"16px", bottom:"16px", width:"2px", background:"linear-gradient(180deg,var(--rose),var(--or),#A8C8E0)", opacity:.3, zIndex:0 }}/>

          {semaines.map((s,i) => (
            <div key={i} className="reveal" style={{ transitionDelay:`${i*.08}s`, display:"flex", gap:"24px", marginBottom:"8px", position:"relative" }}>

              {/* Point de la timeline */}
              <div onClick={()=>setOpen(open===i?null:i)} style={{ width:"58px", height:"58px", borderRadius:"50%", background:open===i?s.color:"rgba(10,10,10,.9)", border:`2px solid ${s.color}`, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", flexShrink:0, cursor:"pointer", transition:"all .35s", zIndex:1, boxShadow:open===i?`0 0 20px ${s.color}40`:"none" }}>
                <span style={{ fontFamily:"var(--ff-b)", fontWeight:700, fontSize:".65rem", color:open===i?"#fff":s.color, lineHeight:1 }}>S{s.num}</span>
                <span style={{ fontFamily:"var(--ff-b)", fontWeight:600, fontSize:".5rem", color:open===i?"rgba(255,255,255,.7)":s.color, letterSpacing:".1em" }}>{s.phase}</span>
              </div>

              {/* Contenu */}
              <div style={{ flex:1, paddingTop:"8px", paddingBottom:"16px" }}>
                <div onClick={()=>setOpen(open===i?null:i)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", cursor:"pointer", marginBottom:open===i?"12px":"0" }}>
                  <p style={{ fontFamily:"var(--ff-b)", fontWeight:600, fontSize:".9rem", color:open===i?s.color:"rgba(248,245,242,.8)", transition:"color .3s" }}>{s.label}</p>
                  <span style={{ color:s.color, fontSize:"1rem", transform:open===i?"rotate(45deg)":"none", transition:"transform .3s" }}>+</span>
                </div>
                <div style={{ overflow:"hidden", maxHeight:open===i?"300px":"0", transition:"max-height .4s ease" }}>
                  {s.items.map((item,j) => (
                    <div key={j} style={{ display:"flex", gap:"10px", padding:"6px 0", borderTop:j===0?`1px solid ${s.color}20`:"none" }}>
                      <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:s.color, flexShrink:0, marginTop:"8px" }}/>
                      <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.6)", lineHeight:1.6 }}>{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Inclus */}
        {get("inclus_items","") && (
          <div className="reveal" style={{ marginTop:"48px", padding:"32px", background:"rgba(201,169,106,.04)", border:"1px solid rgba(201,169,106,.12)", borderRadius:"6px" }}>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--or)", marginBottom:"16px" }}>Inclus dans toutes les formules</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"10px" }}>
              {get("inclus_items","").split("|").filter(Boolean).map((item,i) => (
                <div key={i} style={{ display:"flex", gap:"10px" }}>
                  <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:"var(--or)", flexShrink:0, marginTop:"8px" }}/>
                  <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.65)" }}>{item}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function AvantApres({ get }) {
  const transformations = [1,2,3,4,5].map(i => ({
    avant: get(`aa_avant${i}`,""),
    apres: get(`aa_apres${i}`,""),
  })).filter(t => t.avant && t.apres);

  return (
    <section style={{ padding:"130px 24px", background:"linear-gradient(180deg,#1f1610 0%,#2a1a10 100%)", color:"var(--blanc)" }}>
      <div style={{ maxWidth:"900px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"72px" }}>
          <span className="label label-light reveal" style={{ justifyContent:"center" }}>La Transformation</span>
          <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:600 }}>
            {get("aa_titre","En 8 semaines, passez de la peur à la puissance.")}
          </h2>
          <p className="reveal" style={{ color:"rgba(248,245,242,.5)", fontWeight:300, maxWidth:"520px", margin:"16px auto 0" }}>
            {get("aa_intro","")}
          </p>
        </div>

        <div className="avant-label grid-avant-apres" style={{ display:"grid", gridTemplateColumns:"1fr 40px 1fr", marginBottom:"16px", textAlign:"center" }}>
          <div style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".25em", textTransform:"uppercase", color:"rgba(248,245,242,.3)", paddingBottom:"8px", borderBottom:"1px solid rgba(255,255,255,.05)" }}>Avant</div>
          <div/>
          <div style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".25em", textTransform:"uppercase", color:"var(--or)", paddingBottom:"8px", borderBottom:"1px solid rgba(201,169,106,.2)" }}>Après</div>
        </div>

        {transformations.map((t,i) => (
          <div key={i} className="reveal grid-avant-apres" style={{ transitionDelay:`${i*.08}s`, display:"grid", gridTemplateColumns:"1fr 40px 1fr", alignItems:"center", padding:"16px 0", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
            <div style={{ padding:"14px 18px", background:"rgba(255,255,255,.02)", borderRadius:"2px", fontFamily:"var(--ff-b)", fontSize:".88rem", color:"rgba(248,245,242,.4)", fontWeight:300, fontStyle:"italic" }}>{t.avant}</div>
            <div style={{ textAlign:"center", color:"var(--or)", fontSize:".9rem", fontFamily:"var(--ff-b)" }}>→</div>
            <div style={{ padding:"14px 18px", background:"rgba(201,169,106,.04)", border:"1px solid rgba(201,169,106,.1)", borderRadius:"2px", fontFamily:"var(--ff-b)", fontSize:".88rem", color:"rgba(248,245,242,.88)", fontWeight:400 }}>{t.apres}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function PourQui({ get }) {
  const items    = get("pq_items","").split("|").filter(Boolean);
  const nonItems = get("pq_non_texte","").split("|").filter(Boolean);

  const pourList = items.length > 0 ? items : [
    "Vous vous sentez perdue dans votre identité",
    "Vous manquez de confiance en votre image",
    "Vous voulez arrêter de vous cacher",
    "Vous êtes prête à passer à l'action",
    "Vous voulez être vue et reconnue",
    "Vous aspirez à une transformation durable",
  ];

  const nonList = nonItems.length > 0 ? nonItems : [
    "Vous cherchez des résultats sans effort",
    "Vous n'êtes pas prête à vous remettre en question",
    "Vous voulez juste changer de vêtements",
    "Vous cherchez une solution miracle rapide",
  ];

  return (
    <section style={{ padding:"120px 24px", background:"linear-gradient(180deg,#2a1a10 0%,#3a2518 50%,#2a1a10 100%)", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 40% at 50% 50%,rgba(201,169,106,.06),transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ maxWidth:"1000px", margin:"0 auto", position:"relative" }}>
        <div style={{ textAlign:"center", marginBottom:"56px" }}>
          <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"var(--or)", marginBottom:"12px" }}>Pour qui</p>
          <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.6rem,4vw,2.5rem)", fontWeight:600, lineHeight:1.2 }}>
            {get("pq_titre","Ce programme est fait pour vous ?")}
          </h2>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"24px" }}>

          {/* Colonne POUR */}
          <div className="reveal-left" style={{ padding:"36px 32px", background:"rgba(76,175,80,.05)", border:"1px solid rgba(76,175,80,.2)", borderTop:"3px solid rgba(76,175,80,.6)", borderRadius:"6px" }}>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".2em", textTransform:"uppercase", color:"#4CAF50", marginBottom:"24px", fontWeight:600 }}>
              Ce programme est pour vous si...
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              {pourList.map((item,i) => (
                <div key={i} style={{ display:"flex", gap:"12px", alignItems:"flex-start" }}>
                  <div style={{ width:"20px", height:"20px", borderRadius:"50%", background:"rgba(76,175,80,.15)", border:"1px solid rgba(76,175,80,.4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:"1px" }}>
                    <div style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#4CAF50" }}/>
                  </div>
                  <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.75)", lineHeight:1.6 }}>{item}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Colonne NON POUR */}
          <div className="reveal-right" style={{ padding:"36px 32px", background:"rgba(239,83,80,.04)", border:"1px solid rgba(239,83,80,.15)", borderTop:"3px solid rgba(239,83,80,.4)", borderRadius:"6px" }}>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(239,83,80,.7)", marginBottom:"24px", fontWeight:600 }}>
              {get("pq_non_titre","Ce n'est pas pour vous si...")}
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              {nonList.map((item,i) => (
                <div key={i} style={{ display:"flex", gap:"12px", alignItems:"flex-start" }}>
                  <div style={{ width:"20px", height:"20px", borderRadius:"50%", background:"rgba(239,83,80,.08)", border:"1px solid rgba(239,83,80,.25)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:"1px" }}>
                    <div style={{ width:"8px", height:"1px", background:"rgba(239,83,80,.6)", borderRadius:"1px" }}/>
                  </div>
                  <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.4)", lineHeight:1.6 }}>{item}</p>
                </div>
              ))}
            </div>

            <div style={{ marginTop:"28px", padding:"16px", background:"rgba(201,169,106,.06)", border:"1px solid rgba(201,169,106,.15)", borderRadius:"4px" }}>
              <p style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:".85rem", color:"rgba(201,169,106,.7)", lineHeight:1.65 }}>
                « Méta'Morph'Ose est un engagement, pas une distraction. »
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Prelia({ get }) {
  const certs = get("prelia_certifications","Coach en Image certifiée|Styliste|Leader Oratrice — AIL").split("|").filter(Boolean);
  return (
    <section id="prelia" style={{ padding:"130px 24px", background:"linear-gradient(135deg,#3a2518 0%,#2e1e14 100%)", color:"var(--blanc)" }}>
      <div style={{ maxWidth:"980px", margin:"0 auto" }}>
        <div className="grid-prelia" style={{ display:"grid", gridTemplateColumns:"360px 1fr", gap:"72px", alignItems:"center" }}>
          <div className="reveal-left">
            <div style={{ position:"relative", paddingBottom:"125%", background:"linear-gradient(135deg,rgba(194,24,91,.1),rgba(201,169,106,.08))", border:"1px solid rgba(201,169,106,.18)", borderRadius:"4px", overflow:"hidden" }}>
              {get("photo_prelia","") ? (
                <img src={get("photo_prelia","")} alt="Prélia Apedo"
                  style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }}/>
              ) : (
                <div style={{ position:"absolute", inset:0, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"12px" }}>
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(201,169,106,.35)" }}>Photo Prélia Apedo</p>
                </div>
              )}
              <div style={{ position:"absolute", inset:"14px", border:"1px solid rgba(201,169,106,.08)", borderRadius:"2px", pointerEvents:"none" }}/>
            </div>
            <div style={{ marginTop:"20px", textAlign:"center" }}>
              <p style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1.05rem", color:"var(--or)", opacity:.85 }}>Prélia Apedo</p>
              {get("logo_white_black","") && (
                <img src={get("logo_white_black","")} alt="White & Black"
                  style={{ height:"24px", objectFit:"contain", opacity:.6, marginTop:"8px" }}/>
              )}
              <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".14em", textTransform:"uppercase", color:"rgba(248,245,242,.3)", marginTop:"4px" }}>Fondatrice · White & Black · Meta'Morph'Ose</p>
            </div>
          </div>
          <div className="reveal-right">
            <span className="label label-light" style={{ marginBottom:"20px" }}>La Fondatrice</span>
            <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.6rem,3vw,2.4rem)", fontWeight:600, lineHeight:1.2, marginBottom:"24px" }}>
              {get("prelia_titre","Derrière Méta'Morph'Ose, une femme engagée à révéler l'essence des femmes.")}
            </h2>
            <blockquote style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1.18rem", color:"var(--rose-light)", borderLeft:"2px solid var(--rose)", paddingLeft:"22px", marginBottom:"24px", lineHeight:1.6 }}>
              « {get("prelia_citation","Je sais ce que cela fait de se sentir invisible.")} »
            </blockquote>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.62)", lineHeight:1.82, marginBottom:"18px" }}>{get("prelia_texte1","")}</p>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.62)", lineHeight:1.82, marginBottom:"32px" }}>{get("prelia_texte2","")}</p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", marginBottom:"32px" }}>
              {certs.map((c,i) => (
                <span key={i} style={{ padding:"6px 14px", border:"1px solid rgba(201,169,106,.22)", borderRadius:"100px", fontFamily:"var(--ff-b)", fontSize:".68rem", color:"rgba(201,169,106,.75)", fontWeight:500 }}>{c}</span>
              ))}
            </div>
            <div style={{ display:"flex", gap:"14px", flexWrap:"wrap" }}>
              <a href="#formules" className="btn-p">Rejoindre le programme</a>
              <a href="#faq" className="btn-s">Questions fréquentes</a>
            </div>
          </div>
        </div>
        <div className="reveal" style={{ textAlign:"center", marginTop:"80px" }}>
          <div className="gold-line" style={{ marginBottom:"40px" }}/>
          <p style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1.8rem", color:"var(--or)", lineHeight:1.4 }}>
            {get("prelia_signature","Je ne crée pas des apparences. Je révèle des essences.")}
          </p>
          <p style={{ fontFamily:"var(--ff-b)", fontSize:".68rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(248,245,242,.3)", marginTop:"16px" }}>— Prélia Apedo</p>
        </div>
      </div>
    </section>
  );
}

function Valeurs({ get }) {
  const items = get("valeurs_items","").split("|").filter(Boolean).map(v => {
    const [titre, desc] = v.split(":");
    return { titre, desc };
  });
  return (
    <section style={{ padding:"120px 24px", background:"radial-gradient(ellipse at 50% 100%,rgba(201,169,106,.06),transparent 70%),#2e1e14", color:"var(--blanc)" }}>
      <div style={{ maxWidth:"1000px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"64px" }}>
          <span className="label label-light reveal" style={{ justifyContent:"center" }}>ADN du Programme</span>
          <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.6rem,3.5vw,2.5rem)", fontWeight:600 }}>
            {get("valeurs_titre","Une transformation portée par des valeurs fortes.")}
          </h2>
          {get("valeurs_intro","") && (
            <p className="reveal" style={{ color:"rgba(248,245,242,.5)", fontWeight:300, maxWidth:"560px", margin:"16px auto 0" }}>
              {get("valeurs_intro","")}
            </p>
          )}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))", gap:"20px" }}>
          {items.map((v,i) => (
            <div key={i} className="reveal" style={{ transitionDelay:`${i*.08}s`, padding:"32px 28px", background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.05)", borderRadius:"4px", transition:"all .4s var(--ease)", cursor:"default" }}
              onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(201,169,106,.2)";e.currentTarget.style.background="rgba(201,169,106,.04)";e.currentTarget.style.transform="translateY(-4px)"}}
              onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.05)";e.currentTarget.style.background="rgba(255,255,255,.02)";e.currentTarget.style.transform="none"}}>
              <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.05rem", fontWeight:600, marginBottom:"8px", color:"var(--or)" }}>{v.titre}</h3>
              <p style={{ fontFamily:"var(--ff-b)", fontSize:".85rem", color:"rgba(248,245,242,.5)", fontWeight:300 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Temoignages({ get }) {
  return (
    <section id="temoignages" style={{ padding:"120px 24px", background:"linear-gradient(180deg,#2e1e14 0%,#3a2518 100%)", color:"var(--blanc)", textAlign:"center" }}>
      <div style={{ maxWidth:"700px", margin:"0 auto" }}>
        <span className="label label-light reveal" style={{ justifyContent:"center" }}>Témoignages</span>
        <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.6rem,3.5vw,2.4rem)", fontWeight:600, marginBottom:"24px" }}>
          {get("temo_titre","Elles ont osé. Leur transformation parle d'elle-même.")}
        </h2>
        <p className="reveal" style={{ color:"rgba(248,245,242,.5)", fontWeight:300, lineHeight:1.75, marginBottom:"48px" }}>
          {get("temo_intro","Chaque femme qui entre dans Méta'Morph'Ose entame un chemin de révélation.")}
        </p>
        <div className="reveal" style={{ padding:"48px 40px", background:"rgba(255,255,255,.02)", border:"1px solid rgba(201,169,106,.1)", borderRadius:"4px" }}>
          <p style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1.1rem", color:"rgba(248,245,242,.3)", lineHeight:1.7 }}>
            Les témoignages vidéo et écrits seront intégrés prochainement.<br/>
            <span style={{ fontSize:".8rem" }}>Vous pouvez les ajouter depuis le dashboard admin.</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/* ── PRÉLIA TEASER (version courte) ─────────────────────────── */
function PreliaTeaser({ get }) {
  const certs = get("prelia_certifications","Coach en Image certifiée|Styliste|Leader Oratrice — AIL").split("|").filter(Boolean);
  return (
    <section id="prelia" style={{ padding:"100px 24px", background:"linear-gradient(180deg,#18100d 0%,#2e1e14 100%)", color:"var(--blanc)" }}>
      <div style={{ maxWidth:"980px", margin:"0 auto" }}>
        <div className="grid-prelia" style={{ display:"grid", gridTemplateColumns:"320px 1fr", gap:"64px", alignItems:"center" }}>

          {/* Photo */}
          <div className="reveal-left prelia-photo">
            <div style={{ position:"relative", paddingBottom:"120%", background:"linear-gradient(135deg,rgba(194,24,91,.1),rgba(201,169,106,.08))", border:"1px solid rgba(201,169,106,.18)", borderRadius:"4px", overflow:"hidden" }}>
              {get("photo_prelia","") ? (
                <img src={get("photo_prelia","")} alt="Prélia Apedo" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }}/>
              ) : (
                <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.3)" }}>Photo Prélia Apedo</p>
                </div>
              )}
              <div style={{ position:"absolute", inset:"14px", border:"1px solid rgba(201,169,106,.08)", borderRadius:"2px", pointerEvents:"none" }}/>
            </div>
            <div style={{ textAlign:"center", marginTop:"14px" }}>
              <p style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1rem", color:"var(--or)", opacity:.85 }}>Prélia Apedo</p>
              <p style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", letterSpacing:".12em", textTransform:"uppercase", color:"rgba(248,245,242,.25)", marginTop:"4px" }}>Fondatrice · White & Black · Meta'Morph'Ose</p>
            </div>
          </div>

          {/* Contenu court */}
          <div className="reveal-right">
            <span className="label label-light" style={{ marginBottom:"18px" }}>La Fondatrice</span>
            <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.5rem,3vw,2.2rem)", fontWeight:600, lineHeight:1.2, marginBottom:"20px" }}>
              {get("prelia_titre","Une femme engagée à révéler l'essence des femmes.")}
            </h2>
            <blockquote style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1.1rem", color:"var(--rose-light)", borderLeft:"2px solid var(--rose)", paddingLeft:"20px", marginBottom:"20px", lineHeight:1.6 }}>
              « {get("prelia_citation","Je sais ce que cela fait de se sentir invisible.")} »
            </blockquote>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.58)", lineHeight:1.8, marginBottom:"24px" }}>
              {get("prelia_texte1","").substring(0, 220)}{get("prelia_texte1","").length > 220 ? "…" : ""}
            </p>
            <div style={{ display:"flex", flexWrap:"wrap", gap:"7px", marginBottom:"28px" }}>
              {certs.map((c,i) => (
                <span key={i} style={{ padding:"5px 12px", border:"1px solid rgba(201,169,106,.2)", borderRadius:"100px", fontFamily:"var(--ff-b)", fontSize:".66rem", color:"rgba(201,169,106,.7)", fontWeight:500 }}>{c}</span>
              ))}
            </div>
            <div style={{ display:"flex", gap:"12px", flexWrap:"wrap" }}>
              <Link to="/contact" className="btn-p" style={{ fontSize:".72rem", padding:"13px 28px" }}>Rejoindre le programme</Link>
              <Link to="/a-propos" className="btn-s" style={{ fontSize:".72rem", padding:"12px 24px" }}>Mon histoire complète</Link>
            </div>
          </div>
        </div>

        {/* Citation signature */}
        <div className="reveal" style={{ textAlign:"center", marginTop:"64px" }}>
          <div className="gold-line" style={{ marginBottom:"32px" }}/>
          <p style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1.6rem", color:"var(--or)", lineHeight:1.4 }}>
            {get("prelia_signature","Je ne crée pas des apparences. Je révèle des essences.")}
          </p>
          <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(248,245,242,.25)", marginTop:"12px" }}>— Prélia Apedo</p>
        </div>
      </div>
    </section>
  );
}

function Formules({ get, setShowCalc }) {
  const formules = [
    { code:"F1", label:get("f1_label","Live · Groupe"),      prix:get("f1_prix","65 000"),  color:"#C2185B", items:["2 séances de coaching par semaine","8 semaines d'accompagnement","Exercices pratiques","Groupe WhatsApp privé","7 guides PDF bonus","Club des Métamorphosées"] },
    { code:"F2", label:get("f2_label","Live · Privé"),        prix:get("f2_prix","150 000"), color:"#C9A96A", items:["Accompagnement individuel","Séances personnalisées","Suivi direct avec Prélia","Exercices adaptés","7 guides PDF bonus","Club des Métamorphosées"], featured:true },
    { code:"F3", label:get("f3_label","Présentiel · Groupe"), prix:get("f3_prix","250 000"), color:"#A8C8E0", items:["1 séance présentielle par semaine","8 semaines d'accompagnement","Exercices pratiques","Groupe WhatsApp privé","7 guides PDF bonus","Club des Métamorphosées"] },
    { code:"F4", label:get("f4_label","Présentiel · Privé"),  prix:get("f4_prix","350 000"), color:"#D8C1A0", items:["Séances individuelles en présentiel","Accompagnement personnalisé","Suivi direct avec Prélia","Exercices sur mesure","7 guides PDF bonus","Club des Métamorphosées"] },
  ];
  return (
    <section id="formules" style={{ padding:"90px 24px", background:"linear-gradient(180deg,#3a2518 0%,#6b4028 30%,#c4a882 65%,var(--beige-light) 100%)" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"72px" }}>
          <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.8rem,4vw,2.8rem)", fontWeight:600, lineHeight:1.2, color:"var(--blanc-pur)" }}>
            {get("formules_titre","Choisissez la formule qui correspond à votre transformation.")}
          </h2>
          <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.5)", maxWidth:"520px", margin:"20px auto 0" }}>
            {get("formules_intro","Toutes les formules incluent les 7 bonus exclusifs et l'accès au Club des Métamorphosées.")}
          </p>
          <button onClick={() => setShowCalc(true)} className="reveal btn-s" style={{ margin:"24px auto 0", cursor:"pointer", display:"block" }}>
            Quelle formule me correspond ?
          </button>
        </div>
        <div className="grid-formules" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"20px" }}>
          {formules.map((f,i) => (
            <div key={i} className="reveal formule-card" style={{ transitionDelay:`${i*.12}s`, padding:f.featured?"44px 36px":"36px 32px", background:f.featured?"var(--noir)":"rgba(10,10,10,.75)", border:`1px solid ${f.featured?f.color:"rgba(255,255,255,.08)"}`, borderTop:`3px solid ${f.color}`, borderRadius:"4px", position:"relative", backdropFilter:"blur(10px)", cursor:"default" }}>
              {f.featured && <div style={{ position:"absolute", top:"-1px", right:"24px", background:"var(--or)", color:"var(--noir)", fontFamily:"var(--ff-b)", fontSize:".6rem", fontWeight:700, letterSpacing:".2em", textTransform:"uppercase", padding:"5px 14px", borderRadius:"0 0 4px 4px" }}>Recommandé</div>}
              <div style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", fontWeight:600, letterSpacing:".25em", textTransform:"uppercase", color:f.color, marginBottom:"8px" }}>{f.label}</div>
              <div style={{ marginBottom:"24px" }}>
                <span style={{ fontFamily:"var(--ff-t)", fontSize:"2rem", fontWeight:700, color:"var(--blanc)" }}>{f.prix}</span>
                <span style={{ fontFamily:"var(--ff-b)", fontSize:".75rem", color:"rgba(248,245,242,.4)", marginLeft:"6px" }}>FCFA</span>
              </div>
              <ul style={{ listStyle:"none", display:"flex", flexDirection:"column", gap:"10px", marginBottom:"28px" }}>
                {f.items.map((item,j) => (
                  <li key={j} style={{ display:"flex", gap:"10px", fontFamily:"var(--ff-b)", fontSize:".85rem", fontWeight:300, color:"rgba(248,245,242,.72)" }}>
                    <span style={{ width:"4px", height:"4px", borderRadius:"50%", background:f.color, flexShrink:0, marginTop:"8px" }}/>{item}
                  </li>
                ))}
              </ul>
              <div style={{ fontFamily:"var(--ff-b)", fontSize:".7rem", color:"rgba(248,245,242,.3)", marginBottom:"20px", fontStyle:"italic" }}>Places limitées · Inscriptions par vagues</div>
              <a href="/contact" className={f.featured?"btn-p":"btn-s"} style={{ width:"100%", justifyContent:"center", fontSize:".72rem" }}>
                Je m'inscris — {f.label}
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FAQ({ get }) {
  const [open, setOpen] = useState(null);
  const faqs = [1,2,3,4,5,6].map(i => ({ q:get(`faq_q${i}`,""), r:get(`faq_r${i}`,"") })).filter(f => f.q);
  return (
    <section id="faq" style={{ padding:"120px 24px", background:"linear-gradient(180deg,var(--beige-light) 0%,#f0e8da 100%)", color:"var(--noir)" }}>
      <div style={{ maxWidth:"680px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"56px" }}>
          <span className="label label-dark reveal" style={{ justifyContent:"center" }}>Questions fréquentes</span>
          <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.6rem,3.5vw,2.4rem)", fontWeight:600, color:"var(--noir)" }}>
            {get("faq_titre","Vous vous posez peut-être ces questions…")}
          </h2>
        </div>
        {faqs.map((f,i) => (
          <div key={i} style={{ borderBottom:"1px solid rgba(10,10,10,.08)" }}>
            <button onClick={()=>setOpen(open===i?null:i)} style={{ width:"100%", display:"flex", justifyContent:"space-between", alignItems:"center", padding:"22px 0", background:"none", border:"none", cursor:"pointer", textAlign:"left" }}>
              <span style={{ fontFamily:"var(--ff-b)", fontSize:".92rem", fontWeight:500, color:open===i?"var(--rose)":"rgba(10,10,10,.85)", transition:"color .3s" }}>{f.q}</span>
              <span style={{ color:"var(--rose)", fontSize:"1.2rem", transform:open===i?"rotate(45deg)":"none", transition:"transform .35s", flexShrink:0, marginLeft:"16px" }}>+</span>
            </button>
            <div style={{ overflow:"hidden", maxHeight:open===i?"200px":"0", transition:"max-height .45s var(--ease)" }}>
              <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".88rem", color:"rgba(10,10,10,.6)", lineHeight:1.78, paddingBottom:"20px" }}>{f.r}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}


/* ── LISTE D'ATTENTE ────────────────────────────────────────── */
function ListeAttente({ get }) {
  const [email,   setEmail]   = useState("");
  const [prenom,  setPrenom]  = useState("");
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");
  const placesDispo = parseInt(get("vague_places_total","20")) - parseInt(get("vague_places_prises","0"));
  if (placesDispo > 3) return null;

  async function inscrire(e) {
    e.preventDefault();
    if (!email.trim()) { setError("Veuillez entrer votre email."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/liste-attente/", { method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify({email,prenom}) });
      if (res.ok) setDone(true);
      else setError("Une erreur est survenue.");
    } catch { setError("Serveur inaccessible."); }
    setLoading(false);
  }

  return (
    <section style={{ padding:"80px 24px", background:"rgba(201,169,106,.04)", borderTop:"1px solid rgba(201,169,106,.1)", borderBottom:"1px solid rgba(201,169,106,.1)" }}>
      <div style={{ maxWidth:"560px", margin:"0 auto", textAlign:"center" }}>
        <span className="label label-light reveal" style={{ justifyContent:"center", color:"var(--or)", borderColor:"rgba(201,169,106,.3)" }}>
          {placesDispo <= 0 ? "Vague complète" : `${placesDispo} place${placesDispo>1?"s":""} restante${placesDispo>1?"s":""}`}
        </span>
        <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.4rem,4vw,2rem)", fontWeight:600, marginBottom:"12px" }}>
          {placesDispo <= 0 ? "Cette vague est complète." : "Dernières places disponibles."}
        </h2>
        <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.5)", marginBottom:"28px", lineHeight:1.75 }}>
          Inscrivez-vous sur la liste d'attente et soyez la première informée à l'ouverture de la prochaine vague.
        </p>
        {done ? (
          <div style={{ padding:"24px", background:"rgba(76,175,80,.08)", border:"1px solid rgba(76,175,80,.25)", borderRadius:"6px" }}>
            <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.1rem", color:"#4CAF50", marginBottom:"8px" }}>Vous êtes inscrite !</p>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.55)" }}>Prélia vous contactera en priorité dès l'ouverture.</p>
          </div>
        ) : (
          <form onSubmit={inscrire} style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
              <input value={prenom} onChange={e=>setPrenom(e.target.value)} placeholder="Votre prénom" style={{ padding:"13px 16px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"3px", color:"var(--blanc)", fontFamily:"var(--ff-b)", fontSize:".88rem", fontWeight:300, outline:"none" }}/>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="Votre email *" required style={{ padding:"13px 16px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"3px", color:"var(--blanc)", fontFamily:"var(--ff-b)", fontSize:".88rem", fontWeight:300, outline:"none" }}/>
            </div>
            {error && <p style={{ fontFamily:"var(--ff-b)", fontSize:".78rem", color:"#ef5350" }}>{error}</p>}
            <button type="submit" disabled={loading} style={{ padding:"15px", background:"var(--or)", color:"var(--noir)", border:"none", borderRadius:"3px", fontFamily:"var(--ff-b)", fontWeight:700, fontSize:".75rem", letterSpacing:".15em", textTransform:"uppercase", cursor:loading?"not-allowed":"pointer", opacity:loading?.7:1 }}>
              {loading ? "Inscription..." : "M'inscrire sur la liste d'attente"}
            </button>
          </form>
        )}
      </div>
    </section>
  );
}

/* ── PARTAGE SOCIAL ─────────────────────────────────────────── */
function PartagerSection() {
  const [copied, setCopied] = useState(false);
  const url    = typeof window !== "undefined" ? window.location.origin : "";
  const texte  = encodeURIComponent("Découvrez Méta'Morph'Ose — Programme de transformation féminine");
  const urlEnc = encodeURIComponent(url);
  function copier() { navigator.clipboard.writeText(url); setCopied(true); setTimeout(()=>setCopied(false),2000); }
  const reseaux = [
    { label:"WhatsApp", color:"#25D366", href:`https://wa.me/?text=${texte}%20${urlEnc}` },
    { label:"Facebook", color:"#1877F2", href:`https://www.facebook.com/sharer/sharer.php?u=${urlEnc}` },
    { label:"LinkedIn", color:"#0A66C2", href:`https://www.linkedin.com/sharing/share-offsite/?url=${urlEnc}` },
    { label:"X",        color:"#000",    href:`https://twitter.com/intent/tweet?text=${texte}&url=${urlEnc}` },
  ];
  return (
    <div style={{ padding:"40px 24px", textAlign:"center", borderTop:"1px solid rgba(255,255,255,.04)" }}>
      <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"rgba(248,245,242,.3)", marginBottom:"16px" }}>Partager avec une femme que vous aimez</p>
      <div style={{ display:"flex", gap:"10px", justifyContent:"center", flexWrap:"wrap" }}>
        {reseaux.map((r,i) => (
          <a key={i} href={r.href} target="_blank" rel="noreferrer" style={{ padding:"10px 20px", background:r.color, color:"#fff", borderRadius:"3px", fontFamily:"var(--ff-b)", fontWeight:600, fontSize:".68rem", letterSpacing:".1em", textTransform:"uppercase", textDecoration:"none" }}>
            {r.label}
          </a>
        ))}
        <button onClick={copier} style={{ padding:"10px 20px", background:copied?"rgba(76,175,80,.2)":"rgba(255,255,255,.07)", color:copied?"#4CAF50":"rgba(248,245,242,.5)", border:`1px solid ${copied?"rgba(76,175,80,.3)":"rgba(255,255,255,.1)"}`, borderRadius:"3px", fontFamily:"var(--ff-b)", fontWeight:600, fontSize:".68rem", letterSpacing:".1em", textTransform:"uppercase", cursor:"pointer" }}>
          {copied ? "Lien copié !" : "Copier le lien"}
        </button>
      </div>
    </div>
  );
}


/* ── SECTION RESSOURCES — Chanson + Guide PDF ───────────────── */
function Ressources({ get }) {
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const audioRef = useState(null);
  const ref = { current: null };

  const audioUrl = get("res_audio_url", "/metamorphose.mp3");
  const pdfUrl   = get("res_pdf_url",   "/guide-eisenhower.pdf");

  function togglePlay() {
    if (!ref.current) return;
    if (playing) { ref.current.pause(); setPlaying(false); }
    else { ref.current.play(); setPlaying(true); }
  }

  function onTimeUpdate() {
    if (!ref.current) return;
    const pct = (ref.current.currentTime / ref.current.duration) * 100;
    setProgress(isNaN(pct) ? 0 : pct);
  }

  return (
    <section style={{ padding:"90px 24px", background:"linear-gradient(180deg,#0A0A0A 0%,#110d09 100%)", color:"var(--blanc)" }}>
      <div style={{ maxWidth:"900px", margin:"0 auto" }}>

        {/* Titre section */}
        <div style={{ textAlign:"center", marginBottom:"56px" }}>
          <span className="label label-light reveal" style={{ justifyContent:"center" }}>Cadeaux</span>
          <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:600, lineHeight:1.2 }}>
            {get("res_section_titre","Deux cadeaux pour commencer votre transformation dès maintenant")}
          </h2>
          <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.5)", maxWidth:"520px", margin:"16px auto 0", lineHeight:1.75 }}>
            {get("res_section_desc","Une chanson pour réveiller votre âme. Un guide pour reprendre le contrôle de votre temps.")}
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"24px" }}>

          {/* Chanson */}
          <div className="reveal" style={{ padding:"36px 32px", background:"rgba(194,24,91,.06)", border:"1px solid rgba(194,24,91,.15)", borderTop:"3px solid var(--rose)", borderRadius:"6px" }}>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"var(--rose)", marginBottom:"12px" }}>Chanson</p>
            <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.3rem", fontWeight:600, marginBottom:"6px" }}>
              {get("res_chanson_titre","Métamorphose")}
            </h3>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".75rem", color:"rgba(248,245,242,.4)", marginBottom:"16px" }}>
              {get("res_chanson_artiste","Prélia Apedo")}
            </p>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.55)", lineHeight:1.75, marginBottom:"24px" }}>
              {get("res_chanson_desc","Je ne l'ai pas écrite pour distraire... je l'ai écrite pour réveiller.")}
            </p>

            {/* Lecteur audio */}
            <audio
              ref={el => { ref.current = el; }}
              src={audioUrl}
              onTimeUpdate={onTimeUpdate}
              onEnded={() => { setPlaying(false); setProgress(0); }}
            />
            <div style={{ marginBottom:"16px" }}>
              <div style={{ height:"3px", background:"rgba(255,255,255,.08)", borderRadius:"2px", overflow:"hidden", marginBottom:"8px" }}>
                <div style={{ height:"100%", width:`${progress}%`, background:"var(--rose)", borderRadius:"2px", transition:"width .3s" }}/>
              </div>
            </div>
            <button onClick={togglePlay} style={{ display:"flex", alignItems:"center", gap:"10px", background:"var(--rose)", color:"#fff", border:"none", borderRadius:"3px", padding:"13px 24px", fontFamily:"var(--ff-b)", fontWeight:600, fontSize:".72rem", letterSpacing:".12em", textTransform:"uppercase", cursor:"pointer", transition:"all .3s", width:"100%", justifyContent:"center" }}
              onMouseEnter={e=>e.currentTarget.style.background="#a01049"}
              onMouseLeave={e=>e.currentTarget.style.background="var(--rose)"}>
              {playing ? "Pause" : "Écouter la chanson"}
            </button>
          </div>

          {/* Guide PDF */}
          <div className="reveal" style={{ padding:"36px 32px", background:"rgba(201,169,106,.04)", border:"1px solid rgba(201,169,106,.15)", borderTop:"3px solid var(--or)", borderRadius:"6px" }}>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"var(--or)", marginBottom:"12px" }}>Guide PDF Gratuit</p>
            <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.3rem", fontWeight:600, marginBottom:"6px" }}>
              {get("res_guide_titre","Méthode Eisenhower")}
            </h3>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".75rem", color:"rgba(248,245,242,.4)", marginBottom:"16px" }}>
              {get("res_guide_sous","Pour les femmes ambitieuses")}
            </p>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.55)", lineHeight:1.75, marginBottom:"20px" }}>
              {get("res_guide_desc","Parce qu'une femme qui veut évoluer doit apprendre à reprendre le contrôle de son temps.")}
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"24px" }}>
              {[
                get("res_guide_point1","Prioriser ce qui compte vraiment"),
                get("res_guide_point2","Sortir de la procrastination"),
                get("res_guide_point3","Passer à l'action avec discipline"),
              ].filter(Boolean).map((p,i) => (
                <div key={i} style={{ display:"flex", gap:"10px", alignItems:"flex-start" }}>
                  <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:"var(--or)", flexShrink:0, marginTop:"8px" }}/>
                  <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.65)" }}>{p}</p>
                </div>
              ))}
            </div>
            <a href={pdfUrl} download target="_blank" rel="noreferrer" style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", background:"transparent", color:"var(--or)", border:"1px solid var(--or)", borderRadius:"3px", padding:"13px 24px", fontFamily:"var(--ff-b)", fontWeight:600, fontSize:".72rem", letterSpacing:".12em", textTransform:"uppercase", textDecoration:"none", transition:"all .3s", width:"100%", boxSizing:"border-box" }}
              onMouseEnter={e=>{ e.currentTarget.style.background="var(--or)"; e.currentTarget.style.color="var(--noir)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--or)"; }}>
              Télécharger le guide
            </a>
          </div>

        </div>

        {/* Citation finale */}
        {get("res_citation_finale","") && (
          <div className="reveal" style={{ textAlign:"center", marginTop:"48px" }}>
            <p style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1.2rem", color:"rgba(248,245,242,.4)", lineHeight:1.6 }}>
              « {get("res_citation_finale","")} »
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function CTAFinal({ get }) {
  return (
    <section id="contact" style={{ padding:"100px 24px", background:"linear-gradient(180deg,#f0e8da 0%,var(--blanc) 100%)", textAlign:"center", color:"var(--noir)", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"600px", height:"400px", background:"radial-gradient(ellipse,rgba(194,24,91,.06),transparent 70%)", pointerEvents:"none" }}/>
      <div style={{ position:"relative", maxWidth:"640px", margin:"0 auto" }}>
        <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(2rem,5vw,3.5rem)", fontWeight:700, lineHeight:1.1, color:"var(--noir)", marginBottom:"24px" }}>
          {get("cta_titre","Et si votre transformation commençait aujourd'hui ?")}
        </h2>
        <p className="reveal" style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1.15rem", color:"rgba(10,10,10,.55)", lineHeight:1.75, marginBottom:"48px" }}>
          {get("cta_texte","Vous n'avez pas besoin de devenir une autre femme.")}
        </p>
        <div className="reveal" style={{ display:"flex", gap:"16px", justifyContent:"center", flexWrap:"wrap" }}>
          <a href="#formules" className="btn-p" style={{ padding:"20px 44px", fontSize:".8rem", animation:"pulse-rose 3s ease-in-out infinite" }}>
            {get("cta_btn1","Je rejoins Méta'Morph'Ose")}
          </a>
          <a href="#methode" className="btn-s-dark" style={{ padding:"19px 36px", fontSize:".8rem" }}>
            {get("cta_btn2","Découvrir Méta'Morph'Ose")}
          </a>
        </div>
        <p className="reveal" style={{ marginTop:"32px", fontFamily:"var(--ff-b)", fontSize:".7rem", color:"rgba(10,10,10,.25)", letterSpacing:".1em" }}>
          {get("cta_phrase","Votre renaissance commence ici.")}
        </p>
      </div>
    </section>
  );
}

function Footer({ get }) {
  return (
    <footer style={{ padding:"60px 24px 40px", background:"var(--noir)", borderTop:"1px solid rgba(201,169,106,.1)", color:"var(--blanc)" }}>
      <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
        <div className="grid-footer" style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:"48px", marginBottom:"48px" }}>
          <div>
            <div style={{ marginBottom:"14px", display:"flex", alignItems:"center", gap:"10px" }}>
              {get("logo_site","") && (
                <img src={get("logo_site","")} alt="Logo"
                  style={{ height:"28px", objectFit:"contain" }}/>
              )}
              <span style={{ fontFamily:"var(--ff-t)", fontSize:"1.1rem" }}>
                <span>Meta'</span><span style={{color:"var(--or)"}}>Morph'</span><span style={{color:"var(--rose)"}}>Ose</span>
              </span>
            </div>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".82rem", color:"rgba(248,245,242,.35)", fontWeight:300, lineHeight:1.7, marginBottom:"20px" }}>
              De l'ombre à la lumière en 60 jours. Un programme de transformation féminine par Prélia Apedo.
            </p>
            <div style={{ display:"flex", gap:"14px" }}>
              <Link to="/brunch" style={{ fontFamily:"var(--ff-b)", fontSize:".68rem", letterSpacing:".12em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}
                onMouseEnter={e=>e.target.style.color="var(--or)"} onMouseLeave={e=>e.target.style.color="rgba(201,169,106,.5)"}>Le Brunch</Link>
              <span style={{color:"rgba(255,255,255,.1)"}}>·</span>
              <Link to="/carte-cadeau" style={{ fontFamily:"var(--ff-b)", fontSize:".68rem", letterSpacing:".12em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}
                onMouseEnter={e=>e.target.style.color="var(--or)"} onMouseLeave={e=>e.target.style.color="rgba(201,169,106,.5)"}>Carte Cadeau</Link>
            </div>
          </div>
          <div>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"var(--or)", marginBottom:"18px" }}>Navigation</p>
            {[
              ["#accueil","/",          "Accueil",      false],
              ["/programme","/programme","Programme",    true],
              ["/a-propos","/a-propos",  "À Propos",     true],
              ["/temoignages","/temoignages","Témoignages",true],
              ["#formules","#formules",  "Formules",     false],
              ["/faq","/faq",            "FAQ",          true],
            ].map(([href,to,label,ext]) => (
              <div key={label} style={{ marginBottom:"10px" }}>
                {ext ? (
                  <Link to={to} style={{ fontFamily:"var(--ff-b)", fontSize:".82rem", color:"rgba(248,245,242,.35)", textDecoration:"none", fontWeight:300 }}
                    onMouseEnter={e=>e.target.style.color="var(--blanc)"} onMouseLeave={e=>e.target.style.color="rgba(248,245,242,.35)"}>{label}</Link>
                ) : (
                  <a href={href} style={{ fontFamily:"var(--ff-b)", fontSize:".82rem", color:"rgba(248,245,242,.35)", textDecoration:"none", fontWeight:300 }}
                    onMouseEnter={e=>e.target.style.color="var(--blanc)"} onMouseLeave={e=>e.target.style.color="rgba(248,245,242,.35)"}>{label}</a>
                )}
              </div>
            ))}
          </div>
          <div>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"var(--or)", marginBottom:"18px" }}>Contact</p>
            <div style={{ display:"flex", flexDirection:"column", gap:"10px" }}>
              <a href={`tel:${get("footer_tel1","")}`} style={{ fontFamily:"var(--ff-b)", fontSize:".82rem", color:"rgba(248,245,242,.35)", fontWeight:300, textDecoration:"none" }}>{get("footer_tel1","+229 01 96 11 40 93")}</a>
              <a href={`tel:${get("footer_tel2","")}`} style={{ fontFamily:"var(--ff-b)", fontSize:".82rem", color:"rgba(248,245,242,.35)", fontWeight:300, textDecoration:"none" }}>{get("footer_tel2","+229 01 59 37 65 60")}</a>
              <a href={`mailto:${get("footer_email","")}`} style={{ fontFamily:"var(--ff-b)", fontSize:".82rem", color:"rgba(248,245,242,.35)", fontWeight:300, textDecoration:"none" }}>{get("footer_email","whiteblackdress22@gmail.com")}</a>
            </div>
            <div style={{ marginTop:"24px" }}>
              <Link to="/espace-membre" className="btn-s" style={{ fontSize:".68rem", padding:"10px 20px" }}>Espace Membre</Link>
            </div>
          </div>
        </div>
        <div style={{ borderTop:"1px solid rgba(255,255,255,.04)", paddingTop:"24px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px" }}>
          <p style={{ fontFamily:"var(--ff-b)", fontSize:".7rem", color:"rgba(248,245,242,.18)", fontWeight:300 }}>© 2025 Meta'Morph'Ose · White & Black · Tous droits réservés.</p>
          <p style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:".82rem", color:"rgba(201,169,106,.25)" }}>{get("footer_signature","Je ne crée pas des apparences. Je révèle des essences.")}</p>
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  const scrollProgress = useScrollTheme();
  const [showDiag, setShowDiag] = useState(false);
  const [authTab,  setAuthTab]  = useState(null);
  const { get, loaded } = useSiteContent();
  useReveal();

  const [showCalc, setShowCalc] = useState(false);

  return (
    <>
      <style>{STYLES}</style>
      <Navbar scrollProgress={scrollProgress} onAuthOpen={(tab) => setAuthTab(tab)} get={get} />
      {authTab && <AuthModal defaultTab={authTab} onClose={() => setAuthTab(null)} />}
      {showCalc && <CalculateurFormule onClose={() => setShowCalc(false)} />}

      {/* Bouton Test Diagnostic */}
      <button onClick={() => setShowDiag(true)} style={{ position:"fixed", bottom:"20px", right:"16px", zIndex:150, background:"var(--rose)", color:"#fff", fontFamily:"var(--ff-b)", fontSize:".62rem", fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", padding:"12px 18px", border:"none", borderRadius:"100px", cursor:"pointer", boxShadow:"0 8px 30px rgba(194,24,91,.45)", animation:"pulse-rose 3s ease-in-out infinite", maxWidth:"calc(100vw - 32px)" }}>
        {get("diag_btn","Test Diagnostic")}
      </button>

      {/* WhatsApp flottant */}
      <WhatsAppButton get={get} />

      {showDiag && (
        <div style={{ position:"fixed", inset:0, zIndex:500, background:"rgba(10,10,10,.92)", backdropFilter:"blur(12px)", display:"flex", alignItems:"flex-start", justifyContent:"center", padding:"16px", overflowY:"auto" }}
          onClick={e => { if(e.target===e.currentTarget) setShowDiag(false); }}>
          <div style={{ maxWidth:"680px", width:"100%", position:"relative", marginTop:"20px", marginBottom:"20px" }}>
            <button onClick={() => setShowDiag(false)} style={{ position:"absolute", top:"-40px", right:"0", background:"none", border:"none", color:"rgba(201,169,106,.6)", fontSize:".85rem", cursor:"pointer", fontFamily:"var(--ff-b)", letterSpacing:".1em", textTransform:"uppercase" }}>Fermer</button>
            <DiagnosticTest theme="dark" onComplete={(score) => { if(score>=4) setTimeout(()=>setShowDiag(false),3000); }} />
          </div>
        </div>
      )}

      <main>
        <Hero get={get} />
        <GoldDivider />
        <VagueSection get={get} />
        <StatsSection get={get} />
        <GoldDivider />
        <Probleme get={get} />
        <GoldDivider />
        <Methode get={get} />
        <GoldDivider />
        <PreliaTeaser get={get} />
        <GoldDivider />
        <Formules get={get} setShowCalc={setShowCalc} />
        <ListeAttente get={get} />
        <Ressources get={get} />
        <CTAFinal get={get} />
        <PartagerSection />
      </main>
      <Footer get={get} />
    </>
  );
}
