import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider } from './context/AuthContext.jsx'
import './responsive.css'

const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';

// Service Worker désactivé — désinstallation propre
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(regs => {
    regs.forEach(reg => reg.unregister());
  });
}

// Garder le backend Render éveillé — ping toutes les 14 minutes
(function keepAlive() {
  const INTERVAL = 14 * 60 * 1000; // 14 minutes
  function ping() {
    fetch(`${API_BASE}/api/admin/config/public/`, { method: 'GET' })
      .catch(() => {}); // silencieux — on s'en fout du résultat
  }
  // Premier ping après 2 minutes (laisser le temps au site de charger)
  setTimeout(() => {
    ping();
    setInterval(ping, INTERVAL);
  }, 2 * 60 * 1000);
})();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
