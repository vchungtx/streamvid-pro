'use client'

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react'
import { NotificationType } from '../types'

interface NotificationContextType {
    showNotification: (message: string, type?: NotificationType['type'], duration?: number) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function useNotification() {
    const context = useContext(NotificationContext)
    if (!context) {
        throw new Error('useNotification must be used within NotificationProvider')
    }
    return context
}

export default function NotificationProvider({ children }: { children: ReactNode }) {
    const [notifications, setNotifications] = useState<NotificationType[]>([])

    const showNotification = useCallback((
        message: string,
        type: NotificationType['type'] = 'info',
        duration = 4000
    ) => {
        const id = Math.random().toString(36).substr(2, 9)
        const notification: NotificationType = { id, message, type, duration }

        setNotifications(prev => [...prev, notification])

        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== id))
        }, duration)
    }, [])

    const removeNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }

    const getIcon = (type: NotificationType['type']) => {
        switch (type) {
            case 'success': return <CheckCircle className="w-5 h-5" />
            case 'error': return <AlertCircle className="w-5 h-5" />
            case 'warning': return <AlertTriangle className="w-5 h-5" />
            default: return <Info className="w-5 h-5" />
        }
    }

    const getStyles = (type: NotificationType['type']) => {
        switch (type) {
            case 'success': return 'border-green-500/50 bg-green-500/20 text-green-100'
            case 'error': return 'border-red-500/50 bg-red-500/20 text-red-100'
            case 'warning': return 'border-yellow-500/50 bg-yellow-500/20 text-yellow-100'
            default: return 'border-blue-500/50 bg-blue-500/20 text-blue-100'
        }
    }

    return (
        <NotificationContext.Provider value={{ showNotification }}>
            {children}

            {/* Notifications Container */}
            <div className="fixed top-4 right-4 z-[9999] max-w-sm w-full space-y-2">
                <AnimatePresence>
                    {notifications.map((notification) => (
                        <motion.div
                            key={notification.id}
                            initial={{ opacity: 0, x: 300, scale: 0.3 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 300, scale: 0.5 }}
                            transition={{ duration: 0.3, type: 'spring' }}
                            className={`glass-enhanced border rounded-xl p-4 shadow-lg ${getStyles(notification.type)}`}
                        >
                            <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0">
                                    {getIcon(notification.type)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium whitespace-pre-line">
                                        {notification.message}
                                    </p>
                                </div>
                                <button
                                    onClick={() => removeNotification(notification.id)}
                                    className="flex-shrink-0 p-1 rounded-full hover:bg-white/10 transition-colors"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    )
}