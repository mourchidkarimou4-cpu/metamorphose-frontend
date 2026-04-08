import { useState, useRef, useEffect } from 'react'

const STYLES = `
  @keyframes aura-pulse {
    0%,100%{box-shadow:0 0 0 0 rgba(201,169,106,.5),0 8px 32px rgba(0,0,0,.4)}
    50%{box-shadow:0 0 0 10px rgba(201,169,106,.0),0 8px 32px rgba(0,0,0,.4)}
  }
  @keyframes aura-open {
    from{opacity:0;transform:scale(.92) translateY(12px)}
    to{opacity:1;transform:scale(1) translateY(0)}
  }
  @keyframes aura-msg-in { from{opacity:0;transform:translateY(8px)} to{opacity:1;transform:none} }
  @keyframes aura-dot {
    0%,80%,100%{transform:scale(0);opacity:.3} 40%{transform:scale(1);opacity:1}
  }
  .aura-fab {
    width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;
    background:linear-gradient(135deg,#C9A96A,#E8D5A8);
    display:flex;align-items:center;justify-content:center;
    animation:aura-pulse 2.5s ease-in-out infinite;
    transition:transform .25s;font-size:1.3rem;
    box-shadow:0 8px 32px rgba(0,0,0,.4);
  }
  .aura-fab:hover{transform:scale(1.08)}
  .aura-window {
    position:fixed;bottom:230px;right:16px;z-index:200;
    width:360px;max-width:calc(100vw - 32px);
    background:#141414;border:1px solid rgba(201,169,106,.2);
    border-radius:20px;overflow:hidden;
    box-shadow:0 24px 80px rgba(0,0,0,.7);
    animation:aura-open .3s cubic-bezier(.4,0,.2,1) both;
    display:flex;flex-direction:column;max-height:520px;
  }
  .aura-head {
    padding:14px 18px;
    background:linear-gradient(135deg,rgba(42,21,6,.9),rgba(74,37,16,.8));
    border-bottom:1px solid rgba(201,169,106,.15);
    display:flex;align-items:center;gap:10px;flex-shrink:0;
  }
  .aura-msgs {
    flex:1;overflow-y:auto;padding:16px;
    display:flex;flex-direction:column;gap:10px;
  }
  .aura-msgs::-webkit-scrollbar{width:2px}
  .aura-msgs::-webkit-scrollbar-thumb{background:rgba(201,169,106,.3);border-radius:2px}
  .aura-bubble {
    max-width:88%;padding:10px 14px;border-radius:12px;
    font-family:'Montserrat',sans-serif;font-size:.8rem;font-weight:300;
    line-height:1.65;animation:aura-msg-in .3s both;white-space:pre-wrap;
  }
  .aura-bubble-aura {
    background:rgba(74,37,16,.6);border:1px solid rgba(201,169,106,.15);
    color:#F2EBE0;align-self:flex-start;border-radius:4px 12px 12px 12px;
  }
  .aura-bubble-user {
    background:rgba(194,24,91,.2);border:1px solid rgba(194,24,91,.25);
    color:#F8F5F2;align-self:flex-end;border-radius:12px 4px 12px 12px;
  }
  .aura-opts {display:flex;flex-direction:column;gap:6px;align-self:flex-start;width:100%}
  .aura-opt {
    padding:9px 14px;border-radius:8px;border:1px solid rgba(201,169,106,.25);
    background:rgba(201,169,106,.06);color:#F2EBE0;
    font-family:'Montserrat',sans-serif;font-size:.75rem;font-weight:400;
    cursor:pointer;text-align:left;transition:all .2s;line-height:1.4;
  }
  .aura-opt:hover{background:rgba(201,169,106,.15);border-color:rgba(201,169,106,.5)}
  .aura-typing span {
    display:inline-block;width:5px;height:5px;border-radius:50%;
    background:#C9A96A;margin:0 2px;
  }
  .aura-typing span:nth-child(1){animation:aura-dot .9s 0s infinite}
  .aura-typing span:nth-child(2){animation:aura-dot .9s .2s infinite}
  .aura-typing span:nth-child(3){animation:aura-dot .9s .4s infinite}
  .aura-inp-row {
    padding:12px 14px;border-top:1px solid rgba(255,255,255,.06);
    display:flex;gap:8px;align-items:center;flex-shrink:0;
  }
  .aura-inp {
    flex:1;padding:9px 14px;border-radius:20px;
    background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.08);
    color:#F8F5F2;font-family:'Montserrat',sans-serif;font-size:.8rem;
    font-weight:300;outline:none;transition:border .25s;
  }
  .aura-inp:focus{border-color:rgba(201,169,106,.4)}
  .aura-inp::placeholder{color:rgba(248,245,242,.2)}
  .aura-send {
    width:34px;height:34px;border-radius:50%;border:none;cursor:pointer;
    background:linear-gradient(135deg,#C9A96A,#E8D5A8);
    display:flex;align-items:center;justify-content:center;font-size:.9rem;
    transition:transform .2s;flex-shrink:0;
  }
  .aura-send:hover{transform:scale(1.1)}
  .aura-send:disabled{opacity:.3;cursor:not-allowed}
  .aura-profil {
    padding:14px;border-radius:10px;
    background:linear-gradient(135deg,rgba(74,37,16,.5),rgba(42,21,6,.4));
    border:1px solid rgba(201,169,106,.2);align-self:flex-start;width:100%;
    animation:aura-msg-in .4s both;
  }
`

