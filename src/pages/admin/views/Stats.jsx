import { useState, useEffect } from 'react';
function StatsView({ stats }) {
  const PRIX = { F1:65000, F2:150000, F3:250000, F4:350000 };

  const cards = [
    { label:"Membres total",      value: stats.membres,         color:"var(--or)",   icon:"👥" },
    { label:"Membres actifs",     value: stats.actifs,          color:"var(--green)", icon:"✓" },
    { label:"Nouveaux (7 jours)", value: stats.nouveaux_7j||0,  color:"#A8C8E0",     icon:"🆕" },
    { label:"Non traitées",       value: stats.non_traites,     color:"#ef5350",     icon:"⚠" },
    { label:"Taux activation",    value: (stats.taux_activation||0)+'%', color:"var(--or)", icon:"📈" },
    { label:"Taux conversion",    value: (stats.taux_conversion||0)+'%', color:"var(--rose)", icon:"🎯" },
  ];

  const revenuFormate = stats.revenu_estime
    ? new Intl.NumberFormat('fr-FR').format(stats.revenu_estime) + ' FCFA'
    : '—';

  return (
    <div>
      <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"1.5rem", fontWeight:600, marginBottom:"28px" }}>
        Vue d'ensemble
      </h2>

      {/* Stat cards */}
      <div className="stat-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"14px", marginBottom:"24px" }}>
        {cards.map((c,i) => (
          <div key={i} className="stat-card" style={{ animationDelay:`${i*.07}s`, borderTop:`3px solid ${c.color}` }}>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:"12px" }}>
              <span style={{ fontSize:"1.2rem" }}>{c.icon}</span>
              <span style={{ fontFamily:"var(--ff-t)", fontSize:"2rem", fontWeight:700, color:c.color }}>{c.value}</span>
            </div>
            <p style={{ fontSize:".7rem", letterSpacing:".12em", textTransform:"uppercase", color:"var(--text-sub)" }}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* Revenu estimé */}
      <div className="stat-card" style={{ marginBottom:"20px", borderLeft:"4px solid var(--or)" }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <p style={{ fontSize:".65rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--or)", marginBottom:"6px" }}>
              Revenu estimé (membres actifs)
            </p>
            <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.8rem", fontWeight:700, color:"var(--or)" }}>
              {revenuFormate}
            </p>
          </div>
          <div style={{ textAlign:"right" }}>
            <p style={{ fontSize:".65rem", color:"var(--text-sub)", marginBottom:"4px" }}>Nouveaux 30j</p>
            <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.4rem", fontWeight:700, color:"var(--green)" }}>
              +{stats.nouveaux_30j||0}
            </p>
          </div>
        </div>
      </div>

      {/* Répartition formules */}
      <div className="stat-card" style={{ marginBottom:"20px" }}>
        <p style={{ fontSize:".65rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--or)", marginBottom:"20px" }}>
          Répartition par formule
        </p>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"12px" }}>
          {Object.entries(FORMULES).map(([code, label]) => {
            const count = stats.formules?.[code] || 0;
            const revenu = count * (PRIX[code]||0);
            return (
              <div key={code} style={{ textAlign:"center", padding:"16px", background:"rgba(255,255,255,.03)", borderRadius:"4px" }}>
                <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.8rem", fontWeight:700, color:"var(--rose)", marginBottom:"4px" }}>{count}</p>
                <p style={{ fontSize:".68rem", color:"var(--text-sub)", fontWeight:300, marginBottom:"6px" }}>{label}</p>
                <p style={{ fontSize:".65rem", color:"var(--or)", fontWeight:500 }}>
                  {new Intl.NumberFormat('fr-FR').format(revenu)} FCFA
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Tendance inscriptions */}
      {stats.inscriptions_mois && stats.inscriptions_mois.length > 0 && (
        <div className="stat-card">
          <p style={{ fontSize:".65rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--or)", marginBottom:"20px" }}>
            Tendance inscriptions (12 mois)
          </p>
          <div style={{ display:"flex", alignItems:"flex-end", gap:"6px", height:"80px" }}>
            {stats.inscriptions_mois.map((item, i) => {
              const max = Math.max(...stats.inscriptions_mois.map(x => x.total), 1);
              const h   = Math.max(4, (item.total / max) * 70);
              return (
                <div key={i} style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", gap:"4px" }}>
                  <span style={{ fontSize:".55rem", color:"var(--text-sub)" }}>{item.total}</span>
                  <div style={{ width:"100%", height:`${h}px`, background:"var(--rose)", borderRadius:"2px 2px 0 0", opacity:.8 }}/>
                  <span style={{ fontSize:".5rem", color:"var(--text-sub)", whiteSpace:"nowrap", overflow:"hidden", maxWidth:"100%" }}>
                    {item.mois?.slice(0,3)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

/* ── MEMBRES ────────────────────────────────────────────────── */

export { StatsView };
