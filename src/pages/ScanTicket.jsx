import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import api from '../services/api';

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function ScanTicket() {
  const [params]  = useSearchParams()
  const code      = params.get('code')
  const [result,  setResult]  = useState(null)
  const [loading, setLoading] = useState(false)
  const [scanning,setScanning]= useState(false)
  const { token } = useAuth()
  const { user } = useAuth()

  useEffect(()=>{ if(code) verifier(code) },[code])

  async function verifier(c) {
    setLoading(true);setResult(null)
    try {
      const res  = await fetch(`${API_BASE}/api/tickets/verifier/${c}/`)
      const data = await res.json()
      setResult({...data,code:c})
    } catch { setResult({valide:false,detail:'Erreur réseau'}) }
    setLoading(false)
  }

  async function scanner() {
    if(!result?.code) return
    setScanning(true)
    try {
      const res  = await fetch(`${API_BASE}/api/tickets/scanner/${result.code}/`,{method:'POST',headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}})
      const data = await res.json()
      setResult(prev=>({...prev,...data,scanned:true}))
    } catch { setResult(prev=>({...prev,detail:'Erreur lors du scan'})) }
    setScanning(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0A0A0A',color:'#F8F5F2',fontFamily:"'Montserrat',sans-serif",display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <Link to="/" style={{position:'fixed',top:'24px',left:'24px',fontFamily:"'Montserrat',sans-serif",fontSize:'.68rem',letterSpacing:'.15em',textTransform:'uppercase',color:'rgba(201,169,106,.5)',textDecoration:'none'}}>← Accueil</Link>
      <div style={{maxWidth:'440px',width:'100%'}}>
        <p style={{fontFamily:"'Playfair Display',serif",fontSize:'.62rem',letterSpacing:'.3em',textTransform:'uppercase',color:'#C9A96A',textAlign:'center',marginBottom:'12px'}}>✦ Scan</p>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.8rem',fontWeight:700,textAlign:'center',marginBottom:'32px'}}>Vérification ticket</h1>

        {!code && (
          <div style={{marginBottom:'24px'}}>
            <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:'.72rem',color:'rgba(248,245,242,.4)',marginBottom:'12px'}}>Entrez le code du ticket :</p>
            <div style={{display:'flex',gap:'8px'}}>
              <input id="code-inp" placeholder="Code UUID..." style={{flex:1,padding:'12px 16px',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'4px',color:'#F8F5F2',fontFamily:"'Montserrat',sans-serif",fontSize:'.82rem',outline:'none'}}/>
              <button onClick={()=>verifier(document.getElementById('code-inp').value.trim())}
                style={{padding:'12px 20px',background:'#C9A96A',border:'none',borderRadius:'4px',color:'#0A0A0A',fontFamily:"'Montserrat',sans-serif",fontSize:'.72rem',fontWeight:700,cursor:'pointer'}}>
                Vérifier
              </button>
            </div>
          </div>
        )}

        {loading && (
          <div style={{textAlign:'center',padding:'40px',background:'rgba(255,255,255,.03)',borderRadius:'8px'}}>
            <p style={{color:'rgba(248,245,242,.4)',fontSize:'.85rem'}}>Vérification...</p>
          </div>
        )}

        {result && !loading && (
          <div style={{padding:'28px',borderRadius:'12px',textAlign:'center',background:result.success||result.scanned?'rgba(76,175,80,.1)':result.valide?'rgba(201,169,106,.06)':'rgba(239,83,80,.08)',border:`1px solid ${result.success||result.scanned?'rgba(76,175,80,.3)':result.valide?'rgba(201,169,106,.2)':'rgba(239,83,80,.3)'}`}}>
            <div style={{fontSize:'3rem',marginBottom:'16px'}}>
              {result.success||result.scanned?'✅':result.valide?'🎫':'❌'}
            </div>
            <p style={{fontFamily:"'Playfair Display',serif",fontSize:'1.1rem',fontWeight:600,color:result.success||result.scanned?'#4CAF50':result.valide?'#C9A96A':'#ef5350',marginBottom:'8px'}}>
              {result.success||result.scanned?'Ticket validé !':result.valide?'Ticket valide':'Ticket invalide'}
            </p>
            <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:'.8rem',color:'rgba(248,245,242,.5)',marginBottom:'16px'}}>{result.detail||''}</p>

            {result.ticket && (
              <div style={{background:'rgba(255,255,255,.04)',borderRadius:'8px',padding:'16px',textAlign:'left',marginBottom:'20px'}}>
                <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:'.82rem',fontWeight:500,marginBottom:'6px'}}>{result.ticket.nom_complet}</p>
                <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:'.75rem',color:'rgba(248,245,242,.4)',marginBottom:'4px'}}>📧 {result.ticket.email}</p>
                <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:'.75rem',color:'#C9A96A',fontWeight:500}}>🎭 {result.ticket.evenement_nom}</p>
                {result.ticket.evenement_lieu&&<p style={{fontFamily:"'Montserrat',sans-serif",fontSize:'.72rem',color:'rgba(248,245,242,.35)',marginTop:'4px'}}>📍 {result.ticket.evenement_lieu}</p>}
              </div>
            )}

            {user?.is_staff && result.valide && !result.success && !result.scanned && (
              <button onClick={scanner} disabled={scanning}
                style={{width:'100%',padding:'14px',background:'#4CAF50',border:'none',borderRadius:'6px',color:'#fff',fontFamily:"'Montserrat',sans-serif",fontSize:'.78rem',fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',cursor:'pointer',opacity:scanning?.6:1,marginBottom:'10px'}}>
                {scanning?'Validation...':'✓ Valider l\'entrée'}
              </button>
            )}

            <button onClick={()=>setResult(null)} style={{width:'100%',padding:'10px',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'6px',color:'rgba(248,245,242,.5)',fontFamily:"'Montserrat',sans-serif",fontSize:'.72rem',cursor:'pointer'}}>
              Nouveau scan
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
