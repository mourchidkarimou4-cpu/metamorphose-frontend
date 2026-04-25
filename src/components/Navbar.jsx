import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const NAV_LINKS = [
  { label:"Programme",   icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg>, to:"/programme" },
  { label:"Formules",    icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>, to:"/#formules" },
  { label:"Masterclass", icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/><line x1="12" y1="19" x2="12" y2="22"/></svg>, to:"/masterclass" },
  { label:"Lives",       icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg>, to:"/live" },
  { label:"Learning",    icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>, to:"/mmo-learning" },
  { sep:true },
  { label:"Le Brunch",   icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>, to:"/brunch" },
  { label:"Communauté",  icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>, to:"/communaute" },
  { label:"Événements",  icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>, to:"/evenements" },
  { label:"Actualités",  icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>, to:"/actualites" },
  { label:"Cadeaux",     icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>, to:"/carte-cadeau" },
  { label:"Store",       icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>, to:"/store" },
  { label:"Aura",        icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>, to:"/aura" },
  { sep:true },
  { label:"À Propos",    icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>, to:"/a-propos" },
  { label:"Témoignages", icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>, to:"/temoignages" },
  { label:"FAQ",         icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>, to:"/faq" },
  { label:"Contact",     icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>, to:"/contact" },
  { label:"Don",         icon:<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>, to:"/don" },
];

