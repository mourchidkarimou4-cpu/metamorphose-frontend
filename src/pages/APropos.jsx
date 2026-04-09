import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuraButton from "../components/AuraButton";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@1,300;1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { background:#0A0A0A; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  .reveal{opacity:0;transform:translateY(30px);transition:opacity .8s ease,transform .8s ease}
  .reveal.visible{opacity:1;transform:none}
  .story-grid{display:grid;grid-template-columns:1fr 320px;gap:64px;align-items:start}
  .valeurs-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:16px}
  .expertise-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}
  .philo-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:16px}
  @media(max-width:900px){
    .story-grid{grid-template-columns:1fr !important;gap:40px}
    .valeurs-grid{grid-template-columns:repeat(2,1fr)}
    .expertise-grid{grid-template-columns:1fr}
  }
  @media(max-width:540px){.valeurs-grid{grid-template-columns:1fr}}
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

function useSiteContent() {
  const [content, setContent] = useState({});
  useEffect(() => {
    let cancelled = false;
    function fetchContent() {
      fetch("/api/admin/config/public/")
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          if (cancelled) return;
          const map = {};
          if (Array.isArray(data)) data.forEach(i => { map[i.cle] = i.valeur; });
          setContent(map);
        })
        .catch(() => { if (cancelled) return; setTimeout(fetchContent, 6000); });
    }
    fetchContent();
    return () => { cancelled = true; };
  }, []);
  return (cle, def = "") => content[cle] || def;
}

const OR = "#C9A96A", ROSE = "#C2185B", BLANC = "#F8F5F2";

function SectionTitle({ label, titre }) {
  return (
    <div style={{ marginBottom: "32px" }}>
      <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".28em", textTransform:"uppercase", color:OR, marginBottom:"10px" }}>{label}</p>
      <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.4rem,3.5vw,2rem)", fontWeight:700, lineHeight:1.2 }}>{titre}</h2>
      <div style={{ width:"40px", height:"1px", background:`linear-gradient(90deg,${ROSE},transparent)`, marginTop:"14px" }}/>
    </div>
  );
}

function Para({ children, style={} }) {
  return (
    <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.65)", lineHeight:1.85, marginBottom:"18px", ...style }}>
      {children}
    </p>
  );
}

function Bullet({ text }) {
  return (
    <div style={{ display:"flex", gap:"12px", alignItems:"flex-start" }}>
      <span style={{ color:ROSE, flexShrink:0, marginTop:"3px", fontSize:".75rem" }}>✦</span>
      <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.7)", lineHeight:1.75 }}>{text}</p>
    </div>
  );
}

