import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

// ── STYLES ──────────────────────────────────────────────────────────────────
const STYLES = `
  @keyframes aura-in    { from{opacity:0;transform:translateY(20px) scale(.96)} to{opacity:1;transform:none} }
  @keyframes aura-msg   { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  @keyframes aura-dot   { 0%,80%,100%{transform:translateY(0);opacity:.35} 40%{transform:translateY(-5px);opacity:1} }
  @keyframes aura-pulse { 0%,100%{box-shadow:0 0 0 0 rgba(194,24,91,.35)} 60%{box-shadow:0 0 0 10px rgba(194,24,91,0)} }
  @keyframes aura-prog  { from{width:0} to{width:100%} }
  @keyframes aura-fab-in{ from{opacity:0;transform:scale(.7)} to{opacity:1;transform:scale(1)} }

  .aura-fab {
    position:fixed; bottom:28px; right:28px; z-index:9000;
    width:58px; height:58px; border-radius:50%;
    background:linear-gradient(135deg,#C2185B,#8b0f3f);
    border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 4px 24px rgba(194,24,91,.4);
    animation:aura-fab-in .4s cubic-bezier(.16,1,.3,1) both, aura-pulse 2.8s ease-in-out 1s infinite;
    transition:transform .2s;
  }
  .aura-fab:hover { transform:scale(1.08); }

  .aura-window {
    position:fixed; bottom:100px; right:28px; z-index:9000;
    width:360px; max-width:calc(100vw - 40px);
    background:#fff; border-radius:20px;
    box-shadow:0 24px 80px rgba(0,0,0,.18), 0 4px 16px rgba(194,24,91,.08);
    display:flex; flex-direction:column; overflow:hidden;
    animation:aura-in .4s cubic-bezier(.16,1,.3,1) both;
    font-family:'Montserrat',sans-serif;
    max-height:calc(100vh - 140px);
  }

  .aura-header {
    background:linear-gradient(135deg,#C2185B,#8b0f3f);
    padding:16px 18px; display:flex; align-items:center; gap:12px; flex-shrink:0;
  }
  .aura-avatar {
    width:38px; height:38px; border-radius:50%;
    background:rgba(255,255,255,.2); border:2px solid rgba(255,255,255,.4);
    display:flex; align-items:center; justify-content:center; flex-shrink:0;
  }
  .aura-header-info { flex:1; }
  .aura-header-name { font-family:'Playfair Display',Georgia,serif; font-size:.95rem; font-weight:600; color:#fff; letter-spacing:.02em; }
  .aura-header-sub  { font-size:.6rem; letter-spacing:.12em; text-transform:uppercase; color:rgba(255,255,255,.65); font-weight:300; margin-top:1px; }
  .aura-close { background:rgba(255,255,255,.15); border:none; border-radius:50%; width:28px; height:28px; cursor:pointer; color:#fff; display:flex; align-items:center; justify-content:center; transition:background .2s; flex-shrink:0; }
  .aura-close:hover { background:rgba(255,255,255,.28); }

  .aura-messages {
    flex:1; overflow-y:auto; padding:18px 14px; display:flex; flex-direction:column; gap:10px;
    scroll-behavior:smooth;
  }
  .aura-messages::-webkit-scrollbar { width:3px; }
  .aura-messages::-webkit-scrollbar-thumb { background:rgba(194,24,91,.2); border-radius:2px; }

  .aura-bubble-wrap { display:flex; flex-direction:column; animation:aura-msg .35s cubic-bezier(.16,1,.3,1) both; }
  .aura-bubble-wrap.user { align-items:flex-end; }
  .aura-bubble-wrap.bot  { align-items:flex-start; }

  .aura-bubble {
    max-width:82%; padding:11px 15px; border-radius:18px; line-height:1.6;
    font-size:.82rem; font-weight:300;
  }
  .aura-bubble.bot {
    background:#F8F3F5; color:#1a0a10;
    border-bottom-left-radius:5px;
  }
  .aura-bubble.user {
    background:linear-gradient(135deg,#C2185B,#8b0f3f); color:#fff;
    border-bottom-right-radius:5px;
  }
  .aura-bubble.result {
    background:linear-gradient(135deg,#FDF0F4,#FAE6EE); color:#4a0a20;
    border:1px solid rgba(194,24,91,.15); border-bottom-left-radius:5px;
    max-width:92%;
  }

  .aura-typing {
    display:flex; align-items:center; gap:4px;
    padding:12px 16px; background:#F8F3F5; border-radius:18px; border-bottom-left-radius:5px;
    width:fit-content;
  }
  .aura-typing span {
    width:6px; height:6px; border-radius:50%; background:#C2185B; display:block;
    animation:aura-dot .9s ease-in-out infinite;
  }
  .aura-typing span:nth-child(2) { animation-delay:.15s; }
  .aura-typing span:nth-child(3) { animation-delay:.30s; }

  .aura-choices { padding:0 14px 14px; display:flex; flex-direction:column; gap:7px; flex-shrink:0; }
  .aura-choice {
    padding:10px 14px; background:#fff; border:1px solid rgba(194,24,91,.18);
    border-radius:12px; cursor:pointer; font-family:'Montserrat',sans-serif;
    font-size:.78rem; font-weight:400; color:#3a0a1a; text-align:left;
    transition:all .2s; line-height:1.45;
  }
  .aura-choice:hover { background:#FDF0F4; border-color:rgba(194,24,91,.45); transform:translateX(3px); }

  .aura-progress-bar {
    height:3px; background:#F8F3F5; flex-shrink:0;
  }
  .aura-progress-fill {
    height:100%; background:linear-gradient(90deg,#C2185B,#e91e8c);
    transition:width .5s cubic-bezier(.16,1,.3,1);
  }

  .aura-loader { padding:16px 14px; flex-shrink:0; }
  .aura-loader-bar {
    height:3px; background:#F8F3F5; border-radius:2px; overflow:hidden; margin-bottom:8px;
  }
  .aura-loader-fill {
    height:100%; background:linear-gradient(90deg,#C2185B,#e91e8c,#C2185B);
    background-size:200% auto;
    animation:aura-prog 3s linear both;
    border-radius:2px;
  }
  .aura-loader-text {
    font-size:.65rem; letter-spacing:.1em; text-transform:uppercase;
    color:rgba(194,24,91,.6); font-weight:400; text-align:center;
  }

  .aura-cta {
    display:block; width:100%; margin-top:12px;
    padding:12px 18px; background:linear-gradient(135deg,#C2185B,#8b0f3f);
    border:none; border-radius:12px; color:#fff; font-family:'Montserrat',sans-serif;
    font-weight:700; font-size:.72rem; letter-spacing:.12em; text-transform:uppercase;
    cursor:pointer; transition:opacity .2s; text-align:center;
  }
  .aura-cta:hover { opacity:.88; }

  .aura-restart {
    background:none; border:1px solid rgba(194,24,91,.25); border-radius:10px;
    color:rgba(194,24,91,.7); font-family:'Montserrat',sans-serif;
    font-size:.65rem; letter-spacing:.1em; text-transform:uppercase;
    padding:8px 14px; cursor:pointer; margin-top:6px; transition:all .2s; width:100%;
  }
  .aura-restart:hover { background:#FDF0F4; border-color:rgba(194,24,91,.5); }
`;