const MOBILE_SECTIONS = [
  {
    label:"Programme",
    links:[
      { label:"Le Programme",    to:"/programme",    icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 014 4v14a3 3 0 00-3-3H2z"/><path d="M22 3h-6a4 4 0 00-4 4v14a3 3 0 013-3h7z"/></svg> },
      { label:"Formules & Tarifs", to:"/#formules",  icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg> },
      { label:"Masterclass",     to:"/masterclass",  icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a3 3 0 00-3 3v7a3 3 0 006 0V5a3 3 0 00-3-3z"/><path d="M19 10v2a7 7 0 01-14 0v-2"/></svg> },
      { label:"Lives & Replays", to:"/live",         icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8"/></svg> },
      { label:"MMO Learning",    to:"/mmo-learning", icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/></svg> },
    ],
  },
  {
    label:"L'Univers MMO",
    links:[
      { label:"Le Brunch 2026",  to:"/brunch",       icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/></svg> },
      { label:"Communauté",      to:"/communaute",   icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg> },
      { label:"Événements",      to:"/evenements",   icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg> },
      { label:"Actualités",      to:"/actualites",   icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg> },
      { label:"Cartes Cadeaux",  to:"/carte-cadeau", icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/></svg> },
      { label:"Store MMO",       to:"/store",        icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg> },
      { label:"Aura",            to:"/aura",         icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg> },
    ],
  },
  {
    label:"Découvrir",
    links:[
      { label:"À Propos",        to:"/a-propos",     icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg> },
      { label:"Témoignages",     to:"/temoignages",  icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg> },
      { label:"FAQ",             to:"/faq",          icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/></svg> },
      { label:"Contact",         to:"/contact",      icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg> },
      { label:"Don",             to:"/don",          icon:<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg> },
    ],
  },
];

export default function Navbar({ onAuthOpen }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { user } = useAuth();

  return (
    <>
      <style>{`
        .nav-link-item {
          display:flex; flex-direction:column; align-items:center; gap:4px;
          cursor:pointer; text-decoration:none; color:rgba(248,245,242,.45);
          transition:color .25s; flex-shrink:0; padding:0 2px;
        }
        .nav-link-item:hover { color:rgba(201,169,106,.85); }
        .nav-link-item span {
          font-family:'Montserrat',sans-serif; font-size:8px;
          letter-spacing:1.8px; text-transform:uppercase; white-space:nowrap;
          font-weight:300;
        }
        .nav-sep { width:1px; height:28px; background:rgba(201,169,106,.1); flex-shrink:0; margin:0 4px; }
        .drawer-link {
          display:flex; align-items:center; gap:10px; padding:13px 24px;
          text-decoration:none; color:rgba(248,245,242,.72);
          border-bottom:1px solid rgba(255,255,255,.04);
          font-family:'Playfair Display',Georgia,serif; font-size:1rem; font-weight:600;
          transition:all .2s;
        }
        .drawer-link:hover { color:#C9A96A; padding-left:32px; border-left:2px solid #C9A96A; }
        @media(max-width:1100px){
          .nav-desktop-links { display:none !important; }
          .nav-burger { display:flex !important; }
        }
        @media(min-width:1101px){
          .nav-burger { display:none !important; }
        }
      `}</style>

      {/* ── NAVBAR STICKY ── */}
      <nav style={{
        position:"sticky", top:0, left:0, right:0, zIndex:200,
        height:"62px",
        background:"rgba(6,6,8,.98)",
        backdropFilter:"blur(20px)",
        borderBottom:"1px solid rgba(201,169,106,.15)",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        padding:"0 24px",
      }}>

        {/* Logo */}
        <Link to="/" style={{ textDecoration:"none", flexShrink:0 }}>
          <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:".95rem", fontWeight:400 }}>
            <span style={{ color:"#F8F5F2" }}>Méta'</span>
            <span style={{ color:"#C9A96A" }}>Morph'</span>
            <span style={{ color:"#C2185B" }}>Ose</span>
          </span>
        </Link>

        {/* Liens desktop */}
        <div className="nav-desktop-links" style={{ display:"flex", alignItems:"center", gap:"6px", overflowX:"auto", flex:1, justifyContent:"center", padding:"0 16px" }}>
          {NAV_LINKS.map((link, i) => {
            if (link.sep) return <div key={i} className="nav-sep"/>;
            return (
              <Link key={i} to={link.to} className="nav-link-item">
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </div>

        {/* CTAs desktop */}
        <div className="nav-desktop-links" style={{ display:"flex", alignItems:"center", gap:"12px", flexShrink:0 }}>
          {user ? (
            <Link to="/dashboard" style={{ display:"flex", alignItems:"center", gap:"5px", textDecoration:"none", color:"rgba(201,169,106,.55)", fontFamily:"'Montserrat',sans-serif", fontSize:".72rem", letterSpacing:".1em", textTransform:"uppercase" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Mon espace
            </Link>
          ) : (
            <button onClick={() => onAuthOpen("login")} style={{ display:"flex", alignItems:"center", gap:"5px", background:"none", border:"none", cursor:"pointer", color:"rgba(201,169,106,.55)", fontFamily:"'Montserrat',sans-serif", fontSize:".72rem", letterSpacing:".1em", textTransform:"uppercase" }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              Mon espace
            </button>
          )}
          <button onClick={() => onAuthOpen("inscription")}
            style={{ background:"#C2185B", border:"none", borderRadius:"2px", color:"#fff", fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:".68rem", letterSpacing:".16em", textTransform:"uppercase", padding:"10px 20px", cursor:"pointer", transition:"background .3s", flexShrink:0 }}
            onMouseEnter={e=>e.currentTarget.style.background="#a01049"}
            onMouseLeave={e=>e.currentTarget.style.background="#C2185B"}>
            S'inscrire
          </button>
        </div>

        {/* Burger mobile */}
        <div className="nav-burger" style={{ display:"none", alignItems:"center", gap:"12px" }}>
          <button onClick={() => onAuthOpen("inscription")} style={{ background:"#C2185B", border:"none", borderRadius:"2px", color:"#fff", fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:".65rem", letterSpacing:".14em", textTransform:"uppercase", padding:"9px 16px", cursor:"pointer" }}>
            S'inscrire
          </button>
          <button onClick={() => setMenuOpen(true)} style={{ background:"none", border:"none", cursor:"pointer", padding:"4px", display:"flex", flexDirection:"column", gap:"5px" }}>
            <div style={{ width:"22px", height:"1px", background:"#C9A96A" }}/>
            <div style={{ width:"15px", height:"1px", background:"#C9A96A" }}/>
            <div style={{ width:"22px", height:"1px", background:"#C9A96A" }}/>
          </button>
        </div>
      </nav>

      {/* ── DRAWER MOBILE ── */}
      {menuOpen && (
        <>
          <div onClick={() => setMenuOpen(false)} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,.6)", zIndex:300, backdropFilter:"blur(4px)" }}/>
          <div style={{
            position:"fixed", top:0, right:0, bottom:0, width:"min(340px,90vw)",
            background:"#0d0b10",
            borderLeft:"1px solid rgba(201,169,106,.15)",
            zIndex:301, display:"flex", flexDirection:"column",
            animation:"slideIn .3s cubic-bezier(.16,1,.3,1)",
          }}>
            <style>{`@keyframes slideIn { from{transform:translateX(100%)} to{transform:none} }`}</style>

            <div style={{ padding:"18px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center", flexShrink:0 }}>
              <span style={{ fontFamily:"'Playfair Display',Georgia,serif", fontSize:"1rem", color:"#F8F5F2" }}>
                Méta'<span style={{ color:"#C9A96A" }}>Morph'</span><span style={{ color:"#C2185B" }}>Ose</span>
              </span>
              <button onClick={() => setMenuOpen(false)} style={{ background:"none", border:"1px solid rgba(201,169,106,.2)", borderRadius:"2px", width:"32px", height:"32px", cursor:"pointer", color:"rgba(201,169,106,.6)", fontSize:"1.1rem", display:"flex", alignItems:"center", justifyContent:"center" }}>
                &times;
              </button>
            </div>

            <div style={{ flex:1, overflowY:"auto", paddingBottom:"16px" }}>
              {MOBILE_SECTIONS.map((section, si) => (
                <div key={si}>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:200, fontSize:".55rem", letterSpacing:".35em", textTransform:"uppercase", color:"rgba(201,169,106,.4)", padding:"18px 24px 6px" }}>
                    {section.label}
                  </p>
                  {section.links.map((link, li) => (
                    <Link key={li} to={link.to} className="drawer-link" onClick={() => setMenuOpen(false)}>
                      <span style={{ color:"rgba(201,169,106,.5)", flexShrink:0 }}>{link.icon}</span>
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ padding:"16px 24px", borderTop:"1px solid rgba(201,169,106,.1)", display:"flex", flexDirection:"column", gap:"10px", flexShrink:0 }}>
              <button onClick={() => { onAuthOpen("inscription"); setMenuOpen(false); }}
                style={{ width:"100%", padding:"14px", background:"#C2185B", border:"none", borderRadius:"2px", color:"#fff", fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:".74rem", letterSpacing:".16em", textTransform:"uppercase", cursor:"pointer" }}>
                S'inscrire
              </button>
              {user ? (
                <Link to="/dashboard" onClick={() => setMenuOpen(false)}
                  style={{ display:"block", width:"100%", padding:"12px", background:"rgba(201,169,106,.07)", border:"1px solid rgba(201,169,106,.2)", borderRadius:"2px", color:"#C9A96A", fontFamily:"'Montserrat',sans-serif", fontSize:".7rem", fontWeight:600, letterSpacing:".15em", textTransform:"uppercase", textAlign:"center", textDecoration:"none" }}>
                  Mon espace
                </Link>
              ) : (
                <button onClick={() => { onAuthOpen("login"); setMenuOpen(false); }}
                  style={{ width:"100%", padding:"12px", background:"rgba(201,169,106,.07)", border:"1px solid rgba(201,169,106,.2)", borderRadius:"2px", color:"#C9A96A", fontFamily:"'Montserrat',sans-serif", fontWeight:600, fontSize:".7rem", letterSpacing:".15em", textTransform:"uppercase", cursor:"pointer" }}>
                  Mon espace
                </button>
              )}
            </div>
          </div>
        </>
      )}
    </>
  );
}
