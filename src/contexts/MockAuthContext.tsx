import React, { createContext, useContext, useState } from 'react'

interface MockUser {
  id: string
  email: string
}

interface MockAuthContextType {
  user: MockUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const MockAuthContext = createContext<MockAuthContextType | undefined>(undefined)

export const useMockAuth = () => {
  const context = useContext(MockAuthContext)
  if (!context) {
    throw new Error('useMockAuth must be used within a MockAuthProvider')
  }
  return context
}

interface MockAuthProviderProps {
  children: React.ReactNode
}

export const MockAuthProvider: React.FC<MockAuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>({
    id: 'mock-user',
    email: 'demo@controlgastos.com'
  })
  const [loading, setLoading] = useState(false)

  const signIn = async (email: string, _password: string) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setUser({ id: 'mock-user', email })
    setLoading(false)
  }

  const signUp = async (email: string, _password: string) => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))
    setUser({ id: 'mock-user', email })
    setLoading(false)
  }

  const signOut = async () => {
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500))
    setUser(null)
    setLoading(false)
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <MockAuthContext.Provider value={value}>{children}</MockAuthContext.Provider>
}
