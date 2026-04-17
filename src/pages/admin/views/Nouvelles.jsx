import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';
function NotificationsView({ api, toast }) {
  const [notifs,  setNotifs]  = useState([])
  const [loading, setLoading] = useState(true)
  const token = localStorage.getItem('mmorphose_token')

  useEffect(() => { charger() }, [])

  function charger() {
    fetch(`${API_BASE}/api/admin/notifications/?limit=50', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(d => {
      setNotifs(Array.isArray(d.results) ? d.results : [])
      setLoading(false)
    }).catch(() => setLoading(false))
  }

  async function marquerTousLus() {
    await fetch(`${API_BASE}/api/admin/notifications/lu/', {
      method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
    })
    charger()
    toast('Toutes les notifications marquées comme lues', 'success')
  }

  async function marquerLu(id) {
    await fetch(`${API_BASE}/api/admin/notifications/${id}/lu/`, {
      method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
    })
    setNotifs(prev => prev.map(n => n.id === id ? {...n, lu: true} : n))
  }

  const ICONS = {
    inscription: '👤', temoignage: '⭐', contact: '💬',
    paiement: '💰', ticket: '🎫', satisfaction: '📋',
    message: '✉️', system: '⚙️'
  }

  const inp = {width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',outline:'none'}
  const lbl = {fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-sub)',display:'block',marginBottom:'6px'}

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px'}}>
        <div>
          <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600}}>Notifications</h2>
          <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginTop:'4px'}}>
            {notifs.filter(n=>!n.lu).length} non lue(s)
          </p>
        </div>
        <button onClick={marquerTousLus} className="admin-btn admin-btn-secondary" style={{fontSize:'.72rem'}}>
          Tout marquer comme lu
        </button>
      </div>

      {loading ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p> :
      notifs.length === 0 ? (
        <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
          <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',color:'rgba(248,245,242,.3)'}}>Aucune notification</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {notifs.map(n => (
            <div key={n.id} onClick={() => !n.lu && marquerLu(n.id)}
              style={{padding:'16px 20px',background:n.lu?'rgba(255,255,255,.02)':'rgba(201,169,106,.06)',border:`1px solid ${n.lu?'rgba(255,255,255,.06)':'rgba(201,169,106,.2)'}`,borderRadius:'4px',cursor:n.lu?'default':'pointer',display:'flex',gap:'14px',alignItems:'flex-start',transition:'all .2s'}}>
              <span style={{fontSize:'1.2rem',flexShrink:0}}>{ICONS[n.type]||'🔔'}</span>
              <div style={{flex:1}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'4px'}}>
                  <p style={{fontFamily:'var(--ff-b)',fontWeight:n.lu?300:600,fontSize:'.88rem',color:n.lu?'var(--text-sub)':'var(--text)'}}>{n.titre}</p>
                  <span style={{fontFamily:'var(--ff-b)',fontSize:'.65rem',color:'var(--text-sub)',flexShrink:0,marginLeft:'12px'}}>{n.created_at}</span>
                </div>
                <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.78rem',color:'var(--text-sub)'}}>{n.message}</p>
                {n.user_email && <p style={{fontFamily:'var(--ff-b)',fontSize:'.68rem',color:'var(--or)',marginTop:'4px'}}>{n.user_email}</p>}
              </div>
              {!n.lu && <div style={{width:'8px',height:'8px',borderRadius:'50%',background:'var(--or)',flexShrink:0,marginTop:'4px'}}/>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ================================================================
   MESSAGERIE VIEW
   ================================================================ */
function MessageriView({ api, toast }) {
  const [convs,    setConvs]    = useState([])
  const [selected, setSelected] = useState(null)
  const [messages, setMessages] = useState([])
  const [input,    setInput]    = useState('')
  const [loading,  setLoading]  = useState(true)
  const token = localStorage.getItem('mmorphose_token')

  useEffect(() => { chargerConvs() }, [])
  useEffect(() => { if (selected) chargerMessages(selected.id) }, [selected])

  function chargerConvs() {
    fetch(`${API_BASE}/api/admin/conversations/', {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(d => { setConvs(Array.isArray(d)?d:[]); setLoading(false) })
    .catch(() => setLoading(false))
  }

  function chargerMessages(membreId) {
    fetch(`${API_BASE}/api/messages/${membreId}/`, {
      headers: { 'Authorization': `Bearer ${token}` }
    }).then(r => r.json()).then(d => { setMessages(Array.isArray(d)?d:[]) })
  }

  async function envoyer() {
    if (!input.trim() || !selected) return
    const res = await fetch(`${API_BASE}/api/messages/${selected.id}/`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ contenu: input.trim() })
    })
    if (res.ok) {
      setInput('')
      chargerMessages(selected.id)
      chargerConvs()
    }
  }

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600,marginBottom:'28px'}}>Messagerie</h2>
      <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:'20px',height:'600px'}}>

        {/* Liste conversations */}
        <div style={{background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'6px',overflow:'auto'}}>
          {loading ? <p style={{padding:'20px',color:'var(--text-sub)',fontFamily:'var(--ff-b)',fontSize:'.82rem'}}>Chargement...</p> :
          convs.length === 0 ? <p style={{padding:'20px',color:'var(--text-sub)',fontFamily:'var(--ff-b)',fontSize:'.82rem'}}>Aucune conversation</p> :
          convs.map(c => (
            <div key={c.id} onClick={() => setSelected(c)}
              style={{padding:'14px 16px',cursor:'pointer',borderBottom:'1px solid rgba(255,255,255,.04)',background:selected?.id===c.id?'rgba(201,169,106,.08)':'transparent',transition:'background .2s'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'4px'}}>
                <p style={{fontFamily:'var(--ff-b)',fontWeight:600,fontSize:'.82rem',color:'var(--text)'}}>{c.membre_prenom||c.membre_email}</p>
                {c.non_lu_admin > 0 && <span style={{background:'var(--rose)',color:'#fff',borderRadius:'100px',padding:'2px 7px',fontSize:'.6rem',fontWeight:700}}>{c.non_lu_admin}</span>}
              </div>
              <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.72rem',color:'var(--text-sub)',overflow:'hidden',whiteSpace:'nowrap',textOverflow:'ellipsis'}}>{c.dernier_message||'—'}</p>
              <p style={{fontFamily:'var(--ff-b)',fontSize:'.62rem',color:'var(--text-sub)',marginTop:'4px'}}>{c.updated_at}</p>
            </div>
          ))}
        </div>

        {/* Zone messages */}
        <div style={{background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'6px',display:'flex',flexDirection:'column'}}>
          {!selected ? (
            <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center'}}>
              <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',color:'rgba(248,245,242,.3)'}}>Sélectionnez une conversation</p>
            </div>
          ) : (
            <>
              <div style={{padding:'16px 20px',borderBottom:'1px solid rgba(255,255,255,.06)'}}>
                <p style={{fontFamily:'var(--ff-b)',fontWeight:600,fontSize:'.88rem',color:'var(--text)'}}>{selected.membre_prenom||selected.membre_email}</p>
                <p style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)'}}>{selected.membre_email}</p>
              </div>
              <div style={{flex:1,overflow:'auto',padding:'16px 20px',display:'flex',flexDirection:'column',gap:'10px'}}>
                {messages.map(m => (
                  <div key={m.id} style={{display:'flex',justifyContent:m.est_admin?'flex-end':'flex-start'}}>
                    <div style={{maxWidth:'70%',padding:'10px 14px',borderRadius:'10px',background:m.est_admin?'var(--rose)':'rgba(255,255,255,.06)',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',fontWeight:300,lineHeight:1.5}}>
                      {m.contenu}
                      <p style={{fontSize:'.62rem',color:m.est_admin?'rgba(255,255,255,.5)':'var(--text-sub)',marginTop:'4px',textAlign:'right'}}>{m.created_at}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{padding:'12px 16px',borderTop:'1px solid rgba(255,255,255,.06)',display:'flex',gap:'10px'}}>
                <input value={input} onChange={e=>setInput(e.target.value)}
                  onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();envoyer()}}}
                  placeholder="Votre message..." style={{flex:1,padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',outline:'none'}}/>
                <button onClick={envoyer} className="admin-btn admin-btn-primary" style={{padding:'10px 20px',flexShrink:0}}>Envoyer</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/* ================================================================
   VAGUES VIEW
   ================================================================ */
function VaguesView({ api, toast }) {
  const [vagues,   setVagues]   = useState([])
  const [selected, setSelected] = useState(null)
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(null) // 'create'|'detail'
  const [form,     setForm]     = useState({nom:'',numero:'',date_debut:'',date_fin:'',places_max:30,statut:'planifiee',description:''})
  const [emailAdd, setEmailAdd] = useState('')
  const token = localStorage.getItem('mmorphose_token')

  const STATUTS = { planifiee:'Planifiée', active:'En cours', terminee:'Terminée' }
  const STATUT_COLORS = { planifiee:'var(--or)', active:'var(--green)', terminee:'var(--text-sub)' }

  useEffect(() => { charger() }, [])

  function charger() {
    fetch(`${API_BASE}/api/admin/vagues/', { headers:{ 'Authorization':`Bearer ${token}` } })
      .then(r=>r.json()).then(d=>{ setVagues(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(()=>setLoading(false))
  }

  function ouvrirDetail(v) {
    fetch(`${API_BASE}/api/admin/vagues/${v.id}/`, { headers:{ 'Authorization':`Bearer ${token}` } })
      .then(r=>r.json()).then(d=>{ setSelected(d); setModal('detail') })
  }

  async function creer() {
    const res = await fetch(`${API_BASE}/api/admin/vagues/', {
      method:'POST', headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
      body: JSON.stringify(form)
    })
    if (res.ok) { toast('Vague créée ✓','success'); setModal(null); charger() }
    else toast('Erreur','error')
  }

  async function changerStatut(id, statut) {
    await fetch(`${API_BASE}/api/admin/vagues/${id}/`, {
      method:'PATCH', headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
      body: JSON.stringify({ statut })
    })
    charger()
    if (selected) setSelected(p => ({...p, statut}))
    toast(`Statut mis à jour : ${STATUTS[statut]}`,'success')
  }

  async function ajouterMembre() {
    if (!emailAdd.trim() || !selected) return
    const res = await fetch(`${API_BASE}/api/admin/vagues/${selected.id}/membres/`, {
      method:'POST', headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
      body: JSON.stringify({ email: emailAdd.trim() })
    })
    const data = await res.json()
    if (res.ok) { toast(data.detail,'success'); setEmailAdd(''); ouvrirDetail(selected) }
    else toast(data.detail||'Erreur','error')
  }

  async function retirerMembre(membreId) {
    await fetch(`${API_BASE}/api/admin/vagues/${selected.id}/membres/${membreId}/`, {
      method:'DELETE', headers:{'Authorization':`Bearer ${token}`}
    })
    ouvrirDetail(selected)
    toast('Membre retiré','success')
  }

  const inp = {width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',outline:'none'}
  const lbl = {fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-sub)',display:'block',marginBottom:'6px'}

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px'}}>
        <div>
          <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600}}>Planificateur de vagues</h2>
          <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginTop:'4px'}}>{vagues.length} vague(s)</p>
        </div>
        <button onClick={()=>{setForm({nom:'',numero:'',date_debut:'',date_fin:'',places_max:30,statut:'planifiee',description:''});setModal('create')}}
          className="admin-btn admin-btn-primary">+ Nouvelle vague</button>
      </div>

      {loading ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p> :
      vagues.length === 0 ? (
        <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
          <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',color:'rgba(248,245,242,.3)'}}>Aucune vague planifiée</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          {vagues.map(v => (
            <div key={v.id} style={{padding:'20px 24px',background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.06)',borderLeft:`4px solid ${STATUT_COLORS[v.statut]}`,borderRadius:'4px',display:'flex',justifyContent:'space-between',alignItems:'center',gap:'16px',flexWrap:'wrap'}}>
              <div>
                <div style={{display:'flex',alignItems:'center',gap:'10px',marginBottom:'6px'}}>
                  <p style={{fontFamily:'var(--ff-b)',fontWeight:600,fontSize:'.95rem'}}>{v.nom}</p>
                  <span style={{padding:'2px 8px',borderRadius:'100px',background:`${STATUT_COLORS[v.statut]}20`,color:STATUT_COLORS[v.statut],fontFamily:'var(--ff-b)',fontSize:'.62rem',fontWeight:600}}>{STATUTS[v.statut]}</span>
                </div>
                <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.78rem',color:'var(--text-sub)'}}>
                  {v.date_debut} → {v.date_fin} · {v.places_prises}/{v.places_max} places
                </p>
              </div>
              <div style={{display:'flex',gap:'8px'}}>
                {v.statut === 'planifiee' && <button onClick={()=>changerStatut(v.id,'active')} className="admin-btn admin-btn-primary" style={{fontSize:'.68rem',padding:'7px 14px'}}>Démarrer</button>}
                {v.statut === 'active' && <button onClick={()=>changerStatut(v.id,'terminee')} className="admin-btn admin-btn-secondary" style={{fontSize:'.68rem',padding:'7px 14px'}}>Terminer</button>}
                <button onClick={()=>ouvrirDetail(v)} className="admin-btn" style={{fontSize:'.68rem',padding:'7px 14px'}}>Gérer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal créer vague */}
      {modal === 'create' && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'6px',padding:'32px',maxWidth:'500px',width:'100%'}}>
            <h3 style={{fontFamily:'var(--ff-t)',fontSize:'1.2rem',fontWeight:600,marginBottom:'24px'}}>Nouvelle vague</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Nom</label><input style={inp} value={form.nom} onChange={e=>setForm(p=>({...p,nom:e.target.value}))} placeholder="Vague Printemps 2026"/></div>
                <div><label style={lbl}>Numéro</label><input style={inp} type="number" value={form.numero} onChange={e=>setForm(p=>({...p,numero:e.target.value}))}/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Début</label><input style={inp} type="date" value={form.date_debut} onChange={e=>setForm(p=>({...p,date_debut:e.target.value}))}/></div>
                <div><label style={lbl}>Fin</label><input style={inp} type="date" value={form.date_fin} onChange={e=>setForm(p=>({...p,date_fin:e.target.value}))}/></div>
              </div>
              <div><label style={lbl}>Places max</label><input style={inp} type="number" value={form.places_max} onChange={e=>setForm(p=>({...p,places_max:parseInt(e.target.value)||30}))}/></div>
              <div><label style={lbl}>Description</label><textarea style={{...inp,minHeight:'80px',resize:'vertical'}} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}/></div>
            </div>
            <div style={{display:'flex',gap:'10px',marginTop:'20px',justifyContent:'flex-end'}}>
              <button onClick={()=>setModal(null)} className="admin-btn admin-btn-secondary">Annuler</button>
              <button onClick={creer} className="admin-btn admin-btn-primary">Créer</button>
            </div>
          </div>
        </div>
      )}

      {/* Modal détail vague */}
      {modal === 'detail' && selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',overflowY:'auto'}}>
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'6px',padding:'32px',maxWidth:'600px',width:'100%',maxHeight:'90vh',overflowY:'auto'}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'24px'}}>
              <h3 style={{fontFamily:'var(--ff-t)',fontSize:'1.2rem',fontWeight:600}}>{selected.nom}</h3>
              <button onClick={()=>setModal(null)} style={{background:'none',border:'none',color:'var(--text-sub)',cursor:'pointer',fontSize:'1.2rem'}}>✕</button>
            </div>
            <p style={{fontFamily:'var(--ff-b)',fontSize:'.82rem',color:'var(--text-sub)',marginBottom:'20px'}}>
              {selected.date_debut} → {selected.date_fin} · {selected.places_prises}/{selected.places_max} places
            </p>

            <p style={{fontFamily:'var(--ff-b)',fontSize:'.65rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--or)',marginBottom:'12px'}}>Membres ({selected.membres?.length||0})</p>
            <div style={{display:'flex',gap:'8px',marginBottom:'16px'}}>
              <input value={emailAdd} onChange={e=>setEmailAdd(e.target.value)} placeholder="email@membre.com"
                style={{flex:1,padding:'9px 12px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',outline:'none'}}/>
              <button onClick={ajouterMembre} className="admin-btn admin-btn-primary" style={{padding:'9px 16px',fontSize:'.72rem',flexShrink:0}}>Ajouter</button>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:'6px',maxHeight:'280px',overflowY:'auto'}}>
              {(selected.membres||[]).map(m => (
                <div key={m.id} style={{display:'flex',justifyContent:'space-between',alignItems:'center',padding:'10px 14px',background:'rgba(255,255,255,.02)',borderRadius:'3px'}}>
                  <div>
                    <p style={{fontFamily:'var(--ff-b)',fontSize:'.82rem',fontWeight:500}}>{m.prenom||m.email}</p>
                    <p style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)'}}>{m.email}</p>
                  </div>
                  <button onClick={()=>retirerMembre(m.id)} style={{background:'rgba(239,83,80,.1)',border:'1px solid rgba(239,83,80,.2)',borderRadius:'3px',color:'#ef5350',padding:'4px 10px',cursor:'pointer',fontFamily:'var(--ff-b)',fontSize:'.65rem'}}>Retirer</button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================================================================
   PROGRESSION VIEW
   ================================================================ */
function ProgressionView({ api, toast }) {
  const [membres,  setMembres]  = useState([])
  const [selected, setSelected] = useState(null)
  const [form,     setForm]     = useState({})
  const [loading,  setLoading]  = useState(true)
  const token = localStorage.getItem('mmorphose_token')

  const BADGES = { premiere_session:'🌱 Première session', mi_parcours:'🌟 Mi-parcours', programme_complete:'🏆 Programme complété' }

  useEffect(() => { charger() }, [])

  function charger() {
    fetch(`${API_BASE}/api/admin/progression/', { headers:{ 'Authorization':`Bearer ${token}` } })
      .then(r=>r.json()).then(d=>{ setMembres(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(()=>setLoading(false))
  }

  function ouvrir(m) {
    setSelected(m)
    setForm({ semaine_actuelle:m.semaine_actuelle, sessions_completees:m.sessions_completees, notes_coach:m.notes_coach||'' })
  }

  async function sauvegarder() {
    const membreId = membres.find(m=>m.membre_email===selected.membre_email)?.id
    // On cherche l'ID via l'email
    const usersRes = await fetch(`${API_BASE}/api/membres/?search=${selected.membre_email}`, { headers:{ 'Authorization':`Bearer ${token}` } })
    const users    = await usersRes.json()
    const user     = Array.isArray(users) ? users[0] : users?.results?.[0]
    if (!user) { toast('Membre introuvable','error'); return }

    const res = await fetch(`${API_BASE}/api/admin/progression/${user.id}/`, {
      method:'PATCH', headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
      body: JSON.stringify(form)
    })
    if (res.ok) { toast('Progression mise à jour ✓','success'); charger(); setSelected(null) }
    else toast('Erreur','error')
  }

  const inp = {width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',outline:'none'}
  const lbl = {fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-sub)',display:'block',marginBottom:'6px'}

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600,marginBottom:'28px'}}>Progression membres</h2>

      {loading ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p> :
      membres.length === 0 ? (
        <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
          <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',color:'rgba(248,245,242,.3)'}}>Aucune donnée de progression</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          {membres.map((m,i) => (
            <div key={i} style={{padding:'16px 20px',background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'4px',display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap'}}>
              <div style={{flex:1,minWidth:'200px'}}>
                <p style={{fontFamily:'var(--ff-b)',fontWeight:600,fontSize:'.88rem',marginBottom:'2px'}}>{m.membre_prenom||m.membre_email}</p>
                <p style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)'}}>{m.membre_email}</p>
              </div>
              <div style={{display:'flex',alignItems:'center',gap:'8px',flex:1,minWidth:'200px'}}>
                <div style={{flex:1,height:'8px',background:'rgba(255,255,255,.08)',borderRadius:'4px',overflow:'hidden'}}>
                  <div style={{height:'100%',width:`${m.pourcentage}%`,background:m.pourcentage>=100?'var(--green)':m.pourcentage>=50?'var(--or)':'var(--rose)',borderRadius:'4px',transition:'width .5s'}}/>
                </div>
                <span style={{fontFamily:'var(--ff-b)',fontSize:'.82rem',fontWeight:600,color:'var(--or)',minWidth:'36px'}}>{m.pourcentage}%</span>
              </div>
              <p style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)',minWidth:'100px'}}>
                S{m.semaine_actuelle}/8 · {m.sessions_completees}/{m.sessions_total} sessions
              </p>
              <div style={{display:'flex',gap:'4px'}}>
                {(m.badges||[]).map(b => <span key={b} style={{fontSize:'.9rem'}} title={BADGES[b]}>{BADGES[b]?.split(' ')[0]}</span>)}
              </div>
              <button onClick={()=>ouvrir(m)} className="admin-btn" style={{fontSize:'.68rem',padding:'6px 12px'}}>Modifier</button>
            </div>
          ))}
        </div>
      )}

      {/* Modal modifier progression */}
      {selected && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px'}}>
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'6px',padding:'32px',maxWidth:'440px',width:'100%'}}>
            <h3 style={{fontFamily:'var(--ff-t)',fontSize:'1.1rem',fontWeight:600,marginBottom:'6px'}}>Progression — {selected.membre_prenom||selected.membre_email}</h3>
            <p style={{fontFamily:'var(--ff-b)',fontSize:'.75rem',color:'var(--text-sub)',marginBottom:'24px'}}>{selected.membre_email}</p>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Semaine actuelle</label><input style={inp} type="number" min="1" max="8" value={form.semaine_actuelle||1} onChange={e=>setForm(p=>({...p,semaine_actuelle:parseInt(e.target.value)||1}))}/></div>
                <div><label style={lbl}>Sessions complétées</label><input style={inp} type="number" min="0" value={form.sessions_completees||0} onChange={e=>setForm(p=>({...p,sessions_completees:parseInt(e.target.value)||0}))}/></div>
              </div>
              <div><label style={lbl}>Notes coach</label><textarea style={{...inp,minHeight:'100px',resize:'vertical'}} value={form.notes_coach||''} onChange={e=>setForm(p=>({...p,notes_coach:e.target.value}))}/></div>
            </div>
            <div style={{display:'flex',gap:'10px',marginTop:'20px',justifyContent:'flex-end'}}>
              <button onClick={()=>setSelected(null)} className="admin-btn admin-btn-secondary">Annuler</button>
              <button onClick={sauvegarder} className="admin-btn admin-btn-primary">Enregistrer</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================================================================
   SATISFACTION VIEW
   ================================================================ */
function SatisfactionView({ api, toast }) {
  const [data,    setData]    = useState([])
  const [loading, setLoading] = useState(true)
  const [emailEnvoi, setEmailEnvoi] = useState('')
  const token = localStorage.getItem('mmorphose_token')

  useEffect(() => { charger() }, [])

  function charger() {
    fetch(`${API_BASE}/api/admin/satisfactions/', { headers:{ 'Authorization':`Bearer ${token}` } })
      .then(r=>r.json()).then(d=>{ setData(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(()=>setLoading(false))
  }

  async function envoyer() {
    const res = await fetch(`${API_BASE}/api/admin/satisfaction/envoyer/', {
      method:'POST', headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
      body: JSON.stringify(emailEnvoi.trim() ? { email: emailEnvoi.trim() } : {})
    })
    const d = await res.json()
    toast(d.detail||'Envoyé ✓', res.ok?'success':'error')
    setEmailEnvoi('')
  }

  const moyenne = (arr, key) => {
    const vals = arr.filter(x => x[key] !== null).map(x => x[key])
    return vals.length ? (vals.reduce((a,b)=>a+b,0)/vals.length).toFixed(1) : '—'
  }

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'28px',flexWrap:'wrap',gap:'16px'}}>
        <div>
          <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600}}>Formulaires satisfaction J+30</h2>
          <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginTop:'4px'}}>{data.length} réponse(s)</p>
        </div>
        <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
          <input value={emailEnvoi} onChange={e=>setEmailEnvoi(e.target.value)} placeholder="email (vide = tous les membres)"
            style={{padding:'9px 12px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.78rem',outline:'none',width:'220px'}}/>
          <button onClick={envoyer} className="admin-btn admin-btn-primary" style={{fontSize:'.72rem'}}>Envoyer formulaire</button>
        </div>
      </div>

      {/* Moyennes globales */}
      {data.length > 0 && (
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'12px',marginBottom:'24px'}}>
          {[
            { label:'Note globale', key:'note_globale', max:10 },
            { label:'Note coach',   key:'note_coach',   max:10 },
            { label:'Note contenu', key:'note_contenu',  max:10 },
            { label:'Transformation',key:'note_transformation', max:10 },
          ].map(({label,key}) => (
            <div key={key} className="stat-card" style={{textAlign:'center'}}>
              <p style={{fontFamily:'var(--ff-t)',fontSize:'1.8rem',fontWeight:700,color:'var(--or)'}}>{moyenne(data,key)}</p>
              <p style={{fontFamily:'var(--ff-b)',fontSize:'.68rem',color:'var(--text-sub)',marginTop:'4px'}}>{label}</p>
              <p style={{fontFamily:'var(--ff-b)',fontSize:'.65rem',color:'var(--green)',marginTop:'2px'}}>
                {Math.round(data.filter(x=>x.recommanderait).length/data.length*100)}% recommandent
              </p>
            </div>
          ))}
        </div>
      )}

      {loading ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p> :
      data.length === 0 ? (
        <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
          <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',color:'rgba(248,245,242,.3)'}}>Aucune réponse reçue</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          {data.map((d,i) => (
            <div key={i} style={{padding:'18px 20px',background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'4px'}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px',flexWrap:'wrap',gap:'8px'}}>
                <div>
                  <p style={{fontFamily:'var(--ff-b)',fontWeight:600,fontSize:'.88rem'}}>{d.membre_prenom||d.membre_email}</p>
                  <p style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)'}}>{d.complete_le}</p>
                </div>
                <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                  <span style={{fontFamily:'var(--ff-t)',fontSize:'1.2rem',fontWeight:700,color:'var(--or)'}}>{d.note_globale}/10</span>
                  {d.recommanderait ? <span style={{color:'var(--green)',fontSize:'.75rem'}}>✓ Recommande</span> : <span style={{color:'#ef5350',fontSize:'.75rem'}}>✗ Ne recommande pas</span>}
                </div>
              </div>
              {d.point_fort && <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.78rem',color:'var(--text-sub)',marginBottom:'4px'}}>✓ {d.point_fort}</p>}
              {d.commentaire_libre && <p style={{fontFamily:'var(--ff-b)',fontStyle:'italic',fontWeight:300,fontSize:'.78rem',color:'rgba(248,245,242,.5)'}}>{d.commentaire_libre}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/* ================================================================
   AGENDA VIEW
   ================================================================ */
function AgendaView({ api, toast }) {
  const [sessions, setSessions] = useState([])
  const [loading,  setLoading]  = useState(true)
  const [modal,    setModal]    = useState(false)
  const [form,     setForm]     = useState({titre:'',type_session:'live_groupe',date_debut:'',date_fin:'',description:'',lien_live:'',membres_invites:''})
  const token = localStorage.getItem('mmorphose_token')

  const TYPES = { live_groupe:'Live Groupe', live_prive:'Live Privé', masterclass:'Masterclass', reunion:'Réunion', autre:'Autre' }
  const TYPE_COLORS = { live_groupe:'var(--rose)', live_prive:'var(--or)', masterclass:'#A8C8E0', reunion:'var(--green)', autre:'var(--text-sub)' }

  useEffect(() => { charger() }, [])

  function charger() {
    fetch(`${API_BASE}/api/agenda/', { headers:{ 'Authorization':`Bearer ${token}` } })
      .then(r=>r.json()).then(d=>{ setSessions(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(()=>setLoading(false))
  }

  async function creer() {
    const payload = {
      ...form,
      membres_invites: form.membres_invites.split(',').map(e=>e.trim()).filter(Boolean)
    }
    const res = await fetch(`${API_BASE}/api/agenda/', {
      method:'POST', headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'},
      body: JSON.stringify(payload)
    })
    if (res.ok) { toast('Session créée ✓','success'); setModal(false); charger() }
    else toast('Erreur','error')
  }

  async function supprimerSession(id) {
    if (!window.confirm('Supprimer cette session ?')) return
    await fetch(`${API_BASE}/api/agenda/${id}/`, { method:'DELETE', headers:{ 'Authorization':`Bearer ${token}` } })
    charger()
    toast('Session supprimée','success')
  }

  async function envoyerRappel(id) {
    const res = await fetch(`${API_BASE}/api/agenda/${id}/rappel/`, {
      method:'POST', headers:{ 'Authorization':`Bearer ${token}` }
    })
    const d = await res.json()
    toast(d.detail||'Rappels envoyés ✓','success')
  }

  const inp = {width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',outline:'none'}
  const lbl = {fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-sub)',display:'block',marginBottom:'6px'}

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'28px'}}>
        <div>
          <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600}}>Agenda coach</h2>
          <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginTop:'4px'}}>{sessions.length} session(s)</p>
        </div>
        <button onClick={()=>setModal(true)} className="admin-btn admin-btn-primary">+ Nouvelle session</button>
      </div>

      {loading ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p> :
      sessions.length === 0 ? (
        <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
          <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',color:'rgba(248,245,242,.3)'}}>Aucune session planifiée</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          {sessions.map(s => (
            <div key={s.id} style={{padding:'16px 20px',background:'rgba(255,255,255,.025)',border:'1px solid rgba(255,255,255,.06)',borderLeft:`4px solid ${TYPE_COLORS[s.type_session]||'var(--or)'}`,borderRadius:'4px',display:'flex',alignItems:'center',gap:'16px',flexWrap:'wrap'}}>
              <div style={{flex:1}}>
                <div style={{display:'flex',alignItems:'center',gap:'8px',marginBottom:'4px'}}>
                  <p style={{fontFamily:'var(--ff-b)',fontWeight:600,fontSize:'.88rem'}}>{s.titre}</p>
                  <span style={{padding:'2px 8px',borderRadius:'100px',background:`${TYPE_COLORS[s.type_session]||'var(--or)'}20`,color:TYPE_COLORS[s.type_session]||'var(--or)',fontFamily:'var(--ff-b)',fontSize:'.6rem'}}>{TYPES[s.type_session]}</span>
                </div>
                <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.75rem',color:'var(--text-sub)'}}>
                  📅 {s.date_debut?.replace('T',' ')} → {s.date_fin?.slice(11,16)}
                  {s.nb_invites > 0 && ` · ${s.nb_invites} invité(s)`}
                </p>
                {s.lien_live && <a href={s.lien_live} target="_blank" rel="noreferrer" style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--or)',textDecoration:'none'}}>🔗 {s.lien_live}</a>}
              </div>
              <div style={{display:'flex',gap:'6px'}}>
                <button onClick={()=>envoyerRappel(s.id)} className="admin-btn" style={{fontSize:'.65rem',padding:'6px 12px'}}>📧 Rappel</button>
                <button onClick={()=>supprimerSession(s.id)} className="admin-btn" style={{fontSize:'.65rem',padding:'6px 12px',color:'#ef5350'}}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal créer session */}
      {modal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.8)',zIndex:500,display:'flex',alignItems:'center',justifyContent:'center',padding:'24px',overflowY:'auto'}}>
          <div style={{background:'var(--surface)',border:'1px solid var(--border)',borderRadius:'6px',padding:'32px',maxWidth:'520px',width:'100%'}}>
            <h3 style={{fontFamily:'var(--ff-t)',fontSize:'1.2rem',fontWeight:600,marginBottom:'24px'}}>Nouvelle session</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div><label style={lbl}>Titre</label><input style={inp} value={form.titre} onChange={e=>setForm(p=>({...p,titre:e.target.value}))} placeholder="Live groupe — Semaine 3"/></div>
              <div>
                <label style={lbl}>Type</label>
                <select style={{...inp,cursor:'pointer'}} value={form.type_session} onChange={e=>setForm(p=>({...p,type_session:e.target.value}))}>
                  {Object.entries(TYPES).map(([k,v])=><option key={k} value={k}>{v}</option>)}
                </select>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Début</label><input style={inp} type="datetime-local" value={form.date_debut} onChange={e=>setForm(p=>({...p,date_debut:e.target.value}))}/></div>
                <div><label style={lbl}>Fin</label><input style={inp} type="datetime-local" value={form.date_fin} onChange={e=>setForm(p=>({...p,date_fin:e.target.value}))}/></div>
              </div>
              <div><label style={lbl}>Lien live (optionnel)</label><input style={inp} type="url" value={form.lien_live} onChange={e=>setForm(p=>({...p,lien_live:e.target.value}))} placeholder="https://..."/></div>
              <div><label style={lbl}>Membres invités (emails séparés par virgule)</label><textarea style={{...inp,minHeight:'70px',resize:'vertical'}} value={form.membres_invites} onChange={e=>setForm(p=>({...p,membres_invites:e.target.value}))} placeholder="membre1@email.com, membre2@email.com"/></div>
              <div><label style={lbl}>Description (optionnel)</label><textarea style={{...inp,minHeight:'80px',resize:'vertical'}} value={form.description} onChange={e=>setForm(p=>({...p,description:e.target.value}))}/></div>
            </div>
            <div style={{display:'flex',gap:'10px',marginTop:'20px',justifyContent:'flex-end'}}>
              <button onClick={()=>setModal(false)} className="admin-btn admin-btn-secondary">Annuler</button>
              <button onClick={creer} className="admin-btn admin-btn-primary">Créer & inviter</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export { NotificationsView, MessageriView, VaguesView, ProgressionView, SatisfactionView, AgendaView };
