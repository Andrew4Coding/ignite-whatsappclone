import { createContext, FC, PropsWithChildren, useCallback, useContext, useMemo } from "react"
import { useMMKVString } from "react-native-mmkv"

export type AuthContextType = {
  isAuthenticated: boolean
  authToken?: string
  authEmail?: string
  userId?: string
  userName?: string
  setAuthToken: (token?: string) => void
  setAuthEmail: (email: string) => void
  setUserId: (userId?: string) => void
  setUserName: (userName?: string) => void
  logout: () => void
  validationError: string
}

export const AuthContext = createContext<AuthContextType | null>(null)

export interface AuthProviderProps {}

export const AuthProvider: FC<PropsWithChildren<AuthProviderProps>> = ({ children }) => {
  const [authToken, setAuthToken] = useMMKVString("AuthProvider.authToken")
  const [authEmail, setAuthEmail] = useMMKVString("AuthProvider.authEmail")
  const [userId, setUserId] = useMMKVString("AuthProvider.userId")
  const [userName, setUserName] = useMMKVString("AuthProvider.userName")

  const logout = useCallback(() => {
    setAuthToken(undefined)
    setAuthEmail("")
    setUserId(undefined)
    setUserName(undefined)
  }, [setAuthEmail, setAuthToken, setUserId, setUserName])

  const validationError = useMemo(() => {
    if (!authEmail || authEmail.length === 0) return "can't be blank"
    if (authEmail.length < 6) return "must be at least 6 characters"
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(authEmail)) return "must be a valid email address"
    return ""
  }, [authEmail])

  const value = {
    isAuthenticated: !!authToken,
    authToken,
    authEmail,
    userId,
    userName,
    setAuthToken,
    setAuthEmail,
    setUserId,
    setUserName,
    logout,
    validationError,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error("useAuth must be used within an AuthProvider")
  return context
}