const PROFILS = {
  A: {
    icon:"🔥", label:"La Silencieuse",
    title:"Tu as appris à te faire petite...",
    desc:"pas parce que tu n'as rien à dire, mais parce que tu as douté de ta voix. 🌿",
    verite:"Ta voix n'est pas trop faible... elle a juste été trop longtemps ignorée.",
    cle:"Commence par t'exprimer dans des espaces sécurisés — l'écriture, un audio, le miroir.",
  },
  B: {
    icon:"🌪", label:"La Comparée",
    title:"Tu vis beaucoup à travers le regard des autres...",
    desc:"et sans t'en rendre compte, tu te diminues. 💔",
    verite:"Tu ne manques pas de valeur. Tu manques d'ancrage dans ta propre identité.",
    cle:"Chaque jour, note une chose qui te rend unique.",
  },
  C: {
    icon:"⛔", label:"L'Auto-bloquée",
    title:"Tu sais ce que tu veux...",
    desc:"mais quelque chose t'empêche de passer à l'action. 🌫",
    verite:"Tu n'es pas paresseuse. Tu es freinée par la peur et le doute.",
    cle:"Arrête de viser parfait. Vise \"fait\". Une seule petite action aujourd'hui suffit.",
  },
  D: {
    icon:"💔", label:"La Déconnectée de son image",
    title:"Tu as du mal à te voir avec amour...",
    desc:"Ton regard sur toi est souvent dur, critique. 🌧",
    verite:"Ce n'est pas ton image qui est le problème... c'est le lien que tu as avec toi-même.",
    cle:"Chaque jour, trouve UNE chose que tu apprécies chez toi. Commence par là.",
  },
}

const QUESTIONS = [
  {
    q:"Dans quelle situation tu te sens le plus en difficulté aujourd'hui ?",
    opts:[
      {l:"A",t:"Quand je dois m'exprimer ou prendre la parole"},
      {l:"B",t:"Quand je me compare aux autres"},
      {l:"C",t:"Quand je dois prendre des décisions importantes"},
      {l:"D",t:"Quand je me regarde ou pense à mon image"},
    ]
  },
  {
    q:"Quelle pensée revient le plus souvent dans ton esprit ?",
    opts:[
      {l:"A",t:"\"Je ne suis pas à la hauteur\""},
      {l:"B",t:"\"Les autres sont mieux que moi\""},
      {l:"C",t:"\"Je vais échouer\""},
      {l:"D",t:"\"Je ne suis pas assez bien physiquement\""},
    ]
  },
  {
    q:"Quelle émotion te suit le plus en ce moment ?",
    opts:[
      {l:"A",t:"Le doute"},
      {l:"B",t:"L'insécurité"},
      {l:"C",t:"La peur"},
      {l:"D",t:"La frustration"},
    ]
  },
  {
    q:"Au fond de toi, qu'est-ce que tu veux vraiment ?",
    opts:[
      {l:"A",t:"Oser m'exprimer librement"},
      {l:"B",t:"Me sentir légitime et confiante"},
      {l:"C",t:"Passer à l'action sans peur"},
      {l:"D",t:"Me sentir belle et alignée avec moi-même"},
    ]
  },
]

function calculerProfil(reps) {
  const c={A:0,B:0,C:0,D:0}
  reps.forEach(r=>{if(c[r]!==undefined)c[r]++})
  return Object.entries(c).sort((a,b)=>b[1]-a[1])[0][0]
}

