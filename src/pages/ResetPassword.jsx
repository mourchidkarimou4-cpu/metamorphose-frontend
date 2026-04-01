import API_URL from '../config.js'
import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@600&family=Montserrat:wght@300;400;500;600&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:none} }
  input:focus { border-color:rgba(201,169,106,.5) !important; }
`;

export default function ResetPassword() {
  const [params]    = useSearchParams();
  const navigate    = useNavigate();
  const token       = params.get("token");

  // Étape 1 — demander le reset
  const [email,     setEmail]     = useState("");
  const [sent,      setSent]      = useState(false);
  const [loading1,  setLoading1]  = useState(false);
  const [error1,    setError1]    = useState("");

  // Étape 2 — nouveau mot de passe
  const [password,  setPassword]  = useState("");
  const [confirm,   setConfirm]   = useState("");
  const [showPwd,   setShowPwd]   = useState(false);
  const [loading2,  setLoading2]  = useState(false);
  const [error2,    setError2]    = useState("");
  const [done,      setDone]      = useState(false);

  async function demanderReset(e) {
    e.preventDefault();
    if (!email.trim()) { setError1("Veuillez entrer votre email."); return; }
    setLoading1(true); setError1("");
    try {
      await fetch(API_URL + '/api/auth/reset-password/', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, origin: window.location.origin }),
      });
      setSent(true);
    } catch { setError1("Serveur inaccessible."); }
    setLoading1(false);
  }

  async function confirmerReset(e) {
    e.preventDefault();
    if (password.length < 8)   { setError2("8 caractères minimum."); return; }
    if (password !== confirm)  { setError2("Les mots de passe ne correspondent pas."); return; }
    setLoading2(true); setError2("");
    try {
      const res = await fetch(API_URL + '/api/auth/reset-confirm/', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });
      const d = await res.json();
      if (res.ok) { setDone(true); setTimeout(() => navigate("/espace-membre"), 3000); }
      else        { setError2(d.detail || "Lien invalide ou expiré."); }
    } catch { setError2("Serveur inaccessible."); }
    setLoading2(false);
  }

  const inputStyle = {
    width:"100%", padding:"13px 16px",
    background:"rgba(255,255,255,.04)", border:"1px solid rgba(255,255,255,.08)",
    borderRadius:"3px", color:"#F8F5F2",
    fontFamily:"'Montserrat'", fontSize:".88rem", fontWeight:300, outline:"none",
  };

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ background:"#0A0A0A", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"24px", fontFamily:"'Montserrat',sans-serif" }}>
        <div style={{ maxWidth:"420px", width:"100%", animation:"fadeUp .6s both" }}>

          {/* Logo */}
          <div style={{ textAlign:"center", marginBottom:"36px" }}>
            <Link to="/" style={{ textDecoration:"none" }}>
              <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.1rem" }}>
                <span style={{color:"#F8F5F2"}}>Meta'</span>
                <span style={{color:"#C9A96A"}}>Morph'</span>
                <span style={{color:"#C2185B"}}>Ose</span>
              </p>
            </Link>
          </div>

          <div style={{ background:"#141414", border:"1px solid rgba(201,169,106,.12)", borderRadius:"6px", padding:"clamp(28px,6vw,48px)" }}>

            {/* ── Étape 1 : Demander le reset ── */}
            {!token && !sent && (
              <>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.4rem", fontWeight:600, marginBottom:"8px", textAlign:"center", color:"#F8F5F2" }}>
                  Mot de passe oublié
                </h1>
                <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.4)", textAlign:"center", marginBottom:"28px", lineHeight:1.65 }}>
                  Entrez votre email et nous vous enverrons un lien de réinitialisation.
                </p>
                {error1 && (
                  <div style={{ padding:"12px 16px", marginBottom:"16px", background:"rgba(194,24,91,.08)", border:"1px solid rgba(194,24,91,.3)", borderRadius:"3px", fontSize:".82rem", color:"#C2185B" }}>
                    {error1}
                  </div>
                )}
                <form onSubmit={demanderReset} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                  <div>
                    <label style={{ fontFamily:"'Montserrat'", fontSize:".65rem", letterSpacing:".12em", textTransform:"uppercase", color:"rgba(248,245,242,.4)", display:"block", marginBottom:"7px" }}>Email</label>
                    <input style={inputStyle} type="email" placeholder="votre@email.com" value={email} onChange={e=>setEmail(e.target.value)} required/>
                  </div>
                  <button type="submit" disabled={loading1} style={{ padding:"15px", background:"#C2185B", color:"#fff", border:"none", borderRadius:"3px", fontFamily:"'Montserrat'", fontWeight:600, fontSize:".75rem", letterSpacing:".15em", textTransform:"uppercase", cursor:loading1?"not-allowed":"pointer", opacity:loading1?.7:1, transition:"all .3s" }}>
                    {loading1 ? "Envoi..." : "Envoyer le lien"}
                  </button>
                </form>
              </>
            )}

            {/* ── Email envoyé ── */}
            {!token && sent && (
              <div style={{ textAlign:"center" }}>
                <div style={{ width:"56px", height:"56px", borderRadius:"50%", background:"rgba(76,175,80,.1)", border:"2px solid rgba(76,175,80,.4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:"1.5rem", color:"#4CAF50" }}>✓</div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", marginBottom:"12px", color:"#F8F5F2" }}>Email envoyé</h2>
                <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.5)", lineHeight:1.7, marginBottom:"20px" }}>
                  Si un compte existe avec <strong style={{color:"#C9A96A"}}>{email}</strong>, vous recevrez un lien de réinitialisation dans quelques minutes.
                </p>
                <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".78rem", color:"rgba(248,245,242,.3)" }}>
                  Vérifiez également vos spams.
                </p>
              </div>
            )}

            {/* ── Étape 2 : Nouveau mot de passe ── */}
            {token && !done && (
              <>
                <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.4rem", fontWeight:600, marginBottom:"8px", textAlign:"center", color:"#F8F5F2" }}>
                  Nouveau mot de passe
                </h1>
                <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.4)", textAlign:"center", marginBottom:"28px" }}>
                  Choisissez un mot de passe sécurisé.
                </p>
                {error2 && (
                  <div style={{ padding:"12px 16px", marginBottom:"16px", background:"rgba(194,24,91,.08)", border:"1px solid rgba(194,24,91,.3)", borderRadius:"3px", fontSize:".82rem", color:"#C2185B" }}>
                    {error2}
                  </div>
                )}
                <form onSubmit={confirmerReset} style={{ display:"flex", flexDirection:"column", gap:"14px" }}>
                  <div>
                    <label style={{ fontFamily:"'Montserrat'", fontSize:".65rem", letterSpacing:".12em", textTransform:"uppercase", color:"rgba(248,245,242,.4)", display:"block", marginBottom:"7px" }}>Nouveau mot de passe</label>
                    <div style={{ position:"relative" }}>
                      <input style={{...inputStyle, paddingRight:"60px"}} type={showPwd?"text":"password"} placeholder="8 caractères minimum" value={password} onChange={e=>setPassword(e.target.value)} required/>
                      <button type="button" onClick={()=>setShowPwd(!showPwd)} style={{ position:"absolute", right:"12px", top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"rgba(248,245,242,.4)", cursor:"pointer", fontFamily:"'Montserrat'", fontSize:".7rem" }}>
                        {showPwd?"Cacher":"Voir"}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label style={{ fontFamily:"'Montserrat'", fontSize:".65rem", letterSpacing:".12em", textTransform:"uppercase", color:"rgba(248,245,242,.4)", display:"block", marginBottom:"7px" }}>Confirmer</label>
                    <input style={{...inputStyle, borderColor:confirm&&confirm!==password?"rgba(239,83,80,.5)":"rgba(255,255,255,.08)"}} type={showPwd?"text":"password"} placeholder="Répéter le mot de passe" value={confirm} onChange={e=>setConfirm(e.target.value)} required/>
                    {confirm && confirm !== password && (
                      <p style={{ color:"#ef5350", fontSize:".75rem", marginTop:"4px" }}>Ne correspondent pas</p>
                    )}
                  </div>
                  <button type="submit" disabled={loading2||(confirm&&confirm!==password)} style={{ padding:"15px", background:"#C2185B", color:"#fff", border:"none", borderRadius:"3px", fontFamily:"'Montserrat'", fontWeight:600, fontSize:".75rem", letterSpacing:".15em", textTransform:"uppercase", cursor:loading2?"not-allowed":"pointer", opacity:loading2?.7:1 }}>
                    {loading2 ? "Réinitialisation..." : "Réinitialiser mon mot de passe"}
                  </button>
                </form>
              </>
            )}

            {/* ── Succès ── */}
            {token && done && (
              <div style={{ textAlign:"center" }}>
                <div style={{ width:"56px", height:"56px", borderRadius:"50%", background:"rgba(76,175,80,.1)", border:"2px solid rgba(76,175,80,.4)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 20px", fontSize:"1.5rem", color:"#4CAF50" }}>✓</div>
                <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", marginBottom:"12px", color:"#F8F5F2" }}>Mot de passe réinitialisé</h2>
                <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.5)", lineHeight:1.7 }}>
                  Vous allez être redirigée vers la page de connexion...
                </p>
              </div>
            )}

            {/* Lien retour connexion */}
            <div style={{ textAlign:"center", marginTop:"24px", paddingTop:"20px", borderTop:"1px solid rgba(255,255,255,.06)" }}>
              <Link to="/espace-membre" style={{ fontFamily:"'Montserrat'", fontSize:".75rem", color:"rgba(201,169,106,.6)", textDecoration:"none" }}>
                Retour à la connexion
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
