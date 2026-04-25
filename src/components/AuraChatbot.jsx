import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";

// ── STYLES ───────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@200;300;400;500;600;700&display=swap');

  @keyframes aura-in     { from{opacity:0;transform:translateY(20px) scale(.96)} to{opacity:1;transform:none} }
  @keyframes aura-msg    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
  @keyframes aura-dot    { 0%,80%,100%{transform:translateY(0);opacity:.3} 40%{transform:translateY(-5px);opacity:1} }
  @keyframes aura-pulse  { 0%,100%{box-shadow:0 0 0 0 rgba(194,24,91,.4)} 65%{box-shadow:0 0 0 12px rgba(194,24,91,0)} }
  @keyframes aura-prog   { from{width:0} to{width:100%} }
  @keyframes aura-fab    { from{opacity:0;transform:scale(.6)} to{opacity:1;transform:scale(1)} }
  @keyframes aura-shimmer{ 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes aura-reveal { from{opacity:0;transform:scale(.97) translateY(8px)} to{opacity:1;transform:none} }

  .aura-fab {
    position:fixed; bottom:28px; right:28px; z-index:9999;
    width:60px; height:60px; border-radius:50%;
    background:linear-gradient(135deg,#C2185B,#8b0f3f);
    border:none; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    box-shadow:0 6px 28px rgba(194,24,91,.45);
    animation:aura-fab .5s cubic-bezier(.16,1,.3,1) both, aura-pulse 3s ease-in-out 1.5s infinite;
    transition:transform .2s, box-shadow .2s;
  }
  .aura-fab:hover { transform:scale(1.1); box-shadow:0 8px 36px rgba(194,24,91,.55); }

  .aura-badge {
    position:absolute; top:-4px; right:-4px;
    width:18px; height:18px; border-radius:50%;
    background:#C9A96A; border:2px solid #fff;
    display:flex; align-items:center; justify-content:center;
    font-size:9px; font-weight:700; color:#fff; font-family:'Montserrat',sans-serif;
  }

  .aura-window {
    position:fixed; bottom:104px; right:28px; z-index:9999;
    width:370px; max-width:calc(100vw - 40px);
    background:#fff; border-radius:22px;
    box-shadow:0 32px 80px rgba(0,0,0,.16), 0 4px 20px rgba(194,24,91,.1);
    display:flex; flex-direction:column; overflow:hidden;
    animation:aura-in .4s cubic-bezier(.16,1,.3,1) both;
    font-family:'Montserrat',sans-serif;
    max-height:calc(100vh - 140px);
    border:1px solid rgba(194,24,91,.08);
  }

  .aura-header {
    background:linear-gradient(135deg,#C2185B 0%,#8b0f3f 100%);
    padding:14px 18px; display:flex; align-items:center; gap:12px; flex-shrink:0;
    position:relative; overflow:hidden;
  }
  .aura-header::after {
    content:''; position:absolute; inset:0;
    background:linear-gradient(90deg,transparent,rgba(255,255,255,.06),transparent);
    background-size:200% auto; animation:aura-shimmer 4s linear infinite;
  }
  .aura-avatar-wrap { position:relative; flex-shrink:0; }
  .aura-avatar {
    width:40px; height:40px; border-radius:50%;
    background:rgba(255,255,255,.2); border:2px solid rgba(255,255,255,.4);
    display:flex; align-items:center; justify-content:center;
  }
  .aura-online {
    position:absolute; bottom:1px; right:1px;
    width:10px; height:10px; border-radius:50%;
    background:#4CAF50; border:2px solid #8b0f3f;
  }
  .aura-header-info { flex:1; z-index:1; }
  .aura-header-name {
    font-family:'Playfair Display',Georgia,serif;
    font-size:.98rem; font-weight:600; color:#fff; letter-spacing:.02em;
  }
  .aura-header-sub {
    font-size:.58rem; letter-spacing:.14em; text-transform:uppercase;
    color:rgba(255,255,255,.65); font-weight:300; margin-top:2px;
  }
  .aura-close {
    background:rgba(255,255,255,.15); border:none; border-radius:50%;
    width:30px; height:30px; cursor:pointer; color:#fff;
    display:flex; align-items:center; justify-content:center;
    transition:background .2s; flex-shrink:0; z-index:1;
  }
  .aura-close:hover { background:rgba(255,255,255,.3); }

  .aura-progress-bar { height:2px; background:#f5e8ec; flex-shrink:0; }
  .aura-progress-fill { height:100%; background:linear-gradient(90deg,#C2185B,#e91e8c); transition:width .6s cubic-bezier(.16,1,.3,1); }

  .aura-messages {
    flex:1; overflow-y:auto; padding:16px 14px;
    display:flex; flex-direction:column; gap:10px;
    scroll-behavior:smooth; min-height:0;
  }
  .aura-messages::-webkit-scrollbar { width:3px; }
  .aura-messages::-webkit-scrollbar-thumb { background:rgba(194,24,91,.2); border-radius:2px; }

  .aura-bubble-wrap { display:flex; flex-direction:column; animation:aura-msg .3s cubic-bezier(.16,1,.3,1) both; }
  .aura-bubble-wrap.user { align-items:flex-end; }
  .aura-bubble-wrap.bot  { align-items:flex-start; }

  .aura-bubble {
    max-width:84%; padding:11px 15px; border-radius:18px;
    line-height:1.65; font-size:.81rem; font-weight:300; color:#1a0a10;
  }
  .aura-bubble.bot  { background:#F8F3F6; border-bottom-left-radius:5px; }
  .aura-bubble.user { background:linear-gradient(135deg,#C2185B,#8b0f3f); color:#fff; border-bottom-right-radius:5px; font-weight:400; }
  .aura-bubble.profil {
    background:linear-gradient(135deg,#FDF0F5,#FAE6EE);
    border:1px solid rgba(194,24,91,.15); border-bottom-left-radius:5px;
    max-width:94%; padding:16px; animation:aura-reveal .5s cubic-bezier(.16,1,.3,1) both;
  }

  .aura-profil-tag {
    display:inline-block; padding:3px 10px; border-radius:20px;
    background:rgba(194,24,91,.12); color:#C2185B;
    font-size:.58rem; font-weight:600; letter-spacing:.14em; text-transform:uppercase;
    margin-bottom:8px;
  }
  .aura-profil-titre {
    font-family:'Playfair Display',Georgia,serif;
    font-size:1.05rem; font-weight:700; color:#2a0a10; margin-bottom:10px;
  }
  .aura-profil-bloc { margin-bottom:10px; }
  .aura-profil-bloc-label {
    font-size:.56rem; font-weight:600; letter-spacing:.18em; text-transform:uppercase;
    color:rgba(194,24,91,.6); margin-bottom:4px;
  }
  .aura-profil-bloc-text { font-size:.8rem; font-weight:300; color:#3a0a1a; line-height:1.65; }

  .aura-typing {
    display:flex; align-items:center; gap:4px;
    padding:13px 16px; background:#F8F3F6; border-radius:18px; border-bottom-left-radius:5px;
    width:fit-content;
  }
  .aura-typing span {
    width:6px; height:6px; border-radius:50%; background:#C2185B; display:block;
    animation:aura-dot .9s ease-in-out infinite;
  }
  .aura-typing span:nth-child(2) { animation-delay:.15s; }
  .aura-typing span:nth-child(3) { animation-delay:.30s; }

  .aura-input-area { padding:10px 12px 12px; flex-shrink:0; border-top:1px solid rgba(194,24,91,.07); }
  .aura-input-row { display:flex; gap:8px; align-items:flex-end; }
  .aura-input {
    flex:1; padding:10px 14px; background:#F8F3F6; border:1px solid rgba(194,24,91,.15);
    border-radius:22px; font-family:'Montserrat',sans-serif; font-size:.8rem;
    font-weight:300; color:#1a0a10; outline:none; resize:none;
    transition:border-color .2s; line-height:1.5; max-height:80px; overflow-y:auto;
  }
  .aura-input:focus { border-color:rgba(194,24,91,.45); }
  .aura-input::placeholder { color:rgba(42,21,6,.3); }
  .aura-send {
    width:36px; height:36px; border-radius:50%; flex-shrink:0;
    background:linear-gradient(135deg,#C2185B,#8b0f3f);
    border:none; cursor:pointer; display:flex; align-items:center; justify-content:center;
    transition:opacity .2s, transform .15s;
  }
  .aura-send:hover { opacity:.88; transform:scale(1.06); }
  .aura-send:disabled { opacity:.35; cursor:default; transform:none; }

  .aura-choices { padding:4px 12px 12px; display:flex; flex-direction:column; gap:6px; flex-shrink:0; }
  .aura-choice {
    padding:10px 14px; background:#fff; border:1px solid rgba(194,24,91,.2);
    border-radius:12px; cursor:pointer; font-family:'Montserrat',sans-serif;
    font-size:.78rem; font-weight:400; color:#2a0a10; text-align:left;
    transition:all .2s; line-height:1.45;
  }
  .aura-choice:hover { background:#FDF0F5; border-color:rgba(194,24,91,.5); transform:translateX(4px); }
  .aura-choice.theme { background:linear-gradient(135deg,#FDF0F5,#FAE6EE); border-color:rgba(194,24,91,.18); }
  .aura-choice.cta { background:linear-gradient(135deg,#C2185B,#8b0f3f); color:#fff; border-color:transparent; font-weight:600; text-align:center; }
  .aura-choice.cta:hover { opacity:.88; transform:none; }
  .aura-choice.ghost { background:transparent; color:rgba(194,24,91,.7); font-size:.72rem; text-align:center; }

  .aura-loader { padding:12px 14px 14px; flex-shrink:0; }
  .aura-loader-bar { height:3px; background:#F8F3F6; border-radius:2px; overflow:hidden; margin-bottom:8px; }
  .aura-loader-fill { height:100%; background:linear-gradient(90deg,#C2185B,#e91e8c,#C2185B); background-size:200% auto; animation:aura-prog 3.5s linear both; border-radius:2px; }
  .aura-loader-text { font-size:.62rem; letter-spacing:.12em; text-transform:uppercase; color:rgba(194,24,91,.55); font-weight:400; text-align:center; }

  .aura-step-indicator { display:flex; align-items:center; justify-content:center; gap:6px; padding:8px 14px 0; flex-shrink:0; }
  .aura-step-dot { width:7px; height:7px; border-radius:50%; background:rgba(194,24,91,.15); transition:all .3s; }
  .aura-step-dot.done    { background:#C2185B; }
  .aura-step-dot.current { background:#C2185B; box-shadow:0 0 0 3px rgba(194,24,91,.2); }

  @media(max-width:480px) {
    .aura-window { right:12px; bottom:90px; width:calc(100vw - 24px); }
    .aura-fab    { right:16px; bottom:20px; }
  }
`;

// ── SCRIPTS PAR PILIER ───────────────────────────────────────────────────────
const SCRIPTS = {
  confidence: [
    { val:"Ce que tu ressens est plus fréquent que tu ne le penses…\n\nMais la confiance ne se trouve pas, elle se construit.", q:"Dans quelle situation tu doutes le plus de toi en ce moment ?" },
    { val:"Le doute que tu ressens ne veut pas dire que tu es incapable…\n\nÇa veut juste dire que tu es en train de grandir.", q:"Qu'est-ce qui te met dans cet état ?" },
    { val:"Tu sais… beaucoup de femmes fortes doutent aussi.\n\nLa différence, c'est qu'elles avancent malgré ça.", q:"Qu'est-ce qui t'empêche d'avancer aujourd'hui ?" },
    { val:"Et si tu n'avais pas besoin d'être sûre de toi pour commencer ?", q:"Qu'est-ce que tu pourrais faire même avec le doute ?" },
    { val:"Tu es peut-être plus prête que tu ne le crois.", q:"Qu'est-ce qui te fait penser le contraire ?" },
    { val:"La confiance se construit dans l'action…\n\npas dans l'attente.", q:"Quelle petite victoire pourrais-tu créer aujourd'hui ?" },
    { val:"Tu te juges peut-être trop sévèrement.", q:"Que dirais-tu à quelqu'un dans ta situation ?" },
    { val:"Tu n'as pas besoin d'être parfaite pour avancer.", q:"Qu'est-ce que tu ferais si tu te faisais davantage confiance ?" },
    { val:"Le regard que tu poses sur toi influence tout.", q:"Comment te parles-tu intérieurement ?" },
    { val:"Et si tu te faisais confiance, juste un peu plus aujourd'hui ?", q:"Qu'est-ce qui changerait dans ta vie ?" },
  ],
  judgment: [
    { val:"Le regard des autres devient lourd quand il passe avant le tien…", q:"Qu'est-ce que tu n'oses pas faire à cause du regard des autres ?" },
    { val:"Tu leur donnes peut-être plus de pouvoir qu'ils n'en ont.", q:"Qu'est-ce que tu crains exactement qu'on pense de toi ?" },
    { val:"Tu ne peux pas contrôler le regard des autres…\n\nmais tu peux choisir le regard que tu poses sur toi.", q:"Comment te vois-tu aujourd'hui ?" },
    { val:"Vivre pour plaire, c'est s'abandonner petit à petit.", q:"Qu'est-ce que tu fais aujourd'hui juste pour être acceptée ?" },
    { val:"Et si tu étais libre du regard des autres…\n\nqui serais-tu vraiment ?", q:"Qu'est-ce qui te retient ?" },
    { val:"Ce que les autres pensent, tu ne peux pas le contrôler.\n\nMais ce que toi tu penses de toi… ça change tout.", q:"Que penses-tu vraiment de toi ?" },
    { val:"Tu te caches peut-être pour éviter d'être jugée…\n\nmais tu te prives aussi d'être vue.", q:"Est-ce que ça te parle ?" },
    { val:"Le jugement fait peur… mais il ne définit pas qui tu es.", q:"Qu'est-ce qui te rend unique selon toi ?" },
    { val:"Tu n'es pas faite pour plaire à tout le monde.\n\nTu es faite pour être toi.", q:"Qu'est-ce qui te bloque encore ?" },
    { val:"Qu'est-ce que tu ferais si personne ne te regardait ?", q:"Qu'est-ce qui changerait ?" },
  ],
  image: [
    { val:"La beauté commence dans le regard que tu poses sur toi.", q:"Qu'est-ce que tu vois en premier quand tu te regardes ?" },
    { val:"Ton image extérieure est le reflet de ton monde intérieur.", q:"Comment te sens-tu vraiment à l'intérieur ?" },
    { val:"Tu n'as pas besoin de changer ton corps…\n\nmais ta perception de toi.", q:"Quelle est la critique que tu te fais le plus ?" },
    { val:"Et si tu apprenais à te regarder avec douceur ?\n\nComme tu regarderais quelqu'un que tu aimes…", q:"Que te dirais-tu avec bienveillance ?" },
    { val:"Tu es peut-être plus dure avec toi-même que nécessaire.", q:"Pourquoi es-tu aussi exigeante envers toi ?" },
    { val:"Se sentir belle, ce n'est pas une question de physique…\n\nc'est une question de perception et d'énergie.", q:"Comment veux-tu te sentir ?" },
    { val:"Ton corps n'est pas ton ennemi.\n\nC'est ton regard qui peut l'être.", q:"Comment tu te réconcilies avec toi ?" },
    { val:"La beauté est une énergie… pas un standard.", q:"Quelle énergie veux-tu dégager ?" },
    { val:"Et si tu arrêtais de chercher à ressembler…\n\npour commencer à te révéler ?", q:"Qui es-tu vraiment ?" },
    { val:"Quelle est UNE chose que tu apprécies chez toi, même légèrement ?", q:"Commence par là." },
  ],
  comparison: [
    { val:"La comparaison est un piège silencieux…\n\nelle te fait oublier qui tu es.", q:"À qui te compares-tu le plus ?" },
    { val:"Tu vois leur résultat…\n\nmais pas leur parcours.", q:"Qu'est-ce que ça change pour toi ?" },
    { val:"Tu n'es pas en retard…\n\ntu es sur TON chemin.", q:"Qu'est-ce qui est important pour toi sur ce chemin ?" },
    { val:"Chaque personne avance à son rythme.\n\nLe tien est tout aussi valable.", q:"Qu'est-ce qui te définit vraiment ?" },
    { val:"La comparaison te diminue.\n\nL'acceptation te libère.", q:"Comment tu peux commencer à t'accepter ?" },
    { val:"Et si tu transformais la comparaison en inspiration ?", q:"Qu'est-ce que tu admires chez les autres ?" },
    { val:"Tu te compares peut-être parce que tu ne vois pas encore ta propre valeur.", q:"Quelles sont tes forces selon toi ?" },
    { val:"Tu es unique… mais tu te compares à des versions idéalisées.", q:"Qu'est-ce qui te rend unique ?" },
    { val:"Reviens à toi. Toujours.", q:"Qu'est-ce qui te définit vraiment ?" },
    { val:"Tu es en construction…\n\net c'est précieux.", q:"Qu'est-ce que tu construis en ce moment ?" },
  ],
  procrastination: [
    { val:"La procrastination cache souvent une peur…\n\npas un manque de volonté.", q:"Qu'est-ce que tu évites vraiment ?" },
    { val:"Tu n'as pas besoin de tout faire…\n\njuste de commencer.", q:"Par quoi pourrais-tu commencer ?" },
    { val:"Et si tu faisais juste 10% aujourd'hui ?", q:"Quelle serait cette première action ?" },
    { val:"Tu attends peut-être le bon moment…\n\nmais il n'existe pas.", q:"Qu'est-ce qui te fait attendre ?" },
    { val:"Le passage à l'action crée la clarté…\n\npas l'inverse.", q:"Qu'est-ce qui deviendrait plus clair si tu passais à l'action ?" },
    { val:"Tu veux bien faire… alors tu ne fais pas.\n\nÇa te parle ?", q:"Qu'est-ce que tu repousses en ce moment ?" },
    { val:"La peur de l'échec te bloque…\n\nmais l'inaction te bloque encore plus.", q:"Qu'est-ce qui pourrait t'arriver si tu essayais ?" },
    { val:"Tu n'as pas besoin d'être motivée…\n\ntu as besoin d'être engagée.", q:"Envers quoi veux-tu t'engager ?" },
    { val:"Si tu continues comme ça… où seras-tu dans 6 mois ?", q:"Et si tu commences aujourd'hui, qu'est-ce qui peut changer ?" },
    { val:"L'action crée la motivation.\n\nPas l'inverse.", q:"Quelle petite action pourrais-tu faire maintenant ?" },
  ],
  confusion: [
    { val:"Ne pas savoir par où commencer, c'est déjà une forme de conscience…\n\nça veut dire que tu cherches.", q:"Qu'est-ce qui te trouble le plus en ce moment ?" },
    { val:"La confusion précède souvent la clarté.\n\nTu es peut-être sur le point de comprendre quelque chose d'important.", q:"Qu'est-ce qui te pèse en silence ?" },
    { val:"Tu n'as pas besoin de tout savoir pour avancer.\n\nJuste de commencer quelque part.", q:"Si tu devais mettre des mots sur ce que tu ressens, ce serait quoi ?" },
  ],
  neutral: [
    { val:"Je suis là pour t'écouter, sans jugement.", q:"Qu'est-ce qui t'amène aujourd'hui ?" },
    { val:"Chaque femme arrive ici avec quelque chose à exprimer.", q:"Tu peux me confier ce que tu portes." },
  ],
};

// ── QUESTIONS DIAGNOSTIC ─────────────────────────────────────────────────────
const QUESTIONS = [
  {
    texte:"Dans quelle situation tu te sens le plus en difficulté aujourd'hui ?",
    choix:[
      { l:"A", t:"Quand je dois m'exprimer ou prendre la parole" },
      { l:"B", t:"Quand je me compare aux autres" },
      { l:"C", t:"Quand je dois prendre des décisions importantes" },
      { l:"D", t:"Quand je me regarde ou pense à mon image" },
    ],
  },
  {
    texte:"Quelle pensée revient le plus souvent dans ton esprit ?",
    choix:[
      { l:"A", t:"\"Je ne suis pas à la hauteur\"" },
      { l:"B", t:"\"Les autres sont mieux que moi\"" },
      { l:"C", t:"\"Je vais échouer\"" },
      { l:"D", t:"\"Je ne suis pas assez bien physiquement\"" },
    ],
  },
  {
    texte:"Quelle émotion te suit le plus en ce moment ?",
    choix:[
      { l:"A", t:"Le doute" },
      { l:"B", t:"L'insécurité" },
      { l:"C", t:"La peur" },
      { l:"D", t:"La frustration" },
    ],
  },
  {
    texte:"Face à ces situations, tu as tendance à…",
    choix:[
      { l:"A", t:"Te taire ou t'effacer" },
      { l:"B", t:"Te comparer encore plus" },
      { l:"C", t:"Reporter ou éviter" },
      { l:"D", t:"Te critiquer intérieurement" },
    ],
  },
  {
    texte:"Au fond de toi, qu'est-ce que tu veux vraiment ?",
    choix:[
      { l:"A", t:"Oser m'exprimer librement" },
      { l:"B", t:"Me sentir légitime et confiante" },
      { l:"C", t:"Passer à l'action sans peur" },
      { l:"D", t:"Me sentir belle et alignée avec moi-même" },
    ],
  },
];

// ── PROFILS ──────────────────────────────────────────────────────────────────
const PROFILS = {
  A: {
    nom:"La Silencieuse",
    accroche:"Tu as appris à te faire petite… pas parce que tu n'as rien à dire, mais parce que tu as douté de la valeur de ta voix.",
    blocage:"Un blocage à t'exprimer, à prendre ta place, à être entendue.",
    verite:"Ta voix n'est pas trop faible… elle a juste été trop longtemps ignorée.",
    cle:"Commence par t'exprimer dans des espaces sécurisés — l'écriture, l'audio, le miroir. Chaque mot exprimé renforce ta présence.",
    question:"Quelle est la chose que tu aurais aimé dire récemment mais que tu as gardée pour toi ?",
  },
  B: {
    nom:"La Comparée",
    accroche:"Tu vis beaucoup à travers le regard des autres… et sans t'en rendre compte, tu te diminues.",
    blocage:"La comparaison constante, le doute, la sensation d'être \"moins que\".",
    verite:"Tu ne manques pas de valeur. Tu manques d'ancrage dans ta propre identité.",
    cle:"Réduis les sources de comparaison et reconnecte-toi à toi. Ton chemin est unique — et tout aussi précieux.",
    question:"Dans quel domaine tu te compares le plus ?",
  },
  C: {
    nom:"L'Auto-bloquée",
    accroche:"Tu sais ce que tu veux… mais quelque chose t'empêche de passer à l'action.",
    blocage:"La frustration, la culpabilité, la stagnation malgré les envies.",
    verite:"Tu n'es pas paresseuse. Tu es freinée par la peur et le doute.",
    cle:"Arrête de viser parfait. Vise \"fait\". Une seule action imparfaite vaut mieux que mille projets parfaits dans ta tête.",
    question:"Quelle est la chose que tu repousses depuis trop longtemps ?",
  },
  D: {
    nom:"La Déconnectée",
    accroche:"Tu as du mal à te voir avec amour… et ton regard sur toi est souvent dur, critique.",
    blocage:"Ne pas te sentir belle, pas assez, pas alignée avec toi-même.",
    verite:"Ce n'est pas ton image qui est le problème… c'est le lien que tu as avec toi-même.",
    cle:"Chaque jour, trouve UNE chose que tu apprécies chez toi. Commence petit. C'est ainsi que le regard sur soi se transforme.",
    question:"Quand tu te regardes, qu'est-ce que tu vois en premier ?",
  },
};

// ── DÉTECTION D'INTENTION ────────────────────────────────────────────────────
function detectIntent(text) {
  const t = text.toLowerCase();
  if (/confian|doute|croi|légitim|capable|valeur|mérite|suffis|à la hauteur|prête/.test(t)) return "confidence";
  if (/regard|jugement|avis|critique|opinion|peur.*autres|plaire|acceptée/.test(t)) return "judgment";
  if (/belle|image|corps|miroir|physique|apparence|laide|moche|beauté|estime/.test(t)) return "image";
  if (/compar|mieux que|moins que|elles ont|elles sont|jalou/.test(t)) return "comparison";
  if (/procrastin|reporte|demain|tarde|plus tard|action|commence|bloqu|paralys|paresse/.test(t)) return "procrastination";
  if (/sais pas|perdue|comprends pas|quoi faire|comment|aide/.test(t)) return "confusion";
  return "neutral";
}

// ── COMPOSANT ────────────────────────────────────────────────────────────────
export default function AuraChatbot() {
  const navigate = useNavigate();

  const [open, setOpen]           = useState(false);
  const [messages, setMessages]   = useState([]);
  const [typing, setTyping]       = useState(false);
  const [choices, setChoices]     = useState(null);
  const [inputVal, setInputVal]   = useState("");
  const [sending, setSending]     = useState(false);
  const [badge, setBadge]         = useState(true);

  const [stage, setStage]         = useState("welcome");
  const [diagStep, setDiagStep]   = useState(0);
  const [scores, setScores]       = useState({ A:0, B:0, C:0, D:0 });
  const [exchCount, setExchCount] = useState(0);
  const [diagOffered, setDiagOffered] = useState(false);
  const [convOffered, setConvOffered] = useState(false);

  const memory    = useRef({ intent:null, keyPhrase:null });
  const scriptIdx = useRef({ confidence:0, judgment:0, image:0, comparison:0, procrastination:0, confusion:0, neutral:0 });
  const messagesRef = useRef(null);

  const scroll = useCallback(() => {
    setTimeout(() => {
      if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }, 60);
  }, []);

  const addMsg = useCallback((content, type = "bot", extra = {}) => {
    return new Promise(resolve => {
      setMessages(prev => [...prev, { content, type, id: Date.now() + Math.random(), ...extra }]);
      scroll();
      resolve();
    });
  }, [scroll]);

  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  const showTyping = useCallback(async (ms = 1300) => {
    setTyping(true);
    await wait(ms);
    setTyping(false);
  }, []);

  const getScript = useCallback((intent) => {
    const pool = SCRIPTS[intent] || SCRIPTS.neutral;
    const idx  = scriptIdx.current[intent] || 0;
    const item = pool[idx % pool.length];
    scriptIdx.current[intent] = idx + 1;
    return item;
  }, []);

  // Init au premier open
  useEffect(() => {
    if (!open || messages.length > 0) return;
    setBadge(false);
    (async () => {
      await showTyping(1000);
      await addMsg("Je sens que tu veux évoluer… mais qu'il y a quelque chose qui te freine encore.");
      await showTyping(1200);
      await addMsg("Et si on mettait des mots dessus ?\n\nJe peux t'aider à identifier ce qui bloque vraiment ta confiance et ton épanouissement.\n\nÇa ne prend qu'une minute.");
      setChoices([
        { t:"Oui, je suis prête", v:"oui" },
        { t:"Pas maintenant", v:"non" },
      ]);
    })();
  }, [open]);

  // Handler boutons
  const handleChoice = useCallback(async (choice) => {
    setChoices([]);

    if (stage === "welcome") {
      if (choice.v === "non") {
        await addMsg("Pas de souci.", "bot");
        await showTyping(800);
        await addMsg("Je suis là quand tu seras prête. Tu peux me parler à tout moment.");
        setChoices(null);
        return;
      }
      await addMsg("Oui, je suis prête.", "user");
      await showTyping(1000);
      await addMsg("Parfait.\n\nDis-moi… qu'est-ce qui t'amène aujourd'hui ?");
      setChoices([
        { t:"Manque de confiance en moi", v:"confidence", theme:true },
        { t:"Peur du regard des autres", v:"judgment", theme:true },
        { t:"Problème d'image / estime de soi", v:"image", theme:true },
        { t:"Je ne sais pas exactement", v:"confusion", theme:true },
      ]);
      setStage("chat");
      return;
    }

    if (stage === "chat") {
      memory.current.intent = choice.v;
      await addMsg(choice.t, "user");
      await showTyping(1100);
      await addMsg("Merci de me l'avoir dit.");
      await showTyping(1000);
      const script = getScript(choice.v);
      await addMsg(script.val);
      await showTyping(900);
      await addMsg(script.q);
      setExchCount(1);
      setChoices(null);
      return;
    }

    if (stage === "pre-diag") {
      if (choice.v === "oui") {
        await addMsg("Oui, je veux comprendre.", "user");
        await showTyping(900);
        await addMsg("Je vais te poser 5 questions.\n\nRéponds selon ce qui te correspond le mieux. Il n'y a pas de bonne ou mauvaise réponse.");
        await showTyping(1000);
        await addMsg(QUESTIONS[0].texte);
        setChoices(QUESTIONS[0].choix.map(c => ({ t:c.t, v:c.l, lettre:c.l })));
        setStage("diagnostic");
        setDiagStep(0);
      } else {
        await addMsg("Non, continuons à discuter.", "user");
        await showTyping(800);
        await addMsg("C'est tout à fait normal.\n\nOn peut continuer à discuter. Je suis là.");
        setChoices(null);
        setStage("chat");
      }
      return;
    }

    if (stage === "diagnostic") {
      await addMsg(choice.t, "user");
      const newScores = { ...scores, [choice.v]: (scores[choice.v] || 0) + 1 };
      setScores(newScores);

      const micro = ["Je note.", "Je comprends.", "Merci pour ta sincérité.", "C'est important.", "Je t'entends."];
      await showTyping(900);
      await addMsg(micro[diagStep % micro.length]);

      if (diagStep < 4) {
        await showTyping(1000);
        await addMsg(QUESTIONS[diagStep + 1].texte);
        setChoices(QUESTIONS[diagStep + 1].choix.map(c => ({ t:c.t, v:c.l, lettre:c.l })));
        setDiagStep(diagStep + 1);
      } else {
        setStage("loading");
        setChoices([]);
        await showTyping(700);
        await addMsg("Merci pour tes réponses…\n\nJe vais analyser ce que tu m'as partagé.");
        setTimeout(async () => {
          const top = Object.entries(newScores).sort((a,b) => b[1]-a[1])[0][0];
          const p   = PROFILS[top];
          memory.current.profil = top;
          setStage("result");
          await addMsg("profil-card", "profil-card", { profil: p });
          await showTyping(1400);
          await addMsg(p.question);
          await showTyping(1100);
          await addMsg("Ce que tu vis n'est pas une fatalité…\n\nC'est exactement le type de transformation que j'accompagne en profondeur dans Métamorphose.");
          setChoices([
            { t:"Je veux commencer ma transformation", v:"cta", cta:true },
            { t:"Comprendre davantage mon blocage", v:"approfondir" },
            { t:"Continuer à discuter", v:"chat-libre", ghost:true },
          ]);
        }, 3600);
      }
      return;
    }

    if (stage === "result") {
      if (choice.v === "cta") {
        navigate("/programme");
        return;
      }
      if (choice.v === "approfondir") {
        await addMsg("Comprendre davantage mon blocage.", "user");
        await showTyping(1200);
        await addMsg("Ce que tu vis ne date pas d'aujourd'hui…\n\nSouvent, ça vient d'expériences passées ou de schémas que tu as intégrés sans t'en rendre compte.");
        await showTyping(1400);
        await addMsg("Est-ce que tu te souviens d'un moment où tu as commencé à douter de toi ?");
        setChoices(null);
        setStage("post-result");
        return;
      }
      await addMsg("Continuer à discuter.", "user");
      await showTyping(800);
      await addMsg("Avec plaisir. Dis-moi… qu'est-ce qui te pèse encore ?");
      setChoices(null);
      setStage("post-result");
      return;
    }

    if (stage === "post-result" || stage === "conversion") {
      if (choice.v === "metamorphose") navigate("/programme");
      else {
        await addMsg("Continuer à discuter.", "user");
        await showTyping(800);
        await addMsg("Dis-moi… qu'est-ce qui te pèse encore ?");
        setChoices(null);
        setStage("post-result");
      }
    }
  }, [stage, diagStep, scores, getScript, navigate, addMsg, showTyping]);

  // Handler input libre
  const handleSend = useCallback(async () => {
    const text = inputVal.trim();
    if (!text || sending || typing) return;
    setSending(true);
    setInputVal("");
    await addMsg(text, "user");

    const intent = detectIntent(text);
    if (intent !== "neutral") memory.current.intent = intent;
    if (text.length < 80) memory.current.keyPhrase = text;

    const newCount = exchCount + 1;
    setExchCount(newCount);

    const currentIntent = memory.current.intent || intent;
    const script = getScript(currentIntent);

    const useMemRef = memory.current.keyPhrase && newCount > 1 && Math.random() > 0.55;
    const val = useMemRef
      ? `Tu m'as dit "${memory.current.keyPhrase}"…\n\n${script.val}`
      : script.val;

    await showTyping(1200 + Math.random() * 600);
    await addMsg(val);
    await showTyping(900);
    await addMsg(script.q);

    // Proposer diagnostic après 2 échanges
    if (newCount >= 2 && !diagOffered) {
      setDiagOffered(true);
      await showTyping(1100);
      await addMsg("Si tu veux, je peux t'aider à identifier précisément ce qui te bloque…\n\nJ'ai un diagnostic rapide qui peut t'apporter beaucoup de clarté.");
      setChoices([
        { t:"Oui, je veux comprendre", v:"oui" },
        { t:"Non, continuons à discuter", v:"non" },
      ]);
      setStage("pre-diag");
      setSending(false);
      return;
    }

    // Conversion subtile après 4 échanges
    if (newCount >= 4 && !convOffered && stage !== "pre-diag") {
      setConvOffered(true);
      await showTyping(1200);
      await addMsg("Tu sais…\n\nce que tu ressens, beaucoup de femmes le vivent en silence.\n\nMais certaines décident de ne plus rester bloquées.\n\nC'est exactement pour ça que Métamorphose existe — pour t'aider à te reconstruire, te révéler et t'assumer pleinement.");
      setChoices([
        { t:"Découvrir Métamorphose", v:"metamorphose", cta:true },
        { t:"Continuer à discuter", v:"discuter", ghost:true },
      ]);
      setStage("conversion");
      setSending(false);
      return;
    }

    setChoices(null);
    setSending(false);
  }, [inputVal, sending, typing, exchCount, diagOffered, convOffered, stage, addMsg, showTyping, getScript]);

  const handleKey = (e) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const progression = stage === "diagnostic" ? ((diagStep / 5) * 100) : stage === "loading" ? 100 : 0;
  const showProgress = stage === "diagnostic" || stage === "loading";
  const showInput    = choices === null && !typing && !["loading","welcome","result"].includes(stage);

  return (
    <>
      <style>{STYLES}</style>

      {!open && (
        <button className="aura-fab" onClick={() => setOpen(true)} aria-label="Parler à Aura">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/>
            <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
          {badge && <div className="aura-badge">1</div>}
        </button>
      )}

      {open && (
        <div className="aura-window">
          <div className="aura-header">
            <div className="aura-avatar-wrap">
              <div className="aura-avatar">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,.9)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/>
                  <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              </div>
              <div className="aura-online"/>
            </div>
            <div className="aura-header-info">
              <div className="aura-header-name">Aura Métamorphose</div>
              <div className="aura-header-sub">Coach émotionnelle intelligente</div>
            </div>
            <button className="aura-close" onClick={() => setOpen(false)}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>

          {showProgress && (
            <div className="aura-progress-bar">
              <div className="aura-progress-fill" style={{ width:`${progression}%` }}/>
            </div>
          )}

          {stage === "diagnostic" && (
            <div className="aura-step-indicator">
              {[0,1,2,3,4].map(i => (
                <div key={i} className={`aura-step-dot ${i < diagStep ? "done" : i === diagStep ? "current" : ""}`}/>
              ))}
            </div>
          )}

          <div className="aura-messages" ref={messagesRef}>
            {messages.map(msg => (
              <div key={msg.id} className={`aura-bubble-wrap ${msg.type === "user" ? "user" : "bot"}`}>
                {msg.type === "profil-card" && msg.profil ? (
                  <div className="aura-bubble profil">
                    <div className="aura-profil-tag">Ton profil</div>
                    <div className="aura-profil-titre">{msg.profil.nom}</div>
                    <p style={{ fontSize:".8rem", fontWeight:300, color:"#4a0a20", lineHeight:1.65, marginBottom:12, fontStyle:"italic" }}>{msg.profil.accroche}</p>
                    <div className="aura-profil-bloc">
                      <div className="aura-profil-bloc-label">Ce qui te bloque</div>
                      <div className="aura-profil-bloc-text">{msg.profil.blocage}</div>
                    </div>
                    <div className="aura-profil-bloc">
                      <div className="aura-profil-bloc-label">La vérité</div>
                      <div className="aura-profil-bloc-text">{msg.profil.verite}</div>
                    </div>
                    <div className="aura-profil-bloc">
                      <div className="aura-profil-bloc-label">Ta première clé</div>
                      <div className="aura-profil-bloc-text">{msg.profil.cle}</div>
                    </div>
                  </div>
                ) : (
                  <div className={`aura-bubble ${msg.type}`} style={{ whiteSpace:"pre-line" }}>
                    {msg.content}
                  </div>
                )}
              </div>
            ))}
            {typing && (
              <div className="aura-bubble-wrap bot">
                <div className="aura-typing"><span/><span/><span/></div>
              </div>
            )}
          </div>

          {stage === "loading" && (
            <div className="aura-loader">
              <div className="aura-loader-bar"><div className="aura-loader-fill"/></div>
              <div className="aura-loader-text">Analyse de ton profil en cours…</div>
            </div>
          )}

          {choices && choices.length > 0 && !typing && (
            <div className="aura-choices">
              {choices.map((c, i) => (
                <button
                  key={i}
                  className={`aura-choice${c.theme?" theme":""}${c.cta?" cta":""}${c.ghost?" ghost":""}`}
                  onClick={() => handleChoice(c)}
                >
                  {c.lettre && (
                    <span style={{ fontWeight:700, color:c.cta?"rgba(255,255,255,.7)":"#C2185B", marginRight:6, fontSize:".76rem" }}>
                      {c.lettre}.
                    </span>
                  )}
                  {c.t}
                </button>
              ))}
            </div>
          )}

          {showInput && (
            <div className="aura-input-area">
              <div className="aura-input-row">
                <textarea
                  className="aura-input"
                  rows={1}
                  placeholder="Écris ce que tu ressens…"
                  value={inputVal}
                  onChange={e => setInputVal(e.target.value)}
                  onKeyDown={handleKey}
                />
                <button className="aura-send" onClick={handleSend} disabled={!inputVal.trim() || sending || typing}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
                  </svg>
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}
