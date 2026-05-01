import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';
function RessourcesAdminView({ api, toast, refreshKey = 0 }) {
  const [configs,   setConfigs]   = useState({});
  const [loading,   setLoading]   = useState(true);
  const [saving,    setSaving]    = useState({});
  const [uploading, setUploading] = useState({});
  const token = localStorage.getItem("mmorphose_token")

  useEffect(() => {
    const token = localStorage.getItem("mmorphose_token");
    fetch(`${API_BASE}/api/admin/config/`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => {
      if (d) {
        const map = {};
        d.filter(c => c.section === "ressources").forEach(c => { map[c.cle] = c.valeur; });
        setConfigs(map);
      }
      setLoading(false);
    });
  }, [refreshKey]);

  function set(cle, val) { setConfigs(p => ({...p, [cle]: val})); }

  async function save(cle) {
    setSaving(s => ({...s, [cle]: true}));
    await api("POST", "/config/update/", { cle, valeur: configs[cle], section: "ressources" });
    setSaving(s => ({...s, [cle]: false}));
    toast(`"${cle}" mis à jour`, "success");
  }

  async function uploadFichier(cle, file, type) {
    if (!file) return;
    setUploading(u => ({...u, [cle]: true}));

    const formData = new FormData();
    formData.append("fichier", file);
    formData.append("cle", cle);
    formData.append("section", "ressources");

    try {
      const res = await fetch(`${API_BASE}/api/admin/images/upload/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData,
      });
      if (res.ok) {
        const data = await res.json();
        setConfigs(p => ({...p, [cle]: data.url}));
        toast(`${type === "audio" ? "Chanson" : "Guide PDF"} uploadé`, "success");
      } else {
        toast("Erreur upload", "error");
      }
    } catch {
      toast("Erreur serveur", "error");
    }
    setUploading(u => ({...u, [cle]: false}));
  }

  const inputStyle = { width:"100%", padding:"10px 14px", background:"rgba(255,255,255,.04)", border:"1px solid var(--border)", borderRadius:"3px", color:"var(--text)", fontFamily:"var(--ff-b)", fontSize:".82rem", fontWeight:300, outline:"none" };

  const fields = [
    { group:"Section", items:[
      { cle:"res_section_titre", label:"Titre de la section" },
      { cle:"res_section_desc",  label:"Description" },
      { cle:"res_citation_finale", label:"Citation finale" },
    ]},
    { group:"Chanson", items:[
      { cle:"res_chanson_titre",   label:"Titre de la chanson" },
      { cle:"res_chanson_artiste", label:"Artiste" },
      { cle:"res_chanson_desc",    label:"Description / Citation" },
    ]},
    { group:"Guide PDF", items:[
      { cle:"res_guide_titre",  label:"Titre du guide" },
      { cle:"res_guide_sous",   label:"Sous-titre" },
      { cle:"res_guide_desc",   label:"Description / Citation" },
      { cle:"res_guide_point1", label:"Point clé 1" },
      { cle:"res_guide_point2", label:"Point clé 2" },
      { cle:"res_guide_point3", label:"Point clé 3" },
    ]},
  ];

  if (loading) return <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}}/></div>;

  return (
    <div>
      <div style={{ marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600, marginBottom:"8px" }}>Chanson et Guide PDF</h2>
        <p style={{ fontSize:".82rem", color:"var(--text-sub)", fontWeight:300 }}>Gérez les ressources gratuites offertes aux visiteuses.</p>
      </div>

      {/* Upload fichiers */}
      <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px", marginBottom:"32px" }}>

        {/* Upload audio */}
        <div style={{ padding:"20px", background:"rgba(194,24,91,.06)", border:"1px solid rgba(194,24,91,.2)", borderRadius:"6px" }}>
          <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".18em", textTransform:"uppercase", color:"var(--rose)", marginBottom:"12px" }}>Fichier Audio (MP3)</p>
          {configs["res_audio_url"] && (
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".72rem", color:"var(--green)", marginBottom:"8px" }}>Fichier actuel : {configs["res_audio_url"]}</p>
          )}
          <label style={{ display:"block", padding:"12px", background:"rgba(194,24,91,.08)", border:"1px dashed rgba(194,24,91,.3)", borderRadius:"4px", cursor:"pointer", textAlign:"center", fontFamily:"var(--ff-b)", fontSize:".72rem", color:"var(--rose)", fontWeight:500, letterSpacing:".1em", textTransform:"uppercase" }}>
            {uploading["res_audio_url"] ? "Upload en cours..." : "Choisir un fichier MP3"}
            <input type="file" accept="audio/*" style={{ display:"none" }} onChange={e => uploadFichier("res_audio_url", e.target.files[0], "audio")} disabled={uploading["res_audio_url"]}/>
          </label>
        </div>

        {/* Upload PDF */}
        <div style={{ padding:"20px", background:"rgba(201,169,106,.06)", border:"1px solid rgba(201,169,106,.2)", borderRadius:"6px" }}>
          <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".18em", textTransform:"uppercase", color:"var(--or)", marginBottom:"12px" }}>Fichier Guide PDF</p>
          {configs["res_pdf_url"] && (
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".72rem", color:"var(--green)", marginBottom:"8px" }}>Fichier actuel : {configs["res_pdf_url"]}</p>
          )}
          <label style={{ display:"block", padding:"12px", background:"rgba(201,169,106,.08)", border:"1px dashed rgba(201,169,106,.3)", borderRadius:"4px", cursor:"pointer", textAlign:"center", fontFamily:"var(--ff-b)", fontSize:".72rem", color:"var(--or)", fontWeight:500, letterSpacing:".1em", textTransform:"uppercase" }}>
            {uploading["res_pdf_url"] ? "Upload en cours..." : "Choisir un fichier PDF"}
            <input type="file" accept=".pdf" style={{ display:"none" }} onChange={e => uploadFichier("res_pdf_url", e.target.files[0], "pdf")} disabled={uploading["res_pdf_url"]}/>
          </label>
        </div>
      </div>

      {/* Champs texte */}
      {fields.map(group => (
        <div key={group.group} style={{ marginBottom:"28px" }}>
          <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--or)", marginBottom:"14px", paddingBottom:"8px", borderBottom:"1px solid var(--border)" }}>{group.group}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            {group.items.map(field => (
              <div key={field.cle} style={{ padding:"16px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"4px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"8px" }}>
                  <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--or)" }}>{field.label}</label>
                  <button className="admin-btn admin-btn-primary" onClick={() => save(field.cle)} style={{ padding:"6px 14px", opacity:saving[field.cle]?.7:1 }}>
                    {saving[field.cle] ? "..." : "Enregistrer"}
                  </button>
                </div>
                {(configs[field.cle] || "").length > 80 ? (
                  <textarea style={{...inputStyle, resize:"vertical", minHeight:"70px"}} value={configs[field.cle]||""} onChange={e=>set(field.cle,e.target.value)}/>
                ) : (
                  <input style={inputStyle} value={configs[field.cle]||""} onChange={e=>set(field.cle,e.target.value)}/>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}



/* ── LISTE D'ATTENTE ADMIN ──────────────────────────────────── */
function ListeAttenteView({ api, toast }) {
  const [liste,    setListe]   = useState([]);
  const [loading,  setLoading] = useState(true);
  const [notifying,setNotifying]=useState(false);
  const token = localStorage.getItem("mmorphose_token")

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/liste-attente/`, { headers:{"Authorization":`Bearer ${token}`} })
    .then(r=>r.json()).then(d=>{ setListe(Array.isArray(d)?d:[]); setLoading(false); })
    .catch(()=>setLoading(false));
  }, []);

  async function notifier() {
    if(!confirm(`Envoyer un email d'ouverture à ${liste.filter(p=>!p.notifie).length} personnes ?`)) return;
    setNotifying(true);
    const res = await fetch(`${API_BASE}/api/admin/liste-attente/notifier/`, {
      method:"POST", headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},
      body: JSON.stringify({ url: window.location.origin })
    });
    const d = await res.json();
    toast(d.detail, "success");
    setNotifying(false);
  }

  const nonNotifiees = liste.filter(p=>!p.notifie).length;

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <div>
          <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600 }}>Liste d'attente</h2>
          <p style={{ fontSize:".78rem", color:"var(--text-sub)", marginTop:"4px" }}>{liste.length} inscrites · {nonNotifiees} non notifiées</p>
        </div>
        {nonNotifiees > 0 && (
          <button className="admin-btn admin-btn-primary" onClick={notifier} disabled={notifying}>
            {notifying ? "Envoi..." : `Notifier ${nonNotifiees} personne${nonNotifiees>1?"s":""}`}
          </button>
        )}
      </div>
      {loading ? <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}}/></div> :
       liste.length === 0 ? <p style={{textAlign:"center",color:"var(--text-sub)",padding:"40px",fontStyle:"italic"}}>Aucune inscription.</p> :
       liste.map((p,i) => (
        <div key={i} className="row-item" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:600, fontSize:".85rem" }}>{p.prenom || "—"}</p>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".78rem", color:"var(--text-sub)" }}>{p.email}</p>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".7rem", color:"rgba(248,245,242,.3)" }}>{new Date(p.date).toLocaleDateString("fr-FR")}</p>
          </div>
          <span className={`badge ${p.notifie?"badge-or":"badge-rose"}`}>{p.notifie?"Notifiée":"En attente"}</span>
        </div>
      ))}
    </div>
  );
}


