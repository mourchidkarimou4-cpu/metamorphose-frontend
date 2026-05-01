import { useState, useEffect, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// ── Vues Gestion ─────────────────────────────────────────────────
import { StatsView }                            from './views/Stats';
import { MembresView }                          from './views/Membres';
import { DemandesView }                         from './views/Demandes';
import { ReplaysView, GuidesView, ConfigView }  from './views/Contenu';
import { ImagesView }                           from './views/Images';
import { CartesView }                           from './views/Cartes';
import { TemoignagesView }                      from './views/Temoignages';
import { RessourcesAdminView, ListeAttenteView,
         NewsletterView, ExportView,
         MaintenanceView } from './views/Outils';
import { LiveAdminView }                        from './views/Live';
import { EvenementsAdminView,
         ActualitesAdminView } from './views/Evenements';
import { CommunauteAdminView }                  from './views/Communaute';
import { StoreAdminView }                       from './views/Store';
import { LearningView }                         from './views/Learning';
import { PartenairesView }                      from './views/Partenaires';
import { TicketsView }                          from './views/Tickets';
import { AbonnesView }                          from './views/Abonnes';
import { MasterclassAdminView }                 from './views/Masterclass';
import { RendezVousAdminView }                   from './views/RendezVous';

// ── Vues Mon Espace ───────────────────────────────────────────────
import { MonCompteView, MesReplaysView,
         MesGuidesView, MonTemoignageView,
         MonProfilView, MonCertificatView } from './views/MonEspace';

// ── Vues Nouvelles fonctionnalités ───────────────────────────────
import { NotificationsView, MessageriView,
         VaguesView, ProgressionView,
         SatisfactionView, AgendaView } from './views/Nouvelles';

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

  /* ── SIDEBAR COLLAPSIBLE ─────────────────────────────────────── */
  .sidebar-group-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:10px 14px; cursor:pointer; border-radius:4px;
    transition:background .2s; user-select:none;
  }
  .sidebar-group-header:hover { background:rgba(255,255,255,.04); }
  .sidebar-group-label {
    font-size:.58rem; font-weight:600; letter-spacing:.18em;
    text-transform:uppercase; color:rgba(248,245,242,.3);
  }
  .sidebar-arrow {
    font-size:.6rem; color:rgba(248,245,242,.25);
    transition:transform .25s; display:inline-block;
  }
  .sidebar-arrow.open { transform:rotate(90deg); }
  .sidebar-group-items {
    overflow:hidden;
    transition:max-height .3s cubic-bezier(0.4,0,0.2,1);
    max-height:0;
  }
  .sidebar-group-items.open { max-height:2000px; }

  .sidebar-search {
    margin:10px 10px 4px;
    background:rgba(255,255,255,.04);
    border:1px solid rgba(255,255,255,.07);
    border-radius:4px; padding:8px 12px;
    display:flex; align-items:center; gap:8px;
  }
  .sidebar-search input {
    background:none; border:none; outline:none;
    color:var(--text); font-family:var(--ff-b); font-size:.75rem;
    width:100%; font-weight:300;
  }
  .sidebar-search input::placeholder { color:rgba(248,245,242,.2); }

  /* ── HAMBURGER ──────────────────────────────────────────────── */
  .hamburger-btn {
    display:none; position:fixed; top:14px; left:14px; z-index:1001;
    width:38px; height:38px; border-radius:6px;
    background:var(--surface); border:1px solid var(--border);
    cursor:pointer; flex-direction:column;
    align-items:center; justify-content:center; gap:5px;
  }
  .hamburger-btn span {
    display:block; width:18px; height:1.5px;
    background:var(--text); border-radius:2px; transition:all .3s;
  }

  /* ── OVERLAY MOBILE ─────────────────────────────────────────── */
  .sidebar-overlay {
    display:none; position:fixed; inset:0;
    background:rgba(0,0,0,.7); z-index:999;
    backdrop-filter:blur(4px);
  }
  .sidebar-overlay.open { display:block; }

  /* ── TOPBAR MOBILE ──────────────────────────────────────────── */
  .admin-topbar {
    display:none; align-items:center; justify-content:space-between;
    padding:14px 16px 14px 60px; height:56px;
    background:var(--surface); border-bottom:1px solid var(--border);
    position:sticky; top:0; z-index:100; flex-shrink:0;
  }

  /* ── RESPONSIVE ─────────────────────────────────────────────── */
  @media(max-width:900px) {
    .hamburger-btn { display:flex; }
    .admin-topbar { display:flex; }
    .admin-sidebar {
      position:fixed !important; left:0 !important; top:0 !important;
      bottom:0 !important; height:100vh !important;
      width:260px !important; z-index:1000;
      transform:translateX(-100%) !important;
      transition:transform .3s cubic-bezier(0.4,0,0.2,1) !important;
      box-shadow:none !important;
    }
    .admin-sidebar.open {
      transform:translateX(0) !important;
      box-shadow:8px 0 40px rgba(0,0,0,.6) !important;
    }
    .admin-layout { flex-direction:column !important; }
    .admin-main { padding:20px 16px !important; }
  }
  @media(max-width:480px) {
    .stat-grid { grid-template-columns:1fr 1fr !important; }
    .admin-modal { padding:24px 16px !important; width:95vw !important; max-width:95vw !important; }
    .img-grid { grid-template-columns:1fr !important; }
    .row-item { flex-direction:column !important; align-items:flex-start !important; }
  }
  @media(max-width:360px) {
    .stat-grid { grid-template-columns:1fr !important; }
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
  { id:"stats_site",  label:"Stats du site" },
  { id:"contact",     label:"WhatsApp & Contact" },
];