export default function APropos() {
  const get = useSiteContent();
  useReveal();

  const valeurs = get("valeurs_items","Authenticité:Être soi-même pleinement|Bienveillance:Évoluer dans un espace sûr|Excellence:Une expérience structurée|Empowerment:Reprendre le pouvoir|Spiritualité:Transformation profonde|Holistique:Intérieur, extérieur, action")
    .split("|").filter(Boolean).map(v => { const [t,d] = v.split(":"); return {titre:t,desc:d}; });

  const certs = get("prelia_certifications","Coach en Image certifiée|Styliste|Leader Oratrice — AIL").split("|").filter(Boolean);

  return (
    <>
      <style>{STYLES}</style>
      <div style={{ background:"#0A0A0A", color:BLANC, fontFamily:"'Montserrat',sans-serif", minHeight:"100vh" }}>

        {/* Nav */}
        <nav style={{ padding:"18px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"rgba(10,10,10,.95)", backdropFilter:"blur(20px)", zIndex:100 }}>
          <Link to="/" style={{ textDecoration:"none" }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem" }}>
              <span style={{color:BLANC}}>Méta'</span><span style={{color:OR}}>Morph'</span><span style={{color:ROSE}}>Ose</span>
            </span>
          </Link>
          <div style={{ display:"flex", gap:"16px", alignItems:"center" }}>
            <Link to="/" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}>Accueil</Link>
            <Link to="/contact" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", background:ROSE, color:"#fff", textDecoration:"none", padding:"9px 18px", borderRadius:"2px" }}>S'inscrire</Link>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ padding:"80px 24px 60px", textAlign:"center", background:"linear-gradient(180deg,#0A0A0A,#110d09)", position:"relative" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 40% at 50% 60%,rgba(201,169,106,.06),transparent 70%)" }}/>
          <div style={{ position:"relative", maxWidth:"640px", margin:"0 auto" }}>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:OR, marginBottom:"14px", animation:"fadeUp .7s both" }}>À Propos de Prélia</p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,6vw,3.2rem)", fontWeight:700, lineHeight:1.1, marginBottom:"20px", animation:"fadeUp .8s .1s both" }}>
              Une femme engagée à révéler l'essence des femmes.
            </h1>
            <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.15rem", color:"rgba(248,245,242,.5)", lineHeight:1.7, animation:"fadeUp .8s .2s both" }}>
              Je ne crée pas des apparences. Je révèle des essences.
            </p>
          </div>
        </section>

        <div style={{ maxWidth:"1000px", margin:"0 auto", padding:"0 24px 80px" }}>

          {/* INTRODUCTION */}
          <section style={{ padding:"72px 0 0" }}>
            <div className="story-grid">
              <div>
                <blockquote className="reveal" style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.4rem", color:"#EFC7D3", borderLeft:`2px solid ${ROSE}`, paddingLeft:"24px", marginBottom:"36px", lineHeight:1.6 }}>
                  « {get("prelia_citation","Je sais ce que cela fait de se sentir invisible.")} »
                </blockquote>
                <Para>Je suis Prélia Apedo, conseillère en image, styliste certifiée, communicatrice passionnée et fondatrice de la marque White & Black, ainsi que du programme de transformation Méta'Morph'Ose.</Para>
                <Para>Depuis plusieurs années, ma mission est claire : Accompagner les femmes à se redécouvrir, à reprendre confiance en elles et à révéler la puissance qu'elles portent déjà en elles.</Para>
                <Para>Je crois profondément que chaque femme possède une lumière unique. Mais trop souvent, cette lumière reste cachée derrière le doute, la peur du regard des autres ou une image qui ne reflète pas sa véritable valeur.</Para>
                <Para>C'est pour cela que j'ai créé Méta'Morph'Ose — un espace où les femmes peuvent se réconcilier avec elles-mêmes, révéler leur identité et apprendre à incarner leur puissance avec élégance et authenticité.</Para>

                <div className="reveal" style={{ marginBottom:"32px" }}>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".22em", textTransform:"uppercase", color:OR, marginBottom:"14px" }}>Certifications & Expertise</p>
                  <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                    {certs.map((c,i) => (
                      <span key={i} style={{ padding:"7px 14px", border:"1px solid rgba(201,169,106,.22)", borderRadius:"100px", fontFamily:"'Montserrat',sans-serif", fontSize:".7rem", color:"rgba(201,169,106,.75)", fontWeight:500 }}>{c}</span>
                    ))}
                  </div>
                </div>

                <div className="reveal" style={{ display:"flex", gap:"14px", flexWrap:"wrap" }}>
                  <Link to="/contact" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:ROSE, color:"#fff", fontFamily:"'Montserrat',sans-serif", fontWeight:600, fontSize:".75rem", letterSpacing:".15em", textTransform:"uppercase", padding:"15px 32px", borderRadius:"2px", textDecoration:"none" }}>
                    Rejoindre le programme
                  </Link>
                  <Link to="/programme" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"transparent", color:OR, fontFamily:"'Montserrat',sans-serif", fontWeight:500, fontSize:".75rem", letterSpacing:".15em", textTransform:"uppercase", padding:"14px 28px", border:`1px solid ${OR}`, borderRadius:"2px", textDecoration:"none" }}>
                    Découvrir le programme
                  </Link>
                </div>
              </div>

              {/* Photo */}
              <div className="reveal" style={{ position:"sticky", top:"90px" }}>
                <div style={{ position:"relative", paddingBottom:"130%", background:`linear-gradient(135deg,rgba(194,24,91,.1),rgba(201,169,106,.08))`, border:"1px solid rgba(201,169,106,.18)", borderRadius:"4px", overflow:"hidden" }}>
                  {get("photo_prelia","") ? (
                    <img src={get("photo_prelia","")} alt="Prélia Apedo" style={{ position:"absolute", inset:0, width:"100%", height:"100%", objectFit:"cover", objectPosition:"center top" }}/>
                  ) : (
                    <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".65rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.3)" }}>Photo Prélia Apedo</p>
                    </div>
                  )}
                  <div style={{ position:"absolute", inset:"14px", border:"1px solid rgba(201,169,106,.08)", borderRadius:"2px", pointerEvents:"none" }}/>
                </div>
                <div style={{ textAlign:"center", marginTop:"16px" }}>
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1rem", color:OR, opacity:.85 }}>Prélia Apedo</p>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".12em", textTransform:"uppercase", color:"rgba(248,245,242,.25)", marginTop:"4px" }}>Fondatrice · White & Black · Méta'Morph'Ose</p>
                  {get("logo_white_black","") && <img src={get("logo_white_black","")} alt="White & Black" style={{ height:"20px", objectFit:"contain", opacity:.5, marginTop:"10px" }}/>}
                </div>
              </div>
            </div>
          </section>

          {/* MON HISTOIRE */}
          <section style={{ padding:"72px 0 0" }}>
            <SectionTitle label="Mon Histoire" titre="Mon histoire : le chemin vers la révélation"/>
            <Para>Comme beaucoup de femmes, j'ai moi aussi traversé des moments de doute, de questionnement et de recherche de sens.</Para>
            <Para>Pendant longtemps, j'ai observé combien de femmes extraordinaires se sous-estimaient. Combien d'entre elles se cachaient derrière le regard des autres, alors qu'elles portaient en elles un potentiel immense.</Para>
            <Para>Ces observations ont éveillé en moi une conviction profonde : Lorsqu'une femme retrouve confiance en elle et s'aligne avec son identité, sa vie entière peut se transformer.</Para>
            <Para>C'est cette conviction qui m'a poussée à me former, à approfondir mes connaissances et à développer une approche qui relie l'image, la posture, la conscience de soi et l'affirmation personnelle.</Para>
          </section>

          {/* MON EXPERTISE */}
          <section style={{ padding:"72px 0 0" }}>
            <SectionTitle label="Mon Expertise" titre="Une expertise au service de la transformation des femmes"/>
            <Para>Aujourd'hui, j'accompagne des femmes à travers une approche unique qui combine :</Para>
            <div className="reveal expertise-grid" style={{ marginBottom:"28px" }}>
              {["Le coaching en image","Le développement personnel","La valorisation de l'identité","Le Stylisme","L'Art Oratoire","Une dimension spirituelle et intérieure"].map((item,i) => (
                <div key={i} style={{ display:"flex", gap:"10px", alignItems:"center", padding:"12px 16px", background:"rgba(255,255,255,.03)", border:"1px solid rgba(255,255,255,.05)", borderRadius:"4px" }}>
                  <span style={{ color:OR, fontSize:".75rem" }}>✦</span>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:400, fontSize:".85rem", color:"rgba(248,245,242,.75)" }}>{item}</p>
                </div>
              ))}
            </div>
            <Para>Mon travail ne consiste pas à transformer artificiellement les femmes. Mon rôle est de révéler ce qui existe déjà en elles.</Para>
            <Para>À travers mes accompagnements, mes conférences et le programme Méta'Morph'Ose, j'aide les femmes à :</Para>
            <div className="reveal" style={{ display:"flex", flexDirection:"column", gap:"12px", marginBottom:"28px" }}>
              {["Développer une confiance authentique,","Aligner leur image avec leur identité,","S'affirmer dans leur vie personnelle et professionnelle,","Et oser incarner pleinement leur potentiel."].map((item,i) => <Bullet key={i} text={item}/>)}
            </div>
          </section>

          {/* WHITE & BLACK */}
          <section style={{ padding:"72px 0 0" }}>
            <SectionTitle label="White & Black" titre="White & Black : la naissance d'une vision"/>
            <div className="reveal" style={{ padding:"36px 40px", background:"rgba(201,169,106,.04)", border:"1px solid rgba(201,169,106,.12)", borderRadius:"6px" }}>
              {get("logo_white_black","") ? (
                <img src={get("logo_white_black","")} alt="White & Black" style={{ height:"36px", objectFit:"contain", marginBottom:"20px" }}/>
              ) : (
                <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.4rem", fontWeight:600, color:OR, marginBottom:"20px" }}>White & Black</p>
              )}
              <Para>White & Black est la marque monochrome que j'ai créée pour célébrer la dualité et la richesse de la féminité.</Para>
              <Para>Le blanc et le noir symbolisent l'équilibre entre la douceur et la puissance, la lumière et l'ombre, la sensibilité et la force.</Para>
              <Para>À travers cette marque, j'ai voulu rappeler une chose essentielle : Chaque femme possède plusieurs facettes, et chacune d'elles mérite d'être honorée.</Para>
              <Para style={{ marginBottom:0 }}>C'est dans cet esprit qu'est né Méta'Morph'Ose, comme une extension naturelle de cette vision.</Para>
            </div>
          </section>

          {/* MA PHILOSOPHIE */}
          <section style={{ padding:"72px 0 0" }}>
            <SectionTitle label="Ma Philosophie" titre="Je ne crée pas des apparences. Je révèle des essences."/>
            <div className="reveal" style={{ borderLeft:`3px solid ${OR}`, paddingLeft:"28px", marginBottom:"28px" }}>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.25rem", color:"#EFC7D3", lineHeight:1.7 }}>
                « Ma philosophie repose sur une conviction simple : La transformation la plus puissante n'est pas celle qui change une personne… mais celle qui lui permet de redevenir pleinement elle-même. »
              </p>
            </div>
            <Para>Lorsque l'image extérieure s'aligne avec l'identité intérieure, quelque chose de profond se produit.</Para>
            <div className="reveal philo-grid" style={{ margin:"24px 0" }}>
              {[{icon:"🌟",text:"La posture change."},{icon:"💪",text:"La confiance grandit."},{icon:"🎯",text:"Les décisions deviennent plus claires."},{icon:"✨",text:"La femme prend sa place avec assurance."}].map((item,i) => (
                <div key={i} style={{ padding:"20px", background:"rgba(255,255,255,.02)", border:"1px solid rgba(255,255,255,.05)", borderRadius:"4px", textAlign:"center" }}>
                  <p style={{ fontSize:"1.5rem", marginBottom:"10px" }}>{item.icon}</p>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.6)", lineHeight:1.6 }}>{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          {/* MA MISSION */}
          <section style={{ padding:"72px 0 0" }}>
            <SectionTitle label="Ma Mission" titre="Ma mission"/>
            <Para>Ma mission est d'accompagner les femmes à :</Para>
            <div className="reveal" style={{ display:"flex", flexDirection:"column", gap:"12px", marginBottom:"28px" }}>
              {["Se libérer du poids du regard des autres","Retrouver confiance en leur valeur","Révéler leur image authentique","Et incarner leur leadership personnel"].map((item,i) => <Bullet key={i} text={item}/>)}
            </div>
            <div className="reveal" style={{ padding:"24px 28px", background:"rgba(194,24,91,.05)", border:"1px solid rgba(194,24,91,.15)", borderRadius:"4px" }}>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.1rem", color:"#EFC7D3", lineHeight:1.7 }}>
                « Je veux voir plus de femmes confiantes, alignées, inspirantes et capables d'impacter positivement leur entourage et leur environnement. »
              </p>
            </div>
          </section>

          {/* VALEURS */}
          <section style={{ padding:"72px 0 0" }}>
            <div style={{ textAlign:"center", marginBottom:"40px" }}>
              <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:OR, marginBottom:"12px" }}>Les Valeurs</p>
              <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:600 }}>
                {get("valeurs_titre","Une transformation portée par des valeurs fortes.")}
              </h2>
            </div>
            <div className="valeurs-grid">
              {valeurs.map((v,i) => (
                <div key={i} className="reveal" style={{ transitionDelay:`${i*.07}s`, padding:"24px 20px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.05)", borderRadius:"4px", transition:"all .35s" }}
                  onMouseEnter={e=>{ e.currentTarget.style.borderColor="rgba(201,169,106,.2)"; e.currentTarget.style.background="rgba(201,169,106,.04)"; e.currentTarget.style.transform="translateY(-3px)"; }}
                  onMouseLeave={e=>{ e.currentTarget.style.borderColor="rgba(255,255,255,.05)"; e.currentTarget.style.background="rgba(255,255,255,.025)"; e.currentTarget.style.transform="none"; }}>
                  <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem", fontWeight:600, color:OR, marginBottom:"7px" }}>{v.titre}</h3>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".8rem", color:"rgba(248,245,242,.5)", fontWeight:300, lineHeight:1.65 }}>{v.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* MESSAGE AUX FEMMES */}
          <section className="reveal" style={{ padding:"72px 0 0" }}>
            <div style={{ padding:"56px 48px", background:"linear-gradient(135deg,rgba(194,24,91,.06),rgba(201,169,106,.04))", border:"1px solid rgba(201,169,106,.15)", borderRadius:"8px", textAlign:"center" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:OR, marginBottom:"16px" }}>Message aux femmes</p>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.5rem,4vw,2.2rem)", fontWeight:700, marginBottom:"32px", lineHeight:1.2 }}>
                Et si aujourd'hui était le début de votre transformation ?
              </h2>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.6)", lineHeight:1.85, maxWidth:"600px", margin:"0 auto 24px" }}>
                Si vous êtes ici, ce n'est peut-être pas un hasard. Peut-être qu'une partie de vous ressent qu'il est temps de changer quelque chose.
              </p>
              <div style={{ display:"flex", flexDirection:"column", gap:"10px", maxWidth:"440px", margin:"0 auto 32px", textAlign:"left" }}>
                {["D'arrêter de douter de vous,","De vous libérer du regard des autres,","De vous révéler pleinement."].map((item,i) => (
                  <Bullet key={i} text={`Peut-être qu'il est temps : ${item}`}/>
                ))}
              </div>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.1rem", color:"#EFC7D3", lineHeight:1.7, maxWidth:"560px", margin:"0 auto 32px" }}>
                « Si c'est ce que vous ressentez, alors je serai honorée de vous accompagner dans ce cheminement. Parce que votre transformation n'est pas seulement possible. Elle est déjà en train de commencer. »
              </p>
              <div style={{ display:"flex", gap:"14px", justifyContent:"center", flexWrap:"wrap" }}>
                <Link to="/contact" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:ROSE, color:"#fff", fontFamily:"'Montserrat',sans-serif", fontWeight:600, fontSize:".75rem", letterSpacing:".15em", textTransform:"uppercase", padding:"15px 36px", borderRadius:"2px", textDecoration:"none" }}>
                  Commencer ma transformation
                </Link>
                <Link to="/programme" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"transparent", color:OR, fontFamily:"'Montserrat',sans-serif", fontWeight:500, fontSize:".75rem", letterSpacing:".15em", textTransform:"uppercase", padding:"14px 28px", border:"1px solid rgba(201,169,106,.3)", borderRadius:"2px", textDecoration:"none" }}>
                  Découvrir le programme
                </Link>
              </div>
            </div>
          </section>

        </div>
      </div>
      <AuraButton />
    </>
  );
}
