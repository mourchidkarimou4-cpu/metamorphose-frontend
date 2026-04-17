import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
function MembresView({ api, toast }) {
  const [membres, setMembres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");
  const [filter,  setFilter]  = useState("tous");

  useEffect(() => {
    api("GET", "/membres/").then(d => { if(d) setMembres(Array.isArray(d) ? d : Array.isArray(d?.results) ? d.results : []); setLoading(false); });
  }, []);

  async function toggleActif(m) {
    const updated = await api("PATCH", `/membres/${m.id}/`, { actif: !m.actif });
    if (updated) {
      setMembres(prev => prev.map(x => x.id===m.id ? {...x, actif:!m.actif} : x));
      toast(updated.actif ? "Membre activé " : "Membre désactivé", updated.actif ? "success" : "error");
    }
  }

  async function deleteMembre(m) {
    if (!confirm(`Supprimer ${m.email} ?`)) return;
    await api("DELETE", `/membres/${m.id}/`);
    setMembres(prev => prev.filter(x => x.id !== m.id));
    toast("Membre supprimé", "error");
  }

  const filtered = membres.filter(m => {
    const q = search.toLowerCase();
    const match = m.email.toLowerCase().includes(q) || (m.first_name||"").toLowerCase().includes(q);
    if (filter === "actifs")    return match && m.actif;
    if (filter === "inactifs")  return match && !m.actif;
    if (filter !== "tous")      return match && m.formule === filter;
    return match;
  });

  return (
    <div>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"24px" }}>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600 }}>Membres</h2>
        <span className="badge badge-or">{membres.length} membres</span>
      </div>

      {/* Filtres */}
      <div style={{ display:"flex", gap:"10px", marginBottom:"20px", flexWrap:"wrap" }}>
        <input className="admin-input" placeholder="Rechercher email, prénom…" value={search}
          onChange={e=>setSearch(e.target.value)} style={{ maxWidth:"260px" }}/>
        <div style={{ display:"flex", gap:"6px" }}>
          {[["tous","Tous"],["actifs","Actifs"],["inactifs","Inactifs"],["F1","F1"],["F2","F2"],["F3","F3"],["F4","F4"]].map(([val,label]) => (
            <button key={val} onClick={()=>setFilter(val)}
              className="admin-btn"
              style={{ background:filter===val?"var(--rose)":"rgba(255,255,255,.05)", color:filter===val?"#fff":"var(--text-sub)", padding:"8px 14px" }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {loading ? <div style={{textAlign:"center",padding:"40px"}}><div className="spinner" style={{margin:"0 auto"}}/></div> : (
        filtered.map(m => (
          <div key={m.id} className="row-item">
            {/* Avatar */}
            <div style={{ width:"36px", height:"36px", borderRadius:"50%", background:"rgba(194,24,91,.15)", border:"1px solid rgba(194,24,91,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"var(--ff-t)", fontSize:".9rem", color:"var(--rose)", flexShrink:0 }}>
              {(m.first_name?.[0] || m.email[0]).toUpperCase()}
            </div>
            {/* Infos */}
            <div style={{ flex:1, minWidth:0 }}>
              <p style={{ fontWeight:500, fontSize:".88rem", color:"var(--text)", marginBottom:"2px", overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {m.first_name ? `${m.first_name} ${m.last_name}` : m.email}
              </p>
              <p style={{ fontSize:".72rem", color:"var(--text-sub)", fontWeight:300 }}>{m.email} · {m.pays || "—"}</p>
            </div>
            {/* Formule */}
            {m.formule && <span className="badge badge-rose">{m.formule}</span>}
            {/* Statut */}
            <span className={`badge ${m.actif?"badge-green":"badge-red"}`}>
              {m.actif ? "Actif" : "Inactif"}
            </span>
            {/* Actions */}
            <button className={`admin-btn ${m.actif?"admin-btn-danger":"admin-btn-success"}`}
              onClick={() => toggleActif(m)} style={{ padding:"7px 14px", flexShrink:0 }}>
              {m.actif ? "Désactiver" : "Activer"}
            </button>
            <button className="admin-btn admin-btn-danger" onClick={() => deleteMembre(m)} style={{ padding:"7px 12px", flexShrink:0 }}>
              
            </button>
          </div>
        ))
      )}
      {!loading && filtered.length === 0 && (
        <p style={{ textAlign:"center", color:"var(--text-sub)", padding:"40px", fontStyle:"italic" }}>Aucun membre trouvé.</p>
      )}
    </div>
  );
}

/* ── DEMANDES ───────────────────────────────────────────────── */

export { MembresView };
