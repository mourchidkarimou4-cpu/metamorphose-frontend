import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
function CartesView({ api, toast }) {
  const [cartes,   setCartes]   = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);
  const [filter,   setFilter]   = useState("tout");

  useEffect(() => {
    fetch(`/api/cadeaux/admin/liste/`, {
      headers: { "Authorization": `Bearer ${localStorage.getItem("mmorphose_token")}` }
    })
    .then(r => { if (r.status === 401) { window.location.href="/espace-membre"; return null; } return r.json(); })
    .then(d => { if(d && Array.isArray(d)) setCartes(d); setLoading(false); })
    .catch(() => setLoading(false));
  }, []);

  async function activer(c) {
    const res = await fetch(`/api/cadeaux/admin/${c.id}/activer/`, {
      method:"POST",
      headers:{ "Authorization": `Bearer ${localStorage.getItem("mmorphose_token")}`, "Content-Type":"application/json" }
    });
    if (res.status === 401) { window.location.href="/espace-membre"; return; }
    if (res.ok) {
      setCartes(p => p.map(x => x.id===c.id ? {...x, statut:"payee"} : x));
      toast("Carte activée", "success");
    }
  }

  async function marquerUtilisee(c) {
    const res = await fetch(`/api/cadeaux/admin/${c.id}/utiliser/`, {
      method:"POST",
      headers:{ "Authorization": `Bearer ${localStorage.getItem("mmorphose_token")}`, "Content-Type":"application/json" }
    });
    if (res.status === 401) { window.location.href="/espace-membre"; return; }
    if (res.ok) {
      setCartes(p => p.map(x => x.id===c.id ? {...x, statut:"utilisee"} : x));
      toast("Carte marquée utilisée", "success");
      setSelected(null);
    }
  }

  const STATUT_COLORS = { en_attente:"var(--or)", payee:"var(--green)", utilisee:"rgba(248,245,242,.3)", expiree:"#ef5350" };
  const FORMULES_LABELS = { F1:"Live · Groupe", F2:"Live · Privé", F3:"Présentiel · Groupe", F4:"Présentiel · Privé" };

  const filtered = filter === "tout" ? cartes : cartes.filter(c => c.statut === filter);

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600 }}>Cartes Cadeaux</h2>
        <div style={{ display:"flex", gap:"8px" }}>
          {[["tout","Toutes"],["en_attente","En attente"],["payee","Actives"],["utilisee","Utilisées"]].map(([val,label]) => (
            <button key={val} onClick={()=>setFilter(val)} className="admin-btn"
              style={{ background:filter===val?"var(--rose)":"rgba(255,255,255,.05)", color:filter===val?"#fff":"var(--text-sub)", padding:"8px 14px", fontSize:".65rem" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Stats rapides */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px", marginBottom:"24px" }}>
        {[
          { label:"Total",       value: cartes.length,                                color:"var(--or)" },
          { label:"En attente",  value: cartes.filter(c=>c.statut==="en_attente").length, color:"var(--or)" },
          { label:"Actives",     value: cartes.filter(c=>c.statut==="payee").length,      color:"var(--green)" },
          { label:"Utilisées",   value: cartes.filter(c=>c.statut==="utilisee").length,   color:"rgba(248,245,242,.3)" },
        ].map((s,i) => (
          <div key={i} style={{ padding:"16px", background:"var(--surface2)", border:"1px solid var(--border)", borderRadius:"4px", textAlign:"center" }}>
            <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.8rem", fontWeight:700, color:s.color, marginBottom:"4px" }}>{s.value}</p>
            <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".12em", textTransform:"uppercase", color:"var(--text-sub)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {loading ? <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}}/></div> : (
        filtered.map(c => (
          <div key={c.id} className="row-item" style={{ cursor:"pointer" }} onClick={()=>setSelected(c)}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:"10px", alignItems:"center", marginBottom:"4px", flexWrap:"wrap" }}>
                <p style={{ fontFamily:"var(--ff-b)", fontWeight:600, fontSize:".85rem", color:"var(--text)", letterSpacing:".08em" }}>{c.code}</p>
                <span className="badge" style={{ background:`${STATUT_COLORS[c.statut]}15`, color:STATUT_COLORS[c.statut], border:`1px solid ${STATUT_COLORS[c.statut]}30`, fontSize:".58rem" }}>
                  {c.statut.replace("_"," ")}
                </span>
                <span className="badge badge-or">{FORMULES_LABELS[c.formule]}</span>
              </div>
              <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".75rem", color:"var(--text-sub)" }}>
                Pour : <strong style={{color:"var(--text)"}}>{c.destinataire_nom}</strong> · De : {c.acheteur_nom} · {new Date(c.date_creation).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div style={{ display:"flex", gap:"8px" }}>
              {c.statut === "en_attente" && (
                <button className="admin-btn admin-btn-success" onClick={e=>{e.stopPropagation();activer(c)}} style={{padding:"7px 14px"}}>
                  Activer
                </button>
              )}
              {/* Bouton marquer utilisée uniquement dans la modal détail */}
            </div>
          </div>
        ))
      )}

      {!loading && filtered.length === 0 && (
        <p style={{ textAlign:"center", color:"var(--text-sub)", padding:"40px", fontStyle:"italic" }}>Aucune carte dans cette catégorie.</p>
      )}

      {/* Modal détail */}
      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal-box admin-modal" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"20px" }}>
              <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.2rem" }}>{selected.code}</h3>
              <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:"var(--text-sub)",fontSize:"1.2rem",cursor:"pointer"}}>X</button>
            </div>
            {[
              ["Formule",      FORMULES_LABELS[selected.formule]],
              ["Destinataire", selected.destinataire_nom],
              ["Email dest.",  selected.destinataire_email || "—"],
              ["Acheteur",     selected.acheteur_nom],
              ["Email achet.", selected.acheteur_email],
              ["WhatsApp",     selected.acheteur_tel || "—"],
              ["Occasion",     selected.occasion || "—"],
              ["Statut",       selected.statut],
              ["Expiration",   selected.date_expiration || "—"],
              ["Commandée le", new Date(selected.date_creation).toLocaleDateString("fr-FR")],
            ].map(([l,v]) => (
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"9px 0", borderBottom:"1px solid var(--border)", fontFamily:"var(--ff-b)", fontSize:".82rem" }}>
                <span style={{ color:"var(--text-sub)", fontWeight:300 }}>{l}</span>
                <span style={{ color:"var(--text)", fontWeight:400 }}>{v}</span>
              </div>
            ))}
            {selected.message_perso && (
              <div style={{ marginTop:"14px", padding:"12px", background:"rgba(255,255,255,.03)", borderRadius:"3px" }}>
                <p style={{ fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--or)", marginBottom:"6px" }}>Message personnel</p>
                <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.65)", fontStyle:"italic", lineHeight:1.65 }}>"{selected.message_perso}"</p>
              </div>
            )}
            {/* QR Code */}
            {(selected.statut === "payee" || selected.statut === "en_attente") && (
              <div style={{ marginTop:"20px", padding:"20px", background:"rgba(255,255,255,.03)", border:"1px solid var(--border)", borderRadius:"4px", textAlign:"center" }}>
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".2em", textTransform:"uppercase", color:"var(--or)", marginBottom:"14px" }}>
                  QR Code de vérification
                </p>
                <div style={{ background:"#fff", padding:"16px", borderRadius:"4px", display:"inline-block", marginBottom:"12px" }}>
                  <QRCodeSVG
                    value={`${window.location.origin}/carte/${selected.code}`}
                    size={160}
                    bgColor="#ffffff"
                    fgColor="#0A0A0A"
                    level="H"
                    includeMargin={false}
                  />
                </div>
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".7rem", letterSpacing:".15em", color:"var(--text-sub)", marginBottom:"4px" }}>
                  {selected.code}
                </p>
                <p style={{ fontFamily:"var(--ff-b)", fontSize:".68rem", fontWeight:300, color:"rgba(248,245,242,.3)", lineHeight:1.6 }}>
                  Scanner pour vérifier et activer en temps réel
                </p>
              </div>
            )}

            <div style={{ display:"flex", gap:"8px", marginTop:"16px" }}>
              {selected.statut === "en_attente" && (
                <button className="admin-btn admin-btn-success" onClick={()=>activer(selected)} style={{flex:1,padding:"12px"}}>Activer la carte</button>
              )}
              {selected.statut === "payee" && (
                <button className="admin-btn admin-btn-secondary" onClick={()=>marquerUtilisee(selected)} style={{flex:1,padding:"12px"}}>Marquer utilisée</button>
              )}
              <a href={`mailto:${selected.acheteur_email}`} className="admin-btn admin-btn-secondary" style={{flex:1,padding:"12px",textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
                Email acheteur
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


/* ── TÉMOIGNAGES ADMIN ──────────────────────────────────────────── */

export { CartesView };
