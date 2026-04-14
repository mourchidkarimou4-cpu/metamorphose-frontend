import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API_URL from "../config";

const WS_URL = API_URL.replace("https://", "wss://").replace("http://", "ws://");

export default function LiveMeeting() {
  const { roomId } = useParams();
  const navigate   = useNavigate();

  const [phase,        setPhase]        = useState("lobby");
  const [roomInfo,     setRoomInfo]     = useState(null);
  const [myName,       setMyName]       = useState("");
  const [password,     setPassword]     = useState("");
  const [error,        setError]        = useState("");
  const [peerId,       setPeerId]       = useState("");
  const [role,         setRole]         = useState("participant");
  const [peers,        setPeers]        = useState({});
  const [audioOn,      setAudioOn]      = useState(true);
  const [videoOn,      setVideoOn]      = useState(true);
  const [screenSharing,setScreenSharing]= useState(false);
  const [sidebarTab,   setSidebarTab]   = useState("chat");
  const [messages,     setMessages]     = useState([]);
  const [chatInput,    setChatInput]    = useState("");
  const [reactions,    setReactions]    = useState([]);
  const [polls,        setPolls]        = useState([]);
  const [raisedHands,  setRaisedHands]  = useState([]);
  const [handRaised,   setHandRaised]   = useState(false);
  const [newPoll,      setNewPoll]      = useState({question:"", options:["",""]});

  const wsRef          = useRef(null);
  const localStreamRef = useRef(null);
  const screenStreamRef= useRef(null);
  const pcRefs         = useRef({});
  const localVideoRef  = useRef(null);
  const chatEndRef     = useRef(null);
  const myNameRef      = useRef("");
  const peerIdRef      = useRef("");

  useEffect(() => {
    fetch(`${API_URL}/api/live/${roomId}/`)
      .then(r => r.ok ? r.json() : null)
      .then(d => { if (d) setRoomInfo(d); else setError("Salle introuvable."); })
      .catch(() => setError("Impossible de joindre la salle."));
    const user = JSON.parse(localStorage.getItem("mmorphose_user") || "null");
    if (user?.prenom) setMyName(user.prenom);
  }, [roomId]);

  async function rejoindre() {
    if (!myName.trim()) { setError("Entrez votre prénom."); return; }
    setError("");
    try {
      const res = await fetch(`${API_URL}/api/live/${roomId}/rejoindre/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nom: myName, mot_de_passe: password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.detail || "Erreur"); return; }
      setPeerId(data.peer_id);
      setRole(data.role);
      peerIdRef.current = data.peer_id;
      myNameRef.current = myName;
      await startLocalStream();
      connectWebSocket(data.peer_id, data.role);
      setPhase("meeting");
    } catch { setError("Erreur réseau."); }
  }

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
      } catch { console.warn("Pas acces camera/micro"); }
    }
  }

  function connectWebSocket(pid, pRole) {
    const ws = new WebSocket(`${WS_URL}/ws/live/${roomId}/`);
    wsRef.current = ws;
    ws.onopen = () => {
      ws.send(JSON.stringify({ type: "join", peer_id: pid, role: pRole, name: myNameRef.current }));
    };
    ws.onmessage = async (e) => {
      const data = JSON.parse(e.data);
      switch (data.type) {
        case "peer_joined":
          if (data.peer_id !== peerIdRef.current) {
            setPeers(p => ({ ...p, [data.peer_id]: { name: data.name, role: data.role, audio: true, video: true } }));
            await createOffer(data.peer_id);
          }
          break;
        case "peer_left":
          setPeers(p => { const n = {...p}; delete n[data.peer_id]; return n; });
          if (pcRefs.current[data.peer_id]) { pcRefs.current[data.peer_id].close(); delete pcRefs.current[data.peer_id]; }
          break;
        case "offer":
          if (data.to_id === peerIdRef.current) await handleOffer(data);
          break;
        case "answer":
          if (data.to_id === peerIdRef.current) await handleAnswer(data);
          break;
        case "ice_candidate":
          if (data.to_id === peerIdRef.current) await handleIceCandidate(data);
          break;
        case "chat":
          setMessages(m => [...m, { from: data.name, text: data.message, time: new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}) }]);
          break;
        case "reaction":
          addReaction(data.emoji, data.name);
          break;
        case "media_state":
          setPeers(p => p[data.peer_id] ? { ...p, [data.peer_id]: { ...p[data.peer_id], audio: data.audio, video: data.video } } : p);
          break;
        case "poll":
          setPolls(p => [...p, { question: data.question, options: data.options, votes: {} }]);
          setSidebarTab("sondages");
          break;
        case "raise_hand":
          if (data.raised) setRaisedHands(h => [...h.filter(x => x.peer_id !== data.peer_id), { peer_id: data.peer_id, name: data.name }]);
          else setRaisedHands(h => h.filter(x => x.peer_id !== data.peer_id));
          break;
      }
    };
  }

  async function createOffer(targetId) {
    const pc = createPeerConnection(targetId);
    try {
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      wsRef.current?.send(JSON.stringify({ type: "offer", offer, to_id: targetId }));
    } catch(e) { console.error(e); }
  }

  async function handleOffer({ offer, from_id, name }) {
    const pc = createPeerConnection(from_id);
    setPeers(p => ({ ...p, [from_id]: { name: name || from_id, audio: true, video: true } }));
    try {
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      wsRef.current?.send(JSON.stringify({ type: "answer", answer, to_id: from_id }));
    } catch(e) { console.error(e); }
  }

  async function handleAnswer({ answer, from_id }) {
    const pc = pcRefs.current[from_id];
    if (pc) { try { await pc.setRemoteDescription(new RTCSessionDescription(answer)); } catch(e) { console.error(e); } }
  }

  async function handleIceCandidate({ candidate, from_id }) {
    const pc = pcRefs.current[from_id];
    if (pc && candidate) { try { await pc.addIceCandidate(new RTCIceCandidate(candidate)); } catch(e) { console.error(e); } }
  }

  function createPeerConnection(targetId) {
    if (pcRefs.current[targetId]) return pcRefs.current[targetId];
    const pc = new RTCPeerConnection({ iceServers: [{ urls: "stun:stun.l.google.com:19302" }] });
    if (localStreamRef.current) localStreamRef.current.getTracks().forEach(track => pc.addTrack(track, localStreamRef.current));
    pc.ontrack = (e) => { const stream = e.streams[0]; setPeers(p => ({ ...p, [targetId]: { ...(p[targetId] || {}), stream } })); };
    pc.onicecandidate = (e) => { if (e.candidate) wsRef.current?.send(JSON.stringify({ type: "ice_candidate", candidate: e.candidate, to_id: targetId })); };
    pcRefs.current[targetId] = pc;
    return pc;
  }

  function toggleAudio() {
    if (!localStreamRef.current) return;
    const track = localStreamRef.current.getAudioTracks()[0];
    if (track) { track.enabled = !track.enabled; setAudioOn(track.enabled); }
    wsRef.current?.send(JSON.stringify({ type: "media_state", audio: !audioOn, video: videoOn }));
  }

  function toggleVideo() {
    if (!localStreamRef.current) return;
    const track = localStreamRef.current.getVideoTracks()[0];
    if (track) { track.enabled = !track.enabled; setVideoOn(track.enabled); }
    wsRef.current?.send(JSON.stringify({ type: "media_state", audio: audioOn, video: !videoOn }));
  }

  async function toggleScreen() {
    if (screenSharing) {
      screenStreamRef.current?.getTracks().forEach(t => t.stop());
      setScreenSharing(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({ video: true });
        screenStreamRef.current = stream;
        Object.values(pcRefs.current).forEach(pc => {
          const sender = pc.getSenders().find(s => s.track?.kind === "video");
          if (sender) sender.replaceTrack(stream.getVideoTracks()[0]);
        });
        stream.getVideoTracks()[0].onended = () => setScreenSharing(false);
        setScreenSharing(true);
      } catch { console.warn("Partage ecran annule"); }
    }
  }

  function quitter() {
    localStreamRef.current?.getTracks().forEach(t => t.stop());
    screenStreamRef.current?.getTracks().forEach(t => t.stop());
    Object.values(pcRefs.current).forEach(pc => pc.close());
    wsRef.current?.close();
    setPhase("ended");
  }

  function sendChat(e) {
    e.preventDefault();
    if (!chatInput.trim()) return;
    wsRef.current?.send(JSON.stringify({ type: "chat", message: chatInput, name: myName }));
    setMessages(m => [...m, { from: "Vous", text: chatInput, time: new Date().toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit"}), mine: true }]);
    setChatInput("");
  }

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  function sendReaction(emoji) {
    wsRef.current?.send(JSON.stringify({ type: "reaction", emoji, name: myName }));
    addReaction(emoji, "Vous");
  }

  function addReaction(emoji) {
    const id = Date.now();
    const left = Math.random() * 80 + 10;
    setReactions(r => [...r, { id, emoji, left }]);
    setTimeout(() => setReactions(r => r.filter(x => x.id !== id)), 2000);
  }

  function toggleHand() {
    const raised = !handRaised;
    setHandRaised(raised);
    wsRef.current?.send(JSON.stringify({ type: "raise_hand", raised, name: myName }));
  }

  function lancerSondage() {
    if (!newPoll.question.trim()) return;
    wsRef.current?.send(JSON.stringify({ type: "poll", question: newPoll.question, options: newPoll.options.filter(Boolean) }));
    setNewPoll({ question: "", options: ["", ""] });
  }

  function voterSondage(pollIdx, option) {
    setPolls(p => p.map((poll, i) => i === pollIdx ? { ...poll, votes: { ...poll.votes, [peerId]: option } } : poll));
    wsRef.current?.send(JSON.stringify({ type: "poll_vote", option, poll_index: pollIdx }));
  }

  const PeerVideo = ({ pid, peer }) => {
    const ref = useRef(null);
    useEffect(() => { if (ref.current && peer.stream) ref.current.srcObject = peer.stream; }, [peer.stream]);
    return (
      <div style={{position:"relative",background:"#1a1a1a",borderRadius:"8px",overflow:"hidden",aspectRatio:"16/9"}}>
        {peer.stream
          ? <video ref={ref} autoPlay playsInline style={{width:"100%",height:"100%",objectFit:"cover"}}/>
          : <div style={{width:"100%",height:"100%",display:"flex",alignItems:"center",justifyContent:"center"}}>
              <div style={{width:"56px",height:"56px",borderRadius:"50%",background:"rgba(201,169,106,.2)",border:"2px solid rgba(201,169,106,.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem",fontWeight:700,color:"#C9A96A"}}>
                {(peer.name||"?")[0].toUpperCase()}
              </div>
            </div>
        }
        <div style={{position:"absolute",bottom:"8px",left:"8px",background:"rgba(0,0,0,.7)",padding:"3px 8px",borderRadius:"4px",fontSize:".68rem",color:"#fff",fontFamily:"Montserrat,sans-serif"}}>{peer.name}</div>
        {!peer.audio && <div style={{position:"absolute",top:"8px",right:"8px",background:"rgba(194,24,91,.8)",borderRadius:"50%",width:"24px",height:"24px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".7rem"}}>🔇</div>}
      </div>
    );
  };

  const s = {
    body: {minHeight:"100vh",background:"#0A0A0A",color:"#F8F5F2",fontFamily:"Montserrat,sans-serif"},
    inp: {width:"100%",padding:"11px 14px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.1)",borderRadius:"6px",color:"#F8F5F2",fontFamily:"Montserrat,sans-serif",fontSize:".88rem",outline:"none"},
    btn: {padding:"14px",background:"#C2185B",border:"none",borderRadius:"6px",color:"#fff",fontFamily:"Montserrat,sans-serif",fontWeight:600,fontSize:".82rem",letterSpacing:".12em",textTransform:"uppercase",cursor:"pointer"},
    ctrlBtn: (active) => ({width:"48px",height:"48px",borderRadius:"50%",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.1rem",background:active?"#C2185B":"rgba(255,255,255,.1)",color:"#fff"}),
  };

  if (phase === "lobby") return (
    <div style={s.body}>
      <div style={{minHeight:"100vh",display:"flex",alignItems:"center",justifyContent:"center",background:"linear-gradient(135deg,#0A0A0A,#1a0a0f)",padding:"24px"}}>
        <div style={{maxWidth:"440px",width:"100%",background:"#111",border:"1px solid rgba(201,169,106,.15)",borderRadius:"12px",padding:"40px 32px"}}>
          <div style={{textAlign:"center",marginBottom:"32px"}}>
            <p style={{fontFamily:"Montserrat,sans-serif",fontSize:".62rem",letterSpacing:".25em",textTransform:"uppercase",color:"#C9A96A",marginBottom:"8px"}}>{roomInfo?.mode==="webinaire"?"Webinaire":"Reunion"}</p>
            <h1 style={{fontFamily:"Playfair Display,serif",fontSize:"1.6rem",fontWeight:600,marginBottom:"8px"}}>{roomInfo?.titre||"Chargement..."}</h1>
            {roomInfo && <p style={{fontSize:".78rem",color:"rgba(248,245,242,.45)"}}>{roomInfo.participants} participant{roomInfo.participants!==1?"s":""}</p>}
          </div>
          {error && <p style={{background:"rgba(239,68,68,.1)",border:"1px solid rgba(239,68,68,.3)",borderRadius:"6px",padding:"10px 14px",fontSize:".78rem",color:"#f87171",marginBottom:"16px"}}>{error}</p>}
          <div style={{display:"flex",flexDirection:"column",gap:"12px"}}>
            <div>
              <label style={{fontSize:".62rem",letterSpacing:".14em",textTransform:"uppercase",color:"rgba(248,245,242,.45)",display:"block",marginBottom:"6px"}}>Votre prenom *</label>
              <input value={myName} onChange={e=>setMyName(e.target.value)} placeholder="Prenom" style={s.inp} onKeyDown={e=>e.key==="Enter"&&rejoindre()}/>
            </div>
            {roomInfo?.protege && (
              <div>
                <label style={{fontSize:".62rem",letterSpacing:".14em",textTransform:"uppercase",color:"rgba(248,245,242,.45)",display:"block",marginBottom:"6px"}}>Mot de passe</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={s.inp}/>
              </div>
            )}
            <button onClick={rejoindre} style={s.btn}>Rejoindre la reunion</button>
            <button onClick={()=>navigate(-1)} style={{...s.btn,background:"transparent",border:"1px solid rgba(255,255,255,.1)",color:"rgba(248,245,242,.45)"}}>Retour</button>
          </div>
        </div>
      </div>
    </div>
  );

  if (phase === "ended") return (
    <div style={{...s.body,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{textAlign:"center"}}>
        <p style={{fontFamily:"Playfair Display,serif",fontSize:"2rem",fontWeight:600,marginBottom:"16px"}}>Reunion terminee</p>
        <button onClick={()=>navigate("/")} style={s.btn}>Retour a l accueil</button>
      </div>
    </div>
  );

  const peerList = Object.entries(peers);
  const totalVideos = peerList.length + 1;
  const cols = totalVideos===1?"1fr":totalVideos<=4?"1fr 1fr":"repeat(3,1fr)";

  return (
    <div style={{...s.body,display:"grid",gridTemplateColumns:"1fr 300px",height:"100vh",overflow:"hidden"}}>
      {reactions.map(r=>(
        <div key={r.id} style={{position:"fixed",bottom:"120px",left:`${r.left}%`,fontSize:"2rem",pointerEvents:"none",zIndex:999,animation:"floatUp 2s ease-out forwards"}}>{r.emoji}</div>
      ))}
      <style>{`@keyframes floatUp{0%{transform:translateY(0);opacity:1}100%{transform:translateY(-200px);opacity:0}}`}</style>

      <div style={{display:"flex",flexDirection:"column",background:"#000"}}>
        <div style={{flex:1,display:"grid",gridTemplateColumns:cols,gap:"4px",padding:"8px",alignContent:"start",overflow:"hidden"}}>
          <div style={{position:"relative",background:"#1a1a1a",borderRadius:"8px",overflow:"hidden",aspectRatio:"16/9"}}>
            <video ref={localVideoRef} autoPlay playsInline muted style={{width:"100%",height:"100%",objectFit:"cover",transform:"scaleX(-1)",display:videoOn?"block":"none"}}/>
            {!videoOn && (
              <div style={{position:"absolute",inset:0,display:"flex",alignItems:"center",justifyContent:"center"}}>
                <div style={{width:"56px",height:"56px",borderRadius:"50%",background:"rgba(201,169,106,.2)",border:"2px solid rgba(201,169,106,.4)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:"1.3rem",fontWeight:700,color:"#C9A96A"}}>
                  {myName[0]?.toUpperCase()}
                </div>
              </div>
            )}
            <div style={{position:"absolute",bottom:"8px",left:"8px",background:"rgba(0,0,0,.7)",padding:"3px 8px",borderRadius:"4px",fontSize:".68rem",color:"#fff"}}>Vous {role==="hote"?"👑":""}</div>
            {!audioOn && <div style={{position:"absolute",top:"8px",right:"8px",background:"rgba(194,24,91,.8)",borderRadius:"50%",width:"24px",height:"24px",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".7rem"}}>🔇</div>}
          </div>
          {peerList.map(([pid,peer]) => <PeerVideo key={pid} pid={pid} peer={peer}/>)}
        </div>
        <div style={{padding:"12px 24px",background:"rgba(0,0,0,.9)",display:"flex",alignItems:"center",justifyContent:"center",gap:"12px",borderTop:"1px solid rgba(255,255,255,.08)"}}>
          <button style={s.ctrlBtn(!audioOn)} onClick={toggleAudio}>{audioOn?"🎤":"🔇"}</button>
          <button style={s.ctrlBtn(!videoOn)} onClick={toggleVideo}>{videoOn?"📹":"🚫"}</button>
          <button style={s.ctrlBtn(screenSharing)} onClick={toggleScreen}>🖥️</button>
          <button style={s.ctrlBtn(handRaised)} onClick={toggleHand}>✋</button>
          {["👍","❤️","😂","🎉","👏"].map(emoji=>(
            <button key={emoji} style={{...s.ctrlBtn(false),width:"38px",height:"38px",fontSize:"1rem"}} onClick={()=>sendReaction(emoji)}>{emoji}</button>
          ))}
          <button style={{...s.ctrlBtn(false),background:"#ef4444"}} onClick={quitter}>📵</button>
        </div>
      </div>

      <div style={{display:"flex",flexDirection:"column",background:"#111",borderLeft:"1px solid rgba(255,255,255,.08)"}}>
        <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,.08)"}}>
          {[["chat","💬"],["participants","👥"],["sondages","📊"]].map(([tab,icon])=>(
            <button key={tab} onClick={()=>setSidebarTab(tab)} style={{flex:1,padding:"12px",background:"none",border:"none",color:sidebarTab===tab?"#C9A96A":"rgba(248,245,242,.45)",cursor:"pointer",fontSize:".72rem",fontFamily:"Montserrat,sans-serif",borderBottom:sidebarTab===tab?"2px solid #C9A96A":"none"}}>
              {icon}
            </button>
          ))}
        </div>
        <div style={{flex:1,overflowY:"auto",padding:"12px"}}>
          {sidebarTab==="chat" && (
            <div style={{display:"flex",flexDirection:"column",gap:"8px"}}>
              {messages.length===0 && <p style={{textAlign:"center",color:"rgba(248,245,242,.3)",fontSize:".78rem",padding:"24px 0"}}>Demarrez la conversation...</p>}
              {messages.map((m,i)=>(
                <div key={i} style={{background:m.mine?"rgba(194,24,91,.1)":"rgba(255,255,255,.04)",border:`1px solid ${m.mine?"rgba(194,24,91,.2)":"rgba(255,255,255,.06)"}`,borderRadius:"8px",padding:"10px 12px"}}>
                  <div style={{fontSize:".65rem",color:"#C9A96A",fontWeight:600,marginBottom:"4px"}}>{m.from} <span style={{color:"rgba(248,245,242,.3)",fontWeight:300}}>{m.time}</span></div>
                  <div style={{fontSize:".82rem",lineHeight:1.5}}>{m.text}</div>
                </div>
              ))}
              <div ref={chatEndRef}/>
            </div>
          )}
          {sidebarTab==="participants" && (
            <div>
              {raisedHands.length>0 && (
                <div style={{marginBottom:"12px"}}>
                  <p style={{fontSize:".62rem",letterSpacing:".15em",textTransform:"uppercase",color:"#C9A96A",marginBottom:"8px"}}>Mains levees</p>
                  {raisedHands.map(h=><div key={h.peer_id} style={{background:"rgba(201,169,106,.1)",border:"1px solid rgba(201,169,106,.25)",borderRadius:"6px",padding:"8px 12px",marginBottom:"6px",fontSize:".78rem"}}>✋ {h.name}</div>)}
                </div>
              )}
              <p style={{fontSize:".62rem",letterSpacing:".15em",textTransform:"uppercase",color:"rgba(248,245,242,.3)",marginBottom:"10px"}}>{peerList.length+1} participant{peerList.length!==0?"s":""}</p>
              {[{name:myName,role,audio:audioOn,video:videoOn,mine:true},...peerList.map(([,p])=>p)].map((p,i)=>(
                <div key={i} style={{display:"flex",alignItems:"center",gap:"10px",padding:"8px",borderRadius:"6px",marginBottom:"6px",background:"rgba(255,255,255,.03)"}}>
                  <div style={{width:"36px",height:"36px",borderRadius:"50%",background:"rgba(201,169,106,.2)",border:"1px solid rgba(201,169,106,.3)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:".9rem",fontWeight:700,color:"#C9A96A",flexShrink:0}}>
                    {(p.name||"?")[0].toUpperCase()}
                  </div>
                  <div style={{flex:1}}>
                    <p style={{fontSize:".82rem",fontWeight:500}}>{p.mine?"Vous":p.name} {p.role==="hote"?"👑":""}</p>
                    <p style={{fontSize:".65rem",color:"rgba(248,245,242,.35)"}}>{p.audio!==false?"🎤":"🔇"} {p.video!==false?"📹":"🚫"}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          {sidebarTab==="sondages" && (
            <div>
              {role==="hote" && (
                <div style={{background:"rgba(255,255,255,.03)",border:"1px solid rgba(255,255,255,.08)",borderRadius:"8px",padding:"14px",marginBottom:"14px"}}>
                  <p style={{fontSize:".65rem",letterSpacing:".15em",textTransform:"uppercase",color:"#C9A96A",marginBottom:"10px"}}>Creer un sondage</p>
                  <input value={newPoll.question} onChange={e=>setNewPoll(p=>({...p,question:e.target.value}))} placeholder="Question..." style={{...s.inp,marginBottom:"6px"}}/>
                  {newPoll.options.map((opt,i)=>(
                    <input key={i} value={opt} onChange={e=>setNewPoll(p=>({...p,options:p.options.map((o,j)=>j===i?e.target.value:o)}))} placeholder={`Option ${i+1}`} style={{...s.inp,marginBottom:"6px"}}/>
                  ))}
                  <div style={{display:"flex",gap:"8px",marginTop:"6px"}}>
                    <button onClick={()=>setNewPoll(p=>({...p,options:[...p.options,""]}))} style={{padding:"6px 10px",background:"rgba(255,255,255,.05)",border:"1px solid rgba(255,255,255,.08)",borderRadius:"4px",color:"rgba(248,245,242,.45)",fontSize:".68rem",cursor:"pointer"}}>+ Option</button>
                    <button onClick={lancerSondage} style={{flex:1,padding:"6px",background:"#C2185B",border:"none",borderRadius:"4px",color:"#fff",fontSize:".68rem",fontWeight:600,cursor:"pointer"}}>Lancer</button>
                  </div>
                </div>
              )}
              {polls.map((poll,i)=>(
                <div key={i} style={{background:"rgba(255,255,255,.04)",border:"1px solid rgba(255,255,255,.08)",borderRadius:"8px",padding:"14px",marginBottom:"10px"}}>
                  <p style={{fontWeight:600,fontSize:".88rem",marginBottom:"10px"}}>{poll.question}</p>
                  {poll.options.map((opt,j)=>{
                    const voted=poll.votes[peerId]===opt;
                    const count=Object.values(poll.votes).filter(v=>v===opt).length;
                    return <button key={j} onClick={()=>voterSondage(i,opt)} style={{display:"block",width:"100%",padding:"8px 12px",margin:"4px 0",background:voted?"rgba(201,169,106,.1)":"rgba(255,255,255,.04)",border:`1px solid ${voted?"rgba(201,169,106,.4)":"rgba(255,255,255,.08)"}`,borderRadius:"6px",color:"#F8F5F2",fontSize:".82rem",textAlign:"left",cursor:"pointer"}}>
                      {voted?"✓ ":""}{opt} ({count})
                    </button>;
                  })}
                </div>
              ))}
              {polls.length===0 && <p style={{textAlign:"center",color:"rgba(248,245,242,.3)",fontSize:".78rem",padding:"24px 0"}}>Aucun sondage en cours</p>}
            </div>
          )}
        </div>
        {sidebarTab==="chat" && (
          <form onSubmit={sendChat} style={{padding:"10px",borderTop:"1px solid rgba(255,255,255,.08)",display:"flex",gap:"8px"}}>
            <input className="chat-input" value={chatInput} onChange={e=>setChatInput(e.target.value)} placeholder="Message..." style={{flex:1,padding:"8px 12px",background:"rgba(255,255,255,.06)",border:"1px solid rgba(255,255,255,.08)",borderRadius:"6px",color:"#F8F5F2",fontFamily:"Montserrat,sans-serif",fontSize:".82rem",outline:"none"}}/>
            <button type="submit" style={{padding:"8px 12px",background:"#C2185B",border:"none",borderRadius:"6px",color:"#fff",cursor:"pointer"}}>➤</button>
          </form>
        )}
      </div>
    </div>
  );
}
