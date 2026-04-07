import { Routes, Route, Navigate } from 'react-router-dom'
import { useState } from 'react'
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
import CarteScan      from './pages/CarteScan'
import ResetPassword from './pages/ResetPassword'
import NotFound       from './pages/NotFound'
import PaiementPage   from './pages/Paiement'
import SplashScreen   from './components/SplashScreen'
import Masterclass    from './pages/Masterclass'
import Store          from './pages/Store'
import Don            from './pages/Don'
import Communaute     from './pages/Communaute'
import AgentIA        from './pages/AgentIA'
import LiveMasterclass from './pages/LiveMasterclass'
import LiveMasterclass from './pages/LiveMasterclass'

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

export default function App() {
  const isLanding = window.location.pathname === "/";
  const [showSplash, setShowSplash] = useState(isLanding);

  if (showSplash) {
    return <SplashScreen onDone={() => setShowSplash(false)} />;
  }

  return (
    <Routes>
      <Route path="/"              element={<LandingPage />} />
      <Route path="/programme"     element={<Programme />} />
      <Route path="/a-propos"      element={<APropos />} />
      <Route path="/temoignages"   element={<Temoignages />} />
      <Route path="/faq"           element={<FAQPage />} />
      <Route path="/brunch"        element={<Brunch />} />
      <Route path="/carte-cadeau"  element={<CartesCadeaux />} />
      <Route path="/contact"       element={<Contact />} />
      <Route path="/espace-membre" element={<Login />} />
      <Route path="/dashboard"     element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      <Route path="/admin"         element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/carte/:code"   element={<CarteScan />} />
      <Route path="/paiement"      element={<PrivateRoute><PaiementPage /></PrivateRoute>} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/masterclass"   element={<Masterclass />} />
      <Route path="/store"         element={<Store />} />
      <Route path="/don"           element={<Don />} />
      <Route path="/communaute"    element={<PrivateRoute><Communaute /></PrivateRoute>} />
      <Route path="/agent-ia"      element={<AgentIA />} />
      <Route path="/live"          element={<PrivateRoute><LiveMasterclass /></PrivateRoute>} />
      <Route path="/live"          element={<PrivateRoute><LiveMasterclass /></PrivateRoute>} />
      <Route path="*"              element={<NotFound />} />
    </Routes>
  );
}
