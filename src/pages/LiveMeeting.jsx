import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';

const STYLES = `
  * { box-sizing:border-box; margin:0; padding:0; }
  .meeting-page { min-height:100vh; background:#0A0A0A; display:flex; flex-direction:column; font-family:'Montserrat',sans-serif; }
  .meeting-header { display:flex; align-items:center; justify-content:space-between; padding:16px 24px; background:#111; border-bottom:1px solid rgba(255,255,255,.08); }
  .meeting-title { font-family:'Playfair Display',serif; font-size:1rem; color:#F8F5F2; }
  .badge { padding:4px 12px; border-radius:100px; font-size:.62rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase; }
  .badge-attente { background:rgba(201,169,106,.1); color:#C9A96A; border:1px solid rgba(201,169,106,.2); }
  .badge-active  { background:rgba(76,175,80,.1); color:#4CAF50; border:1px solid rgba(76,175,80,.2); }
  .lobby { flex:1; display:flex; align-items:center; justify-content:center; padding:40px 24px; }
  .lobby-box { background:#111; border:1px solid rgba(255,255,255,.08); border-radius:8px; padding:40px; max-width:440px; width:100%; }
  .lobby-title { font-family:'Playfair Display',serif; font-size:1.5rem; font-weight:600; margin-bottom:8px; text-align:center; }
  .lobby-sub { font-size:.78rem; color:rgba(248,245,242,.4); text-align:center; margin-bottom:32px; line-height:1.7; }
  .field { margin-bottom:16px; }
  .field label { display:block; font-size:.62rem; letter-spacing:.14em; text-transform:uppercase; color:rgba(248,245,242,.4); margin-bottom:6px; }
  .field input { width:100%; padding:12px 16px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:4px; color:#F8F5F2; font-family:'Montserrat',sans-serif; font-size:.85rem; outline:none; }
  .field input:focus { border-color:rgba(194,24,91,.4); }
  .btn-join { width:100%; padding:14px; background:#C2185B; border:none; border-radius:4px; color:#fff; font-family:'Montserrat',sans-serif; font-size:.78rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; cursor:pointer; margin-top:8px; }
  .btn-join:disabled { opacity:.5; cursor:not-allowed; }
  .error-msg { background:rgba(239,83,80,.1); border:1px solid rgba(239,83,80,.2); border-radius:4px; padding:10px 14px; font-size:.78rem; color:#ef5350; margin-bottom:16px; text-align:center; }
  .zoom-box { flex:1; display:flex; align-items:center; justify-content:center; padding:40px 24px; }
  .zoom-card { background:#111; border:1px solid rgba(76,175,80,.2); border-radius:8px; padding:48px 40px; max-width:480px; width:100%; text-align:center; }
  .zoom-icon { font-size:3rem; margin-bottom:16px; }
  .zoom-title { font-family:'Playfair Display',serif; font-size:1.4rem; margin-bottom:8px; color:#F8F5F2; }
  .zoom-sub { font-size:.78rem; color:rgba(248,245,242,.45); margin-bottom:32px; line-height:1.7; }
  .btn-zoom { display:inline-block; padding:16px 32px; background:#2196F3; border:none; border-radius:6px; color:#fff; font-family:'Montserrat',sans-serif; font-size:.82rem; font-weight:700; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; text-decoration:none; margin-bottom:16px; }
  .btn-back { display:block; font-size:.72rem; color:rgba(248,245,242,.35); text-decoration:none; cursor:pointer; background:none; border:none; font-family:'Montserrat',sans-serif; margin-top:8px; }
  .spinner { width:18px; height:18px; border-radius:50%; border:2px solid rgba(255,255,255,.2); border-top-color:#C9A96A; animation:spin .7s linear infinite; margin:0 auto; }
  @keyframes spin { to{transform:rotate(360deg)} }
`;

export default function LiveMeeting() {
  const { roomId } = useParams();
  const navigate = useNavigate();
  const { user: authUser } = useAuth();

  const [phase,    setPhase]    = useState("lobby");
  const [roomInfo, setRoomInfo] = useState(null);
  const [myName,   setMyName]   = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const [zoomUrl,  setZoomUrl]  = useState("");

  useEffect(() => {
    const token = localStorage.getItem("mmorphose_token");
    fetch(`${API_BASE}/api/live/${roomId}/`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setRoomInfo(d); })
      .catch(() => {});

    if (authUser?.first_name) setMyName(authUser.first_name);
    else if (authUser?.email)  setMyName(authUser.email.split('@')[0]);
  }, [roomId]);

  async function rejoindre() {
    if (!myName.trim()) { setError("Votre prénom est requis."); return; }
    setLoading(true);
    setError("");

    const token = localStorage.getItem("mmorphose_token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;

    try {
      const res = await fetch(`${API_BASE}/api/live/${roomId}/rejoindre/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ nom: myName, code_acces: password }),
      });

      if (!res.ok) {
        const d = await res.json();
        setError(d.detail || "Accès refusé.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      // Récupérer le lien Zoom depuis roomInfo ou la réponse
      const zoom = roomInfo?.lien_zoom || data?.lien_zoom || '';
      setZoomUrl(zoom);
      setPhase("zoom");
    } catch {
      setError("Erreur réseau. Réessayez.");
    }
    setLoading(false);
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="meeting-page">
        <div className="meeting-header">
          <span className="meeting-title">{roomInfo?.titre || "Méta'Morph'Ose — Live"}</span>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            {roomInfo && (
              <span className={`badge ${roomInfo.statut === "active" ? "badge-active" : "badge-attente"}`}>
                {roomInfo.statut === "active" ? "En direct" : "En attente"}
              </span>
            )}
          </div>
        </div>

        {phase === "lobby" && (
          <div className="lobby">
            <div className="lobby-box">
              <h1 className="lobby-title">Rejoindre le live</h1>
              <p className="lobby-sub">
                {roomInfo?.titre || "Session Méta'Morph'Ose"}
                {roomInfo?.hote && ` · Animé par ${roomInfo.hote}`}
              </p>

              {error && <div className="error-msg">{error}</div>}

              <div className="field">
                <label>Votre prénom</label>
                <input
                  value={myName}
                  onChange={e => setMyName(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && rejoindre()}
                  placeholder="Entrez votre prénom"
                  autoFocus
                />
              </div>

              {roomInfo?.protege && (
                <div className="field">
                  <label>Code d'accès</label>
                  <input
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === "Enter" && rejoindre()}
                    placeholder="Code fourni par Coach Prélia"
                  />
                </div>
              )}

              <button className="btn-join" onClick={rejoindre} disabled={loading}>
                {loading ? <div className="spinner" /> : "Rejoindre la session"}
              </button>
            </div>
          </div>
        )}

        {phase === "zoom" && (
          <div className="zoom-box">
            <div className="zoom-card">
              <div className="zoom-icon">🎥</div>
              <h2 className="zoom-title">Vous êtes prête !</h2>
              <p className="zoom-sub">
                La session <strong>{roomInfo?.titre}</strong> vous attend.<br/>
                Cliquez ci-dessous pour rejoindre la visioconférence Zoom.
              </p>
              {zoomUrl ? (
                <a className="btn-zoom" href={zoomUrl} target="_blank" rel="noreferrer">
                  Rejoindre sur Zoom
                </a>
              ) : (
                <p style={{ color:'rgba(248,245,242,.4)', fontSize:'.78rem' }}>
                  Le lien Zoom n'est pas encore disponible. Contactez Coach Prélia.
                </p>
              )}
              <button className="btn-back" onClick={() => navigate("/live")}>
                ← Retour aux lives
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
