'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Heart, Share2, MessageCircle, Send, Volume2, VolumeX, Maximize, Settings } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../components/NotificationProvider'
import { Video } from '../types'

// ✅ Production-safe HLS import
let Hls: any = null
if (typeof window !== 'undefined') {
    try {
        // Try static import first
        import('hls.js').then(module => {
            Hls = module.default
        }).catch(() => {
            console.warn('HLS.js not available')
        })
    } catch (error) {
        console.warn('HLS.js import failed:', error)
    }
}

interface Comment {
    id: number
    author: string
    text: string
    timestamp: Date
    replies?: Comment[]
}

export default function VideoPlayerPage() {
    const videoRef = useRef<HTMLVideoElement>(null)
    const hlsRef = useRef<any>(null)
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
    const [hlsLoaded, setHlsLoaded] = useState(false)
    const [comments, setComments] = useState<Comment[]>([
        {
            id: 1,
            author: 'User ****1234',
            text: 'Amazing content! Really enjoyed watching this. The quality is fantastic! 🔥',
            timestamp: new Date(Date.now() - 3600000)
        },
        {
            id: 2,
            author: 'User ****5678',
            text: 'Great video! Thanks for sharing this awesome content. Looking forward to more! ✨',
            timestamp: new Date(Date.now() - 7200000)
        },
        {
            id: 3,
            author: 'User ****9012',
            text: 'This is exactly what I was looking for. Perfect explanation and great visuals! 👍',
            timestamp: new Date(Date.now() - 10800000)
        }
    ])

    const { setCurrentPage } = useApp()
    const { user, updateUser } = useAuth()
    const { showNotification } = useNotification()

    // ✅ Load HLS.js dynamically for production
    useEffect(() => {
        const loadHls = async () => {
            if (typeof window === 'undefined') return

            try {
                if (!Hls) {
                    const hlsModule = await import('hls.js')
                    Hls = hlsModule.default
                }
                setHlsLoaded(true)
            } catch (error) {
                console.warn('Failed to load HLS.js:', error)
                setHlsLoaded(false)
            }
        }

        loadHls()
    }, [])

    // Auto-hide controls
    useEffect(() => {
        if (showControls && isPlaying) {
            const timer = setTimeout(() => {
                setShowControls(false)
            }, 3000)
            return () => clearTimeout(timer)
        }
    }, [showControls, isPlaying])

    // Initialize video
    useEffect(() => {
        const videoData = sessionStorage.getItem('currentVideo')
        if (videoData) {
            const video = JSON.parse(videoData)
            setCurrentVideo(video)
            setIsLiked(user.favorites.includes(video.id))

            if (!user.viewHistory.includes(video.id)) {
                updateUser({
                    viewHistory: [...user.viewHistory, video.id]
                })
            }

            // Load video after HLS is ready
            if (video.videoUrl && videoRef.current) {
                // Delay loading to ensure HLS is available
                setTimeout(() => loadVideo(video.videoUrl), 1000)
            }
        }
    }, [user.favorites, user.viewHistory, updateUser, hlsLoaded])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (hlsRef.current) {
                try {
                    hlsRef.current.destroy()
                } catch (e) {
                    console.warn('HLS cleanup error:', e)
                }
                hlsRef.current = null
            }
        }
    }, [])

    // ✅ Production-safe video loading
    const loadVideo = async (videoUrl: string) => {
        if (!videoRef.current) return

        setIsLoading(true)
        setVideoError(null)

        try {
            const video = videoRef.current

            // Clean up previous HLS
            if (hlsRef.current) {
                try {
                    hlsRef.current.destroy()
                } catch (e) {
                    console.warn('HLS destroy error:', e)
                }
                hlsRef.current = null
            }

            // Check if M3U8
            if (videoUrl.includes('.m3u8')) {
                // ✅ Production-safe HLS handling
                if (Hls && Hls.isSupported()) {
                    try {
                        const hls = new Hls({
                            enableWorker: false, // ✅ Disable worker for production
                            lowLatencyMode: false,
                            backBufferLength: 30,
                            xhrSetup: (xhr: XMLHttpRequest) => {
                                xhr.withCredentials = false
                            }
                        })

                        hlsRef.current = hls
                        hls.loadSource(videoUrl)
                        hls.attachMedia(video)

                        hls.on(Hls.Events.MANIFEST_PARSED, () => {
                            setIsLoading(false)
                            showNotification('🎬 Video loaded successfully!', 'success')
                        })

                        hls.on(Hls.Events.ERROR, (event: any, data: any) => {
                            console.error('HLS Error:', data)
                            if (data.fatal) {
                                // ✅ Fallback to direct video URL
                                video.src = videoUrl
                                setIsLoading(false)
                                showNotification('⚠️ Using fallback player', 'warning')
                            }
                        })
                    } catch (hlsError) {
                        console.error('HLS initialization error:', hlsError)
                        // ✅ Fallback to native video
                        video.src = videoUrl
                        setIsLoading(false)
                    }
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    // Native HLS support (Safari)
                    video.src = videoUrl
                    setIsLoading(false)
                } else {
                    // ✅ Try direct URL as fallback
                    video.src = videoUrl
                    setIsLoading(false)
                    showNotification('⚠️ HLS not supported, using direct stream', 'warning')
                }
            } else {
                // Regular video file
                video.src = videoUrl
                video.load()
                setIsLoading(false)
            }

            // ✅ Add error handler
            video.onerror = () => {
                setVideoError('Failed to load video')
                setIsLoading(false)
                showNotification('❌ Video loading failed', 'error')
            }

        } catch (error) {
            console.error('Video loading error:', error)
            setVideoError('Failed to load video')
            setIsLoading(false)
            showNotification('❌ Video loading failed', 'error')
        }
    }

    // ✅ Enhanced play handler for production
    const handlePlay = async () => {
        if (!videoRef.current) return

        try {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                // ✅ Handle production autoplay restrictions
                const playPromise = videoRef.current.play()
                if (playPromise !== undefined) {
                    await playPromise.catch(error => {
                        console.warn('Autoplay prevented:', error)
                        showNotification('🔇 Click to enable sound and play', 'info')
                        // Try muted autoplay
                        if (videoRef.current) {
                            videoRef.current.muted = true
                            return videoRef.current.play()
                        }
                    })
                }
            }
            setShowControls(true)
        } catch (error) {
            console.error('Play failed:', error)
            showNotification('❌ Playback failed. Try clicking play again.', 'warning')
        }
    }

    const handleTimeUpdate = () => {
        if (videoRef.current && !isNaN(videoRef.current.currentTime)) {
            setCurrentTime(videoRef.current.currentTime)
        }
    }

    const handleLoadedMetadata = () => {
        if (videoRef.current && !isNaN(videoRef.current.duration)) {
            setDuration(videoRef.current.duration)
        }
    }

    const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newTime = parseFloat(e.target.value)
        if (videoRef.current && !isNaN(newTime)) {
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
            videoRef.current.muted = false // Unmute when changing volume
        }
        setIsMuted(newVolume === 0)
        setShowControls(true)
    }

    const toggleMute = () => {
        if (videoRef.current) {
            if (isMuted) {
                videoRef.current.volume = volume
                videoRef.current.muted = false
                setIsMuted(false)
                showNotification('🔊 Sound on', 'info')
            } else {
                videoRef.current.volume = 0
                videoRef.current.muted = true
                setIsMuted(true)
                showNotification('🔇 Sound off', 'info')
            }
        }
        setShowControls(true)
    }

    const toggleFullscreen = async () => {
        if (!videoRef.current) return

        try {
            if (document.fullscreenElement) {
                await document.exitFullscreen()
                setIsFullscreen(false)
                showNotification('📱 Exit fullscreen', 'info')
            } else {
                await videoRef.current.requestFullscreen()
                setIsFullscreen(true)
                showNotification('📺 Fullscreen mode', 'info')
            }
        } catch (error) {
            console.warn('Fullscreen error:', error)
            showNotification('❌ Fullscreen not available', 'warning')
        }
        setShowControls(true)
    }

    const handleBack = () => {
        if (hlsRef.current) {
            try {
                hlsRef.current.destroy()
            } catch (e) {
                console.warn('HLS cleanup error:', e)
            }
            hlsRef.current = null
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

    const handleShare = async () => {
        const shareLink = `${window.location.origin}/video/${currentVideo?.id}`

        try {
            if (navigator.share) {
                await navigator.share({
                    title: currentVideo?.title,
                    url: shareLink
                })
            } else {
                await navigator.clipboard.writeText(shareLink)
                showNotification('🔗 Video link copied!', 'success')
            }
        } catch (error) {
            console.warn('Share failed:', error)
            // Manual fallback
            const textArea = document.createElement('textarea')
            textArea.value = shareLink
            document.body.appendChild(textArea)
            textArea.select()
            try {
                document.execCommand('copy')
                showNotification('🔗 Link copied to clipboard!', 'success')
            } catch (e) {
                showNotification('❌ Failed to copy link', 'error')
            }
            document.body.removeChild(textArea)
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

    const formatTime = (seconds: number) => {
        if (isNaN(seconds) || !isFinite(seconds)) return '0:00'
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
                <div className={`relative ${isFullscreen ? 'h-screen' : 'h-96 md:h-[500px]'}`}>
                    {currentVideo.videoUrl && !videoError ? (
                        <video
                            ref={videoRef}
                            className="w-full h-full object-contain bg-black cursor-pointer"
                            onTimeUpdate={handleTimeUpdate}
                            onLoadedMetadata={handleLoadedMetadata}
                            onPlay={() => setIsPlaying(true)}
                            onPause={() => setIsPlaying(false)}
                            onError={() => {
                                setVideoError('Failed to load video')
                                showNotification('❌ Video error', 'error')
                            }}
                            onClick={handlePlay}
                            playsInline
                            controls={false}
                            preload="metadata"
                            crossOrigin="anonymous"
                        />
                    ) : (
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
                                    {videoError ? '❌ ' + videoError : 'Click to play'}
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

                    {/* Play Overlay */}
                    {!isPlaying && !isLoading && (
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                            onClick={handlePlay}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                        >
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                <Play className="w-10 h-10 text-white ml-1" fill="white" />
                            </div>
                        </motion.div>
                    )}

                    {/* Controls */}
                    <motion.div
                        className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 transition-opacity duration-300 ${
                            showControls ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                        {/* Progress Bar */}
                        <div className="mb-4">
                            <input
                                type="range"
                                min="0"
                                max={duration || 100}
                                value={currentTime || 0}
                                onChange={handleProgressChange}
                                className="w-full h-2 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
                            />
                            <div className="flex justify-between text-sm text-white/70 mt-1">
                                <span>{formatTime(currentTime)}</span>
                                <span>{formatTime(duration)}</span>
                            </div>
                        </div>

                        {/* Main Controls */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <button
                                    onClick={() => showNotification('⏮️ Previous video', 'info')}
                                    className="p-2 glass rounded-full hover:bg-white/20"
                                >
                                    <SkipBack className="w-5 h-5" />
                                </button>

                                <button
                                    onClick={handlePlay}
                                    className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full hover:from-purple-600 hover:to-pink-500"
                                >
                                    {isPlaying ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6" />}
                                </button>

                                <button
                                    onClick={() => showNotification('⏭️ Next video', 'info')}
                                    className="p-2 glass rounded-full hover:bg-white/20"
                                >
                                    <SkipForward className="w-5 h-5" />
                                </button>

                                <div className="flex items-center space-x-2">
                                    <button onClick={toggleMute} className="p-2 glass rounded-full hover:bg-white/20">
                                        {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                                    </button>
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
                                <button className="p-2 glass rounded-full hover:bg-white/20">
                                    <Settings className="w-5 h-5" />
                                </button>
                                <button onClick={toggleFullscreen} className="p-2 glass rounded-full hover:bg-white/20">
                                    <Maximize className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </motion.div>

            {/* Video Info */}
            <motion.div className="mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-4">
                    <div className="flex-1">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">{currentVideo.title}</h1>
                        <div className="flex items-center space-x-6 text-white/70">
                            <span>👁️ {currentVideo.views} views</span>
                            <span>⏱️ {formatTime(duration) || currentVideo.duration}</span>
                            <span>📂 {currentVideo.category}</span>
                        </div>
                    </div>

                    <div className="flex items-center space-x-3 mt-4 md:mt-0">
                        <button
                            onClick={toggleLike}
                            className="flex items-center space-x-2 px-4 py-2 glass rounded-full hover:bg-white/20"
                        >
                            <Heart className={`w-5 h-5 ${isLiked ? 'text-red-500 fill-red-500' : ''}`} />
                            <span className="text-sm font-medium">{likes}</span>
                        </button>

                        <button
                            onClick={handleShare}
                            className="flex items-center space-x-2 px-4 py-2 glass rounded-full hover:bg-white/20"
                        >
                            <Share2 className="w-5 h-5" />
                            <span className="text-sm font-medium">Share</span>
                        </button>
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
            <motion.div className="glass-enhanced rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-6 flex items-center space-x-2">
                    <MessageCircle className="w-5 h-5" />
                    <span>Comments ({comments.length})</span>
                </h3>

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
                        <button
                            onClick={handleAddComment}
                            className="btn-primary px-6 py-3 flex items-center space-x-2"
                        >
                            <Send className="w-4 h-4" />
                            <span>Post</span>
                        </button>
                    </div>
                </div>

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
            </motion.div>
        </div>
    )
}