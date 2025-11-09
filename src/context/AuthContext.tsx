import { createContext, FC, PropsWithChildren, useCallback, useContext, useMemo } from "react"
import { useMMKVString } from "react-native-mmkv"

export type AuthContextType = {
  isAuthenticated: boolean
  authToken?: string
  userId?: string
  userName?: string
  setAuthToken: (token?: string) => void
  setUserId: (userId?: string) => void
  setUserName: (userName?: string) => void
  logout: () => void
  validationError: string
}

export const AuthContext = createContext<AuthContextType | null>(null)

export interface AuthProviderProps {}

export const AuthProvider: FC<PropsWithChildren<AuthProviderProps>> = ({ children }) => {
  const [authToken, setAuthToken] = useMMKVString("AuthProvider.authToken")
  const [userId, setUserId] = useMMKVString("AuthProvider.userId")
  const [userName, setUserName] = useMMKVString("AuthProvider.userName")

  const logout = useCallback(() => {
    setAuthToken(undefined)
    setUserId(undefined)
    setUserName(undefined)
  }, [setAuthToken, setUserId, setUserName])

  const validationError = useMemo(() => {
    if (!userName || userName.length === 0) return "Name can't be blank"
    if (userName.length < 2) return "Name must be at least 2 characters"
    return ""
  }, [userName])

  const value = {
    isAuthenticated: !!authToken,
    authToken,
    userId,
    userName,
    setAuthToken,
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
