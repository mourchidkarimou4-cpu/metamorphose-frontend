import { useState, useEffect } from 'react';
function StoreAdminView({ toast }) {
  const [acces,    setAcces]    = useState([])
  const [cours,    setCours]    = useState([])
  const [loading,  setLoading]  = useState(true)
  const [email,    setEmail]    = useState("")
  const [coursId,  setCoursId]  = useState("")
  const [notes,    setNotes]    = useState("")
  const [saving,   setSaving]   = useState(false)
  const [filtreCours, setFiltreCours] = useState("")

  async function load() {
    setLoading(true)
    try {
      const [resAcces, resCours] = await Promise.all([
        learningAPI.adminListeAcces(filtreCours || undefined),
        learningAPI.listeCours(),
      ])
      setAcces(Array.isArray(resAcces.data) ? resAcces.data : [])
      setCours(Array.isArray(resCours.data) ? resCours.data : [])
    } catch { toast("Erreur chargement", "error") }
    setLoading(false)
  }
  useEffect(() => { load() }, [filtreCours])

  async function activer() {
    if (!email.trim() || !coursId) { toast("Email et cours requis", "error"); return }
    setSaving(true)
    try {
      const res = await learningAPI.adminActiverAcces({
        email, cours_id: parseInt(coursId),
        notes: notes || "Activation manuelle — Coach Prélia APEDO AHONON"
      })
      toast(res.data.detail || "Accès activé", "success")
      setEmail(""); setCoursId(""); setNotes("")
      load()
    } catch (e) {
      toast(e.response?.data?.detail || "Erreur", "error")
    }
    setSaving(false)
  }

  async function desactiver(email_u, cours_id) {
    if (!confirm(`Désactiver l'accès de ${email_u} ?`)) return
    try {
      await learningAPI.adminDesactiverAcces({ email: email_u, cours_id })
      toast("Accès désactivé", "success")
      load()
    } catch { toast("Erreur", "error") }
  }

  const inp = { width:"100%", padding:"10px 14px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"3px", color:"var(--text)", fontFamily:"var(--ff-b)", fontSize:".82rem", fontWeight:300, outline:"none" }
  const lbl = { fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".14em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }

  return (
    <div style={{ animation:"fadeUp .5s both" }}>
      <div style={{ marginBottom:"32px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.6rem", fontWeight:600 }}>Store — Gestion des accès</h2>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".78rem", color:"var(--text-sub)", marginTop:"4px" }}>
          Coach Prélia APEDO AHONON peut activer ou désactiver l'accès à chaque cours manuellement.
        </p>
      </div>

      {/* Activer un accès */}
      <div style={{ background:"rgba(255,255,255,.02)", border:"1px solid rgba(201,169,106,.15)", borderRadius:"8px", padding:"24px", marginBottom:"32px" }}>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--or)", marginBottom:"16px" }}>
          Activer un accès manuellement
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"14px" }}>
          <div>
            <label style={lbl}>Email de la membre *</label>
            <input style={inp} type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="membre@email.com"/>
          </div>
          <div>
            <label style={lbl}>Cours *</label>
            <select style={inp} value={coursId} onChange={e=>setCoursId(e.target.value)}>
              <option value="">Sélectionner un cours</option>
              {cours.map(c => <option key={c.id} value={c.id}>{c.titre}</option>)}
            </select>
          </div>
        </div>
        <div style={{ marginBottom:"14px" }}>
          <label style={lbl}>Notes (optionnel)</label>
          <input style={inp} value={notes} onChange={e=>setNotes(e.target.value)} placeholder="Ex: Paiement reçu par virement le 15/04/2026"/>
        </div>
        <button onClick={activer} disabled={saving}
          style={{ padding:"11px 28px", background:"var(--or)", border:"none", borderRadius:"4px", color:"#0A0A0A", fontFamily:"var(--ff-b)", fontWeight:700, fontSize:".75rem", letterSpacing:".12em", textTransform:"uppercase", cursor:saving?"not-allowed":"pointer", opacity:saving?.6:1 }}>
          {saving ? "Activation..." : "Activer l'accès"}
        </button>
      </div>

      {/* Filtre */}
      <div style={{ display:"flex", gap:"12px", alignItems:"center", marginBottom:"20px", flexWrap:"wrap" }}>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--text-sub)" }}>
          Filtrer par cours
        </p>
        <select style={{...inp, width:"auto", minWidth:"200px"}} value={filtreCours} onChange={e=>setFiltreCours(e.target.value)}>
          <option value="">Tous les cours</option>
          {cours.map(c => <option key={c.id} value={c.id}>{c.titre}</option>)}
        </select>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".72rem", color:"var(--text-sub)" }}>
          {acces.length} accès
        </p>
      </div>

      {/* Liste des accès */}
      {loading ? (
        <p style={{ color:"var(--text-sub)", fontFamily:"var(--ff-b)" }}>Chargement...</p>
      ) : acces.length === 0 ? (
        <div style={{ padding:"48px", textAlign:"center", background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.05)", borderRadius:"8px" }}>
          <p style={{ fontFamily:"var(--ff-t)", fontStyle:"italic", color:"rgba(248,245,242,.3)" }}>Aucun accès trouvé</p>
        </div>
      ) : acces.map(a => (
        <div key={a.id} className="row-item" style={{ flexWrap:"wrap", gap:"12px", marginBottom:"10px" }}>
          <div style={{ flex:1, minWidth:"200px" }}>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:500, fontSize:".88rem", marginBottom:"4px" }}>
              {a.prenom ? `${a.prenom} — ` : ""}{a.email}
            </p>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".72rem", color:"var(--text-sub)" }}>
              {a.cours} · {a.source} · {a.created_at}
            </p>
            {a.notes && <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", color:"rgba(201,169,106,.5)", marginTop:"2px" }}>{a.notes}</p>}
          </div>
          <div style={{ display:"flex", gap:"8px", alignItems:"center" }}>
            <span style={{ padding:"3px 10px", borderRadius:"100px", background:a.actif?"rgba(76,175,80,.1)":"rgba(239,68,68,.1)", border:`1px solid ${a.actif?"rgba(76,175,80,.3)":"rgba(239,68,68,.3)"}`, fontFamily:"var(--ff-b)", fontSize:".6rem", color:a.actif?"#4CAF50":"#f87171", letterSpacing:".1em", textTransform:"uppercase" }}>
              {a.actif ? "Actif" : "Inactif"}
            </span>
            {a.actif && (
              <button onClick={()=>desactiver(a.email, a.cours_id)}
                style={{ padding:"7px 12px", background:"rgba(239,68,68,.08)", border:"1px solid rgba(239,68,68,.2)", borderRadius:"4px", color:"#f87171", fontFamily:"var(--ff-b)", fontSize:".65rem", cursor:"pointer" }}>
                Désactiver
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}


export { StoreAdminView };
