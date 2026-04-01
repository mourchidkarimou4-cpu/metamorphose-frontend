import { useState, useEffect } from "react";

/* ================================================================
   DiagnosticTest — Composant autonome réutilisable
   Usage : <DiagnosticTest theme="dark" onComplete={(score) => ...} />
   theme : "dark" (fond noir) | "light" (fond beige)
   ================================================================ */

const QUESTIONS = [
  {
    id: 1,
    text: "Avez-vous parfois l'impression de ne pas être pleinement vous-même à cause du regard ou du jugement des autres ?",
    tag: "Regard des autres",
  },
  {
    id: 2,
    text: "Ressentez-vous un manque de confiance en vous qui vous empêche de vous affirmer ou de prendre certaines opportunités ?",
    tag: "Confiance en soi",
  },
  {
    id: 3,
    text: "Avez-vous le sentiment que votre potentiel est beaucoup plus grand que la vie que vous vivez actuellement ?",
    tag: "Potentiel inexploité",
  },
  {
    id: 4,
    text: "Avez-vous parfois l'impression de vous être oubliée en voulant répondre aux attentes de la société, de votre entourage ou de votre famille ?",
    tag: "S'oublier pour les autres",
  },
  {
    id: 5,
    text: "Ressentez-vous le besoin d'être accompagnée pour révéler votre confiance, votre image et votre vraie identité ?",
    tag: "Besoin d'accompagnement",
  },
  {
    id: 6,
    text: "Sentez-vous au fond de vous que le moment est venu de sortir de l'ombre et de révéler la femme que vous êtes réellement ?",
    tag: "Appel intérieur",
  },
];

const INTERPRETATIONS = [
  {
    min: 0, max: 1,
    titre: "Vous êtes déjà bien alignée.",
    sousTitre: "Le moment n'est peut-être pas encore là.",
    message: "Vous semblez avoir une bonne connexion avec vous-même. Revenez consulter le programme lorsque vous sentirez un appel au changement.",
    couleur: "#A8C8E0",
    cta1: { label: "Découvrir le programme", href: "#methode" },
    cta2: null,
  },
  {
    min: 2, max: 3,
    titre: "Quelque chose vous appelle.",
    sousTitre: "Les premiers signaux sont là.",
    message: "Vous ressentez ponctuellement ce décalage entre la femme que vous êtes et celle que vous montrez. Le programme Méta'Morph'Ose pourrait être une belle exploration pour vous.",
    couleur: "#C9A96A",
    cta1: { label: "Explorer le programme", href: "#methode" },
    cta2: { label: "Voir les formules", href: "#formules" },
  },
  {
    min: 4, max: 5,
    titre: "Votre transformation est nécessaire.",
    sousTitre: "L'appel intérieur est fort.",
    message: "Il est très probable que vous soyez exactement à l'étape où une transformation profonde vous attend. Le programme Méta'Morph'Ose a été conçu pour vous.",
    couleur: "#C2185B",
    cta1: { label: "Je commence ma Méta'Morph'Ose", href: "#formules" },
    cta2: { label: "Voir les formules & coûts", href: "#formules" },
  },
  {
    min: 6, max: 6,
    titre: "Vous êtes prête. Complètement.",
    sousTitre: "Chaque réponse confirme votre appel.",
    message: "Vous avez répondu oui à toutes les questions. La transformation ne vous attend plus — c'est vous qui l'attendiez. Il est temps. Maintenant.",
    couleur: "#C2185B",
    cta1: { label: " Je rejoins Méta'Morph'Ose", href: "#formules" },
    cta2: { label: "Voir les formules", href: "#formules" },
  },
];

function getInterpretation(score) {
  return INTERPRETATIONS.find(i => score >= i.min && score <= i.max);
}