// ── QUESTIONS ─────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    id: 1,
    texte: "Quand tu dois prendre la parole dans un groupe, que se passe-t-il en toi ?",
    choix: [
      { lettre:"A", texte:"Je me tais, même si j'ai quelque chose à dire." },
      { lettre:"B", texte:"Je me demande ce que les autres vont penser de moi." },
      { lettre:"C", texte:"Je reporte à plus tard, quand je me sentirai \"prête\"." },
      { lettre:"D", texte:"Je me sens mal à l'aise dans mon corps, ça me bloque." },
    ],
  },
  {
    id: 2,
    texte: "Face à une réussite que tu observes chez une autre femme, quelle est ta première pensée ?",
    choix: [
      { lettre:"A", texte:"\"Elle s'exprime si bien, moi je n'y arrive pas.\"" },
      { lettre:"B", texte:"\"Elle doit être jugée — chanceux ceux qui ne le sont pas.\"" },
      { lettre:"C", texte:"\"Je pourrais aussi, mais je ne suis pas encore prête.\"" },
      { lettre:"D", texte:"\"Elle a l'air si bien dans sa peau, pas comme moi.\"" },
    ],
  },
  {
    id: 3,
    texte: "Quand tu ressens une émotion forte (colère, tristesse, joie), tu as tendance à…",
    choix: [
      { lettre:"A", texte:"La garder pour toi, sans en parler à personne." },
      { lettre:"B", texte:"T'inquiéter de ce que les autres ressentiraient si tu l'exprimais." },
      { lettre:"C", texte:"La différer — \"je verrai ça plus tard\" — et passer à autre chose." },
      { lettre:"D", texte:"Te déconnecter de ton corps pour ne plus la ressentir." },
    ],
  },
  {
    id: 4,
    texte: "Lorsqu'une opportunité se présente (travail, amour, projet), tu fais quoi ?",
    choix: [
      { lettre:"A", texte:"Je n'ose pas la saisir, je reste silencieuse." },
      { lettre:"B", texte:"J'hésite longtemps par peur du regard ou du jugement." },
      { lettre:"C", texte:"Je l'attends en me disant que je n'es pas encore assez prête." },
      { lettre:"D", texte:"Je doute que je mérite vraiment cette opportunité." },
    ],
  },
  {
    id: 5,
    texte: "Ton désir le plus profond, en ce moment, c'est…",
    choix: [
      { lettre:"A", texte:"Apprendre à m'exprimer sans avoir peur d'être mal comprise." },
      { lettre:"B", texte:"Vivre sans me soucier du regard des autres." },
      { lettre:"C", texte:"Passer enfin à l'action et arrêter de remettre à demain." },
      { lettre:"D", texte:"Me sentir bien dans mon corps et fière de qui je suis." },
    ],
  },
];

