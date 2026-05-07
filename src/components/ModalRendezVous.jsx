import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || '';

const TYPES = [
  {
    id: "appel_decouverte",
    label: "Appel Découverte",
    badge: "GRATUIT",
    badgeColor: "#4CAF50",
    duree: "30 min",
    gratuit: true,
    modeForce: "en_ligne",
    prix: { en_ligne: 0 },
    bouton: "Réserver mon appel",
    description: "Un premier échange pour comprendre votre besoin, vos attentes et voir comment je peux vous accompagner.",
    objectif: "Clarté + orientation",
    note: "Disponible en ligne uniquement pour un accès simple et rapide.",
    details: [
      { icon:"📞", text:"Appel découverte — 30 min" },
      { icon:"💰", text:"Tarif : Gratuit" },
      { icon:"🌐", text:"Format : En ligne uniquement" },
      { icon:"🎯", text:"Objectif : Clarté + orientation" },
    ]
  },
  {
    id: "bilan_image",
    label: "Bilan Image",
    badge: "DIAGNOSTIC",
    badgeColor: "#C9A96A",
    duree: "1h",
    gratuit: false,
    prix: { en_ligne: 32500, presentiel: 60000 },
    bouton: "Réserver mon bilan",
    description: "Une séance approfondie pour analyser votre image, votre posture et votre positionnement.",
    objectif: "Diagnostic clair + orientation stratégique",
    note: "Frais de déplacement de la coach à la charge de la cliente (si hors zone standard).",
    points: [
      "Identifier vos blocages",
      "Analyser votre image actuelle",
      "Clarifier votre posture et votre identité",
    ],
    prescription: "À la fin de cette séance, vous recevrez une prescription personnalisée : un accompagnement adapté à votre besoin (1, 2 ou 3 séances ou plus).",
    details: [
      { icon:"💻", text:"En ligne : 1h — 32 500 FCFA" },
      { icon:"📍", text:"En présentiel : 1h — 60 000 FCFA" },
      { icon:"🎯", text:"Objectif : Diagnostic clair + orientation stratégique" },
    ]
  },
  {
    id: "seance_coaching",
    label: "Séance de Coaching",
    badge: "SUR PRESCRIPTION",
    badgeColor: "#C2185B",
    duree: "1h30 à 2h",
    gratuit: false,
    prix: { en_ligne: 40000, presentiel: 70000 },
    bouton: "Réserver ma séance",
    description: "Une séance dédiée à votre transformation, basée sur le diagnostic réalisé lors du bilan.",
    objectif: "Transformation concrète + passage à l'action",
    note: "Frais de déplacement de la coach à la charge de la cliente (si hors zone standard).",
    prescription_required: true,
    details: [
      { icon:"💻", text:"En ligne : 1h30 à 2h — 40 000 FCFA / séance" },
      { icon:"📍", text:"En présentiel : 1h30 à 2h — 70 000 FCFA / séance" },
      { icon:"🎯", text:"Objectif : Transformation concrète + passage à l'action" },
    ]
  },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@200;300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,300;1,400&display=swap');
  .rdv-overlay { position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(10px);animation:rdvFadeIn .25s both; }
  @keyframes rdvFadeIn { from{opacity:0} to{opacity:1} }
  @keyframes rdvSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
  @keyframes rdvSlideLeft { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }
  @keyframes rdvSpin { to{transform:rotate(360deg)} }
  .rdv-modal { background:#060608;border-radius:2px;overflow:hidden;width:100%;max-width:900px;max-height:92vh;display:flex;flex-direction:column;animation:rdvSlideUp .35s both;position:relative; }
  .rdv-topbar { height:2px;background:linear-gradient(90deg,#C9A96A,#C2185B,#C9A96A);flex-shrink:0; }
  .rdv-progress { height:2px;background:rgba(255,255,255,.04);flex-shrink:0;position:relative; }
  .rdv-progress-fill { height:100%;background:linear-gradient(90deg,#C9A96A,#C2185B);transition:width .4s cubic-bezier(.16,1,.3,1); }
  .rdv-body { display:flex;flex:1;overflow:hidden; }

  .rdv-panel { width:260px;flex-shrink:0;background:#0a0810;border-right:1px solid rgba(201,169,106,.08);padding:36px 28px;display:flex;flex-direction:column;overflow-y:auto; }
  .rdv-panel-logo { font-family:'Playfair Display',serif;font-size:12px;margin-bottom:28px; }
  .rdv-panel-title { font-family:'Playfair Display',serif;font-size:17px;font-weight:600;line-height:1.25;color:#F8F5F2;margin-bottom:6px; }
  .rdv-panel-sub { font-family:'Cormorant Garamond',serif;font-style:italic;font-size:12px;color:rgba(201,169,106,.5);margin-bottom:32px;line-height:1.6; }
  .rdv-steps { display:flex;flex-direction:column;gap:0;flex:1; }
  .rdv-step { display:flex;align-items:flex-start;gap:12px;padding:12px 0;position:relative; }
  .rdv-step:not(:last-child)::after { content:'';position:absolute;left:10px;top:36px;width:1px;height:calc(100% - 12px);background:rgba(255,255,255,.05); }
  .rdv-step-circle { width:22px;height:22px;border-radius:50%;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:9px;font-weight:700;margin-top:1px;transition:all .3s; }
  .rdv-step-circle.active { background:#C2185B;color:#fff; }
  .rdv-step-circle.done { background:rgba(201,169,106,.12);border:1px solid rgba(201,169,106,.25);color:#C9A96A; }
  .rdv-step-circle.todo { border:1px solid rgba(255,255,255,.07);color:rgba(255,255,255,.15); }
  .rdv-step-name { font-size:11px;font-weight:500;letter-spacing:.04em;transition:color .3s; }
  .rdv-step-name.active { color:#F8F5F2; }
  .rdv-step-name.done { color:rgba(201,169,106,.65); }
  .rdv-step-name.todo { color:rgba(248,245,242,.18); }
  .rdv-step-desc { font-size:10px;font-weight:300;color:rgba(248,245,242,.2);margin-top:1px; }
  .rdv-panel-quote { margin-top:auto;padding-top:24px;border-top:1px solid rgba(255,255,255,.04);font-family:'Cormorant Garamond',serif;font-style:italic;font-size:11px;color:rgba(201,169,106,.25);line-height:1.8; }

  .rdv-content { flex:1;padding:36px 40px;overflow-y:auto;display:flex;flex-direction:column;gap:0; }
  .rdv-section-label { font-size:9px;letter-spacing:.35em;text-transform:uppercase;color:rgba(201,169,106,.4);margin-bottom:18px;display:flex;align-items:center;gap:10px; }
  .rdv-section-label::before { content:'';width:20px;height:1px;background:rgba(201,169,106,.25); }
  .rdv-or { height:1px;background:linear-gradient(90deg,transparent,rgba(201,169,106,.1),transparent);margin:24px 0; }

  /* CARDS TYPE RDV */
  .rdv-type-card { border:1px solid rgba(255,255,255,.06);padding:20px;cursor:pointer;transition:all .25s;position:relative;margin-bottom:10px;overflow:hidden; }
  .rdv-type-card::before { content:'';position:absolute;left:0;top:0;bottom:0;width:3px;background:transparent;transition:background .25s; }
  .rdv-type-card:hover { border-color:rgba(255,255,255,.12);background:rgba(255,255,255,.01); }
  .rdv-type-card.sel { border-color:rgba(194,24,91,.3);background:rgba(194,24,91,.03); }
  .rdv-type-card.sel::before { background:#C2185B; }
  .rdv-type-card-header { display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:10px; }
  .rdv-type-card-title { font-family:'Playfair Display',serif;font-size:15px;font-weight:600;color:#F8F5F2;margin-bottom:3px; }
  .rdv-type-card-desc { font-size:11px;font-weight:300;color:rgba(248,245,242,.45);line-height:1.65; }
  .rdv-type-card-badge { font-size:8px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;padding:3px 10px;border-radius:2px;flex-shrink:0; }
  .rdv-type-card-details { display:flex;flex-wrap:wrap;gap:6px;margin-top:10px; }
  .rdv-type-card-detail { font-size:10px;font-weight:300;color:rgba(248,245,242,.35);display:flex;align-items:center;gap:5px; }
  .rdv-type-card-points { margin-top:10px;display:flex;flex-direction:column;gap:4px; }
  .rdv-type-card-point { font-size:10px;font-weight:300;color:rgba(248,245,242,.5);display:flex;align-items:flex-start;gap:6px; }
  .rdv-type-card-note { margin-top:10px;padding:8px 12px;background:rgba(255,255,255,.02);border-left:2px solid rgba(201,169,106,.2);font-size:10px;color:rgba(248,245,242,.3);font-style:italic;line-height:1.5; }
  .rdv-type-card-prescription { margin-top:10px;padding:10px 12px;background:rgba(201,169,106,.04);border:1px solid rgba(201,169,106,.12);font-size:10px;color:rgba(201,169,106,.7);line-height:1.6; }
  .rdv-type-card-warning { margin-top:8px;padding:8px 12px;background:rgba(194,24,91,.05);border:1px solid rgba(194,24,91,.15);font-size:10px;color:rgba(194,24,91,.7);line-height:1.5; }

  /* MODES */
  .rdv-modes { display:flex;gap:8px;margin-bottom:0; }
  .rdv-mode { flex:1;padding:14px 16px;border:1px solid rgba(255,255,255,.05);cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:10px; }
  .rdv-mode:hover { border-color:rgba(255,255,255,.1); }
  .rdv-mode.sel { border-color:rgba(201,169,106,.3);background:rgba(201,169,106,.04); }
  .rdv-mode.disabled { opacity:.25;cursor:not-allowed; }
  .rdv-mode-dot { width:7px;height:7px;border-radius:50%;border:1px solid rgba(255,255,255,.12);transition:all .2s;flex-shrink:0; }
  .rdv-mode.sel .rdv-mode-dot { background:#C9A96A;border-color:#C9A96A; }
  .rdv-mode-content { flex:1; }
  .rdv-mode-txt { font-size:11px;letter-spacing:.06em;color:rgba(248,245,242,.3);transition:color .2s;display:block; }
  .rdv-mode.sel .rdv-mode-txt { color:#C9A96A; }
  .rdv-mode-prix { font-size:12px;font-weight:600;color:rgba(201,169,106,.5);margin-top:2px;display:block; }
  .rdv-mode.sel .rdv-mode-prix { color:#C9A96A; }

  /* DATE + SLOTS */
  .rdv-datetime { display:grid;grid-template-columns:1fr 1fr;gap:20px; }
  .rdv-field-label { font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:rgba(248,245,242,.22);margin-bottom:8px; }
  .rdv-input { width:100%;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);color:#F8F5F2;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:300;padding:11px 13px;outline:none;transition:border-color .2s;box-sizing:border-box; }
  .rdv-input:focus { border-color:rgba(201,169,106,.35); }
  .rdv-slots { display:grid;grid-template-columns:repeat(3,1fr);gap:6px; }
  .rdv-slot { padding:9px 6px;border:1px solid rgba(255,255,255,.05);text-align:center;font-size:11px;color:rgba(248,245,242,.35);cursor:pointer;transition:all .2s;font-weight:300; }
  .rdv-slot:hover:not(.pris) { border-color:rgba(201,169,106,.25);color:rgba(201,169,106,.7); }
  .rdv-slot.sel { border-color:#C9A96A;color:#C9A96A;background:rgba(201,169,106,.05); }
  .rdv-slot.pris { opacity:.2;cursor:not-allowed;text-decoration:line-through;font-size:10px; }
  .rdv-slot-loading { grid-column:1/-1;text-align:center;font-size:11px;color:rgba(248,245,242,.2);padding:12px; }

  /* NB SÉANCES */
  .rdv-seances { display:flex;gap:8px; }
  .rdv-seance { flex:1;padding:12px;border:1px solid rgba(255,255,255,.05);cursor:pointer;transition:all .2s;text-align:center; }
  .rdv-seance:hover { border-color:rgba(255,255,255,.12); }
  .rdv-seance.sel { border-color:rgba(194,24,91,.3);background:rgba(194,24,91,.04); }
  .rdv-seance-num { font-family:'Playfair Display',serif;font-size:18px;font-weight:700;color:#F8F5F2;display:block;margin-bottom:2px; }
  .rdv-seance.sel .rdv-seance-num { color:#C2185B; }
  .rdv-seance-label { font-size:9px;letter-spacing:.1em;text-transform:uppercase;color:rgba(248,245,242,.25); }
  .rdv-seance-prix { font-size:10px;color:rgba(201,169,106,.5);margin-top:4px;display:block; }
  .rdv-seance.sel .rdv-seance-prix { color:#C9A96A; }

  /* FORMULAIRE */
  .rdv-form-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px; }
  .rdv-form-group { display:flex;flex-direction:column;gap:6px; }
  .rdv-textarea { width:100%;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);color:#F8F5F2;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:300;padding:11px 13px;outline:none;resize:vertical;min-height:80px;transition:border-color .2s;box-sizing:border-box; }
  .rdv-textarea:focus { border-color:rgba(201,169,106,.35); }

  /* RECAP */
  .rdv-recap { background:rgba(255,255,255,.018);border:1px solid rgba(201,169,106,.08);padding:20px;margin-bottom:20px; }
  .rdv-recap-row { display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid rgba(255,255,255,.04); }
  .rdv-recap-row:last-child { border-bottom:none; }
  .rdv-recap-key { font-size:11px;color:rgba(248,245,242,.3);font-weight:300; }
  .rdv-recap-val { font-size:11px;color:#F8F5F2;font-weight:500;text-align:right; }

  /* FOOTER */
  .rdv-footer { margin-top:auto;padding-top:20px;border-top:1px solid rgba(255,255,255,.04);display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap; }
  .rdv-footer-info { font-size:11px;color:rgba(248,245,242,.2);font-weight:300; }
  .rdv-footer-info span { color:#C9A96A; }
  .rdv-btn-ghost { padding:12px 20px;background:transparent;border:1px solid rgba(255,255,255,.08);color:rgba(248,245,242,.3);font-family:'Montserrat',sans-serif;font-size:9px;font-weight:500;letter-spacing:.15em;text-transform:uppercase;cursor:pointer;transition:all .2s; }
  .rdv-btn-ghost:hover { border-color:rgba(255,255,255,.15);color:rgba(248,245,242,.5); }
  .rdv-btn-main { padding:13px 28px;background:#C2185B;border:none;color:#fff;font-family:'Montserrat',sans-serif;font-weight:700;font-size:9px;letter-spacing:.2em;text-transform:uppercase;cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:8px; }
  .rdv-btn-main:hover { background:#a01049; }
  .rdv-btn-main:disabled { opacity:.5;cursor:not-allowed; }
  .rdv-spinner { width:14px;height:14px;border:2px solid rgba(255,255,255,.2);border-top:2px solid #fff;border-radius:50%;animation:rdvSpin .7s linear infinite; }
  .rdv-error { padding:11px 14px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.18);font-family:'Montserrat',sans-serif;font-size:11px;color:#f87171;margin-bottom:16px;line-height:1.5; }
  .rdv-success { text-align:center;padding:20px 0;animation:rdvSlideUp .4s both; }
  .rdv-success-icon { width:64px;height:64px;border-radius:50%;background:rgba(201,169,106,.07);border:1px solid rgba(201,169,106,.2);display:flex;align-items:center;justify-content:center;margin:0 auto 20px; }
  .rdv-close { position:absolute;top:14px;right:16px;width:28px;height:28px;border:none;background:rgba(255,255,255,.04);border-radius:50%;color:rgba(248,245,242,.3);font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;z-index:10; }
  .rdv-close:hover { background:rgba(255,255,255,.08);color:rgba(248,245,242,.6); }
  .rdv-prix-total { padding:14px 16px;background:rgba(201,169,106,.06);border:1px solid rgba(201,169,106,.15);display:flex;justify-content:space-between;align-items:center;margin-top:12px; }

  @media(max-width:700px) {
    .rdv-panel { display:none; }
    .rdv-content { padding:24px 20px; }
    .rdv-form-grid { grid-template-columns:1fr; }
    .rdv-datetime { grid-template-columns:1fr; }
    .rdv-modes { flex-direction:column; }
    .rdv-seances { flex-wrap:wrap; }
  }
`;

export default function ModalRendezVous({ onClose }) {
  const [step,      setStep]      = useState(1);
  const [typeRdv,   setTypeRdv]   = useState('appel_decouverte');
  const [mode,      setMode]      = useState('en_ligne');
  const [nbSeances, setNbSeances] = useState('1');
  const [date,      setDate]      = useState('');
  const [heure,     setHeure]     = useState('');
  const [creneaux,  setCreneaux]  = useState([]);
  const [loadSlots, setLoadSlots] = useState(false);
  const [form,      setForm]      = useState({ prenom:'', nom:'', email:'', whatsapp:'', pays:'', message:'' });
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);

  const today    = new Date().toISOString().split('T')[0];
  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;
  const typeActif = TYPES.find(t => t.id === typeRdv);

  // Prix calculé dynamiquement
  const prixBase  = typeActif?.prix?.[mode] || 0;
  const nbNum     = nbSeances === '3+' ? 3 : parseInt(nbSeances) || 1;
  const prixTotal = typeRdv === 'seance_coaching' ? prixBase * nbNum : prixBase;
  const prixStr   = prixTotal === 0 ? 'Gratuit' : `${prixTotal.toLocaleString('fr-FR')} FCFA`;

  // Si appel découverte → forcer mode en ligne
  useEffect(() => {
    if (typeRdv === 'appel_decouverte') setMode('en_ligne');
  }, [typeRdv]);

  function setF(k, v) { setForm(p => ({...p, [k]:v})); }

  useEffect(() => {
    if (!date) return;
    setLoadSlots(true);
    setHeure('');
    setCreneaux([]);
    fetch(`${API_BASE}/api/rendezvous/creneaux/?date=${date}`)
      .then(r => r.json())
      .then(d => { setCreneaux(d.creneaux || []); setLoadSlots(false); })
      .catch(() => setLoadSlots(false));
  }, [date]);

  async function soumettre() {
    if (!form.prenom.trim() || !form.nom.trim() || !form.email.trim() || !form.whatsapp.trim()) {
      setError('Veuillez remplir tous les champs obligatoires.'); return;
    }
    setLoading(true); setError('');
    try {
      const res = await fetch(`${API_BASE}/api/rendezvous/reserver/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, type_rdv: typeRdv, mode, date, heure, nb_seances: nbSeances }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Une erreur est survenue.'); setLoading(false); return; }
      setSuccess(true);
    } catch { setError('Erreur réseau. Veuillez réessayer.'); }
    setLoading(false);
  }

  const stepLabel = (s, label, desc) => {
    const state = step > s ? 'done' : step === s ? 'active' : 'todo';
    return (
      <div className="rdv-step">
        <div className={`rdv-step-circle ${state}`}>{step > s ? '✓' : s}</div>
        <div>
          <p className={`rdv-step-name ${state}`}>{label}</p>
          <p className="rdv-step-desc">{desc}</p>
        </div>
      </div>
    );
  };

  return (
    <>
      <style>{STYLES}</style>
      <div className="rdv-overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
        <div className="rdv-modal">
          <div className="rdv-topbar"/>
          <div className="rdv-progress"><div className="rdv-progress-fill" style={{ width:`${progress}%` }}/></div>
          <button className="rdv-close" onClick={onClose}>✕</button>

          <div className="rdv-body">
            {/* PANEL GAUCHE */}
            <div className="rdv-panel">
              <div className="rdv-panel-logo">
                <span style={{color:'#F8F5F2'}}>Méta'</span>
                <span style={{color:'#C9A96A'}}>Morph'</span>
                <span style={{color:'#C2185B'}}>Ose</span>
              </div>
              <h2 className="rdv-panel-title">Réserver votre séance avec Prélia</h2>
              <p className="rdv-panel-sub">Un accompagnement adapté à votre besoin et à votre niveau de transformation.</p>
              <div className="rdv-steps">
                {stepLabel(1, 'Votre rendez-vous', 'Type, mode & créneau')}
                {stepLabel(2, 'Vos coordonnées', 'Nom, email, WhatsApp')}
                {stepLabel(3, 'Confirmation', 'Récapitulatif & envoi')}
              </div>
              <p className="rdv-panel-quote">"Chaque rendez-vous est une porte vers votre transformation."<br/>— Prélia APEDO AHONON</p>
            </div>

            {/* CONTENU */}
            <div className="rdv-content">

              {/* ── ÉTAPE 1 ── */}
              {step === 1 && !success && (
                <div style={{animation:'rdvSlideLeft .3s both'}}>
                  <p className="rdv-section-label">Choisissez votre type de rendez-vous</p>
                  <p style={{fontSize:'11px',color:'rgba(248,245,242,.3)',marginBottom:'16px',fontWeight:300,lineHeight:1.6}}>
                    Un accompagnement adapté à votre besoin et à votre niveau de transformation.
                  </p>

                  {/* Cards types */}
                  {TYPES.map(t => (
                    <div key={t.id} className={`rdv-type-card${typeRdv===t.id?' sel':''}`} onClick={() => setTypeRdv(t.id)}>
                      <div className="rdv-type-card-header">
                        <div style={{flex:1}}>
                          <p className="rdv-type-card-title">💎 {t.label}</p>
                          <p className="rdv-type-card-desc">{t.description}</p>
                        </div>
                        <span className="rdv-type-card-badge" style={{background:`${t.badgeColor}15`,color:t.badgeColor,border:`1px solid ${t.badgeColor}30`}}>
                          {t.badge}
                        </span>
                      </div>

                      <div className="rdv-type-card-details">
                        {t.details.map((d,i) => (
                          <span key={i} className="rdv-type-card-detail">{d.icon} {d.text}</span>
                        ))}
                      </div>

                      {t.points && (
                        <div className="rdv-type-card-points">
                          <p style={{fontSize:'10px',color:'rgba(248,245,242,.4)',marginBottom:'4px',fontWeight:500}}>Au cours de ce bilan :</p>
                          {t.points.map((p,i) => (
                            <span key={i} className="rdv-type-card-point">✔️ {p}</span>
                          ))}
                        </div>
                      )}

                      {t.prescription && (
                        <div className="rdv-type-card-prescription">
                          🔥 {t.prescription}
                        </div>
                      )}

                      {t.prescription_required && (
                        <div className="rdv-type-card-warning">
                          📌 Cette séance n'est accessible qu'après le bilan image. Le nombre de séances est défini selon votre besoin lors du bilan.
                        </div>
                      )}

                      {t.note && (
                        <div className="rdv-type-card-note">💡 {t.note}</div>
                      )}
                    </div>
                  ))}

                  <div className="rdv-or"/>

                  {/* Mode */}
                  <p className="rdv-section-label">Mode du rendez-vous</p>
                  <div className="rdv-modes">
                    <div
                      className={`rdv-mode${mode==='en_ligne'?' sel':''}`}
                      onClick={() => setMode('en_ligne')}>
                      <div className="rdv-mode-dot"/>
                      <div className="rdv-mode-content">
                        <span className="rdv-mode-txt">En ligne — Zoom / WhatsApp</span>
                        {typeActif?.prix?.en_ligne !== undefined && (
                          <span className="rdv-mode-prix">
                            {typeActif.prix.en_ligne === 0 ? 'Gratuit' : `${typeActif.prix.en_ligne.toLocaleString('fr-FR')} FCFA`}
                          </span>
                        )}
                      </div>
                    </div>
                    <div
                      className={`rdv-mode${mode==='presentiel'?' sel':''}${typeRdv==='appel_decouverte'?' disabled':''}`}
                      onClick={() => typeRdv !== 'appel_decouverte' && setMode('presentiel')}>
                      <div className="rdv-mode-dot"/>
                      <div className="rdv-mode-content">
                        <span className="rdv-mode-txt">En présentiel — Cotonou</span>
                        {typeActif?.prix?.presentiel && (
                          <span className="rdv-mode-prix">{typeActif.prix.presentiel.toLocaleString('fr-FR')} FCFA</span>
                        )}
                        {typeRdv === 'appel_decouverte' && (
                          <span style={{fontSize:'9px',color:'rgba(248,245,242,.2)',display:'block',marginTop:'2px'}}>Non disponible pour cet appel</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Nb séances si coaching */}
                  {typeRdv === 'seance_coaching' && (
                    <>
                      <div className="rdv-or"/>
                      <p className="rdv-section-label">Nombre de séances</p>
                      <p style={{fontSize:'10px',color:'rgba(248,245,242,.3)',marginBottom:'12px',fontWeight:300}}>
                        Le nombre de séances est défini selon votre besoin lors du bilan image.
                      </p>
                      <div className="rdv-seances">
                        {[
                          {val:'1', label:'séance',   suffix:''},
                          {val:'2', label:'séances',  suffix:''},
                          {val:'3+',label:'séances',  suffix:'ou plus'},
                        ].map(s => {
                          const p = (typeActif?.prix?.[mode] || 0) * (s.val === '3+' ? 3 : parseInt(s.val));
                          return (
                            <div key={s.val} className={`rdv-seance${nbSeances===s.val?' sel':''}`} onClick={() => setNbSeances(s.val)}>
                              <span className="rdv-seance-num">{s.val}</span>
                              <span className="rdv-seance-label">{s.label} {s.suffix}</span>
                              <span className="rdv-seance-prix">{p.toLocaleString('fr-FR')} FCFA</span>
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}

                  <div className="rdv-or"/>

                  {/* Date & créneau */}
                  <p className="rdv-section-label">Date & créneau</p>
                  <div className="rdv-datetime">
                    <div>
                      <p className="rdv-field-label">Date souhaitée *</p>
                      <input className="rdv-input" type="date" min={today} value={date} onChange={e => setDate(e.target.value)}/>
                    </div>
                    <div>
                      <p className="rdv-field-label">Créneau disponible *</p>
                      {loadSlots ? (
                        <div className="rdv-slot-loading">Chargement...</div>
                      ) : !date ? (
                        <p style={{fontSize:'11px',color:'rgba(248,245,242,.2)',fontWeight:300}}>Choisissez d'abord une date</p>
                      ) : creneaux.length === 0 ? (
                        <p style={{fontSize:'11px',color:'rgba(248,245,242,.2)',fontWeight:300}}>Aucun créneau disponible ce jour</p>
                      ) : (
                        <div className="rdv-slots">
                          {creneaux.map(c => (
                            <div key={c.heure} className={`rdv-slot${!c.disponible?' pris':heure===c.heure?' sel':''}`}
                              onClick={() => c.disponible && setHeure(c.heure)}
                              title={!c.disponible ? 'Créneau indisponible' : ''}>
                              {c.heure}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Prix total affiché */}
                  {date && heure && (
                    <div className="rdv-prix-total">
                      <span style={{fontSize:'11px',color:'rgba(248,245,242,.4)',fontWeight:300}}>Total estimé</span>
                      <span style={{fontSize:'15px',fontFamily:"'Playfair Display',serif",fontWeight:700,color: prixTotal===0?'#4CAF50':'#C9A96A'}}>{prixStr}</span>
                    </div>
                  )}

                  <div className="rdv-footer">
                    <div className="rdv-footer-info">
                      {date && heure ? <><span>{date}</span> à <span>{heure}</span></> : 'Sélectionnez une date et un créneau'}
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <button className="rdv-btn-ghost" onClick={onClose}>Annuler</button>
                      <button className="rdv-btn-main" disabled={!date || !heure} onClick={() => { setError(''); setStep(2); }}>
                        {typeActif?.bouton || 'Continuer'} →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ÉTAPE 2 ── */}
              {step === 2 && !success && (
                <div style={{animation:'rdvSlideLeft .3s both'}}>
                  <p className="rdv-section-label">Vos coordonnées</p>
                  {error && <div className="rdv-error">{error}</div>}
                  <div className="rdv-form-grid">
                    <div className="rdv-form-group">
                      <label className="rdv-field-label">Prénom *</label>
                      <input className="rdv-input" type="text" placeholder="Votre prénom" value={form.prenom} onChange={e=>setF('prenom',e.target.value)}/>
                    </div>
                    <div className="rdv-form-group">
                      <label className="rdv-field-label">Nom *</label>
                      <input className="rdv-input" type="text" placeholder="Votre nom" value={form.nom} onChange={e=>setF('nom',e.target.value)}/>
                    </div>
                    <div className="rdv-form-group">
                      <label className="rdv-field-label">Email *</label>
                      <input className="rdv-input" type="email" placeholder="votre@email.com" value={form.email} onChange={e=>setF('email',e.target.value)}/>
                    </div>
                    <div className="rdv-form-group">
                      <label className="rdv-field-label">WhatsApp *</label>
                      <input className="rdv-input" type="tel" placeholder="+229 01 00 00 00" value={form.whatsapp} onChange={e=>setF('whatsapp',e.target.value)}/>
                    </div>
                    <div className="rdv-form-group" style={{gridColumn:'1/-1'}}>
                      <label className="rdv-field-label">Pays</label>
                      <input className="rdv-input" type="text" placeholder="Votre pays" value={form.pays} onChange={e=>setF('pays',e.target.value)}/>
                    </div>
                    <div className="rdv-form-group" style={{gridColumn:'1/-1'}}>
                      <label className="rdv-field-label">Message (optionnel)</label>
                      <textarea className="rdv-textarea" placeholder="Précisez votre besoin ou toute information utile..." value={form.message} onChange={e=>setF('message',e.target.value)}/>
                    </div>
                  </div>
                  <div className="rdv-footer">
                    <button className="rdv-btn-ghost" onClick={() => { setStep(1); setError(''); }}>← Retour</button>
                    <button className="rdv-btn-main" onClick={() => { setError(''); setStep(3); }}>Vérifier →</button>
                  </div>
                </div>
              )}

              {/* ── ÉTAPE 3 ── */}
              {step === 3 && !success && (
                <div style={{animation:'rdvSlideLeft .3s both'}}>
                  <p className="rdv-section-label">Récapitulatif de votre rendez-vous</p>
                  {error && <div className="rdv-error">{error}</div>}
                  <div className="rdv-recap">
                    {[
                      ['Type',     typeActif?.label],
                      ['Mode',     mode === 'en_ligne' ? 'En ligne — Zoom / WhatsApp' : 'En présentiel — Cotonou'],
                      ['Date',     date],
                      ['Heure',    heure],
                      ...(typeRdv === 'seance_coaching' ? [['Séances', nbSeances]] : []),
                      ['Prénom',   form.prenom],
                      ['Nom',      form.nom],
                      ['Email',    form.email],
                      ['WhatsApp', form.whatsapp],
                      ['Pays',     form.pays || '—'],
                      ['Tarif',    prixStr],
                    ].map(([k, v]) => (
                      <div key={k} className="rdv-recap-row">
                        <span className="rdv-recap-key">{k}</span>
                        <span className="rdv-recap-val" style={
                          k==='Tarif' && prixTotal===0 ? {color:'#4CAF50'} :
                          k==='Heure' ? {color:'#C9A96A'} :
                          k==='Tarif' ? {color:'#C9A96A',fontWeight:700} : {}
                        }>{v}</span>
                      </div>
                    ))}
                  </div>

                  {typeRdv === 'seance_coaching' && (
                    <div style={{padding:'12px 14px',background:'rgba(194,24,91,.04)',border:'1px solid rgba(194,24,91,.12)',marginBottom:16,fontSize:'11px',color:'rgba(248,245,242,.5)',lineHeight:1.6}}>
                      📌 Le tarif total dépendra du nombre de séances recommandées lors du bilan image. Prélia vous contactera pour confirmer.
                    </div>
                  )}

                  {mode === 'presentiel' && (
                    <div style={{padding:'12px 14px',background:'rgba(201,169,106,.04)',border:'1px solid rgba(201,169,106,.1)',marginBottom:16,fontSize:'11px',color:'rgba(201,169,106,.6)',lineHeight:1.6}}>
                      📌 Frais de déplacement de la coach à la charge de la cliente (si hors zone standard).
                    </div>
                  )}

                  {form.message && (
                    <div style={{padding:'12px 14px',background:'rgba(255,255,255,.018)',border:'1px solid rgba(255,255,255,.05)',marginBottom:20}}>
                      <p style={{fontSize:'9px',letterSpacing:'.2em',textTransform:'uppercase',color:'rgba(248,245,242,.2)',marginBottom:8}}>Message</p>
                      <p style={{fontSize:'12px',color:'rgba(248,245,242,.5)',fontWeight:300,lineHeight:1.7}}>{form.message}</p>
                    </div>
                  )}

                  <div className="rdv-footer">
                    <button className="rdv-btn-ghost" onClick={() => { setStep(2); setError(''); }}>← Modifier</button>
                    <button className="rdv-btn-main" disabled={loading} onClick={soumettre}>
                      {loading ? <><div className="rdv-spinner"/>Envoi...</> : typeActif?.bouton || 'Confirmer mon RDV'}
                    </button>
                  </div>
                </div>
              )}

              {/* ── SUCCÈS ── */}
              {success && (
                <div className="rdv-success">
                  <div className="rdv-success-icon">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#C9A96A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:'.58rem',letterSpacing:'.38em',textTransform:'uppercase',color:'rgba(201,169,106,.45)',marginBottom:12}}>
                    Demande envoyée
                  </p>
                  <h3 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.5rem',fontWeight:600,color:'#F8F5F2',marginBottom:10}}>
                    Merci, {form.prenom}.<br/>
                    <em style={{fontStyle:'italic',fontWeight:400,color:'#C9A96A'}}>Votre demande est enregistrée.</em>
                  </h3>
                  <p style={{fontFamily:"'Montserrat',sans-serif",fontWeight:300,fontSize:'.85rem',color:'rgba(248,245,242,.45)',lineHeight:1.8,maxWidth:420,margin:'0 auto 28px'}}>
                    Prélia APEDO AHONON vous contactera sous 24h pour confirmer votre rendez-vous du <strong style={{color:'#C9A96A'}}>{date} à {heure}</strong>.
                  </p>
                  {!typeActif?.gratuit && (
                    <p style={{fontSize:'12px',color:'rgba(248,245,242,.3)',marginBottom:24}}>
                      Tarif : <strong style={{color:'#C9A96A'}}>{prixStr}</strong> — Les modalités de paiement vous seront communiquées par Prélia.
                    </p>
                  )}
                  <button className="rdv-btn-main" onClick={onClose} style={{margin:'0 auto'}}>Fermer</button>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
}
