import { useState, useEffect } from 'react';
function MonCompteView({ toast }) {
  const { token, user, updateUser } = useAuth();
  const [email,       setEmail]       = useState(user?.email      || "");
  const [firstName,   setFirstName]   = useState(user?.first_name || "");
  const [lastName,    setLastName]    = useState(user?.last_name  || "");
  const [whatsapp,    setWhatsapp]    = useState(user?.whatsapp   || "");
  const [savingInfo,  setSavingInfo]  = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [savingPass,  setSavingPass]  = useState(false);
  const [showPwd,     setShowPwd]     = useState(false);

  async function saveInfo(e) {
    e.preventDefault();
    setSavingInfo(true);
    try {
      const res = await fetch(`/api/auth/update-profile/`, {
        method:"PATCH", headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},
        body: JSON.stringify({ email, first_name:firstName, last_name:lastName, whatsapp }),
      });
      if (res.ok) { const d=await res.json(); updateUser({...user,...d}); toast("Informations mises à jour","success"); }
      else { const d=await res.json(); toast(d.detail||"Erreur","error"); }
    } catch { toast("Erreur serveur","error"); }
    setSavingInfo(false);
  }

  async function savePassword(e) {
    e.preventDefault();
    if (newPassword.length < 8)      { toast("8 caractères minimum","error"); return; }
    if (newPassword !== confirmPass)  { toast("Mots de passe différents","error"); return; }
    setSavingPass(true);
    try {
      const res = await fetch(`/api/auth/change-password/`, {
        method:"POST", headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},
        body: JSON.stringify({ old_password:oldPassword, new_password:newPassword }),
      });
      if (res.ok) { toast("Mot de passe modifié","success"); setOldPassword(""); setNewPassword(""); setConfirmPass(""); }
      else { const d=await res.json(); toast(d.detail||"Ancien mot de passe incorrect","error"); }
    } catch { toast("Erreur serveur","error"); }
    setSavingPass(false);
  }

  const inp = { width:"100%", padding:"11px 14px", background:"rgba(255,255,255,.04)", border:"1px solid var(--border)", borderRadius:"3px", color:"var(--text)", fontFamily:"var(--ff-b)", fontSize:".85rem", fontWeight:300, outline:"none" };

  return (
    <div style={{ maxWidth:"560px" }}>
      <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600, marginBottom:"32px" }}>Mon Compte</h2>
      <div style={{ padding:"28px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"6px", marginBottom:"20px" }}>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--or)", marginBottom:"20px" }}>Informations</p>
        <form onSubmit={saveInfo} style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
            <div><label style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"var(--text-sub)", display:"block", marginBottom:"5px" }}>Prénom</label><input style={inp} value={firstName} onChange={e=>setFirstName(e.target.value)}/></div>
            <div><label style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"var(--text-sub)", display:"block", marginBottom:"5px" }}>Nom</label><input style={inp} value={lastName} onChange={e=>setLastName(e.target.value)}/></div>
          </div>
          <div><label style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"var(--text-sub)", display:"block", marginBottom:"5px" }}>Email *</label><input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} required/></div>
          <div><label style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"var(--text-sub)", display:"block", marginBottom:"5px" }}>WhatsApp</label><input style={inp} value={whatsapp} onChange={e=>setWhatsapp(e.target.value)} placeholder="+229 01 XX XX XX"/></div>
          <button type="submit" disabled={savingInfo} className="admin-btn admin-btn-primary" style={{ padding:"12px", opacity:savingInfo?.7:1 }}>{savingInfo?"Enregistrement...":"Enregistrer"}</button>
        </form>
      </div>
      <div style={{ padding:"28px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"6px" }}>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--or)", marginBottom:"20px" }}>Mot de passe</p>
        <form onSubmit={savePassword} style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
          <div style={{ position:"relative" }}>
            <label style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"var(--text-sub)", display:"block", marginBottom:"5px" }}>Ancien mot de passe</label>
            <input style={{...inp,paddingRight:"60px"}} type={showPwd?"text":"password"} value={oldPassword} onChange={e=>setOldPassword(e.target.value)} required/>
            <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{ position:"absolute", right:"12px", bottom:"11px", background:"none", border:"none", color:"var(--text-sub)", cursor:"pointer", fontFamily:"var(--ff-b)", fontSize:".68rem" }}>{showPwd?"Cacher":"Voir"}</button>
          </div>
          <div><label style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"var(--text-sub)", display:"block", marginBottom:"5px" }}>Nouveau mot de passe</label><input style={inp} type={showPwd?"text":"password"} value={newPassword} onChange={e=>setNewPassword(e.target.value)} placeholder="8 caractères min." required/></div>
          <div>
            <label style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"var(--text-sub)", display:"block", marginBottom:"5px" }}>Confirmer</label>
            <input style={{...inp,borderColor:confirmPass&&confirmPass!==newPassword?"rgba(239,83,80,.5)":"var(--border)"}} type={showPwd?"text":"password"} value={confirmPass} onChange={e=>setConfirmPass(e.target.value)} required/>
            {confirmPass && confirmPass!==newPassword && <p style={{ color:"#ef5350", fontFamily:"var(--ff-b)", fontSize:".72rem", marginTop:"4px" }}>Ne correspondent pas</p>}
          </div>
          <button type="submit" disabled={savingPass||(confirmPass&&confirmPass!==newPassword)} className="admin-btn admin-btn-secondary" style={{ padding:"12px", opacity:savingPass?.7:1 }}>{savingPass?"Modification...":"Changer le mot de passe"}</button>
        </form>
      </div>
    </div>
  );
}

