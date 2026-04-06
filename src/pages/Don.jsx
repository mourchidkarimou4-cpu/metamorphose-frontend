import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

const KKIAPAY_PUBLIC_KEY = "VOTRE_CLE_PUBLIQUE_KKIAPAY";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --noir:#0A0A0A; --or:#C9A96A; --or-light:#E8D5A8;
    --rose:#C2185B; --beige:#D8C1A0; --beige-light:#F2EBE0;
    --blanc:#F8F5F2;
    --ff-t:'Playfair Display',Georgia,serif;
    --ff-b:'Montserrat',sans-serif;
    --ff-a:'Cormorant Garamond',Georgia,serif;
    --ease:cubic-bezier(0.4,0,0.2,1);
  }
  html { scroll-behavior:smooth; }
  body { background:var(--noir); color:var(--blanc); font-family:var(--ff-b); font-weight:300; line-height:1.7; overflow-x:hidden; }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes pulse-or  { 0%,100%{box-shadow:0 0 24px rgba(201,169,106,.3)} 50%{box-shadow:0 0 48px rgba(201,169,106,.6)} }
  @keyframes heartbeat { 0%,100%{transform:scale(1)} 50%{transform:scale(1.12)} }

  .reveal { opacity:0; transform:translateY(30px); transition:opacity .8s ease,transform .8s ease; }
  .reveal.visible { opacity:1; transform:none; }

  .btn-p {
    display:inline-flex; align-items:center; justify-content:center; gap:10px;
    background:var(--rose); color:#fff; font-family:var(--ff-b); font-weight:700;
    font-size:.76rem; letter-spacing:.16em; text-transform:uppercase;
    padding:17px 36px; border:none; border-radius:2px; cursor:pointer;
    text-decoration:none; transition:all .35s var(--ease);
  }
  .btn-p:hover { background:#a01049; transform:translateY(-3px); box-shadow:0 14px 40px rgba(194,24,91,.4); }
  .btn-p:disabled { opacity:.6; cursor:not-allowed; transform:none; }

  .btn-or {
    display:inline-flex; align-items:center; justify-content:center; gap:10px;
    background:var(--or); color:var(--noir); font-family:var(--ff-b); font-weight:700;
    font-size:.76rem; letter-spacing:.16em; text-transform:uppercase;
    padding:17px 36px; border:none; border-radius:2px; cursor:pointer;
    text-decoration:none; transition:all .35s; animation:pulse-or 3s ease-in-out infinite;
  }
  .btn-or:hover { background:var(--or-light); transform:translateY(-3px); }
  .btn-or:disabled { opacity:.6; cursor:not-allowed; transform:none; animation:none; }

  .montant-btn {
    padding:14px 20px; background:rgba(255,255,255,.04);
    border:1px solid rgba(255,255,255,.08); border-radius:4px;
    color:rgba(248,245,242,.7); font-family:var(--ff-b); font-size:.82rem;
    font-weight:500; cursor:pointer; transition:all .25s; text-align:center;
  }
  .montant-btn:hover { border-color:rgba(201,169,106,.3); color:var(--or); background:rgba(201,169,106,.05); }
  .montant-btn.selected { border-color:var(--or); background:rgba(201,169,106,.1); color:var(--or); }

  .impact-card {
    padding:28px 24px; background:rgba(255,255,255,.025);
    border:1px solid rgba(201,169,106,.1); border-radius:6px;
    text-align:center; transition:all .35s;
  }
  .impact-card:hover { transform:translateY(-4px); border-color:rgba(201,169,106,.25); background:rgba(201,169,106,.04); }

  .form-input {
    width:100%; padding:13px 16px;
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
    border-radius:3px; color:var(--blanc); font-family:var(--ff-b);
    font-size:16px; font-weight:300; outline:none; transition:border .25s;
  }
  .form-input:focus { border-color:rgba(201,169,106,.45); }
  .form-input::placeholder { opacity:.4; }

  @media(max-width:768px) {
    .montants-grid { grid-template-columns:repeat(2,1fr) !important; }
    .impact-grid { grid-template-columns:1fr !important; }
    .don-grid { grid-template-columns:1fr !important; gap:40px !important; }
    .btn-or, .btn-p { width:100% !important; justify-content:center !important; }
  }
  @media(max-width:480px) {
    .montants-grid { grid-template-columns:repeat(2,1fr) !important; }
  }
`;

const MONTANTS_SUGGERES = [
  { val: 1000,  label: "1 000 FCFA" },
  { val: 2500,  label: "2 500 FCFA" },
  { val: 5000,  label: "5 000 FCFA" },
  { val: 10000, label: "10 000 FCFA" },
  { val: 25000, label: "25 000 FCFA" },
  { val: 0,     label: "Autre montant" },
];

const IMPACTS = [
  { montant:"1 000 FCFA",  icone:"📚", titre:"Ressources", desc:"Finance l'accès à un guide PDF pour une femme qui n'a pas les moyens." },
  { montant:"5 000 FCFA",  icone:"🌱", titre:"Soutien", desc:"Aide à couvrir les frais d'hébergement et de diffusion des lives." },
  { montant:"10 000 FCFA", icone:"💡", titre:"Formation", desc:"Contribue à la création d'un nouveau module de formation gratuit." },
  { montant:"25 000 FCFA", icone:"🌍", titre:"Impact", desc:"Permet d'offrir une bourse à une femme pour rejoindre le programme MMO." },
];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function Don() {
  const [montant,       setMontant]       = useState(5000);
  const [montantCustom, setMontantCustom] = useState("");
  const [showCustom,    setShowCustom]    = useState(false);
  const [prenom,        setPrenom]        = useState("");
  const [email,         setEmail]         = useState("");
  const [message,       setMessage]       = useState("");
  const [anonyme,       setAnonyme]       = useState(false);
  const [loading,       setLoading]       = useState(false);
  const [step,          setStep]          = useState("form"); // form | success
  useReveal();

  useEffect(() => {
    if (!document.getElementById("kkiapay-script")) {
      const script = document.createElement("script");
      script.id = "kkiapay-script";
      script.src = "https://cdn.kkiapay.me/k.js";
      script.async = true;
      document.head.appendChild(script);
    }
  }, []);

  const montantFinal = showCustom
    ? parseInt(montantCustom) || 0
    : montant;

  function selectionnerMontant(val) {
    if (val === 0) {
      setShowCustom(true);
      setMontant(0);
    } else {
      setShowCustom(false);
      setMontant(val);
      setMontantCustom("");
    }
  }

  function lancerDon(e) {
    e.preventDefault();
    if (!prenom.trim() || !email.trim() || montantFinal < 100) return;
    setLoading(true);

    if (window.openKkiapayWidget) {
      window.openKkiapayWidget({
        amount: montantFinal,
        api_key: KKIAPAY_PUBLIC_KEY,
        sandbox: true,
        email: email,
        name: prenom,
        theme: "#C9A96A",
      });
      window.addSuccessListener(() => {
        setStep("success");
        setLoading(false);
      });
    } else {
      // Simulation
      setTimeout(() => {
        setStep("success");
        setLoading(false);
      }, 1500);
    }
  }

  return (
    <>
      <style>{STYLES}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ padding:"16px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"rgba(10,10,10,.96)", backdropFilter:"blur(20px)", zIndex:200 }}>
        <Link to="/" style={{ textDecoration:"none" }}>
          <span style={{ fontFamily:"var(--ff-t)", fontSize:"1rem" }}>
            <span style={{color:"var(--blanc)"}}>Meta'</span>
            <span style={{color:"var(--or)"}}>Morph'</span>
            <span style={{color:"var(--rose)"}}>Ose</span>
          </span>
        </Link>
        <Link to="/" style={{ fontFamily:"var(--ff-b)", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}>
          Retour
        </Link>
      </nav>

      <main>

        {/* ── HERO ── */}
        <section style={{ padding:"80px 24px 60px", background:"linear-gradient(135deg,#0A0A0A 0%,#1a0f08 50%,#0A0A0A 100%)", textAlign:"center", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
            <div style={{ position:"absolute", top:"20%", left:"10%", width:"300px", height:"300px", borderRadius:"50%", background:"radial-gradient(circle,rgba(201,169,106,.08),transparent 70%)" }}/>
            <div style={{ position:"absolute", bottom:"10%", right:"10%", width:"250px", height:"250px", borderRadius:"50%", background:"radial-gradient(circle,rgba(194,24,91,.06),transparent 70%)" }}/>
          </div>
          <div style={{ position:"relative", maxWidth:"680px", margin:"0 auto" }}>
            <div style={{ fontSize:"3.5rem", marginBottom:"20px", animation:"heartbeat 2s ease-in-out infinite" }}>🤍</div>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"var(--or)", marginBottom:"16px", animation:"fadeUp .7s both" }}>
              Soutenir le programme
            </p>
            <h1 style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(2rem,6vw,3.5rem)", fontWeight:700, lineHeight:1.1, marginBottom:"20px", animation:"fadeUp .8s .1s both" }}>
              <em style={{ fontStyle:"italic", fontWeight:400, background:"linear-gradient(135deg,var(--or),var(--or-light),var(--or))", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmer 4s linear infinite" }}>
                Faire un don
              </em>
              <br/>à Méta'Morph'Ose
            </h1>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:"clamp(.9rem,2.5vw,1.05rem)", color:"rgba(248,245,242,.6)", lineHeight:1.8, marginBottom:"12px", animation:"fadeUp .8s .2s both" }}>
              Chaque don contribue à rendre la transformation accessible à plus de femmes, à financer les ressources gratuites et à soutenir la mission de Méta'Morph'Ose.
            </p>
            <p style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1.1rem", color:"var(--or)", animation:"fadeUp .8s .3s both" }}>
              « Ensemble, nous pouvons illuminer davantage de vies. »
            </p>
          </div>
        </section>

        {/* ── IMPACT ── */}
        <section style={{ padding:"60px 24px", background:"linear-gradient(180deg,#0A0A0A,#110d09)" }}>
          <div style={{ maxWidth:"1000px", margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"40px" }}>
              <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"var(--or)", marginBottom:"10px" }}>L'impact de votre don</p>
              <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.4rem,3.5vw,2rem)", fontWeight:600 }}>
                Votre générosité change des vies
              </h2>
            </div>
            <div className="impact-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px" }}>
              {IMPACTS.map((item, i) => (
                <div key={i} className="impact-card reveal" style={{ transitionDelay:`${i*.1}s` }}>
                  <div style={{ fontSize:"2.2rem", marginBottom:"12px" }}>{item.icone}</div>
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".18em", textTransform:"uppercase", color:"var(--or)", marginBottom:"6px", fontWeight:600 }}>{item.montant}</p>
                  <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1rem", fontWeight:600, marginBottom:"8px" }}>{item.titre}</h3>
                  <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".75rem", color:"rgba(248,245,242,.5)", lineHeight:1.65 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── FORMULAIRE DON ── */}
        <section style={{ padding:"60px 24px 80px", background:"linear-gradient(180deg,#110d09,#18100d)" }}>
          <div style={{ maxWidth:"900px", margin:"0 auto" }}>
            <div className="don-grid" style={{ display:"grid", gridTemplateColumns:"1fr 420px", gap:"60px", alignItems:"start" }}>

              {/* Gauche — Valeurs */}
              <div>
                <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"var(--or)", marginBottom:"14px" }}>Pourquoi donner ?</p>
                <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.4rem,3.5vw,2rem)", fontWeight:600, marginBottom:"24px", lineHeight:1.2 }}>
                  Aidez une femme à trouver sa lumière
                </h2>
                {[
                  { icone:"🌟", titre:"Accès universel", desc:"Votre don permet de rendre les ressources accessibles aux femmes qui n'ont pas les moyens." },
                  { icone:"🎙️", titre:"Contenu gratuit", desc:"Financer les lives, replays et guides offerts gratuitement à la communauté." },
                  { icone:"🤝", titre:"Bourses d'accès", desc:"Offrir une place dans le programme Méta'Morph'Ose à une femme dans le besoin." },
                  { icone:"🌍", titre:"Impact continental", desc:"Soutenir l'expansion du programme en Afrique et dans la diaspora." },
                ].map((item, i) => (
                  <div key={i} className="reveal" style={{ transitionDelay:`${i*.08}s`, display:"flex", gap:"16px", alignItems:"flex-start", padding:"18px 0", borderBottom:"1px solid rgba(255,255,255,.04)" }}>
                    <span style={{ fontSize:"1.4rem", flexShrink:0 }}>{item.icone}</span>
                    <div>
                      <p style={{ fontFamily:"var(--ff-b)", fontWeight:600, fontSize:".85rem", marginBottom:"4px" }}>{item.titre}</p>
                      <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".78rem", color:"rgba(248,245,242,.5)", lineHeight:1.65 }}>{item.desc}</p>
                    </div>
                  </div>
                ))}

                {/* Citation */}
                <div className="reveal" style={{ marginTop:"28px", padding:"24px", background:"rgba(201,169,106,.05)", border:"1px solid rgba(201,169,106,.12)", borderRadius:"4px" }}>
                  <p style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1.05rem", color:"var(--or)", lineHeight:1.7 }}>
                    « Chaque FCFA donné est une graine plantée dans la vie d'une femme. »
                  </p>
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".12em", textTransform:"uppercase", color:"rgba(248,245,242,.3)", marginTop:"10px" }}>— Prélia Apedo</p>
                </div>
              </div>

              {/* Droite — Formulaire */}
              <div style={{ position:"sticky", top:"80px" }}>
                {step === "success" ? (
                  <div style={{ padding:"40px 32px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(201,169,106,.15)", borderRadius:"8px", textAlign:"center", animation:"fadeUp .5s both" }}>
                    <div style={{ fontSize:"3rem", marginBottom:"16px", animation:"heartbeat 1.5s ease-in-out infinite" }}>🤍</div>
                    <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--or)", marginBottom:"10px" }}>Don reçu</p>
                    <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.4rem", fontWeight:600, marginBottom:"12px" }}>
                      Merci {prenom} !
                    </h3>
                    <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.6)", lineHeight:1.8, marginBottom:"8px" }}>
                      Votre don de <strong style={{color:"var(--or)"}}>{montantFinal.toLocaleString("fr-FR")} FCFA</strong> a bien été reçu.
                    </p>
                    <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.5)", lineHeight:1.75, marginBottom:"24px" }}>
                      Un email de confirmation a été envoyé à {email}. Votre générosité illumine des vies.
                    </p>
                    <Link to="/" className="btn-or" style={{ width:"100%", textDecoration:"none" }}>
                      Retour à l'accueil
                    </Link>
                  </div>
                ) : (
                  <div style={{ padding:"36px 28px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(201,169,106,.15)", borderRadius:"8px" }}>
                    <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--or)", marginBottom:"8px" }}>Faire un don</p>
                    <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.2rem", fontWeight:600, marginBottom:"6px" }}>Choisissez votre montant</h3>
                    <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".75rem", color:"rgba(248,245,242,.35)", marginBottom:"20px" }}>100% de votre don va directement au programme</p>

                    {/* Montants suggérés */}
                    <div className="montants-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"8px", marginBottom:"16px" }}>
                      {MONTANTS_SUGGERES.map(m => (
                        <button
                          key={m.val}
                          className={`montant-btn ${(m.val === 0 ? showCustom : montant === m.val && !showCustom) ? "selected" : ""}`}
                          onClick={() => selectionnerMontant(m.val)}
                        >
                          {m.label}
                        </button>
                      ))}
                    </div>

                    {/* Montant custom */}
                    {showCustom && (
                      <div style={{ marginBottom:"16px" }}>
                        <input
                          className="form-input"
                          type="number"
                          placeholder="Entrez votre montant (FCFA)"
                          value={montantCustom}
                          onChange={e => setMontantCustom(e.target.value)}
                          min="100"
                        />
                      </div>
                    )}

                    {/* Montant sélectionné */}
                    {montantFinal > 0 && (
                      <div style={{ padding:"12px 16px", background:"rgba(201,169,106,.08)", border:"1px solid rgba(201,169,106,.2)", borderRadius:"3px", marginBottom:"20px", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
                        <span style={{ fontFamily:"var(--ff-b)", fontSize:".75rem", color:"rgba(248,245,242,.5)" }}>Montant du don</span>
                        <span style={{ fontFamily:"var(--ff-t)", fontSize:"1.2rem", fontWeight:700, color:"var(--or)" }}>{montantFinal.toLocaleString("fr-FR")} FCFA</span>
                      </div>
                    )}

                    {/* Formulaire */}
                    <form onSubmit={lancerDon} style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                      <input className="form-input" placeholder="Votre prénom *" value={prenom} onChange={e=>setPrenom(e.target.value)} required/>
                      <input className="form-input" type="email" placeholder="Votre email *" value={email} onChange={e=>setEmail(e.target.value)} required/>
                      <textarea className="form-input" placeholder="Un message pour Prélia (optionnel)" value={message} onChange={e=>setMessage(e.target.value)} rows={3} style={{ resize:"vertical" }}/>

                      {/* Anonyme */}
                      <label style={{ display:"flex", gap:"10px", alignItems:"center", cursor:"pointer" }}>
                        <input
                          type="checkbox"
                          checked={anonyme}
                          onChange={e=>setAnonyme(e.target.checked)}
                          style={{ accentColor:"var(--or)", width:"16px", height:"16px" }}
                        />
                        <span style={{ fontFamily:"var(--ff-b)", fontSize:".75rem", color:"rgba(248,245,242,.5)", fontWeight:300 }}>
                          Faire un don anonyme
                        </span>
                      </label>

                      <button type="submit" className="btn-or" disabled={loading || montantFinal < 100 || !prenom || !email} style={{ width:"100%", marginTop:"4px" }}>
                        {loading ? (
                          <><div style={{ width:"16px", height:"16px", border:"2px solid rgba(10,10,10,.3)", borderTopColor:"var(--noir)", borderRadius:"50%", animation:"spin .7s linear infinite" }}/> Traitement…</>
                        ) : `Donner ${montantFinal > 0 ? montantFinal.toLocaleString("fr-FR") + " FCFA" : ""}`}
                      </button>
                      <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", color:"rgba(248,245,242,.2)", textAlign:"center", lineHeight:1.6 }}>
                        Paiement sécurisé via KKiaPay · Mobile Money · Carte bancaire
                      </p>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── DONATEURS ── */}
        <section style={{ padding:"60px 24px", background:"linear-gradient(180deg,#18100d,#2e1e14)", textAlign:"center" }}>
          <div style={{ maxWidth:"700px", margin:"0 auto" }}>
            <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"var(--or)", marginBottom:"12px" }}>Communauté</p>
            <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.4rem,3.5vw,2rem)", fontWeight:600, marginBottom:"16px" }}>
              Rejoignez les bienfaiteurs de Méta'Morph'Ose
            </h2>
            <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.5)", lineHeight:1.8, marginBottom:"32px" }}>
              Ensemble, nous construisons un espace où chaque femme peut accéder à sa transformation, peu importe ses moyens.
            </p>
            <div className="reveal" style={{ display:"flex", gap:"40px", justifyContent:"center", flexWrap:"wrap" }}>
              {[
                { val:"100%", label:"Va au programme" },
                { val:"+100", label:"Femmes aidées" },
                { val:"8", label:"Pays touchés" },
              ].map((s,i) => (
                <div key={i} style={{ textAlign:"center" }}>
                  <p style={{ fontFamily:"var(--ff-t)", fontSize:"2rem", fontWeight:700, color:"var(--or)", lineHeight:1 }}>{s.val}</p>
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".14em", textTransform:"uppercase", color:"rgba(248,245,242,.35)", marginTop:"6px" }}>{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer style={{ padding:"32px 24px", background:"var(--noir)", borderTop:"1px solid rgba(201,169,106,.1)", textAlign:"center" }}>
        <Link to="/" style={{ fontFamily:"var(--ff-t)", fontSize:".95rem", textDecoration:"none" }}>
          <span style={{color:"var(--blanc)"}}>Meta'</span>
          <span style={{color:"var(--or)"}}>Morph'</span>
          <span style={{color:"var(--rose)"}}>Ose</span>
        </Link>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".7rem", color:"rgba(248,245,242,.2)", marginTop:"8px" }}>
          © 2026 Meta'Morph'Ose · White & Black · Prélia Apedo
        </p>
      </footer>
    </>
  );
}
