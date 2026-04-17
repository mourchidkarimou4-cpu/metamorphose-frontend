import { useState, useEffect } from 'react';
import { FORMULES } from '../constants';
function DemandesView({ api, toast }) {
  const [demandes, setDemandes] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    api("GET", "/demandes/").then(d => { if(d) setDemandes(d); setLoading(false); });
  }, []);

  async function marquerTraite(d) {
    const updated = await api("PATCH", `/demandes/${d.id}/`, { traite: true });
    if (updated) {
      setDemandes(prev => prev.map(x => x.id===d.id ? {...x, traite:true} : x));
      toast("Marquée comme traitée ", "success");
    }
  }

  async function supprimer(d) {
    if (!confirm("Supprimer cette demande ?")) return;
    await api("DELETE", `/demandes/${d.id}/`);
    setDemandes(prev => prev.filter(x => x.id!==d.id));
    setSelected(null);
    toast("Demande supprimée", "error");
  }

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600 }}>Demandes d'inscription</h2>
        <span className="badge badge-rose">{demandes.filter(d=>!d.traite).length} non traitées</span>
      </div>

      {loading ? <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}}/></div> : (
        demandes.map(d => (
          <div key={d.id} className="row-item" style={{ cursor:"pointer" }} onClick={() => setSelected(d)}>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", gap:"10px", alignItems:"center", marginBottom:"3px" }}>
                <p style={{ fontWeight:500, fontSize:".88rem", color:"var(--text)" }}>{d.prenom} {d.nom}</p>
                <span className={`badge ${d.traite?"badge-green":"badge-rose"}`}>{d.traite?"Traitée":"En attente"}</span>
                {d.formule && <span className="badge badge-or">{d.formule}</span>}
              </div>
              <p style={{ fontSize:".72rem", color:"var(--text-sub)", fontWeight:300 }}>
                {d.email} · {d.pays} · {new Date(d.date).toLocaleDateString("fr-FR")}
              </p>
            </div>
            <div style={{ display:"flex", gap:"8px" }}>
              <a href={`https://wa.me/${d.whatsapp?.replace(/\s/g,"")}`} target="_blank" rel="noreferrer"
                onClick={e=>e.stopPropagation()}
                className="admin-btn admin-btn-success" style={{ padding:"7px 12px" }}>
                WA
              </a>
              {!d.traite && (
                <button className="admin-btn admin-btn-secondary" onClick={e=>{e.stopPropagation();marquerTraite(d)}} style={{padding:"7px 12px"}}>
                  Traiter
                </button>
              )}
              <button className="admin-btn admin-btn-danger" onClick={e=>{e.stopPropagation();supprimer(d)}} style={{padding:"7px 12px"}}>
                
              </button>
            </div>
          </div>
        ))
      )}

      {/* Modal détail demande */}
      {selected && (
        <div className="modal-overlay" onClick={()=>setSelected(null)}>
          <div className="modal-box admin-modal" onClick={e=>e.stopPropagation()}>
            <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"24px" }}>
              <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.3rem" }}>{selected.prenom} {selected.nom}</h3>
              <button onClick={()=>setSelected(null)} style={{background:"none",border:"none",color:"var(--text-sub)",fontSize:"1.2rem",cursor:"pointer"}}></button>
            </div>
            {[
              ["Email",    selected.email],
              ["WhatsApp", selected.whatsapp],
              ["Pays",     selected.pays],
              ["Formule",  FORMULES[selected.formule] || selected.formule],
              ["Date",     new Date(selected.date).toLocaleString("fr-FR")],
              ["Statut",   selected.traite ? "Traitée" : "En attente"],
            ].map(([l,v]) => (
              <div key={l} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid var(--border)" }}>
                <span style={{ fontSize:".72rem", fontWeight:500, letterSpacing:".1em", textTransform:"uppercase", color:"var(--text-sub)" }}>{l}</span>
                <span style={{ fontSize:".85rem", fontWeight:300, color:"var(--text)" }}>{v}</span>
              </div>
            ))}
            {selected.message && (
              <div style={{ marginTop:"16px", padding:"14px", background:"rgba(255,255,255,.03)", borderRadius:"3px" }}>
                <p style={{ fontSize:".65rem", letterSpacing:".15em", textTransform:"uppercase", color:"var(--or)", marginBottom:"8px" }}>Message</p>
                <p style={{ fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.7)", lineHeight:1.7 }}>{selected.message}</p>
              </div>
            )}
            <div style={{ display:"flex", gap:"10px", marginTop:"24px" }}>
              <a href={`https://wa.me/${selected.whatsapp?.replace(/\s/g,"")}`} target="_blank" rel="noreferrer"
                className="admin-btn admin-btn-success" style={{flex:1,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
                WhatsApp
              </a>
              <a href={`mailto:${selected.email}`} className="admin-btn admin-btn-secondary" style={{flex:1,textAlign:"center",textDecoration:"none",display:"flex",alignItems:"center",justifyContent:"center"}}>
                Email
              </a>
              {!selected.traite && (
                <button className="admin-btn admin-btn-primary" onClick={()=>{marquerTraite(selected);setSelected(null)}} style={{flex:1}}>
                  Marquer traitée
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── REPLAYS ────────────────────────────────────────────────── */

export { DemandesView };
