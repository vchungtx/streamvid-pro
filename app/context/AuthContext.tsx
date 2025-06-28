// ===== APP/CONTEXT/AUTHCONTEXT.TSX =====
'use client'

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface User {
    isLoggedIn: boolean
    isRegistered: boolean
    phone: string | null
    favorites: number[]
    viewHistory: number[]
}

interface AuthContextType {
    user: User
    updateUser: (updates: Partial<User>) => void
    login: (phone: string) => Promise<void>
    register: (phone: string) => Promise<void>
    logout: () => void
    checkAuthRequired: (action: () => void) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User>({
        isLoggedIn: false,
        isRegistered: false,
        phone: null,
        favorites: [],
        viewHistory: []
    })

    useEffect(() => {
        // Load user data from localStorage on mount
        const savedUser = localStorage.getItem('streamvid_user')
        if (savedUser) {
            try {
                setUser(JSON.parse(savedUser))
            } catch (error) {
                console.error('Error loading user data:', error)
                localStorage.removeItem('streamvid_user')
            }
        }
    }, [])

    useEffect(() => {
        // Save user data to localStorage whenever user state changes
        localStorage.setItem('streamvid_user', JSON.stringify(user))
    }, [user])

    const updateUser = (updates: Partial<User>) => {
        setUser(prev => ({ ...prev, ...updates }))
    }

    const login = async (phone: string) => {
        // Simulate login process
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                setUser(prev => ({
                    ...prev,
                    isLoggedIn: true,
                    isRegistered: true, // ✅ Auto-register upon login for demo
                    phone
                }))
                resolve()
            }, 1500)
        })
    }

    const register = async (phone: string) => {
        // Simulate registration process
        return new Promise<void>((resolve) => {
            setTimeout(() => {
                setUser(prev => ({
                    ...prev,
                    isLoggedIn: true,
                    isRegistered: true,
                    phone
                }))
                resolve()
            }, 2000)
        })
    }

    const logout = () => {
        setUser({
            isLoggedIn: false,
            isRegistered: false,
            phone: null,
            favorites: [],
            viewHistory: []
        })
        localStorage.removeItem('streamvid_user')
    }

    const checkAuthRequired = (action: () => void) => {
        if (!user.isLoggedIn) {
            // Show login modal
            return
        }
        if (!user.isRegistered) {
            // Show registration modal
            return
        }
        action()
    }

    return (
        <AuthContext.Provider value={{
            user,
            updateUser,
            login,
            register,
            logout,
            checkAuthRequired
        }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}