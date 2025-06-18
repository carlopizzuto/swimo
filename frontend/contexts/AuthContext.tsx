"use client"

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { User, LoginCredentials, RegisterCredentials } from '@/lib/types'
import { api } from '@/lib/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (credentials: RegisterCredentials) => Promise<User>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const isAuthenticated = !!user

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      if (api.auth.isAuthenticated()) {
        try {
          const currentUser = await api.auth.getCurrentUser()
          setUser(currentUser)
        } catch (error) {
          console.error('Failed to get current user:', error)
          api.auth.logout() // Clear invalid token
        }
      }
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    setIsLoading(true)
    try {
      await api.auth.login(credentials)
      const currentUser = await api.auth.getCurrentUser()
      setUser(currentUser)
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (credentials: RegisterCredentials): Promise<User> => {
    setIsLoading(true)
    try {
      const newUser = await api.auth.register(credentials)
      // After registration, automatically log in
      await login({ username: credentials.username, password: credentials.password })
      return newUser
    } catch (error) {
      console.error('Registration failed:', error)
      setIsLoading(false)
      throw error
    }
  }

  const logout = () => {
    api.auth.logout()
    setUser(null)
  }

  const refreshUser = async () => {
    if (api.auth.isAuthenticated()) {
      try {
        const currentUser = await api.auth.getCurrentUser()
        setUser(currentUser)
      } catch (error) {
        console.error('Failed to refresh user:', error)
        logout()
      }
    }
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated,
    login,
    register,
    logout,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
} 