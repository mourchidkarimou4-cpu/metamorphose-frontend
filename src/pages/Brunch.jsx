import { useEffect } from "react";
import usePageBackground from "../hooks/usePageBackground";
import { Link } from 'react-router-dom'

export default function Brunch() {
  usePageBackground("brunch");
  return (
    <div style={{ background:"#0A0A0A", minHeight:"100vh", color:"#F8F5F2", fontFamily:"'Montserrat',sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,600;1,400&family=Montserrat:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing:border-box; }
      `}</style>

      <nav style={{ padding:"18px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center" }}>
        <Link to="/" style={{ textDecoration:"none" }}>
          <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem" }}>
            <span style={{color:"#F8F5F2"}}>Meta'</span>
            <span style={{color:"#C9A96A"}}>Morph'</span>
            <span style={{color:"#C2185B"}}>Ose</span>
          </span>
        </Link>
        <Link to="/" style={{ fontFamily:"'Montserrat'", fontSize:".68rem", letterSpacing:".2em", textTransform:"uppercase", color:"rgba(201,169,106,.6)", textDecoration:"none" }}>Retour</Link>
      </nav>

      <div style={{ padding:"60px 20px", maxWidth:"800px", margin:"0 auto", textAlign:"center" }}>
        <p style={{ fontSize:".65rem", letterSpacing:".28em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"16px" }}>Événement annuel</p>
        <h1 style={{ fontFamily:"'Playfair Display'", fontSize:"clamp(1.8rem,7vw,4rem)", fontWeight:600, lineHeight:1.1, marginBottom:"24px" }}>
          Le Brunch des<br/><em style={{ fontStyle:"italic", color:"#C9A96A" }}>Métamorphosées</em>
        </h1>
        <p style={{ fontWeight:300, lineHeight:1.8, color:"rgba(248,245,242,.6)", maxWidth:"540px", margin:"0 auto 40px", fontSize:"clamp(.88rem,2.5vw,1rem)" }}>
          Un événement pensé pour honorer, célébrer et rassembler celles qui ont choisi de se transformer. Un rendez-vous annuel qui voyagera dans plusieurs pays — Bénin, Afrique, Europe.
        </p>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:"16px", marginBottom:"40px", textAlign:"left" }}>
          {[
            { titre:"Célébration", desc:"Honorer les transformations vécues et le courage des femmes qui ont osé changer." },
            { titre:"Connexion",   desc:"Créer des liens authentiques entre Métamorphosées venues de différents pays." },
            { titre:"Inspiration", desc:"Partager des parcours inspirants et renforcer la communauté féminine." },
            { titre:"Rayonnement", desc:"Un symbole de renaissance, de sororité et de puissance féminine collective." },
          ].map((c,i) => (
            <div key={i} style={{ padding:"24px 20px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(201,169,106,.1)", borderTop:"2px solid #C9A96A", borderRadius:"4px" }}>
              <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", fontWeight:600, color:"#C9A96A", marginBottom:"8px" }}>{c.titre}</p>
              <p style={{ fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.55)", lineHeight:1.65 }}>{c.desc}</p>
            </div>
          ))}
        </div>

        <div style={{ padding:"36px 28px", background:"rgba(201,169,106,.05)", border:"1px solid rgba(201,169,106,.15)", borderRadius:"4px", marginBottom:"36px" }}>
          <p style={{ fontFamily:"'Playfair Display'", fontStyle:"italic", fontSize:"clamp(.95rem,2.5vw,1.1rem)", color:"rgba(248,245,242,.5)", lineHeight:1.7 }}>
            Un projet en préparation · La communauté grandit.<br/>
            <span style={{ fontSize:".82rem", color:"rgba(201,169,106,.4)" }}>Chaque édition dans une ville différente.</span>
          </p>
        </div>

        <a href="/#formules" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#C2185B", color:"#fff", fontFamily:"'Montserrat'", fontWeight:600, fontSize:".75rem", letterSpacing:".15em", textTransform:"uppercase", padding:"16px 36px", borderRadius:"2px", textDecoration:"none", width:"100%", maxWidth:"360px" }}>
          Commencer ma transformation
        </a>
      </div>
    </div>
  )
}
