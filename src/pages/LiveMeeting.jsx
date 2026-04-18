import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';

const STYLES = `
  * { box-sizing:border-box; margin:0; padding:0; }
  body { background:#0A0A0A; color:#F8F5F2; font-family:'Montserrat',sans-serif; }
  .meeting-page { min-height:100vh; background:#0A0A0A; display:flex; flex-direction:column; }
  .meeting-header {
    display:flex; align-items:center; justify-content:space-between;
    padding:16px 24px; background:#111;
    border-bottom:1px solid rgba(255,255,255,.08);
    position:sticky; top:0; z-index:100;
  }
  .meeting-title { font-family:'Playfair Display',serif; font-size:1.1rem; color:#F8F5F2; }
  .meeting-badge {
    padding:4px 12px; border-radius:100px; font-size:.65rem;
    font-weight:600; letter-spacing:.1em; text-transform:uppercase;
  }
  .badge-attente { background:rgba(201,169,106,.1); color:#C9A96A; border:1px solid rgba(201,169,106,.2); }
  .badge-active  { background:rgba(76,175,80,.1); color:#4CAF50; border:1px solid rgba(76,175,80,.2); animation:pulse 2s infinite; }
  @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.6} }
  .lobby {
    flex:1; display:flex; align-items:center; justify-content:center;
    padding:40px 24px;
  }
  .lobby-box {
    background:#111; border:1px solid rgba(255,255,255,.08);
    border-radius:8px; padding:40px; max-width:420px; width:100%;
  }
  .lobby-title {
    font-family:'Playfair Display',serif; font-size:1.5rem;
    font-weight:600; margin-bottom:8px; text-align:center;
  }
  .lobby-sub {
    font-size:.78rem; color:rgba(248,245,242,.45);
    text-align:center; margin-bottom:32px; line-height:1.6;
  }
  .field { margin-bottom:16px; }
  .field label {
    display:block; font-size:.62rem; letter-spacing:.14em;
    text-transform:uppercase; color:rgba(248,245,242,.45); margin-bottom:6px;
  }
  .field input {
    width:100%; padding:12px 16px; background:rgba(255,255,255,.04);
    border:1px solid rgba(255,255,255,.08); border-radius:4px;
    color:#F8F5F2; font-family:'Montserrat',sans-serif; font-size:.85rem;
    outline:none; transition:border .2s;
  }
  .field input:focus { border-color:rgba(194,24,91,.4); }
  .btn-join {
    width:100%; padding:14px; background:#C2185B; border:none;
    border-radius:4px; color:#fff; font-family:'Montserrat',sans-serif;
    font-size:.78rem; font-weight:600; letter-spacing:.12em;
    text-transform:uppercase; cursor:pointer; transition:all .2s; margin-top:8px;
  }
  .btn-join:hover { background:#a01049; }
  .btn-join:disabled { opacity:.5; cursor:not-allowed; }
  .error-msg {
    background:rgba(239,83,80,.1); border:1px solid rgba(239,83,80,.2);
    border-radius:4px; padding:10px 14px; font-size:.78rem; color:#ef5350;
    margin-bottom:16px; text-align:center;
  }
  .meeting-frame { flex:1; width:100%; border:none; height:calc(100vh - 65px); display:block; }
  .btn-leave {
    padding:8px 20px; background:rgba(239,83,80,.1); border:1px solid rgba(239,83,80,.2);
    border-radius:4px; color:#ef5350; font-family:'Montserrat',sans-serif;
    font-size:.68rem; font-weight:600; letter-spacing:.1em; text-transform:uppercase;
    cursor:pointer; transition:all .2s;
  }
  .btn-leave:hover { background:rgba(239,83,80,.2); }
  .spinner { width:20px; height:20px; border-radius:50%; border:2px solid rgba(255,255,255,.2); border-top-color:#C9A96A; animation:spin .7s linear infinite; margin:0 auto; }
  @keyframes spin { to{transform:rotate(360deg)} }
`;

