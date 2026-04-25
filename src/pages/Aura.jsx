import { useState, useEffect, useRef } from "react";
import usePageBackground from "../hooks/usePageBackground";
import { Link, useNavigate } from "react-router-dom";

// ── STYLES ────────────────────────────────────────────────────────────────────
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,300;1,400&family=Montserrat:wght@200;300;400;500;600;700&family=Cormorant+Garamond:ital,wght@0,300;1,300;1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --brun:#2A1506; --brun-mid:#4A2510; --brun-or:#7A4A1A;
    --or:#C9A96A; --or-light:#E8D5A8; --or-pale:#F2EBE0;
    --rose:#C2185B; --rose-pale:rgba(194,24,91,.08);
    --blanc:#F8F5F2;
    --texte:#F2EBE0; --texte-sub:rgba(242,235,224,.62); --texte-muted:rgba(242,235,224,.35);
    --surface:rgba(255,255,255,.055); --surface-h:rgba(255,255,255,.09);
    --border:rgba(201,169,106,.18); --border-h:rgba(201,169,106,.4);
    --ff-t:'Playfair Display',Georgia,serif;
    --ff-b:'Montserrat',sans-serif;
    --ff-a:'Cormorant Garamond',Georgia,serif;
    --ease:cubic-bezier(.16,1,.3,1);
  }
  html { scroll-behavior:smooth; }
  body { background:linear-gradient(160deg,#2A1506 0%,#4A2510 35%,#7A4A1A 65%,#C9A96A 100%); min-height:100vh; color:var(--texte); font-family:var(--ff-b); font-weight:300; line-height:1.7; overflow-x:hidden; }

  @keyframes fadeUp  { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
  @keyframes msgIn   { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }
  @keyframes dot     { 0%,80%,100%{transform:translateY(0);opacity:.3} 40%{transform:translateY(-5px);opacity:1} }
  @keyframes pulse-or{ 0%,100%{box-shadow:0 0 0 0 rgba(201,169,106,.3)} 60%{box-shadow:0 0 0 10px rgba(201,169,106,0)} }
  @keyframes reveal  { from{opacity:0;transform:scale(.97) translateY(8px)} to{opacity:1;transform:none} }
  @keyframes prog    { from{width:0} to{width:100%} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }

  /* ── Navbar ── */
  .av-nav {
    position:sticky; top:0; z-index:100;
    display:flex; align-items:center; justify-content:space-between;
    padding:0 40px; height:64px;
    background:rgba(42,21,6,.78); backdrop-filter:blur(24px);
    border-bottom:1px solid rgba(201,169,106,.12);
  }
  .av-brand { font-family:var(--ff-t); font-size:1.05rem; color:var(--or-light); text-decoration:none; letter-spacing:.04em; }
  .av-back  { font-family:var(--ff-b); font-size:.6rem; letter-spacing:.22em; text-transform:uppercase; color:rgba(248,245,242,.35); text-decoration:none; transition:color .3s; }
  .av-back:hover { color:var(--or); }

  /* ── Header ── */
  .av-header { text-align:center; padding:36px 20px 20px; position:relative; z-index:2; }
  .av-avatar {
    width:68px; height:68px; border-radius:50%;
    background:linear-gradient(135deg,var(--brun-or),var(--or));
    display:flex; align-items:center; justify-content:center;
    margin:0 auto 14px;
    box-shadow:0 0 0 1px rgba(201,169,106,.28), 0 8px 28px rgba(201,169,106,.18);
    animation:pulse-or 3.5s ease infinite;
  }
  .av-name   { font-family:var(--ff-t); font-size:1.35rem; color:var(--or-pale); margin-bottom:4px; letter-spacing:.02em; }
  .av-sub    { font-size:.6rem; letter-spacing:.24em; text-transform:uppercase; color:var(--or); opacity:.75; }
  .av-status { display:flex; align-items:center; gap:6px; justify-content:center; margin-top:10px; font-size:.58rem; letter-spacing:.18em; text-transform:uppercase; color:rgba(248,245,242,.3); }
  .av-dot    { width:6px; height:6px; border-radius:50%; background:#4CAF50; box-shadow:0 0 6px #4CAF50; }

  /* ── Chat wrapper ── */
  .av-wrap { flex:1; display:flex; flex-direction:column; max-width:760px; margin:0 auto; width:100%; padding:0 16px 20px; position:relative; z-index:2; }

  .av-msgs {
    flex:1; overflow-y:auto; padding:16px 0 8px;
    display:flex; flex-direction:column; gap:14px;
    min-height:320px; max-height:calc(100vh - 310px);
    scrollbar-width:thin; scrollbar-color:rgba(201,169,106,.12) transparent;
  }
  .av-msgs::-webkit-scrollbar { width:3px; }
  .av-msgs::-webkit-scrollbar-thumb { background:rgba(201,169,106,.12); border-radius:2px; }

  /* ── Bulles ── */
  .av-row { display:flex; gap:10px; animation:msgIn .35s var(--ease) both; }
  .av-row.user { flex-direction:row-reverse; }

  .av-ico {
    width:32px; height:32px; border-radius:50%; flex-shrink:0; margin-top:3px;
    background:linear-gradient(135deg,var(--brun-or),var(--or));
    display:flex; align-items:center; justify-content:center;
  }
  .av-row.user .av-ico { background:rgba(201,169,106,.12); border:1px solid rgba(201,169,106,.2); }

  .av-bub {
    max-width:76%; padding:13px 17px; border-radius:18px;
    font-size:.82rem; line-height:1.72; white-space:pre-wrap; word-break:break-word;
  }
  .av-bub.bot  { background:rgba(42,21,6,.5); border:1px solid rgba(201,169,106,.16); border-radius:4px 18px 18px 18px; color:var(--texte); backdrop-filter:blur(10px); }
  .av-bub.user { background:var(--rose); color:#fff; border-radius:18px 18px 4px 18px; font-weight:400; }

  /* ── Typing ── */
  .av-typing { display:flex; gap:5px; padding:14px 17px; background:rgba(42,21,6,.5); border:1px solid rgba(201,169,106,.16); border-radius:4px 18px 18px 18px; width:fit-content; backdrop-filter:blur(10px); }
  .av-typing-dot { width:7px; height:7px; border-radius:50%; background:rgba(248,245,242,.35); animation:dot 1.2s ease infinite; }
  .av-typing-dot:nth-child(2) { animation-delay:.15s; }
  .av-typing-dot:nth-child(3) { animation-delay:.3s; }

  /* ── Boutons rapides ── */
  .av-btns { display:flex; flex-wrap:wrap; gap:8px; margin-top:10px; padding-left:42px; }
  .av-btn {
    font-family:var(--ff-b); font-size:.67rem; font-weight:400; letter-spacing:.08em;
    padding:9px 18px; border-radius:20px; cursor:pointer; transition:all .22s;
    border:1px solid var(--border); background:rgba(42,21,6,.45);
    color:var(--or-light); white-space:nowrap; backdrop-filter:blur(6px);
  }
  .av-btn:hover { background:rgba(201,169,106,.12); border-color:var(--or); transform:translateY(-1px); }
  .av-btn.rose  { border-color:rgba(194,24,91,.35); background:rgba(194,24,91,.07); color:rgba(242,200,215,.9); }
  .av-btn.rose:hover { background:rgba(194,24,91,.16); border-color:rgba(194,24,91,.6); }
  .av-btn.ghost { background:transparent; color:rgba(248,245,242,.35); font-size:.62rem; }

  /* ── Diagnostic ── */
  .av-prog-wrap { margin:8px 0 0 42px; }
  .av-prog-label { font-size:.57rem; letter-spacing:.2em; text-transform:uppercase; color:var(--texte-muted); margin-bottom:6px; }
  .av-prog-bar { height:2px; background:rgba(201,169,106,.1); border-radius:2px; overflow:hidden; }
  .av-prog-fill { height:100%; background:linear-gradient(90deg,var(--rose),var(--or)); border-radius:2px; transition:width .5s var(--ease); }

  .av-diag {
    margin:10px 0 0 42px; padding:20px; border-radius:12px;
    background:rgba(42,21,6,.52); border:1px solid rgba(201,169,106,.18);
    animation:reveal .4s var(--ease) both; backdrop-filter:blur(10px);
  }
  .av-diag-q { font-family:var(--ff-t); font-size:.95rem; color:var(--blanc); margin-bottom:14px; line-height:1.5; font-weight:400; }
  .av-diag-opts { display:flex; flex-direction:column; gap:8px; }
  .av-diag-opt {
    display:flex; align-items:center; gap:12px; padding:11px 15px; border-radius:8px;
    border:1px solid rgba(201,169,106,.14); background:rgba(255,255,255,.025);
    cursor:pointer; transition:all .22s; text-align:left;
    font-family:var(--ff-b); font-size:.76rem; color:var(--texte-sub);
  }
  .av-diag-opt:hover { border-color:rgba(194,24,91,.4); background:rgba(194,24,91,.06); color:var(--blanc); }
  .av-diag-letter { width:24px; height:24px; border-radius:50%; border:1px solid rgba(201,169,106,.38); display:flex; align-items:center; justify-content:center; font-size:.6rem; font-weight:600; letter-spacing:.08em; color:var(--or); flex-shrink:0; }

  /* ── Loader ── */
  .av-loader {
    margin:10px 0 0 42px; padding:22px; border-radius:12px;
    background:rgba(42,21,6,.52); border:1px solid rgba(201,169,106,.18);
    text-align:center; backdrop-filter:blur(10px); animation:reveal .4s var(--ease) both;
  }
  .av-loader-bar { height:2px; background:rgba(201,169,106,.1); border-radius:2px; overflow:hidden; margin-bottom:12px; }
  .av-loader-fill { height:100%; background:linear-gradient(90deg,var(--rose),var(--or),var(--rose)); background-size:200% auto; animation:prog 3.5s linear both; }
  .av-loader-text { font-size:.65rem; letter-spacing:.16em; text-transform:uppercase; color:rgba(248,245,242,.35); }

  /* ── Profil ── */
  .av-profil {
    margin:10px 0 0 42px; padding:24px; border-radius:12px;
    background:rgba(42,21,6,.58); border:1px solid rgba(201,169,106,.22);
    animation:reveal .5s var(--ease) both; backdrop-filter:blur(10px);
  }
  .av-profil-tag {
    display:inline-block; padding:4px 14px; border-radius:20px;
    background:rgba(194,24,91,.12); border:1px solid rgba(194,24,91,.28);
    font-size:.57rem; font-weight:600; letter-spacing:.18em; text-transform:uppercase;
    color:rgba(242,200,215,.9); margin-bottom:12px;
  }
  .av-profil-titre { font-family:var(--ff-t); font-size:1.1rem; color:var(--blanc); margin-bottom:8px; font-weight:600; }
  .av-profil-accroche { font-family:var(--ff-a); font-style:italic; font-size:.95rem; color:rgba(248,245,242,.72); line-height:1.75; margin-bottom:18px; }
  .av-profil-bloc { padding:12px 14px; border-radius:8px; background:rgba(255,255,255,.03); border:1px solid rgba(201,169,106,.12); margin-bottom:10px; }
  .av-profil-bloc:last-child { margin-bottom:0; }
  .av-profil-bloc-label { font-size:.55rem; font-weight:600; letter-spacing:.2em; text-transform:uppercase; color:rgba(201,169,106,.55); margin-bottom:5px; }
  .av-profil-bloc-text  { font-size:.79rem; color:rgba(248,245,242,.78); line-height:1.68; font-weight:300; }

  /* ── CTA conversion ── */
  .av-cta {
    margin-top:12px; padding:16px 18px; border-radius:10px;
    background:rgba(194,24,91,.07); border:1px solid rgba(194,24,91,.2);
    animation:reveal .5s var(--ease) both;
  }
  .av-cta-text { font-size:.79rem; color:rgba(248,245,242,.78); line-height:1.6; margin-bottom:12px; }
  .av-cta-btn {
    display:inline-block; padding:10px 22px; background:var(--rose); color:#fff; border:none; border-radius:20px;
    font-family:var(--ff-b); font-size:.65rem; font-weight:600; letter-spacing:.14em; text-transform:uppercase;
    text-decoration:none; cursor:pointer; transition:all .25s;
  }
  .av-cta-btn:hover { background:#a01049; transform:translateY(-1px); }

  /* ── Input ── */
  .av-input-area {
    display:flex; gap:10px; align-items:flex-end;
    padding:14px 0 0; border-top:1px solid rgba(201,169,106,.1);
  }
  .av-input {
    flex:1; background:rgba(42,21,6,.52); border:1px solid rgba(201,169,106,.18);
    border-radius:22px; padding:12px 18px; color:var(--texte);
    font-family:var(--ff-b); font-size:.82rem; resize:none; outline:none;
    transition:border-color .3s; max-height:120px; min-height:44px; line-height:1.5;
    backdrop-filter:blur(8px);
  }
  .av-input::placeholder { color:rgba(248,245,242,.22); }
  .av-input:focus { border-color:rgba(201,169,106,.45); }
  .av-input:disabled { opacity:.45; }

  .av-send {
    width:44px; height:44px; border-radius:50%; border:none; flex-shrink:0;
    background:var(--rose); color:#fff; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:all .25s;
  }
  .av-send:hover:not(:disabled) { background:#a01049; transform:scale(1.06); }
  .av-send:disabled { opacity:.35; cursor:not-allowed; transform:none; }

  .av-page { min-height:100vh; display:flex; flex-direction:column; position:relative; overflow:hidden; }

  @media(max-width:600px) {
    .av-nav  { padding:0 20px; }
    .av-bub  { max-width:90%; font-size:.8rem; }
    .av-diag, .av-profil, .av-loader { margin-left:0; }
    .av-btns, .av-prog-wrap { padding-left:0; }
  }
`;

// ── SCRIPTS PAR PILIER ────────────────────────────────────────────────────────
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
    { val:"Ton corps n'est pas ton ennemi.\n\nC'est ton regard qui peut l'être.", q:"Comment te réconcilies-tu avec toi ?" },
    { val:"La beauté est une énergie… pas un standard.", q:"Quelle énergie veux-tu dégager ?" },
    { val:"Et si tu arrêtais de chercher à ressembler…\n\npour commencer à te révéler ?", q:"Qui es-tu vraiment ?" },
    { val:"Quelle est UNE chose que tu apprécies chez toi, même légèrement ?", q:"Commence par là." },
  ],
  comparison: [
    { val:"La comparaison est un piège silencieux…\n\nelle te fait oublier qui tu es.", q:"À qui te compares-tu le plus ?" },
    { val:"Tu vois leur résultat…\n\nmais pas leur parcours.", q:"Qu'est-ce que ça change pour toi ?" },
    { val:"Tu n'es pas en retard…\n\ntu es sur TON chemin.", q:"Qu'est-ce qui est important pour toi sur ce chemin ?" },
    { val:"Chaque personne avance à son rythme.\n\nLe tien est tout aussi valable.", q:"Qu'est-ce qui te définit vraiment ?" },
    { val:"La comparaison te diminue.\n\nL'acceptation te libère.", q:"Comment peux-tu commencer à t'accepter ?" },
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
    { val:"Je t'entends.\n\nChaque mot que tu poses est déjà un pas vers toi-même.", q:"Qu'est-ce qui t'amène aujourd'hui ?" },
    { val:"Ce que tu partages mérite toute ton attention.\n\nPrends le temps de ressentir sans te juger.", q:"Qu'est-ce qui te pèse en ce moment ?" },
    { val:"Tu n'es pas seule sur ce chemin.\n\nLa transformation commence toujours par ce moment — celui où on ose dire les choses.", q:"Qu'est-ce que tu aimerais changer ?" },
  ],
};

// ── QUESTIONS ─────────────────────────────────────────────────────────────────
const QUESTIONS = [
  {
    q:"Dans quelle situation tu te sens le plus en difficulté aujourd'hui ?",
    opts:[
      { l:"A", t:"Quand je dois m'exprimer ou prendre la parole" },
      { l:"B", t:"Quand je me compare aux autres" },
      { l:"C", t:"Quand je dois prendre des décisions importantes" },
      { l:"D", t:"Quand je me regarde ou pense à mon image" },
    ],
  },
  {
    q:"Quelle pensée revient le plus souvent dans ton esprit ?",
    opts:[
      { l:"A", t:"\"Je ne suis pas à la hauteur\"" },
      { l:"B", t:"\"Les autres sont mieux que moi\"" },
      { l:"C", t:"\"Je vais échouer\"" },
      { l:"D", t:"\"Je ne suis pas assez bien physiquement\"" },
    ],
  },
  {
    q:"Quelle émotion te suit le plus en ce moment ?",
    opts:[
      { l:"A", t:"Le doute" },
      { l:"B", t:"L'insécurité" },
      { l:"C", t:"La peur" },
      { l:"D", t:"La frustration" },
    ],
  },
  {
    q:"Face à ces situations, tu as tendance à…",
    opts:[
      { l:"A", t:"Te taire ou t'effacer" },
      { l:"B", t:"Te comparer encore plus" },
      { l:"C", t:"Reporter ou éviter" },
      { l:"D", t:"Te critiquer intérieurement" },
    ],
  },
  {
    q:"Au fond de toi, qu'est-ce que tu veux vraiment ?",
    opts:[
      { l:"A", t:"Oser m'exprimer librement" },
      { l:"B", t:"Me sentir légitime et confiante" },
      { l:"C", t:"Passer à l'action sans peur" },
      { l:"D", t:"Me sentir belle et alignée avec moi-même" },
    ],
  },
];

// ── PROFILS ───────────────────────────────────────────────────────────────────
const PROFILS = {
  A: {
    label:"La Silencieuse",
    accroche:"Tu as appris à te faire petite… pas parce que tu n'as rien à dire, mais parce que tu as douté de la valeur de ta voix.",
    blocage:"Un blocage profond à t'exprimer, à prendre ta place, à être entendue.",
    verite:"Ta voix n'est pas trop faible… elle a juste été trop longtemps ignorée.",
    cle:"Commence par t'exprimer dans des espaces sécurisés — l'écriture, l'audio, le miroir. Chaque mot exprimé renforce ta présence.",
    question:"Quelle est la chose que tu aurais aimé dire récemment mais que tu as gardée pour toi ?",
  },
  B: {
    label:"La Comparée",
    accroche:"Tu vis beaucoup à travers le regard des autres… et sans t'en rendre compte, tu te diminues.",
    blocage:"La comparaison constante, le doute, la sensation d'être constamment \"moins que\".",
    verite:"Tu ne manques pas de valeur. Tu manques d'ancrage dans ta propre identité.",
    cle:"Réduis les sources de comparaison et reconnecte-toi à toi. Ton chemin est unique — et tout aussi précieux.",
    question:"Dans quel domaine tu te compares le plus ?",
  },
  C: {
    label:"L'Auto-bloquée",
    accroche:"Tu sais ce que tu veux… mais quelque chose t'empêche de passer à l'action.",
    blocage:"La frustration, la culpabilité, la stagnation malgré les envies et les projets.",
    verite:"Tu n'es pas paresseuse. Tu es freinée par la peur et le doute.",
    cle:"Arrête de viser parfait. Vise \"fait\". Une seule action imparfaite vaut mieux que mille projets parfaits dans ta tête.",
    question:"Quelle est la chose que tu repousses depuis trop longtemps ?",
  },
  D: {
    label:"La Déconnectée",
    accroche:"Tu as du mal à te voir avec amour… et ton regard sur toi est souvent dur, critique.",
    blocage:"Ne pas te sentir belle, pas assez, pas alignée avec toi-même.",
    verite:"Ce n'est pas ton image qui est le problème… c'est le lien que tu as avec toi-même.",
    cle:"Chaque jour, trouve UNE chose que tu apprécies chez toi. Commence petit. C'est ainsi que le regard sur soi se transforme.",
    question:"Quand tu te regardes, qu'est-ce que tu vois en premier ?",
  },
};

// ── DÉTECTION D'INTENTION ─────────────────────────────────────────────────────
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

function calculerProfil(reponses) {
  const count = { A:0, B:0, C:0, D:0 };
  reponses.forEach(r => { if (count[r] !== undefined) count[r]++; });
  return Object.entries(count).sort((a,b) => b[1]-a[1])[0][0];
}

// ── COMPOSANT PRINCIPAL ───────────────────────────────────────────────────────
export default function Aura() {
  usePageBackground("aura");
  const navigate = useNavigate();

  const [messages,     setMessages]     = useState([]);
  const [input,        setInput]        = useState("");
  const [isTyping,     setIsTyping]     = useState(false);
  const [phase,        setPhase]        = useState("welcome"); // welcome|chat|pre-diag|diag|loading|profil|post|conversion
  const [diagStep,     setDiagStep]     = useState(0);
  const [diagRep,      setDiagRep]      = useState([]);
  const [profil,       setProfil]       = useState(null);
  const [exchCount,    setExchCount]    = useState(0);
  const [diagOffered,  setDiagOffered]  = useState(false);
  const [convOffered,  setConvOffered]  = useState(false);

  const memory    = useRef({ intent:null, keyPhrase:null });
  const scriptIdx = useRef({ confidence:0, judgment:0, image:0, comparison:0, procrastination:0, confusion:0, neutral:0 });
  const bottomRef = useRef(null);

  const scroll = () => setTimeout(() => bottomRef.current?.scrollIntoView({ behavior:"smooth" }), 60);

  // Injection CSS
  useEffect(() => {
    const id = "aura-v3-styles";
    if (!document.getElementById(id)) {
      const s = document.createElement("style");
      s.id = id; s.textContent = STYLES;
      document.head.appendChild(s);
    }
    return () => { document.getElementById(id)?.remove(); };
  }, []);

  function addMsg(role, content, extra = {}) {
    setMessages(prev => [...prev, { role, content, id:Date.now()+Math.random(), ...extra }]);
    scroll();
  }

  const delay = (ms) => new Promise(r => setTimeout(r, ms));

  async function showTyping(ms = 1300) {
    setIsTyping(true);
    await delay(ms);
    setIsTyping(false);
  }

  function getScript(intent) {
    const pool = SCRIPTS[intent] || SCRIPTS.neutral;
    const idx  = scriptIdx.current[intent] || 0;
    const item = pool[idx % pool.length];
    scriptIdx.current[intent] = idx + 1;
    return item;
  }

  // Init
  useEffect(() => {
    if (messages.length > 0) return;
    (async () => {
      await showTyping(900);
      addMsg("aura", "Je sens que tu veux évoluer… mais qu'il y a quelque chose qui te freine encore.");
      await showTyping(1200);
      addMsg("aura", "Et si on mettait des mots dessus ?\n\nJe peux t'aider à identifier ce qui bloque vraiment ta confiance et ton épanouissement.\n\nÇa ne prend qu'une minute.", { type:"welcome" });
    })();
  }, []);

  // ── Choix accueil ────────────────────────────────────────────
  async function onWelcome(v) {
    if (v === "non") {
      addMsg("aura", "Je suis là quand tu seras prête. Tu peux me parler à tout moment.");
      setPhase("chat");
      return;
    }
    addMsg("user", "Oui, je suis prête.");
    await showTyping(1000);
    addMsg("aura", "Parfait.\n\nDis-moi… qu'est-ce qui t'amène aujourd'hui ?", { type:"theme" });
    setPhase("chat");
  }

  async function onTheme(v) {
    memory.current.intent = v;
    const labels = { confidence:"Manque de confiance en moi", judgment:"Peur du regard des autres", image:"Problème d'image / estime de soi", confusion:"Je ne sais pas exactement" };
    addMsg("user", labels[v] || v);
    await showTyping(1100);
    addMsg("aura", "Merci de me l'avoir dit.");
    await showTyping(1000);
    const script = getScript(v);
    addMsg("aura", script.val);
    await showTyping(900);
    addMsg("aura", script.q);
    setExchCount(1);
    setPhase("free");
  }

  // ── Proposition diagnostic ───────────────────────────────────
  async function onPreDiag(v) {
    if (v === "oui") {
      addMsg("user", "Oui, je veux comprendre.");
      await showTyping(900);
      addMsg("aura", "Je vais te poser 5 questions.\n\nRéponds selon ce qui te correspond le mieux. Il n'y a pas de bonne ou mauvaise réponse.");
      await showTyping(1000);
      addMsg("aura", QUESTIONS[0].q, { type:"diag", step:0 });
      setPhase("diag");
      setDiagStep(0);
      setDiagRep([]);
    } else {
      addMsg("user", "Non, continuons à discuter.");
      await showTyping(800);
      addMsg("aura", "C'est tout à fait normal. Je suis là.");
      setPhase("free");
    }
  }

  // ── Réponse diagnostic ───────────────────────────────────────
  async function onDiagRep(lettre, texte) {
    addMsg("user", texte);
    const newRep = [...diagRep, lettre];
    setDiagRep(newRep);

    const micro = ["Je note.", "Je comprends.", "Merci pour ta sincérité.", "C'est important.", "Je t'entends."];
    await showTyping(900);
    addMsg("aura", micro[diagStep % micro.length]);

    if (diagStep < 4) {
      await showTyping(1000);
      addMsg("aura", QUESTIONS[diagStep+1].q, { type:"diag", step:diagStep+1 });
      setDiagStep(diagStep+1);
    } else {
      setPhase("loading");
      await showTyping(700);
      addMsg("aura", "Merci pour tes réponses…\n\nJe vais analyser ce que tu m'as partagé.", { type:"loading" });
      setTimeout(async () => {
        const code = calculerProfil(newRep);
        const p    = PROFILS[code];
        setProfil(code);
        setPhase("profil");
        addMsg("aura", "", { type:"profil", profil:p });
        await showTyping(1400);
        addMsg("aura", p.question);
        await showTyping(1100);
        addMsg("aura", "Ce que tu vis n'est pas une fatalité…\n\nC'est exactement le type de transformation que j'accompagne en profondeur dans Métamorphose.", { type:"post-profil" });
      }, 3600);
    }
  }

  // ── Après profil ─────────────────────────────────────────────
  async function onPostProfil(v) {
    if (v === "cta") { navigate("/programme"); return; }
    if (v === "approfondir") {
      addMsg("user", "Comprendre davantage mon blocage.");
      await showTyping(1200);
      addMsg("aura", "Ce que tu vis ne date pas d'aujourd'hui…\n\nSouvent, ça vient d'expériences passées ou de schémas que tu as intégrés sans t'en rendre compte.");
      await showTyping(1400);
      addMsg("aura", "Est-ce que tu te souviens d'un moment où tu as commencé à douter de toi ?");
      setPhase("free");
    } else {
      addMsg("user", "Continuer à discuter.");
      await showTyping(800);
      addMsg("aura", "Avec plaisir. Dis-moi… qu'est-ce qui te pèse encore ?");
      setPhase("free");
    }
  }

  // ── Conversion ───────────────────────────────────────────────
  async function onConversion(v) {
    if (v === "programme") { navigate("/programme"); return; }
    addMsg("user", "Continuer à discuter.");
    await showTyping(800);
    addMsg("aura", "Dis-moi… qu'est-ce qui te pèse encore ?");
    setPhase("free");
  }

  // ── Envoi message libre ──────────────────────────────────────
  async function onSend() {
    const txt = input.trim();
    if (!txt || isTyping) return;
    setInput("");
    addMsg("user", txt);

    const intent = detectIntent(txt);
    if (intent !== "neutral") memory.current.intent = intent;
    if (txt.length < 80) memory.current.keyPhrase = txt;

    const newCount = exchCount + 1;
    setExchCount(newCount);

    const currentIntent = memory.current.intent || intent;
    const script = getScript(currentIntent);
    const useRef  = memory.current.keyPhrase && newCount > 1 && Math.random() > 0.55;
    const val     = useRef ? `Tu m'as dit "${memory.current.keyPhrase}"…\n\n${script.val}` : script.val;

    await showTyping(1200 + Math.random()*600);
    addMsg("aura", val);
    await showTyping(900);
    addMsg("aura", script.q);

    // Proposer diagnostic
    if (newCount >= 2 && !diagOffered) {
      setDiagOffered(true);
      await showTyping(1100);
      addMsg("aura", "Si tu veux, je peux t'aider à identifier précisément ce qui te bloque…\n\nJ'ai un diagnostic rapide qui peut t'apporter beaucoup de clarté.", { type:"pre-diag" });
      setPhase("pre-diag");
      return;
    }

    // Conversion subtile
    if (newCount >= 4 && !convOffered) {
      setConvOffered(true);
      await showTyping(1200);
      addMsg("aura", "Tu sais…\n\nce que tu ressens, beaucoup de femmes le vivent en silence.\n\nMais certaines décident de ne plus rester bloquées.\n\nC'est exactement pour ça que Métamorphose existe — pour t'aider à te reconstruire, te révéler et t'assumer pleinement.", { type:"conversion" });
      setPhase("conversion");
    }
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); onSend(); }
  }

  // ── Rendu messages ────────────────────────────────────────────
  function renderMsg(msg) {
    if (msg.role === "user") {
      return (
        <div key={msg.id} className="av-row user">
          <div className="av-ico">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(201,169,106,.6)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
          </div>
          <div className="av-bub user">{msg.content}</div>
        </div>
      );
    }

    const Avatar = () => (
      <div className="av-ico">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(42,21,6,.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
      </div>
    );

    // Message d'accueil
    if (msg.type === "welcome") {
      return (
        <div key={msg.id} className="av-row">
          <Avatar/>
          <div style={{ flex:1 }}>
            <div className="av-bub bot">{msg.content}</div>
            {phase === "welcome" && (
              <div className="av-btns">
                <button className="av-btn rose" onClick={() => onWelcome("oui")}>Oui, je suis prête</button>
                <button className="av-btn ghost" onClick={() => onWelcome("non")}>Pas maintenant</button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Choix thématiques
    if (msg.type === "theme") {
      return (
        <div key={msg.id} className="av-row">
          <Avatar/>
          <div style={{ flex:1 }}>
            <div className="av-bub bot">{msg.content}</div>
            {phase === "chat" && (
              <div className="av-btns" style={{ flexDirection:"column", alignItems:"flex-start" }}>
                {[
                  { v:"confidence", t:"Manque de confiance en moi" },
                  { v:"judgment",   t:"Peur du regard des autres" },
                  { v:"image",      t:"Problème d'image / estime de soi" },
                  { v:"confusion",  t:"Je ne sais pas exactement" },
                ].map(c => (
                  <button key={c.v} className="av-btn" onClick={() => onTheme(c.v)}>{c.t}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    // Proposition diagnostic
    if (msg.type === "pre-diag") {
      return (
        <div key={msg.id} className="av-row">
          <Avatar/>
          <div style={{ flex:1 }}>
            <div className="av-bub bot">{msg.content}</div>
            {phase === "pre-diag" && (
              <div className="av-btns">
                <button className="av-btn rose" onClick={() => onPreDiag("oui")}>Oui, je veux comprendre</button>
                <button className="av-btn ghost" onClick={() => onPreDiag("non")}>Non, continuons à discuter</button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Question diagnostic
    if (msg.type === "diag") {
      const q = QUESTIONS[msg.step];
      const pct = Math.round((msg.step / QUESTIONS.length) * 100);
      return (
        <div key={msg.id} className="av-row">
          <Avatar/>
          <div style={{ flex:1 }}>
            <div className="av-bub bot">{msg.content}</div>
            {phase === "diag" && diagStep === msg.step && (
              <div>
                <div className="av-prog-wrap">
                  <div className="av-prog-label">Question {msg.step+1} sur {QUESTIONS.length}</div>
                  <div className="av-prog-bar"><div className="av-prog-fill" style={{ width:`${pct}%` }}/></div>
                </div>
                <div className="av-diag">
                  <div className="av-diag-q">{q.q}</div>
                  <div className="av-diag-opts">
                    {q.opts.map(o => (
                      <button key={o.l} className="av-diag-opt" onClick={() => onDiagRep(o.l, o.t)}>
                        <span className="av-diag-letter">{o.l}</span>
                        {o.t}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Loader
    if (msg.type === "loading") {
      return (
        <div key={msg.id} className="av-row">
          <Avatar/>
          <div style={{ flex:1 }}>
            <div className="av-bub bot">{msg.content}</div>
            {phase === "loading" && (
              <div className="av-loader">
                <div className="av-loader-bar"><div className="av-loader-fill"/></div>
                <div className="av-loader-text">Analyse de ton profil en cours…</div>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Profil
    if (msg.type === "profil" && msg.profil) {
      const p = msg.profil;
      return (
        <div key={msg.id} className="av-row">
          <Avatar/>
          <div style={{ flex:1 }}>
            <div className="av-profil">
              <div className="av-profil-tag">Ton profil</div>
              <div className="av-profil-titre">{p.label}</div>
              <div className="av-profil-accroche">{p.accroche}</div>
              <div className="av-profil-bloc">
                <div className="av-profil-bloc-label">Ce qui te bloque</div>
                <div className="av-profil-bloc-text">{p.blocage}</div>
              </div>
              <div className="av-profil-bloc">
                <div className="av-profil-bloc-label">La vérité</div>
                <div className="av-profil-bloc-text">{p.verite}</div>
              </div>
              <div className="av-profil-bloc">
                <div className="av-profil-bloc-label">Ta première clé</div>
                <div className="av-profil-bloc-text">{p.cle}</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Boutons post-profil
    if (msg.type === "post-profil") {
      return (
        <div key={msg.id} className="av-row">
          <Avatar/>
          <div style={{ flex:1 }}>
            <div className="av-bub bot">{msg.content}</div>
            {phase === "profil" && (
              <div className="av-btns" style={{ flexDirection:"column", alignItems:"flex-start" }}>
                <button className="av-btn rose" onClick={() => onPostProfil("cta")}>Je veux commencer ma transformation</button>
                <button className="av-btn" onClick={() => onPostProfil("approfondir")}>Comprendre davantage mon blocage</button>
                <button className="av-btn ghost" onClick={() => onPostProfil("chat")}>Continuer à discuter</button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Conversion
    if (msg.type === "conversion") {
      return (
        <div key={msg.id} className="av-row">
          <Avatar/>
          <div style={{ flex:1 }}>
            <div className="av-bub bot">{msg.content}</div>
            {phase === "conversion" && (
              <div className="av-btns">
                <button className="av-btn rose" onClick={() => onConversion("programme")}>Découvrir Métamorphose</button>
                <button className="av-btn ghost" onClick={() => onConversion("chat")}>Continuer à discuter</button>
              </div>
            )}
          </div>
        </div>
      );
    }

    // Bulle standard
    return (
      <div key={msg.id} className="av-row">
        <Avatar/>
        <div className="av-bub bot" style={{ whiteSpace:"pre-line" }}>{msg.content}</div>
      </div>
    );
  }

  const canType = ["free","post","post-result"].includes(phase) ||
    (phase === "pre-diag" && diagOffered) ||
    (phase === "conversion" && convOffered);

  return (
    <div className="av-page">

      <nav className="av-nav">
        <Link to="/" className="av-brand">
          <span style={{ color:"#F8F5F2" }}>Méta'</span>
          <span style={{ color:"#C9A96A" }}>Morph'</span>
          <span style={{ color:"#C2185B" }}>Ose</span>
        </Link>
        <Link to="/" className="av-back">Retour au site</Link>
      </nav>

      <div className="av-header">
        <div className="av-avatar">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="rgba(42,21,6,.85)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
          </svg>
        </div>
        <div className="av-name">Aura Métamorphose</div>
        <div className="av-sub">Assistante de transformation intérieure</div>
        <div className="av-status">
          <div className="av-dot"/>
          Disponible 24h/24
        </div>
      </div>

      <div className="av-wrap">
        <div className="av-msgs">
          {messages.map(renderMsg)}

          {isTyping && (
            <div className="av-row">
              <div className="av-ico">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(42,21,6,.8)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
                </svg>
              </div>
              <div className="av-typing">
                <div className="av-typing-dot"/><div className="av-typing-dot"/><div className="av-typing-dot"/>
              </div>
            </div>
          )}

          <div ref={bottomRef}/>
        </div>

        <div className="av-input-area">
          <textarea
            className="av-input"
            placeholder={canType ? "Écris ce que tu ressens…" : "Sélectionne une option ci-dessus…"}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            disabled={!canType || isTyping}
            rows={1}
          />
          <button className="av-send" onClick={onSend} disabled={!canType || !input.trim() || isTyping}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
