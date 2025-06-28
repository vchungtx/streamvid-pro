'use client'

import React from 'react'
import { motion } from 'framer-motion'
import CategoryCard from '../components/CategoryCard'
import { videoCategories } from '../data'
import { useNotification } from '../components/NotificationProvider'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { Category } from '../types'

export default function BrowsePage() {
    const { showNotification } = useNotification()
    const { user } = useAuth()
    const { showModal } = useApp()

    const handleCategoryClick = (category: Category) => {
        if (!user.isLoggedIn) {
            showModal('login')
            return
        }

        showNotification(
            `📂 ${category.name} videos:\n• ${category.subcategories.join('\n• ')}`,
            'info'
        )
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="text-5xl mb-4">📁</div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-pink-500 bg-clip-text text-transparent mb-4">
                    Browse Categories
                </h1>
                <p className="text-xl text-white/70 max-w-2xl mx-auto">
                    Explore our extensive collection of video categories and find exactly what you're looking for
                </p>
            </motion.div>

            <motion.div
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                {videoCategories.map((category, index) => (
                    <motion.div
                        key={category.name}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 * index }}
                    >
                        <CategoryCard category={category} onClick={handleCategoryClick} />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    )
}