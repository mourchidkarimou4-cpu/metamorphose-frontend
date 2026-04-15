import { useState, useRef } from "react";

/**
 * SectionCadeaux — Composant réutilisable (Chanson + Guide PDF)
 * Props :
 *   - audioUrl  : URL du fichier audio
 *   - pdfUrl    : URL du guide PDF
 *   - config    : objet optionnel pour surcharger les textes
 */
export default function SectionCadeaux({
  audioUrl  = "/metamorphose.mp3",
  pdfUrl    = "/guide-eisenhower.pdf",
  config    = {},
}) {
  const [playing,  setPlaying]  = useState(false);
  const [progress, setProgress] = useState(0);
  const ref = useRef(null);

  const g = (key, defaut) => config[key] || defaut;

  function togglePlay() {
    if (!ref.current) return;
    if (playing) { ref.current.pause(); setPlaying(false); }
    else { ref.current.play(); setPlaying(true); }
  }

  function onTimeUpdate() {
    if (!ref.current || !ref.current.duration) return;
    setProgress((ref.current.currentTime / ref.current.duration) * 100);
  }

  return (
    <section style={{ padding:"90px 24px", background:"linear-gradient(180deg,#0A0A0A 0%,#110d09 100%)", color:"#F8F5F2" }}>
      <div style={{ maxWidth:"900px", margin:"0 auto" }}>
        <div style={{ textAlign:"center", marginBottom:"56px" }}>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".28em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"14px" }}>
            Cadeaux
          </p>
          <h2 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.6rem,4vw,2.4rem)", fontWeight:600, lineHeight:1.2, marginBottom:"16px" }}>
            {g("titre","Deux cadeaux pour commencer votre transformation dès maintenant")}
          </h2>
          <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".9rem", color:"rgba(248,245,242,.5)", maxWidth:"520px", margin:"0 auto", lineHeight:1.75 }}>
            {g("desc","Une chanson pour réveiller votre âme. Un guide pour reprendre le contrôle de votre temps.")}
          </p>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))", gap:"24px" }}>

          {/* Chanson */}
          <div style={{ padding:"36px 32px", background:"rgba(194,24,91,.06)", border:"1px solid rgba(194,24,91,.15)", borderTop:"3px solid #C2185B", borderRadius:"6px" }}>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C2185B", marginBottom:"12px" }}>Chanson</p>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", fontWeight:600, marginBottom:"6px" }}>
              {g("chanson_titre","Métamorphose")}
            </h3>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".75rem", color:"rgba(248,245,242,.4)", marginBottom:"16px" }}>
              {g("chanson_artiste","Prélia Apedo Ahonon")}
            </p>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.55)", lineHeight:1.75, marginBottom:"24px" }}>
              {g("chanson_desc","Je ne l'ai pas écrite pour distraire... je l'ai écrite pour réveiller.")}
            </p>
            <audio ref={ref} src={audioUrl} onTimeUpdate={onTimeUpdate} onEnded={() => { setPlaying(false); setProgress(0); }}/>
            <div style={{ height:"3px", background:"rgba(255,255,255,.08)", borderRadius:"2px", overflow:"hidden", marginBottom:"16px" }}>
              <div style={{ height:"100%", width:`${progress}%`, background:"#C2185B", borderRadius:"2px", transition:"width .3s" }}/>
            </div>
            <div style={{ display:"flex", gap:"10px" }}>
              <button onClick={togglePlay}
                style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", background:"#C2185B", color:"#fff", border:"none", borderRadius:"3px", padding:"13px 20px", fontFamily:"'Montserrat',sans-serif", fontWeight:600, fontSize:".72rem", letterSpacing:".12em", textTransform:"uppercase", cursor:"pointer", flex:1 }}>
                {playing ? "Pause" : "Écouter"}
              </button>
              <a href={audioUrl} download target="_blank" rel="noreferrer"
                style={{ display:"flex", alignItems:"center", justifyContent:"center", background:"transparent", color:"#C2185B", border:"1px solid #C2185B", borderRadius:"3px", padding:"13px 18px", fontFamily:"'Montserrat',sans-serif", fontWeight:600, fontSize:".72rem", letterSpacing:".12em", textTransform:"uppercase", textDecoration:"none", whiteSpace:"nowrap" }}>
                Télécharger
              </a>
            </div>
          </div>

          {/* Guide PDF */}
          <div style={{ padding:"36px 32px", background:"rgba(201,169,106,.04)", border:"1px solid rgba(201,169,106,.15)", borderTop:"3px solid #C9A96A", borderRadius:"6px" }}>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"12px" }}>Guide PDF Gratuit</p>
            <h3 style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", fontWeight:600, marginBottom:"6px" }}>
              {g("guide_titre","Méthode Eisenhower")}
            </h3>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".75rem", color:"rgba(248,245,242,.4)", marginBottom:"16px" }}>
              {g("guide_sous","Pour les femmes ambitieuses")}
            </p>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.55)", lineHeight:1.75, marginBottom:"20px" }}>
              {g("guide_desc","Parce qu'une femme qui veut évoluer doit apprendre à reprendre le contrôle de son temps.")}
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:"8px", marginBottom:"24px" }}>
              {[
                g("guide_point1","Prioriser ce qui compte vraiment"),
                g("guide_point2","Sortir de la procrastination"),
                g("guide_point3","Passer à l'action avec discipline"),
              ].filter(Boolean).map((p, i) => (
                <div key={i} style={{ display:"flex", gap:"10px", alignItems:"flex-start" }}>
                  <div style={{ width:"4px", height:"4px", borderRadius:"50%", background:"#C9A96A", flexShrink:0, marginTop:"8px" }}/>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:".82rem", color:"rgba(248,245,242,.65)" }}>{p}</p>
                </div>
              ))}
            </div>
            <a href={pdfUrl} download target="_blank" rel="noreferrer"
              style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:"10px", background:"transparent", color:"#C9A96A", border:"1px solid #C9A96A", borderRadius:"3px", padding:"13px 24px", fontFamily:"'Montserrat',sans-serif", fontWeight:600, fontSize:".72rem", letterSpacing:".12em", textTransform:"uppercase", textDecoration:"none", width:"100%", boxSizing:"border-box" }}>
              Télécharger le guide
            </a>
          </div>

        </div>
      </div>
    </section>
  );
}
