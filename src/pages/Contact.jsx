import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { contactAPI, configAPI } from "../services/api";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400&family=Montserrat:wght@300;400;500;600;700&family=Cormorant+Garamond:ital,wght@1,400&display=swap');
  *, *::before, *::after { box-sizing:border-box; margin:0; padding:0; }
  :root {
    --noir:#0A0A0A; --or:#C9A96A; --or-light:#E8D5A8;
    --rose:#C2185B; --blanc:#F8F5F2;
    --ff-t:'Playfair Display',Georgia,serif;
    --ff-b:'Montserrat',sans-serif;
    --ff-a:'Cormorant Garamond',Georgia,serif;
  }
  html { scroll-behavior:smooth; }
  body { background:var(--noir); color:var(--blanc); font-family:var(--ff-b); font-weight:300; line-height:1.7; overflow-x:hidden; }
  @keyframes fadeUp { from{opacity:0;transform:translateY(30px)} to{opacity:1;transform:none} }
  .reveal { opacity:0; transform:translateY(30px); transition:opacity .8s ease,transform .8s ease; }
  .reveal.visible { opacity:1; transform:none; }
  .c-input { width:100%; padding:12px 16px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:3px; color:#F8F5F2; font-family:'Montserrat',sans-serif; font-size:.88rem; font-weight:300; outline:none; transition:border-color .25s; }
  .c-input:focus { border-color:rgba(201,169,106,.4); }
  .c-label { font-family:'Montserrat',sans-serif; font-size:.62rem; letter-spacing:.16em; text-transform:uppercase; color:rgba(248,245,242,.4); display:block; margin-bottom:6px; }
  .contact-card { padding:28px 24px; background:rgba(255,255,255,.025); border:1px solid rgba(255,255,255,.06); border-radius:4px; transition:border-color .3s; }
  .contact-card:hover { border-color:rgba(201,169,106,.2); }
  .social-link { display:inline-flex; align-items:center; gap:8px; padding:10px 18px; background:rgba(255,255,255,.04); border:1px solid rgba(255,255,255,.08); border-radius:3px; color:rgba(248,245,242,.6); font-family:'Montserrat',sans-serif; font-size:.72rem; font-weight:500; letter-spacing:.08em; text-decoration:none; transition:all .25s; }
  .social-link:hover { border-color:rgba(201,169,106,.3); color:#C9A96A; background:rgba(201,169,106,.05); }
  /* Bouton WhatsApp sticky */
  .wa-sticky { position:fixed; bottom:24px; right:24px; z-index:200; display:flex; align-items:center; gap:10px; background:#25D366; color:#fff; font-family:'Montserrat',sans-serif; font-weight:600; font-size:.72rem; letter-spacing:.1em; text-transform:uppercase; padding:13px 20px; border-radius:100px; text-decoration:none; box-shadow:0 4px 20px rgba(37,211,102,.3); transition:all .3s; }
  .wa-sticky:hover { transform:translateY(-3px); box-shadow:0 8px 28px rgba(37,211,102,.4); }
  @media(max-width:768px) { .form-2col { grid-template-columns:1fr !important; } .contacts-grid { grid-template-columns:1fr !important; } }
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

const RESEAUX = [
  { label:"Instagram", href:"https://www.instagram.com/preliaapedo?igsh=dGZhd2gxNnJjbXd3&utm_source=qr" },
  { label:"Facebook",  href:"https://www.facebook.com/share/17mGLiwty7/?mibextid=wwXIfr" },
  { label:"TikTok",    href:"https://www.tiktok.com/@prelitaa5?_r=1&_t=ZS-93NgdRO4zp6" },
  { label:"LinkedIn",  href:"https://www.linkedin.com/in/pr%C3%A9lia-apedo-84572139b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app" },
];

export default function Contact() {
  useReveal();

  const [config, setConfig] = useState({});
  useEffect(() => {
    configAPI.public()
      .then(res => {
        const map = {};
        if (Array.isArray(res.data)) res.data.forEach(i => { map[i.cle] = i.valeur; });
        setConfig(map);
      }).catch(() => {});
  }, []);
  function get(cle, fallback="") { return config[cle] || fallback; }

  const [form,    setForm]    = useState({ nom:"", prenom:"", email:"", whatsapp:"", message:"" });
  const [done,    setDone]    = useState(false);
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  function set(k, v) { setForm(p => ({ ...p, [k]: v })); }

  async function envoyer(e) {
    e.preventDefault();
    if (!form.email.trim() || !form.message.trim()) { setError("L'email et le message sont requis."); return; }
    setLoading(true); setError("");
    try {
      const res = await contactAPI.envoyer(form);
      res.ok = res.status < 300;
      if (res.ok) setDone(true);
      else setError("Une erreur est survenue. Veuillez réessayer.");
    } catch { setError("Erreur réseau. Veuillez réessayer."); }
    setLoading(false);
  }

  return (
    <>
      <style>{STYLES}</style>

      {/* WhatsApp sticky */}
      <a href="https://wa.me/message/DI23LCDIMS5SF1" target="_blank" rel="noreferrer" className="wa-sticky">
        <svg viewBox="0 0 24 24" width="18" height="18" fill="#fff">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
        WhatsApp
      </a>

      <div style={{ background:"#0A0A0A", color:"#F8F5F2", minHeight:"100vh" }}>


        {/* Hero */}
        <section style={{ padding:"100px 24px 72px", textAlign:"center", background:"linear-gradient(180deg,#0A0A0A,#110d09)", position:"relative", overflow:"hidden" }}>
          <div style={{ position:"absolute", inset:0, background:"radial-gradient(ellipse 60% 50% at 50% 60%,rgba(201,169,106,.06),transparent)", pointerEvents:"none" }}/>
          <div style={{ position:"relative", maxWidth:"640px", margin:"0 auto" }}>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".3em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"16px", animation:"fadeUp .6s both" }}>Contact</p>
            <h1 style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(2rem,6vw,3.5rem)", fontWeight:700, lineHeight:1.1, marginBottom:"20px", animation:"fadeUp .7s .1s both" }}>
              {get("contact_titre", "Contactez-nous")}
            </h1>
            <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, fontSize:"1rem", color:"rgba(248,245,242,.55)", lineHeight:1.8, animation:"fadeUp .7s .2s both" }}>
              {get("contact_intro", "Nous sommes à votre écoute. Pour toute question, demande d'information ou accompagnement, contactez-nous via les moyens ci-dessous.")}
            </p>
          </div>
        </section>

        <div style={{ maxWidth:"960px", margin:"0 auto", padding:"0 24px 100px" }}>

          {/* Moyens de contact */}
          <section style={{ padding:"64px 0 0" }}>
            <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"32px" }}>
              Moyens de contact
            </p>
            <div className="contacts-grid reveal" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))", gap:"16px" }}>

              {/* WhatsApp */}
              <div className="contact-card">
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".18em", textTransform:"uppercase", color:"#25D366", marginBottom:"10px" }}>WhatsApp</p>
                <a href="https://wa.me/message/DI23LCDIMS5SF1" target="_blank" rel="noreferrer"
                  style={{ display:"inline-flex", alignItems:"center", gap:"8px", background:"#25D366", color:"#fff", fontFamily:"'Montserrat',sans-serif", fontWeight:600, fontSize:".72rem", letterSpacing:".1em", textTransform:"uppercase", padding:"10px 18px", borderRadius:"3px", textDecoration:"none" }}>
                  Ouvrir WhatsApp
                </a>
              </div>

              {/* Téléphones */}
              <div className="contact-card">
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".18em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"10px" }}>Téléphone</p>
                <a href="tel:+22901961140" style={{ display:"block", fontFamily:"'Montserrat',sans-serif", fontSize:".85rem", color:"rgba(248,245,242,.7)", textDecoration:"none", marginBottom:"6px", fontWeight:300 }}>{get("footer_tel1", "+229 01 96 11 40 93")}</a>
                <a href="tel:+22901945858" style={{ display:"block", fontFamily:"'Montserrat',sans-serif", fontSize:".85rem", color:"rgba(248,245,242,.7)", textDecoration:"none", fontWeight:300 }}>{get("footer_tel2", "+229 01 94 58 58 06")}</a>
              </div>

              {/* Emails */}
              <div className="contact-card">
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".18em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"10px" }}>Email</p>
                <a href={`mailto:${get("contact_email1", "contact@preliaapedo.com")}`} style={{ display:"block", fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"rgba(248,245,242,.7)", textDecoration:"none", marginBottom:"6px", fontWeight:300 }}>{get("contact_email1", "contact@preliaapedo.com")}</a>
                <a href={`mailto:${get("contact_email2", "whiteblackdress22@gmail.com")}`} style={{ display:"block", fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"rgba(248,245,242,.7)", textDecoration:"none", fontWeight:300 }}>{get("contact_email2", "whiteblackdress22@gmail.com")}</a>
              </div>

              {/* Réseaux */}
              <div className="contact-card">
                <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".6rem", letterSpacing:".18em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"12px" }}>Réseaux sociaux</p>
                <div style={{ display:"flex", flexWrap:"wrap", gap:"8px" }}>
                  {RESEAUX.map((r, i) => (
                    <a key={i} href={r.href} target="_blank" rel="noreferrer" className="social-link">{r.label}</a>
                  ))}
                </div>
              </div>
            </div>

            {/* Délai réponse */}
            <div className="reveal" style={{ marginTop:"20px", padding:"18px 24px", background:"rgba(201,169,106,.04)", border:"1px solid rgba(201,169,106,.1)", borderRadius:"4px" }}>
              <p style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".82rem", color:"rgba(248,245,242,.55)", fontWeight:300, lineHeight:1.7 }}>
                {get("contact_delai", "Nous répondons généralement dans un délai de 24 à 48 heures. Merci pour votre patience et votre confiance.")}
              </p>
            </div>
          </section>

          {/* Formulaire */}
          <section style={{ padding:"72px 0 0" }}>
            <div style={{ background:"rgba(255,255,255,.02)", border:"1px solid rgba(201,169,106,.12)", borderRadius:"6px", padding:"48px 40px" }}>
              <p className="reveal" style={{ fontFamily:"'Montserrat',sans-serif", fontSize:".62rem", letterSpacing:".25em", textTransform:"uppercase", color:"#C9A96A", marginBottom:"8px" }}>Formulaire</p>
              <h2 className="reveal" style={{ fontFamily:"'Playfair Display',serif", fontSize:"clamp(1.3rem,3vw,1.8rem)", fontWeight:600, marginBottom:"32px" }}>
                Envoyer un message
              </h2>

              {done ? (
                <div style={{ textAlign:"center", padding:"32px 0" }}>
                  <p style={{ fontFamily:"'Playfair Display',serif", fontSize:"1.3rem", color:"#C9A96A", marginBottom:"12px" }}>Message envoyé.</p>
                  <p style={{ fontFamily:"'Montserrat',sans-serif", fontWeight:300, color:"rgba(248,245,242,.55)", lineHeight:1.8 }}>
                    Chaque message est important pour nous. Nous vous répondrons dans les meilleurs délais.
                  </p>
                </div>
              ) : (
                <form onSubmit={envoyer}>
                  <div className="form-2col" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:"14px", marginBottom:"14px" }}>
                    <div>
                      <label className="c-label">Nom</label>
                      <input className="c-input" value={form.nom} onChange={e=>set("nom",e.target.value)} placeholder="Votre nom"/>
                    </div>
                    <div>
                      <label className="c-label">Prénom</label>
                      <input className="c-input" value={form.prenom} onChange={e=>set("prenom",e.target.value)} placeholder="Votre prénom"/>
                    </div>
                    <div>
                      <label className="c-label">Email *</label>
                      <input className="c-input" type="email" required value={form.email} onChange={e=>set("email",e.target.value)} placeholder="votre@email.com"/>
                    </div>
                    <div>
                      <label className="c-label">WhatsApp</label>
                      <input className="c-input" value={form.whatsapp} onChange={e=>set("whatsapp",e.target.value)} placeholder="+229 00 00 00 00"/>
                    </div>
                  </div>
                  <div style={{ marginBottom:"24px" }}>
                    <label className="c-label">Message *</label>
                    <textarea className="c-input" rows={5} required value={form.message} onChange={e=>set("message",e.target.value)} placeholder="Votre message..." style={{ resize:"vertical" }}/>
                  </div>

                  {error && <p style={{ background:"rgba(239,68,68,.1)", border:"1px solid rgba(239,68,68,.3)", borderRadius:"4px", padding:"10px 14px", fontSize:".78rem", color:"#f87171", marginBottom:"16px" }}>{error}</p>}

                  <button type="submit" disabled={loading}
                    style={{ width:"100%", padding:"15px", background:"#C2185B", border:"none", borderRadius:"3px", color:"#fff", fontFamily:"'Montserrat',sans-serif", fontWeight:700, fontSize:".78rem", letterSpacing:".16em", textTransform:"uppercase", cursor:loading?"not-allowed":"pointer", opacity:loading?.7:1 }}>
                    {loading ? "Envoi en cours..." : "Envoyer un message"}
                  </button>
                </form>
              )}
            </div>
          </section>

          {/* Message final */}
          <section style={{ padding:"72px 0 0", textAlign:"center" }}>
            <div className="reveal">
              <div style={{ height:"1px", background:"linear-gradient(90deg,transparent,rgba(201,169,106,.3),transparent)", marginBottom:"40px" }}/>
              <p style={{ fontFamily:"'Cormorant Garamond',serif", fontStyle:"italic", fontSize:"1.1rem", color:"rgba(248,245,242,.5)", lineHeight:1.9, maxWidth:"560px", margin:"0 auto 8px" }}>
                {get("contact_citation", "Chaque message est important pour nous. N'hésitez pas à nous écrire, nous serons ravis de vous accompagner dans votre transformation.")}
              </p>
              <p style={{ fontFamily:"'Playfair Display',serif", fontSize:".9rem", color:"#C9A96A", letterSpacing:".05em" }}>
                {get("contact_signature", "Métamorphose — Révéler la femme que vous êtes appelée à devenir.")}
              </p>
            </div>
          </section>

        </div>
      </div>
    </>
  );
}
