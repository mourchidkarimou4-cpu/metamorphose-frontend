import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import API_URL from "../config";

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
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  .reveal { opacity:0; transform:translateY(30px); transition:opacity .8s ease,transform .8s ease; }
  .reveal.visible { opacity:1; transform:none; }
  .mc-input { width:100%; padding:12px 16px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:2px; color:#F8F5F2; font-family:'Montserrat',sans-serif; font-size:.88rem; font-weight:300; outline:none; transition:border-color .25s; }
  .mc-input:focus { border-color:rgba(201,169,106,.4); }
  .mc-label { font-family:'Montserrat',sans-serif; font-size:.6rem; letter-spacing:.18em; text-transform:uppercase; color:rgba(248,245,242,.35); display:block; margin-bottom:6px; }
  .mc-card { background:rgba(255,255,255,.02); border:1px solid rgba(255,255,255,.07); border-radius:4px; overflow:hidden; transition:border-color .3s,transform .3s; }
  .mc-card:hover { border-color:rgba(201,169,106,.2); transform:translateY(-3px); }
  .btn-primary { display:inline-flex; align-items:center; justify-content:center; padding:14px 32px; background:#C2185B; border:none; border-radius:2px; color:#fff; font-family:'Montserrat',sans-serif; font-weight:700; font-size:.72rem; letter-spacing:.16em; text-transform:uppercase; cursor:pointer; transition:all .3s; text-decoration:none; }
  .btn-primary:hover { background:#a01049; transform:translateY(-2px); }
  .btn-primary:disabled { opacity:.6; cursor:not-allowed; transform:none; }
  .btn-or { display:inline-flex; align-items:center; justify-content:center; padding:13px 28px; background:#C9A96A; border:none; border-radius:2px; color:#0A0A0A; font-family:'Montserrat',sans-serif; font-weight:700; font-size:.72rem; letter-spacing:.16em; text-transform:uppercase; cursor:pointer; transition:all .3s; }
  .btn-or:hover { background:#E8D5A8; transform:translateY(-2px); }
  .overlay { position:fixed; inset:0; background:rgba(0,0,0,.85); z-index:500; display:flex; align-items:center; justify-content:center; padding:24px; animation:fadeIn .3s both; backdrop-filter:blur(8px); }
  .modal { background:#111; border:1px solid rgba(201,169,106,.2); border-radius:4px; max-width:500px; width:100%; padding:40px 36px; animation:fadeUp .4s both; position:relative; }
  .modal::before { content:''; position:absolute; top:0; left:0; right:0; height:1px; background:linear-gradient(90deg,transparent,#C9A96A,transparent); }
  @media(max-width:768px) { .mc-grid { grid-template-columns:1fr !important; } .form-2col { grid-template-columns:1fr !important; } .modal { padding:28px 20px; } }
`;

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

const MC_DEFAUT = [
  {
    id: 1,
    titre: "Masterclass OSER",
    description: "Cette masterclass est conçue pour t'aider à sortir du regard des autres, reprendre confiance en toi et commencer à incarner une image alignée avec ta vraie valeur. Tu vas apprendre à dépasser la peur du jugement, t'affirmer avec plus de confiance et améliorer ton image personnelle et professionnelle.",
    date: "Dimanche 26 avril à 17h00",
    image: "",
    places_max: 500,
    places_restantes: 40,
    complet: false,
    gratuite: true,
    lien_live: "",
  },
];

function ModalReservation({ mc, onClose }) {
  const [form,    setForm]    = useState({ prenom:"", nom:"", email:"", telephone:"" });
  const [loading, setLoading] = useState(false);
  const [done,    setDone]    = useState(false);
  const [error,   setError]   = useState("");

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function reserver(e) {
    e.preventDefault();
    if (!form.email.trim() || !form.prenom.trim()) { setError("Prénom et email requis."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`${API_URL}/api/masterclass/${mc.id}/reserver/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) setDone(true);
      else setError(data.detail || "Une erreur est survenue.");
    } catch { setError("Erreur réseau. Veuillez réessayer."); }
    setLoading(false);
  }

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="modal">
        {done ? (
          <div style={{ textAlign:"center", padding:"16px 0" }}>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.4rem", fontWeight:600, color:"#C9A96A", marginBottom:"12px" }}>
              Inscription confirmée.
            </p>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.55)", lineHeight:1.8, marginBottom:"28px" }}>
              Votre place est réservée pour la masterclass<br/>
              <strong style={{color:"rgba(248,245,242,.8)"}}>{mc.titre}</strong><br/>
              le {mc.date}.
            </p>
            <button className="btn-or" onClick={onClose}>Fermer</button>
          </div>
        ) : (
          <>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".58rem", letterSpacing:".28em", textTransform:"uppercase", color:"rgba(201,169,106,.45)", marginBottom:"8px" }}>
              Réservation
            </p>
            <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.2rem,3vw,1.6rem)", fontWeight:600, marginBottom:"6px", lineHeight:1.2 }}>
              {mc.titre}
            </h2>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".75rem", color:"rgba(248,245,242,.4)", marginBottom:"28px" }}>
              {mc.date} {mc.gratuite && "· Gratuit"}
              {mc.places_restantes <= 20 && (
                <span style={{ color:"#C2185B", marginLeft:"8px" }}>
                  · Plus que {mc.places_restantes} place{mc.places_restantes > 1 ? "s" : ""}
                </span>
              )}
            </p>

            <form onSubmit={reserver}>
              <div className="form-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px", marginBottom:"12px" }}>
                <div>
                  <label className="mc-label">Prénom *</label>
                  <input className="mc-input" value={form.prenom} onChange={e=>set("prenom",e.target.value)} placeholder="Votre prénom"/>
                </div>
                <div>
                  <label className="mc-label">Nom</label>
                  <input className="mc-input" value={form.nom} onChange={e=>set("nom",e.target.value)} placeholder="Votre nom"/>
                </div>
              </div>
              <div style={{ marginBottom:"12px" }}>
                <label className="mc-label">Email *</label>
                <input className="mc-input" type="email" required value={form.email} onChange={e=>set("email",e.target.value)} placeholder="votre@email.com"/>
              </div>
              <div style={{ marginBottom:"20px" }}>
                <label className="mc-label">WhatsApp</label>
                <input className="mc-input" value={form.telephone} onChange={e=>set("telephone",e.target.value)} placeholder="+229 00 00 00 00"/>
              </div>

              {error && (
                <p style={{ background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", borderRadius:"2px", padding:"10px 14px", fontSize:".75rem", color:"#f87171", marginBottom:"16px" }}>
                  {error}
                </p>
              )}

              <button type="submit" className="btn-primary" disabled={loading} style={{ width:"100%" }}>
                {loading ? "Inscription en cours..." : "Réserver ma place"}
              </button>
            </form>

            <button onClick={onClose} style={{ display:"block", width:"100%", marginTop:"12px", padding:"10px", background:"none", border:"none", color:"rgba(248,245,242,.2)", fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", letterSpacing:".1em", textTransform:"uppercase", cursor:"pointer" }}>
              Annuler
            </button>
          </>
        )}
      </div>
    </div>
  );
}

