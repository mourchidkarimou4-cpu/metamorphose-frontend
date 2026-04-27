import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:.3} }
  @keyframes spin   { to{transform:rotate(360deg)} }
  .live-page { min-height:100vh; background:#0A0A0A; color:#F8F5F2; font-family:'Montserrat',sans-serif; font-weight:300; }
  .live-hero { text-align:center; padding:80px 24px 48px; background:linear-gradient(180deg,rgba(194,24,91,.06) 0%,transparent 100%); }
  .live-hero h1 { font-family:'Playfair Display',serif; font-size:clamp(1.8rem,5vw,2.8rem); font-weight:600; margin-bottom:14px; line-height:1.2; }
  .salle-card { padding:24px; background:rgba(255,255,255,.03); border:1px solid rgba(255,255,255,.07); border-radius:6px; margin-bottom:16px; animation:fadeUp .5s both; }
  .btn-rejoindre { display:inline-flex; align-items:center; gap:8px; background:#C2185B; color:#fff; border:none; padding:12px 24px; border-radius:3px; font-family:'Montserrat',sans-serif; font-size:.74rem; font-weight:600; letter-spacing:.12em; text-transform:uppercase; cursor:pointer; }
  .btn-rejoindre:hover { background:#d81b60; }
  #zmmtg-root { display:none; }
  .zmwebsdk-makeStyles-root { height:calc(100vh - 60px) !important; }
`;

export default function LiveMasterclass() {
  const [reunions, setReunions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal, setModal]       = useState(null); // reunion sélectionnée
  const [nom, setNom]           = useState('');
  const [password, setPassword] = useState('');
  const [joining,  setJoining]  = useState(false);
  const [inMeeting, setInMeeting] = useState(false);
  const [error, setError]       = useState('');
  const zoomRef = useRef(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/zoom/liste/`)
      .then(r => r.json())
      .then(d => { setReunions(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  async function rejoindre() {
    if (!nom.trim()) { setError('Votre nom est requis'); return; }
    setJoining(true);
    setError('');
    try {
      // Obtenir la signature depuis Django
      const res = await fetch(`${API_BASE}/api/zoom/signature/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meeting_number: modal.meeting_id, role: 0 })
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error || 'Erreur'); setJoining(false); return; }

      // Charger le SDK Zoom dynamiquement
      const { ZoomMtg } = await import('@zoom/meetingsdk');
      ZoomMtg.preLoadWasm();
      ZoomMtg.prepareWebSDK();

      document.getElementById('zmmtg-root').style.display = 'block';
      setModal(null);
      setInMeeting(true);

      ZoomMtg.init({
        leaveUrl: window.location.href,
        patchJsMedia: true,
        leaveOnPageUnload: true,
        success: () => {
          ZoomMtg.join({
            meetingNumber: modal.meeting_id,
            userName: nom,
            signature: data.signature,
            sdkKey: data.sdk_key,
            passWord: password || modal.password || '',
            success: () => { setJoining(false); },
            error: (e) => { setError('Erreur de connexion'); setJoining(false); console.error(e); }
          });
        },
        error: (e) => { setError('Erreur initialisation'); setJoining(false); console.error(e); }
      });
    } catch(e) {
      setError('Erreur réseau');
      setJoining(false);
    }
  }

  return (
    <div className="live-page">
      <style>{STYLES}</style>

      {/* Header */}
      <nav style={{ padding:'18px 24px', borderBottom:'1px solid rgba(201,169,106,.1)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'rgba(10,10,10,.95)', backdropFilter:'blur(20px)', zIndex:100 }}>
        <Link to="/" style={{ textDecoration:'none' }}>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:'1rem' }}>
            <span style={{color:'#F8F5F2'}}>Meta'</span>
            <span style={{color:'#C9A96A'}}>Morph'</span>
            <span style={{color:'#C2185B'}}>Ose</span>
          </span>
        </Link>
        <Link to="/" style={{ fontFamily:"'Montserrat'", fontSize:'.68rem', letterSpacing:'.15em', textTransform:'uppercase', color:'rgba(201,169,106,.5)', textDecoration:'none' }}>Accueil</Link>
      </nav>

      {/* Hero */}
      <div className="live-hero">
        <p style={{ fontFamily:"'Montserrat'", fontSize:'.62rem', letterSpacing:'.3em', textTransform:'uppercase', color:'#C9A96A', marginBottom:'12px' }}>Meta'Morph'Ose</p>
        <h1>Lives & Sessions</h1>
        <p style={{ maxWidth:'520px', margin:'0 auto', color:'rgba(248,245,242,.5)', lineHeight:1.8, fontSize:'.88rem' }}>
          Rejoignez les sessions live de Prélia directement depuis le site — sans quitter la plateforme.
        </p>
      </div>

      {/* Contenu */}
      <div style={{ maxWidth:'800px', margin:'0 auto', padding:'32px 24px 80px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'60px' }}>
            <div style={{ width:'32px', height:'32px', border:'2px solid rgba(201,169,106,.2)', borderTopColor:'#C9A96A', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto' }}/>
          </div>
        ) : reunions.length === 0 ? (
          <div style={{ textAlign:'center', padding:'60px', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'6px' }}>
            <p style={{ fontSize:'2rem', marginBottom:'12px' }}>📡</p>
            <p style={{ fontFamily:"'Montserrat'", fontSize:'.88rem', color:'rgba(248,245,242,.4)' }}>Aucun live en cours pour le moment.</p>
            <p style={{ fontFamily:"'Montserrat'", fontSize:'.75rem', color:'rgba(248,245,242,.25)', marginTop:'8px' }}>Revenez bientôt ou activez les notifications.</p>
          </div>
        ) : (
          reunions.map((r, i) => (
            <div className="salle-card" key={r.id} style={{ animationDelay:`${i*0.08}s` }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', flexWrap:'wrap', gap:'10px', marginBottom:'14px' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'6px' }}>
                    <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#C2185B', display:'inline-block', animation:'blink 1.5s infinite' }}/>
                    <span style={{ fontFamily:"'Montserrat'", fontSize:'.62rem', letterSpacing:'.2em', textTransform:'uppercase', color:'#C2185B' }}>En direct</span>
                  </div>
                  <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', fontWeight:600 }}>{r.titre}</h2>
                </div>
              </div>
              <div style={{ marginTop:'16px' }}>
                <button className="btn-rejoindre" onClick={() => { setModal(r); setNom(''); setPassword(''); setError(''); }}>
                  Rejoindre le live
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/>
                  </svg>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Conteneur SDK Zoom */}
      <div id="zmmtg-root" style={{ position:'fixed', inset:0, zIndex:1000, background:'#0A0A0A' }}/>

      {/* Modal rejoindre */}
      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:'24px' }}>
          <div style={{ background:'#111', border:'1px solid rgba(201,169,106,.2)', borderRadius:'6px', padding:'36px', width:'100%', maxWidth:'420px' }}>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.2rem', fontWeight:600, marginBottom:'6px' }}>{modal.titre}</p>
            <p style={{ fontFamily:"'Montserrat'", fontSize:'.78rem', color:'rgba(248,245,242,.4)', marginBottom:'24px' }}>Entrez vos informations pour rejoindre</p>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'20px' }}>
              <input
                type="text" placeholder="Votre prénom" value={nom}
                onChange={e => setNom(e.target.value)}
                style={{ padding:'12px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'3px', color:'#F8F5F2', fontFamily:"'Montserrat'", fontSize:'.85rem', outline:'none' }}
              />
              <input
                type="text" placeholder="Password (si requis)" value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ padding:'12px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'3px', color:'#F8F5F2', fontFamily:"'Montserrat'", fontSize:'.85rem', outline:'none' }}
              />
              {error && <p style={{ color:'#C2185B', fontFamily:"'Montserrat'", fontSize:'.75rem' }}>{error}</p>}
            </div>
            <div style={{ display:'flex', gap:'10px' }}>
              <button onClick={() => setModal(null)} style={{ flex:1, padding:'12px', background:'transparent', border:'1px solid rgba(255,255,255,.1)', borderRadius:'3px', color:'rgba(248,245,242,.5)', fontFamily:"'Montserrat'", fontSize:'.75rem', cursor:'pointer' }}>
                Annuler
              </button>
              <button onClick={rejoindre} disabled={joining} style={{ flex:2, padding:'12px', background:'#C2185B', border:'none', borderRadius:'3px', color:'#fff', fontFamily:"'Montserrat'", fontSize:'.75rem', fontWeight:600, cursor:'pointer', opacity:joining?0.6:1 }}>
                {joining ? 'Connexion...' : 'Rejoindre'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
