import { useAuth } from "../context/AuthContext";
import { useState, useEffect, useRef } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { Html5Qrcode } from 'html5-qrcode'

const API_BASE = import.meta.env.VITE_API_URL || '';

export default function ScanTicket() {
  const [params]   = useSearchParams()
  const code       = params.get('code')
  const [result,   setResult]   = useState(null)
  const [loading,  setLoading]  = useState(false)
  const [scanning, setScanning] = useState(false)
  const [camActive,setCamActive]= useState(false)
  const [camError, setCamError] = useState(null)
  const { token, user } = useAuth()
  const scannerRef = useRef(null)
  const codeInpRef = useRef(null)

  useEffect(()=>{ if(code) verifier(code) },[code])

  useEffect(()=>{
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop().catch(()=>{})
        scannerRef.current = null
      }
    }
  },[])

  async function verifier(c) {
    if (!c?.trim()) return
    setLoading(true); setResult(null)
    try {
      const res  = await fetch(`${API_BASE}/api/tickets/verifier/${c.trim()}/`)
      const data = await res.json()
      setResult({...data, code: c.trim()})
    } catch { setResult({valide:false, detail:'Erreur réseau'}) }
    setLoading(false)
  }

  async function validerEntree() {
    if (!result?.code) return
    setScanning(true)
    try {
      const res  = await fetch(`${API_BASE}/api/tickets/scanner/${result.code}/`, {
        method:'POST',
        headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'}
      })
      const data = await res.json()
      setResult(prev=>({...prev,...data, scanned:true}))
    } catch { setResult(prev=>({...prev, detail:'Erreur lors du scan'})) }
    setScanning(false)
  }

  async function demarrerCamera() {
    setCamError(null)
    setCamActive(true)
    setTimeout(async () => {
      try {
        const scanner = new Html5Qrcode("qr-reader")
        scannerRef.current = scanner
        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            // QR code détecté
            let code = decodedText
            // Extraire le code UUID si c'est une URL
            const match = decodedText.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i)
            if (match) code = match[0]
            arreterCamera()
            verifier(code)
          },
          () => {} // erreur de scan ignorée
        )
      } catch(e) {
        setCamError("Impossible d'accéder à la caméra. Vérifiez les permissions.")
        setCamActive(false)
      }
    }, 100)
  }

  function arreterCamera() {
    if (scannerRef.current) {
      scannerRef.current.stop().catch(()=>{})
      scannerRef.current = null
    }
    setCamActive(false)
  }

  const isSuccess = result?.success || result?.scanned
  const isValide  = result?.valide
  const couleur   = isSuccess ? '#4CAF50' : isValide ? '#C9A96A' : '#ef5350'
  const bgColor   = isSuccess ? 'rgba(76,175,80,.1)' : isValide ? 'rgba(201,169,106,.06)' : 'rgba(239,83,80,.08)'
  const border    = isSuccess ? 'rgba(76,175,80,.3)'  : isValide ? 'rgba(201,169,106,.2)'  : 'rgba(239,83,80,.3)'

  return (
    <div style={{minHeight:'100vh',background:'#0A0A0A',color:'#F8F5F2',fontFamily:"'Montserrat',sans-serif",display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:'24px'}}>
      <Link to="/" style={{position:'fixed',top:'24px',left:'24px',fontSize:'.68rem',letterSpacing:'.15em',textTransform:'uppercase',color:'rgba(201,169,106,.5)',textDecoration:'none'}}>← Accueil</Link>

      <div style={{maxWidth:'440px',width:'100%'}}>
        <p style={{fontFamily:"'Playfair Display',serif",fontSize:'.62rem',letterSpacing:'.3em',textTransform:'uppercase',color:'#C9A96A',textAlign:'center',marginBottom:'12px'}}>✦ Méta'Morph'Ose</p>
        <h1 style={{fontFamily:"'Playfair Display',serif",fontSize:'1.8rem',fontWeight:700,textAlign:'center',marginBottom:'8px'}}>Scan Ticket</h1>
        <p style={{fontFamily:"'Montserrat',sans-serif",fontSize:'.72rem',color:'rgba(248,245,242,.3)',textAlign:'center',marginBottom:'32px'}}>Brunch des Métamorphosées</p>

        {/* Bouton scanner caméra */}
        {!result && !camActive && (
          <>
            <button onClick={demarrerCamera}
              style={{width:'100%',padding:'18px',background:'linear-gradient(135deg,#C9A96A,#E8D5A8)',border:'none',borderRadius:'8px',color:'#0A0A0A',fontFamily:"'Montserrat',sans-serif",fontSize:'.78rem',fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',cursor:'pointer',marginBottom:'16px',display:'flex',alignItems:'center',justifyContent:'center',gap:'10px'}}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
              Scanner le QR Code
            </button>

            <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'16px'}}>
              <div style={{flex:1,height:'1px',background:'rgba(255,255,255,.08)'}}/>
              <span style={{fontSize:'.65rem',color:'rgba(248,245,242,.25)',letterSpacing:'.1em'}}>ou</span>
              <div style={{flex:1,height:'1px',background:'rgba(255,255,255,.08)'}}/>
            </div>

            <div style={{display:'flex',gap:'8px'}}>
              <input ref={codeInpRef} placeholder="Entrer le code UUID..." style={{flex:1,padding:'12px 16px',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'4px',color:'#F8F5F2',fontFamily:"'Montserrat',sans-serif",fontSize:'.82rem',outline:'none'}}
                onKeyDown={e=>{ if(e.key==='Enter') verifier(codeInpRef.current.value.trim()) }}/>
              <button onClick={()=>verifier(codeInpRef.current?.value.trim())}
                style={{padding:'12px 20px',background:'#C2185B',border:'none',borderRadius:'4px',color:'#fff',fontFamily:"'Montserrat',sans-serif",fontSize:'.72rem',fontWeight:700,cursor:'pointer'}}>
                OK
              </button>
            </div>
          </>
        )}

        {/* Caméra active */}
        {camActive && (
          <div style={{marginBottom:'20px'}}>
            <div id="qr-reader" style={{width:'100%',borderRadius:'12px',overflow:'hidden',background:'#111'}}/>
            {camError && <p style={{color:'#ef5350',fontSize:'.78rem',marginTop:'8px',textAlign:'center'}}>{camError}</p>}
            <button onClick={arreterCamera}
              style={{width:'100%',marginTop:'12px',padding:'12px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'6px',color:'rgba(248,245,242,.6)',fontFamily:"'Montserrat',sans-serif",fontSize:'.72rem',cursor:'pointer'}}>
              Annuler le scan
            </button>
          </div>
        )}

        {/* Chargement */}
        {loading && (
          <div style={{textAlign:'center',padding:'40px',background:'rgba(255,255,255,.03)',borderRadius:'8px'}}>
            <div style={{width:'32px',height:'32px',borderRadius:'50%',border:'2px solid rgba(255,255,255,.1)',borderTopColor:'#C9A96A',animation:'spin .7s linear infinite',margin:'0 auto 12px'}}/>
            <p style={{color:'rgba(248,245,242,.4)',fontSize:'.85rem'}}>Vérification...</p>
          </div>
        )}

        {/* Résultat */}
        {result && !loading && (
          <div style={{padding:'28px',borderRadius:'12px',textAlign:'center',background:bgColor,border:`1px solid ${border}`}}>
            <div style={{fontSize:'3rem',marginBottom:'16px'}}>
              {isSuccess ? '✅' : isValide ? '🎫' : '❌'}
            </div>
            <p style={{fontFamily:"'Playfair Display',serif",fontSize:'1.2rem',fontWeight:700,color:couleur,marginBottom:'8px'}}>
              {isSuccess ? 'Entrée validée !' : isValide ? 'Ticket valide' : 'Ticket invalide'}
            </p>
            <p style={{fontSize:'.8rem',color:'rgba(248,245,242,.5)',marginBottom:'16px'}}>{result.detail||''}</p>

            {result.ticket && (
              <div style={{background:'rgba(255,255,255,.04)',borderRadius:'8px',padding:'16px',textAlign:'left',marginBottom:'20px'}}>
                <p style={{fontSize:'.85rem',fontWeight:600,marginBottom:'6px',color:'#F8F5F2'}}>{result.ticket.nom_complet}</p>
                <p style={{fontSize:'.75rem',color:'rgba(248,245,242,.4)',marginBottom:'4px'}}>✉ {result.ticket.email}</p>
                {result.ticket.telephone && <p style={{fontSize:'.75rem',color:'rgba(248,245,242,.4)',marginBottom:'4px'}}>☎ {result.ticket.telephone}</p>}
                <p style={{fontSize:'.75rem',color:'#C9A96A',fontWeight:500,marginBottom:'4px'}}>✦ {result.ticket.evenement_nom}</p>
                {result.ticket.evenement_lieu && <p style={{fontSize:'.72rem',color:'rgba(248,245,242,.35)'}}>📍 {result.ticket.evenement_lieu}</p>}
              </div>
            )}

            {user?.is_staff && isValide && !isSuccess && (
              <button onClick={validerEntree} disabled={scanning}
                style={{width:'100%',padding:'16px',background:'#4CAF50',border:'none',borderRadius:'6px',color:'#fff',fontSize:'.78rem',fontWeight:700,letterSpacing:'.12em',textTransform:'uppercase',cursor:'pointer',opacity:scanning?.6:1,marginBottom:'10px'}}>
                {scanning ? 'Validation...' : '✓ Valider l\'entrée'}
              </button>
            )}

            <button onClick={()=>{ setResult(null); setCamActive(false) }}
              style={{width:'100%',padding:'10px',background:'rgba(255,255,255,.05)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'6px',color:'rgba(248,245,242,.5)',fontSize:'.72rem',cursor:'pointer'}}>
              Nouveau scan
            </button>
          </div>
        )}
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )
}
