import { useState, useEffect } from 'react';
function CommunauteAdminView({ api, toast }) {
  const [cles,    setCles]    = useState([])
  const [loading, setLoading] = useState(true)
  const [email,   setEmail]   = useState("")
  const [generating, setGenerating] = useState(false)
  const token = localStorage.getItem('mmorphose_token')

  function load() {
    setLoading(true)
    fetch(`/api/communaute/admin/cles/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json())
      .then(d => { setCles(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function generer() {
    if (!email.trim()) { toast('Email requis', 'error'); return }
    setGenerating(true)
    try {
      const res = await fetch(`/api/communaute/admin/cles/generer/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })
      const data = await res.json()
      if (res.ok) {
        toast(`Clé générée : ${data.cle}`, 'success')
        setEmail('')
        load()
      } else toast(data.detail || 'Erreur', 'error')
    } catch { toast('Erreur serveur', 'error') }
    setGenerating(false)
  }

  async function toggleCle(id) {
    await fetch(`/api/communaute/admin/cles/${id}/toggle/`, {
      method: 'PATCH', headers: { 'Authorization': `Bearer ${token}` }
    })
    load()
  }

  const inp = { width:'100%', padding:'10px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'3px', color:'var(--text)', fontFamily:'var(--ff-b)', fontSize:'.82rem', fontWeight:300, outline:'none' }

  return (
    <div style={{ animation:'fadeUp .5s both' }}>
      <div style={{ marginBottom:'32px' }}>
        <h2 style={{ fontFamily:'var(--ff-t)', fontSize:'1.6rem', fontWeight:600 }}>Communauté MMO</h2>
        <p style={{ fontFamily:'var(--ff-b)', fontSize:'.78rem', color:'var(--text-sub)', marginTop:'4px' }}>Gestion des clés d'accès</p>
      </div>

      {/* Générer une clé */}
      <div style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(201,169,106,.15)', borderRadius:'8px', padding:'24px', marginBottom:'32px' }}>
        <p style={{ fontFamily:'var(--ff-b)', fontSize:'.65rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--or)', marginBottom:'16px' }}>Générer une clé d'accès</p>
        <div style={{ display:'flex', gap:'12px', flexWrap:'wrap' }}>
          <input style={{...inp, flex:1, minWidth:'240px'}} value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email de la membre" type="email"/>
          <button onClick={generer} disabled={generating}
            style={{ padding:'10px 24px', background:'var(--rose)', border:'none', borderRadius:'4px', color:'#fff', fontFamily:'var(--ff-b)', fontWeight:600, fontSize:'.75rem', letterSpacing:'.12em', textTransform:'uppercase', cursor:'pointer', opacity:generating?.6:1 }}>
            {generating ? 'Génération...' : 'Générer la clé'}
          </button>
        </div>
      </div>

      {/* Liste des clés */}
      {loading ? <p style={{ color:'var(--text-sub)', fontFamily:'var(--ff-b)' }}>Chargement...</p>
      : cles.length === 0 ? (
        <div style={{ padding:'48px', textAlign:'center', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'8px' }}>
          <p style={{ fontFamily:'var(--ff-t)', fontStyle:'italic', color:'rgba(248,245,242,.3)' }}>Aucune clé générée</p>
        </div>
      ) : cles.map(c => (
        <div key={c.id} className="row-item" style={{ flexWrap:'wrap', gap:'12px', marginBottom:'10px' }}>
          <div style={{ flex:1, minWidth:'200px' }}>
            <p style={{ fontFamily:'var(--ff-b)', fontWeight:500, fontSize:'.88rem', marginBottom:'4px' }}>{c.prenom || c.email}</p>
            <p style={{ fontFamily:'var(--ff-b)', fontSize:'.72rem', color:'var(--text-sub)', letterSpacing:'.05em' }}>{c.cle}</p>
            <p style={{ fontFamily:'var(--ff-b)', fontSize:'.65rem', color:'var(--text-sub)', marginTop:'2px' }}>
              Créée le {c.creee_le} {c.utilisee_le ? `· Utilisée le ${c.utilisee_le}` : '· Jamais utilisée'}
            </p>
          </div>
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            <span style={{ padding:'3px 10px', borderRadius:'100px', background:c.is_active?'rgba(76,175,80,.1)':'rgba(239,68,68,.1)', border:`1px solid ${c.is_active?'rgba(76,175,80,.3)':'rgba(239,68,68,.3)'}`, fontFamily:'var(--ff-b)', fontSize:'.6rem', color:c.is_active?'#4CAF50':'#f87171', letterSpacing:'.1em', textTransform:'uppercase' }}>
              {c.is_active ? 'Active' : 'Désactivée'}
            </span>
            <button onClick={()=>{ navigator.clipboard.writeText(c.cle); toast('Clé copiée ✓', 'success') }}
              style={{ padding:'7px 12px', background:'rgba(201,169,106,.08)', border:'1px solid rgba(201,169,106,.2)', borderRadius:'4px', color:'var(--or)', fontFamily:'var(--ff-b)', fontSize:'.65rem', cursor:'pointer' }}>
              Copier
            </button>
            <button onClick={()=>toggleCle(c.id)}
              style={{ padding:'7px 12px', background:c.is_active?'rgba(239,68,68,.08)':'rgba(76,175,80,.08)', border:`1px solid ${c.is_active?'rgba(239,68,68,.2)':'rgba(76,175,80,.2)'}`, borderRadius:'4px', color:c.is_active?'#f87171':'#4CAF50', fontFamily:'var(--ff-b)', fontSize:'.65rem', cursor:'pointer' }}>
              {c.is_active ? 'Désactiver' : 'Réactiver'}
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}


export { CommunauteAdminView };
