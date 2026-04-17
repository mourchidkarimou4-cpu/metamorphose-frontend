import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Logout() {
  const navigate = useNavigate()

  useEffect(() => {
    localStorage.removeItem('mmorphose_token')
    localStorage.removeItem('mmorphose_refresh')
    localStorage.removeItem('mmorphose_user')
    navigate('/espace-membre', { replace: true })
  }, [])

  return (
    <div style={{
      background: '#0A0A0A', minHeight: '100vh',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#F8F5F2', fontFamily: "'Montserrat', sans-serif",
      fontSize: '.85rem', color: 'rgba(248,245,242,.4)'
    }}>
      Déconnexion...
    </div>
  )
}
