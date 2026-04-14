import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import AuraButton from '../components/AuraButton'
import API_URL from '../config';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Montserrat:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  body { background:#0A0A0A; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  .reveal{opacity:0;transform:translateY(30px);transition:opacity .8s ease,transform .8s ease}
  .reveal.visible{opacity:1;transform:none}
  .aa-grid{display:grid;grid-template-columns:1fr 32px 1fr;align-items:center;padding:14px 0;border-bottom:1px solid rgba(255,255,255,.04)}@media(max-width:600px){.aa-grid{grid-template-columns:1fr !important;gap:6px}}
  .temo-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:20px}@media(max-width:480px){.temo-grid{grid-template-columns:1fr !important}}
  @media(max-width:600px){
    .aa-grid{grid-template-columns:1fr;gap:8px}
    .aa-arrow{display:none}
  }
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
      fetch(`${API_URL}/api/admin/config/public/`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          if (cancelled) return;
          const map = {};
          if (Array.isArray(data)) data.forEach(i => { map[i.cle] = i.valeur; });
          setContent(map);
        })
        .catch(() => {
          if (cancelled) return;
          setTimeout(fetchContent, 6000);
        });
    }
    fetchContent();
    return () => { cancelled = true; };
  }, []);
  return (cle, def = "") => content[cle] || def;
}

