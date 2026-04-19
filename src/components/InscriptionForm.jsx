import { authAPI, contactAPI, configAPI } from '../services/api';
import { useState, useEffect } from "react";

const FORMULES = [
  { id:"F1", label:"ESSENTIELLE",   prix:"70 000 FCFA",  color:"#C2185B" },
  { id:"F2", label:"PERSONNALISÉE", prix:"160 000 FCFA", color:"#C9A96A" },
  { id:"F3", label:"IMMERSION",     prix:"267 000 FCFA", color:"#A8C8E0" },
  { id:"F4", label:"VIP",           prix:"370 000 FCFA", color:"#D8C1A0" },
];

const PAYS = [
  "Bénin","Côte d'Ivoire","Sénégal","Togo","Burkina Faso",
  "Mali","Niger","Cameroun","Gabon","Congo","France",
  "Belgique","Canada","Suisse","Autre",
];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap');

  @keyframes formFadeUp {
    from { opacity:0; transform:translateY(20px); }
    to   { opacity:1; transform:translateY(0); }
  }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes successPop {
    0%  { opacity:0; transform:scale(.9); }
    70% { transform:scale(1.04); }
    100%{ opacity:1; transform:scale(1); }
  }
  @keyframes shake {
    0%,100%{ transform:translateX(0); }
    20%    { transform:translateX(-6px); }
    40%    { transform:translateX(6px); }
    60%    { transform:translateX(-4px); }
    80%    { transform:translateX(4px); }
  }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }

  .form-input {
    width:100%; padding:14px 18px;
    border-radius:3px; font-family:'Montserrat',sans-serif;
    font-weight:300; font-size:.88rem;
    transition:border .25s, box-shadow .25s;
    outline:none;
  }
  .form-input:focus { box-shadow:0 0 0 3px rgba(194,24,91,.15); }
  .form-input.error { border-color:#C2185B !important; animation:shake .4s both; }
  .form-input::placeholder { opacity:.4; }

  .formule-card {
    padding:16px 18px; border-radius:4px; cursor:pointer;
    transition:all .25s; border:1px solid transparent;
  }
  .formule-card:hover { transform:translateY(-2px); }

  .submit-btn {
    width:100%; padding:18px;
    background:#C2185B; color:#fff; border:none; border-radius:3px;
    font-family:'Montserrat',sans-serif; font-weight:600; font-size:.76rem;
    letter-spacing:.16em; text-transform:uppercase;
    cursor:pointer; transition:all .3s;
    display:flex; align-items:center; justify-content:center; gap:12px;
  }
  .submit-btn:hover:not(:disabled) {
    background:#a01049; transform:translateY(-2px);
    box-shadow:0 12px 36px rgba(194,24,91,.4);
  }
  .submit-btn:disabled { opacity:.6; cursor:not-allowed; transform:none; }

  .pay-btn {
    width:100%; padding:18px;
    background:linear-gradient(135deg,#C9A96A,#E8D5A8);
    color:#0A0A0A; border:none; border-radius:3px;
    font-family:'Montserrat',sans-serif; font-weight:700; font-size:.78rem;
    letter-spacing:.16em; text-transform:uppercase;
    cursor:pointer; transition:all .3s;
    display:flex; align-items:center; justify-content:center; gap:12px;
    text-decoration:none;
  }
  .pay-btn:hover {
    transform:translateY(-2px);
    box-shadow:0 12px 36px rgba(201,169,106,.4);
  }

  .confirm-btn {
    width:100%; padding:14px;
    background:rgba(76,175,80,.1); color:#4CAF50;
    border:1px solid rgba(76,175,80,.3); border-radius:3px;
    font-family:'Montserrat',sans-serif; font-weight:600; font-size:.72rem;
    letter-spacing:.14em; text-transform:uppercase;
    cursor:pointer; transition:all .3s;
    display:flex; align-items:center; justify-content:center; gap:10px;
    margin-top:12px;
  }
  .confirm-btn:hover { background:rgba(76,175,80,.2); }

  .spinner {
    width:18px; height:18px; border-radius:50%;
    border:2px solid rgba(255,255,255,.3);
    border-top-color:#fff;
    animation:spin .7s linear infinite;
  }

  .field-error {
    font-family:'Montserrat',sans-serif; font-size:.7rem;
    color:#C2185B; margin-top:5px; font-weight:400;
    animation:formFadeUp .3s both;
  }

  .step-indicator {
    display:flex; align-items:center; justify-content:center;
    gap:8px; margin-bottom:32px;
  }
  .step-dot {
    width:8px; height:8px; border-radius:50%;
    transition:all .3s;
  }
`;

function validate(fields) {
  const errors = {};
  if (!fields.prenom.trim())       errors.prenom  = "Votre prénom est requis.";
  if (!fields.nom.trim())          errors.nom     = "Votre nom est requis.";
  if (!fields.email.trim())        errors.email   = "Votre email est requis.";
  else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(fields.email))
                                   errors.email   = "Adresse email invalide.";
  if (!fields.whatsapp.trim())     errors.whatsapp= "Votre numéro WhatsApp est requis.";
  else if (fields.whatsapp.replace(/\s/g,"").length < 8)
                                   errors.whatsapp= "Numéro trop court.";
  if (!fields.pays)                errors.pays    = "Veuillez sélectionner votre pays.";
  if (!fields.formule)             errors.formule = "Veuillez choisir une formule.";
  return errors;
}

export default function InscriptionForm({ theme="dark", defaultFormule=null, onSuccess=null, compact=false }) {
  const isDark = theme === "dark";

  const bg         = isDark ? "#141414"                : "#fff";
  const border     = isDark ? "rgba(201,169,106,.15)"  : "rgba(10,10,10,.1)";
  const textMain   = isDark ? "#F8F5F2"                : "#0A0A0A";
  const textSub    = isDark ? "rgba(248,245,242,.5)"   : "rgba(10,10,10,.45)";
  const inputBg    = isDark ? "rgba(255,255,255,.04)"  : "rgba(10,10,10,.03)";
  const inputBorder= isDark ? "rgba(255,255,255,.09)"  : "rgba(10,10,10,.12)";
  const labelColor = isDark ? "rgba(248,245,242,.6)"   : "rgba(10,10,10,.65)";

  // Liens de paiement depuis le CMS
  const [payLinks, setPayLinks] = useState({ F1:"", F2:"", F3:"", F4:"" });
  useEffect(() => {
    configAPI.public().then(res => {
      const map = {};
      if (Array.isArray(res.data)) res.data.forEach(i => { map[i.cle] = i.valeur; });
      setPayLinks({
        F1: map["paiement_lien_f1"] || "",
        F2: map["paiement_lien_f2"] || "",
        F3: map["paiement_lien_f3"] || "",
        F4: map["paiement_lien_f4"] || "",
      });
    }).catch(() => {});
  }, []);

  const [fields, setFields] = useState({
    prenom:"", nom:"", email:"", whatsapp:"", pays:"", formule: defaultFormule || "", message:"",
  });
  const [errors,   setErrors]   = useState({});
  const [step,     setStep]     = useState("form"); // form | payment | done
  const [apiError, setApiError] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [confirming, setConfirming] = useState(false);

  function set(key, val) {
    setFields(f => ({ ...f, [key]: val }));
    if (errors[key]) setErrors(e => { const n={...e}; delete n[key]; return n; });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate(fields);
    if (Object.keys(errs).length) { setErrors(errs); return; }

    setLoading(true);
    setApiError("");

    try {
      await contactAPI.envoyer({
        prenom:   fields.prenom,
        nom:      fields.nom,
        email:    fields.email,
        whatsapp: fields.whatsapp,
        pays:     fields.pays,
        formule:  fields.formule,
        message:  fields.message,
      });
      setStep("payment");
    } catch {
      if (import.meta.env.DEV) {
        setStep("payment");
      } else {
        setApiError("Impossible de contacter le serveur. Veuillez réessayer ou nous écrire sur WhatsApp.");
      }
    }
    setLoading(false);
  }

  async function confirmerPaiement() {
    setConfirming(true);
    try {
      // Notifier le backend que le paiement a été déclaré
      await contactAPI.envoyer({
        prenom:   fields.prenom,
        nom:      fields.nom,
        email:    fields.email,
        whatsapp: fields.whatsapp,
        pays:     fields.pays,
        formule:  fields.formule,
        message:  `[PAIEMENT DÉCLARÉ] ${fields.message}`,
      });
    } catch {}
    setConfirming(false);
    setStep("done");
    if (onSuccess) onSuccess(fields);
  }

  const formule = FORMULES.find(f => f.id === fields.formule);
  const payLink = payLinks[fields.formule] || "";

  // ── ÉTAPE PAIEMENT ────────────────────────────────────────
  if (step === "payment") {
    return (
      <>
        <style>{STYLES}</style>
        <div style={{
          background:bg, border:`1px solid ${border}`, borderRadius:"6px",
          padding: compact?"20px":"52px 44px",
          fontFamily:"'Montserrat',sans-serif",
          animation:"formFadeUp .5s both",
        }}>
          {/* Indicateurs d'étapes */}
          <div className="step-indicator">
            <div className="step-dot" style={{ background:"#4CAF50", width:"10px", height:"10px" }}/>
            <div style={{ height:"1px", width:"40px", background:"rgba(201,169,106,.3)" }}/>
            <div className="step-dot" style={{ background:"#C9A96A", width:"10px", height:"10px" }}/>
            <div style={{ height:"1px", width:"40px", background:"rgba(255,255,255,.1)" }}/>
            <div className="step-dot" style={{ background:"rgba(255,255,255,.2)", width:"8px", height:"8px" }}/>
          </div>

          <p style={{ fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"12px", textAlign:"center" }}>
            Étape 2 · Paiement
          </p>
          <h3 style={{
            fontFamily:"'Playfair Display',serif", fontSize:"1.6rem",
            fontWeight:600, color:textMain, marginBottom:"8px", lineHeight:1.2, textAlign:"center",
          }}>
            Finalisez votre inscription
          </h3>
          <p style={{ fontWeight:300, fontSize:".88rem", color:textSub, marginBottom:"28px", textAlign:"center" }}>
            Demande envoyée pour{" "}
            <strong style={{ color: formule?.color || "#C2185B" }}>{formule?.label}</strong>
            {" "}· {formule?.prix}
          </p>

          {/* Récap */}
          <div style={{
            padding:"16px 20px", marginBottom:"24px",
            background: isDark?"rgba(255,255,255,.03)":"rgba(10,10,10,.03)",
            border:`1px solid ${isDark?"rgba(255,255,255,.08)":"rgba(10,10,10,.08)"}`,
            borderRadius:"4px",
          }}>
            <p style={{ fontSize:".72rem", color:textSub, marginBottom:"8px", letterSpacing:".1em", textTransform:"uppercase" }}>Récapitulatif</p>
            <p style={{ fontSize:".88rem", color:textMain, fontWeight:500 }}>{fields.prenom} {fields.nom}</p>
            <p style={{ fontSize:".82rem", color:textSub, fontWeight:300 }}>{fields.email}</p>
            <p style={{ fontSize:".82rem", color:textSub, fontWeight:300 }}>{fields.whatsapp}</p>
          </div>

          {/* Bouton paiement */}
          {payLink ? (
            <a href={payLink} target="_blank" rel="noreferrer" className="pay-btn">
              Procéder au paiement · {formule?.prix}
            </a>
          ) : (
            <div style={{
              padding:"20px", textAlign:"center",
              background:"rgba(201,169,106,.05)", border:"1px dashed rgba(201,169,106,.2)",
              borderRadius:"4px", marginBottom:"16px",
            }}>
              <p style={{ fontSize:".85rem", color:"#C9A96A", marginBottom:"8px", fontWeight:500 }}>
                Lien de paiement bientôt disponible
              </p>
              <p style={{ fontSize:".78rem", color:textSub, fontWeight:300 }}>
                Prélia vous contactera sous 24h pour le paiement via WhatsApp.
              </p>
              <a href="https://wa.me/message/DI23LCDIMS5SF1" target="_blank" rel="noreferrer"
                style={{ display:"inline-block", marginTop:"12px", color:"#25D366", fontSize:".78rem", fontWeight:500, textDecoration:"none" }}>
                Contacter Prélia sur WhatsApp
              </a>
            </div>
          )}

          {/* Bouton confirmation paiement effectué */}
          <button className="confirm-btn" onClick={confirmerPaiement} disabled={confirming}>
            {confirming ? "Confirmation…" : "J'ai effectué mon paiement"}
          </button>

          <p style={{ textAlign:"center", marginTop:"16px", fontSize:".72rem", color:textSub, fontWeight:300 }}>
            En cliquant "J'ai effectué mon paiement", vous confirmez avoir réglé le montant correspondant à votre formule.
          </p>
        </div>
      </>
    );
  }

  // ── CONFIRMATION FINALE ───────────────────────────────────
  if (step === "done") {
    return (
      <>
        <style>{STYLES}</style>
        <div style={{
          background:bg, border:`1px solid ${border}`, borderRadius:"6px",
          padding: compact?"20px":"52px 44px",
          textAlign:"center", fontFamily:"'Montserrat',sans-serif",
          animation:"successPop .6s both",
        }}>
          <div style={{
            width:"72px", height:"72px", borderRadius:"50%",
            background:"rgba(76,175,80,.1)", border:"2px solid #4CAF50",
            display:"flex", alignItems:"center", justifyContent:"center",
            margin:"0 auto 24px", fontSize:"1.8rem",
          }}>✓</div>

          <p style={{ fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#4CAF50", marginBottom:"12px" }}>
            Paiement déclaré
          </p>
          <h3 style={{
            fontFamily:"'Playfair Display',serif", fontSize:"1.7rem",
            fontWeight:600, color:textMain, marginBottom:"16px", lineHeight:1.2,
          }}>
            Merci, {fields.prenom} !<br/>
            <em style={{ color:"#C9A96A", fontStyle:"italic" }}>Votre transformation commence.</em>
          </h3>
          <p style={{ fontWeight:300, fontSize:".9rem", color:textSub, lineHeight:1.8, maxWidth:"420px", margin:"0 auto 28px" }}>
            Votre inscription à la formule{" "}
            <strong style={{ color: formule?.color || "#C2185B" }}>{formule?.label}</strong>{" "}
            est confirmée. Prélia vous contactera sous 24h pour valider votre paiement et vous donner accès au programme.
          </p>

          <div style={{
            padding:"20px 24px", marginBottom:"24px",
            background: isDark?"rgba(255,255,255,.025)":"rgba(10,10,10,.03)",
            border:`1px solid ${isDark?"rgba(255,255,255,.07)":"rgba(10,10,10,.08)"}`,
            borderRadius:"4px",
          }}>
            <p style={{ fontWeight:400, fontSize:".8rem", color:textSub, marginBottom:"10px" }}>
              Pour toute question urgente :
            </p>
            <div style={{ display:"flex", gap:"16px", justifyContent:"center", flexWrap:"wrap" }}>
              <a href="https://wa.me/message/DI23LCDIMS5SF1" style={{ color:"#C9A96A", fontSize:".8rem", fontWeight:500, textDecoration:"none" }}>
                WhatsApp +229 01 96 11 40 93
              </a>
              <a href="mailto:whiteblackdress22@gmail.com" style={{ color:"#C9A96A", fontSize:".8rem", fontWeight:500, textDecoration:"none" }}>
                whiteblackdress22@gmail.com
              </a>
            </div>
          </div>

          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.05rem", color:textSub }}>
            Votre renaissance commence ici.
          </p>
        </div>
      </>
    );
  }

  // ── FORMULAIRE ────────────────────────────────────────────
  return (
    <>
      <style>{STYLES}</style>
      <div style={{
        background:bg, border:`1px solid ${border}`, borderRadius:"6px",
        padding: compact?"16px":"48px 40px",
        fontFamily:"'Montserrat',sans-serif",
        animation:"formFadeUp .5s both",
      }}>
        {/* Indicateurs */}
        <div className="step-indicator">
          <div className="step-dot" style={{ background:"#C9A96A", width:"10px", height:"10px" }}/>
          <div style={{ height:"1px", width:"40px", background:"rgba(255,255,255,.1)" }}/>
          <div className="step-dot" style={{ background:"rgba(255,255,255,.2)", width:"8px", height:"8px" }}/>
          <div style={{ height:"1px", width:"40px", background:"rgba(255,255,255,.1)" }}/>
          <div className="step-dot" style={{ background:"rgba(255,255,255,.2)", width:"8px", height:"8px" }}/>
        </div>

        {/* Header */}
        <div style={{ marginBottom:"32px" }}>
          <p style={{ fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"10px" }}>
            Inscription · Méta'Morph'Ose
          </p>
          <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize: compact?"1.4rem":"1.75rem", fontWeight:600, color:textMain, lineHeight:1.2 }}>
            Choisissez votre formule<br/>
            <em style={{ color:"#C9A96A", fontStyle:"italic" }}>et commencez votre transformation.</em>
          </h3>
        </div>

        <form onSubmit={handleSubmit} noValidate>

          {/* ── FORMULES ── */}
          <div style={{ marginBottom:"28px" }}>
            <label style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".7rem", fontWeight:500, letterSpacing:".12em", textTransform:"uppercase", color:labelColor, display:"block", marginBottom:"12px" }}>
              Votre formule *
            </label>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"10px" }}>
              {FORMULES.map(f => (
                <div key={f.id}
                  className="formule-card"
                  onClick={()=>set("formule",f.id)}
                  style={{
                    background: fields.formule===f.id ? `${f.color}12` : inputBg,
                    border:`1px solid ${fields.formule===f.id ? f.color : inputBorder}`,
                    boxShadow: fields.formule===f.id ? `0 4px 20px ${f.color}25` : "none",
                  }}
                >
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    <div>
                      <p style={{ fontWeight:600, fontSize:".78rem", color: fields.formule===f.id ? f.color : textMain, marginBottom:"3px", transition:"color .25s" }}>{f.label}</p>
                      <p style={{ fontWeight:300, fontSize:".75rem", color:textSub }}>{f.prix}</p>
                    </div>
                    <div style={{
                      width:"18px", height:"18px", borderRadius:"50%", flexShrink:0,
                      border:`2px solid ${fields.formule===f.id ? f.color : inputBorder}`,
                      background: fields.formule===f.id ? f.color : "transparent",
                      display:"flex", alignItems:"center", justifyContent:"center",
                      transition:"all .25s",
                    }}>
                      {fields.formule===f.id && <span style={{ color:"#fff", fontSize:".55rem", fontWeight:700 }}>✓</span>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {errors.formule && <p className="field-error">{errors.formule}</p>}
          </div>

          {/* ── NOM / PRÉNOM ── */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"16px" }}>
            <div>
              <label style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".7rem", fontWeight:500, letterSpacing:".1em", textTransform:"uppercase", color:labelColor, display:"block", marginBottom:"7px" }}>Prénom *</label>
              <input
                className={`form-input${errors.prenom?" error":""}`}
                type="text" placeholder="Votre prénom"
                value={fields.prenom} onChange={e=>set("prenom",e.target.value)}
                style={{ background:inputBg, border:`1px solid ${errors.prenom?"#C2185B":inputBorder}`, color:textMain }}
              />
              {errors.prenom && <p className="field-error">{errors.prenom}</p>}
            </div>
            <div>
              <label style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".7rem", fontWeight:500, letterSpacing:".1em", textTransform:"uppercase", color:labelColor, display:"block", marginBottom:"7px" }}>Nom *</label>
              <input
                className={`form-input${errors.nom?" error":""}`}
                type="text" placeholder="Votre nom"
                value={fields.nom} onChange={e=>set("nom",e.target.value)}
                style={{ background:inputBg, border:`1px solid ${errors.nom?"#C2185B":inputBorder}`, color:textMain }}
              />
              {errors.nom && <p className="field-error">{errors.nom}</p>}
            </div>
          </div>

          {/* ── EMAIL ── */}
          <div style={{ marginBottom:"16px" }}>
            <label style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".7rem", fontWeight:500, letterSpacing:".1em", textTransform:"uppercase", color:labelColor, display:"block", marginBottom:"7px" }}>Adresse e-mail *</label>
            <input
              className={`form-input${errors.email?" error":""}`}
              type="email" placeholder="votre@email.com"
              value={fields.email} onChange={e=>set("email",e.target.value)}
              style={{ background:inputBg, border:`1px solid ${errors.email?"#C2185B":inputBorder}`, color:textMain }}
            />
            {errors.email && <p className="field-error">{errors.email}</p>}
          </div>

          {/* ── WHATSAPP / PAYS ── */}
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"16px" }}>
            <div>
              <label style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".7rem", fontWeight:500, letterSpacing:".1em", textTransform:"uppercase", color:labelColor, display:"block", marginBottom:"7px" }}>WhatsApp *</label>
              <input
                className={`form-input${errors.whatsapp?" error":""}`}
                type="tel" placeholder="+229 01 00 00 00"
                value={fields.whatsapp} onChange={e=>set("whatsapp",e.target.value)}
                style={{ background:inputBg, border:`1px solid ${errors.whatsapp?"#C2185B":inputBorder}`, color:textMain }}
              />
              {errors.whatsapp && <p className="field-error">{errors.whatsapp}</p>}
            </div>
            <div>
              <label style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".7rem", fontWeight:500, letterSpacing:".1em", textTransform:"uppercase", color:labelColor, display:"block", marginBottom:"7px" }}>Pays *</label>
              <select
                className={`form-input${errors.pays?" error":""}`}
                value={fields.pays} onChange={e=>set("pays",e.target.value)}
                style={{ background:inputBg, border:`1px solid ${errors.pays?"#C2185B":inputBorder}`, color: fields.pays?textMain:textSub, cursor:"pointer" }}
              >
                <option value="" disabled>Votre pays</option>
                {PAYS.map(p => <option key={p} value={p} style={{ background:"#141414", color:"#F8F5F2" }}>{p}</option>)}
              </select>
              {errors.pays && <p className="field-error">{errors.pays}</p>}
            </div>
          </div>

          {/* ── MESSAGE ── */}
          <div style={{ marginBottom:"24px" }}>
            <label style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".7rem", fontWeight:500, letterSpacing:".1em", textTransform:"uppercase", color:labelColor, display:"block", marginBottom:"7px" }}>
              Message <span style={{ opacity:.5, fontWeight:300, textTransform:"none", letterSpacing:0 }}>(optionnel)</span>
            </label>
            <textarea
              className="form-input"
              placeholder="Une question ? Une situation particulière à partager avec Prélia ?"
              value={fields.message} onChange={e=>set("message",e.target.value)}
              rows={3}
              style={{ background:inputBg, border:`1px solid ${inputBorder}`, color:textMain, resize:"vertical", minHeight:"90px" }}
            />
          </div>

          {/* Erreur API */}
          {apiError && (
            <div style={{
              padding:"14px 18px", marginBottom:"20px",
              background:"rgba(194,24,91,.08)", border:"1px solid rgba(194,24,91,.3)",
              borderRadius:"3px", fontWeight:300, fontSize:".85rem",
              color:"#C2185B", animation:"formFadeUp .4s both",
            }}>
              {apiError}
            </div>
          )}

          <p style={{ fontWeight:300, fontSize:".72rem", color:textSub, lineHeight:1.65, marginBottom:"20px" }}>
            En soumettant ce formulaire, vous acceptez d'être contactée par Prélia APEDO AHONON concernant le programme Méta'Morph'Ose.
          </p>

          <button type="submit" className="submit-btn" disabled={loading}>
            {loading ? (
              <><div className="spinner"/> Envoi en cours…</>
            ) : (
              <>Envoyer ma demande · Étape suivante →</>
            )}
          </button>

          <div style={{ textAlign:"center", marginTop:"20px" }}>
            <p style={{ fontWeight:300, fontSize:".78rem", color:textSub }}>
              Préférez-vous écrire directement ?{" "}
              <a href="https://wa.me/message/DI23LCDIMS5SF1" style={{ color:"#C9A96A", textDecoration:"none", fontWeight:500 }}>
                WhatsApp
              </a>
            </p>
          </div>
        </form>
      </div>
    </>
  );
}