function MesReplaysView({ api, toast }) {
  const [replays, setReplays] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const token = localStorage.getItem('mmorphose_token')
    fetch('/api/contenu/replays/', { headers:{ 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setReplays(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(() => setLoading(false))
  },[])

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600,marginBottom:'8px'}}>Mes Replays</h2>
      <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginBottom:'32px'}}>
        Replays · {replays.length > 0 ? replays.length + ' disponibles' : 'Bientôt disponibles'}
      </p>
      {loading ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p> :
      replays.length === 0 ? (
        <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
          <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',fontSize:'1.1rem',color:'rgba(248,245,242,.3)',marginBottom:'12px'}}>Les replays arrivent bientôt</p>
          <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.82rem',color:'rgba(248,245,242,.25)'}}>Ils seront disponibles dès le début de votre vague.</p>
        </div>
      ) : replays.map(r => (
        <div key={r.id} className="row-item">
          <div style={{flex:1}}>
            <p style={{fontFamily:'var(--ff-b)',fontWeight:500,fontSize:'.88rem',marginBottom:'4px'}}>{r.titre}</p>
            {r.description && <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.75rem',color:'var(--text-sub)'}}>{r.description}</p>}
          </div>
          {r.video_url && (
            <a href={r.video_url} target="_blank" rel="noreferrer"
              style={{padding:'8px 16px',background:'var(--rose)',border:'none',borderRadius:'3px',color:'#fff',fontFamily:'var(--ff-b)',fontSize:'.68rem',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',textDecoration:'none'}}>
              Regarder
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

/* ================================================================
   VUE MEMBRE — MES GUIDES PDF
   ================================================================ */
function MesGuidesView({ api, toast }) {
  const [guides,  setGuides]  = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(()=>{
    const token = localStorage.getItem('mmorphose_token')
    fetch('/api/contenu/guides/', { headers:{ 'Authorization': `Bearer ${token}` } })
      .then(r => r.json())
      .then(d => { setGuides(Array.isArray(d)?d:[]); setLoading(false) })
      .catch(() => setLoading(false))
  },[])

  return (
    <div style={{animation:'fadeUp .5s both'}}>
      <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600,marginBottom:'8px'}}>Mes Guides PDF</h2>
      <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginBottom:'32px'}}>
        {guides.length} guide{guides.length!==1?'s':''} disponible{guides.length!==1?'s':''}
      </p>
      {loading ? <p style={{color:'var(--text-sub)',fontFamily:'var(--ff-b)'}}>Chargement...</p> :
      guides.length === 0 ? (
        <div style={{padding:'60px',textAlign:'center',background:'rgba(255,255,255,.02)',border:'1px solid rgba(255,255,255,.05)',borderRadius:'6px'}}>
          <p style={{fontFamily:'var(--ff-t)',fontStyle:'italic',fontSize:'1.1rem',color:'rgba(248,245,242,.3)'}}>Aucun guide disponible pour le moment</p>
        </div>
      ) : guides.map(g => (
        <div key={g.id} className="row-item">
          <div style={{flex:1}}>
            <p style={{fontFamily:'var(--ff-b)',fontWeight:500,fontSize:'.88rem',marginBottom:'4px'}}>{g.titre}</p>
            {g.description && <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.75rem',color:'var(--text-sub)'}}>{g.description}</p>}
          </div>
          {g.fichier && (
            <a href={g.fichier} target="_blank" rel="noreferrer"
              style={{padding:'8px 16px',background:'rgba(201,169,106,.1)',border:'1px solid rgba(201,169,106,.25)',borderRadius:'3px',color:'var(--or)',fontFamily:'var(--ff-b)',fontSize:'.68rem',fontWeight:600,letterSpacing:'.1em',textTransform:'uppercase',textDecoration:'none'}}>
              Télécharger
            </a>
          )}
        </div>
      ))}
    </div>
  )
}

/* ================================================================
   VUE MEMBRE — MON TÉMOIGNAGE
   ================================================================ */
function MonTemoignageView({ api, toast }) {
  const [form,    setForm]    = useState({texte:'',note:5,pays:''})
  const [loading, setLoading] = useState(false)
  const [done,    setDone]    = useState(false)

  async function soumettre() {
    if (!form.texte.trim()) { toast('Veuillez écrire votre témoignage','error'); return }
    setLoading(true)
    const token = localStorage.getItem('mmorphose_token')
    const res = await fetch(`/api/avis/soumettre/`, {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
      body: JSON.stringify(form)
    })
    if (res.ok) { toast('Témoignage soumis ✓','success'); setDone(true) }
    else toast('Erreur lors de la soumission','error')
    setLoading(false)
  }

  const inp = {width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',fontWeight:300,outline:'none'}
  const lbl = {fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-sub)',display:'block',marginBottom:'6px'}

  return (
    <div style={{animation:'fadeUp .5s both',maxWidth:'560px'}}>
      <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600,marginBottom:'8px'}}>Mon Témoignage</h2>
      <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginBottom:'32px'}}>Partagez votre expérience avec Méta'Morph'Ose</p>

      {done ? (
        <div style={{padding:'32px',background:'rgba(76,175,80,.06)',border:'1px solid rgba(76,175,80,.2)',borderRadius:'6px',textAlign:'center'}}>
          <p style={{fontFamily:'var(--ff-t)',fontSize:'1.2rem',fontStyle:'italic',color:'#4CAF50',marginBottom:'8px'}}>Merci pour votre témoignage !</p>
          <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.82rem',color:'var(--text-sub)'}}>Il sera publié après validation par Prélia.</p>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'16px'}}>
          <div>
            <label style={lbl}>Note (1-5 étoiles)</label>
            <div style={{display:'flex',gap:'8px'}}>
              {[1,2,3,4,5].map(n => (
                <button key={n} onClick={()=>setForm(p=>({...p,note:n}))}
                  style={{width:'36px',height:'36px',borderRadius:'50%',border:`1px solid ${form.note>=n?'var(--or)':'rgba(255,255,255,.1)'}`,background:form.note>=n?'rgba(201,169,106,.1)':'transparent',color:form.note>=n?'var(--or)':'var(--text-sub)',cursor:'pointer',fontFamily:'var(--ff-b)',fontSize:'.85rem'}}>
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label style={lbl}>Votre pays</label>
            <input style={inp} value={form.pays} onChange={e=>setForm(p=>({...p,pays:e.target.value}))} placeholder="Bénin, France..."/>
          </div>
          <div>
            <label style={lbl}>Votre témoignage *</label>
            <textarea style={{...inp,minHeight:'140px',resize:'vertical'}} value={form.texte}
              onChange={e=>setForm(p=>({...p,texte:e.target.value}))}
              placeholder="Partagez votre expérience..."/>
          </div>
          <p style={{fontFamily:'var(--ff-b)',fontSize:'.72rem',color:'var(--text-sub)',fontStyle:'italic'}}>
            Votre témoignage sera publié après validation par Prélia.
          </p>
          <button onClick={soumettre} disabled={loading}
            style={{padding:'12px 28px',background:'var(--rose)',border:'none',borderRadius:'3px',color:'#fff',fontFamily:'var(--ff-b)',fontSize:'.72rem',fontWeight:600,letterSpacing:'.12em',textTransform:'uppercase',cursor:'pointer',opacity:loading?.6:1,alignSelf:'flex-start'}}>
            {loading ? 'Envoi...' : 'Soumettre mon témoignage'}
          </button>
        </div>
      )}
    </div>
  )
}

/* ================================================================
   VUE MEMBRE — MON PROFIL
   ================================================================ */
function MonProfilView({ api, toast }) {
  const user = JSON.parse(localStorage.getItem('mmorphose_user') || '{}')
  const token = localStorage.getItem('mmorphose_token')
  const [form,    setForm]    = useState({first_name:user.first_name||'',last_name:user.last_name||'',email:user.email||'',whatsapp:user.whatsapp||''})
  const [mdp,     setMdp]     = useState({old_password:'',new_password:''})
  const [loading, setLoading] = useState(false)

  async function sauvegarder() {
    setLoading(true)
    const res = await fetch(`/api/auth/update-profile/`, {
      method:'PATCH',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
      body: JSON.stringify(form)
    })
    if (res.ok) toast('Profil mis à jour ✓','success')
    else toast('Erreur','error')
    setLoading(false)
  }

  async function changerMdp() {
    if (!mdp.old_password || !mdp.new_password) { toast('Remplissez les deux champs','error'); return }
    const res = await fetch(`/api/auth/change-password/`, {
      method:'POST',
      headers:{'Content-Type':'application/json','Authorization':`Bearer ${token}`},
      body: JSON.stringify(mdp)
    })
    const data = await res.json()
    if (res.ok) { toast('Mot de passe modifié ✓','success'); setMdp({old_password:'',new_password:''}) }
    else toast(data.detail||'Erreur','error')
  }

  const inp = {width:'100%',padding:'10px 14px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.82rem',fontWeight:300,outline:'none'}
  const lbl = {fontFamily:'var(--ff-b)',fontSize:'.62rem',letterSpacing:'.14em',textTransform:'uppercase',color:'var(--text-sub)',display:'block',marginBottom:'6px'}

  return (
    <div style={{animation:'fadeUp .5s both',maxWidth:'520px'}}>
      <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600,marginBottom:'32px'}}>Mon Profil</h2>

      <div style={{display:'flex',flexDirection:'column',gap:'14px',marginBottom:'32px'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
          <div><label style={lbl}>Prénom</label><input style={inp} value={form.first_name} onChange={e=>setForm(p=>({...p,first_name:e.target.value}))}/></div>
          <div><label style={lbl}>Nom</label><input style={inp} value={form.last_name} onChange={e=>setForm(p=>({...p,last_name:e.target.value}))}/></div>
        </div>
        <div><label style={lbl}>Email</label><input style={inp} type="email" value={form.email} onChange={e=>setForm(p=>({...p,email:e.target.value}))}/></div>
        <div><label style={lbl}>WhatsApp</label><input style={inp} value={form.whatsapp} onChange={e=>setForm(p=>({...p,whatsapp:e.target.value}))}/></div>
        <button onClick={sauvegarder} disabled={loading}
          style={{padding:'11px 24px',background:'var(--rose)',border:'none',borderRadius:'3px',color:'#fff',fontFamily:'var(--ff-b)',fontSize:'.72rem',fontWeight:600,letterSpacing:'.12em',textTransform:'uppercase',cursor:'pointer',alignSelf:'flex-start',opacity:loading?.6:1}}>
          {loading?'Sauvegarde...':'Sauvegarder'}
        </button>
      </div>

      <div style={{height:'1px',background:'rgba(255,255,255,.06)',marginBottom:'28px'}}/>

      <p style={{fontFamily:'var(--ff-t)',fontSize:'1.1rem',fontWeight:600,marginBottom:'16px'}}>Changer le mot de passe</p>
      <div style={{display:'flex',flexDirection:'column',gap:'12px'}}>
        <div><label style={lbl}>Ancien mot de passe</label><input style={inp} type="password" value={mdp.old_password} onChange={e=>setMdp(p=>({...p,old_password:e.target.value}))}/></div>
        <div><label style={lbl}>Nouveau mot de passe</label><input style={inp} type="password" value={mdp.new_password} onChange={e=>setMdp(p=>({...p,new_password:e.target.value}))}/></div>
        <button onClick={changerMdp}
          style={{padding:'11px 24px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'3px',color:'var(--text)',fontFamily:'var(--ff-b)',fontSize:'.72rem',fontWeight:600,letterSpacing:'.12em',textTransform:'uppercase',cursor:'pointer',alignSelf:'flex-start'}}>
          Modifier
        </button>
      </div>
    </div>
  )
}

/* ================================================================
   VUE MEMBRE — MON CERTIFICAT
   ================================================================ */
function MonCertificatView({ toast }) {
  const [loading, setLoading] = useState(false)
  const token = localStorage.getItem('mmorphose_token')
  const user  = JSON.parse(localStorage.getItem('mmorphose_user') || '{}')

  async function telecharger() {
    setLoading(true)
    try {
      const res = await fetch(`/api/auth/certificat/`, {
        headers:{'Authorization':`Bearer ${token}`}
      })
      if (!res.ok) { toast('Erreur génération certificat','error'); setLoading(false); return }
      const blob = await res.blob()
      const url  = URL.createObjectURL(blob)
      const a    = document.createElement('a')
      a.href     = url
      a.download = `Certificat_MetaMorphOse.pdf`
      a.click()
      URL.revokeObjectURL(url)
      toast('Certificat téléchargé ✓','success')
    } catch { toast('Erreur','error') }
    setLoading(false)
  }

  return (
    <div style={{animation:'fadeUp .5s both',maxWidth:'480px'}}>
      <h2 style={{fontFamily:'var(--ff-t)',fontSize:'1.6rem',fontWeight:600,marginBottom:'8px'}}>Mon Certificat</h2>
      <p style={{fontFamily:'var(--ff-b)',fontSize:'.78rem',color:'var(--text-sub)',marginBottom:'32px'}}>
        Certificat de complétion du programme Méta'Morph'Ose
      </p>
      <div style={{padding:'40px',background:'linear-gradient(135deg,rgba(201,169,106,.06),rgba(194,24,91,.04))',border:'1px solid rgba(201,169,106,.15)',borderRadius:'8px',textAlign:'center'}}>
        <p style={{fontFamily:'var(--ff-t)',fontSize:'1.3rem',fontWeight:600,color:'var(--or)',marginBottom:'8px'}}>
          {user.first_name} {user.last_name}
        </p>
        <p style={{fontFamily:'var(--ff-b)',fontWeight:300,fontSize:'.82rem',color:'var(--text-sub)',marginBottom:'28px'}}>
          Programme Méta'Morph'Ose — 8 Semaines
        </p>
        <button onClick={telecharger} disabled={loading}
          style={{padding:'14px 32px',background:'var(--or)',border:'none',borderRadius:'3px',color:'#0A0A0A',fontFamily:'var(--ff-b)',fontSize:'.75rem',fontWeight:700,letterSpacing:'.15em',textTransform:'uppercase',cursor:'pointer',opacity:loading?.6:1}}>
          {loading ? 'Génération...' : 'Télécharger mon certificat PDF'}
        </button>
      </div>
    </div>
  )
}

/* ================================================================
   MASTERCLASS ADMIN VIEW — Gestion des masterclasses et réservations
   ================================================================ */

export { MonCompteView, MesReplaysView, MesGuidesView, MonTemoignageView, MonProfilView, MonCertificatView };
