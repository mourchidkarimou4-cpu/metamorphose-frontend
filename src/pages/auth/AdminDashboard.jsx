import API_URL from '../../config.js'
import { useState, useEffect, useCallback } from "react";
import usePageBackground from "../../hooks/usePageBackground";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate, Link } from "react-router-dom";

/* ================================================================
   ADMIN DASHBOARD — Méta'Morph'Ose
   Sections : Stats · Membres · Demandes · Replays · Guides · Config
   ================================================================ */

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }

  :root {
    --noir: #0A0A0A;
    --surface: #111111;
    --surface2: #1a1a1a;
    --border: rgba(255,255,255,.07);
    --or: #C9A96A;
    --rose: #C2185B;
    --text: #F8F5F2;
    --text-sub: rgba(248,245,242,.45);
    --green: #4CAF50;
    --red: #ef5350;
    --ff-t: 'Playfair Display', serif;
    --ff-b: 'Montserrat', sans-serif;
    --ease: cubic-bezier(0.4,0,0.2,1);
  }

  body { background:var(--noir); color:var(--text); font-family:var(--ff-b); }

  @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:none} }
  @keyframes spin   { to{transform:rotate(360deg)} }
  @keyframes pulse  { 0%,100%{opacity:1} 50%{opacity:.4} }

  .spinner { width:16px;height:16px;border-radius:50%;border:2px solid rgba(255,255,255,.2);border-top-color:var(--or);animation:spin .7s linear infinite; }

  .admin-input {
    width:100%; padding:10px 14px;
    background:rgba(255,255,255,.04);
    border:1px solid var(--border);
    border-radius:3px; color:var(--text);
    font-family:var(--ff-b); font-size:.82rem; font-weight:300;
    outline:none; transition:border .25s;
  }
  .admin-input:focus { border-color:rgba(201,169,106,.4); }
  .admin-input::placeholder { opacity:.3; }

  .admin-btn {
    padding:9px 18px; border-radius:3px; border:none; cursor:pointer;
    font-family:var(--ff-b); font-size:.7rem; font-weight:600;
    letter-spacing:.1em; text-transform:uppercase; transition:all .25s;
  }
  .admin-btn-primary { background:var(--rose); color:#fff; }
  .admin-btn-primary:hover { background:#a01049; transform:translateY(-1px); }
  .admin-btn-secondary { background:rgba(255,255,255,.06); color:var(--text-sub); border:1px solid var(--border); }
  .admin-btn-secondary:hover { background:rgba(255,255,255,.1); color:var(--text); }
  .admin-btn-danger { background:rgba(239,83,80,.12); color:#ef5350; border:1px solid rgba(239,83,80,.25); }
  .admin-btn-danger:hover { background:rgba(239,83,80,.22); }
  .admin-btn-success { background:rgba(76,175,80,.12); color:#4CAF50; border:1px solid rgba(76,175,80,.25); }
  .admin-btn-success:hover { background:rgba(76,175,80,.22); }

  .badge {
    display:inline-flex; align-items:center; gap:5px;
    padding:3px 10px; border-radius:100px;
    font-size:.62rem; font-weight:600; letter-spacing:.08em; text-transform:uppercase;
  }
  .badge-green  { background:rgba(76,175,80,.12);  color:#4CAF50; border:1px solid rgba(76,175,80,.2); }
  .badge-red    { background:rgba(239,83,80,.12);  color:#ef5350; border:1px solid rgba(239,83,80,.2); }
  .badge-or     { background:rgba(201,169,106,.1); color:var(--or); border:1px solid rgba(201,169,106,.2); }
  .badge-rose   { background:rgba(194,24,91,.1);   color:var(--rose); border:1px solid rgba(194,24,91,.2); }

  .row-item {
    display:flex; align-items:center; gap:12px;
    padding:14px 18px;
    background:var(--surface2); border:1px solid var(--border);
    border-radius:4px; margin-bottom:8px;
    transition:border .25s;
    animation:fadeUp .4s both;
  }
  .row-item:hover { border-color:rgba(201,169,106,.15); }

  .stat-card {
    padding:24px; background:var(--surface2);
    border:1px solid var(--border); border-radius:6px;
    animation:fadeUp .5s both;
  }

  .tab-btn {
    padding:10px 20px; border-radius:3px; border:none; cursor:pointer;
    font-family:var(--ff-b); font-size:.68rem; font-weight:500;
    letter-spacing:.1em; text-transform:uppercase; transition:all .25s;
    display:flex; align-items:center; gap:7px;
  }

  .modal-overlay {
    position:fixed; inset:0; z-index:500;
    background:rgba(10,10,10,.9); backdrop-filter:blur(12px);
    display:flex; align-items:center; justify-content:center; padding:24px;
  }
  .modal-box {
    background:#141414; border:1px solid rgba(201,169,106,.15);
    border-radius:6px; padding:36px; width:100%; max-width:520px;
    max-height:90vh; overflow-y:auto;
    animation:fadeUp .35s both;
  }

  ::-webkit-scrollbar { width:3px; }
  ::-webkit-scrollbar-track { background:var(--noir); }
  ::-webkit-scrollbar-thumb { background:var(--or); border-radius:2px; }

  @media(max-width:768px) {
    .admin-layout  { flex-direction:column !important; }
    .admin-sidebar { width:100% !important; height:auto !important; position:relative !important; top:auto !important; }
    .admin-nav     { display:flex !important; flex-direction:row !important; flex-wrap:wrap !important; gap:4px !important; padding:8px !important; }
    .admin-main    { padding:20px 16px !important; }
    .stat-grid     { grid-template-columns:repeat(2,1fr) !important; }
  }
  @media(max-width:480px) {
    .stat-grid { grid-template-columns:1fr 1fr !important; }
    .admin-modal { padding:24px 20px !important; }
    .img-grid { grid-template-columns:1fr !important; }
  }

  /* ── RESPONSIVE ─────────────────────────────────────────────── */
  @media(max-width:900px){
    .admin-layout{flex-direction:column !important}
    .admin-sidebar{width:100% !important;height:auto !important;flex-direction:row !important;overflow-x:auto !important;padding:10px 8px !important;gap:4px !important;min-height:unset !important;position:relative !important}
    .admin-sidebar .sidebar-label{display:none !important}
    .admin-main{padding:20px 16px !important}
    .admin-modal{width:95vw !important;max-width:95vw !important;margin:8px !important}
  }
  @media(max-width:600px){
    .row-item{flex-direction:column !important;align-items:flex-start !important}
    .img-grid{grid-template-columns:1fr !important}
  }
`;

const FORMULES = { F1:"Live · Groupe", F2:"Live · Privé", F3:"Présentiel · Groupe", F4:"Présentiel · Privé" };
const SECTIONS_CONFIG = [
  { id:"hero",        label:"Hero" },
  { id:"probleme",    label:"Problème" },
  { id:"methode",     label:"Méthode MÉTA/MORPH/OSE" },
  { id:"programme",   label:"Programme 8 semaines" },
  { id:"avant_apres", label:"Avant / Après" },
  { id:"pour_qui",    label:"Pour qui" },
  { id:"prelia",      label:"Prélia" },
  { id:"valeurs",     label:"Valeurs" },
  { id:"temoignages", label:"Témoignages" },
  { id:"formules",    label:"Formules et Prix" },
  { id:"faq",         label:"FAQ" },
  { id:"cta",         label:"CTA Final" },
  { id:"footer",      label:"Footer" },
  { id:"diagnostic",  label:"Test Diagnostic" },
  { id:"images",      label:"Photos et Logos" },
  { id:"vague",       label:"Vague & Places" },
  { id:"contact",     label:"WhatsApp & Contact" },
];

/* ── API helper ─────────────────────────────────────────────── */
function useAdminAPI() {
  const navigate = useNavigate();
  const token = localStorage.getItem("mmorphose_token");

  const call = useCallback(async (method, path, body = null) => {
    const opts = {
      method,
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_URL}/api/admin${path}`, opts);
    if (res.status === 401) { navigate("/espace-membre"); return null; }
    if (res.status === 204) return true;
    return res.json();
  }, [token]);

  return call;
}

/* ── Toast notifications ────────────────────────────────────── */
function Toast({ toasts }) {
  return (
    <div style={{ position:"fixed", bottom:"24px", left:"24px", zIndex:999, display:"flex", flexDirection:"column", gap:"8px" }}>
      {toasts.map(t => (
        <div key={t.id} style={{
          padding:"12px 20px", borderRadius:"4px",
          background: t.type==="success" ? "rgba(76,175,80,.15)" : "rgba(239,83,80,.15)",
          border: `1px solid ${t.type==="success" ? "rgba(76,175,80,.3)" : "rgba(239,83,80,.3)"}`,
          color: t.type==="success" ? "#4CAF50" : "#ef5350",
          fontFamily:"var(--ff-b)", fontSize:".78rem", fontWeight:500,
          animation:"fadeUp .3s both",
        }}>
          {t.type==="success" ? "" : ""} {t.msg}
        </div>
      ))}
    </div>
  );
}

/* ── SIDEBAR ────────────────────────────────────────────────── */
function Sidebar({ active, setActive, counts }) {
  const tabs = [
    { id:"stats",    label:"Vue d'ensemble", icon:"" },
    { id:"membres",  label:"Membres",        icon:"", count: counts.membres },
    { id:"demandes", label:"Demandes",       icon:"", count: counts.non_traites, urgent: true },
    { id:"replays",  label:"Replays",        icon:"",  count: counts.replays },
    { id:"guides",   label:"Guides PDF",     icon:"", count: counts.guides },
    { id:"config",   label:"Contenu du site" },
    { id:"images",   label:"Photos et Logos" },
    { id:"cartes",   label:"Cartes Cadeaux" },
    { id:"temoignages", label:"Témoignages", urgent:true },
    { id:"ressources", label:"Chanson et Guide PDF" },
    { id:"liste_attente", label:"Liste d'attente" },
    { id:"newsletter",    label:"Newsletter" },
    { id:"export",        label:"Export CSV" },
    { id:"maintenance",   label:"Mode Maintenance" },
    { id:"mon_compte",    label:"Mon Compte" },
  ];

  return (
    <aside className="admin-sidebar" style={{ width:"220px", flexShrink:0, background:"var(--surface)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0 }}>
      {/* Logo */}
      <div style={{ padding:"24px 20px 20px", borderBottom:"1px solid var(--border)" }}>
        <p style={{ fontFamily:"var(--ff-t)", fontSize:".95rem" }}>
          <span style={{color:"var(--text)"}}>Méta'</span>
          <span style={{color:"var(--or)"}}>Morph'</span>
          <span style={{color:"var(--rose)"}}>Ose</span>
        </p>
        <p style={{ fontSize:".6rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--text-sub)", marginTop:"4px" }}>
          Admin Dashboard
        </p>
      </div>

      {/* Navigation */}
      <nav className="admin-nav" style={{ padding:"12px 10px", flex:1 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActive(t.id)}
            className="tab-btn"
            style={{
              width:"100%", justifyContent:"flex-start", marginBottom:"3px",
              background: active===t.id ? "rgba(194,24,91,.12)" : "transparent",
              color: active===t.id ? "var(--rose)" : "var(--text-sub)",
              borderLeft: active===t.id ? "2px solid var(--rose)" : "2px solid transparent",
              borderRadius: active===t.id ? "0 3px 3px 0" : "3px",
            }}>
            
            <span style={{ flex:1, textAlign:"left" }}>{t.label}</span>
            {t.count > 0 && (
              <span style={{
                background: t.urgent ? "var(--rose)" : "rgba(255,255,255,.1)",
                color: t.urgent ? "#fff" : "var(--text-sub)",
                padding:"2px 7px", borderRadius:"100px", fontSize:".6rem",
                animation: t.urgent ? "pulse 2s infinite" : "none",
              }}>{t.count}</span>
            )}
          </button>
        ))}
      </nav>

      {/* Footer sidebar */}
      <div style={{ padding:"16px 20px", borderTop:"1px solid var(--border)" }}>
        <Link to="/" style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".12em", textTransform:"uppercase", color:"var(--text-sub)", textDecoration:"none", display:"block", marginBottom:"10px" }}>
           Voir le site
        </Link>
        <button onClick={() => { localStorage.removeItem("mmorphose_token"); localStorage.removeItem("mmorphose_user"); window.location.href="/"; }}
          style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".12em", textTransform:"uppercase", color:"rgba(239,83,80,.5)", transition:"color .3s" }}
          onMouseEnter={e=>e.target.style.color="#ef5350"}
          onMouseLeave={e=>e.target.style.color="rgba(239,83,80,.5)"}>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

