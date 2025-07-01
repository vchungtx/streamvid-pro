import { Video, Category } from '../types'

export const sampleVideos: Video[] = [
    {
        id: 1,
        title: "🌿 Amazing Nature Documentary",
        category: "Education",
        views: "2.1M",
        duration: "45:30",
        thumbnail: "🦋",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        description: "Explore the wonders of wildlife and natural habitats"
    },
    {
        id: 2,
        title: "🚀 Tech Innovations 2025",
        category: "Technology",
        views: "892K",
        duration: "32:15",
        thumbnail: "🤖",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        description: "Latest breakthrough technologies and innovations"
    },
    {
        id: 3,
        title: "⚽ World Cup Highlights",
        category: "Sports",
        views: "5.2M",
        duration: "28:45",
        thumbnail: "🏆",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        description: "Best moments from the world cup tournament"
    },
    {
        id: 4,
        title: "👨‍🍳 Cooking Masterclass",
        category: "Lifestyle",
        views: "1.4M",
        duration: "52:20",
        thumbnail: "🍳",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/Sintel.mp4",
        description: "Learn professional cooking techniques"
    },
    {
        id: 5,
        title: "🌌 Space Exploration",
        category: "Education",
        views: "3.8M",
        duration: "41:10",
        thumbnail: "🚀",
        videoUrl: "https://demo.unified-streaming.com/k8s/features/stable/video/tears-of-steel/tears-of-steel.ism/.m3u8",
        description: "Journey through the cosmos and space missions"
    },
    {
        id: 6,
        title: "🎮 Gaming Championship",
        category: "Gaming",
        views: "967K",
        duration: "35:55",
        thumbnail: "🏅",
        videoUrl: "https://bitdash-a.akamaihd.net/content/sintel/hls/playlist.m3u8",
        description: "Esports tournament highlights and gameplay"
    },
    {
        id: 7,
        title: "🎵 Music Festival Live",
        category: "Music",
        views: "4.7M",
        duration: "1:25:30",
        thumbnail: "🎤",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        description: "Epic live performances from top artists"
    },
    {
        id: 8,
        title: "🏋️ Fitness Transformation",
        category: "Health",
        views: "1.8M",
        duration: "38:15",
        thumbnail: "💪",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/VolkswagenGTIReview.mp4",
        description: "Complete workout guide for beginners"
    },
    {
        id: 9,
        title: "🎨 Digital Art Tutorial",
        category: "Education",
        views: "750K",
        duration: "47:20",
        thumbnail: "🎨",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4",
        description: "Master digital painting techniques"
    },
    {
        id: 10,
        title: "🌎 Travel Adventure",
        category: "Travel",
        views: "2.9M",
        duration: "29:45",
        thumbnail: "✈️",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/WhatCarCanYouGetForAGrand.mp4",
        description: "Exploring hidden gems around the world"
    },
    {
        id: 11,
        title: "🔬 Science Breakthrough",
        category: "Education",
        views: "1.2M",
        duration: "34:10",
        thumbnail: "🧬",
        videoUrl: "https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8",
        description: "Latest discoveries in quantum physics"
    },
    {
        id: 12,
        title: "🍕 Street Food Tour",
        category: "Lifestyle",
        views: "3.5M",
        duration: "42:30",
        thumbnail: "🌮",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        description: "Taste the best street food worldwide"
    },
    {
        id: 13,
        title: "🎭 Theater Performance",
        category: "Entertainment",
        views: "680K",
        duration: "1:15:45",
        thumbnail: "🎭",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        description: "Broadway's best musical performances"
    },
    {
        id: 14,
        title: "🏠 Home Design Ideas",
        category: "Lifestyle",
        views: "1.9M",
        duration: "36:20",
        thumbnail: "🏡",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        description: "Transform your living space with style"
    },
    {
        id: 15,
        title: "🚗 Car Review 2025",
        category: "Technology",
        views: "2.3M",
        duration: "28:30",
        thumbnail: "🚗",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerMeltdowns.mp4",
        description: "Latest electric vehicle innovations"
    }
]

export const videoCategories: Category[] = [
    {
        name: "Entertainment",
        icon: "🎬",
        subcategories: ["Movies", "TV Shows", "Comedy"],
        color: "from-blue-500 to-purple-600"
    },
    {
        name: "Education",
        icon: "📚",
        subcategories: ["Science", "History", "Languages"],
        color: "from-purple-500 to-pink-500"
    },
    {
        name: "Technology",
        icon: "💻",
        subcategories: ["Programming", "AI", "Gadgets"],
        color: "from-cyan-500 to-blue-500"
    },
    {
        name: "Sports",
        icon: "⚽",
        subcategories: ["Football", "Basketball", "Tennis"],
        color: "from-green-500 to-teal-500"
    },
    {
        name: "Music",
        icon: "🎵",
        subcategories: ["Pop", "Rock", "Classical"],
        color: "from-pink-500 to-rose-500"
    },
    {
        name: "Travel",
        icon: "✈️",
        subcategories: ["Adventure", "Culture", "Food"],
        color: "from-orange-500 to-red-500"
    },
    {
        name: "Health",
        icon: "🏥",
        subcategories: ["Fitness", "Nutrition", "Mental Health"],
        color: "from-emerald-500 to-green-500"
    },
    {
        name: "Gaming",
        icon: "🎮",
        subcategories: ["Action", "Strategy", "RPG"],
        color: "from-violet-500 to-purple-500"
    },
    {
        name: "News",
        icon: "📰",
        subcategories: ["World", "Local", "Business"],
        color: "from-slate-500 to-gray-600"
    },
    {
        name: "Lifestyle",
        icon: "🌟",
        subcategories: ["Fashion", "Beauty", "DIY"],
        color: "from-yellow-500 to-orange-500"
    }
]