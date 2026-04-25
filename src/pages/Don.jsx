import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { donAPI, configAPI } from "../services/api";

const MONTANTS = [10000, 25000, 42000, 65000, 150000, 350000];

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --noir:#0A0A0A; --or:#C9A96A; --or-light:#E8D5A8;
    --rose:#C2185B; --blanc:#F8F5F2;
    --ff-t:'Playfair Display',Georgia,serif;
    --ff-b:'Montserrat',sans-serif;
    --ff-a:'Cormorant Garamond',Georgia,serif;
  }
  html { scroll-behavior:smooth; }
  body { background:var(--noir); color:var(--blanc); font-family:var(--ff-b); font-weight:300; line-height:1.7; overflow-x:hidden; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  .reveal { opacity:0; transform:translateY(30px); transition:opacity .8s ease,transform .8s ease; }
  .reveal.visible { opacity:1; transform:none; }
  @media(max-width:768px) {
    .form-grid { grid-template-columns:1fr !important; }
    .impact-grid { grid-template-columns:1fr !important; }
  }
  .montant-btn { padding:14px 20px; border:1px solid rgba(201,169,106,.2); border-radius:3px; background:transparent; color:rgba(248,245,242,.7); font-family:'Montserrat',sans-serif; font-size:.82rem; font-weight:500; cursor:pointer; transition:all .25s; text-align:center; }
  .montant-btn:hover { border-color:rgba(201,169,106,.5); color:#C9A96A; background:rgba(201,169,106,.04); }
  .montant-btn.selected { border-color:#C9A96A; color:#C9A96A; background:rgba(201,169,106,.08); }
  .don-input { width:100%; padding:12px 16px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:3px; color:var(--blanc); font-family:'Montserrat',sans-serif; font-size:.88rem; font-weight:300; outline:none; transition:border-color .25s; }
  .don-input:focus { border-color:rgba(201,169,106,.4); }
  .don-label { font-family:'Montserrat',sans-serif; font-size:.62rem; letter-spacing:.16em; text-transform:uppercase; color:rgba(248,245,242,.4); display:block; margin-bottom:6px; }
`;

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
  useReveal();

  const [config, setConfig] = useState({});
  useEffect(() => {
    configAPI.public().then(res => {
      const map = {};
      if (Array.isArray(res.data)) res.data.forEach(i => { map[i.cle] = i.valeur; });
      setConfig(map);
    }).catch(() => {});
  }, []);
  function get(cle, fallback="") { return config[cle] || fallback; }

  const [step, setStep] = useState("form"); // form | payment | done
  const [donLink, setDonLink] = useState("");
  useEffect(() => {
    configAPI.public().then(res => {
      const map = {};
      if (Array.isArray(res.data)) res.data.forEach(i => { map[i.cle] = i.valeur; });
      setDonLink(map["don_lien_paiement"] || "");
    }).catch(() => {});
  }, []);
  const [montantSelectionne, setMontantSelectionne] = useState(65000);
  const [autreMontnant,      setAutreMontant]        = useState("");
  const [form, setForm] = useState({ nom:"", prenom:"", email:"", telephone:"", message:"", anonyme:false });
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");

  const montantFinal = autreMontnant ? parseInt(autreMontnant) : montantSelectionne;

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function soumettre(e) {
    e.preventDefault();
    if (!form.email.trim()) { setError("L'email est requis."); return; }
    if (!montantFinal || montantFinal < 1000) { setError("Veuillez choisir un montant valide."); return; }
    setLoading(true); setError("");
    try {
      await donAPI.soumettre({ ...form, montant: montantFinal });
    } catch {}
    setLoading(false);
    setStep("payment");
  }

  async function confirmerDon() {
    const API_BASE = import.meta.env.VITE_API_URL || "";
    try {
      await fetch(`${API_BASE}/api/auth/confirmer-don/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, montant: montantFinal }),
      });
    } catch {}
    setStep("done");
  }

  const IMPACT = [
    { montant:"10 000 FCFA",  desc:"Contribue au développement des contenus" },
    { montant:"42 000 FCFA",  desc:"Soutient un mois d'hébergement" },
    { montant:"65 000 FCFA",  desc:"Participe à l'accès à une formation" },
    { montant:"150 000 FCFA", desc:"Finance un accompagnement privé" },
    { montant:"350 000 FCFA", desc:"Impact direct sur une transformation complète" },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ background:"#0A0A0A", color:"#F8F5F2", minHeight:"100vh" }}>


        {/* Hero */}
        <section style={{ padding:"100px 24px 72px", textAlign:"center", background:"linear-gradient(180deg,#0A0A0A,#110d09)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 50% at 50% 60%,rgba(201,169,106,.06),transparent)", pointerEvents:"none" }}/>
          <div style={{ position:"relative", maxWidth:"680px", margin:"0 auto" }}>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".3em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"16px", animation:"fadeUp .6s both" }}>
              Faire un don
            </p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,6vw,3.5rem)", fontWeight:700, lineHeight:1.1, marginBottom:"20px", animation:"fadeUp .7s .1s both" }}>
              Soutenez une transformation.<br/>Impactez des vies.
            </h1>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:"1rem", color:"rgba(248,245,242,.55)", lineHeight:1.8, animation:"fadeUp .7s .2s both", marginBottom:"36px" }}>
              Votre contribution permet d'accompagner des femmes à reprendre confiance en elles,
              à améliorer leur image et à transformer leur vie.
            </p>
            <a href="#formulaire" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#C9A96A", color:"#0A0A0A", fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:".75rem", letterSpacing:".16em", textTransform:"uppercase", padding:"16px 36px", borderRadius:"2px", textDecoration:"none", animation:"fadeUp .7s .3s both" }}>
              Soutenir maintenant
            </a>
          </div>
        </section>

        <div style={{ maxWidth:"960px", margin:"0 auto", padding:"0 24px 100px" }}>

          {/* Pourquoi votre soutien */}
          <section style={{ padding:"72px 0 0" }}>
            <div style={{ maxWidth:"680px", margin:"0 auto", textAlign:"center" }}>
              <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"14px" }}>Pourquoi votre soutien est important</p>
              <p className="reveal" style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.2rem", color:"rgba(248,245,242,.75)", lineHeight:1.8 }}>
                Chaque femme mérite de se sentir belle, confiante et légitime. À travers Métamorphose,
                nous accompagnons des femmes à se reconstruire, à se révéler et à prendre leur place
                dans leur vie personnelle et professionnelle. Mais certaines n'ont pas les moyens
                d'accéder à cet accompagnement. Votre don devient alors une opportunité.
                Une porte ouverte. Un nouveau départ.
              </p>
            </div>
          </section>

          {/* Impact */}
          <section style={{ padding:"72px 0 0" }}>
            <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"32px", textAlign:"center" }}>Votre don fait la différence</p>
            <div className="impact-grid reveal" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:"16px" }}>
              {IMPACT.map((item, i) => (
                <div key={i} style={{ padding:"28px 24px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(201,169,106,.1)", borderLeft:"3px solid #C9A96A", borderRadius:"3px" }}>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:600, color:"#C9A96A", marginBottom:"8px" }}>{item.montant}</p>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"rgba(248,245,242,.6)", fontWeight:300, lineHeight:1.6 }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Formulaire */}
          <section id="formulaire" style={{ padding:"72px 0 0" }}>
            <div style={{ background:"rgba(255,255,255,.02)", border:"1px solid rgba(201,169,106,.12)", borderRadius:"6px", padding:"48px 24px" }}>
              <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"8px" }}>Choisissez votre contribution</p>
              <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.4rem,3vw,2rem)", fontWeight:600, marginBottom:"32px" }}>
                Faire un don
              </h2>

              {step === "done" ? (
                <div style={{ textAlign:"center", padding:"48px 24px", animation:"fadeUp .6s both" }}>
                  <div style={{ width:"64px", height:"64px", borderRadius:"50%", background:"rgba(76,175,80,.1)", border:"2px solid #4CAF50", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:"28px" }}>✓</div>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.6rem", fontWeight:600, color:"#C9A96A", marginBottom:"16px" }}>Merci pour votre soutien.</p>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, color:"rgba(248,245,242,.55)", lineHeight:1.8, marginBottom:"16px" }}>
                    Votre don de <strong style={{ color:"#C9A96A" }}>{montantFinal.toLocaleString("fr-FR")} FCFA</strong> a bien été déclaré.
                    Un email de confirmation vous a été envoyé à <strong style={{ color:"#F8F5F2" }}>{form.email}</strong>.
                  </p>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1rem", color:"rgba(248,245,242,.4)" }}>
                    Votre générosité ouvre des portes. Merci de faire partie de cette mission.
                  </p>
                </div>
              ) : step === "payment" ? (
                <div style={{ animation:"fadeUp .5s both" }}>
                  <div style={{ textAlign:"center", marginBottom:"28px" }}>
                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"8px" }}>Étape 2 · Paiement</p>
                    <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", fontWeight:600, color:"#F8F5F2", marginBottom:"8px" }}>Finalisez votre don</h3>
                    <p style={{ color:"rgba(248,245,242,.5)", fontSize:".88rem" }}>
                      Montant : <strong style={{ color:"#C9A96A" }}>{montantFinal.toLocaleString("fr-FR")} FCFA</strong>
                    </p>
                  </div>
                  <div style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"4px", padding:"16px 20px", marginBottom:"20px" }}>
                    <p style={{ fontSize:".72rem", color:"rgba(248,245,242,.4)", marginBottom:"8px", letterSpacing:".1em", textTransform:"uppercase" }}>Récapitulatif</p>
                    <p style={{ color:"#F8F5F2", fontWeight:500 }}>{form.prenom} {form.nom}</p>
                    <p style={{ color:"rgba(248,245,242,.5)", fontSize:".85rem" }}>{form.email}</p>
                    <p style={{ color:"#C9A96A", fontWeight:700, fontSize:"1.1rem", marginTop:"8px" }}>{montantFinal.toLocaleString("fr-FR")} FCFA</p>
                  </div>
                  {donLink ? (
                    <a href={donLink} target="_blank" rel="noreferrer"
                      style={{ display:"flex", alignItems:"center", justifyContent:"center", width:"100%", padding:"16px", background:"linear-gradient(135deg,#C9A96A,#E8D5A8)", color:"#0A0A0A", fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:".78rem", letterSpacing:".16em", textTransform:"uppercase", borderRadius:"3px", textDecoration:"none", marginBottom:"12px" }}>
                      Procéder au paiement · {montantFinal.toLocaleString("fr-FR")} FCFA
                    </a>
                  ) : (
                    <div style={{ padding:"20px", textAlign:"center", background:"rgba(201,169,106,.05)", border:"1px dashed rgba(201,169,106,.2)", borderRadius:"4px", marginBottom:"12px" }}>
                      <p style={{ color:"#C9A96A", fontSize:".85rem", marginBottom:"8px" }}>Lien de paiement bientôt disponible</p>
                      <a href="https://wa.me/message/DI23LCDIMS5SF1" target="_blank" rel="noreferrer" style={{ color:"#25D366", fontSize:".82rem", textDecoration:"none" }}>
                        Contacter Prélia sur WhatsApp
                      </a>
                    </div>
                  )}
                  <button onClick={confirmerDon}
                    style={{ width:"100%", padding:"14px", background:"rgba(76,175,80,.1)", color:"#4CAF50", border:"1px solid rgba(76,175,80,.3)", borderRadius:"3px", fontFamily:"'Montserrat',sans-serif", fontWeight:600, fontSize:".72rem", letterSpacing:".14em", textTransform:"uppercase", cursor:"pointer" }}>
                    J'ai effectué mon don
                  </button>
                </div>
              ) : (
                <form onSubmit={soumettre}>
                  {/* Montants */}
                  <div style={{ marginBottom:"24px" }}>
                    <label className="don-label">Montant (FCFA)</label>
                    <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(120px,1fr))", gap:"10px", marginBottom:"12px" }}>
                      {MONTANTS.map(m => (
                        <button key={m} type="button"
                          className={`montant-btn ${montantSelectionne===m && !autreMontnant ? "selected" : ""}`}
                          onClick={() => { setMontantSelectionne(m); setAutreMontant(""); }}>
                          {m.toLocaleString("fr-FR")}
                        </button>
                      ))}
                    </div>
                    <input
                      className="don-input" type="number" min="1000"
                      placeholder="Autre montant (FCFA)"
                      value={autreMontnant}
                      onChange={e => { setAutreMontant(e.target.value); setMontantSelectionne(0); }}
                    />
                  </div>

                  {/* Infos */}
                  <div className="form-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"14px" }}>
                    <div>
                      <label className="don-label">Nom</label>
                      <input className="don-input" value={form.nom} onChange={e=>set("nom",e.target.value)} placeholder="Votre nom"/>
                    </div>
                    <div>
                      <label className="don-label">Prénom</label>
                      <input className="don-input" value={form.prenom} onChange={e=>set("prenom",e.target.value)} placeholder="Votre prénom"/>
                    </div>
                    <div>
                      <label className="don-label">Email *</label>
                      <input className="don-input" type="email" required value={form.email} onChange={e=>set("email",e.target.value)} placeholder="votre@email.com"/>
                    </div>
                    <div>
                      <label className="don-label">Téléphone</label>
                      <input className="don-input" value={form.telephone} onChange={e=>set("telephone",e.target.value)} placeholder="+229 00 00 00 00"/>
                    </div>
                  </div>

                  <div style={{ marginBottom:"14px" }}>
                    <label className="don-label">Message de soutien (optionnel)</label>
                    <textarea className="don-input" rows={3} value={form.message} onChange={e=>set("message",e.target.value)} placeholder="Un mot d'encouragement..." style={{ resize:"vertical" }}/>
                  </div>

                  <label style={{ display:"flex", alignItems:"center", gap:"10px", cursor:"pointer", marginBottom:"24px" }}>
                    <input type="checkbox" checked={form.anonyme} onChange={e=>set("anonyme",e.target.checked)}
                      style={{ width:"16px", height:"16px", accentColor:"#C9A96A" }}/>
                    <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"rgba(248,245,242,.6)", fontWeight:300 }}>
                      Je souhaite rester anonyme
                    </span>
                  </label>

                  {error && <p style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", borderRadius:"4px", padding:"10px 14px", fontSize:".78rem", color:"#f87171", marginBottom:"16px" }}>{error}</p>}

                  <button type="submit" disabled={loading}
                    style={{ width:"100%", padding:"16px", background:"#C9A96A", border:"none", borderRadius:"3px", color:"#0A0A0A", fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:".78rem", letterSpacing:".16em", textTransform:"uppercase", cursor:loading?"not-allowed":"pointer", opacity:loading?.7:1 }}>
                    {loading ? "Traitement en cours..." : `Je soutiens cette transformation — ${montantFinal.toLocaleString("fr-FR")} FCFA`}
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* Preuve sociale */}
          <section style={{ padding:"72px 0 0", textAlign:"center" }}>
            <div className="reveal" style={{ padding:"48px 32px", background:"rgba(201,169,106,.04)", border:"1px solid rgba(201,169,106,.12)", borderRadius:"6px" }}>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.3rem", color:"rgba(248,245,242,.7)", lineHeight:1.8, marginBottom:"32px" }}>
                Déjà de nombreuses femmes accompagnées dans leur transformation personnelle
                et leur confiance en elles.
              </p>
              <div style={{ height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.3),transparent)", marginBottom:"32px" }}/>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.1rem", color:"rgba(248,245,242,.5)", lineHeight:1.8, marginBottom:"28px" }}>
                Votre don n'est pas simplement un montant. C'est un acte de soutien.
                Un acte d'amour. Un acte de transformation.
                Merci de faire partie de cette mission.
              </p>
              <a href="#formulaire" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#C9A96A", color:"#0A0A0A", fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:".75rem", letterSpacing:".16em", textTransform:"uppercase", padding:"15px 32px", borderRadius:"2px", textDecoration:"none" }}>
                Soutenir une transformation maintenant
              </a>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
