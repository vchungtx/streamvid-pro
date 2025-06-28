'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { Play, Heart, Eye, Clock } from 'lucide-react'
import { Video } from '../types'
import { useAuth } from '../context/AuthContext'
import { useApp } from '../context/AppContext'

interface VideoCardProps {
    video: Video
    onPlay: (video: Video) => void
    className?: string
}

export default function VideoCard({ video, onPlay, className = '' }: VideoCardProps) {
    const { user } = useAuth()
    const { showModal } = useApp()
    const isFavorite = user.favorites.includes(video.id)

    const handlePlay = () => {
        if (!user.isLoggedIn) {
            showModal('login')
            return
        }
        if (!user.isRegistered) {
            showModal('registration-required')
            return
        }
        onPlay(video)
    }

    return (
        <motion.div
            className={`glass-enhanced rounded-2xl overflow-hidden group cursor-pointer ${className}`}
            whileHover={{ scale: 1.03, y: -8 }}
            whileTap={{ scale: 0.98 }}
            transition={{ duration: 0.3 }}
            onClick={handlePlay}
        >
            {/* Thumbnail */}
            <div className="relative h-48 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center text-6xl">
                    {video.thumbnail}
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute inset-0 flex items-center justify-center">
                        <motion.div
                            className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                        >
                            <Play className="w-8 h-8 text-white ml-1" fill="white" />
                        </motion.div>
                    </div>
                </div>

                {/* Favorite Badge */}
                {isFavorite && (
                    <div className="absolute top-3 right-3">
                        <div className="w-8 h-8 bg-red-500/80 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <Heart className="w-4 h-4 text-white" fill="white" />
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2 group-hover:text-blue-300 transition-colors">
                    {video.title}
                </h3>

                <div className="flex items-center justify-between text-sm text-white/70">
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1">
                            <Eye className="w-4 h-4" />
                            <span>{video.views}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{video.duration}</span>
                        </div>
                    </div>

                    <div className="px-2 py-1 bg-white/10 rounded-full text-xs">
                        {video.category}
                    </div>
                </div>
            </div>
        </motion.div>
    )
}