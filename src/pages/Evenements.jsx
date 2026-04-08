import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import AuraButton from '../components/AuraButton'
import { QRCodeSVG } from 'qrcode.react'

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700&family=Montserrat:wght@300;400;500;600&display=swap');
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0}
  :root{--noir:#0A0A0A;--or:#C9A96A;--rose:#C2185B;--blanc:#F8F5F2;--ff-t:'Playfair Display',serif;--ff-b:'Montserrat',sans-serif}
  body{background:var(--noir);color:var(--blanc);font-family:var(--ff-b)}
  @keyframes fadeUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
  .ev-card{transition:all .35s cubic-bezier(.4,0,.2,1)}
  .ev-card:hover{transform:translateY(-6px);border-color:rgba(201,169,106,.4) !important}
  @media(max-width:768px){.ev-grid{grid-template-columns:1fr !important}}
`

function NavBar() {
  const user = JSON.parse(localStorage.getItem('mmorphose_user')||'null')
  return (
    <nav style={{position:'fixed',top:0,left:0,right:0,zIndex:100,background:'rgba(10,10,10,.95)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(201,169,106,.12)',padding:'0 32px',height:'64px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
      <Link to="/" style={{textDecoration:'none'}}>
        <span style={{fontFamily:'var(--ff-t)',fontSize:'1rem'}}>
          <span style={{color:'#F8F5F2'}}>Méta'</span><span style={{color:'#C9A96A'}}>Morph'</span><span style={{color:'#C2185B'}}>Ose</span>
        </span>
      </Link>
      <div style={{display:'flex',gap:'20px',alignItems:'center'}}>
        <Link to="/evenements" style={{fontFamily:'var(--ff-b)',fontSize:'.68rem',letterSpacing:'.18em',textTransform:'uppercase',color:'var(--or)',textDecoration:'none',fontWeight:600}}>Événements</Link>
        <Link to={user?'/dashboard':'/espace-membre'} style={{fontFamily:'var(--ff-b)',fontSize:'.68rem',letterSpacing:'.15em',textTransform:'uppercase',color:'rgba(248,245,242,.4)',textDecoration:'none'}}>{user?'Mon espace':'Se connecter'}</Link>
      </div>
    </nav>
  )
}

function ModalReservation({ ev, onClose, onSuccess }) {
  const user  = JSON.parse(localStorage.getItem('mmorphose_user')||'null')
  const token = localStorage.getItem('mmorphose_token')
  const [form, setForm]   = useState({nom:user?`${user.first_name||''} ${user.last_name||''}`.trim():'',email:user?.email||'',telephone:''})
  const [loading,setLoading] = useState(false)
  const [error,  setError]   = useState('')

  async function reserver() {
    if (!form.email){setError('Email requis');return}
    setLoading(true);setError('')
    try {
      const headers={'Content-Type':'application/json'}
      if(token) headers['Authorization']=`Bearer ${token}`
      const res  = await fetch('/api/tickets/reserver/',{method:'POST',headers,body:JSON.stringify({evenement_id:ev.id,...form})})
      const data = await res.json()
      if(!res.ok){setError(data.detail||'Erreur');setLoading(false);return}
      onSuccess(data)
    } catch{setError('Erreur réseau');setLoading(false)}
  }

  const inp={width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--blanc)',fontFamily:'var(--ff-b)',fontSize:'.82rem',fontWeight:300,outline:'none'}
  const lbl={fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.14em',textTransform:'uppercase',color:'rgba(248,245,242,.4)',display:'block',marginBottom:'6px'}

  return (
    <div style={{position:'fixed',inset:0,zIndex:500,background:'rgba(10,10,10,.92)',backdropFilter:'blur(12px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:'#141414',border:'1px solid rgba(201,169,106,.15)',borderRadius:'12px',padding:'36px',width:'100%',maxWidth:'440px',animation:'fadeUp .3s both'}}>
        <h3 style={{fontFamily:'var(--ff-t)',fontSize:'1.3rem',fontWeight:600,marginBottom:'6px'}}>Réserver ma place</h3>
        <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'rgba(248,245,242,.4)',marginBottom:'24px'}}>{ev.nom}</p>
        <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
          <div><label style={lbl}>Nom complet</label><input style={inp} value={form.nom} onChange={e=>setForm(p=>({...p,nom:e.target.value}))} placeholder="Votre nom"/></div>
          <div><label style={lbl}>Email *</label><input style={inp} type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))} placeholder="votre@email.com"/></div>
          <div><label style={lbl}>Téléphone</label><input style={inp} value={form.telephone} onChange={e=>setForm(p=>({...p,telephone:e.target.value}))} placeholder="+229..."/></div>
          {error && <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'#ef5350'}}>{error}</p>}
          <div style={{display:'flex',gap:'10px',marginTop:'8px'}}>
            <button onClick={onClose} style={{flex:1,padding:'12px',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'rgba(248,245,242,.5)',fontFamily:'var(--ff-b)',fontSize:'.72rem',letterSpacing:'.1em',textTransform:'uppercase',cursor:'pointer'}}>Annuler</button>
            <button onClick={reserver} disabled={loading} style={{flex:2,padding:'12px',background:'var(--rose)',border:'none',borderRadius:'3px',color:'#fff',fontFamily:'var(--ff-b)',fontSize:'.72rem',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',cursor:'pointer',opacity:loading?.6:1}}>
              {loading?'Réservation...':ev.prix>0?`Réserver — ${ev.prix.toLocaleString()} FCFA`:'Réserver gratuitement'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function ModalTicket({ ticket, onClose }) {
  const url = `${window.location.origin}/scan?code=${ticket.code}`
  return (
    <div style={{position:'fixed',inset:0,zIndex:500,background:'rgba(10,10,10,.95)',backdropFilter:'blur(12px)',display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}} onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div style={{background:'#141414',border:'1px solid rgba(201,169,106,.2)',borderRadius:'12px',padding:'36px',width:'100%',maxWidth:'400px',textAlign:'center',animation:'fadeUp .3s both'}}>
        <p style={{fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.25em',textTransform:'uppercase',color:'var(--or)',marginBottom:'12px'}}>✦ Ticket confirmé</p>
        <h3 style={{fontFamily:'var(--ff-t)',fontSize:'1.3rem',fontWeight:600,marginBottom:'6px'}}>{ticket.evenement_nom}</h3>
        <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'rgba(248,245,242,.4)',marginBottom:'28px'}}>{ticket.evenement_lieu&&`📍 ${ticket.evenement_lieu}`}</p>
        <div style={{display:'flex',justifyContent:'center',marginBottom:'20px'}}>
          <div style={{background:'#fff',padding:'16px',borderRadius:'8px'}}>
            <QRCodeSVG value={url} size={180} level="H"/>
          </div>
        </div>
        <p style={{fontFamily:'var(--ff-b)',fontSize:'.68rem',color:'rgba(248,245,242,.3)',marginBottom:'8px',letterSpacing:'.08em'}}>CODE : {String(ticket.code).substring(0,8).toUpperCase()}</p>
        <p style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'rgba(248,245,242,.4)',marginBottom:'24px'}}>Présentez ce QR code à l'entrée.</p>
        <button onClick={onClose} style={{padding:'12px 32px',background:'var(--or)',border:'none',borderRadius:'3px',color:'#0A0A0A',fontFamily:'var(--ff-b)',fontSize:'.72rem',fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',cursor:'pointer'}}>Fermer</button>
      </div>
    </div>
  )
}

export default function Evenements() {
  const [evenements,setEvenements] = useState([])
  const [loading,   setLoading]    = useState(true)
  const [modal,     setModal]      = useState(null)

  useEffect(()=>{
    fetch('/api/tickets/evenements/')
      .then(r=>r.json()).then(d=>{setEvenements(Array.isArray(d)?d:[]);setLoading(false)})
      .catch(()=>setLoading(false))
  },[])

  function formatDate(d) {
    return new Date(d).toLocaleDateString('fr-FR',{weekday:'long',day:'numeric',month:'long',year:'numeric',hour:'2-digit',minute:'2-digit'})
  }

  return (
    <>
      <style>{STYLES}</style>
      <NavBar/>
      <section style={{padding:'120px 32px 72px',textAlign:'center',background:'linear-gradient(180deg,#0f0a06 0%,var(--noir) 100%)',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse 60% 50% at 50% 0%,rgba(201,169,106,.07),transparent)',pointerEvents:'none'}}/>
        <p style={{fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.3em',textTransform:'uppercase',color:'var(--or)',marginBottom:'16px',animation:'fadeUp .6s both'}}>Méta'Morph'Ose · Événements</p>
        <h1 style={{fontFamily:'var(--ff-t)',fontSize:'clamp(2rem,5vw,3.2rem)',fontWeight:700,lineHeight:1.1,marginBottom:'20px',animation:'fadeUp .7s .1s both'}}>Nos prochains événements</h1>
        <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'1rem',color:'rgba(248,245,242,.55)',maxWidth:'480px',margin:'0 auto',lineHeight:1.75,animation:'fadeUp .7s .2s both'}}>Brunch, masterclass, ateliers — rejoignez la communauté en présentiel.</p>
      </section>

      <main style={{maxWidth:'1100px',margin:'0 auto',padding:'48px 32px 80px'}}>
        {loading ? (
          <p style={{textAlign:'center',fontFamily:'var(--ff-b)',fontSize:'.85rem',color:'rgba(248,245,242,.3)',padding:'80px'}}>Chargement...</p>
        ) : evenements.length===0 ? (
          <div style={{textAlign:'center',padding:'80px',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'8px'}}>
            <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',fontSize:'1.3rem',color:'rgba(248,245,242,.3)',marginBottom:'12px'}}>Aucun événement à venir</p>
            <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.85rem',color:'rgba(248,245,242,.25)'}}>Revenez bientôt.</p>
          </div>
        ) : (
          <div className="ev-grid" style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(320px,1fr))',gap:'24px'}}>
            {evenements.map(ev=>(
              <div key={ev.id} className="ev-card" style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:'8px',overflow:'hidden',display:'flex',flexDirection:'column'}}>
                <div style={{height:'200px',background:ev.image?`url(${ev.image}) center/cover`:'linear-gradient(135deg,rgba(201,169,106,.08),rgba(194,24,91,.05))',position:'relative',flexShrink:0}}>
                  {!ev.image&&<div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'2.5rem',opacity:.3}}>🎭</div>}
                  {ev.complet&&<div style={{position:'absolute',top:'12px',right:'12px',background:'rgba(239,83,80,.9)',borderRadius:'100px',padding:'4px 12px',fontFamily:'var(--ff-b)',fontSize:'.6rem',fontWeight:700,color:'#fff',letterSpacing:'.1em',textTransform:'uppercase'}}>Complet</div>}
                  {ev.prix===0&&!ev.complet&&<div style={{position:'absolute',top:'12px',left:'12px',background:'rgba(76,175,80,.9)',borderRadius:'100px',padding:'4px 12px',fontFamily:'var(--ff-b)',fontSize:'.6rem',fontWeight:700,color:'#fff',letterSpacing:'.1em',textTransform:'uppercase'}}>Gratuit</div>}
                </div>
                <div style={{padding:'20px',flex:1,display:'flex',flexDirection:'column',gap:'10px'}}>
                  <h3 style={{fontFamily:'var(--ff-t)',fontSize:'1.1rem',fontWeight:600,lineHeight:1.3}}>{ev.nom}</h3>
                  <div style={{display:'flex',flexDirection:'column',gap:'6px'}}>
                    <p style={{fontFamily:'var(--ff-b)',fontSize:'.75rem',color:'var(--or)',fontWeight:500}}>📅 {formatDate(ev.date)}</p>
                    {ev.lieu&&<p style={{fontFamily:'var(--ff-b)',fontSize:'.75rem',color:'rgba(248,245,242,.4)',fontWeight:300}}>📍 {ev.lieu}</p>}
                  </div>
                  {ev.description&&<p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.8rem',color:'rgba(248,245,242,.5)',lineHeight:1.65,flex:1}}>{ev.description}</p>}
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',paddingTop:'12px',borderTop:'1px solid rgba(255,255,255,.05)',marginTop:'auto'}}>
                    <span style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'rgba(248,245,242,.3)'}}>{ev.complet?'0':ev.places_restantes} place{ev.places_restantes!==1?'s':''} restante{ev.places_restantes!==1?'s':''}</span>
                    <button onClick={()=>!ev.complet&&setModal({type:'reserver',data:ev})} disabled={ev.complet}
                      style={{padding:'10px 20px',background:ev.complet?'rgba(255,255,255,.05)':'var(--rose)',border:'none',borderRadius:'3px',color:ev.complet?'rgba(248,245,242,.3)':'#fff',fontFamily:'var(--ff-b)',fontSize:'.68rem',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',cursor:ev.complet?'not-allowed':'pointer'}}>
                      {ev.complet?'Complet':ev.prix>0?`${ev.prix.toLocaleString()} FCFA`:'Réserver'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {modal?.type==='reserver'&&<ModalReservation ev={modal.data} onClose={()=>setModal(null)} onSuccess={ticket=>setModal({type:'ticket',data:ticket})}/>}
      {modal?.type==='ticket'&&<ModalTicket ticket={modal.data} onClose={()=>setModal(null)}/>}
      <AuraButton/>
    </>
  )
}
