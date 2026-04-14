import API_URL from '../config.js'
import { useState, useEffect } from "react";
import usePageBackground from "../hooks/usePageBackground";
import { useParams, Link } from "react-router-dom";

/* ================================================================
   PAGE SCAN QR CODE — /carte/:code
   Accessible depuis le QR code sur la carte cadeau
   Permet à Prélia de vérifier et activer/utiliser en 1 clic
   ================================================================ */

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes spin    { to{transform:rotate(360deg)} }
  @keyframes pulse   { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
`;

const FORMULES = {
  F1:"Live · Groupe", F2:"Live · Privé",
  F3:"Présentiel · Groupe", F4:"Présentiel · Privé"
};

const STATUT_CONFIG = {
  en_attente: { color:"#C9A96A", bg:"rgba(201,169,106,.1)",  border:"rgba(201,169,106,.3)",  label:"En attente de paiement", icon:"⏳" },
  payee:      { color:"#4CAF50", bg:"rgba(76,175,80,.1)",    border:"rgba(76,175,80,.3)",    label:"Valide — Non utilisée",  icon:"✓" },
  utilisee:   { color:"rgba(248,245,242,.3)", bg:"rgba(255,255,255,.04)", border:"rgba(255,255,255,.1)", label:"Déjà utilisée", icon:"×" },
  expiree:    { color:"#ef5350", bg:"rgba(239,83,80,.1)",    border:"rgba(239,83,80,.3)",    label:"Expirée",               icon:"!" },
};

export default function CarteScan() {
  usePageBackground("carte");
  const { code }     = useParams();
  const [carte,      setCarte]      = useState(null);
  const [loading,    setLoading]    = useState(true);
  const [error,      setError]      = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionDone,    setActionDone]    = useState(false);
  const [actionMsg,     setActionMsg]     = useState("");
  const [isAdmin,       setIsAdmin]       = useState(false);

  useEffect(() => {
    // Vérifier si l'utilisateur est admin
    const user = JSON.parse(localStorage.getItem("mmorphose_user") || "null");
    setIsAdmin(user?.is_staff || false);

    // Charger les infos de la carte
    fetch(`${API_URL}/api/cadeaux/verifier/${code}/`)
      .then(r => r.json())
      .then(data => {
        setCarte(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Impossible de charger les informations de cette carte.");
        setLoading(false);
      });
  }, [code]);

  async function activer() {
    if (!confirm("Confirmer l'activation de cette carte (paiement reçu) ?")) return;
    setActionLoading(true);
    const token = localStorage.getItem("mmorphose_token");
    try {
      // D'abord récupérer l'ID de la carte
      const res = await fetch(API_URL + '/api/cadeaux/admin/liste/', {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const cartes = await res.json();
      const carteAdmin = cartes.find(c => c.code === code);
      if (!carteAdmin) { setActionMsg("Carte introuvable."); return; }

      const res2 = await fetch(`${API_URL}/api/cadeaux/admin/${carteAdmin.id}/activer/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" }
      });
      if (res2.ok) {
        setCarte(p => ({...p, statut:"payee", valide:true}));
        setActionMsg("Carte activée avec succès.");
        setActionDone(true);
      }
    } catch {
      setActionMsg("Erreur lors de l'activation.");
    }
    setActionLoading(false);
  }

  async function utiliser() {
    if (!confirm(`Confirmer l'utilisation de cette carte par ${carte?.destinataire_nom} ?`)) return;
    setActionLoading(true);
    const token = localStorage.getItem("mmorphose_token");
    try {
      const res = await fetch(API_URL + '/api/cadeaux/admin/liste/', {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const cartes = await res.json();
      const carteAdmin = cartes.find(c => c.code === code);
      if (!carteAdmin) { setActionMsg("Carte introuvable."); return; }

      const res2 = await fetch(`${API_URL}/api/cadeaux/admin/${carteAdmin.id}/utiliser/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ email: carteAdmin.destinataire_email })
      });
      if (res2.ok) {
        setCarte(p => ({...p, statut:"utilisee", valide:false}));
        setActionMsg("Carte marquée comme utilisée.");
        setActionDone(true);
      }
    } catch {
      setActionMsg("Erreur lors de la mise à jour.");
    }
    setActionLoading(false);
  }

  const statut = carte ? STATUT_CONFIG[carte.statut] || STATUT_CONFIG.en_attente : null;

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ background:"#0A0A0A", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", fontFamily:"'Montserrat',sans-serif" }}>
        <div style={{ maxWidth:"420px", width:"100%", animation:"fadeUp .5s both" }}>

          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:"32px" }}>
            <Link to="/" style={{ textDecoration:"none" }}>
              <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem" }}>
                <span style={{color:"#F8F5F2"}}>Meta'</span>
                <span style={{color:"#C9A96A"}}>Morph'</span>
                <span style={{color:"#C2185B"}}>Ose</span>
              </span>
            </Link>
            <p style={{ fontFamily:"'Montserrat'", fontSize:".6rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(248,245,242,.3)", marginTop:"6px" }}>
              Vérification carte cadeau
            </p>
          </div>

          {/* Loading */}
          {loading && (
            <div style={{ textAlign:"center", padding:"48px" }}>
              <div style={{ width:"32px", height:"32px", borderRadius:"50%", border:"2px solid rgba(201,169,106,.2)", borderTopColor:"#C9A96A", animation:"spin .7s linear infinite", margin:"0 auto 16px" }}/>
              <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.4)" }}>Vérification en cours…</p>
            </div>
          )}

          {/* Erreur */}
          {error && !loading && (
            <div style={{ padding:"24px", background:"rgba(239,83,80,.08)", border:"1px solid rgba(239,83,80,.25)", borderRadius:"6px", textAlign:"center" }}>
              <p style={{ color:"#ef5350", fontWeight:300, fontSize:".88rem" }}>{error}</p>
            </div>
          )}

          {/* Carte trouvée */}
          {carte && !loading && (
            <div style={{ background:"#141414", border:`1px solid ${statut.border}`, borderRadius:"8px", overflow:"hidden" }}>

              {/* Statut header */}
              <div style={{ padding:"20px 24px", background:statut.bg, borderBottom:`1px solid ${statut.border}`, textAlign:"center" }}>
                <div style={{ fontSize:"2.5rem", marginBottom:"8px", animation: carte.statut==="payee" ? "pulse 2s ease-in-out infinite" : "none" }}>
                  {statut.icon === "✓" ? (
                    <div style={{ width:"56px", height:"56px", borderRadius:"50%", background:"rgba(76,175,80,.2)", border:"2px solid rgba(76,175,80,.5)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto", fontSize:"1.5rem", color:"#4CAF50" }}>✓</div>
                  ) : statut.icon === "×" ? (
                    <div style={{ width:"56px", height:"56px", borderRadius:"50%", background:"rgba(255,255,255,.05)", border:"2px solid rgba(255,255,255,.1)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto", fontSize:"1.5rem", color:"rgba(248,245,242,.3)" }}>×</div>
                  ) : (
                    <div style={{ width:"56px", height:"56px", borderRadius:"50%", background:statut.bg, border:`2px solid ${statut.border}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto", fontSize:"1.3rem", color:statut.color }}>!</div>
                  )}
                </div>
                <p style={{ fontFamily:"'Montserrat'", fontWeight:600, fontSize:".78rem", letterSpacing:".15em", textTransform:"uppercase", color:statut.color, marginTop:"10px" }}>
                  {statut.label}
                </p>
              </div>

              {/* Infos carte */}
              <div style={{ padding:"24px" }}>
                <div style={{ marginBottom:"20px" }}>
                  <p style={{ fontFamily:"'Montserrat'", fontSize:".6rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(248,245,242,.3)", marginBottom:"6px" }}>Code</p>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", fontWeight:700, color:"#C9A96A", letterSpacing:".08em" }}>{code}</p>
                </div>

                {[
                  ["Destinataire", carte.destinataire_nom],
                  ["Formule",      FORMULES[carte.formule] || carte.formule],
                  ["Occasion",     carte.occasion || "—"],
                  ["Expire le",    carte.date_expiration ? new Date(carte.date_expiration).toLocaleDateString("fr-FR", {day:"numeric",month:"long",year:"numeric"}) : "—"],
                ].map(([label, val]) => (
                  <div key={label} style={{ display:"flex", justifyContent:"space-between", padding:"10px 0", borderBottom:"1px solid rgba(255,255,255,.05)", fontFamily:"'Montserrat'" }}>
                    <span style={{ fontSize:".75rem", fontWeight:300, color:"rgba(248,245,242,.4)" }}>{label}</span>
                    <span style={{ fontSize:".82rem", fontWeight:500, color:"#F8F5F2" }}>{val}</span>
                  </div>
                ))}

                {carte.message_perso && (
                  <div style={{ marginTop:"16px", padding:"14px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.06)", borderRadius:"4px" }}>
                    <p style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".15em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"8px" }}>Message</p>
                    <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:".9rem", color:"rgba(248,245,242,.6)", lineHeight:1.65 }}>
                      « {carte.message_perso} »
                    </p>
                  </div>
                )}

                {/* Message action effectuée */}
                {actionMsg && (
                  <div style={{ marginTop:"16px", padding:"12px 16px", background: actionDone ? "rgba(76,175,80,.08)" : "rgba(239,83,80,.08)", border:`1px solid ${actionDone?"rgba(76,175,80,.3)":"rgba(239,83,80,.3)"}`, borderRadius:"3px", fontFamily:"'Montserrat'", fontSize:".82rem", color:actionDone?"#4CAF50":"#ef5350", fontWeight:300, textAlign:"center", animation:"fadeUp .4s both" }}>
                    {actionMsg}
                  </div>
                )}

                {/* Actions admin */}
                {isAdmin && !actionDone && (
                  <div style={{ marginTop:"20px", display:"flex", flexDirection:"column", gap:"10px" }}>
                    {carte.statut === "en_attente" && (
                      <button onClick={activer} disabled={actionLoading} style={{ padding:"15px", background:"#4CAF50", color:"#fff", border:"none", borderRadius:"3px", fontFamily:"'Montserrat'", fontWeight:600, fontSize:".75rem", letterSpacing:".15em", textTransform:"uppercase", cursor:actionLoading?"not-allowed":"pointer", opacity:actionLoading?.7:1, transition:"all .3s" }}>
                        {actionLoading ? "Activation..." : "Activer la carte (paiement reçu)"}
                      </button>
                    )}
                    {carte.statut === "payee" && (
                      <button onClick={utiliser} disabled={actionLoading} style={{ padding:"15px", background:"#C2185B", color:"#fff", border:"none", borderRadius:"3px", fontFamily:"'Montserrat'", fontWeight:600, fontSize:".75rem", letterSpacing:".15em", textTransform:"uppercase", cursor:actionLoading?"not-allowed":"pointer", opacity:actionLoading?.7:1, transition:"all .3s", animation:"pulse 2s ease-in-out infinite" }}>
                        {actionLoading ? "Mise à jour..." : "Marquer comme utilisée"}
                      </button>
                    )}
                    <Link to="/admin" style={{ display:"block", textAlign:"center", padding:"12px", background:"transparent", color:"rgba(201,169,106,.5)", fontFamily:"'Montserrat'", fontWeight:500, fontSize:".7rem", letterSpacing:".12em", textTransform:"uppercase", textDecoration:"none", border:"1px solid rgba(201,169,106,.2)", borderRadius:"3px" }}>
                      Voir dans le dashboard
                    </Link>
                  </div>
                )}

                {/* Pas admin — message info */}
                {!isAdmin && carte.statut === "payee" && (
                  <div style={{ marginTop:"20px", textAlign:"center" }}>
                    <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".8rem", color:"rgba(248,245,242,.4)", marginBottom:"16px", lineHeight:1.65 }}>
                      Cette carte est valide. Présentez-la à Prélia pour l'utiliser.
                    </p>
                    <a href="{WHATSAPP_URL}" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", gap:"8px", background:"#25D366", color:"#fff", fontFamily:"'Montserrat'", fontWeight:600, fontSize:".72rem", letterSpacing:".12em", textTransform:"uppercase", padding:"13px 24px", borderRadius:"3px", textDecoration:"none" }}>
                      Contacter Prélia
                    </a>
                  </div>
                )}

                {!isAdmin && carte.statut === "utilisee" && (
                  <div style={{ marginTop:"20px", textAlign:"center" }}>
                    <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".8rem", color:"rgba(248,245,242,.4)", lineHeight:1.65 }}>
                      Cette carte a déjà été utilisée. Contactez Prélia si vous pensez qu'il y a une erreur.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Footer */}
          <p style={{ textAlign:"center", marginTop:"20px", fontFamily:"'Montserrat'", fontWeight:300, fontSize:".7rem", color:"rgba(248,245,242,.2)" }}>
            Meta'Morph'Ose · White & Black · Prélia AHONON
          </p>
        </div>
      </div>
    </>
  );
}
