import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { authAPI } from '../services/api'
import toast from 'react-hot-toast'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // ✅ FETCH CURRENT USER
  const fetchUser = useCallback(async () => {
    const token = localStorage.getItem('wl_token')

    if (!token) {
      setLoading(false)
      return
    }

    try {
      const u = await authAPI.me();
      if (u) {
        u.id = u.id || u._id;
        u._id = u._id || u.id;
      }
      setUser(u);
    } catch (err) {
      console.error("FETCH USER ERROR:", err)
      localStorage.removeItem('wl_token')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  // ✅ LOGIN
  const login = async (credentials) => {
    try {
      const res = await authAPI.login(credentials) // ✅ FIXED

      localStorage.setItem('wl_token', res.token)
      const u = res.user;
      if (u) {
        u.id = u.id || u._id;
        u._id = u._id || u.id;
      }
      setUser(u)

      return u
    } catch (err) {
      console.error("LOGIN ERROR:", err)
      toast.error(err.message || "Login failed")
      throw err
    }
  }

  // ✅ REGISTER
  const register = async (credentials) => {
    try {
      const res = await authAPI.register(credentials) // ✅ FIXED

      localStorage.setItem('wl_token', res.token)
      const u = res.user;
      if (u) {
        u.id = u.id || u._id;
        u._id = u._id || u.id;
      }
      setUser(u)

      return u
    } catch (err) {
      console.error("REGISTER ERROR:", err)
      toast.error(err.message || "Registration failed")
      throw err
    }
  }

  // ✅ LOGOUT
  const logout = () => {
    localStorage.removeItem('wl_token')
    setUser(null)
    toast.success('Logged out successfully')
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        logout,
        refetch: fetchUser
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}