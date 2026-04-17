import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';
function MasterclassAdminView({ api, toast }) {
  const [onglet, setOnglet] = useState('liste')
  const [masterclasses, setMasterclasses] = useState([])
  const [reservations, setReservations] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [form, setForm] = useState({
    titre:'', description:'', date:'', lieu:'', places_max:50,
    est_active:true, gratuite:false, lien_live:'', image:null, image_url:''
  })

  const CLOUD_NAME = 'dp7v6vlgs'
  const UPLOAD_PRESET = 'metamorphose_unsigned'

  useEffect(() => { charger() }, [])

  async function charger() {
    setLoading(true)
    const token = localStorage.getItem('mmorphose_token')
    const res = await fetch(`${API_BASE}/api/masterclass/admin/`, { headers:{ 'Authorization':`Bearer ${token}` } })
    const data = await res.json()
    setMasterclasses(Array.isArray(data) ? data : [])
    setLoading(false)
  }

  async function chargerReservations(id) {
    const token2 = localStorage.getItem('mmorphose_token')
    const res2 = await fetch(`${API_BASE}/api/masterclass/admin/${id}/reservations/`, { headers:{ 'Authorization':`Bearer ${token2}` } })
    const data = await res2.json()
    setReservations(Array.isArray(data) ? data : [])
  }

  function resetForm() {
    setForm({ titre:'', description:'', date:'', lieu:'', places_max:50, est_active:true, gratuite:false, lien_live:'', image:null, image_url:'' })
    setSelected(null)
  }

  function editer(mc) {
    setSelected(mc)
    setForm({
      titre: mc.titre || '',
      description: mc.description || '',
      date: mc.date ? mc.date.slice(0,16) : '',
      lieu: mc.lieu || '',
      places_max: mc.places_max || 50,
      est_active: mc.est_active ?? true,
      gratuite: mc.gratuite ?? false,
      lien_live: mc.lien_live || '',
      image: null,
      image_url: mc.image || ''
    })
    setOnglet('formulaire')
  }

  async function uploadImage(file) {
    setUploading(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', UPLOAD_PRESET)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, { method:'POST', body:fd })
    const data = await res.json()
    setUploading(false)
    return data.secure_url || ''
  }

  async function sauvegarder() {
    if (!form.titre || !form.date) { toast('Titre et date obligatoires', 'error'); return }
    setSaving(true)
    let image_url = form.image_url
    if (form.image) { image_url = await uploadImage(form.image) }
    const payload = { titre:form.titre, description:form.description, date:form.date, lieu:form.lieu, places_max:parseInt(form.places_max)||50, est_active:form.est_active, gratuite:form.gratuite, lien_live:form.lien_live, image:image_url }
    if (selected) {
      const tkn = localStorage.getItem('mmorphose_token')
      await fetch(`${API_BASE}/api/masterclass/admin/${selected.id}/`, { method:'PATCH', headers:{ 'Authorization':`Bearer ${tkn}`, 'Content-Type':'application/json' }, body:JSON.stringify(payload) })
      toast('Masterclass modifiée ✓', 'success')
    } else {
      const tkn2 = localStorage.getItem('mmorphose_token')
      await fetch(`${API_BASE}/api/masterclass/admin/`, { method:'POST', headers:{ 'Authorization':`Bearer ${tkn2}`, 'Content-Type':'application/json' }, body:JSON.stringify(payload) })
      toast('Masterclass créée ✓', 'success')
    }
    setSaving(false)
    resetForm()
    setOnglet('liste')
    charger()
  }

  async function supprimer(id) {
    if (!window.confirm('Supprimer cette masterclass ?')) return
    const tknd = localStorage.getItem('mmorphose_token')
    await fetch(`${API_BASE}/api/masterclass/admin/${id}/`, { method:'DELETE', headers:{ 'Authorization':`Bearer ${tknd}` } })
    toast('Supprimée ✓', 'success')
    charger()
  }

  async function voirReservations(mc) {
    setSelected(mc)
    await chargerReservations(mc.id)
    setOnglet('reservations')
  }

  function exportCSV() {
    if (!reservations.length) { toast('Aucune réservation à exporter', 'error'); return }
    const header = 'Prénom,Nom,Email,Téléphone,Date inscription'
    const rows = reservations.map(r => `${r.prenom},${r.nom},${r.email},${r.telephone||''},${r.created_at?.slice(0,10)||''}`)
    const csv = [header, ...rows].join('\n')
    const blob = new Blob([csv], { type:'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `reservations_${selected?.titre?.replace(/\s+/g,'_') || 'masterclass'}.csv`
    a.click()
    URL.revokeObjectURL(url)
    toast('Export CSV téléchargé ✓', 'success')
  }

  const inp = { width:'100%', padding:'10px 14px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.08)', borderRadius:'3px', color:'var(--text)', fontFamily:'var(--ff-b)', fontSize:'.82rem', fontWeight:300, outline:'none', boxSizing:'border-box' }
  const lbl = { fontFamily:'var(--ff-b)', fontSize:'.62rem', letterSpacing:'.14em', textTransform:'uppercase', color:'var(--text-sub)', display:'block', marginBottom:'6px' }

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'32px', flexWrap:'wrap', gap:'12px'}}>
        <div>
          <h2 style={{fontFamily:'var(--ff-t)', fontSize:'1.6rem', fontWeight:600}}>Masterclasses</h2>
          <p style={{fontFamily:'var(--ff-b)', fontSize:'.78rem', color:'var(--text-sub)', marginTop:'4px'}}>Gérer les masterclasses de Coach Prélia APEDO AHONON</p>
        </div>
        <button onClick={() => { resetForm(); setOnglet('formulaire') }}
          style={{padding:'10px 22px', background:'var(--rose)', border:'none', borderRadius:'3px', color:'#fff', fontFamily:'var(--ff-b)', fontSize:'.72rem', fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', cursor:'pointer'}}>
          + Nouvelle masterclass
        </button>
      </div>

      {/* Onglets */}
      <div style={{display:'flex', gap:'4px', marginBottom:'28px', borderBottom:'1px solid rgba(255,255,255,.06)', paddingBottom:'0'}}>
        {[['liste','Liste'],['formulaire', selected ? 'Modifier':'Créer'],['reservations','Réservations']].map(([id, label]) => (
          <button key={id} onClick={() => setOnglet(id)}
            style={{padding:'9px 20px', background:'none', border:'none', borderBottom: onglet===id ? '2px solid var(--or)' : '2px solid transparent', color: onglet===id ? 'var(--or)' : 'var(--text-sub)', fontFamily:'var(--ff-b)', fontSize:'.68rem', letterSpacing:'.12em', textTransform:'uppercase', cursor:'pointer', fontWeight: onglet===id ? 600 : 400, marginBottom:'-1px', transition:'all .2s'}}>
            {label}
          </button>
        ))}
      </div>

      {/* LISTE */}
      {onglet === 'liste' && (
        <div>
          {loading ? <p style={{color:'var(--text-sub)', fontFamily:'var(--ff-b)'}}>Chargement...</p> : masterclasses.length === 0 ? (
            <p style={{color:'var(--text-sub)', fontFamily:'var(--ff-b)', fontSize:'.82rem'}}>Aucune masterclass pour l'instant.</p>
          ) : (
            <div style={{display:'flex', flexDirection:'column', gap:'12px'}}>
              {masterclasses.map(mc => (
                <div key={mc.id} style={{padding:'20px 24px', background:'rgba(255,255,255,.02)', border:'1px solid rgba(255,255,255,.06)', borderRadius:'6px', display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:'16px'}}>
                  <div style={{flex:1, minWidth:'200px'}}>
                    <div style={{display:'flex', alignItems:'center', gap:'10px', marginBottom:'6px'}}>
                      <p style={{fontFamily:'var(--ff-t)', fontSize:'1rem', fontWeight:600}}>{mc.titre}</p>
                      <span style={{padding:'2px 8px', borderRadius:'100px', background: mc.est_active ? 'rgba(76,175,80,.15)' : 'rgba(255,255,255,.06)', border:`1px solid ${mc.est_active ? 'rgba(76,175,80,.3)' : 'rgba(255,255,255,.1)'}`, fontFamily:'var(--ff-b)', fontSize:'.58rem', color: mc.est_active ? '#4CAF50' : 'var(--text-sub)', letterSpacing:'.1em', textTransform:'uppercase'}}>
                        {mc.est_active ? 'Active' : 'Inactive'}
                      </span>
                      {mc.gratuite && <span style={{padding:'2px 8px', borderRadius:'100px', background:'rgba(201,169,106,.12)', border:'1px solid rgba(201,169,106,.3)', fontFamily:'var(--ff-b)', fontSize:'.58rem', color:'var(--or)', letterSpacing:'.1em', textTransform:'uppercase'}}>Gratuite</span>}
                    </div>
                    <p style={{fontFamily:'var(--ff-b)', fontSize:'.75rem', color:'var(--text-sub)'}}>
                      {mc.date ? new Date(mc.date).toLocaleDateString('fr-FR', {day:'numeric', month:'long', year:'numeric', hour:'2-digit', minute:'2-digit'}) : 'Date non définie'}
                      {mc.lieu ? ` — ${mc.lieu}` : ''}
                    </p>
                    <p style={{fontFamily:'var(--ff-b)', fontSize:'.72rem', color:'rgba(201,169,106,.6)', marginTop:'4px'}}>{mc.places_max} places max</p>
                  </div>
                  <div style={{display:'flex', gap:'8px', flexWrap:'wrap'}}>
                    <button onClick={() => voirReservations(mc)}
                      style={{padding:'7px 16px', background:'rgba(201,169,106,.1)', border:'1px solid rgba(201,169,106,.2)', borderRadius:'3px', color:'var(--or)', fontFamily:'var(--ff-b)', fontSize:'.65rem', letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer'}}>
                      Réservations
                    </button>
                    <button onClick={() => editer(mc)}
                      style={{padding:'7px 16px', background:'rgba(255,255,255,.04)', border:'1px solid rgba(255,255,255,.1)', borderRadius:'3px', color:'var(--text)', fontFamily:'var(--ff-b)', fontSize:'.65rem', letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer'}}>
                      Modifier
                    </button>
                    <button onClick={() => supprimer(mc.id)}
                      style={{padding:'7px 16px', background:'rgba(239,83,80,.08)', border:'1px solid rgba(239,83,80,.2)', borderRadius:'3px', color:'#ef5350', fontFamily:'var(--ff-b)', fontSize:'.65rem', letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer'}}>
                      Supprimer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FORMULAIRE */}
      {onglet === 'formulaire' && (
        <div style={{display:'flex', flexDirection:'column', gap:'18px', maxWidth:'640px'}}>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'16px'}}>
            <div style={{gridColumn:'1/-1'}}>
              <label style={lbl}>Titre *</label>
              <input style={inp} value={form.titre} onChange={e=>setForm(f=>({...f,titre:e.target.value}))} placeholder="Masterclass de Coach Prélia APEDO AHONON"/>
            </div>
            <div style={{gridColumn:'1/-1'}}>
              <label style={lbl}>Description</label>
              <textarea style={{...inp, minHeight:'100px', resize:'vertical'}} value={form.description} onChange={e=>setForm(f=>({...f,description:e.target.value}))} placeholder="Décrivez le contenu et les objectifs..."/>
            </div>
            <div>
              <label style={lbl}>Date et heure *</label>
              <input style={inp} type="datetime-local" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))}/>
            </div>
            <div>
              <label style={lbl}>Lieu</label>
              <input style={inp} value={form.lieu} onChange={e=>setForm(f=>({...f,lieu:e.target.value}))} placeholder="En ligne / Cotonou..."/>
            </div>
            <div>
              <label style={lbl}>Places maximum</label>
              <input style={inp} type="number" min="1" value={form.places_max} onChange={e=>setForm(f=>({...f,places_max:e.target.value}))}/>
            </div>
            <div>
              <label style={lbl}>Lien live (Zoom, ZegoCloud...)</label>
              <input style={inp} value={form.lien_live} onChange={e=>setForm(f=>({...f,lien_live:e.target.value}))} placeholder="https://..."/>
            </div>
            <div style={{display:'flex', flexDirection:'column', gap:'10px'}}>
              <label style={{...lbl, marginBottom:0}}>Statut</label>
              <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', fontFamily:'var(--ff-b)', fontSize:'.78rem', color:'var(--text)'}}>
                <input type="checkbox" checked={form.est_active} onChange={e=>setForm(f=>({...f,est_active:e.target.checked}))} style={{accentColor:'var(--or)'}}/>
                Masterclass active (visible)
              </label>
              <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', fontFamily:'var(--ff-b)', fontSize:'.78rem', color:'var(--text)'}}>
                <input type="checkbox" checked={form.gratuite} onChange={e=>setForm(f=>({...f,gratuite:e.target.checked}))} style={{accentColor:'var(--or)'}}/>
                Gratuite
              </label>
            </div>
            <div>
              <label style={lbl}>Image (optionnel)</label>
              {form.image_url && <img src={form.image_url} alt="" style={{width:'100%', height:'120px', objectFit:'cover', borderRadius:'4px', marginBottom:'8px'}}/>}
              <label style={{display:'block', padding:'10px', background:'rgba(201,169,106,.06)', border:'1px dashed rgba(201,169,106,.3)', borderRadius:'3px', cursor: uploading ? 'not-allowed' : 'pointer', textAlign:'center', fontFamily:'var(--ff-b)', fontSize:'.68rem', color:'var(--or)', letterSpacing:'.1em', textTransform:'uppercase'}}>
                {uploading ? 'Upload en cours...' : form.image_url ? 'Changer l\'image' : 'Choisir une image'}
                <input type="file" accept="image/*" style={{display:'none'}} disabled={uploading} onChange={e=>{ if(e.target.files[0]) setForm(f=>({...f,image:e.target.files[0],image_url:URL.createObjectURL(e.target.files[0])})) }}/>
              </label>
            </div>
          </div>
          <div style={{display:'flex', gap:'10px', marginTop:'8px'}}>
            <button onClick={sauvegarder} disabled={saving || uploading}
              style={{padding:'12px 28px', background:'var(--rose)', border:'none', borderRadius:'3px', color:'#fff', fontFamily:'var(--ff-b)', fontSize:'.75rem', fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', cursor:'pointer', opacity:(saving||uploading)?.6:1}}>
              {saving ? 'Sauvegarde...' : selected ? 'Modifier' : 'Créer'}
            </button>
            <button onClick={() => { resetForm(); setOnglet('liste') }}
              style={{padding:'12px 22px', background:'none', border:'1px solid rgba(255,255,255,.1)', borderRadius:'3px', color:'var(--text-sub)', fontFamily:'var(--ff-b)', fontSize:'.75rem', letterSpacing:'.12em', textTransform:'uppercase', cursor:'pointer'}}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* RESERVATIONS */}
      {onglet === 'reservations' && (
        <div>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px', flexWrap:'wrap', gap:'12px'}}>
            <p style={{fontFamily:'var(--ff-t)', fontSize:'1.1rem', fontWeight:600}}>{selected?.titre} — {reservations.length} réservation{reservations.length !== 1 ? 's' : ''}</p>
            {reservations.length > 0 && (
              <button onClick={exportCSV}
                style={{padding:'8px 18px', background:'rgba(201,169,106,.1)', border:'1px solid rgba(201,169,106,.25)', borderRadius:'3px', color:'var(--or)', fontFamily:'var(--ff-b)', fontSize:'.65rem', letterSpacing:'.1em', textTransform:'uppercase', cursor:'pointer'}}>
                Exporter CSV
              </button>
            )}
          </div>
          {reservations.length === 0 ? (
            <p style={{color:'var(--text-sub)', fontFamily:'var(--ff-b)', fontSize:'.82rem'}}>Aucune réservation pour cette masterclass.</p>
          ) : (
            <div style={{overflowX:'auto'}}>
              <table style={{width:'100%', borderCollapse:'collapse', fontFamily:'var(--ff-b)', fontSize:'.78rem'}}>
                <thead>
                  <tr style={{borderBottom:'1px solid rgba(255,255,255,.08)'}}>
                    {['Prénom','Nom','Email','Téléphone','Date'].map(h => (
                      <th key={h} style={{padding:'10px 14px', textAlign:'left', fontWeight:600, letterSpacing:'.1em', textTransform:'uppercase', fontSize:'.62rem', color:'var(--text-sub)'}}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reservations.map((r,i) => (
                    <tr key={r.id || i} style={{borderBottom:'1px solid rgba(255,255,255,.04)', background: i%2===0 ? 'transparent' : 'rgba(255,255,255,.01)'}}>
                      <td style={{padding:'10px 14px', color:'var(--text)'}}>{r.prenom}</td>
                      <td style={{padding:'10px 14px', color:'var(--text)'}}>{r.nom}</td>
                      <td style={{padding:'10px 14px', color:'var(--or)'}}>{r.email}</td>
                      <td style={{padding:'10px 14px', color:'var(--text-sub)'}}>{r.telephone || '—'}</td>
                      <td style={{padding:'10px 14px', color:'var(--text-sub)'}}>{r.created_at?.slice(0,10) || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}


/* ================================================================
   NOTIFICATIONS VIEW
   ================================================================ */

export { MasterclassAdminView };
