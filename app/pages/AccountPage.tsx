'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { User, LogOut, Settings, Heart, Eye, Gift, Shield, Smartphone, Crown } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { useNotification } from '../components/NotificationProvider'

export default function AccountPage() {
    const { user, logout } = useAuth()
    const { showModal } = useApp()
    const { showNotification } = useNotification()

    const handleLogout = () => {
        logout()
        showNotification('👋 Successfully logged out!', 'success')
    }

    const handleLogin = () => {
        showModal('login')
    }

    const handleRegister = () => {
        showModal('register')
    }

    const userStats = [
        { icon: Eye, label: 'Videos Watched', value: user.viewHistory.length, color: 'text-blue-400' },
        { icon: Heart, label: 'Favorites', value: user.favorites.length, color: 'text-red-400' },
        { icon: Gift, label: 'Referrals', value: 0, color: 'text-purple-400' },
        { icon: Crown, label: 'Premium Days', value: user.isRegistered ? 30 : 0, color: 'text-yellow-400' },
    ]

    const accountOptions = [
        { icon: Settings, label: 'Account Settings', action: () => showNotification('⚙️ Coming soon!', 'info') },
        { icon: Shield, label: 'Privacy & Security', action: () => showNotification('🔒 Coming soon!', 'info') },
        { icon: Smartphone, label: 'Device Management', action: () => showNotification('📱 Coming soon!', 'info') },
        { icon: Gift, label: 'Referral Program', action: () => showNotification('🎁 Navigate to Rewards tab!', 'info') },
    ]

    if (!user.isLoggedIn) {
        return (
            <div className="max-w-4xl mx-auto px-4 py-8">
                <motion.div
                    className="text-center py-20"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-8xl mb-6">👤</div>
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                        Welcome to StreamVid Pro
                    </h1>
                    <p className="text-xl text-white/70 mb-8 max-w-md mx-auto">
                        Sign in to access your account, manage preferences, and enjoy premium features
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <motion.button
                            onClick={handleLogin}
                            className="btn-primary px-8 py-4 text-lg flex items-center space-x-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <User className="w-6 h-6" />
                            <span>🔐 Sign In</span>
                        </motion.button>

                        <motion.button
                            onClick={handleRegister}
                            className="btn-outline px-8 py-4 text-lg flex items-center space-x-2"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Crown className="w-6 h-6" />
                            <span>✨ Register</span>
                        </motion.button>
                    </div>
                </motion.div>
            </div>
        )
    }

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Header */}
            <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="text-5xl mb-4">👤</div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent mb-4">
                    My Account
                </h1>
                <p className="text-xl text-white/70">
                    Manage your profile and preferences
                </p>
            </motion.div>

            {/* User Profile */}
            <motion.div
                className="glass-enhanced rounded-3xl p-8 mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <div className="flex items-center space-x-6 mb-6">
                    <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-2xl">
                        👤
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold mb-2">
                            User ****{user.phone?.slice(-4) || '0000'}
                        </h2>
                        <div className="flex items-center space-x-4 text-white/70">
                            <span>📱 {user.phone}</span>
                            {user.isRegistered && (
                                <span className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full text-white text-sm flex items-center space-x-1">
                  <Crown className="w-4 h-4" />
                  <span>Premium</span>
                </span>
                            )}
                        </div>
                    </div>
                </div>

                <motion.button
                    onClick={handleLogout}
                    className="btn-outline flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <LogOut className="w-5 h-5" />
                    <span>Sign Out</span>
                </motion.button>
            </motion.div>

            {/* Stats Grid */}
            <motion.div
                className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                {userStats.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        className="glass-enhanced rounded-2xl p-6 text-center"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 * index }}
                        whileHover={{ scale: 1.02, y: -5 }}
                    >
                        <div className={`w-12 h-12 ${stat.color} mx-auto mb-3 flex items-center justify-center`}>
                            <stat.icon className="w-6 h-6" />
                        </div>
                        <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                            {stat.value}
                        </div>
                        <div className="text-sm text-white/70">{stat.label}</div>
                    </motion.div>
                ))}
            </motion.div>

            {/* Account Options */}
            <motion.div
                className="glass-enhanced rounded-2xl p-6"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
            >
                <h3 className="text-xl font-bold mb-6">⚙️ Account Settings</h3>

                <div className="space-y-3">
                    {accountOptions.map((option, index) => (
                        <motion.button
                            key={option.label}
                            onClick={option.action}
                            className="w-full glass rounded-xl p-4 flex items-center space-x-4 hover:bg-white/10 transition-colors text-left"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 * index }}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                        >
                            <option.icon className="w-6 h-6 text-blue-400" />
                            <span className="font-medium">{option.label}</span>
                            <div className="ml-auto text-white/50">→</div>
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Premium Benefits */}
            {user.isRegistered && (
                <motion.div
                    className="mt-8 glass-enhanced rounded-2xl p-6 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20"
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.8 }}
                >
                    <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                        <Crown className="w-6 h-6 text-yellow-400" />
                        <span>Premium Benefits</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                ✓
                            </div>
                            <span>Unlimited video streaming</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                ✓
                            </div>
                            <span>HD/4K quality videos</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                ✓
                            </div>
                            <span>Exclusive premium content</span>
                        </div>
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-green-500/20 rounded-full flex items-center justify-center">
                                ✓
                            </div>
                            <span>Ad-free experience</span>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    )
}