/* ── API helper ─────────────────────────────────────────────── */
function useAdminAPI() {
  const navigate = useNavigate();
  const { token, user, logout } = useAuth();

  const call = useCallback(async (method, path, body = null) => {
    // Toujours lire le token depuis localStorage — plus fiable que le contexte au premier render
    const t = token || localStorage.getItem("mmorphose_token");
    const opts = {
      method,
      headers: { "Authorization": `Bearer ${t}`, "Content-Type": "application/json" },
    };
    if (body) opts.body = JSON.stringify(body);
    try {
      const BASE = import.meta.env.VITE_API_URL || '';
      const res = await fetch(`${BASE}/api/admin${path}`, opts);
      if (res.status === 401) { navigate("/espace-membre"); return null; }
      if (res.status === 204) return true;
      if (!res.ok) { console.warn(`API ${method} /api/admin${path} → ${res.status}`); return null; }
      const text = await res.text();
      if (!text) return null;
      try { return JSON.parse(text); }
      catch { console.warn("Réponse non-JSON:", text.slice(0, 80)); return null; }
    } catch (err) {
      console.warn(`Erreur réseau ${path}:`, err.message);
      return null;
    }
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

/* ── SIDEBAR COLLAPSIBLE ────────────────────────────────────── */
function SidebarItem({ id, label, count, urgent, active, setActive, closeSidebar }) {
  return (
    <button
      onClick={() => { setActive(id); closeSidebar && closeSidebar(); }}
      style={{
        width:"100%", display:"flex", alignItems:"center", gap:"8px",
        padding:"8px 14px", borderRadius:"4px", border:"none", cursor:"pointer",
        background: active===id ? "rgba(194,24,91,.1)" : "transparent",
        color: active===id ? "var(--rose)" : "var(--text-sub)",
        borderLeft: active===id ? "2px solid var(--rose)" : "2px solid transparent",
        fontFamily:"var(--ff-b)", fontSize:".75rem", fontWeight: active===id ? 500 : 300,
        letterSpacing:".02em", textAlign:"left", transition:"all .15s",
        marginBottom:"1px",
      }}
      onMouseEnter={e=>{ if(active!==id) e.currentTarget.style.background="rgba(255,255,255,.04)"; e.currentTarget.style.color="var(--text)"; }}
      onMouseLeave={e=>{ if(active!==id) { e.currentTarget.style.background="transparent"; e.currentTarget.style.color="var(--text-sub)"; }}}
    >
      <span style={{ flex:1 }}>{label}</span>
      {count > 0 && (
        <span style={{
          background: urgent ? "var(--rose)" : "rgba(255,255,255,.08)",
          color: urgent ? "#fff" : "var(--text-sub)",
          padding:"1px 7px", borderRadius:"100px", fontSize:".6rem", fontWeight:600,
          animation: urgent ? "pulse 2s infinite" : "none", flexShrink:0,
        }}>{count}</span>
      )}
    </button>
  );
}

function SidebarGroup({ label, children, defaultOpen = false, hasActive = false }) {
  const [open, setOpen] = useState(defaultOpen || hasActive);
  // S'ouvre automatiquement si un enfant est actif
  useEffect(() => { if (hasActive) setOpen(true); }, [hasActive]);
  return (
    <div style={{ marginBottom:"4px" }}>
      <div className="sidebar-group-header" onClick={() => setOpen(o => !o)}>
        <span className="sidebar-group-label">{label}</span>
        <span className={`sidebar-arrow ${open ? "open" : ""}`}>›</span>
      </div>
      <div className={`sidebar-group-items ${open ? "open" : ""}`}>
        <div style={{ padding:"0 0 8px" }}>
          {children}
        </div>
      </div>
    </div>
  );
}

function Sidebar({ active, setActive, counts, open, onClose, user }) {
  const { logout } = useAuth();
  const [search, setSearch] = useState("");

  const GESTION = [
    { id:"membres",          label:"Membres",             count:counts.membres },
    { id:"demandes",         label:"Demandes",            count:counts.non_traites, urgent:true },
    { id:"replays",          label:"Replays",             count:counts.replays },
    { id:"guides",           label:"Guides PDF",          count:counts.guides },
    { id:"config",           label:"Contenu du site" },
    { id:"vague",            label:"Vague & Places" },
    { id:"stats_site",       label:"Stats du site" },
    { id:"images",           label:"Photos et Logos" },
    { id:"cartes",           label:"Cartes Cadeaux" },
    { id:"temoignages",      label:"Témoignages",         urgent:true },
    { id:"masterclass_admin",label:"Masterclasses" },
    { id:"rendezvous_admin",label:"Rendez-vous" },
    { id:"tickets",          label:"Tickets & Événements" },
    { id:"evt_admin",        label:"Événements" },
    { id:"actu_admin",       label:"Actualités" },
    { id:"live_visio",       label:"Live & Visio" },
    { id:"learning",         label:"MMO Learning" },
    { id:"store_admin",      label:"Store / Accès" },
    { id:"comm_admin",       label:"Communauté" },
    { id:"messagerie",       label:"Messagerie" },
    { id:"vagues",           label:"Planificateur vagues" },
    { id:"progression",      label:"Progression membres" },
    { id:"satisfaction",     label:"Satisfaction J+30" },
    { id:"agenda",           label:"Agenda coach" },
    { id:"partenaires",      label:"Partenaires" },
    { id:"ressources",       label:"Chanson et Guide PDF" },
    { id:"liens_paiement",   label:"Liens de paiement" },
    { id:"newsletter",       label:"Newsletter" },
    { id:"abonnes",          label:"Abonnés Newsletter" },
    { id:"liste_attente",    label:"Liste d'attente" },
    { id:"export",           label:"Export CSV" },
    { id:"maintenance",      label:"Mode Maintenance" },
  ];

  const MON_ESPACE = [
    { id:"mon_compte",     label:"Mon Compte" },
    { id:"mes_replays",    label:"Mes Replays" },
    { id:"mes_guides",     label:"Mes Guides PDF" },
    { id:"mon_temoignage", label:"Mon Témoignage" },
    { id:"mon_profil",     label:"Mon Profil" },
    { id:"mon_certificat", label:"Mon Certificat" },
  ];

  const VUE_ENSEMBLE = [
    { id:"stats",         label:"Vue d'ensemble" },
    { id:"notifications", label:"Notifications", count:counts.notifications },
    { id:"messagerie",    label:"Messagerie" },
    { id:"agenda",        label:"Agenda" },
  ];

  // Filtrer selon la recherche
  const allItems = [...VUE_ENSEMBLE, ...GESTION, ...MON_ESPACE];
  const filtered = search.trim()
    ? allItems.filter(i => i.label.toLowerCase().includes(search.toLowerCase()))
    : null;

  const prenom = user?.first_name || user?.email?.split("@")[0] || "Admin";
  const initiales = prenom.substring(0, 2).toUpperCase();

  return (
    <>
      {/* Overlay mobile */}
      <div className={`sidebar-overlay ${open ? "open" : ""}`} onClick={onClose} />

      <aside
        className={`admin-sidebar ${open ? "open" : ""}`}
        style={{
          width:"240px", flexShrink:0,
          background:"var(--surface)",
          borderRight:"1px solid var(--border)",
          display:"flex", flexDirection:"column",
          height:"100vh", position:"sticky", top:0,
          overflowY:"auto",
        }}
      >
        {/* Logo */}
        <div style={{ padding:"22px 20px 16px", borderBottom:"1px solid var(--border)", flexShrink:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            <div style={{ width:"30px", height:"30px", borderRadius:"6px", background:"linear-gradient(135deg,#C9A96A,#C2185B)", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
              <span style={{ fontFamily:"var(--ff-t)", fontSize:"14px", color:"#fff" }}>M</span>
            </div>
            <div>
              <p style={{ fontFamily:"var(--ff-t)", fontSize:".88rem", lineHeight:1.2, margin:0 }}>
                <span style={{color:"var(--text)"}}>Méta'</span>
                <span style={{color:"var(--or)"}}>Morph'</span>
                <span style={{color:"var(--rose)"}}>Ose</span>
              </p>
              <p style={{ fontSize:".55rem", letterSpacing:".18em", textTransform:"uppercase", color:"var(--text-sub)", margin:0 }}>
                Dashboard Admin
              </p>
            </div>
          </div>
        </div>

        {/* Recherche */}
        <div className="sidebar-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(248,245,242,.25)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher..."
          />
          {search && (
            <button onClick={() => setSearch("")} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-sub)", fontSize:"14px", padding:"0 2px", lineHeight:1 }}>×</button>
          )}
        </div>

        {/* Navigation */}
        <nav style={{ flex:1, padding:"8px 10px", overflowY:"auto" }}>
          {filtered ? (
            /* Mode recherche */
            <div>
              <p style={{ fontSize:".6rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", padding:"8px 14px 6px" }}>
                {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
              </p>
              {filtered.map(t => (
                <SidebarItem key={t.id} {...t} active={active} setActive={setActive} closeSidebar={onClose} />
              ))}
            </div>
          ) : (
            /* Mode normal avec groupes */
            <>
              {/* Vue d'ensemble — pas de groupe, items directs */}
              {VUE_ENSEMBLE.slice(0,1).map(t => (
                <SidebarItem key={t.id} {...t} active={active} setActive={setActive} closeSidebar={onClose} />
              ))}
              {VUE_ENSEMBLE.slice(1).map(t => (
                <SidebarItem key={t.id} {...t} active={active} setActive={setActive} closeSidebar={onClose} />
              ))}

              <div style={{ height:"1px", background:"var(--border)", margin:"10px 10px" }} />

              {/* Gestion — collapsible, ouvert par défaut */}
              <SidebarGroup label="Gestion" defaultOpen={false} hasActive={GESTION.some(t => t.id === active)}>
                {GESTION.map(t => (
                  <SidebarItem key={t.id} {...t} active={active} setActive={setActive} closeSidebar={onClose} />
                ))}
              </SidebarGroup>

              <div style={{ height:"1px", background:"var(--border)", margin:"6px 10px" }} />

              {/* Mon Espace — collapsible */}
              <SidebarGroup label="Mon Espace" defaultOpen={false} hasActive={MON_ESPACE.some(t => t.id === active)}>
                {MON_ESPACE.map(t => (
                  <SidebarItem key={t.id} {...t} active={active} setActive={setActive} closeSidebar={onClose} />
                ))}
              </SidebarGroup>
            </>
          )}
        </nav>

        {/* Footer — profil + liens */}
        <div style={{ padding:"12px 14px", borderTop:"1px solid var(--border)", flexShrink:0 }}>
          {/* Profil */}
          <div style={{ display:"flex", alignItems:"center", gap:"10px", marginBottom:"12px" }}>
            <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"rgba(194,24,91,.15)", border:"1px solid rgba(194,24,91,.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontFamily:"var(--ff-b)", fontSize:".7rem", fontWeight:600, color:"var(--rose)" }}>{initiales}</span>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontFamily:"var(--ff-b)", fontSize:".75rem", fontWeight:500, color:"var(--text)", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{prenom}</p>
              <p style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"var(--text-sub)", margin:0 }}>Administratrice</p>
            </div>
          </div>
          {/* Liens */}
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <Link to="/" style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".1em", textTransform:"uppercase", color:"var(--text-sub)", textDecoration:"none" }}>
              Voir le site
            </Link>
            <button onClick={() => { logout(); window.location.href="/espace-membre"; }}
              style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".1em", textTransform:"uppercase", color:"rgba(239,83,80,.45)" }}
              onMouseEnter={e=>e.target.style.color="#ef5350"}
              onMouseLeave={e=>e.target.style.color="rgba(239,83,80,.45)"}>
              Déconnexion
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}


export default function AdminDashboard() {
  const navigate = useNavigate();
  const [active,       setActive]      = useState("stats");
  const [stats,        setStats]       = useState({membres:0,actifs:0,demandes:0,non_traites:0,replays:0,guides:0,formules:{}});
  const [toasts,       setToasts]      = useState([]);
  const [ready,        setReady]       = useState(false);
  const [refreshKey,   setRefreshKey]  = useState(0);
  const [sidebarOpen,  setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const api = useAdminAPI();

  // Recharger les stats toutes les 60 secondes
  useEffect(() => {
    if (!ready) return;
    const interval = setInterval(() => {
      const t = localStorage.getItem("mmorphose_token");
      const ABASE = import.meta.env.VITE_API_URL || '';
      fetch(`${ABASE}/api/admin/stats/`, { headers: { "Authorization": `Bearer ${t}` } })
        .then(r => r.ok ? r.json() : null)
        .then(d => { if (d) setStats(d); })
        .catch(() => {});
    }, 60000);
    return () => clearInterval(interval);
  }, [ready]);

  function actualiser() {
    setRefreshKey(k => k + 1);
    const t = localStorage.getItem("mmorphose_token");
    const RBASE = import.meta.env.VITE_API_URL || '';
    fetch(`${RBASE}/api/admin/stats/`, { headers: { "Authorization": `Bearer ${t}` } })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setStats(d); })
      .catch(() => {});
    toast("Données actualisées", "success");
  }

  useEffect(() => {
    const savedToken = localStorage.getItem("mmorphose_token");
    const user = JSON.parse(localStorage.getItem("mmorphose_user") || "null");
    if (!savedToken || !user) { navigate("/espace-membre"); return; }
    if (!user.is_staff)       { navigate("/dashboard"); return; }
    // Charger les stats puis afficher le dashboard
    const API_BASE = import.meta.env.VITE_API_URL || '';
    fetch(`${API_BASE}/api/admin/stats/`, {
      headers: { "Authorization": `Bearer ${savedToken}` }
    })
      .then(r => { if (!r.ok) throw new Error(r.status); return r.json(); })
      .then(d => { setStats(d); })
      .catch(err => console.warn("Stats non chargées:", err.message))
      .finally(() => setReady(true));
  }, []);

  function toast(msg, type="success") {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id!==id)), 3500);
  }

  const viewProps = { api, toast, refreshKey };

  if (!ready) return (
    <>
      <style>{STYLES}</style>
      <div style={{ minHeight:"100vh", background:"#0A0A0A", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"16px" }}>
        <div className="spinner" style={{ width:"32px", height:"32px", borderWidth:"3px" }}/>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".78rem", color:"rgba(201,169,106,.6)", letterSpacing:".15em", textTransform:"uppercase" }}>
          Chargement du dashboard…
        </p>
      </div>
    </>
  );

  return (
    <>
      <style>{STYLES}</style>

      {/* Hamburger mobile */}
      <button className="hamburger-btn" onClick={() => setSidebarOpen(o => !o)} aria-label="Menu">
        <span />
        <span />
        <span />
      </button>

      <div className="admin-layout" style={{ display:"flex", minHeight:"100vh" }}>
        <Sidebar
          active={active}
          setActive={setActive}
          counts={stats}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          user={user}
        />

        <div style={{ flex:1, display:"flex", flexDirection:"column", minWidth:0, overflow:"hidden" }}>
          {/* Topbar mobile */}
          <div className="admin-topbar">
            <p style={{ fontFamily:"var(--ff-t)", fontSize:".9rem", margin:0 }}>
              <span style={{color:"var(--text)"}}>Méta'</span>
              <span style={{color:"var(--or)"}}>Morph'</span>
              <span style={{color:"var(--rose)"}}>Ose</span>
            </p>
            <button onClick={actualiser} style={{ background:"none", border:"1px solid rgba(201,169,106,.2)", borderRadius:"3px", color:"rgba(201,169,106,.6)", fontFamily:"var(--ff-b)", fontSize:".6rem", fontWeight:600, letterSpacing:".1em", textTransform:"uppercase", padding:"5px 12px", cursor:"pointer" }}>
              ↻
            </button>
          </div>

          <main className="admin-main" style={{ flex:1, overflow:"auto", padding:"32px 40px" }}>
            {/* Bouton actualiser — desktop uniquement */}
            <div style={{ display:"flex", justifyContent:"flex-end", marginBottom:"16px" }}>
              <button onClick={actualiser} style={{ background:"none", border:"1px solid rgba(201,169,106,.2)", borderRadius:"3px", color:"rgba(201,169,106,.6)", fontFamily:"var(--ff-b)", fontSize:".62rem", fontWeight:600, letterSpacing:".12em", textTransform:"uppercase", padding:"6px 14px", cursor:"pointer", display:"flex", alignItems:"center", gap:"6px", transition:"all .2s" }}
                onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(201,169,106,.5)"; e.currentTarget.style.color="var(--or)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(201,169,106,.2)"; e.currentTarget.style.color="rgba(201,169,106,.6)"; }}>
                ↻ Actualiser
              </button>
            </div>
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
          {active === "rendezvous_admin"  && <RendezVousAdminView  {...viewProps} />}
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
      </div>
      <Toast toasts={toasts} />
    </>
  );
}
