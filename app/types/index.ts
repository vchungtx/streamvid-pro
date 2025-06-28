export interface Video {
    id: number
    title: string
    category: string
    views: string
    duration: string
    thumbnail: string
    description?: string
}

export interface Category {
    name: string
    icon: string
    subcategories: string[]
    color: string
}

export interface Comment {
    id: number
    author: string
    text: string
    timestamp: Date
    replies?: Comment[]
}

export interface NotificationType {
    id: string
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    duration?: number
}