import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const JITSI_DOMAIN = "meet.jit.si";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --noir:#0A0A0A; --or:#C9A96A; --or-light:#E8D5A8;
    --rose:#C2185B; --beige:#D8C1A0; --beige-light:#F2EBE0;
    --blanc:#F8F5F2;
    --ff-t:'Playfair Display',Georgia,serif;
    --ff-b:'Montserrat',sans-serif;
    --ease:cubic-bezier(0.4,0,0.2,1);
  }
  html { scroll-behavior:smooth; }
  body { background:var(--noir); color:var(--blanc); font-family:var(--ff-b); font-weight:300; overflow-x:hidden; }

  @keyframes fadeUp  { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes pulse-rose { 0%,100%{box-shadow:0 0 20px rgba(194,24,91,.35)} 50%{box-shadow:0 0 40px rgba(194,24,91,.65)} }
  @keyframes blink   { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes spin    { to{transform:rotate(360deg)} }

  .btn-p {
    display:inline-flex; align-items:center; justify-content:center; gap:10px;
    background:var(--rose); color:#fff; font-family:var(--ff-b); font-weight:700;
    font-size:.75rem; letter-spacing:.16em; text-transform:uppercase;
    padding:14px 28px; border:none; border-radius:2px; cursor:pointer;
    text-decoration:none; transition:all .35s;
  }
  .btn-p:hover { background:#a01049; transform:translateY(-2px); }

  .btn-or {
    display:inline-flex; align-items:center; justify-content:center; gap:10px;
    background:transparent; color:var(--or); font-family:var(--ff-b); font-weight:600;
    font-size:.75rem; letter-spacing:.16em; text-transform:uppercase;
    padding:13px 24px; border:1px solid var(--or); border-radius:2px; cursor:pointer;
    text-decoration:none; transition:all .35s;
  }
  .btn-or:hover { background:var(--or); color:var(--noir); }

  .live-badge {
    display:inline-flex; align-items:center; gap:8px;
    background:rgba(194,24,91,.15); border:1px solid rgba(194,24,91,.4);
    border-radius:100px; padding:6px 16px;
    font-family:var(--ff-b); font-size:.65rem; font-weight:700;
    letter-spacing:.18em; text-transform:uppercase; color:var(--rose);
  }
  .live-dot {
    width:8px; height:8px; border-radius:50%; background:var(--rose);
    animation:blink 1s ease-in-out infinite;
  }

  .replay-card {
    background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.06);
    border-radius:6px; overflow:hidden; transition:all .35s;
  }
  .replay-card:hover { transform:translateY(-4px); border-color:rgba(201,169,106,.2); }

  .tab-btn {
    padding:10px 24px; background:transparent;
    border:none; border-bottom:2px solid transparent;
    color:rgba(248,245,242,.4); font-family:var(--ff-b);
    font-size:.72rem; font-weight:500; letter-spacing:.12em;
    text-transform:uppercase; cursor:pointer; transition:all .25s;
  }
  .tab-btn.active { color:var(--or); border-bottom-color:var(--or); }
  .tab-btn:hover:not(.active) { color:rgba(248,245,242,.7); }

  #jitsi-container { width:100%; height:100%; border:none; border-radius:4px; }

  @media(max-width:768px) {
    .live-grid { grid-template-columns:1fr !important; }
    .replays-grid { grid-template-columns:1fr !important; }
    .btn-p, .btn-or { width:100% !important; justify-content:center !important; }
  }
`;

/* ── Composant Jitsi Meet ───────────────────────────────────── */
function JitsiMeet({ roomName, displayName, isAdmin, onClose }) {
  const containerRef = useRef(null);
  const apiRef       = useRef(null);

  useEffect(() => {
    if (!window.JitsiMeetExternalAPI) return;

    const options = {
      roomName: `metamorphose-${roomName}`,
      width: "100%",
      height: "100%",
      parentNode: containerRef.current,
      userInfo: { displayName: displayName || "Participante" },
      configOverwrite: {
        startWithAudioMuted: !isAdmin,
        startWithVideoMuted: !isAdmin,
        disableDeepLinking: true,
        prejoinPageEnabled: false,
        enableRecording: isAdmin,
        fileRecordingsEnabled: isAdmin,
        liveStreamingEnabled: false,
        toolbarButtons: isAdmin
          ? ['microphone','camera','chat','recording','tileview','hangup','fullscreen','settings']
          : ['microphone','camera','chat','tileview','hangup','fullscreen','raisehand'],
      },
      interfaceConfigOverwrite: {
        TOOLBAR_ALWAYS_VISIBLE: true,
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: '#0A0A0A',
        DISABLE_JOIN_LEAVE_NOTIFICATIONS: false,
        MOBILE_APP_PROMO: false,
      },
    };

    apiRef.current = new window.JitsiMeetExternalAPI(JITSI_DOMAIN, options);

    apiRef.current.addEventListeners({
      readyToClose: () => { onClose && onClose(); },
      videoConferenceLeft: () => { onClose && onClose(); },
    });

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
        apiRef.current = null;
      }
    };
  }, [roomName, displayName, isAdmin]);

  return (
    <div ref={containerRef} style={{ width:"100%", height:"100%", minHeight:"500px", borderRadius:"6px", overflow:"hidden" }}/>
  );
}

/* ── COMPOSANT PRINCIPAL ────────────────────────────────────── */
export default function LiveMasterclass() {
  const [tab,         setTab]         = useState("live"); // live | replays
  const [liveActif,   setLiveActif]   = useState(false);
  const [roomName,    setRoomName]    = useState("");
  const [inSession,   setInSession]   = useState(false);
  const [jitsiLoaded, setJitsiLoaded] = useState(false);
  const [replays,     setReplays]     = useState([]);
  const [loadingReplays, setLoadingReplays] = useState(true);

  const token   = localStorage.getItem("mmorphose_token");
  const user    = JSON.parse(localStorage.getItem("mmorphose_user") || "null");
  const isAdmin = user?.is_staff === true;
  const isMembre = !!token && !!user;

  // Charger le SDK Jitsi
  useEffect(() => {
    if (window.JitsiMeetExternalAPI) { setJitsiLoaded(true); return; }
    const script = document.createElement("script");
    script.src = `https://${JITSI_DOMAIN}/external_api.js`;
    script.async = true;
    script.onload = () => setJitsiLoaded(true);
    document.head.appendChild(script);
  }, []);

  // Charger les replays
  useEffect(() => {
    fetch(`/api/contenu/replays/`, {
      headers: token ? { "Authorization": `Bearer ${token}` } : {},
    })
    .then(r => r.ok ? r.json() : [])
    .then(data => { setReplays(Array.isArray(data) ? data : []); setLoadingReplays(false); })
    .catch(() => setLoadingReplays(false));
  }, []);

  // Vérifier si un live est en cours
  useEffect(() => {
    // En production, appeler l'API pour vérifier le statut du live
    // Pour l'instant on utilise SiteConfig
    fetch(`/api/admin/config/public/`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (Array.isArray(data)) {
          const liveConfig = data.find(d => d.cle === "live_actif");
          const roomConfig = data.find(d => d.cle === "live_room_name");
          if (liveConfig?.valeur === "1") {
            setLiveActif(true);
            setRoomName(roomConfig?.valeur || "masterclass-mmo");
          }
        }
      })
      .catch(() => {});
  }, []);

  function demarrerLive() {
    const room = `masterclass-${Date.now()}`;
    setRoomName(room);
    // Sauvegarder le nom de la salle dans SiteConfig
    if (token) {
      fetch(`/api/admin/config/update/`, {
        method: "POST",
        headers: { "Content-Type":"application/json", "Authorization":`Bearer ${token}` },
        body: JSON.stringify({ cle:"live_actif", valeur:"1", section:"live" }),
      });
      fetch(`/api/admin/config/update/`, {
        method: "POST",
        headers: { "Content-Type":"application/json", "Authorization":`Bearer ${token}` },
        body: JSON.stringify({ cle:"live_room_name", valeur:room, section:"live" }),
      });
    }
    setLiveActif(true);
    setInSession(true);
  }

  function terminerLive() {
    if (token) {
      fetch(`/api/admin/config/update/`, {
        method: "POST",
        headers: { "Content-Type":"application/json", "Authorization":`Bearer ${token}` },
        body: JSON.stringify({ cle:"live_actif", valeur:"0", section:"live" }),
      });
    }
    setLiveActif(false);
    setInSession(false);
    setRoomName("");
  }

  return (
    <>
      <style>{STYLES}</style>

      {/* ── NAVBAR ── */}
      <nav style={{ padding:"14px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(10,10,10,.97)", backdropFilter:"blur(20px)", zIndex:200, position:"sticky", top:0 }}>
        <Link to="/" style={{ textDecoration:"none" }}>
          <span style={{ fontFamily:"var(--ff-t)", fontSize:"1rem" }}>
            <span style={{color:"var(--blanc)"}}>Meta'</span>
            <span style={{color:"var(--or)"}}>Morph'</span>
            <span style={{color:"var(--rose)"}}>Ose</span>
          </span>
        </Link>
        <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
          {liveActif && (
            <div className="live-badge">
              <div className="live-dot"/>
              LIVE EN COURS
            </div>
          )}
          <Link to={isAdmin ? "/admin" : "/dashboard"} style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".12em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}>
            {isAdmin ? "Admin" : "Mon espace"}
          </Link>
        </div>
      </nav>

      <main style={{ maxWidth:"1200px", margin:"0 auto", padding:"0 24px 80px" }}>

        {/* ── HEADER ── */}
        <div style={{ padding:"48px 0 32px", textAlign:"center" }}>
          <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"var(--or)", marginBottom:"12px", animation:"fadeUp .7s both" }}>
            Méta'Morph'Ose
          </p>
          <h1 style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.8rem,5vw,2.8rem)", fontWeight:700, lineHeight:1.1, marginBottom:"16px", animation:"fadeUp .8s .1s both" }}>
            Lives & Replays
          </h1>
          <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.5)", lineHeight:1.75, animation:"fadeUp .8s .2s both" }}>
            Participez aux lives en direct de Prélia ou revoyez les sessions passées à votre rythme.
          </p>
        </div>

        {/* ── TABS ── */}
        <div style={{ display:"flex", borderBottom:"1px solid rgba(255,255,255,.06)", marginBottom:"36px" }}>
          <button className={`tab-btn ${tab==="live"?"active":""}`} onClick={()=>setTab("live")}>
            Live en direct
          </button>
          <button className={`tab-btn ${tab==="replays"?"active":""}`} onClick={()=>setTab("replays")}>
            Replays ({replays.length})
          </button>
        </div>

        {/* ── TAB LIVE ── */}
        {tab === "live" && (
          <div>
            {/* Admin — contrôles */}
            {isAdmin && (
              <div style={{ padding:"20px 24px", background:"rgba(201,169,106,.05)", border:"1px solid rgba(201,169,106,.15)", borderRadius:"6px", marginBottom:"28px", display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:"12px" }}>
                <div>
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".18em", textTransform:"uppercase", color:"var(--or)", marginBottom:"4px" }}>Contrôles Admin</p>
                  <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".78rem", color:"rgba(248,245,242,.5)" }}>
                    {liveActif ? `Live en cours · Salle : ${roomName}` : "Aucun live actif pour le moment"}
                  </p>
                </div>
                <div style={{ display:"flex", gap:"10px" }}>
                  {!liveActif ? (
                    <button onClick={demarrerLive} className="btn-p" style={{ animation:"pulse-rose 3s ease-in-out infinite" }}>
                      Démarrer un live
                    </button>
                  ) : (
                    <button onClick={terminerLive} style={{ padding:"13px 24px", background:"rgba(239,83,80,.15)", border:"1px solid rgba(239,83,80,.4)", borderRadius:"2px", color:"#ef5350", fontFamily:"var(--ff-b)", fontWeight:700, fontSize:".72rem", letterSpacing:".14em", textTransform:"uppercase", cursor:"pointer" }}>
                      Terminer le live
                    </button>
                  )}
                  {liveActif && !inSession && (
                    <button onClick={()=>setInSession(true)} className="btn-or">
                      Rejoindre ma salle
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Zone Live */}
            {liveActif && roomName ? (
              <div>
                <div style={{ marginBottom:"16px", display:"flex", alignItems:"center", gap:"12px", flexWrap:"wrap" }}>
                  <div className="live-badge">
                    <div className="live-dot"/>
                    EN DIRECT
                  </div>
                  <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".8rem", color:"rgba(248,245,242,.5)" }}>
                    Masterclass Méta'Morph'Ose · Prélia Apedo
                  </p>
                </div>

                {jitsiLoaded ? (
                  <div style={{ height:"600px", borderRadius:"6px", overflow:"hidden", border:"1px solid rgba(201,169,106,.1)" }}>
                    {(isMembre || isAdmin) ? (
                      <JitsiMeet
                        roomName={roomName}
                        displayName={user?.first_name || user?.email || "Participante"}
                        isAdmin={isAdmin}
                        onClose={() => { if (isAdmin) terminerLive(); else setInSession(false); }}
                      />
                    ) : (
                      <div style={{ height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:"16px", background:"rgba(255,255,255,.02)" }}>
                        <p style={{ fontFamily:"var(--ff-b)", fontSize:".8rem", color:"rgba(248,245,242,.5)" }}>
                          Connecte-toi pour participer au live
                        </p>
                        <Link to="/espace-membre" className="btn-p">
                          Se connecter
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div style={{ height:"400px", display:"flex", alignItems:"center", justifyContent:"center", border:"1px solid rgba(255,255,255,.06)", borderRadius:"6px" }}>
                    <div style={{ textAlign:"center" }}>
                      <div style={{ width:"36px", height:"36px", border:"3px solid rgba(201,169,106,.2)", borderTopColor:"var(--or)", borderRadius:"50%", animation:"spin .7s linear infinite", margin:"0 auto 16px" }}/>
                      <p style={{ fontFamily:"var(--ff-b)", fontSize:".8rem", color:"rgba(248,245,242,.4)" }}>Chargement du live…</p>
                    </div>
                  </div>
                )}

                {/* Info enregistrement */}
                {isAdmin && (
                  <div style={{ marginTop:"16px", padding:"14px 20px", background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.05)", borderRadius:"4px" }}>
                    <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".75rem", color:"rgba(248,245,242,.4)", lineHeight:1.65 }}>
                      Pour enregistrer le live : dans l'interface Jitsi, clique sur le bouton <strong style={{color:"var(--or)"}}>Enregistrement</strong> (icône cercle rouge). L'enregistrement sera disponible en téléchargement à la fin de la session. Tu pourras ensuite l'ajouter dans <strong style={{color:"var(--or)"}}>Admin → Replays</strong>.
                    </p>
                  </div>
                )}
              </div>
            ) : (
              /* Pas de live actif */
              <div style={{ textAlign:"center", padding:"80px 24px", border:"1px solid rgba(255,255,255,.05)", borderRadius:"6px", background:"rgba(255,255,255,.02)" }}>
                <div style={{ fontSize:"3rem", marginBottom:"20px", opacity:.3 }}>📡</div>
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(248,245,242,.25)", marginBottom:"12px" }}>Aucun live en cours</p>
                <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.3rem,3vw,1.8rem)", fontWeight:600, marginBottom:"12px", color:"rgba(248,245,242,.6)" }}>
                  Pas de live pour le moment
                </h2>
                <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.35)", lineHeight:1.75, marginBottom:"28px", maxWidth:"440px", margin:"0 auto 28px" }}>
                  Prélia organisera prochainement un live exclusif. Tu seras notifiée dès qu'un live est planifié. En attendant, consulte les replays des sessions passées.
                </p>
                <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
                  <button onClick={()=>setTab("replays")} className="btn-or">
                    Voir les replays
                  </button>
                  <a href="https://wa.me/22901961140933" target="_blank" rel="noreferrer" className="btn-p">
                    Contacter Prélia
                  </a>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── TAB REPLAYS ── */}
        {tab === "replays" && (
          <div>
            {!isMembre ? (
              <div style={{ textAlign:"center", padding:"60px 24px", border:"1px solid rgba(255,255,255,.05)", borderRadius:"6px" }}>
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".8rem", color:"rgba(248,245,242,.4)", marginBottom:"16px" }}>
                  Les replays sont réservés aux membres du programme.
                </p>
                <Link to="/espace-membre" className="btn-p">Se connecter</Link>
              </div>
            ) : loadingReplays ? (
              <div style={{ textAlign:"center", padding:"60px" }}>
                <div style={{ width:"36px", height:"36px", border:"3px solid rgba(201,169,106,.2)", borderTopColor:"var(--or)", borderRadius:"50%", animation:"spin .7s linear infinite", margin:"0 auto" }}/>
              </div>
            ) : replays.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 24px", border:"1px solid rgba(255,255,255,.05)", borderRadius:"6px" }}>
                <div style={{ fontSize:"2.5rem", marginBottom:"16px", opacity:.3 }}>🎬</div>
                <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.1rem", color:"rgba(248,245,242,.4)" }}>
                  Aucun replay disponible pour le moment.
                </p>
                <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".8rem", color:"rgba(248,245,242,.25)", marginTop:"8px" }}>
                  Les replays des lives seront ajoutés ici après chaque session.
                </p>
              </div>
            ) : (
              <div className="replays-grid" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(300px,1fr))", gap:"20px" }}>
                {replays.map((replay, i) => (
                  <div key={replay.id} className="replay-card">
                    {/* Thumbnail */}
                    <div style={{ height:"160px", background:"linear-gradient(135deg,rgba(194,24,91,.12),rgba(201,169,106,.08))", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
                      <div style={{ width:"52px", height:"52px", borderRadius:"50%", background:"rgba(194,24,91,.2)", border:"2px solid rgba(194,24,91,.4)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        <span style={{ fontSize:"1.4rem" }}>▶</span>
                      </div>
                      <div style={{ position:"absolute", top:"10px", left:"10px" }}>
                        <span style={{ fontFamily:"var(--ff-b)", fontSize:".55rem", letterSpacing:".14em", textTransform:"uppercase", padding:"4px 10px", background:"rgba(194,24,91,.2)", border:"1px solid rgba(194,24,91,.3)", borderRadius:"100px", color:"var(--rose)" }}>
                          Semaine {replay.semaine}
                        </span>
                      </div>
                    </div>
                    {/* Contenu */}
                    <div style={{ padding:"20px" }}>
                      <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1rem", fontWeight:600, marginBottom:"8px", lineHeight:1.3 }}>{replay.titre}</h3>
                      {replay.description && (
                        <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".78rem", color:"rgba(248,245,242,.5)", lineHeight:1.65, marginBottom:"16px" }}>
                          {replay.description.substring(0, 100)}…
                        </p>
                      )}
                      <a href={replay.url} target="_blank" rel="noreferrer" className="btn-p" style={{ width:"100%", fontSize:".68rem", padding:"12px" }}>
                        Regarder le replay
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}
