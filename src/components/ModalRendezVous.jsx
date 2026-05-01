import { useState, useEffect } from "react";

const API_BASE = import.meta.env.VITE_API_URL || '';

const TYPES = [
  { id:"decouverte",   label:"Appel Découverte",          detail:"Découvrez le programme Métamorphose", duree:"20 min", gratuit:true  },
  { id:"coaching",     label:"Séance de Coaching",         detail:"Accompagnement individuel approfondi", duree:"60 min", gratuit:false },
  { id:"consultation", label:"Consultation Image & Style", detail:"Analyse personnalisée de votre image", duree:"45 min", gratuit:false },
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@200;300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,300;1,400&display=swap');
  .rdv-overlay { position:fixed;inset:0;background:rgba(0,0,0,.92);z-index:9999;display:flex;align-items:center;justify-content:center;padding:16px;backdrop-filter:blur(10px);animation:rdvFadeIn .25s both; }
  @keyframes rdvFadeIn { from{opacity:0} to{opacity:1} }
  @keyframes rdvSlideUp { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:none} }
  @keyframes rdvSlideLeft { from{opacity:0;transform:translateX(20px)} to{opacity:1;transform:none} }
  @keyframes rdvSpin { to{transform:rotate(360deg)} }
  .rdv-modal { background:#060608;border-radius:2px;overflow:hidden;width:100%;max-width:860px;max-height:90vh;display:flex;flex-direction:column;animation:rdvSlideUp .35s both;position:relative; }
  .rdv-topbar { height:2px;background:linear-gradient(90deg,#C9A96A,#C2185B,#C9A96A);flex-shrink:0; }
  .rdv-progress { height:2px;background:rgba(255,255,255,.04);flex-shrink:0;position:relative; }
  .rdv-progress-fill { height:100%;background:linear-gradient(90deg,#C9A96A,#C2185B);transition:width .4s cubic-bezier(.16,1,.3,1); }
  .rdv-body { display:flex;flex:1;overflow:hidden; }

  /* PANEL GAUCHE */
  .rdv-panel { width:240px;flex-shrink:0;background:#0a0810;border-right:1px solid rgba(201,169,106,.08);padding:36px 28px;display:flex;flex-direction:column;overflow-y:auto; }
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

  /* CONTENU DROIT */
  .rdv-content { flex:1;padding:36px 40px;overflow-y:auto;display:flex;flex-direction:column;gap:0; }
  .rdv-section-label { font-size:9px;letter-spacing:.35em;text-transform:uppercase;color:rgba(201,169,106,.4);margin-bottom:18px;display:flex;align-items:center;gap:10px; }
  .rdv-section-label::before { content:'';width:20px;height:1px;background:rgba(201,169,106,.25); }
  .rdv-or { height:1px;background:linear-gradient(90deg,transparent,rgba(201,169,106,.1),transparent);margin:24px 0; }

  /* TYPES */
  .rdv-types { display:flex;flex-direction:column;gap:8px;margin-bottom:0; }
  .rdv-type { display:flex;align-items:center;gap:16px;padding:16px 18px;border:1px solid rgba(255,255,255,.05);cursor:pointer;transition:all .2s;position:relative;overflow:hidden; }
  .rdv-type::before { content:'';position:absolute;left:0;top:0;bottom:0;width:2px;background:transparent;transition:background .2s; }
  .rdv-type:hover { border-color:rgba(255,255,255,.1);background:rgba(255,255,255,.01); }
  .rdv-type.sel { border-color:rgba(194,24,91,.28);background:rgba(194,24,91,.03); }
  .rdv-type.sel::before { background:#C2185B; }
  .rdv-type-icon { width:36px;height:36px;border-radius:50%;display:flex;align-items:center;justify-content:center;flex-shrink:0; }
  .rdv-type-icon.g { background:rgba(76,175,80,.07);border:1px solid rgba(76,175,80,.18); }
  .rdv-type-icon.p { background:rgba(201,169,106,.06);border:1px solid rgba(201,169,106,.14); }
  .rdv-type-name { font-family:'Playfair Display',serif;font-size:14px;font-weight:600;color:#F8F5F2;margin-bottom:2px; }
  .rdv-type-detail { font-size:11px;font-weight:300;color:rgba(248,245,242,.3); }
  .rdv-type-right { margin-left:auto;text-align:right;flex-shrink:0; }
  .rdv-type-prix.g { font-size:12px;font-weight:600;color:#4CAF50; }
  .rdv-type-prix.p { font-size:12px;font-weight:500;color:rgba(201,169,106,.7); }
  .rdv-type-duree { font-size:10px;color:rgba(248,245,242,.18);font-weight:300; }

  /* MODES */
  .rdv-modes { display:flex;gap:8px;margin-bottom:0; }
  .rdv-mode { flex:1;padding:12px 16px;border:1px solid rgba(255,255,255,.05);cursor:pointer;transition:all .2s;display:flex;align-items:center;gap:10px; }
  .rdv-mode:hover { border-color:rgba(255,255,255,.1); }
  .rdv-mode.sel { border-color:rgba(201,169,106,.3);background:rgba(201,169,106,.04); }
  .rdv-mode-dot { width:7px;height:7px;border-radius:50%;border:1px solid rgba(255,255,255,.12);transition:all .2s;flex-shrink:0; }
  .rdv-mode.sel .rdv-mode-dot { background:#C9A96A;border-color:#C9A96A; }
  .rdv-mode-txt { font-size:11px;letter-spacing:.06em;color:rgba(248,245,242,.3);transition:color .2s; }
  .rdv-mode.sel .rdv-mode-txt { color:#C9A96A; }

  /* DATE + SLOTS */
  .rdv-datetime { display:grid;grid-template-columns:1fr 1fr;gap:20px; }
  .rdv-field-label { font-size:9px;letter-spacing:.2em;text-transform:uppercase;color:rgba(248,245,242,.22);margin-bottom:8px; }
  .rdv-input { width:100%;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);color:#F8F5F2;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:300;padding:11px 13px;outline:none;transition:border-color .2s; }
  .rdv-input:focus { border-color:rgba(201,169,106,.35); }
  .rdv-slots { display:grid;grid-template-columns:repeat(3,1fr);gap:6px; }
  .rdv-slot { padding:9px 6px;border:1px solid rgba(255,255,255,.05);text-align:center;font-size:11px;color:rgba(248,245,242,.35);cursor:pointer;transition:all .2s;font-weight:300; }
  .rdv-slot:hover:not(.pris) { border-color:rgba(201,169,106,.25);color:rgba(201,169,106,.7); }
  .rdv-slot.sel { border-color:#C9A96A;color:#C9A96A;background:rgba(201,169,106,.05); }
  .rdv-slot.pris { opacity:.2;cursor:not-allowed;text-decoration:line-through;font-size:10px; }
  .rdv-slot-loading { grid-column:1/-1;text-align:center;font-size:11px;color:rgba(248,245,242,.2);padding:12px; }

  /* FORMULAIRE */
  .rdv-form-grid { display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-bottom:12px; }
  .rdv-form-group { display:flex;flex-direction:column;gap:6px; }
  .rdv-textarea { width:100%;background:rgba(255,255,255,.02);border:1px solid rgba(255,255,255,.06);color:#F8F5F2;font-family:'Montserrat',sans-serif;font-size:12px;font-weight:300;padding:11px 13px;outline:none;resize:vertical;min-height:80px;transition:border-color .2s; }
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

  /* ERREUR */
  .rdv-error { padding:11px 14px;background:rgba(239,68,68,.06);border:1px solid rgba(239,68,68,.18);font-family:'Montserrat',sans-serif;font-size:11px;color:#f87171;margin-bottom:16px;line-height:1.5; }

  /* SUCCESS */
  .rdv-success { text-align:center;padding:20px 0;animation:rdvSlideUp .4s both; }
  .rdv-success-icon { width:64px;height:64px;border-radius:50%;background:rgba(201,169,106,.07);border:1px solid rgba(201,169,106,.2);display:flex;align-items:center;justify-content:center;margin:0 auto 20px; }

  /* CLOSE */
  .rdv-close { position:absolute;top:14px;right:16px;width:28px;height:28px;border:none;background:rgba(255,255,255,.04);border-radius:50%;color:rgba(248,245,242,.3);font-size:14px;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:all .2s;z-index:10; }
  .rdv-close:hover { background:rgba(255,255,255,.08);color:rgba(248,245,242,.6); }

  @media(max-width:700px) {
    .rdv-panel { display:none; }
    .rdv-content { padding:24px 20px; }
    .rdv-form-grid { grid-template-columns:1fr; }
    .rdv-datetime { grid-template-columns:1fr; }
    .rdv-modes { flex-direction:column; }
  }
`;

export default function ModalRendezVous({ onClose }) {
  const [step,      setStep]      = useState(1);
  const [typeRdv,   setTypeRdv]   = useState('decouverte');
  const [mode,      setMode]      = useState('en_ligne');
  const [date,      setDate]      = useState('');
  const [heure,     setHeure]     = useState('');
  const [creneaux,  setCreneaux]  = useState([]);
  const [loadSlots, setLoadSlots] = useState(false);
  const [form,      setForm]      = useState({ prenom:'', nom:'', email:'', whatsapp:'', pays:'', message:'' });
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [success,   setSuccess]   = useState(false);

  const today = new Date().toISOString().split('T')[0];
  const progress = step === 1 ? 33 : step === 2 ? 66 : 100;

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
        body: JSON.stringify({ ...form, type_rdv: typeRdv, mode, date, heure }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Une erreur est survenue.'); setLoading(false); return;
      }
      setSuccess(true);
    } catch { setError('Erreur réseau. Veuillez réessayer.'); }
    setLoading(false);
  }

  const typeActif = TYPES.find(t => t.id === typeRdv);

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
              <p className="rdv-panel-sub">Un accompagnement taillé pour votre transformation.</p>
              <div className="rdv-steps">
                {stepLabel(1, 'Votre rendez-vous', 'Type, mode & créneau')}
                {stepLabel(2, 'Vos coordonnées', 'Nom, email, WhatsApp')}
                {stepLabel(3, 'Confirmation', 'Récapitulatif & envoi')}
              </div>
              <p className="rdv-panel-quote">"Chaque rendez-vous est une porte vers votre transformation."<br/>— Prélia Apedo</p>
            </div>

            {/* CONTENU */}
            <div className="rdv-content">

              {/* ÉTAPE 1 */}
              {step === 1 && !success && (
                <div style={{animation:'rdvSlideLeft .3s both'}}>
                  <p className="rdv-section-label">Type de rendez-vous</p>
                  <div className="rdv-types">
                    {TYPES.map(t => (
                      <div key={t.id} className={`rdv-type${typeRdv===t.id?' sel':''}`} onClick={() => setTypeRdv(t.id)}>
                        <div className={`rdv-type-icon ${t.gratuit?'g':'p'}`}>
                          {t.gratuit
                            ? <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4CAF50" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                            : <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#C9A96A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                          }
                        </div>
                        <div style={{flex:1}}>
                          <p className="rdv-type-name">{t.label}</p>
                          <p className="rdv-type-detail">{t.detail}</p>
                        </div>
                        <div className="rdv-type-right">
                          <p className={`rdv-type-prix ${t.gratuit?'g':'p'}`}>{t.gratuit ? 'Gratuit' : 'Payant'}</p>
                          <p className="rdv-type-duree">{t.duree}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="rdv-or"/>
                  <p className="rdv-section-label">Mode du rendez-vous</p>
                  <div className="rdv-modes">
                    {[{id:'en_ligne',label:'En ligne — Zoom / WhatsApp'},{id:'presentiel',label:'En présentiel — Cotonou'}].map(m => (
                      <div key={m.id} className={`rdv-mode${mode===m.id?' sel':''}`} onClick={() => setMode(m.id)}>
                        <div className="rdv-mode-dot"/>
                        <span className="rdv-mode-txt">{m.label}</span>
                      </div>
                    ))}
                  </div>

                  <div className="rdv-or"/>
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
                            <div
                              key={c.heure}
                              className={`rdv-slot${!c.disponible?' pris':heure===c.heure?' sel':''}`}
                              onClick={() => c.disponible && setHeure(c.heure)}
                              title={!c.disponible ? 'Créneau déjà réservé' : ''}
                            >
                              {c.heure}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="rdv-footer">
                    <div className="rdv-footer-info">
                      {date && heure ? <><span>{date}</span> à <span>{heure}</span></> : 'Sélectionnez une date et un créneau'}
                    </div>
                    <div style={{display:'flex',gap:8}}>
                      <button className="rdv-btn-ghost" onClick={onClose}>Annuler</button>
                      <button
                        className="rdv-btn-main"
                        disabled={!date || !heure}
                        onClick={() => { setError(''); setStep(2); }}
                      >
                        Continuer →
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* ÉTAPE 2 */}
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
                    <button className="rdv-btn-main" onClick={() => { setError(''); setStep(3); }}>
                      Vérifier →
                    </button>
                  </div>
                </div>
              )}

              {/* ÉTAPE 3 — RÉCAP */}
              {step === 3 && !success && (
                <div style={{animation:'rdvSlideLeft .3s both'}}>
                  <p className="rdv-section-label">Récapitulatif de votre rendez-vous</p>
                  {error && <div className="rdv-error">{error}</div>}
                  <div className="rdv-recap">
                    {[
                      ['Type',    typeActif?.label],
                      ['Mode',    mode === 'en_ligne' ? 'En ligne — Zoom / WhatsApp' : 'En présentiel — Cotonou'],
                      ['Date',    date],
                      ['Heure',   heure],
                      ['Prénom',  form.prenom],
                      ['Nom',     form.nom],
                      ['Email',   form.email],
                      ['WhatsApp',form.whatsapp],
                      ['Pays',    form.pays || '—'],
                      ['Tarif',   typeActif?.gratuit ? 'Gratuit' : 'Payant — Prélia vous contactera'],
                    ].map(([k, v]) => (
                      <div key={k} className="rdv-recap-row">
                        <span className="rdv-recap-key">{k}</span>
                        <span className="rdv-recap-val" style={k==='Tarif'&&typeActif?.gratuit?{color:'#4CAF50'}:k==='Heure'?{color:'#C9A96A'}:{}}>{v}</span>
                      </div>
                    ))}
                  </div>
                  {form.message && (
                    <div style={{padding:'12px 14px',background:'rgba(255,255,255,.018)',border:'1px solid rgba(255,255,255,.05)',marginBottom:20}}>
                      <p style={{fontSize:'9px',letterSpacing:'.2em',textTransform:'uppercase',color:'rgba(248,245,242,.2)',marginBottom:8}}>Message</p>
                      <p style={{fontSize:'12px',color:'rgba(248,245,242,.5)',fontWeight:300,lineHeight:1.7}}>{form.message}</p>
                    </div>
                  )}
                  <div className="rdv-footer">
                    <button className="rdv-btn-ghost" onClick={() => { setStep(2); setError(''); }}>← Modifier</button>
                    <button className="rdv-btn-main" disabled={loading} onClick={soumettre}>
                      {loading ? <><div className="rdv-spinner"/>Envoi...</> : 'Confirmer mon RDV'}
                    </button>
                  </div>
                </div>
              )}

              {/* SUCCÈS */}
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
                  <p style={{fontFamily:"'Montserrat',sans-serif",fontWeight:300,fontSize:'.85rem',color:'rgba(248,245,242,.45)',lineHeight:1.8,maxWidth:400,margin:'0 auto 28px'}}>
                    Prélia APEDO AHONON vous contactera sous 24h pour confirmer votre rendez-vous du <strong style={{color:'#C9A96A'}}>{date} à {heure}</strong>.
                  </p>
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
