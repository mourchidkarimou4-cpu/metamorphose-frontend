import API_URL from '../../config.js'
import { useState , useEffect } from 'react'
import usePageBackground from "../../hooks/usePageBackground";
import { Link, useNavigate } from 'react-router-dom'

// ── PARTICULES DORÉES ────────────────────────────────────────
function GoldParticles() {{
  const pts = [
    {{s:3,x:"12%",d:"0s",  du:"7s", o:.5}},
    {{s:2,x:"32%",d:"1.3s",du:"9s", o:.35}},
    {{s:4,x:"55%",d:"0.6s",du:"6s", o:.55}},
    {{s:2,x:"75%",d:"2.1s",du:"8s", o:.4}},
    {{s:3,x:"88%",d:"1s",  du:"7.5s",o:.45}},
  ];
  return (
    <>
      <BackToTop />
      <GoldCursor />
      <GoldParticles />
      <div style={{{{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}}}>
      {{pts.map((p,i) => (
        <div key={{i}} style={{{{
          position:"absolute", bottom:"-10px", left:p.x,
          width:`${{p.s}}px`, height:`${{p.s}}px`, borderRadius:"50%",
          background:`rgba(201,169,106,${{p.o}})`,
          boxShadow:`0 0 ${{p.s*2}}px rgba(201,169,106,${{p.o}})`,
          animation:`particle ${{p.du}} ${{p.d}} ease-in infinite`,
        }}}}/>
      ))}}
    </div>
  );
}}

// ── BOUTON RETOUR EN HAUT ────────────────────────────────────
function BackToTop() {{
  const [vis, setVis] = useState(false);
  useEffect(() => {{
    const fn = () => setVis(window.scrollY > 400);
    window.addEventListener("scroll", fn, {{passive:true}});
    return () => window.removeEventListener("scroll", fn);
  }}, []);
  if (!vis) return null;
  return (
    <button onClick={{()=>window.scrollTo({{top:0,behavior:"smooth"}})}}
      style={{{{
        position:"fixed", bottom:"148px", right:"16px", zIndex:148,
        width:"44px", height:"44px", borderRadius:"50%",
        background:"rgba(201,169,106,.1)", border:"1px solid rgba(201,169,106,.3)",
        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
        backdropFilter:"blur(12px)", transition:"all .3s",
      }}}}
      onMouseEnter={{e=>{{e.currentTarget.style.background="rgba(201,169,106,.22)";e.currentTarget.style.transform="translateY(-3px)"}}}}
      onMouseLeave={{e=>{{e.currentTarget.style.background="rgba(201,169,106,.1)";e.currentTarget.style.transform="none"}}}}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 12V4M4 8l4-4 4 4" stroke="#C9A96A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}}

// ── CURSEUR LUMINEUX ─────────────────────────────────────────
function GoldCursor() {{
  const [pos, setPos] = useState({{x:-200,y:-200}});
  useEffect(() => {{
    const fn = e => setPos({{x:e.clientX, y:e.clientY}});
    window.addEventListener("mousemove", fn, {{passive:true}});
    return () => window.removeEventListener("mousemove", fn);
  }}, []);
  return (
    <div style={{{{
      position:"fixed", left:pos.x-200, top:pos.y-200,
      width:"400px", height:"400px", borderRadius:"50%",
      background:"radial-gradient(circle,rgba(201,169,106,.04) 0%,transparent 70%)",
      pointerEvents:"none", zIndex:9998, transition:"left .08s linear, top .08s linear",
    }}}}/>
  );
}}


export default function Login() {
  usePageBackground("auth");
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState('')
  const [loading,  setLoading]  = useState(false)
  const navigate = useNavigate()

  async function handle(e) {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const res  = await fetch('/api/auth/login/', {
        method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok) {
        localStorage.clear()
        localStorage.setItem('mmorphose_token', data.access)
        localStorage.setItem('mmorphose_user',  JSON.stringify(data.user))
        window.location.href = data.user.is_staff ? '/admin' : '/dashboard'
      } else {
        setError(data.detail || 'Identifiants incorrects.')
      }
    } catch {
      setError('Serveur inaccessible.')
    }
    setLoading(false)
  }

  return (
    <div style={{ background:'#0A0A0A', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', padding:'24px', fontFamily:"'Montserrat',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Montserrat:wght@300;400;500;600&display=swap');
        *, *::before, *::after { box-sizing:border-box; }
        input { outline:none; }
        input:focus { border-color:rgba(201,169,106,.5) !important; }
      `}</style>

      <div style={{ maxWidth:'400px', width:'100%', background:'#141414', border:'1px solid rgba(201,169,106,.12)', borderRadius:'6px', padding:'clamp(28px,6vw,48px) clamp(20px,5vw,36px)', textAlign:'center' }}>
        <Link to="/" style={{ fontFamily:"'Montserrat'", fontSize:'.68rem', letterSpacing:'.2em', textTransform:'uppercase', color:'rgba(201,169,106,.5)', textDecoration:'none', display:'block', marginBottom:'28px' }}>
          Retour
        </Link>

        <p style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.1rem', marginBottom:'8px' }}>
          <span style={{color:'#F8F5F2'}}>Meta'</span>
          <span style={{color:'#C9A96A'}}>Morph'</span>
          <span style={{color:'#C2185B'}}>Ose</span>
        </p>
        <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'clamp(1.3rem,4vw,1.5rem)', fontWeight:600, color:'#F8F5F2', marginBottom:'6px' }}>Espace Membre</h1>
        <p style={{ fontWeight:300, fontSize:'.82rem', color:'rgba(248,245,242,.35)', marginBottom:'28px' }}>Accédez à vos replays et guides PDF</p>

        {error && (
          <div style={{ padding:'12px 16px', marginBottom:'18px', background:'rgba(194,24,91,.08)', border:'1px solid rgba(194,24,91,.3)', borderRadius:'3px', fontSize:'.82rem', fontWeight:300, color:'#C2185B', textAlign:'left' }}>
            {error}
          </div>
        )}

        <form onSubmit={handle} style={{ display:'flex', flexDirection:'column', gap:'13px' }}>
          <input type="email" placeholder="Adresse e-mail" value={email} onChange={e=>setEmail(e.target.value)} required
            style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'3px', padding:'13px 16px', color:'#F8F5F2', fontFamily:"'Montserrat'", fontSize:'.88rem', fontWeight:300, width:'100%' }}/>
          <input type="password" placeholder="Mot de passe" value={password} onChange={e=>setPassword(e.target.value)} required
            style={{ background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'3px', padding:'13px 16px', color:'#F8F5F2', fontFamily:"'Montserrat'", fontSize:'.88rem', fontWeight:300, width:'100%' }}/>
          <button type="submit" disabled={loading} style={{ background:'#C2185B', color:'#fff', fontFamily:"'Montserrat'", fontWeight:600, fontSize:'.75rem', letterSpacing:'.15em', textTransform:'uppercase', padding:'15px', border:'none', borderRadius:'3px', cursor:loading?'not-allowed':'pointer', opacity:loading?.7:1, marginTop:'6px', transition:'all .3s' }}>
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>

        <p style={{ marginTop:'20px', fontWeight:300, fontSize:'.78rem', color:'rgba(248,245,242,.25)' }}>
          Pas encore membre ?{' '}
          <a href="/#formules" style={{ color:'#C9A96A', textDecoration:'none' }}>Rejoindre le programme</a>
        </p>
        <p style={{ marginTop:'10px', fontWeight:300, fontSize:'.78rem', color:'rgba(248,245,242,.25)' }}>
          <Link to="/reset-password" style={{ color:'rgba(201,169,106,.6)', textDecoration:'none' }}>Mot de passe oublié ?</Link>
        </p>
        <div style={{ marginTop:'16px', padding:'12px', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'3px' }}>
          <p style={{ fontSize:'.75rem', fontWeight:300, color:'rgba(248,245,242,.25)', marginBottom:'6px' }}>Problème de connexion ?</p>
          <a href="https://wa.me/22901961140933" style={{ color:'#C9A96A', fontSize:'.75rem', fontWeight:500, textDecoration:'none' }}>Contacter Prélia sur WhatsApp</a>
        </div>
      </div>
    </div>
  )
}
