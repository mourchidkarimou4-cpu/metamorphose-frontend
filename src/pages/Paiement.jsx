import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

/* ================================================================
   PAGE PAIEMENT — /paiement
   Sélection formule → FedaPay → Confirmation
   ================================================================ */

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes spin    { to{transform:rotate(360deg)} }
`;

const FORMULES = [
  { id:"F1", label:"Live · Groupe",      prix:65000,  color:"#C2185B", desc:"2 séances/semaine · En ligne · Groupe" },
  { id:"F2", label:"Live · Privé",       prix:150000, color:"#C9A96A", desc:"Séances individuelles · En ligne", featured:true },
  { id:"F3", label:"Présentiel · Groupe",prix:250000, color:"#A8C8E0", desc:"1 séance/semaine · En présentiel" },
  { id:"F4", label:"Présentiel · Privé", prix:350000, color:"#D8C1A0", desc:"Individuel · En présentiel" },
];

export default function PaiementPage() {
  const navigate      = useNavigate();
  const [params]      = useSearchParams();
  const [formule,     setFormule]    = useState(params.get("formule") || "F2");
  const [loading,     setLoading]    = useState(false);
  const [error,       setError]      = useState("");
  const [step,        setStep]       = useState("choix"); // choix | processing | success | error

  const token = localStorage.getItem("mmorphose_token");
  const user  = JSON.parse(localStorage.getItem("mmorphose_user") || "null");

  useEffect(() => {
    if (!token || !user) { navigate("/espace-membre"); }
  }, []);

  // Vérifier si retour de FedaPay (params callback)
  useEffect(() => {
    const status = params.get("status");
    const ref    = params.get("id");
    if (status === "approved" && ref) { setStep("success"); }
    if (status === "cancelled")       { setStep("choix"); setError("Paiement annulé."); }
  }, [params]);

  async function payer() {
    setLoading(true); setError("");
    try {
      const res  = await fetch("/api/paiement/initier/", {
        method:  "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body:    JSON.stringify({
          formule,
          callback_url: `${window.location.origin}/paiement?formule=${formule}`,
        }),
      });
      const data = await res.json();

      if (res.ok && data.payment_url) {
        setStep("processing");
        window.location.href = data.payment_url;
      } else {
        setError(data.detail || "Erreur lors de l'initialisation du paiement.");
      }
    } catch {
      setError("Serveur inaccessible.");
    }
    setLoading(false);
  }

  const f = FORMULES.find(x => x.id === formule);

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ background:"#0A0A0A", minHeight:"100vh", color:"#F8F5F2", fontFamily:"'Montserrat',sans-serif" }}>

        <nav style={{ padding:"18px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <Link to="/" style={{ textDecoration:"none" }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem" }}>
              <span style={{color:"#F8F5F2"}}>Meta'</span>
              <span style={{color:"#C9A96A"}}>Morph'</span>
              <span style={{color:"#C2185B"}}>Ose</span>
            </span>
          </Link>
          <Link to="/dashboard" style={{ fontFamily:"'Montserrat'", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}>
            Mon espace
          </Link>
        </nav>

        <div style={{ maxWidth:"640px", margin:"0 auto", padding:"60px 24px 80px" }}>

          {/* ÉTAPE 1 — Choix formule + paiement */}
          {step === "choix" && (
            <div style={{ animation:"fadeUp .5s both" }}>
              <p style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"14px" }}>Paiement sécurisé</p>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.8rem,5vw,2.5rem)", fontWeight:600, marginBottom:"8px" }}>
                Confirmer votre inscription
              </h1>
              <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.5)", marginBottom:"36px" }}>
                Bonjour {user?.first_name || user?.email} — choisissez votre formule et procédez au paiement.
              </p>

              {/* Sélection formule */}
              <p style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(248,245,242,.4)", marginBottom:"14px" }}>Votre formule</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"10px", marginBottom:"28px" }}>
                {FORMULES.map(fm => (
                  <div key={fm.id} onClick={() => setFormule(fm.id)} style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 20px", background: formule===fm.id ? `${fm.color}10` : "rgba(255,255,255,.025)", border:`1px solid ${formule===fm.id ? fm.color : "rgba(255,255,255,.07)"}`, borderRadius:"4px", cursor:"pointer", transition:"all .25s" }}>
                    <div>
                      <p style={{ fontFamily:"'Montserrat'", fontWeight:600, fontSize:".85rem", color:formule===fm.id?fm.color:"#F8F5F2" }}>{fm.label}</p>
                      <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".75rem", color:"rgba(248,245,242,.4)", marginTop:"2px" }}>{fm.desc}</p>
                    </div>
                    <div style={{ display:"flex", alignItems:"center", gap:"12px" }}>
                      <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", fontWeight:700, color:fm.color }}>{fm.prix.toLocaleString("fr-FR")} FCFA</span>
                      <div style={{ width:"18px", height:"18px", borderRadius:"50%", border:`2px solid ${formule===fm.id?fm.color:"rgba(255,255,255,.2)"}`, background:formule===fm.id?fm.color:"transparent", flexShrink:0, transition:"all .25s" }}/>
                    </div>
                  </div>
                ))}
              </div>

              {/* Récap */}
              <div style={{ padding:"20px 24px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"4px", marginBottom:"24px" }}>
                <div style={{ display:"flex", justifyContent:"space-between", marginBottom:"10px" }}>
                  <span style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.5)" }}>Formule</span>
                  <span style={{ fontFamily:"'Montserrat'", fontWeight:500, fontSize:".85rem", color:f?.color }}>{f?.label}</span>
                </div>
                <div style={{ display:"flex", justifyContent:"space-between", paddingTop:"10px", borderTop:"1px solid rgba(255,255,255,.06)" }}>
                  <span style={{ fontFamily:"'Montserrat'", fontWeight:600, fontSize:".9rem" }}>Total</span>
                  <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem", fontWeight:700, color:f?.color }}>{f?.prix.toLocaleString("fr-FR")} FCFA</span>
                </div>
              </div>

              {error && (
                <div style={{ padding:"12px 16px", marginBottom:"16px", background:"rgba(239,83,80,.08)", border:"1px solid rgba(239,83,80,.25)", borderRadius:"3px", fontFamily:"'Montserrat'", fontSize:".82rem", color:"#ef5350", fontWeight:300 }}>
                  {error}
                </div>
              )}

              <button onClick={payer} disabled={loading} style={{ width:"100%", padding:"16px", background:"#C2185B", color:"#fff", border:"none", borderRadius:"3px", fontFamily:"'Montserrat'", fontWeight:600, fontSize:".78rem", letterSpacing:".15em", textTransform:"uppercase", cursor:loading?"not-allowed":"pointer", opacity:loading?.7:1, transition:"all .3s", marginBottom:"14px" }}>
                {loading ? "Initialisation..." : `Payer ${f?.prix.toLocaleString("fr-FR")} FCFA via FedaPay`}
              </button>

              <div style={{ display:"flex", gap:"16px", justifyContent:"center", flexWrap:"wrap" }}>
                <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".72rem", color:"rgba(248,245,242,.3)", textAlign:"center", lineHeight:1.65 }}>
                  Paiement sécurisé via FedaPay · Mobile Money · Carte bancaire
                </p>
              </div>

              <div style={{ marginTop:"20px", textAlign:"center" }}>
                <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".75rem", color:"rgba(248,245,242,.25)", marginBottom:"8px" }}>
                  Vous préférez payer par virement ?
                </p>
                <a href="https://wa.me/22901961140933" style={{ color:"#C9A96A", fontFamily:"'Montserrat'", fontSize:".75rem", fontWeight:500, textDecoration:"none" }}>
                  Contacter Prélia sur WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 — En cours */}
          {step === "processing" && (
            <div style={{ textAlign:"center", padding:"80px 0", animation:"fadeUp .5s both" }}>
              <div style={{ width:"48px", height:"48px", borderRadius:"50%", border:"3px solid rgba(201,169,106,.2)", borderTopColor:"#C9A96A", animation:"spin .7s linear infinite", margin:"0 auto 24px" }}/>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.5rem", marginBottom:"12px" }}>Redirection vers FedaPay…</h2>
              <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.5)" }}>Vous allez être redirigé vers la page de paiement sécurisée.</p>
            </div>
          )}

          {/* ÉTAPE 3 — Succès */}
          {step === "success" && (
            <div style={{ textAlign:"center", animation:"fadeUp .5s both" }}>
              <div style={{ width:"72px", height:"72px", borderRadius:"50%", background:"rgba(76,175,80,.1)", border:"2px solid rgba(76,175,80,.4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", fontSize:"1.8rem", color:"#4CAF50" }}>✓</div>
              <p style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#4CAF50", marginBottom:"12px" }}>Paiement confirmé</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.6rem,4vw,2.2rem)", fontWeight:600, marginBottom:"16px" }}>
                Bienvenue dans Méta'Morph'Ose !
              </h2>
              <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.55)", lineHeight:1.8, marginBottom:"32px", maxWidth:"440px", margin:"0 auto 32px" }}>
                Votre paiement a été confirmé. Votre accès membre est maintenant actif. Vous allez recevoir un email de confirmation.
              </p>
              <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
                <Link to="/dashboard" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#C2185B", color:"#fff", fontFamily:"'Montserrat'", fontWeight:600, fontSize:".75rem", letterSpacing:".15em", textTransform:"uppercase", padding:"15px 32px", borderRadius:"2px", textDecoration:"none" }}>
                  Accéder à mon espace
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
