// ===== APP/PAGES/SEARCHPAGE.TSX =====
'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Search, TrendingUp } from 'lucide-react'
import VideoCard from '../components/VideoCard'
import { sampleVideos } from '../data'
import { useNotification } from '../components/NotificationProvider'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'
import { Video } from '../types'

const trendingSearches = [
    '🌿 Nature Documentary',
    '📱 Tech Reviews',
    '👨‍🍳 Cooking Shows',
    '🎮 Gaming',
    '🎵 Music Videos',
    '✈️ Travel Vlogs'
]

const filterOptions = [
    { id: 'all', label: 'All', emoji: '📺' },
    { id: 'trending', label: 'Trending', emoji: '🔥' },
    { id: 'new', label: 'New', emoji: '✨' },
    { id: 'popular', label: 'Popular', emoji: '⭐' },
    { id: 'hd', label: 'HD Quality', emoji: '🎬' },
]

export default function SearchPage() {
    const [searchQuery, setSearchQuery] = useState('')
    const [activeFilter, setActiveFilter] = useState('all')
    const [searchResults, setSearchResults] = useState<Video[]>([])
    const [showResults, setShowResults] = useState(false)

    const { showNotification } = useNotification()
    const { user } = useAuth()
    const { showModal, setCurrentPage } = useApp()

    const handleSearch = () => {
        if (!searchQuery.trim()) {
            showNotification('Please enter a search term', 'warning')
            return
        }

        if (!user.isLoggedIn) {
            showModal('login')
            return
        }

        const filteredVideos = sampleVideos.filter(video =>
            video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            video.category.toLowerCase().includes(searchQuery.toLowerCase())
        )

        setSearchResults(filteredVideos)
        setShowResults(true)
        showNotification(`🎯 Found ${filteredVideos.length} results for "${searchQuery}"`, 'success')
    }

    const handleTrendingSearch = (query: string) => {
        setSearchQuery(query)
        handleSearch()
    }

    const handleFilter = (filterId: string) => {
        setActiveFilter(filterId)

        let filteredVideos = [...sampleVideos]

        switch (filterId) {
            case 'trending':
                filteredVideos = sampleVideos.filter(v => parseInt(v.views.replace(/\D/g, '')) > 1000)
                break
            case 'new':
                filteredVideos = sampleVideos.slice(0, 3)
                break
            case 'popular':
                filteredVideos = sampleVideos.filter(v => parseInt(v.views.replace(/\D/g, '')) > 2000)
                break
            case 'hd':
                filteredVideos = sampleVideos.filter(v => parseInt(v.duration.split(':')[0]) > 30)
                break
            default:
                filteredVideos = sampleVideos
        }

        setSearchResults(filteredVideos)
        setShowResults(true)

        const filterOption = filterOptions.find(f => f.id === filterId)
        showNotification(`${filterOption?.emoji} Showing ${filteredVideos.length} ${filterOption?.label.toLowerCase()} videos`, 'info')
    }

    const handlePlayVideo = (video: Video) => {
        sessionStorage.setItem('currentVideo', JSON.stringify(video))
        setCurrentPage('video-player')
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Header */}
            <motion.div
                className="text-center mb-12"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
            >
                <div className="text-5xl mb-4">🔍</div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent mb-4">
                    Discover Content
                </h1>
                <p className="text-xl text-white/70">
                    Search through our vast library of premium videos
                </p>
            </motion.div>

            {/* Search Bar */}
            <motion.div
                className="mb-12"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <div className="max-w-2xl mx-auto">
                    <div className="glass-enhanced rounded-2xl p-2 border border-white/20 focus-within:border-blue-500/50 focus-within:ring-2 focus-within:ring-blue-500/20 transition-all">
                        <div className="flex items-center">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search videos, categories, or keywords..."
                                className="flex-1 p-4 bg-transparent text-white placeholder-white/50 outline-none text-lg"
                                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                            />
                            <motion.button
                                onClick={handleSearch}
                                className="btn-primary m-1 px-6 py-3 flex items-center space-x-2"
                                whileHover={{ scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                            >
                                <Search className="w-5 h-5" />
                                <span>Search</span>
                            </motion.button>
                        </div>
                    </div>
                </div>
            </motion.div>

            {/* Quick Filters */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3 }}
            >
                <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                    <span>🎭</span>
                    <span>Quick Filters</span>
                </h3>
                <div className="flex flex-wrap gap-3">
                    {filterOptions.map((filter) => (
                        <motion.button
                            key={filter.id}
                            onClick={() => handleFilter(filter.id)}
                            className={`px-4 py-2 rounded-full transition-all ${
                                activeFilter === filter.id
                                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                                    : 'glass border border-white/20 text-white/80 hover:bg-white/10'
                            }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            {filter.emoji} {filter.label}
                        </motion.button>
                    ))}
                </div>
            </motion.div>

            {/* Trending Searches */}
            {!showResults && (
                <motion.div
                    className="mb-12"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <h3 className="text-lg font-semibold mb-4 flex items-center space-x-2">
                        <TrendingUp className="w-5 h-5" />
                        <span>Trending Searches</span>
                    </h3>
                    <div className="flex flex-wrap gap-3">
                        {trendingSearches.map((search, index) => (
                            <motion.button
                                key={index}
                                onClick={() => handleTrendingSearch(search)}
                                className="px-4 py-2 glass border border-white/10 rounded-full text-white/80 hover:bg-white/10 transition-all"
                                whileHover={{ scale: 1.05, y: -2 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {search}
                            </motion.button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Search Results */}
            {showResults && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                >
                    <h3 className="text-xl font-semibold mb-6 flex items-center space-x-2">
                        <span>🎯</span>
                        <span>Search Results ({searchResults.length})</span>
                    </h3>

                    {searchResults.length === 0 ? (
                        <div className="text-center py-16 glass-enhanced rounded-2xl">
                            <div className="text-6xl mb-4">🔍</div>
                            <h3 className="text-xl font-semibold mb-2">No results found</h3>
                            <p className="text-white/70">Try adjusting your search terms or browse our categories</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {searchResults.map((video, index) => (
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
                    )}
                </motion.div>
            )}
        </div>
    )
}