// ── PROFILS ───────────────────────────────────────────────────────────────
const PROFILS = {
  A: {
    nom: "La Silencieuse",
    accroche: "Tu portes des mots qui n'ont jamais trouvé leur chemin.",
    validation: "Je t'entends. Garder tout en soi, c'est épuisant. Tu n'as pas à porter ça seule — beaucoup de femmes vivent exactement ce que tu vis.",
    reframe: "La vérité, c'est que ton silence n'est pas une fatalité. C'est une protection que tu t'es construite. Et toute protection peut être transformée.",
    action: "Aujourd'hui, dis une seule chose que tu aurais gardée pour toi. Juste une. À voix haute, même si personne ne l'entend.",
  },
  B: {
    nom: "La Comparée",
    accroche: "Tu t'es trop longtemps vue à travers les yeux des autres.",
    validation: "Je comprends ce poids. Vivre sous le regard des autres, c'est comme porter une armure invisible — elle protège, mais elle écrase aussi.",
    reframe: "La vérité, c'est que le regard des autres ne définit pas ta valeur. Il reflète leurs propres peurs, pas ta réalité.",
    action: "Aujourd'hui, fais une chose pour toi seule — sans penser à ce que les autres en diront. Une toute petite chose. Et observe comment tu te sens.",
  },
  C: {
    nom: "L'Auto-bloquée",
    accroche: "Tu attends d'être prête. Mais la vraie vie commence avant.",
    validation: "Je te vois. Repousser, attendre, se dire 'pas encore'... c'est une façon de se protéger de l'échec. C'est humain. Et tu n'es pas seule.",
    reframe: "La vérité, c'est que la perfection n'existe pas. La femme que tu veux devenir se construit dans l'action imparfaite, pas dans l'attente parfaite.",
    action: "Aujourd'hui, fais une seule chose vers ton objectif — imparfaitement, mais maintenant. Même 5 minutes. Le mouvement crée la confiance.",
  },
  D: {
    nom: "La Déconnectée",
    accroche: "Ton corps n'est pas ton ennemi. Il attend que tu le retrouves.",
    validation: "Je t'entends. Se sentir étrangère à soi-même, ne pas se reconnaître dans le miroir... c'est une douleur réelle. Tu n'as pas à la minimiser.",
    reframe: "La vérité, c'est que l'estime de soi ne vient pas du corps parfait. Elle vient d'une relation de paix avec ce corps — tel qu'il est, aujourd'hui.",
    action: "Aujourd'hui, pose une main sur ton cœur. Respire. Dis-toi : 'Je suis en train d'apprendre à m'accueillir.' C'est le premier pas.",
  },
};

