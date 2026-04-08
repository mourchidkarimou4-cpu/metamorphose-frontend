import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error('ErrorBoundary:', error, info)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <div style={{
        minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center",
        flexDirection:"column", gap:"24px", padding:"40px 24px", textAlign:"center",
        background:"#0A0A0A"
      }}>
        <p style={{
          fontFamily:"'Montserrat',sans-serif", fontSize:".6rem",
          letterSpacing:".28em", textTransform:"uppercase", color:"rgba(201,169,106,.5)"
        }}>
          Une erreur est survenue
        </p>
        <h1 style={{
          fontFamily:"Georgia,serif", fontStyle:"italic",
          fontSize:"2rem", fontWeight:400, color:"#F8F5F2"
        }}>
          Quelque chose s'est mal passé
        </h1>
        <p style={{
          fontFamily:"'Montserrat',sans-serif", fontWeight:300,
          fontSize:".85rem", color:"rgba(248,245,242,.4)", maxWidth:"420px", lineHeight:1.8
        }}>
          Veuillez rafraîchir la page ou revenir à l'accueil.
        </p>
        <div style={{ display:"flex", gap:"16px", flexWrap:"wrap", justifyContent:"center" }}>
          <button
            onClick={() => window.location.reload()}
            style={{
              fontFamily:"'Montserrat',sans-serif", fontSize:".68rem",
              letterSpacing:".16em", textTransform:"uppercase", fontWeight:500,
              background:"#C2185B", color:"#fff", border:"none",
              padding:"14px 32px", cursor:"pointer", borderRadius:"2px"
            }}
          >
            Rafraichir
          </button>
          <a href="/" style={{
            fontFamily:"'Montserrat',sans-serif", fontSize:".68rem",
            letterSpacing:".16em", textTransform:"uppercase", fontWeight:500,
            background:"none", color:"rgba(201,169,106,.7)",
            border:"1px solid rgba(201,169,106,.3)",
            padding:"14px 32px", textDecoration:"none", borderRadius:"2px"
          }}>
            Retour accueil
          </a>
        </div>
      </div>
    )
  }
}
