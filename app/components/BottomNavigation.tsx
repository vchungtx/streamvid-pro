'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { Home, Grid3X3, Heart, Gift, User } from 'lucide-react'

interface NavItem {
    id: string
    label: string
    icon: React.ComponentType<any>
    emoji: string
    requiresAuth?: boolean
}

const navItems: NavItem[] = [
    { id: 'discover', label: 'Discover', icon: Home, emoji: '🎬' },
    { id: 'category', label: 'Category', icon: Grid3X3, emoji: '📂' },
    { id: 'favorites', label: 'Favorites', icon: Heart, emoji: '💖', requiresAuth: true },
    { id: 'rewards', label: 'Rewards', icon: Gift, emoji: '🎁', requiresAuth: true },
    { id: 'account', label: 'Account', icon: User, emoji: '👤' },
]

export default function BottomNavigation() {
    const { currentPage, setCurrentPage, showModal } = useApp()
    const { user } = useAuth()

    const handleNavClick = (item: NavItem) => {
        if (item.requiresAuth && !user.isLoggedIn) {
            showModal('login')
            return
        }

        if (item.requiresAuth && !user.isRegistered) {
            showModal('registration-required')
            return
        }

        setCurrentPage(item.id)
    }

    return (
        <div className="safe-bottom">
            <motion.nav
                className="glass-enhanced border-t border-white/20 px-2 py-1"
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
                            </motion.button>
                        )
                    })}
                </div>
            </motion.nav>
        </div>
    )
}