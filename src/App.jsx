import { Routes, Route, Navigate, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import LandingPage    from './pages/LandingPage'
import Programme      from './pages/Programme'
import APropos        from './pages/APropos'
import Temoignages    from './pages/Temoignages'
import FAQPage        from './pages/FAQ'
import Brunch         from './pages/Brunch'
import CartesCadeaux  from './pages/CartesCadeaux'
import Contact        from './pages/Contact'
import Login          from './pages/auth/Login'
import Dashboard      from './pages/auth/Dashboard'
import AdminDashboard from './pages/auth/AdminDashboard'
import SuperAdmin     from './pages/auth/SuperAdmin'
import CarteScan      from './pages/CarteScan'
import ResetPassword  from './pages/ResetPassword'
import NotFound       from './pages/NotFound'
import PaiementPage   from './pages/Paiement'
import SplashScreen   from './components/SplashScreen'
import Communaute     from './pages/Communaute'
import Don            from './pages/Don'
import Store          from './pages/Store'
import LiveMasterclass from './pages/LiveMasterclass'
import Aura from './pages/Aura'
import Masterclass from './pages/Masterclass'
import MMOLearning from './pages/MMOLearning'
import Evenements    from './pages/Evenements'
import ScanTicket    from './pages/ScanTicket'
import API_URL from './config';

/* ── Refresh token automatique ────────────────────────────── */
async function tryRefresh() {
  const refresh = localStorage.getItem("mmorphose_refresh");
  if (!refresh) return false;
  try {
    const res  = await fetch(`${API_URL}/api/auth/refresh/`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ refresh }),
    });
    if (!res.ok) return false;
    const data = await res.json();
    localStorage.setItem("mmorphose_token", data.access);
    return true;
  } catch {
    return false;
  }
}

/* ── Route protégée membre ─────────────────────────────────── */
function PrivateRoute({ children }) {
  const token = localStorage.getItem("mmorphose_token");
  const user  = JSON.parse(localStorage.getItem("mmorphose_user") || "null");
  if (!token || !user) return <Navigate to="/espace-membre" replace />;
  return children;
}

/* ── Route protégée admin ──────────────────────────────────── */
function AdminRoute({ children }) {
  const token = localStorage.getItem("mmorphose_token");
  const user  = JSON.parse(localStorage.getItem("mmorphose_user") || "null");
  if (!token || !user) return <Navigate to="/espace-membre" replace />;
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

  useEffect(() => {
    fetch(`${API_URL}/api/admin/config/public/`)
      .then(r => r.json())
      .then(data => {
        const m = data.find?.(c => c.cle === 'maintenance_active');
        if (m?.valeur === '1') setMaintenance(true);
      })
      .catch(() => {});
  }, []);

  if (maintenance) return <MaintenancePage />;

  const isLanding = window.location.pathname === "/";
  const [showSplash, setShowSplash] = useState(isLanding);

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  return (
    <Routes>
      {/* ── Pages publiques ────────────────────────────────── */}
      <Route path="/"              element={<LandingPage />} />
      <Route path="/programme"     element={<Programme />} />
      <Route path="/a-propos"      element={<APropos />} />
      <Route path="/temoignages"   element={<Temoignages />} />
      <Route path="/faq"           element={<FAQPage />} />
      <Route path="/brunch"        element={<Brunch />} />
      <Route path="/carte-cadeau"  element={<CartesCadeaux />} />
      <Route path="/contact"       element={<Contact />} />
      <Route path="/communaute"    element={<Communaute />} />
      <Route path="/don"           element={<Don />} />
      <Route path="/store"      element={<Store />} />
      <Route path="/live"          element={<LiveMasterclass />} />
      <Route path="/masterclass"   element={<Masterclass />} />
      <Route path="/aura"         element={<Aura />} />
      <Route path="/mmo-learning"  element={<MMOLearning />} />
      <Route path="/mmo-learning/:slug" element={<MMOLearning />} />
      <Route path="/evenements"           element={<Evenements />} />
      <Route path="/scan"                  element={<ScanTicket />} />
      <Route path="/carte/:code"   element={<CarteScan />} />
      <Route path="/reset-password" element={<ResetPassword />} />

      {/* ── Authentification ───────────────────────────────── */}
      <Route path="/espace-membre" element={<Login />} />

      {/* ── Espace membre (privé) ──────────────────────────── */}
      <Route path="/dashboard" element={
        <PrivateRoute><Dashboard /></PrivateRoute>
      } />
      <Route path="/paiement" element={
        <PrivateRoute><PaiementPage /></PrivateRoute>
      } />

      {/* ── Espace admin ───────────────────────────────────── */}
      <Route path="/admin" element={
        <AdminRoute><AdminDashboard /></AdminRoute>
      } />
      <Route path="/super-admin" element={
        <AdminRoute><SuperAdmin /></AdminRoute>
      } />

      {/* ── 404 ────────────────────────────────────────────── */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
