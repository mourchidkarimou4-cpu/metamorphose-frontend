import usePageBackground from "../../hooks/usePageBackground";
import API_URL from '../../config.js'
import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'

const FORMULES = { F1:'Live · Groupe', F2:'Live · Privé', F3:'Présentiel · Groupe', F4:'Présentiel · Privé' }

function Etoiles({ note, onSelect }) {
  const [hover, setHover] = useState(0);
  return (
    <div style={{ display:"flex", gap:"4px" }}>
      {[1,2,3,4,5].map(i => (
        <button key={i}
          onClick={() => onSelect && onSelect(i)}
          onMouseEnter={() => onSelect && setHover(i)}
          onMouseLeave={() => onSelect && setHover(0)}
          style={{ background:"none", border:"none", cursor:onSelect?"pointer":"default", fontSize:"1.4rem", color: i <= (hover||note) ? "#C9A96A" : "rgba(255,255,255,.15)", transition:"color .2s", padding:"2px" }}>
          ★
        </button>
      ))}
    </div>
  );
}

function FormulaireTeomo({ user, onSuccess }) {
  const [form, setForm] = useState({ prenom: user?.first_name || "", pays: user?.pays || "", formule: user?.formule || "", texte:"", note:5, video_url:"" });
  const [photoAvant, setPhotoAvant] = useState(null);
  const [photoApres, setPhotoApres] = useState(null);
  const [prevAvant,  setPrevAvant]  = useState(null);
  const [prevApres,  setPrevApres]  = useState(null);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  function set(k, v) { setForm(p => ({...p, [k]:v})); }

  function handlePhoto(e, type) {
    const file = e.target.files[0];
    if (!file) return;
    if (type === "avant") { setPhotoAvant(file); setPrevAvant(URL.createObjectURL(file)); }
    else { setPhotoApres(file); setPrevApres(URL.createObjectURL(file)); }
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.texte.trim()) { setError("Veuillez écrire votre témoignage."); return; }
    setLoading(true); setError("");

    const token = localStorage.getItem("mmorphose_token");
    const data  = new FormData();
    Object.entries(form).forEach(([k,v]) => data.append(k, v));
    if (photoAvant) data.append("photo_avant", photoAvant);
    if (photoApres) data.append("photo_apres", photoApres);

    try {
      const res = await fetch(API_URL + '/api/avis/soumettre/', {
        method:"POST",
        headers:{ "Authorization": `Bearer ${token}` },
        body: data,
      });
      if (res.ok) { onSuccess(); }
      else {
        const d = await res.json();
        setError(d.detail || "Erreur lors de l'envoi.");
      }
    } catch {
      setError("Serveur inaccessible.");
    }
    setLoading(false);
  }

  const inputStyle = { width:"100%", padding:"11px 14px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"3px", color:"#F8F5F2", fontFamily:"'Montserrat',sans-serif", fontSize:".85rem", fontWeight:300, outline:"none" };

  return (
    <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:"16px" }}>
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
        <div>
          <label style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(248,245,242,.4)", display:"block", marginBottom:"6px" }}>Prénom</label>
          <input style={inputStyle} value={form.prenom} onChange={e=>set("prenom",e.target.value)} placeholder="Votre prénom"/>
        </div>
        <div>
          <label style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(248,245,242,.4)", display:"block", marginBottom:"6px" }}>Pays</label>
          <input style={inputStyle} value={form.pays} onChange={e=>set("pays",e.target.value)} placeholder="Votre pays"/>
        </div>
      </div>

      {/* Note */}
      <div>
        <label style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(248,245,242,.4)", display:"block", marginBottom:"8px" }}>Votre note</label>
        <Etoiles note={form.note} onSelect={n=>set("note",n)}/>
      </div>

      {/* Texte */}
      <div>
        <label style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(248,245,242,.4)", display:"block", marginBottom:"6px" }}>Votre témoignage *</label>
        <textarea style={{ ...inputStyle, resize:"vertical", minHeight:"120px" }} value={form.texte} onChange={e=>set("texte",e.target.value)} placeholder="Partagez votre expérience avec Méta'Morph'Ose..."/>
      </div>

      {/* Lien vidéo */}
      <div>
        <label style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(248,245,242,.4)", display:"block", marginBottom:"6px" }}>
          Lien vidéo <span style={{ opacity:.5, fontWeight:300, textTransform:"none", letterSpacing:0 }}>(YouTube, TikTok…)</span>
        </label>
        <input style={inputStyle} type="url" value={form.video_url} onChange={e=>set("video_url",e.target.value)} placeholder="https://youtube.com/..."/>
      </div>

      {/* Photos avant/après */}
      <div>
        <label style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(248,245,242,.4)", display:"block", marginBottom:"10px" }}>
          Photos avant / après <span style={{ opacity:.5, fontWeight:300, textTransform:"none", letterSpacing:0 }}>(optionnel)</span>
        </label>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
          {[
            { label:"Avant", prev:prevAvant, type:"avant" },
            { label:"Après", prev:prevApres, type:"apres" },
          ].map(({ label, prev, type }) => (
            <label key={type} style={{ cursor:"pointer" }}>
              <div style={{ aspectRatio:"1", background:"rgba(255,255,255,.03)", border:`1px dashed ${prev?"rgba(201,169,106,.3)":"rgba(255,255,255,.1)"}`, borderRadius:"4px", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center", transition:"border .25s" }}>
                {prev ? (
                  <img src={prev} alt={label} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                ) : (
                  <div style={{ textAlign:"center", padding:"12px" }}>
                    <p style={{ fontFamily:"'Montserrat'", fontSize:".72rem", fontWeight:500, color:"rgba(248,245,242,.3)", marginBottom:"4px" }}>{label}</p>
                    <p style={{ fontFamily:"'Montserrat'", fontSize:".62rem", color:"rgba(248,245,242,.2)" }}>Cliquer pour ajouter</p>
                  </div>
                )}
              </div>
              <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>handlePhoto(e,type)}/>
            </label>
          ))}
        </div>
      </div>

      {error && (
        <div style={{ padding:"12px 16px", background:"rgba(239,83,80,.08)", border:"1px solid rgba(239,83,80,.25)", borderRadius:"3px", fontFamily:"'Montserrat'", fontSize:".82rem", color:"#ef5350", fontWeight:300 }}>
          {error}
        </div>
      )}

      <button type="submit" disabled={loading} style={{ padding:"14px", background:"#C2185B", color:"#fff", border:"none", borderRadius:"3px", fontFamily:"'Montserrat'", fontWeight:600, fontSize:".75rem", letterSpacing:".15em", textTransform:"uppercase", cursor:loading?"not-allowed":"pointer", opacity:loading?.7:1, transition:"all .3s" }}>
        {loading ? "Envoi en cours..." : "Soumettre mon témoignage"}
      </button>
      <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".72rem", color:"rgba(248,245,242,.3)", textAlign:"center", lineHeight:1.65 }}>
        Votre témoignage sera publié après validation par Prélia.
      </p>
    </form>
  );
}

