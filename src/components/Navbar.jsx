import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AuthModal from "./AuthModal";
import ModalRendezVous from "./ModalRendezVous";

const API_BASE = import.meta.env.VITE_API_URL || '';

function useSiteConfig() {
  const [config, setConfig] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mmo_site_config') || '{}'); } catch { return {}; }
  });
  useEffect(() => {
    fetch(`${API_BASE}/api/admin/config/public/`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        const map = {};
        if (Array.isArray(data)) data.forEach(item => { map[item.cle] = item.valeur; });
        try { localStorage.setItem('mmo_site_config', JSON.stringify(map)); } catch {}
        setConfig(map);
      }).catch(() => {});
  }, []);
  return (cle, defaut = "") => config[cle] || defaut;
}

function useScrollProgress() {
  const [progress, setProgress] = useState(0);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const h = () => {
      const max = document.body.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(window.scrollY / max, 1) : 0);
      setScrolled(window.scrollY > 60);
    };
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);
  return { progress, scrolled };
}

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1100);
  useEffect(() => {
    const h = () => setIsMobile(window.innerWidth <= 1100);
    window.addEventListener('resize', h);
    return () => window.removeEventListener('resize', h);
  }, []);
  return isMobile;
}

export default function Navbar() {
  const { user } = useAuth();
  const get = useSiteConfig();
  const { progress, scrolled } = useScrollProgress();
  const isMobile = useIsMobile();
  const [authTab,  setAuthTab]  = useState(null);
  const [showRdv,  setShowRdv]  = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  useEffect(() => {
    const close = () => setOpenMenu(null);
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const isLight    = progress > 0.72;
  const navBg      = scrolled ? (isLight ? "rgba(248,245,242,.97)" : "rgba(10,10,10,.97)") : "transparent";
  const borderColor= scrolled ? (isLight ? "rgba(201,169,106,.25)" : "rgba(201,169,106,.15)") : "transparent";
  const navTextColor   = isLight && scrolled ? "rgba(10,10,10,.8)"  : "rgba(248,245,242,.75)";
  const navLogoColor1  = isLight && scrolled ? "#0A0A0A" : "#F8F5F2";

  const triggerStyle = {
    fontFamily:"'Cormorant Garamond',Georgia,serif", fontStyle:"italic",
    fontSize:".88rem", fontWeight:600, letterSpacing:".06em",
    color: navTextColor, background:"none", border:"none",
    cursor:"pointer", padding:"6px 10px", display:"flex", alignItems:"center",
    gap:"4px", transition:"color .3s", position:"relative", whiteSpace:"nowrap",
  };
  const triggerActiveStyle = { ...triggerStyle, color:"rgba(201,169,106,.95)" };

  const ctaLinkStyle = {
    fontFamily:"'Cormorant Garamond',Georgia,serif", fontStyle:"italic",
    fontSize:".88rem", fontWeight:600, letterSpacing:".06em",
    color:"rgba(201,169,106,.8)", background:"none", border:"none",
    borderBottom:"1px solid rgba(201,169,106,.35)", padding:"3px 0",
    cursor:"pointer", textDecoration:"none", transition:"all .3s", lineHeight:1.2,
  };

  const panelStyle = {
    position:"absolute", top:"calc(100% + 1px)", left:"50%", transform:"translateX(-50%)",
    background:"#0d0d0d", border:"1px solid rgba(201,169,106,.12)",
    borderTop:"1px solid rgba(201,169,106,.3)", zIndex:300,
    animation:"panelIn .22s cubic-bezier(.4,0,.2,1) both",
  };

  const panelLabel = {
    fontFamily:"'Cormorant Garamond',Georgia,serif", fontStyle:"italic",
    fontSize:".6rem", fontWeight:300, letterSpacing:".28em", textTransform:"uppercase",
    color:"rgba(201,169,106,.35)", marginBottom:"20px",
    paddingBottom:"10px", borderBottom:"1px solid rgba(255,255,255,.04)", display:"block",
  };

  function toggle(name, e) { e.stopPropagation(); setOpenMenu(openMenu === name ? null : name); }

  function DropRow({ num, title, desc, to }) {
    const [hov, setHov] = useState(false);
    return (
      <Link to={to} style={{ display:"flex", alignItems:"flex-start", gap:"0", padding:"11px 0", borderBottom:"1px solid rgba(255,255,255,.03)", cursor:"pointer", textDecoration:"none" }}
        onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>setOpenMenu(null)}>
        <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontStyle:"italic", fontSize:".95rem", color: hov ? "rgba(201,169,106,.4)" : "rgba(201,169,106,.15)", width:"30px", flexShrink:0, lineHeight:1.3, transition:"color .2s" }}>{num}</span>
        <div style={{ flex:1 }}>
          <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:".85rem", fontWeight:400, color: hov ? "#C9A96A" : "rgba(248,245,242,.78)", display:"block", marginBottom:"2px", transition:"color .2s" }}>{title}</span>
          <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".58rem", fontWeight:300, color:"rgba(248,245,242,.25)", letterSpacing:".05em" }}>{desc}</span>
        </div>
        <span style={{ fontSize:".6rem", color: hov ? "rgba(201,169,106,.4)" : "rgba(255,255,255,.1)", transition:"color .2s", paddingTop:"4px" }}>→</span>
      </Link>
    );
  }

  function FormRow({ code, name, prix, tag }) {
    const [hov, setHov] = useState(false);
    return (
      <Link to="/#formules" style={{ display:"flex", alignItems:"center", padding:"11px 0", borderBottom:"1px solid rgba(255,255,255,.03)", cursor:"pointer", textDecoration:"none" }}
        onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>setOpenMenu(null)}>
        <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontStyle:"italic", fontSize:".9rem", color:"rgba(201,169,106,.2)", width:"28px" }}>{code}</span>
        <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:".83rem", color: hov ? "#C9A96A" : "rgba(248,245,242,.75)", flex:1, padding:"0 14px", transition:"color .2s" }}>
          {name} {tag && <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".48rem", letterSpacing:".14em", textTransform:"uppercase", border:"1px solid rgba(201,169,106,.25)", color:"rgba(201,169,106,.6)", padding:"2px 6px", marginLeft:"8px" }}>{tag}</span>}
        </span>
        <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:".82rem", fontWeight:300, color: hov ? "rgba(201,169,106,.7)" : "rgba(201,169,106,.4)", transition:"color .2s" }}>{prix}</span>
      </Link>
    );
  }

  function ExpRow({ title, desc, to }) {
    const [hov, setHov] = useState(false);
    return (
      <Link to={to} style={{ display:"flex", alignItems:"flex-start", gap:"12px", padding:"12px 14px", cursor:"pointer", textDecoration:"none", background: hov ? "rgba(201,169,106,.04)" : "transparent", transition:"background .2s" }}
        onMouseEnter={()=>setHov(true)} onMouseLeave={()=>setHov(false)} onClick={()=>setOpenMenu(null)}>
        <span style={{ width:"3px", height:"3px", borderRadius:"50%", background: hov ? "#C9A96A" : "rgba(201,169,106,.25)", flexShrink:0, marginTop:"8px", transition:"background .2s" }}/>
        <div>
          <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:".8rem", color: hov ? "#C9A96A" : "rgba(248,245,242,.75)", display:"block", marginBottom:"2px", transition:"color .2s" }}>{title}</span>
          <span style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".56rem", fontWeight:300, color:"rgba(248,245,242,.22)", letterSpacing:".04em" }}>{desc}</span>
        </div>
      </Link>
    );
  }

  return (
    <>
      <style>{`
        @keyframes panelIn { from{opacity:0;transform:translateX(-50%) translateY(-6px)} to{opacity:1;transform:translateX(-50%) translateY(0)} }
        .nav-lux-trigger:hover { color:rgba(201,169,106,.85) !important; }
        .nav-lux-trigger.active { color:rgba(201,169,106,.85) !important; }
        .nav-lux-trigger.active::after { content:''; position:absolute; bottom:-1px; left:16px; right:16px; height:1px; background:linear-gradient(90deg,transparent,rgba(201,169,106,.6),transparent); }
        .cta-lux:hover { color:rgba(201,169,106,.85) !important; border-bottom-color:rgba(201,169,106,.6) !important; }
      `}</style>

      {authTab  && <AuthModal defaultTab={authTab} onClose={() => setAuthTab(null)} />}
      {showRdv  && <ModalRendezVous onClose={() => setShowRdv(false)} />}

      <nav style={{ position:"fixed", top:0, left:0, right:0, zIndex:200, padding:"0 32px", height: scrolled ? "60px" : "72px", background:navBg, backdropFilter: scrolled ? "blur(24px)" : "none", borderBottom:`1px solid ${borderColor}`, display:"flex", alignItems:"center", justifyContent:"space-between", transition:"all .4s cubic-bezier(.4,0,.2,1)" }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration:"none", display:"flex", flexDirection:"column", gap:"2px", flexShrink:0 }}>
          {get("logo_site","") && <img src={get("logo_site","")} alt="Logo" style={{ height:"26px", objectFit:"contain", marginBottom:"2px" }}/>}
          <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:".95rem", fontWeight:400, letterSpacing:".04em", lineHeight:1 }}>
            <span style={{ color: navLogoColor1 }}>Méta'</span>
            <span style={{ color:"#C9A96A" }}>Morph'</span>
            <span style={{ color:"#C2185B" }}>Ose</span>
          </span>
        </Link>

        {/* Links desktop */}
        {!isMobile && <div style={{ position:"absolute", left:"50%", transform:"translateX(-50%)", display:"flex", alignItems:"center" }}>

          {/* Accueil */}
          <Link to="/" style={{ ...triggerStyle, textDecoration:"none" }}
            onMouseEnter={e=>e.currentTarget.style.color="rgba(201,169,106,.85)"}
            onMouseLeave={e=>e.currentTarget.style.color= navTextColor}>
            Accueil
          </Link>

          {/* Programme */}
          <div style={{ position:"relative" }}>
            <button className={`nav-lux-trigger ${openMenu==="programme"?"active":""}`}
              style={openMenu==="programme" ? triggerActiveStyle : triggerStyle}
              onClick={e=>toggle("programme",e)}>
              Programme
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ opacity:.4, transition:"transform .3s", transform:openMenu==="programme"?"rotate(180deg)":"none" }}>
                <path d="M1 2.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </button>
            {openMenu==="programme" && (
              <div style={{ ...panelStyle, width:"440px", padding:"28px 32px" }} onClick={e=>e.stopPropagation()}>
                <span style={panelLabel}>Le Programme</span>
                <DropRow num="I"   title="Le Programme MMO"    desc="8 semaines · Méta · Morph · Ose"              to="/programme"/>
                <DropRow num="II"  title="À Propos de Prélia"  desc="Son histoire, sa mission, ses certifications" to="/a-propos"/>
                <DropRow num="III" title="Témoignages"         desc="Elles ont osé. Leur transformation parle."    to="/temoignages"/>
                <DropRow num="IV"  title="Questions Fréquentes" desc="Tout ce que vous souhaitez savoir"           to="/faq"/>
              </div>
            )}
          </div>

          {/* Formules */}
          <div style={{ position:"relative" }}>
            <button className={`nav-lux-trigger ${openMenu==="formules"?"active":""}`}
              style={openMenu==="formules" ? triggerActiveStyle : triggerStyle}
              onClick={e=>toggle("formules",e)}>
              Formules
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ opacity:.4, transition:"transform .3s", transform:openMenu==="formules"?"rotate(180deg)":"none" }}>
                <path d="M1 2.5l3 3 3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </button>
            {openMenu==="formules" && (
              <div style={{ ...panelStyle, width:"400px", padding:"24px 32px" }} onClick={e=>e.stopPropagation()}>
                <span style={panelLabel}>4 Formules d'accompagnement</span>
                <FormRow code="F1" name="ESSENTIELLE"   prix="70 000 FCFA"  tag="Startup"/>
                <FormRow code="F2" name="PERSONNALISÉE" prix="160 000 FCFA" tag="Populaire"/>
                <FormRow code="F3" name="IMMERSION"     prix="267 000 FCFA" tag="Ambitieux"/>
                <FormRow code="F4" name="VIP"           prix="370 000 FCFA" tag="Prestige"/>
                <div style={{ marginTop:"16px", paddingTop:"14px", borderTop:"1px solid rgba(255,255,255,.04)", textAlign:"center" }}>
                  <Link to="/#formules" style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontStyle:"italic", fontSize:".75rem", color:"rgba(201,169,106,.4)", textDecoration:"none" }} onClick={()=>setOpenMenu(null)}>
                    Trouver ma formule →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Explorer */}
          <div style={{ position:"relative" }}>
            <button className={`nav-lux-trigger ${openMenu==="explorer"?"active":""}`}
              style={{ ...(openMenu==="explorer" ? triggerActiveStyle : triggerStyle), color: openMenu==="explorer" ? "rgba(201,169,106,.95)" : "rgba(201,169,106,.45)" }}
              onClick={e=>toggle("explorer",e)}>
              Explorer
              <svg width="8" height="8" viewBox="0 0 8 8" fill="none" style={{ opacity:.5, transition:"transform .3s", transform:openMenu==="explorer"?"rotate(180deg)":"none" }}>
                <path d="M1 2.5l3 3 3-3" stroke="#C9A96A" strokeWidth="1.2" strokeLinecap="round"/>
              </svg>
            </button>
            {openMenu==="explorer" && (
              <div style={{ ...panelStyle, width:"540px", padding:"28px 0 0" }} onClick={e=>e.stopPropagation()}>
                <span style={{ ...panelLabel, margin:"0 32px 20px", paddingBottom:"10px" }}>L'univers Méta'Morph'Ose</span>
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"0" }}>
                  <ExpRow title="Masterclass OSE"         desc="Live gratuit · Inscription ouverte" to="/masterclass"/>
                  <ExpRow title="Masterclass Art Oratoire" desc="Affirme ta voix · En direct"       to="/masterclass-oratoire"/>
                  <ExpRow title="Store MMO"           desc="Guides, formations et replays"       to="/store"/>
                  <ExpRow title="Lives et Replays"    desc="Sessions en direct · Jitsi"          to="/live"/>
                  <ExpRow title="Communauté MMO"      desc="Réservé aux Métamorphosées"          to="/communaute"/>
                  <ExpRow title="Don"                 desc="Soutenir le programme"               to="/don"/>
                  <ExpRow title="MMO Learning"        desc="Cours de coaching gratuits"          to="/mmo-learning"/>
                  <ExpRow title="Événements"          desc="Brunch, masterclass, ateliers"       to="/evenements"/>
                  <ExpRow title="Actualités"          desc="Nouveautés et coulisses"             to="/actualites"/>
                </div>
                <Link to="/brunch" style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"14px 32px", borderTop:"1px solid rgba(255,255,255,.04)", textDecoration:"none", marginTop:"4px" }}
                  onClick={()=>setOpenMenu(null)}
                  onMouseEnter={e=>{ e.currentTarget.style.background="rgba(194,24,91,.04)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; }}>
                  <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontStyle:"italic", fontSize:".82rem", color:"rgba(194,24,91,.55)" }}>Le Brunch des Métamorphosées</span>
                  <span style={{ fontFamily:"'Cormorant Garamond',Georgia,serif", fontSize:".65rem", color:"rgba(194,24,91,.3)", letterSpacing:".08em" }}>Événement annuel →</span>
                </Link>
              </div>
            )}
          </div>

          {/* Contact */}
          <Link to="/contact" style={{ ...triggerStyle, textDecoration:"none" }}
            onMouseEnter={e=>e.currentTarget.style.color="rgba(201,169,106,.85)"}
            onMouseLeave={e=>e.currentTarget.style.color= navTextColor}>
            Contact
          </Link>
        </div>}

        {/* CTAs desktop */}
        {!isMobile && <div style={{ display:"flex", alignItems:"center", gap:"12px", flexShrink:0 }}>
          <button onClick={() => setShowRdv(true)}
            style={{ display:"inline-flex", alignItems:"center", gap:"6px", background:"transparent", border:"1px solid rgba(201,169,106,.3)", borderRadius:"2px", color:"#C9A96A", fontFamily:"'Montserrat',sans-serif", fontWeight:600, fontSize:".65rem", letterSpacing:".15em", textTransform:"uppercase", padding:"9px 18px", cursor:"pointer", transition:"all .3s" }}
            onMouseEnter={e=>{ e.currentTarget.style.background="rgba(201,169,106,.08)"; e.currentTarget.style.borderColor="rgba(201,169,106,.6)"; }}
            onMouseLeave={e=>{ e.currentTarget.style.background="transparent"; e.currentTarget.style.borderColor="rgba(201,169,106,.3)"; }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
            Prendre RDV
          </button>
          <div style={{ width:"1px", height:"12px", background:"rgba(255,255,255,.07)" }}/>
          {user ? (
            <Link to="/dashboard" style={ctaLinkStyle}>Mon espace</Link>
          ) : (
            <button onClick={() => setAuthTab("inscription")} style={ctaLinkStyle}
              onMouseEnter={e=>{ e.currentTarget.style.color="rgba(201,169,106,.85)"; e.currentTarget.style.borderBottomColor="rgba(201,169,106,.6)"; }}
              onMouseLeave={e=>{ e.currentTarget.style.color="rgba(201,169,106,.55)"; e.currentTarget.style.borderBottomColor="rgba(201,169,106,.28)"; }}>
              S'inscrire
            </button>
          )}
        </div>}

        {/* Burger mobile */}
        {isMobile && <button onClick={()=>setMenuOpen(true)} style={{ background:"none", border:"1px solid rgba(201,169,106,.25)", borderRadius:"2px", color:"var(--or)", padding:"7px 14px", cursor:"pointer", fontFamily:"'Cormorant Garamond',Georgia,serif", fontStyle:"italic", fontSize:".82rem", letterSpacing:".08em" }}>
          Menu
        </button>}
      </nav>

      {/* Menu mobile */}
      {menuOpen && (
        <div style={{ position:"fixed", inset:0, background:"#0A0A0A", zIndex:300, display:"flex", flexDirection:"column", overflowY:"auto" }}>
          <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"20px 24px", borderBottom:"1px solid rgba(201,169,106,.12)", flexShrink:0 }}>
            <p style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"1.05rem" }}>
              <span style={{ color:"#F8F5F2" }}>Méta'</span><span style={{ color:"#C9A96A" }}>Morph'</span><span style={{ color:"#C2185B" }}>Ose</span>
            </p>
            <button onClick={()=>setMenuOpen(false)} style={{ background:"none", border:"1px solid rgba(201,169,106,.2)", borderRadius:"2px", color:"rgba(201,169,106,.6)", width:"36px", height:"36px", cursor:"pointer", fontSize:"1rem", display:"flex", alignItems:"center", justifyContent:"center" }}>x</button>
          </div>
          <div style={{ flex:1, padding:"8px 0 32px" }}>
            {[
              { section:"Programme", links:[
                { label:"Accueil",           to:"/" },
                { label:"Le Programme",      to:"/programme" },
                { label:"Formules",          to:"/#formules" },
                { label:"Masterclass OSE",   to:"/masterclass" },
                { label:"MC Art Oratoire",   to:"/masterclass-oratoire" },
                { label:"Lives et Replays",  to:"/live" },
                { label:"MMO Learning",      to:"/mmo-learning" },
              ]},
              { section:"L'Univers MMO", links:[
                { label:"Store MMO",         to:"/store" },
                { label:"Le Brunch",         to:"/brunch" },
                { label:"Communauté",        to:"/communaute" },
                { label:"Événements",        to:"/evenements" },
                { label:"Actualités",        to:"/actualites" },
                { label:"Cartes Cadeaux",    to:"/carte-cadeau" },
              ]},
              { section:"Découvrir", links:[
                { label:"À Propos",          to:"/a-propos" },
                { label:"Témoignages",       to:"/temoignages" },
                { label:"FAQ",               to:"/faq" },
                { label:"Contact",           to:"/contact" },
                { label:"Don",               to:"/don" },
              ]},
            ].map((s,i) => (
              <div key={i}>
                <div style={{ padding:"20px 24px 4px" }}>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".55rem", letterSpacing:".28em", textTransform:"uppercase", color:"#C9A96A" }}>{s.section}</p>
                </div>
                {s.links.map((l,j) => (
                  <Link key={j} to={l.to} onClick={()=>setMenuOpen(false)}
                    style={{ display:"block", fontFamily:"'Playfair Display',Georgia,serif", fontSize:"1.05rem", fontWeight:600, color:"rgba(248,245,242,.7)", textDecoration:"none", padding:"14px 24px", borderBottom:"1px solid rgba(255,255,255,.04)", transition:"all .2s" }}
                    onMouseEnter={e=>{e.currentTarget.style.color="#F8F5F2";e.currentTarget.style.paddingLeft="32px";e.currentTarget.style.borderLeft="3px solid #C9A96A"}}
                    onMouseLeave={e=>{e.currentTarget.style.color="rgba(248,245,242,.7)";e.currentTarget.style.paddingLeft="24px";e.currentTarget.style.borderLeft="none"}}>
                    {l.label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div style={{ padding:"20px 24px", borderTop:"1px solid rgba(201,169,106,.12)", display:"flex", flexDirection:"column", gap:"10px", flexShrink:0 }}>
            <button onClick={()=>{setShowRdv(true);setMenuOpen(false);}}
              style={{ width:"100%", padding:"14px", background:"transparent", border:"1px solid rgba(201,169,106,.4)", borderRadius:"3px", color:"#C9A96A", fontFamily:"'Montserrat',sans-serif", fontSize:".75rem", fontWeight:700, letterSpacing:".15em", textTransform:"uppercase", cursor:"pointer" }}>
              Prendre RDV
            </button>
            <button onClick={()=>{setAuthTab("inscription");setMenuOpen(false);}}
              style={{ width:"100%", padding:"14px", background:"#C2185B", border:"none", borderRadius:"3px", color:"#fff", fontFamily:"'Montserrat',sans-serif", fontSize:".75rem", fontWeight:700, letterSpacing:".15em", textTransform:"uppercase", cursor:"pointer" }}>
              S'inscrire
            </button>
          </div>
        </div>
      )}

      <style>{`
        @media(max-width:900px){
          .nav-links-desktop { display:none !important; }
          .nav-ctas-desktop  { display:none !important; }
          .nav-burger-mobile { display:block !important; }
        }
      `}</style>
    </>
  );
}
