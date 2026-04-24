import { Routes, Route, Navigate } from 'react-router-dom'
import { useEffect, useState, useRef } from 'react'
import ErrorBoundary   from './components/ErrorBoundary'
import Navbar          from './components/Navbar'
import AuthModal       from './components/AuthModal'
import LandingPage     from './pages/LandingPage'
import Programme       from './pages/Programme'
import APropos         from './pages/APropos'
import Temoignages     from './pages/Temoignages'
import FAQPage         from './pages/FAQ'
import Brunch          from './pages/Brunch'
import BrunchSuccess   from './pages/BrunchSuccess'
import CartesCadeaux   from './pages/CartesCadeaux'
import Contact         from './pages/Contact'
import Login           from './pages/auth/Login'
import Dashboard       from './pages/auth/Dashboard'
import AdminDashboard  from './pages/admin'
import CarteScan       from './pages/CarteScan'
import ResetPassword   from './pages/ResetPassword'
import NotFound        from './pages/NotFound'
import PaiementPage    from './pages/Paiement'
import SplashScreen    from './components/SplashScreen'
import Communaute        from './pages/Communaute'
import CommunautePortail from './pages/CommunautePortail'
import Don             from './pages/Don'
import Store           from './pages/Store'
import LiveMasterclass from './pages/LiveMasterclass'
import LiveMeeting     from './pages/LiveMeeting'
import Aura            from './pages/Aura'
import Masterclass     from './pages/Masterclass'
import MMOLearning     from './pages/MMOLearning'
import Evenements      from './pages/Evenements'
import Actualites      from './pages/Actualites'
import ScanTicket      from './pages/ScanTicket'
import Logout          from './pages/Logout'

const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';

/* ── Route protégée membre (clientes) ─────────────────────── */
function PrivateRoute({ children }) {
  const token = localStorage.getItem("mmorphose_token");
  const user  = JSON.parse(localStorage.getItem("mmorphose_user") || "null");
  if (!token || !user) return <Navigate to="/espace-membre" replace />;
  // Si staff → redirige vers /admin (pas le dashboard membre)
  if (user.is_staff)   return <Navigate to="/admin" replace />;
  return children;
}

/* ── Route protégée admin (Prélia + toi) ──────────────────── */
function AdminRoute({ children }) {
  const token = localStorage.getItem("mmorphose_token");
  const user  = JSON.parse(localStorage.getItem("mmorphose_user") || "null");
  if (!token || !user) return <Navigate to="/espace-membre" replace />;
  // Si pas staff → redirige vers /dashboard membre
  if (!user.is_staff)  return <Navigate to="/dashboard" replace />;
  return children;
}

function MaintenancePage() {
  return (
    <div style={{ background:'#0A0A0A', minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', color:'#F8F5F2', fontFamily:"'Montserrat',sans-serif" }}>
      <p style={{ fontSize:'.62rem', letterSpacing:'.28em', textTransform:'uppercase', color:'rgba(201,169,106,.5)', marginBottom:'16px' }}>Site en maintenance</p>
      <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', marginBottom:'16px' }}>
        <span style={{color:'#F8F5F2'}}>Méta'</span>
        <span style={{color:'#C9A96A'}}>Morph'</span>
        <span style={{color:'#C2185B'}}>Ose</span>
      </h1>
      <p style={{ fontWeight:300, fontSize:'.85rem', color:'rgba(248,245,242,.45)', maxWidth:'360px', textAlign:'center', lineHeight:1.7 }}>
        Le site est temporairement en maintenance. Revenez dans quelques instants.
      </p>
    </div>
  );
}

export default function App() {
  const [maintenance, setMaintenance] = useState(false);
  const [authTab, setAuthTab] = useState(null);
  const isLandingRef = useRef(window.location.pathname === "/");
  const [showSplash, setShowSplash] = useState(isLandingRef.current);

  useEffect(() => {
    try {
      const cached = localStorage.getItem('mmo_site_config');
      if (cached) {
        const map = JSON.parse(cached);
        if (map.maintenance_active === '1') setMaintenance(true);
      }
    } catch {}
    fetch(`${API_BASE}/api/admin/config/public/`)
      .then(r => { if (!r.ok) throw new Error(); return r.json(); })
      .then(data => {
        if (!Array.isArray(data)) return;
        const map = {};
        data.forEach(c => { map[c.cle] = c.valeur; });
        try { localStorage.setItem('mmo_site_config', JSON.stringify(map)); } catch {}
        if (map.maintenance_active === '1') setMaintenance(true);
        else setMaintenance(false);
      })
      .catch(() => {});
  }, []);

  if (maintenance) return <MaintenancePage />;
  if (showSplash)  return <SplashScreen onDone={() => setShowSplash(false)} />;

  return (
    <ErrorBoundary>
      <Navbar onAuthOpen={(tab) => setAuthTab(tab)} />
      {authTab && <AuthModal defaultTab={authTab} onClose={() => setAuthTab(null)} />}
      <Routes>
        {/* ── Pages publiques ────────────────────────────────── */}
        <Route path="/"              element={<LandingPage />} />
        <Route path="/programme"     element={<Programme />} />
        <Route path="/a-propos"      element={<APropos />} />
        <Route path="/temoignages"   element={<Temoignages />} />
        <Route path="/faq"           element={<FAQPage />} />
        <Route path="/brunch"        element={<Brunch />} />
        <Route path="/brunch/success"  element={<BrunchSuccess />} />
        <Route path="/carte-cadeau"  element={<CartesCadeaux />} />
        <Route path="/contact"       element={<Contact />} />
        <Route path="/communaute"    element={<Communaute />} />
        <Route path="/communaute/portail" element={<CommunautePortail />} />
        <Route path="/don"           element={<Don />} />
        <Route path="/store"         element={<Store />} />
        <Route path="/live"          element={<LiveMasterclass />} />
        <Route path="/meeting/:roomId" element={<LiveMeeting />} />
        <Route path="/masterclass"   element={<Masterclass />} />
        <Route path="/aura"          element={<Aura />} />
        <Route path="/mmo-learning"  element={<MMOLearning />} />
        <Route path="/mmo-learning/:slug" element={<MMOLearning />} />
        <Route path="/evenements"    element={<Evenements />} />
        <Route path="/actualites"    element={<Actualites />} />
        <Route path="/scan"          element={<ScanTicket />} />
        <Route path="/carte/:code"   element={<CarteScan />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/logout"        element={<Logout />} />
        <Route path="/paiement"      element={<PaiementPage />} />

        {/* ── Authentification ───────────────────────────────── */}
        <Route path="/espace-membre" element={<Login />} />

        {/* ── Dashboard clientes (is_staff=false) ────────────── */}
        <Route path="/dashboard" element={
          <PrivateRoute><Dashboard /></PrivateRoute>
        } />

        {/* ── Dashboard admin — Prélia + toi (is_staff=true) ─── */}
        <Route path="/admin" element={
          <AdminRoute><AdminDashboard /></AdminRoute>
        } />

        {/* ── 404 ────────────────────────────────────────────── */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ErrorBoundary>
  );
}
