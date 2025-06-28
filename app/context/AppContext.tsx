'use client'

import React, { createContext, useContext, useState, ReactNode } from 'react'

interface AppContextType {
    currentPage: string
    setCurrentPage: (page: string) => void
    showModal: (modalId: string) => void
    hideModal: (modalId: string) => void
    activeModals: Set<string>
}

const AppContext = createContext<AppContextType | undefined>(undefined)

export function AppProvider({ children }: { children: ReactNode }) {
    const [currentPage, setCurrentPage] = useState('discover')
    const [activeModals, setActiveModals] = useState<Set<string>>(new Set())

    const showModal = (modalId: string) => {
        setActiveModals(prev => new Set(prev).add(modalId))
    }

    const hideModal = (modalId: string) => {
        setActiveModals(prev => {
            const newSet = new Set(prev)
            newSet.delete(modalId)
            return newSet
        })
    }

    return (
        <AppContext.Provider value={{
            currentPage,
            setCurrentPage,
            showModal,
            hideModal,
            activeModals
        }}>
            {children}
        </AppContext.Provider>
    )
}

export function useApp() {
    const context = useContext(AppContext)
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider')
    }
    return context
}