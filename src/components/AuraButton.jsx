import { useState, useRef, useEffect } from 'react'

const AURA_STYLES = `
  @keyframes aura-pulse {
    0%,100% { box-shadow: 0 0 0 0 rgba(201,169,106,.4), 0 8px 32px rgba(0,0,0,.4); }
    50%      { box-shadow: 0 0 0 8px rgba(201,169,106,.0), 0 8px 32px rgba(0,0,0,.4); }
  }
  @keyframes aura-orb {
    0%,100% { transform:scale(1) rotate(0deg); opacity:.6; }
    50%      { transform:scale(1.15) rotate(180deg); opacity:1; }
  }
  @keyframes aura-msg-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  @keyframes aura-dot {
    0%,80%,100%{transform:scale(0);opacity:.3} 40%{transform:scale(1);opacity:1}
  }
  @keyframes aura-open {
    from{opacity:0;transform:scale(.92) translateY(12px)} to{opacity:1;transform:scale(1) translateY(0)}
  }
  .aura-btn-fab {
    width:56px;height:56px;border-radius:50%;
    background:linear-gradient(135deg,#C9A96A,#E8D5A8,#C9A96A);
    background-size:200% auto;border:none;cursor:pointer;
    display:flex;align-items:center;justify-content:center;
    animation:aura-pulse 2.5s ease-in-out infinite;
    transition:transform .25s;position:relative;overflow:hidden;
  }
  .aura-btn-fab:hover{transform:scale(1.08)}
  .aura-chat-window {
    position:fixed;bottom:160px;right:16px;z-index:200;
    width:340px;max-width:calc(100vw - 32px);
    background:#141414;border:1px solid rgba(201,169,106,.2);
    border-radius:16px;overflow:hidden;
    box-shadow:0 24px 80px rgba(0,0,0,.6);
    animation:aura-open .3s cubic-bezier(.4,0,.2,1) both;
    display:flex;flex-direction:column;
  }
  .aura-header {
    padding:16px 20px;
    background:linear-gradient(135deg,rgba(201,169,106,.12),rgba(194,24,91,.06));
    border-bottom:1px solid rgba(201,169,106,.15);
    display:flex;align-items:center;gap:12px;
  }
  .aura-messages {
    flex:1;overflow-y:auto;padding:16px;
    display:flex;flex-direction:column;gap:10px;
    max-height:320px;min-height:180px;
  }
  .aura-messages::-webkit-scrollbar{width:2px}
  .aura-messages::-webkit-scrollbar-thumb{background:rgba(201,169,106,.3);border-radius:2px}
  .aura-msg {
    max-width:85%;padding:10px 14px;border-radius:12px;
    font-family:'Montserrat',sans-serif;font-size:.8rem;font-weight:300;
    line-height:1.6;animation:aura-msg-in .3s both;
  }
  .aura-msg-aura {
    background:rgba(201,169,106,.1);border:1px solid rgba(201,169,106,.15);
    color:#F2EBE0;align-self:flex-start;border-radius:4px 12px 12px 12px;
  }
  .aura-msg-user {
    background:rgba(194,24,91,.15);border:1px solid rgba(194,24,91,.2);
    color:#F8F5F2;align-self:flex-end;border-radius:12px 4px 12px 12px;
  }
  .aura-typing span {
    display:inline-block;width:5px;height:5px;border-radius:50%;
    background:#C9A96A;margin:0 2px;
  }
  .aura-typing span:nth-child(1){animation:aura-dot .9s .0s infinite}
  .aura-typing span:nth-child(2){animation:aura-dot .9s .2s infinite}
  .aura-typing span:nth-child(3){animation:aura-dot .9s .4s infinite}
  .aura-input-row {
    padding:12px 16px;border-top:1px solid rgba(255,255,255,.06);
    display:flex;gap:8px;align-items:flex-end;
  }
  .aura-input {
    flex:1;padding:10px 14px;border-radius:20px;
    background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);
    color:#F8F5F2;font-family:'Montserrat',sans-serif;font-size:.82rem;
    font-weight:300;outline:none;resize:none;line-height:1.5;
    max-height:100px;transition:border .25s;
  }
  .aura-input:focus{border-color:rgba(201,169,106,.35)}
  .aura-input::placeholder{color:rgba(248,245,242,.25)}
  .aura-send {
    width:36px;height:36px;border-radius:50%;border:none;cursor:pointer;
    background:linear-gradient(135deg,#C9A96A,#E8D5A8);
    display:flex;align-items:center;justify-content:center;
    flex-shrink:0;transition:transform .2s;font-size:.85rem;
  }
  .aura-send:hover{transform:scale(1.1)}
  .aura-send:disabled{opacity:.4;cursor:not-allowed}
`

