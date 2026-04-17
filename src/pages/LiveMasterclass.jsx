import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import api from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';

/* ── STYLES ─────────────────────────────────────────────────── */
const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');

  @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes pulse-live { 0%,100%{box-shadow:0 0 8px rgba(194,24,91,.4)} 50%{box-shadow:0 0 22px rgba(194,24,91,.7)} }
  @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes spin     { to{transform:rotate(360deg)} }

  .live-page { min-height:100vh; background:#0A0A0A; color:#F8F5F2; font-family:'Montserrat',sans-serif; font-weight:300; }

  .live-hero {
    text-align:center; padding:80px 24px 48px;
    background:linear-gradient(180deg, rgba(194,24,91,.06) 0%, transparent 100%);
  }
  .live-hero-label {
    font-family:'Montserrat',sans-serif; font-size:.62rem; letter-spacing:.3em;
    text-transform:uppercase; color:#C9A96A; margin-bottom:12px;
  }
  .live-hero h1 {
    font-family:'Playfair Display',serif; font-size:clamp(1.8rem,5vw,2.8rem);
    font-weight:600; margin-bottom:14px; line-height:1.2;
  }
  .live-hero p {
    font-size:.88rem; color:rgba(248,245,242,.5); max-width:520px; margin:0 auto;
    line-height:1.7;
  }

  .live-tabs {
    display:flex; gap:0; border-bottom:1px solid rgba(255,255,255,.08);
    max-width:800px; margin:0 auto; padding:0 24px;
  }
  .live-tab {
    padding:14px 28px; background:none; border:none; border-bottom:2px solid transparent;
    color:rgba(248,245,242,.4); font-family:'Montserrat',sans-serif; font-size:.78rem;
    font-weight:500; letter-spacing:.08em; text-transform:uppercase; cursor:pointer;
    transition:all .3s;
  }
  .live-tab.active { color:#C9A96A; border-bottom-color:#C9A96A; }

  .live-content { max-width:800px; margin:0 auto; padding:32px 24px 80px; }

  .salle-card {
    background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.06);
    border-radius:10px; padding:28px; margin-bottom:16px;
    animation:fadeUp .5s ease both; transition:border-color .3s, background .3s;
  }
  .salle-card:hover { border-color:rgba(201,169,106,.25); background:rgba(255,255,255,.04); }

  .salle-badge {
    display:inline-flex; align-items:center; gap:6px;
    padding:4px 12px; border-radius:20px; font-size:.62rem; font-weight:600;
    letter-spacing:.12em; text-transform:uppercase;
  }
  .salle-badge.active {
    background:rgba(194,24,91,.12); color:#C2185B; border:1px solid rgba(194,24,91,.25);
    animation:pulse-live 2s infinite;
  }
  .salle-badge.attente {
    background:rgba(201,169,106,.1); color:#C9A96A; border:1px solid rgba(201,169,106,.2);
  }
  .salle-badge .dot {
    width:7px; height:7px; border-radius:50%; background:currentColor;
    animation:blink 1.5s infinite;
  }

  .salle-title {
    font-family:'Playfair Display',serif; font-size:1.2rem; font-weight:600;
    margin:14px 0 8px;
  }
  .salle-desc {
    font-size:.82rem; color:rgba(248,245,242,.45); line-height:1.6; margin-bottom:16px;
  }
  .salle-meta {
    display:flex; flex-wrap:wrap; gap:16px; align-items:center;
    font-size:.72rem; color:rgba(248,245,242,.35);
  }
  .salle-meta span { display:inline-flex; align-items:center; gap:5px; }

  .btn-rejoindre {
    display:inline-flex; align-items:center; gap:8px;
    padding:12px 28px; background:#C2185B; border:none; border-radius:6px;
    color:#fff; font-family:'Montserrat',sans-serif; font-weight:600;
    font-size:.78rem; letter-spacing:.1em; text-transform:uppercase;
    cursor:pointer; transition:all .3s; text-decoration:none;
  }
  .btn-rejoindre:hover { background:#d81b60; transform:translateY(-1px); box-shadow:0 6px 20px rgba(194,24,91,.3); }

  .btn-creer {
    display:inline-flex; align-items:center; gap:8px;
    padding:12px 28px; background:transparent; border:1px solid rgba(201,169,106,.3);
    border-radius:6px; color:#C9A96A; font-family:'Montserrat',sans-serif;
    font-weight:600; font-size:.78rem; letter-spacing:.1em; text-transform:uppercase;
    cursor:pointer; transition:all .3s;
  }
  .btn-creer:hover { background:rgba(201,169,106,.08); border-color:rgba(201,169,106,.5); }

  .replay-card {
    background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.06);
    border-radius:10px; overflow:hidden; margin-bottom:16px;
    animation:fadeUp .5s ease both; transition:border-color .3s;
  }
  .replay-card:hover { border-color:rgba(201,169,106,.2); }
  .replay-thumb {
    width:100%; aspect-ratio:16/9; background:#111; display:flex;
    align-items:center; justify-content:center; position:relative;
  }
  .replay-play {
    width:56px; height:56px; border-radius:50%; background:rgba(194,24,91,.85);
    display:flex; align-items:center; justify-content:center;
    cursor:pointer; transition:transform .3s;
  }
  .replay-play:hover { transform:scale(1.1); }
  .replay-info { padding:18px 22px; }
  .replay-title { font-family:'Playfair Display',serif; font-size:1rem; font-weight:600; margin-bottom:6px; }
  .replay-date { font-size:.72rem; color:rgba(248,245,242,.35); }

  .empty-state {
    text-align:center; padding:60px 20px;
    color:rgba(248,245,242,.3); font-size:.88rem;
  }
  .empty-state p { margin-bottom:8px; }

  .create-form {
    background:rgba(255,255,255,.03); border:1px solid rgba(201,169,106,.15);
    border-radius:10px; padding:28px; margin-bottom:24px;
    animation:fadeUp .4s ease both;
  }
  .create-form h3 {
    font-family:'Playfair Display',serif; font-size:1.1rem; font-weight:600;
    color:#C9A96A; margin-bottom:20px;
  }
  .form-group { margin-bottom:14px; }
  .form-label {
    display:block; font-size:.62rem; letter-spacing:.14em; text-transform:uppercase;
    color:rgba(248,245,242,.45); margin-bottom:6px;
  }
  .form-input {
    width:100%; padding:11px 14px; background:rgba(255,255,255,.05);
    border:1px solid rgba(255,255,255,.1); border-radius:6px;
    color:#F8F5F2; font-family:'Montserrat',sans-serif; font-size:.88rem; outline:none;
    transition:border-color .3s;
  }
  .form-input:focus { border-color:rgba(201,169,106,.4); }
  .form-input::placeholder { color:rgba(248,245,242,.2); }
  .form-select {
    width:100%; padding:11px 14px; background:rgba(255,255,255,.05);
    border:1px solid rgba(255,255,255,.1); border-radius:6px;
    color:#F8F5F2; font-family:'Montserrat',sans-serif; font-size:.88rem; outline:none;
    appearance:none; cursor:pointer;
  }
  .form-select option { background:#1a1a1a; }
  .form-row { display:flex; gap:12px; margin-top:18px; }

  .loader {
    width:32px; height:32px; border:3px solid rgba(201,169,106,.15);
    border-top-color:#C9A96A; border-radius:50%; animation:spin .7s linear infinite;
    margin:40px auto;
  }

  @media(max-width:600px) {
    .live-hero { padding:60px 20px 36px; }
    .salle-card { padding:20px; }
    .salle-meta { gap:10px; }
    .form-row { flex-direction:column; }
    .live-tabs { padding:0 16px; }
    .live-tab { padding:12px 16px; font-size:.72rem; }
  }
`;

export default function LiveMasterclass() {
  const navigate = useNavigate();

  const [tab,       setTab]       = useState("live");
  const [salles,    setSalles]    = useState([]);
  const [replays,   setReplays]   = useState([]);
  const [loading,   setLoading]   = useState(true);
  const [showForm,  setShowForm]  = useState(false);
  const [creating,  setCreating]  = useState(false);
  const [error,     setError]     = useState("");

  const [form, setForm] = useState({
    titre: "", description: "", mode: "live", mot_de_passe: "", max_participants: 100
  });

  const { token, user } = useAuth();
  const isAdmin = user?.is_staff === true;

  useEffect(() => {
    setLoading(true);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};

    Promise.all([
      fetch(`${API_BASE}/api/live/${isAdmin ? 'mes-salles' : 'salles-actives'}/`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch(`${API_BASE}/api/contenu/replays/`, { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
    ]).then(([sallesData, replaysData]) => {
      setSalles(Array.isArray(sallesData) ? sallesData : []);
      setReplays(Array.isArray(replaysData) ? replaysData : []);
      setLoading(false);
    });
  }, []);

  async function creerSalle(e) {
    e.preventDefault();
    if (!form.titre.trim()) { setError("Le titre est requis."); return; }
    setCreating(true);
    setError("");
    try {
      const res = await fetch(`${API_BASE}/api/live/creer/`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${localStorage.getItem("mmorphose_token") || token}` },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (res.ok) {
        navigate(`/meeting/${data.id}`);
      } else {
        setError(data.detail || "Erreur lors de la creation.");
        setCreating(false);
      }
    } catch {
      setError("Erreur reseau.");
      setCreating(false);
    }
  }

  function rejoindre(salleId) {
    navigate(`/meeting/${salleId}`);
  }

  function formatDate(d) {
    if (!d) return "";
    const date = new Date(d);
    return date.toLocaleDateString("fr-FR", { day:"numeric", month:"long", year:"numeric", hour:"2-digit", minute:"2-digit" });
  }

  const sallesActives  = salles.filter(s => s.statut === "active");
  const sallesAttente  = salles.filter(s => s.statut === "attente");
  const toutesLesSalles = [...sallesActives, ...sallesAttente];

  return (
    <div className="live-page">
      <style>{STYLES}</style>

      <div className="live-hero">
        <p className="live-hero-label">Meta'Morph'Ose</p>
        <h1>Lives & Replays</h1>
        <p style={{maxWidth:"600px",margin:"0 auto 24px",lineHeight:1.9,color:"rgba(248,245,242,.6)",fontWeight:300}}>
          Bienvenue dans ton espace Live et Replay.
          <br/><br/>
          Ici, tout se passe en direct. Des sessions puissantes, des échanges authentiques
          et des moments de transformation en temps réel.
          <br/><br/>
          Rejoins les lives, participe aux rencontres, et vis une expérience immersive
          qui te rapproche chaque jour de la femme que tu veux devenir.
        </p>
        <div style={{display:"flex",flexDirection:"column",gap:"6px",marginBottom:"16px",textAlign:"left",maxWidth:"300px",margin:"0 auto 24px"}}>
          {["Sois présente.","Engage-toi.","Transforme-toi."].map((t,i) => (
            <p key={i} style={{fontFamily:"var(--ff-b,Montserrat,sans-serif)",fontSize:".82rem",color:"#C9A96A",fontWeight:500,letterSpacing:".05em"}}>— {t}</p>
          ))}
        </div>
      </div>

      <div className="live-tabs">
        <button className={`live-tab ${tab==="live"?"active":""}`} onClick={()=>setTab("live")}>
          Live en direct {sallesActives.length > 0 && <span style={{color:"#C2185B",marginLeft:"6px"}}>● {sallesActives.length}</span>}
        </button>
        <button className={`live-tab ${tab==="replays"?"active":""}`} onClick={()=>setTab("replays")}>
          Replays ({replays.length})
        </button>
      </div>

      <div className="live-content">
        {loading && <div className="loader" />}

        {!loading && tab === "live" && (
          <>
            {isAdmin && (
              <div style={{ marginBottom:"24px" }}>
                <button className="btn-creer" onClick={() => setShowForm(!showForm)}>
                  {showForm ? "✕ Annuler" : "+ Creer une salle"}
                </button>
              </div>
            )}

            {isAdmin && showForm && (
              <form className="create-form" onSubmit={creerSalle}>
                <h3>Nouvelle salle</h3>
                {error && (
                  <p style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", borderRadius:"6px", padding:"10px 14px", fontSize:".78rem", color:"#f87171", marginBottom:"14px" }}>
                    {error}
                  </p>
                )}
                <div className="form-group">
                  <label className="form-label">Titre *</label>
                  <input className="form-input" value={form.titre} onChange={e=>setForm({...form,titre:e.target.value})} placeholder="Ex : Masterclass Meta'Morph'Ose — Semaine 3" />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <input className="form-input" value={form.description} onChange={e=>setForm({...form,description:e.target.value})} placeholder="Description courte (optionnel)" />
                </div>
                <div className="form-group">
                  <label className="form-label">Mode</label>
                  <select className="form-select" value={form.mode} onChange={e=>setForm({...form,mode:e.target.value})}>
                    <option value="live">Live (diffusion)</option>
                    <option value="reunion">Reunion (interactif)</option>
                    <option value="webinaire">Webinaire</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Mot de passe (optionnel)</label>
                  <input className="form-input" type="password" value={form.mot_de_passe} onChange={e=>setForm({...form,mot_de_passe:e.target.value})} placeholder="Laisser vide si libre d acces" />
                </div>
                <div className="form-row">
                  <button type="submit" className="btn-rejoindre" disabled={creating} style={creating?{opacity:.6,pointerEvents:"none"}:{}}>
                    {creating ? "Creation..." : "Creer et rejoindre"}
                  </button>
                </div>
              </form>
            )}

            {toutesLesSalles.length === 0 && (
              <div className="empty-state">
                <p style={{ fontSize:"2rem", marginBottom:"12px" }}>📡</p>
                <p>Aucun live en cours pour le moment.</p>
                <p style={{ fontSize:".78rem" }}>Revenez bientot ou activez les notifications pour etre prevenue.</p>
              </div>
            )}

            {toutesLesSalles.map((salle, i) => (
              <div className="salle-card" key={salle.id} style={{ animationDelay:`${i*0.08}s` }}>
                <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:"10px" }}>
                  <span className={`salle-badge ${salle.statut==="active"?"active":"attente"}`}>
                    <span className="dot" />
                    {salle.statut === "active" ? "En direct" : "En attente"}
                  </span>
                  <span style={{ fontSize:".68rem", color:"rgba(248,245,242,.3)" }}>
                    {salle.mode === "webinaire" ? "Webinaire" : salle.mode === "live" ? "Live" : "Reunion"}
                  </span>
                </div>

                <h2 className="salle-title">{salle.titre}</h2>
                {salle.description && <p className="salle-desc">{salle.description}</p>}

                <div className="salle-meta">
                  <span>👥 {salle.participants_count ?? salle.participants ?? 0} participant{(salle.participants_count||salle.participants||0)!==1?"s":""}</span>
                  {salle.hote_nom && <span>👑 {salle.hote_nom}</span>}
                  {salle.started_at && <span>🕐 Demarre {formatDate(salle.started_at)}</span>}
                  {salle.mot_de_passe && <span>🔒 Protegee</span>}
                </div>

                <div style={{ marginTop:"20px" }}>
                  <button className="btn-rejoindre" onClick={() => rejoindre(salle.id)}>
                    Rejoindre
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </>
        )}

        {!loading && tab === "replays" && (
          <>
            {replays.length === 0 && (
              <div className="empty-state">
                <p style={{ fontSize:"2rem", marginBottom:"12px" }}>🎬</p>
                <p>Aucun replay disponible pour le moment.</p>
                <p style={{ fontSize:".78rem" }}>Les replays seront ajoutes apres chaque session live.</p>
              </div>
            )}

            {replays.map((replay, i) => (
              <div className="replay-card" key={replay.id || i} style={{ animationDelay:`${i*0.08}s` }}>
                <div className="replay-thumb">
                  {replay.thumbnail ? (
                    <img src={replay.thumbnail} alt={replay.titre} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
                  ) : (
                    <div style={{ background:"linear-gradient(135deg,rgba(194,24,91,.15),rgba(201,169,106,.1))", width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.4rem", color:"rgba(201,169,106,.4)" }}>M'O</span>
                    </div>
                  )}
                  {replay.video_url && (
                    <a href={replay.video_url} target="_blank" rel="noopener noreferrer" style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <div className="replay-play">
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      </div>
                    </a>
                  )}
                </div>
                <div className="replay-info">
                  <h3 className="replay-title">{replay.titre || "Session live"}</h3>
                  <p className="replay-date">
                    {replay.date ? formatDate(replay.date) : replay.created_at ? formatDate(replay.created_at) : ""}
                    {replay.duree && ` · ${replay.duree}`}
                  </p>
                  {replay.description && (
                    <p style={{ fontSize:".82rem", color:"rgba(248,245,242,.4)", marginTop:"8px", lineHeight:1.6 }}>{replay.description}</p>
                  )}
                </div>
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
