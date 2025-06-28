// ===== APP/PAGES/DISCOVERPAGE.TSX =====
'use client'

import React from 'react'
import { motion } from 'framer-motion'
import VideoCard from '../components/VideoCard'
import { sampleVideos } from '../data'
import { useApp } from '../context/AppContext'
import { Video } from '../types'

export default function DiscoverPage() {
    const { setCurrentPage } = useApp()

    const handlePlayVideo = (video: Video) => {
        // Store current video data
        sessionStorage.setItem('currentVideo', JSON.stringify(video))
        setCurrentPage('video-player')
    }

    // Helper function to parse views correctly
    const parseViews = (viewsStr: string): number => {
        const cleanStr = viewsStr.replace(/[^\d.KM]/g, '')
        const number = parseFloat(cleanStr.replace(/[KM]/g, ''))

        if (cleanStr.includes('M')) {
            return number * 1000 // 2.1M = 2100
        } else if (cleanStr.includes('K')) {
            return number // 892K = 892
        }
        return number
    }

    // Recommended: Videos with moderate views (500K - 3M)
    const recommendedVideos = sampleVideos.filter(video => {
        const views = parseViews(video.views)
        return views >= 500 && views <= 3000 // 500K - 3M views
    })

    // Trending: Videos with highest views (>3M)
    const trendingVideos = sampleVideos.filter(video => {
        const views = parseViews(video.views)
        return views > 3000 // >3M views
    }).sort((a, b) => {
        const viewsA = parseViews(a.views)
        const viewsB = parseViews(b.views)
        return viewsB - viewsA // Sort by views descending
    })

    // New Releases: Latest videos (using last 6 videos)
    const newReleases = sampleVideos.slice(-6)

    return (
        <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
            {/* Welcome Section */}
            <motion.div
                className="text-center py-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent mb-6">
                    Discover Amazing Content
                </h1>
                <p className="text-xl text-white/70 max-w-2xl mx-auto">
                    Explore premium videos, exclusive content, and personalized recommendations just for you
                </p>
            </motion.div>

            {/* Recommended Section */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <div className="flex items-center space-x-3 mb-8">
                    <span className="text-3xl">✨</span>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                        Recommended for You
                    </h2>
                    <span className="text-sm text-white/50 bg-white/10 px-3 py-1 rounded-full">
            {recommendedVideos.length} videos
          </span>
                </div>

                {recommendedVideos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recommendedVideos.map((video, index) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 * index }}
                            >
                                <VideoCard video={video} onPlay={handlePlayVideo} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 glass-enhanced rounded-2xl">
                        <div className="text-6xl mb-4">🎬</div>
                        <h3 className="text-xl font-semibold mb-2">Building Your Recommendations</h3>
                        <p className="text-white/70">Watch more videos to get personalized recommendations!</p>
                    </div>
                )}
            </motion.section>

            {/* Trending Section */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <div className="flex items-center space-x-3 mb-8">
                    <span className="text-3xl">🔥</span>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-orange-400 to-red-500 bg-clip-text text-transparent">
                        Trending Now
                    </h2>
                    <span className="text-sm text-white/50 bg-gradient-to-r from-orange-500/20 to-red-500/20 px-3 py-1 rounded-full">
            {trendingVideos.length} hot videos
          </span>
                </div>

                {trendingVideos.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {trendingVideos.map((video, index) => (
                            <motion.div
                                key={video.id}
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.6, delay: 0.1 * index }}
                            >
                                <VideoCard video={video} onPlay={handlePlayVideo} />
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 glass-enhanced rounded-2xl">
                        <div className="text-6xl mb-4">🔥</div>
                        <h3 className="text-xl font-semibold mb-2">No Trending Videos</h3>
                        <p className="text-white/70">Check back later for trending content!</p>
                    </div>
                )}
            </motion.section>

            {/* New Releases Section */}
            <motion.section
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
            >
                <div className="flex items-center space-x-3 mb-8">
                    <span className="text-3xl">🆕</span>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-cyan-500 bg-clip-text text-transparent">
                        New Releases
                    </h2>
                    <span className="text-sm text-white/50 bg-gradient-to-r from-green-500/20 to-cyan-500/20 px-3 py-1 rounded-full">
            Fresh content
          </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {newReleases.map((video, index) => (
                        <motion.div
                            key={video.id}
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 * index }}
                        >
                            <VideoCard video={video} onPlay={handlePlayVideo} />
                        </motion.div>
                    ))}
                </div>
            </motion.section>
        </div>
    )
}