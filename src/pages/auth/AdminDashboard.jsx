import { useState, useEffect, useCallback } from "react";
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
    const res = await fetch(`/api/admin${path}`, opts);
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
  const [open, setOpen] = useState({
    membres:true, contenu:false, evenements:false,
    communication:false, parametres:false, monespace:false
  });
  function toggle(key) { setOpen(p => ({...p,[key]:!p[key]})); }

  const SECTIONS = [
    { key:"membres", label:"Membres", items:[
      { id:"membres",       label:"Membres",          count:counts.membres },
      { id:"demandes",      label:"Demandes",         count:counts.non_traites, urgent:true },
      { id:"liste_attente", label:"Liste d'attente" },
    ]},
    { key:"contenu", label:"Contenu", items:[
      { id:"replays",    label:"Replays",             count:counts.replays },
      { id:"guides",     label:"Guides PDF",          count:counts.guides },
      { id:"learning",   label:"MMO Learning" },
      { id:"config",     label:"Contenu du site" },
      { id:"images",     label:"Photos & Logos" },
      { id:"ressources", label:"Chanson & Guide PDF" },
    ]},
    { key:"evenements", label:"Événements", items:[
      { id:"tickets",     label:"Tickets & Événements" },
      { id:"cartes",      label:"Cartes Cadeaux" },
      { id:"partenaires", label:"Partenaires" },
    ]},
    { key:"communication", label:"Communication", items:[
      { id:"temoignages", label:"Témoignages", urgent:true },
      { id:"newsletter",  label:"Newsletter" },
      { id:"abonnes",     label:"Abonnés Newsletter" },
      { id:"live",        label:"Live" },
    ]},
    { key:"parametres", label:"Paramètres", items:[
      { id:"export",      label:"Export CSV" },
      { id:"maintenance", label:"Mode Maintenance" },
    ]},
    { key:"monespace", label:"Mon Espace", items:[
      { id:"mon_compte",     label:"Mon Compte" },
      { id:"mon_profil",     label:"Mon Profil" },
      { id:"mes_replays",    label:"Replays" },
      { id:"mes_guides",     label:"Guides PDF" },
      { id:"mon_temoignage", label:"Témoignage" },
      { id:"mon_certificat", label:"Certificat" },
    ]},
  ];

  return (
    <aside className="admin-sidebar" style={{ width:"220px", flexShrink:0, background:"var(--surface)", borderRight:"1px solid var(--border)", display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0, overflowY:"auto" }}>
      <div style={{ padding:"20px 16px 14px", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
        <p style={{ fontFamily:"var(--ff-t)", fontSize:".9rem" }}>
          <span style={{color:"var(--text)"}}>Méta'</span>
          <span style={{color:"var(--or)"}}>Morph'</span>
          <span style={{color:"var(--rose)"}}>Ose</span>
        </p>
        <p style={{ fontSize:".55rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--text-sub)", marginTop:"3px" }}>Admin Dashboard</p>
      </div>

      <nav style={{ padding:"8px 8px 0", flex:1, overflowY:"auto" }}>
        <button onClick={() => setActive("stats")} className="tab-btn" style={{
          width:"100%", justifyContent:"flex-start", marginBottom:"4px",
          background: active==="stats" ? "rgba(194,24,91,.12)" : "transparent",
          color: active==="stats" ? "var(--rose)" : "var(--text-sub)",
          borderLeft: active==="stats" ? "2px solid var(--rose)" : "2px solid transparent",
          borderRadius: active==="stats" ? "0 3px 3px 0" : "3px",
          padding:"8px 10px", fontSize:".65rem",
        }}>
          <span style={{flex:1,textAlign:"left"}}>Vue d'ensemble</span>
        </button>

        {SECTIONS.map(section => (
          <div key={section.key} style={{marginBottom:"1px"}}>
            <button onClick={() => toggle(section.key)} style={{
              width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between",
              padding:"7px 10px", background:"transparent", border:"none", cursor:"pointer",
              fontFamily:"var(--ff-b)", fontSize:".55rem", letterSpacing:".18em",
              textTransform:"uppercase", color:"rgba(248,245,242,.22)", borderRadius:"3px",
            }}
            onMouseEnter={e=>e.currentTarget.style.color="rgba(201,169,106,.5)"}
            onMouseLeave={e=>e.currentTarget.style.color="rgba(248,245,242,.22)"}>
              <span>{section.label}</span>
              <span style={{ fontSize:".55rem", transition:"transform .2s", transform:open[section.key]?"rotate(180deg)":"none" }}>▾</span>
            </button>
            {open[section.key] && section.items.map(t => (
              <button key={t.id} onClick={() => setActive(t.id)} className="tab-btn" style={{
                width:"100%", justifyContent:"flex-start", marginBottom:"1px",
                background: active===t.id ? "rgba(194,24,91,.12)" : "transparent",
                color: active===t.id ? "var(--rose)" : "var(--text-sub)",
                borderLeft: active===t.id ? "2px solid var(--rose)" : "2px solid transparent",
                borderRadius: active===t.id ? "0 3px 3px 0" : "3px",
                padding:"6px 10px 6px 18px", fontSize:".63rem",
              }}>
                <span style={{flex:1,textAlign:"left"}}>{t.label}</span>
                {(t.count > 0) && (
                  <span style={{
                    background: t.urgent ? "var(--rose)" : "rgba(255,255,255,.1)",
                    color: t.urgent ? "#fff" : "var(--text-sub)",
                    padding:"1px 6px", borderRadius:"100px", fontSize:".58rem", fontWeight:600,
                  }}>{t.count}</span>
                )}
              </button>
            ))}
          </div>
        ))}
      </nav>

      <div style={{ padding:"12px 16px", borderTop:"1px solid var(--border)", flexShrink:0 }}>
        <Link to="/" style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".12em", textTransform:"uppercase", color:"var(--text-sub)", textDecoration:"none", display:"block", marginBottom:"8px" }}>
          Voir le site
        </Link>
        <button onClick={() => { localStorage.removeItem("mmorphose_token"); localStorage.removeItem("mmorphose_user"); window.location.href="/"; }}
          style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".12em", textTransform:"uppercase", color:"rgba(239,83,80,.5)" }}
          onMouseEnter={e=>e.target.style.color="#ef5350"}
          onMouseLeave={e=>e.target.style.color="rgba(239,83,80,.5)"}>
          Déconnexion
        </button>
      </div>
    </aside>
  );
}

