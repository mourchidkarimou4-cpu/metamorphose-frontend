import { useState, useEffect } from 'react';
const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';
function EvenementsAdminView({ api, toast, refreshKey = 0 }) {
  const [evts,    setEvts]    = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState({})
  const [uploading, setUploading] = useState(false)
  const token = localStorage.getItem('mmorphose_token')

  function load() {
    setLoading(true)
    fetch(`${API_BASE}/api/evenements/admin/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json())
      .then(d => { setEvts(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  function openModal(item=null) {
    setEditing(item)
    setForm(item || { titre:'', badge:'', badge_color:'#C9A96A', date:'', lieu:'', description:'', bouton:'', lien:'', statut:'a_venir', ordre:0, actif:true })
    setModal(true)
  }
  function closeModal() { setModal(false); setEditing(null); setForm({}) }
  function set(k,v) { setForm(p=>({...p,[k]:v})) }

  async function uploadPhoto(file) {
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', 'metamorphose_unsigned')
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dp7v6vlgs/image/upload', { method:'POST', body:fd })
      const data = await res.json()
      if (data.secure_url) { set('photo', data.secure_url); toast('Photo uploadée ✓', 'success') }
      else toast('Erreur upload', 'error')
    } catch { toast('Erreur upload', 'error') }
    setUploading(false)
  }

  async function sauvegarder() {
    if (!form.titre) { toast('Titre requis', 'error'); return }
    const fd = new FormData()
    Object.entries(form).forEach(([k,v]) => { if (v !== null && v !== undefined) fd.append(k, v) })
    const url = editing ? `${API_BASE}/api/evenements/admin/${editing.id}/` : `${API_BASE}/api/evenements/admin/`
    const method = editing ? 'PATCH' : 'POST'
    try {
      const res = await fetch(url, { method, headers:{ 'Authorization':`Bearer ${token}` }, body:fd })
      if (res.ok) { toast(editing?'Mis à jour ✓':'Créé ✓', 'success'); closeModal(); load() }
      else toast('Erreur', 'error')
    } catch { toast('Erreur serveur', 'error') }
  }

  async function supprimer(id) {
    if (!confirm('Supprimer cet événement ?')) return
    await fetch(`${API_BASE}/api/evenements/admin/${id}/`, {
      method:'DELETE', headers:{ 'Authorization':`Bearer ${token}` }
    })
    toast('Supprimé', 'success'); load()
  }

  const inp = { width:'100%', padding:'10px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'3px', color:'var(--text)', fontFamily:'var(--ff-b)', fontSize:'.82rem', fontWeight:300, outline:'none' }
  const lbl = { fontFamily:'var(--ff-b)', fontSize:'.62rem', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--text-sub)', display:'block', marginBottom:'6px' }

  return (
    <div style={{ animation:'fadeUp .5s both' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' }}>
        <div>
          <h2 style={{ fontFamily:'var(--ff-t)', fontSize:'1.6rem', fontWeight:600 }}>Événements</h2>
          <p style={{ fontFamily:'var(--ff-b)', fontSize:'.78rem', color:'var(--text-sub)', marginTop:'4px' }}>{evts.length} événement{evts.length!==1?'s':''}</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={()=>openModal()}>+ Nouvel événement</button>
      </div>

      {loading ? <p style={{ color:'var(--text-sub)', fontFamily:'var(--ff-b)' }}>Chargement...</p>
      : evts.length === 0 ? (
        <div style={{ padding:'48px', textAlign:'center', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'8px' }}>
          <p style={{ fontFamily:'var(--ff-t)', fontStyle:'italic', color:'rgba(248,245,242,.3)' }}>Aucun événement</p>
        </div>
      ) : evts.map(e => (
        <div key={e.id} className="row-item" style={{ flexWrap:'wrap', gap:'12px', marginBottom:'10px' }}>
          {e.photo && <img src={e.photo} alt={e.titre} style={{ width:'60px', height:'40px', objectFit:'cover', borderRadius:'4px', flexShrink:0 }}/>}
          <div style={{ flex:1, minWidth:'160px' }}>
            <p style={{ fontFamily:'var(--ff-b)', fontWeight:500, fontSize:'.88rem', marginBottom:'4px' }}>{e.titre}</p>
            <p style={{ fontFamily:'var(--ff-b)', fontSize:'.72rem', color:'var(--text-sub)' }}>{e.date} · {e.lieu}</p>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button className="admin-btn admin-btn-secondary" onClick={()=>openModal(e)}>Modifier</button>
            <button className="admin-btn" style={{ background:'rgba(239,68,68,.1)', color:'#f87171', border:'1px solid rgba(239,68,68,.2)' }} onClick={()=>supprimer(e.id)}>Supprimer</button>
          </div>
        </div>
      ))}

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
          onClick={e=>{ if(e.target===e.currentTarget) closeModal() }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', padding:'32px', maxWidth:'560px', width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
            <h3 style={{ fontFamily:'var(--ff-t)', fontSize:'1.3rem', marginBottom:'24px' }}>{editing?'Modifier':'Nouvel événement'}</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div><label style={lbl}>Titre *</label><input style={inp} value={form.titre||''} onChange={e=>set('titre',e.target.value)} placeholder="Titre de l'événement"/></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div><label style={lbl}>Badge</label><input style={inp} value={form.badge||''} onChange={e=>set('badge',e.target.value)} placeholder="100% GRATUIT"/></div>
                <div><label style={lbl}>Couleur badge</label><input style={inp} value={form.badge_color||'#C9A96A'} onChange={e=>set('badge_color',e.target.value)} placeholder="#C9A96A"/></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div><label style={lbl}>Date</label><input style={inp} value={form.date||''} onChange={e=>set('date',e.target.value)} placeholder="Dimanche 26 avril"/></div>
                <div><label style={lbl}>Lieu</label><input style={inp} value={form.lieu||''} onChange={e=>set('lieu',e.target.value)} placeholder="En ligne"/></div>
              </div>
              <div><label style={lbl}>Description</label><textarea style={{...inp, minHeight:'100px', resize:'vertical'}} value={form.description||''} onChange={e=>set('description',e.target.value)}/></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div><label style={lbl}>Texte bouton</label><input style={inp} value={form.bouton||''} onChange={e=>set('bouton',e.target.value)} placeholder="Je m'inscris"/></div>
                <div><label style={lbl}>Lien bouton</label><input style={inp} value={form.lien||''} onChange={e=>set('lien',e.target.value)} placeholder="/masterclass"/></div>
              </div>
              <div>
                <label style={lbl}>Photo / Affiche</label>
                {form.photo && <img src={form.photo} alt="preview" style={{ width:'100%', height:'160px', objectFit:'cover', borderRadius:'4px', marginBottom:'8px' }}/>}
                <label style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'8px 14px', background:'rgba(201,169,106,.08)', border:'1px solid rgba(201,169,106,.2)', borderRadius:'3px', cursor:uploading?'not-allowed':'pointer', fontFamily:'var(--ff-b)', fontSize:'.68rem', color:'var(--or)', letterSpacing:'.1em', textTransform:'uppercase' }}>
                  {uploading ? 'Upload...' : '+ Uploader une photo'}
                  <input type="file" accept="image/*" style={{ display:'none' }} disabled={uploading} onChange={e=>uploadPhoto(e.target.files[0])}/>
                </label>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div><label style={lbl}>Statut</label>
                  <select style={inp} value={form.statut||'a_venir'} onChange={e=>set('statut',e.target.value)}>
                    <option value="a_venir">À venir</option>
                    <option value="en_cours">En cours</option>
                    <option value="termine">Terminé</option>
                  </select>
                </div>
                <div><label style={lbl}>Ordre</label><input style={inp} type="number" value={form.ordre||0} onChange={e=>set('ordre',parseInt(e.target.value)||0)}/></div>
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px', marginTop:'24px' }}>
              <button className="admin-btn admin-btn-primary" onClick={sauvegarder} style={{ flex:1 }}>Enregistrer</button>
              <button className="admin-btn admin-btn-secondary" onClick={closeModal}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function ActualitesAdminView({ api, toast }) {
  const [actus,   setActus]   = useState([])
  const [loading, setLoading] = useState(true)
  const [modal,   setModal]   = useState(false)
  const [editing, setEditing] = useState(null)
  const [form,    setForm]    = useState({})
  const [uploading, setUploading] = useState(false)
  const token = localStorage.getItem('mmorphose_token')

  function load() {
    setLoading(true)
    fetch(`${API_BASE}/api/evenements/actualites/admin/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json())
      .then(d => { setActus(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(() => setLoading(false))
  }
  useEffect(() => { load() }, [])

  function openModal(item=null) {
    setEditing(item)
    setForm(item || { titre:'', categorie:'', date:'', resume:'', bouton:'', lien:'', color:'#C9A96A', ordre:0, actif:true })
    setModal(true)
  }
  function closeModal() { setModal(false); setEditing(null); setForm({}) }
  function set(k,v) { setForm(p=>({...p,[k]:v})) }

  async function uploadPhoto(file) {
    if (!file) return
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', 'metamorphose_unsigned')
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dp7v6vlgs/image/upload', { method:'POST', body:fd })
      const data = await res.json()
      if (data.secure_url) { set('photo', data.secure_url); toast('Photo uploadée ✓', 'success') }
      else toast('Erreur upload', 'error')
    } catch { toast('Erreur upload', 'error') }
    setUploading(false)
  }

  async function sauvegarder() {
    if (!form.titre) { toast('Titre requis', 'error'); return }
    const fd = new FormData()
    Object.entries(form).forEach(([k,v]) => { if (v !== null && v !== undefined) fd.append(k, v) })
    const url = editing ? `/api/evenements/actualites/admin/${editing.id}/` : `/api/evenements/actualites/admin/`
    const method = editing ? 'PATCH' : 'POST'
    try {
      const res = await fetch(url, { method, headers:{ 'Authorization':`Bearer ${token}` }, body:fd })
      if (res.ok) { toast(editing?'Mis à jour ✓':'Créé ✓', 'success'); closeModal(); load() }
      else toast('Erreur', 'error')
    } catch { toast('Erreur serveur', 'error') }
  }

  async function supprimer(id) {
    if (!confirm('Supprimer cette actualité ?')) return
    await fetch(`${API_BASE}/api/evenements/actualites/admin/${id}/`, {
      method:'DELETE', headers:{ 'Authorization':`Bearer ${token}` }
    })
    toast('Supprimé', 'success'); load()
  }

  const inp = { width:'100%', padding:'10px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'3px', color:'var(--text)', fontFamily:'var(--ff-b)', fontSize:'.82rem', fontWeight:300, outline:'none' }
  const lbl = { fontFamily:'var(--ff-b)', fontSize:'.62rem', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--text-sub)', display:'block', marginBottom:'6px' }

  return (
    <div style={{ animation:'fadeUp .5s both' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px' }}>
        <div>
          <h2 style={{ fontFamily:'var(--ff-t)', fontSize:'1.6rem', fontWeight:600 }}>Actualités</h2>
          <p style={{ fontFamily:'var(--ff-b)', fontSize:'.78rem', color:'var(--text-sub)', marginTop:'4px' }}>{actus.length} actualité{actus.length!==1?'s':''}</p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={()=>openModal()}>+ Nouvelle actualité</button>
      </div>

      {loading ? <p style={{ color:'var(--text-sub)', fontFamily:'var(--ff-b)' }}>Chargement...</p>
      : actus.length === 0 ? (
        <div style={{ padding:'48px', textAlign:'center', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.05)', borderRadius:'8px' }}>
          <p style={{ fontFamily:'var(--ff-t)', fontStyle:'italic', color:'rgba(248,245,242,.3)' }}>Aucune actualité</p>
        </div>
      ) : actus.map(a => (
        <div key={a.id} className="row-item" style={{ flexWrap:'wrap', gap:'12px', marginBottom:'10px' }}>
          {a.photo && <img src={a.photo} alt={a.titre} style={{ width:'60px', height:'40px', objectFit:'cover', borderRadius:'4px', flexShrink:0 }}/>}
          <div style={{ flex:1, minWidth:'160px' }}>
            <p style={{ fontFamily:'var(--ff-b)', fontWeight:500, fontSize:'.88rem', marginBottom:'4px' }}>{a.titre}</p>
            <p style={{ fontFamily:'var(--ff-b)', fontSize:'.72rem', color:'var(--text-sub)' }}>{a.categorie} · {a.date}</p>
          </div>
          <div style={{ display:'flex', gap:'8px' }}>
            <button className="admin-btn admin-btn-secondary" onClick={()=>openModal(a)}>Modifier</button>
            <button className="admin-btn" style={{ background:'rgba(239,68,68,.1)', color:'#f87171', border:'1px solid rgba(239,68,68,.2)' }} onClick={()=>supprimer(a.id)}>Supprimer</button>
          </div>
        </div>
      ))}

      {modal && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,.7)', zIndex:500, display:'flex', alignItems:'center', justifyContent:'center', padding:'20px' }}
          onClick={e=>{ if(e.target===e.currentTarget) closeModal() }}>
          <div style={{ background:'var(--surface)', border:'1px solid var(--border)', borderRadius:'8px', padding:'32px', maxWidth:'560px', width:'100%', maxHeight:'90vh', overflowY:'auto' }}>
            <h3 style={{ fontFamily:'var(--ff-t)', fontSize:'1.3rem', marginBottom:'24px' }}>{editing?'Modifier':'Nouvelle actualité'}</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:'14px' }}>
              <div><label style={lbl}>Titre *</label><input style={inp} value={form.titre||''} onChange={e=>set('titre',e.target.value)} placeholder="Titre de l'actualité"/></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div><label style={lbl}>Catégorie</label><input style={inp} value={form.categorie||''} onChange={e=>set('categorie',e.target.value)} placeholder="Formation"/></div>
                <div><label style={lbl}>Date</label><input style={inp} value={form.date||''} onChange={e=>set('date',e.target.value)} placeholder="Avril 2026"/></div>
              </div>
              <div><label style={lbl}>Résumé</label><textarea style={{...inp, minHeight:'100px', resize:'vertical'}} value={form.resume||''} onChange={e=>set('resume',e.target.value)}/></div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div><label style={lbl}>Texte bouton</label><input style={inp} value={form.bouton||''} onChange={e=>set('bouton',e.target.value)} placeholder="Lire l'histoire"/></div>
                <div><label style={lbl}>Lien</label><input style={inp} value={form.lien||''} onChange={e=>set('lien',e.target.value)} placeholder="/evenements"/></div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
                <div><label style={lbl}>Couleur</label><input style={inp} value={form.color||'#C9A96A'} onChange={e=>set('color',e.target.value)} placeholder="#C9A96A"/></div>
                <div><label style={lbl}>Ordre</label><input style={inp} type="number" value={form.ordre||0} onChange={e=>set('ordre',parseInt(e.target.value)||0)}/></div>
              </div>
              <div>
                <label style={lbl}>Photo / Affiche</label>
                {form.photo && <img src={form.photo} alt="preview" style={{ width:'100%', height:'160px', objectFit:'cover', borderRadius:'4px', marginBottom:'8px' }}/>}
                <label style={{ display:'inline-flex', alignItems:'center', gap:'8px', padding:'8px 14px', background:'rgba(201,169,106,.08)', border:'1px solid rgba(201,169,106,.2)', borderRadius:'3px', cursor:uploading?'not-allowed':'pointer', fontFamily:'var(--ff-b)', fontSize:'.68rem', color:'var(--or)', letterSpacing:'.1em', textTransform:'uppercase' }}>
                  {uploading ? 'Upload...' : '+ Uploader une photo'}
                  <input type="file" accept="image/*" style={{ display:'none' }} disabled={uploading} onChange={e=>uploadPhoto(e.target.files[0])}/>
                </label>
              </div>
            </div>
            <div style={{ display:'flex', gap:'10px', marginTop:'24px' }}>
              <button className="admin-btn admin-btn-primary" onClick={sauvegarder} style={{ flex:1 }}>Enregistrer</button>
              <button className="admin-btn admin-btn-secondary" onClick={closeModal}>Annuler</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}


export { EvenementsAdminView, ActualitesAdminView };