const STYLES = `
  @keyframes diagFadeUp {
    from { opacity:0; transform:translateY(24px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes diagScaleIn {
    from { opacity:0; transform:scale(.92); }
    to   { opacity:1; transform:scale(1); }
  }
  @keyframes progressFill {
    from { width: 0%; }
    to   { width: var(--target-width); }
  }
  @keyframes resultPop {
    0%   { opacity:0; transform:scale(.85) translateY(20px); }
    70%  { transform:scale(1.03) translateY(-4px); }
    100% { opacity:1; transform:scale(1) translateY(0); }
  }
  .diag-btn-yes {
    flex:1; padding:12px 20px;
    border:1px solid rgba(194,24,91,.3);
    border-radius:3px; background:transparent;
    color:rgba(248,245,242,.5);
    font-family:'Montserrat',sans-serif; font-weight:500;
    font-size:.72rem; letter-spacing:.14em; text-transform:uppercase;
    cursor:pointer; transition:all .25s;
  }
  .diag-btn-yes.selected, .diag-btn-yes:hover {
    background:#C2185B; border-color:#C2185B;
    color:#fff; transform:translateY(-1px);
    box-shadow:0 6px 20px rgba(194,24,91,.35);
  }
  .diag-btn-no {
    flex:1; padding:12px 20px;
    border:1px solid rgba(255,255,255,.1);
    border-radius:3px; background:transparent;
    color:rgba(248,245,242,.4);
    font-family:'Montserrat',sans-serif; font-weight:500;
    font-size:.72rem; letter-spacing:.14em; text-transform:uppercase;
    cursor:pointer; transition:all .25s;
  }
  .diag-btn-no.selected, .diag-btn-no:hover {
    background:rgba(255,255,255,.08); border-color:rgba(255,255,255,.3);
    color:rgba(248,245,242,.8);
  }
  .diag-q-card {
    padding:28px 32px;
    border-radius:4px; transition:all .3s;
    animation: diagFadeUp .5s both;
  }
  .diag-q-card.answered-yes {
    border-color:rgba(194,24,91,.35) !important;
    background:rgba(194,24,91,.06) !important;
  }
  .diag-q-card.answered-no {
    border-color:rgba(255,255,255,.08) !important;
    opacity:.75;
  }

  @media(max-width:600px){
    .diag-container{padding:24px 18px !important}
    .diag-title{font-size:1.3rem !important}
    .diag-options{gap:8px !important}
    .diag-option{padding:12px 14px !important;font-size:.78rem !important}
    .diag-nav{flex-direction:column !important;gap:10px !important}
    .diag-nav button{width:100% !important}
  }
  @media(max-width:400px){
    .diag-container{padding:18px 14px !important}
  }
`;

