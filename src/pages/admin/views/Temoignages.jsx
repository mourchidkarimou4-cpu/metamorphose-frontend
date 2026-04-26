import { useState, useEffect } from 'react';
import { FORMULES } from '../constants';

const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';
function TemoignagesView({ api, toast }) {
  const [temos,    setTemos]    = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [filter,   setFilter]   = useState("en_attente");
  const [typeFilter, setTypeFilter] = useState("tout");
  const [showMasterclass, setShowMasterclass] = useState(false);
  const [modal,    setModal]    = useState(null);
  const [selected, setSelected] = useState(null);
  const [form,     setForm]     = useState({});
  const [saving,   setSaving]   = useState(false);
  const [photoAvant,    setPhotoAvant]    = useState(null);
  const [photoApres,    setPhotoApres]    = useState(null);
  const [videoFichier,  setVideoFichier]  = useState(null);
  const [audioFichier,  setAudioFichier]  = useState(null);
  const token = localStorage.getItem("mmorphose_token")

  const FORMULES = { F1:"ESSENTIELLE", F2:"PERSONNALISÉE", F3:"IMMERSION", F4:"VIP" };
  const TYPES    = { texte:"Texte", video:"Vidéo", audio:"Audio" };
  const TYPE_COLORS = { texte:"var(--or)", video:"#A8C8E0", audio:"var(--rose)" };

  function fetchTemos() {
    setLoading(true);
    fetch(`${API_BASE}/api/avis/admin/?statut=${filter}`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(d => { setTemos(Array.isArray(d) ? d : Array.isArray(d?.results) ? d.results : []); setLoading(false); })
    .catch(() => setLoading(false));
  }

  useEffect(() => { fetchTemos(); }, [filter]);

  function openEdit(t) {
    setSelected(t);
    setForm({
      prenom: t.prenom||"", pays: t.pays||"", formule: t.formule||"",
      type_temo: t.type_temo||"texte", texte: t.texte||"",
      note: t.note||5, video_url: t.video_url||"",
      en_vedette: t.en_vedette||false, statut: t.statut||"en_attente",
    });
    setPhotoAvant(null); setPhotoApres(null);
    setVideoFichier(null); setAudioFichier(null);
    setModal("edit");
  }

  function openAdd() {
    setSelected(null);
    setForm({ prenom:"", pays:"", formule:"", type_temo:"texte", texte:"", note:5, video_url:"", en_vedette:false, statut:"approuve" });
    setPhotoAvant(null); setPhotoApres(null);
    setVideoFichier(null); setAudioFichier(null);
    setModal("add");
  }

  async function save() {
    if (!form.prenom.trim()) { toast("Prénom requis", "error"); return; }
    if (form.type_temo === "texte" && !form.texte.trim()) { toast("Témoignage requis", "error"); return; }
    setSaving(true);

    const data = new FormData();
    Object.entries(form).forEach(([k,v]) => data.append(k, v));
    if (photoAvant)   data.append("photo_avant",    photoAvant);
    if (photoApres)   data.append("photo_apres",    photoApres);
    if (videoFichier) data.append("video_fichier",  videoFichier);
    if (audioFichier) data.append("audio_fichier",  audioFichier);

    try {
      const url    = modal === "add" ? `/api/avis/admin/ajouter/` : `/api/avis/admin/${selected.id}/modifier/`;
      const method = modal === "add" ? "POST" : "PATCH";
      const res    = await fetch(url, {
        method,
        headers: { "Authorization": `Bearer ${token}` },
        body: data,
      });
      if (res.ok) {
        toast(modal === "add" ? "Témoignage ajouté" : "Modifié", "success");
        setModal(null); fetchTemos();
      } else {
        const d = await res.json();
        toast(d.detail || "Erreur", "error");
      }
    } catch { toast("Erreur serveur", "error"); }
    setSaving(false);
  }

  async function action(id, type) {
    const res = await fetch(`${API_BASE}/api/avis/admin/${id}/${type}/`, {
      method:"POST", headers:{ "Authorization": `Bearer ${token}` }
    });
    if (res.ok) { fetchTemos(); setModal(null); toast(type==="approuver"?"Approuvé":"Refusé", type==="approuver"?"success":"error"); }
  }

  async function supprimer(id) {
    if (!confirm("Supprimer ce témoignage ?")) return;
    const res = await fetch(`${API_BASE}/api/avis/admin/${id}/supprimer/`, {
      method:"DELETE", headers:{ "Authorization": `Bearer ${token}` }
    });
    if (res.status === 204) { fetchTemos(); setModal(null); toast("Supprimé", "error"); }
  }

  const filtered = temos.filter(t => typeFilter === "tout" || t.type_temo === typeFilter);

  const inputStyle = { width:"100%", padding:"10px 14px", background:"rgba(255,255,255,.04)", border:"1px solid var(--border)", borderRadius:"3px", color:"var(--text)", fontFamily:"var(--ff-b)", fontSize:".82rem", fontWeight:300, outline:"none" };

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600 }}>Témoignages</h2>
        <button className="admin-btn admin-btn-primary" onClick={openAdd}>+ Ajouter</button>
      </div>

      {/* Filtres statut */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"12px", flexWrap:"wrap" }}>
        {[["en_attente","En attente"],["approuve","Approuvés"],["refuse","Refusés"]].map(([val,label]) => (
          <button key={val} onClick={()=>setFilter(val)} className="admin-btn"
            style={{ background:filter===val?"var(--rose)":"rgba(255,255,255,.05)", color:filter===val?"#fff":"var(--text-sub)", padding:"8px 16px" }}>
            {label}
          </button>
        ))}
      </div>

      {/* Filtres type */}
      <div style={{ display:"flex", gap:"6px", marginBottom:"20px" }}>
        {[["tout","Tous"],["texte","Texte"],["video","Vidéo"],["audio","Audio"]].map(([val,label]) => (
          <button key={val} onClick={()=>setTypeFilter(val)} className="admin-btn"
            style={{ background:typeFilter===val&&!showMasterclass?"var(--or)":"rgba(255,255,255,.03)", color:typeFilter===val&&!showMasterclass?"var(--noir)":"var(--text-sub)", padding:"7px 14px", fontSize:".65rem", border:`1px solid ${typeFilter===val&&!showMasterclass?"var(--or)":"var(--border)"}` }} onClick={()=>{ setTypeFilter(val); setShowMasterclass(false); }}>
            {label}
          </button>
        ))}
      </div>

      {/* Liste */}
      {loading ? (
        <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}}/></div>
      ) : filtered.length === 0 ? (
        <p style={{ textAlign:"center", color:"var(--text-sub)", padding:"40px", fontStyle:"italic" }}>Aucun témoignage.</p>
      ) : filtered.map(t => (
        <div key={t.id} className="row-item" style={{ flexDirection:"column", alignItems:"stretch" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"8px" }}>
            <div style={{ display:"flex", gap:"8px", alignItems:"center", flexWrap:"wrap" }}>
              <p style={{ fontFamily:"var(--ff-b)", fontWeight:600, fontSize:".85rem" }}>{t.prenom}</p>
              {t.pays && <span style={{ fontSize:".72rem", color:"var(--text-sub)" }}>· {t.pays}</span>}
              <span className="badge" style={{ background:`${TYPE_COLORS[t.type_temo]}15`, color:TYPE_COLORS[t.type_temo], border:`1px solid ${TYPE_COLORS[t.type_temo]}30`, fontSize:".58rem", padding:"3px 8px" }}>
                {TYPES[t.type_temo]}
              </span>
              {t.formule && <span className="badge badge-or" style={{fontSize:".58rem"}}>{FORMULES[t.formule]||t.formule}</span>}
              {t.en_vedette && <span className="badge badge-rose" style={{fontSize:".58rem"}}>Vedette</span>}
              {t.video_fichier && <span className="badge" style={{background:"rgba(168,200,224,.1)",color:"#A8C8E0",border:"1px solid rgba(168,200,224,.2)",fontSize:".58rem"}}>Fichier vidéo</span>}
              {t.audio_fichier && <span className="badge" style={{background:"rgba(194,24,91,.1)",color:"var(--rose)",border:"1px solid rgba(194,24,91,.2)",fontSize:".58rem"}}>Fichier audio</span>}
            </div>
            <span style={{ fontSize:".85rem", color:"#C9A96A", flexShrink:0 }}>{"★".repeat(t.note||0)}{"☆".repeat(5-(t.note||0))}</span>
          </div>

          {/* Aperçu contenu selon type */}
          {t.type_temo === "texte" && t.texte && (
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".82rem", color:"var(--text-sub)", lineHeight:1.6, marginBottom:"10px", overflow:"hidden", display:"-webkit-box", WebkitLineClamp:2, WebkitBoxOrient:"vertical" }}>
              {t.texte}
            </p>
          )}
          {t.type_temo === "video" && t.video_url && (
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".78rem", color:"#A8C8E0", marginBottom:"10px" }}>
              Lien : {t.video_url}
            </p>
          )}
          {t.type_temo === "audio" && t.audio_fichier && (
            <audio controls src={t.audio_fichier} style={{ width:"100%", height:"32px", marginBottom:"10px" }}/>
          )}

          <div style={{ display:"flex", gap:"6px", flexWrap:"wrap" }}>
            <button className="admin-btn admin-btn-secondary" onClick={()=>openEdit(t)} style={{padding:"6px 14px"}}>Modifier</button>
            {t.statut === "en_attente" && <>
              <button className="admin-btn admin-btn-success" onClick={()=>action(t.id,"approuver")} style={{padding:"6px 14px"}}>Approuver</button>
              <button className="admin-btn admin-btn-danger"  onClick={()=>action(t.id,"refuser")}   style={{padding:"6px 14px"}}>Refuser</button>
            </>}
            <button className="admin-btn admin-btn-danger" onClick={()=>supprimer(t.id)} style={{padding:"6px 10px",marginLeft:"auto"}}>Supprimer</button>
          </div>
        </div>
      ))}

      {/* Modal Ajout/Édition */}
      {modal && (
        <div className="modal-overlay" onClick={()=>setModal(null)}>
          <div className="modal-box admin-modal" onClick={e=>e.stopPropagation()} style={{ maxWidth:"660px", maxHeight:"90vh", overflowY:"auto" }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"20px" }}>
              <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.2rem" }}>
                {modal === "add" ? "Ajouter un témoignage" : "Modifier le témoignage"}
              </h3>
              <button onClick={()=>setModal(null)} style={{background:"none",border:"none",color:"var(--text-sub)",fontSize:"1.2rem",cursor:"pointer"}}>X</button>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:"14px" }}>

              {/* Type de témoignage */}
              <div>
                <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"8px" }}>Type de témoignage</label>
                <div style={{ display:"flex", gap:"8px" }}>
                  {Object.entries(TYPES).map(([val,label]) => (
                    <button key={val} onClick={()=>setForm(f=>({...f,type_temo:val}))} style={{
                      flex:1, padding:"10px", border:`1px solid ${form.type_temo===val?TYPE_COLORS[val]:"var(--border)"}`,
                      borderRadius:"3px", background:form.type_temo===val?`${TYPE_COLORS[val]}15`:"transparent",
                      color:form.type_temo===val?TYPE_COLORS[val]:"var(--text-sub)",
                      fontFamily:"var(--ff-b)", fontSize:".75rem", fontWeight:600, cursor:"pointer", transition:"all .25s",
                    }}>{label}</button>
                  ))}
                </div>
              </div>

              {/* Nom + Pays */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Prénom *</label>
                  <input style={inputStyle} value={form.prenom||""} onChange={e=>setForm(f=>({...f,prenom:e.target.value}))} placeholder="Prénom"/>
                </div>
                <div>
                  <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Pays</label>
                  <input style={inputStyle} value={form.pays||""} onChange={e=>setForm(f=>({...f,pays:e.target.value}))} placeholder="Pays"/>
                </div>
              </div>

              {/* Formule + Note */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Formule</label>
                  <select style={inputStyle} value={form.formule||""} onChange={e=>setForm(f=>({...f,formule:e.target.value}))}>
                    <option value="">— Aucune —</option>
                    {Object.entries(FORMULES).map(([k,v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"8px" }}>Note</label>
                  <div style={{ display:"flex", gap:"4px" }}>
                    {[1,2,3,4,5].map(n => (
                      <button key={n} onClick={()=>setForm(f=>({...f,note:n}))} style={{ background:"none", border:"none", cursor:"pointer", fontSize:"1.3rem", color:n<=(form.note||0)?"#C9A96A":"rgba(255,255,255,.15)", padding:"2px", transition:"color .2s" }}>★</button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Contenu selon type */}
              {form.type_temo === "texte" && (
                <div>
                  <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Témoignage *</label>
                  <textarea style={{...inputStyle, resize:"vertical", minHeight:"120px"}} value={form.texte||""} onChange={e=>setForm(f=>({...f,texte:e.target.value}))} placeholder="Texte du témoignage..."/>
                </div>
              )}

              {form.type_temo === "video" && (
                <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                  <div>
                    <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Lien vidéo (YouTube, TikTok...)</label>
                    <input style={inputStyle} type="url" value={form.video_url||""} onChange={e=>setForm(f=>({...f,video_url:e.target.value}))} placeholder="https://youtube.com/..."/>
                  </div>
                  <div>
                    <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>
                      Ou uploader un fichier vidéo
                    </label>
                    <label style={{ display:"block", padding:"12px", background:"rgba(168,200,224,.06)", border:"1px dashed rgba(168,200,224,.3)", borderRadius:"4px", cursor:"pointer", textAlign:"center", fontFamily:"var(--ff-b)", fontSize:".72rem", color:"#A8C8E0" }}>
                      {videoFichier ? videoFichier.name : selected?.video_fichier ? "Fichier existant — cliquer pour changer" : "Choisir un fichier vidéo (MP4, MOV...)"}
                      <input type="file" accept="video/*" style={{ display:"none" }} onChange={e=>setVideoFichier(e.target.files[0])}/>
                    </label>
                  </div>
                  <div>
                    <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Commentaire (optionnel)</label>
                    <textarea style={{...inputStyle, resize:"vertical", minHeight:"80px"}} value={form.texte||""} onChange={e=>setForm(f=>({...f,texte:e.target.value}))} placeholder="Description ou commentaire sur la vidéo..."/>
                  </div>
                </div>
              )}

              {form.type_temo === "audio" && (
                <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                  <div>
                    <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>
                      Fichier audio *
                    </label>
                    <label style={{ display:"block", padding:"16px", background:"rgba(194,24,91,.06)", border:"1px dashed rgba(194,24,91,.3)", borderRadius:"4px", cursor:"pointer", textAlign:"center", fontFamily:"var(--ff-b)", fontSize:".72rem", color:"var(--rose)" }}>
                      {audioFichier ? audioFichier.name : selected?.audio_fichier ? "Fichier existant — cliquer pour changer" : "Choisir un fichier audio (MP3, WAV, M4A...)"}
                      <input type="file" accept="audio/*" style={{ display:"none" }} onChange={e=>setAudioFichier(e.target.files[0])}/>
                    </label>
                    {/* Aperçu audio existant */}
                    {selected?.audio_fichier && !audioFichier && (
                      <audio controls src={selected.audio_fichier} style={{ width:"100%", marginTop:"8px", height:"36px" }}/>
                    )}
                  </div>
                  <div>
                    <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Commentaire (optionnel)</label>
                    <textarea style={{...inputStyle, resize:"vertical", minHeight:"80px"}} value={form.texte||""} onChange={e=>setForm(f=>({...f,texte:e.target.value}))} placeholder="Description ou commentaire sur l'audio..."/>
                  </div>
                </div>
              )}

              {/* Photos avant/après — pour tous les types */}
              <div>
                <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"10px" }}>
                  Photos avant / après <span style={{opacity:.5,fontWeight:300,textTransform:"none",letterSpacing:0}}>(optionnel)</span>
                </label>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                  {[
                    { label:"Avant", current:selected?.photo_avant, setter:setPhotoAvant, file:photoAvant },
                    { label:"Après", current:selected?.photo_apres, setter:setPhotoApres, file:photoApres },
                  ].map(({label,current,setter,file}) => (
                    <label key={label} style={{ cursor:"pointer" }}>
                      <div style={{ aspectRatio:"1", background:"rgba(255,255,255,.03)", border:`1px dashed ${file||current?"rgba(201,169,106,.3)":"rgba(255,255,255,.1)"}`, borderRadius:"4px", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
                        {(file||current) ? (
                          <img src={file ? URL.createObjectURL(file) : current} alt={label} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                        ) : (
                          <div style={{ textAlign:"center", padding:"12px" }}>
                            <p style={{ fontFamily:"var(--ff-b)", fontSize:".72rem", color:"rgba(255,255,255,.3)", marginBottom:"4px" }}>{label}</p>
                            <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", color:"rgba(255,255,255,.2)" }}>Cliquer pour ajouter</p>
                          </div>
                        )}
                      </div>
                      <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>setter(e.target.files[0])}/>
                    </label>
                  ))}
                </div>
              </div>

              {/* Options */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"12px" }}>
                <div>
                  <label style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" }}>Statut</label>
                  <select style={inputStyle} value={form.statut||"en_attente"} onChange={e=>setForm(f=>({...f,statut:e.target.value}))}>
                    <option value="en_attente">En attente</option>
                    <option value="approuve">Approuvé</option>
                    <option value="refuse">Refusé</option>
                  </select>
                </div>
                <div style={{ display:"flex", alignItems:"center", gap:"10px", paddingTop:"24px" }}>
                  <input type="checkbox" id="vedette" checked={form.en_vedette||false} onChange={e=>setForm(f=>({...f,en_vedette:e.target.checked}))} style={{accentColor:"var(--rose)"}}/>
                  <label htmlFor="vedette" style={{ fontFamily:"var(--ff-b)", fontSize:".82rem", color:"var(--text-sub)", cursor:"pointer" }}>Mettre en vedette</label>
                </div>
              </div>

              {/* Boutons */}
              <div style={{ display:"flex", gap:"10px", marginTop:"8px" }}>
                <button className="admin-btn admin-btn-primary" onClick={save} disabled={saving} style={{ flex:1, padding:"13px", opacity:saving?.7:1 }}>
                  {saving ? "Enregistrement..." : modal === "add" ? "Ajouter" : "Enregistrer"}
                </button>
                <button className="admin-btn admin-btn-secondary" onClick={()=>setModal(null)} style={{ flex:1, padding:"13px" }}>Annuler</button>
              </div>

              {/* Actions rapides */}
              {modal === "edit" && selected && (
                <div style={{ display:"flex", gap:"8px", paddingTop:"12px", borderTop:"1px solid var(--border)" }}>
                  {selected.statut === "en_attente" && <>
                    <button className="admin-btn admin-btn-success" onClick={()=>action(selected.id,"approuver")} style={{flex:1,padding:"10px"}}>Approuver</button>
                    <button className="admin-btn admin-btn-danger"  onClick={()=>action(selected.id,"refuser")}   style={{flex:1,padding:"10px"}}>Refuser</button>
                  </>}
                  <button className="admin-btn admin-btn-danger" onClick={()=>supprimer(selected.id)} style={{padding:"10px 16px"}}>Supprimer</button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ── RESSOURCES ADMIN — Chanson + Guide PDF ─────────────────── */

export { TemoignagesView };


function TemoignagesMasterclassAdminView({ toast }) {
  const API_BASE = import.meta.env.VITE_API_URL || "https://metamorphose-backend.onrender.com";
  const token = localStorage.getItem("mmorphose_token");
  const [temos, setTemos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ prenom:"", texte:"" });
  const [photo, setPhoto] = useState(null);
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(null);

  useEffect(() => { charger(); }, []);

  async function charger() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/masterclass/temoignages/`);
      const data = await res.json();
      setTemos(Array.isArray(data) ? data : []);
    } catch { toast("Erreur chargement", "error"); }
    setLoading(false);
  }

  async function ajouter() {
    if (!form.prenom.trim()) { toast("Prénom requis", "error"); return; }
    if (!photo) { toast("Photo requise", "error"); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("prenom", form.prenom);
      fd.append("texte", form.texte);
      fd.append("photo", photo);
      const res = await fetch(`${API_BASE}/api/masterclass/temoignages/ajouter/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        toast("Témoignage ajouté", "success");
        setForm({ prenom:"", texte:"" });
        setPhoto(null);
        setPreview(null);
        charger();
      } else { toast("Erreur lors de l'ajout", "error"); }
    } catch { toast("Erreur réseau", "error"); }
    setSaving(false);
  }

  async function supprimer(id) {
    if (!window.confirm("Supprimer ce témoignage ?")) return;
    await fetch(`${API_BASE}/api/masterclass/temoignages/${id}/supprimer/`, {
      method: "DELETE",
      headers: { "Authorization": `Bearer ${token}` },
    });
    toast("Supprimé", "success");
    charger();
  }

  const inp = { width:"100%", padding:"10px 14px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"3px", color:"var(--text)", fontFamily:"var(--ff-b)", fontSize:".82rem", outline:"none", boxSizing:"border-box" };
  const lbl = { fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".14em", textTransform:"uppercase", color:"var(--text-sub)", display:"block", marginBottom:"6px" };

  return (
    <div style={{ marginTop:"32px", paddingTop:"28px", borderTop:"2px solid rgba(194,24,91,.3)" }}>
      <p style={{ fontFamily:"var(--ff-b)", fontSize:".72rem", fontWeight:600, letterSpacing:".15em", textTransform:"uppercase", color:"var(--rose)", marginBottom:"20px" }}>
        Témoignages Masterclass — Photos des métamorphosées
      </p>
      <div style={{ padding:"20px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"6px", marginBottom:"24px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"180px 1fr", gap:"20px", alignItems:"start" }}>
          <label style={{ cursor:"pointer" }}>
            <div style={{ aspectRatio:"3/4", background:"rgba(255,255,255,.03)", border:`1px dashed ${preview?"rgba(201,169,106,.4)":"rgba(255,255,255,.12)"}`, borderRadius:"4px", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
              {preview ? (
                <img src={preview} alt="preview" style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }}/>
              ) : (
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", color:"rgba(255,255,255,.3)", textAlign:"center", padding:"12px" }}>Cliquer pour ajouter photo</p>
              )}
            </div>
            <input type="file" accept="image/*" style={{ display:"none" }} onChange={e=>{ const file=e.target.files[0]; if(file){setPhoto(file);setPreview(URL.createObjectURL(file));} }}/>
          </label>
          <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
            <div><label style={lbl}>Prénom *</label><input style={inp} type="text" placeholder="Ex: Georgine" value={form.prenom} onChange={e=>setForm(p=>({...p,prenom:e.target.value}))}/></div>
            <div><label style={lbl}>Texte du témoignage</label><textarea style={{...inp,minHeight:"100px",resize:"vertical"}} placeholder="Son témoignage…" value={form.texte} onChange={e=>setForm(p=>({...p,texte:e.target.value}))}/></div>
            <button onClick={ajouter} disabled={saving} style={{ padding:"10px 20px", background:"var(--rose)", border:"none", borderRadius:"3px", color:"#fff", fontFamily:"var(--ff-b)", fontSize:".72rem", fontWeight:600, cursor:"pointer", opacity:saving?0.6:1, alignSelf:"flex-start" }}>
              {saving ? "Ajout…" : "+ Ajouter"}
            </button>
          </div>
        </div>
      </div>
      {loading ? <p style={{ color:"var(--text-sub)", fontSize:".82rem" }}>Chargement…</p> : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))", gap:"16px" }}>
          {temos.map(t => (
            <div key={t.id} style={{ background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"6px", overflow:"hidden" }}>
              <div style={{ aspectRatio:"3/4", overflow:"hidden" }}>
                {t.photo ? <img src={t.photo} alt={t.prenom} style={{ width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }}/> : <div style={{ width:"100%", height:"100%", background:"rgba(255,255,255,.03)", display:"flex", alignItems:"center", justifyContent:"center" }}><p style={{ color:"rgba(255,255,255,.2)", fontSize:".7rem" }}>Pas de photo</p></div>}
              </div>
              <div style={{ padding:"10px" }}>
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".8rem", fontWeight:600, color:"var(--text)", marginBottom:"4px" }}>{t.prenom}</p>
                {t.texte && <p style={{ fontFamily:"var(--ff-b)", fontSize:".7rem", color:"var(--text-sub)", lineHeight:1.5, marginBottom:"8px" }}>{t.texte}</p>}
                <button onClick={()=>supprimer(t.id)} style={{ padding:"5px 10px", background:"rgba(194,24,91,.1)", border:"1px solid rgba(194,24,91,.3)", borderRadius:"3px", color:"var(--rose)", fontFamily:"var(--ff-b)", fontSize:".6rem", cursor:"pointer" }}>Supprimer</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