/* ── NEWSLETTER ADMIN ───────────────────────────────────────── */
function NewsletterView({ api, toast }) {
  const [sujet,  setSujet]  = useState("");
  const [message,setMessage]= useState("");
  const [cible,  setCible]  = useState("tous");
  const [sending,setSending]= useState(false);
  const token = localStorage.getItem("mmorphose_token")

  async function envoyer() {
    if(!sujet.trim()||!message.trim()){toast("Sujet et message requis","error");return;}
    if(!confirm(`Envoyer cet email à tous les membres (${cible}) ?`)) return;
    setSending(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/newsletter/`, {
        method:"POST",
        headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},
        body: JSON.stringify({ sujet, message, cible })
      });
      const d = await res.json();
      toast(d.detail || "Envoyé", "success");
      setSujet(""); setMessage("");
    } catch { toast("Erreur serveur","error"); }
    setSending(false);
  }

  const inputStyle = { width:"100%", padding:"10px 14px", background:"rgba(255,255,255,.04)", border:"1px solid var(--border)", borderRadius:"3px", color:"var(--text)", fontFamily:"var(--ff-b)", fontSize:".82rem", fontWeight:300, outline:"none" };

  return (
    <div>
      <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600, marginBottom:"8px" }}>Newsletter</h2>
      <p style={{ fontSize:".82rem", color:"var(--text-sub)", marginBottom:"28px" }}>Envoyer un email groupé à vos membres.</p>

      <div style={{ display:"flex", flexDirection:"column", gap:"16px", maxWidth:"640px" }}>
        <div>
          <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--or)", display:"block", marginBottom:"6px" }}>Destinataires</label>
          <select style={inputStyle} value={cible} onChange={e=>setCible(e.target.value)}>
            <option value="tous">Tous les membres actifs</option>
            <option value="F1">ESSENTIELLE (F1)</option>
            <option value="F2">PERSONNALISÉE (F2)</option>
            <option value="F3">IMMERSION (F3)</option>
            <option value="F4">VIP (F4)</option>
          </select>
        </div>
        <div>
          <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--or)", display:"block", marginBottom:"6px" }}>Sujet *</label>
          <input style={inputStyle} value={sujet} onChange={e=>setSujet(e.target.value)} placeholder="Objet de l'email"/>
        </div>
        <div>
          <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--or)", display:"block", marginBottom:"6px" }}>Message *</label>
          <textarea style={{...inputStyle, resize:"vertical", minHeight:"200px"}} value={message} onChange={e=>setMessage(e.target.value)} placeholder="Contenu de l'email..."/>
        </div>
        <button className="admin-btn admin-btn-primary" onClick={envoyer} disabled={sending} style={{ padding:"14px", opacity:sending?.7:1 }}>
          {sending ? "Envoi en cours..." : "Envoyer la newsletter"}
        </button>
      </div>
    </div>
  );
}


/* ── EXPORT CSV ─────────────────────────────────────────────── */
function ExportView({ toast }) {
  const token = localStorage.getItem("mmorphose_token")

  function telecharger(url, nom) {
    fetch(url, { headers:{"Authorization":`Bearer ${token}`} })
    .then(r => r.blob())
    .then(blob => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = nom;
      a.click();
      toast(`${nom} téléchargé`, "success");
    })
    .catch(() => toast("Erreur téléchargement","error"));
  }

  const exports = [
    { label:"Membres",    desc:"Tous les membres avec leurs informations",     url:"/api/admin/export/membres/",  file:"membres_metamorphose.csv" },
    { label:"Demandes",   desc:"Toutes les demandes d'inscription reçues",     url:"/api/admin/export/demandes/", file:"demandes_metamorphose.csv" },
    { label:"Témoignages",desc:"Témoignages approuvés avec notes et pays",     url:"/api/admin/export/temoignages/", file:"temoignages_metamorphose.csv" },
    { label:"Liste attente",desc:"Personnes en liste d'attente",               url:"/api/admin/export/attente/",  file:"liste_attente.csv" },
  ];

  return (
    <div>
      <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600, marginBottom:"8px" }}>Export CSV</h2>
      <p style={{ fontSize:".82rem", color:"var(--text-sub)", marginBottom:"28px" }}>Téléchargez vos données au format CSV, compatibles avec Excel.</p>
      <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
        {exports.map((e,i) => (
          <div key={i} className="row-item" style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
            <div>
              <p style={{ fontFamily:"var(--ff-b)", fontWeight:600, fontSize:".88rem", marginBottom:"3px" }}>{e.label}</p>
              <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".75rem", color:"var(--text-sub)" }}>{e.desc}</p>
            </div>
            <button className="admin-btn admin-btn-secondary" onClick={()=>telecharger(e.url,e.file)} style={{ padding:"10px 20px", flexShrink:0 }}>
              Télécharger
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}


/* ── MODE MAINTENANCE ───────────────────────────────────────── */
function MaintenanceView({ api, toast }) {
  const [actif,   setActif]   = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("Le site est en maintenance. Revenez bientôt.");
  const token = localStorage.getItem("mmorphose_token")

  useEffect(() => {
    const token = localStorage.getItem("mmorphose_token");
    fetch(`${API_BASE}/api/admin/config/`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => {
      if(d) {
        const maint = d.find(c=>c.cle==="maintenance_active");
        const msg   = d.find(c=>c.cle==="maintenance_message");
        if(maint) setActif(maint.valeur==="1");
        if(msg)   setMessage(msg.valeur);
      }
      setLoading(false);
    });
  }, []);

  async function toggle() {
    const nouvelEtat = !actif;
    if(nouvelEtat && !confirm("Activer le mode maintenance va rendre le site inaccessible aux visiteurs. Confirmer ?")) return;
    setActif(nouvelEtat);
    await fetch(`${API_BASE}/api/admin/maintenance/`, {
      method:"POST",
      headers:{"Authorization":`Bearer ${token}`,"Content-Type":"application/json"},
      body: JSON.stringify({ actif: nouvelEtat })
    });
    await api("POST","/config/update/",{cle:"maintenance_message",valeur:message,section:"systeme"});
    toast(nouvelEtat ? "Mode maintenance activé" : "Site remis en ligne", nouvelEtat?"error":"success");
  }

  if(loading) return <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}}/></div>;

  return (
    <div style={{ maxWidth:"560px" }}>
      <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600, marginBottom:"8px" }}>Mode Maintenance</h2>
      <p style={{ fontSize:".82rem", color:"var(--text-sub)", marginBottom:"28px" }}>Rendez le site temporairement inaccessible aux visiteurs.</p>

      {/* Status */}
      <div style={{ padding:"24px", background:actif?"rgba(239,83,80,.08)":"rgba(76,175,80,.08)", border:`1px solid ${actif?"rgba(239,83,80,.25)":"rgba(76,175,80,.25)"}`, borderRadius:"6px", marginBottom:"24px", textAlign:"center" }}>
        <p style={{ fontFamily:"var(--ff-b)", fontWeight:700, fontSize:"1.1rem", color:actif?"#ef5350":"#4CAF50", marginBottom:"6px" }}>
          {actif ? "Mode maintenance ACTIF" : "Site en ligne"}
        </p>
        <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".82rem", color:"var(--text-sub)" }}>
          {actif ? "Les visiteurs voient la page de maintenance." : "Le site est accessible normalement."}
        </p>
      </div>

      {/* Message */}
      <div style={{ marginBottom:"20px" }}>
        <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--or)", display:"block", marginBottom:"8px" }}>Message affiché aux visiteurs</label>
        <textarea value={message} onChange={e=>setMessage(e.target.value)}
          style={{ width:"100%", padding:"12px 14px", background:"rgba(255,255,255,.04)", border:"1px solid var(--border)", borderRadius:"3px", color:"var(--text)", fontFamily:"var(--ff-b)", fontSize:".82rem", fontWeight:300, outline:"none", resize:"vertical", minHeight:"80px" }}/>
      </div>

      <button onClick={toggle} style={{ width:"100%", padding:"15px", background:actif?"#4CAF50":"#ef5350", color:"#fff", border:"none", borderRadius:"3px", fontFamily:"var(--ff-b)", fontWeight:700, fontSize:".78rem", letterSpacing:".15em", textTransform:"uppercase", cursor:"pointer", transition:"all .3s" }}>
        {actif ? "Remettre le site en ligne" : "Activer le mode maintenance"}
      </button>

      <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".72rem", color:"rgba(248,245,242,.3)", textAlign:"center", marginTop:"12px", lineHeight:1.6 }}>
        Vous restez connecté en tant qu'admin et pouvez toujours accéder au site.
      </p>
    </div>
  );
}




/* ── MON COMPTE ADMIN ──────────────────────────────────────── */

export { RessourcesAdminView, ListeAttenteView, NewsletterView, ExportView, MaintenanceView };
