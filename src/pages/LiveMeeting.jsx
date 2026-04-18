import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';

const STYLES = `
  * { box-sizing:border-box; margin:0; padding:0; }
  html, body, #root { height:100%; }
  .meeting-page { height:100vh; background:#0A0A0A; display:flex; flex-direction:column; overflow:hidden; }
  .meeting-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:12px 24px; background:#111;
    border-bottom:1px solid rgba(255,255,255,.08);
    flex-shrink:0; height:56px;
  }
  .meeting-title { font-family:'Playfair Display',serif; font-size:1rem; color:#F8F5F2; }
  .badge {
    padding:3px 10px; border-radius:100px; font-size:.6rem;
    font-weight:600; letter-spacing:.1em; text-transform:uppercase;
  }
  .badge-attente { background:rgba(201,169,106,.1); color:#C9A96A; border:1px solid rgba(201,169,106,.2); }
  .badge-active  { background:rgba(76,175,80,.1); color:#4CAF50; border:1px solid rgba(76,175,80,.2); }
  .btn-leave {
    padding:7px 18px; background:rgba(239,83,80,.15); border:1px solid rgba(239,83,80,.3);
    border-radius:4px; color:#ef5350; font-family:'Montserrat',sans-serif;
    font-size:.65rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase;
    cursor:pointer;
  }
  .meeting-frame { flex:1; width:100%; border:none; display:block; }
  .lobby { flex:1; display:flex; align-items:center; justify-content:center; padding:40px 24px; }
  .lobby-box {
    background:#111; border:1px solid rgba(255,255,255,.08);
    border-radius:8px; padding:36px; max-width:400px; width:100%;
  }
  .lobby-title { font-family:'Playfair Display',serif; font-size:1.4rem; font-weight:600; margin-bottom:6px; text-align:center; }
  .lobby-sub { font-size:.75rem; color:rgba(248,245,242,.4); text-align:center; margin-bottom:28px; line-height:1.6; }
  .field { margin-bottom:14px; }
  .field label { display:block; font-size:.6rem; letter-spacing:.14em; text-transform:uppercase; color:rgba(248,245,242,.4); margin-bottom:5px; }
  .field input { width:100%; padding:11px 14px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:4px; color:#F8F5F2; font-family:'Montserrat',sans-serif; font-size:.84rem; outline:none; }
  .field input:focus { border-color:rgba(194,24,91,.4); }
  .btn-join { width:100%; padding:13px; background:#C2185B; border:none; border-radius:4px; color:#fff; font-family:'Montserrat',sans-serif; font-size:.75rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; cursor:pointer; margin-top:6px; }
  .btn-join:disabled { opacity:.5; cursor:not-allowed; }
  .error-msg { background:rgba(239,83,80,.1); border:1px solid rgba(239,83,80,.2); border-radius:4px; padding:9px 13px; font-size:.75rem; color:#ef5350; margin-bottom:14px; text-align:center; }
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
  const [jitsiUrl, setJitsiUrl] = useState("");

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

      // Construire l'URL Jitsi avec le nom pré-rempli
      const roomName = roomInfo?.titre
        ? roomInfo.titre.replace(/[^a-zA-Z0-9]/g, '').substring(0, 30)
        : `MMO${roomId.replace(/-/g, '').substring(0, 16)}`;

      const displayName = encodeURIComponent(myName);
      const url = `https://meet.jit.si/${roomName}#userInfo.displayName="${displayName}"&config.prejoinPageEnabled=false&config.startWithAudioMuted=false&config.startWithVideoMuted=false&config.disableDeepLinking=true&interfaceConfig.SHOW_JITSI_WATERMARK=false&interfaceConfig.SHOW_WATERMARK_FOR_GUESTS=false`;

      setJitsiUrl(url);
      setPhase("meeting");
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
          <span className="meeting-title">
            {roomInfo?.titre || "Méta'Morph'Ose — Live"}
          </span>
          <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
            {roomInfo && (
              <span className={`badge ${roomInfo.statut === "active" ? "badge-active" : "badge-attente"}`}>
                {roomInfo.statut === "active" ? "En direct" : "En attente"}
              </span>
            )}
            {phase === "meeting" && (
              <button className="btn-leave" onClick={() => navigate("/live")}>Quitter</button>
            )}
          </div>
        </div>

        {phase === "lobby" && (
          <div className="lobby">
            <div className="lobby-box">
              <h1 className="lobby-title">Rejoindre le live</h1>
              <p className="lobby-sub">
                {roomInfo?.titre || "Session Méta'Morph'Ose"}
                {roomInfo?.hote && ` · ${roomInfo.hote}`}
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

        {phase === "meeting" && jitsiUrl && (
          <iframe
            className="meeting-frame"
            src={jitsiUrl}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            title="Session Live"
          />
        )}
      </div>
    </>
  );
}
