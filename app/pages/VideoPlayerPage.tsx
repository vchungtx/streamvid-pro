'use client'

import React, { useState, useEffect, useRef } from 'react'
import { motion, useMotionValue, useTransform, PanInfo } from 'framer-motion'
import { ArrowLeft, Play, Pause, SkipBack, SkipForward, Heart, Share2, MessageCircle, Send, Volume2, VolumeX, Maximize, Settings, ChevronUp, ChevronDown } from 'lucide-react'
import { useApp } from '../context/AppContext'
import { useAuth } from '../context/AuthContext'
import { useNotification } from '../components/NotificationProvider'
import { Video } from '../types'
import { sampleVideos } from '../data'

// ✅ Production-safe HLS import
let Hls: any = null
if (typeof window !== 'undefined') {
    try {
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

    // Video state
    const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
    const [currentVideo, setCurrentVideo] = useState<Video | null>(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
    const [likes, setLikes] = useState(127)

    // Player controls
    const [isMuted, setIsMuted] = useState(false)
    const [volume, setVolume] = useState(0.7)
    const [currentTime, setCurrentTime] = useState(0)
    const [duration, setDuration] = useState(0)
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [showControls, setShowControls] = useState(true)

    // Loading and errors
    const [isLoading, setIsLoading] = useState(false)
    const [videoError, setVideoError] = useState<string | null>(null)
    const [hlsLoaded, setHlsLoaded] = useState(false)

    // TikTok-style features
    const [isTikTokMode, setIsTikTokMode] = useState(false)
    const [showVideoList, setShowVideoList] = useState(false)
    const y = useMotionValue(0)
    const opacity = useTransform(y, [-200, 0, 200], [0.8, 1, 0.8])

    // Comments
    const [comment, setComment] = useState('')
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
        if (showControls && isPlaying && !isTikTokMode) {
            const timer = setTimeout(() => setShowControls(false), 3000)
            return () => clearTimeout(timer)
        }
    }, [showControls, isPlaying, isTikTokMode])

    // Initialize video
    useEffect(() => {
        const videoData = sessionStorage.getItem('currentVideo')
        if (videoData) {
            const video = JSON.parse(videoData)
            const index = sampleVideos.findIndex(v => v.id === video.id)
            setCurrentVideoIndex(index >= 0 ? index : 0)
        }
    }, [])

    // Load video when index changes
    useEffect(() => {
        const video = sampleVideos[currentVideoIndex]
        if (video) {
            setCurrentVideo(video)
            setIsLiked(user.favorites.includes(video.id))

            if (!user.viewHistory.includes(video.id)) {
                updateUser({
                    viewHistory: [...user.viewHistory, video.id]
                })
            }

            if (video.videoUrl && videoRef.current) {
                setTimeout(() => loadVideo(video.videoUrl), 1000)
            }
        }
    }, [currentVideoIndex, user.favorites, user.viewHistory, updateUser, hlsLoaded])

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

            if (hlsRef.current) {
                try {
                    hlsRef.current.destroy()
                } catch (e) {
                    console.warn('HLS destroy error:', e)
                }
                hlsRef.current = null
            }

            if (videoUrl.includes('.m3u8')) {
                if (Hls && Hls.isSupported()) {
                    try {
                        const hls = new Hls({
                            enableWorker: false,
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
                            showNotification('🎬 Video loaded!', 'success')
                        })

                        hls.on(Hls.Events.ERROR, (event: any, data: any) => {
                            console.error('HLS Error:', data)
                            if (data.fatal) {
                                video.src = videoUrl
                                setIsLoading(false)
                                showNotification('⚠️ Using fallback player', 'warning')
                            }
                        })
                    } catch (hlsError) {
                        console.error('HLS initialization error:', hlsError)
                        video.src = videoUrl
                        setIsLoading(false)
                    }
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = videoUrl
                    setIsLoading(false)
                } else {
                    video.src = videoUrl
                    setIsLoading(false)
                    showNotification('⚠️ HLS not supported, using direct stream', 'warning')
                }
            } else {
                video.src = videoUrl
                video.load()
                setIsLoading(false)
            }

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

    // ✅ Enhanced play handler
    const handlePlay = async () => {
        if (!videoRef.current) return

        try {
            if (isPlaying) {
                videoRef.current.pause()
            } else {
                const playPromise = videoRef.current.play()
                if (playPromise !== undefined) {
                    await playPromise.catch(error => {
                        console.warn('Autoplay prevented:', error)
                        showNotification('🔇 Click to enable sound and play', 'info')
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
            showNotification('❌ Playback failed. Try again.', 'warning')
        }
    }

    // 🆕 TikTok-style swipe handling
    const handleSwipe = (info: PanInfo) => {
        if (!isTikTokMode) return

        const threshold = 100

        if (info.offset.y < -threshold) {
            // Swipe up - next video
            nextVideo()
            y.set(0)
        } else if (info.offset.y > threshold) {
            // Swipe down - previous video
            prevVideo()
            y.set(0)
        } else {
            y.set(0)
        }
    }

    const nextVideo = () => {
        const nextIndex = (currentVideoIndex + 1) % sampleVideos.length
        setCurrentVideoIndex(nextIndex)
        showNotification('⬆️ Next video', 'info')
    }

    const prevVideo = () => {
        const prevIndex = currentVideoIndex === 0 ? sampleVideos.length - 1 : currentVideoIndex - 1
        setCurrentVideoIndex(prevIndex)
        showNotification('⬇️ Previous video', 'info')
    }

    // 🆕 Toggle TikTok mode
    const toggleTikTokMode = () => {
        setIsTikTokMode(!isTikTokMode)
        if (!isTikTokMode) {
            // Entering TikTok mode
            if (window.innerWidth < 768) {
                document.documentElement.requestFullscreen?.()
            }
            setIsFullscreen(true)
            showNotification('📱 TikTok Mode ON - Swipe up/down to change videos!', 'success')
        } else {
            // Exiting TikTok mode
            if (document.fullscreenElement) {
                document.exitFullscreen?.()
            }
            setIsFullscreen(false)
            showNotification('📺 Normal Mode ON', 'info')
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
            videoRef.current.muted = false
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

        // Exit any fullscreen
        if (document.fullscreenElement) {
            document.exitFullscreen?.()
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
            const textArea = document.createElement('textarea')
            textArea.value = shareLink
            document.body.appendChild(textArea)
            textArea.select()
            try {
                document.execCommand('copy')
                showNotification('🔗 Link copied!', 'success')
            } catch (e) {
                showNotification('❌ Failed to copy', 'error')
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

    // 🆕 TikTok Mode Render
    if (isTikTokMode) {
        return (
            <div className="fixed inset-0 bg-black z-50 overflow-hidden">
                <motion.div
                    className="relative w-full h-full"
                    style={{ y, opacity }}
                    drag="y"
                    dragConstraints={{ top: 0, bottom: 0 }}
                    dragElastic={0.2}
                    onDragEnd={(_, info) => handleSwipe(info)}
                >
                    {/* Video Container */}
                    <div className="relative w-full h-full">
                        {currentVideo.videoUrl && !videoError ? (
                            <video
                                ref={videoRef}
                                className="w-full h-full object-cover bg-black"
                                onTimeUpdate={handleTimeUpdate}
                                onLoadedMetadata={handleLoadedMetadata}
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                onClick={handlePlay}
                                playsInline
                                controls={false}
                                autoPlay
                                muted={isMuted}
                                loop
                            />
                        ) : (
                            <div className="w-full h-full bg-gradient-to-br from-slate-800 via-purple-900 to-slate-800 flex items-center justify-center">
                                <div className="text-center">
                                    <div className="text-9xl mb-4">{currentVideo.thumbnail}</div>
                                    <h2 className="text-3xl font-bold text-white/90">StreamVid Pro</h2>
                                    <p className="text-white/70 mt-2">Swipe up/down to change videos</p>
                                </div>
                            </div>
                        )}

                        {/* Top Controls */}
                        <div className="absolute top-0 left-0 right-0 z-20 p-4 bg-gradient-to-b from-black/50 to-transparent">
                            <div className="flex items-center justify-between">
                                <motion.button
                                    onClick={() => toggleTikTokMode()}
                                    className="p-3 glass rounded-full"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <ArrowLeft className="w-6 h-6" />
                                </motion.button>

                                <div className="text-center">
                                    <h1 className="text-lg font-semibold truncate max-w-xs">
                                        {currentVideo.title}
                                    </h1>
                                    <p className="text-sm text-white/70">
                                        {currentVideoIndex + 1} / {sampleVideos.length}
                                    </p>
                                </div>

                                <motion.button
                                    onClick={() => setShowVideoList(!showVideoList)}
                                    className="p-3 glass rounded-full"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <MessageCircle className="w-6 h-6" />
                                </motion.button>
                            </div>
                        </div>

                        {/* Side Actions (TikTok style) */}
                        <div className="absolute right-4 bottom-20 flex flex-col space-y-4 z-20">
                            <motion.button
                                onClick={toggleLike}
                                className="w-12 h-12 glass rounded-full flex flex-col items-center justify-center"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Heart className={`w-6 h-6 ${isLiked ? 'text-red-500 fill-red-500' : 'text-white'}`} />
                                <span className="text-xs text-white mt-1">{likes}</span>
                            </motion.button>

                            <motion.button
                                onClick={handleShare}
                                className="w-12 h-12 glass rounded-full flex items-center justify-center"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <Share2 className="w-6 h-6 text-white" />
                            </motion.button>

                            <motion.button
                                onClick={toggleMute}
                                className="w-12 h-12 glass rounded-full flex items-center justify-center"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                {isMuted ? <VolumeX className="w-6 h-6 text-white" /> : <Volume2 className="w-6 h-6 text-white" />}
                            </motion.button>
                        </div>

                        {/* Navigation Hints */}
                        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex flex-col space-y-8 z-20">
                            <motion.button
                                onClick={prevVideo}
                                className="flex flex-col items-center space-y-2 text-white/70 hover:text-white"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <ChevronUp className="w-8 h-8" />
                                <span className="text-xs">Previous</span>
                            </motion.button>

                            <motion.button
                                onClick={nextVideo}
                                className="flex flex-col items-center space-y-2 text-white/70 hover:text-white"
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                            >
                                <ChevronDown className="w-8 h-8" />
                                <span className="text-xs">Next</span>
                            </motion.button>
                        </div>

                        {/* Bottom Info */}
                        <div className="absolute bottom-0 left-0 right-0 z-20 p-4 bg-gradient-to-t from-black/80 to-transparent">
                            <h2 className="text-xl font-bold mb-2">{currentVideo.title}</h2>
                            <div className="flex items-center space-x-4 text-white/70 text-sm">
                                <span>👁️ {currentVideo.views}</span>
                                <span>📂 {currentVideo.category}</span>
                            </div>
                        </div>

                        {/* Center Play Button */}
                        {!isPlaying && (
                            <motion.div
                                className="absolute inset-0 flex items-center justify-center z-10"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <motion.button
                                    onClick={handlePlay}
                                    className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                >
                                    <Play className="w-10 h-10 text-white ml-1" fill="white" />
                                </motion.button>
                            </motion.div>
                        )}
                    </div>
                </motion.div>
            </div>
        )
    }

    // 📺 Normal Mode Render
    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            {/* Back Button & Mode Toggle */}
            <div className="flex items-center justify-between mb-6">
                <motion.button
                    onClick={handleBack}
                    className="flex items-center space-x-2 glass-enhanced px-4 py-2 rounded-xl hover:bg-white/20 transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <ArrowLeft className="w-5 h-5" />
                    <span>Back to Browse</span>
                </motion.button>

                <motion.button
                    onClick={toggleTikTokMode}
                    className="btn-primary px-4 py-2 flex items-center space-x-2"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                >
                    <span>📱</span>
                    <span>TikTok Mode</span>
                </motion.button>
            </div>

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
                                    onClick={prevVideo}
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
                                    onClick={nextVideo}
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
                                <button
                                    onClick={toggleTikTokMode}
                                    className="p-2 glass rounded-full hover:bg-white/20"
                                    title="Switch to TikTok Mode"
                                >
                                    <span className="text-lg">📱</span>
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

            {/* Video Playlist */}
            <motion.div className="mb-8 glass-enhanced rounded-2xl p-6">
                <h3 className="text-xl font-bold mb-4 flex items-center space-x-2">
                    <span>🎬</span>
                    <span>Up Next ({sampleVideos.length} videos)</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {sampleVideos.slice(0, 6).map((video, index) => (
                        <motion.button
                            key={video.id}
                            onClick={() => setCurrentVideoIndex(sampleVideos.findIndex(v => v.id === video.id))}
                            className={`text-left p-3 glass rounded-xl hover:bg-white/10 transition-colors ${
                                video.id === currentVideo.id ? 'ring-2 ring-blue-500' : ''
                            }`}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="flex items-center space-x-3">
                                <div className="text-2xl">{video.thumbnail}</div>
                                <div className="flex-1 min-w-0">
                                    <h4 className="font-medium truncate">{video.title}</h4>
                                    <p className="text-sm text-white/70">{video.views} views</p>
                                </div>
                                {video.id === currentVideo.id && (
                                    <div className="text-blue-400">▶️</div>
                                )}
                            </div>
                        </motion.button>
                    ))}
                </div>
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