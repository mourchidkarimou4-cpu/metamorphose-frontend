import { useAuth } from "../context/AuthContext";
import { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes spin   { to{transform:rotate(360deg)} }
  @keyframes pulse  { 0%,100%{box-shadow:0 0 8px rgba(194,24,91,.4)} 50%{box-shadow:0 0 22px rgba(194,24,91,.7)} }
  body { background:#0A0A0A; color:#F8F5F2; font-family:'Montserrat',sans-serif; font-weight:300; }
  .tab { padding:12px 24px; background:none; border:none; border-bottom:2px solid transparent; color:rgba(248,245,242,.4); font-family:'Montserrat',sans-serif; font-size:.72rem; font-weight:500; letter-spacing:.1em; text-transform:uppercase; cursor:pointer; transition:all .3s; }
  .tab.active { color:#C9A96A; border-bottom-color:#C9A96A; }
  .card { background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.06); border-radius:8px; padding:24px; margin-bottom:14px; }
  .btn-rose { display:inline-flex; align-items:center; justify-content:center; background:#C2185B; color:#fff; font-family:'Montserrat',sans-serif; font-weight:700; font-size:.72rem; letter-spacing:.15em; text-transform:uppercase; padding:13px 28px; border:none; border-radius:3px; cursor:pointer; text-decoration:none; transition:all .3s; }
  .btn-rose:hover { background:#a01049; }
  .btn-or { display:inline-flex; align-items:center; justify-content:center; background:transparent; color:#C9A96A; border:1px solid #C9A96A; font-family:'Montserrat',sans-serif; font-weight:600; font-size:.72rem; letter-spacing:.15em; text-transform:uppercase; padding:12px 24px; border-radius:3px; cursor:pointer; text-decoration:none; transition:all .3s; }
  .btn-or:hover { background:#C9A96A; color:#0A0A0A; }
  .inp { width:100%; padding:12px 16px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:3px; color:#F8F5F2; font-family:'Montserrat',sans-serif; font-size:.88rem; font-weight:300; outline:none; }
  @media(max-width:768px) { .grid-2 { grid-template-columns:1fr !important; } }
`;

function ModalAcces({ titre, onSubmit, onClose, loading, error }) {
  const [email, setEmail] = useState('');
  const [code,  setCode]  = useState('');
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.85)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px', backdropFilter:'blur(8px)' }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div style={{ background:'#111', border:'1px solid rgba(201,169,106,.2)', borderRadius:'8px', padding:'36px 32px', width:'100%', maxWidth:'420px', animation:'fadeUp .3s both' }}>
        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:'.6rem', letterSpacing:'.25em', textTransform:'uppercase', color:'#C9A96A', marginBottom:'8px' }}>Accès requis</p>
        <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', fontWeight:600, marginBottom:'6px' }}>{titre}</h3>
        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:'.78rem', color:'rgba(248,245,242,.4)', marginBottom:'24px' }}>Entrez votre email et le code d'accès fourni.</p>
        <div style={{ display:'flex', flexDirection:'column', gap:'12px', marginBottom:'16px' }}>
          <input className="inp" type="email" placeholder="Votre email *" value={email} onChange={e=>setEmail(e.target.value)}/>
          <input className="inp" placeholder="Code d'accès *" value={code} onChange={e=>setCode(e.target.value.toUpperCase())} style={{ letterSpacing:'.2em', fontWeight:600 }}/>
        </div>
        {error && <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:'.75rem', color:'#ef5350', marginBottom:'12px' }}>{error}</p>}
        <div style={{ display:'flex', gap:'10px' }}>
          <button className="btn-rose" style={{ flex:1 }} onClick={() => onSubmit(email, code)} disabled={loading || !email || !code}>
            {loading ? 'Vérification...' : 'Accéder'}
          </button>
          <button className="btn-or" onClick={onClose}>Annuler</button>
        </div>
      </div>
    </div>
  );
}

export default function LiveMasterclass() {
  const { token, user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.is_staff === true;

  const [onglet,   setOnglet]   = useState('live');
  const [salles,   setSalles]   = useState([]);
  const [replays,  setReplays]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [modal,    setModal]    = useState(null); // { type:'live'|'replay', id, titre }
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError,   setModalError]   = useState('');
  const [creating, setCreating] = useState(false);
  const [form, setForm]         = useState({ titre:'', description:'' });
  const [error, setError]       = useState('');

  useEffect(() => {
    charger();
  }, []);

  async function charger() {
    setLoading(true);
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const [sallesData, replaysData] = await Promise.all([
      fetch('/api/live/salles-actives/', { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
      fetch('/api/contenu/replays/', { headers }).then(r => r.ok ? r.json() : []).catch(() => []),
    ]);
    setSalles(Array.isArray(sallesData) ? sallesData : []);
    setReplays(Array.isArray(replaysData) ? replaysData : []);
    setLoading(false);
  }

  async function accederLive(email, code) {
    setModalLoading(true); setModalError('');
    try {
      const res = await fetch(`/api/live/${modal.id}/rejoindre-public/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (res.ok) {
        setModal(null);
        navigate(`/meeting/${modal.id}`);
      } else {
        setModalError(data.detail || 'Code incorrect.');
      }
    } catch { setModalError('Erreur réseau.'); }
    setModalLoading(false);
  }

  async function accederReplay(email, code) {
    setModalLoading(true); setModalError('');
    try {
      const res = await fetch(`/api/contenu/replays/${modal.id}/acces/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      const data = await res.json();
      if (res.ok) {
        setModal(null);
        // Ouvrir la vidéo dans une nouvelle page ou modal
        window.open(data.replay.video_url, '_blank');
      } else {
        setModalError(data.detail || 'Code incorrect.');
      }
    } catch { setModalError('Erreur réseau.'); }
    setModalLoading(false);
  }

  async function creerSalle() {
    if (!form.titre.trim()) { setError('Titre requis.'); return; }
    setCreating(true); setError('');
    try {
      const res = await fetch('/api/live/creer/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, frontend_url: window.location.origin }),
      });
      const data = await res.json();
      if (res.ok) {
        charger();
        setForm({ titre:'', description:'' });
        alert(`Salle créée !\nLien : ${data.lien}\nCode : ${data.code_acces}`);
      } else {
        setError(data.detail || 'Erreur.');
      }
    } catch { setError('Erreur réseau.'); }
    setCreating(false);
  }

  const inp = { width:'100%', padding:'10px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'3px', color:'#F8F5F2', fontFamily:"'Montserrat',sans-serif", fontSize:'.82rem', fontWeight:300, outline:'none', boxSizing:'border-box' };

  return (
    <>
      <style>{STYLES}</style>

      {/* NAV */}
      <nav style={{ padding:'16px 24px', borderBottom:'1px solid rgba(201,169,106,.1)', display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, background:'rgba(10,10,10,.96)', backdropFilter:'blur(20px)', zIndex:200 }}>
        <Link to="/" style={{ textDecoration:'none' }}>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:'1rem' }}>
            <span style={{color:'#F8F5F2'}}>Méta'</span>
            <span style={{color:'#C9A96A'}}>Morph'</span>
            <span style={{color:'#C2185B'}}>Ose</span>
          </span>
        </Link>
        <Link to={user ? '/dashboard' : '/espace-membre'} style={{ fontFamily:"'Montserrat',sans-serif", fontSize:'.68rem', letterSpacing:'.15em', textTransform:'uppercase', color:'rgba(201,169,106,.5)', textDecoration:'none' }}>
          {user ? 'Mon espace' : 'Se connecter'}
        </Link>
      </nav>

      {/* HERO */}
      <section style={{ padding:'72px 24px 48px', textAlign:'center', background:'linear-gradient(180deg,rgba(194,24,91,.06),transparent)' }}>
        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:'.62rem', letterSpacing:'.3em', textTransform:'uppercase', color:'#C9A96A', marginBottom:'12px', animation:'fadeUp .6s both' }}>Méta'Morph'Ose</p>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.8rem,5vw,2.8rem)', fontWeight:600, marginBottom:'14px', animation:'fadeUp .7s .1s both' }}>Lives & Replays</h1>
        <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:'.88rem', color:'rgba(248,245,242,.5)', maxWidth:'520px', margin:'0 auto', lineHeight:1.7, animation:'fadeUp .7s .2s both' }}>
          Sessions en direct et replays exclusifs de Coach Prélia APEDO AHONON.
        </p>
      </section>

      {/* TABS */}
      <div style={{ display:'flex', borderBottom:'1px solid rgba(255,255,255,.08)', maxWidth:'800px', margin:'0 auto', padding:'0 24px' }}>
        <button className={`tab ${onglet==='live'?'active':''}`} onClick={() => setOnglet('live')}>Live en cours</button>
        <button className={`tab ${onglet==='replays'?'active':''}`} onClick={() => setOnglet('replays')}>Replays</button>
        {isAdmin && <button className={`tab ${onglet==='admin'?'active':''}`} onClick={() => setOnglet('admin')}>Gérer</button>}
      </div>

      <main style={{ maxWidth:'800px', margin:'0 auto', padding:'32px 24px 80px' }}>

        {loading && (
          <div style={{ textAlign:'center', padding:'60px' }}>
            <div style={{ width:'28px', height:'28px', border:'2px solid rgba(201,169,106,.2)', borderTop:'2px solid #C9A96A', borderRadius:'50%', animation:'spin .8s linear infinite', margin:'0 auto' }}/>
          </div>
        )}

        {/* LIVE */}
        {!loading && onglet === 'live' && (
          <div style={{ animation:'fadeUp .5s both' }}>
            {salles.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 24px' }}>
                <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:'1.1rem', color:'rgba(248,245,242,.3)', marginBottom:'16px' }}>Aucun live en cours pour le moment.</p>
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:'.78rem', color:'rgba(248,245,242,.25)', lineHeight:1.7 }}>Coach Prélia APEDO AHONON lancera le prochain live bientôt. Reste connectée pour ne rien manquer.</p>
              </div>
            ) : salles.map(s => (
              <div key={s.id} className="card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px' }}>
                <div>
                  <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px' }}>
                    <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#C2185B', display:'inline-block', animation:'pulse 2s infinite' }}/>
                    <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.05rem', fontWeight:600 }}>{s.titre}</p>
                  </div>
                  {s.description && <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:'.78rem', color:'rgba(248,245,242,.4)', fontWeight:300 }}>{s.description}</p>}
                </div>
                <button className="btn-rose" onClick={() => { setModal({ type:'live', id:s.id, titre:s.titre }); setModalError(''); }}>
                  Rejoindre le live
                </button>
              </div>
            ))}
          </div>
        )}

        {/* REPLAYS */}
        {!loading && onglet === 'replays' && (
          <div style={{ animation:'fadeUp .5s both' }}>
            {replays.length === 0 ? (
              <div style={{ textAlign:'center', padding:'60px 24px' }}>
                <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:'1.1rem', color:'rgba(248,245,242,.3)' }}>Aucun replay disponible pour le moment.</p>
              </div>
            ) : replays.map(r => (
              <div key={r.id} className="card" style={{ display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px' }}>
                <div>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:'.6rem', letterSpacing:'.2em', textTransform:'uppercase', color:'#C9A96A', marginBottom:'6px' }}>Semaine {r.semaine}</p>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.05rem', fontWeight:600 }}>{r.titre}</p>
                </div>
                <button className="btn-or" onClick={() => { setModal({ type:'replay', id:r.id, titre:r.titre }); setModalError(''); }}>
                  Accéder au replay
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ADMIN — CRÉER SALLE */}
        {!loading && onglet === 'admin' && isAdmin && (
          <div style={{ animation:'fadeUp .5s both' }}>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', fontWeight:600, marginBottom:'20px' }}>Créer un live</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'12px', maxWidth:'480px' }}>
              <input style={inp} placeholder="Titre du live *" value={form.titre} onChange={e=>setForm(f=>({...f,titre:e.target.value}))}/>
              <textarea style={{...inp, minHeight:'80px', resize:'vertical'}} placeholder="Description (optionnel)" value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))}/>
              {error && <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:'.75rem', color:'#ef5350' }}>{error}</p>}
              <button className="btn-rose" onClick={creerSalle} disabled={creating}>
                {creating ? 'Création...' : 'Créer le live'}
              </button>
            </div>
          </div>
        )}

      </main>

      {/* MODAL ACCÈS */}
      {modal && (
        <ModalAcces
          titre={modal.titre}
          onClose={() => setModal(null)}
          onSubmit={modal.type === 'live' ? accederLive : accederReplay}
          loading={modalLoading}
          error={modalError}
        />
      )}
    </>
  );
}
