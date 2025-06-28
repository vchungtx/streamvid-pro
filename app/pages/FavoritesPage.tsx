'use client'

import React from 'react'
import { motion } from 'framer-motion'
import VideoCard from '../components/VideoCard'
import { sampleVideos } from '../data'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { Video } from '../types'

export default function FavoritesPage() {
    const { user } = useAuth()
    const { setCurrentPage } = useApp()

    const favoriteVideos = sampleVideos.filter(video =>
        user.favorites.includes(video.id)
    )

    const handlePlayVideo = (video: Video) => {
        sessionStorage.setItem('currentVideo', JSON.stringify(video))
        setCurrentPage('video-player')
    }

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="text-5xl mb-4">💖</div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-pink-400 to-red-500 bg-clip-text text-transparent mb-4">
                    Your Favorites
                </h1>
                <p className="text-xl text-white/70">
                    Your personally curated collection of amazing videos
                </p>
            </motion.div>

            {favoriteVideos.length === 0 ? (
                <motion.div
                    className="text-center py-20 glass-enhanced rounded-3xl"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6 }}
                >
                    <div className="text-8xl mb-6">💔</div>
                    <h3 className="text-2xl font-bold mb-4">No favorites yet</h3>
                    <p className="text-white/70 mb-8 max-w-md mx-auto">
                        Start exploring our amazing content and like videos to add them to your favorites collection!
                    </p>
                    <motion.button
                        onClick={() => setCurrentPage('discover')}
                        className="btn-primary inline-flex items-center space-x-2"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <span>✨</span>
                        <span>Discover Videos</span>
                    </motion.button>
                </motion.div>
            ) : (
                <motion.div
                    className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                >
                    {favoriteVideos.map((video, index) => (
                        <motion.div
                            key={video.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 * index }}
                        >
                            <VideoCard video={video} onPlay={handlePlayVideo} />
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </div>
    )
}