/* ── STATS ──────────────────────────────────────────────────── */
function StatsView({ stats }) {
  const cards = [
    { label:"Membres total",    value: stats.membres,     color:"var(--or)",  icon:"" },
    { label:"Membres actifs",   value: stats.actifs,      color:"var(--green)",icon:"" },
    { label:"Demandes reçues",  value: stats.demandes,    color:"var(--rose)", icon:"" },
    { label:"Non traitées",     value: stats.non_traites, color:"#ef5350",    icon:"" },
    { label:"Replays",          value: stats.replays,     color:"#A8C8E0",    icon:"▶" },
    { label:"Guides PDF",       value: stats.guides,      color:"var(--beige)",icon:"" },
  ];

  return (
    <div>
      <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600, marginBottom:"28px" }}>
        Vue d'ensemble
      </h2>

      {/* Stat cards */}
      <div className="stat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"14px", marginBottom:"32px" }}>
        {cards.map((c,i) => (
          <div key={i} className="stat-card" style={{ animationDelay:`${i*.07}s`, borderTop:`3px solid ${c.color}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
              <span style={{ fontSize:"1.3rem" }}>{c.icon}</span>
              <span style={{ fontFamily:"var(--ff-t)", fontSize:"2rem", fontWeight:700, color:c.color }}>{c.value}</span>
            </div>
            <p style={{ fontSize:".7rem", letterSpacing:".12em", textTransform:"uppercase", color:"var(--text-sub)" }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Répartition formules */}
      <div className="stat-card" style={{ marginBottom:"20px" }}>
        <p style={{ fontSize:".65rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--or)", marginBottom:"20px" }}>
          Répartition par formule
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:"12px" }}>
          {Object.entries(FORMULES).map(([code, label]) => (
            <div key={code} style={{ textAlign:"center", padding:"16px", background:"rgba(255,255,255,.03)", borderRadius:"4px" }}>
              <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.8rem", fontWeight:700, color:"var(--rose)", marginBottom:"6px" }}>{stats.formules?.[code] || 0}</p>
              <p style={{ fontSize:".68rem", color:"var(--text-sub)", fontWeight:300 }}>{label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ── MEMBRES ────────────────────────────────────────────────── */
function MembresView({ api, toast }) {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("tous");

  useEffect(() => {
    api("GET", "/membres/").then(d => { if(d) setMembres(d); setLoading(false); });
  }, []);

  async function toggleActif(m) {
    const updated = await api("PATCH", `/membres/${m.id}/`, { actif: !m.actif });
    if (updated) {
      setMembres(prev => prev.map(x => x.id===m.id ? {...x, actif:!m.actif} : x));
      toast(updated.actif ? "Membre activé " : "Membre désactivé", updated.actif ? "success" : "error");
    }
  }

  async function deleteMembre(m) {
    if (!confirm(`Supprimer ${m.email} ?`)) return;
    await api("DELETE", `/membres/${m.id}/`);
    setMembres(prev => prev.filter(x => x.id !== m.id));
    toast("Membre supprimé", "error");
  }

  const filtered = membres.filter(m => {
    const q = search.toLowerCase();
    const match = m.email.toLowerCase().includes(q) || (m.first_name||"").toLowerCase().includes(q);
    if (filter === "actifs")    return match && m.actif;
    if (filter === "inactifs")  return match && !m.actif;
    if (filter !== "tous")      return match && m.formule === filter;
    return match;
  });

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600 }}>Membres</h2>
        <span className="badge badge-or">{membres.length} membres</span>
      </div>

      {/* Filtres */}
      <div style={{ display:"flex", gap:"10px", marginBottom:"20px", flexWrap:"wrap" }}>
        <input className="admin-input" placeholder="Rechercher email, prénom…" value={search}
          onChange={e=>setSearch(e.target.value)} style={{ maxWidth:"260px" }}/>
        <div style={{ display:"flex", gap:"6px" }}>
          {[["tous","Tous"],["actifs","Actifs"],["inactifs","Inactifs"],["F1","F1"],["F2","F2"],["F3","F3"],["F4","F4"]].map(([val,label]) => (
            <button key={val} onClick={()=>setFilter(val)}
              className="admin-btn"
              style={{ background:filter===val?"var(--rose)":"rgba(255,255,255,.05)", color:filter===val?"#fff":"var(--text-sub)", padding:"8px 14px" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}}/></div> : (
        filtered.map(m => (
          <div key={m.id} className="row-item">
            {/* Avatar */}
            <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"rgba(194,24,91,.15)", border:"1px solid rgba(194,24,91,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--ff-t)", fontSize:".9rem", color:"var(--rose)", flexShrink:0 }}>
              {(m.first_name?.[0] || m.email[0]).toUpperCase()}
            </div>
            {/* Infos */}
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontWeight:500, fontSize:".88rem", color:"var(--text)", marginBottom:"2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {m.first_name ? `${m.first_name} ${m.last_name}` : m.email}
              </p>
              <p style={{ fontSize:".72rem", color:"var(--text-sub)", fontWeight:300 }}>{m.email} · {m.pays || "—"}</p>
            </div>
            {/* Formule */}
            {m.formule && <span className="badge badge-rose">{m.formule}</span>}
            {/* Statut */}
            <span className={`badge ${m.actif?"badge-green":"badge-red"}`}>
              {m.actif ? "Actif" : "Inactif"}
            </span>
            {/* Actions */}
            <button className={`admin-btn ${m.actif?"admin-btn-danger":"admin-btn-success"}`}
              onClick={() => toggleActif(m)} style={{ padding:"7px 14px", flexShrink:0 }}>
              {m.actif ? "Désactiver" : "Activer"}
            </button>
            <button className="admin-btn admin-btn-danger" onClick={() => deleteMembre(m)} style={{ padding:"7px 12px", flexShrink:0 }}>
              
            </button>
          </div>
        ))
      )}
      {!loading && filtered.length === 0 && (
        <p style={{ textAlign:"center", color:"var(--text-sub)", padding:"40px", fontStyle:"italic" }}>Aucun membre trouvé.</p>
      )}
    </div>
  );
}

/* ── DEMANDES ───────────────────────────────────────────────── */
function DemandesView({ api, toast }) {
  const [demandes, setDemandes] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api("GET", "/demandes/").then(d => { if(d) setDemandes(d); setLoading(false); });
  }, []);

  async function marquerTraite(d) {
    const updated = await api("PATCH", `/demandes/${d.id}/`, { traite: true });
    if (updated) {
      setDemandes(prev => prev.map(x => x.id===d.id ? {...x, traite:true} : x));
      toast("Marquée comme traitée ", "success");
    }
  }

  async function supprimer(d) {
    if (!confirm("Supprimer cette demande ?")) return;
    await api("DELETE", `/demandes/${d.id}/`);
    setDemandes(prev => prev.filter(x => x.id!==d.id));
    setSelected(null);
    toast("Demande supprimée", "error");
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600 }}>Demandes d'inscription</h2>
        <span className="badge badge-rose">{demandes.filter(d=>!d.traite).length} non traitées</span>
      </div>

      {loading ? <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}}/></div> : (
        demandes.map(d => (
          <div key={d.id} className="row-item" style={{ cursor:"pointer" }} onClick={() => setSelected(d)}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:"10px", alignItems:"center", marginBottom:"3px" }}>
                <p style={{ fontWeight:500, fontSize:".88rem", color:"var(--text)" }}>{d.prenom} {d.nom}</p>
                <span className={`badge ${d.traite?"badge-green":"badge-rose"}`}>{d.traite?"Traitée":"En attente"}</span>
                {d.formule && <span className="badge badge-or">{d.formule}</span>}
              </div>
              <p style={{ fontSize:".72rem", color:"var(--text-sub)", fontWeight:300 }}>
                {d.email} · {d.pays} · {new Date(d.date).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div style={{ display:"flex", gap:"8px" }}>
              <a href={`https://wa.me/${d.whatsapp?.replace(/\s/g,"")}`} target="_blank" rel="noreferrer"
                onClick={e=>e.stopPropagation()}
                className="admin-btn admin-btn-success" style={{ padding:"7px 12px" }}>
                WA
              </a>
              {!d.traite && (
                <button className="admin-btn admin-btn-secondary" onClick={e=>{e.stopPropagation();marquerTraite(d)}} style={{padding:"7px 12px"}}>
                  Traiter
                </button>
              )}
              <button className="admin-btn admin-btn-danger" onClick={e=>{e.stopPropagation();supprimer(d)}} style={{padding:"7px 12px"}}>
                
              </button>
            </div>
          </div>
        ))
      )}

      {/* Modal détail demande */}
      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal-box admin-modal" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"24px" }}>
              <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.3rem" }}>{selected.prenom} {selected.nom}</h3>
              <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:"var(--text-sub)",fontSize:"1.2rem",cursor:"pointer"}}></button>
            </div>
            {[
              ["Email",    selected.email],
              ["WhatsApp", selected.whatsapp],
              ["Pays",     selected.pays],
              ["Formule",  FORMULES[selected.formule] || selected.formule],
              ["Date",     new Date(selected.date).toLocaleString("fr-FR")],
              ["Statut",   selected.traite ? "Traitée" : "En attente"],
            ].map(([l,v]) => (
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
                <span style={{ fontSize:".72rem", fontWeight:500, letterSpacing:".1em", textTransform:"uppercase", color:"var(--text-sub)" }}>{l}</span>
                <span style={{ fontSize:".85rem", fontWeight:300, color:"var(--text)" }}>{v}</span>
              </div>
            ))}
            {selected.message && (
              <div style={{ marginTop:"16px", padding:"14px", background:"rgba(255,255,255,.03)", borderRadius:"3px" }}>
                <p style={{ fontSize:".65rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--or)", marginBottom:"8px" }}>Message</p>
                <p style={{ fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.7)", lineHeight:1.7 }}>{selected.message}</p>
              </div>
            )}
            <div style={{ display:"flex", gap:"10px", marginTop:"24px" }}>
              <a href={`https://wa.me/${selected.whatsapp?.replace(/\s/g,"")}`} target="_blank" rel="noreferrer"
                className="admin-btn admin-btn-success" style={{flex:1,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
                WhatsApp
              </a>
              <a href={`mailto:${selected.email}`} className="admin-btn admin-btn-secondary" style={{flex:1,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
                Email
              </a>
              {!selected.traite && (
                <button className="admin-btn admin-btn-primary" onClick={()=>{marquerTraite(selected);setSelected(null)}} style={{flex:1}}>
                  Marquer traitée
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── REPLAYS ────────────────────────────────────────────────── */
function ReplaysView({ api, toast }) {
  const [replays, setReplays] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null); // null | "add" | replay obj
  const [form,    setForm]    = useState({ titre:"", video_url:"", semaine:1, formules:"F1,F2,F3,F4", actif:true });

  useEffect(() => {
    api("GET", "/replays/").then(d => { if(d) setReplays(d); setLoading(false); });
  }, []);

  function openAdd()  { setForm({ titre:"", video_url:"", semaine:1, formules:"F1,F2,F3,F4", actif:true }); setModal("add"); }
  function openEdit(r){ setForm(r); setModal(r); }

  async function save() {
    if (modal === "add") {
      const created = await api("POST", "/replays/", form);
      if (created) { setReplays(p => [...p, created]); toast("Replay ajouté ", "success"); }
    } else {
      const updated = await api("PATCH", `/replays/${modal.id}/`, form);
      if (updated) { setReplays(p => p.map(x => x.id===modal.id ? updated : x)); toast("Replay modifié ", "success"); }
    }
    setModal(null);
  }

  async function del(r) {
    if (!confirm(`Supprimer "${r.titre}" ?`)) return;
    await api("DELETE", `/replays/${r.id}/`);
    setReplays(p => p.filter(x => x.id!==r.id));
    toast("Replay supprimé", "error");
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600 }}>Replays</h2>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>Ajouter un replay</button>
      </div>

      {loading ? <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}}/></div> : (
        replays.map(r => (
          <div key={r.id} className="row-item">
            <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"rgba(168,200,224,.1)", border:"1px solid rgba(168,200,224,.2)", display:"flex", alignItems:"center", justifyContent:"center", color:"#A8C8E0", fontSize:".8rem", flexShrink:0 }}>
              S{r.semaine}
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontWeight:500, fontSize:".88rem", color:"var(--text)", marginBottom:"2px" }}>{r.titre}</p>
              <p style={{ fontSize:".72rem", color:"var(--text-sub)", fontWeight:300, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{r.video_url}</p>
            </div>
            <span className={`badge ${r.actif?"badge-green":"badge-red"}`}>{r.actif?"Actif":"Inactif"}</span>
            <button className="admin-btn admin-btn-secondary" onClick={()=>openEdit(r)} style={{padding:"7px 14px"}}>Modifier</button>
            <button className="admin-btn admin-btn-danger" onClick={()=>del(r)} style={{padding:"7px 12px"}}></button>
          </div>
        ))
      )}

      {/* Modal ajout/édition */}
      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(null)}>
          <div className="modal-box admin-modal" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"24px" }}>
              <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.2rem" }}>{modal==="add"?"Ajouter un replay":"Modifier le replay"}</h3>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",color:"var(--text-sub)",fontSize:"1.2rem",cursor:"pointer"}}></button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              {[["Titre", "titre","text"],["URL vidéo","video_url","url"]].map(([label,key,type]) => (
                <div key={key}>
                  <label style={{ fontSize:".65rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>{label}</label>
                  <input className="admin-input" type={type} value={form[key]||""} onChange={e=>setForm(f=>({...f,[key]:e.target.value}))} placeholder={label}/>
                </div>
              ))}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <label style={{ fontSize:".65rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Semaine</label>
                  <input className="admin-input" type="number" min="1" max="8" value={form.semaine} onChange={e=>setForm(f=>({...f,semaine:parseInt(e.target.value)}))}/>
                </div>
                <div>
                  <label style={{ fontSize:".65rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Formules accès</label>
                  <input className="admin-input" value={form.formules||""} onChange={e=>setForm(f=>({...f,formules:e.target.value}))} placeholder="F1,F2,F3,F4"/>
                </div>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <input type="checkbox" id="actif-r" checked={form.actif||false} onChange={e=>setForm(f=>({...f,actif:e.target.checked}))} style={{accentColor:"var(--rose)"}}/>
                <label htmlFor="actif-r" style={{ fontSize:".82rem", color:"var(--text-sub)", cursor:"pointer" }}>Visible par les membres</label>
              </div>
              <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
                <button className="admin-btn admin-btn-primary" onClick={save} style={{flex:1, padding:"12px"}}>
                  {modal==="add" ? "Ajouter" : "Enregistrer"}
                </button>
                <button className="admin-btn admin-btn-secondary" onClick={()=>setModal(null)} style={{flex:1, padding:"12px"}}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── GUIDES ─────────────────────────────────────────────────── */
function GuidesView({ api, toast }) {
  const [guides,  setGuides]  = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal,   setModal]   = useState(null);
  const [form,    setForm]    = useState({ titre:"", numero:1, actif:true });

  useEffect(() => {
    api("GET", "/guides/").then(d => { if(d) setGuides(d); setLoading(false); });
  }, []);

  async function save() {
    if (modal === "add") {
      const created = await api("POST", "/guides/", form);
      if (created) { setGuides(p => [...p, created]); toast("Guide ajouté ", "success"); }
    } else {
      const updated = await api("PATCH", `/guides/${modal.id}/`, { titre:form.titre, numero:form.numero, actif:form.actif });
      if (updated) { setGuides(p => p.map(x => x.id===modal.id ? updated : x)); toast("Guide modifié ", "success"); }
    }
    setModal(null);
  }

  async function del(g) {
    if (!confirm(`Supprimer "${g.titre}" ?`)) return;
    await api("DELETE", `/guides/${g.id}/`);
    setGuides(p => p.filter(x => x.id!==g.id));
    toast("Guide supprimé", "error");
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600 }}>Guides PDF · Bonus</h2>
        <button className="admin-btn admin-btn-primary" onClick={()=>{ setForm({titre:"",numero:guides.length+1,actif:true}); setModal("add"); }}>Ajouter un guide</button>
      </div>

      {loading ? <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}}/></div> : (
        guides.map(g => (
          <div key={g.id} className="row-item">
            <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"rgba(201,169,106,.1)", border:"1px solid rgba(201,169,106,.2)", display:"flex", alignItems:"center", justifyContent:"center", color:"var(--or)", fontSize:".75rem", fontWeight:700, flexShrink:0 }}>
              {g.numero}
            </div>
            <div style={{ flex:1 }}>
              <p style={{ fontWeight:500, fontSize:".88rem", color:"var(--text)", marginBottom:"2px" }}>{g.titre}</p>
              <p style={{ fontSize:".72rem", color:"var(--text-sub)", fontWeight:300 }}>
                {g.fichier ? "Fichier PDF uploadé " : "Pas encore de fichier"}
              </p>
            </div>
            <span className={`badge ${g.actif?"badge-green":"badge-red"}`}>{g.actif?"Actif":"Inactif"}</span>
            <button className="admin-btn admin-btn-secondary" onClick={()=>{ setForm(g); setModal(g); }} style={{padding:"7px 14px"}}>Modifier</button>
            <button className="admin-btn admin-btn-danger" onClick={()=>del(g)} style={{padding:"7px 12px"}}></button>
          </div>
        ))
      )}

      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(null)}>
          <div className="modal-box admin-modal" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"24px" }}>
              <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.2rem" }}>{modal==="add"?"Ajouter un guide":"Modifier le guide"}</h3>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",color:"var(--text-sub)",fontSize:"1.2rem",cursor:"pointer"}}></button>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
              <div>
                <label style={{ fontSize:".65rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Titre du guide</label>
                <input className="admin-input" value={form.titre||""} onChange={e=>setForm(f=>({...f,titre:e.target.value}))} placeholder="Titre du guide PDF"/>
              </div>
              <div>
                <label style={{ fontSize:".65rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Numéro (ordre)</label>
                <input className="admin-input" type="number" min="1" max="7" value={form.numero||1} onChange={e=>setForm(f=>({...f,numero:parseInt(e.target.value)}))}/>
              </div>
              <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                <input type="checkbox" id="actif-g" checked={form.actif||false} onChange={e=>setForm(f=>({...f,actif:e.target.checked}))} style={{accentColor:"var(--rose)"}}/>
                <label htmlFor="actif-g" style={{ fontSize:".82rem", color:"var(--text-sub)", cursor:"pointer" }}>Visible par les membres</label>
              </div>
              <div style={{ padding:"12px", background:"rgba(255,255,255,.03)", border:"1px solid var(--border)", borderRadius:"3px", fontSize:".78rem", color:"var(--text-sub)", fontStyle:"italic" }}>
                Pour uploader le fichier PDF, utilisez l'interface admin Django :<br/>
                <a href="http://127.0.0.1:8000/admin" target="_blank" rel="noreferrer" style={{color:"var(--or)"}}>http://127.0.0.1:8000/admin  Guides</a>
              </div>
              <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
                <button className="admin-btn admin-btn-primary" onClick={save} style={{flex:1,padding:"12px"}}>{modal==="add"?"Ajouter":"Enregistrer"}</button>
                <button className="admin-btn admin-btn-secondary" onClick={()=>setModal(null)} style={{flex:1,padding:"12px"}}>Annuler</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── CONFIG SITE ────────────────────────────────────────────── */
function ConfigView({ api, toast, sectionFilter = null }) {
  const [configs,  setConfigs]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [section,  setSection]  = useState("hero");
  const [edits,    setEdits]    = useState({});
  const [saving,   setSaving]   = useState({});

  useEffect(() => {
    api("GET", "/config/").then(d => {
      if (d) {
        setConfigs(d);
        // Initialiser edits
        const e = {};
        d.forEach(c => { e[c.cle] = c.valeur; });
        setEdits(e);
      }
      setLoading(false);
    });
  }, []);

  async function saveConfig(cle, section) {
    setSaving(s => ({...s, [cle]:true}));
    await api("POST", "/config/update/", { cle, valeur: edits[cle], section });
    setSaving(s => ({...s, [cle]:false}));
    toast(`"${cle}" mis à jour `, "success");
  }

  async function addConfig(cle, valeur) {
    const created = await api("POST", "/config/update/", { cle, valeur, section });
    if (created) {
      setConfigs(p => [...p.filter(c=>c.cle!==cle), created]);
      setEdits(e => ({...e, [cle]: valeur}));
      toast("Clé ajoutée ", "success");
    }
  }

  const [newCle, setNewCle]     = useState("");
  const [newVal, setNewVal]     = useState("");

  const sectionConfigs = sectionFilter
    ? configs.filter(c => c.section === sectionFilter)
    : configs.filter(c => c.section === section);

  return (
    <div>
      <div style={{ marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600, marginBottom:"8px" }}>Contenu du site</h2>
        <p style={{ fontSize:".82rem", color:"var(--text-sub)", fontWeight:300 }}>Modifiez les textes et informations affichés sur le site en temps réel.</p>
      </div>

      {/* Sections tabs */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"24px", flexWrap:"wrap" }}>
        {SECTIONS_CONFIG.map(s => (
          <button key={s.id} onClick={()=>setSection(s.id)}
            className="admin-btn"
            style={{ background:section===s.id?"var(--rose)":"rgba(255,255,255,.05)", color:section===s.id?"#fff":"var(--text-sub)", display:"flex", alignItems:"center", gap:"6px" }}>
            {s.icon} {s.label}
          </button>
        ))}
      </div>

      {loading ? <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}}/></div> : (
        <>
          {sectionConfigs.length === 0 && (
            <div style={{ padding:"32px", background:"rgba(255,255,255,.02)", border:"1px solid var(--border)", borderRadius:"4px", textAlign:"center", marginBottom:"24px" }}>
              <p style={{ color:"var(--text-sub)", fontSize:".85rem", fontStyle:"italic" }}>
                Aucune clé pour cette section. Ajoutez-en une ci-dessous.
              </p>
            </div>
          )}

          {sectionConfigs.map(c => (
            <div key={c.cle} style={{ marginBottom:"16px", padding:"20px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"4px" }}>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"10px" }}>
                <label style={{ fontSize:".65rem", letterSpacing:".18em", textTransform:"uppercase", color:"var(--or)", fontWeight:600 }}>{c.cle}</label>
                <button className="admin-btn admin-btn-primary" onClick={()=>saveConfig(c.cle, c.section)}
                  style={{ padding:"7px 16px", opacity: saving[c.cle]?.8:1 }}>
                  {saving[c.cle] ? "…" : "Enregistrer"}
                </button>
              </div>
              {edits[c.cle]?.length > 80 ? (
                <textarea className="admin-input" value={edits[c.cle]||""} rows={3}
                  onChange={e=>setEdits(ed=>({...ed,[c.cle]:e.target.value}))}
                  style={{ resize:"vertical", minHeight:"80px" }}/>
              ) : (
                <input className="admin-input" value={edits[c.cle]||""} onChange={e=>setEdits(ed=>({...ed,[c.cle]:e.target.value}))}/>
              )}
            </div>
          ))}

          {/* Ajouter nouvelle clé */}
          <div style={{ padding:"20px", background:"rgba(201,169,106,.04)", border:"1px dashed rgba(201,169,106,.2)", borderRadius:"4px", marginTop:"8px" }}>
            <p style={{ fontSize:".65rem", letterSpacing:".18em", textTransform:"uppercase", color:"var(--or)", marginBottom:"14px" }}>Ajouter une clé</p>
            <div style={{ display:"grid", gridTemplateColumns:"1fr 2fr auto", gap:"10px" }}>
              <input className="admin-input" placeholder="Clé (ex: slogan)" value={newCle} onChange={e=>setNewCle(e.target.value)}/>
              <input className="admin-input" placeholder="Valeur" value={newVal} onChange={e=>setNewVal(e.target.value)}/>
              <button className="admin-btn admin-btn-primary" onClick={()=>{ if(newCle&&newVal){ addConfig(newCle,newVal); setNewCle(""); setNewVal(""); } }}>
                Ajouter
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}


/* ── IMAGES / LOGOS ─────────────────────────────────────────── */
function ImagesView({ api, toast }) {
  const [uploading, setUploading] = useState({});
  const [previews,  setPreviews]  = useState({});
  const [configs,   setConfigs]   = useState([]);

  useEffect(() => {
    api("GET", "/config/").then(d => {
      if (d) {
        const imgs = d.filter(c => c.section === "images" || c.section === "slides");
        const prev = {};
        imgs.forEach(c => { if (c.valeur) prev[c.cle] = c.valeur; });
        setConfigs(imgs);
        setPreviews(prev);
      }
    });
  }, []);

  const imageFields = [
    { cle:"photo_prelia",     label:"Photo de Prélia",        desc:"Portrait principal affiché dans la section À Propos",    ratio:"3/4" },
    { cle:"logo_site",        label:"Logo Meta'Morph'Ose",    desc:"Logo principal du site (format PNG transparent recommandé)", ratio:"3/1" },
    { cle:"logo_white_black", label:"Logo White & Black",     desc:"Logo de la marque White & Black",                        ratio:"3/1" },
    { cle:"favicon",          label:"Favicon",                desc:"Icône du site dans l'onglet navigateur (32x32px)",        ratio:"1/1" },
  ];

  const slideFields = [
    { cle:"slide_1", label:"Slide 1", desc:"Première image du diaporama hero" },
    { cle:"slide_2", label:"Slide 2", desc:"Deuxième image du diaporama hero" },
    { cle:"slide_3", label:"Slide 3", desc:"Troisième image du diaporama hero" },
    { cle:"slide_4", label:"Slide 4", desc:"Quatrième image du diaporama hero" },
    { cle:"slide_5", label:"Slide 5", desc:"Cinquième image du diaporama hero" },
  ];

  async function handleUpload(cle, file) {
    if (!file) return;

    // Vérifications
    if (file.size > 5 * 1024 * 1024) {
      toast("Fichier trop lourd (max 5MB)", "error");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast("Seules les images sont acceptées", "error");
      return;
    }

    setUploading(u => ({ ...u, [cle]: true }));

    // Convertir en base64 pour prévisualisation immédiate
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result;
      setPreviews(p => ({ ...p, [cle]: base64 }));

      // Envoyer au backend via FormData
      const token = localStorage.getItem("mmorphose_token");
      const formData = new FormData();
      formData.append("fichier", file);
      formData.append("cle", cle);
      formData.append("section", cle.startsWith("slide_") ? "slides" : "images");

      try {
        const res = await fetch(API_URL + '/api/admin/images/upload/', {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          setPreviews(p => ({ ...p, [cle]: data.url }));
          toast(`${cle} mis à jour`, "success");
        } else {
          // Fallback : sauvegarder l'URL base64 directement en config
          await api("POST", "/config/update/", { cle, valeur: base64, section: cle.startsWith("slide_") ? "slides" : "images" });
          toast("Image sauvegardée", "success");
        }
      } catch {
        // En dev sans endpoint upload, sauvegarder base64
        await api("POST", "/config/update/", { cle, valeur: base64, section: "images" });
        toast("Image sauvegardée en local", "success");
      }
      setUploading(u => ({ ...u, [cle]: false }));
    };
    reader.readAsDataURL(file);
  }

  async function removeImage(cle) {
    if (!confirm("Supprimer cette image ?")) return;
    await api("POST", "/config/update/", { cle, valeur: "", section: "images" });
    setPreviews(p => ({ ...p, [cle]: "" }));
    toast("Image supprimée", "success");
  }

  return (
    <div>
      <div style={{ marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600, marginBottom:"8px" }}>Photos et Logos</h2>
        <p style={{ fontSize:".82rem", color:"var(--text-sub)", fontWeight:300 }}>
          Gérez les images affichées sur le site. Les modifications sont appliquées immédiatement.
        </p>
      </div>

      {/* Section Diaporama */}
      <div style={{ marginBottom:"32px" }}>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--or)", marginBottom:"8px" }}>
          Diaporama Hero
        </p>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".78rem", fontWeight:300, color:"var(--text-sub)", marginBottom:"16px", lineHeight:1.6 }}>
          Jusqu'à 5 images qui défileront en arrière-plan. Si vide, des dégradés élégants sont utilisés.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"12px" }}>
          {slideFields.map((field) => (
            <div key={field.cle} style={{ position:"relative" }}>
              <div style={{ width:"100%", aspectRatio:"16/9", background:"rgba(255,255,255,.04)", border:`1px dashed ${previews[field.cle]?"rgba(201,169,106,.3)":"rgba(255,255,255,.1)"}`, borderRadius:"4px", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {previews[field.cle] ? (
                  <img src={previews[field.cle]} alt={field.label} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                ) : (
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"rgba(255,255,255,.2)", textAlign:"center", padding:"8px" }}>{field.label}</p>
                )}
              </div>
              {previews[field.cle] && (
                <button onClick={() => removeImage(field.cle)} style={{ position:"absolute", top:"4px", right:"4px", background:"rgba(239,83,80,.85)", color:"#fff", border:"none", borderRadius:"2px", cursor:"pointer", fontFamily:"var(--ff-b)", fontSize:".55rem", fontWeight:600, padding:"3px 6px" }}>X</button>
              )}
              <label style={{ display:"block", marginTop:"6px", textAlign:"center", padding:"7px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"3px", cursor:uploading[field.cle]?"not-allowed":"pointer", fontFamily:"var(--ff-b)", fontSize:".6rem", fontWeight:500, letterSpacing:".08em", textTransform:"uppercase", color:uploading[field.cle]?"var(--text-sub)":"var(--or)" }}>
                {uploading[field.cle] ? "..." : previews[field.cle] ? "Changer" : "Ajouter"}
                <input type="file" accept="image/*" style={{ display:"none" }} disabled={uploading[field.cle]} onChange={e => handleUpload(field.cle, e.target.files[0])}/>
              </label>
            </div>
          ))}
        </div>
      </div>

      {/* Logos et Photos */}
      <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--or)", marginBottom:"16px" }}>Logos et Photos</p>
      <div className="img-grid" style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
        {imageFields.map((field) => (
          <div key={field.cle} style={{ padding:"24px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"6px", display:"grid", gridTemplateColumns:"200px 1fr", gap:"28px", alignItems:"center" }}>

            {/* Prévisualisation */}
            <div style={{ position:"relative" }}>
              <div style={{
                width:"100%", aspectRatio: field.ratio,
                background:"rgba(255,255,255,.04)",
                border:`1px dashed ${previews[field.cle] ? "rgba(201,169,106,.3)" : "rgba(255,255,255,.1)"}`,
                borderRadius:"4px", overflow:"hidden",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                {previews[field.cle] ? (
                  <img src={previews[field.cle]} alt={field.label}
                    style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                ) : (
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", color:"rgba(255,255,255,.2)", textAlign:"center", padding:"12px" }}>
                    Aucune image
                  </p>
                )}
              </div>
              {previews[field.cle] && (
                <button onClick={() => removeImage(field.cle)} style={{
                  position:"absolute", top:"6px", right:"6px",
                  background:"rgba(239,83,80,.85)", color:"#fff",
                  border:"none", borderRadius:"3px", cursor:"pointer",
                  fontFamily:"var(--ff-b)", fontSize:".6rem",
                  fontWeight:600, padding:"4px 8px",
                }}>
                  Supprimer
                </button>
              )}
            </div>

            {/* Infos + upload */}
            <div>
              <p style={{ fontFamily:"var(--ff-b)", fontSize:".85rem", fontWeight:600, color:"var(--text)", marginBottom:"4px" }}>{field.label}</p>
              <p style={{ fontFamily:"var(--ff-b)", fontSize:".75rem", fontWeight:300, color:"var(--text-sub)", marginBottom:"16px", lineHeight:1.6 }}>{field.desc}</p>

              <label style={{
                display:"inline-flex", alignItems:"center", justifyContent:"center",
                padding:"10px 20px",
                background: uploading[field.cle] ? "rgba(255,255,255,.04)" : "rgba(194,24,91,.1)",
                border:`1px solid ${uploading[field.cle] ? "var(--border)" : "rgba(194,24,91,.3)"}`,
                borderRadius:"3px", cursor: uploading[field.cle] ? "not-allowed" : "pointer",
                fontFamily:"var(--ff-b)", fontSize:".7rem", fontWeight:600,
                letterSpacing:".1em", textTransform:"uppercase",
                color: uploading[field.cle] ? "var(--text-sub)" : "var(--rose)",
                transition:"all .3s",
              }}>
                {uploading[field.cle] ? "Chargement..." : previews[field.cle] ? "Changer l'image" : "Choisir une image"}
                <input
                  type="file" accept="image/*"
                  style={{ display:"none" }}
                  disabled={uploading[field.cle]}
                  onChange={e => handleUpload(field.cle, e.target.files[0])}
                />
              </label>

              {previews[field.cle] && (
                <div style={{ marginTop:"12px" }}>
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".1em", textTransform:"uppercase", color:"rgba(76,175,80,.7)" }}>
                    Image active
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:"24px", padding:"20px", background:"rgba(201,169,106,.04)", border:"1px dashed rgba(201,169,106,.2)", borderRadius:"4px" }}>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".75rem", color:"var(--text-sub)", lineHeight:1.7 }}>
          <strong style={{ color:"var(--or)" }}>Note :</strong> Les images sont sauvegardées et affichées immédiatement sur le site.
          Formats acceptés : JPG, PNG, WebP. Taille maximale : 5MB.
          Pour les logos, privilégiez le format PNG avec fond transparent.
        </p>
      </div>
    </div>
  );
}



/* ── CARTES CADEAUX ─────────────────────────────────────────── */
function CartesView({ api, toast }) {
  const [cartes,   setCartes]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState("tout");

  useEffect(() => {
    fetch(API_URL + '/api/cadeaux/admin/liste/', {
      headers: { "Authorization": `Bearer ${localStorage.getItem("mmorphose_token")}` }
    })
    .then(r => r.json())
    .then(d => { if(Array.isArray(d)) setCartes(d); setLoading(false); })
    .catch(() => setLoading(false));
  }, []);

  async function activer(c) {
    const res = await fetch(`${API_URL}/api/cadeaux/admin/${c.id}/activer/`, {
      method:"POST",
      headers:{ "Authorization": `Bearer ${localStorage.getItem("mmorphose_token")}`, "Content-Type":"application/json" }
    });
    if (res.ok) {
      setCartes(p => p.map(x => x.id===c.id ? {...x, statut:"payee"} : x));
      toast("Carte activée", "success");
    }
  }

  async function marquerUtilisee(c) {
    const res = await fetch(`${API_URL}/api/cadeaux/admin/${c.id}/utiliser/`, {
      method:"POST",
      headers:{ "Authorization": `Bearer ${localStorage.getItem("mmorphose_token")}`, "Content-Type":"application/json" }
    });
    if (res.ok) {
      setCartes(p => p.map(x => x.id===c.id ? {...x, statut:"utilisee"} : x));
      toast("Carte marquée utilisée", "success");
      setSelected(null);
    }
  }

  const STATUT_COLORS = { en_attente:"var(--or)", payee:"var(--green)", utilisee:"rgba(248,245,242,.3)", expiree:"#ef5350" };
  const FORMULES_LABELS = { F1:"Live · Groupe", F2:"Live · Privé", F3:"Présentiel · Groupe", F4:"Présentiel · Privé" };

  const filtered = filter === "tout" ? cartes : cartes.filter(c => c.statut === filter);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600 }}>Cartes Cadeaux</h2>
        <div style={{ display:"flex", gap:"8px" }}>
          {[["tout","Toutes"],["en_attente","En attente"],["payee","Actives"],["utilisee","Utilisées"]].map(([val,label]) => (
            <button key={val} onClick={()=>setFilter(val)} className="admin-btn"
              style={{ background:filter===val?"var(--rose)":"rgba(255,255,255,.05)", color:filter===val?"#fff":"var(--text-sub)", padding:"8px 14px", fontSize:".65rem" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats rapides */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(140px,1fr))", gap:"12px", marginBottom:"24px" }}>
        {[
          { label:"Total",       value: cartes.length,                                color:"var(--or)" },
          { label:"En attente",  value: cartes.filter(c=>c.statut==="en_attente").length, color:"var(--or)" },
          { label:"Actives",     value: cartes.filter(c=>c.statut==="payee").length,      color:"var(--green)" },
          { label:"Utilisées",   value: cartes.filter(c=>c.statut==="utilisee").length,   color:"rgba(248,245,242,.3)" },
        ].map((s,i) => (
          <div key={i} style={{ padding:"16px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"4px", textAlign:"center" }}>
            <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.8rem", fontWeight:700, color:s.color, marginBottom:"4px" }}>{s.value}</p>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".12em", textTransform:"uppercase", color:"var(--text-sub)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}}/></div> : (
        filtered.map(c => (
          <div key={c.id} className="row-item" style={{ cursor:"pointer" }} onClick={()=>setSelected(c)}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:"10px", alignItems:"center", marginBottom:"4px", flexWrap:"wrap" }}>
                <p style={{ fontFamily:"var(--ff-b)", fontWeight:600, fontSize:".85rem", color:"var(--text)", letterSpacing:".08em" }}>{c.code}</p>
                <span className="badge" style={{ background:`${STATUT_COLORS[c.statut]}15`, color:STATUT_COLORS[c.statut], border:`1px solid ${STATUT_COLORS[c.statut]}30`, fontSize:".58rem" }}>
                  {c.statut.replace("_"," ")}
                </span>
                <span className="badge badge-or">{FORMULES_LABELS[c.formule]}</span>
              </div>
              <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".75rem", color:"var(--text-sub)" }}>
                Pour : <strong style={{color:"var(--text)"}}>{c.destinataire_nom}</strong> · De : {c.acheteur_nom} · {new Date(c.date_creation).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div style={{ display:"flex", gap:"8px" }}>
              {c.statut === "en_attente" && (
                <button className="admin-btn admin-btn-success" onClick={e=>{e.stopPropagation();activer(c)}} style={{padding:"7px 14px"}}>
                  Activer
                </button>
              )}
              {/* Bouton marquer utilisée uniquement dans la modal détail */}
            </div>
          </div>
        ))
      )}

      {!loading && filtered.length === 0 && (
        <p style={{ textAlign:"center", color:"var(--text-sub)", padding:"40px", fontStyle:"italic" }}>Aucune carte dans cette catégorie.</p>
      )}

      {/* Modal détail */}
      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal-box admin-modal" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"20px" }}>
              <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.2rem" }}>{selected.code}</h3>
              <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:"var(--text-sub)",fontSize:"1.2rem",cursor:"pointer"}}>X</button>
            </div>
            {[
              ["Formule",      FORMULES_LABELS[selected.formule]],
              ["Destinataire", selected.destinataire_nom],
              ["Email dest.",  selected.destinataire_email || "—"],
              ["Acheteur",     selected.acheteur_nom],
              ["Email achet.", selected.acheteur_email],
              ["WhatsApp",     selected.acheteur_tel || "—"],
              ["Occasion",     selected.occasion || "—"],
              ["Statut",       selected.statut],
              ["Expiration",   selected.date_expiration || "—"],
              ["Commandée le", new Date(selected.date_creation).toLocaleDateString("fr-FR")],
            ].map(([l,v]) => (
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid var(--border)", fontFamily:"var(--ff-b)", fontSize:".82rem" }}>
                <span style={{ color:"var(--text-sub)", fontWeight:300 }}>{l}</span>
                <span style={{ color:"var(--text)", fontWeight:400 }}>{v}</span>
              </div>
            ))}
            {selected.message_perso && (
              <div style={{ marginTop:"14px", padding:"12px", background:"rgba(255,255,255,.03)", borderRadius:"3px" }}>
                <p style={{ fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--or)", marginBottom:"6px" }}>Message personnel</p>
                <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.65)", fontStyle:"italic", lineHeight:1.65 }}>"{selected.message_perso}"</p>
              </div>
            )}
            {/* QR Code */}
            {(selected.statut === "payee" || selected.statut === "en_attente") && (
              <div style={{ marginTop:"20px", padding:"20px", background:"rgba(255,255,255,.03)", border:"1px solid var(--border)", borderRadius:"4px", textAlign:"center" }}>
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--or)", marginBottom:"14px" }}>
                  QR Code de vérification
                </p>
                <div style={{ background:"#fff", padding:"16px", borderRadius:"4px", display:"inline-block", marginBottom:"12px" }}>
                  <QRCodeSVG
                    value={`${window.location.origin}/carte/${selected.code}`}
                    size={160}
                    bgColor="#ffffff"
                    fgColor="#0A0A0A"
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".7rem", letterSpacing:".15em", color:"var(--text-sub)", marginBottom:"4px" }}>
                  {selected.code}
                </p>
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".68rem", fontWeight:300, color:"rgba(248,245,242,.3)", lineHeight:1.6 }}>
                  Scanner pour vérifier et activer en temps réel
                </p>
              </div>
            )}

            <div style={{ display:"flex", gap:"8px", marginTop:"16px" }}>
              {selected.statut === "en_attente" && (
                <button className="admin-btn admin-btn-success" onClick={()=>activer(selected)} style={{flex:1,padding:"12px"}}>Activer la carte</button>
              )}
              {selected.statut === "payee" && (
                <button className="admin-btn admin-btn-secondary" onClick={()=>marquerUtilisee(selected)} style={{flex:1,padding:"12px"}}>Marquer utilisée</button>
              )}
              <a href={`mailto:${selected.acheteur_email}`} className="admin-btn admin-btn-secondary" style={{flex:1,padding:"12px",textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
                Email acheteur
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ── TÉMOIGNAGES ADMIN ──────────────────────────────────────────── */
function TemoignagesView({ api, toast }) {
  const [temos,    setTemos]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("en_attente");
  const [typeFilter, setTypeFilter] = useState("tout");
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState({});
  const [saving,   setSaving]   = useState(false);
  const [photoAvant,    setPhotoAvant]    = useState(null);
  const [photoApres,    setPhotoApres]    = useState(null);
  const [videoFichier,  setVideoFichier]  = useState(null);
  const [audioFichier,  setAudioFichier]  = useState(null);
  const token = localStorage.getItem("mmorphose_token");

  const FORMULES = { F1:"Live · Groupe", F2:"Live · Privé", F3:"Présentiel · Groupe", F4:"Présentiel · Privé" };
  const TYPES    = { texte:"Texte", video:"Vidéo", audio:"Audio" };
  const TYPE_COLORS = { texte:"var(--or)", video:"#A8C8E0", audio:"var(--rose)" };

  function fetchTemos() {
    setLoading(true);
    fetch(`${API_URL}/api/avis/admin/?statut=${filter}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(d => { setTemos(Array.isArray(d) ? d : []); setLoading(false); })
    .catch(() => setLoading(false));
  }

  useEffect(() => { fetchTemos(); }, [filter]);

  function openEdit(t) {
    setSelected(t);
    setForm({
      prenom: t.prenom||"", pays: t.pays||"", formule: t.formule||"",
      type_temo: t.type_temo||"texte", texte: t.texte||"",
      note: t.note||5, video_url: t.video_url||"",
      en_vedette: t.en_vedette||false, statut: t.statut||"en_attente",
    });
    setPhotoAvant(null); setPhotoApres(null);
    setVideoFichier(null); setAudioFichier(null);
    setModal("edit");
  }

  function openAdd() {
    setSelected(null);
    setForm({ prenom:"", pays:"", formule:"", type_temo:"texte", texte:"", note:5, video_url:"", en_vedette:false, statut:"approuve" });
    setPhotoAvant(null); setPhotoApres(null);
    setVideoFichier(null); setAudioFichier(null);
    setModal("add");
  }

  async function save() {
    if (!form.prenom.trim()) { toast("Prénom requis", "error"); return; }
    if (form.type_temo === "texte" && !form.texte.trim()) { toast("Témoignage requis", "error"); return; }
    setSaving(true);

    const data = new FormData();
    Object.entries(form).forEach(([k,v]) => data.append(k, v));
    if (photoAvant)   data.append("photo_avant",    photoAvant);
    if (photoApres)   data.append("photo_apres",    photoApres);
    if (videoFichier) data.append("video_fichier",  videoFichier);
    if (audioFichier) data.append("audio_fichier",  audioFichier);

    try {
      const url    = modal === "add" ? `${API_URL}/api/avis/admin/ajouter/` : `${API_URL}/api/avis/admin/${selected.id}/modifier/`;
      const method = modal === "add" ? "POST" : "PATCH";
      const res    = await fetch(url, {
        method,
        headers: { "Authorization": `Bearer ${token}` },
        body: data,
      });
      if (res.ok) {
        toast(modal === "add" ? "Témoignage ajouté" : "Modifié", "success");
        setModal(null); fetchTemos();
      } else {
        const d = await res.json();
        toast(d.detail || "Erreur", "error");
      }
    } catch { toast("Erreur serveur", "error"); }
    setSaving(false);
  }

  async function action(id, type) {
    const res = await fetch(`${API_URL}/api/avis/admin/${id}/${type}/`, {
      method:"POST", headers:{ "Authorization": `Bearer ${token}` }
    });
    if (res.ok) { fetchTemos(); setModal(null); toast(type==="approuver"?"Approuvé":"Refusé", type==="approuver"?"success":"error"); }
  }

  async function supprimer(id) {
    if (!confirm("Supprimer ce témoignage ?")) return;
    const res = await fetch(`${API_URL}/api/avis/admin/${id}/supprimer/`, {
      method:"DELETE", headers:{ "Authorization": `Bearer ${token}` }
    });
    if (res.status === 204) { fetchTemos(); setModal(null); toast("Supprimé", "error"); }
  }

  const filtered = temos.filter(t => typeFilter === "tout" || t.type_temo === typeFilter);

  const inputStyle = { width:"100%", padding:"10px 14px", background:"rgba(255,255,255,.04)", border:"1px solid var(--border)", borderRadius:"3px", color:"var(--text)", fontFamily:"var(--ff-b)", fontSize:".82rem", fontWeight:300, outline:"none" };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600 }}>Témoignages</h2>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>+ Ajouter</button>
      </div>

      {/* Filtres statut */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"12px", flexWrap:"wrap" }}>
        {[["en_attente","En attente"],["approuve","Approuvés"],["refuse","Refusés"]].map(([val,label]) => (
          <button key={val} onClick={()=>setFilter(val)} className="admin-btn"
            style={{ background:filter===val?"var(--rose)":"rgba(255,255,255,.05)", color:filter===val?"#fff":"var(--text-sub)", padding:"8px 16px" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Filtres type */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"20px" }}>
        {[["tout","Tous"],["texte","Texte"],["video","Vidéo"],["audio","Audio"]].map(([val,label]) => (
          <button key={val} onClick={()=>setTypeFilter(val)} className="admin-btn"
            style={{ background:typeFilter===val?"var(--or)":"rgba(255,255,255,.03)", color:typeFilter===val?"var(--noir)":"var(--text-sub)", padding:"7px 14px", fontSize:".65rem", border:`1px solid ${typeFilter===val?"var(--or)":"var(--border)"}` }}>
            {label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}}/></div>
      ) : filtered.length === 0 ? (
        <p style={{ textAlign:"center", color:"var(--text-sub)", padding:"40px", fontStyle:"italic" }}>Aucun témoignage.</p>
      ) : filtered.map(t => (
        <div key={t.id} className="row-item" style={{ flexDirection:"column", alignItems:"stretch" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
            <div style={{ display:"flex", gap:"8px", alignItems:"center", flexWrap:"wrap" }}>
              <p style={{ fontFamily:"var(--ff-b)", fontWeight:600, fontSize:".85rem" }}>{t.prenom}</p>
              {t.pays && <span style={{ fontSize:".72rem", color:"var(--text-sub)" }}>· {t.pays}</span>}
              <span className="badge" style={{ background:`${TYPE_COLORS[t.type_temo]}15`, color:TYPE_COLORS[t.type_temo], border:`1px solid ${TYPE_COLORS[t.type_temo]}30`, fontSize:".58rem", padding:"3px 8px" }}>
                {TYPES[t.type_temo]}
              </span>
              {t.formule && <span className="badge badge-or" style={{fontSize:".58rem"}}>{FORMULES[t.formule]||t.formule}</span>}
              {t.en_vedette && <span className="badge badge-rose" style={{fontSize:".58rem"}}>Vedette</span>}
              {t.video_fichier && <span className="badge" style={{background:"rgba(168,200,224,.1)",color:"#A8C8E0",border:"1px solid rgba(168,200,224,.2)",fontSize:".58rem"}}>Fichier vidéo</span>}
              {t.audio_fichier && <span className="badge" style={{background:"rgba(194,24,91,.1)",color:"var(--rose)",border:"1px solid rgba(194,24,91,.2)",fontSize:".58rem"}}>Fichier audio</span>}
            </div>
            <span style={{ fontSize:".85rem", color:"#C9A96A", flexShrink:0 }}>{"★".repeat(t.note||0)}{"☆".repeat(5-(t.note||0))}</span>
          </div>

          {/* Aperçu contenu selon type */}
          {t.type_temo === "texte" && t.texte && (
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".82rem", color:"var(--text-sub)", lineHeight:1.6, marginBottom:"10px", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
              {t.texte}
            </p>
          )}
          {t.type_temo === "video" && t.video_url && (
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".78rem", color:"#A8C8E0", marginBottom:"10px" }}>
              Lien : {t.video_url}
            </p>
          )}
          {t.type_temo === "audio" && t.audio_fichier && (
            <audio controls src={t.audio_fichier} style={{ width:"100%", height:"32px", marginBottom:"10px" }}/>
          )}

          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
            <button className="admin-btn admin-btn-secondary" onClick={()=>openEdit(t)} style={{padding:"6px 14px"}}>Modifier</button>
            {t.statut === "en_attente" && <>
              <button className="admin-btn admin-btn-success" onClick={()=>action(t.id,"approuver")} style={{padding:"6px 14px"}}>Approuver</button>
              <button className="admin-btn admin-btn-danger"  onClick={()=>action(t.id,"refuser")}   style={{padding:"6px 14px"}}>Refuser</button>
            </>}
            <button className="admin-btn admin-btn-danger" onClick={()=>supprimer(t.id)} style={{padding:"6px 10px",marginLeft:"auto"}}>Supprimer</button>
          </div>
        </div>
      ))}

      {/* Modal Ajout/Édition */}
      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(null)}>
          <div className="modal-box admin-modal" onClick={e=>e.stopPropagation()} style={{ maxWidth:"660px", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.2rem" }}>
                {modal === "add" ? "Ajouter un témoignage" : "Modifier le témoignage"}
              </h3>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",color:"var(--text-sub)",fontSize:"1.2rem",cursor:"pointer"}}>X</button>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>

              {/* Type de témoignage */}
              <div>
                <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"8px" }}>Type de témoignage</label>
                <div style={{ display:"flex", gap:"8px" }}>
                  {Object.entries(TYPES).map(([val,label]) => (
                    <button key={val} onClick={()=>setForm(f=>({...f,type_temo:val}))} style={{
                      flex:1, padding:"10px", border:`1px solid ${form.type_temo===val?TYPE_COLORS[val]:"var(--border)"}`,
                      borderRadius:"3px", background:form.type_temo===val?`${TYPE_COLORS[val]}15`:"transparent",
                      color:form.type_temo===val?TYPE_COLORS[val]:"var(--text-sub)",
                      fontFamily:"var(--ff-b)", fontSize:".75rem", fontWeight:600, cursor:"pointer", transition:"all .25s",
                    }}>{label}</button>
                  ))}
                </div>
              </div>

              {/* Nom + Pays */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Prénom *</label>
                  <input style={inputStyle} value={form.prenom||""} onChange={e=>setForm(f=>({...f,prenom:e.target.value}))} placeholder="Prénom"/>
                </div>
                <div>
                  <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Pays</label>
                  <input style={inputStyle} value={form.pays||""} onChange={e=>setForm(f=>({...f,pays:e.target.value}))} placeholder="Pays"/>
                </div>
              </div>

              {/* Formule + Note */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Formule</label>
                  <select style={inputStyle} value={form.formule||""} onChange={e=>setForm(f=>({...f,formule:e.target.value}))}>
                    <option value="">— Aucune —</option>
                    {Object.entries(FORMULES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"8px" }}>Note</label>
                  <div style={{ display:"flex", gap:"4px" }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={()=>setForm(f=>({...f,note:n}))} style={{ background:"none", border:"none", cursor:"pointer", fontSize:"1.3rem", color:n<=(form.note||0)?"#C9A96A":"rgba(255,255,255,.15)", padding:"2px", transition:"color .2s" }}>★</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contenu selon type */}
              {form.type_temo === "texte" && (
                <div>
                  <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Témoignage *</label>
                  <textarea style={{...inputStyle, resize:"vertical", minHeight:"120px"}} value={form.texte||""} onChange={e=>setForm(f=>({...f,texte:e.target.value}))} placeholder="Texte du témoignage..."/>
                </div>
              )}

              {form.type_temo === "video" && (
                <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                  <div>
                    <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Lien vidéo (YouTube, TikTok...)</label>
                    <input style={inputStyle} type="url" value={form.video_url||""} onChange={e=>setForm(f=>({...f,video_url:e.target.value}))} placeholder="https://youtube.com/..."/>
                  </div>
                  <div>
                    <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>
                      Ou uploader un fichier vidéo
                    </label>
                    <label style={{ display:"block", padding:"12px", background:"rgba(168,200,224,.06)", border:"1px dashed rgba(168,200,224,.3)", borderRadius:"4px", cursor:"pointer", textAlign:"center", fontFamily:"var(--ff-b)", fontSize:".72rem", color:"#A8C8E0" }}>
                      {videoFichier ? videoFichier.name : selected?.video_fichier ? "Fichier existant — cliquer pour changer" : "Choisir un fichier vidéo (MP4, MOV...)"}
                      <input type="file" accept="video/*" style={{ display:"none" }} onChange={e=>setVideoFichier(e.target.files[0])}/>
                    </label>
                  </div>
                  <div>
                    <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Commentaire (optionnel)</label>
                    <textarea style={{...inputStyle, resize:"vertical", minHeight:"80px"}} value={form.texte||""} onChange={e=>setForm(f=>({...f,texte:e.target.value}))} placeholder="Description ou commentaire sur la vidéo..."/>
                  </div>
                </div>
              )}

              {form.type_temo === "audio" && (
                <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                  <div>
                    <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>
                      Fichier audio *
                    </label>
                    <label style={{ display:"block", padding:"16px", background:"rgba(194,24,91,.06)", border:"1px dashed rgba(194,24,91,.3)", borderRadius:"4px", cursor:"pointer", textAlign:"center", fontFamily:"var(--ff-b)", fontSize:".72rem", color:"var(--rose)" }}>
                      {audioFichier ? audioFichier.name : selected?.audio_fichier ? "Fichier existant — cliquer pour changer" : "Choisir un fichier audio (MP3, WAV, M4A...)"}
                      <input type="file" accept="audio/*" style={{ display:"none" }} onChange={e=>setAudioFichier(e.target.files[0])}/>
                    </label>
                    {/* Aperçu audio existant */}
                    {selected?.audio_fichier && !audioFichier && (
                      <audio controls src={selected.audio_fichier} style={{ width:"100%", marginTop:"8px", height:"36px" }}/>
                    )}
                  </div>
                  <div>
                    <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Commentaire (optionnel)</label>
                    <textarea style={{...inputStyle, resize:"vertical", minHeight:"80px"}} value={form.texte||""} onChange={e=>setForm(f=>({...f,texte:e.target.value}))} placeholder="Description ou commentaire sur l'audio..."/>
                  </div>
                </div>
              )}

              {/* Photos avant/après — pour tous les types */}
              <div>
                <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"10px" }}>
                  Photos avant / après <span style={{opacity:.5,fontWeight:300,textTransform:"none",letterSpacing:0}}>(optionnel)</span>
                </label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                  {[
                    { label:"Avant", current:selected?.photo_avant, setter:setPhotoAvant, file:photoAvant },
                    { label:"Après", current:selected?.photo_apres, setter:setPhotoApres, file:photoApres },
                  ].map(({label,current,setter,file}) => (
                    <label key={label} style={{ cursor:"pointer" }}>
                      <div style={{ aspectRatio:"1", background:"rgba(255,255,255,.03)", border:`1px dashed ${file||current?"rgba(201,169,106,.3)":"rgba(255,255,255,.1)"}`, borderRadius:"4px", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {(file||current) ? (
                          <img src={file ? URL.createObjectURL(file) : current} alt={label} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                        ) : (
                          <div style={{ textAlign:"center", padding:"12px" }}>
                            <p style={{ fontFamily:"var(--ff-b)", fontSize:".72rem", color:"rgba(255,255,255,.3)", marginBottom:"4px" }}>{label}</p>
                            <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", color:"rgba(255,255,255,.2)" }}>Cliquer pour ajouter</p>
                          </div>
                        )}
                      </div>
                      <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>setter(e.target.files[0])}/>
                    </label>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Statut</label>
                  <select style={inputStyle} value={form.statut||"en_attente"} onChange={e=>setForm(f=>({...f,statut:e.target.value}))}>
                    <option value="en_attente">En attente</option>
                    <option value="approuve">Approuvé</option>
                    <option value="refuse">Refusé</option>
                  </select>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", paddingTop:"24px" }}>
                  <input type="checkbox" id="vedette" checked={form.en_vedette||false} onChange={e=>setForm(f=>({...f,en_vedette:e.target.checked}))} style={{accentColor:"var(--rose)"}}/>
                  <label htmlFor="vedette" style={{ fontFamily:"var(--ff-b)", fontSize:".82rem", color:"var(--text-sub)", cursor:"pointer" }}>Mettre en vedette</label>
                </div>
              </div>

              {/* Boutons */}
              <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
                <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving} style={{ flex:1, padding:"13px", opacity:saving?.7:1 }}>
                  {saving ? "Enregistrement..." : modal === "add" ? "Ajouter" : "Enregistrer"}
                </button>
                <button className="admin-btn admin-btn-secondary" onClick={()=>setModal(null)} style={{ flex:1, padding:"13px" }}>Annuler</button>
              </div>

              {/* Actions rapides */}
              {modal === "edit" && selected && (
                <div style={{ display:"flex", gap:"8px", paddingTop:"12px", borderTop:"1px solid var(--border)" }}>
                  {selected.statut === "en_attente" && <>
                    <button className="admin-btn admin-btn-success" onClick={()=>action(selected.id,"approuver")} style={{flex:1,padding:"10px"}}>Approuver</button>
                    <button className="admin-btn admin-btn-danger"  onClick={()=>action(selected.id,"refuser")}   style={{flex:1,padding:"10px"}}>Refuser</button>
                  </>}
                  <button className="admin-btn admin-btn-danger" onClick={()=>supprimer(selected.id)} style={{padding:"10px 16px"}}>Supprimer</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ── RESSOURCES ADMIN — Chanson + Guide PDF ─────────────────── */
function RessourcesAdminView({ api, toast }) {
  const [configs,   setConfigs]   = useState({});
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState({});
  const [uploading, setUploading] = useState({});
  const token = localStorage.getItem("mmorphose_token");

  useEffect(() => {
    api("GET", "/config/").then(d => {
      if (d) {
        const map = {};
        d.filter(c => c.section === "ressources").forEach(c => { map[c.cle] = c.valeur; });
        setConfigs(map);
      }
      setLoading(false);
    });
  }, []);

  function set(cle, val) { setConfigs(p => ({...p, [cle]: val})); }

  async function save(cle) {
    setSaving(s => ({...s, [cle]: true}));
    await api("POST", "/config/update/", { cle, valeur: configs[cle], section: "ressources" });
    setSaving(s => ({...s, [cle]: false}));
    toast(`"${cle}" mis à jour`, "success");
  }

  async function uploadFichier(cle, file, type) {
    if (!file) return;
    setUploading(u => ({...u, [cle]: true}));

    const formData = new FormData();
    formData.append("fichier", file);
    formData.append("cle", cle);
    formData.append("section", "ressources");

    try {
      const res = await fetch(API_URL + '/api/admin/images/upload/', {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setConfigs(p => ({...p, [cle]: data.url}));
        toast(`${type === "audio" ? "Chanson" : "Guide PDF"} uploadé`, "success");
      } else {
        toast("Erreur upload", "error");
      }
    } catch {
      toast("Erreur serveur", "error");
    }
    setUploading(u => ({...u, [cle]: false}));
  }

  const inputStyle = { width:"100%", padding:"10px 14px", background:"rgba(255,255,255,.04)", border:"1px solid var(--border)", borderRadius:"3px", color:"var(--text)", fontFamily:"var(--ff-b)", fontSize:".82rem", fontWeight:300, outline:"none" };

  const fields = [
    { group:"Section", items:[
      { cle:"res_section_titre", label:"Titre de la section" },
      { cle:"res_section_desc",  label:"Description" },
      { cle:"res_citation_finale", label:"Citation finale" },
    ]},
    { group:"Chanson", items:[
      { cle:"res_chanson_titre",   label:"Titre de la chanson" },
      { cle:"res_chanson_artiste", label:"Artiste" },
      { cle:"res_chanson_desc",    label:"Description / Citation" },
    ]},
    { group:"Guide PDF", items:[
      { cle:"res_guide_titre",  label:"Titre du guide" },
      { cle:"res_guide_sous",   label:"Sous-titre" },
      { cle:"res_guide_desc",   label:"Description / Citation" },
      { cle:"res_guide_point1", label:"Point clé 1" },
      { cle:"res_guide_point2", label:"Point clé 2" },
      { cle:"res_guide_point3", label:"Point clé 3" },
    ]},
  ];

  if (loading) return <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}}/></div>;

  return (
    <div>
      <div style={{ marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600, marginBottom:"8px" }}>Chanson et Guide PDF</h2>
        <p style={{ fontSize:".82rem", color:"var(--text-sub)", fontWeight:300 }}>Gérez les ressources gratuites offertes aux visiteuses.</p>
      </div>

      {/* Upload fichiers */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"32px" }}>

        {/* Upload audio */}
        <div style={{ padding:"20px", background:"rgba(194,24,91,.06)", border:"1px solid rgba(194,24,91,.2)", borderRadius:"6px" }}>
          <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".18em", textTransform:"uppercase", color:"var(--rose)", marginBottom:"12px" }}>Fichier Audio (MP3)</p>
          {configs["res_audio_url"] && (
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".72rem", color:"var(--green)", marginBottom:"8px" }}>Fichier actuel : {configs["res_audio_url"]}</p>
          )}
          <label style={{ display:"block", padding:"12px", background:"rgba(194,24,91,.08)", border:"1px dashed rgba(194,24,91,.3)", borderRadius:"4px", cursor:"pointer", textAlign:"center", fontFamily:"var(--ff-b)", fontSize:".72rem", color:"var(--rose)", fontWeight:500, letterSpacing:".1em", textTransform:"uppercase" }}>
            {uploading["res_audio_url"] ? "Upload en cours..." : "Choisir un fichier MP3"}
            <input type="file" accept="audio/*" style={{ display:"none" }} onChange={e => uploadFichier("res_audio_url", e.target.files[0], "audio")} disabled={uploading["res_audio_url"]}/>
          </label>
        </div>

        {/* Upload PDF */}
        <div style={{ padding:"20px", background:"rgba(201,169,106,.06)", border:"1px solid rgba(201,169,106,.2)", borderRadius:"6px" }}>
          <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".18em", textTransform:"uppercase", color:"var(--or)", marginBottom:"12px" }}>Fichier Guide PDF</p>
          {configs["res_pdf_url"] && (
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".72rem", color:"var(--green)", marginBottom:"8px" }}>Fichier actuel : {configs["res_pdf_url"]}</p>
          )}
          <label style={{ display:"block", padding:"12px", background:"rgba(201,169,106,.08)", border:"1px dashed rgba(201,169,106,.3)", borderRadius:"4px", cursor:"pointer", textAlign:"center", fontFamily:"var(--ff-b)", fontSize:".72rem", color:"var(--or)", fontWeight:500, letterSpacing:".1em", textTransform:"uppercase" }}>
            {uploading["res_pdf_url"] ? "Upload en cours..." : "Choisir un fichier PDF"}
            <input type="file" accept=".pdf" style={{ display:"none" }} onChange={e => uploadFichier("res_pdf_url", e.target.files[0], "pdf")} disabled={uploading["res_pdf_url"]}/>
          </label>
        </div>
      </div>

      {/* Champs texte */}
      {fields.map(group => (
        <div key={group.group} style={{ marginBottom:"28px" }}>
          <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--or)", marginBottom:"14px", paddingBottom:"8px", borderBottom:"1px solid var(--border)" }}>{group.group}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            {group.items.map(field => (
              <div key={field.cle} style={{ padding:"16px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"4px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                  <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--or)" }}>{field.label}</label>
                  <button className="admin-btn admin-btn-primary" onClick={() => save(field.cle)} style={{ padding:"6px 14px", opacity:saving[field.cle]?.7:1 }}>
                    {saving[field.cle] ? "..." : "Enregistrer"}
                  </button>
                </div>
                {(configs[field.cle] || "").length > 80 ? (
                  <textarea style={{...inputStyle, resize:"vertical", minHeight:"70px"}} value={configs[field.cle]||""} onChange={e=>set(field.cle,e.target.value)}/>
                ) : (
                  <input style={inputStyle} value={configs[field.cle]||""} onChange={e=>set(field.cle,e.target.value)}/>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}



/* ── LISTE D'ATTENTE ADMIN ──────────────────────────────────── */
function ListeAttenteView({ api, toast }) {
  const [liste,    setListe]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [notifying,setNotifying]=useState(false);
  const token = localStorage.getItem("mmorphose_token");

  useEffect(() => {
    fetch(API_URL + '/api/admin/liste-attente/', { headers:{"Authorization":`Bearer ${token}`} })
    .then(r=>r.json()).then(d=>{ setListe(Array.isArray(d)?d:[]); setLoading(false); })
    .catch(()=>setLoading(false));
  }, []);

  async function notifier() {
    if(!confirm(`Envoyer un email d'ouverture à ${liste.filter(p=>!p.notifie).length} personnes ?`)) return;
    setNotifying(true);
    const res = await fetch(API_URL + '/api/admin/liste-attente/notifier/', {
      method:"POST", headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},
      body: JSON.stringify({ url: window.location.origin })
    });
    const d = await res.json();
    toast(d.detail, "success");
    setNotifying(false);
  }

  const nonNotifiees = liste.filter(p=>!p.notifie).length;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <div>
          <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600 }}>Liste d'attente</h2>
          <p style={{ fontSize:".78rem", color:"var(--text-sub)", marginTop:"4px" }}>{liste.length} inscrites · {nonNotifiees} non notifiées</p>
        </div>
        {nonNotifiees > 0 && (
          <button className="admin-btn admin-btn-primary" onClick={notifier} disabled={notifying}>
            {notifying ? "Envoi..." : `Notifier ${nonNotifiees} personne${nonNotifiees>1?"s":""}`}
          </button>
        )}
      </div>
      {loading ? <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}}/></div> :
       liste.length === 0 ? <p style={{textAlign:"center",color:"var(--text-sub)",padding:"40px",fontStyle:"italic"}}>Aucune inscription.</p> :
       liste.map((p,i) => (
        <div key={i} className="row-item" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:600, fontSize:".85rem" }}>{p.prenom || "—"}</p>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".78rem", color:"var(--text-sub)" }}>{p.email}</p>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".7rem", color:"rgba(248,245,242,.3)" }}>{new Date(p.date).toLocaleDateString("fr-FR")}</p>
          </div>
          <span className={`badge ${p.notifie?"badge-or":"badge-rose"}`}>{p.notifie?"Notifiée":"En attente"}</span>
        </div>
      ))}
    </div>
  );
}


