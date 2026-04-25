import { useState, useEffect, useRef } from "react";
import usePageBackground from "../hooks/usePageBackground";
import { Link } from "react-router-dom";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --brun-fonce:#2A1506; --brun-mid:#4A2510; --brun-or:#7A4A1A;
    --or:#C9A96A; --or-light:#E8D5A8; --or-pale:#F2EBE0;
    --rose:#C2185B; --rose-light:#EFC7D3;
    --blanc:#F8F5F2; --blanc-pur:#FFFFFF;
    --texte:#F2EBE0; --texte-sub:rgba(242,235,224,.6); --texte-muted:rgba(242,235,224,.35);
    --surface:rgba(255,255,255,.06); --surface-hover:rgba(255,255,255,.1);
    --border:rgba(201,169,106,.2); --border-hover:rgba(201,169,106,.45);
    --ff-t:'Playfair Display',Georgia,serif;
    --ff-b:'Montserrat',sans-serif;
    --ff-a:'Cormorant Garamond',Georgia,serif;
    --ease:cubic-bezier(0.4,0,0.2,1);
  }
  html { scroll-behavior:smooth; }
  body {
    background: linear-gradient(160deg, #2A1506 0%, #4A2510 35%, #7A4A1A 65%, #C9A96A 100%);
    min-height:100vh;
    color:var(--texte); font-family:var(--ff-b); font-weight:300; line-height:1.7; overflow-x:hidden; -webkit-font-smoothing:antialiased;
  }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes pulse-rose { 0%,100%{box-shadow:0 0 20px rgba(194,24,91,.2)} 50%{box-shadow:0 0 40px rgba(194,24,91,.45)} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes orb      { 0%,100%{transform:scale(1);opacity:.06} 50%{transform:scale(1.4);opacity:.12} }
  @keyframes msgIn    { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
  @keyframes dot      { 0%,80%,100%{transform:scale(0);opacity:.3} 40%{transform:scale(1);opacity:1} }
  @keyframes reveal   { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:none} }
  @keyframes progress { from{width:0} to{width:100%} }

  .aura-page { min-height:100vh; display:flex; flex-direction:column; position:relative; overflow:hidden; }

  .orb { position:fixed; border-radius:50%; filter:blur(80px); pointer-events:none; z-index:0; }

  .navbar {
    position:sticky; top:0; z-index:100;
    display:flex; align-items:center; justify-content:space-between;
    padding:0 40px; height:64px;
    background:rgba(42,21,6,.75); backdrop-filter:blur(20px);
    border-bottom:1px solid rgba(201,169,106,.15);
  }
  .nav-brand { font-family:var(--ff-t); font-size:1.1rem; color:var(--or-light); text-decoration:none; letter-spacing:.04em; }
  .nav-back  { font-family:var(--ff-b); font-size:.65rem; letter-spacing:.2em; text-transform:uppercase; color:rgba(248,245,242,.4); text-decoration:none; transition:color .3s; }
  .nav-back:hover { color:var(--or); }

  .aura-header {
    text-align:center; padding:40px 20px 24px;
    position:relative; z-index:2;
  }
  .aura-avatar {
    width:72px; height:72px; border-radius:50%;
    background:linear-gradient(135deg,var(--brun-or),var(--or));
    display:flex; align-items:center; justify-content:center;
    margin:0 auto 16px; font-size:1.4rem;
    box-shadow:0 0 0 1px rgba(201,169,106,.3), 0 8px 32px rgba(201,169,106,.2);
    animation:pulse-rose 3s ease infinite;
  }
  .aura-name { font-family:var(--ff-t); font-size:1.4rem; color:var(--or-pale); margin-bottom:4px; }
  .aura-sub  { font-size:.65rem; letter-spacing:.22em; text-transform:uppercase; color:var(--or); opacity:.8; }
  .aura-status { display:flex; align-items:center; gap:6px; justify-content:center; margin-top:10px; font-size:.62rem; letter-spacing:.15em; text-transform:uppercase; color:rgba(248,245,242,.35); }
  .aura-dot { width:6px; height:6px; border-radius:50%; background:#4caf50; animation:pulse-rose 2s ease infinite; box-shadow:0 0 6px #4caf50; }

  .chat-wrapper { flex:1; display:flex; flex-direction:column; max-width:760px; margin:0 auto; width:100%; padding:0 16px 20px; position:relative; z-index:2; }

  .messages-area {
    flex:1; overflow-y:auto; padding:16px 0 8px;
    display:flex; flex-direction:column; gap:14px;
    scrollbar-width:thin; scrollbar-color:rgba(201,169,106,.15) transparent;
    min-height:320px; max-height:calc(100vh - 320px);
  }
  .messages-area::-webkit-scrollbar { width:3px; }
  .messages-area::-webkit-scrollbar-thumb { background:rgba(201,169,106,.15); border-radius:2px; }

  .msg { display:flex; gap:10px; animation:msgIn .4s var(--ease) both; }
  .msg.user { flex-direction:row-reverse; }

  .msg-avatar {
    width:34px; height:34px; border-radius:50%; flex-shrink:0;
    background:linear-gradient(135deg,var(--brun-or),var(--or));
    display:flex; align-items:center; justify-content:center;
    font-size:.85rem; margin-top:2px;
  }
  .msg.user .msg-avatar { background:rgba(201,169,106,.15); border:1px solid rgba(201,169,106,.2); }

  .msg-bubble {
    max-width:75%; padding:13px 17px; border-radius:18px;
    font-size:.82rem; line-height:1.7; white-space:pre-wrap; word-break:break-word;
  }
  .msg.aura .msg-bubble {
    background:rgba(42,21,6,.45); border:1px solid rgba(201,169,106,.18);
    border-radius:4px 18px 18px 18px; color:var(--texte);
    backdrop-filter:blur(8px);
  }
  .msg.user .msg-bubble {
    background:var(--rose); color:#fff;
    border-radius:18px 18px 4px 18px;
    font-weight:400;
  }

  .typing-indicator { display:flex; gap:5px; padding:14px 17px; background:rgba(42,21,6,.45); border:1px solid rgba(201,169,106,.18); border-radius:4px 18px 18px 18px; width:fit-content; backdrop-filter:blur(8px); }
  .typing-dot { width:7px; height:7px; border-radius:50%; background:rgba(248,245,242,.4); animation:dot 1.2s ease infinite; }
  .typing-dot:nth-child(2) { animation-delay:.15s; }
  .typing-dot:nth-child(3) { animation-delay:.3s; }

  .quick-btns { display:flex; flex-wrap:wrap; gap:8px; margin-top:4px; padding-left:44px; }
  .quick-btn {
    font-family:var(--ff-b); font-size:.68rem; font-weight:500; letter-spacing:.08em;
    padding:8px 16px; border-radius:20px; cursor:pointer; transition:all .25s;
    border:1px solid rgba(201,169,106,.35); background:rgba(42,21,6,.4);
    color:var(--or-light); white-space:nowrap; backdrop-filter:blur(6px);
  }
  .quick-btn:hover { background:rgba(201,169,106,.15); border-color:var(--or); transform:translateY(-1px); }
  .quick-btn.rose { border-color:rgba(194,24,91,.4); background:rgba(194,24,91,.08); color:var(--rose-light); }
  .quick-btn.rose:hover { background:rgba(194,24,91,.18); }

  .diag-card {
    margin:4px 0 0 44px; padding:20px; border-radius:12px;
    background:rgba(42,21,6,.5); border:1px solid rgba(201,169,106,.2);
    animation:reveal .4s var(--ease) both; backdrop-filter:blur(8px);
  }
  .diag-q { font-family:var(--ff-t); font-size:.95rem; color:var(--blanc); margin-bottom:14px; line-height:1.5; }
  .diag-opts { display:flex; flex-direction:column; gap:8px; }
  .diag-opt {
    display:flex; align-items:center; gap:12px; padding:11px 15px; border-radius:8px;
    border:1px solid rgba(201,169,106,.18); background:rgba(255,255,255,.03);
    cursor:pointer; transition:all .25s; text-align:left;
    font-family:var(--ff-b); font-size:.76rem; color:var(--texte-sub);
  }
  .diag-opt:hover { border-color:rgba(194,24,91,.4); background:rgba(194,24,91,.07); color:var(--blanc); }
  .diag-opt-letter { width:24px; height:24px; border-radius:50%; border:1px solid rgba(201,169,106,.4); display:flex; align-items:center; justify-content:center; font-size:.62rem; font-weight:600; letter-spacing:.08em; color:var(--or); flex-shrink:0; }

  .diag-progress { margin:0 0 16px 44px; }
  .diag-progress-bar { height:2px; background:rgba(201,169,106,.12); border-radius:2px; overflow:hidden; margin-top:6px; }
  .diag-progress-fill { height:100%; background:linear-gradient(90deg,var(--rose),var(--or)); border-radius:2px; transition:width .5s var(--ease); }
  .diag-progress-label { font-size:.6rem; letter-spacing:.18em; text-transform:uppercase; color:var(--texte-muted); }

  .loader-card {
    margin:4px 0 0 44px; padding:24px; border-radius:12px;
    background:rgba(42,21,6,.5); border:1px solid rgba(201,169,106,.2);
    text-align:center; animation:reveal .4s var(--ease) both; backdrop-filter:blur(8px);
  }
  .loader-spinner { width:36px; height:36px; border:2px solid rgba(194,24,91,.2); border-top-color:var(--rose); border-radius:50%; animation:spin 1s linear infinite; margin:0 auto 14px; }
  .loader-text { font-size:.75rem; letter-spacing:.12em; color:rgba(248,245,242,.4); }

  .profil-card {
    margin:4px 0 0 44px; padding:24px; border-radius:12px;
    background:rgba(42,21,6,.55); border:1px solid rgba(201,169,106,.25);
    animation:reveal .5s var(--ease) both;
  }
  .profil-badge { display:inline-flex; align-items:center; gap:8px; margin-bottom:14px; padding:6px 14px; border-radius:20px; background:rgba(194,24,91,.15); border:1px solid rgba(194,24,91,.3); }
  .profil-badge-icon { font-size:1.1rem; }
  .profil-badge-label { font-size:.62rem; letter-spacing:.2em; text-transform:uppercase; color:var(--rose-light); font-weight:600; }
  .profil-title { font-family:var(--ff-t); font-size:1.15rem; color:var(--blanc); margin-bottom:10px; }
  .profil-desc { font-size:.8rem; line-height:1.75; color:rgba(248,245,242,.75); margin-bottom:16px; white-space:pre-wrap; }
  .profil-key { display:flex; gap:10px; padding:12px; border-radius:8px; background:rgba(201,169,106,.08); border:1px solid rgba(201,169,106,.2); margin-bottom:12px; }
  .profil-key-icon { font-size:1rem; flex-shrink:0; margin-top:1px; }
  .profil-key-text { font-size:.77rem; color:rgba(248,245,242,.8); line-height:1.6; }

  .input-area {
    display:flex; gap:10px; align-items:flex-end;
    padding:14px 0 0; border-top:1px solid rgba(201,169,106,.12);
  }
  .input-field {
    flex:1; background:rgba(42,21,6,.5); border:1px solid rgba(201,169,106,.2);
    border-radius:24px; padding:12px 18px; color:var(--texte);
    font-family:var(--ff-b); font-size:.82rem; resize:none; outline:none;
    transition:border-color .3s; max-height:120px; min-height:44px; line-height:1.5;
  }
  .input-field::placeholder { color:rgba(248,245,242,.25); }
  .input-field:focus { border-color:rgba(201,169,106,.5); }

  .send-btn {
    width:44px; height:44px; border-radius:50%; border:none;
    background:var(--rose); color:#fff; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:all .25s; flex-shrink:0; font-size:1rem;
  }
  .send-btn:hover:not(:disabled) { background:#a01049; transform:scale(1.05); }
  .send-btn:disabled { opacity:.4; cursor:not-allowed; }

  .conv-cta { display:flex; align-items:center; gap:10px; margin-top:14px; padding:14px 16px; border-radius:10px; background:rgba(194,24,91,.08); border:1px solid rgba(194,24,91,.2); animation:reveal .5s var(--ease) both; }
  .conv-cta-text { flex:1; font-size:.78rem; color:rgba(248,245,242,.8); line-height:1.5; }
  .conv-cta-btn { font-family:var(--ff-b); font-size:.63rem; letter-spacing:.15em; text-transform:uppercase; padding:9px 18px; border-radius:20px; background:var(--rose); color:#fff; text-decoration:none; white-space:nowrap; transition:all .25s; border:none; cursor:pointer; }
  .conv-cta-btn:hover { background:#a01049; }

  @media(max-width:600px){
    .navbar { padding:0 20px; }
    .msg-bubble { max-width:88%; font-size:.8rem; }
    .diag-card, .profil-card, .loader-card { margin-left:0; }
    .quick-btns { padding-left:0; }
    .diag-progress { margin-left:0; }
  }
`;

// ── Données des profils ────────────────────────────────────────
const PROFILS = {
  A: {
    icon: "🔥",
    label: "La Silencieuse",
    title: "Tu as appris à te faire petite...",
    desc: "pas parce que tu n'as rien à dire,\nmais parce que tu as douté de la valeur de ta voix. 🌿\n\nAujourd'hui, tu ressens un blocage à t'exprimer, à prendre ta place.",
    verite: "Ta voix n'est pas trop faible... elle a juste été trop longtemps ignorée.",
    cle: "Commence par t'exprimer dans des espaces sécurisés — l'écriture, un audio, le miroir. Chaque expression compte.",
    question: "Quelle est la chose que tu aurais aimé dire récemment, mais que tu as gardée pour toi ?",
  },
  B: {
    icon: "🌪",
    label: "La Comparée",
    title: "Tu vis beaucoup à travers le regard des autres...",
    desc: "et sans t'en rendre compte, tu te diminues. 💔\n\nTu te compares, tu doutes, tu te sens \"moins que\".",
    verite: "Tu ne manques pas de valeur. Tu manques d'ancrage dans ta propre identité.",
    cle: "Réduis les sources de comparaison et reconnecte-toi à toi. Chaque jour, note une chose qui te rend unique.",
    question: "Dans quel domaine tu te compares le plus — et qu'est-ce que ça te coûte vraiment ?",
  },
  C: {
    icon: "⛔",
    label: "L'Auto-bloquée",
    title: "Tu sais ce que tu veux...",
    desc: "mais quelque chose t'empêche de passer à l'action.\n\nEt ça crée frustration, culpabilité et stagnation. 🌫",
    verite: "Tu n'es pas paresseuse. Tu es freinée par la peur et le doute.",
    cle: "Arrête de viser parfait. Vise \"fait\". Une seule petite action aujourd'hui suffit à briser le cycle.",
    question: "Quelle est la chose que tu repousses depuis trop longtemps ?",
  },
  D: {
    icon: "💔",
    label: "La Déconnectée de son image",
    title: "Tu as du mal à te voir avec amour...",
    desc: "et ton regard sur toi est souvent dur, critique.\n\nTu ne te sens pas belle, pas assez, pas alignée. 🌧",
    verite: "Ce n'est pas ton image qui est le problème... c'est le lien que tu as avec toi-même.",
    cle: "Chaque jour, trouve UNE chose que tu apprécies chez toi. Commence par là, même si c'est petit.",
    question: "Quand tu te regardes, qu'est-ce que tu vois en premier ?",
  },
};

// ── Questions du diagnostic ────────────────────────────────────
const QUESTIONS = [
  {
    q: "Dans quelle situation tu te sens le plus en difficulté aujourd'hui ?",
    opts: [
      { l: "A", t: "Quand je dois m'exprimer ou prendre la parole" },
      { l: "B", t: "Quand je me compare aux autres" },
      { l: "C", t: "Quand je dois prendre des décisions importantes" },
      { l: "D", t: "Quand je me regarde ou pense à mon image" },
    ],
  },
  {
    q: "Quelle pensée revient le plus souvent dans ton esprit ?",
    opts: [
      { l: "A", t: "\"Je ne suis pas à la hauteur\"" },
      { l: "B", t: "\"Les autres sont mieux que moi\"" },
      { l: "C", t: "\"Je vais échouer\"" },
      { l: "D", t: "\"Je ne suis pas assez bien physiquement\"" },
    ],
  },
  {
    q: "Quelle émotion te suit le plus en ce moment ?",
    opts: [
      { l: "A", t: "Le doute" },
      { l: "B", t: "L'insécurité" },
      { l: "C", t: "La peur" },
      { l: "D", t: "La frustration" },
    ],
  },
  {
    q: "Face à ces situations, tu as tendance à...",
    opts: [
      { l: "A", t: "Te taire ou t'effacer" },
      { l: "B", t: "Te comparer encore plus" },
      { l: "C", t: "Reporter ou éviter" },
      { l: "D", t: "Te critiquer intérieurement" },
    ],
  },
  {
    q: "Au fond de toi, qu'est-ce que tu veux vraiment ?",
    opts: [
      { l: "A", t: "Oser m'exprimer librement" },
      { l: "B", t: "Me sentir légitime et confiante" },
      { l: "C", t: "Passer à l'action sans peur" },
      { l: "D", t: "Me sentir belle et alignée avec moi-même" },
    ],
  },
];

// ── Calcul du profil dominant ──────────────────────────────────
function calculerProfil(reponses) {
  const count = { A: 0, B: 0, C: 0, D: 0 };
  reponses.forEach(r => { if (count[r] !== undefined) count[r]++; });
  return Object.entries(count).sort((a, b) => b[1] - a[1])[0][0];
}

// ── Composant principal ────────────────────────────────────────
export default function Aura() {
  usePageBackground("aura");
  const [messages, setMessages] = useState([{
    role: "aura",
    text: "Bonjour.\n\nJe suis Aura, l'Assistante Intelligente Métamorphose.\n\nJe suis là pour t'aider à mettre des mots sur ce que tu ressens.\n\nDis-moi... qu'est-ce qui t'amène aujourd'hui ?",
    type: "accueil",
    extra: null,
    id: 1,
  }]);
  const [input,         setInput]         = useState("");
  const [isTyping,      setIsTyping]      = useState(false);
  const [history,       setHistory]       = useState([]);
  const [phase,         setPhase]         = useState("accueil");   // accueil | chat | diag | loading | profil | deep
  const [diagStep,      setDiagStep]      = useState(0);
  const [diagReponses,  setDiagReponses]  = useState([]);
  const [profil,        setProfil]        = useState(null);
  const [showCTA,       setShowCTA]       = useState(false);
  const [echangeCount,  setEchangeCount]  = useState(0);
  const bottomRef    = useRef(null);
  const inputRef     = useRef(null);

  // ── Auto-scroll ──────────────────────────────────────────────
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping, phase]);

  // ── Message d'accueil au montage ─────────────────────────────
  // Injection du style — séparée du message pour éviter les conflits StrictMode
  useEffect(() => {
    const styleId = "aura-styles";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = STYLES;
      document.head.appendChild(style);
    }
    return () => {
      const s = document.getElementById(styleId);
      if (s) s.remove();
    };
  }, []);



  // ── Ajouter un message d'Aura ─────────────────────────────────
  function addAuraMessage(text, type = "text", extra = null) {
    setMessages(prev => [...prev, { role: "aura", text, type, extra, id: Date.now() + Math.random() }]);
  }

  // ── Ajouter un message utilisateur ───────────────────────────
  function addUserMessage(text) {
    setMessages(prev => [...prev, { role: "user", text, id: Date.now() + Math.random() }]);
  }

  // ── Choix rapides initiaux ────────────────────────────────────
  const CHOIX_ACCUEIL = [
    "Manque de confiance",
    "Peur du regard des autres",
    "Problème d'image",
    "Je ne sais pas exactement",
  ];

  // ── Réponse aux choix rapides d'accueil ──────────────────────
  async function onChoixAccueil(choix) {
    addUserMessage(choix);
    setPhase("chat");
    setIsTyping(true);
    await delay(1400);
    setIsTyping(false);
    const rep = `Merci de me l'avoir dit 💖\n\nTu sais... tu es loin d'être la seule à ressentir ça.\nMais chaque blocage a une racine précise.\n\nEt si on identifiait la tienne ensemble ?`;
    addAuraMessage(rep, "chat_propose");
    setHistory(prev => [...prev, { role: "user", content: choix }, { role: "assistant", content: rep }]);
  }

  // ── Proposer le diagnostic ────────────────────────────────────
  function onAccepterDiag() {
    addUserMessage("Oui, je veux comprendre");
    setPhase("diag");
    setDiagStep(0);
    setDiagReponses([]);
    setTimeout(() => {
      addAuraMessage("Je vais te poser 5 questions pour identifier précisément ce qui te freine... 💫\n\nRéponds avec ce qui te ressemble le plus. Il n'y a pas de bonne ou mauvaise réponse.", "diag_intro");
    }, 400);
  }

  // ── Répondre à une question du diagnostic ────────────────────
  async function onDiagReponse(lettre, texte) {
    addUserMessage(texte);
    const nouvellesReponses = [...diagReponses, lettre];
    setDiagReponses(nouvellesReponses);

    if (diagStep < QUESTIONS.length - 1) {
      setIsTyping(true);
      await delay(800);
      setIsTyping(false);
      const feedbacks = [
        "Je vois... c'est important ce que tu viens de partager 🌿",
        "Je comprends... ça demande du courage de l'admettre 💖",
        "Merci pour cette honnêteté avec toi-même 💫",
        "Je t'entends... et ça fait sens 🌸",
      ];
      const feedback = feedbacks[diagStep % feedbacks.length];
      addAuraMessage(feedback, "diag_feedback");
      setDiagStep(diagStep + 1);
    } else {
      // Dernière question — lancer le chargement
      setPhase("loading");
      setIsTyping(true);
      await delay(500);
      setIsTyping(false);
      addAuraMessage("Merci pour tes réponses...\nJe vais analyser ce que tu m'as partagé... 💫", "loading");
      await delay(3000);
      const profilCode = calculerProfil(nouvellesReponses);
      setProfil(profilCode);
      setPhase("profil");
      addAuraMessage("", "profil", PROFILS[profilCode]);
    }
  }

  // ── Après le profil — approfondissement ──────────────────────
  async function onApprofondirProfil() {
    addUserMessage("Je veux aller plus loin");
    setPhase("deep");
    setIsTyping(true);
    await delay(1600);
    setIsTyping(false);
    const profilData = PROFILS[profil];
    const rep = `Ce que tu vis ne date pas d'aujourd'hui... 🌿\n\nSouvent, ça vient d'expériences passées ou de schémas que tu as intégrés sans t'en rendre compte.\n\n${profilData.question}`;
    addAuraMessage(rep);
    setHistory(prev => [...prev, { role: "assistant", content: rep }]);
    setEchangeCount(1);
  }

  // ── Envoi d'un message libre ──────────────────────────────────
  async function onSend() {
    const txt = input.trim();
    if (!txt || isTyping) return;
    setInput("");
    addUserMessage(txt);

    const newHistory = [...history, { role: "user", content: txt }];
    setHistory(newHistory);
    setIsTyping(true);

    // Réponse locale — flow guidé sans IA externe
    await delay(900);
    setIsTyping(false);

    const reponsesLibres = [
      "Merci de me partager cela. 💛\n\nChaque mot que tu poses est déjà un pas vers toi-même.\n\nVeux-tu qu'on explore ensemble ce que tu ressens ?",
      "Je t'entends... et ce que tu traverses mérite toute ton attention. 🌿\n\nSouvent, ce qu'on n'arrive pas à nommer, c'est ce qui nous pèse le plus.",
      "Tu n'es pas seule dans ce chemin. 💖\n\nLa transformation commence toujours par ce moment — celui où on ose dire les choses.",
      "Ce que tu partages est précieux. ✦\n\nPrend le temps de ressentir sans te juger. C'est déjà une forme de courage.",
    ];
    const idx = Math.floor(Math.random() * reponsesLibres.length);
    addAuraMessage(reponsesLibres[idx]);

    const newCount = echangeCount + 1;
    setEchangeCount(newCount);
    if (newCount >= 2 && !showCTA) {
      setTimeout(() => setShowCTA(true), 1000);
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
  }

  function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

  // ── Rendu des messages ────────────────────────────────────────
  function renderMessage(msg) {
    if (msg.role === "user") {
      return (
        <div key={msg.id} className="msg user">
          <div className="msg-avatar">V</div>
          <div className="msg-bubble">{msg.text}</div>
        </div>
      );
    }

    // Messages spéciaux Aura
    if (msg.type === "accueil") {
      return (
        <div key={msg.id} className="msg aura">
          <div className="msg-avatar">A</div>
          <div style={{ flex: 1 }}>
            <div className="msg-bubble">{msg.text}</div>
            {phase === "accueil" && (
              <div className="quick-btns" style={{ marginTop: 10 }}>
                {CHOIX_ACCUEIL.map(c => (
                  <button key={c} className="quick-btn" onClick={() => onChoixAccueil(c)}>{c}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    if (msg.type === "chat_propose") {
      return (
        <div key={msg.id} className="msg aura">
          <div className="msg-avatar">A</div>
          <div style={{ flex: 1 }}>
            <div className="msg-bubble">{msg.text}</div>
            {phase === "chat" && (
              <div className="quick-btns" style={{ marginTop: 10 }}>
                <button className="quick-btn rose" onClick={onAccepterDiag}>Oui, je veux comprendre</button>
                <button className="quick-btn" onClick={() => { setPhase("free"); addUserMessage("Je préfère discuter librement"); }}>Pas maintenant</button>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (msg.type === "diag_intro") {
      return (
        <div key={msg.id} className="msg aura">
          <div className="msg-avatar">A</div>
          <div style={{ flex: 1 }}>
            <div className="msg-bubble">{msg.text}</div>
            {phase === "diag" && diagStep === 0 && renderDiagQuestion(0)}
          </div>
        </div>
      );
    }

    if (msg.type === "diag_feedback") {
      return (
        <div key={msg.id} className="msg aura">
          <div className="msg-avatar">A</div>
          <div style={{ flex: 1 }}>
            <div className="msg-bubble">{msg.text}</div>
            {phase === "diag" && msg === messages.filter(m => m.type === "diag_feedback").slice(-1)[0] && renderDiagQuestion(diagStep)}
          </div>
        </div>
      );
    }

    if (msg.type === "loading") {
      return (
        <div key={msg.id} className="msg aura">
          <div className="msg-avatar">A</div>
          <div style={{ flex: 1 }}>
            <div className="msg-bubble">{msg.text}</div>
            {phase === "loading" && (
              <div className="loader-card">
                <div className="loader-spinner" />
                <div className="loader-text">Analyse en cours...</div>
              </div>
            )}
          </div>
        </div>
      );
    }

    if (msg.type === "profil" && msg.extra) {
      const p = msg.extra;
      return (
        <div key={msg.id} className="msg aura">
          <div className="msg-avatar">A</div>
          <div style={{ flex: 1 }}>
            <div className="profil-card">
              <div className="profil-badge">
                <span className="profil-badge-icon">{p.icon}</span>
                <span className="profil-badge-label">Ton profil : {p.label}</span>
              </div>
              <div className="profil-title">{p.title}</div>
              <div className="profil-desc">{p.desc}</div>
              <div className="profil-key">
                <span className="profil-key-icon">💡</span>
                <span className="profil-key-text"><strong>Vérité :</strong> {p.verite}</span>
              </div>
              <div className="profil-key">
                <span className="profil-key-icon">✨</span>
                <span className="profil-key-text"><strong>Première clé :</strong> {p.cle}</span>
              </div>
            </div>
            {phase === "profil" && (
              <div className="quick-btns" style={{ marginTop: 12, paddingLeft: 0 }}>
                <button className="quick-btn rose" onClick={onApprofondirProfil}>Je veux aller plus loin</button>
                <button className="quick-btn" onClick={() => { setPhase("free"); setEchangeCount(0); }}>Continuer à discuter</button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Message texte standard d'Aura
    return (
      <div key={msg.id} className="msg aura">
        <div className="msg-avatar">A</div>
        <div className="msg-bubble">{msg.text}</div>
      </div>
    );
  }

  // ── Rendu d'une question du diagnostic ────────────────────────
  function renderDiagQuestion(step) {
    if (step >= QUESTIONS.length) return null;
    const q = QUESTIONS[step];
    const pct = Math.round((step / QUESTIONS.length) * 100);
    return (
      <div style={{ marginTop: 12 }}>
        <div className="diag-progress">
          <div className="diag-progress-label">Question {step + 1} sur {QUESTIONS.length}</div>
          <div className="diag-progress-bar">
            <div className="diag-progress-fill" style={{ width: `${pct}%` }} />
          </div>
        </div>
        <div className="diag-card">
          <div className="diag-q">{q.q}</div>
          <div className="diag-opts">
            {q.opts.map(opt => (
              <button key={opt.l} className="diag-opt" onClick={() => onDiagReponse(opt.l, opt.t)}>
                <span className="diag-opt-letter">{opt.l}</span>
                {opt.t}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const canType = phase === "free" || phase === "deep" || (phase === "chat" && echangeCount > 0);

  return (
    <div className="aura-page">


      {/* Navbar */}

      {/* Header Aura */}
      <div className="aura-header">
        <div className="aura-avatar">A</div>
        <div className="aura-name">Aura Métamorphose</div>
        <div className="aura-sub">Assistante de transformation intérieure</div>
        <div className="aura-status">
          <div className="aura-dot" />
          Disponible 24h/24
        </div>
      </div>

      {/* Zone de chat */}
      <div className="chat-wrapper">
        <div className="messages-area">
          {messages.map(renderMessage)}

          {/* Indicateur de frappe */}
          {isTyping && (
            <div className="msg aura">
              <div className="msg-avatar">A</div>
              <div className="typing-indicator">
                <div className="typing-dot" />
                <div className="typing-dot" />
                <div className="typing-dot" />
              </div>
            </div>
          )}

          {/* CTA de conversion douce */}
          {showCTA && (
            <div className="conv-cta">
              <div className="conv-cta-text">
                Ce que tu vis... c'est exactement ce que Métamorphose accompagne en profondeur. 🌸
              </div>
              <Link to="/contact" className="conv-cta-btn">Découvrir le programme</Link>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Zone de saisie */}
        <div className="input-area">
          <textarea
            ref={inputRef}
            className="input-field"
            placeholder={canType ? "Écris ce que tu ressens..." : "Sélectionne une option ci-dessus..."}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={!canType || isTyping}
            rows={1}
          />
          <button className="send-btn" onClick={onSend} disabled={!canType || !input.trim() || isTyping}>
            ➤
          </button>
        </div>
      </div>
    </div>
  );
}
