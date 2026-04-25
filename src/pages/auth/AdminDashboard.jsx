import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../../context/AuthContext";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate, Link } from "react-router-dom";
import { learningAPI } from '../../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';

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
    max-height:85vh; overflow-y:auto;
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

const FORMULES = { F1:"ESSENTIELLE", F2:"PERSONNALISÉE", F3:"IMMERSION", F4:"VIP" };
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
  { id:"stats_site",  label:"Stats du site" },
  { id:"contact",     label:"WhatsApp & Contact" },
];

/* ── API helper ─────────────────────────────────────────────── */
function useAdminAPI() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();

  const call = useCallback(async (method, path, body = null) => {
    const opts = {
      method,
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
    };
    if (body) opts.body = JSON.stringify(body);
    const res = await fetch(`${API_BASE}/api/admin${path}`, opts);
    if (res.status === 401) { navigate("/espace-membre"); return null; }
    if (res.status === 204) return true;
    return res.json();
  }, [token, navigate]);

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
    { id:"notifications", label:"Notifications", icon:"🔔" },
    { id:"divider_admin", label:"── GESTION ──", divider:true },
    { id:"membres",  label:"Membres",        icon:"", count: counts.membres },
    { id:"demandes", label:"Demandes",       icon:"", count: counts.non_traites, urgent: true },
    { id:"replays",  label:"Replays",        icon:"",  count: counts.replays },
    { id:"guides",   label:"Guides PDF",     icon:"", count: counts.guides },
    { id:"config",         label:"Contenu du site" },
    { id:"vague",           label:"Vague & Places" },
    { id:"stats_site",      label:"Stats du site" },
    { id:"images",          label:"Photos et Logos" },
    { id:"cartes",          label:"Cartes Cadeaux" },
    { id:"temoignages",     label:"Témoignages", urgent:true },
    { id:"masterclass_admin", label:"Masterclasses" },
    { id:"temos_masterclass", label:"Témoignages Masterclass" },
    { id:"tickets",         label:"Tickets & Événements" },
    { id:"evt_admin",       label:"Événements" },
    { id:"actu_admin",      label:"Actualités" },
    { id:"live_visio",      label:"Live & Visio" },
    { id:"learning",        label:"MMO Learning" },
    { id:"store_admin",     label:"Store / Accès" },
    { id:"comm_admin",      label:"Communauté" },
    { id:"messagerie",      label:"Messagerie" },
    { id:"vagues",          label:"Planificateur vagues" },
    { id:"progression",     label:"Progression membres" },
    { id:"satisfaction",    label:"Satisfaction J+30" },
    { id:"agenda",          label:"Agenda coach" },
    { id:"partenaires",     label:"Partenaires" },
    { id:"ressources",      label:"Chanson et Guide PDF" },
    { id:"liens_paiement",  label:"Liens de paiement" },
    { id:"newsletter",      label:"Newsletter" },
    { id:"abonnes",         label:"Abonnés Newsletter" },
    { id:"liste_attente",   label:"Liste d'attente" },
    { id:"export",          label:"Export CSV" },
    { id:"maintenance",     label:"Mode Maintenance" },
    { id:"divider_membre", label:"── MON ESPACE ──", divider:true },
    { id:"mon_compte",      label:"Mon Compte" },
    { id:"mes_replays",     label:"Mes Replays" },
    { id:"mes_guides",      label:"Mes Guides PDF" },
    { id:"mon_temoignage",  label:"Mon Témoignage" },
    { id:"mon_profil",      label:"Mon Profil" },
    { id:"mon_certificat",  label:"Mon Certificat" },
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
        {tabs.map(t => {
          if (t.divider) return (
            <p key={t.id} style={{ fontFamily:"var(--ff-b)", fontSize:".52rem", letterSpacing:".2em", color:"rgba(248,245,242,.2)", padding:"16px 12px 4px", textTransform:"uppercase" }}>{t.label}</p>
          );
          return (
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
          );
        })}
      </nav>

      {/* Footer sidebar */}
      <div style={{ padding:"16px 20px", borderTop:"1px solid var(--border)" }}>
        <Link to="/" style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".12em", textTransform:"uppercase", color:"var(--text-sub)", textDecoration:"none", display:"block", marginBottom:"10px" }}>
           Voir le site
        </Link>
        <button onClick={() => { logout(); window.location.href="/espace-membre"; }}
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
  const PRIX = { F1:65000, F2:150000, F3:250000, F4:350000 };

  const cards = [
    { label:"Membres total",      value: stats.membres,         color:"var(--or)",   icon:"👥" },
    { label:"Membres actifs",     value: stats.actifs,          color:"var(--green)", icon:"✓" },
    { label:"Nouveaux (7 jours)", value: stats.nouveaux_7j||0,  color:"#A8C8E0",     icon:"🆕" },
    { label:"Non traitées",       value: stats.non_traites,     color:"#ef5350",     icon:"⚠" },
    { label:"Taux activation",    value: (stats.taux_activation||0)+'%', color:"var(--or)", icon:"📈" },
    { label:"Taux conversion",    value: (stats.taux_conversion||0)+'%', color:"var(--rose)", icon:"🎯" },
  ];

  const revenuFormate = stats.revenu_estime
    ? new Intl.NumberFormat('fr-FR').format(stats.revenu_estime) + ' FCFA'
    : '—';

  return (
    <div>
      <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600, marginBottom:"28px" }}>
        Vue d'ensemble
      </h2>

      {/* Stat cards */}
      <div className="stat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"14px", marginBottom:"24px" }}>
        {cards.map((c,i) => (
          <div key={i} className="stat-card" style={{ animationDelay:`${i*.07}s`, borderTop:`3px solid ${c.color}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
              <span style={{ fontSize:"1.2rem" }}>{c.icon}</span>
              <span style={{ fontFamily:"var(--ff-t)", fontSize:"2rem", fontWeight:700, color:c.color }}>{c.value}</span>
            </div>
            <p style={{ fontSize:".7rem", letterSpacing:".12em", textTransform:"uppercase", color:"var(--text-sub)" }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Revenu estimé */}
      <div className="stat-card" style={{ marginBottom:"20px", borderLeft:"4px solid var(--or)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontSize:".65rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--or)", marginBottom:"6px" }}>
              Revenu estimé (membres actifs)
            </p>
            <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.8rem", fontWeight:700, color:"var(--or)" }}>
              {revenuFormate}
            </p>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ fontSize:".65rem", color:"var(--text-sub)", marginBottom:"4px" }}>Nouveaux 30j</p>
            <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.4rem", fontWeight:700, color:"var(--green)" }}>
              +{stats.nouveaux_30j||0}
            </p>
          </div>
        </div>
      </div>

      {/* Répartition formules */}
      <div className="stat-card" style={{ marginBottom:"20px" }}>
        <p style={{ fontSize:".65rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--or)", marginBottom:"20px" }}>
          Répartition par formule
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px" }}>
          {Object.entries(FORMULES).map(([code, label]) => {
            const count = stats.formules?.[code] || 0;
            const revenu = count * (PRIX[code]||0);
            return (
              <div key={code} style={{ textAlign:"center", padding:"16px", background:"rgba(255,255,255,.03)", borderRadius:"4px" }}>
                <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.8rem", fontWeight:700, color:"var(--rose)", marginBottom:"4px" }}>{count}</p>
                <p style={{ fontSize:".68rem", color:"var(--text-sub)", fontWeight:300, marginBottom:"6px" }}>{label}</p>
                <p style={{ fontSize:".65rem", color:"var(--or)", fontWeight:500 }}>
                  {new Intl.NumberFormat('fr-FR').format(revenu)} FCFA
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tendance inscriptions */}
      {stats.inscriptions_mois && stats.inscriptions_mois.length > 0 && (
        <div className="stat-card">
          <p style={{ fontSize:".65rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--or)", marginBottom:"20px" }}>
            Tendance inscriptions (12 mois)
          </p>
          <div style={{ display:"flex", alignItems:"flex-end", gap:"6px", height:"80px" }}>
            {stats.inscriptions_mois.map((item, i) => {
              const max = Math.max(...stats.inscriptions_mois.map(x => x.total), 1);
              const h   = Math.max(4, (item.total / max) * 70);
              return (
                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" }}>
                  <span style={{ fontSize:".55rem", color:"var(--text-sub)" }}>{item.total}</span>
                  <div style={{ width:"100%", height:`${h}px`, background:"var(--rose)", borderRadius:"2px 2px 0 0", opacity:.8 }}/>
                  <span style={{ fontSize:".5rem", color:"var(--text-sub)", whiteSpace:"nowrap", overflow:"hidden", maxWidth:"100%" }}>
                    {item.mois?.slice(0,3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
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
    api("GET", "/membres/").then(d => { if(d) setMembres(Array.isArray(d) ? d : Array.isArray(d?.results) ? d.results : []); setLoading(false); });
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
                <a href="https://metamorphose-backend.onrender.com/admin" target="_blank" rel="noreferrer" style={{color:"var(--or)"}}>Accéder à l'admin Django</a>
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
    const sectionCible = sectionFilter || section;
    const created = await api("POST", "/config/update/", { cle, valeur, section: sectionCible });
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
      const token = localStorage.getItem("mmorphose_token")
      const formData = new FormData();
      formData.append("fichier", file);
      formData.append("cle", cle);
      formData.append("section", cle.startsWith("slide_") ? "slides" : "images");

      try {
        const res = await fetch(`${API_BASE}/api/admin/images/upload/`, {
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
    fetch(`${API_BASE}/api/cadeaux/admin/liste/`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("mmorphose_token")}` }
    })
    .then(r => { if (r.status === 401) { window.location.href="/espace-membre"; return null; } return r.json(); })
    .then(d => { if(d && Array.isArray(d)) setCartes(d); setLoading(false); })
    .catch(() => setLoading(false));
  }, []);

  async function activer(c) {
    const res = await fetch(`${API_BASE}/api/cadeaux/admin/${c.id}/activer/`, {
      method:"POST",
      headers:{ "Authorization": `Bearer ${localStorage.getItem("mmorphose_token")}`, "Content-Type":"application/json" }
    });
    if (res.status === 401) { window.location.href="/espace-membre"; return; }
    if (res.ok) {
      setCartes(p => p.map(x => x.id===c.id ? {...x, statut:"payee"} : x));
      toast("Carte activée", "success");
    }
  }

  async function marquerUtilisee(c) {
    const res = await fetch(`${API_BASE}/api/cadeaux/admin/${c.id}/utiliser/`, {
      method:"POST",
      headers:{ "Authorization": `Bearer ${localStorage.getItem("mmorphose_token")}`, "Content-Type":"application/json" }
    });
    if (res.status === 401) { window.location.href="/espace-membre"; return; }
    if (res.ok) {
      setCartes(p => p.map(x => x.id===c.id ? {...x, statut:"utilisee"} : x));
      toast("Carte marquée utilisée", "success");
      setSelected(null);
    }
  }

  const STATUT_COLORS = { en_attente:"var(--or)", payee:"var(--green)", utilisee:"rgba(248,245,242,.3)", expiree:"#ef5350" };
  const FORMULES_LABELS = { F1:"ESSENTIELLE", F2:"PERSONNALISÉE", F3:"IMMERSION", F4:"VIP" };

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
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", marginBottom:"24px" }}>
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
  const token = localStorage.getItem("mmorphose_token")

  const FORMULES = { F1:"ESSENTIELLE", F2:"PERSONNALISÉE", F3:"IMMERSION", F4:"VIP" };
  const TYPES    = { texte:"Texte", video:"Vidéo", audio:"Audio" };
  const TYPE_COLORS = { texte:"var(--or)", video:"#A8C8E0", audio:"var(--rose)" };

  function fetchTemos() {
    setLoading(true);
    fetch(`${API_BASE}/api/avis/admin/?statut=${filter}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(d => { setTemos(Array.isArray(d) ? d : Array.isArray(d?.results) ? d.results : []); setLoading(false); })
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
      const url    = modal === "add" ? `/api/avis/admin/ajouter/` : `/api/avis/admin/${selected.id}/modifier/`;
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
    const res = await fetch(`${API_BASE}/api/avis/admin/${id}/${type}/`, {
      method:"POST", headers:{ "Authorization": `Bearer ${token}` }
    });
    if (res.ok) { fetchTemos(); setModal(null); toast(type==="approuver"?"Approuvé":"Refusé", type==="approuver"?"success":"error"); }
  }

  async function supprimer(id) {
    if (!confirm("Supprimer ce témoignage ?")) return;
    const res = await fetch(`${API_BASE}/api/avis/admin/${id}/supprimer/`, {
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
    <PhotosMasterclassView toast={toast} />
    <TemoignagesMasterclassAdminView toast={toast} />
    </div>
  );
}



/* ── PHOTOS TÉMOIGNANTES MASTERCLASS ───────────────────────── */
function PhotosMasterclassView({ toast }) {
  const API_BASE = import.meta.env.VITE_API_URL || "https://metamorphose-backend.onrender.com";
  const token = localStorage.getItem("mmorphose_token");
  const [previews,  setPreviews]  = useState({});
  const [uploading, setUploading] = useState({});

  const TEMOS = [
    { cle:"masterclass_temo_photo_1", nom:"Georgine" },
    { cle:"masterclass_temo_photo_2", nom:"Marie" },
    { cle:"masterclass_temo_photo_3", nom:"Olivia" },
    { cle:"masterclass_temo_photo_4", nom:"Catherine" },
    { cle:"masterclass_temo_photo_5", nom:"Daniella" },
    { cle:"masterclass_temo_photo_6", nom:"Aminata" },
    { cle:"masterclass_temo_photo_7", nom:"Ginette" },
    { cle:"masterclass_temo_photo_8", nom:"La Reine" },
  ];

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/config/public/`)
      .then(r => r.json())
      .then(data => {
        if (!Array.isArray(data)) return;
        const map = {};
        data.forEach(c => { map[c.cle] = c.valeur; });
        const p = {};
        TEMOS.forEach(t => { if (map[t.cle]) p[t.cle] = map[t.cle]; });
        setPreviews(p);
      }).catch(() => {});
  }, []);

  async function handleUpload(cle, file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast("Fichier trop lourd (max 5MB)", "error"); return; }
    if (!file.type.startsWith("image/")) { toast("Seules les images sont acceptées", "error"); return; }
    setUploading(u => ({ ...u, [cle]: true }));
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result;
      setPreviews(p => ({ ...p, [cle]: base64 }));
      const formData = new FormData();
      formData.append("image", file);
      formData.append("cle", cle);
      formData.append("section", "masterclass");
      try {
        const res = await fetch(`${API_BASE}/api/admin/images/upload/`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData,
        });
        const data = await res.json();
        if (res.ok && data.url) {
          setPreviews(p => ({ ...p, [cle]: data.url }));
          toast("Photo uploadée avec succès", "success");
        } else {
          toast("Erreur lors de l'upload", "error");
        }
      } catch { toast("Erreur réseau", "error"); }
      setUploading(u => ({ ...u, [cle]: false }));
    };
    reader.readAsDataURL(file);
  }

  return (
    <div style={{ marginTop:"32px", paddingTop:"28px", borderTop:"1px solid var(--border)" }}>
      <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--or)", marginBottom:"16px", fontWeight:600 }}>
        Photos des témoignantes — Masterclass
      </p>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(140px,1fr))", gap:"14px" }}>
        {TEMOS.map(t => (
          <label key={t.cle} style={{ cursor:"pointer" }}>
            <div style={{ aspectRatio:"1", background:"rgba(255,255,255,.03)", border:`1px dashed ${previews[t.cle]?"rgba(201,169,106,.3)":"rgba(255,255,255,.1)"}`, borderRadius:"6px", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
              {uploading[t.cle] && (
                <div style={{ position:"absolute", inset:0, background:"rgba(0,0,0,.5)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <p style={{ color:"#fff", fontSize:".7rem" }}>Chargement...</p>
                </div>
              )}
              {previews[t.cle] ? (
                <img src={previews[t.cle]} alt={t.nom} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }}/>
              ) : (
                <div style={{ textAlign:"center", padding:"12px" }}>
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", color:"rgba(255,255,255,.3)", marginBottom:"4px" }}>{t.nom}</p>
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".58rem", color:"rgba(255,255,255,.2)" }}>Ajouter photo</p>
                </div>
              )}
            </div>
            {previews[t.cle] && (
              <p style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"var(--or)", textAlign:"center", marginTop:"4px" }}>{t.nom}</p>
            )}
            <input type="file" accept="image/*" style={{ display:"none" }} disabled={uploading[t.cle]} onChange={e => handleUpload(t.cle, e.target.files[0])}/>
          </label>
        ))}
      </div>
    </div>
  );
}

