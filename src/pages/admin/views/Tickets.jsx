import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
function TicketsView({ api, toast }) {
  const [onglet,     setOnglet]     = useState('evenements')
  const [evenements, setEvenements] = useState([])
  const [tickets,    setTickets]    = useState([])
  const [selEv,      setSelEv]      = useState(null)
  const [loading,    setLoading]    = useState(true)
  const [modal,      setModal]      = useState(false)
  const [editing,    setEditing]    = useState(null)
  const [form,       setForm]       = useState({})
  const token = localStorage.getItem('mmorphose_token')

  function apiT(method, path, body=null) {
    const opts = { method, headers:{'Authorization':`Bearer ${token}`,'Content-Type':'application/json'} }
    if (body) opts.body = JSON.stringify(body)
    return fetch(`/api/tickets${path}`, opts).then(r => r.status===204 ? true : r.json())
  }

  function loadEvenements() {
    setLoading(true)
    apiT('GET','/admin/evenements/').then(d=>{setEvenements(Array.isArray(d)?d:[]);setLoading(false)}).catch(()=>setLoading(false))
  }

  function loadTickets(evId=null) {
    setLoading(true)
    const url = evId ? `/admin/tickets/?evenement=${evId}` : '/admin/tickets/'
    apiT('GET',url).then(d=>{setTickets(Array.isArray(d)?d:[]);setLoading(false)}).catch(()=>setLoading(false))
  }

  useEffect(()=>{ loadEvenements() },[])

  function slugify(s) {
    return s.toLowerCase()
      .replace(/[àâä]/g,'a').replace(/[éèêë]/g,'e').replace(/[îï]/g,'i')
      .replace(/[ôö]/g,'o').replace(/[ùûü]/g,'u').replace(/ç/g,'c')
      .replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')
  }

  function openModal(item=null) {
    setEditing(item)
    setForm(item || {nom:'',slug:'',description:'',date:'',lieu:'',places_total:50,prix:0,image:'',actif:true})
    setModal(true)
  }
  function closeModal() { setModal(false); setEditing(null); setForm({}) }
  function set(k,v) { setForm(p=>{ const n={...p,[k]:v}; if(k==='nom'&&!editing) n.slug=slugify(v); return n }) }

  async function sauvegarder() {
    if (!form.nom || !form.date) { toast('Nom et date requis','error'); return }
    try {
      const res = editing
        ? await apiT('PATCH',`/admin/evenements/${editing.id}/`,form)
        : await apiT('POST','/admin/evenements/',form)
      if (res && !res.detail) { toast(editing?'Mis à jour ✓':'Créé ✓','success'); closeModal(); loadEvenements() }
      else toast(res?.detail||'Erreur','error')
    } catch { toast('Erreur serveur','error') }
  }

  async function supprimerEv(id) {
    if (!confirm('Supprimer cet événement et tous ses tickets ?')) return
    await apiT('DELETE',`/admin/evenements/${id}/`)
    toast('Supprimé','success'); loadEvenements()
  }

  async function annulerTicket(id) {
    if (!confirm('Annuler ce ticket ?')) return
    await apiT('PATCH',`/admin/tickets/${id}/`,{statut:'annule'})
    toast('Ticket annulé','success')
    loadTickets(selEv)
  }

  function voirTickets(ev) {
    setSelEv(ev.id); setOnglet('tickets'); loadTickets(ev.id)
  }

  function formatDate(d) {
    return new Date(d).toLocaleDateString('fr-FR',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'})
  }

  const STATUT_COLORS = {valide:'badge-green',scanne:'badge-or',annule:'badge-red'}
  const inp = {width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',fontWeight:300,outline:'none'}
  const lbl = {fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-sub)',display:'block',marginBottom:'6px'}

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'32px',flexWrap:'wrap',gap:'12px'}}>
        <div>
          <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600}}>Tickets Événements</h2>
          <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginTop:'4px'}}>{evenements.length} événement{evenements.length!==1?'s':''}</p>
        </div>
        <div style={{display:'flex',gap:'10px'}}>
          {onglet==='evenements' && (
            <button className="admin-btn admin-btn-primary" onClick={()=>openModal()}>+ Nouvel événement</button>
          )}
          <a href="/scan" target="_blank" style={{padding:'9px 18px',borderRadius:'3px',background:'rgba(201,169,106,.1)',border:'1px solid rgba(201,169,106,.25)',color:'var(--or)',fontFamily:'var(--ff-b)',fontSize:'.7rem',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',textDecoration:'none'}}>
            📷 Scanner QR
          </a>
        </div>
      </div>

      {/* Onglets */}
      <div style={{display:'flex',gap:'4px',marginBottom:'24px',background:'rgba(255,255,255,.03)',borderRadius:'4px',padding:'4px',width:'fit-content'}}>
        {[['evenements','Événements'],['tickets','Tickets']].map(([id,label])=>(
          <button key={id} onClick={()=>{ setOnglet(id); if(id==='tickets'){ loadTickets(selEv) } else { loadEvenements() } }}
            style={{padding:'8px 18px',borderRadius:'3px',border:'none',cursor:'pointer',fontFamily:'var(--ff-b)',fontSize:'.68rem',fontWeight:500,letterSpacing:'.1em',textTransform:'uppercase',background:onglet===id?'var(--rose)':'transparent',color:onglet===id?'#fff':'var(--text-sub)',transition:'all .25s'}}>
            {label}
          </button>
        ))}
      </div>

      {/* Liste événements */}
      {onglet==='evenements' && (
        loading ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p> :
        evenements.length===0 ? (
          <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
            <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',fontSize:'1.1rem',color:'rgba(248,245,242,.3)',marginBottom:'16px'}}>Aucun événement</p>
            <button className="admin-btn admin-btn-primary" onClick={()=>openModal()}>Créer le premier événement</button>
          </div>
        ) : evenements.map(ev=>(
          <div key={ev.id} className="row-item" style={{flexWrap:'wrap',gap:'12px'}}>
            <div style={{flex:1,minWidth:'200px'}}>
              <p style={{fontFamily:'var(--ff-b)',fontWeight:500,fontSize:'.88rem',marginBottom:'4px'}}>{ev.nom}</p>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap',alignItems:'center'}}>
                <span style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--or)'}}>{formatDate(ev.date)}</span>
                {ev.lieu && <span style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)'}}>· {ev.lieu}</span>}
              </div>
              <div style={{display:'flex',gap:'8px',marginTop:'6px'}}>
                <span className={`badge ${ev.actif?'badge-green':'badge-red'}`}>{ev.actif?'Actif':'Inactif'}</span>
                <span className="badge badge-or">{ev.nb_tickets||0}/{ev.places_total} places</span>
                {ev.prix===0 ? <span className="badge badge-green">Gratuit</span> : <span className="badge badge-or">{ev.prix?.toLocaleString()} FCFA</span>}
              </div>
            </div>
            <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
              <button className="admin-btn admin-btn-secondary" onClick={()=>voirTickets(ev)}>Tickets ({ev.nb_tickets||0})</button>
              <button className="admin-btn admin-btn-secondary" onClick={()=>openModal(ev)}>Modifier</button>
              <button className="admin-btn admin-btn-danger" onClick={()=>supprimerEv(ev.id)}>Supprimer</button>
            </div>
          </div>
        ))
      )}

      {/* Liste tickets */}
      {onglet==='tickets' && (
        <>
          <div style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px',flexWrap:'wrap'}}>
            <select value={selEv||''} onChange={e=>{setSelEv(e.target.value||null);loadTickets(e.target.value||null)}}
              style={{padding:'8px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.78rem',outline:'none'}}>
              <option value="">Tous les événements</option>
              {evenements.map(ev=><option key={ev.id} value={ev.id}>{ev.nom}</option>)}
            </select>
            <span style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)'}}>{tickets.length} ticket{tickets.length!==1?'s':''}</span>
          </div>

          {loading ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p> :
          tickets.length===0 ? (
            <div style={{padding:'40px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
              <p style={{fontFamily:'var(--ff-b)',fontSize:'.85rem',color:'rgba(248,245,242,.3)'}}>Aucun ticket pour cet événement</p>
            </div>
          ) : tickets.map(t=>(
            <div key={t.id} className="row-item" style={{flexWrap:'wrap',gap:'12px'}}>
              <div style={{flex:1,minWidth:'180px'}}>
                <p style={{fontFamily:'var(--ff-b)',fontWeight:500,fontSize:'.85rem',marginBottom:'4px'}}>{t.nom_complet}</p>
                <p style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)',marginBottom:'4px'}}>{t.email}</p>
                <p style={{fontFamily:'var(--ff-b)',fontSize:'.7rem',color:'rgba(248,245,242,.25)',fontFamily:'monospace'}}>{String(t.code).substring(0,8).toUpperCase()}</p>
              </div>
              <div style={{display:'flex',flexDirection:'column',gap:'4px',alignItems:'flex-end'}}>
                <span className={`badge ${STATUT_COLORS[t.statut]||'badge-or'}`}>
                  {t.statut==='valide'?'✓ Valide':t.statut==='scanne'?'📷 Scanné':'✕ Annulé'}
                </span>
                <span style={{fontFamily:'var(--ff-b)',fontSize:'.65rem',color:'var(--text-sub)'}}>{new Date(t.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              {t.statut !== 'annule' && (
                <button className="admin-btn admin-btn-danger" onClick={()=>annulerTicket(t.id)}>Annuler</button>
              )}
            </div>
          ))}
        </>
      )}

      {/* Modal événement */}
      {modal && (
        <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&closeModal()}>
          <div className="modal-box" style={{maxWidth:'560px'}}>
            <h3 style={{fontFamily:'var(--ff-t)',fontSize:'1.3rem',marginBottom:'24px'}}>{editing?'Modifier':'Nouvel événement'}</h3>
            <div style={{display:'flex',flexDirection:'column',gap:'14px'}}>
              <div><label style={lbl}>Nom *</label><input style={inp} value={form.nom||''} onChange={e=>set('nom',e.target.value)} placeholder="Nom de l'événement"/></div>
              <div><label style={lbl}>Slug</label><input style={inp} value={form.slug||''} onChange={e=>set('slug',e.target.value)}/></div>
              <div><label style={lbl}>Description</label><textarea style={{...inp,minHeight:'80px',resize:'vertical'}} value={form.description||''} onChange={e=>set('description',e.target.value)}/></div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Date et heure *</label><input style={inp} type="datetime-local" value={form.date||''} onChange={e=>set('date',e.target.value)}/></div>
                <div><label style={lbl}>Lieu</label><input style={inp} value={form.lieu||''} onChange={e=>set('lieu',e.target.value)} placeholder="Cotonou, Bénin"/></div>
              </div>
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
                <div><label style={lbl}>Places totales</label><input style={inp} type="number" value={form.places_total||50} onChange={e=>set('places_total',parseInt(e.target.value)||50)}/></div>
                <div><label style={lbl}>Prix (FCFA, 0=gratuit)</label><input style={inp} type="number" value={form.prix||0} onChange={e=>set('prix',parseInt(e.target.value)||0)}/></div>
              </div>
              <div><label style={lbl}>Image (URL)</label><input style={inp} value={form.image||''} onChange={e=>set('image',e.target.value)} placeholder="https://..."/></div>
              <label style={{display:'flex',alignItems:'center',gap:'8px',cursor:'pointer'}}>
                <input type="checkbox" checked={!!form.actif} onChange={e=>set('actif',e.target.checked)}/>
                <span style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)'}}>Événement actif (visible)</span>
              </label>
              <div style={{display:'flex',gap:'10px',justifyContent:'flex-end',marginTop:'8px'}}>
                <button className="admin-btn admin-btn-secondary" onClick={closeModal}>Annuler</button>
                <button className="admin-btn admin-btn-primary" onClick={sauvegarder}>{editing?'Enregistrer':'Créer'}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ================================================================
   ABONNÉS NEWSLETTER VIEW
   ================================================================ */

export { TicketsView };
