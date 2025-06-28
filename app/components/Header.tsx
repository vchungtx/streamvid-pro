// ===== APP/COMPONENTS/HEADER.TSX =====
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { Bell, User, LogOut } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuth()
  const { showModal, currentPage, setCurrentPage } = useApp()

  const navItems = [
    { id: 'discover', label: '🎬 Discover' },
    { id: 'browse', label: '🎯 Browse' },
    { id: 'search', label: '🔍 Search' },
    { id: 'favorites', label: '💫 My List', requiresAuth: true },
    { id: 'rewards', label: '🎁 Rewards', requiresAuth: true },
  ]

  const handleNavClick = (item: any) => {
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
      <motion.header
          className="glass-enhanced border-b border-white/10 sticky top-0 z-40"
          initial={{ y: -100 }}
          animate={{ y: 0 }}
          transition={{ duration: 0.5 }}
      >
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <motion.div
                className="flex items-center space-x-3 cursor-pointer"
                whileHover={{ scale: 1.05 }}
                onClick={() => setCurrentPage('discover')}
            >
              <div className="text-3xl">🎬</div>
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient-shift bg-[length:200%_200%]">
                StreamVid Pro
              </h1>
            </motion.div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-8">
              {navItems.map((item) => (
                  <NavLink
                      key={item.id}
                      item={item}
                      isActive={currentPage === item.id}
                      onClick={() => handleNavClick(item)}
                  />
              ))}
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <motion.button
                  className="p-2 glass rounded-full hover:bg-white/20 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => showModal('notifications')}
              >
                <Bell className="w-5 h-5" />
              </motion.button>

              {user.isLoggedIn ? (
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4" />
                      </div>
                      <span className="text-sm font-medium">
                    User ****{user.phone?.slice(-4) || '0000'}
                  </span>
                    </div>
                    <motion.button
                        onClick={logout}
                        className="p-2 glass rounded-full hover:bg-white/20 transition-colors"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                    >
                      <LogOut className="w-4 h-4" />
                    </motion.button>
                  </div>
              ) : (
                  <div className="flex space-x-2">
                    <button
                        onClick={() => showModal('login')}
                        className="btn-outline px-4 py-2 text-sm"
                    >
                      Login
                    </button>
                    <button
                        onClick={() => showModal('register')}
                        className="btn-primary px-4 py-2 text-sm"
                    >
                      Register
                    </button>
                  </div>
              )}
            </div>
          </div>
        </div>
      </motion.header>
  )
}

interface NavLinkProps {
  item: {
    id: string
    label: string
    requiresAuth?: boolean
  }
  isActive: boolean
  onClick: () => void
}

function NavLink({ item, isActive, onClick }: NavLinkProps) {
  return (
      <motion.button
          onClick={onClick}
          className={`text-white/80 hover:text-white transition-colors font-medium px-3 py-2 rounded-lg ${
              isActive ? 'bg-white/10 text-white' : ''
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
      >
        {item.label}
      </motion.button>
  )
}