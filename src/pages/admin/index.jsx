import React, { useState, useEffect, useCallback } from 'react';
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
  const [openSections, setOpenSections] = useState({ principal:true, programme:false, suivi:false, site:false, commerce:false, outils:false, monespace:false });

  function toggleSection(key) {
    setOpenSections(p => ({ ...p, [key]: !p[key] }));
  }

  const SECTIONS = [
    {
      key: 'principal',
      label: 'Principal',
      items: [
        { id:"stats",          label:"Aperçu général",      icon:"grid",    color:"#C9A96A", count:null },
        { id:"membres",        label:"Membres",             icon:"users",   color:"#C2185B", count:counts.membres },
        { id:"demandes",       label:"Demandes",            icon:"inbox",   color:"#C2185B", count:counts.non_traites, urgent:true },
        { id:"rendezvous_admin",label:"Rendez-vous",        icon:"calendar",color:"#4CAF50", count:null },
        { id:"notifications",  label:"Notifications",       icon:"bell",    color:"#C9A96A", count:counts.notifications },
      ]
    },
    {
      key: 'programme',
      label: 'Mon programme',
      items: [
        { id:"live_visio",       label:"Lives & Visio",       icon:"video",   color:"rgba(100,130,255,.8)" },
        { id:"masterclass_admin",label:"Masterclasses",       icon:"star",    color:"#C9A96A" },
        { id:"evt_admin",        label:"Événements",          icon:"map-pin", color:"rgba(100,130,255,.8)" },
        { id:"actu_admin",       label:"Actualités",          icon:"rss",     color:"rgba(100,130,255,.8)" },
        { id:"comm_admin",       label:"Communauté",          icon:"message", color:"rgba(138,43,226,.8)" },
        { id:"messagerie",       label:"Messagerie",          icon:"mail",    color:"rgba(138,43,226,.8)" },
      ]
    },
    {
      key: 'suivi',
      label: 'Suivi membres',
      items: [
        { id:"replays",     label:"Replays",             icon:"play",   color:"#C9A96A", count:counts.replays },
        { id:"guides",      label:"Guides PDF",          icon:"file",   color:"#C9A96A", count:counts.guides },
        { id:"vagues",      label:"Planificateur vagues",icon:"layers", color:"rgba(100,130,255,.8)" },
        { id:"progression", label:"Progression membres", icon:"bar",    color:"rgba(100,130,255,.8)" },
        { id:"satisfaction",label:"Satisfaction J+30",   icon:"heart",  color:"#C2185B" },
        { id:"agenda",      label:"Agenda coach",        icon:"clock",  color:"#C9A96A" },
      ]
    },
    {
      key: 'site',
      label: 'Mon site',
      items: [
        { id:"config",         label:"Contenu du site",    icon:"edit",   color:"#C9A96A" },
        { id:"images",         label:"Photos & Images",    icon:"image",  color:"#C9A96A" },
        { id:"vague",          label:"Vague & Places",     icon:"users",  color:"#C2185B" },
        { id:"stats_site",     label:"Stats du site",      icon:"chart",  color:"#C9A96A" },
        { id:"temoignages",    label:"Témoignages",        icon:"quote",  color:"#C9A96A", urgent:true },
        { id:"partenaires",    label:"Partenaires",        icon:"link",   color:"#C9A96A" },
        { id:"ressources",     label:"Chanson & Guide PDF",icon:"music",  color:"#C9A96A" },
        { id:"newsletter",     label:"Newsletter",         icon:"send",   color:"rgba(100,130,255,.8)" },
        { id:"abonnes",        label:"Abonnés Newsletter", icon:"users",  color:"rgba(100,130,255,.8)" },
        { id:"liste_attente",  label:"Liste d'attente",    icon:"clock",  color:"rgba(100,130,255,.8)" },
        { id:"liens_paiement", label:"Liens de paiement",  icon:"credit", color:"rgba(255,165,0,.8)" },
      ]
    },
    {
      key: 'commerce',
      label: 'Commerce',
      items: [
        { id:"cartes",     label:"Cartes Cadeaux", icon:"gift",  color:"rgba(255,165,0,.8)" },
        { id:"tickets",    label:"Tickets",        icon:"ticket",color:"rgba(255,165,0,.8)" },
        { id:"store_admin",label:"Store / Accès",  icon:"shop",  color:"rgba(255,165,0,.8)" },
        { id:"learning",   label:"MMO Learning",   icon:"book",  color:"rgba(255,165,0,.8)" },
      ]
    },
    {
      key: 'outils',
      label: 'Outils',
      items: [
        { id:"export",      label:"Export CSV",       icon:"download",color:"rgba(248,245,242,.4)" },
        { id:"maintenance", label:"Mode Maintenance", icon:"tool",    color:"rgba(248,245,242,.4)" },
      ]
    },
    {
      key: 'monespace',
      label: 'Mon espace',
      items: [
        { id:"mon_compte",     label:"Mon Compte",     icon:"user",   color:"#C9A96A" },
        { id:"mes_replays",    label:"Mes Replays",    icon:"play",   color:"#C9A96A" },
        { id:"mes_guides",     label:"Mes Guides PDF", icon:"file",   color:"#C9A96A" },
        { id:"mon_temoignage", label:"Mon Témoignage", icon:"quote",  color:"#C9A96A" },
        { id:"mon_profil",     label:"Mon Profil",     icon:"user",   color:"#C9A96A" },
        { id:"mon_certificat", label:"Mon Certificat", icon:"award",  color:"#C9A96A" },
      ]
    },
  ];

  const allItems = SECTIONS.flatMap(s => s.items);
  const filtered = search.trim() ? allItems.filter(i => i.label.toLowerCase().includes(search.toLowerCase())) : null;
  const prenom = user?.first_name || user?.email?.split("@")[0] || "Admin";
  const initiales = prenom.substring(0, 2).toUpperCase();

  function NavIcon({ type, color }) {
    const s = { width:"13px", height:"13px" };
    const icons = {
      grid:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>,
      users:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
      inbox:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
      calendar: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
      bell:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
      video:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2"/></svg>,
      star:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
      "map-pin":<svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>,
      rss:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 11a9 9 0 0 1 9 9"/><path d="M4 4a16 16 0 0 1 16 16"/><circle cx="5" cy="19" r="1"/></svg>,
      message:  <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>,
      mail:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
      play:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>,
      file:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>,
      layers:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>,
      bar:      <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
      heart:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
      clock:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
      edit:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>,
      image:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>,
      chart:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>,
      quote:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>,
      link:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>,
      music:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>,
      send:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>,
      credit:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>,
      gift:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 0 1 0-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 0 0 0-5C13 2 12 7 12 7z"/></svg>,
      ticket:   <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 5v2"/><path d="M15 11v2"/><path d="M15 17v2"/><path d="M5 5h14a2 2 0 0 1 2 2v3a2 2 0 0 0 0 4v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-3a2 2 0 0 0 0-4V7a2 2 0 0 1 2-2z"/></svg>,
      shop:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>,
      book:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>,
      download: <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>,
      tool:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>,
      user:     <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>,
      award:    <svg style={s} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="7"/><polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"/></svg>,
    };
    return icons[type] || null;
  }

  return (
    <>
      <div className={`sidebar-overlay ${open ? "open" : ""}`} onClick={onClose} />
      <aside className={`admin-sidebar ${open ? "open" : ""}`} style={{ width:"240px", flexShrink:0, background:"#0c0a14", borderRight:"1px solid rgba(255,255,255,.04)", display:"flex", flexDirection:"column", height:"100vh", position:"sticky", top:0, overflowY:"auto" }}>

        {/* Logo + profil */}
        <div style={{ padding:"20px 18px 14px", borderBottom:"1px solid rgba(255,255,255,.04)", flexShrink:0 }}>
          <p style={{ fontFamily:"var(--ff-t)", fontSize:"13px", marginBottom:"14px" }}>
            <span style={{color:"#F8F5F2"}}>Méta'</span>
            <span style={{color:"#C9A96A"}}>Morph'</span>
            <span style={{color:"#C2185B"}}>Ose</span>
            <span style={{ fontFamily:"var(--ff-b)", fontSize:"9px", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(248,245,242,.15)", marginLeft:"8px" }}>Admin</span>
          </p>
          <div style={{ display:"flex", alignItems:"center", gap:"10px", padding:"12px 14px", background:"rgba(201,169,106,.04)", border:"1px solid rgba(201,169,106,.09)", borderRadius:"2px" }}>
            <div style={{ width:"34px", height:"34px", borderRadius:"50%", background:"rgba(194,24,91,.15)", border:"1px solid rgba(194,24,91,.25)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <span style={{ fontFamily:"var(--ff-t)", fontSize:"12px", fontWeight:600, color:"#C2185B" }}>{initiales}</span>
            </div>
            <div>
              <p style={{ fontFamily:"var(--ff-b)", fontSize:"12px", fontWeight:500, color:"#F8F5F2", margin:0 }}>{prenom}</p>
              <p style={{ fontFamily:"var(--ff-b)", fontSize:"9px", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.4)", margin:0 }}>Administratrice</p>
            </div>
          </div>
        </div>

        {/* Recherche */}
        <div className="sidebar-search">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="rgba(248,245,242,.25)" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Rechercher..." />
          {search && <button onClick={() => setSearch("")} style={{ background:"none", border:"none", cursor:"pointer", color:"var(--text-sub)", fontSize:"14px", padding:"0 2px" }}>×</button>}
        </div>

        {/* Navigation */}
        <nav style={{ flex:1, padding:"8px 10px", overflowY:"auto" }}>
          {filtered ? (
            <div>
              <p style={{ fontSize:"9px", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", padding:"8px 14px 6px" }}>
                {filtered.length} résultat{filtered.length !== 1 ? "s" : ""}
              </p>
              {filtered.map(t => (
                <div key={t.id}
                  onClick={() => { setActive(t.id); setSearch(""); onClose(); }}
                  style={{ display:"flex", alignItems:"center", gap:"10px", padding:"9px 12px", borderRadius:"2px", cursor:"pointer", background: active===t.id ? "rgba(201,169,106,.07)" : "transparent", borderLeft: active===t.id ? "2px solid #C9A96A" : "2px solid transparent", marginBottom:"1px" }}>
                  <div style={{ width:"26px", height:"26px", borderRadius:"5px", background:`rgba(${t.color === '#C9A96A' ? '201,169,106' : t.color === '#C2185B' ? '194,24,91' : '100,130,255'},.08)`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <NavIcon type={t.icon} color={t.color || "#C9A96A"} />
                  </div>
                  <span style={{ fontSize:"12px", color: active===t.id ? "#C9A96A" : "rgba(248,245,242,.4)", fontWeight: active===t.id ? 500 : 400, flex:1 }}>{t.label}</span>
                  {t.count > 0 && <span style={{ fontSize:"9px", fontWeight:700, padding:"2px 6px", borderRadius:"10px", background: t.urgent ? "rgba(194,24,91,.1)" : "rgba(201,169,106,.1)", color: t.urgent ? "#C2185B" : "#C9A96A" }}>{t.count}</span>}
                </div>
              ))}
            </div>
          ) : (
            SECTIONS.map(section => {
              const isOpen = openSections[section.key];
              const hasActive = section.items.some(i => i.id === active);
              return (
                <div key={section.key} style={{ marginBottom:"2px" }}>
                  <button onClick={() => toggleSection(section.key)}
                    style={{ width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"8px 12px", background:"none", border:"none", cursor:"pointer", borderRadius:"2px" }}>
                    <span style={{ fontSize:"8px", letterSpacing:".3em", textTransform:"uppercase", color: hasActive ? "rgba(201,169,106,.6)" : "rgba(248,245,242,.15)", fontWeight: hasActive ? 600 : 400 }}>{section.label}</span>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke={hasActive ? "rgba(201,169,106,.5)" : "rgba(248,245,242,.15)"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: isOpen ? "rotate(180deg)" : "rotate(0deg)", transition:"transform .25s" }}>
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                  {isOpen && section.items.map(t => (
                    <div key={t.id}
                      onClick={() => { setActive(t.id); onClose(); }}
                      style={{ display:"flex", alignItems:"center", gap:"10px", padding:"8px 12px", borderRadius:"2px", cursor:"pointer", background: active===t.id ? "rgba(201,169,106,.07)" : "transparent", borderLeft: active===t.id ? "2px solid #C9A96A" : "2px solid transparent", marginBottom:"1px", transition:"all .15s" }}>
                      <div style={{ width:"26px", height:"26px", borderRadius:"5px", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, background:"rgba(255,255,255,.03)" }}>
                        <NavIcon type={t.icon} color={active===t.id ? t.color : "rgba(248,245,242,.25)"} />
                      </div>
                      <span style={{ fontSize:"12px", color: active===t.id ? "#C9A96A" : "rgba(248,245,242,.38)", fontWeight: active===t.id ? 500 : 300, flex:1 }}>{t.label}</span>
                      {t.count > 0 && <span style={{ fontSize:"9px", fontWeight:700, padding:"2px 6px", borderRadius:"10px", background: t.urgent ? "rgba(194,24,91,.1)" : "rgba(201,169,106,.1)", color: t.urgent ? "#C2185B" : "#C9A96A" }}>{t.count}</span>}
                      {t.urgent && !t.count && <span style={{ width:"6px", height:"6px", borderRadius:"50%", background:"#C2185B", flexShrink:0 }}/>}
                    </div>
                  ))}
                </div>
              );
            })
          )}
        </nav>

        {/* Footer */}
        <div style={{ padding:"12px 14px", borderTop:"1px solid rgba(255,255,255,.04)", flexShrink:0 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <Link to="/" style={{ fontFamily:"var(--ff-b)", fontSize:"10px", letterSpacing:".1em", textTransform:"uppercase", color:"rgba(248,245,242,.2)", textDecoration:"none" }}>
              Voir le site
            </Link>
            <button onClick={() => { logout(); window.location.href="/espace-membre"; }}
              style={{ background:"none", border:"none", cursor:"pointer", fontFamily:"var(--ff-b)", fontSize:"10px", letterSpacing:".1em", textTransform:"uppercase", color:"rgba(239,83,80,.35)" }}
              onMouseEnter={e=>e.target.style.color="#ef5350"}
              onMouseLeave={e=>e.target.style.color="rgba(239,83,80,.35)"}>
              Déconnexion
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}


function ApercuView({ stats, setActive, counts }) {
  const API_BASE = import.meta.env.VITE_API_URL || '';
  const [rdvs, setRdvs] = React.useState([]);
  const [taches, setTaches] = React.useState([]);

  React.useEffect(() => {
    const token = localStorage.getItem('mmorphose_token');
    fetch(`${API_BASE}/api/rendezvous/admin/liste/?statut=en_attente`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(d => setRdvs(Array.isArray(d) ? d.slice(0,3) : [])).catch(() => {});
  }, []);

  React.useEffect(() => {
    const t = [];
    if (counts.non_traites > 0) t.push({ label: `${counts.non_traites} demande${counts.non_traites > 1 ? 's' : ''} en attente`, color:'#C2185B', id:'demandes' });
    if (rdvs.length > 0) t.push({ label: `${rdvs.length} RDV à confirmer`, color:'#4CAF50', id:'rendezvous_admin' });
    setTaches(t);
  }, [counts, rdvs]);

  const TYPE_LABELS = { decouverte:'Appel Découverte', coaching:'Séance Coaching', consultation:'Consultation Image' };
  const MODE_LABELS = { en_ligne:'En ligne', presentiel:'Présentiel' };

  const s = {
    card: { padding:'18px 20px', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'2px' },
    label: { fontSize:'8px', letterSpacing:'.28em', textTransform:'uppercase', color:'rgba(248,245,242,.18)', marginBottom:'12px' },
    statVal: { fontFamily:"'Playfair Display',serif", fontSize:'26px', fontWeight:600, lineHeight:1, marginBottom:'4px' },
    statLabel: { fontSize:'10px', fontWeight:300, color:'rgba(248,245,242,.28)' },
    statDelta: { fontSize:'9px', fontWeight:500, marginTop:'5px' },
  };

  return (
    <div style={{ animation:'fadeUp .4s both' }}>
      {/* Greeting */}
      <div style={{ marginBottom:'24px' }}>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'26px', fontWeight:600, color:'#F8F5F2', marginBottom:'4px' }}>
          Bonjour, <em style={{ fontStyle:'italic', fontWeight:400, color:'#C9A96A' }}>Prélia.</em>
        </h1>
        <p style={{ fontSize:'11px', fontWeight:300, color:'rgba(248,245,242,.2)' }}>
          {new Date().toLocaleDateString('fr-FR', { weekday:'long', day:'numeric', month:'long', year:'numeric' })}
        </p>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px', marginBottom:'20px' }}>
        {[
          { val: stats.membres || 0,      label:'Membres actives',   color:'#C9A96A', delta:'+' + (stats.nouveaux || 0) + ' ce mois', deltaColor:'#4CAF50' },
          { val: counts.non_traites || 0, label:'Demandes en attente', color:'#C2185B', delta:'À traiter', deltaColor:'#f87171' },
          { val: rdvs.length || 0,        label:'RDV en attente',    color:'#4CAF50', delta:'Cette semaine', deltaColor:'rgba(248,245,242,.2)' },
          { val: stats.pays || '8+',      label:'Pays représentés',  color:'#F8F5F2', delta:'Afrique & Europe', deltaColor:'rgba(248,245,242,.2)' },
        ].map((s2, i) => (
          <div key={i} style={s.card}>
            <p style={{ ...s.statVal, color: s2.color }}>{s2.val}</p>
            <p style={s.statLabel}>{s2.label}</p>
            <p style={{ ...s.statDelta, color: s2.deltaColor }}>{s2.delta}</p>
          </div>
        ))}
      </div>

      {/* Tâches + RDV */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'16px' }}>
        {/* À faire */}
        <div style={s.card}>
          <p style={s.label}>À faire aujourd'hui</p>
          {taches.length === 0 ? (
            <p style={{ fontSize:'12px', color:'rgba(248,245,242,.25)', fontWeight:300, fontStyle:'italic' }}>Tout est à jour ✓</p>
          ) : taches.map((t, i) => (
            <div key={i} onClick={() => setActive(t.id)} style={{ display:'flex', alignItems:'center', gap:'9px', padding:'9px 0', borderBottom:'1px solid rgba(255,255,255,.04)', cursor:'pointer' }}>
              <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:t.color, flexShrink:0 }}/>
              <span style={{ fontSize:'12px', color:'rgba(248,245,242,.6)', flex:1, fontWeight:300 }}>{t.label}</span>
              <span style={{ fontSize:'10px', color:'rgba(201,169,106,.45)' }}>Voir →</span>
            </div>
          ))}
          {taches.length === 0 && (
            <div style={{ marginTop:'12px', display:'flex', flexDirection:'column', gap:'8px' }}>
              {[
                { label:'Voir les membres', id:'membres' },
                { label:'Gérer le contenu', id:'config' },
                { label:'Rendez-vous', id:'rendezvous_admin' },
              ].map((t, i) => (
                <div key={i} onClick={() => setActive(t.id)} style={{ display:'flex', alignItems:'center', gap:'9px', padding:'8px 0', borderBottom:'1px solid rgba(255,255,255,.04)', cursor:'pointer' }}>
                  <div style={{ width:'6px', height:'6px', borderRadius:'50%', background:'rgba(255,255,255,.1)', flexShrink:0 }}/>
                  <span style={{ fontSize:'12px', color:'rgba(248,245,242,.4)', flex:1, fontWeight:300 }}>{t.label}</span>
                  <span style={{ fontSize:'10px', color:'rgba(201,169,106,.35)' }}>→</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RDV */}
        <div style={s.card}>
          <p style={s.label}>Prochains rendez-vous</p>
          {rdvs.length === 0 ? (
            <p style={{ fontSize:'12px', color:'rgba(248,245,242,.25)', fontWeight:300, fontStyle:'italic' }}>Aucun RDV en attente</p>
          ) : rdvs.map((r, i) => (
            <div key={i} style={{ display:'flex', alignItems:'center', gap:'10px', padding:'9px 0', borderBottom: i < rdvs.length-1 ? '1px solid rgba(255,255,255,.04)' : 'none' }}>
              <div style={{ textAlign:'center', flexShrink:0, minWidth:'36px' }}>
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'16px', color:'#C9A96A', fontWeight:600, lineHeight:1 }}>
                  {new Date(r.date).getDate()}
                </p>
                <p style={{ fontSize:'8px', textTransform:'uppercase', color:'rgba(248,245,242,.2)', letterSpacing:'.1em' }}>
                  {new Date(r.date).toLocaleDateString('fr-FR', { month:'short' })}
                </p>
              </div>
              <div style={{ width:'1px', height:'30px', background:'rgba(255,255,255,.05)', flexShrink:0 }}/>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:'12px', color:'#F8F5F2', fontWeight:400, marginBottom:'2px' }}>{r.prenom} {r.nom}</p>
                <p style={{ fontSize:'10px', color:'rgba(248,245,242,.3)', fontWeight:300 }}>{TYPE_LABELS[r.type_rdv]} · {r.heure?.slice(0,5)} · {MODE_LABELS[r.mode]}</p>
              </div>
              <span style={{ fontSize:'9px', fontWeight:700, padding:'2px 8px', borderRadius:'10px', background:'rgba(201,169,106,.1)', color:'#C9A96A', flexShrink:0 }}>Attente</span>
            </div>
          ))}
          <div style={{ marginTop:'10px' }}>
            <button onClick={() => setActive('rendezvous_admin')} style={{ background:'none', border:'none', cursor:'pointer', fontSize:'10px', color:'rgba(201,169,106,.4)', fontFamily:"'Montserrat',sans-serif", letterSpacing:'.1em', padding:0 }}>
              Voir tous les RDV →
            </button>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div style={s.card}>
        <p style={s.label}>Actions rapides</p>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:'8px' }}>
          {[
            { label:'Membres',    sub:'Gérer les inscriptions', id:'membres',    color:'#C2185B', bg:'rgba(194,24,91,.08)' },
            { label:'Contenu',    sub:'Textes & prix',          id:'config',     color:'#C9A96A', bg:'rgba(201,169,106,.07)' },
            { label:'Rendez-vous',sub:'Appels & coachings',     id:'rendezvous_admin', color:'#4CAF50', bg:'rgba(76,175,80,.07)' },
            { label:'Communauté', sub:'Clés d\'accès',          id:'comm_admin', color:'rgba(138,43,226,.8)', bg:'rgba(138,43,226,.07)' },
          ].map((a, i) => (
            <div key={i} onClick={() => setActive(a.id)} style={{ padding:'14px', background:'rgba(255,255,255,.018)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'2px', cursor:'pointer', transition:'all .2s' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor='rgba(201,169,106,.18)'; e.currentTarget.style.background='rgba(201,169,106,.03)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor='rgba(255,255,255,.05)'; e.currentTarget.style.background='rgba(255,255,255,.018)'; }}>
              <p style={{ fontSize:'12px', fontWeight:500, color:'#F8F5F2', marginBottom:'3px' }}>{a.label}</p>
              <p style={{ fontSize:'10px', fontWeight:300, color:'rgba(248,245,242,.28)' }}>{a.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
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
          {active === "stats"       && <ApercuView stats={stats} setActive={setActive} counts={stats} />}
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
