import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_URL from "../config";

/* ── Charger PeerJS depuis CDN ── */
function loadPeerJS() {
  return new Promise((resolve, reject) => {
    if (window.Peer) { resolve(window.Peer); return; }
    const s = document.createElement("script");
    s.src = "https://unpkg.com/peerjs@1.5.4/dist/peerjs.min.js";
    s.onload = () => resolve(window.Peer);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

export default function LiveMeeting() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const [phase, setPhase] = useState("lobby");
  const [roomInfo, setRoomInfo] = useState(null);
  const [myName, setMyName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [peerId, setPeerId] = useState("");
  const [role, setRole] = useState("participant");
  const [peers, setPeers] = useState({});
  const [audioOn, setAudioOn] = useState(true);
  const [videoOn, setVideoOn] = useState(true);
  const [screenSharing, setScreenSharing] = useState(false);
  const [sidebarTab, setSidebarTab] = useState("chat");
  const [messages, setMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [reactions, setReactions] = useState([]);
  const [handRaised, setHandRaised] = useState(false);
  const [raisedHands, setRaisedHands] = useState([]);

  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef = useRef(null);
  const localVideoRef = useRef(null);
  const chatEndRef = useRef(null);
  const dataConnsRef = useRef({});
  const mediaConnsRef = useRef({});
  const myNameRef = useRef("");
  const pollIntervalRef = useRef(null);

  /* ── Charger infos salle ── */
  useEffect(() => {
    fetch(`${API_URL}/api/live/${roomId}/`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setRoomInfo(d); else setError("Salle introuvable."); })
      .catch(() => setError("Impossible de joindre la salle."));
    const user = JSON.parse(localStorage.getItem("mmorphose_user") || "null");
    if (user?.prenom || user?.first_name) setMyName(user.prenom || user.first_name);
  }, [roomId]);

  /* ── Cleanup ── */
  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      localStreamRef.current?.getTracks().forEach(t => t.stop());
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      Object.values(mediaConnsRef.current).forEach(c => c.close());
      Object.values(dataConnsRef.current).forEach(c => c.close());
      peerRef.current?.destroy();
    };
  }, []);

  /* ── Scroll chat ── */
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  /* ── Démarrer caméra/micro ── */
  async function startLocalStream() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
    } catch {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        localStreamRef.current = stream;
        setVideoOn(false);
      } catch { console.warn("Pas d'acces camera/micro"); }
    }
  }

  /* ── Rejoindre ── */
  async function rejoindre() {
    if (!myName.trim()) { setError("Entrez votre prenom."); return; }
    setError("");
    myNameRef.current = myName;

    try {
      /* 1. API backend — rejoindre la salle */
      const token = localStorage.getItem("mmorphose_token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch(`${API_URL}/api/live/${roomId}/rejoindre/`, {
        method: "POST",
        headers,
        body: JSON.stringify({ nom: myName, mot_de_passe: password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Erreur"); return; }

      setPeerId(data.peer_id);
      setRole(data.role);

      /* 2. Stream local */
      await startLocalStream();

      /* 3. PeerJS */
      const PeerClass = await loadPeerJS();
      const peer = new PeerClass(data.peer_id, {
        debug: 1,
        config: {
          iceServers: [
            { urls: "stun:stun.l.google.com:19302" },
            { urls: "stun:stun1.l.google.com:19302" },
          ]
        }
      });
      peerRef.current = peer;

      peer.on("open", () => {
        console.log("[PeerJS] Connecte:", peer.id);
        /* Enregistrer le peer_id au backend */
        fetch(`${API_URL}/api/live/${roomId}/register-peer/`, {
          method: "POST",
          headers,
          body: JSON.stringify({ peer_id: data.peer_id, nom: myName }),
        }).catch(() => {});

        /* Polling pour decouvrir les autres peers */
        pollIntervalRef.current = setInterval(() => pollPeers(peer), 3000);
        pollPeers(peer);
      });

      peer.on("call", (call) => {
        call.answer(localStreamRef.current);
        handleMediaCall(call);
      });

      peer.on("connection", (conn) => {
        handleDataConnection(conn);
      });

      peer.on("error", (err) => {
        console.error("[PeerJS] Erreur:", err);
      });

      setPhase("meeting");
    } catch {
      setError("Erreur reseau.");
    }
  }

  /* ── Polling des peers via API REST ── */
  async function pollPeers(peer) {
    try {
      const res = await fetch(`${API_URL}/api/live/${roomId}/peers/`);
      if (!res.ok) return;
      const data = await res.json();
      const remotePeers = data.peers || [];

      remotePeers.forEach(rp => {
        if (rp.peer_id === peer.id) return;
        if (mediaConnsRef.current[rp.peer_id]) return;

        /* Appel video */
        if (localStreamRef.current) {
          const call = peer.call(rp.peer_id, localStreamRef.current);
          handleMediaCall(call);
        }

        /* Data channel */
        if (!dataConnsRef.current[rp.peer_id]) {
          const conn = peer.connect(rp.peer_id);
          handleDataConnection(conn);
        }

        setPeers(p => ({
          ...p,
          [rp.peer_id]: { name: rp.nom || "Participant", audio: true, video: true, ...(p[rp.peer_id] || {}) }
        }));
      });
    } catch {}
  }

  /* ── Gerer un appel media entrant/sortant ── */
  function handleMediaCall(call) {
    const rid = call.peer;
    mediaConnsRef.current[rid] = call;

    call.on("stream", (remoteStream) => {
      setPeers(p => ({ ...p, [rid]: { ...(p[rid] || { name: rid, audio: true, video: true }), stream: remoteStream } }));
    });

    call.on("close", () => {
      delete mediaConnsRef.current[rid];
      setPeers(p => { const n = { ...p }; delete n[rid]; return n; });
    });
  }

  /* ── Gerer une connexion data (chat, reactions, etc.) ── */
  function handleDataConnection(conn) {
    const rid = conn.peer;

    conn.on("open", () => {
      dataConnsRef.current[rid] = conn;
      /* Envoyer son nom */
      conn.send(JSON.stringify({ type: "hello", name: myNameRef.current }));
    });

    conn.on("data", (raw) => {
      try {
        const msg = typeof raw === "string" ? JSON.parse(raw) : raw;
        switch (msg.type) {
          case "hello":
            setPeers(p => ({ ...p, [rid]: { ...(p[rid] || {}), name: msg.name } }));
            break;
          case "chat":
            setMessages(m => [...m, { from: msg.name, text: msg.text, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) }]);
            break;
          case "reaction":
            addReaction(msg.emoji);
            break;
          case "media_state":
            setPeers(p => p[rid] ? { ...p, [rid]: { ...p[rid], audio: msg.audio, video: msg.video } } : p);
            break;
          case "raise_hand":
            if (msg.raised) setRaisedHands(h => [...h.filter(x => x.peer_id !== rid), { peer_id: rid, name: msg.name }]);
            else setRaisedHands(h => h.filter(x => x.peer_id !== rid));
            break;
        }
      } catch {}
    });

    conn.on("close", () => {
      delete dataConnsRef.current[rid];
    });
  }

  /* ── Broadcast un message data a tous les peers ── */
  function broadcast(msg) {
    const str = JSON.stringify(msg);
    Object.values(dataConnsRef.current).forEach(conn => {
      try { conn.send(str); } catch {}
    });
  }

  /* ── Controles audio/video ── */
  function toggleAudio() {
    if (!localStreamRef.current) return;
    const track = localStreamRef.current.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setAudioOn(track.enabled); }
    broadcast({ type: "media_state", audio: !audioOn, video: videoOn });
  }

  function toggleVideo() {
    if (!localStreamRef.current) return;
    const track = localStreamRef.current.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setVideoOn(track.enabled); }
    broadcast({ type: "media_state", audio: audioOn, video: !videoOn });
  }

  async function toggleScreen() {
    if (screenSharing) {
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      setScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        Object.values(mediaConnsRef.current).forEach(call => {
          const sender = call.peerConnection?.getSenders().find(s => s.track?.kind === "video");
          if (sender) sender.replaceTrack(stream.getVideoTracks()[0]);
        });
        stream.getVideoTracks()[0].onended = () => setScreenSharing(false);
        setScreenSharing(true);
      } catch { console.warn("Partage ecran annule"); }
    }
  }

  function quitter() {
    if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    Object.values(mediaConnsRef.current).forEach(c => c.close());
    Object.values(dataConnsRef.current).forEach(c => c.close());
    peerRef.current?.destroy();
    /* Notifier le backend */
    const token = localStorage.getItem("mmorphose_token");
    const headers = { "Content-Type": "application/json" };
    if (token) headers["Authorization"] = `Bearer ${token}`;
    fetch(`${API_URL}/api/live/${roomId}/leave-peer/`, {
      method: "POST", headers,
      body: JSON.stringify({ peer_id: peerId }),
    }).catch(() => {});
    setPhase("ended");
  }

  /* ── Chat ── */
  function sendChat(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    broadcast({ type: "chat", text: chatInput, name: myName });
    setMessages(m => [...m, { from: "Vous", text: chatInput, time: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), mine: true }]);
    setChatInput("");
  }

  /* ── Reactions ── */
  function sendReaction(emoji) {
    broadcast({ type: "reaction", emoji, name: myName });
    addReaction(emoji);
  }

  function addReaction(emoji) {
    const id = Date.now() + Math.random();
    const left = Math.random() * 80 + 10;
    setReactions(r => [...r, { id, emoji, left }]);
    setTimeout(() => setReactions(r => r.filter(x => x.id !== id)), 2000);
  }

  /* ── Main levee ── */
  function toggleHand() {
    const raised = !handRaised;
    setHandRaised(raised);
    broadcast({ type: "raise_hand", raised, name: myName });
  }

  /* ── Composant video peer ── */
  const PeerVideo = ({ pid, peer }) => {
    const ref = useRef(null);
    useEffect(() => { if (ref.current && peer.stream) ref.current.srcObject = peer.stream; }, [peer.stream]);
    return (
      <div style={{ position: "relative", background: "#1a1a1a", borderRadius: "8px", overflow: "hidden", aspectRatio: "16/9" }}>
        {peer.stream
          ? <video ref={ref} autoPlay playsInline style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(201,169,106,.2)", border: "2px solid rgba(201,169,106,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", fontWeight: 700, color: "#C9A96A" }}>
                {(peer.name || "?")[0].toUpperCase()}
              </div>
            </div>
        }
        <div style={{ position: "absolute", bottom: "8px", left: "8px", background: "rgba(0,0,0,.7)", padding: "3px 8px", borderRadius: "4px", fontSize: ".68rem", color: "#fff", fontFamily: "Montserrat,sans-serif" }}>{peer.name}</div>
        {peer.audio === false && <div style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(194,24,91,.8)", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".7rem" }}>🔇</div>}
      </div>
    );
  };

  const s = {
    body: { minHeight: "100vh", background: "#0A0A0A", color: "#F8F5F2", fontFamily: "Montserrat,sans-serif" },
    inp: { width: "100%", padding: "11px 14px", background: "rgba(255,255,255,.05)", border: "1px solid rgba(255,255,255,.1)", borderRadius: "6px", color: "#F8F5F2", fontFamily: "Montserrat,sans-serif", fontSize: ".88rem", outline: "none" },
    btn: { padding: "14px", background: "#C2185B", border: "none", borderRadius: "6px", color: "#fff", fontFamily: "Montserrat,sans-serif", fontWeight: 600, fontSize: ".82rem", letterSpacing: ".12em", textTransform: "uppercase", cursor: "pointer", width: "100%" },
    ctrlBtn: (active) => ({ width: "48px", height: "48px", borderRadius: "50%", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.1rem", background: active ? "#C2185B" : "rgba(255,255,255,.1)", color: "#fff" }),
  };

  /* ══════ LOBBY ══════ */
  if (phase === "lobby") return (
    <div style={s.body}>
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg,#0A0A0A,#1a0a0f)", padding: "24px" }}>
        <div style={{ maxWidth: "440px", width: "100%", background: "#111", border: "1px solid rgba(201,169,106,.15)", borderRadius: "12px", padding: "40px 32px" }}>
          <div style={{ textAlign: "center", marginBottom: "32px" }}>
            <p style={{ fontFamily: "Montserrat,sans-serif", fontSize: ".62rem", letterSpacing: ".25em", textTransform: "uppercase", color: "#C9A96A", marginBottom: "8px" }}>{roomInfo?.mode === "webinaire" ? "Webinaire" : roomInfo?.mode === "live" ? "Live" : "Reunion"}</p>
            <h1 style={{ fontFamily: "Playfair Display,serif", fontSize: "1.6rem", fontWeight: 600, marginBottom: "8px" }}>{roomInfo?.titre || "Chargement..."}</h1>
            {roomInfo && <p style={{ fontSize: ".78rem", color: "rgba(248,245,242,.45)" }}>{roomInfo.participants} participant{roomInfo.participants !== 1 ? "s" : ""}</p>}
          </div>
          {error && <p style={{ background: "rgba(239,68,68,.1)", border: "1px solid rgba(239,68,68,.3)", borderRadius: "6px", padding: "10px 14px", fontSize: ".78rem", color: "#f87171", marginBottom: "16px" }}>{error}</p>}
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

  /* ══════ ENDED ══════ */
  if (phase === "ended") return (
    <div style={{ ...s.body, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ textAlign: "center" }}>
        <p style={{ fontFamily: "Playfair Display,serif", fontSize: "2rem", fontWeight: 600, marginBottom: "16px" }}>Reunion terminee</p>
        <button onClick={() => navigate("/")} style={{ ...s.btn, width: "auto", padding: "14px 40px" }}>Retour a l accueil</button>
      </div>
    </div>
  );

  /* ══════ MEETING ══════ */
  const peerList = Object.entries(peers);
  const totalVideos = peerList.length + 1;
  const cols = totalVideos === 1 ? "1fr" : totalVideos <= 4 ? "1fr 1fr" : "repeat(3,1fr)";

  return (
    <div style={{ ...s.body, display: "grid", gridTemplateColumns: "1fr 300px", height: "100vh", overflow: "hidden" }}>
      {reactions.map(r => (
        <div key={r.id} style={{ position: "fixed", bottom: "120px", left: `${r.left}%`, fontSize: "2rem", pointerEvents: "none", zIndex: 999, animation: "floatUp 2s ease-out forwards" }}>{r.emoji}</div>
      ))}
      <style>{`@keyframes floatUp{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-200px);opacity:0}}`}</style>

      {/* ── Zone video ── */}
      <div style={{ display: "flex", flexDirection: "column", background: "#000" }}>
        <div style={{ flex: 1, display: "grid", gridTemplateColumns: cols, gap: "4px", padding: "8px", alignContent: "start", overflow: "hidden" }}>
          {/* Ma video */}
          <div style={{ position: "relative", background: "#1a1a1a", borderRadius: "8px", overflow: "hidden", aspectRatio: "16/9" }}>
            <video ref={localVideoRef} autoPlay playsInline muted style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", display: videoOn ? "block" : "none" }} />
            {!videoOn && (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(201,169,106,.2)", border: "2px solid rgba(201,169,106,.4)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.3rem", fontWeight: 700, color: "#C9A96A" }}>
                  {myName[0]?.toUpperCase()}
                </div>
              </div>
            )}
            <div style={{ position: "absolute", bottom: "8px", left: "8px", background: "rgba(0,0,0,.7)", padding: "3px 8px", borderRadius: "4px", fontSize: ".68rem", color: "#fff" }}>Vous {role === "hote" ? "👑" : ""}</div>
            {!audioOn && <div style={{ position: "absolute", top: "8px", right: "8px", background: "rgba(194,24,91,.8)", borderRadius: "50%", width: "24px", height: "24px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".7rem" }}>🔇</div>}
          </div>
          {peerList.map(([pid, peer]) => <PeerVideo key={pid} pid={pid} peer={peer} />)}
        </div>

        {/* ── Controles ── */}
        <div style={{ padding: "12px 24px", background: "rgba(0,0,0,.9)", display: "flex", alignItems: "center", justifyContent: "center", gap: "12px", borderTop: "1px solid rgba(255,255,255,.08)" }}>
          <button style={s.ctrlBtn(!audioOn)} onClick={toggleAudio}>{audioOn ? "🎤" : "🔇"}</button>
          <button style={s.ctrlBtn(!videoOn)} onClick={toggleVideo}>{videoOn ? "📹" : "🚫"}</button>
          <button style={s.ctrlBtn(screenSharing)} onClick={toggleScreen}>🖥️</button>
          <button style={s.ctrlBtn(handRaised)} onClick={toggleHand}>✋</button>
          {["👍", "❤️", "😂", "🎉", "👏"].map(emoji => (
            <button key={emoji} style={{ ...s.ctrlBtn(false), width: "38px", height: "38px", fontSize: "1rem" }} onClick={() => sendReaction(emoji)}>{emoji}</button>
          ))}
          <button style={{ ...s.ctrlBtn(false), background: "#ef4444" }} onClick={quitter}>📵</button>
        </div>
      </div>

      {/* ── Sidebar ── */}
      <div style={{ display: "flex", flexDirection: "column", background: "#111", borderLeft: "1px solid rgba(255,255,255,.08)" }}>
        <div style={{ display: "flex", borderBottom: "1px solid rgba(255,255,255,.08)" }}>
          {[["chat", "💬"], ["participants", "👥"]].map(([tab, icon]) => (
            <button key={tab} onClick={() => setSidebarTab(tab)} style={{ flex: 1, padding: "12px", background: "none", border: "none", color: sidebarTab === tab ? "#C9A96A" : "rgba(248,245,242,.45)", cursor: "pointer", fontSize: ".72rem", fontFamily: "Montserrat,sans-serif", borderBottom: sidebarTab === tab ? "2px solid #C9A96A" : "none" }}>
              {icon}
            </button>
          ))}
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "12px" }}>
          {sidebarTab === "chat" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {messages.length === 0 && <p style={{ textAlign: "center", color: "rgba(248,245,242,.3)", fontSize: ".78rem", padding: "24px 0" }}>Demarrez la conversation...</p>}
              {messages.map((m, i) => (
                <div key={i} style={{ background: m.mine ? "rgba(194,24,91,.1)" : "rgba(255,255,255,.04)", border: `1px solid ${m.mine ? "rgba(194,24,91,.2)" : "rgba(255,255,255,.06)"}`, borderRadius: "8px", padding: "10px 12px" }}>
                  <div style={{ fontSize: ".65rem", color: "#C9A96A", fontWeight: 600, marginBottom: "4px" }}>{m.from} <span style={{ color: "rgba(248,245,242,.3)", fontWeight: 300 }}>{m.time}</span></div>
                  <div style={{ fontSize: ".82rem", lineHeight: 1.5 }}>{m.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}

          {sidebarTab === "participants" && (
            <div>
              {raisedHands.length > 0 && (
                <div style={{ marginBottom: "12px" }}>
                  <p style={{ fontSize: ".62rem", letterSpacing: ".15em", textTransform: "uppercase", color: "#C9A96A", marginBottom: "8px" }}>Mains levees</p>
                  {raisedHands.map(h => <div key={h.peer_id} style={{ background: "rgba(201,169,106,.1)", border: "1px solid rgba(201,169,106,.25)", borderRadius: "6px", padding: "8px 12px", marginBottom: "6px", fontSize: ".78rem" }}>✋ {h.name}</div>)}
                </div>
              )}
              <p style={{ fontSize: ".62rem", letterSpacing: ".15em", textTransform: "uppercase", color: "rgba(248,245,242,.3)", marginBottom: "10px" }}>{peerList.length + 1} participant{peerList.length !== 0 ? "s" : ""}</p>
              {[{ name: myName, role, audio: audioOn, video: videoOn, mine: true }, ...peerList.map(([, p]) => p)].map((p, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "10px", padding: "8px", borderRadius: "6px", marginBottom: "6px", background: "rgba(255,255,255,.03)" }}>
                  <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(201,169,106,.2)", border: "1px solid rgba(201,169,106,.3)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: ".9rem", fontWeight: 700, color: "#C9A96A", flexShrink: 0 }}>
                    {(p.name || "?")[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: ".82rem", fontWeight: 500 }}>{p.mine ? "Vous" : p.name} {p.role === "hote" ? "👑" : ""}</p>
                    <p style={{ fontSize: ".65rem", color: "rgba(248,245,242,.35)" }}>{p.audio !== false ? "🎤" : "🔇"} {p.video !== false ? "📹" : "🚫"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {sidebarTab === "chat" && (
          <form onSubmit={sendChat} style={{ padding: "10px", borderTop: "1px solid rgba(255,255,255,.08)", display: "flex", gap: "8px" }}>
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Message..." style={{ flex: 1, padding: "8px 12px", background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.08)", borderRadius: "6px", color: "#F8F5F2", fontFamily: "Montserrat,sans-serif", fontSize: ".82rem", outline: "none" }} />
            <button type="submit" style={{ padding: "8px 12px", background: "#C2185B", border: "none", borderRadius: "6px", color: "#fff", cursor: "pointer" }}>➤</button>
          </form>
        )}
      </div>
    </div>
  );
}