// ── COMPOSANT PRINCIPAL ────────────────────────────────────────────────────
export default function AuraChatbot() {
  const navigate = useNavigate();
  const [open, setOpen]         = useState(false);
  const [messages, setMessages] = useState([]);
  const [step, setStep]         = useState(0); // 0=intro, 1-5=questions, 6=loading, 7=result
  const [scores, setScores]     = useState({ A:0, B:0, C:0, D:0 });
  const [typing, setTyping]     = useState(false);
  const [choices, setChoices]   = useState([]);
  const [resultStep, setResultStep] = useState(0);
  const [profil, setProfil]     = useState(null);
  const messagesRef = useRef(null);

  const scroll = () => {
    setTimeout(() => {
      if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }, 80);
  };

  const addMessage = (content, type = "bot", delay = 0) => {
    return new Promise(resolve => {
      setTimeout(() => {
        setMessages(prev => [...prev, { content, type, id: Date.now() + Math.random() }]);
        scroll();
        resolve();
      }, delay);
    });
  };

  const showTyping = (duration = 1400) => {
    return new Promise(resolve => {
      setTyping(true);
      setTimeout(() => { setTyping(false); resolve(); }, duration);
    });
  };

  // Init au premier open
  useEffect(() => {
    if (!open || messages.length > 0) return;
    (async () => {
      await showTyping(1200);
      await addMessage("Bonjour. Je suis Aura, ta coach émotionnelle.");
      await showTyping(1000);
      await addMessage("Je suis là pour t'aider à mieux te comprendre — sans jugement, en toute bienveillance.");
      await showTyping(1400);
      await addMessage("En 5 questions, je vais identifier ce qui te freine et te donner une piste concrète pour avancer.");
      await showTyping(800);
      await addMessage("Prête à commencer ?");
      setChoices([{ lettre:"→", texte:"Oui, je suis prête." }]);
      setStep(0);
    })();
  }, [open]);

  const handleChoice = async (choix) => {
    setChoices([]);
    if (step === 0) {
      // Intro → première question
      await addMessage("Oui, je suis prête.", "user");
      await showTyping(900);
      await addMessage(QUESTIONS[0].texte);
      setChoices(QUESTIONS[0].choix);
      setStep(1);
      return;
    }

    // Questions 1-5
    const qIdx = step - 1;
    await addMessage(choix.texte, "user");
    const newScores = { ...scores, [choix.lettre]: scores[choix.lettre] + 1 };
    setScores(newScores);

    if (step < 5) {
      await showTyping(1000);
      const transition = [
        "Je note.", "Je comprends.", "Merci pour ta sincérité.", "Je t'entends."
      ][qIdx % 4];
      await addMessage(transition);
      await showTyping(1200);
      await addMessage(QUESTIONS[step].texte);
      setChoices(QUESTIONS[step].choix);
      setStep(step + 1);
    } else {
      // Fin des 5 questions → loading
      setStep(6);
      await showTyping(800);
      await addMessage("Je vais analyser ce que tu m'as partagé...");
      // Loader 3 secondes puis résultat
      setTimeout(async () => {
        const top = Object.entries(newScores).sort((a,b) => b[1]-a[1])[0][0];
        const p = PROFILS[top];
        setProfil(p);
        setStep(7);
        setResultStep(1);
        await addMessage(`Ton profil : ${p.nom}`, "bot");
        await showTyping(1200);
        await addMessage(p.accroche, "bot");
        await showTyping(1400);
        await addMessage(p.validation, "result");
        setResultStep(2);
        await showTyping(1600);
        await addMessage(p.reframe, "result");
        setResultStep(3);
        await showTyping(1400);
        await addMessage(p.action, "result");
        setResultStep(4);
        scroll();
      }, 3200);
    }
  };

  const reset = () => {
    setMessages([]);
    setStep(0);
    setScores({ A:0, B:0, C:0, D:0 });
    setTyping(false);
    setChoices([]);
    setResultStep(0);
    setProfil(null);
  };

  const progression = step === 0 ? 0 : step > 5 ? 100 : ((step - 1) / 5) * 100;

  return (
    <>
      <style>{STYLES}</style>

      {/* ── FAB ── */}
      {!open && (
        <button className="aura-fab" onClick={() => setOpen(true)} aria-label="Ouvrir Aura">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </button>
      )}

      {/* ── WINDOW ── */}
      {open && (
        <div className="aura-window">

          {/* Header */}
          <div className="aura-header">
            <div className="aura-avatar">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
              </svg>
            </div>
            <div className="aura-header-info">
              <div className="aura-header-name">Aura</div>
              <div className="aura-header-sub">Coach émotionnelle</div>
            </div>
            <button className="aura-close" onClick={() => setOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {/* Barre progression questions */}
          {step >= 1 && step <= 5 && (
            <div className="aura-progress-bar">
              <div className="aura-progress-fill" style={{ width:`${progression}%` }}/>
            </div>
          )}

          {/* Messages */}
          <div className="aura-messages" ref={messagesRef}>
            {messages.map(msg => (
              <div key={msg.id} className={`aura-bubble-wrap ${msg.type === "user" ? "user" : "bot"}`}>
                <div className={`aura-bubble ${msg.type}`}>{msg.content}</div>
              </div>
            ))}
            {typing && (
              <div className="aura-bubble-wrap bot">
                <div className="aura-typing">
                  <span/><span/><span/>
                </div>
              </div>
            )}
          </div>

          {/* Loader analyse */}
          {step === 6 && (
            <div className="aura-loader">
              <div className="aura-loader-bar">
                <div className="aura-loader-fill"/>
              </div>
              <div className="aura-loader-text">Analyse en cours...</div>
            </div>
          )}

          {/* Choix */}
          {choices.length > 0 && !typing && (
            <div className="aura-choices">
              {choices.map((c, i) => (
                <button key={i} className="aura-choice" onClick={() => handleChoice(c)}>
                  {c.lettre !== "→" && (
                    <span style={{ fontWeight:600, color:"#C2185B", marginRight:"6px" }}>{c.lettre}.</span>
                  )}
                  {c.texte}
                </button>
              ))}
            </div>
          )}

          {/* CTA final */}
          {resultStep === 4 && !typing && (
            <div className="aura-choices">
              <button className="aura-cta" onClick={() => navigate("/programme")}>
                Aller plus loin avec le programme Métamorphose
              </button>
              <button className="aura-restart" onClick={reset}>
                Recommencer le diagnostic
              </button>
            </div>
          )}

        </div>
      )}
    </>
  );
}
