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

// ── Vues Mon Espace ───────────────────────────────────────────────
import { MonCompteView, MesReplaysView,
         MesGuidesView, MonTemoignageView,
         MonProfilView, MonCertificatView } from './views/MonEspace';

// ── Vues Nouvelles fonctionnalités ───────────────────────────────
import { NotificationsView, MessageriView,

const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';
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
      const res = await fetch(`${API_BASE}/api/admin${path}`, opts);
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


export default function AdminDashboard() {
  const navigate = useNavigate();
  const [active,   setActive]   = useState("stats");
  const [stats,    setStats]    = useState({membres:0,actifs:0,demandes:0,non_traites:0,replays:0,guides:0,formules:{}});
  const [toasts,   setToasts]   = useState([]);
  const [ready,    setReady]    = useState(false);
  const api = useAdminAPI();

  useEffect(() => {
    const savedToken = localStorage.getItem("mmorphose_token");
    const user = JSON.parse(localStorage.getItem("mmorphose_user") || "null");
    if (!savedToken || !user) { navigate("/espace-membre"); return; }
    if (!user.is_staff)       { navigate("/dashboard"); return; }
    // Charger les stats puis afficher le dashboard
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

  const viewProps = { api, toast };

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