export default function Temoignages() {
  const get = useSiteContent();
  const [temos,   setTemos]   = useState([]);
  const [loading, setLoading] = useState(true);
  useReveal();

  useEffect(() => {
    let cancelled = false;
    function fetchTemos() {
      fetch(`${API_URL}/api/avis/`)
        .then(r => r.ok ? r.json() : Promise.reject())
        .then(data => {
          if (cancelled) return;
          setTemos(Array.isArray(data) ? data : []);
          setLoading(false);
        })
        .catch(() => {
          if (cancelled) return;
          setTimeout(fetchTemos, 6000);
        });
    }
    fetchTemos();
    return () => { cancelled = true; };
  }, []);

  const videos   = temos.filter(t => t.type_temo === 'video' || t.video_url || t.video_fichier);
  const ecrits   = temos.filter(t => !t.type_temo || t.type_temo === 'texte');
  const audios   = temos.filter(t => t.type_temo === 'audio');



  return (
    <>
      <style>{STYLES}</style>
      <div style={{ background:"#0A0A0A", color:"#F8F5F2", fontFamily:"'Montserrat',sans-serif", minHeight:"100vh" }}>

        <nav style={{ padding:"18px 24px", borderBottom:"1px solid rgba(201,169,106,.1)", display:"flex", justifyContent:"space-between", alignItems:"center", position:"sticky", top:0, background:"rgba(10,10,10,.95)", backdropFilter:"blur(20px)", zIndex:100 }}>
          <Link to="/" style={{ textDecoration:"none" }}>
            <span style={{ fontFamily:"'Playfair Display',serif", fontSize:"1rem" }}>
              <span style={{color:"#F8F5F2"}}>Meta'</span>
              <span style={{color:"#C9A96A"}}>Morph'</span>
              <span style={{color:"#C2185B"}}>Ose</span>
            </span>
          </Link>
          <div style={{ display:"flex", gap:"16px", alignItems:"center" }}>
            <Link to="/" style={{ fontFamily:"'Montserrat'", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", color:"rgba(201,169,106,.5)", textDecoration:"none" }}>Accueil</Link>
            <Link to="/contact" style={{ fontFamily:"'Montserrat'", fontSize:".68rem", letterSpacing:".15em", textTransform:"uppercase", background:"#C2185B", color:"#fff", textDecoration:"none", padding:"9px 18px", borderRadius:"2px" }}>S'inscrire</Link>
          </div>
        </nav>

        {/* Hero */}
        <section style={{ padding:"80px 24px 60px", textAlign:"center", background:"linear-gradient(180deg,#0A0A0A,#110d09)", position:"relative" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 40% at 50% 60%,rgba(194,24,91,.07),transparent 70%)" }}/>
          <div style={{ position:"relative", maxWidth:"640px", margin:"0 auto" }}>
            <p style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"14px", animation:"fadeUp .7s both" }}>Témoignages</p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,6vw,3.2rem)", fontWeight:700, lineHeight:1.1, marginBottom:"20px", animation:"fadeUp .8s .1s both" }}>
              {get("temo_titre","Elles ont osé. Leur transformation parle d'elle-même.")}
            </h1>
            <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:"clamp(.88rem,2vw,1rem)", color:"rgba(248,245,242,.55)", lineHeight:1.8, animation:"fadeUp .8s .2s both" }}>
              {get("temo_intro","Chaque femme qui entre dans Méta'Morph'Ose entame un chemin de révélation.")}
            </p>
          </div>
        </section>

        <div style={{ maxWidth:"900px", margin:"0 auto", padding:"0 24px 80px" }}>

          {/* Témoignages vidéo */}
          <section style={{ padding:"64px 0 0" }}>
            <p className="reveal" style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"24px" }}>Témoignages Vidéo</p>
            <div className="temo-grid">
              {videos.length > 0 ? videos.map((t,i) => {
                const hasYoutubeLink = t.video_url && (t.video_url.includes("youtube") || t.video_url.includes("youtu.be"));
                const embedUrl = hasYoutubeLink
                  ? t.video_url.replace("watch?v=","embed/").replace("youtu.be/","www.youtube.com/embed/").split("&")[0]
                  : "";
                return (
                  <div key={i} style={{ borderRadius:"4px", overflow:"hidden", border:"1px solid rgba(255,255,255,.07)", animation:`fadeUp .7s ${i*.1}s both` }}>
                    {t.video_fichier ? (
                      <video controls src={t.video_fichier} style={{ width:"100%", aspectRatio:"16/9", background:"#000", display:"block" }}
                        onError={e => {
                          // Format non supporté — afficher lien download
                          const div = document.createElement('div');
                          div.style.cssText = 'display:flex;flex-direction:column;align-items:center;justify-content:center;aspect-ratio:16/9;background:rgba(255,255,255,.025);gap:12px';
                          div.innerHTML = `<p style="font-family:Montserrat;font-size:.75rem;color:rgba(248,245,242,.5)">Format non lisible dans le navigateur</p><a href="${t.video_fichier}" download style="background:#C2185B;color:#fff;padding:10px 20px;border-radius:3px;font-family:Montserrat;font-size:.72rem;text-decoration:none;font-weight:600;letter-spacing:.1em;text-transform:uppercase">Télécharger la vidéo</a>`;
                          e.target.parentNode.replaceChild(div, e.target);
                        }}
                      >
                        <source src={t.video_fichier} type="video/mp4"/>
                        <source src={t.video_fichier} type="video/quicktime"/>
                        <source src={t.video_fichier} type="video/mov"/>
                      </video>
                    ) : hasYoutubeLink ? (
                      <iframe src={embedUrl} style={{ width:"100%", aspectRatio:"16/9", border:"none" }} allowFullScreen title={`Témoignage ${t.prenom}`}/>
                    ) : t.video_url ? (
                      <a href={t.video_url} target="_blank" rel="noreferrer" style={{ display:"flex", aspectRatio:"16/9", background:"rgba(255,255,255,.025)", alignItems:"center", justifyContent:"center", textDecoration:"none" }}>
                        <div style={{ textAlign:"center" }}>
                          <div style={{ width:"48px", height:"48px", borderRadius:"50%", border:"2px solid rgba(194,24,91,.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px", background:"rgba(194,24,91,.08)" }}>
                            <span style={{ color:"#C2185B", fontSize:"1.1rem", paddingLeft:"3px" }}>▶</span>
                          </div>
                          <p style={{ fontFamily:"'Montserrat'", fontSize:".72rem", color:"rgba(248,245,242,.5)", fontWeight:300 }}>{t.prenom}</p>
                        </div>
                      </a>
                    ) : null}
                    <div style={{ padding:"12px 16px", background:"rgba(255,255,255,.02)", borderTop:"1px solid rgba(255,255,255,.05)" }}>
                      {t.texte && <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:".88rem", color:"rgba(248,245,242,.6)", lineHeight:1.6, marginBottom:"6px" }}>« {t.texte} »</p>}
                      <p style={{ fontFamily:"'Montserrat'", fontSize:".68rem", color:"rgba(248,245,242,.35)" }}>{t.prenom}{t.pays ? ` · ${t.pays}` : ""}</p>
                    </div>
                  </div>
                );
              }) : [1,2,3].map(i => (
                <div key={i} className="reveal" style={{ transitionDelay:`${i*.1}s`, aspectRatio:"16/9", background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"4px", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  <div style={{ textAlign:"center" }}>
                    <div style={{ width:"48px", height:"48px", borderRadius:"50%", border:"2px solid rgba(194,24,91,.3)", display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 10px", background:"rgba(194,24,91,.08)" }}>
                      <span style={{ color:"#C2185B", fontSize:"1.1rem", paddingLeft:"3px" }}>▶</span>
                    </div>
                    <p style={{ fontFamily:"'Montserrat'", fontSize:".68rem", color:"rgba(248,245,242,.25)", fontWeight:300 }}>Témoignage à venir</p>
                  </div>
                </div>
              ))}
            </div>
            {videos.length === 0 && (
              <p className="reveal" style={{ marginTop:"16px", fontFamily:"'Montserrat'", fontWeight:300, fontSize:".78rem", color:"rgba(248,245,242,.3)", fontStyle:"italic", textAlign:"center" }}>
                Les témoignages vidéo seront ajoutés depuis le dashboard admin.
              </p>
            )}
          </section>

          {/* Témoignages écrits */}
          <section style={{ padding:"64px 0 0" }}>
            <p className="reveal" style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"24px" }}>Ce que disent les Métamorphosées</p>
            <div className="temo-grid">
              {(ecrits.length > 0 ? ecrits : [
                { prenom:"A", pays:"Bénin",   texte:"Le programme a complètement changé ma façon de me voir. J'ai repris confiance en moi et en mes capacités.", note:5 },
                { prenom:"M", pays:"France",  texte:"Prélia a su créer un espace bienveillant où j'ai pu me révéler sans jugement. Une expérience transformatrice.", note:5 },
                { prenom:"F", pays:"Sénégal", texte:"Les 8 semaines sont passées trop vite. J'en suis ressortie avec une image claire de qui je suis et où je vais.", note:5 },
              ]).map((t,i) => (
                <div key={i} className="reveal" style={{ transitionDelay:`${i*.1}s`, padding:"28px 24px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(255,255,255,.07)", borderRadius:"4px" }}>
                  {/* Étoiles */}
                  {t.note && (
                    <div style={{ display:"flex", gap:"2px", marginBottom:"14px" }}>
                      {[1,2,3,4,5].map(s => (
                        <span key={s} style={{ color:s<=t.note?"#C9A96A":"rgba(255,255,255,.15)", fontSize:".9rem" }}>★</span>
                      ))}
                    </div>
                  )}
                  <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1rem", color:"rgba(248,245,242,.75)", lineHeight:1.75, marginBottom:"20px" }}>
                    « {t.texte} »
                  </p>
                  <div style={{ display:"flex", alignItems:"center", gap:"14px" }}>
                    {t.photo_avant ? (
                      <img src={t.photo_avant} alt={t.prenom} style={{ width:"48px", height:"48px", borderRadius:"50%", objectFit:"cover", border:"2px solid rgba(201,169,106,.25)", flexShrink:0 }}/>
                    ) : (
                      <div style={{ width:"48px", height:"48px", borderRadius:"50%", background:"rgba(194,24,91,.1)", border:"1px solid rgba(194,24,91,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Playfair Display',serif", fontSize:"1rem", color:"#C2185B", fontWeight:600, flexShrink:0 }}>{t.prenom?.[0]}</div>
                    )}
                    <div>
                      <p style={{ fontFamily:"'Montserrat'", fontSize:".78rem", fontWeight:600, color:"rgba(248,245,242,.8)", marginBottom:"2px" }}>{t.prenom}</p>
                      {t.pays && <p style={{ fontFamily:"'Montserrat'", fontSize:".65rem", color:"rgba(248,245,242,.35)", fontWeight:300 }}>{t.pays}</p>}
                      {t.formule && <p style={{ fontFamily:"'Montserrat'", fontSize:".6rem", color:"rgba(201,169,106,.5)", letterSpacing:".1em", textTransform:"uppercase" }}>{t.formule}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>



          {/* CTA */}
          {/* Témoignages audio */}
          {audios.length > 0 && (
            <section style={{ padding:"64px 0 0" }}>
              <p className="reveal" style={{ fontFamily:"'Montserrat'", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"24px" }}>Témoignages Audio</p>
              <div style={{ display:"flex", flexDirection:"column", gap:"12px" }}>
                {audios.map((t,i) => (
                  <div key={i} className="reveal" style={{ transitionDelay:`${i*.08}s`, padding:"20px 24px", background:"rgba(255,255,255,.025)", border:"1px solid rgba(194,24,91,.12)", borderRadius:"4px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:"12px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:"10px" }}>
                        <div style={{ width:"32px", height:"32px", borderRadius:"50%", background:"rgba(194,24,91,.15)", border:"1px solid rgba(194,24,91,.2)", display:"flex", alignItems:"center", justifyContent:"center", fontFamily:"'Playfair Display',serif", fontSize:".85rem", color:"#C2185B", fontWeight:600, flexShrink:0 }}>{t.prenom[0]}</div>
                        <div>
                          <p style={{ fontFamily:"'Montserrat'", fontWeight:500, fontSize:".82rem" }}>{t.prenom}</p>
                          {t.pays && <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".7rem", color:"rgba(248,245,242,.35)" }}>{t.pays}</p>}
                        </div>
                      </div>
                      <div style={{ display:"flex", gap:"2px" }}>
                        {[1,2,3,4,5].map(s => <span key={s} style={{ color:s<=t.note?"#C9A96A":"rgba(255,255,255,.15)", fontSize:".8rem" }}>★</span>)}
                      </div>
                    </div>
                    {t.texte && <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:".9rem", color:"rgba(248,245,242,.55)", lineHeight:1.65, marginBottom:"12px" }}>« {t.texte} »</p>}
                    {t.audio_fichier && <audio controls src={t.audio_fichier} style={{ width:"100%", height:"36px" }}/>}
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="reveal" style={{ padding:"64px 0 0", textAlign:"center" }}>
            <div style={{ padding:"48px 32px", background:"rgba(194,24,91,.06)", border:"1px solid rgba(194,24,91,.2)", borderRadius:"6px" }}>
              <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.4rem,4vw,2rem)", fontWeight:600, marginBottom:"14px" }}>
                Et si la prochaine transformation était la vôtre ?
              </h2>
              <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".88rem", color:"rgba(248,245,242,.5)", marginBottom:"28px", maxWidth:"400px", margin:"0 auto 28px", lineHeight:1.75 }}>
                Ces femmes ont fait un choix. Rejoignez-les.
              </p>
              <div style={{ display:"flex", gap:"12px", justifyContent:"center", flexWrap:"wrap" }}>
                <Link to="/contact" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"#C2185B", color:"#fff", fontFamily:"'Montserrat'", fontWeight:600, fontSize:".74rem", letterSpacing:".15em", textTransform:"uppercase", padding:"15px 32px", borderRadius:"2px", textDecoration:"none" }}>
                  Je commence ma transformation
                </Link>
                <Link to="/programme" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"transparent", color:"#C9A96A", fontFamily:"'Montserrat'", fontWeight:500, fontSize:".74rem", letterSpacing:".15em", textTransform:"uppercase", padding:"14px 28px", border:"1px solid #C9A96A", borderRadius:"2px", textDecoration:"none" }}>
                  Voir le programme
                </Link>
              </div>
              {/* Bouton soumettre témoignage — pour les membres */}
              <div style={{ marginTop:"20px", paddingTop:"20px", borderTop:"1px solid rgba(255,255,255,.06)" }}>
                <p style={{ fontFamily:"'Montserrat'", fontWeight:300, fontSize:".78rem", color:"rgba(248,245,242,.3)", marginBottom:"12px" }}>
                  Vous avez déjà vécu la transformation ?
                </p>
                <Link to="/dashboard" style={{ display:"inline-flex", alignItems:"center", justifyContent:"center", background:"transparent", color:"rgba(248,245,242,.5)", fontFamily:"'Montserrat'", fontWeight:500, fontSize:".72rem", letterSpacing:".12em", textTransform:"uppercase", padding:"11px 22px", border:"1px solid rgba(255,255,255,.12)", borderRadius:"2px", textDecoration:"none", transition:"all .3s" }}
                  onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(201,169,106,.3)";e.currentTarget.style.color="#C9A96A"}}
                  onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,.12)";e.currentTarget.style.color="rgba(248,245,242,.5)"}}>
                  Partager mon témoignage
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