const MSG_ACCUEIL = "Bonjour 🌸\n\nJe suis Aura, votre assistante de transformation.\n\nDites-moi... qu'est-ce qui vous amène aujourd'hui ?"

const OPTS_ACCUEIL = [
  {l:"diag", t:"Faire le diagnostic de ma transformation"},
  {l:"confiance", t:"Manque de confiance en moi"},
  {l:"image", t:"Mon image et mon apparence"},
  {l:"action", t:"Je n'arrive pas à passer à l'action"},
  {l:"programme", t:"En savoir plus sur Méta'Morph'Ose"},
]

const REPONSES_CHAT = {
  confiance: "Je comprends... Le manque de confiance touche tellement de femmes, souvent en silence. 💛\n\nC'est souvent lié à des croyances profondes sur soi-même qui se sont installées avec le temps.\n\nVoulez-vous faire un petit diagnostic pour identifier précisément votre blocage ?",
  image: "Notre image, c'est souvent le miroir de notre relation à nous-même. 🌿\n\nQuand on ne se sent pas alignée, c'est rarement un problème d'apparence — c'est un problème de connexion intérieure.\n\nVoulez-vous en explorer plus avec le diagnostic ?",
  action: "La procrastination, le report constant... c'est épuisant. ⛔\n\nMais ce n'est pas de la paresse — c'est souvent de la peur déguisée.\n\nFaisons ensemble le diagnostic pour identifier ce qui vous bloque vraiment ?",
  programme: "Méta'Morph'Ose est un programme de transformation féminine en 8 semaines. ✦\n\nIl travaille sur 3 dimensions : votre intérieur (confiance, croyances), votre image et votre passage à l'action.\n\nVoulez-vous découvrir votre profil de transformation ?",
}

