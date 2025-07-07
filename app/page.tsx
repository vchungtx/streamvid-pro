'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { useApp } from './context/AppContext'
import { useAuth } from './context/AuthContext'

// Pages
import DiscoverPage from './pages/DiscoverPage'
import CategoryPage from './pages/CategoryPage' // Updated from BrowsePage
import FavoritesPage from './pages/FavoritesPage'
import RewardsPage from './pages/RewardsPage'
import AccountPage from './pages/AccountPage' // New page
import VideoPlayerPage from './pages/VideoPlayerPage'

// Modals
import LoginModal from './components/modals/LoginModal'
import RegisterModal from './components/modals/RegisterModal'
import RegistrationRequiredModal from './components/modals/RegistrationRequiredModal'

export default function Home() {
  const { currentPage } = useApp()
  const { user } = useAuth()

  const renderPage = () => {
    switch (currentPage) {
      case 'discover':
        return <DiscoverPage />
      case 'category': // Updated from 'browse'
        return <CategoryPage />
      case 'favorites': // Updated from 'search'
        return <FavoritesPage />
      case 'rewards':
        return <RewardsPage />
      case 'account': // New page
        return <AccountPage />
      case 'video-player':
        return <VideoPlayerPage />
      default:
        return <DiscoverPage />
    }
  }

  return (
      <>
        <div className="min-h-screen">
          <motion.div
              key={currentPage}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
          >
            {renderPage()}
          </motion.div>
        </div>

        {/* Modals */}
        <LoginModal />
        <RegisterModal />
        <RegistrationRequiredModal />
      </>
  )
}