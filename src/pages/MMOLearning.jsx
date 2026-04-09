import { useState, useEffect } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import AuraButton from '../components/AuraButton'
import API_URL from '../config';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@1,300;1,400&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  :root {
    --noir: #0A0A0A; --or: #C9A96A; --or-light: #E8D5A8;
    --rose: #C2185B; --blanc: #F8F5F2;
    --ff-t: 'Playfair Display', Georgia, serif;
    --ff-b: 'Montserrat', sans-serif;
    --ff-a: 'Cormorant Garamond', Georgia, serif;
  }
  body { background: var(--noir); color: var(--blanc); font-family: var(--ff-b); }
  ::-webkit-scrollbar { width: 3px; }
  ::-webkit-scrollbar-thumb { background: var(--or); border-radius: 2px; }
  @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:none; } }
  @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
  .card-cours { transition: all .35s cubic-bezier(.4,0,.2,1); }
  .card-cours:hover { transform: translateY(-6px); border-color: rgba(201,169,106,.4) !important; box-shadow: 0 20px 60px rgba(0,0,0,.4); }
  @media(max-width:768px) {
    .grid-cours { grid-template-columns: 1fr !important; }
    .hero-pad { padding: 100px 20px 60px !important; }
    .main-pad { padding: 40px 20px 60px !important; }
    .filters-row { flex-wrap: wrap !important; }
  }
