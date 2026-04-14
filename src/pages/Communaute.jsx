import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import API_URL from "../config";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --noir:#0A0A0A; --or:#C9A96A; --or-light:#E8D5A8;
    --rose:#C2185B; --blanc:#F8F5F2; --marine:#0D1B2A;
    --ff-t:'Playfair Display',Georgia,serif;
    --ff-b:'Montserrat',sans-serif;
    --ff-a:'Cormorant Garamond',Georgia,serif;
  }
  html { scroll-behavior:smooth; }
  body { background:var(--noir); color:var(--blanc); font-family:var(--ff-b); font-weight:300; line-height:1.7; overflow-x:hidden; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  @keyframes shimmerGold { 0%{background-position:-200% center} 100%{background-position:200% center} }
  .reveal { opacity:0; transform:translateY(30px); transition:opacity .8s ease,transform .8s ease; }
  .reveal.visible { opacity:1; transform:none; }
  .principe-card { padding:36px 32px; background:rgba(255,255,255,.018); border:1px solid rgba(255,255,255,.06); border-left:2px solid rgba(201,169,106,.35); border-radius:2px; transition:border-color .35s, background .35s; }
  .principe-card:hover { border-left-color:#C9A96A; background:rgba(201,169,106,.03); }
  .engagement-btn { width:100%; padding:20px 32px; background:transparent; border:1px solid rgba(201,169,106,.3); border-radius:2px; color:rgba(248,245,242,.5); font-family:'Montserrat',sans-serif; font-size:.78rem; font-weight:500; letter-spacing:.14em; text-transform:uppercase; cursor:pointer; transition:all .4s; display:flex; align-items:center; justify-content:center; gap:16px; }
  .engagement-btn:hover { border-color:#C9A96A; color:#C9A96A; background:rgba(201,169,106,.04); }
  .engagement-btn.engaged { border-color:#C9A96A; color:#C9A96A; background:rgba(201,169,106,.06); }
  .checkbox-custom { width:20px; height:20px; border:1px solid rgba(201,169,106,.4); border-radius:2px; flex-shrink:0; display:flex; align-items:center; justify-content:center; transition:all .3s; background:transparent; }
  .checkbox-custom.checked { background:#C9A96A; border-color:#C9A96A; }
  .check-mark { width:10px; height:6px; border-left:2px solid #0A0A0A; border-bottom:2px solid #0A0A0A; transform:rotate(-45deg) translateY(-2px); opacity:0; transition:opacity .2s; }
  .check-mark.visible { opacity:1; }
  @media(max-width:768px) { .principes-grid { grid-template-columns:1fr !important; } }
`;

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.1 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

const PRINCIPES = [
  {
    num: "01",
    titre: "Respect et bienveillance",
    texte: "Chaque femme ici est en chemin. Aucune critique blessante, aucun jugement, aucune comparaison toxique ne sont tolérés. Nous nous parlons avec respect, douceur et intelligence.",
    items: null,
  },
  {
    num: "02",
    titre: "Engagement et implication",
    texte: "Cette communauté n'est pas un espace passif. Tu es invitée à participer, partager et t'impliquer dans ton évolution.",
    items: ["Participer", "Partager", "S'impliquer dans son évolution"],
    note: "Plus tu t'engages, plus tu évolues.",
  },
  {
    num: "03",
    titre: "Authenticité",
    texte: "Sois vraie. Sois toi. Cet espace est un lieu sécurisé où tu peux t'exprimer sans masque, sans pression, sans peur du regard des autres.",
    items: null,
  },
  {
    num: "04",
    titre: "Aucune promotion personnelle",
    texte: "Pour préserver la qualité de l'expérience, les éléments suivants ne sont pas autorisés sans validation préalable.",
    items: ["Publicité", "Vente", "Spam"],
    note: null,
  },
  {
    num: "05",
    titre: "Confidentialité absolue",
    texte: "Ce qui est partagé ici reste ici. Chaque membre doit se sentir en sécurité pour s'exprimer librement.",
    items: null,
  },
  {
    num: "06",
    titre: "Esprit de croissance",
    texte: "Ici, nous ne stagnons pas. Nous sommes des femmes qui apprennent, évoluent, se challengent et deviennent meilleures chaque jour.",
    items: ["Apprendre", "Évoluer", "Se challenger", "Devenir meilleure chaque jour"],
    note: null,
  },
  {
    num: "07",
    titre: "Responsabilité personnelle",
    texte: "Ta transformation t'appartient. La communauté est un soutien — mais c'est ton engagement qui fera la différence.",
    items: null,
  },
];

export default function Communaute() {
  useReveal();
  const navigate = useNavigate();
  const [engaged,  setEngaged]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [saved,    setSaved]    = useState(false);

  const user  = JSON.parse(localStorage.getItem("mmorphose_user")  || "null");
  const token = localStorage.getItem("mmorphose_token");

  useEffect(() => {
    if (!user || !token) { navigate("/espace-membre"); }
  }, []);

  async function sEngager() {
    if (engaged) return;
    setEngaged(true);
    setSaving(true);
    try {
      await fetch(`${API_URL}/api/auth/engagement-communaute/`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ engagement: true }),
      });
      setSaved(true);
    } catch { /* silencieux — l'état local suffit */ }
    setSaving(false);
  }

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ background:"#0A0A0A", color:"#F8F5F2", minHeight:"100vh" }}>

        {/* Nav */}
        <nav style={{ padding:"18px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"rgba(10,10,10,.97)", backdropFilter:"blur(20px)", zIndex:100 }}>
          <Link to="/" style={{ textDecoration:"none" }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem" }}>
              <span style={{color:"#F8F5F2"}}>Meta'</span>
              <span style={{color:"#C9A96A"}}>Morph'</span>
              <span style={{color:"#C2185B"}}>Ose</span>
            </span>
          </Link>
          <Link to="/dashboard" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}>Mon espace</Link>
        </nav>

        {/* Hero */}
        <section style={{ padding:"120px 24px 80px", textAlign:"center", background:"linear-gradient(180deg,#0A0A0A 0%,#0D1020 100%)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 70% 50% at 50% 70%,rgba(201,169,106,.05),transparent)", pointerEvents:"none" }}/>
          <div style={{ position:"relative", maxWidth:"680px", margin:"0 auto" }}>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".35em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", marginBottom:"20px", animation:"fadeUp .6s both" }}>
              Cercle privé — Réservé aux Métamorphosées
            </p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,6vw,3.8rem)", fontWeight:400, lineHeight:1.08, marginBottom:"32px", animation:"fadeUp .7s .1s both", letterSpacing:"-.01em" }}>
              Bienvenue dans<br/>
              <em style={{ fontStyle:"italic", fontWeight:300, background:"linear-gradient(135deg,#C9A96A,#E8D5A8,#C9A96A)", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmerGold 4s linear infinite" }}>
                un espace d'exception.
              </em>
            </h1>
            <div style={{ width:"40px", height:"1px", background:"rgba(201,169,106,.4)", margin:"0 auto 32px", animation:"fadeUp .7s .2s both" }}/>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:"clamp(.88rem,2vw,1rem)", color:"rgba(248,245,242,.55)", lineHeight:1.9, animation:"fadeUp .7s .25s both" }}>
              Cette communauté est un cercle privé, réservé exclusivement aux femmes
              ayant suivi le programme Métamorphose. Ici, nous cultivons la croissance,
              l'élégance, le respect et l'élévation.
            </p>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1rem", color:"rgba(201,169,106,.6)", marginTop:"24px", animation:"fadeUp .7s .3s both" }}>
              Pour préserver la qualité et l'énergie de cet espace, chaque membre
              s'engage à respecter les principes suivants.
            </p>
          </div>
        </section>

        <div style={{ maxWidth:"1000px", margin:"0 auto", padding:"0 24px 120px" }}>

          {/* Séparateur */}
          <div style={{ display:"flex", alignItems:"center", gap:"24px", padding:"48px 0" }}>
            <div style={{ flex:1, height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.2))" }}/>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".3em", textTransform:"uppercase", color:"rgba(201,169,106,.35)", whiteSpace:"nowrap" }}>Les 7 principes</p>
            <div style={{ flex:1, height:"1px", background:"linear-gradient(90deg,rgba(201,169,106,.2),transparent)" }}/>
          </div>

          {/* Principes */}
          <div className="principes-grid" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"16px" }}>
            {PRINCIPES.map((p, i) => (
              <div key={i} className={`principe-card reveal`} style={{ transitionDelay:`${i*.07}s`, gridColumn: i === 6 ? "1 / -1" : "auto" }}>
                <div style={{ display:"flex", alignItems:"baseline", gap:"16px", marginBottom:"16px" }}>
                  <span style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.4rem", color:"rgba(201,169,106,.3)", lineHeight:1, flexShrink:0 }}>{p.num}</span>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", fontWeight:600, color:"rgba(248,245,242,.9)", lineHeight:1.3 }}>{p.titre}</h3>
                </div>
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.55)", lineHeight:1.8, marginBottom:p.items ? "14px" : "0" }}>
                  {p.texte}
                </p>
                {p.items && (
                  <div style={{ display:"flex", flexDirection:"column", gap:"6px", marginBottom:p.note ? "14px" : "0" }}>
                    {p.items.map((item, j) => (
                      <div key={j} style={{ display:"flex", gap:"12px", alignItems:"center" }}>
                        <div style={{ width:"3px", height:"3px", borderRadius:"50%", background:"rgba(201,169,106,.5)", flexShrink:0 }}/>
                        <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"rgba(248,245,242,.6)", fontWeight:300 }}>{item}</p>
                      </div>
                    ))}
                  </div>
                )}
                {p.note && (
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:".9rem", color:"rgba(201,169,106,.6)", marginTop:"8px" }}>
                    {p.note}
                  </p>
                )}
              </div>
            ))}
          </div>

          {/* Séparateur */}
          <div style={{ display:"flex", alignItems:"center", gap:"24px", padding:"64px 0 48px" }}>
            <div style={{ flex:1, height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.2))" }}/>
            <div style={{ width:"5px", height:"5px", borderRadius:"50%", background:"rgba(201,169,106,.4)" }}/>
            <div style={{ flex:1, height:"1px", background:"linear-gradient(90deg,rgba(201,169,106,.2),transparent)" }}/>
          </div>

          {/* Rappel final */}
          <section className="reveal" style={{ maxWidth:"680px", margin:"0 auto", textAlign:"center", marginBottom:"72px" }}>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".3em", textTransform:"uppercase", color:"rgba(201,169,106,.4)", marginBottom:"20px" }}>
              Rappel final
            </p>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"clamp(1.1rem,3vw,1.4rem)", color:"rgba(248,245,242,.7)", lineHeight:1.85, marginBottom:"24px" }}>
              Tu n'es pas ici par hasard. Tu fais partie d'un cercle de femmes qui ont
              décidé de se choisir, de s'élever et de devenir une référence dans leur
              vie personnelle et professionnelle.
            </p>
            <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1rem,2.5vw,1.15rem)", color:"rgba(248,245,242,.85)", lineHeight:1.75 }}>
              Honore cet espace. Honore ton engagement.<br/>
              Et surtout — honore la femme que tu deviens.
            </p>
          </section>

          {/* Engagement */}
          <section className="reveal" style={{ maxWidth:"640px", margin:"0 auto" }}>
            {saved && (
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".72rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.7)", textAlign:"center", marginBottom:"16px" }}>
                Engagement enregistré
              </p>
            )}
            <button
              className={`engagement-btn ${engaged ? "engaged" : ""}`}
              onClick={sEngager}
              disabled={engaged || saving}
            >
              <div className={`checkbox-custom ${engaged ? "checked" : ""}`}>
                <div className={`check-mark ${engaged ? "visible" : ""}`}/>
              </div>
              <span style={{ letterSpacing:".12em" }}>
                {saving ? "Enregistrement..." : "Je m'engage à respecter ces règles et à évoluer pleinement"}
              </span>
            </button>

            {engaged && (
              <div style={{ marginTop:"32px", textAlign:"center", animation:"fadeUp .6s both" }}>
                <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.1rem", color:"rgba(201,169,106,.65)", lineHeight:1.75, marginBottom:"28px" }}>
                  Ton engagement est acté. Bienvenue pleinement dans la communauté.
                </p>
                <Link to="/dashboard" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"transparent", color:"#C9A96A", border:"1px solid rgba(201,169,106,.3)", fontFamily:"'Montserrat',sans-serif", fontWeight:500, fontSize:".72rem", letterSpacing:".14em", textTransform:"uppercase", padding:"13px 28px", borderRadius:"2px", textDecoration:"none" }}>
                  Accéder à mon espace
                </Link>
              </div>
            )}
          </section>

        </div>
      </div>
    </>
  );
}
