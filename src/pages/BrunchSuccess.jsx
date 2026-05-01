import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";

const API_BASE = import.meta.env.VITE_API_URL || '';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@1,300;1,400&family=Montserrat:wght@200;300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { background:#060608; color:#F8F5F2; font-family:'Montserrat',sans-serif; font-weight:300; overflow-x:hidden; }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  @keyframes pulse     { 0%,100%{transform:scale(1);opacity:.9} 50%{transform:scale(1.08);opacity:1} }
  @keyframes ripple    { 0%{transform:scale(1);opacity:.5} 100%{transform:scale(2.8);opacity:0} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes glow      { 0%,100%{box-shadow:0 0 30px rgba(201,169,106,.2)} 50%{box-shadow:0 0 60px rgba(201,169,106,.45),0 0 100px rgba(201,169,106,.1)} }
  @keyframes fall      {
    0%  { transform:translateY(-5vh) translateX(0) rotate(0deg); opacity:0; }
    5%  { opacity:.6; }
    95% { opacity:.15; }
    100%{ transform:translateY(105vh) translateX(var(--dx,20px)) rotate(var(--r,360deg)); opacity:0; }
  }

  .confetti { position:fixed; pointer-events:none; z-index:0; top:0; width:6px; border-radius:1px; animation:fall var(--dur,5s) var(--delay,0s) ease-in forwards; }
`;

const CONFETTIS = [
  { left:"8%",  color:"#C9A96A", dur:"5.2s", delay:"0s",    dx:"30px",  r:"340deg", height:"14px" },
  { left:"22%", color:"#C2185B", dur:"4.8s", delay:".3s",   dx:"-20px", r:"420deg", height:"10px" },
  { left:"38%", color:"#E8D5A8", dur:"5.8s", delay:".1s",   dx:"15px",  r:"280deg", height:"12px" },
  { left:"55%", color:"#C9A96A", dur:"4.5s", delay:".5s",   dx:"-30px", r:"500deg", height:"8px"  },
  { left:"68%", color:"#C2185B", dur:"6.1s", delay:".2s",   dx:"25px",  r:"390deg", height:"16px" },
  { left:"80%", color:"#E8D5A8", dur:"5.4s", delay:".4s",   dx:"-15px", r:"310deg", height:"11px" },
  { left:"15%", color:"#D8C1A0", dur:"5.9s", delay:".6s",   dx:"20px",  r:"450deg", height:"9px"  },
  { left:"90%", color:"#C9A96A", dur:"4.7s", delay:".15s",  dx:"-25px", r:"360deg", height:"13px" },
];

export default function BrunchSuccess() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");

  useEffect(() => {
    if (!token) { setError("Lien invalide."); setLoading(false); return; }
    fetch(`${API_BASE}/api/auth/verifier-brunch/?token=${token}`)
      .then(r => r.json())
      .then(d => { if (d.valid) setData(d); else setError("Ce lien est invalide ou expiré."); })
      .catch(() => setError("Erreur réseau."))
      .finally(() => setLoading(false));
  }, [token]);

  return (
    <>
      <style>{STYLES}</style>

      {/* Confettis */}
      {data && CONFETTIS.map((c, i) => (
        <div key={i} className="confetti" style={{ left:c.left, background:c.color, height:c.height, "--dur":c.dur, "--delay":c.delay, "--dx":c.dx, "--r":c.r }}/>
      ))}

      <div style={{ minHeight:"100vh", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", padding:"48px 24px", position:"relative", zIndex:1 }}>

        {/* Lueur de fond */}
        <div style={{ position:"fixed", top:"40%", left:"50%", transform:"translate(-50%,-50%)", width:"600px", height:"600px", background:"radial-gradient(ellipse,rgba(201,169,106,.06),transparent 70%)", pointerEvents:"none", zIndex:0 }}/>

        {/* Logo */}
        <Link to="/" style={{ textDecoration:"none", marginBottom:"60px", position:"relative", zIndex:1 }}>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem" }}>
            <span style={{color:"#F8F5F2"}}>Méta'</span>
            <span style={{color:"#C9A96A"}}>Morph'</span>
            <span style={{color:"#C2185B"}}>Ose</span>
          </span>
        </Link>

        {loading ? (
          <div style={{ textAlign:"center", zIndex:1 }}>
            <div style={{ width:"40px", height:"40px", border:"1px solid rgba(201,169,106,.2)", borderTop:"1px solid #C9A96A", borderRadius:"50%", animation:"spin 1s linear infinite", margin:"0 auto 16px" }}/>
            <p style={{ fontSize:".8rem", color:"rgba(248,245,242,.3)", letterSpacing:".1em" }}>Vérification…</p>
          </div>

        ) : error ? (
          <div style={{ maxWidth:"480px", textAlign:"center", zIndex:1 }}>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", color:"#C2185B", marginBottom:"16px" }}>Lien invalide</p>
            <p style={{ color:"rgba(248,245,242,.4)", fontSize:".88rem", marginBottom:"28px" }}>{error}</p>
            <Link to="/brunch" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".7rem", letterSpacing:".18em", textTransform:"uppercase", color:"rgba(201,169,106,.6)", textDecoration:"none" }}>
              Retour au Brunch
            </Link>
          </div>

        ) : (
          <div style={{ maxWidth:"580px", width:"100%", position:"relative", zIndex:1, animation:"fadeUp .7s both" }}>

            {/* Cercle lumineux */}
            <div style={{ textAlign:"center", marginBottom:"48px", position:"relative" }}>
              {/* Anneau ripple externe */}
              <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"120px", height:"120px", borderRadius:"50%", border:"1px solid rgba(201,169,106,.3)", animation:"ripple 2.5s ease-out infinite" }}/>
              <div style={{ position:"absolute", top:"50%", left:"50%", transform:"translate(-50%,-50%)", width:"120px", height:"120px", borderRadius:"50%", border:"1px solid rgba(201,169,106,.2)", animation:"ripple 2.5s .8s ease-out infinite" }}/>
              {/* Cercle principal */}
              <div style={{
                width:"100px", height:"100px", borderRadius:"50%",
                background:"rgba(201,169,106,.08)",
                border:"1px solid rgba(201,169,106,.35)",
                display:"inline-flex", alignItems:"center", justifyContent:"center",
                animation:"glow 3s ease-in-out infinite",
                position:"relative",
              }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#C9A96A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
            </div>

            {/* Message principal */}
            <div style={{ textAlign:"center", marginBottom:"40px" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:200, fontSize:".58rem", letterSpacing:".42em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", marginBottom:"16px" }}>
                Inscription confirmée
              </p>
              <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.8rem,5vw,2.8rem)", fontWeight:700, lineHeight:1.1, marginBottom:"16px" }}>
                Bravo {data?.prenom},<br/>
                <em style={{ fontStyle:"italic", fontWeight:400, color:"#C9A96A" }}>tu fais partie du Brunch.</em>
              </h1>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.1rem", color:"rgba(248,245,242,.45)" }}>
                {data?.pass_label}
              </p>
            </div>

            {/* Ligne or */}
            <div style={{ height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.3),transparent)", margin:"0 0 40px" }}/>

            {/* Message WhatsApp */}
            <div style={{ background:"rgba(201,169,106,.04)", border:"1px solid rgba(201,169,106,.15)", padding:"40px 36px", marginBottom:"28px", textAlign:"center", position:"relative" }}>
              <div style={{ position:"absolute", top:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.3),transparent)" }}/>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.25rem", fontWeight:600, marginBottom:"18px" }}>
                Une dernière étape
              </h2>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.6)", lineHeight:1.9, marginBottom:"28px" }}>
                Ton inscription a bien été prise en compte. Rejoins maintenant le groupe WhatsApp — <strong style={{ color:"#F8F5F2", fontWeight:500 }}>c'est ça qui valide définitivement ton inscription</strong> au Brunch des Métamorphosées 2026.
              </p>

              {data?.wa_groupe ? (
                <a href={data.wa_groupe} target="_blank" rel="noreferrer"
                  style={{ display:"inline-flex", alignItems:"center", gap:"12px", background:"#25D366", color:"#fff", fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:".74rem", letterSpacing:".16em", textTransform:"uppercase", padding:"16px 32px", textDecoration:"none", boxShadow:"0 0 40px rgba(37,211,102,.2)", transition:"all .3s" }}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="#fff">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                  Rejoindre le groupe WhatsApp
                </a>
              ) : (
                <div style={{ padding:"20px 24px", background:"rgba(255,255,255,.02)", border:"1px dashed rgba(255,255,255,.08)" }}>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".84rem", color:"rgba(248,245,242,.35)", fontWeight:300 }}>
                    Le lien du groupe WhatsApp sera partagé par Prélia APEDO AHONON sous 24h.
                  </p>
                </div>
              )}
              <div style={{ position:"absolute", bottom:0, left:0, right:0, height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.3),transparent)" }}/>
            </div>

            {/* Contact */}
            <div style={{ textAlign:"center", padding:"24px", background:"rgba(255,255,255,.015)", border:"1px solid rgba(255,255,255,.05)", marginBottom:"40px" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".7rem", color:"rgba(248,245,242,.3)", marginBottom:"10px", letterSpacing:".1em", textTransform:"uppercase" }}>Pour toute question</p>
              <a href="https://wa.me/22901961140" style={{ color:"#C9A96A", fontSize:".84rem", textDecoration:"none", fontWeight:400 }}>
                WhatsApp Prélia APEDO AHONON : +229 01 96 11 40 93
              </a>
            </div>

            {/* Citation finale */}
            <div style={{ textAlign:"center" }}>
              <div style={{ height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.2),transparent)", marginBottom:"28px" }}/>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.15rem", color:"rgba(201,169,106,.45)", lineHeight:1.8, marginBottom:"20px" }}>
                "Célébrer. Connecter. Élever. Distinguer."
              </p>
              <Link to="/" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".65rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(248,245,242,.25)", textDecoration:"none" }}>
                Retour à l'accueil
              </Link>
            </div>

          </div>
        )}
      </div>
    </>
  );
}