/* ── NEWSLETTER ADMIN ───────────────────────────────────────── */
function NewsletterView({ api, toast }) {
  const [sujet,  setSujet]  = useState("");
  const [message,setMessage]= useState("");
  const [cible,  setCible]  = useState("tous");
  const [sending,setSending]= useState(false);
  const token = localStorage.getItem("mmorphose_token");

  async function envoyer() {
    if(!sujet.trim()||!message.trim()){toast("Sujet et message requis","error");return;}
    if(!confirm(`Envoyer cet email à tous les membres (${cible}) ?`)) return;
    setSending(true);
    try {
      const res = await fetch(API_URL + '/api/admin/newsletter/', {
        method:"POST",
        headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},
        body: JSON.stringify({ sujet, message, cible })
      });
      const d = await res.json();
      toast(d.detail || "Envoyé", "success");
      setSujet(""); setMessage("");
    } catch { toast("Erreur serveur","error"); }
    setSending(false);
  }

  const inputStyle = { width:"100%", padding:"10px 14px", background:"rgba(255,255,255,.04)", border:"1px solid var(--border)", borderRadius:"3px", color:"var(--text)", fontFamily:"var(--ff-b)", fontSize:".82rem", fontWeight:300, outline:"none" };

  return (
    <div>
      <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600, marginBottom:"8px" }}>Newsletter</h2>
      <p style={{ fontSize:".82rem", color:"var(--text-sub)", marginBottom:"28px" }}>Envoyer un email groupé à vos membres.</p>

      <div style={{ display:"flex", flexDirection:"column", gap:"16px", maxWidth:"640px" }}>
        <div>
          <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--or)", display:"block", marginBottom:"6px" }}>Destinataires</label>
          <select style={inputStyle} value={cible} onChange={e=>setCible(e.target.value)}>
            <option value="tous">Tous les membres actifs</option>
            <option value="F1">Live · Groupe (F1)</option>
            <option value="F2">Live · Privé (F2)</option>
            <option value="F3">Présentiel · Groupe (F3)</option>
            <option value="F4">Présentiel · Privé (F4)</option>
          </select>
        </div>
        <div>
          <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--or)", display:"block", marginBottom:"6px" }}>Sujet *</label>
          <input style={inputStyle} value={sujet} onChange={e=>setSujet(e.target.value)} placeholder="Objet de l'email"/>
        </div>
        <div>
          <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--or)", display:"block", marginBottom:"6px" }}>Message *</label>
          <textarea style={{...inputStyle, resize:"vertical", minHeight:"200px"}} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Contenu de l'email..."/>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={envoyer} disabled={sending} style={{ padding:"14px", opacity:sending?.7:1 }}>
          {sending ? "Envoi en cours..." : "Envoyer la newsletter"}
        </button>
      </div>
    </div>
  );
}


