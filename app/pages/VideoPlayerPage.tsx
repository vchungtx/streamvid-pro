'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Heart, Share2, MessageCircle, Send, Volume2, VolumeX, Maximize, Settings } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../components/NotificationProvider'
import { Video } from '../types'

interface Comment {
    id: number
    author: string
    text: string
    timestamp: Date
    replies?: Comment[]
}

export default function VideoPlayerPage() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
    const [likes, setLikes] = useState(127)
    const [comment, setComment] = useState('')
    const [isMuted, setIsMuted] = useState(false)
    const [volume, setVolume] = useState(0.7)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)
    const [isLoading, setIsLoading] = useState(false)
    const [videoError, setVideoError] = useState<string | null>(null)
    const [comments, setComments] = useState<Comment[]>([
        {
            id: 1,
            author: 'User ****1234',
            text: 'Amazing content! Really enjoyed watching this. The quality is fantastic! 🔥',
            timestamp: new Date(Date.now() - 3600000) // 1 hour ago
        },
        {
            id: 2,
            author: 'User ****5678',
            text: 'Great video! Thanks for sharing this awesome content. Looking forward to more! ✨',
            timestamp: new Date(Date.now() - 7200000) // 2 hours ago
        },
        {
            id: 3,
            author: 'User ****9012',
            text: 'This is exactly what I was looking for. Perfect explanation and great visuals! 👍',
            timestamp: new Date(Date.now() - 10800000) // 3 hours ago
        }
    ])

    const { setCurrentPage } = useApp()
    const { user, updateUser } = useAuth()
    const { showNotification } = useNotification()

    // Auto-hide controls after 3 seconds
    useEffect(() => {
        if (showControls && isPlaying) {
            const timer = setTimeout(() => {
                setShowControls(false)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [showControls, isPlaying])

    // Initialize video and HLS support
    useEffect(() => {
        const videoData = sessionStorage.getItem('currentVideo')
        if (videoData) {
            const video = JSON.parse(videoData)
            setCurrentVideo(video)
            setIsLiked(user.favorites.includes(video.id))

            // Add to view history
            if (!user.viewHistory.includes(video.id)) {
                updateUser({
                    viewHistory: [...user.viewHistory, video.id]
                })
            }

            // Load video if URL exists
            if (video.videoUrl && videoRef.current) {
                loadVideo(video.videoUrl)
            }
        }
    }, [user.favorites, user.viewHistory, updateUser])

    // HLS/M3U8 Video Loading Function
    const loadVideo = async (videoUrl: string) => {
        if (!videoRef.current) return

        setIsLoading(true)
        setVideoError(null)

        try {
            const video = videoRef.current

            // Check if it's an M3U8 file
            if (videoUrl.includes('.m3u8')) {
                // Try to use HLS.js for M3U8 support
                if (typeof window !== 'undefined') {
                    const { default: Hls } = await import('hls.js')

                    if (Hls.isSupported()) {
                        const hls = new Hls({
                            enableWorker: true,
                            lowLatencyMode: true,
                        })

                        hls.loadSource(videoUrl)
                        hls.attachMedia(video)

                        hls.on(Hls.Events.MANIFEST_PARSED, () => {
                            setIsLoading(false)
                            showNotification('🎬 Video loaded successfully!', 'success')
                        })

                        hls.on(Hls.Events.ERROR, (event, data) => {
                            console.error('HLS Error:', data)
                            setVideoError('Failed to load video stream')
                            setIsLoading(false)
                            showNotification('❌ Failed to load video', 'error')
                        })

                        // Store HLS instance for cleanup
                        ;(video as any).hls = hls
                    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                        // Native HLS support (Safari)
                        video.src = videoUrl
                        setIsLoading(false)
                    } else {
                        setVideoError('HLS not supported in this browser')
                        setIsLoading(false)
                    }
                }
            } else {
                // Regular video file (MP4, WebM, etc.)
                video.src = videoUrl
                setIsLoading(false)
            }
        } catch (error) {
            console.error('Video loading error:', error)
            setVideoError('Failed to load video')
            setIsLoading(false)
            showNotification('❌ Video loading failed', 'error')
        }
    }

    // Video event handlers
    const handlePlay = () => {
        if (!videoRef.current) return

        if (isPlaying) {
            videoRef.current.pause()
        } else {
            const playPromise = videoRef.current.play()
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.error('Play failed:', error)
                    showNotification('❌ Failed to play video', 'error')
                })
            }
        }
        setShowControls(true)
    }

    const handleTimeUpdate = () => {
        if (videoRef.current) {
            setCurrentTime(videoRef.current.currentTime)
        }
    }

    const handleLoadedMetadata = () => {
        if (videoRef.current) {
            setDuration(videoRef.current.duration)
        }
    }

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value)
        if (videoRef.current) {
            videoRef.current.currentTime = newTime
            setCurrentTime(newTime)
        }
        setShowControls(true)
    }

    const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVolume = parseFloat(e.target.value) / 100
        setVolume(newVolume)
        if (videoRef.current) {
            videoRef.current.volume = newVolume
        }
        setIsMuted(newVolume === 0)
        setShowControls(true)
    }

    const toggleMute = () => {
        if (videoRef.current) {
            if (isMuted) {
                videoRef.current.volume = volume
                setIsMuted(false)
                showNotification('🔊 Sound on', 'info')
            } else {
                videoRef.current.volume = 0
                setIsMuted(true)
                showNotification('🔇 Sound off', 'info')
            }
        }
        setShowControls(true)
    }

    const toggleFullscreen = () => {
        if (videoRef.current) {
            if (document.fullscreenElement) {
                document.exitFullscreen()
                setIsFullscreen(false)
                showNotification('📱 Exit fullscreen', 'info')
            } else {
                videoRef.current.requestFullscreen()
                setIsFullscreen(true)
                showNotification('📺 Fullscreen mode', 'info')
            }
        }
        setShowControls(true)
    }

    const handleBack = () => {
        // Cleanup HLS instance if exists
        if (videoRef.current && (videoRef.current as any).hls) {
            (videoRef.current as any).hls.destroy()
        }
        setCurrentPage('discover')
    }

    const toggleLike = () => {
        if (!currentVideo) return

        const newIsLiked = !isLiked
        setIsLiked(newIsLiked)
        setLikes(prev => newIsLiked ? prev + 1 : prev - 1)

        let newFavorites = [...user.favorites]
        if (newIsLiked) {
            newFavorites.push(currentVideo.id)
            showNotification('💖 Added to favorites!', 'success')
        } else {
            newFavorites = newFavorites.filter(id => id !== currentVideo.id)
            showNotification('💔 Removed from favorites', 'info')
        }

        updateUser({ favorites: newFavorites })
    }

    const handleShare = () => {
        const shareLink = `https://streamvid.pro/video/${currentVideo?.id}`

        if (navigator.share) {
            navigator.share({
                title: currentVideo?.title,
                url: shareLink
            }).catch(() => {
                navigator.clipboard.writeText(shareLink).then(() => {
                    showNotification('🔗 Video link copied to clipboard!', 'success')
                })
            })
        } else {
            navigator.clipboard.writeText(shareLink).then(() => {
                showNotification('🔗 Video link copied to clipboard!', 'success')
            })
        }
    }

    const handleAddComment = () => {
        if (!comment.trim()) {
            showNotification('Please enter a comment', 'warning')
            return
        }

        const newComment: Comment = {
            id: Date.now(),
            author: `User ****${user.phone?.slice(-4) || '0000'}`,
            text: comment,
            timestamp: new Date()
        }

        setComments(prev => [newComment, ...prev])
        setComment('')
        showNotification('💬 Comment posted!', 'success')
    }

    const handlePreviousVideo = () => {
        showNotification('⏮️ Previous video', 'info')
    }

    const handleNextVideo = () => {
        showNotification('⏭️ Next video', 'info')
    }

    const formatTime = (seconds: number) => {
        if (isNaN(seconds)) return '0:00'
        const mins = Math.floor(seconds / 60)
        const secs = Math.floor(seconds % 60)
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    const getRelativeTime = (timestamp: Date) => {
        const now = new Date()
        const diff = now.getTime() - timestamp.getTime()
        const hours = Math.floor(diff / (1000 * 60 * 60))
        const minutes = Math.floor(diff / (1000 * 60))

        if (hours > 0) return `${hours}h ago`
        if (minutes > 0) return `${minutes}m ago`
        return 'Just now'
    }

    if (!currentVideo) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="text-center glass-enhanced rounded-3xl p-12">
                    <div className="text-6xl mb-4">🎬</div>
                    <h2 className="text-2xl font-bold mb-4">No video selected</h2>
                    <p className="text-white/70 mb-6">Choose a video to start watching</p>
                    <motion.button
                        onClick={handleBack}
                        className="btn-primary"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Browse Videos
                    </motion.button>
                </div>
            </div>
        )
    }

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Back Button */}
            <motion.button
                onClick={handleBack}
                className="flex items-center space-x-2 mb-6 glass-enhanced px-4 py-2 rounded-xl hover:bg-white/20 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Browse</span>
            </motion.button>

            {/* Video Player */}
            <motion.div
                className={`glass-enhanced rounded-3xl overflow-hidden mb-8 ${isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                onMouseEnter={() => setShowControls(true)}
                onMouseLeave={() => setTimeout(() => setShowControls(false), 1000)}
            >
                {/* Video Element or Fallback */}
                <div className={`relative ${isFullscreen ? 'h-screen' : 'h-96 md:h-[500px]'}`}>
                    {currentVideo.videoUrl && !videoError ? (
                        <video
                            ref={videoRef}
                            className="w-full h-full object-contain bg-black cursor-pointer"
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onError={(e) => {
                                console.error('Video error:', e)
                                setVideoError('Failed to load video')
                                showNotification('❌ Video playback error', 'error')
                            }}
                            onClick={handlePlay}
                            playsInline
                            controls={false}
                        />
                    ) : (
                        // Fallback display for no video URL or error
                        <div
                            className="w-full h-full bg-gradient-to-br from-slate-800 via-purple-900 to-slate-800 flex items-center justify-center cursor-pointer"
                            onClick={handlePlay}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20" />
                            <div className="relative z-10 text-center">
                                <div className={`mb-4 ${isFullscreen ? 'text-9xl' : 'text-8xl'}`}>
                                    {currentVideo.thumbnail}
                                </div>
                                <h2 className={`font-bold text-white/90 ${isFullscreen ? 'text-4xl' : 'text-2xl'}`}>
                                    {videoError ? 'Video Unavailable' : 'Premium Video Player'}
                                </h2>
                                <p className="text-white/70 mt-2">
                                    {videoError ? '❌ ' + videoError : (isPlaying ? '🎬 Playing...' : '⏸️ Paused')}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Loading Overlay */}
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                            <div className="text-center">
                                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                                <p className="text-white">Loading video...</p>
                            </div>
                        </div>
                    )}

                    {/* Play/Pause Overlay */}
                    {!isPlaying && !isLoading && (
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                            onClick={handlePlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <Play className="w-10 h-10 text-white ml-1" fill="white" />
                            </div>
                        </motion.div>
                    )}

                    {/* Video Controls Overlay */}
                    <motion.div
                        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300 ${
                            showControls ? 'opacity-100' : 'opacity-0'
                        }`}
                        initial={{ y: 100 }}
                        animate={{ y: showControls ? 0 : 100 }}
                    >
                        {/* Progress Bar */}
                        <div className="mb-4">
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime}
                                onChange={handleProgressChange}
                                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                                style={{
                                    background: `linear-gradient(to right, #667eea 0%, #667eea ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) ${duration ? (currentTime / duration) * 100 : 0}%, rgba(255,255,255,0.2) 100%)`
                                }}
                            />
                            <div className="flex justify-between text-sm text-white/70 mt-1">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Main Controls */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <motion.button
                                    onClick={handlePreviousVideo}
                                    className="p-2 glass rounded-full hover:bg-white/20 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <SkipBack className="w-5 h-5" />
                                </motion.button>

                                <motion.button
                                    onClick={handlePlay}
                                    className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full hover:from-purple-600 hover:to-pink-500 transition-all"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                </motion.button>

                                <motion.button
                                    onClick={handleNextVideo}
                                    className="p-2 glass rounded-full hover:bg-white/20 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <SkipForward className="w-5 h-5" />
                                </motion.button>

                                {/* Volume Control */}
                                <div className="flex items-center space-x-2">
                                    <motion.button
                                        onClick={toggleMute}
                                        className="p-2 glass rounded-full hover:bg-white/20 transition-colors"
                                        whileHover={{ scale: 1.1 }}
                                        whileTap={{ scale: 0.9 }}
                                    >
                                        {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                    </motion.button>
                                    <input
                                        type="range"
                                        min="0"
                                        max="100"
                                        value={isMuted ? 0 : volume * 100}
                                        onChange={handleVolumeChange}
                                        className="w-20 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <motion.button
                                    className="p-2 glass rounded-full hover:bg-white/20 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Settings className="w-5 h-5" />
                                </motion.button>

                                <motion.button
                                    onClick={toggleFullscreen}
                                    className="p-2 glass rounded-full hover:bg-white/20 transition-colors"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Maximize className="w-5 h-5" />
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Video Info & Actions */}
            <motion.div
                className="mb-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
            >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">{currentVideo.title}</h1>
                        <div className="flex items-center space-x-6 text-white/70">
                            <span>👁️ {currentVideo.views} views</span>
                            <span>⏱️ {formatTime(duration) || currentVideo.duration}</span>
                            <span>📂 {currentVideo.category}</span>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center space-x-3 mt-4 md:mt-0">
                        <motion.button
                            onClick={toggleLike}
                            className="flex items-center space-x-2 px-4 py-2 glass rounded-full hover:bg-white/20 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
                            <span className="text-sm font-medium">{likes}</span>
                        </motion.button>

                        <motion.button
                            onClick={handleShare}
                            className="flex items-center space-x-2 px-4 py-2 glass rounded-full hover:bg-white/20 transition-colors"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <Share2 className="w-5 h-5" />
                            <span className="text-sm font-medium">Share</span>
                        </motion.button>
                    </div>
                </div>

                {currentVideo.description && (
                    <div className="glass-enhanced rounded-2xl p-6">
                        <p className="text-white/80 leading-relaxed">
                            {currentVideo.description}
                        </p>
                    </div>
                )}
            </motion.div>

            {/* Comments Section */}
            <motion.div
                className="glass-enhanced rounded-2xl p-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
            >
                <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Comments ({comments.length})</span>
                </h3>

                {/* Add Comment */}
                <div className="flex space-x-3 mb-6">
                    <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-sm">👤</span>
                    </div>
                    <div className="flex-1 flex space-x-3">
                        <input
                            type="text"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Share your thoughts..."
                            className="flex-1 p-3 glass rounded-xl text-white placeholder-white/50 border border-white/20 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all"
                            onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                        />
                        <motion.button
                            onClick={handleAddComment}
                            className="btn-primary px-6 py-3 flex items-center space-x-2"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <Send className="w-4 h-4" />
                            <span>Post</span>
                        </motion.button>
                    </div>
                </div>

                {/* Comments List */}
                <div className="space-y-6">
                    {comments.map((commentItem, index) => (
                        <motion.div
                            key={commentItem.id}
                            className="flex space-x-3"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.1 * index }}
                        >
                            <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm">👤</span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center space-x-2 mb-1">
                                    <span className="font-semibold text-blue-400">{commentItem.author}</span>
                                    <span className="text-xs text-white/50">
                                        {getRelativeTime(commentItem.timestamp)}
                                    </span>
                                </div>
                                <p className="text-white/80 leading-relaxed">{commentItem.text}</p>

                                {/* Comment Actions */}
                                <div className="flex items-center space-x-4 mt-2">
                                    <button className="text-sm text-white/50 hover:text-white/80 transition-colors">
                                        👍 Like
                                    </button>
                                    <button className="text-sm text-white/50 hover:text-white/80 transition-colors">
                                        💬 Reply
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Load More Comments */}
                {comments.length > 0 && (
                    <motion.button
                        className="w-full mt-6 py-3 glass rounded-xl hover:bg-white/10 transition-colors text-white/70"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => showNotification('📝 Loading more comments...', 'info')}
                    >
                        Load more comments
                    </motion.button>
                )}
            </motion.div>
        </div>
    )
}