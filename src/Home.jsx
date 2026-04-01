import { useState, useEffect, useRef } from "react";

/* ============================================================
   MÉTA'MORPH'OSE — Page d'Accueil
   Charte : Noir #0A0A0A · Or #C9A96A · Rose #C2185B · Beige #D8C1A0
   Typo   : Playfair Display (titres) · Montserrat (corps)
   ============================================================ */

// ── Styles injectés ──────────────────────────────────────────
const GLOBAL_STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;0,700;1,400;1,600&family=Montserrat:wght@300;400;500;600&family=Cormorant+Garamond:ital,wght@1,300;1,400&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --noir: #0A0A0A;
    --noir-soft: #141414;
    --or: #C9A96A;
    --or-light: #E8D5A8;
    --rose: #C2185B;
    --rose-light: #EFC7D3;
    --beige: #D8C1A0;
    --blanc: #F8F5F2;
    --blanc-pur: #FFFFFF;
    --ff-title: 'Playfair Display', Georgia, serif;
    --ff-body: 'Montserrat', sans-serif;
    --ff-accent: 'Cormorant Garamond', Georgia, serif;
    --transition: cubic-bezier(0.4, 0, 0.2, 1);
  }

  html { scroll-behavior: smooth; }

  body {
    background: var(--noir);
    color: var(--blanc);
    font-family: var(--ff-body);
    font-weight: 300;
    line-height: 1.7;
    -webkit-font-smoothing: antialiased;
  }

  /* ── Scrollbar ── */
  ::-webkit-scrollbar { width: 4px; }
  ::-webkit-scrollbar-track { background: var(--noir); }
  ::-webkit-scrollbar-thumb { background: var(--or); border-radius: 2px; }

  /* ── Animations ── */
  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(40px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
  @keyframes shimmer {
    0%   { background-position: -200% center; }
    100% { background-position: 200% center; }
  }
  @keyframes float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-12px); }
  }
  @keyframes pulseGlow {
    0%, 100% { box-shadow: 0 0 20px rgba(194,24,91,0.3); }
    50%       { box-shadow: 0 0 50px rgba(194,24,91,0.6); }
  }
  @keyframes lineExpand {
    from { width: 0; }
    to   { width: 80px; }
  }
  @keyframes orb {
    0%, 100% { transform: scale(1) translate(0, 0); opacity: 0.15; }
    33%       { transform: scale(1.2) translate(30px, -20px); opacity: 0.25; }
    66%       { transform: scale(0.9) translate(-20px, 15px); opacity: 0.1; }
  }

  .animate-fadeUp  { animation: fadeUp 0.9s var(--transition) both; }
  .animate-fadeIn  { animation: fadeIn 0.8s ease both; }
  .delay-1 { animation-delay: 0.2s; }
  .delay-2 { animation-delay: 0.4s; }
  .delay-3 { animation-delay: 0.6s; }
  .delay-4 { animation-delay: 0.8s; }
  .delay-5 { animation-delay: 1.0s; }

  /* ── Boutons ── */
  .btn-primary {
    display: inline-flex; align-items: center; gap: 10px;
    background: var(--rose);
    color: #fff;
    font-family: var(--ff-body);
    font-weight: 600;
    font-size: 0.78rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 16px 36px;
    border: none; border-radius: 2px;
    cursor: pointer;
    transition: all 0.35s var(--transition);
    text-decoration: none;
  }
  .btn-primary:hover {
    background: #a01049;
    transform: translateY(-2px);
    box-shadow: 0 12px 40px rgba(194,24,91,0.4);
  }

  .btn-secondary {
    display: inline-flex; align-items: center; gap: 10px;
    background: transparent;
    color: var(--or);
    font-family: var(--ff-body);
    font-weight: 500;
    font-size: 0.78rem;
    letter-spacing: 0.15em;
    text-transform: uppercase;
    padding: 15px 34px;
    border: 1px solid var(--or);
    border-radius: 2px;
    cursor: pointer;
    transition: all 0.35s var(--transition);
    text-decoration: none;
  }
  .btn-secondary:hover {
    background: var(--or);
    color: var(--noir);
    transform: translateY(-2px);
  }

  /* ── Or Divider ── */
  .gold-line {
    display: block;
    height: 1px;
    background: linear-gradient(90deg, transparent, var(--or), transparent);
    margin: 60px auto;
    width: 100%;
    max-width: 600px;
    opacity: 0.4;
  }

  /* ── Section label ── */
  .section-label {
    font-family: var(--ff-body);
    font-size: 0.68rem;
    font-weight: 500;
    letter-spacing: 0.3em;
    text-transform: uppercase;
    color: var(--or);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .section-label::before {
    content: '';
    display: block;
    width: 30px; height: 1px;
    background: var(--or);
  }

  /* ── Responsive ── */
  @media (max-width: 768px) {
    .hide-mobile { display: none !important; }
  }
`;

// ── Composants internes ──────────────────────────────────────

function InjectStyles() {
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = GLOBAL_STYLES;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);
  return null;
}

function GoldOrb({ style }) {
  return (
    <div style={{
      position: "absolute",
      borderRadius: "50%",
      background: "radial-gradient(circle, rgba(201,169,106,0.3), transparent 70%)",
      animation: "orb 8s ease-in-out infinite",
      pointerEvents: "none",
      ...style
    }} />
  );
}

// ── NAVBAR ──────────────────────────────────────────────────
function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler);
    return () => window.removeEventListener("scroll", handler);
  }, []);

  const links = [
    { label: "Le Programme", href: "#programme" },
    { label: "Formules", href: "#formules" },
    { label: "Prélia", href: "#prelia" },
    { label: "Témoignages", href: "#temoignages" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      padding: scrolled ? "14px 40px" : "24px 40px",
      background: scrolled ? "rgba(10,10,10,0.96)" : "transparent",
      backdropFilter: scrolled ? "blur(20px)" : "none",
      borderBottom: scrolled ? "1px solid rgba(201,169,106,0.15)" : "none",
      display: "flex", alignItems: "center", justifyContent: "space-between",
      transition: "all 0.4s var(--transition)",
    }}>
      {/* Logo */}
      <div style={{ fontFamily: "var(--ff-title)", fontSize: "1.1rem", letterSpacing: "0.05em" }}>
        <span style={{ color: "var(--blanc)" }}>Méta'</span>
        <span style={{ color: "var(--or)" }}>Morph'</span>
        <span style={{ color: "var(--rose)" }}>Ose</span>
      </div>

      {/* Links desktop */}
      <ul className="hide-mobile" style={{
        display: "flex", gap: "36px", listStyle: "none",
        fontFamily: "var(--ff-body)", fontSize: "0.72rem",
        fontWeight: 500, letterSpacing: "0.12em", textTransform: "uppercase",
      }}>
        {links.map(l => (
          <li key={l.label}>
            <a href={l.href} style={{
              color: "rgba(248,245,242,0.7)", textDecoration: "none",
              transition: "color 0.3s",
            }}
            onMouseEnter={e => e.target.style.color = "var(--or)"}
            onMouseLeave={e => e.target.style.color = "rgba(248,245,242,0.7)"}
            >{l.label}</a>
          </li>
        ))}
      </ul>

      {/* CTA */}
      <a href="#inscription" className="btn-primary hide-mobile" style={{ padding: "12px 24px", fontSize: "0.7rem" }}>
        M'inscrire
      </a>

      {/* Burger mobile */}
      <button
        onClick={() => setMenuOpen(!menuOpen)}
        style={{
          display: "none", background: "none", border: "none", cursor: "pointer",
          color: "var(--or)", fontSize: "1.5rem",
          ["@media (maxWidth: 768px)"]: { display: "block" }
        }}
        aria-label="Menu"
      >☰</button>
    </nav>
  );
}

// ── HERO ────────────────────────────────────────────────────
function HeroSection() {
  return (
    <section style={{
      position: "relative", minHeight: "100vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center", padding: "120px 24px 80px",
      overflow: "hidden",
    }}>
      {/* Background gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: "radial-gradient(ellipse 80% 60% at 50% 30%, rgba(194,24,91,0.08) 0%, transparent 70%), radial-gradient(ellipse 60% 80% at 80% 80%, rgba(201,169,106,0.05) 0%, transparent 70%), var(--noir)",
      }} />

      {/* Orbes décoratifs */}
      <GoldOrb style={{ width: 400, height: 400, top: "10%", left: "-5%", animationDelay: "0s" }} />
      <GoldOrb style={{ width: 300, height: 300, bottom: "20%", right: "-5%", animationDelay: "3s" }} />

      {/* Ligne or horizontale top */}
      <div style={{
        position: "absolute", top: "30%", left: 0, right: 0,
        height: "1px",
        background: "linear-gradient(90deg, transparent, rgba(201,169,106,0.1), transparent)",
      }} />

      {/* Mention discrète */}
      <p className="animate-fadeIn" style={{
        position: "relative",
        fontFamily: "var(--ff-body)", fontSize: "0.68rem",
        letterSpacing: "0.25em", textTransform: "uppercase",
        color: "var(--or)", opacity: 0.8,
        marginBottom: "28px",
      }}>
        Un programme créé par Prélia Apedo · Fondatrice de White & Black
      </p>

      {/* Titre principal */}
      <h1 className="animate-fadeUp delay-1" style={{
        position: "relative",
        fontFamily: "var(--ff-title)",
        fontSize: "clamp(2.8rem, 7vw, 6rem)",
        fontWeight: 700,
        lineHeight: 1.08,
        letterSpacing: "-0.01em",
        marginBottom: "24px",
        maxWidth: "900px",
      }}>
        De l'ombre<br />
        <em style={{
          fontStyle: "italic", fontWeight: 400,
          background: "linear-gradient(135deg, var(--or), var(--or-light), var(--or))",
          backgroundSize: "200% auto",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "shimmer 4s linear infinite",
        }}>à la lumière</em>
        <span style={{ color: "var(--blanc)" }}> en 60 jours.</span>
      </h1>

      {/* Sous-titre */}
      <p className="animate-fadeUp delay-2" style={{
        position: "relative",
        fontFamily: "var(--ff-body)", fontWeight: 300,
        fontSize: "clamp(1rem, 2vw, 1.15rem)",
        lineHeight: 1.75,
        color: "rgba(248,245,242,0.65)",
        maxWidth: "640px",
        marginBottom: "48px",
      }}>
        Libérez-vous du regard des autres, révélez votre identité profonde<br className="hide-mobile" />
        et osez enfin prendre votre place avec une image <em style={{ fontFamily: "var(--ff-accent)", fontSize: "1.1em", color: "var(--rose-light)" }}>authentique, confiante et magnétique.</em>
      </p>

      {/* Boutons */}
      <div className="animate-fadeUp delay-3" style={{
        position: "relative",
        display: "flex", flexWrap: "wrap", gap: "16px",
        justifyContent: "center",
      }}>
        <a href="#inscription" className="btn-primary" style={{ animation: "pulseGlow 3s ease-in-out infinite" }}>
          <span>✦</span> Je rejoins l'aventure
        </a>
        <a href="#programme" className="btn-secondary">
          Découvrir le programme
        </a>
      </div>

      {/* Scroll indicator */}
      <div className="animate-fadeIn delay-5" style={{
        position: "absolute", bottom: "40px", left: "50%", transform: "translateX(-50%)",
        display: "flex", flexDirection: "column", alignItems: "center", gap: "8px",
      }}>
        <span style={{ fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", color: "rgba(201,169,106,0.5)" }}>Découvrir</span>
        <div style={{
          width: "1px", height: "50px",
          background: "linear-gradient(to bottom, var(--or), transparent)",
          animation: "float 2s ease-in-out infinite",
        }} />
      </div>
    </section>
  );
}

// ── SECTION PROBLÈME ─────────────────────────────────────────
function ProblemeSection() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const frictions = [
    "La peur du regard des autres",
    "Le doute et les blocages intérieurs",
    "La difficulté à vous affirmer pleinement",
    "Le sentiment de ne pas être assez",
    "Le décalage entre l'intérieur et l'extérieur",
  ];

  return (
    <section ref={ref} style={{
      padding: "120px 24px",
      background: "linear-gradient(180deg, var(--noir) 0%, #0f0a07 100%)",
      textAlign: "center",
    }}>
      <div style={{ maxWidth: "800px", margin: "0 auto" }}>
        <span className="section-label" style={{ justifyContent: "center" }}>
          Vous vous reconnaissez ?
        </span>

        <h2 style={{
          fontFamily: "var(--ff-title)",
          fontSize: "clamp(1.8rem, 4vw, 3rem)",
          fontWeight: 600,
          lineHeight: 1.2,
          marginBottom: "32px",
          opacity: visible ? 1 : 0,
          transform: visible ? "none" : "translateY(30px)",
          transition: "all 0.9s var(--transition)",
        }}>
          Et si ce qui vous freine aujourd'hui<br />
          n'était pas un manque de <em style={{ color: "var(--or)", fontStyle: "italic" }}>potentiel…</em><br />
          mais un manque d'<em style={{ color: "var(--rose)", fontStyle: "italic" }}>alignement ?</em>
        </h2>

        <p style={{
          color: "rgba(248,245,242,0.6)", fontWeight: 300,
          maxWidth: "560px", margin: "0 auto 56px",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.9s 0.3s var(--transition)",
        }}>
          Vous sentez au fond de vous que vous êtes capable de plus. Plus d'assurance. Plus d'impact. Plus de clarté. Et pourtant, quelque chose vous retient encore.
        </p>

        {/* Frictions */}
        <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "16px" }}>
          {frictions.map((f, i) => (
            <li key={i} style={{
              display: "flex", alignItems: "center", gap: "16px",
              padding: "18px 28px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(201,169,106,0.1)",
              borderLeft: "3px solid var(--rose)",
              borderRadius: "2px",
              fontFamily: "var(--ff-body)", fontWeight: 300,
              color: "rgba(248,245,242,0.8)",
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateX(-20px)",
              transition: `all 0.7s ${0.4 + i * 0.1}s var(--transition)`,
              textAlign: "left",
            }}>
              <span style={{ color: "var(--rose)", fontSize: "1.2rem", flexShrink: 0 }}>◆</span>
              {f}
            </li>
          ))}
        </ul>

        <p style={{
          marginTop: "52px",
          fontFamily: "var(--ff-accent)", fontStyle: "italic",
          fontSize: "1.4rem", fontWeight: 300,
          color: "var(--blanc)",
          lineHeight: 1.6,
          opacity: visible ? 1 : 0,
          transition: "opacity 1s 0.9s var(--transition)",
        }}>
          Vous n'avez pas besoin de devenir quelqu'un d'autre.<br />
          <span style={{ color: "var(--or)" }}>Vous avez besoin de vous reconnecter à vous-même.</span>
        </p>
      </div>
    </section>
  );
}

// ── TEST DIAGNOSTIC ──────────────────────────────────────────
function DiagnosticTest() {
  const questions = [
    "Avez-vous parfois l'impression de ne pas être pleinement vous-même à cause du regard ou du jugement des autres ?",
    "Ressentez-vous un manque de confiance en vous qui vous empêche de vous affirmer ou de prendre certaines opportunités ?",
    "Avez-vous le sentiment que votre potentiel est beaucoup plus grand que la vie que vous vivez actuellement ?",
    "Avez-vous parfois l'impression de vous être oubliée en voulant répondre aux attentes de la société ou de votre famille ?",
    "Ressentez-vous le besoin d'être accompagnée pour révéler votre confiance, votre image et votre vraie identité ?",
    "Sentez-vous au fond de vous que le moment est venu de sortir de l'ombre et de révéler la femme que vous êtes réellement ?",
  ];

  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.1 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const score = Object.values(answers).filter(v => v === "oui").length;
  const allAnswered = Object.keys(answers).length === questions.length;

  return (
    <section ref={ref} style={{
      padding: "100px 24px",
      background: "radial-gradient(ellipse at 50% 0%, rgba(194,24,91,0.07), transparent 70%), #0f0a07",
    }}>
      <div style={{ maxWidth: "760px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          textAlign: "center", marginBottom: "60px",
          opacity: visible ? 1 : 0, transition: "opacity 0.8s var(--transition)",
        }}>
          <span className="section-label" style={{ justifyContent: "center" }}>
            Test Diagnostic
          </span>
          <h2 style={{
            fontFamily: "var(--ff-title)",
            fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)",
            fontWeight: 600, marginBottom: "16px",
          }}>
            Êtes-vous prête pour votre<br />
            <em style={{ color: "var(--or)", fontStyle: "italic" }}>Méta'Morph'Ose ?</em>
          </h2>
          <p style={{ color: "rgba(248,245,242,0.55)", fontWeight: 300, maxWidth: "480px", margin: "0 auto" }}>
            Répondez honnêtement à ces 6 questions pour découvrir si vous êtes à l'étape d'une transformation profonde.
          </p>
        </div>

        {/* Questions */}
        {!showResult && (
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            {questions.map((q, i) => (
              <div key={i} style={{
                padding: "28px 32px",
                background: "rgba(255,255,255,0.025)",
                border: `1px solid ${answers[i] ? "rgba(201,169,106,0.4)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: "4px",
                transition: "all 0.4s",
                opacity: visible ? 1 : 0,
                transform: visible ? "none" : "translateY(20px)",
                transitionDelay: `${0.1 * i}s`,
              }}>
                <p style={{
                  fontFamily: "var(--ff-body)", fontWeight: 300,
                  fontSize: "0.95rem", color: "rgba(248,245,242,0.85)",
                  marginBottom: "20px", lineHeight: 1.65,
                }}>
                  <span style={{ color: "var(--or)", marginRight: "10px", fontFamily: "var(--ff-title)", fontWeight: 600 }}>{i + 1}.</span>
                  {q}
                </p>
                <div style={{ display: "flex", gap: "12px" }}>
                  {["oui", "non"].map(val => (
                    <button
                      key={val}
                      onClick={() => setAnswers(prev => ({ ...prev, [i]: val }))}
                      style={{
                        padding: "10px 28px",
                        border: `1px solid ${answers[i] === val ? (val === "oui" ? "var(--rose)" : "rgba(255,255,255,0.3)") : "rgba(255,255,255,0.12)"}`,
                        borderRadius: "2px",
                        background: answers[i] === val ? (val === "oui" ? "var(--rose)" : "rgba(255,255,255,0.08)") : "transparent",
                        color: answers[i] === val ? "#fff" : "rgba(248,245,242,0.5)",
                        fontFamily: "var(--ff-body)", fontWeight: 500,
                        fontSize: "0.75rem", letterSpacing: "0.12em",
                        textTransform: "uppercase", cursor: "pointer",
                        transition: "all 0.3s",
                      }}
                    >
                      {val === "oui" ? "✓ Oui" : "Non"}
                    </button>
                  ))}
                </div>
              </div>
            ))}

            {/* Bouton voir résultat */}
            {allAnswered && (
              <div style={{ textAlign: "center", marginTop: "20px", animation: "fadeUp 0.6s both" }}>
                <button className="btn-primary" onClick={() => setShowResult(true)} style={{ fontSize: "0.8rem" }}>
                  Voir mon résultat →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Résultat */}
        {showResult && (
          <div style={{
            textAlign: "center", padding: "60px 40px",
            background: score >= 4
              ? "radial-gradient(ellipse at center, rgba(194,24,91,0.12), transparent 70%), rgba(255,255,255,0.03)"
              : "rgba(255,255,255,0.03)",
            border: `1px solid ${score >= 4 ? "rgba(194,24,91,0.3)" : "rgba(201,169,106,0.15)"}`,
            borderRadius: "4px",
            animation: "fadeUp 0.7s both",
          }}>
            {/* Score */}
            <div style={{
              width: "80px", height: "80px", borderRadius: "50%",
              background: score >= 4 ? "var(--rose)" : "var(--or)",
              display: "flex", alignItems: "center", justifyContent: "center",
              margin: "0 auto 28px",
              fontFamily: "var(--ff-title)", fontSize: "1.8rem", fontWeight: 700, color: "#fff",
              boxShadow: score >= 4 ? "0 0 40px rgba(194,24,91,0.4)" : "0 0 40px rgba(201,169,106,0.3)",
            }}>
              {score}/6
            </div>

            {score >= 4 ? (
              <>
                <h3 style={{ fontFamily: "var(--ff-title)", fontSize: "1.8rem", marginBottom: "20px" }}>
                  Votre transformation<br />
                  <em style={{ color: "var(--or)", fontStyle: "italic" }}>est nécessaire.</em>
                </h3>
                <p style={{ color: "rgba(248,245,242,0.7)", maxWidth: "500px", margin: "0 auto 36px", lineHeight: 1.75 }}>
                  Il est très probable que vous soyez exactement à l'étape où une transformation profonde vous attend. Le programme Méta'Morph'Ose a été conçu pour accompagner les femmes qui ressentent cet appel intérieur.
                </p>
                <p style={{ fontFamily: "var(--ff-accent)", fontStyle: "italic", color: "var(--or)", marginBottom: "36px", fontSize: "1.1rem" }}>
                  La transformation commence toujours par une prise de conscience.<br />Et la vôtre pourrait commencer aujourd'hui.
                </p>
                <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
                  <a href="#inscription" className="btn-primary">Je commence ma Méta'Morph'Ose</a>
                  <a href="#formules" className="btn-secondary">Voir les formules & coûts</a>
                </div>
              </>
            ) : (
              <>
                <h3 style={{ fontFamily: "var(--ff-title)", fontSize: "1.6rem", marginBottom: "16px" }}>
                  Vous êtes déjà sur votre chemin.
                </h3>
                <p style={{ color: "rgba(248,245,242,0.65)", maxWidth: "480px", margin: "0 auto 32px" }}>
                  Même si le moment n'est peut-être pas encore là, n'hésitez pas à découvrir le programme pour mieux le connaître.
                </p>
                <a href="#programme" className="btn-secondary">Découvrir le programme</a>
              </>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

// ── LES 3 PILIERS ────────────────────────────────────────────
function PillarsSection() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const pillars = [
    {
      code: "MÉTA",
      title: "Transformation intérieure",
      desc: "Revenir à la source de soi. Identifier les peurs, les croyances limitantes, les blessures invisibles et le poids du regard des autres pour amorcer une guérison profonde.",
      weeks: "Semaines 1 — 2",
      color: "var(--rose)",
      icon: "◈",
      bg: "rgba(194,24,91,0.06)",
    },
    {
      code: "MORPH",
      title: "Image & identité révélées",
      desc: "Redéfinir son image, son style, sa posture et son expression personnelle pour que l'extérieur reflète enfin la richesse de l'intérieur.",
      weeks: "Semaines 3 — 5",
      color: "var(--or)",
      icon: "◇",
      bg: "rgba(201,169,106,0.06)",
    },
    {
      code: "OSE",
      title: "Passage à l'action",
      desc: "Apprendre à s'affirmer, prendre sa place, développer son leadership personnel et poser des actions concrètes vers ses rêves et ambitions.",
      weeks: "Semaines 6 — 8",
      color: "#B8D4E8",
      icon: "◉",
      bg: "rgba(184,212,232,0.05)",
    },
  ];

  return (
    <section id="programme" ref={ref} style={{ padding: "120px 24px", background: "var(--noir)" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Header */}
        <div style={{
          textAlign: "center", marginBottom: "72px",
          opacity: visible ? 1 : 0, transition: "opacity 0.8s var(--transition)",
        }}>
          <span className="section-label" style={{ justifyContent: "center" }}>La Méthode</span>
          <h2 style={{
            fontFamily: "var(--ff-title)",
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 600, marginBottom: "16px",
          }}>
            Une méthode puissante en 3 étapes<br />
            <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--or)" }}>pour vous transformer en profondeur.</em>
          </h2>
          <p style={{ color: "rgba(248,245,242,0.5)", fontWeight: 300, maxWidth: "520px", margin: "0 auto" }}>
            Un programme immersif de 8 semaines conçu pour une transformation complète, profonde et durable.
          </p>
        </div>

        {/* Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "24px",
        }}>
          {pillars.map((p, i) => (
            <div key={i} style={{
              padding: "44px 36px",
              background: p.bg,
              border: `1px solid ${p.color}22`,
              borderTop: `3px solid ${p.color}`,
              borderRadius: "4px",
              position: "relative",
              overflow: "hidden",
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(40px)",
              transition: `all 0.8s ${0.15 * i}s var(--transition)`,
            }}>
              {/* Code en filigrane */}
              <div style={{
                position: "absolute", top: "-10px", right: "20px",
                fontFamily: "var(--ff-title)", fontSize: "5rem", fontWeight: 700,
                color: p.color, opacity: 0.04, lineHeight: 1, pointerEvents: "none",
                letterSpacing: "-0.02em",
              }}>
                {p.code}
              </div>

              <div style={{ fontSize: "1.8rem", marginBottom: "20px", color: p.color }}>{p.icon}</div>

              <div style={{
                fontFamily: "var(--ff-body)", fontSize: "0.65rem",
                fontWeight: 600, letterSpacing: "0.3em", textTransform: "uppercase",
                color: p.color, marginBottom: "8px",
              }}>
                {p.code} · {p.weeks}
              </div>

              <h3 style={{
                fontFamily: "var(--ff-title)", fontSize: "1.35rem",
                fontWeight: 600, marginBottom: "16px", lineHeight: 1.25,
              }}>
                {p.title}
              </h3>

              <p style={{
                fontFamily: "var(--ff-body)", fontWeight: 300,
                fontSize: "0.9rem", color: "rgba(248,245,242,0.65)",
                lineHeight: 1.75,
              }}>
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── AVANT / APRÈS ─────────────────────────────────────────────
function BeforeAfterSection() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const transformations = [
    { avant: "Peur de vous montrer", apres: "Audace et confiance rayonnante" },
    { avant: "Blocages et doutes intérieurs", apres: "Clarté sur qui vous êtes vraiment" },
    { avant: "Culpabilité, poids du jugement", apres: "Liberté d'être pleinement vous-même" },
    { avant: "Image floue ou incohérente", apres: "Image alignée, affirmée et authentique" },
    { avant: "Hésitation, procrastination", apres: "Décisions concrètes et passage à l'action" },
  ];

  return (
    <section ref={ref} style={{
      padding: "120px 24px",
      background: "linear-gradient(180deg, var(--noir) 0%, #0f0a07 50%, var(--noir) 100%)",
    }}>
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
        <div style={{
          textAlign: "center", marginBottom: "72px",
          opacity: visible ? 1 : 0, transition: "opacity 0.8s",
        }}>
          <span className="section-label" style={{ justifyContent: "center" }}>La Transformation</span>
          <h2 style={{
            fontFamily: "var(--ff-title)", fontSize: "clamp(1.8rem, 4vw, 2.8rem)", fontWeight: 600,
          }}>
            En 8 semaines, passez<br />
            <em style={{ color: "var(--rose)", fontStyle: "italic" }}>de la peur à la puissance.</em>
          </h2>
        </div>

        {/* En-tête colonnes */}
        <div style={{
          display: "grid", gridTemplateColumns: "1fr 40px 1fr",
          gap: "0", marginBottom: "16px", textAlign: "center",
        }}>
          <div style={{
            fontFamily: "var(--ff-body)", fontSize: "0.65rem",
            letterSpacing: "0.25em", textTransform: "uppercase",
            color: "rgba(248,245,242,0.35)", paddingBottom: "8px",
            borderBottom: "1px solid rgba(255,255,255,0.06)",
          }}>Avant</div>
          <div />
          <div style={{
            fontFamily: "var(--ff-body)", fontSize: "0.65rem",
            letterSpacing: "0.25em", textTransform: "uppercase",
            color: "var(--or)", paddingBottom: "8px",
            borderBottom: "1px solid rgba(201,169,106,0.2)",
          }}>Après ✦</div>
        </div>

        {transformations.map((t, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "1fr 40px 1fr",
            alignItems: "center", gap: "0",
            padding: "20px 0",
            borderBottom: "1px solid rgba(255,255,255,0.04)",
            opacity: visible ? 1 : 0,
            transform: visible ? "none" : "translateX(-20px)",
            transition: `all 0.7s ${0.1 * i}s var(--transition)`,
          }}>
            <div style={{
              padding: "16px 20px",
              background: "rgba(255,255,255,0.02)",
              borderRadius: "2px",
              fontFamily: "var(--ff-body)", fontSize: "0.9rem",
              color: "rgba(248,245,242,0.45)", fontWeight: 300,
              fontStyle: "italic",
            }}>
              {t.avant}
            </div>
            <div style={{ textAlign: "center", color: "var(--or)", fontSize: "1rem" }}>→</div>
            <div style={{
              padding: "16px 20px",
              background: "rgba(201,169,106,0.04)",
              border: "1px solid rgba(201,169,106,0.12)",
              borderRadius: "2px",
              fontFamily: "var(--ff-body)", fontSize: "0.9rem",
              color: "rgba(248,245,242,0.88)", fontWeight: 400,
            }}>
              ✦ {t.apres}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── POUR QUI ──────────────────────────────────────────────────
function PourQuiSection() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const oui = [
    "Vous voulez enfin dépasser la peur du regard des autres",
    "Vous sentez qu'il est temps de vous redécouvrir",
    "Vous voulez renforcer votre confiance et votre estime de vous",
    "Vous souhaitez aligner votre image avec la femme que vous êtes réellement",
    "Vous cherchez un cadre structuré, humain et bienveillant",
    "Vous êtes prête à vivre une vraie transformation, intérieure et extérieure",
  ];

  return (
    <section ref={ref} style={{ padding: "120px 24px", background: "var(--noir)" }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "48px", alignItems: "start" }}>
        {/* Oui */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(30px)",
          transition: "all 0.8s var(--transition)",
        }}>
          <span className="section-label">Ce programme est pour vous si…</span>
          <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: "14px", marginTop: "28px" }}>
            {oui.map((item, i) => (
              <li key={i} style={{
                display: "flex", gap: "14px", alignItems: "flex-start",
                fontFamily: "var(--ff-body)", fontSize: "0.9rem",
                color: "rgba(248,245,242,0.8)", fontWeight: 300, lineHeight: 1.6,
              }}>
                <span style={{ color: "var(--or)", marginTop: "2px", flexShrink: 0 }}>✦</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Non */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(30px)",
          transition: "all 0.8s 0.2s var(--transition)",
        }}>
          <div style={{
            padding: "40px 36px",
            background: "rgba(255,255,255,0.02)",
            border: "1px solid rgba(255,255,255,0.06)",
            borderRadius: "4px",
          }}>
            <span style={{
              fontFamily: "var(--ff-body)", fontSize: "0.65rem",
              letterSpacing: "0.25em", textTransform: "uppercase",
              color: "rgba(248,245,242,0.35)", display: "block", marginBottom: "20px",
            }}>
              Ce programme n'est pas pour vous si…
            </span>
            <p style={{
              fontFamily: "var(--ff-body)", fontSize: "0.9rem",
              color: "rgba(248,245,242,0.5)", fontWeight: 300, lineHeight: 1.75,
            }}>
              Vous cherchez une solution miracle sans implication, si vous refusez tout travail intérieur ou si vous n'êtes pas prête à sortir de votre zone de confort.
            </p>
          </div>

          {/* Inclus */}
          <div style={{
            marginTop: "24px", padding: "40px 36px",
            background: "rgba(201,169,106,0.04)",
            border: "1px solid rgba(201,169,106,0.15)",
            borderRadius: "4px",
          }}>
            <span style={{
              fontFamily: "var(--ff-body)", fontSize: "0.65rem",
              letterSpacing: "0.25em", textTransform: "uppercase",
              color: "var(--or)", display: "block", marginBottom: "20px",
            }}>
              Inclus dans le programme
            </span>
            {[
              "Lives interactifs hebdomadaires",
              "Exercices pratiques personnalisés",
              "Replays pour progresser à votre rythme",
              "Communauté privée de femmes",
              "7 guides PDF bonus exclusifs",
              "Club des Métamorphosées à vie",
            ].map((item, i) => (
              <div key={i} style={{
                display: "flex", gap: "12px",
                fontFamily: "var(--ff-body)", fontSize: "0.88rem",
                color: "rgba(248,245,242,0.75)", fontWeight: 300,
                marginBottom: "10px",
              }}>
                <span style={{ color: "var(--rose)", flexShrink: 0 }}>◆</span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ── À PROPOS DE PRÉLIA ────────────────────────────────────────
function PreliaSection() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.15 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  return (
    <section id="prelia" ref={ref} style={{
      padding: "120px 24px",
      background: "linear-gradient(135deg, #0f0a07 0%, var(--noir) 60%)",
    }}>
      <div style={{
        maxWidth: "960px", margin: "0 auto",
        display: "grid", gridTemplateColumns: "380px 1fr",
        gap: "72px", alignItems: "center",
      }}>
        {/* Photo placeholder élégant */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? "none" : "translateX(-30px)",
          transition: "all 0.9s var(--transition)",
        }}>
          <div style={{
            position: "relative",
            paddingBottom: "130%",
            background: "linear-gradient(135deg, rgba(194,24,91,0.1), rgba(201,169,106,0.08))",
            border: "1px solid rgba(201,169,106,0.15)",
            borderRadius: "4px",
            overflow: "hidden",
          }}>
            {/* Placeholder portrait */}
            <div style={{
              position: "absolute", inset: 0,
              display: "flex", flexDirection: "column",
              alignItems: "center", justifyContent: "center",
              gap: "16px",
            }}>
              <div style={{ fontSize: "4rem", opacity: 0.3 }}>✦</div>
              <p style={{
                fontFamily: "var(--ff-body)", fontSize: "0.7rem",
                letterSpacing: "0.2em", textTransform: "uppercase",
                color: "rgba(201,169,106,0.4)",
              }}>Photo de Prélia</p>
            </div>
            {/* Cadre or */}
            <div style={{
              position: "absolute", inset: "12px",
              border: "1px solid rgba(201,169,106,0.1)",
              borderRadius: "2px", pointerEvents: "none",
            }} />
          </div>

          {/* Signature */}
          <div style={{
            marginTop: "24px", textAlign: "center",
            fontFamily: "var(--ff-accent)", fontStyle: "italic",
            fontSize: "1.1rem", color: "var(--or)", opacity: 0.8,
          }}>
            Prélia Apedo
          </div>
          <div style={{
            textAlign: "center",
            fontFamily: "var(--ff-body)", fontSize: "0.65rem",
            letterSpacing: "0.15em", textTransform: "uppercase",
            color: "rgba(248,245,242,0.3)", marginTop: "4px",
          }}>
            Fondatrice · White & Black · Méta'Morph'Ose
          </div>
        </div>

        {/* Contenu */}
        <div style={{
          opacity: visible ? 1 : 0, transform: visible ? "none" : "translateX(30px)",
          transition: "all 0.9s 0.2s var(--transition)",
        }}>
          <span className="section-label">La Fondatrice</span>

          <h2 style={{
            fontFamily: "var(--ff-title)", fontSize: "clamp(1.6rem, 3vw, 2.4rem)",
            fontWeight: 600, lineHeight: 1.2, marginBottom: "28px",
          }}>
            Derrière Méta'Morph'Ose,<br />
            <em style={{ color: "var(--or)", fontStyle: "italic" }}>une femme engagée</em><br />
            à révéler l'essence des femmes.
          </h2>

          <blockquote style={{
            fontFamily: "var(--ff-accent)", fontStyle: "italic",
            fontSize: "1.2rem", color: "var(--rose-light)",
            borderLeft: "2px solid var(--rose)",
            paddingLeft: "24px", marginBottom: "28px",
            lineHeight: 1.6,
          }}>
            « Je sais ce que cela fait de se sentir invisible. »
          </blockquote>

          <p style={{
            fontFamily: "var(--ff-body)", fontWeight: 300, fontSize: "0.92rem",
            color: "rgba(248,245,242,0.65)", lineHeight: 1.8, marginBottom: "20px",
          }}>
            Pendant longtemps, je n'ai pas été la femme confiante que vous voyez aujourd'hui. J'ai grandi avec des blessures profondes, des doutes constants et un manque d'estime de moi. Je me faisais petite. Je restais en retrait. Je vivais avec cette sensation permanente de ne pas être assez.
          </p>

          <p style={{
            fontFamily: "var(--ff-body)", fontWeight: 300, fontSize: "0.92rem",
            color: "rgba(248,245,242,0.65)", lineHeight: 1.8, marginBottom: "36px",
          }}>
            Puis un concours de beauté a tout changé. Pour la première fois, j'ai compris que parfois les autres voient en nous ce que nous ne sommes pas encore capables de voir nous-mêmes. Ce jour-là, quelque chose s'est allumé en moi.
          </p>

          {/* Certifications */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: "10px", marginBottom: "36px",
          }}>
            {["Conseil Coach en Image", "Styliste certifiée", "Leader Oratrice — Académie Internationale du Leadership"].map((cert, i) => (
              <span key={i} style={{
                padding: "7px 14px",
                border: "1px solid rgba(201,169,106,0.25)",
                borderRadius: "100px",
                fontFamily: "var(--ff-body)", fontSize: "0.7rem",
                color: "rgba(201,169,106,0.8)", fontWeight: 500,
              }}>
                {cert}
              </span>
            ))}
          </div>

          <div style={{ display: "flex", gap: "14px", flexWrap: "wrap" }}>
            <a href="#inscription" className="btn-primary">Découvrir le Programme</a>
            <a href="/a-propos" className="btn-secondary">Mon histoire complète</a>
          </div>
        </div>
      </div>
    </section>
  );
}

// ── VALEURS ───────────────────────────────────────────────────
function ValeursSection() {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold: 0.2 });
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, []);

  const valeurs = [
    { titre: "Authenticité", desc: "Être soi-même pleinement, sans compromis", icon: "◈" },
    { titre: "Bienveillance", desc: "Évoluer dans un espace sûr, sans jugement", icon: "◇" },
    { titre: "Excellence", desc: "Vivre une expérience structurée et transformatrice", icon: "◆" },
    { titre: "Empowerment", desc: "Reprendre le pouvoir sur sa vie et ses choix", icon: "◉" },
    { titre: "Spiritualité", desc: "Nourrir une transformation profonde et alignée", icon: "✦" },
    { titre: "Transformation holistique", desc: "Agir sur l'intérieur, l'extérieur et l'action", icon: "◎" },
  ];

  return (
    <section ref={ref} style={{
      padding: "100px 24px",
      background: "radial-gradient(ellipse at 50% 100%, rgba(201,169,106,0.06), transparent 70%), var(--noir)",
    }}>
      <div style={{ maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "64px", opacity: visible ? 1 : 0, transition: "opacity 0.8s" }}>
          <span className="section-label" style={{ justifyContent: "center" }}>ADN du Programme</span>
          <h2 style={{ fontFamily: "var(--ff-title)", fontSize: "clamp(1.6rem, 3.5vw, 2.5rem)", fontWeight: 600 }}>
            Une transformation portée<br />
            <em style={{ color: "var(--or)", fontStyle: "italic" }}>par des valeurs fortes.</em>
          </h2>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "20px" }}>
          {valeurs.map((v, i) => (
            <div key={i} style={{
              padding: "32px 28px",
              background: "rgba(255,255,255,0.02)",
              border: "1px solid rgba(255,255,255,0.05)",
              borderRadius: "4px",
              transition: "all 0.4s var(--transition)",
              opacity: visible ? 1 : 0,
              transform: visible ? "none" : "translateY(20px)",
              transitionDelay: `${0.08 * i}s`,
              cursor: "default",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = "rgba(201,169,106,0.2)";
              e.currentTarget.style.background = "rgba(201,169,106,0.04)";
              e.currentTarget.style.transform = "translateY(-4px)";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = "rgba(255,255,255,0.05)";
              e.currentTarget.style.background = "rgba(255,255,255,0.02)";
              e.currentTarget.style.transform = "none";
            }}>
              <div style={{ fontSize: "1.5rem", color: "var(--or)", marginBottom: "14px" }}>{v.icon}</div>
              <h3 style={{ fontFamily: "var(--ff-title)", fontSize: "1.05rem", fontWeight: 600, marginBottom: "8px" }}>{v.titre}</h3>
              <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: "rgba(248,245,242,0.5)", fontWeight: 300 }}>{v.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── FAQ COURTE ────────────────────────────────────────────────
function FAQSection() {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    { q: "À qui s'adresse Méta'Morph'Ose ?", a: "Le programme s'adresse aux femmes qui veulent se libérer du regard des autres, renforcer leur confiance, aligner leur image avec leur identité et passer à l'action avec plus d'assurance." },
    { q: "Comment se déroule l'accompagnement ?", a: "Le programme se déroule sur 8 semaines avec un accompagnement structuré, des sessions en direct, des exercices pratiques, des replays et une dynamique de communauté." },
    { q: "Est-ce fait pour moi si je manque déjà de confiance ?", a: "Oui. Méta'Morph'Ose a justement été pensé pour accompagner les femmes qui doutent encore d'elles-mêmes mais sentent qu'il est temps de se révéler." },
    { q: "Vais-je seulement travailler mon image ?", a: "Non. Le programme va bien au-delà de l'apparence. Il relie transformation intérieure, image personnelle et passage à l'action concret." },
  ];

  return (
    <section id="faq" style={{ padding: "100px 24px", background: "var(--noir)" }}>
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "56px" }}>
          <span className="section-label" style={{ justifyContent: "center" }}>FAQ</span>
          <h2 style={{ fontFamily: "var(--ff-title)", fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 600 }}>
            Vous vous posez<br />
            <em style={{ color: "var(--or)", fontStyle: "italic" }}>peut-être ces questions…</em>
          </h2>
        </div>

        {faqs.map((f, i) => (
          <div key={i} style={{
            borderBottom: "1px solid rgba(255,255,255,0.06)",
            marginBottom: "4px",
          }}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              style={{
                width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center",
                padding: "22px 0", background: "none", border: "none", cursor: "pointer",
                textAlign: "left",
              }}
            >
              <span style={{
                fontFamily: "var(--ff-body)", fontSize: "0.95rem",
                fontWeight: 500, color: openIndex === i ? "var(--or)" : "rgba(248,245,242,0.85)",
                transition: "color 0.3s",
              }}>
                {f.q}
              </span>
              <span style={{
                color: "var(--or)", fontSize: "1.2rem",
                transform: openIndex === i ? "rotate(45deg)" : "none",
                transition: "transform 0.35s var(--transition)",
                flexShrink: 0, marginLeft: "16px",
              }}>+</span>
            </button>
            <div style={{
              overflow: "hidden", maxHeight: openIndex === i ? "300px" : "0",
              transition: "max-height 0.45s var(--transition)",
            }}>
              <p style={{
                fontFamily: "var(--ff-body)", fontWeight: 300, fontSize: "0.9rem",
                color: "rgba(248,245,242,0.6)", lineHeight: 1.75,
                paddingBottom: "20px",
              }}>
                {f.a}
              </p>
            </div>
          </div>
        ))}

        <div style={{ textAlign: "center", marginTop: "48px" }}>
          <a href="/faq" className="btn-secondary">Voir toutes les questions</a>
        </div>
      </div>
    </section>
  );
}

// ── CTA FINAL ─────────────────────────────────────────────────
function CTAFinal() {
  return (
    <section id="inscription" style={{
      padding: "140px 24px",
      position: "relative", overflow: "hidden",
      background: "linear-gradient(135deg, #0f0507 0%, #0A0A0A 40%, #0a050a 100%)",
      textAlign: "center",
    }}>
      {/* Fond rose très subtil */}
      <div style={{
        position: "absolute", top: "50%", left: "50%",
        transform: "translate(-50%, -50%)",
        width: "700px", height: "400px",
        background: "radial-gradient(ellipse, rgba(194,24,91,0.12), transparent 70%)",
        pointerEvents: "none",
      }} />

      {/* Ligne déco top */}
      <div style={{
        position: "absolute", top: 0, left: "50%", transform: "translateX(-50%)",
        width: "1px", height: "60px",
        background: "linear-gradient(to bottom, transparent, var(--or))",
      }} />

      <div style={{ position: "relative", maxWidth: "680px", margin: "0 auto" }}>
        <div style={{
          fontFamily: "var(--ff-body)", fontSize: "0.65rem",
          letterSpacing: "0.3em", textTransform: "uppercase",
          color: "var(--or)", marginBottom: "24px",
        }}>
          ✦ Votre renaissance commence ici ✦
        </div>

        <h2 style={{
          fontFamily: "var(--ff-title)", fontSize: "clamp(2rem, 5vw, 3.5rem)",
          fontWeight: 700, lineHeight: 1.1, marginBottom: "28px",
        }}>
          Et si votre transformation<br />
          <em style={{ fontStyle: "italic", fontWeight: 400, color: "var(--or)" }}>commençait aujourd'hui ?</em>
        </h2>

        <p style={{
          fontFamily: "var(--ff-accent)", fontStyle: "italic",
          fontSize: "1.2rem", color: "rgba(248,245,242,0.65)",
          lineHeight: 1.7, marginBottom: "48px",
        }}>
          Vous n'avez pas besoin de devenir une autre femme.<br />
          Vous avez simplement besoin de révéler celle que vous êtes déjà.
        </p>

        {/* Badges */}
        <div style={{
          display: "flex", justifyContent: "center", gap: "32px",
          flexWrap: "wrap", marginBottom: "52px",
        }}>
          {["La femme confiante", "La femme alignée", "La femme libre", "La femme qui ose"].map((badge, i) => (
            <div key={i} style={{
              fontFamily: "var(--ff-body)", fontSize: "0.78rem",
              color: "rgba(248,245,242,0.55)", fontWeight: 300,
              display: "flex", alignItems: "center", gap: "8px",
            }}>
              <span style={{ color: "var(--rose)", fontSize: "0.6rem" }}>◆</span>
              {badge}
            </div>
          ))}
        </div>

        <div style={{ display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
          <a href="/contact" className="btn-primary" style={{
            padding: "20px 44px", fontSize: "0.82rem",
            animation: "pulseGlow 3s ease-in-out infinite",
          }}>
            Je rejoins Méta'Morph'Ose
          </a>
          <a href="/programme" className="btn-secondary" style={{ padding: "19px 36px", fontSize: "0.82rem" }}>
            Découvrir Méta'Morph'Ose
          </a>
        </div>

        <p style={{
          marginTop: "32px",
          fontFamily: "var(--ff-body)", fontSize: "0.72rem",
          color: "rgba(248,245,242,0.25)", letterSpacing: "0.08em",
        }}>
          Votre renaissance commence ici.
        </p>
      </div>
    </section>
  );
}

// ── FOOTER ────────────────────────────────────────────────────
function Footer() {
  return (
    <footer style={{
      padding: "60px 24px 40px",
      background: "#070707",
      borderTop: "1px solid rgba(201,169,106,0.1)",
    }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "48px", marginBottom: "48px" }}>
          {/* Brand */}
          <div>
            <div style={{ fontFamily: "var(--ff-title)", fontSize: "1.2rem", marginBottom: "16px" }}>
              <span style={{ color: "var(--blanc)" }}>Méta'</span>
              <span style={{ color: "var(--or)" }}>Morph'</span>
              <span style={{ color: "var(--rose)" }}>Ose</span>
            </div>
            <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: "rgba(248,245,242,0.4)", fontWeight: 300, lineHeight: 1.7 }}>
              De l'ombre à la lumière en 60 jours.<br />Un programme de transformation féminine créé par Prélia Apedo.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--or)", marginBottom: "20px" }}>Navigation</p>
            {["Le Programme", "Coût & Formules", "À Propos", "Témoignages", "FAQ", "Contact"].map(l => (
              <div key={l} style={{ marginBottom: "10px" }}>
                <a href="#" style={{ fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: "rgba(248,245,242,0.4)", textDecoration: "none", fontWeight: 300, transition: "color 0.3s" }}
                  onMouseEnter={e => e.target.style.color = "var(--blanc)"}
                  onMouseLeave={e => e.target.style.color = "rgba(248,245,242,0.4)"}>
                  {l}
                </a>
              </div>
            ))}
          </div>

          {/* Contact */}
          <div>
            <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.65rem", letterSpacing: "0.25em", textTransform: "uppercase", color: "var(--or)", marginBottom: "20px" }}>Contact</p>
            {[
              { icon: "✉", text: "whiteblackdress22@gmail.com" },
              { icon: "📱", text: "+229 01 96 11 40 93" },
              { icon: "📱", text: "+229 01 59 37 65 60" },
            ].map((c, i) => (
              <div key={i} style={{ display: "flex", gap: "12px", marginBottom: "12px", fontFamily: "var(--ff-body)", fontSize: "0.85rem", color: "rgba(248,245,242,0.4)", fontWeight: 300 }}>
                <span>{c.icon}</span>{c.text}
              </div>
            ))}
          </div>
        </div>

        <div style={{
          borderTop: "1px solid rgba(255,255,255,0.04)",
          paddingTop: "28px",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          flexWrap: "wrap", gap: "12px",
        }}>
          <p style={{ fontFamily: "var(--ff-body)", fontSize: "0.72rem", color: "rgba(248,245,242,0.2)", fontWeight: 300 }}>
            © 2025 Méta'Morph'Ose · White & Black · Prélia Apedo. Tous droits réservés.
          </p>
          <p style={{ fontFamily: "var(--ff-accent)", fontStyle: "italic", fontSize: "0.85rem", color: "rgba(201,169,106,0.3)" }}>
            Je ne crée pas des apparences. Je révèle des essences.
          </p>
        </div>
      </div>
    </footer>
  );
}

// ── PAGE D'ACCUEIL ─────────────────────────────────────────────
export default function Home() {
  return (
    <>
      <InjectStyles />
      <Navbar />
      <main>
        <HeroSection />
        <ProblemeSection />
        <DiagnosticTest />
        <PillarsSection />
        <BeforeAfterSection />
        <PourQuiSection />
        <PreliaSection />
        <ValeursSection />
        {/* Section témoignages — placeholder en attente du contenu */}
        <section id="temoignages" style={{ padding: "100px 24px", background: "var(--noir)", textAlign: "center" }}>
          <div style={{ maxWidth: "700px", margin: "0 auto" }}>
            <span className="section-label" style={{ justifyContent: "center" }}>Témoignages</span>
            <h2 style={{ fontFamily: "var(--ff-title)", fontSize: "clamp(1.6rem, 3.5vw, 2.4rem)", fontWeight: 600, marginBottom: "24px" }}>
              Elles ont osé.<br />
              <em style={{ color: "var(--or)", fontStyle: "italic" }}>Leur transformation parle d'elle-même.</em>
            </h2>
            <p style={{ color: "rgba(248,245,242,0.4)", fontStyle: "italic", fontFamily: "var(--ff-accent)", fontSize: "1rem" }}>
              Les témoignages vidéo et écrits seront intégrés prochainement.
            </p>
          </div>
        </section>
        <FAQSection />
        <CTAFinal />
      </main>
      <Footer />
    </>
  );
}
