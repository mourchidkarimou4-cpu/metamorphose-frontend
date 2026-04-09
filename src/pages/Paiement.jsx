import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import API_URL from '../config';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes spin    { to{transform:rotate(360deg)} }
`;

// clé et sandbox chargées dynamiquement depuis /api/paiement/initier/

const FORMULES = [
  { id:"F1", label:"Live · Groupe",       prix:65000,  color:"#C2185B", desc:"2 séances/semaine · En ligne · Groupe" },
  { id:"F2", label:"Live · Privé",        prix:150000, color:"#C9A96A", desc:"Séances individuelles · En ligne", featured:true },
  { id:"F3", label:"Présentiel · Groupe", prix:250000, color:"#A8C8E0", desc:"1 séance/semaine · En présentiel" },
  { id:"F4", label:"Présentiel · Privé",  prix:350000, color:"#D8C1A0", desc:"Individuel · En présentiel" },
];

function loadKkiapay() {
  return new Promise((resolve) => {
    if (window.openKkiapayWidget) { resolve(); return; }
    const s = document.createElement("script");
    s.src = "https://cdn.kkiapay.me/k.js";
    s.onload = resolve;
    document.head.appendChild(s);
  });
}

export default function PaiementPage() {
  const navigate       = useNavigate();
  const [params]       = useSearchParams();
  const [formule,      setFormule]  = useState(params.get("formule") || "F2");
  const [loading,      setLoading]  = useState(false);
  const [error,        setError]    = useState("");
  const [step,         setStep]     = useState("choix");
  const token = localStorage.getItem("mmorphose_token");
  const user  = JSON.parse(localStorage.getItem("mmorphose_user") || "null");
  const listenerRef = useRef(null);

  useEffect(() => {
    if (!token || !user) navigate("/espace-membre");
  }, []);

  async function payer() {
    setLoading(true); setError("");
    try {
      await loadKkiapay();
      const f = FORMULES.find(x => x.id === formule);

      // Récupérer la clé publique et le mode sandbox depuis le backend
      const initRes = await fetch(`/api/paiement/initier/?formule=${formule}`, {
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (!initRes.ok) {
        setError("Impossible d'initialiser le paiement.");
        setLoading(false);
        return;
      }
      const initData = await initRes.json();

      window.openKkiapayWidget({
        amount:    initData.montant,
        api_key:   initData.public_key,
        sandbox:   initData.sandbox,
        email:     user?.email || "",
        name:      user?.first_name || "",
        theme:     "#C9A96A",
        callback:  `${window.location.origin}/paiement?formule=${formule}`,
      });

      if (listenerRef.current && window.removeSuccessListener) {
        window.removeSuccessListener(listenerRef.current);
      }
      listenerRef.current = async (response) => {
        setStep("processing");
        try {
          const res = await fetch(`${API_URL}/api/paiement/confirmer/", {
            method:  "POST",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type":  "application/json",
            },
            body: JSON.stringify({
              transaction_id: response.transactionId,
              formule,
            }),
          });
          const data = await res.json();
          if (res.ok) {
            const updatedUser = { ...user, actif: true, formule };
            localStorage.setItem("mmorphose_user", JSON.stringify(updatedUser));
            setStep("success");
          } else {
            setError(data.detail || "Erreur de confirmation.");
            setStep("choix");
          }
        } catch {
          setError("Erreur serveur lors de la confirmation.");
          setStep("choix");
        }
        setLoading(false);
      };
      window.addSuccessListener(listenerRef.current);

    } catch {
      setError("Impossible d'ouvrir le widget de paiement.");
      setLoading(false);
    }
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
          <Link to="/dashboard" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".65rem", letterSpacing:".1em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}>
            Mon espace
          </Link>
        </nav>

        <div style={{ maxWidth:"680px", margin:"0 auto", padding:"48px 24px" }}>

          {step === "choix" && (
            <>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".28em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", marginBottom:"12px", animation:"fadeUp .6s both" }}>
                Votre transformation commence ici
              </p>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:"clamp(1.6rem,4vw,2.2rem)", fontWeight:400, marginBottom:"40px", animation:"fadeUp .7s .1s both" }}>
                Choisissez votre formule
              </h1>

              <div style={{ display:"grid", gap:"12px", marginBottom:"32px" }}>
                {FORMULES.map(fm => (
                  <div key={fm.id}
                    onClick={() => setFormule(fm.id)}
                    style={{
                      padding:"20px 24px", borderRadius:"4px", cursor:"pointer",
                      border: formule === fm.id ? `1px solid ${fm.color}` : "1px solid rgba(255,255,255,.07)",
                      background: formule === fm.id ? "rgba(255,255,255,.04)" : "transparent",
                      display:"flex", justifyContent:"space-between", alignItems:"center",
                      transition:"all .25s",
                    }}>
                    <div>
                      <p style={{ fontFamily:"'Playfair Display',serif", fontSize:".95rem", marginBottom:"4px", color: formule === fm.id ? fm.color : "#F8F5F2" }}>
                        {fm.label}
                        {fm.featured && <span style={{ marginLeft:"10px", fontSize:".55rem", letterSpacing:".1em", textTransform:"uppercase", border:`1px solid ${fm.color}`, color:fm.color, padding:"2px 6px" }}>Recommandé</span>}
                      </p>
                      <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".72rem", fontWeight:300, color:"rgba(248,245,242,.35)" }}>{fm.desc}</p>
                    </div>
                    <p style={{ fontFamily:"'Cormorant Garamond',serif", fontSize:"1.1rem", color: formule === fm.id ? fm.color : "rgba(248,245,242,.5)", flexShrink:0, marginLeft:"16px" }}>
                      {fm.prix.toLocaleString("fr-FR")} <span style={{fontSize:".7rem"}}>FCFA</span>
                    </p>
                  </div>
                ))}
              </div>

              {error && (
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".75rem", color:"#f44", marginBottom:"16px", textAlign:"center" }}>{error}</p>
              )}

              <button onClick={payer} disabled={loading} style={{
                width:"100%", padding:"18px", background:"#C2185B", color:"#fff",
                border:"none", borderRadius:"3px", cursor: loading ? "not-allowed" : "pointer",
                fontFamily:"'Montserrat',sans-serif", fontSize:".72rem", fontWeight:600,
                letterSpacing:".16em", textTransform:"uppercase", opacity: loading ? .7 : 1,
                transition:"all .3s",
              }}>
                {loading ? "Chargement..." : `Payer ${f?.prix.toLocaleString("fr-FR")} FCFA`}
              </button>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", color:"rgba(248,245,242,.2)", textAlign:"center", marginTop:"12px" }}>
                Paiement sécurisé via Kkiapay · Mobile Money · Carte bancaire
              </p>
            </>
          )}

          {step === "processing" && (
            <div style={{ textAlign:"center", padding:"80px 0" }}>
              <div style={{ width:"40px", height:"40px", border:"2px solid rgba(201,169,106,.2)", borderTop:"2px solid #C9A96A", borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 24px" }}/>
              <p style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:"1.2rem" }}>Confirmation en cours…</p>
            </div>
          )}

          {step === "success" && (
            <div style={{ textAlign:"center", padding:"80px 0", animation:"fadeUp .6s both" }}>
              <div style={{ width:"60px", height:"1px", background:"linear-gradient(90deg,transparent,#C9A96A,transparent)", margin:"0 auto 32px" }}/>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".28em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", marginBottom:"16px" }}>
                Bienvenue
              </p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:"2rem", fontWeight:400, marginBottom:"16px" }}>
                Paiement confirmé
              </h2>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.5)", marginBottom:"40px" }}>
                Votre compte est maintenant actif. Bienvenue dans Méta'Morph'Ose.
              </p>
              <Link to="/dashboard" style={{
                fontFamily:"'Montserrat',sans-serif", fontSize:".72rem", fontWeight:600,
                letterSpacing:".16em", textTransform:"uppercase",
                background:"#C2185B", color:"#fff", textDecoration:"none",
                padding:"16px 40px", borderRadius:"3px",
              }}>
                Accéder à mon espace
              </Link>
              <div style={{ width:"60px", height:"1px", background:"linear-gradient(90deg,transparent,#C9A96A,transparent)", margin:"32px auto 0" }}/>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
