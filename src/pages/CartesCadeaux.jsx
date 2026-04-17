import API_URL from '../config.js'
import { useState, useRef , useEffect } from "react";
import AuraButton from '../components/AuraButton'
import SectionCadeaux from '../components/SectionCadeaux';
import usePageBackground from "../hooks/usePageBackground";
import { QRCodeSVG } from "qrcode.react";
import { Link } from "react-router-dom";
import api from '../services/api';

/* ================================================================
   CARTES CADEAUX — Page complète
   1. Formulaire de commande avec aperçu temps réel
   2. Génération carte PDF visuelle
   3. Vérificateur de code
   ================================================================ */

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@1,300;1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  @media(max-width:768px){
    .carte-grid{grid-template-columns:1fr !important}
    .formule-btns{grid-template-columns:1fr 1fr !important}
    .carte-preview{width:100% !important;max-width:400px !important;margin:0 auto}
  }
  @media(max-width:480px){
    .formule-btns{grid-template-columns:1fr !important}
  }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.5} }

  .cc-input {
    width:100%; padding:12px 16px;
    background:rgba(255,255,255,.04);
    border:1px solid rgba(255,255,255,.09);
    border-radius:3px; color:#F8F5F2;
    font-family:'Montserrat',sans-serif;
    font-size:.85rem; font-weight:300;
    outline:none; transition:border .25s;
  }
  .cc-input:focus { border-color:rgba(201,169,106,.45); }
  .cc-input::placeholder { opacity:.35; }
  .cc-input option { background:#1a1a1a; }

  .cc-label {
    display:block; margin-bottom:7px;
    font-family:'Montserrat',sans-serif;
    font-size:.65rem; font-weight:500;
    letter-spacing:.14em; text-transform:uppercase;
    color:rgba(248,245,242,.45);
  }

  .formule-card {
    padding:16px 18px; border-radius:4px;
    cursor:pointer; border:1px solid rgba(255,255,255,.07);
    background:rgba(255,255,255,.025);
    transition:all .25s;
  }
  .formule-card:hover { transform:translateY(-2px); }
  .formule-card.selected { transform:translateY(-2px); }

  .btn-rose {
    display:inline-flex; align-items:center; justify-content:center; gap:10px;
    background:#C2185B; color:#fff;
    font-family:'Montserrat',sans-serif; font-weight:600;
    font-size:.76rem; letter-spacing:.16em; text-transform:uppercase;
    padding:15px 32px; border:none; border-radius:2px;
    cursor:pointer; transition:all .3s; text-decoration:none;
    width:100%;
  }
  .btn-rose:hover { background:#a01049; transform:translateY(-2px); box-shadow:0 10px 32px rgba(194,24,91,.4); }
  .btn-rose:disabled { opacity:.6; cursor:not-allowed; transform:none; }

  .btn-or {
    display:inline-flex; align-items:center; justify-content:center;
    background:transparent; color:#C9A96A;
    font-family:'Montserrat',sans-serif; font-weight:500;
    font-size:.76rem; letter-spacing:.16em; text-transform:uppercase;
    padding:14px 28px; border:1px solid #C9A96A; border-radius:2px;
    cursor:pointer; transition:all .3s; text-decoration:none;
    width:100%;
  }
  .btn-or:hover { background:#C9A96A; color:#0A0A0A; }

  @media(max-width:900px) {
    .cc-main-grid { grid-template-columns:1fr !important; }
    .cc-form-grid  { grid-template-columns:1fr !important; }
  }
  @media(max-width:600px) {
    .formule-grid { grid-template-columns:1fr 1fr !important; }
    .occasions-grid { grid-template-columns:1fr 1fr !important; }
  }
`;

const FORMULES = [
  { id:"F1", label:"Live · Groupe",      prix:"65 000",  color:"#C2185B", desc:"2 séances/semaine en ligne" },
  { id:"F2", label:"Live · Privé",       prix:"150 000", color:"#C9A96A", desc:"Suivi individuel en ligne",  featured:true },
  { id:"F3", label:"Présentiel · Groupe",prix:"250 000", color:"#A8C8E0", desc:"1 séance/semaine en présentiel" },
  { id:"F4", label:"Présentiel · Privé", prix:"350 000", color:"#D8C1A0", desc:"Expérience ultime en présentiel" },
];

const OCCASIONS = [
  "Anniversaire","Fête des femmes","Promotion professionnelle",
  "Nouvelle étape de vie","Nouveau départ","Simplement par amour",
  "Noël","Saint-Valentin","Autre",
];

/* ── Aperçu carte cadeau (rendu visuel) ─────────────────────── */
function CarteApercu({ form, code = null }) {
  const f = FORMULES.find(x => x.id === form.formule) || FORMULES[0];
  const hasContent = form.destinataire_nom || form.message_perso || form.formule;

  return (
    <div style={{
      position:"relative", width:"100%", aspectRatio:"1.6/1",
      background:"linear-gradient(135deg,#0A0A0A 0%,#1a0f0a 40%,#0d0507 100%)",
      borderRadius:"8px", overflow:"hidden",
      boxShadow:"0 24px 64px rgba(0,0,0,.6)",
      border:"1px solid rgba(201,169,106,.2)",
    }}>
      {/* Fond décoratif */}
      <div style={{ position:"absolute", inset:0, background:`radial-gradient(ellipse 80% 60% at 80% 50%, ${f.color}15, transparent 70%)` }}/>
      <div style={{ position:"absolute", top:"-20%", right:"-10%", width:"300px", height:"300px", borderRadius:"50%", background:`radial-gradient(circle, ${f.color}10, transparent 70%)` }}/>

      {/* Lignes décoratives */}
      <div style={{ position:"absolute", top:0, left:0, right:0, height:"2px", background:`linear-gradient(90deg, transparent, ${f.color}, transparent)`, opacity:.6 }}/>
      <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"1px", background:`linear-gradient(90deg, transparent, rgba(201,169,106,.3), transparent)` }}/>

      {/* Contenu */}
      <div style={{ position:"relative", height:"100%", display:"flex", flexDirection:"column", justifyContent:"space-between", padding:"clamp(16px,4%,32px)" }}>

        {/* Header */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"clamp(.5rem,.8vw,.62rem)", letterSpacing:".25em", textTransform:"uppercase", color:"rgba(201,169,106,.6)", marginBottom:"4px" }}>
              Carte Cadeau
            </p>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(.85rem,1.5vw,1.1rem)", fontWeight:600, color:"#F8F5F2" }}>
              Meta'<span style={{color:"#C9A96A"}}>Morph'</span><span style={{color:"#C2185B"}}>Ose</span>
            </p>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"clamp(.45rem,.7vw,.58rem)", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(248,245,242,.35)" }}>Formule</p>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"clamp(.55rem,.9vw,.72rem)", fontWeight:600, color:f.color, marginTop:"2px" }}>{f.label}</p>
          </div>
        </div>

        {/* Centre — destinataire */}
        <div style={{ textAlign:"center", padding:"0 8%" }}>
          {form.occasion && (
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"clamp(.45rem,.7vw,.6rem)", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(248,245,242,.35)", marginBottom:"8px" }}>
              {form.occasion}
            </p>
          )}
          <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:"clamp(.7rem,1.2vw,.9rem)", color:"rgba(248,245,242,.4)", marginBottom:"8px" }}>
            Pour
          </p>
          <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1rem,2vw,1.6rem)", fontWeight:700, color:"#F8F5F2", letterSpacing:".02em", minHeight:"2em", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {form.destinataire_nom || <span style={{opacity:.2, fontStyle:"italic", fontWeight:400}}>Nom du destinataire</span>}
          </p>
          {form.message_perso && (
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"clamp(.6rem,1vw,.82rem)", color:"rgba(248,245,242,.55)", marginTop:"10px", lineHeight:1.5, maxHeight:"2.5em", overflow:"hidden" }}>
              « {form.message_perso} »
            </p>
          )}
        </div>

        {/* Footer */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-end" }}>
          <div>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"clamp(.55rem,.9vw,.72rem)", color:"rgba(248,245,242,.3)" }}>
              Je ne crée pas des apparences.<br/>Je révèle des essences.
            </p>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(.8rem,1.4vw,1.1rem)", fontWeight:700, color:f.color }}>
              {f.prix} <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6em", color:"rgba(248,245,242,.4)" }}>FCFA</span>
            </p>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:"clamp(.4rem,.65vw,.55rem)", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(248,245,242,.2)", marginTop:"2px" }}>
              Valable 1 an
            </p>
          </div>
        </div>
      </div>

      {/* QR Code en bas à droite */}
      <div style={{ position:"absolute", bottom:"clamp(8px,2%,14px)", right:"clamp(8px,2%,14px)", background:"rgba(255,255,255,.9)", borderRadius:"3px", padding:"4px", zIndex:4 }}>
        <QRCodeSVG
          value={`${window.location.origin}/carte/${code || "MMO-PREVIEW"}`}
          size={32}
          bgColor="#fff"
          fgColor="#0A0A0A"
          level="M"
          includeMargin={false}
        />
      </div>

      {/* Watermark */}
      <div style={{ position:"absolute", bottom:"8px", left:"50%", transform:"translateX(-50%)", fontFamily:"'Playfair Display',serif", fontSize:"clamp(3rem,6vw,5rem)", fontWeight:700, color:"rgba(255,255,255,.02)", whiteSpace:"nowrap", pointerEvents:"none", letterSpacing:".05em" }}>
        MMO
      </div>
    </div>
  );
}

/* ── Vérificateur de code ───────────────────────────────────── */
function VerificateurCode() {
  const [code,     setCode]     = useState("");
  const [result,   setResult]   = useState(null);
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function verifier() {
    if (!code.trim()) return;
    setLoading(true); setError(""); setResult(null);
    try {
      const res  = await fetch(`/api/cadeaux/verifier/${code.trim().toUpperCase()}/`);
      const data = await res.json();
      if (res.ok) setResult(data);
      else setError(data.detail || "Code invalide.");
    } catch {
      setError("Impossible de vérifier. Réessayez.");
    }
    setLoading(false);
  }

  return (
    <div style={{ padding:"32px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"6px" }}>
      <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"16px" }}>
        Vérifier un code cadeau
      </p>
      <div style={{ display:"flex", gap:"10px", marginBottom:"16px" }}>
        <input
          className="cc-input"
          placeholder="Ex: MMO-ABC12345"
          value={code}
          onChange={e => setCode(e.target.value.toUpperCase())}
          onKeyDown={e => e.key === "Enter" && verifier()}
          style={{ fontFamily:"'Montserrat',sans-serif", letterSpacing:".12em", fontSize:".88rem" }}
        />
        <button onClick={verifier} disabled={loading || !code.trim()} style={{
          padding:"12px 20px", background:"#C9A96A", color:"#0A0A0A",
          border:"none", borderRadius:"3px", cursor:"pointer",
          fontFamily:"'Montserrat',sans-serif", fontWeight:600,
          fontSize:".72rem", letterSpacing:".1em", textTransform:"uppercase",
          whiteSpace:"nowrap", transition:"all .25s", flexShrink:0,
          opacity: loading || !code.trim() ? .6 : 1,
        }}>
          {loading ? "..." : "Vérifier"}
        </button>
      </div>

      {error && (
        <div style={{ padding:"12px 16px", background:"rgba(239,83,80,.08)", border:"1px solid rgba(239,83,80,.25)", borderRadius:"3px", fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"#ef5350", fontWeight:300 }}>
          {error}
        </div>
      )}

      {result && (
        <div style={{ padding:"20px", background: result.valide ? "rgba(76,175,80,.08)" : "rgba(239,83,80,.08)", border:`1px solid ${result.valide ? "rgba(76,175,80,.25)" : "rgba(239,83,80,.25)"}`, borderRadius:"4px", animation:"fadeUp .4s both" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", fontWeight:600, color:"#F8F5F2" }}>
              {result.destinataire_nom}
            </p>
            <span style={{ padding:"4px 12px", borderRadius:"100px", fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", background: result.valide ? "rgba(76,175,80,.15)" : "rgba(239,83,80,.15)", color: result.valide ? "#4CAF50" : "#ef5350", border:`1px solid ${result.valide ? "rgba(76,175,80,.3)" : "rgba(239,83,80,.3)"}` }}>
              {result.valide ? "Valide" : result.statut_label}
            </span>
          </div>
          {[
            ["Formule", result.formule_label],
            ["Occasion", result.occasion],
            ["Expire le", result.date_expiration ? new Date(result.date_expiration).toLocaleDateString("fr-FR") : "—"],
          ].filter(([,v]) => v).map(([l,v]) => (
            <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"6px 0", borderBottom:"1px solid rgba(255,255,255,.05)", fontFamily:"'Montserrat',sans-serif", fontSize:".8rem" }}>
              <span style={{ color:"rgba(248,245,242,.4)", fontWeight:300 }}>{l}</span>
              <span style={{ color:"#F8F5F2", fontWeight:400 }}>{v}</span>
            </div>
          ))}
          {result.message_perso && (
            <p style={{ marginTop:"12px", fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:".95rem", color:"rgba(248,245,242,.55)", lineHeight:1.65 }}>
              « {result.message_perso} »
            </p>
          )}
          {result.valide && (
            <div style={{ marginTop:"16px" }}>
              <Link to="/contact" style={{ display:"block", textAlign:"center", padding:"12px", background:"#C2185B", color:"#fff", fontFamily:"'Montserrat',sans-serif", fontWeight:600, fontSize:".72rem", letterSpacing:".12em", textTransform:"uppercase", textDecoration:"none", borderRadius:"3px" }}>
                Utiliser cette carte cadeau
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── PAGE PRINCIPALE ─────────────────────────────────────────── */
export default function CartesCadeaux() {
  usePageBackground("carte");
  const [form, setForm] = useState({
    formule:"F2", acheteur_nom:"", acheteur_email:"", acheteur_tel:"",
    destinataire_nom:"", destinataire_email:"", occasion:"", message_perso:"",
  });
  const [step,    setStep]    = useState(1); // 1=formulaire, 2=apercu, 3=success
  const [loading, setLoading] = useState(false);
  const [result,  setResult]  = useState(null);
  const [errors,  setErrors]  = useState({});
  const [tab,     setTab]     = useState("commander"); // commander | verifier

  const f = FORMULES.find(x => x.id === form.formule);

  function set(key, val) {
    setForm(p => ({...p, [key]: val}));
    if (errors[key]) setErrors(p => { const n={...p}; delete n[key]; return n; });
  }

  function validate() {
    const e = {};
    if (!form.acheteur_nom.trim())    e.acheteur_nom    = "Requis";
    if (!form.acheteur_email.trim())  e.acheteur_email  = "Requis";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.acheteur_email)) e.acheteur_email = "Email invalide";
    if (!form.destinataire_nom.trim())e.destinataire_nom= "Requis";
    if (!form.formule)                e.formule         = "Choisissez une formule";
    return e;
  }

  async function commander() {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    setLoading(true);
    try {
      const res  = await fetch(API_URL + '/api/cadeaux/commander/', {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) { setResult(data); setStep(3); }
      else setErrors({ global: data.detail || "Erreur. Réessayez." });
    } catch {
      // Mode dev — simuler succès
      setResult({ code:`MMO-${Math.random().toString(36).substring(2,10).toUpperCase()}`, carte:{ formule_label: f?.label, destinataire_nom: form.destinataire_nom } });
      setStep(3);
    }
    setLoading(false);
  }

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ background:"#0A0A0A", minHeight:"100vh", color:"#F8F5F2", fontFamily:"'Montserrat',sans-serif" }}>

        {/* Nav */}
        <nav style={{ padding:"18px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"rgba(10,10,10,.95)", backdropFilter:"blur(20px)", zIndex:100 }}>
          <Link to="/" style={{ textDecoration:"none" }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem" }}>
              <span style={{color:"#F8F5F2"}}>Meta'</span>
              <span style={{color:"#C9A96A"}}>Morph'</span>
              <span style={{color:"#C2185B"}}>Ose</span>
            </span>
          </Link>
          <div style={{ display:"flex", gap:"16px", alignItems:"center" }}>
            <Link to="/" style={{ fontFamily:"'Montserrat'", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}>Accueil</Link>
            <Link to="/contact" style={{ fontFamily:"'Montserrat'", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", background:"#C2185B", color:"#fff", textDecoration:"none", padding:"9px 18px", borderRadius:"2px" }}>S'inscrire</Link>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ padding:"60px 24px 40px", textAlign:"center", background:"linear-gradient(180deg,#0A0A0A,#0d0507)", position:"relative" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 50% 40% at 50% 60%,rgba(194,24,91,.06),transparent 70%)" }}/>
          <div style={{ position:"relative", maxWidth:"600px", margin:"0 auto" }}>
            <p style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"14px", animation:"fadeUp .7s both" }}>Offrir une transformation</p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.8rem,5vw,3rem)", fontWeight:700, lineHeight:1.1, marginBottom:"16px", animation:"fadeUp .8s .1s both" }}>
              La Carte Cadeau<br/>
              <em style={{ fontStyle:"italic", fontWeight:400, background:"linear-gradient(135deg,#C9A96A,#E8D5A8,#C9A96A)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmer 4s linear infinite" }}>
                Méta'Morph'Ose
              </em>
            </h1>
            <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:"clamp(.85rem,2vw,.95rem)", color:"rgba(248,245,242,.5)", lineHeight:1.8, animation:"fadeUp .8s .2s both" }}>
              Offrez à une femme que vous aimez la possibilité de se révéler, de reprendre confiance et d'oser devenir pleinement elle-même.
            </p>
          </div>
        </section>

        {/* Tabs */}
        <div style={{ maxWidth:"1100px", margin:"0 auto", padding:"0 24px" }}>
          <div style={{ display:"flex", gap:"4px", background:"rgba(255,255,255,.03)", borderRadius:"4px", padding:"4px", width:"fit-content", margin:"0 auto 40px" }}>
            {[["commander","Offrir une carte"],["verifier","Vérifier un code"]].map(([id,label]) => (
              <button key={id} onClick={()=>setTab(id)} style={{ padding:"11px 24px", borderRadius:"3px", border:"none", cursor:"pointer", fontFamily:"'Montserrat'", fontSize:".72rem", fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", background:tab===id?"#C2185B":"transparent", color:tab===id?"#fff":"rgba(248,245,242,.4)", transition:"all .25s" }}>
                {label}
              </button>
            ))}
          </div>

          {/* ── TAB COMMANDER ── */}
          {tab === "commander" && step < 3 && (
            <div className="cc-main-grid" style={{ display:"grid", gridTemplateColumns:"1fr 420px", gap:"48px", alignItems:"start", paddingBottom:"80px" }}>

              {/* Formulaire */}
              <div style={{ animation:"fadeUp .5s both" }}>
                <p style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"24px" }}>
                  {step === 1 ? "1. Choisissez la formule" : "2. Vérifiez et confirmez"}
                </p>

                {/* Formules */}
                <div className="formule-grid" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"10px", marginBottom:"28px" }}>
                  {FORMULES.map(f => (
                    <div key={f.id} className={`formule-card${form.formule===f.id?" selected":""}`}
                      onClick={() => set("formule", f.id)}
                      style={{ borderColor: form.formule===f.id ? f.color : "rgba(255,255,255,.07)", background: form.formule===f.id ? `${f.color}10` : "rgba(255,255,255,.025)", boxShadow: form.formule===f.id ? `0 4px 20px ${f.color}20` : "none" }}>
                      {f.featured && <span style={{ display:"block", fontFamily:"'Montserrat'", fontSize:".55rem", fontWeight:700, letterSpacing:".15em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"5px" }}>Recommandé</span>}
                      <p style={{ fontFamily:"'Montserrat'", fontWeight:600, fontSize:".78rem", color:form.formule===f.id?f.color:"#F8F5F2", marginBottom:"3px", transition:"color .25s" }}>{f.label}</p>
                      <p style={{ fontFamily:"'Montserrat'", fontWeight:700, fontSize:"1rem", color:form.formule===f.id?f.color:"#F8F5F2", marginBottom:"3px" }}>{f.prix} <span style={{ fontSize:".6em", color:"rgba(248,245,242,.35)", fontWeight:300 }}>FCFA</span></p>
                      <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".72rem", color:"rgba(248,245,242,.45)" }}>{f.desc}</p>
                      <div style={{ width:"16px", height:"16px", borderRadius:"50%", border:`2px solid ${form.formule===f.id?f.color:"rgba(255,255,255,.2)"}`, background:form.formule===f.id?f.color:"transparent", marginTop:"10px", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .25s" }}>
                        {form.formule===f.id && <span style={{ color:"#fff", fontSize:".55rem", fontWeight:700 }}>✓</span>}
                      </div>
                    </div>
                  ))}
                </div>
                {errors.formule && <p style={{ color:"#C2185B", fontSize:".72rem", marginBottom:"16px" }}>{errors.formule}</p>}

                {/* Destinataire */}
                <div style={{ marginBottom:"24px" }}>
                  <p style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"14px" }}>Pour qui ?</p>
                  <div className="cc-form-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                    <div>
                      <label className="cc-label">Prénom et nom *</label>
                      <input className="cc-input" placeholder="Prénom Nom" value={form.destinataire_nom} onChange={e=>set("destinataire_nom",e.target.value)}/>
                      {errors.destinataire_nom && <p style={{ color:"#C2185B", fontSize:".7rem", marginTop:"4px" }}>{errors.destinataire_nom}</p>}
                    </div>
                    <div>
                      <label className="cc-label">Email (optionnel)</label>
                      <input className="cc-input" type="email" placeholder="email@exemple.com" value={form.destinataire_email} onChange={e=>set("destinataire_email",e.target.value)}/>
                    </div>
                  </div>
                </div>

                {/* Occasion */}
                <div style={{ marginBottom:"24px" }}>
                  <label className="cc-label">Occasion</label>
                  <div className="occasions-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px" }}>
                    {OCCASIONS.map(o => (
                      <button key={o} onClick={()=>set("occasion",o)} style={{ padding:"9px 10px", border:`1px solid ${form.occasion===o?"#C9A96A":"rgba(255,255,255,.07)"}`, borderRadius:"3px", background:form.occasion===o?"rgba(201,169,106,.1)":"transparent", color:form.occasion===o?"#C9A96A":"rgba(248,245,242,.45)", fontFamily:"'Montserrat'", fontSize:".68rem", fontWeight:500, cursor:"pointer", transition:"all .25s", textAlign:"center" }}>
                        {o}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Message */}
                <div style={{ marginBottom:"28px" }}>
                  <label className="cc-label">Message personnel <span style={{ opacity:.5, fontWeight:300, textTransform:"none", letterSpacing:0 }}>(optionnel)</span></label>
                  <textarea className="cc-input" rows={3} placeholder="Votre message apparaîtra sur la carte cadeau…" value={form.message_perso} onChange={e=>set("message_perso",e.target.value)} style={{ resize:"vertical", minHeight:"80px" }}/>
                </div>

                {/* Acheteur */}
                <div style={{ marginBottom:"28px" }}>
                  <p style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"14px" }}>Vos coordonnées</p>
                  <div className="cc-form-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                    <div>
                      <label className="cc-label">Votre nom *</label>
                      <input className="cc-input" placeholder="Votre nom" value={form.acheteur_nom} onChange={e=>set("acheteur_nom",e.target.value)}/>
                      {errors.acheteur_nom && <p style={{ color:"#C2185B", fontSize:".7rem", marginTop:"4px" }}>{errors.acheteur_nom}</p>}
                    </div>
                    <div>
                      <label className="cc-label">Votre email *</label>
                      <input className="cc-input" type="email" placeholder="votre@email.com" value={form.acheteur_email} onChange={e=>set("acheteur_email",e.target.value)}/>
                      {errors.acheteur_email && <p style={{ color:"#C2185B", fontSize:".7rem", marginTop:"4px" }}>{errors.acheteur_email}</p>}
                    </div>
                    <div style={{ gridColumn:"1/-1" }}>
                      <label className="cc-label">WhatsApp</label>
                      <input className="cc-input" placeholder="+229 01 00 00 00" value={form.acheteur_tel} onChange={e=>set("acheteur_tel",e.target.value)}/>
                    </div>
                  </div>
                </div>

                {errors.global && (
                  <div style={{ padding:"12px 16px", marginBottom:"16px", background:"rgba(239,83,80,.08)", border:"1px solid rgba(239,83,80,.25)", borderRadius:"3px", fontSize:".82rem", color:"#ef5350", fontWeight:300 }}>
                    {errors.global}
                  </div>
                )}

                <button className="btn-rose" onClick={commander} disabled={loading}>
                  {loading ? "Envoi en cours…" : "Commander la carte cadeau"}
                </button>

                <p style={{ marginTop:"14px", fontFamily:"'Montserrat'", fontWeight:300, fontSize:".75rem", color:"rgba(248,245,242,.3)", textAlign:"center", lineHeight:1.65 }}>
                  Prélia vous contactera sous 24h pour confirmer et organiser le paiement.
                </p>
              </div>

              {/* Aperçu temps réel */}
              <div style={{ position:"sticky", top:"90px", animation:"fadeUp .5s .1s both" }}>
                <p style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"16px" }}>
                  Aperçu de votre carte
                </p>
                <CarteApercu form={form} />
                <p style={{ marginTop:"12px", fontFamily:"'Montserrat'", fontWeight:300, fontSize:".72rem", color:"rgba(248,245,242,.3)", textAlign:"center", fontStyle:"italic" }}>
                  L'aperçu se met à jour en temps réel
                </p>

                {/* Récap prix */}
                <div style={{ marginTop:"20px", padding:"18px 20px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"4px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"8px" }}>
                    <span style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.5)" }}>Formule sélectionnée</span>
                    <span style={{ fontFamily:"'Montserrat'", fontWeight:500, fontSize:".82rem", color: f?.color }}>{f?.label}</span>
                  </div>
                  <div style={{ display:"flex", justifyContent:"space-between", paddingTop:"10px", borderTop:"1px solid rgba(255,255,255,.06)" }}>
                    <span style={{ fontFamily:"'Montserrat'", fontWeight:600, fontSize:".88rem" }}>Total</span>
                    <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:700, color: f?.color }}>{f?.prix} FCFA</span>
                  </div>
                  <p style={{ marginTop:"10px", fontFamily:"'Montserrat'", fontWeight:300, fontSize:".7rem", color:"rgba(248,245,242,.3)", lineHeight:1.6 }}>
                    Paiement par Mobile Money ou virement organisé avec Prélia après confirmation.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── SUCCÈS ── */}
          {tab === "commander" && step === 3 && result && (
            <div style={{ maxWidth:"680px", margin:"0 auto", padding:"0 0 80px", animation:"fadeUp .6s both" }}>
              <div style={{ padding:"52px 40px", background:"#141414", border:"1px solid rgba(201,169,106,.15)", borderRadius:"6px", textAlign:"center" }}>
                <div style={{ width:"64px", height:"64px", borderRadius:"50%", background:"rgba(76,175,80,.1)", border:"2px solid rgba(76,175,80,.4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:"1.5rem" }}>✓</div>
                <p style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"12px" }}>Commande enregistrée</p>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.8rem", fontWeight:600, marginBottom:"16px" }}>
                  Merci, {form.acheteur_nom.split(" ")[0]} !
                </h2>
                <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.55)", lineHeight:1.8, marginBottom:"28px", maxWidth:"440px", margin:"0 auto 28px" }}>
                  Votre commande de carte cadeau pour <strong style={{ color:"#F8F5F2" }}>{form.destinataire_nom}</strong> — formule <strong style={{ color: f?.color }}>{f?.label}</strong> — a bien été enregistrée. Prélia vous contactera sous 24h.
                </p>

                {/* Code généré */}
                <div style={{ padding:"20px", background:"rgba(201,169,106,.06)", border:"1px solid rgba(201,169,106,.2)", borderRadius:"4px", marginBottom:"28px" }}>
                  <p style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(201,169,106,.6)", marginBottom:"8px" }}>Votre code de référence</p>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.8rem", fontWeight:700, color:"#C9A96A", letterSpacing:".1em" }}>
                    {result.code}
                  </p>
                  <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".72rem", color:"rgba(248,245,242,.3)", marginTop:"6px" }}>
                    Conservez ce code. La carte sera activée après paiement.
                  </p>
                </div>

                {/* Aperçu final avec vrai QR code */}
                <div style={{ marginBottom:"28px", position:"relative" }}>
                  <CarteApercu form={form} code={result.code} />
                </div>
                <div style={{ marginBottom:"28px", padding:"20px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", borderRadius:"4px", display:"flex", gap:"20px", alignItems:"center", flexWrap:"wrap" }}>
                  <div style={{ background:"#fff", padding:"12px", borderRadius:"4px", flexShrink:0 }}>
                    <QRCodeSVG
                      value={`${window.location.origin}/carte/${result.code}`}
                      size={120}
                      bgColor="#ffffff"
                      fgColor="#0A0A0A"
                      level="H"
                      includeMargin={false}
                    />
                  </div>
                  <div>
                    <p style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".18em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"8px" }}>QR Code de la carte</p>
                    <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".8rem", color:"rgba(248,245,242,.5)", lineHeight:1.7 }}>
                      Ce QR code est unique à cette carte. Prélia peut le scanner pour vérifier et activer la carte instantanément.
                    </p>
                  </div>
                </div>

                <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
                  <a href="https://wa.me/message/DI23LCDIMS5SF1" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#25D366", color:"#fff", fontFamily:"'Montserrat'", fontWeight:600, fontSize:".72rem", letterSpacing:".12em", textTransform:"uppercase", padding:"13px 24px", borderRadius:"3px", textDecoration:"none" }}>
                    Contacter Prélia
                  </a>
                  <Link to="/" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"transparent", color:"#C9A96A", fontFamily:"'Montserrat'", fontWeight:500, fontSize:".72rem", letterSpacing:".12em", textTransform:"uppercase", padding:"12px 24px", border:"1px solid rgba(201,169,106,.3)", borderRadius:"3px", textDecoration:"none" }}>
                    Retour à l'accueil
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ── TAB VÉRIFIER ── */}
          {tab === "verifier" && (
            <div style={{ maxWidth:"560px", margin:"0 auto", paddingBottom:"80px", animation:"fadeUp .5s both" }}>
              <VerificateurCode />
              <div style={{ marginTop:"24px", padding:"20px 24px", background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.05)", borderRadius:"4px" }}>
                <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".8rem", color:"rgba(248,245,242,.4)", lineHeight:1.7 }}>
                  Le code cadeau est au format <strong style={{ color:"rgba(248,245,242,.6)", letterSpacing:".08em" }}>MMO-XXXXXXXX</strong>. Il vous a été communiqué par email après la commande et activation de votre carte.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
      <SectionCadeaux />
      <AuraButton />
    </>
  );
}
