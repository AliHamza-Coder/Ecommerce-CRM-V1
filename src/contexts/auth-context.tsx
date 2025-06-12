"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { useRouter, usePathname } from "next/navigation"
import { toast } from "@/hooks/use-toast"

// Define the user type with role information
type User = {
  _id: string
  name: string
  email: string
  role: 'super_admin' | 'sub_admin' | 'viewer'
  status: string
  lastLogin: string | null
  permissions: string[]
}

type LoginResponse = {
  success: boolean
  user?: User
  token?: string
  error?: string
}

type AuthContextType = {
  isAuthenticated: boolean
  user: User | null
  login: (email: string, password: string) => Promise<LoginResponse>
  logout: () => void
  loading: boolean
  hasPermission: (permission: string) => boolean
  isRole: (role: 'super_admin' | 'sub_admin' | 'viewer') => boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider = ({ children }: { children: ReactNode | ((props: { loading: boolean; isAuthenticated: boolean }) => ReactNode) }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if user is authenticated from localStorage and cookies
    const checkAuth = async () => {
      try {
        const userData = localStorage.getItem("user")
        const hasAuthCookie = document.cookie.split(';').some(c => c.trim().startsWith('auth_token='))
        
        if (userData && hasAuthCookie) {
          try {
            const parsedUser = JSON.parse(userData)
            
            // Verify token is still valid by making a request to a protected endpoint
            const response = await fetch('/api/auth/verify', {
              method: 'GET',
              headers: {
                'Content-Type': 'application/json'
              }
            })
            
            if (response.ok) {
              setUser(parsedUser)
              setIsAuthenticated(true)
            } else {
              // Token is invalid, clear everything
              localStorage.removeItem("user")
              document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure"
              setUser(null)
              setIsAuthenticated(false)
              router.push("/login")
            }
          } catch (e) {
            console.error("Failed to parse user data", e)
            localStorage.removeItem("user")
            document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure"
            setUser(null)
            setIsAuthenticated(false)
            router.push("/login")
          }
        } else if (!hasAuthCookie && userData) {
          // If token is missing but user data exists, clean up localStorage
          localStorage.removeItem("user")
          setUser(null)
          setIsAuthenticated(false)
          router.push("/login")
        } else {
          setIsAuthenticated(false)
          if (pathname !== "/login") {
            router.push("/login")
          }
        }
      } catch (error) {
        console.error("Auth check failed:", error)
        setUser(null)
        setIsAuthenticated(false)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router, pathname])

  // Handle client-side navigation
  useEffect(() => {
    if (!loading) {
      if (isAuthenticated && pathname === "/login") {
        router.push("/dashboard")
      } else if (!isAuthenticated && pathname !== "/login") {
        router.push("/login")
      }
    }
  }, [isAuthenticated, loading, pathname, router])

  const login = async (email: string, password: string): Promise<LoginResponse> => {
    setLoading(true)
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        return {
          success: false,
          error: data.error || 'Login failed'
        };
      }
      
      // Set authenticated status and user data
      localStorage.setItem("user", JSON.stringify(data.user))
      
      // Set the auth token in a cookie (this will be used by the middleware)
      document.cookie = `auth_token=${data.token}; path=/; max-age=2592000; SameSite=Strict; Secure`;
      
      setUser(data.user)
      setIsAuthenticated(true)
      
      // Redirect to dashboard
      router.push("/dashboard")
      
      return {
        success: true,
        user: data.user,
        token: data.token
      };
    } catch (error) {
      console.error("Login failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Network or server error'
      };
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    // Clear localStorage
    localStorage.removeItem("user")
    
    // Clear the auth token cookie
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Strict; Secure";
    
    setUser(null)
    setIsAuthenticated(false)
    router.push("/login")
  }
  
  // Helper function to check if user has a specific permission
  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    
    // Super admin has all permissions
    if (user.role === 'super_admin') return true;
    
    // Check if the user has the specific permission
    return user.permissions.includes(permission);
  }
  
  // Helper to check user role
  const isRole = (role: 'super_admin' | 'sub_admin' | 'viewer'): boolean => {
    return user?.role === role;
  }

  return (
    <AuthContext.Provider value={{ 
      isAuthenticated, 
      user, 
      login, 
      logout, 
      loading, 
      hasPermission, 
      isRole 
    }}>
      {typeof children === 'function' ? children({ loading, isAuthenticated }) : children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}