export default function Dashboard() {
  usePageBackground("admin");
  const [user,    setUser]    = useState(null)
  const [guides,  setGuides]  = useState([])
  const [replays, setReplays] = useState([])
  const [mesTemos,setMesTemos]= useState([])
  const [loading, setLoading] = useState(true)
  const [tab,     setTab]     = useState('replays')
  const [temoSubmitted, setTemoSubmitted] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    const token = localStorage.getItem('mmorphose_token')
    if (!token) { navigate('/espace-membre'); return }
    const saved = localStorage.getItem('mmorphose_user')
    if (saved) setUser(JSON.parse(saved))

    async function load() {
      const headers = { 'Authorization': 'Bearer ' + token }
      try {
        const [uRes, gRes, rRes, tRes] = await Promise.all([
          fetch(API_URL + '/api/auth/me/',            { headers }),
          fetch(API_URL + '/api/contenu/guides/',     { headers }),
          fetch(API_URL + '/api/contenu/replays/',    { headers }),
          fetch(API_URL + '/api/avis/mes-temoignages/', { headers }),
        ])
        if (uRes.status === 401) { navigate('/espace-membre'); return }
        const [u, g, r, t] = await Promise.all([uRes.json(), gRes.json(), rRes.json(), tRes.json()])
        setUser(u); setGuides(g); setReplays(r)
        setMesTemos(Array.isArray(t) ? t : [])
        localStorage.setItem('mmorphose_user', JSON.stringify(u))
      } catch {}
      setLoading(false)
    }
    load()
  }, [])

  function logout() {
    localStorage.removeItem('mmorphose_token')
    localStorage.removeItem('mmorphose_user')
    navigate('/espace-membre')
  }

  const BONUS = [
    'Gerer efficacement son temps (Methode Eisenhower)',
    'Trouver la passion de son coeur',
    'Se presenter et parler de soi avec impact',
    'Affirmations pour situations du quotidien',
    'Definir ses objectifs et sa vision',
    'Club des Metamorphosees',
    'Replays des sessions live',
  ]

  const STATUT_COLORS = { en_attente:"#C9A96A", approuve:"#4CAF50", refuse:"#ef5350" }
  const STATUT_LABELS = { en_attente:"En attente", approuve:"Publié", refuse:"Non retenu" }

  if (loading) return (
    <div style={{ background:'#0A0A0A', minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      <div style={{ width:'24px', height:'24px', borderRadius:'50%', border:'2px solid rgba(201,169,106,.2)', borderTopColor:'#C9A96A', animation:'spin .7s linear infinite' }}/>
    </div>
  )

  return (
    <div style={{ background:'#0A0A0A', minHeight:'100vh', color:'#F8F5F2', fontFamily:"'Montserrat',sans-serif" }}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
    @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
    @media(max-width:768px){
      .dash-nav{padding:14px 16px !important}
      .dash-content{padding:32px 16px !important}
      .profil-grid{grid-template-columns:1fr !important}
    }
    @media(max-width:480px){
      .tabs-container{overflow-x:auto !important;flex-wrap:nowrap !important}
      .tabs-container button{white-space:nowrap !important;flex-shrink:0!important}
    }`}</style>

      <nav className='dash-nav' style={{ padding:'18px 40px', borderBottom:'1px solid rgba(201,169,106,.1)', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'12px' }}>
        <Link to="/" style={{ textDecoration:'none' }}>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:'1rem' }}>
            <span style={{color:'#F8F5F2'}}>Meta'</span>
            <span style={{color:'#C9A96A'}}>Morph'</span>
            <span style={{color:'#C2185B'}}>Ose</span>
          </span>
        </Link>
        {user && (
          <div style={{ display:'flex', alignItems:'center', gap:'20px' }}>
            <span style={{ fontSize:'.78rem', fontWeight:300, color:'rgba(248,245,242,.45)' }}>
              {user.first_name || user.email}
              {user.formule && <span style={{ marginLeft:'8px', color:'#C9A96A' }}>· {FORMULES[user.formule]}</span>}
            </span>
            <button onClick={logout} style={{ background:'none', border:'1px solid rgba(255,255,255,.1)', borderRadius:'3px', padding:'8px 16px', color:'rgba(248,245,242,.4)', fontFamily:"'Montserrat'", fontSize:'.68rem', letterSpacing:'.12em', textTransform:'uppercase', cursor:'pointer', transition:'all .3s' }}
              onMouseEnter={e=>{e.target.style.borderColor='rgba(194,24,91,.4)';e.target.style.color='#C2185B'}}
              onMouseLeave={e=>{e.target.style.borderColor='rgba(255,255,255,.1)';e.target.style.color='rgba(248,245,242,.4)'}}>
              Se deconnecter
            </button>
          </div>
        )}
      </nav>

      <div className='dash-content' style={{ maxWidth:'960px', margin:'0 auto', padding:'52px 24px' }}>
        <div style={{ marginBottom:'40px', animation:'fadeUp .6s both' }}>
          <p style={{ fontSize:'.62rem', letterSpacing:'.25em', textTransform:'uppercase', color:'#C9A96A', marginBottom:'8px' }}>Bienvenue</p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:'2rem', fontWeight:600 }}>
            {user ? 'Bonjour, ' + (user.first_name || user.email.split('@')[0]) : 'Votre espace'}
          </h1>
          {user && user.actif === false && (
            <div style={{ marginTop:'16px', padding:'14px 18px', background:'rgba(201,169,106,.06)', border:'1px solid rgba(201,169,106,.2)', borderRadius:'3px', fontSize:'.82rem', fontWeight:300, color:'rgba(248,245,242,.65)' }}>
              Votre acces est en cours d activation. Prelia vous confirmera votre place sous 24 a 48h.
            </div>
          )}
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:'4px', marginBottom:'28px', background:'rgba(255,255,255,.03)', borderRadius:'4px', padding:'4px', width:'100%', overflowX:'auto', flexWrap:'nowrap' }}>
          {[['replays','Replays'],['guides','Guides PDF'],['temoignage','Mon Témoignage'],['profil','Mon profil'],['compte','Mon Compte']].map(([id,label]) => (
            <button key={id} onClick={()=>setTab(id)} style={{
              padding:'10px 18px', borderRadius:'3px', border:'none', cursor:'pointer',
              fontFamily:"'Montserrat'", fontSize:'.7rem', fontWeight:500,
              letterSpacing:'.1em', textTransform:'uppercase',
              background: tab===id ? '#C2185B' : 'transparent',
              color: tab===id ? '#fff' : 'rgba(248,245,242,.4)',
              transition:'all .25s',
            }}>{label}</button>
          ))}
        </div>

        {/* Replays */}
        {tab === 'replays' && (
          <div style={{ animation:'fadeUp .5s both' }}>
            <p style={{ fontSize:'.62rem', letterSpacing:'.22em', textTransform:'uppercase', color:'#C9A96A', marginBottom:'16px' }}>
              Replays · {replays.length > 0 ? replays.length + ' disponibles' : 'Bientot disponibles'}
            </p>
            {replays.length > 0 ? replays.map((r,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', background:'rgba(255,255,255,.025)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'3px', marginBottom:'10px' }}>
                <div>
                  <p style={{ fontWeight:500, fontSize:'.88rem', marginBottom:'3px' }}>{r.titre}</p>
                  <p style={{ fontWeight:300, fontSize:'.75rem', color:'rgba(248,245,242,.4)' }}>Semaine {r.semaine}</p>
                </div>
                <a href={r.video_url} target="_blank" rel="noreferrer" style={{ background:'#C2185B', color:'#fff', padding:'9px 18px', borderRadius:'3px', textDecoration:'none', fontFamily:"'Montserrat'", fontSize:'.68rem', fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase' }}>Voir</a>
              </div>
            )) : (
              <div style={{ padding:'40px', textAlign:'center', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'4px' }}>
                <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:'italic', fontSize:'1rem', color:'rgba(248,245,242,.3)' }}>Les replays seront disponibles des le debut de votre vague.</p>
              </div>
            )}
          </div>
        )}

        {/* Guides */}
        {tab === 'guides' && (
          <div style={{ animation:'fadeUp .5s both' }}>
            <p style={{ fontSize:'.62rem', letterSpacing:'.22em', textTransform:'uppercase', color:'#C9A96A', marginBottom:'16px' }}>7 Guides PDF · Bonus exclusifs</p>
            {(guides.length > 0 ? guides : BONUS.map((t,i)=>({id:i,titre:t,numero:i+1,fichier:null}))).map((g,i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 20px', background:'rgba(255,255,255,.025)', border:'1px solid rgba(255,255,255,.05)', borderLeft:'3px solid rgba(201,169,106,.4)', borderRadius:'3px', marginBottom:'10px' }}>
                <div style={{ display:'flex', gap:'14px', alignItems:'center' }}>
                  <span style={{ background:'rgba(201,169,106,.1)', color:'#C9A96A', width:'28px', height:'28px', borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'.7rem', fontWeight:700, flexShrink:0 }}>{g.numero}</span>
                  <p style={{ fontWeight:300, fontSize:'.88rem' }}>{g.titre}</p>
                </div>
                {g.fichier
                  ? <a href={g.fichier} download style={{ background:'rgba(201,169,106,.1)', color:'#C9A96A', padding:'9px 18px', borderRadius:'3px', textDecoration:'none', fontFamily:"'Montserrat'", fontSize:'.68rem', fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', border:'1px solid rgba(201,169,106,.2)' }}>PDF</a>
                  : <span style={{ fontSize:'.72rem', color:'rgba(248,245,242,.2)', fontStyle:'italic' }}>Bientot</span>
                }
              </div>
            ))}
          </div>
        )}

        {/* Témoignage */}
        {tab === 'temoignage' && (
          <div style={{ animation:'fadeUp .5s both', maxWidth:'640px' }}>
            <p style={{ fontSize:'.62rem', letterSpacing:'.22em', textTransform:'uppercase', color:'#C9A96A', marginBottom:'20px' }}>Mon Témoignage</p>

            {/* Mes témoignages existants */}
            {mesTemos.length > 0 && (
              <div style={{ marginBottom:'32px' }}>
                <p style={{ fontFamily:"'Montserrat'", fontSize:'.78rem', fontWeight:500, marginBottom:'14px' }}>Mes témoignages soumis :</p>
                {mesTemos.map((t,i) => (
                  <div key={i} style={{ padding:'16px 20px', background:'rgba(255,255,255,.025)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'3px', marginBottom:'10px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'8px' }}>
                      <div style={{ display:'flex', gap:'4px' }}>
                        {[1,2,3,4,5].map(s => <span key={s} style={{ color:s<=t.note?"#C9A96A":"rgba(255,255,255,.15)", fontSize:'.9rem' }}>★</span>)}
                      </div>
                      <span style={{ fontFamily:"'Montserrat'", fontSize:'.62rem', fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', color:STATUT_COLORS[t.statut], padding:'3px 8px', border:`1px solid ${STATUT_COLORS[t.statut]}40`, borderRadius:'100px' }}>
                        {STATUT_LABELS[t.statut]}
                      </span>
                    </div>
                    <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:'italic', fontSize:'.95rem', color:'rgba(248,245,242,.65)', lineHeight:1.65 }}>« {t.texte} »</p>
                  </div>
                ))}
              </div>
            )}

            {/* Formulaire */}
            {temoSubmitted ? (
              <div style={{ padding:'36px', background:'rgba(76,175,80,.06)', border:'1px solid rgba(76,175,80,.2)', borderRadius:'6px', textAlign:'center', animation:'fadeUp .5s both' }}>
                <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:'rgba(76,175,80,.1)', border:'2px solid rgba(76,175,80,.4)', display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 16px', fontSize:'1.3rem', color:'#4CAF50' }}>✓</div>
                <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', marginBottom:'10px' }}>Témoignage soumis</h3>
                <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:'.85rem', color:'rgba(248,245,242,.5)', lineHeight:1.7 }}>
                  Merci pour votre témoignage. Il sera publié sur la page témoignages après validation par Prélia.
                </p>
                <Link to="/temoignages" style={{ display:'inline-block', marginTop:'20px', color:'#C9A96A', fontFamily:"'Montserrat'", fontSize:'.72rem', letterSpacing:'.12em', textTransform:'uppercase', textDecoration:'none' }}>
                  Voir les témoignages
                </Link>
              </div>
            ) : (
              <div style={{ padding:'28px 24px', background:'rgba(255,255,255,.025)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'6px' }}>
                <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:'.85rem', color:'rgba(248,245,242,.55)', lineHeight:1.7, marginBottom:'24px' }}>
                  Partagez votre expérience avec Méta'Morph'Ose. Votre témoignage peut inspirer d'autres femmes à oser leur transformation.
                </p>
                <FormulaireTeomo user={user} onSuccess={() => setTemoSubmitted(true)} />
              </div>
            )}
          </div>
        )}

        {/* Mon Compte */}
        {tab === 'compte' && (
          <div style={{ maxWidth:'500px', animation:'fadeUp .5s both' }}>
            <p style={{ fontSize:'.62rem', letterSpacing:'.22em', textTransform:'uppercase', color:'#C9A96A', marginBottom:'20px' }}>Mon Compte</p>

            {/* Informations personnelles */}
            <div style={{ padding:'24px', background:'rgba(255,255,255,.025)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'6px', marginBottom:'16px' }}>
              <p style={{ fontFamily:"'Montserrat'", fontSize:'.65rem', letterSpacing:'.18em', textTransform:'uppercase', color:'#C9A96A', marginBottom:'18px' }}>
                Informations personnelles
              </p>
              {(() => {
                const [prenom,   setPrenom]   = React.useState(user?.first_name  || '');
                const [nom,      setNom]      = React.useState(user?.last_name   || '');
                const [email,    setEmail]    = React.useState(user?.email       || '');
                const [whatsapp, setWhatsapp] = React.useState(user?.whatsapp    || '');
                const [pays,     setPays]     = React.useState(user?.pays        || '');
                const [saving,   setSaving]   = React.useState(false);
                const [msg,      setMsg]      = React.useState('');

                async function save(e) {
                  e.preventDefault();
                  setSaving(true); setMsg('');
                  const token = localStorage.getItem('mmorphose_token');
                  try {
                    const res = await fetch(API_URL + '/api/auth/update-profile/', {
                      method:'PATCH',
                      headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
                      body: JSON.stringify({ email, first_name:prenom, last_name:nom, whatsapp, pays }),
                    });
                    if (res.ok) {
                      const d = await res.json();
                      localStorage.setItem('mmorphose_user', JSON.stringify({...user,...d}));
                      setMsg('success');
                    } else {
                      const d = await res.json();
                      setMsg(d.detail || 'Erreur');
                    }
                  } catch { setMsg('Serveur inaccessible.'); }
                  setSaving(false);
                }

                const inputStyle = { width:'100%', padding:'11px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'3px', color:'#F8F5F2', fontFamily:"'Montserrat'", fontSize:'.85rem', fontWeight:300, outline:'none' };

                return (
                  <form onSubmit={save} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                      <div>
                        <label style={{ fontFamily:"'Montserrat'", fontSize:'.6rem', letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(248,245,242,.4)', display:'block', marginBottom:'6px' }}>Prénom</label>
                        <input style={inputStyle} value={prenom} onChange={e=>setPrenom(e.target.value)} placeholder='Votre prénom'/>
                      </div>
                      <div>
                        <label style={{ fontFamily:"'Montserrat'", fontSize:'.6rem', letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(248,245,242,.4)', display:'block', marginBottom:'6px' }}>Nom</label>
                        <input style={inputStyle} value={nom} onChange={e=>setNom(e.target.value)} placeholder='Votre nom'/>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontFamily:"'Montserrat'", fontSize:'.6rem', letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(248,245,242,.4)', display:'block', marginBottom:'6px' }}>Email *</label>
                      <input style={inputStyle} type='email' value={email} onChange={e=>setEmail(e.target.value)} required/>
                    </div>
                    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                      <div>
                        <label style={{ fontFamily:"'Montserrat'", fontSize:'.6rem', letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(248,245,242,.4)', display:'block', marginBottom:'6px' }}>WhatsApp</label>
                        <input style={inputStyle} value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder='+229 01 XX XX XX'/>
                      </div>
                      <div>
                        <label style={{ fontFamily:"'Montserrat'", fontSize:'.6rem', letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(248,245,242,.4)', display:'block', marginBottom:'6px' }}>Pays</label>
                        <input style={inputStyle} value={pays} onChange={e=>setPays(e.target.value)} placeholder='Votre pays'/>
                      </div>
                    </div>
                    {msg === 'success' && (
                      <p style={{ fontFamily:"'Montserrat'", fontSize:'.78rem', color:'#4CAF50', textAlign:'center' }}>Informations mises à jour</p>
                    )}
                    {msg && msg !== 'success' && (
                      <p style={{ fontFamily:"'Montserrat'", fontSize:'.78rem', color:'#ef5350', textAlign:'center' }}>{msg}</p>
                    )}
                    <button type='submit' disabled={saving} style={{ padding:'13px', background:'#C2185B', color:'#fff', border:'none', borderRadius:'3px', fontFamily:"'Montserrat'", fontWeight:600, fontSize:'.74rem', letterSpacing:'.15em', textTransform:'uppercase', cursor:saving?'not-allowed':'pointer', opacity:saving?.7:1 }}>
                      {saving ? 'Enregistrement...' : 'Enregistrer'}
                    </button>
                  </form>
                );
              })()}
            </div>

            {/* Changer mot de passe */}
            <div style={{ padding:'24px', background:'rgba(255,255,255,.025)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'6px' }}>
              <p style={{ fontFamily:"'Montserrat'", fontSize:'.65rem', letterSpacing:'.18em', textTransform:'uppercase', color:'#C9A96A', marginBottom:'18px' }}>
                Changer le mot de passe
              </p>
              {(() => {
                const [oldPwd,   setOldPwd]   = React.useState('');
                const [newPwd,   setNewPwd]   = React.useState('');
                const [confirm,  setConfirm]  = React.useState('');
                const [showPwd,  setShowPwd]  = React.useState(false);
                const [saving,   setSaving]   = React.useState(false);
                const [msg,      setMsg]      = React.useState('');

                async function changePass(e) {
                  e.preventDefault();
                  if (newPwd.length < 8) { setMsg('8 caractères minimum'); return; }
                  if (newPwd !== confirm) { setMsg('Les mots de passe ne correspondent pas'); return; }
                  setSaving(true); setMsg('');
                  const token = localStorage.getItem('mmorphose_token');
                  try {
                    const res = await fetch(API_URL + '/api/auth/change-password/', {
                      method:'POST',
                      headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
                      body: JSON.stringify({ old_password:oldPwd, new_password:newPwd }),
                    });
                    if (res.ok) {
                      setMsg('success');
                      setOldPwd(''); setNewPwd(''); setConfirm('');
                    } else {
                      const d = await res.json();
                      setMsg(d.detail || 'Ancien mot de passe incorrect');
                    }
                  } catch { setMsg('Serveur inaccessible.'); }
                  setSaving(false);
                }

                const inputStyle = { width:'100%', padding:'11px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'3px', color:'#F8F5F2', fontFamily:"'Montserrat'", fontSize:'.85rem', fontWeight:300, outline:'none' };

                return (
                  <form onSubmit={changePass} style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                    {[
                      { label:'Ancien mot de passe',        val:oldPwd,  set:setOldPwd },
                      { label:'Nouveau mot de passe',       val:newPwd,  set:setNewPwd },
                      { label:'Confirmer le mot de passe',  val:confirm, set:setConfirm },
                    ].map(({label,val,set},i) => (
                      <div key={i}>
                        <label style={{ fontFamily:"'Montserrat'", fontSize:'.6rem', letterSpacing:'.12em', textTransform:'uppercase', color:'rgba(248,245,242,.4)', display:'block', marginBottom:'6px' }}>{label}</label>
                        <div style={{ position:'relative' }}>
                          <input style={{...inputStyle, paddingRight:'60px'}} type={showPwd?'text':'password'} value={val} onChange={e=>set(e.target.value)} placeholder='••••••••' required/>
                          {i === 0 && (
                            <button type='button' onClick={()=>setShowPwd(!showPwd)} style={{ position:'absolute', right:'12px', top:'50%', transform:'translateY(-50%)', background:'none', border:'none', color:'rgba(248,245,242,.4)', cursor:'pointer', fontFamily:"'Montserrat'", fontSize:'.68rem' }}>
                              {showPwd?'Cacher':'Voir'}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                    {msg === 'success' && (
                      <p style={{ fontFamily:"'Montserrat'", fontSize:'.78rem', color:'#4CAF50', textAlign:'center' }}>Mot de passe modifié</p>
                    )}
                    {msg && msg !== 'success' && (
                      <p style={{ fontFamily:"'Montserrat'", fontSize:'.78rem', color:'#ef5350', textAlign:'center' }}>{msg}</p>
                    )}
                    <button type='submit' disabled={saving} style={{ padding:'13px', background:'transparent', color:'#C9A96A', border:'1px solid #C9A96A', borderRadius:'3px', fontFamily:"'Montserrat'", fontWeight:600, fontSize:'.74rem', letterSpacing:'.15em', textTransform:'uppercase', cursor:saving?'not-allowed':'pointer', opacity:saving?.7:1 }}>
                      {saving ? 'Modification...' : 'Changer le mot de passe'}
                    </button>
                  </form>
                );
              })()}
            </div>
          </div>
        )}

        {/* Profil */}
        {tab === 'profil' && user && (
          <div style={{ maxWidth:'460px', animation:'fadeUp .5s both' }}>
            <p style={{ fontSize:'.62rem', letterSpacing:'.22em', textTransform:'uppercase', color:'#C9A96A', marginBottom:'20px' }}>Mon profil</p>
            {[
              ['Email',    user.email],
              ['Formule',  FORMULES[user.formule] || 'Non definie'],
              ['Pays',     user.pays || 'Non renseigne'],
              ['WhatsApp', user.whatsapp || 'Non renseigne'],
              ['Statut',   user.actif ? 'Acces actif' : 'En attente'],
            ].map(([label,val],i) => (
              <div key={i} style={{ display:'flex', justifyContent:'space-between', padding:'14px 0', borderBottom:'1px solid rgba(255,255,255,.05)' }}>
                <span style={{ fontSize:'.72rem', fontWeight:500, letterSpacing:'.1em', textTransform:'uppercase', color:'rgba(248,245,242,.35)' }}>{label}</span>
                <span style={{ fontSize:'.88rem', fontWeight:300, color: label==='Statut' && user.actif ? '#C9A96A' : '#F8F5F2' }}>{val}</span>
              </div>
            ))}
            <div style={{ marginTop:'28px', display:'flex', gap:'12px', flexWrap:'wrap' }}>
                <button onClick={async () => {
                  const token = localStorage.getItem('mmorphose_token');
                  const res = await fetch(API_URL + '/api/auth/certificat/', { headers:{'Authorization':`Bearer ${token}`} });
                  if(res.ok) {
                    const blob = await res.blob();
                    const a = document.createElement('a');
                    a.href = URL.createObjectURL(blob);
                    a.download = 'Certificat_MetaMorphOse.pdf';
                    a.click();
                  } else { alert('Erreur lors de la génération du certificat.'); }
                }} style={{ fontFamily:"'Montserrat'", fontSize:'.72rem', fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:'#fff', background:'#C2185B', border:'none', borderRadius:'3px', padding:'12px 20px', cursor:'pointer' }}>
                  Télécharger mon certificat
                </button>
              <a href="https://wa.me/22901961140933" style={{ fontFamily:"'Montserrat'", fontSize:'.72rem', fontWeight:500, letterSpacing:'.12em', textTransform:'uppercase', color:'#C9A96A', textDecoration:'none', border:'1px solid rgba(201,169,106,.25)', borderRadius:'3px', padding:'12px 20px', display:'inline-block' }}>
                Contacter Prelia
              </a>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
