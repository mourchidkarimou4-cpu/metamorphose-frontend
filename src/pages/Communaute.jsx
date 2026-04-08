import { useState, useEffect } from "react";
import usePageBackground from "../hooks/usePageBackground";
import { Link, useNavigate } from "react-router-dom";

const WHATSAPP_COMMUNAUTE = "https://chat.whatsapp.com/Es4ak1AkByN8G9AZauSail?mode=gi_t";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --noir:#0A0A0A; --or:#C9A96A; --or-light:#E8D5A8;
    --rose:#C2185B; --beige:#D8C1A0; --beige-light:#F2EBE0;
    --blanc:#F8F5F2;
    --ff-t:'Playfair Display',Georgia,serif;
    --ff-b:'Montserrat',sans-serif;
    --ff-a:'Cormorant Garamond',Georgia,serif;
    --ease:cubic-bezier(0.4,0,0.2,1);
  }
  html { scroll-behavior:smooth; }
  body { background:var(--noir); color:var(--blanc); font-family:var(--ff-b); font-weight:300; line-height:1.7; overflow-x:hidden; }

  @keyframes fadeUp    { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  @keyframes shimmer   { 0%{background-position:-200% center} 100%{background-position:200% center} }
  @keyframes orb       { 0%,100%{transform:scale(1);opacity:.1} 50%{transform:scale(1.3);opacity:.2} }
  @keyframes pulse-rose{ 0%,100%{box-shadow:0 0 24px rgba(194,24,91,.35)} 50%{box-shadow:0 0 52px rgba(194,24,91,.65)} }
  @keyframes float     { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes spin      { to{transform:rotate(360deg)} }
  @keyframes lock-shake{ 0%,100%{transform:rotate(0)} 25%{transform:rotate(-8deg)} 75%{transform:rotate(8deg)} }

  .reveal { opacity:0; transform:translateY(30px); transition:opacity .8s ease,transform .8s ease; }
  .reveal.visible { opacity:1; transform:none; }

  .btn-p {
    display:inline-flex; align-items:center; justify-content:center; gap:10px;
    background:var(--rose); color:#fff; font-family:var(--ff-b); font-weight:700;
    font-size:.76rem; letter-spacing:.16em; text-transform:uppercase;
    padding:17px 36px; border:none; border-radius:2px; cursor:pointer;
    text-decoration:none; transition:all .35s var(--ease);
    animation:pulse-rose 3s ease-in-out infinite;
  }
  .btn-p:hover { background:#a01049; transform:translateY(-3px); }

  .btn-or {
    display:inline-flex; align-items:center; justify-content:center; gap:10px;
    background:transparent; color:var(--or); font-family:var(--ff-b); font-weight:600;
    font-size:.76rem; letter-spacing:.16em; text-transform:uppercase;
    padding:16px 32px; border:1px solid var(--or); border-radius:2px; cursor:pointer;
    text-decoration:none; transition:all .35s;
  }
  .btn-or:hover { background:var(--or); color:var(--noir); }

  .btn-wa {
    display:inline-flex; align-items:center; justify-content:center; gap:12px;
    background:#25D366; color:#fff; font-family:var(--ff-b); font-weight:700;
    font-size:.76rem; letter-spacing:.14em; text-transform:uppercase;
    padding:17px 36px; border:none; border-radius:2px; cursor:pointer;
    text-decoration:none; transition:all .35s;
  }
  .btn-wa:hover { background:#1da851; transform:translateY(-3px); box-shadow:0 14px 40px rgba(37,211,102,.4); }

  .avantage-card {
    padding:28px 24px; background:rgba(255,255,255,.025);
    border:1px solid rgba(255,255,255,.06); border-radius:6px;
    transition:all .35s; text-align:center;
  }
  .avantage-card:hover { transform:translateY(-6px); border-color:rgba(201,169,106,.2); background:rgba(201,169,106,.04); }

  .membre-card {
    padding:20px; background:rgba(255,255,255,.025);
    border:1px solid rgba(255,255,255,.06); border-radius:6px;
    display:flex; gap:14px; align-items:center; transition:all .3s;
  }
  .membre-card:hover { border-color:rgba(201,169,106,.15); background:rgba(201,169,106,.03); }

  .locked-overlay {
    position:fixed; inset:0; z-index:400; background:rgba(10,10,10,.96);
    backdrop-filter:blur(20px); display:flex; align-items:center; justify-content:center;
    padding:24px;
  }

  @media(max-width:768px) {
    .avantages-grid { grid-template-columns:1fr 1fr !important; }
    .membres-grid   { grid-template-columns:1fr !important; }
    .stats-grid     { grid-template-columns:repeat(2,1fr) !important; }
    .btn-p, .btn-or, .btn-wa { width:100% !important; justify-content:center !important; }
    .cta-btns { flex-direction:column !important; }
  }
  @media(max-width:480px) {
    .avantages-grid { grid-template-columns:1fr !important; }
    .stats-grid     { grid-template-columns:repeat(2,1fr) !important; }
  }

  /* ── AJOUTS DESIGN GLOBAL ── */
  @keyframes particle{0%{transform:translateY(0) rotate(0deg);opacity:.7}100%{transform:translateY(-100vh) rotate(720deg);opacity:0}}
  @keyframes shimmer-or{0%{background-position:-200% center}100%{background-position:200% center}}
  @keyframes pulse-or{0%,100%{box-shadow:0 0 20px rgba(201,169,106,.2)}50%{box-shadow:0 0 40px rgba(201,169,106,.5)}}
  @keyframes float-up{0%,100%{transform:translateY(0)}50%{transform:translateY(-8px)}}

  /* Scrollbar signature */
  ::-webkit-scrollbar{width:3px}
  ::-webkit-scrollbar-track{background:transparent}
  ::-webkit-scrollbar-thumb{background:rgba(201,169,106,.4);border-radius:2px}

  /* Hover card amélioré */
  .card-hover{transition:transform .4s cubic-bezier(0.4,0,0.2,1),box-shadow .4s cubic-bezier(0.4,0,0.2,1),border-color .4s cubic-bezier(0.4,0,0.2,1) !important}
  .card-hover:hover{transform:translateY(-10px) scale(1.02) !important;box-shadow:0 20px 60px rgba(0,0,0,.45),0 0 30px rgba(201,169,106,.07) !important}

  /* Boutons enrichis */
  .btn-p{transition:background .25s,transform .25s,box-shadow .25s !important}
  .btn-p:hover{transform:translateY(-3px) !important;box-shadow:0 14px 40px rgba(194,24,91,.38) !important}
  .btn-s{transition:all .25s !important}
  .btn-s:hover{transform:translateY(-3px) !important}

  /* Sélection texte */
  ::selection{background:rgba(194,24,91,.3);color:#F8F5F2}

  /* Gold line */
  .gold-line-anim{height:1px;background:linear-gradient(90deg,transparent,#C9A96A,transparent);opacity:.25;margin:0}
`;

function useReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".reveal");
    const obs = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("visible"); }),
      { threshold: 0.12 }
    );
    els.forEach(el => obs.observe(el));
    return () => obs.disconnect();
  }, []);
}

/* ── Overlay accès refusé ───────────────────────────────────── */
function LockedOverlay({ estMembre, estConnecte }) {
  const navigate = useNavigate();
  return (
    <>
      <BackToTop />
      <GoldCursor />
      <GoldParticles />
      <div className="locked-overlay">
      <div style={{ maxWidth:"480px", width:"100%", textAlign:"center", animation:"fadeUp .5s both" }}>
        <div style={{ fontSize:"4rem", marginBottom:"20px", animation:"lock-shake 2s ease-in-out infinite" }}>🔒</div>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:"var(--rose)", marginBottom:"12px" }}>
          Accès réservé
        </p>
        <h2 style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.4rem,4vw,2rem)", fontWeight:600, marginBottom:"16px", lineHeight:1.2 }}>
          {estConnecte && !estMembre
            ? "Tu n'es pas encore Métamorphosée"
            : "La communauté te réserve sa lumière"
          }
        </h2>
        <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.6)", lineHeight:1.8, marginBottom:"28px" }}>
          {estConnecte && !estMembre
            ? "La Communauté MMO est réservée exclusivement aux femmes qui ont complété le programme Méta'Morph'Ose. Rejoins le programme pour en faire partie."
            : "Pour accéder à la Communauté MMO, tu dois d'abord rejoindre et compléter le programme Méta'Morph'Ose. Un espace sacré, réservé aux Métamorphosées."
          }
        </p>
        <div style={{ display:"flex", flexDirection:"column", gap:"12px", alignItems:"center" }}>
          <Link to="/contact" className="btn-p" style={{ width:"100%", maxWidth:"360px" }}>
            Rejoindre le programme MMO
          </Link>
          {!estConnecte && (
            <Link to="/espace-membre" className="btn-or" style={{ width:"100%", maxWidth:"360px" }}>
              J'ai déjà un compte — Me connecter
            </Link>
          )}
          <Link to="/" style={{ fontFamily:"var(--ff-b)", fontSize:".7rem", color:"rgba(248,245,242,.3)", textDecoration:"none", marginTop:"8px" }}>
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── COMPOSANT PRINCIPAL ────────────────────────────────────── */
// ── PARTICULES DORÉES ────────────────────────────────────────
function GoldParticles() {{
  const pts = [
    {{s:3,x:"12%",d:"0s",  du:"7s", o:.5}},
    {{s:2,x:"32%",d:"1.3s",du:"9s", o:.35}},
    {{s:4,x:"55%",d:"0.6s",du:"6s", o:.55}},
    {{s:2,x:"75%",d:"2.1s",du:"8s", o:.4}},
    {{s:3,x:"88%",d:"1s",  du:"7.5s",o:.45}},
  ];
  return (
    <div style={{{{position:"fixed",inset:0,pointerEvents:"none",overflow:"hidden",zIndex:0}}}}>
      {{pts.map((p,i) => (
        <div key={{i}} style={{{{
          position:"absolute", bottom:"-10px", left:p.x,
          width:`${{p.s}}px`, height:`${{p.s}}px`, borderRadius:"50%",
          background:`rgba(201,169,106,${{p.o}})`,
          boxShadow:`0 0 ${{p.s*2}}px rgba(201,169,106,${{p.o}})`,
          animation:`particle ${{p.du}} ${{p.d}} ease-in infinite`,
        }}}}/>
      ))}}
    </div>
  );
}}

// ── BOUTON RETOUR EN HAUT ────────────────────────────────────
function BackToTop() {{
  const [vis, setVis] = useState(false);
  useEffect(() => {{
    const fn = () => setVis(window.scrollY > 400);
    window.addEventListener("scroll", fn, {{passive:true}});
    return () => window.removeEventListener("scroll", fn);
  }}, []);
  if (!vis) return null;
  return (
    <button onClick={{()=>window.scrollTo({{top:0,behavior:"smooth"}})}}
      style={{{{
        position:"fixed", bottom:"148px", right:"16px", zIndex:148,
        width:"44px", height:"44px", borderRadius:"50%",
        background:"rgba(201,169,106,.1)", border:"1px solid rgba(201,169,106,.3)",
        cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center",
        backdropFilter:"blur(12px)", transition:"all .3s",
      }}}}
      onMouseEnter={{e=>{{e.currentTarget.style.background="rgba(201,169,106,.22)";e.currentTarget.style.transform="translateY(-3px)"}}}}
      onMouseLeave={{e=>{{e.currentTarget.style.background="rgba(201,169,106,.1)";e.currentTarget.style.transform="none"}}}}
    >
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <path d="M8 12V4M4 8l4-4 4 4" stroke="#C9A96A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}}

// ── CURSEUR LUMINEUX ─────────────────────────────────────────
function GoldCursor() {{
  const [pos, setPos] = useState({{x:-200,y:-200}});
  useEffect(() => {{
    const fn = e => setPos({{x:e.clientX, y:e.clientY}});
    window.addEventListener("mousemove", fn, {{passive:true}});
    return () => window.removeEventListener("mousemove", fn);
  }}, []);
  return (
    <div style={{{{
      position:"fixed", left:pos.x-200, top:pos.y-200,
      width:"400px", height:"400px", borderRadius:"50%",
      background:"radial-gradient(circle,rgba(201,169,106,.04) 0%,transparent 70%)",
      pointerEvents:"none", zIndex:9998, transition:"left .08s linear, top .08s linear",
    }}}}/>
  );
}}


export default function Communaute() {
  usePageBackground("communaute");
  const [user]          = useState(() => JSON.parse(localStorage.getItem("mmorphose_user") || "null"));
  const [token]         = useState(() => localStorage.getItem("mmorphose_token"));
  const [userData,      setUserData]      = useState(null);
  const [loadingUser,   setLoadingUser]   = useState(true);
  useReveal();

  // Vérifier si le membre est actif (a complété le programme)
  useEffect(() => {
    if (!token) { setLoadingUser(false); return; }
    fetch(`/api/auth/me/`, {
      headers: { "Authorization": `Bearer ${token}` }
    })
    .then(r => r.ok ? r.json() : null)
    .then(data => { setUserData(data); setLoadingUser(false); })
    .catch(() => setLoadingUser(false));
  }, [token]);

  const estConnecte = !!token && !!user;
  const estMembre   = userData?.actif === true;

  // Affichage pendant le chargement
  if (loadingUser) {
    return (
      <div style={{ background:"var(--noir)", minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center" }}>
        <style>{STYLES}</style>
        <div style={{ width:"40px", height:"40px", border:"3px solid rgba(201,169,106,.2)", borderTopColor:"var(--or)", borderRadius:"50%", animation:"spin .7s linear infinite" }}/>
      </div>
    );
  }

  const AVANTAGES = [
    { icone:"💬", titre:"Espace d'échange", desc:"Un groupe privé pour partager, s'encourager et grandir ensemble entre Métamorphosées." },
    { icone:"🎙️", titre:"Lives exclusifs", desc:"Accès aux lives privés de Prélia réservés uniquement à la communauté." },
    { icone:"📚", titre:"Ressources premium", desc:"Bibliothèque de guides, replays et contenus exclusifs non disponibles ailleurs." },
    { icone:"🤝", titre:"Réseau international", desc:"Connecte-toi avec des femmes inspirantes de plusieurs pays partageant les mêmes valeurs." },
    { icone:"🏆", titre:"Défis & Challenges", desc:"Défis mensuels pour maintenir ta transformation et te dépasser continuellement." },
    { icone:"🎁", titre:"Avantages exclusifs", desc:"Réductions sur le Store, accès prioritaire aux nouvelles vagues et événements spéciaux." },
  ];

  const MEMBRES_EXEMPLES = [
    { prenom:"Aïcha", pays:"Bénin", formule:"F2", initiale:"A", color:"#C2185B" },
    { prenom:"Marie-Claire", pays:"Côte d'Ivoire", formule:"F1", initiale:"M", color:"#C9A96A" },
    { prenom:"Fatou", pays:"Sénégal", formule:"F3", initiale:"F", color:"#A8C8E0" },
    { prenom:"Olivia", pays:"France", formule:"F2", initiale:"O", color:"#C2185B" },
    { prenom:"Daniella", pays:"Cameroun", formule:"F4", initiale:"D", color:"#C9A96A" },
    { prenom:"Aminata", pays:"Mali", formule:"F1", initiale:"A", color:"#A8C8E0" },
  ];

  const FORMULES_LABELS = { F1:"Live · Groupe", F2:"Live · Privé", F3:"Présentiel · Groupe", F4:"Présentiel · Privé" };

  return (
    <>
      <style>{STYLES}</style>

      {/* Overlay si non membre */}
      {(!estConnecte || !estMembre) && (
        <LockedOverlay estMembre={estMembre} estConnecte={estConnecte} />
      )}

      {/* ── NAVBAR ── */}
      <nav style={{ padding:"16px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"rgba(10,10,10,.96)", backdropFilter:"blur(20px)", zIndex:200 }}>
        <Link to="/" style={{ textDecoration:"none" }}>
          <span style={{ fontFamily:"var(--ff-t)", fontSize:"1rem" }}>
            <span style={{color:"var(--blanc)"}}>Meta'</span>
            <span style={{color:"var(--or)"}}>Morph'</span>
            <span style={{color:"var(--rose)"}}>Ose</span>
          </span>
        </Link>
        <div style={{ display:"flex", gap:"16px", alignItems:"center" }}>
          <Link to="/dashboard" style={{ fontFamily:"var(--ff-b)", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}>
            Mon espace
          </Link>
          <button onClick={() => { localStorage.removeItem("mmorphose_token"); localStorage.removeItem("mmorphose_user"); window.location.href = "/"; }} style={{ fontFamily:"var(--ff-b)", fontSize:".65rem", letterSpacing:".12em", textTransform:"uppercase", background:"none", border:"1px solid rgba(255,255,255,.1)", borderRadius:"3px", color:"rgba(248,245,242,.35)", padding:"8px 14px", cursor:"pointer" }}>
            Déconnexion
          </button>
        </div>
      </nav>

      <main>

        {/* ── HERO ── */}
        <section style={{ padding:"80px 24px 60px", background:"linear-gradient(135deg,#0A0A0A 0%,#1a0a0f 40%,#110d09 100%)", textAlign:"center", position:"relative", overflow:"hidden", minHeight:"60vh", display:"flex", alignItems:"center" }}>
          <div style={{ position:"absolute", inset:0, pointerEvents:"none" }}>
            <div style={{ position:"absolute", top:"-10%", left:"-5%", width:"500px", height:"500px", borderRadius:"50%", background:"radial-gradient(circle,rgba(194,24,91,.1),transparent 70%)", animation:"orb 10s ease-in-out infinite" }}/>
            <div style={{ position:"absolute", bottom:"10%", right:"-5%", width:"400px", height:"400px", borderRadius:"50%", background:"radial-gradient(circle,rgba(201,169,106,.07),transparent 70%)", animation:"orb 12s ease-in-out infinite 2s" }}/>
          </div>
          <div style={{ position:"relative", zIndex:1, maxWidth:"780px", margin:"0 auto", width:"100%" }}>
            {/* Badge membre */}
            <div style={{ marginBottom:"20px", display:"inline-flex", alignItems:"center", gap:"10px", background:"rgba(201,169,106,.1)", border:"1px solid rgba(201,169,106,.25)", borderRadius:"100px", padding:"8px 20px" }}>
              <span style={{ fontSize:"1rem" }}>✨</span>
              <span style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".18em", textTransform:"uppercase", color:"var(--or)", fontWeight:600 }}>
                Bienvenue, {userData?.first_name || user?.first_name || "Métamorphosée"}
              </span>
            </div>

            <h1 style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(2rem,6vw,3.8rem)", fontWeight:700, lineHeight:1.05, marginBottom:"20px", animation:"fadeUp .8s both" }}>
              <em style={{ fontStyle:"italic", fontWeight:400, background:"linear-gradient(135deg,var(--or),var(--or-light),var(--or))", backgroundSize:"200% auto", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"shimmer 4s linear infinite", display:"block" }}>
                Communauté
              </em>
              Méta'Morph'Ose
            </h1>
            <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:"clamp(.9rem,2.5vw,1.05rem)", color:"rgba(248,245,242,.6)", lineHeight:1.8, marginBottom:"12px", animation:"fadeUp .8s .1s both", maxWidth:"580px", margin:"0 auto 12px" }}>
              Un espace sacré et exclusif où les Métamorphosées se retrouvent, s'élèvent et brillent ensemble.
            </p>
            <p style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1.1rem", color:"var(--or)", marginBottom:"36px", animation:"fadeUp .8s .2s both" }}>
              « Tu n'es plus seule dans ta transformation. »
            </p>

            {/* Stats */}
            <div className="stats-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:"16px", maxWidth:"680px", margin:"0 auto 36px" }}>
              {[
                { val:"+100", label:"Métamorphosées" },
                { val:"8",    label:"Pays" },
                { val:"4",    label:"Promotions" },
                { val:"∞",    label:"Sororité" },
              ].map((s,i) => (
                <div key={i} style={{ textAlign:"center", padding:"16px 8px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(201,169,106,.1)", borderRadius:"4px" }}>
                  <p style={{ fontFamily:"var(--ff-t)", fontSize:"1.6rem", fontWeight:700, color:"var(--or)", lineHeight:1 }}>{s.val}</p>
                  <p style={{ fontFamily:"var(--ff-b)", fontSize:".6rem", letterSpacing:".14em", textTransform:"uppercase", color:"rgba(248,245,242,.35)", marginTop:"6px" }}>{s.label}</p>
                </div>
              ))}
            </div>

            {/* CTA principal */}
            <div className="cta-btns" style={{ display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap" }}>
              <a href={WHATSAPP_COMMUNAUTE} target="_blank" rel="noreferrer" className="btn-wa">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Rejoindre le groupe WhatsApp
              </a>
              <Link to="/dashboard" className="btn-or">
                Mon espace membre
              </Link>
            </div>
          </div>
        </section>

        {/* ── AVANTAGES ── */}
        <section style={{ padding:"80px 24px", background:"linear-gradient(180deg,#110d09,#18100d)" }}>
          <div style={{ maxWidth:"1100px", margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"48px" }}>
              <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"var(--or)", marginBottom:"12px" }}>Tes privilèges</p>
              <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:600 }}>
                Ce que la communauté t'offre
              </h2>
            </div>
            <div className="avantages-grid" style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:"20px" }}>
              {AVANTAGES.map((a, i) => (
                <div key={i} className="avantage-card reveal" style={{ transitionDelay:`${(i%3)*.1}s` }}>
                  <div style={{ fontSize:"2.2rem", marginBottom:"14px" }}>{a.icone}</div>
                  <h3 style={{ fontFamily:"var(--ff-t)", fontSize:"1.05rem", fontWeight:600, marginBottom:"8px" }}>{a.titre}</h3>
                  <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".78rem", color:"rgba(248,245,242,.55)", lineHeight:1.7 }}>{a.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── MÉTAMORPHOSÉES ── */}
        <section style={{ padding:"80px 24px", background:"linear-gradient(180deg,#18100d,#2e1e14)" }}>
          <div style={{ maxWidth:"1000px", margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"48px" }}>
              <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"var(--rose)", marginBottom:"12px" }}>La famille</p>
              <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:600 }}>
                Quelques Métamorphosées
              </h2>
            </div>
            <div className="membres-grid" style={{ display:"grid", gridTemplateColumns:"repeat(2,1fr)", gap:"14px", marginBottom:"40px" }}>
              {MEMBRES_EXEMPLES.map((m, i) => (
                <div key={i} className="membre-card reveal" style={{ transitionDelay:`${(i%2)*.1}s` }}>
                  <div style={{ width:"44px", height:"44px", borderRadius:"50%", background:`${m.color}25`, border:`2px solid ${m.color}50`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                    <span style={{ fontFamily:"var(--ff-t)", fontSize:"1.1rem", fontWeight:700, color:m.color }}>{m.initiale}</span>
                  </div>
                  <div>
                    <p style={{ fontFamily:"var(--ff-b)", fontWeight:600, fontSize:".85rem", marginBottom:"2px" }}>{m.prenom}</p>
                    <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".72rem", color:"rgba(248,245,242,.4)" }}>{m.pays} · {FORMULES_LABELS[m.formule]}</p>
                  </div>
                  <div style={{ marginLeft:"auto" }}>
                    <span style={{ fontFamily:"var(--ff-b)", fontSize:".55rem", letterSpacing:".12em", textTransform:"uppercase", padding:"4px 10px", background:"rgba(194,24,91,.12)", border:"1px solid rgba(194,24,91,.25)", borderRadius:"100px", color:"var(--rose)" }}>Métamorphosée</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="reveal" style={{ textAlign:"center", fontFamily:"var(--ff-b)", fontSize:".75rem", color:"rgba(248,245,242,.3)", fontStyle:"italic" }}>
              +{100 - MEMBRES_EXEMPLES.length} autres Métamorphosées dans la communauté
            </p>
          </div>
        </section>

        {/* ── RÈGLES COMMUNAUTÉ ── */}
        <section style={{ padding:"60px 24px", background:"linear-gradient(180deg,#2e1e14,#3a2518)" }}>
          <div style={{ maxWidth:"700px", margin:"0 auto" }}>
            <div style={{ textAlign:"center", marginBottom:"36px" }}>
              <p className="reveal" style={{ fontFamily:"var(--ff-b)", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"var(--or)", marginBottom:"12px" }}>Notre charte</p>
              <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.4rem,3.5vw,2rem)", fontWeight:600 }}>
                Les valeurs de notre espace
              </h2>
            </div>
            <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
              {[
                { icone:"🤍", regle:"Bienveillance absolue — Nous nous soutenons sans jugement." },
                { icone:"🔒", regle:"Confidentialité — Ce qui se dit ici reste ici." },
                { icone:"✨", regle:"Authenticité — Nous célébrons qui nous sommes vraiment." },
                { icone:"🌱", regle:"Croissance — Nous nous encourageons mutuellement à grandir." },
                { icone:"🤝", regle:"Sororité — Nous sommes des alliées, pas des concurrentes." },
              ].map((item, i) => (
                <div key={i} className="reveal" style={{ transitionDelay:`${i*.06}s`, display:"flex", gap:"14px", alignItems:"flex-start", padding:"16px 20px", background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.05)", borderRadius:"4px" }}>
                  <span style={{ fontSize:"1.1rem", flexShrink:0 }}>{item.icone}</span>
                  <p style={{ fontFamily:"var(--ff-b)", fontWeight:300, fontSize:".85rem", color:"rgba(248,245,242,.75)", lineHeight:1.6 }}>{item.regle}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA FINAL ── */}
        <section style={{ padding:"80px 24px", background:"linear-gradient(180deg,#3a2518,var(--beige-light))", textAlign:"center" }}>
          <div style={{ maxWidth:"600px", margin:"0 auto" }}>
            <h2 className="reveal" style={{ fontFamily:"var(--ff-t)", fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:600, color:"var(--noir)", marginBottom:"16px" }}>
              Tu es à ta place ici.
            </h2>
            <p className="reveal" style={{ fontFamily:"var(--ff-a)", fontStyle:"italic", fontSize:"1.1rem", color:"rgba(10,10,10,.6)", lineHeight:1.75, marginBottom:"32px" }}>
              « La force d'une femme s'amplifie quand elle est entourée d'autres femmes qui croient en elle. »
            </p>
            <div className="reveal cta-btns" style={{ display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap" }}>
              <a href={WHATSAPP_COMMUNAUTE} target="_blank" rel="noreferrer" className="btn-wa">
                <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Accéder au groupe WhatsApp
              </a>
              <Link to="/dashboard" className="btn-or" style={{ color:"rgba(10,10,10,.7)", borderColor:"rgba(10,10,10,.3)" }}>
                Mon espace membre
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ── FOOTER ── */}
      <footer style={{ padding:"32px 24px", background:"var(--noir)", borderTop:"1px solid rgba(201,169,106,.1)", textAlign:"center" }}>
        <Link to="/" style={{ fontFamily:"var(--ff-t)", fontSize:".95rem", textDecoration:"none" }}>
          <span style={{color:"var(--blanc)"}}>Meta'</span>
          <span style={{color:"var(--or)"}}>Morph'</span>
          <span style={{color:"var(--rose)"}}>Ose</span>
        </Link>
        <p style={{ fontFamily:"var(--ff-b)", fontSize:".7rem", color:"rgba(248,245,242,.2)", marginTop:"8px" }}>
          © 2026 Meta'Morph'Ose · Espace réservé aux Métamorphosées
        </p>
      </footer>
    </>
  );
}
