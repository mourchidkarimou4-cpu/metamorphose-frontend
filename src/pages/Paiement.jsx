import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link, useNavigate, useSearchParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  @keyframes spin    { to{transform:rotate(360deg)} }
`;

const FORMULES = [
  { id:"F1", label:"Éclosion",    prix:65000,  color:"#C2185B", desc:"2 séances/semaine · En ligne · Groupe" },
  { id:"F2", label:"Révélation",  prix:150000, color:"#C9A96A", desc:"Séances individuelles · En ligne", featured:true },
  { id:"F3", label:"Ascension",   prix:250000, color:"#A8C8E0", desc:"1 séance/semaine · En présentiel" },
  { id:"F4", label:"MMO Signature", prix:350000, color:"#D8C1A0", desc:"Individuel · En présentiel" },
];

export default function PaiementPage() {
  const navigate       = useNavigate();
  const [params]       = useSearchParams();
  const [formule,      setFormule]  = useState(params.get("formule") || "F2");
  const [liens,        setLiens]    = useState({});
  const [loading,      setLoading]  = useState(true);
  const [error,        setError]    = useState("");

  const { token, user } = useAuth();

  useEffect(() => {
    if (!token || !user) { navigate("/espace-membre"); return; }
    chargerLiens();
  }, []);

  async function chargerLiens() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/config/public/`);
      const data = await res.json();
      if (Array.isArray(data)) {
        const l = {};
        data.forEach(c => {
          if (c.cle.startsWith('lien_paiement_')) {
            const id = 'F' + c.cle.replace('lien_paiement_f', '');
            l[id] = c.valeur;
          }
        });
        setLiens(l);
      }
    } catch {}
    setLoading(false);
  }

  function payer() {
    const lien = liens[formule];
    if (!lien) {
      setError("Le lien de paiement n'est pas encore configuré. Contactez Coach Prélia APEDO AHONON sur WhatsApp.");
      return;
    }
    window.open(lien, '_blank', 'noopener,noreferrer');
  }

  const f = FORMULES.find(x => x.id === formule);

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ background:"#0A0A0A", minHeight:"100vh", color:"#F8F5F2", fontFamily:"'Montserrat',sans-serif" }}>


        <div style={{ maxWidth:"680px", margin:"0 auto", padding:"48px 24px" }}>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".28em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", marginBottom:"12px", animation:"fadeUp .6s both" }}>
            Votre transformation commence ici
          </p>
          <h1 style={{ fontFamily:"'Playfair Display',serif", fontStyle:"italic", fontSize:"clamp(1.6rem,4vw,2.2rem)", fontWeight:400, marginBottom:"40px", animation:"fadeUp .7s .1s both" }}>
            Choisissez votre formule
          </h1>

          {loading ? (
            <div style={{ textAlign:"center", padding:"40px 0" }}>
              <div style={{ width:"32px", height:"32px", border:"2px solid rgba(201,169,106,.2)", borderTop:"2px solid #C9A96A", borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto" }}/>
            </div>
          ) : (
            <>
              <div style={{ display:"grid", gap:"12px", marginBottom:"32px" }}>
                {FORMULES.map(fm => (
                  <div key={fm.id}
                    onClick={() => { setFormule(fm.id); setError(""); }}
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
                        {fm.featured && <span style={{ marginLeft:"10px", fontSize:".55rem", letterSpacing:".1em", textTransform:"uppercase", border:`1px solid ${fm.color}`, color:fm.color, padding:"2px 6px" }}>Populaire</span>}
                      </p>
                      <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".72rem", fontWeight:300, color:"rgba(248,245,242,.35)" }}>{fm.desc}</p>
                    </div>
                    <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem", color: formule === fm.id ? fm.color : "rgba(248,245,242,.5)", flexShrink:0, marginLeft:"16px" }}>
                      {fm.prix.toLocaleString("fr-FR")} <span style={{fontSize:".7rem"}}>FCFA</span>
                    </p>
                  </div>
                ))}
              </div>

              {error && (
                <div style={{ padding:"14px 18px", background:"rgba(239,83,80,.08)", border:"1px solid rgba(239,83,80,.2)", borderRadius:"4px", marginBottom:"16px" }}>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".75rem", color:"#ef5350", lineHeight:1.6 }}>{error}</p>
                  <a href="https://wa.me/message/DI23LCDIMS5SF1" target="_blank" rel="noreferrer"
                    style={{ display:"inline-block", marginTop:"10px", fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", letterSpacing:".1em", textTransform:"uppercase", color:"#25D366", textDecoration:"none" }}>
                    Contacter sur WhatsApp
                  </a>
                </div>
              )}

              <button onClick={payer} style={{
                width:"100%", padding:"18px", background:"#C2185B", color:"#fff",
                border:"none", borderRadius:"3px", cursor:"pointer",
                fontFamily:"'Montserrat',sans-serif", fontSize:".72rem", fontWeight:600,
                letterSpacing:".16em", textTransform:"uppercase", transition:"all .3s",
              }}>
                Procéder au paiement — {f?.prix.toLocaleString("fr-FR")} FCFA
              </button>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", color:"rgba(248,245,242,.2)", textAlign:"center", marginTop:"12px" }}>
                Vous serez redirigée vers la page de paiement sécurisée. Votre accès sera activé sous 24h par Coach Prélia APEDO AHONON.
              </p>
            </>
          )}
        </div>
      </div>
    </>
  );
}
