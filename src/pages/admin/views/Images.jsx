import { useState, useEffect } from 'react';

const API_BASE = import.meta.env.VITE_API_URL || '';
function ImagesView({ api, toast, refreshKey = 0 }) {
  const [uploading, setUploading] = useState({});
  const [previews,  setPreviews]  = useState({});
  const [configs,   setConfigs]   = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("mmorphose_token");
    fetch(`${API_BASE}/api/admin/config/`, { headers: { "Authorization": `Bearer ${token}` } })
      .then(r => r.ok ? r.json() : [])
      .then(d => {
      if (d) {
        const imgs = d.filter(c => c.section === "images" || c.section === "slides" || c.section === "masterclass");
        const prev = {};
        imgs.forEach(c => { if (c.valeur) prev[c.cle] = c.valeur; });
        setConfigs(imgs);
        setPreviews(prev);
      }
    });
  }, [refreshKey]);

  const imageFields = [
    { cle:"photo_prelia",     label:"Photo de Prélia",        desc:"Portrait principal affiché dans la section À Propos",    ratio:"3/4" },
    { cle:"logo_site",        label:"Logo Meta'Morph'Ose",    desc:"Logo principal du site (format PNG transparent recommandé)", ratio:"3/1" },
    { cle:"logo_white_black", label:"Logo White & Black",     desc:"Logo de la marque White & Black",                        ratio:"3/1" },
    { cle:"favicon",          label:"Favicon",                desc:"Icône du site dans l'onglet navigateur (32x32px)",        ratio:"1/1" },
  ];
  const slideFields = [
    { cle:"slide_1", label:"Slide 1", desc:"Première image du diaporama hero" },
    { cle:"slide_2", label:"Slide 2", desc:"Deuxième image du diaporama hero" },
    { cle:"slide_3", label:"Slide 3", desc:"Troisième image du diaporama hero" },
    { cle:"slide_4", label:"Slide 4", desc:"Quatrième image du diaporama hero" },
    { cle:"slide_5", label:"Slide 5", desc:"Cinquième image du diaporama hero" },
  ];

  async function handleUpload(cle, file) {
    if (!file) return;

    // Vérifications
    if (file.size > 5 * 1024 * 1024) {
      toast("Fichier trop lourd (max 5MB)", "error");
      return;
    }
    if (!file.type.startsWith("image/")) {
      toast("Seules les images sont acceptées", "error");
      return;
    }

    setUploading(u => ({ ...u, [cle]: true }));

    // Convertir en base64 pour prévisualisation immédiate
    const reader = new FileReader();
    reader.onload = async (e) => {
      const base64 = e.target.result;
      setPreviews(p => ({ ...p, [cle]: base64 }));

      // Envoyer au backend via FormData
      const token = localStorage.getItem("mmorphose_token")
      const formData = new FormData();
      formData.append("fichier", file);
      formData.append("cle", cle);
      formData.append("section", cle.startsWith("slide_") ? "slides" : "images");

      try {
        const res = await fetch(`${API_BASE}/api/admin/images/upload/`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}` },
          body: formData,
        });
        if (res.ok) {
          const data = await res.json();
          setPreviews(p => ({ ...p, [cle]: data.url }));
          toast(`${cle} mis à jour`, "success");
        } else {
          // Fallback : sauvegarder l'URL base64 directement en config
          await api("POST", "/config/update/", { cle, valeur: base64, section: cle.startsWith("slide_") ? "slides" : "images" });
          toast("Image sauvegardée", "success");
        }
      } catch {
        // En dev sans endpoint upload, sauvegarder base64
        await api("POST", "/config/update/", { cle, valeur: base64, section: "images" });
        toast("Image sauvegardée en local", "success");
      }
      setUploading(u => ({ ...u, [cle]: false }));
    };
    reader.readAsDataURL(file);
  }

  async function removeImage(cle) {
    if (!confirm("Supprimer cette image ?")) return;
    await api("POST", "/config/update/", { cle, valeur: "", section: "images" });
    setPreviews(p => ({ ...p, [cle]: "" }));
    toast("Image supprimée", "success");
  }

  return (
    <div>
      <div style={{ marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600, marginBottom:"8px" }}>Photos et Logos</h2>
        <p style={{ fontSize:".82rem", color:"var(--text-sub)", fontWeight:300 }}>
          Gérez les images affichées sur le site. Les modifications sont appliquées immédiatement.
        </p>
      </div>

      {/* Section Diaporama */}
      <div style={{ marginBottom:"32px" }}>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--or)", marginBottom:"8px" }}>
          Diaporama Hero
        </p>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".78rem", fontWeight:300, color:"var(--text-sub)", marginBottom:"16px", lineHeight:1.6 }}>
          Jusqu'à 5 images qui défileront en arrière-plan. Si vide, des dégradés élégants sont utilisés.
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(5,1fr)", gap:"12px" }}>
          {slideFields.map((field) => (
            <div key={field.cle} style={{ position:"relative" }}>
              <div style={{ width:"100%", aspectRatio:"16/9", background:"rgba(255,255,255,.04)", border:`1px dashed ${previews[field.cle]?"rgba(201,169,106,.3)":"rgba(255,255,255,.1)"}`, borderRadius:"4px", overflow:"hidden", display:"flex", alignItems:"center", justifyContent:"center" }}>
                {previews[field.cle] ? (
                  <img src={previews[field.cle]} alt={field.label} style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                ) : (
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", color:"rgba(255,255,255,.2)", textAlign:"center", padding:"8px" }}>{field.label}</p>
                )}
              </div>
              {previews[field.cle] && (
                <button onClick={() => removeImage(field.cle)} style={{ position:"absolute", top:"4px", right:"4px", background:"rgba(239,83,80,.85)", color:"#fff", border:"none", borderRadius:"2px", cursor:"pointer", fontFamily:"var(--ff-b)", fontSize:".55rem", fontWeight:600, padding:"3px 6px" }}>X</button>
              )}
              <label style={{ display:"block", marginTop:"6px", textAlign:"center", padding:"7px", background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)", borderRadius:"3px", cursor:uploading[field.cle]?"not-allowed":"pointer", fontFamily:"var(--ff-b)", fontSize:".6rem", fontWeight:500, letterSpacing:".08em", textTransform:"uppercase", color:uploading[field.cle]?"var(--text-sub)":"var(--or)" }}>
                {uploading[field.cle] ? "..." : previews[field.cle] ? "Changer" : "Ajouter"}
                <input type="file" accept="image/*" style={{ display:"none" }} disabled={uploading[field.cle]} onChange={e => handleUpload(field.cle, e.target.files[0])}/>
              </label>
            </div>
          ))}
        </div>
      </div>


      {/* Logos et Photos */}
      <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--or)", marginBottom:"16px" }}>Logos et Photos</p>
      <div className="img-grid" style={{ display:"flex", flexDirection:"column", gap:"20px" }}>
        {imageFields.map((field) => (
          <div key={field.cle} style={{ padding:"24px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"6px", display:"grid", gridTemplateColumns:"200px 1fr", gap:"28px", alignItems:"center" }}>

            {/* Prévisualisation */}
            <div style={{ position:"relative" }}>
              <div style={{
                width:"100%", aspectRatio: field.ratio,
                background:"rgba(255,255,255,.04)",
                border:`1px dashed ${previews[field.cle] ? "rgba(201,169,106,.3)" : "rgba(255,255,255,.1)"}`,
                borderRadius:"4px", overflow:"hidden",
                display:"flex", alignItems:"center", justifyContent:"center",
              }}>
                {previews[field.cle] ? (
                  <img src={previews[field.cle]} alt={field.label}
                    style={{ width:"100%", height:"100%", objectFit:"cover" }}/>
                ) : (
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", color:"rgba(255,255,255,.2)", textAlign:"center", padding:"12px" }}>
                    Aucune image
                  </p>
                )}
              </div>
              {previews[field.cle] && (
                <button onClick={() => removeImage(field.cle)} style={{
                  position:"absolute", top:"6px", right:"6px",
                  background:"rgba(239,83,80,.85)", color:"#fff",
                  border:"none", borderRadius:"3px", cursor:"pointer",
                  fontFamily:"var(--ff-b)", fontSize:".6rem",
                  fontWeight:600, padding:"4px 8px",
                }}>
                  Supprimer
                </button>
              )}
            </div>

            {/* Infos + upload */}
            <div>
              <p style={{ fontFamily:"var(--ff-b)", fontSize:".85rem", fontWeight:600, color:"var(--text)", marginBottom:"4px" }}>{field.label}</p>
              <p style={{ fontFamily:"var(--ff-b)", fontSize:".75rem", fontWeight:300, color:"var(--text-sub)", marginBottom:"16px", lineHeight:1.6 }}>{field.desc}</p>

              <label style={{
                display:"inline-flex", alignItems:"center", justifyContent:"center",
                padding:"10px 20px",
                background: uploading[field.cle] ? "rgba(255,255,255,.04)" : "rgba(194,24,91,.1)",
                border:`1px solid ${uploading[field.cle] ? "var(--border)" : "rgba(194,24,91,.3)"}`,
                borderRadius:"3px", cursor: uploading[field.cle] ? "not-allowed" : "pointer",
                fontFamily:"var(--ff-b)", fontSize:".7rem", fontWeight:600,
                letterSpacing:".1em", textTransform:"uppercase",
                color: uploading[field.cle] ? "var(--text-sub)" : "var(--rose)",
                transition:"all .3s",
              }}>
                {uploading[field.cle] ? "Chargement..." : previews[field.cle] ? "Changer l'image" : "Choisir une image"}
                <input
                  type="file" accept="image/*"
                  style={{ display:"none" }}
                  disabled={uploading[field.cle]}
                  onChange={e => handleUpload(field.cle, e.target.files[0])}
                />
              </label>

              {previews[field.cle] && (
                <div style={{ marginTop:"12px" }}>
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".1em", textTransform:"uppercase", color:"rgba(76,175,80,.7)" }}>
                    Image active
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:"24px", padding:"20px", background:"rgba(201,169,106,.04)", border:"1px dashed rgba(201,169,106,.2)", borderRadius:"4px" }}>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".75rem", color:"var(--text-sub)", lineHeight:1.7 }}>
          <strong style={{ color:"var(--or)" }}>Note :</strong> Les images sont sauvegardées et affichées immédiatement sur le site.
          Formats acceptés : JPG, PNG, WebP. Taille maximale : 5MB.
          Pour les logos, privilégiez le format PNG avec fond transparent.
        </p>
      </div>
    </div>
  );
}



/* ── CARTES CADEAUX ─────────────────────────────────────────── */

export { ImagesView };