const MSG_BIENVENUE = "Bonjour ! Je suis **Aura**, votre assistante de transformation 💖\n\nJe suis là pour vous accompagner dans votre chemin vers la confiance, l'image et l'action. Posez-moi n'importe quelle question."

function formatText(t) {
  return t.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br/>')
}

export default function AuraButton() {
  const [open,     setOpen]     = useState(false)
  const [messages, setMessages] = useState([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const [init,     setInit]     = useState(false)
  const endRef   = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    if (open && !init) { setInit(true); setTimeout(() => setMessages([{role:'assistant',content:MSG_BIENVENUE}]),300) }
  }, [open])

  useEffect(() => { endRef.current?.scrollIntoView({behavior:'smooth'}) }, [messages,loading])
  useEffect(() => { if (open) setTimeout(()=>inputRef.current?.focus(),400) }, [open])

  async function envoyer() {
    const texte = input.trim()
    if (!texte || loading) return
    const newMsgs = [...messages, {role:'user',content:texte}]
    setMessages(newMsgs); setInput(''); setLoading(true)
    try {
      const res = await fetch('/api/aura/', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ messages: newMsgs.map(m=>({role:m.role==='assistant'?'assistant':'user',content:m.content})) })
      })
      if (!res.ok) throw new Error()
      const data = await res.json()
      setMessages(p=>[...p,{role:'assistant',content:data?.content?.[0]?.text||"Je suis là pour vous accompagner 💖"}])
    } catch {
      setMessages(p=>[...p,{role:'assistant',content:"Je rencontre une difficulté. Réessayez dans quelques instants 🌸"}])
    }
    setLoading(false)
  }

  function handleKeyDown(e) { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();envoyer()} }

  return (
    <>
      <style>{AURA_STYLES}</style>

      <div style={{position:'fixed',bottom:'88px',right:'16px',zIndex:149,display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'8px'}}>
        {!open && (
          <div style={{background:'rgba(10,10,10,.9)',backdropFilter:'blur(8px)',border:'1px solid rgba(201,169,106,.2)',borderRadius:'20px',padding:'6px 14px',whiteSpace:'nowrap',fontFamily:"'Montserrat',sans-serif",fontSize:'.68rem',fontWeight:500,letterSpacing:'.08em',color:'rgba(201,169,106,.85)',animation:'aura-msg-in .4s .5s both'}}>
            ✦ Parlez à Aura
          </div>
        )}
        <button className="aura-btn-fab" onClick={()=>setOpen(o=>!o)} aria-label={open?"Fermer Aura":"Ouvrir Aura"}>
          {open
            ? <span style={{color:'#0A0A0A',fontSize:'1.1rem',fontWeight:700}}>✕</span>
            : <span style={{color:'#0A0A0A',fontSize:'1.1rem'}}>✦</span>
          }
        </button>
      </div>

      {open && (
        <div className="aura-chat-window">
          <div className="aura-header">
            <div style={{width:'40px',height:'40px',borderRadius:'50%',flexShrink:0,background:'linear-gradient(135deg,#C9A96A,#E8D5A8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1.1rem',animation:'aura-orb 4s ease-in-out infinite'}}>✦</div>
            <div style={{flex:1}}>
              <p style={{fontFamily:"'Playfair Display',serif",fontSize:'.92rem',fontWeight:600,color:'#C9A96A',lineHeight:1.2}}>Aura Métamorphose</p>
              <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:'.62rem',fontWeight:300,color:'rgba(248,245,242,.4)',letterSpacing:'.08em'}}>Assistante de transformation · 24h/24</p>
            </div>
            <button onClick={()=>setOpen(false)} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(248,245,242,.3)',fontSize:'1rem',padding:'4px'}}>✕</button>
          </div>

          <div className="aura-messages">
            {messages.map((m,i)=>(
              <div key={i} className={`aura-msg ${m.role==='assistant'?'aura-msg-aura':'aura-msg-user'}`}
                dangerouslySetInnerHTML={{__html:formatText(m.content)}}
                style={{animationDelay:`${i*.05}s`}}
              />
            ))}
            {loading && <div className="aura-msg aura-msg-aura"><div className="aura-typing"><span/><span/><span/></div></div>}
            <div ref={endRef}/>
          </div>

          <div className="aura-input-row">
            <textarea ref={inputRef} className="aura-input" placeholder="Posez votre question à Aura..." value={input} onChange={e=>setInput(e.target.value)} onKeyDown={handleKeyDown} rows={1}/>
            <button className="aura-send" onClick={envoyer} disabled={!input.trim()||loading} aria-label="Envoyer">→</button>
          </div>
        </div>
      )}
    </>
  )
}
