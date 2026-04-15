import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { communauteAPI } from "../services/api";
import api from '../services/api';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --noir:#0A0A0A; --or:#C9A96A; --or-light:#E8D5A8;
    --rose:#C2185B; --blanc:#F8F5F2; --marine:#0D1B2A;
    --surface:#111111; --border:rgba(255,255,255,.07);
    --ff-t:'Playfair Display',Georgia,serif;
    --ff-b:'Montserrat',sans-serif;
    --ff-a:'Cormorant Garamond',Georgia,serif;
  }
  html { scroll-behavior:smooth; }
  body { background:var(--noir); color:var(--blanc); font-family:var(--ff-b); font-weight:300; line-height:1.7; overflow-x:hidden; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes fadeIn { from{opacity:0} to{opacity:1} }
  @keyframes shimmerGold { 0%{background-position:-200% center} 100%{background-position:200% center} }
  .c-input { width:100%; padding:12px 16px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:2px; color:#F8F5F2; font-family:'Montserrat',sans-serif; font-size:.88rem; font-weight:300; outline:none; transition:border-color .25s; }
  .c-input:focus { border-color:rgba(201,169,106,.4); }
  .pub-card { background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.06); border-radius:4px; padding:24px; margin-bottom:14px; transition:border-color .3s; }
  .pub-card:hover { border-color:rgba(201,169,106,.15); }
  .pub-card.epingle { border-color:rgba(201,169,106,.25); border-left:3px solid #C9A96A; }
  .pub-card.pour-coach { border-color:rgba(194,24,91,.2); border-left:3px solid #C2185B; }
  .btn-primary { padding:12px 28px; background:#C9A96A; border:none; border-radius:2px; color:#0A0A0A; font-family:'Montserrat',sans-serif; font-weight:700; font-size:.72rem; letter-spacing:.14em; text-transform:uppercase; cursor:pointer; transition:all .25s; }
  .btn-primary:hover { background:#E8D5A8; }
  .btn-primary:disabled { opacity:.6; cursor:not-allowed; }
  .btn-ghost { padding:10px 20px; background:transparent; border:1px solid rgba(201,169,106,.25); border-radius:2px; color:#C9A96A; font-family:'Montserrat',sans-serif; font-weight:500; font-size:.7rem; letter-spacing:.12em; text-transform:uppercase; cursor:pointer; transition:all .25s; }
  .btn-ghost:hover { border-color:#C9A96A; background:rgba(201,169,106,.05); }
  .tag-coach { display:inline-block; padding:2px 10px; background:rgba(194,24,91,.1); border:1px solid rgba(194,24,91,.25); border-radius:2px; font-family:'Montserrat',sans-serif; font-size:.58rem; letter-spacing:.14em; text-transform:uppercase; color:#C2185B; }
  .tag-epingle { display:inline-block; padding:2px 10px; background:rgba(201,169,106,.1); border:1px solid rgba(201,169,106,.25); border-radius:2px; font-family:'Montserrat',sans-serif; font-size:.58rem; letter-spacing:.14em; text-transform:uppercase; color:#C9A96A; }
  .com-item { padding:12px 16px; background:rgba(255,255,255,.02); border-left:2px solid rgba(255,255,255,.06); margin-bottom:8px; }
  .com-item.coach { border-left-color:#C9A96A; background:rgba(201,169,106,.04); }
  .overlay { position:fixed; inset:0; background:rgba(0,0,0,.85); z-index:500; display:flex; align-items:center; justify-content:center; padding:24px; animation:fadeIn .3s both; }
  .modal { background:#111; border:1px solid rgba(201,169,106,.2); border-radius:4px; max-width:600px; width:100%; max-height:90vh; overflow-y:auto; padding:48px 40px; animation:fadeUp .4s both; }
  @media(max-width:768px) { .modal { padding:32px 24px; } .feed-layout { grid-template-columns:1fr !important; } }
`;

const TEXTE_ONBOARDING = `Bienvenue dans la communauté des Métamorphosées.

Nous sommes heureuses de t'accueillir dans ce cercle privé, réservé aux femmes qui ont décidé de se choisir, de s'élever et de devenir une version plus confiante, plus affirmée et plus impactante d'elles-mêmes.

Ton entrée ici marque une étape importante. Celle où tu ne fais plus ce chemin seule.

Ici, tu trouveras du soutien, des échanges enrichissants, de l'inspiration et une énergie collective qui te pousse à avancer.

Pour bien commencer, présente-toi en quelques mots : ton nom, prénom, âge, date d'anniversaire, secteur d'activité, pays de résidence, situation matrimoniale avec ou sans enfant, ta passion, ce que Métamorphose t'a apporté, et ce que tu attends de cette communauté.

Prends le temps de lire le règlement. Et surtout, n'hésite pas à interagir.

Plus tu participes, plus tu évolues.

Nous sommes ravies de te compter parmi nous. Et nous avons hâte de te voir briller.

Bienvenue dans ton nouveau cercle.`;

// ── PORTAIL ──────────────────────────────────────────────────────
function Portail({ onAcces }) {
  const [cle,     setCle]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");
  const token = localStorage.getItem("mmorphose_token");

  async function valider(e) {
    e.preventDefault();
    if (!cle.trim()) { setError("Veuillez saisir votre clé d'accès."); return; }
    setLoading(true); setError("");
    try {
      const res = await fetch(`/api/communaute/valider-cle/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ cle: cle.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.acces) {
        onAcces(data.premiere_connexion);
      } else {
        setError(data.detail || "Clé invalide.");
      }
    } catch { setError("Erreur réseau. Veuillez réessayer."); }
    setLoading(false);
  }

  return (
    <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:"linear-gradient(135deg,#0A0A0A 0%,#0D1020 100%)", padding:"24px", position:"relative", overflow:"hidden" }}>
      <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 50% at 50% 50%,rgba(201,169,106,.05),transparent)", pointerEvents:"none" }}/>
      <div style={{ maxWidth:"440px", width:"100%", position:"relative", animation:"fadeUp .6s both" }}>
        <div style={{ textAlign:"center", marginBottom:"48px" }}>
          <Link to="/" style={{ textDecoration:"none" }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem" }}>
              <span style={{color:"#F8F5F2"}}>Meta'</span>
              <span style={{color:"#C9A96A"}}>Morph'</span>
              <span style={{color:"#C2185B"}}>Ose</span>
            </span>
          </Link>
          <div style={{ width:"30px", height:"1px", background:"rgba(201,169,106,.3)", margin:"20px auto 24px" }}/>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".58rem", letterSpacing:".35em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", marginBottom:"12px" }}>
            Cercle privé
          </p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.6rem,4vw,2.2rem)", fontWeight:400, lineHeight:1.15, color:"#F8F5F2" }}>
            Communauté<br/>
            <em style={{ fontStyle:"italic", fontWeight:300, color:"#C9A96A" }}>des Métamorphosées</em>
          </h1>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.4)", marginTop:"14px", lineHeight:1.7 }}>
            Cet espace est réservé aux femmes ayant terminé le programme Métamorphose.
            Saisissez votre clé d'accès personnelle pour entrer.
          </p>
        </div>

        <form onSubmit={valider} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
          <div>
            <label style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(248,245,242,.35)", display:"block", marginBottom:"8px" }}>
              Clé d'accès personnelle
            </label>
            <input
              className="c-input"
              value={cle}
              onChange={e => setCle(e.target.value)}
              placeholder="Votre clé unique"
              autoComplete="off"
              style={{ letterSpacing:".08em", fontSize:".9rem" }}
            />
          </div>

          {error && (
            <p style={{ background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", borderRadius:"2px", padding:"10px 14px", fontFamily:"'Montserrat',sans-serif", fontSize:".75rem", color:"#f87171" }}>
              {error}
            </p>
          )}

          <button type="submit" className="btn-primary" disabled={loading} style={{ width:"100%", padding:"15px", marginTop:"4px" }}>
            {loading ? "Vérification..." : "Accéder à la communauté"}
          </button>
        </form>

        <p style={{ textAlign:"center", fontFamily:"'Montserrat',sans-serif", fontSize:".7rem", color:"rgba(248,245,242,.2)", marginTop:"28px", lineHeight:1.7 }}>
          Votre clé vous a été transmise par Prélia Apedo Ahonon à la fin de votre programme.
        </p>
      </div>
    </div>
  );
}

// ── MODAL ONBOARDING ─────────────────────────────────────────────
function ModalOnboarding({ onClose }) {
  const token = localStorage.getItem("mmorphose_token");

  async function confirmer() {
    try {
      await fetch(`/api/communaute/profil/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ onboarding_fait: true }),
      });
    } catch {}
    onClose();
  }

  return (
    <div className="overlay" onClick={e => { if (e.target === e.currentTarget) confirmer(); }}>
      <div className="modal">
        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".58rem", letterSpacing:".3em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", marginBottom:"8px" }}>
          Message d'intégration — Communauté Métamorphosées
        </p>
        <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.3rem,3vw,1.8rem)", fontWeight:400, lineHeight:1.2, marginBottom:"32px", color:"#F8F5F2" }}>
          Bienvenue dans la communauté<br/>
          <em style={{ fontStyle:"italic", fontWeight:300, color:"#C9A96A" }}>des Métamorphosées.</em>
        </h2>

        <div style={{ borderTop:"1px solid rgba(201,169,106,.15)", paddingTop:"24px" }}>
          {TEXTE_ONBOARDING.split('\n\n').map((para, i) => (
            <p key={i} style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.65)", lineHeight:1.85, marginBottom:"16px" }}>
              {para}
            </p>
          ))}
        </div>

        <div style={{ borderTop:"1px solid rgba(201,169,106,.15)", paddingTop:"28px", marginTop:"8px" }}>
          <button className="btn-primary" onClick={confirmer} style={{ width:"100%" }}>
            Je prends ma place dans ce cercle
          </button>
        </div>
      </div>
    </div>
  );
}

// ── FEED ─────────────────────────────────────────────────────────
function Feed() {
  const token    = localStorage.getItem("mmorphose_token");
  const user     = JSON.parse(localStorage.getItem("mmorphose_user") || "null");
  const isCoach  = user?.is_staff || user?.is_superuser;

  const [pubs,       setPubs]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [filtre,     setFiltre]     = useState("tout"); // tout | pour_coach
  const [contenu,    setContenu]    = useState("");
  const [pourCoach,  setPourCoach]  = useState(false);
  const [mediaFile,  setMediaFile]  = useState(null);
  const [posting,    setPosting]    = useState(false);
  const [openComs,   setOpenComs]   = useState({});
  const [coms,       setComs]       = useState({});
  const [comInput,   setComInput]   = useState({});

  function chargerPubs() {
    setLoading(true);
    const url = filtre === "pour_coach"
      ? `/api/communaute/publications/?pour_coach=1`
      : `/api/communaute/publications/`;
    communauteAPI.publications().then(r => { setPubs(Array.isArray(r.data) ? r.data : []); setLoading(false); }).catch(() => setLoading(false));
  }

  useEffect(() => { chargerPubs(); }, [filtre]);

  async function publier(e) {
    e.preventDefault();
    if (!contenu.trim()) return;
    setPosting(true);
    const fd = new FormData();
    fd.append("contenu", contenu);
    fd.append("pour_coach", pourCoach);
    if (mediaFile) {
      fd.append("media", mediaFile);
      fd.append("type_media", mediaFile.type.startsWith("video") ? "video" : "photo");
    }
    try {
      const res = await fetch(`/api/communaute/publications/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        setContenu(""); setPourCoach(false); setMediaFile(null);
        chargerPubs();
      }
    } catch {}
    setPosting(false);
  }

  async function chargerComs(pubId) {
    const res = await fetch(`/api/communaute/publications/${pubId}/commentaires/`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await res.json();
    setComs(p => ({ ...p, [pubId]: Array.isArray(data) ? data : [] }));
  }

  function toggleComs(pubId) {
    if (!openComs[pubId]) chargerComs(pubId);
    setOpenComs(p => ({ ...p, [pubId]: !p[pubId] }));
  }

  async function commenter(pubId) {
    const txt = comInput[pubId]?.trim();
    if (!txt) return;
    await fetch(`/api/communaute/publications/${pubId}/commentaires/`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ contenu: txt }),
    });
    setComInput(p => ({ ...p, [pubId]: "" }));
    chargerComs(pubId);
  }

  async function supprimerPub(id) {
    if (!confirm("Supprimer cette publication ?")) return;
    await fetch(`/api/communaute/publications/${id}/supprimer/`, {
      method: "DELETE", headers: { "Authorization": `Bearer ${token}` }
    });
    chargerPubs();
  }

  async function epinglerPub(id) {
    await fetch(`/api/communaute/publications/${id}/epingler/`, {
      method: "PATCH", headers: { "Authorization": `Bearer ${token}` }
    });
    chargerPubs();
  }

  return (
    <div style={{ maxWidth:"720px", margin:"0 auto", padding:"0 24px 80px" }}>

      {/* Composer */}
      <div style={{ background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"4px", padding:"24px", marginBottom:"24px" }}>
        <form onSubmit={publier}>
          <textarea
            className="c-input"
            rows={3}
            value={contenu}
            onChange={e => setContenu(e.target.value)}
            placeholder="Partager quelque chose avec la communauté..."
            style={{ resize:"vertical", marginBottom:"12px" }}
          />
          <div style={{ display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap" }}>
            <label style={{ display:"inline-flex", alignItems:"center", gap:"8px", cursor:"pointer" }}>
              <input type="checkbox" checked={pourCoach} onChange={e => setPourCoach(e.target.checked)} style={{ accentColor:"#C2185B" }}/>
              <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".7rem", color:"rgba(248,245,242,.5)", letterSpacing:".05em" }}>
                Soumettre à Coach Ahonon
              </span>
            </label>
            <label style={{ display:"inline-flex", alignItems:"center", gap:"6px", cursor:"pointer", padding:"6px 12px", border:"1px solid rgba(255,255,255,.08)", borderRadius:"2px", fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", color:"rgba(248,245,242,.45)", letterSpacing:".08em" }}>
              {mediaFile ? mediaFile.name.substring(0, 20) + "..." : "Ajouter un média"}
              <input type="file" accept="image/*,video/*" style={{ display:"none" }} onChange={e => setMediaFile(e.target.files[0])}/>
            </label>
            <div style={{ flex:1 }}/>
            <button type="submit" className="btn-primary" disabled={posting || !contenu.trim()} style={{ padding:"10px 24px" }}>
              {posting ? "Publication..." : "Publier"}
            </button>
          </div>
        </form>
      </div>

      {/* Filtres */}
      <div style={{ display:"flex", gap:"8px", marginBottom:"24px" }}>
        {[["tout","Toutes les publications"],["pour_coach","Pour Coach Ahonon"]].map(([val, label]) => (
          <button key={val} onClick={() => setFiltre(val)}
            style={{ padding:"8px 16px", background:filtre===val?"rgba(201,169,106,.1)":"transparent", border:`1px solid ${filtre===val?"rgba(201,169,106,.4)":"rgba(255,255,255,.08)"}`, borderRadius:"2px", color:filtre===val?"#C9A96A":"rgba(248,245,242,.45)", fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", letterSpacing:".1em", textTransform:"uppercase", cursor:"pointer" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Publications */}
      {loading ? (
        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".78rem", color:"rgba(248,245,242,.3)", textAlign:"center", padding:"48px 0" }}>Chargement...</p>
      ) : pubs.length === 0 ? (
        <div style={{ textAlign:"center", padding:"64px 0" }}>
          <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.1rem", color:"rgba(248,245,242,.25)" }}>Soyez la première à partager quelque chose.</p>
        </div>
      ) : pubs.map(pub => (
        <div key={pub.id} className={`pub-card ${pub.epingle?"epingle":""} ${pub.pour_coach?"pour-coach":""}`}>
          {/* Header */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"14px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
              <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"rgba(201,169,106,.15)", border:"1px solid rgba(201,169,106,.25)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Playfair Display',serif", fontSize:".9rem", color:"#C9A96A", fontWeight:600, flexShrink:0 }}>
                {(pub.auteure||"?")[0].toUpperCase()}
              </div>
              <div>
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".78rem", fontWeight:600, color:"rgba(248,245,242,.85)" }}>{pub.auteure}</p>
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".65rem", color:"rgba(248,245,242,.3)", fontWeight:300 }}>{pub.created_at}</p>
              </div>
            </div>
            <div style={{ display:"flex", gap:"6px", alignItems:"center" }}>
              {pub.epingle && <span className="tag-epingle">Épinglé</span>}
              {pub.pour_coach && <span className="tag-coach">Pour la Coach</span>}
            </div>
          </div>

          {/* Contenu */}
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.7)", lineHeight:1.8, marginBottom:"14px", whiteSpace:"pre-wrap" }}>
            {pub.contenu}
          </p>

          {/* Média */}
          {pub.media && (
            pub.type_media === "video" ? (
              <video controls src={pub.media} style={{ width:"100%", borderRadius:"3px", marginBottom:"14px", maxHeight:"320px" }}/>
            ) : (
              <img src={pub.media} alt="Publication" style={{ width:"100%", borderRadius:"3px", marginBottom:"14px", maxHeight:"400px", objectFit:"cover" }}/>
            )
          )}

          {/* Actions */}
          <div style={{ display:"flex", gap:"12px", alignItems:"center", borderTop:"1px solid rgba(255,255,255,.05)", paddingTop:"12px" }}>
            <button className="btn-ghost" onClick={() => toggleComs(pub.id)} style={{ padding:"7px 14px", fontSize:".65rem" }}>
              {pub.nb_commentaires} commentaire{pub.nb_commentaires !== 1 ? "s" : ""}
            </button>
            <div style={{ flex:1 }}/>
            {(pub.est_moi || isCoach) && (
              <>
                {isCoach && (
                  <button onClick={() => epinglerPub(pub.id)} style={{ background:"none", border:"none", color:"rgba(201,169,106,.5)", fontFamily:"'Montserrat',sans-serif", fontSize:".65rem", cursor:"pointer", letterSpacing:".08em" }}>
                    {pub.epingle ? "Désépingler" : "Épingler"}
                  </button>
                )}
                <button onClick={() => supprimerPub(pub.id)} style={{ background:"none", border:"none", color:"rgba(248,245,242,.25)", fontFamily:"'Montserrat',sans-serif", fontSize:".65rem", cursor:"pointer", letterSpacing:".08em" }}>
                  Supprimer
                </button>
              </>
            )}
          </div>

          {/* Commentaires */}
          {openComs[pub.id] && (
            <div style={{ marginTop:"14px", paddingTop:"14px", borderTop:"1px solid rgba(255,255,255,.05)" }}>
              {(coms[pub.id] || []).map((c, i) => (
                <div key={i} className={`com-item ${c.est_coach ? "coach" : ""}`}>
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"4px" }}>
                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", fontWeight:600, color: c.est_coach ? "#C9A96A" : "rgba(248,245,242,.6)" }}>
                      {c.est_coach ? "Coach Ahonon" : c.auteure}
                    </p>
                    <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", color:"rgba(248,245,242,.25)" }}>{c.created_at}</p>
                  </div>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.6)", lineHeight:1.6 }}>{c.contenu}</p>
                </div>
              ))}
              <div style={{ display:"flex", gap:"8px", marginTop:"10px" }}>
                <input className="c-input" value={comInput[pub.id]||""} onChange={e=>setComInput(p=>({...p,[pub.id]:e.target.value}))}
                  placeholder="Votre commentaire..." style={{ flex:1 }}
                  onKeyDown={e=>{ if(e.key==="Enter"&&!e.shiftKey){ e.preventDefault(); commenter(pub.id); }}}/>
                <button className="btn-primary" onClick={()=>commenter(pub.id)} style={{ padding:"10px 16px", flexShrink:0 }}>Envoyer</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

// ── COMPOSANT PRINCIPAL ───────────────────────────────────────────
export default function CommunautePortail() {
  const navigate = useNavigate();
  const token = localStorage.getItem("mmorphose_token");

  const [phase,    setPhase]    = useState("check"); // check | portail | onboarding | feed
  const [loading,  setLoading]  = useState(true);

  useEffect(() => {
    if (!token) { navigate("/espace-membre"); return; }
    communauteAPI.verifierCle
      .then(d => {
        if (d.acces) setPhase(d.premiere_connexion ? "onboarding" : "feed");
        else setPhase("portail");
        setLoading(false);
      })
      .catch(() => { setPhase("portail"); setLoading(false); });
  }, []);

  if (loading) return (
    <div style={{ minHeight:"100vh", background:"#0A0A0A", display:"flex", alignItems:"center", justifyContent:"center" }}>
      <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".75rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(201,169,106,.4)" }}>Vérification...</p>
    </div>
  );

  if (phase === "portail") return (
    <>
      <style>{STYLES}</style>
      <Portail onAcces={(premiere) => setPhase(premiere ? "onboarding" : "feed")}/>
    </>
  );

  return (
    <>
      <style>{STYLES}</style>
      {phase === "onboarding" && <ModalOnboarding onClose={() => setPhase("feed")}/>}

      <div style={{ background:"#0A0A0A", minHeight:"100vh" }}>
        {/* Nav */}
        <nav style={{ padding:"16px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"rgba(10,10,10,.97)", backdropFilter:"blur(20px)", zIndex:100 }}>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem" }}>
            <span style={{color:"#F8F5F2"}}>Meta'</span>
            <span style={{color:"#C9A96A"}}>Morph'</span>
            <span style={{color:"#C2185B"}}>Ose</span>
          </span>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".25em", textTransform:"uppercase", color:"rgba(201,169,106,.45)" }}>
            Communauté des Métamorphosées
          </p>
          <Link to="/dashboard" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".65rem", letterSpacing:".12em", textTransform:"uppercase", color:"rgba(248,245,242,.4)", textDecoration:"none" }}>
            Mon espace
          </Link>
        </nav>

        {/* Hero */}
        <div style={{ padding:"48px 24px 32px", textAlign:"center", borderBottom:"1px solid rgba(255,255,255,.05)" }}>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".58rem", letterSpacing:".3em", textTransform:"uppercase", color:"rgba(201,169,106,.4)", marginBottom:"10px" }}>
            Cercle privé
          </p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:400, lineHeight:1.15 }}>
            Communauté des{" "}
            <em style={{ fontStyle:"italic", color:"#C9A96A", fontWeight:300 }}>Métamorphosées</em>
          </h1>
        </div>

        <Feed/>
      </div>
    </>
  );
}
