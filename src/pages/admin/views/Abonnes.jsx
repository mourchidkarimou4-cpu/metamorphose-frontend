import { useState, useEffect } from 'react';
function AbonnesView({ api, toast }) {
  const [abonnes,  setAbonnes]  = useState([])
  const [loading,  setLoading]  = useState(true)
  const [recherche,setRecherche]= useState('')
  const token = localStorage.getItem('mmorphose_token')

  function apiA(method, path, body=null) {
    const opts = { method, headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'} }
    if (body) opts.body = JSON.stringify(body)
    return fetch(`/api/contenu/newsletter${path}`, opts).then(r => r.status===204?true:r.json())
  }

  function load() {
    setLoading(true)
    // Charger les abonnés newsletter via l'export CSV admin
    fetch(`/api/admin/export/abonnes/`, {
      headers:{'Authorization':`Bearer ${token}`}
    })
    .then(r => r.ok ? r.text() : Promise.reject())
    .then(csv => {
      const lines = csv.split('\n').slice(1).filter(Boolean)
      const data  = lines.map(l => {
        const parts = l.split(',')
        return {
          email:  parts[0]?.replace(/"/g,'').trim(),
          prenom: parts[1]?.replace(/"/g,'').trim(),
          actif:  parts[2]?.replace(/"/g,'').trim() === 'Oui',
          date:   parts[3]?.replace(/"/g,'').trim(),
        }
      }).filter(a => a.email)
      setAbonnes(data)
      setLoading(false)
    })
    .catch(() => { setAbonnes([]); setLoading(false) })
  }

  useEffect(()=>{ load() },[])

  const filtres = abonnes.filter(a =>
    !recherche || a.email?.toLowerCase().includes(recherche.toLowerCase()) ||
    a.prenom?.toLowerCase().includes(recherche.toLowerCase())
  )
  const actifs = abonnes.filter(a => a.actif).length

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600}}>Abonnés Newsletter</h2>
          <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginTop:'4px'}}>
            {actifs} abonné{actifs!==1?'s':''} actif{actifs!==1?'s':''}
          </p>
        </div>
        <a href="/api/admin/export/abonnes/" target="_blank"
          style={{padding:'9px 18px',borderRadius:'3px',background:'rgba(201,169,106,.1)',border:'1px solid rgba(201,169,106,.25)',color:'var(--or)',fontFamily:'var(--ff-b)',fontSize:'.7rem',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',textDecoration:'none'}}>
          Exporter CSV
        </a>
      </div>

      <input placeholder="Rechercher par email ou prénom..."
        value={recherche} onChange={e=>setRecherche(e.target.value)}
        style={{width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',fontWeight:300,outline:'none',marginBottom:'20px'}}
      />

      {loading ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p> :
      filtres.length===0 ? (
        <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
          <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',fontSize:'1.1rem',color:'rgba(248,245,242,.3)'}}>Aucun abonné</p>
        </div>
      ) : filtres.map((a,i) => (
        <div key={i} className="row-item" style={{gap:'12px'}}>
          <div style={{flex:1}}>
            <p style={{fontFamily:'var(--ff-b)',fontWeight:500,fontSize:'.85rem'}}>{a.email}</p>
            {a.prenom && <p style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)',marginTop:'2px'}}>{a.prenom}</p>}
          </div>
          <span className={`badge ${a.actif?'badge-green':'badge-red'}`}>{a.actif?'Actif':'Désabonné'}</span>
          {a.date && <span style={{fontFamily:'var(--ff-b)',fontSize:'.68rem',color:'var(--text-sub)'}}>{a.date?.substring(0,10)}</span>}
        </div>
      ))}
    </div>
  )
}

export { AbonnesView };
