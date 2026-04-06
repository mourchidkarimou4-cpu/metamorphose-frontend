import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --noir:#0A0A0A; --or:#C9A96A; --or-light:#E8D5A8;
    --rose:#C2185B; --beige:#D8C1A0; --beige-light:#F2EBE0;
    --blanc:#F8F5F2;
    --ff-t:'Playfair Display',Georgia,serif;
    --ff-b:'Montserrat',sans-serif;
    --ff-a:'Cormorant Garamond',Georgia,serif;
    --ease:cubic-bezier(0.4,0,0.2,1);
  }
  html { scroll-behavior:smooth; }
  body { background:var(--noir); color:var(--blanc); font-family:var(--ff-b); font-weight:300; line-height:1.7; overflow-x:hidden; }

  @keyframes fadeUp   { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes shimmer  { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes pulse-or { 0%,100%{box-shadow:0 0 20px rgba(201,169,106,.25)} 50%{box-shadow:0 0 40px rgba(201,169,106,.5)} }
  @keyframes typing   { 0%,100%{opacity:1} 50%{opacity:0} }
  @keyframes spin     { to{transform:rotate(360deg)} }
  @keyframes orb      { 0%,100%{transform:scale(1);opacity:.08} 50%{transform:scale(1.3);opacity:.15} }
  @keyframes msgIn    { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:none} }

  .reveal { opacity:0; transform:translateY(30px); transition:opacity .8s ease,transform .8s ease; }
  .reveal.visible { opacity:1; transform:none; }

  .btn-p {
    display:inline-flex; align-items:center; justify-content:center; gap:10px;
    background:var(--rose); color:#fff; font-family:var(--ff-b); font-weight:700;
    font-size:.75rem; letter-spacing:.16em; text-transform:uppercase;
    padding:15px 32px; border:none; border-radius:2px; cursor:pointer;
    text-decoration:none; transition:all .35s;
  }
  .btn-p:hover { background:#a01049; transform:translateY(-2px); }

  .chat-container {
    display:flex; flex-direction:column; height:calc(100vh - 64px);
    max-width:860px; margin:0 auto;
  }

  .messages-area {
    flex:1; overflow-y:auto; padding:24px 20px;
    display:flex; flex-direction:column; gap:16px;
    scrollbar-width:thin; scrollbar-color:rgba(201,169,106,.2) transparent;
  }
  .messages-area::-webkit-scrollbar { width:4px; }
  .messages-area::-webkit-scrollbar-thumb { background:rgba(201,169,106,.2); border-radius:2px; }

  .msg-user {
    align-self:flex-end; max-width:75%;
    background:var(--rose); color:#fff;
    padding:12px 16px; border-radius:16px 16px 4px 16px;
    font-family:var(--ff-b); font-size:.85rem; font-weight:300; line-height:1.6;
    animation:msgIn .3s both;
  }
  .msg-ai {
    align-self:flex-start; max-width:80%;
    background:rgba(255,255,255,.05); border:1px solid rgba(201,169,106,.12);
    padding:14px 18px; border-radius:4px 16px 16px 16px;
    font-family:var(--ff-b); font-size:.85rem; font-weight:300; line-height:1.75;
    color:rgba(248,245,242,.88); animation:msgIn .3s both;
  }
  .msg-ai strong { color:var(--or); font-weight:600; }
  .msg-ai em { font-style:italic; color:rgba(248,245,242,.6); }

  .msg-ai-header {
    display:flex; align-items:center; gap:8px; margin-bottom:8px;
  }

  .typing-indicator {
    display:flex; gap:4px; align-items:center; padding:4px 0;
  }
  .typing-dot {
    width:6px; height:6px; border-radius:50%; background:rgba(201,169,106,.5);
    animation:typing 1.2s ease-in-out infinite;
  }
  .typing-dot:nth-child(2) { animation-delay:.2s; }
  .typing-dot:nth-child(3) { animation-delay:.4s; }

  .input-area {
    padding:16px 20px; border-top:1px solid rgba(255,255,255,.06);
    background:rgba(10,10,10,.8); backdrop-filter:blur(10px);
  }
  .input-row {
    display:flex; gap:10px; align-items:flex-end;
    background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08);
    border-radius:12px; padding:10px 14px;
    transition:border .25s;
  }
  .input-row:focus-within { border-color:rgba(201,169,106,.3); }

  .chat-input {
    flex:1; background:none; border:none; outline:none;
    color:var(--blanc); font-family:var(--ff-b); font-size:.88rem; font-weight:300;
    resize:none; max-height:120px; min-height:24px; line-height:1.5;
    font-size:16px;
  }
  .chat-input::placeholder { color:rgba(248,245,242,.25); }

  .send-btn {
    width:36px; height:36px; border-radius:8px; border:none;
    background:var(--rose); color:#fff; cursor:pointer;
    display:flex; align-items:center; justify-content:center;
    transition:all .25s; flex-shrink:0;
  }
  .send-btn:hover { background:#a01049; transform:scale(1.05); }
  .send-btn:disabled { background:rgba(255,255,255,.08); cursor:not-allowed; transform:none; }

  .suggestion-btn {
    padding:8px 16px; background:rgba(255,255,255,.04);
    border:1px solid rgba(201,169,106,.15); border-radius:100px;
    color:rgba(248,245,242,.6); font-family:var(--ff-b); font-size:.72rem;
    cursor:pointer; transition:all .25s; white-space:nowrap;
  }
  .suggestion-btn:hover { border-color:rgba(201,169,106,.4); color:var(--or); background:rgba(201,169,106,.05); }

  @media(max-width:768px) {
    .chat-container { height:calc(100vh - 56px); }
    .msg-user, .msg-ai { max-width:90%; font-size:.82rem; }
    .suggestions { flex-wrap:wrap !important; }
  }
`;

const SYSTEME_PROMPT = `Tu es MÉTA, l'assistante IA bienveillante et inspirante de Méta'Morph'Ose, le programme de transformation féminine créé par Prélia Apedo.

TON IDENTITÉ :
- Tu t'appelles MÉTA (Méta'Morph'Ose IA Assistante)
- Tu parles exclusivement en français, avec chaleur, bienveillance et élégance
- Tu t'adresses toujours aux femmes avec respect et empowerment
- Tu utilises "tu" (tutoiement bienveillant) sauf si on te demande le vouvoiement
- Tu n'utilises JAMAIS d'emojis dans tes réponses
- Tes réponses sont concises, percutantes et inspirantes (max 200 mots)

LE PROGRAMME MÉTA'MORPH'OSE :
- Fondatrice : Prélia Apedo, Coach en Image certifiée, Styliste, Leader Oratrice
- Programme de 8 semaines de transformation féminine
- 3 piliers : MÉTA (transformation intérieure), MORPH (image et identité), OSE (passage à l'action)
- 4 formules : Live Groupe (65 000 FCFA), Live Privé (150 000 FCFA), Présentiel Groupe (250 000 FCFA), Présentiel Privé (350 000 FCFA)
- Contact WhatsApp : +229 01 96 11 40 93 / +229 01 59 37 65 60
- Email : whiteblackdress22@gmail.com
- Site : https://teal-syrniki-9cf4a7.netlify.app

TES MISSIONS :
1. Accueillir et orienter les visiteuses avec chaleur
2. Présenter le programme, les formules et les tarifs
3. Répondre aux questions sur la transformation féminine, la confiance en soi, l'image personnelle
4. Encourager et motiver les femmes dans leur démarche
5. Orienter vers Prélia pour toute question spécifique ou inscription
6. Parler de la Masterclass OSEZ (gratuite), du Store, de la Communauté MMO

CE QUE TU NE FAIS PAS :
- Tu ne donnes pas de conseils médicaux ou psychologiques cliniques
- Tu ne parles pas de sujets sans rapport avec la transformation féminine et MMO
- Tu ne critigues jamais Prélia ou le programme

STYLE DE RÉPONSE :
- Commence souvent par une phrase d'encouragement ou de validation
- Utilise des formules élégantes et inspirantes
- Propose toujours une action concrète à la fin (s'inscrire, contacter Prélia, explorer le site...)
- Si tu ne sais pas quelque chose, oriente vers Prélia directement`;

const SUGGESTIONS_INITIALES = [
  "C'est quoi Méta'Morph'Ose ?",
  "Quelles sont les formules et les prix ?",
  "Comment rejoindre le programme ?",
  "Je manque de confiance en moi",
  "C'est quoi la Masterclass OSEZ ?",
  "Comment contacter Prélia ?",
];

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

export default function AgentIA() {
  const [messages,  setMessages]  = useState([]);
  const [input,     setInput]     = useState("");
  const [loading,   setLoading]   = useState(false);
  const [started,   setStarted]   = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef       = useRef(null);
  useReveal();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior:"smooth" });
  }, [messages, loading]);

  function demarrer() {
    setStarted(true);
    setMessages([{
      role: "assistant",
      content: "Bonjour et bienvenue. Je suis MÉTA, ton assistante personnelle Méta'Morph'Ose.\n\nJe suis là pour t'accompagner, répondre à tes questions sur le programme, t'orienter vers la formule qui te correspond et t'inspirer dans ta démarche de transformation.\n\nDis-moi, qu'est-ce qui t'amène aujourd'hui ?"
    }]);
  }

  async function envoyer(texte) {
    const msgUser = texte || input.trim();
    if (!msgUser || loading) return;
    setInput("");

    const newMessages = [...messages, { role:"user", content:msgUser }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: SYSTEME_PROMPT,
          messages: newMessages.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });

      const data = await res.json();
      const reponse = data.content?.[0]?.text || "Je suis désolée, une erreur est survenue. Veuillez réessayer.";

      setMessages(prev => [...prev, { role:"assistant", content:reponse }]);
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "Je rencontre une petite difficulté technique. En attendant, tu peux contacter Prélia directement sur WhatsApp au +229 01 96 11 40 93."
      }]);
    }
    setLoading(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      envoyer();
    }
  }

  // Page d'accueil avant démarrage
  if (!started) {
    return (
      <>
        <style>{STYLES}</style>
        <nav style={{ padding:"16px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"rgba(10,10,10,.96)", backdropFilter:"blur(20px)", zIndex:200 }}>
          <Link to="/" style={{ textDecoration:"none" }}>
            <span style={{ fontFamily:"var(--ff-t)", fontSize:"1rem" }}>
              <span style={{color:"var(--blanc)"}}>Meta'</span>
              <span style={{color:"var(--or)"}}>Morph'</span>
              <span style={{color:"var(--rose)"}}>Ose</span>
            </span>
          </Link>
          <Link to="/" style={{ fontFamily:"var(--ff-b)", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}>Retour</Link>
        </nav>

        <div style={{ minHeight:"calc(100vh - 57px)", display:"flex", alignItems:"center", justifyContent:"center", padding:"40px 24px", background:"linear-gradient(135deg,#0A0A0A 0%,#1a0a0f 50%,#0A0A0A 100%)", position:"relative", overflow:"hidden" }}>
          {/* Orbes */}
          <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
            <div style={{ position:"absolute", top:"20%", left:"10%", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(194,24,91,.1),transparent 70%)", animation:"orb 10s ease-in-out infinite" }}/>
            <div style={{ position:"absolute", bottom:"20%", right:"10%", width:"300px", height:"300px", borderRadius:"50%", background:"radial-gradient(circle,rgba(201,169,106,.08),transparent 70%)", animation:"orb 12s ease-in-out infinite 2s" }}/>
          </div>

          <div style={{ maxWidth:"620px", width:"100%", textAlign:"center", position:"relative", zIndex:1 }}>

            {/* Avatar IA */}
            <div style={{ width:"100px", height:"100px", borderRadius:"50%", background:"linear-gradient(135deg,rgba(194,24,91,.2),rgba(201,169,106,.15))", border:"2px solid rgba(201,169,106,.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", animation:"pulse-or 3s ease-in-out infinite" }}>
              <span style={{ fontFamily:"var(--ff-t)", fontSize:"2rem", fontWeight:700, background:"linear-gradient(135deg,var(--or),var(--or-light))", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text" }}>M</span>
            </div>

            <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"var(--or)", marginBottom:"12px", animation:"fadeUp .7s both" }}>
              Assistante IA
            </p>
            <h1 style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(2rem,6vw,3rem)", fontWeight:700, lineHeight:1.1, marginBottom:"16px", animation:"fadeUp .8s .1s both" }}>
              <em style={{ fontStyle:"italic", fontWeight:400, background:"linear-gradient(135deg,var(--or),var(--or-light),var(--or))", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmer 4s linear infinite" }}>
                MÉTA
              </em>
            </h1>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:"clamp(.88rem,2.5vw,1rem)", color:"rgba(248,245,242,.6)", lineHeight:1.8, marginBottom:"8px", animation:"fadeUp .8s .2s both" }}>
              Ton assistante personnelle Méta'Morph'Ose
            </p>
            <p style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1rem", color:"rgba(201,169,106,.6)", marginBottom:"36px", animation:"fadeUp .8s .3s both" }}>
              Posez-moi toutes vos questions sur le programme, les formules, la transformation...
            </p>

            {/* Suggestions */}
            <div style={{ display:"flex", flexWrap:"wrap", gap:"8px", justifyContent:"center", marginBottom:"36px", animation:"fadeUp .8s .4s both" }}>
              {SUGGESTIONS_INITIALES.slice(0,4).map((s,i) => (
                <button key={i} className="suggestion-btn" onClick={() => { demarrer(); setTimeout(() => envoyer(s), 300); }}>
                  {s}
                </button>
              ))}
            </div>

            <button onClick={demarrer} className="btn-p" style={{ animation:"fadeUp .8s .5s both", fontSize:".78rem", padding:"18px 48px" }}>
              Démarrer la conversation
            </button>

            <p style={{ marginTop:"20px", fontFamily:"var(--ff-b)", fontSize:".65rem", color:"rgba(248,245,242,.2)", animation:"fadeUp .8s .6s both" }}>
              Propulsé par l'IA · Disponible 24h/24 · Répond en français
            </p>
          </div>
        </div>
      </>
    );
  }

  // Interface de chat
  return (
    <>
      <style>{STYLES}</style>

      {/* ── NAVBAR CHAT ── */}
      <nav style={{ padding:"12px 20px", borderBottom:"1px solid rgba(255,255,255,.06)", display:"flex", justifyContent:"space-between", alignItems:"center", background:"rgba(10,10,10,.97)", backdropFilter:"blur(20px)", zIndex:200, position:"sticky", top:0 }}>
        <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
          <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"linear-gradient(135deg,rgba(194,24,91,.25),rgba(201,169,106,.15))", border:"1px solid rgba(201,169,106,.3)", display:"flex", alignItems:"center", justifyContent:"center" }}>
            <span style={{ fontFamily:"var(--ff-t)", fontSize:".85rem", fontWeight:700, color:"var(--or)" }}>M</span>
          </div>
          <div>
            <p style={{ fontFamily:"var(--ff-t)", fontSize:".9rem", fontWeight:600 }}>MÉTA</p>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"#25D366", letterSpacing:".1em" }}>En ligne · Répond maintenant</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:"12px", alignItems:"center" }}>
          <button onClick={() => { setMessages([]); setStarted(false); }} style={{ background:"none", border:"1px solid rgba(255,255,255,.08)", borderRadius:"3px", color:"rgba(248,245,242,.35)", fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".1em", textTransform:"uppercase", padding:"7px 14px", cursor:"pointer" }}>
            Nouvelle conversation
          </button>
          <Link to="/" style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".1em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}>Quitter</Link>
        </div>
      </nav>

      {/* ── ZONE DE CHAT ── */}
      <div className="chat-container">
        <div className="messages-area">

          {messages.map((msg, i) => (
            <div key={i}>
              {msg.role === "user" ? (
                <div className="msg-user">{msg.content}</div>
              ) : (
                <div style={{ display:"flex", gap:"10px", alignItems:"flex-start" }}>
                  <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"linear-gradient(135deg,rgba(194,24,91,.2),rgba(201,169,106,.1))", border:"1px solid rgba(201,169,106,.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, marginTop:"2px" }}>
                    <span style={{ fontFamily:"var(--ff-t)", fontSize:".75rem", fontWeight:700, color:"var(--or)" }}>M</span>
                  </div>
                  <div className="msg-ai">
                    {msg.content.split("\n").map((line, j) => (
                      <p key={j} style={{ marginBottom: j < msg.content.split("\n").length - 1 ? "8px" : "0" }}>
                        {line}
                      </p>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Indicateur de frappe */}
          {loading && (
            <div style={{ display:"flex", gap:"10px", alignItems:"flex-start" }}>
              <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"linear-gradient(135deg,rgba(194,24,91,.2),rgba(201,169,106,.1))", border:"1px solid rgba(201,169,106,.2)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                <span style={{ fontFamily:"var(--ff-t)", fontSize:".75rem", fontWeight:700, color:"var(--or)" }}>M</span>
              </div>
              <div className="msg-ai" style={{ padding:"16px 18px" }}>
                <div className="typing-indicator">
                  <div className="typing-dot"/>
                  <div className="typing-dot"/>
                  <div className="typing-dot"/>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef}/>
        </div>

        {/* Suggestions rapides */}
        {messages.length <= 2 && (
          <div style={{ padding:"8px 20px 0", overflowX:"auto" }}>
            <div className="suggestions" style={{ display:"flex", gap:"8px", paddingBottom:"8px" }}>
              {SUGGESTIONS_INITIALES.map((s,i) => (
                <button key={i} className="suggestion-btn" onClick={() => envoyer(s)} style={{ flexShrink:0 }}>
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── INPUT ── */}
        <div className="input-area">
          <div className="input-row">
            <textarea
              ref={inputRef}
              className="chat-input"
              placeholder="Pose ta question à MÉTA..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              rows={1}
            />
            <button className="send-btn" onClick={() => envoyer()} disabled={!input.trim() || loading}>
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"/>
                <polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
            </button>
          </div>
          <p style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"rgba(248,245,242,.15)", textAlign:"center", marginTop:"8px" }}>
            MÉTA peut faire des erreurs. Pour toute question importante, contacte Prélia directement.
          </p>
        </div>
      </div>
    </>
  );
}