/* ── RESSOURCES ADMIN — Chanson + Guide PDF ─────────────────── */
function RessourcesAdminView({ api, toast }) {
  const [configs,   setConfigs]   = useState({});
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState({});
  const [uploading, setUploading] = useState({});
  const token = localStorage.getItem("mmorphose_token")

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
      const res = await fetch(`${API_BASE}/api/admin/images/upload/`, {
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
  const token = localStorage.getItem("mmorphose_token")

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/liste-attente/`, { headers:{"Authorization":`Bearer ${token}`} })
    .then(r=>r.json()).then(d=>{ setListe(Array.isArray(d)?d:[]); setLoading(false); })
    .catch(()=>setLoading(false));
  }, []);

  async function notifier() {
    if(!confirm(`Envoyer un email d'ouverture à ${liste.filter(p=>!p.notifie).length} personnes ?`)) return;
    setNotifying(true);
    const res = await fetch(`${API_BASE}/api/admin/liste-attente/notifier/`, {
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
  const token = localStorage.getItem("mmorphose_token")

  async function envoyer() {
    if(!sujet.trim()||!message.trim()){toast("Sujet et message requis","error");return;}
    if(!confirm(`Envoyer cet email à tous les membres (${cible}) ?`)) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/newsletter/`, {
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
            <option value="F1">ESSENTIELLE (F1)</option>
            <option value="F2">PERSONNALISÉE (F2)</option>
            <option value="F3">IMMERSION (F3)</option>
            <option value="F4">VIP (F4)</option>
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
  const token = localStorage.getItem("mmorphose_token")

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
    { label:"Membres",    desc:"Tous les membres avec leurs informations",     url:"/api/admin/export/membres/",  file:"membres_metamorphose.csv" },
    { label:"Demandes",   desc:"Toutes les demandes d'inscription reçues",     url:"/api/admin/export/demandes/", file:"demandes_metamorphose.csv" },
    { label:"Témoignages",desc:"Témoignages approuvés avec notes et pays",     url:"/api/admin/export/temoignages/", file:"temoignages_metamorphose.csv" },
    { label:"Liste attente",desc:"Personnes en liste d'attente",               url:"/api/admin/export/attente/",  file:"liste_attente.csv" },
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
  const token = localStorage.getItem("mmorphose_token")

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
    await fetch(`${API_BASE}/api/admin/maintenance/`, {
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
  const { token, user, updateUser } = useAuth();
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
      const res = await fetch(`${API_BASE}/api/auth/update-profile/`, {
        method:"PATCH", headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},
        body: JSON.stringify({ email, first_name:firstName, last_name:lastName, whatsapp }),
      });
      if (res.ok) { const d=await res.json(); updateUser({...user,...d}); toast("Informations mises à jour","success"); }
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
      const res = await fetch(`${API_BASE}/api/auth/change-password/`, {
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

function LiveAdminView({ api, toast }) {
  const [salles,  setSalles]  = useState([])
  const [loading, setLoading] = useState(true)
  const [form,    setForm]    = useState({ titre:'', description:'', mode:'reunion', mot_de_passe:'' })
  const [creating, setCreating] = useState(false)
  const token = localStorage.getItem('mmorphose_token')

  function load() {
    setLoading(true)
    fetch(`${API_BASE}/api/live/mes-salles/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json())
      .then(d => { setSalles(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function creer() {
    if (!form.titre.trim()) { toast('Titre requis', 'error'); return }
    setCreating(true)
    try {
      const res = await fetch(`${API_BASE}/api/live/creer/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        toast('Salle créée ✓', 'success')
        setForm({ titre:'', description:'', mode:'reunion', mot_de_passe:'' })
        load()
      } else toast(data.detail || 'Erreur', 'error')
    } catch { toast('Erreur serveur', 'error') }
    setCreating(false)
  }

  async function terminer(id) {
    if (!confirm('Terminer cette réunion ?')) return
    await fetch(`${API_BASE}/api/live/${id}/terminer/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    toast('Réunion terminée', 'success')
    load()
  }

  const inp = { width:'100%', padding:'10px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'3px', color:'var(--text)', fontFamily:'var(--ff-b)', fontSize:'.82rem', fontWeight:300, outline:'none' }
  const lbl = { fontFamily:'var(--ff-b)', fontSize:'.62rem', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--text-sub)', display:'block', marginBottom:'6px' }

  const MODES = { reunion:'Réunion', webinaire:'Webinaire', live:'Live' }
  const STATUT_COLOR = { attente:'var(--or)', active:'#4CAF50', terminee:'var(--text-sub)' }

  return (
    <div style={{ animation:'fadeUp .5s both' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' }}>
        <div>
          <h2 style={{ fontFamily:'var(--ff-t)', fontSize:'1.6rem', fontWeight:600 }}>Live & Visioconférence</h2>
          <p style={{ fontFamily:'var(--ff-b)', fontSize:'.78rem', color:'var(--text-sub)', marginTop:'4px' }}>Créez et gérez vos salles de réunion</p>
        </div>
      </div>

      {/* Créer une salle */}
      <div style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(201,169,106,.15)', borderRadius:'8px', padding:'24px', marginBottom:'32px' }}>
        <p style={{ fontFamily:'var(--ff-b)', fontSize:'.65rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--or)', marginBottom:'20px' }}>Nouvelle salle</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={lbl}>Titre *</label>
            <input style={inp} value={form.titre} onChange={e=>setForm(p=>({...p,titre:e.target.value}))} placeholder="Session coaching — Vague Printemps"/>
          </div>
          <div>
            <label style={lbl}>Mode</label>
            <select style={{...inp}} value={form.mode} onChange={e=>setForm(p=>({...p,mode:e.target.value}))}>
              <option value="reunion">Réunion</option>
              <option value="webinaire">Webinaire</option>
              <option value="live">Live</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Mot de passe (optionnel)</label>
            <input style={inp} value={form.mot_de_passe} onChange={e=>setForm(p=>({...p,mot_de_passe:e.target.value}))} placeholder="Laisser vide = public"/>
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={lbl}>Description (optionnelle)</label>
            <input style={inp} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Brève description de la session"/>
          </div>
        </div>
        <button onClick={creer} disabled={creating}
          style={{ marginTop:'16px', padding:'11px 24px', background:'var(--rose)', border:'none', borderRadius:'4px', color:'#fff', fontFamily:'var(--ff-b)', fontWeight:600, fontSize:'.75rem', letterSpacing:'.12em', textTransform:'uppercase', cursor:'pointer', opacity:creating?.6:1 }}>
          {creating ? 'Création...' : '+ Créer la salle'}
        </button>
      </div>

      {/* Liste des salles */}
      {loading ? (
        <p style={{ color:'var(--text-sub)', fontFamily:'var(--ff-b)' }}>Chargement...</p>
      ) : salles.length === 0 ? (
        <div style={{ padding:'48px', textAlign:'center', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'8px' }}>
          <p style={{ fontFamily:'var(--ff-t)', fontStyle:'italic', fontSize:'1.1rem', color:'rgba(248,245,242,.3)' }}>Aucune salle créée</p>
        </div>
      ) : salles.map(s => (
        <div key={s.id} style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'8px', padding:'20px 24px', marginBottom:'12px', display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:'200px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
              <p style={{ fontFamily:'var(--ff-b)', fontWeight:600, fontSize:'.92rem' }}>{s.titre}</p>
              <span style={{ padding:'2px 8px', borderRadius:'100px', background:`${STATUT_COLOR[s.statut]}20`, border:`1px solid ${STATUT_COLOR[s.statut]}40`, fontFamily:'var(--ff-b)', fontSize:'.58rem', color:STATUT_COLOR[s.statut], letterSpacing:'.1em', textTransform:'uppercase' }}>
                {s.statut}
              </span>
            </div>
            <p style={{ fontFamily:'var(--ff-b)', fontSize:'.72rem', color:'var(--text-sub)' }}>
              {MODES[s.mode]} · {s.participants} participant{s.participants!==1?'s':''} · {new Date(s.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/meeting/${s.id}`); toast('Lien copié ✓', 'success') }}
              style={{ padding:'8px 14px', background:'rgba(201,169,106,.08)', border:'1px solid rgba(201,169,106,.2)', borderRadius:'4px', color:'var(--or)', fontFamily:'var(--ff-b)', fontSize:'.68rem', cursor:'pointer' }}>
              📋 Copier le lien
            </button>
            <a href={`/meeting/${s.id}`} target="_blank" rel="noreferrer"
              style={{ padding:'8px 14px', background:'rgba(76,175,80,.08)', border:'1px solid rgba(76,175,80,.2)', borderRadius:'4px', color:'#4CAF50', fontFamily:'var(--ff-b)', fontSize:'.68rem', textDecoration:'none', display:'inline-flex', alignItems:'center' }}>
              🎥 Rejoindre
            </a>
            {s.statut !== 'terminee' && (
              <button onClick={() => terminer(s.id)}
                style={{ padding:'8px 14px', background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:'4px', color:'#f87171', fontFamily:'var(--ff-b)', fontSize:'.68rem', cursor:'pointer' }}>
                ⏹ Terminer
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

function EvenementsAdminView({ api, toast }) {
  const [evts,    setEvts]    = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState({})
  const [uploading, setUploading] = useState(false)
  const token = localStorage.getItem('mmorphose_token')

  function load() {
    setLoading(true)
    fetch(`${API_BASE}/api/evenements/admin/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json())
      .then(d => { setEvts(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  function openModal(item=null) {
    setEditing(item)
    setForm(item || { titre:'', badge:'', badge_color:'#C9A96A', date:'', lieu:'', description:'', bouton:'', lien:'', statut:'a_venir', ordre:0, actif:true })
    setModal(true)
  }
  function closeModal() { setModal(false); setEditing(null); setForm({}) }
  function set(k,v) { setForm(p=>({...p,[k]:v})) }

  async function uploadPhoto(file) {
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', 'metamorphose_unsigned')
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dp7v6vlgs/image/upload', { method:'POST', body:fd })
      const data = await res.json()
      if (data.secure_url) { set('photo', data.secure_url); toast('Photo uploadée ✓', 'success') }
      else toast('Erreur upload', 'error')
    } catch { toast('Erreur upload', 'error') }
    setUploading(false)
  }

  async function sauvegarder() {
    if (!form.titre) { toast('Titre requis', 'error'); return }
    const fd = new FormData()
    Object.entries(form).forEach(([k,v]) => { if (v !== null && v !== undefined) fd.append(k, v) })
    const url = editing ? `/api/evenements/admin/${editing.id}/` : `/api/evenements/admin/`
    const method = editing ? 'PATCH' : 'POST'
    try {
      const res = await fetch(url, { method, headers:{ 'Authorization':`Bearer ${token}` }, body:fd })
      if (res.ok) { toast(editing?'Mis à jour ✓':'Créé ✓', 'success'); closeModal(); load() }
      else toast('Erreur', 'error')
    } catch { toast('Erreur serveur', 'error') }
  }

  async function supprimer(id) {
    if (!confirm('Supprimer cet événement ?')) return
    await fetch(`${API_BASE}/api/evenements/admin/${id}/`, {
      method:'DELETE', headers:{ 'Authorization':`Bearer ${token}` }
    })
    toast('Supprimé', 'success'); load()
  }

  const inp = { width:'100%', padding:'10px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'3px', color:'var(--text)', fontFamily:'var(--ff-b)', fontSize:'.82rem', fontWeight:300, outline:'none' }
  const lbl = { fontFamily:'var(--ff-b)', fontSize:'.62rem', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--text-sub)', display:'block', marginBottom:'6px' }

  return (
    <div style={{ animation:'fadeUp .5s both' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' }}>
        <div>
          <h2 style={{ fontFamily:'var(--ff-t)', fontSize:'1.6rem', fontWeight:600 }}>Événements</h2>
          <p style={{ fontFamily:'var(--ff-b)', fontSize:'.78rem', color:'var(--text-sub)', marginTop:'4px' }}>{evts.length} événement{evts.length!==1?'s':''}</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={()=>openModal()}>+ Nouvel événement</button>
      </div>

      {loading ? <p style={{ color:'var(--text-sub)', fontFamily:'var(--ff-b)' }}>Chargement...</p>
      : evts.length === 0 ? (
        <div style={{ padding:'48px', textAlign:'center', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'8px' }}>
          <p style={{ fontFamily:'var(--ff-t)', fontStyle:'italic', color:'rgba(248,245,242,.3)' }}>Aucun événement</p>
        </div>
      ) : evts.map(e => (
        <div key={e.id} className="row-item" style={{ flexWrap:'wrap', gap:'12px', marginBottom:'10px' }}>
          {e.photo && <img src={e.photo} alt={e.titre} style={{ width:'60px', height:'40px', objectFit:'cover', borderRadius:'4px', flexShrink:0 }}/>}
          <div style={{ flex:1, minWidth:'160px' }}>
            <p style={{ fontFamily:'var(--ff-b)', fontWeight:500, fontSize:'.88rem', marginBottom:'4px' }}>{e.titre}</p>
            <p style={{ fontFamily:'var(--ff-b)', fontSize:'.72rem', color:'var(--text-sub)' }}>{e.date} · {e.lieu}</p>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button className="admin-btn admin-btn-secondary" onClick={()=>openModal(e)}>Modifier</button>
            <button className="admin-btn" style={{ background:'rgba(239,68,68,.1)', color:'#f87171', border:'1px solid rgba(239,68,68,.2)' }} onClick={()=>supprimer(e.id)}>Supprimer</button>
          </div>
        </div>
      ))}

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
          onClick={e=>{ if(e.target===e.currentTarget) closeModal() }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', padding:'32px', maxWidth:'560px', width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
            <h3 style={{ fontFamily:'var(--ff-t)', fontSize:'1.3rem', marginBottom:'24px' }}>{editing?'Modifier':'Nouvel événement'}</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div><label style={lbl}>Titre *</label><input style={inp} value={form.titre||''} onChange={e=>set('titre',e.target.value)} placeholder="Titre de l'événement"/></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div><label style={lbl}>Badge</label><input style={inp} value={form.badge||''} onChange={e=>set('badge',e.target.value)} placeholder="100% GRATUIT"/></div>
                <div><label style={lbl}>Couleur badge</label><input style={inp} value={form.badge_color||'#C9A96A'} onChange={e=>set('badge_color',e.target.value)} placeholder="#C9A96A"/></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div><label style={lbl}>Date</label><input style={inp} value={form.date||''} onChange={e=>set('date',e.target.value)} placeholder="Dimanche 26 avril"/></div>
                <div><label style={lbl}>Lieu</label><input style={inp} value={form.lieu||''} onChange={e=>set('lieu',e.target.value)} placeholder="En ligne"/></div>
              </div>
              <div><label style={lbl}>Description</label><textarea style={{...inp, minHeight:'100px', resize:'vertical'}} value={form.description||''} onChange={e=>set('description',e.target.value)}/></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div><label style={lbl}>Texte bouton</label><input style={inp} value={form.bouton||''} onChange={e=>set('bouton',e.target.value)} placeholder="Je m'inscris"/></div>
                <div><label style={lbl}>Lien bouton</label><input style={inp} value={form.lien||''} onChange={e=>set('lien',e.target.value)} placeholder="/masterclass"/></div>
              </div>
              <div>
                <label style={lbl}>Photo / Affiche</label>
                {form.photo && <img src={form.photo} alt="preview" style={{ width:'100%', height:'160px', objectFit:'cover', borderRadius:'4px', marginBottom:'8px' }}/>}
                <label style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'8px 14px', background:'rgba(201,169,106,.08)', border:'1px solid rgba(201,169,106,.2)', borderRadius:'3px', cursor:uploading?'not-allowed':'pointer', fontFamily:'var(--ff-b)', fontSize:'.68rem', color:'var(--or)', letterSpacing:'.1em', textTransform:'uppercase' }}>
                  {uploading ? 'Upload...' : '+ Uploader une photo'}
                  <input type="file" accept="image/*" style={{ display:'none' }} disabled={uploading} onChange={e=>uploadPhoto(e.target.files[0])}/>
                </label>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div><label style={lbl}>Statut</label>
                  <select style={inp} value={form.statut||'a_venir'} onChange={e=>set('statut',e.target.value)}>
                    <option value="a_venir">À venir</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                  </select>
                </div>
                <div><label style={lbl}>Ordre</label><input style={inp} type="number" value={form.ordre||0} onChange={e=>set('ordre',parseInt(e.target.value)||0)}/></div>
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px', marginTop:'24px' }}>
              <button className="admin-btn admin-btn-primary" onClick={sauvegarder} style={{ flex:1 }}>Enregistrer</button>
              <button className="admin-btn admin-btn-secondary" onClick={closeModal}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ActualitesAdminView({ api, toast }) {
  const [actus,   setActus]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState({})
  const [uploading, setUploading] = useState(false)
  const token = localStorage.getItem('mmorphose_token')

  function load() {
    setLoading(true)
    fetch(`${API_BASE}/api/evenements/actualites/admin/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json())
      .then(d => { setActus(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  function openModal(item=null) {
    setEditing(item)
    setForm(item || { titre:'', categorie:'', date:'', resume:'', bouton:'', lien:'', color:'#C9A96A', ordre:0, actif:true })
    setModal(true)
  }
  function closeModal() { setModal(false); setEditing(null); setForm({}) }
  function set(k,v) { setForm(p=>({...p,[k]:v})) }

  async function uploadPhoto(file) {
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', 'metamorphose_unsigned')
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dp7v6vlgs/image/upload', { method:'POST', body:fd })
      const data = await res.json()
      if (data.secure_url) { set('photo', data.secure_url); toast('Photo uploadée ✓', 'success') }
      else toast('Erreur upload', 'error')
    } catch { toast('Erreur upload', 'error') }
    setUploading(false)
  }

  async function sauvegarder() {
    if (!form.titre) { toast('Titre requis', 'error'); return }
    const fd = new FormData()
    Object.entries(form).forEach(([k,v]) => { if (v !== null && v !== undefined) fd.append(k, v) })
    const url = editing ? `/api/evenements/actualites/admin/${editing.id}/` : `/api/evenements/actualites/admin/`
    const method = editing ? 'PATCH' : 'POST'
    try {
      const res = await fetch(url, { method, headers:{ 'Authorization':`Bearer ${token}` }, body:fd })
      if (res.ok) { toast(editing?'Mis à jour ✓':'Créé ✓', 'success'); closeModal(); load() }
      else toast('Erreur', 'error')
    } catch { toast('Erreur serveur', 'error') }
  }

  async function supprimer(id) {
    if (!confirm('Supprimer cette actualité ?')) return
    await fetch(`${API_BASE}/api/evenements/actualites/admin/${id}/`, {
      method:'DELETE', headers:{ 'Authorization':`Bearer ${token}` }
    })
    toast('Supprimé', 'success'); load()
  }

  const inp = { width:'100%', padding:'10px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'3px', color:'var(--text)', fontFamily:'var(--ff-b)', fontSize:'.82rem', fontWeight:300, outline:'none' }
  const lbl = { fontFamily:'var(--ff-b)', fontSize:'.62rem', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--text-sub)', display:'block', marginBottom:'6px' }

  return (
    <div style={{ animation:'fadeUp .5s both' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' }}>
        <div>
          <h2 style={{ fontFamily:'var(--ff-t)', fontSize:'1.6rem', fontWeight:600 }}>Actualités</h2>
          <p style={{ fontFamily:'var(--ff-b)', fontSize:'.78rem', color:'var(--text-sub)', marginTop:'4px' }}>{actus.length} actualité{actus.length!==1?'s':''}</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={()=>openModal()}>+ Nouvelle actualité</button>
      </div>

      {loading ? <p style={{ color:'var(--text-sub)', fontFamily:'var(--ff-b)' }}>Chargement...</p>
      : actus.length === 0 ? (
        <div style={{ padding:'48px', textAlign:'center', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'8px' }}>
          <p style={{ fontFamily:'var(--ff-t)', fontStyle:'italic', color:'rgba(248,245,242,.3)' }}>Aucune actualité</p>
        </div>
      ) : actus.map(a => (
        <div key={a.id} className="row-item" style={{ flexWrap:'wrap', gap:'12px', marginBottom:'10px' }}>
          {a.photo && <img src={a.photo} alt={a.titre} style={{ width:'60px', height:'40px', objectFit:'cover', borderRadius:'4px', flexShrink:0 }}/>}
          <div style={{ flex:1, minWidth:'160px' }}>
            <p style={{ fontFamily:'var(--ff-b)', fontWeight:500, fontSize:'.88rem', marginBottom:'4px' }}>{a.titre}</p>
            <p style={{ fontFamily:'var(--ff-b)', fontSize:'.72rem', color:'var(--text-sub)' }}>{a.categorie} · {a.date}</p>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button className="admin-btn admin-btn-secondary" onClick={()=>openModal(a)}>Modifier</button>
            <button className="admin-btn" style={{ background:'rgba(239,68,68,.1)', color:'#f87171', border:'1px solid rgba(239,68,68,.2)' }} onClick={()=>supprimer(a.id)}>Supprimer</button>
          </div>
        </div>
      ))}

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
          onClick={e=>{ if(e.target===e.currentTarget) closeModal() }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', padding:'32px', maxWidth:'560px', width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
            <h3 style={{ fontFamily:'var(--ff-t)', fontSize:'1.3rem', marginBottom:'24px' }}>{editing?'Modifier':'Nouvelle actualité'}</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div><label style={lbl}>Titre *</label><input style={inp} value={form.titre||''} onChange={e=>set('titre',e.target.value)} placeholder="Titre de l'actualité"/></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div><label style={lbl}>Catégorie</label><input style={inp} value={form.categorie||''} onChange={e=>set('categorie',e.target.value)} placeholder="Formation"/></div>
                <div><label style={lbl}>Date</label><input style={inp} value={form.date||''} onChange={e=>set('date',e.target.value)} placeholder="Avril 2026"/></div>
              </div>
              <div><label style={lbl}>Résumé</label><textarea style={{...inp, minHeight:'100px', resize:'vertical'}} value={form.resume||''} onChange={e=>set('resume',e.target.value)}/></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div><label style={lbl}>Texte bouton</label><input style={inp} value={form.bouton||''} onChange={e=>set('bouton',e.target.value)} placeholder="Lire l'histoire"/></div>
                <div><label style={lbl}>Lien</label><input style={inp} value={form.lien||''} onChange={e=>set('lien',e.target.value)} placeholder="/evenements"/></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div><label style={lbl}>Couleur</label><input style={inp} value={form.color||'#C9A96A'} onChange={e=>set('color',e.target.value)} placeholder="#C9A96A"/></div>
                <div><label style={lbl}>Ordre</label><input style={inp} type="number" value={form.ordre||0} onChange={e=>set('ordre',parseInt(e.target.value)||0)}/></div>
              </div>
              <div>
                <label style={lbl}>Photo / Affiche</label>
                {form.photo && <img src={form.photo} alt="preview" style={{ width:'100%', height:'160px', objectFit:'cover', borderRadius:'4px', marginBottom:'8px' }}/>}
                <label style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'8px 14px', background:'rgba(201,169,106,.08)', border:'1px solid rgba(201,169,106,.2)', borderRadius:'3px', cursor:uploading?'not-allowed':'pointer', fontFamily:'var(--ff-b)', fontSize:'.68rem', color:'var(--or)', letterSpacing:'.1em', textTransform:'uppercase' }}>
                  {uploading ? 'Upload...' : '+ Uploader une photo'}
                  <input type="file" accept="image/*" style={{ display:'none' }} disabled={uploading} onChange={e=>uploadPhoto(e.target.files[0])}/>
                </label>
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px', marginTop:'24px' }}>
              <button className="admin-btn admin-btn-primary" onClick={sauvegarder} style={{ flex:1 }}>Enregistrer</button>
              <button className="admin-btn admin-btn-secondary" onClick={closeModal}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function CommunauteAdminView({ api, toast }) {
  const [cles,    setCles]    = useState([])
  const [loading, setLoading] = useState(true)
  const [email,   setEmail]   = useState("")
  const [generating, setGenerating] = useState(false)
  const token = localStorage.getItem('mmorphose_token')

  function load() {
    setLoading(true)
    fetch(`${API_BASE}/api/communaute/admin/cles/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json())
      .then(d => { setCles(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function generer() {
    if (!email.trim()) { toast('Email requis', 'error'); return }
    setGenerating(true)
    try {
      const res = await fetch(`${API_BASE}/api/communaute/admin/cles/generer/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (res.ok) {
        toast(`Clé générée : ${data.cle}`, 'success')
        setEmail('')
        load()
      } else toast(data.detail || 'Erreur', 'error')
    } catch { toast('Erreur serveur', 'error') }
    setGenerating(false)
  }

  async function toggleCle(id) {
    await fetch(`${API_BASE}/api/communaute/admin/cles/${id}/toggle/`, {
      method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` }
    })
    load()
  }

  const inp = { width:'100%', padding:'10px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'3px', color:'var(--text)', fontFamily:'var(--ff-b)', fontSize:'.82rem', fontWeight:300, outline:'none' }

  return (
    <div style={{ animation:'fadeUp .5s both' }}>
      <div style={{ marginBottom:'32px' }}>
        <h2 style={{ fontFamily:'var(--ff-t)', fontSize:'1.6rem', fontWeight:600 }}>Communauté MMO</h2>
        <p style={{ fontFamily:'var(--ff-b)', fontSize:'.78rem', color:'var(--text-sub)', marginTop:'4px' }}>Gestion des clés d'accès</p>
      </div>

      {/* Générer une clé */}
      <div style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(201,169,106,.15)', borderRadius:'8px', padding:'24px', marginBottom:'32px' }}>
        <p style={{ fontFamily:'var(--ff-b)', fontSize:'.65rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--or)', marginBottom:'16px' }}>Générer une clé d'accès</p>
        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
          <input style={{...inp, flex:1, minWidth:'240px'}} value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email de la membre" type="email"/>
          <button onClick={generer} disabled={generating}
            style={{ padding:'10px 24px', background:'var(--rose)', border:'none', borderRadius:'4px', color:'#fff', fontFamily:'var(--ff-b)', fontWeight:600, fontSize:'.75rem', letterSpacing:'.12em', textTransform:'uppercase', cursor:'pointer', opacity:generating?.6:1 }}>
            {generating ? 'Génération...' : 'Générer la clé'}
          </button>
        </div>
      </div>

      {/* Liste des clés */}
      {loading ? <p style={{ color:'var(--text-sub)', fontFamily:'var(--ff-b)' }}>Chargement...</p>
      : cles.length === 0 ? (
        <div style={{ padding:'48px', textAlign:'center', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'8px' }}>
          <p style={{ fontFamily:'var(--ff-t)', fontStyle:'italic', color:'rgba(248,245,242,.3)' }}>Aucune clé générée</p>
        </div>
      ) : cles.map(c => (
        <div key={c.id} className="row-item" style={{ flexWrap:'wrap', gap:'12px', marginBottom:'10px' }}>
          <div style={{ flex:1, minWidth:'200px' }}>
            <p style={{ fontFamily:'var(--ff-b)', fontWeight:500, fontSize:'.88rem', marginBottom:'4px' }}>{c.prenom || c.email}</p>
            <p style={{ fontFamily:'var(--ff-b)', fontSize:'.72rem', color:'var(--text-sub)', letterSpacing:'.05em' }}>{c.cle}</p>
            <p style={{ fontFamily:'var(--ff-b)', fontSize:'.65rem', color:'var(--text-sub)', marginTop:'2px' }}>
              Créée le {c.creee_le} {c.utilisee_le ? `· Utilisée le ${c.utilisee_le}` : '· Jamais utilisée'}
            </p>
          </div>
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            <span style={{ padding:'3px 10px', borderRadius:'100px', background:c.is_active?'rgba(76,175,80,.1)':'rgba(239,68,68,.1)', border:`1px solid ${c.is_active?'rgba(76,175,80,.3)':'rgba(239,68,68,.3)'}`, fontFamily:'var(--ff-b)', fontSize:'.6rem', color:c.is_active?'#4CAF50':'#f87171', letterSpacing:'.1em', textTransform:'uppercase' }}>
              {c.is_active ? 'Active' : 'Désactivée'}
            </span>
            <button onClick={()=>{ navigator.clipboard.writeText(c.cle); toast('Clé copiée ✓', 'success') }}
              style={{ padding:'7px 12px', background:'rgba(201,169,106,.08)', border:'1px solid rgba(201,169,106,.2)', borderRadius:'4px', color:'var(--or)', fontFamily:'var(--ff-b)', fontSize:'.65rem', cursor:'pointer' }}>
              Copier
            </button>
            <button onClick={()=>toggleCle(c.id)}
              style={{ padding:'7px 12px', background:c.is_active?'rgba(239,68,68,.08)':'rgba(76,175,80,.08)', border:`1px solid ${c.is_active?'rgba(239,68,68,.2)':'rgba(76,175,80,.2)'}`, borderRadius:'4px', color:c.is_active?'#f87171':'#4CAF50', fontFamily:'var(--ff-b)', fontSize:'.65rem', cursor:'pointer' }}>
              {c.is_active ? 'Désactiver' : 'Réactiver'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

function StoreAdminView({ toast }) {
  const [acces,    setAcces]    = useState([])
  const [cours,    setCours]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [email,    setEmail]    = useState("")
  const [coursId,  setCoursId]  = useState("")
  const [notes,    setNotes]    = useState("")
  const [saving,   setSaving]   = useState(false)
  const [filtreCours, setFiltreCours] = useState("")

  async function load() {
    setLoading(true)
    try {
      const [resAcces, resCours] = await Promise.all([
        learningAPI.adminListeAcces(filtreCours || undefined),
        learningAPI.listeCours(),
      ])
      setAcces(Array.isArray(resAcces.data) ? resAcces.data : [])
      setCours(Array.isArray(resCours.data) ? resCours.data : [])
    } catch { toast("Erreur chargement", "error") }
    setLoading(false)
  }
  useEffect(() => { load() }, [filtreCours])

  async function activer() {
    if (!email.trim() || !coursId) { toast("Email et cours requis", "error"); return }
    setSaving(true)
    try {
      const res = await learningAPI.adminActiverAcces({
        email, cours_id: parseInt(coursId),
        notes: notes || "Activation manuelle — Coach Prélia APEDO AHONON"
      })
      toast(res.data.detail || "Accès activé", "success")
      setEmail(""); setCoursId(""); setNotes("")
      load()
    } catch (e) {
      toast(e.response?.data?.detail || "Erreur", "error")
    }
    setSaving(false)
  }

  async function desactiver(email_u, cours_id) {
    if (!confirm(`Désactiver l'accès de ${email_u} ?`)) return
    try {
      await learningAPI.adminDesactiverAcces({ email: email_u, cours_id })
      toast("Accès désactivé", "success")
      load()
    } catch { toast("Erreur", "error") }
  }

  const inp = { width:"100%", padding:"10px 14px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"3px", color:"var(--text)", fontFamily:"var(--ff-b)", fontSize:".82rem", fontWeight:300, outline:"none" }
  const lbl = { fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".14em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }

  return (
    <div style={{ animation:"fadeUp .5s both" }}>
      <div style={{ marginBottom:"32px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.6rem", fontWeight:600 }}>Store — Gestion des accès</h2>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".78rem", color:"var(--text-sub)", marginTop:"4px" }}>
          Coach Prélia APEDO AHONON peut activer ou désactiver l'accès à chaque cours manuellement.
        </p>
      </div>

      {/* Activer un accès */}
      <div style={{ background:"rgba(255,255,255,.02)", border:"1px solid rgba(201,169,106,.15)", borderRadius:"8px", padding:"24px", marginBottom:"32px" }}>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--or)", marginBottom:"16px" }}>
          Activer un accès manuellement
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"14px" }}>
          <div>
            <label style={lbl}>Email de la membre *</label>
            <input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="membre@email.com"/>
          </div>
          <div>
            <label style={lbl}>Cours *</label>
            <select style={inp} value={coursId} onChange={e=>setCoursId(e.target.value)}>
              <option value="">Sélectionner un cours</option>
              {cours.map(c => <option key={c.id} value={c.id}>{c.titre}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom:"14px" }}>
          <label style={lbl}>Notes (optionnel)</label>
          <input style={inp} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Ex: Paiement reçu par virement le 15/04/2026"/>
        </div>
        <button onClick={activer} disabled={saving}
          style={{ padding:"11px 28px", background:"var(--or)", border:"none", borderRadius:"4px", color:"#0A0A0A", fontFamily:"var(--ff-b)", fontWeight:700, fontSize:".75rem", letterSpacing:".12em", textTransform:"uppercase", cursor:saving?"not-allowed":"pointer", opacity:saving?.6:1 }}>
          {saving ? "Activation..." : "Activer l'accès"}
        </button>
      </div>

      {/* Filtre */}
      <div style={{ display:"flex", gap:"12px", alignItems:"center", marginBottom:"20px", flexWrap:"wrap" }}>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--text-sub)" }}>
          Filtrer par cours
        </p>
        <select style={{...inp, width:"auto", minWidth:"200px"}} value={filtreCours} onChange={e=>setFiltreCours(e.target.value)}>
          <option value="">Tous les cours</option>
          {cours.map(c => <option key={c.id} value={c.id}>{c.titre}</option>)}
        </select>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".72rem", color:"var(--text-sub)" }}>
          {acces.length} accès
        </p>
      </div>

      {/* Liste des accès */}
      {loading ? (
        <p style={{ color:"var(--text-sub)", fontFamily:"var(--ff-b)" }}>Chargement...</p>
      ) : acces.length === 0 ? (
        <div style={{ padding:"48px", textAlign:"center", background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.05)", borderRadius:"8px" }}>
          <p style={{ fontFamily:"var(--ff-t)", fontStyle:"italic", color:"rgba(248,245,242,.3)" }}>Aucun accès trouvé</p>
        </div>
      ) : acces.map(a => (
        <div key={a.id} className="row-item" style={{ flexWrap:"wrap", gap:"12px", marginBottom:"10px" }}>
          <div style={{ flex:1, minWidth:"200px" }}>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:500, fontSize:".88rem", marginBottom:"4px" }}>
              {a.prenom ? `${a.prenom} — ` : ""}{a.email}
            </p>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".72rem", color:"var(--text-sub)" }}>
              {a.cours} · {a.source} · {a.created_at}
            </p>
            {a.notes && <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", color:"rgba(201,169,106,.5)", marginTop:"2px" }}>{a.notes}</p>}
          </div>
          <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
            <span style={{ padding:"3px 10px", borderRadius:"100px", background:a.actif?"rgba(76,175,80,.1)":"rgba(239,68,68,.1)", border:`1px solid ${a.actif?"rgba(76,175,80,.3)":"rgba(239,68,68,.3)"}`, fontFamily:"var(--ff-b)", fontSize:".6rem", color:a.actif?"#4CAF50":"#f87171", letterSpacing:".1em", textTransform:"uppercase" }}>
              {a.actif ? "Actif" : "Inactif"}
            </span>
            {a.actif && (
              <button onClick={()=>desactiver(a.email, a.cours_id)}
                style={{ padding:"7px 12px", background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", borderRadius:"4px", color:"#f87171", fontFamily:"var(--ff-b)", fontSize:".65rem", cursor:"pointer" }}>
                Désactiver
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [active,  setActive]  = useState("stats");
  const [stats,   setStats]   = useState({membres:0,actifs:0,demandes:0,non_traites:0,replays:0,guides:0,formules:{}});
  const [toasts,  setToasts]  = useState([]);
  const api = useAdminAPI();

  useEffect(() => {
    const token = localStorage.getItem("mmorphose_token")
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
          {active === "tickets"         && <TicketsView {...viewProps} />}
          {active === "partenaires"     && <PartenairesView {...viewProps} />}
          {active === "learning"        && <LearningView {...viewProps} />}
          {active === "abonnes"         && <AbonnesView {...viewProps} />}
          {active === "live_visio"      && <LiveAdminView {...viewProps} />}
          {active === "evt_admin"       && <EvenementsAdminView {...viewProps} />}
          {active === "actu_admin"      && <ActualitesAdminView {...viewProps} />}
          {active === "comm_admin"      && <CommunauteAdminView {...viewProps} />}
          {active === "store_admin"     && <StoreAdminView {...viewProps} />}
          {active === "masterclass_admin" && <MasterclassAdminView {...viewProps} />}
          {active === "temos_masterclass" && <TemoignagesMasterclassAdminView toast={toast} />}
          {active === "liens_paiement"   && <ConfigView {...viewProps} sectionFilter="paiement" />}
          {active === "mes_replays"     && <MesReplaysView {...viewProps} />}
          {active === "mes_guides"      && <MesGuidesView {...viewProps} />}
          {active === "mon_temoignage"  && <MonTemoignageView {...viewProps} />}
          {active === "mon_profil"      && <MonProfilView {...viewProps} />}
          {active === "mon_certificat"  && <MonCertificatView {...viewProps} />}
          {active === "mon_compte"      && <MonCompteView {...viewProps} />}
          {active === "notifications"    && <NotificationsView {...viewProps} />}
          {active === "messagerie"       && <MessageriView {...viewProps} />}
          {active === "vagues"           && <VaguesView {...viewProps} />}
          {active === "progression"      && <ProgressionView {...viewProps} />}
          {active === "satisfaction"     && <SatisfactionView {...viewProps} />}
          {active === "agenda"           && <AgendaView {...viewProps} />}
        </main>
      </div>
      <Toast toasts={toasts} />
    </>
  );
}

/* ================================================================
   MMO LEARNING VIEW — Gestion des cours et catégories
   ================================================================ */
function LearningView({ api, toast }) {
  const [onglet,     setOnglet]     = useState('cours')
  const [cours,      setCours]      = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(null)
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState({})
  const token = localStorage.getItem('mmorphose_token')
  const [uploadingField, setUploadingField] = useState({})
  const CLOUD = 'dp7v6vlgs'
  const PRESET = 'metamorphose_unsigned'

  async function uploadCloud(file, fieldKey, resourceType='auto') {
    setUploadingField(p=>({...p,[fieldKey]:true}))
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', PRESET)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/${resourceType}/upload`, {method:'POST',body:fd})
    const data = await res.json()
    setUploadingField(p=>({...p,[fieldKey]:false}))
    return data.secure_url || ''
  }

  function apiL(method, path, body=null) {
    const opts = { method, headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'} }
    if (body) opts.body = JSON.stringify(body)
    return fetch(`${API_BASE}/api/learning/admin${path}`, opts).then(r => {
      if (r.status === 401) { window.location.href = '/espace-membre'; return null; }
      return r.status === 204 ? true : r.json()
    })
  }

  function load() {
    setLoading(true)
    Promise.all([apiL('GET','/cours/'), apiL('GET','/categories/')]).then(([c,cat]) => {
      setCours(Array.isArray(c)?c:[]); setCategories(Array.isArray(cat)?cat:[]); setLoading(false)
    }).catch(()=>setLoading(false))
  }
  useEffect(()=>{load()},[])

  function slugify(s) {
    return s.toLowerCase()
      .replace(/[àâä]/g,'a').replace(/[éèêë]/g,'e').replace(/[îï]/g,'i')
      .replace(/[ôö]/g,'o').replace(/[ùûü]/g,'u').replace(/ç/g,'c')
      .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
  }

  function openModal(type, item=null) {
    setModal(type); setEditing(item)
    setForm(type==='cours'
      ? (item || {titre:'',slug:'',description:'',format:'texte',contenu:'',video_url:'',audio_url:'',pdf_url:'',duree:'',niveau:'debutant',image:'',semaine:'',actif:true,en_vedette:false,ordre:0,categorie:null,prix:0,lien_achat:''})
      : (item || {nom:'',slug:'',icone:'✦',couleur:'#C9A96A',ordre:0}))
  }
  function closeModal() { setModal(null); setEditing(null); setForm({}) }
  function set(k,v) { setForm(p=>{ const n={...p,[k]:v}; if(k==='titre'&&!editing) n.slug=slugify(v); if(k==='nom'&&!editing) n.slug=slugify(v); return n }) }

  async function sauvegarder() {
    const payload = {...form}
    if (!payload.semaine) delete payload.semaine
    try {
      const res = editing
        ? await apiL('PATCH', modal==='cours'?`/cours/${editing.id}/`:`/categories/${editing.id}/`, payload)
        : await apiL('POST',  modal==='cours'?'/cours/':'/categories/', payload)
      if (res && !res.detail) { toast(editing?'Mis à jour ✓':'Créé ✓','success'); closeModal(); load() }
      else toast(res?.detail||'Erreur','error')
    } catch { toast('Erreur serveur','error') }
  }

  async function supprimer(type, id) {
    if (!confirm('Supprimer ?')) return
    await apiL('DELETE', type==='cours'?`/cours/${id}/`:`/categories/${id}/`)
    toast('Supprimé','success'); load()
  }

  const inp = { width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',fontWeight:300,outline:'none' }
  const lbl = { fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-sub)',display:'block',marginBottom:'6px' }
  const FMTS = {texte:'📖 Article',video:'🎬 Vidéo',audio:'🎵 Audio',pdf:'📄 PDF'}
  const NVLS = {debutant:'Débutant',intermediaire:'Intermédiaire',avance:'Avancé'}

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600}}>MMO Learning</h2>
          <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginTop:'4px'}}>{cours.length} cours · {categories.length} catégories</p>
        </div>
        <div style={{display:'flex',gap:'10px'}}>
          <button className="admin-btn admin-btn-secondary" onClick={()=>openModal('categorie')}>+ Catégorie</button>
          <button className="admin-btn admin-btn-primary"   onClick={()=>openModal('cours')}>+ Nouveau cours</button>
        </div>
      </div>

      <div style={{display:'flex',gap:'4px',marginBottom:'24px',background:'rgba(255,255,255,.03)',borderRadius:'4px',padding:'4px',width:'fit-content'}}>
        {[['cours',`Cours (${cours.length})`],['categories',`Catégories (${categories.length})`]].map(([id,label])=>(
          <button key={id} onClick={()=>setOnglet(id)} style={{padding:'8px 18px',borderRadius:'3px',border:'none',cursor:'pointer',fontFamily:'var(--ff-b)',fontSize:'.68rem',fontWeight:500,letterSpacing:'.1em',textTransform:'uppercase',background:onglet===id?'var(--rose)':'transparent',color:onglet===id?'#fff':'var(--text-sub)',transition:'all .25s'}}>{label}</button>
        ))}
      </div>

      {onglet==='cours' && (loading
        ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p>
        : cours.length===0
          ? <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
              <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',fontSize:'1.1rem',color:'rgba(248,245,242,.3)',marginBottom:'16px'}}>Aucun cours pour l'instant</p>
              <button className="admin-btn admin-btn-primary" onClick={()=>openModal('cours')}>Créer le premier cours</button>
            </div>
          : cours.map(c=>(
            <div key={c.id} className="row-item" style={{flexWrap:'wrap',gap:'12px'}}>
              <div style={{flex:1,minWidth:'200px'}}>
                <p style={{fontFamily:'var(--ff-b)',fontWeight:500,fontSize:'.88rem',marginBottom:'4px'}}>{c.titre}</p>
                <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                  <span className="badge badge-or">{FMTS[c.format]}</span>
                  {c.semaine && <span className="badge badge-or">S{c.semaine}</span>}
                  <span className={`badge ${c.actif?'badge-green':'badge-red'}`}>{c.actif?'Actif':'Inactif'}</span>
                  {c.en_vedette && <span className="badge badge-rose">★ Vedette</span>}
                  {c.categorie_nom && <span className="badge badge-or">{c.categorie_nom}</span>}
                </div>
              </div>
              {c.duree && <span style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)'}}>⏱ {c.duree}</span>}
              <div style={{display:'flex',gap:'8px'}}>
                <button className="admin-btn admin-btn-secondary" onClick={()=>openModal('cours',c)}>Modifier</button>
                <button className="admin-btn admin-btn-danger"    onClick={()=>supprimer('cours',c.id)}>Supprimer</button>
              </div>
            </div>
          ))
      )}

      {onglet==='categories' && (categories.length===0
        ? <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
            <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',fontSize:'1.1rem',color:'rgba(248,245,242,.3)',marginBottom:'16px'}}>Aucune catégorie</p>
            <button className="admin-btn admin-btn-primary" onClick={()=>openModal('categorie')}>Créer une catégorie</button>
          </div>
        : categories.map(cat=>(
          <div key={cat.id} className="row-item">
            <span style={{fontSize:'1.4rem'}}>{cat.icone}</span>
            <div style={{flex:1}}>
              <p style={{fontFamily:'var(--ff-b)',fontWeight:500,fontSize:'.88rem'}}>{cat.nom}</p>
              <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.72rem',color:'var(--text-sub)'}}>{cat.nb_cours} cours · /{cat.slug}</p>
            </div>
            <div style={{width:'12px',height:'12px',borderRadius:'50%',background:cat.couleur}}/>
            <div style={{display:'flex',gap:'8px'}}>
              <button className="admin-btn admin-btn-secondary" onClick={()=>openModal('categorie',cat)}>Modifier</button>
              <button className="admin-btn admin-btn-danger"    onClick={()=>supprimer('categorie',cat.id)}>Supprimer</button>
            </div>
          </div>
        ))
      )}

      {modal==='cours' && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&closeModal()}>
          <div className="modal-box" style={{maxWidth:'640px'}}>
            <h3 style={{fontFamily:'var(--ff-t)',fontSize:'1.3rem',marginBottom:'24px'}}>{editing?'Modifier':'Nouveau cours'}</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Format *</label>
                  <select value={form.format||'texte'} onChange={e=>set('format',e.target.value)} style={inp}>
                    {Object.entries(FMTS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select></div>
                <div><label style={lbl}>Niveau</label>
                  <select value={form.niveau||'debutant'} onChange={e=>set('niveau',e.target.value)} style={inp}>
                    {Object.entries(NVLS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select></div>
              </div>
              <div><label style={lbl}>Titre *</label><input style={inp} value={form.titre||''} onChange={e=>set('titre',e.target.value)} placeholder="Titre du cours"/></div>
              <div><label style={lbl}>Slug</label><input style={inp} value={form.slug||''} onChange={e=>set('slug',e.target.value)} placeholder="mon-cours"/></div>
              <div><label style={lbl}>Description *</label><textarea style={{...inp,minHeight:'80px',resize:'vertical'}} value={form.description||''} onChange={e=>set('description',e.target.value)} placeholder="Description courte affichée sur la carte"/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Catégorie</label>
                  <select value={form.categorie||''} onChange={e=>set('categorie',e.target.value||null)} style={inp}>
                    <option value="">Sans catégorie</option>
                    {categories.map(c=><option key={c.id} value={c.id}>{c.icone} {c.nom}</option>)}
                  </select></div>
                <div><label style={lbl}>Semaine (1-8)</label><input style={inp} type="number" min="1" max="8" value={form.semaine||''} onChange={e=>set('semaine',e.target.value)} placeholder="ex: 3"/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Durée</label><input style={inp} value={form.duree||''} onChange={e=>set('duree',e.target.value)} placeholder="ex: 15 min"/></div>
                <div><label style={lbl}>Ordre</label><input style={inp} type="number" value={form.ordre||0} onChange={e=>set('ordre',parseInt(e.target.value)||0)}/></div>
              </div>
              <div>
                <label style={lbl}>Image couverture</label>
                {form.image && <img src={form.image} alt="" style={{width:'100%',height:'120px',objectFit:'cover',borderRadius:'4px',marginBottom:'8px'}}/>}
                <label style={{display:'block',padding:'10px',background:'rgba(201,169,106,.06)',border:'1px dashed rgba(201,169,106,.3)',borderRadius:'3px',cursor:uploadingField.image?'not-allowed':'pointer',textAlign:'center',fontFamily:'var(--ff-b)',fontSize:'.68rem',color:'var(--or)',letterSpacing:'.1em',textTransform:'uppercase'}}>
                  {uploadingField.image ? 'Upload...' : form.image ? "Changer l'image" : 'Choisir une image'}
                  <input type="file" accept="image/*" style={{display:'none'}} disabled={uploadingField.image} onChange={async e=>{if(e.target.files[0]){const url=await uploadCloud(e.target.files[0],'image','image');set('image',url)}}}/>
                </label>
                {form.image && <input style={{...inp,marginTop:'6px',fontSize:'.7rem'}} value={form.image} onChange={e=>set('image',e.target.value)} placeholder="ou coller une URL"/>}
              </div>
              {(form.format==='video'||form.format==='texte') && <div>
                <label style={lbl}>Vidéo (upload ou URL YouTube)</label>
                <label style={{display:'block',padding:'10px',background:'rgba(194,24,91,.06)',border:'1px dashed rgba(194,24,91,.3)',borderRadius:'3px',cursor:uploadingField.video?'not-allowed':'pointer',textAlign:'center',fontFamily:'var(--ff-b)',fontSize:'.68rem',color:'var(--rose)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:'6px'}}>
                  {uploadingField.video ? 'Upload en cours...' : form.video_url ? 'Changer la vidéo' : 'Uploader une vidéo'}
                  <input type="file" accept="video/*" style={{display:'none'}} disabled={uploadingField.video} onChange={async e=>{if(e.target.files[0]){const url=await uploadCloud(e.target.files[0],'video','video');set('video_url',url)}}}/>
                </label>
                <input style={inp} value={form.video_url||''} onChange={e=>set('video_url',e.target.value)} placeholder="ou coller un lien YouTube/Vimeo..."/>
              </div>}
              {form.format==='audio' && <div>
                <label style={lbl}>Fichier Audio (MP3)</label>
                {form.audio_url && <audio controls src={form.audio_url} style={{width:'100%',marginBottom:'8px'}}/>}
                <label style={{display:'block',padding:'10px',background:'rgba(201,169,106,.06)',border:'1px dashed rgba(201,169,106,.3)',borderRadius:'3px',cursor:uploadingField.audio?'not-allowed':'pointer',textAlign:'center',fontFamily:'var(--ff-b)',fontSize:'.68rem',color:'var(--or)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:'6px'}}>
                  {uploadingField.audio ? 'Upload en cours...' : form.audio_url ? "Changer l'audio" : 'Uploader un fichier audio'}
                  <input type="file" accept="audio/*" style={{display:'none'}} disabled={uploadingField.audio} onChange={async e=>{if(e.target.files[0]){const url=await uploadCloud(e.target.files[0],'audio','video');set('audio_url',url)}}}/>
                </label>
                <input style={inp} value={form.audio_url||''} onChange={e=>set('audio_url',e.target.value)} placeholder="ou coller une URL audio"/>
              </div>}
              {form.format==='pdf' && <div>
                <label style={lbl}>Fichier PDF</label>
                {form.pdf_url && <a href={form.pdf_url} target="_blank" rel="noreferrer" style={{display:'block',fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--or)',marginBottom:'8px'}}>Voir le PDF actuel</a>}
                <label style={{display:'block',padding:'10px',background:'rgba(201,169,106,.06)',border:'1px dashed rgba(201,169,106,.3)',borderRadius:'3px',cursor:uploadingField.pdf?'not-allowed':'pointer',textAlign:'center',fontFamily:'var(--ff-b)',fontSize:'.68rem',color:'var(--or)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:'6px'}}>
                  {uploadingField.pdf ? 'Upload en cours...' : form.pdf_url ? 'Changer le PDF' : 'Uploader un PDF'}
                  <input type="file" accept=".pdf" style={{display:'none'}} disabled={uploadingField.pdf} onChange={async e=>{if(e.target.files[0]){const url=await uploadCloud(e.target.files[0],'pdf','raw');set('pdf_url',url)}}}/>
                </label>
                <input style={inp} value={form.pdf_url||''} onChange={e=>set('pdf_url',e.target.value)} placeholder="ou coller une URL PDF"/>
              </div>}
              <div><label style={lbl}>Contenu texte (HTML accepté)</label><textarea style={{...inp,minHeight:'140px',resize:'vertical',fontFamily:'monospace',fontSize:'.78rem'}} value={form.contenu||''} onChange={e=>set('contenu',e.target.value)} placeholder="<p>Votre contenu...</p>"/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Prix (FCFA) — 0 = gratuit</label><input style={inp} type="number" min="0" value={form.prix||0} onChange={e=>set('prix',parseInt(e.target.value)||0)} placeholder="ex: 25000"/></div>
                <div><label style={lbl}>Lien de paiement externe</label><input style={inp} value={form.lien_achat||''} onChange={e=>set('lien_achat',e.target.value)} placeholder="https://lien-paiement.com/..."/></div>
              </div>
              <div style={{display:'flex',gap:'16px'}}>
                <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer'}}><input type="checkbox" checked={!!form.actif} onChange={e=>set('actif',e.target.checked)}/><span style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)'}}>Actif (visible)</span></label>
                <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer'}}><input type="checkbox" checked={!!form.en_vedette} onChange={e=>set('en_vedette',e.target.checked)}/><span style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)'}}>En vedette</span></label>
              </div>
              <div style={{display:'flex',gap:'10px',justifyContent:'flex-end',marginTop:'8px'}}>
                <button className="admin-btn admin-btn-secondary" onClick={closeModal}>Annuler</button>
                <button className="admin-btn admin-btn-primary"   onClick={sauvegarder}>{editing?'Enregistrer':'Créer le cours'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal==='categorie' && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&closeModal()}>
          <div className="modal-box" style={{maxWidth:'480px'}}>
            <h3 style={{fontFamily:'var(--ff-t)',fontSize:'1.3rem',marginBottom:'24px'}}>{editing?'Modifier':'Nouvelle catégorie'}</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div><label style={lbl}>Nom *</label><input style={inp} value={form.nom||''} onChange={e=>set('nom',e.target.value)} placeholder="ex: Confiance en soi"/></div>
              <div><label style={lbl}>Slug</label><input style={inp} value={form.slug||''} onChange={e=>set('slug',e.target.value)}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Icône emoji</label><input style={inp} value={form.icone||'✦'} onChange={e=>set('icone',e.target.value)} placeholder="💪"/></div>
                <div><label style={lbl}>Couleur</label>
                  <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                    <input type="color" value={form.couleur||'#C9A96A'} onChange={e=>set('couleur',e.target.value)} style={{width:'44px',height:'38px',border:'none',borderRadius:'3px',cursor:'pointer'}}/>
                    <input style={{...inp,flex:1}} value={form.couleur||'#C9A96A'} onChange={e=>set('couleur',e.target.value)}/>
                  </div>
                </div>
              </div>
              <div><label style={lbl}>Ordre</label><input style={inp} type="number" value={form.ordre||0} onChange={e=>set('ordre',parseInt(e.target.value)||0)}/></div>
              <div style={{display:'flex',gap:'10px',justifyContent:'flex-end',marginTop:'8px'}}>
                <button className="admin-btn admin-btn-secondary" onClick={closeModal}>Annuler</button>
                <button className="admin-btn admin-btn-primary"   onClick={sauvegarder}>{editing?'Enregistrer':'Créer'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================================================================
   PARTENAIRES VIEW
   ================================================================ */
function PartenairesView({ api, toast }) {
  const [partenaires, setPartenaires] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [modal,       setModal]       = useState(false)
  const [editing,     setEditing]     = useState(null)
  const [form,        setForm]        = useState({})
  const token = localStorage.getItem('mmorphose_token')

  function apiP(method, path, body=null) {
    const opts = { method, headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'} }
    if (body) opts.body = JSON.stringify(body)
    return fetch(`${API_BASE}/api/admin/partenaires${path}`, opts).then(r => {
      if (r.status === 401) { window.location.href = '/espace-membre'; return null; }
      return r.status === 204 ? true : r.json()
    })
  }

  function load() {
    setLoading(true)
    apiP('GET','/').then(d => { setPartenaires(Array.isArray(d)?d:[]); setLoading(false) }).catch(()=>setLoading(false))
  }
  useEffect(()=>{load()},[])

  const [uploadingLogo, setUploadingLogo] = useState(false)

  async function uploadLogo(file) {
    if (!file) return
    setUploadingLogo(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', 'metamorphose_unsigned')
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dp7v6vlgs/image/upload', { method:'POST', body:fd })
      const data = await res.json()
      if (data.secure_url) { set('logo', data.secure_url); toast('Logo uploadé ✓', 'success') }
      else toast('Erreur upload', 'error')
    } catch { toast('Erreur upload', 'error') }
    setUploadingLogo(false)
  }

  function openModal(item=null) {
    setEditing(item)
    setForm(item || {nom:'', logo:'', lien:'', ordre:0, actif:true})
    setModal(true)
  }
  function closeModal() { setModal(false); setEditing(null); setForm({}) }
  function set(k,v) { setForm(p=>({...p,[k]:v})) }

  async function sauvegarder() {
    if (!form.nom) { toast('Le nom est requis','error'); return }
    try {
      const res = editing
        ? await apiP('PATCH', `/${editing.id}/`, form)
        : await apiP('POST', '/', form)
      if (res && !res.detail) {
        toast(editing ? 'Partenaire mis à jour ✓' : 'Partenaire ajouté ✓', 'success')
        closeModal(); load()
      } else toast(res?.detail || 'Erreur', 'error')
    } catch { toast('Erreur serveur', 'error') }
  }

  async function supprimer(id) {
    if (!confirm('Supprimer ce partenaire ?')) return
    await apiP('DELETE', `/${id}/`)
    toast('Supprimé', 'success'); load()
  }

  async function toggleActif(p) {
    await apiP('PATCH', `/${p.id}/`, {...p, actif: !p.actif})
    load()
  }

  const inp = {width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',fontWeight:300,outline:'none'}
  const lbl = {fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-sub)',display:'block',marginBottom:'6px'}

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600}}>Partenaires</h2>
          <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginTop:'4px'}}>
            {partenaires.length} partenaire{partenaires.length!==1?'s':''} · Affichés dans le footer
          </p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={()=>openModal()}>+ Nouveau partenaire</button>
      </div>

      {loading ? (
        <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p>
      ) : partenaires.length === 0 ? (
        <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
          <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',fontSize:'1.1rem',color:'rgba(248,245,242,.3)',marginBottom:'16px'}}>Aucun partenaire</p>
          <button className="admin-btn admin-btn-primary" onClick={()=>openModal()}>Ajouter le premier partenaire</button>
        </div>
      ) : partenaires.map(p => (
        <div key={p.id} className="row-item" style={{flexWrap:'wrap',gap:'12px'}}>
          {/* Logo */}
          <div style={{width:'60px',height:'40px',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,.04)',borderRadius:'4px',flexShrink:0}}>
            {p.logo
              ? <img src={p.logo} alt={p.nom} style={{maxWidth:'56px',maxHeight:'36px',objectFit:'contain'}}/>
              : <span style={{fontFamily:'var(--ff-b)',fontSize:'.6rem',color:'var(--text-sub)'}}>Logo</span>
            }
          </div>

          {/* Info */}
          <div style={{flex:1,minWidth:'160px'}}>
            <p style={{fontFamily:'var(--ff-b)',fontWeight:500,fontSize:'.88rem',marginBottom:'4px'}}>{p.nom}</p>
            {p.lien && (
              <a href={p.lien} target="_blank" rel="noreferrer" style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'rgba(201,169,106,.5)',textDecoration:'none'}}>
                {p.lien.replace('https://','').replace('http://','').split('/')[0]}
              </a>
            )}
          </div>

          {/* Statut */}
          <span className={`badge ${p.actif?'badge-green':'badge-red'}`}>{p.actif?'Actif':'Inactif'}</span>

          {/* Actions */}
          <div style={{display:'flex',gap:'8px'}}>
            <button className={`admin-btn ${p.actif?'admin-btn-secondary':'admin-btn-success'}`}
              onClick={()=>toggleActif(p)}>
              {p.actif ? 'Désactiver' : 'Activer'}
            </button>
            <button className="admin-btn admin-btn-secondary" onClick={()=>openModal(p)}>Modifier</button>
            <button className="admin-btn admin-btn-danger" onClick={()=>supprimer(p.id)}>Supprimer</button>
          </div>
        </div>
      ))}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&closeModal()}>
          <div className="modal-box" style={{maxWidth:'480px'}}>
            <h3 style={{fontFamily:'var(--ff-t)',fontSize:'1.3rem',marginBottom:'24px'}}>
              {editing ? 'Modifier le partenaire' : 'Nouveau partenaire'}
            </h3>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div><label style={lbl}>Nom *</label>
                <input style={inp} value={form.nom||''} onChange={e=>set('nom',e.target.value)} placeholder="Nom du partenaire"/>
              </div>
              <div>
                <label style={lbl}>Logo du partenaire</label>
                <input style={{...inp, marginBottom:'8px'}} value={form.logo||''} onChange={e=>set('logo',e.target.value)} placeholder="URL du logo (https://...)"/>
                <label style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'8px 14px',background:'rgba(201,169,106,.08)',border:'1px solid rgba(201,169,106,.2)',borderRadius:'3px',cursor:uploadingLogo?'not-allowed':'pointer',fontFamily:'var(--ff-b)',fontSize:'.68rem',color:'var(--or)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:'8px'}}>
                  {uploadingLogo ? 'Upload en cours...' : '+ Uploader un fichier'}
                  <input type="file" accept="image/*" style={{display:'none'}} disabled={uploadingLogo} onChange={e=>uploadLogo(e.target.files[0])}/>
                </label>
                <p style={{fontFamily:'var(--ff-b)',fontSize:'.6rem',color:'var(--text-sub)',marginBottom:'6px'}}>Saisissez une URL ou uploadez directement un fichier image</p>
                {form.logo && (
                  <div style={{padding:'8px',background:'rgba(255,255,255,.04)',borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',height:'60px'}}>
                    <img src={form.logo} alt="preview" style={{maxHeight:'52px',maxWidth:'100%',objectFit:'contain'}}/>
                  </div>
                )}
              </div>
              <div><label style={lbl}>Lien vers leur site</label>
                <input style={inp} value={form.lien||''} onChange={e=>set('lien',e.target.value)} placeholder="https://leur-site.com"/>
              </div>
              <div><label style={lbl}>Ordre d'affichage</label>
                <input style={inp} type="number" value={form.ordre||0} onChange={e=>set('ordre',parseInt(e.target.value)||0)}/>
              </div>
              <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer'}}>
                <input type="checkbox" checked={!!form.actif} onChange={e=>set('actif',e.target.checked)}/>
                <span style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)'}}>Actif (visible dans le footer)</span>
              </label>
              <div style={{display:'flex',gap:'10px',justifyContent:'flex-end',marginTop:'8px'}}>
                <button className="admin-btn admin-btn-secondary" onClick={closeModal}>Annuler</button>
                <button className="admin-btn admin-btn-primary" onClick={sauvegarder}>
                  {editing ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================================================================
   TICKETS VIEW — Gestion événements et tickets
   ================================================================ */
function TicketsView({ api, toast }) {
  const [onglet,     setOnglet]     = useState('evenements')
  const [evenements, setEvenements] = useState([])
  const [tickets,    setTickets]    = useState([])
  const [selEv,      setSelEv]      = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState({})
  const token = localStorage.getItem('mmorphose_token')

  function apiT(method, path, body=null) {
    const opts = { method, headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'} }
    if (body) opts.body = JSON.stringify(body)
    return fetch(`${API_BASE}/api/tickets${path}`, opts).then(r => r.status===204 ? true : r.json())
  }

  function loadEvenements() {
    setLoading(true)
    apiT('GET','/admin/evenements/').then(d=>{setEvenements(Array.isArray(d)?d:[]);setLoading(false)}).catch(()=>setLoading(false))
  }

  function loadTickets(evId=null) {
    setLoading(true)
    const url = evId ? `/admin/tickets/?evenement=${evId}` : '/admin/tickets/'
    apiT('GET',url).then(d=>{setTickets(Array.isArray(d)?d:[]);setLoading(false)}).catch(()=>setLoading(false))
  }

  useEffect(()=>{ loadEvenements() },[])

  function slugify(s) {
    return s.toLowerCase()
      .replace(/[àâä]/g,'a').replace(/[éèêë]/g,'e').replace(/[îï]/g,'i')
      .replace(/[ôö]/g,'o').replace(/[ùûü]/g,'u').replace(/ç/g,'c')
      .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
  }

  function openModal(item=null) {
    setEditing(item)
    setForm(item || {nom:'',slug:'',description:'',date:'',lieu:'',places_total:50,prix:0,image:'',actif:true})
    setModal(true)
  }
  function closeModal() { setModal(false); setEditing(null); setForm({}) }
  function set(k,v) { setForm(p=>{ const n={...p,[k]:v}; if(k==='nom'&&!editing) n.slug=slugify(v); return n }) }

  async function sauvegarder() {
    if (!form.nom || !form.date) { toast('Nom et date requis','error'); return }
    try {
      const res = editing
        ? await apiT('PATCH',`/admin/evenements/${editing.id}/`,form)
        : await apiT('POST','/admin/evenements/',form)
      if (res && !res.detail) { toast(editing?'Mis à jour ✓':'Créé ✓','success'); closeModal(); loadEvenements() }
      else toast(res?.detail||'Erreur','error')
    } catch { toast('Erreur serveur','error') }
  }

  async function supprimerEv(id) {
    if (!confirm('Supprimer cet événement et tous ses tickets ?')) return
    await apiT('DELETE',`/admin/evenements/${id}/`)
    toast('Supprimé','success'); loadEvenements()
  }

  async function annulerTicket(id) {
    if (!confirm('Annuler ce ticket ?')) return
    await apiT('PATCH',`/admin/tickets/${id}/`,{statut:'annule'})
    toast('Ticket annulé','success')
    loadTickets(selEv)
  }

  function voirTickets(ev) {
    setSelEv(ev.id); setOnglet('tickets'); loadTickets(ev.id)
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})
  }

  const STATUT_COLORS = {valide:'badge-green',scanne:'badge-or',annule:'badge-red'}
  const inp = {width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',fontWeight:300,outline:'none'}
  const lbl = {fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-sub)',display:'block',marginBottom:'6px'}

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600}}>Tickets Événements</h2>
          <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginTop:'4px'}}>{evenements.length} événement{evenements.length!==1?'s':''}</p>
        </div>
        <div style={{display:'flex',gap:'10px'}}>
          {onglet==='evenements' && (
            <button className="admin-btn admin-btn-primary" onClick={()=>openModal()}>+ Nouvel événement</button>
          )}
          <a href="/scan" target="_blank" style={{padding:'9px 18px',borderRadius:'3px',background:'rgba(201,169,106,.1)',border:'1px solid rgba(201,169,106,.25)',color:'var(--or)',fontFamily:'var(--ff-b)',fontSize:'.7rem',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',textDecoration:'none'}}>
            📷 Scanner QR
          </a>
        </div>
      </div>

      {/* Onglets */}
      <div style={{display:'flex',gap:'4px',marginBottom:'24px',background:'rgba(255,255,255,.03)',borderRadius:'4px',padding:'4px',width:'fit-content'}}>
        {[['evenements','Événements'],['tickets','Tickets']].map(([id,label])=>(
          <button key={id} onClick={()=>{ setOnglet(id); if(id==='tickets'){ loadTickets(selEv) } else { loadEvenements() } }}
            style={{padding:'8px 18px',borderRadius:'3px',border:'none',cursor:'pointer',fontFamily:'var(--ff-b)',fontSize:'.68rem',fontWeight:500,letterSpacing:'.1em',textTransform:'uppercase',background:onglet===id?'var(--rose)':'transparent',color:onglet===id?'#fff':'var(--text-sub)',transition:'all .25s'}}>
            {label}
          </button>
        ))}
      </div>

      {/* Liste événements */}
      {onglet==='evenements' && (
        loading ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p> :
        evenements.length===0 ? (
          <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
            <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',fontSize:'1.1rem',color:'rgba(248,245,242,.3)',marginBottom:'16px'}}>Aucun événement</p>
            <button className="admin-btn admin-btn-primary" onClick={()=>openModal()}>Créer le premier événement</button>
          </div>
        ) : evenements.map(ev=>(
          <div key={ev.id} className="row-item" style={{flexWrap:'wrap',gap:'12px'}}>
            <div style={{flex:1,minWidth:'200px'}}>
              <p style={{fontFamily:'var(--ff-b)',fontWeight:500,fontSize:'.88rem',marginBottom:'4px'}}>{ev.nom}</p>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center'}}>
                <span style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--or)'}}>{formatDate(ev.date)}</span>
                {ev.lieu && <span style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)'}}>· {ev.lieu}</span>}
              </div>
              <div style={{display:'flex',gap:'8px',marginTop:'6px'}}>
                <span className={`badge ${ev.actif?'badge-green':'badge-red'}`}>{ev.actif?'Actif':'Inactif'}</span>
                <span className="badge badge-or">{ev.nb_tickets||0}/{ev.places_total} places</span>
                {ev.prix===0 ? <span className="badge badge-green">Gratuit</span> : <span className="badge badge-or">{ev.prix?.toLocaleString()} FCFA</span>}
              </div>
            </div>
            <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
              <button className="admin-btn admin-btn-secondary" onClick={()=>voirTickets(ev)}>Tickets ({ev.nb_tickets||0})</button>
              <button className="admin-btn admin-btn-secondary" onClick={()=>openModal(ev)}>Modifier</button>
              <button className="admin-btn admin-btn-danger" onClick={()=>supprimerEv(ev.id)}>Supprimer</button>
            </div>
          </div>
        ))
      )}

      {/* Liste tickets */}
      {onglet==='tickets' && (
        <>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px',flexWrap:'wrap'}}>
            <select value={selEv||''} onChange={e=>{setSelEv(e.target.value||null);loadTickets(e.target.value||null)}}
              style={{padding:'8px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.78rem',outline:'none'}}>
              <option value="">Tous les événements</option>
              {evenements.map(ev=><option key={ev.id} value={ev.id}>{ev.nom}</option>)}
            </select>
            <span style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)'}}>{tickets.length} ticket{tickets.length!==1?'s':''}</span>
          </div>

          {loading ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p> :
          tickets.length===0 ? (
            <div style={{padding:'40px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
              <p style={{fontFamily:'var(--ff-b)',fontSize:'.85rem',color:'rgba(248,245,242,.3)'}}>Aucun ticket pour cet événement</p>
            </div>
          ) : tickets.map(t=>(
            <div key={t.id} className="row-item" style={{flexWrap:'wrap',gap:'12px'}}>
              <div style={{flex:1,minWidth:'180px'}}>
                <p style={{fontFamily:'var(--ff-b)',fontWeight:500,fontSize:'.85rem',marginBottom:'4px'}}>{t.nom_complet}</p>
                <p style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)',marginBottom:'4px'}}>{t.email}</p>
                <p style={{fontFamily:'var(--ff-b)',fontSize:'.7rem',color:'rgba(248,245,242,.25)',fontFamily:'monospace'}}>{String(t.code).substring(0,8).toUpperCase()}</p>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'4px',alignItems:'flex-end'}}>
                <span className={`badge ${STATUT_COLORS[t.statut]||'badge-or'}`}>
                  {t.statut==='valide'?'✓ Valide':t.statut==='scanne'?'📷 Scanné':'✕ Annulé'}
                </span>
                <span style={{fontFamily:'var(--ff-b)',fontSize:'.65rem',color:'var(--text-sub)'}}>{new Date(t.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              {t.statut !== 'annule' && (
                <button className="admin-btn admin-btn-danger" onClick={()=>annulerTicket(t.id)}>Annuler</button>
              )}
            </div>
          ))}
        </>
      )}

      {/* Modal événement */}
      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&closeModal()}>
          <div className="modal-box" style={{maxWidth:'560px'}}>
            <h3 style={{fontFamily:'var(--ff-t)',fontSize:'1.3rem',marginBottom:'24px'}}>{editing?'Modifier':'Nouvel événement'}</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div><label style={lbl}>Nom *</label><input style={inp} value={form.nom||''} onChange={e=>set('nom',e.target.value)} placeholder="Nom de l'événement"/></div>
              <div><label style={lbl}>Slug</label><input style={inp} value={form.slug||''} onChange={e=>set('slug',e.target.value)}/></div>
              <div><label style={lbl}>Description</label><textarea style={{...inp,minHeight:'80px',resize:'vertical'}} value={form.description||''} onChange={e=>set('description',e.target.value)}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Date et heure *</label><input style={inp} type="datetime-local" value={form.date||''} onChange={e=>set('date',e.target.value)}/></div>
                <div><label style={lbl}>Lieu</label><input style={inp} value={form.lieu||''} onChange={e=>set('lieu',e.target.value)} placeholder="Cotonou, Bénin"/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Places totales</label><input style={inp} type="number" value={form.places_total||50} onChange={e=>set('places_total',parseInt(e.target.value)||50)}/></div>
                <div><label style={lbl}>Prix (FCFA, 0=gratuit)</label><input style={inp} type="number" value={form.prix||0} onChange={e=>set('prix',parseInt(e.target.value)||0)}/></div>
              </div>
              <div><label style={lbl}>Image (URL)</label><input style={inp} value={form.image||''} onChange={e=>set('image',e.target.value)} placeholder="https://..."/></div>
              <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer'}}>
                <input type="checkbox" checked={!!form.actif} onChange={e=>set('actif',e.target.checked)}/>
                <span style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)'}}>Événement actif (visible)</span>
              </label>
              <div style={{display:'flex',gap:'10px',justifyContent:'flex-end',marginTop:'8px'}}>
                <button className="admin-btn admin-btn-secondary" onClick={closeModal}>Annuler</button>
                <button className="admin-btn admin-btn-primary" onClick={sauvegarder}>{editing?'Enregistrer':'Créer'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================================================================
   ABONNÉS NEWSLETTER VIEW
   ================================================================ */
function AbonnesView({ api, toast }) {
  const [abonnes,  setAbonnes]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [recherche,setRecherche]= useState('')
  const token = localStorage.getItem('mmorphose_token')

  function apiA(method, path, body=null) {
    const opts = { method, headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'} }
    if (body) opts.body = JSON.stringify(body)
    return fetch(`${API_BASE}/api/contenu/newsletter${path}`, opts).then(r => r.status===204?true:r.json())
  }

  function load() {
    setLoading(true)
    // Charger les abonnés newsletter via l'export CSV admin
    fetch(`${API_BASE}/api/admin/export/abonnes/`, {
      headers:{'Authorization':`Bearer ${token}`}
    })
    .then(r => r.ok ? r.text() : Promise.reject())
    .then(csv => {
      const lines = csv.split('\n').slice(1).filter(Boolean)
      const data  = lines.map(l => {
        const parts = l.split(',')
        return {
          email:  parts[0]?.replace(/"/g,'').trim(),
          prenom: parts[1]?.replace(/"/g,'').trim(),
          actif:  parts[2]?.replace(/"/g,'').trim() === 'Oui',
          date:   parts[3]?.replace(/"/g,'').trim(),
        }
      }).filter(a => a.email)
      setAbonnes(data)
      setLoading(false)
    })
    .catch(() => { setAbonnes([]); setLoading(false) })
  }

  useEffect(()=>{ load() },[])

  const filtres = abonnes.filter(a =>
    !recherche || a.email?.toLowerCase().includes(recherche.toLowerCase()) ||
    a.prenom?.toLowerCase().includes(recherche.toLowerCase())
  )
  const actifs = abonnes.filter(a => a.actif).length

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600}}>Abonnés Newsletter</h2>
          <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginTop:'4px'}}>
            {actifs} abonné{actifs!==1?'s':''} actif{actifs!==1?'s':''}
          </p>
        </div>
        <a href="/api/admin/export/abonnes/" target="_blank"
          style={{padding:'9px 18px',borderRadius:'3px',background:'rgba(201,169,106,.1)',border:'1px solid rgba(201,169,106,.25)',color:'var(--or)',fontFamily:'var(--ff-b)',fontSize:'.7rem',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',textDecoration:'none'}}>
          Exporter CSV
        </a>
      </div>

      <input placeholder="Rechercher par email ou prénom..."
        value={recherche} onChange={e=>setRecherche(e.target.value)}
        style={{width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',fontWeight:300,outline:'none',marginBottom:'20px'}}
      />

      {loading ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p> :
      filtres.length===0 ? (
        <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
          <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',fontSize:'1.1rem',color:'rgba(248,245,242,.3)'}}>Aucun abonné</p>
        </div>
      ) : filtres.map((a,i) => (
        <div key={i} className="row-item" style={{gap:'12px'}}>
          <div style={{flex:1}}>
            <p style={{fontFamily:'var(--ff-b)',fontWeight:500,fontSize:'.85rem'}}>{a.email}</p>
            {a.prenom && <p style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)',marginTop:'2px'}}>{a.prenom}</p>}
          </div>
          <span className={`badge ${a.actif?'badge-green':'badge-red'}`}>{a.actif?'Actif':'Désabonné'}</span>
          {a.date && <span style={{fontFamily:'var(--ff-b)',fontSize:'.68rem',color:'var(--text-sub)'}}>{a.date?.substring(0,10)}</span>}
        </div>
      ))}
    </div>
  )
}
function MesReplaysView({ api, toast }) {
  const [replays, setReplays] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const token = localStorage.getItem('mmorphose_token')
    fetch(`${API_BASE}/api/contenu/replays/`, { headers:{ 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setReplays(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(() => setLoading(false))
  },[])

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600,marginBottom:'8px'}}>Mes Replays</h2>
      <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginBottom:'32px'}}>
        Replays · {replays.length > 0 ? replays.length + ' disponibles' : 'Bientôt disponibles'}
      </p>
      {loading ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p> :
      replays.length === 0 ? (
        <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
          <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',fontSize:'1.1rem',color:'rgba(248,245,242,.3)',marginBottom:'12px'}}>Les replays arrivent bientôt</p>
          <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.82rem',color:'rgba(248,245,242,.25)'}}>Ils seront disponibles dès le début de votre vague.</p>
        </div>
      ) : replays.map(r => (
        <div key={r.id} className="row-item">
          <div style={{flex:1}}>
            <p style={{fontFamily:'var(--ff-b)',fontWeight:500,fontSize:'.88rem',marginBottom:'4px'}}>{r.titre}</p>
            {r.description && <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.75rem',color:'var(--text-sub)'}}>{r.description}</p>}
          </div>
          {r.video_url && (
            <a href={r.video_url} target="_blank" rel="noreferrer"
              style={{padding:'8px 16px',background:'var(--rose)',border:'none',borderRadius:'3px',color:'#fff',fontFamily:'var(--ff-b)',fontSize:'.68rem',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',textDecoration:'none'}}>
              Regarder
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

/* ================================================================
   VUE MEMBRE — MES GUIDES PDF
   ================================================================ */
function MesGuidesView({ api, toast }) {
  const [guides,  setGuides]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const token = localStorage.getItem('mmorphose_token')
    fetch(`${API_BASE}/api/contenu/guides/`, { headers:{ 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setGuides(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(() => setLoading(false))
  },[])

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600,marginBottom:'8px'}}>Mes Guides PDF</h2>
      <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginBottom:'32px'}}>
        {guides.length} guide{guides.length!==1?'s':''} disponible{guides.length!==1?'s':''}
      </p>
      {loading ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p> :
      guides.length === 0 ? (
        <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
          <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',fontSize:'1.1rem',color:'rgba(248,245,242,.3)'}}>Aucun guide disponible pour le moment</p>
        </div>
      ) : guides.map(g => (
        <div key={g.id} className="row-item">
          <div style={{flex:1}}>
            <p style={{fontFamily:'var(--ff-b)',fontWeight:500,fontSize:'.88rem',marginBottom:'4px'}}>{g.titre}</p>
            {g.description && <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.75rem',color:'var(--text-sub)'}}>{g.description}</p>}
          </div>
          {g.fichier && (
            <a href={g.fichier} target="_blank" rel="noreferrer"
              style={{padding:'8px 16px',background:'rgba(201,169,106,.1)',border:'1px solid rgba(201,169,106,.25)',borderRadius:'3px',color:'var(--or)',fontFamily:'var(--ff-b)',fontSize:'.68rem',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',textDecoration:'none'}}>
              Télécharger
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

/* ================================================================
   VUE MEMBRE — MON TÉMOIGNAGE
   ================================================================ */
function MonTemoignageView({ api, toast }) {
  const [form,    setForm]    = useState({texte:'',note:5,pays:''})
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  async function soumettre() {
    if (!form.texte.trim()) { toast('Veuillez écrire votre témoignage','error'); return }
    setLoading(true)
    const token = localStorage.getItem('mmorphose_token')
    const res = await fetch(`${API_BASE}/api/avis/soumettre/`, {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
      body: JSON.stringify(form)
    })
    if (res.ok) { toast('Témoignage soumis ✓','success'); setDone(true) }
    else toast('Erreur lors de la soumission','error')
    setLoading(false)
  }

  const inp = {width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',fontWeight:300,outline:'none'}
  const lbl = {fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-sub)',display:'block',marginBottom:'6px'}

  return (
    <div style={{animation:'fadeUp .5s both',maxWidth:'560px'}}>
      <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600,marginBottom:'8px'}}>Mon Témoignage</h2>
      <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginBottom:'32px'}}>Partagez votre expérience avec Méta'Morph'Ose</p>

      {done ? (
        <div style={{padding:'32px',background:'rgba(76,175,80,.06)',border:'1px solid rgba(76,175,80,.2)',borderRadius:'6px',textAlign:'center'}}>
          <p style={{fontFamily:'var(--ff-t)',fontSize:'1.2rem',fontStyle:'italic',color:'#4CAF50',marginBottom:'8px'}}>Merci pour votre témoignage !</p>
          <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.82rem',color:'var(--text-sub)'}}>Il sera publié après validation par Prélia.</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <div>
            <label style={lbl}>Note (1-5 étoiles)</label>
            <div style={{display:'flex',gap:'8px'}}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={()=>setForm(p=>({...p,note:n}))}
                  style={{width:'36px',height:'36px',borderRadius:'50%',border:`1px solid ${form.note>=n?'var(--or)':'rgba(255,255,255,.1)'}`,background:form.note>=n?'rgba(201,169,106,.1)':'transparent',color:form.note>=n?'var(--or)':'var(--text-sub)',cursor:'pointer',fontFamily:'var(--ff-b)',fontSize:'.85rem'}}>
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={lbl}>Votre pays</label>
            <input style={inp} value={form.pays} onChange={e=>setForm(p=>({...p,pays:e.target.value}))} placeholder="Bénin, France..."/>
          </div>
          <div>
            <label style={lbl}>Votre témoignage *</label>
            <textarea style={{...inp,minHeight:'140px',resize:'vertical'}} value={form.texte}
              onChange={e=>setForm(p=>({...p,texte:e.target.value}))}
              placeholder="Partagez votre expérience..."/>
          </div>
          <p style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)',fontStyle:'italic'}}>
            Votre témoignage sera publié après validation par Prélia.
          </p>
          <button onClick={soumettre} disabled={loading}
            style={{padding:'12px 28px',background:'var(--rose)',border:'none',borderRadius:'3px',color:'#fff',fontFamily:'var(--ff-b)',fontSize:'.72rem',fontWeight:600,letterSpacing:'.12em',textTransform:'uppercase',cursor:'pointer',opacity:loading?.6:1,alignSelf:'flex-start'}}>
            {loading ? 'Envoi...' : 'Soumettre mon témoignage'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ================================================================
   VUE MEMBRE — MON PROFIL
   ================================================================ */
function MonProfilView({ api, toast }) {
  const user = JSON.parse(localStorage.getItem('mmorphose_user') || '{}')
  const token = localStorage.getItem('mmorphose_token')
  const [form,    setForm]    = useState({first_name:user.first_name||'',last_name:user.last_name||'',email:user.email||'',whatsapp:user.whatsapp||''})
  const [mdp,     setMdp]     = useState({old_password:'',new_password:''})
  const [loading, setLoading] = useState(false)

  async function sauvegarder() {
    setLoading(true)
    const res = await fetch(`${API_BASE}/api/auth/update-profile/`, {
      method:'PATCH',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
      body: JSON.stringify(form)
    })
    if (res.ok) toast('Profil mis à jour ✓','success')
    else toast('Erreur','error')
    setLoading(false)
  }

  async function changerMdp() {
    if (!mdp.old_password || !mdp.new_password) { toast('Remplissez les deux champs','error'); return }
    const res = await fetch(`${API_BASE}/api/auth/change-password/`, {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
      body: JSON.stringify(mdp)
    })
    const data = await res.json()
    if (res.ok) { toast('Mot de passe modifié ✓','success'); setMdp({old_password:'',new_password:''}) }
    else toast(data.detail||'Erreur','error')
  }

  const inp = {width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',fontWeight:300,outline:'none'}
  const lbl = {fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-sub)',display:'block',marginBottom:'6px'}

  return (
    <div style={{animation:'fadeUp .5s both',maxWidth:'520px'}}>
      <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600,marginBottom:'32px'}}>Mon Profil</h2>

      <div style={{display:'flex',flexDirection:'column',gap:'14px',marginBottom:'32px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
          <div><label style={lbl}>Prénom</label><input style={inp} value={form.first_name} onChange={e=>setForm(p=>({...p,first_name:e.target.value}))}/></div>
          <div><label style={lbl}>Nom</label><input style={inp} value={form.last_name} onChange={e=>setForm(p=>({...p,last_name:e.target.value}))}/></div>
        </div>
        <div><label style={lbl}>Email</label><input style={inp} type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></div>
        <div><label style={lbl}>WhatsApp</label><input style={inp} value={form.whatsapp} onChange={e=>setForm(p=>({...p,whatsapp:e.target.value}))}/></div>
        <button onClick={sauvegarder} disabled={loading}
          style={{padding:'11px 24px',background:'var(--rose)',border:'none',borderRadius:'3px',color:'#fff',fontFamily:'var(--ff-b)',fontSize:'.72rem',fontWeight:600,letterSpacing:'.12em',textTransform:'uppercase',cursor:'pointer',alignSelf:'flex-start',opacity:loading?.6:1}}>
          {loading?'Sauvegarde...':'Sauvegarder'}
        </button>
      </div>

      <div style={{height:'1px',background:'rgba(255,255,255,.06)',marginBottom:'28px'}}/>

      <p style={{fontFamily:'var(--ff-t)',fontSize:'1.1rem',fontWeight:600,marginBottom:'16px'}}>Changer le mot de passe</p>
      <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
        <div><label style={lbl}>Ancien mot de passe</label><input style={inp} type="password" value={mdp.old_password} onChange={e=>setMdp(p=>({...p,old_password:e.target.value}))}/></div>
        <div><label style={lbl}>Nouveau mot de passe</label><input style={inp} type="password" value={mdp.new_password} onChange={e=>setMdp(p=>({...p,new_password:e.target.value}))}/></div>
        <button onClick={changerMdp}
          style={{padding:'11px 24px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.72rem',fontWeight:600,letterSpacing:'.12em',textTransform:'uppercase',cursor:'pointer',alignSelf:'flex-start'}}>
          Modifier
        </button>
      </div>
    </div>
  )
}

/* ================================================================
   VUE MEMBRE — MON CERTIFICAT
   ================================================================ */
function MonCertificatView({ toast }) {
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('mmorphose_token')
  const user  = JSON.parse(localStorage.getItem('mmorphose_user') || '{}')

  async function telecharger() {
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/certificat/`, {
        headers:{'Authorization':`Bearer ${token}`}
      })
      if (!res.ok) { toast('Erreur génération certificat','error'); setLoading(false); return }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `Certificat_MetaMorphOse.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast('Certificat téléchargé ✓','success')
    } catch { toast('Erreur','error') }
    setLoading(false)
  }

  return (
    <div style={{animation:'fadeUp .5s both',maxWidth:'480px'}}>
      <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600,marginBottom:'8px'}}>Mon Certificat</h2>
      <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginBottom:'32px'}}>
        Certificat de complétion du programme Méta'Morph'Ose
      </p>
      <div style={{padding:'40px',background:'linear-gradient(135deg,rgba(201,169,106,.06),rgba(194,24,91,.04))',border:'1px solid rgba(201,169,106,.15)',borderRadius:'8px',textAlign:'center'}}>
        <p style={{fontFamily:'var(--ff-t)',fontSize:'1.3rem',fontWeight:600,color:'var(--or)',marginBottom:'8px'}}>
          {user.first_name} {user.last_name}
        </p>
        <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.82rem',color:'var(--text-sub)',marginBottom:'28px'}}>
          Programme Méta'Morph'Ose — 8 Semaines
        </p>
        <button onClick={telecharger} disabled={loading}
          style={{padding:'14px 32px',background:'var(--or)',border:'none',borderRadius:'3px',color:'#0A0A0A',fontFamily:'var(--ff-b)',fontSize:'.75rem',fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',cursor:'pointer',opacity:loading?.6:1}}>
          {loading ? 'Génération...' : 'Télécharger mon certificat PDF'}
        </button>
      </div>
    </div>
  )
}

/* ================================================================
   MASTERCLASS ADMIN VIEW — Gestion des masterclasses et réservations
   ================================================================ */
function MasterclassAdminView({ api, toast }) {
  const [onglet, setOnglet] = useState('liste')
  const [masterclasses, setMasterclasses] = useState([])
  const [reservations, setReservations] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    titre:'', description:'', date:'', lieu:'', places_max:50,
    est_active:true, gratuite:false, lien_live:'', image:null, image_url:''
  })

  const CLOUD_NAME = 'dp7v6vlgs'
  const UPLOAD_PRESET = 'metamorphose_unsigned'

  useEffect(() => { charger() }, [])

  async function charger() {
    setLoading(true)
    const token = localStorage.getItem('mmorphose_token')
    const res = await fetch(`${API_BASE}/api/masterclass/admin/`, { headers:{ 'Authorization':`Bearer ${token}` } })
    const data = await res.json()
    setMasterclasses(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function chargerReservations(id) {
    const token2 = localStorage.getItem('mmorphose_token')
    const res2 = await fetch(`${API_BASE}/api/masterclass/admin/${id}/reservations/`, { headers:{ 'Authorization':`Bearer ${token2}` } })
    const data = await res2.json()
    setReservations(Array.isArray(data) ? data : [])
  }

  function resetForm() {
    setForm({ titre:'', description:'', date:'', lieu:'', places_max:50, est_active:true, gratuite:false, lien_live:'', image:null, image_url:'' })
    setSelected(null)
  }

  function editer(mc) {
    setSelected(mc)
    setForm({
      titre: mc.titre || '',
      description: mc.description || '',
      date: mc.date ? mc.date.slice(0,16) : '',
      lieu: mc.lieu || '',
      places_max: mc.places_max || 50,
      est_active: mc.est_active ?? true,
      gratuite: mc.gratuite ?? false,
      lien_live: mc.lien_live || '',
      image: null,
      image_url: mc.image || ''
    })
    setOnglet('formulaire')
  }

  async function uploadImage(file) {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method:'POST', body:fd })
    const data = await res.json()
    setUploading(false)
    return data.secure_url || ''
  }

  async function sauvegarder() {
    if (!form.titre || !form.date) { toast('Titre et date obligatoires', 'error'); return }
    setSaving(true)
    let image_url = form.image_url
    if (form.image) { image_url = await uploadImage(form.image) }
    const payload = { titre:form.titre, description:form.description, date:form.date, lieu:form.lieu, places_max:parseInt(form.places_max)||50, est_active:form.est_active, gratuite:form.gratuite, lien_live:form.lien_live, image:image_url }
    if (selected) {
      const tkn = localStorage.getItem('mmorphose_token')
      await fetch(`${API_BASE}/api/masterclass/admin/${selected.id}/`, { method:'PATCH', headers:{ 'Authorization':`Bearer ${tkn}`, 'Content-Type':'application/json' }, body:JSON.stringify(payload) })
      toast('Masterclass modifiée ✓', 'success')
    } else {
      const tkn2 = localStorage.getItem('mmorphose_token')
      await fetch(`${API_BASE}/api/masterclass/admin/`, { method:'POST', headers:{ 'Authorization':`Bearer ${tkn2}`, 'Content-Type':'application/json' }, body:JSON.stringify(payload) })
      toast('Masterclass créée ✓', 'success')
    }
    setSaving(false)
    resetForm()
    setOnglet('liste')
    charger()
  }

  async function supprimer(id) {
    if (!window.confirm('Supprimer cette masterclass ?')) return
    const tknd = localStorage.getItem('mmorphose_token')
    await fetch(`${API_BASE}/api/masterclass/admin/${id}/`, { method:'DELETE', headers:{ 'Authorization':`Bearer ${tknd}` } })
    toast('Supprimée ✓', 'success')
    charger()
  }

  async function voirReservations(mc) {
    setSelected(mc)
    await chargerReservations(mc.id)
    setOnglet('reservations')
  }

  function exportCSV() {
    if (!reservations.length) { toast('Aucune réservation à exporter', 'error'); return }
    const header = 'Prénom,Nom,Email,Téléphone,Date inscription'
    const rows = reservations.map(r => `${r.prenom},${r.nom},${r.email},${r.telephone||''},${r.created_at?.slice(0,10)||''}`)
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reservations_${selected?.titre?.replace(/\s+/g,'_') || 'masterclass'}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast('Export CSV téléchargé ✓', 'success')
  }

  const inp = { width:'100%', padding:'10px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'3px', color:'var(--text)', fontFamily:'var(--ff-b)', fontSize:'.82rem', fontWeight:300, outline:'none', boxSizing:'border-box' }
  const lbl = { fontFamily:'var(--ff-b)', fontSize:'.62rem', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--text-sub)', display:'block', marginBottom:'6px' }

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px', flexWrap:'wrap', gap:'12px'}}>
        <div>
          <h2 style={{fontFamily:'var(--ff-t)', fontSize:'1.6rem', fontWeight:600}}>Masterclasses</h2>
          <p style={{fontFamily:'var(--ff-b)', fontSize:'.78rem', color:'var(--text-sub)', marginTop:'4px'}}>Gérer les masterclasses de Coach Prélia APEDO AHONON</p>
        </div>
        <button onClick={() => { resetForm(); setOnglet('formulaire') }}
          style={{padding:'10px 22px', background:'var(--rose)', border:'none', borderRadius:'3px', color:'#fff', fontFamily:'var(--ff-b)', fontSize:'.72rem', fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', cursor:'pointer'}}>
          + Nouvelle masterclass
        </button>
      </div>

      {/* Onglets */}
      <div style={{display:'flex', gap:'4px', marginBottom:'28px', borderBottom:'1px solid rgba(255,255,255,.06)', paddingBottom:'0'}}>
        {[['liste','Liste'],['formulaire', selected ? 'Modifier':'Créer'],['reservations','Réservations']].map(([id, label]) => (
          <button key={id} onClick={() => setOnglet(id)}
            style={{padding:'9px 20px', background:'none', border:'none', borderBottom: onglet===id ? '2px solid var(--or)' : '2px solid transparent', color: onglet===id ? 'var(--or)' : 'var(--text-sub)', fontFamily:'var(--ff-b)', fontSize:'.68rem', letterSpacing:'.12em', textTransform:'uppercase', cursor:'pointer', fontWeight: onglet===id ? 600 : 400, marginBottom:'-1px', transition:'all .2s'}}>
            {label}
          </button>
        ))}
      </div>

      {/* LISTE */}
      {onglet === 'liste' && (
        <div>
          {loading ? <p style={{color:'var(--text-sub)', fontFamily:'var(--ff-b)'}}>Chargement...</p> : masterclasses.length === 0 ? (
            <p style={{color:'var(--text-sub)', fontFamily:'var(--ff-b)', fontSize:'.82rem'}}>Aucune masterclass pour l'instant.</p>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              {masterclasses.map(mc => (
                <div key={mc.id} style={{padding:'20px 24px', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'6px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px'}}>
                  <div style={{flex:1, minWidth:'200px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px'}}>
                      <p style={{fontFamily:'var(--ff-t)', fontSize:'1rem', fontWeight:600}}>{mc.titre}</p>
                      <span style={{padding:'2px 8px', borderRadius:'100px', background: mc.est_active ? 'rgba(76,175,80,.15)' : 'rgba(255,255,255,.06)', border:`1px solid ${mc.est_active ? 'rgba(76,175,80,.3)' : 'rgba(255,255,255,.1)'}`, fontFamily:'var(--ff-b)', fontSize:'.58rem', color: mc.est_active ? '#4CAF50' : 'var(--text-sub)', letterSpacing:'.1em', textTransform:'uppercase'}}>
                        {mc.est_active ? 'Active' : 'Inactive'}
                      </span>
                      {mc.gratuite && <span style={{padding:'2px 8px', borderRadius:'100px', background:'rgba(201,169,106,.12)', border:'1px solid rgba(201,169,106,.3)', fontFamily:'var(--ff-b)', fontSize:'.58rem', color:'var(--or)', letterSpacing:'.1em', textTransform:'uppercase'}}>Gratuite</span>}
                    </div>
                    <p style={{fontFamily:'var(--ff-b)', fontSize:'.75rem', color:'var(--text-sub)'}}>
                      {mc.date ? new Date(mc.date).toLocaleDateString('fr-FR', {day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit'}) : 'Date non définie'}
                      {mc.lieu ? ` — ${mc.lieu}` : ''}
                    </p>
                    <p style={{fontFamily:'var(--ff-b)', fontSize:'.72rem', color:'rgba(201,169,106,.6)', marginTop:'4px'}}>{mc.places_max} places max</p>
                  </div>
                  <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                    <button onClick={() => voirReservations(mc)}
                      style={{padding:'7px 16px', background:'rgba(201,169,106,.1)', border:'1px solid rgba(201,169,106,.2)', borderRadius:'3px', color:'var(--or)', fontFamily:'var(--ff-b)', fontSize:'.65rem', letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer'}}>
                      Réservations
                    </button>
                    <button onClick={() => editer(mc)}
                      style={{padding:'7px 16px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'3px', color:'var(--text)', fontFamily:'var(--ff-b)', fontSize:'.65rem', letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer'}}>
                      Modifier
                    </button>
                    <button onClick={() => supprimer(mc.id)}
                      style={{padding:'7px 16px', background:'rgba(239,83,80,.08)', border:'1px solid rgba(239,83,80,.2)', borderRadius:'3px', color:'#ef5350', fontFamily:'var(--ff-b)', fontSize:'.65rem', letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer'}}>
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FORMULAIRE */}
      {onglet === 'formulaire' && (
        <div style={{display:'flex', flexDirection:'column', gap:'18px', maxWidth:'640px'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
            <div style={{gridColumn:'1/-1'}}>
              <label style={lbl}>Titre *</label>
              <input style={inp} value={form.titre} onChange={e=>setForm(f=>({...f,titre:e.target.value}))} placeholder="Masterclass de Coach Prélia APEDO AHONON"/>
            </div>
            <div style={{gridColumn:'1/-1'}}>
              <label style={lbl}>Description</label>
              <textarea style={{...inp, minHeight:'100px', resize:'vertical'}} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Décrivez le contenu et les objectifs..."/>
            </div>
            <div>
              <label style={lbl}>Date et heure *</label>
              <input style={inp} type="datetime-local" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
            </div>
            <div>
              <label style={lbl}>Lieu</label>
              <input style={inp} value={form.lieu} onChange={e=>setForm(f=>({...f,lieu:e.target.value}))} placeholder="En ligne / Cotonou..."/>
            </div>
            <div>
              <label style={lbl}>Places maximum</label>
              <input style={inp} type="number" min="1" value={form.places_max} onChange={e=>setForm(f=>({...f,places_max:e.target.value}))}/>
            </div>
            <div>
              <label style={lbl}>Lien live (Zoom, ZegoCloud...)</label>
              <input style={inp} value={form.lien_live} onChange={e=>setForm(f=>({...f,lien_live:e.target.value}))} placeholder="https://..."/>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              <label style={{...lbl, marginBottom:0}}>Statut</label>
              <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', fontFamily:'var(--ff-b)', fontSize:'.78rem', color:'var(--text)'}}>
                <input type="checkbox" checked={form.est_active} onChange={e=>setForm(f=>({...f,est_active:e.target.checked}))} style={{accentColor:'var(--or)'}}/>
                Masterclass active (visible)
              </label>
              <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', fontFamily:'var(--ff-b)', fontSize:'.78rem', color:'var(--text)'}}>
                <input type="checkbox" checked={form.gratuite} onChange={e=>setForm(f=>({...f,gratuite:e.target.checked}))} style={{accentColor:'var(--or)'}}/>
                Gratuite
              </label>
            </div>
            <div>
              <label style={lbl}>Image (optionnel)</label>
              {form.image_url && <img src={form.image_url} alt="" style={{width:'100%', height:'120px', objectFit:'cover', borderRadius:'4px', marginBottom:'8px'}}/>}
              <label style={{display:'block', padding:'10px', background:'rgba(201,169,106,.06)', border:'1px dashed rgba(201,169,106,.3)', borderRadius:'3px', cursor: uploading ? 'not-allowed' : 'pointer', textAlign:'center', fontFamily:'var(--ff-b)', fontSize:'.68rem', color:'var(--or)', letterSpacing:'.1em', textTransform:'uppercase'}}>
                {uploading ? 'Upload en cours...' : form.image_url ? 'Changer l\'image' : 'Choisir une image'}
                <input type="file" accept="image/*" style={{display:'none'}} disabled={uploading} onChange={e=>{ if(e.target.files[0]) setForm(f=>({...f,image:e.target.files[0],image_url:URL.createObjectURL(e.target.files[0])})) }}/>
              </label>
            </div>
          </div>
          <div style={{display:'flex', gap:'10px', marginTop:'8px'}}>
            <button onClick={sauvegarder} disabled={saving || uploading}
              style={{padding:'12px 28px', background:'var(--rose)', border:'none', borderRadius:'3px', color:'#fff', fontFamily:'var(--ff-b)', fontSize:'.75rem', fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', cursor:'pointer', opacity:(saving||uploading)?.6:1}}>
              {saving ? 'Sauvegarde...' : selected ? 'Modifier' : 'Créer'}
            </button>
            <button onClick={() => { resetForm(); setOnglet('liste') }}
              style={{padding:'12px 22px', background:'none', border:'1px solid rgba(255,255,255,.1)', borderRadius:'3px', color:'var(--text-sub)', fontFamily:'var(--ff-b)', fontSize:'.75rem', letterSpacing:'.12em', textTransform:'uppercase', cursor:'pointer'}}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* RESERVATIONS */}
      {onglet === 'reservations' && (
        <div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap', gap:'12px'}}>
            <p style={{fontFamily:'var(--ff-t)', fontSize:'1.1rem', fontWeight:600}}>{selected?.titre} — {reservations.length} réservation{reservations.length !== 1 ? 's' : ''}</p>
            {reservations.length > 0 && (
              <button onClick={exportCSV}
                style={{padding:'8px 18px', background:'rgba(201,169,106,.1)', border:'1px solid rgba(201,169,106,.25)', borderRadius:'3px', color:'var(--or)', fontFamily:'var(--ff-b)', fontSize:'.65rem', letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer'}}>
                Exporter CSV
              </button>
            )}
          </div>
          {reservations.length === 0 ? (
            <p style={{color:'var(--text-sub)', fontFamily:'var(--ff-b)', fontSize:'.82rem'}}>Aucune réservation pour cette masterclass.</p>
          ) : (
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%', borderCollapse:'collapse', fontFamily:'var(--ff-b)', fontSize:'.78rem'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid rgba(255,255,255,.08)'}}>
                    {['Prénom','Nom','Email','Téléphone','Date'].map(h => (
                      <th key={h} style={{padding:'10px 14px', textAlign:'left', fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', fontSize:'.62rem', color:'var(--text-sub)'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r,i) => (
                    <tr key={r.id || i} style={{borderBottom:'1px solid rgba(255,255,255,.04)', background: i%2===0 ? 'transparent' : 'rgba(255,255,255,.01)'}}>
                      <td style={{padding:'10px 14px', color:'var(--text)'}}>{r.prenom}</td>
                      <td style={{padding:'10px 14px', color:'var(--text)'}}>{r.nom}</td>
                      <td style={{padding:'10px 14px', color:'var(--or)'}}>{r.email}</td>
                      <td style={{padding:'10px 14px', color:'var(--text-sub)'}}>{r.telephone || '—'}</td>
                      <td style={{padding:'10px 14px', color:'var(--text-sub)'}}>{r.created_at?.slice(0,10) || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


/* ================================================================
   NOTIFICATIONS VIEW
   ================================================================ */
function NotificationsView({ api, toast }) {
  const [notifs,  setNotifs]  = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('mmorphose_token')

  useEffect(() => { charger() }, [])

  function charger() {
    fetch(`${API_BASE}/api/admin/notifications/?limit=50`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(d => {
      setNotifs(Array.isArray(d.results) ? d.results : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  async function marquerTousLus() {
    await fetch(`${API_BASE}/api/admin/notifications/lu/`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
    })
    charger()
    toast('Toutes les notifications marquées comme lues', 'success')
  }

  async function marquerLu(id) {
    await fetch(`${API_BASE}/api/admin/notifications/${id}/lu/`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
    })
    setNotifs(prev => prev.map(n => n.id === id ? {...n, lu: true} : n))
  }

  const ICONS = {
    inscription: '👤', temoignage: '⭐', contact: '💬',
    paiement: '💰', ticket: '🎫', satisfaction: '📋',
    message: '✉️', system: '⚙️'
  }

  const inp = {width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',outline:'none'}
  const lbl = {fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-sub)',display:'block',marginBottom:'6px'}

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px'}}>
        <div>
          <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600}}>Notifications</h2>
          <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginTop:'4px'}}>
            {notifs.filter(n=>!n.lu).length} non lue(s)
          </p>
        </div>
        <button onClick={marquerTousLus} className="admin-btn admin-btn-secondary" style={{fontSize:'.72rem'}}>
          Tout marquer comme lu
        </button>
      </div>

      {loading ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p> :
      notifs.length === 0 ? (
        <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
          <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',color:'rgba(248,245,242,.3)'}}>Aucune notification</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {notifs.map(n => (
            <div key={n.id} onClick={() => !n.lu && marquerLu(n.id)}
              style={{padding:'16px 20px',background:n.lu?'rgba(255,255,255,.02)':'rgba(201,169,106,.06)',border:`1px solid ${n.lu?'rgba(255,255,255,.06)':'rgba(201,169,106,.2)'}`,borderRadius:'4px',cursor:n.lu?'default':'pointer',display:'flex',gap:'14px',alignItems:'flex-start',transition:'all .2s'}}>
              <span style={{fontSize:'1.2rem',flexShrink:0}}>{ICONS[n.type]||'🔔'}</span>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'4px'}}>
                  <p style={{fontFamily:'var(--ff-b)',fontWeight:n.lu?300:600,fontSize:'.88rem',color:n.lu?'var(--text-sub)':'var(--text)'}}>{n.titre}</p>
                  <span style={{fontFamily:'var(--ff-b)',fontSize:'.65rem',color:'var(--text-sub)',flexShrink:0,marginLeft:'12px'}}>{n.created_at}</span>
                </div>
                <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.78rem',color:'var(--text-sub)'}}>{n.message}</p>
                {n.user_email && <p style={{fontFamily:'var(--ff-b)',fontSize:'.68rem',color:'var(--or)',marginTop:'4px'}}>{n.user_email}</p>}
              </div>
              {!n.lu && <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--or)',flexShrink:0,marginTop:'4px'}}/>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ================================================================
   MESSAGERIE VIEW
   ================================================================ */
function MessageriView({ api, toast }) {
  const [convs,    setConvs]    = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(true)
  const token = localStorage.getItem('mmorphose_token')

  useEffect(() => { chargerConvs() }, [])
  useEffect(() => { if (selected) chargerMessages(selected.id) }, [selected])

  function chargerConvs() {
    fetch(`${API_BASE}/api/admin/conversations/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(d => { setConvs(Array.isArray(d)?d:[]); setLoading(false) })
    .catch(() => setLoading(false))
  }

  function chargerMessages(membreId) {
    fetch(`${API_BASE}/api/messages/${membreId}/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(d => { setMessages(Array.isArray(d)?d:[]) })
  }

  async function envoyer() {
    if (!input.trim() || !selected) return
    const res = await fetch(`${API_BASE}/api/messages/${selected.id}/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contenu: input.trim() })
    })
    if (res.ok) {
      setInput('')
      chargerMessages(selected.id)
      chargerConvs()
    }
  }

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600,marginBottom:'28px'}}>Messagerie</h2>
      <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:'20px',height:'600px'}}>

        {/* Liste conversations */}
        <div style={{background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'6px',overflow:'auto'}}>
          {loading ? <p style={{padding:'20px',color:'var(--text-sub)',fontFamily:'var(--ff-b)',fontSize:'.82rem'}}>Chargement...</p> :
          convs.length === 0 ? <p style={{padding:'20px',color:'var(--text-sub)',fontFamily:'var(--ff-b)',fontSize:'.82rem'}}>Aucune conversation</p> :
          convs.map(c => (
            <div key={c.id} onClick={() => setSelected(c)}
              style={{padding:'14px 16px',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,.04)',background:selected?.id===c.id?'rgba(201,169,106,.08)':'transparent',transition:'background .2s'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}}>
                <p style={{fontFamily:'var(--ff-b)',fontWeight:600,fontSize:'.82rem',color:'var(--text)'}}>{c.membre_prenom||c.membre_email}</p>
                {c.non_lu_admin > 0 && <span style={{background:'var(--rose)',color:'#fff',borderRadius:'100px',padding:'2px 7px',fontSize:'.6rem',fontWeight:700}}>{c.non_lu_admin}</span>}
              </div>
              <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.72rem',color:'var(--text-sub)',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{c.dernier_message||'—'}</p>
              <p style={{fontFamily:'var(--ff-b)',fontSize:'.62rem',color:'var(--text-sub)',marginTop:'4px'}}>{c.updated_at}</p>
            </div>
          ))}
        </div>

        {/* Zone messages */}
        <div style={{background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'6px',display:'flex',flexDirection:'column'}}>
          {!selected ? (
            <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',color:'rgba(248,245,242,.3)'}}>Sélectionnez une conversation</p>
            </div>
          ) : (
            <>
              <div style={{padding:'16px 20px',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
                <p style={{fontFamily:'var(--ff-b)',fontWeight:600,fontSize:'.88rem',color:'var(--text)'}}>{selected.membre_prenom||selected.membre_email}</p>
                <p style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)'}}>{selected.membre_email}</p>
              </div>
              <div style={{flex:1,overflow:'auto',padding:'16px 20px',display:'flex',flexDirection:'column',gap:'10px'}}>
                {messages.map(m => (
                  <div key={m.id} style={{display:'flex',justifyContent:m.est_admin?'flex-end':'flex-start'}}>
                    <div style={{maxWidth:'70%',padding:'10px 14px',borderRadius:'10px',background:m.est_admin?'var(--rose)':'rgba(255,255,255,.06)',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',fontWeight:300,lineHeight:1.5}}>
                      {m.contenu}
                      <p style={{fontSize:'.62rem',color:m.est_admin?'rgba(255,255,255,.5)':'var(--text-sub)',marginTop:'4px',textAlign:'right'}}>{m.created_at}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{padding:'12px 16px',borderTop:'1px solid rgba(255,255,255,.06)',display:'flex',gap:'10px'}}>
                <input value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();envoyer()}}}
                  placeholder="Votre message..." style={{flex:1,padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',outline:'none'}}/>
                <button onClick={envoyer} className="admin-btn admin-btn-primary" style={{padding:'10px 20px',flexShrink:0}}>Envoyer</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   VAGUES VIEW
   ================================================================ */
function VaguesView({ api, toast }) {
  const [vagues,   setVagues]   = useState([])
  const [selected, setSelected] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null) // 'create'|'detail'
  const [form,     setForm]     = useState({nom:'',numero:'',date_debut:'',date_fin:'',places_max:30,statut:'planifiee',description:''})
  const [emailAdd, setEmailAdd] = useState('')
  const token = localStorage.getItem('mmorphose_token')

  const STATUTS = { planifiee:'Planifiée', active:'En cours', terminee:'Terminée' }
  const STATUT_COLORS = { planifiee:'var(--or)', active:'var(--green)', terminee:'var(--text-sub)' }

  useEffect(() => { charger() }, [])

  function charger() {
    fetch(`${API_BASE}/api/admin/vagues/`, { headers:{ 'Authorization':`Bearer ${token}` } })
      .then(r=>r.json()).then(d=>{ setVagues(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(()=>setLoading(false))
  }

  function ouvrirDetail(v) {
    fetch(`${API_BASE}/api/admin/vagues/${v.id}/`, { headers:{ 'Authorization':`Bearer ${token}` } })
      .then(r=>r.json()).then(d=>{ setSelected(d); setModal('detail') })
  }

  async function creer() {
    const res = await fetch(`${API_BASE}/api/admin/vagues/`, {
      method:'POST', headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
      body: JSON.stringify(form)
    })
    if (res.ok) { toast('Vague créée ✓','success'); setModal(null); charger() }
    else toast('Erreur','error')
  }

  async function changerStatut(id, statut) {
    await fetch(`${API_BASE}/api/admin/vagues/${id}/`, {
      method:'PATCH', headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
      body: JSON.stringify({ statut })
    })
    charger()
    if (selected) setSelected(p => ({...p, statut}))
    toast(`Statut mis à jour : ${STATUTS[statut]}`,'success')
  }

  async function ajouterMembre() {
    if (!emailAdd.trim() || !selected) return
    const res = await fetch(`${API_BASE}/api/admin/vagues/${selected.id}/membres/`, {
      method:'POST', headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
      body: JSON.stringify({ email: emailAdd.trim() })
    })
    const data = await res.json()
    if (res.ok) { toast(data.detail,'success'); setEmailAdd(''); ouvrirDetail(selected) }
    else toast(data.detail||'Erreur','error')
  }

  async function retirerMembre(membreId) {
    await fetch(`${API_BASE}/api/admin/vagues/${selected.id}/membres/${membreId}/`, {
      method:'DELETE', headers:{'Authorization':`Bearer ${token}`}
    })
    ouvrirDetail(selected)
    toast('Membre retiré','success')
  }

  const inp = {width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',outline:'none'}
  const lbl = {fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-sub)',display:'block',marginBottom:'6px'}

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px'}}>
        <div>
          <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600}}>Planificateur de vagues</h2>
          <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginTop:'4px'}}>{vagues.length} vague(s)</p>
        </div>
        <button onClick={()=>{setForm({nom:'',numero:'',date_debut:'',date_fin:'',places_max:30,statut:'planifiee',description:''});setModal('create')}}
          className="admin-btn admin-btn-primary">+ Nouvelle vague</button>
      </div>

      {loading ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p> :
      vagues.length === 0 ? (
        <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
          <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',color:'rgba(248,245,242,.3)'}}>Aucune vague planifiée</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {vagues.map(v => (
            <div key={v.id} style={{padding:'20px 24px',background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.06)',borderLeft:`4px solid ${STATUT_COLORS[v.statut]}`,borderRadius:'4px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'16px',flexWrap:'wrap'}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
                  <p style={{fontFamily:'var(--ff-b)',fontWeight:600,fontSize:'.95rem'}}>{v.nom}</p>
                  <span style={{padding:'2px 8px',borderRadius:'100px',background:`${STATUT_COLORS[v.statut]}20`,color:STATUT_COLORS[v.statut],fontFamily:'var(--ff-b)',fontSize:'.62rem',fontWeight:600}}>{STATUTS[v.statut]}</span>
                </div>
                <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.78rem',color:'var(--text-sub)'}}>
                  {v.date_debut} → {v.date_fin} · {v.places_prises}/{v.places_max} places
                </p>
              </div>
              <div style={{display:'flex',gap:'8px'}}>
                {v.statut === 'planifiee' && <button onClick={()=>changerStatut(v.id,'active')} className="admin-btn admin-btn-primary" style={{fontSize:'.68rem',padding:'7px 14px'}}>Démarrer</button>}
                {v.statut === 'active' && <button onClick={()=>changerStatut(v.id,'terminee')} className="admin-btn admin-btn-secondary" style={{fontSize:'.68rem',padding:'7px 14px'}}>Terminer</button>}
                <button onClick={()=>ouvrirDetail(v)} className="admin-btn" style={{fontSize:'.68rem',padding:'7px 14px'}}>Gérer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal créer vague */}
      {modal === 'create' && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'6px',padding:'32px',maxWidth:'500px',width:'100%'}}>
            <h3 style={{fontFamily:'var(--ff-t)',fontSize:'1.2rem',fontWeight:600,marginBottom:'24px'}}>Nouvelle vague</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Nom</label><input style={inp} value={form.nom} onChange={e=>setForm(p=>({...p,nom:e.target.value}))} placeholder="Vague Printemps 2026"/></div>
                <div><label style={lbl}>Numéro</label><input style={inp} type="number" value={form.numero} onChange={e=>setForm(p=>({...p,numero:e.target.value}))}/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Début</label><input style={inp} type="date" value={form.date_debut} onChange={e=>setForm(p=>({...p,date_debut:e.target.value}))}/></div>
                <div><label style={lbl}>Fin</label><input style={inp} type="date" value={form.date_fin} onChange={e=>setForm(p=>({...p,date_fin:e.target.value}))}/></div>
              </div>
              <div><label style={lbl}>Places max</label><input style={inp} type="number" value={form.places_max} onChange={e=>setForm(p=>({...p,places_max:parseInt(e.target.value)||30}))}/></div>
              <div><label style={lbl}>Description</label><textarea style={{...inp,minHeight:'80px',resize:'vertical'}} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}/></div>
            </div>
            <div style={{display:'flex',gap:'10px',marginTop:'20px',justifyContent:'flex-end'}}>
              <button onClick={()=>setModal(null)} className="admin-btn admin-btn-secondary">Annuler</button>
              <button onClick={creer} className="admin-btn admin-btn-primary">Créer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal détail vague */}
      {modal === 'detail' && selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',overflowY:'auto'}}>
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'6px',padding:'32px',maxWidth:'600px',width:'100%',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
              <h3 style={{fontFamily:'var(--ff-t)',fontSize:'1.2rem',fontWeight:600}}>{selected.nom}</h3>
              <button onClick={()=>setModal(null)} style={{background:'none',border:'none',color:'var(--text-sub)',cursor:'pointer',fontSize:'1.2rem'}}>✕</button>
            </div>
            <p style={{fontFamily:'var(--ff-b)',fontSize:'.82rem',color:'var(--text-sub)',marginBottom:'20px'}}>
              {selected.date_debut} → {selected.date_fin} · {selected.places_prises}/{selected.places_max} places
            </p>

            <p style={{fontFamily:'var(--ff-b)',fontSize:'.65rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--or)',marginBottom:'12px'}}>Membres ({selected.membres?.length||0})</p>
            <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
              <input value={emailAdd} onChange={e=>setEmailAdd(e.target.value)} placeholder="email@membre.com"
                style={{flex:1,padding:'9px 12px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',outline:'none'}}/>
              <button onClick={ajouterMembre} className="admin-btn admin-btn-primary" style={{padding:'9px 16px',fontSize:'.72rem',flexShrink:0}}>Ajouter</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'6px',maxHeight:'280px',overflowY:'auto'}}>
              {(selected.membres||[]).map(m => (
                <div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:'rgba(255,255,255,.02)',borderRadius:'3px'}}>
                  <div>
                    <p style={{fontFamily:'var(--ff-b)',fontSize:'.82rem',fontWeight:500}}>{m.prenom||m.email}</p>
                    <p style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)'}}>{m.email}</p>
                  </div>
                  <button onClick={()=>retirerMembre(m.id)} style={{background:'rgba(239,83,80,.1)',border:'1px solid rgba(239,83,80,.2)',borderRadius:'3px',color:'#ef5350',padding:'4px 10px',cursor:'pointer',fontFamily:'var(--ff-b)',fontSize:'.65rem'}}>Retirer</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================================================================
   PROGRESSION VIEW
   ================================================================ */
function ProgressionView({ api, toast }) {
  const [membres,  setMembres]  = useState([])
  const [selected, setSelected] = useState(null)
  const [form,     setForm]     = useState({})
  const [loading,  setLoading]  = useState(true)
  const token = localStorage.getItem('mmorphose_token')

  const BADGES = { premiere_session:'🌱 Première session', mi_parcours:'🌟 Mi-parcours', programme_complete:'🏆 Programme complété' }

  useEffect(() => { charger() }, [])

  function charger() {
    fetch(`${API_BASE}/api/admin/progression/`, { headers:{ 'Authorization':`Bearer ${token}` } })
      .then(r=>r.json()).then(d=>{ setMembres(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(()=>setLoading(false))
  }

  function ouvrir(m) {
    setSelected(m)
    setForm({ semaine_actuelle:m.semaine_actuelle, sessions_completees:m.sessions_completees, notes_coach:m.notes_coach||'' })
  }

  async function sauvegarder() {
    const membreId = membres.find(m=>m.membre_email===selected.membre_email)?.id
    // On cherche l'ID via l'email
    const usersRes = await fetch(`${API_BASE}/api/membres/?search=${selected.membre_email}`, { headers:{ 'Authorization':`Bearer ${token}` } })
    const users    = await usersRes.json()
    const user     = Array.isArray(users) ? users[0] : users?.results?.[0]
    if (!user) { toast('Membre introuvable','error'); return }

    const res = await fetch(`${API_BASE}/api/admin/progression/${user.id}/`, {
      method:'PATCH', headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
      body: JSON.stringify(form)
    })
    if (res.ok) { toast('Progression mise à jour ✓','success'); charger(); setSelected(null) }
    else toast('Erreur','error')
  }

  const inp = {width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',outline:'none'}
  const lbl = {fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-sub)',display:'block',marginBottom:'6px'}

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600,marginBottom:'28px'}}>Progression membres</h2>

      {loading ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p> :
      membres.length === 0 ? (
        <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
          <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',color:'rgba(248,245,242,.3)'}}>Aucune donnée de progression</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          {membres.map((m,i) => (
            <div key={i} style={{padding:'16px 20px',background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'4px',display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap'}}>
              <div style={{flex:1,minWidth:'200px'}}>
                <p style={{fontFamily:'var(--ff-b)',fontWeight:600,fontSize:'.88rem',marginBottom:'2px'}}>{m.membre_prenom||m.membre_email}</p>
                <p style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)'}}>{m.membre_email}</p>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'8px',flex:1,minWidth:'200px'}}>
                <div style={{flex:1,height:'8px',background:'rgba(255,255,255,.08)',borderRadius:'4px',overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${m.pourcentage}%`,background:m.pourcentage>=100?'var(--green)':m.pourcentage>=50?'var(--or)':'var(--rose)',borderRadius:'4px',transition:'width .5s'}}/>
                </div>
                <span style={{fontFamily:'var(--ff-b)',fontSize:'.82rem',fontWeight:600,color:'var(--or)',minWidth:'36px'}}>{m.pourcentage}%</span>
              </div>
              <p style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)',minWidth:'100px'}}>
                S{m.semaine_actuelle}/8 · {m.sessions_completees}/{m.sessions_total} sessions
              </p>
              <div style={{display:'flex',gap:'4px'}}>
                {(m.badges||[]).map(b => <span key={b} style={{fontSize:'.9rem'}} title={BADGES[b]}>{BADGES[b]?.split(' ')[0]}</span>)}
              </div>
              <button onClick={()=>ouvrir(m)} className="admin-btn" style={{fontSize:'.68rem',padding:'6px 12px'}}>Modifier</button>
            </div>
          ))}
        </div>
      )}

      {/* Modal modifier progression */}
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'6px',padding:'32px',maxWidth:'440px',width:'100%'}}>
            <h3 style={{fontFamily:'var(--ff-t)',fontSize:'1.1rem',fontWeight:600,marginBottom:'6px'}}>Progression — {selected.membre_prenom||selected.membre_email}</h3>
            <p style={{fontFamily:'var(--ff-b)',fontSize:'.75rem',color:'var(--text-sub)',marginBottom:'24px'}}>{selected.membre_email}</p>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Semaine actuelle</label><input style={inp} type="number" min="1" max="8" value={form.semaine_actuelle||1} onChange={e=>setForm(p=>({...p,semaine_actuelle:parseInt(e.target.value)||1}))}/></div>
                <div><label style={lbl}>Sessions complétées</label><input style={inp} type="number" min="0" value={form.sessions_completees||0} onChange={e=>setForm(p=>({...p,sessions_completees:parseInt(e.target.value)||0}))}/></div>
              </div>
              <div><label style={lbl}>Notes coach</label><textarea style={{...inp,minHeight:'100px',resize:'vertical'}} value={form.notes_coach||''} onChange={e=>setForm(p=>({...p,notes_coach:e.target.value}))}/></div>
            </div>
            <div style={{display:'flex',gap:'10px',marginTop:'20px',justifyContent:'flex-end'}}>
              <button onClick={()=>setSelected(null)} className="admin-btn admin-btn-secondary">Annuler</button>
              <button onClick={sauvegarder} className="admin-btn admin-btn-primary">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================================================================
   SATISFACTION VIEW
   ================================================================ */
function SatisfactionView({ api, toast }) {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [emailEnvoi, setEmailEnvoi] = useState('')
  const token = localStorage.getItem('mmorphose_token')

  useEffect(() => { charger() }, [])

  function charger() {
    fetch(`${API_BASE}/api/admin/satisfactions/`, { headers:{ 'Authorization':`Bearer ${token}` } })
      .then(r=>r.json()).then(d=>{ setData(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(()=>setLoading(false))
  }

  async function envoyer() {
    const res = await fetch(`${API_BASE}/api/admin/satisfaction/envoyer/`, {
      method:'POST', headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
      body: JSON.stringify(emailEnvoi.trim() ? { email: emailEnvoi.trim() } : {})
    })
    const d = await res.json()
    toast(d.detail||'Envoyé ✓', res.ok?'success':'error')
    setEmailEnvoi('')
  }

  const moyenne = (arr, key) => {
    const vals = arr.filter(x => x[key] !== null).map(x => x[key])
    return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : '—'
  }

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'28px',flexWrap:'wrap',gap:'16px'}}>
        <div>
          <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600}}>Formulaires satisfaction J+30</h2>
          <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginTop:'4px'}}>{data.length} réponse(s)</p>
        </div>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <input value={emailEnvoi} onChange={e=>setEmailEnvoi(e.target.value)} placeholder="email (vide = tous les membres)"
            style={{padding:'9px 12px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.78rem',outline:'none',width:'220px'}}/>
          <button onClick={envoyer} className="admin-btn admin-btn-primary" style={{fontSize:'.72rem'}}>Envoyer formulaire</button>
        </div>
      </div>

      {/* Moyennes globales */}
      {data.length > 0 && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'24px'}}>
          {[
            { label:'Note globale', key:'note_globale', max:10 },
            { label:'Note coach',   key:'note_coach',   max:10 },
            { label:'Note contenu', key:'note_contenu',  max:10 },
            { label:'Transformation',key:'note_transformation', max:10 },
          ].map(({label,key}) => (
            <div key={key} className="stat-card" style={{textAlign:'center'}}>
              <p style={{fontFamily:'var(--ff-t)',fontSize:'1.8rem',fontWeight:700,color:'var(--or)'}}>{moyenne(data,key)}</p>
              <p style={{fontFamily:'var(--ff-b)',fontSize:'.68rem',color:'var(--text-sub)',marginTop:'4px'}}>{label}</p>
              <p style={{fontFamily:'var(--ff-b)',fontSize:'.65rem',color:'var(--green)',marginTop:'2px'}}>
                {Math.round(data.filter(x=>x.recommanderait).length/data.length*100)}% recommandent
              </p>
            </div>
          ))}
        </div>
      )}

      {loading ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p> :
      data.length === 0 ? (
        <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
          <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',color:'rgba(248,245,242,.3)'}}>Aucune réponse reçue</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          {data.map((d,i) => (
            <div key={i} style={{padding:'18px 20px',background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'4px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px',flexWrap:'wrap',gap:'8px'}}>
                <div>
                  <p style={{fontFamily:'var(--ff-b)',fontWeight:600,fontSize:'.88rem'}}>{d.membre_prenom||d.membre_email}</p>
                  <p style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)'}}>{d.complete_le}</p>
                </div>
                <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                  <span style={{fontFamily:'var(--ff-t)',fontSize:'1.2rem',fontWeight:700,color:'var(--or)'}}>{d.note_globale}/10</span>
                  {d.recommanderait ? <span style={{color:'var(--green)',fontSize:'.75rem'}}>✓ Recommande</span> : <span style={{color:'#ef5350',fontSize:'.75rem'}}>✗ Ne recommande pas</span>}
                </div>
              </div>
              {d.point_fort && <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.78rem',color:'var(--text-sub)',marginBottom:'4px'}}>✓ {d.point_fort}</p>}
              {d.commentaire_libre && <p style={{fontFamily:'var(--ff-b)',fontStyle:'italic',fontWeight:300,fontSize:'.78rem',color:'rgba(248,245,242,.5)'}}>{d.commentaire_libre}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ================================================================
   AGENDA VIEW
   ================================================================ */
function AgendaView({ api, toast }) {
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState({titre:'',type_session:'live_groupe',date_debut:'',date_fin:'',description:'',lien_live:'',membres_invites:''})
  const token = localStorage.getItem('mmorphose_token')

  const TYPES = { live_groupe:'Live Groupe', live_prive:'Live Privé', masterclass:'Masterclass', reunion:'Réunion', autre:'Autre' }
  const TYPE_COLORS = { live_groupe:'var(--rose)', live_prive:'var(--or)', masterclass:'#A8C8E0', reunion:'var(--green)', autre:'var(--text-sub)' }

  useEffect(() => { charger() }, [])

  function charger() {
    fetch(`${API_BASE}/api/agenda/`, { headers:{ 'Authorization':`Bearer ${token}` } })
      .then(r=>r.json()).then(d=>{ setSessions(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(()=>setLoading(false))
  }

  async function creer() {
    const payload = {
      ...form,
      membres_invites: form.membres_invites.split(',').map(e=>e.trim()).filter(Boolean)
    }
    const res = await fetch(`${API_BASE}/api/agenda/`, {
      method:'POST', headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    })
    if (res.ok) { toast('Session créée ✓','success'); setModal(false); charger() }
    else toast('Erreur','error')
  }

  async function supprimerSession(id) {
    if (!window.confirm('Supprimer cette session ?')) return
    await fetch(`${API_BASE}/api/agenda/${id}/`, { method:'DELETE', headers:{ 'Authorization':`Bearer ${token}` } })
    charger()
    toast('Session supprimée','success')
  }

  async function envoyerRappel(id) {
    const res = await fetch(`${API_BASE}/api/agenda/${id}/rappel/`, {
      method:'POST', headers:{ 'Authorization':`Bearer ${token}` }
    })
    const d = await res.json()
    toast(d.detail||'Rappels envoyés ✓','success')
  }

  const inp = {width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',outline:'none'}
  const lbl = {fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-sub)',display:'block',marginBottom:'6px'}

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px'}}>
        <div>
          <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600}}>Agenda coach</h2>
          <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginTop:'4px'}}>{sessions.length} session(s)</p>
        </div>
        <button onClick={()=>setModal(true)} className="admin-btn admin-btn-primary">+ Nouvelle session</button>
      </div>

      {loading ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p> :
      sessions.length === 0 ? (
        <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
          <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',color:'rgba(248,245,242,.3)'}}>Aucune session planifiée</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          {sessions.map(s => (
            <div key={s.id} style={{padding:'16px 20px',background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.06)',borderLeft:`4px solid ${TYPE_COLORS[s.type_session]||'var(--or)'}`,borderRadius:'4px',display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                  <p style={{fontFamily:'var(--ff-b)',fontWeight:600,fontSize:'.88rem'}}>{s.titre}</p>
                  <span style={{padding:'2px 8px',borderRadius:'100px',background:`${TYPE_COLORS[s.type_session]||'var(--or)'}20`,color:TYPE_COLORS[s.type_session]||'var(--or)',fontFamily:'var(--ff-b)',fontSize:'.6rem'}}>{TYPES[s.type_session]}</span>
                </div>
                <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.75rem',color:'var(--text-sub)'}}>
                  📅 {s.date_debut?.replace('T',' ')} → {s.date_fin?.slice(11,16)}
                  {s.nb_invites > 0 && ` · ${s.nb_invites} invité(s)`}
                </p>
                {s.lien_live && <a href={s.lien_live} target="_blank" rel="noreferrer" style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--or)',textDecoration:'none'}}>🔗 {s.lien_live}</a>}
              </div>
              <div style={{display:'flex',gap:'6px'}}>
                <button onClick={()=>envoyerRappel(s.id)} className="admin-btn" style={{fontSize:'.65rem',padding:'6px 12px'}}>📧 Rappel</button>
                <button onClick={()=>supprimerSession(s.id)} className="admin-btn" style={{fontSize:'.65rem',padding:'6px 12px',color:'#ef5350'}}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal créer session */}
      {modal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',overflowY:'auto'}}>
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'6px',padding:'32px',maxWidth:'520px',width:'100%'}}>
            <h3 style={{fontFamily:'var(--ff-t)',fontSize:'1.2rem',fontWeight:600,marginBottom:'24px'}}>Nouvelle session</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div><label style={lbl}>Titre</label><input style={inp} value={form.titre} onChange={e=>setForm(p=>({...p,titre:e.target.value}))} placeholder="Live groupe — Semaine 3"/></div>
              <div>
                <label style={lbl}>Type</label>
                <select style={{...inp,cursor:'pointer'}} value={form.type_session} onChange={e=>setForm(p=>({...p,type_session:e.target.value}))}>
                  {Object.entries(TYPES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Début</label><input style={inp} type="datetime-local" value={form.date_debut} onChange={e=>setForm(p=>({...p,date_debut:e.target.value}))}/></div>
                <div><label style={lbl}>Fin</label><input style={inp} type="datetime-local" value={form.date_fin} onChange={e=>setForm(p=>({...p,date_fin:e.target.value}))}/></div>
              </div>
              <div><label style={lbl}>Lien live (optionnel)</label><input style={inp} type="url" value={form.lien_live} onChange={e=>setForm(p=>({...p,lien_live:e.target.value}))} placeholder="https://..."/></div>
              <div><label style={lbl}>Membres invités (emails séparés par virgule)</label><textarea style={{...inp,minHeight:'70px',resize:'vertical'}} value={form.membres_invites} onChange={e=>setForm(p=>({...p,membres_invites:e.target.value}))} placeholder="membre1@email.com, membre2@email.com"/></div>
              <div><label style={lbl}>Description (optionnel)</label><textarea style={{...inp,minHeight:'80px',resize:'vertical'}} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}/></div>
            </div>
            <div style={{display:'flex',gap:'10px',marginTop:'20px',justifyContent:'flex-end'}}>
              <button onClick={()=>setModal(false)} className="admin-btn admin-btn-secondary">Annuler</button>
              <button onClick={creer} className="admin-btn admin-btn-primary">Créer & inviter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


/* ── TÉMOIGNAGES MASTERCLASS ADMIN ─────────────────────────── */
function TemoignagesMasterclassAdminView({ toast }) {
  const API_BASE = import.meta.env.VITE_API_URL || "https://metamorphose-backend.onrender.com";
  const token = localStorage.getItem("mmorphose_token");
  const [temos, setTemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ prenom:"", texte:"" });
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => { charger(); }, []);

  async function charger() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/masterclass/temoignages/`);
      const data = await res.json();
      setTemos(Array.isArray(data) ? data : []);
    } catch { toast("Erreur chargement", "error"); }
    setLoading(false);
  }

  async function ajouter() {
    if (!form.prenom.trim()) { toast("Prénom requis", "error"); return; }
    if (!photo) { toast("Photo requise", "error"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("prenom", form.prenom);
      fd.append("texte", form.texte);
      fd.append("photo", photo);
      const res = await fetch(`${API_BASE}/api/masterclass/temoignages/ajouter/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        toast("Témoignage ajouté", "success");
        setForm({ prenom:"", texte:"" });
        setPhoto(null);
        setPreview(null);
        charger();
      } else { toast("Erreur lors de l'ajout", "error"); }
    } catch { toast("Erreur réseau", "error"); }
    setSaving(false);
  }

  async function supprimer(id) {
    if (!window.confirm("Supprimer ce témoignage ?")) return;
    await fetch(`${API_BASE}/api/masterclass/temoignages/${id}/supprimer/`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
    toast("Supprimé", "success");
    charger();
  }

  function onPhotoChange(e) {
    const file = e.target.files[0];
    if (!file) return;
    setPhoto(file);
    setPreview(URL.createObjectURL(file));
  }

  const inp = { width:"100%", padding:"10px 14px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"3px", color:"var(--text)", fontFamily:"var(--ff-b)", fontSize:".82rem", fontWeight:300, outline:"none", boxSizing:"border-box" };
  const lbl = { fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".14em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" };

  return (
    <div style={{ animation:"fadeUp .5s both" }}>
      <div style={{ marginBottom:"32px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.6rem", fontWeight:600 }}>Témoignages Masterclass</h2>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".78rem", color:"var(--text-sub)", marginTop:"4px" }}>Photos des métamorphosées affichées sur la page Masterclass</p>
      </div>

      {/* Formulaire ajout */}
      <div style={{ padding:"24px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"6px", marginBottom:"32px" }}>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".72rem", fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", color:"var(--or)", marginBottom:"20px" }}>Ajouter un témoignage</p>
        <div style={{ display:"grid", gridTemplateColumns:"200px 1fr", gap:"24px", alignItems:"start" }}>
          {/* Upload photo */}
          <label style={{ cursor:"pointer" }}>
            <div style={{ aspectRatio:"3/4", background:"rgba(255,255,255,.03)", border:`1px dashed ${preview?"rgba(201,169,106,.4)":"rgba(255,255,255,.12)"}`, borderRadius:"4px", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {preview ? (
                <img src={preview} alt="preview" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }}/>
              ) : (
                <div style={{ textAlign:"center", padding:"16px" }}>
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", color:"rgba(255,255,255,.3)", marginBottom:"6px" }}>Cliquer pour</p>
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", color:"rgba(255,255,255,.3)" }}>ajouter photo</p>
                </div>
              )}
            </div>
            <input type="file" accept="image/*" style={{ display:"none" }} onChange={onPhotoChange}/>
          </label>
          {/* Champs texte */}
          <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
            <div>
              <label style={lbl}>Prénom *</label>
              <input style={inp} type="text" placeholder="Ex: Georgine" value={form.prenom} onChange={e=>setForm(p=>({...p,prenom:e.target.value}))}/>
            </div>
            <div>
              <label style={lbl}>Texte du témoignage</label>
              <textarea style={{...inp,minHeight:"120px",resize:"vertical"}} placeholder="Ce que cette personne a vécu, ressenti…" value={form.texte} onChange={e=>setForm(p=>({...p,texte:e.target.value}))}/>
            </div>
            <button onClick={ajouter} disabled={saving} style={{ padding:"12px 24px", background:"var(--rose)", border:"none", borderRadius:"3px", color:"#fff", fontFamily:"var(--ff-b)", fontSize:".72rem", fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", cursor:"pointer", opacity:saving?0.6:1, alignSelf:"flex-start" }}>
              {saving ? "Ajout en cours…" : "+ Ajouter"}
            </button>
          </div>
        </div>
      </div>

      {/* Liste */}
      {loading ? (
        <p style={{ color:"var(--text-sub)", fontFamily:"var(--ff-b)", fontSize:".82rem" }}>Chargement…</p>
      ) : temos.length === 0 ? (
        <p style={{ color:"var(--text-sub)", fontFamily:"var(--ff-b)", fontSize:".82rem" }}>Aucun témoignage pour l'instant.</p>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))", gap:"20px" }}>
          {temos.map(t => (
            <div key={t.id} style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"6px", overflow:"hidden" }}>
              <div style={{ aspectRatio:"3/4", overflow:"hidden" }}>
                {t.photo ? (
                  <img src={t.photo} alt={t.prenom} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }}/>
                ) : (
                  <div style={{ width:"100%", height:"100%", display:"flex", alignItems:"center", justifyContent:"center", background:"rgba(255,255,255,.03)" }}>
                    <p style={{ color:"rgba(255,255,255,.2)", fontSize:".7rem" }}>Pas de photo</p>
                  </div>
                )}
              </div>
              <div style={{ padding:"12px" }}>
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".82rem", fontWeight:600, color:"var(--text)", marginBottom:"4px" }}>{t.prenom}</p>
                {t.texte && <p style={{ fontFamily:"var(--ff-b)", fontSize:".72rem", color:"var(--text-sub)", lineHeight:1.5, marginBottom:"10px" }}>{t.texte}</p>}
                <button onClick={() => supprimer(t.id)} style={{ padding:"6px 12px", background:"rgba(194,24,91,.1)", border:"1px solid rgba(194,24,91,.3)", borderRadius:"3px", color:"var(--rose)", fontFamily:"var(--ff-b)", fontSize:".62rem", cursor:"pointer", letterSpacing:".1em", textTransform:"uppercase" }}>
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// cache-bust 1777123001