// Domaine Jitsi — gratuit, sans compte
const JITSI_DOMAIN = 'meet.jit.si';

export default function LiveMeeting() {
  const { roomId } = useParams();
  const navigate   = useNavigate();
  const { user: authUser } = useAuth();

  const [phase,    setPhase]    = useState("lobby");
  const [roomInfo, setRoomInfo] = useState(null);
  const [myName,   setMyName]   = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [loading,  setLoading]  = useState(false);
  const jitsiRef = useRef(null);
  const apiRef   = useRef(null);

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

  // Initialiser Jitsi après le passage en phase "meeting"
  useEffect(() => {
    if (phase !== "meeting") return;

    // Charger le script Jitsi si pas déjà chargé
    const loadJitsi = () => {
      if (window.JitsiMeetExternalAPI) {
        initJitsi();
        return;
      }
      const script = document.createElement('script');
      script.src = `https://${JITSI_DOMAIN}/external_api.js`;
      script.async = true;
      script.onload = initJitsi;
      document.head.appendChild(script);
    };

    const initJitsi = () => {
      if (!jitsiRef.current || apiRef.current) return;

      const token = localStorage.getItem("mmorphose_token");
      const isAdmin = authUser?.is_staff;
      const roomName = roomInfo?.titre ? roomInfo.titre.replace(/[^a-zA-Z0-9]/g, '-').substring(0, 50) : `metamorphose-${roomId.replace(/-/g, '').substring(0, 20)}`;

      apiRef.current = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, {
        roomName,
        parentNode: jitsiRef.current,
        userInfo: {
          displayName: myName,
          email: authUser?.email || '',
        },
        configOverwrite: {
          prejoinPageEnabled: false,
          disableInitialGUM: false,
          disableDeepLinking: true,
          startWithAudioMuted: !isAdmin,
          startWithVideoMuted: !isAdmin,
          // Modérateur = admin/Prélia
          moderatorEnabled: isAdmin,
        },
        interfaceConfigOverwrite: {
          TOOLBAR_BUTTONS: [
            'microphone', 'camera', 'desktop', 'chat',
            'raisehand', 'participants-pane', 'tileview',
            'fullscreen', 'hangup',
            ...(isAdmin ? ['mute-everyone', 'kick-everyone', 'security', 'recording'] : []),
          ],
          SHOW_JITSI_WATERMARK: false,
          SHOW_WATERMARK_FOR_GUESTS: false,
          DEFAULT_BACKGROUND: '#0A0A0A',
        },
        width: '100%',
        height: 'calc(100vh - 65px)',
      });

      // Quand l'utilisateur raccroche
      apiRef.current.addEventListener('readyToClose', () => {
        navigate('/live');
      });
    };

    loadJitsi();

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [phase]);

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

      setPhase("meeting");
    } catch {
      setError("Erreur réseau. Réessayez.");
    }
    setLoading(false);
  }

  function quitter() {
    if (apiRef.current) apiRef.current.dispose();
    navigate("/live");
  }

  return (
    <>
      <style>{STYLES}</style>
      <div className="meeting-page">
        <div className="meeting-header">
          <span className="meeting-title">
            {roomInfo?.titre || "Méta'Morph'Ose — Live"}
          </span>
          <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
            {roomInfo && (
              <span className={`meeting-badge ${roomInfo.statut === "active" ? "badge-active" : "badge-attente"}`}>
                {roomInfo.statut === "active" ? "En direct" : "En attente"}
              </span>
            )}
            {phase === "meeting" && (
              <button className="btn-leave" onClick={quitter}>Quitter</button>
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

        {phase === "meeting" && (
          <div ref={jitsiRef} className="meeting-frame" style={{height:"calc(100vh - 65px)", width:"100%"}} />
        )}
      </div>
    </>
  );
}
