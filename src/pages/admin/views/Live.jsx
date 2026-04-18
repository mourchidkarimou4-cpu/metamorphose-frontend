import { useState, useEffect } from 'react';
const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';

function LiveAdminView({ api, toast, refreshKey = 0 }) {
  const [salles,   setSalles]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [creating, setCreating] = useState(false)
  const [editing,  setEditing]  = useState(null) // id de la salle en cours d'édition lien zoom
  const [form, setForm] = useState({
    titre: '', description: '', mode: 'live', mot_de_passe: '', lien_zoom: ''
  })
  const token = localStorage.getItem('mmorphose_token')

  const inp = { width:'100%', padding:'10px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'3px', color:'var(--text)', fontFamily:'var(--ff-b)', fontSize:'.82rem', fontWeight:300, outline:'none' }
  const lbl = { fontFamily:'var(--ff-b)', fontSize:'.62rem', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--text-sub)', display:'block', marginBottom:'6px' }
  const STATUT_COLOR = { attente:'var(--or)', active:'#4CAF50', terminee:'var(--text-sub)' }

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
    if (!form.lien_zoom.trim()) { toast('Le lien Zoom est requis', 'error'); return }
    setCreating(true)
    try {
      const res = await fetch(`${API_BASE}/api/live/creer/`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      })
      const data = await res.json()
      if (res.ok) {
        toast('Session créée ✓', 'success')
        setForm({ titre:'', description:'', mode:'live', mot_de_passe:'', lien_zoom:'' })
        load()
      } else toast(data.detail || 'Erreur', 'error')
    } catch { toast('Erreur serveur', 'error') }
    setCreating(false)
  }

  async function mettreAJourLien(id, lien) {
    try {
      const res = await fetch(`${API_BASE}/api/live/${id}/lien-zoom/`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ lien_zoom: lien })
      })
      if (res.ok) {
        toast('Lien mis à jour ✓', 'success')
        setEditing(null)
        load()
      } else toast('Erreur', 'error')
    } catch { toast('Erreur serveur', 'error') }
  }

  async function terminer(id) {
    if (!confirm('Terminer cette session ?')) return
    await fetch(`${API_BASE}/api/live/${id}/terminer/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    })
    toast('Session terminée', 'success')
    load()
  }

  return (
    <div style={{ animation:'fadeUp .5s both' }}>
      <div style={{ marginBottom:'32px' }}>
        <h2 style={{ fontFamily:'var(--ff-t)', fontSize:'1.6rem', fontWeight:600 }}>Live & Visioconférence</h2>
        <p style={{ fontFamily:'var(--ff-b)', fontSize:'.78rem', color:'var(--text-sub)', marginTop:'4px' }}>
          Créez une session et collez le lien Zoom — les clientes rejoignent en un clic
        </p>
      </div>

      {/* Créer une session */}
      <div style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(201,169,106,.15)', borderRadius:'8px', padding:'24px', marginBottom:'32px' }}>
        <p style={{ fontFamily:'var(--ff-b)', fontSize:'.65rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--or)', marginBottom:'20px' }}>
          Nouvelle session
        </p>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'14px' }}>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={lbl}>Titre *</label>
            <input style={inp} value={form.titre}
              onChange={e=>setForm(p=>({...p,titre:e.target.value}))}
              placeholder="Ex : Masterclass Semaine 3 — Confiance en soi"/>
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={lbl}>Lien Zoom *</label>
            <input style={{...inp, borderColor:'rgba(201,169,106,.3)'}} value={form.lien_zoom}
              onChange={e=>setForm(p=>({...p,lien_zoom:e.target.value}))}
              placeholder="https://zoom.us/j/xxxxxxxxxx?pwd=..."/>
          </div>
          <div>
            <label style={lbl}>Mode</label>
            <select style={{...inp}} value={form.mode} onChange={e=>setForm(p=>({...p,mode:e.target.value}))}>
              <option value="live">Live</option>
              <option value="webinaire">Webinaire</option>
              <option value="reunion">Réunion</option>
            </select>
          </div>
          <div>
            <label style={lbl}>Mot de passe accès (optionnel)</label>
            <input style={inp} value={form.mot_de_passe}
              onChange={e=>setForm(p=>({...p,mot_de_passe:e.target.value}))}
              placeholder="Laisser vide = accès libre"/>
          </div>
          <div style={{ gridColumn:'1/-1' }}>
            <label style={lbl}>Description (optionnelle)</label>
            <input style={inp} value={form.description}
              onChange={e=>setForm(p=>({...p,description:e.target.value}))}
              placeholder="Brève description de la session"/>
          </div>
        </div>
        <button onClick={creer} disabled={creating}
          style={{ marginTop:'16px', padding:'11px 24px', background:'var(--rose)', border:'none', borderRadius:'4px', color:'#fff', fontFamily:'var(--ff-b)', fontWeight:600, fontSize:'.75rem', letterSpacing:'.12em', textTransform:'uppercase', cursor:'pointer', opacity:creating?0.6:1 }}>
          {creating ? 'Création...' : '+ Créer la session'}
        </button>
      </div>

      {/* Liste des sessions */}
      {loading ? (
        <p style={{ color:'var(--text-sub)', fontFamily:'var(--ff-b)' }}>Chargement...</p>
      ) : salles.length === 0 ? (
        <div style={{ padding:'48px', textAlign:'center', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'8px' }}>
          <p style={{ fontFamily:'var(--ff-t)', fontStyle:'italic', fontSize:'1.1rem', color:'rgba(248,245,242,.3)' }}>Aucune session créée</p>
        </div>
      ) : salles.map(s => (
        <div key={s.id} style={{ background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'8px', padding:'20px 24px', marginBottom:'12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'8px' }}>
            <p style={{ fontFamily:'var(--ff-b)', fontWeight:600, fontSize:'.92rem' }}>{s.titre}</p>
            <span style={{ padding:'2px 8px', borderRadius:'100px', background:`${STATUT_COLOR[s.statut]}20`, border:`1px solid ${STATUT_COLOR[s.statut]}40`, fontFamily:'var(--ff-b)', fontSize:'.58rem', color:STATUT_COLOR[s.statut], letterSpacing:'.1em', textTransform:'uppercase' }}>
              {s.statut}
            </span>
          </div>

          {/* Lien Zoom */}
          {editing === s.id ? (
            <div style={{ display:'flex', gap:'8px', marginBottom:'12px' }}>
              <input
                defaultValue={s.lien_zoom || ''}
                id={`zoom-${s.id}`}
                style={{...inp, flex:1}}
                placeholder="https://zoom.us/j/..."
              />
              <button onClick={() => mettreAJourLien(s.id, document.getElementById(`zoom-${s.id}`).value)}
                style={{ padding:'8px 14px', background:'var(--rose)', border:'none', borderRadius:'4px', color:'#fff', fontFamily:'var(--ff-b)', fontSize:'.68rem', cursor:'pointer' }}>
                Sauver
              </button>
              <button onClick={() => setEditing(null)}
                style={{ padding:'8px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'4px', color:'var(--text-sub)', fontFamily:'var(--ff-b)', fontSize:'.68rem', cursor:'pointer' }}>
                Annuler
              </button>
            </div>
          ) : (
            <div style={{ marginBottom:'12px', fontSize:'.75rem', fontFamily:'var(--ff-b)', color:'var(--text-sub)' }}>
              {s.lien_zoom ? (
                <span>Zoom : <a href={s.lien_zoom} target="_blank" rel="noreferrer" style={{ color:'var(--or)' }}>{s.lien_zoom.substring(0, 50)}...</a></span>
              ) : (
                <span style={{ color:'#f87171' }}>Aucun lien Zoom défini</span>
              )}
            </div>
          )}

          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            <button onClick={() => setEditing(s.id)}
              style={{ padding:'8px 14px', background:'rgba(201,169,106,.08)', border:'1px solid rgba(201,169,106,.2)', borderRadius:'4px', color:'var(--or)', fontFamily:'var(--ff-b)', fontSize:'.68rem', cursor:'pointer' }}>
              Modifier le lien Zoom
            </button>
            <button onClick={() => { navigator.clipboard.writeText(`${window.location.origin}/meeting/${s.id}`); toast('Lien copié ✓', 'success') }}
              style={{ padding:'8px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'4px', color:'var(--text)', fontFamily:'var(--ff-b)', fontSize:'.68rem', cursor:'pointer' }}>
              Copier le lien d'invitation
            </button>
            {s.lien_zoom && (
              <a href={s.lien_zoom} target="_blank" rel="noreferrer"
                style={{ padding:'8px 14px', background:'rgba(76,175,80,.08)', border:'1px solid rgba(76,175,80,.2)', borderRadius:'4px', color:'#4CAF50', fontFamily:'var(--ff-b)', fontSize:'.68rem', textDecoration:'none' }}>
                Rejoindre Zoom
              </a>
            )}
            {s.statut !== 'terminee' && (
              <button onClick={() => terminer(s.id)}
                style={{ padding:'8px 14px', background:'rgba(239,68,68,.08)', border:'1px solid rgba(239,68,68,.2)', borderRadius:'4px', color:'#f87171', fontFamily:'var(--ff-b)', fontSize:'.68rem', cursor:'pointer' }}>
                Terminer
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

export { LiveAdminView };
