import { useState } from "react";
import { useNavigate } from "react-router-dom";
import InscriptionForm from "./InscriptionForm";

/* ================================================================
   AuthModal — Modale combinée Inscription + Login
   Usage : <AuthModal onClose={() => setShow(false)} defaultTab="login|inscription" />
   ================================================================ */

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
  @keyframes modalIn {
    from { opacity:0; transform:scale(.95) translateY(16px); }
    to   { opacity:1; transform:scale(1) translateY(0); }
  }
  @keyframes overlayIn {
    from { opacity:0; }
    to   { opacity:1; }
  }
  .auth-input {
    width:100%; padding:13px 16px;
    background:rgba(255,255,255,.04);
    border:1px solid rgba(255,255,255,.09);
    border-radius:3px; outline:none;
    color:#F8F5F2; font-family:'Montserrat',sans-serif;
    font-size:.88rem; font-weight:300;
    transition:border .25s;
  }
  .auth-input:focus { border-color:rgba(201,169,106,.45); }
  .auth-input::placeholder { opacity:.35; }
`;

export default function AuthModal({ onClose, defaultTab = "inscription" }) {
  const [tab, setTab]         = useState(defaultTab); // "inscription" | "login"
  const [email, setEmail]     = useState("");
  const [password, setPass]   = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res  = await fetch("/api/auth/login/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("mmorphose_token", data.access);
        localStorage.setItem("mmorphose_user", JSON.stringify(data.user));
        onClose();
        navigate("/dashboard");
      } else {
        setError(data.detail || "Identifiants incorrects.");
      }
    } catch {
      setError("Serveur inaccessible. Réessayez.");
    }
    setLoading(false);
  }

  return (
    <>
      <style>{STYLES}</style>

      {/* Overlay */}
      <div
        onClick={onClose}
        style={{
          position: "fixed", inset: 0, zIndex: 400,
          background: "rgba(10,10,10,.88)",
          backdropFilter: "blur(14px)",
          animation: "overlayIn .3s both",
        }}
      />

      {/* Modale */}
      <div style={{
        position: "fixed", inset: 0, zIndex: 401,
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: "24px", overflowY: "auto",
        pointerEvents: "none",
      }}>
        <div style={{
          maxWidth: "520px", width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          background: "#141414",
          border: "1px solid rgba(201,169,106,.15)",
          borderRadius: "6px",
          pointerEvents: "all",
          animation: "modalIn .4s both",
          position: "relative",
        }}>
          {/* Fermer */}
          <button onClick={onClose} style={{
            position: "absolute", top: "16px", right: "18px",
            background: "none", border: "none",
            color: "rgba(201,169,106,.5)", fontSize: "1.3rem",
            cursor: "pointer", lineHeight: 1,
          }}></button>

          {/* Logo */}
          <div style={{ textAlign: "center", padding: "36px 36px 0" }}>
            <p style={{ fontFamily: "'Playfair Display',serif", fontSize: "1rem", marginBottom: "20px" }}>
              <span style={{color:"#F8F5F2"}}>Méta'</span>
              <span style={{color:"#C9A96A"}}>Morph'</span>
              <span style={{color:"#C2185B"}}>Ose</span>
            </p>

            {/* Tabs */}
            <div style={{
              display: "flex", background: "rgba(255,255,255,.04)",
              borderRadius: "4px", padding: "4px", gap: "4px",
            }}>
              {[
                ["inscription", "Je m'inscris"],
                ["login",       "Mon espace membre"],
              ].map(([id, label]) => (
                <button key={id} onClick={() => { setTab(id); setError(""); }} style={{
                  flex: 1, padding: "10px 16px", borderRadius: "3px", border: "none",
                  background: tab === id ? "#C2185B" : "transparent",
                  color: tab === id ? "#fff" : "rgba(248,245,242,.4)",
                  fontFamily: "'Montserrat',sans-serif", fontSize: ".72rem",
                  fontWeight: 600, letterSpacing: ".1em", textTransform: "uppercase",
                  cursor: "pointer", transition: "all .25s",
                }}>{label}</button>
              ))}
            </div>
          </div>

          <div style={{ padding: "28px 36px 36px" }}>

            {/* ── ONGLET INSCRIPTION ── */}
            {tab === "inscription" && (
              <div>
                <p style={{
                  fontFamily: "'Montserrat',sans-serif", fontWeight: 300,
                  fontSize: ".82rem", color: "rgba(248,245,242,.45)",
                  textAlign: "center", marginBottom: "20px", lineHeight: 1.65,
                }}>
                  Choisissez votre formule et envoyez votre demande.<br/>
                  Prélia vous contacte sous 24–48h.
                </p>
                <InscriptionForm
                  theme="dark"
                  compact={true}
                  onSuccess={() => {
                    // Garder la modale ouverte sur l'écran succès
                  }}
                />
              </div>
            )}

            {/* ── ONGLET LOGIN ── */}
            {tab === "login" && (
              <div>
                <h3 style={{
                  fontFamily: "'Playfair Display',serif", fontSize: "1.4rem",
                  fontWeight: 600, color: "#F8F5F2", textAlign: "center",
                  marginBottom: "6px",
                }}>Connexion</h3>
                <p style={{
                  fontFamily: "'Montserrat',sans-serif", fontWeight: 300,
                  fontSize: ".82rem", color: "rgba(248,245,242,.4)",
                  textAlign: "center", marginBottom: "24px",
                }}>Accédez à vos replays et guides PDF</p>

                {error && (
                  <div style={{
                    padding: "12px 16px", marginBottom: "18px",
                    background: "rgba(194,24,91,.08)",
                    border: "1px solid rgba(194,24,91,.3)",
                    borderRadius: "3px", fontSize: ".82rem",
                    fontWeight: 300, color: "#C2185B",
                  }}>{error}</div>
                )}

                <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
                  <div>
                    <label style={{ fontFamily: "'Montserrat',sans-serif", fontSize: ".65rem", fontWeight: 500, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(248,245,242,.45)", display: "block", marginBottom: "7px" }}>Email</label>
                    <input className="auth-input" type="email" placeholder="votre@email.com"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div>
                    <label style={{ fontFamily: "'Montserrat',sans-serif", fontSize: ".65rem", fontWeight: 500, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(248,245,242,.45)", display: "block", marginBottom: "7px" }}>Mot de passe</label>
                    <input className="auth-input" type="password" placeholder="••••••••"
                      value={password} onChange={e => setPass(e.target.value)} required />
                  </div>
                  <button type="submit" disabled={loading} style={{
                    marginTop: "8px", padding: "15px",
                    background: "#C2185B", color: "#fff", border: "none", borderRadius: "3px",
                    fontFamily: "'Montserrat',sans-serif", fontWeight: 600,
                    fontSize: ".75rem", letterSpacing: ".15em", textTransform: "uppercase",
                    cursor: loading ? "not-allowed" : "pointer",
                    opacity: loading ? .7 : 1, transition: "all .3s",
                  }}
                  onMouseEnter={e => { if (!loading) e.target.style.background = "#a01049"; }}
                  onMouseLeave={e => { e.target.style.background = "#C2185B"; }}
                  >
                    {loading ? "Connexion…" : "Accéder à mon espace "}
                  </button>
                </form>

                <div style={{ marginTop: "20px", textAlign: "center" }}>
                  <p style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 300, fontSize: ".78rem", color: "rgba(248,245,242,.25)", marginBottom: "10px" }}>
                    Pas encore membre ?
                  </p>
                  <button onClick={() => setTab("inscription")} style={{
                    background: "none", border: "1px solid rgba(201,169,106,.25)",
                    borderRadius: "3px", padding: "10px 24px", cursor: "pointer",
                    fontFamily: "'Montserrat',sans-serif", fontSize: ".72rem",
                    fontWeight: 500, letterSpacing: ".12em", textTransform: "uppercase",
                    color: "#C9A96A", transition: "all .3s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(201,169,106,.08)"}
                  onMouseLeave={e => e.currentTarget.style.background = "none"}
                  >
                    Découvrir le programme 
                  </button>
                </div>

                {/* Contact direct */}
                <div style={{
                  marginTop: "20px", padding: "14px 16px",
                  background: "rgba(255,255,255,.02)",
                  border: "1px solid rgba(255,255,255,.05)",
                  borderRadius: "3px", textAlign: "center",
                }}>
                  <p style={{ fontFamily: "'Montserrat',sans-serif", fontWeight: 300, fontSize: ".75rem", color: "rgba(248,245,242,.3)", marginBottom: "8px" }}>
                    Problème de connexion ?
                  </p>
                  <a href="https://wa.me/22901961140933" style={{ color: "#C9A96A", fontFamily: "'Montserrat',sans-serif", fontSize: ".75rem", fontWeight: 500, textDecoration: "none" }}>
                    Contacter Prélia sur WhatsApp
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
