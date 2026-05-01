import { useState, useEffect } from 'react';
import { learningAPI } from '../../../services/api';

const API_BASE = import.meta.env.VITE_API_URL || '';
function LearningView({ api, toast }) {
  const [onglet,     setOnglet]     = useState('cours')
  const [cours,      setCours]      = useState([])
  const [categories, setCategories] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(null)
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState({})
  const token = localStorage.getItem('mmorphose_token')
  const [uploadingField, setUploadingField] = useState({})
  const CLOUD = 'dp7v6vlgs'
  const PRESET = 'metamorphose_unsigned'

  async function uploadCloud(file, fieldKey, resourceType='auto') {
    setUploadingField(p=>({...p,[fieldKey]:true}))
    const fd = new FormData()
    fd.append('file', file)
    fd.append('upload_preset', PRESET)
    const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD}/${resourceType}/upload`, {method:'POST',body:fd})
    const data = await res.json()
    setUploadingField(p=>({...p,[fieldKey]:false}))
    return data.secure_url || ''
  }

  function apiL(method, path, body=null) {
    const opts = { method, headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'} }
    if (body) opts.body = JSON.stringify(body)
    return fetch(`${API_BASE}/api/learning/admin${path}`, opts).then(r => {
      if (r.status === 401) { window.location.href = '/espace-membre'; return null; }
      return r.status === 204 ? true : r.json()
    })
  }

  function load() {
    setLoading(true)
    Promise.all([apiL('GET','/cours/'), apiL('GET','/categories/')]).then(([c,cat]) => {
      setCours(Array.isArray(c)?c:[]); setCategories(Array.isArray(cat)?cat:[]); setLoading(false)
    }).catch(()=>setLoading(false))
  }
  useEffect(()=>{load()},[])

  function slugify(s) {
    return s.toLowerCase()
      .replace(/[àâä]/g,'a').replace(/[éèêë]/g,'e').replace(/[îï]/g,'i')
      .replace(/[ôö]/g,'o').replace(/[ùûü]/g,'u').replace(/ç/g,'c')
      .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
  }

  function openModal(type, item=null) {
    setModal(type); setEditing(item)
    setForm(type==='cours'
      ? (item || {titre:'',slug:'',description:'',format:'texte',contenu:'',video_url:'',audio_url:'',pdf_url:'',duree:'',niveau:'debutant',image:'',semaine:'',actif:true,en_vedette:false,ordre:0,categorie:null,prix:0,lien_achat:''})
      : (item || {nom:'',slug:'',icone:'✦',couleur:'#C9A96A',ordre:0}))
  }
  function closeModal() { setModal(null); setEditing(null); setForm({}) }
  function set(k,v) { setForm(p=>{ const n={...p,[k]:v}; if(k==='titre'&&!editing) n.slug=slugify(v); if(k==='nom'&&!editing) n.slug=slugify(v); return n }) }

  async function sauvegarder() {
    const payload = {...form}
    if (!payload.semaine) delete payload.semaine
    try {
      const res = editing
        ? await apiL('PATCH', modal==='cours'?`/cours/${editing.id}/`:`/categories/${editing.id}/`, payload)
        : await apiL('POST',  modal==='cours'?'/cours/':'/categories/', payload)
      if (res && !res.detail) { toast(editing?'Mis à jour ✓':'Créé ✓','success'); closeModal(); load() }
      else toast(res?.detail||'Erreur','error')
    } catch { toast('Erreur serveur','error') }
  }

  async function supprimer(type, id) {
    if (!confirm('Supprimer ?')) return
    await apiL('DELETE', type==='cours'?`/cours/${id}/`:`/categories/${id}/`)
    toast('Supprimé','success'); load()
  }

  const inp = { width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',fontWeight:300,outline:'none' }
  const lbl = { fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-sub)',display:'block',marginBottom:'6px' }
  const FMTS = {texte:'📖 Article',video:'🎬 Vidéo',audio:'🎵 Audio',pdf:'📄 PDF'}
  const NVLS = {debutant:'Débutant',intermediaire:'Intermédiaire',avance:'Avancé'}

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600}}>MMO Learning</h2>
          <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginTop:'4px'}}>{cours.length} cours · {categories.length} catégories</p>
        </div>
        <div style={{display:'flex',gap:'10px'}}>
          <button className="admin-btn admin-btn-secondary" onClick={()=>openModal('categorie')}>+ Catégorie</button>
          <button className="admin-btn admin-btn-primary"   onClick={()=>openModal('cours')}>+ Nouveau cours</button>
        </div>
      </div>

      <div style={{display:'flex',gap:'4px',marginBottom:'24px',background:'rgba(255,255,255,.03)',borderRadius:'4px',padding:'4px',width:'fit-content'}}>
        {[['cours',`Cours (${cours.length})`],['categories',`Catégories (${categories.length})`]].map(([id,label])=>(
          <button key={id} onClick={()=>setOnglet(id)} style={{padding:'8px 18px',borderRadius:'3px',border:'none',cursor:'pointer',fontFamily:'var(--ff-b)',fontSize:'.68rem',fontWeight:500,letterSpacing:'.1em',textTransform:'uppercase',background:onglet===id?'var(--rose)':'transparent',color:onglet===id?'#fff':'var(--text-sub)',transition:'all .25s'}}>{label}</button>
        ))}
      </div>

      {onglet==='cours' && (loading
        ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p>
        : cours.length===0
          ? <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
              <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',fontSize:'1.1rem',color:'rgba(248,245,242,.3)',marginBottom:'16px'}}>Aucun cours pour l'instant</p>
              <button className="admin-btn admin-btn-primary" onClick={()=>openModal('cours')}>Créer le premier cours</button>
            </div>
          : cours.map(c=>(
            <div key={c.id} className="row-item" style={{flexWrap:'wrap',gap:'12px'}}>
              <div style={{flex:1,minWidth:'200px'}}>
                <p style={{fontFamily:'var(--ff-b)',fontWeight:500,fontSize:'.88rem',marginBottom:'4px'}}>{c.titre}</p>
                <div style={{display:'flex',gap:'8px',flexWrap:'wrap'}}>
                  <span className="badge badge-or">{FMTS[c.format]}</span>
                  {c.semaine && <span className="badge badge-or">S{c.semaine}</span>}
                  <span className={`badge ${c.actif?'badge-green':'badge-red'}`}>{c.actif?'Actif':'Inactif'}</span>
                  {c.en_vedette && <span className="badge badge-rose">★ Vedette</span>}
                  {c.categorie_nom && <span className="badge badge-or">{c.categorie_nom}</span>}
                </div>
              </div>
              {c.duree && <span style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)'}}>⏱ {c.duree}</span>}
              <div style={{display:'flex',gap:'8px'}}>
                <button className="admin-btn admin-btn-secondary" onClick={()=>openModal('cours',c)}>Modifier</button>
                <button className="admin-btn admin-btn-danger"    onClick={()=>supprimer('cours',c.id)}>Supprimer</button>
              </div>
            </div>
          ))
      )}

      {onglet==='categories' && (categories.length===0
        ? <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
            <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',fontSize:'1.1rem',color:'rgba(248,245,242,.3)',marginBottom:'16px'}}>Aucune catégorie</p>
            <button className="admin-btn admin-btn-primary" onClick={()=>openModal('categorie')}>Créer une catégorie</button>
          </div>
        : categories.map(cat=>(
          <div key={cat.id} className="row-item">
            <span style={{fontSize:'1.4rem'}}>{cat.icone}</span>
            <div style={{flex:1}}>
              <p style={{fontFamily:'var(--ff-b)',fontWeight:500,fontSize:'.88rem'}}>{cat.nom}</p>
              <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.72rem',color:'var(--text-sub)'}}>{cat.nb_cours} cours · /{cat.slug}</p>
            </div>
            <div style={{width:'12px',height:'12px',borderRadius:'50%',background:cat.couleur}}/>
            <div style={{display:'flex',gap:'8px'}}>
              <button className="admin-btn admin-btn-secondary" onClick={()=>openModal('categorie',cat)}>Modifier</button>
              <button className="admin-btn admin-btn-danger"    onClick={()=>supprimer('categorie',cat.id)}>Supprimer</button>
            </div>
          </div>
        ))
      )}

      {modal==='cours' && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&closeModal()}>
          <div className="modal-box" style={{maxWidth:'640px'}}>
            <h3 style={{fontFamily:'var(--ff-t)',fontSize:'1.3rem',marginBottom:'24px'}}>{editing?'Modifier':'Nouveau cours'}</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Format *</label>
                  <select value={form.format||'texte'} onChange={e=>set('format',e.target.value)} style={inp}>
                    {Object.entries(FMTS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select></div>
                <div><label style={lbl}>Niveau</label>
                  <select value={form.niveau||'debutant'} onChange={e=>set('niveau',e.target.value)} style={inp}>
                    {Object.entries(NVLS).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                  </select></div>
              </div>
              <div><label style={lbl}>Titre *</label><input style={inp} value={form.titre||''} onChange={e=>set('titre',e.target.value)} placeholder="Titre du cours"/></div>
              <div><label style={lbl}>Slug</label><input style={inp} value={form.slug||''} onChange={e=>set('slug',e.target.value)} placeholder="mon-cours"/></div>
              <div><label style={lbl}>Description *</label><textarea style={{...inp,minHeight:'80px',resize:'vertical'}} value={form.description||''} onChange={e=>set('description',e.target.value)} placeholder="Description courte affichée sur la carte"/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Catégorie</label>
                  <select value={form.categorie||''} onChange={e=>set('categorie',e.target.value||null)} style={inp}>
                    <option value="">Sans catégorie</option>
                    {categories.map(c=><option key={c.id} value={c.id}>{c.icone} {c.nom}</option>)}
                  </select></div>
                <div><label style={lbl}>Semaine (1-8)</label><input style={inp} type="number" min="1" max="8" value={form.semaine||''} onChange={e=>set('semaine',e.target.value)} placeholder="ex: 3"/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Durée</label><input style={inp} value={form.duree||''} onChange={e=>set('duree',e.target.value)} placeholder="ex: 15 min"/></div>
                <div><label style={lbl}>Ordre</label><input style={inp} type="number" value={form.ordre||0} onChange={e=>set('ordre',parseInt(e.target.value)||0)}/></div>
              </div>
              <div>
                <label style={lbl}>Image couverture</label>
                {form.image && <img src={form.image} alt="" style={{width:'100%',height:'120px',objectFit:'cover',borderRadius:'4px',marginBottom:'8px'}}/>}
                <label style={{display:'block',padding:'10px',background:'rgba(201,169,106,.06)',border:'1px dashed rgba(201,169,106,.3)',borderRadius:'3px',cursor:uploadingField.image?'not-allowed':'pointer',textAlign:'center',fontFamily:'var(--ff-b)',fontSize:'.68rem',color:'var(--or)',letterSpacing:'.1em',textTransform:'uppercase'}}>
                  {uploadingField.image ? 'Upload...' : form.image ? "Changer l'image" : 'Choisir une image'}
                  <input type="file" accept="image/*" style={{display:'none'}} disabled={uploadingField.image} onChange={async e=>{if(e.target.files[0]){const url=await uploadCloud(e.target.files[0],'image','image');set('image',url)}}}/>
                </label>
                {form.image && <input style={{...inp,marginTop:'6px',fontSize:'.7rem'}} value={form.image} onChange={e=>set('image',e.target.value)} placeholder="ou coller une URL"/>}
              </div>
              {(form.format==='video'||form.format==='texte') && <div>
                <label style={lbl}>Vidéo (upload ou URL YouTube)</label>
                <label style={{display:'block',padding:'10px',background:'rgba(194,24,91,.06)',border:'1px dashed rgba(194,24,91,.3)',borderRadius:'3px',cursor:uploadingField.video?'not-allowed':'pointer',textAlign:'center',fontFamily:'var(--ff-b)',fontSize:'.68rem',color:'var(--rose)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:'6px'}}>
                  {uploadingField.video ? 'Upload en cours...' : form.video_url ? 'Changer la vidéo' : 'Uploader une vidéo'}
                  <input type="file" accept="video/*" style={{display:'none'}} disabled={uploadingField.video} onChange={async e=>{if(e.target.files[0]){const url=await uploadCloud(e.target.files[0],'video','video');set('video_url',url)}}}/>
                </label>
                <input style={inp} value={form.video_url||''} onChange={e=>set('video_url',e.target.value)} placeholder="ou coller un lien YouTube/Vimeo..."/>
              </div>}
              {form.format==='audio' && <div>
                <label style={lbl}>Fichier Audio (MP3)</label>
                {form.audio_url && <audio controls src={form.audio_url} style={{width:'100%',marginBottom:'8px'}}/>}
                <label style={{display:'block',padding:'10px',background:'rgba(201,169,106,.06)',border:'1px dashed rgba(201,169,106,.3)',borderRadius:'3px',cursor:uploadingField.audio?'not-allowed':'pointer',textAlign:'center',fontFamily:'var(--ff-b)',fontSize:'.68rem',color:'var(--or)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:'6px'}}>
                  {uploadingField.audio ? 'Upload en cours...' : form.audio_url ? "Changer l'audio" : 'Uploader un fichier audio'}
                  <input type="file" accept="audio/*" style={{display:'none'}} disabled={uploadingField.audio} onChange={async e=>{if(e.target.files[0]){const url=await uploadCloud(e.target.files[0],'audio','video');set('audio_url',url)}}}/>
                </label>
                <input style={inp} value={form.audio_url||''} onChange={e=>set('audio_url',e.target.value)} placeholder="ou coller une URL audio"/>
              </div>}
              {form.format==='pdf' && <div>
                <label style={lbl}>Fichier PDF</label>
                {form.pdf_url && <a href={form.pdf_url} target="_blank" rel="noreferrer" style={{display:'block',fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--or)',marginBottom:'8px'}}>Voir le PDF actuel</a>}
                <label style={{display:'block',padding:'10px',background:'rgba(201,169,106,.06)',border:'1px dashed rgba(201,169,106,.3)',borderRadius:'3px',cursor:uploadingField.pdf?'not-allowed':'pointer',textAlign:'center',fontFamily:'var(--ff-b)',fontSize:'.68rem',color:'var(--or)',letterSpacing:'.1em',textTransform:'uppercase',marginBottom:'6px'}}>
                  {uploadingField.pdf ? 'Upload en cours...' : form.pdf_url ? 'Changer le PDF' : 'Uploader un PDF'}
                  <input type="file" accept=".pdf" style={{display:'none'}} disabled={uploadingField.pdf} onChange={async e=>{if(e.target.files[0]){const url=await uploadCloud(e.target.files[0],'pdf','raw');set('pdf_url',url)}}}/>
                </label>
                <input style={inp} value={form.pdf_url||''} onChange={e=>set('pdf_url',e.target.value)} placeholder="ou coller une URL PDF"/>
              </div>}
              <div><label style={lbl}>Contenu texte (HTML accepté)</label><textarea style={{...inp,minHeight:'140px',resize:'vertical',fontFamily:'monospace',fontSize:'.78rem'}} value={form.contenu||''} onChange={e=>set('contenu',e.target.value)} placeholder="<p>Votre contenu...</p>"/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Prix (FCFA) — 0 = gratuit</label><input style={inp} type="number" min="0" value={form.prix||0} onChange={e=>set('prix',parseInt(e.target.value)||0)} placeholder="ex: 25000"/></div>
                <div><label style={lbl}>Lien de paiement externe</label><input style={inp} value={form.lien_achat||''} onChange={e=>set('lien_achat',e.target.value)} placeholder="https://lien-paiement.com/..."/></div>
              </div>
              <div style={{display:'flex',gap:'16px'}}>
                <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer'}}><input type="checkbox" checked={!!form.actif} onChange={e=>set('actif',e.target.checked)}/><span style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)'}}>Actif (visible)</span></label>
                <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer'}}><input type="checkbox" checked={!!form.en_vedette} onChange={e=>set('en_vedette',e.target.checked)}/><span style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)'}}>En vedette</span></label>
              </div>
              <div style={{display:'flex',gap:'10px',justifyContent:'flex-end',marginTop:'8px'}}>
                <button className="admin-btn admin-btn-secondary" onClick={closeModal}>Annuler</button>
                <button className="admin-btn admin-btn-primary"   onClick={sauvegarder}>{editing?'Enregistrer':'Créer le cours'}</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {modal==='categorie' && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&closeModal()}>
          <div className="modal-box" style={{maxWidth:'480px'}}>
            <h3 style={{fontFamily:'var(--ff-t)',fontSize:'1.3rem',marginBottom:'24px'}}>{editing?'Modifier':'Nouvelle catégorie'}</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div><label style={lbl}>Nom *</label><input style={inp} value={form.nom||''} onChange={e=>set('nom',e.target.value)} placeholder="ex: Confiance en soi"/></div>
              <div><label style={lbl}>Slug</label><input style={inp} value={form.slug||''} onChange={e=>set('slug',e.target.value)}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Icône emoji</label><input style={inp} value={form.icone||'✦'} onChange={e=>set('icone',e.target.value)} placeholder="💪"/></div>
                <div><label style={lbl}>Couleur</label>
                  <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                    <input type="color" value={form.couleur||'#C9A96A'} onChange={e=>set('couleur',e.target.value)} style={{width:'44px',height:'38px',border:'none',borderRadius:'3px',cursor:'pointer'}}/>
                    <input style={{...inp,flex:1}} value={form.couleur||'#C9A96A'} onChange={e=>set('couleur',e.target.value)}/>
                  </div>
                </div>
              </div>
              <div><label style={lbl}>Ordre</label><input style={inp} type="number" value={form.ordre||0} onChange={e=>set('ordre',parseInt(e.target.value)||0)}/></div>
              <div style={{display:'flex',gap:'10px',justifyContent:'flex-end',marginTop:'8px'}}>
                <button className="admin-btn admin-btn-secondary" onClick={closeModal}>Annuler</button>
                <button className="admin-btn admin-btn-primary"   onClick={sauvegarder}>{editing?'Enregistrer':'Créer'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================================================================
   PARTENAIRES VIEW
   ================================================================ */

export { LearningView };
