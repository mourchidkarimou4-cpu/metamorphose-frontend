import { createContext, useContext, useState, useEffect } from 'react'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('mmorphose_token'))
  const [user,  setUser]  = useState(() => {
    try { return JSON.parse(localStorage.getItem('mmorphose_user') || 'null') }
    catch { return null }
  })

  function login(tokenVal, userVal) {
    localStorage.setItem('mmorphose_token', tokenVal)
    localStorage.setItem('mmorphose_user', JSON.stringify(userVal))
    setToken(tokenVal)
    setUser(userVal)
  }

  function logout() {
    localStorage.removeItem('mmorphose_token')
    localStorage.removeItem('mmorphose_user')
    setToken(null)
    setUser(null)
  }

  function updateUser(userVal) {
    localStorage.setItem('mmorphose_user', JSON.stringify(userVal))
    setUser(userVal)
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}

export default AuthContext