export default function DiagnosticTest({ theme = "dark", onComplete = null, compact = false }) {
  const isDark = theme === "dark";

  const bg        = isDark ? "#141414"                   : "#fff";
  const border    = isDark ? "rgba(201,169,106,.12)"     : "rgba(10,10,10,.1)";
  const textMain  = isDark ? "#F8F5F2"                   : "#0A0A0A";
  const textSub   = isDark ? "rgba(248,245,242,.55)"     : "rgba(10,10,10,.5)";
  const cardBg    = isDark ? "rgba(255,255,255,.025)"    : "rgba(10,10,10,.025)";
  const cardBorder= isDark ? "rgba(255,255,255,.07)"     : "rgba(10,10,10,.08)";

  const [answers, setAnswers]     = useState({});   // { 0: "oui"|"non", ... }
  const [step, setStep]           = useState(0);    // 0=intro, 1=questions, 2=résultat
  const [currentQ, setCurrentQ]   = useState(0);   // index question active (mode step-by-step)
  const [mode, setMode]           = useState("all"); // "all" | "step"
  const [score, setScore]         = useState(0);
  const [interp, setInterp]       = useState(null);
  const [saved, setSaved]         = useState(false);

  // Charger un résultat précédent
  useEffect(() => {
    const prev = localStorage.getItem("mmorphose_diagnostic");
    if (prev) {
      const { score, answers, date } = JSON.parse(prev);
      const daysSince = (Date.now() - date) / (1000 * 60 * 60 * 24);
      if (daysSince < 30) {
        setAnswers(answers);
        setScore(score);
        setInterp(getInterpretation(score));
        setSaved(true);
        setStep(2);
      }
    }
  }, []);

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / QUESTIONS.length) * 100;

  function answer(index, value) {
    const newAnswers = { ...answers, [index]: value };
    setAnswers(newAnswers);
    // En mode step : avancer auto à la question suivante
    if (mode === "step" && index === currentQ && currentQ < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentQ(i => i + 1), 350);
    }
  }

  function submit() {
    const s = Object.values(answers).filter(v => v === "oui").length;
    const i = getInterpretation(s);
    setScore(s);
    setInterp(i);
    // Sauvegarder
    localStorage.setItem("mmorphose_diagnostic", JSON.stringify({
      score: s, answers, date: Date.now()
    }));
    setStep(2);
    if (onComplete) onComplete(s);
  }

  function restart() {
    setAnswers({});
    setScore(0);
    setInterp(null);
    setStep(1);
    setCurrentQ(0);
    setSaved(false);
    localStorage.removeItem("mmorphose_diagnostic");
  }

  // ── INTRO ──────────────────────────────────────────────────
  if (step === 0) return (
    <>
      <style>{STYLES}</style>
      <div className="diag-container" style={{
        background:bg, border:`1px solid ${border}`, borderRadius:"6px",
        padding: compact ? "24px 20px" : "40px 36px",
        animation:"diagScaleIn .5s both",
        fontFamily:"'Montserrat',sans-serif",
        width:"100%",
      }}>
        <div style={{ textAlign:"center", marginBottom:"36px" }}>
          <p style={{ fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"12px" }}>
            Test Diagnostique
          </p>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.2rem,4vw,1.75rem)", fontWeight:600, color:textMain, marginBottom:"12px", lineHeight:1.2 }}>
            Êtes-vous prête pour votre<br/>
            <em style={{ color:"#C9A96A", fontStyle:"italic" }}>Méta'Morph'Ose ?</em>
          </h3>
          <p style={{ fontWeight:300, fontSize:".88rem", color:textSub, lineHeight:1.75, maxWidth:"440px", margin:"0 auto" }}>
            6 questions pour savoir si vous êtes à l'étape d'une transformation profonde. Répondez honnêtement — il n'y a pas de mauvaise réponse.
          </p>
        </div>

        {/* Choisir le mode */}
        <div style={{ display:"flex", gap:"14px", marginBottom:"28px" }}>
          {[
            { id:"all",  label:"Toutes les questions", desc:"Répondez à votre rythme" },
            { id:"step", label:"Une par une",           desc:"Mode guidé pas à pas" },
          ].map(m => (
            <button key={m.id} onClick={()=>setMode(m.id)} style={{
              flex:1, padding:"18px 16px",
              background: mode===m.id ? "rgba(194,24,91,.08)" : cardBg,
              border:`1px solid ${mode===m.id ? "rgba(194,24,91,.4)" : cardBorder}`,
              borderRadius:"4px", cursor:"pointer", textAlign:"center",
              transition:"all .25s",
            }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:500, fontSize:".8rem", color: mode===m.id ? "#C2185B" : textMain, marginBottom:"4px" }}>{m.label}</p>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".72rem", color:textSub }}>{m.desc}</p>
            </button>
          ))}
        </div>

        <button onClick={()=>setStep(1)} style={{
          width:"100%", padding:"16px",
          background:"#C2185B", color:"#fff", border:"none", borderRadius:"3px",
          fontFamily:"'Montserrat',sans-serif", fontWeight:600, fontSize:".75rem",
          letterSpacing:".16em", textTransform:"uppercase", cursor:"pointer",
          transition:"all .3s",
        }}
        onMouseEnter={e=>e.target.style.background="#a01049"}
        onMouseLeave={e=>e.target.style.background="#C2185B"}
        >
          Commencer le test 
        </button>
      </div>
    </>
  );

  // ── QUESTIONS ──────────────────────────────────────────────
  if (step === 1) return (
    <>
      <style>{STYLES}</style>
      <div style={{
        background:bg, border:`1px solid ${border}`, borderRadius:"6px",
        padding: compact ? "28px 24px" : "44px 40px",
        fontFamily:"'Montserrat',sans-serif",
      }}>
        {/* Header + progress */}
        <div style={{ marginBottom:"32px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
            <p style={{ fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:"#C9A96A" }}>
              Test Diagnostique
            </p>
            <p style={{ fontSize:".72rem", fontWeight:500, color:textSub }}>
              <span style={{ color:"#C2185B", fontWeight:600 }}>{answeredCount}</span> / {QUESTIONS.length} réponses
            </p>
          </div>
          {/* Barre de progression */}
          <div style={{ height:"3px", background: isDark ? "rgba(255,255,255,.06)" : "rgba(10,10,10,.07)", borderRadius:"2px", overflow:"hidden" }}>
            <div style={{
              height:"100%", borderRadius:"2px",
              background:"linear-gradient(90deg,#C2185B,#C9A96A)",
              width:`${progress}%`, transition:"width .4s var(--ease)",
            }}/>
          </div>
          {/* Indicateurs par question */}
          <div style={{ display:"flex", gap:"6px", marginTop:"10px" }}>
            {QUESTIONS.map((_,i) => (
              <div key={i} style={{
                flex:1, height:"4px", borderRadius:"2px",
                background: answers[i] === "oui" ? "#C2185B"
                          : answers[i] === "non" ? (isDark ? "rgba(255,255,255,.2)" : "rgba(10,10,10,.2)")
                          : (isDark ? "rgba(255,255,255,.06)" : "rgba(10,10,10,.06)"),
                transition:"background .3s",
                cursor: mode==="step" ? "pointer" : "default",
              }} onClick={()=>{ if(mode==="step") setCurrentQ(i); }}/>
            ))}
          </div>
        </div>

        {/* Questions */}
        {mode === "all" ? (
          // Mode tout afficher
          <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
            {QUESTIONS.map((q, i) => (
              <div key={i}
                className={`diag-q-card ${answers[i]==="oui"?"answered-yes":answers[i]==="non"?"answered-no":""}`}
                style={{
                  background:cardBg, border:`1px solid ${cardBorder}`,
                  animationDelay:`${i*.06}s`,
                }}>
                <div style={{ display:"flex", gap:"12px", alignItems:"flex-start", marginBottom:"16px" }}>
                  <span style={{
                    background: answers[i]==="oui" ? "#C2185B" : isDark ? "rgba(255,255,255,.06)" : "rgba(10,10,10,.06)",
                    color: answers[i]==="oui" ? "#fff" : textSub,
                    borderRadius:"50%", width:"24px", height:"24px", flexShrink:0,
                    display:"flex", alignItems:"center", justifyContent:"center",
                    fontSize:".65rem", fontWeight:700, transition:"all .3s",
                  }}>{i+1}</span>
                  <div>
                    <p style={{ fontSize:".6rem", letterSpacing:".18em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"6px", opacity:.7 }}>{q.tag}</p>
                    <p style={{ fontWeight:300, fontSize:".88rem", color:textMain, lineHeight:1.68 }}>{q.text}</p>
                  </div>
                </div>
                <div style={{ display:"flex", gap:"10px", paddingLeft:"36px" }}>
                  <button className={`diag-btn-yes${answers[i]==="oui"?" selected":""}`} onClick={()=>answer(i,"oui")}>Oui</button>
                  <button className={`diag-btn-no${answers[i]==="non"?" selected":""}`} onClick={()=>answer(i,"non")}>Non</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          // Mode step-by-step
          <div>
            {/* Navigation questions */}
            <div style={{ display:"flex", gap:"8px", marginBottom:"24px", flexWrap:"wrap" }}>
              {QUESTIONS.map((_,i) => (
                <button key={i} onClick={()=>setCurrentQ(i)} style={{
                  width:"32px", height:"32px", borderRadius:"50%",
                  border:`1px solid ${i===currentQ ? "#C2185B" : answers[i] ? "transparent" : (isDark?"rgba(255,255,255,.1)":"rgba(10,10,10,.1)")}`,
                  background: i===currentQ ? "#C2185B" : answers[i]==="oui" ? "rgba(194,24,91,.2)" : answers[i]==="non" ? (isDark?"rgba(255,255,255,.06)":"rgba(10,10,10,.05)") : "transparent",
                  color: i===currentQ ? "#fff" : textSub,
                  fontFamily:"'Montserrat',sans-serif", fontSize:".72rem", fontWeight:600,
                  cursor:"pointer", transition:"all .25s",
                }}>{i+1}</button>
              ))}
            </div>

            {/* Question active */}
            <div key={currentQ} style={{
              padding:"32px", background:cardBg,
              border:`1px solid ${answers[currentQ]==="oui"?"rgba(194,24,91,.35)":cardBorder}`,
              borderRadius:"4px", marginBottom:"20px",
              animation:"diagFadeUp .4s both",
            }}>
              <p style={{ fontSize:".6rem", letterSpacing:".18em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"10px", opacity:.7 }}>
                Question {currentQ+1} · {QUESTIONS[currentQ].tag}
              </p>
              <p style={{ fontWeight:300, fontSize:"1rem", color:textMain, lineHeight:1.72, marginBottom:"24px" }}>
                {QUESTIONS[currentQ].text}
              </p>
              <div style={{ display:"flex", gap:"12px" }}>
                <button className={`diag-btn-yes${answers[currentQ]==="oui"?" selected":""}`} onClick={()=>answer(currentQ,"oui")} style={{ flex:"none", padding:"14px 36px" }}>
                  Oui
                </button>
                <button className={`diag-btn-no${answers[currentQ]==="non"?" selected":""}`} onClick={()=>answer(currentQ,"non")} style={{ flex:"none", padding:"14px 36px" }}>
                  Non
                </button>
              </div>
            </div>

            {/* Nav précédent/suivant */}
            <div style={{ display:"flex", justifyContent:"space-between" }}>
              <button onClick={()=>setCurrentQ(i=>Math.max(0,i-1))} disabled={currentQ===0} style={{
                background:"none", border:`1px solid ${isDark?"rgba(255,255,255,.1)":"rgba(10,10,10,.1)"}`,
                borderRadius:"3px", padding:"10px 20px", cursor:currentQ===0?"not-allowed":"pointer",
                fontFamily:"'Montserrat',sans-serif", fontSize:".7rem", color:textSub,
                opacity:currentQ===0?.3:1, transition:"all .25s",
              }}> Précédent</button>
              {currentQ < QUESTIONS.length-1 ? (
                <button onClick={()=>setCurrentQ(i=>Math.min(QUESTIONS.length-1,i+1))} style={{
                  background:"none", border:`1px solid ${isDark?"rgba(255,255,255,.1)":"rgba(10,10,10,.1)"}`,
                  borderRadius:"3px", padding:"10px 20px", cursor:"pointer",
                  fontFamily:"'Montserrat',sans-serif", fontSize:".7rem", color:textSub, transition:"all .25s",
                }}>Suivant </button>
              ) : null}
            </div>
          </div>
        )}

        {/* Bouton soumettre */}
        {answeredCount === QUESTIONS.length && (
          <div style={{ textAlign:"center", marginTop:"28px", animation:"diagFadeUp .5s both" }}>
            <p style={{ fontWeight:300, fontSize:".8rem", color:textSub, marginBottom:"16px" }}>
              Vous avez répondu à toutes les questions. 
            </p>
            <button onClick={submit} style={{
              background:"#C2185B", color:"#fff", border:"none", borderRadius:"3px",
              fontFamily:"'Montserrat',sans-serif", fontWeight:600, fontSize:".76rem",
              letterSpacing:".16em", textTransform:"uppercase",
              padding:"18px 44px", cursor:"pointer", transition:"all .3s",
              boxShadow:"0 8px 30px rgba(194,24,91,.4)",
            }}
            onMouseEnter={e=>{ e.target.style.background="#a01049"; e.target.style.transform="translateY(-2px)"; }}
            onMouseLeave={e=>{ e.target.style.background="#C2185B"; e.target.style.transform="none"; }}
            >
              Voir mon résultat 
            </button>
          </div>
        )}
      </div>
    </>
  );

  // ── RÉSULTAT ───────────────────────────────────────────────
  if (step === 2 && interp) return (
    <>
      <style>{STYLES}</style>
      <div style={{
        background:bg, border:`1px solid ${border}`, borderRadius:"6px",
        padding: compact ? "36px 28px" : "52px 44px",
        textAlign:"center", fontFamily:"'Montserrat',sans-serif",
        animation:"diagScaleIn .6s both",
      }}>
        {saved && (
          <p style={{ fontSize:".62rem", letterSpacing:".18em", textTransform:"uppercase", color:textSub, marginBottom:"20px" }}>
            Résultat précédent retrouvé
          </p>
        )}

        {/* Score visuel */}
        <div style={{ position:"relative", display:"inline-block", marginBottom:"28px" }}>
          {/* Cercle extérieur */}
          <svg width="110" height="110" style={{ transform:"rotate(-90deg)" }}>
            <circle cx="55" cy="55" r="48" fill="none" stroke={isDark?"rgba(255,255,255,.06)":"rgba(10,10,10,.06)"} strokeWidth="4"/>
            <circle cx="55" cy="55" r="48" fill="none" stroke={interp.couleur} strokeWidth="4"
              strokeDasharray={`${(score/6)*301.6} 301.6`}
              strokeLinecap="round"
              style={{ transition:"stroke-dasharray 1.2s var(--ease)" }}
            />
          </svg>
          <div style={{
            position:"absolute", inset:0, display:"flex",
            flexDirection:"column", alignItems:"center", justifyContent:"center",
          }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.8rem", fontWeight:700, color:interp.couleur, lineHeight:1 }}>{score}</span>
            <span style={{ fontSize:".6rem", color:textSub, marginTop:"2px" }}>/ 6</span>
          </div>
        </div>

        {/* Récap réponses */}
        <div style={{ display:"flex", justifyContent:"center", gap:"6px", marginBottom:"24px", flexWrap:"wrap" }}>
          {QUESTIONS.map((_,i) => (
            <div key={i} title={QUESTIONS[i].tag} style={{
              width:"28px", height:"6px", borderRadius:"3px",
              background: answers[i]==="oui" ? interp.couleur : isDark?"rgba(255,255,255,.1)":"rgba(10,10,10,.1)",
              transition:"background .3s",
            }}/>
          ))}
        </div>

        <p style={{ fontSize:".6rem", letterSpacing:".22em", textTransform:"uppercase", color:interp.couleur, marginBottom:"10px" }}>
          {interp.sousTitre}
        </p>
        <h3 style={{
          fontFamily:"'Playfair Display',serif", fontSize:"1.7rem", fontWeight:600,
          color:textMain, marginBottom:"18px", lineHeight:1.2,
        }}>
          {interp.titre}
        </h3>
        <p style={{ fontWeight:300, fontSize:".9rem", color:textSub, lineHeight:1.8, maxWidth:"480px", margin:"0 auto 32px" }}>
          {interp.message}
        </p>

        {/* Citation si score élevé */}
        {score >= 4 && (
          <p style={{
            fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic",
            fontSize:"1.1rem", color: isDark?"rgba(201,169,106,.7)":"rgba(10,10,10,.45)",
            marginBottom:"32px", lineHeight:1.6,
          }}>
            La transformation commence toujours par une prise de conscience.<br/>
            <span style={{ color:interp.couleur }}>Et la vôtre pourrait commencer aujourd'hui.</span>
          </p>
        )}

        {/* CTAs */}
        <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap", marginBottom:"24px" }}>
          <a href={interp.cta1.href} style={{
            display:"inline-flex", alignItems:"center", gap:"8px",
            background:"#C2185B", color:"#fff",
            fontFamily:"'Montserrat',sans-serif", fontWeight:600, fontSize:".74rem",
            letterSpacing:".14em", textTransform:"uppercase",
            padding:"15px 30px", borderRadius:"3px", textDecoration:"none",
            transition:"all .3s",
            boxShadow: score>=4 ? "0 8px 28px rgba(194,24,91,.4)" : "none",
          }}
          onMouseEnter={e=>{ e.currentTarget.style.background="#a01049"; e.currentTarget.style.transform="translateY(-2px)"; }}
          onMouseLeave={e=>{ e.currentTarget.style.background="#C2185B"; e.currentTarget.style.transform="none"; }}
          >
            {interp.cta1.label}
          </a>
          {interp.cta2 && (
            <a href={interp.cta2.href} style={{
              display:"inline-flex", alignItems:"center",
              background:"transparent", color: isDark?"#C9A96A":"rgba(10,10,10,.6)",
              fontFamily:"'Montserrat',sans-serif", fontWeight:500, fontSize:".74rem",
              letterSpacing:".14em", textTransform:"uppercase",
              padding:"14px 28px", borderRadius:"3px", textDecoration:"none",
              border:`1px solid ${isDark?"rgba(201,169,106,.35)":"rgba(10,10,10,.2)"}`,
              transition:"all .3s",
            }}
            onMouseEnter={e=>{ e.currentTarget.style.background=isDark?"rgba(201,169,106,.08)":"rgba(10,10,10,.05)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; }}
            >
              {interp.cta2.label}
            </a>
          )}
        </div>

        {/* Refaire le test */}
        <button onClick={restart} style={{
          background:"none", border:"none", cursor:"pointer",
          fontFamily:"'Montserrat',sans-serif", fontSize:".68rem",
          color:textSub, letterSpacing:".1em", textDecoration:"underline",
          textUnderlineOffset:"3px", opacity:.5, transition:"opacity .3s",
        }}
        onMouseEnter={e=>e.target.style.opacity=1}
        onMouseLeave={e=>e.target.style.opacity=.5}
        >
          Refaire le test
        </button>
      </div>
    </>
  );

  return null;
}