`

const FORMAT_ICONS  = { texte:'📖', video:'🎬', audio:'🎵', pdf:'📄' }
const FORMAT_LABELS = { texte:'Article', video:'Vidéo', audio:'Audio', pdf:'PDF' }
const NIVEAU_COLORS = { debutant:'#4CAF50', intermediaire:'#C9A96A', avance:'#C2185B' }
const NIVEAU_LABELS = { debutant:'Débutant', intermediaire:'Intermédiaire', avance:'Avancé' }

function NavBar() {
  const user = JSON.parse(localStorage.getItem('mmorphose_user') || 'null')
  return (
    <nav style={{
      position:'fixed', top:0, left:0, right:0, zIndex:100,
      background:'rgba(10,10,10,.95)', backdropFilter:'blur(20px)',
      borderBottom:'1px solid rgba(201,169,106,.12)',
      padding:'0 32px', height:'64px',
      display:'flex', alignItems:'center', justifyContent:'space-between',
    }}>
      <Link to="/" style={{ textDecoration:'none' }}>
        <span style={{ fontFamily:"var(--ff-t)", fontSize:'1rem' }}>
          <span style={{color:'#F8F5F2'}}>Méta'</span>
          <span style={{color:'#C9A96A'}}>Morph'</span>
          <span style={{color:'#C2185B'}}>Ose</span>
        </span>
      </Link>
      <div style={{ display:'flex', alignItems:'center', gap:'24px' }}>
        <Link to="/mmo-learning" style={{
          fontFamily:'var(--ff-b)', fontSize:'.68rem', letterSpacing:'.18em',
          textTransform:'uppercase', color:'var(--or)', textDecoration:'none', fontWeight:600,
        }}>MMO Learning</Link>
        <Link to={user ? '/dashboard' : '/espace-membre'} style={{
          fontFamily:'var(--ff-b)', fontSize:'.68rem', letterSpacing:'.15em',
          textTransform:'uppercase', color:'rgba(248,245,242,.4)', textDecoration:'none',
        }}>{user ? 'Mon espace' : 'Se connecter'}</Link>
      </div>
    </nav>
  )
}

function CarteCours({ cours }) {
  return (
    <Link to={`/mmo-learning/${cours.slug}`} style={{ textDecoration:'none' }}>
      <div className="card-cours" style={{
        background:'rgba(255,255,255,.03)',
        border:'1px solid rgba(255,255,255,.07)',
        borderRadius:'6px', overflow:'hidden',
        height:'100%', display:'flex', flexDirection:'column',
      }}>
        <div style={{
          height:'180px', flexShrink:0, position:'relative',
          background: cours.image
            ? `url(${cours.image}) center/cover`
            : 'linear-gradient(135deg,rgba(201,169,106,.06),rgba(194,24,91,.04))',
        }}>
          {!cours.image && (
            <div style={{
              position:'absolute', inset:0, display:'flex',
              alignItems:'center', justifyContent:'center',
              fontSize:'2.5rem', opacity:.35,
            }}>{FORMAT_ICONS[cours.format]}</div>
          )}
          <div style={{
            position:'absolute', top:'12px', left:'12px',
            background:'rgba(10,10,10,.85)', backdropFilter:'blur(8px)',
            border:'1px solid rgba(255,255,255,.1)', borderRadius:'100px',
            padding:'4px 12px', display:'flex', alignItems:'center', gap:'6px',
            fontFamily:'var(--ff-b)', fontSize:'.58rem', fontWeight:600,
            letterSpacing:'.12em', textTransform:'uppercase', color:'var(--or)',
          }}>{FORMAT_ICONS[cours.format]} {FORMAT_LABELS[cours.format]}</div>
          {cours.en_vedette && (
            <div style={{
              position:'absolute', top:'12px', right:'12px',
              background:'var(--rose)', borderRadius:'100px',
              padding:'4px 10px', fontFamily:'var(--ff-b)',
              fontSize:'.58rem', fontWeight:700, color:'#fff',
            }}>★ Vedette</div>
          )}
        </div>
        <div style={{ padding:'20px', flex:1, display:'flex', flexDirection:'column', gap:'10px' }}>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', alignItems:'center' }}>
            {cours.categorie_nom && (
              <span style={{
                fontFamily:'var(--ff-b)', fontSize:'.58rem', fontWeight:600,
                letterSpacing:'.15em', textTransform:'uppercase',
                color: cours.categorie_couleur || 'var(--or)',
              }}>{cours.categorie_nom}</span>
            )}
            {cours.semaine && (
              <span style={{ fontFamily:'var(--ff-b)', fontSize:'.58rem', color:'rgba(248,245,242,.3)' }}>
                · S{cours.semaine}
              </span>
            )}
          </div>
          <h3 style={{
            fontFamily:'var(--ff-t)', fontSize:'1rem', fontWeight:600,
            lineHeight:1.35, color:'var(--blanc)', flex:1,
          }}>{cours.titre}</h3>
          <p style={{
            fontFamily:'var(--ff-b)', fontWeight:300, fontSize:'.8rem',
            color:'rgba(248,245,242,.5)', lineHeight:1.65,
            display:'-webkit-box', WebkitLineClamp:2,
            WebkitBoxOrient:'vertical', overflow:'hidden',
          }}>{cours.description}</p>
          <div style={{
            display:'flex', justifyContent:'space-between', alignItems:'center',
            paddingTop:'12px', borderTop:'1px solid rgba(255,255,255,.05)',
          }}>
            <span style={{
              fontFamily:'var(--ff-b)', fontSize:'.65rem', fontWeight:600,
              color: NIVEAU_COLORS[cours.niveau] || 'var(--or)',
            }}>● {NIVEAU_LABELS[cours.niveau]}</span>
            {cours.duree && (
              <span style={{ fontFamily:'var(--ff-b)', fontSize:'.65rem', color:'rgba(248,245,242,.3)' }}>
                ⏱ {cours.duree}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  )
}

function ListeCours() {
  const [cours,        setCours]        = useState([])
  const [categories,   setCategories]   = useState([])
  const [loading,      setLoading]      = useState(true)
  const [filtreCateg,  setFiltreCateg]  = useState('')
  const [filtreFormat, setFiltreFormat] = useState('')
  const [filtreSem,    setFiltreSem]    = useState('')
  const [recherche,    setRecherche]    = useState('')

  useEffect(() => {
    Promise.all([
      fetch(`${API_URL}/api/learning/cours/`).then(r => r.json()),
      fetch(`${API_URL}/api/learning/categories/`).then(r => r.json()),
    ]).then(([c, cat]) => {
      setCours(Array.isArray(c) ? c : [])
      setCategories(Array.isArray(cat) ? cat : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  const filtered = cours.filter(c => {
    const q = recherche.toLowerCase()
    return (
      (!filtreCateg  || c.categorie_nom === filtreCateg) &&
      (!filtreFormat || c.format === filtreFormat) &&
      (!filtreSem    || String(c.semaine) === filtreSem) &&
      (!recherche    || c.titre.toLowerCase().includes(q) || c.description.toLowerCase().includes(q))
    )
  })

  const vedettes = filtered.filter(c => c.en_vedette)
  const normaux  = filtered.filter(c => !c.en_vedette)
  const hasFilter = filtreCateg || filtreFormat || filtreSem || recherche

  const selectStyle = {
    padding:'10px 14px', background:'rgba(255,255,255,.04)',
    border:'1px solid rgba(255,255,255,.08)', borderRadius:'3px',
    color:'rgba(248,245,242,.5)', fontFamily:'var(--ff-b)',
    fontSize:'.78rem', outline:'none', cursor:'pointer',
  }

  return (
    <>
      <style>{STYLES}</style>
      <NavBar />

      {/* Hero */}
      <section className="hero-pad" style={{
        padding:'120px 32px 72px', textAlign:'center',
        background:'linear-gradient(180deg,#0f0a06 0%,var(--noir) 100%)',
        position:'relative', overflow:'hidden',
      }}>
        <div style={{
          position:'absolute', inset:0,
          background:'radial-gradient(ellipse 60% 50% at 50% 0%,rgba(201,169,106,.07),transparent)',
          pointerEvents:'none',
        }}/>
        <p style={{
          fontFamily:'var(--ff-b)', fontSize:'.62rem', letterSpacing:'.3em',
          textTransform:'uppercase', color:'var(--or)', marginBottom:'16px',
          animation:'fadeUp .6s both',
        }}>Méta'Morph'Ose · Académie</p>
        <h1 style={{
          fontFamily:'var(--ff-t)', fontSize:'clamp(2rem,5vw,3.5rem)',
          fontWeight:700, lineHeight:1.1, marginBottom:'20px',
          animation:'fadeUp .7s .1s both',
          background:'linear-gradient(135deg,var(--or),var(--or-light),var(--or))',
          backgroundSize:'200% auto',
          WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text',
        }}>MMO Learning</h1>
        <p style={{
          fontFamily:'var(--ff-b)', fontWeight:300, fontSize:'1rem',
          color:'rgba(248,245,242,.55)', maxWidth:'520px', margin:'0 auto',
          lineHeight:1.75, animation:'fadeUp .7s .2s both',
        }}>
          Des cours de coaching gratuits pour votre transformation.
          Confiance en soi, image personnelle, passage à l'action — à votre rythme.
        </p>
        <div style={{
          marginTop:'28px', display:'flex', gap:'12px',
          justifyContent:'center', flexWrap:'wrap', animation:'fadeUp .7s .3s both',
        }}>
          {[
            { label:`${cours.length} cours`, color:'var(--or)' },
            { label:'100% gratuit',          color:'#4CAF50' },
            { label:'4 formats',             color:'var(--rose)' },
          ].map((b,i) => (
            <span key={i} style={{
              fontFamily:'var(--ff-b)', fontSize:'.68rem', fontWeight:600,
              letterSpacing:'.12em', textTransform:'uppercase', color:b.color,
              padding:'6px 16px', border:`1px solid ${b.color}40`, borderRadius:'100px',
            }}>{b.label}</span>
          ))}
        </div>
      </section>

      {/* Filtres */}
      <section style={{
        padding:'20px 32px', borderBottom:'1px solid rgba(255,255,255,.05)',
        background:'rgba(255,255,255,.01)',
      }}>
        <div style={{ maxWidth:'1200px', margin:'0 auto' }}>
          <div className="filters-row" style={{ display:'flex', gap:'10px', alignItems:'center', flexWrap:'wrap' }}>
            <input
              placeholder="Rechercher un cours..."
              value={recherche} onChange={e => setRecherche(e.target.value)}
              style={{
                flex:1, minWidth:'180px', padding:'10px 16px',
                background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)',
                borderRadius:'3px', color:'var(--blanc)',
                fontFamily:'var(--ff-b)', fontSize:'.82rem', fontWeight:300, outline:'none',
              }}
            />
            <select value={filtreCateg} onChange={e => setFiltreCateg(e.target.value)} style={selectStyle}>
              <option value="">Toutes catégories</option>
              {categories.map(c => (
                <option key={c.id} value={c.nom}>{c.icone} {c.nom} ({c.nb_cours})</option>
              ))}
            </select>
            <select value={filtreFormat} onChange={e => setFiltreFormat(e.target.value)} style={selectStyle}>
              <option value="">Tous formats</option>
              {Object.entries(FORMAT_LABELS).map(([k,v]) => (
                <option key={k} value={k}>{FORMAT_ICONS[k]} {v}</option>
              ))}
            </select>
            <select value={filtreSem} onChange={e => setFiltreSem(e.target.value)} style={selectStyle}>
              <option value="">Toutes semaines</option>
              {[1,2,3,4,5,6,7,8].map(s => <option key={s} value={s}>Semaine {s}</option>)}
            </select>
            {hasFilter && (
              <button onClick={() => { setFiltreCateg(''); setFiltreFormat(''); setFiltreSem(''); setRecherche('') }}
                style={{
                  padding:'10px 16px', background:'transparent',
                  border:'1px solid rgba(194,24,91,.3)', borderRadius:'3px',
                  color:'var(--rose)', fontFamily:'var(--ff-b)', fontSize:'.72rem',
                  letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer',
                }}>Effacer</button>
            )}
            <span style={{ fontFamily:'var(--ff-b)', fontSize:'.72rem', color:'rgba(248,245,242,.25)', marginLeft:'auto' }}>
              {filtered.length} cours
            </span>
          </div>
        </div>
      </section>

      {/* Contenu */}
      <main className="main-pad" style={{ maxWidth:'1200px', margin:'0 auto', padding:'48px 32px 80px' }}>
        {loading ? (
          <div style={{ textAlign:'center', padding:'80px' }}>
            <p style={{ fontFamily:'var(--ff-a)', fontStyle:'italic', color:'rgba(248,245,242,.3)', fontSize:'1.1rem' }}>
              Chargement des cours...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{
            textAlign:'center', padding:'80px 24px',
            background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'6px',
          }}>
            <p style={{ fontFamily:'var(--ff-t)', fontSize:'1.5rem', fontStyle:'italic', color:'var(--or)', marginBottom:'12px' }}>
              Aucun cours trouvé
            </p>
            <p style={{ fontFamily:'var(--ff-b)', fontWeight:300, fontSize:'.85rem', color:'rgba(248,245,242,.4)' }}>
              Les premiers cours arrivent bientôt.
            </p>
          </div>
        ) : (
          <>
            {/* Vedettes */}
            {vedettes.length > 0 && !hasFilter && (
              <div style={{ marginBottom:'56px' }}>
                <p style={{
                  fontFamily:'var(--ff-b)', fontSize:'.62rem', letterSpacing:'.28em',
                  textTransform:'uppercase', color:'var(--rose)', marginBottom:'24px',
                }}>★ En vedette</p>
                <div className="grid-cours" style={{
                  display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'20px',
                }}>
                  {vedettes.map(c => <CarteCours key={c.id} cours={c} />)}
                </div>
                <div style={{ height:'1px', background:'linear-gradient(90deg,transparent,rgba(201,169,106,.2),transparent)', margin:'48px 0 0' }}/>
              </div>
            )}

            {/* Par catégorie ou liste filtrée */}
            {!hasFilter && categories.length > 0 ? (
              categories.map(cat => {
                const catCours = normaux.filter(c => c.categorie_nom === cat.nom)
                if (!catCours.length) return null
                return (
                  <div key={cat.id} style={{ marginBottom:'56px' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:'12px', marginBottom:'24px' }}>
                      <span style={{ fontSize:'1.3rem' }}>{cat.icone}</span>
                      <h2 style={{
                        fontFamily:'var(--ff-t)', fontSize:'1.3rem', fontWeight:600,
                        color: cat.couleur || 'var(--or)',
                      }}>{cat.nom}</h2>
                      <span style={{ fontFamily:'var(--ff-b)', fontSize:'.62rem', color:'rgba(248,245,242,.25)' }}>
                        {catCours.length} cours
                      </span>
                    </div>
                    <div className="grid-cours" style={{
                      display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'20px',
                    }}>
                      {catCours.map(c => <CarteCours key={c.id} cours={c} />)}
                    </div>
                  </div>
                )
              })
            ) : (
              <div className="grid-cours" style={{
                display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'20px',
              }}>
                {filtered.map(c => <CarteCours key={c.id} cours={c} />)}
              </div>
            )}
          </>
        )}
      </main>
    </>
  )
}

function DetailCours() {
  const { slug }  = useParams()
  const navigate  = useNavigate()
  const [cours,   setCours]   = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch(`/api/learning/cours/${slug}/`)
      .then(r => { if (!r.ok) throw new Error(); return r.json() })
      .then(data => { setCours(data); setLoading(false) })
      .catch(() => { setLoading(false); navigate('/mmo-learning') })
  }, [slug])

  if (loading) return (
    <>
      <style>{STYLES}</style>
      <NavBar />
      <div style={{ minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center' }}>
        <p style={{ fontFamily:'var(--ff-a)', fontStyle:'italic', color:'rgba(248,245,242,.3)', fontSize:'1.1rem' }}>
          Chargement...
        </p>
      </div>
    </>
  )

  if (!cours) return null

  return (
    <>
      <style>{STYLES}</style>
      <style>{`
        .contenu-cours h2 { font-family:var(--ff-t); font-size:1.4rem; color:var(--or); margin:32px 0 14px; }
        .contenu-cours h3 { font-family:var(--ff-t); font-size:1.1rem; color:var(--blanc); margin:24px 0 10px; }
        .contenu-cours p  { font-family:var(--ff-b); font-weight:300; font-size:.92rem; color:rgba(248,245,242,.72); line-height:1.85; margin-bottom:16px; }
        .contenu-cours ul, .contenu-cours ol { padding-left:24px; margin-bottom:16px; }
        .contenu-cours li { font-family:var(--ff-b); font-weight:300; font-size:.9rem; color:rgba(248,245,242,.7); line-height:1.75; margin-bottom:6px; }
        .contenu-cours blockquote { border-left:3px solid var(--or); padding:12px 20px; margin:24px 0; background:rgba(201,169,106,.05); font-family:var(--ff-a); font-style:italic; font-size:1.05rem; color:rgba(248,245,242,.75); }
        .contenu-cours strong { color:var(--blanc); font-weight:600; }
      `}</style>
      <NavBar />

      <main style={{ maxWidth:'800px', margin:'0 auto', padding:'100px 32px 80px' }}>
        <Link to="/mmo-learning" style={{
          display:'inline-flex', alignItems:'center', gap:'8px',
          fontFamily:'var(--ff-b)', fontSize:'.68rem', letterSpacing:'.15em',
          textTransform:'uppercase', color:'rgba(201,169,106,.5)', textDecoration:'none',
          marginBottom:'40px',
        }}>← Retour aux cours</Link>

        <div style={{ marginBottom:'36px', animation:'fadeUp .6s both' }}>
          <div style={{ display:'flex', gap:'10px', flexWrap:'wrap', marginBottom:'16px', alignItems:'center' }}>
            {cours.categorie && (
              <span style={{
                fontFamily:'var(--ff-b)', fontSize:'.62rem', fontWeight:600,
                letterSpacing:'.18em', textTransform:'uppercase',
                color: cours.categorie.couleur || 'var(--or)',
              }}>{cours.categorie.icone} {cours.categorie.nom}</span>
            )}
            {cours.semaine && (
              <span style={{ fontFamily:'var(--ff-b)', fontSize:'.62rem', color:'rgba(248,245,242,.3)' }}>
                · Semaine {cours.semaine}
              </span>
            )}
            <span style={{
              fontFamily:'var(--ff-b)', fontSize:'.62rem',
              color:'rgba(248,245,242,.45)', letterSpacing:'.1em',
            }}>{FORMAT_ICONS[cours.format]} {FORMAT_LABELS[cours.format]}</span>
          </div>

          <h1 style={{
            fontFamily:'var(--ff-t)', fontSize:'clamp(1.6rem,4vw,2.4rem)',
            fontWeight:700, lineHeight:1.2, marginBottom:'16px',
          }}>{cours.titre}</h1>

          <p style={{
            fontFamily:'var(--ff-b)', fontWeight:300, fontSize:'.95rem',
            color:'rgba(248,245,242,.55)', lineHeight:1.75,
          }}>{cours.description}</p>

          <div style={{ display:'flex', gap:'20px', marginTop:'16px', flexWrap:'wrap' }}>
            <span style={{
              fontFamily:'var(--ff-b)', fontSize:'.68rem', fontWeight:600,
              color: NIVEAU_COLORS[cours.niveau],
            }}>● {NIVEAU_LABELS[cours.niveau]}</span>
            {cours.duree && (
              <span style={{ fontFamily:'var(--ff-b)', fontSize:'.68rem', color:'rgba(248,245,242,.3)' }}>
                ⏱ {cours.duree}
              </span>
            )}
          </div>
        </div>

        {cours.image && (
          <div style={{ borderRadius:'6px', overflow:'hidden', marginBottom:'40px', maxHeight:'360px' }}>
            <img src={cours.image} alt={cours.titre} style={{ width:'100%', height:'360px', objectFit:'cover' }}/>
          </div>
        )}

        <div style={{ height:'1px', background:'linear-gradient(90deg,transparent,rgba(201,169,106,.25),transparent)', marginBottom:'40px' }}/>

        {cours.video_url && (
          <div style={{ marginBottom:'40px' }}>
            <p style={{
              fontFamily:'var(--ff-b)', fontSize:'.62rem', letterSpacing:'.22em',
              textTransform:'uppercase', color:'var(--rose)', marginBottom:'16px',
            }}>🎬 Vidéo</p>
            <div style={{ position:'relative', paddingBottom:'56.25%', borderRadius:'6px', overflow:'hidden', background:'#111' }}>
              <iframe
                src={cours.video_url.replace('watch?v=','embed/')}
                style={{ position:'absolute', inset:0, width:'100%', height:'100%', border:'none' }}
                allowFullScreen title={cours.titre}
              />
            </div>
          </div>
        )}

        {cours.audio_url && (
          <div style={{
            marginBottom:'40px', padding:'24px',
            background:'rgba(194,24,91,.04)', border:'1px solid rgba(194,24,91,.15)', borderRadius:'6px',
          }}>
            <p style={{
              fontFamily:'var(--ff-b)', fontSize:'.62rem', letterSpacing:'.22em',
              textTransform:'uppercase', color:'var(--rose)', marginBottom:'14px',
            }}>🎵 Audio</p>
            <audio controls src={cours.audio_url} style={{ width:'100%' }}/>
          </div>
        )}

        {cours.pdf_url && (
          <div style={{ marginBottom:'40px' }}>
            <p style={{
              fontFamily:'var(--ff-b)', fontSize:'.62rem', letterSpacing:'.22em',
              textTransform:'uppercase', color:'var(--or)', marginBottom:'14px',
            }}>📄 Document PDF</p>
            <a href={cours.pdf_url} target="_blank" rel="noreferrer" style={{
              display:'inline-flex', alignItems:'center', gap:'10px',
              background:'rgba(201,169,106,.08)', border:'1px solid rgba(201,169,106,.3)',
              borderRadius:'4px', padding:'14px 24px', textDecoration:'none',
              fontFamily:'var(--ff-b)', fontWeight:600, fontSize:'.78rem',
              letterSpacing:'.12em', textTransform:'uppercase', color:'var(--or)',
            }}>Télécharger le PDF</a>
          </div>
        )}

        {cours.contenu && (
          <div className="contenu-cours" dangerouslySetInnerHTML={{ __html: cours.contenu }}/>
        )}

        <div style={{
          marginTop:'64px', padding:'28px',
          background:'rgba(201,169,106,.04)', border:'1px solid rgba(201,169,106,.12)',
          borderRadius:'6px', textAlign:'center',
        }}>
          <p style={{ fontFamily:'var(--ff-a)', fontStyle:'italic', fontSize:'1rem', color:'var(--or)', marginBottom:'16px' }}>
            « Votre transformation continue — un cours à la fois. »
          </p>
          <Link to="/mmo-learning" style={{
            fontFamily:'var(--ff-b)', fontSize:'.7rem', fontWeight:600,
            letterSpacing:'.15em', textTransform:'uppercase', color:'var(--or)',
            textDecoration:'none', border:'1px solid rgba(201,169,106,.3)',
            borderRadius:'3px', padding:'10px 24px', display:'inline-block',
          }}>← Voir tous les cours</Link>
        </div>
      </main>
    <AuraButton />
    </>
  )
}

export default function MMOLearning() {
  const { slug } = useParams()
  return slug ? <DetailCours /> : <ListeCours />
}
