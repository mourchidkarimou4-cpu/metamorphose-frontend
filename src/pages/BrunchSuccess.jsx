import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || 'https://metamorphose-backend.onrender.com';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --noir:#0A0A0A; --or:#C9A96A; --or-light:#E8D5A8;
    --rose:#C2185B; --blanc:#F8F5F2;
    --ff-t:'Playfair Display',Georgia,serif;
    --ff-b:'Montserrat',sans-serif;
    --ff-a:'Cormorant Garamond',Georgia,serif;
  }
  body { background:var(--noir); color:var(--blanc); font-family:var(--ff-b); font-weight:300; line-height:1.7; overflow-x:hidden; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  @keyframes pulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.05)} }
  @keyframes spin { to{transform:rotate(360deg)} }
`;

export default function BrunchSuccess() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [data, setData]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");

  useEffect(() => {
    if (!token) { setError("Lien invalide."); setLoading(false); return; }
    fetch(`${API_BASE}/api/auth/verifier-brunch/?token=${token}`)
      .then(r => r.json())
      .then(d => {
        if (d.valid) setData(d);
        else setError("Ce lien est invalide ou a déjà été utilisé.");
      })
      .catch(() => setError("Erreur réseau. Veuillez réessayer."))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ background:"#0A0A0A", minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"40px 24px" }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration:"none", marginBottom:"48px" }}>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.2rem" }}>
            <span style={{color:"#F8F5F2"}}>Méta'</span>
            <span style={{color:"#C9A96A"}}>Morph'</span>
            <span style={{color:"#C2185B"}}>Ose</span>
          </span>
        </Link>

        {loading ? (
          <div style={{ textAlign:"center" }}>
            <div style={{ width:"40px", height:"40px", border:"2px solid rgba(201,169,106,.2)", borderTop:"2px solid #C9A96A", borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 16px" }}/>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".85rem", color:"rgba(248,245,242,.4)" }}>Vérification en cours…</p>
          </div>
        ) : error ? (
          <div style={{ maxWidth:"500px", textAlign:"center" }}>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", color:"#C2185B", marginBottom:"16px" }}>Lien invalide</p>
            <p style={{ color:"rgba(248,245,242,.5)", fontSize:".88rem", marginBottom:"24px" }}>{error}</p>
            <Link to="/brunch" style={{ color:"#C9A96A", textDecoration:"none", fontSize:".78rem", letterSpacing:".1em", textTransform:"uppercase" }}>
              Retour au Brunch
            </Link>
          </div>
        ) : (
          <div style={{ maxWidth:"560px", width:"100%", animation:"fadeUp .6s both" }}>

            {/* Icône succès */}
            <div style={{ textAlign:"center", marginBottom:"40px" }}>
              <div style={{
                width:"100px", height:"100px", borderRadius:"50%",
                background:"rgba(201,169,106,.08)",
                border:"2px solid #C9A96A",
                display:"flex", alignItems:"center", justifyContent:"center",
                margin:"0 auto 24px",
                animation:"pulse 2s ease-in-out infinite",
              }}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#C9A96A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".3em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"12px" }}>
                Inscription confirmée
              </p>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:600, lineHeight:1.2, marginBottom:"12px" }}>
                Bravo {data?.prenom},<br/>
                <em style={{ fontWeight:400, fontStyle:"italic", color:"#C9A96A" }}>tu fais partie du Brunch 2026.</em>
              </h1>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.55)", lineHeight:1.8 }}>
                {data?.pass_label}
              </p>
            </div>

            {/* Message WhatsApp */}
            <div style={{
              background:"rgba(201,169,106,.06)",
              border:"1px solid rgba(201,169,106,.2)",
              borderRadius:"8px",
              padding:"36px 32px",
              marginBottom:"32px",
              textAlign:"center",
            }}>
              <div style={{ marginBottom:"20px" }}>
                <div style={{ width:"48px", height:"1px", background:"rgba(201,169,106,.3)", margin:"0 auto 20px" }}/>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", fontWeight:600, marginBottom:"16px" }}>
                  Une dernière étape importante
                </h2>
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.7)", lineHeight:1.9 }}>
                  Bravo, ton inscription a été prise en compte. Maintenant rejoins le groupe WhatsApp — c'est ça qui valide définitivement ton inscription au Brunch des Métamorphosées 2026.
                </p>
              </div>

              {data?.wa_groupe ? (
                <a href={data.wa_groupe} target="_blank" rel="noreferrer"
                  style={{
                    display:"inline-flex", alignItems:"center", gap:"12px",
                    background:"#25D366", color:"#fff",
                    fontFamily:"'Montserrat',sans-serif", fontWeight:700,
                    fontSize:".78rem", letterSpacing:".14em", textTransform:"uppercase",
                    padding:"16px 32px", borderRadius:"4px",
                    textDecoration:"none", transition:"all .3s",
                  }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Rejoindre le groupe WhatsApp
                </a>
              ) : (
                <div style={{ background:"rgba(255,255,255,.03)", border:"1px dashed rgba(255,255,255,.1)", borderRadius:"4px", padding:"20px" }}>
                  <p style={{ color:"rgba(248,245,242,.4)", fontSize:".85rem" }}>
                    Le lien du groupe WhatsApp sera partagé par Prélia APEDO AHONON sous 24h.
                  </p>
                </div>
              )}
            </div>

            {/* Contact */}
            <div style={{ textAlign:"center", padding:"24px", background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.06)", borderRadius:"6px", marginBottom:"32px" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".78rem", color:"rgba(248,245,242,.4)", marginBottom:"10px" }}>Pour toute question</p>
              <a href="https://wa.me/22901961140" style={{ color:"#C9A96A", fontSize:".82rem", textDecoration:"none", fontWeight:500 }}>
                WhatsApp Prélia : +229 01 96 11 40 93
              </a>
            </div>

            {/* Citation */}
            <div style={{ textAlign:"center" }}>
              <div style={{ height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.3),transparent)", marginBottom:"28px" }}/>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.1rem", color:"rgba(201,169,106,.5)", lineHeight:1.9, marginBottom:"8px" }}>
                "Célébrer. Connecter. Élever. Distinguer."
              </p>
              <Link to="/" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(248,245,242,.3)", textDecoration:"none" }}>
                Retour à l'accueil
              </Link>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
