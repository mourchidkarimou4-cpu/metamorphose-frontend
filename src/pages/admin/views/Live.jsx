import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';
function LiveAdminView({ api, toast }) {
  const [salles,  setSalles]  = useState([])
  const [loading, setLoading] = useState(true)
  const [form,    setForm]    = useState({ titre:'', description:'', mode:'reunion', mot_de_passe:'' })
  const [creating, setCreating] = useState(false)
  const token = localStorage.getItem('mmorphose_token')

  function load() {
    setLoading(true)
    fetch(`${API_BASE}/api/live/mes-salles/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json())
      .then(d => { setSalles(Array.isArray(d) ? d : []); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  async function creer() {
    if (!form.titre.trim()) { toast('Titre requis', 'error'); return }
    setCreating(true)
    try {
      const res = await fetch(`${API_BASE}/api/live/creer/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        toast('Salle créée ✓', 'success')
        setForm({ titre:'', description:'', mode:'reunion', mot_de_passe:'' })
        load()
      } else toast(data.detail || 'Erreur', 'error')
    } catch { toast('Erreur serveur', 'error') }
    setCreating(false)
  }

  async function terminer(id) {
    if (!confirm('Terminer cette réunion ?')) return
    await fetch(`${API_BASE}/api/live/${id}/terminer/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    toast('Réunion terminée', 'success')
    load()
  }

  const inp = { width:'100%', padding:'10px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'3px', color:'var(--text)', fontFamily:'var(--ff-b)', fontSize:'.82rem', fontWeight:300, outline:'none' }
  const lbl = { fontFamily:'var(--ff-b)', fontSize:'.62rem', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--text-sub)', display:'block', marginBottom:'6px' }

  const MODES = { reunion:'Réunion', webinaire:'Webinaire', live:'Live' }
  const STATUT_COLOR = { attente:'var(--or)', active:'#4CAF50', terminee:'var(--text-sub)' }

  return (
    <div style={{ animation:'fadeUp .5s both' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' }}>
        <div>
          <h2 style={{ fontFamily:'var(--ff-t)', fontSize:'1.6rem', fontWeight:600 }}>Live & Visioconférence</h2>
          <p style={{ fontFamily:'var(--ff-b)', fontSize:'.78rem', color:'var(--text-sub)', marginTop:'4px' }}>Créez et gérez vos salles de réunion</p>
        </div>
      </div>

      {/* Créer une salle */}
      <div style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(201,169,106,.15)', borderRadius:'8px', padding:'24px', marginBottom:'32px' }}>
        <p style={{ fontFamily:'var(--ff-b)', fontSize:'.65rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--or)', marginBottom:'20px' }}>Nouvelle salle</p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={lbl}>Titre *</label>
            <input style={inp} value={form.titre} onChange={e=>setForm(p=>({...p,titre:e.target.value}))} placeholder="Session coaching — Vague Printemps"/>
          </div>
          <div>
            <label style={lbl}>Mode</label>
            <select style={{...inp}} value={form.mode} onChange={e=>setForm(p=>({...p,mode:e.target.value}))}>
              <option value="reunion">Réunion</option>
              <option value="webinaire">Webinaire</option>
              <option value="live">Live</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Mot de passe (optionnel)</label>
            <input style={inp} value={form.mot_de_passe} onChange={e=>setForm(p=>({...p,mot_de_passe:e.target.value}))} placeholder="Laisser vide = public"/>
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={lbl}>Description (optionnelle)</label>
            <input style={inp} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))} placeholder="Brève description de la session"/>
          </div>
        </div>
        <button onClick={creer} disabled={creating}
          style={{ marginTop:'16px', padding:'11px 24px', background:'var(--rose)', border:'none', borderRadius:'4px', color:'#fff', fontFamily:'var(--ff-b)', fontWeight:600, fontSize:'.75rem', letterSpacing:'.12em', textTransform:'uppercase', cursor:'pointer', opacity:creating?.6:1 }}>
          {creating ? 'Création...' : '+ Créer la salle'}
        </button>
      </div>

      {/* Liste des salles */}
      {loading ? (
        <p style={{ color:'var(--text-sub)', fontFamily:'var(--ff-b)' }}>Chargement...</p>
      ) : salles.length === 0 ? (
        <div style={{ padding:'48px', textAlign:'center', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'8px' }}>
          <p style={{ fontFamily:'var(--ff-t)', fontStyle:'italic', fontSize:'1.1rem', color:'rgba(248,245,242,.3)' }}>Aucune salle créée</p>
        </div>
      ) : salles.map(s => (
        <div key={s.id} style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'8px', padding:'20px 24px', marginBottom:'12px', display:'flex', alignItems:'center', gap:'16px', flexWrap:'wrap' }}>
          <div style={{ flex:1, minWidth:'200px' }}>
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'4px' }}>
              <p style={{ fontFamily:'var(--ff-b)', fontWeight:600, fontSize:'.92rem' }}>{s.titre}</p>
              <span style={{ padding:'2px 8px', borderRadius:'100px', background:`${STATUT_COLOR[s.statut]}20`, border:`1px solid ${STATUT_COLOR[s.statut]}40`, fontFamily:'var(--ff-b)', fontSize:'.58rem', color:STATUT_COLOR[s.statut], letterSpacing:'.1em', textTransform:'uppercase' }}>
                {s.statut}
              </span>
            </div>
            <p style={{ fontFamily:'var(--ff-b)', fontSize:'.72rem', color:'var(--text-sub)' }}>
              {MODES[s.mode]} · {s.participants} participant{s.participants!==1?'s':''} · {new Date(s.created_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/meeting/${s.id}`); toast('Lien copié ✓', 'success') }}
              style={{ padding:'8px 14px', background:'rgba(201,169,106,.08)', border:'1px solid rgba(201,169,106,.2)', borderRadius:'4px', color:'var(--or)', fontFamily:'var(--ff-b)', fontSize:'.68rem', cursor:'pointer' }}>
              📋 Copier le lien
            </button>
            <a href={`/meeting/${s.id}`} target="_blank" rel="noreferrer"
              style={{ padding:'8px 14px', background:'rgba(76,175,80,.08)', border:'1px solid rgba(76,175,80,.2)', borderRadius:'4px', color:'#4CAF50', fontFamily:'var(--ff-b)', fontSize:'.68rem', textDecoration:'none', display:'inline-flex', alignItems:'center' }}>
              🎥 Rejoindre
            </a>
            {s.statut !== 'terminee' && (
              <button onClick={() => terminer(s.id)}
                style={{ padding:'8px 14px', background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:'4px', color:'#f87171', fontFamily:'var(--ff-b)', fontSize:'.68rem', cursor:'pointer' }}>
                ⏹ Terminer
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}


export { LiveAdminView };
