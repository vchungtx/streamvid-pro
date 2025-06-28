// ===== APP/COMPONENTS/BOTTOMNAVIGATION.TSX =====
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useNotification } from './NotificationProvider'
import { Home, Search, Heart, Gift, Grid3X3 } from 'lucide-react'

interface NavItem {
    id: string
    label: string
    icon: React.ComponentType<any>
    emoji: string
    requiresAuth?: boolean
}

const navItems: NavItem[] = [
    { id: 'discover', label: 'Discover', icon: Home, emoji: '🎬' },
    { id: 'browse', label: 'Browse', icon: Grid3X3, emoji: '🎯' },
    { id: 'search', label: 'Search', icon: Search, emoji: '🔍' },
    { id: 'favorites', label: 'My List', icon: Heart, emoji: '💫', requiresAuth: true },
    { id: 'rewards', label: 'Rewards', icon: Gift, emoji: '🎁', requiresAuth: true },
]

export default function BottomNavigation() {
    const { currentPage, setCurrentPage, showModal } = useApp()
    const { user } = useAuth()
    const { showNotification } = useNotification()

    const handleNavClick = (item: NavItem) => {
        // Check authentication first
        if (item.requiresAuth && !user.isLoggedIn) {
            showModal('login')
            showNotification('Please login to access this feature', 'warning')
            return
        }

        // Check registration
        if (item.requiresAuth && user.isLoggedIn && !user.isRegistered) {
            showModal('registration-required')
            showNotification('Registration required for premium features', 'info')
            return
        }

        // Navigate to page
        setCurrentPage(item.id)
        showNotification(`📍 Navigated to ${item.label}`, 'success')
    }

    return (
        <div className="safe-bottom">
            <motion.nav
                className="bottom-nav border-t border-white/30 px-2 py-2 shadow-2xl"
                initial={{ y: 100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.3 }}
            >
                <div className="flex justify-around items-center max-w-md mx-auto">
                    {navItems.map((item) => {
                        const isActive = currentPage === item.id
                        const Icon = item.icon

                        return (
                            <motion.button
                                key={item.id}
                                onClick={() => handleNavClick(item)}
                                className={`bottom-nav-item ${isActive ? 'active' : ''}`}
                                whileTap={{ scale: 0.95 }}
                                whileHover={{ scale: 1.05 }}
                            >
                                <motion.div
                                    className="relative z-10"
                                    animate={{
                                        scale: isActive ? 1.2 : 1,
                                        y: isActive ? -2 : 0
                                    }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div className="text-xl mb-1">
                                        {item.emoji}
                                    </div>
                                </motion.div>

                                <motion.span
                                    className={`text-xs font-medium relative z-10 ${
                                        isActive ? 'text-white' : 'text-white/70'
                                    }`}
                                    animate={{
                                        opacity: isActive ? 1 : 0.7,
                                        scale: isActive ? 1.05 : 1
                                    }}
                                >
                                    {item.label}
                                </motion.span>

                                {isActive && (
                                    <motion.div
                                        className="absolute bottom-0 left-1/2 w-1 h-1 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"
                                        layoutId="activeIndicator"
                                        style={{ x: '-50%' }}
                                    />
                                )}

                                {/* Lock indicator for auth-required items */}
                                {item.requiresAuth && !user.isLoggedIn && (
                                    <div className="absolute top-1 right-1 w-3 h-3 bg-red-500 rounded-full flex items-center justify-center">
                                        <span className="text-xs">🔒</span>
                                    </div>
                                )}
                            </motion.button>
                        )
                    })}
                </div>
            </motion.nav>
        </div>
    )
}