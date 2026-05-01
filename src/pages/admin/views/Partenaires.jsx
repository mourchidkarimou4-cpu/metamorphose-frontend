import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';
function PartenairesView({ api, toast }) {
  const [partenaires, setPartenaires] = useState([])
  const [loading,     setLoading]     = useState(true)
  const [modal,       setModal]       = useState(false)
  const [editing,     setEditing]     = useState(null)
  const [form,        setForm]        = useState({})
  const token = localStorage.getItem('mmorphose_token')

  function apiP(method, path, body=null) {
    const opts = { method, headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'} }
    if (body) opts.body = JSON.stringify(body)
    return fetch(`${API_BASE}/api/admin/partenaires${path}`, opts).then(r => {
      if (r.status === 401) { window.location.href = '/espace-membre'; return null; }
      return r.status === 204 ? true : r.json()
    })
  }

  function load() {
    setLoading(true)
    apiP('GET','/').then(d => { setPartenaires(Array.isArray(d)?d:[]); setLoading(false) }).catch(()=>setLoading(false))
  }
  useEffect(()=>{load()},[])

  const [uploadingLogo, setUploadingLogo] = useState(false)

  async function uploadLogo(file) {
    if (!file) return
    setUploadingLogo(true)
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', 'metamorphose_unsigned')
    try {
      const res = await fetch('https://api.cloudinary.com/v1_1/dp7v6vlgs/image/upload', { method:'POST', body:fd })
      const data = await res.json()
      if (data.secure_url) { set('logo', data.secure_url); toast('Logo uploadé ✓', 'success') }
      else toast('Erreur upload', 'error')
    } catch { toast('Erreur upload', 'error') }
    setUploadingLogo(false)
  }

  function openModal(item=null) {
    setEditing(item)
    setForm(item || {nom:'', logo:'', lien:'', ordre:0, actif:true})
    setModal(true)
  }
  function closeModal() { setModal(false); setEditing(null); setForm({}) }
  function set(k,v) { setForm(p=>({...p,[k]:v})) }

  async function sauvegarder() {
    if (!form.nom) { toast('Le nom est requis','error'); return }
    try {
      const res = editing
        ? await apiP('PATCH', `/${editing.id}/`, form)
        : await apiP('POST', '/', form)
      if (res && !res.detail) {
        toast(editing ? 'Partenaire mis à jour ✓' : 'Partenaire ajouté ✓', 'success')
        closeModal(); load()
      } else toast(res?.detail || 'Erreur', 'error')
    } catch { toast('Erreur serveur', 'error') }
  }

  async function supprimer(id) {
    if (!confirm('Supprimer ce partenaire ?')) return
    await apiP('DELETE', `/${id}/`)
    toast('Supprimé', 'success'); load()
  }

  async function toggleActif(p) {
    await apiP('PATCH', `/${p.id}/`, {...p, actif: !p.actif})
    load()
  }

  const inp = {width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',fontWeight:300,outline:'none'}
  const lbl = {fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-sub)',display:'block',marginBottom:'6px'}

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600}}>Partenaires</h2>
          <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginTop:'4px'}}>
            {partenaires.length} partenaire{partenaires.length!==1?'s':''} · Affichés dans le footer
          </p>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={()=>openModal()}>+ Nouveau partenaire</button>
      </div>

      {loading ? (
        <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p>
      ) : partenaires.length === 0 ? (
        <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
          <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',fontSize:'1.1rem',color:'rgba(248,245,242,.3)',marginBottom:'16px'}}>Aucun partenaire</p>
          <button className="admin-btn admin-btn-primary" onClick={()=>openModal()}>Ajouter le premier partenaire</button>
        </div>
      ) : partenaires.map(p => (
        <div key={p.id} className="row-item" style={{flexWrap:'wrap',gap:'12px'}}>
          {/* Logo */}
          <div style={{width:'60px',height:'40px',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(255,255,255,.04)',borderRadius:'4px',flexShrink:0}}>
            {p.logo
              ? <img src={p.logo} alt={p.nom} style={{maxWidth:'56px',maxHeight:'36px',objectFit:'contain'}}/>
              : <span style={{fontFamily:'var(--ff-b)',fontSize:'.6rem',color:'var(--text-sub)'}}>Logo</span>
            }
          </div>

          {/* Info */}
          <div style={{flex:1,minWidth:'160px'}}>
            <p style={{fontFamily:'var(--ff-b)',fontWeight:500,fontSize:'.88rem',marginBottom:'4px'}}>{p.nom}</p>
            {p.lien && (
              <a href={p.lien} target="_blank" rel="noreferrer" style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'rgba(201,169,106,.5)',textDecoration:'none'}}>
                {p.lien.replace('https://','').replace('http://','').split('/')[0]}
              </a>
            )}
          </div>

          {/* Statut */}
          <span className={`badge ${p.actif?'badge-green':'badge-red'}`}>{p.actif?'Actif':'Inactif'}</span>

          {/* Actions */}
          <div style={{display:'flex',gap:'8px'}}>
            <button className={`admin-btn ${p.actif?'admin-btn-secondary':'admin-btn-success'}`}
              onClick={()=>toggleActif(p)}>
              {p.actif ? 'Désactiver' : 'Activer'}
            </button>
            <button className="admin-btn admin-btn-secondary" onClick={()=>openModal(p)}>Modifier</button>
            <button className="admin-btn admin-btn-danger" onClick={()=>supprimer(p.id)}>Supprimer</button>
          </div>
        </div>
      ))}

      {/* Modal */}
      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&closeModal()}>
          <div className="modal-box" style={{maxWidth:'480px'}}>
            <h3 style={{fontFamily:'var(--ff-t)',fontSize:'1.3rem',marginBottom:'24px'}}>
              {editing ? 'Modifier le partenaire' : 'Nouveau partenaire'}
            </h3>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div><label style={lbl}>Nom *</label>
                <input style={inp} value={form.nom||''} onChange={e=>set('nom',e.target.value)} placeholder="Nom du partenaire"/>
              </div>
              <div>
                <label style={lbl}>Logo du partenaire</label>
                <input style={{...inp, marginBottom:'8px'}} value={form.logo||''} onChange={e=>set('logo',e.target.value)} placeholder="URL du logo (https://...)"/>
                <label style={{display:'inline-flex',alignItems:'center',gap:'8px',padding:'8px 14px',background:'rgba(201,169,106,.08)',border:'1px solid rgba(201,169,106,.2)',borderRadius:'3px',cursor:uploadingLogo?'not-allowed':'pointer',fontFamily:'var(--ff-b)',fontSize:'.68rem',color:'var(--or)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:'8px'}}>
                  {uploadingLogo ? 'Upload en cours...' : '+ Uploader un fichier'}
                  <input type="file" accept="image/*" style={{display:'none'}} disabled={uploadingLogo} onChange={e=>uploadLogo(e.target.files[0])}/>
                </label>
                <p style={{fontFamily:'var(--ff-b)',fontSize:'.6rem',color:'var(--text-sub)',marginBottom:'6px'}}>Saisissez une URL ou uploadez directement un fichier image</p>
                {form.logo && (
                  <div style={{padding:'8px',background:'rgba(255,255,255,.04)',borderRadius:'4px',display:'flex',alignItems:'center',justifyContent:'center',height:'60px'}}>
                    <img src={form.logo} alt="preview" style={{maxHeight:'52px',maxWidth:'100%',objectFit:'contain'}}/>
                  </div>
                )}
              </div>
              <div><label style={lbl}>Lien vers leur site</label>
                <input style={inp} value={form.lien||''} onChange={e=>set('lien',e.target.value)} placeholder="https://leur-site.com"/>
              </div>
              <div><label style={lbl}>Ordre d'affichage</label>
                <input style={inp} type="number" value={form.ordre||0} onChange={e=>set('ordre',parseInt(e.target.value)||0)}/>
              </div>
              <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer'}}>
                <input type="checkbox" checked={!!form.actif} onChange={e=>set('actif',e.target.checked)}/>
                <span style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)'}}>Actif (visible dans le footer)</span>
              </label>
              <div style={{display:'flex',gap:'10px',justifyContent:'flex-end',marginTop:'8px'}}>
                <button className="admin-btn admin-btn-secondary" onClick={closeModal}>Annuler</button>
                <button className="admin-btn admin-btn-primary" onClick={sauvegarder}>
                  {editing ? 'Enregistrer' : 'Ajouter'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================================================================
   TICKETS VIEW — Gestion événements et tickets
   ================================================================ */

export { PartenairesView };