/* ── EXPORT CSV ─────────────────────────────────────────────── */
function ExportView({ toast }) {
  const token = localStorage.getItem("mmorphose_token");

  function telecharger(url, nom) {
    fetch(url, { headers:{"Authorization":`Bearer ${token}`} })
    .then(r => r.blob())
    .then(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = nom;
      a.click();
      toast(`${nom} téléchargé`, "success");
    })
    .catch(() => toast("Erreur téléchargement","error"));
  }

  const exports = [
    { label:"Membres",    desc:"Tous les membres avec leurs informations",     url:API_URL + '/api/admin/export/membres/',  file:"membres_metamorphose.csv" },
    { label:"Demandes",   desc:"Toutes les demandes d'inscription reçues",     url:API_URL + '/api/admin/export/demandes/', file:"demandes_metamorphose.csv" },
    { label:"Témoignages",desc:"Témoignages approuvés avec notes et pays",     url:API_URL + '/api/admin/export/temoignages/', file:"temoignages_metamorphose.csv" },
    { label:"Liste attente",desc:"Personnes en liste d'attente",               url:API_URL + '/api/admin/export/attente/',  file:"liste_attente.csv" },
  ];

  return (
    <div>
      <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600, marginBottom:"8px" }}>Export CSV</h2>
      <p style={{ fontSize:".82rem", color:"var(--text-sub)", marginBottom:"28px" }}>Téléchargez vos données au format CSV, compatibles avec Excel.</p>
      <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
        {exports.map((e,i) => (
          <div key={i} className="row-item" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <p style={{ fontFamily:"var(--ff-b)", fontWeight:600, fontSize:".88rem", marginBottom:"3px" }}>{e.label}</p>
              <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".75rem", color:"var(--text-sub)" }}>{e.desc}</p>
            </div>
            <button className="admin-btn admin-btn-secondary" onClick={()=>telecharger(e.url,e.file)} style={{ padding:"10px 20px", flexShrink:0 }}>
              Télécharger
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ── MODE MAINTENANCE ───────────────────────────────────────── */
function MaintenanceView({ api, toast }) {
  const [actif,   setActif]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Le site est en maintenance. Revenez bientôt.");
  const token = localStorage.getItem("mmorphose_token");

  useEffect(() => {
    api("GET", "/config/").then(d => {
      if(d) {
        const maint = d.find(c=>c.cle==="maintenance_active");
        const msg   = d.find(c=>c.cle==="maintenance_message");
        if(maint) setActif(maint.valeur==="1");
        if(msg)   setMessage(msg.valeur);
      }
      setLoading(false);
    });
  }, []);

  async function toggle() {
    const nouvelEtat = !actif;
    if(nouvelEtat && !confirm("Activer le mode maintenance va rendre le site inaccessible aux visiteurs. Confirmer ?")) return;
    setActif(nouvelEtat);
    await fetch(API_URL + '/api/admin/maintenance/', {
      method:"POST",
      headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},
      body: JSON.stringify({ actif: nouvelEtat })
    });
    await api("POST","/config/update/",{cle:"maintenance_message",valeur:message,section:"systeme"});
    toast(nouvelEtat ? "Mode maintenance activé" : "Site remis en ligne", nouvelEtat?"error":"success");
  }

  if(loading) return <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}}/></div>;

  return (
    <div style={{ maxWidth:"560px" }}>
      <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600, marginBottom:"8px" }}>Mode Maintenance</h2>
      <p style={{ fontSize:".82rem", color:"var(--text-sub)", marginBottom:"28px" }}>Rendez le site temporairement inaccessible aux visiteurs.</p>

      {/* Status */}
      <div style={{ padding:"24px", background:actif?"rgba(239,83,80,.08)":"rgba(76,175,80,.08)", border:`1px solid ${actif?"rgba(239,83,80,.25)":"rgba(76,175,80,.25)"}`, borderRadius:"6px", marginBottom:"24px", textAlign:"center" }}>
        <p style={{ fontFamily:"var(--ff-b)", fontWeight:700, fontSize:"1.1rem", color:actif?"#ef5350":"#4CAF50", marginBottom:"6px" }}>
          {actif ? "Mode maintenance ACTIF" : "Site en ligne"}
        </p>
        <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".82rem", color:"var(--text-sub)" }}>
          {actif ? "Les visiteurs voient la page de maintenance." : "Le site est accessible normalement."}
        </p>
      </div>

      {/* Message */}
      <div style={{ marginBottom:"20px" }}>
        <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--or)", display:"block", marginBottom:"8px" }}>Message affiché aux visiteurs</label>
        <textarea value={message} onChange={e=>setMessage(e.target.value)}
          style={{ width:"100%", padding:"12px 14px", background:"rgba(255,255,255,.04)", border:"1px solid var(--border)", borderRadius:"3px", color:"var(--text)", fontFamily:"var(--ff-b)", fontSize:".82rem", fontWeight:300, outline:"none", resize:"vertical", minHeight:"80px" }}/>
      </div>

      <button onClick={toggle} style={{ width:"100%", padding:"15px", background:actif?"#4CAF50":"#ef5350", color:"#fff", border:"none", borderRadius:"3px", fontFamily:"var(--ff-b)", fontWeight:700, fontSize:".78rem", letterSpacing:".15em", textTransform:"uppercase", cursor:"pointer", transition:"all .3s" }}>
        {actif ? "Remettre le site en ligne" : "Activer le mode maintenance"}
      </button>

      <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".72rem", color:"rgba(248,245,242,.3)", textAlign:"center", marginTop:"12px", lineHeight:1.6 }}>
        Vous restez connecté en tant qu'admin et pouvez toujours accéder au site.
      </p>
    </div>
  );
}