export default function Masterclass() {
  useReveal();
  const [masterclasses, setMasterclasses] = useState(MC_DEFAUT);
  const [selected,      setSelected]      = useState(null);

  useEffect(() => {
    fetch(`${API_URL}/api/masterclass/`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (Array.isArray(d) && d.length > 0) setMasterclasses(d); })
      .catch(() => {});
  }, []);

  return (
    <>
      <style>{STYLES}</style>
      {selected && <ModalReservation mc={selected} onClose={() => setSelected(null)}/>}

      <div style={{ background:"#0A0A0A", color:"#F8F5F2", minHeight:"100vh" }}>

        {/* Nav */}
        <nav style={{ padding:"18px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"rgba(10,10,10,.95)", backdropFilter:"blur(20px)", zIndex:100 }}>
          <Link to="/" style={{ textDecoration:"none" }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem" }}>
              <span style={{color:"#F8F5F2"}}>Meta'</span>
              <span style={{color:"#C9A96A"}}>Morph'</span>
              <span style={{color:"#C2185B"}}>Ose</span>
            </span>
          </Link>
          <div style={{ display:"flex", gap:"16px" }}>
            <Link to="/" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}>Accueil</Link>
            <Link to="/contact" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", background:"#C2185B", color:"#fff", textDecoration:"none", padding:"9px 18px", borderRadius:"2px" }}>S'inscrire</Link>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ padding:"100px 24px 72px", textAlign:"center", background:"linear-gradient(180deg,#0A0A0A,#110d09)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 50% at 50% 60%,rgba(194,24,91,.07),transparent)", pointerEvents:"none" }}/>
          <div style={{ position:"relative", maxWidth:"680px", margin:"0 auto" }}>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".3em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"16px", animation:"fadeUp .6s both" }}>
              Masterclasses
            </p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,6vw,3.5rem)", fontWeight:700, lineHeight:1.1, marginBottom:"20px", animation:"fadeUp .7s .1s both" }}>
              Événements à venir
            </h1>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:"1rem", color:"rgba(248,245,242,.55)", lineHeight:1.8, animation:"fadeUp .7s .2s both" }}>
              Des sessions puissantes animées par Prélia Apedo Ahonon pour t'aider
              à te transformer, t'affirmer et incarner la femme que tu veux devenir.
            </p>
          </div>
        </section>

        <div style={{ maxWidth:"960px", margin:"0 auto", padding:"0 24px 100px" }}>

          {masterclasses.length === 0 ? (
            <div style={{ textAlign:"center", padding:"80px 0" }}>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.2rem", color:"rgba(248,245,242,.3)" }}>
                Aucune masterclass programmée pour le moment.
              </p>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".78rem", color:"rgba(248,245,242,.2)", marginTop:"8px" }}>
                Revenez bientôt ou inscrivez-vous à la newsletter pour être informée en priorité.
              </p>
            </div>
          ) : (
            <div className="mc-grid reveal" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:"24px", paddingTop:"64px" }}>
              {masterclasses.map((mc, i) => (
                <div key={mc.id} className="mc-card" style={{ transitionDelay:`${i*.1}s` }}>
                  {/* Image */}
                  {mc.image ? (
                    <div style={{ height:"200px", overflow:"hidden" }}>
                      <img src={mc.image} alt={mc.titre} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                    </div>
                  ) : (
                    <div style={{ height:"8px", background:"linear-gradient(90deg,#C2185B,rgba(194,24,91,.2))" }}/>
                  )}

                  <div style={{ padding:"28px 24px" }}>
                    {/* Badges */}
                    <div style={{ display:"flex", gap:"8px", flexWrap:"wrap", marginBottom:"14px" }}>
                      {mc.gratuite && (
                        <span style={{ padding:"3px 10px", background:"rgba(76,175,80,.1)", border:"1px solid rgba(76,175,80,.3)", borderRadius:"100px", fontFamily:"'Montserrat',sans-serif", fontSize:".58rem", fontWeight:600, letterSpacing:".14em", textTransform:"uppercase", color:"#4CAF50" }}>
                          Gratuit
                        </span>
                      )}
                      {mc.complet ? (
                        <span style={{ padding:"3px 10px", background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", borderRadius:"100px", fontFamily:"'Montserrat',sans-serif", fontSize:".58rem", fontWeight:600, letterSpacing:".14em", textTransform:"uppercase", color:"#f87171" }}>
                          Complet
                        </span>
                      ) : mc.places_restantes <= 20 ? (
                        <span style={{ padding:"3px 10px", background:"rgba(255,152,0,.1)", border:"1px solid rgba(255,152,0,.3)", borderRadius:"100px", fontFamily:"'Montserrat',sans-serif", fontSize:".58rem", fontWeight:600, letterSpacing:".14em", textTransform:"uppercase", color:"#FF9800" }}>
                          {mc.places_restantes} places
                        </span>
                      ) : null}
                    </div>

                    <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", fontWeight:600, lineHeight:1.2, marginBottom:"10px" }}>
                      {mc.titre}
                    </h2>

                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".72rem", color:"#C9A96A", fontWeight:500, marginBottom:"14px", letterSpacing:".04em" }}>
                      {mc.date}
                    </p>

                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".84rem", color:"rgba(248,245,242,.5)", lineHeight:1.75, marginBottom:"24px" }}>
                      {mc.description.length > 180 ? mc.description.substring(0, 180) + "..." : mc.description}
                    </p>

                    {mc.complet ? (
                      <button disabled className="btn-primary" style={{ width:"100%", opacity:.5, cursor:"not-allowed" }}>
                        Masterclass complète
                      </button>
                    ) : (
                      <button className="btn-primary" onClick={() => setSelected(mc)} style={{ width:"100%" }}>
                        Réserver ma place
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* CTA Newsletter */}
          <section style={{ marginTop:"80px", textAlign:"center" }}>
            <div className="reveal" style={{ padding:"48px 32px", background:"rgba(255,255,255,.02)", border:"1px solid rgba(201,169,106,.12)", borderRadius:"4px" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"12px" }}>
                Ne manquez aucune masterclass
              </p>
              <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.4rem", fontWeight:600, marginBottom:"12px" }}>
                Soyez informée en priorité
              </h3>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.45)", marginBottom:"28px" }}>
                Inscrivez-vous pour recevoir les prochaines dates directement dans votre boîte mail.
              </p>
              <Link to="/contact" className="btn-or">
                Recevoir les prochaines dates
              </Link>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