export default function AuraButton() {
  const [open,      setOpen]      = useState(false)
  const [messages,  setMessages]  = useState([])
  const [phase,     setPhase]     = useState('accueil')
  const [diagStep,  setDiagStep]  = useState(0)
  const [diagReps,  setDiagReps]  = useState([])
  const [isTyping,  setIsTyping]  = useState(false)
  const [input,     setInput]     = useState('')
  const [init,      setInit]      = useState(false)
  const endRef = useRef(null)

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}) },[messages,isTyping])

  useEffect(()=>{
    if (open && !init) {
      setInit(true)
      setTimeout(()=>{
        setMessages([{role:'aura',text:MSG_ACCUEIL,opts:OPTS_ACCUEIL}])
      },300)
    }
  },[open])

  function addAura(text, opts=null, delay=800) {
    setIsTyping(true)
    setTimeout(()=>{
      setIsTyping(false)
      setMessages(p=>[...p,{role:'aura',text,opts,id:Date.now()}])
    },delay)
  }

  function choisirOption(opt) {
    // Message utilisateur
    setMessages(p=>[...p,{role:'user',text:opt.t,id:Date.now()}])

    if (phase === 'accueil') {
      if (opt.l === 'diag') {
        setPhase('diag')
        setDiagStep(0)
        addAura("Parfait ! Je vais vous poser 4 questions pour identifier votre profil de transformation. 🌸\n\n" + QUESTIONS[0].q, QUESTIONS[0].opts)
      } else {
        const rep = REPONSES_CHAT[opt.l] || "Je suis là pour vous accompagner. 💛"
        setPhase('chat')
        addAura(rep, [
          {l:'diag',  t:'Oui, faire le diagnostic'},
          {l:'retour', t:'Poser une autre question'},
        ])
      }
    } else if (phase === 'diag') {
      const newReps = [...diagReps, opt.l]
      setDiagReps(newReps)
      const next = diagStep + 1
      if (next < QUESTIONS.length) {
        setDiagStep(next)
        addAura(QUESTIONS[next].q, QUESTIONS[next].opts)
      } else {
        // Résultat
        const profil = calculerProfil(newReps)
        const p = PROFILS[profil]
        setPhase('profil')
        setIsTyping(true)
        setTimeout(()=>{
          setIsTyping(false)
          setMessages(prev=>[...prev,{
            role:'aura',
            text:`${p.icon} **${p.label}**\n\n${p.title}\n\n${p.desc}\n\n✦ *${p.verite}*\n\n🗝 ${p.cle}`,
            isProfil: true,
            id: Date.now(),
          }])
        },1000)
      }
    } else if (phase === 'chat') {
      if (opt.l === 'diag') {
        setPhase('diag'); setDiagStep(0); setDiagReps([])
        addAura(QUESTIONS[0].q, QUESTIONS[0].opts)
      } else {
        setPhase('accueil')
        addAura(MSG_ACCUEIL, OPTS_ACCUEIL)
      }
    }
  }

  function envoyerTexte() {
    const t = input.trim()
    if (!t) return
    setMessages(p=>[...p,{role:'user',text:t,id:Date.now()}])
    setInput('')
    addAura("Merci de me partager cela. 💛\n\nJe vous invite à explorer votre profil de transformation — cela m'aidera à mieux vous accompagner.", [
      {l:'diag', t:'Faire le diagnostic'},
      {l:'programme', t:'En savoir plus sur le programme'},
    ])
    setPhase('chat')
  }

  const dernierMsg = messages[messages.length-1]
  const hasOpts = dernierMsg?.opts?.length > 0

  return (
    <>
      <style>{STYLES}</style>

      {/* FAB */}
      <div style={{position:'fixed',bottom:'152px',right:'16px',zIndex:149,display:'flex',flexDirection:'column',alignItems:'flex-end',gap:'8px'}}>
        {!open && (
          <div style={{background:'rgba(10,10,10,.92)',backdropFilter:'blur(8px)',border:'1px solid rgba(201,169,106,.25)',borderRadius:'20px',padding:'6px 14px',whiteSpace:'nowrap',fontFamily:"'Montserrat',sans-serif",fontSize:'.68rem',fontWeight:500,color:'rgba(201,169,106,.9)',animation:'aura-msg-in .4s .5s both'}}>
            ✦ Parlez à Aura
          </div>
        )}
        <button className="aura-fab" onClick={()=>setOpen(o=>!o)} aria-label="Aura Métamorphose">
          {open ? <span style={{color:'#2A1506',fontWeight:700,fontSize:'1rem'}}>✕</span> : '✦'}
        </button>
      </div>

      {/* Fenêtre */}
      {open && (
        <div className="aura-window">
          {/* Header */}
          <div className="aura-head">
            <div style={{width:'36px',height:'36px',borderRadius:'50%',background:'linear-gradient(135deg,#C9A96A,#E8D5A8)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'1rem',flexShrink:0}}>✦</div>
            <div style={{flex:1}}>
              <p style={{fontFamily:"'Playfair Display',serif",fontSize:'.88rem',fontWeight:600,color:'#C9A96A',lineHeight:1.2}}>Aura Métamorphose</p>
              <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:'.6rem',color:'rgba(242,235,224,.4)',letterSpacing:'.08em'}}>Assistante de transformation · 24h/24</p>
            </div>
            <button onClick={()=>setOpen(false)} style={{background:'none',border:'none',cursor:'pointer',color:'rgba(242,235,224,.3)',fontSize:'1rem',padding:'4px'}}>✕</button>
          </div>

          {/* Messages */}
          <div className="aura-msgs">
            {messages.map((m,i)=>(
              <div key={m.id||i} style={{display:'flex',flexDirection:'column',gap:'8px',alignSelf:m.role==='user'?'flex-end':'flex-start',maxWidth:'100%'}}>
                <div className={`aura-bubble ${m.role==='aura'?'aura-bubble-aura':'aura-bubble-user'}`}
                  style={{animationDelay:`${i*.04}s`}}>
                  {m.text?.split('**').map((part,j)=>
                    j%2===0 ? part : <strong key={j} style={{color:'#C9A96A'}}>{part}</strong>
                  )}
                </div>
                {/* Options — seulement sur le dernier message */}
                {m.opts && i===messages.length-1 && (
                  <div className="aura-opts">
                    {m.opts.map((opt,j)=>(
                      <button key={j} className="aura-opt" onClick={()=>choisirOption(opt)}>
                        {opt.t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
            {isTyping && (
              <div className="aura-bubble aura-bubble-aura">
                <div className="aura-typing"><span/><span/><span/></div>
              </div>
            )}
            <div ref={endRef}/>
          </div>

          {/* Input texte — seulement si pas d'options */}
          {!hasOpts && !isTyping && (
            <div className="aura-inp-row">
              <input className="aura-inp" placeholder="Écrivez votre message..."
                value={input} onChange={e=>setInput(e.target.value)}
                onKeyDown={e=>{if(e.key==='Enter')envoyerTexte()}}
              />
              <button className="aura-send" onClick={envoyerTexte} disabled={!input.trim()}>→</button>
            </div>
          )}
        </div>
      )}
    </>
  )
}