/* ── MON COMPTE ADMIN ──────────────────────────────────────── */
function MonCompteView({ toast }) {
  const token = localStorage.getItem("mmorphose_token");
  const user  = JSON.parse(localStorage.getItem("mmorphose_user") || "null");
  const [email,       setEmail]       = useState(user?.email      || "");
  const [firstName,   setFirstName]   = useState(user?.first_name || "");
  const [lastName,    setLastName]    = useState(user?.last_name  || "");
  const [whatsapp,    setWhatsapp]    = useState(user?.whatsapp   || "");
  const [savingInfo,  setSavingInfo]  = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [savingPass,  setSavingPass]  = useState(false);
  const [showPwd,     setShowPwd]     = useState(false);

  async function saveInfo(e) {
    e.preventDefault();
    setSavingInfo(true);
    try {
      const res = await fetch(API_URL + '/api/auth/update-profile/', {
        method:"PATCH", headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},
        body: JSON.stringify({ email, first_name:firstName, last_name:lastName, whatsapp }),
      });
      if (res.ok) { const d=await res.json(); localStorage.setItem("mmorphose_user",JSON.stringify({...user,...d})); toast("Informations mises à jour","success"); }
      else { const d=await res.json(); toast(d.detail||"Erreur","error"); }
    } catch { toast("Erreur serveur","error"); }
    setSavingInfo(false);
  }

  async function savePassword(e) {
    e.preventDefault();
    if (newPassword.length < 8)      { toast("8 caractères minimum","error"); return; }
    if (newPassword !== confirmPass)  { toast("Mots de passe différents","error"); return; }
    setSavingPass(true);
    try {
      const res = await fetch(API_URL + '/api/auth/change-password/', {
        method:"POST", headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},
        body: JSON.stringify({ old_password:oldPassword, new_password:newPassword }),
      });
      if (res.ok) { toast("Mot de passe modifié","success"); setOldPassword(""); setNewPassword(""); setConfirmPass(""); }
      else { const d=await res.json(); toast(d.detail||"Ancien mot de passe incorrect","error"); }
    } catch { toast("Erreur serveur","error"); }
    setSavingPass(false);
  }

  const inp = { width:"100%", padding:"11px 14px", background:"rgba(255,255,255,.04)", border:"1px solid var(--border)", borderRadius:"3px", color:"var(--text)", fontFamily:"var(--ff-b)", fontSize:".85rem", fontWeight:300, outline:"none" };

  return (
    <div style={{ maxWidth:"560px" }}>
      <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600, marginBottom:"32px" }}>Mon Compte</h2>
      <div style={{ padding:"28px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"6px", marginBottom:"20px" }}>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--or)", marginBottom:"20px" }}>Informations</p>
        <form onSubmit={saveInfo} style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            <div><label style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"var(--text-sub)", display:"block", marginBottom:"5px" }}>Prénom</label><input style={inp} value={firstName} onChange={e=>setFirstName(e.target.value)}/></div>
            <div><label style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"var(--text-sub)", display:"block", marginBottom:"5px" }}>Nom</label><input style={inp} value={lastName} onChange={e=>setLastName(e.target.value)}/></div>
          </div>
          <div><label style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"var(--text-sub)", display:"block", marginBottom:"5px" }}>Email *</label><input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
          <div><label style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"var(--text-sub)", display:"block", marginBottom:"5px" }}>WhatsApp</label><input style={inp} value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="+229 01 XX XX XX"/></div>
          <button type="submit" disabled={savingInfo} className="admin-btn admin-btn-primary" style={{ padding:"12px", opacity:savingInfo?.7:1 }}>{savingInfo?"Enregistrement...":"Enregistrer"}</button>
        </form>
      </div>
      <div style={{ padding:"28px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"6px" }}>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--or)", marginBottom:"20px" }}>Mot de passe</p>
        <form onSubmit={savePassword} style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <div style={{ position:"relative" }}>
            <label style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"var(--text-sub)", display:"block", marginBottom:"5px" }}>Ancien mot de passe</label>
            <input style={{...inp,paddingRight:"60px"}} type={showPwd?"text":"password"} value={oldPassword} onChange={e=>setOldPassword(e.target.value)} required/>
            <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{ position:"absolute", right:"12px", bottom:"11px", background:"none", border:"none", color:"var(--text-sub)", cursor:"pointer", fontFamily:"var(--ff-b)", fontSize:".68rem" }}>{showPwd?"Cacher":"Voir"}</button>
          </div>
          <div><label style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"var(--text-sub)", display:"block", marginBottom:"5px" }}>Nouveau mot de passe</label><input style={inp} type={showPwd?"text":"password"} value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="8 caractères min." required/></div>
          <div>
            <label style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"var(--text-sub)", display:"block", marginBottom:"5px" }}>Confirmer</label>
            <input style={{...inp,borderColor:confirmPass&&confirmPass!==newPassword?"rgba(239,83,80,.5)":"var(--border)"}} type={showPwd?"text":"password"} value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} required/>
            {confirmPass && confirmPass!==newPassword && <p style={{ color:"#ef5350", fontFamily:"var(--ff-b)", fontSize:".72rem", marginTop:"4px" }}>Ne correspondent pas</p>}
          </div>
          <button type="submit" disabled={savingPass||(confirmPass&&confirmPass!==newPassword)} className="admin-btn admin-btn-secondary" style={{ padding:"12px", opacity:savingPass?.7:1 }}>{savingPass?"Modification...":"Changer le mot de passe"}</button>
        </form>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  usePageBackground("admin");
  const navigate = useNavigate();
  const [active,  setActive]  = useState("stats");
  const [stats,   setStats]   = useState({membres:0,actifs:0,demandes:0,non_traites:0,replays:0,guides:0,formules:{}});
  const [toasts,  setToasts]  = useState([]);
  const api = useAdminAPI();

  useEffect(() => {
    const token = localStorage.getItem("mmorphose_token");
    const user  = JSON.parse(localStorage.getItem("mmorphose_user") || "null");
    if (!token || !user) { navigate("/espace-membre"); return; }
    if (!user.is_staff)  { navigate("/dashboard"); return; }
    api("GET", "/stats/").then(d => { if(d) setStats(d); });
  }, []);

  function toast(msg, type="success") {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id!==id)), 3500);
  }

  const viewProps = { api, toast };

  return (
    <>
      <style>{STYLES}</style>
      <div className="admin-layout" style={{ display:"flex", minHeight:"100vh" }}>
        <Sidebar active={active} setActive={setActive} counts={stats} />
        <main className="admin-main" style={{ flex:1, overflow:"auto", padding:"40px 48px" }}>
          {active === "stats"       && <StatsView stats={stats} />}
          {active === "membres"     && <MembresView {...viewProps} />}
          {active === "demandes"    && <DemandesView {...viewProps} />}
          {active === "replays"     && <ReplaysView {...viewProps} />}
          {active === "guides"      && <GuidesView {...viewProps} />}
          {active === "config"      && <ConfigView {...viewProps} />}
          {active === "images"      && <ImagesView {...viewProps} />}
          {active === "cartes"      && <CartesView {...viewProps} />}
          {active === "temoignages" && <TemoignagesView {...viewProps} />}
          {active === "vague"        && <ConfigView {...viewProps} sectionFilter="vague" />}
          {active === "stats_site"   && <ConfigView {...viewProps} sectionFilter="stats_site" />}
          {active === "ressources"   && <RessourcesAdminView {...viewProps} />}
          {active === "liste_attente" && <ListeAttenteView {...viewProps} />}
          {active === "newsletter"    && <NewsletterView {...viewProps} />}
          {active === "export"        && <ExportView {...viewProps} />}
          {active === "maintenance"   && <MaintenanceView {...viewProps} />}
          {active === "mon_compte"     && <MonCompteView {...viewProps} />}
        </main>
      </div>
      <Toast toasts={toasts} />
    </>
  );
}
