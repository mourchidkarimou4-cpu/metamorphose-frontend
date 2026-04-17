import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ZegoUIKitPrebuilt } from "@zegocloud/zego-uikit-prebuilt";
import api from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';

const ZEGO_APP_ID = Number(import.meta.env.VITE_ZEGO_APP_ID);
const ZEGO_SERVER_SECRET = import.meta.env.VITE_ZEGO_SERVER_SECRET;

export default function LiveMeeting() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState("lobby");
  const [roomInfo, setRoomInfo] = useState(null);
  const [myName, setMyName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [role, setRole] = useState("participant");

  const meetingRef = useRef(null);
  const zpRef = useRef(null);

  const { user: authUser } = useAuth();

  /* ── Charger infos salle ── */
  useEffect(() => {
    api.get(`/api/live/${roomId}/`).then(r => { setRoomInfo(r.data); }).catch(() => setError("Impossible de joindre la salle."));
    if (authUser?.prenom || authUser?.first_name) setMyName(authUser.prenom || authUser.first_name || authUser.email || "");
  }, [roomId]);

  /* ── Cleanup ── */
  useEffect(() => {
    return () => {
      if (zpRef.current) {
        zpRef.current.destroy();
        zpRef.current = null;
      }
    };
  }, []);

  /* ── Rejoindre ── */
  async function rejoindre() {
    if (!myName.trim()) { setError("Entrez votre prenom."); return; }
    setError("");

    try {
      const savedToken = localStorage.getItem("mmorphose_token");
      const headers = { "Content-Type": "application/json" };
      if (savedToken) headers["Authorization"] = `Bearer ${savedToken}`;

      const res = await fetch(`${API_BASE}/api/live/${roomId}/rejoindre/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ nom: myName, mot_de_passe: password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Erreur"); return; }

      setRole(data.role);
      setPhase("meeting");

      /* Attendre que le DOM soit pret */
      setTimeout(() => startZegoMeeting(data.role), 300);
    } catch {
      setError("Erreur reseau.");
    }
  }

  /* ── Demarrer ZegoCloud ── */
  function startZegoMeeting(userRole) {
    if (!meetingRef.current) return;

    const userID = Math.random().toString(36).substring(2, 10);
    const kitToken = ZegoUIKitPrebuilt.generateKitTokenForTest(
      ZEGO_APP_ID,
      ZEGO_SERVER_SECRET,
      roomId.replace(/-/g, ""),
      userID,
      myName
    );

    const zp = ZegoUIKitPrebuilt.create(kitToken);
    zpRef.current = zp;

    const isHost = userRole === "hote";

    zp.joinRoom({
      container: meetingRef.current,
      scenario: {
        mode: isHost
          ? ZegoUIKitPrebuilt.VideoConference
          : ZegoUIKitPrebuilt.VideoConference,
      },
      maxUsers: 1000,
      turnOnMicrophoneWhenJoining: isHost,
      turnOnCameraWhenJoining: isHost,
      showMyCameraToggleButton: true,
      showMyMicrophoneToggleButton: true,
      showAudioVideoSettingsButton: true,
      showScreenSharingButton: true,
      showTextChat: true,
      showUserList: true,
      showRoomDetailsButton: true,
      showLayoutButton: true,
      showNonVideoUser: true,
      showRoomTimer: true,
      showLeavingView: false,
      layout: "Auto",
      branding: {
        logoURL: "",
      },
      sharedLinks: [
        {
          name: "Lien de la reunion",
          url: `${window.location.origin}/meeting/${roomId}`,
        },
      ],
      onLeave: () => {
        /* Notifier le backend */
        const tk = localStorage.getItem("mmorphose_token"); // via storage direct (dans callback)
        const h = { "Content-Type": "application/json" };
        if (tk) h["Authorization"] = `Bearer ${tk}`;
        if (isHost) {
          fetch(`${API_BASE}/api/live/${roomId}/terminer/`, {
            method: "POST", headers: h,
          }).catch(() => {});
        }
        zpRef.current = null;
        navigate("/live");
      },
    });
  }

  const s = {
    body: { minHeight: "100vh", background: "#0A0A0A", color: "#F8F5F2", fontFamily: "Montserrat,sans-serif" },
    inp: { width: "100%", padding: "11px 14px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "6px", color: "#F8F5F2", fontFamily: "Montserrat,sans-serif", fontSize: ".88rem", outline: "none" },
    btn: { padding: "14px", background: "#C2185B", border: "none", borderRadius: "6px", color: "#fff", fontFamily: "Montserrat,sans-serif", fontWeight: 600, fontSize: ".82rem", letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer", width: "100%" },
  };

  /* ══════ LOBBY ══════ */
  if (phase === "lobby") return (
    <div style={s.body}>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#0A0A0A,#1a0a0f)", padding: "24px" }}>
        <div style={{ maxWidth: "440px", width: "100%", background: "#111", border: "1px solid rgba(201,169,106,.15)", borderRadius: "12px", padding: "40px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: ".62rem", letterSpacing: ".25em", textTransform: "uppercase", color: "#C9A96A", marginBottom: "8px" }}>
              {roomInfo?.mode === "webinaire" ? "Webinaire" : roomInfo?.mode === "live" ? "Live" : "Reunion"}
            </p>
            <h1 style={{ fontFamily: "Playfair Display,serif", fontSize: "1.6rem", fontWeight: 600, marginBottom: "8px" }}>
              {roomInfo?.titre || "Chargement..."}
            </h1>
            {roomInfo && (
              <p style={{ fontSize: ".78rem", color: "rgba(248,245,242,.45)" }}>
                {roomInfo.participants} participant{roomInfo.participants !== 1 ? "s" : ""}
              </p>
            )}
          </div>
          {error && (
            <p style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: "6px", padding: "10px 14px", fontSize: ".78rem", color: "#f87171", marginBottom: "16px" }}>
              {error}
            </p>
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <label style={{ fontSize: ".62rem", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(248,245,242,.45)", display: "block", marginBottom: "6px" }}>Votre prenom *</label>
              <input value={myName} onChange={e => setMyName(e.target.value)} placeholder="Prenom" style={s.inp} onKeyDown={e => e.key === "Enter" && rejoindre()} />
            </div>
            {roomInfo?.protege && (
              <div>
                <label style={{ fontSize: ".62rem", letterSpacing: ".14em", textTransform: "uppercase", color: "rgba(248,245,242,.45)", display: "block", marginBottom: "6px" }}>Mot de passe</label>
                <input type="password" value={password} onChange={e => setPassword(e.target.value)} style={s.inp} />
              </div>
            )}
            <button onClick={rejoindre} style={s.btn}>Rejoindre la reunion</button>
            <button onClick={() => navigate(-1)} style={{ ...s.btn, background: "transparent", border: "1px solid rgba(255,255,255,.1)", color: "rgba(248,245,242,.45)" }}>Retour</button>
          </div>
        </div>
      </div>
    </div>
  );

  /* ══════ MEETING (ZegoCloud prend le relais) ══════ */
  return (
    <div style={{ width: "100vw", height: "100vh", background: "#0A0A0A" }}>
      <div ref={meetingRef} style={{ width: "100%", height: "100%" }} />
    </div>
  );
}
